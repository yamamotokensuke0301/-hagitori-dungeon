(function () {
  "use strict";

  // Random artifacts are intentionally much rarer than the fixed artifact catalogue.
  const BASE_DROP_CHANCE = 0.0001;
  const MAX_DROP_CHANCE = 0.00025;
  const QUALITY = Object.freeze([
    { id: "odd", label: "異物", tier: "joke", power: 3, guildPoints: 8 },
    { id: "scarred", label: "傷物", tier: "trash", power: 7, guildPoints: 16 },
    { id: "rare", label: "稀少", tier: "ordinary", power: 13, guildPoints: 38 },
    { id: "relic", label: "至宝", tier: "useful", power: 22, guildPoints: 88 },
    { id: "mythic", label: "神話", tier: "cheat", power: 36, guildPoints: 220 },
  ]);
  const SLOT_NOUNS = Object.freeze({
    weapon: ["剣", "槍", "杖", "斧", "環刃"],
    upper: ["外套", "鎧", "法衣", "胸甲", "仮面"],
    lower: ["脚甲", "腰鎧", "戦袴", "鱗衣", "裙甲"],
    feet: ["長靴", "足甲", "踏破靴", "翼靴", "星靴"],
    accessory: ["指環", "首飾り", "護符", "冠", "宝珠"],
  });
  const QUALITY_PREFIXES = Object.freeze([
    ["歪んだ", "笑う", "名もなき", "逆さの"],
    ["罅割れた", "血錆びた", "忘られた", "泣き濡れた"],
    ["星刻の", "月影の", "古王の", "幽玄の"],
    ["天穿つ", "界渡りの", "永劫の", "神喰らいの"],
    ["創世の", "終焉告げる", "理外の", "万象砕く"],
  ]);
  const CURSE_NAMES = Object.freeze([
    ["重い執着", "帰れぬ足", "鈍る魂"],
    ["血の代価", "星喰い", "命削り"],
    ["王の嫉妬", "奈落の徴税", "終わらぬ飢え"],
  ]);

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
  const pick = (rng, items) => items[Math.floor(rng() * items.length)];

  function dropChance(depth) {
    const ratio = clamp((Number(depth || 1) - 1) / 99, 0, 1);
    return BASE_DROP_CHANCE + (MAX_DROP_CHANCE - BASE_DROP_CHANCE) * ratio;
  }

  function qualityIndex(depth, rng) {
    const depthPower = clamp((Number(depth || 1) - 1) / 99, 0, 1) * 3;
    return clamp(Math.floor(depthPower + rng() * 2), 0, QUALITY.length - 1);
  }

  function distinctPicks(rng, items, count) {
    const pool = [...new Set(items)];
    const picked = [];
    while (pool.length && picked.length < count) {
      picked.push(pool.splice(rand(rng, 0, pool.length - 1), 1)[0]);
    }
    return picked;
  }

  function curseFor(rng, quality) {
    if (rng() >= 0.76) return null;
    const severity = clamp(quality + 1 + (rng() < 0.35 ? 1 : 0), 1, 5);
    const penaltyKind = pick(rng, ["attack", "defense", "acceleration", "maxHp", "hpRegen"]);
    const scale = { attack: 1, defense: 1, acceleration: 1, maxHp: 2.4, hpRegen: 0.45 }[penaltyKind];
    const amount = -Math.max(1, Math.round(scale * severity * (quality + 1) / 2));
    const names = CURSE_NAMES[Math.min(CURSE_NAMES.length - 1, Math.floor((severity - 1) / 2))];
    return {
      id: `random_curse_${penaltyKind}_${severity}`,
      name: pick(rng, names),
      severity,
      penalties: { [penaltyKind]: amount },
      description: "力を引き出す代わりに、装備者へ消えない代価を求める。",
    };
  }

  function generate({ depth, serial, attributes, jobs, rng = Math.random }) {
    const quality = qualityIndex(depth, rng);
    const profile = QUALITY[quality];
    const slot = pick(rng, Object.keys(SLOT_NOUNS));
    const weaponAttributeCount = 1
      + Number(quality >= 2 && rng() < 0.48)
      + Number(quality >= 4 && rng() < 0.32);
    const attributeCount = slot === "weapon"
      ? weaponAttributeCount
      : Number(quality >= 3 && rng() < (quality >= 4 ? 0.3 : 0.15));
    const attackAttributes = distinctPicks(rng, attributes, attributeCount);
    const resistanceAttributes = distinctPicks(rng, attributes.filter((id) => !attackAttributes.includes(id)), 1 + Number(quality >= 3 && rng() < 0.5));
    const curse = curseFor(rng, quality);
    const variance = rand(rng, 0, Math.max(2, Math.round(profile.power * 0.35)));
    const power = Math.round((profile.power + variance) * (curse ? 1.22 : 1));
    const slotAttackRatio = slot === "weapon" ? 1.35 : slot === "accessory" ? 0.38 : 0.2;
    const slotDefenseRatio = slot === "upper" || slot === "lower" ? 1.12 : slot === "feet" ? 0.58 : 0.32;
    const attack = Math.max(0, Math.round(power * slotAttackRatio));
    const defense = Math.max(0, Math.round(power * slotDefenseRatio));
    const acceleration = Math.max(0, Math.round(slot === "feet" ? power * 0.82 : (quality + 1) * 1.6 + rng() * 4));
    const hpRegen = quality >= 3 && rng() < 0.4 ? Math.min(12, (quality - 1) * 2) : 0;
    const resistances = Object.fromEntries(resistanceAttributes.map((id) => [id, clamp(1 + Math.floor(quality / 2), 1, 4)]));
    const primaryAttribute = attackAttributes[0] || null;
    const nameAttribute = primaryAttribute || resistanceAttributes[0];
    const serialNumber = Math.max(1, Math.floor(Number(serial || 1)));
    const serialText = String(serialNumber).padStart(4, "0");
    const prefix = pick(rng, QUALITY_PREFIXES[quality]);
    const noun = pick(rng, SLOT_NOUNS[slot]);
    const attributeName = (window.HD_DATA?.attributeLabels || {})[nameAttribute] || nameAttribute || "無相";
    return {
      id: `random_artifact_${serialText}`,
      name: `${prefix}${attributeName}${noun}・${serialText}`,
      slot,
      attack,
      defense,
      acceleration,
      hpRegen,
      attributeAttack: primaryAttribute,
      attackAttributes,
      resistances,
      jobs: jobs.slice(),
      recipe: null,
      artifact: {
        tier: profile.tier,
        label: `ランダム生成・${profile.label}`,
        guildPoints: profile.guildPoints + Math.round(power * 1.8),
        chestOnly: true,
        random: true,
        quality,
        depth: clamp(Math.floor(Number(depth || 1)), 1, 100),
      },
      curse,
      description: `B${clamp(Math.floor(Number(depth || 1)), 1, 100)}Fの迷宮魔力が偶然結晶化した一点物。同じ性能の品は二度と生成されない。`,
    };
  }

  function isValid(item, attributes, jobIds) {
    if (!item || typeof item !== "object" || !/^random_artifact_\d+$/.test(String(item.id || ""))) return false;
    if (!Object.prototype.hasOwnProperty.call(SLOT_NOUNS, item.slot) || !item.artifact?.random) return false;
    if (!Array.isArray(item.jobs) || !item.jobs.length || item.jobs.some((id) => !jobIds.includes(id))) return false;
    if (!Array.isArray(item.attackAttributes) || item.attackAttributes.length > 3 || new Set(item.attackAttributes).size !== item.attackAttributes.length || item.attackAttributes.some((id) => !attributes.includes(id))) return false;
    if (item.attributeAttack !== (item.attackAttributes[0] || null)) return false;
    const boundedInteger = (value, min, max) => Number.isInteger(Number(value)) && Number(value) >= min && Number(value) <= max;
    if (!boundedInteger(item.attack, 0, 85) || !boundedInteger(item.defense, 0, 70)
      || !boundedInteger(item.acceleration, 0, 50) || !boundedInteger(item.hpRegen, 0, 15)) return false;
    const resistanceEntries = Object.entries(item.resistances || {});
    if (resistanceEntries.length > 2 || resistanceEntries.some(([id, value]) => !attributes.includes(id) || !boundedInteger(value, 1, 4))) return false;
    const quality = Number(item.artifact.quality);
    const profile = QUALITY[quality];
    if (!profile || item.artifact.tier !== profile.tier || item.artifact.label !== `ランダム生成・${profile.label}`) return false;
    if (!boundedInteger(item.artifact.depth, 1, 100) || !boundedInteger(item.artifact.guildPoints, 1, 500)) return false;
    if (item.curse) {
      const penalties = Object.entries(item.curse.penalties || {});
      const allowedPenaltyKeys = ["attack", "defense", "acceleration", "maxHp", "hpRegen"];
      if (!boundedInteger(item.curse.severity, 1, 5) || penalties.length !== 1
        || penalties.some(([key, value]) => !allowedPenaltyKeys.includes(key) || !boundedInteger(value, -100, -1))) return false;
    }
    return typeof item.name === "string" && item.name.length > 0 && item.name.length <= 80
      && typeof item.description === "string" && item.description.length <= 300;
  }

  window.HD_ARTIFACTS = Object.freeze({
    BASE_DROP_CHANCE,
    MAX_DROP_CHANCE,
    QUALITY,
    dropChance,
    qualityIndex,
    generate,
    isValid,
  });
})();
