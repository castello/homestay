'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/empty-state';

interface Property {
  id: number;
  name: string;
  address: string;
  base_price: number;
  status: string;
  is_active: boolean;
  avg_rating: number;
  review_count: number;
  accommodation_photos: { url: string }[];
}

export default function HostPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const res = await fetch('/api/host/properties');
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch {
      toast.error('숙소 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: number, isActive: boolean) {
    try {
      const res = await fetch(`/api/host/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (res.ok) {
        toast.success(isActive ? '숙소가 비공개되었습니다.' : '숙소가 공개되었습니다.');
        fetchProperties();
      }
    } catch {
      toast.error('상태 변경에 실패했습니다.');
    }
  }

  if (loading) return <div className="p-6"><p>로딩 중...</p></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">숙소 관리</h1>
        <Link href="/host/properties/new">
          <Button className="bg-rose-500 hover:bg-rose-600"><Plus size={16} className="mr-1" /> 새 숙소 등록</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <EmptyState title="등록된 숙소가 없습니다" description="새 숙소를 등록해보세요." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((prop) => (
            <Card key={prop.id} className="overflow-hidden">
              <div className="relative h-40">
                <Image
                  src={prop.accommodation_photos?.[0]?.url || '/placeholder.jpg'}
                  alt={prop.name}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-2 right-2" variant={prop.is_active ? 'default' : 'secondary'}>
                  {prop.is_active ? '공개' : '비공개'}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{prop.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{prop.address}</p>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span>₩{Number(prop.base_price).toLocaleString()}/박</span>
                  {prop.avg_rating > 0 && (
                    <span>★ {prop.avg_rating.toFixed(1)} ({prop.review_count})</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/host/properties/${prop.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full"><Edit size={14} className="mr-1" /> 수정</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(prop.id, prop.is_active)}>
                    {prop.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
