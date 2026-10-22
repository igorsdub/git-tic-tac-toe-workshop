/**
 * Guide Utilities for Git Tic-Tac-Toe Workshop
 * Wires the theme toggle on the guide and setup pages. Theme state, persistence and
 * the logo/favicon/label swap live in theme-init.js (window.Theme).
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && window.Theme) {
      themeToggle.addEventListener('click', () => window.Theme.toggle());
    }
  });
})();
