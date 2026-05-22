import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (!pathname.startsWith('/api/')) return

  const apiUrl = process.env.API_URL || 'http://localhost:3001'
  const path = pathname.replace('/api', '')
  const url = new URL(`${path}${search}`, apiUrl)
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: '/api/:path*',
}
