# Project: Git Tic-Tac-Toe Workshop — SOKENDAI delivery

- Goal ID: `GTTT-SOKENDAI-2026`
- Revision: 1.2 — 2026-11-01
- Owner: igorsdub (workshop organiser)
- Lifecycle: draft
- Approval: unreviewed
- Delivery date: 2026-11-06 (workshop ID `2026-11-06-sokedai`)

This is the canonical requirements record for the SOKENDAI delivery. The existing guides ([Learner guide](LEARNER_GUIDE.md), [Facilitator guide](FACILITATOR_GUIDE.md), [Pre-session checklist](PRE_SESSION_CHECK.md), [Rehearsal guide](REHEARSAL_GUIDE.md), [Glossary](GLOSSARY.md)) describe the current workshop. Where they disagree with this PRD, this PRD states the intended outcome and the guides must be updated to match. The [design handoff](WORKSHOP_DESIGN_HANDOFF.md) stays a historical record.

## Problem and users

**Learners:** SOKENDAI researchers with mixed or no coding experience. They need to learn collaborative Git (pull, edit, review a diff, stage, commit, sync) and see how a coding agent fits into that workflow, without installing software or using a terminal.

**Facilitator/instructor:** runs a 120-minute session. The facilitator needs learners to arrive ready, pairs to reach their first synced move quickly, and a room display of every pair's progress.

Most of the materials already exist (see [Current state](#current-state-and-gaps)). Five problems remain:

- Creating the `match-01` branch is the hardest step for novices.
- The site header repeats the navigation that the stage strip already provides, and the register and view buttons appear twice.
- The Setup page videos don't work.
- Codespaces left running use up the learner's free monthly hours.
- The archived SCDA workshop shows an empty Game Wall.

## Desired outcome

On 2026-11-06 every SOKENDAI learner arrives with these things done:

- a GitHub account
- their own repository created from the template, which already contains `match-01`
- a Copilot answer seen in a Codespace
- that Codespace deleted

In the session, each pair picks one repository and plays a manual match on `match-01`, then an agent-assisted rematch, using only VS Code Source Control. They see their match on the Game Wall.

## Decisions

Settled with the owner on 2026-11-01. D2–D4 were revised in the second discussion and replace the rev 1.0 wording; see [Revision history](#revision-history).

| # | Decision |
|---|---|
| D1 | Scope is the SOKENDAI delivery only. RIKEN (2026-11-10) and its divergences (own laptops, any LLM, pull requests, two sessions) are out of scope; see [the RIKEN plan](planning/riken-2026-11-10/workshop-plan.md). |
| D2 | Before the session, each learner creates **their own public repository** from the template. They tick **Include all branches** and fill in the **Description** field. The learner keeps the repository. |
| D3 | Each learner opens their repository in a Codespace, checks Copilot, then **deletes the Codespace** (not the repository). Delete is chosen over stop because it is unambiguous and uses no Codespace hours. In the session, a fresh Codespace is opened on the chosen repository. |
| D4 | The template repository gets a `match-01` branch that is an exact copy of `main`, with an empty board. Learners never create `match-01` themselves. The template does not ship `match-02`; the rematch branch is still created from clean `main` in the session. |
| D5 | Pair roles: the pair chooses one prepared repository. Its owner invites the partner, plays X and moves first. |
| D6 | The 120-minute agenda in the Facilitator guide is unchanged. |
| D7 | Visual direction: monochrome and polished. Keep black/white and the system font. Header controls become bare SVG icons with no border. |
| D8 | Navigation: the header has two rows. Row 1 holds the X/O logo and title, the workshop selector, and at the far right the theme toggle and GitHub logo; it has no **How to play** or **Setup** buttons. Row 2 holds the numbered stage links (1 Setup, 2 How to play, 3 Game Wall) without subtitles, followed by an unnumbered **Register repository** link. Row 2 is the only page navigation. The page-level **Register repository** and **View all games** buttons on How to play and the Game Wall are removed. |
| D9 | The archived SCDA workshop is removed from the workshop drop-down. Its old registration issues are left untouched. |
| D10 | The Setup page uses step-by-step screenshots only. All videos are removed. |
| D11 | The "Switch to Demo Data" control stays visible. The facilitator uses it to show learners what a full Game Wall looks like. |
| D12 | Learner pages are English only. Board file stays the compact `BOARD.txt` ([ADR 0004](docs/adr/0004-compact-board-format.md)). History replay stays as an instructor demonstration. |
| D13 | Release gate: the owner's review and approval of the deployed site only. Other checks are recommended and tracked, not gating. |
| D14 | How to play gets text changes and a turn-cycle card now. Screenshots for How to play come later. |

## Requirements

Status: **keep** = exists and stays; **change** = exists and must change; **new** = does not exist yet. Priority: **must** ships by 2026-11-06; **should** is planned for 11-06 but may slip; **later** is deferred past 11-06.

### Template repository ([igorsdub/git-tic-tac-toe-template](https://github.com/igorsdub/git-tic-tac-toe-template))

| ID | Requirement | Status | Priority |
|---|---|---|---|
| TPL-01 | The template has a `match-01` branch identical to `main` (empty board). Publishing it is an outward-facing change and needs the owner's go-ahead at implementation time. | new | must |
| TPL-02 | `template/README.md` in this repository records that `match-01` ships with the template. | change | must |

### Header and navigation (all learner pages)

| ID | Requirement | Status | Priority |
|---|---|---|---|
| NAV-01 | Remove the **How to play** and **Setup** buttons from the header on every page (D8). | change | must |
| NAV-02 | Place the light/dark toggle at the far right of the header, next to the GitHub logo. Both are bare monochrome SVG icons with no border or square background, and they follow the theme. The 🌙 emoji goes. | change | must |
| NAV-03 | The stage strip moves into the header as its second row, under the logo and workshop selector, on every learner page. It reads 1 Setup, 2 How to play, 3 Game Wall, with the current page marked. Remove the subtitles ("Before the session", "In the session", "Watch the matches"). An unnumbered **Register repository** link at the end of the row opens the selected workshop's registration form in a new tab. | change | must |
| NAV-04 | Remove the action row with **Register repository** and **View all games** from How to play and the Game Wall. | change | must |
| NAV-05 | The workshop drop-down lists only non-archived workshops (D9). Archived workshops stay in the catalog data. How a direct `?workshop=2026-10-01-scda` link behaves does not matter (owner decision). | change | must |

### Setup page (`docs/setup.html`)

| ID | Requirement | Status | Priority |
|---|---|---|---|
| SET-01 | Step titles, in order: 0 **Fill in the survey**, 1 **Create a GitHub account**, 2 **Create your repository from the template**, 3 **Open it in Codespaces**, 4 **Check Copilot**, 5 **Clean up your Codespace**. | change | must |
| SET-02 | Keep the numbered step icons. Remove the dark grey background panel behind the step cards so that fewer divider layers remain. | change | must |
| SET-03 | Account step: keep the full advice (username, email, 2FA/passkey, email privacy). Link "xkcd" to https://xkcd.com. Add a recommendation that students apply for the [GitHub Student Developer Pack](https://education.github.com/pack); say it is not required for the workshop. | change | must |
| SET-04 | Repository step: tell learners to fill in **Description** and tick **Include all branches**, so that `match-01` comes with the repository. The text changes now. The screenshots are updated later (SET-09). | change | must |
| SET-05 | Codespaces step: unchanged apart from the title. | keep | must |
| SET-06 | Check Copilot step: say Copilot is the AI agent learners will try out in the workshop. The readiness check is unchanged: type exactly "What does this repository do?" and it passes when the answer mentions tic-tac-toe and `BOARD.txt`. Tell learners Copilot Chat can take a while to load and to wait. | change | must |
| SET-07 | Clean-up step: **delete** the Codespace at github.com/codespaces and keep the repository (D3). Explain why: personal accounts get a limited free monthly Codespaces allowance (about 120 core-hours on GitHub Free). A Codespace left running uses that allowance up, and a deleted one costs nothing. | change | must |
| SET-08 | Remove every video. Show the step-by-step screenshots directly, not inside a collapsed toggle. Remove the MP4 files and their capture/render pipeline entries if nothing else uses them. | change | must |
| SET-09 | Recapture the screenshots for the description field, **Include all branches** and deleting the Codespace. | change | later |
| SET-10 | The estimated time ("about 20 minutes") is rechecked. | change | must |

### How to play (`docs/guide.html`)

| ID | Requirement | Status | Priority |
|---|---|---|---|
| PLAY-01 | Pair start: the pair chooses one prepared repository; its owner is X, invites the partner (O) and moves first; the partner accepts; both open it in separate Codespaces; X registers it through **Register repository** in the header. | change | must |
| PLAY-02 | Starting the match: both switch to the existing `match-01` branch in Source Control and pull. Remove the instructions to create and publish `match-01`. | change | must |
| PLAY-03 | The turn cycle stays: Pull → edit one cell and save → check the diff and stage with + → Commit with a clear message → Sync Changes. | keep | must |
| PLAY-04 | Turn-cycle card: a compact, visually distinct summary of the five steps on How to play. Learners can keep it visible beside their Codespace. Text and CSS only, no PDF. | new | should |
| PLAY-05 | Rematch: create `match-02` from clean `main`, publish it, and the partner switches to it. Use agent mode with "Place X in the center of the board.", then inspect the diff, stage, commit and sync. The Copilot-unavailable fallback stays. | change | must |
| PLAY-06 | Step-by-step screenshots for How to play. | new | later |
| PLAY-07 | Learner recovery help and a learner Rewind exercise stay **out**. | keep | — |

### Game Wall (`docs/index.html`, `docs/app.js`)

| ID | Requirement | Status | Priority |
|---|---|---|---|
| WALL-01 | `BOARD.txt` grammar and the shared JS/Python validator fixtures stay. | keep | must |
| WALL-02 | One card per discovered `match…` branch; outcome filters; history replay; "Switch to Demo Data" stays (D11); the empty-state "Register a repository" link stays. The current page is fine on the projector, so no separate projector view is needed. | keep | must |
| WALL-03 | Remaining emoji UI icons (⏳ 🤝 🎲 ℹ️) become monochrome SVG icons consistent with NAV-02. | change | should |
| WALL-04 | Richer cards: whose turn it is, the move count, and the last commit message and time. | new | later |
| WALL-05 | Subtle celebration when a match is won or drawn. It is disabled under `prefers-reduced-motion`. | new | later |

### Written materials

| ID | Requirement | Status | Priority |
|---|---|---|---|
| DOC-01 | Learner guide, Facilitator guide, Pre-session checklist, Rehearsal guide, Glossary, ADR 0002 and README describe D2–D4 and D8. The pre-session flow is: create the repository with all branches and a description, then delete the Codespace. `match-01` ships with the template. Navigation is through the stage strip only. | change | must |
| DOC-02 | Update or remove the stale status banners dated 2026-10-20. | change | must |
| DOC-03 | An ADR records D3 (delete instead of stop) and D4 (`match-01` shipped in the template). | new | must |

## Success criteria

Gating (D13):

- [ ] **SC-01** Owner review and approval. *Check:* the owner reviews the deployed Setup page, How to play and Game Wall for `?workshop=2026-11-06-sokedai` in both themes and answers "Is this ready for SOKENDAI?". *Baseline:* not done. *Target:* explicit approval, recorded with date and site commit. *Evaluator:* owner. *Evidence:* note in [Status evidence](#status-evidence).

Recommended, tracked but not gating:

- [ ] **SC-02** A repository created from the template with **Include all branches** contains `match-01` with an empty board.
- [ ] **SC-03** A two-account manual match is played on `match-01` to the end, one commit per move. *Baseline:* never completed ([rehearsal evidence](planning/rehearsal-evidence-2026-10-20.md)). The owner has no second account now, so this check may stay pending.
- [ ] **SC-04** In a rehearsal, agent mode places X in the center from the exact prompt, and the diff changes only that cell.
- [ ] **SC-05** A fresh registration with `match-01` appears as a card on the deployed Game Wall.
- [ ] **SC-06** `npm test` passes in CI with the DOM tests running, and Pages is published through the GitHub Actions source.

## Scope and non-goals

**In scope:** the template's `match-01` branch, header and navigation, the Setup page, How to play text and the turn-cycle card, Game Wall icon and card polish, the written guides, the Glossary and an ADR.

**Non-goals:**
- RIKEN, a local-laptop track, non-Copilot LLMs and pull requests (D1).
- Japanese learner pages.
- Rewriting the archived SCDA registration issues (D9).
- A projector view; the current Game Wall works on the projector.
- PDFs or printable handouts.
- Learner recovery guides, a learner Rewind exercise, a deliberate merge-conflict exercise.
- Changes to the board grammar, the registration model, agenda timings or survey content.
- Implementation tickets. These are derived separately from this PRD.

## Constraints and dependencies

- **Deadline:** 2026-11-06. If time runs short, **should** items slip first.
- **Template repository** is separate. TPL-01 needs a push to it, approved by the owner.
- **Captures:** the owner has one GitHub account, so invite and accept steps cannot be captured. New screenshots need the facilitator's logged-in Playwright profile.
- **Game Wall data:** WALL-04 needs last-commit data per branch, either from the registry sync workflow or from rate-limited browser API calls.
- **Pages deployment:** a repository admin must switch the Pages source to GitHub Actions once.
- **Access:** Codespaces and Copilot access are separate; the manual fallback stays.

## Current state and gaps

Built and kept:
- the staged learner path with workshop selector
- catalog-driven Setup page with survey, account advice and screenshots
- the readiness check
- compact `BOARD.txt` with shared validators
- branch-aware registration and registry sync
- Game Wall with filters, avatars, winning-line highlight, history replay and demo data
- monochrome light/dark theme
- the single agenda in the Facilitator guide
- CI

Misaligned with this PRD:

1. The header duplicates How to play and Setup. The theme toggle is a bordered emoji button away from the GitHub logo (NAV-01, NAV-02).
2. **Register repository** and **View all games** appear as separate buttons on How to play and the Game Wall (NAV-03, NAV-04).
3. The drop-down still lists the archived SCDA workshop. Its Game Wall is empty because its registrations predate the current form (NAV-05).
4. Setup page step titles, the grey panel behind the steps, the missing xkcd link and Student Developer Pack, broken videos, and "stop" instead of "delete" (SET-01–08).
5. The template has no `match-01`. How to play tells learners to create it (TPL-01, PLAY-02).
6. How to play has no turn-cycle card (PLAY-04).
7. The guides say "stop and keep the Codespace" and describe creating `match-01`. Status banners dated 2026-10-20 are stale (DOC-01, DOC-02).

## Assumptions and open questions

None open. The rev 1.1 questions were closed in rev 1.2:
- OQ-01: archived direct links don't matter.
- OQ-02: the owner plays X and moves first.
- OQ-03: richer cards and the celebration are deferred.
- OQ-04: the empty-state register link stays.

## Linked tasks / decisions

- ADRs: [0002](docs/adr/0002-separate-setup-from-gameplay-guide.md) (to update), [0004](docs/adr/0004-compact-board-format.md), [0005](docs/adr/0005-scripted-screenshot-capture-for-setup-guide.md) (videos dropped by D10), new ADR for D3/D4 (DOC-03).
- Tasks: none yet. Implementation tickets are derived from revision 1.2 in separate tasks.

## Revision history

- 2026-11-01, rev 1.0: first draft from three interview rounds.
- 2026-11-01, rev 1.1: revised after the owner reviewed the draft.
  - **Reversed:** rev 1.0 D2 (no personal repository; the pair creates it in the session) and rev 1.0 D3 (open the template directly in a Codespace). Learners now create their own repository with all branches and a description, then delete the Codespace.
  - **Added:**
    - `match-01` ships in the template.
    - Header and navigation changes: stage strip only, with **Register repository** at the end.
    - SCDA removed from the drop-down.
    - Setup step renames, layout and content changes.
    - Videos removed.
    - Demo data kept.
  - **Dropped:** the projector view and the requirement for How to play visuals by 11-06 (deferred).
  - No tasks or evidence existed, so nothing else is affected.
- 2026-11-01, rev 1.2:
  - The stage strip moves into the header as row 2, without subtitles, ending with **Register repository**.
  - The owner is X and moves first.
  - Richer cards and the celebration are deferred to later.
  - The empty-state register link is kept.
  - All open questions are closed.

## Status evidence

No criterion verified yet. Baseline: `main` at `7f9da0b` (2026-10-22).
