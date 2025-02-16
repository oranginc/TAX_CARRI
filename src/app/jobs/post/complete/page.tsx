'use client'
import React from 'react'
import Link from 'next/link'

export default function JobPostCompletePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">求人の掲載が完了しました</h1>
        <p className="text-gray-600 mb-8">
          ご掲載ありがとうございます。求人情報は審査後に公開されます。
        </p>
        <div className="space-x-4">
          <Link
            href="/jobs/post"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700"
          >
            続けて求人を掲載
          </Link>
          <Link
            href="/"
            className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-200"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
} 