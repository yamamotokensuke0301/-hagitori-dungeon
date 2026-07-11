(function () {
  window.HD_DATA = window.HD_DATA || {};

  window.HD_DATA.races = [
    {
      id: "human",
      name: "人間",
      description: "癖のない標準型。どの職業とも相性がよい。",
      stats: { strength: 0, speed: 0, dexterity: 0, durability: 0, luck: 0 },
      acceleration: 0,
      resistances: {},
      traits: ["平均的", "扱いやすい", "伸びしろが広い"],
    },
    {
      id: "elf",
      name: "エルフ",
      description: "速くて器用。耐久は低めだが命中と回避が高い。",
      stats: { strength: -1, speed: 2, dexterity: 2, durability: -1, luck: 1 },
      acceleration: 1,
      resistances: { poison: 1, wind: 1, illusion: 1 },
      traits: ["素早い", "器用", "毒と幻に少し強い"],
    },
    {
      id: "dwarf",
      name: "ドワーフ",
      description: "力と耐久に優れる。鈍重だが崩れにくい。",
      stats: { strength: 2, speed: -1, dexterity: 0, durability: 2, luck: -1 },
      acceleration: 0,
      resistances: { blunt: 2, steel: 2, fire: 1 },
      traits: ["重い一撃", "しぶとい", "回避は苦手"],
    },
    {
      id: "angel",
      name: "天使",
      description: "運と器用さが高く、精神面で安定している。",
      stats: { strength: 0, speed: 1, dexterity: 1, durability: 1, luck: 2 },
      acceleration: 0,
      resistances: { light: 3, curse: 2 },
      traits: ["高い運", "安定した回復力", "呪いにやや強い"],
    },
    {
      id: "demon",
      name: "悪魔",
      description: "力と素早さが高い。扱えば強いがやや粗い。",
      stats: { strength: 2, speed: 1, dexterity: -1, durability: 1, luck: 0 },
      acceleration: 0,
      resistances: { fire: 3, curse: 2, dark: 1 },
      traits: ["攻撃的", "火と呪いに少し強い", "命中はやや不安定"],
    },
    {
      id: "ghost",
      name: "幽霊",
      description: "物理に強いが、力はかなり低い。",
      stats: { strength: -3, speed: 1, dexterity: 2, durability: -1, luck: 2 },
      acceleration: 1,
      resistances: { slash: 3, blunt: 3, steel: 2, poison: "immune" },
      traits: ["物理に強い", "力が弱い", "実体の薄い存在"],
    },
    {
      id: "fairy",
      name: "妖精",
      description: "とても器用で運が高い。耐久はかなり低い。",
      stats: { strength: -1, speed: 3, dexterity: 3, durability: -2, luck: 3 },
      acceleration: 3,
      resistances: { wind: 2, illusion: 3 },
      traits: ["命中しやすい", "回避しやすい", "紙装甲"],
    },
  ];

  const newRaces = [
    ["vampire", "吸血鬼", [2, 2, 0, 0, -1], 1, { dark: 3, poison: 2, light: -1 }],
    ["android", "アンドロイド", [2, 0, 3, 2, -2], 0, { poison: "immune", steel: 3, thunder: -1 }],
    ["dark_elf", "ダークエルフ", [0, 2, 2, -1, 0], 2, { dark: 3, curse: 2, light: -1 }],
    ["alien", "宇宙生命体", [1, 1, 1, 1, 1], 1, { illusion: 3, acid: 2 }],
    ["beastkin", "獣人", [3, 2, -1, 0, 0], 1, { slash: 1, wind: 1 }],
    ["dragonkin", "竜人", [3, -1, 0, 3, -1], 0, { fire: 4, slash: 2 }],
    ["slimefolk", "スライム人", [-1, 0, 2, 2, 1], 0, { blunt: 3, poison: 3, ice: -1 }],
    ["golem", "ゴーレム", [4, -3, -1, 5, -2], -2, { blunt: 3, steel: 3, poison: "immune" }],
    ["cyborg", "サイボーグ", [2, 1, 2, 1, -1], 2, { steel: 2, thunder: -1 }],
    ["merfolk", "魚人", [1, 0, 1, 2, 0], 0, { water: 4, ice: 2, thunder: -1 }],
    ["insectoid", "昆虫人", [1, 2, 2, 1, -1], 2, { poison: 2, slash: 2, fire: -1 }],
    ["plantfolk", "植物人", [0, -1, 0, 3, 2], 0, { earth: 3, poison: 3, fire: -2 }],
    ["werewolf", "狼人間", [3, 3, -1, 1, -1], 2, { dark: 2, slash: 1, steel: -1 }],
    ["homunculus", "ホムンクルス", [0, 1, 2, 0, 2], 1, { poison: 2, curse: 2 }],
    ["oni", "鬼", [5, 0, -2, 2, -1], 0, { blunt: 2, fire: 1 }],
    ["machine", "機械生命", [2, 1, 2, 3, -3], 1, { steel: 4, poison: "immune", acid: -2 }],
    ["shadow", "影人", [-2, 4, 2, -2, 1], 4, { dark: 4, slash: 2, light: -2 }],
    ["celestial", "星界人", [0, 2, 2, 0, 2], 2, { light: 3, illusion: 3 }],
    ["deep_one", "深海種", [2, -1, 1, 3, 0], 0, { water: 4, dark: 2, thunder: -1 }],
    ["chaosborn", "混沌体", [1, 1, 1, -1, 3], 1, { curse: 3, illusion: 3, light: -1 }],
  ];
  newRaces.forEach(([id, name, values, acceleration, resistances]) => {
    const [strength, speed, dexterity, durability, luck] = values;
    window.HD_DATA.races.push({ id, name, description: `${name}固有の身体特性を持つ。`, stats: { strength, speed, dexterity, durability, luck }, acceleration, resistances, traits: [`${name}固有`, `加速度${acceleration}`, "属性適性あり"] });
  });
  window.HD_DATA.races.push(
    {
      id: "high_elf",
      name: "ハイエルフ",
      description: "古い森の魔力を受け継ぐエルフの完全上位種。全能力と魔力感知に優れ、透明な存在も見抜く。",
      stats: { strength: 0, speed: 4, dexterity: 5, durability: 0, luck: 4 },
      acceleration: 5,
      resistances: { poison: 2, wind: 4, illusion: 4, light: 3, curse: 2 },
      traits: ["エルフの完全上位", "卓越した器用さと速度", "透明視認"],
    },
    {
      id: "superhuman",
      name: "超人",
      description: "人間の限界を完全に越えた上位種。力・速さ・器用さ・耐久・運の全てが高い。",
      stats: { strength: 6, speed: 5, dexterity: 4, durability: 6, luck: 3 },
      acceleration: 6,
      resistances: { slash: 3, blunt: 3, steel: 3, curse: 1, illusion: 1 },
      traits: ["人間の完全上位", "人外の腕力と耐久", "高速行動"],
    },
    {
      id: "slime",
      name: "スライム",
      description: "まだ何者にもなれていない純粋な粘体。毒は効かないが、全種族で最も弱い。",
      stats: { strength: -6, speed: -4, dexterity: -3, durability: -5, luck: -3 },
      acceleration: -4,
      resistances: { poison: "immune", blunt: 2, acid: 1, fire: -3, ice: -2 },
      traits: ["全種族中で最弱", "毒無効", "火と氷に弱い"],
    },
  );
  const invisibleSightRaces = new Set(["ghost", "android", "alien", "insectoid", "machine", "shadow", "celestial", "high_elf"]);
  window.HD_DATA.races.forEach((race) => {
    if (!invisibleSightRaces.has(race.id)) return;
    race.canSeeInvisible = true;
    race.traits.push("透明な魔物を視認できる");
    race.description += " 透明な存在の輪郭を捉えられる。";
  });
})();
