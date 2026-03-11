import { NextRequest, NextResponse } from "next/server";
import {
  SYSTEM_PROMPT_INFORME_ENCUESTA,
  construirPromptEncuesta,
} from "@/lib/encuesta/informe";
import { generarTexto } from "@/lib/ai/provider";
import { createClient } from "@/lib/supabase/server";
import { RespuestaEncuesta } from "@/lib/encuesta/preguntas";
import { Informe } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversacion_id,
      respuestas,
    }: { conversacion_id: string; respuestas: RespuestaEncuesta[] } = body;

    if (!conversacion_id || !respuestas?.length) {
      return NextResponse.json(
        { error: "Se requieren conversacion_id y respuestas" },
        { status: 400 }
      );
    }

    const prompt = construirPromptEncuesta(respuestas);
    const respuesta = await generarTexto(prompt, SYSTEM_PROMPT_INFORME_ENCUESTA);

    const jsonLimpio = respuesta
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const informeData = JSON.parse(jsonLimpio);

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
