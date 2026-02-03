'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ReviewCard } from '@/components/review/review-card';
import { EmptyState } from '@/components/common/empty-state';

interface Review {
  id: number;
  overall_rating: number;
  content: string;
  created_at: string;
  users_reviews_reviewer_idTousers: {
    id: number;
    display_name: string;
    profile_photo_url: string | null;
  };
  review_replies: {
    id: number;
    content: string;
    created_at: string;
    users: { display_name: string };
  }[];
  accommodations: { id: number; name: string };
}

export default function HostReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const res = await fetch('/api/host/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch {
      toast.error('리뷰를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function submitReply(reviewId: number) {
    if (!replyContent.trim()) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });
      if (res.ok) {
        toast.success('답글이 등록되었습니다.');
        setReplyingTo(null);
        setReplyContent('');
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || '답글 등록에 실패했습니다.');
      }
    } catch {
      toast.error('답글 등록에 실패했습니다.');
    }
  }

  if (loading) return <div className="p-6"><p>로딩 중...</p></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">리뷰 관리</h1>

      {reviews.length === 0 ? (
        <EmptyState title="아직 받은 리뷰가 없습니다" />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <p className="text-xs text-gray-400 mb-2">{review.accommodations?.name}</p>
                <ReviewCard review={review} />
                {review.review_replies.length === 0 && (
                  <div className="mt-3">
                    {replyingTo === review.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="답글을 입력하세요..."
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => submitReply(review.id)} className="bg-rose-500 hover:bg-rose-600">등록</Button>
                          <Button size="sm" variant="outline" onClick={() => { setReplyingTo(null); setReplyContent(''); }}>취소</Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setReplyingTo(review.id)}>답글 작성</Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
