# Night Ecosystem — Current Sprint

**This file is the session handoff document.**
Every Claude session working on the Night ecosystem must:
1. Read this file first
2. Read `LAUNCH_ROADMAP.md` in `night-markets` repo
3. Pick the next unchecked item from the roadmap
4. Update this file before ending the session

---

## Last Session Summary (2026-05-13 — context 3)

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
