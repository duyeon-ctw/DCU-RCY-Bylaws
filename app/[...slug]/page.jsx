import { notFound } from 'next/navigation';
import { getDocuments, getDocument } from '../../lib/documents.mjs';
import { formatDate } from '../../lib/site.mjs';
import { AnchorCompatibility } from '../../components/controls';
export const dynamicParams=false;
export function generateStaticParams(){return getDocuments().map(doc=>({slug:doc.slug.split('/')}));}
export async function generateMetadata({params}){const {slug}=await params;const doc=getDocument(slug);return doc?{title:doc.title,description:doc.description,alternates:{canonical:doc.href}}:{};}
export default async function DocumentPage({params}){
  const {slug}=await params;const doc=getDocument(slug);if(!doc)notFound();
  return <><AnchorCompatibility aliases={doc.aliases}/><header className="document-header"><p className="eyebrow">DCU RCY / {doc.group || 'DOCUMENTS'}</p><h1>{doc.title}</h1><p className="lead">{doc.description}</p><div className="metadata"><span>{doc.version}</span>{doc.effective_date&&<span>{doc.source_type==='supplement'?'지정 시행일':'시행일'} <time dateTime={doc.effective_date}>{formatDate(doc.effective_date)}</time></span><span className="status">{doc.status}</span>{doc.updated_date&&<span>개정 작성일 {formatDate(doc.updated_date)}</span>}</div></header>{doc.source_type==='supplement'&&<div className="notice">이 문서는 보충 작성안입니다. 미기재 사항과 적용 보류 항목은 확인·고지 절차를 거치기 전 적용하지 않습니다.</div>}<details className="page-outline"><summary>이 문서 차례</summary><nav aria-label="현재 문서 목차">{doc.toc.map(entry=><a key={entry.id} href={`#${entry.id}`} className={entry.level>=3?'subheading':undefined}>{entry.title}</a>)}</nav></details><div className="reading"><article className="prose" id="document-content" dangerouslySetInnerHTML={{__html:doc.html}}/></div><div className="document-actions"><a href={`/downloads/${doc.slug}.md`} download>Markdown 원본</a></div></>;
}
