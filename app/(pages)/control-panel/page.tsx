'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Header from '@/app/components/header'
import ControlPanelLayout from "@/app/components/control-panel/controlPanelLayout"
import { UserRole } from '@/utils/roles'

export default function Homepage() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/users/me", {
          withCredentials: true, // ensure cookies are sent
        })

        const user = res.data

        if (user.role === UserRole.FARMER) {
          router.replace('/form')
        } else {
          setRole(user.role)
        }
      } catch (err) {
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading || !role) return null // or show a spinner

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ControlPanelLayout role={role} />
      </div>
    </div>
  )
}
