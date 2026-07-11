(function () {
  window.HD_DATA = window.HD_DATA || {};
  const allJobs = window.HD_DATA.jobs.map((job) => job.id);
  const bladeJobs = ["swordsman", "hunter", "archer", "spellblade", "scavenger", "handyman"];
  const maulJobs = ["swordsman", "heavy", "researcher", "scavenger", "handyman", "priest"];
  const toolJobs = ["hunter", "archer", "researcher", "mage", "spellblade", "tourist", "psychic", "scavenger", "handyman", "priest"];
  const coatJobs = allJobs;
  const greavesJobs = ["swordsman", "heavy", "spellblade", "scavenger", "handyman"];
  const bootsJobs = ["hunter", "archer", "researcher", "mage", "spellblade", "tourist", "psychic", "handyman", "priest"];

  window.HD_DATA.equipment = [
    {
      id: "rusty_knife",
      name: "錆びたナイフ",
      slot: "weapon",
      attack: 1,
      defense: 0,
      attributeAttack: "slash",
      resistances: {},
      jobs: allJobs,
      recipe: null,
      description: "新米冒険者に支給される最低限の刃物。",
    },
    {
      id: "iron_sword",
      name: "鉄の剣",
      slot: "weapon",
      attack: 4,
      defense: 0,
      attributeAttack: "slash",
      resistances: {},
      jobs: bladeJobs,
      recipe: { rat_tail: 1, clean_pelt: 1 },
      description: "斬属性の安定した武器。",
    },
    {
      id: "bone_maul",
      name: "骨砕き槌",
      slot: "weapon",
      attack: 5,
      defense: 0,
      attributeAttack: "blunt",
      resistances: {},
      jobs: maulJobs,
      recipe: { broken_carapace: 2, fire_lizard_marrow: 1 },
      description: "打属性で甲殻や骨を割る武器。",
    },
    {
      id: "hunter_bow",
      name: "狩人の弓",
      slot: "weapon",
      attack: 3,
      defense: 0,
      attributeAttack: "slash",
      resistances: {},
      jobs: ["hunter", "archer", "scavenger", "handyman"],
      recipe: { fine_pelt: 1, bat_wing_membrane: 1 },
      description: "狩人の精密射撃と相性がよい弓。",
    },
    {
      id: "fire_lizard_dagger",
      name: "火蜥蜴の短剣",
      slot: "weapon",
      attack: 4,
      defense: 0,
      attributeAttack: "fire",
      resistances: { fire: 1 },
      jobs: ["hunter", "mage", "spellblade", "scavenger", "handyman"],
      recipe: { fire_lizard_scale: 1, cool_fire_gland: 1 },
      description: "火属性攻撃ができる短剣。素材焼損に注意。",
    },
    {
      id: "cloth",
      name: "旅布の服",
      slot: "upper",
      attack: 0,
      defense: 1,
      attributeAttack: null,
      resistances: {},
      jobs: coatJobs,
      recipe: null,
      description: "最低限の防具。",
    },
    {
      id: "fur_clothes",
      name: "毛皮の服",
      slot: "upper",
      attack: 0,
      defense: 2,
      attributeAttack: null,
      resistances: { poison: 1 },
      jobs: coatJobs,
      recipe: { clean_pelt: 2 },
      description: "毒牙蝙蝠の小傷を少し抑える。",
    },
    {
      id: "carapace_armor",
      name: "甲殻の鎧",
      slot: "lower",
      attack: 0,
      defense: 4,
      attributeAttack: null,
      resistances: { slash: 1, blunt: 1 },
      jobs: greavesJobs,
      recipe: { broken_carapace: 3 },
      description: "物理に強いが重い鎧。",
    },
    {
      id: "fire_lizard_cloak",
      name: "火蜥蜴の外套",
      slot: "upper",
      attack: 0,
      defense: 2,
      attributeAttack: null,
      resistances: { fire: 2 },
      jobs: allJobs,
      recipe: { fire_lizard_scale: 2, cool_fire_gland: 1 },
      description: "火耐性を大きく上げる。赤熱のガルム攻略の要。",
    },
    {
      id: "thunder_charm",
      name: "雷避けの護符",
      slot: "accessory",
      attack: 0,
      defense: 0,
      attributeAttack: null,
      resistances: { thunder: 2 },
      jobs: allJobs,
      recipe: { thunder_horn: 1 },
      description: "雷角兎の雷を受け流す護符。",
    },
    {
      id: "garm_fireguard",
      name: "ガルムの火除け",
      slot: "accessory",
      attack: 0,
      defense: 1,
      attributeAttack: null,
      resistances: { fire: 2 },
      jobs: allJobs,
      recipe: { garm_fire_core: 1 },
      description: "賞金首討伐の証。火への備えをさらに固める。",
    },
  ];

  const themes = [
    { id: "beast", name: "小獣", material: "small_beast_meat", sub: "rat_tail", attribute: "slash", resistance: "blunt" },
    { id: "tail", name: "尾骨", material: "rat_tail", sub: "clean_pelt", attribute: "slash", resistance: "slash" },
    { id: "pelt", name: "柔毛", material: "clean_pelt", sub: "small_beast_meat", attribute: "wind", resistance: "poison" },
    { id: "shell", name: "甲殻", material: "broken_carapace", sub: "rat_tail", attribute: "blunt", resistance: "blunt" },
    { id: "scorch", name: "焦皮", material: "scorched_hide", sub: "broken_carapace", attribute: "fire", resistance: "fire" },
    { id: "fine", name: "白銀毛", material: "fine_pelt", sub: "bat_wing_membrane", attribute: "ice", resistance: "ice" },
    { id: "venom", name: "毒牙", material: "poison_fang", sub: "bat_wing_membrane", attribute: "poison", resistance: "poison" },
    { id: "wing", name: "夜翼", material: "bat_wing_membrane", sub: "clean_pelt", attribute: "wind", resistance: "illusion" },
    { id: "thunder", name: "雷角", material: "thunder_horn", sub: "unbroken_horn", attribute: "thunder", resistance: "thunder" },
    { id: "lizard", name: "火蜥蜴", material: "fire_lizard_scale", sub: "cool_fire_gland", attribute: "water", resistance: "fire" },
    { id: "garm", name: "赤熱", material: "garm_fire_core", sub: "garm_red_pelt", attribute: "fire", resistance: "fire" },
  ];
  const weaponForms = [
    { id: "blade", name: "刃", jobs: bladeJobs },
    { id: "maul", name: "鎚", jobs: maulJobs },
    { id: "tool", name: "猟具", jobs: toolJobs },
  ];
  const armorForms = [
    { id: "coat", name: "上衣", slot: "upper", jobs: coatJobs },
    { id: "greaves", name: "脚甲", slot: "lower", jobs: greavesJobs },
    { id: "boots", name: "長靴", slot: "feet", jobs: bootsJobs },
  ];
  const charmForms = [
    { id: "pendant", name: "首飾り" },
    { id: "ring", name: "指輪" },
    { id: "talisman", name: "護符" },
  ];

  themes.forEach((theme, themeIndex) => {
    weaponForms.forEach((form, formIndex) => {
      window.HD_DATA.equipment.push({
        id: `crafted_${theme.id}_${form.id}`,
        name: `${theme.name}の${form.name}`,
        slot: "weapon",
        attack: Math.min(7, 2 + Math.floor(themeIndex / 2) + formIndex),
        defense: formIndex === 1 ? 1 : 0,
        attributeAttack: formIndex === 1 ? "blunt" : theme.attribute,
        resistances: formIndex === 2 ? { [theme.resistance]: 1 } : {},
        jobs: form.jobs,
        recipe: { [theme.material]: 1 + (themeIndex > 5 ? 1 : 0), [theme.sub]: 1 },
        description: `${theme.name}素材を活かした${form.name}。${window.HD_DATA.attributeLabels[formIndex === 1 ? "blunt" : theme.attribute]}属性の戦い方に向く。`,
      });
    });
    armorForms.forEach((form, formIndex) => {
      window.HD_DATA.equipment.push({
        id: `crafted_${theme.id}_${form.id}`,
        name: `${theme.name}の${form.name}`,
        slot: form.slot,
        attack: 0,
        defense: Math.min(6, 1 + Math.floor(themeIndex / 3) + formIndex),
        attributeAttack: null,
        resistances: { [theme.resistance]: formIndex === 2 || themeIndex >= 8 ? 2 : 1 },
        jobs: form.jobs,
        recipe: { [theme.material]: 2 + formIndex, [theme.sub]: 1 },
        description: `${theme.name}素材で仕立てた${form.name}。${window.HD_DATA.attributeLabels[theme.resistance]}耐性を備える。`,
      });
    });
    charmForms.forEach((form, formIndex) => {
      window.HD_DATA.equipment.push({
        id: `crafted_${theme.id}_${form.id}`,
        name: `${theme.name}の${form.name}`,
        slot: "accessory",
        attack: formIndex === 1 ? 1 : 0,
        defense: formIndex === 0 ? 1 : 0,
        attributeAttack: null,
        resistances: { [theme.resistance]: formIndex === 2 ? 2 : 1 },
        jobs: allJobs,
        recipe: { [theme.material]: 1 + formIndex, [theme.sub]: 1 },
        description: `${theme.name}の力を封じた${form.name}。${window.HD_DATA.attributeLabels[theme.resistance]}への備えとなる。`,
      });
    });
  });

  const baseCatalog = window.HD_DATA.equipment.slice();
  const materials = window.HD_DATA.materials.map((material) => material.id);
  const grades = ["粗製", "普及", "良質", "精巧", "名工", "希少", "秘宝", "英雄", "神話"];
  const resistanceAttributes = window.HD_DATA.attributes.filter((id) => !["slash", "blunt"].includes(id));
  baseCatalog.forEach((base, baseIndex) => {
    grades.forEach((grade, gradeIndex) => {
      const fallbackMaterial = materials[(baseIndex + gradeIndex) % materials.length];
      const sourceRecipe = base.recipe || { [fallbackMaterial]: 1 };
      const recipe = Object.fromEntries(Object.entries(sourceRecipe).map(([id, count]) => [id, count + gradeIndex]));
      const resistanceBonus = gradeIndex >= 5 ? 1 : 0;
      const resistances = Object.fromEntries(Object.entries(base.resistances || {}).map(([id, value]) => [id, value === "immune" ? value : Math.min(5, value + resistanceBonus)]));
      const extraAttributes = [
        resistanceAttributes[(baseIndex + gradeIndex) % resistanceAttributes.length],
        resistanceAttributes[(baseIndex * 3 + gradeIndex + 4) % resistanceAttributes.length],
        resistanceAttributes[(baseIndex * 5 + gradeIndex + 8) % resistanceAttributes.length],
        resistanceAttributes[(baseIndex * 7 + gradeIndex + 2) % resistanceAttributes.length],
      ];
      if (gradeIndex >= 2) resistances[extraAttributes[0]] = Math.max(Number(resistances[extraAttributes[0]] || 0), 1 + Math.floor(gradeIndex / 3));
      if (gradeIndex >= 4) resistances[extraAttributes[1]] = Math.max(Number(resistances[extraAttributes[1]] || 0), 1 + Math.floor((gradeIndex - 2) / 3));
      if (gradeIndex >= 6) resistances[extraAttributes[2]] = Math.max(Number(resistances[extraAttributes[2]] || 0), 1 + Math.floor((gradeIndex - 4) / 3));
      if (gradeIndex >= 8) resistances[extraAttributes[3]] = Math.max(Number(resistances[extraAttributes[3]] || 0), 1);
      if (gradeIndex === 8 && baseIndex % 37 === 0) resistances[extraAttributes[0]] = "immune";
      window.HD_DATA.equipment.push({
        ...base,
        id: `series_${gradeIndex + 1}_${base.id}`,
        name: `${grade}・${base.name}`,
        attack: (base.attack || 0) + Math.ceil(gradeIndex / 2),
        defense: (base.defense || 0) + Math.floor(gradeIndex / 2),
        resistances,
        acceleration: gradeIndex >= 5 && baseIndex % 4 === 0 ? 1 + Math.floor(gradeIndex / 3) : 0,
        hpRegen: gradeIndex >= 6 && baseIndex % 19 === 0 ? 1 + Math.floor((gradeIndex - 6) / 2) : 0,
        recipe,
        description: `${base.description} ${grade}等級の派生装備。`,
      });
    });
  });

  // 耐性は単品で完成させず、複数部位を組み替えて1〜5段階を作るための結界装備群。
  // 重装部位は主耐性が高い代わりに加速を失い、護符は反対属性へ隙が生まれる。
  const wardOpposites = {
    light: "dark", dark: "light", fire: "water", water: "thunder", earth: "wind",
    wind: "earth", thunder: "earth", poison: "light", ice: "fire", curse: "light",
    acid: "steel", slash: "blunt", blunt: "slash", illusion: "steel", steel: "acid",
  };
  const wardForms = [
    { id: "mantle", name: "結界衣", slot: "upper", resistance: 2, defense: 4, acceleration: -2, jobs: coatJobs },
    { id: "plate", name: "封護脚甲", slot: "lower", resistance: 2, defense: 7, acceleration: -4, jobs: greavesJobs },
    { id: "stride", name: "避け足", slot: "feet", resistance: 1, defense: 2, acceleration: 6, jobs: bootsJobs },
    { id: "seal", name: "偏向護符", slot: "accessory", resistance: 2, defense: 0, acceleration: 0, vulnerable: true, jobs: allJobs },
  ];
  window.HD_DATA.attributes.forEach((attribute, attributeIndex) => {
    const material = materials[(attributeIndex * 3 + 2) % materials.length];
    const subMaterial = materials[(attributeIndex * 5 + 7) % materials.length];
    const opposite = wardOpposites[attribute];
    wardForms.forEach((form) => {
      const resistances = { [attribute]: form.resistance };
      if (form.vulnerable && opposite) resistances[opposite] = -1;
      window.HD_DATA.equipment.push({
        id: `ward_${attribute}_${form.id}`,
        name: `${window.HD_DATA.attributeLabels[attribute]}の${form.name}`,
        slot: form.slot,
        attack: 0,
        defense: form.defense,
        acceleration: form.acceleration,
        hpRegen: 0,
        attributeAttack: null,
        resistances,
        jobs: form.jobs,
        recipe: { [material]: form.slot === "accessory" ? 2 : 3, [subMaterial]: form.slot === "lower" ? 2 : 1 },
        description: form.vulnerable
          ? `${window.HD_DATA.attributeLabels[attribute]}耐性を二段階重ねるが、${window.HD_DATA.attributeLabels[opposite]}耐性が一段階低下する。耐性5を狙う際の最後の一手。`
          : `${window.HD_DATA.attributeLabels[attribute]}耐性を${form.resistance}段階重ねる${form.acceleration < 0 ? `重装。加速${form.acceleration}との交換になる` : "軽装。耐性を補いながら機動力を保つ"}。`,
      });
    });
  });

  window.HD_DATA.equipment.push(
    { id: "truth_lens", name: "透界の片眼鏡", slot: "accessory", attack: 0, defense: 0, acceleration: 1, hpRegen: 0, attributeAttack: null, resistances: { illusion: 1 }, trueSight: true, jobs: allJobs, recipe: { fine_pelt: 2, bat_wing_membrane: 2 }, description: "空気の歪みを色として映し、透明な魔物を常時視認できる片眼鏡。" },
    { id: "echo_visor", name: "残響測距面", slot: "upper", attack: 0, defense: 5, acceleration: -1, hpRegen: 0, attributeAttack: null, resistances: { dark: 1, wind: 1 }, trueSight: true, jobs: coatJobs, recipe: { thunder_horn: 2, broken_carapace: 3 }, description: "反響音から輪郭を描き、透明な魔物を常時視認できる測距面。" },
  );

  window.HD_DATA.equipment.push(
    { id: "guild_comet_blade", name: "彗星払い", slot: "weapon", attack: 18, defense: 0, acceleration: 10, hpRegen: 0, attributeAttack: "light", resistances: { light: 3, dark: 2 }, jobs: bladeJobs, recipe: null, description: "抜刀と同時に一歩先へ出る、ギルド競技会の優勝剣。", guildCost: 45 },
    { id: "guild_glass_cannon", name: "硝子砲槌", slot: "weapon", attack: 32, defense: -6, acceleration: 0, hpRegen: 0, attributeAttack: "blunt", resistances: { fire: 2, acid: 2 }, jobs: maulJobs, recipe: null, description: "防御を捨てて破壊だけを残した、笑えるほど極端な大槌。", guildCost: 55 },
    { id: "guild_wind_coat", name: "追風の外套", slot: "upper", attack: 0, defense: 7, acceleration: 12, hpRegen: 0, attributeAttack: null, resistances: { wind: 4, thunder: 2, illusion: 2 }, jobs: bootsJobs, recipe: null, description: "着用者の次の動作を風が先回りする軽装外套。俊敏職向け。", guildCost: 60 },
    { id: "guild_regen_mail", name: "脈動生体鎧", slot: "upper", attack: 0, defense: 14, acceleration: 0, hpRegen: 5, attributeAttack: null, resistances: { poison: 4, acid: 3, curse: 2 }, jobs: ["heavy", "researcher", "mage", "scavenger", "handyman"], recipe: null, description: "傷口へ根を伸ばして塞ぐ、少し気味の悪い生きた鎧。生命や素材を扱う職向け。", guildCost: 70 },
    { id: "guild_anchor_greaves", name: "不動脚甲", slot: "lower", attack: 0, defense: 20, acceleration: -8, hpRegen: 0, attributeAttack: null, resistances: { blunt: 3, steel: 3, earth: 2, wind: -1 }, jobs: greavesJobs, recipe: null, description: "三系統の耐性をまとめて稼げるが、遅くなり風に弱くなる重脚甲。耐性5には他部位の補強が必要。", guildCost: 65 },
    { id: "guild_flash_boots", name: "三歩先の長靴", slot: "feet", attack: 0, defense: 4, acceleration: 20, hpRegen: 0, attributeAttack: null, resistances: { thunder: 3, wind: 3 }, jobs: bootsJobs, recipe: null, description: "履いた本人より先に曲がり角へ到着する、俊敏職専用の長靴。", guildCost: 85 },
    { id: "guild_phoenix_ring", name: "不死鳥の指輪", slot: "accessory", attack: 2, defense: 2, acceleration: 0, hpRegen: 4, attributeAttack: "fire", resistances: { fire: "immune", ice: 3 }, jobs: allJobs, recipe: null, description: "ごく稀な火免疫と再生を宿す、ギルド秘蔵の指輪。", guildCost: 120 },
    { id: "guild_void_talisman", name: "空白の護符", slot: "accessory", attack: 0, defense: 3, acceleration: 5, hpRegen: 1, attributeAttack: null, resistances: { dark: 3, curse: 3, illusion: 4, light: -2 }, trueSight: true, jobs: allJobs, recipe: null, description: "闇・呪・幻を強く拒絶し、透明な存在も視認する代わりに光へ大きな隙を晒す護符。", guildCost: 135 },
    { id: "guild_rainbow_pendant", name: "十五色の首飾り", slot: "accessory", attack: 0, defense: 0, acceleration: 3, hpRegen: 2, attributeAttack: null, resistances: Object.fromEntries(window.HD_DATA.attributes.map((id) => [id, 1])), trueSight: true, jobs: allJobs, recipe: null, description: "全属性を薄く受け止め、透明な存在を色収差として映す破天荒な首飾り。", guildCost: 100 },
    { id: "guild_tourist_camera", name: "生還者の魔導カメラ", slot: "weapon", attack: 8, defense: 5, acceleration: 15, hpRegen: 3, attributeAttack: "light", resistances: { light: 4, illusion: 4, curse: 3 }, jobs: ["tourist"], recipe: null, description: "観光客だけが扱える。死地ほど鮮明に写る伝説の撮影具。", guildCost: 90 }
  );

  const guildPrizeNames = [
    "火喰いの弓", "深海の魔杖", "雷獣の短剣", "毒王の手甲", "氷河割り", "呪返しの鐘",
    "溶岩泳ぎの鎧", "月影を縫う外套", "朝焼けの胸当て", "歩く城壁", "台風乗りの羽衣", "鋼花の胴丸",
    "幻踏みの脚衣", "千枚刃の腰鎧", "震天の具足", "流星追いの靴", "時盗みの足輪", "逆さ歩きの草履",
    "竜心の指環", "海鳴りの耳飾り", "雷雲瓶", "毒見王の勲章", "永久氷片", "厄落としの仮面",
    "万象羅針盤", "空飛ぶ金床", "迷宮の目覚まし", "昨日の盾", "明日の切符", "終幕拒否の王冠",
  ];
  const guildPrizeAttributes = ["fire", "water", "thunder", "poison", "ice", "curse", "acid", "dark", "light", "earth", "wind", "steel", "illusion", "slash", "blunt"];
  const guildPrizeSlots = ["weapon", "weapon", "weapon", "weapon", "weapon", "weapon", "upper", "upper", "upper", "upper", "upper", "upper", "lower", "lower", "lower", "feet", "feet", "feet", "accessory", "accessory", "accessory", "accessory", "accessory", "accessory", "accessory", "accessory", "accessory", "accessory", "accessory", "accessory"];
  guildPrizeNames.forEach((name, index) => {
    const attribute = guildPrizeAttributes[index % guildPrizeAttributes.length];
    const counter = guildPrizeAttributes[(index + 6) % guildPrizeAttributes.length];
    const slot = guildPrizeSlots[index];
    const highTier = Math.floor(index / 6);
    const jobs = index === 0 ? ["archer"] : index === 1 ? ["mage", "spellblade"]
      : slot === "weapon" ? [bladeJobs, maulJobs, toolJobs][index % 3]
        : slot === "lower" ? greavesJobs : slot === "feet" ? bootsJobs : slot === "upper" ? coatJobs : allJobs;
    const resistances = { [attribute]: Math.min(5, 2 + highTier), [counter]: Math.min(5, 1 + Math.floor(highTier / 2)) };
    if (index === 24) window.HD_DATA.attributes.forEach((id) => { resistances[id] = Math.max(Number(resistances[id] || 0), 2); });
    if (index === 29) resistances.curse = "immune";
    window.HD_DATA.equipment.push({
      id: `guild_prize_${String(index + 11).padStart(2, "0")}`,
      name,
      slot,
      attack: slot === "weapon" ? 14 + index * 2 : index >= 24 ? 6 : 0,
      defense: slot === "weapon" ? Math.floor(index / 3) : 5 + highTier * 3 + (index % 4),
      acceleration: [0, 3, 5, 10, 12, 20][(index + highTier) % 6],
      hpRegen: index >= 18 && index % 3 === 0 ? 2 + highTier : 0,
      attributeAttack: slot === "weapon" ? attribute : null,
      resistances,
      jobs,
      recipe: null,
      description: `${window.HD_DATA.attributeLabels[attribute]}の性質を極端に引き出したギルド第${index + 11}景品。性能の癖まで使いこなす玄人向け。`,
      guildCost: 25 + index * 8 + highTier * 12,
    });
  });

  window.HD_DATA.equipment.push({
    id: "game_master_emblem", name: "ゲームマスターの紋章", slot: "accessory",
    attack: 100, defense: 100, acceleration: 50, hpRegen: 25, attributeAttack: "light",
    resistances: Object.fromEntries(window.HD_DATA.attributes.map((id) => [id, "immune"])),
    jobs: allJobs, recipe: null, masterOnly: true,
    description: "全ユニーク討伐者だけに与えられる、全属性免疫を持つチートレベルの装備。",
  });

  window.HD_DATA.equipment.push({
    id: "omniscient_archive", name: "万象録の観測環", slot: "accessory",
    attack: 35, defense: 35, acceleration: 25, hpRegen: 10, attributeAttack: null,
    resistances: Object.fromEntries(window.HD_DATA.attributes.map((id) => [id, 3])),
    trueSight: true, jobs: allJobs, recipe: null, completionOnly: true,
    description: "全モンスターを5/5まで完全解析した記録者へ贈られる。全属性耐性3、透明視認、高い戦闘補正を併せ持つ特別装備。",
  });

  // 宝箱からしか見つからない固定IDの一点物。星印は表示側で artifact を見て付与する。
  window.HD_DATA.equipment.push(
    {
      id: "artifact_invisible_emperor_cloak", name: "王様の透明外套", slot: "upper",
      attack: 0, defense: -2, acceleration: 6, hpRegen: 0, attributeAttack: null, resistances: { illusion: 2 },
      jobs: allJobs, recipe: null, artifact: { tier: "joke", label: "ネタアーティファクト", guildPoints: 5, chestOnly: true },
      curse: { id: "public_shame", name: "裸の王様", severity: 1, penalties: { defense: -3 }, description: "本人にだけ豪華な外套が見える。" },
      description: "着ている本人は威厳を感じるが、周囲には何も見えない外套。",
    },
    {
      id: "artifact_owner_seeking_boomerang", name: "持ち主狙いのブーメラン", slot: "weapon",
      attack: 4, defense: 0, acceleration: 5, hpRegen: 0, attributeAttack: "wind", attackAttributes: ["wind", "blunt"], resistances: {},
      jobs: allJobs, recipe: null, artifact: { tier: "joke", label: "ネタアーティファクト", guildPoints: 6, chestOnly: true },
      curse: { id: "faithful_return", name: "忠実すぎる帰還", severity: 1, penalties: { maxHp: -4 }, description: "投げるたび、なぜか持ち主へ先に当たる。" },
      description: "どこへ投げても必ず帰る。敵を経由するとは限らない。",
    },
    {
      id: "artifact_endless_alarm", name: "鳴り止まない目覚まし", slot: "accessory",
      attack: 0, defense: 0, acceleration: 9, hpRegen: -1, attributeAttack: null, resistances: { illusion: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "joke", label: "ネタアーティファクト", guildPoints: 7, chestOnly: true },
      curse: { id: "sleepless", name: "不眠", severity: 1, penalties: { hpRegen: -2 }, description: "装備中は一瞬たりとも静かにならない。" },
      description: "針も文字盤もないのに、最悪の時機だけは正確に告げる。",
    },
    {
      id: "artifact_reversed_hero_boots", name: "左右逆の勇者靴", slot: "feet",
      attack: 1, defense: 2, acceleration: -3, hpRegen: 0, attributeAttack: null, resistances: { earth: 1, wind: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "joke", label: "ネタアーティファクト", guildPoints: 8, chestOnly: true },
      description: "左右を正しく履くと動きにくく、逆に履くと少しだけ勇ましく見える。",
    },

    {
      id: "artifact_holey_bucket_helm", name: "穴だらけの英雄兜", slot: "upper",
      attack: 0, defense: 1, acceleration: -2, hpRegen: 0, attributeAttack: null, resistances: { water: -1, acid: -1 },
      jobs: allJobs, recipe: null, artifact: { tier: "trash", label: "ゴミアーティファクト", guildPoints: 9, chestOnly: true },
      curse: { id: "rain_collector", name: "雨集め", severity: 2, penalties: { defense: -2 }, description: "あらゆる液体が穴を通って頭へ集まる。" },
      description: "兜だと言い張る者もいるが、どう見ても底の抜けた古いバケツ。",
    },
    {
      id: "artifact_world_dulling_sword", name: "世界まで鈍らせる鈍刀", slot: "weapon",
      attack: 3, defense: 1, acceleration: -5, hpRegen: 0, attributeAttack: "blunt", resistances: { steel: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "trash", label: "ゴミアーティファクト", guildPoints: 11, chestOnly: true },
      curse: { id: "dull_world", name: "鈍化伝染", severity: 2, penalties: { attack: -3, acceleration: -4 }, description: "刃だけでなく使い手の反応まで鈍らせる。" },
      description: "何も斬れない代わりに、叩かれた側も少し呆れる。",
    },
    {
      id: "artifact_moth_eaten_mail", name: "千穴の虫喰い鎧", slot: "lower",
      attack: 0, defense: 3, acceleration: -6, hpRegen: 0, attributeAttack: null, resistances: { slash: -1, poison: -1 },
      jobs: allJobs, recipe: null, artifact: { tier: "trash", label: "ゴミアーティファクト", guildPoints: 12, chestOnly: true },
      curse: { id: "phantom_moths", name: "幻虫の巣", severity: 2, penalties: { maxHp: -8 }, description: "見えない虫が内側から着用者を齧る。" },
      description: "穴を数え終わる前に、新しい穴が一つ増える鎧。",
    },
    {
      id: "artifact_expired_talisman", name: "期限切れの厄除け札", slot: "accessory",
      attack: 0, defense: 0, acceleration: 0, hpRegen: 0, attributeAttack: null, resistances: { curse: -2, dark: -1 },
      jobs: allJobs, recipe: null, artifact: { tier: "trash", label: "ゴミアーティファクト", guildPoints: 13, chestOnly: true },
      curse: { id: "misfortune_interest", name: "厄の利息", severity: 3, penalties: { defense: -3, maxHp: -6 }, description: "防げなかった厄が利息付きで戻ってくる。" },
      description: "百年前までは有効だったらしい。更新窓口は閉鎖済み。",
    },

    {
      id: "artifact_old_guard_blade", name: "古衛士の直剣", slot: "weapon",
      attack: 11, defense: 2, acceleration: 0, hpRegen: 0, attributeAttack: "slash", resistances: { steel: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "ordinary", label: "平凡アーティファクト", guildPoints: 24, chestOnly: true },
      description: "名も残らなかった衛士が、最後まで手放さなかった堅実な剣。",
    },
    {
      id: "artifact_moon_thread_coat", name: "月糸の旅外套", slot: "upper",
      attack: 0, defense: 8, acceleration: 3, hpRegen: 1, attributeAttack: null, resistances: { dark: 2, ice: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "ordinary", label: "平凡アーティファクト", guildPoints: 27, chestOnly: true },
      curse: { id: "homesick_moon", name: "月郷病", severity: 1, penalties: { acceleration: -2 }, description: "月の見えない場所では足取りが少し重くなる。" },
      description: "月明かりを撚った糸で織られた、丈夫で軽い外套。",
    },
    {
      id: "artifact_three_color_charm", name: "三色守りの石", slot: "accessory",
      attack: 1, defense: 2, acceleration: 1, hpRegen: 0, attributeAttack: null, resistances: { fire: 2, water: 2, thunder: 2 },
      jobs: allJobs, recipe: null, artifact: { tier: "ordinary", label: "平凡アーティファクト", guildPoints: 30, chestOnly: true },
      description: "三つの基本属性を無難に受け止める、実直な護り石。",
    },
    {
      id: "artifact_patient_greaves", name: "百里歩きの脚甲", slot: "lower",
      attack: 0, defense: 9, acceleration: 4, hpRegen: 1, attributeAttack: null, resistances: { earth: 2, blunt: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "ordinary", label: "平凡アーティファクト", guildPoints: 32, chestOnly: true },
      curse: { id: "never_rest", name: "休息拒絶", severity: 1, penalties: { hpRegen: -1 }, description: "立ち止まると脚甲が小刻みに歩き出す。" },
      description: "派手さはないが、長い探索で疲れを感じにくい脚甲。",
    },

    {
      id: "artifact_steam_twinblade", name: "蒸界の双相剣", slot: "weapon",
      attack: 24, defense: 3, acceleration: 8, hpRegen: 0, attributeAttack: "fire", attackAttributes: ["fire", "water"], resistances: { fire: 3, water: 3 },
      jobs: allJobs, recipe: null, artifact: { tier: "useful", label: "使えるアーティファクト", guildPoints: 58, chestOnly: true },
      curse: { id: "boiling_blood", name: "沸血", severity: 2, penalties: { maxHp: -10 }, description: "火と水が交わるたび、使い手の血も熱を帯びる。" },
      description: "火と水の刃を同時に保ち、敵の耐性へ柔軟に食い込む名剣。",
    },
    {
      id: "artifact_shadow_step_boots", name: "影渡りの長靴", slot: "feet",
      attack: 2, defense: 7, acceleration: 22, hpRegen: 0, attributeAttack: null, resistances: { dark: 4, illusion: 2, light: -1 },
      jobs: allJobs, recipe: null, artifact: { tier: "useful", label: "使えるアーティファクト", guildPoints: 66, chestOnly: true },
      curse: { id: "light_shyness", name: "光嫌い", severity: 2, penalties: { defense: -4 }, description: "強い光の下で影が使い手を置き去りにする。" },
      description: "足元の影を一歩先へ伸ばし、着用者をそこまで運ぶ長靴。",
    },
    {
      id: "artifact_survivor_ring", name: "九死環", slot: "accessory",
      attack: 3, defense: 8, acceleration: 5, hpRegen: 5, attributeAttack: null, resistances: { poison: 3, curse: 3, acid: 3 },
      jobs: allJobs, recipe: null, artifact: { tier: "useful", label: "使えるアーティファクト", guildPoints: 74, chestOnly: true },
      curse: { id: "tenth_death", name: "十度目の死", severity: 2, penalties: { maxHp: -12 }, description: "九度救う代わりに、十度目を待ち続ける。" },
      description: "致命傷へ温かな脈動を送り、生還の可能性を拾い上げる指輪。",
    },
    {
      id: "artifact_omnivision_mask", name: "万路観測面", slot: "upper",
      attack: 4, defense: 12, acceleration: 6, hpRegen: 2, attributeAttack: null, resistances: { illusion: 4, dark: 3, light: 2 }, trueSight: true,
      jobs: allJobs, recipe: null, artifact: { tier: "useful", label: "使えるアーティファクト", guildPoints: 82, chestOnly: true },
      description: "視界に入らない通路まで残響で描き、透明な気配を暴く仮面。",
    },

    {
      id: "artifact_genesis_trinity", name: "創世三極杖", slot: "weapon",
      attack: 58, defense: 10, acceleration: 18, hpRegen: 6, attributeAttack: "light", attackAttributes: ["light", "dark", "curse"], resistances: { light: 5, dark: 5, curse: 4 }, trueSight: true,
      jobs: allJobs, recipe: null, artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 190, chestOnly: true },
      curse: { id: "creation_tax", name: "創世の代価", severity: 4, penalties: { maxHp: -25, hpRegen: -3 }, description: "三つの極を振るうたび、使い手の存在が少しずつ削れる。" },
      description: "光・闇・呪いの三極を一つの術式へ束ねる、法則外の魔杖。",
    },
    {
      id: "artifact_time_thief_boots", name: "時盗みの神速靴", slot: "feet",
      attack: 5, defense: 12, acceleration: 48, hpRegen: 3, attributeAttack: null, resistances: { thunder: 4, wind: 5, illusion: 3 },
      jobs: allJobs, recipe: null, artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 215, chestOnly: true },
      curse: { id: "borrowed_lifetime", name: "寿命前借り", severity: 5, penalties: { maxHp: -35 }, description: "得た時間はすべて未来の自分から盗まれている。" },
      description: "次の瞬間を奪い、誰より早く行動を終えてしまう禁足具。",
    },
    {
      id: "artifact_undying_world_mail", name: "不滅世界の生体鎧", slot: "upper",
      attack: 8, defense: 58, acceleration: -12, hpRegen: 14, attributeAttack: null, resistances: { slash: 5, blunt: 5, poison: "immune", acid: 4 },
      jobs: allJobs, recipe: null, artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 245, chestOnly: true },
      curse: { id: "living_prison", name: "生きた牢獄", severity: 4, penalties: { acceleration: -18 }, description: "鎧は着用者を守るほど、決して外へ出したくなくなる。" },
      description: "傷つくそばから世界の肉を継ぎ足し、形を取り戻す生体鎧。",
    },
    {
      id: "artifact_zero_crown", name: "零界王冠", slot: "accessory",
      attack: 25, defense: 25, acceleration: 25, hpRegen: 8, attributeAttack: null,
      resistances: Object.fromEntries(window.HD_DATA.attributes.map((id) => [id, id === "curse" ? "immune" : 4])), trueSight: true,
      jobs: allJobs, recipe: null, artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 300, chestOnly: true },
      curse: { id: "zero_identity", name: "存在零化", severity: 5, penalties: { attack: -18, defense: -18, maxHp: -40 }, description: "王冠はあらゆる力と共に、着用者の輪郭まで零へ近づける。" },
      description: "全属性を拒む零の境界を、着用者の周囲へ常時展開する王冠。",
    }
  );

  // 旧 attributeAttack を残したまま、全装備へ配列形式を保証する。
  const attackAttributePool = window.HD_DATA.attributes.slice();
  window.HD_DATA.equipment.forEach((item, equipmentIndex) => {
    const explicit = Array.isArray(item.attackAttributes) ? item.attackAttributes : [];
    const normalized = [...new Set([
      ...explicit,
      ...(item.attributeAttack ? [item.attributeAttack] : []),
    ].filter((id) => attackAttributePool.includes(id)))];
    const gradeMatch = /^series_(\d+)_/.exec(item.id);
    const grade = gradeMatch ? Number(gradeMatch[1]) : 0;
    if (item.slot === "weapon" && grade >= 6 && normalized.length) {
      const extraCount = grade >= 8 && equipmentIndex % 17 === 0 ? 2 : equipmentIndex % 7 === 0 ? 1 : 0;
      const candidates = attackAttributePool.filter((id) => !normalized.includes(id));
      for (let extraIndex = 0; extraIndex < extraCount && candidates.length; extraIndex += 1) {
        const candidateIndex = (equipmentIndex * 3 + grade * 5 + extraIndex * 7) % candidates.length;
        normalized.push(candidates.splice(candidateIndex, 1)[0]);
      }
    }
    item.attackAttributes = normalized;
    if (!item.attributeAttack && normalized.length) item.attributeAttack = normalized[0];
  });

})();
