/**
 * Shared Quiz Component for Interactive Lessons
 * Provides instant feedback loops and accessibility.
 */
function initQuiz(containerId, correctAnswerIndex, explanations) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const buttons = container.querySelectorAll('.quiz-option');
  const feedbackEl = container.querySelector('.quiz-feedback');

  buttons.forEach((button, idx) => {
    button.addEventListener('click', () => {
      // Disable all options once an answer is chosen
      buttons.forEach(btn => btn.disabled = true);

      if (idx === correctAnswerIndex) {
        button.classList.add('correct');
        feedbackEl.style.display = 'block';
        feedbackEl.style.backgroundColor = 'rgba(26, 127, 55, 0.12)';
        feedbackEl.style.color = 'var(--success-color)';
        feedbackEl.innerHTML = `<strong>Correct!</strong> ${explanations.correct || ''}`;
      } else {
        button.classList.add('incorrect');
        buttons[correctAnswerIndex].classList.add('correct');
        feedbackEl.style.display = 'block';
        feedbackEl.style.backgroundColor = 'rgba(207, 34, 46, 0.12)';
        feedbackEl.style.color = 'var(--error-color)';
        feedbackEl.innerHTML = `<strong>Not quite.</strong> ${explanations.incorrect || ''}`;
      }
    });
  });
}
