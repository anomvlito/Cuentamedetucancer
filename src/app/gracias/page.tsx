import Link from "next/link";
import { CheckCircle, Heart } from "lucide-react";

export default function PaginaGracias() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Icono de éxito */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            Gracias por compartir
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Lo que nos contaste quedó guardado. Tu médico tendrá un resumen
            para poder acompañarte mejor en esta etapa.
          </p>
        </div>

        {/* Mensaje de ánimo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
          <div className="flex justify-center">
            <Heart className="w-6 h-6 text-teal-500" />
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            Tomarse el tiempo para poner en palabras lo que uno siente es un
            acto de valentía. Esperamos que esta conversación haya sido útil,
            aunque sea un poquito.
          </p>
        </div>

        {/* Instrucción */}
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
          <p className="text-teal-800 text-sm font-medium">
            Ya puedes entregar el dispositivo o cerrar esta pantalla.
          </p>
          <p className="text-teal-600 text-sm mt-1">
            Cuando te llamen, tu médico ya tendrá tu resumen.
          </p>
        </div>

        {/* Link discreto para iniciar nueva conversación */}
        <Link
          href="/"
          className="text-xs text-slate-300 hover:text-slate-400 transition-colors"
        >
          Nueva conversación
        </Link>
      </div>
    </div>
  );
}
