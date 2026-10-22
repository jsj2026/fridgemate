# FridgeMate — 2단계 촬영 + AI 이미지 분석

기존 GitHub 저장소 `jsj2026/fridgemate`는 수정하지 않은 독립 버전입니다.

## 기능
- 1단계: 제품 앞면 사진 촬영
- 2단계: 소비기한 인쇄 부분 사진 촬영
- 무료 OCR: Tesseract.js 한국어/영어 분석
- AI 이미지 분석: Netlify Functions 서버를 통한 OpenAI 비전 모델 분석
- 사용자 확인·수정 후 입력란 적용, 최종 저장

## 배포 (Netlify)
1. 이 폴더 전체를 **Netlify 사이트**에 배포합니다. 서버 함수 배포를 위해 Git 연동 또는 Netlify CLI 배포를 권장합니다. 정적 파일만 업로드하면 AI 기능은 동작하지 않을 수 있습니다.
2. Netlify 사이트 설정 > Environment variables에서 `OPENAI_API_KEY`를 **서버 환경변수**로 추가합니다.
3. Functions가 함께 배포되었는지 확인합니다. `/.netlify/functions/analyze` 엔드포인트가 있어야 합니다.
4. 아이폰 Safari에서 **HTTPS 주소**로 열고 카메라 권한을 허용합니다.
5. 앞면과 소비기한 각각 촬영 → AI 이미지 분석 → 사용자 확인 → 입력란 적용 → 추가 저장.
6. API 사용량에 따라 비용이 발생합니다. 공개 배포 시 인증, 호출 제한, 예산 한도 설정을 권장합니다.

**중요**: `OPENAI_API_KEY`를 index.html, GitHub 공개 저장소, 브라우저 JavaScript에 절대로 넣지 마세요.
**중요**: 이 앱의 사진은 AI 분석 버튼을 누르면 OpenAI API로 전송됩니다. 무료 OCR은 브라우저에서 처리됩니다.
**중요**: AI 추출 결과는 틀릴 수 있습니다. 특히 소비기한을 반드시 확인하세요.
**참고**: 원래 GitHub Pages와 다른 도메인에서 실행하면 브라우저 저장 데이터는 공유되지 않습니다.
