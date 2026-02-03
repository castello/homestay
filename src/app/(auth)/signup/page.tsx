'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password', '');
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  const onSubmit = async (data: SignupInput) => {
    if (!agreeTerms || !agreePrivacy) {
      setError('필수 약관에 동의해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || '회원가입에 실패했습니다.');
      } else {
        router.push('/login?registered=true');
      }
    } catch {
      setError('회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" placeholder="email@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">닉네임</Label>
              <Input id="displayName" placeholder="닉네임" {...register('displayName')} />
              {errors.displayName && <p className="text-sm text-red-500">{errors.displayName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="text-xs space-y-1 mt-2">
                  {Object.entries({ length: '8자 이상', upper: '대문자', lower: '소문자', number: '숫자', special: '특수문자' }).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1">
                      {passwordChecks[key as keyof typeof passwordChecks]
                        ? <Check size={12} className="text-green-500" />
                        : <X size={12} className="text-gray-300" />}
                      <span className={passwordChecks[key as keyof typeof passwordChecks] ? 'text-green-600' : 'text-gray-400'}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input id="confirmPassword" type="password" placeholder="비밀번호 확인" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(c === true)} />
                <Label htmlFor="terms" className="text-sm leading-5">[필수] 이용약관에 동의합니다</Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={(c) => setAgreePrivacy(c === true)} />
                <Label htmlFor="privacy" className="text-sm leading-5">[필수] 개인정보처리방침에 동의합니다</Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !agreeTerms || !agreePrivacy}>
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          <div className="text-center text-sm">
            이미 계정이 있으신가요? <Link href="/login" className="text-blue-600 hover:underline">로그인</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
