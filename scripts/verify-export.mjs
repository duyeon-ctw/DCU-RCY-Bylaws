import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {getDocuments,contentDigest,plainText} from '../lib/documents.mjs';
const docs=getDocuments();
for(const doc of docs){
  const file=path.join('out',doc.slug,'index.html');
  assert.ok(fs.existsSync(file),`Missing export: ${doc.href}`);
  const html=fs.readFileSync(file,'utf8');
  assert.ok(html.includes('id="document-content"'),`Missing article: ${doc.href}`);
  const article=html.match(/<article[^>]*id="document-content"[^>]*>([\s\S]*?)<\/article>/);
  assert.ok(article,`Unextractable article: ${doc.href}`);
  assert.equal(plainText(article[1]),doc.text,`Rendered content mismatch: ${doc.href}`);
  for(const heading of doc.toc)assert.ok(html.includes(`id="${heading.id}"`),`Missing heading ${heading.id}`);
  assert.ok(fs.existsSync(path.join('out/downloads',doc.slug+'.md')),`Missing Markdown download ${doc.slug}`);
}
assert.ok(fs.existsSync('out/.nojekyll'));
assert.equal(JSON.parse(fs.readFileSync('out/version.json')).contentHash,contentDigest(docs));
assert.equal(fs.readFileSync('out/CNAME','utf8').trim(),'bylaws.dcu.rcy.kr');
console.log(`Verified ${docs.length} routes: exported articles, heading anchors, Markdown downloads, domain and content hash.`);
