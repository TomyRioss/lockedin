# SPEC — lokin

## §G Goal
Web app track work sessions: clock in/out + breaks, minimal black/white UI (black dominant).

## §C Constraints
- style: minimalist, black/white, black dominant
- storage: db needed for sessions/breaks history + metrics (NeonDB, user configs conn)
- next.js custom version — check node_modules/next/dist/docs/ before code (AGENTS.md)
- single active session per user at a time (clock in blocks second clock in)

## §I External surfaces
- I.ui: clock in/out button, break in/out button, live timer display
- I.api: POST /api/clockin, POST /api/breakin, POST /api/breakout, POST /api/clockout
- I.db: NeonDB — tables sessions, breaks
- I.metrics: view/list past sessions w/ total work time, total break time

## §V Invariants
V1|clock in start main timer, only 1 active session per user
V2|break in pause main timer, start break timer
V3|break out stop break timer, save break duration, resume main timer
V4|clock out stop main timer, save session: work duration = total - sum(breaks), persist all breaks
V5|no break in/out allowed without active clocked-in session
V6|no clock out allowed while break active (must break out first)
V7|all session/break records persist in db for later query/metrics

## §T Tasks
id|status|desc|cites
T1|x|setup NeonDB conn + schema (sessions, breaks tables)|I.db
T2|x|api POST /api/clockin — create session row, validate V1|V1,I.api
T3|x|api POST /api/breakin — create break row, validate V5|V2,V5,I.api
T4|x|api POST /api/breakout — close break row, validate V3|V3,I.api
T5|x|api POST /api/clockout — close session, compute work time, validate V4,V6|V4,V6,I.api
T6|x|ui main timer + clockin/clockout button|V1,I.ui
T7|x|ui break timer + breakin/breakout button|V2,V3,I.ui
T8|x|ui styling minimalist black/white black dominant|I.ui
T9|x|metrics page — list sessions, work time, break time|I.metrics

## §B Bugs
id|date|cause|fix
