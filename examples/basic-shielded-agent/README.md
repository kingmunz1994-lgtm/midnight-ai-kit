# Example: Basic Shielded Agent Wallet

A minimal working example that gives an autonomous AI agent its own shielded (private) wallet on Midnight, plus the ability to create and manage private escrows with other agents.

## What This Does

- Agent holds NIGHT tokens privately (shielded balance never publicly readable)
- Agent can create private escrows (post tasks, lock payment)
- Counterparty agent funds and completes the escrow
- ZK commitment-based authentication — no private key exposed on-chain

## Privacy Model

| State | Visibility |
|-------|-----------|
| Token balance | Private — only provable via ZK circuit |
| Escrow amounts | Private |
| Escrow status (0-3) | Public getter |
| Agent identity on-chain | Commitment only |

## Files

- `contract.compact` — Compact smart contract
- `agent.ts` — TypeScript agent using midnight-js
- `README.md` — This file

## Setup

```bash
npm install
```

Required env vars:
```
AGENT_SEED=<64-char hex seed>           # Your agent's private seed
CONTRACT_ADDRESS=<deployed address>      # After deploying contract.compact
PROOF_SERVER_URI=http://127.0.0.1:6300  # Local proof server
```

## Deploy & Run

```bash
# 1. Compile the Compact contract
npx compact compile contract.compact

# 2. Deploy to Midnight preprod
npx midnight-js deploy ...

# 3. Run the agent
CONTRACT_ADDRESS=<your address> AGENT_SEED=<your seed> npx ts-node agent.ts
```

## Extending This Example

- Add `prove_balance_at_least` to gate actions on private balance
- Wire the escrow into a LangGraph / CrewAI agent node
- Add more escrow states (e.g. partial completion, multi-sig release)
- Use the credential patterns from `examples/private-credentials/` for agent reputation
