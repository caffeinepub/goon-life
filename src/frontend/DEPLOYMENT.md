# Deployment Checklist

## Pre-Deployment Verification

### One-Click Matchmaking Flow
- [ ] Verify backend `findMatch` function correctly handles both multiplayer (`startSolo: false`) and solo (`startSolo: true`) modes
- [ ] Confirm multiplayer queue logic: first call adds to queue (returns `null`), second call creates match (returns `MatchState`)
- [ ] Confirm solo logic: always returns a `MatchState` immediately (never queues)
- [ ] Test that calling `findMatch(false)` twice from the same principal returns `null` on second call (not a trap)

### Frontend UI Flow
- [ ] "Play" button (multiplayer): First click shows "Waiting for opponent" state, second player's click creates match for both
- [ ] "Play Solo" button: Always creates match immediately and shows "Fight!" button (never shows waiting state)
- [ ] "Fight!" button appears only when `currentMatch` is non-null
- [ ] Combat resolution (`resolveCombat`) works for both multiplayer and solo matches
- [ ] Points and leaderboard update correctly after combat resolution

### Error Handling
- [ ] Queue-related errors (e.g., "already in the queue") display user-friendly messages
- [ ] Solo match creation failures show appropriate error (not queue-related messaging)
- [ ] All error toasts use English text

## Post-Deployment Verification

### Solo Flow (Critical Fix)
- [ ] Log in with Internet Identity
- [ ] Click "Play Solo"
- [ ] Verify: Match is created immediately (no waiting/queued UI shown)
- [ ] Verify: "Fight!" button appears right away
- [ ] Click "Fight!" and verify combat resolves successfully
- [ ] Verify: No "already in queue" error appears during solo flow

### Multiplayer Flow
- [ ] Log in with first account, click "Play"
- [ ] Verify: "Waiting for opponent" message appears
- [ ] Log in with second account (different browser/incognito), click "Play"
- [ ] Verify: Both users see "Match found!" and "Fight!" button
- [ ] Both users can click "Fight!" and see combat results
- [ ] Verify: Points update correctly for both players

### Edge Cases
- [ ] User in multiplayer queue can still click "Play Solo" and get a solo match
- [ ] User cannot create multiple matches simultaneously
- [ ] Refreshing page clears local match state (user can start fresh)
- [ ] Logging out clears all cached data including match state

## Rollback Plan
If critical issues are found:
1. Note the specific error message and reproduction steps
2. Revert to previous version if blocking gameplay
3. Fix identified issues in development environment
4. Re-test full checklist before re-deploying
