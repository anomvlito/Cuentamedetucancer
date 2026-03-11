import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MensajeChat } from "@/lib/types";

type AIProvider = "claude" | "gemini";

function getGoogleKey(): string | undefined {
  return (
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY
  );
}

function getProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  if (getGoogleKey()) return "gemini";
  throw new Error(
    "No hay API key de IA configurada. Agrega ANTHROPIC_API_KEY o GOOGLE_API_KEY en Vercel."
  );
}

/**
 * Genera texto con streaming para la conversación.
 * Llama onChunk con cada fragmento de texto recibido.
 */
export async function streamearConversacion(
  historial: MensajeChat[],
  systemPrompt: string,
  onChunk: (texto: string) => void
): Promise<void> {
  const provider = getProvider();

  if (provider === "claude") {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const mensajes = historial.map((m) => ({
      role: m.rol === "usuario" ? ("user" as const) : ("assistant" as const),
      content: m.contenido,
    }));

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: mensajes,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        onChunk(chunk.delta.text);
      }
    }
    return;
  }

  // Gemini
  const genAI = new GoogleGenerativeAI(getGoogleKey()!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
  });

  // Gemini usa "model" para el asistente, y no acepta el último mensaje en el historial
  const historialGemini = historial.slice(0, -1).map((m) => ({
    role: m.rol === "usuario" ? "user" : "model",
    parts: [{ text: m.contenido }],
  }));

  const ultimoMensaje = historial[historial.length - 1].contenido;
  const chat = model.startChat({ history: historialGemini });
  const result = await chat.sendMessageStream(ultimoMensaje);

  for await (const chunk of result.stream) {
    const texto = chunk.text();
    if (texto) onChunk(texto);
  }
}

/**
 * Genera texto completo (sin streaming) para el informe.
 */
export async function generarTexto(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const provider = getProvider();

  if (provider === "claude") {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });
    const contenido = response.content[0];
    if (contenido.type !== "text") throw new Error("Respuesta inesperada del modelo");
    return contenido.text;
  }

  // Gemini
  const genAI = new GoogleGenerativeAI(getGoogleKey()!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
