const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../skin1');
const pages=['/index.html','/layout/basic/header.html','/layout/basic/footer.html','/layout/basic/sidebar.html','/product/list.html','/product/search.html','/board/product/list.html','/board/free/list.html','/member/login.html','/member/agreement.html','/myshop/index.html','/order/basket.html'];
const missing=[]; const links=new Set();
for(const file of pages){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 for(const m of source.matchAll(/(?:href|src)="(\/[^"{}]+)"|<!--@(?:import|css|js)\((\/[^)]+)\)-->/g)){
  const link=m[1]||m[2];if(link.startsWith('//')||link.includes("'+"))continue;
  const pathname=link.split(/[?#]/)[0]; if(!pathname || pathname==='/')continue;
  if(!fs.existsSync(path.join(root,pathname)))missing.push({file,link});
  if(m[1]&&pathname.endsWith('.html'))links.add(link);
 }
}
(async()=>{const responses=await Promise.all([...links].map(async link=>{try{const r=await fetch('http://127.0.0.1:8765'+link);return{link,status:r.status}}catch(e){return{link,error:e.message}}}));console.log(JSON.stringify({missing,checked:responses.length,failed:responses.filter(r=>r.status!==200)},null,2));})();
