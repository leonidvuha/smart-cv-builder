import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: ["de", "en", "ua"],
  defaultLocale: "de",
})

// Export navigation helpers with locale support
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)