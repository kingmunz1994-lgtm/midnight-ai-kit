/**
 * agent.ts — Confidential Escrow Agent
 *
 * Demonstrates the full escrow lifecycle between two agents:
 *   create → fund → submit_completion → release
 * And the dispute path:
 *   create → fund → submit_completion → dispute → resolve_dispute
 *
 * Run:
 *   CREATOR_SEED=<hex> COUNTERPARTY_SEED=<hex> ARBITER_SEED=<hex> \
 *   CONTRACT_ADDRESS=<address> npx tsx examples/confidential-escrow/agent.ts
 */

import * as path  from 'node:path';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';
import * as crypto from 'node:crypto';

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
const ZK_CONFIG_PATH   = path.resolve(import.meta.dirname, 'managed', 'confidential-escrow');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sha256(data: string): Buffer {
  return crypto.createHash('sha256').update(data).digest();
}

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

async function connectContract(wallet: WalletFacade, stateId: string) {
  const ContractModule = await import(path.join(ZK_CONFIG_PATH, 'contract', 'index.js'));
  const compiled = CompiledContract
    .make('confidential-escrow', ContractModule.Contract)
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
  const creatorSeed      = process.env.CREATOR_SEED;
  const counterpartySeed = process.env.COUNTERPARTY_SEED;
  const arbiterSeed      = process.env.ARBITER_SEED;

  if (!creatorSeed || !counterpartySeed || !arbiterSeed) {
    throw new Error('Set CREATOR_SEED, COUNTERPARTY_SEED, and ARBITER_SEED env vars');
  }
  if (!CONTRACT_ADDRESS) {
    console.log('No CONTRACT_ADDRESS — compile and deploy contract.compact first.');
    return;
  }

  console.log('\n🔒 Confidential Escrow Demo\n');

  // Build all three wallets
  console.log('Building wallets...');
  const [creatorCtx, counterpartyCtx, arbiterCtx] = await Promise.all([
    buildWallet(creatorSeed),
    buildWallet(counterpartySeed),
    buildWallet(arbiterSeed),
  ]);

  console.log(`  Creator:      ${creatorCtx.keystore.getBech32Address()}`);
  console.log(`  Counterparty: ${counterpartyCtx.keystore.getBech32Address()}`);
  console.log(`  Arbiter:      ${arbiterCtx.keystore.getBech32Address()}`);

  console.log('\nSyncing wallets...');
  await Promise.all([
    Rx.firstValueFrom(creatorCtx.wallet.state().pipe(Rx.filter((s: any) => s.isSynced))),
    Rx.firstValueFrom(counterpartyCtx.wallet.state().pipe(Rx.filter((s: any) => s.isSynced))),
    Rx.firstValueFrom(arbiterCtx.wallet.state().pipe(Rx.filter((s: any) => s.isSynced))),
  ]);
  console.log('  ✅ All synced\n');

  const creatorContract      = await connectContract(creatorCtx.wallet, 'creator-state');
  const counterpartyContract = await connectContract(counterpartyCtx.wallet, 'counterparty-state');
  const arbiterContract      = await connectContract(arbiterCtx.wallet, 'arbiter-state');

  // Off-chain task spec — only hash goes on-chain
  const taskSpec = JSON.stringify({
    title: 'Analyse quarterly sales data',
    deliverable: 'PDF report with charts',
    deadline: '2026-05-15',
  });
  const taskHash = sha256(taskSpec);

  const escrowId              = Buffer.from(`escrow-${Date.now()}`);
  const amount                = 5_000n;
  const creatorCommitment     = Buffer.from('creator-secret-commitment');
  const counterpartyCommitment = Buffer.from('counterparty-secret-commitment');

  // ── Happy path: create → fund → submit → release ─────────────────────────

  console.log('📝 Creating escrow...');
  const createResult = await creatorContract.callTx.create_escrow(
    escrowId,
    counterpartyCtx.keystore.getBech32Address(),
    amount,
    taskHash,
    creatorCommitment,
    counterpartyCommitment
  );
  console.log(`  ✅ Created — tx: ${createResult.public.txId}`);

  let status = await creatorContract.callTx.get_status(escrowId);
  console.log(`  Status: ${status} (0=created)\n`);

  console.log('💰 Counterparty funding escrow...');
  const fundResult = await counterpartyContract.callTx.fund_escrow(escrowId, counterpartyCommitment);
  console.log(`  ✅ Funded — tx: ${fundResult.public.txId}`);

  status = await creatorContract.callTx.get_status(escrowId);
  console.log(`  Status: ${status} (1=funded)\n`);

  // Off-chain work happens here...
  const completionEvidence = { deliverable_url: 'ipfs://Qm...', completed_at: Date.now() };
  const proofHash = sha256(JSON.stringify(completionEvidence));

  console.log('✅ Counterparty submitting completion proof...');
  const submitResult = await counterpartyContract.callTx.submit_completion(
    escrowId,
    counterpartyCommitment,
    proofHash
  );
  console.log(`  ✅ Submitted — tx: ${submitResult.public.txId}`);

  status = await creatorContract.callTx.get_status(escrowId);
  console.log(`  Status: ${status} (2=submitted)\n`);

  console.log('🎉 Creator releasing payment...');
  const releaseResult = await creatorContract.callTx.release_escrow(escrowId, creatorCommitment);
  console.log(`  ✅ Released — tx: ${releaseResult.public.txId}`);

  status = await creatorContract.callTx.get_status(escrowId);
  console.log(`  Status: ${status} (3=released)\n`);

  // ── ZK amount proof (useful for reputation systems) ───────────────────────

  console.log('📊 Proving escrow amount was above 1000 (for reputation)...');
  const proofResult = await creatorContract.callTx.prove_escrow_amount_above(escrowId, 1000n);
  console.log(`  ✅ Proof: ${proofResult} (amount ≥ 1000, exact value private)\n`);

  console.log('Full lifecycle complete. Task details never stored on-chain.');
}

main().catch(console.error);
