import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CropSubmission, TokenPayload } from '@/interfaces/interfaces'
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken'
import mongoClient from '@/lib/mongodb'

export async function POST(req: Request) {
  try {
    const payload: TokenPayload = GetPayloadFromToken(req)
    const { data, date }: { data: CropSubmission[], date: string } = await req.json()

    if (!Array.isArray(data) || !date) {
      return NextResponse.json({ error: 'Invalid data or date' }, { status: 400 })
    }

    const userData = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        farmer: {
          include: { crops: true }
        }
      }
    })

    if (!userData || !userData.farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 })
    }

    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const existingSeedings = await prisma.seeding.findMany({
      where: {
        userId: userData.id,
        date: {
          gte: targetDate,
          lt: nextDay
        }
      }
    })

    const cropIds = data.map(item => parseInt(item.id))
    const farmerCrops = await prisma.farmerCrop.findMany({
      where: { id: { in: cropIds } }
    })

    const cropMap = new Map(farmerCrops.map(crop => [crop.id, crop]))

    const createData = data.map((item) => {
      const cropId = parseInt(item.id)
      const crop = cropMap.get(cropId)

      return {
        userId: userData.id,
        amount: parseFloat(item.amount),
        comment: item.comment ? item.comment.slice(0, 255) : null,
        date: targetDate,
        crop: crop?.subculture || 'Неизвестно',
        company: userData.farmer!.company,
        plan: crop?.plan || 0,
        region: userData.farmer!.region,
        village: userData.farmer!.village
      }
    })

    if (existingSeedings.length > 0) {
      // Match new data with existing seeding by crop name (or adjust logic as needed)
      const existingMap = new Map<string, typeof existingSeedings[number]>()
      for (const row of existingSeedings) {
        existingMap.set(row.crop, row)
      }

      const enrichedCreateData = createData.map(item => {
        const existing = existingMap.get(item.crop)
        return {
          ...item,
          existingSeedingId: existing?.id || null
        }
      })

      await mongoClient.collection('applications').insertOne({
        userId: userData.id,
        type: 'seeding_update',
        submittedAt: new Date(),
        status: 'pending',
        targetDate,
        oldData: existingSeedings,
        newData: enrichedCreateData,
        farmer: {
          company: userData.farmer.company,
          region: userData.farmer.region,
          village: userData.farmer.village
        }
      })

      return NextResponse.json({ success: false, applicationCreated: true })
    }

    return NextResponse.json({ success: false, message: 'No existing seedings, nothing to update.' })

  } catch (err) {
    if (err instanceof Error) {
      return new NextResponse(err.message, { status: 401 })
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
