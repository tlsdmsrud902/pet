# PET EDIT · 디자인 적용 기록

## 비교한 대표 펫 쇼핑몰 10곳

모든 펫 사이트를 조사한 것은 아니며, 매출 성과를 검증하거나 순위를 매기지 않았습니다. 공식 사이트에서 확인한 구조를 참고하여 PET EDIT에 맞게 새로 구성했습니다. 이미지·문구를 복사하지 않았습니다.

| 사이트 | 참고한 요소 | 적용 |
|---|---|---|
| [Wild One](https://wildone.com/collections/all) | 생활별 컬렉션, 산책용품 구성 | 산책·휴식·놀이 탐색 |
| [Fable](https://fablepets.com/) | 사용 목적을 설명하는 제품 구성과 후기 | 사진형 컬렉션, 후기 연결 |
| [Zee.Dog](https://www.zeedog.com/pages/gifts) | 선물과 라이프스타일 탐색 | 선물 컬렉션 |
| [Tuft + Paw](https://www.tuftandpaw.com/) | 고양이 생활용품 분류 | 고양이·스크래처 바로가기 |
| [Chewy](https://www.chewy.com/) | 반려동물별 쇼핑, 혜택, 고객지원 | 강아지·고양이 메뉴, 세일, FAQ |
| [zooplus](https://www.zooplus.com/) | 종별 카테고리, 매거진, 주문 관리 | 생활용품 6종, 가이드, 주문내역 연결 |
| [PetSmart](https://www.petsmart.com/learning-center/pet-care/what-makes-petsmart-special) | 반려생활 학습 콘텐츠 | 산책·휴식·놀이 가이드 |
| [Pets at Home](https://www.petsathome.com/pet-advice/new-kitten-checklist) | 첫 반려생활 준비물 안내 | 강아지·고양이 체크리스트 |
| [어바웃펫](https://aboutpet.co.kr/shop/home) | 신상품·베스트·이벤트·분류별 쇼핑 | 추천·신상품·인기상품 각 10개, 세일 메뉴 |
| [핏펫](https://www.fitpetmall.com/mall/events/100-won-deal) | 회원 대상 이벤트 안내 | 회원·내 쿠폰 접근 동선 |

실제 운영 연결이 없는 정기배송, 진료·미용 예약, 임의 할인율·후기·매출 수치는 추가하지 않았습니다. 기존 세일의 쿠폰 정책과 발급 로직은 유지했습니다.

## 적용한 디자인과 기능

- 크림·세이지·짙은 녹색의 공통 디자인. 메인, 검색, 세일, 게시판 및 회원/주문 공통 요소에 적용.
- scroll-world의 진행률·구간 전환 방식에서 이미지 기반으로 조정한 3장 히어로. 사용자의 이미지 요청에 맞춰 영상 생성이나 유료 렌더링은 사용하지 않음. 모션 감소 설정 대응.
- 상품 추천 선택, 이미지 핫스폿, FAQ, 첫 반려생활 준비물 6개씩/강아지·고양이 전환, 기기 내 체크 상태 저장.
- 하단 생활용품 6종, 실제 읽을 수 있는 가이드 4편, 후기 게시판 연결, 관심상품·주문·쿠폰 바로가기.
- 새로 만든 이미지 11장: starter-home, guide-walk, guide-rest, guide-play, community-home, story-outdoor, coupon-dog, coupon-cat, coupon-gifts, sale-hero, shop-hero. 앞서 생성한 메인 히어로 및 제품 이미지 4장도 유지.
- 이미지 저장 폴더: `D:/pet/adia902222_s2_260925195134_d_skin1_E/skin1/SkinImg/pet/`.
- 이번 11장 생성 모드: **built-in image_gen**. 최종 프롬프트 목록은 [pet-image-prompts-20260926.json](pet-image-prompts-20260926.json).
- 반복적인 세일 하단 사진 나열을 사이즈·쿠폰·문의 안내로 교체. 같은 상품을 설명하는 상품 카드의 반복 노출은 유지.

## 확인 범위

- 로컬 메뉴/링크 대상 38개 HTTP 응답 확인.
- 메인 추천·신상품·인기상품 10개씩 표시, 이미지 누락 없음.
- 체크리스트 전환, 체크, 새로고침 후 저장, 초기화 검증.
- 데스크톱 및 390px 모바일 메인/세일/검색/가이드 레이아웃 확인, 검사 화면의 가로 넘침 없음.
- 브라우저 검사 실행 중 JavaScript pageerror 없음.
- 로컬은 Cafe24 템플릿을 미리보기로 렌더링합니다. 예시 상품은 '상품 준비 중 · 연출 이미지'로 표시됩니다. 실제 상품·게시물·회원/주문/쿠폰 발급은 Cafe24 서버 연결 후 검증이 필요합니다.

원본 일부는 `.recovery/pet-before-20260926/`에 보존했습니다.
