/**
 * In-page enlargement for instructional screenshots.
 * Without JavaScript, each .step-image-link still opens the original PNG in a new tab.
 */
(function (root) {
  'use strict';

  function shouldExpandClick(event) {
    if (!event || event.defaultPrevented) return false;
    if (event.button != null && event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    return true;
  }

  function mount(documentRef, windowRef) {
    if (!documentRef || !documentRef.body || documentRef.querySelector('.shot-lightbox')) return null;

    const overlay = documentRef.createElement('div');
    overlay.className = 'shot-lightbox';
    overlay.hidden = true;
    overlay.innerHTML = [
      '<div class="shot-lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="shot-lightbox-title">',
      '<div class="shot-lightbox-bar">',
      '<p id="shot-lightbox-title" class="shot-lightbox-title"></p>',
      '<a class="shot-lightbox-original" target="_blank" rel="noopener noreferrer">Open original size</a>',
      '<button type="button" class="shot-lightbox-close">Close</button>',
      '</div>',
      '<img class="shot-lightbox-image" alt="">',
      '</div>',
    ].join('');
    documentRef.body.appendChild(overlay);

    const dialog = overlay.querySelector('.shot-lightbox-dialog');
    const title = overlay.querySelector('.shot-lightbox-title');
    const original = overlay.querySelector('.shot-lightbox-original');
    const closeButton = overlay.querySelector('.shot-lightbox-close');
    const image = overlay.querySelector('.shot-lightbox-image');
    const view = windowRef || null;
    let opener = null;
    let savedScroll = 0;

    function focusables() {
      return [closeButton, original];
    }

    function open(link, sourceImage) {
      const alt = sourceImage.getAttribute('alt') || '';
      const href = link.getAttribute('href') || sourceImage.getAttribute('src') || '';
      title.textContent = alt;
      image.alt = alt;
      image.src = sourceImage.currentSrc || sourceImage.getAttribute('src') || href;
      original.href = href;
      opener = link;
      savedScroll = view ? view.scrollY || documentRef.documentElement.scrollTop || 0 : 0;
      link.setAttribute('aria-expanded', 'true');
      overlay.hidden = false;
      documentRef.documentElement.classList.add('shot-lightbox-open');
      closeButton.focus();
    }

    function close() {
      if (overlay.hidden) return;
      overlay.hidden = true;
      documentRef.documentElement.classList.remove('shot-lightbox-open');
      image.removeAttribute('src');
      const returnTo = opener;
      if (returnTo) returnTo.setAttribute('aria-expanded', 'false');
      opener = null;
      if (returnTo && returnTo.focus) returnTo.focus({ preventScroll: true });
      if (view && view.scrollTo) view.scrollTo(0, savedScroll);
    }

    function onKeyDown(event) {
      if (overlay.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      const active = documentRef.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    closeButton.addEventListener('click', close);
    documentRef.addEventListener('keydown', onKeyDown);
    documentRef.addEventListener('click', (event) => {
      const link = event.target && event.target.closest && event.target.closest('a.step-image-link');
      if (!link || overlay.contains(link) || !shouldExpandClick(event)) return;
      const sourceImage = link.querySelector('img');
      if (!sourceImage) return;
      event.preventDefault();
      open(link, sourceImage);
    });

    documentRef.querySelectorAll('a.step-image-link').forEach((link) => {
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-expanded', 'false');
    });

    return { overlay, open, close, image, closeButton, original, title };
  }

  const api = { shouldExpandClick, mount };
  root.ShotLightbox = api;

  if (typeof document !== 'undefined' && document.querySelector) {
    const start = () => mount(document, root);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }

  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
