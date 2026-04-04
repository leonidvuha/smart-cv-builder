import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export const proxy = async (req: NextRequest) => {
  const isProtected = req.nextUrl.pathname.match(/^\/(de|en|uk)\/dashboard/);

  if (isProtected) {
    return auth((authReq) => {
      if (!authReq.auth) {
        const locale = req.nextUrl.pathname.split("/")[1];
        return Response.redirect(new URL(`/${locale}/auth/signin`, req.url));
      }
      return intlMiddleware(req);
    })(req, {} as never);
  }

  return intlMiddleware(req);
};

export const config = {
  matcher: ["/(de|en|uk)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
