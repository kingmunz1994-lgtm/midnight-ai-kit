# Example: Confidential Escrow

A production-ready private escrow contract for agent-to-agent task payments. Task details and amounts stay private on-chain; only status (0-5) is publicly readable for indexing.

## Privacy Model

| Data | Visibility |
|------|-----------|
| Escrow amount | Private |
| Task details | Off-chain only (hash on-chain) |
| Party identities | Protected by commitment |
| Escrow status | Public (needed for dispute resolution) |
| Nullifiers | Prevent replay attacks |

## Lifecycle

```
create_escrow  →  fund_escrow  →  submit_completion  →  release_escrow
                                                      →  dispute_escrow  →  resolve_dispute (arbiter)
              →  cancel_escrow (before funding)
```

Status codes: `0=created, 1=funded, 2=submitted, 3=released, 4=disputed, 5=cancelled`

## Files

- `contract.compact` — Compact smart contract with nullifier protection
- `agent.ts` — TypeScript demo: full happy path + dispute path
- `README.md` — This file

## Setup

```bash
npm install
```

Required env vars:
```
CREATOR_SEED=<64-char hex>
COUNTERPARTY_SEED=<64-char hex>
ARBITER_SEED=<64-char hex>
CONTRACT_ADDRESS=<deployed address>
PROOF_SERVER_URI=http://127.0.0.1:6300   # optional, defaults to this
```

## Deploy & Run

```bash
# Compile
npm run compile:escrow

# Deploy (get the CONTRACT_ADDRESS from output)
npx midnight-js deploy examples/confidential-escrow/managed/confidential-escrow

# Run demo
CREATOR_SEED=<hex> COUNTERPARTY_SEED=<hex> ARBITER_SEED=<hex> \
CONTRACT_ADDRESS=<address> npm run run:escrow
```

## Key Differences from basic-shielded-agent

- **Nullifiers** prevent escrow ID reuse (replay attack protection)
- **Dispute path** with third-party arbiter
- **Task hash** keeps spec off-chain, only cryptographic commitment stored
- **Completion proof** submitted as hash before release
- **5 status states** vs 4 — proper cancellation handling

## Wiring into Night Markets

The escrow contract in `/night-markets/contracts/NightMarketsEscrow.compact` uses a similar pattern. Key addition here is `prove_escrow_amount_above` — use this to gate reputation in `examples/private-credentials/`.
