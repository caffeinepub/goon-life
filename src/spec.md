# Specification

## Summary
**Goal:** Fix Solo matchmaking so it creates a solo match immediately (no queue) and prevent queue-related “already in queue” errors from blocking Solo or multiplayer retry flows.

**Planned changes:**
- Backend: Update `findMatch(true)` to immediately create and return a `MatchState` where `player1 == player2 == caller`, store it in `activeMatches`, and never enqueue the caller.
- Backend: Update `findMatch(false)` so repeat calls while already queued do not trap; instead return `null` (waiting) and remove the “already in queue” trap behavior.
- Frontend: Adjust “Play Solo” flow to avoid any waiting/queued UI state and to set `currentMatch` immediately so “Fight!” is available without queue error messaging.
- Deploy the updated backend and frontend so production reflects the fixed Solo behavior.

**User-visible outcome:** Users can click “Play Solo” and then “Fight!” right away without seeing the multiplayer queue “already in queue” error, and clicking “Play” multiple times while queued no longer shows an error (it stays in a waiting state).
