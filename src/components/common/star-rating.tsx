'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: number;
  readonly?: boolean;
}

export function StarRating({ value, onChange, max = 5, size = 24, readonly = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hoverValue || value);

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            className={cn('transition-colors', readonly ? 'cursor-default' : 'cursor-pointer')}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
          >
            <Star
              size={size}
              className={cn(
                isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
