"use client";

import { useState } from "react";

const faqs = [
  {
    question: "未経験でも応募できますか？",
    answer:
      "はい、未経験の方も歓迎しています。入社後は充実した研修制度でサポートしますので、安心してご応募ください。ただし、普通自動車免許（1種）は必要です。",
  },
  {
    question: "二種免許の取得支援はありますか？",
    answer:
      "はい、多くの会社で二種免許取得支援制度を設けています。免許取得費用の補助や、取得期間中の給与保証など、会社によって支援内容は異なります。",
  },
  {
    question: "収入はどのくらいになりますか？",
    answer:
      "経験や勤務形態によって異なりますが、多くの場合、月給25万円～45万円程度です。歩合制を採用している会社も多く、頑張った分だけ収入アップも可能です。",
  },
  {
    question: "勤務時間・シフトはどのようになっていますか？",
    answer:
      "一般的に、早番・遅番などのシフト制となっています。具体的な勤務時間は会社によって異なりますが、労働基準法に基づいた適切な勤務時間・休憩時間が設定されています。",
  },
  {
    question: "女性ドライバーも活躍できますか？",
    answer:
      "はい、多くの会社で女性ドライバーが活躍しています。女性専用の休憩室や更衣室を完備している会社も増えており、働きやすい環境が整っています。",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">よくある質問</h2>
      <dl className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
          >
            <dt>
              <button
                className="flex w-full items-start justify-between text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-base font-medium text-gray-900">
                  {faq.question}
                </span>
                <span className="ml-6 flex items-center">
                  {openIndex === index ? (
                    <svg
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                </span>
              </button>
            </dt>
            {openIndex === index && (
              <dd className="mt-2 pr-12">
                <p className="text-base text-gray-600">{faq.answer}</p>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}
