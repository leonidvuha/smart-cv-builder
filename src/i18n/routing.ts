import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: ["de", "en", "uk"],
  defaultLocale: "de",
})

// Export navigation helpers with locale support
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)