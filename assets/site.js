'use strict';
(() => {
 const root = document.documentElement;
 const announce = (message) => { const el = document.getElementById('announcement'); if (el) el.textContent = message; };
 const theme = document.getElementById('theme');
 const applyTheme = (value) => { root.dataset.theme = value; if (theme) { theme.textContent = value === 'dark' ? '밝은 화면' : '어두운 화면'; theme.setAttribute('aria-pressed', String(value === 'dark')); } };
 let saved = 'light'; try { const value = localStorage.getItem('dcu-rcy-theme'); if (value === 'dark') saved = value; } catch (_) {}
 applyTheme(saved);
 if (theme) { theme.hidden = false; theme.addEventListener('click', () => { const value = root.dataset.theme === 'dark' ? 'light' : 'dark'; applyTheme(value); try { localStorage.setItem('dcu-rcy-theme', value); } catch (_) {} }); }
 const print = document.getElementById('print'); if (print) { print.hidden = false; print.addEventListener('click', () => window.print()); }
 const copy = document.getElementById('copy-link'); if (copy) { copy.hidden = false; copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); announce('문서 주소를 복사했습니다.'); copy.textContent = '복사 완료'; } catch (_) { announce('주소 표시줄의 문서 주소를 직접 복사해 주세요.'); copy.textContent = '주소 표시줄에서 복사'; } }); }
 const menu = document.querySelector('.sidebar'); const mq = window.matchMedia('(max-width:850px)'); const syncMenu = () => { if (menu) menu.open = !mq.matches; }; syncMenu(); if (mq.addEventListener) mq.addEventListener('change', syncMenu);
 const article = document.getElementById('document-content');
 if (article) {
  article.querySelectorAll('table').forEach((table) => { if (table.closest('.tbl-wrap,.table-scroll')) return; const wrap = document.createElement('div'); wrap.className = 'table-scroll'; wrap.setAttribute('tabindex','0'); wrap.setAttribute('role','region'); wrap.setAttribute('aria-label','좌우로 스크롤할 수 있는 표'); table.before(wrap); wrap.append(table); });
  const toc = document.querySelector('#page-toc nav');
  const headings = article.querySelectorAll('h2,h3,.art-h');
  headings.forEach((heading, i) => {
   if (!heading.id) { let id = 'section-' + (i + 1); const number = heading.querySelector('.art-n'); if (number) id = 'article-' + number.textContent.replace(/제|조/g,'').replace(/의/g,'-').trim(); const base = id; let n = 2; while (document.getElementById(id)) id = base + '-' + n++; heading.id = id; }
   if (toc) { const a = document.createElement('a'); a.href = '#' + encodeURIComponent(heading.id); a.textContent = heading.textContent.trim(); if (heading.matches('h3,.art-h')) a.className = 'sub'; toc.append(a); }
  });
  if (headings.length && toc) document.getElementById('page-toc').hidden = false;
  if (location.hash) { try { const target = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (target) requestAnimationFrame(() => target.scrollIntoView()); } catch (_) {} }
 }
 const search = document.getElementById('doc-search'); if (search) {
  search.hidden = false; const label = document.querySelector('label[for="doc-search"]'); if (label) label.hidden = false;
  search.addEventListener('input', () => { const value = search.value.normalize('NFC').trim().toLocaleLowerCase('ko'); let count = 0; document.querySelectorAll('.doc-card').forEach((card) => { const show = card.textContent.normalize('NFC').toLocaleLowerCase('ko').includes(value); card.hidden = !show; if(show) count++; }); const empty = document.getElementById('search-empty'); if(empty) empty.hidden = count !== 0; announce(count + '개 문서가 표시됩니다.'); });
 }
})();
