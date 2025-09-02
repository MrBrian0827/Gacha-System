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

  // 初始化下拉選單
  Object.keys(poolsData).forEach(poolName => {
    const option = document.createElement("option");
    option.value = poolName;
    option.textContent = poolsData[poolName].name;
    poolSelect.appendChild(option);
  });

  // 抽卡邏輯
  function drawCard(pool) {
    const rand = Math.random();
    let sum = 0;
    for (const card of pool.cards) {
      sum += card.rate || 0;
      if (rand <= sum) return card;
    }
    return pool.cards[pool.cards.length - 1];
  }

  function showCard(card) {
    const div = document.createElement("div");
    div.className = "card";
    div.setAttribute("data-rarity", card.rarity); // 用稀有度控制顏色
    div.innerHTML = `
      <strong>${card.name}</strong> (${card.rarity})<br>
      ${card.skill ? `技能: ${card.skill}<br>` : ''}
      ${card.effect ? `效果: ${card.effect}<br>` : ''}
      ${card.element ? `屬性: ${card.element}<br>` : ''}
      ${card.description ? `${card.description}` : ''}
    `;
    resultsDiv.appendChild(div);
  }

  // 單抽
  document.getElementById("singleDraw").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    const poolName = poolSelect.value;
    if (!poolName) return alert("請先選擇卡池！");
    const pool = poolsData[poolName];
    const card = drawCard(pool);
    showCard(card);
  });

  // 十連抽（保底一張 SR）
  document.getElementById("tenDraw").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    const poolName = poolSelect.value;
    if (!poolName) return alert("請先選擇卡池！");
    const pool = poolsData[poolName];

    let gotSRorAbove = false;
    const cards = [];
    for (let i = 0; i < 10; i++) {
      const card = drawCard(pool);
      if (["SR","SSR","UR"].includes(card.rarity)) gotSRorAbove = true;
      cards.push(card);
    }
    if (!gotSRorAbove) {
      const srCard = pool.cards.find(c => ["SR","SSR","UR"].includes(c.rarity));
      if (srCard) cards[0] = srCard;
    }
    cards.forEach(showCard);
  });
});
