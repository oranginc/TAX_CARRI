'use client'
import React, { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import JobSearchForm from '@/components/JobSearchForm'
import JobList from '@/components/JobList'
import Pagination from '@/components/Pagination'
import type { Job } from '@/types/database.types'

const ITEMS_PER_PAGE = 10

export default function SearchPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearch = async (searchParams: {
    prefecture?: string
    employmentType?: string
    salaryType?: string
    experience?: string
  }) => {
    setIsLoading(true)
    try {
      // Count クエリ
      const countQuery = supabase
        .from('jobs')
        .select('id', { count: 'exact' })
        .eq('status', 'active')

      // データクエリ
      let dataQuery = supabase
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
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)

      // 検索条件の適用
      if (searchParams.prefecture) {
        countQuery.eq('prefecture', searchParams.prefecture)
        dataQuery = dataQuery.eq('prefecture', searchParams.prefecture)
      }
      if (searchParams.employmentType) {
        countQuery.eq('employment_type', searchParams.employmentType)
        dataQuery = dataQuery.eq('employment_type', searchParams.employmentType)
      }
      if (searchParams.salaryType) {
        countQuery.eq('salary_type', searchParams.salaryType)
        dataQuery = dataQuery.eq('salary_type', searchParams.salaryType)
      }
      if (searchParams.experience === '未経験可') {
        countQuery.eq('required_experience', '未経験可')
        dataQuery = dataQuery.eq('required_experience', '未経験可')
      }

      const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
      ])

      if (countResult.error) throw countResult.error
      if (dataResult.error) throw dataResult.error

      setTotalCount(countResult.count || 0)
      setJobs(dataResult.data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    handleSearch({}) // 現在の検索条件で再検索
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">求人検索</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <JobSearchForm onSearch={handleSearch} />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <JobList jobs={jobs} />
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  )
} 