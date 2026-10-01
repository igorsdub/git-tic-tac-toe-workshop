# Git Collaboration Game

Terms for the paired tic-tac-toe activity and its shared event display.

## Language

**Pair game**:
A tic-tac-toe game played by two learners through one shared GitHub repository. Each learner makes moves from their own local copy.

**Board**:
The text file (`board.md`) whose current version records the pair game's 3x3 squares. Game state is evaluated dynamically from the grid marks.

**Move**:
One player's change to one empty square, saved as a commit and shared with the other player.

**Game wall**:
The public workshop page that displays the current board and state of each registered pair game.
_Avoid_: Leaderboard

**Register game**:
The action and GitHub issue form used to register a pair game onto the game wall.
_Avoid_: Register pair game, Add game, Register match

**Workshop**:
One training session (e.g. SCDA Training Week) and the set of pair games registered for its game wall.
_Avoid_: Event, Session, Cohort

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
An extension activity where pairs create a new Git branch to play a second game, learning branch creation, switching, and merging.
_Avoid_: Game 2, Rematch game, Feature branch game
