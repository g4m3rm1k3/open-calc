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
  positions.push((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8 - 3);
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
const particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x6c63ff, size: 0.07, transparent: true, opacity: 0.7 }));
scene.add(particles);
const particles2 = new THREE.Points(geo.clone(), new THREE.PointsMaterial({ color: 0x4ecdc4, size: 0.04, transparent: true, opacity: 0.4 }));
scene.add(particles2);

const heroContent = document.querySelector('#hero-content');
window.addEventListener('scroll', function () {
  heroContent.style.opacity = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.5));
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

// ---- Canvas section particle widget ----
const canvasSection = document.querySelector('#canvas');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvasSection.appendChild(canvas);

const PARTICLE_COUNT  = 120;
const INFLUENCE_RADIUS = 110;
const PUSH_STRENGTH   = 3.5;
const canvasParticles = [];
const mouse = { x: -999, y: -999, onCanvas: false };

function sizeCanvas() {
  canvas.width  = canvasSection.clientWidth;
  canvas.height = canvasSection.clientHeight;
}
sizeCanvas();
window.addEventListener('resize', sizeCanvas);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const speedTier = Math.random();
  canvasParticles.push({
    x:      Math.random() * canvas.width,
    y:      Math.random() * canvas.height,
    vx:     (Math.random() - 0.5) * 0.5,
    vy:     -(speedTier * 1.5 + 0.2),
    baseVx: (Math.random() - 0.5) * 0.5,
    baseVy: -(speedTier * 1.5 + 0.2),
    radius: speedTier * 2 + 0.5,
    alpha:  speedTier * 0.5 + 0.15,
    hue:    Math.random() * 40 + 160
  });
}

canvasSection.addEventListener('mousemove', function (e) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.onCanvas = true;
});

canvasSection.addEventListener('mouseleave', function () {
  mouse.onCanvas = false;
});

function updateCanvasParticles() {
  canvasParticles.forEach(function (p) {
    if (mouse.onCanvas) {
      const dx   = p.x - mouse.x;
      const dy   = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < INFLUENCE_RADIUS && dist > 0) {
        const force = (1 - dist / INFLUENCE_RADIUS) * PUSH_STRENGTH;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }
    // Velocity bleeds back toward the base drift each frame
    p.vx = p.vx * 0.92 + p.baseVx * 0.08;
    p.vy = p.vy * 0.92 + p.baseVy * 0.08;
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0)             p.x = canvas.width;
    if (p.x > canvas.width)  p.x = 0;
    if (p.y < -p.radius)     p.y = canvas.height + p.radius;
    if (p.y > canvas.height) p.y = -p.radius;
  });
}

function drawCanvasParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvasParticles.forEach(function (p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + p.hue + ', 70%, 65%, ' + p.alpha + ')';
    ctx.fill();
  });
  if (mouse.onCanvas) {
    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, INFLUENCE_RADIUS);
    grad.addColorStop(0, 'rgba(78, 205, 196, 0.12)');
    grad.addColorStop(1, 'rgba(78, 205, 196, 0)');
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, INFLUENCE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

function animateParticles() {
  updateCanvasParticles();
  drawCanvasParticles();
  requestAnimationFrame(animateParticles);
}

animateParticles();
