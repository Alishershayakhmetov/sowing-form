import { NextResponse } from 'next/server'
import { hash } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { TokenPayload } from '@/interfaces/interfaces'
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken'

export async function POST(req: Request) {
  try {
    const payload: TokenPayload = GetPayloadFromToken(req);

    const { newPassword } = await req.json()
    if (!newPassword || newPassword.length < 8) {
      return new NextResponse('Пароль слишком короткий', { status: 400 })
    }

    const hashed = await hash(newPassword, 10)

    await prisma.user.update({
      where: { id: payload.id },
      data: {
        password: hashed,
        tempPassword: null,
      },
    })


    const newToken = jwt.sign({ id: payload.id, login: payload.login, role: payload.role }, process.env.JWT_SECRET!, { expiresIn: '180d' })
    const res = NextResponse.json({ success: true })
    res.cookies.set('token', newToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 180,
    })

    return res
  } catch (err) {
    if (err instanceof Error) {
      return new NextResponse(err.message, { status: 401 })
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
