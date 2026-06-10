import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 8);
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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

function makeMaterial(color, roughness, metalness) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), makeMaterial(0x6c63ff, 0.3, 0.1));
sphere.position.set(-4, 0, 0);
scene.add(sphere);

const torus = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.3, 16, 64), makeMaterial(0xff6b6b, 0.5, 0.0));
torus.position.set(-1.3, 0, 0);
scene.add(torus);

const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), makeMaterial(0x4ecdc4, 0.1, 0.8));
box.position.set(1.5, 0, 0);
scene.add(box);

const cone = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 32), makeMaterial(0xffe66d, 0.6, 0));
cone.position.set(3.5, 0, 0);
scene.add(cone);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), makeMaterial(0x161628, 0.9, 0.0));
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1.2;
scene.add(plane);

function animate() {
  sphere.rotation.y += 0.008;
  torus.rotation.x += 0.01;
  torus.rotation.z += 0.006;
  box.rotation.x += 0.006;
  box.rotation.y += 0.008;
  cone.rotation.y += 0.01;
  cone.position.y = Math.sin(Date.now() * 0.002) * 0.5;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
