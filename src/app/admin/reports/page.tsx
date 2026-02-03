'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/empty-state';

interface Report {
  id: number;
  report_type: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  users_reports_reporter_idTousers: { display_name: string };
  users_reports_reported_user_idTousers: { display_name: string } | null;
  accommodations: { name: string } | null;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  async function fetchReports() {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      toast.error('신고 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReport(id: number, action: string) {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success('신고가 처리되었습니다.');
        fetchReports();
      }
    } catch {
      toast.error('처리에 실패했습니다.');
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      pending: { label: '대기', variant: 'secondary' },
      reviewed: { label: '검토완료', variant: 'default' },
      resolved: { label: '처리완료', variant: 'default' },
      dismissed: { label: '기각', variant: 'destructive' },
    };
    const s = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">신고 관리</h1>

      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기</SelectItem>
            <SelectItem value="reviewed">검토완료</SelectItem>
            <SelectItem value="resolved">처리완료</SelectItem>
            <SelectItem value="dismissed">기각</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reports.length === 0 ? (
        <EmptyState title="신고가 없습니다" />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{report.report_type}</Badge>
                      {statusBadge(report.status)}
                    </div>
                    <p className="font-medium text-sm">{report.reason}</p>
                    <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      신고자: {report.users_reports_reporter_idTousers?.display_name}
                      {report.users_reports_reported_user_idTousers && ` → 피신고자: ${report.users_reports_reported_user_idTousers.display_name}`}
                      {report.accommodations && ` · 숙소: ${report.accommodations.name}`}
                      {' · '}{format(new Date(report.created_at), 'yyyy.M.d HH:mm')}
                    </div>
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleReport(report.id, 'warn')}>경고</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReport(report.id, 'ban')}>차단</Button>
                      <Button size="sm" variant="outline" onClick={() => handleReport(report.id, 'dismiss')}>기각</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
