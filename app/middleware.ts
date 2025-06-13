
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key-change-in-production';

function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes, static files, etc.
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;
  const isAuthPage = pathname.startsWith('/auth');
  const isRootPage = pathname === '/';

  // If no token and not on auth page, redirect to login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If token exists, assume it's valid for now (we'll verify on the server side)
  if (token) {
    // If token exists and on auth page, redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If token exists and on root page, redirect to dashboard
    if (isRootPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow all other requests to continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)',],
};
