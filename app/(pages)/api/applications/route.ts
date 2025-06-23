// /app/api/applications/route.ts
import mongoClient from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function GET() {
  const applications = await mongoClient
    .collection('applications')
    .find({})
    .sort({ submittedAt: -1 })
    .toArray()

  return NextResponse.json(applications)
}
