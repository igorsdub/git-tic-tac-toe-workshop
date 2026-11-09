/**
 * One checklist per learner page. Ticking an item hides it.
 * Ticks persist in localStorage for this browser.
 */
(function () {
  'use strict';

  function storageKey(list, item) {
    const page = list.getAttribute('data-checklist') || 'page';
    return 'ttt_checklist_' + page + '_' + item;
  }

  function readChecked(list, item) {
    try { return window.localStorage.getItem(storageKey(list, item)) === '1'; } catch (e) { return false; }
  }

  function writeChecked(list, item, checked) {
    try {
      if (checked) window.localStorage.setItem(storageKey(list, item), '1');
      else window.localStorage.removeItem(storageKey(list, item));
    } catch (e) { /* the checkbox still hides the item for this view */ }
  }

  function applyItem(list, item) {
    const box = item.querySelector('input[type="checkbox"]');
    if (!box) return;
    const checked = readChecked(list, item.getAttribute('data-item'));
    box.checked = checked;
    item.classList.toggle('is-done', checked);
  }

  function bind(list) {
    list.querySelectorAll('[data-item]').forEach((item) => applyItem(list, item));
    list.addEventListener('change', (event) => {
      const box = event.target;
      if (!box || !box.matches || !box.matches('input[type="checkbox"]')) return;
      const item = box.closest('[data-item]');
      if (!item || !list.contains(item)) return;
      writeChecked(list, item.getAttribute('data-item'), box.checked);
      item.classList.toggle('is-done', box.checked);
    });
  }

  function init(root) {
    (root || document).querySelectorAll('.page-checklist').forEach(bind);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(document));
    else init(document);
  }

  if (typeof module !== 'undefined') module.exports = { init };
})();
