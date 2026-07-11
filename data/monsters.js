(function () {
  window.HD_DATA = window.HD_DATA || {};

  window.HD_DATA.monsters = [
    {
      id: "cave_rat",
      name: "洞窟ネズミ",
      glyph: "鼠",
      floors: [1, 2],
      hp: 12,
      attack: 4,
      defense: 0,
      attackAttribute: "blunt",
      weaknesses: ["slash"],
      resistances: {},
      dangerous: null,
      loot: [
        { condition: "default", material: "small_beast_meat" },
        { condition: { lastAttribute: "slash" }, material: "rat_tail" },
        { condition: { lastSkill: "sever" }, material: "rat_tail" },
      ],
      research: {
        1: "HPは低い。主な攻撃属性は打。",
        2: "斬属性が弱点。剣士の通常攻撃で倒しやすい。",
        3: "斬属性か切断撃でとどめを刺すと洞窟ネズミの尾を得やすい。",
      },
    },
    {
      id: "carapace_rat",
      name: "甲殻ネズミ",
      glyph: "甲",
      floors: [1, 2, 3],
      hp: 18,
      attack: 5,
      defense: 2,
      attackAttribute: "blunt",
      weaknesses: ["blunt"],
      resistances: { slash: 1 },
      dangerous: null,
      loot: [
        { condition: "default", material: "small_beast_meat" },
        { condition: { lastAttribute: "slash" }, material: "clean_pelt" },
        { condition: { lastAttribute: "blunt" }, material: "broken_carapace" },
        { condition: { lastAttribute: "fire" }, material: "scorched_hide" },
        { condition: { lastSkill: "precise" }, material: "fine_pelt" },
      ],
      research: {
        1: "硬い甲殻を持つ。主な攻撃属性は打。",
        2: "打属性が弱点。斬属性は少し通りにくい。",
        3: "斬で傷の少ない毛皮、打で砕けた甲殻、精密射撃で上質な毛皮。",
      },
    },
    {
      id: "poison_bat",
      name: "毒牙蝙蝠",
      glyph: "毒",
      floors: [2, 3],
      hp: 16,
      attack: 5,
      defense: 1,
      attackAttribute: "poison",
      weaknesses: ["slash", "thunder"],
      resistances: { poison: 2 },
      dangerous: { every: 3, telegraph: "毒牙蝙蝠が牙から毒液を垂らした。", name: "毒牙突き", attribute: "poison", power: 10 },
      loot: [
        { condition: "default", material: "poison_fang" },
        { condition: { lastSkill: "precise" }, material: "bat_wing_membrane" },
        { condition: { lastAttribute: "slash" }, material: "bat_wing_membrane" },
      ],
      research: {
        1: "毒属性で攻撃する。毒耐性があると安定する。",
        2: "斬と雷が弱点。毒には強い。",
        3: "精密射撃か斬属性で翼膜を残しやすい。",
      },
    },
    {
      id: "thunder_hare",
      name: "雷角兎",
      glyph: "雷",
      floors: [3, 4],
      hp: 22,
      attack: 6,
      defense: 1,
      attackAttribute: "thunder",
      weaknesses: ["blunt"],
      resistances: { thunder: 2 },
      dangerous: { every: 4, telegraph: "雷角兎の角に青白い火花が走った。", name: "雷角突き", attribute: "thunder", power: 13 },
      loot: [
        { condition: "default", material: "thunder_horn" },
        { condition: { lastSkill: "precise" }, material: "unbroken_horn" },
        { condition: { lastAttribute: "blunt" }, material: "thunder_horn" },
      ],
      research: {
        1: "雷属性で攻撃する。角に火花が走ると危険。",
        2: "打属性が弱点。雷には強い。",
        3: "精密射撃で無傷の雷角を狙える。",
      },
    },
    {
      id: "fire_lizard",
      name: "火喰い蜥蜴",
      glyph: "火",
      floors: [4, 5],
      hp: 28,
      attack: 7,
      defense: 2,
      attackAttribute: "fire",
      weaknesses: ["water"],
      resistances: { fire: 3 },
      dangerous: { every: 3, telegraph: "火喰い蜥蜴が大きく息を吸い込んだ。", name: "火炎放射", attribute: "fire", power: 16 },
      loot: [
        { condition: "default", material: "fire_lizard_scale" },
        { condition: { lastAttribute: "water" }, material: "cool_fire_gland" },
        { condition: { lastAttribute: "blunt" }, material: "fire_lizard_marrow" },
        { condition: { lastAttribute: "fire" }, material: "burned_corpse" },
      ],
      research: {
        1: "火属性で攻撃する。大きく息を吸うと火炎放射が来る。",
        2: "水属性が弱点。火耐性がないと深手を負う。",
        3: "水で冷却された火腺、打で骨髄、火で焼損した遺体。",
      },
    },
    {
      id: "red_garm",
      name: "赤熱のガルム",
      glyph: "賞",
      floors: [5],
      unique: true,
      hp: 48,
      attack: 9,
      defense: 3,
      attackAttribute: "fire",
      weaknesses: ["water"],
      resistances: { fire: 4, slash: 1 },
      dangerous: { every: 2, telegraph: "赤熱のガルムが胸の火核を赤く脈動させた。", name: "赤熱咆哮", attribute: "fire", power: 28 },
      loot: [
        { condition: "default", material: "garm_red_pelt" },
        { condition: { notLastAttribute: "fire" }, material: "garm_fire_core" },
        { condition: { lastAttribute: "water" }, material: "garm_fire_core" },
      ],
      research: {
        1: "地下5階の賞金首。火属性の危険技を短い間隔で使う。",
        2: "水属性が弱点。火耐性2以上を強く推奨。",
        3: "火でとどめを刺さずに倒すとガルムの火核を得られる。",
      },
    },
  ];

  window.HD_DATA.monsters.push(
    {
      id: "white_fang_marta", name: "白牙のマルタ", glyph: "白", floors: [1], unique: true,
      hp: 30, attack: 6, defense: 1, attackAttribute: "slash", weaknesses: ["blunt"], resistances: { slash: 2 },
      dangerous: { every: 3, telegraph: "白牙のマルタが低く身を沈めた。", name: "白牙連裂", attribute: "slash", power: 15 },
      loot: [{ condition: "default", material: "clean_pelt" }, { condition: { lastAttribute: "blunt" }, material: "fine_pelt" }],
      research: { 1: "B1Fを縄張りにする白い獣。", 2: "打属性が弱点。斬属性には強い。", 3: "打属性で仕留めると上質な毛皮を得られる。" },
    },
    {
      id: "iron_shell_gondo", name: "鉄殻のゴンド", glyph: "鉄", floors: [1], unique: true,
      hp: 38, attack: 6, defense: 5, attackAttribute: "blunt", weaknesses: ["acid"], resistances: { slash: 3, blunt: 1 },
      dangerous: { every: 4, telegraph: "鉄殻のゴンドが巨体を丸めた。", name: "鉄殻転輪", attribute: "blunt", power: 18 },
      loot: [{ condition: "default", material: "broken_carapace" }, { condition: { lastAttribute: "acid" }, material: "unbroken_horn" }],
      research: { 1: "異常に硬い甲殻を持つ巨虫。", 2: "酸属性が弱点。斬撃はほぼ通らない。", 3: "酸で甲殻を剥がすと無傷の硬質部位が残る。" },
    },
    {
      id: "venom_widow_nazka", name: "毒妃ナズカ", glyph: "妃", floors: [2], unique: true,
      hp: 44, attack: 7, defense: 2, attackAttribute: "poison", weaknesses: ["fire"], resistances: { poison: 4 },
      dangerous: { every: 3, telegraph: "毒妃ナズカが腹部を大きく震わせた。", name: "王毒霧", attribute: "poison", power: 20 },
      loot: [{ condition: "default", material: "poison_fang" }, { condition: { lastAttribute: "fire" }, material: "scorched_hide" }],
      research: { 1: "巣道に毒霧を満たす蜘蛛の女王。", 2: "火属性が弱点。毒耐性を強く推奨。", 3: "火で毒腺を焼くと焦げた外皮が残る。" },
    },
    {
      id: "drowned_knight_ordo", name: "溺死騎士オルド", glyph: "騎", floors: [2], unique: true,
      hp: 50, attack: 8, defense: 4, attackAttribute: "water", weaknesses: ["thunder"], resistances: { water: 4, slash: 1 },
      dangerous: { every: 3, telegraph: "オルドの鎧から濁流が溢れ出した。", name: "溺没剣", attribute: "water", power: 22 },
      loot: [{ condition: "default", material: "broken_carapace" }, { condition: { lastAttribute: "thunder" }, material: "thunder_horn" }],
      research: { 1: "水没した鎧に執念が宿った騎士。", 2: "雷属性が弱点。水と斬に強い。", 3: "雷で鎧を抜くと帯電した部材を得られる。" },
    },
    {
      id: "thunder_emperor_barg", name: "雷帝バーグ", glyph: "帝", floors: [3], unique: true,
      hp: 58, attack: 9, defense: 3, attackAttribute: "thunder", weaknesses: ["earth"], resistances: { thunder: 4 },
      dangerous: { every: 2, telegraph: "雷帝バーグの全身へ稲妻が収束した。", name: "雷帝落とし", attribute: "thunder", power: 25 },
      loot: [{ condition: "default", material: "thunder_horn" }, { condition: { lastSkill: "precise" }, material: "unbroken_horn" }],
      research: { 1: "雷角兎の群れを統べる巨獣。", 2: "土属性が弱点。雷耐性を強く推奨。", 3: "精密射撃で帝角を損なわず回収できる。" },
    },
    {
      id: "curse_mask_mimei", name: "呪面ミメイ", glyph: "面", floors: [3], unique: true,
      hp: 54, attack: 9, defense: 2, attackAttribute: "curse", weaknesses: ["light"], resistances: { curse: 4, illusion: 3 },
      dangerous: { every: 3, telegraph: "呪面ミメイの仮面が笑い声を上げた。", name: "名前喰い", attribute: "curse", power: 27 },
      loot: [{ condition: "default", material: "bat_wing_membrane" }, { condition: { lastAttribute: "light" }, material: "fine_pelt" }],
      research: { 1: "名を奪う呪いが仮面に凝り固まったもの。", 2: "光属性が弱点。呪と幻に強い。", 3: "光で祓うと清浄な霊布が残る。" },
    },
    {
      id: "frost_bloom_helka", name: "氷華ヘルカ", glyph: "華", floors: [4], unique: true,
      hp: 68, attack: 10, defense: 4, attackAttribute: "ice", weaknesses: ["fire"], resistances: { ice: 4, water: 2 },
      dangerous: { every: 3, telegraph: "氷華ヘルカの花弁が一斉に開いた。", name: "永久凍花", attribute: "ice", power: 30 },
      loot: [{ condition: "default", material: "fine_pelt" }, { condition: { lastAttribute: "fire" }, material: "cool_fire_gland" }],
      research: { 1: "熱を奪って咲く巨大な氷晶花。", 2: "火属性が弱点。氷と水に強い。", 3: "火で中心だけを溶かすと冷却器官が残る。" },
    },
    {
      id: "ash_dragon_volda", name: "灰燼竜ヴォルダ", glyph: "竜", floors: [4], unique: true,
      hp: 76, attack: 11, defense: 5, attackAttribute: "fire", weaknesses: ["water"], resistances: { fire: 4, slash: 2 },
      dangerous: { every: 2, telegraph: "灰燼竜ヴォルダの喉奥が白熱した。", name: "灰燼吐息", attribute: "fire", power: 34 },
      loot: [{ condition: "default", material: "fire_lizard_scale" }, { condition: { lastAttribute: "water" }, material: "cool_fire_gland" }],
      research: { 1: "焦げた石廊に棲む老竜。", 2: "水属性が弱点。火と斬に強い。", 3: "水で冷却して倒すと巨大な火腺を回収できる。" },
    },
    {
      id: "abyss_eye_zahar", name: "奈落眼ザハル", glyph: "眼", floors: [5], unique: true,
      hp: 92, attack: 13, defense: 6, attackAttribute: "dark", weaknesses: ["light"], resistances: { dark: 5, illusion: 4, curse: 3 },
      dangerous: { every: 2, telegraph: "奈落眼ザハルが瞳孔を完全に開いた。", name: "奈落凝視", attribute: "dark", power: 40 },
      loot: [{ condition: "default", material: "garm_red_pelt" }, { condition: { lastAttribute: "light" }, material: "garm_fire_core" }],
      research: { 1: "深層を監視する巨大な単眼。", 2: "光属性だけが明確な弱点。闇・幻・呪に強い。", 3: "光で瞳を焼くと凝縮核を回収できる。" },
    }
  );

  const families = [
    { id: "fang", names: ["灰牙鼠", "岩牙犬", "穴掘り鼬", "血眼狐", "洞窟狼", "黒爪獣"], glyph: "獣", attribute: "slash", weak: "blunt", resist: "slash", materials: ["small_beast_meat", "clean_pelt"] },
    { id: "shell", names: ["石殻虫", "鉄甲蟹", "鎧百足", "岩背亀", "鋼殻蠍", "城塞蟲"], glyph: "殻", attribute: "blunt", weak: "blunt", resist: "slash", materials: ["broken_carapace", "fine_pelt"] },
    { id: "wing", names: ["洞羽蝙蝠", "毒粉蛾", "刃羽烏", "雷鳴梟", "暗幕翼", "葬送鳥"], glyph: "翼", attribute: "wind", weak: "thunder", resist: "wind", materials: ["bat_wing_membrane", "poison_fang"] },
    { id: "slime", names: ["泥雫", "苔粘体", "毒沼ゼリー", "酸液塊", "凍結粘体", "黒油王"], glyph: "粘", attribute: "acid", weak: "fire", resist: "blunt", materials: ["scorched_hide", "poison_fang"] },
    { id: "spirit", names: ["迷い火", "囁く影", "泣き霊", "呪面", "虚ろ騎士", "深淵の眼"], glyph: "霊", attribute: "curse", weak: "light", resist: "illusion", materials: ["fine_pelt", "bat_wing_membrane"] },
    { id: "storm", names: ["火花精", "雫精", "砂塵精", "風切精", "氷晶精", "雷雲精"], glyph: "精", attribute: "thunder", weak: "earth", resist: "thunder", materials: ["thunder_horn", "unbroken_horn"] },
    { id: "reptile", names: ["苔鱗蜥蜴", "毒尾蛇", "岩顎竜", "灼熱蛇", "氷牙蜥蜴", "火冠竜"], glyph: "竜", attribute: "fire", weak: "water", resist: "fire", materials: ["fire_lizard_scale", "cool_fire_gland"] },
    { id: "construct", names: ["土偶兵", "石槌像", "銅殻兵", "歯車騎士", "鋼鉄番人", "赤熱巨像"], glyph: "像", attribute: "steel", weak: "acid", resist: "steel", materials: ["broken_carapace", "fire_lizard_marrow"] },
    { id: "stalker", names: ["影潜り", "壁這い", "首狩り", "夢喰らい", "夜渡り", "奈落猟犬"], glyph: "怪", attribute: "dark", weak: "light", resist: "dark", materials: ["garm_red_pelt", "scorched_hide"] },
  ];

  families.forEach((family, familyIndex) => {
    family.names.forEach((name, variant) => {
      const primaryFloor = ((familyIndex + variant * 2) % 5) + 1;
      const floors = [primaryFloor];
      if (primaryFloor < 5 && variant % 2 === 0) floors.push(primaryFloor + 1);
      const tier = primaryFloor + Math.floor(variant / 2);
      const dangerous = tier >= 3 ? {
        every: Math.max(2, 5 - Math.floor(tier / 2)),
        telegraph: `${name}が力を溜め、${window.HD_DATA.attributeLabels[family.attribute]}の気配を放った。`,
        name: `${window.HD_DATA.attributeLabels[family.attribute]}の強襲`,
        attribute: family.attribute,
        power: 8 + tier * 3,
      } : null;
      window.HD_DATA.monsters.push({
        id: `${family.id}_${variant + 1}`,
        name,
        glyph: family.glyph,
        floors,
        hp: 10 + tier * 5 + variant,
        attack: 3 + tier,
        defense: Math.floor((tier + variant) / 3),
        attackAttribute: family.attribute,
        weaknesses: [family.weak],
        resistances: { [family.resist]: Math.min(3, 1 + Math.floor(tier / 3)) },
        dangerous,
        loot: [
          { condition: "default", material: family.materials[0] },
          { condition: { lastAttribute: family.weak }, material: family.materials[1] },
          { condition: { lastSkill: "precise" }, material: family.materials[1] },
        ],
        research: {
          1: `${window.HD_DATA.attributeLabels[family.attribute]}属性で攻撃する${family.glyph}の魔物。`,
          2: `${window.HD_DATA.attributeLabels[family.weak]}属性が弱点。${window.HD_DATA.attributeLabels[family.resist]}属性には強い。`,
          3: `${window.HD_DATA.attributeLabels[family.weak]}属性か精密射撃で仕留めると素材が変化する。`,
        },
      });
    });
  });

  const deepSources = window.HD_DATA.monsters.filter((monster) => !monster.unique).slice(0, 30);
  deepSources.forEach((source, index) => {
    const floor = 6 + (index % 5);
    window.HD_DATA.monsters.push({
      ...JSON.parse(JSON.stringify(source)),
      id: `deep_${source.id}_${floor}`,
      name: `深層${source.name}`,
      floors: [floor, floor < 10 && index % 2 === 0 ? floor + 1 : floor].filter((value, pos, values) => values.indexOf(value) === pos),
      hp: source.hp + 34 + floor * 4,
      attack: source.attack + 6 + Math.floor(floor / 2),
      defense: source.defense + 3,
      dangerous: source.dangerous || {
        every: 3,
        telegraph: `深層${source.name}が濃密な魔力を集めた。`,
        name: "深層強襲",
        attribute: source.attackAttribute,
        power: 20 + floor * 3,
      },
      research: {
        1: `B${floor}F以深へ適応した${source.name}の強化種。`,
        2: `基本的な弱点は${source.weaknesses.map((id) => window.HD_DATA.attributeLabels[id]).join("・")}。浅層種より大幅に強い。`,
        3: "素材条件は浅層種と共通だが、深層では攻撃を耐え抜く装備が必要。",
      },
    });
  });

  const deepUniques = [
    ["moon_eater_luna", "月喰らいルナ", "月", 6, "dark", "light", "garm_red_pelt", "fine_pelt"],
    ["acid_king_doruba", "酸王ドルバ", "酸", 6, "acid", "water", "broken_carapace", "cool_fire_gland"],
    ["wind_witch_sylphy", "嵐魔女シルフィ", "嵐", 7, "wind", "thunder", "bat_wing_membrane", "unbroken_horn"],
    ["bone_lord_gazra", "骸王ガズラ", "骸", 7, "curse", "blunt", "fire_lizard_marrow", "broken_carapace"],
    ["steel_beast_orga", "鋼獣オルガ", "鋼", 8, "steel", "acid", "broken_carapace", "garm_fire_core"],
    ["mirage_prince_nemu", "幻王子ネム", "幻", 8, "illusion", "light", "fine_pelt", "bat_wing_membrane"],
    ["ice_empress_freya", "氷獄妃フレイア", "氷", 9, "ice", "fire", "cool_fire_gland", "fire_lizard_scale"],
    ["sunken_god_molok", "沈み神モロク", "神", 9, "water", "thunder", "garm_red_pelt", "thunder_horn"],
    ["black_sun_azazel", "黒陽アザゼル", "陽", 10, "fire", "water", "garm_fire_core", "cool_fire_gland"],
    ["dungeon_heart_eve", "迷宮心臓イヴ", "心", 10, "curse", "light", "garm_fire_core", "fine_pelt"],
  ];
  deepUniques.forEach(([id, name, glyph, floor, attribute, weakness, material, rare], index) => {
    window.HD_DATA.monsters.push({
      id, name, glyph, floors: [floor], unique: true,
      hp: 105 + (floor - 6) * 22 + index * 3,
      attack: 14 + (floor - 6) * 2,
      defense: 7 + Math.floor((floor - 6) / 2),
      attackAttribute: attribute,
      weaknesses: [weakness],
      resistances: { [attribute]: Math.min(5, 3 + Math.floor((floor - 6) / 2)) },
      dangerous: {
        every: index >= 8 ? 2 : 3,
        telegraph: `${name}が迷宮を震わせる力を解放した。`,
        name: `${window.HD_DATA.attributeLabels[attribute]}の深層奥義`,
        attribute,
        power: 42 + (floor - 6) * 8,
      },
      loot: [{ condition: "default", material }, { condition: { lastAttribute: weakness }, material: rare }],
      research: {
        1: `B${floor}Fに出現するユニークモンスター。${window.HD_DATA.attributeLabels[attribute]}属性を操る。`,
        2: `${window.HD_DATA.attributeLabels[weakness]}属性が弱点。危険技への耐性装備が必須。`,
        3: `${window.HD_DATA.attributeLabels[weakness]}属性で仕留めると希少素材へ変化する。`,
      },
    });
  });

  const starterMobs = [
    ["starter_mushroom", "コツブキノコ", "キ", "poison", "slash", "small_beast_meat"],
    ["starter_slime", "ミズタマスライム", "ス", "water", "fire", "scorched_hide"],
    ["starter_moth", "コナハネガ", "ガ", "wind", "thunder", "bat_wing_membrane"],
    ["starter_beetle", "マルコガネ", "ム", "blunt", "blunt", "broken_carapace"],
    ["starter_snake", "ホソクチヘビ", "ヘ", "poison", "slash", "poison_fang"],
    ["starter_frog", "イワトビガエル", "カ", "blunt", "thunder", "small_beast_meat"],
    ["starter_wisp", "チビヒカリ", "ヒ", "light", "dark", "fine_pelt"],
    ["starter_crab", "コイシガニ", "ニ", "blunt", "blunt", "broken_carapace"],
    ["starter_gecko", "カベヤモリ", "ヤ", "slash", "water", "clean_pelt"],
    ["starter_puff", "ワタボコリ", "ワ", "wind", "fire", "bat_wing_membrane"],
  ];
  starterMobs.forEach(([id, name, mapMarker, attribute, weakness, material], index) => {
    window.HD_DATA.monsters.push({
      id, name, glyph: mapMarker, mapMarker, floors: [1],
      hp: 8 + (index % 4) * 2,
      attack: 2 + (index % 3),
      defense: index % 3 === 0 ? 1 : 0,
      attackAttribute: attribute,
      weaknesses: [weakness],
      resistances: {},
      dangerous: null,
      loot: [{ condition: "default", material }, { condition: { lastAttribute: weakness }, material }],
      research: {
        1: `B1Fに棲む弱い魔物。${window.HD_DATA.attributeLabels[attribute]}属性で攻撃する。`,
        2: `${window.HD_DATA.attributeLabels[weakness]}属性が弱点。危険技は使わない。`,
        3: "特別な希少素材は持たない。剥ぎ取りの練習に向く。",
      },
    });
  });

  const deepAttributes = ["fire", "water", "thunder", "poison", "ice", "curse", "acid", "dark", "light", "earth", "wind", "steel", "illusion", "slash", "blunt"];
  const regionAttributePalettes = [
    ["light", "earth", "steel"], ["water", "ice", "curse"], ["thunder", "wind", "earth"],
    ["poison", "acid", "earth"], ["ice", "illusion", "curse"], ["curse", "dark", "light"],
    ["acid", "steel", "fire"], ["dark", "illusion", "light"], deepAttributes,
  ];
  const paletteForFloor = (floor) => regionAttributePalettes[Math.min(regionAttributePalettes.length - 1, Math.max(0, Math.floor((floor - 11) / 10)))];
  const abyssSources = window.HD_DATA.monsters.filter((monster) => !monster.unique).slice(0, 45);
  for (let floor = 11; floor <= 100; floor += 1) {
    const regionPalette = paletteForFloor(floor);
    for (let variant = 0; variant < 3; variant += 1) {
      const source = abyssSources[(floor * 3 + variant * 11) % abyssSources.length];
      const primary = regionPalette[(floor + variant) % regionPalette.length];
      const secondary = regionPalette[(floor + variant + 1) % regionPalette.length];
      const weakness = deepAttributes[(floor + variant * 3 + 9) % deepAttributes.length];
      const materialPair = source.loot.map((rule) => rule.material).filter(Boolean);
      window.HD_DATA.monsters.push({
        ...JSON.parse(JSON.stringify(source)),
        id: `abyss_f${floor}_v${variant + 1}`,
        name: `第${floor}層${source.name}${["アルファ", "ベータ", "ガンマ"][variant]}`,
        mapMarker: ["ア", "ベ", "ガ"][variant],
        floors: [floor],
        hp: 45 + floor * 7 + variant * 13,
        attack: 7 + Math.floor(floor * 0.72) + variant,
        defense: 3 + Math.floor(floor * 0.18) + variant,
        attackAttribute: primary,
        acceleration: floor >= 31 ? Math.floor((floor - 20) / 5) : 0,
        weaknesses: [weakness],
        resistances: { [primary]: Math.min(5, 2 + Math.floor(floor / 25)), [secondary]: Math.min(4, 1 + Math.floor(floor / 35)) },
        dangerous: {
          every: floor >= 60 ? 2 : 3,
          telegraph: `第${floor}層${source.name}が${window.HD_DATA.attributeLabels[secondary]}の力を圧縮した。`,
          name: `${window.HD_DATA.attributeLabels[secondary]}深層撃`,
          attribute: secondary,
          power: 24 + Math.floor(floor * 1.08) + variant * 3,
        },
        loot: [
          { condition: "default", material: materialPair[0] || "garm_red_pelt" },
          { condition: { lastAttribute: weakness }, material: materialPair[1] || materialPair[0] || "garm_fire_core" },
        ],
        research: {
          1: `B${floor}Fの環境へ適応した深層種。通常攻撃は${window.HD_DATA.attributeLabels[primary]}属性。`,
          2: `危険技は${window.HD_DATA.attributeLabels[secondary]}属性。${window.HD_DATA.attributeLabels[weakness]}属性が弱点。`,
          3: `${window.HD_DATA.attributeLabels[weakness]}で仕留めると素材変化。二属性への耐性装備が重要。`,
        },
      });
    }
  }

  const abyssUniqueTitles = ["双貌", "断罪", "飢界", "逆鱗", "無明", "星喰", "腐海", "天蓋", "終鐘", "虚王", "千眼", "灰冠", "時喰", "夢獄", "冥府", "神骸", "零界", "迷宮主"];
  for (let index = 0; index < abyssUniqueTitles.length; index += 1) {
    const floor = 15 + index * 5;
    const regionPalette = paletteForFloor(floor);
    const primary = regionPalette[index % regionPalette.length];
    const secondary = regionPalette[(index + 1) % regionPalette.length];
    const weakness = deepAttributes[(index * 2 + 6) % deepAttributes.length];
    const isFinal = floor === 100;
    window.HD_DATA.monsters.push({
      id: isFinal ? "dungeon_lord_nox" : `abyss_unique_${floor}`,
      name: isFinal ? "迷宮主ノクス" : `${abyssUniqueTitles[index]}の${["アギト", "ネブラ", "オルム", "ゼノ", "ミラ"][index % 5]}`,
      glyph: "王", mapMarker: isFinal ? "ノ" : "ユ", floors: [floor], unique: true,
      hp: 180 + floor * 13,
      attack: 18 + Math.floor(floor * 0.9),
      defense: 9 + Math.floor(floor * 0.24),
      attackAttribute: primary,
      acceleration: floor >= 30 ? 4 + Math.floor((floor - 30) / 4) : 0,
      weaknesses: [weakness],
      resistances: { [primary]: 5, [secondary]: 4, slash: Math.min(4, Math.floor(floor / 25)), blunt: Math.min(4, Math.floor(floor / 30)) },
      dangerous: { every: 2, telegraph: `${isFinal ? "迷宮そのもの" : "ユニーク個体"}が${window.HD_DATA.attributeLabels[secondary]}の奥義を構えた。`, name: `${window.HD_DATA.attributeLabels[secondary]}終極`, attribute: secondary, power: 55 + floor * 2 },
      loot: [{ condition: "default", material: "garm_red_pelt" }, { condition: { lastAttribute: weakness }, material: "garm_fire_core" }],
      research: {
        1: `B${floor}F級ユニーク。${window.HD_DATA.attributeLabels[primary]}属性の通常攻撃を持つ。`,
        2: `危険技は${window.HD_DATA.attributeLabels[secondary]}。弱点は${window.HD_DATA.attributeLabels[weakness]}。複合耐性が必須。`,
        3: `${window.HD_DATA.attributeLabels[weakness]}属性での討伐が希少核の条件。`,
      },
    });
  }

  const arenaTitles = ["紅蓮", "蒼海", "轟雷", "猛毒", "氷刃", "呪王", "酸雨", "黒月", "白陽", "地裂", "暴風", "鋼拳", "幻夢", "斬鬼", "砕城", "星界", "時逆", "終極"];
  const arenaNames = ["レオン", "ミドラ", "ガルド", "ネフィラ", "オズマ", "ラグナ", "セレス", "バロウ", "キリエ", "ドグマ", "ヴェイン", "アルマ", "ザクロ", "ノイン", "ヘリオ", "クオン", "メビウス", "イグナ", "ゼロス"];
  const arenaNameMarkers = ["レ", "ミ", "ガ", "ネ", "オ", "ラ", "セ", "バ", "キ", "ド", "ヴ", "ア", "ザ", "ノ", "ヘ", "ク", "メ", "イ", "ゼ"];
  const codePointRange = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => String.fromCodePoint(start + index));
  const kanaCandidates = [
    ...codePointRange(0x30a1, 0x30fa),
    ...codePointRange(0x3041, 0x3096),
    ...codePointRange(0x31f0, 0x31ff),
  ];
  const arenaKanaMarkers = [
    ...arenaNameMarkers,
    ...kanaCandidates.filter((marker) => !arenaNameMarkers.includes(marker)),
  ];
  const arenaTitleHues = [8, 205, 52, 285, 188, 322, 92, 258, 44, 28, 156, 218, 302, 348, 18, 232, 174, 338];
  const arenaAttributeHues = {
    fire: 8, water: 205, thunder: 52, poison: 285, ice: 188,
    curse: 322, acid: 92, dark: 258, light: 44, earth: 28,
    wind: 156, steel: 218, illusion: 302, slash: 348, blunt: 18,
  };
  let arenaRank = 0;
  arenaTitles.forEach((title, titleIndex) => {
    arenaNames.forEach((coreName, nameIndex) => {
      arenaRank += 1;
      const primary = deepAttributes[(titleIndex + nameIndex) % deepAttributes.length];
      const secondary = deepAttributes[(titleIndex * 3 + nameIndex + 5) % deepAttributes.length];
      const weakness = deepAttributes[(titleIndex * 5 + nameIndex + 9) % deepAttributes.length];
      const arenaNameFormats = [
        `${title}の${coreName}`, `${coreName}・${title}`, `${title}を纏う${coreName}`,
        `“${coreName}” ${title}位`, `${coreName}――${title}`, `${title}座の${coreName}`,
      ];
      const displayName = arenaNameFormats[(titleIndex * 2 + nameIndex) % arenaNameFormats.length];
      const arenaMarker = arenaKanaMarkers[arenaRank - 1] || String.fromCodePoint(0x3400 + arenaRank);
      window.HD_DATA.monsters.push({
        id: `arena_unique_${arenaRank}`,
        name: displayName,
        glyph: arenaMarker, mapMarker: arenaMarker, arenaMarker,
        arenaMarkerHue: arenaAttributeHues[primary], arenaMarkerAccentHue: arenaAttributeHues[secondary], arenaMarkerFamilyHue: arenaTitleHues[titleIndex],
        floors: [], unique: true, arenaOnly: true, arenaRank, arenaTitle: title, coreName,
        hp: 26 + arenaRank * 4,
        attack: 5 + Math.floor(arenaRank * 0.3),
        defense: 1 + Math.floor(arenaRank * 0.1),
        acceleration: Math.floor(arenaRank / 9),
        attackAttribute: primary,
        weaknesses: [weakness],
        resistances: { [primary]: Math.min(5, 1 + Math.floor(arenaRank / 75)), [secondary]: Math.min(5, Math.floor(arenaRank / 100)) },
        dangerous: {
          every: arenaRank >= 220 ? 2 : 3,
          telegraph: `${displayName}が観客席まで震わせる力を溜めた。`,
          name: `${window.HD_DATA.attributeLabels[secondary]}闘技奥義`,
          attribute: secondary,
          power: 10 + Math.floor(arenaRank * 0.72),
        },
        loot: [{ condition: "default", material: "garm_red_pelt" }, { condition: { lastAttribute: weakness }, material: "garm_fire_core" }],
        research: {
          1: `修練連武闘技場第${arenaRank}戦の専用ユニーク。${window.HD_DATA.attributeLabels[primary]}属性を操る。`,
          2: `奥義は${window.HD_DATA.attributeLabels[secondary]}属性。弱点は${window.HD_DATA.attributeLabels[weakness]}。`,
          3: "通常ダンジョンには現れない。修練連武闘技場の連勝記録でのみ遭遇できる。",
        },
      });
    });
  });

  // 第193〜342戦の150体は、連番を崩さない明確な区切りで闘技場から迷宮へ移籍する。
  // 元の順位は資料用に残しつつ、B11F〜B99Fの強度へ合わせて能力と記述を再調整する。
  const arenaTransfers = window.HD_DATA.monsters
    .filter((monster) => monster.arenaOnly && monster.arenaRank >= 193)
    .sort((left, right) => left.arenaRank - right.arenaRank);
  arenaTransfers.forEach((monster, index) => {
    const formerRank = monster.arenaRank;
    const floor = 11 + Math.round((index * 88) / Math.max(1, arenaTransfers.length - 1));
    const variation = (formerRank % 7) - 3;
    const primary = monster.attackAttribute;
    const secondary = monster.dangerous.attribute;
    monster.arenaOnly = false;
    monster.migratedFromArenaRank = formerRank;
    monster.floors = [floor];
    monster.glyph = "武";
    monster.mapMarker = "武";
    monster.hp = Math.max(190, 148 + floor * 11 + variation * 7);
    monster.attack = Math.max(18, 13 + Math.floor(floor * 0.82) + (formerRank % 3));
    monster.defense = Math.max(7, 5 + Math.floor(floor * 0.23) + (formerRank % 4));
    monster.acceleration = Math.max(1, Math.floor((floor - 5) / 6) + (formerRank % 3));
    monster.resistances = {
      [primary]: Math.min(5, 2 + Math.floor(floor / 24)),
      [secondary]: Math.min(4, 1 + Math.floor(floor / 34)),
    };
    monster.dangerous.every = floor >= 61 || formerRank % 5 === 0 ? 2 : 3;
    monster.dangerous.power = 38 + Math.floor(floor * 1.82) + (formerRank % 9);
    monster.dangerous.telegraph = `${monster.name}が迷宮の壁へ古い闘技の型を刻んだ。`;
    monster.research = {
      1: `かつて修練連武闘技場第${formerRank}戦を守り、今はB${floor}Fへ流れ着いたユニーク。${window.HD_DATA.attributeLabels[primary]}属性で攻める。`,
      2: `奥義は${window.HD_DATA.attributeLabels[secondary]}属性。弱点は${monster.weaknesses.map((id) => window.HD_DATA.attributeLabels[id]).join("・")}。迷宮へ合わせて戦い方も変化した。`,
      3: `元闘士の型を崩す弱点属性で仕留めると、希少核を傷付けずに回収できる。`,
    };
    delete monster.arenaRank;
  });

  // 20の生態系×10の個体核で、名前・動機・戦闘特性が重ならない迷宮ユニークを200体追加する。
  const dungeonUniqueLineages = [
    { id: "cinder_scribe", title: "灰暦を編む", kind: "火守", glyph: "暦", primary: "fire", danger: "steel", profile: "scholar", desire: "焼け落ちた歴史を一頁ずつ書き戻す", keepsake: "煤けた暦帳", secret: "最後の頁には自分の死だけが先に記されている", technique: "焦書終章", hp: -2, attack: 1, defense: 0, acceleration: 0 },
    { id: "sunken_bell", title: "潮騒を量る", kind: "沈鐘", glyph: "鐘", primary: "water", danger: "curse", profile: "ghost", desire: "水底へ沈んだ町の時刻をもう一度鳴らす", keepsake: "音を失った青銅鐘", secret: "鐘の中では今も避難できなかった者が囁く", technique: "葬潮鳴動", hp: 2, attack: 0, defense: 2, acceleration: -1 },
    { id: "storm_fox", title: "稲妻を飼う", kind: "天狐", glyph: "狐", primary: "thunder", danger: "wind", profile: "beast", desire: "天を走る最後の雷を巣へ持ち帰る", keepsake: "焦げた子狐の髭", secret: "雷鳴が止むと自分の鼓動も聞こえなくなる", technique: "雷巣疾駆", hp: -1, attack: 2, defense: -1, acceleration: 3 },
    { id: "venom_queen", title: "蜜毒を醸す", kind: "花后", glyph: "后", primary: "poison", danger: "illusion", profile: "monarch", desire: "枯れた庭園へ毒だけで咲く王国を築く", keepsake: "孵らなかった琥珀の種", secret: "自分の毒だけではただ一輪を咲かせられない", technique: "王蜜葬園", hp: 0, attack: 1, defense: 0, acceleration: 1 },
    { id: "winter_child", title: "春を知らない", kind: "氷童", glyph: "童", primary: "ice", danger: "light", profile: "poet", desire: "聞いたことしかない春へ自分の足で辿り着く", keepsake: "溶けない押し花", secret: "温もりに触れるたび大切な記憶から溶けていく", technique: "白春絶唱", hp: -2, attack: 1, defense: 1, acceleration: 1 },
    { id: "name_grave", title: "失名を綴る", kind: "墓守", glyph: "墓", primary: "curse", danger: "dark", profile: "guardian", desire: "名の消えた墓すべてへ正しい碑文を戻す", keepsake: "自分だけ空欄の墓誌", secret: "守っている墓の一つが自分自身のものだ", technique: "無銘埋葬", hp: 3, attack: -1, defense: 3, acceleration: -2 },
    { id: "rust_rain", title: "錆都を舐める", kind: "緑雨", glyph: "錆", primary: "acid", danger: "water", profile: "artisan", desire: "溶けた都市から完全な歯車を一つだけ取り出す", keepsake: "穴だらけの工具箱", secret: "触れた品を残せないため何一つ完成させられない", technique: "腐都洗錬", hp: 1, attack: 0, defense: 2, acceleration: 0 },
    { id: "shadow_thief", title: "影絵を盗む", kind: "夜盗", glyph: "盗", primary: "dark", danger: "slash", profile: "gambler", desire: "迷宮主の影を盗み自分の帰り道へ賭ける", keepsake: "持ち主のいない黒手袋", secret: "盗んだ影が増えるほど本人の輪郭は薄れている", technique: "無灯大博打", hp: -2, attack: 2, defense: -1, acceleration: 3 },
    { id: "false_sun", title: "偽陽を裁く", kind: "白翼", glyph: "翼", primary: "light", danger: "fire", profile: "zealot", desire: "地下の偽物の太陽をすべて告発する", keepsake: "片翼だけの聖像", secret: "本物の空を見たことがなく裁きの基準を知らない", technique: "白昼告解", hp: -1, attack: 2, defense: 0, acceleration: 1 },
    { id: "mountain_sleeper", title: "山脈を眠らす", kind: "石翁", glyph: "翁", primary: "earth", danger: "blunt", profile: "guardian", desire: "崩れ続ける地層を一夜だけ静かに眠らせる", keepsake: "故郷だった山の小石", secret: "眠らせた山々の夢を背中で見続けている", technique: "万岳寝返", hp: 5, attack: -1, defense: 4, acceleration: -3 },
    { id: "wind_merchant", title: "迷い風を売る", kind: "旅商", glyph: "商", primary: "wind", danger: "poison", profile: "jester", desire: "行き先を失った風へ値札と新しい道を与える", keepsake: "針のない風見盤", secret: "ただ一つ故郷へ帰る風だけは売ってしまった", technique: "千路乱売", hp: -3, attack: 1, defense: -1, acceleration: 4 },
    { id: "key_smith", title: "千鍵を鍛える", kind: "鋼匠", glyph: "鍵", primary: "steel", danger: "fire", profile: "artisan", desire: "迷宮のどの扉にも合わない最後の鍵を完成させる", keepsake: "最初に折った鉄鍵", secret: "探している扉は胸の内側にしか存在しない", technique: "万錠鍛界", hp: 2, attack: 0, defense: 4, acceleration: -1 },
    { id: "dream_reverse", title: "夢の裏を歩く", kind: "道化", glyph: "夢", primary: "illusion", danger: "thunder", profile: "jester", desire: "目覚めた者が捨てた夢を拾って舞台へ戻す", keepsake: "笑わない仮面", secret: "観客も舞台も自分が見ている夢にすぎない", technique: "逆夢喝采", hp: -2, attack: 1, defense: -1, acceleration: 2 },
    { id: "moon_scar", title: "月痕を描く", kind: "剣客", glyph: "剣", primary: "slash", danger: "light", profile: "warrior", desire: "欠けた月へ一振りで完全な円を刻む", keepsake: "刃のない古い鞘", secret: "最初の師を斬った一線だけ今も越えられない", technique: "月輪一命", hp: 0, attack: 3, defense: 0, acceleration: 2 },
    { id: "wall_talker", title: "城壁と語る", kind: "巨兵", glyph: "壁", primary: "blunt", danger: "earth", profile: "beast", desire: "崩された城壁の言葉を拳で敵へ伝える", keepsake: "城門の小さな蝶番", secret: "守るべき城は自分の一撃で崩してしまった", technique: "城哭粉砕", hp: 5, attack: 2, defense: 3, acceleration: -3 },
    { id: "fifteen_choir", title: "十五声を束ねる", kind: "合唱体", glyph: "唱", primary: "light", danger: "curse", profile: "poet", desire: "失われた十五の声で迷宮の本当の名を歌う", keepsake: "十四行しかない楽譜", secret: "最後の一声は挑戦者から奪うつもりでいる", technique: "欠声大合唱", hp: 1, attack: 1, defense: 1, acceleration: 1 },
    { id: "yesterday_clock", title: "昨日を解体する", kind: "時計獣", glyph: "刻", primary: "curse", danger: "thunder", profile: "oracle", desire: "壊れた昨日を部品にして違う今日を組み上げる", keepsake: "逆向きに進む秒針", secret: "一度も時間を戻せず同じ後悔だけ繰り返している", technique: "昨日分解", hp: 0, attack: 1, defense: 2, acceleration: 3 },
    { id: "scream_cook", title: "悲鳴を煮込む", kind: "迷宮料理人", glyph: "煮", primary: "fire", danger: "poison", profile: "artisan", desire: "恐怖も勇気も一皿へまとめ究極の味を作る", keepsake: "誰にも褒められなかった木匙", secret: "本人には味覚がなく客の表情だけを信じている", technique: "絶叫煮沸", hp: 1, attack: 2, defense: 1, acceleration: 0 },
    { id: "afterlife_clerk", title: "死後手続きを急かす", kind: "冥府書記", glyph: "印", primary: "curse", danger: "steel", profile: "scholar", desire: "迷宮の未処理死亡届を今日こそゼロ件にする", keepsake: "差し戻し印だらけの申請書", secret: "自分の死亡届だけ上司の判が永遠に下りない", technique: "最終受理印", hp: -1, attack: 0, defense: 2, acceleration: 1 },
    { id: "bone_gardener", title: "骨花を育てる", kind: "庭師", glyph: "庭", primary: "poison", danger: "earth", profile: "monarch", desire: "倒れた者の骨から一夜だけ咲く庭園を完成させる", keepsake: "土の入っていない植木鉢", secret: "最初に植えた骨が誰のものだったか思い出せない", technique: "白骨満開", hp: 2, attack: 0, defense: 1, acceleration: 0 },
  ];
  const dungeonUniqueCores = [
    { id: "adel", name: "アデル", vow: "七つ目の勝負だけは正面から受ける", keepsake: "欠けた方位磁針", secret: "勝つたび故郷の方角を一つ忘れる", technique: "北辰" },
    { id: "bisque", name: "ビスク", vow: "敵の最期の言葉を一語もこぼさず覚える", keepsake: "赤い糸を巻いた小瓶", secret: "瓶の中身を自分でも開けられない", technique: "緋瓶" },
    { id: "ciela", name: "シエラ", vow: "夜明け前には必ず一度武器を置く", keepsake: "青い片眼鏡", secret: "片眼鏡越しにだけ幼い自分が見える", technique: "蒼瞳" },
    { id: "doma", name: "ドーマ", vow: "敗者の足跡を入口まで送り返す", keepsake: "泥の付かない長靴", secret: "自分の足跡だけどこにも残らない", technique: "帰路" },
    { id: "enigma", name: "エニグマ", vow: "答えのない問いを戦うたび一つ増やす", keepsake: "数字の消えた算盤", secret: "最初の問いが何だったかだけ思い出せない", technique: "未解" },
    { id: "fio", name: "フィオ", vow: "壊したものへ必ず新しい名を付ける", keepsake: "半分だけ直した人形", secret: "その人形から夜ごと本名を呼ばれる", technique: "半身" },
    { id: "grave", name: "グレイヴ", vow: "三度目の敗北だけは墓へ持ち込まない", keepsake: "文字のない墓標片", secret: "すでに二度死んだ記憶を持っている", technique: "三葬" },
    { id: "hakua", name: "ハクア", vow: "傷が増えるほど声を静かにする", keepsake: "白紙の手紙", secret: "手紙の宛名を書くと相手が消える", technique: "白紙" },
    { id: "iris", name: "イリス", vow: "最後の一撃だけは利き手と逆で放つ", keepsake: "左右で色の違う手袋", secret: "利き手を誰に奪われたのか知っている", technique: "逆手" },
    { id: "juno", name: "ジュノ", vow: "勝者へ必ず小さな贈り物を残す", keepsake: "空にならない革袋", secret: "袋の底には帰れなかった家の鍵がある", technique: "餞別" },
  ];
  const materialByAttribute = {
    fire: "fire_lizard_scale", water: "cool_fire_gland", thunder: "thunder_horn", poison: "poison_fang", ice: "fine_pelt",
    curse: "bat_wing_membrane", acid: "broken_carapace", dark: "garm_red_pelt", light: "unbroken_horn", earth: "fire_lizard_marrow",
    wind: "bat_wing_membrane", steel: "broken_carapace", illusion: "fine_pelt", slash: "clean_pelt", blunt: "fire_lizard_marrow",
  };
  let dungeonUniqueIndex = 0;
  dungeonUniqueLineages.forEach((lineage, lineageIndex) => {
    dungeonUniqueCores.forEach((core, coreIndex) => {
      const floor = 2 + Math.floor((dungeonUniqueIndex * 98) / 200);
      const primary = lineage.primary;
      const danger = lineage.danger;
      const weaknessPool = deepAttributes.filter((attribute) => attribute !== primary && attribute !== danger);
      const weakness = weaknessPool[(lineageIndex * 3 + coreIndex * 5) % weaknessPool.length];
      const secondary = deepAttributes[(lineageIndex + coreIndex * 2 + 4) % deepAttributes.length];
      const resistanceTier = Math.min(5, 2 + Math.floor(floor / 25));
      const secondaryTier = Math.min(4, 1 + Math.floor(floor / 36));
      const resistances = { [primary]: resistanceTier };
      if (secondary !== weakness && secondary !== primary) resistances[secondary] = secondaryTier;
      if (floor >= 55) {
        const tertiary = deepAttributes[(lineageIndex * 7 + coreIndex + 8) % deepAttributes.length];
        if (tertiary !== weakness && tertiary !== primary && !(tertiary in resistances)) resistances[tertiary] = Math.min(3, 1 + Math.floor(floor / 45));
      }
      const baseMaterial = materialByAttribute[primary];
      const weakMaterial = materialByAttribute[weakness];
      const techniqueMaterial = materialByAttribute[danger];
      const name = `${lineage.title}${lineage.kind}・${core.name}`;
      window.HD_DATA.monsters.push({
        id: `dungeon_unique_${lineage.id}_${core.id}`,
        name,
        glyph: lineage.glyph,
        mapMarker: lineage.glyph,
        floors: [floor],
        unique: true,
        dungeonExpansion: true,
        hp: Math.max(42, 28 + Math.round(floor * 11.8) + lineage.hp * 6 + (coreIndex % 4) * 5),
        attack: Math.max(7, 5 + Math.floor(floor * 0.79) + lineage.attack + (coreIndex % 3)),
        defense: Math.max(1, 1 + Math.floor(floor * 0.22) + lineage.defense + (coreIndex % 3)),
        acceleration: Math.max(0, Math.floor((floor - 10) / 7) + lineage.acceleration + (coreIndex % 3)),
        attackAttribute: primary,
        weaknesses: [weakness],
        resistances,
        dangerous: {
          every: floor >= 60 || (lineageIndex + coreIndex) % 5 === 0 ? 2 : 3,
          telegraph: `${name}が${lineage.keepsake}へ触れ、${window.HD_DATA.attributeLabels[danger]}の気配を解き放った。`,
          name: `${lineage.technique}・${core.technique}`,
          attribute: danger,
          power: 18 + Math.floor(floor * 1.86) + (lineageIndex % 4) * 3 + (coreIndex % 5),
        },
        loot: [
          { condition: "default", material: baseMaterial },
          { condition: { lastAttribute: weakness }, material: weakMaterial },
          { condition: { lastSkill: coreIndex % 2 === 0 ? "precise" : "sever" }, material: techniqueMaterial },
        ],
        dialogueProfile: lineage.profile,
        dialogueDesire: `${lineage.desire}、同時に${core.vow}`,
        dialogueKeepsake: `${core.keepsake}――${lineage.keepsake}と共に守られている`,
        dialogueSecret: `${lineage.secret}。さらに、${core.secret}`,
        research: {
          1: `B${floor}Fに棲む「${lineage.kind}」系ユニーク。${window.HD_DATA.attributeLabels[primary]}属性の通常攻撃と、${window.HD_DATA.attributeLabels[danger]}属性の固有奥義を使い分ける。`,
          2: `${window.HD_DATA.attributeLabels[weakness]}属性が弱点。${Object.entries(resistances).map(([id, level]) => `${window.HD_DATA.attributeLabels[id]}耐性${level}`).join("・")}を持つ。`,
          3: `${window.HD_DATA.attributeLabels[weakness]}属性なら${weakMaterial === baseMaterial ? "素材を損なわず" : "異なる素材へ変えて"}剥ぎ取れる。${coreIndex % 2 === 0 ? "精密射撃" : "切断撃"}では奥義器官が残る。`,
        },
      });
      dungeonUniqueIndex += 1;
    });
  });

  // 所持金を奪って遠方へ転移する盗賊系。倒せば奪われた金は全額回収できる。
  const goldThiefTypes = [
    ["coin_snatcher_imp", "銭さらい小鬼", "小", 3, "dark", "light", 0.05, 2, 8],
    ["purse_cutting_marten", "財布裂きテン", "財", 12, "slash", "blunt", 0.06, 3, 9],
    ["silver_mist_bandit", "銀霧の盗賊", "銀", 24, "illusion", "light", 0.07, 5, 10],
    ["tax_collector_wraith", "冥府の徴税霊", "税", 38, "curse", "light", 0.08, 7, 11],
    ["vault_boring_mole", "金庫穿ちモグラ", "穿", 52, "earth", "wind", 0.09, 9, 12],
    ["gilded_shadow_fox", "金影の妖狐", "金", 67, "fire", "water", 0.1, 12, 13],
    ["abyssal_pickpocket", "奈落の掏摸", "掏", 82, "dark", "light", 0.11, 15, 14],
    ["world_coffer_eater", "世界金庫喰らい", "庫", 95, "curse", "light", 0.12, 18, 15],
  ];
  goldThiefTypes.forEach(([id, name, glyph, floor, attribute, weakness, rate, flat, escapeDistance], index) => {
    window.HD_DATA.monsters.push({
      id,
      name,
      glyph,
      mapMarker: "盗",
      floors: [floor, Math.min(99, floor + 1)],
      hp: 18 + floor * 4 + index * 3,
      attack: 4 + Math.floor(floor * 0.62),
      defense: 1 + Math.floor(floor * 0.22),
      acceleration: 4 + Math.floor(floor / 16),
      attackAttribute: attribute,
      weaknesses: [weakness],
      resistances: { [attribute]: Math.min(4, 1 + Math.floor(floor / 28)) },
      dangerous: null,
      specialAttack: "gold_steal",
      rareSpawn: true,
      goldTheft: { rate, flat, max: 20 + floor, escapeDistance },
      loot: [
        { condition: "default", material: index % 2 ? "clean_pelt" : "broken_carapace" },
        { condition: { lastAttribute: weakness }, material: index % 2 ? "fine_pelt" : "unbroken_horn" },
      ],
      research: {
        1: `B${floor}F付近を徘徊する金品狙い。所持金を盗むと遠方へ転移する。`,
        2: `${window.HD_DATA.attributeLabels[weakness]}属性が弱点。1回に所持金の約${Math.round(rate * 100)}%と${flat}Gを狙う。`,
        3: "逃げた個体を倒せば、その個体に盗まれた金を全額回収できる。",
      },
    });
  });

  const uniqueEpithetHeads = {
    fire: ["灰都を焼く", "千炉を呑む", "灼熱を戴く"], water: ["水底で嗤う", "七海を沈める", "泡沫を弔う"],
    thunder: ["天鼓を裂く", "迅雷を纏う", "雷雲を従える"], poison: ["万毒を宿す", "紫煙に潜む", "血潮を腐らす"],
    ice: ["永劫を凍らす", "白夜に眠る", "霜天を統べる"], curse: ["名を奪う", "墓標を数える", "凶星に愛された"],
    acid: ["鉄骨を溶かす", "緑雨を降らす", "形骸を啜る"], dark: ["暁を喰らう", "影より這う", "深淵を覗く"],
    light: ["偽陽を掲げる", "白光に裁く", "眩き罪を負う"], earth: ["大地を枕にする", "山脈を砕く", "岩座に君臨する"],
    wind: ["風葬を告げる", "天穹を駆ける", "嵐路を拓く"], steel: ["刃の雨を歩む", "鋼城を背負う", "不壊を誇る"],
    illusion: ["夢路を惑わす", "鏡界に棲む", "真実を嘲る"], slash: ["一閃に葬る", "血月を描く", "刃境を越えた"],
    blunt: ["城門を粉にする", "轟音を従える", "骨鐘を鳴らす"],
  };
  const uniqueEpithetTails = ["異境の王", "帰らずの災禍", "迷宮の古き傷", "屍山の覇者", "忘れられた神敵", "深層の凶兆", "黄泉路の番人"];

  function addUniqueEpithet(monster, index) {
    const hash = [...monster.id].reduce((sum, char) => sum + char.charCodeAt(0), index);
    const heads = uniqueEpithetHeads[monster.attackAttribute] || uniqueEpithetHeads.dark;
    const phrase = monster.arenaOnly ? heads[hash % heads.length] : `${heads[hash % heads.length]}${uniqueEpithetTails[(hash + index) % uniqueEpithetTails.length]}`;
    monster.baseName = monster.name;
    monster.epithet = phrase;
    const formats = [
      `《${phrase}》${monster.baseName}`,
      `${monster.baseName}――${phrase}`,
      `${phrase}・${monster.baseName}`,
      `“${monster.baseName}” ${phrase}`,
      `${monster.baseName}〈${phrase}〉`,
      `【${phrase}】${monster.baseName}`,
    ];
    monster.name = monster.id === "dungeon_lord_nox" ? "《百層を夢見る迷宮そのもの》迷宮主ノクス" : formats[hash % formats.length];
    if (monster.dangerous?.telegraph) monster.dangerous.telegraph = monster.dangerous.telegraph.replace(monster.baseName, monster.name);
  }

  window.HD_DATA.monsters.filter((monster) => monster.unique).forEach(addUniqueEpithet);

  // ごく一部のダンジョンユニークだけが眷属を呼ぶ。既存の特殊行動割当は変えない。
  const forcedSummoners = new Set([
    "venom_widow_nazka", "thunder_emperor_barg", "curse_mask_mimei", "bone_lord_gazra",
    "sunken_god_molok", "dungeon_heart_eve", "abyss_eye_zahar", "dungeon_lord_nox",
  ]);
  window.HD_DATA.monsters.filter((monster) => monster.unique && !monster.arenaOnly && monster.floors?.length).forEach((monster, index) => {
    const hash = [...monster.id].reduce((sum, character) => sum + character.charCodeAt(0), index);
    const generatedSummoner = monster.dungeonExpansion && hash % 13 === 0;
    const abyssSummoner = monster.id.startsWith("abyss_unique_") && index % 3 === 0;
    if (!forcedSummoners.has(monster.id) && !generatedSummoner && !abyssSummoner) return;
    monster.summon = { every: 6, count: 1, maxAlive: 2, maxTotal: 4, pool: "floor_attribute" };
    monster.research = monster.research || {};
    monster.research[2] = `${monster.research[2] || ""} 戦闘中に同属性の眷属を召喚する。`.trim();
  });

  const forcedInvisible = new Set(["curse_mask_mimei", "mirage_prince_nemu", "abyss_eye_zahar", "moon_eater_luna"]);
  window.HD_DATA.monsters.filter((monster) => !monster.arenaOnly && monster.floors?.length).forEach((monster) => {
    const nativeFloor = Math.min(...monster.floors);
    const hash = [...monster.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const suited = ["illusion", "dark", "wind"].includes(monster.attackAttribute) && nativeFloor >= 6 && hash % 3 === 0;
    if (!forcedInvisible.has(monster.id) && !suited) return;
    monster.invisible = true;
    monster.research = monster.research || {};
    monster.research[1] = `${monster.research[1] || ""} 通常の視覚では姿を捉えられない透明個体。`.trim();
  });

  const materialNames = Object.fromEntries(window.HD_DATA.materials.map((material) => [material.id, material.name]));
  window.HD_DATA.monsters.forEach((monster) => {
    const legacy = monster.research || {};
    const lootNames = [...new Set((monster.loot || []).map((rule) => materialNames[rule.material] || rule.material))];
    monster.research = {
      1: legacy[1] || `${monster.name}の目撃記録。`,
      2: `基礎能力は攻撃${monster.attack}、防御${monster.defense}、加速度${Number(monster.acceleration || 0)}。`,
      3: legacy[2] || "交戦記録から弱点と耐性が判明した。",
      4: `剥ぎ取り候補は${lootNames.join("・") || "なし"}。`,
      5: legacy[3] || "解析完了。剥ぎ取り条件まで判明した。",
    };
  });

  // 名前・並び順・件数は変えず、通常種の一部だけを決定的に「お得な個体」へ指定する。
  window.HD_DATA.monsters.filter((monster) => !monster.unique).forEach((monster, nonUniqueIndex) => {
    if (nonUniqueIndex % 23 === 5) {
      monster.rewardProfile = {
        harvestRolls: [2, 2],
        harvestQuantity: 2,
        tag: "harvest-rich",
        label: "剥ぎ取りがおいしい",
      };
    } else if (nonUniqueIndex % 29 === 11) {
      monster.rewardProfile = {
        experienceMultiplier: 2.4,
        tag: "exp-rich",
        label: "経験値がおいしい",
      };
    }
  });
})();
