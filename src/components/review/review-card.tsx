import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  review: {
    id: number;
    overall_rating: number;
    content: string;
    created_at: string;
    users_reviews_reviewer_idTousers?: {
      id: number;
      display_name: string;
      profile_photo_url: string | null;
    };
    review_replies?: {
      id: number;
      content: string;
      created_at: string;
      users: { display_name: string };
    }[];
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const reviewer = review.users_reviews_reviewer_idTousers;

  return (
    <div className="py-4 border-b last:border-b-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
          {reviewer?.profile_photo_url ? (
            <Image src={reviewer.profile_photo_url} alt="" fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              {reviewer?.display_name?.[0] || '?'}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-sm">{reviewer?.display_name || '게스트'}</p>
          <p className="text-xs text-gray-500">
            {format(new Date(review.created_at), 'yyyy년 M월', { locale: ko })}
          </p>
        </div>
      </div>

      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < review.overall_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-line">{review.content}</p>

      {review.review_replies && review.review_replies.length > 0 && (
        <div className="mt-3 ml-6 p-3 bg-gray-50 rounded-lg">
          {review.review_replies.map((reply) => (
            <div key={reply.id}>
              <p className="text-sm font-medium mb-1">{reply.users.display_name}님의 답글</p>
              <p className="text-sm text-gray-600">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
