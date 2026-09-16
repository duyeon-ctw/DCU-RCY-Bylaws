'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export default function Navigation({documents}) {
  const pathname=usePathname();
  const groups=[...new Set(documents.map(doc=>doc.group))];
  return <details className="sidebar" open><summary>문서 목록</summary><nav aria-label="문서 탐색"><Link href="/" aria-current={pathname==='/'?'page':undefined}>문서 홈</Link>{groups.map(group=><section key={group}><h2>{group}</h2>{documents.filter(doc=>doc.group===group).map(doc=><Link key={doc.slug} href={doc.href} aria-current={pathname===doc.href || pathname+'/'===doc.href?'page':undefined}>{doc.title}</Link>)}</section>)}</nav><p className="sidebar-note">수정은 Markdown 한 곳에서.<br/>문서별 시행일과 상태를 확인하세요.</p></details>;
}
