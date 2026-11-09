/**
 * One checklist per learner page. Ticking an item hides it.
 * Ticks are stored per workshop id so two workshops do not share them.
 * "Show completed (n)" brings a hidden item back so a misclick can be undone.
 */
(function () {
  'use strict';

  function workshopId() {
    const workshop = window.WorkshopContext && window.WorkshopContext.selectedWorkshop;
    return workshop && workshop.id ? String(workshop.id) : '';
  }

  function storageKey(list, item) {
    const page = list.getAttribute('data-checklist') || 'page';
    return 'ttt_checklist_' + workshopId() + '_' + page + '_' + item;
  }

  function readChecked(list, item) {
    if (!workshopId()) return false;
    try { return window.localStorage.getItem(storageKey(list, item)) === '1'; } catch (e) { return false; }
  }

  function writeChecked(list, item, checked) {
    if (!workshopId()) return;
    try {
      if (checked) window.localStorage.setItem(storageKey(list, item), '1');
      else window.localStorage.removeItem(storageKey(list, item));
    } catch (e) { /* the checkbox still hides the item for this view */ }
  }

  function completedCount(list) {
    return list.querySelectorAll('[data-item].is-done').length;
  }

  function ensureToggle(list) {
    let button = list.nextElementSibling;
    if (!button || !button.classList.contains('checklist-completed')) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'checklist-completed';
      button.hidden = true;
      button.addEventListener('click', () => {
        list.classList.toggle('is-revealed');
        updateToggle(list);
      });
      list.insertAdjacentElement('afterend', button);
    }
    return button;
  }

  function updateToggle(list) {
    const button = ensureToggle(list);
    const count = completedCount(list);
    if (!count) list.classList.remove('is-revealed');
    const open = list.classList.contains('is-revealed');
    button.hidden = count === 0;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.textContent = open ? 'Hide completed' : 'Show completed (' + count + ')';
  }

  function applyItem(list, item) {
    const box = item.querySelector('input[type="checkbox"]');
    if (!box) return;
    if (item.dataset.userSet === '1') {
      if (workshopId()) writeChecked(list, item.getAttribute('data-item'), box.checked);
      item.classList.toggle('is-done', box.checked);
      return;
    }
    const checked = readChecked(list, item.getAttribute('data-item'));
    box.checked = checked;
    item.classList.toggle('is-done', checked);
  }

  function applyList(list) {
    list.querySelectorAll('[data-item]').forEach((item) => applyItem(list, item));
    updateToggle(list);
  }

  function bind(list) {
    if (list.dataset.checklistBound) return;
    list.dataset.checklistBound = 'true';
    list.addEventListener('change', (event) => {
      const box = event.target;
      if (!box || !box.matches || !box.matches('input[type="checkbox"]')) return;
      const item = box.closest('[data-item]');
      if (!item || !list.contains(item)) return;
      item.dataset.userSet = '1';
      writeChecked(list, item.getAttribute('data-item'), box.checked);
      item.classList.toggle('is-done', box.checked);
      updateToggle(list);
    });
    applyList(list);
  }

  function refresh() {
    document.querySelectorAll('.page-checklist').forEach(applyList);
  }

  function init() {
    document.querySelectorAll('.page-checklist').forEach(bind);
    document.addEventListener('workshopchange', () => {
      document.querySelectorAll('[data-user-set]').forEach((item) => { delete item.dataset.userSet; });
      refresh();
    });
    if (window.WorkshopContext && window.WorkshopContext.ready) {
      window.WorkshopContext.ready.then(refresh, refresh);
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }

  if (typeof module !== 'undefined') module.exports = { init, refresh };
})();
