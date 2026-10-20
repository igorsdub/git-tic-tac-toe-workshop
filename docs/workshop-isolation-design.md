# Workshop isolation design

This note records resolved domain decisions and questions that remain open for the reusable Game Wall.

## Resolved

- A **workshop** is one scheduled event. Its display name is separate from its stable **workshop ID**.
- Workshop IDs use `YYYY-MM-DD-short-lowercase-identifier` and remain unchanged once registrations exist.
- The SCDA GitHub & Version Control workshop is `SCDA Training Week`, scheduled for 2026-10-01. Its accepted ID is `2026-10-01-scda`.
- A **match** is one play-through of tic-tac-toe represented by a repository branch. Matches are discovered automatically from repository branches rather than registered individually.
- Any branch whose name starts with the literal lowercase prefix `match` qualifies as a match; there is no required dash or numeric suffix. The full branch name is the match label. For example, `match01`, `match-01`, `match02`, and `match-test` all qualify.
- Every match belongs to exactly one workshop. A workshop link shows only that workshop's matches. Older workshops remain accessible through an archive selector; there is no mixed all-workshops default view.
- The organizer explicitly marks a workshop archived. Archiving moves it into the archive selector, while its dashboard remains viewable and continues receiving repository and match updates; archiving does not freeze or snapshot it. Archived workshops reject new repository registrations, but existing registrations may be updated, including player handles.
- One workshop selector lists active workshops first and archived workshops grouped below. Selecting a workshop opens its stable workshop-specific URL.
- The main dashboard URL shows a default workshop explicitly designated by the organizer. Workshop-specific URLs always select their own workshop and remain stable when the designated default changes.
- Keep GitHub issue-form registration. Give each workshop a distinct registration URL that prefills its stable workshop ID; multiple workshop links are supported.
- Registration requires a workshop ID from the configured list. Missing or unknown IDs are rejected; there is no fallback or default workshop.
- A registration connects a repository to a workshop and supplies two player GitHub handles for avatars. The repository is what the dashboard watches.
- Each registration identifies a repository to scan. On every dashboard refresh, discover all branches whose names start with `match`.
- Each matching branch becomes a separate dashboard entry showing the repository, player handles and avatars, and full branch name. Read the board from that branch, not from `main`.
- A registered repository with no matching branches has no dashboard entries. Confirm registration acceptance in an issue comment; an entry appears on a later successful refresh once a matching branch exists. Apply this same discovery behavior to the five migrated SCDA repositories.
- When a matching branch is deleted, remove its entry on the next successful refresh. A temporary fetch failure retains the last known entry rather than treating it as deleted.
- A repository belongs to only one workshop. Registering the same repository with another workshop is rejected. The intended workflow for a new workshop is to make a fresh copy of the template.
- Repeating registration of the same repository for the same workshop updates the existing registration, including its two player handles; it does not create another dashboard entry.
- For valid registration issues for the same repository and workshop, the most recently created issue supplies the player handles. Participants submit the form again to correct handles; editing an older issue does not outrank a newer one.
- Every registration issue receives an automated comment stating whether it was accepted or rejected and why. Rejection examples include a missing or unknown workshop ID and a repository already assigned to another workshop.
- Migrate the five legacy entries labeled `SCDA Training Week` to workshop ID `2026-10-01-scda`. Keep the unclassified `Default Event` entry out of workshop dashboards pending review, and preserve it rather than deleting it.

## Deferred

- Future workshop names and date mappings remain unconfirmed and can be supplied as configuration data when known.
