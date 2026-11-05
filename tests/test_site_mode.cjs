const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../docs/site-config.js');
const { homeTarget, routeHome } = require('../docs/home-route.js');

const repo = path.resolve(__dirname, '..');

test('full site mode is the shared setting and has no query override', () => {
  assert.equal(config.setupOnly, false);
  assert.match(fs.readFileSync(path.join(repo, 'docs/home-route.js'), 'utf8'), /config\.setupOnly/);
  assert.doesNotMatch(fs.readFileSync(path.join(repo, 'docs/home-route.js'), 'utf8'), /searchParams.*setupOnly/i);
});

test('root route selects the configured page and preserves full query and hash', () => {
  const location = { search: '?workshop=ws-riken&source=invite', hash: '#cleanup' };
  assert.equal(homeTarget(true, location), 'setup.html?workshop=ws-riken&source=invite#cleanup');
  assert.equal(homeTarget(false, location), 'wall.html?workshop=ws-riken&source=invite#cleanup');
  let destination;
  const routed = routeHome({ setupOnly: true }, location, (target) => { destination = target; });
  assert.equal(routed, 'setup.html?workshop=ws-riken&source=invite#cleanup');
  assert.equal(destination, routed);
});

test('shared mode controls visibility class and logo destination on direct pages', () => {
  let modeClass = null;
  const links = [{ attributes: {} }, { attributes: {} }];
  const document = {
    documentElement: { classList: { toggle(name, enabled) { modeClass = enabled ? name : null; } } },
    querySelectorAll(selector) { assert.equal(selector, '.brand-link'); return links; },
  };
  const location = { search: '?workshop=ws-sokedai', hash: '#rematch' };
  links.forEach((link) => { link.setAttribute = (name, value) => { link.attributes[name] = value; }; });
  config.applyMode(document, true, location);
  assert.equal(modeClass, 'setup-only');
  assert.deepEqual(links.map((link) => link.attributes.href), Array(2).fill('setup.html?workshop=ws-sokedai#rematch'));
  config.applyMode(document, false, location);
  assert.equal(modeClass, null);
  assert.deepEqual(links.map((link) => link.attributes.href), Array(2).fill('wall.html?workshop=ws-sokedai#rematch'));
});

test('all direct pages load mode before styles and setup-only CSS hides navigation and onward actions', () => {
  for (const file of ['setup.html', 'guide.html', 'wall.html']) {
    const html = fs.readFileSync(path.join(repo, 'docs', file), 'utf8');
    assert.match(html, /<html lang="en" class="setup-only">/);
    assert.ok(html.indexOf('src="site-config.js"') < html.indexOf('href="styles.css"'));
    assert.match(html, /class="brand-link"/);
  }
  const styles = fs.readFileSync(path.join(repo, 'docs/styles.css'), 'utf8');
  for (const selector of ['.stage-strip', '[data-stage-strip]', '.stage-next', '[data-workshop-registration]', '.register-btn']) {
    assert.ok(styles.includes(`html.setup-only ${selector}`), selector);
  }
});

test('root route has a no-JavaScript setup fallback', () => {
  const html = fs.readFileSync(path.join(repo, 'docs/index.html'), 'utf8');
  assert.match(html, /<noscript>[\s\S]*href="setup.html"[\s\S]*<\/noscript>/);
  assert.match(html, /src="home-route.js"/);
});
