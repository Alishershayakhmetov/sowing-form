import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import ExcelJS from 'exceljs'
import { TokenPayload } from '@/interfaces/interfaces'
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken'
import { UserRole } from '@/utils/roles'

export async function GET(req: Request) {
  try {
    const payload: TokenPayload = GetPayloadFromToken(req)

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        role: true,
      },
    })

    if (!user || (user.role !== 'HR' && user.role !== 'ADMIN')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Fetch all farmers
    const users = await prisma.user.findMany({
      where: {
        role: UserRole.FARMER,
      },
      include: { seedings: true },
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Users and Seedings')

    worksheet.columns = [
      { header: 'ID пользователя', key: 'userId', width: 10 },
      { header: 'Логин', key: 'login', width: 40 },
      { header: 'Имя', key: 'name', width: 15 },
      { header: 'Фамилия', key: 'surname', width: 15 },
      { header: 'Компания', key: 'company', width: 20 },
      { header: 'План', key: 'plan', width: 10 },
      { header: 'Регион', key: 'region', width: 15 },
      { header: 'Культура', key: 'crop', width: 25 },
      { header: 'Деревня', key: 'village', width: 15 },
      { header: 'Количество посевов', key: 'amount', width: 15 },
      { header: 'Дата посева', key: 'date', width: 20 },
      { header: 'Комментарий', key: 'comment', width: 25 },
    ]

    users.forEach(user => {
      user.seedings.forEach(seeding => {
        const visibleComment = seeding.comment?.slice(0, 50) || ''
        const hiddenComment = seeding.comment?.slice(50) || ''

        const row = worksheet.addRow({
          userId: user.id,
          login: user.login,
          name: user.name,
          surname: user.surname,
          company: seeding.company,
          plan: seeding.plan,
          region: seeding.region,
          crop: seeding.crop,
          village: seeding.village,
          amount: seeding.amount,
          date: seeding.date.toLocaleString('ru-RU', {
            timeZone: 'Asia/Yekaterinburg',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
          comment: visibleComment,
        })

        // Add the hidden part of comment as Excel cell note
        if (hiddenComment) {
          const commentCell = worksheet.getCell(`L${row.number}`) // 'L' = 12th column = 'comment'
          commentCell.note = hiddenComment
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="users_seedings.xlsx"',
      },
    })
  } catch (err) {
    if (err instanceof Error) {
      return new NextResponse(err.message, { status: 401 })
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
