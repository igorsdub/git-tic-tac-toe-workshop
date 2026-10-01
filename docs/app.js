/**
 * Git Tic-Tac-Toe Workshop - Game Wall Application
 * 
 * Discovers pair game registration issues from GitHub, fetches raw board.txt
 * files, parses and validates board states, and renders responsive cards
 * on a public workshop game wall with auto-refresh every 30 seconds.
 */

(function () {
  'use strict';

  // --- Configuration ---
  const CONFIG = {
    REPO_OWNER: 'igorsdub',
    REPO_NAME: 'git-tic-tac-toe-workshop',
    REFRESH_INTERVAL_SEC: 30,
    STORAGE_KEY_THEME: 'ttt_gamewall_theme',
    DEFAULT_BRANCHES: ['main', 'master'],
  };

  const ISSUES_API_URL = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/issues?labels=game-registration&state=all&per_page=100`;
  const ALL_ISSUES_API_URL = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/issues?state=all&per_page=100`;

  // --- Fallback / Mock Data for Offline & Demo Modes ---
  const MOCK_GAMES = [
    {
      repoUrl: 'https://github.com/alice-researcher/git-ttt-pair1',
      owner: 'alice-researcher',
      repo: 'git-ttt-pair1',
      playerX: 'alice-researcher',
      playerO: 'bob-engineer',
      workshopName: 'SCDA Training Week',
      eventId: 'SCDA Training Week',
      boardContent: `# Git Tic-Tac-Toe
Player X: @alice-researcher
Player O: @bob-engineer
State: Waiting for O

\`\`\`text
 [X] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
\`\`\`
`,
    },
    {
      repoUrl: 'https://github.com/carol-dev/git-ttt-pair2',
      owner: 'carol-dev',
      repo: 'git-ttt-pair2',
      playerX: 'carol-dev',
      playerO: 'david-analyst',
      workshopName: 'SCDA Training Week',
      eventId: 'SCDA Training Week',
      boardContent: `# Git Tic-Tac-Toe
Player X: @carol-dev
Player O: @david-analyst
State: Waiting for X

\`\`\`text
 [X] | [O] | [ ]
-----+-----+-----
 [ ] | [X] | [ ]
-----+-----+-----
 [ ] | [ ] | [O]
\`\`\`
`,
    },
    {
      repoUrl: 'https://github.com/eva-student/git-ttt-pair3',
      owner: 'eva-student',
      repo: 'git-ttt-pair3',
      playerX: 'eva-student',
      playerO: 'frank-postdoc',
      workshopName: 'SCDA Training Week',
      eventId: 'SCDA Training Week',
      boardContent: `# Git Tic-Tac-Toe
Player X: @eva-student
Player O: @frank-postdoc
State: Ready for X

\`\`\`text
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
\`\`\`
`,
    },
    {
      repoUrl: 'https://github.com/grace-hopper/git-ttt-pair4',
      owner: 'grace-hopper',
      repo: 'git-ttt-pair4',
      playerX: 'grace-hopper',
      playerO: 'alan-turing',
      workshopName: 'SCDA Training Week',
      eventId: 'SCDA Training Week',
      boardContent: `# Git Tic-Tac-Toe
Player X: @grace-hopper
Player O: @alan-turing
State: X won

\`\`\`text
 [X] | [O] | [O]
-----+-----+-----
 [ ] | [X] | [ ]
-----+-----+-----
 [ ] | [ ] | [X]
\`\`\`
`,
    },
    {
      repoUrl: 'https://github.com/helen-pi/git-ttt-pair5',
      owner: 'helen-pi',
      repo: 'git-ttt-pair5',
      playerX: 'helen-pi',
      playerO: 'ian-fellow',
      workshopName: 'SCDA Training Week',
      eventId: 'SCDA Training Week',
      boardContent: `# Git Tic-Tac-Toe
Player X: @helen-pi
Player O: @ian-fellow
State: O won

\`\`\`text
 [O] | [O] | [O]
-----+-----+-----
 [X] | [X] | [ ]
-----+-----+-----
 [X] | [ ] | [ ]
\`\`\`
`,
    },
    {
      repoUrl: 'https://github.com/julia-phd/git-ttt-pair6',
      owner: 'julia-phd',
      repo: 'git-ttt-pair6',
      playerX: 'julia-phd',
      playerO: 'kevin-ra',
      workshopName: 'SCDA Training Week',
      eventId: 'SCDA Training Week',
      boardContent: `# Git Tic-Tac-Toe
Player X: @julia-phd
Player O: @kevin-ra
State: Draw

\`\`\`text
 [X] | [O] | [X]
-----+-----+-----
 [X] | [O] | [O]
-----+-----+-----
 [O] | [X] | [X]
\`\`\`
`,
    },
    {
      repoUrl: 'https://github.com/laura-sci/git-ttt-pair7',
      owner: 'laura-sci',
      repo: 'git-ttt-pair7',
      playerX: 'laura-sci',
      playerO: 'mike-fellow',
      workshopName: 'SCDA Training Week',
      eventId: 'SCDA Training Week',
      boardContent: `# Git Tic-Tac-Toe
Player X: @laura-sci
Player O: @mike-fellow
State: Waiting for O

\`\`\`text
 [X] | [X] | [X]
-----+-----+-----
 [O] | [O] | [O]
-----+-----+-----
 [ ] | [ ] | [ ]
\`\`\`
`,
    },
    {
      repoUrl: 'https://github.com/nina-coder/git-ttt-pair8',
      owner: 'nina-coder',
      repo: 'git-ttt-pair8',
      playerX: 'nina-coder',
      playerO: 'oscar-dev',
      workshopName: 'SCDA Training Week',
      eventId: 'SCDA Training Week',
      boardContent: `# Git Tic-Tac-Toe
Player X: @nina-coder
Player O: @oscar-dev
State: Waiting for O

\`\`\`text
 [X] | [O] | [X]
-----+-----+-----
 [ ] | [X] | [ ]
-----+-----+-----
 [O] | [ ] | [ ]
\`\`\`
`,
    }
  ];

  // --- State ---
  const state = {
    useDemoData: false,
    allGames: [],
    currentFilter: 'all', // 'all', 'pending', 'finished', 'errors'
    isLoading: false,
    lastUpdated: null,
    timerId: null,
  };

  // --- DOM Elements ---
  const DOM = {
    gameGrid: document.getElementById('game-grid'),
    loadingIndicator: document.getElementById('loading-indicator'),
    emptyState: document.getElementById('empty-state'),
    emptyMessage: document.getElementById('empty-message'),
    noticeBanner: document.getElementById('notice-banner'),
    noticeMessage: document.getElementById('notice-message'),
    noticeActionBtn: document.getElementById('notice-action-btn'),
    lastUpdated: document.getElementById('last-updated'),
    themeToggle: document.getElementById('theme-toggle'),
    toggleDataModeBtn: document.getElementById('toggle-data-mode-btn'),
    liveIndicator: document.getElementById('live-indicator'),
    tabErrors: document.getElementById('tab-errors'),
    counts: {
      all: document.getElementById('count-all'),
      pending: document.getElementById('count-pending'),
      finished: document.getElementById('count-finished'),
      errors: document.getElementById('count-errors'),
    },
  };

  // ==========================================
  // 1. Parsing & Board State Evaluation
  // ==========================================

  /**
   * Extracts repository owner and repository name from various GitHub URL formats.
   */
  function extractRepoInfo(urlOrText) {
    if (!urlOrText) return null;
    const match = urlOrText.match(/https?:\/\/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);
    if (!match) return null;

    let owner = match[1].trim();
    let repo = match[2].trim();

    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }
    repo = repo.replace(/\/+$/, '');

    return {
      owner,
      repo,
      cleanUrl: `https://github.com/${owner}/${repo}`,
    };
  }

  /**
   * Parses registration issue body and title.
   */
  function parseRegistrationIssue(body, title = '') {
    const text = body || '';
    let repoInfo = null;

    // Check for "### Repository URL"
    const formUrlMatch = text.match(/###\s*Repository\s*URL\s*\n+([^\n#]+)/i);
    if (formUrlMatch) {
      repoInfo = extractRepoInfo(formUrlMatch[1].trim());
    }

    // Fallback: check whole body
    if (!repoInfo) {
      repoInfo = extractRepoInfo(text);
    }

    // Fallback: check title
    if (!repoInfo && title) {
      repoInfo = extractRepoInfo(title);
    }

    if (!repoInfo) return null;

    // Extract Player X
    let playerX = null;
    const xMatch = text.match(/###\s*Player\s*X(?:\s*Handle)?\s*\n+([^\n#]+)/i);
    if (xMatch) {
      const val = xMatch[1].trim().replace(/^@+/, '');
      if (val && val !== '_No response_') playerX = val;
    }

    // Extract Player O
    let playerO = null;
    const oMatch = text.match(/###\s*Player\s*O(?:\s*Handle)?\s*\n+([^\n#]+)/i);
    if (oMatch) {
      const val = oMatch[1].trim().replace(/^@+/, '');
      if (val && val !== '_No response_') playerO = val;
    }

    // Extract Event ID / Workshop Name (default to 'SCDA Training Week')
    let eventId = 'SCDA Training Week';
    let workshopName = 'SCDA Training Week';
    const eventMatch = text.match(/###\s*(?:Workshop\s*Name|Event\s*ID|Session\s*Name|Event\s*ID\s*\/\s*Session\s*Name)\s*\n+([^\n#]+)/i);
    if (eventMatch) {
      const val = eventMatch[1].trim();
      if (val && val !== '_No response_') {
        eventId = val;
        workshopName = val;
      }
    }

    return {
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      repoUrl: repoInfo.cleanUrl,
      playerX,
      playerO,
      eventId,
      workshopName,
    };
  }

  /**
   * Helper to extract headers from board text.
   */
  function extractBoardHeader(text, regex) {
    const match = text.match(regex);
    if (!match) return null;
    return match[1].trim().replace(/^[*_`]+|[*_`]+$/g, '').trim();
  }

  /**
   * Tests whether a grid line is just a divider (e.g. `-----+-----+-----`).
   */
  function isDividerLine(line) {
    const s = line.trim();
    if (!s) return true;
    return /^[ \t\+\-\|\=]+$/.test(s) && s.includes('-');
  }

  /**
   * Parses an individual cell: returns 'X', 'O', or ' '
   */
  function parseCell(rawCell) {
    const c = rawCell.trim();
    if (c === '[ ]' || c === '[]' || c === '' || c === ' ' || c === '.' || c === '_') {
      return { mark: ' ', error: null };
    }
    if (/^\[\s*\]$/.test(c)) {
      return { mark: ' ', error: null };
    }
    if (/^\[?[1-9]\]?$/.test(c)) {
      return { mark: ' ', error: null };
    }
    if (c === '[X]' || c === '[x]' || c === 'X' || c === 'x' || /^\[\s*[Xx]\s*\]$/.test(c)) {
      return { mark: 'X', error: null };
    }
    if (c === '[O]' || c === '[o]' || c === 'O' || c === 'o' || /^\[\s*[Oo]\s*\]$/.test(c)) {
      return { mark: 'O', error: null };
    }
    return { mark: null, error: `Invalid cell: '${rawCell}'` };
  }

  /**
   * Finds winning line and returns winning coordinates if found.
   */
  function checkWinnerWithLine(grid, mark) {
    // Rows
    for (let r = 0; r < 3; r++) {
      if (grid[r][0] === mark && grid[r][1] === mark && grid[r][2] === mark) {
        return [[r, 0], [r, 1], [r, 2]];
      }
    }
    // Cols
    for (let c = 0; c < 3; c++) {
      if (grid[0][c] === mark && grid[1][c] === mark && grid[2][c] === mark) {
        return [[0, c], [1, c], [2, c]];
      }
    }
    // Diagonals
    if (grid[0][0] === mark && grid[1][1] === mark && grid[2][2] === mark) {
      return [[0, 0], [1, 1], [2, 2]];
    }
    if (grid[0][2] === mark && grid[1][1] === mark && grid[2][0] === mark) {
      return [[0, 2], [1, 1], [2, 0]];
    }
    return null;
  }

  /**
   * Parses board markdown and evaluates canonical state.
   */
  function evaluateBoardContent(content) {
    const errors = [];
    const warnings = [];

    if (!content || typeof content !== 'string') {
      return {
        isValid: false,
        state: 'Invalid board',
        declaredState: null,
        playerX: null,
        playerO: null,
        grid: [
          [' ', ' ', ' '],
          [' ', ' ', ' '],
          [' ', ' ', ' '],
        ],
        moveCounts: { X: 0, O: 0 },
        winningCells: null,
        errors: ['Board file is empty or could not be loaded.'],
        warnings: [],
      };
    }

    // 1. Players (optional metadata)
    const playerX = extractBoardHeader(content, /^[ \t]*\*?\*?Player\s+X\*?\*?:\s*(.+)$/m);
    const playerO = extractBoardHeader(content, /^[ \t]*\*?\*?Player\s+O\*?\*?:\s*(.+)$/m);

    if (!playerX) warnings.push("Missing 'Player X:' header; handle will be sourced from registration.");
    if (!playerO) warnings.push("Missing 'Player O:' header; handle will be sourced from registration.");

    // 2. Declared state
    const declaredState = extractBoardHeader(content, /^[ \t]*\*?\*?Stat(?:e|us)\*?\*?:\s*(.+)$/m);
    if (!declaredState) warnings.push("Missing 'State:' indicator line.");

    // 3. Grid
    const codeBlockMatch = content.match(/```(?:text)?\s*\n([\s\S]*?)\n```/);
    const gridText = codeBlockMatch ? codeBlockMatch[1] : content;

    const rawLines = gridText.split(/\r?\n/);
    const candidateLines = rawLines.filter(line => line.includes('|') && !isDividerLine(line));

    let parsedGrid = [
      [' ', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', ' '],
    ];

    if (candidateLines.length !== 3) {
      errors.push(`Grid must contain exactly 3 rows; found ${candidateLines.length}.`);
    } else {
      parsedGrid = [];
      for (let r = 0; r < 3; r++) {
        let line = candidateLines[r].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
          line = line.slice(1, -1);
        }
        const cells = line.split('|');
        if (cells.length !== 3) {
          errors.push(`Row ${r + 1} must have 3 columns; found ${cells.length}.`);
          continue;
        }

        const row = [];
        for (let c = 0; c < 3; c++) {
          const { mark, error } = parseCell(cells[c]);
          if (error) {
            errors.push(error);
            row.push('?');
          } else {
            row.push(mark);
          }
        }
        parsedGrid.push(row);
      }
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        state: 'Invalid board',
        declaredState,
        playerX,
        playerO,
        grid: parsedGrid.length === 3 ? parsedGrid : [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']],
        moveCounts: { X: 0, O: 0 },
        winningCells: null,
        errors,
        warnings,
      };
    }

    // 4. Move counts
    let countX = 0;
    let countO = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (parsedGrid[r][c] === 'X') countX++;
        if (parsedGrid[r][c] === 'O') countO++;
      }
    }
    const moveCounts = { X: countX, O: countO };

    // 5. Parity validation
    if (countO > countX) {
      errors.push(`Invalid parity: Player O has ${countO} moves, Player X has ${countX}. X moves first.`);
    }
    if (countX > countO + 1) {
      errors.push(`Invalid parity: Player X has ${countX} moves, Player O has ${countO}. Difference cannot exceed 1.`);
    }

    // 6. Win conditions
    const xWinCoords = checkWinnerWithLine(parsedGrid, 'X');
    const oWinCoords = checkWinnerWithLine(parsedGrid, 'O');

    if (xWinCoords && oWinCoords) {
      errors.push('Invalid board: Both Player X and Player O have winning lines.');
    }
    if (xWinCoords && countX !== countO + 1) {
      errors.push(`Invalid board: Player X won, but move counts are X=${countX}, O=${countO}. Expected X = O + 1.`);
    }
    if (oWinCoords && countX !== countO) {
      errors.push(`Invalid board: Player O won, but move counts are X=${countX}, O=${countO}. Expected X = O.`);
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        state: 'Invalid board',
        declaredState,
        playerX,
        playerO,
        grid: parsedGrid,
        moveCounts,
        winningCells: null,
        errors,
        warnings,
      };
    }

    // 7. Evaluated Canonical State
    let evaluatedState;
    let winningCells = null;

    if (xWinCoords) {
      evaluatedState = 'X won';
      winningCells = xWinCoords;
    } else if (oWinCoords) {
      evaluatedState = 'O won';
      winningCells = oWinCoords;
    } else if (countX + countO === 9) {
      evaluatedState = 'Draw';
    } else if (countX === 0 && countO === 0) {
      evaluatedState = 'Ready for X';
    } else if (countX === countO) {
      evaluatedState = 'Waiting for X';
    } else if (countX === countO + 1) {
      evaluatedState = 'Waiting for O';
    } else {
      evaluatedState = 'Invalid board';
    }

    // Check declared vs evaluated
    if (declaredState && declaredState.toLowerCase() !== evaluatedState.toLowerCase()) {
      warnings.push(`Declared state '${declaredState}' does not match evaluated state '${evaluatedState}'.`);
    }

    return {
      isValid: true,
      state: evaluatedState,
      declaredState,
      playerX,
      playerO,
      grid: parsedGrid,
      moveCounts,
      winningCells,
      errors: [],
      warnings,
    };
  }

  // ==========================================
  // 2. Data Fetching
  // ==========================================

  /**
   * Attempts to fetch raw board.txt from branches: 'main', then 'master'.
   */
  async function fetchRawBoard(owner, repo) {
    for (const branch of CONFIG.DEFAULT_BRANCHES) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/board.txt?t=${Date.now()}`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          return { content: text, branch, error: null };
        }
      } catch (e) {
        // Continue to fallback branch
      }
    }
    return {
      content: null,
      branch: null,
      error: 'Could not fetch board.txt on main or master branches.',
    };
  }

  /**
   * Fetches registration issues from GitHub API or falls back to mock data.
   */
  async function loadGames() {
    setLoading(true);

    if (state.useDemoData) {
      loadMockData('Showing Demo Games (Manual Demo Mode)');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(ISSUES_API_URL);

      if (res.status === 403) {
        // GitHub API rate-limited
        showNotice(
          'GitHub API rate limit reached. Displaying simulated workshop games.',
          'notice-warning'
        );
        loadMockData();
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`GitHub API responded with status ${res.status}`);
      }

      let issues = await res.json();

      // Defensive fallback: if no issues found with label 'game-registration',
      // fetch issues without label filter and match issues with label OR '[Game Registration]' title prefix
      if (!Array.isArray(issues) || issues.length === 0) {
        try {
          const fallbackRes = await fetch(ALL_ISSUES_API_URL);
          if (fallbackRes.ok) {
            const allIssues = await fallbackRes.json();
            if (Array.isArray(allIssues)) {
              issues = allIssues.filter((issue) => {
                const hasLabel = issue.labels && issue.labels.some((l) => l.name === 'game-registration');
                const hasTitle = (issue.title || '').toLowerCase().includes('[game registration]');
                return hasLabel || hasTitle;
              });
            }
          }
        } catch (fallbackErr) {
          console.warn('Fallback issue discovery error:', fallbackErr);
        }
      }

      hideNotice();

      if (!Array.isArray(issues) || issues.length === 0) {
        // No registration issues yet
        showNotice(
          'No pair games registered yet. Showing demo games until pairs submit registration issues.',
          'notice-info'
        );
        loadMockData();
        setLoading(false);
        return;
      }

      const parsedRegistrations = [];
      for (const issue of issues) {
        const reg = parseRegistrationIssue(issue.body, issue.title);
        if (reg) {
          parsedRegistrations.push(reg);
        }
      }

      if (parsedRegistrations.length === 0) {
        showNotice(
          'No valid game repository URLs found in registered issues. Showing demo games.',
          'notice-info'
        );
        loadMockData();
        setLoading(false);
        return;
      }

      // Fetch boards concurrently
      const gamePromises = parsedRegistrations.map(async (reg) => {
        const { content, error } = await fetchRawBoard(reg.owner, reg.repo);
        let evaluation;
        if (error) {
          evaluation = {
            isValid: false,
            state: 'Invalid board',
            declaredState: null,
            playerX: reg.playerX,
            playerO: reg.playerO,
            grid: [
              [' ', ' ', ' '],
              [' ', ' ', ' '],
              [' ', ' ', ' '],
            ],
            moveCounts: { X: 0, O: 0 },
            winningCells: null,
            errors: [error],
            warnings: [],
          };
        } else {
          evaluation = evaluateBoardContent(content);
          // Prefer handles from board, fallback to issue
          if (!evaluation.playerX && reg.playerX) evaluation.playerX = reg.playerX;
          if (!evaluation.playerO && reg.playerO) evaluation.playerO = reg.playerO;
        }

        return {
          owner: reg.owner,
          repo: reg.repo,
          repoUrl: reg.repoUrl,
          eventId: reg.eventId,
          workshopName: reg.workshopName || reg.eventId || 'SCDA Training Week',
          ...evaluation,
        };
      });

      state.allGames = await Promise.all(gamePromises);
      state.lastUpdated = new Date();
      render();
    } catch (err) {
      console.warn('Network or API failure fetching live games:', err);
      showNotice(
        'Offline or network issue connecting to GitHub. Displaying cached demo games.',
        'notice-warning'
      );
      loadMockData();
    } finally {
      setLoading(false);
    }
  }

  function loadMockData(message) {
    if (message) {
      showNotice(message, 'notice-info');
    }
    state.allGames = MOCK_GAMES.map((mock) => {
      const evaluation = evaluateBoardContent(mock.boardContent);
      return {
        owner: mock.owner,
        repo: mock.repo,
        repoUrl: mock.repoUrl,
        eventId: mock.eventId,
        workshopName: mock.workshopName || mock.eventId || 'SCDA Training Week',
        ...evaluation,
      };
    });
    state.lastUpdated = new Date();
    render();
  }

  // ==========================================
  // 3. UI Rendering & Interactions
  // ==========================================

  function getBadgeClass(stateName) {
    switch (stateName) {
      case 'Ready for X': return 'badge-ready';
      case 'Waiting for X': return 'badge-wait-x';
      case 'Waiting for O': return 'badge-wait-o';
      case 'X won': return 'badge-x-win';
      case 'O won': return 'badge-o-win';
      case 'Draw': return 'badge-draw';
      default: return 'badge-error';
    }
  }

  function getStatusIcon(stateName) {
    switch (stateName) {
      case 'Ready for X': return '▶️';
      case 'Waiting for X': return '⏳';
      case 'Waiting for O': return '⏳';
      case 'X won': return '🏆';
      case 'O won': return '🏆';
      case 'Draw': return '🤝';
      default: return '⚠️';
    }
  }

  function cleanHandle(handle) {
    if (!handle) return 'Unknown';
    return handle.replace(/^@+/, '').trim();
  }

  function getAvatarUrl(handle) {
    const cleaned = cleanHandle(handle);
    if (!cleaned || cleaned === 'Unknown' || cleaned.startsWith('[')) {
      return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%23e5e7eb"/><text x="16" y="21" font-size="14" text-anchor="middle" fill="%234b5563">👤</text></svg>';
    }
    return `https://github.com/${cleaned}.png?size=64`;
  }

  function formatTime(date) {
    if (!date) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function isCellWinning(winningCells, r, c) {
    if (!winningCells) return false;
    return winningCells.some(([wr, wc]) => wr === r && wc === c);
  }

  function renderCard(game) {
    const badgeClass = getBadgeClass(game.state);
    const statusIcon = getStatusIcon(game.state);
    const playerX = cleanHandle(game.playerX);
    const playerO = cleanHandle(game.playerO);

    // Board table cells
    let cellsHtml = '';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const mark = game.grid && game.grid[r] ? game.grid[r][c] : ' ';
        const isWin = isCellWinning(game.winningCells, r, c);
        const markClass = mark === 'X' ? 'cell-x' : mark === 'O' ? 'cell-o' : 'cell-empty';
        const winClass = isWin ? 'cell-winning' : '';

        cellsHtml += `
          <div class="board-cell ${markClass} ${winClass}" data-row="${r}" data-col="${c}">
            ${mark !== ' ' ? mark : ''}
          </div>
        `;
      }
    }

    // Errors HTML
    let errorsHtml = '';
    if (game.errors && game.errors.length > 0) {
      errorsHtml = `
        <div class="card-errors">
          <strong>Issues detected:</strong>
          <ul>
            ${game.errors.map(err => `<li>${escapeHtml(err)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    return `
      <article class="game-card" data-repo="${escapeHtml(game.repo)}">
        <div class="card-header">
          <div class="card-repo">
            <a href="${escapeHtml(game.repoUrl)}" target="_blank" rel="noopener noreferrer" class="repo-link" title="${escapeHtml(game.repoUrl)}">
              📦 ${escapeHtml(game.owner)}/${escapeHtml(game.repo)}
            </a>
            <span class="card-workshop">${escapeHtml(game.workshopName || game.eventId || 'SCDA Training Week')}</span>
          </div>
          <span class="status-badge ${badgeClass}">
            <span>${statusIcon}</span> ${escapeHtml(game.state)}
          </span>
        </div>

        <div class="card-players">
          <div class="player-info player-x">
            <img src="${getAvatarUrl(playerX)}" alt="${escapeHtml(playerX)}" class="player-avatar" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><circle cx=%2216%22 cy=%2216%22 r=%2216%22 fill=%22%23e5e7eb%22/><text x=%2216%22 y=%2221%22 font-size=%2214%22 text-anchor=%22middle%22 fill=%22%234b5563%22>X</text></svg>'">
            <div class="player-details">
              <span class="player-role role-x">Player X</span>
              <a href="https://github.com/${escapeHtml(playerX)}" target="_blank" rel="noopener noreferrer" class="player-handle">
                @${escapeHtml(playerX)}
              </a>
            </div>
          </div>

          <span class="players-vs">vs</span>

          <div class="player-info player-o">
            <div class="player-details">
              <span class="player-role role-o">Player O</span>
              <a href="https://github.com/${escapeHtml(playerO)}" target="_blank" rel="noopener noreferrer" class="player-handle">
                @${escapeHtml(playerO)}
              </a>
            </div>
            <img src="${getAvatarUrl(playerO)}" alt="${escapeHtml(playerO)}" class="player-avatar" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><circle cx=%2216%22 cy=%2216%22 r=%2216%22 fill=%22%23e5e7eb%22/><text x=%2216%22 y=%2221%22 font-size=%2214%22 text-anchor=%22middle%22 fill=%22%234b5563%22>O</text></svg>'">
          </div>
        </div>

        <div class="card-board-wrapper">
          <div class="board-grid-table" aria-label="Tic-Tac-Toe Board">
            ${cellsHtml}
          </div>
        </div>

        ${errorsHtml}
      </article>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function updateTabCounts(allGames) {
    let countAll = allGames.length;
    let countPending = 0;
    let countFinished = 0;
    let countErrors = 0;

    for (const g of allGames) {
      if (!g.isValid || g.state === 'Invalid board') {
        countErrors++;
      } else if (g.state === 'X won' || g.state === 'O won' || g.state === 'Draw') {
        countFinished++;
      } else if (g.state === 'Waiting for X' || g.state === 'Waiting for O' || g.state === 'Ready for X') {
        countPending++;
      }
    }

    if (DOM.counts.all) DOM.counts.all.textContent = countAll;
    if (DOM.counts.pending) DOM.counts.pending.textContent = countPending;
    if (DOM.counts.finished) DOM.counts.finished.textContent = countFinished;
    if (DOM.counts.errors) DOM.counts.errors.textContent = countErrors;

    if (DOM.tabErrors) {
      DOM.tabErrors.style.display = countErrors > 0 ? 'inline-flex' : 'none';
    }
  }

  function filterGames() {
    return state.allGames.filter((g) => {
      if (state.currentFilter === 'pending') {
        return g.isValid && (g.state === 'Waiting for X' || g.state === 'Waiting for O' || g.state === 'Ready for X');
      }
      if (state.currentFilter === 'finished') {
        return g.isValid && (g.state === 'X won' || g.state === 'O won' || g.state === 'Draw');
      }
      if (state.currentFilter === 'errors') {
        return !g.isValid || g.state === 'Invalid board';
      }
      return true; // 'all'
    });
  }

  function render() {
    updateTabCounts(state.allGames);

    const filtered = filterGames();

    if (state.lastUpdated && DOM.lastUpdated) {
      DOM.lastUpdated.textContent = `Updated ${formatTime(state.lastUpdated)}`;
    }

    if (filtered.length === 0) {
      DOM.gameGrid.innerHTML = '';
      DOM.emptyState.classList.remove('hidden');
      if (state.allGames.length === 0) {
        DOM.emptyMessage.textContent = 'No pair games have registered yet.';
      } else {
        DOM.emptyMessage.textContent = 'No games match the selected filter.';
      }
    } else {
      DOM.emptyState.classList.add('hidden');
      DOM.gameGrid.innerHTML = filtered.map(renderCard).join('');
    }
  }

  function setLoading(loading) {
    state.isLoading = loading;
    if (loading) {
      DOM.loadingIndicator.classList.remove('hidden');
      if (DOM.liveIndicator) DOM.liveIndicator.classList.add('warning');
    } else {
      DOM.loadingIndicator.classList.add('hidden');
      if (DOM.liveIndicator) DOM.liveIndicator.classList.remove('warning');
    }
  }

  function showNotice(msg, type = 'notice-info') {
    DOM.noticeMessage.textContent = msg;
    DOM.noticeBanner.className = `notice-banner ${type}`;
    DOM.noticeBanner.classList.remove('hidden');
  }

  function hideNotice() {
    DOM.noticeBanner.classList.add('hidden');
  }

  // ==========================================
  // 4. Auto-Refresh Polling
  // ==========================================

  function startPolling() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(() => {
      loadGames();
    }, CONFIG.REFRESH_INTERVAL_SEC * 1000);
  }

  // ==========================================
  // 5. Theme Handling
  // ==========================================

  function initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEY_THEME);
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.STORAGE_KEY_THEME, theme);
    if (DOM.themeToggle) {
      DOM.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // ==========================================
  // 6. Event Listeners
  // ==========================================

  function setupEventListeners() {
    // Theme toggle
    if (DOM.themeToggle) {
      DOM.themeToggle.addEventListener('click', toggleTheme);
    }

    // Filter tabs
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter') || 'all';
        state.currentFilter = filter;
        tabs.forEach((t) => {
          if (t === tab) {
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });
        render();
      });
    });

    // Toggle between live and demo mode
    if (DOM.toggleDataModeBtn) {
      DOM.toggleDataModeBtn.addEventListener('click', () => {
        state.useDemoData = !state.useDemoData;
        DOM.toggleDataModeBtn.textContent = state.useDemoData
          ? 'Switch to Live GitHub Data'
          : 'Switch to Demo Data';
        loadGames();
      });
    }
  }

  // ==========================================
  // 7. Initialization
  // ==========================================

  function init() {
    initTheme();
    setupEventListeners();
    startPolling();
    loadGames();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
