'use client'

import { useEffect, useState } from 'react'
import AddHRModal from './addHRModal'
import UpdateHRModal from './updateHRModal'
import axios from 'axios'

type HR = {
  id: number
  login: string
  name: string
  surname: string
  phoneNumber?: string
  tempPassword?: string
}

export default function HRAccounts() {
  const [hrs, setHRs] = useState<HR[]>([])
  const [selected, setSelected] = useState<HR | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchHRs = async () => {
    try {
      const res = await axios.get('/api/users/HRs', { withCredentials: true })
      const data = res.data
      const sortedHRs = data.hrs.sort((a: HR, b: HR) =>
        a.login.localeCompare(b.login, undefined, { sensitivity: 'case' })
      )
      setHRs(sortedHRs)
      setSelected((prev) =>
        prev ? sortedHRs.find((h: HR) => h.id === prev.id) || null : null
      )
    } catch (error) {
      console.log('Ошибка при загрузке HR:', error)
    }
  }

  useEffect(() => {
    fetchHRs()
  }, [])

  const resetPassword = async (id: number) => {
    if (!id) return
    if (confirm('Сбросить пароль?')) {
      try {
        await axios.post(
          '/api/users/reset-password',
          { id },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        )
        alert('Пароль сброшен')
        await fetchHRs()
      } catch (error) {
        console.log('Ошибка сброса пароля:', error)
        alert('Ошибка сброса пароля')
      }
    }
  }

  const deleteHR = async (id: number | null) => {
    if (!id) return
    if (confirm('Удалить HR?')) {
      try {
        await axios.delete('/api/users/HRs', {
          headers: { 'Content-Type': 'application/json' },
          data: { id },
          withCredentials: true,
        })
        await fetchHRs()
        setSelected(null)
      } catch (error) {
        console.log('Ошибка удаления HR:', error)
        alert('Ошибка удаления')
      }
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Список HR</h2>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Добавить HR
        </button>
      </div>

      {showAddModal && (
        <AddHRModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchHRs}
        />
      )}

      {showEditModal && selected && (
        <UpdateHRModal
          hr={selected}
          onClose={() => setShowEditModal(false)}
          onUpdated={fetchHRs}
        />
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* HR Table */}
        <div>
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">ФИО</th>
                <th className="border px-2 py-1">Логин</th>
              </tr>
            </thead>
            <tbody>
              {hrs.map(h => (
                <tr
                  key={h.id}
                  onClick={() => setSelected(h)}
                  className={`cursor-pointer hover:bg-gray-100 ${selected?.id === h.id ? 'bg-gray-200' : ''}`}
                >
                  <td className="border px-2 py-1">{h.surname} {h.name}</td>
                  <td className="border px-2 py-1">{h.login}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* HR Detail View */}
        <div className="bg-gray-50 p-4 rounded border min-h-[200px]">
          {selected ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Информация об HR</h3>
              <p><strong>Имя:</strong> {selected.name}</p>
              <p><strong>Фамилия:</strong> {selected.surname}</p>
              <p><strong>Логин:</strong> {selected.login}</p>
              <p><strong>Пароль:</strong> {selected.tempPassword || "Изменен пароль"}</p>
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
                  deleteHR(selected.id)
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
              >
                Удалить
              </button>
            </div>
          ) : (
            <div className="text-gray-500">Выберите HR из списка</div>
          )}
        </div>
      </div>
    </div>
  )
}
