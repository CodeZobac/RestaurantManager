import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { routing } from './i18n/routing';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const locale = routing.locales.find(loc => pathname.startsWith(`/${loc}`)) || routing.defaultLocale;

  const protectedPaths = [
    `/${locale}/[restaurantId]/admin/dashboard`,
    `/${locale}/[restaurantId]/admin/tables`,
    `/${locale}/[restaurantId]/admin/profile`,
  ];

  const isOnboardingPath = pathname.startsWith(`/${locale}/onboarding`);
  const isAuthPath = pathname.startsWith(`/${locale}/auth`);

  if (protectedPaths.some(p => new RegExp(p.replace('[restaurantId]', '\\w+')).test(pathname))) {
    if (!session) {
      return NextResponse.redirect(new URL(`/${locale}/auth`, request.url));
    }

    if (!session.user.onboarding_completed || !session.user.restaurant_id) {
      return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url));
    }
  }

  if (isOnboardingPath && session?.user.onboarding_completed && session?.user.restaurant_id) {
    return NextResponse.redirect(new URL(`/${locale}/${session.user.restaurant_id}/admin/dashboard`, request.url));
  }

  if (isAuthPath && session) {
    if (session.user.onboarding_completed && session.user.restaurant_id) {
      return NextResponse.redirect(new URL(`/${locale}/${session.user.restaurant_id}/admin/dashboard`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|.*\..*).*)'
};
