import OpenAI from "openai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Locale-aware system prompt for resume collection
const LOCALE_NAMES: Record<string, string> = {
  de: "German",
  en: "English",
  uk: "Ukrainian",
};

function buildSystemPrompt(locale: string): string {
  const lang = LOCALE_NAMES[locale] || "English";

  return `You are a professional resume assistant helping users create a Lebenslauf (German resume) and international CV.

Your job is to collect the following information through friendly conversation:

- Work experience: company, position, start/end dates, responsibilities
- Based on work experience — suggest relevant skills
- Education: institution, degree, field, dates
- Professional summary

Do NOT ask for: full name, address, phone number, photo, birth day, or gender — the user will fill those in separately.

Ask one or two questions at a time. Be friendly and professional.

IMPORTANT: You MUST respond strictly in ${lang}. All your messages must be in ${lang}, regardless of what language the user writes in.

When you have collected all information, summarize it and confirm with the user.`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, sessionId, locale } = await req.json();

  // Save user message to DB
  if (sessionId) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: "user",
          content: lastMessage.content,
        },
      });
    }
  }

  // Build locale-aware system prompt
  const systemPrompt = buildSystemPrompt(locale || "en");

  // Create streaming response
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });

  return new Response(
    new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          fullResponse += text;
          controller.enqueue(new TextEncoder().encode(text));
        }

        // Save AI response to DB
        if (sessionId) {
          await prisma.chatMessage.create({
            data: {
              sessionId,
              role: "assistant",
              content: fullResponse,
            },
          });
        }

        controller.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
}
