'use strict';
(() => {
 // Real directory index pages exist; refresh remains valid after canonicalization.
 if (location.pathname.endsWith('/index.html')) {
  try { history.replaceState(null, '', location.pathname.slice(0, -10) + location.search + location.hash); } catch (_) {}
 }
 document.querySelectorAll('.sidebar nav a').forEach((link) => {
  const normalize = (path) => path.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  if (normalize(new URL(link.href).pathname) === normalize(location.pathname)) link.setAttribute('aria-current', 'page');
 });
})();
