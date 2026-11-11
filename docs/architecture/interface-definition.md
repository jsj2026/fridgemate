# 인터페이스 정의서 (ICD)

| 항목 | 내용 |
| --- | --- |
| 버전 | v0.1 (작성 중) |
| 작성 | 이정남 |
| 관련 문서 | [체계 구성도](system-configuration.md), 모듈 설계서 3종 (docs/design/) |

FridgeMate의 모든 모듈은 서로 직접 호출하지 않고, **표준 메시지**를 공통 메시지 버스로 보내 정보를 주고받는다. 데이터 저장과 조회는 반드시 저장소(store)에 메시지로 요청한다.

## 1. 표준 메시지 형식

모든 메시지는 아래 6개 칸을 가진다. 수업 시간 칠판 그림의 메시지 프레임(발신 주소, 수신 주소, 메시지 종류, 날짜, 데이터 형식, 정보)을 응용 계층에 그대로 적용한 것이다. 물리 계층과 시작·끝 표시는 브라우저와 JavaScript가 처리한다.

| 칸 | 칠판 그림 | 설명 | 예시 |
| --- | --- | --- | --- |
| from | 발신 주소 | 보내는 모듈 ID (2장) | register |
| to | 수신 주소 | 받는 모듈 ID, 여럿이면 배열 | store |
| type | 메시지 종류 | 메시지 종류 (3장) | INGREDIENT_ADD_REQUESTED |
| timestamp | 날짜 | 메시지 생성 시각, ISO 8601, KST | 2026-11-02T09:00:00+09:00 |
| format | 데이터 형식 | payload의 형식 이름과 버전 (4장) | ingredient.v1 |
| payload | 정보 | 실제 데이터 | { … } |

```json
{
  "from": "register",
  "to": "store",
  "type": "INGREDIENT_ADD_REQUESTED",
  "timestamp": "2026-11-02T09:00:00+09:00",
  "format": "ingredient.v1",
  "payload": { "name": "우유", "category": "유제품", "quantity": 1, "unit": "개",
               "location": "냉장", "purchaseDate": "2026-11-02", "expiryDate": "2026-11-09",
               "barcode": "8801234567890" }
}
```

### 공통 규칙

1. 메시지 버스는 6개 칸이 모두 있는지 검사하고, 빠진 메시지는 전달하지 않고 오류 로그를 남긴다.
2. payload가 없는 요청은 `"format": "none"`, `"payload": {}`로 보낸다.
3. 요청에 대한 응답은 요청을 보낸 모듈을 `to`로 지정해 보낸다.
4. 형식을 바꿀 때는 버전을 올리고(v1 → v2) 이 문서를 먼저 고친다 (Interface Change Request).

## 2. 모듈 ID

| 모듈 ID | 모듈 | 계층 | 담당 |
| --- | --- | --- | --- |
| bus | 메시지 버스 | L2–L3 | 이정남 |
| store | 공통 저장소 (IndexedDB) | L2–L3 | 이정남 |
| register | 등록 (바코드·직접 입력) | L0–L1, L7 | 이석환 |
| ocr | 소비기한 OCR | L4–L5 | 이석환 |
| list | 목록·상태 표시 | L7 | 이정남 |
| status | 상태 판정 (정상·임박·만료) | L6 | 이정남 |
| recipe | 레시피 추천 | L4–L5, L7 | 이정남 |
| process | 소비·폐기 처리 | L6 | 이지선 |
| notify | 알림 | L6 | 이지선 |
| settings | 설정 | L6, L7 | 이지선 |
| backup | 백업·복원 | L2–L3 | 이지선 |

## 3. 메시지 종류

### 3.1 식재료 등록·수정

| type | from → to | format | 설명 |
| --- | --- | --- | --- |
| INGREDIENT_ADD_REQUESTED | register → store | ingredient.v1 | 새 식재료 저장 요청 (id 없이 보냄) |
| INGREDIENT_UPDATE_REQUESTED | register → store | ingredient.v1 | 수정한 식재료 저장 요청 |
| INGREDIENT_SAVED | store → register | ingredient.v1 | 저장 성공 (id 포함) |
| INGREDIENT_SAVE_FAILED | store → register | error.v1 | 저장 실패 |
| INGREDIENT_EDIT_REQUESTED | list → register | ingredient-id.v1 | 수정 화면 열기 |
| OCR_RESULT | ocr → register | ocr-result.v1 | 소비기한 인식 결과 (사용자 확인 전) |

### 3.2 조회·변경 알림

| type | from → to | format | 설명 |
| --- | --- | --- | --- |
| INGREDIENTS_QUERY | list, status, recipe → store | none | 보관 중 식재료 목록 요청 |
| INGREDIENTS_LIST | store → 요청한 모듈 | ingredient-list.v1 | 보관 중 식재료 목록 |
| INGREDIENTS_CHANGED | store → list, status, recipe | none | 식재료가 추가·수정·처리됨. 받은 모듈은 다시 조회 |
| STATUS_UPDATED | status → list, recipe | status-list.v1 | 식재료별 남은 일수와 상태 |

### 3.3 처리·알림·설정

| type | from → to | format | 설명 |
| --- | --- | --- | --- |
| CONSUME_REQUESTED | list → process | ingredient-id.v1 | 소비 완료 처리 요청 |
| DISCARD_REQUESTED | list → process | ingredient-id.v1 | 폐기 처리 요청 |
| INGREDIENT_STATUS_UPDATE_REQUESTED | process → store | status-change.v1 | 상태를 소비·폐기로 변경 (삭제하지 않음) |
| EXPIRY_ALERT_LIST | status → notify | alert-list.v1 | 임박·만료 식재료 목록 |
| SETTINGS_QUERY | settings, status → store | none | 설정값 요청 |
| SETTINGS_LOADED | store → 요청한 모듈 | settings.v1 | 저장된 설정값 |
| SETTINGS_CHANGED | settings → store, status, notify | settings.v1 | 설정 변경. status는 새 기준일로 다시 판정 |

### 3.4 백업·복원

| type | from → to | format | 설명 |
| --- | --- | --- | --- |
| EXPORT_REQUESTED | backup → store | none | 전체 데이터 요청 |
| EXPORT_DATA | store → backup | backup.v1 | 전체 데이터 |
| IMPORT_REQUESTED | backup → store | backup.v1 | 백업 데이터로 복원 요청 |
| IMPORT_DONE | store → backup | result.v1 | 복원 성공 |
| IMPORT_FAILED | store → backup | error.v1 | 복원 실패 (기존 데이터 유지) |

## 4. 데이터 형식

### ingredient.v1 (식재료)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| id | 문자열 | 저장 후 | store가 생성 |
| name | 문자열 | O | 1~30자 |
| category | 문자열 | | 채소, 과일, 육류, 수산, 유제품, 가공식품, 음료, 기타 |
| quantity | 숫자 | O | 0보다 큼 |
| unit | 문자열 | O | 개, g, ml, 팩 등 |
| location | 문자열 | O | 냉장, 냉동, 실온 |
| purchaseDate | 날짜 | | YYYY-MM-DD, 기본값 오늘 |
| expiryDate | 날짜 | O | YYYY-MM-DD |
| barcode | 문자열 | | 바코드 번호 |
| status | 문자열 | 저장 후 | 보관, 소비, 폐기 (등록 시 보관) |
| createdAt | 일시 | 저장 후 | store가 기록 |

### 그 밖의 형식

| 형식 | 내용 |
| --- | --- |
| ingredient-id.v1 | `{ "id": "a1b2" }` |
| ingredient-list.v1 | `{ "items": [ingredient.v1, …] }` |
| ocr-result.v1 | `{ "expiryDate": "2026-11-09", "rawText": "2026.11.09까지", "confidence": 0.87 }` (인식 실패 시 expiryDate는 null) |
| status-list.v1 | `{ "date": "2026-11-02", "items": [ { "id": "a1b2", "daysLeft": 2, "state": "임박" } ] }` |
| alert-list.v1 | `{ "date": "2026-11-02", "items": [ { "id": "a1b2", "name": "우유", "daysLeft": 2, "state": "임박" } ] }` |
| status-change.v1 | `{ "id": "a1b2", "status": "폐기", "changedAt": "2026-11-02T19:00:00+09:00" }` |
| settings.v1 | `{ "alertEnabled": true, "alertDays": 3, "alertTime": "09:00" }` |
| backup.v1 | `{ "format": "fridgemate-backup.v1", "exportedAt": "…", "ingredients": [ … ], "settings": { … } }` |
| result.v1 | `{ "ok": true, "message": "복원 완료" }` |
| error.v1 | `{ "code": "VALIDATION", "message": "소비기한을 입력해 주세요" }` |

## 5. 상태 판정 규칙 (status 모듈)

남은 일수 = 소비기한 − 오늘 (일 단위). 상태가 '보관'인 식재료만 판정한다.

| 상태 | 조건 | 화면 색 |
| --- | --- | --- |
| 정상 | 남은 일수 > 알림 기준일 | 초록 |
| 임박 | 0 ≤ 남은 일수 ≤ 알림 기준일 | 주황 |
| 만료 | 남은 일수 < 0 | 빨강 |

## 6. 대표 흐름: 식재료 1건이 앱 안에서 흐르는 경로

1. register → store: INGREDIENT_ADD_REQUESTED
2. store → register: INGREDIENT_SAVED / store → list, status, recipe: INGREDIENTS_CHANGED
3. status → store: INGREDIENTS_QUERY, SETTINGS_QUERY → 판정 후 status → list, recipe: STATUS_UPDATED
4. status → notify: EXPIRY_ALERT_LIST → notify가 하루 1회 알림 표시
5. 사용자가 목록에서 폐기 → list → process: DISCARD_REQUESTED → process → store: INGREDIENT_STATUS_UPDATE_REQUESTED → 다시 2번부터
