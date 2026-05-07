# midnight-ai-kit

**Battle-tested prompts, patterns & examples for AI developers building on Midnight Network.**

Built by the team behind the [Night ecosystem](https://kingmunz1994-lgtm.github.io/night-hub/) — 9 production apps on Midnight built in a single AI sprint. ZK contracts, frontends, cross-app identity, unified OS dashboard. All open source. This kit contains the exact tools, prompts, and Compact patterns we wish we had when wiring ZK circuits, shielded flows, and multi-wallet integration using Claude and Cursor.

> **The proof:** One builder + Claude Code = 9 apps, one session. See the [full case study](./case-studies/night-ecosystem-sprint.md).

## Why Midnight for AI Agents?

- **Shielded tokens** — private payments between agents, no on-chain footprint
- **ZK credentials** — agents prove reputation or capability without revealing history
- **Confidential coordination** — multi-agent tasks and escrows with privacy by default
- **Programmable privacy** — Compact circuits enforce rules without exposing data

## Quick Start

1. Copy **[CLAUDE.md](./CLAUDE.md)** into your Claude or Cursor system prompt
2. Browse `prompts/` for specialized use cases
3. Check `examples/` and `patterns/` for ready-to-use code
4. See **[GETTING_STARTED.md](./GETTING_STARTED.md)** to run examples against Midnight preprod

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
- [Private Credentials & Reputation](./examples/private-credentials/)
- [Confidential Escrow (with dispute + nullifiers)](./examples/confidential-escrow/)

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

## Vision & Case Studies

- [Night Ecosystem Vision](./vision/NIGHT_ECOSYSTEM_VISION.md) — privacy infrastructure for the AI economy, the Cardano bridge thesis, the AI agent economy
- [AI Builder Program](./vision/AI_BUILDER_PROGRAM.md) — how network-subsidized AI development works, the Night Score routing model, the IOG/Anthropic pitch
- [Night Ecosystem Sprint](./case-studies/night-ecosystem-sprint.md) — what was built, how, what the AI got right, SDK gotchas, the replicable pattern

## Contributing

PRs welcome — especially new patterns, examples from real `night-*` projects, and case studies from your own Midnight builds.

---

Built on real Midnight Preprod deployment experience. Part of the [Night ecosystem](https://kingmunz1994-lgtm.github.io/night-hub/). Star this if you're building privacy-first AI agents.
