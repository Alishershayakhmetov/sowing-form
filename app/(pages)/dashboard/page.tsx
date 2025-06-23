'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/header'
import { UserRole } from '@/utils/roles'
import axios from 'axios'

interface UserDashboardData {
  id: number
  login: string
  name: string
  surname: string
  phoneNumber: string
  role: UserRole.FARMER | UserRole.HR | UserRole.ADMIN
  // FARMER-specific
  company?: string
  region?: string
  district?: string
  ruralDistrict?: string
  village?: string
  crops?: { culture: string; subculture: string; plan: number }[]
}

const fieldLabels: Record<string, string> = {
  login: 'Логин',
  name: 'Имя',
  surname: 'Фамилия',
  phoneNumber: 'Телефон',
  company: 'Компания',
  region: 'Регион (область)',
  district: 'Район',
  ruralDistrict: 'Сельский округ',
  village: 'Поселок, село',
}

const roleTranslations: Record<UserRole, string> = {
  [UserRole.FARMER]: 'Фермер',
  [UserRole.HR]: 'HR',
  [UserRole.ADMIN]: 'Администратор',
  [UserRole.SUPERUSER]: 'Суперпользователь',
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserDashboardData | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/users/me', { withCredentials: true })
        setUser(res.data)
      } catch (error: any) {
        if (error.response?.status === 401) {
          router.push('/login')
        } else {
          setError('Не удалось загрузить данные')
        }
      }
    }

    fetchUser()
  }, [router])

  if (error) return <p className="text-red-500">{error}</p>
  if (!user) return <p>Загрузка...</p>

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-center">Ваш Профиль ({roleTranslations[user.role]})</h2>

          {Object.entries(fieldLabels).map(([key, label]) => {
            const value = (user as any)[key]
            return value !== undefined ? (
              <div key={key}>
                <strong>{label}:</strong> {value}
              </div>
            ) : null
          })}

          {user.role === UserRole.FARMER && user.crops && (
            <div>
              <label className="block text-gray-700 mb-1 font-bold">Культуры</label>
              <ul className="list-disc pl-5">
                {user.crops.length === 0 ? (
                  <li>Нет культур</li>
                ) : (
                  user.crops.map((c, index) => (
                    <li key={index}>{c.culture} — {c.subculture}, План: {c.plan} га</li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
