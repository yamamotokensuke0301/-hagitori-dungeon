(function () {
  window.HD_DATA = window.HD_DATA || {};

  window.HD_DATA.attributeLabels = {
    light: "光",
    dark: "闇",
    fire: "火",
    water: "水",
    earth: "土",
    wind: "風",
    thunder: "雷",
    poison: "毒",
    ice: "凍",
    curse: "呪",
    acid: "酸",
    slash: "斬",
    blunt: "打",
    illusion: "幻",
    steel: "鋼",
  };

  window.HD_DATA.attributes = Object.keys(window.HD_DATA.attributeLabels);

  window.HD_DATA.resistanceMultipliers = {
    "-4": 2.25,
    "-3": 2,
    "-2": 1.65,
    "-1": 1.3,
    0: 1,
    1: 0.75,
    2: 0.5,
    3: 0.25,
    4: 0.1,
    5: 0.01,
    immune: 0,
  };

  window.HD_DATA.materials = [
    { id: "small_beast_meat", name: "小獣の肉", description: "小型獣から得られる基礎素材。" },
    { id: "rat_tail", name: "洞窟ネズミの尾", description: "斬属性で傷を抑えて切り取った尾。" },
    { id: "clean_pelt", name: "傷の少ない毛皮", description: "斬属性で外皮を損なわずに得た素材。" },
    { id: "broken_carapace", name: "砕けた甲殻", description: "打属性で割った硬い甲殻片。" },
    { id: "scorched_hide", name: "焦げた皮", description: "火属性で焼けた扱いにくい皮。" },
    { id: "fine_pelt", name: "上質な毛皮", description: "狩人の精密射撃で品質を保った毛皮。" },
    { id: "poison_fang", name: "毒牙", description: "毒牙蝙蝠の毒を帯びた牙。" },
    { id: "bat_wing_membrane", name: "蝙蝠の翼膜", description: "薄く軽い翼膜。" },
    { id: "thunder_horn", name: "雷角", description: "雷角兎の角。雷避けの護符に使う。" },
    { id: "unbroken_horn", name: "無傷の雷角", description: "精密に仕留めた時だけ得やすい角。" },
    { id: "fire_lizard_scale", name: "火蜥蜴の鱗", description: "火喰い蜥蜴の熱に強い鱗。" },
    { id: "cool_fire_gland", name: "冷却された火腺", description: "水属性で冷やしてから得た火器官。" },
    { id: "fire_lizard_marrow", name: "火蜥蜴の骨髄", description: "打属性で骨を割って得る素材。" },
    { id: "burned_corpse", name: "焼損した遺体", description: "火で焼けて価値が落ちた素材。" },
    { id: "garm_red_pelt", name: "ガルムの赤毛皮", description: "胸火のガルムから得た赤い毛皮。" },
    { id: "garm_fire_core", name: "ガルムの火核", description: "火でとどめを刺さずに討伐した証。" },
    { id: "slime_gel", name: "粘体の原液", description: "粘体族の身体を形作る粘性素材。" },
    { id: "slime_crystal", name: "粘体晶核", description: "弱点を突いて凝固させた粘体族の中枢核。" },
    { id: "vermin_hide", name: "小獣の生皮", description: "小獣族から剥いだ加工前の丈夫な皮。" },
    { id: "vermin_fang", name: "小獣の王牙", description: "傷を抑えて回収した小獣族の発達した牙。" },
    { id: "insect_shell", name: "蟲族の外殻", description: "蟲族を守る硬質な外骨格。" },
    { id: "insect_core", name: "蟲王の節核", description: "関節を正確に断って得る希少な節足核。" },
    { id: "winged_feather", name: "翼獣の風羽", description: "翼獣族の魔力を帯びた軽い羽根。" },
    { id: "winged_pinion", name: "翼獣の主翼骨", description: "飛行能力を支える無傷の主翼骨。" },
    { id: "reptile_scale", name: "鱗族の硬鱗", description: "鱗族の属性熱を遮る強靭な鱗。" },
    { id: "reptile_heart", name: "鱗族の竜芽心", description: "竜へ進化する力を秘めた鱗族の心臓器官。" },
    { id: "spirit_ectoplasm", name: "霊族の残滓", description: "霊族が消滅した場所に残る半透明の霊質。" },
    { id: "spirit_gem", name: "凝魂宝珠", description: "弱点属性で霊体を崩さず凝縮した魂の宝珠。" },
    { id: "construct_scrap", name: "造魔の機殻", description: "造魔族を構成する術式入りの外装部品。" },
    { id: "construct_core", name: "造魔動力核", description: "機能を停止させて無傷で抜き取った動力核。" },
    { id: "plant_fiber", name: "妖植の霊繊維", description: "妖植族の茎や根から採れる魔力伝導繊維。" },
    { id: "plant_seed", name: "千年妖種", description: "長い年月を生きる妖植族が守る希少種子。" },
    { id: "fiend_horn", name: "魔族の曲角", description: "魔族の魔力を蓄える湾曲した角。" },
    { id: "fiend_blood", name: "魔侯の黒血", description: "弱点で魔力を封じて採取した濃密な魔血。" },
    { id: "giant_bone", name: "巨人の大骨", description: "巨人族の体重を支える巨大な骨材。" },
    { id: "giant_marrow", name: "巨神髄", description: "巨人族の怪力を生み出す希少な骨髄。" },
    { id: "aberrant_tissue", name: "異形の脈動肉", description: "異形族から切り離しても動き続ける組織。" },
    { id: "aberrant_eye", name: "異界観測眼", description: "異形族が別世界を覗くための完全な眼球。" },
    { id: "warrior_badge", name: "戦人の武勲章", description: "戦人族が生前の戦歴を刻んだ金属章。" },
    { id: "warrior_relic", name: "歴戦武具の芯金", description: "使い手と共に成長した武具から抜ける芯材。" },
    { id: "elf_thread", name: "エルフの森霊糸", description: "エルフ族の衣と弓へ使われる生きた霊糸。" },
    { id: "elf_dewdrop", name: "古樹王の雫", description: "高位エルフが古樹から授かる生命の雫。" },
    { id: "dragon_scale", name: "ドラゴンの真竜鱗", description: "最上位ドラゴン族の属性を宿す真の竜鱗。" },
    { id: "dragon_heart", name: "始祖竜の心核", description: "竜の生命と吐息を生み続ける最上位心核。" },
    { id: "demon_horn", name: "悪魔の契約角", description: "悪魔族が契約の数だけ紋様を刻む魔角。" },
    { id: "demon_seal", name: "魔王契約印", description: "高位悪魔を弱点で討ち、契約ごと封じた印章。" },
    { id: "angel_feather", name: "天使の聖光羽", description: "天使族の光を失わず残した神聖な羽根。" },
    { id: "angel_halo", name: "原初天使の光輪片", description: "天使の権能が結晶化した光輪の破片。" },
  ];

  const exceptionalSpeciesMaterials = [
    ["slime", "七彩粘体核", "始原粘界の一滴"],
    ["vermin", "百獣王の牙", "原初獣の命毛"],
    ["insect", "蟲帝の完全殻", "始祖蟲の琥珀核"],
    ["winged", "天翔主の虹羽", "空界王の風切骨"],
    ["reptile", "古竜化石鱗", "竜祖胎動核"],
    ["spirit", "輪廻魂晶", "根源霊の真名珠"],
    ["construct", "永久機関片", "創造主の第一歯車"],
    ["plant", "世界樹の胚芽", "創世樹の年輪核"],
    ["fiend", "魔帝の黒心血", "魔界王権の角冠"],
    ["giant", "巨神の脊柱片", "天地開闢の神髄"],
    ["aberration", "外宇宙の瞳膜", "名状不能の心臓片"],
    ["warrior", "覇王武具の魂鋼", "無敗神話の原典章"],
    ["elf", "神樹エルフの霊布", "最初の森の生命雫"],
    ["dragon", "虹祖竜の逆鱗", "創世竜の星核"],
    ["demon", "大魔王の真契印", "原罪悪魔の王冠角"],
    ["angel", "熾天使の十二翼羽", "創世天使の完全光輪"],
  ];
  exceptionalSpeciesMaterials.forEach(([id, superName, ultraName]) => {
    window.HD_DATA.materials.push(
      { id: `${id}_super`, name: `◆${superName}`, rarity: "super", description: `${id}系種族からごく稀に得られる超レア素材。` },
      { id: `${id}_ultra`, name: `✦${ultraName}`, rarity: "ultra", description: `${id}系種族から奇跡的な確率で得られるウルトラレア素材。` },
    );
  });
  const junkDealerRefinedMaterialIds = [
    "slime_crystal", "vermin_fang", "insect_core", "winged_pinion",
    "reptile_heart", "spirit_gem", "construct_core", "plant_seed",
    "fiend_blood", "giant_marrow", "aberrant_eye", "warrior_relic",
    "elf_dewdrop", "dragon_heart", "demon_seal", "angel_halo",
  ];
  window.HD_DATA.materials.forEach((material) => {
    if (junkDealerRefinedMaterialIds.includes(material.id)) material.junkDealerTier = "refined";
    else if (material.rarity === "super") material.junkDealerTier = "super";
    else if (material.rarity === "ultra") material.junkDealerTier = "ultra";
  });
})();
