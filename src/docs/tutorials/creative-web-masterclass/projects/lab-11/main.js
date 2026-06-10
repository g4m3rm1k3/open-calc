const boxEl = document.querySelector('#moving-box');
const frameCountEl = document.querySelector('#frame-count');
const boxXEl = document.querySelector('#box-x');

const TRACK_WIDTH = window.innerWidth;
const BOX_SPEED_PER_SECOND = 200;

let boxX = 0;
let frameCount = 0;
let lastTimestamp = null;

function animate(timestamp) {
  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
  }
  const deltaTime = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  boxX = boxX + BOX_SPEED_PER_SECOND * deltaTime;
  boxX = (boxX + TRACK_WIDTH) % TRACK_WIDTH;
  frameCount = frameCount + 1;

  boxEl.style.left = boxX + 'px';
  frameCountEl.textContent = frameCount;
  boxXEl.textContent = Math.round(boxX);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
