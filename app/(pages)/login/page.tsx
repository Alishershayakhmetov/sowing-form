'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/app/components/header'
import axios from 'axios'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const unauthorized = searchParams.get('unauthorized')
    if (unauthorized === '1') {
      setError('Пожалуйста, войдите в аккаунт для доступа к этой странице')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!checkPassword(password)) {
      setError('Пароль должен быть длиной 6 цифр или не менее 8 символов')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await axios.post('/api/auth/login', { login, password }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
        maxRedirects: 0, // Prevent axios from auto-following redirects
        validateStatus: status => status >= 200 && status < 400, // Accept redirect status
      })

      setLoading(false)

      if (res.data?.tempPassword) {
        router.push('/change-temp-password')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setLoading(false)
      if (err.response?.status === 401) {
        setError('Пароль недействителен')
      } else {
        setError('Ошибка при входе')
      }
    }
  }

  const checkPassword = (password: string) => {
    if (password.length === 6) {
      return /^\d{6}$/.test(password) // only allow 6-digit numbers
    }
    return password.length >= 8 // allow 8+ characters of any type
  }


  return (
    <>
    <Header />
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Вход в аккаунт</h2>

        <input
          type="text"
          value={login}
          onChange={e => setLogin(e.target.value)}
          placeholder="Логин"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* Display validation error */}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
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
              Загрузка...
            </>
          ) : (
            'Войти'
          )}
        </button>

      </form>
    </div>
    </>
  )
}
