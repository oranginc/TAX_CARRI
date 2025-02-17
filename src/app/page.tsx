'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import JobSearchForm from '@/components/JobSearchForm';
import FeaturedJobs from '@/components/FeaturedJobs';
import FeatureContent from '@/components/FeatureContent';
import { supabase } from '@/lib/supabase/client'
import type { Job } from '@/types/database.types'

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    fetchFeaturedJobs()
  }, [])

  const fetchFeaturedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies:company_id (
            company_name,
            prefecture,
            city
          )
        `)
        .eq('status', 'active')
        .limit(6)

      if (error) throw error
      if (data) setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
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
          <JobSearchForm />
        </div>
      </div>

      {/* おすすめ求人 */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">注目の求人</h2>
          <FeaturedJobs jobs={jobs} />
        </div>
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FeatureContent />
          </div>
        </div>
      </div>
    </div>
  );
} 