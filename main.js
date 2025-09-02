let pools = {};
let locales = {};
let totalDraws = 0;
let history = [];

// 音效
//const flipSound = new Audio('sounds/flip.mp3');
//const rareSound = new Audio('sounds/rare.mp3');
//const urSound = new Audio('sounds/ur.mp3');

// 中央特效容器
const effectContainer = document.createElement('div');
effectContainer.id = 'effectContainer';
document.body.appendChild(effectContainer);

// 初始化
window.onload = async () => {
  pools = await fetch("pools.json").then(res => res.json());
  locales = await fetch("locales/zh-TW.json").then(res => res.json());
  setupUI();
};

// UI 初始化
function setupUI() {
  document.getElementById("title").innerText = locales.title;
  document.getElementById("pool-label").innerText = locales.selectPool;
  document.getElementById("singleDrawBtn").innerText = locales.singleDraw;
  document.getElementById("tenDrawBtn").innerText = locales.tenDraw;
  document.getElementById("shareBtn").innerText = locales.shareLine;

  const poolSelect = document.getElementById("poolSelect");
  Object.keys(pools).forEach(key => {
    let opt = document.createElement("option");
    opt.value = key;
    opt.textContent = pools[key].name;
    poolSelect.appendChild(opt);
  });

  document.getElementById("singleDrawBtn").onclick = () => draw(1);
  document.getElementById("tenDrawBtn").onclick = () => draw(10);
  document.getElementById("shareBtn").onclick = shareLine;
}

// 抽卡
async function draw(times) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = '';
  const poolKey = document.getElementById("poolSelect").value;
  const pool = pools[poolKey].rates;

  // 建立卡片元素
  let cardEls = [];
  for (let i = 0; i < times; i++) {
    const el = document.createElement('div');
    el.className = 'card';
    resultDiv.appendChild(el);
    cardEls.push(el);
  }

  for (let i = 0; i < times; i++) {
    await new Promise(r => setTimeout(r, 300));

    totalDraws++;
    let rarity = (times === 10 && i === 9) ? getRarityAtLeastSR(pool) : getRarity(pool);

    // 200抽保底
    if (totalDraws % 200 === 0 && rarity !== "SSR" && rarity !== "UR") {
      rarity = Math.random() < 0.8 ? "SSR" : "UR";
    }

    const cards = pools[poolKey].cards[rarity];
    const card = cards[Math.floor(Math.random() * cards.length)];
    history.push({ draw: totalDraws, rarity, card });

    // 更新卡片元素
    const cardEl = cardEls[i];
    cardEl.className = `card ${rarity} flip`;
    cardEl.innerHTML = `<img src="${card.image}" alt="${card.name}">
                        <div>${card.name} (${rarity})</div>`;

    flipSound.currentTime = 0;
    flipSound.play();

    if (rarity === "SSR" || rarity === "UR") {
      cardEl.classList.add(rarity === "SSR" ? 'ssr-effect' : 'ur-effect');
      await showSpecialEffect({name: card.name, image: card.image, rarity: rarity});
    }

    cardEl.scrollIntoView({ behavior: 'smooth' });
  }

  updateCounter();
}

// 顯示中央特效
async function showSpecialEffect(card) {
  const cardEl = document.createElement('div');
  cardEl.className = 'special-card';
  cardEl.innerHTML = `<img src="${card.image}" style="width:100%; height:100%;">
                      <div style="color:white; text-align:center;">${card.name}</div>`;
  effectContainer.appendChild(cardEl);

  // 播放音效
  if(card.rarity === 'SSR') rareSound.play();
  else if(card.rarity === 'UR') urSound.play();

  // 粒子示意
  for(let i=0;i<20;i++){
    const p = document.createElement('div');
    p.className='particle';
    p.style.left = '100px';
    p.style.top = '100px';
    effectContainer.appendChild(p);
    setTimeout(()=>effectContainer.removeChild(p),1000);
  }

  await new Promise(r=>setTimeout(r,1500));
  effectContainer.removeChild(cardEl);
}

// 更新計數與歷史
function updateCounter() {
  document.getElementById("counter").innerText = `${locales.totalDraws}${totalDraws}`;
  document.getElementById("history").innerText = `${locales.history}${history.slice(-10).map(h => h.card.name + '(' + h.rarity + ')').join(", ")}`;
}

// 機率計算
function getRarity(pool) {
  let rnd = Math.random();
  let sum = 0;
  for (let item of pool) {
    sum += item.rate;
    if (rnd < sum) return item.rarity;
  }
  return "N";
}

function getRarityAtLeastSR(pool) {
  const filtered = pool.filter(p => ["SR", "SSR", "UR"].includes(p.rarity));
  let totalRate = filtered.reduce((sum, p) => sum + p.rate, 0);
  let rnd = Math.random() * totalRate;
  let sum = 0;
  for (let item of filtered) {
    sum += item.rate;
    if (rnd < sum) return item.rarity;
  }
  return "SR";
}

// 分享 LINE
function shareLine() {
  const text = `${locales.shareText}${totalDraws} 次\n最近結果：${history.slice(-10).map(h=>h.card.name+'('+h.rarity+')').join(", ")}`;
  const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}
