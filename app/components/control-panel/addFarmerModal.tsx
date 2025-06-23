'use client'

import { useState } from 'react'
import CultureSelectorWithPlan from '../cultureSelectorWithPlan'
import axios from 'axios'

interface SelectedCulture {
  culture: string
  subculture: string
  plan: number
}

const labelMap: Record<string, string> = {
  login: 'Логин',
  name: 'Имя',
  surname: 'Фамилия',
  phoneNumber: 'Телефон',
  company: 'Компания',
  region: 'Регион',
  district: 'Район',
  ruralDistrict: 'Сельский округ',
  village: 'Село',
}

export default function AddFarmerModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const [form, setForm] = useState({
    login: '',
    name: '',
    surname: '',
    phoneNumber: '',
    company: '',
    region: '',
    district: '',
    ruralDistrict: '',
    village: ''
  })

  const [selectedCrops, setSelectedCrops] = useState<SelectedCulture[]>([])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      console.log({ ...form, crops: selectedCrops })

      await axios.post('/api/users/farmers', {
        ...form,
        crops: selectedCrops,
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      onCreated()
      onClose()
    } catch (error) {
      console.log('Ошибка при создании:', error)
      alert('Ошибка при создании')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-3">
        <h3 className="text-lg font-semibold">Добавить фермера</h3>
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

        <div>
          <h4 className="text-md font-medium pt-2">Культуры</h4>
          <CultureSelectorWithPlan onChange={setSelectedCrops} />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Отмена</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">Создать</button>
        </div>
      </div>
    </div>
  )
}
