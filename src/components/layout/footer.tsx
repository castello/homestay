import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-auto hidden md:block">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">서비스</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/search" className="hover:underline">숙소 검색</Link></li>
              <li><Link href="/host/properties/new" className="hover:underline">호스트 되기</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">고객지원</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/notices" className="hover:underline">공지사항</Link></li>
              <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">약관</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:underline">이용약관</Link></li>
              <li><Link href="#" className="hover:underline">개인정보처리방침</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">회사 정보</h3>
            <p className="text-sm text-gray-600">
              (주)홈스테이<br />
              대표: 홍길동<br />
              사업자등록번호: 000-00-00000<br />
              서울특별시 강남구
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
          &copy; 2026 홈스테이. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
