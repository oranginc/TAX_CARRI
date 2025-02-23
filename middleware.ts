import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  
  if (code && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(`/auth/update-password?code=${code}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/',
}
