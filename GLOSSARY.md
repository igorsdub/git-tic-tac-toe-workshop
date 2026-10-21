# Glossary

**Workshop**: A particular scheduled delivery of the training. Matches shown for the workshop are discovered from branches in repositories linked to it.

**Workshop ID**: A stable identifier for one workshop, written as `YYYY-MM-DD-short-lowercase-identifier`. Once registrations exist for a workshop, its ID remains unchanged. Its display name is separate from its ID.

**Archived workshop**: A workshop explicitly marked archived by the organizer. It remains viewable and its dashboard continues receiving repository and match updates. It accepts updates to existing registrations, including player handles, but rejects new repository registrations.

**Registration**: A connection between a repository and a workshop, with two player GitHub handles supplied for avatars. The dashboard watches the registered repository. Repeating registration for the same repository and workshop updates the existing registration and its handles rather than creating another dashboard entry. Among valid registration issues for that repository and workshop, the newest issue supplies the handles; corrections are submitted through a new form entry.

**Repository**: The GitHub repository connected to one workshop by a registration. A repository belongs to only one workshop; its branches are the source from which the dashboard discovers matches.

**Match**: One play-through of tic-tac-toe represented by a repository branch. Matches are discovered automatically from branches; each match is not registered separately. A pair may play multiple matches during a workshop.

**Game**: The collaborative tic-tac-toe activity in general. Use *match* for one play-through.

**Stage**: One numbered step of the learner's path through the training, shown on every learner page. Stages are ordered: Setup (before the session), How to play (in the session), Game Wall (watching matches).

**Setup track**: The variant of the Setup stage a workshop uses, determined by how learners get a working environment. The Codespaces track needs only a browser; the local track needs software installed on the learner's own computer. A workshop without a setup track has no setup instructions yet.

**Readiness check**: The single observable result that tells a learner the Setup stage is complete. For the Codespaces track it is Copilot Chat correctly describing the repository, followed by the learner stopping their Codespace.
