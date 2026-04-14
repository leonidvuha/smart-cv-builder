import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, User } from "lucide-react";
import { ResumeCard } from "@/components/ResumeCard";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/signin");

  const t = await getTranslations("dashboard");
  const { created } = await searchParams;

  // Get user with profile and resumes
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: true,
      resumes: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  const profile = user?.profile;
  const resumes = user?.resumes ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Success banner */}
      {created && (
        <div className="mb-6 bg-primary/10 border border-primary/30 text-primary rounded-xl px-5 py-3 text-sm flex items-center gap-2">
          ✓ {t("successBanner")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT — Profile card */}
        <div className="md:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>

            <div className="text-center">
              <h2 className="font-semibold text-lg">
                {profile?.firstName ||
                  session.user.name?.split(" ")[0] ||
                  "John"}{" "}
                {profile?.lastName || session.user.name?.split(" ")[1] || "Doe"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {session.user.email}
              </p>
            </div>

            <Separator />

            <div className="w-full space-y-2 text-sm">
              {profile?.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("phone")}</span>
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("address")}</span>
                  <span>{profile.address}</span>
                </div>
              )}
              {!profile?.phone && !profile?.address && (
                <p className="text-muted-foreground text-center text-xs">
                  {t("noDetails")}
                </p>
              )}
            </div>

            <Separator />

            <Button asChild className="w-full gap-2">
              <Link href="/chat">
                <Plus className="w-4 h-4" />
                {t("newResume")}
              </Link>
            </Button>
          </div>
        </div>

        {/* RIGHT — Resumes list */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <Badge variant="secondary">
              {resumes.length} {t("total")}
            </Badge>
          </div>

          {resumes.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
              <FileText className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground">{t("noResumes")}</p>
              <Button asChild>
                <Link href="/chat">{t("createFirst")}</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
