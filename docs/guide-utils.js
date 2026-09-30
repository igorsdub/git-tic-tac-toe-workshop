/**
 * Guide Utilities for Git Tic-Tac-Toe Workshop
 * Handles theme synchronization and 1-click clipboard copying.
 */
(function () {
  'use strict';

  const STORAGE_KEY_THEME = 'ttt_gamewall_theme';

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Fall back to document.execCommand if clipboard API is rejected or restricted
      }
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (!successful) {
        throw new Error('document.execCommand copy returned false');
      }
    } finally {
      document.body.removeChild(textArea);
    }
  }

  function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach((btn) => {
      if (!btn.getAttribute('aria-label')) {
        btn.setAttribute('aria-label', 'Copy command to clipboard');
      }

      btn.addEventListener('click', async () => {
        let textToCopy = '';
        const targetId = btn.getAttribute('data-copy-target');
        if (targetId) {
          const el = document.getElementById(targetId);
          if (el) textToCopy = el.textContent.trim();
        } else {
          const codeEl = btn.closest('.code-block-wrapper')?.querySelector('code');
          if (codeEl) textToCopy = codeEl.textContent.trim();
        }

        if (!textToCopy) return;

        try {
          await copyToClipboard(textToCopy);
          const originalText = btn.innerHTML;
          btn.innerHTML = '✓ Copied';
          btn.classList.add('copied');
          btn.setAttribute('aria-label', 'Copied to clipboard');
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
            btn.setAttribute('aria-label', 'Copy command to clipboard');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy: ', err);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCopyButtons();
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  });
})();
