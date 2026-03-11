import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT_CONVERSACION } from "@/lib/claude/conversacion";
import { streamearConversacion } from "@/lib/ai/provider";
import { MensajeChat } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const historial: MensajeChat[] = body.historial ?? [];

    if (!historial.length) {
      return NextResponse.json(
        { error: "Se requiere historial de mensajes" },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamearConversacion(
            historial,
            SYSTEM_PROMPT_CONVERSACION,
            (texto) => {
              const data = `data: ${JSON.stringify({ texto })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const errMsg =
            error instanceof Error ? error.message : "Error desconocido";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
