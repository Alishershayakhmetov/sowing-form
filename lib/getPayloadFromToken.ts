import { TokenPayload } from "@/interfaces/interfaces"
import jwt from 'jsonwebtoken'

export function GetPayloadFromToken(req: Request): TokenPayload {
  const token = req.headers.get('cookie')
    ?.split(';')
    .find(c => c.trim().startsWith('token='))
    ?.split('=')[1]

  if (!token) throw new Error('Unauthorized')

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    return payload
  } catch {
    throw new Error('Invalid token')
  }
}
