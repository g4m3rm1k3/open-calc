import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 12);
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
controls.update();

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

const spheres = [];
const COLS = 6;
const ROWS = 3;

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const hue = (col / COLS) * 240 + 180;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 24, 24),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('hsl(' + hue + ', 70%, 55%)'),
        roughness: 0.3,
        metalness: 0.2
      })
    );
    mesh.position.set((col - COLS / 2 + 0.5) * 2, (row - ROWS / 2 + 0.5) * 2, 0);
    mesh.userData.label = 'Sphere [' + col + ',' + row + ']';
    mesh.userData.originalColor = mesh.material.color.clone();
    scene.add(mesh);
    spheres.push(mesh);
  }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;
const HOVER_COLOR = new THREE.Color(0xffffff);

const hoverInfoEl = document.querySelector('#hover-info');
const clickInfoEl = document.querySelector('#click-info');
const tooltip = document.querySelector('#tooltip');

renderer.domElement.addEventListener('mousemove', function (event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  tooltip.style.left = (event.clientX + 12) + 'px';
  tooltip.style.top = (event.clientY - 28) + 'px';
});

renderer.domElement.addEventListener('click', function () {
  if (hoveredObject) {
    clickInfoEl.textContent = 'Selected: ' + hoveredObject.userData.label;
  }
});

function animate() {
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(spheres);

  if (hoveredObject) {
    hoveredObject.material.color.copy(hoveredObject.userData.originalColor);
    hoveredObject = null;
    hoverInfoEl.textContent = 'Hover over a sphere';
    renderer.domElement.style.cursor = 'default';
    tooltip.style.display = 'none';
  }

  if (hits.length > 0) {
    hoveredObject = hits[0].object;
    hoveredObject.material.color.copy(HOVER_COLOR);
    hoverInfoEl.textContent = 'Hovering: ' + hoveredObject.userData.label;
    renderer.domElement.style.cursor = 'pointer';
    tooltip.textContent = hoveredObject.userData.label;
    tooltip.style.display = 'block';
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
