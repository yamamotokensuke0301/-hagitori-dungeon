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
  };

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

  window.HD_CHARACTER = { STAT_KEYS, buildBaseStats, preview, levelBonuses };
})();
