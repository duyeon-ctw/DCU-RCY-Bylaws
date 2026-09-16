import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {getDocuments,getDocument,renderMarkdown,contentDigest,splitMatter} from '../lib/documents.mjs';
test('all migrated documents and effective dates are preserved',()=>{
  const docs=getDocuments();
  for(const slug of ['bylaws','finance','audit','recruitment','clubroom','privacy','terms','consent','media','cctv','regulations','publication','reviews','references','privacy/source','privacy/proposal'])assert.ok(docs.some(d=>d.slug===slug),`Missing ${slug}`);
  for(const doc of docs.filter(d=>d.source_type==='source'||d.source_type==='supplement'))assert.match(doc.effective_date,/^\d{4}-\d{2}-\d{2}$/);
  for(const doc of docs){assert.ok(doc.text.length>20);assert.ok(doc.toc.length>0);assert.equal(new Set(doc.toc.map(t=>t.id)).size,doc.toc.length);}
});
test('unsafe HTML and URL schemes are removed',()=>{
  const result=renderMarkdown('<script>alert(1)</script><img src=x onerror=alert(2)><a href="javascript:alert(3)" onclick="alert(4)">link</a><iframe src="https://example.com"></iframe><form action="https://example.com"><input name="x" value="secret"></form>');
  assert.doesNotMatch(result.html,/<script|<img|<iframe|<form|javascript:|onerror|onclick|secret/);
  assert.match(result.html,/type="checkbox" disabled/);
});
test('heading IDs are unique and cannot overwrite page-level IDs',()=>{
  const result=renderMarkdown('# 제목\n\n# 제목\n\n<h2 id="main">본문</h2>');
  assert.equal(new Set(result.toc.map(t=>t.id)).size,3);
  assert.doesNotMatch(result.html,/id="main"/);
  assert.ok(result.aliases.main);
});
test('Markdown edits change the published body and content hash without JSX changes',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'rcy-doc-'));
  try{
    const source='---\ntitle: 테스트\ndescription: 테스트 문서\nstatus: 테스트\nversion: v1\neffective_date: "2026-09-01"\n---\n## 첫 조항\n\n수정 전';
    fs.writeFileSync(path.join(temp,'example.md'),source);
    const before=getDocuments(temp);
    fs.writeFileSync(path.join(temp,'example.md'),source.replace('수정 전','수정 후'));
    const after=getDocuments(temp);
    assert.notEqual(contentDigest(before),contentDigest(after));
    assert.match(after[0].html,/수정 후/);assert.doesNotMatch(after[0].html,/수정 전/);
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('unsafe slugs and malformed metadata fail closed',()=>{
  assert.equal(getDocument(['..','README']),null);
  assert.equal(getDocument(['privacy.md']),null);
  assert.throws(()=>splitMatter('no metadata'));
  assert.throws(()=>splitMatter('---\ntitle: x\ntitle: y\n---\nbody'));
});
test('known internal document links resolve',()=>{
  const docs=getDocuments();const routes=new Set(['/',...docs.map(d=>d.href)]);
  for(const doc of docs){for(const match of doc.html.matchAll(/href="(\/[^"]*)"/g)){
    const pathname=match[1].split(/[?#]/)[0];
    if(pathname.endsWith('/'))assert.ok(routes.has(pathname),`${doc.slug}: broken link ${pathname}`);
  }}
});
