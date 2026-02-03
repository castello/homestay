'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ACCOMMODATION_TYPES, SPACE_TYPES, CANCELLATION_POLICIES } from '@/lib/constants';

const steps = ['기본 정보', '위치', '객실 구성', '편의시설', '사진', '설명', '요금', '예약 설정', '하우스룰'];

export default function NewPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    accommodation_type: '',
    space_type: '',
    max_guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    address: '',
    address_detail: '',
    city: '',
    district: '',
    postal_code: '',
    latitude: 37.5665,
    longitude: 126.978,
    base_price: 50000,
    weekend_price: 0,
    cleaning_fee: 0,
    extra_guest_fee: 0,
    weekly_discount: 0,
    monthly_discount: 0,
    checkin_time: '15:00',
    checkout_time: '11:00',
    min_stay: 1,
    max_stay: 30,
    smoking_allowed: false,
    pets_allowed: false,
    events_allowed: false,
    cancellation_policy: 'moderate',
    additional_rules: '',
    amenities: [] as number[],
  });

  const updateForm = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.accommodation_type || !form.address || !form.city) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/host/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('숙소가 등록되었습니다.');
        router.push('/host/properties');
      } else {
        const data = await res.json();
        toast.error(data.error || '숙소 등록에 실패했습니다.');
      }
    } catch {
      toast.error('숙소 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">새 숙소 등록</h1>

      {/* 단계 표시 */}
      <div className="flex gap-1 mb-8">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`flex-1 h-2 rounded-full transition-colors ${i <= currentStep ? 'bg-rose-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 mb-4">단계 {currentStep + 1}/{steps.length}: {steps[currentStep]}</p>

      <Card>
        <CardHeader><CardTitle>{steps[currentStep]}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* 기본 정보 */}
          {currentStep === 0 && (
            <>
              <div>
                <Label>숙소명 *</Label>
                <Input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="예: 서울 강남의 모던 아파트" />
              </div>
              <div>
                <Label>숙소 유형 *</Label>
                <Select value={form.accommodation_type} onValueChange={(v) => updateForm('accommodation_type', v)}>
                  <SelectTrigger><SelectValue placeholder="숙소 유형을 선택하세요" /></SelectTrigger>
                  <SelectContent>
                    {ACCOMMODATION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>공간 유형 *</Label>
                <Select value={form.space_type} onValueChange={(v) => updateForm('space_type', v)}>
                  <SelectTrigger><SelectValue placeholder="공간 유형을 선택하세요" /></SelectTrigger>
                  <SelectContent>
                    {SPACE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* 위치 */}
          {currentStep === 1 && (
            <>
              <div>
                <Label>주소 *</Label>
                <Input value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="도로명 주소" />
              </div>
              <div>
                <Label>상세 주소</Label>
                <Input value={form.address_detail} onChange={(e) => updateForm('address_detail', e.target.value)} placeholder="동/호수" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>도시 *</Label>
                  <Input value={form.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="서울" />
                </div>
                <div>
                  <Label>구/군</Label>
                  <Input value={form.district} onChange={(e) => updateForm('district', e.target.value)} placeholder="강남구" />
                </div>
              </div>
              <div>
                <Label>우편번호</Label>
                <Input value={form.postal_code} onChange={(e) => updateForm('postal_code', e.target.value)} />
              </div>
            </>
          )}

          {/* 객실 구성 */}
          {currentStep === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>최대 인원</Label>
                  <Input type="number" min={1} value={form.max_guests} onChange={(e) => updateForm('max_guests', parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>침실 수</Label>
                  <Input type="number" min={0} value={form.bedrooms} onChange={(e) => updateForm('bedrooms', parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>침대 수</Label>
                  <Input type="number" min={1} value={form.beds} onChange={(e) => updateForm('beds', parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>욕실 수</Label>
                  <Input type="number" min={0} value={form.bathrooms} onChange={(e) => updateForm('bathrooms', parseInt(e.target.value))} />
                </div>
              </div>
            </>
          )}

          {/* 편의시설 */}
          {currentStep === 3 && (
            <p className="text-sm text-gray-500">편의시설은 숙소 등록 후 수정 페이지에서 선택할 수 있습니다.</p>
          )}

          {/* 사진 */}
          {currentStep === 4 && (
            <p className="text-sm text-gray-500">사진은 숙소 등록 후 수정 페이지에서 업로드할 수 있습니다.</p>
          )}

          {/* 설명 */}
          {currentStep === 5 && (
            <div>
              <Label>숙소 설명 *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="숙소의 특징과 매력을 소개해주세요 (최소 20자)"
                rows={6}
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/5000</p>
            </div>
          )}

          {/* 요금 */}
          {currentStep === 6 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>기본 요금 (원/박) *</Label>
                  <Input type="number" min={10000} value={form.base_price} onChange={(e) => updateForm('base_price', parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>주말 요금 (원/박)</Label>
                  <Input type="number" min={0} value={form.weekend_price} onChange={(e) => updateForm('weekend_price', parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>청소비 (원)</Label>
                  <Input type="number" min={0} value={form.cleaning_fee} onChange={(e) => updateForm('cleaning_fee', parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>추가 인원비 (원)</Label>
                  <Input type="number" min={0} value={form.extra_guest_fee} onChange={(e) => updateForm('extra_guest_fee', parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>주간 할인 (%)</Label>
                  <Input type="number" min={0} max={100} value={form.weekly_discount} onChange={(e) => updateForm('weekly_discount', parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>월간 할인 (%)</Label>
                  <Input type="number" min={0} max={100} value={form.monthly_discount} onChange={(e) => updateForm('monthly_discount', parseInt(e.target.value))} />
                </div>
              </div>
            </>
          )}

          {/* 예약 설정 */}
          {currentStep === 7 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>체크인 시간</Label>
                  <Input type="time" value={form.checkin_time} onChange={(e) => updateForm('checkin_time', e.target.value)} />
                </div>
                <div>
                  <Label>체크아웃 시간</Label>
                  <Input type="time" value={form.checkout_time} onChange={(e) => updateForm('checkout_time', e.target.value)} />
                </div>
                <div>
                  <Label>최소 숙박일</Label>
                  <Input type="number" min={1} value={form.min_stay} onChange={(e) => updateForm('min_stay', parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>최대 숙박일</Label>
                  <Input type="number" min={1} value={form.max_stay} onChange={(e) => updateForm('max_stay', parseInt(e.target.value))} />
                </div>
              </div>
              <div>
                <Label>취소 정책</Label>
                <Select value={form.cancellation_policy} onValueChange={(v) => updateForm('cancellation_policy', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CANCELLATION_POLICIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* 하우스룰 */}
          {currentStep === 8 && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.smoking_allowed} onCheckedChange={(v) => updateForm('smoking_allowed', v === true)} />
                  <Label>흡연 허용</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.pets_allowed} onCheckedChange={(v) => updateForm('pets_allowed', v === true)} />
                  <Label>반려동물 허용</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.events_allowed} onCheckedChange={(v) => updateForm('events_allowed', v === true)} />
                  <Label>파티/이벤트 허용</Label>
                </div>
              </div>
              <div>
                <Label>추가 규칙</Label>
                <Textarea
                  value={form.additional_rules}
                  onChange={(e) => updateForm('additional_rules', e.target.value)}
                  placeholder="기타 규칙을 입력하세요"
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>이전</Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep} className="bg-rose-500 hover:bg-rose-600">다음</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="bg-rose-500 hover:bg-rose-600">
            {submitting ? '등록 중...' : '숙소 등록'}
          </Button>
        )}
      </div>
    </div>
  );
}
