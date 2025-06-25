'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/utils/roles'
import axios from 'axios'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/users/me')
        const body = res.data
        if (body.role === UserRole.FARMER) {
          router.push('/form')
        } else {
          router.push('/control-panel')
        }
      } catch (error) {
        // Not authenticated or error occurred
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return <p>Проверка авторизации...</p>
}
