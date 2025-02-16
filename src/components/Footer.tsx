'use client'
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">タクシードライバー求人</h3>
            <p className="text-gray-400">
              タクシードライバーの求人情報サイト
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">リンク</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white">サイトについて</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white">利用規約</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white">プライバシーポリシー</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">お問い合わせ</h3>
            <p className="text-gray-400">
              お問い合わせはこちらから
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">&copy; 2024 タクシードライバー求人. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 