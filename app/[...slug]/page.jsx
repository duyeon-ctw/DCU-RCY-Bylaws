import { notFound } from 'next/navigation';
import { getDocuments, getDocument } from '../../lib/documents.mjs';
import { formatDate, site } from '../../lib/site.mjs';
import { AnchorCompatibility } from '../../components/controls';
import TableOfContents from '../../components/table-of-contents';

export const dynamicParams = false;
export function generateStaticParams() {
  return getDocuments().map(doc => ({ slug: doc.slug.split('/') }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = getDocument(slug);
  return doc ? { title: doc.title, description: doc.description, alternates: { canonical: doc.href } } : {};
}
export default async function DocumentPage({ params }) {
  const { slug } = await params;
  const doc = getDocument(slug);
  if (!doc) notFound();
  return (
    <div className="document-layout">
      <AnchorCompatibility aliases={doc.aliases} />
      <TableOfContents entries={doc.toc} title={doc.title} key={doc.slug} />
      <div className="document-main">
        <header className="document-header">
          <p className="eyebrow">DCU RCY / {doc.group || 'DOCUMENTS'}</p>
          <h1>{doc.title}</h1>
          <p className="lead">{doc.description}</p>
          <div className="metadata">
            <span>{doc.version}</span>
            {doc.effective_date && <span>시행일 <time dateTime={doc.effective_date}>{formatDate(doc.effective_date)}</time></span>}
            <span className="status">{doc.status}</span>
            {doc.updated_date && <span>문서 수정일 <time dateTime={doc.updated_date}>{formatDate(doc.updated_date)}</time></span>}
          </div>
          <p className="print-origin">대구가톨릭대학교 RCY · {site.url}{doc.href}</p>
        </header>
        {doc.member_notice && <div className="notice">{doc.member_notice}</div>}
        <div className="reading">
          <article className="prose" id="document-content" dangerouslySetInnerHTML={{ __html: doc.html }} />
        </div>
        <div className="document-actions"><a href={`/downloads/${doc.slug}.md`} download>Markdown 원본</a></div>
      </div>
    </div>
  );
}
