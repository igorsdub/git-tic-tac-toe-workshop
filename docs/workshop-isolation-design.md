# Workshop isolation design

This note records resolved domain decisions and questions that remain open for the reusable Game Wall.

## Resolved

- A **workshop** is one scheduled event. Its display name is separate from its stable **workshop ID**.
- Workshop IDs use `YYYY-MM-DD-short-lowercase-identifier` and remain unchanged once registrations exist.
- The SCDA GitHub & Version Control workshop is `SCDA Training Week`, scheduled for 2026-10-01. Its accepted ID is `2026-10-01-scda`.
- A **match** is one play-through of tic-tac-toe represented by a repository branch. Matches are discovered automatically from repository branches rather than registered individually.
- Every match belongs to exactly one workshop. A workshop link shows only that workshop's matches. Older workshops remain accessible through an archive selector; there is no mixed all-workshops default view.
- Keep GitHub issue-form registration. Give each workshop a distinct registration URL that prefills its stable workshop ID; multiple workshop links are supported.
- A registration connects a repository to a workshop and supplies two player GitHub handles for avatars. The repository is what the dashboard watches.

## Open

- The workshop-ID field name and validation behavior remain undecided. Existing learner and delivery documentation describes repository, numbered branch, and player-handle fields for individual match registrations; that predates the resolved repository-level registration model.
- The exact naming grammar for match branches remains open; a `match-` prefix has been proposed.
- What determines which workshops appear in the archive selector and how that selector behaves.
- Whether a pair repository can be reused across workshops and how that affects match identity.
