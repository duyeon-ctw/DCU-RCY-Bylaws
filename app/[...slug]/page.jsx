import { notFound } from 'next/navigation';
import { getDocuments, getDocument } from '../../lib/documents.mjs';
import { site, formatDate } from '../../lib/site.mjs';
import { AnchorCompatibility } from '../../components/controls';
export const dynamicParams=false;
export function generateStaticParams() { return getDocuments().map(doc=>({slug:doc.slug.split('/')})); }
export async function generateMetadata({params}) { const {slug}=await params;const doc=getDocument(slug);return doc?{title:doc.title,description:doc.description,alternates:{canonical:doc.href}}:{}; }
export default async function DocumentPage({params}) {
  const {slug}=await params;
  const doc=getDocument(slug);
  if(!doc)notFound();
  return <><AnchorCompatibility aliases={doc.aliases}/><header className="document-header"><p className="eyebrow">DCU RCY / {doc.group || 'DOCUMENTS'}</p><h1>{doc.title}</h1><p className="lead">{doc.description}</p><div className="metadata"><span className="status">{doc.status}</span><span>{doc.version}</span>{doc.effective_date&&<span>{doc.source_type==='supplement'?'지정 시행일':'시행일'} <time dateTime={doc.effective_date}>{formatDate(doc.effective_date)}</time></span>}</div><div className="document-actions"><a href={`${site.repository}/edit/main/${doc.sourcePath}`}>Markdown 수정 ↗</a><a href={`${site.repository}/commits/main/${doc.sourcePath}`}>변경 이력 ↗</a><a href={`/downloads/${doc.slug}.md`} download>Markdown 원본</a></div></header>{doc.source_type==='supplement'&&<div className="notice">이 문서는 보충 작성안입니다. 지정 시행일 표시는 내용 확정이나 실제 의결·고지 이력을 대신하지 않습니다.</div>}{doc.source_type==='archive'&&<div className="notice">비교·보관용 문서입니다. 현재 적용 문서와 구분해서 확인하세요.</div>}<div className="reading"><article className="prose" id="document-content" dangerouslySetInnerHTML={{__html:doc.html}}/><aside className="toc" aria-label="현재 문서 목차"><strong>이 문서의 내용</strong><nav>{doc.toc.map(entry=><a key={entry.id} href={`#${entry.id}`} className={entry.level>=3?'subheading':undefined}>{entry.title}</a>)}</nav></aside></div><p className="content-hash">문서 식별값 {doc.hash.slice(0,12)}</p></>;
}
