/**
 * agent.ts — Private Credentials Agent
 *
 * Demonstrates:
 *   1. Issuing a credential to an agent address (issuer role)
 *   2. Agent proving it holds a credential type (ZK — type proven, not leaked)
 *   3. Agent proving its reputation is above a threshold (ZK — score stays private)
 *   4. Selective disclosure: revealing credential type for compliance
 *
 * Run:
 *   ISSUER_SEED=<64-char hex> AGENT_SEED=<64-char hex> npx tsx examples/private-credentials/agent.ts
 *
 * Or, if deploying fresh:
 *   npx compact compile examples/private-credentials/contract.compact examples/private-credentials/managed/private-credentials
 *   CONTRACT_ADDRESS=<deployed> ISSUER_SEED=<hex> AGENT_SEED=<hex> npx tsx examples/private-credentials/agent.ts
 */

import * as path  from 'node:path';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider }  from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider }    from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider }  from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider }       from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { findDeployedContract }       from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract }           from '@midnight-ntwrk/compact-js';
import { WalletFacade }               from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet }                 from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles }            from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet }             from '@midnight-ntwrk/wallet-sdk-shielded';
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as ledger from '@midnight-ntwrk/ledger-v7';

globalThis.WebSocket = WebSocket as any;

// ─── Config ───────────────────────────────────────────────────────────────────

setNetworkId('preprod');

const CONFIG = {
  indexer:     'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS:   'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  proofServer: process.env.PROOF_SERVER_URI ?? 'http://127.0.0.1:6300',
  node:        'https://rpc.preprod.midnight.network',
};

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ?? '';
const ZK_CONFIG_PATH   = path.resolve(import.meta.dirname, 'managed', 'private-credentials');

// ─── Wallet helpers ───────────────────────────────────────────────────────────

function deriveKeys(seed: string) {
  const hd = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hd.type !== 'seedOk') throw new Error('Invalid seed');

  const result = hd.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hd.hdWallet.clear();
  return result.keys;
}

async function buildWallet(seed: string) {
  const keys        = deriveKeys(seed);
  const networkId   = getNetworkId();
  const shieldedSKs = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSK      = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const keystore    = createKeystore(keys[Roles.NightExternal], networkId);

  const base = {
    networkId,
    indexerClientConnection: { indexerHttpUrl: CONFIG.indexer, indexerWsUrl: CONFIG.indexerWS },
    provingServerUrl: new URL(CONFIG.proofServer),
    relayURL: new URL(CONFIG.node.replace(/^http/, 'ws')),
  };

  const shielded   = ShieldedWallet(base).startWithSecretKeys(shieldedSKs);
  const unshielded = UnshieldedWallet({
    networkId,
    indexerClientConnection: base.indexerClientConnection,
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  }).startWithPublicKey(PublicKey.fromKeyStore(keystore));
  const dust = DustWallet({
    ...base,
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
  }).startWithSecretKey(dustSK, ledger.LedgerParameters.initialParameters().dust);

  const wallet = new WalletFacade(shielded, unshielded, dust);
  await wallet.start(shieldedSKs, dustSK);

  return { wallet, shieldedSKs, dustSK, keystore };
}

async function syncWallet(wallet: WalletFacade) {
  await Rx.firstValueFrom(
    wallet.state().pipe(Rx.filter((s: any) => s.isSynced))
  );
}

async function connectContract(wallet: WalletFacade, stateId: string) {
  const ContractModule = await import(path.join(ZK_CONFIG_PATH, 'contract', 'index.js'));
  const compiled = CompiledContract
    .make('private-credentials', ContractModule.Contract)
    .pipe(CompiledContract.withCompiledFileAssets(ZK_CONFIG_PATH));

  const providers = {
    publicDataProvider:   indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
    proofProvider:        httpClientProofProvider(CONFIG.proofServer, new NodeZkConfigProvider(ZK_CONFIG_PATH)),
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: stateId,
      walletProvider: wallet as any,
    }),
    walletProvider:   wallet as any,
    midnightProvider: wallet as any,
  };

  return findDeployedContract(providers, {
    contractAddress:     CONTRACT_ADDRESS,
    compiledContract:    compiled,
    privateStateId:      stateId,
    initialPrivateState: {},
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const issuerSeed = process.env.ISSUER_SEED;
  const agentSeed  = process.env.AGENT_SEED;
  if (!issuerSeed) throw new Error('Set ISSUER_SEED env var (64-char hex)');
  if (!agentSeed)  throw new Error('Set AGENT_SEED env var (64-char hex)');

  if (!CONTRACT_ADDRESS) {
    console.log('\nNo CONTRACT_ADDRESS — compile and deploy contract.compact first.');
    console.log('  npx compact compile examples/private-credentials/contract.compact examples/private-credentials/managed/private-credentials');
    return;
  }

  console.log('\n🔐 Private Credentials Demo\n');

  // Build both wallets
  console.log('Building wallets...');
  const [issuerCtx, agentCtx] = await Promise.all([
    buildWallet(issuerSeed),
    buildWallet(agentSeed),
  ]);

  const issuerAddress = issuerCtx.keystore.getBech32Address();
  const agentAddress  = agentCtx.keystore.getBech32Address();
  console.log(`  Issuer: ${issuerAddress}`);
  console.log(`  Agent:  ${agentAddress}`);

  console.log('Syncing with Midnight preprod...');
  await Promise.all([syncWallet(issuerCtx.wallet), syncWallet(agentCtx.wallet)]);
  console.log('  ✅ Both wallets synced\n');

  // Connect contracts (separate private state per wallet)
  const issuerContract = await connectContract(issuerCtx.wallet, 'issuer-state');
  const agentContract  = await connectContract(agentCtx.wallet, 'agent-state');

  // ── Step 1: Issuer grants credential ─────────────────────────────────────

  const credentialType = Buffer.from('task-completer');
  const score          = 75;
  const issuerCommitment = Buffer.from('issuer-commitment-bytes-here');

  console.log('📋 Step 1: Issuer granting credential...');
  const issueResult = await issuerContract.callTx.issue_credential(
    agentAddress,
    credentialType,
    score,
    issuerCommitment
  );
  console.log(`  ✅ Credential issued — tx: ${issueResult.public.txId}`);
  console.log(`     Type: "task-completer", Score: ${score} (private)\n`);

  // ── Step 2: Agent proves credential type ─────────────────────────────────

  console.log('🔍 Step 2: Agent proving credential type via ZK...');
  const hasCredential = await agentContract.callTx.prove_has_credential(credentialType);
  console.log(`  ✅ Proof result: ${hasCredential} (credential type proven without revealing score)\n`);

  // ── Step 3: Agent proves reputation above threshold ───────────────────────

  const threshold = 50;
  console.log(`📊 Step 3: Agent proving reputation > ${threshold} (score stays private)...`);
  const meetsThreshold = await agentContract.callTx.prove_reputation_above(threshold);
  console.log(`  ✅ Proof result: ${meetsThreshold} (score ≥ ${threshold} confirmed, exact value hidden)\n`);

  // ── Step 4: Selective disclosure (compliance example) ────────────────────

  console.log('📂 Step 4: Selective disclosure of credential type...');
  const revealedType = await issuerContract.callTx.disclose_credential_type(agentAddress);
  console.log(`  ✅ Disclosed type: "${Buffer.from(revealedType).toString()}" (score still hidden)\n`);

  // ── Step 5: Issuer updates score after task completion ────────────────────

  const newScore = 85;
  console.log(`🔄 Step 5: Issuer updating score to ${newScore} after task completion...`);
  await issuerContract.callTx.update_score(agentAddress, newScore, issuerCommitment);
  console.log(`  ✅ Score updated privately\n`);

  // Verify new threshold passes
  const highThreshold = 80;
  console.log(`📊 Verifying new score > ${highThreshold}...`);
  const passesHigh = await agentContract.callTx.prove_reputation_above(highThreshold);
  console.log(`  ✅ Proof result: ${passesHigh} (agent now qualifies for high-value tasks)\n`);

  console.log('Done. Privacy preserved throughout: exact score never revealed on-chain.');
}

main().catch(console.error);
