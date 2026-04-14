import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Globe, Download } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="flex flex-col items-center">
      <section className="w-full max-w-5xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {t("badge")}
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
          {t("title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-xl">
          {t("subtitle")}
        </p>
        <div className="flex gap-3 mt-2">
          <Button asChild size="lg">
            <Link href="/chat">{t("getStarted")}</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/auth/signin">{t("signIn")}</Link>
          </Button>
        </div>
      </section>

      <section className="w-full bg-muted/40 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("featuresTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-background rounded-xl p-6 border border-border flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{t("featureAiTitle")}</h3>
              <p className="text-muted-foreground text-sm">
                {t("featureAiDesc")}
              </p>
            </div>
            <div className="bg-background rounded-xl p-6 border border-border flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">
                {t("featureGlobalTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("featureGlobalDesc")}
              </p>
            </div>
            <div className="bg-background rounded-xl p-6 border border-border flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">
                {t("featurePdfTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("featurePdfDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-5xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
        <FileText className="w-12 h-12 text-primary" />
        <h2 className="text-3xl font-bold">{t("ctaTitle")}</h2>
        <p className="text-muted-foreground max-w-md">{t("ctaSubtitle")}</p>
        <Button asChild size="lg">
          <Link href="/chat">{t("ctaButton")}</Link>
        </Button>
      </section>
    </main>
  );
}
