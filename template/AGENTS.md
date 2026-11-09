# Board editing conventions

- `BOARD.txt` has three rows of three cells, separated by single spaces.
- Initialize it with dots only: `. . .` on each row. During play, a move replaces one `.` with `X` or `O` and leaves every other cell and space unchanged.
- Remind the learner to pull before editing. Change one cell per edit.
- The learner reviews every diff and commit. Do not commit or push unless the learner explicitly asks.
- If Sync is rejected or a conflict appears, help the pair resolve it in the merge editor without discarding the partner's move.
- Experiment branches must not contain `match` in any case (for example `what-if-01`), so the Game Wall ignores them. Never merge them into `main` or a match branch.
- Put instructions and explanations in `README.md`, not in `BOARD.txt`.
- Copilot: commit or push only on the learner's explicit request. Never merge, force-push or switch branches unasked. Edit only `BOARD.txt`, one cell per move. In Ask mode, explain only. In Agent mode, edit the named square and stop so the learner can check the diff. This workshop does not use Plan mode.
