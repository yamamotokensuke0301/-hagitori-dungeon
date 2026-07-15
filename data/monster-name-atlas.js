(function () {
  "use strict";

  const DATA = window.HD_DATA;
  const monsters = DATA?.monsters || [];
  const monsterById = new Map(monsters.map((monster) => [monster.id, monster]));
  const renamedIds = new Set();

  function replaceText(value, oldNames, newName) {
    return oldNames.reduce(
      (text, oldName) => oldName ? text.split(oldName).join(newName) : text,
      String(value || ""),
    );
  }

  function renameMonster(monster, newName, namingSchool) {
    if (!monster || !newName) return;
    const oldNames = [...new Set([monster.name, monster.baseName]
      .filter(Boolean)
      .flatMap((name) => [name, name.replace(/〈[甲乙丙]〉$/, "")]))];
    monster.name = newName;
    if (monster.unique) monster.baseName = newName;
    monster.namingSchool = namingSchool;
    if (monster.dangerous?.telegraph) {
      monster.dangerous.telegraph = replaceText(monster.dangerous.telegraph, oldNames, newName);
      if (!monster.dangerous.telegraph.includes(newName) && monster.dangerous.telegraph.includes("が")) {
        monster.dangerous.telegraph = `${newName}${monster.dangerous.telegraph.slice(monster.dangerous.telegraph.indexOf("が"))}`;
      }
    }
    ["dialogueDesire", "dialogueKeepsake", "dialogueSecret"].forEach((key) => {
      if (monster[key]) monster[key] = replaceText(monster[key], oldNames, newName);
    });
    Object.keys(monster.research || {}).forEach((key) => {
      monster.research[key] = replaceText(monster.research[key], oldNames, newName);
    });
    renamedIds.add(monster.id);
  }

  function renameById(id, newName, namingSchool) {
    const monster = monsterById.get(id);
    if (!monster) throw new Error(`名称改稿対象が見つかりません: ${id}`);
    renameMonster(monster, newName, namingSchool);
  }

  function applyExactNames(entries, namingSchool) {
    entries.forEach(([id, name]) => renameById(id, name, namingSchool));
  }

  // 浅層は簡潔な種族名を基準にし、固有種と「深層～」だけで済ませていた派生種を改稿する。
  applyExactNames([
    ["red_garm", "胸火のガルム"],
    ["white_fang_marta", "白牙マルタ"],
    ["iron_shell_gondo", "鉄殻ゴンド"],
    ["venom_widow_nazka", "毒巣母ナズカ"],
    ["drowned_knight_ordo", "水葬騎士オルド"],
    ["thunder_emperor_barg", "雷角王バーグ"],
    ["curse_mask_mimei", "名食いの仮面ミメイ"],
    ["frost_bloom_helka", "凍花ヘルカ"],
    ["ash_dragon_volda", "灰竜ヴォルダ"],
    ["abyss_eye_zahar", "深層を見張るザハル"],
    ["slime_6", "黒油スライム"],
    ["spirit_6", "底なし眼"],
    ["deep_cave_rat_6", "墓穴ネズミ"],
    ["deep_carapace_rat_7", "鉄背ドブネズミ"],
    ["deep_poison_bat_8", "紫牙コウモリ"],
    ["deep_thunder_hare_9", "落雷ウサギ"],
    ["deep_fire_lizard_10", "炉腹トカゲ"],
    ["deep_fang_1_6", "煤走りネズミ"],
    ["deep_fang_2_7", "岩喉の番犬"],
    ["deep_fang_3_8", "骨穴イタチ"],
    ["deep_fang_4_9", "夜目の洞キツネ"],
    ["deep_fang_5_10", "石肺オオカミ"],
    ["deep_fang_6_6", "黒爪のヌシ"],
    ["deep_shell_1_7", "墓石ハネムシ"],
    ["deep_shell_2_8", "赤さびガニ"],
    ["deep_shell_3_9", "百鎧ムカデ"],
    ["deep_shell_4_10", "岩盤ガメ"],
    ["deep_shell_5_6", "溶鋼サソリ"],
    ["deep_shell_6_7", "門番オオムシ"],
    ["deep_wing_1_8", "天井狩りコウモリ"],
    ["deep_wing_2_9", "腐粉の大ガ"],
    ["deep_wing_3_10", "鉄羽カラス"],
    ["deep_wing_4_6", "雷見フクロウ"],
    ["deep_wing_5_7", "夜幕ハネモノ"],
    ["deep_wing_6_8", "別れ鳥"],
    ["deep_slime_1_9", "底なし泥"],
    ["deep_slime_2_10", "歩く苔沼"],
    ["deep_slime_3_6", "毒沼の主ゼリー"],
    ["deep_slime_4_7", "鎧溶かし"],
    ["deep_slime_5_8", "氷漬けスライム"],
    ["deep_slime_6_9", "黒油の群体"],
    ["deep_spirit_1_10", "帰れずの鬼火"],
    ["moon_eater_luna", "月を食むルナ"],
    ["acid_king_doruba", "王水のドルバ"],
    ["wind_witch_sylphy", "嵐継ぎシルフィ"],
    ["bone_lord_gazra", "千骨王ガズラ"],
    ["steel_beast_orga", "鋼喉オルガ"],
    ["mirage_prince_nemu", "眠り宮のネム"],
    ["ice_empress_freya", "春を凍らすフレイア"],
    ["sunken_god_molok", "水底で夢見るモロク"],
    ["black_sun_azazel", "黒陽核アザゼル"],
    ["dungeon_heart_eve", "迷宮心臓イヴ"],
  ], "浅層生態・深層派生");

  // B11F以深の一般種は、階番号や甲乙丙ではなく、各環境で獲得した姿と習性で呼ぶ。
  const abyssRegionNames = [
    {
      firstFloor: 11,
      lastFloor: 20,
      region: "白塩回廊",
      names: [
        "白殻の空鎧", "石灯ヘビ", "銀露の精", "白壁コウモリ", "鉄花の精",
        "塩牙ネズミ", "灯し目キツネ", "石刃カラス", "墓標渡り", "城殻ガメ",
        "毒苔ゼリー", "天井縫いコウモリ", "灯油スライム", "白塩オオカミ", "白壁の泣き声",
        "鐘殻ガニ", "壁眼の番人", "石灰溶かし", "白砂の踊り子",
      ],
    },
    {
      firstFloor: 21,
      lastFloor: 30,
      region: "水没鐘楼",
      names: [
        "潮粉ガ", "水葬の鬼火", "濡れ幕コウモリ", "沈み鐘の仮面", "船底ゴケ",
        "青火の小精", "水切りの風精", "冷え腹トカゲ", "鐘穴イタチ", "泡骨ヘビ",
        "溺れ爪の獣", "雫結びの精", "水鎧ムカデ", "凍露の精", "沈城オオムシ",
        "潮毒ヘビ", "波刃カラス", "船食いネズミ", "鐘石ハネムシ",
      ],
    },
    {
      firstFloor: 31,
      lastFloor: 40,
      region: "雷葬断層",
      names: [
        "雷跳ねウサギ", "稲妻ゼリー", "地鳴り犬", "風穴コウモリ", "雷脈オオカミ",
        "嵐見フクロウ", "震え泥", "雲底の一つ目", "避雷サソリ", "断層の鬼火",
        "歩く雷雲", "風裂きコウモリ", "岩鳴り竜", "雷種の小精", "地走りネズミ",
        "稲妻漬けスライム", "谷渡りの風精", "風声ハネムシ", "震土トカゲ",
      ],
    },
    {
      firstFloor: 41,
      lastFloor: 50,
      region: "腐花温室",
      names: [
        "酸吹きヘビ", "腐土の黒獣", "蜜毒の露玉", "根鎧ムカデ", "灰苔ネズミ",
        "花殻オオムシ", "毒根ヘビ", "赤目の花キツネ", "腐葉ハネムシ", "酸跳ねウサギ",
        "岩苔ガメ", "根噛み犬", "沼油スライム", "毒森オオカミ", "酸雨フクロウ",
        "緑さびガニ", "歩く腐泥", "骨溶かし", "花粉嵐の精",
      ],
    },
    {
      firstFloor: 51,
      lastFloor: 60,
      region: "鏡氷墓域",
      names: [
        "鏡粉ガ", "幻灯の鬼火", "夢幕コウモリ", "氷鏡竜", "霜苔スライム",
        "写し身ネズミ", "夢氷の群体", "凍り腹トカゲ", "鏡裏の声", "霜火ヘビ",
        "影写しの黒獣", "眠り牙コウモリ", "氷鎧ムカデ", "夢結晶の精", "鏡城オオムシ",
        "白尾の幻キツネ", "写し刃カラス", "凍土ネズミ", "夢葬の鳥",
      ],
    },
    {
      firstFloor: 61,
      lastFloor: 70,
      region: "忘名霊廟",
      names: [
        "黒雷ウサギ", "墓毒ゼリー", "影縫いコウモリ", "夜油スライム", "告解フクロウ",
        "名なしの泣き霊", "聖印ガニ", "墓壁の一つ目", "光墓サソリ", "呪粉ガ",
        "別れ雷の精", "夜幕コウモリ", "忘れ面", "墓苔スライム", "黒灯の小精",
        "呪氷の群体", "魂運びの風精", "碑文トカゲ", "墓穴イタチ",
      ],
    },
    {
      firstFloor: 71,
      lastFloor: 80,
      region: "鉄蝕炉心",
      names: [
        "炉殻の空鎧", "鉄食い黒獣", "煙牙コウモリ", "溶鉄ムカデ", "鋼花の精",
        "すす牙ネズミ", "炉毒ヘビ", "火花刃カラス", "赤さびハネムシ", "溶岩背ガメ",
        "鉄毒ゼリー", "炉喉の番犬", "黒鉄スライム", "鉄粉オオカミ", "焼け声の霊",
        "溶け泥", "炉眼の番人", "王水の群体", "鉄砂嵐の精",
      ],
    },
    {
      firstFloor: 81,
      lastFloor: 90,
      region: "星影天蓋",
      names: [
        "星粉ガ", "光墓の雷霊", "星幕コウモリ", "月面の仮面", "星苔スライム",
        "黒灯の鬼火", "月氷の群体", "夜腹トカゲ", "星穴イタチ", "光殻の空鎧",
        "影火ヘビ", "星露の精", "月牙コウモリ", "白影ネズミ", "夜城オオムシ",
        "影尾キツネ", "星刃カラス", "宙渡りネズミ", "光葬の鳥",
      ],
    },
    {
      firstFloor: 91,
      lastFloor: 100,
      region: "原初混沌",
      names: [
        "雷雨ウサギ", "毒雷ガメ", "三界犬", "凍毒コウモリ", "原初オオカミ",
        "呪酸の泣き声", "氷呪ガニ", "生まれ泥", "世界腐食サソリ", "闇灯の鬼火",
        "天地を渡る雷霊", "光なき仮面", "地脈竜", "創火の小精", "鋼皮ネズミ",
        "終風の精", "夢喉トカゲ", "百穴イタチ",
      ],
    },
  ];

  abyssRegionNames.forEach((region) => {
    const targets = monsters
      .filter((monster) => /^abyss_f\d+_v\d+$/.test(monster.id))
      .filter((monster) => monster.floors[0] >= region.firstFloor && monster.floors[0] <= region.lastFloor)
      .sort((left, right) => left.floors[0] - right.floors[0] || left.id.localeCompare(right.id));
    if (targets.length !== region.names.length) {
      throw new Error(`${region.region}の名称数が不一致です: ${targets.length}/${region.names.length}`);
    }
    targets.forEach((monster, index) => {
      monster.catalogVariant = monster.mapMarker;
      monster.ecologicalRegion = region.region;
      monster.mapMarker = monster.speciesGlyph || monster.glyph || "魔";
      renameMonster(monster, region.names[index], `深層生態・${region.region}`);
    });
  });

  // 五階おきの深淵個体は、それぞれ一つの伝承・異常・戦闘像に結び付ける。
  applyExactNames([
    ["abyss_unique_15", "白壁の双生獣ネムとネム"],
    ["abyss_unique_20", "罪の天秤ケルヴァ"],
    ["abyss_unique_25", "沈み鐘魚ガラドーン"],
    ["abyss_unique_30", "雷を産む地母獣ヴァルガ"],
    ["abyss_unique_35", "毒庭の花婿ウルネ"],
    ["abyss_unique_40", "鏡冬の葬列ミレシア"],
    ["abyss_unique_45", "名なし王の空席"],
    ["abyss_unique_50", "神光を盗む黒翼エルゼ"],
    ["abyss_unique_55", "赤さびの脱獄王ギデオン"],
    ["abyss_unique_60", "一秒を食べ残すクロノ"],
    ["abyss_unique_65", "眠りを飼う牢主ソムニア"],
    ["abyss_unique_70", "死者門の渡し守カロン"],
    ["abyss_unique_75", "亡き神を運ぶ百脚オルゴ"],
    ["abyss_unique_80", "零度より来たものイゼル"],
    ["abyss_unique_85", "星裏の観測者テレス"],
    ["abyss_unique_90", "世界の傷口アパトス"],
    ["abyss_unique_95", "百層を食むヘビの影"],
    ["dungeon_lord_nox", "《認識圏外より来たるもの》太古からの闇キキルクルス"],
  ], "深淵伝承");

  // 闘技場では本名や属性語の機械的な組合せを廃し、観客が一戦で覚えるリングネームを使う。
  const arenaNamesByAttribute = {
    fire: [
      "火床の裸足王", "煤冠の曲芸師", "炉心抱きの拳姫", "灰明かりの処刑人",
      "炎環をくぐる槍兵", "火葬台の逆転王", "焼け旗の剣闘士", "最後まで燃えない男",
    ],
    water: [
      "潮目を割る青槍", "水鏡の舞踏家", "波底の鎖使い", "雨拍子の拳士",
      "渦冠の女王", "海鳴りを背負う盾", "一滴もこぼさぬ刃", "溺れ知らずの渡り手",
    ],
    thunder: [
      "雷拍子の踊り手", "稲妻より先の拳", "天鼓を割る双剣", "落雷待ちの槍王",
      "青火花の曲芸師", "雷輪の疾走者", "空鳴りの審判", "一歩ごとに雷を置く女",
    ],
    poison: [
      "毒杯を干す審判", "紫煙の細剣", "毒花冠の女王", "一息遅い暗殺者",
      "百薬知らずの拳士", "ヘビ酒の勝負師", "毒雨をまとう盾", "最後に笑う調合師",
    ],
    ice: [
      "霜刃の眠り姫", "氷床の舞姫", "白息の槍兵", "凍星の弓手",
      "春知らずの拳", "氷柱を折る肩", "雪明かりの決闘者", "零下の道化",
    ],
    curse: [
      "名前を賭ける呪師", "墓標数えの剣士", "凶星の代闘士", "呪札まといの拳",
      "敗者を忘れる鐘", "七代目の不運王", "影縫いの祈り手", "勝利を葬る女",
    ],
    acid: [
      "鎧溶かしの雨男", "緑煙の壺使い", "鉄骨なめの獣士", "酸花をまく踊り子",
      "腐り刃の研ぎ師", "骨まで洗う豪雨", "溶解線の砲手", "最後の一滴",
    ],
    dark: [
      "影踏みの無敗者", "黒月の裏役者", "灯消しの剣舞", "夜道の先回り",
      "暗幕から来る拳", "目隠しの王", "影だけ残す槍", "暁を知らぬ勝者",
    ],
    light: [
      "白昼の目隠し剣", "光輪投げの曲芸師", "朝日を背負う拳", "まぶしさの審判",
      "灯台槍の守人", "影なき踊り手", "日輪を割る盾", "最後のスポットライト",
    ],
    earth: [
      "岩座の横綱", "地鳴りの裸足王", "山肩の盾士", "砂城崩しの拳",
      "石雨を歩く者", "断層の槍番", "大地を枕に眠る巨漢", "一歩も退かぬ谷",
    ],
    wind: [
      "風切りの舞姫", "嵐を追い越す靴", "天井走りの双剣", "空席を巡る風",
      "息継ぎなき槍", "羽根一枚の拳士", "台風眼の道化", "歓声をさらう者",
    ],
    steel: [
      "刃雨の傘持ち", "鋼拳の鍛冶師", "百剣受けの盾", "鉄靴の舞踏家",
      "鎧ごと斬る糸", "銀床の番人", "折れずの細槍", "最後の鉄札",
    ],
    illusion: [
      "鏡から遅れて来る者", "夢芝居の主演", "三人に見える剣士", "観客席の暗殺者",
      "勝敗をすり替える手品師", "昨日の対戦相手", "偽傷だらけの王", "拍手だけが本物",
    ],
    slash: [
      "一閃の余白", "血月を描く剣士", "サヤ走りの舞姫", "首筋一枚の距離",
      "二刀目を隠す者", "斬線の綱渡り", "返り血なき処刑人", "剣だけ先に着く",
    ],
    blunt: [
      "骨鐘を鳴らす拳", "城門砕きの肩", "一撃ごとに床が沈む", "鉄槌の拍子取り",
      "盾で殴る王", "頭突き百連勝", "石うす回しの巨漢", "最後に立つ拳",
    ],
  };
  const arenaAttributeUse = new Map();
  monsters.filter((monster) => monster.arenaOnly)
    .sort((left, right) => left.arenaRank - right.arenaRank)
    .forEach((monster) => {
      const attribute = monster.attackAttribute;
      const nameIndex = Number(arenaAttributeUse.get(attribute) || 0);
      const name = arenaNamesByAttribute[attribute]?.[nameIndex];
      if (!name) throw new Error(`闘技場名が不足しています: ${attribute}/${nameIndex}`);
      arenaAttributeUse.set(attribute, nameIndex + 1);
      renameMonster(monster, name, `闘技場リングネーム・${attribute}`);
    });

  // 迷宮へ移籍した100体の極端な戦型は、戦い方そのものが名前から読めるようにする。
  const peakyNamesByProfile = {
    glass_cannon: [
      "一命槍キルネ", "初撃の埋葬人", "心臓ひとつの剣聖", "紙鎧のバルカ", "返し刃なき狩人",
      "朝焼けを割る細剣", "血一滴の砲手", "死線だけを歩くレム", "折れる前に折る者", "一太刀の遺言",
      "風穴だらけの英雄", "片道切符の槍兵", "命綱を焼いた魔弓", "先手必葬のネージュ", "鎧を捨てた雷拳",
      "サヤなき終剣", "息継ぎをしない射手", "骨より速い斬撃", "二撃目を知らぬ王", "最後の一発・カノン",
    ],
    immovable_fortress: [
      "千錠門グロム", "眠る城壁バストラ", "歩かない巨兵ドルン", "刃止めの石母", "九重盾のウルガ",
      "門番山ガデム", "攻め方を忘れた砦", "背中に城を持つ男", "鉄床の座王ボルド", "動かぬ潮壁ネッサ",
      "百槍を数える鎧", "地面に根付いた騎士", "崩れない葬列", "さびても閉じる門", "眠りながら守る巨人",
      "大盾の内側の王", "一歩を百年かける者", "城壁を着た巡礼", "最後の門ノクタ", "退路そのもの",
    ],
    blink_assassin: [
      "瞬き盗みのレイ", "音より薄い刃", "背後から生まれる者", "七影足のキリカ", "目を閉じると近づく槍",
      "風抜けの暗殺姫", "残像だけの剣客", "一秒先の首狩り", "床を踏まない黒靴", "呼吸の間にいる敵",
      "月影飛びのナギ", "振り向く前の傷", "光を追い越す短剣", "足音を置いてきた男", "影から影へ渡る女",
      "瞬間葬のハヤテ", "扉より先に入る者", "血が落ちるより速い刃", "無音圏のセツナ", "そこにいなかった刺客",
    ],
    elemental_bastion: [
      "五色門アレフ", "炎も潮も通さぬ白壁", "雷を接地する鎧", "毒を花に変える盾", "氷鏡の防人",
      "呪い返しの七枚壁", "酸雨を飲む城", "夜明けを拒む砦", "光を折る黒盾", "地脈まといの騎士",
      "嵐止めの重鎧", "刃雨を流す水城", "夢さえ通れぬ門", "十五属性の番人", "魔力を食べる石像",
      "火水無傷のバルク", "空色の防壁ミナト", "攻撃だけが消える部屋", "五芒封じのグリッド", "世界を拒む小盾",
    ],
    doomsday_engine: [
      "終鐘砲ガルガン", "三歩遅れて来る落雷", "世界割りの一発屋", "葬列砲塔モルグ", "構えだけで夜になる",
      "火口を向ける巨砲", "星落としの旧兵器", "引き金を待つ棺", "城ごと狙う大弓", "発射前だけ静かな王",
      "月面砕きカノープス", "終末を装填する者", "一射のための心臓", "地平線へ向く砲口", "撃てば自分も消える槍",
      "鐘が二度鳴るまで", "最後の火薬庫", "天井を狙う破城弓", "百年溜めた一撃", "不発なら眠る神",
    ],
  };
  Object.entries(peakyNamesByProfile).forEach(([profile, names]) => {
    const targets = monsters.filter((monster) => monster.peakyProfile === profile)
      .sort((left, right) => left.floors[0] - right.floors[0] || left.migratedFromArenaRank - right.migratedFromArenaRank);
    if (targets.length !== names.length) throw new Error(`${profile}の名称数が不一致です`);
    targets.forEach((monster, index) => renameMonster(monster, names[index], `元闘士・${profile}`));
  });

  // 残る50体は固有異能の規則を主役にする。日用品ギャグではなく、遭遇を想像できる異名に絞る。
  const singularNames = [
    "逆拍心臓のラズ", "七歩目を忘れる巡礼", "傷写しの鏡騎士", "午睡雷のテト", "骨笛の税吏",
    "影の替え玉師", "昨日を食らう時計獣", "無音拍手の道化", "さびない血の剣士", "空席冠の王",
    "三秒先の墓守", "涙数えの剣", "六日目の呪い", "片翼迷路の番人", "敗者だけの凱旋",
    "呼吸鎧ガスパル", "名無しの追撃者", "百年早い別れ鐘", "毒見星の占い師", "帰路を閉じる鍵",
    "夢利息の取り立て屋", "骨董戦鬼ジジ", "逆さ虹の牙", "沈黙を産む喉", "十二番目の影",
    "勝敗保留の審判", "空腹の方位磁針", "死者だけの近道", "燃える雪解け", "敗北収集家コレト",
    "拍を外す神罰", "右手だけの嵐", "死因未記入の亡者", "二度目の初対面", "床下の太陽",
    "出口を忘れた鍵", "心音の密輸人", "明日を質に入れる者", "傷口の多数決", "透明な大行列",
    "最期だけ早口の預言者", "死者の予習", "血潮の砂時計", "敵意を育てる盆栽", "反省する雷雲",
    "半分だけ来た終末", "眠れないヒツギ", "勝者不在の決闘", "余命の切り売り", "世界の留守番",
  ];
  const singularTargets = monsters.filter((monster) => monster.singularTrait)
    .sort((left, right) => left.floors[0] - right.floors[0] || left.migratedFromArenaRank - right.migratedFromArenaRank);
  if (singularTargets.length !== singularNames.length) throw new Error("固有異能個体の名称数が不一致です");
  singularTargets.forEach((monster, index) => {
    const traitName = monster.singularTrait.name;
    const displayName = singularNames[index];
    renameMonster(monster, displayName, "元闘士・固有異能");
    if (monster.dangerous?.telegraph) {
      monster.dangerous.telegraph = monster.dangerous.telegraph
        .split(`固有異能「${displayName}」`).join(`固有異能「${traitName}」`);
    }
    if (monster.research?.[1]) {
      monster.research[1] = monster.research[1]
        .split(`異能則「${displayName}」`).join(`異能則「${traitName}」`);
    }
  });

  // 物語型200体は、同じ十人の名前を二十系統へ横展開せず、個体の願い・遺品・秘密を一行へ凝縮する。
  const dungeonCoreOrder = ["adel", "bisque", "ciela", "doma", "enigma", "fio", "grave", "hakua", "iris", "juno"];
  const narrativeNamesByLineage = {
    cinder_scribe: [
      "灰暦の番人トルカ", "焼け残りの一ページ", "すす文字を食べるメル", "終章だけ白い書記", "火葬史家ヴァレン",
      "炎で昨日を写すノア", "消し炭の年代記", "千炉筆のフェル", "焼け跡を読むリゼ", "自分の死を書いたユノ",
    ],
    sunken_bell: [
      "沈み町の時報マレイ", "水底鐘ガラベル", "鳴らない青銅セト", "潮時を数えるローデ", "溺れ声のネフ",
      "鐘腹に町を抱くティノ", "最後の一打ベルク", "泡音の葬送者", "満潮だけ鳴くエラ", "岸を知らないモナ",
    ],
    storm_fox: [
      "雷巣のライカ", "稲妻飼いピノ", "焦げ尾のキサ", "雲を駆け下りるトト", "雷鳴が止むと死ぬルクス",
      "青火花のハロ", "九尾避雷針ジン", "空を噛むミナ", "天走りカイ", "最後の雷を抱くソラ",
    ],
    venom_queen: [
      "枯れ庭の女王サーヤ", "蜜毒師ベル", "朝露を守るリリカ", "花粉宮のドロテ", "毒だけで咲くムウ",
      "琥珀種のネネ", "亡花ロザ", "王蜜の香り", "庭園葬シェラ", "一輪を夢見るアマネ",
    ],
    winter_child: [
      "春探しのイルマ", "溶けない押し花コル", "白息のミア", "雪原歩きネーヴェ", "春を聞いただけのフユ",
      "氷童レナ", "温もりを忘れるウル", "記憶雪", "凍花守キオ", "最初の雪解けエル",
    ],
    name_grave: [
      "空欄墓のアロ", "遺言埋めビタ", "墓文字のセナ", "名なし道モルト", "自分を葬るナム",
      "碑石書きフィネ", "三度目を待つグラフ", "名無しの墓帳", "名削りイサ", "空欄の主ジュラ",
    ],
    rust_rain: [
      "緑雨のサビナ", "歯車拾いルスト", "工具箱のペトラ", "溶け都のガラン", "最後のネジを探すロア",
      "穴あき時計ニケ", "赤さび匠クロム", "触れたものを失う雨", "完成しないミル", "無傷の歯車トナ",
    ],
    shadow_thief: [
      "影なしノル", "黒手袋のシグ", "輪郭泥棒レムナ", "月影売りカゲロ", "持ち主を探す影ネイ",
      "盗品王ログ", "夜盗ヴェル", "影絵の空席", "黒月抜きサヤ", "帰路を盗んだクウ",
    ],
    false_sun: [
      "空知らずのアーク", "片翼ルーチェ", "偽陽裁きセラ", "白昼告解ハルド", "太陽を疑うソル",
      "地下天使レム", "落ち翼アベル", "まぶしい罪", "光告げイオ", "本物の空を待つカナン",
    ],
    mountain_sleeper: [
      "眠らぬ峰オウガ", "小石持ちドロム", "山夢のネムル", "地層番ガン", "寝返り山ミネ",
      "峰名付けイワネ", "崩れぬボウ", "背中の山脈", "万岳のラガ", "故郷を握るコル",
    ],
    wind_merchant: [
      "帰れぬ北風トラム", "追い風売りフウ", "風見盤ベル", "売れ残りの帰路ミチル", "風値札のソウ",
      "迷い風ハタ", "千路の旅商", "宛先なしの風便", "針なし風見リン", "故郷便ロロ",
    ],
    key_smith: [
      "扉なしの鍵匠トルク", "錠前師ビット", "千鍵炉のカギロ", "鍵穴歩きロード", "ノックしても開かない",
      "折れ鍵ミント", "胸中扉のロック", "どこにも合わない鍵", "万錠打ちカンナ", "最後の鍵エマ",
    ],
    dream_reverse: [
      "夢裏歩きノク", "捨て夢拾いビビ", "笑わないピエロ", "逆夢のマロ", "観客席のエニ",
      "悪夢名付けフィグ", "目覚めない道化グリム", "白紙の観客", "夢幕引きイム", "仮面贈りユメ",
    ],
    moon_scar: [
      "月欠け追いツルギ", "刃なしサビア", "夜明け前のアカリ", "月影返しレン", "円月問いルナト",
      "折れ刃キリ", "師斬りガイ", "月面の一閃", "逆手月イズナ", "空サヤのトウカ",
    ],
    wall_talker: [
      "北壁耳のゴルム", "城門抱きブリク", "拳語りガンザ", "がれき返しモン", "壁声のバウ",
      "城名付けタイル", "落城巨兵ドン", "遺言レンガ", "城壁話者グロウ", "小さなちょうつがいヒンジ",
    ],
    fifteen_choir: [
      "欠声アルト", "遺言歌ソプラ", "黙る第七声", "迷い歌リト", "最後の一声コーダ",
      "無音譜ネウマ", "十四人の合唱体", "空席のハミング", "片手指揮タクト", "第十五声カノン",
    ],
    yesterday_clock: [
      "逆秒針ノース", "昨日瓶トキ", "巻き戻らないゼンマイ", "今日を組むデイ", "最初の昨日イツ",
      "今日名付けナウ", "後悔時計クロク", "書く前へ戻る手紙", "左回りのレフ", "違う今日を待つチク",
    ],
    scream_cook: [
      "弱火の悲鳴ボンゴ", "味覚なしのミーミ", "絶叫鍋", "恐怖の食べ残し", "究極を知らない料理長",
      "割れ皿ポロ", "二度煮えコック・ガロ", "最後の晩餐は無味", "逆手おたまチャチャ", "勇気スープのニコ",
    ],
    afterlife_clerk: [
      "あの世北支局ルド", "遺言瓶・受理済み", "夜明け前窓口メイ", "死亡届返送係ハン", "死因欄のモズ",
      "名無し受付", "二度死に臨時職員", "宛名不明につき返送", "逆手印のトウ", "永遠の整理券ヨミ",
    ],
    bone_gardener: [
      "北庭のコツ", "骨花リリボン", "土なし鉢のホネラ", "白骨根ネグ", "最初の骨カルシ",
      "咲かぬ庭ハナ", "墓土庭師グロウ", "宛名骨", "白骨刈りセツ", "一夜花ボナ",
    ],
  };
  Object.entries(narrativeNamesByLineage).forEach(([lineage, names]) => {
    if (names.length !== dungeonCoreOrder.length) throw new Error(`${lineage}の物語名が10体分ありません`);
    dungeonCoreOrder.forEach((core, index) => {
      renameById(`dungeon_unique_${lineage}_${core}`, names[index], `個体史・${lineage}`);
    });
  });

  // 盗賊系は「金色＋種族」ではなく、盗み方と逃げ方が伝わる通り名にする。
  applyExactNames([
    ["coin_snatcher_imp", "銅貨鳴らしの小鬼"],
    ["purse_cutting_marten", "帯切りテン"],
    ["silver_mist_bandit", "銀霧の財布屋"],
    ["tax_collector_wraith", "死人税の取り立て霊"],
    ["vault_boring_mole", "金庫穴モグラ"],
    ["gilded_shadow_fox", "金影の化けギツネ"],
    ["abyssal_pickpocket", "奈落ポケット"],
    ["world_coffer_eater", "世界の財布を食うもの"],
  ], "希少盗賊");

  // 最上位四種族は色階級の言い換えをやめ、成長段階ごとの神話と役割を持たせる。
  applyExactNames([
    ["apex_elf_1", "木漏れ日の追跡者"],
    ["apex_elf_2", "雨葉の弓姫セイラ"],
    ["apex_elf_3", "風根のドルイド"],
    ["apex_elf_4", "千枝門の守人"],
    ["apex_elf_5", "狩月の森王"],
    ["apex_elf_6", "古樹と話すアストラ"],
    ["apex_elf_7", "世界樹の記憶ミレニア"],
    ["apex_dragon_1", "すす黒の若竜"],
    ["apex_dragon_2", "海割り翼竜ネレウス"],
    ["apex_dragon_3", "山脈を歩く地竜"],
    ["apex_dragon_4", "雷冠竜ヴァジュラ"],
    ["apex_dragon_5", "火口を背負う古竜"],
    ["apex_dragon_6", "星墓の邪竜アバドン"],
    ["apex_dragon_7", "最初の竜オリジン"],
    ["apex_demon_1", "契り火の小悪魔"],
    ["apex_demon_2", "夢を買う青魔"],
    ["apex_demon_3", "毒庭の魔将"],
    ["apex_demon_4", "黄金契約王マモン"],
    ["apex_demon_5", "紅蓮の執行者"],
    ["apex_demon_6", "七罪公アスタロト"],
    ["apex_demon_7", "虹界魔王パンデモニア"],
    ["apex_angel_1", "迷い羽の使徒"],
    ["apex_angel_2", "天歌の奏使"],
    ["apex_angel_3", "風環の守護天使"],
    ["apex_angel_4", "日輪の審判者"],
    ["apex_angel_5", "血涙の戦天使"],
    ["apex_angel_6", "星を焼くセラフ"],
    ["apex_angel_7", "創世環メタトロン"],
  ], "最上位神話種");

  DATA.monsterNameAtlas = {
    edition: "2026-07-16 high-quality rewrite",
    renamedIds,
    abyssRegionNames,
    arenaNamesByAttribute,
    peakyNamesByProfile,
    singularNames,
    narrativeNamesByLineage,
  };
})();
