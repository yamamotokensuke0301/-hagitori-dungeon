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
    { id: "garm_red_pelt", name: "ガルムの赤毛皮", description: "赤熱のガルムから得た赤い毛皮。" },
    { id: "garm_fire_core", name: "ガルムの火核", description: "火でとどめを刺さずに討伐した証。" },
  ];
})();
