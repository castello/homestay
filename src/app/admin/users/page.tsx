'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface User {
  id: number;
  email: string;
  display_name: string;
  role: string;
  status: string;
  is_host_approved: boolean;
  is_superhost: boolean;
  identity_verified: boolean;
  created_at: string;
  _count: { reservations_reservations_guest_idTousers: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  async function fetchUsers() {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
      }
    } catch {
      toast.error('회원 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function updateUserStatus(userId: number, status: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success('회원 상태가 변경되었습니다.');
        fetchUsers();
      }
    } catch {
      toast.error('상태 변경에 실패했습니다.');
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      active: { label: '활성', variant: 'default' },
      suspended: { label: '정지', variant: 'secondary' },
      banned: { label: '차단', variant: 'destructive' },
    };
    const s = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">회원 관리</h1>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="이름 또는 이메일로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="역할" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="guest">게스트</SelectItem>
            <SelectItem value="host">호스트</SelectItem>
            <SelectItem value="admin">관리자</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">이름</th>
                  <th className="text-left py-3 px-4">이메일</th>
                  <th className="text-left py-3 px-4">역할</th>
                  <th className="text-left py-3 px-4">상태</th>
                  <th className="text-left py-3 px-4">가입일</th>
                  <th className="text-left py-3 px-4">예약수</th>
                  <th className="text-right py-3 px-4">작업</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{user.id}</td>
                    <td className="py-3 px-4">
                      {user.display_name}
                      {user.is_superhost && <Badge variant="outline" className="ml-1 text-xs">슈퍼호스트</Badge>}
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.role}</td>
                    <td className="py-3 px-4">{statusBadge(user.status)}</td>
                    <td className="py-3 px-4">{format(new Date(user.created_at), 'yy.MM.dd')}</td>
                    <td className="py-3 px-4">{user._count?.reservations_reservations_guest_idTousers || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateUserStatus(user.id, 'active')}>활성화</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserStatus(user.id, 'suspended')}>정지</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserStatus(user.id, 'banned')} className="text-red-600">차단</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-500">총 {total}명</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>이전</Button>
          <Button variant="outline" size="sm" disabled={users.length < 20} onClick={() => setPage(p => p + 1)}>다음</Button>
        </div>
      </div>
    </div>
  );
}
