'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: '대기', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
  confirmed: { label: '확정', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  checked_in: { label: '체크인', className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100' },
  completed: { label: '완료', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  cancelled: { label: '취소', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
  rejected: { label: '거절', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
  active: { label: '활성', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  inactive: { label: '비활성', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
  suspended: { label: '정지', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
  blocked: { label: '차단', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
  approved: { label: '승인', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  draft: { label: '임시저장', className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' },
  published: { label: '공개', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  resolved: { label: '해결', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  reviewing: { label: '검토중', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
