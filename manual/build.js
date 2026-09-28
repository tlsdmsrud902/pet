// PETPIA 스킨 수정 설명서 — HTML 생성 후 Chrome 으로 PDF 출력
// node build.js  →  manual.html, PETPIA-스킨-수정-설명서.pdf
const fs = require('fs');
const path = require('path');
const SHOTS = path.join(__dirname, 'shots');

// ---------- JPEG 크기 읽기 ----------
function jpgSize(file) {
  const b = fs.readFileSync(file); let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xFF) { i++; continue; }
    const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
    i += 2 + len;
  }
  throw new Error('size ' + file);
}

// ---------- 조각 도우미 ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* fig('파일', {crop:[x,y,w,h], m:[[번호,x,y]], box:[[x,y,w,h]], cap:'설명', h:'mm 높이 제한'}) — 좌표는 원본 이미지 픽셀 */
function fig(name, o = {}) {
  const { w: iw, h: ih } = jpgSize(path.join(SHOTS, name + '.jpg'));
  const [cx, cy, cw, ch] = o.crop || [0, 0, iw, ih];
  const pct = (v, t) => (v / t * 100).toFixed(3) + '%';
  if (!fs.existsSync(path.join(SHOTS, name + ".jpg"))) throw new Error("no shot " + name);
  /* 번호 표시 : [n, x, y, 방향]  |  [n, 'b', 상자번호, 방향]  |  [n, 'L', y] (그림 왼쪽 바깥, 코드 줄 표시용)
     방향 l=점 왼쪽(기본) r=오른쪽 t=위 b=아래 c=점 위에 */
  const B = o.box || [];
  const marks = (o.m || []).map(mk => {
    let [n, a, b, dir] = mk, x, y;
    if (a === 'L') { x = cx; y = b; dir = 'l'; }
    else if (a === 'b') {
      const [bx, by, bw, bh] = B[b]; dir = dir || 'l';
      x = dir === 'l' ? bx : dir === 'r' ? bx + bw : bx + bw / 2;
      y = dir === 't' ? by : dir === 'b' ? by + bh : by + bh / 2;
    } else { x = a; y = b; dir = dir || 'l'; }
    return `<b class="mk d-${dir}" style="left:${pct(x - cx, cw)};top:${pct(y - cy, ch)}">${n}</b>`;
  }).join('');
  const boxes = B.map(([x, y, w, h]) => `<i class="bx" style="left:${pct(x - cx, cw)};top:${pct(y - cy, ch)};width:${pct(w, cw)};height:${pct(h, ch)}"></i>`).join('');
  const maxW = o.h ? `max-width:calc(${o.h} * ${cw / ch});` : o.w ? `max-width:${o.w};` : '';
  return `<figure class="fig${o.cls ? ' ' + o.cls : ''}" style="${maxW}"><div class="shotwrap" style="aspect-ratio:${cw}/${ch}"><div class="shot"><img src="shots/${name}.jpg" style="width:${pct(iw, cw)};left:${pct(-cx, cw)};top:${pct(-cy, ch)}">${boxes}</div>${marks}</div>${o.cap ? `<figcaption>${o.cap}</figcaption>` : ''}</figure>`;
}
const steps = arr => `<ol class="steps">${arr.map(s => {
  if (!Array.isArray(s)) return `<li class="plain"><b class="num num-plain">›</b><div>${s}</div></li>`;
  return `<li><b class="num">${s[0]}</b><div>${s[1]}</div></li>`;
}).join('')}</ol>`;
const tip = t => `<div class="tip"><b>💡 꿀팁</b><div>${t}</div></div>`;
const warn = t => `<div class="warn"><b>⚠️ 조심</b><div>${t}</div></div>`;
const note = t => `<div class="note">${t}</div>`;
const code = (label, lines) => `<div class="code"><span class="code-lab">${label}</span><pre>${lines}</pre></div>`;
const hl = s => `<mark>${esc(s)}</mark>`;
const swap = (before, after, file) => `<div class="swap"><div class="sw-col"><span class="sw-lab">찾을 내용</span><code>${esc(before)}</code></div><span class="sw-arrow">→</span><div class="sw-col"><span class="sw-lab">바꿀 내용</span><code>${esc(after)}</code></div>${file ? `<div class="sw-file">열 파일 : <b>${file}</b></div>` : ''}</div>`;
const tool = t => ({ easy: '<span class="tag t-easy">Easy 편집</span>', sde: '<span class="tag t-sde">스마트디자인 편집창</span>', up: '<span class="tag t-up">파일업로더</span>', adm: '<span class="tag t-adm">관리자 메뉴</span>', auto: '<span class="tag t-auto">자동</span>' }[t]);
const tbl = (head, rows, cls) => `<table class="tbl ${cls || ''}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const two = (a, b, ratio) => `<div class="two" style="grid-template-columns:${ratio || '1fr 1fr'}"><div>${a}</div><div>${b}</div></div>`;

// ---------- 장 ----------
const CH = {
  0: { name: '시작하기', color: '#3b6fd8' },
  1: { name: '기본 기술', color: '#e0782f' },
  2: { name: '메인 페이지', color: '#2f9a6a' },
  3: { name: '상품 · 분류 · 진열', color: '#8a55c9' },
  4: { name: '게시판', color: '#c2477a' },
  5: { name: '세일 페이지', color: '#d24a3a' },
  6: { name: '부록', color: '#5b6573' },
};

const P = []; // 페이지 목록
const page = (ch, id, title, body, opt = {}) => P.push({ ch, id, title, body, toc: opt.toc !== false, sub: opt.sub });

require('./pages.js')({ page, fig, steps, tip, warn, note, code, hl, swap, tool, tbl, two, esc });

/* ======================================================================
   HTML 조립
   ====================================================================== */
const total = P.length + 1;
P.forEach((p, i) => { p.no = i + 2; });
const tocGroups = Object.keys(CH).map(k => {
  const items = P.filter(p => p.ch == k && p.toc);
  return `<div class="toc-ch"><div class="toc-chname" style="--c:${CH[k].color}"><span>${Number(k) === 6 ? '부록' : k === '0' ? '0장' : k + '장'}</span>${CH[k].name}</div>
  ${items.map(p => `<a class="toc-item" href="#${p.id}"><span>${p.title}</span><i></i><b>${p.no}</b></a>`).join('')}</div>`;
}).join('');

const tocPage = `<section class="page toc" id="toc">
  <header class="cover">
    <div class="cover-badge">PETPIA 스킨 · 카페24</div>
    <h1>내 쇼핑몰로 바꾸는<br><span>쉬운 수정 설명서</span></h1>
    <p>사진과 글자를 바꾸는 방법을 그림으로 차근차근 알려 드려요. 아래 제목을 누르면 그 쪽으로 바로 가요.</p>
  </header>
  <div class="toc-grid">${tocGroups}</div>
  <footer class="pg-foot"><span>PETPIA 스킨 수정 설명서</span><span>1 / ${total}</span></footer>
</section>`;

const pages = P.map(p => `<section class="page" id="${p.id}" style="--c:${CH[p.ch].color}">
  <div class="pg-top"><span class="chip">${p.ch === 6 ? '부록' : p.ch + '장'} · ${CH[p.ch].name}</span><a href="#toc" class="to-toc">목차로 ↑</a></div>
  <h2 class="pg-title">${p.title}</h2>
  <div class="pg-body">${p.body}</div>
  <footer class="pg-foot"><span>PETPIA 스킨 수정 설명서</span><span>${p.no} / ${total}</span></footer>
</section>`).join('\n');

const css = fs.readFileSync(path.join(__dirname, 'manual.css'), 'utf8');
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>PETPIA 스킨 수정 설명서</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>${css}</style></head><body>${tocPage}\n${pages}</body></html>`;
fs.writeFileSync(path.join(__dirname, 'manual.html'), html);
console.log('pages', total);

// ---------- PDF ----------
if (process.argv.includes('--pdf') || process.argv.includes('--png')) (async () => {
  const puppeteer = require(process.env.PPTR || 'puppeteer-core');
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage();
  await pg.goto('file:///' + path.join(__dirname, 'manual.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 120000 });
  await pg.evaluate(() => document.fonts.ready);
  // 넘치는 쪽 검사
  const over = await pg.evaluate(() => Array.from(document.querySelectorAll('.page')).map((s, i) => { const b = s.querySelector('.pg-body') || s.querySelector('.toc-grid'); return b && b.scrollHeight > b.clientHeight + 2 ? (i + 1) + ':' + s.id + ' +' + (b.scrollHeight - b.clientHeight) : null; }).filter(Boolean));
  console.log('overflow', over.join(' | ') || 'none');
  if (process.argv.includes('--png')) {
    const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
    await pg.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.4 });
    const ids = await pg.evaluate(() => Array.from(document.querySelectorAll('.page')).map(s => s.id));
    fs.mkdirSync(path.join(__dirname, 'preview'), { recursive: true });
    for (let i = 0; i < ids.length; i++) {
      if (only && !only.includes(ids[i])) continue;
      const el = await pg.$('#' + ids[i]);
      await el.screenshot({ path: path.join(__dirname, 'preview', String(i + 1).padStart(2, '0') + '-' + ids[i] + '.png') });
    }
  }
  if (process.argv.includes('--pdf')) {
    await pg.pdf({ path: path.join(__dirname, 'PETPIA-스킨-수정-설명서.pdf'), preferCSSPageSize: true, printBackground: true });
    console.log('pdf ok');
  }
  await b.close();
})();
