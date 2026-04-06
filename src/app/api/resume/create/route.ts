import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI();

const EXTRACTION_PROMPT = `You are a resume data extractor. Based on the conversation history, extract the candidate's information and return ONLY a valid JSON object. No markdown, no explanations, just raw JSON.

Text fields that appear in the resume (summary, position, responsibilities, degree, field) must be bilingual objects with "de" and "en" keys.
Names, companies, institutions, dates, phone, address, skills — stay as plain strings.

Required format:
{
  "summary": {
    "de": "Kurze professionelle Zusammenfassung auf Deutsch (2-3 Sätze)",
    "en": "Short professional summary in English (2-3 sentences)"
  },
  "experience": [
    {
      "company": "company name",
      "position": {
        "de": "Berufsbezeichnung auf Deutsch",
        "en": "Job title in English"
      },
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or null if current",
      "responsibilities": {
        "de": "Aufgaben und Erfolge auf Deutsch",
        "en": "Responsibilities and achievements in English"
      }
    }
  ],
  "education": [
    {
      "institution": "school or university name",
      "degree": {
        "de": "Abschluss auf Deutsch",
        "en": "Degree in English"
      },
      "field": {
        "de": "Studienrichtung auf Deutsch",
        "en": "Field of study in English"
      },
      "startDate": "YYYY",
      "endDate": "YYYY"
    }
  ],
  "skills": ["skill1", "skill2"]
}

If a field is unknown, use null for objects or [] for arrays. Always return valid JSON.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const templateId = formData.get("templateId") as string;
  const firstName = (formData.get("firstName") as string) || "John";
  const lastName = (formData.get("lastName") as string) || "Doe";
  const address = (formData.get("address") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const chatMessagesRaw = formData.get("chatMessages") as string;
  const chatMessages: { role: string; content: string }[] = JSON.parse(
    chatMessagesRaw || "[]",
  );

  // --- Step 1: Final OpenAI call to extract structured JSON ---
  let extractedData = {
    summary: null as string | null,
    experience: [] as object[],
    education: [] as object[],
    skills: [] as string[],
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        ...chatMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        {
          role: "user",
          content:
            "Now extract all the resume data from our conversation and return the JSON.",
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    extractedData = JSON.parse(raw);
  } catch (err) {
    console.error("OpenAI extraction failed:", err);
    // Continue with empty data — resume still gets created
  }

  // --- Step 2: Upsert user and profile ---
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name ?? null,
    },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: { firstName, lastName, address, phone },
    create: { userId: user.id, firstName, lastName, address, phone },
  });

  // --- Step 3: Save resume with structured sections ---
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      templateId,
      title: `${firstName} ${lastName} — Resume`,
      locale: "de",
      sections: {
        create: [
          {
            type: "personal",
            order: 0,
            content: { firstName, lastName, address, phone },
          },
          {
            type: "summary",
            order: 1,
            content: { text: extractedData.summary },
          },
          {
            type: "experience",
            order: 2,
            content: { items: extractedData.experience },
          },
          {
            type: "education",
            order: 3,
            content: { items: extractedData.education },
          },
          {
            type: "skills",
            order: 4,
            content: { items: extractedData.skills },
          },
        ],
      },
    },
  });

  return Response.json({ resumeId: resume.id });
}
