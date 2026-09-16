// Presentation only: canonical wording remains in content/*.md.
export const retiredSlugs = new Set(['audit','recruitment','regulations','publication','reviews','references','editing','privacy/source','privacy/proposal']);
export function isPublishedSlug(slug) { return !retiredSlugs.has(slug); }
export function relocateRetiredLinks(html) {
  return html.replace(/href="(\/[^"]*)"/g, (full, href) => {
    const slug = href.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
    if (!retiredSlugs.has(slug)) return full;
    return `href="https://github.com/duyeon-ctw/DCU-RCY-Bylaws/blob/main/content/${slug}.md"`;
  });
}
export function formatRegulations(html) {
  // Only heading punctuation changes. Parentheses in article bodies are untouched.
  const heading = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g;
  let result = '', cursor = 0, openDepth = null;
  for (const match of html.matchAll(heading)) {
    const depth = Number(match[1]);
    result += html.slice(cursor, match.index);
    if (openDepth !== null && depth <= openDepth) { result += '</section>'; openDepth = null; }
    const article = match[3].match(/^(제\s*\d+조(?:의\s*\d+)?)([\s\S]*)$/);
    if (article) {
      if (openDepth !== null) result += '</section>';
      let label = article[2].trim();
      if ((label.startsWith('(') && label.endsWith(')')) || (label.startsWith('（') && label.endsWith('）'))) label = label.slice(1,-1).trim();
      result += `<section class="art"><h${depth}${match[2]} class="art-h"><span class="art-n">${article[1]}</span> <span class="art-title">${label}</span></h${depth}>`;
      openDepth = depth;
    } else result += match[0];
    cursor = match.index + match[0].length;
  }
  result += html.slice(cursor);
  if (openDepth !== null) result += '</section>';
  return result.replace(/<table>([\s\S]*?)<\/table>/g, '<div class="tbl-wrap"><table>$1</table></div>')
    .replace(/<li>([①-⑳⑴-⒇])/g, '<li class="subclause"><span class="cl-symbol">$1</span>');
}
