/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ClassicTemplate } from "@/components/pdf/ClassicTemplate";
import type { LocalizedContent, ResumeLocale } from "@/types/resume";
import { getResumeByLocale } from "@/types/resume";
import React from "react";

// ---------------------------------------------------------------------------
// GET /api/resume/[id]/pdf?locale=en|de
// Reads pre-translated data from DB and renders PDF instantly — no OpenAI.
// ---------------------------------------------------------------------------
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
  const locale: ResumeLocale =
    searchParams.get("locale") === "de" ? "de" : "en";

  // --- Fetch resume with user email for ownership check ---
  const resume = await prisma.resume.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });

  if (!resume) {
    return Response.json({ error: "Resume not found" }, { status: 404 });
  }

  // --- Check that resume belongs to the authenticated user ---
  // Compare by email because session.user.id may not match Prisma user.id
  if (resume.user.email !== session.user.email) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // --- Check status: only "ready" resumes have localized content ---
  if (resume.status !== "ready" || !resume.localizedContent) {
    const message =
      resume.status === "processing"
        ? "Resume is still being generated. Please wait."
        : resume.status === "error"
          ? "Resume generation failed. Please try again."
          : "Resume is not ready yet.";

    return Response.json(
      { error: message, status: resume.status },
      { status: 400 },
    );
  }

  // --- Extract the requested locale from stored bilingual data ---
  const localized = resume.localizedContent as unknown as LocalizedContent;
  const data = getResumeByLocale(localized, locale);

  // --- Render PDF ---
  // react-pdf's renderToBuffer expects its own ReactElement type which
  // is incompatible with React 18 — cast to any to bypass the conflict.
  const buffer = await renderToBuffer(
    React.createElement(ClassicTemplate, {
      data,
      locale,
      email: session.user.email,
    }) as any,
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
