import { mockWithVideo } from "./libs/camera-mock.js";
import { getGeminiResponse } from "./gemini-api.js";

const THREE = window.MINDAR.IMAGE.THREE;

// Obtener el parámetro 'tipo' de la URL
function getTipoFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("tipo");
}

// Variables globales para las preguntas
let PREGUNTAS = [];
let PISTAS = [
  "Dirigete a la facultad de Ciencias Sociales, donde encontrarás información sobre la cultura. Puedes enconntrarla en la estatua.",
  "Busca en la biblioteca de la facultad de Ciencias Sociales, allí encontrarás libros y recursos sobre la cultura.",
  "En la facultad de Ciencias Sociales, dirígete al área de exposiciones culturales, donde encontrarás información sobre las culturas del Perú.",
  "En la facultad de Ciencias Sociales, busca el mural que representa las culturas del Peru, allí encontrarás información sobre las culturas del Perú.",
  "En la facultad de Ciencias Sociales, dirígete al área de exposiciones culturales, donde encontrarás información sobre las culturas del Perú.",
];

document.addEventListener("DOMContentLoaded", async () => {
  // Obtener preguntas de Gemini
  const tipo = getTipoFromURL();
  const tipoFolder = tipo? tipo.toLowerCase() : "cultura"; 
  let geminiMessage = await getGeminiResponse(tipo);
  
  if (geminiMessage) {
  geminiMessage = geminiMessage
    .replace(/^```json[\r\n]*/i, "")
    .replace(/^```[\r\n]*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const preguntasGemini = JSON.parse(geminiMessage);

    PREGUNTAS = preguntasGemini.map(pregunta => ({
      pregunta: pregunta.Pregunta,
      opciones: pregunta.Alternativas,
      descripcion: pregunta.Descripcion,
      correcta: pregunta.Alternativa_correcta
    }));


    console.log("Preguntas cargadas desde Gemini:", PREGUNTAS);

  } catch (e) {
    console.error("Error al parsear JSON de Gemini:", geminiMessage, e);
    return; // MODIFICADO: No continuar si falla el parseo
  }
} else {
  console.warn("No se pudo obtener respuesta de Gemini");
  return; // MODIFICADO: No continuar si no hay preguntas
}

  let objectDetectedInitially = false;
  let indexPregunta = 0;
  
  const clues = document.getElementById("clues");
  const cluesParagraph = clues.querySelector("p");
  const questionContainer = document.getElementById("question-container");
  const questionText = questionContainer.querySelector("p");
  const optionsDiv = document.getElementById("options");
  const nextQuestionButton = document.getElementById("next-question");
  const question = document.getElementById("question");

  // Inicializar con la primera pregunta
  if (PREGUNTAS.length > 0) {
    cluesParagraph.textContent = PISTAS[indexPregunta];
    questionText.textContent = PREGUNTAS[indexPregunta].pregunta;
  }

  nextQuestionButton.addEventListener("click", () => {
    indexPregunta++;
    if (indexPregunta < PREGUNTAS.length) {
      updateAllTexts();
      cluesParagraph.textContent = PISTAS[indexPregunta];
      questionText.textContent = PREGUNTAS[indexPregunta].pregunta;
    } else {
      // Si no hay más preguntas, reiniciar o mostrar mensaje
      indexPregunta = 0;
      updateAllTexts();
      cluesParagraph.textContent = "¡Has completado todas las preguntas! Reiniciando...";
      questionText.textContent = PREGUNTAS[indexPregunta].pregunta;
    }
    objectDetectedInitially = false;
    optionsDiv.style.display = "none";
    questionContainer.style.display = "none";
    clues.style.display = "flex";
  });

  question.addEventListener("click", () => {
    questionContainer.style.display = "flex";
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
    (_, i) => `/static/assets/models/${tipoFolder}/${i + 1}.png`
  );
  const loader = new THREE.TextureLoader();
  const anchors = [];

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
    const startY = (textCanvas.height - totalTextHeight) / 2 + 15;

    lines.forEach((line, index) => {
      textCtx.fillText(line, textCanvas.width / 2, startY + index * lineHeight);
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
    overlayPlane.position.set(0, 1.5, 0.02);
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
    textBgPlane.position.set(0, -0.5, 0);
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
    textPlane.position.set(0, -0.5, 0.01);
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
      
      if (!objectDetectedInitially) {
        objectDetectedInitially = true;
        if (optionsDiv) {
          optionsDiv.style.display = "flex";
          clues.style.display = "none";
        }
      }
    };
    
    anchor.onTargetLost = () => {
      anchorData.overlayPlane.visible = false;
      anchorData.textBgPlane.visible = false;
      anchorData.textPlane.visible = false;
    };
  }
  
  // Arrancar MindAR y el render loop!
  await mindarThree.start();
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
});