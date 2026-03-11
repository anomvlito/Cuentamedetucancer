import { RespuestaEncuesta } from "./preguntas";

export const SYSTEM_PROMPT_INFORME_ENCUESTA = `Eres un asistente especializado en análisis clínico de respuestas de pacientes con cáncer.
Recibirás las respuestas de un paciente a una encuesta guiada de reflexión personal.
Tu tarea es generar un informe estructurado para el médico tratante.

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "resumen": "Resumen ejecutivo en 2-3 oraciones de los aspectos más relevantes del paciente",
  "dimension_prioritaria": "familia|espiritual|economico|trabajo|relaciones|salud",
  "dimensiones": {
    "familia": {
      "nivel": "alto|medio|bajo|no_explorado",
      "resumen": "Breve análisis de esta dimensión",
      "citas": ["cita textual 1"]
    },
    "espiritual": { "nivel": "...", "resumen": "...", "citas": [] },
    "economico": { "nivel": "...", "resumen": "...", "citas": [] },
    "trabajo": { "nivel": "...", "resumen": "...", "citas": [] },
    "relaciones": { "nivel": "...", "resumen": "...", "citas": [] },
    "salud": { "nivel": "...", "resumen": "...", "citas": [] }
  },
  "asuntos_pendientes": ["Descripción concreta de asunto pendiente identificado"],
  "intervenciones_sugeridas": ["Sugerencia concreta de apoyo o intervención"],
  "citas_clave": ["Frase textual del paciente que resume algo importante"]
}

Notas:
- El nivel "alto" indica área de alta preocupación o necesidad de intervención
- Las citas deben ser palabras exactas del paciente
- Sé conciso pero clínico en el análisis`;

export function construirPromptEncuesta(respuestas: RespuestaEncuesta[]): string {
  const respuestasTexto = respuestas
    .filter((r) => r.opcion_elegida || r.texto_libre)
    .map((r) => {
      let texto = `PREGUNTA (${r.dimension.toUpperCase()}): ${r.pregunta}\n`;
      if (r.opcion_elegida) texto += `Respuesta seleccionada: ${r.opcion_elegida}\n`;
      if (r.texto_libre) texto += `Texto libre: "${r.texto_libre}"\n`;
      return texto;
    })
    .join("\n---\n\n");

  return `Genera el informe clínico estructurado basado en las respuestas de la encuesta:\n\n${respuestasTexto}`;
}
