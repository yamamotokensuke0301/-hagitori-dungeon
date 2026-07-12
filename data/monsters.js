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
      id: "white_fang_marta", name: "白牙のマルタ", glyph: "白", floors: [1], unique: true, forcedSpeciesId: "vermin",
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
      id: "thunder_emperor_barg", name: "雷帝バーグ", glyph: "帝", floors: [3], unique: true, forcedSpeciesId: "vermin",
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
        abyssSourceId: source.id,
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
    const isFinal = floor === 100;
    const weakness = isFinal ? "light" : deepAttributes[(index * 2 + 6) % deepAttributes.length];
    window.HD_DATA.monsters.push({
      id: isFinal ? "dungeon_lord_nox" : `abyss_unique_${floor}`,
      name: isFinal ? "太古からの闇キキルクルス" : `${abyssUniqueTitles[index]}の${["アギト", "ネブラ", "オルム", "ゼノ", "ミラ"][index % 5]}`,
      glyph: isFinal ? "闇" : "王", mapMarker: isFinal ? "闇" : "ユ", floors: [floor], unique: true,
      forcedSpeciesId: isFinal ? "reptile" : null,
      hp: isFinal ? 160000 : 180 + floor * 13,
      attack: 18 + Math.floor(floor * 0.9),
      defense: 9 + Math.floor(floor * 0.24),
      attackAttribute: primary,
      acceleration: isFinal ? 48 : floor >= 30 ? 4 + Math.floor((floor - 30) / 4) : 0,
      weaknesses: [weakness],
      resistances: { [primary]: 5, [secondary]: 4, slash: Math.min(4, Math.floor(floor / 25)), blunt: Math.min(4, Math.floor(floor / 30)) },
      dangerous: { every: 2, telegraph: `${isFinal ? "迷宮そのもの" : "ユニーク個体"}が${window.HD_DATA.attributeLabels[secondary]}の奥義を構えた。`, name: `${window.HD_DATA.attributeLabels[secondary]}終極`, attribute: secondary, power: 55 + floor * 2 },
      loot: [{ condition: "default", material: "garm_red_pelt" }, { condition: { lastAttribute: weakness }, material: "garm_fire_core" }],
      research: {
        1: isFinal ? "百層の最奥に横たわる、輪郭さえ定まらない太古の闇。迷宮全体が呼吸するように脈動している。" : `B${floor}F級ユニーク。${window.HD_DATA.attributeLabels[primary]}属性の通常攻撃を持つ。`,
        2: isFinal ? `追加観測により、闇の正体は迷宮を埋め尽くすほど巨大な蛇と判明した。${window.HD_DATA.attributeLabels[primary]}と${window.HD_DATA.attributeLabels[secondary]}を吐息として操り、弱点は${window.HD_DATA.attributeLabels[weakness]}。` : `危険技は${window.HD_DATA.attributeLabels[secondary]}。弱点は${window.HD_DATA.attributeLabels[weakness]}。複合耐性が必須。`,
        3: isFinal ? `キキルクルスの蛇鱗は百層分の闇を吸っている。${window.HD_DATA.attributeLabels[weakness]}属性だけが心核へ届く。` : `${window.HD_DATA.attributeLabels[weakness]}属性での討伐が希少核の条件。`,
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

  // 残留192体を強さ帯ごとに監査し、属性・称号・個体核の重複が薄い100体へ収斂する。
  // 各帯から10体ずつ残すため、序盤だけ／終盤だけが痩せることはない。
  const arenaCandidates = window.HD_DATA.monsters
    .filter((monster) => monster.arenaOnly)
    .sort((left, right) => left.arenaRank - right.arenaRank);
  const curatedArena = [];
  const arenaFeatureUsage = new Map();
  const featureUse = (key) => Number(arenaFeatureUsage.get(key) || 0);
  const recordArenaFeatures = (monster) => {
    [
      `primary:${monster.attackAttribute}`,
      `danger:${monster.dangerous.attribute}`,
      `weak:${monster.weaknesses[0]}`,
      `title:${monster.arenaTitle}`,
      `core:${monster.coreName}`,
    ].forEach((key) => arenaFeatureUsage.set(key, featureUse(key) + 1));
  };
  for (let band = 0; band < 10; band += 1) {
    const firstRank = 1 + Math.floor((band * arenaCandidates.length) / 10);
    const lastRank = Math.floor(((band + 1) * arenaCandidates.length) / 10);
    const pool = arenaCandidates.filter((monster) => monster.arenaRank >= firstRank && monster.arenaRank <= lastRank);
    let selectedInBand = 0;
    while (pool.length && selectedInBand < 10) {
      pool.sort((left, right) => {
        const score = (monster) => {
          const primary = monster.attackAttribute;
          const danger = monster.dangerous.attribute;
          const weakness = monster.weaknesses[0];
          const collisionPenalty = new Set([primary, danger, weakness]).size < 3 ? 30 : 0;
          return 60 / (1 + featureUse(`primary:${primary}`))
            + 42 / (1 + featureUse(`danger:${danger}`))
            + 34 / (1 + featureUse(`weak:${weakness}`))
            + 24 / (1 + featureUse(`title:${monster.arenaTitle}`))
            + 18 / (1 + featureUse(`core:${monster.coreName}`))
            - collisionPenalty;
        };
        return score(right) - score(left) || left.arenaRank - right.arenaRank;
      });
      const chosen = pool.shift();
      curatedArena.push(chosen);
      recordArenaFeatures(chosen);
      selectedInBand += 1;
    }
  }
  const curatedArenaIds = new Set(curatedArena.map((monster) => monster.id));
  window.HD_DATA.monsters = window.HD_DATA.monsters.filter((monster) => !monster.arenaOnly || curatedArenaIds.has(monster.id));
  curatedArena.sort((left, right) => left.arenaRank - right.arenaRank).forEach((monster, index) => {
    monster.formerArenaRank = monster.arenaRank;
    monster.arenaRank = index + 1;
    const rank = monster.arenaRank;
    const durabilityScale = 1.5 + rank * 0.012;
    const techniqueScale = 1.3 + rank * 0.008;
    monster.hp = Math.round(monster.hp * durabilityScale);
    monster.attack += 3 + Math.floor(rank * 0.25);
    monster.defense += 1 + Math.floor(rank * 0.08);
    monster.acceleration += 6 + Math.floor(rank / 8);
    monster.dangerous.power = Math.round(monster.dangerous.power * techniqueScale);
    if (rank >= 70) monster.dangerous.every = 2;
    monster.research[1] = monster.research[1].replace(/第\d+戦/, `第${monster.arenaRank}戦`);
  });
  const finalArenaRankMax = curatedArena.length;

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
      const name = [
        `${lineage.kind}〈北を忘れたアデル〉`,
        `遺言瓶の${lineage.kind}・ビスク`,
        `夜明けに武器を置く${lineage.kind}・シエラ`,
        `足跡を入口へ返す${lineage.kind}・ドーマ`,
        `答えなき問いを殖やす${lineage.kind}・エニグマ`,
        `壊れ物へ名を授ける${lineage.kind}・フィオ`,
        `二度死んだ${lineage.kind}・グレイヴ`,
        `白紙の宛名を恐れる${lineage.kind}・ハクア`,
        `最後だけ逆手の${lineage.kind}・イリス`,
        `勝者へ鍵を贈る${lineage.kind}・ジュノ`,
      ][coreIndex];
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

  // 所持金を奪って遠方へ転移する盗賊系。盗まれた金は討伐しても戻らない。
  const goldThiefTypes = [
    ["coin_snatcher_imp", "銭さらい小鬼", "小", 3, "dark", "light", 0.2, 8],
    ["purse_cutting_marten", "財布裂きテン", "財", 12, "slash", "blunt", 0.28, 9],
    ["silver_mist_bandit", "銀霧の盗賊", "銀", 24, "illusion", "light", 0.36, 10],
    ["tax_collector_wraith", "冥府の徴税霊", "税", 38, "curse", "light", 0.45, 11],
    ["vault_boring_mole", "金庫穿ちモグラ", "穿", 52, "earth", "wind", 0.55, 12],
    ["gilded_shadow_fox", "金影の妖狐", "金", 67, "fire", "water", 0.65, 13],
    ["abyssal_pickpocket", "奈落の掏摸", "掏", 82, "dark", "light", 0.72, 14],
    ["world_coffer_eater", "世界金庫喰らい", "庫", 95, "curse", "light", 0.8, 15],
  ];
  goldThiefTypes.forEach(([id, name, glyph, floor, attribute, weakness, rate, escapeDistance], index) => {
    window.HD_DATA.monsters.push({
      id,
      name,
      glyph,
      mapMarker: "盗",
      floors: [floor, Math.min(99, floor + 1)],
      hp: 18 + floor * 4 + index * 3,
      attack: 4 + Math.floor(floor * 0.62),
      defense: 1 + Math.floor(floor * 0.22),
      acceleration: 36 + Math.floor(floor / 4),
      attackAttribute: attribute,
      weaknesses: [weakness],
      resistances: { [attribute]: Math.min(4, 1 + Math.floor(floor / 28)) },
      dangerous: null,
      specialAttack: "gold_steal",
      rareSpawn: true,
      goldTheft: { rate, maxRate: 0.8, escapeDistance },
      loot: [
        { condition: "default", material: index % 2 ? "clean_pelt" : "broken_carapace" },
        { condition: { lastAttribute: weakness }, material: index % 2 ? "fine_pelt" : "unbroken_horn" },
      ],
      research: {
        1: `B${floor}F付近を徘徊する金品狙い。所持金を盗むと遠方へ転移する。`,
        2: `${window.HD_DATA.attributeLabels[weakness]}属性が弱点。1回に所持金の約${Math.round(rate * 100)}%を狙う。盗難の上限は所持金の80%。`,
        3: "一度盗まれた金は、その個体を倒しても戻らない。接近される前に仕留めたい。",
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
  // 最深層に棲む四つの最上位種族。各種族に白〜虹の七階級を一体ずつ置く。
  const apexMonsterSpecies = [
    {
      id: "elf", speciesName: "エルフ族", glyph: "森", rank: 11, floorStart: 64,
      names: ["木陰の斥候", "蒼葉の弓手", "翠環のドルイド", "黄金樹の番人", "紅森の狩猟者", "紫苑の森導師", "万華樹の長老"],
      primary: "wind", secondary: "light", weakness: "fire", hp: 610, attack: 58, defense: 17, acceleration: 17,
      materials: ["fine_pelt", "unbroken_horn"],
    },
    {
      id: "dragon", speciesName: "ドラゴン族", glyph: "竜", rank: 13, floorStart: 76,
      names: ["白鱗の幼竜", "蒼海の飛竜", "翠嵐の地竜", "黄金雷竜", "紅蓮古竜", "紫冥の邪竜", "虹天の始祖竜"],
      primary: "fire", secondary: "steel", weakness: "ice", hp: 940, attack: 78, defense: 30, acceleration: 14,
      materials: ["fire_lizard_scale", "garm_fire_core"],
    },
    {
      id: "demon", speciesName: "悪魔族", glyph: "悪", rank: 14, floorStart: 79,
      names: ["白契の小悪魔", "蒼欲の誘惑者", "翠毒の魔侯", "黄金瞳の契約卿", "紅獄の処刑魔", "紫冥の大公", "虹界の魔王"],
      primary: "dark", secondary: "curse", weakness: "light", hp: 860, attack: 84, defense: 25, acceleration: 21,
      materials: ["garm_red_pelt", "garm_fire_core"],
    },
    {
      id: "angel", speciesName: "天使族", glyph: "天", rank: 15, floorStart: 82,
      names: ["白羽の使徒", "蒼穹の奏使", "翠風の守護天使", "黄金輪の審判者", "紅涙の戦天使", "紫星の熾天使", "虹冠の原初天使"],
      primary: "light", secondary: "thunder", weakness: "dark", hp: 900, attack: 88, defense: 28, acceleration: 24,
      materials: ["fine_pelt", "garm_fire_core"],
    },
  ];
  apexMonsterSpecies.forEach((species, speciesIndex) => {
    species.names.forEach((name, colorIndex) => {
      const floor = Math.min(100, species.floorStart + colorIndex * 3);
      window.HD_DATA.monsters.push({
        id: `apex_${species.id}_${colorIndex + 1}`,
        name,
        glyph: species.glyph,
        mapMarker: species.glyph,
        floors: [floor],
        forcedSpeciesId: species.id,
        forcedColorTierIndex: colorIndex,
        hp: species.hp,
        attack: species.attack,
        defense: species.defense,
        acceleration: species.acceleration + colorIndex,
        attackAttribute: species.primary,
        weaknesses: [species.weakness],
        resistances: {
          [species.primary]: Math.min(5, 3 + Math.floor(colorIndex / 2)),
          [species.secondary]: Math.min(5, 2 + Math.floor(colorIndex / 2)),
        },
        dangerous: {
          every: colorIndex >= 4 ? 2 : 3,
          telegraph: `${name}が${window.HD_DATA.attributeLabels[species.secondary]}の上位術式を展開した。`,
          name: `${species.speciesName}の${window.HD_DATA.attributeLabels[species.secondary]}天威`,
          attribute: species.secondary,
          power: 150 + speciesIndex * 15 + colorIndex * 12,
        },
        loot: [
          { condition: "default", material: species.materials[0] },
          { condition: { lastAttribute: species.weakness }, material: species.materials[1] },
        ],
        research: {
          1: `B${floor}Fに現れる${species.speciesName}の${["白", "青", "緑", "黄", "赤", "紫", "虹"][colorIndex]}階級。`,
          2: `${window.HD_DATA.attributeLabels[species.primary]}と${window.HD_DATA.attributeLabels[species.secondary]}を操り、${window.HD_DATA.attributeLabels[species.weakness]}を弱点とする。`,
          3: `${window.HD_DATA.attributeLabels[species.weakness]}で仕留めると最上位素材を傷付けず回収できる。`,
        },
      });
    });
  });

  // 毎階3体いた深層適応種を、属性役割と原種の重複が薄い170体へ選抜する。
  // 通常階は2体、別枠ユニークが配置される節目の階は1体を残し、全階の生態系を維持する。
  const abyssGeneralCandidates = window.HD_DATA.monsters.filter((monster) => /^abyss_f\d+_v\d+$/.test(monster.id));
  const curatedAbyssGenerals = [];
  const abyssFeatureUsage = new Map();
  const abyssFeatureUse = (key) => Number(abyssFeatureUsage.get(key) || 0);
  const recordAbyssFeatures = (monster) => {
    [
      `source:${monster.abyssSourceId}`,
      `primary:${monster.attackAttribute}`,
      `danger:${monster.dangerous.attribute}`,
      `weak:${monster.weaknesses[0]}`,
    ].forEach((key) => abyssFeatureUsage.set(key, abyssFeatureUse(key) + 1));
  };
  for (let floor = 11; floor <= 100; floor += 1) {
    const pool = abyssGeneralCandidates.filter((monster) => monster.floors[0] === floor);
    const keepCount = floor % 10 === 5 || floor === 100 ? 1 : 2;
    let selectedForFloor = 0;
    while (pool.length && selectedForFloor < keepCount) {
      pool.sort((left, right) => {
        const score = (monster) => {
          const primary = monster.attackAttribute;
          const danger = monster.dangerous.attribute;
          const weakness = monster.weaknesses[0];
          const collisionPenalty = new Set([primary, danger, weakness]).size < 3 ? 36 : 0;
          return 70 / (1 + abyssFeatureUse(`source:${monster.abyssSourceId}`))
            + 48 / (1 + abyssFeatureUse(`primary:${primary}`))
            + 38 / (1 + abyssFeatureUse(`danger:${danger}`))
            + 30 / (1 + abyssFeatureUse(`weak:${weakness}`))
            - collisionPenalty;
        };
        return score(right) - score(left) || left.id.localeCompare(right.id);
      });
      const chosen = pool.shift();
      curatedAbyssGenerals.push(chosen);
      recordAbyssFeatures(chosen);
      selectedForFloor += 1;
    }
  }
  const curatedAbyssGeneralIds = new Set(curatedAbyssGenerals.map((monster) => monster.id));
  window.HD_DATA.monsters = window.HD_DATA.monsters.filter((monster) => !/^abyss_f\d+_v\d+$/.test(monster.id) || curatedAbyssGeneralIds.has(monster.id));
  curatedAbyssGenerals.forEach((monster) => { delete monster.abyssSourceId; });

  // 元闘技場系150体のうち、戦闘構造が均質な100体を五つの極端な型へ再設計する。
  // 10の深度帯から各10体を選び、残る50体を標準型の比較対象にする。
  const transferredDungeonUniques = window.HD_DATA.monsters
    .filter((monster) => Number.isFinite(monster.migratedFromArenaRank))
    .sort((left, right) => left.floors[0] - right.floors[0] || left.migratedFromArenaRank - right.migratedFromArenaRank);
  const peakyDungeonUniques = [];
  const peakyFeatureUsage = new Map();
  const peakyFeatureUse = (key) => Number(peakyFeatureUsage.get(key) || 0);
  const recordPeakyFeatures = (monster) => {
    [`primary:${monster.attackAttribute}`, `danger:${monster.dangerous.attribute}`, `weak:${monster.weaknesses[0]}`, `core:${monster.coreName}`]
      .forEach((key) => peakyFeatureUsage.set(key, peakyFeatureUse(key) + 1));
  };
  for (let band = 0; band < 10; band += 1) {
    const first = Math.floor((band * transferredDungeonUniques.length) / 10);
    const last = Math.floor(((band + 1) * transferredDungeonUniques.length) / 10);
    const pool = transferredDungeonUniques.slice(first, last);
    let selectedInBand = 0;
    while (pool.length && selectedInBand < 10) {
      pool.sort((left, right) => {
        const score = (monster) => {
          const primary = monster.attackAttribute;
          const danger = monster.dangerous.attribute;
          const weakness = monster.weaknesses[0];
          const collisionPenalty = new Set([primary, danger, weakness]).size < 3 ? 28 : 0;
          return 52 / (1 + peakyFeatureUse(`primary:${primary}`))
            + 42 / (1 + peakyFeatureUse(`danger:${danger}`))
            + 34 / (1 + peakyFeatureUse(`weak:${weakness}`))
            + 20 / (1 + peakyFeatureUse(`core:${monster.coreName}`))
            - collisionPenalty;
        };
        return score(right) - score(left) || left.migratedFromArenaRank - right.migratedFromArenaRank;
      });
      const chosen = pool.shift();
      peakyDungeonUniques.push(chosen);
      recordPeakyFeatures(chosen);
      selectedInBand += 1;
    }
  }
  const peakyProfiles = [
    { id: "glass_cannon", name: "一撃必殺型", summary: "紙のように脆いが、通常攻撃も奥義も致死級", weakness: "blunt", hp: 0.55, attack: 1.75, defense: 0.25, acceleration: 8, danger: 1.7, every: 2 },
    { id: "immovable_fortress", name: "不動要塞型", summary: "異常な生命力と防御を持つが、遅く火力も低い", weakness: "acid", hp: 1.65, attack: 0.62, defense: 2.4, acceleration: -8, danger: 0.82, every: 3 },
    { id: "blink_assassin", name: "瞬殺機動型", summary: "目で追えない速さと高火力を持つが、耐久は皆無", weakness: "earth", hp: 0.68, attack: 1.38, defense: 0.45, acceleration: 16, danger: 1.28, every: 2 },
    { id: "elemental_bastion", name: "属性城塞型", summary: "属性攻撃をほぼ遮断するが、物理打撃には極端に弱い", weakness: "blunt", hp: 0.92, attack: 0.78, defense: 1.05, acceleration: 1, danger: 0.95, every: 3 },
    { id: "doomsday_engine", name: "終末砲撃型", summary: "普段は鈍重で脆いが、構えた奥義だけが規格外", weakness: "slash", hp: 0.82, attack: 1.02, defense: 0.6, acceleration: -2, danger: 2.35, every: 3 },
  ];
  peakyDungeonUniques.sort((left, right) => left.floors[0] - right.floors[0] || left.migratedFromArenaRank - right.migratedFromArenaRank)
    .forEach((monster, index) => {
      const profile = peakyProfiles[index % peakyProfiles.length];
      monster.peakyBaseline = { hp: monster.hp, attack: monster.attack, defense: monster.defense, acceleration: monster.acceleration, danger: monster.dangerous.power };
      monster.peakyProfile = profile.id;
      monster.peakyProfileName = profile.name;
      monster.hp = Math.max(28, Math.round(monster.hp * profile.hp));
      monster.attack = Math.max(5, Math.round(monster.attack * profile.attack));
      monster.defense = Math.max(0, Math.round(monster.defense * profile.defense));
      monster.acceleration = Math.max(0, monster.acceleration + profile.acceleration);
      monster.dangerous.power = Math.max(10, Math.round(monster.dangerous.power * profile.danger));
      monster.dangerous.every = profile.every;
      monster.dangerous.name = `${profile.name}・${monster.dangerous.name}`;
      monster.dangerous.telegraph = `${monster.name}が${profile.summary}という歪な戦型を露わにした。`;
      if (!monster.weaknesses.includes(profile.weakness)) monster.weaknesses.push(profile.weakness);
      if (profile.id === "immovable_fortress") {
        monster.resistances.slash = Math.max(4, Number(monster.resistances.slash || 0));
        monster.resistances.blunt = Math.max(4, Number(monster.resistances.blunt || 0));
      }
      if (profile.id === "elemental_bastion") {
        monster.resistances[monster.attackAttribute] = 5;
        monster.resistances[monster.dangerous.attribute] = 5;
      }
      delete monster.resistances[profile.weakness];
      monster.research[1] = `${monster.research[1]} 再設計分類は「${profile.name}」。${profile.summary}。`;
      monster.research[2] = `${monster.research[2]} 戦型の綻びとして${window.HD_DATA.attributeLabels[profile.weakness]}属性が追加弱点。`;
      monster.research[3] = `${monster.research[3]} 平均的な強敵として扱わず、長所を正面から受けない装備構成が必要。`;
    });

  // ピーキー化しなかった元闘士50体には、一体ごとに異なる異能則を与える。
  const singularTraitNames = [
    "逆拍心臓", "七歩忘却", "傷写しの鏡", "午睡する雷", "骨笛の徴税", "影の替え玉", "昨日喰らい", "無音の拍手", "錆びない血", "空席の王冠",
    "三秒先の墓", "涙を数える剣", "月曜日の呪い", "片翼の迷路", "負け犬の凱旋", "呼吸する鎧", "名前のない追撃", "百年早い鐘", "毒見する星", "帰路封じ",
    "夢からの利息", "骨董品の怒り", "逆さ虹の牙", "沈黙を産む喉", "十二番目の影", "勝敗保留", "空腹の方位磁針", "死者だけの近道", "燃える雪解け", "敗北収集家",
    "拍子抜けの神罰", "右手だけの嵐", "未提出の死因", "二度目の初対面", "床下の太陽", "出口を忘れる鍵", "心音の密輸", "明日を質に入れる", "傷口の選挙", "透明な大行列",
    "最期だけ早口", "墓石の予備校", "血潮の砂時計", "敵意の盆栽", "反省する雷雲", "半額の終末", "眠れない棺", "勝者不在の決闘", "余命の切り売り", "世界の留守番",
  ];
  const singularSpecials = ["drain", "knockback", "self_destruct", "debuff", "time_stop", "devour", "ranged"];
  const singularDungeonUniques = transferredDungeonUniques.filter((monster) => !monster.peakyProfile);
  singularDungeonUniques.forEach((monster, index) => {
    const specialAttack = singularSpecials[index % singularSpecials.length];
    const addedWeakness = deepAttributes[(index * 7 + 3) % deepAttributes.length];
    const resistanceCandidates = deepAttributes.filter((attribute) => (
      attribute !== addedWeakness && !monster.weaknesses.includes(attribute)
    ));
    const resistanceAttribute = resistanceCandidates[(index * 11 + 5) % resistanceCandidates.length];
    const trait = {
      id: `singular_trait_${String(index + 1).padStart(2, "0")}`,
      name: singularTraitNames[index],
      specialAttack,
      dangerEvery: 2 + (index % 3),
      regenerationRate: index % 4 === 0 ? Number((0.025 + (index % 9) * 0.007).toFixed(3)) : 0,
      summonEvery: index % 5 === 0 ? 4 + (index % 4) : 0,
      shieldEvery: index % 6 === 0 ? 3 + (index % 5) : 0,
      shieldCharges: index % 12 === 0 ? 2 : 1,
      addedWeakness,
      resistanceAttribute,
      resistanceTier: 3 + (index % 3),
      hpScale: Number((0.82 + (index % 7) * 0.07).toFixed(2)),
      attackScale: Number((0.86 + (index % 6) * 0.09).toFixed(2)),
      accelerationDelta: (index % 9) - 4,
    };
    monster.singularTrait = trait;
    monster.suppressAutomaticRegeneration = true;
    monster.specialAttack = specialAttack;
    monster.hp = Math.max(32, Math.round(monster.hp * trait.hpScale));
    monster.attack = Math.max(6, Math.round(monster.attack * trait.attackScale));
    monster.acceleration = Math.max(0, monster.acceleration + trait.accelerationDelta);
    monster.dangerous.every = trait.dangerEvery;
    monster.dangerous.power = Math.max(12, Math.round(monster.dangerous.power * (1 + (index % 5) * 0.12)));
    monster.dangerous.name = `${trait.name}・${monster.dangerous.name}`;
    monster.dangerous.telegraph = `${monster.name}の固有異能「${trait.name}」が作動する。規則を知らない者だけが正しく犠牲になる。`;
    if (!monster.weaknesses.includes(addedWeakness)) monster.weaknesses.push(addedWeakness);
    monster.resistances[resistanceAttribute] = Math.max(trait.resistanceTier, Number(monster.resistances[resistanceAttribute] || 0));
    delete monster.resistances[addedWeakness];
    if (trait.summonEvery) monster.summon = { every: trait.summonEvery, count: 1 + (index % 2), maxAlive: 1 + (index % 3), maxTotal: 3 + (index % 5) };
    if (trait.shieldEvery) monster.divineInvulnerability = { every: trait.shieldEvery, charges: trait.shieldCharges, name: trait.name };
    monster.research[1] = `${monster.research[1]} この個体だけの異能則「${trait.name}」を持つ。`;
    monster.research[2] = `${monster.research[2]} ${window.HD_DATA.attributeLabels[addedWeakness]}が追加弱点で、${window.HD_DATA.attributeLabels[resistanceAttribute]}耐性${trait.resistanceTier}。特殊行動は${specialAttack}。`;
    monster.research[3] = `${monster.research[3]} 発動周期、再生、召喚、不可侵回数の組合せは他のどの個体とも一致しない。`;
  });

  const uniqueEpithetTails = ["異境の王", "帰らずの災禍", "迷宮の古き傷", "屍山の覇者", "忘れられた神敵", "深層の凶兆", "黄泉路の番人"];
  const exceptionalUniqueNames = new Map([
    ["abyss_unique_35", "％＝"],
    ["abyss_unique_75", "≠？"],
    ["abyss_unique_45", "さわやかなミルクオレ"],
    ["abyss_unique_55", "機械仕掛けの脱獄王"],
    ["abyss_unique_60", "川の流れのようにアサハカ"],
    ["abyss_unique_65", "午後三時のクリームパン"],
    ["abyss_unique_70", "麒麟児印のニュースター・メテオ"],
    ["dungeon_unique_cinder_scribe_adel", "だいたい無敵の田中"],
    ["dungeon_unique_sunken_bell_hakua", "倒すと縁起が悪い鳥"],
    ["dungeon_unique_venom_queen_enigma", "うすしお味の破壊神"],
    ["dungeon_unique_name_grave_bisque", "たぶん佐々木"],
    ["dungeon_unique_rust_rain_iris", "無事故無違反の暴走王"],
    ["dungeon_unique_false_sun_fio", "返品不可の救世主"],
    ["dungeon_unique_wind_merchant_ciela", "株式会社あの世・迷宮支店長"],
    ["dungeon_unique_key_smith_juno", "説明書をなくした神様"],
    ["dungeon_unique_moon_scar_grave", "有給休暇中の死神"],
    ["dungeon_unique_fifteen_choir_doma", "ご家庭用ブラックホール"],
    ["dungeon_unique_scream_cook_adel", "第二形態から来た新人"],
    ["dungeon_unique_afterlife_clerk_hakua", "※画像はイメージです"],
    ["dungeon_unique_cinder_scribe_doma", "湯上がり決戦兵器ポカポカ"],
    ["dungeon_unique_cinder_scribe_juno", "お会計は世界の終わりに"],
    ["dungeon_unique_sunken_bell_fio", "実家が太いデスワーム"],
    ["dungeon_unique_storm_fox_ciela", "昨日届いた最後通告"],
    ["dungeon_unique_storm_fox_iris", "午前二時だけ正義の味方"],
    ["dungeon_unique_venom_queen_fio", "おばあちゃんの最終定理"],
    ["dungeon_unique_winter_child_bisque", "こちら側のどなたか"],
    ["dungeon_unique_winter_child_hakua", "三割引のラストエンペラー"],
    ["dungeon_unique_name_grave_enigma", "まだ温かい石田"],
    ["dungeon_unique_rust_rain_adel", "先着一名様の永遠"],
    ["dungeon_unique_rust_rain_grave", "うしろめたい太陽"],
    ["dungeon_unique_shadow_thief_doma", "月刊ムーンサルト八月号"],
    ["dungeon_unique_shadow_thief_juno", "おかわり自由の飢餓"],
    ["dungeon_unique_false_sun_grave", "全自動ぬか喜び製造機"],
    ["dungeon_unique_mountain_sleeper_ciela", "電池別売りの超新星"],
    ["dungeon_unique_mountain_sleeper_iris", "低気圧由来のカリスマ"],
    ["dungeon_unique_wind_merchant_fio", "既読をつけない預言者"],
    ["dungeon_unique_key_smith_bisque", "迷子センターのラスボス"],
    ["dungeon_unique_key_smith_hakua", "生まれたての古代兵器"],
    ["dungeon_unique_dream_reverse_enigma", "予約の取れない亡霊"],
    ["dungeon_unique_moon_scar_adel", "だれより普通の異常者"],
    ["dungeon_unique_moon_scar_hakua", "世界で二番目に鋭い豆腐"],
    ["dungeon_unique_wall_talker_doma", "概念としての鈴木"],
    ["dungeon_unique_wall_talker_juno", "夕方には帰る魔王"],
    ["dungeon_unique_fifteen_choir_grave", "よく振ってから絶望"],
    ["dungeon_unique_yesterday_clock_ciela", "ただいま混み合っております"],
    ["dungeon_unique_yesterday_clock_iris", "賞味期限は昨日まで"],
    ["dungeon_unique_scream_cook_fio", "安全第一デストロイヤー"],
    ["dungeon_unique_afterlife_clerk_bisque", "お近くの終末"],
    ["dungeon_unique_afterlife_clerk_iris", "来週から本気を出す龍"],
  ]);

  // 全モンスターを「種族の基礎格＋色階級」で読める共通則へ載せる。
  // 種族格が1上がるごとに100点、色は25点刻みなので、弱い種族の赤(+100)と
  // 一段強い種族の白(+0)が同じ脅威帯になる。色内は個体能力で0〜24.9を加える。
  const monsterColorTiers = [
    { id: "white", name: "白", multiplier: 1 },
    { id: "blue", name: "青", multiplier: 1.04 },
    { id: "green", name: "緑", multiplier: 1.08 },
    { id: "yellow", name: "黄", multiplier: 1.12 },
    { id: "red", name: "赤", multiplier: 1.16 },
    { id: "purple", name: "紫", multiplier: 1.2 },
    { id: "rainbow", name: "虹", multiplier: 1.24 },
  ];
  const monsterSpecies = [
    { id: "slime", name: "粘体族", glyph: "粘", rank: 0, pattern: /スライム|粘|ゼリー|泥雫|酸液|黒油/ },
    { id: "vermin", name: "小獣族", glyph: "獣", rank: 1, pattern: /鼠|ネズミ|兎|ウサギ|鼬|狐|犬|狼|獣|ガルム/ },
    { id: "insect", name: "蟲族", glyph: "虫", rank: 2, pattern: /虫|蟲|蟹|百足|蠍|蜘蛛|蛾|甲|殻|コガネ/ },
    { id: "winged", name: "翼獣族", glyph: "鳥", rank: 3, pattern: /蝙蝠|翼|羽|烏|梟|鳥|ハネ/ },
    { id: "reptile", name: "鱗族", glyph: "蛇", rank: 4, pattern: /蜥蜴|蛇|竜|龍|ヤモリ|蛙|亀/ },
    { id: "spirit", name: "霊族", glyph: "霊", rank: 5, pattern: /霊|魂|火花精|雫精|砂塵精|風切精|氷晶精|雷雲精|迷い火|チビヒカリ/ },
    { id: "construct", name: "造魔族", glyph: "造", rank: 6, pattern: /像|土偶|歯車|番人|巨像|鎧|騎士|鋼匠|時計/ },
    { id: "plant", name: "妖植族", glyph: "花", rank: 7, pattern: /花|華|茸|キノコ|苔|庭|樹|根|ワタボコリ/ },
    { id: "fiend", name: "魔族", glyph: "魔", rank: 8, pattern: /魔|鬼|妃|王子|道化|魔女|悪魔|アザゼル/ },
    { id: "giant", name: "巨人族", glyph: "巨", rank: 9, pattern: /巨|翁|山|城|壁|神|主/ },
    { id: "aberration", name: "異形族", glyph: "異", rank: 10, pattern: /眼|面|影|夢|深淵|奈落|心臓|合唱|冥府/ },
    { id: "warrior", name: "戦人族", glyph: "武", rank: 11, pattern: /剣|武|闘|騎|兵|狩|盗|書記|料理人/ },
    { id: "elf", name: "エルフ族", glyph: "森", rank: 11, pattern: /エルフ|森導師|ドルイド/ },
    { id: "dragon", name: "ドラゴン族", glyph: "竜", rank: 13, pattern: /ドラゴン|古竜|始祖竜|飛竜|地竜|雷竜|邪竜/ },
    { id: "demon", name: "悪魔族", glyph: "悪", rank: 14, pattern: /悪魔|魔侯|契約卿|処刑魔|大公|魔王/ },
    { id: "angel", name: "天使族", glyph: "天", rank: 15, pattern: /天使|使徒|奏使|審判者/ },
  ];
  const stratumNames = ["浅層", "洞層", "岩層", "鉄層", "魔層", "冥層", "獄層", "星層", "神層", "深淵"];
  const speciesLootMaterials = {
    slime: ["slime_gel", "slime_crystal", "slime_super", "slime_ultra"],
    vermin: ["vermin_hide", "vermin_fang", "vermin_super", "vermin_ultra"],
    insect: ["insect_shell", "insect_core", "insect_super", "insect_ultra"],
    winged: ["winged_feather", "winged_pinion", "winged_super", "winged_ultra"],
    reptile: ["reptile_scale", "reptile_heart", "reptile_super", "reptile_ultra"],
    spirit: ["spirit_ectoplasm", "spirit_gem", "spirit_super", "spirit_ultra"],
    construct: ["construct_scrap", "construct_core", "construct_super", "construct_ultra"],
    plant: ["plant_fiber", "plant_seed", "plant_super", "plant_ultra"],
    fiend: ["fiend_horn", "fiend_blood", "fiend_super", "fiend_ultra"],
    giant: ["giant_bone", "giant_marrow", "giant_super", "giant_ultra"],
    aberration: ["aberrant_tissue", "aberrant_eye", "aberration_super", "aberration_ultra"],
    warrior: ["warrior_badge", "warrior_relic", "warrior_super", "warrior_ultra"],
    elf: ["elf_thread", "elf_dewdrop", "elf_super", "elf_ultra"],
    dragon: ["dragon_scale", "dragon_heart", "dragon_super", "dragon_ultra"],
    demon: ["demon_horn", "demon_seal", "demon_super", "demon_ultra"],
    angel: ["angel_feather", "angel_halo", "angel_super", "angel_ultra"],
  };
  const bespokeLootMonsterIds = new Set([
    "cave_rat", "carapace_rat", "poison_bat", "thunder_hare", "fire_lizard", "red_garm",
    "white_fang_marta", "thunder_emperor_barg",
  ]);

  function classifyMonster(monster, index) {
    const text = `${monster.id} ${monster.name} ${monster.glyph || ""}`;
    const apexSpeciesIds = new Set(["elf", "dragon", "demon", "angel"]);
    const fallbackSpecies = monsterSpecies.filter((entry) => !apexSpeciesIds.has(entry.id));
    const species = monsterSpecies.find((entry) => entry.id === monster.forcedSpeciesId)
      || monsterSpecies.find((entry) => entry.pattern.test(text))
      || fallbackSpecies[(index + window.HD_DATA.attributes.indexOf(monster.attackAttribute)) % fallbackSpecies.length];
    const nativeFloor = monster.arenaOnly
      ? 1 + Math.floor((Number(monster.arenaRank || 1) - 1) * 99 / Math.max(1, finalArenaRankMax - 1))
      : Math.max(1, Math.min(...(monster.floors?.length ? monster.floors : [1])));
    const stratum = Math.min(9, Math.floor((nativeFloor - 1) / 10));
    const withinStratum = (nativeFloor - 1) % 10;
    const colorIndex = Number.isInteger(monster.forcedColorTierIndex)
      ? Math.max(0, Math.min(6, monster.forcedColorTierIndex))
      : Math.min(6, Math.round((withinStratum / 9) * 6) + (monster.unique && !monster.arenaOnly ? 1 : 0));
    const color = monsterColorTiers[colorIndex];
    monster.speciesId = species.id;
    monster.speciesName = `${stratumNames[stratum]}${species.name}`;
    monster.speciesGlyph = species.glyph;
    monster.speciesRank = species.rank;
    monster.stratumRank = stratum;
    monster.colorTier = color.id;
    monster.colorTierName = color.name;
    monster.colorTierIndex = colorIndex;
    monster.threatRank = monster.speciesRank * 4 + colorIndex;
    const speciesMaterials = speciesLootMaterials[species.id];
    if (speciesMaterials) monster.exceptionalLoot = { super: speciesMaterials[2], ultra: speciesMaterials[3] };
    if (speciesMaterials && !bespokeLootMonsterIds.has(monster.id)) {
      const weakness = monster.weaknesses?.[0];
      monster.loot = [
        { condition: "default", material: speciesMaterials[0] },
        ...(weakness ? [{ condition: { lastAttribute: weakness }, material: speciesMaterials[1] }] : []),
        { condition: { lastSkill: "precise" }, material: speciesMaterials[1] },
      ];
    }
    const colorMultiplier = monster.id === "dungeon_lord_nox" ? 1 : color.multiplier;
    monster.hp = Math.max(1, Math.round(monster.hp * colorMultiplier));
    monster.attack = Math.max(1, Math.round(monster.attack * colorMultiplier));
    monster.defense = Math.max(0, Math.round(monster.defense * colorMultiplier));
    if (monster.dangerous) monster.dangerous.power = Math.max(1, Math.round(monster.dangerous.power * colorMultiplier));
    if (species.id === "dragon") {
      const breathTitles = ["白煙の竜息", "蒼圧ブレス", "翠嵐竜息", "黄金雷界ブレス", "紅蓮滅界ブレス", "紫冥終葬ブレス", "虹天創滅ブレス"];
      const breathPower = Math.max(20, Math.round(monster.attack * (1.8 + colorIndex * 0.22) + nativeFloor * (0.7 + colorIndex * 0.08)));
      const trials = colorIndex >= 6 ? 3 : colorIndex >= 4 ? 2 : 1;
      monster.dragonBreath = { power: breathPower, trials, rank: colorIndex + 1 };
      monster.dangerous = {
        every: colorIndex >= 4 ? 2 : 3,
        telegraph: `${monster.name}が肺腑へ周囲の魔力を吸い込み、鱗の隙間から世界を焼く光が漏れた。`,
        name: breathTitles[colorIndex],
        attribute: monster.attackAttribute,
        power: breathPower,
      };
    }
    if (species.id === "angel") {
      monster.divineInvulnerability = {
        every: colorIndex >= 5 ? 3 : colorIndex >= 3 ? 4 : 5,
        charges: colorIndex >= 4 ? 2 : 1,
        name: colorIndex >= 6 ? "原初神域・不可侵天" : colorIndex >= 4 ? "熾天神域" : "白翼の聖域",
      };
    }
    if (species.id === "demon") {
      const resistanceFloor = Math.min(5, 3 + Math.floor(colorIndex / 2));
      const fortified = [monster.attackAttribute, monster.dangerous?.attribute || "curse"];
      if (colorIndex >= 4) fortified.push("illusion");
      fortified.forEach((attribute) => {
        const current = monster.resistances?.[attribute];
        if (current !== "immune") monster.resistances[attribute] = Math.max(Number(current || 0), resistanceFloor);
      });
      monster.demonicWard = { attributes: [...new Set(fortified)], tier: resistanceFloor };
    }
    const rapidRegenerationEligible = monster.unique && !monster.suppressAutomaticRegeneration
      && (nativeFloor >= 45 || colorIndex >= 5 || species.rank >= 12);
    if (rapidRegenerationEligible) {
      const rate = Math.min(0.14, 0.035 + nativeFloor * 0.00065 + colorIndex * 0.006 + Math.max(0, species.rank - 10) * 0.004);
      monster.rapidRegeneration = {
        rate: Number(rate.toFixed(3)),
        amount: Math.max(1, Math.ceil(monster.hp * rate)),
      };
    }
  }

  window.HD_DATA.monsters.forEach(classifyMonster);
  const elixirSiegeProfiles = new Map([
    ["abyss_unique_80", { hpScale: 2.2, every: 4, ratio: 0.1, recommended: 2 }],
    ["abyss_unique_85", { hpScale: 2.5, every: 4, ratio: 0.12, recommended: 3 }],
    ["abyss_unique_90", { hpScale: 2.8, every: 3, ratio: 0.12, recommended: 4 }],
    ["abyss_unique_95", { hpScale: 3.2, every: 3, ratio: 0.15, recommended: 6 }],
  ]);
  window.HD_DATA.monsters.forEach((monster) => {
    const profile = elixirSiegeProfiles.get(monster.id);
    if (!profile) return;
    monster.hp = Math.round(monster.hp * profile.hpScale);
    monster.elixirAttrition = { every: profile.every, ratio: profile.ratio, recommended: profile.recommended };
  });
  window.HD_DATA.monsters.filter((monster) => monster.singularTrait?.regenerationRate > 0).forEach((monster) => {
    monster.rapidRegeneration = {
      rate: monster.singularTrait.regenerationRate,
      amount: Math.max(1, Math.ceil(monster.hp * monster.singularTrait.regenerationRate)),
    };
  });
  window.HD_DATA.monsters.filter((monster) => monster.suppressAutomaticRegeneration).forEach((monster) => {
    delete monster.suppressAutomaticRegeneration;
  });
  const threatColorPoints = [0, 25, 50, 75, 100, 125, 150];
  const threatGroups = new Map();
  window.HD_DATA.monsters.forEach((monster) => {
    const key = `${monster.speciesId}:${monster.stratumRank}:${monster.colorTierIndex}`;
    if (!threatGroups.has(key)) threatGroups.set(key, []);
    threatGroups.get(key).push(monster);
  });
  threatGroups.forEach((group) => {
    group.sort((left, right) => {
      const combatPower = (monster) => Number(monster.hp || 0) * 0.12
        + Number(monster.attack || 0) * 3
        + Number(monster.defense || 0) * 2.4
        + Number(monster.acceleration || 0) * 1.8
        + Number(monster.dangerous?.power || 0) * 0.7
        + (monster.unique ? 20 : 0);
      return combatPower(left) - combatPower(right) || left.id.localeCompare(right.id);
    });
    group.forEach((monster, index) => {
      const detail = group.length === 1 ? 12.5 : (index / (group.length - 1)) * 24.9;
      monster.threatScore = Number((monster.speciesRank * 100 + monster.stratumRank * 150 + threatColorPoints[monster.colorTierIndex] + detail).toFixed(1));
    });
  });
  window.HD_DATA.monsterColorTiers = monsterColorTiers;

  const additionalComedyUniqueNames = [
    "冷蔵庫の裏の皇帝【要冷蔵】", "町内会推薦★破壊神", "ほぼ新品のケルベロス（箱なし）", "お母さんには内緒の邪神㊙",
    "一旦、持ち帰る大魔王", "地獄株式会社／領収書在中", "勇者←右に曲がれない", "雷神［睡眠不足］",
    "守護者《本日定休》", "錬金術師レシート No.999", "不死身≒四捨五入", "隣町最終兵器.exe",
    "玄関先→アポカリプス", "冥王（ちょっとそこまで）", "予言者※たまに当たります", "WEEKEND★DEMON",
    "山田（半透明）", "先輩風→台風", "魔導書［後半未読］", "滅亡後はお早めに",
    "巨大プリン（目撃情報：確か）", "目覚まし時計 1－0 竜", "ゴーレム／連帯保証人", "神託【ここだけの話】",
    "［会議中］無敵", "覇王＋一円", "救世主 LAST ORDER", "異形＠いつもの場所",
    "終末（顔：普通）", "運命※お釣りは出ません", "冷奴《未覚醒》", "小林／名前だけ強い",
    "係長、西日装備", "悪魔_typo", "VALKYRIE 充電中…", "曇→メテオ",
    "無名剣士 全国2位", "ここから先 ￥500", "魔神 PUSH禁止", "聖剣／忘れ物No.404",
    "猫舌の火炎王", "腰痛持ちの巨神", "方向音痴の風神", "水曜だけ現れる月",
    "返事だけはいい亡者", "暗証番号を忘れた門番", "年中無休の昼寝番", "さっきまで神だったもの",
    "再起動してください", "音量を上げると逃げる鬼", "予算不足の超兵器", "抽選で一名様の魔王",
    "たぶん仕様です", "前向きに検討する怪物", "世間体を気にする死霊", "ちくわ大明神・改",
    "食後すぐ寝るベヒーモス", "取扱注意の佐藤", "一周回ってただの石", "まだ届いていない天罰",
    "昨日の敵は今日も敵", "入口で靴を脱ぐ悪魔", "順番待ちの英雄", "最寄駅から徒歩百年",
    "だいたい合ってる預言書", "生産者の顔が見える毒", "お徳用キングスライム", "返品された聖杯",
    "低反発の鉄巨人", "急に歌い出す墓石", "空気を読まない空気精", "一名様までの世界",
    "温めますかと聞く炎帝", "置き配された禁断兵器", "寝返りの激しい山脈", "パスワードが弱い賢者",
    "話せば長いミノタウロス", "とりあえず生の冥界魚", "お通しで出てくる絶望", "法定速度を守る流星",
    "予約名が違う勇者", "ご自由にお取りください", "当たり障りのない呪い", "晴天中止の大決戦",
    "配送状況を確認する神", "うろ覚えの創世記", "目に優しいレーザー", "誰かがやると思った魔王",
    "お先に失礼する亡霊", "ご都合のよい世界樹", "その件は持ち帰る竜王", "二度見される普通の犬",
    "乾燥を避けて保存する闇", "優先席を譲る暴君", "最終更新三日前の神", "何もしていないのに壊れた",
    "音声案内に従う魔獣", "来世から折り返します",
  ];

  function evenlySpacedMonsters(monsters, count) {
    return Array.from({ length: count }, (_, index) => monsters[Math.floor(index * monsters.length / count)]);
  }

  const comedyDungeonCandidates = window.HD_DATA.monsters.filter((monster) => monster.dungeonExpansion && !exceptionalUniqueNames.has(monster.id));
  const comedyTransferredCandidates = window.HD_DATA.monsters.filter((monster) => monster.migratedFromArenaRank && !exceptionalUniqueNames.has(monster.id));
  const comedyArenaCandidates = window.HD_DATA.monsters.filter((monster) => monster.arenaOnly && !exceptionalUniqueNames.has(monster.id));
  const additionalComedyTargets = [
    ...evenlySpacedMonsters(comedyDungeonCandidates, 40),
    ...evenlySpacedMonsters(comedyTransferredCandidates, 30),
    ...evenlySpacedMonsters(comedyArenaCandidates, 28),
  ];
  additionalComedyUniqueNames.forEach((name, index) => exceptionalUniqueNames.set(additionalComedyTargets[index].id, name));
  window.HD_DATA.additionalComedyUniqueNames = additionalComedyUniqueNames;

  const individuallyAuthoredUniqueNames = new Map([
    ["dungeon_unique_cinder_scribe_ciela", "夜明けを焼かない火守シエラ"],
    ["dungeon_unique_cinder_scribe_enigma", "未解の頁を燃やすエニグマ"],
    ["dungeon_unique_cinder_scribe_grave", "三度目の火葬を拒むグレイヴ"],
    ["dungeon_unique_cinder_scribe_hakua", "宛名を灰にするハクア"],
    ["dungeon_unique_cinder_scribe_iris", "逆手で暦を閉じるイリス"],
    ["dungeon_unique_sunken_bell_bisque", "遺言を沈鐘へ注ぐビスク"],
    ["dungeon_unique_sunken_bell_ciela", "夜明け前だけ黙る青鐘シエラ"],
    ["dungeon_unique_sunken_bell_doma", "溺者の足跡を岸へ返すドーマ"],
    ["dungeon_unique_sunken_bell_grave", "二度水葬された鐘守グレイヴ"],
    ["dungeon_unique_sunken_bell_iris", "逆手で弔鐘を鳴らすイリス"],
    ["dungeon_unique_sunken_bell_juno", "勝者へ水底の鍵を贈るジュノ"],
    ["dungeon_unique_storm_fox_bisque", "雷鳴を小瓶へ封じるビスク"],
    ["dungeon_unique_storm_fox_doma", "稲妻の足跡を巣へ返すドーマ"],
    ["dungeon_unique_storm_fox_enigma", "雷雲へ問いを投げ続けるエニグマ"],
    ["dungeon_unique_storm_fox_grave", "二度落雷死した天狐グレイヴ"],
    ["dungeon_unique_storm_fox_hakua", "白紙の手紙を雷で読むハクア"],
    ["dungeon_unique_storm_fox_juno", "勝者へ焦げた狐火を贈るジュノ"],
    ["dungeon_unique_venom_queen_bisque", "末期の言葉を蜜毒に漬けるビスク"],
    ["dungeon_unique_venom_queen_ciela", "朝露だけは毒さない花后シエラ"],
    ["dungeon_unique_venom_queen_doma", "枯れ花の足跡を庭へ返すドーマ"],
    ["dungeon_unique_venom_queen_hakua", "宛名を消す毒花ハクア"],
    ["dungeon_unique_venom_queen_iris", "逆手で王蜜を搾るイリス"],
    ["dungeon_unique_venom_queen_juno", "勝者へ孵らぬ種を贈るジュノ"],
    ["dungeon_unique_winter_child_ciela", "夜明けに春を待つ氷童シエラ"],
    ["dungeon_unique_winter_child_doma", "雪の足跡を入口へ返すドーマ"],
    ["dungeon_unique_winter_child_enigma", "春の定義を問うエニグマ"],
    ["dungeon_unique_winter_child_grave", "二度目の雪解けを拒むグレイヴ"],
    ["dungeon_unique_winter_child_iris", "逆手に押し花を握るイリス"],
    ["dungeon_unique_winter_child_juno", "勝者へ溶けない春を贈るジュノ"],
    ["dungeon_unique_name_grave_ciela", "夜明けに墓誌を伏せるシエラ"],
    ["dungeon_unique_name_grave_doma", "無銘の足跡を墓へ返すドーマ"],
    ["dungeon_unique_name_grave_fio", "壊れた墓へ名を授けるフィオ"],
    ["dungeon_unique_name_grave_hakua", "自分の墓だけ書けないハクア"],
    ["dungeon_unique_name_grave_iris", "逆手で名を削る墓守イリス"],
    ["dungeon_unique_name_grave_juno", "勝者へ空欄の墓誌を贈るジュノ"],
    ["dungeon_unique_rust_rain_ciela", "夜明け前に工具を置くシエラ"],
    ["dungeon_unique_rust_rain_doma", "錆びた轍を都へ返すドーマ"],
    ["dungeon_unique_rust_rain_enigma", "溶け残る歯車を問うエニグマ"],
    ["dungeon_unique_rust_rain_hakua", "白紙まで腐らせる緑雨ハクア"],
    ["dungeon_unique_rust_rain_juno", "勝者へ最後の無傷な螺子を贈るジュノ"],
    ["dungeon_unique_shadow_thief_adel", "北の影だけ盗めないアデル"],
    ["dungeon_unique_shadow_thief_ciela", "夜明けに盗具を置くシエラ"],
    ["dungeon_unique_shadow_thief_enigma", "影の持ち主を問うエニグマ"],
    ["dungeon_unique_shadow_thief_fio", "盗んだ影へ名を付けるフィオ"],
    ["dungeon_unique_shadow_thief_hakua", "輪郭から消えかけたハクア"],
    ["dungeon_unique_shadow_thief_iris", "逆手で月影を抜くイリス"],
    ["dungeon_unique_false_sun_adel", "北天を告発する白翼アデル"],
    ["dungeon_unique_false_sun_ciela", "夜明けに偽陽を見逃すシエラ"],
    ["dungeon_unique_false_sun_doma", "焼けた足跡を空へ返すドーマ"],
    ["dungeon_unique_false_sun_enigma", "本物の空を問うエニグマ"],
    ["dungeon_unique_false_sun_iris", "逆手で太陽を指すイリス"],
    ["dungeon_unique_false_sun_juno", "勝者へ片翼の聖像を贈るジュノ"],
    ["dungeon_unique_mountain_sleeper_adel", "北の山だけ眠らせないアデル"],
    ["dungeon_unique_mountain_sleeper_doma", "崩れた山道を返すドーマ"],
    ["dungeon_unique_mountain_sleeper_enigma", "山脈の夢へ問うエニグマ"],
    ["dungeon_unique_mountain_sleeper_fio", "砕けた峰へ名を授けるフィオ"],
    ["dungeon_unique_mountain_sleeper_hakua", "白紙の手紙を岩に刻むハクア"],
    ["dungeon_unique_mountain_sleeper_juno", "勝者へ故郷の小石を贈るジュノ"],
    ["dungeon_unique_wind_merchant_adel", "北風だけ売れないアデル"],
    ["dungeon_unique_wind_merchant_doma", "売れ残った帰路を返すドーマ"],
    ["dungeon_unique_wind_merchant_enigma", "風の値段を問い続けるエニグマ"],
    ["dungeon_unique_wind_merchant_hakua", "宛先のない風便ハクア"],
    ["dungeon_unique_wind_merchant_iris", "逆手で風見盤を回すイリス"],
    ["dungeon_unique_wind_merchant_juno", "勝者へ故郷行きの風を贈るジュノ"],
    ["dungeon_unique_key_smith_ciela", "夜明けに炉を止める鍵匠シエラ"],
    ["dungeon_unique_key_smith_doma", "鍵穴の足跡を扉へ返すドーマ"],
    ["dungeon_unique_key_smith_enigma", "開かない扉を問い詰めるエニグマ"],
    ["dungeon_unique_key_smith_grave", "二度折れた墓鍵グレイヴ"],
    ["dungeon_unique_key_smith_iris", "逆手で千錠を鍛えるイリス"],
    ["dungeon_unique_dream_reverse_adel", "北向きの夢を失ったアデル"],
    ["dungeon_unique_dream_reverse_ciela", "夜明けに仮面を置くシエラ"],
    ["dungeon_unique_dream_reverse_doma", "捨てられた夢を眠りへ返すドーマ"],
    ["dungeon_unique_dream_reverse_fio", "悪夢へ新しい名を付けるフィオ"],
    ["dungeon_unique_dream_reverse_hakua", "白紙の観客席に立つハクア"],
    ["dungeon_unique_dream_reverse_iris", "逆手で夢幕を閉じるイリス"],
    ["dungeon_unique_dream_reverse_juno", "勝者へ笑わない仮面を贈るジュノ"],
    ["dungeon_unique_moon_scar_ciela", "夜明け前に剣を置くシエラ"],
    ["dungeon_unique_moon_scar_doma", "斬られた月影を空へ返すドーマ"],
    ["dungeon_unique_moon_scar_enigma", "月の欠け目を問うエニグマ"],
    ["dungeon_unique_moon_scar_iris", "逆手で満月を描くイリス"],
    ["dungeon_unique_moon_scar_juno", "勝者へ刃のない鞘を贈るジュノ"],
    ["dungeon_unique_wall_talker_adel", "北壁の声を忘れたアデル"],
    ["dungeon_unique_wall_talker_ciela", "夜明けに城門を殴らないシエラ"],
    ["dungeon_unique_wall_talker_enigma", "城壁の遺言を問うエニグマ"],
    ["dungeon_unique_wall_talker_fio", "崩れた城へ名を授けるフィオ"],
    ["dungeon_unique_wall_talker_hakua", "白紙の手紙を壁に埋めるハクア"],
    ["dungeon_unique_wall_talker_iris", "逆手で城壁を語るイリス"],
    ["dungeon_unique_fifteen_choir_adel", "北の一声を忘れたアデル"],
    ["dungeon_unique_fifteen_choir_ciela", "夜明けに歌わない第七声シエラ"],
    ["dungeon_unique_fifteen_choir_enigma", "欠けた一声を問うエニグマ"],
    ["dungeon_unique_fifteen_choir_fio", "失われた声へ名を授けるフィオ"],
    ["dungeon_unique_fifteen_choir_iris", "逆手で指揮するイリス"],
    ["dungeon_unique_fifteen_choir_juno", "勝者へ第十五声を贈るジュノ"],
    ["dungeon_unique_yesterday_clock_adel", "北へ進まない秒針アデル"],
    ["dungeon_unique_yesterday_clock_doma", "昨日の足跡を今日へ返すドーマ"],
    ["dungeon_unique_yesterday_clock_enigma", "最初の昨日を問うエニグマ"],
    ["dungeon_unique_yesterday_clock_fio", "壊れた今日へ名を付けるフィオ"],
    ["dungeon_unique_yesterday_clock_hakua", "宛名を書く前へ戻るハクア"],
    ["dungeon_unique_yesterday_clock_juno", "勝者へ逆回りの秒針を贈るジュノ"],
    ["dungeon_unique_scream_cook_bisque", "最期の悲鳴を瓶詰めるビスク"],
    ["dungeon_unique_scream_cook_doma", "食べ残した恐怖を厨房へ返すドーマ"],
    ["dungeon_unique_scream_cook_enigma", "究極の味を問うエニグマ"],
    ["dungeon_unique_scream_cook_grave", "二度煮込まれた料理人グレイヴ"],
    ["dungeon_unique_scream_cook_iris", "逆手で絶叫鍋を振るイリス"],
    ["dungeon_unique_scream_cook_juno", "勝者へ味のない晩餐を贈るジュノ"],
    ["dungeon_unique_afterlife_clerk_adel", "北冥支局を忘れた書記アデル"],
    ["dungeon_unique_afterlife_clerk_doma", "死亡届を差出人へ返すドーマ"],
    ["dungeon_unique_afterlife_clerk_enigma", "死因欄を問い詰めるエニグマ"],
    ["dungeon_unique_afterlife_clerk_fio", "未処理死者へ名を付けるフィオ"],
    ["dungeon_unique_afterlife_clerk_juno", "勝者へ差し戻し印を贈るジュノ"],
    ["dungeon_unique_bone_gardener_adel", "北庭の骨を忘れたアデル"],
    ["dungeon_unique_bone_gardener_bisque", "遺言を骨花へ注ぐビスク"],
    ["dungeon_unique_bone_gardener_doma", "白骨の根を墓へ返すドーマ"],
    ["dungeon_unique_bone_gardener_enigma", "最初の骨を問うエニグマ"],
    ["dungeon_unique_bone_gardener_fio", "咲かなかった骨へ名を付けるフィオ"],
    ["dungeon_unique_bone_gardener_hakua", "宛名の骨を植えるハクア"],
    ["dungeon_unique_bone_gardener_iris", "逆手で白骨を剪定するイリス"],
    ["dungeon_unique_bone_gardener_juno", "勝者へ一夜の骨花を贈るジュノ"],
  ]);
  [
    ["arena_unique_194", "白刃を呑む不落門ネフィラ"],
    ["arena_unique_195", "地響きより速いオズマ"],
    ["arena_unique_196", "炎嵐の五重郭ラグナ"],
    ["arena_unique_197", "鋼雨を撃つ潮砲セレス"],
    ["arena_unique_199", "毒刃を眠らせる城キリエ"],
    ["arena_unique_200", "氷塵を置き去りにするドグマ"],
    ["arena_unique_201", "呪火を巡らす黒城ヴェイン"],
    ["arena_unique_202", "酸潮終端砲アルマ"],
    ["arena_unique_209", "光を一閃に畳むゼロス"],
    ["arena_unique_210", "鋼光不落のレオン"],
    ["arena_unique_211", "幻土を踏まず走るミドラ"],
    ["arena_unique_217", "毒炎の閉幕砲バロウ"],
    ["arena_unique_219", "呪雷を抱く動城ドグマ"],
    ["arena_unique_220", "酸毒の間を縫うヴェイン"],
    ["arena_unique_221", "闇氷五郭アルマ"],
    ["arena_unique_222", "光呪反転砲ザクロ"],
    ["arena_unique_224", "風闇に錆びぬヘリオ城"],
    ["arena_unique_225", "鋼光瞬断クオン"],
    ["arena_unique_226", "幻土万色城メビウス"],
    ["arena_unique_227", "斬風終末砲イグナ"],
    ["arena_unique_231", "鈍刃一命のガルド"],
    ["arena_unique_232", "火槌を受ける夢城ネフィラ"],
    ["arena_unique_234", "雷水を隔てるラグナ城"],
    ["arena_unique_235", "毒雷を吐く夢砲セレス"],
    ["arena_unique_239", "闇酸不落のヴェイン"],
    ["arena_unique_240", "光闇を跨ぐアルマ"],
    ["arena_unique_241", "地光の迷彩城ザクロ"],
    ["arena_unique_242", "風土夢砲ノイン"],
    ["arena_unique_244", "幻鋼を拒むクオン城"],
    ["arena_unique_245", "斬幻の残像メビウス"],
    ["arena_unique_246", "打斬を違える五色のイグナ"],
    ["arena_unique_247", "火槌夢葬砲ゼロス"],
    ["arena_unique_254", "氷呪を封じる斬鬼城セレス"],
    ["arena_unique_255", "呪酸の死角へ消えるバロウ"],
    ["arena_unique_259", "地風断界砲アルマ"],
    ["arena_unique_260", "風鋼を一太刀にするザクロ"],
    ["arena_unique_261", "鋼幻不退のノイン"],
    ["arena_unique_265", "火水の狭間を駆けるイグナ"],
    ["arena_unique_266", "水雷五彩のゼロス城"],
    ["arena_unique_267", "打雷崩城砲レオン"],
    ["arena_unique_269", "水氷をせき止めるガルド"],
    ["arena_unique_270", "雷呪より先に刺すネフィラ"],
    ["arena_unique_271", "毒酸を飼う五郭オズマ"],
    ["arena_unique_272", "氷闇落城砲ラグナ"],
    ["arena_unique_275", "闇風一断のキリエ"],
    ["arena_unique_276", "光鋼を積むドグマ城"],
    ["arena_unique_277", "地幻の継ぎ目を斬るヴェイン"],
    ["arena_unique_279", "鋼槌崩壊砲ザクロ"],
    ["arena_unique_285", "雷呪を黙らせるゼロス城"],
    ["arena_unique_287", "水酸の飛沫より速いミドラ"],
    ["arena_unique_290", "氷土星葬砲オズマ"],
    ["arena_unique_291", "呪風を一息に断つラグナ"],
    ["arena_unique_292", "酸鋼を重ねるセレス城"],
    ["arena_unique_294", "光刃五芒城キリエ"],
    ["arena_unique_295", "地槌星界砲ドグマ"],
    ["arena_unique_299", "斬毒を退けるノイン城"],
    ["arena_unique_300", "打氷の間隙を抜くヘリオ"],
    ["arena_unique_301", "火呪五輪城クオン"],
    ["arena_unique_302", "水酸星滅砲メビウス"],
    ["arena_unique_305", "水光を一筋にするレオン"],
    ["arena_unique_306", "雷土を受け切るミドラ城"],
    ["arena_unique_309", "呪幻の一歩先にいるオズマ"],
    ["arena_unique_311", "闇槌五色城セレス"],
    ["arena_unique_312", "光炎時葬砲バロウ"],
    ["arena_unique_314", "風雷を蓄えるドグマ城"],
    ["arena_unique_315", "鋼毒の影を抜くヴェイン"],
    ["arena_unique_316", "幻氷五刻城アルマ"],
    ["arena_unique_317", "斬呪逆時砲ザクロ"],
    ["arena_unique_319", "火闇に沈まぬヘリオ城"],
    ["arena_unique_320", "水光を追い越すクオン"],
    ["arena_unique_322", "毒風五色のイグナ城"],
    ["arena_unique_329", "闇水終極城ラグナ"],
    ["arena_unique_330", "光雷の終端へ走るセレス"],
    ["arena_unique_331", "地毒五門のバロウ"],
    ["arena_unique_332", "風氷終局砲キリエ"],
    ["arena_unique_335", "斬闇を一命に束ねるアルマ"],
    ["arena_unique_339", "雷鋼不落のクオン"],
    ["arena_unique_340", "毒幻を置き去るメビウス"],
    ["arena_unique_341", "氷刃五色城イグナ"],
    ["arena_unique_342", "呪槌最後砲ゼロス"],
  ].forEach(([id, name]) => individuallyAuthoredUniqueNames.set(id, name));
  [
    ["arena_unique_2", "潮踏みミドラ"],
    ["arena_unique_3", "青雷角ガルド"],
    ["arena_unique_5", "火床を凍らすオズマ"],
    ["arena_unique_6", "風縛のラグナ"],
    ["arena_unique_7", "鋼を啜るセレス"],
    ["arena_unique_9", "斬光キリエ"],
    ["arena_unique_10", "骨鐘ドグマ"],
    ["arena_unique_26", "拳影セレス"],
    ["arena_unique_27", "火を掲げるバロウ"],
    ["arena_unique_28", "潮割りキリエ"],
    ["arena_unique_30", "毒鋼ヴェイン"],
    ["arena_unique_31", "氷夢アルマ"],
    ["arena_unique_33", "酸鐘ノイン"],
    ["arena_unique_34", "暗潮ヘリオ"],
    ["arena_unique_43", "火喰い酸雨オズマ"],
    ["arena_unique_49", "酸夢ヴェイン"],
    ["arena_unique_50", "闇裂アルマ"],
    ["arena_unique_51", "白鐘ザクロ"],
    ["arena_unique_54", "鋼雷クオン"],
    ["arena_unique_55", "幻毒メビウス"],
    ["arena_unique_57", "砕呪ゼロス"],
    ["arena_unique_59", "火除けの霜ミドラ"],
    ["arena_unique_60", "水葬印ガルド"],
    ["arena_unique_62", "毒影オズマ"],
    ["arena_unique_63", "氷灯ラグナ"],
    ["arena_unique_66", "闇鋼キリエ"],
    ["arena_unique_67", "光夢ドグマ"],
    ["arena_unique_68", "地裂ヴェイン"],
    ["arena_unique_77", "雷霜レオン"],
    ["arena_unique_83", "白風セレス"],
    ["arena_unique_86", "鋼断ドグマ"],
    ["arena_unique_87", "幻鐘ヴェイン"],
    ["arena_unique_88", "斬火アルマ"],
    ["arena_unique_91", "潮毒ヘリオ"],
    ["arena_unique_93", "毒呪メビウス"],
    ["arena_unique_95", "呪影ゼロス"],
    ["arena_unique_100", "岩座のオズマ"],
    ["arena_unique_101", "風王ラグナ"],
    ["arena_unique_107", "潮王アルマ"],
    ["arena_unique_108", "雷王ザクロ"],
    ["arena_unique_109", "毒王ノイン"],
    ["arena_unique_113", "闇王イグナ"],
    ["arena_unique_115", "白蝕レオン"],
    ["arena_unique_120", "斬鋼ラグナ"],
    ["arena_unique_121", "砕夢セレス"],
    ["arena_unique_122", "火線バロウ"],
    ["arena_unique_124", "雷渡りドグマ"],
    ["arena_unique_126", "氷雷アルマ"],
    ["arena_unique_133", "鋼岩ゼロス"],
    ["arena_unique_134", "鋼影レオン"],
    ["arena_unique_137", "黒風ネフィラ"],
    ["arena_unique_141", "毒鐘バロウ"],
    ["arena_unique_142", "氷火キリエ"],
    ["arena_unique_143", "呪潮ドグマ"],
    ["arena_unique_145", "暗毒アルマ"],
    ["arena_unique_148", "風蝕ヘリオ"],
    ["arena_unique_153", "白昼レオン"],
    ["arena_unique_154", "火山ミドラ"],
    ["arena_unique_155", "白潮風ガルド"],
    ["arena_unique_158", "氷光ラグナ"],
    ["arena_unique_159", "呪鐘セレス"],
    ["arena_unique_163", "地毒ヴェイン"],
    ["arena_unique_165", "鋼呪ザクロ"],
    ["arena_unique_168", "砕光クオン"],
    ["arena_unique_179", "地潮バロウ"],
    ["arena_unique_180", "風雷キリエ"],
    ["arena_unique_182", "幻霜ヴェイン"],
    ["arena_unique_183", "斬呪アルマ"],
    ["arena_unique_184", "砕酸ザクロ"],
    ["arena_unique_189", "氷鋼イグナ"],
    ["arena_unique_191", "呪嵐レオン"],
    ["arena_unique_192", "酸鋼ミドラ"],
  ].forEach(([id, name]) => individuallyAuthoredUniqueNames.set(id, name));
  window.HD_DATA.individuallyAuthoredUniqueNames = individuallyAuthoredUniqueNames;

  const arenaRolesByAttribute = {
    fire: "火渡り", water: "潮騎士", thunder: "雷走り", poison: "毒杯師", ice: "霜刃",
    curse: "呪印師", acid: "腐蝕工", dark: "影役者", light: "灯守", earth: "岩砕き",
    wind: "風乗り", steel: "鋼拳士", illusion: "夢芝居", slash: "剣舞手", blunt: "鐘打ち",
  };

  function authoredArenaOriginName(monster) {
    if (monster.singularTrait) return monster.singularTrait.name;
    if (monster.migratedFromArenaRank && monster.peakyProfile) {
      const profileNames = {
        glass_cannon: `一撃だけを残す闘士・${monster.coreName}〈${monster.arenaTitle}〉`,
        immovable_fortress: `動かぬ城塞・${monster.coreName}〈${monster.arenaTitle}〉`,
        blink_assassin: `瞬きの後の暗殺者・${monster.coreName}〈${monster.arenaTitle}〉`,
        elemental_bastion: `五色城の守人・${monster.coreName}〈${monster.arenaTitle}〉`,
        doomsday_engine: `終末砲台・${monster.coreName}〈${monster.arenaTitle}〉`,
      };
      return profileNames[monster.peakyProfile];
    }
    if (monster.arenaOnly) {
      return `${monster.arenaTitle}の${arenaRolesByAttribute[monster.attackAttribute] || "闘士"}・${monster.coreName}`;
    }
    return monster.name;
  }

  function addUniqueEpithet(monster, index) {
    const previousName = monster.name;
    monster.name = individuallyAuthoredUniqueNames.get(monster.id) || authoredArenaOriginName(monster);
    const hash = [...monster.id].reduce((sum, char) => sum + char.charCodeAt(0), index);
    const heads = uniqueEpithetHeads[monster.attackAttribute] || uniqueEpithetHeads.dark;
    const head = heads[hash % heads.length];
    const tail = uniqueEpithetTails[(hash + index) % uniqueEpithetTails.length];
    const phrase = monster.arenaOnly ? head : `${head}${tail}`;
    monster.baseName = monster.name;
    monster.epithet = phrase;
    monster.name = monster.id === "dungeon_lord_nox"
      ? "《認識圏外より来たるもの》太古からの闇キキルクルス"
      : exceptionalUniqueNames.get(monster.id) || monster.baseName;
    if (monster.dangerous?.telegraph) {
      monster.dangerous.telegraph = monster.dangerous.telegraph
        .replace(previousName, monster.name)
        .replace(monster.baseName, monster.name);
    }
  }

  // B61以深のダンジョン系ユニークは、終盤装備の更新を前提に深度比例で強化する。
  // 闘技場個体とラスボスは専用の強化曲線を持つため対象外とする。
  window.HD_DATA.monsters.filter((monster) => {
    const nativeFloor = Math.min(...(monster.floors || [0]));
    return monster.unique && !monster.arenaOnly && monster.id !== "dungeon_lord_nox" && nativeFloor >= 61;
  }).forEach((monster) => {
    const nativeFloor = Math.min(...monster.floors);
    const depthRatio = Math.min(1, Math.max(0, (nativeFloor - 60) / 40));
    const hpScale = 1.2 + depthRatio * 0.3;
    const attackScale = 1.12 + depthRatio * 0.18;
    const defenseScale = 1.1 + depthRatio * 0.2;
    if (monster.peakyBaseline) {
      monster.peakyBaseline.hp *= hpScale;
      monster.peakyBaseline.attack *= attackScale;
      monster.peakyBaseline.defense *= defenseScale;
      monster.peakyBaseline.acceleration += 4 + Math.floor(depthRatio * 6);
      monster.peakyBaseline.danger *= 1.15 + depthRatio * 0.2;
    }
    monster.hp = Math.round(monster.hp * hpScale);
    monster.attack = Math.round(monster.attack * attackScale);
    monster.defense = Math.round(monster.defense * defenseScale);
    monster.acceleration = Number(monster.acceleration || 0) + 4 + Math.floor(depthRatio * 6);
    if (monster.dangerous) monster.dangerous.power = Math.round(monster.dangerous.power * (1.15 + depthRatio * 0.2));
    monster.deepUniquePower = Number((hpScale + attackScale + defenseScale) / 3).toFixed(2);
    monster.research = monster.research || {};
    monster.research[1] = `${monster.research[1] || ""} 深層補正により基礎能力が引き上げられている。`.trim();
  });

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
  const dungeonLord = window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox");
  if (dungeonLord) {
    dungeonLord.summon = { every: 3, count: 1, maxAlive: 2, maxTotal: 8, pool: "undefeated_deep_unique", minFloor: 60 };
    dungeonLord.elixirAttrition = { every: 2, ratio: 0.05, recommended: 4 };
    dungeonLord.automaticSpecialAttack = false;
    dungeonLord.research[2] = `${dungeonLord.research[2] || ""} 未討伐の深層ユニークを迷宮の記憶から再召喚する。先に倒した個体は召喚できない。`.trim();
  }

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
  // 色・種族・個体特性・深層補正を全て適用した後に、最終データの矛盾を取り除く。
  window.HD_DATA.monsters.forEach((monster) => {
    const weaknesses = new Set(monster.weaknesses || []);
    weaknesses.forEach((attribute) => {
      const resistance = monster.resistances?.[attribute];
      if (resistance === "immune" || Number(resistance) > 0) delete monster.resistances[attribute];
    });
    if (monster.demonicWard?.attributes) {
      monster.demonicWard.attributes = monster.demonicWard.attributes.filter((attribute) => !weaknesses.has(attribute));
      if (!monster.demonicWard.attributes.length) delete monster.demonicWard;
    }
    if (monster.rapidRegeneration) {
      monster.rapidRegeneration.amount = Math.max(
        1,
        Math.ceil(monster.hp * Number(monster.rapidRegeneration.rate || 0)),
      );
    }
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
