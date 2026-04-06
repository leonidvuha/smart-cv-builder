import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

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
    data: { userId: user.id },
  });

  return Response.json({
    sessionId: chatSession.id,
    email: session.user.email,
  });
}
