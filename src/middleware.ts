import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;
  const token = request.cookies.get('admin_auth')?.value;

  // Protect all /admin routes except /admin/login
  if (path.startsWith('/admin') && path !== '/admin/login') {
    if (token !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect aspirasi GET & PUT (admin only reads/updates data, POST is public)
  if (path === '/api/aspirasi' && ['GET', 'PUT'].includes(method)) {
    if (token !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // /api/aspirasi/track GET is PUBLIC — no auth needed

  // Protect articles mutation (POST/PUT/DELETE admin only, GET is public)
  if (path === '/api/articles' && ['POST', 'PUT', 'DELETE'].includes(method)) {
    if (token !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protect chatlogs GET (admin only reads logs, POST is public for saving)
  if (path === '/api/chatlogs' && method === 'GET') {
    if (token !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protect feedback GET (admin only reads feedback, POST is public)
  if (path === '/api/feedback' && method === 'GET') {
    if (token !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/aspirasi', '/api/articles', '/api/chatlogs', '/api/feedback'],
};
