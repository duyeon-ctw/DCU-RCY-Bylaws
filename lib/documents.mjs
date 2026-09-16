import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parse } from 'yaml';
import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export const CONTENT_DIR = path.join(process.cwd(), 'content');
const safeSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const reserved = new Set(['_next', 'assets', 'downloads', 'version.json', '404', 'api']);
const parser = new Marked({ gfm: true, breaks: false, async: false });
const tags = ['p','br','hr','h1','h2','h3','h4','h5','h6','blockquote','ul','ol','li','strong','b','em','i','del','s','code','pre','a','table','thead','tbody','tfoot','tr','th','td','caption','span','div','details','summary','sup','sub','input'];
const identity = value => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
export function plainText(html) {
  return identity(html).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
}
export function splitMatter(source, sourcePath = 'document') {
  const match = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error(`${sourcePath}: YAML front matter is required.`);
  const data = parse(match[1], { maxAliasCount: 0, uniqueKeys: true });
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${sourcePath}: invalid metadata.`);
  for (const field of ['title','description','status','version']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) throw new Error(`${sourcePath}: ${field} must be a non-empty string.`);
  }
  if (data.effective_date != null) {
    const date = data.effective_date;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(`${date}T00:00:00Z`).toISOString().slice(0,10) !== date) throw new Error(`${sourcePath}: invalid effective_date.`);
  }
  if (data.order != null && (typeof data.order !== 'number' || !Number.isFinite(data.order))) throw new Error(`${sourcePath}: order must be a number.`);
  if (!match[2].trim()) throw new Error(`${sourcePath}: empty document body.`);
  if (/\{%|\{\{/.test(match[2])) throw new Error(`${sourcePath}: unconverted template expression.`);
  return { data, body: match[2] };
}
export function renderMarkdown(markdown) {
  const parsed = parser.parse(markdown);
  const sanitized = sanitizeHtml(parsed, {
    allowedTags: tags,
    allowedAttributes: { a:['href','id','title'], '*':['id'], ol:['start'], td:['colspan','rowspan','align'], th:['colspan','rowspan','scope','align'], input:['type','checked','disabled'] },
    allowedSchemes: ['http','https','mailto','tel'],
    allowProtocolRelative: false,
    transformTags: {
      input: (tag, attrs) => ({ tagName:'input', attribs: { type:'checkbox', disabled:'disabled', ...(attrs.checked !== undefined ? { checked:'checked' } : {}) } }),
    },
  });
  // Prefix all explicit IDs to avoid DOM clobbering; retain old anchors as safe aliases below.
  const used = new Set();
  let serial = 0;
  const toc = [];
  const aliases = {};
  let html = sanitized.replace(/\bid="([^"]*)"/g, (_, id) => {
    const safe = `doc-id-${++serial}`;
    aliases[id] = safe;
    used.add(safe);
    return `id="${safe}"`;
  });
  html = html.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g, (_, depth, attributes, inner) => {
    const text = plainText(inner);
    const explicit = attributes.match(/\bid="([^"]+)"/);
    let id = explicit?.[1];
    if (!id) {
      const base = 'doc-' + (text.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-') || 'section');
      id = base;
      let n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      attributes += ` id="${id}"`;
    }
    if (Number(depth) <= 3) toc.push({ id, title: text, level: Number(depth) });
    return `<h${depth}${attributes}>${inner}</h${depth}>`;
  });
  html = html.replace(/href="#([^"]+)"/g, (match, id) => aliases[id] ? `href="#${aliases[id]}"` : match);
  // IDs are generated only after sanitization; never re-introduce arbitrary HTML.
  return { html, toc, aliases, text: plainText(html) };
}
function walk(directory, prefix = '') {
  if (!fs.existsSync(directory)) throw new Error('content/ is missing. Run npm run prepare:content.');
  return fs.readdirSync(directory, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(entry => {
    if (entry.isSymbolicLink()) throw new Error('Symlinks are not allowed in content/.');
    if (entry.name.startsWith('.')) return [];
    const relative = prefix + entry.name;
    if (entry.isDirectory()) return walk(path.join(directory, entry.name), relative + '/');
    return entry.name.endsWith('.md') ? [relative] : [];
  });
}
export function getDocuments(directory = CONTENT_DIR) {
  const documents = walk(directory).map(filename => {
    const slug = filename.slice(0, -3);
    if (slug.split('/').some(part => !safeSegment.test(part) || reserved.has(part))) throw new Error(`Unsafe or reserved document slug: ${slug}`);
    const source = fs.readFileSync(path.join(directory, filename), 'utf8');
    const { data, body } = splitMatter(source, filename);
    const rendered = renderMarkdown(body);
    return { ...data, slug, sourcePath:`content/${filename}`, href:`/${slug}/`, body, ...rendered, hash:crypto.createHash('sha256').update(source).digest('hex') };
  });
  if (!documents.length) throw new Error('No Markdown documents found.');
  return documents.sort((a,b)=>(a.order ?? 999)-(b.order ?? 999) || a.slug.localeCompare(b.slug));
}
export function getDocument(slug) {
  if (!Array.isArray(slug) || !slug.length || slug.some(part=>!safeSegment.test(part))) return null;
  return getDocuments().find(doc => doc.slug === slug.join('/')) ?? null;
}
export function contentDigest(documents) {
  return crypto.createHash('sha256').update(documents.map(doc=>`${doc.slug}:${doc.hash}`).sort().join('\n')).digest('hex');
}
export function navigationData(documents) {
  return documents.filter(doc=>!doc.hidden).map(({title,description,status,version,effective_date,href,group,slug,text})=>({title,description,status,version,effective_date,href,group:group || '기타 문서',slug,text}));
}
