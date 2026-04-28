/**
 * agent.ts — Basic Shielded Agent Wallet
 *
 * Demonstrates how an autonomous AI agent interacts with ShieldedAgentWallet
 * on Midnight preprod using midnight-js.
 *
 * Run:
 *   AGENT_SEED=<64-char hex> npx ts-node agent.ts
 */

import * as path   from 'node:path';
import { Buffer }  from 'buffer';
import { WebSocket } from 'ws';
import * as Rx     from 'rxjs';

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

// Polyfill WebSocket for Node.js
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

// ─── Key derivation ───────────────────────────────────────────────────────────

function deriveAgentKeys(seed: string) {
  const hd = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hd.type !== 'seedOk') throw new Error('Invalid AGENT_SEED');

  const result = hd.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hd.hdWallet.clear();
  return result.keys;
}

// ─── Wallet builder ───────────────────────────────────────────────────────────

async function buildAgentWallet(seed: string) {
  const keys        = deriveAgentKeys(seed);
  const networkId   = getNetworkId();
  const shieldedSKs = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSK      = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const keystore    = createKeystore(keys[Roles.NightExternal], networkId);

  const base = {
    networkId,
    indexerClientConnection: { indexerHttpUrl: CONFIG.indexer, indexerWsUrl: CONFIG.indexerWS },
    provingServerUrl: new URL(CONFIG.proofServer),
    relayURL:         new URL(CONFIG.node.replace(/^http/, 'ws')),
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

// ─── Main agent logic ─────────────────────────────────────────────────────────

async function main() {
  const seed = process.env.AGENT_SEED;
  if (!seed) throw new Error('Set AGENT_SEED env var (64-char hex)');

  console.log('\n🤖 Starting shielded AI agent...');

  const ctx = await buildAgentWallet(seed);
  const address = ctx.keystore.getBech32Address();
  console.log(`   Agent address: ${address}`);

  console.log('   Syncing with Midnight preprod...');
  await Rx.firstValueFrom(
    ctx.wallet.state().pipe(Rx.filter((s: any) => s.isSynced))
  );
  console.log('   ✅ Synced');

  if (!CONTRACT_ADDRESS) {
    console.log('\n   No CONTRACT_ADDRESS set — skipping contract interaction.');
    console.log('   Deploy contract.compact first, then set CONTRACT_ADDRESS.');
    return;
  }

  // Load compiled contract
  const zkConfigPath = path.resolve(__dirname, 'managed', 'shielded-agent-wallet');
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

  const ContractModule = await import(contractPath);
  const compiled = CompiledContract
    .make('shielded-agent-wallet', ContractModule.Contract)
    .pipe(CompiledContract.withCompiledFileAssets(zkConfigPath));

  const providers = {
    publicDataProvider:   indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
    proofProvider:        httpClientProofProvider(CONFIG.proofServer, new NodeZkConfigProvider(zkConfigPath)),
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'agent-wallet-state',
      walletProvider:        ctx.wallet as any,
    }),
    walletProvider:   ctx.wallet as any,
    midnightProvider: ctx.wallet as any,
  };

  const contract = await findDeployedContract(providers, {
    contractAddress:     CONTRACT_ADDRESS,
    compiledContract:    compiled,
    privateStateId:      'agentState',
    initialPrivateState: {},
  });

  // Example: create a private escrow
  const escrowId = Buffer.from('task-001');
  const counterparty = address; // in real use: another agent's address
  const amount = 1_000n;
  const commitment = Buffer.from('demo-commitment');

  console.log('\n📝 Creating private escrow...');
  const r = await contract.callTx.create_escrow(escrowId, counterparty, amount, commitment);
  console.log(`   ✅ Escrow created — tx: ${r.public.txId}`);

  const status = await contract.callTx.get_escrow_status(escrowId);
  console.log(`   Escrow status: ${status}`);
}

main().catch(console.error);
