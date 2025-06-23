import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TokenPayload } from '@/interfaces/interfaces';
import { UserRole } from '@/utils/roles';
import { GetPayloadFromToken } from '@/lib/getPayloadFromToken';

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
