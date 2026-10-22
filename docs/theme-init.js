/**
 * Theme module. Loaded synchronously in <head> so data-theme is set before first paint.
 * The storage key lives here and nowhere else. Every storage access is guarded because
 * localStorage can throw (private windows, blocked site data).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ttt_gamewall_theme';
  var root = document.documentElement;

  function isTheme(value) {
    return value === 'dark' || value === 'light';
  }

  function readStored() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return isTheme(value) ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writeStored(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Persistence is a convenience; the theme still applies for this page view.
    }
  }

  function systemTheme() {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (error) {
      return 'light';
    }
  }

  function get() {
    var applied = root.getAttribute('data-theme');
    return isTheme(applied) ? applied : (readStored() || systemTheme());
  }

  /** Swap the logo, favicon and toggle label for whichever of them exist yet. */
  function syncChrome(theme) {
    var logo = document.getElementById('brand-logo');
    var favicon = document.getElementById('theme-favicon');
    var toggle = document.getElementById('theme-toggle');
    var logoAsset = theme === 'dark' ? 'images/xo-logo-dark.svg' : 'images/xo-logo-light.svg';
    if (logo) logo.setAttribute('src', logo.getAttribute('data-' + theme + '-src') || logoAsset);
    if (favicon) favicon.setAttribute('href', logoAsset);
    if (toggle) toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    syncChrome(theme);
  }

  function set(theme) {
    if (!isTheme(theme)) return;
    apply(theme);
    writeStored(theme);
  }

  function toggle() {
    set(get() === 'dark' ? 'light' : 'dark');
  }

  apply(readStored() || systemTheme());
  document.addEventListener('DOMContentLoaded', function () {
    syncChrome(get());
  });

  window.Theme = { get: get, set: set, toggle: toggle };
})();
