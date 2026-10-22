# FridgeMate 앱 개발 가이드

세 명이 동시에 개발해도 충돌이 나지 않도록 정한 규칙입니다. 개발을 시작하기 전에 한 번 읽어 주세요.
기능 범위는 [System/Software 요구사항 명세서](docs/requirements/system-software-requirements-specification.md) 7장(R1 구현 범위)과 10.3절(Epic 담당)을 따릅니다.

## 1. 담당 파일

**자기 담당 파일만 수정합니다.** 다른 사람 파일이나 공통 파일을 바꿔야 하면 Issue로 요청해 주세요.

| 담당 | 파일 | 기능 (요구사항 ID) |
|---|---|---|
| 이정남 | `index.html`, `css/style.css`(공통 부분), `js/common/*` | 공통 기반: 화면 구조, 저장, 날짜·상태 계산, 탭 전환 |
| 이정남 | `js/list.js` | 목록·상태 표시, 정렬·검색 (FUN-001~006) |
| 이정남 | `js/recipe.js`, `data/recipes.js` | 레시피 추천 (FUN-037~040) |
| 이석환 | `js/register.js` | 직접 입력 등록, 자동완성, 기본값 (FUN-013~016) |
| 이석환 | `js/barcode.js` | 바코드 인식, 상품 DB 조회 (FUN-007~012) |
| 이석환 | `js/ocr.js` | 소비기한 촬영 인식 (FUN-017~022) |
| 이지선 | `js/process.js` | 수정·삭제, 소비·폐기 처리, 이력 (FUN-025~030) |
| 이지선 | `js/alert.js` | 임박 요약, 단말 알림 (FUN-031~034) |
| 이지선 | `js/settings.js` | 알림 기준 설정 (FUN-035~036) |
| 이지선 | `js/backup.js` | 백업·복원 (FUN-041~043) |
| 공동 | `data/foods.js` | 품목 사전 (추가만, 기존 줄 수정 금지) |

`css/style.css`는 맨 아래 "기능별 스타일" 구역에서 **자기 이름이 적힌 구역에만** 추가합니다.

## 2. 앱 구조

```
index.html              화면 자리(area)와 하단 탭. 각 기능은 자기 자리만 채움
css/style.css           공통 스타일 + 기능별 스타일 구역
js/common/utils.js      FM.util (날짜·D-day·상태·토스트·아래 창), FM.on/FM.emit (이벤트)
js/common/storage.js    FM.store (식재료·이력·설정·상품 캐시 저장)
js/common/app.js        탭 전환, 기능 파일 시작, 날짜 변경·오프라인 감지
js/*.js                 기능 파일 (담당자별)
data/foods.js           품목 사전 FM_FOODS
data/recipes.js         레시피 FM_RECIPES
```

### 기능 파일 기본 모양

```js
(function (FM) {
  'use strict';
  function init()   { /* 앱 시작 때 한 번: 버튼 연결 등 */ }
  function render() { /* 화면 그리기: 데이터·설정·날짜가 바뀌면 자동으로 다시 불림 */ }
  FM.register('이름', { init: init, render: render });
})(window.FM);
```

### 자주 쓰는 공통 함수

| 함수 | 설명 |
|---|---|
| `FM.store.getItems()` | 전체 식재료 배열 |
| `FM.store.getItem(id)` | 식재료 1개 |
| `FM.store.addItem({name, quantity, unit, storage, expiryDate, category, barcode})` | 추가 → `{ok, item}` 또는 `{ok:false, error}` |
| `FM.store.updateItem(id, {quantity: 2})` | 수정 (바꿀 항목만) |
| `FM.store.removeItem(id)` | 삭제 |
| `FM.store.addHistory({itemId, name, type:'소비'/'폐기', quantity})` | 처리 이력 저장 |
| `FM.store.getSettings()` / `saveSettings({soonDays: 5})` | 설정 읽기·저장 |
| `FM.store.getProduct(barcode)` / `saveProduct(barcode, {name, category, source})` | 바코드 상품 캐시 |
| `FM.store.exportAll()` / `importAll(data, 'merge'/'replace')` | 백업·복원 |
| `FM.util.status(expiryDate)` | `{key, name, label, cls, dday}` 상태 계산 |
| `FM.util.dday(date)`, `FM.util.addDays(n)`, `FM.util.today()` | 날짜 계산 |
| `FM.util.escape(text)` | 사용자 입력을 화면에 넣을 때 꼭 사용 |
| `FM.util.toast('메시지')` | 화면 아래 잠깐 뜨는 알림 |
| `FM.util.openSheet(html)` / `closeSheet()` | 아래에서 올라오는 창 |
| `FM.showTab('list')` | 탭 이동 |
| `FM.on('items:changed', fn)` / `FM.emit(...)` | 이벤트 |

> `localStorage`를 직접 쓰지 말고 반드시 `FM.store`를 사용하세요. 저장 형식은 `js/common/storage.js` 맨 위에 있습니다.

### 기능끼리 연결되는 약속

| 연결 | 약속 |
|---|---|
| 목록 → 처리 창 | 목록에서 재료를 누르면 `FM.emit('item:select', itemId)`. `process.js`가 받아서 창을 엶 |
| 등록 → 바코드 | `register.js`가 `FM.barcode.start(done)` 호출. 결과 `done({barcode, name, category})`, 취소 `done(null)` |
| 등록 → 소비기한 OCR | `register.js`가 `FM.ocr.start(done)` 호출. 사용자가 확인한 날짜로 `done('YYYY-MM-DD')` |

## 3. 내 컴퓨터에서 테스트하기

- **간단한 확인:** `index.html`을 더블클릭해서 브라우저로 열면 됩니다.
- **카메라 기능(바코드·OCR):** 파일로 열면 카메라가 동작하지 않습니다. VS Code 확장 **Live Server**를 설치하고 `index.html`에서 오른쪽 클릭 → **Open with Live Server**로 여세요. 휴대폰 테스트는 main에 Merge된 뒤 GitHub Pages 주소에서 합니다.
- **휴대폰 화면 크기로 보기:** 크롬에서 F12 → 왼쪽 위 휴대폰 아이콘(Toggle device toolbar).
- **데이터 초기화:** F12 → Console 탭에 `FM.store.resetAll()` 입력.

## 4. 작업 순서 (매번 같음)

1. GitHub에 내 기능 Issue 만들기 (담당자: 나)
2. Git Bash에서 최신 main 받기 → 브랜치 만들기
   ```bash
   git checkout main
   git pull
   git checkout -b feature/기능이름
   ```
3. 내 파일만 수정 → 브라우저에서 테스트
4. 커밋 → 올리기
   ```bash
   git add js/내파일.js
   git commit -m "feat: 기능 설명 (FUN-000)"
   git push -u origin feature/기능이름
   ```
5. GitHub에서 Pull Request 만들기 (본문에 `Closes #이슈번호`) → 팀원 1명 리뷰 → Merge
6. Merge되면 몇 분 뒤 앱 주소에 반영됩니다: https://jsj2026.github.io/fridgemate/

작게 자주 올리세요. 다른 사람 PR이 Merge되면 작업 전에 `git pull`로 최신 main을 받아 주세요.
