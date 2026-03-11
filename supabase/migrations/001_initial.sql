-- Sesiones de conversación (paciente anónimo o con datos mínimos)
CREATE TABLE IF NOT EXISTS conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_paciente TEXT,
  edad INTEGER,
  tipo_cancer TEXT,
  estado TEXT NOT NULL DEFAULT 'en_progreso',
  iniciada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completada_en TIMESTAMPTZ,
  codigo_medico TEXT,
  CONSTRAINT estado_valido CHECK (estado IN ('en_progreso', 'completada', 'abandonada'))
);

-- Mensajes individuales de la conversación
CREATE TABLE IF NOT EXISTS mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID NOT NULL REFERENCES conversaciones(id) ON DELETE CASCADE,
  rol TEXT NOT NULL,
  contenido TEXT NOT NULL,
  dimension TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rol_valido CHECK (rol IN ('usuario', 'asistente')),
  CONSTRAINT dimension_valida CHECK (
    dimension IS NULL OR dimension IN (
      'familia', 'espiritual', 'economico', 'trabajo', 'relaciones', 'salud', 'general'
    )
  )
);

-- Informes estructurados para el médico
CREATE TABLE IF NOT EXISTS informes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID NOT NULL REFERENCES conversaciones(id) ON DELETE CASCADE UNIQUE,
  resumen TEXT,
  dimension_prioritaria TEXT,
  dimensiones JSONB,
  asuntos_pendientes TEXT[],
  intervenciones_sugeridas TEXT[],
  citas_clave TEXT[],
  generado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_conversaciones_estado ON conversaciones(estado);
CREATE INDEX IF NOT EXISTS idx_conversaciones_codigo_medico ON conversaciones(codigo_medico);
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_informes_conversacion ON informes(conversacion_id);

-- RLS: las conversaciones son públicas de inserción (pacientes no autenticados)
ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE informes ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso público (pacientes en sala de espera)
CREATE POLICY "permitir_insercion_conversaciones" ON conversaciones
  FOR INSERT WITH CHECK (true);

CREATE POLICY "permitir_lectura_propia_conversacion" ON conversaciones
  FOR SELECT USING (true);

CREATE POLICY "permitir_actualizacion_conversacion" ON conversaciones
  FOR UPDATE USING (true);

CREATE POLICY "permitir_insercion_mensajes" ON mensajes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "permitir_lectura_mensajes" ON mensajes
  FOR SELECT USING (true);

CREATE POLICY "permitir_insercion_informes" ON informes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "permitir_lectura_informes" ON informes
  FOR SELECT USING (true);
