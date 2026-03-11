import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  SYSTEM_PROMPT_CONVERSACION,
  construirMensajesParaClaude,
} from "@/lib/claude/conversacion";
import { MensajeChat } from "@/lib/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    const mensajes = construirMensajesParaClaude(historial);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: SYSTEM_PROMPT_CONVERSACION,
            messages: mensajes,
          });

          for await (const chunk of response) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const data = `data: ${JSON.stringify({ texto: chunk.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Error desconocido";
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
