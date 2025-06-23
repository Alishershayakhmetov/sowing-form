import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateTempPassword } from '@/lib/generateTempPassword'
import { UserRole } from '@/utils/roles'
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken'

export async function GET() {
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
  })
  return NextResponse.json({ admins })
}

export async function POST(req: Request) {
  const { login, name, surname, phoneNumber } = await req.json()

  // Validate required fields
  const requiredFields = { login, name, surname};
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
      role: UserRole.ADMIN,
      tempPassword: tempPassword
    }
  })

  return NextResponse.json({ user })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()

  try {
    const payload = GetPayloadFromToken(req)

    if (payload.role !== UserRole.ADMIN) {
      return new NextResponse('Недостаточно прав для удаления пользователя', { status: 403 })
    }
    await prisma.user.delete({
      where: { id: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to delete farmer' }, { status: 500 })
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
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}