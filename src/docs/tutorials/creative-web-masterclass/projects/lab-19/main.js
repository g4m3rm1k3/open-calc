import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080810);
scene.fog = new THREE.Fog(0x080810, 15, 40);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 10);
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

const ambientLight = new THREE.AmbientLight(0x111133, 1.0);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff4488, 4.0, 25);
scene.add(pointLight);

const lightSphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xff4488 })
);
scene.add(lightSphere);

const pointLight2 = new THREE.PointLight(0x4488ff, 3.0, 20);
scene.add(pointLight2);

const lightSphere2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0x4488ff })
);
scene.add(lightSphere2);

function makeMat(color, roughness, metalness, emissive) {
  return new THREE.MeshStandardMaterial({
    color, roughness, metalness,
    emissive: emissive || 0x000000,
    emissiveIntensity: emissive ? 0.3 : 0
  });
}

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), makeMat(0x6c63ff, 0.2, 0.1, 0x220088));
sphere.position.set(-3, 0, 0);
scene.add(sphere);

const box = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), makeMat(0x4ecdc4, 0.1, 0.9));
box.position.set(0, 0, 0);
scene.add(box);

const torus = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.32, 20, 80), makeMat(0xff6b6b, 0.4, 0.0));
torus.position.set(3, 0, 0);
scene.add(torus);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), makeMat(0x0d0d1a, 1.0, 0));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.2;
scene.add(floor);

let lightAngle = 0;

function animate() {
  lightAngle += 0.012;

  pointLight.position.x = Math.cos(lightAngle) * 5;
  pointLight.position.z = Math.sin(lightAngle) * 5;
  pointLight.position.y = Math.sin(lightAngle * 0.7) * 2 + 2;
  lightSphere.position.copy(pointLight.position);

  pointLight2.position.x = Math.cos(-lightAngle) * 4;
  pointLight2.position.z = Math.sin(-lightAngle) * 4;
  pointLight2.position.y = 1;
  lightSphere2.position.copy(pointLight2.position);

  sphere.rotation.y += 0.008;
  box.rotation.x += 0.006;
  box.rotation.y += 0.008;
  torus.rotation.x += 0.01;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
