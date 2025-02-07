import { type NextRequest, NextResponse } from 'next/server'

export const config = { matcher: ['/auth/signin'] }

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/auth/signin/regular'
  return NextResponse.redirect(url)
}
