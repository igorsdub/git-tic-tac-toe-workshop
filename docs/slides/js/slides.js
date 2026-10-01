/**
 * GECS Slides Navigation Engine
 * Supports keyboard navigation, click advancement, and responsive slide switching.
 */

let currentSlide = 1;

function getTotalSlides() {
  return document.querySelectorAll('.slide').length;
}

function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  if (total === 0) return;

  if (index < 1) index = 1;
  if (index > total) index = total;
  currentSlide = index;

  slides.forEach((el, i) => {
    el.classList.toggle('active', i + 1 === currentSlide);
  });
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

function handleStageClick(event) {
  // Do not advance if the user clicked an interactive element (link, button)
  if (event.target.closest('a') || event.target.closest('button')) {
    return;
  }
  nextSlide();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    nextSlide();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    prevSlide();
  } else if (e.key === 'Home') {
    showSlide(1);
  } else if (e.key === 'End') {
    showSlide(getTotalSlides());
  }
});

// Expose globally for inline event handlers
window.showSlide = showSlide;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.handleStageClick = handleStageClick;
