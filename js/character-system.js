(function () {
  "use strict";

  const STAT_KEYS = ["strength", "speed", "dexterity", "durability", "luck"];
  const JOB_GROWTH_ORDERS = {
    swordsman: ["strength", "durability", "dexterity", "speed", "luck"],
    heavy: ["strength", "durability", "strength", "durability", "luck"],
    hunter: ["dexterity", "speed", "luck", "strength", "durability"],
    archer: ["dexterity", "speed", "strength", "luck", "durability"],
    mage: ["dexterity", "luck", "speed", "durability", "strength"],
    spellblade: ["strength", "dexterity", "speed", "durability", "luck"],
    researcher: ["dexterity", "luck", "durability", "speed", "strength"],
    tourist: ["luck", "durability", "speed", "dexterity", "strength"],
    psychic: ["dexterity", "luck", "speed", "durability", "strength"],
    scavenger: ["durability", "strength", "speed", "luck", "dexterity"],
    handyman: ["speed", "dexterity", "luck", "strength", "durability"],
    priest: ["luck", "durability", "dexterity", "luck", "speed"],
    ninja: ["speed", "dexterity", "speed", "strength", "luck"],
    flower_tamer: ["luck", "dexterity", "speed", "luck", "durability"],
  };
  const BACKSTORY_ORIGINS = Object.freeze({
    human: "街道沿いの小さな宿場町",
    elf: "古樹の根が絡み合う森の集落",
    dwarf: "槌音の絶えない山腹の鍛冶都市",
    angel: "雲海を見下ろす白い神殿",
    demon: "火山灰が降る魔界との境界",
    ghost: "名も残らない古戦場の墓標",
    fairy: "燐光茸に囲まれた妖精の隠れ里",
    high_elf: "千年樹の冠に築かれたハイエルフの都",
    superhuman: "限界を越える者だけが集う高峰の修練城",
    slime: "捨てられた錬金釜の底に残った一滴",
  });
  const BACKSTORY_TRAITS = Object.freeze({
    ordinary: "目立つことはなくても、毎日の務めを投げ出さない子だった",
    lewd: "好奇心と欲望に正直で、禁じられた話ほど確かめずにはいられなかった",
    lazy: "昼寝と遠回りを好み、必要な時だけ驚くほどしぶとさを見せる子だった",
    gentle: "傷ついた者や魔物にまで手を差し伸べる子だった",
    brave: "危険を見ると誰より先に一歩を踏み出す子だった",
    careful: "石橋を叩き、地図の余白まで確かめる子だった",
    quick: "考えるより先に身体が動き、追いつける者は少なかった",
    skillful: "壊れた道具を直し、細かな仕掛けを見抜くのが得意だった",
    lucky: "不思議な偶然に何度も救われ、運命を信じて育った",
    stubborn: "一度決めたことは嵐の夜でも曲げない子だった",
    hasty: "待つことが苦手で、失敗さえ次の一歩に変える子だった",
    calm: "騒ぎの中でも声を荒らげず、周囲をよく観察する子だった",
    whimsical: "昨日と今日で夢が変わり、誰にも行き先を読ませない子だった",
  });
  const BACKSTORY_INCIDENTS = Object.freeze([
    "幼い日に迷い込んだ地下蔵で、壁の向こうから剥ぎ取り歌を聞いた",
    "旅商人が持ち込んだ名もない魔物の骨を見て、迷宮の外にも世界が続くと知った",
    "村を襲った小さな魔物を偶然退け、その遺体から暮らしを救う素材を得た",
    "行方不明になった友の古い地図を受け取り、地図の最深部に自分の名を見つけた",
    "夢の中で百階の扉を数え、最後の扉だけが開かないまま目を覚ました",
    "冒険者の葬列に立ち会い、残された記録をいつか完成させると誓った",
  ]);
  const BACKSTORY_KEEPSAKES = Object.freeze([
    "欠けた方位磁針", "古い宿帳の一頁", "煤けた銀貨", "誰かの名前が刻まれた小刀",
    "色褪せた組紐", "読めない文字の護符", "片方だけの手袋", "小さな空の薬瓶",
  ]);

  function mergeStats(a, b) {
    return Object.fromEntries(STAT_KEYS.map((key) => [key, Number(a?.[key] || 0) + Number(b?.[key] || 0)]));
  }

  function buildBaseStats(race, job, personality) {
    const merged = mergeStats(mergeStats(race.stats, job.stats), personality.stats);
    return { ...merged, maxHp: Math.max(1, job.hp + Math.max(0, merged.durability) * 3 + Math.min(0, merged.durability) * 2) };
  }

  function preview(data, raceId, jobId, personalityId) {
    const race = data.races.find((item) => item.id === raceId) || data.races[0];
    const job = data.jobs.find((item) => item.id === jobId) || data.jobs[0];
    const personality = data.personalities.find((item) => item.id === personalityId) || data.personalities[0];
    return buildBaseStats(race, job, personality);
  }

  function levelBonuses(data, level, jobId, personalityId) {
    const order = JOB_GROWTH_ORDERS[jobId] || JOB_GROWTH_ORDERS.swordsman;
    const bonuses = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));
    for (let gainedLevel = 2; gainedLevel <= level; gainedLevel += 1) bonuses[order[(gainedLevel - 2) % order.length]] += 1;
    const personality = data.personalities.find((item) => item.id === personalityId) || data.personalities[0];
    const growth = personality.growth;
    for (let gainedLevel = 2, bonusIndex = 0; gainedLevel <= level; gainedLevel += 1) {
      if (gainedLevel % growth.every !== 0) continue;
      bonuses[growth.order[bonusIndex % growth.order.length]] += 1;
      bonusIndex += 1;
    }
    return bonuses;
  }

  function backstoryHash(text) {
    return [...String(text || "")]
      .reduce((hash, character) => ((hash * 33) ^ character.charCodeAt(0)) >>> 0, 2166136261);
  }

  function generateBackstory({ name, race, personality } = {}) {
    const adventurerName = String(name || "たかし").trim().slice(0, 12) || "たかし";
    const safeRace = race || { id: "human", name: "人間" };
    const safePersonality = personality || { id: "gentle", name: "おだやか" };
    const seed = backstoryHash(`${adventurerName}:${safeRace.id}:${safePersonality.id}`);
    const origin = BACKSTORY_ORIGINS[safeRace.id] || `${safeRace.name}たちが暮らす辺境の集落`;
    const trait = BACKSTORY_TRAITS[safePersonality.id] || `${safePersonality.name}な気質で周囲に知られていた`;
    const incident = BACKSTORY_INCIDENTS[seed % BACKSTORY_INCIDENTS.length];
    const keepsake = BACKSTORY_KEEPSAKES[Math.floor(seed / BACKSTORY_INCIDENTS.length) % BACKSTORY_KEEPSAKES.length];
    return `${adventurerName}は${origin}で生まれた${safeRace.name}。${trait}。${incident}ことをきっかけに、迷宮へ向かう決意を固めた。旅立ちの日から「${keepsake}」を肌身離さず持っている。`;
  }

  window.HD_CHARACTER = { STAT_KEYS, buildBaseStats, preview, levelBonuses, generateBackstory };
})();
