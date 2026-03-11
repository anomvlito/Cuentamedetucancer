"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InterfazChat from "@/components/paciente/InterfazChat";
import { Heart } from "lucide-react";

function ConversacionContenido() {
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

  const onFinalizar = () => {
    router.push("/gracias");
  };

  if (!listo) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center">
          <Heart className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-800">
            Acompañamiento en sala de espera
          </h1>
          <p className="text-xs text-slate-400">
            Todo lo que compartas es confidencial
          </p>
        </div>
      </header>

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <InterfazChat
          conversacionId={conversacionId!}
          onFinalizar={onFinalizar}
        />
      </div>
    </div>
  );
}

export default function PaginaConversacion() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-400">Cargando...</div>
    </div>}>
      <ConversacionContenido />
    </Suspense>
  );
}
