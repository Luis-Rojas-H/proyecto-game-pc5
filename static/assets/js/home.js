// Función para dividir texto en caracteres (similar a SplitText)
function splitTextToChars(selector) {
  const element = document.querySelector(selector);
  const text = element.textContent;

  // Limpiar el contenido original
  element.innerHTML = "";

  // Crear un span para cada carácter
  const chars = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char; // Usar espacio no separable
    span.style.display = "inline-block";
    element.appendChild(span);
    chars.push(span);
  }

  return chars;
}

// Configurar el h1 como visible
gsap.set("h1", { opacity: 1 });

// Dividir el texto en caracteres
const chars = splitTextToChars("#heading");

// Animar cada carácter desde abajo, apareciendo gradualmente
gsap.from(chars, {
  y: 20,
  autoAlpha: 0,
  stagger: 0.05,
  duration: 0.6,
  ease: "back.out(1.7)",
});

// Animar el logo después de que termine la animación del texto
gsap.fromTo(
  "#logo",
  {
    opacity: 0,
    y: 30,
    scale: 0.8,
    rotation: -10,
  },
  {
    opacity: 1,
    y: 0,
    scale: 1,
    rotation: 0,
    duration: 1,
    ease: "elastic.out(1, 0.5)",
    delay: 1.2, // Espera a que termine la animación del texto
  }
);
