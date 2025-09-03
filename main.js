// ====== 抽卡機率設定 (直接改這裡就好) ======
const rarityRates = {
  N: 0.5873684211,     // 普通卡
  R: 0.2447368421,    // 稀有卡
  SR: 0.0978947368,    // 超稀有卡
  SSR: 0.05, // 超超稀有卡
  UR: 0.02   // 最稀有卡
};
// ==========================================

window.addEventListener("DOMContentLoaded", async () => {
  let poolsData = null;

  try {
    const res = await fetch("./pools.json");
    poolsData = await res.json();
  } catch (err) {
    console.error("Failed to load pools.json", err);
    alert("無法載入卡池資料！");
    return;
  }

  const poolSelect = document.getElementById("poolSelect");
  const resultsDiv = document.getElementById("results");

  Object.keys(poolsData).forEach(poolName => {
    const option = document.createElement("option");
    option.value = poolName;
    option.textContent = poolsData[poolName].name;
    poolSelect.appendChild(option);
  });

  // 依照 rarityRates 抽卡
  function drawCard(pool) {
    const rand = Math.random();
    let sum = 0;

    // 先分類卡片
    const grouped = {};
    pool.cards.forEach(card => {
      if (!grouped[card.rarity]) grouped[card.rarity] = [];
      grouped[card.rarity].push(card);
    });

    // 依照機率選稀有度
    for (const rarity in rarityRates) {
      sum += rarityRates[rarity];
      if (rand <= sum) {
        const cards = grouped[rarity];
        if (!cards || cards.length === 0) {
          console.warn(`⚠ 稀有度 [${rarity}] 在卡池中沒有卡片！`);
          break; // 沒卡可抽，跳過
        }
        return cards[Math.floor(Math.random() * cards.length)];
      }
    }

    // 保險措施，回傳最後一張
    return pool.cards[pool.cards.length - 1];
  }

  function showCard(card, delay=0) {
    const div = document.createElement("div");
    div.className = "card fly-in";
    div.setAttribute("data-rarity", card.rarity);
    if (card.rarity === "SSR") div.classList.add("ssr");
    if (card.rarity === "UR") div.classList.add("ur");
    div.innerHTML = `
      <strong>${card.name}</strong> (${card.rarity})<br>
      ${card.skill ? `技能: ${card.skill}<br>` : ''}
      ${card.effect ? `效果: ${card.effect}<br>` : ''}
      ${card.element ? `屬性: ${card.element}<br>` : ''}
      ${card.description ? `${card.description}` : ''}
    `;
    setTimeout(() => resultsDiv.appendChild(div), delay);
    setTimeout(() => div.classList.remove("ssr","ur"), 4000 + delay);
  }

  document.getElementById("singleDraw").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    const poolName = poolSelect.value;
    if (!poolName) return alert("請先選擇卡池！");
    const pool = poolsData[poolName];
    const card = drawCard(pool);
    showCard(card);
  });

  document.getElementById("tenDraw").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    const poolName = poolSelect.value;
    if (!poolName) return alert("請先選擇卡池！");
    const pool = poolsData[poolName];

    let gotSRorAbove = false;
    const cards = [];
    for (let i=0;i<10;i++){
      const card = drawCard(pool);
      if(["SR","SSR","UR"].includes(card.rarity)) gotSRorAbove=true;
      cards.push(card);
    }
    if(!gotSRorAbove){
      const srCard = pool.cards.find(c=>["SR","SSR","UR"].includes(c.rarity));
      if(srCard) cards[0]=srCard;
    }
    cards.forEach((card,i)=>showCard(card,i*200));
  });
});
