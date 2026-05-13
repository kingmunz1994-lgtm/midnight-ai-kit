# Night Ecosystem — Current Sprint

**This file is the session handoff document.**
Every Claude session working on the Night ecosystem must:
1. Read this file first
2. Read `LAUNCH_ROADMAP.md` in `night-markets` repo
3. Pick the next unchecked item from the roadmap
4. Update this file before ending the session

---

## Last Session Summary (2026-05-13 — continued)

### What Was Done
**Previous work (same calendar date, earlier context):**
- `nightid-api.ts`: Added `spent` + `available` to action-score endpoint
- `night-hub`: live poker table count, `available` NIGHT balance
- All 5 standalone app frontends: `recordAction` wired for all major actions
- `night-poker` deploy.ts: fixed `pathToFileURL` (Windows ESM) + `privateStoragePasswordProvider` (new SDK requirement)

**This context — Night Poker Tier 1 UX (commit `3ff3969`):**
- **sounds.js** (`public/js/sounds.js`): `NightSounds` object — Web Audio API engine, zero audio files. Covers: `deal`, `shuffle`, `chip`, `yourTurn`, `fold`, `check`, `call`, `raise`, `allIn`, `win`, `newCard`, `tick`, `toggle`.
- **history.js** (`public/js/history.js`): `NightHistory` object — tracks last 20 hands in localStorage. Session stats: hands played, win%, VPIP%, biggest pot. Renders hand history modal + provably fair panel.
- **game.js**: Integrated sounds at every action point. `flyChip()` animation (chip flies from seat to pot center). `NightHistory.addHand()` called on showdown and walkover. `yourTurn` sound + 5-second countdown ticks. Session stats strip show/hide. Added missing `checkStreetOver()` function.
- **index.html**: 🔊 sound toggle + 📋 History buttons in nav. Session stats mini-strip (hands/win%/VPIP/best-pot) + ⊘ Verify Fair button. Provably Fair modal (XOR key + SHA-256 commitment + hole cards + explanation). Hand History modal (last 20 hands). Script tags for sounds.js and history.js added before game.js.

### Commits This Session
- `night-poker` main: `3ff3969` (Tier 1 poker UX — sounds, history, stats, fair panel, chip animations)
- `night-poker` main: `c3cabe3` (privateStoragePasswordProvider fix)
- `night-poker` main: `8793840` (pathToFileURL ESM fix)

### Night Poker Deploy Status
- deploy.ts is fixed and ready (two SDK patches applied)
- User was running `npx tsx scripts/deploy.ts` with Docker proof server active
- CONTRACT_ADDRESS not yet received — user needs to paste output when deploy completes
- When received: update `.env`, `CLAUDE.md` contracts table, wire commitHand/claimPot in nightid-api.ts

---

## Next Session — Pick Up Here

### Priority order:

**1. Night poker contract address** (if user has output from `npx tsx scripts/deploy.ts`):
- Record `CONTRACT_ADDRESS=<addr>` in night-poker `.env`
- Update CLAUDE.md contracts table
- Wire `commitHand` / `claimPot` in `nightid-api.ts` WS handler

**2. Night Hub leaderboard** (Phase 6 — no Docker needed):
- In `night-hub/public/js/hub.js`, query `GET /api/nightid/leaderboard?limit=10` (needs to be created in nightid-api.ts first)
- In `nightid-api.ts`: add `GET /api/nightid/leaderboard` — reads Redis sorted set `night_score` top-N, returns `[{address, score}]`
- Render table in hub dashboard

**3. Test night-store Printful integration** (Phase 5):
```
POST https://night-markets-94-production.up.railway.app/api/store/checkout
{ "address": "test_addr", "items": [{"productId":"mug","size":"11oz","qty":1}], "shipping": {...} }
```

**4. If Docker available (Phase 3):**
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
