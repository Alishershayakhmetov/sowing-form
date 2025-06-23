import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken'
import { CropSubmission } from '@/interfaces/interfaces';

export async function POST(req: Request) {
  try {
    const payload = GetPayloadFromToken(req);

    const userData = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        farmer: true
      }
    })

    if (!userData || !userData.farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 })
    }

    const body = await req.json()
    const { data, date } : { data: CropSubmission[]; date?: string } = body

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const submissionDate = date ? new Date(date) : new Date()

    // Normalize to date only (00:00:00) for comparison
    const startOfDay = new Date(submissionDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(submissionDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existing = await prisma.seeding.findFirst({
      where: {
        userId: userData.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Submission for this date already exists' }, { status: 400 })
    }

    // Получаем FarmerCrop по id
    const cropIds = data.map(item => parseInt(item.id))
    const farmerCrops = await prisma.farmerCrop.findMany({
      where: { id: { in: cropIds } }
    })

    const cropMap = new Map(
      farmerCrops.map(crop => [crop.id, crop])
    )

    const createData = data.map((item) => {
      const cropId = parseInt(item.id)
      const crop = cropMap.get(cropId)

      return {
        userId: userData.id,
        amount: parseFloat(item.amount),
        comment: item.comment ? item.comment.slice(0, 255) : null,
        date: submissionDate,
        crop: crop?.subculture || 'Неизвестно',
        company: userData.farmer!.company,
        plan: crop?.plan || 0,
        region: userData.farmer!.region,
        village: userData.farmer!.village
      }
    })

    try {
      await prisma.seeding.createMany({ data: createData })
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Seeding creation error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  } catch (err) {
    if (err instanceof Error) {
      return new NextResponse(err.message, { status: 401 })
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
