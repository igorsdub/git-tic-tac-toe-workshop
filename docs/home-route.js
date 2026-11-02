/** Routes the plain site URL to setup or the Game Wall using the shared site mode. */
(function (root) {
  'use strict';

  function homeTarget(setupOnly, location) {
    const page = setupOnly ? 'setup.html' : 'wall.html';
    return `${page}${location.search || ''}${location.hash || ''}`;
  }

  function routeHome(config, location, replace) {
    const target = homeTarget(Boolean(config && config.setupOnly), location);
    if (typeof replace === 'function') replace(target);
    return target;
  }

  const api = { homeTarget, routeHome };
  root.HomeRoute = api;
  if (typeof module !== 'undefined') module.exports = api;
  if (typeof document !== 'undefined') {
    routeHome(root.SiteConfig, root.location, (target) => root.location.replace(target));
  }
})(typeof window !== 'undefined' ? window : globalThis);
