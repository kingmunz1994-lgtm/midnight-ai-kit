# Case Study: Night Ecosystem Sprint

**One builder. One AI session. Nine production apps on Midnight.**

---

## What Was Built

The Night ecosystem is a unified suite of 9 privacy-first dApps on Midnight Network, all sharing a common identity layer (Night ID), reputation system (Night Score), and OS-style dashboard (Night Hub).

| App | What it does | Status |
|-----|-------------|--------|
| Night Markets | ZK escrow marketplace — createListing → fundEscrow → releaseEscrow | Live on Preprod |
| Night Fun | ZK token launchpad — bonding curve, epoch revenue sharing, private buys | Contracts compiled |
| Night Poker | Provably fair ZK Texas Hold'em — private hole cards, ZK showdown | Contracts compiled |
| Night ID | Multi-chain ZK identity — score ETH/SOL/ADA/Midnight, W3C credentials, .night names | Live frontend |
| Night Lend | ZK lending — private collateral, 75% LTV, on-chain liquidation | Contracts compiled |
| Night Save | ZK vault + sUSD stablecoin — BNPL enforced by contract | Contracts compiled |
| Night Work | ZK task marketplace — AI agents and humans earn NIGHT privately | Contracts compiled |
| Night Biz | ZK loyalty tokens — prove tier without revealing balance | Contracts compiled |
| Night Store | Merch shop — 50% of sales auto-routed to token holders | Frontend live |
| Night Hub | OS-style dashboard — unified identity, score, feed, all apps | Live frontend |

All repos: `github.com/kingmunz1994-lgtm/night-*`

---

## How It Was Built

Every app followed the same AI-assisted pattern:

### 1. Contract First
Claude Code wrote the Compact smart contract with ZK circuits, private state, and public state clearly separated. The AI understood Midnight's privacy model natively from the system prompt — no hand-holding on `msg_sender_commitment()`, shielded values, or the dual-ledger model.

### 2. Deploy Infrastructure
`deploy.ts` scripts for each app, with all known SDK bugs pre-fixed (ledger v7/v8 bridge, `dustBal`, `isSynced` removal, `WalletFacade` constructor). These fixes were discovered the hard way on Night Markets and documented so every subsequent app got them for free.

### 3. API Server Bridge
A single `api-server.ts` handles HTTP + WebSocket for the browser UIs to reach on-chain contracts. Night Fun, Night ID, Night Score, escrow lifecycle — all routed through one server with simulation fallback when the chain isn't available.

### 4. Frontend
Each app got a full dark-mode frontend consistent with the Night design system. The AI maintained visual consistency across 9 separate UIs — same CSS variables, same font stack, same interaction patterns.

### 5. Shared Infrastructure
- `night-id-scorer.ts` — multi-chain scoring (ETH via Cloudflare RPC, SOL via mainnet-beta, ADA via Blockfrost, Midnight via indexer)
- `nightid-api.ts` — slim Fly.io deployment for production Night ID API
- `set-contract-address.ts` — patches all hardcoded addresses in one command after deployment

---

## What the AI Got Right

**Architecture decisions.** Claude understood immediately that 9 apps sharing one identity layer was better than 9 isolated apps. The cross-app Night Score — where actions in any app contribute to one reputation — was proposed and implemented without it being explicitly requested.

**SDK bug diagnosis.** The Midnight SDK has non-obvious bugs (ledger version mismatches, `isSynced` race conditions, `dustBal` API absence). Claude diagnosed these from stack traces, documented them, and applied the fixes consistently across every new script.

**Privacy model compliance.** Every contract kept private data private. The AI never leaked private values through public return types, always used `msg_sender_commitment()` for auth, always shielded financial values.

**Consistency at scale.** 9 apps, one session, consistent design language, consistent architecture, consistent SDK patterns. This would be extremely difficult for a solo human developer to achieve without months of work.

---

## What Required Human Judgment

- **Strategic prioritization** — which apps to build first, what the ecosystem should feel like
- **Vision** — "I want to build the app where that all lives" (Night Hub) came from the builder, not the AI
- **Domain knowledge** — knowing that IOG built both Cardano and Midnight, knowing the Catalyst governance model, knowing the timing of Midnight mainnet
- **Taste** — the "one OS, ten apps, zero traces" framing came from the builder's sense of what would resonate

---

## SDK Gotchas Discovered

Every one of these was hit during the sprint and documented in `docs/midnight-sdk-notes.md`:

1. **Ledger v7/v8 WASM bridge** — `wallet-sdk-*` uses ledger-v7 internally, `midnight-js-contracts@4.0.4` uses ledger-v8. Must patch.
2. **Secret keys must be ledger-v7** — `ZswapSecretKeys.fromSeed()` fails with v8 types.
3. **`WalletFacade` has no static `init()`** — it's `new WalletFacade(shielded, unshielded, dust)`.
4. **Never wait on `s.isSynced`** — requires all 3 wallets at genesis sync (~2.5h). Wait on unshielded only.
5. **`DustWalletState` has no `balance()` method** — use `availableCoins.reduce()`.
6. **DApp Connector v4 breaking change** — `enable()`/`isEnabled()` removed, use `connect(networkId)`.
7. **Node v22 iterator bugs** — use Node 18 or 20 with Midnight SDK.

---

## Metrics

- **Contracts written:** 9 (NightMarketsEscrow, NightFunToken, NightPoker, NightID, NightLend, NightSave, NightWork, NightBiz, NightStore)
- **Contracts deployed:** 1 (NightMarketsEscrow, block 127,350 on Preprod)
- **Frontends shipped:** 10 (9 apps + Night Hub)
- **API endpoints:** 40+ across escrow, Night Fun, Night ID, Night Score, poker WebSocket
- **SDK bugs fixed and documented:** 7
- **Listed on midnight-awesome-dapps:** Yes (PR #123)

---

## The Replicable Pattern

Any builder can replicate this with:

1. This repo (`midnight-ai-kit`) as their Claude system prompt
2. A clear vision of what they want to build
3. Claude Code with the Compact patterns loaded
4. The SDK fixes from `docs/midnight-sdk-notes.md` pre-applied

The AI handles the 80%. The builder handles the vision, the taste, and the final 20% that requires real-world judgment.

That's the model.
