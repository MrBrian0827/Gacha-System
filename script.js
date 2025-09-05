document.addEventListener('DOMContentLoaded', () => {

  // ====== 稀有度機率設定 (可直接調整) ======
  const PROB_UR  = 0.02;   // UR 0.02%
  const PROB_SSR = 0.05;   // SSR 0.05%
  const PROB_SR  = 4.93;   // SR 4.93%
  const PROB_R   = 30;     // R 30%
  // N 剩下 = 100 - (UR+SSR+SR+R)

  let history = [];       // 抽卡紀錄
  let totalDraws = 0;    // 總抽數

  // ====== 抽卡稀有度函數 ======
  function getRarity() {
    totalDraws++;
    // 200 抽保底 UR
    if (totalDraws % 200 === 0) return 'UR';

    const roll = Math.random() * 100;

    if (roll < PROB_UR) return 'UR';
    if (roll < PROB_UR + PROB_SSR) return 'SSR';
    if (roll < PROB_UR + PROB_SSR + PROB_SR) return 'SR';
    if (roll < PROB_UR + PROB_SSR + PROB_SR + PROB_R) return 'R';
    return 'N';
  }

  // ====== 建立卡片 DOM 元素 ======
  function createCardElement(card) {
    const wrapper = document.createElement('div');
    wrapper.className = 'card';
    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const back = document.createElement('div');
    back.className = 'card-back';
    back.textContent = '卡背';

    const front = document.createElement('div');
    front.className = 'card-front';
    front.innerHTML = `
      <div class="name">${card.name}</div>
      <div class="rarity rarity-${card.rarity}">${card.rarity}</div>
      <div class="image">${card.image}</div>
      <div class="effect">${card.effect}</div>
      <div class="stats"><span>⚔️ ${card.attack}</span> <span>❤️ ${card.hp}</span></div>
    `;

    inner.appendChild(back);
    inner.appendChild(front);
    wrapper.appendChild(inner);

    return wrapper;
  }

  // ====== 更新抽卡次數顯示 ======
  function updateDrawCount() {
    const countEl = document.getElementById('drawCount');
    if (countEl) countEl.textContent = `目前第 ${totalDraws} 抽`;
  }

  // ====== 單抽功能 ======
  function singleDraw() {
    const rarity = getRarity();
    const candidates = pool.filter(c => c.rarity === rarity);
    if (candidates.length === 0) return;
    const card = candidates[Math.floor(Math.random() * candidates.length)];
    history.push(card);

    const results = document.getElementById('results');
    results.innerHTML = '';
    const el = createCardElement(card);
    results.appendChild(el);
    setTimeout(() => el.classList.add('flip'), 120);

    updateDrawCount();
  }

  // ====== 十連抽功能 ======
  function multiDraw() {
    const resultsArr = [];
    let hasSRorAbove = false;

    for (let i = 0; i < 10; i++) {
      const rarity = getRarity();
      if (['SR', 'SSR', 'UR'].includes(rarity)) hasSRorAbove = true;
      const candidates = pool.filter(c => c.rarity === rarity);
      resultsArr.push(candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : pool[Math.floor(Math.random() * pool.length)]);
    }

    // 十連抽保底一張 SR
    if (!hasSRorAbove) {
      const srCandidates = pool.filter(c => c.rarity === 'SR');
      if (srCandidates.length > 0) resultsArr[9] = srCandidates[Math.floor(Math.random() * srCandidates.length)];
    }

    const container = document.getElementById('results');
    container.innerHTML = '';
    resultsArr.forEach((card, idx) => {
      history.push(card);
      const el = createCardElement(card);
      container.appendChild(el);
      setTimeout(() => el.classList.add('flip'), 120 + idx * 300);
    });

    updateDrawCount();
  }

  // ====== 顯示抽卡紀錄 modal ======
  function showHistoryModal() {
    const historyContainer = document.getElementById('history');
    historyContainer.innerHTML = '';
    history.slice().reverse().forEach(card => {
      const el = createCardElement(card);
      el.classList.add('flip'); // 直接顯示翻開
      historyContainer.appendChild(el);
    });
    openModal('historyModal');
  }

  // ====== modal 開關 ======
  function openModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.style.display = 'flex';
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.style.display = 'none';
  }

  // 綁定 modal 關閉按鈕
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const modal = e.target.closest('.modal');
      if(modal) closeModal(modal.id);
    });
  });

  // 點擊背景關閉 modal
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if(e.target === modal) closeModal(modal.id);
    });
  });

  // ====== 綁定按鈕 ======
  document.getElementById('btnSingle').addEventListener('click', singleDraw);
  document.getElementById('btnMulti').addEventListener('click', multiDraw);
  document.getElementById('btnRates').addEventListener('click', () => openModal('rateModal'));
  document.getElementById('btnHistory').addEventListener('click', showHistoryModal);

  // ====== 清空抽卡紀錄 ======
  document.getElementById('btnClearHistory').addEventListener('click', () => {
    if (!confirm("確定要清空抽卡紀錄嗎？此操作無法復原。")) return;
    history = [];
    document.getElementById('history').innerHTML = '';
  });

  // 初始化抽卡次數顯示
  updateDrawCount();
});
