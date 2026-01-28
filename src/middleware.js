import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. Ambil path yang sedang diakses
  const path = request.nextUrl.pathname;
  
  // 2. Ambil Cookie (Data Login)
  const userRole = request.cookies.get('user_role')?.value; // admin atau owner
  
  // --- ATURAN 1: PROTEKSI HALAMAN OWNER ---
  // Jika akses halaman /owner... tapi tidak punya role 'owner'
  if (path.startsWith('/owner')) {
    if (userRole !== 'owner') {
      // Tendang ke halaman login
      return NextResponse.redirect(new URL('/login-admin', request.url));
    }
  }

  // --- ATURAN 2: PROTEKSI HALAMAN ADMIN ---
  // Jika akses halaman /admin... tapi tidak punya role (belum login sama sekali)
  if (path.startsWith('/admin')) {
    if (!userRole) {
      // Tendang ke halaman login
      return NextResponse.redirect(new URL('/login-admin', request.url));
    }
  }

  // --- ATURAN 3: JIKA SUDAH LOGIN, JANGAN KASIH MASUK HALAMAN LOGIN LAGI ---
  if (path === '/login-admin') {
    if (userRole === 'owner') {
      return NextResponse.redirect(new URL('/owner/dashboard', request.url));
    } else if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Tentukan halaman mana saja yang mau dicek middleware
export const config = {
  matcher: [
    '/owner/:path*', 
    '/admin/:path*',
    '/login-admin'
  ],
};