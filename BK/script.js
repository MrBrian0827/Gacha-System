// 完整修正版 script.js（替換整個檔案）
document.addEventListener("DOMContentLoaded", () => {

  // -------- DOM references --------
  const resultsDiv = document.getElementById("results");
  const drawCountDiv = document.getElementById("drawCount");
  const historyDiv = document.getElementById("history");
  const signatureModal = document.getElementById("signatureModal");
  const signatureCanvas = document.getElementById("signatureCanvas");
  const rateModal = document.getElementById("rateModal");
  const historyModal = document.getElementById("historyModal");

  const btnSingle = document.getElementById("btnSingle");
  const btnMulti = document.getElementById("btnMulti");
  const btnRates = document.getElementById("btnRates");
  const btnHistory = document.getElementById("btnHistory");
  const btnClearHistory = document.getElementById("btnClearHistory");

  // -------- state --------
  let drawCount = 0;
  let drawHistory = [];
  let pendingDrawCount = 0;

  // -------- Canvas setup & helpers --------
  const ctx = signatureCanvas.getContext("2d");
  let drawing = false;
  let lastX = 0, lastY = 0;

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const cssW = Math.max(1, signatureCanvas.clientWidth);
    const cssH = Math.max(1, signatureCanvas.clientHeight);
    signatureCanvas.width = Math.round(cssW * ratio);
    signatureCanvas.height = Math.round(cssH * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#2b7a78";
    ctx.lineCap = "round";
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function getPointerPosOnCanvas(e) {
    const rect = signatureCanvas.getBoundingClientRect();
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : (e.clientX !== undefined ? e.clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));
    const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : (e.clientY !== undefined ? e.clientY : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0));
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  signatureCanvas.addEventListener("pointerdown", (e) => {
    if (!["flex", "block"].includes(signatureModal.style.display)) return;
    signatureCanvas.setPointerCapture && signatureCanvas.setPointerCapture(e.pointerId);
    drawing = true;
    const pos = getPointerPosOnCanvas(e);
    lastX = pos.x; lastY = pos.y;
    ctx.beginPath(); ctx.moveTo(lastX, lastY);
    e.preventDefault();
  }, { passive: false });

  signatureCanvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const pos = getPointerPosOnCanvas(e);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
    lastX = pos.x; lastY = pos.y;
    e.preventDefault();
  }, { passive: false });

  signatureCanvas.addEventListener("pointerup", (e) => {
    if (!drawing) return;
    drawing = false;
    try { signatureCanvas.releasePointerCapture && signatureCanvas.releasePointerCapture(e.pointerId); } catch (err) {}
    signatureModal.style.display = "none";
    clearCanvas();
    if (pendingDrawCount > 0) { performDraw(pendingDrawCount); pendingDrawCount = 0; }
    e.preventDefault();
  });

  signatureCanvas.addEventListener("pointercancel", (e) => { drawing = false; try { signatureCanvas.releasePointerCapture && signatureCanvas.releasePointerCapture(e.pointerId); } catch {} });

  function clearCanvas() {
    const ratio = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  // -------- Buttons that open signature --------
  btnSingle.addEventListener("click", () => { pendingDrawCount = 1; signatureModal.style.display = "flex"; setTimeout(resizeCanvas, 50); });
  btnMulti.addEventListener("click", () => { pendingDrawCount = 10; signatureModal.style.display = "flex"; setTimeout(resizeCanvas, 50); });

  // -------- Draw logic --------
  function getRandomCardFromPool() {
    if (!Array.isArray(pool) || pool.length === 0) return { name: "空卡", rarity: "N", attack: 0, hp: 0, effect: "", image: "" };
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }

  function performDraw(count) {
    resultsDiv.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const card = getRandomCardFromPool();
      drawHistory.push(card);
      drawCount++;
      drawCountDiv.textContent = `目前第 ${drawCount} 抽`;

      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      if (card.rarity === "SSR") cardDiv.classList.add("highlight", "SSR");
      if (card.rarity === "UR") cardDiv.classList.add("highlight", "UR");

      cardDiv.innerHTML = `
        <div class="card-inner flip">
          <div class="card-front">
            <div class="name">${escapeHtml(card.name)}</div>
            <div class="rarity rarity-${escapeHtml(card.rarity)}">${escapeHtml(card.rarity)}</div>
            <div class="image">${escapeHtml(card.image)}</div>
            <div class="effect">${escapeHtml(card.effect)}</div>
            <div class="stats">ATK:${escapeHtml(String(card.attack))} HP:${escapeHtml(String(card.hp))}</div>
          </div>
          <div class="card-back">卡背</div>
        </div>
      `;
      resultsDiv.appendChild(cardDiv);
      initCardInteraction(cardDiv);
      setTimeout(() => { cardDiv.classList.add("flip"); }, 120 + i * 80);
    }
    updateHistory();
  }

  function updateHistory() {
  historyDiv.innerHTML = "";
  drawHistory.forEach((card, index) => {
    const d = document.createElement("div");
    d.className = "card flip"; // <- 加上 flip 預設正面
    if (card.rarity === "SSR") d.classList.add("highlight", "SSR");
    if (card.rarity === "UR") d.classList.add("highlight", "UR");

    d.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <div class="name">${escapeHtml(card.name)}</div>
          <div class="rarity rarity-${escapeHtml(card.rarity)}">${escapeHtml(card.rarity)}</div>
          <div class="image">${escapeHtml(card.image)}</div>
          <div class="effect">${escapeHtml(card.effect)}</div>
          <div class="stats">ATK:${escapeHtml(String(card.attack))} HP:${escapeHtml(String(card.hp))}</div>
          <div class="draw-number">第 ${index + 1} 抽</div>
        </div>
        <div class="card-back">卡背</div>
      </div>
    `;

    historyDiv.appendChild(d);
    initCardInteraction(d);
  });
}






  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function initCardInteraction(cardDiv) {
    const inner = cardDiv.querySelector(".card-inner");
    if (!inner) return;

    cardDiv.dataset.offsetX = "0"; cardDiv.dataset.offsetY = "0";
    let clickTimer = null;
    const CLICK_DELAY = 250;

    function toggleZoom() {
      const zoomed = cardDiv.classList.contains("zoom");
      if (!zoomed) {
        cardDiv.classList.add("zoom");
        cardDiv.style.position = "fixed";
        cardDiv.style.left = "50%"; cardDiv.style.top = "50%";
        cardDiv.dataset.offsetX = "0"; cardDiv.dataset.offsetY = "0";
        cardDiv.style.transform = `translate(-50%, -50%) scale(1.5)`; // 固定放大 1.5 倍
        cardDiv.style.zIndex = 9999; cardDiv.style.cursor = "grab";
      } else {
        cardDiv.classList.remove("zoom");
        cardDiv.style.position = ""; cardDiv.style.left = ""; cardDiv.style.top = "";
        cardDiv.style.transform = ""; cardDiv.style.zIndex = ""; cardDiv.style.cursor = "";
        cardDiv.dataset.offsetX = "0"; cardDiv.dataset.offsetY = "0";
      }
    }

    cardDiv.addEventListener("click", (e) => {
      if (clickTimer == null) {
        clickTimer = setTimeout(() => { cardDiv.classList.toggle("flip"); clickTimer = null; }, CLICK_DELAY);
      } else { clearTimeout(clickTimer); clickTimer = null; toggleZoom(); }
    });

    let dragging = false, startX=0, startY=0, baseX=0, baseY=0;

    function onPointerDown(e) {
      if (!cardDiv.classList.contains("zoom")) return;
      dragging = true; startX=e.clientX; startY=e.clientY;
      baseX=parseFloat(cardDiv.dataset.offsetX)||0; baseY=parseFloat(cardDiv.dataset.offsetY)||0;
      cardDiv.setPointerCapture && cardDiv.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const dx=e.clientX-startX, dy=e.clientY-startY;
      const newX=baseX+dx, newY=baseY+dy;
      cardDiv.dataset.offsetX=newX; cardDiv.dataset.offsetY=newY;
      cardDiv.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px)) scale(1.5)`; // 拖曳 transform
      e.preventDefault();
    }
    function onPointerUp(e) { if(!dragging) return; dragging=false; try{cardDiv.releasePointerCapture&&cardDiv.releasePointerCapture(e.pointerId);}catch{} }

    cardDiv.addEventListener("pointerdown", onPointerDown, { passive:false });
    cardDiv.addEventListener("pointermove", onPointerMove, { passive:false });
    cardDiv.addEventListener("pointerup", onPointerUp);
    cardDiv.addEventListener("pointercancel", onPointerUp);
  }

  // -------- rate/history/clear controls --------
  btnRates.addEventListener("click", () => {
    const ul = rateModal.querySelector("ul"); if (!ul) return;
    ul.innerHTML = `
      <li>N: ${typeof N_CARDS!=="undefined"?N_CARDS.length:0}</li>
      <li>R: ${typeof R_CARDS!=="undefined"?R_CARDS.length:0}</li>
      <li>SR: ${typeof SR_CARDS!=="undefined"?SR_CARDS.length:0}</li>
      <li>SSR: ${typeof SSR_CARDS!=="undefined"?SSR_CARDS.length:0}</li>
      <li>UR: ${typeof UR_CARDS!=="undefined"?UR_CARDS.length:0}</li>
    `;
    rateModal.style.display = "flex";
  });

  btnHistory.addEventListener("click", () => { updateHistory(); historyModal.style.display = "flex"; });

  btnClearHistory.addEventListener("click", () => {
    drawHistory=[]; updateHistory(); resultsDiv.innerHTML="";
    drawCount=0; drawCountDiv.textContent=`目前第 ${drawCount} 抽`;
  });

  document.querySelectorAll(".modal .close-btn").forEach(btn => {
    btn.addEventListener("click",(e)=>{ const modal=e.target.closest(".modal"); if(modal) modal.style.display="none"; });
  });

}); // end DOMContentLoaded
