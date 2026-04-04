import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { templateId } = await req.json();

  // Find or create user
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name ?? null,
    },
  });

  const chatSession = await prisma.chatSession.create({
    data: {
      userId: user.id,
      templateId: templateId || "template-1",
    },
  });

  return Response.json({ sessionId: chatSession.id });
}
