/**
 * Git Tic-Tac-Toe Workshop - Game Wall Application
 * 
 * Reads branch-specific match records, renders outcomes and errors, and offers
 * an instructor replay of committed BOARD.txt states from GitHub history.
 */

(function () {
  'use strict';

  // --- Configuration ---
  const CONFIG = {
    REPO_OWNER: 'igorsdub',
    REPO_NAME: 'git-tic-tac-toe-workshop',
    REFRESH_INTERVAL_SEC: 30,
    FETCH_TIMEOUT_MS: 10000,
  };

  const BOARD_REGISTRY_URL = `./board.json`;
  const RAW_BOARD_REGISTRY_URL = `https://raw.githubusercontent.com/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/main/docs/board.json`;
  const MATCH_DATA = window.MatchData;

  // --- Fallback / Mock Data for Offline & Demo Modes ---
  const MOCK_GAMES = [
    {
      repoUrl: 'https://github.com/alice-researcher/git-ttt-pair1',
      owner: 'alice-researcher',
      repo: 'git-ttt-pair1',
      playerX: 'alice-researcher',
      playerO: 'bob-engineer',
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
    catalog: null,
    activeWorkshopId: null,
    lastLoadError: null,
    currentFilter: 'all', // 'all', 'pending', 'finished', 'errors'
    hasLoaded: false,
    loadController: null,
    lastUpdated: null,
    timerId: null,
    historyByMatch: {},
    pendingRender: false,
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

  function extractCompactGridLines(text) {
    const codeBlockMatch = text.match(/```(?:text)?\s*\n([\s\S]*?)\n```/);
    const gridText = codeBlockMatch ? codeBlockMatch[1] : text;
    return gridText.split(/\r?\n/).filter((line) => line.trim().length > 0);
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
    const legacyLines = rawLines.filter(line => line.includes('|') && !isDividerLine(line));
    const compactLines = extractCompactGridLines(gridText);
    const compactFormat = legacyLines.length === 0;
    const candidateLines = legacyLines.length > 0 ? legacyLines : compactLines;

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
        const rawLine = candidateLines[r];
        let line = rawLine.trim();
        if (compactFormat) {
          if (!/^[.XO](?: [XO.]){2}$/.test(rawLine)) {
            errors.push(`Row ${r + 1} must contain three cells separated by single spaces.`);
            continue;
          }
          parsedGrid.push(rawLine.split(' ').map((cell) => (cell === '.' ? ' ' : cell)));
          continue;
        }
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

  async function loadWorkshopCatalog() {
    const context = await window.WorkshopContext.ready;
    state.catalog = context.catalog;
    state.activeWorkshopId = context.workshopId;
  }

  function selectedWorkshop() {
    return state.catalog && state.catalog.workshops.find((workshop) => workshop.id === state.activeWorkshopId);
  }

  function workshopGames() {
    return state.allGames.filter((game) => game.workshopId === state.activeWorkshopId);
  }

  function updateWorkshopNotice() {
    if (state.lastLoadError) {
      showNotice(`${state.lastLoadError} Showing the last successfully loaded workshop snapshot.`, 'notice-warning');
      return;
    }
    if (state.useDemoData) {
      showNotice('Showing demo records for the selected workshop (Manual Demo Mode)', 'notice-info');
      return;
    }
    const games = workshopGames();
    const staleCount = games.filter((match) => match.refreshStatus === 'stale').length;
    const errorCount = games.filter((match) => match.status === 'error').length;
    if (staleCount > 0 || errorCount > 0) {
      const messages = [];
      if (staleCount > 0) {
        messages.push(`${staleCount} ${staleCount === 1 ? 'match is' : 'matches are'} showing the last known board after a refresh failure. See marked cards for details.`);
      }
      if (errorCount > 0) {
        messages.push(`${errorCount} registered ${errorCount === 1 ? 'match needs' : 'matches need'} attention. Open an Issues card for the reason.`);
      }
      showNotice(messages.join(' '), 'notice-warning');
    } else if (games.length === 0) {
      showNotice('No matching branches have been discovered for this workshop yet. Registered repositories appear here after a branch whose name begins with “match” is discovered.', 'notice-info');
    } else {
      hideNotice();
    }
  }

  /** Reject with an AbortError as soon as `signal` aborts, even if `promise` never settles. */
  function abortable(promise, signal) {
    return new Promise((resolve, reject) => {
      const abortError = () => new DOMException('The load was aborted.', 'AbortError');
      if (signal.aborted) {
        reject(abortError());
        return;
      }
      const onAbort = () => reject(abortError());
      signal.addEventListener('abort', onAbort, { once: true });
      promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
    });
  }

  /**
   * Load the generated branch snapshot; browser visitors make no GitHub API requests.
   * A background tick is skipped while a load is running; a user-initiated load
   * (`force`) supersedes it. The spinner shows on the first load only. Every step
   * runs inside try so the in-flight guard is always cleared in finally.
   */
  async function loadGames({ force = false } = {}) {
    if (state.loadController) {
      if (!force) return;
      state.loadController.abort();
    }
    const controller = new AbortController();
    state.loadController = controller;
    const isCurrent = () => state.loadController === controller;
    // After every await: stop if a newer load took over, or if this one timed out.
    const ensureCurrent = () => {
      if (!isCurrent() || controller.signal.aborted) throw new DOMException('The load was aborted.', 'AbortError');
    };
    let timedOut = false;
    let timer = null;
    let showSpinner = false;

    try {
      timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, CONFIG.FETCH_TIMEOUT_MS);
      showSpinner = !state.hasLoaded;
      if (showSpinner) setLoading(true);

      if (!state.catalog) {
        await abortable(loadWorkshopCatalog(), controller.signal);
        ensureCurrent();
      }
      if (state.useDemoData) {
        loadMockData();
        return;
      }
      let response = await fetch(`${BOARD_REGISTRY_URL}?t=${Date.now()}`, { signal: controller.signal });
      ensureCurrent();
      if (!response.ok) {
        response = await fetch(`${RAW_BOARD_REGISTRY_URL}?t=${Date.now()}`, { signal: controller.signal });
        ensureCurrent();
      }
      if (!response.ok) throw new Error(`Match registry unavailable (HTTP ${response.status}).`);
      const records = await response.json();
      ensureCurrent();
      if (!Array.isArray(records)) throw new Error('The match registry did not contain a list of records.');

      const registered = records.map((record) => MATCH_DATA.normalizeMatch(record));
      // BOARD.txt is validated during the authenticated registry refresh. Keep the
      // generated snapshot intact and avoid unauthenticated per-card requests.
      state.allGames = registered.map((match) => ({
        ...match,
        isValid: match.boardValid === true && match.status !== 'error',
        grid: match.boardValid === true ? match.board : null,
      }));
      state.lastUpdated = new Date();
      state.lastLoadError = null;
      updateWorkshopNotice();
      render();
    } catch (err) {
      // A superseded load was aborted on purpose; the newer load owns the UI.
      if (!isCurrent()) return;
      console.warn('Network or API failure fetching live games:', err);
      // Keep the last successful snapshot visible during a transient polling failure.
      state.lastLoadError = timedOut
        ? `Match registry did not respond within ${CONFIG.FETCH_TIMEOUT_MS / 1000} seconds.`
        : err.message;
      updateWorkshopNotice();
      render();
    } finally {
      if (timer) clearTimeout(timer);
      if (isCurrent()) {
        state.loadController = null;
        state.hasLoaded = true;
        if (showSpinner) setLoading(false);
      }
    }
  }

  function loadMockData(message) {
    state.lastLoadError = null;
    state.allGames = MOCK_GAMES.map((mock) => {
      const evaluation = evaluateBoardContent(mock.boardContent);
      return {
        owner: mock.owner,
        repo: mock.repo,
        repoUrl: mock.repoUrl,
        branch: 'match-01',
        matchKey: `${mock.owner}/${mock.repo}#match-01`,
        workshopId: state.activeWorkshopId,
        eventId: 'Demo data',
        workshopName: 'Demo data',
        isDemo: true,
        status: evaluation.isValid && ['X won', 'O won', 'Draw'].includes(evaluation.state) ? 'completed' : (evaluation.isValid ? 'in_progress' : 'error'),
        boardValid: evaluation.isValid,
        board: evaluation.grid,
        isValid: evaluation.isValid,
        errors: evaluation.errors,
        ...evaluation,
      };
    });
    state.lastUpdated = new Date();
    updateWorkshopNotice();
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

  /** One role="row" wrapper per grid row; the wrapper is layout-neutral (display: contents). */
  function renderBoardRows(grid, winningCells) {
    let rowsHtml = '';
    for (let r = 0; r < 3; r++) {
      let cellsHtml = '';
      for (let c = 0; c < 3; c++) {
        const mark = grid && grid[r] ? grid[r][c] : ' ';
        const markClass = mark === 'X' ? 'cell-x' : mark === 'O' ? 'cell-o' : 'cell-empty';
        const winClass = isCellWinning(winningCells, r, c) ? 'cell-winning' : '';
        cellsHtml += `<div class="board-cell ${markClass} ${winClass}" role="gridcell" aria-label="Row ${r + 1}, column ${c + 1}: ${mark === ' ' ? 'empty' : mark}" data-row="${r}" data-col="${c}">${mark !== ' ' ? mark : ''}</div>`;
      }
      rowsHtml += `<div class="board-row" role="row">${cellsHtml}</div>`;
    }
    return rowsHtml;
  }

  function renderCard(game) {
    const badgeClass = getBadgeClass(game.state);
    const statusIcon = getStatusIcon(game.state);
    const playerX = cleanHandle(game.playerX);
    const playerO = cleanHandle(game.playerO);

    const cellsHtml = renderBoardRows(game.grid, game.winningCells);

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

    const boardLabel = game.refreshStatus === 'stale' ? 'Last known board' : 'Current board';
    const boardHtml = game.isValid && game.grid
      ? `<div class="card-board-wrapper"><div class="board-grid-table" role="grid" aria-label="${boardLabel} for ${escapeHtml(game.branch)}">${cellsHtml}</div></div>`
      : '<div class="board-unavailable">No validated board is available for this match.</div>';
    const historyUrl = game.historyUrl;
    const historyState = MATCH_DATA.historyButtonState(state.historyByMatch[game.matchKey]);
    const historyHtml = historyUrl
      ? `<details class="history-details" data-history-for="${escapeHtml(game.matchKey)}">
          <summary>Replay committed board history</summary>
          <p class="history-help">History is ordered from the branch’s first committed board to its latest. If replay cannot load, use <a href="${escapeHtml(historyUrl)}" target="_blank" rel="noopener noreferrer">GitHub commit history</a>.</p>
          <button class="btn btn-sm btn-outline history-load-button" type="button" data-history-action="load" data-history-loaded="${historyState.loaded}" data-match-key="${escapeHtml(game.matchKey)}">${historyState.label}</button>
          <div class="history-panel" data-history-panel="${escapeHtml(game.matchKey)}" aria-live="polite"></div>
        </details>`
      : '';
    const refreshErrors = [game.repositoryRefreshError, game.boardRefreshError].filter(Boolean);
    const refreshStatusHtml = game.refreshStatus === 'stale'
      ? `<p class="card-refresh-status" role="status"><strong>Showing last known board.</strong> Refresh failed: ${refreshErrors.map(escapeHtml).join(' ') || 'The latest repository refresh did not complete.'}</p>`
      : '';

    return `
      <article class="game-card" data-match-key="${escapeHtml(game.matchKey)}">
        <div class="card-header">
          <div class="card-repo">
            <a href="${escapeHtml(game.repoUrl)}" target="_blank" rel="noopener noreferrer" class="repo-link" title="${escapeHtml(game.repoUrl)}">
              📦 ${escapeHtml(game.owner)}/${escapeHtml(game.repo)}
            </a>
            <span class="card-workshop">${escapeHtml(game.isDemo ? 'Demo data' : (selectedWorkshop()?.name || ''))}</span>
            ${game.branch ? `<a class="card-branch" href="${escapeHtml(game.repoUrl)}/tree/${encodeURIComponent(game.branch)}" target="_blank" rel="noopener noreferrer">Branch: ${escapeHtml(game.branch)}</a>` : '<span class="card-branch">No match branch registered</span>'}
          </div>
          <span class="status-badge ${badgeClass}">
            <span>${statusIcon}</span> ${game.refreshStatus === 'stale' ? 'Last known: ' : ''}${escapeHtml(game.state)}
          </span>
        </div>

        ${refreshStatusHtml}

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

        ${boardHtml}

        ${errorsHtml}
        ${historyHtml}
      </article>
    `;
  }

  function renderHistoryPanel(match, history, index = 0) {
    const panel = DOM.gameGrid.querySelector(`[data-history-panel="${CSS.escape(match.matchKey)}"]`);
    if (!panel) return;
    const historyLink = history.historyUrl
      ? `<a href="${escapeHtml(history.historyUrl)}" target="_blank" rel="noopener noreferrer">Open this branch’s GitHub commit history</a>`
      : '';
    const errorsHtml = history.errors.length
      ? `<div class="history-errors" role="alert"><strong>Some history could not be replayed.</strong><ul>${history.errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>${historyLink}</div>`
      : '';
    if (history.entries.length === 0) {
      panel.replaceChildren();
      panel.innerHTML = `${errorsHtml || '<p>No valid committed board states were found.</p>'}`;
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, history.entries.length - 1));
    const entry = history.entries[safeIndex];
    const cellsHtml = renderBoardRows(entry.grid, entry.winningCells);
    const date = entry.date ? new Date(entry.date).toLocaleString() : 'Date unavailable';
    const content = `
      <div class="history-controls">
        <button class="btn btn-sm btn-outline" type="button" data-history-action="step" data-direction="previous" data-match-key="${escapeHtml(match.matchKey)}" ${safeIndex === 0 ? 'disabled' : ''}>Previous</button>
        <label><span>Board ${safeIndex + 1} of ${history.entries.length}</span>
          <input type="range" min="0" max="${history.entries.length - 1}" value="${safeIndex}" aria-label="Select committed board state" data-history-action="select" data-match-key="${escapeHtml(match.matchKey)}">
        </label>
        <button class="btn btn-sm btn-outline" type="button" data-history-action="step" data-direction="next" data-match-key="${escapeHtml(match.matchKey)}" ${safeIndex === history.entries.length - 1 ? 'disabled' : ''}>Next</button>
      </div>
      <div class="history-state"><strong>${escapeHtml(entry.state)}</strong><span>${escapeHtml(date)}</span></div>
      <p class="history-commit"><a href="${escapeHtml(entry.commitUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.shortSha)} · ${escapeHtml(entry.message)}</a></p>
      <div class="board-grid-table history-board" role="grid" aria-label="Committed board ${safeIndex + 1}: ${escapeHtml(entry.state)}">${cellsHtml}</div>
      ${errorsHtml}
    `;
    const next = document.createElement('div');
    next.innerHTML = content;
    const nextControls = next.querySelector('.history-controls');
    const existingControls = panel.querySelector('.history-controls');
    if (existingControls) {
      const currentButtons = existingControls.querySelectorAll('button');
      const nextButtons = nextControls.querySelectorAll('button');
      currentButtons.forEach((button, buttonIndex) => { button.disabled = nextButtons[buttonIndex].disabled; });
      existingControls.querySelector('label span').textContent = nextControls.querySelector('label span').textContent;
      const currentSlider = existingControls.querySelector('input[type="range"]');
      const nextSlider = nextControls.querySelector('input[type="range"]');
      currentSlider.min = nextSlider.min;
      currentSlider.max = nextSlider.max;
      currentSlider.value = nextSlider.value;
      nextControls.remove();
      Array.from(panel.children).filter((child) => child !== existingControls).forEach((child) => child.remove());
      panel.append(...Array.from(next.childNodes));
    } else {
      panel.replaceChildren(...Array.from(next.childNodes));
    }
    panel.dataset.historyIndex = String(safeIndex);
  }

  async function loadMatchHistory(match, button, force = false) {
    const cached = state.historyByMatch[match.matchKey];
    if (cached && !force && cached.entries.length > 0) {
      const panel = DOM.gameGrid.querySelector(`[data-history-panel="${CSS.escape(match.matchKey)}"]`);
      const index = Number(panel && panel.dataset.historyIndex || 0);
      renderHistoryPanel(match, cached, index);
      return;
    }
    const priorIndex = Number(DOM.gameGrid.querySelector(`[data-history-panel="${CSS.escape(match.matchKey)}"]`)?.dataset.historyIndex || 0);
    button.disabled = true;
    button.textContent = 'Loading history…';
    const panel = DOM.gameGrid.querySelector(`[data-history-panel="${CSS.escape(match.matchKey)}"]`);
    if (panel) panel.innerHTML = '<p>Loading committed board states from GitHub…</p>';
    let result;
    try {
      result = await MATCH_DATA.fetchMatchHistory(match, fetch, evaluateBoardContent);
    } catch (error) {
      result = { entries: [], errors: [`Could not load GitHub history: ${error.message}`], historyUrl: match.historyUrl };
    }
    state.historyByMatch[match.matchKey] = result;
    button.disabled = false;
    const buttonState = MATCH_DATA.historyButtonState(result);
    button.textContent = buttonState.label;
    button.dataset.historyLoaded = String(buttonState.loaded);
    renderHistoryPanel(match, result, priorIndex);
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
      if (g.status === 'error' || !g.isValid) {
        countErrors++;
      } else if (g.status === 'completed') {
        countFinished++;
      } else if (g.status === 'in_progress') {
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
    return workshopGames().filter((g) => {
      if (state.currentFilter === 'pending') {
        return g.status === 'in_progress' && g.isValid;
      }
      if (state.currentFilter === 'finished') {
        return g.status === 'completed' && g.isValid;
      }
      if (state.currentFilter === 'errors') {
        return g.status === 'error' || !g.isValid;
      }
      return true; // 'all'
    });
  }

  function render() {
    const openHistory = new Set(Array.from(DOM.gameGrid.querySelectorAll('details[data-history-for][open]')).map((node) => node.dataset.historyFor));
    const historyIndices = new Map(Array.from(DOM.gameGrid.querySelectorAll('[data-history-panel][data-history-index]')).map((node) => [node.dataset.historyPanel, Number(node.dataset.historyIndex)]));
    const focusedAction = document.activeElement && DOM.gameGrid.contains(document.activeElement)
      ? { action: document.activeElement.dataset.historyAction, matchKey: document.activeElement.dataset.matchKey, value: document.activeElement.value }
      : null;
    const currentGames = workshopGames();
    updateTabCounts(currentGames);

    const filtered = filterGames();

    if (state.lastUpdated && DOM.lastUpdated) {
      DOM.lastUpdated.textContent = `Updated ${formatTime(state.lastUpdated)}`;
    }

    if (focusedAction) {
      // Keep the active replay control in the DOM while polling, especially
      // during pointer or keyboard interaction with the range input.
      state.pendingRender = true;
      return;
    }
    state.pendingRender = false;

    if (filtered.length === 0) {
      DOM.gameGrid.innerHTML = '';
      DOM.emptyState.classList.remove('hidden');
      if (currentGames.length === 0) {
        DOM.emptyMessage.textContent = 'No matching branches have been found for this workshop yet. Registered repositories appear here after a branch whose name begins with “match” is discovered.';
      } else {
        DOM.emptyMessage.textContent = 'No games match the selected filter.';
      }
    } else {
      DOM.emptyState.classList.add('hidden');
      const groups = MATCH_DATA.groupMatches(filtered);
      DOM.gameGrid.innerHTML = groups.map((group) => `
        <section class="outcome-group" aria-labelledby="group-${group.id}">
          <div class="outcome-heading"><h2 id="group-${group.id}">${group.title}</h2><span>${group.matches.length}</span></div>
          <div class="outcome-cards">${group.matches.map(renderCard).join('')}</div>
        </section>
      `).join('');
      for (const matchKey of openHistory) {
        const details = Array.from(DOM.gameGrid.querySelectorAll('details[data-history-for]')).find((node) => node.dataset.historyFor === matchKey);
        if (details) details.open = true;
        const match = state.allGames.find((item) => item.matchKey === matchKey);
        const history = state.historyByMatch[matchKey];
        if (match && history) renderHistoryPanel(match, history, historyIndices.get(matchKey) || 0);
      }
      if (focusedAction && focusedAction.action) {
        const target = Array.from(DOM.gameGrid.querySelectorAll('[data-history-action]')).find((node) => node.dataset.historyAction === focusedAction.action && node.dataset.matchKey === focusedAction.matchKey);
        if (target) {
          if (focusedAction.value !== undefined && target.type === 'range') target.value = focusedAction.value;
          target.focus();
        }
      }
    }
  }

  function setLoading(loading) {
    if (DOM.loadingIndicator) DOM.loadingIndicator.classList.toggle('hidden', !loading);
    if (DOM.liveIndicator) DOM.liveIndicator.classList.toggle('warning', loading);
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

  function stopPolling() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  function startPolling() {
    stopPolling();
    if (document.hidden) return;
    state.timerId = setInterval(() => loadGames(), CONFIG.REFRESH_INTERVAL_SEC * 1000);
  }

  /** Pause polling in hidden tabs; refresh immediately when the tab is visible again. */
  function handleVisibilityChange() {
    if (document.hidden) {
      stopPolling();
      return;
    }
    startPolling();
    loadGames();
  }

  // ==========================================
  // 5. Event Listeners
  // ==========================================

  function setupEventListeners() {
    // Theme toggle (window.Theme comes from theme-init.js and owns persistence)
    if (DOM.themeToggle && window.Theme) {
      DOM.themeToggle.addEventListener('click', () => window.Theme.toggle());
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    document.addEventListener('workshopchange', (event) => {
      if (!state.catalog || !state.catalog.workshops.some((workshop) => workshop.id === event.detail.workshopId)) return;
      state.activeWorkshopId = event.detail.workshopId;
      updateWorkshopNotice();
      render();
    });

    // Filter tabs
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter') || 'all';
        state.currentFilter = filter;
        tabs.forEach((t) => {
          if (t === tab) {
            t.classList.add('active');
            t.setAttribute('aria-pressed', 'true');
          } else {
            t.classList.remove('active');
            t.setAttribute('aria-pressed', 'false');
          }
        });
        render();
      });
    });

    DOM.gameGrid.addEventListener('click', async (event) => {
      const target = event.target.closest('[data-history-action]');
      if (!target || target.dataset.historyAction === 'select') return;
      const match = state.allGames.find((item) => item.matchKey === target.dataset.matchKey);
      if (!match) return;
      if (target.dataset.historyAction === 'load') {
        await loadMatchHistory(match, target, target.dataset.historyLoaded === 'true');
        return;
      }
      if (target.dataset.historyAction === 'step') {
        const history = state.historyByMatch[match.matchKey];
        if (!history) return;
        const panel = DOM.gameGrid.querySelector(`[data-history-panel="${CSS.escape(match.matchKey)}"]`);
        const current = Number(panel && panel.dataset.historyIndex || 0);
        const next = current + (target.dataset.direction === 'next' ? 1 : -1);
        renderHistoryPanel(match, history, next);
      }
    });

    DOM.gameGrid.addEventListener('input', (event) => {
      const target = event.target.closest('[data-history-action="select"]');
      if (!target) return;
      const match = state.allGames.find((item) => item.matchKey === target.dataset.matchKey);
      const history = state.historyByMatch[target.dataset.matchKey];
      if (match && history) renderHistoryPanel(match, history, Number(target.value));
    });

    DOM.gameGrid.addEventListener('focusout', () => {
      window.setTimeout(() => {
        if (state.pendingRender && !DOM.gameGrid.contains(document.activeElement)) render();
      }, 0);
    });

    // Toggle between live and demo mode
    if (DOM.toggleDataModeBtn) {
      DOM.toggleDataModeBtn.addEventListener('click', () => {
        state.useDemoData = !state.useDemoData;
        DOM.toggleDataModeBtn.textContent = state.useDemoData
          ? 'Switch to Live GitHub Data'
          : 'Switch to Demo Data';
        loadGames({ force: true });
      });
    }
  }

  // ==========================================
  // 6. Initialization
  // ==========================================

  function init() {
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
