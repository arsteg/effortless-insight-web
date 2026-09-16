import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/notices',
  '/calendar',
  '/reports',
  '/settings',
  '/onboarding',
  '/select-plan',
  '/checkout',
]

// CA-specific routes that require CA role
const caRoutes = ['/ca']

// CA routes that should be publicly accessible (for registration)
const caPublicRoutes = ['/ca/register']

// Auth routes that should redirect to dashboard/ca if already authenticated
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

// Public routes that don't require auth
const publicRoutes = [
  '/',
  '/verify-email',
  '/ca-invitation',
  '/privacy',
  '/terms',
  '/oauth',
]

// Helper to decode JWT and extract payload (without verification - just for routing)
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get access token from cookie
  const accessToken = request.cookies.get('access_token')?.value

  // Check if user is authenticated
  const isAuthenticated = !!accessToken

  // Get user role from JWT if authenticated
  let userRole: string | null = null
  if (accessToken) {
    const payload = decodeJwtPayload(accessToken)
    // JWT claims can vary - check common claim names
    userRole =
      (payload?.role as string) ||
      (payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string) ||
      null
  }

  const isCaUser = userRole === 'ca'

  // Check if current path matches any protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if current path is a CA public route (allowed without auth)
  const isCaPublicRoute = caPublicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if current path is a CA route (but not a CA public route)
  const isCaRoute = !isCaPublicRoute && caRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Skip proxy for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Handle auth routes - redirect authenticated users
  if (isAuthRoute) {
    if (isAuthenticated) {
      // Redirect based on user role
      const redirectUrl = isCaUser ? '/ca/clients' : '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    return NextResponse.next()
  }

  // Handle CA routes - require auth and CA role
  if (isCaRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Non-CA users should not access CA routes
    if (!isCaUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  }

  // Handle regular protected routes
  if (isProtectedRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // CA users accessing regular dashboard should be redirected to CA area
    // Exception: allow onboarding, settings, and checkout flows
    const caAllowedDashboardRoutes = [
      '/onboarding',
      '/settings',
      '/select-plan',
      '/checkout',
    ]
    const isAllowedForCa = caAllowedDashboardRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )

    if (isCaUser && !isAllowedForCa) {
      return NextResponse.redirect(new URL('/ca/clients', request.url))
    }

    return NextResponse.next()
  }

  // Public routes - allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
