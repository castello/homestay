'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Pin, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notice {
  id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  view_count: number;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotices = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notices?page=${page}&limit=10`);
      const data = await res.json();
      setNotices(data.notices || []);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices(currentPage);
  }, [currentPage]);

  if (loading && notices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="space-y-3 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">공지사항</h1>
        <p className="text-gray-500 mb-8">
          홈스테이의 새로운 소식과 업데이트를 확인하세요
        </p>

        {notices.length > 0 ? (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      제목
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 w-24 hidden sm:table-cell">
                      조회수
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 w-32 hidden sm:table-cell">
                      작성일
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notices.map((notice) => (
                    <tr
                      key={notice.id}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        notice.is_pinned && 'bg-rose-50/50'
                      )}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/notices/${notice.id}`}
                          className="flex items-center gap-2 hover:text-rose-600"
                        >
                          {notice.is_pinned && (
                            <Pin className="h-4 w-4 text-rose-500 flex-shrink-0" />
                          )}
                          <span
                            className={cn(
                              'font-medium',
                              notice.is_pinned && 'text-rose-700'
                            )}
                          >
                            {notice.title}
                          </span>
                        </Link>
                        <div className="sm:hidden mt-1 text-xs text-gray-400 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {notice.view_count}
                          </span>
                          <span>
                            {format(new Date(notice.created_at), 'yyyy.MM.dd')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500 hidden sm:table-cell">
                        <span className="flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4" />
                          {notice.view_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500 hidden sm:table-cell">
                        {format(new Date(notice.created_at), 'yyyy.MM.dd', {
                          locale: ko,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                {/* First page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="첫 페이지"
                >
                  <ChevronsLeft className="h-5 w-5" />
                </button>
                {/* Previous page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="이전 페이지"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {/* Page numbers */}
                {(() => {
                  const totalPages = pagination.totalPages;
                  const maxVisible = 10;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let endPage = startPage + maxVisible - 1;

                  if (endPage > totalPages) {
                    endPage = totalPages;
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  return Array.from(
                    { length: endPage - startPage + 1 },
                    (_, i) => startPage + i
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'w-10 h-10 rounded-lg font-medium',
                        page === currentPage
                          ? 'bg-rose-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      )}
                    >
                      {page}
                    </button>
                  ));
                })()}
                {/* Next page */}
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1)
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="다음 페이지"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                {/* Last page */}
                <button
                  onClick={() => setCurrentPage(pagination.totalPages)}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="마지막 페이지"
                >
                  <ChevronsRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400">
            <p className="text-lg">등록된 공지사항이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
