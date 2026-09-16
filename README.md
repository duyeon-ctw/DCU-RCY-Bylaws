# 대구가톨릭대학교 RCY 규정·정책

Next.js App Router + Markdown 정적 문서 사이트. 릴리스 **4.3.0**.

공개 사이트: https://bylaws.dcu.rcy.kr/

## 회원에게 공유하는 문서

| 문서 | 편집할 원본 | 공개 경로 |
| --- | --- | --- |
| 회칙 | `content/bylaws.md` | `/bylaws/` |
| 재무 규정 | `content/finance.md` | `/finance/` |
| 동아리방 이용 규정 | `content/clubroom.md` | `/clubroom/` |
| 개인정보 처리방침 | `content/privacy.md` | `/privacy/` |
| 이용약관 | `content/terms.md` | `/terms/` |
| 개인정보 동의 안내 | `content/consent.md` | `/consent/` |
| 촬영·초상 이용 안내 | `content/media.md` | `/media/` |
| CCTV 운영·관리 방침 | `content/cctv.md` | `/cctv/` |

본문은 `content/`의 Markdown만 읽습니다. `main`에 커밋하거나 PR을 병합하면 검사 → Next.js 빌드 → 결과 검증 → GitHub Pages 배포 → 공개 버전 검증이 자동으로 실행됩니다. 배포 성공 후 새로고침하면 수정 내용이 반영됩니다. 로컬 저장이나 GitHub 편집 중인 내용만으로 공개 사이트가 바뀌지는 않습니다.

제목은 `### 제1조 명칭`처럼 조문 번호와 이름을 공백으로 구분합니다. 문서의 일반 괄호까지 삭제하지 않습니다. 회칙에는 별표 강조 문자를 제거하여 명칭 문장이 그대로 표시됩니다.

## 4.3.0 변경

- 가입 시 전자 동의를 받는 운영 방식으로 동의 안내를 정리했습니다. 재서명을 요구하는 빈칸·체크표를 제거했습니다. 기존 동의에 새로운 목적이 포함된 것으로 소급 처리하지 않습니다.
- CCTV 및 개인정보 접근 권한자를 동아리 임원으로 명시했습니다. 역할·업무 목적·자료 범위·퇴임 시 회수 조건은 유지했습니다. 실제 시스템 권한 변경은 이 문서 편집에 포함되지 않습니다.
- 회원용 문서에서 편집·출처 설명을 정리하고, 공통 초안 배너를 제거했습니다. CCTV의 실제로 확인되지 않은 처리 항목은 본문에 구체적으로 남겼습니다.
- 차례를 기존 장별 접기·펼치기로 묶고 모두 펼치기·접기, 현재 조문 강조를 추가했습니다. 장이 없는 문서는 기존 제목 계층을 따릅니다.
- 다크·라이트 전환은 달·해 아이콘, 주소 복사는 복사·완료 아이콘으로 표시합니다. 버튼 설명·키보드 접근·복사 완료 알림은 유지합니다.
- 상단 문서 메뉴, 좌측 차례, 최대 1,900px 레이아웃, 우측 하단 인쇄 버튼과 A4 인쇄 양식을 유지했습니다.
- 재무의 금액·기한·제21조, 월 1회 비밀번호 변경, 담당자 윤민기 / rcyindcu@gmail.com, 기본 시행일 2026-09-01은 유지했습니다.

## 한 번만 적용되는 문서 정리

`scripts/publish-member-copy.py`는 검토한 원본 파일의 Git blob 해시가 일치할 때만 이번 회원용 편집을 적용합니다. 최초 성공 빌드에서 변경된 `content/*.md`와 `content/.member-copy-v4.3.json`이 저장됩니다. 이후에는 표시 파일을 확인하고 건너뛰므로 직접 고친 Markdown을 덮어쓰지 않습니다. 표시 파일이 삭제되어도 원본 해시가 달라진 문서는 덮어쓰지 않고 실패합니다. Python은 이 초기 편집과 기존 레거시 변환 때만 필요합니다.

프레임워크 변경과 문서 게시가 과거 동의나 법적 승인 사실을 만들어 내지는 않습니다. 회원별 가입 당시 문서·항목·일시와 변경·철회 기록은 별도 비공개 시스템에서 관리합니다. 이번 작업에서는 실제 가입 기록, 계정 비밀번호, CCTV 설정이나 클라우드 전송을 변경하지 않았습니다.

## 코드 구성

- `app/layout.jsx`: 상단 메뉴와 공통 화면
- `app/[...slug]/page.jsx`: Markdown 문서 페이지
- `components/table-of-contents.jsx`, `lib/outline.mjs`: 장별 차례
- `components/controls.jsx`: 테마·복사 아이콘, 인쇄
- `app/globals.css`: 규정집 기본 양식
- `app/reading-layout.css`: 넓은 화면·A4 인쇄
- `app/member-reading.css`: 회원용 가독성·접이식 차례·아이콘

감사·임원 선발·관리 문서 등 공개 제외 목록은 `lib/regulation-format.mjs`의 `retiredSlugs`를 유지합니다. 보관 원문·과거 Jekyll 파일과 Git 이력은 저장소에 남지만 새 페이지·검색·다운로드는 생성하지 않습니다.

## 실행·검증

Node.js 22 이상과 잠금 파일을 사용합니다.

```sh
npm ci
npm test
npm run build
npm run verify:export
npm run dev
```

배포 결과는 `out/`, 배포 커밋·문서 해시·빌드 시각은 `/version.json`, 실제 배포 Markdown은 `/downloads/`에서 확인합니다. GitHub Pages Source는 GitHub Actions를 유지합니다.

이 공개 저장소에는 회원명부, 동의 기록, 계좌 내역, CCTV 영상, 얼굴인식 데이터와 인증정보를 올리지 않습니다. 문서의 접근권한 조항과 실제 저장소 접근권한은 다른 개념입니다. 미확인 CCTV 수령 법인·국가·얼굴정보 보유기간 등의 운영 사실을 임의로 확정하지 않았습니다.
