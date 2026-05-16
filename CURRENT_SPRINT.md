# Night Ecosystem — Current Sprint

**This file is the session handoff document.**
Every Claude session working on the Night ecosystem must:
1. Read this file first
2. Read `LAUNCH_ROADMAP.md` in `night-markets` repo
3. Pick the next unchecked item from the roadmap
4. Update this file before ending the session

---

## Last Session Summary (2026-05-16)

### What Was Done

**Night Markets UX + Leaderboard API (previous context):**
- `sounds.js` (new): `NightSounds` marketplace sound engine
- `scripts/nightid-api.ts` v1.4.0: leaderboard endpoint + in-memory Map
- `index.html`: 9 sound wiring points
- `night-hub`: leaderboard UI (hub.js + index.html + hub.css)

**This context:**
- Merged `claude/night-fun-feature-5hJ9W` → `main` in night-markets (Railway now live with leaderboard API)
- **DApp Connector v4 migration** across all 7 affected repos:
  - Replaced `connector.enable()` with `connect(networkId)`
  - Added robust `parseDustAmt()` helper (handles bigint/object/string)
  - Added `getUnshieldedAddress()` + `getShieldedAddresses()` fallback for address
  - Added `getDustBalance()` + `getUnshieldedBalances()` for balance
  - Added poll backoff (stops after 3 failures to prevent APIError spam when locked)
  - Added `midnight#ready` event listener for late-injecting wallets (1AM, GSD)
  - Repos updated: night-biz, night-lend, night-save, night-work, night-fun, night-id, night-poker

### Commits This Context
- `night-markets` main: feature branch merged (leaderboard API live on Railway)
- `night-biz` main: `a8a1f9b` (DApp Connector v4)
- `night-lend` main: `14a6b21` (DApp Connector v4)
- `night-save` main: `837d2ec` (DApp Connector v4)
- `night-work` main: `0592aae` (DApp Connector v4)
- `night-fun` main: `862894b` (DApp Connector v4)
- `night-id` main: `ba5b263` (DApp Connector v4)
- `night-poker` main: `aff637b` (DApp Connector v4)

### Research findings this session (key items)
- OZ Compact contracts: on runtime 0.14.0 (one behind us) — borrow patterns not code
- **Add `Pausable` to NightMarketsEscrow** — OZ pattern, ~10 lines, emergency stop
- **Add `Initializable` guard** to all contracts — prevents re-init attacks
- **`persistentCommit<T>` for poker hole cards** — without this, ZK showdown doesn't actually prove card integrity (Brick Towers seabattle solved this)
- **Use Brick Towers identity pattern** as blueprint for NightID.compact (Phase 4)
- **`computeAccountId()` pure circuit** — standardize identity derivation across contracts
- Official counter example uses midnight-js-* ^4.0.4 — verify pinned in package.json

---

## Next Session — Pick Up Here

### Priority order:

**1. Add `Pausable` circuit to `NightMarketsEscrow.compact`** (OZ pattern):
- `export ledger _isPaused: Boolean;`
- `export circuit pause(): []` / `export circuit unpause(): []` (admin only)
- `assertNotPaused()` guard on createListing, fundEscrow, releaseEscrow

**2. Fix `persistentCommit` hole cards in `NightPoker.compact`**:
- Cards currently not committed on-chain — showdown ZK proof doesn't prove integrity
- Pattern from Brick Towers seabattle: `persistentCommit<Hand>(hole_cards, persistentHash([sk, kernel.self().bytes]))`
- Store commitment on ledger at deal time, verify at showdown

**3. Night poker contract deploy** (when Docker available):
- `npx tsx scripts/deploy.ts` — user needs to run this
- When CONTRACT_ADDRESS received: update `.env`, CLAUDE.md table, wire commitHand/claimPot

**4. End-to-end test night-markets escrow flow**:
- `npm run serve` + Lace with preprod tDUST
- createListing → fundEscrow → releaseEscrow in browser

**5. Submit PR to midnight-awesome-dapps** for ecosystem visibility

**6. Test night-store Printful integration** (Phase 5)

### What Was Done

**Night Poker Tier 1 UX (previous context — commit `3ff3969`):**
- `sounds.js`, `history.js`, `game.js`, `index.html` in night-poker — sounds, chip animations, hand history, provably fair panel

**This context — Night Markets UX + Leaderboard API:**
- **`night-markets/sounds.js`** (new): `NightSounds` IIFE — Web Audio API engine for marketplace. 10 sounds: `addToCart`, `click`, `bid`, `zkProof`, `escrow`, `checkout`, `listing`, `mint`, `tick`, `priceUpdate`.
- **`scripts/nightid-api.ts`** (v1.4.0): In-memory leaderboard `Map<string, number>`. `leaderboardUpdate()` / `leaderboardPersist()` / `leaderboardLoad()`. Persists top-100 as JSON to Redis key `ns:leaderboard`. `GET /api/nightid/leaderboard?limit=N` endpoint (max 100, default 10). Returns `{leaderboard:[{rank,address,score}], total}`.
- **`index.html`** (night-markets): Sound calls wired at 9 action points — addToCart, removeItem, commitBid, zkProof, executeReveal, coConfirm, createListing, confirmCheckout, mintVaultItem.
- **`night-hub`** leaderboard UI: `fetchLeaderboard()` in hub.js, `#leaderboard-list` section in tab-home with rank medals (🥇🥈🥉), truncated addresses, level badges, score. CSS added to hub.css.

### Commits This Session
- `night-markets` branch `claude/night-fun-feature-5hJ9W`: `9bb4f3e` (marketplace sounds, leaderboard API, sound wiring)
- `night-hub` master: `cd87571` (Night Score leaderboard in hub dashboard)

### Night Poker Deploy Status
- deploy.ts is fixed and ready
- CONTRACT_ADDRESS not yet received — user needs to paste output when `npx tsx scripts/deploy.ts` completes
- When received: update `.env`, `CLAUDE.md` contracts table, wire commitHand/claimPot in nightid-api.ts WS handler

### Pending: Merge to main
- `night-markets` branch `claude/night-fun-feature-5hJ9W` has the leaderboard API + marketplace sounds
- Must be merged into `main` for Railway to deploy the new `/api/nightid/leaderboard` endpoint
- Until merged, the hub leaderboard shows "unavailable"

---

## Next Session — Pick Up Here

### Priority order:

**1. Merge night-markets feature branch → main** (so Railway deploys leaderboard API):
- `git checkout main && git merge claude/night-fun-feature-5hJ9W && git push origin main`
- Or create a PR on GitHub

**2. Night poker contract address** (if user has output from `npx tsx scripts/deploy.ts`):
- Record `CONTRACT_ADDRESS=<addr>` in night-poker `.env`
- Update CLAUDE.md contracts table
- Wire `commitHand` / `claimPot` in `nightid-api.ts` WS handler

**3. Test night-store Printful integration** (Phase 5):
```
POST https://night-markets-94-production.up.railway.app/api/store/checkout
{ "address": "test_addr", "items": [{"productId":"mug","size":"11oz","qty":1}], "shipping": {...} }
```

**4. Total .night names count in hub** (Phase 6):
- Query nightid-api.ts `GET /api/nightid/names` or equivalent, show count in hub stats

**5. If Docker available (Phase 3):**
- night-fun contract deploy (after poker is done)
- Order: night-fun → night-lend → night-save → night-work → night-biz

---

## Phase 5 / Phase 6 Completion Status

### Phase 5 — Night Store + Night Score Polish
- [ ] Test real Printful order (needs user to run POST with real shipping address)
- [ ] Verify night-print.svg loads at GitHub Pages URL
- [x] `spent` + `available` exposed in action-score API ✅ done 2026-05-13
- [x] `record-action` calls wired in all 5 standalone app frontends ✅ done 2026-05-13

### Phase 6 — Cross-App Integration + Night Hub Live Data
- [x] Active poker table count in hub UI ✅ done 2026-05-13
- [x] NIGHT Balance shows `available` not `total` in hub ✅ done 2026-05-13
- [x] Night Score leaderboard in hub (query Redis top-N) ✅ done 2026-05-13 (needs main merge to go live)
- [ ] Total .night names count in hub

---

## The Non-Negotiable Rules for Every Session

1. **Read LAUNCH_ROADMAP.md first** — it's in `/home/user/night-markets/LAUNCH_ROADMAP.md`
2. **Read CLAUDE.md first** — it's in `/home/user/night-markets/CLAUDE.md`
3. **Don't rebuild what already exists** — check the ecosystem table before writing new code
4. **Update this file before ending** — future sessions depend on it
5. **Commit and push every change** — uncommitted work is lost context
6. **One thing at a time** — finish a task fully before starting the next

---

## Key URLs

| Thing | URL |
|---|---|
| Railway API | `https://night-markets-94-production.up.railway.app` |
| Night Hub | `https://kingmunz1994-lgtm.github.io/night-hub/` |
| Night Markets | `https://kingmunz1994-lgtm.github.io/night-markets/` |
| Night Poker | `https://kingmunz1994-lgtm.github.io/night-poker/` |
| Night ID | `https://kingmunz1994-lgtm.github.io/night-id/` |
| Night Store | `https://kingmunz1994-lgtm.github.io/night-store/` |
| GitHub org | `https://github.com/kingmunz1994-lgtm` |

---

## Key Files Every Session Should Know

| File | Repo | Purpose |
|---|---|---|
| `CLAUDE.md` | night-markets | Session guide, SDK fixes, ecosystem map |
| `LAUNCH_ROADMAP.md` | night-markets | Master checklist — source of truth for what's done/next |
| `CURRENT_SPRINT.md` | midnight-ai-kit | This file — session handoff |
| `scripts/nightid-api.ts` | night-markets | The Railway API server — all Night Score, ID, store, poker endpoints |
| `scripts/deploy.ts` | night-markets | Reference deploy script with all SDK fixes applied |
| `docs/midnight-sdk-notes.md` | night-markets | SDK gotchas — read before touching any Midnight SDK code |

---

## Active Branch

- night-markets primary: `main` (Railway deploys from here)
- Feature branches: create from `main`, name `claude/<description>`
- All other repos: `main` (or `master` for night-hub)
