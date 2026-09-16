import Catalog from '../components/catalog';
import { getDocuments, navigationData } from '../lib/documents.mjs';
export default function Home(){return <><header className="hero"><p className="eyebrow">REGULATIONS · DCU RCY</p><h1>선언이 아니라<br/><em>절차를 적었다.</em></h1><p className="lead">대구가톨릭대학교 RCY의 회칙과 제규정입니다.<br/>동아리 운영, 재무, 시설 이용과 개인정보 보호의 기준을 확인하세요.</p><div className="metadata"><span>기본 시행일 <b>2026. 09. 01.</b></span><span>개정 작성일 <b>2026. 09. 16.</b></span></div></header><Catalog documents={navigationData(getDocuments())}/></>;}
