import Link from 'next/link';
export default function NotFound(){return <section className="hero"><p className="eyebrow">404 / NOT FOUND</p><h1>문서를 찾을 수 없습니다.</h1><p>주소가 변경되었거나 삭제된 문서입니다.</p><Link href="/">문서 목록으로 이동 →</Link></section>;}
