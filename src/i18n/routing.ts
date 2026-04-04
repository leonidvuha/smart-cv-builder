import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  // Supported locales
  locales: ["de", "en", "uk"],

  // Default locale
  defaultLocale: "de",
})