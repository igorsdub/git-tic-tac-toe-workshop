# Consolidation plan (2026-10-22)

Based on the 2026-10-22 review of the workshop materials and site. Work is split into
work packages (WP) that run in separate sessions. Each WP owns a disjoint set of files so
sessions never write the same file. Within a session, fan-out across many files may run as a
dynamic workflow.

Deadlines: SOKEDAI 2026-11-06, RIKEN 2026-11-10. Learner-facing packages (WP2, WP1) come first.

## Assumptions

The seven review questions were not answered. Each WP works under these assumptions. If one
is wrong, only the WPs that cite it change.

| # | Assumption |
|---|---|
| A1 | The current guides are the truth. `WORKSHOP_DESIGN_HANDOFF.md` is a historical record. One registration per repository per workshop. Learners create a public repo from the template before the session, keep it, and stop (not delete) the Codespace. |
| A2 | The SOKEDAI survey link in `docs/workshops.json` is intentional and live. Written docs that call the survey unpublished are stale. |
| A3 | RIKEN runs the same design as SOKEDAI: Codespaces track, Copilot, no pull requests, 120-minute agenda. The RIKEN plan's divergences (own laptops, any LLM, PRs, two sessions) stay in the RIKEN folder as open points and are not merged into shared docs. |
| A4 | `MISSION.md`, `NOTES.md`, `RESOURCES.md`, `learning-records/`, `lessons/`, `reference/` are facilitator-training artefacts, not workshop material. They move, they are not deleted. |
| A5 | The slide deck stays in use and is made workshop-neutral. |
| A6 | The registry bot keeps pushing to `main`. No branch protection. Tests run in CI on pull requests and pushes. |
| A7 | "Copilot Ask" wording is stale. The readiness check uses Copilot Chat. |
| A8 | Workshop names are written RIKEN and SOKEDAI in capitals everywhere. SCDA Training Week stays as is (archived). |

## Canonical wording

Every WP uses these. No WP invents alternatives.

- Workshop names: SOKEDAI, RIKEN, SCDA Training Week.
- Pages: Setup page (`docs/setup.html`), How to play (`docs/guide.html`), Game Wall (`docs/index.html`). "Game Wall" with capital W. Never "dashboard" in learner text.
- Documents: Learner guide (`LEARNER_GUIDE.md`), Facilitator guide (`FACILITATOR_GUIDE.md`), Pre-session checklist (`PRE_SESSION_CHECK.md`), Rehearsal guide (`REHEARSAL_GUIDE.md`), Glossary (`GLOSSARY.md`).
- Board: `BOARD.txt`, three rows of three single-space-separated cells, `.` `X` `O`.
- Match branch: any branch starting with lowercase `match`; teaching example `match-01`, next `match-02`, created from clean `main`. Never merged back.
- Registration: a pair registers its shared repository once per workshop with both GitHub handles. Match branches are discovered automatically.
- Turn cycle, five steps using Source Control button names: Pull, edit one cell and save, stage with +, Commit with a clear message, Sync Changes. "Sync Changes" everywhere, never "Push" as a step name.
- Readiness check: open Copilot Chat, type exactly "What does this repository do?", passes when the answer mentions tic-tac-toe and `BOARD.txt`.
- Pre-session steps: create a public repository from the template under your own account, open it in a Codespace, run the readiness check, stop the Codespace, keep both.
- Copilot: "Copilot" for the product, "agent mode" for the editing mode, "agent-assisted rematch" for the phase, "Copilot demonstration" for the instructor demo.
- People: "learner" in facilitator and maintainer docs, "you" in learner docs, "partner" and "pair" for the two players.
- Rewind / alternative history: instructor extension only. Not in learner pages.
- Agenda: 10/15/15/30/10/25/15 minutes, boundaries 10/25/40/70/80/105/120. Pair play is 55 minutes. Rematch starts at minute 80. Early finishers may play one optional extra manual match.

## Work packages

### Wave 1 (parallel, disjoint files)

#### WP2 Learner pages and catalog
Files owned: `docs/index.html`, `docs/setup.html`, `docs/guide.html`, `docs/setup.js`, `docs/workshops.json`, `.github/ISSUE_TEMPLATE/register-game.yml`, `tests/test_web_guides.py`, `tests/test_setup_dom.cjs`, `tests/test_setup_unit.cjs`, `tests/test_dashboard_dom.cjs`.
Do:
- Catalog: names to SOKEDAI and RIKEN. Give RIKEN `setupTrack: "codespaces"` (A3). Remove hard-coded SCDA hrefs from `index.html` and `guide.html`; static fallback points at the default workshop. Issue-form placeholder uses the default workshop id.
- `guide.html`: five-step turn cycle with canonical wording; remove the Rewind section; next-match text says "the next numbered match", not `match-02`; Copilot fallback wording matches `LEARNER_GUIDE.md` ("follow the instructor's Copilot demonstration").
- `setup.html`: one `h1` (page title; brand becomes a link, not a heading); `h2` for each step, `h3` inside; add a skip link; add `<script src="theme-init.js">` as the first script in `<head>` on all three pages (WP4 creates the file); catalog-load failure shows a visible message, not only the hidden status element.
- Setup for a workshop without a `setupTrack`: either real general content or drop the README claim. With A3 every active workshop has a track, so the "pending" view becomes "Setup for this workshop is not published yet" and README WP1 drops the "general content" sentence.
- `index.html`: one `h1`; filter buttons use `role="tab"` or drop `role="tablist"`; spinner gets `aria-live="polite"`.
- Videos: add `<track kind="captions">` or `aria-describedby` text.
Don't: touch `app.js`, `styles.css`, markdown files, slides.
Done: `npm test` passes; each of the three workshop URLs renders the right name and setup view; no "SCDA" string in HTML except archived catalog data.

#### WP3 Slides
Files owned: `docs/slides/**`, `tests/test_slides.py`.
Do: remove "SCDA training week" from the title and all footers (neutral "Git Tic-Tac-Toe Workshop"); `board.txt` to `BOARD.txt`; replace CLI `git add` / `git commit` slides with Source Control UI wording (Stage, Commit, Sync Changes); footer counter computed in `slides.js` from slide count; hash navigation (`#slide-7`) so a slide can be linked; keyboard-reachable stage (button or tabindex); fix the ~1.5:1 placeholder colour; merge the duplicate panel on slides 2 and 3.
Done: `python3 -m unittest tests/test_slides.py` passes after updating expectations; no `SCDA` or `board.txt` string in the deck.

#### WP7 Repository layout
Files owned: everything moved below, `README.md` links only, `tests/test_rehearsal_readiness.py`, `docs/adr/0001*`, `docs/adr/0003*`, `.gitignore`.
Do:
- Move out of `docs/` (they ship to Pages): `delivery-status-2026-10-20.md`, both `rehearsal-evidence-*.md`, `load_test_simulation.md`, `workshop-isolation-design.md`, `workshop-isolation-implementation-plan.md`, `workshop-site-revision.md`, `research/`, `riken-2026-11-10/` into `planning/` (commit the RIKEN folder; it is untracked today).
- Move `MISSION.md`, `NOTES.md`, `RESOURCES.md`, `learning-records/`, `lessons/`, `reference/`, `assets/` into `facilitator-training/` (A4).
- Add "Status: superseded by ADR 0004" to ADR 0001 and 0003. Note in `workshop-isolation-implementation-plan.md` that it is implemented (commit 8de66b8).
- Delete empty `template-spec/`. Confirm `.playwright-auth.json` stays ignored and add a line to `scripts/capture/README.md` saying it holds live cookies.
- Update README links and the readiness test's path list. Nothing else in README.
Don't: edit the body text of any moved file; edit any other markdown prose (WP1 owns it).
Done: `git mv` history preserved; `npm test` passes; `ls docs` shows only site files, `adr/`, `images/`, `slides/`, JSON.

#### WP4 Site JavaScript and CSS
Files owned: `docs/app.js`, `docs/match-data.js`, `docs/guide-utils.js`, `docs/workshop-context.js`, `docs/stage-strip.js`, `docs/styles.css`, new `docs/theme-init.js`, `tests/test_match_data.js`, `tests/test_board_grammar.cjs`, `tests/test_stage_strip.cjs`.
Do:
- Delete dead code: `extractRepoInfo`, `parseRegistrationIssue` in `app.js`; `canRefreshMatchBoard`, `boardUrl`, `refreshMatchBoard` in `match-data.js` and their tests; `copyToClipboard`, `initCopyButtons` in `guide-utils.js`; unused CSS classes (`.role-grid`, `.role-card`, `.step-card`, `.turn-flow`, `details.accordion`, `.accordion-content`, `.guide-table*`, `.sr-only`, `.nav-link`, `.copy-btn*`); duplicate `.brand-link` and `.history-state` rules; `state.isLoading`.
- One theme module: `theme-init.js` sets `data-theme` before paint from localStorage or `prefers-color-scheme`, wrapped in try/catch; `app.js` and `guide-utils.js` call it instead of their own copies. Remove the duplicate storage key definition.
- One date formatter shared by `workshop-context.js` and (via a small export) `setup.js`; WP2 owns `setup.js`, so expose the helper on `window.WorkshopContext` and leave the `setup.js` call site for a one-line follow-up.
- Polling: in-flight guard, no spinner on background refresh (only on first load), pause on `visibilitychange` hidden, `AbortController` with timeout.
- Guard every localStorage access; `init()` must reach listeners and polling even if storage throws.
- Board grid: add `role="row"` wrappers.
- From the WP2 handover: add a `.skip-link` rule (visually hidden until focused) because `setup.html` now has one and it is always visible; add a `.brand-title` rule reproducing the old brand `h1` look (hover and dark-theme variants under `.brand-text`) so the inline `style` on the brand span in `guide.html` and `setup.html` can go in a one-line WP2 follow-up; style `h2.step-heading` and the `h3` inside steps on the Setup page and delete the dead `.setup-step h4` rule.
- CSS: link colour to at least 4.5:1 on `#f9fafb` and `#ffffff`; `prefers-reduced-motion` disables pulse and spin; give `--text-muted` a real muted value; add `@media (prefers-color-scheme: dark)` defaults as a fallback for no-JS.
Don't: change HTML files or `setup.js` (WP2); change parsing logic in `evaluateBoardContent` (WP5).
Done: `npm test` passes; `node --check` on every file; no function in `docs/*.js` without a call site outside tests.

#### WP6 CI and tooling
Files owned: `.github/workflows/ci.yml` (new), `.github/workflows/sync-registrations.yml`, `.editorconfig`, `.nvmrc`, `package.json` scripts only, `pyproject.toml` (new, ruff config only).
Do: CI workflow on pull_request and push to `main` running `npm test` with Chromium installed so the DOM tests run, Node 20, Python 3.12 (match `sync-registrations.yml` by raising it to 3.12 too); `ruff check` for `scripts/` and `tests/` with `[tool.ruff.lint] select = ["E4", "E7", "E9", "F"]` pinned in `pyproject.toml` (ruff 0.17 widened its defaults to 77 findings here; widening the set is a later decision); deploy job in the sync workflow skips when the sync commit made no change (output from the publish step); `.editorconfig` (2 spaces JS/HTML/CSS/JSON, 4 spaces Python, LF, final newline); `.nvmrc` 20.
Don't: add branch protection; add ESLint or Prettier (keep tooling minimal); change Python source beyond what ruff flags as errors (report warnings, do not fix).
Done: workflow YAML validates with `actionlint` if available, otherwise by a dry read; `npm test` still passes locally.

### Wave 2 (after wave 1 lands on main)

#### WP1 Written materials, single source of truth
Depends on WP7 (paths). Files owned: `tests/test_web_guides.py` (handed over from WP2: its markdown-contract test reads `CONTEXT.md` and asserts "five legacy SCDA repositories" in README, so WP1 updates it), `README.md`, `LEARNER_GUIDE.md`, `FACILITATOR_GUIDE.md`, `PRE_SESSION_CHECK.md`, `REHEARSAL_GUIDE.md`, `SURVEY.md`, `WORKSHOP_DESIGN_HANDOFF.md`, `GLOSSARY.md`, `CONTEXT.md`, `template/README.md`, `docs/adr/0002*`, `planning/riken-2026-11-10/*`, `facilitator-training/*.md`.
Do:
- Merge `CONTEXT.md` into `GLOSSARY.md` (one glossary, canonical wording above); delete `CONTEXT.md`; update links. Drop the deployment note from the glossary into README.
- Agenda lives once, in `FACILITATOR_GUIDE.md`. README links to it. Add the optional extra match sentence there. Fix or remove the 60-minute and 20-minute claims in the moved `MISSION.md` and `NOTES.md`.
- `WORKSHOP_DESIGN_HANDOFF.md`: banner "Historical record, superseded 2026-10-22 by the guides"; README calls it "Design history", not "Current design handoff".
- Readiness check and pre-session steps use canonical wording in README, Learner guide, Facilitator guide, Pre-session checklist, Rehearsal guide. `PRE_SESSION_CHECK.md` links to the Setup page and gains the stop-Codespace step.
- Learner guide turn cycle to five steps with Sync Changes. Remove the SCDA example link; link to the Game Wall's Register button instead.
- Survey: README and `PRE_SESSION_CHECK.md` say the survey is live for SOKEDAI (A2). Reconcile `SURVEY.md` with the ten-question RIKEN draft: keep one `SURVEY.md`, mark the RIKEN draft as proposed additions with a question to the organiser.
- RIKEN plan: add an "Open points" section listing own-laptop, any-LLM, PR, and two-session divergences (A3) so they are visible, not silently dropped.
- ADR 0002 and the glossary describe the Setup page as it is now (Codespaces track), not Git install and `gh auth`.
- Names to SOKEDAI and RIKEN. Resolve "setup guide" and "learner guide" ambiguity with the canonical document names.
- `RESOURCES.md` (moved): remove claims about content that does not exist (triage protocol, OS matrix, command reference, GitHub Desktop).
Don't: edit HTML, JS, CSS, slides, workflows.
Done: `python3 -m unittest tests/test_rehearsal_readiness.py` passes; `grep -ril "ask readiness\|copilot ask\|register each match\|board\.md" *.md docs/adr` returns nothing; every agenda number appears in exactly one file.

#### WP5 One board grammar, two implementations
Depends on WP4. Files owned: `docs/app.js` (only `evaluateBoardContent` and helpers), `scripts/validate_board.py`, `tests/fixtures/`, `tests/test_board_grammar.cjs`, `tests/test_validate_board.py`.
Do: add `tests/fixtures/board-grammar/*.json` cases (content, expected validity, expected winner, expected reason) and run both validators against the same fixtures; add placeholder-handle detection to the JS side or drop it from Python so the two agree; replace the string-replace hook in `test_board_grammar.cjs` with an explicit export guard like `match-data.js` uses.
Done: both test files iterate the shared fixtures; a deliberately broken fixture fails both.

### Wave 3 Verification (here, not a session)
Full `npm test` with Chromium; open each workshop URL (`?workshop=2026-11-06-sokedai`, `?workshop=2026-11-10-riken`, `?workshop=2026-10-01-scda`) and check name, setup view, register link; walk the Setup page as a learner; run the sync workflow once by dispatch and confirm the deploy gate.

## Environment notes

- `/opt/homebrew/bin/chromium` is a broken wrapper and makes the DOM tests skip silently. Run `CHROMIUM_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm test`.
- Wave 1 is merged into `main` as of 2779358 (WP7 c9142e0, WP2 ee1b2a2, WP3 fc77912, WP6 8379c1c, WP4 2779358); full suite and ruff green. Wave 2 may start.

## Session rules

- One session per WP, branch `claude/<wp-slug>`, commit on that branch, never push, never switch branches.
- A session edits only the files its WP owns. If it needs a file another WP owns, it stops and reports.
- Each session ends with: files changed, tests run with output, anything it could not do.
- Wave 2 starts only after every wave 1 branch is merged into `main`.
