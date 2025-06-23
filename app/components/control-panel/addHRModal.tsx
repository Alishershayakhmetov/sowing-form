'use client'

import axios from 'axios';
import { useState } from 'react'

const labelMap: Record<string, string> = {
  login: 'Логин',
  name: 'Имя',
  surname: 'Фамилия',
  phoneNumber: 'Телефон',
}

export default function AddHRModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    login: '',
    name: '',
    surname: '',
    phoneNumber: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      await axios.post('/api/users/HRs', form, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      onCreated()
      onClose()
    } catch (error) {
      console.log('Ошибка при создании HR:', error)
      alert('Ошибка при создании HR')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md space-y-3">
        <h3 className="text-lg font-semibold">Добавить HR</h3>
        {Object.keys(form).map(key => (
          <div key={key}>
            <label className="block text-gray-600 mb-2">{labelMap[key] || key}</label>
            <input
              name={key}
              value={(form as any)[key]}
              onChange={handleChange}
              placeholder={labelMap[key] || key}
              className="border w-full p-2 rounded text-sm"
            />
          </div>
          
        ))}
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Отмена</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">Создать</button>
        </div>
      </div>
    </div>
  )
}
