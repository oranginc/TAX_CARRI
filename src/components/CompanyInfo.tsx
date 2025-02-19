"use client";

import Link from "next/link";

type CompanyInfoProps = {
  company: {
    id: string;
    name: string;
    size: string;
    vehicles: number;
    service_areas: string[];
  };
};

export default function CompanyInfo({ company }: CompanyInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">会社情報</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">会社名</h3>
          <p className="mt-1 text-base text-gray-900">{company.name}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">企業規模</h3>
          <p className="mt-1 text-base text-gray-900">{company.size}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">保有車両数</h3>
          <p className="mt-1 text-base text-gray-900">{company.vehicles}台</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">営業エリア</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {company.service_areas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/companies/${company.id}`}
          className="block w-full text-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
        >
          会社の詳細を見る
        </Link>
      </div>
    </div>
  );
}
