# Night Ecosystem — Current Sprint

**This file is the session handoff document.**
Every Claude session working on the Night ecosystem must:
1. Read this file first
2. Read `LAUNCH_ROADMAP.md` in `night-markets` repo
3. Pick the next unchecked item from the roadmap
4. Update this file before ending the session

---

## Last Session Summary (2026-05-13)

### What Was Done
- **nightid-api.ts** (`action-score` endpoint): Added `spent` and `available` fields to `GET /api/nightid/action-score/:addr` response. `available = total - spent` so frontends show true spendable NIGHT balance.
- **night-hub**: Added `fetchPokerCount()` — fetches `/api/poker/tables` on load, shows live table count in hero badge ("🃏 N poker tables live") and inline in dashboard "Live on Midnight" header. Fixed NIGHT Balance stat to use `available` instead of `total`.
- **night-fun** (`launch.js`): Wired `recordAction` — bonding curve launch (+20pts), token buy (+10pts), token sell (+5pts). Token deploy already covered via `awardNightScore('token')` (+25pts).
- **night-lend** (`lend.js`): Wired `recordAction` — deposit (+20pts), repay (+15pts), withdraw (+10pts). Borrow was already wired (+30pts).
- **night-work** (`work.js`): Wired `recordAction` — accept task (+20pts), post task (+25pts). Submit proof was already wired (+40pts).
- **night-save** (`vault.js`): Wired `recordAction` — mint sUSD (+20pts), repay debt (+10pts), redeem collateral (+5pts). Deposit was already wired (+10pts).
- **night-biz** (`biz.js`): Wired `recordAction` — epoch close (+15pts). Token deploy was already wired (+10pts).
- **night-markets main**: Merged feature branch `claude/night-fun-feature-5hJ9W` into main. Railway now serves the updated `nightid-api.ts` with `spent/available` in action-score.
- **LAUNCH_ROADMAP.md**: Updated to 2026-05-08 truth (phase 1+2 complete, phases 3-9 documented).

### Commits This Session
- `night-markets` main: `0fa8bb4` (merge — spent/available in action-score, all feature branch changes)
- `night-hub` master: `a6fe080` (live poker count, available NIGHT balance)
- `night-fun` main: `6d2f84f` (record-action: curve, buy, sell)
- `night-lend` main: `fcf4a9a` (record-action: deposit, repay, withdraw)
- `night-work` main: `61e7209` (record-action: accept, post)
- `night-save` main: `eeab2b8` (record-action: mint, repay, redeem)
- `night-biz` main: `a191f24` (record-action: epoch close)

### Railway Status
- Auto-deploys from night-markets main ✅
- After 2026-05-13 push: `GET /api/nightid/action-score/:addr` now returns `spent` + `available` fields

---

## Next Session — Pick Up Here

**Phase 3 is the blocker.** Everything after it depends on contracts being deployed.
Phase 3 requires a local machine with Docker running the proof server — cannot be done remotely.

### If the user has Docker available (Phase 3 work):
1. Start proof server: `npm run proof-server` in any repo
2. Deploy night-poker first (highest user visibility):
   ```bash
   cd /home/user/night-poker
   npm install
   # artifacts already compiled — skip npm run compile
   npm run deploy
   # record CONTRACT_ADDRESS
   ```
3. After deploy: wire `commitHand`/`claimPot` into nightid-api.ts WS handler
4. Move to night-fun, then night-lend, etc. in priority order

### If Docker is not available (Phase 5/6/8 work):
1. **Test night-store Printful integration** — place a real test order via:
   ```
   POST https://night-markets-94-production.up.railway.app/api/store/checkout
   { "address": "test_addr", "items": [{"productId":"mug","size":"11oz","qty":1}], "shipping": {...} }
   ```
2. **Night Hub leaderboard** — query Redis top-N addresses by score, render in hub dashboard (Phase 6)
3. **Phase 8 polish** — `parseDustAmt()` fix and wallet poll backoff across all standalone app frontends
4. **Write NightID.compact** — the identity contract is the only missing contract (Phase 4)

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
- [ ] Night Score leaderboard in hub (query Redis top-N)
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
