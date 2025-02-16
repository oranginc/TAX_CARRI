'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Job } from '@/types/database.types'

interface JobWithCompany extends Job {
  companies: {
    company_name: string
    prefecture: string
    city: string
    description: string
    benefits: string
    training_system: string
  }
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<JobWithCompany | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            companies:company_id (
              company_name,
              prefecture,
              city,
              description,
              benefits,
              training_system
            )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        setJob(data)
      } catch (err) {
        setError('求人情報の取得に失敗しました')
        console.error('Error fetching job:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">
          {error || '求人情報が見つかりませんでした'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 求人タイトルセクション */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
        <div className="flex items-center text-gray-600 mb-4">
          <span className="mr-4">{job.companies.company_name}</span>
          <span>{job.companies.prefecture}{job.companies.city}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">雇用形態：</span>
            {job.employment_type === 'full_time' ? '正社員' : 
             job.employment_type === 'part_time' ? 'パート・アルバイト' : '契約社員'}
          </div>
          <div>
            <span className="font-medium">給与：</span>
            {job.salary_type === 'monthly' ? '月給' : 
             job.salary_type === 'daily' ? '日給' : '歩合制'}{' '}
            {job.salary_min.toLocaleString()}円 〜 {job.salary_max.toLocaleString()}円
          </div>
          <div>
            <span className="font-medium">勤務時間：</span>
            {job.working_hours}
          </div>
        </div>
      </div>

      {/* 求人詳細セクション */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">仕事内容</h2>
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">応募資格</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">必要な経験</h3>
                <p>{job.required_experience}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">必要な免許</h3>
                <ul className="list-disc list-inside">
                  {job.required_license.map((license, index) => (
                    <li key={index}>{license}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">福利厚生</h2>
            <p className="whitespace-pre-wrap">{job.benefits}</p>
          </div>
        </div>

        {/* 企業情報サイドバー */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">企業情報</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">会社概要</h3>
                <p className="text-sm">{job.companies.description}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">研修制度</h3>
                <p className="text-sm">{job.companies.training_system}</p>
              </div>
            </div>
          </div>

          {/* 応募ボタン */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700"
              onClick={() => {/* 応募処理 */}}
            >
              この求人に応募する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 