import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT_INFORME, construirPromptInforme } from "@/lib/claude/informe";
import { generarTexto } from "@/lib/ai/provider";
import { createClient } from "@/lib/supabase/server";
import { MensajeChat, Informe } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversacion_id,
      historial,
    }: { conversacion_id: string; historial: MensajeChat[] } = body;

    if (!conversacion_id || !historial?.length) {
      return NextResponse.json(
        { error: "Se requieren conversacion_id e historial" },
        { status: 400 }
      );
    }

    const prompt = construirPromptInforme(historial);
    const respuesta = await generarTexto(prompt, SYSTEM_PROMPT_INFORME);

    // Limpiar posibles bloques de código markdown del JSON
    const jsonLimpio = respuesta
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const informeData = JSON.parse(jsonLimpio);

    // Guardar en Supabase
    const supabase = await createClient();

    const { data: informe, error } = await supabase
      .from("informes")
      .insert({
        conversacion_id,
        resumen: informeData.resumen,
        dimension_prioritaria: informeData.dimension_prioritaria,
        dimensiones: informeData.dimensiones,
        asuntos_pendientes: informeData.asuntos_pendientes,
        intervenciones_sugeridas: informeData.intervenciones_sugeridas,
        citas_clave: informeData.citas_clave,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al guardar informe: ${error.message}`);
    }

    // Marcar conversación como completada
    await supabase
      .from("conversaciones")
      .update({ estado: "completada", completada_en: new Date().toISOString() })
      .eq("id", conversacion_id);

    return NextResponse.json({ informe: informe as Informe });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
