import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cek apakah pengunjung punya tiket/cookie admin_session
  const session = request.cookies.get('admin_session');

  // Jika mencoba masuk ke /admin tapi tidak punya cookie, lempar ke /login
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Jika sudah login tapi iseng buka halaman /login, kembalikan ke /admin
  if (request.nextUrl.pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// Konfigurasi ini memberitahu middleware agar hanya berjalan di rute ini
export const config = {
  matcher: ['/admin/:path*', '/login'],
};