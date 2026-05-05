import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.querySelector('#hero-canvas'),
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.z = 2.5;

const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

const geometry = new THREE.IcosahedronGeometry(1, 5);
const wireframe = new THREE.WireframeGeometry(geometry);
const material = new THREE.LineBasicMaterial({ 
    color: new THREE.Color(accentColor),
    linewidth: 1,
});
const model = new THREE.LineSegments(wireframe, material);
scene.add(model);

// Store original positions
const originalPositions = new Float32Array(model.geometry.attributes.position.array);

const mouse = new THREE.Vector2();
const targetMouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Smooth mouse position
  mouse.x += (targetMouse.x - mouse.x) * 0.05;
  mouse.y += (targetMouse.y - mouse.y) * 0.05;

  // Rotate model
  model.rotation.x = elapsedTime * 0.1;
  model.rotation.y = elapsedTime * 0.1;

  // Deform geometry based on mouse
  const positions = model.geometry.attributes.position.array;
  const mousePosition3D = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  mousePosition3D.unproject(camera);

  const sphere = new THREE.Vector3().setFromSphericalCoords(1, model.rotation.x, model.rotation.y);

  for (let i = 0; i < positions.length; i += 3) {
    const vertex = new THREE.Vector3(originalPositions[i], originalPositions[i+1], originalPositions[i+2]);
    const dist = vertex.distanceTo(mousePosition3D.sub(sphere).normalize());

    const displacement = Math.max(0, 1 - dist * 2) * 0.3;
    vertex.normalize().multiplyScalar(1 + displacement);

    positions[i] = vertex.x;
    positions[i+1] = vertex.y;
    positions[i+2] = vertex.z;
  }
  model.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();
