'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cooldown > 0) {
      setError(`しばらくお待ちください。${cooldown}秒後に再試行できます。`)
      return
    }

    setIsLoading(true)
    setMessage(null)
    setError(null)

    try {
      console.log('Starting password reset process...')
      console.log('Email:', email)
      console.log('Redirect URL:', `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tax-carri.vercel.app'}/auth/update-password`)

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tax-carri.vercel.app'}/auth/update-password`,
      })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Password reset response:', data)
      setMessage('パスワードリセットのメールを送信しました。メールをご確認ください。')
      setCooldown(60)
    } catch (error: any) {
      console.error('Detailed error:', error)
      
      if (error.message?.includes('rate limit')) {
        setError('リクエストが多すぎます。しばらく待ってから再試行してください。')
      } else if (error.message?.includes('Email rate limit exceeded')) {
        setError('メール送信の制限に達しました。しばらく待ってから再試行してください。')
      } else if (error.message?.includes('User not found')) {
        setError('このメールアドレスは登録されていません。')
      } else if (error.message?.includes('Email not confirmed')) {
        setError('このメールアドレスはまだ確認されていません。')
      } else {
        setError('パスワードリセットメールの送信に失敗しました。もう一度お試しください。')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            パスワードをリセット
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            登録したメールアドレスを入力してください。
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? '送信中...' : cooldown > 0 ? `${cooldown}秒後に再試行可能` : 'リセットメールを送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}