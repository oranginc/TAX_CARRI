'use client'
import React from 'react'
import Link from 'next/link'
import type { Job } from '@/types/database.types'
import FavoriteButton from './FavoriteButton'

interface JobListProps {
  jobs: Job[]
}

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        該当する求人が見つかりませんでした。
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
          <p className="text-gray-600 mb-4">{job.companies?.company_name}</p>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm">
              <span className="font-medium">給与:</span>{' '}
              {job.salary_type === 'monthly' ? '月給' : job.salary_type === 'daily' ? '日給' : '歩合制'}{' '}
              {job.salary_min.toLocaleString()}円 〜 {job.salary_max.toLocaleString()}円
            </p>
            <p className="text-sm">
              <span className="font-medium">勤務地:</span>{' '}
              {job.prefecture}{job.city}
            </p>
            <p className="text-sm">
              <span className="font-medium">雇用形態:</span>{' '}
              {job.employment_type === 'full_time' ? '正社員' : 
               job.employment_type === 'part_time' ? 'パート・アルバイト' : '契約社員'}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Link 
              href={`/jobs/${job.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              詳細を見る →
            </Link>
            <div className="flex items-center space-x-2">
              <FavoriteButton jobId={job.id} />
              <span className="text-sm text-gray-500">
                {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 