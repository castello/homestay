import { CURRENCIES } from '@/lib/constants';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  showPerNight?: boolean;
}

export function PriceDisplay({ amount, currency = 'KRW', className = '', showPerNight = false }: PriceDisplayProps) {
  const formatted = new Intl.NumberFormat(currency === 'KRW' ? 'ko-KR' : 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
  }).format(amount);

  return (
    <span className={className}>
      {formatted}
      {showPerNight && <span className="text-sm font-normal text-gray-500"> /박</span>}
    </span>
  );
}
