// ====== 稀有度機率設定（總和需為 1）======
const rarityRates = {
  N: 0.5551666667,
  R: 0.2775833333,
  SR: 0.16655,
  SSR: 0.0005,
  UR: 0.0002
};
// ===================================

// 卡片背面圖片設定（可自行替換）
const CARD_BACK_IMG = "card_back.png"; // 這裡換成你設計的背面圖片
const PLACEHOLDER_IMG = "default.png";

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

  // 將 sharedNRSCards 合併進各池（有 inheritShared: true 才合併）
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
    for (const rarity of ["N","R","SR","SSR","UR"]) {
      acc += rarityRates[rarity] || 0;
      if (rand <= acc) return rarity;
    }
    return "N"; // fallback
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

  // 生成卡片 DOM（背面先顯示）
  function showCard(card, delay=0) {
    const div = document.createElement("div");
    div.className = "card fly-in flip-card";
    div.setAttribute("data-rarity", card.rarity);
    if (card.rarity === "SSR") div.classList.add("ssr");
    if (card.rarity === "UR") div.classList.add("ur");

    div.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <img src="${CARD_BACK_IMG}" alt="Card Back">
        </div>
        <div class="flip-card-back">
          <div class="name">${card.name}</div>
          <div class="rarity">${card.rarity}</div>
          <div class="image"><img src="${card.image || PLACEHOLDER_IMG}" alt="${card.name}"></div>
          <div class="effect">${card.effect || "效果描述..."}</div>
          <div class="atk">ATK: ${card.attack || Math.floor(Math.random()*200+50)}</div>
          <div class="hp">HP: ${card.hp || Math.floor(Math.random()*1000+200)}</div>
        </div>
      </div>
    `;

    setTimeout(() => resultsDiv.appendChild(div), delay);

    // 點擊翻轉
    div.addEventListener("click", () => {
      div.classList.toggle("flipped");
    });

    setTimeout(() => div.classList.remove("ssr","ur"), 4000 + delay);

    // 紀錄抽卡
    const history = JSON.parse(localStorage.getItem("drawHistory") || "[]");
    history.push({name: card.name, rarity: card.rarity, time: new Date().toISOString()});
    localStorage.setItem("drawHistory", JSON.stringify(history));
  }

  document.getElementById("singleDraw").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    const poolKey = poolSelect.value;
    if (!poolKey) return alert("請先選擇卡池！");
    const pool = poolsData[poolKey];
    const card = drawCard(pool);
    showCard(card);
  });

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
    }
    if (!hasSRplus) {
      const srPlus = pool.cards.find(c => ["SR","SSR","UR"].includes(c.rarity));
      if (srPlus) got[0] = srPlus;
    }
    got.forEach((c,i)=>showCard(c, i*150));
  });

  document.getElementById("clear").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
  });
});
