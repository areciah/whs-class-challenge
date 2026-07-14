# WHS Homepage

화이트햇 스쿨 홈페이지 정적 프론트엔드입니다.

메인 페이지와 로그인 화면을 중심으로 구성되어 있으며, 로컬 정적 서버에서 화면과 기본 인터랙션을 확인할 수 있습니다.

## Quick Start

```bash
npm install
npm start
```

기본 주소:

```text
http://localhost:4177
```

검증:

```bash
npm run check
```

## 로컬 QA 계정
### **해당 내용은 인터넷 업로드 시 필수적으로 제거해야 됩니다.**
로컬 정적 화면 확인용 테스트 계정입니다. `config/local.settings.json`을 읽어서 브라우저에서만 로그인 상태를 확인합니다.

## Project Layout

```text
.
├── assets/
├── config/
│   └── local.settings.json
├── css/
│   └── site.css
├── docs/
│   └── SETUP.md
├── js/
│   └── app.js
├── scripts/
│   └── check-files.js
├── index.html
├── login.html
├── package.json
└── server.js
```

## Features

- 메인 페이지 헤더 동작
- 모바일 메뉴
- 유관사이트 드롭다운
- 검색 패널
- 글자 크기 조절
- localStorage 기반 로그인/로그아웃 상태
- `config/local.settings.json` 기반 로컬 QA 로그인

## Notes

- API 서버나 DB 쓰기는 포함하지 않습니다.
- 실제 배포 전에는 로컬 설정 파일을 분리해서 관리해야 합니다.

