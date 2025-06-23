'use client'

import { UserRole } from '@/utils/roles'
import axios from 'axios'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/login', label: 'Вход' },
  { href: '/dashboard', label: 'Профиль' },
  { href: '/form', label: 'Форма' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/users/me', { withCredentials: true })
        const data = res.data
        console.log(data.role)

        if ([UserRole.HR, UserRole.ADMIN, UserRole.SUPERUSER].includes(data.role)) {
          setIsAdmin(true)
        }
      } catch (err) {
        console.log('Failed to fetch user:', err)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', null, { withCredentials: true })
      router.push('/login')
    } catch (err) {
      console.log('Logout failed:', err)
    }
  }

  const handleExport = () => {
    window.open('/api/export', '_blank')
  }
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <nav className="max-w-6xl mx-auto flex flex-wrap justify-center gap-4">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`hover:underline text-sm sm:text-base ${
              pathname === href ? 'font-bold underline' : ''
            }`}
          >
            {label}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="hover:underline text-sm sm:text-base"
        >
          Выход
        </button>
      
        {isAdmin && (
          <>
            <button
              onClick={handleExport}
              className="hover:underline text-sm sm:text-base"
            >
              Экспорт
            </button>
            <Link
              href={"/control-panel"}
              className="hover:underline text-sm sm:text-base"
            >
              Контроль Панель
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
