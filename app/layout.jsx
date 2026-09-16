import Link from 'next/link';
import { getDocuments, navigationData } from '../lib/documents.mjs';
import { site } from '../lib/site.mjs';
import Navigation from '../components/navigation';
import { Controls } from '../components/controls';
import './globals.css';
export const metadata={metadataBase:new URL(site.url),title:{default:site.title,template:`%s | ${site.title}`},description:'대구가톨릭대학교 RCY 회칙, 재무 규정 및 개인정보 보호 문서.',robots:{index:false,follow:true}};
export default function RootLayout({children}) {
  const navigation=navigationData(getDocuments()).map(({text,...doc})=>doc);
  return <html lang="ko"><body><a className="skip" href="#main">본문으로 바로가기</a><header className="topbar"><Link className="brand" href="/"><span className="brand-mark">RCY</span><span>대구가톨릭대학교<small>규정·정책 라이브러리</small></span></Link><Controls/></header><Navigation documents={navigation}/><main className="workspace" id="main">{children}<footer className="footer"><strong>{site.name}</strong><p><Link href="/privacy/">개인정보 처리방침</Link><span> · </span><Link href="/terms/">이용약관</Link><span> · </span><Link href="/publication/">시행일·반영 기록</Link></p><p>문서 본문의 확정 여부와 미기재 사항은 각 문서를 확인하세요.<br/>회원정보·서명한 동의서·계좌 내역은 이 공개 저장소에 올리지 않습니다.</p><a href="/version.json">사이트 v{site.release} · 배포 정보</a></footer></main></body></html>;
}
