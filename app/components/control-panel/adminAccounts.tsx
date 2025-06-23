'use client'

import { useEffect, useState } from 'react'
import AddAdminModal from './addAdminModal'
import UpdateAdminModal from './updateAdminModal'
import axios from 'axios'

type Admin = {
  id: number
  login: string
  name: string
  surname: string
  phoneNumber?: string
  tempPassword?: string
}

export default function AdminAccounts() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [selected, setSelected] = useState<Admin | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('/api/users/admins', { withCredentials: true })
      const data = res.data
      const sortedHRs = data.admins.sort((a: Admin, b: Admin) =>
        a.login.localeCompare(b.login, undefined, { sensitivity: 'case' })
      )
      setAdmins(sortedHRs)
      setSelected((prev) => prev ? sortedHRs.find((h: Admin) => h.id === prev.id) || null : null)
    } catch (error) {
      console.log('Ошибка загрузки админов:', error)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const resetPassword = async (id: number) => {
    if (!id) return
    if (confirm('Сбросить пароль?')) {
      try {
        await axios.post('/api/users/reset-password', { id }, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        })
        alert('Пароль сброшен')
        await fetchAdmins()
      } catch (error) {
        console.log('Ошибка при сбросе пароля:', error)
        alert('Ошибка сброса пароля')
      }
    }
  }

  const deleteAdmin = async (id: number | null) => {
    if (!id) return
    if (confirm('Удалить Admin?')) {
      try {
        await axios.delete('/api/users/admins', {
          headers: { 'Content-Type': 'application/json' },
          data: { id }, // `axios.delete` sends body via `data`
          withCredentials: true,
        })
        await fetchAdmins()
        setSelected(null)
      } catch (error) {
        console.log('Ошибка удаления:', error)
        alert('Ошибка удаления')
      }
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Список Админов</h2>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Добавить Admin
        </button>
      </div>

      {showAddModal && (
        <AddAdminModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchAdmins}
        />
      )}

      {showEditModal && selected && (
        <UpdateAdminModal
          admin={selected}
          onClose={() => setShowEditModal(false)}
          onUpdated={fetchAdmins}
        />
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Admin Table */}
        <div>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">ФИО</th>
                <th className="border px-2 py-1">Логин</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`cursor-pointer hover:bg-gray-100 ${selected?.id === a.id ? 'bg-gray-200' : ''}`}
                >
                  <td className="border px-2 py-1">{a.surname} {a.name}</td>
                  <td className="border px-2 py-1">{a.login}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Admin Detail View */}
        <div className="bg-gray-50 p-4 rounded border min-h-[200px]">
          {selected ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Информация об Admin</h3>
              <p><strong>Имя:</strong> {selected.name}</p>
              <p><strong>Фамилия:</strong> {selected.surname}</p>
              <p><strong>Логин:</strong> {selected.login}</p>
              <p><strong>Временный пароль:</strong> {selected.tempPassword || "Пароль Изменен"}</p>
              <p><strong>Телефон:</strong> {selected.phoneNumber || '—'}</p>
              <button
                onClick={() => setShowEditModal(true)}
                className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
              >
                Редактировать
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  resetPassword(selected.id)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              >
                Сбросить пароль
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteAdmin(selected.id)
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
              >
                Удалить
              </button>
            </div>
          ) : (
            <div className="text-gray-500">Выберите Админа из списка</div>
          )}
        </div>
      </div>
    </div>
  )
}
