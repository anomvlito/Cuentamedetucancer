"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { TIPOS_CANCER } from "@/lib/types";
import { Heart, ChevronRight, Loader2 } from "lucide-react";

export default function PaginaInicio() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [tipoCancer, setTipoCancer] = useState("");
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState<"bienvenida" | "datos">("bienvenida");

  const iniciarConversacion = async () => {
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
      router.push(`/conversacion?id=${data.id}`);
    } catch (error) {
      console.error("Error al iniciar conversación:", error);
      setCargando(false);
    }
  };

  if (paso === "bienvenida") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Icono */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center shadow-sm">
              <Heart className="w-10 h-10 text-teal-600" />
            </div>
          </div>

          {/* Título */}
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

          {/* Explicación */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-left space-y-3">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">
              ¿Cómo funciona?
            </p>
            <div className="space-y-2 text-slate-700 text-sm leading-relaxed">
              <p>
                💬 Conversarás con un asistente empático que te escuchará con
                calma.
              </p>
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
            Antes de empezar
          </h2>
          <p className="text-slate-500">
            Estos datos son opcionales. Nos ayudan a personalizar la
            conversación.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              ¿Cómo te llamas? <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre o como prefieras que te llamen"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
            />
          </div>

          {/* Tipo de cáncer */}
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

        <Button
          size="xl"
          className="w-full"
          onClick={iniciarConversacion}
          disabled={cargando}
        >
          {cargando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Preparando tu espacio...
            </>
          ) : (
            <>
              Comenzar la conversación
              <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
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
