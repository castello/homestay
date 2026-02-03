'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/empty-state';

interface Term {
  id: number;
  type: string;
  version: string;
  content: string;
  is_current: boolean;
  effective_date: string;
  created_at: string;
}

export default function AdminTermsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTerms() {
      try {
        const res = await fetch('/api/admin/settings?type=terms');
        if (res.ok) {
          const data = await res.json();
          setTerms(data.terms || []);
        }
      } catch {
        toast.error('약관을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchTerms();
  }, []);

  const termTypeMap: Record<string, string> = {
    service: '서비스 이용약관',
    privacy: '개인정보처리방침',
    location: '위치정보 이용약관',
    marketing: '마케팅 수신동의',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">약관 관리</h1>

      {terms.length === 0 ? (
        <EmptyState title="약관이 없습니다" />
      ) : (
        <div className="space-y-4">
          {terms.map((term) => (
            <Card key={term.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {termTypeMap[term.type] || term.type} v{term.version}
                  </CardTitle>
                  <div className="flex gap-2">
                    {term.is_current && <Badge>현행</Badge>}
                    <Badge variant="outline">
                      {format(new Date(term.effective_date), 'yyyy.M.d')} 시행
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto text-sm text-gray-600 whitespace-pre-line">
                  {term.content?.substring(0, 500)}...
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm">전체 보기</Button>
                  <Button variant="outline" size="sm">새 버전 작성</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
