import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Conversacion } from "@/lib/types";
import { Stethoscope, Clock, CheckCircle, MessageCircle } from "lucide-react";

export default async function DashboardMedico() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/medico/login");

  // Obtener conversaciones de hoy con sus informes
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const { data: conversaciones } = await supabase
    .from("conversaciones")
    .select(`
      *,
      informes (id)
    `)
    .gte("iniciada_en", hoy.toISOString())
    .order("iniciada_en", { ascending: false });

  const lista = (conversaciones ?? []) as (Conversacion & {
    informes: { id: string }[];
  })[];

  const completadas = lista.filter((c) => c.estado === "completada");
  const enProgreso = lista.filter((c) => c.estado === "en_progreso");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Resuelve — Panel Médico</h1>
              <p className="text-xs text-slate-400">Informes de pacientes de hoy</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="post">
            <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Resumen del día */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-slate-800">{lista.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total hoy</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-green-600">{completadas.length}</p>
            <p className="text-xs text-slate-500 mt-1">Completadas</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <p className="text-2xl font-bold text-amber-600">{enProgreso.length}</p>
            <p className="text-xs text-slate-500 mt-1">En progreso</p>
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Conversaciones de hoy
          </h2>

          {lista.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
              <MessageCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">
                Aún no hay conversaciones registradas hoy.
              </p>
            </div>
          ) : (
            lista.map((conv) => (
              <Link
                key={conv.id}
                href={
                  conv.informes?.length
                    ? `/medico/reporte/${conv.informes[0].id}`
                    : "#"
                }
                className={`block bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all ${
                  conv.informes?.length
                    ? "hover:border-teal-200 hover:shadow-md cursor-pointer"
                    : "opacity-60 cursor-default"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">
                        {conv.nombre_paciente || "Paciente anónimo"}
                      </p>
                      {conv.tipo_cancer && (
                        <Badge variant="secondary" className="text-xs">
                          {conv.tipo_cancer}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(conv.iniciada_en).toLocaleTimeString("es-CL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {conv.completada_en && (
                        <> — Completó a las {new Date(conv.completada_en).toLocaleTimeString("es-CL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}</>
                      )}
                    </p>
                  </div>

                  <div>
                    {conv.estado === "completada" && conv.informes?.length ? (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Informe listo
                      </Badge>
                    ) : conv.estado === "en_progreso" ? (
                      <Badge variant="warning">
                        <Clock className="w-3 h-3 mr-1" />
                        En sala
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Sin informe</Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
