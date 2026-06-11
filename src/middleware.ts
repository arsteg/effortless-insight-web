import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

// Routes that require authentication
const protectedRoutePatterns = [
  '/dashboard',
  '/notices',
  '/tasks',
  '/reports',
  '/team',
  '/settings',
]

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the access token from cookies (for middleware) or check authorization
  // Note: In a real app, you might use httpOnly cookies set by the API
  // For now, we'll check for a session indicator cookie
  const accessToken = request.cookies.get('access_token')?.value

  const isAuthenticated = !!accessToken

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutePatterns.some(
    (pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`)
  )

  // Check if the path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
