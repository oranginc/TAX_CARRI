"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ApplicationForm from "@/components/ApplicationForm";
import CompanyInfo from "@/components/CompanyInfo";
import FAQ from "@/components/FAQ";
import DriverReviews from "@/components/DriverReviews";

type JobDetail = {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary: string;
  employment_type: string;
  working_hours: string;
  benefits: string[];
  requirements: string[];
  description: string;
  image_url: string;
  company: {
    id: string;
    name: string;
    size: string;
    vehicles: number;
    service_areas: string[];
  };
};

export default function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Supabaseからデータを取得する実装
    // サンプルデータを使用
    const sampleJob: JobDetail = {
      id: params.id,
      title: "タクシードライバー募集！未経験者歓迎",
      company_name: "第一交通株式会社",
      location: "東京都新宿区",
      salary: "月給30万円～45万円",
      employment_type: "正社員",
      working_hours: "シフト制（実働8時間）",
      benefits: [
        "社会保険完備",
        "制服貸与",
        "研修制度あり",
        "社員寮あり",
        "賞与年2回",
      ],
      requirements: [
        "普通自動車第二種免許（2種免許）",
        "経験不問",
        "未経験者歓迎",
      ],
      description: `
        私たちは、お客様に安全で快適な移動サービスを提供することを使命としています。
        
        【具体的な仕事内容】
        ・お客様の送迎
        ・車両の点検・清掃
        ・売上金の精算
        
        【研修制度】
        未経験の方でも安心して働けるよう、充実した研修制度を用意しています。
        ・入社時研修（2週間）
        ・実地研修（1ヶ月）
        ・フォローアップ研修
        
        【勤務シフト】
        早番・遅番のシフト制
        ・早番：5:00～14:00
        ・遅番：14:00～23:00
        ※実働8時間
        
        【給与詳細】
        ・月給30万円～45万円
        ・歩合給あり
        ・深夜手当あり
        ・残業手当あり
        
        【待遇・福利厚生】
        ・社会保険完備
        ・制服貸与
        ・社員寮あり（月2万円～）
        ・賞与年2回
        ・有給休暇
        ・定期健康診断
      `,
      image_url: "/images/company1.jpg",
      company: {
        id: "1",
        name: "第一交通株式会社",
        size: "従業員数 500名以上",
        vehicles: 300,
        service_areas: ["新宿区", "渋谷区", "港区", "千代田区"],
      },
    };

    setJob(sampleJob);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            求人が見つかりません
          </h1>
          <p className="text-gray-600 mb-8">
            お探しの求人は削除されたか、URLが間違っている可能性があります。
          </p>
          <Link
            href="/search"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            求人検索に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          {/* 求人ヘッダー */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="relative h-64">
              <Image
                src={job.image_url}
                alt={job.company_name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {job.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">{job.company_name}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">勤務地</h2>
                  <p className="mt-1 text-lg text-gray-900">{job.location}</p>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">給与</h2>
                  <p className="mt-1 text-lg text-gray-900">{job.salary}</p>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">雇用形態</h2>
                  <p className="mt-1 text-lg text-gray-900">
                    {job.employment_type}
                  </p>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">勤務時間</h2>
                  <p className="mt-1 text-lg text-gray-900">{job.working_hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 求人詳細 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">仕事内容</h2>
            <div className="prose max-w-none">
              {job.description.split("\n").map((line, index) => (
                <p key={index} className="mb-4">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* 応募資格 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">応募資格</h2>
            <ul className="list-disc list-inside space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="text-gray-600">
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* 福利厚生 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">福利厚生</h2>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* よくある質問 */}
          <FAQ />

          {/* 在籍ドライバーの声 */}
          <DriverReviews reviews={[
            {
              id: "1",
              driverName: "田中 健一",
              age: 45,
              experience: "5年",
              comment: "以前は営業職でしたが、転職してタクシードライバーになりました。自分のペースで働けて、収入も安定しています。会社のサポート体制も充実していて、とても働きやすい環境です。",
              rating: 5,
            },
            {
              id: "2",
              driverName: "鈴木 美咲",
              age: 35,
              experience: "2年",
              comment: "女性ドライバーとして働いていますが、会社は女性が働きやすい環境づくりに力を入れています。研修制度も充実していて、未経験でも安心してスタートできました。",
              rating: 4,
            }
          ]} />
        </div>

        {/* サイドバー */}
        <div className="lg:col-span-1 space-y-8">
          {/* 応募フォーム */}
          <ApplicationForm jobId={job.id} />

          {/* 会社情報 */}
          <CompanyInfo company={job.company} />
        </div>
      </div>
    </div>
  );
}