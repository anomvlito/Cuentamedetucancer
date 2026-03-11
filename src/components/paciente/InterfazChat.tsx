"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MensajeChat, Dimension, DIMENSIONES_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Send, Loader2, Heart } from "lucide-react";

interface Props {
  conversacionId: string;
  onFinalizar: () => void;
}

const DIMENSIONES_ORDEN: Dimension[] = [
  "familia",
  "espiritual",
  "economico",
  "trabajo",
  "relaciones",
  "salud",
];

export default function InterfazChat({ conversacionId, onFinalizar }: Props) {
  const [historial, setHistorial] = useState<MensajeChat[]>([]);
  const [inputUsuario, setInputUsuario] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarFinalizar, setMostrarFinalizar] = useState(false);
  const [generandoInforme, setGenerandoInforme] = useState(false);
  const [dimensionesExploradas, setDimensionesExploradas] = useState<Set<Dimension>>(
    new Set()
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollAlFinal = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  // Mensaje inicial de bienvenida
  useEffect(() => {
    const iniciar = async () => {
      setCargando(true);
      const mensajeInicial: MensajeChat = {
        rol: "usuario",
        contenido: "Hola, acabo de llegar a la sala de espera.",
      };
      await enviarMensaje(mensajeInicial, []);
    };
    iniciar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectarDimension = (texto: string): Dimension | undefined => {
    const texto_lower = texto.toLowerCase();
    if (/famil|hij|esposo|esposa|pareja|mamá|papá|hermano|hermana/.test(texto_lower))
      return "familia";
    if (/dios|fe|espiritu|religión|creencia|alma|significado|sentido/.test(texto_lower))
      return "espiritual";
    if (/plata|dinero|trabajo|empleo|sueldo|deuda|financ|económ/.test(texto_lower))
      return "economico";
    if (/trabajo|jefe|empresa|oficina|carrera|laboral/.test(texto_lower))
      return "trabajo";
    if (/amig|compañer|social|relacion/.test(texto_lower)) return "relaciones";
    if (/médico|tratamiento|quimio|radioterapia|dolor|síntoma/.test(texto_lower))
      return "salud";
    return undefined;
  };

  const guardarMensaje = async (mensaje: MensajeChat) => {
    const supabase = createClient();
    const dimension = detectarDimension(mensaje.contenido);
    if (dimension) {
      setDimensionesExploradas((prev) => new Set([...prev, dimension]));
    }
    await supabase.from("mensajes").insert({
      conversacion_id: conversacionId,
      rol: mensaje.rol,
      contenido: mensaje.contenido,
      dimension: dimension ?? "general",
    });
  };

  const enviarMensaje = async (
    mensaje: MensajeChat,
    historialActual: MensajeChat[]
  ) => {
    const nuevoHistorial = [...historialActual, mensaje];
    setHistorial(nuevoHistorial);
    await guardarMensaje(mensaje);
    scrollAlFinal();

    setCargando(true);
    let respuestaTexto = "";

    try {
      const response = await fetch("/api/conversacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historial: nuevoHistorial }),
      });

      if (!response.ok) throw new Error("Error al conectar con el asistente");
      if (!response.body) throw new Error("No hay respuesta");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Agregar mensaje vacío del asistente para ir completando
      setHistorial((prev) => [...prev, { rol: "asistente", contenido: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lineas = chunk.split("\n");

        for (const linea of lineas) {
          if (!linea.startsWith("data: ")) continue;
          const datos = linea.slice(6);
          if (datos === "[DONE]") break;

          try {
            const parsed = JSON.parse(datos);
            if (parsed.texto) {
              respuestaTexto += parsed.texto;
              setHistorial((prev) => {
                const nuevo = [...prev];
                nuevo[nuevo.length - 1] = {
                  rol: "asistente",
                  contenido: respuestaTexto,
                };
                return nuevo;
              });
              scrollAlFinal();
            }
          } catch {
            // ignorar chunks mal formados
          }
        }
      }

      // Guardar respuesta completa del asistente
      const mensajeAsistente: MensajeChat = {
        rol: "asistente",
        contenido: respuestaTexto,
      };
      await guardarMensaje(mensajeAsistente);

      // Mostrar botón de finalizar después de varios intercambios
      if (nuevoHistorial.length >= 6) {
        setMostrarFinalizar(true);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Error desconocido";
      setHistorial((prev) => [
        ...prev.slice(0, -1),
        {
          rol: "asistente",
          contenido: `Lo siento, tuve un problema técnico. ¿Puedes intentar de nuevo? (${errMsg})`,
        },
      ]);
    } finally {
      setCargando(false);
      scrollAlFinal();
    }
  };

  const manejarEnvio = async () => {
    const texto = inputUsuario.trim();
    if (!texto || cargando) return;

    setInputUsuario("");
    const mensaje: MensajeChat = { rol: "usuario", contenido: texto };
    await enviarMensaje(mensaje, historial);
  };

  const manejarTeclado = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      manejarEnvio();
    }
  };

  const finalizarConversacion = async () => {
    setGenerandoInforme(true);
    try {
      const response = await fetch("/api/informe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversacion_id: conversacionId, historial }),
      });
      if (!response.ok) throw new Error("Error al generar informe");
      onFinalizar();
    } catch (error) {
      console.error("Error al finalizar:", error);
      setGenerandoInforme(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Indicador de dimensiones exploradas */}
      {dimensionesExploradas.size > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-1 border-b border-slate-100">
          {DIMENSIONES_ORDEN.filter((d) => dimensionesExploradas.has(d)).map((d) => (
            <Badge key={d} variant="default" className="text-xs">
              {DIMENSIONES_LABELS[d]}
            </Badge>
          ))}
        </div>
      )}

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {historial.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.rol === "usuario" ? "justify-end" : "justify-start"}`}
          >
            {msg.rol === "asistente" && (
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Heart className="w-4 h-4 text-teal-600" />
              </div>
            )}
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.rol === "usuario"
                  ? "bg-teal-600 text-white rounded-br-sm"
                  : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm"
              }`}
            >
              {msg.contenido || (
                <span className="flex gap-1 items-center text-slate-400">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Botón de finalizar */}
      {mostrarFinalizar && (
        <div className="px-4 py-2 border-t border-slate-100">
          <Button
            onClick={finalizarConversacion}
            disabled={generandoInforme || cargando}
            variant="outline"
            className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            {generandoInforme ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Preparando tu resumen...
              </>
            ) : (
              "Ya dije lo que quería — terminar"
            )}
          </Button>
        </div>
      )}

      {/* Input de usuario */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={inputUsuario}
            onChange={(e) => setInputUsuario(e.target.value)}
            onKeyDown={manejarTeclado}
            placeholder="Escribe aquí lo que quieras compartir..."
            disabled={cargando}
            className="flex-1 min-h-[52px] max-h-[150px] text-base"
            rows={1}
          />
          <Button
            onClick={manejarEnvio}
            disabled={!inputUsuario.trim() || cargando}
            size="icon"
            className="h-[52px] w-[52px] flex-shrink-0"
          >
            {cargando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Presiona Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
