import Link from 'next/link';
import { getDocuments, navigationData } from '../lib/documents.mjs';
import { site } from '../lib/site.mjs';
import Navigation from '../components/navigation';
import { Controls, FloatingPrintButton } from '../components/controls';
import './globals.css';
import './reading-layout.css';

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.title}` },
  description: '대구가톨릭대학교 RCY 회칙, 재무 규정 및 개인정보 보호 문서.',
  robots: { index: false, follow: true },
};

export default function RootLayout({ children }) {
  const navigation = navigationData(getDocuments()).map(({ text, ...doc }) => doc);
  return (
    <html lang="ko">
      <body>
        <a className="skip" href="#main">본문으로 바로가기</a>
        <header className="topbar">
          <div className="topbar-main">
            <Link className="brand" href="/">
              <svg className="brand-symbol" viewBox="0 0 64 64" aria-hidden="true">
                <path d="M2 14V2H14" fill="none" stroke="var(--accent)" strokeWidth="3" />
                <path d="M32 19V45M19 32H45" fill="none" stroke="currentColor" strokeWidth="8" />
              </svg>
              <b>RCY 운영 문서</b><span className="brand-chip">대구가톨릭대학교</span>
            </Link>
            <Controls />
          </div>
          <Navigation documents={navigation} />
        </header>
        <main className="workspace" id="main">
          {children}
          <footer className="footer">
            <strong>{site.name}</strong>
            <p><Link href="/privacy/">개인정보 처리방침</Link> · <Link href="/terms/">이용약관</Link> · <Link href="/cctv/">CCTV 운영·관리 방침</Link></p>
            <p>규정의 시행일과 개정 작성일은 구분합니다. 적용 보류 항목은 각 문서의 안내를 확인하세요.<br />회원정보·서명된 동의서·계좌 내역은 공개 저장소에 올리지 않습니다.</p>
          </footer>
        </main>
        <FloatingPrintButton />
      </body>
    </html>
  );
}
