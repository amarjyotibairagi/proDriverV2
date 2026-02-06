
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/jwt'

// Paths that require Admin Role
const ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // 1. Add Security Headers (HSTS, X-Frame-Options, etc.)
    // HSTS: 1 year, include subdomains
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    response.headers.set('X-Frame-Options', 'DENY') // Prevent clickjacking
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // 2. Authentication & RBAC Check
    const path = request.nextUrl.pathname
    const isProtectedPath = ADMIN_PATHS.some(prefix => path.startsWith(prefix))

    if (isProtectedPath) {
        const token = request.cookies.get('session_token')?.value

        if (!token) {
            // Redirect to login if no token
            return NextResponse.redirect(new URL('/login', request.url))
        }

        const payload = await verifySession(token)

        if (!payload) {
            // Invalid Token
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (payload.role !== 'ADMIN') {
            // Unauthorized Reroute (e.g. to user dashboard)
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
