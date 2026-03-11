"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EncuestaGuiada from "@/components/paciente/EncuestaGuiada";
import { ClipboardList } from "lucide-react";

function EncuestaContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversacionId = searchParams.get("id");
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!conversacionId) {
      router.replace("/");
      return;
    }
    setListo(true);
  }, [conversacionId, router]);

  if (!listo) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-800">
            Cuestionario de reflexión personal
          </h1>
          <p className="text-xs text-slate-400">
            Tómate el tiempo que necesites · Confidencial
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <EncuestaGuiada
          conversacionId={conversacionId!}
          onFinalizar={() => router.push("/gracias")}
        />
      </div>
    </div>
  );
}

export default function PaginaEncuesta() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-slate-400">Cargando...</div>
        </div>
      }
    >
      <EncuestaContenido />
    </Suspense>
  );
}
