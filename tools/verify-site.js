#!/usr/bin/env node
/**
 * Verification harness for the 069digital static site.
 * Serves the repo, loads every page at desktop + mobile widths, and reports:
 * console errors, failed requests, broken internal links, transfer weight,
 * request count, LCP, CLS, and full-page screenshots.
 *
 * Usage: node verify-site.js <repoDir> <outDir> [label]
 */
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

const PW = '/opt/node22/lib/node_modules/playwright';
const { chromium, devices } = require(PW);

const repoDir = process.argv[2] || '/home/user/069digital';
const outDir = process.argv[3] || '/tmp/verify-out';
const label = process.argv[4] || 'run';
const PORT = 8099;

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, dpr: 1, mobile: false },
  { name: 'mobile', width: 390, height: 844, dpr: 3, mobile: true },
];

function serve() {
  return new Promise((resolve, reject) => {
    const srv = spawn(
      process.execPath,
      [path.join('/opt/node22/lib/node_modules/http-server/bin/http-server'), repoDir, '-p', String(PORT), '-s', '-c-1'],
      { stdio: 'ignore' }
    );
    const t0 = Date.now();
    const ping = () => {
      http
        .get(`http://127.0.0.1:${PORT}/index.html`, (r) => {
          r.resume();
          resolve(srv);
        })
        .on('error', () => {
          if (Date.now() - t0 > 15000) return reject(new Error('server did not start'));
          setTimeout(ping, 200);
        });
    };
    setTimeout(ping, 300);
  });
}

function discoverPages() {
  const pages = [];
  for (const f of fs.readdirSync(repoDir)) {
    if (f.endsWith('.html') && f !== 'test-services.html') pages.push('/' + f);
  }
  const blogDir = path.join(repoDir, 'blog');
  if (fs.existsSync(blogDir)) {
    for (const f of fs.readdirSync(blogDir)) if (f.endsWith('.html')) pages.push('/blog/' + f);
  }
  return pages.sort();
}

async function measure(browser, url, vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    userAgent: vp.mobile ? devices['iPhone 13'].userAgent : undefined,
  });
  const page = await ctx.newPage();

  // Google Fonts is unreachable in this sandbox and its ~13s timeout dominates LCP.
  // Fulfil it locally so timing numbers reflect the site, not the blocked request.
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '/* fonts stubbed by harness */' })
  );

  const consoleErrors = [];
  const pageErrors = [];
  const failed = [];
  let bytes = 0;
  let requests = 0;

  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
  });
  page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 300)));
  page.on('requestfailed', (r) => failed.push(`${r.url().replace(`http://127.0.0.1:${PORT}`, '')} :: ${r.failure()?.errorText}`));
  page.on('response', async (r) => {
    requests++;
    const s = r.status();
    if (s >= 400) failed.push(`HTTP ${s} ${r.url().replace(`http://127.0.0.1:${PORT}`, '')}`);
    try {
      const h = r.headers()['content-length'];
      if (h) bytes += parseInt(h, 10);
      else {
        const b = await r.body();
        bytes += b.length;
      }
    } catch {}
  });

  // Install web-vitals observers before any script runs
  await page.addInitScript(() => {
    window.__lcp = 0;
    window.__cls = 0;
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__lcp = Math.max(window.__lcp, e.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
  });

  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  const loadMs = Date.now() - t0;

  // Scroll through to trigger lazy content / reveal animations, then settle
  await page.evaluate(async () => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y < H; y += window.innerHeight * 0.6) {
      window.scrollTo(0, y);
      // Two rAFs plus a pause, so IntersectionObserver callbacks actually flush
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });

  // The site's reveal failsafe fires 4s after load; wait past it so the
  // invisible-content check reflects the guaranteed final state.
  await page.waitForTimeout(4800);

  // After a full scroll-through, nothing with real text should still be
  // transparent. This catches reveal animations that hide content permanently
  // when the observer never fires.
  const invisible = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('.reveal, .reveal-group > *, [class]')) {
      const text = (el.textContent || '').trim();
      if (text.length < 12) continue;
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 0.5 || cs.visibility === 'hidden') {
        const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        out.push(`${el.tagName.toLowerCase()}${cls ? '.' + cls : ''} "${text.slice(0, 40)}"`);
        if (out.length >= 8) break;
      }
    }
    return out;
  });

  const vitals = await page.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(4) }));

  // Horizontal overflow check — a body wider than the viewport is a real mobile bug
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    const offenders = [];
    if (de.scrollWidth > de.clientWidth + 1) {
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > de.clientWidth + 2 || r.left < -2)) {
          offenders.push(
            `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''} right=${Math.round(r.right)}`
          );
          if (offenders.length >= 6) break;
        }
      }
    }
    return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, offenders };
  });

  // Internal links on the page
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && !/^(https?:|mailto:|tel:|#)/.test(h))
  );

  // Tap-target audit on mobile: interactive elements under 44px
  let smallTargets = [];
  if (vp.mobile) {
    smallTargets = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('a, button, input, select, textarea, [role=button]')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.height < 44 || r.width < 24) {
          out.push(
            `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''} ${Math.round(r.width)}x${Math.round(r.height)}`
          );
          if (out.length >= 10) break;
        }
      }
      return out;
    });
  }

  const slug = url.replace(`http://127.0.0.1:${PORT}/`, '').replace(/[\/.]/g, '_') || 'index';
  const shot = path.join(outDir, `${label}-${slug}-${vp.name}.png`);
  await page.screenshot({ path: shot, fullPage: true });

  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  await ctx.close();
  return {
    consoleErrors,
    pageErrors,
    failed: [...new Set(failed)],
    kb: Math.round(bytes / 1024),
    requests,
    loadMs,
    ...vitals,
    overflow,
    smallTargets,
    invisible,
    links: [...new Set(links)],
    docHeight,
    shot,
  };
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const srv = await serve();
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const pages = discoverPages();
  const report = { label, pages: {} };

  for (const p of pages) {
    report.pages[p] = {};
    for (const vp of VIEWPORTS) {
      try {
        report.pages[p][vp.name] = await measure(browser, `http://127.0.0.1:${PORT}${p}`, vp);
      } catch (e) {
        report.pages[p][vp.name] = { error: String(e.message).slice(0, 300) };
      }
    }
  }

  // Resolve every internal link against the filesystem, relative to the page that contains it
  const allLinks = new Set();
  for (const [pagePath, vps] of Object.entries(report.pages))
    for (const vp of Object.values(vps)) (vp.links || []).forEach((l) => allLinks.add(pagePath + ' -> ' + l));
  report.brokenLinks = [];
  for (const entry of allLinks) {
    const [pagePath, l] = entry.split(' -> ');
    const clean = l.split('#')[0].split('?')[0];
    if (!clean) continue;
    const pageDir = path.dirname(path.join(repoDir, pagePath.replace(/^\//, '')));
    const fp = path.resolve(pageDir, clean);
    if (!fs.existsSync(fp)) report.brokenLinks.push(`${pagePath} -> ${l}`);
  }

  await browser.close();
  srv.kill();

  fs.writeFileSync(path.join(outDir, `${label}-report.json`), JSON.stringify(report, null, 2));

  // Console summary
  console.log(`\n=== ${label} ===`);
  console.log(`${'page'.padEnd(34)}${'vp'.padEnd(9)}${'KB'.padStart(6)}${'req'.padStart(5)}${'LCP'.padStart(7)}${'CLS'.padStart(8)}${'height'.padStart(8)}  issues`);
  for (const [p, vps] of Object.entries(report.pages)) {
    for (const [vn, r] of Object.entries(vps)) {
      if (r.error) {
        console.log(`${p.padEnd(34)}${vn.padEnd(9)}  ERROR ${r.error}`);
        continue;
      }
      const iss = [];
      if (r.consoleErrors.length) iss.push(`${r.consoleErrors.length} console-err`);
      if (r.pageErrors.length) iss.push(`${r.pageErrors.length} js-err`);
      if (r.failed.length) iss.push(`${r.failed.length} req-fail`);
      if (r.overflow.offenders.length) iss.push(`H-OVERFLOW ${r.overflow.scrollWidth}>${r.overflow.clientWidth}`);
      if (r.smallTargets.length) iss.push(`${r.smallTargets.length} small-tap`);
      if (r.invisible && r.invisible.length) iss.push(`INVISIBLE x${r.invisible.length}`);
      if (r.cls > 0.1) iss.push(`CLS!`);
      console.log(
        `${p.padEnd(34)}${vn.padEnd(9)}${String(r.kb).padStart(6)}${String(r.requests).padStart(5)}${String(r.lcp).padStart(7)}${String(r.cls).padStart(8)}${String(r.docHeight).padStart(8)}  ${iss.join(', ')}`
      );
    }
  }
  if (report.brokenLinks.length) {
    console.log(`\n!!! BROKEN INTERNAL LINKS (${report.brokenLinks.length}):`);
    report.brokenLinks.forEach((l) => console.log('   404 -> ' + l));
  } else console.log('\nAll internal links resolve.');

  // Detail dump of errors
  for (const [p, vps] of Object.entries(report.pages)) {
    for (const [vn, r] of Object.entries(vps)) {
      if (r.error) continue;
      const has = r.consoleErrors.length || r.pageErrors.length || r.failed.length || r.overflow.offenders.length || r.smallTargets.length || (r.invisible && r.invisible.length);
      if (!has) continue;
      console.log(`\n--- ${p} [${vn}] ---`);
      r.pageErrors.forEach((e) => console.log('  JS ERROR: ' + e));
      r.consoleErrors.forEach((e) => console.log('  CONSOLE: ' + e));
      r.failed.forEach((e) => console.log('  REQ: ' + e));
      r.overflow.offenders.forEach((e) => console.log('  OVERFLOW: ' + e));
      r.smallTargets.forEach((e) => console.log('  SMALL TAP TARGET: ' + e));
      (r.invisible || []).forEach((e) => console.log('  STILL INVISIBLE AFTER SCROLL: ' + e));
    }
  }
  console.log(`\nReport: ${path.join(outDir, `${label}-report.json`)}`);
})();
