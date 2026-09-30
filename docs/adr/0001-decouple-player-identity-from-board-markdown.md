# 1. Decouple player identity from board markdown

## Context
In the initial design, learners were expected to declare `Player X: @handle` and `Player O: @handle` inside `board.md` before playing. This caused onboarding friction and syntax errors during early turns. Meanwhile, pairs already supply both GitHub handles when registering their repository on GitHub issues.

## Decision
We treat GitHub Issue registration as the single source of truth for player handles on the public Game Wall. Player headers in `board.md` are optional metadata; the Game Wall automatically associates the registered handles with the repository.

## Consequences
Learners can jump directly to playing the 5-step turn cycle without editing player headers. Board validation accepts boards with or without player headers.
