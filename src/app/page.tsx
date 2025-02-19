import Image from "next/image";
import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import FeaturedJobs from "@/components/FeaturedJobs";
import FeatureContent from "@/components/FeatureContent";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* メインビジュアル */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="タクシードライバー"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black opacity-50" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            あなたの新しいキャリアが、
            <br />
            ここから始まる
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            プロフェッショナルなタクシードライバーとして活躍しませんか？
          </p>
          <Link
            href="/search"
            className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            求人を探す
          </Link>
        </div>
      </section>

      {/* 求人検索フォーム */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">求人検索</h2>
          <SearchForm />
        </div>
      </section>

      {/* おすすめ求人一覧 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">おすすめ求人</h2>
          <FeaturedJobs />
        </div>
      </section>

      {/* 特集コンテンツ */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">特集</h2>
          <FeatureContent />
        </div>
      </section>

      {/* 求人掲載企業向けCTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            タクシードライバーを募集する企業様へ
          </h2>
          <p className="text-white text-xl mb-8">
            優秀なドライバーとの出会いをサポートします
          </p>
          <Link
            href="/jobs/post"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            求人を掲載する
          </Link>
        </div>
      </section>
    </div>
  );
}