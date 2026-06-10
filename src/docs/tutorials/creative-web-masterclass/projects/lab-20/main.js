import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 4, 12);
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

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const clock = new THREE.Clock();
let lastT = 0;

const COLS = 10;
const ROWS = 4;
const SPACING = 1.4;
const spheres = [];

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const hue = (col / COLS) * 360;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('hsl(' + hue + ', 70%, 60%)'),
        roughness: 0.3,
        metalness: 0.2
      })
    );
    mesh.position.x = (col - COLS / 2 + 0.5) * SPACING;
    mesh.position.z = (row - ROWS / 2 + 0.5) * SPACING;
    mesh.userData.col = col;
    mesh.userData.row = row;
    scene.add(mesh);
    spheres.push(mesh);
  }
}

function animate() {
  const t = clock.getElapsedTime();
  const delta = t - lastT;
  lastT = t;

  spheres.forEach(function (mesh) {
    const colCenter = mesh.userData.col - COLS / 2 + 0.5;
    const rowCenter = mesh.userData.row - ROWS / 2 + 0.5;
    const dist = Math.sqrt(colCenter * colCenter + rowCenter * rowCenter);
    const phase = dist * 0.6;
    mesh.position.y = Math.sin(t * 2 - phase) * 0.6;
    mesh.rotation.y += 1.0 * delta;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
