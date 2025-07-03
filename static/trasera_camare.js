import { mockWithVideo } from './libs/camera-mock.js'; 
  const THREE = window.MINDAR.IMAGE.THREE;

  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Iniciar MindAR con tu archivo .mind unificado
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: '/static/assets/targets/cultura/targets_all.mind',
    });
    const { renderer, scene, camera } = mindarThree;

    // 2. Agregar luz
    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

    // 3. Cargar las imágenes overlay
    const overlayPaths = Array.from({ length: 14 }, (_, i) =>
      `/static/assets/models/test/${i + 1}.png`);
    const loader = new THREE.TextureLoader();

    for (let i = 0; i < overlayPaths.length; i++) {
      const texture = await loader.loadAsync(overlayPaths[i]);

      // Crear un plano con la imagen como textura
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const plane = new THREE.Mesh(geometry, material);

      // Posicionar el plano encima del target
      plane.position.set(0, 1, 0); // 1 metro sobre el marcador
      plane.visible = false;

      // Anclar al target i
      const anchor = mindarThree.addAnchor(i);
      anchor.group.add(plane);

      // Mostrar solo cuando se detecte
      anchor.onTargetFound = () => plane.visible = true;
      anchor.onTargetLost = () => plane.visible = false;
    }

    // 4. Arrancar la experiencia
    await mindarThree.start();
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
  });

