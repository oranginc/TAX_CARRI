'use client'
import React, { useState } from 'react'

interface JobSearchFormProps {
  onSearch: (params: {
    keyword?: string
    location?: string
    employmentType?: string
  }) => void
}

export default function JobSearchForm({ onSearch }: JobSearchFormProps) {
  const [searchParams, setSearchParams] = useState({
    prefecture: '',
    employmentType: '',
    salaryType: '',
    experience: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchParams)
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">エリア</label>
          <select
            name="prefecture"
            value={searchParams.prefecture}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">都道府県を選択</option>
            <option value="東京都">東京都</option>
            <option value="神奈川県">神奈川県</option>
            <option value="埼玉県">埼玉県</option>
            <option value="千葉県">千葉県</option>
            {/* 他の都道府県 */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">雇用形態</label>
          <select
            name="employmentType"
            value={searchParams.employmentType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            <option value="full_time">正社員</option>
            <option value="part_time">パート・アルバイト</option>
            <option value="contract">契約社員</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">給与形態</label>
          <select
            name="salaryType"
            value={searchParams.salaryType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            <option value="monthly">月給</option>
            <option value="daily">日給</option>
            <option value="commission">歩合制</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">経験</label>
          <select
            name="experience"
            value={searchParams.experience}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            <option value="未経験可">未経験可</option>
            <option value="経験者優遇">経験者優遇</option>
            <option value="経験必須">経験必須</option>
          </select>
        </div>
      </div>

      <div className="text-center">
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700"
        >
          求人を検索
        </button>
      </div>
    </form>
  )
} 