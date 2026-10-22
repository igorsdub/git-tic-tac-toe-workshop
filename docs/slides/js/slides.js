/**
 * Slides navigation engine
 * Supports keyboard navigation, click advancement, hash navigation (#slide-N)
 * and computed footer counters.
 */

let currentSlide = 1;

const HASH_PATTERN = /^#slide-(\d+)$/;

function getTotalSlides() {
  return document.querySelectorAll('.slide').length;
}

function slideFromHash(hash) {
  const match = HASH_PATTERN.exec(hash || '');
  if (!match) return 1;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) ? n : 1;
}

function updateHash() {
  const target = `#slide-${currentSlide}`;
  if (window.location.hash === target) return;
  try {
    history.replaceState(null, '', target);
  } catch (err) {
    // Some contexts (sandboxed frames) refuse replaceState; navigation still works.
  }
}

function fillCounters() {
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  slides.forEach((el, i) => {
    el.querySelectorAll('.slide-num').forEach((num) => {
      num.textContent = `${i + 1} / ${total}`;
    });
  });
}

function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  if (total === 0) return;

  if (!Number.isFinite(index) || index < 1) index = 1;
  if (index > total) index = total;
  currentSlide = index;

  slides.forEach((el, i) => {
    el.classList.toggle('active', i + 1 === currentSlide);
  });
  updateHash();
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

function isInteractive(target) {
  return Boolean(target && target.closest && target.closest('a, button, input, select, textarea, summary'));
}

function handleStageClick(event) {
  // Do not advance if the user clicked an interactive element (link, button)
  if (isInteractive(event.target)) {
    return;
  }
  nextSlide();
}

function handleKeydown(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const stage = document.getElementById('stage');
  const interactive = isInteractive(e.target);

  if (e.key === 'ArrowRight' || e.key === 'PageDown') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === ' ' || e.key === 'Spacebar') {
    // Space on a focused link or button keeps its default action.
    if (interactive) return;
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'Enter') {
    // Enter advances only from the focused stage; links and buttons keep their default.
    if (interactive || e.target !== stage) return;
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    prevSlide();
  } else if (e.key === 'Home') {
    e.preventDefault();
    showSlide(1);
  } else if (e.key === 'End') {
    e.preventDefault();
    showSlide(getTotalSlides());
  }
}

function init() {
  const stage = document.getElementById('stage');
  if (stage) {
    stage.addEventListener('click', handleStageClick);
  }
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('hashchange', () => {
    showSlide(slideFromHash(window.location.hash));
  });
  fillCounters();
  showSlide(slideFromHash(window.location.hash));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
