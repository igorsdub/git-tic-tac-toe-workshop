# Workshop site revision

This note records the approved design and its remaining decisions. The shared header selector, formatted workshop labels, workshop action row, header controls, registration-button colors, themed X/O logo and favicon, setup flow, and learner guide are implemented.

## Approved plan

- Keep a shared workshop selector in the header on every route and retain the selected workshop in the URL.
- Remove the repeated workshop description and date below the selector. Put **Register repository** and **View all games** together in one action row.
- Format the displayed date and name exactly as `2026 Nov 6 · SOKENDAI`: year, abbreviated month, day, then the name in uppercase. Catalog dates remain authoritative.
- Start the setup route with **Survey** as a plain link to [the survey](https://docs.google.com/forms/d/e/1FAIpQLSfLyChJpWXVWAoScFT5XNU68FZxRMuR4Nv0AN9HUSvOE8v1EA/viewform?usp=header); do not embed the form.
- Follow with **Getting started**: required GitHub account instructions, immediately followed in that same section by the optional GitHub Student Developer Pack for eligible students. Keep titles plain and short.
- Place **Checklist** after Survey and Getting started, and keep existing practical setup instructions. Emphasize the public repository and Codespaces, and retain the quoted “template” wording and **Use this template → Create a new repository** action.
- In the learner guide, teach **One move** first, then the Copilot-assisted **Rematch**, with **Rewind** as an optional activity. Keep the manual workflow first and Copilot later.
- Explain that match branches start from clean `main` and qualify when their names begin with lowercase `match`; use clear branch-name examples.
- Use a static favicon showing X and O side by side.
- Group **How to play**, **Setup**, and the theme toggle together on every route. Use the X/O artwork for the site logo and favicon, switching between black on white in light theme and white on black in dark theme.
- Keep the GitHub repository logo visible on the main, setup, and guide routes.
- Keep the **Git Tic-Tac-Toe** header title black in light theme and white in dark theme, including hover and visited states.
- Give every **Register repository** button a white background, black text, and a visible outline in both themes, including dynamic empty states. Do not tint the button blue.
