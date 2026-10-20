# Git Tic-Tac-Toe Workshop Design Handoff

**Date:** 2026-10-20
**Status:** Current design for documentation and transfer. Runtime changes to the starter template, branch registration, and dashboard remain separately scoped and pending.
**Scope:** Standalone, two-hour workshop. This is separate from the GECS Project Gutenberg course.

This handoff is self-contained; access to the background research is optional. For its earlier source research and citations, see [the report in this repository](docs/research/browser-agent-workshop.md). The report is exploratory background. Its snack dashboard, one shared physical Codespace, and optional Live Share recommendations are superseded here; the source findings remain historical research, not a specification for the tic-tac-toe exercise.

## Workshop shape

The workshop serves a broad audience with mixed coding experience and no coding prerequisites. GitHub Codespaces is the primary environment; using each participant's own laptop environment is optional. Each participant works in their own environment. Each pair shares one GitHub repository. Do not use Live Share.

Send one short advance survey alongside the setup instructions for instructor preparation. It links to the instructions and contains exactly five questions: four select-all-that-apply questions and one optional open-ended question. Add no identity, research-modality, pairing, tutorial, or setup-readiness questions. Use concrete, recognizable examples rather than self-rated skill levels or a numeric scale. Participants may leave any checkbox question blank; do not add a “none/not yet” choice. The English wording and Japanese translation appear together in [the survey](SURVEY.md):

- “Which of these sound like your regular work?” (普段の仕事で、次のようなことをしていますか？) Options: organizing data, making tables, or analyzing results in tools such as Excel, Prism, or Geneious (Excel、Prism、Geneiousなどのツールで、データを整理したり、表を作成したり、結果を解析したりする); editing files in applications such as RStudio, VS Code, or PyCharm (RStudio、VS Code、PyCharmなどのアプリケーションでファイルを編集する); running tools or commands in a terminal (ターミナルやコマンドラインで、ツールを実行したりコマンドを入力したりする).
- “How do you keep track of changes to research files?” (研究ファイルの変更履歴をどのように管理していますか？) Options: renamed copies, such as `analysis_v2`, `analysis_final`, or `analysis_final_revised` (`analysis_v2`、`analysis_final`、`analysis_final_revised`のように、ファイル名を変えたコピーを保存する); version history in a shared document or cloud storage, such as Google Drive or Word (Google DriveやWordなど、共有ドキュメントやクラウドストレージの変更履歴を使う); Git or another version-control system (Gitなどのバージョン管理システムを使う).
- “How do you usually work on files with other people?” (他の人とファイルを扱うとき、普段どのように共同作業していますか？) Options: sending revised copies by email or chat (メールやチャットで修正版を送り合う); working together in a shared Google Doc, Word document, or other cloud document (共有のGoogleドキュメント、Word文書、その他のクラウド文書を一緒に編集する); collaborating through a shared GitHub repository or another version-control system (共有GitHubリポジトリや他のバージョン管理システムを使って共同作業する).
- “How have you used an AI coding assistant?” (AIコーディングアシスタントをどのように使ったことがありますか？) Options: asking for explanations or copying suggested code (説明を尋ねたり、提案されたコードをコピーしたりする); accepting code suggestions while editing (編集中にコードの候補を受け入れる); delegating file edits to an agent (エージェントにファイルの編集を依頼する).
- Optional: “Is there anything you’d like to make easier in your day-to-day work?” (“日々の仕事で、もう少し楽にできたらと思うことはありますか？”)

These five questions define the survey's complete scope. Reuse the step-by-step instructions on the existing workshop website, adapting the setup steps for Codespaces. Reserve a small troubleshooting buffer at the opening.

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

The current public dashboard only fetches root `board.txt` from `main` or `master`, and the registration pipeline deduplicates by repository; it cannot show the planned match branches or their history. The final-segment dashboard/time-machine demonstration depends on the separate implementation work below. That work must also define how each fresh match branch from `main` receives the initial no-moves board. Documentation edits do not change these runtime contracts.

## Implementation handoff

This checklist records the remaining work for a follow-up implementation task. Before changing files, read the repository's current `AGENTS.md`/orchestrator instructions, this handoff, and the current branch and working-tree state. Preserve unrelated changes. The confirmed live contracts above are evidence; all acceptance criteria below are still pending.

1. **Create the bilingual survey form.** Scope: create a Google Form from the current five-question [survey draft](SURVEY.md): four optional checkbox questions followed by the optional open-ended question. Preserve the English and Japanese wording, allow checkbox responses to be blank, and do not add tutorial, readiness, identity, pairing, or research-modality questions. Dependency: the current bilingual survey text. Acceptance: review a form preview against every question and option in `SURVEY.md`; no question is required unless the wording explicitly says so. Sending the form with setup instructions is a separate distribution step requiring explicit send authorization; do not send it during form implementation.

2. **Update and verify the starter template.** Scope: in the separate [starter repository](https://github.com/igorsdub/git-tic-tac-toe-template), replace the lowercase raw-grid `board.txt` contract with case-sensitive `BOARD.txt` containing the initialized no-moves board; define how each clean `match-NN` branch starts from `main`. Verify the actual repository and its current default branch before making changes. Dependency: the board and branch rules in this handoff and the learner guide. Acceptance: a newly opened pair repository has the expected `BOARD.txt` on `main`; numbered match branches can be created from a clean `main` baseline with the same initialized board. Participants keep one shared public pair repository, use individual Codespaces, and complete Git operations in VS Code Source Control. The advance rehearsal remains a direct Codespace from the existing starter, with no commit or push.

3. **Add match-branch registration and validation.** Scope: update `.github/ISSUE_TEMPLATE/register-game.yml`, `scripts/game_wall_parser.py`, and `scripts/sync_board_registry.py` so each match records the pair repository, branch, and both players, and the registry key is `(repository, branch)`. Handle missing/inaccessible branches and invalid boards explicitly; distinguish unfinished matches from completed wins/draws and retain completed matches. Dependency: the verified starter `BOARD.txt` and `match-NN` branch contract from task 2. Acceptance: two branches in one repository register as distinct matches; a valid branch loads its board; invalid or inaccessible branch/board data shows a clear error without silently falling back to `main` or another branch; completed matches remain listed.

4. **Implement the Game Wall outcome and history view.** Scope: update `docs/index.html`, `docs/app.js`, and related presentation code to show public matches by outcome, including unfinished matches and wins/draws, and let the instructor replay committed board states from repository history as a “time machine.” This is an instructor demonstration, not a participant exercise; alternative-history exploration remains optional and is not required. Dependency: branch-aware registration and board retrieval from task 3. Acceptance: the view displays multiple branches from one repository separately, groups them by current outcome, and replays valid committed board states in order. If the new view is not ready at workshop time, retain GitHub commit history as the documented instructor fallback.

5. **Run and record a complete facilitator rehearsal.** Scope: test with two accounts and two Codespaces following the actual participant flow, using VS Code Source Control for branch selection, diff review, staging, commits, pull, and push. Test both the manual match and the Copilot-assisted rematch, then run the advance preflight prompt in a direct starter Codespace and delete that Codespace without committing or pushing. Dependency: tasks 2–4 for the intended participant and dashboard flow. Acceptance: record which steps passed and any access limitations; do not claim Copilot Agent availability was tested unless the two-account run actually verified it. Confirm participants blocked from Copilot can still complete the manual rematch and observe the instructor demonstration.

6. **Reconcile and prepare delivery.** Scope: compare the implementation branch with current `origin/main`, review the changes and relevant checks, verify the GitHub Pages/deployment status, and check documentation links and survey references. Dependency: implementation and rehearsal evidence from tasks 1–5. Acceptance: report the final commits, checks, deployment state, and any remaining blockers. Do not push or merge without separate authorization.

## Open design decisions

- How instructional steps and automated checks are delivered, separately from match registration.
- How to support the optional agent-chosen individual move while retaining participant review and active Git practice.
