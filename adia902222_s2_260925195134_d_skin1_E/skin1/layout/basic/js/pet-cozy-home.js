/* PETPIA cozy home. 실제 카페24 상품·게시판 모듈이 우선이고, 비어 있을 때만 연출 카드를 채운다. */
(function () {
  var photos = ['product-bed', 'product-bowl', 'product-walk-kit', 'product-toy', 'coupon-gifts', 'coupon-dog', 'products-flatlay', 'coupon-cat', 'hero-home', 'category-walk'];
  var names = ['포근한 코듀로이 베드', '매일 쓰는 데일리 식기', '가벼운 산책 하네스 세트', '터그 로프 & 간식 볼', '특별한 날의 선물 상자', '우리 집 강아지 셀렉션', '매일의 간식 & 케어', '고양이의 아늑한 시간', '햇살 드는 휴식 자리', '주말 산책 준비'];

  function fillPlaceholders(root) {
    root.querySelectorAll('.cz-products').forEach(function (section) {
      var list = section.querySelector('.prdList');
      var fallback = section.querySelector('[data-cz-placeholder]');
      if (!fallback) return;
      if (list && list.querySelector('li')) { fallback.remove(); return; }
      if (list) list.closest('.ec-base-product').hidden = true;
      var count = section.classList.contains('cz-products--rail') ? 10 : 8;
      var offset = section.classList.contains('cz-products--best') ? 3 : 0;
      fallback.hidden = false;
      fallback.innerHTML = Array.from({ length: count }, function (_, i) {
        var k = (i + offset) % photos.length;
        return '<a class="cz-ph" href="/product/search.html"><figure><img src="/SkinImg/pet/' + photos[k] +
          '.png" alt="" loading="lazy"><span>준비 중</span></figure><strong>' + names[k] + '</strong><small>상품 준비 중 · 연출 이미지</small></a>';
      }).join('');
    });
  }

  function initFinder(root) {
    var form = root.querySelector('.cz-finder__form');
    if (!form) return;
    var keywords = { rest: '침대', play: '장난감', meal: '식기' };
    var labels = { rest: ['포근한 휴식을', '침대 · 쿠션', '을'], play: ['즐거운 놀이를', '장난감', '을'], meal: ['맛있는 한 끼를', '식기', '를'] };
    function update() {
      var pet = form.querySelector('[name=pet]:checked').value === 'cat' ? '고양이' : '강아지';
      var moment = form.querySelector('[name=moment]:checked').value;
      form.querySelector('[name=keyword]').value = pet + ' ' + keywords[moment];
      var out = form.querySelector('[data-finder-result]');
      out.textContent = '';
      out.append(pet + '의 ' + labels[moment][0] + ' 위한 ');
      var b = document.createElement('b'); b.textContent = labels[moment][1]; out.append(b, labels[moment][2] + ' 추천해요.');
    }
    form.addEventListener('change', update);
    form.addEventListener('submit', function (e) {
      e.preventDefault(); update();
      location.href = '/product/search.html?keyword=' + encodeURIComponent(form.querySelector('[name=keyword]').value);
    });
    update();
  }

  function initHotspots(root) {
    var spots = Array.from(root.querySelectorAll('.cz-hotspot'));
    function closeAll(except) {
      spots.forEach(function (b) {
        if (b === except) return;
        b.setAttribute('aria-expanded', 'false');
        document.getElementById(b.getAttribute('aria-controls')).hidden = true;
      });
    }
    spots.forEach(function (b) {
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        closeAll(b);
        b.setAttribute('aria-expanded', String(open));
        document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
      });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  }

  function initStarter(root) {
    var list = root.querySelector('[data-starter-list]');
    if (!list) return;
    var status = root.querySelector('[data-starter-status]');
    var bar = root.querySelector('[data-starter-bar]');
    var pet = 'dog', saved = { dog: [], cat: [] }, persisted = true;
    try { var data = JSON.parse(localStorage.getItem('petedit-starter-v1')); if (data && Array.isArray(data.dog) && Array.isArray(data.cat)) saved = data; } catch (e) {}
    var items = {
      dog: ['식기와 물그릇', '편안한 침대', '하네스와 리드줄', '배변패드', '크기에 맞는 장난감', '이동장'],
      cat: ['식기와 물그릇', '숨을 수 있는 침대', '고양이 화장실', '고양이 모래', '스크래처', '이동장']
    };
    function update() {
      var done = saved[pet].length, total = items[pet].length;
      try { localStorage.setItem('petedit-starter-v1', JSON.stringify(saved)); } catch (e) { persisted = false; }
      status.textContent = done + ' / ' + total + ' 준비 완료' + (done === total ? ' · 이제 만날 준비가 끝났어요!' : persisted ? ' · 이 기기에 저장돼요' : ' · 지금 화면에서만 유지돼요');
      if (bar) bar.style.width = (done / total * 100) + '%';
    }
    function render() {
      list.innerHTML = '';
      items[pet].forEach(function (name, i) {
        var row = document.createElement('label'), input = document.createElement('input'), mark = document.createElement('i'), text = document.createElement('span'), link = document.createElement('a');
        input.type = 'checkbox'; input.checked = saved[pet].indexOf(i) > -1;
        text.textContent = name; link.textContent = '보러 가기'; link.href = '/product/search.html?keyword=' + encodeURIComponent(name);
        input.addEventListener('change', function () {
          saved[pet] = saved[pet].filter(function (n) { return n !== i; });
          if (input.checked) saved[pet].push(i);
          update();
        });
        row.append(input, mark, text, link); list.appendChild(row);
      });
      update();
    }
    root.querySelectorAll('[data-starter-pet]').forEach(function (button) {
      button.addEventListener('click', function () {
        pet = button.dataset.starterPet;
        root.querySelectorAll('[data-starter-pet]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
        render();
      });
    });
    root.querySelector('[data-starter-reset]').addEventListener('click', function () { saved[pet] = []; render(); });
    render();
  }

  function initRails(root) {
    root.querySelectorAll('.cz-products--rail').forEach(function (section) {
      section.querySelectorAll('[data-rail]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var track = section.querySelector('.ec-base-product:not([hidden]) .prdList') || section.querySelector('.cz-placeholder:not([hidden])');
          if (!track) return;
          var card = track.firstElementChild;
          var step = card ? card.getBoundingClientRect().width + 20 : 300;
          track.scrollBy({ left: step * 2 * Number(btn.dataset.rail), behavior: 'smooth' });
        });
      });
    });
  }

  /* 기존 스크롤 히어로 : 스크롤 위치에 따라 영상 → 3장의 사진으로 넘어간다 (pet-editorial.js 에서 옮김) */
  function initWorldHero(root) {
    var track = root.querySelector('[data-scroll-hero]');
    if (!track) return;
    var hero = track.querySelector('.pe-hero');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var images = Array.from(track.querySelectorAll('[data-world-image]'));
    var copies = Array.from(track.querySelectorAll('[data-world-copy]'));
    var route = Array.from(track.querySelectorAll('[data-world-jump]'));
    var label = track.querySelector('.pe-image-label');
    var labels = ['PETPIA FILM / 01', 'THE EVERYDAY COLLECTION / 02', 'THE OUTDOOR COLLECTION / 03', 'THE HOME COLLECTION / 04'];
    var video = track.querySelector('.pe-world-video');
    if (video) {
      video.muted = true; video.defaultMuted = true; video.setAttribute('muted', '');
      var play = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
      video.addEventListener('canplay', play, { once: true }); play();
    }
    var clamp = function (n) { return Math.max(0, Math.min(1, n)); };
    var smooth = function (n) { n = clamp(n); return n * n * (3 - 2 * n); };
    var active = -1, scheduled = false;
    function drawScene(position) {
      var index = Math.min(images.length - 1, Math.floor(position + .5));
      hero.style.setProperty('--hero-progress', position / Math.max(1, images.length - 1));
      images.forEach(function (img, i) {
        img.style.opacity = String(1 - smooth((Math.abs(position - i) - .28) / .44));
        img.setAttribute('aria-hidden', String(i !== index));
        img.style.transform = reduce.matches ? 'none' : 'scale(' + (1.02 + clamp(position - i + .5) * .09) + ')';
        if (img.tagName === 'VIDEO') { if (i === index) { var p = img.play(); if (p && p.catch) p.catch(function () {}); } else img.pause(); }
      });
      copies.forEach(function (copy, i) {
        copy.style.opacity = String(1 - smooth((Math.abs(position - i) - .22) / .35));
        copy.style.transform = reduce.matches ? 'none' : 'translateY(' + ((i - position) * 24) + 'px)';
        copy.style.pointerEvents = i === index ? 'auto' : 'none';
        copy.inert = i !== index;
        copy.setAttribute('aria-hidden', String(i !== index));
      });
      if (index !== active) {
        active = index;
        route.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === index)); });
        if (label) label.textContent = labels[index];
      }
    }
    function frame() {
      scheduled = false;
      if (reduce.matches) return;
      var top = parseFloat(getComputedStyle(hero).top) || 0;
      var distance = Math.max(1, track.offsetHeight - hero.offsetHeight);
      drawScene(clamp((top - track.getBoundingClientRect().top) / distance) * Math.max(1, images.length - 1));
    }
    function requestFrame() { if (!scheduled) { scheduled = true; requestAnimationFrame(frame); } }
    route.forEach(function (button, i) {
      button.addEventListener('click', function () {
        if (reduce.matches) { drawScene(i); return; }
        var top = parseFloat(getComputedStyle(hero).top) || 0;
        var start = track.getBoundingClientRect().top + scrollY - top;
        window.scrollTo({ top: Math.max(0, start + (track.offsetHeight - hero.offsetHeight) * i / Math.max(1, route.length - 1)), behavior: 'smooth' });
      });
    });
    window.addEventListener('scroll', requestFrame, { passive: true });
    window.addEventListener('resize', requestFrame, { passive: true });
    reduce.addEventListener('change', function () { drawScene(0); requestFrame(); });
    drawScene(0); requestFrame();
  }

  function initMisc(root) {
    var free = root.querySelector('[data-free-over]'), ship = (window.STORE_CONTENT || {}).shipping;
    if (free && ship && ship.freeBar !== false && ship.freeOver > 0) {
      free.textContent = (ship.freeOver % 10000 === 0 ? ship.freeOver / 10000 + '만원' : ship.freeOver.toLocaleString('ko-KR') + '원') + ' 이상 무료배송 · ';
      free.hidden = false;
    }
    root.querySelectorAll('.cz-review-list li').forEach(function (li) {
      var a = li.querySelector('a');
      if (!a || !a.textContent.trim() || a.textContent.indexOf('{$') !== -1) li.remove();
    });
    var reviews = root.querySelector('.cz-review-list');
    if (reviews && !reviews.querySelector('li')) reviews.hidden = true;
  }

  function initReveal(root) {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    root.querySelectorAll('.cz-sec, .cz-finder, .cz-size, .cz-story, .cz-duo, .cz-starter, .cz-reviews, .cz-help').forEach(function (el) {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('cz-reveal'); io.observe(el); }
    });
  }

  function init() {
    var root = document.querySelector('.pet-cozy');
    if (!root) return;
    initWorldHero(root);
    fillPlaceholders(root);
    initFinder(root);
    initHotspots(root);
    initStarter(root);
    initRails(root);
    initMisc(root);
    initReveal(root);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
