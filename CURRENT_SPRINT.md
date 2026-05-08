# Night Ecosystem — Current Sprint

**This file is the session handoff document.**
Every Claude session working on the Night ecosystem must:
1. Read this file first
2. Read `LAUNCH_ROADMAP.md` in `night-markets` repo
3. Pick the next unchecked item from the roadmap
4. Update this file before ending the session

---

## Last Session Summary (2026-05-08)

### What Was Done
- **night-store**: Full pivot to shopper-first UI — product grid, sliding cart, NIGHT token checkout via Printful API. Night Score balance used as NIGHT (total - spent).
- **nightid-api.ts**: Added 4 store endpoints (`/api/store/products`, `/api/store/estimate`, `/api/store/checkout`, `/api/store/order/:id`). Added poker WebSocket room server (`/ws/poker/{tableId}`) and table registry (`/api/poker/tables`, `POST /api/poker/tables`). ScoreData now tracks `spent` field.
- **night-hub**: Fixed app count (9 not 10), updated Night Store description, added `night-store` to APP_ICONS, fixed demo score to include night-store, NIGHT Balance label updated.
- **night-poker**: Dynamic WS URL (localhost vs Railway), live table loading from API with fallback, `submitCreateTable` posts to API, compiled artifacts committed, DEMO_TABLES IDs match API defaults.
- **night-print.svg**: Created Night Markets branded Printful design file, committed to night-store.
- **All 5 standalone repos** (night-fun, night-lend, night-work, night-save, night-biz): Updated proof-server 7.0.0 → 8.0.3 in package.json.
- **LAUNCH_ROADMAP.md**: Updated to 2026-05-08 truth with all phases and current state.

### Commits This Session
- `night-markets` main: `59d81b3` (store endpoints), `7cd8963` (poker WS + table API)
- `night-store` main: `d3bb2b0` (shopper UI + night-print.svg)
- `night-hub` master: `c4938c8` (app count, descriptions, icons)
- `night-poker` main: `c1b98d6` (live tables, dynamic WS, compiled artifacts)
- `night-fun`, `night-lend`, `night-work`, `night-save`, `night-biz`: proof-server 8.0.3 fix

### Railway Status
- Auto-deploys from night-markets main ✅
- New endpoints live after redeploy: `/api/store/*`, `/api/poker/tables`, `/ws/poker/*`

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
2. **Night Hub live data** — wire active poker table count to hub UI (already in `/api/poker/tables`)
3. **Expose `spent` in action-score API** — add `available: s.total - (s.spent ?? 0)` to response
4. **Add `record-action` calls** in night-fun, night-lend, night-save, night-work, night-biz frontends
5. **Write NightID.compact** — the identity contract is the only missing contract

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
