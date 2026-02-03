import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Admin user
  const adminPassword = await bcrypt.hash('Admin123!@#', 12);
  const admin = await prisma.users.upsert({
    where: { email: 'admin@homestay.com' },
    update: {},
    create: {
      email: 'admin@homestay.com',
      password_hash: adminPassword,
      display_name: '관리자',
      role: 'admin',
      email_verified: true,
      phone_verified: true,
      identity_verified: true,
      terms_agreed_at: new Date(),
      privacy_agreed_at: new Date(),
      status: 'active',
      updated_at: new Date(),
    },
  });
  console.log('  Admin user created');

  // 2. Amenity categories
  const catBasic = await prisma.amenity_categories.create({ data: { name: 'basic', display_name_ko: '기본 편의시설', display_name_en: 'Basic Amenities', sort_order: 1 } });
  const catSpecial = await prisma.amenity_categories.create({ data: { name: 'special', display_name_ko: '특별 편의시설', display_name_en: 'Special Amenities', sort_order: 2 } });
  const catAccess = await prisma.amenity_categories.create({ data: { name: 'accessibility', display_name_ko: '접근성 편의시설', display_name_en: 'Accessibility', sort_order: 3 } });
  const catSafety = await prisma.amenity_categories.create({ data: { name: 'safety', display_name_ko: '안전 시설', display_name_en: 'Safety', sort_order: 4 } });
  const catParking = await prisma.amenity_categories.create({ data: { name: 'parking', display_name_ko: '주차', display_name_en: 'Parking', sort_order: 5 } });
  console.log('  Amenity categories created');

  // 3. Amenities (36 items)
  const amenities = [
    { category_id: catBasic.id, name: 'wifi', display_name_ko: '와이파이', display_name_en: 'Wi-Fi', display_name_ja: 'Wi-Fi', display_name_zh: 'Wi-Fi', icon: 'wifi', sort_order: 1 },
    { category_id: catBasic.id, name: 'aircon', display_name_ko: '에어컨', display_name_en: 'Air conditioning', display_name_ja: 'エアコン', display_name_zh: '空调', icon: 'snowflake', sort_order: 2 },
    { category_id: catBasic.id, name: 'heating', display_name_ko: '난방', display_name_en: 'Heating', display_name_ja: '暖房', display_name_zh: '暖气', icon: 'flame', sort_order: 3 },
    { category_id: catBasic.id, name: 'tv', display_name_ko: 'TV', display_name_en: 'TV', display_name_ja: 'テレビ', display_name_zh: '电视', icon: 'tv', sort_order: 4 },
    { category_id: catBasic.id, name: 'refrigerator', display_name_ko: '냉장고', display_name_en: 'Refrigerator', display_name_ja: '冷蔵庫', display_name_zh: '冰箱', icon: 'refrigerator', sort_order: 5 },
    { category_id: catBasic.id, name: 'microwave', display_name_ko: '전자레인지', display_name_en: 'Microwave', display_name_ja: '電子レンジ', display_name_zh: '微波炉', icon: 'microwave', sort_order: 6 },
    { category_id: catBasic.id, name: 'washer', display_name_ko: '세탁기', display_name_en: 'Washer', display_name_ja: '洗濯機', display_name_zh: '洗衣机', icon: 'washing-machine', sort_order: 7 },
    { category_id: catBasic.id, name: 'dryer', display_name_ko: '건조기', display_name_en: 'Dryer', display_name_ja: '乾燥機', display_name_zh: '烘干机', icon: 'wind', sort_order: 8 },
    { category_id: catBasic.id, name: 'kitchen', display_name_ko: '주방', display_name_en: 'Kitchen', display_name_ja: 'キッチン', display_name_zh: '厨房', icon: 'chef-hat', sort_order: 9 },
    { category_id: catBasic.id, name: 'cookware', display_name_ko: '조리도구', display_name_en: 'Cookware', display_name_ja: '調理器具', display_name_zh: '炊具', icon: 'utensils', sort_order: 10 },
    { category_id: catBasic.id, name: 'tableware', display_name_ko: '식기류', display_name_en: 'Tableware', display_name_ja: '食器', display_name_zh: '餐具', icon: 'utensils-crossed', sort_order: 11 },
    { category_id: catBasic.id, name: 'coffee_machine', display_name_ko: '커피머신', display_name_en: 'Coffee machine', display_name_ja: 'コーヒーメーカー', display_name_zh: '咖啡机', icon: 'coffee', sort_order: 12 },
    { category_id: catBasic.id, name: 'hair_dryer', display_name_ko: '드라이기', display_name_en: 'Hair dryer', display_name_ja: 'ドライヤー', display_name_zh: '吹风机', icon: 'wind', sort_order: 13 },
    { category_id: catBasic.id, name: 'iron', display_name_ko: '다리미', display_name_en: 'Iron', display_name_ja: 'アイロン', display_name_zh: '熨斗', icon: 'shirt', sort_order: 14 },
    { category_id: catBasic.id, name: 'towels', display_name_ko: '수건', display_name_en: 'Towels', display_name_ja: 'タオル', display_name_zh: '毛巾', icon: 'bath', sort_order: 15 },
    { category_id: catBasic.id, name: 'bedding', display_name_ko: '침구류', display_name_en: 'Bedding', display_name_ja: '寝具', display_name_zh: '床上用品', icon: 'bed', sort_order: 16 },
    { category_id: catSpecial.id, name: 'pool', display_name_ko: '수영장', display_name_en: 'Pool', display_name_ja: 'プール', display_name_zh: '游泳池', icon: 'waves', sort_order: 1 },
    { category_id: catSpecial.id, name: 'jacuzzi', display_name_ko: '자쿠지', display_name_en: 'Jacuzzi', display_name_ja: 'ジャグジー', display_name_zh: '按摩浴缸', icon: 'bath', sort_order: 2 },
    { category_id: catSpecial.id, name: 'bbq', display_name_ko: '바비큐 시설', display_name_en: 'BBQ facility', display_name_ja: 'バーベキュー', display_name_zh: '烧烤设施', icon: 'flame', sort_order: 3 },
    { category_id: catSpecial.id, name: 'garden', display_name_ko: '정원/테라스', display_name_en: 'Garden/Terrace', display_name_ja: '庭/テラス', display_name_zh: '花园/露台', icon: 'trees', sort_order: 4 },
    { category_id: catSpecial.id, name: 'fireplace', display_name_ko: '벽난로', display_name_en: 'Fireplace', display_name_ja: '暖炉', display_name_zh: '壁炉', icon: 'flame', sort_order: 5 },
    { category_id: catSpecial.id, name: 'gym', display_name_ko: '헬스장', display_name_en: 'Gym', display_name_ja: 'ジム', display_name_zh: '健身房', icon: 'dumbbell', sort_order: 6 },
    { category_id: catSpecial.id, name: 'sauna', display_name_ko: '사우나', display_name_en: 'Sauna', display_name_ja: 'サウナ', display_name_zh: '桑拿', icon: 'thermometer', sort_order: 7 },
    { category_id: catSpecial.id, name: 'game_room', display_name_ko: '게임룸', display_name_en: 'Game room', display_name_ja: 'ゲームルーム', display_name_zh: '游戏室', icon: 'gamepad-2', sort_order: 8 },
    { category_id: catAccess.id, name: 'elevator', display_name_ko: '엘리베이터', display_name_en: 'Elevator', display_name_ja: 'エレベーター', display_name_zh: '电梯', icon: 'arrow-up-down', sort_order: 1 },
    { category_id: catAccess.id, name: 'wheelchair', display_name_ko: '휠체어 접근 가능', display_name_en: 'Wheelchair accessible', display_name_ja: '車いすアクセス可', display_name_zh: '轮椅可进入', icon: 'accessibility', sort_order: 2 },
    { category_id: catAccess.id, name: 'first_floor', display_name_ko: '1층 숙소', display_name_en: 'First floor', display_name_ja: '1階', display_name_zh: '一楼', icon: 'home', sort_order: 3 },
    { category_id: catSafety.id, name: 'fire_alarm', display_name_ko: '화재 경보기', display_name_en: 'Fire alarm', display_name_ja: '火災報知器', display_name_zh: '火灾报警器', icon: 'bell-ring', sort_order: 1 },
    { category_id: catSafety.id, name: 'fire_extinguisher', display_name_ko: '소화기', display_name_en: 'Fire extinguisher', display_name_ja: '消火器', display_name_zh: '灭火器', icon: 'flame-kindling', sort_order: 2 },
    { category_id: catSafety.id, name: 'first_aid', display_name_ko: '구급함', display_name_en: 'First aid kit', display_name_ja: '救急箱', display_name_zh: '急救箱', icon: 'cross', sort_order: 3 },
    { category_id: catSafety.id, name: 'lock', display_name_ko: '잠금장치', display_name_en: 'Lock', display_name_ja: 'ロック', display_name_zh: '锁', icon: 'lock', sort_order: 4 },
    { category_id: catSafety.id, name: 'cctv', display_name_ko: 'CCTV (공용구역)', display_name_en: 'CCTV (common area)', display_name_ja: 'CCTV（共用部）', display_name_zh: 'CCTV（公共区域）', icon: 'camera', sort_order: 5 },
    { category_id: catParking.id, name: 'free_parking', display_name_ko: '무료 주차', display_name_en: 'Free parking', display_name_ja: '無料駐車場', display_name_zh: '免费停车', icon: 'car', sort_order: 1 },
    { category_id: catParking.id, name: 'paid_parking', display_name_ko: '유료 주차', display_name_en: 'Paid parking', display_name_ja: '有料駐車場', display_name_zh: '付费停车', icon: 'car', sort_order: 2 },
    { category_id: catParking.id, name: 'no_parking', display_name_ko: '주차 불가', display_name_en: 'No parking', display_name_ja: '駐車不可', display_name_zh: '不可停车', icon: 'car-off', sort_order: 3 },
  ];

  for (const amenity of amenities) {
    await prisma.amenities.create({ data: amenity });
  }
  console.log(`  ${amenities.length} amenities created`);

  // 4. System settings
  const settings = [
    { setting_key: 'guest_service_fee_rate', setting_value: '10', description: '게스트 서비스 수수료율 (%)' },
    { setting_key: 'host_service_fee_rate', setting_value: '3', description: '호스트 서비스 수수료율 (%)' },
    { setting_key: 'cancellation_policy_default', setting_value: 'moderate', description: '기본 취소 정책' },
    { setting_key: 'max_upload_size_mb', setting_value: '10', description: '최대 업로드 크기 (MB)' },
    { setting_key: 'max_photos_per_accommodation', setting_value: '30', description: '숙소당 최대 사진 수' },
    { setting_key: 'min_photos_per_accommodation', setting_value: '5', description: '숙소당 최소 사진 수' },
    { setting_key: 'review_edit_hours', setting_value: '48', description: '리뷰 수정 가능 시간 (시간)' },
    { setting_key: 'review_mutual_publish_days', setting_value: '14', description: '리뷰 상호공개 대기일 (일)' },
    { setting_key: 'host_response_hours', setting_value: '24', description: '호스트 응답 시간 (시간)' },
    { setting_key: 'superhost_min_rating', setting_value: '4.8', description: '슈퍼호스트 최소 평점' },
  ];

  for (const s of settings) {
    await prisma.system_settings.upsert({
      where: { setting_key: s.setting_key },
      update: {},
      create: { ...s, updated_at: new Date() },
    });
  }
  console.log('  System settings created');

  // 5. FAQ categories
  const faqCategories = [
    { name_ko: '예약 및 결제', name_en: 'Booking & Payment', sort_order: 1 },
    { name_ko: '숙소 이용', name_en: 'Accommodation', sort_order: 2 },
    { name_ko: '취소 및 환불', name_en: 'Cancellation & Refund', sort_order: 3 },
    { name_ko: '호스트 관련', name_en: 'For Hosts', sort_order: 4 },
    { name_ko: '계정 관리', name_en: 'Account', sort_order: 5 },
    { name_ko: '기타', name_en: 'Others', sort_order: 6 },
  ];

  for (const cat of faqCategories) {
    await prisma.faq_categories.create({ data: cat });
  }
  console.log('  FAQ categories created');

  // 5-1. FAQ items
  const faqItems = [
    // 예약 및 결제
    { category_id: 1, question: '예약은 어떻게 하나요?', answer: '원하시는 숙소를 선택한 후 날짜와 인원을 입력하고 "예약하기" 버튼을 누르시면 됩니다. 결제가 완료되면 예약 확인 이메일이 발송됩니다.', sort_order: 1 },
    { category_id: 1, question: '결제 수단은 어떤 것이 있나요?', answer: '신용카드, 체크카드, 간편결제(카카오페이, 네이버페이, 토스페이) 등을 이용하실 수 있습니다. 무통장입금은 지원하지 않습니다.', sort_order: 2 },
    { category_id: 1, question: '예약 확인은 어디서 하나요?', answer: '마이페이지 > 예약 탭에서 예정된 예약, 완료된 예약, 취소된 예약을 모두 확인하실 수 있습니다. 예약 확인 이메일에서도 상세 내용을 보실 수 있습니다.', sort_order: 3 },
    { category_id: 1, question: '즉시 예약과 승인 대기 예약의 차이는 무엇인가요?', answer: '즉시 예약은 결제 즉시 예약이 확정됩니다. 승인 대기 예약은 호스트가 24시간 이내에 승인 또는 거절합니다. 호스트가 24시간 이내 응답하지 않으면 자동으로 취소되며 전액 환불됩니다.', sort_order: 4 },
    // 숙소 이용
    { category_id: 2, question: '체크인/체크아웃 시간은 어떻게 되나요?', answer: '체크인/체크아웃 시간은 숙소마다 다릅니다. 숙소 상세 페이지의 "하우스 룰" 섹션에서 정확한 시간을 확인하실 수 있습니다. 일반적으로 체크인은 오후 3시, 체크아웃은 오전 11시입니다.', sort_order: 1 },
    { category_id: 2, question: '반려동물을 데려갈 수 있나요?', answer: '반려동물 동반 가능 여부는 숙소마다 다릅니다. 검색 시 "반려동물 허용" 필터를 사용하시면 동반 가능한 숙소만 볼 수 있습니다. 숙소 상세 페이지에서도 확인 가능합니다.', sort_order: 2 },
    { category_id: 2, question: '추가 인원 요금은 어떻게 되나요?', answer: '기본 인원을 초과하는 경우 추가 인원당 요금이 부과됩니다. 추가 인원 요금은 숙소 상세 페이지의 요금 정보에서 확인하실 수 있으며, 예약 시 자동으로 계산됩니다.', sort_order: 3 },
    // 취소 및 환불
    { category_id: 3, question: '예약을 취소하려면 어떻게 하나요?', answer: '마이페이지 > 예약 탭에서 해당 예약의 "취소" 버튼을 누르시면 됩니다. 취소 수수료는 숙소의 취소 정책에 따라 달라집니다.', sort_order: 1 },
    { category_id: 3, question: '취소 정책은 어떤 것이 있나요?', answer: '유연(체크인 1일 전까지 전액 환불), 보통(체크인 5일 전까지 전액 환불, 이후 50% 환불), 엄격(체크인 7일 전까지 50% 환불, 이후 환불 불가) 세 가지 정책이 있습니다. 각 숙소의 취소 정책은 상세 페이지에서 확인하세요.', sort_order: 2 },
    { category_id: 3, question: '환불은 얼마나 걸리나요?', answer: '취소 승인 후 영업일 기준 3~5일 이내에 결제하신 수단으로 환불됩니다. 카드 결제의 경우 카드사에 따라 추가 시일이 소요될 수 있습니다.', sort_order: 3 },
    // 호스트 관련
    { category_id: 4, question: '호스트가 되려면 어떻게 하나요?', answer: '회원가입 후 "호스트 되기" 메뉴에서 숙소 정보를 등록하시면 됩니다. 관리자 검토 후 승인되면 숙소가 공개됩니다. 본인 인증과 계좌 등록이 필요합니다.', sort_order: 1 },
    { category_id: 4, question: '슈퍼호스트는 어떻게 되나요?', answer: '최근 1년간 평균 평점 4.8 이상, 예약 응답률 90% 이상, 호스트 취소율 1% 미만, 최소 10건 이상의 예약 완료 시 슈퍼호스트 자격이 부여됩니다. 분기별로 심사가 진행됩니다.', sort_order: 2 },
    { category_id: 4, question: '수수료는 얼마인가요?', answer: '호스트 수수료는 예약 금액의 3%이며, 게스트에게는 서비스 수수료 5%가 부과됩니다. 정산은 게스트 체크아웃 후 영업일 기준 3일 이내에 등록된 계좌로 입금됩니다.', sort_order: 3 },
    // 계정 관리
    { category_id: 5, question: '비밀번호를 잊어버렸어요', answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하시면 가입 시 사용한 이메일로 비밀번호 재설정 링크가 발송됩니다. 링크는 24시간 동안 유효합니다.', sort_order: 1 },
    { category_id: 5, question: '회원 탈퇴는 어떻게 하나요?', answer: '마이페이지 > 계정 탭에서 "계정 탈퇴"를 진행하실 수 있습니다. 진행 중인 예약이 있는 경우 탈퇴가 불가능하며, 탈퇴 시 모든 개인정보가 삭제됩니다.', sort_order: 2 },
    { category_id: 5, question: '프로필 정보를 수정하고 싶어요', answer: '마이페이지 > 프로필 탭에서 프로필 사진, 이름, 소개글, 연락처 등을 수정하실 수 있습니다. 이메일 주소 변경은 계정 탭에서 가능합니다.', sort_order: 3 },
  ];

  for (const faq of faqItems) {
    await prisma.faqs.create({
      data: { ...faq, updated_at: new Date() },
    });
  }
  console.log('  FAQ items created (' + faqItems.length + ' items)');

  // 6. Email templates
  const emailTemplates = [
    { template_key: 'welcome', language: 'ko', subject: '홈스테이에 오신 것을 환영합니다!', body: '{{displayName}}님, 회원가입을 축하합니다.' },
    { template_key: 'email_verification', language: 'ko', subject: '이메일 인증을 완료해주세요', body: '아래 링크를 클릭하여 이메일 인증을 완료해주세요: {{link}}' },
    { template_key: 'password_reset', language: 'ko', subject: '비밀번호 재설정 안내', body: '아래 링크를 클릭하여 비밀번호를 재설정해주세요: {{link}}' },
    { template_key: 'reservation_requested', language: 'ko', subject: '새 예약 요청이 도착했습니다', body: '{{guestName}}님이 {{accommodationName}}에 예약을 요청했습니다.' },
    { template_key: 'reservation_confirmed', language: 'ko', subject: '예약이 확정되었습니다', body: '{{accommodationName}} 예약이 확정되었습니다. 예약번호: {{reservationNumber}}' },
    { template_key: 'reservation_cancelled', language: 'ko', subject: '예약이 취소되었습니다', body: '예약번호 {{reservationNumber}}의 예약이 취소되었습니다.' },
    { template_key: 'payment_completed', language: 'ko', subject: '결제가 완료되었습니다', body: '{{amount}}원 결제가 완료되었습니다.' },
    { template_key: 'checkin_reminder', language: 'ko', subject: '체크인이 내일입니다!', body: '{{accommodationName}} 체크인이 내일 {{checkinTime}}입니다.' },
    { template_key: 'checkout_reminder', language: 'ko', subject: '오늘 체크아웃입니다', body: '{{accommodationName}} 체크아웃 시간은 {{checkoutTime}}입니다.' },
    { template_key: 'review_request', language: 'ko', subject: '숙소는 어떠셨나요? 리뷰를 남겨주세요', body: '{{accommodationName}} 이용은 어떠셨나요? 리뷰를 남겨주세요.' },
    { template_key: 'settlement_completed', language: 'ko', subject: '정산이 완료되었습니다', body: '{{amount}}원이 정산되었습니다.' },
    { template_key: 'host_approved', language: 'ko', subject: '호스트 승인이 완료되었습니다', body: '축하합니다! 호스트 승인이 완료되었습니다. 이제 숙소를 등록할 수 있습니다.' },
  ];

  for (const t of emailTemplates) {
    await prisma.email_templates.upsert({
      where: { template_key_language: { template_key: t.template_key, language: t.language } },
      update: {},
      create: { ...t, updated_at: new Date() },
    });
  }
  console.log('  Email templates created');

  // 7. Terms versions
  const termsVersions = [
    { type: 'terms_of_service', version: '1.0', content: '홈스테이 서비스 이용약관 v1.0\n\n제1조 (목적)\n이 약관은 홈스테이 플랫폼 서비스의 이용에 관한 기본적인 사항을 규정합니다.', is_current: true, effective_date: new Date('2026-01-01') },
    { type: 'privacy_policy', version: '1.0', content: '개인정보 처리방침 v1.0\n\n제1조 (개인정보의 수집 및 이용 목적)\n회사는 서비스 제공을 위해 필요한 개인정보를 수집합니다.', is_current: true, effective_date: new Date('2026-01-01') },
    { type: 'marketing', version: '1.0', content: '마케팅 수신 동의 v1.0\n\n이벤트, 프로모션 등 마케팅 정보를 이메일, SMS, 푸시알림으로 전송할 수 있습니다.', is_current: true, effective_date: new Date('2026-01-01') },
  ];

  for (const tv of termsVersions) {
    await prisma.terms_versions.upsert({
      where: { type_version: { type: tv.type, version: tv.version } },
      update: {},
      create: { ...tv, created_at: new Date() },
    });
  }
  console.log('  Terms versions created');

  // 8. Commission settings
  await prisma.commission_settings.create({
    data: { type: 'guest_service_fee', rate: 10, effective_from: new Date('2026-01-01'), created_at: new Date() },
  });
  await prisma.commission_settings.create({
    data: { type: 'host_service_fee', rate: 3, effective_from: new Date('2026-01-01'), created_at: new Date() },
  });
  console.log('  Commission settings created');

  // 8-1. Sample notices
  const notices = [
    {
      title: '홈스테이 서비스 오픈 안내',
      content: '안녕하세요, 홈스테이입니다.\n\n새롭게 선보이는 홈스테이 서비스가 정식 오픈하였습니다.\n\n한국의 다양한 숙소를 경험하고 특별한 추억을 만들어 보세요.\n\n앞으로도 더 좋은 서비스로 찾아뵙겠습니다.\n\n감사합니다.',
      is_pinned: true,
      is_published: true,
      view_count: 156,
      author_id: admin.id,
    },
    {
      title: '2026년 설날 연휴 고객센터 운영 안내',
      content: '안녕하세요, 홈스테이입니다.\n\n2026년 설날 연휴 기간 고객센터 운영 안내드립니다.\n\n▶ 휴무 기간: 2026년 1월 28일(화) ~ 1월 30일(목)\n▶ 정상 운영: 2026년 1월 31일(금)부터\n\n연휴 기간 중 긴급 문의는 앱 내 1:1 문의를 이용해 주세요.\n\n즐거운 명절 보내세요!',
      is_pinned: false,
      is_published: true,
      view_count: 89,
      author_id: admin.id,
    },
    {
      title: '앱 업데이트 안내 (v2.1.0)',
      content: '안녕하세요, 홈스테이입니다.\n\n더 나은 서비스를 위해 앱이 업데이트되었습니다.\n\n▶ 업데이트 내용\n- 검색 기능 개선\n- 예약 과정 간소화\n- 버그 수정 및 성능 개선\n\n최신 버전으로 업데이트하시면 더욱 편리하게 이용하실 수 있습니다.\n\n감사합니다.',
      is_pinned: false,
      is_published: true,
      view_count: 45,
      author_id: admin.id,
    },
    {
      title: '슈퍼호스트 프로그램 안내',
      content: '안녕하세요, 홈스테이입니다.\n\n슈퍼호스트 프로그램을 소개합니다.\n\n▶ 슈퍼호스트 자격 조건\n- 최근 1년간 평균 평점 4.8 이상\n- 예약 응답률 90% 이상\n- 호스트 취소율 1% 미만\n- 최소 10건 이상의 예약 완료\n\n▶ 슈퍼호스트 혜택\n- 검색 결과 우선 노출\n- 슈퍼호스트 배지 부여\n- 전용 고객 지원\n\n분기별 심사가 진행되며, 자격을 충족하시면 자동으로 선정됩니다.\n\n감사합니다.',
      is_pinned: false,
      is_published: true,
      view_count: 234,
      author_id: admin.id,
    },
  ];

  for (const notice of notices) {
    await prisma.notices.create({
      data: {
        ...notice,
        published_at: notice.is_published ? new Date() : null,
        updated_at: new Date(),
      },
    });
  }

  // Generate 200 additional test notices
  const noticeTitles = [
    '서비스 점검 안내',
    '시스템 업데이트 공지',
    '이벤트 당첨자 발표',
    '신규 기능 출시 안내',
    '결제 시스템 개선 안내',
    '고객센터 운영시간 변경',
    '새해 이벤트 안내',
    '추석 연휴 운영 안내',
    '보안 업데이트 안내',
    '약관 변경 사전 안내',
    '회원 등급 혜택 안내',
    '신규 지역 오픈 안내',
    '리뷰 이벤트 안내',
    '첫 예약 할인 이벤트',
    '호스트 수수료 정책 안내',
    '환불 정책 변경 안내',
    '개인정보 처리방침 개정',
    '앱 버전 업데이트 필수',
    '서버 이전 작업 안내',
    '쿠폰 사용 방법 안내',
  ];

  const noticeContents = [
    '안녕하세요, 홈스테이입니다.\n\n서비스 품질 향상을 위한 정기 점검이 예정되어 있습니다.\n\n점검 시간 동안 일부 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.\n\n감사합니다.',
    '안녕하세요, 홈스테이입니다.\n\n더 나은 서비스를 위해 시스템 업데이트를 진행합니다.\n\n업데이트 내용:\n- 성능 개선\n- 버그 수정\n- 사용자 경험 향상\n\n감사합니다.',
    '안녕하세요, 홈스테이입니다.\n\n이번 이벤트에 참여해 주신 모든 분들께 감사드립니다.\n\n당첨자 발표는 마이페이지에서 확인하실 수 있습니다.\n\n앞으로도 많은 관심 부탁드립니다.\n\n감사합니다.',
    '안녕하세요, 홈스테이입니다.\n\n고객님들의 편의를 위해 새로운 기능이 추가되었습니다.\n\n새 기능을 통해 더욱 편리하게 서비스를 이용해 보세요.\n\n감사합니다.',
  ];

  for (let i = 1; i <= 200; i++) {
    const titleIndex = (i - 1) % noticeTitles.length;
    const contentIndex = (i - 1) % noticeContents.length;
    const daysAgo = Math.floor(Math.random() * 180);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - daysAgo);

    await prisma.notices.create({
      data: {
        title: `${noticeTitles[titleIndex]} #${i}`,
        content: noticeContents[contentIndex],
        is_pinned: false,
        is_published: true,
        view_count: Math.floor(Math.random() * 500),
        author_id: admin.id,
        published_at: createdDate,
        created_at: createdDate,
        updated_at: createdDate,
      },
    });
  }
  console.log('  Sample notices created (' + (notices.length + 200) + ' items)');

  // 9. Featured regions
  const regions = [
    { region_name_ko: '제주', region_name_en: 'Jeju', search_keyword: '제주', image_url: '/images/regions/jeju.jpg', sort_order: 1 },
    { region_name_ko: '서울', region_name_en: 'Seoul', search_keyword: '서울', image_url: '/images/regions/seoul.jpg', sort_order: 2 },
    { region_name_ko: '부산', region_name_en: 'Busan', search_keyword: '부산', image_url: '/images/regions/busan.jpg', sort_order: 3 },
    { region_name_ko: '경주', region_name_en: 'Gyeongju', search_keyword: '경주', image_url: '/images/regions/gyeongju.jpg', sort_order: 4 },
    { region_name_ko: '강릉', region_name_en: 'Gangneung', search_keyword: '강릉', image_url: '/images/regions/gangneung.jpg', sort_order: 5 },
    { region_name_ko: '여수', region_name_en: 'Yeosu', search_keyword: '여수', image_url: '/images/regions/yeosu.jpg', sort_order: 6 },
  ];

  for (const r of regions) {
    await prisma.featured_regions.create({ data: r });
  }
  console.log('  Featured regions created');

  // 10. Sample host user
  const hostPassword = await bcrypt.hash('Host1234!', 12);
  const host = await prisma.users.upsert({
    where: { email: 'host@homestay.com' },
    update: {},
    create: {
      email: 'host@homestay.com',
      password_hash: hostPassword,
      display_name: '김민수',
      role: 'host',
      email_verified: true,
      phone_verified: true,
      phone: '010-1234-5678',
      is_superhost: true,
      is_host_approved: true,
      identity_verified: true,
      terms_agreed_at: new Date(),
      privacy_agreed_at: new Date(),
      status: 'active',
      updated_at: new Date(),
    },
  });
  console.log('  Sample host user created');

  // 11. Sample guest user
  const guestPassword = await bcrypt.hash('Guest1234!', 12);
  const guest = await prisma.users.upsert({
    where: { email: 'guest@homestay.com' },
    update: {},
    create: {
      email: 'guest@homestay.com',
      password_hash: guestPassword,
      display_name: '이서연',
      role: 'guest',
      email_verified: true,
      phone_verified: true,
      phone: '010-9876-5432',
      terms_agreed_at: new Date(),
      privacy_agreed_at: new Date(),
      status: 'active',
      updated_at: new Date(),
    },
  });
  console.log('  Sample guest user created');

  // 12. Sample accommodations
  const sampleAccommodations = [
    {
      name: '제주 오션뷰 풀빌라',
      description: '제주 해안가에 위치한 프라이빗 풀빌라입니다. 넓은 정원과 인피니티 풀, 바다가 보이는 테라스에서 특별한 휴식을 즐기세요. 공항에서 30분 거리에 위치해 있으며, 근처에 유명 맛집과 관광지가 많습니다.',
      accommodation_type: 'villa',
      space_type: 'entire',
      province: '제주특별자치도',
      city: '제주시',
      address: '제주시 애월읍 해안로 123',
      latitude: 33.4996,
      longitude: 126.5312,
      max_guests: 6,
      bedrooms: 2,
      bathrooms: 2,
      base_price: 250000,
      weekend_price: 300000,
      cleaning_fee: 50000,
      base_guests: 2,
      extra_guest_fee: 30000,
      min_nights: 1,
      max_nights: 30,
      checkin_time: '15:00',
      checkout_time: '11:00',
      cancellation_policy: 'moderate',
      instant_booking: true,
      status: 'active',
      avg_rating: 4.85,
      review_count: 28,
      photo: '/images/accommodations/resort-1.jpg',
    },
    {
      name: '서울 강남 모던 아파트',
      description: '강남역 도보 5분 거리의 깔끔한 모던 아파트입니다. 넓은 거실과 최신 가전제품이 구비되어 있으며, 주변에 쇼핑몰, 레스토랑, 카페가 즐비합니다. 비즈니스 출장이나 서울 여행에 최적의 위치입니다.',
      accommodation_type: 'apartment',
      space_type: 'entire',
      province: '서울특별시',
      city: '강남구',
      address: '서울 강남구 테헤란로 456',
      latitude: 37.5000,
      longitude: 127.0363,
      max_guests: 4,
      bedrooms: 1,
      bathrooms: 1,
      base_price: 120000,
      weekend_price: 150000,
      cleaning_fee: 30000,
      base_guests: 2,
      extra_guest_fee: 20000,
      min_nights: 1,
      max_nights: 90,
      checkin_time: '15:00',
      checkout_time: '11:00',
      cancellation_policy: 'flexible',
      instant_booking: true,
      status: 'active',
      avg_rating: 4.72,
      review_count: 45,
      photo: '/images/accommodations/apt-1.jpg',
    },
    {
      name: '부산 해운대 오션프론트 펜션',
      description: '해운대 해수욕장이 바로 앞에 보이는 오션프론트 펜션입니다. 발코니에서 바다를 감상하며 여유로운 시간을 보내세요. 해운대 맛집과 시장이 도보 거리에 있습니다.',
      accommodation_type: 'pension',
      space_type: 'entire',
      province: '부산광역시',
      city: '해운대구',
      address: '부산 해운대구 해운대해변로 789',
      latitude: 35.1587,
      longitude: 129.1604,
      max_guests: 8,
      bedrooms: 3,
      bathrooms: 2,
      base_price: 180000,
      weekend_price: 220000,
      cleaning_fee: 40000,
      base_guests: 4,
      extra_guest_fee: 25000,
      min_nights: 1,
      max_nights: 14,
      checkin_time: '15:00',
      checkout_time: '11:00',
      cancellation_policy: 'moderate',
      instant_booking: false,
      status: 'active',
      avg_rating: 4.91,
      review_count: 16,
      photo: '/images/accommodations/pension-1.jpg',
    },
    {
      name: '경주 한옥 스테이',
      description: '천년고도 경주의 전통 한옥에서 특별한 하룻밤을 경험하세요. 대청마루에서 바라보는 정원이 아름답고, 온돌방에서 편안한 잠자리를 제공합니다. 불국사, 첨성대 등 주요 관광지와 가깝습니다.',
      accommodation_type: 'hanok',
      space_type: 'entire',
      province: '경상북도',
      city: '경주시',
      address: '경주시 황남동 한옥마을길 12',
      latitude: 35.8354,
      longitude: 129.2190,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 1,
      base_price: 150000,
      weekend_price: 180000,
      cleaning_fee: 30000,
      base_guests: 2,
      extra_guest_fee: 20000,
      min_nights: 1,
      max_nights: 7,
      checkin_time: '16:00',
      checkout_time: '10:00',
      cancellation_policy: 'strict',
      instant_booking: false,
      status: 'active',
      avg_rating: 4.95,
      review_count: 52,
      photo: '/images/accommodations/hanok-1.jpg',
    },
    {
      name: '강릉 바다뷰 독채 펜션',
      description: '강릉 경포대 인근의 독채 펜션입니다. 2층 통유리창에서 동해 바다를 한눈에 감상할 수 있습니다. 바비큐 시설과 넓은 마당이 있어 가족 여행이나 모임에 적합합니다.',
      accommodation_type: 'pension',
      space_type: 'entire',
      province: '강원특별자치도',
      city: '강릉시',
      address: '강릉시 경포로 234',
      latitude: 37.7954,
      longitude: 128.9117,
      max_guests: 10,
      bedrooms: 4,
      bathrooms: 2,
      base_price: 200000,
      weekend_price: 280000,
      cleaning_fee: 50000,
      base_guests: 4,
      extra_guest_fee: 20000,
      min_nights: 1,
      max_nights: 14,
      checkin_time: '15:00',
      checkout_time: '11:00',
      cancellation_policy: 'moderate',
      instant_booking: true,
      status: 'active',
      avg_rating: 4.78,
      review_count: 34,
      photo: '/images/accommodations/house-1.jpg',
    },
    {
      name: '여수 밤바다 호텔',
      description: '여수 해상케이블카 근처에 위치한 부티크 호텔입니다. 객실에서 여수 밤바다의 아름다운 야경을 감상할 수 있습니다. 여수 낭만포차, 이순신광장 등 명소가 도보 거리에 있습니다.',
      accommodation_type: 'hotel',
      space_type: 'private_room',
      province: '전라남도',
      city: '여수시',
      address: '여수시 돌산대교길 567',
      latitude: 34.7604,
      longitude: 127.6622,
      max_guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      base_price: 130000,
      weekend_price: 160000,
      cleaning_fee: 0,
      base_guests: 2,
      extra_guest_fee: 0,
      min_nights: 1,
      max_nights: 30,
      checkin_time: '15:00',
      checkout_time: '11:00',
      cancellation_policy: 'flexible',
      instant_booking: true,
      status: 'active',
      avg_rating: 4.68,
      review_count: 89,
      photo: '/images/accommodations/hotel-1.jpg',
    },
  ];

  for (const acc of sampleAccommodations) {
    const { photo, ...accData } = acc;
    const created = await prisma.accommodations.create({
      data: {
        ...accData,
        host_id: host.id,
        updated_at: new Date(),
      },
    });
    // Add photo
    await prisma.accommodation_photos.create({
      data: {
        accommodation_id: created.id,
        url: photo,
        sort_order: 1,
      },
    });
    // Add basic amenities (wifi, aircon, kitchen, towels)
    const basicAmenityNames = ['wifi', 'aircon', 'heating', 'tv', 'kitchen', 'towels', 'hair_dryer', 'fire_alarm'];
    for (const name of basicAmenityNames) {
      const amenity = await prisma.amenities.findFirst({ where: { name } });
      if (amenity) {
        await prisma.accommodation_amenities.create({
          data: { accommodation_id: created.id, amenity_id: amenity.id },
        });
      }
    }
  }
  console.log(`  ${sampleAccommodations.length} sample accommodations created with photos`);

  // 13. Host profile
  await prisma.host_profiles.upsert({
    where: { user_id: host.id },
    update: {},
    create: {
      user_id: host.id,
      bank_name: '국민은행',
      account_number: '123-456-789012',
      account_holder: '김민수',
      response_rate: 98,
      avg_response_time_minutes: 15,
      updated_at: new Date(),
    },
  });
  console.log('  Host profile created');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
