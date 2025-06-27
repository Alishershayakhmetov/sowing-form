import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  console.log('[MIDDLEWARE] Token:', token)

  if (!token) return RedirectToLogin(req)

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch (err) {
    RedirectToLogin(req)
  }
}

export const config = {
  matcher: ['/dashboard', '/form', '/control-panel'],
}

function RedirectToLogin(req: NextRequest) {
  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('unauthorized', '1')
  return NextResponse.redirect(loginUrl)
}