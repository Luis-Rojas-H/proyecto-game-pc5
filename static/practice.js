import { mockWithVideo } from "./libs/camera-mock.js";
import { getGeminiResponse } from "./gemini-api.js";

const THREE = window.MINDAR.IMAGE.THREE;

function getTipoFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("tipo");
}

let PREGUNTAS = [];
let PISTAS = [
  "Dirigete a la facultad de Ciencias Sociales, donde encontrarás información sobre la cultura. Puedes enconntrarla en la estatua.",
  "Busca en la biblioteca de la facultad de Ciencias Sociales, allí encontrarás libros y recursos sobre la cultura.",
  "En la facultad de Ciencias Sociales, dirígete al área de exposiciones culturales, donde encontrarás información sobre las culturas del Perú.",
  "En la facultad de Ciencias Sociales, busca el mural que representa las culturas del Peru, allí encontrarás información sobre las culturas del Perú.",
  "En la facultad de Ciencias Sociales, dirígete al área de exposiciones culturales, donde encontrarás información sobre las culturas del Perú.",
];

document.addEventListener("DOMContentLoaded", async () => {
  const tipo = getTipoFromURL();
  let geminiMessage = await getGeminiResponse(tipo);

  if (geminiMessage) {
    geminiMessage = geminiMessage
      .replace(/^```json[\r\n]*/i, "")
      .replace(/^```[\r\n]*/i, "")
      .replace(/```$/i, "")
      .trim();

    try {
      const preguntasGemini = JSON.parse(geminiMessage);
      PREGUNTAS = preguntasGemini.map((pregunta) => ({
        pregunta: pregunta.Pregunta,
        opciones: pregunta.Alternativas,
        descripcion: pregunta.Descripcion,
        correcta: pregunta.Alternativa_correcta,
      }));
      console.log("Preguntas cargadas desde Gemini:", PREGUNTAS);
    } catch (e) {
      console.error("Error al parsear JSON de Gemini:", geminiMessage, e);
      return;
    }
  } else {
    console.warn("No se pudo obtener respuesta de Gemini");
    return;
  }

  let objectDetectedInitially = false;
  let indexPregunta = 0;

  const clues = document.getElementById("clues");
  const cluesParagraph = clues.querySelector("p");
  const questionContainer = document.getElementById("question-container");
  const questionText = document.getElementById("question-text");
  const alternativesList = document.getElementById("alternatives-list");
  const optionsDiv = document.getElementById("options");
  const nextQuestionButton = document.getElementById("next-question");
  const question = document.getElementById("question");

  if (PREGUNTAS.length > 0) {
    cluesParagraph.textContent = PISTAS[indexPregunta];
    questionContainer.style.display = "none"; // asegúrate que no esté visible
  }

  function mostrarPreguntaYAlternativas() {
  const preguntaActual = PREGUNTAS[indexPregunta];
  questionText.textContent = preguntaActual.pregunta;
  alternativesList.innerHTML = "";

  const feedbackMessage = document.getElementById("feedback-message");
  feedbackMessage.textContent = "";
  feedbackMessage.style.display = "none";

  preguntaActual.opciones.forEach((opcion, i) => {
    const li = document.createElement("li");
    li.textContent = opcion;
    li.style.cursor = "pointer";
    li.style.padding = "5px";
    li.style.border = "1px solid #ccc";
    li.style.marginBottom = "5px";
    li.style.borderRadius = "8px";
    li.style.backgroundColor = "#f0f0f0";

    li.addEventListener("click", () => {
      const letraSeleccionada = String.fromCharCode(65 + i);

      if (letraSeleccionada === preguntaActual.correcta) {
        li.style.backgroundColor = "#c8e6c9"; // Verde claro
        feedbackMessage.textContent = "¡Respuesta correcta!";
        feedbackMessage.style.color = "green";
      } else {
        li.style.backgroundColor = "#ffcdd2"; // Rojo claro
        feedbackMessage.textContent = "Respuesta incorrecta. Intenta de nuevo.";
        feedbackMessage.style.color = "red";
      }

      feedbackMessage.style.display = "block";
    });

    alternativesList.appendChild(li);
  });
}


  function updateAllTexts() {
    anchors.forEach((anchorData) => {
      updateTextForAnchor(anchorData);
    });
  }

  nextQuestionButton.addEventListener("click", () => {
    indexPregunta++;
    if (indexPregunta < PREGUNTAS.length) {
      updateAllTexts();
      cluesParagraph.textContent = PISTAS[indexPregunta];
      questionText.textContent = PREGUNTAS[indexPregunta].pregunta;
    } else {
      indexPregunta = 0;
      updateAllTexts();
      cluesParagraph.textContent =
        "¡Has completado todas las preguntas! Reiniciando...";
      questionText.textContent = PREGUNTAS[indexPregunta].pregunta;
    }
    objectDetectedInitially = false;
    optionsDiv.style.display = "none";
    questionContainer.style.display = "none";
    clues.style.display = "flex";
  });

  question.addEventListener("click", () => {
    mostrarPreguntaYAlternativas();
    questionContainer.style.display = "flex";
  });

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.getElementById("ar-container"),
    imageTargetSrc: "/static/assets/targets/cultura/targets_all.mind",
    preferredVideoFacingMode: "environment",
  });
  const { renderer, scene, camera } = mindarThree;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

  const overlayPaths = Array.from(
    { length: 14 },
    (_, i) => `/static/assets/models/test/${i + 1}.png`
  );
  const loader = new THREE.TextureLoader();
  const anchors = [];

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

  function updateTextForAnchor(anchorData) {
    if (indexPregunta >= PREGUNTAS.length) return;

    const { textCanvas, textCtx, textTexture } = anchorData;

    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    textCtx.fillStyle = "#330867";
    textCtx.font = "bold 20px Arial";
    textCtx.textAlign = "center";

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

    textTexture.needsUpdate = true;
  }

  for (let i = 0; i < overlayPaths.length; i++) {
    const texture = await loader.loadAsync(overlayPaths[i]);

    const overlayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    overlayPlane.position.set(0, 1.5, 0.02);
    overlayPlane.visible = false;

    const textBgCanvas = document.createElement("canvas");
    textBgCanvas.width = 600;
    textBgCanvas.height = 600;
    const bgCtx = textBgCanvas.getContext("2d");

    bgCtx.fillStyle = "rgba(255, 255, 255, 0.8)";
    drawRoundedRect(bgCtx, 0, 0, textBgCanvas.width, textBgCanvas.height, 20);
    bgCtx.fill();

    bgCtx.strokeStyle = "#ddd";
    bgCtx.lineWidth = 2;
    drawRoundedRect(bgCtx, 1, 1, textBgCanvas.width - 2, textBgCanvas.height - 2, 20);
    bgCtx.stroke();

    const textBgTexture = new THREE.CanvasTexture(textBgCanvas);
    const textBgPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 2.5),
      new THREE.MeshBasicMaterial({ map: textBgTexture, transparent: true })
    );
    textBgPlane.position.set(0, -0.5, 0);
    textBgPlane.visible = false;

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

    const anchorData = {
      textCanvas,
      textCtx,
      textTexture,
      textPlane,
      textBgPlane,
      overlayPlane,
    };
    anchors.push(anchorData);

    updateTextForAnchor(anchorData);

    const anchor = mindarThree.addAnchor(i);
    anchor.group.add(anchorData.overlayPlane);
    anchor.group.add(anchorData.textBgPlane);
    anchor.group.add(anchorData.textPlane);

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

  await mindarThree.start();
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
});
