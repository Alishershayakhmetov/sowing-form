import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TokenPayload } from '@/interfaces/interfaces'
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken'
import { UserRole } from '@/utils/roles'

export async function GET(req: Request) {
  try {
    const payload: TokenPayload = GetPayloadFromToken(req)

    if (payload.role !== UserRole.FARMER) {
      return new NextResponse('Forbidden', { status: 405 })
    }

    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')

    const targetDate = dateParam ? new Date(dateParam) : new Date()

    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const seedings = await prisma.seeding.findMany({
      where: {
        userId: payload.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const submitted = seedings.length > 0

    return NextResponse.json({
      submitted,
      data: submitted ? seedings : [] // null
    })
  } catch (err) {
    if (err instanceof Error) {
      return new NextResponse(err.message, { status: 401 })
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
