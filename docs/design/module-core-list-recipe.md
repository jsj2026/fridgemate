# [모듈 설계] 공통 기반·목록·상태·레시피 모듈

- 담당: 이정남
- 역할: 모든 모듈이 쓰는 메시지 버스와 공통 저장소를 만들고, 식재료 목록 표시와 소비기한 상태 판정, 레시피 추천을 맡는다. 마지막에 모듈을 통합·배포한다.
- 메시지 형식과 데이터 형식은 [인터페이스 정의서](../architecture/interface-definition.md)를 따른다.

## 1. 계층 위치

| 영역·계층 | 이 모듈이 맡는 부분 |
| --- | --- |
| 외부 시설 | 브라우저 IndexedDB, Service Worker, 테스트용 샘플 데이터 |
| L2–L3 메시지·저장 | 메시지 버스(bus), 공통 저장소(store) |
| L4–L5 AI·분석 | 레시피 추천(recipe) |
| L6 업무·알림 | 상태 판정(status): 정상·임박·만료 |
| L7 화면 | 홈·식재료 목록(list), 레시피 추천 화면, 공통 화면 틀 |
| 공통 기반 | 오류 로그, GitHub PR 관리, 통합·배포 |

## 2. 담당 요구사항

| 요구사항 ID | 내용 |
| --- | --- |
| FR-ING-02 | 소비기한 임박 순 목록 |
| FR-ING-03 | 보관 위치·카테고리 필터 |
| FR-ING-04 | 이름 검색 |
| FR-ING-07 | 정상·임박·만료 색상 표시 |
| FR-RCP-01 | 보유 식재료 기반 레시피 추천 |
| FR-RCP-02 | 임박 식재료 우선 추천 |
| FR-RCP-03 | 보유·부족 재료 구분 표시 |
| NFR-PER-01 | 목록 100건 2초 이내 표시 |

## 3. 받는 메시지

| 보내는 쪽 | 메시지 종류 | 받는 모듈 | 내용 |
| --- | --- | --- | --- |
| 모든 모듈 | (모든 메시지) | bus | 6칸 검사 후 전달 |
| register | INGREDIENT_ADD_REQUESTED / INGREDIENT_UPDATE_REQUESTED | store | 식재료 저장 |
| process | INGREDIENT_STATUS_UPDATE_REQUESTED | store | 상태 변경 |
| list, status, recipe | INGREDIENTS_QUERY | store | 목록 조회 |
| settings, status | SETTINGS_QUERY | store | 설정 조회 |
| settings | SETTINGS_CHANGED | store, status | 설정 저장, 다시 판정 |
| backup | EXPORT_REQUESTED / IMPORT_REQUESTED | store | 백업·복원 |
| store | INGREDIENTS_CHANGED | list, status, recipe | 다시 조회 |
| status | STATUS_UPDATED | list, recipe | 상태 표시, 추천 갱신 |

## 4. 보내는 메시지

| 보내는 모듈 | 메시지 종류 | 받는 쪽 | 내용 |
| --- | --- | --- | --- |
| store | INGREDIENT_SAVED / INGREDIENT_SAVE_FAILED | register | 저장 결과 |
| store | INGREDIENTS_LIST / SETTINGS_LOADED | 요청한 모듈 | 조회 결과 |
| store | INGREDIENTS_CHANGED | list, status, recipe | 식재료 변경 알림 |
| store | EXPORT_DATA / IMPORT_DONE / IMPORT_FAILED | backup | 백업·복원 결과 |
| status | STATUS_UPDATED | list, recipe | 식재료별 남은 일수·상태 |
| status | EXPIRY_ALERT_LIST | notify | 임박·만료 목록 |
| list | CONSUME_REQUESTED / DISCARD_REQUESTED | process | 소비·폐기 요청 |
| list | INGREDIENT_EDIT_REQUESTED | register | 수정 화면 열기 |

## 5. 화면 구성

| 화면 | 주요 요소 |
| --- | --- |
| 홈·식재료 목록 | 임박 순 카드 목록(이름, 남은 일수, 상태 색), 보관 위치 탭(전체·냉장·냉동·실온), 검색창, [+ 등록] 버튼, 카드별 [소비] [폐기] [수정] |
| 레시피 추천 | 추천 레시피 목록(임박 재료 사용 표시), 보유·부족 재료 구분 |
| 공통 화면 틀 | 하단 메뉴(홈, 레시피, 설정), 알림 배너 자리 |

## 6. 외부 연계

| 대상 | 용도 |
| --- | --- |
| IndexedDB | 식재료·설정 저장 |
| Service Worker | 오프라인 실행 (PWA) |
| 레시피 데이터 | 앱 내장 JSON (R1) |
| 테스트 데이터 | 샘플 식재료 JSON (정상·임박·만료 섞어서) |
