'use client'
import React from 'react'
import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          メールを確認してください
        </h2>
        <p className="text-gray-600 mb-8">
          ご登録いただいたメールアドレスに確認メールを送信しました。<br />
          メール内のリンクをクリックして、アカウントを有効化してください。
        </p>
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="inline-block text-blue-600 hover:text-blue-500"
          >
            ログインページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
} 