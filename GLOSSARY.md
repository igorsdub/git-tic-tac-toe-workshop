# Glossary

**Workshop**: A particular scheduled delivery of the training. Matches shown for the workshop are discovered from branches in repositories linked to it.

**Workshop ID**: A stable identifier for one workshop, written as `YYYY-MM-DD-short-lowercase-identifier`. Once registrations exist for a workshop, its ID remains unchanged. Its display name is separate from its ID.

**Registration**: A connection between a repository and a workshop, with two player GitHub handles supplied for avatars. The dashboard watches the registered repository. Repeating registration for the same repository and workshop updates the existing registration and its handles rather than creating another dashboard entry.

**Repository**: The GitHub repository connected to one workshop by a registration. A repository belongs to only one workshop; its branches are the source from which the dashboard discovers matches.

**Match**: One play-through of tic-tac-toe represented by a repository branch. Matches are discovered automatically from branches; each match is not registered separately. A pair may play multiple matches during a workshop.

**Game**: The collaborative tic-tac-toe activity in general. Use *match* for one play-through.
