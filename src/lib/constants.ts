export const APP_NAME = '홈스테이';
export const APP_DESCRIPTION = '특별한 숙소를 찾아보세요';

export const ACCOMMODATION_TYPES = [
  { value: 'apartment', label: '아파트' },
  { value: 'house', label: '단독주택' },
  { value: 'hanok', label: '한옥' },
  { value: 'guesthouse', label: '게스트하우스' },
  { value: 'villa', label: '빌라' },
  { value: 'pension', label: '펜션' },
  { value: 'farmstay', label: '농가체험' },
  { value: 'other', label: '기타' },
] as const;

export const SPACE_TYPES = [
  { value: 'entire', label: '집 전체' },
  { value: 'private', label: '개인실' },
  { value: 'shared', label: '다인실' },
] as const;

export const BED_TYPES = [
  { value: 'single', label: '싱글' },
  { value: 'double', label: '더블' },
  { value: 'queen', label: '퀸' },
  { value: 'king', label: '킹' },
  { value: 'bunk', label: '이층침대' },
] as const;

export const CANCELLATION_POLICIES = [
  { value: 'flexible', label: '유연', description: '체크인 24시간 전 무료 취소' },
  { value: 'moderate', label: '보통', description: '체크인 5일 전 무료 취소' },
  { value: 'strict', label: '엄격', description: '체크인 14일 전 50% 환불, 이후 환불 불가' },
  { value: 'super_strict', label: '매우 엄격', description: '체크인 30일 전 50% 환불, 이후 환불 불가' },
] as const;

export const RESERVATION_STATUSES = {
  pending: '대기중',
  confirmed: '예약확정',
  completed: '완료',
  cancelled: '취소',
} as const;

export const USER_ROLES = {
  guest: '게스트',
  host: '호스트',
  admin: '관리자',
} as const;

export const LANGUAGES = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
] as const;

export const CURRENCIES = [
  { value: 'KRW', symbol: '\u20A9', label: '원 (KRW)' },
  { value: 'USD', symbol: '$', label: 'Dollar (USD)' },
  { value: 'JPY', symbol: '\u00A5', label: '円 (JPY)' },
  { value: 'CNY', symbol: '\u00A5', label: '元 (CNY)' },
  { value: 'EUR', symbol: '\u20AC', label: 'Euro (EUR)' },
] as const;

export const REVIEW_CATEGORIES = [
  { value: 'cleanliness', label: '청결도' },
  { value: 'accuracy', label: '정확성' },
  { value: 'communication', label: '의사소통' },
  { value: 'location', label: '위치' },
  { value: 'checkin', label: '체크인' },
  { value: 'value', label: '가성비' },
] as const;

export const ITEMS_PER_PAGE = 20;
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
export const MAX_PHOTOS_PER_ACCOMMODATION = 30;
export const MIN_PHOTOS_PER_ACCOMMODATION = 5;
export const MAX_REVIEW_PHOTOS = 5;
export const REVIEW_MIN_LENGTH = 20;
export const REVIEW_MAX_LENGTH = 1000;
export const DESCRIPTION_MAX_LENGTH = 2000;
export const BIO_MAX_LENGTH = 500;
