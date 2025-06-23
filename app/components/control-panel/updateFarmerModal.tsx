'use client'
import { useState, useEffect } from 'react'
import CultureSelectorWithPlan from '../cultureSelectorWithPlan'
import axios from 'axios'

interface Farmer {
  id: number
  login: string
  name: string
  surname: string
  phoneNumber?: string
  farmer: {
    company: string
    crops: SelectedCulture[]
    region: string
    village: string
  }
}

interface SelectedCulture {
  culture: string
  subculture: string
  plan: number
}

export default function UpdateFarmerModal({
  onClose,
  farmer,
  onUpdated
}: {
  onClose: () => void
  farmer: Farmer
  onUpdated: () => void
}) {
  const [form, setForm] = useState({
    login: farmer.login,
    name: farmer.name,
    surname: farmer.surname,
    phoneNumber: farmer.phoneNumber || '',
    company: farmer.farmer.company,
    region: farmer.farmer.region,
    village: farmer.farmer.village,
    crops: farmer.farmer.crops as SelectedCulture[]
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCropsChange = (selected: SelectedCulture[]) => {
    const mapped = selected.map(({culture, subculture, plan}) => ({ culture, subculture, plan }))
    setForm(prev => ({ ...prev, crops: mapped }))
  }

  const handleSubmit = async () => {
    const dataToSend = {
      id: farmer.id,
      login: form.login,
      name: form.name,
      surname: form.surname,
      phoneNumber: form.phoneNumber,
      farmer: {
        company: form.company,
        region: form.region,
        village: form.village,
        crops: form.crops,
      },
    }

    try {
      await axios.put('/api/users/farmers', dataToSend, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true, // include if your app uses cookies for auth
      })

      onUpdated()
      onClose()
    } catch (error) {
      console.log('Ошибка обновления:', error)
      alert('Ошибка обновления')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-3xl space-y-3 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold">Редактировать фермера</h3>

        <input name="login" value={form.login} onChange={handleChange} placeholder="login" className="border w-full p-2 rounded text-sm" />
        <input name="name" value={form.name} onChange={handleChange} placeholder="name" className="border w-full p-2 rounded text-sm" />
        <input name="surname" value={form.surname} onChange={handleChange} placeholder="surname" className="border w-full p-2 rounded text-sm" />
        <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="phoneNumber" className="border w-full p-2 rounded text-sm" />
        <input name="company" value={form.company} onChange={handleChange} placeholder="company" className="border w-full p-2 rounded text-sm" />
        <input name="region" value={form.region} onChange={handleChange} placeholder="region" className="border w-full p-2 rounded text-sm" />
        <input name="village" value={form.village} onChange={handleChange} placeholder="village" className="border w-full p-2 rounded text-sm" />

        <div>
          <p className="font-semibold mt-2 mb-1">Культуры:</p>
          <CultureSelectorWithPlan
            initialSelected={form.crops}
            onChange={handleCropsChange}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Отмена</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Сохранить</button>
        </div>
      </div>
    </div>
  )
}
