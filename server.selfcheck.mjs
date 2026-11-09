// Standalone check for server.mjs path-traversal + routing behavior.
// Run with: node server.selfcheck.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { copyFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { request } from 'node:http';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const temp = mkdtempSync(join(tmpdir(), 'static-server-check-'));
const dist = join(temp, 'dist');
copyFileSync(fileURLToPath(new URL('./server.mjs', import.meta.url)), join(temp, 'server.mjs'));
// Build a minimal fake dist/ without touching the project's build.
mkdirSync(join(dist, 'about'), { recursive: true });
mkdirSync(join(dist, '_astro'), { recursive: true });
writeFileSync(join(dist, 'index.html'), '<h1>home</h1>');
writeFileSync(join(dist, '404.html'), '<h1>404</h1>');
writeFileSync(join(dist, 'about', 'index.html'), '<h1>about</h1>');
writeFileSync(join(dist, '_astro', 'app.js'), 'console.log(1)');
// A secret outside dist/ that traversal must NOT reach.
writeFileSync(join(temp, 'SECRET.txt'), 'top-secret');
symlinkSync(join(temp, 'SECRET.txt'), join(dist, 'linked-secret'));

const PORT = 18080;
const child = spawn(process.execPath, ['server.mjs'], {
  cwd: temp,
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
});
const base = `http://127.0.0.1:${PORT}`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function up() {
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(base + '/');
      return;
    } catch {
      await wait(100);
    }
  }
  throw new Error('server did not start');
}

try {
  await up();

  let r = await fetch(base + '/');
  assert.equal(r.status, 200);
  assert.match(await r.text(), /home/);

  r = await fetch(base + '/about/');
  assert.equal(r.status, 200);
  assert.match(await r.text(), /about/);

  r = await fetch(base + '/about');
  assert.equal(r.status, 200, 'clean URL without trailing slash resolves');

  r = await fetch(base + '/_astro/app.js');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type') || '', /javascript/);

  // HEAD returns headers, empty body.
  r = await fetch(base + '/', { method: 'HEAD' });
  assert.equal(r.status, 200);
  assert.equal(await r.text(), '');

  // 404 page.
  r = await fetch(base + '/nope');
  assert.equal(r.status, 404);
  assert.match(await r.text(), /404/);

  // Traversal attempts must not leak SECRET.txt.
  for (const p of ['/../SECRET.txt', '/..%2fSECRET.txt', '/%2e%2e/SECRET.txt', '/%2e%2e%2fSECRET.txt']) {
    r = await fetch(base + p);
    const body = await r.text();
    assert.ok(!body.includes('top-secret'), `traversal blocked for ${p}`);
    assert.equal(r.status, 404, `traversal 404 for ${p}`);
  }

  r = await fetch(base + '/linked-secret');
  assert.equal(r.status, 404, 'symlink outside dist rejected');
  r = await fetch(base + '/missing', { method: 'HEAD' });
  assert.equal(r.status, 404);
  assert.equal(await r.text(), '');

  // Malformed Host must not crash the process.
  const status = await new Promise((resolve, reject) => {
    const req = request(base, { headers: { Host: '[' } }, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject);
    req.end();
  });
  assert.equal(status, 200);
  assert.equal((await fetch(base + '/')).status, 200);

  // Method not allowed.
  r = await fetch(base + '/', { method: 'POST' });
  assert.equal(r.status, 405);

  console.log('ALL SELF-CHECKS PASSED');
} finally {
  child.kill();
  rmSync(temp, { recursive: true, force: true });
}
