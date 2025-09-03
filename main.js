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

  // 動態建立卡池選項
  Object.keys(poolsData).forEach(poolKey => {
    const option = document.createElement("option");
    option.value = poolKey;
    option.textContent = poolsData[poolKey].name;
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
    return pool.cards[pool.cards.length - 1]; // 保底
  }

  // 顯示卡片
  function showCard(card, delay=0) {
    const div = document.createElement("div");
    div.className = "card fly-in";
    div.setAttribute("data-rarity", card.rarity);
    if (card.rarity === "SSR") div.classList.add("ssr");
    if (card.rarity === "UR") div.classList.add("ur");

    let content = `<strong>${card.name}</strong> (${card.rarity})<br>`;
    if (card.skill) content += `技能: ${card.skill}<br>`;
    if (card.effect) content += `效果: ${card.effect}<br>`;
    if (card.element) content += `屬性: ${card.element}<br>`;
    if (card.description) content += `${card.description}`;

    div.innerHTML = content;
    setTimeout(() => resultsDiv.appendChild(div), delay);

    // 動畫結束後移除 class，避免重複觸發
    setTimeout(() => div.classList.remove("ssr","ur"), 4000 + delay);
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

  // 十連抽 (保底至少 1 張 SR)
  document.getElementById("tenDraw").addEventListener("click", () => {
    resultsDiv.innerHTML = "";
    const poolName = poolSelect.value;
    if (!poolName) return alert("請先選擇卡池！");
    const pool = poolsData[poolName];

    let gotSRorAbove = false;
    const cards = [];
    for (let i=0;i<10;i++){
      const card = drawCard(pool);
      if(["SR","SSR","UR"].includes(card.rarity)) gotSRorAbove = true;
      cards.push(card);
    }
    if(!gotSRorAbove){
      const srCard = pool.cards.find(c=>["SR","SSR","UR"].includes(c.rarity));
      if(srCard) cards[0]=srCard;
    }
    cards.forEach((card,i)=>showCard(card,i*200));
  });
});
