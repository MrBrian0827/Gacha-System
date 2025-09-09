document.addEventListener('DOMContentLoaded', () => {

  // ====== 稀有度機率設定 ======
  let PROB_UR  = 2;
  let PROB_SSR = 5;
  let PROB_SR  = 15;
  let PROB_R   = 30;
  let PROB_N   = 100 - PROB_UR - PROB_SSR - PROB_SR - PROB_R;

  let history = [];
  let totalDraws = 0;
  let totalRounds = 0;

  const FLIP_DELAY = 400; // 每張卡片翻面的間隔(ms)

  // ====== 更新抽卡機率 modal ======
  function updateRateModal() {
    const ul = document.querySelector('#rateModal ul');
    if (!ul) return;
    ul.innerHTML = `
      <li>N 卡：${PROB_N.toFixed(2)}%</li>
      <li>R 卡：${PROB_R.toFixed(2)}%</li>
      <li>SR 卡：${PROB_SR.toFixed(2)}%</li>
      <li>SSR 卡：${PROB_SSR.toFixed(2)}%</li>
      <li>UR 卡：${PROB_UR.toFixed(2)}%</li>
    `;
  }

  updateRateModal();

  // ====== 抽卡稀有度函數 ======
  function getRarity() {
    totalDraws++;
    if (totalDraws % 200 === 0) totalRounds++;
    const roll = Math.random() * 100;
    if (roll < PROB_UR) return 'UR';
    if (roll < PROB_UR + PROB_SSR) return 'SSR';
    if (roll < PROB_UR + PROB_SSR + PROB_SR) return 'SR';
    if (roll < PROB_UR + PROB_SSR + PROB_SR + PROB_R) return 'R';
    return 'N';
  }

  // ====== 建立卡片 DOM 元素 ======
  function createCardElement(card, drawNumber = null, isSpecial = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'card';
    if (isSpecial) wrapper.classList.add('highlight', card.rarity); // SSR/UR 閃光
    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const back = document.createElement('div');
    back.className = 'card-back';
    back.textContent = '卡背';

    const front = document.createElement('div');
    front.className = 'card-front';
    front.innerHTML = `
      ${drawNumber ? `<div class="draw-number">第 ${drawNumber} 抽</div>` : ''}
      <div class="name">${card.name}</div>
      <div class="rarity rarity-${card.rarity}">${card.rarity}</div>
      <div class="image">${card.image}</div>
      <div class="effect">${card.effect}</div>
      <div class="stats"><span>⚔️ ${card.attack}</span> <span>❤️ ${card.hp}</span></div>
    `;

    inner.appendChild(back);
    inner.appendChild(front);
    wrapper.appendChild(inner);

    // ====== 單擊翻面 / 雙擊放大 ======
    let clickTimeout;
    wrapper.addEventListener('click', e => {
      if (clickTimeout) return;
      clickTimeout = setTimeout(() => {
        wrapper.classList.toggle('flip');
        clickTimeout = null;
      }, 250);
    });

    wrapper.addEventListener('dblclick', e => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }
      toggleZoom(wrapper);
    });

    return wrapper;
  }

  // ====== 更新抽卡次數顯示 ======
  function updateDrawCount() {
    const countEl = document.getElementById('drawCount');
    if (countEl) countEl.textContent = `目前第 ${totalDraws} 抽 (第 ${totalRounds+1} 輪)`;
  }

  // ====== 放大卡片 + 拖曳 ======
  let zoomedCard = null;
  function toggleZoom(cardEl) {
    if (zoomedCard && zoomedCard !== cardEl) zoomedCard.classList.remove('zoom');
    if (!cardEl.classList.contains('zoom')) {
      cardEl.classList.add('zoom');
      zoomedCard = cardEl;

      // 拖曳
      let offsetX, offsetY, isDragging = false;

      const onMouseMove = (e) => {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        x = Math.max(0, Math.min(window.innerWidth - cardEl.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - cardEl.offsetHeight, y));
        cardEl.style.left = x + 'px';
        cardEl.style.top = y + 'px';
        cardEl.style.transform = 'translate(0,0) scale(1.5)';
      };

      cardEl.addEventListener('mousedown', e => {
        isDragging = true;
        offsetX = e.clientX - cardEl.offsetLeft;
        offsetY = e.clientY - cardEl.offsetTop;
        e.preventDefault();
      });

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', () => { isDragging = false; });

      // 手機觸控拖曳
      cardEl.addEventListener('touchstart', e => {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - cardEl.offsetLeft;
        offsetY = touch.clientY - cardEl.offsetTop;
        e.preventDefault();
      });
      cardEl.addEventListener('touchmove', e => {
        if (!isDragging) return;
        const touch = e.touches[0];
        let x = touch.clientX - offsetX;
        let y = touch.clientY - offsetY;
        x = Math.max(0, Math.min(window.innerWidth - cardEl.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - cardEl.offsetHeight, y));
        cardEl.style.left = x + 'px';
        cardEl.style.top = y + 'px';
        cardEl.style.transform = 'translate(0,0) scale(1.5)';
      });
      cardEl.addEventListener('touchend', () => { isDragging = false; });
    } else {
      cardEl.classList.remove('zoom');
      zoomedCard = null;
      cardEl.style.left = '';
      cardEl.style.top = '';
      cardEl.style.transform = '';
    }
  }

  // ====== 單抽 ======
  function singleDraw() {
    const rarity = getRarity();
    const candidates = pool.filter(c => c.rarity===rarity);
    if(!candidates.length) return;
    const card = candidates[Math.floor(Math.random()*candidates.length)];
    history.push(card);

    const results = document.getElementById('results');
    results.innerHTML = '';
    const isSpecial = ['SSR','UR'].includes(card.rarity);
    const el = createCardElement(card, null, isSpecial);
    results.appendChild(el);

    if (!isSpecial) setTimeout(() => el.classList.add('flip'), FLIP_DELAY);

    updateDrawCount();
  }

  // ====== 十連抽 ======
  function multiDraw() {
    const resultsArr = [];
    let hasSRorAbove = false;

    for(let i=0;i<10;i++){
      const rarity = getRarity();
      if(['SR','SSR','UR'].includes(rarity)) hasSRorAbove=true;
      const candidates = pool.filter(c=>c.rarity===rarity);
      resultsArr.push(candidates.length>0?candidates[Math.floor(Math.random()*candidates.length)]:pool[Math.floor(Math.random()*pool.length)]);
    }

    if(!hasSRorAbove){
      const srCandidates = pool.filter(c=>c.rarity==='SR');
      if(srCandidates.length>0) resultsArr[9]=srCandidates[Math.floor(Math.random()*srCandidates.length)];
    }

    const container = document.getElementById('results');
    container.innerHTML = '';

    resultsArr.forEach((card, idx) => {
      history.push(card);
      const isSpecial = ['SSR','UR'].includes(card.rarity);
      const el = createCardElement(card, null, isSpecial);
      container.appendChild(el);

      // 逐張翻面
      setTimeout(() => {
        if(!isSpecial) el.classList.add('flip');
      }, FLIP_DELAY * idx);
    });

    updateDrawCount();
  }

  // ====== 顯示抽卡紀錄 modal ======
  function showHistoryModal() {
    const historyContainer = document.getElementById('history');
    historyContainer.innerHTML='';
    const perRow = 5;
    history.slice().forEach((card, idx) => {
      const el = createCardElement(card, idx+1, ['SSR','UR'].includes(card.rarity));
      el.classList.add('flip');
      el.style.marginRight = ((idx+1)%perRow===0)?'0':'10px';
      historyContainer.appendChild(el);
    });
    openModal('historyModal');
  }

  // ====== modal 開關 ======
  function openModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.style.display='flex';
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.style.display='none';
  }

  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const modal = e.target.closest('.modal');
      if(modal) closeModal(modal.id);
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if(e.target===modal) closeModal(modal.id);
    });
  });

  // ====== 綁定按鈕 ======
  document.getElementById('btnSingle').addEventListener('click', singleDraw);
  document.getElementById('btnMulti').addEventListener('click', multiDraw);
  document.getElementById('btnRates').addEventListener('click', () => openModal('rateModal'));
  document.getElementById('btnHistory').addEventListener('click', showHistoryModal);
  document.getElementById('btnClearHistory').addEventListener('click', () => {
    if(!confirm("確定要清空抽卡紀錄嗎？此操作無法復原。")) return;
    history=[];
    document.getElementById('history').innerHTML='';
    updateDrawCount();
  });

  updateDrawCount();
  updateRateModal();

});
