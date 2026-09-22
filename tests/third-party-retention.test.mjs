import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const privacy = fs.readFileSync(new URL('../content/privacy.md', import.meta.url), 'utf8');
const start = privacy.indexOf('## 제2조 제3자 제공');
const end = privacy.indexOf('<h2 id="overseas">', start);
assert.ok(start >= 0 && end > start, 'Third-party provision section must exist');
const provision = privacy.slice(start, end);

test('third-party retention follows the period set by each receiving organization', () => {
  assert.match(provision, /제3자에게 제공된 개인정보의 보유·이용 기간은 제공받는 각 기관·기업·업체가 정한 기간으로 한다/);
  const rows = provision.split('\n').filter(line => line.startsWith('| ')).slice(2);
  assert.equal(rows.length, 6);
  for (const row of rows) {
    const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
    assert.equal(cells.length, 4);
    assert.match(cells[3], /정한 보유·이용 기간/);
  }
  assert.doesNotMatch(provision, /확정 필요|해당 서비스·사업 운영기간을 기본 범위/);
});

test('retention policy preserves specific advance disclosure and consent safeguards', () => {
  assert.match(provision, /개별 제공 고지를 대신하지 않는다/);
  assert.match(provision, /구체적인 보유기간 또는 명확한 종료 기준/);
  assert.match(provision, /필요한 고지와 처리 근거를 갖추기 전에는 해당 자료를 제공하지 않는다/);
  assert.match(provision, /변경 내용을 알리고 필요한 동의를 받는다/);
  assert.match(provision, /무기한 보유를 허용하지 않는다/);
});

test('summary and activity reporting agree without changing officer settlement retention', () => {
  assert.match(privacy, /제3자 제공에 따른 수령자의 보유·이용 기간은 제2조를 우선 적용한다/);
  const reportRow = privacy.split('\n').find(line => line.startsWith('| 활동 인정·교류 보고 제공 |'));
  assert.ok(reportRow);
  assert.match(reportRow, /제공받는 각 기관·기업·업체가 정한 보유·이용 기간/);
  const officerRow = privacy.split('\n').find(line => line.startsWith('| 임원 회계 정산 |'));
  assert.ok(officerRow);
  assert.match(officerRow, /정산 완료 후 5년간 보관/);
  assert.match(provision, /임원 정산 자료 5년 기준도 외부 기관에 자동 적용하지 않는다/);
});
