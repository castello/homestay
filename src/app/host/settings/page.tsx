'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function HostSettingsPage() {
  const [settings, setSettings] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    autoConfirm: false,
    instantBooking: false,
    autoMessage: '',
    checkInMessage: '',
  });

  useEffect(() => {
    fetch('/api/host/settings')
      .then(r => r.json())
      .then(d => d.settings && setSettings(d.settings))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/host/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success('설정이 저장되었습니다.');
      else toast.error('설정 저장에 실패했습니다.');
    } catch {
      toast.error('설정 저장에 실패했습니다.');
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">설정</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>정산 계좌</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>은행명</Label>
              <Input value={settings.bankName} onChange={(e) => setSettings(s => ({ ...s, bankName: e.target.value }))} placeholder="예: 국민은행" />
            </div>
            <div>
              <Label>계좌번호</Label>
              <Input value={settings.accountNumber} onChange={(e) => setSettings(s => ({ ...s, accountNumber: e.target.value }))} placeholder="계좌번호 입력" />
            </div>
            <div>
              <Label>예금주</Label>
              <Input value={settings.accountHolder} onChange={(e) => setSettings(s => ({ ...s, accountHolder: e.target.value }))} placeholder="예금주명" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>예약 설정</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">자동 승인</p>
                <p className="text-xs text-gray-500">예약을 자동으로 승인합니다</p>
              </div>
              <Switch checked={settings.autoConfirm} onCheckedChange={(v) => setSettings(s => ({ ...s, autoConfirm: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">즉시 예약</p>
                <p className="text-xs text-gray-500">게스트가 즉시 예약할 수 있습니다</p>
              </div>
              <Switch checked={settings.instantBooking} onCheckedChange={(v) => setSettings(s => ({ ...s, instantBooking: v }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>자동 메시지</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>예약 확인 메시지</Label>
              <Textarea
                value={settings.autoMessage}
                onChange={(e) => setSettings(s => ({ ...s, autoMessage: e.target.value }))}
                placeholder="예약 확인 시 자동으로 전송되는 메시지"
                rows={3}
              />
            </div>
            <div>
              <Label>체크인 안내 메시지</Label>
              <Textarea
                value={settings.checkInMessage}
                onChange={(e) => setSettings(s => ({ ...s, checkInMessage: e.target.value }))}
                placeholder="체크인 당일 자동으로 전송되는 메시지"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="bg-rose-500 hover:bg-rose-600">설정 저장</Button>
      </div>
    </div>
  );
}
