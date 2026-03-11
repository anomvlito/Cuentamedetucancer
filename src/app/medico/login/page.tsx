"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Stethoscope } from "lucide-react";

export default function LoginMedico() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email o contraseña incorrectos");
        return;
      }

      router.push("/medico/dashboard");
    } catch {
      setError("Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Acceso Médico</h1>
          <p className="text-slate-500 text-sm">
            Ingresa para ver los informes de tus pacientes
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={iniciarSesion}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4"
        >
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={cargando}>
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Ingresando...
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
