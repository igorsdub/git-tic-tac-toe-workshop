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
      const wrap = video.closest('.step-video-wrap');
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
      applyChecks();
    }

    document.querySelectorAll('.step-check').forEach((box) => {
      box.addEventListener('change', () => writeChecked(box.dataset.step, box.checked));
    });
    // Hide a step video only when its file is genuinely absent. A transient
    // media error (interrupted download) keeps it visible with a reload link.
    async function videoMissing(src) {
      try {
        const head = await fetch(src, { method: 'HEAD' });
        if (head.ok) return false;
        if (head.status === 404 || head.status === 410) return true;
        const ranged = await fetch(src, { headers: { Range: 'bytes=0-0' } });
        return !ranged.ok;
      } catch (error) {
        return false;
      }
    }
    document.querySelectorAll('video.step-video').forEach((video) => {
      const src = video.getAttribute('src');
      let present = false;
      const checked = videoMissing(src).then((missing) => {
        if (missing) hideWrap(video); else present = true;
      });
      video.addEventListener('error', () => {
        checked.then(() => {
          const wrap = video.closest('.step-video-wrap');
          if (!present || !wrap || wrap.querySelector('.video-reload')) return;
          const link = document.createElement('a');
          link.href = '#';
          link.className = 'video-reload';
          link.textContent = 'Reload video';
          link.addEventListener('click', (event) => {
            event.preventDefault();
            video.setAttribute('src', src);
            video.load();
            link.remove();
          });
          wrap.appendChild(link);
        });
      });
    });

    // Each primary video plays only while its step is on screen. Native controls
    // remain available when autoplay is blocked or reduced motion requires an
    // explicit play action.
    document.querySelectorAll('video.step-video-primary').forEach((video) => {
      const step = video.closest('.setup-step');
      const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let inView = false;
      let autoStarted = false;
      const canPlay = () => {
        if (!inView || document.hidden || !step || step.hidden) return false;
        for (let parent = video.parentElement; parent && parent !== step; parent = parent.parentElement) {
          if (parent.hidden || (parent.tagName === 'DETAILS' && !parent.open)) return false;
        }
        return true;
      };
      const updatePlayback = () => {
        if (!canPlay()) {
          video.pause();
          autoStarted = false;
        } else if (motionPreference.matches) {
          if (autoStarted) video.pause();
          autoStarted = false;
        } else if (video.paused) {
          autoStarted = true;
          const attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => { autoStarted = false; });
          }
        }
      };
      video.addEventListener('pause', () => { autoStarted = false; });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          inView = entries.some((entry) => entry.target === video && entry.isIntersecting && entry.intersectionRatio >= 0.25);
          updatePlayback();
        }, { threshold: [0, 0.25] }).observe(video);
      }
      document.addEventListener('visibilitychange', updatePlayback);
      step.querySelectorAll('details').forEach((details) => details.addEventListener('toggle', updatePlayback));
      const visibilityObserver = new MutationObserver(updatePlayback);
      for (let parent = step; parent; parent = parent.parentElement) {
        visibilityObserver.observe(parent, { attributes: true, attributeFilter: ['hidden', 'open'] });
      }
      motionPreference.addEventListener?.('change', updatePlayback);
    });
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
