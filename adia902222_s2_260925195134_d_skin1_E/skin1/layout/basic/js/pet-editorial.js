/* PETPIA. Video-first scroll-world segment, dwell and rAF mapping.
   Real Cafe24 product modules remain authoritative. */
(function () {
  var sources = [
    '/SkinImg/pet/product-bed.png',
    '/SkinImg/pet/product-bowl.png',
    '/SkinImg/pet/product-walk-kit.png',
    '/SkinImg/pet/category-cat.png',
    '/SkinImg/pet/hero-editorial-v2.png',
    '/SkinImg/pet/banner-picnic.png',
    '/SkinImg/pet/event-birthday.png',
    '/SkinImg/pet/product-toy.png',
    '/SkinImg/pet/category-walk.png',
    '/SkinImg/pet/products-flatlay.png'
  ];
  var sets = [
    ['건강한 한 끼를 위한 선택', '매일의 사료와 간식'],
    ['새로운 반려생활 아이템', '곧 만나보실 수 있어요'],
    ['가장 많이 찾는 상품', '인기 아이템 준비 중']
  ];
  var names = ['포근한 코듀로이 베드','매일 쓰는 데일리 식기','가벼운 산책 하네스','고양이의 아늑한 공간','우리 집 휴식 컬렉션','주말 피크닉 준비','특별한 날의 선물','즐거운 놀이 시간','외출을 위한 작은 준비','편안한 반려생활'];
  function placeholder(card, index, copy) {
    return '<a class="pe-placeholder-card" href="/product/search.html"><figure><img src="' +
      sources[index % sources.length] + '" alt="" loading="lazy"></figure><h3>' +
      names[index] + '</h3><p>상품 준비 중 · 이미지 연출 예시</p></a>';
  }
  function init() {
    var root = document.querySelector('.pet-editorial');
    if (!root) return;
    root.querySelectorAll('.pe-products').forEach(function (section, sectionIndex) {
      var list = section.querySelector('.prdList');
      var fallback = section.querySelector('[data-pe-placeholder]');
      if (!fallback) return;
      if (!list || !list.querySelector('li')) {
        if (list) list.closest('.ec-base-product').hidden = true;
        fallback.hidden = false;
        fallback.innerHTML = Array.from({length: 10}, function (_, index) {
          return placeholder(section, index, sets[sectionIndex] || sets[0]);
        }).join('');
      } else {
        fallback.remove();
      }
    });

    var form = root.querySelector('.pe-finder-form');
    if (form) {
      var updateFinder = function () {
        var pet = form.querySelector('[name=pet]:checked').value === 'cat' ? '고양이' : '강아지';
        var moment = form.querySelector('[name=moment]:checked').value;
        var keywords = {rest:'침대',play:'장난감',meal:'식기'};
        var descriptions = {rest:'포근한 휴식을 위한 침대·쿠션을',play:'즐거운 놀이를 위한 장난감을',meal:'맛있는 한 끼를 위한 식기를'};
        form.querySelector('[name=keyword]').value = pet + ' ' + keywords[moment];
        form.querySelector('.pe-finder-result').textContent = pet + '의 ' + descriptions[moment] + ' 추천해요.';
      };
      form.addEventListener('change', updateFinder);
      form.addEventListener('submit', function (e) {
        e.preventDefault(); updateFinder();
        location.href = '/product/search.html?keyword=' + encodeURIComponent(form.querySelector('[name=keyword]').value);
      });
      updateFinder();
    }
    var hotspots = root.querySelectorAll('.pe-hotspot');
    function closeHotspots() { hotspots.forEach(function (b) { b.setAttribute('aria-expanded','false'); document.getElementById(b.getAttribute('aria-controls')).hidden = true; }); }
    hotspots.forEach(function (button) {
      button.addEventListener('click', function () {
        var open = button.getAttribute('aria-expanded') !== 'true';
        closeHotspots(); button.setAttribute('aria-expanded', String(open));
        document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
      });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeHotspots(); });

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var track = root.querySelector('[data-scroll-hero]');
    var hero = track.querySelector('.pe-hero');
    var images = Array.from(root.querySelectorAll('[data-world-image]'));
    var leadVideo = root.querySelector('.pe-world-video');
    if (leadVideo) {
      leadVideo.muted = true;
      leadVideo.defaultMuted = true;
      leadVideo.setAttribute('muted','');
      var startLeadVideo = function () {
        var promise = leadVideo.play();
        if (promise && promise.catch) promise.catch(function () {});
      };
      leadVideo.addEventListener('canplay', startLeadVideo, { once:true });
      startLeadVideo();
    }
    var copies = Array.from(root.querySelectorAll('[data-world-copy]'));
    var route = Array.from(root.querySelectorAll('[data-world-jump]'));
    var story = root.querySelector('.pe-story');
    var clamp = function (n) { return Math.max(0,Math.min(1,n)); };
    var smooth = function (n) { n=clamp(n); return n*n*(3-2*n); };
    var active = -1, scheduled = false;
    function drawScene(position) {
      var index = Math.min(images.length-1,Math.floor(position + .5));
      hero.style.setProperty('--hero-progress',position/Math.max(1,images.length-1));
      images.forEach(function (img,i) {
        var alpha = 1 - smooth((Math.abs(position-i)-.28)/.44);
        img.style.opacity = String(alpha);
        img.setAttribute('aria-hidden',String(i!==index));
        img.style.transform = reduce.matches ? 'none' : 'scale(' + (1.02 + clamp(position-i+.5)*.09) + ')';
        if(img.tagName==='VIDEO'){if(i===index){var playing=img.play();if(playing&&playing.catch)playing.catch(function(){});}else img.pause();}
      });
      copies.forEach(function (copy,i) {
        var alpha = 1 - smooth((Math.abs(position-i)-.22)/.35);
        copy.style.opacity = String(alpha);
        copy.style.transform = reduce.matches ? 'none' : 'translateY(' + ((i-position)*24) + 'px)';
        copy.style.pointerEvents = i===index ? 'auto' : 'none';
        copy.inert = i!==index;
        copy.setAttribute('aria-hidden',String(i!==index));
      });
      if (index!==active) { active=index; route.forEach(function(b,i){b.setAttribute('aria-pressed',String(i===index));}); root.querySelector('.pe-image-label').textContent=['PETPIA FILM / 01','THE EVERYDAY COLLECTION / 02','THE OUTDOOR COLLECTION / 03','THE HOME COLLECTION / 04'][index]; }
    }
    function frame() {
      scheduled=false;
      if (reduce.matches) return;
      var bounds=track.getBoundingClientRect();
      var top=parseFloat(getComputedStyle(hero).top)||0;
      var distance=Math.max(1,track.offsetHeight-hero.offsetHeight);
      var progress=clamp((top-bounds.top)/distance);
      hero.style.setProperty('--hero-progress',progress);
      drawScene(progress*Math.max(1,images.length-1));
      if (story) {
        var r=story.getBoundingClientRect();
        if(r.top<innerHeight && r.bottom>0) story.style.setProperty('--story-y',((clamp((innerHeight-r.top)/(innerHeight+r.height))-.5)*35)+'px');
      }
    }
    function requestFrame(){if(!scheduled){scheduled=true;requestAnimationFrame(frame);}}
    route.forEach(function(button,i){button.addEventListener('click',function(){
      if(reduce.matches){drawScene(i);return;}
      var top=parseFloat(getComputedStyle(hero).top)||0;
      var start=track.getBoundingClientRect().top+scrollY-top;
      window.scrollTo({top:Math.max(0,start+(track.offsetHeight-hero.offsetHeight)*i/Math.max(1,route.length-1)),behavior:'smooth'});
    });});
    window.addEventListener('scroll',requestFrame,{passive:true});
    window.addEventListener('resize',requestFrame,{passive:true});
    reduce.addEventListener('change',function(){drawScene(0);requestFrame();});
    drawScene(0);requestFrame();
    if ('IntersectionObserver' in window && !reduce.matches) {
      var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.remove('is-entering');observer.unobserve(entry.target);}});},{threshold:.08});
      root.querySelectorAll('.pe-heading,.pe-collection,.pe-finder,.pe-event,.pe-guide').forEach(function(el){
        if(el.getBoundingClientRect().top>innerHeight){el.classList.add('pe-reveal','is-entering');observer.observe(el);}
      });
    }
  }
  function initStarter() {
    var list=document.querySelector('[data-starter-list]'); if(!list)return;
    var pet='dog', saved={dog:[],cat:[]};
    try{var data=JSON.parse(localStorage.getItem('petedit-starter-v1'));if(data&&Array.isArray(data.dog)&&Array.isArray(data.cat))saved=data;}catch(e){}
    var items={dog:['식기와 물그릇','편안한 침대','하네스와 리드줄','배변패드','크기에 맞는 장난감','이동장'],cat:['식기와 물그릇','숨을 수 있는 침대','고양이 화장실','고양이 모래','스크래처','이동장']};
    function update(){document.querySelector('[data-starter-status]').textContent=saved[pet].length+' / 6 준비 완료 · 이 기기에 저장됩니다.';try{localStorage.setItem('petedit-starter-v1',JSON.stringify(saved));}catch(e){document.querySelector('[data-starter-status]').textContent=saved[pet].length+' / 6 준비 완료 · 현재 화면에서만 유지됩니다.';}}
    function render(){list.innerHTML='';items[pet].forEach(function(name,i){var row=document.createElement('label'), input=document.createElement('input'),text=document.createElement('span'),link=document.createElement('a');input.type='checkbox';input.checked=saved[pet].indexOf(i)>-1;text.textContent=name;link.textContent='상품 보기 ↗';link.href='/product/search.html?keyword='+encodeURIComponent(name);input.addEventListener('change',function(){saved[pet]=saved[pet].filter(function(n){return n!==i;});if(input.checked)saved[pet].push(i);update();});row.append(input,text,link);list.appendChild(row);});update();}
    document.querySelectorAll('[data-starter-pet]').forEach(function(button){button.addEventListener('click',function(){pet=button.dataset.starterPet;document.querySelectorAll('[data-starter-pet]').forEach(function(b){b.setAttribute('aria-pressed',String(b===button));});render();});});
    document.querySelector('[data-starter-reset]').addEventListener('click',function(){saved[pet]=[];render();});render();
    document.querySelectorAll('.pe-live-reviews li').forEach(function(li){var a=li.querySelector('a');if(!a||!a.textContent.trim()||a.textContent.indexOf('{$')!==-1)li.remove();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initStarter);else initStarter();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
