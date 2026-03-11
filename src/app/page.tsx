"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { TIPOS_CANCER } from "@/lib/types";
import {
  Heart,
  ChevronRight,
  Loader2,
  ClipboardList,
  MessageCircle,
} from "lucide-react";

type Paso = "bienvenida" | "datos" | "modo";
type Modo = "encuesta" | "chat";

export default function PaginaInicio() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [tipoCancer, setTipoCancer] = useState("");
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState<Paso>("bienvenida");
  const [modoSeleccionado, setModoSeleccionado] = useState<Modo | null>(null);

  const iniciar = async () => {
    if (!modoSeleccionado) return;
    setCargando(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("conversaciones")
        .insert({
          nombre_paciente: nombre || null,
          tipo_cancer: tipoCancer || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      const destino =
        modoSeleccionado === "encuesta"
          ? `/encuesta?id=${data.id}`
          : `/conversacion?id=${data.id}`;

      router.push(destino);
    } catch (error) {
      console.error("Error al iniciar:", error);
      setCargando(false);
    }
  };

  // Paso 1: Bienvenida
  if (paso === "bienvenida") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center shadow-sm">
              <Heart className="w-10 h-10 text-teal-600" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              Hola, bienvenido/a
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Mientras esperas tu consulta, este es un espacio tranquilo para
              que puedas ordenar tus pensamientos y compartir lo que más te
              ronda la cabeza.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-left space-y-3">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">
              ¿Cómo funciona?
            </p>
            <div className="space-y-2 text-slate-700 text-sm leading-relaxed">
              <p>💬 Compartes lo que sientes a tu ritmo.</p>
              <p>
                📋 Al terminar, tu médico recibirá un resumen para poder
                acompañarte mejor.
              </p>
              <p>
                🔒 Todo lo que compartas es confidencial y se usa solo para tu
                atención.
              </p>
            </div>
          </div>

          <Button size="xl" className="w-full" onClick={() => setPaso("datos")}>
            Quiero participar
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>

          <p className="text-xs text-slate-400">
            Tu participación es completamente voluntaria
          </p>
        </div>
      </div>
    );
  }

  // Paso 2: Datos básicos
  if (paso === "datos") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              Antes de empezar
            </h2>
            <p className="text-slate-500 text-sm">
              Datos opcionales. Nos ayudan a personalizar tu experiencia.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                ¿Cómo te llamas?{" "}
                <span className="text-slate-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre o como prefieras que te llamen"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Tipo de diagnóstico{" "}
                <span className="text-slate-400">(opcional)</span>
              </label>
              <select
                value={tipoCancer}
                onChange={(e) => setTipoCancer(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 text-slate-700"
              >
                <option value="">Seleccionar (opcional)</option>
                {TIPOS_CANCER.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button size="xl" className="w-full" onClick={() => setPaso("modo")}>
            Continuar
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>

          <button
            onClick={() => setPaso("bienvenida")}
            className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  // Paso 3: Elección de modo
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
            ¿Cómo prefieres compartir?
          </h2>
          <p className="text-slate-500 text-sm">
            Elige la manera que se sienta más cómoda para ti.
          </p>
        </div>

        <div className="space-y-3">
          {/* Opción 1: Encuesta */}
          <button
            onClick={() => setModoSeleccionado("encuesta")}
            className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${
              modoSeleccionado === "encuesta"
                ? "border-teal-500 bg-teal-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  modoSeleccionado === "encuesta"
                    ? "bg-teal-500"
                    : "bg-slate-100"
                }`}
              >
                <ClipboardList
                  className={`w-5 h-5 ${
                    modoSeleccionado === "encuesta"
                      ? "text-white"
                      : "text-slate-500"
                  }`}
                />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">
                  Responder preguntas guiadas
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Te hacemos preguntas una a una. Puedes responder con tus
                  propias palabras o elegir una opción. Más estructurado,
                  ~5 minutos.
                </p>
              </div>
            </div>
          </button>

          {/* Opción 2: Chat */}
          <button
            onClick={() => setModoSeleccionado("chat")}
            className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${
              modoSeleccionado === "chat"
                ? "border-teal-500 bg-teal-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  modoSeleccionado === "chat" ? "bg-teal-500" : "bg-slate-100"
                }`}
              >
                <MessageCircle
                  className={`w-5 h-5 ${
                    modoSeleccionado === "chat" ? "text-white" : "text-slate-500"
                  }`}
                />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">
                  Conversar con IA
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Una conversación libre con un asistente empático que te
                  escucha y te hace preguntas. Más personal y abierto,
                  ~15 minutos.
                </p>
              </div>
            </div>
          </button>
        </div>

        <Button
          size="xl"
          className="w-full"
          onClick={iniciar}
          disabled={!modoSeleccionado || cargando}
        >
          {cargando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Preparando tu espacio...
            </>
          ) : (
            <>
              Comenzar
              <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>

        <button
          onClick={() => setPaso("datos")}
          className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
