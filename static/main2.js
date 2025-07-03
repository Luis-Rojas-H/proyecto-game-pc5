import * as THREE from './libs/three.js-r132/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  const scene = new THREE.Scene();

  // Crear un plano con la imagen QR
  const textureLoader = new THREE.TextureLoader();
  const qrTexture = textureLoader.load('/static/assets/models/QR/QR_historia.jpg');
  const geometry = new THREE.PlaneGeometry(2, 2); // Tamaño del plano
  const material = new THREE.MeshBasicMaterial({ map: qrTexture });
  const plane = new THREE.Mesh(geometry, material);
  plane.position.set(0, 0, -5); // Colocar el plano frente a la cámara
  scene.add(plane);

  // Configurar la cámara
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Configurar el renderizador
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Renderizar la escena
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
});
