'use client'

import { Suspense } from 'react'
import LoginPage from './loginPage'

export default function Login() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <LoginPage />
    </Suspense>
  )
}
