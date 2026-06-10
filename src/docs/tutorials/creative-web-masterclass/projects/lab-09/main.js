// Get references to elements we will modify
const card = document.querySelector('#demo-card');
const statusEl = document.querySelector('.card-status');
const descEl = document.querySelector('.card-desc');
const btnChange = document.querySelector('#btn-change');
const btnTheme = document.querySelector('#btn-theme');
const btnReset = document.querySelector('#btn-reset');

// "Change Text" — updates textContent on two elements
btnChange.addEventListener('click', function () {
  statusEl.textContent = 'Status: Active';
  descEl.textContent = 'JavaScript changed this text.';
});

// "Toggle Theme" — adds/removes the is-dark class (CSS handles the visual change)
btnTheme.addEventListener('click', function () {
  card.classList.toggle('is-dark');
});

// "Reset" — restores original text and removes dark class
btnReset.addEventListener('click', function () {
  statusEl.textContent = 'Status: Idle';
  descEl.textContent = 'Edit this card using the buttons below.';
  card.classList.remove('is-dark');
});

// Counter card
const counterCard = document.querySelector('#counter-card');
const counterValueEl = document.querySelector('.counter-value');
const btnPlus = document.querySelector('#btn-plus');
const btnMinus = document.querySelector('#btn-minus');

let count = 0;

function updateCounter() {
  counterValueEl.textContent = count;
  if (count > 5) {
    counterCard.classList.add('is-high');
  } else {
    counterCard.classList.remove('is-high');
  }
}

btnPlus.addEventListener('click', function () {
  count = count + 1;
  updateCounter();
});

btnMinus.addEventListener('click', function () {
  count = count - 1;
  updateCounter();
});
