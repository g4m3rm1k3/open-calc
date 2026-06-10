const slowLayer = document.querySelector('#layer-slow');
const fastLayer = document.querySelector('#layer-fast');
const heroContent = document.querySelector('.hero-content');

let targetScrollY = 0;
let smoothScrollY = 0;
const LERP_FACTOR = 0.08;
const FADE_DISTANCE = window.innerHeight * 0.5;

function updateParallax() {
  smoothScrollY = smoothScrollY + (targetScrollY - smoothScrollY) * LERP_FACTOR;

  const slowY = -(smoothScrollY * 0.3);
  const fastY = -(smoothScrollY * 0.6);

  slowLayer.style.transform = 'translateY(' + slowY + 'px)';
  fastLayer.style.transform = 'translateY(' + fastY + 'px)';

  const opacity = Math.max(0, 1 - smoothScrollY / FADE_DISTANCE);
  heroContent.style.opacity = opacity;

  requestAnimationFrame(updateParallax);
}

window.addEventListener('scroll', function () {
  targetScrollY = window.scrollY;
});

requestAnimationFrame(updateParallax);
