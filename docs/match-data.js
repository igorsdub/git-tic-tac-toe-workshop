/* Pure data helpers for the branch-aware Game Wall and its board-history view. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MatchData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // A match is any branch whose full name starts with literal lowercase "match".
  const MATCH_BRANCH_PATTERN = /^match/;
  const TERMINAL_STATES = new Set(['X won', 'O won', 'Draw']);

  function normalizeMatch(item) {
    const owner = item.owner || '';
    const repo = item.repo || '';
    const branch = item.branch || '';
    const errors = Array.isArray(item.errors) ? item.errors.filter(Boolean).map(String) : [];
    const validIdentity = Boolean(owner && repo && MATCH_BRANCH_PATTERN.test(branch));
    const isValid = validIdentity && item.boardValid === true && item.status !== 'error';

    if (!owner || !repo) errors.push('Registration does not identify a public repository.');
    if (!branch) {
      errors.push('This repository has no discovered match branch beginning with “match”.');
    } else if (!MATCH_BRANCH_PATTERN.test(branch)) {
      errors.push(`Branch “${branch}” does not begin with the lowercase prefix “match”.`);
    }
    if (item.boardValid !== true && errors.length === 0) {
      errors.push('This registry record has no validated board. Sync the branch registry before displaying this match.');
    }

    const state = isValid ? item.state : 'Error';
    const status = isValid
      ? (item.status === 'completed' && TERMINAL_STATES.has(state) ? 'completed' : 'in_progress')
      : 'error';

    return {
      ...item,
      owner,
      repo,
      branch,
      repoUrl: item.repoUrl || (owner && repo ? `https://github.com/${owner}/${repo}` : '#'),
      matchKey: item.matchKey || (owner && repo && branch ? `${owner}/${repo}#${branch}` : `invalid-${item.issueNumber || 'registration'}`),
      state,
      status,
      outcome: status === 'completed' ? state : null,
      isValid,
      grid: isValid && Array.isArray(item.board) ? item.board : null,
      errors: [...new Set(errors)],
      historyUrl: owner && repo && MATCH_BRANCH_PATTERN.test(branch)
        ? `https://github.com/${owner}/${repo}/commits/${encodeURIComponent(branch)}/BOARD.txt`
        : null,
    };
  }

  function groupMatches(matches) {
    const groups = [
      { id: 'in_progress', title: 'In progress', matches: [] },
      { id: 'x_won', title: 'X wins', matches: [] },
      { id: 'o_won', title: 'O wins', matches: [] },
      { id: 'draw', title: 'Draws', matches: [] },
      { id: 'error', title: 'Needs attention', matches: [] },
    ];
    const destinations = Object.fromEntries(groups.map((group) => [group.id, group.matches]));

    for (const match of matches) {
      if (match.status === 'error' || !match.isValid) destinations.error.push(match);
      else if (match.state === 'X won') destinations.x_won.push(match);
      else if (match.state === 'O won') destinations.o_won.push(match);
      else if (match.state === 'Draw') destinations.draw.push(match);
      else destinations.in_progress.push(match);
    }
    return groups.filter((group) => group.matches.length > 0);
  }

  function historyApiUrl(match) {
    if (!match.owner || !match.repo || !MATCH_BRANCH_PATTERN.test(match.branch || '')) {
      throw new Error('A valid repository and lowercase match-prefixed branch are required to load history.');
    }
    return `https://api.github.com/repos/${encodeURIComponent(match.owner)}/${encodeURIComponent(match.repo)}/commits?sha=${encodeURIComponent(match.branch)}&path=BOARD.txt&per_page=100`;
  }

  function canRefreshMatchBoard(match) {
    return Boolean(
      match.owner && match.repo && MATCH_BRANCH_PATTERN.test(match.branch || '')
      && String(match.playerX || '').trim() && String(match.playerO || '').trim(),
    );
  }

  function historyButtonState(history) {
    if (history && Array.isArray(history.entries) && history.entries.length > 0) {
      return { label: 'Refresh history', loaded: true };
    }
    return { label: history ? 'Retry history' : 'Load history', loaded: false };
  }

  function boardUrl(match) {
    if (!match.owner || !match.repo || !MATCH_BRANCH_PATTERN.test(match.branch || '')) {
      throw new Error('A valid repository and lowercase match-prefixed branch are required to load the current board.');
    }
    return `https://raw.githubusercontent.com/${encodeURIComponent(match.owner)}/${encodeURIComponent(match.repo)}/${encodeURIComponent(match.branch)}/BOARD.txt`;
  }

  async function refreshMatchBoard(match, fetcher, validateBoard) {
    try {
      const response = await fetcher(boardUrl(match));
      if (!response.ok) {
        const message = `Could not load BOARD.txt from ${match.branch} (HTTP ${response.status}).`;
        return { ...match, state: 'Error', status: 'error', outcome: null, isValid: false, grid: null, errors: [message], boardValid: false };
      }
      const evaluation = validateBoard(await response.text());
      if (!evaluation.isValid) {
        return { ...match, state: 'Error', status: 'error', outcome: null, isValid: false, grid: null, errors: (evaluation.errors || ['The branch board is invalid.']).map((error) => `Invalid BOARD.txt on ${match.branch}: ${error}`), boardValid: false };
      }
      const completed = ['X won', 'O won', 'Draw'].includes(evaluation.state);
      return {
        ...match,
        state: evaluation.state,
        status: completed ? 'completed' : 'in_progress',
        outcome: completed ? evaluation.state : null,
        isValid: true,
        grid: evaluation.grid,
        board: evaluation.grid,
        boardValid: true,
        winningCells: evaluation.winningCells || null,
        errors: [],
      };
    } catch (error) {
      return { ...match, state: 'Error', status: 'error', outcome: null, isValid: false, grid: null, errors: [`Could not load BOARD.txt from ${match.branch}: ${error.message}`], boardValid: false };
    }
  }

  async function fetchMatchHistory(match, fetcher, validateBoard) {
    const historyUrl = match.historyUrl || `https://github.com/${match.owner}/${match.repo}/commits/${encodeURIComponent(match.branch || '')}/BOARD.txt`;
    const commits = [];
    const errors = [];
    try {
      for (let page = 1; ; page++) {
        const url = `${historyApiUrl(match)}&page=${page}`;
        const response = await fetcher(url, { headers: { Accept: 'application/vnd.github+json' } });
        if (!response.ok) {
          const reason = response.status === 403
            ? 'GitHub API access is rate limited or unavailable (HTTP 403).'
            : `GitHub could not load history page ${page} (HTTP ${response.status}).`;
          if (page === 1) return { entries: [], errors: [reason], historyUrl };
          errors.push(`${reason} Available commits are shown; older history may be missing. Open GitHub history for the complete timeline.`);
          break;
        }
        const pageCommits = await response.json();
        if (!Array.isArray(pageCommits)) {
          const reason = `GitHub returned an invalid commit-history response on page ${page}.`;
          if (page === 1) return { entries: [], errors: [reason], historyUrl };
          errors.push(`${reason} Available commits are shown; older history may be missing. Open GitHub history for the complete timeline.`);
          break;
        }
        commits.push(...pageCommits);
        if (pageCommits.length < 100) break;
      }
    } catch (error) {
      if (commits.length === 0) return { entries: [], errors: [`Could not load GitHub commit history: ${error.message}`], historyUrl };
      errors.push(`Could not load the next history page: ${error.message}. Available commits are shown; older history may be missing. Open GitHub history for the complete timeline.`);
    }

    const entries = [];
    for (const commit of commits.slice().reverse()) {
      const sha = commit && commit.sha;
      if (!sha) {
        errors.push('A history item had no commit identifier and was skipped.');
        continue;
      }
      const boardUrl = `https://raw.githubusercontent.com/${encodeURIComponent(match.owner)}/${encodeURIComponent(match.repo)}/${encodeURIComponent(sha)}/BOARD.txt`;
      try {
        const response = await fetcher(boardUrl);
        if (!response.ok) {
          errors.push(`Commit ${sha.slice(0, 7)} has no readable BOARD.txt (HTTP ${response.status}) and was skipped.`);
          continue;
        }
        const evaluation = validateBoard(await response.text());
        if (!evaluation.isValid) {
          const detail = (evaluation.errors || []).join(' ');
          errors.push(`Commit ${sha.slice(0, 7)} contains an invalid board and was skipped${detail ? `: ${detail}` : '.'}`);
          continue;
        }
        entries.push({
          sha,
          shortSha: sha.slice(0, 7),
          message: commit.commit && commit.commit.message ? commit.commit.message.split('\n')[0] : 'Board update',
          date: commit.commit && commit.commit.author ? commit.commit.author.date : null,
          commitUrl: commit.html_url || `https://github.com/${match.owner}/${match.repo}/commit/${sha}`,
          state: evaluation.state,
          grid: evaluation.grid,
          winningCells: evaluation.winningCells || null,
        });
      } catch (error) {
        errors.push(`Could not read commit ${sha.slice(0, 7)}: ${error.message}`);
      }
    }
    if (commits.length > 0 && entries.length === 0 && errors.length === 0) {
      errors.push('No valid committed BOARD.txt states were found on this match branch.');
    }
    if (commits.length === 0) errors.push('No committed BOARD.txt history was found on this match branch.');
    return { entries, errors, historyUrl };
  }

  return { MATCH_BRANCH_PATTERN, normalizeMatch, groupMatches, canRefreshMatchBoard, historyButtonState, boardUrl, refreshMatchBoard, historyApiUrl, fetchMatchHistory };
});
