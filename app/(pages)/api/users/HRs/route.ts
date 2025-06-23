import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateTempPassword } from '@/lib/generateTempPassword'
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

export async function GET() {
  const hrs = await prisma.user.findMany({
    where: { role: 'HR' },
  })
  return NextResponse.json({ hrs })
}

export async function POST(req: Request) {
  const { login, name, surname, phoneNumber } = await req.json()

  // Validate required fields
  const requiredFields = { login, name, surname };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return new NextResponse(`Поле "${key}" обязательно для заполнения`, { status: 400 });
    }
  }

  const tempPassword = generateTempPassword()

  const user = await prisma.user.create({
    data: {
      login,
      name,
      surname,
      phoneNumber,
      role: 'HR',
      tempPassword: tempPassword,
    }
  })

  return NextResponse.json({ user })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()

  try {
    const payload = GetPayloadFromToken(req)

    // Only ADMIN can delete HRs
    if (payload.role !== UserRole.ADMIN) {
      return new NextResponse('Недостаточно прав для удаления HR', { status: 403 })
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id },
    })

    if (!userToDelete) {
      return new NextResponse('Пользователь не найден', { status: 404 })
    }

    if (userToDelete.role !== UserRole.HR) {
      return new NextResponse('Можно удалять только HR', { status: 400 })
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка при удалении HR:', error)
    return NextResponse.json({ error: 'Ошибка при удалении HR' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const data = await req.json()

  // Validate required fields
  const requiredFields = {
    login: data.login,
    name: data.name,
    surname: data.surname
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
        name: data.name,
        surname: data.surname,
        phoneNumber: data.phoneNumber,
        /*
        hr: {
          update: {
            company: data.farmer.company,
          },
        },
        */
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}