# Glossary

Terms for the paired tic-tac-toe workshop and its shared event display. Use these names in every document and page.

## Workshops and registration

**Workshop**:
A particular scheduled delivery of the training. Current and archived workshops are SOKENDAI, RIKEN, and SCDA Training Week (archived). Matches shown for a workshop are discovered from branches in repositories linked to it.

**Workshop ID**:
A stable identifier for one workshop, written as `YYYY-MM-DD-short-lowercase-identifier`. Once registrations exist for a workshop, its ID remains unchanged. Its display name is separate from its ID.

**Archived workshop**:
A workshop explicitly marked archived by the organiser. It remains viewable and its Game Wall continues receiving repository and match updates. It accepts updates to existing registrations, including player handles, but rejects new repository registrations.

**Repository**:
The GitHub repository a pair shares, created from the template. A repository belongs to only one workshop; its branches are the source from which the Game Wall discovers matches.

**Collaborator**:
A GitHub user who has been given access to someone else's repository. On a personal repository the partner becomes a collaborator with write access once they accept the owner's invitation.

**Invitation**:
The request the owner sends from Settings → Collaborators → Add people. The partner accepts it by opening `github.com/<owner>/<repo>` or searching `owner/repo` and using the invitation banner, or from the invitation email on the same signed-in device. It expires after 7 days.

**Registration**:
A connection between a repository and a workshop, with two player GitHub handles supplied for avatars. The Game Wall watches the registered repository. Repeating registration for the same repository and workshop updates the existing registration and its handles rather than creating another entry. Among valid registration issues for that repository and workshop, the newest issue supplies the handles; corrections are submitted through a new form entry.

**Register repository**:
The link in the header stage strip that opens the registration form for the selected workshop. A pair registers its shared repository once per workshop, with both GitHub handles; match branches are discovered automatically.
_Avoid_: Register every match branch

## The game

**Game**:
The collaborative tic-tac-toe activity in general. Use *match* for one play-through.

**Match**:
One play-through of tic-tac-toe between a pair, represented by a repository branch whose name contains `match` in any case. `match`, `Match`, `rematch`, and `match-1` all qualify. `main` never does. The owner creates `match`, and later `rematch`, from `main` on github.com. Neither is merged back. Each matching branch appears as a separate Game Wall card, identified by its full branch name.

**Board**:
The uppercase `BOARD.txt` file whose current version records a match's 3×3 squares: three rows of three single-space-separated cells, `.` (empty), `X`, or `O`. Game state is evaluated from the grid marks.

**Move**:
One player's change to one empty square, saved as a commit and shared with the other player.

**Turn cycle**:
On branch `match`, a turn is Pull, edit one cell, Commit and Sync. Staging with + is how Commit in Source Control picks up that one cell. "Sync Changes" is the share button.
_Avoid_: Sacred turn cycle, Game loop, Play cycle

**Conflict**:
Two partners changed the same part of `BOARD.txt` and Git cannot combine the versions alone. The pair resolves it in the merge editor, keeping all published moves and one legal next move.

**Merge editor**:
The VS Code view that shows both versions of a conflicted file and a combined result the learner edits, then completes with **Complete Merge**.

**Commit graph**:
The Source Control **Graph** section, which draws a branch's commits as a line, newest first. Selecting a commit shows its diff.

**Detached HEAD**:
The state after checking out an old commit directly instead of a branch. Safe for reading; leave it by switching back to a branch. Commits made there belong to no branch.

**Experiment branch**:
A published branch started from a past commit for a take-home what-if move. Its name must not contain `match` in any case, so the Game Wall ignores it, and it is never merged into `main` or a match branch.

**Ask mode**:
Copilot Chat mode that only explains. Used for the first rematch move; the learner does all edits and Git steps.

**Agent mode**:
Copilot Chat mode that can edit files and, when explicitly asked, commit and push. Used for the next rematch move, one cell per request; the learner reviews the diff first.

**Plan mode**:
Not used in this workshop. Copilot Chat here is Ask (explain only) or Agent (edit the named square).

**Agent-assisted turn**:
On branch `match`, the learner names one square, Copilot in Agent mode edits `BOARD.txt`, and the learner keeps the diff only when it is that square. A wrong diff is discarded and requested again.
_Avoid_: Plan mode, play the move by hand instead

**Rematch**:
Branch `rematch`, created from `main` on github.com after the first match. `uv run pytest` runs before every commit on this branch.

## Pages and documents

**Setup page**:
The pre-session web page (`docs/setup.html`). For the Codespaces track it covers the pre-workshop survey, creating a GitHub account, creating a public repository from the template with a description and all branches, opening and checking a Codespace, and deleting the Codespace while keeping the repository.
_Avoid_: Setup guide, Prerequisites, Installation guide

**How to play**:
The in-session web page (`docs/guide.html`) explaining the turn cycle and the rematch.
_Avoid_: Handout, Cheat sheet, Playbook, Instructions

**Game Wall**:
The public workshop page (`docs/wall.html`) that displays the current board and state of each discovered match branch for the selected workshop.
_Avoid_: Leaderboard, Dashboard

**Learner guide**, **Facilitator guide**, **Pre-session checklist**, **Rehearsal guide**:
The markdown documents `LEARNER_GUIDE.md`, `FACILITATOR_GUIDE.md`, `PRE_SESSION_CHECK.md`, and `REHEARSAL_GUIDE.md`. The Facilitator guide holds the only copy of the agenda.

## Learner path

**Stage**:
One step of a learner's path through the training, shown in the header stage strip in full mode and ordered Setup, Slot 1, Slot 2, Game Wall. The strip also carries the unnumbered **Register repository** link. Setup-only mode hides the strip. Not to be confused with staging a file in Git.

**Setup track**:
The variant of the Setup page a workshop uses, determined by how learners get a working environment. The Codespaces track needs only a browser; the local track needs software installed on the learner's own computer. Every active workshop has a track; for a workshop without one the Setup page says "Setup for this workshop is not published yet".

**Readiness check**:
Wait until the Codespace editor is fully loaded, open Chat, select Ask mode, enter exactly "What does this repository do?", click Send, and wait for the complete answer. The learner then deletes the Codespace from the GitHub Codespaces page and keeps the repository.
