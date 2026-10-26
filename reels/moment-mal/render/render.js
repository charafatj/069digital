const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const [mode, a1, a2, a3] = process.argv.slice(2);
(async () => {
  const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(0);
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => console.log('[page]', m.text())); page.on('pageerror', e => console.log('[err]', e.message));
  await page.goto(`http://127.0.0.1:${port}/reel.html`);
  await page.waitForFunction('window.READY===true', null, { timeout: 60000 });
  if (mode === 'stills') {
    for (const t of a1.split(',').map(Number)) { const b = await page.evaluate(t => window.frame(t), t); fs.writeFileSync(path.join(a2, `still_${t.toFixed(2)}.jpg`), Buffer.from(b, 'base64')); }
  } else if (mode === 'avatar') {
    fs.writeFileSync(a1, Buffer.from(await page.evaluate(() => window.avatar()), 'base64'));
  } else if (mode === 'cues') {
    console.log(JSON.stringify(await page.evaluate(() => ({ dur: window.DUR, cues: window.CUES }))));
  } else { // video: start end outfile
    const fps = 30, s = +a1, e = +a2; const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a3], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = Math.round(s * fps); f < Math.round(e * fps); f++) {
      const b = await page.evaluate(t => window.frame(t), f / fps);
      if (!ff.stdin.write(Buffer.from(b, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(a3, f, ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close(); srv.close();
})();
