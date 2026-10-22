const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createPreviewServer } = require('../scripts/preview-server.js');

async function withServer(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workshop-preview-'));
  fs.writeFileSync(path.join(root, 'sample.mp4'), Buffer.from([0, 1, 2, 3, 4]));
  fs.writeFileSync(path.join(root, 'index.html'), '<h1>Preview fixture</h1>');
  const server = createPreviewServer(root);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('serves full MP4 and HTML responses with useful headers', async () => {
  await withServer(async (baseUrl) => {
    const video = await fetch(`${baseUrl}/sample.mp4`);
    assert.equal(video.status, 200);
    assert.equal(video.headers.get('content-type'), 'video/mp4');
    assert.equal(video.headers.get('accept-ranges'), 'bytes');
    assert.equal(video.headers.get('content-length'), '5');
    assert.deepEqual(Buffer.from(await video.arrayBuffer()), Buffer.from([0, 1, 2, 3, 4]));

    const page = await fetch(`${baseUrl}/`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /^text\/html/);
    assert.equal(await page.text(), '<h1>Preview fixture</h1>');
  });
});

test('supports bounded, open-ended and suffix byte ranges', async () => {
  await withServer(async (baseUrl) => {
    const bounded = await fetch(`${baseUrl}/sample.mp4`, { headers: { Range: 'bytes=0-1' } });
    assert.equal(bounded.status, 206);
    assert.equal(bounded.headers.get('content-range'), 'bytes 0-1/5');
    assert.equal(bounded.headers.get('content-length'), '2');
    assert.deepEqual(Buffer.from(await bounded.arrayBuffer()), Buffer.from([0, 1]));

    const openEnded = await fetch(`${baseUrl}/sample.mp4`, { headers: { Range: 'bytes=3-' } });
    assert.equal(openEnded.status, 206);
    assert.equal(openEnded.headers.get('content-range'), 'bytes 3-4/5');
    assert.deepEqual(Buffer.from(await openEnded.arrayBuffer()), Buffer.from([3, 4]));

    const suffix = await fetch(`${baseUrl}/sample.mp4`, { headers: { Range: 'bytes=-2' } });
    assert.equal(suffix.status, 206);
    assert.equal(suffix.headers.get('content-range'), 'bytes 3-4/5');
    assert.deepEqual(Buffer.from(await suffix.arrayBuffer()), Buffer.from([3, 4]));
  });
});

test('HEAD returns metadata without a body', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/sample.mp4`, { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'video/mp4');
    assert.equal(response.headers.get('content-length'), '5');
    assert.equal(response.headers.get('accept-ranges'), 'bytes');
    assert.equal(await response.text(), '');
  });
});

test('rejects unsatisfiable ranges, traversal and missing files', async () => {
  await withServer(async (baseUrl) => {
    const invalidRange = await fetch(`${baseUrl}/sample.mp4`, { headers: { Range: 'bytes=5-8' } });
    assert.equal(invalidRange.status, 416);
    assert.equal(invalidRange.headers.get('content-range'), 'bytes */5');

    const traversal = await fetch(`${baseUrl}/%2e%2e%2foutside.txt`);
    assert.equal(traversal.status, 403);

    const missing = await fetch(`${baseUrl}/missing.mp4`);
    assert.equal(missing.status, 404);
  });
});
