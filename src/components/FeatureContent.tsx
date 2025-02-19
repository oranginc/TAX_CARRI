'use client'
import React from 'react';
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    id: 1,
    title: "タクシードライバーの仕事とは",
    description:
      "タクシードライバーの1日の流れや、必要なスキル、資格要件などを詳しく解説します。",
    image: "/images/feature1.jpg",
    link: "/features/taxi-driver-job",
  },
  {
    id: 2,
    title: "業界動向",
    description:
      "タクシー業界の最新トレンドや、働き方改革、テクノロジーの導入など、業界の変化をお伝えします。",
    image: "/images/feature2.jpg",
    link: "/features/industry-trends",
  },
  {
    id: 3,
    title: "転職成功事例",
    description:
      "実際に転職に成功したドライバーの体験談や、成功のポイントをご紹介します。",
    image: "/images/feature3.jpg",
    link: "/features/success-stories",
  },
];

export default function FeatureContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <Link
          key={feature.id}
          href={feature.link}
          className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative h-48">
            <Image
              src={feature.image}
              alt={feature.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
            <div className="mt-4 flex items-center text-blue-600 font-medium">
              詳しく見る
              <svg
                className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}