// Minimal static production server for Astro's default static build (dist/).
// Astro output: dist/index.html, dist/404.html, dist/_astro/*, plus per-route dirs (build.format: "directory").
// ponytail: no compression, range requests, or caching heuristics — add when traffic/bandwidth matters.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function mimeFor(file) {
  return MIME[extname(file).toLowerCase()] || 'application/octet-stream';
}

async function resolveFile(pathname) {
  // Decode and normalize; reject anything that escapes ROOT.
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;

  const rel = normalize(decoded).replace(/^([/\\])+/, '');
  const abs = join(ROOT, rel);
  // Containment check: guard against traversal via ../, encoded dots, or absolute paths.
  if (abs !== ROOT && !abs.startsWith(ROOT + sep)) return null;

  const tryFile = async (p) => {
    try {
      const [root, resolved] = await Promise.all([realpath(ROOT), realpath(p)]);
      if (!resolved.startsWith(root + sep)) return null;
      const s = await stat(resolved);
      return s.isFile() ? resolved : null;
    } catch {
      return null;
    }
  };

  if (rel === '' || rel.endsWith(sep)) {
    return tryFile(join(abs, 'index.html'));
  }
  // Exact file, then Astro directory-format index.html for clean URLs.
  return (await tryFile(abs)) || (await tryFile(join(abs, 'index.html')));
}

function send(res, status, file, method) {
  const headers = { 'Content-Type': mimeFor(file) };
  if (status !== 200) headers['Cache-Control'] = 'no-store';
  res.writeHead(status, headers);
  if (method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(file)
    .on('error', () => {
      if (!res.headersSent) res.writeHead(500);
      res.destroy();
    })
    .pipe(res);
}

const server = createServer(async (req, res) => {
  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  let pathname;
  try {
    if (!req.url?.startsWith('/') || req.url.startsWith('//')) throw new Error('Invalid request target');
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(method === 'HEAD' ? undefined : 'Bad Request');
    return;
  }

  const file = await resolveFile(pathname);
  if (file) {
    send(res, 200, file, method);
    return;
  }

  // Static 404 page, falling back to plain text if the build lacks one.
  try {
    const safeNotFound = await resolveFile('/404.html');
    if (!safeNotFound) throw new Error('No 404 page');
    send(res, 404, safeNotFound, method);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(method === 'HEAD' ? undefined : 'Not Found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Static server listening on http://${HOST}:${PORT} (root: ${ROOT})`);
});
