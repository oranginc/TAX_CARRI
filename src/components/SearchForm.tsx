"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    area: "",
    employmentType: "",
    salaryType: "",
    experience: "",
  });

  const prefectures = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
  ];

  const employmentTypes = [
    { value: "full_time", label: "正社員" },
    { value: "part_time", label: "アルバイト・パート" },
    { value: "contract", label: "契約社員" },
    { value: "temporary", label: "派遣社員" },
  ];

  const salaryTypes = [
    { value: "monthly", label: "月給" },
    { value: "daily", label: "日給" },
    { value: "hourly", label: "時給" },
    { value: "commission", label: "歩合制" },
  ];

  const experienceTypes = [
    { value: "none", label: "未経験可" },
    { value: "1_year", label: "1年以上" },
    { value: "3_years", label: "3年以上" },
    { value: "5_years", label: "5年以上" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    router.push(`/search?${queryParams.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
            エリア
          </label>
          <select
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {prefectures.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
            雇用形態
          </label>
          <select
            id="employmentType"
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {employmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="salaryType" className="block text-sm font-medium text-gray-700 mb-1">
            給与形態
          </label>
          <select
            id="salaryType"
            name="salaryType"
            value={formData.salaryType}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {salaryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            経験・資格
          </label>
          <select
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {experienceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          検索する
        </button>
      </div>
    </form>
  );
}
