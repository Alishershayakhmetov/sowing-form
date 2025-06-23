import { ObjectId } from 'mongodb'
import mongoClient from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { status }: { status: 'approved' | 'declined' } = await req.json()

  if (!['approved', 'declined'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const application = await mongoClient.collection('applications').findOne({ _id: new ObjectId(params.id) })

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // If declined, just update status in MongoDB
  if (status === 'declined') {
    await mongoClient.collection('applications').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { status } }
    )

    return NextResponse.json({ success: true, message: 'Application declined' })
  }

  // If approved, update corresponding rows in Postgres
  const updates = application.newData.map((item: any) => {
    return prisma.seeding.update({
      where: { id: item.existingSeedingId },
      data: {
        amount: item.amount,
        comment: item.comment,
        date: new Date(item.date),
        crop: item.crop,
        plan: item.plan,
        company: item.company,
        region: item.region,
        village: item.village,
      }
    })
  })

  try {
    await prisma.$transaction(updates)

    await mongoClient.collection('applications').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { status } }
    )

    return NextResponse.json({ success: true, message: 'Application approved and data updated' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to apply updates' }, { status: 500 })
  }
}
