"use client";

import { useRouter } from 'next/navigation';

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange?: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const router = useRouter();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('page', page.toString());
      router.push(`?${searchParams.toString()}`);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center">
      <ul className="flex items-center space-x-1">
        {/* 前のページ */}
        <li>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
        </li>

        {/* ページ番号 */}
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          const isCurrentPage = page === currentPage;

          return (
            <li key={page}>
              <button
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isCurrentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            </li>
          );
        })}

        {/* 次のページ */}
        <li>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </li>
      </ul>
    </nav>
  );
}