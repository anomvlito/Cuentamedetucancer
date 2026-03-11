import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resuelve — Acompañamiento para Pacientes",
  description:
    "Un espacio para ordenar tus pensamientos mientras esperas tu consulta médica.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-b from-teal-50 to-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
