'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { groupOutline } from '../lib/outline.mjs';

export default function TableOfContents({ entries, title }) {
  const panel = useRef(null);
  const groups = useMemo(() => groupOutline(entries), [entries]);
  const [active, setActive] = useState(entries[0]?.id ?? '');
  const [expanded, setExpanded] = useState(() => new Set(groups.filter(group => group.children.length).slice(0, 1).map(group => group.id)));
  const previousGroup = useRef(null);
  const activeGroup = groups.find(group => group.id === active || group.children.some(entry => entry.id === active))?.id;

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
      const threshold = (Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head')) || 108) + 40;
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
    window.addEventListener('hashchange', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
      cancelAnimationFrame(frame);
    };
  }, [entries]);

  useEffect(() => {
    // Expand on entering a different chapter, not immediately after a manual collapse.
    if (activeGroup && previousGroup.current !== activeGroup) {
      setExpanded(current => new Set([...current, activeGroup]));
      previousGroup.current = activeGroup;
    }
  }, [activeGroup]);

  useEffect(() => {
    const nav = panel.current?.querySelector('nav');
    const selected = nav?.querySelector('[aria-current="location"]');
    if (!nav || !selected || !panel.current.open || !selected.getClientRects().length) return;
    const bounds = nav.getBoundingClientRect();
    const item = selected.getBoundingClientRect();
    if (item.top < bounds.top) nav.scrollTop -= bounds.top - item.top + 12;
    else if (item.bottom > bounds.bottom) nav.scrollTop += item.bottom - bounds.bottom + 12;
  }, [active, expanded]);

  function setGroup(id, open) {
    setExpanded(current => {
      if (current.has(id) === open) return current;
      const next = new Set(current);
      if (open) next.add(id); else next.delete(id);
      return next;
    });
  }
  function setAll(event, open) {
    // These buttons act on chapters without toggling the surrounding summary.
    event.preventDefault();
    event.stopPropagation();
    if (panel.current) panel.current.open = true;
    setExpanded(new Set(open ? groups.filter(group => group.children.length).map(group => group.id) : []));
  }
  function entryLink(entry, className) {
    return <a key={entry.id} href={`#${entry.id}`} className={className}
      aria-current={active === entry.id ? 'location' : undefined} onClick={() => setActive(entry.id)}>{entry.title}</a>;
  }
  if (!entries.length) return null;
  const expandable = groups.filter(group => group.children.length);
  return (
    <details className="toc-panel" ref={panel} open>
      <summary className="toc-heading">
        <span className="toc-heading-label">
          <svg className="toc-panel-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m7 4 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          차례
        </span>
        {expandable.length > 0 && <span className="toc-tools" role="group" aria-label="차례 펼침 설정">
          <button type="button" className="toc-icon-button" aria-label="모두 펼치기" title="모두 펼치기" aria-controls="document-outline" onClick={event => setAll(event, true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 8 5-5 5 5M7 16l5 5 5-5" /></svg>
          </button>
          <button type="button" className="toc-icon-button" aria-label="모두 접기" title="모두 접기" aria-controls="document-outline" onClick={event => setAll(event, false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 3 5 5 5-5M7 21l5-5 5 5" /></svg>
          </button>
        </span>}
      </summary>
      <p className="toc-document-title">{title}<span className="toc-total"> · {entries.length}개 항목</span></p>
      <nav id="document-outline" aria-label="현재 문서 차례">
        {groups.map(group => group.children.length ? (
          <details key={group.id} className={`toc-chapter${activeGroup === group.id ? ' is-current' : ''}`}
            open={expanded.has(group.id)} onToggle={event => setGroup(group.id, event.currentTarget.open)}>
            <summary>
              <svg className="toc-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m7 4 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="toc-chapter-title">{group.title}</span><span className="toc-count">{group.children.length}</span>
            </summary>
            <div className="toc-children">
              {entryLink(group, 'toc-chapter-start')}
              {group.children.map(entry => entryLink(entry, entry.level > group.level + 1 ? 'subheading' : undefined))}
            </div>
          </details>
        ) : entryLink(group, 'toc-standalone'))}
      </nav>
    </details>
  );
}
