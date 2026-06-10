import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x6c63ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b6b });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

let angle = 0;

function animate() {
  cube.rotation.x += 0.005;
  cube.rotation.y += 0.01;

  angle += 0.02;
  sphere.position.x = Math.cos(angle) * 2;
  sphere.position.z = Math.sin(angle) * 2;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
