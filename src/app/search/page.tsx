"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import JobCard from "@/components/JobCard";
import SearchFilters from "@/components/SearchFilters";
import JobSearchForm from '@/components/JobSearchForm'
import JobList from '@/components/JobList'
import Pagination from '@/components/Pagination'
import type { Job } from '@/types/database.types'

const ITEMS_PER_PAGE = 10

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearch = async (searchParams: {
    prefecture?: string
    employmentType?: string
    salaryType?: string
    experience?: string
  }) => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    handleSearch({}) // 現在の検索条件で再検索
  }

  useEffect(() => {
    handleSearch({})
  }, [searchParams])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">求人検索結果</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* フィルターサイドバー */}
        <div className="hidden lg:block lg:col-span-3">
          <SearchFilters />
        </div>

        {/* 求人一覧 */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">求人情報を読み込み中...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-6">
              <JobSearchForm onSearch={handleSearch} />
              <JobList jobs={jobs} />
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalCount}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                条件に一致する求人が見つかりませんでした。
                <br />
                検索条件を変更して再度お試しください。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}