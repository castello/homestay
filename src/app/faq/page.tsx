'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface Category {
  id: number;
  name_ko: string;
  name_en: string | null;
  sort_order: number;
  faqs: FAQ[];
}

export default function FAQPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/faq')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        if (data.categories?.length > 0) {
          setActiveCategory(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleItem = (id: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (faq) =>
          (!searchQuery ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (activeCategory === null || cat.id === activeCategory)
      ),
    }))
    .filter((cat) => cat.faqs.length > 0);

  const totalCount = filteredCategories.reduce(
    (sum, cat) => sum + cat.faqs.length,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="space-y-3 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">
          자주 묻는 질문
        </h1>
        <p className="text-gray-500 text-center mb-8">
          궁금한 점을 빠르게 찾아보세요
        </p>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="질문을 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeCategory === null
                  ? 'bg-rose-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
              )}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setActiveCategory(cat.id === activeCategory ? null : cat.id)
                }
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  activeCategory === cat.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                )}
              >
                {cat.name_ko}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        {searchQuery && (
          <p className="text-sm text-gray-500 mb-4">
            {totalCount > 0
              ? `${totalCount}개의 결과를 찾았습니다`
              : '검색 결과가 없습니다'}
          </p>
        )}

        {/* FAQ Accordion */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-rose-500 rounded-full" />
                  {category.name_ko}
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 overflow-hidden">
                  {category.faqs.map((faq) => (
                    <div key={faq.id}>
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4">
                          Q. {faq.question}
                        </span>
                        <ChevronDown
                          className={cn(
                            'h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200',
                            openItems.has(faq.id) && 'rotate-180'
                          )}
                        />
                      </button>
                      {openItems.has(faq.id) && (
                        <div className="px-5 pb-4 text-gray-600 leading-relaxed bg-gray-50 border-t border-gray-100">
                          <div className="pt-3 whitespace-pre-line">
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !searchQuery && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">등록된 FAQ가 없습니다</p>
            </div>
          )
        )}

        {/* Contact */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="font-semibold text-gray-800 mb-2">
            원하는 답변을 찾지 못하셨나요?
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            고객센터로 문의해 주시면 빠르게 답변드리겠습니다.
          </p>
          <a
            href="mailto:support@homestay.com"
            className="inline-flex items-center px-6 py-2.5 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors"
          >
            고객센터 문의하기
          </a>
        </div>
      </div>
    </div>
  );
}
