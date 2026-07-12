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
const FLOOR_SAMPLES = [5, 10, 20, 40, 60, 80, 100];
const SLOT_ORDER = ["weapon", "upper", "lower", "feet", "accessory", "accessory"];
const STARTER_IDS = {
  swordsman: "rusty_knife", hunter: "starter_hunter_bow", archer: "starter_archer_bow",
  mage: "starter_mage_wand", spellblade: "starter_spellblade", researcher: "starter_researcher_probe",
  heavy: "starter_heavy_maul", tourist: "starter_tourist_camera", psychic: "starter_psychic_focus",
  scavenger: "starter_scavenger_gauntlet", handyman: "starter_handyman_tool", priest: "starter_priest_censer",
  ninja: "starter_ninja_kunai", flower_tamer: "starter_flower_scepter", capoeirista: "starter_capoeira_wraps",
};

function clamp(value, minimum, maximum) { return Math.max(minimum, Math.min(maximum, value)); }
function randomInt(minimum, maximum) { return minimum + Math.floor(Math.random() * (maximum - minimum + 1)); }
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
    return [equipment[STARTER_IDS[job.id]], equipment.cloth].filter((item) => item && item.jobs?.includes(job.id));
  }
  const candidates = availableEquipment(job.id, floor);
  const selected = [];
  SLOT_ORDER.forEach((slot) => {
    const actualSlot = slot === "accessory" ? "accessory" : slot;
    const pool = candidates.filter((item) => item.slot === actualSlot && !selected.includes(item));
    pool.sort((left, right) => equipmentScore(right, floor) - equipmentScore(left, floor));
    const index = gearMode === "best" ? 0
      : gearMode === "sampled" ? Math.floor(Math.random() * Math.max(1, Math.ceil(pool.length * 0.25)))
        : Math.min(pool.length - 1, Math.floor(pool.length * 0.2));
    if (pool[index]) selected.push(pool[index]);
  });
  if (!selected.some((item) => item.slot === "weapon") && equipment[STARTER_IDS[job.id]]) selected.push(equipment[STARTER_IDS[job.id]]);
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
    resistances: Object.fromEntries(DATA.attributes.map((id) => [id, Number(race.resistances?.[id] || 0)])),
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
      stats.resistances[id] = value === "immune" || stats.resistances[id] === "immune" ? "immune" : clamp(Number(stats.resistances[id] || 0) + Number(value || 0), -4, 5);
    });
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
    if (Math.random() > clamp(stats.accuracy - Number(enemy.evasion || 0), 0.1, 0.98)) continue;
    let raw = randomInt(stats.attackMin, stats.attackMax);
    if (Math.random() < stats.crit) raw = Math.round(raw * 1.5);
    const best = Math.max(...stats.attributes.map((attribute) => {
      const weak = enemy.weaknesses?.includes(attribute) ? 1.35 : 1;
      const multiplier = resistanceMultiplier(enemy.resistances?.[attribute] || 0);
      return multiplier === 0 ? 0 : Math.max(1, Math.round(Math.max(1, raw * weak - Number(enemy.defense || 0)) * multiplier));
    }));
    total += best;
  }
  return total;
}

function enemyHitDamage(stats, enemy) {
  const attribute = enemy.attackAttribute;
  const multiplier = resistanceMultiplier(stats.resistances[attribute] || 0);
  if (multiplier === 0) return 0;
  const trials = Math.max(1, Math.min(4, Number(enemy.dragonBreath?.trials || 1)));
  let total = 0;
  for (let trial = 0; trial < trials; trial += 1) {
    const accuracy = clamp(0.68 + Number(enemy.attack || 1) * 0.006 + (enemy.unique ? 0.04 : 0) - stats.evasion, 0.1, 0.96);
    if (Math.random() > accuracy) continue;
    let raw = randomInt(Math.max(1, Number(enemy.attack || 1) - 2), Number(enemy.attack || 1) + 2);
    if (Math.random() < (enemy.unique ? 0.1 : 0.05)) raw = Math.round(raw * 1.5);
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
  const turnLimit = Number(options.turnLimit || 200);
  for (let turn = 1; turn <= turnLimit; turn += 1) {
    const burden = Math.min(30, Math.floor(Math.max(0, elixirs * 8 - stats.materialCapacity) / stats.materialBurdenStep));
    const playerActions = 1 + Math.floor(Math.max(0, stats.acceleration - burden) / 10);
    for (let action = 0; action < playerActions && enemyHp > 0; action += 1) {
      if (elixirs > 0 && playerHp <= stats.maxHp * 0.55) {
        playerHp = stats.maxHp;
        elixirs -= 1;
      } else enemyHp -= playerHitDamage(stats, sourceEnemy);
    }
    if (enemyHp <= 0) return { won: true, turns: turn, damageTaken, remainingHp: playerHp, elixirs };
    if (sourceEnemy.elixirAttrition && turn % sourceEnemy.elixirAttrition.every === 0) {
      const damage = Math.ceil(stats.maxHp * sourceEnemy.elixirAttrition.ratio);
      playerHp -= damage;
      damageTaken += damage;
    }
    const enemyActions = 1 + Math.floor(Math.max(0, Number(sourceEnemy.acceleration || 0)) / 12);
    for (let action = 0; action < enemyActions && playerHp > 0; action += 1) {
      const damage = enemyHitDamage(stats, sourceEnemy);
      playerHp -= damage;
      damageTaken += damage;
    }
    if (playerHp <= 0) return { won: false, turns: turn, damageTaken, remainingHp: 0 };
    if (sourceEnemy.rapidRegeneration && !options.regenerationControlled) enemyHp = Math.min(enemyMaxHp, enemyHp + Math.max(1, Math.ceil(enemyMaxHp * Number(sourceEnemy.rapidRegeneration.rate || 0))));
    if (stats.hpRegen > 0) playerHp = Math.min(stats.maxHp, playerHp + stats.hpRegen);
  }
  return { won: false, turns: turnLimit, damageTaken, remainingHp: playerHp, elixirs, timeout: true };
}

function simulate(job, floor, enemy) {
  const level = Math.min(100, Math.max(1, Math.round(3 + floor * 0.75)));
  const stats = playerStats(job, level, floor);
  let wins = 0;
  let timeouts = 0;
  let turns = 0;
  let damage = 0;
  for (let run = 0; run < RUNS; run += 1) {
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
  const profiles = Array.from({ length: gearMode === "sampled" ? 25 : 1 }, () => playerStats(job, level, floor, gearMode));
  for (let run = 0; run < BOSS_RUNS; run += 1) {
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
  const profiles = Array.from({ length: gearMode === "sampled" ? 25 : 1 }, () => playerStats(job, level, floor, gearMode));
  let clears = 0;
  let rounds = 0;
  for (let run = 0; run < ARENA_RUNS; run += 1) {
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
function preparedBossSimulation(job, elixirs) {
  const profiles = Array.from({ length: 25 }, () => playerStats(job, 78, 100, "sampled"));
  let wins = 0;
  let turns = 0;
  let used = 0;
  for (let run = 0; run < BOSS_RUNS; run += 1) {
    const result = duel(profiles[run % profiles.length], monsters.dungeon_lord_nox, undefined, { elixirs, regenerationControlled: true, turnLimit: 1200 });
    if (result.won) wins += 1;
    turns += result.turns;
    used += elixirs - Number(result.elixirs || 0);
  }
  return { job: job.name, elixirs, winRate: wins / BOSS_RUNS, turns: turns / BOSS_RUNS, used: used / BOSS_RUNS };
}
const preparedBossResults = DATA.jobs.flatMap((job) => [8, 16, 32, 50].map((count) => preparedBossSimulation(job, count)));
const arenaResults = DATA.jobs.flatMap((job) => [20, 50, 100].map((floor) => arenaSimulation(job, floor, "sampled")));

const lines = [
  `combat simulation: ${RUNS} runs/matchup; human + ordinary; optimistic balanced equipment available by depth`,
  "floor,type,enemy,job,level,win%,avgTurns,avgDamage,actions,timeout%",
];
if (DETAILED_OUTPUT) results.forEach((result) => lines.push([
  result.floor, result.unique ? "unique" : "normal", result.enemy, result.job, result.level,
  (result.winRate * 100).toFixed(1), result.turns.toFixed(2), result.damage.toFixed(1), result.actions,
  (result.timeoutRate * 100).toFixed(1),
].join(",")));
lines.push("", `LAST BOSS (${BOSS_RUNS} runs, level 78)`, "gear,job,win%,avgTurns,timeout%");
bossResults.forEach((result) => lines.push([result.gearMode, result.job, (result.winRate * 100).toFixed(2), result.turns.toFixed(2), (result.timeoutRate * 100).toFixed(2)].join(",")));
lines.push("", "LAST BOSS WITH ELIXIRS (sampled gear, regeneration counter maintained)", "job,carried,win%,avgTurns,avgUsed");
preparedBossResults.forEach((result) => lines.push([result.job, result.elixirs, (result.winRate * 100).toFixed(2), result.turns.toFixed(2), result.used.toFixed(2)].join(",")));
lines.push("", `ARENA 100 CONTINUOUS WINS (${ARENA_RUNS} runs, no between-round full heal)`, "floor,level,job,clear%,avgRound");
arenaResults.forEach((result) => lines.push([result.floor, result.level, result.job, (result.clearRate * 100).toFixed(2), result.averageRound.toFixed(2)].join(",")));
const output = `${lines.join("\n")}\n`;
const outputPath = "/tmp/hagitori-combat-balance.csv";
$(output).writeToFileAtomicallyEncodingError(outputPath, true, $.NSUTF8StringEncoding, null);
outputPath;
