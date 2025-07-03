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

    // Imagen overlay principal
    const overlayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    overlayPlane.position.set(0, 1, 0); // encima del target
    overlayPlane.visible = false;

    // Fondo blanco del cuadro de texto
    const textBgPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.4),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    textBgPlane.position.set(0.7, 1, 0); // a la derecha del overlay
    textBgPlane.visible = false;

    // Texto "Hola cachimbo" (como textura en canvas)
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = "bold 40px Arial";
    ctx.fillText("Hola cachimbo", 20, 80);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.4),
      new THREE.MeshBasicMaterial({ map: textTexture, transparent: true })
    );
    textPlane.position.set(0.7, 1, 0.01); // sobre el fondo blanco
    textPlane.visible = false;

    // Anchor para target i
    const anchor = mindarThree.addAnchor(i);
    anchor.group.add(overlayPlane);
    anchor.group.add(textBgPlane);
    anchor.group.add(textPlane);

    // Mostrar/ocultar cuando se detecte
    anchor.onTargetFound = () => {
      overlayPlane.visible = true;
      textBgPlane.visible = true;
      textPlane.visible = true;
    };
    anchor.onTargetLost = () => {
      overlayPlane.visible = false;
      textBgPlane.visible = false;
      textPlane.visible = false;
    };
  }
   //¡Arrancar MindAR y el render loop! 
  await mindarThree.start();
  renderer.setAnimationLoop(() => renderer.render(scene, camera));

  });

