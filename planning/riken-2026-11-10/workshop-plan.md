# RIKEN scientific software and agentic coding workshop

**Date:** 10 November 2026  
**Venue:** RIKEN  
**Hours:** 10:00–12:00 and 13:00–15:00, with lunch from 12:00 to 13:00  
**Audience:** Researchers with some programming experience; no prior Git, terminal, packaging, or coding-agent experience is required.

## Purpose

Introduce practical software habits that make scientific work easier to inspect, repeat, and share, then show how coding agents can help with that work. The workshop treats software practices as tools for doing science well in the age of generative AI. The goal is useful, understandable work, not perfection or a formal definition of software quality.

The workshop is language-agnostic. Examples and demonstrations use the presenter's preferred Python tools—uv, Marimo, Altair, and Just—to make concrete choices visible. They are examples with tradeoffs, not universal replacements for tools used in other languages.

## Shape of the day

The morning introduces software practices; the afternoon focuses on agentic coding. Both parts combine short explanations and demonstrations with very simple hands-on cycles. Keep the sequence flexible rather than assigning fixed minute-by-minute timings.

Use one tic-tac-toe project throughout the day. Participants begin in pairs by adding a collaborator and playing a game through Git. They can choose their own tools, including an LLM. A prepared working project and checkpoints keep the activity focused on the ideas rather than project setup.

Participants may use their own computers and tools. Codespaces is the fallback environment. Share setup instructions in advance and check access and setup before the workshop.

## Morning: scientific software practices

Introduce practical habits through the shared tic-tac-toe example:

- Collaborate by inviting a partner to a shared project and making changes through Git.
- Create an environment from the project's declared dependencies, then run one confirmation command to check that it works.
- Use a supplied failing test to guide a tiny fix, then run the test again.
- Check that X starts and that the counts of X and O marks are valid: the counts must be equal or X must have one extra mark. This exercise checks count validity; it does not attempt to establish that every board state is legally reachable.
- Demonstrate simple recipes for playing, running tests, opening a notebook, and checking the project. Coordinate terminology across the tools. These are demonstrations, not a separate recipe-writing exercise.
- Show how GitHub Actions can run supplied recipes as continuous integration (CI).

Keep recipes as straightforward command runners that use the project's dependencies. Do not introduce Make-style timestamp rules or incremental rebuild behavior.

## Afternoon: agentic coding

Introduce a practical cycle of alignment, context, short implementation and test loops, and review. Participants should inspect evidence, diffs, and pull requests as the work progresses. Use the tic-tac-toe project to make those actions concrete.

The exact hands-on exercises remain open. Keep them small enough to emphasize agreeing on a change, giving an agent useful context, checking its work, and deciding what to accept.

Briefly introduce possible extensions: skills, custom agents, subagents, orchestration, dynamic workflows, remote connections, and model choices. These are optional directions for further exploration, not prerequisites for the core workshop.

## Preparation and open decisions

- Prepare a working project and clear checkpoints for the paired Git activity and the agent demonstrations.
- Send setup instructions and check participant access to their preferred tools; have Codespaces ready as the fallback.
- Choose the final afternoon exercises and decide which extensions merit emphasis.
- Confirm the pacing while rehearsing. The broad two-part structure is agreed, while detailed timings and exercise choices remain provisional.

No external lecture research has been established for this plan. The plan records the agreed workshop scope and open design choices.
