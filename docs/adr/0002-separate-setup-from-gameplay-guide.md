# 2. Separate Setup page from How to play

## Context
Initial discussion considered placing the pre-session environment setup and the in-session pair gameplay instructions into a single monolithic document or single webpage. However, learners arrive at the workshop at different readiness levels, and scrolling past setup steps during a live pair game creates friction on split-screen laptop displays.

## Decision
We decouple pre-session environment configuration from live gameplay by providing two distinct web pages:
1. `docs/setup.html` (**Setup page**): the Codespaces track. Nothing is installed on the learner's computer. The steps are the pre-workshop survey (when the workshop has one), creating a GitHub account, creating a public repository from the template with a description and **Include all branches** (which brings `match-01`), opening it in a Codespace, the readiness check (Copilot Chat answers "What does this repository do?" and mentions tic-tac-toe and `BOARD.txt`), and deleting the Codespace while keeping the repository.
2. `docs/guide.html` (**How to play**): the five-step turn cycle in Source Control (Pull, edit one cell and save, stage with +, Commit with a clear message, Sync Changes) and the agent-assisted rematch.

In full mode, all three pages share the header stage strip: Setup, How to play and the Game Wall (`docs/wall.html`), followed by an unnumbered **Register repository** link. The plain site URL (`docs/index.html`) routes according to `setupOnly` in `docs/site-config.js`; setup-only mode hides the strip and onward links.

## Consequences
Learners during the game phase have a focused, lightweight page without setup clutter. Learners can complete and verify setup before arriving. The catalog's `setupTrack` selects the Setup page content per workshop.
