import * as THREE from 'three';

// ---- Ribbon nav ----
const sections = document.querySelectorAll('.port-section');
const navLinks = document.querySelectorAll('.ribbon-link');
const progressFill = document.querySelector('#ribbon-progress');
let currentIndex = 0;

const linkMap = {};
navLinks.forEach(function (link) { linkMap[link.dataset.section] = link; });

function setActive(id) {
  navLinks.forEach(function (l) { l.classList.remove('is-active'); });
  if (linkMap[id]) linkMap[id].classList.add('is-active');
  sections.forEach(function (s, i) { if (s.id === id) currentIndex = i; });
}

window.addEventListener('scroll', function () {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progressFill.style.height = (maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0) + '%';
});

const sectionObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
}, { threshold: 0.3 });
sections.forEach(function (s) { sectionObserver.observe(s); });

document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowDown' && currentIndex < sections.length - 1) {
    sections[++currentIndex].scrollIntoView({ behavior: 'smooth' });
  } else if (event.key === 'ArrowUp' && currentIndex > 0) {
    sections[--currentIndex].scrollIntoView({ behavior: 'smooth' });
  }
});

// ---- Three.js hero background ----
const heroSection = document.querySelector('#hero');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, heroSection.clientWidth / heroSection.clientHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);
heroSection.appendChild(renderer.domElement);

function resizeHeroCanvas() {
  renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
  camera.aspect = heroSection.clientWidth / heroSection.clientHeight;
  camera.updateProjectionMatrix();
}
resizeHeroCanvas();
window.addEventListener('resize', resizeHeroCanvas);

const positions = [];
for (let i = 0; i < 200; i++) {
  positions.push(
    (Math.random() - 0.5) * 18,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 8 - 3
  );
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

const particles = new THREE.Points(
  geo,
  new THREE.PointsMaterial({ color: 0x6c63ff, size: 0.07, transparent: true, opacity: 0.7 })
);
scene.add(particles);

const particles2 = new THREE.Points(
  geo.clone(),
  new THREE.PointsMaterial({ color: 0x4ecdc4, size: 0.04, transparent: true, opacity: 0.4 })
);
scene.add(particles2);

const heroContent = document.querySelector('#hero-content');
window.addEventListener('scroll', function () {
  const fadeDistance = window.innerHeight * 0.5;
  heroContent.style.opacity = Math.max(0, 1 - window.scrollY / fadeDistance);
});

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  particles.rotation.y  =  t * 0.04;
  particles.rotation.x  =  t * 0.015;
  particles2.rotation.y = -t * 0.03;
  particles2.rotation.z =  t * 0.02;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ---- Scroll reveal for work cards ----
// Each [data-reveal] element starts at opacity 0 (set in CSS).
// When 12% of the element enters the viewport, we add .is-visible,
// which triggers the CSS transition to opacity 1 and translateY 0.
const revealElements = document.querySelectorAll('[data-reveal]');

const revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(function (el) { revealObserver.observe(el); });
