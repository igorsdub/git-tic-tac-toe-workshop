# Workshop isolation implementation plan

This plan turns the accepted decisions in [the design note](workshop-isolation-design.md) into reviewable implementation slices. The work remains unimplemented. Future workshop names and date mappings are configuration data to add once confirmed.

## 1. Add workshop configuration and selection

- Add a static workshop catalog under `docs/`, which is the GitHub Pages publishing root. Give each workshop its stable ID, display name, active or archived status, and registration-form URL. Keep the organizer-designated default explicit. Add only the confirmed `2026-10-01-scda` mapping initially.
- In `docs/index.html` and `docs/app.js`, add one accessible selector with active workshops first and archived workshops grouped below. Use a stable workshop-specific URL (recommended: a `workshop` query parameter) so a selected workshop remains selected if the main URL's default changes. Filter every card and count by that workshop; never render a cross-workshop default.
- Build each workshop's issue-form link to prefill its stable ID. Remove the fixed SCDA label from the page footer and demo data paths where it is presented as the current workshop. Keep demo records clearly confined to demo mode.

## 2. Change registration from match submissions to repository submissions

- Update `.github/ISSUE_TEMPLATE/register-game.yml` to collect repository URL, required workshop ID, and the two player handles. Remove the match-branch input and describe registration of a pair repository. Create one prefilled link per configured workshop.
- Refactor `scripts/game_wall_parser.py` to validate repository identity, configured workshop ID, and both handles without requiring a match branch. Missing and unknown workshop IDs have no fallback. Preserve the literal lowercase `match` prefix rule for branch discovery rather than validating a branch in the issue parser.
- Refactor `scripts/sync_board_registry.py` to build one registration per repository/workshop pair in a repository-level snapshot such as `docs/registrations.json`; keep `docs/board.json` as the generated per-branch snapshot. Seed ownership with the five legacy SCDA repositories, then reject a repository assigned to another workshop. A repeat for the same workshop updates its handles without creating another registration. Among valid issues for the same pair, use issue creation time—not edit time—to choose the newest handles. Keep the proposed tie-break as ascending issue number if timestamps are equal.
- Implementation recommendation for two simultaneous first-time claims on the same repository: process unowned-repository claims by issue creation time ascending, then issue number ascending; the first valid workshop assignment owns the repository and later cross-workshop claims are rejected. Same-workshop handle selection still uses the newest valid issue.
- Bootstrap the five existing `SCDA Training Week` rows from `docs/board.json` onto `2026-10-01-scda` in the registration snapshot or a small migration seed before replacing the legacy name-based issue interpretation. Their five owner/repository pairs are distinct. Keep their handles; do not invent branch values or reject their legacy issues for lacking the new ID. Confirm those five as accepted migrations in issue feedback. Preserve the `Default Event` row separately; explain that it remains unclassified and excluded pending review without deleting it.
- Archived workshops accept updates for already registered repositories, including handles, and reject new repositories. Add an acceptance or rejection comment to every registration issue with a concise reason. Give the workflow `issues: write`; use one identifiable bot comment per issue and update it on reprocessing to avoid duplicate feedback.

## 3. Discover branches and reconcile the live match snapshot

- Keep repository registrations (`docs/registrations.json`) separate from the per-match snapshot (`docs/board.json`). For each accepted repository, enumerate and paginate its branches, then select every case-sensitive name beginning with `match` (including a branch named exactly `match`). For each match branch, create one card record carrying `workshopId`, repository URL, player handles, and the full branch name. Read `BOARD.txt` from that exact branch.
- Reconcile on successful branch-list responses only: remove a prior card when its branch is absent from a complete successful listing; retain prior cards for a repository whose branch listing failed. If the branch exists but its board fetch fails, keep its card and report the board error without interpreting the failure as branch deletion.
- The current page is static and `docs/app.js` polls the generated `docs/board.json` every 30 seconds. Extend `.github/workflows/sync-registrations.yml` to run on registration events, manual dispatch, and a short scheduled interval (recommend five minutes). Each successful registry sync enumerates branches; the page poll then picks up the generated snapshot. This gives new branches eventual visibility without unauthenticated GitHub API calls on every visitor's browser refresh.
- Preserve the unclassified `Default Event` record in a separate non-dashboard legacy file, such as `docs/unclassified-registrations.json`; exclude it from configured workshops and the generated dashboard snapshot until it is reviewed. Do not infer branches for it.

## 4. Update the learner and facilitator contract

- Update `LEARNER_GUIDE.md`, `FACILITATOR_GUIDE.md`, `README.md`, and `CONTEXT.md` to say that a pair registers its repository once for a workshop, match branches beginning with `match` appear automatically, and each card represents one branch. Remove instructions to register every branch or provide a branch in the form.
- Explain that a successful registration comment confirms the repository/workshop link; the dashboard card appears after a successful refresh finds a matching branch. Include the workshop-specific registration link in the relevant guides.
- Keep the legacy migration note accurate: five distinct SCDA repositories map to `2026-10-01-scda`; the unclassified record remains preserved and excluded pending review.

## 5. Test and inspect the delivered behavior

- Extend `tests/test_game_wall_parsing.py` for required, configured, missing, and unknown workshop IDs, repository-only submissions, and player-handle parsing.
- Extend `tests/test_sync_board_registry.py` with repeat issue precedence, competing first-time cross-workshop claims, archived update versus new-repository rejection, automated feedback outcomes, legacy migration, and branch discovery over multiple repositories. Stub branch enumeration and board reads so the cases remain deterministic.
- Extend `tests/test_match_data.js` for the accepted prefix examples (`match01`, `match-01`, `match02`, `match-test`) and for unrelated or uppercase names being excluded. Cover board reads from each exact branch and the distinct full-name labels.
- Extend `tests/test_dashboard_dom.cjs` to verify selector ordering, stable workshop URL selection, workshop-only cards/counts, empty state when no matching branch exists, card removal after a successful listing no longer includes a branch, and retention after a simulated fetch failure. Update `tests/test_web_guides.py` for the revised learner instructions.
- After the focused tests pass, open the rendered Pages site with fixture data. Check the selector and archive grouping, cards from two workshops, a repository with multiple matching branches, the no-match empty state, stale cards during a fetch error, and a branch disappearing after a successful refresh. Confirm the preserved unclassified row never appears in a workshop view.

## Sequence and implementation notes

Implement configuration and selection first, then issue parsing and ownership validation, then branch discovery and snapshot reconciliation, followed by guide updates and rendered review. Each slice should leave the snapshot schema and URL contract reviewable before the next slice builds on it.

The existing workflow listens to issue `opened`, `edited`, `labeled`, `closed`, and `reopened` events and currently has `issues: read`; comment permissions and repeated event handling need an idempotent design. The current parser rejects every branch name except `match-` followed by at least two digits, and `docs/match-data.js` applies the same narrow pattern. The current frontend clears all cards if a registry fetch fails. These are direct implementation points for the accepted prefix, comment, and last-known-entry behaviors.
