import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    google_api_key: !!process.env.GOOGLE_API_KEY,
    google_gemini_api_key: !!process.env.GOOGLE_GEMINI_API_KEY,
    gemini_api_key: !!process.env.GEMINI_API_KEY,
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    // Ver todas las env vars que empiecen con GOOGLE o GEMINI (solo nombres, sin valores)
    google_vars: Object.keys(process.env).filter(
      (k) => k.startsWith("GOOGLE") || k.startsWith("GEMINI")
    ),
    ai_provider_detectado: process.env.ANTHROPIC_API_KEY
      ? "claude"
      : process.env.GOOGLE_API_KEY
      ? "gemini (GOOGLE_API_KEY)"
      : process.env.GOOGLE_GEMINI_API_KEY
      ? "gemini (GOOGLE_GEMINI_API_KEY)"
      : process.env.GEMINI_API_KEY
      ? "gemini (GEMINI_API_KEY)"
      : "NINGUNO — falta configurar la key",
  };

  return NextResponse.json(checks);
}
