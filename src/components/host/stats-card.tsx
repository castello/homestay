'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon size={18} className="text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        {trend && (
          <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
            {trend.positive ? '\u2191' : '\u2193'} {Math.abs(trend.value)}% 전월 대비
          </p>
        )}
      </CardContent>
    </Card>
  );
}
