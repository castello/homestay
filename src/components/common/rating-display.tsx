import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingDisplay({ rating, reviewCount, size = 'md' }: RatingDisplayProps) {
  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 18;
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  if (rating === 0 && (!reviewCount || reviewCount === 0)) {
    return <span className={`${textSize} text-gray-500`}>신규</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${textSize}`}>
      <Star size={iconSize} className="fill-yellow-400 text-yellow-400" />
      <span className="font-medium">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-gray-500">({reviewCount})</span>
      )}
    </span>
  );
}
