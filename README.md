# midnight-ai-kit

**Battle-tested prompts, patterns & examples for AI developers building on Midnight Network.**

Built by the team behind [Night Markets](https://github.com/kingmunz1994-lgtm/night-markets) — a privacy-first marketplace with a live escrow contract on Midnight Preprod. This kit contains the exact tools, prompts, and Compact patterns we wish we had when wiring ZK circuits, shielded flows, and multi-wallet integration using Claude and Cursor.

## Why Midnight for AI Agents?

- **Shielded tokens** — private payments between agents, no on-chain footprint
- **ZK credentials** — agents prove reputation or capability without revealing history
- **Confidential coordination** — multi-agent tasks and escrows with privacy by default
- **Programmable privacy** — Compact circuits enforce rules without exposing data

## Quick Start

1. Copy **[CLAUDE.md](./CLAUDE.md)** into your Claude or Cursor system prompt
2. Browse `prompts/` for specialized use cases
3. Check `examples/` and `patterns/` for ready-to-use code

## What's Inside

| Folder | Contents |
|--------|----------|
| `CLAUDE.md` | Master system prompt — optimized for Compact + Midnight |
| `prompts/` | Specialized prompts for common AI agent patterns |
| `patterns/` | Reusable Compact modules extracted from real deployed contracts |
| `examples/` | Working starters with contracts + TypeScript agent code |

## Prompts

- [Shielded Agent Wallet](./prompts/shielded-agent-wallet.md)
- [Private Credentials & Reputation](./prompts/private-credentials.md)
- [Confidential Task Marketplace](./prompts/confidential-task-marketplace.md)
- [Agent-to-Agent Private Payments](./prompts/agent-to-agent-payments.md)
- [Private Escrow for Agents](./prompts/escrow-for-agents.md)

## Examples

- [Basic Shielded Agent Wallet + Escrow](./examples/basic-shielded-agent/)
- [Private Credentials](./examples/private-credentials/)

## Patterns

- [Shielded Token Operations](./patterns/shielded-token-operations.md)
- [Private Credential Verification](./patterns/private-credential-verification.md)
- [Secure Agent Identity](./patterns/agent-identity.md)

## Network Endpoints (Preprod)

| Service | URL |
|---------|-----|
| Indexer GraphQL | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| Indexer WS | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` |
| Node RPC | `https://rpc.preprod.midnight.network` |

## Contributing

PRs welcome — especially new patterns and examples extracted from real `night-*` projects.

---

Built on real Midnight Preprod deployment experience. Star this if you're building privacy-first AI agents.
