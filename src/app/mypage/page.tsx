'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarDays, Heart, Star, User, Settings, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/empty-state';

interface Reservation {
  id: number;
  reservation_number: string;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  total_price: number;
  status: string;
  accommodations: {
    id: number;
    name: string;
    address: string;
    accommodation_photos: { url: string }[];
  };
}

interface Wishlist {
  id: number;
  name: string;
  wishlist_items: {
    id: number;
    accommodations: {
      id: number;
      name: string;
      address: string;
      base_price: number;
      avg_rating: number;
      accommodation_photos: { url: string }[];
    };
  }[];
}

interface UserProfile {
  id: number;
  email: string;
  display_name: string;
  phone: string;
  profile_photo_url: string;
  bio: string;
  preferred_language: string;
  preferred_currency: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: '대기중', variant: 'secondary' },
  confirmed: { label: '확정', variant: 'default' },
  completed: { label: '완료', variant: 'outline' },
  cancelled: { label: '취소됨', variant: 'destructive' },
};

function MyPageContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const defaultTab = searchParams.get('tab') || 'reservations';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ display_name: '', phone: '', bio: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [resRes, wishRes, profileRes] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/wishlists'),
        fetch('/api/users/me'),
      ]);

      if (resRes.ok) {
        const data = await resRes.json();
        setReservations(data.reservations || []);
      }
      if (wishRes.ok) {
        const data = await wishRes.json();
        setWishlists(data.wishlists || []);
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.user);
        setProfileForm({
          display_name: data.user.display_name || '',
          phone: data.user.phone || '',
          bio: data.user.bio || '',
        });
      }
    } catch {
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const handleProfileUpdate = async () => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setEditingProfile(false);
        toast.success('프로필이 수정되었습니다.');
      } else {
        toast.error('프로필 수정에 실패했습니다.');
      }
    } catch {
      toast.error('프로필 수정에 실패했습니다.');
    }
  };

  const handleCancelReservation = async (id: number) => {
    if (!confirm('정말 예약을 취소하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', cancelReason: '게스트 취소' }),
      });
      if (res.ok) {
        toast.success('예약이 취소되었습니다.');
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || '예약 취소에 실패했습니다.');
      }
    } catch {
      toast.error('예약 취소에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto p-6"><p>로딩 중...</p></div>;
  }

  const upcomingReservations = reservations.filter(r => ['pending', 'confirmed'].includes(r.status));
  const pastReservations = reservations.filter(r => ['completed', 'cancelled'].includes(r.status));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">마이페이지</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="reservations" className="gap-1"><CalendarDays size={14} /> 예약</TabsTrigger>
          <TabsTrigger value="wishlists" className="gap-1"><Heart size={14} /> 위시리스트</TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1"><Star size={14} /> 리뷰</TabsTrigger>
          <TabsTrigger value="profile" className="gap-1"><User size={14} /> 프로필</TabsTrigger>
          <TabsTrigger value="account" className="gap-1"><Settings size={14} /> 계정</TabsTrigger>
        </TabsList>

        {/* 예약 탭 */}
        <TabsContent value="reservations" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">예정된 예약</h2>
            {upcomingReservations.length === 0 ? (
              <EmptyState title="예정된 예약이 없습니다" description="새로운 숙소를 검색해보세요." />
            ) : (
              <div className="space-y-3">
                {upcomingReservations.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={r.accommodations.accommodation_photos?.[0]?.url || '/placeholder.jpg'}
                            alt={r.accommodations.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{r.accommodations.name}</h3>
                            <Badge variant={statusLabels[r.status]?.variant || 'secondary'}>
                              {statusLabels[r.status]?.label || r.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {format(new Date(r.checkin_date), 'M월 d일', { locale: ko })} - {format(new Date(r.checkout_date), 'M월 d일', { locale: ko })}
                          </p>
                          <p className="text-sm text-gray-500">게스트 {r.adults + r.children}명 · ₩{Number(r.total_price).toLocaleString()}</p>
                          <p className="text-xs text-gray-400">예약번호: {r.reservation_number}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Link href={`/accommodations/${r.accommodations.id}`}>
                            <Button variant="outline" size="sm" className="w-full">상세</Button>
                          </Link>
                          <Button variant="destructive" size="sm" onClick={() => handleCancelReservation(r.id)}>취소</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h2 className="text-lg font-semibold mb-3">지난 예약</h2>
            {pastReservations.length === 0 ? (
              <EmptyState title="지난 예약이 없습니다" />
            ) : (
              <div className="space-y-3">
                {pastReservations.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={r.accommodations.accommodation_photos?.[0]?.url || '/placeholder.jpg'}
                            alt={r.accommodations.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{r.accommodations.name}</h3>
                            <Badge variant={statusLabels[r.status]?.variant || 'secondary'}>
                              {statusLabels[r.status]?.label || r.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {format(new Date(r.checkin_date), 'M월 d일', { locale: ko })} - {format(new Date(r.checkout_date), 'M월 d일', { locale: ko })}
                          </p>
                          {r.status === 'completed' && (
                            <Link href={`/mypage?tab=reviews`}>
                              <Button variant="link" size="sm" className="px-0 text-rose-500">리뷰 작성</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* 위시리스트 탭 */}
        <TabsContent value="wishlists">
          {wishlists.length === 0 ? (
            <EmptyState title="위시리스트가 비어있습니다" description="마음에 드는 숙소에 하트를 눌러보세요." />
          ) : (
            <div className="space-y-6">
              {wishlists.map((w) => (
                <div key={w.id}>
                  <h2 className="text-lg font-semibold mb-3">{w.name} ({w.wishlist_items.length})</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {w.wishlist_items.map((item) => (
                      <Link key={item.id} href={`/accommodations/${item.accommodations.id}`}>
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative h-40">
                            <Image
                              src={item.accommodations.accommodation_photos?.[0]?.url || '/placeholder.jpg'}
                              alt={item.accommodations.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium truncate">{item.accommodations.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{item.accommodations.address}</p>
                            <p className="text-sm font-medium mt-1">
                              ₩{Number(item.accommodations.base_price).toLocaleString()}/박
                              {item.accommodations.avg_rating > 0 && (
                                <span className="text-gray-500 ml-2">★ {item.accommodations.avg_rating.toFixed(1)}</span>
                              )}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 리뷰 탭 */}
        <TabsContent value="reviews">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">작성 가능한 리뷰</h2>
            {reservations.filter(r => r.status === 'completed').length === 0 ? (
              <EmptyState title="작성 가능한 리뷰가 없습니다" description="이용 완료 후 리뷰를 남겨보세요." />
            ) : (
              reservations.filter(r => r.status === 'completed').map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{r.accommodations.name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(r.checkin_date), 'yyyy.M.d')} - {format(new Date(r.checkout_date), 'yyyy.M.d')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">리뷰 작성</Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* 프로필 탭 */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                프로필
                <Button variant="outline" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
                  {editingProfile ? '취소' : '수정'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  {profile?.profile_photo_url ? (
                    <Image src={profile.profile_photo_url} alt="프로필" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><Camera size={24} className="text-gray-400" /></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{profile?.display_name || '이름 없음'}</p>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                </div>
              </div>

              {editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <Label>이름</Label>
                    <Input value={profileForm.display_name} onChange={(e) => setProfileForm(p => ({ ...p, display_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>전화번호</Label>
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label>자기소개</Label>
                    <Textarea value={profileForm.bio} onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))} rows={3} />
                  </div>
                  <Button onClick={handleProfileUpdate} className="bg-rose-500 hover:bg-rose-600">저장</Button>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">전화번호</span><span>{profile?.phone || '미등록'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">자기소개</span><span>{profile?.bio || '미작성'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">언어</span><span>{profile?.preferred_language || 'ko'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">통화</span><span>{profile?.preferred_currency || 'KRW'}</span></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 계정 탭 */}
        <TabsContent value="account">
          <Card>
            <CardHeader><CardTitle>계정 설정</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">이메일</p>
                  <p className="text-sm text-gray-500">{session?.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">비밀번호 변경</p>
                  <p className="text-sm text-gray-500">마지막 변경: 알 수 없음</p>
                </div>
                <Button variant="outline" size="sm">변경</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">알림 설정</p>
                  <p className="text-sm text-gray-500">이메일, 푸시 알림 설정</p>
                </div>
                <Button variant="outline" size="sm">설정</Button>
              </div>
              <Separator />
              <div className="pt-4">
                <Button variant="destructive" size="sm">계정 탈퇴</Button>
                <p className="text-xs text-gray-400 mt-2">계정을 탈퇴하면 모든 데이터가 삭제됩니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto p-6"><p>로딩 중...</p></div>}>
      <MyPageContent />
    </Suspense>
  );
}
