'use client'
import React, { useState } from 'react'
import Link from 'next/link';
import JobSearchForm from '@/components/JobSearchForm';
import FeaturedJobs from '@/components/FeaturedJobs';
import FeatureContent from '@/components/FeatureContent';
import { supabase } from '@/lib/supabase/client'

interface Job {
  id: string
  title: string
  description: string
  employment_type: string
  salary_type: string
  salary_min: number
  salary_max: number
  prefecture: string
  city: string
  company_id: string
  created_at: string
  status: string
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<Job[]>([])

  const handleSearch = async (searchParams: {
    keyword?: string
    location?: string
    employmentType?: string
  }) => {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')

    if (searchParams.keyword) {
      query = query.or(`title.ilike.%${searchParams.keyword}%,description.ilike.%${searchParams.keyword}%`)
    }

    if (searchParams.location) {
      query = query.eq('prefecture', searchParams.location)
    }

    if (searchParams.employmentType) {
      query = query.eq('employment_type', searchParams.employmentType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      return
    }

    setSearchResults(data || [])
  }

  return (
    <div>
      {/* メインビジュアル */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">
            タクシードライバーとして新しいキャリアを始めませんか？
          </h1>
          <p className="text-xl mb-8">
            あなたに合った求人情報が見つかります
          </p>
          <Link 
            href="/search"
            className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100"
          >
            求人を探す
          </Link>
        </div>
      </div>

      {/* 求人検索フォーム */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <JobSearchForm onSearch={handleSearch} />
        </div>
      </div>

      {/* おすすめ求人 */}
      <div className="py-12">
        {searchResults.length > 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">検索結果</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((job) => (
                <FeaturedJobs key={job.id} job={job} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
              <h2 className="text-2xl font-bold mb-6">注目の求人</h2>
              <FeaturedJobs />
            </div>
            <div className="bg-gray-50 py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FeatureContent />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 