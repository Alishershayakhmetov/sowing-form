'use client'

import axios from 'axios'
import { useState } from 'react'

type HR = {
  id: number
  login: string
  name: string
  surname: string
  phoneNumber?: string
}

type Props = {
  hr: HR
  onClose: () => void
  onUpdated: () => void
}

export default function UpdateHRModal({ hr, onClose, onUpdated }: Props) {
  const [name, setName] = useState(hr.name)
  const [surname, setSurname] = useState(hr.surname)
  const [phoneNumber, setPhoneNumber] = useState(hr.phoneNumber || '')
  
  const updateHR = async () => {
    try {
      await axios.put(
        '/api/users/HRs',
        {
          id: hr.id,
          name,
          surname,
          phoneNumber,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )

      onUpdated()
      onClose()
    } catch (error) {
      console.log('Ошибка при обновлении HR:', error)
      alert('Ошибка при обновлении')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Редактировать HR</h2>

        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Фамилия"
          value={surname}
          onChange={e => setSurname(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Телефон"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Отмена</button>
          <button onClick={updateHR} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
