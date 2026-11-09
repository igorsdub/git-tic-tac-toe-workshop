/** Workshop-aware setup page: picks the notice or the Codespaces track. */
(function () {
  'use strict';

  function setupView(workshop) {
    if (workshop && workshop.status === 'archived') return 'archived';
    if (workshop && workshop.setupTrack === 'codespaces') return 'codespaces';
    return 'pending';
  }

  if (typeof document !== 'undefined') {
    const byId = (id) => document.getElementById(id);

    function renderSetup(workshop) {
      if (!workshop) return;
      const view = setupView(workshop);
      const show = (id, on) => { const node = byId(id); if (node) node.hidden = !on; };
      show('setup-error', false);
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
    }

    document.addEventListener('workshopchange', (event) => {
      renderSetup(event.detail && event.detail.workshop);
    });
    if (window.WorkshopContext) {
      window.WorkshopContext.ready.then(
        () => renderSetup(window.WorkshopContext.selectedWorkshop),
        () => { const node = byId('setup-error'); if (node) node.hidden = false; },
      );
    }
    window.renderSetup = renderSetup;
  }

  if (typeof module !== 'undefined') module.exports = { setupView };
})();
