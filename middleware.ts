import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  console.log('[MIDDLEWARE] Token:', token)

  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch (err) {
    console.error('[MIDDLEWARE] Token verification failed:', err)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/dashboard', '/form'],
}

/*
// middleware/auth.ts
function requireRole(allowedRoles: Role[]) {
  return async function (req: Request) {
    const token = getTokenFromCookies(req)
    const user = verifyToken(token) // -> { id, role, company }

    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return user;
  };
}
*/