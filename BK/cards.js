// ====== 卡片設定區 (可直接新增/刪除/修改) ======

// N 卡
const N_CARDS = [
  { name: "N卡角色1", rarity: "N", attack: 0, hp: 0, effect: "效果N1", image: "圖片N1" },
  { name: "N卡角色2", rarity: "N", attack: 10, hp: 20, effect: "效果N2", image: "圖片N2" },
  { name: "N卡角色3", rarity: "N", attack: 30, hp: 40, effect: "效果N3", image: "圖片N3" },
  { name: "N卡角色4", rarity: "N", attack: 50, hp: 60, effect: "效果N4", image: "圖片N4" },
  { name: "N卡角色5", rarity: "N", attack: 70, hp: 80, effect: "效果N5", image: "圖片N5" },
  { name: "N卡角色6", rarity: "N", attack: 90, hp: 100, effect: "效果N6", image: "圖片N6" },
  { name: "N卡角色7", rarity: "N", attack: 110, hp: 120, effect: "效果N7", image: "圖片N7" },
  { name: "N卡角色8", rarity: "N", attack: 130, hp: 140, effect: "效果N8", image: "圖片N8" },
  { name: "N卡角色9", rarity: "N", attack: 150, hp: 160, effect: "效果N9", image: "圖片N9" },
  { name: "N卡角色10", rarity: "N", attack: 170, hp: 180, effect: "效果N10", image: "圖片N10" },
  { name: "N卡角色11", rarity: "N", attack: 190, hp: 200, effect: "效果N11", image: "圖片N11" },
  { name: "N卡角色12", rarity: "N", attack: 210, hp: 220, effect: "效果N12", image: "圖片N12" },
  { name: "N卡角色13", rarity: "N", attack: 230, hp: 240, effect: "效果N13", image: "圖片N13" },
  { name: "N卡角色14", rarity: "N", attack: 250, hp: 260, effect: "效果N14", image: "圖片N14" },
  { name: "N卡角色15", rarity: "N", attack: 270, hp: 280, effect: "效果N15", image: "圖片N15" },
  { name: "N卡角色16", rarity: "N", attack: 290, hp: 300, effect: "效果N16", image: "圖片N16" },
  { name: "N卡角色17", rarity: "N", attack: 0, hp: 10, effect: "效果N17", image: "圖片N17" },
  { name: "N卡角色18", rarity: "N", attack: 20, hp: 30, effect: "效果N18", image: "圖片N18" },
  { name: "N卡角色19", rarity: "N", attack: 40, hp: 50, effect: "效果N19", image: "圖片N19" },
  { name: "N卡角色20", rarity: "N", attack: 60, hp: 70, effect: "效果N20", image: "圖片N20" }
];

// R 卡
const R_CARDS = [
  { name: "R卡角色1", rarity: "R", attack: 80, hp: 90, effect: "效果R1", image: "圖片R1" },
  { name: "R卡角色2", rarity: "R", attack: 100, hp: 110, effect: "效果R2", image: "圖片R2" },
  { name: "R卡角色3", rarity: "R", attack: 120, hp: 130, effect: "效果R3", image: "圖片R3" },
  { name: "R卡角色4", rarity: "R", attack: 140, hp: 150, effect: "效果R4", image: "圖片R4" },
  { name: "R卡角色5", rarity: "R", attack: 160, hp: 170, effect: "效果R5", image: "圖片R5" },
  { name: "R卡角色6", rarity: "R", attack: 180, hp: 190, effect: "效果R6", image: "圖片R6" },
  { name: "R卡角色7", rarity: "R", attack: 200, hp: 210, effect: "效果R7", image: "圖片R7" },
  { name: "R卡角色8", rarity: "R", attack: 220, hp: 230, effect: "效果R8", image: "圖片R8" },
  { name: "R卡角色9", rarity: "R", attack: 240, hp: 250, effect: "效果R9", image: "圖片R9" },
  { name: "R卡角色10", rarity: "R", attack: 260, hp: 270, effect: "效果R10", image: "圖片R10" },
  { name: "R卡角色11", rarity: "R", attack: 280, hp: 290, effect: "效果R11", image: "圖片R11" },
  { name: "R卡角色12", rarity: "R", attack: 300, hp: 0, effect: "效果R12", image: "圖片R12" },
  { name: "R卡角色13", rarity: "R", attack: 10, hp: 20, effect: "效果R13", image: "圖片R13" },
  { name: "R卡角色14", rarity: "R", attack: 30, hp: 40, effect: "效果R14", image: "圖片R14" },
  { name: "R卡角色15", rarity: "R", attack: 50, hp: 60, effect: "效果R15", image: "圖片R15" }
];

// SR 卡
const SR_CARDS = [
  { name: "SR卡角色1", rarity: "SR", attack: 70, hp: 80, effect: "效果SR1", image: "圖片SR1" },
  { name: "SR卡角色2", rarity: "SR", attack: 90, hp: 100, effect: "效果SR2", image: "圖片SR2" },
  { name: "SR卡角色3", rarity: "SR", attack: 110, hp: 120, effect: "效果SR3", image: "圖片SR3" },
  { name: "SR卡角色4", rarity: "SR", attack: 130, hp: 140, effect: "效果SR4", image: "圖片SR4" },
  { name: "SR卡角色5", rarity: "SR", attack: 150, hp: 160, effect: "效果SR5", image: "圖片SR5" },
  { name: "SR卡角色6", rarity: "SR", attack: 160, hp: 170, effect: "效果SR6", image: "圖片SR6" },
  { name: "SR卡角色7", rarity: "SR", attack: 170, hp: 180, effect: "效果SR7", image: "圖片SR7" }
];

// SSR 卡
const SSR_CARDS = [
  { name: "SSR卡角色1", rarity: "SSR", attack: 170, hp: 180, effect: "效果SSR1", image: "圖片SSR1" },
  { name: "SSR卡角色2", rarity: "SSR", attack: 190, hp: 200, effect: "效果SSR2", image: "圖片SSR2" },
  { name: "SSR卡角色3", rarity: "SSR", attack: 210, hp: 220, effect: "效果SSR3", image: "圖片SSR3" },
  { name: "SSR卡角色4", rarity: "SSR", attack: 230, hp: 240, effect: "效果SSR4", image: "圖片SSR4" },
  { name: "SSR卡角色5", rarity: "SSR", attack: 250, hp: 260, effect: "效果SSR5", image: "圖片SSR5" }
];

// UR 卡
const UR_CARDS = [
  { name: "UR卡角色1", rarity: "UR", attack: 300, hp: 300, effect: "效果UR1", image: "圖片UR1" },
  { name: "UR卡角色2", rarity: "UR", attack: 250, hp: 250, effect: "效果UR2", image: "圖片UR2" },
  { name: "UR卡角色3", rarity: "UR", attack: 200, hp: 200, effect: "效果UR3", image: "圖片UR3" }
];

// ====== 自動生成 pool ======
const pool = [
  ...N_CARDS,
  ...R_CARDS,
  ...SR_CARDS,
  ...SSR_CARDS,
  ...UR_CARDS
];
