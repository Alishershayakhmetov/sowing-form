'use client'

import Header from '@/app/components/header'
import axios from 'axios'
import { useEffect, useState } from 'react'

interface Crop {
  id: number
  culture: string
  subculture: string
}

interface CropInput {
  amount: string
  comment: string
}

export default function FarmFormPage() {
  const [date, setDate] = useState('')
  const [rawCrops, setRawCrops] = useState<Crop[]>([])
  const [sortedCrops, setSortedCrops] = useState<Crop[]>([])
  const [inputs, setInputs] = useState<Record<number, CropInput>>({})
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [allowEdit, setAllowEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setDate(today)
  }, [])

  useEffect(() => {
    if (!date) return

    const fetchData = async () => {
      try {
        const [userRes, checkRes] = await Promise.all([
          axios.get('/api/users/farmers', { withCredentials: true }),
          axios.get(`/api/farm/check-submission?date=${date}`, { withCredentials: true }),
        ])

        const userData = userRes.data
        const checkData = checkRes.data

        const farmerCrops = userData.farmer?.crops || []
        setRawCrops(farmerCrops)
        setSelectedCropId(farmerCrops[0]?.id ?? null)

        const initialInputs: Record<number, CropInput> = {}

        farmerCrops.forEach((crop: Crop) => {
          const match = checkData.data?.find(
            (entry: any) => entry.crop === crop.subculture
          )
          initialInputs[crop.id] = {
            amount: match ? match.amount.toString() : '',
            comment: match?.comment || '',
          }
        })

        setInputs(initialInputs)
        setSubmitted(checkData.submitted)
      } catch (err) {
        console.log('Ошибка загрузки данных:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date])

  useEffect(() => {
    if (rawCrops.length > 0 && Object.keys(inputs).length === 0) {
      const initialInputs: Record<number, CropInput> = {}
      rawCrops.forEach((crop: Crop) => {
        initialInputs[crop.id] = { amount: '', comment: '' }
      })
      setInputs(initialInputs)
    }
  }, [rawCrops])
  
  const handleChange = (cropId: number, field: 'amount' | 'comment', value: string) => {
    setInputs(prev => {
      const updated = {
        ...prev,
        [cropId]: {
          ...prev[cropId],
          [field]: value
        }
      }

      // If user is filling the "amount" field and it's not empty, move crop to top
      if (field === 'amount' && value.trim() !== '') {
        setRawCrops(prevCrops => {
          const index = prevCrops.findIndex(crop => crop.id === cropId)
          if (index > 0) {
            const updatedCrops = [...prevCrops]
            const [moved] = updatedCrops.splice(index, 1)
            updatedCrops.unshift(moved)
            return updatedCrops
          }
          return prevCrops
        })
      }

      return updated
    })
  }

  useEffect(() => {
    const filled: Crop[] = []
    const unfilled: Crop[] = []

    rawCrops.forEach(crop => {
      const amount = inputs[crop.id]?.amount?.trim()
      if (amount) filled.push(crop)
      else unfilled.push(crop)
    })

    setSortedCrops([...filled, ...unfilled])
  }, [inputs, rawCrops])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    setError(false)
    setSubmitLoading(true)

    const payload = rawCrops.map(crop => ({
      id: crop.id,
      amount: inputs[crop.id]?.amount || '',
      comment: inputs[crop.id]?.comment || '',
    }))

    const endpoint = submitted ? '/api/farm/re-submit' : '/api/farm/submit'

    try {
      await axios.post(endpoint, { date, data: payload }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })

      setSuccess(true)
      setError(false)
      setSubmitted(true)
      setAllowEdit(false)
    } catch (err) {
      console.log('Ошибка отправки формы:', err)
      setSuccess(false)
      setError(true)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Загрузка...</p>
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-green-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-green-700">Форма посева</h1>
          <p className="text-center text-sm text-gray-600 mb-4">
            Текущая дата: <span className="font-medium">{date}</span>
          </p>

          {submitted && !allowEdit && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6 text-center">
              <p>Вы уже отправили форму на сегодня. Хотите изменить данные?</p>
              <p>Изменения должны принять ваш HR</p>
              <button
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={() => setAllowEdit(true)}
              >
                Изменить данные
              </button>
            </div>
          )}

          <div className="text-center mb-6">
            <label className="block text-gray-600 mb-2">Выберите дату отправки:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setSubmitted(false)
                setAllowEdit(false)
              }}
              className="border px-3 py-2 rounded-md"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Culture Selector */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {sortedCrops.map(crop => {
              const filled = inputs[crop.id]?.amount?.trim()
              return (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`px-4 py-2 rounded-md border ${
                    selectedCropId === crop.id ? 'bg-green-600 text-white' : 'bg-white text-green-600'
                  } ${filled ? 'border-green-500' : 'border-gray-300'}`}
                >
                  {crop.subculture}{filled ? ' ✅' : ''}
                </button>
              )
            })}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedCropId && inputs[selectedCropId] && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-green-600 mb-3">
                  {sortedCrops.find(c => c.id === selectedCropId)?.culture} — {sortedCrops.find(c => c.id === selectedCropId)?.subculture}
                </h2>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Факт Посеяно за день, га</label>
                  <input
                    type="number"
                    required
                    value={inputs[selectedCropId].amount}
                    onChange={(e) => handleChange(selectedCropId, 'amount', e.target.value)}
                    placeholder="Например, 150"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    readOnly={submitted && !allowEdit}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Примечание (опционально)</label>
                  <input
                    type="text"
                    value={inputs[selectedCropId].comment}
                    onChange={(e) => handleChange(selectedCropId, 'comment', e.target.value)}
                    placeholder="Комментарий"
                    maxLength={255}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    readOnly={submitted && !allowEdit}
                  />
                </div>
              </div>
            )}

            {/* Validation Notice */}
            {(!submitted || allowEdit) && Object.values(inputs).some(input => !input.amount.trim()) && (
              <p className="text-red-600 text-center font-medium">
                ⚠️ Пожалуйста, заполните данные для всех культур перед отправкой.
              </p>
            )}

            {/* Submit Button */}
            {(!submitted || allowEdit) && (
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Отправка...
                  </>
                ) : (
                  submitted ? 'Подать На Изменения' : 'Отправить все данные'
                )}
              </button>
            )}

            {success && (
              <p className="text-green-600 text-center font-medium mt-4">Все данные успешно отправлены!</p>
            )}
            {error && (
              <p className="text-red-600 text-center font-medium mt-4">Произошла ошибка при отправке. Повторите попытку.</p>
            )}
          </form>
        </div>
      </main>
    </>
  )
}
