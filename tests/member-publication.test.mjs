import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { getDocuments, getDocument } from '../lib/documents.mjs';
import { displayHeadingTitle, groupOutline } from '../lib/outline.mjs';

test('article labels are readable and the bylaw name contains no literal stars', () => {
  const bylaws = getDocument(['bylaws']);
  assert.doesNotMatch(bylaws.body, /\*\*/);
  assert.ok(bylaws.text.includes('본회는 "대구가톨릭대학교 RCY"라 하며(이하 "본회"), 영문으로 "DCU RCY"로 표기한다.'));
  for (let n = 1; n <= 43; n++) assert.match(bylaws.body, new RegExp('### 제' + n + '조 '));
  for (const doc of getDocuments()) {
    assert.equal(doc.audience, 'members');
    for (const entry of doc.toc) assert.doesNotMatch(entry.title, /^제\d+조(?:의\d+)?\s*[（(]/);
  }
  assert.equal(displayHeadingTitle('제1조(명칭)'), '제1조 명칭');
  assert.equal(displayHeadingTitle('제14조의2(지출의 승인·서명)'), '제14조의2 지출의 승인·서명');
});
test('chapters and their original article order are preserved in the outline', () => {
  const doc = getDocument(['bylaws']);
  const grouped = groupOutline(doc.toc);
  assert.equal(grouped.filter(group => /^제\d+장/.test(group.title)).length, 9);
  assert.ok(grouped.some(group => group.title === '제1장 총칙' && group.children.length === 6));
  assert.deepEqual(grouped.flatMap(group => [group.id, ...group.children.map(entry => entry.id)]), doc.toc.map(entry => entry.id));
  assert.deepEqual(groupOutline([]), []);
  const noChapters = groupOutline([{ id:'a', title:'제1조 목적', level:2 }, { id:'b',title:'세부 내용',level:3 }, { id:'c',title:'제2조 기간',level:2 }]);
  assert.deepEqual(noChapters.map(group => group.children.length), [1, 0]);
});
test('joining consent is an explanation, not a new paper signature form', () => {
  for (const slug of ['consent', 'media']) {
    const doc = getDocument([slug]);
    assert.match(doc.title, /안내/);
    assert.match(doc.body, /회원가입/);
    assert.match(doc.body, /전자/);
    assert.doesNotMatch(doc.body, /서명[:：]\s*_+|작성일[:：]\s*_+|□\s*동의함|신규 서식안|필수동의 요청의 처리/);
  }
  assert.match(getDocument(['bylaws']).body, /가입 화면에서의 개인정보 수집·이용 전자 동의/);
});
test('officer access and the requested CCTV sentence removal are reflected', () => {
  const cctv = getDocument(['cctv']).body;
  assert.match(cctv, /접근 권한자는 동아리 임원/);
  assert.match(getDocument(['privacy']).body, /개인정보 접근 권한자는 동아리 임원/);
  assert.doesNotMatch(cctv, /행사 출입 승인이나 동아리 가입은|행사 출입 승인과 일반 촬영·홍보 동의는|미기재 — 별도 지정 필요/);
  assert.match(cctv, /담당 업무/);
});
test('icon controls retain accessible labels and chapter controls are available', () => {
  const controls = fs.readFileSync('components/controls.jsx', 'utf8');
  for (const token of ['icon-button', 'aria-label={modeLabel}', 'aria-label={copyLabel}', "name === 'sun'", "name === 'moon'", "name === 'check'"]) assert.ok(controls.includes(token));
  const toc = fs.readFileSync('components/table-of-contents.jsx', 'utf8');
  for (const token of ['toc-chapter', 'onToggle', '모두 펼치기', '모두 접기']) assert.ok(toc.includes(token));
});
test('completed migration cannot overwrite a later Markdown edit', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rcy-member-copy-'));
  try {
    fs.mkdirSync(path.join(temp, 'content'));
    fs.writeFileSync(path.join(temp, 'content/.member-copy-v4.3.json'), '{}');
    const file = path.join(temp, 'content/bylaws.md');
    fs.writeFileSync(file, 'A later human edit');
    const result = spawnSync(process.platform === 'win32' ? 'python' : 'python3', [path.resolve('scripts/publish-member-copy.py')], {cwd:temp, encoding:'utf8'});
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(file, 'utf8'), 'A later human edit');
    fs.unlinkSync(path.join(temp, 'content/.member-copy-v4.3.json'));
    const conflict = spawnSync(process.platform === 'win32' ? 'python' : 'python3', [path.resolve('scripts/publish-member-copy.py')], {cwd:temp, encoding:'utf8'});
    assert.notEqual(conflict.status, 0);
    assert.equal(fs.readFileSync(file, 'utf8'), 'A later human edit');
  } finally { fs.rmSync(temp, {recursive:true,force:true}); }
});
