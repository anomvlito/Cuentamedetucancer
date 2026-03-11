import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Informe, Conversacion, Dimension, DIMENSIONES_LABELS, DimensionAnalisis } from "@/lib/types";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Heart,
  Quote,
} from "lucide-react";

const NIVEL_COLORES: Record<string, string> = {
  alto: "bg-red-50 border-red-200 text-red-800",
  medio: "bg-amber-50 border-amber-200 text-amber-800",
  bajo: "bg-green-50 border-green-200 text-green-800",
  no_explorado: "bg-slate-50 border-slate-200 text-slate-500",
};

const NIVEL_ICONO: Record<string, React.ReactNode> = {
  alto: <AlertTriangle className="w-4 h-4" />,
  medio: <Heart className="w-4 h-4" />,
  bajo: <CheckCircle className="w-4 h-4" />,
  no_explorado: null,
};

export default async function PaginaReporte({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/medico/login");

  const { data: informe } = await supabase
    .from("informes")
    .select(`*, conversaciones (*)`)
    .eq("id", id)
    .single();

  if (!informe) notFound();

  const reporte = informe as Informe & {
    conversaciones: Conversacion;
  };

  const dimensiones = reporte.dimensiones as Record<Dimension, DimensionAnalisis>;
  const dimensionesRelevantes = (Object.entries(dimensiones) as [Dimension, DimensionAnalisis][])
    .filter(([, v]) => v.nivel !== "no_explorado")
    .sort((a, b) => {
      const orden = { alto: 0, medio: 1, bajo: 2 };
      return (orden[a[1].nivel as keyof typeof orden] ?? 3) - (orden[b[1].nivel as keyof typeof orden] ?? 3);
    });

  const paciente = reporte.conversaciones;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link
            href="/medico/dashboard"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-800">
              Informe: {paciente.nombre_paciente || "Paciente anónimo"}
            </h1>
            <p className="text-xs text-slate-400">
              {paciente.tipo_cancer && `${paciente.tipo_cancer} · `}
              {new Date(reporte.generado_en).toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Resumen ejecutivo */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
            Resumen ejecutivo
          </h2>
          <p className="text-slate-700 leading-relaxed">{reporte.resumen}</p>

          {reporte.dimension_prioritaria && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-slate-500">Dimensión prioritaria:</span>
              <Badge variant="default">
                {DIMENSIONES_LABELS[reporte.dimension_prioritaria as Dimension]}
              </Badge>
            </div>
          )}
        </section>

        {/* Análisis por dimensión */}
        {dimensionesRelevantes.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
              Análisis por dimensión
            </h2>
            {dimensionesRelevantes.map(([dim, analisis]) => (
              <div
                key={dim}
                className={`rounded-2xl p-5 border space-y-3 ${NIVEL_COLORES[analisis.nivel] ?? ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    {NIVEL_ICONO[analisis.nivel]}
                    {DIMENSIONES_LABELS[dim]}
                  </div>
                  <Badge
                    variant={
                      analisis.nivel === "alto"
                        ? "warning"
                        : analisis.nivel === "bajo"
                        ? "success"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {analisis.nivel === "alto"
                      ? "Alta preocupación"
                      : analisis.nivel === "medio"
                      ? "Moderado"
                      : "Bajo"}
                  </Badge>
                </div>

                <p className="text-sm leading-relaxed opacity-90">
                  {analisis.resumen}
                </p>

                {analisis.citas?.length > 0 && (
                  <div className="space-y-2">
                    {analisis.citas.map((cita, i) => (
                      <div
                        key={i}
                        className="flex gap-2 items-start bg-white/60 rounded-xl px-3 py-2"
                      >
                        <Quote className="w-3 h-3 mt-0.5 opacity-50 flex-shrink-0" />
                        <p className="text-xs italic opacity-80">{cita}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Asuntos pendientes */}
        {reporte.asuntos_pendientes?.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
              Asuntos pendientes identificados
            </h2>
            <ul className="space-y-2">
              {reporte.asuntos_pendientes.map((asunto, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {asunto}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Intervenciones sugeridas */}
        {reporte.intervenciones_sugeridas?.length > 0 && (
          <section className="bg-teal-50 rounded-2xl p-6 border border-teal-100 space-y-3">
            <h2 className="font-semibold text-teal-800 text-sm uppercase tracking-wide">
              Intervenciones sugeridas
            </h2>
            <ul className="space-y-2">
              {reporte.intervenciones_sugeridas.map((intervencion, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-teal-800">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  {intervencion}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Citas clave */}
        {reporte.citas_clave?.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
              Frases clave del paciente
            </h2>
            <div className="space-y-3">
              {reporte.citas_clave.map((cita, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start border-l-4 border-teal-200 pl-4"
                >
                  <p className="text-sm text-slate-600 italic leading-relaxed">
                    &ldquo;{cita}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
