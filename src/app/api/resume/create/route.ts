import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  // const sessionId = formData.get("sessionId") as string;
  const templateId = formData.get("templateId") as string;
  const firstName = (formData.get("firstName") as string) || "John";
  const lastName = (formData.get("lastName") as string) || "Doe";
  const address = (formData.get("address") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const chatMessagesRaw = formData.get("chatMessages") as string;
  const chatMessages = JSON.parse(chatMessagesRaw || "[]");

  // Find or create user
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name ?? null,
    },
  });

  // Update user profile with form data
  await prisma.profile.upsert({
    where: { userId: user.id },
    update: { firstName, lastName, address, phone },
    create: { userId: user.id, firstName, lastName, address, phone },
  });

  // Extract AI conversation summary as resume content
  const aiMessages = chatMessages
    .filter((m: { role: string }) => m.role === "assistant")
    .map((m: { content: string }) => m.content)
    .join("\n");

  // Create resume record
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      templateId,
      title: `${firstName} ${lastName} — Resume`,
      locale: "de",
      sections: {
        create: [
          {
            type: "ai_summary",
            order: 1,
            content: { text: aiMessages },
          },
          {
            type: "personal",
            order: 0,
            content: {
              firstName,
              lastName,
              address,
              phone,
            },
          },
        ],
      },
    },
  });

  return Response.json({ resumeId: resume.id });
}
