'use client';
import { useEffect, useRef, useState } from 'react';

export default function TableOfContents({ entries, title }) {
  const panel = useRef(null);
  const [active, setActive] = useState(entries[0]?.id ?? '');
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const resize = () => { if (panel.current) panel.current.open = media.matches; };
    resize();
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold = (Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head')) || 112) + 40;
      let current = entries[0]?.id ?? '';
      for (const entry of entries) {
        const element = document.getElementById(entry.id);
        if (element && element.getBoundingClientRect().top <= threshold) current = entry.id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [entries]);
  useEffect(() => {
    const nav = panel.current?.querySelector('nav');
    const selected = nav?.querySelector('[aria-current="location"]');
    if (!nav || !selected || !panel.current.open) return;
    const bounds = nav.getBoundingClientRect();
    const item = selected.getBoundingClientRect();
    if (item.top < bounds.top) nav.scrollTop -= bounds.top - item.top + 12;
    else if (item.bottom > bounds.bottom) nav.scrollTop += item.bottom - bounds.bottom + 12;
  }, [active]);
  if (!entries.length) return null;
  return (
    <details className="toc-panel" ref={panel} open>
      <summary>차례 <span>{entries.length}개 항목</span></summary>
      <p className="toc-document-title">{title}</p>
      <nav aria-label="현재 문서 차례">
        {entries.map(entry => (
          <a key={entry.id} href={`#${entry.id}`} className={entry.level >= 3 ? 'subheading' : undefined}
            aria-current={active === entry.id ? 'location' : undefined} onClick={() => setActive(entry.id)}>
            {entry.title}
          </a>
        ))}
      </nav>
    </details>
  );
}
