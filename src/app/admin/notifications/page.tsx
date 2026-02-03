'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetGroup: 'all',
    notificationType: 'in_app',
  });

  const handleSend = async () => {
    if (!form.title || !form.message) {
      toast.error('제목과 내용을 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('알림이 전송되었습니다.');
        setForm({ title: '', message: '', targetGroup: 'all', notificationType: 'in_app' });
      } else {
        toast.error('알림 전송에 실패했습니다.');
      }
    } catch {
      toast.error('알림 전송에 실패했습니다.');
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">알림</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell size={18} /> 알림 전송</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>제목</Label>
            <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="알림 제목" />
          </div>
          <div>
            <Label>내용</Label>
            <Textarea value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} placeholder="알림 내용을 입력하세요" rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>대상</Label>
              <Select value={form.targetGroup} onValueChange={(v) => setForm(f => ({ ...f, targetGroup: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="guests">게스트</SelectItem>
                  <SelectItem value="hosts">호스트</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>전송 방식</Label>
              <Select value={form.notificationType} onValueChange={(v) => setForm(f => ({ ...f, notificationType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app">인앱</SelectItem>
                  <SelectItem value="email">이메일</SelectItem>
                  <SelectItem value="push">푸시</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSend} className="bg-rose-500 hover:bg-rose-600">
            <Send size={14} className="mr-1" /> 전송
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
