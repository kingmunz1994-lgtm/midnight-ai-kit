# Getting Started with Midnight AI Kit

Everything you need to run the examples against Midnight preprod or mainnet.

## Prerequisites

- Node.js v22.15+ (or 18/20 — all work with current SDK)
- Docker (for the proof server)
- A funded wallet (preprod: get tNIGHT from the faucet; mainnet: real NIGHT/DUST)

## 0. Option A — Local dev network (recommended)

The fastest way to develop: run a complete Midnight network locally instead of hitting preprod.

```bash
git clone https://github.com/midnightntwrk/midnight-local-dev
cd midnight-local-dev && npm start
```

This starts three Docker containers automatically:
- **Node** → `http://localhost:9944`
- **Indexer/GraphQL** → `http://localhost:8088/api/v1/graphql`
- **Proof server** → `http://localhost:6300`

Then fund your test wallet (interactive menu — paste your Bech32 address, receive 50,000 NIGHT).
Lace auto-detects local endpoints — no `.env` changes needed.

## 0. Option B — Quick scaffold

If you're starting a fresh project rather than using kit examples:
```bash
npx create-mn-app    # official Midnight scaffold
```

## 1. Install dependencies

```bash
cd midnight-ai-kit
npm install
```

## 2. Install the Compact CLI

The `compact` CLI is the new standard build tool (replaces standalone `compactc`):
```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

compact self update    # keep current
```

## 3. Start the proof server

The proof server generates ZK proofs locally. Must be running before any transaction.

```bash
npm run proof-server
# Starts midnightntwrk/proof-server:8.0.3 on http://127.0.0.1:6300
# First run pulls ~2GB Docker image
```

Verify it's ready:
```bash
curl http://127.0.0.1:6300/health
# → {"status":"ok"}
```

GPU option (faster proving): `github.com/Nocy-io/nocy-gpu-proof-server`

## 4. Install Midnight MCP (recommended for AI-assisted development)

Gives Claude or Cursor live Midnight docs + Compact validation in-session:
```bash
npx midnight-mcp@latest
```

Or add to Claude Desktop / Cursor `settings.json`:
```json
{
  "mcpServers": {
    "midnight": { "command": "npx", "args": ["-y", "midnight-mcp@latest"] }
  }
}
```

## 5. Get a funded wallet

Generate a seed:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Preprod (testing):**
- Faucet: `https://faucet.preprod.midnight.network`
- You need both tNIGHT (transactions) and tDUST (gas fees)

**Mainnet:**
- Get NIGHT/DUST from an exchange or the Midnight ecosystem
- Requires a Blockfrost API key: `blockfrost.dev`

## 6. Compile a contract

```bash
# Using compact CLI (current standard)
compact compile examples/basic-shielded-agent/contracts/ShieldedAgentWallet.compact

# Or via npm scripts
npm run compile:shielded-agent
npm run compile:credentials
npm run compile:escrow
```

This generates ZK circuit assets into `examples/<name>/managed/`.

## 7. Deploy a contract

```bash
npx midnight-js deploy examples/basic-shielded-agent/managed/shielded-agent-wallet \
  --network preprod \
  --seed <your-64-char-hex-seed>
# Outputs: CONTRACT_ADDRESS=mn1abc...
```

## 8. Run an example

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

---

## Network Endpoints

### Preprod
| Service | URL |
|---------|-----|
| Indexer (HTTP) | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| Indexer (WS) | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` |
| RPC node | `https://rpc.preprod.midnight.network` |
| Proof server | `http://127.0.0.1:6300` (local) |

### Mainnet (via Blockfrost)
| Service | URL |
|---------|-----|
| Indexer (HTTP) | `https://midnight-mainnet.blockfrost.io/api/v0/` |
| Indexer (WS) | `wss://midnight-mainnet.blockfrost.io/api/v0/ws` |
| RPC node | `https://rpc.midnight-mainnet.blockfrost.io` |

Requires `?project_id=YOUR_BLOCKFROST_KEY` on requests.
Public alternative: Ankr provides rate-limited public Midnight RPC (no key).

---

## Troubleshooting

**"Proof server not reachable"**
- Run `npm run proof-server` and wait for it to print "ready"
- Check `docker ps` to confirm container is running

**"Wallet not synced"**
- Preprod can take 1-2 min to sync on unshielded; the agent waits automatically
- Never wait on full `isSynced` — only wait on unshielded progress

**"Insufficient dust"**
- Get tDUST from the preprod faucet — every transaction requires a small dust fee

**"Circuit assets not found"**
- Run `compact compile <contract>` before running the agent

**"enable is not a function" / "isEnabled is not a function"**
- DApp Connector API v4 removed these. Use `connect(networkId)` instead.
- Try `'mainnet'`, `'preprod'`, `'undeployed'` in sequence.

**"fee is not a function" / WalletFacade fee errors**
- wallet-sdk-facade 3.x split this into `calculateFee()` and `estimateFee()`

**Key types reminder**
- Seeds are 64-character hex strings (32 bytes)
- Never commit seeds to git — use `.env` files (already in `.gitignore`)

---

## Understanding the Privacy Model

Every example explicitly documents what is private vs public:

- **Private state** (`private` in Compact) — never readable externally, only provable via ZK circuits
- **Public state** (`pub`) — readable by anyone via the indexer
- **ZK circuits** (`pub circuit fn`) — prove properties of private state without revealing values
- **Commitments** — `msg_sender_commitment()` authenticates callers without exposing private keys

---

## Next Steps

- Read `CLAUDE.md` for the full Compact language reference and SDK version guide
- Browse `prompts/` for ready-to-use AI prompts for common patterns
- Browse `patterns/` for reusable Compact code snippets
- Check `vision/` for the Night ecosystem builder program and NFP structure
- Extend examples into a LangGraph or CrewAI agent workflow
