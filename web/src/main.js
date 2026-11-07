import './style.css';
import { neighborLogicSection, neighborLogicMarkdown } from './neighbor-logic.js';
import { workflowPage, mountWorkflow, unmountWorkflow } from './workflow.js';
import { guides, sources, rules, checklist, flows } from './data.js';

const paths = {
  nodes: '<rect x="2" y="3" width="7" height="6" rx="2"/><rect x="15" y="15" width="7" height="6" rx="2"/><path d="M9 6h7a3 3 0 0 1 3 3v6M5 9v6a3 3 0 0 0 3 3h7"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4z"/><path d="M13 7a3 3 0 0 1 3-3h4v15h-4a4 4 0 0 0-3 2"/>',
  route: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h4"/>',
  check: '<path d="m8 12 3 3 5-6"/><rect x="3" y="3" width="18" height="18" rx="5"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  message: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.5-4.5a8.5 8.5 0 1 1 15.5-4z"/><path d="M8 10h8M8 14h5"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  hand: '<path d="M8 13V6a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v10a6 6 0 0 1-11 4l-6-7a2 2 0 0 1 3-2l2 2"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a4 4 0 0 1 3 4v2"/>',
  tag: '<path d="M20 13 11 4H4v7l9 9a2 2 0 0 0 3 0l4-4a2 2 0 0 0 0-3z"/><circle cx="7.5" cy="7.5" r=".7"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  sliders: '<path d="M4 6h5m4 0h7M4 12h11m4 0h1M4 18h2m4 0h10"/><circle cx="11" cy="6" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  chart: '<path d="M3 3v18h18M7 15l4-5 4 2 6-8"/>',
  pen: '<path d="m15 5 4 4M4 20l5-1L21 7a2.8 2.8 0 0 0-4-4L5 15z"/>',
  reply: '<path d="m9 4-6 6 6 6M3 10h10a8 8 0 0 1 8 8v2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
  circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
const escape = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storageKey = 'blog-note-guide:v1';
let stored = {}, storageAvailable = true;
try { stored = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { storageAvailable = false; }
const state = {
  route: ['guide','analysis','workflow','checklist','sources'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'guide',
  category: '전체', query: '', ruleQuery: '', ruleFilter: '전체',
  checks: Object.fromEntries(checklist.map(item => [item.id, stored.checks?.[item.id] === true])),
  note: typeof stored.note === 'string' ? stored.note.slice(0, 3000) : '',
};
const nav = [
  { id: 'guide', icon: 'book', label: '운영 가이드' },
  { id: 'analysis', icon: 'route', label: '프로그램 로직' },
  { id: 'workflow', icon: 'nodes', label: '노드 흐름도' },
  { id: 'checklist', icon: 'check', label: '발행 전 점검' },
  { id: 'sources', icon: 'file', label: '근거와 출처' },
];
const done = () => Object.values(state.checks).filter(Boolean).length;
const labels = { official: '네이버 공식', program: '프로그램 분석', advice: '운영 권장' };
const badge = type => `<span class="badge ${type}">${type === 'official' ? icon('circleCheck') : ''}${labels[type]}</span>`;
const sourceLink = id => {
  const source = sources.find(s => s.id === id);
  return source ? `<a class="text-link" href="${source.url}" target="_blank" rel="noopener noreferrer">공식 원문 보기 ${icon('external')}</a>` : '';
};
const countLabel = () => `<span data-progress-count>${done()}</span><span class="muted"> / ${checklist.length}</span>`;
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify({ checks: state.checks, note: state.note })); storageAvailable = true; }
  catch { storageAvailable = false; }
  document.querySelectorAll('[data-save-state]').forEach(el => el.textContent = storageAvailable ? '이 브라우저에 자동 저장돼요' : '브라우저에 저장되지 않았어요. 노트를 내려받아 주세요.');
}
function toast(message) {
  const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 3200);
}
function illustration() {
  return `<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 350 265" fill="none">
    <defs><linearGradient id="paper" x1="90" y1="40" x2="230" y2="220" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="#ebf2ff"/></linearGradient><linearGradient id="bubble" x1="190" y1="100" x2="280" y2="210" gradientUnits="userSpaceOnUse"><stop stop-color="#5aa4ff"/><stop offset="1" stop-color="#1764e9"/></linearGradient><filter id="shadow" x="0" y="0" width="200%" height="200%"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#1a5cc1" flood-opacity=".12"/></filter></defs>
    <ellipse cx="184" cy="224" rx="113" ry="15" fill="#cfdef6" opacity=".45"/>
    <circle cx="188" cy="124" r="105" fill="#e2edff"/>
    <g transform="rotate(-11 155 128)" filter="url(#shadow)"><rect x="83" y="32" width="151" height="185" rx="19" fill="url(#paper)"/><rect x="102" y="55" width="42" height="12" rx="6" fill="#3182f6"/><rect x="102" y="82" width="105" height="8" rx="4" fill="#c3d2e8"/><rect x="102" y="99" width="80" height="8" rx="4" fill="#d5e0ef"/><rect x="102" y="130" width="25" height="25" rx="8" fill="#e0edff"/><path d="m109 143 4 4 8-9" stroke="#3182f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="137" y="135" width="65" height="7" rx="3.5" fill="#c3d2e8"/><rect x="137" y="148" width="44" height="6" rx="3" fill="#dce5f2"/><rect x="102" y="171" width="25" height="25" rx="8" fill="#e0edff"/><path d="m109 184 4 4 8-9" stroke="#3182f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="137" y="177" width="55" height="7" rx="3.5" fill="#c3d2e8"/></g>
    <g filter="url(#shadow)"><path d="M197 118h64a27 27 0 0 1 27 27v28a27 27 0 0 1-27 27h-8l-15 15-3-15h-38a27 27 0 0 1-27-27v-28a27 27 0 0 1 27-27Z" fill="url(#bubble)"/><path d="m209 158 13 13 27-28" stroke="white" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>
    <circle cx="274" cy="63" r="18" fill="white"/><path d="m268 63 4 4 8-9" stroke="#3cbca0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="65" cy="174" r="7" fill="#9cc4ff"/><path d="m279 108 3-7 3 7 7 3-7 3-3 7-3-7-7-3z" fill="#77aaf7"/>
  </svg><span class="art-caption">하나씩, 내 방식대로.</span></div>`;
}
function renderShell() {
  unmountWorkflow();
  document.querySelector('#app').innerHTML = `
    <aside class="sidebar">
      <a href="#guide" class="brand" aria-label="블로그 노트 홈"><span class="brand-mark">b<span>.</span></span><span>블로그 노트</span></a>
      <span class="sidebar-caption">나를 위한 운영 가이드</span>
      <nav aria-label="주 메뉴">${nav.map(n => `<a href="#${n.id}" class="nav-item ${state.route === n.id ? 'active' : ''}" ${state.route === n.id ? 'aria-current="page"' : ''}>${icon(n.icon)}<span>${n.label}</span>${n.id === 'analysis' ? '<span class="nav-badge">12</span>' : ''}</a>`).join('')}</nav>
      <div class="sidebar-bottom"><div class="small-logo">${icon('spark')} 직접 운영하는 힘</div><p>복잡한 자동화 조건을<br>나만의 운영 습관으로.</p><a href="#sources">v4.53 분석 노트 ${icon('chevron')}</a></div>
    </aside>
    <div class="workspace"><header class="topbar"><span class="desktop-top-label">MY BLOG NOTE <span class="top-divider"></span> ${nav.find(n => n.id === state.route).label}</span><a href="#guide" class="mobile-brand">블로그 노트<span>.</span></a><div class="top-actions"><span class="updated"><i></i> 로직 2026.11.07 보완</span><button class="download-btn" data-action="download" aria-label="운영 노트 다운로드">${icon('download')}<span>노트 저장</span></button></div></header>
    <main id="main-content" tabindex="-1">${({guide:guidePage, analysis:analysisPage, workflow:workflowPage, checklist:checklistPage, sources:sourcesPage}[state.route])()}</main>
    <footer class="footer"><span>블로그 노트</span><p>프로그램 분석과 공식 도움말을 바탕으로 정리한 개인 운영 가이드예요.</p><span>네이버·토스의 공식 서비스가 아닙니다.</span></footer></div>
    <nav class="mobile-nav" aria-label="모바일 주 메뉴">${nav.map(n=>`<a href="#${n.id}" ${state.route === n.id ? 'aria-current="page"' : ''} class="${state.route === n.id ? 'active' : ''}">${icon(n.icon)}<span>${n.label}</span></a>`).join('')}</nav>`;
  if (state.route === 'workflow') mountWorkflow();
}
function guidePage() {
  return `<section class="hero"><div class="hero-content"><span class="eyebrow">내 손으로 키우는 블로그</span><h1>블로그 운영,<br><em>기준을 알면</em> 쉬워져요.</h1><p>이웃을 맺는 순간부터 글을 발행하기까지.<br>꼭 알아야 할 조건을 한곳에 모았어요.</p><a href="#checklist" class="primary-btn">오늘의 운영 점검하기 ${icon('arrow')}</a></div>${illustration()}</section>
    <a href="#analysis" class="neighbor-entry"><div><strong>이웃 추가, 하루 몇 건 · 몇 분 쉬나요?</strong><p>35·70·100건 목표, 90~120분 작업 구간, 30~40분 휴식의 실제 의미를 확인해요.</p></div>${icon('arrow')}</a>
    <div class="evidence-banner">${icon('info')}<div><strong>프로그램 설정과 네이버 규칙은 달라요.</strong><span>숫자보다 그 조건의 의미를 먼저 확인해 보세요.</span></div><a href="#analysis" aria-label="프로그램 조건 확인">조건 확인 ${icon('chevron')}</a></div>
    <section class="guide-section"><div class="section-heading"><div><span class="kicker">조금 더 잘 운영하고 싶다면</span><h2>이것부터 알아두세요</h2></div><label class="search-field">${icon('search')}<input id="guide-search" type="search" aria-label="운영 가이드 검색" placeholder="궁금한 내용을 찾아보세요" value="${escape(state.query)}"/></label></div>
    <div class="filter-row" role="group" aria-label="운영 가이드 분류">${['전체','이웃 관리','댓글·답글','글 발행','계정·제한'].map(c=>`<button class="filter ${state.category===c?'selected':''}" data-category="${c}" aria-pressed="${state.category===c}">${c}</button>`).join('')}</div>
    <div class="guide-layout"><div><div id="guide-results" class="guide-grid">${guideCards()}</div><p id="guide-result-count" class="result-count" aria-live="polite">${filteredGuides().length}개의 가이드</p></div><aside class="right-rail">${quickCheck()}<div class="tip-card"><span class="tip-icon">${icon('spark')}</span><span class="kicker">오늘의 작은 실천</span><h3>“잘 보고 갑니다” 대신<br>한 문장 더.</h3><p>글에서 기억에 남는 장면을<br>하나 골라 이야기해 보세요.</p><button class="text-link" data-guide="read">댓글 작성 가이드 ${icon('arrow')}</button></div><div class="source-key"><span class="kicker">근거를 구분해서 읽어요</span><p>${badge('official')} 공식 도움말에서 확인</p><p>${badge('program')} 실행 파일의 조건 분석</p><p>${badge('advice')} 수동 운영을 위한 제안</p></div></aside></div></section>`;
}
function filteredGuides() {
  const q=state.query.trim().toLowerCase();return guides.filter(g=>(state.category==='전체'||state.category===g.category)&&`${g.title} ${g.description} ${g.detail} ${g.action} ${g.caution} ${g.category}`.toLowerCase().includes(q));
}
function guideCards() {
  const items=filteredGuides();
  if (!items.length) return `<div class="empty-state">${icon('search')}<h3>찾는 가이드가 없어요</h3><p>다른 단어로 검색하거나 전체 분류를 확인해 보세요.</p><button class="soft-btn" data-action="clear-search">검색 초기화</button></div>`;
  return items.map((g,i)=>`<button class="guide-card" data-guide="${g.id}"><div class="card-top"><span class="icon-tile ${g.tone}">${icon(g.icon)}</span>${badge(g.evidence)}</div><span class="card-label">${g.label}</span><h3>${g.title.replace('\n','<br>')}</h3><p>${g.description}</p><span class="card-bottom"><span>${g.category}</span><span class="round-arrow">${icon('arrow')}</span></span></button>`).join('');
}
function quickCheck() {
  return `<div class="quick-check"><div class="rail-heading"><span class="icon-tile small blue">${icon('check')}</span><h3>오늘의 점검</h3></div><p class="rail-description">발행 전에, 하나씩 확인해요.</p><div class="progress-label"><strong>${countLabel()}</strong><span>항목 확인</span></div><div class="progress-track"><div data-progress-bar style="width:${done()/checklist.length*100}%"></div></div><div class="quick-list">${['original','disclosure','duplicate'].map(id=>{const c=checklist.find(c=>c.id===id);return `<label class="quick-item"><input type="checkbox" data-check="${id}" ${state.checks[id]?'checked':''}/><span>${({original:'직접 확인한 내용인가요?',disclosure:'협찬 여부를 확인했나요?',duplicate:'중복 댓글을 확인했나요?'})[id]}</span></label>`}).join('')}</div><a href="#checklist" class="soft-btn wide">전체 체크리스트 ${icon('chevron')}</a><p class="autosave" data-save-state>${storageAvailable?'이 브라우저에 자동 저장돼요':'브라우저 저장이 제한되어 있어요'}</p></div>`;
}
function analysisPage() {
  return `<div class="page-heading"><span class="eyebrow">실행 파일에서 확인했어요</span><h1>프로그램은<br class="mobile-break"> 이렇게 움직여요</h1><p>블로그 올인원 v4.53의 주요 흐름과 조건을 쉽게 풀었어요.</p></div>
    <a href="#workflow" class="wf-analysis-link"><div><strong>n8n처럼, 노드로 실제 흐름을 따라가 보세요</strong><p>전체 흐름과 기능별 분기 · 노드를 누르면 조건과 근거 확인</p></div><span>↗</span></a>
    <div class="analysis-summary"><div><span>분석 대상</span><strong>v4.53 <small>Windows 실행 파일</small></strong></div><div><span>핵심 기능</span><strong>3가지 <small>소통 중심의 흐름</small></strong></div><div><span>정리한 조건</span><strong>12개 <small>근거와 한계 포함</small></strong></div></div>
    ${neighborLogicSection()}
    <section class="section-space"><div class="section-heading"><h2>핵심은 세 가지 소통이에요</h2><span class="subtle-label">단계를 눌러 자세히 보기</span></div><div class="flow-grid">${flows.map(f=>`<button class="flow-card" data-flow="${f.number}"><span class="step-no">STEP ${f.number}</span><span class="icon-tile blue">${icon(f.icon)}</span><h3>${f.title}</h3><p>${f.description}</p><span class="text-link">자세히 보기 ${icon('arrow')}</span></button>`).join('')}</div><p class="section-note">설정에 따라 기능을 켜고 끄며 순환합니다. 목표량·실행 시간·오류·제한 감지에 따라 멈추는 구조입니다.</p></section>
    <button class="finding-banner" data-rule="P04">${icon('info')}<span><strong>“24시간 이내”라는 설명, 코드는 조금 달랐어요.</strong><span>실제 시간 계산이 아닌 화면의 글자 형태를 확인해요. 분석 내용 보기</span></span>${icon('chevron')}</button>
    <section class="section-space"><div class="section-heading"><div><span class="kicker">설정값을 운영 기준으로 읽는 법</span><h2>주요 조건 한눈에 보기</h2></div><label class="search-field">${icon('search')}<input id="rule-search" type="search" aria-label="프로그램 조건 검색" placeholder="중복, 24시간, 댓글 길이…" value="${escape(state.ruleQuery)}"/></label></div><div class="filter-row" role="group" aria-label="분석 근거 분류">${['전체','코드 확인','AI 지시문','선언만 확인','해석 주의'].map(s=>`<button class="filter ${state.ruleFilter===s?'selected':''}" data-rule-filter="${s}" aria-pressed="${state.ruleFilter===s}">${s}</button>`).join('')}</div><div id="rule-results" class="rules-list">${ruleRows()}</div><p id="rule-result-count" class="result-count" aria-live="polite">${filteredRules().length}개의 조건</p></section>
    <div class="method-note">${icon('file')}<div><h3>어떻게 확인했나요?</h3><p>REA로 실행 파일 구조를 확인하고, 내장 Python 코드의 명령·상수·함수 호출을 읽었습니다. 원본 실행 파일을 정적으로 분석한 내용입니다. 실제 네이버 화면에서의 동작과 외부 서비스 응답은 검증하지 않았습니다.</p><a href="#sources" class="text-link">분석 범위와 출처 ${icon('arrow')}</a></div></div>`;
}
function filteredRules(){const q=state.ruleQuery.trim().toLowerCase();return rules.filter(r=>(state.ruleFilter==='전체'||r.status===state.ruleFilter)&&`${r.area} ${r.title} ${r.value} ${r.meaning}`.toLowerCase().includes(q));}
function ruleRows(){const items=filteredRules();return items.length?items.map(r=>`<button class="rule-row" data-rule="${r.id}"><span class="rule-id">${r.id}</span><div class="rule-main"><span class="rule-area">${r.area}</span><h3>${r.title}</h3><p>${r.value}</p></div><span class="status-badge ${r.status==='해석 주의'||r.status==='선언만 확인'?'warning':''}">${r.status}</span>${icon('chevron')}</button>`).join(''):`<div class="empty-state">${icon('search')}<h3>검색 결과가 없어요</h3><p>다른 단어나 근거 분류를 선택해 주세요.</p><button class="soft-btn" data-action="clear-rules">검색 초기화</button></div>`;}
function checklistPage() {
  return `<div class="page-heading"><span class="eyebrow">좋은 운영은 작은 확인에서</span><h1>발행 전,<br class="mobile-break"> 한 번 더 확인해요</h1><p>글을 쓰고 이웃과 소통할 때 필요한 체크리스트예요.</p></div><div class="checklist-layout"><section class="checklist-panel"><div class="checklist-top"><div><h2>나의 운영 체크리스트</h2><p>해당 사항이 없으면 확인한 뒤 체크해도 괜찮아요.</p></div><button class="plain-btn" data-action="reset">새 점검 시작</button></div>${['발행 전','소통 전','마무리'].map((group,i)=>`<div class="check-group"><h3><span>0${i+1}</span>${group}</h3>${checklist.filter(c=>c.group===group).map(c=>`<label class="check-item ${state.checks[c.id]?'is-done':''}"><input type="checkbox" data-check="${c.id}" ${state.checks[c.id]?'checked':''}/><span><strong>${c.title}</strong><span>${c.description}</span></span></label>`).join('')}</div>`).join('')}</section><aside class="checklist-aside"><div class="progress-card"><div class="progress-ring" data-progress-ring style="--progress:${done()/checklist.length*100}%"><span><strong data-progress-count>${done()}</strong><small>8개 중 확인</small></span></div><h2 data-completion-title>${done()===8?'점검을 모두 마쳤어요':'하나씩 확인하면 돼요'}</h2><p>체크 완료는 내 점검 기록이에요.<br>검색 노출이나 계정 상태를 보장하지 않아요.</p><p class="autosave" data-save-state>${storageAvailable?'이 브라우저에 자동 저장돼요':'브라우저 저장이 제한되어 있어요'}</p></div><div class="note-card"><div class="rail-heading">${icon('pen')}<h3>기억해 둘 메모</h3></div><label for="personal-note" class="sr-only">운영 메모</label><textarea id="personal-note" maxlength="3000" placeholder="다음 글 주제, 답변이 필요한 질문 등 기억할 내용을 적어보세요.">${escape(state.note)}</textarea><div class="note-meta"><span data-save-state>${storageAvailable?'이 브라우저에 자동 저장돼요':'메모를 내려받아 보관해 주세요'}</span><span data-note-count>${state.note.length}/3000</span></div><button class="soft-btn wide" data-action="download">${icon('download')} 내 점검과 메모 저장</button></div></aside></div>`;
}
function sourcesPage() {
  return `<div class="page-heading"><span class="eyebrow">확인할 수 있는 근거</span><h1>어디서 확인한<br class="mobile-break"> 내용인가요?</h1><p>공식 정책, 프로그램의 구현, 운영 제안을 구분했어요.</p></div>
    <div class="source-legend-grid">${[['official','네이버가 안내한 기준','공식 도움말을 읽고 정리했어요. 정책은 바뀔 수 있으니 실제 이용 시 원문도 확인하세요.'],['program','프로그램 안의 조건','v4.53에 포함된 코드·지시문·문서에서 확인했어요. 네이버의 공식 정책과는 구분해야 해요.'],['advice','수동 운영을 위한 제안','확인한 내용을 사람이 직접 운영하는 상황에 맞게 풀었어요. 정해진 허용량을 뜻하지 않아요.']].map(([type,title,desc])=>`<div class="legend-card">${badge(type)}<h3>${title}</h3><p>${desc}</p></div>`).join('')}</div>
    <section class="section-space"><div class="section-heading"><h2>네이버 공식 도움말</h2><span class="subtle-label">확인일 2026.11.04</span></div><div class="source-list">${sources.map(s=>`<a class="source-row" href="${s.url}" target="_blank" rel="noopener noreferrer"><span class="source-n">N</span><div><span>${s.publisher}</span><h3>${s.title}</h3><p>${s.note}</p></div>${icon('external')}</a>`).join('')}</div></section>
    <section class="scope-card"><span class="eyebrow">프로그램 분석 범위</span><h2>확인한 것과, 확인하지 않은 것</h2><dl><div><dt>대상 파일</dt><dd>블로그 올인원 v4.53.exe · Windows x86-64 · Python 3.14 / PyInstaller</dd></div><div><dt>확인 방법</dt><dd>REA / Ghidra로 포장 구조 확인 → 내장 파일 추출 → Python 바이트코드의 명령·상수·호출 관계 읽기</dd></div><div><dt>살펴본 기능</dt><dd>통합 실행 흐름, 이웃 신청, 댓글·답글, 중복 기록, AI 작성 지침, 화면 설정</dd></div><div><dt>해석의 한계</dt><dd>원본 실행·로그인·게시를 하지 않았습니다. 실행 시 실제 동작, 서버 설정, AI 판단 정확도는 미검증입니다. 원본 줄 번호는 코드에 남은 위치 정보이며 소스 파일 복원을 뜻하지 않습니다.</dd></div><div><dt>문서의 버전 차이</dt><dd>실행 파일은 v4.53이지만 동봉된 별도 사용설명서는 v2.8입니다. 통합 화면의 안내와 코드도 일부 차이가 있어 구분했습니다.</dd></div></dl><div class="scope-footer">이 웹은 분석 내용을 설명하는 독립적인 안내 도구입니다. 인증 변경이나 네이버 자동화 기능은 포함하지 않습니다.</div></section>`;
}
function openDialog(content) {
  const dialog=document.querySelector('#detail-dialog');
  dialog.innerHTML=`<button class="dialog-close" aria-label="상세 내용 닫기" data-action="close-dialog">${icon('close')}</button>${content}`;
  dialog.showModal();
}
function showGuide(id) {
  const g=guides.find(g=>g.id===id);if(!g)return;
  openDialog(`<div class="dialog-heading"><span class="icon-tile ${g.tone}">${icon(g.icon)}</span>${badge(g.evidence)}</div><span class="kicker">${g.category}</span><h2 id="detail-title">${g.title.replace('\n','<br>')}</h2><p class="dialog-lead">${g.description}</p><div class="detail-block"><h3>확인한 내용</h3><p>${g.detail}</p></div><div class="action-block"><h3>${icon('check')} 직접 운영한다면</h3><p>${g.action}</p>${g.example?`<p class="example">${g.example}</p>`:''}</div><p class="detail-caution">${icon('info')}<span>${g.caution}</span></p><details class="evidence-details"><summary>확인 근거 ${icon('down')}</summary><p>${g.origin}</p>${g.source?sourceLink(g.source):'<p>정적 분석 결과입니다. 실행 시 동작과 결과는 검증하지 않았습니다.</p>'}</details><button class="primary-btn wide" data-action="close-dialog">확인했어요</button>`);
}
function showRule(id) {
  const r=rules.find(r=>r.id===id);if(!r)return;
  openDialog(`<span class="kicker">${r.id} · ${r.area}</span><h2 id="detail-title">${r.title}</h2><span class="status-badge ${r.status==='해석 주의'||r.status==='선언만 확인'?'warning':''}">${r.status}</span><div class="rule-value">${r.value}</div><div class="detail-block"><h3>어떻게 이해하면 될까요?</h3><p>${r.meaning}</p></div><details class="evidence-details"><summary>코드에서 확인한 위치 ${icon('down')}</summary><p>${r.evidence}</p><p>줄 번호는 실행 파일에 남아 있는 원본 위치 정보입니다. 실제 서비스에서의 동작은 검증하지 않았습니다.</p></details><button class="primary-btn wide" data-action="close-dialog">확인했어요</button>`);
}
function updateProgress() {
  document.querySelectorAll('[data-progress-count]').forEach(el=>el.textContent=done());
  document.querySelectorAll('[data-progress-bar]').forEach(el=>el.style.width=`${done()/8*100}%`);
  document.querySelectorAll('[data-progress-ring]').forEach(el=>el.style.setProperty('--progress',`${done()/8*100}%`));
  document.querySelectorAll('[data-check]').forEach(el=>{el.checked=state.checks[el.dataset.check];el.closest('.check-item')?.classList.toggle('is-done',el.checked);});
  const title=document.querySelector('[data-completion-title]');if(title)title.textContent=done()===8?'점검을 모두 마쳤어요':'하나씩 확인하면 돼요';
}
function downloadNote() {
  const time=new Date().toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});
  const body=`# 블로그 운영 노트\n\n저장: ${time} (한국 시간)\n분석 기준: 2026-11-04 / 블로그 올인원 v4.53\n\n## 내 체크리스트\n${checklist.map(c=>`- [${state.checks[c.id]?'x':' '}] ${c.title}`).join('\n')}\n\n## 내 메모\n${state.note||'작성한 메모가 없습니다.'}\n\n## 기억할 핵심\n- 프로그램의 목표 수량·대기 시간·문장 길이는 네이버 공식 규칙과 다릅니다.\n- 같은 글의 기존 댓글을 확인하고, 본문에 맞는 구체적인 반응을 남기세요.\n- 가격·재고·연락처·행동 요청은 직접 확인하고 답하세요.\n- 협찬과 지원 내용을 명확히 표시하고, 직접 경험한 내용을 작성하세요.\n\n${neighborLogicMarkdown()}\n## 프로그램 조건 요약\n${rules.map(r=>`### ${r.id}. ${r.title}\n- 관찰: ${r.value}\n- 근거 수준: ${r.status}\n- 해석: ${r.meaning}\n- 위치: ${r.evidence}\n`).join('\n')}\n## 공식 출처\n${sources.map(s=>`- ${s.title}: ${s.url}`).join('\n')}\n\n정적 분석이며 실제 실행·계정 접속·게시 검증은 하지 않았습니다. 이 점검은 노출·안전을 보장하지 않습니다.\n`;
  const url=URL.createObjectURL(new Blob([body],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='블로그-운영-노트.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('점검 내용과 메모를 파일로 저장했어요.');
}
window.addEventListener('hashchange',()=>{
  const route=location.hash.slice(1);if(!nav.some(n=>n.id===route))return;
  state.route=route;renderShell();window.scrollTo({top:0,behavior:'instant'});document.querySelector('#main-content').focus({preventScroll:true});
});
document.addEventListener('click',event=>{
  const target=event.target.closest('button');if(!target)return;
  if(target.dataset.guide)showGuide(target.dataset.guide);
  if(target.dataset.rule)showRule(target.dataset.rule);
  if(target.dataset.flow){const f=flows.find(f=>f.number===target.dataset.flow);openDialog(`<span class="kicker">STEP ${f.number}</span><h2 id="detail-title">${f.title}</h2><p class="dialog-lead">${f.description}</p><div class="detail-block"><p>${f.detail}</p></div><details class="evidence-details"><summary>확인 근거 ${icon('down')}</summary><p>${f.source}</p></details><button class="primary-btn wide" data-action="close-dialog">확인했어요</button>`);}
  if(target.dataset.category){state.category=target.dataset.category;document.querySelectorAll('[data-category]').forEach(el=>{const active=el.dataset.category===state.category;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});refreshGuides();}
  if(target.dataset.ruleFilter){state.ruleFilter=target.dataset.ruleFilter;document.querySelectorAll('[data-rule-filter]').forEach(el=>{const active=el.dataset.ruleFilter===state.ruleFilter;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});refreshRules();}
  if(target.dataset.action==='close-dialog')document.querySelector('#detail-dialog').close();
  if(target.dataset.action==='download')downloadNote();
  if(target.dataset.action==='reset'){state.checks=Object.fromEntries(checklist.map(c=>[c.id,false]));save();updateProgress();toast('체크를 초기화했어요. 메모는 그대로 보관했어요.');}
  if(target.dataset.action==='clear-search'){state.query='';state.category='전체';renderShell();document.querySelector('#guide-search').focus();}
  if(target.dataset.action==='clear-rules'){state.ruleQuery='';state.ruleFilter='전체';renderShell();document.querySelector('#rule-search').focus();}
});
function refreshGuides(){document.querySelector('#guide-results').innerHTML=guideCards();document.querySelector('#guide-result-count').textContent=`${filteredGuides().length}개의 가이드`;}
function refreshRules(){document.querySelector('#rule-results').innerHTML=ruleRows();document.querySelector('#rule-result-count').textContent=`${filteredRules().length}개의 조건`;}
document.addEventListener('input',event=>{
  if(event.target.id==='guide-search'){state.query=event.target.value;refreshGuides();}
  if(event.target.id==='rule-search'){state.ruleQuery=event.target.value;refreshRules();}
  if(event.target.id==='personal-note'){state.note=event.target.value;document.querySelector('[data-note-count]').textContent=`${state.note.length}/3000`;save();}
});
document.addEventListener('change',event=>{if(event.target.matches('[data-check]')){state.checks[event.target.dataset.check]=event.target.checked;save();updateProgress();}});
document.querySelector('#detail-dialog').addEventListener('click',event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.currentTarget.close();}});
renderShell();
