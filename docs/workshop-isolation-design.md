# Workshop isolation design

This note records resolved domain decisions and questions that remain open for the reusable Game Wall.

## Resolved

- A **workshop** is one scheduled event. Its display name is separate from its stable **workshop ID**.
- Workshop IDs use `YYYY-MM-DD-short-lowercase-identifier` and remain unchanged once registrations exist.
- The SCDA GitHub & Version Control workshop is `SCDA Training Week`, scheduled for 2026-10-01. Its accepted ID is `2026-10-01-scda`.
- A **match** is one play-through of tic-tac-toe represented by a repository branch. Matches are discovered automatically from repository branches rather than registered individually.
- Any branch whose name starts with the literal lowercase prefix `match` qualifies as a match; there is no required dash or numeric suffix. The full branch name is the match label. For example, `match01`, `match-01`, `match02`, and `match-test` all qualify.
- Every match belongs to exactly one workshop. A workshop link shows only that workshop's matches. Older workshops remain accessible through an archive selector; there is no mixed all-workshops default view.
- The main dashboard URL shows a default workshop explicitly designated by the organizer. Workshop-specific URLs always select their own workshop and remain stable when the designated default changes.
- Keep GitHub issue-form registration. Give each workshop a distinct registration URL that prefills its stable workshop ID; multiple workshop links are supported.
- Registration requires a workshop ID from the configured list. Missing or unknown IDs are rejected; there is no fallback or default workshop.
- A registration connects a repository to a workshop and supplies two player GitHub handles for avatars. The repository is what the dashboard watches.
- A repository belongs to only one workshop. Registering the same repository with another workshop is rejected. The intended workflow for a new workshop is to make a fresh copy of the template.
- Repeating registration of the same repository for the same workshop updates the existing registration, including its two player handles; it does not create another dashboard entry.

## Open

- The exact issue-form field name for the workshop ID is an implementation choice. Existing learner and delivery documentation describes repository, numbered branch, and player-handle fields for individual match registrations; that predates the resolved repository-level registration model.
- What determines which workshops appear in the archive selector and how that selector behaves.
- How competing repeat-registration issues are ordered or resolved, and how existing registrations are handled during migration, remain open.
