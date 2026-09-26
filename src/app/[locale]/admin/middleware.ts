// middleware.ts (в корне проекта или внутри src/)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Игнорируем саму страницу логина и статику
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Защищаем все страницы, начинающиеся с /admin
  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(sessionToken, key, { algorithms: ['HS256'] });
      return NextResponse.next();
    } catch {
      // Токен невалиден или истек
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};