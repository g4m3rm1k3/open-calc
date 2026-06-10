import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const PARTICLE_COUNT = 150;
const positions = [];
for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions.push(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 8 - 2
  );
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

const particleSystem = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({ color: 0x6c63ff, size: 0.06, transparent: true, opacity: 0.6 })
);
scene.add(particleSystem);

window.addEventListener('scroll', function () {
  camera.position.y = -window.scrollY * 0.003;
});

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  particleSystem.rotation.y = t * 0.05;
  particleSystem.rotation.x = t * 0.02;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
