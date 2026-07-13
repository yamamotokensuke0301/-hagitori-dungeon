(function () {
  window.HD_DATA = window.HD_DATA || {};
  const allJobs = window.HD_DATA.jobs.map((job) => job.id);
  const bladeJobs = ["swordsman", "hunter", "archer", "spellblade", "scavenger", "handyman", "ninja"];
  const maulJobs = ["swordsman", "heavy", "researcher", "scavenger", "handyman", "priest"];
  const toolJobs = ["hunter", "archer", "researcher", "mage", "spellblade", "tourist", "psychic", "scavenger", "handyman", "priest", "ninja", "flower_tamer", "capoeirista"];
  const coatJobs = allJobs;
  const greavesJobs = ["swordsman", "heavy", "spellblade", "scavenger", "handyman", "ninja", "capoeirista"];
  const bootsJobs = ["hunter", "archer", "researcher", "mage", "spellblade", "tourist", "psychic", "handyman", "priest", "ninja", "flower_tamer", "capoeirista"];

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
    { id: "slimeborn", name: "晶粘", material: "slime_gel", sub: "slime_crystal", super: "slime_super", ultra: "slime_ultra", attribute: "acid", resistance: "blunt" },
    { id: "verminborn", name: "王牙獣", material: "vermin_hide", sub: "vermin_fang", super: "vermin_super", ultra: "vermin_ultra", attribute: "slash", resistance: "poison" },
    { id: "insectborn", name: "節核蟲", material: "insect_shell", sub: "insect_core", super: "insect_super", ultra: "insect_ultra", attribute: "steel", resistance: "slash" },
    { id: "wingborn", name: "風翼", material: "winged_feather", sub: "winged_pinion", super: "winged_super", ultra: "winged_ultra", attribute: "wind", resistance: "wind" },
    { id: "scaleborn", name: "竜芽鱗", material: "reptile_scale", sub: "reptile_heart", super: "reptile_super", ultra: "reptile_ultra", attribute: "fire", resistance: "fire" },
    { id: "spiritborn", name: "凝魂", material: "spirit_ectoplasm", sub: "spirit_gem", super: "spirit_super", ultra: "spirit_ultra", attribute: "curse", resistance: "illusion" },
    { id: "constructborn", name: "動力造魔", material: "construct_scrap", sub: "construct_core", super: "construct_super", ultra: "construct_ultra", attribute: "steel", resistance: "steel" },
    { id: "plantborn", name: "千年妖樹", material: "plant_fiber", sub: "plant_seed", super: "plant_super", ultra: "plant_ultra", attribute: "earth", resistance: "poison" },
    { id: "fiendborn", name: "黒血魔侯", material: "fiend_horn", sub: "fiend_blood", super: "fiend_super", ultra: "fiend_ultra", attribute: "dark", resistance: "curse" },
    { id: "giantborn", name: "巨神髄", material: "giant_bone", sub: "giant_marrow", super: "giant_super", ultra: "giant_ultra", attribute: "blunt", resistance: "earth" },
    { id: "aberrantborn", name: "異界観測", material: "aberrant_tissue", sub: "aberrant_eye", super: "aberration_super", ultra: "aberration_ultra", attribute: "illusion", resistance: "dark" },
    { id: "warriorborn", name: "歴戦芯金", material: "warrior_badge", sub: "warrior_relic", super: "warrior_super", ultra: "warrior_ultra", attribute: "slash", resistance: "steel" },
    { id: "elfborn", name: "古樹王", material: "elf_thread", sub: "elf_dewdrop", super: "elf_super", ultra: "elf_ultra", attribute: "wind", resistance: "light" },
    { id: "dragonborn", name: "始祖竜", material: "dragon_scale", sub: "dragon_heart", super: "dragon_super", ultra: "dragon_ultra", attribute: "fire", resistance: "steel" },
    { id: "demonborn", name: "魔王契約", material: "demon_horn", sub: "demon_seal", super: "demon_super", ultra: "demon_ultra", attribute: "dark", resistance: "curse" },
    { id: "angelborn", name: "原初天使", material: "angel_feather", sub: "angel_halo", super: "angel_super", ultra: "angel_ultra", attribute: "light", resistance: "light" },
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
        rarityMaterials: theme.super ? { super: theme.super, ultra: theme.ultra } : null,
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
        rarityMaterials: theme.super ? { super: theme.super, ultra: theme.ultra } : null,
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
        rarityMaterials: theme.super ? { super: theme.super, ultra: theme.ultra } : null,
        description: `${theme.name}の力を封じた${form.name}。${window.HD_DATA.attributeLabels[theme.resistance]}への備えとなる。`,
      });
    });
  });

  const baseCatalog = window.HD_DATA.equipment.slice();
  const materials = window.HD_DATA.materials.map((material) => material.id);
  const grades = ["粗製", "普及", "良質", "精巧", "名工", "希少", "秘宝", "英雄", "神話"];
  const gradeShopMinimumFloors = [1, 1, 15, 25, 35, 45, 55, 70, 85];
  const resistanceAttributes = window.HD_DATA.attributes.filter((id) => !["slash", "blunt"].includes(id));
  const equipmentEpithets = [
    "薄明", "宵闇", "明星", "流雲", "遠雷", "白雨", "霜月", "烈日", "深緑", "蒼波", "紅蓮",
    "銀砂", "黒鉄", "紫電", "金風", "青嵐", "幽谷", "天穹", "地脈", "星屑", "月影",
  ];
  const equipmentDeeds = [
    "拓く", "駆ける", "断つ", "砕く", "守る", "鎮める", "穿つ", "照らす", "招く", "越える",
    "隠す", "結ぶ", "祓う", "纏う", "奏でる", "映す", "巡る",
  ];
  function seriesEquipmentName(base, baseIndex, gradeIndex) {
    const epithet = equipmentEpithets[(baseIndex + gradeIndex * 5) % equipmentEpithets.length];
    const deed = equipmentDeeds[(baseIndex * 3 + gradeIndex * 7) % equipmentDeeds.length];
    const names = [
      `継ぎ接ぎの${base.name}「${epithet}」`,
      `${epithet}印の${base.name}`,
      `${epithet}を${deed}${base.name}`,
      `工房銘・${epithet}の${base.name}`,
      `名匠${epithet}の${base.name}`,
      `秘境${epithet}より来たる${base.name}`,
      `遺宝「${epithet}・${deed}${base.name}」`,
      `英雄装・${epithet}を${deed}${base.name}`,
      `神話装「${epithet}天命の${base.name}」`,
    ];
    return names[gradeIndex];
  }
  baseCatalog.forEach((base, baseIndex) => {
    grades.forEach((grade, gradeIndex) => {
      const fallbackMaterial = materials[(baseIndex + gradeIndex) % materials.length];
      const sourceRecipe = base.recipe || { [fallbackMaterial]: 1 };
      const recipe = Object.fromEntries(Object.entries(sourceRecipe).map(([id, count]) => [id, count + gradeIndex]));
      if (gradeIndex >= 6 && base.rarityMaterials?.super) recipe[base.rarityMaterials.super] = 1 + Math.floor((gradeIndex - 6) / 2);
      if (gradeIndex >= 8 && base.rarityMaterials?.ultra) recipe[base.rarityMaterials.ultra] = 1;
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
        name: seriesEquipmentName(base, baseIndex, gradeIndex),
        attack: (base.attack || 0) + Math.ceil(gradeIndex / 2),
        defense: (base.defense || 0) + Math.floor(gradeIndex / 2),
        resistances,
        acceleration: gradeIndex >= 5 && baseIndex % 4 === 0 ? 1 + Math.floor(gradeIndex / 3) : 0,
        hpRegen: gradeIndex >= 6 && baseIndex % 19 === 0 ? 1 + Math.floor((gradeIndex - 6) / 2) : 0,
        shopMinFloor: gradeShopMinimumFloors[gradeIndex],
        recipe,
        description: `${base.description} 「${equipmentEpithets[(baseIndex + gradeIndex * 5) % equipmentEpithets.length]}」の銘を持つ${grade}等級装備。`,
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

  const GUILD_REWARD_COST_MULTIPLIER = 8;
  window.HD_DATA.equipment
    .filter((item) => Number(item.guildCost || 0) > 0)
    .forEach((item) => { item.guildCost *= GUILD_REWARD_COST_MULTIPLIER; });

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
      id: "artifact_invisible_emperor_cloak", name: "王様のインビジブル外套", slot: "upper",
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
      id: "artifact_endless_alarm", name: "鳴り止まないモーニングコール", slot: "accessory",
      attack: 0, defense: 0, acceleration: 9, hpRegen: -1, attributeAttack: null, resistances: { illusion: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "joke", label: "ネタアーティファクト", guildPoints: 7, chestOnly: true },
      curse: { id: "sleepless", name: "不眠", severity: 1, penalties: { hpRegen: -2 }, description: "装備中は一瞬たりとも静かにならない。" },
      description: "針も文字盤もないのに、最悪の時機だけは正確に告げる。",
    },
    {
      id: "artifact_reversed_hero_boots", name: "左右逆のヒーローブーツ", slot: "feet",
      attack: 1, defense: 2, acceleration: -3, hpRegen: 0, attributeAttack: null, resistances: { earth: 1, wind: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "joke", label: "ネタアーティファクト", guildPoints: 8, chestOnly: true },
      description: "左右を正しく履くと動きにくく、逆に履くと少しだけ勇ましく見える。",
    },

    {
      id: "artifact_holey_bucket_helm", name: "穴だらけのバケツヘルム", slot: "upper",
      attack: 0, defense: 1, acceleration: -2, hpRegen: 0, attributeAttack: null, resistances: { water: -1, acid: -1 },
      jobs: allJobs, recipe: null, artifact: { tier: "trash", label: "ゴミアーティファクト", guildPoints: 9, chestOnly: true },
      curse: { id: "rain_collector", name: "雨集め", severity: 2, penalties: { defense: -2 }, description: "あらゆる液体が穴を通って頭へ集まる。" },
      description: "兜だと言い張る者もいるが、どう見ても底の抜けた古いバケツ。",
    },
    {
      id: "artifact_world_dulling_sword", name: "世界までスローにする鈍刀", slot: "weapon",
      attack: 3, defense: 1, acceleration: -5, hpRegen: 0, attributeAttack: "blunt", resistances: { steel: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "trash", label: "ゴミアーティファクト", guildPoints: 11, chestOnly: true },
      curse: { id: "dull_world", name: "鈍化伝染", severity: 2, penalties: { attack: -3, acceleration: -4 }, description: "刃だけでなく使い手の反応まで鈍らせる。" },
      description: "何も斬れない代わりに、叩かれた側も少し呆れる。",
    },
    {
      id: "artifact_moth_eaten_mail", name: "千穴のスイスチーズ鎧", slot: "lower",
      attack: 0, defense: 3, acceleration: -6, hpRegen: 0, attributeAttack: null, resistances: { slash: -1, poison: -1 },
      jobs: allJobs, recipe: null, artifact: { tier: "trash", label: "ゴミアーティファクト", guildPoints: 12, chestOnly: true },
      curse: { id: "phantom_moths", name: "幻虫の巣", severity: 2, penalties: { maxHp: -8 }, description: "見えない虫が内側から着用者を齧る。" },
      description: "穴を数え終わる前に、新しい穴が一つ増える鎧。",
    },
    {
      id: "artifact_expired_talisman", name: "期限切れのセーフティ札", slot: "accessory",
      attack: 0, defense: 0, acceleration: 0, hpRegen: 0, attributeAttack: null, resistances: { curse: -2, dark: -1 },
      jobs: allJobs, recipe: null, artifact: { tier: "trash", label: "ゴミアーティファクト", guildPoints: 13, chestOnly: true },
      curse: { id: "misfortune_interest", name: "厄の利息", severity: 3, penalties: { defense: -3, maxHp: -6 }, description: "防げなかった厄が利息付きで戻ってくる。" },
      description: "百年前までは有効だったらしい。更新窓口は閉鎖済み。",
    },

    {
      id: "artifact_old_guard_blade", name: "古衛士のスタンダードソード", slot: "weapon",
      attack: 11, defense: 2, acceleration: 0, hpRegen: 0, attributeAttack: "slash", resistances: { steel: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "ordinary", label: "平凡アーティファクト", guildPoints: 24, chestOnly: true },
      description: "名も残らなかった衛士が、最後まで手放さなかった堅実な剣。",
    },
    {
      id: "artifact_moon_thread_coat", name: "月糸のトラベラー外套", slot: "upper",
      attack: 0, defense: 8, acceleration: 3, hpRegen: 1, attributeAttack: null, resistances: { dark: 2, ice: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "ordinary", label: "平凡アーティファクト", guildPoints: 27, chestOnly: true },
      curse: { id: "homesick_moon", name: "月郷病", severity: 1, penalties: { acceleration: -2 }, description: "月の見えない場所では足取りが少し重くなる。" },
      description: "月明かりを撚った糸で織られた、丈夫で軽い外套。",
    },
    {
      id: "artifact_three_color_charm", name: "トリコロール守りの石", slot: "accessory",
      attack: 1, defense: 2, acceleration: 1, hpRegen: 0, attributeAttack: null, resistances: { fire: 2, water: 2, thunder: 2 },
      jobs: allJobs, recipe: null, artifact: { tier: "ordinary", label: "平凡アーティファクト", guildPoints: 30, chestOnly: true },
      description: "三つの基本属性を無難に受け止める、実直な護り石。",
    },
    {
      id: "artifact_patient_greaves", name: "百里ウォーカーの脚甲", slot: "lower",
      attack: 0, defense: 9, acceleration: 4, hpRegen: 1, attributeAttack: null, resistances: { earth: 2, blunt: 1 },
      jobs: allJobs, recipe: null, artifact: { tier: "ordinary", label: "平凡アーティファクト", guildPoints: 32, chestOnly: true },
      curse: { id: "never_rest", name: "休息拒絶", severity: 1, penalties: { hpRegen: -1 }, description: "立ち止まると脚甲が小刻みに歩き出す。" },
      description: "派手さはないが、長い探索で疲れを感じにくい脚甲。",
    },

    {
      id: "artifact_steam_twinblade", name: "蒸界のデュアルブレード", slot: "weapon",
      attack: 24, defense: 3, acceleration: 8, hpRegen: 0, attributeAttack: "fire", attackAttributes: ["fire", "water"], resistances: { fire: 3, water: 3 },
      jobs: allJobs, recipe: null, artifact: { tier: "useful", label: "使えるアーティファクト", guildPoints: 58, chestOnly: true },
      curse: { id: "boiling_blood", name: "沸血", severity: 2, penalties: { maxHp: -10 }, description: "火と水が交わるたび、使い手の血も熱を帯びる。" },
      description: "火と水の刃を同時に保ち、敵の耐性へ柔軟に食い込む名剣。",
    },
    {
      id: "artifact_shadow_step_boots", name: "シャドウステップの長靴", slot: "feet",
      attack: 2, defense: 7, acceleration: 22, hpRegen: 0, attributeAttack: null, resistances: { dark: 4, illusion: 2, light: -1 },
      jobs: allJobs, recipe: null, artifact: { tier: "useful", label: "使えるアーティファクト", guildPoints: 66, chestOnly: true },
      curse: { id: "light_shyness", name: "光嫌い", severity: 2, penalties: { defense: -4 }, description: "強い光の下で影が使い手を置き去りにする。" },
      description: "足元の影を一歩先へ伸ばし、着用者をそこまで運ぶ長靴。",
    },
    {
      id: "artifact_survivor_ring", name: "ナインライヴズの指輪", slot: "accessory",
      attack: 3, defense: 8, acceleration: 5, hpRegen: 5, attributeAttack: null, resistances: { poison: 3, curse: 3, acid: 3 },
      jobs: allJobs, recipe: null, artifact: { tier: "useful", label: "使えるアーティファクト", guildPoints: 74, chestOnly: true },
      curse: { id: "tenth_death", name: "十度目の死", severity: 2, penalties: { maxHp: -12 }, description: "九度救う代わりに、十度目を待ち続ける。" },
      description: "致命傷へ温かな脈動を送り、生還の可能性を拾い上げる指輪。",
    },
    {
      id: "artifact_omnivision_mask", name: "万路のオムニサイト", slot: "upper",
      attack: 4, defense: 12, acceleration: 6, hpRegen: 2, attributeAttack: null, resistances: { illusion: 4, dark: 3, light: 2 }, trueSight: true,
      jobs: allJobs, recipe: null, artifact: { tier: "useful", label: "使えるアーティファクト", guildPoints: 82, chestOnly: true },
      description: "視界に入らない通路まで残響で描き、透明な気配を暴く仮面。",
    },

    {
      id: "artifact_genesis_trinity", name: "ジェネシス三極杖", slot: "weapon",
      attack: 58, defense: 10, acceleration: 18, hpRegen: 6, attributeAttack: "light", attackAttributes: ["light", "dark", "curse"], resistances: { light: 5, dark: 5, curse: 4 }, trueSight: true,
      jobs: allJobs, recipe: null, artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 190, chestOnly: true },
      curse: { id: "creation_tax", name: "創世の代価", severity: 4, penalties: { maxHp: -25, hpRegen: -3 }, description: "三つの極を振るうたび、使い手の存在が少しずつ削れる。" },
      description: "光・闇・呪いの三極を一つの術式へ束ねる、法則外の魔杖。",
    },
    {
      id: "artifact_time_thief_boots", name: "クロノシーフの神速靴", slot: "feet",
      attack: 5, defense: 12, acceleration: 48, hpRegen: 3, attributeAttack: null, resistances: { thunder: 4, wind: 5, illusion: 3 },
      jobs: allJobs, recipe: null, artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 215, chestOnly: true },
      curse: { id: "borrowed_lifetime", name: "寿命前借り", severity: 5, penalties: { maxHp: -35 }, description: "得た時間はすべて未来の自分から盗まれている。" },
      description: "次の瞬間を奪い、誰より早く行動を終えてしまう禁足具。",
    },
    {
      id: "artifact_undying_world_mail", name: "イモータル・バイオメイル", slot: "upper",
      attack: 8, defense: 58, acceleration: -12, hpRegen: 14, attributeAttack: null, resistances: { slash: 5, blunt: 5, poison: "immune", acid: 4 },
      jobs: allJobs, recipe: null, artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 245, chestOnly: true },
      curse: { id: "living_prison", name: "生きた牢獄", severity: 4, penalties: { acceleration: -18 }, description: "鎧は着用者を守るほど、決して外へ出したくなくなる。" },
      description: "傷つくそばから世界の肉を継ぎ足し、形を取り戻す生体鎧。",
    },
    {
      id: "artifact_zero_crown", name: "ゼロ・バウンダリー王冠", slot: "accessory",
      attack: 25, defense: 25, acceleration: 25, hpRegen: 8, attributeAttack: null,
      resistances: Object.fromEntries(window.HD_DATA.attributes.map((id) => [id, id === "curse" ? "immune" : 4])), trueSight: true,
      jobs: allJobs, recipe: null, artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 300, chestOnly: true },
      curse: { id: "zero_identity", name: "存在零化", severity: 5, penalties: { attack: -18, defense: -18, maxHp: -40 }, description: "王冠はあらゆる力と共に、着用者の輪郭まで零へ近づける。" },
      description: "全属性を拒む零の境界を、着用者の周囲へ常時展開する王冠。",
    }
  );

  window.HD_DATA.equipment.push({
    id: "artifact_power_pole", name: "如意棒", slot: "weapon",
    attack: 42, defense: 8, acceleration: 12, hpRegen: 2, attributeAttack: "blunt", attackAttributes: ["blunt", "steel"],
    resistances: { blunt: 4, steel: 4, earth: 3 }, jobs: allJobs, recipe: null,
    artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 260, chestOnly: true },
    description: "意志に応じて長さと重さを変える伝説の棒。名が「孫悟空」の者に握られた時だけ、測定不能の真価を解放する。",
  });

  // 既存の一点物を残したまま、各段階を三倍へ拡張する固定アーティファクト群。
  const artifactTierLabels = Object.freeze({
    joke: "ネタアーティファクト",
    trash: "ゴミアーティファクト",
    ordinary: "平凡アーティファクト",
    useful: "使えるアーティファクト",
    cheat: "チートレベルのアーティファクト",
  });
  const expandedArtifactSpecs = [
    // ネタアーティファクト：利点は小さく、使い方より逸話が先に立つ。
    {
      id: "artifact_applauding_gauntlet", name: "オート拍手の篭手", tier: "joke", gp: 5, slot: "accessory",
      attack: 0, defense: 1, acceleration: 2, hpRegen: 0, attributeAttack: null, resistances: { steel: 1 },
      curse: { name: "喝采強要", severity: 1, penalties: { attack: -2 }, description: "戦うべき時にも篭手が勝手に拍手を始める。" },
      description: "誰の武勲かを問わず、危険な場面ほど盛大な拍手を送る篭手。",
    },
    {
      id: "artifact_backward_compass", name: "リターン専門コンパス", tier: "joke", gp: 6, slot: "accessory",
      attack: 0, defense: 0, acceleration: 3, hpRegen: 0, attributeAttack: null, resistances: { illusion: 1 },
      curse: { name: "未練針", severity: 1, penalties: { acceleration: -2 }, description: "進もうとするたび、針が帰還を強く勧めてくる。" },
      description: "目的地には沈黙し、帰り道だけは得意げに示す羅針盤。",
    },
    {
      id: "artifact_bottomless_lunchbox", name: "底なしランチボックス", tier: "joke", gp: 6, slot: "accessory",
      attack: 0, defense: 1, acceleration: 0, hpRegen: 2, attributeAttack: null, resistances: { poison: 1 },
      curse: { name: "空腹保存", severity: 1, penalties: { maxHp: -5 }, description: "食べ物ではなく、持ち主の満腹感だけをしまい込む。" },
      description: "蓋を開けるたび湯気は立つが、肝心の中身だけが見つからない。",
    },
    {
      id: "artifact_overconfident_cape", name: "先走る英雄マント", tier: "joke", gp: 7, slot: "upper",
      attack: 1, defense: 2, acceleration: 8, hpRegen: 0, attributeAttack: null, resistances: { wind: 1 },
      curse: { name: "見切り発車", severity: 1, penalties: { defense: -4 }, description: "危険を確かめる前にマントだけが勇ましく翻る。" },
      description: "着用者より半歩早く角を曲がり、勝手に決め姿勢を取るマント。",
    },
    {
      id: "artifact_squeaky_sabaton", name: "スクリーム・サバトン", tier: "joke", gp: 7, slot: "feet",
      attack: 0, defense: 3, acceleration: -1, hpRegen: 0, attributeAttack: null, resistances: { steel: 1, illusion: 1 },
      curse: { name: "足音絶叫", severity: 1, penalties: { acceleration: -3 }, description: "一歩ごとに迷宮中へ響く甲高い悲鳴を上げる。" },
      description: "蝶番へ油を差すと、今度は別の音程で鳴き始める鉄靴。",
    },
    {
      id: "artifact_rainmaking_umbrella", name: "インドア・レインメーカー", tier: "joke", gp: 8, slot: "weapon",
      attack: 2, defense: 1, acceleration: 1, hpRegen: 0, attributeAttack: "water", attackAttributes: ["water", "wind"], resistances: { water: 1 },
      curse: { name: "局地豪雨", severity: 1, penalties: { defense: -2 }, description: "傘の内側だけへ冷たい雨を降らせ続ける。" },
      description: "晴天にも洞窟にも雨雲を連れてくる、用途の逆転した古傘。",
    },
    {
      id: "artifact_echoing_purse", name: "コインカウンター財布", tier: "joke", gp: 8, slot: "accessory",
      attack: 0, defense: 0, acceleration: 1, hpRegen: 0, attributeAttack: null, resistances: { curse: 1 },
      curse: { name: "残高朗読", severity: 1, penalties: { maxHp: -3 }, description: "所持金が変わるたび、財布が大声で残高を読み上げる。" },
      description: "中身が空でも一枚ずつ数える音だけは律儀に続く財布。",
    },
    {
      id: "artifact_misplaced_doorplate", name: "迷宮主のネームプレート", tier: "joke", gp: 9, slot: "accessory",
      attack: 0, defense: 2, acceleration: 0, hpRegen: 0, attributeAttack: null, resistances: { dark: 1, earth: 1 },
      description: "どの扉へ掛けても『留守』とだけ表示される、迷宮主の古い表札。",
    },

    // ゴミアーティファクト：弱い基礎性能を強い欠点がさらに押し下げる。
    {
      id: "artifact_cracked_mirror_shield", name: "百裂スモークミラー", tier: "trash", gp: 10, slot: "upper",
      attack: 0, defense: 2, acceleration: -1, hpRegen: 0, attributeAttack: null, resistances: { illusion: 2, light: -2 },
      curse: { name: "破像反射", severity: 2, penalties: { defense: -4 }, description: "映った傷を持ち主の身体へ丁寧に写し取る。" },
      description: "盾としても鏡としても割れすぎている、重い曇り板。",
    },
    {
      id: "artifact_rusted_anchor_blade", name: "錆海のアンカーブレード", tier: "trash", gp: 11, slot: "weapon",
      attack: 6, defense: 2, acceleration: -10, hpRegen: 0, attributeAttack: "blunt", attackAttributes: ["blunt", "steel"], resistances: { steel: 1 },
      curse: { name: "海底固着", severity: 3, penalties: { attack: -4, acceleration: -5 }, description: "振るうたび見えない海底へ錨を下ろしてしまう。" },
      description: "剣に削り直そうとして諦められた、赤錆だらけの小錨。",
    },
    {
      id: "artifact_leaking_mana_boots", name: "マナ漏れのロングブーツ", tier: "trash", gp: 12, slot: "feet",
      attack: 0, defense: 2, acceleration: 4, hpRegen: -1, attributeAttack: null, resistances: { curse: -2, illusion: 1 },
      curse: { name: "術漏れ", severity: 2, penalties: { maxHp: -8 }, description: "歩いた跡へ持ち主の生命力まで染み出していく。" },
      description: "底の穴から淡い魔力が漏れ、足跡だけは美しく光る長靴。",
    },
    {
      id: "artifact_hollow_bone_mail", name: "ホロウボーンの鎧", tier: "trash", gp: 13, slot: "lower",
      attack: 0, defense: 5, acceleration: -7, hpRegen: 0, attributeAttack: null, resistances: { slash: -1, blunt: -1 },
      curse: { name: "骨鳴り", severity: 2, penalties: { defense: -5 }, description: "衝撃を受ける前から骨が砕ける音を響かせる。" },
      description: "軽量化のため中身を抜きすぎ、支えまで失った骨鎧。",
    },
    {
      id: "artifact_ash_eating_ring", name: "灰喰らいの指輪", tier: "trash", gp: 14, slot: "accessory",
      attack: 1, defense: 0, acceleration: 0, hpRegen: -1, attributeAttack: null, resistances: { fire: 2, water: -1 },
      curse: { name: "燃え残り", severity: 2, penalties: { hpRegen: -2 }, description: "傷口を灰へ変えてから、ゆっくり食べ始める。" },
      description: "焚き火の灰だけを好み、指まで煤色へ染める指輪。",
    },
    {
      id: "artifact_broken_oath_badge", name: "折れた誓約章", tier: "trash", gp: 15, slot: "accessory",
      attack: 0, defense: 1, acceleration: 0, hpRegen: 0, attributeAttack: null, resistances: { light: 1, curse: -2 },
      curse: { name: "違約徴収", severity: 3, penalties: { attack: -3, defense: -3 }, description: "持ち主が知らない古い誓いの違約金を徴収する。" },
      description: "誰の何の誓いだったか判別できない、真二つの徽章。",
    },
    {
      id: "artifact_sinking_cloak", name: "沈み続ける外套", tier: "trash", gp: 16, slot: "upper",
      attack: 0, defense: 4, acceleration: -8, hpRegen: 0, attributeAttack: null, resistances: { water: 1, wind: -2 },
      curse: { name: "深度加算", severity: 3, penalties: { maxHp: -12 }, description: "乾いた場所でも着用者を深海の水圧で締め付ける。" },
      description: "水を吸っていない時さえ、海底へ沈む重さを保つ外套。",
    },
    {
      id: "artifact_chipped_executioner_axe", name: "刃欠け処刑斧", tier: "trash", gp: 17, slot: "weapon",
      attack: 8, defense: 0, acceleration: -6, hpRegen: 0, attributeAttack: "blunt", attackAttributes: ["blunt", "slash"], resistances: {},
      curse: { name: "未完執行", severity: 3, penalties: { attack: -5, maxHp: -6 }, description: "斬り損ねた一撃の痛みを使い手へ返し続ける。" },
      description: "刃の大半を失い、処刑台より薪割り場が似合う大斧。",
    },

    // 平凡アーティファクト：癖は残るが、通常装備として十分に扱える。
    {
      id: "artifact_dawn_patrol_spear", name: "暁巡回の長槍", tier: "ordinary", gp: 23, slot: "weapon",
      attack: 13, defense: 2, acceleration: 2, hpRegen: 0, attributeAttack: "slash", attackAttributes: ["slash", "light"], resistances: { light: 2, steel: 1 },
      curse: { name: "夜明け待ち", severity: 1, penalties: { acceleration: -2 }, description: "日の差さない場所では穂先が眠たげに重くなる。" },
      description: "城壁を巡った無名衛士の手入れが今も残る、長柄の槍。",
    },
    {
      id: "artifact_riverstone_mail", name: "流紋石の胴衣", tier: "ordinary", gp: 26, slot: "upper",
      attack: 0, defense: 10, acceleration: 1, hpRegen: 1, attributeAttack: null, resistances: { water: 2, blunt: 2 },
      description: "川底で丸くなった護石を連ね、衝撃を素直に受け流す胴衣。",
    },
    {
      id: "artifact_ember_keeper_boots", name: "残火守りの旅靴", tier: "ordinary", gp: 28, slot: "feet",
      attack: 0, defense: 7, acceleration: 7, hpRegen: 1, attributeAttack: null, resistances: { fire: 2, ice: 1 },
      curse: { name: "燻り足", severity: 1, penalties: { hpRegen: -1 }, description: "休むたび靴底の残火が足裏を焦がす。" },
      description: "小さな火種を絶やさず、冷えた道でも歩調を保つ旅靴。",
    },
    {
      id: "artifact_quiet_librarian_ring", name: "静謐司書の指輪", tier: "ordinary", gp: 29, slot: "accessory",
      attack: 1, defense: 3, acceleration: 2, hpRegen: 0, attributeAttack: null, resistances: { illusion: 3, dark: 2 },
      curse: { name: "私語厳禁", severity: 1, penalties: { attack: -2 }, description: "荒々しい動きをするたび、見えない司書に制止される。" },
      description: "騒がしい幻惑を静め、思考へ図書館の静寂をもたらす指輪。",
    },
    {
      id: "artifact_iron_vow_greaves", name: "鉄誓の脚甲", tier: "ordinary", gp: 33, slot: "lower",
      attack: 0, defense: 13, acceleration: -1, hpRegen: 0, attributeAttack: null, resistances: { steel: 3, slash: 2 },
      curse: { name: "不退誓約", severity: 2, penalties: { acceleration: -3 }, description: "後退を考えるだけで脚甲が地面へ食い込む。" },
      description: "一歩を守り抜くという単純な誓いだけを刻んだ頑丈な脚甲。",
    },
    {
      id: "artifact_crosswind_bow", name: "十字風の古弓", tier: "ordinary", gp: 34, slot: "weapon",
      attack: 15, defense: 0, acceleration: 5, hpRegen: 0, attributeAttack: "wind", attackAttributes: ["wind", "thunder"], resistances: { wind: 2 },
      description: "交差する二筋の風を弦へ乗せ、矢の軌道を穏やかに正す古弓。",
    },
    {
      id: "artifact_wellkeeper_charm", name: "古井戸守りの護石", tier: "ordinary", gp: 36, slot: "accessory",
      attack: 0, defense: 4, acceleration: 0, hpRegen: 2, attributeAttack: null, resistances: { water: 3, poison: 1 },
      curse: { name: "渇き番", severity: 1, penalties: { maxHp: -6 }, description: "水を守る代わりに、持ち主の喉から潤いを徴収する。" },
      description: "長く村井戸を清めてきた、素朴だが確かな守り石。",
    },
    {
      id: "artifact_sunset_scout_coat", name: "夕映え斥候外套", tier: "ordinary", gp: 38, slot: "upper",
      attack: 0, defense: 8, acceleration: 6, hpRegen: 0, attributeAttack: null, resistances: { dark: 2, wind: 2 },
      curse: { name: "薄暮迷い", severity: 1, penalties: { defense: -2 }, description: "明るすぎる場所では外套の色が着用者を浮かび上がらせる。" },
      description: "夕暮れの色へ溶け込み、斥候の足取りを軽くする外套。",
    },

    // 使えるアーティファクト：強い専門性と、呪耐性で抑えられる代償を持つ。
    {
      id: "artifact_thunderclap_halberd", name: "轟界の雷斧", tier: "useful", gp: 62, slot: "weapon",
      attack: 32, defense: 5, acceleration: 10, hpRegen: 0, attributeAttack: "thunder", attackAttributes: ["thunder", "blunt", "steel"], resistances: { thunder: 4, steel: 2 },
      curse: { name: "轟音脈", severity: 3, penalties: { maxHp: -14 }, description: "雷鳴のたび、使い手の心臓も同じ強さで打ち鳴らされる。" },
      description: "雷撃と重量を一振りへ束ね、甲殻ごと戦場を揺らす長斧。",
    },
    {
      id: "artifact_frostfire_hauberk", name: "氷炎反照鎧", tier: "useful", gp: 68, slot: "upper",
      attack: 2, defense: 18, acceleration: 5, hpRegen: 2, attributeAttack: null, resistances: { fire: 4, ice: 4, water: 2 },
      curse: { name: "熱差痙攣", severity: 3, penalties: { acceleration: -6 }, description: "氷と炎の境目で鎧が不規則に収縮する。" },
      description: "炎を氷へ、冷気を熱へ返し、相反する攻撃を受け止める鎧。",
    },
    {
      id: "artifact_voidstep_sandals", name: "虚歩の銀草履", tier: "useful", gp: 72, slot: "feet",
      attack: 3, defense: 10, acceleration: 28, hpRegen: 0, attributeAttack: null, resistances: { dark: 4, illusion: 3 },
      curse: { name: "足跡欠落", severity: 3, penalties: { maxHp: -18 }, description: "進んだ距離と共に、持ち主の存在感まで削り取る。" },
      description: "床との間へ薄い虚空を挟み、摩擦を忘れて進む銀の草履。",
    },
    {
      id: "artifact_seraphic_lens", name: "熾天観測眼", tier: "useful", gp: 78, slot: "accessory",
      attack: 6, defense: 8, acceleration: 8, hpRegen: 1, attributeAttack: null, resistances: { light: 4, illusion: 4, dark: 2 }, trueSight: true,
      description: "天上から借りた視野で、透明な気配と偽りの輪郭を見抜く単眼鏡。",
    },
    {
      id: "artifact_earthblood_greaves", name: "地脈血統の脚甲", tier: "useful", gp: 80, slot: "lower",
      attack: 2, defense: 22, acceleration: 4, hpRegen: 5, attributeAttack: null, resistances: { earth: 4, poison: 3, blunt: 2 },
      curse: { name: "根付き", severity: 3, penalties: { hpRegen: -3 }, description: "癒やすたび、脚甲の根が持ち主へ深く入り込む。" },
      description: "地脈の熱を脈動へ変え、傷を塞ぎながら足場を固める脚甲。",
    },
    {
      id: "artifact_tidal_memory_blade", name: "潮騒記憶剣", tier: "useful", gp: 84, slot: "weapon",
      attack: 29, defense: 4, acceleration: 12, hpRegen: 1, attributeAttack: "water", attackAttributes: ["water", "ice", "wind"], resistances: { water: 4, ice: 2 },
      curse: { name: "海馬侵食", severity: 3, penalties: { attack: -7 }, description: "剣が覚えた海の記憶で、使い手の集中を洗い流す。" },
      description: "寄せて返す三つの属性を刃へ宿し、耐性の隙間へ波を送る剣。",
    },
    {
      id: "artifact_phoenix_ash_mantle", name: "不死鳥灰の肩衣", tier: "useful", gp: 90, slot: "upper",
      attack: 3, defense: 15, acceleration: 10, hpRegen: 7, attributeAttack: null, resistances: { fire: 5, curse: 2, wind: 2 },
      curse: { name: "再燃代謝", severity: 3, penalties: { maxHp: -20, hpRegen: -2 }, description: "再生の火が未来の生命力まで燃料にする。" },
      description: "灰から熱を引き戻し、着用者の傷を何度でも焼き閉じる肩衣。",
    },
    {
      id: "artifact_lawbreaker_seal", name: "法則破りの封印環", tier: "useful", gp: 96, slot: "accessory",
      attack: 12, defense: 12, acceleration: 15, hpRegen: 2, attributeAttack: null, resistances: { curse: 4, steel: 4, illusion: 4 },
      curse: { name: "反則罰", severity: 3, penalties: { defense: -8 }, description: "破った法則の反動だけは、装備者へ正しく請求される。" },
      description: "局所的に迷宮の規則を緩め、攻守と行動を同時に引き上げる環。",
    },

    // チートレベル：法則外の性能と、重い呪いが同居する最上位品。
    {
      id: "artifact_starfall_greatsword", name: "星墜としの終剣", tier: "cheat", gp: 220, slot: "weapon",
      attack: 82, defense: 14, acceleration: 20, hpRegen: 5, attributeAttack: "light", attackAttributes: ["light", "dark", "slash"], resistances: { light: 5, dark: 5, steel: 4 },
      curse: { name: "落星余波", severity: 5, penalties: { attack: -12, maxHp: -35 }, description: "振り下ろすたび、使い手も星の落下へ巻き込まれる。" },
      description: "夜空の終端を刃へ鍛え、光と闇ごと敵を地へ墜とす大剣。",
    },
    {
      id: "artifact_worldroot_armor", name: "世界樹根の神鎧", tier: "cheat", gp: 250, slot: "upper",
      attack: 10, defense: 72, acceleration: -8, hpRegen: 18, attributeAttack: null, resistances: { earth: 5, poison: "immune", acid: 5, blunt: 4 },
      curse: { name: "大地定着", severity: 5, penalties: { acceleration: -22 }, description: "世界へ根を張るほど、装備者は一歩を失っていく。" },
      description: "世界樹の根が攻撃を受けるたび成長し、破損を即座に塞ぐ神鎧。",
    },
    {
      id: "artifact_infinite_horizon_boots", name: "無限地平の超越靴", tier: "cheat", gp: 275, slot: "feet",
      attack: 8, defense: 18, acceleration: 65, hpRegen: 4, attributeAttack: null, resistances: { wind: "immune", thunder: 5, illusion: 5 },
      curse: { name: "距離喪失", severity: 5, penalties: { maxHp: -45 }, description: "移動した距離の一部を、使い手の寿命で精算する。" },
      description: "一歩の終点を地平線の先へ置き、時間より早く到達する靴。",
    },
    {
      id: "artifact_sunmoon_orbit", name: "日月双環", tier: "cheat", gp: 310, slot: "accessory",
      attack: 35, defense: 35, acceleration: 30, hpRegen: 10, attributeAttack: null, resistances: { light: 5, dark: 5, fire: 4, ice: 4 }, trueSight: true,
      curse: { name: "蝕の均衡", severity: 5, penalties: { attack: -20, defense: -20 }, description: "日月が重なるたび、持ち主の力も互いに打ち消し合う。" },
      description: "太陽と月を小さな軌道へ閉じ込め、昼夜の加護を同時に巡らせる双環。",
    },
    {
      id: "artifact_abyssal_decree", name: "深淵勅令の黒杖", tier: "cheat", gp: 285, slot: "weapon",
      attack: 75, defense: 18, acceleration: 24, hpRegen: 8, attributeAttack: "dark", attackAttributes: ["dark", "curse", "illusion"], resistances: { dark: "immune", curse: 5, illusion: 5 }, trueSight: true,
      curse: { name: "深淵徴用", severity: 5, penalties: { maxHp: -30, hpRegen: -5 }, description: "深淵の力を借りるたび、持ち主の一部が徴用される。" },
      description: "深淵へ命令を届かせ、闇と呪いと幻を一つの奔流にする黒杖。",
    },
    {
      id: "artifact_heavenly_fortress", name: "天蓋絶対城塞", tier: "cheat", gp: 330, slot: "lower",
      attack: 5, defense: 88, acceleration: -18, hpRegen: 20, attributeAttack: null, resistances: { slash: "immune", blunt: "immune", steel: 5, earth: 5 },
      curse: { name: "籠城命令", severity: 5, penalties: { acceleration: -25 }, description: "城塞は生存を優先し、装備者の移動許可をほとんど出さない。" },
      description: "腰から下へ小型城塞を展開し、物理攻撃を国境の外で止める脚鎧。",
    },
    {
      id: "artifact_eternal_return_ring", name: "永劫回帰の指輪", tier: "cheat", gp: 340, slot: "accessory",
      attack: 28, defense: 28, acceleration: 28, hpRegen: 16, attributeAttack: null, resistances: { poison: "immune", acid: 5, curse: 5, dark: 4 },
      curse: { name: "回帰摩耗", severity: 5, penalties: { maxHp: -50 }, description: "傷を戻すたび、戻せない生命の器だけが摩耗する。" },
      description: "身体を傷つく直前へ巻き戻し続ける、終わりを拒む指輪。",
    },
    {
      id: "artifact_prismatic_sovereign", name: "万色統治の王衣", tier: "cheat", gp: 360, slot: "upper",
      attack: 25, defense: 48, acceleration: 22, hpRegen: 12, attributeAttack: null,
      resistances: Object.fromEntries(window.HD_DATA.attributes.map((id) => [id, id === "curse" ? 5 : 4])), trueSight: true,
      curse: { name: "色彩収奪", severity: 5, penalties: { attack: -25, maxHp: -40 }, description: "全ての色を支配するため、着用者自身の色まで奪い取る。" },
      description: "あらゆる属性を臣下として従え、攻撃を四色の壁で受け止める王衣。",
    },
    {
      id: "artifact_causality_scissors", name: "因果断ちの双鋏", tier: "cheat", gp: 350, slot: "weapon",
      attack: 95, defense: 12, acceleration: 32, hpRegen: 6, attributeAttack: "slash", attackAttributes: ["slash", "illusion", "curse"], resistances: { steel: 5, illusion: "immune", curse: 4 },
      curse: { name: "因果逆流", severity: 5, penalties: { defense: -20, hpRegen: -6 }, description: "切断した因果の反対側が、使い手へ繋ぎ直される。" },
      description: "結果へ至る途中を切り落とし、斬撃だけを敵の現在へ残す双鋏。",
    },
    {
      id: "artifact_first_light_crown", name: "原初光の戴冠", tier: "cheat", gp: 380, slot: "accessory",
      attack: 45, defense: 45, acceleration: 40, hpRegen: 15, attributeAttack: null,
      resistances: Object.fromEntries(window.HD_DATA.attributes.map((id) => [id, ["light", "curse"].includes(id) ? "immune" : 3])), trueSight: true,
      description: "世界最初の光を王冠へ留め、攻守・再生・視界の全てを限界外へ導く。",
    },
  ];
  window.HD_DATA.equipment.push(...expandedArtifactSpecs.map((spec) => {
    const { tier, gp, curse, ...item } = spec;
    return {
      ...item,
      jobs: allJobs,
      recipe: null,
      artifact: { tier, label: artifactTierLabels[tier], guildPoints: gp, chestOnly: true },
      ...(curse ? { curse: { id: `curse_${item.id}`, ...curse } } : {}),
    };
  }));

  // 固定アーティファクトは、負耐性装備を組み上げる際の強力な接続部品になる。
  // 平凡品は複数耐性、使える品は一免疫、チート品は二免疫と全体耐性を提供する。
  const fixedArtifactSupport = window.HD_DATA.equipment.filter((item) => item.artifact?.chestOnly);
  fixedArtifactSupport.forEach((item, index) => {
    const tier = item.artifact.tier;
    if (!["ordinary", "useful", "cheat"].includes(tier)) return;
    item.resistances = item.resistances || {};
    const primary = window.HD_DATA.attributes[(index * 3 + 1) % window.HD_DATA.attributes.length];
    const secondary = window.HD_DATA.attributes[(index * 7 + 5) % window.HD_DATA.attributes.length];
    const tertiary = window.HD_DATA.attributes[(index * 11 + 9) % window.HD_DATA.attributes.length];
    if (tier === "ordinary") {
      [primary, secondary, tertiary].forEach((attribute) => {
        if (item.resistances[attribute] !== "immune") item.resistances[attribute] = Math.max(2, Number(item.resistances[attribute] || 0));
      });
      item.attributePuzzleSupport = { tier: 1, immunities: [] };
      item.description = `${item.description} 三属性耐性2以上を繋ぎ、負耐性を相殺しやすくする。`;
      return;
    }
    if (tier === "useful") {
      item.resistances[primary] = "immune";
      [secondary, tertiary].forEach((attribute) => {
        if (item.resistances[attribute] !== "immune") item.resistances[attribute] = Math.max(3, Number(item.resistances[attribute] || 0));
      });
      item.attributePuzzleSupport = { tier: 2, immunities: [primary] };
      item.description = `${item.description} ${window.HD_DATA.attributeLabels[primary]}免疫が他装備の負耐性を完全に塞ぎ、二属性耐性3が残る穴を補う。`;
      return;
    }
    window.HD_DATA.attributes.forEach((attribute) => {
      if (item.resistances[attribute] !== "immune") item.resistances[attribute] = Math.max(2, Number(item.resistances[attribute] || 0));
    });
    item.resistances[primary] = "immune";
    item.resistances[secondary] = "immune";
    item.attributePuzzleSupport = { tier: 3, immunities: [primary, secondary] };
    item.description = `${item.description} 全属性耐性2を下地に、${window.HD_DATA.attributeLabels[primary]}・${window.HD_DATA.attributeLabels[secondary]}免疫で二つの致命的弱点を同時に消す。`;
  });
  fixedArtifactSupport.filter((item) => ["useful", "cheat"].includes(item.artifact.tier)).forEach((item, index) => {
    const coverage = window.HD_DATA.attributes[index % window.HD_DATA.attributes.length];
    if (item.resistances[coverage] === "immune") return;
    item.resistances[coverage] = "immune";
    item.attributePuzzleSupport.immunities.push(coverage);
    item.description = `${item.description} 属性接続：${window.HD_DATA.attributeLabels[coverage]}免疫。`;
  });

  // 防御力を完全に捨て、多数の属性免疫だけを残した宝箱限定の艶装備。
  // 通常の固定アーティファクト補正を通さず、非免疫属性には無防備という弱点を保つ。
  window.HD_DATA.equipment.push(
    {
      id: "artifact_outrageous_bikini_top", name: "やばすぎるビキニ上", slot: "upper",
      attack: 0, defense: 0, acceleration: 0, hpRegen: 0, attributeAttack: null,
      resistances: { light: "immune", fire: "immune", water: "immune", poison: "immune", curse: "immune", illusion: "immune" },
      jobs: allJobs, recipe: null, risque: true, rousesDungeon: true,
      artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 320, chestOnly: true },
      description: "守っている面積はほぼない。それでも光・火・水・毒・呪・幻だけはなぜか完全に通さない。特殊効果でダンジョン中のモンスターが全て目を覚ます。",
    },
    {
      id: "artifact_outrageous_bikini_bottom", name: "やばすぎるビキニ下", slot: "lower",
      attack: 0, defense: 0, acceleration: 0, hpRegen: 0, attributeAttack: null,
      resistances: { dark: "immune", earth: "immune", wind: "immune", thunder: "immune", ice: "immune", acid: "immune" },
      jobs: allJobs, recipe: null, risque: true, rousesDungeon: true,
      artifact: { tier: "cheat", label: "チートレベルのアーティファクト", guildPoints: 320, chestOnly: true },
      description: "防御力を置き忘れた下半身装備。闇・土・風・雷・凍・酸だけはきっぱり拒絶する。特殊効果でダンジョン中のモンスターが全て目を覚ます。",
    },
  );

  // 「すけべ」の性格と共鳴する艶装備。通常の装備性能は他の性格でもそのまま使える。
  const risqueEquipmentIds = new Set([
    "artifact_invisible_emperor_cloak", "artifact_moon_thread_coat", "artifact_shadow_step_boots",
    "guild_wind_coat", "guild_prize_21", "guild_prize_23", "guild_prize_27",
  ]);
  window.HD_DATA.equipment.forEach((item) => {
    if (risqueEquipmentIds.has(item.id)) item.risque = true;
  });

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

  // 素材装備は同じ数値の色違いにせず、素材系統を小さな実戦上の癖として残す。
  // 鎚は素材耐性、装飾品は副攻撃属性、防具は重量差を持ち、完全重複を抑える。
  const themeIndexById = Object.fromEntries(themes.map((theme, index) => [theme.id, index]));
  const themeById = Object.fromEntries(themes.map((theme) => [theme.id, theme]));
  window.HD_DATA.equipment.forEach((item) => {
    const baseId = item.id.replace(/^series_\d+_/, "");
    const match = /^crafted_(.+)_(blade|maul|tool|coat|greaves|boots|pendant|ring|talisman)$/.exec(baseId);
    if (!match) return;
    const [, themeId, form] = match;
    const theme = themeById[themeId];
    const themeIndex = themeIndexById[themeId];
    if (!theme || !Number.isFinite(themeIndex)) return;
    if (form === "maul") {
      const current = item.resistances[theme.resistance];
      if (current !== "immune") item.resistances[theme.resistance] = Math.max(Number(current || 0), 1 + (themeIndex % 3 === 0 ? 1 : 0));
      if (themeIndex % 5 === 1) item.acceleration = Number(item.acceleration || 0) + 1;
    } else if (["pendant", "ring", "talisman"].includes(form)) {
      if (!item.attackAttributes.includes(theme.attribute)) item.attackAttributes.push(theme.attribute);
      if (!item.attributeAttack) item.attributeAttack = theme.attribute;
      if (themeIndex % 7 === 2) item.hpRegen = Number(item.hpRegen || 0) + 1;
    } else if (["coat", "greaves", "boots"].includes(form)) {
      const weightAccent = themeIndex % 4;
      if (weightAccent === 0) item.defense = Number(item.defense || 0) + 1;
      if (weightAccent === 1) item.acceleration = Number(item.acceleration || 0) + 1;
      if (weightAccent === 2) item.hpRegen = Number(item.hpRegen || 0) + 1;
    }
  });

  // 粗製系列は基礎品の複製にせず、重い代わりに一属性へ強い荒削り装備とする。
  window.HD_DATA.equipment.forEach((item, index) => {
    if (!item.id.startsWith("series_1_")) return;
    const roughWard = attackAttributePool[(index * 7 + item.id.length * 3) % attackAttributePool.length];
    const current = item.resistances[roughWard];
    if (current !== "immune") item.resistances[roughWard] = Math.max(Number(current || 0), 1);
    item.acceleration = Number(item.acceleration || 0) - 1;
    item.description = `${item.description} 粗い補強材で重いが、${window.HD_DATA.attributeLabels[roughWard]}への備えになる。`;
  });

  // 普及品以上の生成系列には、大きな長所と短所を併せ持つ原型を与える。
  // 同じ等級でも「何を伸ばし、何を捨てるか」が変わり、装備交換で戦法が変化する。
  const equipmentArchetypes = [
    { id: "assault", name: "猛攻型", apply(item, grade) { item.attack += Math.ceil(grade * 0.9); item.defense -= Math.ceil(grade * 0.4); }, text: "攻撃を大きく伸ばす代わりに防御を削る" },
    { id: "bulwark", name: "城塞型", apply(item, grade) { item.defense += Math.ceil(grade * 0.85); item.acceleration -= Math.ceil(grade * 0.75); }, text: "重防御と引き換えに加速度を失う" },
    { id: "gale", name: "疾風型", apply(item, grade) { item.acceleration += grade * 2; item.defense -= Math.ceil(grade * 0.55); }, text: "圧倒的な加速度と引き換えに装甲を薄くする" },
    { id: "renewal", name: "再生型", apply(item, grade) { item.hpRegen += Math.ceil(grade * 0.55); item.attack -= Math.ceil(grade * 0.55); }, text: "継戦再生と引き換えに瞬間火力を落とす" },
    { id: "prism", name: "多相型", apply(item, grade, seed) {
      const first = attackAttributePool[(seed + grade * 2) % attackAttributePool.length];
      const second = attackAttributePool[(seed * 3 + grade * 5) % attackAttributePool.length];
      [first, second].forEach((attribute) => { if (!item.attackAttributes.includes(attribute)) item.attackAttributes.push(attribute); });
      item.attack -= Math.ceil(grade * 0.3);
    }, text: "基礎火力を抑えて複数の攻撃属性を扱う" },
    { id: "reckless", name: "背水型", apply(item, grade, seed) {
      item.attack += grade;
      item.acceleration += grade;
      const vulnerable = attackAttributePool[(seed * 5 + grade) % attackAttributePool.length];
      if (item.resistances[vulnerable] !== "immune") item.resistances[vulnerable] = Math.min(Number(item.resistances[vulnerable] || 0), grade >= 6 ? -2 : -1);
    }, text: "攻撃と加速度を得る代わりに一属性が致命的な弱点になる" },
  ];
  window.HD_DATA.equipment.forEach((item, index) => {
    const gradeMatch = /^series_(\d+)_/.exec(item.id);
    const grade = gradeMatch ? Number(gradeMatch[1]) : 0;
    if (grade < 2) return;
    const seed = [...item.id].reduce((sum, character) => sum + character.codePointAt(0), index);
    const archetype = equipmentArchetypes[(seed + grade * 3) % equipmentArchetypes.length];
    item.attack = Number(item.attack || 0);
    item.defense = Number(item.defense || 0);
    item.acceleration = Number(item.acceleration || 0);
    item.hpRegen = Number(item.hpRegen || 0);
    archetype.apply(item, grade, seed);
    const weaknessCandidates = attackAttributePool.filter((attribute) => item.resistances[attribute] !== "immune");
    const weaknessEnabled = ["assault", "gale", "prism", "reckless"].includes(archetype.id) || grade >= 5;
    if (weaknessEnabled && weaknessCandidates.length) {
      const weakness = weaknessCandidates[(seed * 11 + grade * 7) % weaknessCandidates.length];
      item.resistances[weakness] = Math.min(Number(item.resistances[weakness] || 0), grade >= 7 ? -2 : -1);
      const secondWeaknessEnabled = grade >= 8 && ["prism", "reckless", "assault"].includes(archetype.id);
      if (secondWeaknessEnabled && weaknessCandidates.length > 1) {
        const remaining = weaknessCandidates.filter((attribute) => attribute !== weakness);
        const secondWeakness = remaining[(seed * 5 + grade * 13) % remaining.length];
        item.resistances[secondWeakness] = Math.min(Number(item.resistances[secondWeakness] || 0), -1);
      }
    }
    const immunityEnabled = grade >= 8 && ["bulwark", "renewal", "prism"].includes(archetype.id);
    let immunityAttribute = null;
    if (immunityEnabled) {
      const immunityCandidates = attackAttributePool.filter((attribute) => item.resistances[attribute] !== "immune" && Number(item.resistances[attribute] || 0) >= 0);
      if (immunityCandidates.length) {
        const desiredImmunity = attackAttributePool[(index + grade) % attackAttributePool.length];
        immunityAttribute = immunityCandidates.includes(desiredImmunity)
          ? desiredImmunity
          : immunityCandidates[(index + grade) % immunityCandidates.length];
        item.resistances[immunityAttribute] = "immune";
        const sacrificeCandidates = attackAttributePool.filter((attribute) => attribute !== immunityAttribute && item.resistances[attribute] !== "immune");
        if (sacrificeCandidates.length) {
          const sacrifice = sacrificeCandidates[(seed * 23 + grade * 11) % sacrificeCandidates.length];
          item.resistances[sacrifice] = Math.min(Number(item.resistances[sacrifice] || 0), -2);
        }
        item.attack -= 2;
        item.acceleration -= 3;
      }
    }
    item.equipmentArchetype = archetype.id;
    const weaknesses = Object.entries(item.resistances).filter(([, value]) => value !== "immune" && Number(value) < 0)
      .map(([attribute, value]) => `${window.HD_DATA.attributeLabels[attribute]}${value}`);
    item.description = `${item.description} ${archetype.name}：${archetype.text}。${immunityAttribute ? ` ${window.HD_DATA.attributeLabels[immunityAttribute]}免疫で他装備の弱点を完全に塞ぐ。` : ""}${weaknesses.length ? ` 弱点：${weaknesses.join("・")}。` : ""}`;
  });
  const generatedImmunityGear = window.HD_DATA.equipment.filter((item) => {
    const grade = Number(/^series_(\d+)_/.exec(item.id)?.[1] || 0);
    return grade >= 8 && ["bulwark", "renewal", "prism"].includes(item.equipmentArchetype);
  });
  generatedImmunityGear.forEach((item, index) => {
    const coverageAttribute = attackAttributePool[index % attackAttributePool.length];
    if (item.resistances[coverageAttribute] === "immune") return;
    item.resistances[coverageAttribute] = "immune";
    item.description = `${item.description} 免疫調律：${window.HD_DATA.attributeLabels[coverageAttribute]}免疫。`;
  });

  const starterBuildEquipment = [
    { id: "starter_swordsman_blade", name: "新鋭の半月剣", slot: "weapon", jobs: ["swordsman"], attack: 5, defense: 1, acceleration: 0, attributeAttack: "slash", resistances: { slash: 1 }, description: "攻防を崩さず正面戦闘を覚える戦士の支給剣。" },
    { id: "starter_hunter_knife", name: "路地裏仕込みの追剥刀", slot: "weapon", jobs: ["hunter"], attack: 3, defense: 0, acceleration: 4, attributeAttack: "slash", resistances: { poison: 1 }, description: "先手と急所狙いへ寄せた盗賊の短刀。" },
    { id: "starter_archer_bow", name: "風読みの短弓", slot: "weapon", jobs: ["archer"], attack: 4, defense: 0, acceleration: 2, attributeAttack: "wind", resistances: { wind: 1 }, description: "射線と機動力を重視する軽い短弓。" },
    { id: "starter_mage_wand", name: "火花を飼う初心杖", slot: "weapon", jobs: ["mage"], attack: 4, defense: -1, acceleration: 1, attributeAttack: "fire", resistances: { fire: 2, water: -1 }, description: "火術を強める代わりに水へ隙を作る入門杖。" },
    { id: "starter_spellblade", name: "火線刻みの魔刃", slot: "weapon", jobs: ["spellblade"], attack: 5, defense: 0, acceleration: 1, attributeAttack: "slash", attackAttributes: ["slash", "fire"], resistances: { fire: 1 }, description: "斬撃と火術を一振りへ重ねる魔法戦士の試作剣。" },
    { id: "starter_researcher_probe", name: "打診式生態測杖", slot: "weapon", jobs: ["researcher"], attack: 2, defense: 2, acceleration: 0, attributeAttack: "blunt", resistances: { illusion: 2 }, description: "殴った反響から魔物の構造を読む調査器具。" },
    { id: "starter_heavy_maul", name: "飲み代担保の鉄塊", slot: "weapon", jobs: ["heavy"], attack: 8, defense: -2, acceleration: -2, attributeAttack: "blunt", resistances: { blunt: 1 }, description: "振り切れば強い。酒場へ行くなら外す理由もある大鉄塊。" },
    { id: "starter_tourist_camera", name: "迷宮記念の箱型カメラ", slot: "weapon", jobs: ["tourist"], attack: 1, defense: 0, acceleration: 1, attributeAttack: "light", resistances: { illusion: 1 }, description: "戦闘より記録を優先した観光客の私物。" },
    { id: "starter_psychic_focus", name: "念波増幅の曲がり匙", slot: "weapon", jobs: ["psychic"], attack: 4, defense: 0, acceleration: 3, attributeAttack: "illusion", resistances: { illusion: 2, steel: -1 }, description: "精神波は増えるが金属干渉に弱い超能力媒体。" },
    { id: "starter_scavenger_gauntlet", name: "骨まで掬う貪食手甲", slot: "weapon", jobs: ["scavenger"], attack: 5, defense: 1, acceleration: 0, attributeAttack: "acid", resistances: { acid: 1, poison: 1 }, description: "倒した獲物をそのまま食らうための手甲。" },
    { id: "starter_handyman_tool", name: "七役折畳み工具", slot: "weapon", jobs: ["handyman"], attack: 3, defense: 2, acceleration: 3, attributeAttack: "blunt", resistances: { steel: 1, earth: 1 }, description: "戦闘、採取、補修を一丁でこなす便利屋の商売道具。" },
    { id: "starter_priest_censer", name: "朝祷の白煙香炉", slot: "weapon", jobs: ["priest"], attack: 3, defense: 1, acceleration: 0, attributeAttack: "light", resistances: { light: 2, curse: 1 }, description: "癒やしと祓いの白煙を絶やさない携帯香炉。" },
    { id: "starter_ninja_kunai", name: "無銘・影走り苦無", slot: "weapon", jobs: ["ninja"], attack: 7, defense: 0, acceleration: 6, attributeAttack: "dark", attackAttributes: ["dark", "slash"], resistances: { dark: 2, light: -1 }, description: "忍者の初速をさらに尖らせる危険な高速忍具。" },
    { id: "starter_flower_scepter", name: "眠り花の蕾笏", slot: "weapon", jobs: ["flower_tamer"], attack: 2, defense: 0, acceleration: 2, attributeAttack: "poison", resistances: { poison: 2, fire: -1 }, description: "花印を根付きやすくする、お花使いの生きた笏。" },
    { id: "starter_capoeira_wraps", name: "逆立ち踵の革帯", slot: "feet", jobs: ["capoeirista"], attack: 4, defense: 0, acceleration: 6, attributeAttack: "blunt", resistances: { blunt: 1, steel: -1 }, description: "素手を保ったまま足技と逆立ちを支えるカポエラ用革帯。" },
  ];
  window.HD_DATA.equipment.push(...starterBuildEquipment.map((item) => ({
    hpRegen: 0, recipe: null, starterOnly: true, ...item, attackAttributes: item.attackAttributes || (item.attributeAttack ? [item.attributeAttack] : []),
  })));

  // 4部位から組む段階式セット。2部位から実用になり、4部位で戦法が完成する。
  const equipmentSets = [];
  window.HD_DATA.attributes.forEach((attribute) => {
    equipmentSets.push({
      id: `ward_set_${attribute}`,
      name: `${window.HD_DATA.attributeLabels[attribute]}界四重陣`,
      itemIds: ["mantle", "plate", "stride", "seal"].map((form) => `ward_${attribute}_${form}`),
      bonuses: [
        { pieces: 2, resistances: { [attribute]: 1 }, text: `${window.HD_DATA.attributeLabels[attribute]}耐性+1` },
        { pieces: 3, defense: 4, text: "防御+4" },
        { pieces: 4, resistances: { [attribute]: "immune" }, acceleration: 6, text: `${window.HD_DATA.attributeLabels[attribute]}免疫・加速度+6` },
      ],
    });
  });
  const lineageSetThemeIds = ["thunder", "lizard", "garm", "slimeborn", "spiritborn", "plantborn", "elfborn", "dragonborn", "demonborn", "angelborn"];
  lineageSetThemeIds.forEach((themeId) => {
    const theme = themeById[themeId];
    equipmentSets.push({
      id: `lineage_set_${themeId}`,
      name: `${theme.name}四宝装`,
      itemIds: ["coat", "greaves", "boots", "pendant"].map((form) => `crafted_${themeId}_${form}`),
      bonuses: [
        { pieces: 2, attack: 4, attackAttributes: [theme.attribute], text: `攻撃+4・${window.HD_DATA.attributeLabels[theme.attribute]}攻撃を追加` },
        { pieces: 3, resistances: { [theme.resistance]: 2 }, hpRegen: 1, text: `${window.HD_DATA.attributeLabels[theme.resistance]}耐性+2・再生+1` },
        { pieces: 4, attack: 8, acceleration: 10, hpRegen: 2, text: "攻撃+8・加速度+10・再生+2" },
      ],
    });
  });
  equipmentSets.forEach((set) => set.itemIds.forEach((itemId) => {
    const item = window.HD_DATA.equipment.find((candidate) => candidate.id === itemId);
    if (!item) return;
    item.setId = set.id;
    item.description = `${item.description} セット「${set.name}」の構成品。`;
  }));
  window.HD_DATA.equipmentSets = equipmentSets;

  // 数値の上位互換ではなく、他部位との組み合わせで完成する手作業設計の装備効果。
  const puzzleEquipment = {
    iron_sword: [{ type: "resistance", attribute: "slash", threshold: 3, attack: 5, text: "斬耐性3以上なら、刃を捨て身で滑らせ攻撃+5。" }],
    bone_maul: [{ type: "resistance", attribute: "blunt", threshold: 3, attack: 6, defense: -2, text: "打耐性3以上なら攻撃+6、防御-2。衝撃を防具ごと武器へ返す。" }],
    fire_lizard_dagger: [{ type: "resistance", attribute: "fire", threshold: 3, attack: 6, text: "火耐性3以上なら刀身が白熱し攻撃+6。" }],
    hunter_bow: [{ type: "acceleration", threshold: 20, crit: 0.08, text: "加速度20以上なら照準が静止し、会心率+8%。" }],
    thunder_charm: [{ type: "resistance", attribute: "thunder", threshold: 3, acceleration: 8, text: "雷耐性3以上なら蓄電を脚へ流し、加速度+8。" }],
    garm_fireguard: [{ type: "resistance", attribute: "fire", threshold: 5, hpRegen: 3, text: "火耐性5なら赤熱を生命へ変換し、再生+3。" }],
    fur_clothes: [{ type: "resistance", attribute: "poison", threshold: 2, luck: 3, text: "毒耐性2以上なら毒気の匂いを読み、運+3。" }],
    carapace_armor: [{ type: "resistancePair", attributes: ["slash", "blunt"], thresholds: [2, 2], defense: 4, text: "斬耐性2・打耐性2を揃えると甲殻が噛み合い、防御+4。" }],
    fire_lizard_cloak: [{ type: "resistance", attribute: "fire", threshold: 3, hpRegen: 2, text: "火耐性3以上なら外套が体温を循環させ、再生+2。" }],
    truth_lens: [{ type: "research", multiplier: 1.5, text: "透明看破中、戦闘で得る調査証拠が1.5倍。" }],
    guild_glass_cannon: [{ type: "lowHp", rate: 0.35, attack: 15, text: "HP35%以下では亀裂が砲身となり、攻撃+15。" }],
    guild_anchor_greaves: [{ type: "resistancePair", attributes: ["steel", "earth"], thresholds: [3, 2], defense: 10, text: "鋼耐性3・土耐性2を同時に満たすと防御+10。" }],
    guild_void_talisman: [{ type: "vulnerability", count: 1, attack: 10, text: "負の耐性を一つ以上残すと、空白が牙を持ち攻撃+10。" }],
    guild_rainbow_pendant: [{ type: "resistanceDiversity", count: 10, threshold: 1, acceleration: 10, text: "耐性1以上を十属性揃えると加速度+10。" }],
    guild_tourist_camera: [{ type: "research", multiplier: 2, text: "調査証拠を2倍記録する。完全解析済みには効果なし。" }],
    crafted_plantborn_pendant: [{ type: "flower", chance: 0.08, duration: 4, text: "花ペットの洗脳率+8%、使役時間+4ターン。" }],
    crafted_spiritborn_talisman: [{ type: "rareLoot", multiplier: 1.5, text: "呪耐性3以上なら超レア・ウルトラレア判定が1.5倍。" , attribute: "curse", threshold: 3 }],
  };
  Object.entries(puzzleEquipment).forEach(([id, effects]) => {
    const item = window.HD_DATA.equipment.find((candidate) => candidate.id === id);
    if (!item) return;
    item.puzzleEffects = effects;
    item.description = `${item.description} 連携効果：${effects.map((effect) => effect.text).join(" ")}`;
  });

  // B61以降の急激な敵強化へ装備更新で対抗できるよう、終盤品は元の役割を保ったまま数値を段階強化する。
  // ネタ・ゴミアーティファクトと初期支給品は、弱さそのものが個性なので対象外とする。
  const lateGameEquipmentPower = (item) => {
    const grade = Number(/^series_(\d+)_/.exec(item.id)?.[1] || 0);
    if (item.rousesDungeon) return 0;
    if (grade >= 9) return 3;
    if (grade === 8) return 2;
    if (grade === 7) return 1;
    if (item.guildCost) return item.guildCost >= 1600 ? 3 : item.guildCost >= 800 ? 2 : 1;
    if (item.artifact?.tier === "cheat") return 3;
    if (item.artifact?.tier === "useful") return 2;
    if (item.masterOnly || item.completionOnly) return 3;
    return 0;
  };
  const slotBonuses = {
    weapon: [null, { attack: 6, defense: 2, acceleration: 3 }, { attack: 13, defense: 4, acceleration: 7 }, { attack: 22, defense: 7, acceleration: 12 }],
    upper: [null, { attack: 3, defense: 4, acceleration: 2 }, { attack: 7, defense: 9, acceleration: 5 }, { attack: 12, defense: 15, acceleration: 9 }],
    lower: [null, { attack: 3, defense: 4, acceleration: 2 }, { attack: 7, defense: 9, acceleration: 5 }, { attack: 12, defense: 15, acceleration: 9 }],
    feet: [null, { attack: 3, defense: 3, acceleration: 6 }, { attack: 7, defense: 6, acceleration: 12 }, { attack: 12, defense: 10, acceleration: 20 }],
    accessory: [null, { attack: 2, defense: 2, acceleration: 3 }, { attack: 5, defense: 5, acceleration: 7 }, { attack: 9, defense: 9, acceleration: 12 }],
  };
  window.HD_DATA.equipment.forEach((item) => {
    if (item.starterOnly) return;
    const power = lateGameEquipmentPower(item);
    const bonus = slotBonuses[item.slot]?.[power];
    if (!power || !bonus) return;
    item.attack = Number(item.attack || 0) + (item.slot === "weapon" || Number(item.attack || 0) > 0 || item.slot === "accessory" ? bonus.attack : 0);
    item.defense = Number(item.defense || 0) + (item.slot !== "weapon" || Number(item.defense || 0) > 0 ? bonus.defense : 0);
    item.acceleration = Number(item.acceleration || 0) + (item.slot === "feet" || item.slot === "accessory" || Number(item.acceleration || 0) > 0 ? bonus.acceleration : 0);
    if (Number(item.hpRegen || 0) > 0) item.hpRegen += power;
    if (power >= 2) Object.keys(item.resistances || {}).forEach((attribute) => {
      const value = item.resistances[attribute];
      if (value !== "immune" && Number(value) > 0) item.resistances[attribute] = Math.min(5, Number(value) + (power === 3 ? 2 : 1));
    });
    item.lateGamePower = power;
  });

  // 後段の多相型補正で攻撃属性が追加された装備も、旧形式の先頭属性を同期する。
  window.HD_DATA.equipment.forEach((item) => {
    const normalized = [...new Set([
      ...(Array.isArray(item.attackAttributes) ? item.attackAttributes : []),
      ...(item.attributeAttack ? [item.attributeAttack] : []),
    ].filter((attribute) => window.HD_DATA.attributes.includes(attribute)))];
    item.attackAttributes = normalized;
    item.attributeAttack = normalized[0] || null;
  });

})();
