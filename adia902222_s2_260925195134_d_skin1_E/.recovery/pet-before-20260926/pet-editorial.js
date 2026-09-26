/* Temporary 10-card displays keep the main page complete until Cafe24 products are merchandised. */
(function () {
  var sources = [
    '/SkinImg/pet/products-flatlay.png',
    '/SkinImg/pet/product-bed.png',
    '/SkinImg/pet/category-walk.png',
    '/SkinImg/pet/category-cat.png',
    '/SkinImg/pet/hero-home.png',
    '/SkinImg/pet/banner-picnic.png',
    '/SkinImg/pet/event-birthday.png'
  ];
  var sets = [
    ['건강한 한 끼를 위한 선택', '매일의 사료와 간식'],
    ['새로운 반려생활 아이템', '곧 만나보실 수 있어요'],
    ['가장 많이 찾는 상품', '인기 아이템 준비 중']
  ];
  function placeholder(card, index, copy) {
    return '<a class="pe-placeholder-card" href="/product/list.html"><figure><img src="' +
      sources[index % sources.length] + '" alt="" loading="lazy"></figure><h3>' +
      copy[0] + '</h3><p>' + copy[1] + '</p></a>';
  }
  function init() {
    var root = document.querySelector('.pet-editorial');
    if (!root) return;
    root.querySelectorAll('.pe-products').forEach(function (section, sectionIndex) {
      var list = section.querySelector('.prdList');
      var fallback = section.querySelector('[data-pe-placeholder]');
      if (!list || !fallback) return;
      if (!list.querySelector('li')) {
        list.closest('.ec-base-product').hidden = true;
        fallback.hidden = false;
        fallback.innerHTML = Array.from({length: 10}, function (_, index) {
          return placeholder(section, index, sets[sectionIndex] || sets[0]);
        }).join('');
      } else {
        fallback.remove();
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
