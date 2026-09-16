# 대구가톨릭대학교 RCY 규정·정책

공개 문서 사이트: https://bylaws.dcu.rcy.kr/

**시행일: 2026년 9월 1일**  
웹 문서 정리일: 2026년 9월 16일

## 원문 기반 문서

- `/bylaws/`: 첨부 제규정집 v2.2의 회칙 43조와 부칙. 사용자 지시에 따라 부칙 시행일 반영.
- `/finance/`: 재무 규정 24조 및 제14조의2·전결표. 시행일 부칙 추가.
- `/audit/`: 재무 감사 시행세칙 6조와 보고서 서식. 시행일 부칙 추가.
- `/recruitment/`: 임원 선발 규정 9조와 일정표. 시행일 부칙 추가.
- `/privacy/`: 첨부 개인정보 처리방침 v1.1의 8개 조항과 10개 업무. 학교명과 시행일 외 원문 유지.
- `/clubroom/`: 기존 8개 조항에 시행일 반영. 상세 운영 부록은 별도 작성안.

## 원문과 보완안의 구분

`/privacy/source/`는 빈칸을 포함한 첨부 원문 보관본입니다. 이전 확장 검토안은 `/privacy/proposal/`로 분리했으며 원문 기반 처리방침에 합치지 않았습니다.

`/terms/`, `/consent/`, `/media/`, `/cctv/`는 첨부 파일에 전문이 없는 보충 작성안입니다. 사용자 지정 시행일은 별도로 표시하며, 원문 재현본이나 의결 사실의 증명으로 취급하지 않습니다.

최신 반영 내역은 `/publication/`에 기록했습니다. `/reviews/`는 시행일 반영 전에 작성한 검토 기록으로 보존했습니다. 개인정보 담당자 성명·공용 이메일과 미제공 운영 정보는 임의로 채우지 않았습니다.

## 파일과 편집

- 원문 조문: `_includes/bylaws.html`, `finance.html`, `audit.html`, `recruitment.html`.
- 회칙 시행일: `bylaws/index.html`에서 원문 부칙의 날짜 문구만 명시적으로 치환.
- 개인정보 처리방침: `privacy/index.md`.
- 동아리방 시행일: 공통 레이아웃에서 기존 부칙의 날짜 문구만 치환.
- 공통 날짜: `_data/publication.yml`.
- 공통 화면: `_layouts/document.html`, `assets/site.css`, `assets/site.js`.
- 원본 문서 및 과거 Git 커밋의 작성일을 소급 변경하지 않습니다.

## 주소와 배포

기존 GitHub Pages Jekyll 구조와 `CNAME`을 유지합니다. `/bylaws/`, `/finance/`, `/privacy/` 등 폴더 주소를 사용하며, 기존 `.html` 호환 링크는 유지합니다. `main` / 루트 빌드를 사용하고 `.nojekyll`을 추가하지 않습니다.

로컬 빌드: `bundle install` 후 `bundle exec jekyll build`.

이 사이트는 문서 열람용입니다. 공개 저장소에 회원 명단, 생년월일, 연락처, 계좌 내역, 서명된 동의서, CCTV 영상이나 비밀번호를 올리지 않습니다.
