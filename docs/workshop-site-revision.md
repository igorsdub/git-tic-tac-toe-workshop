# Workshop site revision

This note records the approved design direction and implementation sequence. The current implementation slice covers only the shared header controls, registration-button colors, and favicon. Workshop selector and page-content changes remain for a later slice.

## Approved plan

- Keep a shared workshop selector in the header on every route and retain the selected workshop in the URL.
- Remove the repeated workshop description and date below the selector. Put **Register repository** and **View all games** together in one action row.
- Format the displayed date and name exactly as `2026 Nov 6 · SOKEDAI`: year, abbreviated month, day, then the name in uppercase. Catalog dates remain authoritative.
- Start the setup route with **Survey** as a plain link to [the survey](https://docs.google.com/forms/d/e/1FAIpQLSfLyChJpWXVWAoScFT5XNU68FZxRMuR4Nv0AN9HUSvOE8v1EA/viewform?usp=header); do not embed the form.
- Follow with **Getting started**: required GitHub account instructions, immediately followed in that same section by the optional GitHub Student Developer Pack for eligible students. Keep titles plain and short.
- Place the practical checklist after those sections. Its exact title and order are still pending. Include the quoted template prompt in the checklist.
- In the learner guide, teach **One move** first, then the Copilot-assisted **Rematch**, with **Rewind** as an optional activity. Keep the manual workflow first and Copilot later.
- Explain that match branches start from clean `main` and qualify when their names begin with lowercase `match`; use clear branch-name examples.
- Use a static favicon showing X and O side by side. Do not add diagrams.
- Keep a shared GitHub logo visible on the main, setup, and guide routes, with the theme toggle aligned beside the neighboring header controls.
- Give every **Register repository** button a white background, black text, and a visible outline in both themes, including dynamic empty states. Do not tint the button blue.

## Still pending

- Exact title and order for the practical checklist.
- Final theme alignment details.
