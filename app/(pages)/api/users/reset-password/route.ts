/*
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateTempPassword } from '@/lib/generateTempPassword';
import { TokenPayload } from '@/interfaces/interfaces';
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken';
import { UserRole } from '@/utils/roles';

export async function POST(req: Request) {
  const { id } = await req.json();

  const payload: TokenPayload = GetPayloadFromToken(req);

  if (payload.role === UserRole.FARMER) {
    const farmer = await prisma.user.findUnique({
      where: { id: id },
    })

    if (!farmer) {
      return new NextResponse('Farmer not found', { status: 404 })
    }

    if (farmer.id !== payload.id) {
      return new NextResponse('Not Allowed', { status: 401 })
    }

    const tempPassword = generateTempPassword()
    await prisma.user.update({
      where: {id},
      data: {
        password: null,
        tempPassword: tempPassword,
      }
    })

    return NextResponse.json({ id, tempPassword })
  } else if (payload.role === UserRole.HR) {

    const user = await prisma.user.findUnique({
      where: { id: id },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }
    // different update user AND update user is NOT farmer
    if (user.id !== payload.id && user.role !== UserRole.FARMER) {
      return new NextResponse('Not Allowed', { status: 401 })
    }

    const tempPassword = generateTempPassword()
    await prisma.user.update({
      where: {id},
      data: {
        password: null,
        tempPassword: tempPassword,
      }
    })

    return NextResponse.json({ id, tempPassword })

  } else if (payload.role === UserRole.ADMIN) { 
    const user = await prisma.user.findUnique({
      where: { id: id },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // If user is trying to reset another user's password
    if (user.id !== payload.id) {
      // Only ADMIN can reset others' passwords
      if (user.role !== UserRole.ADMIN) {
        return new NextResponse('Not Allowed', { status: 401 })
      }
    }

    const tempPassword = generateTempPassword()
    await prisma.user.update({
      where: {id},
      data: {
        password: null,
        tempPassword: tempPassword,
      }
    })

    return NextResponse.json({ id, tempPassword })

  } else if (payload.role === UserRole.SUPERUSER) {

  } else {
    const farmers = await prisma.user.findMany({
      where: { role: UserRole.FARMER },
      include: {
        farmer: {
          include: {
            crops: true, // include all crops
          },
        },
      },
    })

    console.log(farmers)

    return NextResponse.json({ farmers })
  }
}
*/

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateTempPassword } from '@/lib/generateTempPassword'
import { TokenPayload } from '@/interfaces/interfaces'
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken'
import { UserRole } from '@/utils/roles'

export async function POST(req: Request) {
  const { id } = await req.json()
  const payload: TokenPayload = GetPayloadFromToken(req)

  const targetUser = await prisma.user.findUnique({
    where: { id },
  })

  if (!targetUser) {
    return new NextResponse('User not found', { status: 404 })
  }

  // If user is resetting their own password → always allowed
  if (payload.id === id) {
    return resetPassword(id)
  }

  // FARMER can only reset their own password
  if (payload.role === UserRole.FARMER) {
    return new NextResponse('Not Allowed', { status: 401 })
  }

  // HR can reset FARMER only
  if (payload.role === UserRole.HR) {
    if (targetUser.role !== UserRole.FARMER) {
      return new NextResponse('Not Allowed', { status: 401 })
    }
    return resetPassword(id)
  }

  // ADMIN can reset FARMER, HR, and ADMIN, but not SUPERUSER
  if (payload.role === UserRole.ADMIN) {
    if (targetUser.role === UserRole.SUPERUSER) {
      return new NextResponse('Not Allowed', { status: 401 })
    }
    return resetPassword(id)
  }

  // SUPERUSER can reset SUPERUSER and ADMIN only
  if (payload.role === UserRole.SUPERUSER) {
    if (
      targetUser.role === UserRole.SUPERUSER ||
      targetUser.role === UserRole.ADMIN
    ) {
      return resetPassword(id)
    } else {
      return new NextResponse('Not Allowed', { status: 401 })
    }
  }

  // Deny all other cases
  return new NextResponse('Not Allowed', { status: 401 })
}

// Helper function to reset password
async function resetPassword(userId: number) {
  try {
    const numericId = Number(userId)
    if (!userId || isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return new NextResponse('Invalid ID', { status: 400 })
    }

    const tempPassword = generateTempPassword()
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: null,
        tempPassword,
      },
    })
    return NextResponse.json({ id: userId, tempPassword })
  } catch (err) {
    return new NextResponse('Internal error', { status: 500 })
  }
}
