# FridgeMate Issue 목록

> 오픈소스SW특론 OSS Agile 실습 · 1주차 산출물 (초안)
> 작성일: 2026-10-02 · 상태: 팀 검토 전 초안

## 1. 전체 Issue 구성

전체 실습 기간(5주) 동안 수행할 Issue를 아래와 같이 구성한다. 1주차에는 **Issue #1~#3**을 GitHub에 등록하고, 나머지는 해당 주차에 등록한다.

| Issue | 제목 | 종류 | 주차 | 담당 | 주요 산출물 | 작업 폴더 |
|---|---|---|---|---|---|---|
| #1 | 프로젝트 추진계획 수립 | 계획 | 1주 | 이정남 | 프로젝트 추진계획서 | `docs/project-management/` |
| #2 | 프로젝트 개요·배경·문제·목표·범위 정의 | 운용개념 | 1주 | 이석환 | 프로젝트 정의서 | `docs/conops/` |
| #3 | 이해관계자·User Class·운용개념·핵심 시나리오 정의 | 운용개념 | 2주 | 이지선 | CONOPS·운용 시나리오 | `docs/conops/` |
| #4 | User Class별 기능 요구사항 정의 | 요구사항 | 2주 | 이석환 | 기능 요구사항 명세서 | `docs/requirements/` |
| #5 | 비기능·데이터·인터페이스 요구사항 정의 | 요구사항 | 2주 | 이지선 | 비기능·인터페이스 요구사항 명세서 | `docs/requirements/` |
| #6 | 시스템 논리·물리 아키텍처 설계 | 아키텍처 | 3주 | 이정남 | 아키텍처 설계서 | `docs/architecture/` |
| #7 | 계층별 필요 기능 및 OSS 후보군(Long List) 도출 | OSS 조사 | 3주 | 이석환 | OSS 후보 조사서 | `docs/oss-evaluation/` |
| #8 | OSS 평가기준 설정 및 후보 상세평가 | OSS 평가 | 4주 | 이지선 | 평가기준서·상세평가표 | `docs/oss-evaluation/` |
| #9 | 최종 OSS 선정 및 통합 적용방안 | OSS 선정 | 4주 | 이정남 | OSS 최종선정서·통합설계서 | `docs/oss-evaluation/`, `docs/adr/` |
| #10 | 산출물 통합·Sprint Review·Retrospective | 과제 완료 | 5주 | 전원 | 최종보고서·발표자료·회고 결과서 | `docs/final/` |

> 담당자는 2026-10-02 팀 협의로 정한 역할(팀장 이정남, 개발자 이석환, Reviewer 이지선) 기준이다. 모든 PR은 Reviewer(이지선)가 검토하며, 이지선이 작성한 PR은 팀장이 검토한다.
> 팀 저장소에는 이미 #1~#6 번호가 사용되어 있으므로, 실제 GitHub 번호와 구분하기 위해 Issue 제목 앞에 `[Issue #1]` 형식의 접두어를 붙인다.

## 2. 공통 Label

| Label | 용도 |
|---|---|
| `planning` | 계획·일정 관련 |
| `agile` | Scrum·Sprint 운영 |
| `conops` | 프로젝트 정의·운용개념 |
| `requirements` | 요구사항 |
| `architecture` | 아키텍처 설계 |
| `oss-evaluation` | OSS 조사·평가·선정 |
| `documentation` | 문서 작성·보완 |

## 3. 1주차 등록 Issue 본문

아래 내용을 GitHub `Issues → New issue`에 그대로 붙여넣어 등록한다.

---

### [Issue #1] 프로젝트 추진계획 수립

- **Labels:** `planning`, `agile`, `documentation`
- **Assignee:** 이정남
- **Reviewer:** 이지선
- **Project:** FridgeMate OSS Project
- **Milestone:** Sprint 1
- **Relationships:** 선행 없음, Issue #2의 선행
- **Branch:** `planning/project-plan`

```markdown
## 목적
FridgeMate 프로젝트를 Agile(Scrum) 방식으로 수행하기 위한 추진계획을 수립한다.

## 수행 내용
- [ ] Product Vision과 Product Goal 정의
- [ ] Scrum Team 구성과 역할 분담
- [ ] 초기 Product Backlog 작성
- [ ] 5개 Sprint 일정과 Milestone 수립
- [ ] Issue별 담당자와 선후행 관계 정리
- [ ] Branch·Commit·PR·Review 규칙 정의
- [ ] Definition of Ready / Definition of Done 정의
- [ ] 위험요인 및 대응방안 정리

## 산출물
- docs/project-management/project-plan.md

## 완료 조건 (Acceptance Criteria)
- 팀원 전원이 역할과 일정에 동의한다.
- 팀원 1명 이상이 PR을 Review하고 Approve한다.
- main Branch에 Merge된다.
```

---

### [Issue #2] 프로젝트 개요·배경·문제·목표·범위 정의

- **Labels:** `conops`, `documentation`
- **Assignee:** 이석환
- **Reviewer:** 이지선
- **Project:** FridgeMate OSS Project
- **Milestone:** Sprint 1
- **Relationships:** Issue #1 이후, Issue #3의 선행
- **Branch:** `docs/2-project-definition`

```markdown
## 목적
FridgeMate가 해결할 문제와 목표, 시스템 범위를 정의한다.

## 수행 내용
- [ ] 프로젝트 배경과 현재 문제점(AS-IS) 정리
- [ ] 프로젝트 필요성과 목표 시스템 개념(TO-BE) 정의
- [ ] 정량적 성공 목표 설정
- [ ] 시스템 범위와 제외 범위 정의
- [ ] 이해관계자와 기대가치 식별
- [ ] 예상 효과, 가정사항, 제약사항 정리

## 산출물
- docs/conops/project-definition.md

## 완료 조건 (Acceptance Criteria)
- 범위와 제외 범위가 구분되어 있다.
- 목표가 측정 가능한 수치로 작성되어 있다.
- Issue #3(운용개념) 작성에 착수할 수 있다.
- 팀원 1명 이상이 Review하고 Approve한다.
```

---

### [Issue #3] 이해관계자·User Class·운용개념·핵심 시나리오 정의

- **Labels:** `conops`
- **Assignee:** 이지선
- **Reviewer:** 이정남
- **Project:** FridgeMate OSS Project
- **Milestone:** Sprint 2
- **Relationships:** Issue #2 이후, Issue #4·#5의 선행
- **Branch:** `docs/3-conops`

```markdown
## 목적
FridgeMate를 누가, 어떤 환경에서, 어떻게 사용하는지 운용개념(CONOPS)을 정의한다.

## 수행 내용
- [ ] User Class 식별 (1인 가구, 가족 공유 사용자, 관리자 등)
- [ ] User Class별 역할과 접근권한 정의
- [ ] 운용 환경과 시스템 경계, 외부 연동 대상 정의
- [ ] 핵심 운용 시나리오 작성
  - 식재료 등록 → 보관 → 유통기한 알림 → 소비/폐기
- [ ] 예외 시나리오 작성 (바코드 인식 실패, 알림 미수신 등)
- [ ] 시스템 도입 전·후 사용 방식 비교
- [ ] 초기 User Story 작성

## 선행 Issue
- Issue #2 프로젝트 정의

## 산출물
- docs/conops/conops.md

## 완료 조건 (Acceptance Criteria)
- 모든 User Class에 대해 1개 이상의 운용 시나리오가 있다.
- Issue #4 기능 요구사항으로 전환할 항목이 식별되어 있다.
- 팀원 1명 이상이 Review하고 Approve한다.
```
