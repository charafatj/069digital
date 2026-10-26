// usage: node shot.mjs <page relative to project root> <out.png> <w> <h>
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const [page_, outp, w, h] = process.argv.slice(2);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const f = path.join(process.cwd(), decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on('pageerror', e => console.log('[err]', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('[console]', m.text()); });
await p.goto(`http://127.0.0.1:${srv.address().port}/${page_}`);
await p.waitForFunction('window.DONE===true', null, { timeout: 120000 });
await p.locator('canvas').first().screenshot({ path: outp });
await b.close(); srv.close();
