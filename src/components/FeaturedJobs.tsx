'use client'
import React from 'react';
import Link from 'next/link';

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

interface FeaturedJobsProps {
  job?: Job
}

export default function FeaturedJobs({ job }: FeaturedJobsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* サンプル求人カード */}
      <div className="border rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-2">タクシードライバー募集</h3>
        <p className="text-gray-600 mb-4">株式会社サンプルタクシー</p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            <span className="font-medium">給与:</span> 月給25万円〜
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">勤務地:</span> 東京都新宿区
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">雇用形態:</span> 正社員
          </p>
        </div>
        <div className="mt-4">
          <Link 
            href="/jobs/1" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            詳細を見る →
          </Link>
        </div>
      </div>
      {/* 他の求人カードも同様に */}
    </div>
  );
} 