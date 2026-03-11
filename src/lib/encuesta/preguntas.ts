import { Dimension } from "@/lib/types";

export type TipoPregunta = "texto_largo" | "opciones_texto";

export interface OpcionPregunta {
  valor: string;
  etiqueta: string;
}

export interface PreguntaEncuesta {
  id: string;
  dimension: Dimension;
  pregunta: string;
  subtexto?: string;
  tipo: TipoPregunta;
  opciones?: OpcionPregunta[];
  placeholderTexto?: string;
  opcional?: boolean;
}

export interface RespuestaEncuesta {
  pregunta_id: string;
  dimension: Dimension;
  pregunta: string;
  opcion_elegida?: string;
  texto_libre?: string;
}

export const PREGUNTAS: PreguntaEncuesta[] = [
  {
    id: "preocupacion_principal",
    dimension: "general",
    pregunta: "¿Qué es lo que más te preocupa o ronda tu cabeza desde que recibiste tu diagnóstico?",
    subtexto: "No hay respuesta correcta ni incorrecta. Lo que sientas es válido.",
    tipo: "texto_largo",
    placeholderTexto: "Puedes escribir con tus propias palabras, con calma...",
  },
  {
    id: "familia",
    dimension: "familia",
    pregunta: "¿Hay algo que quisieras decirle a alguien de tu familia o personas cercanas que aún no has podido?",
    subtexto: "Puede ser algo pendiente, una conversación que sientes que falta.",
    tipo: "opciones_texto",
    opciones: [
      { valor: "si", etiqueta: "Sí, hay algo importante que quiero decir" },
      { valor: "tal_vez", etiqueta: "Tal vez, no estoy seguro/a" },
      { valor: "no", etiqueta: "No, en ese sentido estoy tranquilo/a" },
    ],
    placeholderTexto: "Si quieres, cuéntame más sobre eso...",
  },
  {
    id: "espiritual",
    dimension: "espiritual",
    pregunta: "¿La fe, la espiritualidad o el sentido de tu vida tienen un papel importante en cómo estás viviendo esto?",
    tipo: "opciones_texto",
    opciones: [
      { valor: "muy_importante", etiqueta: "Sí, es muy importante para mí" },
      { valor: "algo", etiqueta: "Algo, me ayuda de cierta manera" },
      { valor: "poco", etiqueta: "No mucho, no es algo que me guíe" },
    ],
    placeholderTexto: "¿Quieres agregar algo sobre esto?",
    opcional: true,
  },
  {
    id: "economico",
    dimension: "economico",
    pregunta: "¿Tu diagnóstico te genera preocupaciones económicas o relacionadas con tu trabajo?",
    subtexto: "El costo de tratamientos, licencias, el sustento de tu familia...",
    tipo: "opciones_texto",
    opciones: [
      { valor: "si_bastante", etiqueta: "Sí, me preocupa bastante" },
      { valor: "algo", etiqueta: "Algo, pero lo tengo relativamente controlado" },
      { valor: "no", etiqueta: "No, en lo económico estoy bien" },
    ],
    placeholderTexto: "¿Qué es lo que más te preocupa en ese sentido?",
    opcional: true,
  },
  {
    id: "relaciones",
    dimension: "relaciones",
    pregunta: "¿Hay personas con quienes sientas que tienes 'cosas pendientes'?",
    subtexto: "Conversaciones, perdones, reconciliaciones, algo que quieras aclarar.",
    tipo: "opciones_texto",
    opciones: [
      { valor: "si", etiqueta: "Sí, hay personas o situaciones pendientes" },
      { valor: "tal_vez", etiqueta: "Tal vez, algo me queda dando vueltas" },
      { valor: "no", etiqueta: "No, siento que mis relaciones están bien" },
    ],
    placeholderTexto: "Si te acomoda, puedes contarme un poco más...",
    opcional: true,
  },
  {
    id: "miedos",
    dimension: "salud",
    pregunta: "¿Cuáles son tus principales miedos en este momento?",
    subtexto: "Pueden ser miedos al tratamiento, al dolor, al futuro, a lo que les pase a los tuyos...",
    tipo: "texto_largo",
    placeholderTexto: "Puedes nombrarlos como quieras, uno o varios...",
  },
  {
    id: "prioridades",
    dimension: "general",
    pregunta: "¿Qué es lo más importante para ti en este momento de tu vida?",
    subtexto: "Las personas, los proyectos, las cosas que sientes que no puedes dejar de hacer.",
    tipo: "texto_largo",
    placeholderTexto: "Lo que primero se te venga a la mente...",
  },
  {
    id: "pendientes",
    dimension: "general",
    pregunta: "¿Hay algo que sientas que quieres o necesitas resolver, antes de continuar con tu tratamiento?",
    subtexto: "Algo práctico, emocional, familiar, lo que sea que sientas que está 'sin cerrar'.",
    tipo: "texto_largo",
    placeholderTexto: "No tiene que ser algo urgente, solo lo que sientas...",
    opcional: true,
  },
];
