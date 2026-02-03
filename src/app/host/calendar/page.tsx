'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Property {
  id: number;
  name: string;
}

interface BlockedDate {
  blocked_date: string;
  reason: string;
}

interface Reservation {
  checkin_date: string;
  checkout_date: string;
  users: { display_name: string };
  reservation_number: string;
}

export default function HostCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    fetch('/api/host/properties').then(r => r.json()).then(d => {
      setProperties(d.properties || []);
      if (d.properties?.length > 0) setSelectedProperty(String(d.properties[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    fetch(`/api/host/properties/${selectedProperty}/calendar?start=${start}&end=${end}`)
      .then(r => r.json())
      .then(d => {
        setBlockedDates(d.blockedDates || []);
        setReservations(d.reservations || []);
      });
  }, [selectedProperty, currentMonth]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = startOfMonth(currentMonth).getDay();

  const isBlocked = (date: Date) => blockedDates.some(b => isSameDay(new Date(b.blocked_date), date));
  const getReservation = (date: Date) => reservations.find(r =>
    date >= new Date(r.checkin_date) && date < new Date(r.checkout_date)
  );

  const toggleBlock = async (date: Date) => {
    if (!selectedProperty) return;
    try {
      const res = await fetch(`/api/host/properties/${selectedProperty}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: format(date, 'yyyy-MM-dd'), action: isBlocked(date) ? 'unblock' : 'block' }),
      });
      if (res.ok) {
        toast.success(isBlocked(date) ? '차단이 해제되었습니다.' : '날짜가 차단되었습니다.');
        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        const r = await fetch(`/api/host/properties/${selectedProperty}/calendar?start=${start}&end=${end}`);
        const d = await r.json();
        setBlockedDates(d.blockedDates || []);
      }
    } catch {
      toast.error('처리에 실패했습니다.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">캘린더</h1>

      <div className="mb-6">
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-64"><SelectValue placeholder="숙소를 선택하세요" /></SelectTrigger>
          <SelectContent>
            {properties.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}>
              <ChevronLeft size={18} />
            </Button>
            <CardTitle>{format(currentMonth, 'yyyy년 M월', { locale: ko })}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
              <div key={d} className="font-medium py-2 text-gray-500">{d}</div>
            ))}
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const blocked = isBlocked(day);
              const reservation = getReservation(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !reservation && toggleBlock(day)}
                  className={cn(
                    'p-2 rounded-lg text-sm relative transition-colors',
                    isToday(day) && 'ring-2 ring-rose-500',
                    blocked && !reservation && 'bg-gray-200 text-gray-400 line-through',
                    reservation && 'bg-blue-100 text-blue-700',
                    !blocked && !reservation && 'hover:bg-gray-100'
                  )}
                >
                  {format(day, 'd')}
                  {reservation && <div className="text-[8px] truncate">{reservation.users.display_name}</div>}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 rounded" /> 예약</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded" /> 차단</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
