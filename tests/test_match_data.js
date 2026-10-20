const test = require('node:test');
const assert = require('node:assert/strict');
const MatchData = require('../docs/match-data.js');

const match = (overrides = {}) => MatchData.normalizeMatch({
  owner: 'pair',
  repo: 'research-game',
  repoUrl: 'https://github.com/pair/research-game',
  branch: 'match-01',
  playerX: 'alice',
  playerO: 'bob',
  status: 'in_progress',
  state: 'Ready for X',
  boardValid: true,
  board: [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']],
  errors: [],
  ...overrides,
});

test('normalizes old repository-only registrations as explicit errors', () => {
  const result = MatchData.normalizeMatch({ owner: 'pair', repo: 'old-game' });
  assert.equal(result.status, 'error');
  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /no match branch/i);
  assert.equal(result.historyUrl, null);
});

test('does not offer replay for a malformed branch registration', () => {
  const result = match({ branch: 'main' });
  assert.equal(result.status, 'error');
  assert.equal(result.historyUrl, null);
  assert.throws(() => MatchData.historyApiUrl(result), /numbered match branch/);
});

test('keeps a valid registration refreshable when its last board read failed', async () => {
  const failedSnapshot = match({ status: 'error', state: 'Error', boardValid: false, board: null, errors: ['BOARD.txt was unavailable'] });
  assert.equal(MatchData.canRefreshMatchBoard(failedSnapshot), true);
  const recovered = await MatchData.refreshMatchBoard(failedSnapshot, async () => ({
    ok: true,
    text: async () => 'winning board',
  }), () => ({ isValid: true, state: 'X won', grid: [['X', 'X', 'X'], ['O', 'O', ' '], [' ', ' ', ' ']] }));
  assert.equal(recovered.status, 'completed');
  assert.equal(recovered.state, 'X won');
  assert.deepEqual(recovered.errors, []);
  assert.equal(MatchData.canRefreshMatchBoard(MatchData.normalizeMatch({ owner: 'pair', repo: 'game' })), false);
});

test('rebuilds a refreshed-history action from cached entries after rerender', () => {
  assert.deepEqual(MatchData.historyButtonState({ entries: [{ sha: 'abc' }], errors: [] }), { label: 'Refresh history', loaded: true });
  assert.deepEqual(MatchData.historyButtonState({ entries: [], errors: ['API unavailable'] }), { label: 'Retry history', loaded: false });
  assert.deepEqual(MatchData.historyButtonState(undefined), { label: 'Load history', loaded: false });
});

test('keeps matches distinct by registered branch and groups current outcomes', () => {
  const matches = [
    match({ branch: 'match-01' }),
    match({ branch: 'match-02', status: 'completed', state: 'X won' }),
    match({ branch: 'match-03', status: 'completed', state: 'O won' }),
    match({ branch: 'match-04', status: 'completed', state: 'Draw' }),
    match({ branch: 'match-05', status: 'error', boardValid: false, errors: ['Board missing'] }),
  ];
  const groups = MatchData.groupMatches(matches);
  assert.deepEqual(groups.map((group) => group.id), ['in_progress', 'x_won', 'o_won', 'draw', 'error']);
  assert.equal(new Set(matches.map((entry) => entry.matchKey)).size, matches.length);
  assert.equal(groups[1].matches[0].outcome, 'X won');
});

test('history API is scoped to the registered branch and uppercase board filename', () => {
  const current = match({ branch: 'match-02' });
  assert.equal(
    MatchData.historyApiUrl(current),
    'https://api.github.com/repos/pair/research-game/commits?sha=match-02&path=BOARD.txt&per_page=100',
  );
  assert.throws(() => MatchData.historyApiUrl(match({ branch: 'main' })), /numbered match branch/);
});

test('refreshes the current board from its exact branch and recomputes the outcome', async () => {
  const current = match({ state: 'Waiting for O', status: 'in_progress' });
  const calls = [];
  const result = await MatchData.refreshMatchBoard(current, async (url) => {
    calls.push(url);
    return { ok: true, text: async () => 'winning board' };
  }, () => ({ isValid: true, state: 'X won', grid: [['X', 'X', 'X'], [' ', ' ', ' '], [' ', ' ', ' ']], winningCells: [[0, 0], [0, 1], [0, 2]] }));

  assert.deepEqual(calls, ['https://raw.githubusercontent.com/pair/research-game/match-01/BOARD.txt']);
  assert.equal(result.state, 'X won');
  assert.equal(result.status, 'completed');
  assert.equal(result.outcome, 'X won');
  assert.deepEqual(MatchData.groupMatches([result]).map((group) => group.id), ['x_won']);
});

test('turns inaccessible or invalid current branch boards into explicit errors', async () => {
  const inaccessible = await MatchData.refreshMatchBoard(match(), async () => ({ ok: false, status: 404 }), () => ({}));
  assert.equal(inaccessible.status, 'error');
  assert.match(inaccessible.errors[0], /match-01.*404/);
  const invalid = await MatchData.refreshMatchBoard(match(), async () => ({ ok: true, text: async () => 'bad board' }), () => ({ isValid: false, errors: ['impossible move count'] }));
  assert.equal(invalid.status, 'error');
  assert.match(invalid.errors[0], /impossible move count/);
});

test('replays valid board snapshots oldest-first and reports invalid commits', async () => {
  const newer = { sha: 'b'.repeat(40), commit: { message: 'second move', author: { date: '2026-10-20T02:00:00Z' } }, html_url: 'https://github.com/pair/research-game/commit/new' };
  const older = { sha: 'a'.repeat(40), commit: { message: 'first move', author: { date: '2026-10-20T01:00:00Z' } }, html_url: 'https://github.com/pair/research-game/commit/old' };
  const invalid = { sha: 'c'.repeat(40), commit: { message: 'bad board', author: { date: '2026-10-20T03:00:00Z' } } };
  const calls = [];
  const fetcher = async (url) => {
    calls.push(url);
    if (url.includes('/commits?')) return { ok: true, json: async () => [newer, older, invalid] };
    if (url.includes(older.sha)) return { ok: true, text: async () => 'older board' };
    if (url.includes(newer.sha)) return { ok: true, text: async () => 'newer board' };
    return { ok: true, text: async () => 'invalid board' };
  };
  const validate = (content) => content === 'invalid board'
    ? { isValid: false, errors: ['impossible move count'] }
    : { isValid: true, state: content === 'older board' ? 'Waiting for O' : 'X won', grid: [['X']], winningCells: [] };

  const result = await MatchData.fetchMatchHistory(match(), fetcher, validate);
  assert.deepEqual(result.entries.map((entry) => entry.shortSha), [older.sha.slice(0, 7), newer.sha.slice(0, 7)]);
  assert.deepEqual(result.entries.map((entry) => entry.state), ['Waiting for O', 'X won']);
  assert.match(result.errors[0], /invalid board and was skipped/);
  assert.ok(calls[0].includes('sha=match-01&path=BOARD.txt'));
  assert.ok(calls.some((url) => url.includes(`${older.sha}/BOARD.txt`)));
});

test('reports GitHub API errors with a commit-history fallback', async () => {
  const result = await MatchData.fetchMatchHistory(
    match(),
    async () => ({ ok: false, status: 403 }),
    () => ({ isValid: true }),
  );
  assert.deepEqual(result.entries, []);
  assert.match(result.errors[0], /rate limited|unavailable/i);
  assert.equal(result.historyUrl, 'https://github.com/pair/research-game/commits/match-01/BOARD.txt');
});

test('paginates full commit-history pages and reports a later-page API failure', async () => {
  const fullPage = Array.from({ length: 100 }, (_, index) => ({
    sha: String(index).padStart(40, '0'),
    commit: { message: `move ${index}`, author: { date: '2026-10-20T01:00:00Z' } },
  }));
  const calls = [];
  const result = await MatchData.fetchMatchHistory(
    match(),
    async (url) => {
      calls.push(url);
      if (url.includes('/commits?') && url.includes('&page=1')) return { ok: true, json: async () => fullPage };
      if (!url.includes('/commits?')) return { ok: true, text: async () => 'board' };
      return { ok: false, status: 403 };
    },
    () => ({ isValid: true, state: 'Ready for X', grid: [[], [], []] }),
  );
  assert.equal(calls.filter((url) => url.includes('/commits?')).length, 2);
  assert.equal(result.entries.length, 100);
  assert.match(result.errors[0], /older history may be missing.*complete timeline/i);
});
