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
  let paso = "parsing request";
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

    paso = "generando texto con IA";
    const prompt = construirPromptEncuesta(respuestas);
    const respuesta = await generarTexto(prompt, SYSTEM_PROMPT_INFORME_ENCUESTA);

    paso = "parseando JSON del informe";
    const jsonLimpio = respuesta
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const informeData = JSON.parse(jsonLimpio);

    paso = "guardando informe en Supabase";
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
      throw new Error(`Supabase insert error: ${error.message} (code: ${error.code})`);
    }

    paso = "actualizando estado de conversación";
    await supabase
      .from("conversaciones")
      .update({ estado: "completada", completada_en: new Date().toISOString() })
      .eq("id", conversacion_id);

    return NextResponse.json({ informe: informe as Informe });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Error desconocido";
    console.error(`[/api/encuesta] Error en paso "${paso}":`, error);
    return NextResponse.json(
      { error: errMsg, paso },
      { status: 500 }
    );
  }
}
