# Git Tic-Tac-Toe Workshop Design Handoff

**Date:** 2026-10-20
**Status:** Current design for documentation and transfer. Runtime changes to the starter template, branch registration, and dashboard remain separately scoped and pending.
**Scope:** Standalone, two-hour workshop. This is separate from the GECS Project Gutenberg course.

This handoff is self-contained; access to the background research is optional. For its earlier source research and citations, see [the report in this repository](docs/research/browser-agent-workshop.md). The report is exploratory background. Its snack dashboard, one shared physical Codespace, and optional Live Share recommendations are superseded here; the source findings remain historical research, not a specification for the tic-tac-toe exercise.

## Workshop shape

The workshop serves a broad audience with mixed coding experience and no coding prerequisites. GitHub Codespaces is the primary environment; using each participant's own laptop environment is optional. Each participant works in their own environment. Each pair shares one GitHub repository. Do not use Live Share.

Send one short advance survey alongside the setup instructions for instructor preparation. It links to the instructions and contains exactly four questions; add no identity, research-modality, pairing, tutorial, or setup-readiness questions. Use concrete, recognizable examples rather than self-rated skill levels or a numeric scale. Ask participants to tick any choices that fit and let them leave a question blank; do not add a “none/not yet” choice:

- “How do you keep track of changes to research files?” Options: renamed copies, such as `analysis_v2`, `analysis_final`, or `analysis_final_revised`; version history in a shared document or cloud storage, such as Google Drive or Word; Git or another version-control system.
- “How do you usually work on files with other people?” Options: sending revised copies by email or chat; working together in a shared Google Doc, Word document, or other cloud document; collaborating through a shared GitHub repository or another version-control system.
- “How have you used an AI coding assistant?” Options: asking for explanations or copying suggested code; accepting code suggestions while editing; delegating file edits to an agent.
- “Which of these sound like your regular work?” Options: organizing data, making tables, or analyzing results in tools such as Excel, Prism, or Geneious; editing files in applications such as RStudio, VS Code, or PyCharm; running tools or commands in a terminal.

These four questions define the survey's complete scope. Reuse the step-by-step instructions on the existing workshop website, adapting the setup steps for Codespaces. Reserve a small troubleshooting buffer at the opening.

The advance check should verify that Copilot agent mode actually works, because Codespaces and Copilot access are separate. Copilot Free currently lists limited agent usage and IDE agent mode as included ([Copilot plans](https://github.com/features/copilot/plans)). If a participant cannot use Copilot, they may complete the manual rematch and follow the instructor's agent demonstration. Keep this fallback low prominence because free access is expected.

For the setup rehearsal, participants open the existing tic-tac-toe starter template directly in their own Codespace and ask Copilot chat, “What does this repository do?” They confirm the response, leave the editor, and delete the Codespace from the GitHub Codespaces dashboard. They do not make a personal template copy, create a pair repository, or commit or push before the workshop; the first complete Git workflow stays live. Pair formation and shared-repository creation remain live guided activities.

The activity moves from manual Git play to a timed agent-assisted rematch:

1. Start `match-01` from `main`, register it, then play manually in the shared pair repository.
2. Pairs that finish early may play an optional extra manual match before the timed transition. Use the next numbered match branch from `main` and register it.
3. At the scheduled transition, every pair starts the agent-assisted rematch, even if its manual match is unfinished. Leave any unfinished match on its branch, then start and register a fresh rematch on the next numbered branch from `main`. If the optional match was skipped, this is `match-02`; otherwise it is the next number. This protects the Copilot practice slot.
4. Keep completed match branches for review. Do not merge them back into `main`.

The confirmed working agenda totals 120 minutes; website implementation remains pending:

- 10 minutes: arrival and setup troubleshooting.
- 15 minutes: Git/GitHub mental model and demonstration.
- 15 minutes: form pairs, create the shared repository, and open Codespaces.
- 30 minutes: manual match.
- 10 minutes: Copilot demonstration.
- 25 minutes: agent-assisted rematch.
- 15 minutes: instructor demonstration of dashboard/history replay, research applications, and wrap up.

In the final segment, the instructor demonstrates a dashboard that shows public matches by outcome (win or draw) and lets viewers inspect committed board states from public repository histories as a “time machine.” This history replay is a demonstration, not a participant exercise. Exploring an alternative history by branching from an earlier move is an optional instructor extension if time allows; it is not part of the required learner workflow. Dashboard implementation remains separately scoped and is not authorized by this handoff.

## Repository, board, and registration model

`main` is the clean starting point. It contains an uppercase, case-sensitive `BOARD.txt` with the initial board and no moves. The file is initialized board content, not a zero-byte file. The extension is `.txt`, not `.md`. Match branches are named `match-01`, `match-02`, and so on, and each starts from `main`.

Register each match in its own issue with the pair repository, branch, and both players. Identify a match by `(repository, branch)` so multiple matches in one pair repository remain distinct. The game wall reads `BOARD.txt` from the registered branch and retains completed matches in its display. Recommended safeguard: show a clear error if the requested branch cannot be read instead of silently falling back to `main` or another branch.

A registration issue identifies a match. Any instructional or progress issue is a separate design question. Do not assume the match registration issue is also the lesson workflow.

## Agent use and active participation

In the agent-assisted rematch, learners choose a legal move and ask Copilot to make the corresponding board edit they already practiced manually. Later, they may optionally ask the agent to choose an individual legal move. This optional mode is limited to an individual move; the workshop does not ask participants to build a game from scratch or create a continuously playing unattended bot.

Collaborative Git is a core workshop outcome. Use the VS Code web UI inside Codespaces for the full workflow in both the manual match and agent-assisted rematch: edit the board in the editor, then use Source Control to review diffs, stage, commit, pull, and push. Terminal Git is not the primary teaching path. The Copilot rematch delegates only the board edit; learners choose the move, inspect the diff, check legality and Git state, and personally complete the Git steps. Both participants actively edit, commit, push, pull the partner's change, and check the resulting board and history. The exercise should give each person a turn as the active editor and make the navigator's review work explicit.

## Naturally occurring merge conflicts

Do not include a deliberate merge-conflict exercise or synthetic conflict in the required activities. Provide recovery instructions for merge conflicts that arise naturally during pair work.

## Current repository behavior and implementation gap

The existing repository and guides describe the current implementation. This design handoff records future requirements; none of the following changes is implemented by this document.

- The live external starter template's `main` branch contains lowercase `board.txt` with a raw 3×3 grid; [`template-spec/board.txt`](template-spec/board.txt) also uses lowercase `board.txt`. The designed match workflow calls for uppercase `BOARD.txt`. Neither the external template nor this repository has been updated to that contract.
- [`.github/ISSUE_TEMPLATE/register-game.yml`](.github/ISSUE_TEMPLATE/register-game.yml) collects a repository URL, player handles, and workshop name. It has no match-branch field.
- [`scripts/sync_board_registry.py`](scripts/sync_board_registry.py) builds [`docs/board.json`](docs/board.json) and deduplicates registrations by repository owner and name. It does not key registrations by branch.
- [`scripts/game_wall_parser.py`](scripts/game_wall_parser.py) parses existing registration issues. [`docs/app.js`](docs/app.js) fetches root `board.txt` from `main`, then `master`; it does not read a registered match branch or the proposed uppercase file.
- [`LEARNER_GUIDE.md`](LEARNER_GUIDE.md), [`FACILITATOR_GUIDE.md`](FACILITATOR_GUIDE.md), and the website guides now describe the approved Codespaces and VS Code Source Control workflow. They also identify the separate template, branch-registration, and dashboard dependencies still needed for the planned match model.

A later, separately scoped implementation plan should cover the template, registration form, issue parser and registry, and branch-aware dashboard display. The current public dashboard only fetches root `board.txt` from `main` or `master`, and the registration pipeline deduplicates by repository; it cannot show the planned match branches or their history. The final-segment dashboard/time-machine demonstration depends on that separate dashboard work. The implementation plan should also define how each fresh match branch from `main` receives the initial no-moves board. Documentation edits do not change these runtime contracts.

## Open design decisions

- How instructional steps and automated checks are delivered, separately from match registration.
- How to support the optional agent-chosen individual move while retaining participant review and active Git practice.
