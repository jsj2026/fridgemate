# FridgeMate 프로젝트 추진계획서 (Agile 방식)

> 관련 Issue: [Issue #1] 프로젝트 추진계획 수립
> 작성일: 2026-10-02 · 버전: v0.1 (초안) · 작성: FridgeMate 팀
> 역할은 2026-10-02 팀 협의로 확정하였으며, 일정은 학사 일정에 따라 조정할 수 있다.

## 1. Issue 기본정보

| 항목 | 설정값 |
|---|---|
| Issue 번호 | `[Issue #1]` (GitHub 번호는 등록 순서에 따름) |
| Issue 유형 | Agile 프로젝트 계획 / Product Planning |
| 적용 방법 | Scrum 기반의 반복·점진적 수행 |
| Sprint 주기 | 1주 (수업일 기준) |
| 전체 수행기간 | 5주, 총 5개 Sprint |
| Assignee | 이정남 (팀장, Scrum Master) |
| Reviewer | 이지선 |
| Labels | `planning`, `agile`, `documentation` |
| Project | `FridgeMate OSS Project` |
| Milestone | Sprint 1 |
| Relationships | 선행 Issue 없음, Issue #2의 선행 Issue |
| 작업 Branch | `planning/project-plan` |
| PR 대상 Branch | `main` |
| 산출물 파일 | `docs/project-management/project-plan.md` |

## 2. Agile 추진원칙

1. 작업은 사용자 가치가 드러나는 작은 단위(User Story, Issue)로 나눈다.
2. Product Owner(교수자)와 팀장이 우선순위를 정하고, Sprint 중에는 Sprint 목표를 유지한다.
3. 각 Sprint 종료 시 산출물을 Review하고, 피드백을 다음 Sprint Backlog에 반영한다.
4. OSS는 문서 조사만으로 결정하지 않고, 가능한 경우 간단한 기능 확인 결과를 반영한다.
5. 라이선스·보안 검토는 마지막 Sprint에 몰지 않고 모든 Sprint의 DoD에 포함한다.
6. GitHub Issue, Projects, Branch, Pull Request, Review 기록을 프로젝트 관리의 공식 근거로 사용한다.

## 3. Product Vision과 Product Goal

**Product Vision**
> 냉장고 속 식재료를 잊지 않고 제때 먹도록 도와, 버려지는 음식을 줄이는 가장 간편한 식재료 관리 서비스

**Product Goal (5주)**
> 식재료 등록·보관 관리·유통기한 알림·레시피 추천 기능에 적합한 OSS를 조사·평가·선정하고, 이를 통합한 FridgeMate의 아키텍처와 적용방안을 완성한다.

## 4. User Class

| User Class | 특성 | 주요 사용 기능 |
|---|---|---|
| 1인 가구 사용자 | 장보기를 몰아서 하고 냉장고 관리가 소홀함 | 바코드 등록, 유통기한 알림 |
| 가족 공유 사용자 | 한 냉장고를 여러 명이 사용 | 냉장고 공유, 소비/폐기 기록 |
| 요리 관심 사용자 | 남은 재료 활용에 관심 | 레시피 추천 |
| 서비스 관리자 | 데이터·OSS 운영 관리 | 상품 데이터 관리, 장애 대응 |

> User Class는 Issue #3(CONOPS)에서 상세화한다.

## 5. MVP 범위

이번 5주 동안 설계·OSS 선정 대상으로 삼는 최소 기능 범위는 다음과 같다.

| 우선순위 | 기능 | MVP 포함 |
|---|---|---|
| Must | 회원가입·로그인 | ○ |
| Must | 식재료 직접 등록·수정·삭제 | ○ |
| Must | 바코드 스캔 등록 | ○ |
| Must | 보관 위치별 목록과 유통기한 표시 | ○ |
| Must | 유통기한 임박 알림 | ○ |
| Should | 가족 단위 냉장고 공유 | ○ |
| Should | 보유 재료 기반 레시피 추천 | ○ |
| Could | 소비/폐기 통계 | △ (시간 여유 시) |
| Won't | 영수증 OCR, IoT 냉장고 연동 | × (후속 과제) |

## 6. Scrum Team 구성 및 역할 분담

| 이름 | 팀 역할 | Scrum 역할 | 주요 책임 | 담당 Issue |
|---|---|---|---|---|
| 교수자 | - | Product Owner | 실습 목표 제시, 과제 범위 승인, 결과 검토 | - |
| 이정남 | 팀장 | Scrum Master, Developer | Sprint 운영·일정 관리, GitHub Repository 관리, PR Merge, 기능 개발 | #1, #6, #9 |
| 이석환 | 개발자 | Developer | 산출물 작성, OSS 조사, 기능 개발 | #2, #4, #7 |
| 이지선 | Reviewer | Developer | 전체 PR 검토(정확성·객관성·일관성), 산출물 작성 | #3, #5, #8 |
| 전원 | - | - | 최종보고서·Sprint Review·회고 | #10 |

- **Repository 관리:** 팀장이 Branch 규칙 관리, PR Merge, 작업 Branch 정리를 맡는다.
- **Review:** 이지선이 주 Reviewer로 모든 PR을 검토한다. 이지선이 작성한 PR은 팀장이 검토한다.

| PR 작성자 | 지정 Reviewer |
|---|---|
| 이정남 | 이지선 |
| 이석환 | 이지선 |
| 이지선 | 이정남 |

- **발표:** 교수자 안내에 따라 팀원이 돌아가며 발표한다. 순서는 Sprint Planning에서 정한다.

## 7. 초기 Product Backlog

| ID | Backlog Item | 관련 Issue | 우선순위 | Story Point | Sprint |
|---|---|---|---|---|---|
| PBI-01 | 프로젝트 추진계획 수립 | #1 | Must | 3 | S1 |
| PBI-02 | 프로젝트 배경·문제·목표·범위 정의 | #2 | Must | 3 | S1 |
| PBI-03 | GitHub 협업환경 구성 (Projects, Label, Milestone) | #1 | Must | 2 | S1 |
| PBI-04 | User Class와 운용 시나리오 정의 | #3 | Must | 5 | S2 |
| PBI-05 | 기능 요구사항 정의 | #4 | Must | 5 | S2 |
| PBI-06 | 비기능·데이터·인터페이스 요구사항 정의 | #5 | Must | 5 | S2 |
| PBI-07 | 논리·물리 아키텍처 설계 | #6 | Must | 5 | S3 |
| PBI-08 | 계층별 OSS Long List 작성 | #7 | Must | 5 | S3 |
| PBI-09 | OSS 평가기준·가중치 설정 | #8 | Must | 3 | S4 |
| PBI-10 | OSS 후보 상세평가 | #8 | Must | 5 | S4 |
| PBI-11 | 최종 OSS 선정 및 통합 적용방안 | #9 | Must | 5 | S4 |
| PBI-12 | 최종보고서·발표자료·회고 | #10 | Must | 5 | S5 |

**OSS 조사 대상 계층 (예비)**

| 계층 | 필요 기능 | 후보 예시 (3주차에 조사) |
|---|---|---|
| 화면(Frontend) | PWA 화면, 오프라인 지원 | React, Vue, Workbox |
| 바코드 인식 | 카메라로 바코드 읽기 | ZXing, html5-qrcode, QuaggaJS |
| 상품 정보 | 바코드 → 상품명 조회 | Open Food Facts |
| 백엔드·DB | 데이터 저장, 인증, API | Supabase, PocketBase, PostgreSQL |
| 알림 | 유통기한 푸시 알림 | Web Push, ntfy |
| 배포 | 빌드·배포 자동화 | Docker, GitHub Actions |

## 8. 대표 User Story와 Acceptance Criteria

| ID | User Story | Acceptance Criteria |
|---|---|---|
| US-01 | 1인 가구 사용자로서, 바코드를 찍어 식재료를 등록하고 싶다. 그래야 일일이 입력하지 않아도 된다. | 바코드 인식 후 상품명이 자동 입력되고, 10초 이내에 등록이 끝난다. |
| US-02 | 사용자로서, 유통기한 3일 전에 알림을 받고 싶다. 그래야 버리기 전에 먹을 수 있다. | D-3, D-1, 당일에 푸시 알림이 발송된다. |
| US-03 | 가족 공유 사용자로서, 가족이 등록한 식재료도 보고 싶다. 그래야 같은 재료를 또 사지 않는다. | 같은 냉장고 그룹의 구성원 모두에게 같은 목록이 보인다. |
| US-04 | 요리 관심 사용자로서, 임박한 재료로 만들 수 있는 요리를 추천받고 싶다. | 임박 재료가 포함된 레시피가 우선 표시된다. |

## 9. Sprint 계획

Sprint는 수업일(목요일)에 시작하여 1주 단위로 운영한다. (날짜는 학사 일정에 따라 조정)

| Sprint | 기간 (안) | Sprint 목표 | 관련 Issue | 주요 산출물 |
|---|---|---|---|---|
| Sprint 1 | 10/08 ~ 10/14 | 협업체계 구축 및 프로젝트 정의 | #1, #2 | 추진계획서, 프로젝트 정의서, Issue 목록 |
| Sprint 2 | 10/15 ~ 10/21 | 운용개념 및 요구사항 정의 | #3, #4, #5 | CONOPS, 운용 시나리오, 통합 요구사항 명세서 |
| Sprint 3 | 10/22 ~ 10/28 | 아키텍처 설계 및 OSS 후보 발굴 | #6, #7 | 아키텍처 설계서, OSS Long List |
| Sprint 4 | 10/29 ~ 11/04 | OSS 평가·선정 및 적용방안 수립 | #8, #9 | 평가기준서, 상세평가표, 최종선정서 |
| Sprint 5 | 11/05 ~ 11/11 | 결과 통합, Review 및 회고 | #10 | 최종보고서, 발표자료, 회고 결과서 |

**Milestone:** GitHub Milestone을 Sprint 1~5로 생성하고 각 Issue를 해당 Milestone에 연결한다.

**Issue 선후행 관계**
```
#1 ──> #2 ──> #3 ──┬──> #4 ──┬──> #6 ──> #7 ──> #8 ──> #9 ──> #10
                   └──> #5 ──┘
```
- #4(기능 요구사항)와 #5(비기능·인터페이스 요구사항)는 병행 수행한다.
- #6(아키텍처 설계)은 #4와 #5가 모두 끝난 뒤 시작한다.

## 10. Scrum 이벤트

| 이벤트 | 시기 | 방식 | 내용 |
|---|---|---|---|
| Sprint Planning | 매주 수업 시간 | 대면 | Sprint 목표 확인, Issue 담당자 지정, Sprint Backlog 확정 |
| Daily Scrum | 매일 22시 (안) | 단톡방 | 어제 한 일, 오늘 할 일, 막힌 점 공유 (3줄) |
| Sprint Review | 다음 주 수업 시간 | 대면 | 산출물 시연·검토, PR Merge 여부 확인 |
| Sprint Retrospective | Sprint Review 직후 | 대면 | Keep / Problem / Try 방식으로 개선사항 도출 |

## 11. Definition of Ready (DoR)

Issue는 아래 조건을 만족해야 In Progress로 옮길 수 있다.

- [ ] 목적과 수행 내용이 Issue 본문에 작성되어 있다.
- [ ] 담당자(Assignee)가 지정되어 있다.
- [ ] Label과 Milestone이 지정되어 있다.
- [ ] 완료 조건(Acceptance Criteria)이 작성되어 있다.
- [ ] 선행 Issue가 완료되었거나 병행 가능함이 확인되었다.

## 12. Definition of Done (DoD)

Issue는 아래 조건을 모두 만족해야 Done으로 옮길 수 있다.

- [ ] 산출물이 지정된 폴더에 Markdown으로 작성되어 있다.
- [ ] Issue의 Acceptance Criteria를 모두 충족한다.
- [ ] PR 본문에 `Relates to #번호`(초안) 또는 `Closes #번호`(최종)로 Issue가 연결되어 있다.
- [ ] 팀원 1명 이상이 Review하고 Approve했다.
- [ ] Review 수정 요청이 모두 반영되었다.
- [ ] main Branch에 Merge되고 작업 Branch가 삭제되었다.
- [ ] 참고한 OSS·자료의 출처가 기록되어 있다.

## 13. GitHub Projects 운영

**Kanban Status**

| Status | 의미 | 이동 조건 |
|---|---|---|
| Backlog | 수행 예정 작업 | Issue 등록 |
| Ready | 수행 준비 완료 | DoR 충족 |
| In Progress | 작업 중 | Branch 생성 후 작업 시작 |
| Review | 팀원 검토 중 | PR 생성 및 Reviewer 지정 |
| Done | 승인·통합 완료 | DoD 충족, main에 Merge |

**Custom Field (안):** Sprint, Story Point, 담당 역할

**Story Point와 Velocity**
- Story Point는 1, 2, 3, 5, 8 중에서 팀원 합의로 정한다.
- Sprint 종료 시 Done으로 이동한 Story Point 합계를 Velocity로 기록하고, 다음 Sprint 계획에 반영한다.

## 14. 형상관리 규칙 (Branch·Commit·PR·Review)

**Branch**
- main에 직접 Commit하지 않는다.
- Branch 이름: `종류/이슈번호-작업내용` (예: `docs/2-project-definition`, `research/7-barcode-oss`)

| 종류 | 용도 |
|---|---|
| `docs/` | 문서 작성 |
| `research/` | OSS 조사 |
| `evaluation/` | OSS 평가 |
| `feature/` | 앱 기능 개발 |

**Commit 메시지**
- 형식: `종류: 변경 내용 (#이슈번호)`
- 예: `docs: 프로젝트 정의서 초안 작성 (#2)`

**Pull Request**
- base는 `main`, compare는 작업 Branch로 한다.
- 본문에 변경 사항과 `Relates to #번호`를 작성한다. 최종 승인 후 Issue를 Close한다.
- PR 제목 예시: `[Issue #1] Agile 프로젝트 추진계획서 작성`
- 지정된 Reviewer를 Reviewers에 등록한다.

**Review**
- Reviewer는 정확성·객관성·일관성·추적성·완전성을 기준으로 검토한다.
- Comment(의견), Approve(승인), Request changes(수정 요청) 중 하나로 결과를 남긴다.
- Reviewer는 파일을 직접 수정하지 않고 작성자에게 수정을 요청한다.

**Merge**
- Approve 1건 이상 받은 PR만 Merge한다.
- Merge 후 작업 Branch를 삭제하고 Projects 상태를 Done으로 옮긴다.

## 15. 협업 및 의사소통

| 수단 | 용도 |
|---|---|
| GitHub Issues | 작업 정의, 진행 상황, 결정 사항 기록 |
| GitHub Pull Request | 산출물 검토와 승인 |
| GitHub Projects | Sprint 진행 상태 관리 |
| 팀 단톡방 | Daily Scrum, 긴급 공유 |
| 대면 회의 (수업) | Sprint Planning, Review, Retrospective |

- 결정 사항은 단톡방에서 정했더라도 관련 Issue에 댓글로 기록한다.
- PR Review 요청을 받으면 24시간 안에 응답한다.

## 16. 위험관리

| ID | 위험요인 | 가능성 | 영향 | 대응방안 |
|---|---|---|---|---|
| R1 | 팀원 일정 충돌로 작업 지연 | 중 | 높음 | Daily Scrum으로 조기 공유, Sprint 범위 조정 |
| R2 | PR Review 지연으로 Merge 병목 | 중 | 중 | Reviewer 상호 지정, 24시간 응답 규칙 |
| R3 | Git 사용 미숙으로 충돌·작업 손실 | 중 | 중 | 작업 전 `git pull`, 파일 단위 담당 분리 |
| R4 | 국내 상품 바코드 데이터 부족 | 높음 | 중 | 직접 입력 병행, 공공 데이터 추가 조사 |
| R5 | OSS 라이선스·보안 조건 누락 | 중 | 높음 | 평가 기준에 라이선스·보안 항목 필수 포함 |
| R6 | 요구사항 범위 확대 | 중 | 중 | MVP 범위 고정, 추가 요구는 후속 Backlog로 이동 |

## 17. 산출물 위치

```
fridgemate/
├── README.md
└── docs/
    ├── issues.md                         # Issue 목록
    ├── project-management/
    │   └── project-plan.md               # 프로젝트 추진계획서 (Issue #1)
    ├── conops/
    │   ├── project-definition.md         # 프로젝트 정의서 (Issue #2)
    │   └── conops.md                     # 운용개념서 (Issue #3)
    ├── requirements/                     # 요구사항 명세 (Issue #4, #5)
    ├── architecture/                     # 아키텍처 설계서 (Issue #6)
    ├── oss-evaluation/                   # OSS 후보·평가·선정 (Issue #7~#9)
    ├── adr/                              # 아키텍처 결정 기록
    └── final/                            # 최종보고서·회고 (Issue #10)
```

## 18. Issue #1 세부작업과 완료기준

**세부작업**
- [x] 팀 회의에서 역할 분담 확정 (2026-10-02)
- [ ] Sprint 일정 확정 및 Milestone 생성
- [ ] GitHub Projects(Board) 생성 및 저장소 연결
- [ ] Label 생성, Issue #1~#3 등록
- [ ] 본 추진계획서 PR 생성 및 Review

**완료기준 (Acceptance Criteria)**
- 팀원 전원이 역할·일정·협업 규칙에 동의했다.
- Issue #1~#3이 담당자·Label·Milestone과 함께 등록되었다.
- 팀원 1명 이상의 Approve를 받아 main에 Merge되었다.

**승인 기록**

| 구분 | 이름 | 일자 | 결과 |
|---|---|---|---|
| 작성 | | | |
| 검토 | | | |
| 승인 | | | |

## 19. 후속 작업

1. 초기 Product Backlog 항목을 GitHub Issue로 등록하고 Projects Board에 연결한다.
2. 큰 Backlog Item은 한 Sprint 안에 끝낼 수 있도록 Sub-issue로 나눈다.
3. 팀 단위로 Story Point를 추정한다.
4. Sprint 1 Planning에서 Sprint 목표와 Sprint Backlog를 확정한다.
5. Issue #2(프로젝트 정의)를 착수한다.
