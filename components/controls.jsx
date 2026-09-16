'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function Controls() {
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    try {
      const active = localStorage.getItem('rcy-theme') === 'dark';
      document.documentElement.dataset.theme = active ? 'dark' : 'light';
      setDark(active);
    } catch {}
    return () => clearTimeout(timer.current);
  }, []);
  function toggle() {
    const active = !dark;
    setDark(active);
    document.documentElement.dataset.theme = active ? 'dark' : 'light';
    try { localStorage.setItem('rcy-theme', active ? 'dark' : 'light'); } catch {}
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch { window.prompt('아래 문서 주소를 복사하세요.', location.href); }
  }
  return (
    <div className="controls">
      <button type="button" onClick={toggle} aria-pressed={dark}>{dark ? '밝은 화면' : '어두운 화면'}</button>
      <button type="button" onClick={copy}>{copied ? '복사했습니다' : '주소 복사'}</button>
      <span className="sr-only" role="status">{copied ? '문서 주소를 복사했습니다.' : ''}</span>
    </div>
  );
}

export function FloatingPrintButton() {
  return (
    <button type="button" className="floating-print" onClick={() => window.print()} aria-label="현재 문서 인쇄 또는 PDF 저장">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7z" strokeLinejoin="round" />
        <path d="M16 11h1" strokeLinecap="round" />
      </svg>
      <span>인쇄 / PDF 저장</span>
    </button>
  );
}

export function AnchorCompatibility({ aliases = {} }) {
  const pathname = usePathname();
  useEffect(() => {
    let hash;
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (!hash) return;
    const target = aliases[hash];
    if (target) document.getElementById(target)?.scrollIntoView();
  }, [pathname, aliases]);
  return null;
}
