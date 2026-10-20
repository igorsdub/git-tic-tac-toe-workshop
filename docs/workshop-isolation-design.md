# Workshop isolation design

This note records resolved domain decisions and questions that remain open for the reusable Game Wall.

## Resolved

- A **workshop** is one scheduled event. Its display name is separate from its stable **workshop ID**.
- Workshop IDs use `YYYY-MM-DD-short-lowercase-identifier` and remain unchanged once registrations exist.
- The SCDA GitHub & Version Control workshop is `SCDA Training Week`, scheduled for 2026-10-01. Its accepted ID is `2026-10-01-scda`.
- A **match** is one separately registered play-through of tic-tac-toe. A pair may play multiple matches in one workshop. **Game** refers to the collaborative tic-tac-toe activity in general.

## Open

- How registration captures and validates a workshop ID.
- How the dashboard distinguishes registrations from simultaneous workshops and selects historical workshops.
- What default and archive behavior the dashboard should use.
- Whether a pair repository can be reused across workshops and how that affects match identity.
