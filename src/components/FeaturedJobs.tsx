"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Job = {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary: string;
  employment_type: string;
  image_url: string;
};

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    // TODO: Supabaseからデータを取得する実装
    // サンプルデータを使用
    const sampleJobs: Job[] = [
      {
        id: "1",
        title: "タクシードライバー募集！未経験者歓迎",
        company_name: "第一交通株式会社",
        location: "東京都新宿区",
        salary: "月給30万円～",
        employment_type: "正社員",
        image_url: "/images/company1.jpg",
      },
      {
        id: "2",
        title: "経験者優遇！タクシードライバー",
        company_name: "日本交通株式会社",
        location: "東京都港区",
        salary: "月給35万円～",
        employment_type: "正社員",
        image_url: "/images/company2.jpg",
      },
      {
        id: "3",
        title: "女性活躍中！タクシードライバー",
        company_name: "グリーンキャブ",
        location: "東京都渋谷区",
        salary: "月給28万円～",
        employment_type: "正社員",
        image_url: "/images/company3.jpg",
      },
    ];
    setJobs(sampleJobs);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/jobs/${job.id}`}
          className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative h-48">
            <Image
              src={job.image_url}
              alt={job.company_name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {job.title}
            </h3>
            <p className="text-gray-600 mb-4">{job.company_name}</p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-500">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </div>
              <div className="flex items-center text-gray-500">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.salary}
              </div>
              <div className="flex items-center text-gray-500">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {job.employment_type}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}