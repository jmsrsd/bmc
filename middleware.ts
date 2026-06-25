import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function unauthorized(): Response {
  return new Response('Unauthorized', { status: 401 })
}

const SESSION_COOKIE = 'bmc_session'

const publicPaths = [
  '/api/login',
  '/api/logout',
  '/_next/static',
  '/favicon.ico',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const session = request.cookies.get(SESSION_COOKIE)
  if (!session || session.value !== 'authenticated') {
    return unauthorized()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
