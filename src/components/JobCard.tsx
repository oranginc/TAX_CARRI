"use client";

import Image from "next/image";
import Link from "next/link";

type JobCardProps = {
  job: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary: string;
    employment_type: string;
    working_hours: string;
    benefits: string[];
    image_url: string;
  };
};

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/jobs/${job.id}`}>
        <div className="md:flex">
          {/* 会社画像 */}
          <div className="md:w-1/3 relative">
            <div className="h-48 md:h-full">
              <Image
                src={job.image_url}
                alt={job.company_name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* 求人情報 */}
          <div className="p-6 md:w-2/3">
            <div className="flex flex-col h-full">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h2>
                <p className="text-lg text-gray-600 mb-4">{job.company_name}</p>
              </div>

              <div className="space-y-3 flex-grow">
                <div className="flex items-center text-gray-600">
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

                <div className="flex items-center text-gray-600">
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

                <div className="flex items-center text-gray-600">
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {job.working_hours}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {job.employment_type}
                  </span>
                  {job.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
