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
    <div className="space-y-6">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <Link href={`/jobs/${job.id}`}>
            <div className="flex flex-col md:flex-row">
              {/* 左側：会社情報 */}
              <div className="w-full md:w-1/4 bg-gray-50 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {job.companies?.company_name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {job.prefecture}{job.city}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {job.employment_type === 'full_time' ? '正社員' : 
                     job.employment_type === 'part_time' ? 'パート・アルバイト' : '契約社員'}
                  </span>
                </div>
              </div>

              {/* 右側：求人詳細 */}
              <div className="w-full md:w-3/4 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-gray-900">
                    {job.title}
                  </h4>
                  <FavoriteButton jobId={job.id} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">給与</span>
                    <p className="text-base text-gray-900">
                      {job.salary_type === 'monthly' ? '月給' : 
                       job.salary_type === 'daily' ? '日給' : '歩合制'}{' '}
                      {job.salary_min.toLocaleString()}円 〜 {job.salary_max.toLocaleString()}円
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">勤務時間</span>
                    <p className="text-base text-gray-900">{job.working_hours}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {job.description}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {job.required_license.map((license, index) => (
                      <span 
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {license}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
} 