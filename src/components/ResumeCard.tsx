"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Resume {
  id: string;
  title: string;
  updatedAt: Date;
  template: { name: string };
}

export function ResumeCard({ resume }: { resume: Resume }) {
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${resume.title}"?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/resume/${resume.id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleted(true);
    } else {
      alert("Failed to delete. Try again.");
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
          <h3 className="font-medium">{resume.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {resume.template.name} •{" "}
            {new Date(resume.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href={`/api/resume/${resume.id}/pdf`} target="_blank">
            <Download className="w-3.5 h-3.5" />
            PDF
          </Link>
        </Button>

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
