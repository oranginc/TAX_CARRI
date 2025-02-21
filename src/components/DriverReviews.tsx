"use client";

type Review = {
  id: string;
  driverName: string;
  age: number;
  experience: string;
  comment: string;
  rating: number;
  avatar?: string;
};

type DriverReviewsProps = {
  reviews: Review[];
};

const sampleReviews: Review[] = [
  {
    id: "1",
    driverName: "田中 健一",
    age: 45,
    experience: "5年",
    comment:
      "以前は営業職でしたが、転職してタクシードライバーになりました。自分のペースで働けて、収入も安定しています。会社のサポート体制も充実していて、とても働きやすい環境です。",
    rating: 5,
  },
  {
    id: "2",
    driverName: "鈴木 美咲",
    age: 35,
    experience: "2年",
    comment:
      "女性ドライバーとして働いていますが、会社は女性が働きやすい環境づくりに力を入れています。研修制度も充実していて、未経験でも安心してスタートできました。",
    rating: 4,
  },
  {
    id: "3",
    driverName: "佐藤 正樹",
    age: 52,
    experience: "8年",
    comment:
      "長年タクシードライバーとして働いていますが、この会社の福利厚生は特に充実しています。有給休暇も取りやすく、ワークライフバランスを保ちやすい環境です。",
    rating: 5,
  },
];

export default function DriverReviews({ reviews = sampleReviews }: DriverReviewsProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`h-5 w-5 ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 15.934l-6.18 3.254 1.18-6.883L.083 7.571l6.9-1.002L10 .333l3.017 6.236 6.9 1.002-4.917 4.734 1.18 6.883z"
          clipRule="evenodd"
        />
      </svg>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">在籍ドライバーの声</h2>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.driverName}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">
                      {review.driverName[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {review.driverName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {review.age}歳 / 経験{review.experience}
                    </p>
                  </div>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                <p className="mt-2 text-base text-gray-600">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
