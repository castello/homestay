'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // In production, call password reset API
      await new Promise(r => setTimeout(r, 1000));
      setSent(true);
    } catch {
      setError('요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">비밀번호 재설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-green-600">비밀번호 재설정 링크가 이메일로 발송되었습니다.</p>
              <p className="text-sm text-gray-500">이메일을 확인해주세요.</p>
              <Link href="/login"><Button variant="outline" className="w-full">로그인으로 돌아가기</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="email">가입한 이메일 주소</Label>
                <Input id="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '발송 중...' : '재설정 링크 발송'}
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="text-blue-600 hover:underline">로그인으로 돌아가기</Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
