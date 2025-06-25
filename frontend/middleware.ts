import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { auth } from './auth';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Handle authentication for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // For API routes, just pass through - let individual routes handle auth
    return;
  }
  
  // Get the locale from the URL
  const locale = request.nextUrl.pathname.split('/')[1];
  
  // Check if the user is accessing admin routes
  if (request.nextUrl.pathname.includes('/admin')) {
    const session = await auth();
    
    if (!session || !session.user) {
      // No session, redirect to home page
      return Response.redirect(new URL(`/${locale}`, request.url));
    }
    
    if (!session.user.restaurant_id) {
      // User has no restaurant, redirect to onboarding
      return Response.redirect(new URL(`/${locale}/onboarding`, request.url));
    }
  }
  
  // Handle internationalization for other routes
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|.*\..*).*)'
};
