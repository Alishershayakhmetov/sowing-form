'use client'

import { useEffect, useState } from 'react'
import AddFarmerModal from './addFarmerModal'
import UpdateFarmerModal from './updateFarmerModal'
import axios from 'axios'

interface Farmer {
  id: number
  login: string
  name: string
  surname: string
  phoneNumber?: string
  tempPassword?: string
  farmer: {
    company: string
    crops: { culture: string; subculture: string; plan: number }[]
    region: string
    village: string
    plan: number
  }
}

export default function FarmerAccounts() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [selected, setSelected] = useState<Farmer | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchFarmers = async () => {
    try {
      const res = await axios.get('/api/users/farmers', { withCredentials: true })
      const data = res.data
      const sortedFarmers: Farmer[] = data.farmers.sort((a: Farmer, b: Farmer) =>
        a.surname.localeCompare(b.surname, undefined, { sensitivity: 'case' })
      )
      setFarmers(sortedFarmers)
      setSelected(sortedFarmers.find(f => f.id === selected?.id) || null)
      sortedFarmers
    } catch (error) {
      console.log('Ошибка при загрузке фермеров:', error)
      return []
    }
  }

  useEffect(() => {
    fetchFarmers()
  }, [])

  const resetPassword = async (id: number) => {
    if (id === null) return
    if (confirm('Сбросить пароль?')) {
      try {
        await axios.post('/api/users/reset-password', { id }, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        })
        alert('Пароль сброшен')
        await fetchFarmers()
      } catch (error) {
        console.log('Ошибка сброса пароля:', error)
        alert('Ошибка сброса пароля')
      }
    }
  }

  const deleteFarmer = async (id: number | null) => {
    if (id === null) return
    if (confirm('Удалить фермера?')) {
      try {
        await axios.delete('/api/users/farmers', {
          headers: { 'Content-Type': 'application/json' },
          data: { id }, // axios requires `data` for body in DELETE requests
          withCredentials: true,
        })
        await fetchFarmers()
        setSelected(null)
      } catch (error) {
        console.log('Ошибка удаления:', error)
        alert('Ошибка удаления')
      }
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Список фермеров</h2>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
        >
          Добавить фермера
        </button>
      </div>

      {showAddModal && (
        <AddFarmerModal onClose={() => setShowAddModal(false)} onCreated={fetchFarmers} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Farmer list */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">ФИО</th>
                <th className="border px-2 py-1">Компания</th>
                <th className="border px-2 py-1">Логин</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map(f => (
                <tr
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className={`cursor-pointer hover:bg-gray-100 ${
                    selected?.id === f.id ? 'bg-gray-200' : ''
                  }`}
                >
                  <td className="border px-2 py-1">{f.surname} {f.name}</td>
                  <td className="border px-2 py-1">{f.farmer?.company}</td>
                  <td className="border px-2 py-1">{f.login}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Farmer details */}
        <div className="bg-gray-50 p-4 rounded border min-h-[200px]">
          {selected ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Информация о фермере</h3>
              <p>
                <strong>Имя:</strong> {selected.name}
              </p>
              <p>
                <strong>Фамилия:</strong> {selected.surname}
              </p>
              <p>
                <strong>Логин:</strong> {selected.login}
              </p>
              <p>
                <strong>Временный пароль:</strong> {selected.tempPassword || "Пароль Изменен"}
              </p>
              <p>
                <strong>Телефон:</strong> {selected.phoneNumber || '—'}
              </p>
              <p>
                <strong>Компания:</strong> {selected.farmer.company}
              </p>
              <p>
                <strong>Культуры:</strong>
              </p>
              <ul className="list-disc list-inside text-sm pl-2">
                {selected.farmer.crops.map((c, idx) => (
                  <li key={idx}>
                    {c.culture} — {c.subculture}, План: {c.plan}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Регион:</strong> {selected.farmer.region}
              </p>
              <p>
                <strong>Село:</strong> {selected.farmer.village}
              </p>

              <button
                onClick={() => setShowEditModal(true)}
                className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
              >
                Редактировать
              </button>
              <button
                onClick={e => {
                  e.stopPropagation()
                  resetPassword(selected.id)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              >
                Сбросить Пароль
              </button>
              <button
                onClick={async e => {
                  e.stopPropagation()
                  await deleteFarmer(selected.id)
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
              >
                Удалить Аккаунт
              </button>
            </div>
          ) : (
            <div className="text-gray-500">Выберите фермера из списка</div>
          )}
        </div>

        {showEditModal && selected && (
          <UpdateFarmerModal
            farmer={selected}
            onClose={() => setShowEditModal(false)}
            onUpdated={fetchFarmers}
          />
        )}
      </div>
    </div>
  )
}
