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

// alpha: true lets the CSS background show through
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);
// Append to the section, not document.body — so position: absolute scopes it here
heroSection.appendChild(renderer.domElement);

function resizeHeroCanvas() {
  renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
  camera.aspect = heroSection.clientWidth / heroSection.clientHeight;
  camera.updateProjectionMatrix();
}
resizeHeroCanvas();
window.addEventListener('resize', resizeHeroCanvas);

// Build a flat array of [x, y, z, x, y, z, ...] for 200 particles
const positions = [];
for (let i = 0; i < 200; i++) {
  positions.push(
    (Math.random() - 0.5) * 18,   // x spread across wide field
    (Math.random() - 0.5) * 10,   // y spread
    (Math.random() - 0.5) * 8 - 3 // z pushed back behind camera
  );
}

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

// Purple particle layer
const particles = new THREE.Points(
  geo,
  new THREE.PointsMaterial({ color: 0x6c63ff, size: 0.07, transparent: true, opacity: 0.7 })
);
scene.add(particles);

// Teal particle layer — reuse same geometry positions but different material
const particles2 = new THREE.Points(
  geo.clone(),
  new THREE.PointsMaterial({ color: 0x4ecdc4, size: 0.04, transparent: true, opacity: 0.4 })
);
scene.add(particles2);

// Hero text fades as the user scrolls away from the hero section
const heroContent = document.querySelector('#hero-content');
window.addEventListener('scroll', function () {
  // Fade starts at scrollY=0 and reaches 0 at half the viewport height
  const fadeDistance = window.innerHeight * 0.5;
  heroContent.style.opacity = Math.max(0, 1 - window.scrollY / fadeDistance);
});

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  // Each layer rotates at a different rate and axis for organic motion
  particles.rotation.y = t * 0.04;
  particles.rotation.x = t * 0.015;
  particles2.rotation.y = -t * 0.03;
  particles2.rotation.z = t * 0.02;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
