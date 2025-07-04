document.addEventListener("DOMContentLoaded", () => {
  const helpBtn = document.getElementById("help-button");
  const helpOverlay = document.getElementById("help-overlay");
  const helpClose = document.getElementById("help-close");

  // Mostrar el overlay al hacer clic en el botón ❗
  helpBtn.addEventListener("click", () => {
    helpOverlay.style.display = "block";
  });

  // Ocultar el overlay al hacer clic en la X ✖
  helpClose.addEventListener("click", () => {
    helpOverlay.style.display = "none";
  });

  // Cerrar también si se hace clic fuera del contenido
  helpOverlay.addEventListener("click", (e) => {
    if (e.target === helpOverlay) {
      helpOverlay.style.display = "none";
    }
  });
});
