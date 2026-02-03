'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/common/star-rating';
import { toast } from 'sonner';

interface ReviewFormProps {
  reservationId: number;
  accommodationName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ratingCategories = [
  { key: 'cleanlinessRating', label: '청결도' },
  { key: 'accuracyRating', label: '정확성' },
  { key: 'communicationRating', label: '의사소통' },
  { key: 'locationRating', label: '위치' },
  { key: 'checkinRating', label: '체크인' },
  { key: 'valueRating', label: '가격 대비 만족도' },
];

export function ReviewForm({ reservationId, accommodationName, onSuccess, onCancel }: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [content, setContent] = useState('');
  const [privateFeedback, setPrivateFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast.error('전체 평점을 선택해주세요.');
      return;
    }
    if (content.length < 20) {
      toast.error('리뷰는 20자 이상 작성해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          overallRating,
          ...categoryRatings,
          content,
          privateFeedback: privateFeedback || undefined,
        }),
      });

      if (res.ok) {
        toast.success('리뷰가 등록되었습니다.');
        onSuccess?.();
      } else {
        const data = await res.json();
        toast.error(data.error || '리뷰 등록에 실패했습니다.');
      }
    } catch {
      toast.error('리뷰 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">{accommodationName} 리뷰 작성</h3>

      <div>
        <Label className="mb-2 block">전체 평점</Label>
        <StarRating value={overallRating} onChange={setOverallRating} size={32} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ratingCategories.map((cat) => (
          <div key={cat.key}>
            <Label className="mb-1 block text-sm">{cat.label}</Label>
            <StarRating
              value={categoryRatings[cat.key] || 0}
              onChange={(v) => setCategoryRatings(prev => ({ ...prev, [cat.key]: v }))}
              size={20}
            />
          </div>
        ))}
      </div>

      <div>
        <Label className="mb-2 block">리뷰 내용 (최소 20자)</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="숙소 경험을 공유해주세요..."
          rows={4}
        />
        <p className="text-xs text-gray-400 mt-1">{content.length}/1000</p>
      </div>

      <div>
        <Label className="mb-2 block">비공개 피드백 (호스트에게만 표시)</Label>
        <Textarea
          value={privateFeedback}
          onChange={(e) => setPrivateFeedback(e.target.value)}
          placeholder="호스트에게 전달하고 싶은 피드백이 있다면 작성해주세요 (선택)"
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        {onCancel && <Button variant="outline" onClick={onCancel}>취소</Button>}
        <Button onClick={handleSubmit} disabled={submitting} className="bg-rose-500 hover:bg-rose-600">
          {submitting ? '등록 중...' : '리뷰 등록'}
        </Button>
      </div>
    </div>
  );
}
