/** Shared site mode. Set setupOnly to false to restore the full workshop site. */
(function (root) {
  'use strict';

  const config = { setupOnly: false };

  function applyMode(documentRef, setupOnly, location) {
    if (!documentRef) return;
    documentRef.documentElement.classList.toggle('setup-only', Boolean(setupOnly));
    const page = setupOnly ? 'setup.html' : 'wall.html';
    const destination = `${page}${location.search || ''}${location.hash || ''}`;
    documentRef.querySelectorAll('.brand-link').forEach((link) => link.setAttribute('href', destination));
  }

  const api = Object.freeze({ ...config, applyMode });
  root.SiteConfig = api;

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('setup-only', config.setupOnly);
    const updateBrandLinks = () => applyMode(document, config.setupOnly, window.location);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateBrandLinks, { once: true });
    } else {
      updateBrandLinks();
    }
  }

  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
