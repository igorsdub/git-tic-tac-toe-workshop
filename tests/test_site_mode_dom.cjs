const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const explicitChromium = process.env.CHROMIUM_BIN || process.env.CHROMIUM_PATH;
const chromium = explicitChromium || (() => {
  try {
    const candidate = execFileSync('which', ['chromium'], { encoding: 'utf8' }).trim();
    if (candidate && fs.existsSync(candidate)) return candidate;
  } catch {}
  const chromeApp = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return fs.existsSync(chromeApp) ? chromeApp : null;
})();
const usable = chromium
  ? spawnSync(chromium, ['--headless=new', '--no-sandbox', '--disable-gpu', '--dump-dom', 'about:blank'], { encoding: 'utf8', timeout: 5000 }).status === 0
  : false;
if (explicitChromium && !usable) throw new Error(`Configured Chromium is unavailable: ${explicitChromium}`);

test('direct setup, guide, and wall pages respect both modes, workshop query, logo, and setup completion state', { skip: !usable }, () => {
  const repo = path.resolve(__dirname, '..');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-mode-dom-'));
  const configSource = fs.readFileSync(path.join(repo, 'docs/site-config.js'), 'utf8');
  const configFor = (mode) => configSource.replace(/setupOnly:\s*(true|false)/, `setupOnly: ${mode}`);
  const configPath = path.join(tempDir, 'site-config.js');
  const configUrl = `file://${configPath}`;
  const cases = [
    { setupOnly: true, page: 'setup.html', expectedLogo: 'setup.html', expectedNav: 'none', expectedNext: 'none' },
    { setupOnly: true, page: 'guide.html', expectedLogo: 'setup.html', expectedNav: 'none', expectedNext: 'none' },
    { setupOnly: true, page: 'wall.html', expectedLogo: 'setup.html', expectedNav: 'none', expectedNext: 'none' },
    { setupOnly: false, page: 'setup.html', expectedLogo: 'wall.html', expectedNav: 'block', expectedNext: 'block' },
    { setupOnly: false, page: 'guide.html', expectedLogo: 'wall.html', expectedNav: 'block', expectedNext: 'block' },
    { setupOnly: false, page: 'wall.html', expectedLogo: 'wall.html', expectedNav: 'block', expectedNext: 'block' },
  ];
  try {
    for (const mode of [true, false]) {
      fs.writeFileSync(configPath, configFor(mode));
      for (const entry of cases.filter((item) => item.setupOnly === mode)) {
        const contentSelector = entry.page === 'setup.html' ? '#setup-codespaces' : entry.page === 'guide.html' ? '#turn' : '#game-grid';
        const source = fs.readFileSync(path.join(repo, 'docs', entry.page), 'utf8');
        const pagePath = path.join(tempDir, entry.page);
        const scripts = [
          `<script>window.fetch = async () => new Response(JSON.stringify({ defaultWorkshopId: 'ws-code', workshops: [{ id: 'ws-code', name: 'Code Day', date: '2026-11-06', status: 'active', setupTrack: 'codespaces', surveyUrl: 'https://example.test/survey', registrationUrl: 'https://example.test/register?workshop_id=ws-code' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });</script>`,
          `<script src="${path.join(repo, 'docs/stage-strip.js')}"></script>`,
          `<script src="${path.join(repo, 'docs/workshop-context.js')}"></script>`,
          entry.page === 'setup.html' ? `<script src="${path.join(repo, 'docs/setup.js')}"></script>` : '',
          entry.page === 'guide.html' ? `<script src="${path.join(repo, 'docs/guide-utils.js')}"></script>` : '',
          `<script>(async()=>{await window.WorkshopContext.ready;await new Promise(r=>setTimeout(r,40));const css=(node)=>node?getComputedStyle(node).display:'missing';const nav=css(document.querySelector('.stage-strip'));const next=css(document.querySelector('.stage-next'));const registration=document.querySelector('.stage-strip [data-workshop-registration]');const hiddenRegister=registration&&css(registration.closest('.stage-strip'))==='none';const logo=new URL(document.querySelector('.brand-link').href);const setupDone=document.querySelector('#setup-next');if(setupDone){document.querySelector('#check-step-repo').checked=true;document.querySelector('#check-step-repo').dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,20));}const result=nav==='${entry.expectedNav}'&&next==='${entry.expectedNext}'&&hiddenRegister===${mode}&&logo.pathname.endsWith('/${entry.expectedLogo}')&&logo.searchParams.get('workshop')==='ws-code'&&logo.hash==='#rematch'&&(!setupDone||css(setupDone)==='${entry.expectedNext}')&&!!document.querySelector('main')&&!!document.querySelector('${contentSelector}');document.body.dataset.modeResult=result?'PASS':'FAIL';})();</script>`,
        ].join('\n');
        const pageHtml = source
          .replace(/<script src="site-config\.js"><\/script>/, `<script>${configFor(mode)}</script>`)
          .replace(/<script src="[^"]+"><\/script>/g, '')
          .replace(/href="styles\.css"/, `href="${path.join(repo, 'docs/styles.css')}"`)
          .replace('</body>', `${scripts}</body>`);
        fs.writeFileSync(pagePath, pageHtml);
        const result = spawnSync(chromium, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking', '--virtual-time-budget=1500', '--dump-dom', `file://${pagePath}?workshop=ws-code&setupOnly=false#rematch`], { encoding: 'utf8', timeout: 12000 });
        assert.equal(result.status, 0, `${entry.page} setupOnly=${mode}: ${result.stderr}`);
        assert.match(result.stdout, /data-mode-result="PASS"/, `${entry.page} setupOnly=${mode}: ${result.stdout.slice(-2400)}`);
      }
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
