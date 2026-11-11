# Requirement Register (요구사항 관리)

| 항목 | 내용 |
| --- | --- |
| 버전 | v0.1 |
| 관리 | 이정남 (각자 PR 올릴 때 본인 담당 줄의 상태를 고친다) |
| 기준 문서 | 요구사항명세서 v1.0 (10/23 제출본) |

※ 요구사항 ID는 요구사항명세서 제출본과 같아야 한다. 번호가 다르면 이 표를 제출본 기준으로 고친다. (FR-BAK는 임시 번호)

상태: 정의 → 설계 → 구현 → 시험 → 완료 / R2(후속 범위)

| ID | 요구사항 | 우선순위 | 릴리스 | 할당 계층·모듈 | 담당 | 설계 문서 | 검증 방법 | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FR-ING-01 | 식재료 직접 입력 등록 | M | R1 | L0–L1 register | 이석환 | module-register-ocr | 시연 | 설계 |
| FR-ING-02 | 임박 순 목록 | M | R1 | L7 list | 이정남 | module-core-list-recipe | 시연 | 설계 |
| FR-ING-03 | 보관 위치·카테고리 필터 | M | R1 | L7 list | 이정남 | module-core-list-recipe | 시연 | 설계 |
| FR-ING-04 | 이름 검색 | S | R1 | L7 list | 이정남 | module-core-list-recipe | 시연 | 설계 |
| FR-ING-05 | 식재료 정보 수정 | M | R1 | L0–L1 register | 이석환 | module-register-ocr | 시연 | 설계 |
| FR-ING-06 | 소비 완료·폐기 처리 | M | R1 | L6 process | 이지선 | module-notify-backup | 시연 | 설계 |
| FR-ING-07 | 정상·임박·만료 색상 표시 | M | R1 | L6 status, L7 list | 이정남 | module-core-list-recipe | 단위 시험 | 설계 |
| FR-SCN-01 | 바코드 스캔 | S | R1 | L0–L1 register | 이석환 | module-register-ocr | 시연 | 설계 |
| FR-SCN-02 | 바코드 상품정보 자동 입력 | S | R1 | L0–L1 register | 이석환 | module-register-ocr | 시연 | 설계 |
| FR-SCN-03 | 소비기한 OCR 자동 입력 | C | R1 | L4–L5 ocr | 이석환 | module-register-ocr | 샘플 사진 시험 | 설계 |
| FR-SCN-04 | 인식 실패 시 직접 입력 전환 | S | R1 | L0–L1 register | 이석환 | module-register-ocr | 시연 | 설계 |
| FR-SCN-05 | 자동 입력값 확인·수정 | S | R1 | L0–L1 register | 이석환 | module-register-ocr | 시연 | 설계 |
| FR-NTF-01 | 임박 알림 | M | R1 | L6 notify | 이지선 | module-notify-backup | 시연 | 설계 |
| FR-NTF-02 | 알림 기준일·시각 설정 | S | R1 | L6 settings | 이지선 | module-notify-backup | 시연 | 설계 |
| FR-NTF-03 | 하루 1회 묶음 알림 | S | R1 | L6 notify | 이지선 | module-notify-backup | 단위 시험 | 설계 |
| FR-NTF-04 | 알림 켜기·끄기 | M | R1 | L6 settings | 이지선 | module-notify-backup | 시연 | 설계 |
| FR-BAK-01 | 전체 데이터 백업 | S | R1 | L2–L3 backup | 이지선 | module-notify-backup | 시연 | 설계 |
| FR-BAK-02 | 백업 파일로 복원 | S | R1 | L2–L3 backup | 이지선 | module-notify-backup | 시연 | 설계 |
| FR-RCP-01 | 보유 재료 기반 레시피 추천 | S | R1 | L4–L5 recipe | 이정남 | module-core-list-recipe | 시연 | 설계 |
| FR-RCP-02 | 임박 재료 우선 추천 | S | R1 | L4–L5 recipe | 이정남 | module-core-list-recipe | 단위 시험 | 설계 |
| FR-RCP-03 | 보유·부족 재료 구분 | C | R1 | L7 recipe | 이정남 | module-core-list-recipe | 시연 | 설계 |
| FR-ACC-01 | 회원가입·로그인 | - | R2 | - | - | - | - | R2 |
| FR-ACC-02 | 가족 냉장고 공유 | - | R2 | - | - | - | - | R2 |
| FR-NTF-05 | 웹 푸시 알림 (앱 꺼짐 상태) | - | R2 | - | - | - | - | R2 |
| NFR-PER-01 | 목록 100건 2초 이내 | M | R1 | L2–L3 store, L7 list | 이정남 | module-core-list-recipe | 측정 | 설계 |
| NFR-PER-02 | 바코드 자동 입력 3초 이내 | S | R1 | L0–L1 register | 이석환 | module-register-ocr | 측정 | 설계 |
| NFR-USA-01 | 직접 등록 3단계 이내 | M | R1 | L7 등록 화면 | 이석환 | module-register-ocr | 시연 | 설계 |
| NFR-REL-02 | 외부 장애 시 수동 입력 유지 | M | R1 | L0–L1 register | 이석환 | module-register-ocr | 시험 | 설계 |
| NFR-MNT-01 | 기능별 브랜치·PR 관리 | M | R1 | 공통 기반 | 이정남 | - | GitHub 기록 | 진행 중 |
