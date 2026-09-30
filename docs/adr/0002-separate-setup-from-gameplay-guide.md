# 2. Separate setup guide from gameplay guide

## Context
Initial discussion considered placing the pre-session environment setup and the in-session pair gameplay instructions into a single monolithic document or single webpage. However, participants arrive at the workshop at different readiness levels, and scrolling past multi-platform installation steps during a live 9-turn pair game creates friction on split-screen laptop displays.

## Decision
We decouple pre-session environment configuration from live gameplay by providing two distinct web pages:
1. `docs/setup.html` (**Setup guide**): Git installation, GitHub account configuration (including email privacy), and authentication options (GitHub CLI `gh auth login`, VS Code sign-in, or manual Git config).
2. `docs/guide.html` (**Learner guide**): Pair roles, the 5-step turn cycle, command reference, troubleshooting, and branch rematch extensions.

The live **Game wall** (`docs/index.html`) links to both pages via the site header navigation.

## Consequences
Learners during the 60-minute game phase have a focused, lightweight guide without installation clutter. Pre-session attendees have a self-contained setup page that can be completed and verified before arriving.
