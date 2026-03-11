export type Dimension =
  | "familia"
  | "espiritual"
  | "economico"
  | "trabajo"
  | "relaciones"
  | "salud"
  | "general";

export type RolMensaje = "usuario" | "asistente";

export type EstadoConversacion = "en_progreso" | "completada" | "abandonada";

export interface Mensaje {
  id: string;
  conversacion_id: string;
  rol: RolMensaje;
  contenido: string;
  dimension?: Dimension;
  creado_en: string;
}

export interface Conversacion {
  id: string;
  nombre_paciente?: string;
  edad?: number;
  tipo_cancer?: string;
  estado: EstadoConversacion;
  iniciada_en: string;
  completada_en?: string;
  codigo_medico?: string;
}

export interface DimensionAnalisis {
  nivel: "alto" | "medio" | "bajo" | "no_explorado";
  resumen: string;
  citas: string[];
}

export interface Informe {
  id: string;
  conversacion_id: string;
  resumen: string;
  dimension_prioritaria: Dimension;
  dimensiones: Record<Dimension, DimensionAnalisis>;
  asuntos_pendientes: string[];
  intervenciones_sugeridas: string[];
  citas_clave: string[];
  generado_en: string;
}

export interface MensajeChat {
  rol: RolMensaje;
  contenido: string;
}

export const DIMENSIONES_LABELS: Record<Dimension, string> = {
  familia: "Familia",
  espiritual: "Espiritualidad",
  economico: "Economía",
  trabajo: "Trabajo",
  relaciones: "Relaciones",
  salud: "Salud",
  general: "General",
};

export const TIPOS_CANCER = [
  "Cáncer de mama",
  "Cáncer de pulmón",
  "Cáncer de colon",
  "Cáncer de próstata",
  "Linfoma",
  "Leucemia",
  "Melanoma",
  "Cáncer cervical",
  "Cáncer de ovario",
  "Otro tipo de cáncer",
  "Prefiero no decirlo",
] as const;
