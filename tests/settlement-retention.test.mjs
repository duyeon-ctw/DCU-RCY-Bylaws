import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../content/${name}.md`, import.meta.url), 'utf8');
const section = (text, start, end) => {
  const first = text.indexOf(start);
  assert.notEqual(first, -1, `Missing section: ${start}`);
  const last = text.indexOf(end, first + start.length);
  assert.notEqual(last, -1, `Missing section end: ${end}`);
  return text.slice(first, last);
};

test('officer settlement retention is five years after settlement in all three documents', () => {
  const privacy = read('privacy');
  const consent = read('consent');
  const finance = read('finance');
  const officerRow = privacy.split('\n').find(line => line.startsWith('| 임원 회계 정산 |'));
  assert.ok(officerRow);
  assert.match(officerRow, /정산 완료 후 5년간 보관/);
  assert.doesNotMatch(officerRow, /6개월/);
  assert.match(consent, /\| 임원 보유기간 \|.*정산 완료 후 5년간 보관/);
  assert.match(section(finance, '### 제23조 기록 보존과 인계', '### 제24조'), /임원 회계 정산 자료는 정산 완료 후 5년간 보관/);
  for (const text of [privacy, consent, finance]) {
    assert.ok(text.includes('환급금 지급과 관련 증빙 확인을 모두 마친 날'));
    assert.match(text, /소급/);
    assert.match(text, /전자 동의|전자적 방법/);
    assert.match(text, /파기/);
  }
});

test('officer exception does not silently extend other personal data', () => {
  const privacy = read('privacy');
  assert.match(privacy, /\| 일반 회원 대납 정산 \|.*6개월 이내/);
  assert.match(read('consent'), /\| 일반 회원 보유기간 \|.*6개월 이내/);
  assert.match(privacy, /행사 종료 즉시 파기/);
  assert.match(privacy, /일반 내부 기록의 5년은/);
  assert.match(read('finance'), /회계 시트·증빙·자산 대장은 2년간 보존한다/);
  assert.match(read('cctv'), /일반 내부 기록 5년 기준을 CCTV 영상이나 얼굴인식 데이터에 자동 적용하지 않는다/);
});

test('third-party placeholder is replaced with a pre-disclosure gate rather than fictional facts', () => {
  const provision = section(read('privacy'), '## 제2조 제3자 제공', '<h2 id="overseas">');
  assert.doesNotMatch(provision, /확정 필요/);
  assert.match(provision, /개별 제공 고지를 대신하지 않는다/);
  assert.match(provision, /필요한 고지와 처리 근거를 갖추기 전에는 해당 자료를 제공하지 않는다/);
  assert.match(provision, /외부 기관에 자동 적용하지 않는다/);
});

test('historical effective date is not presented as retroactive consent to the amendment', () => {
  for (const name of ['privacy', 'consent', 'finance']) {
    const text = read(name);
    assert.match(text, /effective_date: "2026-09-01"/);
    assert.match(text, /사전 공지/);
    assert.match(text, /종전/);
  }
  assert.match(read('privacy'), /정보주체에게 불리한 변경은 14일 전부터 공지/);
  assert.match(read('privacy'), /윤민기/);
  assert.match(read('privacy'), /rcyindcu@gmail\.com/);
});
