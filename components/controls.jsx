'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
export function Controls() {
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(()=>{ try { const active = localStorage.getItem('rcy-theme') === 'dark'; document.documentElement.dataset.theme = active ? 'dark':'light'; setDark(active); } catch {} },[]);
  function toggle() { const active=!dark; setDark(active); document.documentElement.dataset.theme=active?'dark':'light'; try{localStorage.setItem('rcy-theme',active?'dark':'light');}catch{} }
  async function copy() { try { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(()=>setCopied(false),2000); } catch { window.prompt('아래 문서 주소를 복사하세요.', location.href); } }
  return <div className="controls"><button onClick={toggle} aria-pressed={dark}>{dark?'밝은 화면':'어두운 화면'}</button><button onClick={copy}>{copied?'복사했습니다':'주소 복사'}</button><button onClick={()=>window.print()}>인쇄</button><span className="sr-only" role="status">{copied?'문서 주소를 복사했습니다.':''}</span></div>;
}
export function AnchorCompatibility({ aliases = {} }) {
  const pathname = usePathname();
  useEffect(()=>{
    let hash; try { hash=decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (!hash) return;
    const target=aliases[hash];
    if (target) document.getElementById(target)?.scrollIntoView();
  }, [pathname, aliases]);
  return null;
}
