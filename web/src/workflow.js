import { workflows, nodeKinds } from './workflow-data.js';
import './workflow.css';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const W = 220, H = 98;
const colors = {normal:'#94a4bc',yes:'#51a98e',skip:'#ce9c53',stop:'#d2777d',loop:'#758fd1',data:'#a48acc'};
const state = {flow:'overview', selected:'start', view:matchMedia('(max-width:580px)').matches?'list':'graph', zoom:1};
let observer;
let dragController;
const flow = () => workflows.find(f => f.id === state.flow);
const current = () => flow().nodes.find(n => n.id === state.selected) || flow().nodes[0];
const symbol = n => `<span class="wf-symbol" style="--node-color:${nodeKinds[n.kind].color}" aria-hidden="true">${nodeKinds[n.kind].symbol}</span>`;

export function workflowPage() {
  return `<section id="workflow-root" class="workflow-page">
    <div class="page-heading wf-page-heading"><span class="eyebrow">눈으로 따라가는 실제 코드 흐름</span><h1>노드로 연결하면,<br class="mobile-break"> 로직이 보여요.</h1><p>전체 순서를 보고, 궁금한 기능 안으로 들어가 보세요.<br>노드를 누르면 조건과 다음 이동을 확인할 수 있어요.</p></div>
    <div class="wf-disclaimer"><span class="wf-live-dot"></span><strong>코드를 읽어 재구성한 설명용 흐름도</strong><span>n8n처럼 표현했으며, 실행 가능한 n8n 워크플로나 실제 실행 기록은 아닙니다.</span></div>
    <div id="workflow-content">${body()}</div>
  </section>`;
}
function body() {
  const f=flow();
  return `<div class="wf-tabs" role="tablist" aria-label="기능별 흐름">
    ${workflows.map((w,i)=>`<button id="wf-tab-${w.id}" role="tab" aria-selected="${state.flow===w.id}" aria-controls="wf-panel" data-wf-tab="${w.id}" tabindex="${state.flow===w.id?0:-1}"><span>0${i+1}</span>${w.name}<small>${w.nodes.length}</small></button>`).join('')}
    </div>
    <section id="wf-panel" role="tabpanel" aria-labelledby="wf-tab-${f.id}" class="wf-panel">
      <div class="wf-toolbar"><div class="wf-board-title"><span class="wf-board-mark">↳</span><div><strong>${f.name}</strong><span>${f.description}</span></div></div><div class="wf-view-switch" role="group" aria-label="보기 방식"><button data-wf-view="graph" aria-pressed="${state.view==='graph'}">흐름도</button><button data-wf-view="list" aria-pressed="${state.view==='list'}">노드 목록</button></div></div>
      <div class="wf-canvas-wrap" ${state.view==='list'?'hidden':''}>
        <div class="wf-zoom-controls" role="group" aria-label="흐름도 확대 축소"><button data-wf-action="out" aria-label="흐름도 축소">−</button><output id="wf-zoom-value" aria-live="polite">100%</output><button data-wf-action="in" aria-label="흐름도 확대">＋</button><span></span><button data-wf-action="width">너비 맞춤</button><button data-wf-action="fit">전체 보기</button></div>
        <div id="wf-viewport" class="wf-viewport" tabindex="0" role="region" aria-label="${f.name} 흐름도. 스크롤 또는 빈 공간을 드래그하여 이동할 수 있습니다."><div id="wf-sizer" class="wf-sizer"><div id="wf-world" class="wf-world" style="width:${f.width}px;height:${f.height}px"><svg class="wf-connections" width="${f.width}" height="${f.height}" viewBox="0 0 ${f.width} ${f.height}" aria-hidden="true"><defs>${Object.entries(colors).map(([k,c])=>`<marker id="wf-arrow-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="${c}"/></marker>`).join('')}</defs>${f.edges.map((e,i)=>renderEdge(f,e,i)).join('')}</svg>${f.nodes.map((n,i)=>`<button data-wf-node="${n.id}" class="wf-node ${state.selected===n.id?'selected':''}" style="left:${n.x}px;top:${n.y}px;--node-color:${nodeKinds[n.kind].color}" aria-label="${n.title}: ${n.subtitle}" aria-pressed="${state.selected===n.id}"><span class="wf-port in"></span>${symbol(n)}<span class="wf-node-copy"><span class="wf-kind">${nodeKinds[n.kind].label} <small>${String(i+1).padStart(2,'0')}</small></span><strong>${n.title}</strong><span class="wf-node-subtitle">${n.subtitle}</span></span><span class="wf-port out"></span></button>`).join('')}</div></div></div>
        <div class="wf-canvas-footer"><span>노드 클릭 · 빈 공간 드래그 · 스크롤 이동</span><span>${f.nodes.length}개 노드 · ${f.edges.length}개 연결</span></div>
      </div>
      <div class="wf-list-wrap" ${state.view==='graph'?'hidden':''}><p class="wf-list-explainer">노드 목록이에요. 각 노드의 <strong>다음 연결</strong>에서 조건에 맞는 이동을 따라가세요.</p><ol class="wf-list">${f.nodes.map((n,i)=>`<li><button data-wf-node="${n.id}" aria-pressed="${state.selected===n.id}" class="wf-list-node ${state.selected===n.id?'selected':''}">${symbol(n)}<span><small>${String(i+1).padStart(2,'0')} · ${nodeKinds[n.kind].label}</small><strong>${n.title}</strong><span>${n.subtitle}</span></span><span class="wf-list-chevron">›</span></button></li>`).join('')}</ol></div>
      <div class="wf-legend">${['trigger','process','condition','ai','storage','wait','stop'].map(k=>`<span><i style="background:${nodeKinds[k].color}"></i>${nodeKinds[k].label}</span>`).join('')}<span class="wf-data-legend">┄ 비동기 결과 전달</span></div>
    </section>
    <section id="wf-inspector" class="wf-inspector" tabindex="-1" aria-label="선택한 노드 설명">${inspector()}</section>
    <div class="wf-insight"><span>발견한 로직</span><p>${f.insight}</p></div>
    <div class="wf-scope"><strong>이 흐름도를 읽을 때</strong><p>${f.caveat}</p><p>사용자 중지·일시정지·예외 처리는 여러 함수에서 확인합니다. 화면은 주요 분기를 묶어 보여주며 모든 예외·재시도 경로를 빠짐없이 펼친 것은 아닙니다. 원본 실행·계정 접속 없이 정적으로 분석했습니다.</p><a href="#analysis">조건표 보기 ↗</a><a href="#sources">분석 범위와 출처 ↗</a></div>`;
}
function point(n, side) {
  return side==='left'?[n.x,n.y+H/2]:side==='right'?[n.x+W,n.y+H/2]:side==='top'?[n.x+W/2,n.y]:[n.x+W/2,n.y+H];
}
function geometry(f,e) {
  const a=f.nodes.find(n=>n.id===e.from),b=f.nodes.find(n=>n.id===e.to);
  let p, label;
  if(e.rail){
    const side=e.rail==='left'?'left':'right';const track=e.rail==='left'?34-(e.track||1)*7:1104+(e.track||1)*12;
    const down=b.y>=a.y, gap=16+(e.track||1)*7;
    const start=point(a,down?'bottom':'top'),end=point(b,down?'top':'bottom');
    const exitY=start[1]+(down?gap:-gap),entryY=end[1]+(down?-gap:gap);
    p=[start,[start[0],exitY],[track,exitY],[track,entryY],[end[0],entryY],end];
    label=[(start[0]+track)/2,exitY+(down?13:-12)];
  } else if(e.corridor!==undefined){
    const start=point(a,e.corridor>a.y+H?'bottom':'top');const end=point(b,e.corridor>b.y+H?'bottom':'top');
    p=[start,[start[0],e.corridor],[end[0],e.corridor],end];label=[(start[0]+end[0])/2,e.corridor-10];
  } else if(a.y===b.y){
    const start=point(a,b.x>a.x?'right':'left'),end=point(b,b.x>a.x?'left':'right');
    const available=Math.abs(end[0]-start[0]);
    if(e.label.length*10+14>available){
      const topStart=point(a,'top'),topEnd=point(b,'top'),lane=a.y-27;
      p=[topStart,[topStart[0],lane],[topEnd[0],lane],topEnd];label=[(topStart[0]+topEnd[0])/2,lane-11];
    }else{p=[start,end];label=[(start[0]+end[0])/2,start[1]-14];}
  } else if(a.x===b.x){
    const start=point(a,b.y>a.y?'bottom':'top'),end=point(b,b.y>a.y?'top':'bottom');p=[start,end];label=[start[0]+60,(start[1]+end[1])/2];
  } else {
    const start=point(a,b.y>a.y?'bottom':'top'),end=point(b,b.y>a.y?'top':'bottom');const mid=(start[1]+end[1])/2;p=[start,[start[0],mid],[end[0],mid],end];label=[(start[0]+end[0])/2,mid-11];
  }
  // Round the corners without changing the routing or its semantics.
  let d=`M ${p[0][0]} ${p[0][1]}`;
  for(let i=1;i<p.length-1;i++){
    const prev=p[i-1],c=p[i],next=p[i+1];const len1=Math.hypot(c[0]-prev[0],c[1]-prev[1]),len2=Math.hypot(next[0]-c[0],next[1]-c[1]);const r=Math.min(12,len1/2,len2/2);
    if(!len1||!len2){d+=` L ${c[0]} ${c[1]}`;continue;}
    const before=[c[0]-(c[0]-prev[0])/len1*r,c[1]-(c[1]-prev[1])/len1*r];const after=[c[0]+(next[0]-c[0])/len2*r,c[1]+(next[1]-c[1])/len2*r];d+=` L ${before[0]} ${before[1]} Q ${c[0]} ${c[1]} ${after[0]} ${after[1]}`;
  }
  d+=` L ${p.at(-1)[0]} ${p.at(-1)[1]}`;
  return {d,label};
}
function renderEdge(f,e,i){
  const {d,label}=geometry(f,e);const chunks=e.label.length>10?[e.label.slice(0,10),e.label.slice(10)]:[e.label];
  const width=Math.max(...chunks.map(c=>c.length))*10+14,height=chunks.length*14+4;
  return `<g class="wf-edge" data-wf-edge="${i}" style="--edge-color:${colors[e.kind]}"><path d="${d}" fill="none" stroke="${colors[e.kind]}" stroke-width="1.7" ${e.kind==='data'?'stroke-dasharray="5 5"':''} marker-end="url(#wf-arrow-${e.kind})"/>${e.label?`<g class="wf-edge-label"><rect x="${label[0]-width/2}" y="${label[1]-10}" width="${width}" height="${height}" rx="5"/><text text-anchor="middle" font-size="10" fill="${colors[e.kind]}">${chunks.map((c,j)=>`<tspan x="${label[0]}" y="${label[1]+3+j*14}">${esc(c)}</tspan>`).join('')}</text></g>`:''}</g>`;
}
function inspector(){
  const f=flow(),n=current(),out=f.edges.filter(e=>e.from===n.id),incoming=f.edges.filter(e=>e.to===n.id);
  return `<div class="wf-inspector-head"><div>${symbol(n)}<div><span>${f.name} / ${nodeKinds[n.kind].label}</span><h2 id="wf-detail-title">${n.title}</h2></div></div><button data-wf-action="back" class="wf-back">${state.view==='graph'?'흐름도로':'목록으로'} 돌아가기 ↑</button></div><div class="wf-inspector-grid"><div><h3>들어오는 정보</h3><p>${n.input}</p><h3>이 단계에서 하는 일</h3><p>${n.action}</p>${n.note?`<p class="wf-node-note">${n.note}</p>`:''}${n.workflow?`<button data-wf-tab="${n.workflow}" class="wf-drill">${workflows.find(w=>w.id===n.workflow).name} 상세 흐름 보기 ↗</button>`:''}</div><div><h3>다음 연결 <span>${out.length}</span></h3>${out.length?`<div class="wf-next-list">${out.map(e=>{const target=f.nodes.find(n=>n.id===e.to);return `<button data-wf-node="${e.to}"><span style="--edge-color:${colors[e.kind]}" class="wf-branch">${esc(e.label||'처리 후')}${e.kind==='data'?' · 결과 전달':''}</span><strong>${target.title}</strong><span>→</span></button>`;}).join('')}</div>`:`<p>이 흐름의 마지막 노드예요. ${f.id==='overview'?'전체 종료 정리로 이어집니다.':'상위 엔진이 반환 결과와 중지 표시를 확인합니다.'}</p><button class="wf-drill" data-wf-tab="overview">전체 흐름으로 돌아가기 ↗</button>`}<details class="wf-evidence"><summary>코드 근거와 이전 연결</summary><p>${n.source}</p><p>원본 코드에 남아 있는 함수·줄 위치를 기준으로 했습니다. 실서비스 동작은 검증하지 않았습니다.</p>${incoming.length?`<div class="wf-previous">${incoming.map(e=>`<button data-wf-node="${e.from}">← ${f.nodes.find(n=>n.id===e.from).title}</button>`).join('')}</div>`:''}</details></div></div>`;
}
function applyZoom(next,center=true){
  const viewport=document.querySelector('#wf-viewport');if(!viewport||state.view!=='graph')return;
  const f=flow(),old=state.zoom,offset=Math.max(0,(viewport.clientWidth-f.width*old)/2);
  const cx=(viewport.scrollLeft+viewport.clientWidth/2-offset)/old,cy=(viewport.scrollTop+viewport.clientHeight/2)/old;
  state.zoom=Math.max(.25,Math.min(1.5,next));
  const world=document.querySelector('#wf-world'),sizer=document.querySelector('#wf-sizer');
  world.style.transform=`scale(${state.zoom})`;sizer.style.width=`${f.width*state.zoom}px`;sizer.style.height=`${f.height*state.zoom}px`;
  document.querySelector('#wf-zoom-value').textContent=`${Math.round(state.zoom*100)}%`;
  if(center){const nextOffset=Math.max(0,(viewport.clientWidth-f.width*state.zoom)/2);viewport.scrollLeft=Math.max(0,cx*state.zoom+nextOffset-viewport.clientWidth/2);viewport.scrollTop=Math.max(0,cy*state.zoom-viewport.clientHeight/2);}
}
function fit(all=false){
  const vp=document.querySelector('#wf-viewport');if(!vp||state.view!=='graph')return;
  const f=flow();applyZoom(Math.min(1,(vp.clientWidth-20)/f.width,all?(vp.clientHeight-20)/f.height:1),false);vp.scrollTo(0,0);
}
function bindCanvas(){
  dragController?.abort();observer?.disconnect();
  const vp=document.querySelector('#wf-viewport');if(!vp)return;
  dragController=new AbortController();const signal=dragController.signal;let drag;
  vp.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY,left:vp.scrollLeft,top:vp.scrollTop};vp.setPointerCapture(e.pointerId);vp.classList.add('dragging');},{signal});
  vp.addEventListener('pointermove',e=>{if(drag){vp.scrollLeft=drag.left-(e.clientX-drag.x);vp.scrollTop=drag.top-(e.clientY-drag.y);}},{signal});
  const end=()=>{drag=null;vp.classList.remove('dragging');};vp.addEventListener('pointerup',end,{signal});vp.addEventListener('pointercancel',end,{signal});
  // Preserve chosen zoom on ordinary resizes. The diagram stays within its scroll region.
  observer=new ResizeObserver(()=>{if(state.view==='graph')applyZoom(state.zoom,false);});observer.observe(vp);
  if(state.view==='graph')fit();
}
function refresh(){document.querySelector('#workflow-content').innerHTML=body();bindCanvas();}
function select(id){
  const f=flow();if(!f.nodes.some(n=>n.id===id))return;state.selected=id;
  document.querySelectorAll('[data-wf-node]').forEach(el=>{if(!el.classList.contains('wf-node')&&!el.classList.contains('wf-list-node'))return;const selected=el.dataset.wfNode===id;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});
  document.querySelectorAll('[data-wf-edge]').forEach(el=>{const e=f.edges[Number(el.dataset.wfEdge)];const active=e.from===id||e.to===id;el.classList.toggle('related',active);el.classList.toggle('dim',!active);});
  const inspectorEl=document.querySelector('#wf-inspector');inspectorEl.innerHTML=inspector();
  inspectorEl.focus({preventScroll:true});inspectorEl.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
}
export function unmountWorkflow(){observer?.disconnect();dragController?.abort();}
export function mountWorkflow(){
  const root=document.querySelector('#workflow-root');if(!root)return;bindCanvas();
  root.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.wfTab){const f=workflows.find(f=>f.id===b.dataset.wfTab);if(!f)return;state.flow=f.id;state.selected=f.nodes[0].id;refresh();const tab=document.querySelector(`#wf-tab-${f.id}`);tab.focus({preventScroll:true});tab.scrollIntoView({block:'nearest',inline:'nearest'});return;}
    if(b.dataset.wfView){state.view=b.dataset.wfView;refresh();document.querySelector(`[data-wf-view="${state.view}"]`).focus({preventScroll:true});return;}
    if(b.dataset.wfNode){select(b.dataset.wfNode);return;}
    const action=b.dataset.wfAction;
    if(action==='in')applyZoom(state.zoom+.15);
    if(action==='out')applyZoom(state.zoom-.15);
    if(action==='fit')fit(true);
    if(action==='width')fit();
    if(action==='back'){
      const container=state.view==='graph'?document.querySelector('.wf-canvas-wrap'):document.querySelector('.wf-list-wrap');container.scrollIntoView({block:'start',behavior:'smooth'});
      const n=document.querySelector(`${state.view==='graph'?'.wf-node':'.wf-list-node'}[data-wf-node="${state.selected}"]`);n?.focus({preventScroll:true});
      if(state.view==='graph'){const selected=current(),vp=document.querySelector('#wf-viewport');vp.scrollTo({left:Math.max(0,(selected.x+W/2)*state.zoom-vp.clientWidth/2),top:Math.max(0,(selected.y+H/2)*state.zoom-vp.clientHeight/2),behavior:'smooth'});}
    }
  });
  root.addEventListener('keydown',event=>{
    const b=event.target.closest('[role="tab"]');if(!b)return;const keys=['ArrowRight','ArrowLeft','Home','End'];if(!keys.includes(event.key))return;event.preventDefault();const i=workflows.findIndex(w=>w.id===state.flow);const next=event.key==='Home'?0:event.key==='End'?workflows.length-1:(i+(event.key==='ArrowRight'?1:-1)+workflows.length)%workflows.length;document.querySelector(`#wf-tab-${workflows[next].id}`).click();
  });
}
