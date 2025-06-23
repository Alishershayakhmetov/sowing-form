import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '@/interfaces/interfaces';
import { UserRole } from '@/utils/roles';
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' // Use a secure .env value


/*
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { 
        id: parseInt(user.id) 
    },
    select: {
      email: true,
      name: true,
      surname: true,
      company: true,
      plan: true,
      region: true,
      village: true,
      crop: true,
    },
  })

  return NextResponse.json(dbUser)
}
*/
/*
export async function PUT(req: NextRequest) {
  const user = await getUserFromToken(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()

  const updated = await prisma.user.update({
    where: { id: parseInt(user.id) },
    data: {
      name: data.name,
      surname: data.surname,
      company: data.company,
      plan: data.plan,
      region: data.region,
      village: data.village,
      crop: data.crop,
    },
  })

  return NextResponse.json(updated)
}

export async function POST(req: Request) {
  const requester = await requireRole(['ADMIN', 'HR'])(req)
  const body = await req.json()

  // Check role restrictions
  if (requester.role === 'HR' && body.role !== 'FARMER') {
    return NextResponse.json({ error: 'HR can only create FARMER users' }, { status: 403 })
  }

  const tempPass = generateTempPassword();
  const hashed = await hash(tempPass, 10)

  const newUser = await prisma.user.create({
    data: {
      login: body.login,
      password: hashed,
      tempPassword: hashed,
      name: body.name,
      surname: body.surname,
      role: body.role,
      farmer: body.role === 'FARMER' ? {
        create: {
          company: requester.company,
          crop: '',
          plan: 0,
          region: '',
          village: ''
        }
      } : undefined,
    }
  })

  return NextResponse.json({ success: true, userId: newUser.id })
}
*/

export async function GET(req: NextRequest) {
  try {
    const payload: TokenPayload = GetPayloadFromToken(req);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        farmer: {
          include: {
            crops: true
          }
        },
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role-based filtering
    if (user.role === UserRole.FARMER && user.farmer) {
      return NextResponse.json({
        id: user.id,
        login: user.login,
        name: user.name,
        surname: user.surname,
        phoneNumber: user.phoneNumber,
        company: user.farmer.company,
        region: user.farmer.region,
        district: user.farmer.district,
        ruralDistrict: user.farmer.ruralDistrict,
        village: user.farmer.village,
        crops: user.farmer.crops.map(crop => ({
          culture: crop.culture,
          subculture: crop.subculture,
          plan: crop.plan
        })),
        role: user.role
      });
    }

    if (user.role === UserRole.HR) {
      return NextResponse.json({
        id: user.id,
        login: user.login,
        name: user.name,
        surname: user.surname,
        phoneNumber: user.phoneNumber,
        role: user.role
      });
    }

    if (user.role === UserRole.ADMIN) {
      return NextResponse.json({
        id: user.id,
        login: user.login,
        name: user.name,
        surname: user.surname,
        phoneNumber: user.phoneNumber,
        role: user.role
      });
    }

    if(user.role === UserRole.SUPERUSER) {
      return NextResponse.json({
        id: user.id,
        login: user.login,
        name: user.name,
        surname: user.surname,
        role: user.role
      });
    }

    return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
  } catch (err) {
    if (err instanceof Error) {
      return new NextResponse(err.message, { status: 401 })
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
