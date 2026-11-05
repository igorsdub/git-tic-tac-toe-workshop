const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'docs', 'copy-code.js'), 'utf8');

function setup({ clipboard, execResult = true }) {
  const timers = [];
  const listeners = {};
  const status = { textContent: '' };
  const button = {
    textContent: 'Copy',
    dataset: { copyTarget: 'src' },
    parentElement: { querySelector: () => status },
    addEventListener(type, fn) { listeners[type] = fn; },
  };
  const appended = [];
  const document = {
    addEventListener(type, fn) { if (type === 'DOMContentLoaded') document.ready = fn; },
    querySelectorAll: () => [button],
    getElementById: (id) => (id === 'src' ? { textContent: 'git pull --no-rebase' } : null),
    createElement: () => ({ setAttribute() {}, select() {}, style: {} }),
    body: { appendChild: (el) => appended.push(el), removeChild() {} },
    execCommand: null,
  };
  document.execCommand = (cmd) => { document.execCalled = cmd; return execResult; };
  const sandbox = { document, navigator: { clipboard }, setTimeout: (fn) => timers.push(fn), Promise, Error };
  vm.runInNewContext(source, sandbox);
  document.ready();
  const click = async () => { listeners.click(); await new Promise((r) => setImmediate(r)); };
  return { button, status, click, timers, document, appended };
}

test('copies the visible text with the clipboard API and resets after a delay', async () => {
  const copied = [];
  const env = setup({ clipboard: { writeText: async (t) => { copied.push(t); } } });
  await env.click();
  assert.deepEqual(copied, ['git pull --no-rebase']);
  assert.equal(env.button.textContent, 'Copied');
  assert.equal(env.status.textContent, 'Copied to clipboard');
  env.timers.shift()();
  assert.equal(env.button.textContent, 'Copy');
  assert.equal(env.status.textContent, '');
});

test('falls back to execCommand when the clipboard API rejects', async () => {
  const env = setup({ clipboard: { writeText: async () => { throw new Error('denied'); } } });
  await env.click();
  assert.equal(env.document.execCalled, 'copy');
  assert.equal(env.appended.length, 1);
  assert.equal(env.button.textContent, 'Copied');
});

test('falls back to execCommand when there is no clipboard API', async () => {
  const env = setup({ clipboard: undefined });
  await env.click();
  assert.equal(env.document.execCalled, 'copy');
  assert.equal(env.button.textContent, 'Copied');
});

test('reports failure when every copy method fails', async () => {
  const env = setup({ clipboard: { writeText: async () => { throw new Error('denied'); } }, execResult: false });
  await env.click();
  assert.equal(env.button.textContent, 'Copy failed');
  assert.match(env.status.textContent, /Copy failed/);
});

test('repeated clicks keep working', async () => {
  const copied = [];
  const env = setup({ clipboard: { writeText: async (t) => { copied.push(t); } } });
  await env.click();
  await env.click();
  assert.equal(copied.length, 2);
  assert.equal(env.button.textContent, 'Copied');
});
