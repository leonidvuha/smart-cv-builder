import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import type { RawContent, LocalizedContent } from "@/types/resume";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------------------------------------------------------------------------
// Prompt: instructs OpenAI to return a bilingual resume JSON (EN + DE)
// ---------------------------------------------------------------------------
const BILINGUAL_EXTRACTION_PROMPT = `You are a professional resume builder. You will receive raw user data (form fields + chat conversation). Your job is to:

1. Analyze all provided information.
2. Structure it into a complete, professional resume.
3. Return the result in TWO languages: English ("en") and German ("de").

CRITICAL RULES:
- Return ONLY valid JSON. No markdown, no explanations, no extra text.
- The JSON must have exactly two root keys: "en" and "de".
- Each key contains a full resume object with the EXACT structure shown below.
- Do NOT use Cyrillic characters anywhere — every string must use Latin characters only.
- Personal names must be transliterated to Latin if originally in Cyrillic.
- Company and institution names in Cyrillic must be translated or transliterated.
- Dates (startDate, endDate) must stay as-is, do not translate them.
- If a field is unknown or not provided, use null for text or [] for arrays.
- Write professional, polished text — improve phrasing where appropriate.
- Summary should be 2-3 sentences highlighting key qualifications.
- Responsibilities should be concise bullet-point style text.

Required JSON structure:
{
  "en": {
    "personal": {
      "firstName": "string",
      "lastName": "string",
      "phone": "string",
      "address": "string"
    },
    "summary": {
      "text": "string or null"
    },
    "experience": {
      "items": [
        {
          "company": "string",
          "position": "string",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM or null if current",
          "responsibilities": "string"
        }
      ]
    },
    "education": {
      "items": [
        {
          "institution": "string",
          "degree": "string",
          "field": "string",
          "startDate": "YYYY",
          "endDate": "YYYY"
        }
      ]
    },
    "skills": {
      "items": ["string"]
    }
  },
  "de": {
    "personal": { "...same structure, translated to German..." },
    "summary": { "...translated..." },
    "experience": { "...translated..." },
    "education": { "...translated..." },
    "skills": { "...skills stay the same (technical terms)..." }
  }
}`;

// ---------------------------------------------------------------------------
// POST /api/resume/create
// Accepts raw user data, sends to OpenAI, saves bilingual result to DB.
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  // --- Auth check ---
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Parse request body ---
  let body: {
    rawContent: RawContent;
    chatSessionId?: string;
    photoUrl?: string;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { rawContent, chatSessionId, photoUrl } = body;

  if (!rawContent?.form?.firstName || !rawContent?.form?.lastName) {
    return Response.json(
      { error: "firstName and lastName are required" },
      { status: 400 },
    );
  }

  // --- Ensure user exists ---
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name ?? null,
    },
  });

  // --- Update profile with form data ---
  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      firstName: rawContent.form.firstName,
      lastName: rawContent.form.lastName,
      phone: rawContent.form.phone,
    },
    create: {
      userId: user.id,
      firstName: rawContent.form.firstName,
      lastName: rawContent.form.lastName,
      phone: rawContent.form.phone,
    },
  });

  // --- Create resume with "processing" status ---
  const title = `${rawContent.form.firstName} ${rawContent.form.lastName} — Resume`;

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      chatSessionId: chatSessionId || null,
      title,
      photoUrl: photoUrl || null,
      status: "processing",
      rawContent: rawContent as object,
    },
  });

  // --- Call OpenAI to get bilingual structured data ---
  try {
    const userDataMessage = [
      `Form data:`,
      `- Name: ${rawContent.form.firstName} ${rawContent.form.lastName}`,
      `- Phone: ${rawContent.form.phone}`,
      `- Email: ${rawContent.form.email}`,
      ``,
      `Chat conversation (user's free-form input):`,
      rawContent.chatText,
    ].join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: BILINGUAL_EXTRACTION_PROMPT },
        { role: "user", content: userDataMessage },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as LocalizedContent;

    // --- Validate that both locales are present ---
    if (!parsed.en || !parsed.de) {
      throw new Error("OpenAI response missing 'en' or 'de' key");
    }

    // --- Success: save localized content, set status "ready" ---
    const updated = await prisma.resume.update({
      where: { id: resume.id },
      data: {
        localizedContent: parsed as object,
        status: "ready",
      },
    });

    return Response.json({
      resumeId: updated.id,
      status: updated.status,
    });
  } catch (err) {
    // --- OpenAI or parsing failed: mark as "error" ---
    console.error(`[resume/create] OpenAI failed for resume ${resume.id}:`, err);

    await prisma.resume.update({
      where: { id: resume.id },
      data: { status: "error" },
    });

    return Response.json(
      {
        resumeId: resume.id,
        status: "error",
        error: err instanceof Error ? err.message : "AI processing failed",
      },
      { status: 502 },
    );
  }
}
