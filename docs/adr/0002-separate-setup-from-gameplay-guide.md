# 2. Separate Setup page from How to play

## Context
Initial discussion considered placing the pre-session environment setup and the in-session pair gameplay instructions into a single monolithic document or single webpage. However, learners arrive at the workshop at different readiness levels, and scrolling past setup steps during a live pair game creates friction on split-screen laptop displays.

## Decision
We decouple pre-session environment configuration from live gameplay by providing two distinct web pages:
1. `docs/setup.html` (**Setup page**): the Codespaces track. Nothing is installed on the learner's computer. The steps are the pre-workshop survey (when the workshop has one), creating a GitHub account, creating a public repository from the template, opening it in a Codespace, the readiness check (Copilot Chat answers "What does this repository do?" and mentions tic-tac-toe and `BOARD.txt`), and stopping the Codespace.
2. `docs/guide.html` (**How to play**): the five-step turn cycle in Source Control (Pull, edit one cell and save, stage with +, Commit with a clear message, Sync Changes) and the agent-assisted rematch.

The Game Wall (`docs/index.html`) links to both pages, and all three pages share a stage strip with Next links.

## Consequences
Learners during the game phase have a focused, lightweight page without setup clutter. Learners can complete and verify setup before arriving. The catalog's `setupTrack` selects the Setup page content per workshop.
