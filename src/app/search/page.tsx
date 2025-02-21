import { Metadata } from 'next';
import SearchFilters from '@/components/SearchFilters';
import JobCard from '@/components/JobCard';
import { supabase } from '@/utils/supabase';
import JobSearchForm from '@/components/JobSearchForm';
import JobList from '@/components/JobList';
import Pagination from '@/components/Pagination';
import { Job } from '@/types/job';

export const metadata: Metadata = {
  title: '求人検索 | TAX CARRI - タクシードライバー求人サイト',
  description: 'タクシードライバーの求人情報を検索できます。地域、雇用形態、給与形態など、様々な条件で絞り込み可能です。',
};

// モックデータ
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: '未経験歓迎！充実した研修制度でプロドライバーへ',
    company_name: '株式会社タクシーサービス',
    prefecture: '東京都',
    city: '新宿区',
    location: '東京都新宿区',
    salary_type: '月給',
    salary_min: 300000,
    salary_max: 450000,
    salary: '月給30万円〜45万円',
    employment_type: '正社員',
    experience_level: '未経験者歓迎',
    description: '未経験からでも安心して始められる充実した研修制度があります。...',
    benefits: ['社会保険完備', '制服貸与', '研修制度あり'],
    requirements: ['普通自動車免許（1種）', '21歳以上'],
    working_hours: '8:00-17:00（実働8時間）',
    holidays: '週休2日制（シフト制）',
    insurance: '社会保険完備',
    allowances: '住宅手当、家族手当、深夜手当',
    created_at: '2024-02-19',
    status: 'active'
  },
  {
    id: '2',
    title: '経験者優遇！高収入が目指せるタクシードライバー',
    company_name: '東京タクシー株式会社',
    prefecture: '東京都',
    city: '渋谷区',
    location: '東京都渋谷区',
    salary_type: '月給',
    salary_min: 350000,
    salary_max: 500000,
    salary: '月給35万円〜50万円',
    employment_type: '正社員',
    experience_level: '経験者優遇',
    description: 'タクシードライバー経験者の方、大歓迎です。充実した待遇で長く働ける環境です。',
    benefits: ['社会保険完備', '制服貸与', '報奨金制度あり'],
    requirements: ['普通自動車免許（1種）', '二種免許保持者'],
    working_hours: '7:00-16:00（実働8時間）',
    holidays: '週休2日制（シフト制）',
    insurance: '社会保険完備',
    allowances: '住宅手当、家族手当、深夜手当、報奨金',
    created_at: '2024-02-18',
    status: 'active'
  }
];

const ITEMS_PER_PAGE = 10

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 検索パラメータの取得
  const area = searchParams.area as string;
  const employmentType = searchParams.employmentType as string;
  const experienceLevel = searchParams.experienceLevel as string;
  const salaryType = searchParams.salaryType as string;

  // 一時的にモックデータを使用
  const jobs = MOCK_JOBS;
  const totalJobs = MOCK_JOBS.length;

  const currentPage = 1

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">求人検索</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* サイドバー */}
        <div className="w-full lg:w-1/4">
          <SearchFilters
            currentFilters={{
              area,
              employmentType,
              experienceLevel,
              salaryType,
            }}
          />
        </div>

        {/* 求人一覧 */}
        <div className="w-full lg:w-3/4">
          <div className="space-y-6">
            <JobSearchForm />
            <JobList jobs={jobs} />
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalItems={totalJobs}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}