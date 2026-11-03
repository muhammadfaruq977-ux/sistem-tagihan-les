import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { password } = await request.json();

  // Cocokkan dengan password di file .env
  if (password === process.env.ADMIN_PASSWORD) {
    // Tanamkan cookie sesi admin selama 1 hari
    cookies().set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 jam
      path: '/',
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Password salah' }, { status: 401 });
}