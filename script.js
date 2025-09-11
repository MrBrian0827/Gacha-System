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
    // 使用 devicePixelRatio，並 reset transform（避免重複 scale）
    const ratio = window.devicePixelRatio || 1;
    const cssW = Math.max(1, signatureCanvas.clientWidth);
    const cssH = Math.max(1, signatureCanvas.clientHeight);
    signatureCanvas.width = Math.round(cssW * ratio);
    signatureCanvas.height = Math.round(cssH * ratio);
    // reset transform to avoid stacked scaling
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 3; // CSS pixel thickness
    ctx.strokeStyle = "#2b7a78";
    ctx.lineCap = "round";
    // 清掉畫布（在 resize 時）
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function getPointerPosOnCanvas(e) {
    const rect = signatureCanvas.getBoundingClientRect();
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : (e.clientX !== undefined ? e.clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));
    const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : (e.clientY !== undefined ? e.clientY : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0));
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
  }

  // 用 pointer events（兼容 mouse/touch/stylus）
  signatureCanvas.addEventListener("pointerdown", (e) => {
    // 只有在 modal visible 時才錄製筆跡
    if (signatureModal.style.display !== "flex" && signatureModal.style.display !== "block") return;
    signatureCanvas.setPointerCapture && signatureCanvas.setPointerCapture(e.pointerId);
    drawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    // 因為 ctx.setTransform(ratio...)，我們使用 CSS pixel coords, so getPointerPosOnCanvas is fine
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    lastX = px;
    lastY = py;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    e.preventDefault();
  }, { passive: false });

  signatureCanvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    const rect = signatureCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    ctx.lineTo(px, py);
    ctx.stroke();
    lastX = px;
    lastY = py;
    e.preventDefault();
  }, { passive: false });

  signatureCanvas.addEventListener("pointerup", (e) => {
    if (!drawing) return;
    drawing = false;
    try { signatureCanvas.releasePointerCapture && signatureCanvas.releasePointerCapture(e.pointerId); } catch (err) {}
    // 隱藏 modal 並進行抽卡
    signatureModal.style.display = "none";
    // 先把畫面以 device pixels 清掉（保證下一次是空白）
    clearCanvas();
    if (pendingDrawCount > 0) {
      performDraw(pendingDrawCount);
      pendingDrawCount = 0;
    }
    e.preventDefault();
  });

  signatureCanvas.addEventListener("pointercancel", (e) => {
    drawing = false;
    try { signatureCanvas.releasePointerCapture && signatureCanvas.releasePointerCapture(e.pointerId); } catch (err) {}
  });

  function clearCanvas() {
    // 為了完整清除，先 reset transform，清除，再恢復 transform
    const ratio = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  // -------- Buttons that open signature --------
  btnSingle.addEventListener("click", () => {
    pendingDrawCount = 1;
    signatureModal.style.display = "flex";
    // 保證 canvas 正確大小（若 modal 漸顯或 CSS 影響）
    // 先下一個 event loop 才能確保 layout 穩定，但 resizeCanvas 是 safe
    setTimeout(resizeCanvas, 50);
  });

  btnMulti.addEventListener("click", () => {
    pendingDrawCount = 10;
    signatureModal.style.display = "flex";
    setTimeout(resizeCanvas, 50);
  });

  // -------- Draw logic --------
  function getRandomCardFromPool() {
    if (!Array.isArray(pool) || pool.length === 0) {
      return { name: "空卡", rarity: "N", attack: 0, hp: 0, effect: "", image: "" };
    }
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }

  function performDraw(count) {
    resultsDiv.innerHTML = ""; // 清空區域
    for (let i = 0; i < count; i++) {
      const card = getRandomCardFromPool();
      drawHistory.push(card);
      drawCount++;
      drawCountDiv.textContent = `目前第 ${drawCount} 抽`;

      // 建立卡片元素
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      // 新增 highlight class 由 CSS 處理顏色
      if (card.rarity === "SSR") cardDiv.classList.add("highlight", "SSR");
      if (card.rarity === "UR") cardDiv.classList.add("highlight", "UR");

      cardDiv.innerHTML = `
        <div class="card-inner">
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

      // Append then auto flip to show front after small delay
      resultsDiv.appendChild(cardDiv);
      // 確保 initCardInteraction 在元素存在後綁定
      initCardInteraction(cardDiv);

      // 自動翻牌（在 append 後觸發 class 在 .card 上）
      setTimeout(() => {
        cardDiv.classList.add("flip");
      }, 120 + i * 80); // 小延遲，連抽會有逐張效果
    }

    // 更新紀錄面板
    updateHistory();
  }

  function updateHistory() {
    historyDiv.innerHTML = "";
    drawHistory.forEach(card => {
      const d = document.createElement("div");
      d.className = "card";
      if (card.rarity === "SSR") d.classList.add("highlight", "SSR");
      if (card.rarity === "UR") d.classList.add("highlight", "UR");
      d.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <div class="name">${escapeHtml(card.name)}</div>
            <div class="rarity rarity-${escapeHtml(card.rarity)}">${escapeHtml(card.rarity)}</div>
          </div>
          <div class="card-back">卡背</div>
        </div>
      `;
      historyDiv.appendChild(d);
      // 可選：歷史卡也可以有互動（非必要）
      initCardInteraction(d);
    });
  }

  // 简单防 XSS（用在 innerHTML 插入可變文字時）
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // -------- Card interaction: single click flip, double-click zoom, drag when zoomed --------
  function initCardInteraction(cardDiv) {
    // 確保 inner 存在
    const inner = cardDiv.querySelector(".card-inner");
    if (!inner) return;

    // init offset values (avoid NaN)
    cardDiv.dataset.offsetX = "0";
    cardDiv.dataset.offsetY = "0";

    // click/double-click separation
    let clickTimer = null;
    const CLICK_DELAY = 250;

    function toggleZoom() {
      const zoomed = cardDiv.classList.contains("zoom");
      if (!zoomed) {
        // enter zoom
        cardDiv.classList.add("zoom");
        cardDiv.style.position = "fixed";
        cardDiv.style.left = "50%";
        cardDiv.style.top = "50%";
        // reset offsets
        cardDiv.dataset.offsetX = "0";
        cardDiv.dataset.offsetY = "0";
        cardDiv.style.transform = `translate(-50%, -50%) scale(1.5)`;
        cardDiv.style.zIndex = 9999;
        cardDiv.style.cursor = "grab";
      } else {
        // exit zoom - restore
        cardDiv.classList.remove("zoom");
        cardDiv.style.position = "";
        cardDiv.style.left = "";
        cardDiv.style.top = "";
        cardDiv.style.transform = "";
        cardDiv.style.zIndex = "";
        cardDiv.style.cursor = "";
        cardDiv.dataset.offsetX = "0";
        cardDiv.dataset.offsetY = "0";
      }
    }

    // single click => flip (toggle flip class on card element)
    cardDiv.addEventListener("click", (e) => {
      // If a double-click will occur, this handler will be cancelled by timer logic
      if (clickTimer == null) {
        clickTimer = setTimeout(() => {
          // single click action
          // only flip if not in the middle of drag/zoom action
          if (!cardDiv.classList.contains("zoom")) {
            cardDiv.classList.toggle("flip");
          } else {
            // if zoomed, allow flip as well
            cardDiv.classList.toggle("flip");
          }
          clickTimer = null;
        }, CLICK_DELAY);
      } else {
        // double click detected
        clearTimeout(clickTimer);
        clickTimer = null;
        toggleZoom();
      }
    });

    // pointer-based dragging only when zoomed
    let dragging = false;
    let startClientX = 0;
    let startClientY = 0;
    let baseOffsetX = 0;
    let baseOffsetY = 0;

    function onPointerDown(e) {
      // only start drag if zoomed
      if (!cardDiv.classList.contains("zoom")) return;
      dragging = true;
      startClientX = e.clientX;
      startClientY = e.clientY;
      baseOffsetX = parseFloat(cardDiv.dataset.offsetX) || 0;
      baseOffsetY = parseFloat(cardDiv.dataset.offsetY) || 0;
      cardDiv.setPointerCapture && cardDiv.setPointerCapture(e.pointerId);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startClientX;
      const dy = e.clientY - startClientY;
      const newX = baseOffsetX + dx;
      const newY = baseOffsetY + dy;
      cardDiv.dataset.offsetX = String(newX);
      cardDiv.dataset.offsetY = String(newY);
      // apply transform: start from center (-50%), then offset, then scale
      cardDiv.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px)) scale(1.5)`;
      e.preventDefault();
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      try { cardDiv.releasePointerCapture && cardDiv.releasePointerCapture(e.pointerId); } catch (err) {}
    }

    // attach pointer listeners to the card (works for mouse & touch)
    cardDiv.addEventListener("pointerdown", onPointerDown, { passive: false });
    cardDiv.addEventListener("pointermove", onPointerMove, { passive: false });
    cardDiv.addEventListener("pointerup", onPointerUp);
    cardDiv.addEventListener("pointercancel", onPointerUp);
  }

  // -------- rate/history/clear controls --------
  btnRates.addEventListener("click", () => {
    const ul = rateModal.querySelector("ul");
    if (!ul) return;
    ul.innerHTML = `
      <li>N: ${typeof N_CARDS !== "undefined" ? N_CARDS.length : 0}</li>
      <li>R: ${typeof R_CARDS !== "undefined" ? R_CARDS.length : 0}</li>
      <li>SR: ${typeof SR_CARDS !== "undefined" ? SR_CARDS.length : 0}</li>
      <li>SSR: ${typeof SSR_CARDS !== "undefined" ? SSR_CARDS.length : 0}</li>
      <li>UR: ${typeof UR_CARDS !== "undefined" ? UR_CARDS.length : 0}</li>
    `;
    rateModal.style.display = "flex";
  });

  btnHistory.addEventListener("click", () => {
    updateHistory();
    historyModal.style.display = "flex";
  });

  btnClearHistory.addEventListener("click", () => {
    drawHistory = [];
    updateHistory();
    resultsDiv.innerHTML = "";
    drawCount = 0;
    drawCountDiv.textContent = `目前第 ${drawCount} 抽`;
  });

  // close buttons inside modals
  document.querySelectorAll(".modal .close-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      if (modal) modal.style.display = "none";
    });
  });

}); // end DOMContentLoaded
