import { createServerClient, type SetAllCookies } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PATHS = ['/saved', '/profile', '/community', '/admin', '/inbox'];
// Routes that are always public
const PUBLIC_PATHS = ['/login', '/auth', '/api', '/offline', '/datenschutz', '/impressum', '/nutzungsbedingungen', '/ki-transparenz'];
// Routes where onboarding must be completed before access
const ONBOARDING_GUARDED_PATHS = ['/', '/saved', '/profile', '/community', '/inbox', '/card'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if path is protected and user is not authenticated
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  if (isProtected && !isPublic && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Force onboarding for authenticated users before entering core app routes
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const requiresOnboarding = ONBOARDING_GUARDED_PATHS.some(p =>
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  );

  if (user && !isOnboardingRoute && requiresOnboarding) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_categories')
      .eq('id', user.id)
      .single();

    if (!profile?.preferred_categories || profile.preferred_categories.length === 0) {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = '/onboarding';
      return NextResponse.redirect(onboardingUrl);
    }
  }

  return supabaseResponse;
}
