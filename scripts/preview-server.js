#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webm', 'video/webm'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

function isWithinRoot(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function parseByteRange(value, size) {
  if (!value || !value.startsWith('bytes=') || value.includes(',')) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2]) || size === 0) return null;

  let start;
  let end;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end };
}

function createPreviewServer(rootDirectory = path.resolve(__dirname, '..')) {
  const root = fs.realpathSync(rootDirectory);

  return http.createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }

    let requestPath;
    try {
      const queryIndex = request.url.indexOf('?');
      const rawPath = queryIndex < 0 ? request.url : request.url.slice(0, queryIndex);
      if (!rawPath.startsWith('/')) throw new URIError('Expected an origin-form path');
      requestPath = decodeURIComponent(rawPath);
    } catch (error) {
      response.writeHead(400).end('Bad request');
      return;
    }
    if (requestPath.includes('\\') || requestPath.includes('\0')) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    const target = path.resolve(root, `.${requestPath}`);
    if (!isWithinRoot(root, target)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    let filePath;
    let stat;
    try {
      filePath = await fs.promises.realpath(target);
      if (!isWithinRoot(root, filePath)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      stat = await fs.promises.stat(filePath);
      if (stat.isDirectory()) {
        filePath = await fs.promises.realpath(path.join(filePath, 'index.html'));
        if (!isWithinRoot(root, filePath)) {
          response.writeHead(403).end('Forbidden');
          return;
        }
        stat = await fs.promises.stat(filePath);
      }
      if (!stat.isFile()) throw Object.assign(new Error('Not a file'), { code: 'ENOENT' });
    } catch (error) {
      response.writeHead(error.code === 'EACCES' ? 403 : 404).end(error.code === 'EACCES' ? 'Forbidden' : 'Not found');
      return;
    }

    const headers = {
      'Accept-Ranges': 'bytes',
      'Content-Type': MIME_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
    };
    const rangeHeader = request.headers.range;
    const range = rangeHeader ? parseByteRange(rangeHeader, stat.size) : null;
    if (rangeHeader && !range) {
      response.writeHead(416, { ...headers, 'Content-Range': `bytes */${stat.size}` }).end();
      return;
    }

    if (range) {
      const contentLength = range.end - range.start + 1;
      response.writeHead(206, {
        ...headers,
        'Content-Length': contentLength,
        'Content-Range': `bytes ${range.start}-${range.end}/${stat.size}`,
      });
      if (request.method === 'HEAD') response.end();
      else fs.createReadStream(filePath, range).on('error', () => response.destroy()).pipe(response);
      return;
    }

    response.writeHead(200, { ...headers, 'Content-Length': stat.size });
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(filePath).on('error', () => response.destroy()).pipe(response);
  });
}

if (require.main === module) {
  const requestedPort = Number(process.env.PORT || 8765);
  if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) {
    process.stderr.write('PORT must be an integer between 0 and 65535.\n');
    process.exitCode = 1;
  } else {
    const server = createPreviewServer();
    server.listen(requestedPort, '127.0.0.1', () => {
      const address = server.address();
      process.stdout.write(`Preview server: http://127.0.0.1:${address.port}/\n`);
    });
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.on(signal, () => server.close(() => process.exit(0)));
    }
  }
}

module.exports = { createPreviewServer, parseByteRange };
