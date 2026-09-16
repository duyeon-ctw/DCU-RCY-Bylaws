'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
export default function Catalog({documents}){
 const [query,setQuery]=useState('');
 const filtered=useMemo(()=>{const terms=query.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean);return documents.filter(doc=>terms.every(term=>`${doc.title} ${doc.description} ${doc.text}`.toLocaleLowerCase('ko').includes(term)));},[query,documents]);
 return <section className="catalog" aria-label="공개 문서 목록"><label className="search-label" htmlFor="document-search">문서 내용 검색</label><input id="document-search" className="search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="회의비, 출장비, 개인정보, CCTV…"/><p className="result-count" aria-live="polite">{filtered.length}개 문서</p><div className="cards">{filtered.map(doc=><Link className="document-card" key={doc.slug} href={doc.href}><span className="overline">{doc.group}</span><h2>{doc.title}</h2><p>{doc.description}</p><div className="card-bottom"><span>{doc.status}</span><b aria-hidden="true">↗</b></div></Link>)}</div>{filtered.length===0&&<p className="empty">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>}</section>;
}
