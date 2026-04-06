/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ClassicTemplate } from "@/components/pdf/ClassicTemplate";
import type { ResumeData } from "@/components/pdf/ClassicTemplate";
import React from "react";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Types ────────────────────────────────────────────────────────────────────

interface TranslationPayloadExperience {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

interface TranslationPayloadEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface TranslationPayload {
  personal: {
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
  };
  summary: string;
  experience: TranslationPayloadExperience[];
  education: TranslationPayloadEducation[];
  skills: string[];
}

// ─── Translator ───────────────────────────────────────────────────────────────

async function translateResumeData(
  data: ResumeData,
  targetLocale: string,
): Promise<ResumeData> {
  if (targetLocale === "ru") return data;

  const langName = targetLocale === "de" ? "German" : "English";

  function biText(value: any): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[targetLocale] ?? value.en ?? "";
  }

  const rawExp = data.experience.items;
  const rawEdu = data.education.items;

  const payload: TranslationPayload = {
    personal: {
      firstName: data.personal.firstName,
      lastName: data.personal.lastName,
      address: data.personal.address ?? "",
      phone: data.personal.phone ?? "",
    },
    summary: biText(data.summary.text),
    experience: rawExp.map(
      (item): TranslationPayloadExperience => ({
        position: biText(item.position),
        company: item.company,
        startDate: item.startDate,
        endDate: item.endDate ?? "",
        responsibilities: biText(item.responsibilities),
      }),
    ),
    education: rawEdu.map(
      (item): TranslationPayloadEducation => ({
        institution: item.institution,
        degree: biText(item.degree),
        field: biText(item.field),
        startDate: item.startDate,
        endDate: item.endDate,
      }),
    ),
    skills: data.skills.items,
  };

  const prompt = `Translate the following JSON resume data into ${langName}.

CRITICAL RULES — follow all of them exactly:
1. Return ONLY valid JSON, no markdown, no explanation.
2. Do NOT use Cyrillic characters anywhere in the output — every string must use Latin characters only.
3. Personal names (firstName, lastName) must be transliterated to Latin if they are in Cyrillic.
4. Company names and institution names that are in Cyrillic must be either translated to their well-known ${langName} equivalent (e.g. "ТехноСофт" → "TechnoSoft", "МГТУ им. Баумана" → "Bauman Moscow State Technical University") or transliterated to Latin.
5. Translate all other fields (position, responsibilities, degree, field, skills) into ${langName}.
6. Keep dates (startDate, endDate) untranslated.
7. Do not add or remove any JSON keys.

JSON to translate:
${JSON.stringify(payload, null, 2)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const tr = JSON.parse(raw) as TranslationPayload;

  return {
    ...data,
    personal: {
      firstName: tr.personal.firstName,
      lastName: tr.personal.lastName,
      address: tr.personal.address,
      phone: tr.personal.phone,
    },
    summary: { text: tr.summary || null },
    experience: {
      items: rawExp.map((item, i) => ({
        ...item,
        position: tr.experience[i]?.position ?? biText(item.position),
        company: tr.experience[i]?.company ?? item.company,
        responsibilities:
          tr.experience[i]?.responsibilities ?? biText(item.responsibilities),
      })),
    },
    education: {
      items: rawEdu.map((item, i) => ({
        ...item,
        institution: tr.education[i]?.institution ?? item.institution,
        degree: tr.education[i]?.degree ?? biText(item.degree),
        field: tr.education[i]?.field ?? biText(item.field),
      })),
    },
    skills: {
      items: tr.skills,
    },
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") === "de" ? "de" : "en";

  const resume = await prisma.resume.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { order: "asc" } },
      template: true,
      user: { include: { profile: true } },
    },
  });

  if (!resume) {
    return new Response("Not found", { status: 404 });
  }

  function getSection<T>(type: string, fallback: T): T {
    const section = resume!.sections.find((s) => s.type === type);
    return section ? (section.content as T) : fallback;
  }

  let data: ResumeData = {
    email: resume.user.email,
    locale,
    personal: getSection("personal", {
      firstName: "John",
      lastName: "Doe",
      address: "",
      phone: "",
    }),
    summary: getSection("summary", { text: null }),
    experience: getSection("experience", { items: [] }),
    education: getSection("education", { items: [] }),
    skills: getSection("skills", { items: [] }),
  };

  data = await translateResumeData(data, locale);

  // react-pdf's renderToBuffer expects its own ReactElement type which
  // is incompatible with React 18 — cast to any to bypass the conflict.
  const buffer = await renderToBuffer(
    React.createElement(ClassicTemplate, { data }) as any,
  );

  const uint8 = new Uint8Array(buffer);
  const filename = locale === "de" ? "lebenslauf.pdf" : "resume.pdf";

  return new Response(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
