ObjC.import("Foundation");

function read(path) {
  return ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(path, $.NSUTF8StringEncoding, null));
}

var window = { HD_DATA: {} };
[
  "data/materials.js", "data/races.js", "data/jobs.js", "data/personalities.js",
  "data/equipment.js", "data/treasures.js", "data/monsters.js", "data/floors.js",
  "js/character-system.js",
].forEach((path) => eval(read(path)));

const DATA = window.HD_DATA;
const CHARACTER = window.HD_CHARACTER;
const RUNS = 600;
const BOSS_RUNS = 500;
const ARENA_RUNS = 100;
const DETAILED_OUTPUT = false;
const RANDOM_SEED = 0x5eed350;
const FLOOR_SAMPLES = [5, 10, 20, 40, 60, 80, 100];
const SLOT_ORDER = ["weapon", "upper", "lower", "feet", "accessory", "accessory"];
const STARTER_WEAPON_IDS = {
  swordsman: "starter_swordsman_blade", hunter: "starter_hunter_knife", archer: "starter_archer_bow",
  mage: "starter_mage_wand", spellblade: "starter_spellblade", researcher: "starter_researcher_probe",
  heavy: "starter_heavy_maul", tourist: "starter_tourist_camera", psychic: "starter_psychic_focus",
  scavenger: "starter_scavenger_gauntlet", handyman: "starter_handyman_tool", priest: "starter_priest_censer",
  ninja: "starter_ninja_kunai", flower_tamer: "starter_flower_scepter", capoeirista: null,
};

function clamp(value, minimum, maximum) { return Math.max(minimum, Math.min(maximum, value)); }
let rngState = RANDOM_SEED;
function seedFor(label) {
  let hash = (2166136261 ^ RANDOM_SEED) >>> 0;
  [...String(label)].forEach((character) => {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  });
  return hash || RANDOM_SEED;
}
function setRandomSeed(seed) { rngState = Number(seed || RANDOM_SEED) >>> 0; }
function random() {
  let value = rngState >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  rngState = value >>> 0;
  return rngState / 4294967296;
}
function randomInt(minimum, maximum) { return minimum + Math.floor(random() * (maximum - minimum + 1)); }
function unique(values) { return [...new Set(values)]; }
function byId(values) { return Object.fromEntries(values.map((value) => [value.id, value])); }
const equipment = byId(DATA.equipment);
const monsters = byId(DATA.monsters);
const races = byId(DATA.races);
const personalities = byId(DATA.personalities);

function equipmentScore(item, floor) {
  const resistance = Object.values(item.resistances || {}).reduce((sum, value) => sum + (value === "immune" ? 8 : Number(value || 0)), 0);
  const depthFit = Number(item.shopMinFloor || 1) <= floor ? 0 : -100000;
  return depthFit + Number(item.attack || 0) * 2.2 + Number(item.defense || 0) * 1.7
    + Number(item.acceleration || 0) * 1.5 + Number(item.hpRegen || 0) * 2.5 + resistance;
}

function availableEquipment(jobId, floor) {
  return DATA.equipment.filter((item) => (
    item.jobs?.includes(jobId)
    && !item.artifact
    && !item.guildCost
    && !item.masterOnly
    && !item.completionOnly
    && Number(item.shopMinFloor || 1) <= floor
  ));
}

function selectLoadout(job, floor, gearMode = "field") {
  if (gearMode === "starter") {
    const starterIds = [
      STARTER_WEAPON_IDS[job.id],
      "cloth",
      job.id === "capoeirista" ? "starter_capoeira_wraps" : null,
      "garm_fireguard",
    ];
    return starterIds.map((id) => equipment[id]).filter((item) => item && item.jobs?.includes(job.id));
  }
  const candidates = availableEquipment(job.id, floor);
  const selected = [];
  SLOT_ORDER.forEach((slot) => {
    const actualSlot = slot === "accessory" ? "accessory" : slot;
    const pool = candidates.filter((item) => item.slot === actualSlot && !selected.includes(item));
    pool.sort((left, right) => equipmentScore(right, floor) - equipmentScore(left, floor));
    const index = gearMode === "best" ? 0
      : gearMode === "sampled" ? Math.floor(random() * Math.max(1, Math.ceil(pool.length * 0.25)))
        : Math.min(pool.length - 1, Math.floor(pool.length * 0.2));
    if (pool[index]) selected.push(pool[index]);
  });
  if (!selected.some((item) => item.slot === "weapon") && equipment[STARTER_WEAPON_IDS[job.id]]) selected.push(equipment[STARTER_WEAPON_IDS[job.id]]);
  return selected;
}

function playerStats(job, level, floor, gearMode = "field") {
  const race = races.human;
  const personality = personalities.ordinary || DATA.personalities[0];
  const base = CHARACTER.buildBaseStats(race, job, personality);
  const growth = CHARACTER.levelBonuses(DATA, level, job.id, personality.id);
  const grown = { ...base };
  ["strength", "speed", "dexterity", "durability", "luck"].forEach((key) => { grown[key] = Number(base[key] || 0) + Number(growth[key] || 0); });
  const loadout = selectLoadout(job, floor, gearMode);
  const weapon = loadout.find((item) => item.slot === "weapon") || null;
  const attributes = unique(loadout.flatMap((item) => item.attackAttributes || (item.attributeAttack ? [item.attributeAttack] : [])));
  const stats = {
    maxHp: base.maxHp + (level - 1) * 3,
    defense: Math.max(0, job.defense + Math.floor(grown.durability / 2) + Math.floor((level - 1) / 10)),
    acceleration: Number(race.acceleration || 0) + Number(job.acceleration || 0)
      + (job.accelerationGrowthEvery ? Math.floor((level - 1) / job.accelerationGrowthEvery) : 0),
    hpRegen: 0,
    attackTrials: Math.max(1, Math.min(9, job.combat.attackTrials + Math.floor(grown.speed / 4))),
    attackMin: Math.max(1, job.combat.attackMin + Math.floor(grown.strength / 2) + Math.floor((level - 1) / 5) + (weapon ? Math.floor(Number(weapon.attack || 0) / 2) : 0)),
    attackMax: Math.max(1, job.combat.attackMax + grown.strength + Math.floor((level - 1) / 3) + (weapon ? Number(weapon.attack || 0) : 0)),
    accuracy: clamp(job.combat.accuracy + grown.dexterity * 0.018 + grown.speed * 0.008 + grown.luck * 0.004, 0.1, 0.96),
    evasion: clamp(job.combat.evasion + grown.speed * 0.015 + grown.dexterity * 0.006, 0.01, 0.38),
    crit: clamp(job.combat.crit + grown.luck * 0.012 + grown.dexterity * 0.006, 0, 0.38),
    attributes: attributes.length ? attributes : [job.baseAttackAttribute],
    materialCapacity: Number(job.materialCapacity || 30),
    materialBurdenStep: Number(job.materialBurdenStep || 15),
    resistances: Object.fromEntries(DATA.attributes.map((id) => [id, race.resistances?.[id] === "immune" ? "immune" : Number(race.resistances?.[id] || 0)])),
    loadout: loadout.map((item) => item.name),
  };
  loadout.forEach((item) => {
    stats.defense += Number(item.defense || 0);
    stats.acceleration += Number(item.acceleration || 0);
    stats.hpRegen += Number(item.hpRegen || 0);
    if (item.slot !== "weapon") {
      stats.attackMin += Math.floor(Number(item.attack || 0) / 2);
      stats.attackMax += Number(item.attack || 0);
    }
    Object.entries(item.resistances || {}).forEach(([id, value]) => {
      stats.resistances[id] = value === "immune" || stats.resistances[id] === "immune"
        ? "immune"
        : Number(stats.resistances[id] || 0) + Number(value || 0);
    });
  });
  DATA.attributes.forEach((id) => {
    if (stats.resistances[id] !== "immune") stats.resistances[id] = clamp(Number(stats.resistances[id] || 0), -4, 5);
  });
  return stats;
}

function representative(floor, uniqueMonster) {
  const floorData = DATA.floors.find((entry) => entry.floor === floor);
  const ids = uniqueMonster ? floorData.uniques : floorData.monsterPool;
  const candidates = unique(ids).map((id) => monsters[id]).filter(Boolean);
  if (!candidates.length) return null;
  candidates.sort((left, right) => Number(left.threatScore || left.threatRank || 0) - Number(right.threatScore || right.threatRank || 0));
  return candidates[Math.floor(candidates.length / 2)];
}

function resistanceMultiplier(value) {
  if (value === "immune") return 0;
  return Number(DATA.resistanceMultipliers[value] ?? 1);
}

function playerHitDamage(stats, enemy) {
  let total = 0;
  for (let trial = 0; trial < stats.attackTrials; trial += 1) {
    if (random() > clamp(stats.accuracy - Number(enemy.evasion || 0), 0.1, 0.98)) continue;
    let raw = randomInt(stats.attackMin, stats.attackMax);
    if (random() < stats.crit) raw = Math.round(raw * 1.5);
    const best = Math.max(...stats.attributes.map((attribute) => {
      const weak = enemy.weaknesses?.includes(attribute) ? 1.35 : 1;
      const multiplier = resistanceMultiplier(enemy.resistances?.[attribute] || 0);
      return multiplier === 0 ? 0 : Math.max(1, Math.round(Math.max(1, raw * weak - Number(enemy.defense || 0)) * multiplier));
    }));
    total += best;
  }
  return total;
}

function enemyNativeFloor(enemy) {
  if (enemy.arenaOnly && Number.isFinite(Number(enemy.arenaRank))) return clamp(Math.floor(Number(enemy.arenaRank)), 1, 100);
  return Math.min(...(enemy.floors?.length ? enemy.floors : [100]));
}

function enemyAttackAttributePool(enemy) {
  const nativeFloor = enemyNativeFloor(enemy);
  const strong = nativeFloor >= 25 || enemy.unique || Number(enemy.colorTierIndex || 0) >= 4;
  if (!strong) return [enemy.attackAttribute];
  const desiredSize = clamp(2 + Math.floor(nativeFloor / 25) + Math.floor(Number(enemy.colorTierIndex || 0) / 2), 2, 7);
  const seed = [...String(enemy.id || enemy.name)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const pool = [enemy.attackAttribute, enemy.dangerous?.attribute].filter(Boolean);
  for (let index = 0; pool.length < desiredSize && index < DATA.attributes.length * 2; index += 1) {
    const candidate = DATA.attributes[(seed + index * 7 + nativeFloor) % DATA.attributes.length];
    if (!pool.includes(candidate)) pool.push(candidate);
  }
  return pool;
}

function enemyTacticalIntelligence(enemy) {
  const nativeFloor = enemyNativeFloor(enemy);
  if (!enemy.unique || nativeFloor < 20) return 0;
  const style = { scholar: 0.38, oracle: 0.38, regal: 0.22, trickster: 0.18, warrior: 0.08, silent: 0.1, zealot: 0.05, feral: 0 }[enemy.uniqueStyle] || 0;
  const species = { elf: 0.22, demon: 0.2, angel: 0.24, construct: 0.12, aberration: 0.14, warrior: 0.08 }[enemy.speciesId] || 0;
  return clamp(0.08 + style + species + Math.min(0.24, nativeFloor / 420) + Number(enemy.colorTierIndex || 0) * 0.035, 0, 0.9);
}

function chooseEnemyAttribute(stats, enemy, combatState, preferred) {
  const pool = enemyAttackAttributePool(enemy).slice();
  if (preferred && !pool.includes(preferred)) pool.unshift(preferred);
  let selected;
  if (enemyTacticalIntelligence(enemy) > 0 && random() < enemyTacticalIntelligence(enemy)) {
    const resistanceScore = (attribute) => stats.resistances[attribute] === "immune" ? 99 : Number(stats.resistances[attribute] || 0);
    const weakest = Math.min(...pool.map(resistanceScore));
    const candidates = pool.filter((attribute) => resistanceScore(attribute) === weakest);
    selected = candidates[Math.floor(random() * candidates.length)];
  } else {
    const previousIndex = Math.max(-1, pool.indexOf(combatState.lastAttackAttribute));
    selected = pool[(previousIndex + 1) % pool.length];
  }
  combatState.lastAttackAttribute = selected;
  return selected || preferred || enemy.attackAttribute;
}

function enemyHitDamage(stats, enemy, options = {}) {
  const attribute = options.attribute || enemy.attackAttribute;
  const basePower = Math.max(1, Number(options.power || enemy.attack || 1));
  const multiplier = resistanceMultiplier(stats.resistances[attribute] || 0);
  if (multiplier === 0) return 0;
  const trials = Math.max(1, Math.min(4, Math.floor(Number(options.trials || 1))));
  let total = 0;
  for (let trial = 0; trial < trials; trial += 1) {
    const accuracy = clamp(0.68 + basePower * 0.006 + (enemy.unique ? 0.04 : 0) + Number(options.hitBonus || 0) - stats.evasion, 0.1, 0.96);
    if (random() > accuracy) continue;
    let raw = randomInt(Math.max(1, basePower - 2), basePower + 2);
    if (random() < Number(options.critChance ?? (enemy.unique ? 0.1 : 0.05))) raw = Math.round(raw * 1.5);
    total += Math.max(1, Math.round(Math.max(1, raw - stats.defense) * multiplier));
  }
  return total;
}

function duel(stats, sourceEnemy, startingHp = stats.maxHp, options = {}) {
  let playerHp = Math.min(stats.maxHp, startingHp);
  let enemyHp = Number(sourceEnemy.hp || 1);
  const enemyMaxHp = enemyHp;
  let damageTaken = 0;
  let elixirs = Math.max(0, Number(options.elixirs || 0));
  let enemyActionCount = 0;
  let attritionRecoveryDebt = 0;
  let telegraphed = false;
  let telegraphedAttribute = null;
  const enemyCombatState = { lastAttackAttribute: null };
  const turnLimit = Number(options.turnLimit || 200);
  for (let turn = 1; turn <= turnLimit; turn += 1) {
    const burden = Math.min(30, Math.floor(Math.max(0, elixirs * 8 - stats.materialCapacity) / stats.materialBurdenStep));
    const playerActions = 1 + Math.floor(Math.max(0, stats.acceleration - burden) / 10);
    for (let action = 0; action < playerActions && enemyHp > 0; action += 1) {
      if (elixirs > 0 && playerHp <= stats.maxHp * 0.55) {
        playerHp = stats.maxHp;
        attritionRecoveryDebt = 0;
        elixirs -= 1;
      } else enemyHp -= playerHitDamage(stats, sourceEnemy);
    }
    if (enemyHp <= 0) return { won: true, turns: turn, damageTaken, remainingHp: playerHp, remainingElixirs: elixirs };
    const enemyActions = 1 + Math.floor(Math.max(0, Number(sourceEnemy.acceleration || 0)) / 12);
    for (let action = 0; action < enemyActions && playerHp > 0; action += 1) {
      enemyActionCount += 1;
      const attritionEvery = Math.max(1, Math.floor(Number(sourceEnemy.elixirAttrition?.every || 0)));
      if (sourceEnemy.elixirAttrition && enemyActionCount % attritionEvery === 0) {
        const attritionDamage = Math.ceil(stats.maxHp * sourceEnemy.elixirAttrition.ratio);
        playerHp -= attritionDamage;
        attritionRecoveryDebt = Math.min(stats.maxHp, attritionRecoveryDebt + attritionDamage);
        damageTaken += attritionDamage;
        if (playerHp <= 0) break;
      }
      if (telegraphed && sourceEnemy.dangerous) {
        telegraphed = false;
        const damage = enemyHitDamage(stats, sourceEnemy, {
          attribute: telegraphedAttribute || chooseEnemyAttribute(stats, sourceEnemy, enemyCombatState, sourceEnemy.dangerous.attribute),
          power: sourceEnemy.dangerous.power,
          trials: sourceEnemy.dragonBreath?.trials || 1,
          hitBonus: 0.08,
          critChance: 0.1,
        });
        telegraphedAttribute = null;
        playerHp -= damage;
        damageTaken += damage;
        continue;
      }
      if (sourceEnemy.dangerous && enemyActionCount % Math.max(1, Number(sourceEnemy.dangerous.every || 1)) === 0) {
        telegraphed = true;
        telegraphedAttribute = chooseEnemyAttribute(stats, sourceEnemy, enemyCombatState, sourceEnemy.dangerous.attribute);
        break;
      }
      const damage = enemyHitDamage(stats, sourceEnemy, {
        attribute: chooseEnemyAttribute(stats, sourceEnemy, enemyCombatState, sourceEnemy.attackAttribute),
      });
      playerHp -= damage;
      damageTaken += damage;
    }
    if (playerHp <= 0) return { won: false, turns: turn, damageTaken, remainingHp: 0, remainingElixirs: elixirs };
    if (sourceEnemy.rapidRegeneration && !options.regenerationControlled) enemyHp = Math.min(enemyMaxHp, enemyHp + Math.max(1, Math.ceil(enemyMaxHp * Number(sourceEnemy.rapidRegeneration.rate || 0))));
    if (stats.hpRegen > 0) playerHp = Math.min(Math.max(0, stats.maxHp - attritionRecoveryDebt), playerHp + stats.hpRegen);
  }
  return { won: false, turns: turnLimit, damageTaken, remainingHp: playerHp, remainingElixirs: elixirs, timeout: true };
}

function simulate(job, floor, enemy) {
  const level = Math.min(100, Math.max(1, Math.round(3 + floor * 0.75)));
  setRandomSeed(seedFor(`floor-profile:${job.id}:${floor}:${enemy.id}`));
  const stats = playerStats(job, level, floor);
  let wins = 0;
  let timeouts = 0;
  let turns = 0;
  let damage = 0;
  for (let run = 0; run < RUNS; run += 1) {
    setRandomSeed(seedFor(`floor-combat:${job.id}:${floor}:${enemy.id}:${run}`));
    const result = duel(stats, enemy);
    if (result.won) wins += 1;
    if (result.timeout) timeouts += 1;
    turns += result.turns;
    damage += result.damageTaken;
  }
  return {
    job: job.name, floor, level, enemy: enemy.name, unique: Boolean(enemy.unique),
    winRate: wins / RUNS, timeoutRate: timeouts / RUNS,
    turns: turns / RUNS, damage: damage / RUNS,
    actions: 1 + Math.floor(Math.max(0, stats.acceleration) / 10),
  };
}

const results = [];
if (DETAILED_OUTPUT) DATA.jobs.forEach((job) => FLOOR_SAMPLES.forEach((floor) => {
  [false, true].forEach((uniqueMonster) => {
    const enemy = representative(floor, uniqueMonster);
    if (enemy) results.push(simulate(job, floor, enemy));
  });
}));

function bossSimulation(job, gearMode) {
  const floor = 100;
  const level = 78;
  const boss = monsters.dungeon_lord_nox;
  let wins = 0;
  let turns = 0;
  let timeouts = 0;
  setRandomSeed(seedFor(`boss-profiles:${job.id}:${gearMode}`));
  const profiles = Array.from({ length: gearMode === "sampled" ? 25 : 1 }, () => playerStats(job, level, floor, gearMode));
  for (let run = 0; run < BOSS_RUNS; run += 1) {
    setRandomSeed(seedFor(`boss-combat:${job.id}:${gearMode}:${run}`));
    const stats = profiles[run % profiles.length];
    const result = duel(stats, boss);
    if (result.won) wins += 1;
    if (result.timeout) timeouts += 1;
    turns += result.turns;
  }
  return { job: job.name, gearMode, winRate: wins / BOSS_RUNS, turns: turns / BOSS_RUNS, timeoutRate: timeouts / BOSS_RUNS };
}

const arenaRoster = DATA.monsters.filter((monster) => monster.arenaOnly).sort((a, b) => a.arenaRank - b.arenaRank);
function arenaSimulation(job, floor, gearMode) {
  const level = Math.min(100, Math.max(1, Math.round(3 + floor * 0.75)));
  setRandomSeed(seedFor(`arena-profiles:${job.id}:${floor}:${gearMode}`));
  const profiles = Array.from({ length: gearMode === "sampled" ? 25 : 1 }, () => playerStats(job, level, floor, gearMode));
  let clears = 0;
  let rounds = 0;
  for (let run = 0; run < ARENA_RUNS; run += 1) {
    setRandomSeed(seedFor(`arena-combat:${job.id}:${floor}:${gearMode}:${run}`));
    const stats = profiles[run % profiles.length];
    let hp = stats.maxHp;
    let cleared = 0;
    for (const enemy of arenaRoster) {
      const result = duel(stats, enemy, hp);
      if (!result.won) break;
      hp = result.remainingHp;
      cleared += 1;
    }
    rounds += cleared;
    if (cleared === arenaRoster.length) clears += 1;
  }
  return { job: job.name, floor, level, gearMode, clearRate: clears / ARENA_RUNS, averageRound: rounds / ARENA_RUNS };
}

const bossResults = DATA.jobs.flatMap((job) => ["starter", "sampled", "best"].map((gearMode) => bossSimulation(job, gearMode)));
function preparedBossSimulation(job, elixirs, profiles) {
  let wins = 0;
  let turns = 0;
  let used = 0;
  for (let run = 0; run < BOSS_RUNS; run += 1) {
    // All elixir counts start each paired run from the same combat RNG stream.
    setRandomSeed(seedFor(`prepared-boss-combat:${job.id}:${run}`));
    const result = duel(profiles[run % profiles.length], monsters.dungeon_lord_nox, undefined, { elixirs, regenerationControlled: true, turnLimit: 1200 });
    if (result.won) wins += 1;
    turns += result.turns;
    used += elixirs - Number(result.remainingElixirs ?? elixirs);
  }
  return { job: job.name, elixirs, winRate: wins / BOSS_RUNS, turns: turns / BOSS_RUNS, used: used / BOSS_RUNS };
}
const preparedBossResults = DATA.jobs.flatMap((job) => {
  setRandomSeed(seedFor(`prepared-boss-profiles:${job.id}`));
  const pairedProfiles = Array.from({ length: 25 }, () => playerStats(job, 78, 100, "sampled"));
  return [10, 30, 50].map((count) => preparedBossSimulation(job, count, pairedProfiles));
});
const arenaResults = DATA.jobs.flatMap((job) => [20, 50, 100].map((floor) => arenaSimulation(job, floor, "sampled")));

const lines = [
  `combat simulation: ${RUNS} runs/matchup; deterministic seed 0x${RANDOM_SEED.toString(16)}; human + ordinary; optimistic balanced equipment available by depth`,
  "WARNING: coarse combat estimator only; win rates are not predictions of full game outcomes.",
  "WARNING: normal attacks, dangerous-technique telegraphs/releases, tactical multi-attribute selection, action-based erosion, and erosion recovery debt are simulated.",
  "WARNING: ordinary deep-enemy runtime specials, summons/minion attacks, and spatial movement are not simulated; the final boss explicitly has no automatic special.",
  "WARNING: job skills, learned spells, healing skills, player time stop, sleep ambushes, flower pets, and arena line-of-sight/obstacles are not simulated.",
  "WARNING: prepared-boss runs assume all eligible deep uniques were defeated beforehand and rapid regeneration is continuously suppressed; summon casts/minions and the required suppression attacks are not modelled.",
  "WARNING: 10/30/50 use identical paired gear profiles and per-run RNG seeds.",
  "",
  "floor,type,enemy,job,level,win%,avgTurns,avgDamage,actions,timeout%",
];
if (DETAILED_OUTPUT) results.forEach((result) => lines.push([
  result.floor, result.unique ? "unique" : "normal", result.enemy, result.job, result.level,
  (result.winRate * 100).toFixed(1), result.turns.toFixed(2), result.damage.toFixed(1), result.actions,
  (result.timeoutRate * 100).toFixed(1),
].join(",")));
lines.push("", `LAST BOSS (${BOSS_RUNS} runs, level 78)`, "gear,job,win%,avgTurns,timeout%");
bossResults.forEach((result) => lines.push([result.gearMode, result.job, (result.winRate * 100).toFixed(2), result.turns.toFixed(2), (result.timeoutRate * 100).toFixed(2)].join(",")));
lines.push("", "LAST BOSS WITH ELIXIRS SUMMARY (15-job mean)", "carried,win%,avgTurns,avgUsed");
[10, 30, 50].forEach((carried) => {
  const group = preparedBossResults.filter((result) => result.elixirs === carried);
  const average = (key) => group.reduce((sum, result) => sum + result[key], 0) / Math.max(1, group.length);
  lines.push([carried, (average("winRate") * 100).toFixed(2), average("turns").toFixed(2), average("used").toFixed(2)].join(","));
});
lines.push("", "LAST BOSS WITH ELIXIRS (sampled gear, rapid regeneration assumed suppressed)", "job,carried,win%,avgTurns,avgUsed");
preparedBossResults.forEach((result) => lines.push([result.job, result.elixirs, (result.winRate * 100).toFixed(2), result.turns.toFixed(2), result.used.toFixed(2)].join(",")));
lines.push("", `ARENA 100 CONTINUOUS WINS (${ARENA_RUNS} runs, no between-round full heal)`, "floor,level,job,clear%,avgRound");
arenaResults.forEach((result) => lines.push([result.floor, result.level, result.job, (result.clearRate * 100).toFixed(2), result.averageRound.toFixed(2)].join(",")));
const output = `${lines.join("\n")}\n`;
const outputPath = "/tmp/hagitori-combat-balance.csv";
$(output).writeToFileAtomicallyEncodingError(outputPath, true, $.NSUTF8StringEncoding, null);
outputPath;
