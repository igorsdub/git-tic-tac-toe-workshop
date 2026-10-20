# Browser-Based Agent Coding Workshop: STORM Research Report

**Research snapshot:** 2026-10-19
**Audience and duration:** computational biologists; two hours; browser-only; no coding prerequisites
**Decision status:** exploratory recommendations; current design is recorded below, and runtime implementation remains pending
**Method:** Four simulated analytical perspectives queried iteratively against official GitHub, Carpentries, and GitHub Skills primary sources. These are structured lenses, not human interviews, independent experts, or empirical validation.

## Current workshop design (2026-10-20)

The following design decisions supersede this report's exploratory activity and paired-environment recommendations. The rest of the report preserves its research findings and source ledger; it is not the implementation specification. The canonical, portable handoff is the [workshop design document](../../WORKSHOP_DESIGN_HANDOFF.md).

- The two-hour workshop is a Git tic-tac-toe activity for a broad audience with mixed coding experience and no prerequisites. It is separate from the GECS Project Gutenberg course. Codespaces is the primary environment; a participant's own laptop setup is optional. Both people use their own environment and collaborate in one shared pair repository. Live Share is not part of the design.
- `main` is the clean baseline with an initialized, no-moves `BOARD.txt`. The manual first match uses `match-01`; an early optional manual extra match comes before the timed transition. At that transition, pairs start an agent-assisted rematch on the next numbered branch from `main`. Branches are retained and never merged back into `main`.
- Every match has its own registration issue with repository, branch, and both players. The registry key is repository plus branch, and the wall reads the board from that branch. Participants choose and prompt the first agent-assisted moves; later, they may optionally let the agent choose an individual move. Participants inspect diffs, legality, and Git state and each complete active Git steps. Continuous unattended bots and building a game from scratch are out of scope.
- A conflict-practice branch between manual play and the agent-assisted rematch is tentative; the exact exercise is unresolved. Registration issues remain distinct from any instructional or progress issues, whose design is also open.

These are current design choices, not implemented behavior. In particular, the existing workshop repository currently uses lowercase `board.txt`, repository-only registrations, and branch fetching that tries `main` then `master`. The existing guides and wall must not be read as proof that the new match model has shipped.

## Executive recommendation

Build a small GitHub Skills-style exercise in a custom public template repository. GitHub Actions creates one progress Issue in each copied repository, posts the next instruction when a bounded check passes, and disables completed step workflows. Learners work in a browser-based Codespace with an IDE agent for explanation, planning, implementation, and debugging. They inspect a visible result, run a simple check, and commit. Keep automated checks about observable artifacts and process steps; the learners interpret the data and decide whether the result answers the question.

Use one repository per pair as the preferred format. One participant creates the repository from the template and invites the other as a collaborator. Both use a single Codespace/browser view, with one driver and one navigator who switch roles at set points. Physical pairing at one host is the fallback when the collaborator invite, account access, or second browser session fails. Two independent Codespaces per pair should be optional: they cost more compute and introduce branch synchronization and merge concepts that do not help meet the two-hour learning goal. GitHub documents Live Share as a browser-capable option inside Codespaces, but it adds an extension, sharing link, and host-idle-timeout dependency; make it a preflighted optional path rather than the novice default. [^10][^11][^12][^13]

The activity should ask an everyday, answerable question about a tiny synthetic table, for example: “Which snack is most popular, and does the answer change between two fictional groups?” Learners inspect the rows and counts, state a prediction, ask the agent to plan one small chart/filter change, then compare the chart with a hand count. Use a bundled static HTML/JavaScript dashboard and local CSV or JSON data: no API key, network data fetch, build system, or biological data. A preworking tic-tac-toe scoreboard is a close alternative when the group prefers a game, but it is more likely to make the workshop about game rules than about asking a question of data. Neither theme is user-approved or empirically validated; pilot both against the same readiness and pacing checks before choosing.

GitHub Skills provides the right instructional mechanics. The remembered “Mergington High School” extracurricular activities website is the Copilot Skills course [Getting Started with GitHub Copilot](https://github.com/skills/getting-started-with-github-copilot), which asks learners to use a browser Codespace but lists GitHub familiarity, VS Code familiarity, and basic coding principles as prerequisites. It is a useful example of an inviting activity-app narrative, but its prerequisite contract does not match this cohort. [^1][^2][^3]

**Feasibility verdict:** A custom GitHub Skills-format workshop is technically plausible and uses GitHub’s normal template, Issues, Actions, and Codespaces paths. Pairing is possible through ordinary collaborator access, but the exercise tooling has no pair enrollment or identity-aware progress model; treat shared-repository operation as a design choice that must be tested on the workshop copy. GitHub Classroom cannot be a current dependency: GitHub announced that the full Classroom application and website would be decommissioned on August 28, 2026, and current research is dated October 19, 2026. [^4][^5][^6][^7][^8][^9][^10][^11][^21]

## Decision contract

This workshop stands alone. GECS’s existing course glossary describes a cumulative Project Gutenberg analysis course in which each learner develops a participant-owned course repository. This workshop instead teaches a bounded agent-assisted change in a two-hour, browser-only session. Its data dashboard is an exercise repository and should not be represented as a change to the course project, a replacement curriculum, or an approved new GECS session. [^25]

The requested experience should teach learners to give an agent context, ask it to explain and plan, constrain a change, inspect generated output, check a claim, and preserve a small change. It should not invite continuous autonomous execution. Human judgment remains in the loop at the plan, diff, rendered result, and commit checkpoints. Each exercise task should fit one turn of learner intent, one observable output, and one reversible edit.

## Simulated analytical perspectives

Each perspective used a three-step inquiry progression: (1) inspect the stated constraints and relevant official materials; (2) test the most consequential assumption against additional sources or concrete repository mechanics; (3) identify the decision, limitation, and unresolved question. The sequence is a transparent research method, not dialogue or evidence of independent interviews.

| Perspective | Worldview | Inquiry sequence and key questions |
| --- | --- | --- |
| Novice instructor | Learners need visible progress, plain-language instructions, and fast recovery from unfamiliar interfaces. | First: which tutorial provides a browser path and approachable task? Second: what prerequisites does it actually declare, and can a novice finish a coherent slice in two hours? Third: what can be deferred while preserving a satisfying artifact? Finding: adapt the issue-based lesson shape, but avoid assuming the Mergington course’s stated prerequisites. |
| GitHub Skills maintainer | A sequence of discrete Actions checks, issue comments, and local step files can turn a copied repository into a guided course. | First: what are the official template, toolkit, and creator? Second: what does start-exercise do, how are checks unlocked, and where does identity enter? Third: does template behavior constitute a supported pair feature? Finding: use the creator/template/toolkit as a reference implementation; customize and test pairing rather than infer it is built in. |
| Scientific-computing educator | A coding agent should help create a result while the learner remains responsible for the question, data meaning, and validation. | First: what small activity has a hand-checkable answer? Second: can the task use fixed, synthetic local data and a clear expected output? Third: what evidence makes the chart trustworthy? Finding: use a tiny everyday dataset, expose denominator and ties, and make manual counting part of the activity. |
| Access and recovery operator | An otherwise good lesson fails if account, entitlement, browser, compute, or sharing steps are discovered during the session. | First: what does each product require and include? Second: which claims have changed or depend on verified identity? Third: what is the preflight and fallback if one requirement fails? Finding: check participant access before the day; keep physical pairing available; budget compute separately from AI credits; never assume a plan label means a fixed number of successful agent turns. |

These lenses converge on a small, visible, inspectable task and a preflighted browser environment. They do not represent a sample of real instructors or learners. The main design tensions are pedagogical and operational trade-offs, not documented disputes among experts.

## Tutorial landscape and tool distinctions

GitHub Skills describes its exercises as hands-on instruction inside Issues, with GitHub Actions giving directions and feedback in a copy of a real project. It points exercise authors to an [Exercise Creator](https://github.com/skills/exercise-creator), [Exercise Template](https://github.com/skills/exercise-template), and [Exercise Toolkit](https://github.com/skills/exercise-toolkit). [^1][^4][^5][^6]

The [Exercise Creator](https://github.com/skills/exercise-creator) provides a Codespace with guidance and tools to draft, test transitions and grading workflows, and refine an exercise. Its documented authoring loop is outline, human review, scaffold, review and refine, publish, and test-run. The [Exercise Template](https://github.com/skills/exercise-template) supplies numbered step Markdown files and numbered workflows. The template’s start workflow delegates common setup to `skills/exercise-toolkit`, creates an exercise Issue, posts step content, and enables the next numbered workflow. The toolkit also provides a reusable workflow for finding an Issue by title. [^4][^5][^6][^7][^8]

These components are separate from the coding agent. The tutorial bot is deterministic Actions automation: it provides lesson text, checks a repository event or file condition, and reports progress in an Issue. An IDE agent runs in the learner’s browser Codespace and helps explain, plan, edit, and debug. GitHub Copilot cloud agent is a third mode: assigning it an issue starts asynchronous coding work on GitHub and results in a pull request for review. The official course [Expand your team with Copilot](https://github.com/skills/expand-your-team-with-copilot) teaches cloud-agent delegation, says no coding environment is needed, and lists a Copilot Pro or higher subscription as a prerequisite. That workflow is valuable to compare, but it is not the recommended core for this workshop: the exercise should keep learners present in the browser editor, use short bounded changes, and avoid requiring a cloud-agent entitlement or waiting for asynchronous work. Current official documentation says feature access depends on plan and verified eligibility; inspect each participant’s actual account during preflight. [^3][^9][^14][^15][^16][^28]

| Existing resource | What it teaches | Fit for this workshop |
| --- | --- | --- |
| [Introduction to GitHub](https://github.com/skills/introduction-to-github) [^27] | No-prerequisite, under-one-hour exercise for repositories, branches, commits, and pull requests; learners make a profile README. | A useful pre-work option or vocabulary source; the core workshop still needs to cover only the GitHub context required for its agent task. |
| [Getting Started with GitHub Copilot](https://github.com/skills/getting-started-with-github-copilot) | IDE Copilot interactions while changing the fictional school’s extracurricular activities site; browser Codespace; PR summary/review. | Best source for the “Mergington” memory and IDE-agent pattern; declared prerequisites exceed the requested novice starting point. |
| [Expand your team with Copilot](https://github.com/skills/expand-your-team-with-copilot) [^28] | Assign issues to GitHub Copilot coding agent and review asynchronous work on GitHub. | Helpful contrast and possible optional extension; too much delegation and less direct learner editing for the core exercise. |
| [Review pull requests](https://github.com/skills/review-pull-requests) [^29] | GitHub review mechanics in an issue-based exercise. | Good source for a scoped review/commit checkpoint if review is included; avoid turning PR mechanics into a second main learning objective. |
| [Exercise Creator + Template + Toolkit](https://github.com/skills/exercise-creator) | Authoring and automating progressive issue-based lessons. | Strongest mechanics reference for a custom bounded workshop exercise. |

## Proposed experience and milestones

The timing is a planning hypothesis for piloting, not a validated schedule. Repository creation, collaborator acceptance, account and entitlement checks, and successful agent access are mandatory preflight tasks completed before the session. Reserve recovery slack and allow the instructor to skip the optional stretch. A total of 120 minutes is allocated below.

| Time | Activity | Visible evidence |
| --- | --- | --- |
| 0–5 min | Welcome, state outcome, confirm preflight and select physical-pair fallback if needed. | Pair has working browser and named driver/navigator. |
| 5–20 min | Instructor demo of repository map, app, explanation prompt, planning prompt, and diff review. | Learners locate README, source, data, preview, and check instructions. |
| 20–30 min | Open the already-created pair repository and Codespace; confirm starter baseline. | Shared repo and baseline visible; no invite/setup task remains. |
| 30–45 min | Milestone 1: orient and record a prediction. Agent explains the data shape; learners hand-count rows. | Baseline loads (automatable); prediction and hand count are human evidence. |
| 45–60 min | Milestone 2: plan one bounded change with the agent. | Plan response exists (automatable); pair assesses whether it names file, behavior, and check. |
| 60–85 min | Milestone 3: implement one feature in IDE agent mode; switch driver and navigator halfway. | Structural feature check passes; pair reviews focused diff and visible result. |
| 85–105 min | Milestone 4: run locally, compare chart and denominator, correct mismatch, and commit. | Deterministic values and commit can be checked; learners explain whether the question is answered. |
| 105–115 min | Recovery slack or optional stretch after core milestones. | Recovery path or one verified optional improvement. |
| 115–120 min | Debrief: agent uncertainty, value of checks, next practice. | One learner-stated limitation and transfer intention. |

The four core milestones are deliberately bounded: (1) environment and baseline, (2) plan, (3) change and generated result, (4) check and preserve. A fifth milestone for PR review is optional and should be used only if the group is already comfortable with the repository workflow. The single learning takeaway is: **a coding agent can help make a change, while people choose the question and decide whether the evidence supports the answer.**

### Activity and verification contract

Use synthetic snack votes or café orders with around a dozen rows, two fictional groups, a few categories, and at least one tie. Keep the table embedded or bundled beside the app, not hosted externally. The activity prompt should request one filter and one chart, not a feature wishlist. A human can independently count each category and group from the rows; an automated check can verify selector/chart presence and deterministic output. It can verify that a plan response exists, but peers or instructors assess whether it names a file, behavior, and check. It should not claim the plot answers a scientific or causal question. Show the selected group and number of rows in the denominator, and preserve ties instead of silently choosing a winner.

Use four progressive issue milestones with deterministic triggers and human checks: baseline file or preview is present; a plan response has been posted; the bounded feature and output are present; expected values and a commit are visible. Human or peer review assesses plan quality, the question, and interpretation. An automated check can compare deterministic values but cannot establish whether the learner’s question or interpretation is useful. Avoid external endpoints, credentials, uploads, installing packages at runtime, or an unbounded agent instruction such as “keep improving until it is perfect.”

## Pair topology and constraints

The preferred arrangement is one copied repository owned by one participant, with the other invited as a collaborator. GitHub Free permits unlimited collaborators on personal repositories, and a collaborator has to accept the invitation. This creates a common repository for artifacts and progress. It does not create a pair-aware Skills exercise: the stock toolkit’s start flow uses `github.actor` to personalize the welcome Issue and README, and its issue lookup selects by title prefix without author filtering. The template wrapper disables the start flow while the repository itself is a template, but the reusable workflow has no visible owner or learner identity guard. Steps in individual courses can have additional event or branch conditions. Therefore, shared pair behavior is technically plausible but not a documented first-class feature; validate both participants’ pushes, issue visibility, and step unlocks on a workshop copy before relying on it. [^5][^6][^7][^8][^11]

One browser Codespace shared physically between two people keeps the resource and interface count low. Use a driver/navigator rotation so both people operate the agent and inspect evidence. If room layout makes physical pairing impractical, Live Share can provide real-time collaborative editing in a browser Codespace. It requires installing/enabling the extension and sharing a session URL; the host’s idle timeout can stop the Codespace while guests are active. This is a recovery option after preflight, not a baseline dependency. [^12]

Avoid two independent Codespaces for each pair in the core exercise. A 2-core Codespace used for two hours consumes 4 core-hours for one host, before setup, idle time, or extra compute. Two hosts consume about 8 core-hours. Current personal Free accounts include 120 Codespaces core-hours and 15 GB of storage per month; Pro includes 180 core-hours and 20 GB of storage per month. This arithmetic suggests compute itself is not a large per-pair burden if there is one two-hour host, but setup/idle time, stored Codespaces, public/private Actions settings, account-plan limits, and local policy still matter. The included quota is personal-account usage and, once exhausted, Codespaces can be restricted unless a budget/payment setup permits billable usage. Set an explicit workshop rule to stop Codespaces and do not enable overage to rescue a session. [^13][^14]

AI usage is separate from Codespaces compute. Current Copilot plan documentation shows that Free and Student have AI-credit allowances and feature differences, and limits Free to Auto model selection; it does not promise a number of successful workshop-sized agent turns. A GitHub official community announcement updated June 1, 2026 stated a 200-credit monthly Student allowance, but the current plans page does not show exact Free/Student credit totals. Treat the post as dated context, not a reliable allowance promise; consult current usage-based billing documentation and verify the participant account. [^26] During preflight, participants should check their own entitlement, IDE Agent mode, and organization policy. Never guarantee turns from a plan name. If access fails during class, use an instructor-hosted Codespace for a live demo/shadowing path where possible. Manual prompting is a partial-access contingency: learners can still practice prediction, running, and checking, but do not complete the agent-interaction objective. [^15][^17][^20]

GitHub Education is not automatic for a biological audience. Student access requires an eligible student and current enrollment verification; teacher access requires an eligible teaching role and verified affiliation. Computational biologists, researchers, staff, or workshop attendees are not necessarily eligible just by attending. Eligibility is not implied by being a researcher or attending the workshop, so verify before class and do not build the core path around a same-day Education application. [^18][^19]

## Preflight, recovery, and safeguards

Run a small rehearsal at least several days before the workshop with two ordinary accounts and the exact template copy path. Verify repository creation, collaborator invite/accept, Actions enabled and passing, issue creation, first step comment, Codespace start and preview, agent mode availability, a small bounded edit, local check, and commit. Confirm that step checks unlock when the collaborator rather than the repository owner makes the change. Repeat with one deliberately failing check to ensure the feedback is actionable. This is a proposed acceptance rehearsal, not yet completed validation.

Before class, have attendees sign into GitHub and open the target activity from their own browser. Check account and plan conditions and verify a successful bounded agent task; avoid asking learners to disclose credentials, tokens, private research code, or billing details. Present the physical-pair fallback before setup. If the Codespace fails, use the prepared static example or a pre-opened host Codespace and let learners work as navigator. If agent access is unavailable, use an instructor-hosted Codespace for a live demo and shadowing where possible. Manual prompting is a partial-access contingency: learners can still practice prediction, running, and checking, but do not complete the agent-interaction objective. If an Action does not unlock, use the instructor’s prepared solution branch or advance by verbal checkpoint; do not spend the session debugging YAML.

Use only fictional rows. Keep AI prompts scoped to the sample repository and explicitly instruct the agent not to add external services, telemetry, dependencies, secrets, or unrelated files. Learners review the diff and visible behavior before accepting a change. This protects time and makes the agent’s changes inspectable. The activity is an educational coding exercise, not a scientific analysis or evidence about preferences of real people.

## Consensus, design tensions, and unknowns

**Cross-perspective synthesis:** a browser-first template with a known starter state and progress instructions reduces setup variation; fixed local data makes the result independently checkable; pairs benefit from alternating active roles; automated progress checks should gate on a concrete artifact while leaving question selection and interpretation to the learner. GitHub’s docs substantiate the product mechanisms; the claims about novice learning and workshop pacing remain design hypotheses that need a pilot.

| Tension | Choice recommended for the pilot | Cost or caveat |
| --- | --- | --- |
| Rich app feature vs. novice task scope | One chart and one group selector. | Less freedom than open-ended app generation, but easier to finish and hand-check. |
| Separate pair accounts vs. one shared host | One repository and one Codespace per pair, with a physical driver/navigator rotation. | Collaborator-trigger behavior requires rehearsal; the issue-based tooling is not pair-aware. |
| Live Share vs. physical pairing | Physical pairing baseline; preflighted Live Share as fallback. | Extension and host timeout add failure points. |
| Cloud agent vs. IDE agent | IDE agent in Codespaces. | Requires individual feature access and AI credits; no guarantee of a fixed number of turns. |
| Automated grading vs. interpretation | Automate artifact presence and expected values; humans assess question and interpretation. | Actions can check structural facts, not scientific quality. |
| School app vs. snack dashboard vs. game | Pilot snack dashboard first and retain scoreboard as alternative. | Theme choice is not approved or empirically tested. |

**Unknowns to resolve in a pilot:** does the specific workshop repository’s event configuration unlock a step after a collaborator’s commit; which GitHub Copilot features are enabled for each participant under their real plan and organizational policy; whether a 12-row chart activity consistently fits the allotted 20-minute implementation block; and which theme sustains interest without creating unrelated requirements. Classroom’s decommission date has passed; no Classroom dependence is recommended. The current official plans and usage-based billing pages are mutable and should be rechecked before delivery. [^26]

## Pilot acceptance criteria

Proceed to a full-room pilot only after two test accounts complete the exact copy-and-pair flow. A novice test pair should be able to create or join the repository, reach the starter app in the browser, obtain lesson guidance, use the IDE agent to plan and perform one bounded edit, see an expected output, hand-check the count, and preserve the change in a commit within the 120-minute session. The facilitator should be able to recover from a missing feature entitlement or collaborator step trigger without credentials, new purchases, or editing live workflow code. Record where time was spent and what failed; do not present these criteria as already met. Manual prompting remains a partial-access contingency and does not satisfy the agent-interaction criterion.

## Source ledger

All sources were accessed on **2026-10-19**. GitHub Docs and repository sources are mutable; account feature flags, billing terms, availability, retirement state, and repository workflows should be rechecked before workshop delivery. Sources [^22][^23][^24] are pedagogical primary material from Carpentries. The ledger lists official material used to support the claims and proposed architecture.

1. [GitHub Skills catalog](https://github.com/skills) : Issue/Actions tutorial model, real-project copies, authoring links.
2. [Getting Started with GitHub Copilot](https://github.com/skills/getting-started-with-github-copilot) : Mergington school activities app and course description.
3. [Getting Started README](https://raw.githubusercontent.com/skills/getting-started-with-github-copilot/main/README.md) : stated prerequisites, browser Codespace, duration, learning outcomes.
4. [Exercise Creator](https://github.com/skills/exercise-creator) : authoring and test tooling, human review loop.
5. [Exercise Template](https://github.com/skills/exercise-template) : template README, numbered steps, workflow structure.
6. [Exercise Toolkit](https://github.com/skills/exercise-toolkit) : reusable workflow and markdown-template descriptions.
7. [Toolkit start-exercise workflow](https://github.com/skills/exercise-toolkit/blob/main/.github/workflows/start-exercise.yml) : Issue creation, actor personalization, repository template check.
8. [Toolkit find-exercise-issue workflow](https://github.com/skills/exercise-toolkit/blob/main/.github/workflows/find-exercise-issue.yml) : issue selection by title prefix.
9. [Template start workflow](https://github.com/skills/exercise-template/blob/main/.github/workflows/0-start-exercise.yml) : start flow and next-step enablement.
10. [Creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) : copied files and unrelated history.
11. [Inviting collaborators to a personal repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository) : Free account collaborators and invite acceptance.
12. [Working collaboratively in a Codespace](https://docs.github.com/en/codespaces/developing-in-a-codespace/working-collaboratively-in-a-codespace) : Live Share setup and host idle-timeout constraint.
13. [Product usage included with each plan](https://docs.github.com/en/billing/reference/product-usage-included) : current personal Codespaces quotas.
14. [Getting the most out of included Codespaces usage](https://docs.github.com/en/codespaces/troubleshooting/troubleshooting-included-usage) : core-hour calculation, idle timeout, restrictions, storage.
15. [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans) : plan and feature differences; Free/Student allowance is not specified as fixed turns here.
16. [Using Copilot cloud agent on GitHub](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-on-github) : issue assignment, asynchronous work, pull request review.
17. [Kick off a task with Copilot agents on GitHub](https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/kick-off-a-task) : distinction between issue assignment and prompt-started branch workflow.
18. [Apply to GitHub Education as a student](https://docs.github.com/en/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student) : student eligibility and enrollment verification.
19. [Apply to GitHub Education as a teacher](https://docs.github.com/en/education/about-github-education/github-education-for-teachers/apply-to-github-education-as-a-teacher) : educator eligibility and affiliation verification.
20. [GitHub community announcement: Student AI credits](https://github.com/orgs/community/discussions/189268) : June 1, 2026 update stated a Student allowance; mutable context, not a current entitlement guarantee.
21. [GitHub Changelog: Classroom sign-ups and retirement](https://github.blog/changelog/2026-05-26-github-classroom-sign-ups-are-no-longer-available/) : full service retirement and effective date.
22. [Carpentries workshops](https://carpentries.org/workshops/) : workshop format and teaching model.
23. [Carpentries instructor training: live coding](https://carpentries.github.io/instructor-training/instructor/17-live.html) : live demonstration considerations.
24. [Carpentries lesson-development training: formative assessment](https://carpentries.github.io/lesson-development-training/formative-assessment.html) : checking learner understanding during instruction.
25. GECS project glossary (`CONTEXT.md`), inspected 2026-10-19 : boundary between this standalone workshop and the existing Project Gutenberg course project.
26. [Usage-based billing for individuals](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing) : current AI-credit billing context.
27. [Introduction to GitHub](https://github.com/skills/introduction-to-github) : GitHub Skills baseline repository and workflow lesson.
28. [Expand your team with Copilot](https://github.com/skills/expand-your-team-with-copilot) : cloud-agent exercise repository.
29. [Review pull requests](https://github.com/skills/review-pull-requests) : issue-based review exercise repository.



## Footnotes

[^25]: GECS project glossary, `CONTEXT.md`, inspected 2026-10-19. Source repository: https://github.com/igorsdub/gecs.
[^1]: [GitHub Skills catalog](https://github.com/skills).
[^2]: [Getting Started with GitHub Copilot](https://github.com/skills/getting-started-with-github-copilot).
[^3]: [Getting Started README](https://raw.githubusercontent.com/skills/getting-started-with-github-copilot/main/README.md).
[^4]: [Exercise Creator](https://github.com/skills/exercise-creator).
[^5]: [Exercise Template](https://github.com/skills/exercise-template).
[^6]: [Exercise Toolkit](https://github.com/skills/exercise-toolkit).
[^7]: [Toolkit start-exercise workflow](https://github.com/skills/exercise-toolkit/blob/main/.github/workflows/start-exercise.yml).
[^8]: [Toolkit find-exercise-issue workflow](https://github.com/skills/exercise-toolkit/blob/main/.github/workflows/find-exercise-issue.yml).
[^9]: [Template start workflow](https://github.com/skills/exercise-template/blob/main/.github/workflows/0-start-exercise.yml).
[^10]: [Creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template).
[^11]: [Inviting collaborators to a personal repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository).
[^12]: [Working collaboratively in a Codespace](https://docs.github.com/en/codespaces/developing-in-a-codespace/working-collaboratively-in-a-codespace).
[^13]: [Product usage included with each plan](https://docs.github.com/en/billing/reference/product-usage-included).
[^14]: [Getting the most out of included Codespaces usage](https://docs.github.com/en/codespaces/troubleshooting/troubleshooting-included-usage).
[^15]: [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans).
[^16]: [Using Copilot cloud agent on GitHub](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-on-github).
[^17]: [Kick off a task with Copilot agents on GitHub](https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/kick-off-a-task).
[^18]: [Apply to GitHub Education as a student](https://docs.github.com/en/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student).
[^19]: [Apply to GitHub Education as a teacher](https://docs.github.com/en/education/about-github-education/github-education-for-teachers/apply-to-github-education-as-a-teacher).
[^20]: [GitHub community announcement: Student AI credits](https://github.com/orgs/community/discussions/189268).
[^21]: [GitHub Changelog: Classroom sign-ups and retirement](https://github.blog/changelog/2026-05-26-github-classroom-sign-ups-are-no-longer-available/).
[^22]: [Carpentries workshops](https://carpentries.org/workshops/).
[^23]: [Carpentries instructor training: live coding](https://carpentries.github.io/instructor-training/instructor/17-live.html).
[^24]: [Carpentries lesson-development training: formative assessment](https://carpentries.github.io/lesson-development-training/formative-assessment.html).
[^26]: [Usage-based billing for individuals](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing).
[^27]: [Introduction to GitHub](https://github.com/skills/introduction-to-github).
[^28]: [Expand your team with Copilot](https://github.com/skills/expand-your-team-with-copilot).
[^29]: [Review pull requests](https://github.com/skills/review-pull-requests).

---

**Research conclusion:** Use GitHub Skills mechanics as the delivery pattern, a custom everyday-data dashboard as a pilot activity, and a Codespaces IDE agent as a bounded helper. Keep the pair workflow simple, build physical pairing into the default path, rehearse collaborator-trigger checks, and treat account and AI access as individual preflight conditions rather than promises.
