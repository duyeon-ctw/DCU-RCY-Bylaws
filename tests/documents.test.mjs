import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {getDocuments,getDocument,renderMarkdown,contentDigest,splitMatter,plainText,navigationData} from '../lib/documents.mjs';
import {retiredSlugs,formatRegulations} from '../lib/regulation-format.mjs';
test('requested public documents and dates are retained; retired documents are not published',()=>{
 const docs=getDocuments();
 for(const slug of ['bylaws','finance','clubroom','privacy','terms','consent','media','cctv'])assert.ok(docs.some(d=>d.slug===slug),`Missing ${slug}`);
 for(const slug of retiredSlugs){assert.ok(!docs.some(d=>d.slug===slug));assert.equal(getDocument(slug.split('/')),null);}
 assert.ok(!navigationData(docs).some(d=>d.group==='관리'));
 for(const doc of docs.filter(d=>d.source_type==='source'||d.source_type==='supplement'))assert.equal(doc.effective_date,'2026-09-01');
 for(const doc of docs){assert.ok(doc.text.length>20);assert.ok(doc.toc.length>0);assert.equal(new Set(doc.toc.map(t=>t.id)).size,doc.toc.length);}
});
test('unsafe HTML and URL schemes are removed',()=>{
 const result=renderMarkdown('<script>alert(1)</script><img src=x onerror=alert(2)><a href="javascript:alert(3)" onclick="alert(4)">link</a><iframe src="https://example.com"></iframe><form action="https://example.com"><input name="x" value="secret"></form>');
 assert.doesNotMatch(result.html,/<script|<img|<iframe|<form|javascript:|onerror|onclick|secret/);
 assert.match(result.html,/type="checkbox" disabled/);
});
test('article-card formatting retains wording, heading anchors and table contents',()=>{
 const source='<h2 id="chapter">제1장 총칙</h2><h3 id="a1">제1조(목적)</h3><p>원문 3,000원</p><ol><li>첫 항</li></ol><h3 id="a2">제2조(한도)</h3><table><tbody><tr><td>10,000원</td></tr></tbody></table><h2>부칙</h2><p>2026년 9월 1일</p>';
 const output=formatRegulations(source);
 assert.equal(plainText(output),plainText(source));
 assert.equal((output.match(/class="art"/g)||[]).length,2);
 assert.match(output,/class="art-n">제1조/);assert.match(output,/class="tbl-wrap"/);
 assert.match(output,/id="a1"/);assert.match(output,/<\/section><h2>부칙/);
});
test('heading IDs are unique and cannot overwrite page-level IDs',()=>{
 const result=renderMarkdown('# 제목\n\n# 제목\n\n<h2 id="main">본문</h2>');
 assert.equal(new Set(result.toc.map(t=>t.id)).size,3);assert.doesNotMatch(result.html,/id="main"/);assert.ok(result.aliases.main);
});
test('Markdown edits change body and digest without JSX changes',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'rcy-doc-'));
 try{const source='---\ntitle: 테스트\ndescription: 테스트 문서\nstatus: 테스트\nversion: v1\neffective_date: "2026-09-01"\n---\n## 제1조(목적)\n\n수정 전';fs.writeFileSync(path.join(temp,'example.md'),source);const before=getDocuments(temp);fs.writeFileSync(path.join(temp,'example.md'),source.replace('수정 전','수정 후'));const after=getDocuments(temp);assert.notEqual(contentDigest(before),contentDigest(after));assert.match(after[0].html,/수정 후/);assert.doesNotMatch(after[0].html,/수정 전/);}finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('unsafe slugs and malformed metadata fail closed',()=>{assert.equal(getDocument(['..','README']),null);assert.equal(getDocument(['privacy.md']),null);assert.throws(()=>splitMatter('no metadata'));assert.throws(()=>splitMatter('---\ntitle: x\ntitle: y\n---\nbody'));});
test('published internal links resolve',()=>{
 const docs=getDocuments();const routes=new Set(['/',...docs.map(d=>d.href)]);
 for(const doc of docs)for(const match of doc.html.matchAll(/href="(\/[^"]*)"/g)){const pathname=match[1].split(/[?#]/)[0];if(pathname.endsWith('/'))assert.ok(routes.has(pathname),`${doc.slug}: broken link ${pathname}`);}
});
test('user-specified amounts and factual CCTV gaps are not lost',()=>{
 const finance=getDocument(['finance']).body;
 for(const value of ['2시간 이상','3시간 이상','3,000원','10,000원','월 1회','200,000원','하이패스','여행자보험','자동차보험'])assert.ok(finance.includes(value),value);
 const room=getDocument(['clubroom']).body;assert.match(room,/운영진의 사전 승인/);
 const cctv=getDocument(['cctv']).body;for(const value of ['윤민기','rcyindcu@gmail.com','동아리방 내부 1개','xizomi','1년','미기재','영상과 함께 음성 수집'])assert.ok(cctv.includes(value),value);
 assert.match(getDocument(['media']).body,/적용 보류/);
});
