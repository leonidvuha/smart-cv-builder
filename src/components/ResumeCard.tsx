"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FileText, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ResumeStatus } from "@/types/resume";

interface Resume {
  id: string;
  title: string;
  status: ResumeStatus;
  updatedAt: Date;
}

export function ResumeCard({ resume }: { resume: Resume }) {
  const t = useTranslations("resumeCard");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    if (!confirm(t("deleteConfirm", { title: resume.title }))) return;
    setDeleting(true);
    const res = await fetch(`/api/resume/${resume.id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleted(true);
    } else {
      alert(t("deleteFailed"));
      setDeleting(false);
    }
  }

  if (deleted) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{resume.title}</h3>
            {resume.status === "processing" && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t("processing")}
              </Badge>
            )}
            {resume.status === "error" && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertCircle className="w-3 h-3" />
                {t("error")}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(resume.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {resume.status === "processing" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t("generating")}</span>
          </div>
        )}

        {resume.status === "ready" && (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/api/resume/${resume.id}/pdf?locale=de`}
                target="_blank"
              >
                🇩🇪 DE
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/api/resume/${resume.id}/pdf?locale=en`}
                target="_blank"
              >
                🇬🇧 EN
              </Link>
            </Button>
          </>
        )}

        {resume.status === "error" && (
          <span className="text-xs text-destructive">
            {t("generationFailed")}
          </span>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
