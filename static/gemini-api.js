export async function getGeminiResponse(tipo) {
  let prompt = "";

  if (tipo === "cultural") {
    prompt = `
Genera un JSON con exactamente 14 preguntas sobre las culturas del Perú. Cada pregunta debe ser concisa y clara:

REQUISITOS:
- Pregunta: máximo 3 líneas, directa y clara
- Alternativas: opciones simples de 1-2 palabras máximo
- Temas: 1.Cultura Chavín
         2.Cultura Paracas
         3.Cultura Nazca
         4.Cultura Moche (Mochica)
         5.Cultura Recuay
         6.Cultura Tiahuanaco
         7.Cultura Wari
         8.Cultura Lambayeque (Sicán)
         9.Cultura Chachapoyas
         10.Cultura Chimú
         11.Cultura Chincha
         12.Cultura Huari
         13.Cultura Cupisnique
         14.Cultura Inca
- Tiene que ser en ese orden las preguntas
Formato del JSON:

[
  {
    "Pregunta": "¿Cuál fue la capital de la cultura Wari?",
    "Alternativas": ["Cusco", "Ayacucho", "Lima", "Arequipa"],
    "Alternativa_correcta": "B",
    "Descripcion": "La cultura Wari tuvo su capital en Ayacucho, donde desarrolló un importante centro administrativo."
  },
  {
    "Pregunta": "¿Qué cultura construyó las líneas de Nazca?",
    "Alternativas": ["Moche", "Nazca", "Chavín", "Paracas"],
    "Alternativa_correcta": "B",
    "Descripcion": "Los nazcas crearon las famosas líneas en el desierto de Nazca entre 200 a.C. y 600 d.C."
  }
]

Solo responde con el JSON, sin texto adicional.
    `;
  } else if (tipo === "matematica") {
    prompt = `
Genera un JSON con exactamente 2 preguntas de matemáticas básicas. Cada pregunta debe ser concisa y clara:

REQUISITOS:
- Pregunta: máximo 3 líneas, directa y clara
- Alternativas: números o expresiones simples
- Temas: aritmética básica, álgebra simple, geometría básica
- Nivel: secundaria/preparatoria

Formato del JSON:

[
  {
    "Pregunta": "¿Cuál es el resultado de 15 + 28?",
    "Alternativas": ["41", "43", "45", "47"],
    "Alternativa_correcta": "B",
    "Descripcion": "15 + 28 = 43. Suma directa de dos números enteros."
  },
  {
    "Pregunta": "¿Cuál es el área de un rectángulo de 6m × 4m?",
    "Alternativas": ["20 m²", "24 m²", "28 m²", "32 m²"],
    "Alternativa_correcta": "B",
    "Descripcion": "Área = largo × ancho = 6 × 4 = 24 metros cuadrados."
  }
]

Solo responde con el JSON, sin texto adicional.
    `;
  } else if (tipo === "programacion") {
    prompt = `
Genera un JSON con exactamente 2 preguntas de programación básica. Cada pregunta debe ser concisa y clara:

REQUISITOS:
- Pregunta: máximo 3 líneas, directa y clara
- Alternativas: opciones simples de 1-3 palabras
- Temas: conceptos básicos de programación, JavaScript, Python, algoritmos
- Nivel: principiante a intermedio

Formato del JSON:

[
  {
    "Pregunta": "¿Qué tipo de dato es 'true' en JavaScript?",
    "Alternativas": ["String", "Boolean", "Number", "Object"],
    "Alternativa_correcta": "B",
    "Descripcion": "true es un valor booleano que representa verdadero en JavaScript."
  },
  {
    "Pregunta": "¿Cuál es la estructura correcta de un bucle for?",
    "Alternativas": ["for(i=0;i<10;i++)", "for i in range", "for(i:10)", "for i=0 to 10"],
    "Alternativa_correcta": "A",
    "Descripcion": "La sintaxis correcta en JavaScript es for(inicialización; condición; incremento)."
  }
]

Solo responde con el JSON, sin texto adicional.
    `;
  }
  
  const API_KEY = "AIzaSyCsW8RShSL0bGQN_38kKyCmy_ZNvotQP6Q";
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const response = await fetch(`${endpoint}?key=${API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Error al llamar a Gemini:", response.statusText);
    return null;
  }

  const data = await response.json();
  const message = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return message || "No se recibió respuesta de Gemini.";
}