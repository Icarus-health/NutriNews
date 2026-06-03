import { createServerClient, type SetAllCookies } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PATHS = ['/saved', '/profile', '/community', '/admin', '/inbox'];
// Routes that are always public
const PUBLIC_PATHS = ['/login', '/auth', '/api', '/offline', '/datenschutz', '/impressum', '/nutzungsbedingungen', '/ki-transparenz'];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  // Fast path: anonymous visitors (no Supabase auth cookie) on non-protected
  // routes don't need a getUser() round-trip to Supabase Auth on every
  // navigation. Sessions for logged-in users are still validated/refreshed
  // below because their requests carry the sb-*-auth-token cookie.
  const hasAuthCookie = request.cookies
    .getAll()
    .some(c => c.name.startsWith('sb-') && c.name.includes('auth-token'));
  if (!isProtected && !hasAuthCookie) {
    return NextResponse.next({ request });
  }

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

  if (isProtected && !isPublic && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
