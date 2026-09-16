import Catalog from '../components/catalog';
import { getDocuments, navigationData } from '../lib/documents.mjs';
export default function Home() {
  return <><header className="hero"><p className="eyebrow">DCU RCY / MEMBER GUIDE</p><h1>함께 지키는 기준,<br/>투명하게 공개하는 운영.</h1><p className="lead">회원이 확인할 회칙과 운영 규정, 개인정보 및 가입 동의 내용을 한곳에서 안내합니다.</p><div className="home-note">상단 메뉴에서 문서를 선택하고 왼쪽 차례로 필요한 조문을 찾아보세요. 가입 동의 안내는 이미 가입 과정에서 전자적으로 동의한 내용을 확인하는 문서입니다.</div></header><Catalog documents={navigationData(getDocuments())}/></>;
}
