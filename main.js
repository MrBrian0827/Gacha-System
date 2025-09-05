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

  // 載入卡池到選單
  Object.keys(poolsData).forEach(poolName => {
    const option = document.createElement("option");
    option.value = poolName;
    option.textContent = poolsData[poolName].name;
    poolSelect.appendChild(option);
  });

  // 儲存抽卡紀錄
  function saveHistory(card) {
    const history = JSON.parse(localStorage.getItem("gachaHistory")) || [];
    history.push({
      name: card.name,
      rarity: card.rarity,
      skill: card.skill,
      effect: card.effect,
      time: new Date().toLocaleString()
    });
    localStorage.setItem("gachaHistory", JSON.stringify(history));
  }

  // 抽卡
  function drawCard(pool) {
    const rand = Math.random();
    let sum = 0;
    for (const card of pool.cards) {
      sum += card.rate || 0;
      if (rand <= sum) return card;
    }
    return pool.cards[pool.cards.length - 1]; // fallback
  }

  // 顯示卡片
  function showCard(card, delay = 0) {
    const div = document.createElement("div");
    div.className = "card fly-in";
    div.setAttribute("data-rarity", card.rarity);

    div.innerHTML = `
      <div class="rarity-label ${card.rarity}">${card.rarity}</div>
      <strong>${card.name}</strong><br>
      ${card.skill ? `技能: ${card.skill}<br>` : ""}
      ${card.effect ? `效果: ${card.effect}<br>` : ""}
    `;

    setTimeout(() => resultsDiv.appendChild(div), delay);

    // ✅ 儲存紀錄
    saveHistory(card);
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

  // 十連抽
  document.getElementById("tenDraw").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    const poolName = poolSelect.value;
    if (!poolName) return alert("請先選擇卡池！");
    const pool = poolsData[poolName];

    let gotSRorAbove = false;
    const cards = [];

    for (let i = 0; i < 10; i++) {
      const card = drawCard(pool);
      if (["SR", "SSR", "UR"].includes(card.rarity)) gotSRorAbove = true;
      cards.push(card);
    }

    // 保底機制
    if (!gotSRorAbove) {
      const srCard = pool.cards.find(c => ["SR", "SSR", "UR"].includes(c.rarity));
      if (srCard) cards[0] = srCard;
    }

    cards.forEach((card, i) => showCard(card, i * 200));
  });
});
