# 대구가톨릭대학교 RCY 규정·정책

Next.js App Router 기반의 Markdown 문서 사이트입니다. 기존 도메인 `https://bylaws.dcu.rcy.kr/`과 `/bylaws/`, `/finance/`, `/privacy/` 등의 주소를 유지합니다.

## 문서 수정은 Markdown만

한 번의 초기 변환 후 `content/`가 화면 본문의 유일한 원본입니다.

| 문서 | 수정할 파일 |
| --- | --- |
| 회칙 | `content/bylaws.md` |
| 재무 규정 | `content/finance.md` |
| 감사·선발 | `content/audit.md`, `content/recruitment.md` |
| 동아리방 | `content/clubroom.md` |
| 개인정보 처리방침 | `content/privacy.md` |
| 이용약관 | `content/terms.md` |
| 동의서·촬영·CCTV | `content/consent.md`, `content/media.md`, `content/cctv.md` |

GitHub에서 해당 파일의 연필 버튼을 눌러 수정하고 `main`에 커밋하거나 PR을 병합하면 `Next.js Markdown Pages` 워크플로가 검사 → 빌드 → 배포합니다. 별도 HTML/JSX 수정은 필요 없습니다. 단순히 로컬 파일을 저장한 것만으로 공개 사이트가 바뀌지는 않으며, 자동 배포가 성공해야 합니다. 실패한 빌드는 공개하지 않습니다. 열린 브라우저 탭은 새로고침해 확인합니다.

```yaml
---
title: 개인정보 처리방침
description: 개인정보의 처리 목적, 항목, 기간 및 권리 행사 기준.
status: 첨부 원문 기반
version: 'v1.1'
effective_date: '2026-09-01'
group: 정책
order: 6
source_type: source
---

## 제1조 처리 목적

이곳의 Markdown 본문을 수정합니다.
```

`effective_date`는 법적·운영적 시행일이며 빌드할 때 자동으로 바뀌지 않습니다. 수정이 실제 개정인 경우 필요한 의결·고지 절차와 버전 갱신을 별도로 확인하세요. `status`는 문서 확정 상태이며 Markdown 게시 자체가 승인·동의를 대신하지 않습니다. 비어 있던 담당자 연락처, 보충 작성안, 비교용 원문의 내용은 임의 확정하지 않았습니다.

새 문서는 `content/new-document.md`로 추가하면 `/new-document/`가 생성됩니다. 중첩 경로도 지원합니다. 필수 메타데이터는 `title`, `description`, `status`, `version`입니다. `group`·`order`·`effective_date`·`source_type`·`hidden`은 선택 항목입니다. `hidden: true`는 목록에서만 감추며 접근 제한이 아닙니다. 모든 문서·다운로드·Git 이력은 공개됩니다.

## 최초 전환

기존 Jekyll 원본은 보존합니다. `scripts/migrate.py`가 기존 원문을 한 번만 `content/`로 옮기며, HTML 조문은 Markdown으로 변환하고 가시 텍스트의 문자·숫자 순서를 비교합니다. 기존 원문 대비 이미 지정한 시행일(2026-09-01)만 반영합니다. Jekyll 링크 문법도 일반 링크로 바꿉니다.

`content/.migration.json`이 만들어진 뒤에는 변환을 재실행하지 않으며, 편집한 Markdown을 덮어쓰지 않습니다. 첫 성공 빌드에서 변환된 Markdown과 `package-lock.json`을 같은 브랜치에 저장합니다. 이후 설치는 `npm ci`로 잠금 파일을 사용합니다. 자동 커밋은 검증한 문서와 잠금 파일만 포함하며, 빌드 중 다른 커밋이 들어오면 덮어쓰지 않고 중단합니다.

이전 `_includes/`, `_layouts/`, `_config.yml`, 루트의 문서 디렉터리는 전환 전 자료입니다. Next.js는 `content/`만 읽으므로 이전 파일을 편집해도 새 사이트는 바뀌지 않습니다. 이전 자료는 전환 확인 후 Git 이력을 이용해 정리할 수 있습니다.

## 실행·검증

Node.js 22 이상을 사용합니다. 아직 초기 변환이 되지 않은 체크아웃에는 Python 3도 필요합니다. 변환 완료 후에는 Python을 사용하지 않습니다.

```sh
npm install
npm run dev
npm test
npm run build
npm run verify:export
```

`out/`가 배포 결과물입니다. `next start`는 정적 내보내기 모드에서 사용하지 않습니다. 문서 내용은 JavaScript를 꺼도 읽을 수 있으며, 검색·테마·주소 복사 등의 부가 기능에만 브라우저 JavaScript를 사용합니다. Markdown 내 임의 JavaScript/MDX를 실행하지 않고 HTML 허용 목록으로 정화합니다.

## GitHub Pages

저장소 **Settings → Pages → Build and deployment → Source: GitHub Actions**를 사용합니다. 기존 사용자 지정 도메인은 그대로 유지합니다. Pages 설정 변경은 `.yml` 추가나 `CNAME` 파일만으로 보장되지 않으므로 워크플로 실행 결과를 확인하세요.

- `main` 커밋: 검사·빌드·배포
- PR 및 `migrate-nextjs-markdown` 브랜치: 검사·빌드, 운영 배포 없음
- Actions → Next.js Markdown Pages → Run workflow: 수동 재배포
- `version.json`: 실제 배포의 커밋, 문서별 해시, 빌드 시각
- `/downloads/*.md`: 배포에 사용한 Markdown

배포 시 HTML·Markdown 원본·문서 해시가 서로 일치하는지 검사합니다. 기존 `.html` 주소는 쿼리·문서 위치를 보존하여 새 주소로 이동합니다. 정적 호스팅이므로 서버 재검증(ISR), 로그인·제출 API, 파일 저장 API는 제공하지 않습니다.

## 보안·개인정보

이 저장소에 회원 명단, 서명된 동의서, CCTV 영상, 계좌 내역, 비밀번호를 저장하지 않습니다. 여기의 동의서는 공개 서식이며 접수 기능이 아닙니다. 화면의 `noindex`와 목록 숨김은 비밀 보장·접근 제어가 아닙니다. 법적 문언은 이번 프레임워크 전환에서 새로 해석·개정하지 않았습니다.
