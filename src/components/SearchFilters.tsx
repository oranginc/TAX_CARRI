"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    area: searchParams.get("area") || "",
    employmentType: searchParams.get("employmentType") || "",
    salaryRange: searchParams.get("salaryRange") || "",
    experience: searchParams.get("experience") || "",
    benefits: searchParams.get("benefits")?.split(",") || [],
  });

  const employmentTypes = [
    { value: "full_time", label: "正社員" },
    { value: "part_time", label: "アルバイト・パート" },
    { value: "contract", label: "契約社員" },
    { value: "temporary", label: "派遣社員" },
  ];

  const salaryRanges = [
    { value: "200-300", label: "20-30万円" },
    { value: "300-400", label: "30-40万円" },
    { value: "400-500", label: "40-50万円" },
    { value: "500-", label: "50万円以上" },
  ];

  const experienceOptions = [
    { value: "none", label: "未経験可" },
    { value: "1_year", label: "1年以上" },
    { value: "3_years", label: "3年以上" },
    { value: "5_years", label: "5年以上" },
  ];

  const benefitOptions = [
    { value: "insurance", label: "社会保険完備" },
    { value: "housing", label: "住宅手当あり" },
    { value: "training", label: "研修制度あり" },
    { value: "uniform", label: "制服貸与" },
    { value: "bonus", label: "賞与あり" },
  ];

  const handleFilterChange = (
    name: string,
    value: string | string[]
  ) => {
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);

    // URLパラメータを更新
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      }
    });

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">絞り込み検索</h3>
        <div className="space-y-6">
          {/* エリア */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              エリア
            </label>
            <select
              value={filters.area}
              onChange={(e) => handleFilterChange("area", e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              <option value="東京都">東京都</option>
              <option value="神奈川県">神奈川県</option>
              <option value="千葉県">千葉県</option>
              <option value="埼玉県">埼玉県</option>
            </select>
          </div>

          {/* 雇用形態 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              雇用形態
            </label>
            <select
              value={filters.employmentType}
              onChange={(e) => handleFilterChange("employmentType", e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              {employmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* 給与範囲 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              給与範囲
            </label>
            <select
              value={filters.salaryRange}
              onChange={(e) => handleFilterChange("salaryRange", e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              {salaryRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* 経験 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              経験
            </label>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange("experience", e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              {experienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 福利厚生 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              福利厚生
            </label>
            <div className="space-y-2">
              {benefitOptions.map((benefit) => (
                <label key={benefit.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.benefits.includes(benefit.value)}
                    onChange={(e) => {
                      const newBenefits = e.target.checked
                        ? [...filters.benefits, benefit.value]
                        : filters.benefits.filter((b) => b !== benefit.value);
                      handleFilterChange("benefits", newBenefits);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {benefit.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
