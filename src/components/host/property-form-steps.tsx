'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, title: '기본 정보', description: '숙소 유형과 이름' },
  { id: 2, title: '위치', description: '주소와 지도 위치' },
  { id: 3, title: '객실 구성', description: '침실, 침대, 욕실' },
  { id: 4, title: '편의시설', description: '제공하는 편의시설' },
  { id: 5, title: '사진', description: '숙소 사진 업로드' },
  { id: 6, title: '설명', description: '숙소 설명 작성' },
  { id: 7, title: '요금', description: '가격 및 할인 설정' },
  { id: 8, title: '예약 설정', description: '예약 규칙 설정' },
  { id: 9, title: '하우스 룰', description: '이용 규칙 설정' },
];

interface PropertyFormStepsProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

export function PropertyFormSteps({ currentStep, completedSteps, onStepClick }: PropertyFormStepsProps) {
  return (
    <nav className="space-y-1">
      {STEPS.map((step) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;

        return (
          <button
            key={step.id}
            onClick={() => onStepClick?.(step.id)}
            disabled={!onStepClick}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
              isCurrent && 'bg-rose-50 text-rose-700',
              !isCurrent && !isCompleted && 'text-gray-500 hover:bg-gray-50',
              isCompleted && !isCurrent && 'text-gray-700 hover:bg-gray-50'
            )}
          >
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0',
              isCompleted && 'bg-green-500 text-white',
              isCurrent && !isCompleted && 'bg-rose-500 text-white',
              !isCurrent && !isCompleted && 'bg-gray-200 text-gray-500'
            )}>
              {isCompleted ? <Check size={14} /> : step.id}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{step.title}</p>
              <p className="text-xs text-gray-400 truncate">{step.description}</p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

export { STEPS as PROPERTY_FORM_STEPS };
