'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
export default function Navigation({documents}){
 const pathname=usePathname();const panel=useRef(null);const groups=[...new Set(documents.map(doc=>doc.group))];
 function closeOnMobile(){if(window.matchMedia('(max-width: 1023px)').matches&&panel.current)panel.current.open=false;}
 useEffect(()=>{const query=window.matchMedia('(min-width: 1024px)');const resize=()=>{if(panel.current)panel.current.open=query.matches;};resize();query.addEventListener('change',resize);return()=>query.removeEventListener('change',resize);},[]);
 return <details ref={panel} className="sidebar" open><summary>차례</summary><nav aria-label="문서 탐색"><Link href="/" onClick={closeOnMobile} aria-current={pathname==='/'?'page':undefined}>전체 문서</Link>{groups.map(group=><section key={group}><h2>{group}</h2>{documents.filter(doc=>doc.group===group).map(doc=><Link key={doc.slug} href={doc.href} onClick={closeOnMobile} aria-current={pathname===doc.href||pathname+'/'===doc.href?'page':undefined}>{doc.title}</Link>)}</section>)}</nav></details>;
}
