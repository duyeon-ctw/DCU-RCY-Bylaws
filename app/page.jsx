import Catalog from '../components/catalog';
import { getDocuments, navigationData } from '../lib/documents.mjs';
export default function Home() {
  return <><header className="hero"><p className="eyebrow">DCU RCY / DOCUMENT LIBRARY</p><h1>함께 지키는 기준,<br/>투명하게 공개하는 운영.</h1><p className="lead">회칙부터 개인정보 보호까지, RCY의 운영 기준을 한곳에서 확인하세요.</p><div className="home-note">원문 기반 문서와 보충 작성안을 구분하여 제공합니다. 시행일·버전·문서 상태는 각 문서 상단에 표시됩니다.</div></header><Catalog documents={navigationData(getDocuments())}/></>;
}
