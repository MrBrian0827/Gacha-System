// ====== 機率設定（總和需為 1）======
// 依你的需求：SSR=0.0005 (0.05%)，UR=0.0002 (0.02%)
// 其餘依 N50 / R25 / SR15 的量比去分配剩餘 0.9993
const rarityRates = {
  N: 0.5551666667,
  R: 0.2775833333,
  SR: 0.16655,
  SSR: 0.0005,
  UR: 0.0002
};
// ===================================

const PLACEHOLDER_IMG = "https://via.placeholder.com/600x380.png?text=Card+Image";

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

  // 依稀有度抽取
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
    // 先按稀有度抽
    const rarity = pickRarity();

    // 將卡片按稀有度分組
    const grouped = {};
    pool.cards.forEach(c => {
      if (!grouped[c.rarity]) grouped[c.rarity] = [];
      grouped[c.rarity].push(c);
    });

    // 若該稀有度沒有卡，往下尋找較低稀有度，避免抽不到
    const order = ["UR","SSR","SR","R","N"];
    let idx = order.indexOf(rarity);
    while (idx < order.length && (!grouped[order[idx]] || grouped[order[idx]].length === 0)) {
      console.warn(`⚠ [${pool.name}] 稀有度 ${order[idx]} 沒有卡，改抽下一層級。`);
      idx++;
    }
    const bucket = grouped[order[idx]] || pool.cards;
    return bucket[Math.floor(Math.random() * bucket.length)];
  }

// 卡片渲染：名稱左上、圖片中、效果在圖下、左下ATK/右下HP、右上稀有度
function showCard(card, delay = 0) {
  const div = document.createElement("div");
  div.className = "card fly-in";
  div.setAttribute("data-rarity", card.rarity);

  // 依稀有度加特效 class
  if (card.rarity === "SSR") div.classList.add("ssr");
  if (card.rarity === "UR") div.classList.add("ur");

  // 卡片內容
  div.innerHTML = `
    <div class="name">${card.name}</div>
    <div class="rarity ${card.rarity}">${card.rarity}</div> <!-- 右上角稀有度 -->
    <div class="image">
      <img src="${card.image || PLACEHOLDER_IMG}" alt="${card.name}">
    </div>
    <div class="effect">${card.effect || "效果描述..."}</div>
    <div class="atk">ATK: ${card.attack || Math.floor(Math.random() * 200 + 50)}</div>
    <div class="hp">HP: ${card.hp || Math.floor(Math.random() * 1000 + 200)}</div>
  `;

  setTimeout(() => resultsDiv.appendChild(div), delay);
  setTimeout(() => div.classList.remove("ssr", "ur"), 4000 + delay);
}

  document.getElementById("singleDraw").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    const poolKey = poolSelect.value;
    if (!poolKey) return alert("請先選擇卡池！");
    const pool = poolsData[poolKey];
    const card = drawCard(pool);
    showCard(card);
  });

  // 十連：保底至少 1 張 SR 以上（若抽出沒有，將第一張替換為該池第一張 SR+）
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
    got.forEach((c,i)=>showCard(c, i*140));
  });

  document.getElementById("clear").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
  });
});
