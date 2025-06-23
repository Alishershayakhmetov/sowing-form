import { NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { login, password } = await req.json()
  const user = await prisma.user.findUnique({ where: { login } })

  if (!user) return new NextResponse('User not found', { status: 404 })


  // Check for 6-digit temp password if no real password is set
  const isTemp = password.length === 6 && /^\d{6}$/.test(password) && !user.password
  if (isTemp) {
    if (user?.tempPassword === password) {
      const token = jwt.sign({ id: user.id, login: user.login, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '5m' })
      
      const res = NextResponse.json({ tempPassword: true })
      res.cookies.set('token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 5, // 5 min for temp session
      })
      return res
      
    }
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Permament password login
  if (!user.password || !(await compare(password, user.password))) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const token = jwt.sign({ id: user.id, login: user.login, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '180d' })
  
  const res = NextResponse.json({ success: true })
  res.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 180,
  })

  return res
}