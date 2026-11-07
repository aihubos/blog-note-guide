import './neighbor-logic.css';

const metrics = [
  ['하루 신청 목표', '35 · 70 · 100', '건 중 선택', '프로그램이 성공으로 집계한 신청 수예요. 상대방이 수락한 이웃 수와는 달라요.'],
  ['한 번의 작업 구간', '90~120', '분', '이웃 추가·답글·이웃 소통을 함께 순환하는 시간이에요. 켜 둔 기능만 실행해요.'],
  ['작업 구간 사이 휴식', '30~40', '분', '작업 구간이 끝나고 할 일이 남아 있으면, 이 범위에서 무작위로 쉬어요.'],
  ['다음 블로그 전 추가 대기', '7~12', '초', '반복 처리 중 붙는 대기예요. 페이지 로딩·글 읽기·AI 생성 시간은 별도예요.'],
];
const steps = [
  ['오늘 남은 목표 확인', '선택한 목표에서 오늘 저장된 성공 건수를 뺍니다. 목표를 이미 채웠거나 이웃 추가 기능이 꺼져 있으면 다음 기능으로 넘어가요.'],
  ['키워드로 후보 검색', '35건은 키워드 1개, 70건은 2개, 100건은 3개를 사용해요. 사용 이력이 있는 키워드를 확인하고, 남은 목표를 남은 키워드에 나눠 배정해요.'],
  ['블로그 방문 · 이웃 신청', '기존 이웃·신청 중인 대상은 건너뛰고, 신청 결과를 성공·건너뜀·한도 등으로 구분해요. 신청 성공 뒤에 글과 댓글 처리가 이어집니다.'],
  ['본문 확인 · 공감 · 댓글', '신청이 성공한 글의 제목·본문으로 AI 댓글을 준비하면서 읽기·공감 처리를 진행해요. 이미 내 댓글이 있으면 새 댓글을 생략해요.'],
  ['결과 집계 · 다음 기능', '성공으로 반환된 건을 기록하고 다음 대상을 확인해요. 키워드 할당량을 마치면 답글·이웃 소통 등 켜 둔 다음 기능으로 넘어가요.'],
];
const notes = [
  ['하루 목표는 어떻게 이어지나요?', '같은 네이버 ID의 오늘 기록을 불러와 이어서 계산해요. 예를 들어 70건 목표에 오늘 20건이 기록돼 있으면 남은 목표는 50건이에요. 기록을 불러올 때 날짜가 달라졌으면 새 일일 기록을 시작합니다. PC의 로컬 기록 기준이라 다른 PC의 실적까지 자동 합산되는 것은 아니에요.'],
  ['키워드마다 몇 건씩 배정하나요?', '남은 목표 ÷ 남은 키워드 수를 올림해 현재 키워드에 배정해요. 오늘 실적이 0이고 각 할당량을 채운다면 70건은 35+35건, 100건은 34+33+33건으로 나뉩니다. 후보가 부족하면 다음 키워드의 할당량을 다시 계산해요. 검색 후보 수는 할당량의 2배, 최소 5개를 요청하지만 실제 후보가 그만큼 있다는 보장은 없어요.'],
  ['몇 건 추가하면 쉬나요?', '휴식은 신청 건수가 아니라 통합 작업 구간을 기준으로 결정해요. 90~120분 구간 안에서 선택한 기능을 순환하고, 구간 종료 후 남은 작업이 있으면 30~40분 쉬어요. 목표 달성이나 중지 조건이면 먼저 종료할 수 있어요. 전체 실행 상한은 12시간이며, 진행 중 작업 때문에 전환 시각이 정확히 일치하지 않을 수 있습니다.'],
  ['어떤 상황에서 멈추나요?', '이웃 신청의 일일 한도 메시지를 감지하면 이웃 추가 단계를 끝내고 다음 기능으로 넘어가는 경로가 있어요. 댓글 등록 제한은 전체 중지 표시를 켭니다. 로그인 복구 실패·사용자 중지·전체 목표 완료도 종료 조건이에요. 캡차가 나오면 직접 로그인할 수 있도록 기다리는 경로가 있습니다.'],
  ['AI는 언제 쓰나요?', '이웃 신청 성공 후 댓글을 준비할 때 Google Gemini를 호출해요. 설정 모델은 gemini-3.1-flash-lite이며 제목·본문 최대 1,500자·말투 설정을 전달합니다. 기존 댓글 확인보다 AI 준비가 먼저 시작돼, 댓글을 등록하지 않아도 API를 호출했을 수 있어요. 생성 실패·시간 초과에는 예비 댓글을 쓰는 경로도 있습니다.'],
];

export function neighborLogicSection() {
  return `<section class="neighbor-logic" aria-labelledby="neighbor-logic-title">
    <div class="neighbor-heading"><div><span class="eyebrow">이웃 추가 · 숫자로 보는 주요 로직</span><h2 id="neighbor-logic-title">하루 몇 건, 언제 쉬나요?</h2><p>v4.53 통합 실행 경로를 기준으로 정리했어요.</p></div><span class="neighbor-date">코드 재확인 2026.11.07</span></div>
    <div class="neighbor-metrics">${metrics.map(([label,value,unit,description])=>`<article class="neighbor-metric"><h3>${label}</h3><div class="neighbor-value">${value}<span>${unit}</span></div><p>${description}</p></article>`).join('')}</div>
    <p class="neighbor-notice"><strong>프로그램 내부 설정값이에요.</strong> 네이버가 허용하거나 권장하는 수량·휴식 시간으로 확인된 값은 아닙니다. 특히 100건은 이 앱의 목표 선택값이며, 현재 네이버의 공식 일일 한도로 확정한 숫자가 아니에요.</p>
    <div class="neighbor-columns"><div><h3 class="neighbor-subtitle">목표에 따라 검색어가 달라져요</h3><div class="neighbor-table-wrap"><table class="neighbor-table"><caption class="sr-only">하루 목표와 사용하는 키워드 수</caption><thead><tr><th scope="col">하루 목표</th><th scope="col">키워드</th><th scope="col">첫 배분 예시</th></tr></thead><tbody><tr><th scope="row">35건</th><td>1개</td><td>35건</td></tr><tr><th scope="row">70건</th><td>2개</td><td>35 + 35건</td></tr><tr><th scope="row">100건</th><td>3개</td><td>34 + 33 + 33건</td></tr></tbody></table></div><p class="neighbor-caption">오늘 실적 0건에서 각 할당량을 채우는 경우의 예시예요. 실패·대상 부족에 따라 배분과 실제 결과가 달라집니다.</p>
    <div class="neighbor-cycle"><h3>작업과 휴식의 순서</h3><ol><li><strong>90~120분 작업 구간</strong><span>이웃 추가 → 답글·답방 → 이웃 소통</span></li><li><strong>30~40분 휴식</strong><span>구간 종료 후, 남은 작업이 있을 때</span></li><li><strong>목표·시간 다시 확인</strong><span>계속 실행하거나 종료 · 전체 상한 12시간</span></li></ol></div></div>
    <div><h3 class="neighbor-subtitle">이웃 한 명을 처리하는 흐름</h3><ol class="neighbor-steps">${steps.map(([title,description],i)=>`<li><span class="neighbor-step-number" aria-hidden="true">${i+1}</span><div><h4>${title}</h4><p>${description}</p></div></li>`).join('')}</ol></div></div>
    <div class="neighbor-details">${notes.map(([title,description])=>`<details><summary>${title}</summary><p>${description}</p></details>`).join('')}
    <details><summary>코드 근거와 확인 범위</summary><p>목표·검색어: one_gui._create_settings_view / one_engine._step_neighbor_addition (509행부터). 작업·휴식·전체 상한: one_config.CYCLE_RUNTIME / CYCLE_REST / OVERALL_RUNTIME_LIMIT 및 one_engine.run. 블로그 간 대기: DELAY_BETWEEN_BLOGS 및 _step_neighbor_addition (639행). 일일 기록: one_daily_tracker._load_data / update. 신청·댓글 분기: _process_neighbor_adder_blog (674행부터). 줄 번호는 컴파일된 코드의 위치 정보입니다. Windows 실실행 결과는 검증하지 않았어요.</p></details></div>
  </section>`;
}

export function neighborLogicMarkdown() {
  return `## 이웃 추가 핵심 로직 (2026-11-07 코드 확인)\n\n${metrics.map(([label,value,unit,description])=>`- ${label}: ${value}${unit} — ${description}`).join('\n')}\n- 전체 실행 상한: 12시간. 작업·휴식은 통합 기능 순환 기준이며 정확한 종료 시각을 보장하지 않습니다.\n- 수량과 시간은 프로그램 내부 설정이며 네이버 공식 허용량·안전 기준이 아닙니다.\n\n${notes.map(([title,description])=>`### ${title}\n${description}\n`).join('\n')}\n`;
}
