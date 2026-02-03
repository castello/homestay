'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  numberOfMonths?: number;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = '날짜 선택',
  className,
  disabled = false,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    onChange(range);
    if (range?.from && range?.to) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn('justify-start text-left font-normal', !value && 'text-muted-foreground', className)}
        >
          <CalendarDays size={16} className="mr-2" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, 'M월 d일', { locale: ko })} - {format(value.to, 'M월 d일', { locale: ko })}
              </>
            ) : (
              format(value.from, 'M월 d일', { locale: ko })
            )
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="range"
          selected={value}
          onSelect={handleSelect}
          numberOfMonths={numberOfMonths}
          disabled={{ before: new Date() }}
          locale={ko}
        />
      </PopoverContent>
    </Popover>
  );
}
