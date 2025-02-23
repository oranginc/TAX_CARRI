'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function UpdatePasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const code = searchParams?.get('code')
    if (!code) {
      router.push('/auth/signin')
      return
    }

    // コードを検証
    const verifyCode = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Error verifying code:', error)
          setError('リセットリンクが無効または期限切れです')
          setTimeout(() => router.push('/auth/signin'), 3000)
          return
        }
        setIsVerified(true)
      } catch (err) {
        console.error('Error in code verification:', err)
        setError('認証エラーが発生しました')
        setTimeout(() => router.push('/auth/signin'), 3000)
      }
    }

    verifyCode()
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isVerified) {
      setError('認証が完了していません。ページを再読み込みしてください。')
      return
    }

    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上である必要があります')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      // パスワード更新成功
      router.push('/auth/signin?message=パスワードが更新されました')
    } catch (error: any) {
      console.error('Error updating password:', error)
      if (error.message?.includes('Invalid code')) {
        setError('リセットリンクが無効または期限切れです')
      } else {
        setError('パスワードの更新に失敗しました: ' + error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            新しいパスワードを設定
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              新しいパスワード
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              パスワードの確認
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !isVerified}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? '更新中...' : 'パスワードを更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          読み込み中...
        </div>
      </div>
    }>
      <UpdatePasswordForm />
    </Suspense>
  )
}