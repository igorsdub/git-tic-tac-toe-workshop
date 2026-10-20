# Facilitator rehearsal evidence — 2026-10-20

## Status

The complete facilitator rehearsal is **blocked and not yet completed**. This note records the access reconnaissance that was possible without creating or changing remote resources. It does not claim that the manual match, Copilot-assisted rematch, or advance preflight passed.

The current workshop checkout is on `codex/agent-assisted-workshop-plan`. The task 2 starter-template changes are committed locally but have not been pushed; the live starter still uses lowercase `board.txt`. The live template therefore does not yet provide the uppercase `BOARD.txt` baseline described by the handoff. Do not use this local state as evidence of a live participant rehearsal.

## Access reconnaissance

- The available Chrome session was signed into one GitHub account, `igorsdub`.
- The Codespaces dashboard listed one existing Codespace created from `igorsdub/git-tic-tac-toe-template`. It was left unopened so the inspection would not start or otherwise alter that remote Codespace.
- GitHub account settings showed Copilot Chat in the IDE and Copilot cloud agent enabled for the signed-in account. These account-level settings establish eligibility only; they do not verify that IDE agent mode can edit a board in a running Codespace.
- No second GitHub account or session was available in the browser inventory.

## Acceptance checklist

| Rehearsal item | Status | Evidence |
|---|---|---|
| Confirm a second account and two separate Codespaces for a pair repository | **Blocked** | Only one signed-in GitHub account was available. The dashboard listed one existing Codespace; no second account or second Codespace was available for the pair flow. |
| Manual match using VS Code Source Control for branch selection, diff review, staging, commits, pull, and push | **Not run** | No pair repository with two participants was available for the end-to-end flow. |
| Copilot-assisted rematch using VS Code Source Control | **Not run** | No two-account session was available. Account settings alone do not verify IDE agent mode or agent editing in Codespaces. |
| Direct starter Codespace preflight: ask “What does this repository do?”, confirm a response, then delete the Codespace without committing or pushing | **Not run** | The existing Codespace was left unopened. No new Codespace was created, and no Codespace was deleted. |
| Manual-rematch fallback for participants without Copilot | **Documented; not rehearsed** | [Learner guide](../LEARNER_GUIDE.md) and [facilitator guide](../FACILITATOR_GUIDE.md) say to complete the rematch manually and follow the instructor's Copilot demonstration. |
| Form prepared and previewed without distribution | **Complete** | The [Google Form editor](https://docs.google.com/forms/d/1N2-9HYEtIvWLp11hEa2d9NeS1vXBWiUy7xRycXJNW6c/edit) and [preview](https://docs.google.com/forms/d/1N2-9HYEtIvWLp11hEa2d9NeS1vXBWiUy7xRycXJNW6c/preview) contain the five bilingual questions. The form remains unpublished and is not accepting responses; it was not distributed. |

## Access needed to finish

1. A second GitHub account that can collaborate on a shared pair repository, with its own Codespace.
2. A live starter template with the committed `BOARD.txt` and match-branch baseline available remotely.
3. A facilitator session in both Codespaces to run the manual Source Control flow and the Copilot-assisted rematch, then verify agent editing in the actual VS Code web editor.
4. A separate direct starter Codespace for the advance preflight, followed by its deletion after the prompt succeeds and with no commit or push.

The full task 5 acceptance remains open until these participant flows are actually run and their results recorded. If a participant cannot use Copilot, the documented fallback is a manual rematch followed by observing the instructor demonstration; that fallback has not yet been exercised with a participant.
