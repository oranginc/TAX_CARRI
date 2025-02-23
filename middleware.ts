import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  
  if (code) {
    // Handle password reset code
    const url = new URL('/auth/update-password', request.url)
    url.searchParams.set('code', code)
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
