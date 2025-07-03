import { mockWithVideo } from "./libs/camera-mock.js";
const THREE = window.MINDAR.FACE.THREE;

document.addEventListener("DOMContentLoaded", () => {
  const start = async () => {
    // Inicializar MindAR para detección facial
    const mindarThree = new window.MINDAR.FACE.MindARThree({
      container: document.body,
    });
    const { renderer, scene, camera } = mindarThree;

    // Luz para la escena
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.6);
    light2.position.set(-0.5, 1, 1);
    scene.add(light);
    scene.add(light2);

    // Variables para los textos
    const loader = new THREE.FontLoader();
    let bienvenidoMesh = null;
    let direccionMesh = null;
    let font = null;

    // Variables para tracking de movimiento
    let initialPosition = null; // Almacena la posición inicial de la cabeza
    let directionTextDisplayed = ""; // Almacena la última dirección mostrada
    let directionDisplayTimer = null; // Timer para auto-remover el texto de dirección
    let isBienvenidoVisible = true; // Controla la visibilidad del texto "Bienvenido"

    // Función para crear texto de dirección
    const createDirectionText = (text) => {
      if (!font) return;

      // Remover texto anterior si existe
      if (direccionMesh && anchor.group) {
        anchor.group.remove(direccionMesh);
        direccionMesh = null; // Importante para evitar referencias a meshes eliminados
      }

      const textGeometry = new THREE.TextGeometry(text, {
        font: font,
        size: 0.3,
        height: 0.01,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.002,
        bevelSize: 0.001,
        bevelOffset: 0,
        bevelSegments: 5,
      });

      // Centrar el texto
      textGeometry.computeBoundingBox();
      const textWidth =
        textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
      textGeometry.translate(-textWidth / 2, 0, 0);

      // Material para texto de dirección
      const textMaterial = new THREE.MeshPhongMaterial({
        color: 0xff4400, // Color naranja
        shininess: 100,
        specular: 0x660000,
        transparent: true,
        opacity: 0.9,
      });

      direccionMesh = new THREE.Mesh(textGeometry, textMaterial);
      direccionMesh.position.set(0, -0.1, 0); // Debajo del texto "Bienvenido"

      if (anchor.group) {
        anchor.group.add(direccionMesh);
      }

      // Auto-remover después de 2 segundos
      if (directionDisplayTimer) {
        clearTimeout(directionDisplayTimer);
      }
      directionDisplayTimer = setTimeout(() => {
        if (direccionMesh && anchor.group) {
          anchor.group.remove(direccionMesh);
          direccionMesh = null;
          directionTextDisplayed = ""; // Resetear la dirección mostrada
          // Opcional: Si quieres que el "Bienvenido" reaparezca después de un tiempo de inactividad
          // Si lo haces, necesitarías un timer para esto y una forma de cancelarlo
          // si se detecta movimiento de nuevo. Por ahora, solo se muestra al inicio.
        }
      }, 2000);
    };

    // Función para ocultar el texto de dirección (si está visible)
    const hideDirectionText = () => {
      if (direccionMesh && anchor.group) {
        anchor.group.remove(direccionMesh);
        direccionMesh = null;
        directionTextDisplayed = "";
        if (directionDisplayTimer) {
          clearTimeout(directionDisplayTimer);
          directionDisplayTimer = null;
        }
      }
    };

    // Cargar fuente y crear el texto "Bienvenido"
    loader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (loadedFont) => {
        font = loadedFont;

        const textGeometry = new THREE.TextGeometry("Bienvenido", {
          font: font,
          size: 0.5, // Texto más grande
          height: 0.015, // Mayor profundidad para efecto 3D
          curveSegments: 12,
          bevelEnabled: true, // Habilitar bisel para efecto 3D
          bevelThickness: 0.003, // Grosor del bisel
          bevelSize: 0.002, // Tamaño del bisel
          bevelOffset: 0,
          bevelSegments: 5, // Suavidad del bisel
        });

        // Centrar el texto
        textGeometry.computeBoundingBox();
        const textWidth =
          textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        textGeometry.translate(-textWidth / 2, 0, 0);

        // Material con degradado y efectos 3D mejorados
        const textMaterial = new THREE.MeshPhongMaterial({
          color: 0x00ff44, // Verde más brillante
          shininess: 150,
          specular: 0x006600, // Color especular para mejor reflejo
          transparent: true,
          opacity: 0.95,
        });
        bienvenidoMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Posicionar el texto encima de la cabeza
        bienvenidoMesh.position.set(0, 0.15, 0);
      }
    );

    // Anclar el texto a la cara detectada (punto central de la frente)
    const anchor = mindarThree.addAnchor(10); // Punto 10 es la frente/centro de la cara

    // Función para actualizar la posición del texto y detectar movimiento
    const updateText = () => {
      // Agregar "Bienvenido" si aún no está en la escena y es su estado inicial
      if (
        bienvenidoMesh &&
        anchor.group &&
        isBienvenidoVisible &&
        !anchor.group.children.includes(bienvenidoMesh)
      ) {
        anchor.group.add(bienvenidoMesh);
      }

      // Detectar movimiento de la cabeza
      if (anchor.group && anchor.group.visible) {
        const currentPosition = anchor.group.position;

        // Si es la primera vez que se detecta la cara, establecer la posición inicial
        if (!initialPosition) {
          initialPosition = {
            x: currentPosition.x,
            y: currentPosition.y,
            z: currentPosition.z,
          };
          return; // No procesar movimiento en el primer frame
        }

        // Umbral de movimiento horizontal (X-axis) para detectar un movimiento "exagerado"
        const movementThreshold = 0.05; // Ajusta este valor según sea necesario (e.g., 0.05, 0.1, 0.15)
        // Umbral para la "zona central" o "neutral"
        const neutralZoneThreshold = 0.02; // Debe ser menor que movementThreshold

        const deltaX = currentPosition.x - initialPosition.x;

        let newDirection = "";

        if (deltaX > movementThreshold) {
          newDirection = "Derecha";
          // Si el texto "Bienvenido" está visible, ocúltalo
          if (
            bienvenidoMesh &&
            anchor.group.children.includes(bienvenidoMesh)
          ) {
            anchor.group.remove(bienvenidoMesh);
            isBienvenidoVisible = false;
          }
        } else if (deltaX < -movementThreshold) {
          newDirection = "Izquierda";
          // Si el texto "Bienvenido" está visible, ocúltalo
          if (
            bienvenidoMesh &&
            anchor.group.children.includes(bienvenidoMesh)
          ) {
            anchor.group.remove(bienvenidoMesh);
            isBienvenidoVisible = false;
          }
        } else if (Math.abs(deltaX) < neutralZoneThreshold) {
          // Si la cabeza está en la zona neutral
          newDirection = ""; // No hay dirección específica
          hideDirectionText(); // Asegúrate de que el texto de dirección esté oculto
        }

        // Solo crear texto si hay una nueva dirección y no es la que ya se está mostrando
        // También verifica que no esté vacío (lo que significa zona neutral)
        if (newDirection && newDirection !== directionTextDisplayed) {
          createDirectionText(newDirection);
          directionTextDisplayed = newDirection; // Actualizar la dirección mostrada
          // No resetear initialPosition aquí para que el "neutral" se mida desde el punto de inicio.
          // Si quieres que el "neutral" se recalibre después de cada movimiento, podrías mover
          // initialPosition = { ...currentPosition }; aquí, pero entonces el usuario
          // tendría que volver al centro "absoluto" para recalibrar.
        } else if (!newDirection && directionTextDisplayed) {
          // Si el movimiento actual no es "exagerado" y previamente se mostró una dirección,
          // ocúltala (esto se maneja con hideDirectionText en la zona neutral)
        }
      }
    };

    // Iniciar MindAR
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      updateText(); // Actualizar posición del texto en cada frame
      renderer.render(scene, camera);
    });
  };
  start();
});
