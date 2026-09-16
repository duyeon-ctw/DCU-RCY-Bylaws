# 대구가톨릭대학교 RCY 규정·정책

공개 문서 사이트: https://bylaws.dcu.rcy.kr/

## 이번 구성

- `/bylaws/` 회칙 43개 조문과 부칙 — 첨부 제규정집 v2.2 본문 보존
- `/finance/` 재무 24개 조문 및 제14조의2 — 원문 보존
- `/audit/`, `/recruitment/` 감사·선발 원문
- `/clubroom/` 기존 8조 초안과 구분된 상세 운영 부록
- `/privacy/` 상세 개정 검토안, `/privacy/source/` 첨부 v1.1 비교용 원문
- `/terms/`, `/consent/`, `/media/`, `/cctv/` 신규 검토안·서식
- `/regulations/`, `/reviews/`, `/references/` 문서 관계, 검토 기록, 출처

## 주소와 배포

GitHub Pages의 기본 Jekyll 빌드를 사용합니다. 각 폴더의 `index.html` 또는 `index.md`가 정적 HTML로 빌드되어 `.html`이 없는 폴더 주소로 표시됩니다. 별도의 서버·데이터베이스는 없습니다. `CNAME`은 기존 설정을 유지했습니다.

기존 `bylaws.html`, `finance.html`, `clubroom.html`은 쿼리와 문서 위치 해시를 보존하며 새 주소로 이동합니다. JavaScript를 끈 경우 이동 링크가 표시됩니다. 실제 문서 본문은 JavaScript 없이도 읽을 수 있습니다.

Pages는 `main` / 루트의 기본 Jekyll 빌드를 유지해야 합니다. `.nojekyll` 파일을 추가하거나 Liquid 소스를 빌드 없이 배포하지 마세요. 기본 테마·외부 플러그인·외부 폰트·분석 SDK를 사용하지 않습니다. 저장소의 원본 코드는 공개되며, 주소 확장자 제거는 소스코드를 숨기는 보안 기능이 아닙니다.

## 수정

공통 틀: `_layouts/document.html`, 디자인: `assets/site.css`, 목차·테마·검색: `assets/site.js`.
원문 조문: `_includes/bylaws.html`, `finance.html`, `audit.html`, `recruitment.html`.
신규 문서: 각 경로의 `index.md`. 목차는 제목과 조문 헤더를 기반으로 생성합니다.

로컬 확인: `bundle install` 후 `bundle exec jekyll serve`. 빌드: `bundle exec jekyll build`.

## 정식 적용 전

1. 원문에 미기재된 제정일·의결 정보와 상위 규정을 확인합니다.
2. 개인정보 담당 부서·연락처, 수집 항목, 실제 서비스·수탁자·국외이전 정보를 확정합니다.
3. CCTV 설치 권한·장소 성격·촬영 범위·보유기간·관리책임자·안내판을 확인합니다.
4. `reviews/`의 충돌·개정 사항을 의결하고 실제 설정과 문서를 일치시킵니다.
5. 공고·동의 절차 후 문서 상태·버전·시행일을 갱신합니다. 검색 노출 여부(`robots`)도 그때 결정합니다.

회원 명단, 생년월일, 연락처, 계좌, 비밀번호, 서명한 동의서, CCTV 영상은 이 공개 저장소에 커밋하지 않습니다. 여기의 동의서는 작성용 서식이며 온라인 제출 기능이 아닙니다.

원문 수록은 적법성 또는 의결 사실의 인증이 아닙니다. 신규 문서의 제안 기준과 실제 적용 기준을 구분하세요.
