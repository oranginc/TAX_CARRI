"use client";

import { useState } from "react";

type ApplicationFormProps = {
  jobId: string;
};

export default function ApplicationForm({ jobId }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hasLicense: "no",
    experience: "none",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // TODO: Supabaseに応募データを保存する実装
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 仮の遅延
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("応募の送信に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
          >
            <circle
              className="opacity-25"
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M14 27l6.16 6L36 17"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            応募を受け付けました
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            担当者からのご連絡をお待ちください。
            <br />
            通常3営業日以内にご連絡いたします。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">応募フォーム</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            お名前
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            電話番号
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="hasLicense"
            className="block text-sm font-medium text-gray-700"
          >
            二種免許の有無
          </label>
          <select
            id="hasLicense"
            name="hasLicense"
            required
            value={formData.hasLicense}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="no">なし</option>
            <option value="yes">あり</option>
            <option value="in_progress">取得予定</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="experience"
            className="block text-sm font-medium text-gray-700"
          >
            タクシー運転歴
          </label>
          <select
            id="experience"
            name="experience"
            required
            value={formData.experience}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="none">なし</option>
            <option value="less_than_1">1年未満</option>
            <option value="1_to_3">1年以上3年未満</option>
            <option value="3_to_5">3年以上5年未満</option>
            <option value="more_than_5">5年以上</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            自己PR・志望動機
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            value={formData.message}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "送信中..." : "応募する"}
          </button>
        </div>
      </form>
    </div>
  );
}
