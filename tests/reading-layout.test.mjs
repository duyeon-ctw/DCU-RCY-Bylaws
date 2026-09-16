import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getDocument } from '../lib/documents.mjs';

test('financial disclosure and semester review match the requested amendment', () => {
  const body = getDocument(['finance']).body;
  const article = body.split('### 제21조(보고와 결산)')[1].split('### 제22조')[0];
  for (const value of ['홈페이지의 회계 페이지', '종강 2주 이내', '재무부장, 부회장, 회장']) assert.ok(article.includes(value), value);
  assert.doesNotMatch(article, /3줄 공지/);
});
test('privacy contacts, retention and monthly shared account rotation stay consistent', () => {
  const privacy = getDocument(['privacy']).body;
  assert.doesNotMatch(privacy, /\| 문의 응대 \|/);
  for (const value of ['수집·생성일로부터 최대 5년', '서비스 또는 사업 운영기간', '1달에 한 번 변경', '일반 개인정보 담당자 | **윤민기**']) assert.ok(privacy.includes(value), value);
  for (const slug of ['privacy', 'cctv', 'consent', 'media']) assert.ok(getDocument([slug]).body.includes('rcyindcu@gmail.com'));
  assert.ok(privacy.includes('행사 종료 즉시 파기'));
});
test('Xiaomi processing is explicit without inventing verified cloud settings', () => {
  const cctv = getDocument(['cctv']).body;
  for (const value of ['Xiaomi Home 클라우드로 전송·저장될 수 있으며', 'AI 영상분석 기술', '얼굴인식 데이터를 수집·저장한다', '계약상 정식 법인명·연락처 미확인', '공용 계정의 비밀번호는 1달에 한 번 변경']) assert.ok(cctv.includes(value), value);
  assert.doesNotMatch(cctv, /xizomi/);
});
test('document navigation, left outline and print stylesheet are wired', () => {
  const read = p => fs.readFileSync(p, 'utf8');
  assert.match(read('app/layout.jsx'), /<Navigation documents=\{navigation\}/);
  assert.match(read('app/[...slug]/page.jsx'), /<TableOfContents entries=\{doc.toc\}/);
  assert.match(read('components/table-of-contents.jsx'), /차례/);
  assert.match(read('components/controls.jsx'), /className="floating-print"/);
  const css = read('app/reading-layout.css');
  for (const value of ['max-width:1900px', '@page{size:A4', 'table-header-group', '.floating-print', 'break-inside:auto']) assert.ok(css.includes(value), value);
});
