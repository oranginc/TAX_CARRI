'use client'
import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">タクシードライバー求人</span>
            </Link>
          </div>
          
          <nav className="flex space-x-8">
            <div className="flex items-center space-x-4">
              <Link href="/search" className="text-gray-700 hover:text-gray-900">
                求人検索
              </Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-gray-900">
                ログイン
              </Link>
              <Link 
                href="/jobs/post" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                求人掲載
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
} 