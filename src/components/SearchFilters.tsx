"use client";

import { useRouter } from 'next/navigation';

type SearchFiltersProps = {
  currentFilters: {
    area?: string;
    employmentType?: string;
    experienceLevel?: string;
    salaryType?: string;
  };
};

export default function SearchFilters({ currentFilters }: SearchFiltersProps) {
  const router = useRouter();

  const handleFilterChange = (key: string, value: string) => {
    const searchParams = new URLSearchParams();
    
    // 現在のフィルターを全てセット
    Object.entries(currentFilters).forEach(([k, v]) => {
      if (v) searchParams.set(k, v);
    });
    
    // 新しい値をセット
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">絞り込み検索</h2>

      {/* エリア */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">エリア</h3>
        <select
          value={currentFilters.area || ''}
          onChange={(e) => handleFilterChange('area', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">全てのエリア</option>
          <option value="東京都">東京都</option>
          <option value="神奈川県">神奈川県</option>
          <option value="埼玉県">埼玉県</option>
          <option value="千葉県">千葉県</option>
        </select>
      </div>

      {/* 雇用形態 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">雇用形態</h3>
        <select
          value={currentFilters.employmentType || ''}
          onChange={(e) => handleFilterChange('employmentType', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">全ての雇用形態</option>
          <option value="正社員">正社員</option>
          <option value="契約社員">契約社員</option>
          <option value="パート・アルバイト">パート・アルバイト</option>
        </select>
      </div>

      {/* 経験 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">経験</h3>
        <select
          value={currentFilters.experienceLevel || ''}
          onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">全ての経験</option>
          <option value="未経験可">未経験可</option>
          <option value="経験者優遇">経験者優遇</option>
          <option value="経験必須">経験必須</option>
        </select>
      </div>

      {/* 給与形態 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">給与形態</h3>
        <select
          value={currentFilters.salaryType || ''}
          onChange={(e) => handleFilterChange('salaryType', e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">全ての給与形態</option>
          <option value="月給">月給</option>
          <option value="日給">日給</option>
          <option value="時給">時給</option>
        </select>
      </div>
    </div>
  );
}
