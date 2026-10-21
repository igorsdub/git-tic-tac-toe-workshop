/** Workshop-aware setup page: picks the notice or track and persists step checkboxes. */
(function () {
  'use strict';

  function setupView(workshop) {
    if (workshop && workshop.status === 'archived') return 'archived';
    if (workshop && workshop.setupTrack === 'codespaces') return 'codespaces';
    return 'pending';
  }

  function formatDate(iso) {
    const [year, month, day] = String(iso || '').split('-').map(Number);
    if (!year || !month || !day) return '';
    const monthName = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' })
      .format(new Date(Date.UTC(year, month - 1, 1)));
    return `${day} ${monthName} ${year}`;
  }

  if (typeof document !== 'undefined') {
    const byId = (id) => document.getElementById(id);
    let currentId = null;

    const storageKey = (stepId) => `ttt_setup_${currentId}_${stepId}`;
    function readChecked(stepId) {
      try { return window.localStorage.getItem(storageKey(stepId)) === '1'; } catch (e) { return false; }
    }
    function writeChecked(stepId, checked) {
      try {
        if (checked) window.localStorage.setItem(storageKey(stepId), '1');
        else window.localStorage.removeItem(storageKey(stepId));
      } catch (e) { /* storage unavailable: the checkbox still works for this page view */ }
    }

    function applyChecks() {
      document.querySelectorAll('.step-check').forEach((box) => {
        box.checked = readChecked(box.dataset.step);
      });
    }

    function hideWrap(video) {
      const wrap = video.closest('details');
      if (wrap) wrap.hidden = true;
    }

    function renderSetup(workshop) {
      if (!workshop) return;
      currentId = workshop.id;
      const label = byId('setup-workshop');
      if (label) {
        const date = formatDate(workshop.date);
        label.textContent = date ? `${workshop.name} · ${date}` : String(workshop.name);
      }
      const view = setupView(workshop);
      const show = (id, on) => { const node = byId(id); if (node) node.hidden = !on; };
      show('setup-archived', view === 'archived');
      show('setup-codespaces', view === 'codespaces');
      show('setup-pending', view === 'pending');
      show('setup-next', view !== 'archived');
      const hasSurvey = Boolean(workshop.surveyUrl);
      document.querySelectorAll('[data-survey-link]').forEach((link) => {
        if (hasSurvey) link.setAttribute('href', workshop.surveyUrl);
        else link.removeAttribute('href');
      });
      show('setup-pending-survey', view === 'pending' && hasSurvey);
      show('step-survey', hasSurvey);
      document.querySelectorAll('.jump-pill[href="#step-survey"]').forEach((pill) => { pill.hidden = !hasSurvey; });
      applyChecks();
    }

    document.querySelectorAll('.step-check').forEach((box) => {
      box.addEventListener('change', () => writeChecked(box.dataset.step, box.checked));
    });
    document.querySelectorAll('video.step-video').forEach((video) => {
      video.addEventListener('error', () => hideWrap(video));
      video.querySelectorAll('source').forEach((source) => source.addEventListener('error', () => hideWrap(video)));
      // The error may already have fired before this script ran.
      if (video.error || video.networkState === 3) hideWrap(video);
    });
    document.addEventListener('workshopchange', (event) => {
      renderSetup(event.detail && event.detail.workshop);
    });
    if (window.WorkshopContext) {
      window.WorkshopContext.ready.then(
        () => renderSetup(window.WorkshopContext.selectedWorkshop),
        () => {},
      );
    }
    window.renderSetup = renderSetup;
  }

  if (typeof module !== 'undefined') module.exports = { setupView };
})();
