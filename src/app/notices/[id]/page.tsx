'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ArrowLeft, Pin, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notice {
  id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  view_count: number;
  created_at: string;
}

export default function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(`/api/notices/${id}`);
        if (!res.ok) {
          throw new Error('Notice not found');
        }
        const data = await res.json();
        setNotice(data.notice);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notice');
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            공지사항을 찾을 수 없습니다
          </h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <Button onClick={() => router.push('/notices')}>목록으로</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back button */}
        <Link
          href="/notices"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>

        {/* Notice header */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-start gap-3">
              {notice.is_pinned && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded">
                  <Pin className="h-3 w-3" />
                  중요
                </span>
              )}
              <h1 className="text-xl font-bold text-gray-900 flex-1">
                {notice.title}
              </h1>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(notice.created_at), 'yyyy년 MM월 dd일', {
                  locale: ko,
                })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                조회수 {notice.view_count}
              </span>
            </div>
          </div>

          {/* Notice content */}
          <div className="px-6 py-8">
            <div className="prose prose-gray max-w-none whitespace-pre-line">
              {notice.content}
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/notices')}
            className="px-8"
          >
            목록으로
          </Button>
        </div>
      </div>
    </div>
  );
}
