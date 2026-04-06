import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ClassicTemplate } from "@/components/pdf/ClassicTemplate";
import type { ResumeData } from "@/components/pdf/ClassicTemplate";
import React from "react";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  // Read locale from ?locale=de or ?locale=en (default: en)
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

  const data: ResumeData = {
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

  // @ts-ignore — react-pdf has incompatible types with React
  const buffer = await renderToBuffer(
    React.createElement(ClassicTemplate as any, { data }),
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