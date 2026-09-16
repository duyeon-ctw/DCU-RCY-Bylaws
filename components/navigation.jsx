'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Navigation({ documents }) {
  const pathname = usePathname();
  const panel = useRef(null);
  useEffect(() => {
    const header = panel.current?.closest('header');
    if (!header) return;
    const measure = () => document.documentElement.style.setProperty('--head', `${header.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const current = panel.current?.querySelector('[aria-current="page"]');
    if (current && panel.current) {
      const nav = panel.current;
      nav.scrollLeft = Math.max(0, current.offsetLeft - nav.offsetLeft - (nav.clientWidth - current.offsetWidth) / 2);
    }
  }, [pathname]);
  return (
    <nav ref={panel} className="top-navigation" aria-label="문서 메뉴">
      <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>문서 홈</Link>
      {documents.map(doc => (
        <Link key={doc.slug} href={doc.href} aria-current={pathname.replace(/\/$/, '') === doc.href.replace(/\/$/, '') ? 'page' : undefined}>
          {doc.title}
        </Link>
      ))}
    </nav>
  );
}
