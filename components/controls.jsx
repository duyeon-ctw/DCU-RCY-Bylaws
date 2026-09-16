'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

function ControlIcon({ name }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'moon' && <path d="M20.8 13.2A8.8 8.8 0 0 1 10.8 3a9 9 0 1 0 10 10.2Z" />}
    {name === 'sun' && <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}
    {name === 'copy' && <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" /></>}
    {name === 'check' && <path d="m5 12 4 4L19 6" />}
  </svg>;
}
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
  const modeLabel = dark ? '라이트 모드로 전환' : '다크 모드로 전환';
  const copyLabel = copied ? '주소를 복사했습니다' : '문서 주소 복사';
  return <div className="controls">
    <button type="button" className="icon-button" onClick={toggle} aria-label={modeLabel} title={modeLabel} aria-pressed={dark}><ControlIcon name={dark ? 'sun' : 'moon'} /></button>
    <button type="button" className="icon-button" onClick={copy} aria-label={copyLabel} title={copyLabel} data-copied={copied}><ControlIcon name={copied ? 'check' : 'copy'} /></button>
    <span className="sr-only" role="status">{copied ? '문서 주소를 복사했습니다.' : ''}</span>
  </div>;
}
export function FloatingPrintButton() {
  return <button type="button" className="floating-print" onClick={() => window.print()} aria-label="현재 문서 인쇄 또는 PDF 저장">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7z" strokeLinejoin="round" /><path d="M16 11h1" strokeLinecap="round" /></svg>
    <span>인쇄 / PDF 저장</span>
  </button>;
}
export function AnchorCompatibility({ aliases = {} }) {
  const pathname = usePathname();
  useEffect(() => {
    function scrollToAlias() {
      let hash;
      try { hash = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      if (!hash) return;
      const target = aliases[hash];
      if (target) { document.getElementById(target)?.scrollIntoView(); return; }
      if (!document.getElementById(hash) && hash.startsWith('doc-제')) {
        // Preserve article URLs shared before title parentheses became spaces.
        const candidates = document.querySelectorAll('#document-content h1[id], #document-content h2[id], #document-content h3[id]');
        const previous = Array.from(candidates).find(element => element.id.replace(/^(doc-제\d+조(?:의\d+)?)-/, '$1') === hash);
        previous?.scrollIntoView();
      }
    }
    scrollToAlias();
    window.addEventListener('hashchange', scrollToAlias);
    return () => window.removeEventListener('hashchange', scrollToAlias);
  }, [pathname, aliases]);
  return null;
}
