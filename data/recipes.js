/* 내장 레시피 데이터 (DAT-009) — 레시피 추천에 사용
 * 형식: { name, ingredients: [재료명...](data/foods.js 품목명과 같게), steps: '조리 요약', source }
 * 목표: 50개 이상 (현재는 시작용). 외부 레시피를 가져올 때는 출처와 이용 조건을 꼭 적어 주세요. */
window.FM_RECIPES = [
  { name: '두부조림', ingredients: ['두부', '대파', '양파'], steps: '두부를 굽고 간장 양념과 채소를 넣어 졸인다.', source: 'FridgeMate 팀 작성' },
  { name: '계란말이', ingredients: ['계란', '대파', '당근'], steps: '계란에 다진 채소를 섞어 얇게 부치며 만다.', source: 'FridgeMate 팀 작성' },
  { name: '김치볶음밥', ingredients: ['김치', '밥', '계란', '대파'], steps: '김치와 대파를 볶다가 밥을 넣고 볶은 뒤 계란 프라이를 올린다.', source: 'FridgeMate 팀 작성' },
  { name: '된장찌개', ingredients: ['두부', '애호박', '양파', '감자', '버섯'], steps: '된장을 푼 물에 채소를 넣어 끓이고 두부를 넣는다.', source: 'FridgeMate 팀 작성' },
  { name: '제육볶음', ingredients: ['돼지고기', '양파', '대파', '당근'], steps: '고추장 양념한 돼지고기를 채소와 함께 볶는다.', source: 'FridgeMate 팀 작성' },
  { name: '토마토 달걀볶음', ingredients: ['토마토', '계란', '대파'], steps: '계란을 반숙으로 볶아 두고 토마토를 볶다가 합친다.', source: 'FridgeMate 팀 작성' },
  { name: '감자조림', ingredients: ['감자', '양파', '당근'], steps: '깍둑 썬 감자와 채소를 간장 양념에 졸인다.', source: 'FridgeMate 팀 작성' },
  { name: '프렌치토스트', ingredients: ['식빵', '계란', '우유', '버터'], steps: '계란·우유 물에 식빵을 적셔 버터에 굽는다.', source: 'FridgeMate 팀 작성' }
];
