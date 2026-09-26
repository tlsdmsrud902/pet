const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../skin1');
const types = {'.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.html':'text/html'};
function read(p){return fs.readFileSync(path.join(root,p),'utf8');}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function expand(s, depth=0){
 if(depth>12)return '';
 return s.replace(/<!--@import\(([^)]+)\)-->/g,(_,p)=>{
   if(p==='/product/list_product.html') return previewCards();
   try{return expand(read(p),depth+1)}catch{return ''}
 }).replace(/<!--@css\(([^)]+)\)-->/g,'<link rel="stylesheet" href="$1">')
 .replace(/<!--@js\(([^)]+)\)-->/g,'<script src="$1"></script>');
}
function previewCards(){
 const products=[['product-bed.png','포근한 코듀로이 베드','침대'],['product-bowl.png','세이지 데일리 식기','식기'],['product-walk-kit.png','코랄 산책 하네스 키트','하네스'],['category-cat.png','고양이의 아늑한 공간','고양이'],['hero-editorial-v2.png','우리 집 리빙 컬렉션','쿠션'],['banner-picnic.png','주말 피크닉 준비','산책'],['event-birthday.png','특별한 날의 선물','선물'],['product-toy.png','즐거운 놀이 시간','장난감'],['category-walk.png','데일리 워크 컬렉션','하네스'],['products-flatlay.png','편안한 반려생활','생활용품']];
 return products.map(([im,n,word])=>'<li><div class="prdList__item"><div class="thumbnail"><a href="/product/search.html?keyword='+encodeURIComponent(word)+'"><img src="/SkinImg/pet/'+im+'" alt="'+n+'" loading="lazy"></a></div><div class="description"><div class="name"><a href="/product/search.html?keyword='+encodeURIComponent(word)+'">'+n+'</a></div><p style="font-size:11px;color:#777;margin-top:6px">상품 준비 중 · 연출 이미지</p></div></div></li>').join('');
}
http.createServer((req,res)=>{
 res.setHeader('Cache-Control','no-store');
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/exec/front/Product/SubCategory'){res.setHeader('Content-Type','application/json');return res.end('[]')}
 let name=decodeURIComponent(url.pathname);
 if(name==='/') name='/index.html';
 if(name.endsWith('.html')){
  let s;
  try{s=read(name)}catch{res.writeHead(404);return res.end('페이지를 찾을 수 없습니다.')}
  const layout=s.match(/<!--@layout\(([^)]+)\)-->/);
  const layoutPath=layout && fs.existsSync(path.join(root,layout[1])) ? layout[1] : '/layout/basic/layout.html';
  s=s.replace(/<!--@layout\([^)]+\)-->/,'');
  if(name.startsWith('/board/')){
    const title=({'4':'상품 후기','6':'상품 문의','1':'공지사항'})[url.searchParams.get('board_no')]||'커뮤니티';
    s=s.replace(/<tbody module="board_(?:notice|fixed|list)_\d+"[^>]*>[\s\S]*?<\/tbody>/gi,'')
     .replace(/\{\$board_(?:title|name)\}/g,title)
     .replace(/\{\$empty_message\}/g,'등록된 게시물은 카페24 쇼핑몰 연결 후 표시됩니다.');
  }
  if(name==='/product/search.html'){
    s=s.replace(/<div module="Search_Result"[\s\S]*?(?=<div module="search_paging")/i,'<div module="Search_Result" class="section ec-base-product"><p style="margin:20px 0;color:#777">상품 컬렉션 미리보기</p><ul class="prdList grid4"><!--@import(/product/list_product.html)--></ul></div>');
  }
  s=expand(read(layoutPath).replace('<!--@contents-->',s));
  // Cafe24 injects jQuery, module classes and form fields on its own server.
  // Recreate those presentation dependencies only in this local preview.
  s=s.replace('<head>','<head><script src="https://code.jquery.com/jquery-3.7.1.min.js"></script><script>window.EC$=window.jQuery;</script>');
  s=s.replace(/<([a-z][\w-]*)([^>]*?)\bmodule="([^"]+)"([^>]*)>/gi,(_,tag,before,module,after)=>{
    let attrs=before+'module="'+module+'"'+after;
    const cls='xans-'+module.toLowerCase().replace(/_/g,'-').replace(/-\d+$/,'');
    attrs=/\bclass="/.test(attrs)?attrs.replace(/\bclass="/,'class="'+cls+' '):attrs+' class="'+cls+'"';
    return '<'+tag+attrs+'>';
  });
  const keyword=escapeHtml(url.searchParams.get('keyword')||'');
  s=s.replace(/\{\$searchdata_keywordform\}/g,'<input type="search" name="keyword" value="'+keyword+'" placeholder="어떤 상품을 찾으세요?" aria-label="상품 검색어">')
    .replace(/\{\$form\.keyword\}/g,'<input type="search" name="keyword" id="keyword" placeholder="검색어를 입력하세요" aria-label="상품 검색어">')
    .replace(/\{\$title_text_or_image\}/g,url.searchParams.get('cate_no')==='27'?'SALE':'전체 상품');
  s=s.replace(/\{\$mall_name\}/g,'PETPIA').replace(/\{\$[^}]+\}/g,'');
  s=s.replace('</body>',`<script>
  document.addEventListener('DOMContentLoaded',function(){
    var search=document.querySelector('.xans-layout-searchheader');
    if(search){var input=search.querySelector('input[name=keyword]');var btn=search.querySelector('.btnSearch');
      function submit(){if(input && input.value.trim())location.href='/product/search.html?keyword='+encodeURIComponent(input.value.trim());}
      if(btn)btn.addEventListener('click',submit);
      if(input)input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();submit();}});
    }
  });</script></body>`);
  s=s.replace('</head>','<style>[module="Layout_multishopShipping"],.xans-layout-multishopshipping{display:none!important}</style></head>');
  if(name==='/product/search.html') s=s.replace('</head>','<style>#searchContent,.xans-product-searchconditiondata,.xans-product-searchdata .keywordArea,.xans-product-searchdata .noData,.xans-product-searchdata .display_tablet_only,.xans-search-paging,.btnSearchOption{display:none!important}.searchField{margin-bottom:24px!important}.searchResult{padding-top:15px!important}.xans-search-result .prdList{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:32px 20px}.xans-search-result .prdList>li{width:auto!important;margin:0!important}.xans-search-result .thumbnail img{aspect-ratio:1;object-fit:cover}.xans-search-result .description{padding:15px 0;text-align:left}@media(max-width:767px){.xans-search-result .prdList{grid-template-columns:repeat(2,minmax(0,1fr))}}</style></head>');
  s=s.replace(/<[^>]+module="Layout_stateLogon"[^>]*>[\s\S]*?<\/a>/g,'');
  if(name.startsWith('/board/'))s=s.replace('</head>','<style>.xans-board-paging,.xans-board-search,.xans-board-function,.xans-board-movement{display:none!important}</style></head>');
  res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(s);
 }
 const file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Local preview: Cafe24 server functionality is unavailable.')}res.setHeader('Content-Type',(types[path.extname(file)]||'application/octet-stream')+(types[path.extname(file)]?.includes('text')?'; charset=utf-8':''));res.end(data)});
}).listen(8765,'127.0.0.1',()=>console.log('Preview ready: http://127.0.0.1:8765'));
