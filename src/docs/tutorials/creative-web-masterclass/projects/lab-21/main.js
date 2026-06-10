import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 4, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.minDistance = 2;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI * 0.85;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;
controls.update();

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.2, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({ color: 0x6c63ff, roughness: 0.2, metalness: 0.6, emissive: 0x1a0044, emissiveIntensity: 0.3 })
);
scene.add(torusKnot);

for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshStandardMaterial({ color: new THREE.Color('hsl(' + (i * 45) + ', 70%, 60%)'), roughness: 0.4 })
  );
  sphere.position.set(Math.cos(angle) * 3.5, 0, Math.sin(angle) * 3.5);
  scene.add(sphere);
}

scene.add(new THREE.GridHelper(20, 20, 0x2a2a4a, 0x2a2a4a));

const toggleBtn = document.querySelector('#toggle-rotate');
toggleBtn.addEventListener('click', function () {
  controls.autoRotate = !controls.autoRotate;
  toggleBtn.textContent = controls.autoRotate ? 'Pause Rotation' : 'Resume Rotation';
});

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  torusKnot.rotation.x = t * 0.3;
  torusKnot.rotation.y = t * 0.5;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
