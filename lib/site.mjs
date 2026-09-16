export const site = Object.freeze({
  name: '대구가톨릭대학교 RCY',
  title: 'DCU RCY 규정·정책',
  url: 'https://bylaws.dcu.rcy.kr',
  repository: 'https://github.com/duyeon-ctw/DCU-RCY-Bylaws',
  release: '4.0.0',
});
export function formatDate(value) {
  if (!value) return '미기재';
  const [year, month, day] = value.split('-');
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}
