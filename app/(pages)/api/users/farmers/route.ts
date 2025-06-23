import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { farmerPUT, TokenPayload } from '@/interfaces/interfaces'
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken'
import { UserRole } from '@/utils/roles'

/*
export async function GET(req: Request) {
  const requester = await requireRole(['HR'])(req)

  const farmers = await prisma.user.findMany({
    where: {
      role: 'FARMER',
      farmer: {
        company: requester.company
      }
    },
    select: {
      id: true,
      login: true,
      name: true,
      surname: true,
      farmer: true
    }
  })

  return NextResponse.json({ farmers })
}
*/

export async function GET(req: Request) {
  const payload: TokenPayload = GetPayloadFromToken(req)

  if (payload.role === UserRole.FARMER) {
    const farmer = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        farmer: {
          include: {
            crops: true,
          },
        },
      },
    })

    if (!farmer) {
      return new NextResponse('Farmer not found', { status: 404 })
    }

    return NextResponse.json(farmer)
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
/*
export async function GET() {
  const farmers = await prisma.user.findMany({
    where: { role: 'FARMER' },
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
*/
export async function POST(req: Request) {
  try {
    const data = await req.json()

    const {
      login,
      name,
      surname,
      phoneNumber,
      company,
      region,
      district,
      ruralDistrict,
      village,
      crops, // [ {category, subculture, plan}, ... ]
    } = data

    // Validate required fields
    const requiredFields = { login, name, surname, company };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        return new NextResponse(`Поле "${key}" обязательно для заполнения`, { status: 400 });
      }
    }

    // 1. create user with temp 6-digit password
    const tempPassword = Math.floor(100000 + Math.random() * 900000).toString()

    const user = await prisma.user.create({
      data: {
        login,
        name,
        surname,
        phoneNumber,
        tempPassword: tempPassword,
        role: UserRole.FARMER,
      }
    })

    const cropData =
      Array.isArray(crops) && crops.length > 0
        ? {
            create: crops.map(({culture, subculture, plan}: {culture: string, subculture: string, plan: number}) => ({
              culture,
              subculture,
              plan
            })),
          }
        : undefined;

    // 2. create farmer profile
    const profile = await prisma.farmerProfile.create({
      data: {
        userId: user.id,
        company,
        region,
        district,
        ruralDistrict,
        village,
        ...(cropData ? { crops: cropData } : {}), 
      }
    })

    return NextResponse.json({ ok: true, password: tempPassword })
  } catch (err) {
    console.error('Farmer create error:', err)
    return new NextResponse('Ошибка при создании фермера', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json()

  try {
    const payload = GetPayloadFromToken(req)

    if (![UserRole.HR, UserRole.ADMIN].includes(payload.role)) {
      return new NextResponse('Недостаточно прав для удаления пользователя', { status: 403 })
    }
    
    await prisma.farmerProfile.delete({
      where: { userId: id },
    })
    await prisma.user.delete({
      where: { id: id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to delete farmer' }, { status: 500 })
  }
}

/*
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()

  try {
    await prisma.user.update({
      where: { id: Number(params.id) },
      data: {
        login: data.login,
        name: data.name,
        surname: data.surname,
        phoneNumber: data.phoneNumber,
        farmer: {
          update: {
            company: data.company,
            // crop: data.crop,
            region: data.region,
            village: data.village,
            plan: Number(data.plan),
          },
        },
      },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
*/

/*
{
  id: 13,
  login: 'qwertyfarmerlogin',
  name: 'qwerty',
  surname: 'qwerty',
  phoneNumber: '+78005553535',
  farmer: {
    company: 'ТОО "йцукен"',
    region: 'aqmola',
    village: 'Бурабай',
    plan: 150,
    crops: [
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object]
    ]
  }
}
*/

export async function PUT(req: Request) {
  const data: farmerPUT = await req.json()

  // Validate required fields
  const requiredFields = {
    login: data.login,
    name: data.name,
    surname: data.surname,
    company: data.farmer.company,
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return new NextResponse(`Поле "${key}" обязательно для заполнения`, { status: 400 });
    }
  }

  try {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        login: data.login,
        name: data.name,
        surname: data.surname,
        phoneNumber: data.phoneNumber,
        farmer: {
          update: {
            company: data.farmer.company,
            region: data.farmer.region,
            village: data.farmer.village,

            // Step 1: Delete existing crops
            crops: {
              deleteMany: {}
            }
          },
        },
      },
    })


    // Step 2: Recreate crops
    await prisma.farmerProfile.update({
      where: { userId: data.id },
      data: {
        crops: {
          create: data.farmer.crops.map((c: { culture: string; subculture: string, plan: number }) => ({
            culture: c.culture,
            subculture: c.subculture,
            plan: c.plan
          }))
        }
      }
    })


    return NextResponse.json({ success: true })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}