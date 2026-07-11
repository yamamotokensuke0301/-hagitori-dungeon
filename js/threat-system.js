(function () {
  "use strict";

  const LEVELS = Object.freeze([
    Object.freeze({ level: 1, label: "平静" }),
    Object.freeze({ level: 2, label: "不穏" }),
    Object.freeze({ level: 3, label: "緊迫" }),
    Object.freeze({ level: 4, label: "死線" }),
    Object.freeze({ level: 5, label: "破局" }),
  ]);
  const LEVEL_THRESHOLDS = Object.freeze([1.16, 1.7, 2.55, 3.6]);
  const baselineCache = new Map();

  function resistanceWeight(value) {
    if (value === "immune") return 6;
    return Math.max(0, Number(value || 0));
  }

  function score(monster) {
    if (!monster) return 1;
    const hp = Math.max(1, Number(monster.maxHp || monster.hp || 1));
    const attack = Math.max(0, Number(monster.attack || 0));
    const defense = Math.max(0, Number(monster.defense || 0));
    const acceleration = Math.max(0, Number(monster.acceleration || 0));
    const dangerousPressure = monster.dangerous
      ? Math.max(0, Number(monster.dangerous.power || 0)) / Math.max(1, Number(monster.dangerous.every || 1))
      : 0;
    const resistanceTotal = Object.values(monster.resistances || {}).reduce((sum, value) => sum + resistanceWeight(value), 0);
    return Math.max(1,
      hp * 0.42
      + attack * 5.4
      + defense * 3.8
      + acceleration * 2.4
      + dangerousPressure * 2.6
      + resistanceTotal * 1.5);
  }

  function baseline(data, floor) {
    if (!floor) return 1;
    if (baselineCache.has(floor.floor)) return baselineCache.get(floor.floor);
    const monsters = Object.fromEntries(data.monsters.map((monster) => [monster.id, monster]));
    const scores = (floor.monsterPool || []).map((id) => score(monsters[id])).filter(Number.isFinite);
    const reference = Math.max(1, ...scores);
    baselineCache.set(floor.floor, reference);
    return reference;
  }

  function runtimeMultiplier(enemy, canSeeInvisible) {
    let multiplier = 1;
    if (enemy.unique) multiplier *= 1.08;
    if (enemy.floorGuardian) multiplier *= 1.18;
    if (enemy.summon) multiplier *= 1.18;
    if (enemy.invisible && !canSeeInvisible && !enemy.revealed) multiplier *= 1.06;
    if (enemy.specialAttack === "time_stop") multiplier *= 1.32;
    else if (enemy.specialAttack) multiplier *= 1.12;
    return multiplier;
  }

  function minimumThreatRatio(enemy) {
    if (enemy.id === "dungeon_lord_nox" && enemy.floorGuardian) return 3.72;
    if (enemy.floorGuardian) return 2.62;
    if (enemy.specialAttack === "time_stop") return 1.75;
    if (enemy.unique) return 1.22;
    return 0;
  }

  function assess(data, floor, dungeon, canSeeInvisible = false) {
    const reference = baseline(data, floor);
    const threats = (dungeon?.enemies || [])
      .filter((enemy) => enemy.alive !== false && Number(enemy.hp || 0) > 0)
      .map((enemy) => ({
        enemy,
        ratio: Math.max(
          minimumThreatRatio(enemy),
          (score(enemy) * runtimeMultiplier(enemy, canSeeInvisible)) / reference,
        ),
      }))
      .sort((left, right) => right.ratio - left.ratio);
    const peakRatio = threats[0]?.ratio || 1;
    const supportingPressure = threats.slice(1, 4)
      .reduce((sum, threat) => sum + Math.max(0, threat.ratio - 1) * 0.13, 0);
    const strongCount = threats.filter((threat) => threat.ratio >= LEVEL_THRESHOLDS[0]).length;
    const densityPressure = Math.min(0.5, strongCount * 0.06);
    const pressure = peakRatio + supportingPressure + densityPressure;
    const level = pressure >= LEVEL_THRESHOLDS[3] ? 5
      : pressure >= LEVEL_THRESHOLDS[2] ? 4
        : pressure >= LEVEL_THRESHOLDS[1] ? 3
          : pressure >= LEVEL_THRESHOLDS[0] ? 2 : 1;
    return Object.freeze({
      ...LEVELS[level - 1],
      pressure: Math.round(pressure * 100) / 100,
      peakRatio: Math.round(peakRatio * 100) / 100,
      strongCount,
      baseline: Math.round(reference),
      strongestId: threats[0]?.enemy.id || null,
      strongestName: threats[0]?.enemy.name || null,
    });
  }

  window.HD_THREAT = Object.freeze({ LEVELS, score, baseline, assess });
})();
