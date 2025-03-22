import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Login sayfasına erişim kontrolü
  if (request.nextUrl.pathname === '/login') {
    const session = request.cookies.get('session');
    
    // Eğer kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    if (session?.value === 'authenticated') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
  }

  // Diğer sayfalara erişim kontrolü
  const session = request.cookies.get('session');
  
  // Eğer kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!session || session.value !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Middleware'in hangi path'lerde çalışacağını belirt
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 