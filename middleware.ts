import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const type = request.nextUrl.searchParams.get('type')
  
  // Handle password reset code
  if (code && request.nextUrl.pathname === '/') {
    const url = new URL('/auth/update-password', request.url)
    url.searchParams.set('code', code)
    if (type) {
      url.searchParams.set('type', type)
    }
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/auth/update-password',
    '/auth/reset-password',
  ],
}
