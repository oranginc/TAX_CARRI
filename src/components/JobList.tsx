'use client'
import React from 'react'
import Link from 'next/link'
import { Job } from '@/types/job'

type JobListProps = {
  jobs: Job[]
}

export default function JobList({ jobs }: JobListProps) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          条件に一致する求人が見つかりませんでした。
          <br />
          検索条件を変更して再度お試しください。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                >
                  {job.title}
                </Link>
                <p className="mt-1 text-base text-gray-600">{job.company_name}</p>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(job.created_at).toLocaleDateString('ja-JP')}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {job.location}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {job.employment_type}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {job.experience_level}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-base text-gray-600 line-clamp-2">
                {job.description}
              </p>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">
                {job.salary}
              </div>
              <Link
                href={`/jobs/${job.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                詳細を見る
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}