# Git Collaboration Game

Terms for the paired tic-tac-toe activity and its shared event display.

## Language

**Game**:
The collaborative tic-tac-toe activity in general. Use *match* for one play-through.

**Match**:
One play-through of tic-tac-toe between a pair, represented by a repository branch whose name starts with the literal lowercase prefix `match`. Each matching branch appears as a separate Game Wall entry; its full branch name identifies the match.

**Board**:
The uppercase `BOARD.txt` file whose current version records a match's 3×3 squares. The canonical format uses three rows of single-space-separated `.`, `X`, and `O` cells. Game state is evaluated dynamically from the grid marks.

**Move**:
One player's change to one empty square, saved as a commit and shared with the other player.

**Game wall**:
The public workshop page that displays the current board and state of each discovered match branch for the selected workshop.
_Avoid_: Leaderboard

**Register repository**:
The action used to connect a pair's repository to one workshop and provide both player GitHub handles. A pair registers once per workshop; matching branches are discovered automatically.
_Avoid_: Register every match branch

**Workshop**:
A particular scheduled delivery of the training and the matches registered for it.

**Workshop ID**:
A stable identifier for one workshop, written as `YYYY-MM-DD-short-lowercase-identifier`. Once registrations exist for a workshop, its ID remains unchanged. Its display name is separate from its ID.

**Learner guide**:
The in-session web page (`docs/guide.html`) explaining pair roles, the turn cycle, and Git commands for playing the game.
_Avoid_: Handout, Cheat sheet, Playbook, Instructions

**Setup guide**:
The pre-session web page (`docs/setup.html`) covering Git installation, GitHub authentication, and identity configuration.
_Avoid_: Prerequisites, Installation guide

**Turn cycle**:
The five-step sequence of Git operations (pull, edit, stage, commit, push) each player follows to make a move.
_Avoid_: Sacred turn cycle, Game loop, Play cycle

**Branch rematch**:
An extension activity where pairs create a new Git branch whose name starts with `match` to play another match. The branch is discovered automatically for the workshop.
_Avoid_: Game 2, Rematch game, Feature branch game
