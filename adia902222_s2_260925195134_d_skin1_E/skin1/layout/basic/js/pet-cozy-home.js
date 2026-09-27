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
      var count = 10;
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
          if (section.classList.contains('is-pinned')) window.scrollBy({ top: step * 2 * Number(btn.dataset.rail), behavior: 'smooth' });
          else track.scrollBy({ left: step * 2 * Number(btn.dataset.rail), behavior: 'smooth' });
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
    var labels = ['PETPIA FILM / 01', 'THE OUTDOOR COLLECTION / 02', 'THE HOME COLLECTION / 03'];
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

  /* Scroll World (이미지 전용) : 섹션을 스크롤하는 동안 장면마다 카메라가 날아 들어갔다가(가까워짐) 지나간다.
     레이어의 data-depth 가 클수록 더 빠르게 커지고 바깥으로 밀려나며, 마우스를 따라 더 크게 움직인다. */
  function initWorld(root) {
    var sec = root.querySelector('.cz-world');
    if (!sec) return;
    var stage = sec.querySelector('.cz-world__stage');
    var scenes = Array.from(sec.querySelectorAll('.cz-world__scene'));
    var copies = Array.from(sec.querySelectorAll('.cz-world__copy'));
    var route = Array.from(sec.querySelectorAll('[data-world-go]'));
    var N = scenes.length, SPAN = N - 0.35;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    sec.style.setProperty('--cz-world-n', N);
    var layers = scenes.map(function (scene) {
      return Array.from(scene.children).map(function (el, k) {
        return { el: el, d: parseFloat(el.dataset.depth || '1'), r: parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 0, seed: k * 1.7, ox: 0, oy: 0 };
      });
    });
    var mx = 0, my = 0, tx = 0, ty = 0, visible = false, active = -1, raf = 0;
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

    function measure() {
      var head = document.getElementById('header');
      var h = head ? Math.max(0, Math.round(head.getBoundingClientRect().bottom)) : 0;
      root.style.setProperty('--cz-head', h + 'px');
      var w = stage.clientWidth, hh = stage.clientHeight;
      layers.forEach(function (list) {
        list.forEach(function (L) {
          var cs = getComputedStyle(L.el);
          L.ox = (parseFloat(cs.left) || w / 2) - w / 2;
          L.oy = (parseFloat(cs.top) || hh / 2) - hh / 2;
        });
      });
    }
    function scaleFor(z, d) {
      if (z < 0) return Math.max(0.3, 1 + z * 0.95 * Math.min(d, 1.4));
      if (z < 0.62) return 1 + z * 0.18 * d;
      return 1 + 0.1116 * d + (z - 0.62) * 2.6 * d;
    }
    function draw(time) {
      raf = 0;
      var rect = sec.getBoundingClientRect();
      var travel = Math.max(1, sec.offsetHeight - stage.offsetHeight);
      var head = parseFloat(getComputedStyle(root).getPropertyValue('--cz-head')) || 0;
      var P = clamp((head - rect.top) / travel, 0, 1);
      sec.style.setProperty('--cz-world-p', P.toFixed(4));
      tx += (mx - tx) * 0.08; ty += (my - ty) * 0.08;
      var pos = P * SPAN, now = time || 0;
      scenes.forEach(function (scene, i) {
        var z = pos - i, last = i === N - 1;
        scene.style.opacity = clamp((z + 0.3) / 0.3, 0, 1).toFixed(3);
        var on = z > -0.3 && (last || z < 1);
        scene.classList.toggle('is-on', on);
        scene.setAttribute('aria-hidden', String(!(z > -0.2 && (last || z < 0.8))));
        if (!on) return;
        layers[i].forEach(function (L) {
          var zz = last ? Math.min(z, 0.62) : z;
          var s = scaleFor(zz, L.d);
          var o = zz < -0.45 ? 0 : zz < 0 ? (zz + 0.45) / 0.45 : zz < 0.72 ? 1 : Math.max(0, 1 - (zz - 0.72) / 0.28);
          var push = (s - 1) * 0.55;
          var bob = L.d > 1 ? Math.sin(now * 0.0012 + L.seed) * 5 * L.d : 0;
          var dx = L.ox * push + tx * L.d * 16, dy = L.oy * push + ty * L.d * 10 + bob;
          L.el.style.opacity = o.toFixed(3);
          L.el.style.transform = 'translate(-50%,-50%) translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + s.toFixed(4) + ') rotate(' + L.r + 'deg)';
        });
      });
      copies.forEach(function (copy, i) {
        var z = pos - i, last = i === N - 1;
        var o = clamp((z + 0.12) / 0.2, 0, 1) * (last ? 1 : clamp((0.72 - z) / 0.16, 0, 1));
        copy.style.opacity = o.toFixed(3);
        copy.style.setProperty('--cz-copy-y', ((1 - o) * 24).toFixed(1) + 'px');
        copy.classList.toggle('is-on', o > 0.5);
        copy.inert = o < 0.5;
        copy.setAttribute('aria-hidden', String(o < 0.5));
      });
      var idx = clamp(Math.round(pos - 0.2), 0, N - 1);
      if (idx !== active) { active = idx; route.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === idx)); }); }
      if (visible && (fine || Math.abs(mx - tx) > 0.001)) raf = requestAnimationFrame(draw);
    }
    function request() { if (!raf) raf = requestAnimationFrame(draw); }

    if (reduce.matches) return;
    measure();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', function () { measure(); request(); }, { passive: true });
    if (fine) {
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2; my = ((e.clientY - r.top) / r.height - 0.5) * 2; request();
      });
      stage.addEventListener('pointerleave', function () { mx = 0; my = 0; request(); });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) { measure(); request(); } }).observe(sec);
    } else { visible = true; }
    route.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        var head = parseFloat(getComputedStyle(root).getPropertyValue('--cz-head')) || 0;
        var top = sec.getBoundingClientRect().top + window.scrollY - head;
        var travel = sec.offsetHeight - stage.offsetHeight;
        window.scrollTo({ top: top + travel * Math.min(1, (i + 0.2) / SPAN), behavior: 'smooth' });
      });
    });
    request();
  }

  /* 이벤트 레이어 팝업 : 4초마다 다음 장으로, 오늘 하루 닫기는 자정까지 localStorage 에 기억 */
  function initPopup() {
    var pop = document.getElementById('cz-pop');
    if (!pop) return;
    var KEY = 'petpia-pop-hide-until';
    try { if (Number(localStorage.getItem(KEY)) > Date.now()) return; } catch (e) {}
    var track = pop.querySelector('.cz-pop__track');
    var dots = Array.from(pop.querySelectorAll('.cz-pop__dots button'));
    var n = pop.querySelectorAll('.cz-pop__slide').length, cur = 0, timer = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(i) {
      cur = (i + n) % n;
      track.style.transform = 'translateX(' + (-100 * cur) + '%)';
      dots.forEach(function (d, k) { d.setAttribute('aria-current', String(k === cur)); });
    }
    function play() { stop(); if (!reduce && n > 1) timer = setInterval(function () { go(cur + 1); }, 4000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function close() { stop(); pop.hidden = true; document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); play(); }); });
    pop.querySelector('[data-pop-close]').addEventListener('click', close);
    pop.querySelector('[data-pop-today]').addEventListener('click', function () {
      var end = new Date(); end.setHours(24, 0, 0, 0);
      try { localStorage.setItem(KEY, String(end.getTime())); } catch (e) {}
      close();
    });
    pop.addEventListener('click', function (e) { if (e.target === pop) close(); });
    pop.addEventListener('mouseenter', stop); pop.addEventListener('mouseleave', play);
    document.addEventListener('keydown', onKey);
    function open() {
      // 첫 방문 인트로(로고 화면)가 끝난 뒤에 띄운다
      if (document.documentElement.classList.contains('st-intro-on')) { setTimeout(open, 800); return; }
      pop.hidden = false; go(0); play();
    }
    setTimeout(open, 1200);
  }

  function initMisc(root) {
    var free = root.querySelector('[data-free-over]'), ship = (window.STORE_CONTENT || {}).shipping;
    if (free && ship && ship.freeBar !== false && ship.freeOver > 0) {
      free.textContent = (ship.freeOver % 10000 === 0 ? ship.freeOver / 10000 + '만원' : ship.freeOver.toLocaleString('ko-KR') + '원') + ' 이상 무료배송 · ';
      free.hidden = false;
    }
  }

  // 신상품 : 섹션을 화면에 고정하고, 고정된 동안 내린 거리만큼 상품 줄을 가로로 민다
  function initRailPin(root) {
    var pin = root.querySelector('[data-rail-pin]');
    if (!pin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var section = pin.closest('.cz-products--pin'), stage = pin.querySelector('.cz-pin__stage');
    var now = pin.querySelector('[data-rail-now]'), total = pin.querySelector('[data-rail-total]');
    var track = null, items = [], dist = 0, lead = -1, raf = 0;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    function measure() {
      track = section.querySelector('.ec-base-product:not([hidden]) .prdList') || section.querySelector('.cz-placeholder:not([hidden])');
      if (!track) return;
      section.classList.add('is-pinned');
      section.style.setProperty('--cz-rail-x', '0px');
      items = Array.from(track.children);
      dist = Math.max(0, track.scrollWidth - track.clientWidth);
      if (dist < 8) { section.classList.remove('is-pinned'); pin.style.height = ''; return; }
      pin.style.height = (stage.offsetHeight + dist) + 'px';
      if (total) total.textContent = pad(items.length);
      update();
    }
    function update() {
      raf = 0;
      if (!dist) return;
      var top = parseFloat(getComputedStyle(stage).top) || 0;
      var p = Math.min(1, Math.max(0, (top - pin.getBoundingClientRect().top) / dist));
      section.style.setProperty('--cz-rail-x', (p * dist).toFixed(1) + 'px');
      section.style.setProperty('--cz-rail-p', Math.max(0.04, p).toFixed(3));
      var i = Math.round(p * (items.length - 1));
      if (now) now.textContent = pad(i + 1);
      if (i !== lead) {
        if (items[lead]) items[lead].classList.remove('is-lead');
        if (items[i]) items[i].classList.add('is-lead');
        lead = i;
      }
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
    var t = null;
    function remeasure() { clearTimeout(t); t = setTimeout(measure, 150); }
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', measure);
    if ('ResizeObserver' in window && track) new ResizeObserver(remeasure).observe(track);
  }

  // 9. 장면 속 상품 : PC 에서는 무대를 고정하고 스크롤한 만큼 장면을 한 장씩 옆으로 넘긴다(장면마다 잠깐 머묾).
  //    사진 속 + 나 상품 줄을 누르면 구매 레이어가 열린다. 상품 정보는 index.html 의 #cz-looks-data.
  function initLooks(root) {
    var sec = root.querySelector('.cz-looks');
    if (!sec) return;
    var data = {};
    try { data = JSON.parse(document.getElementById('cz-looks-data').textContent); } catch (e) {}
    var IMG = 'https://cdn.jsdelivr.net/gh/tlsdmsrud902/pet@0cb86c5/cafe24-assets/products/';
    var html = document.documentElement;

    /* 구매 레이어 */
    var qv = document.getElementById('cz-qv'), lastBtn = null;
    var won = function (n) { return Number(n).toLocaleString('ko-KR') + '원'; };
    function reviewOf(no) {
      try {
        var c = JSON.parse(sessionStorage.getItem('petpia-reviews-v3'));
        var list = (c && c.items || []).filter(function (it) { return String(it.productNo) === String(no); });
        if (!list.length) return '';
        var pts = list.filter(function (it) { return it.point; });
        var avg = pts.length ? pts.reduce(function (s, it) { return s + it.point; }, 0) / pts.length : 0;
        return (avg ? '<b>★ ' + avg.toFixed(1) + '</b> · ' : '') + '리뷰 ' + list.length;
      } catch (e) { return ''; }
    }
    function openQV(no, from) {
      var p = data[no];
      if (!p || !qv) return;
      lastBtn = from || null;
      var img = qv.querySelector('.cz-qv__img img');
      img.src = IMG + p.img + '.jpg'; img.alt = p.name;
      qv.querySelector('.cz-qv__cat').textContent = p.cat;
      qv.querySelector('#cz-qv-name').textContent = p.name;
      qv.querySelector('.cz-qv__price').innerHTML = p.retail
        ? '<em>' + Math.round((1 - p.price / p.retail) * 100) + '%</em><b>' + won(p.price) + '</b><s>' + won(p.retail) + '</s>'
        : '<b>' + won(p.price) + '</b>';
      qv.querySelector('.cz-qv__desc').textContent = p.desc;
      var rv = qv.querySelector('.cz-qv__review'), r = reviewOf(no);
      rv.innerHTML = r; rv.hidden = !r;
      var url = '/product/detail.html?product_no=' + no;
      qv.querySelector('[data-qv-buy]').href = url;
      qv.querySelector('[data-qv-more]').href = url;
      qv.hidden = false;
      html.classList.add('cz-qv-open');
      qv.querySelector('[data-qv-close]').focus({ preventScroll: true });
    }
    function closeQV() {
      if (!qv || qv.hidden) return;
      qv.hidden = true;
      html.classList.remove('cz-qv-open');
      if (lastBtn) lastBtn.focus({ preventScroll: true });
    }
    sec.querySelectorAll('[data-prd]').forEach(function (b) {
      b.addEventListener('click', function () { openQV(b.dataset.prd, b); });
    });
    // 섹션에 가까워지면 레이어에 쓸 상품 사진을 미리 받아 둔다 (처음 열 때 빈 칸 방지)
    var preload = function () { Object.keys(data).forEach(function (k) { new Image().src = IMG + data[k].img + '.jpg'; }); };
    if ('IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { pio.disconnect(); preload(); } }, { rootMargin: '800px 0px' });
      pio.observe(sec);
    } else preload();
    if (qv) {
      qv.querySelector('[data-qv-close]').addEventListener('click', closeQV);
      qv.addEventListener('click', function (e) { if (e.target === qv) closeQV(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeQV(); });
    }

    /* 고정 무대 + 장면 넘김 */
    var pin = sec.querySelector('[data-looks-pin]'), stage = sec.querySelector('.cz-looks__stage');
    var track = sec.querySelector('[data-looks-track]'), looks = Array.from(sec.querySelectorAll('.cz-look'));
    var now = sec.querySelector('[data-looks-now]');
    var wide = window.matchMedia('(min-width:1024px)'), reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var xs = [], dist = 0, active = -1, raf = 0;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    // 장면 사이 구간에서 앞 25%·뒤 25% 는 머물고 가운데에서만 움직인다
    var ease = function (t) { t = Math.min(1, Math.max(0, (t - 0.25) / 0.5)); return t * t * (3 - 2 * t); };
    function setActive(i) {
      if (i === active) return;
      active = i;
      looks.forEach(function (l, k) { l.classList.toggle('is-active', k === i); });
      if (now) now.textContent = pad(i + 1);
    }
    function measure() {
      if (!wide.matches || reduce.matches || looks.length < 2) {
        sec.classList.remove('is-pinned'); pin.style.height = ''; track.style.transform = ''; dist = 0;
        looks.forEach(function (l) { l.classList.add('is-active'); });
        return;
      }
      sec.classList.add('is-pinned');
      track.style.transform = 'none';
      var sw = stage.clientWidth;
      xs = looks.map(function (l) { return l.offsetLeft - (sw - l.offsetWidth) / 2; });
      dist = Math.round(window.innerHeight * 0.85) * (looks.length - 1);
      pin.style.height = (stage.offsetHeight + dist) + 'px';
      active = -1;
      update();
    }
    function update() {
      raf = 0;
      if (!dist) return;
      var top = parseFloat(getComputedStyle(stage).top) || 0;
      var p = Math.min(1, Math.max(0, (top - pin.getBoundingClientRect().top) / dist));
      var f = p * (looks.length - 1), i = Math.min(looks.length - 2, Math.floor(f)), e = ease(f - i);
      var x = xs[i] + (xs[i + 1] - xs[i]) * e;
      track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
      setActive(Math.round(i + e));
    }
    var t = null;
    function remeasure() { clearTimeout(t); t = setTimeout(measure, 150); }
    measure();
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', measure);
    wide.addEventListener('change', measure);
    looks.forEach(function (l) { var im = l.querySelector('img'); if (im && !im.complete) im.addEventListener('load', remeasure, { once: true }); });
  }

  // 8. 사이즈 가이드 3D 강아지 : 화면에 가까워지면 three.js 를 불러와 입체 강아지를 그린다.
  //    끌어서 돌려 볼 수 있고, 치수 자리(1 목둘레 · 2 가슴둘레 · 3 등길이)가 몸 위에 입체로 표시된다.
  //    오른쪽 설명에 마우스를 올리면 그 자리가 강조된다. WebGL 을 못 쓰면 원래 SVG 그림이 그대로 남는다.
  function initSize3D(root) {
    var art = root.querySelector('.cz-size__art'), mount = art && art.querySelector('[data-size-3d]');
    if (!mount) return;
    var steps = Array.from(root.querySelectorAll('.cz-size__steps li'));
    var pins = Array.from(art.querySelectorAll('[data-pin]'));
    var started = false;
    function start() {
      if (started) return;
      started = true;
      var probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;
      // 동적 import 를 문자열로 감싸 카페24 스크립트 압축기가 문법을 건드리지 않게 한다
      var load = new Function('u', 'return import(u)');
      load('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js').then(build).catch(function () {});
    }
    if ('IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { sio.disconnect(); start(); } }, { rootMargin: '500px 0px' });
      sio.observe(art);
    } else start();

    function build(THREE) {
      var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(28, 1.3, 0.1, 100);
      scene.add(new THREE.HemisphereLight(0xfff6ea, 0xcdb9a4, 1.7));
      var sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.position.set(-3, 5, 5); scene.add(sun);
      var rim = new THREE.DirectionalLight(0xffe0cc, 0.8); rim.position.set(4, 2.5, -4); scene.add(rim);

      var mat = function (hex, rough) { return new THREE.MeshStandardMaterial({ color: hex, roughness: rough == null ? 0.82 : rough, metalness: 0 }); };
      var fur = mat(0xf5d7b5), furDark = mat(0xebc59d), earMat = mat(0xe3b88c), muzzle = mat(0xfbe9d4), ink = mat(0x3b2f28, 0.35), pink = mat(0xf2a79c);
      var guideMat = [0x7fa283, 0xe8866a, 0xe8866a].map(function (hex) {
        return new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5, emissive: hex, emissiveIntensity: 0.12 });
      });

      var dog = new THREE.Group(); scene.add(dog);
      function add(geo, m, x, y, z, parent) { var mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); (parent || dog).add(mesh); return mesh; }
      function orient(obj, dir) { obj.quaternion.setFromUnitVectors(V(0, 0, 1), dir.clone().normalize()); }

      // 몸통 · 다리
      var body = add(new THREE.CapsuleGeometry(0.62, 1.25, 10, 28), fur, 0.1, 0.35, 0);
      body.rotation.z = Math.PI / 2;
      [[-0.55, 0.32, fur], [-0.55, -0.32, fur], [0.82, 0.32, furDark], [0.82, -0.32, furDark]].forEach(function (l) {
        add(new THREE.CapsuleGeometry(0.17, 0.5, 6, 16), l[2], l[0], -0.45, l[1]);
      });
      // 꼬리 (밑동을 축으로 흔든다)
      var tail = new THREE.Group(); tail.position.set(1.3, 0.55, 0); dog.add(tail);
      var tailCurve = new THREE.CatmullRomCurve3([V(0, 0, 0), V(0.34, 0.28, 0), V(0.42, 0.74, 0)]);
      add(new THREE.TubeGeometry(tailCurve, 24, 0.085, 12), fur, 0, 0, 0, tail);
      add(new THREE.SphereGeometry(0.085, 14, 12), fur, 0.42, 0.74, 0, tail);
      // 머리
      // 머리는 보는 사람 쪽으로 살짝 돌려 얼굴이 보이게 한다
      var head = new THREE.Group(); head.position.set(-1.05, 1.08, 0); head.rotation.y = 0.6; dog.add(head);
      add(new THREE.SphereGeometry(0.62, 36, 28), fur, 0, 0, 0, head);
      add(new THREE.SphereGeometry(0.3, 24, 18), muzzle, -0.5, -0.18, 0, head).scale.set(0.9, 0.75, 1.1);
      add(new THREE.SphereGeometry(0.1, 18, 14), ink, -0.77, -0.1, 0, head);
      var eyes = [0.24, -0.24].map(function (z) { return add(new THREE.SphereGeometry(0.085, 16, 12), ink, -0.5, 0.15, z, head); });
      var shine = mat(0xffffff, 0.2);
      eyes.forEach(function (e) { add(new THREE.SphereGeometry(0.026, 10, 8), shine, -0.07, 0.035, 0.03, e); });
      [0.37, -0.37].forEach(function (z) { add(new THREE.SphereGeometry(0.1, 16, 12), pink, -0.43, -0.12, z, head).scale.set(0.4, 0.7, 1); });
      var mouth = add(new THREE.TorusGeometry(0.09, 0.018, 8, 20, Math.PI), ink, -0.72, -0.3, 0, head);
      mouth.rotation.set(0, Math.PI / 2, Math.PI);
      var ears = [1, -1].map(function (s) {
        var e = add(new THREE.SphereGeometry(0.3, 22, 16), earMat, 0.06, 0.1, 0.56 * s, head);
        e.scale.set(0.55, 1.25, 0.35); e.rotation.x = -0.35 * s;
        return e;
      });

      // 치수 표시 : 1 목걸이 · 2 가슴 점선 고리 · 3 등 점선
      var collar = add(new THREE.TorusGeometry(0.5, 0.075, 14, 48), guideMat[0], -0.8, 0.66, 0);
      orient(collar, V(-0.55, 0.8, 0));
      var chest = new THREE.Group(); chest.position.set(-0.32, 0.35, 0); orient(chest, V(1, 0, 0)); dog.add(chest);
      for (var i = 0; i < 16; i++) {
        var dash = add(new THREE.TorusGeometry(0.7, 0.032, 8, 6, (Math.PI * 2 / 16) * 0.55), guideMat[1], 0, 0, 0, chest);
        dash.rotation.z = i * Math.PI * 2 / 16;
      }
      var back = new THREE.Group(); back.position.set(0, 1.13, 0); dog.add(back);
      for (var k = 0; k < 9; k++) {
        var seg = add(new THREE.CapsuleGeometry(0.03, 0.1, 4, 8), guideMat[2], -0.62 + k * 0.22, 0, 0, back);
        seg.rotation.z = Math.PI / 2;
      }
      [-0.72, 1.18].forEach(function (x) { add(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 10), guideMat[2], x, 0, 0, back); });
      var guides = [[collar], chest.children, back.children];
      var anchors = [V(-0.92, 0.42, 0.42), V(-0.32, 0.05, 0.7), V(0.24, 1.13, 0)];

      // 바닥 그림자 (부드러운 원)
      var cv = document.createElement('canvas'); cv.width = cv.height = 128;
      var g2 = cv.getContext('2d'), grd = g2.createRadialGradient(64, 64, 4, 64, 64, 62);
      grd.addColorStop(0, 'rgba(150,196,164,.75)'); grd.addColorStop(1, 'rgba(150,196,164,0)');
      g2.fillStyle = grd; g2.fillRect(0, 0, 128, 128);
      var shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.99; scene.add(shadow);

      /* 크기 */
      var W = 1, H = 1;
      function resize() {
        W = mount.clientWidth || 1; H = mount.clientHeight || 1;
        renderer.setSize(W, H, false);
        camera.aspect = W / H;
        camera.position.set(0.5, 1.5, camera.aspect < 1.15 ? 9.6 : 8.2);
        camera.lookAt(0.05, 0.2, 0);
        camera.updateProjectionMatrix();
      }
      resize();
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(mount); else window.addEventListener('resize', resize);

      var clock = new THREE.Clock();

      /* 강조 : 설명 줄 · 번호에 올리면 그 자리만 밝게. 가만히 있으면 1 → 2 → 3 차례로 */
      var focus = -1, hovering = false, cycleAt = 0;
      function setFocus(n) {
        focus = n;
        pins.forEach(function (p, j) { p.classList.toggle('is-on', j === n); });
        steps.forEach(function (s, j) { s.classList.toggle('is-on', j === n); });
      }
      function hoverOn(j) { hovering = true; setFocus(j); }
      function hoverOff() { hovering = false; cycleAt = clock.getElapsedTime() + 2; }
      steps.forEach(function (s, j) { s.addEventListener('mouseenter', function () { hoverOn(j); }); s.addEventListener('mouseleave', hoverOff); });
      pins.forEach(function (p, j) {
        p.addEventListener('mouseenter', function () { hoverOn(j); });
        p.addEventListener('mouseleave', hoverOff);
        p.addEventListener('click', function () { setFocus(j); });
      });

      /* 끌어서 돌리기 */
      var base = 0.5, rotY = base, rotX = 0, dragging = false, lastX = 0, lastY = 0, idleAt = 0;
      var cvs = renderer.domElement;
      cvs.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; lastY = e.clientY; cvs.setPointerCapture(e.pointerId); art.classList.add('is-grab'); });
      cvs.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        rotY += (e.clientX - lastX) * 0.012;
        rotX = Math.max(-0.35, Math.min(0.35, rotX + (e.clientY - lastY) * 0.006));
        lastX = e.clientX; lastY = e.clientY;
      });
      function endDrag() { if (!dragging) return; dragging = false; idleAt = clock.getElapsedTime() + 2.5; art.classList.remove('is-grab'); art.classList.add('is-played'); }
      cvs.addEventListener('pointerup', endDrag);
      cvs.addEventListener('pointercancel', endDrag);

      /* 그리기 : 화면에 보일 때만 */
      var visible = true, nextBlink = 2, v3 = new THREE.Vector3(), raf = 0;
      function frame() {
        var t = clock.getElapsedTime();
        if (!reduce) {
          tail.rotation.y = Math.sin(t * 9) * 0.55; tail.rotation.z = Math.sin(t * 4.5) * 0.08;
          head.rotation.z = Math.sin(t * 1.2) * 0.08; head.rotation.x = Math.sin(t * 0.8) * 0.12; head.rotation.y = 0.6 + Math.sin(t * 0.7) * 0.15;
          ears.forEach(function (e, j) { e.rotation.z = Math.sin(t * 1.2 + j) * 0.12; });
          var br = 1 + Math.sin(t * 2.2) * 0.015; body.scale.set(1, br, br);
          if (t > nextBlink) {
            eyes.forEach(function (e) { e.scale.y = 0.12; });
            if (t > nextBlink + 0.12) { eyes.forEach(function (e) { e.scale.y = 1; }); nextBlink = t + 2.5 + Math.random() * 2.5; }
          }
          if (!dragging && t > idleAt) { rotY += ((base + Math.sin(t * 0.5) * 0.28) - rotY) * 0.04; rotX += (0 - rotX) * 0.05; }
          if (!hovering && t > cycleAt) { setFocus((focus + 1) % 3); cycleAt = t + 2.6; }
        }
        dog.rotation.y = rotY; dog.rotation.x = rotX;
        dog.position.y = reduce ? 0 : Math.abs(Math.sin(t * 2.2)) * 0.03;
        guides.forEach(function (list, j) {
          var on = focus === j;
          guideMat[j].emissiveIntensity = on ? 0.55 + Math.sin(t * 6) * 0.25 : (focus < 0 ? 0.12 : 0.04);
          list.forEach(function (m) { m.scale.setScalar(on ? 1.12 : 1); });
        });
        renderer.render(scene, camera);
        anchors.forEach(function (a, j) {
          v3.copy(a); dog.localToWorld(v3); v3.project(camera);
          if (pins[j]) pins[j].style.transform = 'translate(' + ((v3.x + 1) / 2 * W).toFixed(1) + 'px,' + ((1 - v3.y) / 2 * H).toFixed(1) + 'px)';
        });
      }
      function loop() {
        if (raf) return;
        var tick = function () { raf = 0; if (!visible) return; frame(); raf = requestAnimationFrame(tick); };
        tick();
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) loop(); }).observe(art);
      }
      frame();
      art.classList.add('is-3d');
      loop();
    }
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
    initWorld(root);
    initPopup();
    fillPlaceholders(root);
    initFinder(root);
    initHotspots(root);
    initLooks(root);
    initSize3D(root);
    initStarter(root);
    initRails(root);
    initRailPin(root);
    initMisc(root);
    initReveal(root);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
