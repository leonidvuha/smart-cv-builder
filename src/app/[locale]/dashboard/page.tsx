import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, Download, User } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/signin");

  const { created } = await searchParams;

  // Get user with profile and resumes
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: true,
      resumes: {
        orderBy: { updatedAt: "desc" },
        include: { template: true },
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
          ✓ Your resume was created successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT — Profile card */}
        <div className="md:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4">
            {/* Avatar */}
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
                  <span className="text-muted-foreground">Phone</span>
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span>{profile.address}</span>
                </div>
              )}
              {!profile?.phone && !profile?.address && (
                <p className="text-muted-foreground text-center text-xs">
                  No details yet
                </p>
              )}
            </div>

            <Separator />

            <Button asChild className="w-full gap-2">
              <Link href="/templates">
                <Plus className="w-4 h-4" />
                New Resume
              </Link>
            </Button>
          </div>
        </div>

        {/* RIGHT — Resumes list */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Resumes</h1>
            <Badge variant="secondary">{resumes.length} total</Badge>
          </div>

          {resumes.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
              <FileText className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                You haven&apos;t created any resumes yet.
              </p>
              <Button asChild>
                <Link href="/templates">Create your first resume</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{resume.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {resume.template.name} •{" "}
                        {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <Link href={`/api/resume/${resume.id}/pdf`} target="_blank">
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
