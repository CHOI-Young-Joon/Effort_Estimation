# Effort Estimation

DB 공수 산정을 위한 정적 웹 애플리케이션입니다.

챗봇 방식으로 산정 조건을 입력받고, 입력값을 기준으로 다음 산출물을 생성합니다.

```text
공수 항목
WBS 초안
메일 첨부용 문구
WBS 엑셀 파일
```

## 실행

웹 서버에 `effort-estimation` 폴더를 그대로 올린 뒤 아래 주소로 접속합니다.

```text
/effort-estimation/
```

또는 로컬 브라우저에서 직접 실행할 수 있습니다.

```text
effort-estimation/index.html
```

필수 실행 파일은 다음과 같습니다.

```text
effort-estimation/index.html
effort-estimation/app.js
effort-estimation/styles.css
effort-estimation/RockPlace_CI_transparent.png
```

외부 API, CDN, 서버 호출이 없으므로 인터넷이 차단된 환경에서도 사용할 수 있습니다.

## 폴더 구조

```text
.
├─ effort-estimation/   # 실제 실행되는 정적 웹 앱
└─ back_data/           # 개발/산정 기준 참고 자료
```

## 주요 기능

```text
챗봇 입력
입력 요약 확인 및 특정 항목 재수정
공수 항목 수정
WBS 초안 수정
메일 문구 수정
메일 문구 복사
WBS 엑셀 저장
신규 공수 산정 초기화
```

## 지원 작업 구분

```text
신규 구성
메이저 업그레이드
대개체
이기종 마이그레이션
```

## 상세 문서

입력 흐름, 공수 산정 로직, 이기종 마이그레이션 계산 기준, WBS/메일/엑셀 생성 로직은 아래 문서에 정리되어 있습니다.

[effort-estimation/README.md](./effort-estimation/README.md)

## 롤백 기준

현재 UI/워크플로우 기준 커밋:

```text
eb03d0503a54bacb24045515dc798cc589b79ae4
```

최신 문서/참고자료 정리 커밋:

```text
9f81e852a75e42aa7da0c43a2b508484d3bc614d
```
