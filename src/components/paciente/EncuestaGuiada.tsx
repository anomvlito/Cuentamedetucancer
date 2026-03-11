"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PREGUNTAS, RespuestaEncuesta } from "@/lib/encuesta/preguntas";
import { ChevronRight, Loader2, SkipForward } from "lucide-react";

interface Props {
  conversacionId: string;
  onFinalizar: () => void;
}

export default function EncuestaGuiada({ conversacionId, onFinalizar }: Props) {
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestaEncuesta[]>([]);
  const [opcionActual, setOpcionActual] = useState<string>("");
  const [textoActual, setTextoActual] = useState<string>("");
  const [enviando, setEnviando] = useState(false);

  const pregunta = PREGUNTAS[indicePregunta];
  const progreso = ((indicePregunta) / PREGUNTAS.length) * 100;
  const esUltima = indicePregunta === PREGUNTAS.length - 1;
  const puedeAvanzar =
    pregunta.opcional ||
    (pregunta.tipo === "texto_largo" && textoActual.trim().length > 0) ||
    (pregunta.tipo === "opciones_texto" && opcionActual !== "");

  const guardarRespuestaActual = (): RespuestaEncuesta => ({
    pregunta_id: pregunta.id,
    dimension: pregunta.dimension,
    pregunta: pregunta.pregunta,
    opcion_elegida: opcionActual || undefined,
    texto_libre: textoActual.trim() || undefined,
  });

  const avanzar = () => {
    const respuesta = guardarRespuestaActual();
    const nuevasRespuestas = [...respuestas, respuesta];
    setRespuestas(nuevasRespuestas);
    setOpcionActual("");
    setTextoActual("");
    setIndicePregunta((prev) => prev + 1);
  };

  const finalizar = async () => {
    const respuesta = guardarRespuestaActual();
    const todasLasRespuestas = [...respuestas, respuesta];
    setEnviando(true);

    try {
      const response = await fetch("/api/encuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversacion_id: conversacionId,
          respuestas: todasLasRespuestas,
        }),
      });
      if (!response.ok) throw new Error("Error al enviar respuestas");
      onFinalizar();
    } catch (error) {
      console.error("Error al finalizar encuesta:", error);
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de progreso */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Pregunta {indicePregunta + 1} de {PREGUNTAS.length}</span>
          <span>{Math.round(progreso)}% completado</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Pregunta actual */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Texto de la pregunta */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
            {pregunta.dimension === "general" ? "Reflexión" : pregunta.dimension.charAt(0).toUpperCase() + pregunta.dimension.slice(1)}
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
            {pregunta.pregunta}
          </h2>
          {pregunta.subtexto && (
            <p className="text-sm text-slate-500 leading-relaxed">
              {pregunta.subtexto}
            </p>
          )}
        </div>

        {/* Opciones (si es tipo opciones_texto) */}
        {pregunta.tipo === "opciones_texto" && pregunta.opciones && (
          <div className="space-y-2">
            {pregunta.opciones.map((op) => (
              <button
                key={op.valor}
                onClick={() => setOpcionActual(op.valor)}
                className={`w-full text-left rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                  opcionActual === op.valor
                    ? "border-teal-500 bg-teal-50 text-teal-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {op.etiqueta}
              </button>
            ))}
          </div>
        )}

        {/* Área de texto */}
        <div className="space-y-2">
          {pregunta.tipo === "opciones_texto" && (
            <p className="text-xs text-slate-400">
              {opcionActual
                ? "¿Quieres agregar algo más? (opcional)"
                : "O escribe directamente si prefieres:"}
            </p>
          )}
          <textarea
            value={textoActual}
            onChange={(e) => setTextoActual(e.target.value)}
            placeholder={pregunta.placeholderTexto}
            rows={pregunta.tipo === "texto_largo" ? 5 : 3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white"
          />
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="px-4 py-4 border-t border-slate-100 bg-white space-y-3">
        <Button
          onClick={esUltima ? finalizar : avanzar}
          disabled={!puedeAvanzar || enviando}
          size="lg"
          className="w-full"
        >
          {enviando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Preparando tu resumen...
            </>
          ) : esUltima ? (
            "Terminar y enviar al médico"
          ) : (
            <>
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>

        {pregunta.opcional && !enviando && (
          <button
            onClick={esUltima ? finalizar : avanzar}
            className="w-full flex items-center justify-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Prefiero omitir esta pregunta
          </button>
        )}
      </div>
    </div>
  );
}
