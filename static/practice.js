import { mockWithVideo } from "./libs/camera-mock.js";
const THREE = window.MINDAR.IMAGE.THREE;

const PREGUNTAS = [
  {
    pregunta: "¿Qué es la cultura?",
    opciones: [
      "Conjunto de conocimientos, creencias y costumbres",
      "Estilo de vida de un grupo social",
      "Manifestaciones artísticas y literarias",
      "Todas las anteriores",
    ],
    descripcion:
      "La cultura es un conjunto de conocimientos, creencias, costumbres y manifestaciones artísticas y literarias que caracterizan a un grupo social.La cultura es un conjunto de conocimientos, creencias, costumbres y manifestaciones artísticas y literarias que caracterizan a un grupo social.La cultura es un conjunto de conocimientos, creencias, costumbres y manifestaciones artísticas y literarias que caracterizan a un grupo social.La cultura es un conjunto de conocimientos, creencias, costumbres y manifestaciones artísticas y literarias que caracterizan a un grupo social.La cultura es un conjunto de conocimientos, creencias, costumbres y manifestaciones artísticas y literarias que caracterizan a un grupo social.La cultura es un conjunto de conocimientos, creencias, costumbres y manifestaciones artísticas y literarias que caracterizan a un grupo social.",
  },
  {
    pregunta: "¿Cuál es la importancia de la cultura?",
    opciones: [
      "Fomenta la identidad y cohesión social",
      "Promueve el desarrollo económico",
      "Enriquece la vida artística y espiritual",
      "Todas las anteriores",
    ],
    descripcion:
      "La cultura es fundamental para el desarrollo de la identidad y cohesión social, así como para el enriquecimiento de la vida artística y espiritual.",
  },
];

const PISTAS = [
  "Dirigete a la facultad de Ciencias Sociales, donde encontrarás información sobre la cultura. Puedes enconntrarla en la estatua.",
  "Busca en la biblioteca de la facultad de Ciencias Sociales, allí encontrarás libros y recursos sobre la cultura.",
];

document.addEventListener("DOMContentLoaded", async () => {
  let objectDetectedInitially = false;
  /*
  Etiquetas para manejar las preguntas y opciones
*/
  let indexPregunta = 0;
  const clues = document.getElementById("clues");
  const cluesParagraph = clues.querySelector("p");
  const questionContainer = document.getElementById("question-container");
  const questionText = questionContainer.querySelector("p");
  const optionsDiv = document.getElementById("options");
  const nextQuestionButton = document.getElementById("next-question");
  const question = document.getElementById("question");

  cluesParagraph.textContent = PISTAS[indexPregunta];
  questionText.textContent = PREGUNTAS[indexPregunta].pregunta;

  nextQuestionButton.addEventListener("click", () => {
    indexPregunta++;
    if (indexPregunta < PREGUNTAS.length) {
      updateAllTexts(); // Actualizar el texto en todos los anchors
      cluesParagraph.textContent = PISTAS[indexPregunta]; // Actualizar la pista
      questionText.textContent = PREGUNTAS[indexPregunta].pregunta; // Actualizar la pregunta
    }
    objectDetectedInitially = false;
    optionsDiv.style.display = "none";
    questionContainer.style.display = "none";
    clues.style.display = "flex";
  });

  question.addEventListener("click", () => {
    questionContainer.style.display = "flex";
    // Ocultar todos los targets cuando se hace click en question
    anchors.forEach((anchorData) => {
      anchorData.overlayPlane.visible = false;
      anchorData.textBgPlane.visible = false;
      anchorData.textPlane.visible = false;
    });
  });

  // 1. Iniciar MindAR con tu archivo .mind unificado
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.getElementById("ar-container"),
    imageTargetSrc: "/static/assets/targets/cultura/targets_all.mind",
    preferredVideoFacingMode: "environment",
  });
  const { renderer, scene, camera } = mindarThree;

  // 2. Agregar luz
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

  // 3. Cargar las imágenes overlay
  const overlayPaths = Array.from(
    { length: 14 },
    (_, i) => `/static/assets/models/test/${i + 1}.png`
  );
  const loader = new THREE.TextureLoader();
  const anchors = []; // Array para almacenar los anchors y poder actualizar el texto

  // Función para dibujar rectángulo con bordes redondeados
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Función para actualizar el texto de todos los anchors
  function updateAllTexts() {
    anchors.forEach((anchorData) => {
      updateTextForAnchor(anchorData);
    });
  }

  // Función para actualizar el texto de un anchor específico
  function updateTextForAnchor(anchorData) {
    if (indexPregunta >= PREGUNTAS.length) return;

    const { textCanvas, textCtx, textTexture } = anchorData;

    // Limpiar el canvas
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    textCtx.fillStyle = "#330867";
    textCtx.font = "bold 20px Arial";
    textCtx.textAlign = "center";

    // Función para dividir el texto en líneas que quepan en el canvas
    function wrapText(text, maxWidth) {
      const words = text.split(" ");
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = textCtx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    }

    // Dividir el texto en líneas y dibujar centrado
    const lines = wrapText(
      PREGUNTAS[indexPregunta].descripcion,
      textCanvas.width - 60
    );
    const lineHeight = 25;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (textCanvas.height - totalTextHeight) / 2 + 15; // Centrado verticalmente

    lines.forEach((line, index) => {
      textCtx.fillText(line, textCanvas.width / 2, startY + index * lineHeight); // Centrado horizontalmente
    });

    // Actualizar la textura
    textTexture.needsUpdate = true;
  }

  for (let i = 0; i < overlayPaths.length; i++) {
    const texture = await loader.loadAsync(overlayPaths[i]);

    // Imagen overlay principal
    const overlayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    overlayPlane.position.set(0, 1.5, 0.02); // más arriba y al frente
    overlayPlane.visible = false;

    // Fondo blanco del cuadro de texto con bordes redondeados
    const textBgCanvas = document.createElement("canvas");
    textBgCanvas.width = 600;
    textBgCanvas.height = 600;
    const bgCtx = textBgCanvas.getContext("2d");

    // Dibujar fondo blanco semi-transparente con bordes redondeados
    bgCtx.fillStyle = "rgba(255, 255, 255, 0.8)";
    drawRoundedRect(bgCtx, 0, 0, textBgCanvas.width, textBgCanvas.height, 20);
    bgCtx.fill();

    // Agregar un borde gris sutil
    bgCtx.strokeStyle = "#ddd";
    bgCtx.lineWidth = 2;
    drawRoundedRect(
      bgCtx,
      1,
      1,
      textBgCanvas.width - 2,
      textBgCanvas.height - 2,
      20
    );
    bgCtx.stroke();

    const textBgTexture = new THREE.CanvasTexture(textBgCanvas);
    const textBgPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 2.5),
      new THREE.MeshBasicMaterial({ map: textBgTexture, transparent: true })
    );
    textBgPlane.position.set(0, -0.5, 0); // más abajo que la imagen
    textBgPlane.visible = false;

    // Texto de descripción (como textura en canvas)
    const textCanvas = document.createElement("canvas");
    textCanvas.width = 600;
    textCanvas.height = 600;
    const textCtx = textCanvas.getContext("2d");

    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 2.5),
      new THREE.MeshBasicMaterial({ map: textTexture, transparent: true })
    );
    textPlane.position.set(0, -0.5, 0.01); // mismo nivel que el fondo pero un poco al frente
    textPlane.visible = false;

    // Guardar datos del anchor para poder actualizar el texto
    const anchorData = {
      textCanvas,
      textCtx,
      textTexture,
      textPlane,
      textBgPlane,
      overlayPlane,
    };
    anchors.push(anchorData);

    // Actualizar el texto inicial
    updateTextForAnchor(anchorData);

    // Anchor para target i
    const anchor = mindarThree.addAnchor(i);
    anchor.group.add(anchorData.overlayPlane);
    anchor.group.add(anchorData.textBgPlane);
    anchor.group.add(anchorData.textPlane);

    // Mostrar/ocultar cuando se detecte
    anchor.onTargetFound = () => {
      anchorData.overlayPlane.visible = true;
      anchorData.textBgPlane.visible = true;
      anchorData.textPlane.visible = true;
      // Si aún no se ha detectado ningún objeto, actualiza la variable
      if (!objectDetectedInitially) {
        objectDetectedInitially = true;
        // Mostrar el div options
        if (optionsDiv) {
          optionsDiv.style.display = "flex";
          clues.style.display = "none";
          questionContainer.style.display = "none";
        }
      }
    };
    anchor.onTargetLost = () => {
      anchorData.overlayPlane.visible = false;
      anchorData.textBgPlane.visible = false;
      anchorData.textPlane.visible = false;
      if (objectDetectedInitially) {
        objectDetectedInitially = false;
      }
    };
  }
  //¡Arrancar MindAR y el render loop!
  await mindarThree.start();
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
});
