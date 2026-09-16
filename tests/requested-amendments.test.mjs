import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getDocument } from '../lib/documents.mjs';

function article(body, title, nextTitle) {
  const start = body.indexOf(title);
  assert.notEqual(start, -1, `Missing ${title}`);
  const end = body.indexOf(nextTitle, start + title.length);
  assert.notEqual(end, -1, `Missing ${nextTitle}`);
  return body.slice(start + title.length, end).trim();
}

test('travel provision removes only the requested per-kilometre sentence', () => {
  const body = getDocument(['finance']).body;
  assert.doesNotMatch(body, /별도의 km당 단가는 이 규정으로 정하지 않는다/);
  assert.match(body, /거리·영수증 등 확인 가능한 자료로 출장 부담분을 산정한다/);
  for (const value of ['신규 회원 25,000원', '기존 회원 20,000원', '남은 금액은 회비에 편입', '원인자가 동일한 물품으로 배상']) assert.ok(body.includes(value), value);
});

test('clubroom permits autonomous use and retains only the six-item exit checklist in its appendix', () => {
  const body = getDocument(['clubroom']).body;
  assert.match(body, /회원은 동아리방을 자율적으로 이용하며/);
  assert.doesNotMatch(body, /공지된 시간에/);
  assert.match(body, /운영진의 사전 승인/);
  const appendix = body.split('## 상세 운영 부록')[1];
  assert.ok(appendix);
  assert.deepEqual(appendix.match(/^### .+$/gm), ['### 퇴실 점검표']);
  assert.equal((appendix.match(/^- \[ \]/gm) || []).length, 6);
  assert.doesNotMatch(appendix, /이용 안내표|예약과 방문객|비품 대여|사고·갈등/);
});

test('hierarchy and combined assembly clause preserve the remaining rules', () => {
  const body = getDocument(['bylaws']).body;
  const hierarchy = article(body, '### 제5조 규범의 위계', '### 제6조');
  assert.doesNotMatch(hierarchy, /총동아리연합회 회칙/);
  assert.match(hierarchy, /법령·학칙/);
  const assembly = article(body, '### 제15조 소집', '### 제16조');
  assert.equal((assembly.match(/^\d+\. /gm) || []).length, 2);
  assert.doesNotMatch(assembly, /정기총회|임시총회|학기당 1회/);
  for (const value of ['정회원 3분의 1', '회장이 14일 이내', '7일 전까지', '온라인 출석·표결']) assert.ok(assembly.includes(value), value);
});

test('bulk outline actions are labelled icon buttons next to the contents heading', () => {
  const source = fs.readFileSync('components/table-of-contents.jsx', 'utf8');
  const heading = source.split('<summary className="toc-heading">')[1]?.split('</summary>')[0];
  assert.ok(heading);
  assert.match(heading, /차례/);
  assert.match(heading, /aria-label="모두 펼치기"/);
  assert.match(heading, /aria-label="모두 접기"/);
  assert.equal((heading.match(/className="toc-icon-button"/g) || []).length, 2);
  assert.match(source, /event\.preventDefault\(\)/);
  assert.match(source, /event\.stopPropagation\(\)/);
});
