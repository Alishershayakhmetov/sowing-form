'use client'

import { useState } from 'react'
import FarmerAccounts from './farmerAccounts'
import HRAccounts from './HRAccounts'
import Applications from './applications'
import AdminAccounts from "./adminAccounts";
import { UserRole } from '@/utils/roles'
import { Menu } from 'lucide-react'

type Role = UserRole.HR | UserRole.HR | UserRole.ADMIN | UserRole.SUPERUSER

const menuItems = [
  { key: 'farmers', label: 'Учетные записи фермеров', roles: [UserRole.HR, UserRole.ADMIN] },
  { key: 'statements', label: 'Заявления', roles: [UserRole.HR, UserRole.ADMIN] },
  { key: 'hrs', label: 'Учетные записи HR', roles: [UserRole.ADMIN] },
  { key: 'admins', label: "Учетные записи Admin", roles: [UserRole.SUPERUSER, UserRole.ADMIN] }
]

export default function ControlPanelLayout({ role }: { role: UserRole }) {
  const [selected, setSelected] = useState<string | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredItems = menuItems.filter(item => item.roles.includes(role))

  const renderContent = () => {
    if (!selected) return <div className="text-gray-500">Выберите раздел</div>
    if (selected === 'farmers') return <FarmerAccounts />
    if (selected === 'hrs' && role === 'ADMIN') return <HRAccounts />
    if (selected === 'statements') return <Applications />
    if (selected === "admins") return <AdminAccounts />
    return <div className="text-gray-500">Нет доступа к этому разделу</div>
  }

  return (
    <div className="flex h-full">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden absolute top-4 left-4 z-20 bg-white p-2 rounded shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed z-10 md:static top-0 left-0 h-full bg-gray-100 p-4 w-64 space-y-2 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {filteredItems.map(item => (
          <button
            key={item.key}
            onClick={() => {
              setSelected(item.key)
              setSidebarOpen(false) // auto-close on mobile
            }}
            className={`block w-full text-left px-4 py-2 rounded hover:bg-gray-200 ${
              selected === item.key ? 'bg-gray-300' : ''
            }`}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  )
}
