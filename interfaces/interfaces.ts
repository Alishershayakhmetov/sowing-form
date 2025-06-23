import { UserRole } from "@/utils/roles"

export interface TokenPayload {
  id: number
  login: string
  email?: string
  role: UserRole.HR | UserRole.FARMER | UserRole.ADMIN | UserRole.SUPERUSER
}

export interface CropSubmission {
  id: string 
  amount: string
  comment?: string
}

export interface farmerPUT {
  id: number,
  login: string,
  name: string,
  surname: string,
  phoneNumber: string,
  farmer: {
    company: string,
    region: string,
    village: string,
    crops: {
      culture: string,
      subculture: string,
      plan: number
    } []
  }
}