(function () {
  "use strict";

  window.HD_DATA = window.HD_DATA || {};
  window.HD_DATA.personalities = [
    { id: "gentle", name: "おだやか", stats: { strength: -1, speed: 0, dexterity: 0, durability: 1, luck: 1 }, growth: { every: 5, order: ["durability", "luck"] }, description: "力は控えめ。耐久力と運が伸びやすい。" },
    { id: "brave", name: "ゆうかん", stats: { strength: 2, speed: 0, dexterity: 0, durability: 0, luck: -1 }, growth: { every: 5, order: ["strength"] }, description: "力が高く、レベル成長でも力を得やすい。" },
    { id: "careful", name: "しんちょう", stats: { strength: 0, speed: -1, dexterity: 0, durability: 2, luck: 0 }, growth: { every: 5, order: ["durability"] }, description: "動きは遅めだが、耐久力が着実に伸びる。" },
    { id: "quick", name: "すばしこい", stats: { strength: 0, speed: 2, dexterity: 0, durability: -1, luck: 0 }, growth: { every: 5, order: ["speed"] }, description: "耐久力を削り、素早さの成長へ寄せる。" },
    { id: "skillful", name: "きよう", stats: { strength: -1, speed: 0, dexterity: 2, durability: 0, luck: 0 }, growth: { every: 5, order: ["dexterity"] }, description: "力は低めだが、器用さと命中が伸びやすい。" },
    { id: "lucky", name: "こううん", stats: { strength: 0, speed: 0, dexterity: 0, durability: -1, luck: 2 }, growth: { every: 5, order: ["luck"] }, description: "打たれ弱い代わりに、運の成長へ偏る。" },
    { id: "stubborn", name: "がんこ", stats: { strength: 1, speed: 0, dexterity: -1, durability: 1, luck: 0 }, growth: { every: 6, order: ["strength", "durability"] }, description: "器用さを捨て、力と耐久力を交互に伸ばす。" },
    { id: "hasty", name: "せっかち", stats: { strength: 0, speed: 2, dexterity: 1, durability: -2, luck: 0 }, growth: { every: 6, order: ["speed", "dexterity"] }, description: "かなり脆いが、素早さと器用さが伸びる。" },
    { id: "calm", name: "れいせい", stats: { strength: 0, speed: -1, dexterity: 1, durability: 0, luck: 1 }, growth: { every: 6, order: ["dexterity", "luck"] }, description: "素早さより、器用さと運を重視する。" },
    { id: "whimsical", name: "きまぐれ", stats: { strength: -1, speed: 1, dexterity: -1, durability: 1, luck: 1 }, growth: { every: 4, order: ["luck", "speed", "durability", "dexterity", "strength"] }, description: "初期能力も追加成長も偏りが巡る、読みにくい性格。" },
  ];
})();
