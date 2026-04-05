import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ClassicTemplate } from "@/components/pdf/ClassicTemplate";
import React from "react";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

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

  const personalSection = resume.sections.find((s) => s.type === "personal");
  const aiSection = resume.sections.find((s) => s.type === "ai_summary");

  const personal = (personalSection?.content as Record<string, string>) ?? {};
  const aiText = (aiSection?.content as { text: string })?.text ?? "";

  const data = {
    firstName: personal.firstName || "John",
    lastName: personal.lastName || "Doe",
    address: personal.address || "",
    phone: personal.phone || "",
    email: resume.user.email,
    aiSummary: aiText,
  };

  // @ts-ignore — react-pdf has incompatible types with React
  const buffer = await renderToBuffer(
    React.createElement(ClassicTemplate as any, { data })
  );

  // Convert Buffer to Uint8Array for Response
  const uint8 = new Uint8Array(buffer);

  return new Response(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="resume.pdf"`,
    },
  });
}