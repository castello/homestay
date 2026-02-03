'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/empty-state';

interface ContentItem {
  id: number;
  title?: string;
  question?: string;
  answer?: string;
  content?: string;
  is_published?: boolean;
  is_pinned?: boolean;
  is_active?: boolean;
  sort_order?: number;
  image_url?: string;
  region_name_ko?: string;
  created_at: string;
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('notices');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  async function fetchContent() {
    setLoading(true);
    try {
      const typeMap: Record<string, string> = {
        notices: 'notices', faq: 'faq', banners: 'banners', featured: 'featured_regions',
      };
      const res = await fetch(`/api/admin/content?type=${typeMap[activeTab]}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      toast.error('콘텐츠를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setSubmitting(true);
    try {
      const typeMap: Record<string, string> = {
        notices: 'notices', faq: 'faq', banners: 'banners', featured: 'featured_regions',
      };
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: typeMap[activeTab], ...formData }),
      });
      if (res.ok) {
        toast.success('콘텐츠가 생성되었습니다.');
        setDialogOpen(false);
        setFormData({});
        fetchContent();
      } else {
        const data = await res.json();
        toast.error(data.error || '생성에 실패했습니다.');
      }
    } catch {
      toast.error('콘텐츠 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  const renderItems = () => {
    if (loading) {
      return <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={24} /></div>;
    }
    if (items.length === 0) {
      const messages: Record<string, { title: string; desc: string }> = {
        notices: { title: '공지사항이 없습니다', desc: '새 공지사항을 작성해보세요.' },
        faq: { title: 'FAQ가 없습니다', desc: '자주 묻는 질문을 추가해보세요.' },
        banners: { title: '배너가 없습니다', desc: '홈페이지에 표시할 배너를 추가해보세요.' },
        featured: { title: '추천 항목이 없습니다', desc: '추천 지역을 추가해보세요.' },
      };
      const msg = messages[activeTab];
      return <EmptyState title={msg.title} description={msg.desc} />;
    }

    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {item.title || item.question || item.region_name_ko || `#${item.id}`}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(item.created_at), 'yyyy-MM-dd')}
                {item.is_published === false && ' · 비공개'}
                {item.is_active === false && ' · 비활성'}
                {item.is_pinned && ' · 고정'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {item.is_published === true && <Badge variant="outline" className="text-xs">공개</Badge>}
              {item.is_active === true && <Badge variant="outline" className="text-xs">활성</Badge>}
              <Button variant="ghost" size="sm"><Pencil size={14} /></Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCreateForm = () => {
    if (activeTab === 'notices') {
      return (
        <div className="space-y-4">
          <div>
            <Label>제목 <span className="text-rose-500">*</span></Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="공지사항 제목을 입력하세요"
            />
          </div>
          <div>
            <Label>내용 <span className="text-rose-500">*</span></Label>
            <Textarea
              rows={8}
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="공지사항 내용을 입력하세요"
            />
          </div>
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_pinned === 'true'}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked ? 'true' : 'false' })}
                className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-sm">상단 고정</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published !== 'false'}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked ? 'true' : 'false' })}
                className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-sm">즉시 공개</span>
            </label>
          </div>
        </div>
      );
    }
    if (activeTab === 'faq') {
      return (
        <div className="space-y-4">
          <div>
            <Label>카테고리 ID</Label>
            <Input type="number" value={formData.category_id || ''} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} />
          </div>
          <div>
            <Label>질문</Label>
            <Input value={formData.question || ''} onChange={(e) => setFormData({ ...formData, question: e.target.value })} />
          </div>
          <div>
            <Label>답변</Label>
            <Textarea rows={4} value={formData.answer || ''} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} />
          </div>
        </div>
      );
    }
    if (activeTab === 'banners') {
      return (
        <div className="space-y-4">
          <div>
            <Label>제목</Label>
            <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <Label>이미지 URL</Label>
            <Input value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
          </div>
          <div>
            <Label>링크 URL</Label>
            <Input value={formData.link_url || ''} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} />
          </div>
        </div>
      );
    }
    return null;
  };

  const tabLabels: Record<string, string> = {
    notices: '공지사항', faq: 'FAQ', banners: '배너', featured: '추천 지역',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">콘텐츠 관리</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="notices">공지사항</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="banners">배너</TabsTrigger>
          <TabsTrigger value="featured">추천 지역</TabsTrigger>
        </TabsList>

        {['notices', 'faq', 'banners', 'featured'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{tabLabels[tab]}</CardTitle>
                {tab !== 'featured' && (
                  <Button
                    className="bg-rose-500 hover:bg-rose-600"
                    size="sm"
                    onClick={() => { setFormData({}); setDialogOpen(true); }}
                  >
                    <Plus size={14} className="mr-1" /> 추가
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {renderItems()}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tabLabels[activeTab]} 추가</DialogTitle>
          </DialogHeader>
          {renderCreateForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleCreate} disabled={submitting}>
              {submitting ? '처리 중...' : '생성'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
