'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface SystemSettings {
  guestCommissionRate: number;
  hostCommissionRate: number;
  defaultCancellationPolicy: string;
  maxImagesPerAccommodation: number;
  maxFileSizeMB: number;
  supportEmail: string;
  supportPhone: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    guestCommissionRate: 10,
    hostCommissionRate: 3,
    defaultCancellationPolicy: 'moderate',
    maxImagesPerAccommodation: 20,
    maxFileSizeMB: 10,
    supportEmail: 'support@homestay.kr',
    supportPhone: '02-1234-5678',
  });

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.settings) setSettings(d.settings);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
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
      <h1 className="text-2xl font-bold mb-6">시스템 설정</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>수수료 설정</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>게스트 서비스 수수료 (%)</Label>
              <Input type="number" min={0} max={100} value={settings.guestCommissionRate} onChange={(e) => setSettings(s => ({ ...s, guestCommissionRate: parseInt(e.target.value) }))} />
            </div>
            <div>
              <Label>호스트 수수료 (%)</Label>
              <Input type="number" min={0} max={100} value={settings.hostCommissionRate} onChange={(e) => setSettings(s => ({ ...s, hostCommissionRate: parseInt(e.target.value) }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>업로드 설정</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>숙소당 최대 사진 수</Label>
              <Input type="number" min={1} value={settings.maxImagesPerAccommodation} onChange={(e) => setSettings(s => ({ ...s, maxImagesPerAccommodation: parseInt(e.target.value) }))} />
            </div>
            <div>
              <Label>최대 파일 크기 (MB)</Label>
              <Input type="number" min={1} value={settings.maxFileSizeMB} onChange={(e) => setSettings(s => ({ ...s, maxFileSizeMB: parseInt(e.target.value) }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>고객지원</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>지원 이메일</Label>
              <Input value={settings.supportEmail} onChange={(e) => setSettings(s => ({ ...s, supportEmail: e.target.value }))} />
            </div>
            <div>
              <Label>지원 전화번호</Label>
              <Input value={settings.supportPhone} onChange={(e) => setSettings(s => ({ ...s, supportPhone: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="bg-rose-500 hover:bg-rose-600">설정 저장</Button>
      </div>
    </div>
  );
}
