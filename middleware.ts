import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protect /admin routes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin')) {
    const user = getSessionUser(request); // Implement session extraction
    if (!user || !user.isAdmin) {
      return NextResponse.redirect('/login');
    }
  }
  return NextResponse.next();
}
