/** Shared stage strip: Setup -> How to play -> Game Wall. Renders synchronously at load. */
(function () {
  'use strict';

  const STAGES = [
    { id: 'setup', number: 1, name: 'Setup', href: 'setup.html' },
    { id: 'guide', number: 2, name: 'How to play', href: 'guide.html' },
    { id: 'wall', number: 3, name: 'Game Wall', href: 'index.html' },
  ];

  function render(container) {
    if (!container || container.dataset.stageStripRendered) return;
    container.dataset.stageStripRendered = 'true';
    const current = container.getAttribute('data-stage-strip');
    const nav = document.createElement('nav');
    nav.className = 'stage-strip';
    nav.setAttribute('aria-label', 'Workshop stages');
    const list = document.createElement('ol');
    STAGES.forEach((stage) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.setAttribute('data-workshop-route', '');
      link.setAttribute('href', stage.href);
      if (stage.id === current) {
        link.setAttribute('aria-current', 'step');
        link.classList.add('is-current');
      }
      [['stage-number', String(stage.number)], ['stage-name', stage.name]]
        .forEach(([cls, text], index) => {
          if (index) link.appendChild(document.createTextNode(' '));
          const span = document.createElement('span');
          span.className = cls;
          span.textContent = text;
          link.appendChild(span);
        });
      item.appendChild(link);
      list.appendChild(item);
    });
    const item = document.createElement('li');
    const registration = document.createElement('a');
    registration.setAttribute('data-workshop-registration', '');
    registration.href = 'https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-11-06-sokedai';
    registration.target = '_blank';
    registration.rel = 'noopener noreferrer';
    registration.textContent = 'Register repository';
    item.appendChild(registration);
    list.appendChild(item);
    nav.appendChild(list);
    container.appendChild(nav);
  }

  const api = { STAGES, render };
  if (typeof document !== 'undefined') {
    document.querySelectorAll('[data-stage-strip]').forEach(render);
    window.StageStrip = api;
  }
  if (typeof module !== 'undefined') module.exports = api;
})();
