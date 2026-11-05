/**
 * Copy buttons for the code windows on the guide pages.
 * Each .copy-button names its source <code> element in data-copy-target; the copied
 * text is exactly that element's visible text.
 */
(function () {
  'use strict';

  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
    document.body.removeChild(area);
    return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return fallbackCopy(text);
  }

  function announce(button, message, label) {
    const status = button.parentElement.querySelector('.copy-status');
    button.textContent = label;
    if (status) status.textContent = message;
    setTimeout(() => {
      button.textContent = 'Copy';
      if (status) status.textContent = '';
    }, 1500);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.copy-button').forEach((button) => {
      button.addEventListener('click', () => {
        const source = document.getElementById(button.dataset.copyTarget);
        if (!source) return;
        copyText(source.textContent)
          .then(() => announce(button, 'Copied to clipboard', 'Copied'))
          .catch(() => announce(button, 'Copy failed; select the text and copy it manually', 'Copy failed'));
      });
    });
  });
})();
