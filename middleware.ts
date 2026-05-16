// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const AUTH_ROUTES = ['/dashboard', '/cart', '/learn', '/payment']
const ADMIN_ROUTES = ['/admin']
const PUBLIC_ONLY_ROUTES = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('firebase-token')?.value

  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  const isPublicOnly = PUBLIC_ONLY_ROUTES.some(r => pathname.startsWith(r))

  // Redirect logged-in users away from login page
  if (isPublicOnly && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login
  if ((isAuthRoute || isAdminRoute) && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cart/:path*',
    '/learn/:path*',
    '/payment/:path*',
    '/admin/:path*',
    '/login',
  ],
}
