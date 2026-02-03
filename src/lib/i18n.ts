const translations: Record<string, Record<string, string>> = {
  ko: {
    'common.search': '검색',
    'common.login': '로그인',
    'common.signup': '회원가입',
    'common.logout': '로그아웃',
    'common.cancel': '취소',
    'common.confirm': '확인',
    'common.save': '저장',
    'common.delete': '삭제',
    'common.edit': '수정',
    'common.loading': '로딩 중...',
    'home.title': '특별한 숙소를 찾아보세요',
    'home.search_placeholder': '어디로 여행가시나요?',
    'search.filters': '필터',
    'search.sort': '정렬',
    'search.no_results': '검색 결과가 없습니다',
    'booking.confirm': '예약 확인',
    'booking.payment': '결제하기',
    'review.write': '리뷰 작성',
    'review.rating': '평점',
  },
  en: {
    'common.search': 'Search',
    'common.login': 'Login',
    'common.signup': 'Sign Up',
    'common.logout': 'Logout',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'home.title': 'Find your special stay',
    'home.search_placeholder': 'Where are you going?',
    'search.filters': 'Filters',
    'search.sort': 'Sort',
    'search.no_results': 'No results found',
    'booking.confirm': 'Confirm Booking',
    'booking.payment': 'Pay Now',
    'review.write': 'Write Review',
    'review.rating': 'Rating',
  },
  ja: {
    'common.search': '検索',
    'common.login': 'ログイン',
    'common.signup': '会員登録',
    'common.logout': 'ログアウト',
    'common.cancel': 'キャンセル',
    'common.confirm': '確認',
    'common.save': '保存',
    'home.title': '特別な宿泊先を見つけよう',
  },
  zh: {
    'common.search': '搜索',
    'common.login': '登录',
    'common.signup': '注册',
    'common.logout': '退出',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'home.title': '寻找特别的住宿',
  },
};

export function t(key: string, locale: string = 'ko'): string {
  return translations[locale]?.[key] || translations['ko']?.[key] || key;
}

export function getAvailableLocales() {
  return Object.keys(translations);
}

export function useTranslation(locale: string = 'ko') {
  return {
    t: (key: string) => t(key, locale),
    locale,
  };
}
