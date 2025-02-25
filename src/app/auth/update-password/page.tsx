'use client'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function UpdatePasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const code = searchParams?.get('code')
    if (!code) {
      setError('リセットコードが見つかりません')
      setIsLoading(false)
      return
    }

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
      // まず、パスワードリセットトークンを検証
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token: code,
        type: 'recovery',
      })

      if (verifyError) {
        console.error('Error verifying reset token:', verifyError)
        throw new Error('リセットリンクが無効または期限切れです')
      }

      // パスワードを更新
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        console.error('Error updating password:', updateError)
        throw updateError
      }

      // パスワード更新成功
      router.push('/auth/signin?message=パスワードが更新されました')
    } catch (error: any) {
      console.error('Password reset error:', error)
      if (error.message?.includes('expired')) {
        setError('リセットリンクの有効期限が切れています。新しいリセットメールを送信してください。')
      } else if (error.message?.includes('invalid')) {
        setError('リセットリンクが無効です。新しいリセットメールを送信してください。')
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
          <div className="text-center">
            <button
              onClick={() => router.push('/auth/reset-password')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              パスワードリセットを再リクエスト
            </button>
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
              disabled={isLoading}
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