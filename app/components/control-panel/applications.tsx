'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'

interface Application {
  _id: string
  type: string
  submittedAt: string
  targetDate: string
  status: 'pending' | 'approved' | 'declined'
  farmer: {
    company: string
    region: string
    village: string
  }
  oldData: any[]
  newData: any[]
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [selected, setSelected] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get('/api/applications', {
          withCredentials: true, // if using HttpOnly auth cookies
        })
        setApplications(res.data)
      } catch (error) {
        console.log('Ошибка при загрузке заявок:', error)
      }
    }

    fetchApplications()
  }, [])

  const handleAction = async (status: 'approved' | 'declined') => {
    if (!selected) return
    setLoading(true)

    try {
      await axios.post(`/api/applications/${selected._id}`, { status }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      setApplications(prev =>
        prev.map(app =>
          app._id === selected._id ? { ...app, status } : app
        )
      )
      setSelected(prev => (prev ? { ...prev, status } : null))
    } catch (error) {
      console.log('Ошибка при обновлении статуса:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* Left: List */}
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="text-lg font-semibold p-4">Заявления</h2>
        {applications.map(app => (
          <button
            key={app._id}
            onClick={() => setSelected(app)}
            className={`block w-full text-left px-4 py-2 border-b ${
              selected?._id === app._id ? 'bg-gray-200' : 'hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{app.type}</div>
            <div className="text-sm text-gray-500">{app.farmer.company}</div>
            <div className="text-sm text-gray-400">{new Date(app.submittedAt).toLocaleDateString()}</div>
            <div className={`text-xs mt-1 ${
              app.status === 'pending' ? 'text-yellow-600' :
              app.status === 'approved' ? 'text-green-600' :
              'text-red-600'
            }`}>
              Статус: {app.status}
            </div>
          </button>
        ))}
      </div>

      {/* Right: Details */}
      <div className="w-2/3 p-6 overflow-y-auto">
        {selected ? (
          <div>
            <h2 className="text-xl font-bold mb-2">Заявление: {selected.type}</h2>
            <p className="text-sm text-gray-600 mb-1">Компания: {selected.farmer.company}</p>
            <p className="text-sm text-gray-600 mb-1">Область: {selected.farmer.region}</p>
            <p className="text-sm text-gray-600 mb-1">Дата: {new Date(selected.targetDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600 mb-4">Статус: {selected.status}</p>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Предыдущее значение:</h3>
              {selected.oldData.length > 0 ? (
                <table className="w-full text-sm bg-white border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">Культура</th>
                      <th className="border px-2 py-1">План</th>
                      <th className="border px-2 py-1">Количество</th>
                      <th className="border px-2 py-1">Комментарий</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.oldData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{item.crop}</td>
                        <td className="border px-2 py-1">{item.plan}</td>
                        <td className="border px-2 py-1">{item.amount}</td>
                        <td className="border px-2 py-1">{item.comment || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">Нет данных</p>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Новое значение (изменения подсвечены):</h3>
              {selected.newData.length > 0 ? (
                <table className="w-full text-sm bg-white border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">Культура</th>
                      <th className="border px-2 py-1">План</th>
                      <th className="border px-2 py-1">Количество</th>
                      <th className="border px-2 py-1">Комментарий</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.newData.map((item, idx) => {
                      const old = selected.oldData.find(o => o.id === item.existingSeedingId)

                      const highlight = (key: keyof typeof item) =>
                        old && item[key] !== old[key] ? 'bg-yellow-200 font-semibold' : ''

                      return (
                        <tr key={idx}>
                          <td className="border px-2 py-1">{item.crop}</td>
                          <td className={`border px-2 py-1 ${highlight('plan')}`}>{item.plan}</td>
                          <td className={`border px-2 py-1 ${highlight('amount')}`}>{item.amount}</td>
                          <td className={`border px-2 py-1 ${highlight('comment')}`}>{item.comment || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">Нет данных</p>
              )}
            </div>

            {selected.status === 'pending' && (
              <div className="space-x-4">
                <button
                  onClick={() => handleAction('approved')}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Одобрить
                </button>
                <button
                  onClick={() => handleAction('declined')}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Отклонить
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Выберите заявление для просмотра</div>
        )}
      </div>
    </div>
  )
}
