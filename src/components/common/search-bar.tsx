'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, MapPin, CalendarDays, Users, Minus, Plus } from 'lucide-react';
import { useSearchStore } from '@/stores/search-store';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { keyword, checkin, checkout, adults, children, infants, setKeyword, setDates, setGuests } = useSearchStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    checkin && checkout ? { from: new Date(checkin), to: new Date(checkout) } : undefined
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (checkin) params.set('checkin', checkin);
    if (checkout) params.set('checkout', checkout);
    if (adults) params.set('adults', String(adults));
    if (children) params.set('children', String(children));
    if (infants) params.set('infants', String(infants));
    router.push(`/search?${params.toString()}`);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) setDates(
      format(range.from, 'yyyy-MM-dd'),
      range.to ? format(range.to, 'yyyy-MM-dd') : ''
    );
  };

  const totalGuests = adults + children;

  return (
    <div className={`flex items-center gap-2 bg-white rounded-full border shadow-sm p-2 ${compact ? '' : 'max-w-3xl mx-auto'}`}>
      <div className="flex-1 flex items-center gap-2 px-3">
        <MapPin size={18} className="text-gray-400 shrink-0" />
        <Input
          placeholder="어디로 가시나요?"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      <div className="hidden sm:block h-8 w-px bg-gray-200" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-sm font-normal">
            <CalendarDays size={16} className="text-gray-400" />
            {checkin && checkout
              ? `${format(new Date(checkin), 'M.d')} - ${format(new Date(checkout), 'M.d')}`
              : '날짜 선택'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <DayPicker
            mode="range"
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            locale={ko}
            disabled={{ before: new Date() }}
          />
        </PopoverContent>
      </Popover>

      <div className="hidden sm:block h-8 w-px bg-gray-200" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-sm font-normal">
            <Users size={16} className="text-gray-400" />
            게스트 {totalGuests}명{infants > 0 ? `, 영유아 ${infants}` : ''}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            {[
              { label: '성인', desc: '13세 이상', value: adults, onChange: (v: number) => setGuests(v, children, infants), min: 1 },
              { label: '어린이', desc: '2~12세', value: children, onChange: (v: number) => setGuests(adults, v, infants), min: 0 },
              { label: '영유아', desc: '2세 미만', value: infants, onChange: (v: number) => setGuests(adults, children, v), min: 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" disabled={item.value <= item.min} onClick={() => item.onChange(item.value - 1)}>
                    <Minus size={14} />
                  </Button>
                  <span className="w-6 text-center text-sm">{item.value}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => item.onChange(item.value + 1)}>
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Button onClick={handleSearch} size="icon" className="rounded-full bg-rose-500 hover:bg-rose-600 shrink-0">
        <Search size={18} className="text-white" />
      </Button>
    </div>
  );
}
