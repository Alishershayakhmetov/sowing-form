'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function ChangeTempPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      return setError('Пароли не совпадают')
    }
    if (newPassword.length < 8) {
      return setError('Пароль должен быть не менее 8 символов')
    }

    try {
      await axios.post('/api/auth/change-temp-password', { newPassword })
      setSuccess('Пароль успешно обновлён!')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (error: any) {
      const msg = error.response?.data || 'Ошибка смены пароля'
      setError(typeof msg === 'string' ? msg : 'Ошибка смены пароля')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Смена временного пароля</h2>
        <p>Поскольку вы вошли в аккаунт, используя временный пароль, вам необходимо изменить пароль на постоянный</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <input
          type="password"
          placeholder="Новый пароль"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded-md"
        />
        <input
          type="password"
          placeholder="Подтвердите пароль"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Сменить пароль
        </button>
      </form>
    </div>
  )
}
