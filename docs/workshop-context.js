/** Shared workshop selection and event context for every published route. */
(function () {
  'use strict';

  const CATALOG_URL = './workshops.json';
  const select = document.getElementById('workshop-select');
  const nameNode = document.getElementById('current-workshop-name');
  const dateNode = document.getElementById('current-workshop-date');
  const noteNode = document.getElementById('current-workshop-note');
  const statusNode = document.getElementById('workshop-context-status');
  let catalog = null;
  let activeWorkshop = null;
  let catalogLoad = null;
  let listenersInstalled = false;

  function formatDate(isoDate) {
    const [year, month, day] = String(isoDate || '').split('-').map(Number);
    if (!year || !month || !day) return 'Date to be announced';
    const monthName = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' })
      .format(new Date(Date.UTC(year, month - 1, 1)));
    return `${monthName} ${day}, ${year}`;
  }

  function navigationHref(href, workshopId) {
    const target = new URL(href, window.location.href);
    target.searchParams.set('workshop', workshopId);
    const filename = target.pathname.split('/').pop() || 'index.html';
    return `${filename}${target.search}${target.hash}`;
  }

  function updateNavigation(workshopId) {
    document.querySelectorAll('.nav-links a, .brand-link, [data-workshop-route]').forEach((link) => {
      link.setAttribute('href', navigationHref(link.getAttribute('href'), workshopId));
    });
  }

  function render(workshop) {
    activeWorkshop = workshop;
    if (select) select.value = workshop.id;
    if (nameNode) nameNode.textContent = workshop.name;
    if (dateNode) dateNode.textContent = formatDate(workshop.date);
    if (noteNode) {
      noteNode.textContent = workshop.note || '';
      noteNode.hidden = !workshop.note;
    }
    document.querySelectorAll('[data-workshop-registration]').forEach((link) => {
      link.href = workshop.registrationUrl;
      link.setAttribute('aria-label', `Register a repository for ${workshop.name}`);
    });
    document.querySelectorAll('[data-workshop-dashboard]').forEach((link) => {
      link.href = navigationHref('index.html', workshop.id);
    });
    updateNavigation(workshop.id);
  }

  function emitSelection() {
    document.dispatchEvent(new CustomEvent('workshopchange', {
      detail: { workshopId: activeWorkshop.id, workshop: activeWorkshop },
    }));
  }

  function selectWorkshop(workshopId, { updateUrl = true, notify = true } = {}) {
    if (!catalog) return;
    const workshop = catalog.workshops.find((item) => item.id === workshopId);
    if (!workshop) return;
    render(workshop);
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('workshop', workshop.id);
      window.history.pushState({}, '', url);
    }
    if (notify) emitSelection();
  }

  function installListeners() {
    if (listenersInstalled) return;
    listenersInstalled = true;
    if (select) select.addEventListener('change', () => selectWorkshop(select.value));
    window.addEventListener('popstate', () => {
      if (!catalog) return;
      const requestedId = new URL(window.location.href).searchParams.get('workshop');
      const valid = catalog.workshops.some((workshop) => workshop.id === requestedId);
      const resolvedId = valid ? requestedId : catalog.defaultWorkshopId;
      if (requestedId && !valid) {
        const url = new URL(window.location.href);
        url.searchParams.set('workshop', resolvedId);
        window.history.replaceState({}, '', url);
      }
      selectWorkshop(resolvedId, { updateUrl: false });
    });
  }

  async function initialize() {
    const response = await fetch(`${CATALOG_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error(`Workshop catalog unavailable (HTTP ${response.status}).`);
    catalog = await response.json();
    if (!catalog || !Array.isArray(catalog.workshops) || !catalog.workshops.length) {
      throw new Error('The workshop catalog has no configured workshops.');
    }
    const workshopIds = new Set(catalog.workshops.map((workshop) => workshop.id));
    if (!workshopIds.has(catalog.defaultWorkshopId)) {
      throw new Error('The workshop catalog default is not configured.');
    }
    if (select) {
      const active = catalog.workshops.filter((workshop) => workshop.status === 'active');
      const archived = catalog.workshops.filter((workshop) => workshop.status === 'archived');
      const appendOption = (workshop, parent = select) => {
        const option = document.createElement('option');
        option.value = workshop.id;
        option.textContent = workshop.name;
        parent.appendChild(option);
      };
      select.replaceChildren();
      active.forEach((workshop) => appendOption(workshop));
      if (archived.length) {
        const group = document.createElement('optgroup');
        group.label = 'Archived workshops';
        archived.forEach((workshop) => appendOption(workshop, group));
        select.appendChild(group);
      }
    }
    const requestedWorkshopId = new URL(window.location.href).searchParams.get('workshop');
    const selectedId = workshopIds.has(requestedWorkshopId) ? requestedWorkshopId : catalog.defaultWorkshopId;
    render(catalog.workshops.find((workshop) => workshop.id === selectedId));
    if (requestedWorkshopId && !workshopIds.has(requestedWorkshopId)) {
      const url = new URL(window.location.href);
      url.searchParams.set('workshop', catalog.defaultWorkshopId);
      window.history.replaceState({}, '', url);
    }
    installListeners();
    if (statusNode) statusNode.textContent = 'Choose a workshop for its date, registration, and Game Wall.';
    return { catalog, workshopId: selectedId };
  }

  function loadCatalog() {
    if (!catalogLoad) {
      const pending = initialize().catch((error) => {
        if (statusNode) statusNode.textContent = 'Workshop details could not be loaded.';
        if (catalogLoad === pending) catalogLoad = null;
        throw error;
      });
      catalogLoad = pending;
    }
    return catalogLoad;
  }

  // Start loading for guide and setup routes, which do not otherwise request the catalog.
  // The shared promise resets after failure so a dashboard refresh can retry it.
  loadCatalog().catch(() => {});

  window.WorkshopContext = {
    get ready() { return loadCatalog(); },
    get selectedWorkshop() { return activeWorkshop; },
    selectWorkshop,
  };
})();
