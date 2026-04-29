# Getting Started with Midnight AI Kit

Everything you need to run the examples against Midnight preprod.

## Prerequisites

- Node.js 18+
- Docker (for the proof server)
- A funded preprod wallet (get tNIGHT from the faucet below)

## 1. Install dependencies

```bash
cd midnight-ai-kit
npm install
```

## 2. Start the proof server

The proof server generates ZK proofs locally. It must be running before any transaction.

```bash
npm run proof-server
# Starts on http://127.0.0.1:6300
# First run pulls ~2GB Docker image
```

Verify it's ready:
```bash
curl http://127.0.0.1:6300/health
# → {"status":"ok"}
```

## 3. Get a funded preprod wallet

Generate a seed:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Fund via the faucet:
- Midnight preprod faucet: https://faucet.preprod.midnight.network
- You need both tNIGHT (for transactions) and tDUST (for gas fees)

## 4. Compile a contract

Each example needs its Compact contract compiled before it can run.

```bash
# Compile the shielded agent wallet contract
npm run compile:shielded-agent

# Compile the credentials contract
npm run compile:credentials

# Compile the confidential escrow contract
npm run compile:escrow
```

This generates the ZK circuit assets into `examples/<name>/managed/`.

## 5. Deploy a contract

```bash
npx midnight-js deploy examples/basic-shielded-agent/managed/shielded-agent-wallet \
  --network preprod \
  --seed <your-64-char-hex-seed>
# Outputs: CONTRACT_ADDRESS=mn1abc...
```

## 6. Run an example

### Basic Shielded Agent Wallet

```bash
AGENT_SEED=<hex> CONTRACT_ADDRESS=<address> npm run run:shielded-agent
```

### Private Credentials

```bash
ISSUER_SEED=<hex> AGENT_SEED=<hex> CONTRACT_ADDRESS=<address> npm run run:credentials
```

### Confidential Escrow

```bash
CREATOR_SEED=<hex> COUNTERPARTY_SEED=<hex> ARBITER_SEED=<hex> \
CONTRACT_ADDRESS=<address> npm run run:escrow
```

## Network Endpoints (preprod)

| Service | URL |
|---------|-----|
| Indexer (HTTP) | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| Indexer (WS) | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` |
| RPC node | `https://rpc.preprod.midnight.network` |
| Proof server | `http://127.0.0.1:6300` (local) |

## Troubleshooting

**"Proof server not reachable"**
- Run `npm run proof-server` and wait for it to print "ready"
- Check `docker ps` to confirm container is running

**"Wallet not synced"**
- Preprod can take 1-2 min to sync; the agent will wait automatically

**"Insufficient dust"**
- Get tDUST from the faucet — every transaction requires a small dust fee

**"Circuit assets not found"**
- Run `npm run compile:<example>` before running the agent

**Key types reminder**
- `AGENT_SEED` / `CREATOR_SEED` / etc. are 64-character hex strings (32 bytes)
- Never commit seeds to git — use `.env` files (already in `.gitignore`)

## Understanding the Privacy Model

Every example explicitly documents what is private vs public. As a rule:

- **Private state** (`private` keyword in Compact) — never readable from outside the contract, only provable via ZK circuits
- **Public state** (`pub` keyword) — readable by anyone via the indexer
- **ZK circuits** (`pub circuit fn`) — called on-chain, prove properties of private state without revealing values
- **Commitments** — `msg_sender_commitment()` authenticates callers without exposing private keys

## Next Steps

- Read `CLAUDE.md` for the full Compact language reference
- Browse `prompts/` for ready-to-use AI prompts for common patterns
- Browse `patterns/` for reusable Compact code snippets
- Extend examples into a LangGraph or CrewAI agent workflow
