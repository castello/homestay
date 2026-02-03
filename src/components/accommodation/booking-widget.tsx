'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Minus, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { useSearchStore } from '@/stores/search-store';
import { toast } from 'sonner';

interface BookingWidgetProps {
  accommodation: {
    id: number;
    base_price: number;
    weekend_price?: number | null;
    cleaning_fee?: number;
    max_guests: number;
    min_nights?: number;
    max_nights?: number;
    avg_rating?: number;
    review_count?: number;
  };
}

interface PriceData {
  accommodationFee: number;
  extraGuestFee: number;
  cleaningFee: number;
  longStayDiscount: number;
  guestServiceFee: number;
  totalPrice: number;
  nights: number;
}

export function BookingWidget({ accommodation }: BookingWidgetProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const searchStore = useSearchStore();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (searchStore.checkin && searchStore.checkout) {
      return { from: new Date(searchStore.checkin), to: new Date(searchStore.checkout) };
    }
    return undefined;
  });
  const [guestAdults, setGuestAdults] = useState(searchStore.adults || 1);
  const [guestChildren, setGuestChildren] = useState(searchStore.children || 0);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  const nights = dateRange?.from && dateRange?.to
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;

  const totalGuests = guestAdults + guestChildren;
  const basePrice = Number(accommodation.base_price);

  const fetchPrice = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to || nights <= 0) {
      setPriceData(null);
      return;
    }
    setLoadingPrice(true);
    try {
      const ci = format(dateRange.from, 'yyyy-MM-dd');
      const co = format(dateRange.to, 'yyyy-MM-dd');
      const res = await fetch(
        `/api/accommodations/${accommodation.id}/price?checkin=${ci}&checkout=${co}&adults=${guestAdults}&children=${guestChildren}`
      );
      if (res.ok) {
        setPriceData(await res.json());
      }
    } catch {
      console.error('Failed to fetch price');
    } finally {
      setLoadingPrice(false);
    }
  }, [dateRange, guestAdults, guestChildren, accommodation.id, nights]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      searchStore.setDates(format(range.from, 'yyyy-MM-dd'), format(range.to, 'yyyy-MM-dd'));
      setDateOpen(false);
    }
  };

  const handleReserve = () => {
    if (!session) {
      toast.error('\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.');
      router.push('/login');
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('\uB0A0\uC9DC\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694.');
      return;
    }
    searchStore.setDates(format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd'));
    searchStore.setGuests(guestAdults, guestChildren, 0);
    router.push('/booking/' + accommodation.id);
  };

  const adjustGuest = (type: 'adults' | 'children', delta: number) => {
    if (type === 'adults') {
      setGuestAdults(Math.max(1, Math.min(guestAdults + delta, accommodation.max_guests - guestChildren)));
    } else {
      setGuestChildren(Math.max(0, Math.min(guestChildren + delta, accommodation.max_guests - guestAdults)));
    }
  };

  const won = '\u20A9';

  return (
    <Card className="sticky top-20">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{won}{basePrice.toLocaleString()}</span>
          <span className="text-gray-500">/\uBC15</span>
        </div>

        {accommodation.avg_rating != null && Number(accommodation.avg_rating) > 0 && (
          <div className="text-sm text-gray-600">
            {'\u2605'} {Number(accommodation.avg_rating).toFixed(1)}
            {accommodation.review_count ? ' (' + accommodation.review_count + '\uAC1C \uB9AC\uBDF0)' : ''}
          </div>
        )}

        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <button className="w-full border rounded-lg text-left">
              <div className="grid grid-cols-2 divide-x">
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase">{'\uCCB4\uD06C\uC778'}</p>
                  <p className="text-sm">
                    {dateRange?.from ? format(dateRange.from, 'M\uC6D4 d\uC77C', { locale: ko }) : '\uB0A0\uC9DC \uC120\uD0DD'}
                  </p>
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase">{'\uCCB4\uD06C\uC544\uC6C3'}</p>
                  <p className="text-sm">
                    {dateRange?.to ? format(dateRange.to, 'M\uC6D4 d\uC77C', { locale: ko }) : '\uB0A0\uC9DC \uC120\uD0DD'}
                  </p>
                </div>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
              locale={ko}
            />
          </PopoverContent>
        </Popover>

        <Popover open={guestOpen} onOpenChange={setGuestOpen}>
          <PopoverTrigger asChild>
            <button className="w-full border rounded-lg p-3 flex items-center justify-between text-left">
              <div>
                <p className="text-[10px] font-bold uppercase">{'\uC778\uC6D0'}</p>
                <p className="text-sm">{'\uAC8C\uC2A4\uD2B8'} {totalGuests}{'\uBA85'}</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{'\uC131\uC778'}</p>
                  <p className="text-xs text-gray-500">13{'\uC138 \uC774\uC0C1'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => adjustGuest('adults', -1)} disabled={guestAdults <= 1} className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30">
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center">{guestAdults}</span>
                  <button onClick={() => adjustGuest('adults', 1)} disabled={totalGuests >= accommodation.max_guests} className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{'\uC5B4\uB9B0\uC774'}</p>
                  <p className="text-xs text-gray-500">2~12{'\uC138'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => adjustGuest('children', -1)} disabled={guestChildren <= 0} className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30">
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center">{guestChildren}</span>
                  <button onClick={() => adjustGuest('children', 1)} disabled={totalGuests >= accommodation.max_guests} className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400">{'\uCD5C\uB300'} {accommodation.max_guests}{'\uBA85'}</p>
            </div>
          </PopoverContent>
        </Popover>

        <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white" size="lg" onClick={handleReserve}>
          {nights > 0 ? '\uC608\uC57D\uD558\uAE30' : '\uB0A0\uC9DC\uB97C \uC120\uD0DD\uD558\uC138\uC694'}
        </Button>

        {nights > 0 && (
          <>
            <p className="text-center text-xs text-gray-400">{'\uC608\uC57D \uD655\uC815 \uC804\uC5D0\uB294 \uC694\uAE08\uC774 \uCCAD\uAD6C\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4'}</p>
            <Separator />
            {loadingPrice ? (
              <div className="flex justify-center py-2">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : priceData ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="underline">{won}{Math.round(priceData.accommodationFee / priceData.nights).toLocaleString()} x {priceData.nights}{'\uBC15'}</span>
                  <span>{won}{priceData.accommodationFee.toLocaleString()}</span>
                </div>
                {priceData.extraGuestFee > 0 && (
                  <div className="flex justify-between">
                    <span className="underline">{'\uCD94\uAC00 \uC778\uC6D0 \uC694\uAE08'}</span>
                    <span>{won}{priceData.extraGuestFee.toLocaleString()}</span>
                  </div>
                )}
                {priceData.cleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span className="underline">{'\uCCAD\uC18C\uBE44'}</span>
                    <span>{won}{priceData.cleaningFee.toLocaleString()}</span>
                  </div>
                )}
                {priceData.longStayDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="underline">{'\uC7A5\uAE30 \uC219\uBC15 \uD560\uC778'}</span>
                    <span>-{won}{priceData.longStayDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="underline">{'\uC11C\uBE44\uC2A4 \uC218\uC218\uB8CC'}</span>
                  <span>{won}{priceData.guestServiceFee.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>{'\uCD1D \uD569\uACC4'}</span>
                  <span>{won}{priceData.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{won}{basePrice.toLocaleString()} x {nights}{'\uBC15'}</span>
                  <span>{won}{(basePrice * nights).toLocaleString()}</span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
