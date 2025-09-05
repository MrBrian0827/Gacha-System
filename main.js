// ====== 機率設定（總和需為 1）======
const rarityRates = {
  N: 0.5551666667,
  R: 0.2775833333,
  SR: 0.16655,
  SSR: 0.0005,
  UR: 0.0002
};
// ===================================

// 卡片圖片與卡背
const PLACEHOLDER_IMG = "https://via.placeholder.com/600x380.png?text=Card+Image";
const CARD_BACK_IMG = "https://via.placeholder.com/600x380.png?text=Card+Back"; // 可自行替換

window.addEventListener("DOMContentLoaded", async () => {
  let poolsRaw = null;

  try {
    const res = await fetch("./pools.json", { cache: "no-store" });
    poolsRaw = await res.json();
  } catch (err) {
    console.error("Failed to load pools.json", err);
    alert("無法載入卡池資料！");
    return;
  }

  // 將 sharedNRSCards 合併進各池
  const poolsData = {};
  for (const key of Object.keys(poolsRaw)) {
    if (key === "sharedNRSCards") continue;
    const pool = JSON.parse(JSON.stringify(poolsRaw[key])); // deep clone
    if (pool.inheritShared && Array.isArray(poolsRaw.sharedNRSCards)) {
      pool.cards = [...(pool.cards || []), ...poolsRaw.sharedNRSCards];
    }
    poolsData[key] = pool;
  }

  const poolSelect = document.getElementById("poolSelect");
  const resultsDiv = document.getElementById("results");

  // 填入卡池選單
  Object.keys(poolsData).forEach(poolName => {
    const option = document.createElement("option");
    option.value = poolName;
    option.textContent = poolsData[poolName].name || poolName;
    poolSelect.appendChild(option);
  });

  // 機率健檢
  (function checkRates(){
    const sum = Object.values(rarityRates).reduce((a,b)=>a+b,0);
    if (Math.abs(sum - 1) > 1e-6) {
      console.warn(`⚠ 稀有度機率總和 = ${sum}，不等於 1！請修正 rarityRates。`);
    }
  })();

  // 依稀有度抽
  function pickRarity() {
    const rand = Math.random();
    let acc = 0;
    const rarities = ["N","R","SR","SSR","UR"]; // 從低到高
    for (const rarity of rarities) {
      acc += rarityRates[rarity] || 0;
      if (rand < acc) return rarity;
    }
    return "N";
  }

  function drawCard(pool) {
    const rarity = pickRarity();

    const grouped = {};
    pool.cards.forEach(c => {
      if (!grouped[c.rarity]) grouped[c.rarity] = [];
      grouped[c.rarity].push(c);
    });

    const order = ["UR","SSR","SR","R","N"];
    let idx = order.indexOf(rarity);
    while (idx < order.length && (!grouped[order[idx]] || grouped[order[idx]].length === 0)) {
      idx++;
    }
    const bucket = grouped[order[idx]] || pool.cards;
    return bucket[Math.floor(Math.random() * bucket.length)];
  }

  // 卡片渲染：名稱左上、圖片中、效果在圖下、左下ATK/右下HP、右上稀有度，支持翻面
  function showCard(card, delay=0) {
    const div = document.createElement("div");
    div.className = "card fly-in";
    div.setAttribute("data-rarity", card.rarity);
    div.innerHTML = `
      <div class="rarity">${card.rarity}</div>
      <div class="name">${card.name}</div>
      <div class="card-inner">
        <div class="card-front">
          <div class="image">
            <img src="${card.image || PLACEHOLDER_IMG}" alt="${card.name}">
          </div>
          <div class="effect">${card.effect || "效果描述..."}</div>
          <div class="atk">ATK: ${card.attack}</div>
          <div class="hp">HP: ${card.hp}</div>
        </div>
        <div class="card-back">
          <img src="${CARD_BACK_IMG}" alt="Card Back">
        </div>
      </div>
    `;

    // 點擊翻轉
    div.querySelector(".card-inner").addEventListener("click", e => {
      e.currentTarget.classList.toggle("flipped");
    });

    setTimeout(() => resultsDiv.appendChild(div), delay);
  }

  // 單抽
  document.getElementById("singleDraw").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    const poolKey = poolSelect.value;
    if (!poolKey) return alert("請先選擇卡池！");
    const pool = poolsData[poolKey];
    const card = drawCard(pool);
    showCard(card);
    saveHistory(card);
  });

  // 十連抽
  document.getElementById("tenDraw").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    const poolKey = poolSelect.value;
    if (!poolKey) return alert("請先選擇卡池！");
    const pool = poolsData[poolKey];

    const got = [];
    let hasSRplus = false;
    for (let i = 0; i < 10; i++) {
      const c = drawCard(pool);
      if (["SR","SSR","UR"].includes(c.rarity)) hasSRplus = true;
      got.push(c);
      saveHistory(c);
    }
    if (!hasSRplus) {
      const srPlus = pool.cards.find(c => ["SR","SSR","UR"].includes(c.rarity));
      if (srPlus) got[0] = srPlus;
    }
    got.forEach((c,i)=>showCard(c, i*140));
  });

  document.getElementById("clear").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
  });

  // --- 歷史紀錄 ---
  function saveHistory(card) {
    const history = JSON.parse(localStorage.getItem("drawHistory") || "[]");
    history.push({
      time: new Date().toLocaleString(),
      name: card.name,
      rarity: card.rarity
    });
    localStorage.setItem("drawHistory", JSON.stringify(history));
  }
});
