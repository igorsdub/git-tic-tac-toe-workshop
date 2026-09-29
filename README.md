# Git Tic-Tac-Toe Workshop

A two-hour, beginner-friendly Git and GitHub workshop where pairs play tic-tac-toe by making small commits to a shared repository. The aim is for both learners to publish a move and receive their partner's move with `git pull`.

## Workshop Documents & Guides

- **[Facilitator Guide](FACILITATOR_GUIDE.md)**: Complete 2-hour timeline, live demonstration script with a prepared co-player, error recovery strategies, and research transfer discussion points.
- **[Rehearsal & Operational Readiness Guide](REHEARSAL_GUIDE.md)**: Facilitator rehearsal protocol, operating system readiness matrix, contingency workflows, and timed checks (60+ min pair play guarantee).
- **[Learner Guide](LEARNER_GUIDE.md)**: Concise one-page handout detailing roles (Player X and Player O), the 5-step turn workflow, helpful Git commands, and branch rematch extensions.
- **[Learner Starter Template](https://github.com/igorsdub/tic-tac-toe-template)**: Public GitHub template repository used by learners to instantiate their pair game (`board.md` and onboarding instructions).
- **[Template & Board Specification](template-spec/README.md)**: Canonical specification of the 3x3 board format, player metadata headers, game state parity rules, and test samples.
- **[Board Validation Script](scripts/validate_board.py)**: Python CLI and module to parse, validate, and evaluate game board files.
- **[Game Wall](docs/index.html)**: Live interactive workshop display showing 3x3 boards, player avatars, turn states, and 30-second auto-refresh across registered games (hosted on GitHub Pages).
- **[Game Wall Scalability & Load Simulation](docs/load_test_simulation.md)**: Technical analysis of Game Wall scalability under 10 and 20 concurrent pair repositories, rate limit budgeting, and error handling verification.
- **[Game Registration Form](.github/ISSUE_TEMPLATE/register-game.yml)**: GitHub Issue Form for pairs to submit their repository URL and player handles for display on the Game Wall.
- **[Pre-Session Readiness Checklist](PRE_SESSION_CHECK.md)**: Operating-system-neutral preparation checklist verifying GitHub accounts, Git installation, author configuration, and push authentication.
- **[Terminology & Context](CONTEXT.md)**: Standard terminology used across the workshop and pair games (Pair game, Board, Move, Game wall, Event).

## Workshop Structure at a Glance

| Time | Phase | Focus |
|---|---|---|
| **00:00 – 00:10** | **Pair Up & Setup** | Form pairs, assign roles (Player X / Player O), verify collaborator access. |
| **00:10 – 00:20** | **Shared Board Mental Model** | Conceptual intro: local vs. remote, the shared board, the turn lifecycle. |
| **00:20 – 00:40** | **Live Demonstration** | Facilitators demonstrate Moves 1 and 2 live on screen. |
| **00:40 – 01:40** | **Paired Game Play** | Pairs play their 9-turn game; fast pairs begin branch rematch extension. |
| **01:40 – 01:55** | **Game Wall & History Discussion** | Inspecting the Game Wall, analyzing `git log`, reviewing real-world logs. |
| **01:55 – 02:00** | **Research & Work Transfer** | Connecting the game workflow to scientific collaboration and codebases. |

## Game Wall & Pair Registration

The workshop features a shared public [Game Wall](docs/index.html) designed for GitHub Pages that visualizes all active and completed pair games in real time.

- **Register a Game**: Pairs register their repository URL and handles using the [Pair Game Registration Form](.github/ISSUE_TEMPLATE/register-game.yml).
- **Live Board Tracking**: The Game Wall queries issues labeled `game-registration`, fetches raw `board.md` files from learners' repositories, validates canonical state and turn parity, and renders responsive cards with player avatars and visual 3x3 boards.
- **Facilitator Projection**: Includes a projection display mode (`📽️`) for classroom projectors, dark/light theme toggle, and auto-refreshes every 30 seconds without full-page reloads.
- **Load Simulation & Rate Limits**: See [Game Wall Scalability & Load Simulation](docs/load_test_simulation.md) for rate-limit budget calculations (60 unauthenticated requests/hr) and performance verification under 10–20 concurrent pair repositories.

## Learner Template & Board Format

The paired game activity relies on the public GitHub template repository [igorsdub/tic-tac-toe-template](https://github.com/igorsdub/tic-tac-toe-template).

- **Starter Repository**: Pairs click **Use this template** to spawn their game repository with no manual board setup required.
- **Board File (`board.md`)**: A structured markdown representation of the 3x3 grid with Player X/O handles and state indicators (`Ready for X`, `Waiting for O`, `Waiting for X`, `X won`, `O won`, `Draw`).
- **Validation**: Run `python3 scripts/validate_board.py <path/to/board.md>` to verify file structure, check turn parity, and evaluate the game state. See [template-spec/](template-spec/) for full specifications and test samples.

The workshop design and implementation tasks are tracked in GitHub issues.
