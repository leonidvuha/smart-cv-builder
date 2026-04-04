import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"

export default function HomePage() {
  const t = useTranslations("home")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
      <p className="text-xl text-gray-400 mb-8">{t("subtitle")}</p>
      <Link
        href="/auth/signin"
        className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100"
      >
        Get started
      </Link>
    </main>
  )
}