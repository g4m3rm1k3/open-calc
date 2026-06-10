// Mouse position tracker
const cursorXEl = document.querySelector('#cursor-x');
const cursorYEl = document.querySelector('#cursor-y');
document.addEventListener('mousemove', function (event) {
  cursorXEl.textContent = Math.round(event.clientX);
  cursorYEl.textContent = Math.round(event.clientY);
});

// Key display
const keyDisplayEl = document.querySelector('#key-display');
document.addEventListener('keydown', function (event) {
  keyDisplayEl.textContent = event.key;
});

// JavaScript hover cards
const hoverCards = document.querySelectorAll('.hover-card');
const hoverLabelEl = document.querySelector('#hover-label');
let activeIndex = -1;

function highlightCard(newIndex) {
  hoverCards.forEach(function (c) { c.classList.remove('is-hovered'); });
  activeIndex = newIndex;
  if (activeIndex >= 0) {
    hoverCards[activeIndex].classList.add('is-hovered');
    hoverLabelEl.textContent = 'Active: Card ' + (activeIndex + 1);
  }
}

hoverCards.forEach(function (card, index) {
  card.addEventListener('mouseenter', function () {
    card.classList.add('is-hovered');
    hoverLabelEl.textContent = 'Hovering: ' + card.dataset.index;
  });
  card.addEventListener('mouseleave', function () {
    card.classList.remove('is-hovered');
    hoverLabelEl.textContent = 'Hover a card';
  });
});

document.addEventListener('keydown', function (event) {
  const count = hoverCards.length;
  if (event.key === 'ArrowRight') {
    highlightCard((activeIndex + 1) % count);
  } else if (event.key === 'ArrowLeft') {
    highlightCard((activeIndex - 1 + count) % count);
  }
});
