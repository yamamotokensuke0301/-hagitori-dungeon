(function () {
  "use strict";

  const SAVE_KEY = "hagitori-dungeon-save-v1";
  const AUDIO_KEY = "hagitori-audio-enabled-v4";
  const APP_VERSION = "Prototype 3.5.0";
  const DEVELOPER_MODE_ENABLED = /^(localhost|127\.0\.0\.1|\[?::1\]?)$/.test(String(window.location?.hostname || ""))
    && /(?:^|[?&])debug=1(?:&|$)/.test(String(window.location?.search || ""));
  const MAP_SIZE_RANGE = Object.freeze([36, 60]);
  const VIEW_SIZE = 13;
  const MAX_FLOOR = 100;
  const MAX_LEVEL = 100;
  const MAX_RESEARCH_LEVEL = 5;
  const RESEARCH_SCHEMA_VERSION = 2;
  const ECONOMY_SCHEMA_VERSION = 2;
  const PROGRESSION_SCHEMA_VERSION = 2;
  const MUSIC_VOLUME = 0.56;
  const MAGIC_JOB_IDS = new Set(["mage", "spellblade"]);
  const PROTECTED_EQUIPMENT_IDS = new Set(["rusty_knife", "cloth"]);
  const RESEARCH_PAGE_SIZE = 30;
  const LOG_HISTORY_LIMIT = 60;
  const INN_COST = 10;
  const DRINK_COST = 1;
  const DRUNKEN_FIST_POWER = 3.6;
  const RISQUE_SYNERGY_PER_ITEM = Object.freeze({ strength: 6, speed: 6, dexterity: 8, durability: 6, luck: 12, acceleration: 18 });
  const RECOVERY_MEDICINE = Object.freeze({ id: "recovery_medicine", name: "エリクサー", guildCost: 320, junkTokenCost: 7200, healRatio: 1, weight: 8 });
  const START_GUIDANCE = "まずはギルドにいけ。受付で冒険の基本と最初の方針を確かめろ。";
  const SAITAMA_ONE_PUNCH_CHANCE = 0.08;
  const RIMURU_FLOOR_WIPE_CHANCE = 0.025;
  const RIMURU_SLIME_STAT_BONUS = 150;
  const RIMURU_SLIME_HP_BONUS = 1000;
  const RIMURU_SLIME_ACCELERATION_BONUS = 120;
  const SCAVENGER_EFFECTIVE_NUTRITION_CAP = 1600;
  const TRAP_FLOOR_CHANCE = 0.42;
  const TRAP_COUNT_MULTIPLIER = 4;
  const FIXED_ARTIFACT_CHEST_CHANCE = 0.01;
  const VAULT_FIXED_ARTIFACT_CHANCE = 0.05;
  const VAULT_LEGEND_JUNK_CHANCE = 0.008;
  const TRAP_TYPE_LABELS = Object.freeze({ damage: "床罠", drain: "吸精罠", slow: "鈍化罠", bear: "トラバサミ", teleport: "強制転移罠", summon: "召喚罠", scatter: "罠バラまき罠" });
  const TRAP_DANGER_LABELS = Object.freeze(["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"]);
  const TRAP_JOB_DISARM_BONUSES = Object.freeze({ hunter: 0.34, handyman: 0.24, researcher: 0.06 });
  const TRAP_PERSONALITY_DISARM_BONUSES = Object.freeze({
    ordinary: 0.02, lewd: 0.01, lazy: -0.08, gentle: 0, brave: -0.04,
    careful: 0.09, quick: -0.03, skillful: 0.11, lucky: 0.04, stubborn: -0.05,
    hasty: -0.09, calm: 0.06, whimsical: 0.01,
  });
  const TRAP_RACE_DISARM_BONUSES = Object.freeze({
    dwarf: 0.05, fairy: 0.04, android: 0.07, cyborg: 0.06, insectoid: 0.05,
    golem: 0.03, machine: 0.08, high_elf: 0.06, superhuman: 0.05, slime: -0.08,
  });
  const MONSTER_SLEEP_CHANCE = 0.14;
  const UNIQUE_SLEEP_CHANCE = 0.05;
  const THIEF_SLEEP_AMBUSH_MULTIPLIER = 3;
  const FLOWER_TAMER_CONFIG = Object.freeze({
    baseCharmChance: 0.055, skillBonus: 0.32, luckFactor: 0.0035, dexterityFactor: 0.002,
    levelFactor: 0.0018, weakenedBonus: 0.2, colorPenalty: 0.018, uniqueMultiplier: 0.25,
    normalChanceRange: [0.015, 0.48], uniqueChanceRange: [0.005, 0.16],
    basePetLimit: 2, petLimitEvery: 15, maxPetLimit: 5,
    baseDuration: 7, luckDurationEvery: 3, levelDurationEvery: 6, maxDuration: 24,
    hpDecayRate: 0.08,
  });
  const EXCEPTIONAL_LOOT_CONFIG = Object.freeze({
    superChance: 0.015, ultraChance: 0.0015, skillfulMultiplier: 2,
    uniqueMultiplier: 1.5, colorStep: 0.2, maxLuckBonus: 0.5, luckDivisor: 200,
  });
  const PHASING_UNIQUE_ATTRIBUTES = Object.freeze(["dark", "curse", "illusion"]);
  const DUNGEON_LIGHT_RADIUS = Object.freeze({ near: 2.25, mid: 4.6 });
  const EMPTY_TELEPORT_COOLDOWNS = Object.freeze({ long: 0 });
  const RESEARCH_LEVEL_LABELS = Object.freeze(["未解析", "目撃", "能力判明", "特性判明", "素材判明", "完全解析"]);
  const SPECIAL_ATTACK_LABELS = Object.freeze({
    ranged: "遠隔攻撃",
    drain: "経験値吸収",
    knockback: "吹き飛ばし",
    self_destruct: "自爆",
    debuff: "能力低下",
    devour: "素材・遺体捕食",
    time_stop: "時間停止",
    gold_steal: "所持金強奪・逃走転移",
  });
  const EQUIPMENT_ROLES = Object.freeze({
    basic: { label: "基礎装備", short: "基礎" },
    specialized: { label: "特化装備", short: "特化" },
    conditional: { label: "条件装備", short: "条件" },
    core: { label: "ビルド中核装備", short: "中核" },
    novelty: { label: "珍品", short: "珍品" },
    final: { label: "最終候補", short: "最終" },
  });
  const INN_CONTENT = window.HD_INN_CONTENT;
  let recentInnAdviceIndexes = [];
  let tavernSnackMenu = [];
  const DATA = window.HD_DATA;
  const SURREAL = window.HD_SURREAL;
  SURREAL?.decorateData(DATA);
  const ATTRIBUTE_IDS_BY_LABEL = Object.freeze(Object.fromEntries(
    Object.entries(DATA.attributeLabels).map(([id, label]) => [label, id]),
  ));
  const ATTRIBUTE_LABEL_PATTERN = new RegExp(
    Object.keys(ATTRIBUTE_IDS_BY_LABEL)
      .sort((left, right) => right.length - left.length)
      .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|"),
    "g",
  );
  const ECONOMY = window.HD_ECONOMY;
  const CHARACTER = window.HD_CHARACTER;
  const BOUNTY = window.HD_BOUNTY;
  const SFX = window.HD_SFX;
  const ARTIFACTS = window.HD_ARTIFACTS;
  const UNIQUE_DIALOGUE = window.HD_UNIQUE_DIALOGUE;
  const THREAT = window.HD_THREAT;
  const {
    byId, clamp, rand, pick, escapeHtml, chebyshevDistance, hasLineOfSight: gridLineOfSight,
  } = window.HD_UTILS;
  const BGM_TRACKS = {
    town: "./assets/audio/town-bgm.wav?v=20260711-studio2",
    dungeon: "./assets/audio/dungeon-bgm.wav?v=20260711-studio2",
    deep: "./assets/audio/deep-bgm.wav?v=20260711-studio2",
    abyss: "./assets/audio/abyss-bgm.wav?v=20260711-studio2",
    battle: "./assets/audio/battle-bgm.wav?v=20260711-studio2",
    boss: "./assets/audio/boss-bgm.wav?v=20260711-studio2",
    tension2: "./assets/audio/tension-2-bgm.wav?v=20260711-tension2",
    tension3: "./assets/audio/tension-3-bgm.wav?v=20260711-tension2",
    tension4: "./assets/audio/tension-4-bgm.wav?v=20260711-tension2",
    tension5: "./assets/audio/tension-5-bgm.wav?v=20260711-tension2",
  };
  const DIRECTION_VECTORS = Object.freeze({
    north: Object.freeze([0, -1]),
    south: Object.freeze([0, 1]),
    west: Object.freeze([-1, 0]),
    east: Object.freeze([1, 0]),
    northwest: Object.freeze([-1, -1]),
    northeast: Object.freeze([1, -1]),
    southwest: Object.freeze([-1, 1]),
    southeast: Object.freeze([1, 1]),
  });
  const MOVEMENT_BUTTON_DIRECTIONS = Object.freeze({
    up: DIRECTION_VECTORS.north,
    down: DIRECTION_VECTORS.south,
    left: DIRECTION_VECTORS.west,
    right: DIRECTION_VECTORS.east,
    "up-left": DIRECTION_VECTORS.northwest,
    "up-right": DIRECTION_VECTORS.northeast,
    "down-left": DIRECTION_VECTORS.southwest,
    "down-right": DIRECTION_VECTORS.southeast,
  });
  const MOVEMENT_KEY_DIRECTIONS = Object.freeze({
    ArrowUp: DIRECTION_VECTORS.north,
    ArrowDown: DIRECTION_VECTORS.south,
    ArrowLeft: DIRECTION_VECTORS.west,
    ArrowRight: DIRECTION_VECTORS.east,
    Home: DIRECTION_VECTORS.northwest,
    PageUp: DIRECTION_VECTORS.northeast,
    End: DIRECTION_VECTORS.southwest,
    PageDown: DIRECTION_VECTORS.southeast,
    "7": DIRECTION_VECTORS.northwest,
    "8": DIRECTION_VECTORS.north,
    "9": DIRECTION_VECTORS.northeast,
    "4": DIRECTION_VECTORS.west,
    "6": DIRECTION_VECTORS.east,
    "1": DIRECTION_VECTORS.southwest,
    "2": DIRECTION_VECTORS.south,
    "3": DIRECTION_VECTORS.southeast,
    y: DIRECTION_VECTORS.northwest,
    u: DIRECTION_VECTORS.northeast,
    h: DIRECTION_VECTORS.west,
    l: DIRECTION_VECTORS.east,
    b: DIRECTION_VECTORS.southwest,
    j: DIRECTION_VECTORS.south,
    k: DIRECTION_VECTORS.north,
    n: DIRECTION_VECTORS.southeast,
  });

  const STAT_KEYS = CHARACTER.STAT_KEYS;
  const jobs = byId(DATA.jobs);
  const races = byId(DATA.races);
  const personalities = byId(DATA.personalities);
  const monsters = byId(DATA.monsters);
  const monstersBySpecies = DATA.monsters.reduce((groups, monster) => {
    if (!groups[monster.speciesId]) groups[monster.speciesId] = [];
    groups[monster.speciesId].push(monster);
    return groups;
  }, {});
  const ARENA_ROSTER = DATA.monsters.filter((monster) => monster.arenaOnly).sort((a, b) => a.arenaRank - b.arenaRank);
  const ARENA_BATTLE_COUNT = ARENA_ROSTER.length;
  const materials = byId(DATA.materials);
  const equipment = byId(DATA.equipment);
  const spells = byId(DATA.spells || []);
  const treasureItems = byId(DATA.treasureItems || []);
  const equipmentSets = byId(DATA.equipmentSets || []);
  const floorByNumber = Object.fromEntries(DATA.floors.map((floor) => [floor.floor, floor]));
  const bountyTargets = BOUNTY.targets(DATA);

  function monsterNativeFloor(monster) {
    return BOUNTY.nativeFloor(monster, MAX_FLOOR);
  }

  function bountyClaimsBeforeNext(monsterId) {
    const settled = Math.max(0, Number(state.meta.bounties[monsterId]?.claimed || 0));
    const pendingAtGuild = (state.meta.guildClaims || []).filter((claim) => claim.id === monsterId).length;
    const beingCarried = (state.adventurer.bountyCorpses || []).filter((claim) => claim.id === monsterId).length;
    return settled + pendingAtGuild + beingCarried;
  }

  function nextBountyReward(monster) {
    return BOUNTY.reward(monster, bountyClaimsBeforeNext(monster.id));
  }

  function teleportCooldowns() {
    return state.dungeon?.teleportCooldowns || EMPTY_TELEPORT_COOLDOWNS;
  }

  const els = {
    titleScreen: document.querySelector("#titleScreen"),
    titleStart: document.querySelector("#titleStartButton"),
    version: document.querySelector("#versionText"),
    app: document.querySelector("#appShell"),
    place: document.querySelector("#placeText"),
    job: document.querySelector("#jobText"),
    race: document.querySelector("#raceText"),
    hp: document.querySelector("#hpText"),
    maxHp: document.querySelector("#maxHpText"),
    level: document.querySelector("#levelText"),
    playerHpFill: document.querySelector("#playerHpFill"),
    dungeonHp: document.querySelector("#dungeonHpText"),
    dungeonMaxHp: document.querySelector("#dungeonMaxHpText"),
    dungeonHpFill: document.querySelector("#dungeonHpFill"),
    strength: document.querySelector("#strengthText"),
    speed: document.querySelector("#speedText"),
    dexterity: document.querySelector("#dexterityText"),
    durability: document.querySelector("#durabilityText"),
    luck: document.querySelector("#luckText"),
    acceleration: document.querySelector("#accelerationText"),
    gold: document.querySelector("#goldText"),
    dungeonStrength: document.querySelector("#dungeonStrengthText"),
    dungeonSpeed: document.querySelector("#dungeonSpeedText"),
    dungeonDexterity: document.querySelector("#dungeonDexterityText"),
    dungeonDurability: document.querySelector("#dungeonDurabilityText"),
    dungeonLuck: document.querySelector("#dungeonLuckText"),
    dungeonAcceleration: document.querySelector("#dungeonAccelerationText"),
    weapon: document.querySelector("#weaponText"),
    upper: document.querySelector("#upperText"),
    lower: document.querySelector("#lowerText"),
    feet: document.querySelector("#feetText"),
    accessory1: document.querySelector("#accessory1Text"),
    accessory2: document.querySelector("#accessory2Text"),
    tabs: document.querySelectorAll("[data-view]"),
    townView: document.querySelector("#townView"),
    innView: document.querySelector("#innView"),
    jobCenterView: document.querySelector("#jobCenterView"),
    dungeonView: document.querySelector("#dungeonView"),
    homeView: document.querySelector("#homeView"),
    researchView: document.querySelector("#researchView"),
    researchResultCount: document.querySelector("#researchResultCount"),
    shopView: document.querySelector("#shopView"),
    junkDealerView: document.querySelector("#junkDealerView"),
    guildView: document.querySelector("#guildView"),
    arenaView: document.querySelector("#arenaView"),
    floorName: document.querySelector("#floorNameText"),
    floor: document.querySelector("#floorText"),
    actionPace: document.querySelector("#actionPaceText"),
    map: document.querySelector("#map"),
    returnTown: document.querySelector("#returnTownButton"),
    wait: document.querySelector("#waitButton"),
    log: document.querySelector("#logList"),
    openLogHistory: document.querySelector("#openLogHistoryButton"),
    logHistoryCount: document.querySelector("#logHistoryCount"),
    logHistoryPanel: document.querySelector("#logHistoryPanel"),
    logHistoryDescription: document.querySelector("#logHistoryDescription"),
    logHistoryList: document.querySelector("#logHistoryList"),
    closeLogHistory: document.querySelector("#closeLogHistoryButton"),
    confirmPanel: document.querySelector("#confirmPanel"),
    confirmTitle: document.querySelector("#confirmTitle"),
    confirmText: document.querySelector("#confirmText"),
    confirmOk: document.querySelector("#confirmOk"),
    confirmCancel: document.querySelector("#confirmCancel"),
    setupPanel: document.querySelector("#setupPanel"),
    openRacePicker: document.querySelector("#openRacePicker"),
    openJobPicker: document.querySelector("#openJobPicker"),
    openPersonalityPicker: document.querySelector("#openPersonalityPicker"),
    adventurerNameInput: document.querySelector("#adventurerNameInput"),
    setupPickerPanel: document.querySelector("#setupPickerPanel"),
    setupPickerTitle: document.querySelector("#setupPickerTitle"),
    setupPickerList: document.querySelector("#setupPickerList"),
    setupPickerClose: document.querySelector("#setupPickerClose"),
    depthPickerPanel: document.querySelector("#depthPickerPanel"),
    depthPickerList: document.querySelector("#depthPickerList"),
    depthPickerClose: document.querySelector("#depthPickerClose"),
    monsterInfoPanel: document.querySelector("#monsterInfoPanel"),
    monsterInfoContent: document.querySelector("#monsterInfoContent"),
    monsterInfoClose: document.querySelector("#monsterInfoClose"),
    levelUpEffect: document.querySelector("#levelUpEffect"),
    levelUpTitle: document.querySelector("#levelUpTitle"),
    levelUpGrowth: document.querySelector("#levelUpGrowth"),
    setupSummary: document.querySelector("#setupSummary"),
    setupOk: document.querySelector("#setupOk"),
    setupCancel: document.querySelector("#setupCancel"),
    audioButton: document.querySelector("#audioButton"),
    audioIcon: document.querySelector("#audioIcon"),
    audioText: document.querySelector("#audioText"),
    deathEffect: document.querySelector("#deathEffect"),
    deathCry: document.querySelector("#deathCryText"),
    deathReason: document.querySelector("#deathReasonText"),
    deathReviewPanel: document.querySelector("#deathReviewPanel"),
    deathReviewReason: document.querySelector("#deathReviewReason"),
    deathReviewLog: document.querySelector("#deathReviewLog"),
    continueAfterDeath: document.querySelector("#continueAfterDeathButton"),
    liveLogAnnouncer: document.querySelector("#liveLogAnnouncer"),
    magicMoveControls: document.querySelector("#magicMoveControls"),
    jobSkill: document.querySelector("#jobSkillButton"),
    teleport: document.querySelector("#teleportButton"),
    timeStop: document.querySelector("#timeStopButton"),
    activeSpell: document.querySelector("#activeSpellButton"),
    recoveryMedicine: document.querySelector("#recoveryMedicineButton"),
  };

  const loaded = loadGame();
  let state = loaded.state;
  refreshShopInventoryForDepth();
  let currentView = state.adventurer.inDungeon ? "dungeon" : state.arena ? "arena" : "town";
  let cells = [];
  let pendingConfirm = null;
  let pendingConfirmCancel = null;
  let pendingSetup = loaded.initialSetupPending ? { raceId: state.adventurer.raceId || "human", jobId: state.adventurer.jobId || "swordsman", personalityId: state.adventurer.personalityId || "gentle", name: state.adventurer.name || "たかし" } : null;
  let initialSetupPending = loaded.initialSetupPending;
  let audio = null;
  let sfxPlayer = null;
  let levelUpEffectTimer = null;
  let levelUpStatTimers = [];
  let spellTargetArmed = false;
  let jobSkillTargetArmed = false;
  let homeSort = "name";
  let selectedMonsterHeartId = null;
  let researchSort = "floor";
  let researchFilter = "seen";
  let researchQuery = "";
  let researchPage = 0;
  let researchFocusId = null;
  let shopPage = 0;
  let shopSort = "price";
  let shopSlot = "all";
  let shopCompatibleOnly = false;
  let depthPickerReturnFocus = null;
  let logHistoryReturnFocus = null;

  // State creation, persistence, and save migration.
  function defaultSave() {
    return {
      adventurer: createAdventurer("human", "swordsman", "gentle"),
      meta: {
        research: {},
        monsterHearts: {},
        monsterHeartClaims: {},
        researchSchemaVersion: RESEARCH_SCHEMA_VERSION,
        economySchemaVersion: ECONOMY_SCHEMA_VERSION,
        progressionSchemaVersion: PROGRESSION_SCHEMA_VERSION,
        deaths: 0,
        deathLog: [],
        retirementLog: [],
        discoveredRecipes: [],
        bounties: {},
        guildClaims: [],
        uniqueKills: {},
        clearedBossFloors: [],
        randomArtifactSerial: 0,
        pendingDeathReview: null,
        titles: [],
        compendiumEquipmentUnlocked: false,
        donatedPermanentEquipmentIds: [],
        beginnerCourseStatus: "unoffered",
        startGuidanceShown: true,
        awaitingCreation: true,
        junkDealerStock: [],
        shop: { soldMaterials: {}, inventory: [] },
      },
      dungeon: null,
      arena: null,
      log: [START_GUIDANCE],
    };
  }

  function createAdventurer(raceId, jobId, personalityId, name = "たかし") {
    const race = races[raceId] || races.human;
    const job = jobs[jobId] || jobs.swordsman;
    const personality = personalities[personalityId] || personalities.gentle;
    const baseStats = CHARACTER.buildBaseStats(race, job, personality);
    const adventurerName = String(name || "たかし").trim().slice(0, 12) || "たかし";
    const rimuruSlimeAwakened = race.id === "slime" && adventurerName === "リムル";
    const startingMaxHp = baseStats.maxHp + (rimuruSlimeAwakened ? RIMURU_SLIME_HP_BONUS : 0);
    const starter = starterBuildLoadout(race, job, personality);
    return {
      alive: true,
      raceId: race.id,
      jobId,
      personalityId: personality.id,
      name: adventurerName,
      backstory: CHARACTER.generateBackstory({ name: adventurerName, race, personality }),
      hp: startingMaxHp,
      maxHp: startingMaxHp,
      level: 1,
      experience: 0,
      jobProgress: { [jobId]: { level: 1, experience: 0 } },
      floor: 1,
      deepestFloor: 1,
      inDungeon: false,
      equipment: starter.equipment,
      ownedEquipment: starter.ownedEquipment,
      discoveredArtifacts: [],
      randomArtifacts: {},
      craftedDetails: {},
      equipmentEnhancements: {},
      gold: 0,
      guildPoints: 0,
      junkTokens: 0,
      arenaBestRound: 0,
      gameCleared: false,
      bountyCorpses: [],
      scavengerNutrition: 0,
      temporaryDebuffs: {},
      slowTurns: 0,
      immobilizedTurns: 0,
      intoxicationDrinks: 0,
      intoxicationTurns: 0,
      snackBuff: null,
      materials: {},
      items: {},
      learnedSpells: [],
      activeSpellId: null,
      guard: false,
      lastAttack: null,
      debugBonuses: { strength: 0, speed: 0, dexterity: 0, durability: 0, luck: 0, acceleration: 0 },
    };
  }

  function starterBuildLoadout(race, job, personality) {
    const weaponByJob = {
      swordsman: "starter_swordsman_blade", hunter: "starter_hunter_knife", archer: "starter_archer_bow",
      mage: "starter_mage_wand", spellblade: "starter_spellblade", researcher: "starter_researcher_probe",
      heavy: "starter_heavy_maul", tourist: "starter_tourist_camera", psychic: "starter_psychic_focus",
      scavenger: "starter_scavenger_gauntlet", handyman: "starter_handyman_tool", priest: "starter_priest_censer",
      ninja: "starter_ninja_kunai", flower_tamer: "starter_flower_scepter", capoeirista: null,
    };
    const fireVulnerable = Number(race.resistances?.fire || 0) < 0;
    const upper = fireVulnerable ? "fire_lizard_cloak" : Number(race.stats?.durability || 0) >= 1 ? "fur_clothes" : "cloth";
    const agilePersonalities = new Set(["quick", "hasty", "skillful", "lucky", "whimsical"]);
    const accessory1 = agilePersonalities.has(personality.id) ? "thunder_charm"
      : personality.id === "glutton" ? "crafted_beast_ring"
        : "garm_fireguard";
    const weapon = weaponByJob[job.id] ?? "rusty_knife";
    const feet = job.id === "capoeirista" ? "starter_capoeira_wraps" : null;
    const equippedIds = [weapon, upper, feet, accessory1].filter(Boolean);
    return {
      equipment: { weapon, upper, lower: null, feet, accessory1, accessory2: null },
      ownedEquipment: [...new Set(equippedIds)],
    };
  }


  function loadGame() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved && saved.adventurer && saved.meta) {
        const state = migrateSave(saved);
        return { state, initialSetupPending: Boolean(state.meta.awaitingCreation) };
      }
    } catch (error) {
      console.warn(error);
    }
    return { state: defaultSave(), initialSetupPending: true };
  }

  function legacyCorpseHarvestCount(enemy) {
    const profileRange = enemy.rewardProfile?.harvestRolls;
    const range = enemy.unique ? [3, 5] : Array.isArray(profileRange) ? profileRange : [1, 2];
    const minimum = Math.max(1, Math.floor(Number(range[0] || 1)));
    const maximum = Math.max(minimum, Math.floor(Number(range[1] || minimum)));
    const hash = [...String(enemy.id || enemy.name || "corpse")]
      .reduce((sum, character) => sum + character.charCodeAt(0), Number(enemy.x || 0) * 17 + Number(enemy.y || 0) * 31);
    return minimum + (Math.abs(hash) % (maximum - minimum + 1));
  }

  function isValidDungeonMap(map) {
    if (!Array.isArray(map) || map.length < MAP_SIZE_RANGE[0] || map.length > MAP_SIZE_RANGE[1]) return false;
    return map.every((row) => Array.isArray(row) && row.length === map.length);
  }

  function migrateSave(saved) {
    saved.adventurer = saved.adventurer || {};
    saved.meta = saved.meta || {};
    const legacyEconomy = Number(saved.meta.economySchemaVersion || 1) < ECONOMY_SCHEMA_VERSION;
    const legacyProgression = Number(saved.meta.progressionSchemaVersion || 1) < PROGRESSION_SCHEMA_VERSION;
    saved.meta.research = saved.meta.research || {};
    saved.meta.monsterHearts = saved.meta.monsterHearts && typeof saved.meta.monsterHearts === "object" ? saved.meta.monsterHearts : {};
    saved.meta.monsterHeartClaims = saved.meta.monsterHeartClaims && typeof saved.meta.monsterHeartClaims === "object" ? saved.meta.monsterHeartClaims : {};
    const legacyResearch = Number(saved.meta.researchSchemaVersion || 1) < RESEARCH_SCHEMA_VERSION;
    Object.entries(saved.meta.research).forEach(([monsterId, value]) => {
      const record = value && typeof value === "object"
        ? value
        : { seen: Boolean(value), level: Number(value || 0) };
      const oldLevel = Math.max(0, Math.floor(Number(record.level || 0)));
      const level = legacyResearch
        ? (oldLevel >= 3 ? 5 : oldLevel === 2 ? 3 : oldLevel)
        : oldLevel;
      saved.meta.research[monsterId] = {
        ...record,
        seen: Boolean(record.seen || level > 0),
        level: clamp(level, 0, MAX_RESEARCH_LEVEL),
      };
    });
    saved.meta.researchSchemaVersion = RESEARCH_SCHEMA_VERSION;
    const currentMonsterIds = new Set(DATA.monsters.map((monster) => monster.id));
    [saved.meta.research, saved.meta.monsterHearts, saved.meta.monsterHeartClaims].forEach((records) => {
      Object.keys(records).forEach((monsterId) => {
        if (!currentMonsterIds.has(monsterId)) delete records[monsterId];
      });
    });
    saved.meta.deaths = Number(saved.meta.deaths || 0);
    saved.meta.deathLog = Array.isArray(saved.meta.deathLog) ? saved.meta.deathLog : [];
    saved.meta.retirementLog = Array.isArray(saved.meta.retirementLog)
      ? saved.meta.retirementLog.filter((record) => record && typeof record === "object").slice(0, 24)
      : [];
    saved.meta.discoveredRecipes = Array.isArray(saved.meta.discoveredRecipes) ? saved.meta.discoveredRecipes : [];
    saved.meta.bounties = saved.meta.bounties || {};
    saved.meta.guildClaims = Array.isArray(saved.meta.guildClaims) ? saved.meta.guildClaims : [];
    saved.meta.uniqueKills = saved.meta.uniqueKills || {};
    if (typeof saved.adventurer.gameCleared !== "boolean") {
      saved.adventurer.gameCleared = Boolean(saved.meta.uniqueKills.dungeon_lord_nox);
    }
    saved.meta.randomArtifactSerial = Math.max(0, Math.floor(Number(saved.meta.randomArtifactSerial || 0)));
    saved.meta.clearedBossFloors = Array.isArray(saved.meta.clearedBossFloors)
      ? [...new Set(saved.meta.clearedBossFloors.map(Number).filter((floor) => floor >= 10 && floor <= MAX_FLOOR && floor % 10 === 0))].sort((a, b) => a - b)
      : [];
    const pendingDeathReview = saved.meta.pendingDeathReview;
    saved.meta.pendingDeathReview = pendingDeathReview
      && typeof pendingDeathReview === "object"
      && typeof pendingDeathReview.reason === "string"
      && Array.isArray(pendingDeathReview.log)
      ? {
          reason: String(pendingDeathReview.reason || "不明").slice(0, 160),
          log: Array.isArray(pendingDeathReview.log)
            ? pendingDeathReview.log.map((line) => String(line).slice(0, 500)).slice(0, 20)
            : [],
        }
      : null;
    saved.meta.titles = Array.isArray(saved.meta.titles) ? saved.meta.titles : [];
    saved.meta.compendiumEquipmentUnlocked = Boolean(
      saved.meta.compendiumEquipmentUnlocked
      || saved.meta.titles.includes("万象の記録者")
      || saved.adventurer?.ownedEquipment?.includes("omniscient_archive"),
    );
    saved.meta.donatedPermanentEquipmentIds = Array.isArray(saved.meta.donatedPermanentEquipmentIds)
      ? [...new Set(saved.meta.donatedPermanentEquipmentIds.filter((id) => ["game_master_emblem", "omniscient_archive"].includes(id)))]
      : [];
    Object.entries(saved.meta.bounties).forEach(([id, record]) => {
      saved.meta.bounties[id] = record === true
        ? { intel: true, claimed: 1 }
        : { ...record, intel: Boolean(record?.intel), claimed: Math.max(0, Math.floor(Number(record?.claimed || 0))) };
    });
    saved.meta.shop = saved.meta.shop || { soldMaterials: {}, inventory: [] };
    saved.meta.shop.soldMaterials = saved.meta.shop.soldMaterials || {};
    saved.meta.shop.inventory = Array.isArray(saved.meta.shop.inventory)
      ? [...new Set(saved.meta.shop.inventory.filter((id) => equipment[id] && !equipment[id].artifact))]
      : [];
    saved.meta.junkDealerStock = Array.isArray(saved.meta.junkDealerStock)
      ? [...new Set(saved.meta.junkDealerStock.filter((id) => junkDealerMaterialEligible(materials[id])))].slice(0, 12)
      : [];
    delete saved.meta.guildDonatedEquipmentIds;
    saved.meta.awaitingCreation = Boolean(saved.meta.awaitingCreation);
    saved.meta.beginnerCourseStatus = ["unoffered", "declined", "partial", "completed"].includes(saved.meta.beginnerCourseStatus)
      ? saved.meta.beginnerCourseStatus
      : "unoffered";
    if (!saved.adventurer.raceId || !races[saved.adventurer.raceId]) saved.adventurer.raceId = "human";
    if (!saved.adventurer.jobId || !jobs[saved.adventurer.jobId]) saved.adventurer.jobId = "swordsman";
    if (!saved.adventurer.personalityId || !personalities[saved.adventurer.personalityId]) saved.adventurer.personalityId = "gentle";
    saved.adventurer.name = String(saved.adventurer.name || "たかし").slice(0, 12);
    saved.adventurer.backstory = typeof saved.adventurer.backstory === "string"
      ? saved.adventurer.backstory.slice(0, 800)
      : CHARACTER.generateBackstory({
          name: saved.adventurer.name,
          race: races[saved.adventurer.raceId],
          personality: personalities[saved.adventurer.personalityId],
        });
    saved.adventurer.materials = saved.adventurer.materials || {};
    saved.adventurer.gold = Math.max(0, Number(saved.adventurer.gold || 0));
    saved.adventurer.guildPoints = Math.max(0, Number(saved.adventurer.guildPoints || 0));
    saved.adventurer.junkTokens = Math.max(0, Math.floor(Number(saved.adventurer.junkTokens || 0)));
    saved.adventurer.arenaBestRound = clamp(Number(saved.adventurer.arenaBestRound || 0), 0, ARENA_BATTLE_COUNT);
    saved.adventurer.bountyCorpses = Array.isArray(saved.adventurer.bountyCorpses) ? saved.adventurer.bountyCorpses : [];
    saved.adventurer.scavengerNutrition = Math.max(0, Number(saved.adventurer.scavengerNutrition || 0));
    saved.adventurer.temporaryDebuffs = saved.adventurer.temporaryDebuffs || {};
    saved.adventurer.slowTurns = Math.max(0, Number(saved.adventurer.slowTurns || 0));
    saved.adventurer.immobilizedTurns = Math.max(0, Math.floor(Number(saved.adventurer.immobilizedTurns || 0)));
    saved.adventurer.intoxicationDrinks = Math.max(0, Math.floor(Number(saved.adventurer.intoxicationDrinks || 0)));
    saved.adventurer.intoxicationTurns = Math.max(0, Math.floor(Number(saved.adventurer.intoxicationTurns || 0)));
    if (saved.adventurer.snackBuff && typeof saved.adventurer.snackBuff === "object") {
      const validSnackStats = new Set(["strength", "speed", "dexterity", "durability", "luck"]);
      if (!validSnackStats.has(saved.adventurer.snackBuff.stat)) saved.adventurer.snackBuff = null;
      else saved.adventurer.snackBuff = {
        stat: saved.adventurer.snackBuff.stat,
        amount: clamp(Math.floor(Number(saved.adventurer.snackBuff.amount || 0)), 1, 5),
        turns: Math.max(0, Math.floor(Number(saved.adventurer.snackBuff.turns || 0))),
        snackName: String(saved.adventurer.snackBuff.snackName || "つまみ").slice(0, 40),
      };
    } else saved.adventurer.snackBuff = null;
    saved.adventurer.items = saved.adventurer.items && typeof saved.adventurer.items === "object" ? saved.adventurer.items : {};
    const jobIds = DATA.jobs.map((job) => job.id);
    const randomArtifactEntries = Object.entries(saved.adventurer.randomArtifacts || {})
      .filter(([id, item]) => id === item?.id && ARTIFACTS?.isValid(item, DATA.attributes, jobIds));
    saved.adventurer.randomArtifacts = Object.fromEntries(randomArtifactEntries);
    randomArtifactEntries.forEach(([, item]) => { equipment[item.id] = item; });
    const highestRandomArtifactSerial = randomArtifactEntries.reduce((highest, [id]) => {
      const serial = Number(id.match(/(\d+)$/)?.[1] || 0);
      return Math.max(highest, serial);
    }, 0);
    saved.meta.randomArtifactSerial = Math.max(saved.meta.randomArtifactSerial, highestRandomArtifactSerial);
    saved.adventurer.learnedSpells = Array.isArray(saved.adventurer.learnedSpells)
      ? [...new Set(saved.adventurer.learnedSpells.filter((id) => spells[id]))]
      : [];
    saved.adventurer.activeSpellId = saved.adventurer.learnedSpells.includes(saved.adventurer.activeSpellId)
      ? saved.adventurer.activeSpellId
      : saved.adventurer.learnedSpells[0] || null;
    saved.arena = saved.arena || null;
    if (saved.arena) {
      const round = Math.floor(Number(saved.arena.round || 0));
      const expectedEnemy = ARENA_ROSTER[round - 1];
      if (!expectedEnemy || saved.arena.enemy?.id !== expectedEnemy.id) saved.arena = null;
      else {
        saved.arena.actionProgress = Math.max(0, Math.floor(Number(saved.arena.actionProgress || 0)));
        saved.arena.healCooldown = Math.max(0, Math.floor(Number(saved.arena.healCooldown || 0)));
        saved.arena.awaitingNext = Boolean(saved.arena.awaitingNext);
      }
    }
    const savedEnemies = [
      ...(Array.isArray(saved.dungeon?.enemies) ? saved.dungeon.enemies : []),
      ...(saved.arena?.enemy ? [saved.arena.enemy] : []),
    ];
    savedEnemies.forEach((enemy) => {
      const canonicalMonster = monsters[enemy.id];
      if (canonicalMonster) {
        enemy.name = canonicalMonster.name;
        enemy.baseName = canonicalMonster.baseName || canonicalMonster.name;
        enemy.epithet = canonicalMonster.epithet || null;
        if (enemy.dangerous && canonicalMonster.dangerous) {
          enemy.dangerous.name = canonicalMonster.dangerous.name;
          enemy.dangerous.telegraph = canonicalMonster.dangerous.telegraph;
        }
      }
      delete enemy.speech;
      delete enemy.hasSpoken;
      delete enemy.lastSpeechStage;
      enemy.asleep = Boolean(enemy.asleep && enemy.alive !== false);
      enemy.specialRoomGraceTurns = Math.max(0, Math.floor(Number(enemy.specialRoomGraceTurns || 0)));
      sanitizeGuardianSpecialAttack(enemy);
      enemy.canPhaseWalls = monsterCanPhaseWalls(enemy);
    });
    (saved.dungeon?.enemies || []).forEach((enemy) => {
      if (enemy.alive) return;
      if (!Number.isFinite(Number(enemy.harvestsRemaining))) {
        enemy.harvestsRemaining = enemy.harvested === false ? legacyCorpseHarvestCount(enemy) : 0;
      }
      enemy.harvestsRemaining = Math.max(0, Math.floor(Number(enemy.harvestsRemaining || 0)));
      enemy.harvestsTotal = Math.max(enemy.harvestsRemaining, Math.floor(Number(enemy.harvestsTotal || enemy.harvestsRemaining)));
      enemy.harvested = enemy.harvestsRemaining <= 0;
    });
    saved.adventurer.craftedDetails = saved.adventurer.craftedDetails || {};
    saved.adventurer.level = clamp(Number(saved.adventurer.level || 1), 1, MAX_LEVEL);
    saved.adventurer.debugBonuses = saved.adventurer.debugBonuses || {};
    [...STAT_KEYS, "acceleration"].forEach((key) => {
      saved.adventurer.debugBonuses[key] = clamp(Math.floor(Number(saved.adventurer.debugBonuses[key] || 0)), -999, 999);
    });
    saved.adventurer.experience = Math.max(0, Number(saved.adventurer.experience || 0));
    const existingJobProgress = saved.adventurer.jobProgress && typeof saved.adventurer.jobProgress === "object"
      ? saved.adventurer.jobProgress
      : null;
    saved.adventurer.jobProgress = {};
    DATA.jobs.forEach((job) => {
      const record = existingJobProgress?.[job.id];
      const isLegacyCurrentJob = !existingJobProgress && job.id === saved.adventurer.jobId;
      saved.adventurer.jobProgress[job.id] = {
        level: clamp(Number(record?.level || (isLegacyCurrentJob ? saved.adventurer.level : 1)), 1, MAX_LEVEL),
        experience: Math.max(0, Number(record?.experience ?? (isLegacyCurrentJob ? saved.adventurer.experience : 0))),
      };
      if (saved.adventurer.jobProgress[job.id].level >= MAX_LEVEL) saved.adventurer.jobProgress[job.id].experience = 0;
    });
    saved.adventurer.level = saved.adventurer.jobProgress[saved.adventurer.jobId].level;
    saved.adventurer.experience = saved.adventurer.jobProgress[saved.adventurer.jobId].experience;
    saved.adventurer.alive = saved.adventurer.alive !== false;
    saved.adventurer.floor = clamp(Number(saved.adventurer.floor || 1), 1, MAX_FLOOR);
    saved.adventurer.deepestFloor = clamp(Number(saved.adventurer.deepestFloor || saved.adventurer.floor || 1), 1, MAX_FLOOR);
    if (legacyProgression) {
      const legacyClearedFloor = Math.floor((saved.adventurer.deepestFloor - 1) / 10) * 10;
      for (let floor = 10; floor <= legacyClearedFloor; floor += 10) {
        if (!saved.meta.clearedBossFloors.includes(floor)) saved.meta.clearedBossFloors.push(floor);
      }
      const legacyFinalBossDefeated = Number(saved.meta.uniqueKills.dungeon_lord_nox || 0) > 0
        || saved.meta.titles.includes("迷宮踏破者");
      if (legacyFinalBossDefeated && !saved.meta.clearedBossFloors.includes(MAX_FLOOR)) {
        saved.meta.clearedBossFloors.push(MAX_FLOOR);
      }
    }
    saved.meta.clearedBossFloors.sort((a, b) => a - b);
    saved.meta.progressionSchemaVersion = PROGRESSION_SCHEMA_VERSION;
    if (legacyEconomy) {
      const legacyShopDepth = Math.max(saved.adventurer.deepestFloor, ...saved.meta.clearedBossFloors, 1);
      saved.meta.shop.inventory = saved.meta.shop.inventory.filter((id) => Number(equipment[id]?.shopMinFloor || 1) <= legacyShopDepth);
    }
    saved.meta.economySchemaVersion = ECONOMY_SCHEMA_VERSION;
    saved.adventurer.inDungeon = Boolean(saved.adventurer.inDungeon && saved.dungeon);
    if (saved.dungeon && !isValidDungeonMap(saved.dungeon.map)) {
      saved.dungeon = null;
      saved.adventurer.inDungeon = false;
      saved.adventurer.floor = 1;
    }
    if (saved.dungeon) saved.dungeon.size = saved.dungeon.map.length;
    if (saved.dungeon && !Array.isArray(saved.dungeon.stairs)) {
      saved.dungeon.stairs = saved.dungeon.stairs ? [saved.dungeon.stairs] : [];
    }
    if (saved.dungeon) {
      const excavatedKeys = new Set();
      saved.dungeon.excavatedTiles = (Array.isArray(saved.dungeon.excavatedTiles) ? saved.dungeon.excavatedTiles : [])
        .map((tile) => ({ x: Math.trunc(Number(tile?.x)), y: Math.trunc(Number(tile?.y)) }))
        .filter((tile) => {
          const key = `${tile.x},${tile.y}`;
          const valid = tile.x > 0 && tile.y > 0
            && tile.x < saved.dungeon.map.length - 1 && tile.y < saved.dungeon.map.length - 1
            && saved.dungeon.map[tile.y]?.[tile.x] === "floor"
            && !excavatedKeys.has(key);
          if (valid) excavatedKeys.add(key);
          return valid;
        });
      const legacyTrapDanger = clamp(1 + Math.floor((saved.adventurer.floor - 1) / 30), 1, 5);
      saved.dungeon.traps = (Array.isArray(saved.dungeon.traps) ? saved.dungeon.traps : [])
        .map((trap) => {
          const legacyTriggered = Boolean(trap?.triggered);
          const triggerCount = Math.max(0, Math.floor(Number(trap?.triggerCount ?? (legacyTriggered ? 1 : 0))));
          const normalized = {
            ...trap,
            x: Math.trunc(Number(trap?.x)),
            y: Math.trunc(Number(trap?.y)),
            type: Object.prototype.hasOwnProperty.call(TRAP_TYPE_LABELS, trap?.type) ? trap.type : "damage",
            danger: clamp(Math.floor(Number(trap?.danger || legacyTrapDanger)), 1, 5),
            discovered: Boolean(trap?.discovered || legacyTriggered || trap?.disarmed),
            disarmed: Boolean(trap?.disarmed || legacyTriggered || triggerCount >= 3),
            triggerCount,
            disarmFailures: Math.max(0, Math.floor(Number(trap?.disarmFailures || 0))),
          };
          delete normalized.triggered;
          return normalized;
        })
        .filter((trap) => (
          trap.x > 0 && trap.y > 0
          && trap.x < saved.dungeon.map.length - 1 && trap.y < saved.dungeon.map.length - 1
          && saved.dungeon.map[trap.y]?.[trap.x] === "floor"
        ));
      ["madnessRoom", "treasureVault", "thrillRoom"].forEach((key) => {
        const room = saved.dungeon[key];
        if (!room) return;
        const normalized = {
          ...room,
          x: Math.trunc(Number(room.x)),
          y: Math.trunc(Number(room.y)),
          w: Math.trunc(Number(room.w)),
          h: Math.trunc(Number(room.h)),
          discovered: Boolean(room.discovered),
        };
        const valid = normalized.x > 0 && normalized.y > 0 && normalized.w > 0 && normalized.h > 0
          && normalized.x + normalized.w < saved.dungeon.map.length
          && normalized.y + normalized.h < saved.dungeon.map.length;
        if (valid) saved.dungeon[key] = normalized;
        else delete saved.dungeon[key];
      });
    }
    if (saved.dungeon && !saved.dungeon.layout) {
      saved.dungeon.layout = { id: "classic", name: "連結遺構", description: "大小の部屋が長めの一本道で連なる標準構造。" };
    }
    if (saved.dungeon && Array.isArray(saved.dungeon.rooms) && saved.dungeon.rooms.length) {
      const rooms = saved.dungeon.rooms;
      rooms.forEach((room) => {
        room.cramped = Boolean(room.cramped);
        room.large = Boolean(room.large || (!room.cramped && room.w >= 7 && room.h >= 7));
      });
      const lightingSchemaComplete = rooms.every((room) => typeof room.alwaysLit === "boolean");
      if (!lightingSchemaComplete || !rooms.some((room) => room.alwaysLit)) {
        const litRoomCount = Math.max(1, Math.round(rooms.length * window.HD_DUNGEON.alwaysLitRoomRatio));
        rooms.forEach((room, index) => { room.alwaysLit = index < litRoomCount; });
      }
    }
    if (!saved.adventurer.inDungeon && saved.adventurer.bountyCorpses.length) {
      saved.meta.guildClaims.push(...saved.adventurer.bountyCorpses);
      saved.adventurer.bountyCorpses = [];
    }
    const remapEquipmentId = (id) => id && id.replace(/_plate$/, "_greaves").replace(/_robe$/, "_boots");
    if (Array.isArray(saved.adventurer.ownedEquipment)) {
      saved.adventurer.ownedEquipment = [...new Set(saved.adventurer.ownedEquipment.map(remapEquipmentId))];
    }
    const oldEquipment = saved.adventurer.equipment || {};
    if (!("upper" in oldEquipment)) {
      const migrated = { weapon: oldEquipment.weapon || "rusty_knife", upper: null, lower: null, feet: null, accessory1: null, accessory2: null };
      [oldEquipment.armor, oldEquipment.charm].map(remapEquipmentId).filter(Boolean).forEach((id) => {
        const item = equipment[id];
        if (!item) return;
        if (item.slot === "accessory") migrated.accessory1 = id;
        else migrated[item.slot] = id;
      });
      if (!migrated.upper) migrated.upper = "cloth";
      saved.adventurer.equipment = migrated;
    }
    Object.keys(saved.adventurer.equipment).forEach((slot) => {
      saved.adventurer.equipment[slot] = remapEquipmentId(saved.adventurer.equipment[slot]);
    });
    ["weapon", "upper", "lower", "feet", "accessory1", "accessory2"].forEach((slot) => {
      if (!(slot in saved.adventurer.equipment)) saved.adventurer.equipment[slot] = slot === "weapon" ? "rusty_knife" : slot === "upper" ? "cloth" : null;
    });
    Object.entries(saved.adventurer.equipment).forEach(([slot, id]) => {
      const item = equipment[id];
      if (item && !item.jobs.includes(saved.adventurer.jobId)) {
        saved.adventurer.equipment[slot] = null;
      }
    });
    if (!Array.isArray(saved.adventurer.ownedEquipment)) {
      saved.adventurer.ownedEquipment = Object.values(saved.adventurer.equipment || {}).filter(Boolean);
    }
    saved.adventurer.equipmentEnhancements = saved.adventurer.equipmentEnhancements && typeof saved.adventurer.equipmentEnhancements === "object"
      ? saved.adventurer.equipmentEnhancements
      : {};
    saved.adventurer.discoveredArtifacts = Array.isArray(saved.adventurer.discoveredArtifacts)
      ? [...new Set(saved.adventurer.discoveredArtifacts.filter((id) => equipment[id]?.artifact && !equipment[id].artifact.random))]
      : [];
    saved.adventurer.ownedEquipment.forEach((id) => {
      if (equipment[id]?.artifact && !equipment[id].artifact.random && !saved.adventurer.discoveredArtifacts.includes(id)) saved.adventurer.discoveredArtifacts.push(id);
    });
    Object.values(saved.adventurer.equipment || {})
      .filter(Boolean)
      .forEach((id) => {
        if (!saved.adventurer.ownedEquipment.includes(id)) saved.adventurer.ownedEquipment.push(id);
      });
    saved.log = (Array.isArray(saved.log) ? saved.log : ["街の冒険者ギルドに到着した。"])
      .map((line) => String(line).slice(0, 500))
      .slice(0, LOG_HISTORY_LIMIT);
    if (saved.meta.startGuidanceShown !== true) {
      saved.log.unshift(START_GUIDANCE);
      saved.log = saved.log.slice(0, LOG_HISTORY_LIMIT);
      saved.meta.startGuidanceShown = true;
    }
    return saved;
  }

  function saveGame() {
    saveActiveJobProgress();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function log(text) {
    const seasonedText = SURREAL?.decorateLog(text, state.log.length) || text;
    state.log.unshift(seasonedText);
    state.log = state.log.slice(0, LOG_HISTORY_LIMIT);
    if (els.liveLogAnnouncer) els.liveLogAnnouncer.textContent = seasonedText;
    saveGame();
    renderLog();
  }

  // Shared view switching and status rendering.
  function syncShellMode() {
    const dungeonMode = Boolean(state.adventurer.inDungeon);
    const arenaMode = !dungeonMode && currentView === "arena" && Boolean(state.arena);
    els.app.classList.toggle("dungeon-mode", dungeonMode);
    els.app.classList.toggle("arena-mode", arenaMode);
    els.app.classList.toggle("town-mode", !dungeonMode && !arenaMode);
  }

  function arenaUnlocked() {
    return Boolean(state.arena) || (state.meta.clearedBossFloors || []).includes(10);
  }

  function junkDealerUnlocked() {
    return (state.meta.clearedBossFloors || []).includes(20);
  }

  function switchView(view) {
    if (state.adventurer.inDungeon) view = "dungeon";
    if (view === "dungeon" && !state.adventurer.inDungeon) view = "town";
    if (view === "arena" && !arenaUnlocked()) view = "town";
    if (view === "junkDealer" && !junkDealerUnlocked()) view = "town";
    const enteringJunkDealer = view === "junkDealer" && currentView !== "junkDealer";
    if (enteringJunkDealer) refreshJunkDealerStock();
    currentView = view;
    ["town", "inn", "jobCenter", "dungeon", "home", "research", "shop", "junkDealer", "guild", "arena"].forEach((name) => {
      document.querySelector(`#${name}View`).classList.toggle("hidden", name !== view);
    });
    const activeTab = view;
    els.tabs.forEach((button) => {
      const active = button.dataset.view === activeTab;
      const arenaLocked = button.dataset.view === "arena" && !arenaUnlocked();
      const junkDealerLocked = button.dataset.view === "junkDealer" && !junkDealerUnlocked();
      const facilityLocked = arenaLocked || junkDealerLocked;
      button.classList.toggle("active", active);
      button.classList.toggle("locked", facilityLocked);
      button.setAttribute("aria-disabled", String(facilityLocked));
      if (button.dataset.view === "arena") {
        button.textContent = arenaLocked ? "闘技場・封" : "闘技場";
        button.title = arenaLocked ? "地下10階の守護者を倒すと解放" : "修練連武闘技場";
      }
      if (button.dataset.view === "junkDealer") {
        button.textContent = junkDealerLocked ? "珍品店・封" : "珍品店";
        button.title = junkDealerLocked ? "地下20階の守護者を倒すと解放" : "ガラクタマニア・珍品偏愛堂";
      }
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    render();
    playSfx(enteringJunkDealer ? "shopRefresh" : "uiTab");
    if (view === "guild") offerBeginnerCourse();
  }

  const BEGINNER_COURSE_LESSONS = Object.freeze([
    { title: "初心者講座 1/7・生還", text: "迷宮では欲張らず、危険を感じたら帰還してください。死亡すると装備、強化、資産、街の流通は初期化されます。ただしモンスター調査は引き継がれ、完全調査済みの心は各1個へ復活します。" },
    { title: "初心者講座 2/7・調査", text: "魔物は戦う、攻撃を受ける、剥ぎ取ることで調査が進みます。調査度が上がると能力、弱点、危険技、素材条件が順に判明します。" },
    { title: "初心者講座 3/7・属性", text: "攻撃属性は敵の弱点と耐性で威力が変わります。装備の赤い負耐性は被害を増やしますが、同属性の免疫装備があれば負耐性を完全に塞げます。" },
    { title: "初心者講座 4/7・装備パズル", text: "装備は攻撃力だけで選ばないでください。大きな長所には弱点があり、別部位の耐性・免疫・固有連携で穴を埋めることが重要です。自宅で変更後の合計耐性を確認できます。" },
    { title: "初心者講座 5/7・セット装備", text: "組物は2・3・4部位で段階的に効果が発動します。四部位完成は強力ですが、固定アーティファクトを一枠入れて弱点を塞ぐ構成も有効です。" },
    { title: "初心者講座 6/7・モンスターの心", text: "一体の調査度を最大にすると、その魔物固有の心を一度だけ得ます。自宅で心を消費して装備を強化できますが、心を宿せるのは一つの装備につき一度だけです。強敵の心ほど基礎強化量と属性値が高く、武器には攻撃属性、防具・足・アクセサリには属性耐性が宿ります。" },
    { title: "初心者講座 7/7・街の活用", text: "素材を商店へ流すと装備が入荷します。ガラクタはGにするか、ガラクタマニアの偏愛札へ換えて珍素材を狙えます。宿の酒や職業には危険な裏技も隠れています。" },
  ]);

  function offerBeginnerCourse() {
    if (state.adventurer.inDungeon || state.meta.beginnerCourseStatus !== "unoffered" || pendingConfirm) return;
    state.meta.beginnerCourseStatus = "partial";
    saveGame();
    askConfirm(
      "冒険者ギルド初心者講座",
      `受付係「初めての方へ、全${BEGINNER_COURSE_LESSONS.length}項目の初心者講座があります。受講は任意で、断っても不利益はありません。受けますか？」`,
      () => showBeginnerCourseLesson(0),
      () => {
        state.meta.beginnerCourseStatus = "declined";
        log("ギルドの初心者講座は受けず、自分の判断で冒険へ進むことにした。");
        saveGame();
      },
      { ok: "講座を受ける", cancel: "今回は受けない" },
    );
  }

  function showBeginnerCourseLesson(index) {
    const lesson = BEGINNER_COURSE_LESSONS[index];
    if (!lesson) {
      state.meta.beginnerCourseStatus = "completed";
      state.adventurer.guildPoints += 1;
      log("冒険者ギルドの初心者講座を修了し、修了報酬として1GPを得た。受付係「知識より生還が大事です。ご武運を」");
      playSfx("researchUp");
      saveGame();
      return;
    }
    playSfx("tutorial");
    askConfirm(
      lesson.title,
      lesson.text,
      () => showBeginnerCourseLesson(index + 1),
      () => {
        state.meta.beginnerCourseStatus = "partial";
        log(`初心者講座を${index + 1}項目目で切り上げた。受講した内容は冒険記録へ残った。`);
        saveGame();
      },
      { ok: index === BEGINNER_COURSE_LESSONS.length - 1 ? "修了する" : "次へ", cancel: "ここで終える" },
    );
  }

  function render() {
    const adv = state.adventurer;
    syncShellMode();
    const stats = getPlayerStats();
    els.place.textContent = adv.inDungeon
      ? `B${adv.floor}F`
      : currentView === "arena" && state.arena
        ? `修練場 第${state.arena.round}戦`
        : "街";
    const intoxicationLabel = intoxicated() ? drunkenFistActive() ? `・酔拳${adv.intoxicationTurns}` : `・酩酊${adv.intoxicationTurns}` : "";
    const snackBuffLabel = adv.snackBuff?.turns > 0 ? `・満腹${statLabel(adv.snackBuff.stat)}+${adv.snackBuff.amount}(${adv.snackBuff.turns})` : "";
    const immobilizedLabel = adv.immobilizedTurns > 0 ? `・拘束${adv.immobilizedTurns}` : "";
    els.job.textContent = (adv.jobId === "scavenger"
      ? `${jobs[adv.jobId].name}・摂食${adv.scavengerNutrition || 0}`
      : adv.jobId === "flower_tamer" && adv.inDungeon
        ? `${jobs[adv.jobId].name}・花ペット${activeFlowerPets().length}/${flowerPetLimit()}`
        : jobs[adv.jobId].name) + intoxicationLabel + snackBuffLabel + immobilizedLabel;
    els.race.textContent = `${personalities[adv.personalityId].name}な${races[adv.raceId].name}${adv.name}`;
    els.hp.textContent = adv.hp;
    els.maxHp.textContent = stats.maxHp;
    updateHpFill(els.playerHpFill, adv.hp, stats.maxHp);
    els.dungeonHp.textContent = adv.hp;
    els.dungeonMaxHp.textContent = stats.maxHp;
    updateHpFill(els.dungeonHpFill, adv.hp, stats.maxHp);
    els.level.textContent = adv.level;
    els.level.parentElement.title = adv.level >= MAX_LEVEL ? "最大レベル" : `経験値 ${adv.experience}/${experienceToNext(adv.level)}（種族補正×${raceExperienceMultiplier().toFixed(2)}）`;
    [
      [els.strength, els.dungeonStrength, stats.strength],
      [els.speed, els.dungeonSpeed, stats.speed],
      [els.dexterity, els.dungeonDexterity, stats.dexterity],
      [els.durability, els.dungeonDurability, stats.durability],
      [els.luck, els.dungeonLuck, stats.luck],
      [els.acceleration, els.dungeonAcceleration, stats.acceleration],
    ].forEach(([globalOutput, dungeonOutput, value]) => {
      const text = formatStatValue(value);
      globalOutput.textContent = text;
      dungeonOutput.textContent = text;
    });
    els.gold.textContent = adv.gold;
    els.acceleration.parentElement.title = `世界1ターンに${1 + Math.floor(Math.max(0, stats.acceleration) / 10)}回行動 / 荷重 ${stats.materialCount}/${stats.materialCapacity}（重量ペナルティ ${stats.materialBurden}）`;
    els.weapon.textContent = getEquipmentName(adv.equipment.weapon);
    els.upper.textContent = getEquipmentName(adv.equipment.upper);
    els.lower.textContent = getEquipmentName(adv.equipment.lower);
    els.feet.textContent = getEquipmentName(adv.equipment.feet);
    els.accessory1.textContent = getEquipmentName(adv.equipment.accessory1);
    els.accessory2.textContent = getEquipmentName(adv.equipment.accessory2);

    if (adv.inDungeon) {
      renderDungeon();
    } else {
      renderTown();
      renderInn();
      renderJobCenter();
      renderHome();
      renderResearch();
      renderShop();
      renderJunkDealer();
      renderGuild();
      renderArena();
    }
    renderLog();
    renderSetupPanel();
    updateAudioScene();
  }

  function showTitleScreen() {
    closeSetupPicker();
    closeMonsterInfo();
    closeDepthPicker();
    closeLogHistory(false);
    els.deathReviewPanel?.classList.add("hidden");
    els.setupPanel.classList.add("hidden");
    els.confirmPanel.classList.add("hidden");
    els.version.textContent = APP_VERSION;
    els.titleStart.textContent = initialSetupPending ? "新しい冒険者を作る" : "つづきから";
    els.titleScreen.classList.remove("hidden");
  }

  function startFromTitle() {
    startAudioFromGesture();
    els.titleScreen.classList.add("hidden");
    if (initialSetupPending) {
      if (!pendingSetup) {
        pendingSetup = {
          raceId: state.adventurer.raceId || "human",
          jobId: state.adventurer.jobId || "swordsman",
          personalityId: state.adventurer.personalityId || "gentle",
          name: state.adventurer.name || "たかし",
          preserveMeta: true,
        };
      }
      renderSetupPanel();
      return;
    }
    switchView(currentView);
  }

  function formatStatValue(value) {
    return String(value);
  }

  function jobEquipmentHint(jobId) {
    return ({
      swordsman: "刃・鎚・重脚甲", heavy: "鎚・重脚甲", hunter: "刃・弓・猟具・軽足",
      archer: "刃・弓・猟具・軽足", mage: "猟具・魔導短剣・軽足", spellblade: "刃・猟具・重脚甲・軽足",
      researcher: "鎚・猟具・軽足", tourist: "猟具・軽足・専用カメラ", psychic: "猟具・軽足",
      scavenger: "刃・鎚・猟具・重脚甲", handyman: "ほぼ全形式",
      priest: "聖具・鎚・軽足・装飾品", ninja: "刃・忍具・重脚甲・軽足",
    })[jobId] || "標準装備";
  }

  function equipmentJobNames(item) {
    if (!item?.jobs?.length) return "なし";
    if (item.jobs.length === DATA.jobs.length) return "全職業";
    return item.jobs.map((id) => jobs[id]?.name || id).join("・");
  }

  function equipmentRole(item) {
    const numericResistances = Object.values(item?.resistances || {}).filter((value) => value !== "immune").map(Number);
    const hasImmunity = Object.values(item?.resistances || {}).includes("immune");
    const hasDrawback = [item?.attack, item?.defense, item?.acceleration, item?.hpRegen, ...numericResistances]
      .some((value) => Number(value || 0) < 0) || Boolean(item?.curse);
    const artifactTier = item?.artifact?.tier;
    if (["joke", "trash"].includes(artifactTier) || item?.risque) {
      return { id: "novelty", tag: "珍品", reason: "常識的な性能評価から外れた効果や収集価値を持つ" };
    }
    if (item?.masterOnly || item?.completionOnly || artifactTier === "cheat" || Number(item?.shopMinFloor || 0) >= 85) {
      return { id: "final", tag: "最終", reason: "最深層や最終ビルドでも主力候補になる格を持つ" };
    }
    if (item?.setId) return { id: "conditional", tag: "組物", reason: "同じセットの装備数に応じて段階効果を発動する" };
    const attackAttributes = equipmentAttackAttributes(item);
    if (item?.trueSight || item?.guildCost || hasImmunity || attackAttributes.length >= 2
      || Number(item?.hpRegen || 0) >= 2 || ["useful", "ordinary"].includes(artifactTier)) {
      return { id: "core", tag: item?.trueSight ? "看破核" : hasImmunity ? "免疫核" : "複合核", reason: item?.trueSight
        ? "透明看破を軸に探索と戦闘の組み立てを変える"
        : "複数の性能を結び、ビルドの中心として働く" };
    }
    if (hasDrawback || Number(item?.jobs?.length || DATA.jobs.length) <= 2) {
      return { id: "conditional", tag: hasDrawback ? "代償" : "職限", reason: hasDrawback
        ? "明確な代償を受け入れた時に性能を引き出せる"
        : "限られた職業で真価を発揮する" };
    }
    const resistancePeak = Math.max(0, ...numericResistances);
    if (item?.attributeAttack || resistancePeak >= 2 || Math.abs(Number(item?.acceleration || 0)) >= 3
      || Number(item?.hpRegen || 0) !== 0 || Object.keys(item?.resistances || {}).length >= 2) {
      const resistanceFocus = Object.entries(item?.resistances || {})
        .filter(([, value]) => value !== "immune" && Number(value) === resistancePeak)
        .map(([id]) => id)[0];
      const tag = item?.attributeAttack ? `${attr(item.attributeAttack)}攻`
        : Math.abs(Number(item?.acceleration || 0)) >= 3 ? "加速"
          : Number(item?.hpRegen || 0) !== 0 ? "再生"
            : resistanceFocus ? `${attr(resistanceFocus)}耐` : "特化";
      return { id: "specialized", tag, reason: item?.attributeAttack
        ? `${attr(item.attributeAttack)}属性の攻撃運用へ明確に特化する`
        : "特定の能力または耐性を重点的に伸ばす" };
    }
    return { id: "basic", tag: "基礎", reason: "癖が少なく、基礎能力を素直に底上げする" };
  }

  window.HD_EQUIPMENT_ROLES = Object.freeze({ definitions: EQUIPMENT_ROLES, classify: equipmentRole });

  function researchStatusText(level) {
    const normalized = clamp(Math.floor(Number(level || 0)), 0, MAX_RESEARCH_LEVEL);
    const maxLabel = normalized === MAX_RESEARCH_LEVEL ? " MAX" : "";
    return `調査度 ${normalized}/${MAX_RESEARCH_LEVEL}${maxLabel}・${RESEARCH_LEVEL_LABELS[normalized]}`;
  }

  function monsterSpeciesDisplay(monster, researchLevel) {
    if (monster?.id === "dungeon_lord_nox" && Number(researchLevel || 0) < 3) return "正体不明";
    return monster?.speciesName || "種族不明";
  }

  function colorizeResearchAttributes(text) {
    return String(text || "").replace(ATTRIBUTE_LABEL_PATTERN, (label) => attrHtml(ATTRIBUTE_IDS_BY_LABEL[label]));
  }

  const RESEARCH_NOTE_FLAVOR = Object.freeze({
    1: [
      ["遭遇報告《第一鐘》", "記録官注：これをただの目撃談として棚へ戻した者は、次の報告書で行方不明になった。"],
      ["迷宮観測録・赤印", "観測紙が震えているが、筆者の手は震えていないことになっている。"],
      ["生還者の走り書き", "文字の乱れは誤記ではない。書き手が背後を確認しながら記したためである。"],
    ],
    2: [
      ["解剖不能報告《能力篇》", "数字は嘘をつかない。魔物は数字ごと冒険者を殴ってくる。"],
      ["対魔解析・第二封印", "弱点を知ることは勝利ではない。ようやく敗北に言い訳ができなくなっただけだ。"],
      ["禁足標本室の注釈", "この頁だけ妙に新しい。古い頁を読んだ者が残っていないからだ。"],
    ],
    3: [
      ["剥ぎ取り秘録《刃を入れる前に》", "仕留め方ひとつで戦利品は宝にも残飯にもなる。迷宮は雑な仕事を忘れない。"],
      ["猟師組合・黒札情報", "知識は命より軽い。だからこそ、生きて持ち帰るのが難しい。"],
      ["回収班の最終勧告", "素材名を読めたなら幸運だ。回収班の名簿は、たいてい途中で読めなくなる。"],
    ],
  });

  function embellishedResearchNote(monster, level, note) {
    const pool = RESEARCH_NOTE_FLAVOR[level] || RESEARCH_NOTE_FLAVOR[3];
    const hash = [...`${monster.id}:${level}`].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const [heading, aside] = pool[hash % pool.length];
    return `<span class="research-note-label">${heading}</span>${colorizeResearchAttributes(note)} <em class="research-note-aside">${aside}</em>`;
  }

  function monsterAttackFeatureDescription(monster) {
    const pool = enemyAttackAttributePool(monster);
    const intelligence = enemyTacticalIntelligence(monster);
    const parts = [];
    if (pool.length >= 5) parts.push(`${pool.map(attrHtml).join("・")}など${pool.length}属性を次々と抜刀する万華属性型`);
    else if (pool.length >= 2) parts.push(`${pool.map(attrHtml).join("・")}を戦況に応じて着替える複合属性型`);
    else parts.push(`${attrHtml(pool[0] || monster.attackAttribute)}属性だけを磨き上げた一本槍型`);
    if (intelligence >= 0.7) parts.push(`極めて高い戦術知性を持ち、約${Math.round(intelligence * 100)}%で最も薄い耐性を正確に狙う`);
    else if (intelligence >= 0.35) parts.push(`装備耐性を読み、約${Math.round(intelligence * 100)}%で防御の穴を狙う`);
    else if (intelligence > 0) parts.push(`時折こちらの耐性構成を読んで攻撃属性を選ぶ`);
    if (monster.dangerous) parts.push(`${monster.dangerous.every}行動ごとに威力${monster.dangerous.power}の「${monster.dangerous.name}」を予兆する`);
    else parts.push("予兆を伴う固有危険技は持たない");
    if (monster.specialAttack) parts.push(`さらに${SPECIAL_ATTACK_LABELS[monster.specialAttack] || monster.specialAttack}を行う`);
    if (monster.summon) parts.push(`長期戦では眷属を最大${monster.summon.maxTotal}体まで召喚する`);
    if (monster.dragonBreath) parts.push(`竜息階位${monster.dragonBreath.rank}。一度の放射で${monster.dragonBreath.trials}回の命中判定を行う超火力ブレス`);
    if (monster.divineInvulnerability) parts.push(`${monster.divineInvulnerability.every}行動ごとに「${monster.divineInvulnerability.name}」を展開し、次の${monster.divineInvulnerability.charges}回のプレイヤー攻撃を完全無効化する`);
    if (monster.demonicWard) parts.push(`悪魔障壁により${monster.demonicWard.attributes.map(attrHtml).join("・")}耐性を最低${monster.demonicWard.tier}まで引き上げている`);
    if (monster.rapidRegeneration) parts.push(`世界ターンごとに最大HPの約${Math.round(monster.rapidRegeneration.rate * 100)}%を急速回復する。火で2ターン停止、毒で3ターン半減、会心で1ターン停止できる`);
    const acceleration = Number(monster.acceleration || 0);
    if (acceleration >= 20) parts.push("非常に素早く、連続行動へ入りやすい");
    else if (acceleration >= 8) parts.push("行動速度が高い");
    else if (acceleration <= 0) parts.push("動きは遅いが一撃を重視する");
    return `<span class="research-note-label">交戦予報《命を賭ける前に》</span>${parts.join("。")}。`;
  }

  const MONSTER_TRIVIA = Object.freeze({
    slime: ["乾いた石を好んで飲み込み、体内で丸く磨いてから巣の目印に並べる", "分裂した個体同士は雨音の振動で居場所を伝え合う", "眠る時だけ身体の中心核がゆっくり底へ沈む"],
    vermin: ["仲間の匂いを覚える力が強く、一度助けられた相手を長く忘れない", "抜け落ちた毛や牙を巣穴の入口へ飾る習性がある", "迷宮の微かな風向きから地上の天候を察する"],
    insect: ["外殻の細かな傷は群れの中での役職を示す", "触角を石壁へ当て、遠くの戦闘音を振動として聞き取る", "脱皮殻を食べて失った魔力を回収する"],
    winged: ["飛行経路を歌の節回しとして子へ教える", "羽根の艶は食べた魔力の属性によって少しずつ変わる", "天井の突起を星座に見立てて方角を覚える"],
    reptile: ["暖かい鉱石を抱いて眠り、鱗へ熱を蓄える", "古い鱗ほど魔力をよく通すため巣材として再利用する", "舌で空気中の魔力を味わい、水場までの距離を測る"],
    spirit: ["生前の名前より最後に聞いた音を大切にする", "霊体同士がすれ違うと、互いの記憶が一晩だけ混ざる", "灯りの少ない場所では昔の姿を壁へ映すことがある"],
    construct: ["停止中も内部の歯車だけは迷宮の時刻を刻み続ける", "破損部品を拾い集め、自分ではなく仲間を先に修理する", "製作者不明の刻印を同じ位置へ持つ個体が多い"],
    plant: ["歩いた跡へ微細な種を落とし、帰り道を森へ変える", "根を通じて水だけでなく周囲の出来事まで共有する", "月の見えない迷宮でも一定周期で花を閉じる"],
    fiend: ["角のねじれ方を家系図の代わりに読み取る", "約束を破ることより、曖昧な約束を結ぶことを嫌う", "本名を知られるのを恐れ、親しい相手にも異名を使う"],
    giant: ["小石を指先で磨き、気に入ったものへ山の名前を付ける", "眠りが深いため、一度の休眠が人間の数年に及ぶことがある", "足音の間隔だけで互いの機嫌を読み取る"],
    aberration: ["観察者によって手足の数が違って見える", "鏡へ姿が映るより先に、鏡の中からこちらを見る", "同じ場所を巡回しているようで足跡だけは毎回別方向へ続く"],
    warrior: ["戦いの前に武器へ今日の日付を刻む者が多い", "敗者の技を一つだけ覚え、自分の流派へ残す", "手入れ道具を武器そのものより大切に扱う"],
    elf: ["木目を文字として読み、古樹の成長記録を歴史書にする", "挨拶の代わりに相手の足元へ小さな種を置く", "百年単位の待ち合わせでも遅刻には厳しい"],
    dragon: ["宝物の価値を金額ではなく思い出の数で決める", "一枚だけ逆向きに生える鱗を成長の証として守る", "幼竜の頃に聞いた子守歌を数百年たっても覚えている"],
    demon: ["契約書の余白へ密かに日記を書く者がいる", "角を磨く布の色で所属する魔界領を示す", "甘い菓子を好むが威厳のため公には認めない"],
    angel: ["羽根を落とすたび、その日に見た善行を一つ記録する", "光輪の傾きで感情が分かるため嘘をつくのが苦手", "地上の鳥の歌を神聖な暗号だと思い研究している"],
  });

  function monsterTriviaDescription(monster) {
    const pool = MONSTER_TRIVIA[monster.speciesId] || ["迷宮内で独自の縄張り印を残す", "個体ごとに異なる休息場所を持つ", "冒険者の知らない習性を今も多く隠している"];
    const hash = [...String(monster.id || monster.name)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const fact = pool[hash % pool.length];
    const colorNote = Number(monster.colorTierIndex || 0) >= 5
      ? `${monster.colorTierName}階級まで育つ個体は、同族からも畏敬を込めて距離を置かれる`
      : Number(monster.colorTierIndex || 0) === 0
        ? "白階級の時期は好奇心が強く、縄張りの外へ出やすい"
        : "成長に伴う色の変化は、同族同士の合図としても使われる";
    return `<span class="research-note-label">迷宮余聞《役に立つとは限らない》</span>${colorizeResearchAttributes(fact)}。${colorizeResearchAttributes(colorNote)}。`;
  }

  const THREAT_HYPE_OPENINGS = Object.freeze([
    "警告。これは魔物ではない。世界が処理しきれず、魔物という名前で仮保存した災害だ",
    "観測班より悲報。この個体を理解した者から順番に、理解される側へ回っている",
    "禁書の余白に一行だけ記録がある――遭遇したなら、まだ遭遇していないふりをせよ",
    "宇宙的脅威が、我々の認識の圏外から入場券も買わずにやってきた",
    "迷宮が生んだのではない。迷宮のほうが、これから逃げるために百層へ伸びたのだ",
    "存在を確認。なお確認に使った観測器は、自らを棺桶だと思い込んで停止した",
    "学者はこれを分類した。翌朝、その分類表には学者自身の名前が獲物として追記されていた",
    "世界法則との照合に失敗。向こうが正しく、こちらの現実が間違っている可能性がある",
  ]);
  const THREAT_HYPE_ENDINGS = Object.freeze({
    light: ["光は救済ではない。逃げ場を残さず照らすためにある", "その輝きは夜を消すのではなく、影の持ち主を消す"],
    dark: ["闇が深いのではない。こちらの存在が薄くなっている", "影を踏まれるな。次に本体扱いされるのは影のほうだ"],
    fire: ["炎上しているのは肉体ではなく、これまで生き延びたという事実だ", "灰になれば助かると思うな。灰から先が本番である"],
    water: ["溺れるには水が必要という常識から、先に捨てることになる", "波音が聞こえた時点で、肺はもう海の所有物だ"],
    thunder: ["雷鳴は攻撃の予兆ではない。命中後に届く結果報告だ", "瞬きをするな。その一瞬を相手は一生分に引き延ばす"],
    curse: ["名前を呼ぶな。返事をしたものが次の自分になる", "呪いを解く鍵はある。ただし鍵穴は魂の裏側だ"],
    illusion: ["見えているなら手遅れ、見えていないならもっと手遅れだ", "現実確認は二度までにせよ。三度目には現実側が折れる"],
    steel: ["刃こぼれを心配するな。先にこちらの歴史が欠ける", "硬いのではない。破壊という概念をまだ許可していない"],
    default: ["勝算は計算不能。勇気だけが、まだ計算式の外に残っている", "生還報告はゼロ。安心してほしい、敗北報告も本人からはゼロだ"],
  });

  function isHypeThreat(monster) {
    return Boolean(monster.unique || monsterNativeFloor(monster) >= 50 || Number(monster.colorTierIndex || 0) >= 5 || Number(monster.speciesRank || 0) >= 12);
  }

  function monsterThreatHypeDescription(monster) {
    if (!isHypeThreat(monster)) return "";
    const hash = [...String(monster.id || monster.name)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const opening = THREAT_HYPE_OPENINGS[hash % THREAT_HYPE_OPENINGS.length];
    const endings = THREAT_HYPE_ENDINGS[monster.dangerous?.attribute || monster.attackAttribute] || THREAT_HYPE_ENDINGS.default;
    const ending = endings[Math.floor(hash / THREAT_HYPE_OPENINGS.length) % endings.length];
    const rankTitle = Number(monster.colorTierIndex || 0) >= 6
      ? "虹の終末指定"
      : monster.unique
        ? "固有災害指定"
        : "深層脅威指定";
    return `<span class="research-note-label threat">${rankTitle}《閲覧後の正気は保証外》</span>${colorizeResearchAttributes(opening)}。${colorizeResearchAttributes(ending)}。`;
  }

  const CHARACTERFUL_MONSTER_NOTES = Object.freeze({
    regal: ["敗北しても姿勢だけは王座に座ったまま。たぶん椅子のほうが本人を必要としている", "命令口調しか知らないが、誰もいない時は部下の名前を一人ずつ呼ぶ"],
    feral: ["言葉より先に牙が出る。それでも約束した狩り場の境界だけは決して越えない", "荒々しいが、倒れた同族の匂いを見つけると一晩その場を離れない"],
    oracle: ["未来を語るくせに、明日の自分についてだけは毎回答えを濁す", "予言は外れない。ただし本人が結末を少し嫌な方向へ言い換える"],
    trickster: ["戦闘を舞台、罠を演出、敗北さえアンコールだと思っている", "冗談の九割は嘘だが、残り一割の本音ほど誰も信じない"],
    warrior: ["勝敗より美しい一手を重んじ、卑怯な勝利には自分から傷を一つ増やす", "武器の手入れ中だけは敵にも背を向ける。そこを狙うと本気で怒る"],
    silent: ["無口なのではない。発した言葉が現実になるため、必要以上に話さない", "足音を消して歩くが、寂しい時だけわざと一歩余計に鳴らす"],
    zealot: ["信仰心は本物。ただし信じる神の名前が日によって変わる", "傷を祝福と呼ぶが、自分の古傷だけは服の下へ丁寧に隠す"],
    scholar: ["倒し方より先に、倒された後の考察を三冊書き終えている", "知識のためなら命も惜しまない。ただし本の角が折れることだけは耐えられない"],
  });

  function isCharacterfulMonster(monster) {
    return Boolean(monster.unique && (monster.dialogueDesire || monster.uniqueStyle || monster.uniqueTemperament));
  }

  function monsterCharacterDescription(monster, researchLevel) {
    if (!isCharacterfulMonster(monster)) return "";
    const pool = CHARACTERFUL_MONSTER_NOTES[monster.uniqueStyle] || CHARACTERFUL_MONSTER_NOTES.warrior;
    const hash = [...String(monster.id || monster.name)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const parts = [monster.dialogueDesire || pool[hash % pool.length]];
    if (researchLevel >= 4 && monster.dialogueKeepsake) parts.push(`大切にしているものは${monster.dialogueKeepsake}`);
    if (researchLevel >= 5 && monster.dialogueSecret) parts.push(`秘された記録には「${monster.dialogueSecret}」とある`);
    if (!monster.dialogueDesire) parts.push(pool[(hash + 1) % pool.length]);
    return `<span class="research-note-label">怪物評《強さ以外の厄介事》</span>${colorizeResearchAttributes(parts.join("。"))}。`;
  }

  function lootCandidateNames(monster) {
    return [...new Set((monster.loot || [])
      .map((rule) => materials[rule.material]?.name || rule.material)
      .filter(Boolean))];
  }

  // Town and facility views.
  function renderTown() {
    const retirementHistory = (state.meta.retirementLog || []).slice(0, 6).map((record) => `<li><strong>${escapeHtml(record.name)}</strong> Lv${record.level} ${escapeHtml(jobs[record.jobId]?.name || record.jobId)} — ${escapeHtml(record.title || "迷宮踏破者")}</li>`).join("");
    els.townView.innerHTML = `
      <div class="town-grid">
        <article class="town-card">
          <h2>中央広場</h2>
          <p>施設は上のタブへ分散した。宿屋、商店、自宅、転職所、珍品店へ直接移動できる。</p>
          <p>迷宮へ向かうなら「ダンジョン」、依頼と講座は「ギルド」、戦闘記録は「調査」を選ぶ。</p>
        </article>
        <article class="town-card">
          <h2>管理</h2>
          <div class="inline-actions">
            ${DEVELOPER_MODE_ENABLED ? '<button type="button" id="openDeveloperPanelButton">開発者パネル</button>' : ""}
            <button type="button" id="newAdventurerButton">新しい冒険者</button>
            <button type="button" id="resetSaveButton">セーブ初期化</button>
          </div>
          ${retirementHistory ? `<h3>歴代の引退者</h3><ul>${retirementHistory}</ul>` : ""}
        </article>
      </div>
    `;
    document.querySelector("#openDeveloperPanelButton")?.addEventListener("click", openDeveloperPanel);
    document.querySelector("#newAdventurerButton").addEventListener("click", () => {
      askConfirm("新しい冒険者", "調査記録を残して、現在の冒険者を作り直します。", () => {
        openSetup({ raceId: state.adventurer.raceId, jobId: state.adventurer.jobId, personalityId: state.adventurer.personalityId, name: state.adventurer.name, preserveMeta: true });
        state.dungeon = null;
        switchView("town");
      });
    });
    document.querySelector("#resetSaveButton").addEventListener("click", () => {
      askConfirm("セーブ初期化", "調査記録と死亡記録を含む全データを削除します。", () => {
        localStorage.removeItem(SAVE_KEY);
        state = defaultSave();
        initialSetupPending = true;
        pendingSetup = { raceId: state.adventurer.raceId || "human", jobId: state.adventurer.jobId || "swordsman", personalityId: "gentle", name: "たかし", preserveMeta: false };
        log("セーブデータを初期化した。");
        switchView("town");
      });
    });
  }

  function renderInn() {
    const adv = state.adventurer;
    if (!tavernSnackMenu.length) refreshTavernSnackMenu();
    const alcoholStatus = adv.intoxicationTurns > 0
      ? drunkenFistActive() ? `酔拳状態・残り${adv.intoxicationTurns}世界ターン` : `酩酊状態・残り${adv.intoxicationTurns}世界ターン`
      : "しらふ";
    const snackBuffStatus = adv.snackBuff?.turns > 0
      ? ` / 満腹効果 ${statLabel(adv.snackBuff.stat)}+${adv.snackBuff.amount}・残り${adv.snackBuff.turns}世界ターン`
      : "";
    const snackButtons = tavernSnackMenu.map((snack) => (
      `<button type="button" data-tavern-snack="${snack.id}" ${adv.gold < snack.price ? "disabled" : ""}><strong>${snack.name}</strong><small>${snack.price}G・${snack.flavor}</small></button>`
    )).join("");
    els.innView.innerHTML = `<article class="town-card inn-card"><h2>宿屋「眠り鹿」</h2>
      <p>10Gで一晩休み、HPと一時的な能力低下を完全に回復する。酒は一杯1G。飲み過ぎは命に関わる。</p>
      <p><strong>${alcoholStatus}</strong>${snackBuffStatus}</p>
      <div class="inline-actions"><button type="button" id="drinkInnButton" ${adv.gold < DRINK_COST ? "disabled" : ""}>1Gで一杯飲む</button><button type="button" id="restInnButton" ${adv.gold < INN_COST ? "disabled" : ""}>${INN_COST}Gで休む</button></div>
      <h3>今夜のつまみ</h3><div class="tavern-snack-menu">${snackButtons}</div></article>`;
    document.querySelector("#restInnButton").addEventListener("click", restAtInn);
    document.querySelector("#drinkInnButton").addEventListener("click", drinkAtInn);
    document.querySelectorAll("[data-tavern-snack]").forEach((button) => button.addEventListener("click", () => eatTavernSnack(button.dataset.tavernSnack)));
  }

  function renderJobCenter() {
    const adv = state.adventurer;
    const jobButtons = DATA.jobs.map((job) => {
      const selected = job.id === adv.jobId ? "selected" : "";
      const progress = adv.jobProgress?.[job.id] || { level: 1, experience: 0 };
      return `<button type="button" class="${selected}" data-job="${job.id}"><strong>${job.name} Lv${progress.level}</strong><small>${job.description}<br>装備適性: ${jobEquipmentHint(job.id)}</small></button>`;
    }).join("");
    els.jobCenterView.innerHTML = `<section class="town-card"><h2>転職所</h2><p>職業ごとのレベルと経験値は独立して保存される。</p><div class="job-grid">${jobButtons}</div></section>`;
    document.querySelectorAll("[data-job]").forEach((button) => button.addEventListener("click", () => changeJob(button.dataset.job)));
  }

  function developerNumberInput(id, label, value, min, max) {
    return `<label class="developer-field"><span>${label}</span><input id="${id}" type="number" min="${min}" max="${max}" value="${value}" inputmode="numeric"></label>`;
  }

  function openDeveloperPanel() {
    if (!DEVELOPER_MODE_ENABLED) return;
    const panel = document.querySelector("#developerPanel");
    const body = document.querySelector("#developerPanelBody");
    const adv = state.adventurer;
    const bonuses = adv.debugBonuses || {};
    const equipmentOptions = DATA.equipment.map((item) => `<option value="${item.id}">${item.artifact ? "★ " : ""}${escapeHtml(item.name)}</option>`).join("");
    const itemOptions = (DATA.treasureItems || []).map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("");
    body.innerHTML = `
      <section class="developer-section"><h3>冒険者</h3><div class="developer-grid">
        ${developerNumberInput("debugLevel", "レベル", adv.level, 1, MAX_LEVEL)}
        ${developerNumberInput("debugGold", "所持金", adv.gold, 0, 99999999)}
        ${developerNumberInput("debugGuildPoints", "ギルドGP", adv.guildPoints || 0, 0, 999999)}
        ${developerNumberInput("debugFloor", "出発階層", adv.deepestFloor || 1, 1, MAX_FLOOR)}
      </div><div class="inline-actions"><button type="button" data-debug-action="apply-adventurer">数値を反映</button><button type="button" data-debug-action="heal">全回復</button><button type="button" data-debug-action="start-floor">指定階へ出発</button></div></section>
      <section class="developer-section"><h3>能力補正</h3><p>種族・職業・レベル計算後の能力へ加算します。</p><div class="developer-grid">
        ${developerNumberInput("debugStrength", "力", bonuses.strength || 0, -999, 999)}
        ${developerNumberInput("debugSpeed", "素早さ", bonuses.speed || 0, -999, 999)}
        ${developerNumberInput("debugDexterity", "器用さ", bonuses.dexterity || 0, -999, 999)}
        ${developerNumberInput("debugDurability", "耐久力", bonuses.durability || 0, -999, 999)}
        ${developerNumberInput("debugLuck", "運", bonuses.luck || 0, -999, 999)}
        ${developerNumberInput("debugAcceleration", "加速", bonuses.acceleration || 0, -999, 999)}
      </div><div class="inline-actions"><button type="button" data-debug-action="apply-bonuses">補正を反映</button><button type="button" data-debug-action="clear-bonuses">補正を解除</button></div></section>
      <section class="developer-section"><h3>アイテム付与</h3><label class="developer-select">装備<select id="debugEquipment">${equipmentOptions}</select></label><button type="button" data-debug-action="give-equipment">1個付与</button><label class="developer-select">宝箱アイテム<select id="debugTreasure">${itemOptions}</select></label><button type="button" data-debug-action="give-treasure">1個付与</button></section>
      <section class="developer-section"><h3>解禁・検証</h3><div class="inline-actions"><button type="button" data-debug-action="unlock-depths">全階層を解禁</button><button type="button" data-debug-action="complete-research">調査記録を全開示</button></div></section>`;
    body.querySelectorAll("[data-debug-action]").forEach((button) => button.addEventListener("click", () => runDeveloperAction(button.dataset.debugAction)));
    panel.classList.remove("hidden");
    body.querySelector("input, select, button")?.focus();
  }

  function debugInputNumber(id, min, max) {
    return clamp(Math.floor(Number(document.querySelector(`#${id}`)?.value || 0)), min, max);
  }

  function runDeveloperAction(action) {
    const adv = state.adventurer;
    if (action === "apply-adventurer") {
      adv.level = debugInputNumber("debugLevel", 1, MAX_LEVEL);
      adv.experience = 0;
      saveActiveJobProgress();
      adv.gold = debugInputNumber("debugGold", 0, 99999999);
      adv.guildPoints = debugInputNumber("debugGuildPoints", 0, 999999);
      adv.deepestFloor = Math.max(adv.deepestFloor || 1, debugInputNumber("debugFloor", 1, MAX_FLOOR));
    } else if (action === "heal") {
      adv.temporaryDebuffs = {};
      adv.slowTurns = 0;
      adv.hp = getPlayerStats().maxHp;
    } else if (action === "start-floor") {
      const floor = debugInputNumber("debugFloor", 1, MAX_FLOOR);
      adv.deepestFloor = Math.max(adv.deepestFloor || 1, floor);
      document.querySelector("#developerPanel").classList.add("hidden");
      startDungeonAt(floor, true);
      return;
    } else if (action === "apply-bonuses") {
      adv.debugBonuses = {};
      [...STAT_KEYS, "acceleration"].forEach((key) => {
        const id = `debug${key[0].toUpperCase()}${key.slice(1)}`;
        adv.debugBonuses[key] = debugInputNumber(id, -999, 999);
      });
    } else if (action === "clear-bonuses") {
      adv.debugBonuses = { strength: 0, speed: 0, dexterity: 0, durability: 0, luck: 0, acceleration: 0 };
    } else if (action === "give-equipment") {
      const id = document.querySelector("#debugEquipment")?.value;
      if (equipment[id] && !adv.ownedEquipment.includes(id)) adv.ownedEquipment.push(id);
      if (equipment[id]?.artifact && !adv.discoveredArtifacts.includes(id)) adv.discoveredArtifacts.push(id);
    } else if (action === "give-treasure") {
      const id = document.querySelector("#debugTreasure")?.value;
      if (id) adv.items[id] = Math.max(0, Number(adv.items[id] || 0)) + 1;
    } else if (action === "unlock-depths") {
      state.meta.clearedBossFloors = Array.from({ length: 10 }, (_, index) => (index + 1) * 10);
      adv.deepestFloor = MAX_FLOOR;
    } else if (action === "complete-research") {
      DATA.monsters.forEach((monster) => { state.meta.research[monster.id] = { seen: true, level: MAX_RESEARCH_LEVEL }; });
      reconcileResearchCompletion(true);
    }
    log(`開発者パネル: ${action}を実行した。`);
    saveGame();
    render();
    openDeveloperPanel();
  }

  function renderHome() {
    const adv = state.adventurer;
    const finalObjectiveComplete = Boolean(adv.gameCleared);
    const stats = getPlayerStats();
    const totalResistances = stats.resistances;
    const normalProfile = getPlayerBattleProfile(null, "attack");
    const normalExpectation = expectedDamage(normalProfile);
    const activeCandidate = spells[adv.activeSpellId] || null;
    const active = activeCandidate?.jobs?.includes(adv.jobId) ? activeCandidate : null;
    const resistanceBoard = DATA.attributes.map((id) => {
      const value = totalResistances[id] || 0;
      const tier = value === "immune" ? 5 : Math.max(0, Number(value));
      return `<div class="resistance-total tier-${tier}"><span>${attr(id)}</span><strong>${value === "immune" ? "免疫" : value}</strong><i style="--tier:${tier}"></i></div>`;
    }).join("");
    const slotLabels = { weapon: "武器", upper: "上半身防具", lower: "下半身防具", feet: "足回り", accessory: "アクセサリ" };
    const heartEntries = Object.entries(state.meta.monsterHearts || {})
      .filter(([id, count]) => monsters[id] && Number(count) > 0)
      .sort(([left], [right]) => monsterHeartPower(monsters[right]) - monsterHeartPower(monsters[left]) || monsters[left].name.localeCompare(monsters[right].name, "ja"));
    if (!heartEntries.some(([id]) => id === selectedMonsterHeartId)) selectedMonsterHeartId = heartEntries[0]?.[0] || null;
    const selectedHeart = monsters[selectedMonsterHeartId] || null;
    const heartOptions = heartEntries.map(([id, count]) => `<option value="${id}" ${id === selectedMonsterHeartId ? "selected" : ""}>${monsters[id].name}の心 ×${count}（強化+${monsterHeartPower(monsters[id])}）</option>`).join("");
    const owned = adv.ownedEquipment.map((id) => equipment[id]).filter(Boolean);
    const ownedIds = new Set(owned.map((item) => item.id));
    const activeSetById = Object.fromEntries((stats.activeEquipmentSets || []).map((set) => [set.id, set]));
    const setBoard = (DATA.equipmentSets || []).map((set) => {
      const ownedCount = set.itemIds.filter((id) => ownedIds.has(id)).length;
      if (!ownedCount) return "";
      const activeSet = activeSetById[set.id];
      const equippedCount = activeSet?.count || 0;
      const bonuses = set.bonuses.map((bonus) => `<li class="${equippedCount >= bonus.pieces ? "active" : "inactive"}"><strong>${bonus.pieces}部位</strong> ${bonus.text}</li>`).join("");
      return `<article class="equipment-set-card ${equippedCount >= 2 ? "active" : ""}"><div><span>所持${ownedCount}/4・装備${equippedCount}/4</span><h3>${set.name}</h3></div><ul>${bonuses}</ul></article>`;
    }).join("") || "<p>セット装備はまだ持っていない。</p>";
    const homeSorters = {
      name: (a, b) => a.name.localeCompare(b.name, "ja"),
      attack: (a, b) => (b.attack || 0) - (a.attack || 0),
      defense: (a, b) => (b.defense || 0) - (a.defense || 0),
    };
    const sections = ["weapon", "upper", "lower", "feet", "accessory"].map((slot) => {
      const items = owned.filter((item) => item.slot === slot).sort(homeSorters[homeSort]);
      const cards = items.map((item) => {
        const canJob = item.jobs.includes(adv.jobId);
        const equippedSlots = slot === "accessory"
          ? ["accessory1", "accessory2"].filter((target) => adv.equipment[target] === item.id)
          : [slot].filter((target) => adv.equipment[target] === item.id);
        const buttons = slot === "accessory"
          ? ["accessory1", "accessory2"].map((target, index) => `<button type="button" data-equip="${item.id}" data-target-slot="${target}" ${adv.equipment[target] === item.id || !canJob ? "disabled" : ""}>${adv.equipment[target] === item.id ? `枠${index + 1}装備中` : `枠${index + 1}へ`}</button>`).join("")
          : `<button type="button" data-equip="${item.id}" data-target-slot="${slot}" ${equippedSlots.length || !canJob ? "disabled" : ""}>${equippedSlots.length ? "装備中" : canJob ? "装備する" : "職業制限"}</button>`;
        const crafted = adv.craftedDetails[item.id];
        const artifact = item.artifact;
        const enhancement = equipmentEnhancement(item.id);
        const canHeartEnhance = Boolean(selectedHeart && !enhancement.level);
        return `<article class="equipment-card ${crafted ? "crafted-equipment" : ""} ${artifact ? "artifact-card" : ""}">
          <strong>${crafted ? `${crafted.qualityName}・` : ""}${equipmentDisplayName(item)}${enhancement.level ? ` +${enhancement.total}` : ""}${equippedSlots.length ? "（装備中）" : ""}</strong>
          ${artifact ? `<span class="artifact-tier">${artifact.label}</span>` : ""}
          ${item.setId ? `<span class="equipment-set-label">組物：${equipmentSets[item.setId]?.name || item.setId}</span>` : ""}
          ${item.risque ? '<span class="risque-label">艶装備</span>' : ""}
          ${item.curse ? `<span class="cursed-label">呪われている</span>` : ""}
          <div class="equipment-actions">${buttons}</div>
          <p>${ECONOMY.equipmentStats(item)}${equipmentAttackAttributes(item).length ? ` / 攻撃属性:${formatAttackAttributes(equipmentAttackAttributes(item))}` : ""}${formatResistances(item.resistances) ? ` / 耐性:${formatResistances(item.resistances)}` : ""}</p>
          ${enhancement.level ? `<p class="heart-enhancement">心強化済み / ${item.slot === "weapon" ? `攻撃力+${enhancement.total}` : `防御力+${enhancement.total}`} / 属性値 ${Object.entries(enhancement.attributes).map(([id, value]) => `${attrHtml(id)}+${value}`).join("・")}</p>` : ""}
          <button type="button" data-heart-enhance="${item.id}" ${canHeartEnhance ? "" : "disabled"}>${enhancement.level ? "この装備は心強化済み" : selectedHeart ? `${selectedHeart.name}の心で+${monsterHeartPower(selectedHeart)}強化` : "モンスターの心がない"}</button>
          ${item.puzzleEffects?.length ? item.puzzleEffects.map((effect) => {
            const status = equipmentPuzzleStatus(stats, effect, adv);
            return `<p class="equipment-puzzle-effect ${status.active ? "active" : "inactive"}"><strong>${status.active ? "発動中" : "未発動"}</strong> ${effect.text}<br><small>${status.progress}</small></p>`;
          }).join("") : ""}
          ${item.curse ? `<p class="curse-summary">呪い: ${formatCursePenalty(item.curse)}（現在の呪耐性で${Math.round((stats.cursePenaltyRate ?? 1) * 100)}%適用）</p>` : ""}
          ${crafted ? `<p class="crafted-detail">銘「${crafted.mark}」— ${crafted.flavor}<br>${formatCraftBonus(crafted)}</p>` : ""}
        </article>`;
      }).join("") || "<p>保管装備なし。</p>";
      const targets = slot === "accessory" ? ["accessory1", "accessory2"] : [slot];
      const unequip = targets
        .filter((target) => target !== "weapon" && adv.equipment[target])
        .map((target) => `<button type="button" data-unequip="${target}">${target === "accessory1" ? "アクセサリ1" : target === "accessory2" ? "アクセサリ2" : slotLabels[slot]}を外す</button>`)
        .join("");
      return `<section class="home-section"><h2>${slotLabels[slot]}</h2>${cards}${unequip}</section>`;
    }).join("");
    const carriedItems = (DATA.treasureItems || []).filter((item) => getItemCount(item.id) > 0);
    const inventoryCards = carriedItems.map((item) => {
      const count = getItemCount(item.id);
      if (item.type === "spellbook") {
        const spell = spells[item.spellId];
        const learned = adv.learnedSpells.includes(item.spellId);
        const allowed = Boolean(spell?.jobs?.includes(adv.jobId));
        return `<article class="inventory-card"><div><span class="rank-badge">${spellbookRankLabel(item.rank)}</span><strong>${item.name} ×${count}</strong><p>${item.description}</p></div><button type="button" data-read-spellbook="${item.id}" ${learned || !allowed ? "disabled" : ""}>${learned ? "習得済み" : allowed ? "自宅で読む" : "現在の職業では読めない"}</button></article>`;
      }
      return `<article class="inventory-card"><div><strong>${item.name} ×${count}</strong><p>${treasureTierLabel(item)}${treasureTierLabel(item) ? " / " : ""}${item.description}</p></div><small>商店売価 ${Number(item.sellPrice || 0)}G</small></article>`;
    }).join("") || "<p>宝箱から持ち帰った品はまだない。</p>";
    const learnedCards = adv.learnedSpells.map((id) => spells[id]).filter(Boolean).map((spell) => {
      const usable = spell.jobs.includes(adv.jobId);
      const selected = usable && adv.activeSpellId === spell.id;
      return `<article class="spell-card ${selected ? "selected" : ""}"><div><span class="rank-badge">${spellbookRankLabel(spell.rank)}</span><strong>${spell.name}</strong><p>${formatAttackAttributes([spell.attribute])} / 威力${spell.power} / 射程${spell.range} / 再詠唱${spell.cooldown || 2}。${spell.description}</p></div><button type="button" data-select-spell="${spell.id}" ${selected || !usable ? "disabled" : ""}>${selected ? "使用魔法" : usable ? "使用魔法にする" : "現在は使用不可"}</button></article>`;
    }).join("") || "<p>魔法書を読むと、ここに習得魔法が記録される。</p>";
    const cursePenaltyText = Object.entries(stats.cursePenalties || {}).filter(([, value]) => value).map(([key, value]) => `${statLabel(key)}${value}`).join("・");
    els.homeView.innerHTML = `
      <section class="home-profile">
        <div class="home-profile-heading"><div><span>冒険者情報</span><h2>${personalities[adv.personalityId].name}な${races[adv.raceId].name}${escapeHtml(adv.name)}</h2><p>Lv${adv.level} ${jobs[adv.jobId].name} / 経験値 ${adv.level >= MAX_LEVEL ? "MAX" : `${adv.experience}/${experienceToNext(adv.level)}`} / 種族育成補正×${raceExperienceMultiplier().toFixed(2)}</p></div><strong>HP ${adv.hp}/${stats.maxHp}</strong></div>
        <div class="adventure-objective ${finalObjectiveComplete ? "completed" : ""}">
          <span>${finalObjectiveComplete ? "旅の目的・達成済み" : "旅の目的"}</span>
          <strong>ダンジョン地下100階にいる「太古からの闇キキルクルス」を倒す</strong>
          <p>${finalObjectiveComplete ? "百層の最奥に待つ太古の闇を討ち、迷宮踏破を成し遂げた。" : "地下100階へ到達し、迷宮最深部にいるキキルクルスを討伐することが、この冒険者の最終目的だ。"}</p>
          ${finalObjectiveComplete ? '<button type="button" id="retireClearedAdventurerButton">この冒険者を引退させる</button>' : ""}
        </div>
        <div class="combat-metrics">
          <div class="combat-metric"><span>通常攻撃期待値</span><strong>${normalExpectation.toFixed(1)}</strong><small>敵防御・弱点・耐性適用前</small></div>
          <div class="combat-metric"><span>1ヒット威力</span><strong>${normalProfile.attackMin}〜${normalProfile.attackMax}</strong><small>${normalProfile.attackTrials}回試行</small></div>
          <div class="combat-metric"><span>命中 / 会心</span><strong>${Math.round(normalProfile.hitChance * 100)}% / ${Math.round(normalProfile.critChance * 100)}%</strong><small>期待ヒット ${(normalProfile.attackTrials * normalProfile.hitChance).toFixed(1)}回</small></div>
          <div class="combat-metric"><span>攻撃属性 / 射程</span><strong>${formatAttackAttributes(normalProfile.attributes)}</strong><small>${jobs[adv.jobId].rangedRange ? `遠距離${jobs[adv.jobId].rangedRange}マス` : "近接1マス"}</small></div>
          <div class="combat-metric"><span>防御 / 回避</span><strong>${stats.defense} / ${Math.round(stats.evasion * 100)}%</strong><small>再生 ${stats.hpRegen} / 行動 ${1 + Math.floor(Math.max(0, stats.acceleration) / 10)}回</small></div>
          <div class="combat-metric"><span>運搬荷重</span><strong>${stats.materialCount}/${stats.materialCapacity}</strong><small>重量ペナルティ ${stats.materialBurden}</small></div>
        </div>
        ${cursePenaltyText ? `<p class="curse-summary">呪耐性により呪いのペナルティは${Math.round((stats.cursePenaltyRate ?? 1) * 100)}%まで軽減中：${cursePenaltyText}</p>` : ""}
        ${adv.personalityId === "lewd" ? `<p class="risque-synergy">すけべ共鳴・真艶覚醒：艶装備${stats.risqueSynergyCount}個（1個ごとに全基礎能力+6・器用さは追加+2・運は追加+6・加速+18）</p>` : ""}
        ${stats.powerPoleAwakened ? '<p class="name-secret-awakened">名前裏技「孫悟空」× ★如意棒：真価解放中</p>' : ""}
        ${stats.rimuruSlimeAwakened ? '<p class="name-secret-awakened">名前裏技「リムル」× 最弱種スライム：魔王覚醒・最強化中</p>' : ""}
        ${active ? `<p>使用魔法：<strong>${active.name}</strong>（${spellbookRankLabel(active.rank)}）</p>` : ""}
      </section>
      <section class="backstory-editor">
        <div><h2>生い立ち</h2><p>最初は名前・種族・性格から生成される。この冒険者の物語として自由に書き直せる。</p></div>
        <textarea id="backstoryInput" maxlength="800" rows="6" aria-label="冒険者の生い立ち">${escapeHtml(adv.backstory || "")}</textarea>
        <div class="inline-actions"><button id="saveBackstoryButton" type="button">生い立ちを保存</button><button id="regenerateBackstoryButton" type="button">初期文を再生成</button></div>
      </section>
      <section class="inventory-section"><h2>魔法書とガラクタ</h2><p>魔法職は魔法書を1冊消費して術を習得する。魔法は固有効果と再詠唱時間を持ち、魔法使い・魔法戦士・プリーストで威力特性が異なる。</p><div class="treasure-sell-list">${inventoryCards}</div></section>
      <section class="inventory-section"><h2>習得魔法</h2><div class="spell-list">${learnedCards}</div></section>
      <section class="inventory-section monster-heart-workshop"><h2>モンスターの心</h2><p>調査度を最大にした魔物から一度だけ得られる。強敵の心ほど強化量が大きい。一つの装備に心を宿せるのは一度だけで、使用した心は失われる。</p>${heartEntries.length ? `<label>使用する心<select id="monsterHeartSelect">${heartOptions}</select></label>` : "<p>まだ心を所持していない。魔物を完全解析せよ。</p>"}</section>
      <section class="equipment-set-board"><div><h2>セット装備</h2><p>2・3・4部位で効果が段階的に発動する。緑色が現在発動中。</p></div><div class="equipment-set-grid">${setBoard}</div></section>
      <section class="resistance-board"><div><h2>装備中の合計耐性</h2><p>同じ属性を重ねて耐性5を作る。呪耐性はアーティファクトのペナルティも軽減する。</p></div><div class="resistance-total-grid">${resistanceBoard}</div></section><div class="equipment-sortbar"><label>並び順<select id="homeSortSelect">
      <option value="name" ${homeSort === "name" ? "selected" : ""}>名前順</option>
      <option value="attack" ${homeSort === "attack" ? "selected" : ""}>攻撃力順</option>
      <option value="defense" ${homeSort === "defense" ? "selected" : ""}>防御力順</option>
    </select></label></div>${sections}`;
    document.querySelectorAll("[data-equip]").forEach((button) => {
      button.addEventListener("click", () => equipAtHome(button.dataset.equip, button.dataset.targetSlot));
    });
    document.querySelectorAll("[data-unequip]").forEach((button) => {
      button.addEventListener("click", () => unequipAtHome(button.dataset.unequip));
    });
    document.querySelectorAll("[data-read-spellbook]").forEach((button) => {
      button.addEventListener("click", () => readSpellbook(button.dataset.readSpellbook));
    });
    document.querySelectorAll("[data-select-spell]").forEach((button) => {
      button.addEventListener("click", () => selectActiveSpell(button.dataset.selectSpell));
    });
    document.querySelectorAll("[data-heart-enhance]").forEach((button) => {
      button.addEventListener("click", () => enhanceEquipmentWithHeart(button.dataset.heartEnhance, selectedMonsterHeartId));
    });
    document.querySelector("#monsterHeartSelect")?.addEventListener("change", (event) => {
      selectedMonsterHeartId = event.target.value;
      renderHome();
    });
    document.querySelector("#saveBackstoryButton").addEventListener("click", saveBackstoryAtHome);
    document.querySelector("#regenerateBackstoryButton").addEventListener("click", () => {
      askConfirm("生い立ちを再生成", "現在の編集内容を、名前・種族・性格から作った初期文へ戻します。", regenerateBackstoryAtHome);
    });
    document.querySelector("#homeSortSelect").addEventListener("change", (event) => {
      homeSort = event.target.value;
      renderHome();
    });
    document.querySelector("#retireClearedAdventurerButton")?.addEventListener("click", requestClearedAdventurerRetirement);
  }

  function requestClearedAdventurerRetirement() {
    const adv = state.adventurer;
    if (adv.inDungeon || !adv.gameCleared) return;
    askConfirm("迷宮踏破者の引退", `${adv.name}を引退させます。称号と引退記録は残り、次の冒険者を作成できます。取り消せません。`, retireClearedAdventurer, null, { ok: "引退する", cancel: "まだ冒険する" });
  }

  function retireClearedAdventurer() {
    const adv = state.adventurer;
    if (adv.inDungeon || !adv.gameCleared) return;
    state.meta.retirementLog.unshift({ name: adv.name, raceId: adv.raceId, jobId: adv.jobId, level: adv.level, deepestFloor: adv.deepestFloor, title: "迷宮踏破者" });
    state.meta.retirementLog = state.meta.retirementLog.slice(0, 24);
    if (!state.meta.titles.includes("迷宮踏破者")) state.meta.titles.push("迷宮踏破者");
    log(`${adv.name}は称号「迷宮踏破者」を胸に冒険者を引退した。酒場では今も、蛇の長さだけが話すたびに伸びている。`);
    playSfx("victory");
    state.dungeon = null;
    state.arena = null;
    state.adventurer.inDungeon = false;
    state.meta.awaitingCreation = true;
    initialSetupPending = true;
    pendingSetup = { raceId: adv.raceId, jobId: adv.jobId, personalityId: adv.personalityId, name: adv.name, preserveMeta: true };
    currentView = "town";
    saveGame();
    renderSetupPanel();
  }

  function saveBackstoryAtHome() {
    if (state.adventurer.inDungeon) return;
    const input = document.querySelector("#backstoryInput");
    state.adventurer.backstory = String(input?.value ?? state.adventurer.backstory ?? "").slice(0, 800);
    log("自宅の冒険記録へ、生い立ちを書き留めた。 ");
    playSfx("select");
    saveGame();
    renderHome();
  }

  function regenerateBackstoryAtHome() {
    const adv = state.adventurer;
    adv.backstory = CHARACTER.generateBackstory({
      name: adv.name,
      race: races[adv.raceId],
      personality: personalities[adv.personalityId],
    });
    log("名前・種族・性格をもとに、生い立ちの初期文を作り直した。 ");
    saveGame();
    renderHome();
  }

  function expectedDamage(profile) {
    if (!profile) return 0;
    let averageHit = 0;
    let outcomes = 0;
    for (let raw = profile.attackMin; raw <= profile.attackMax; raw += 1) {
      averageHit += raw * (1 - profile.critChance) + Math.max(1, Math.round(raw * 1.5)) * profile.critChance;
      outcomes += 1;
    }
    return profile.attackTrials * profile.hitChance * (averageHit / Math.max(1, outcomes));
  }

  function spellbookRankLabel(rankId) {
    return DATA.spellbookRanksById?.[rankId]?.label
      || DATA.spellbookRanks?.find((rank) => rank.id === rankId)?.label
      || rankId;
  }

  function readSpellbook(itemId) {
    const item = treasureItems[itemId];
    const spell = item?.type === "spellbook" ? spells[item.spellId] : null;
    if (!spell || getItemCount(itemId) <= 0 || state.adventurer.inDungeon) return;
    if (!spell.jobs.includes(state.adventurer.jobId)) {
      log(`${jobs[state.adventurer.jobId].name}では${item.name}の術式を理解できない。`);
      return;
    }
    if (state.adventurer.learnedSpells.includes(spell.id)) {
      log(`${spell.name}はすでに習得している。余った魔法書は商店で売れる。`);
      return;
    }
    addItem(itemId, -1);
    state.adventurer.learnedSpells.push(spell.id);
    state.adventurer.activeSpellId = spell.id;
    log(`${item.name}を読み終えた。魔法書は消滅し、${spellbookRankLabel(spell.rank)}魔法「${spell.name}」を習得した。`);
    playSfx("researchUp");
    saveGame();
    render();
  }

  function selectActiveSpell(spellId) {
    const spell = spells[spellId];
    if (!spell || !state.adventurer.learnedSpells.includes(spellId) || !spell.jobs.includes(state.adventurer.jobId)) return;
    state.adventurer.activeSpellId = spellId;
    spellTargetArmed = false;
    log(`使用魔法を「${spell.name}」に設定した。`);
    playSfx("select");
    saveGame();
    render();
  }

  function activeLearnedSpell() {
    const spell = spells[state.adventurer.activeSpellId];
    return spell && state.adventurer.learnedSpells.includes(spell.id) ? spell : null;
  }

  function renderResearch() {
    const completedResearchCount = DATA.monsters.filter((monster) => Number(state.meta.research[monster.id]?.level || 0) >= MAX_RESEARCH_LEVEL).length;
    const seenResearchCount = DATA.monsters.filter((monster) => getResearch(monster.id).seen).length;
    const inProgressCount = DATA.monsters.filter((monster) => {
      const level = getResearch(monster.id).level;
      return level > 0 && level < MAX_RESEARCH_LEVEL;
    }).length;
    const compendiumComplete = completedResearchCount === DATA.monsters.length;
    const floorOrder = (monster) => monster.arenaOnly
      ? 1000 + Number(monster.arenaRank || 0)
      : monsterNativeFloor(monster);
    const sorters = {
      floor: (a, b) => floorOrder(a) - floorOrder(b) || a.name.localeCompare(b.name, "ja"),
      name: (a, b) => a.name.localeCompare(b.name, "ja"),
      research: (a, b) => getResearch(b.id).level - getResearch(a.id).level || floorOrder(a) - floorOrder(b),
      unique: (a, b) => Number(b.unique) - Number(a.unique) || floorOrder(a) - floorOrder(b),
    };
    const query = researchQuery.trim().toLocaleLowerCase("ja");
    const filteredMonsters = DATA.monsters
      .filter((monster) => !monster.arenaOnly || state.meta.research[monster.id]?.seen)
      .filter((monster) => {
        const rec = getResearch(monster.id);
        if (researchFilter === "seen" && !rec.seen) return false;
        if (researchFilter === "unseen" && rec.seen) return false;
        if (researchFilter === "incomplete" && (!rec.seen || rec.level >= MAX_RESEARCH_LEVEL)) return false;
        if (researchFilter === "complete" && rec.level < MAX_RESEARCH_LEVEL) return false;
        if (researchFilter === "unique" && !monster.unique) return false;
        return !query || monster.name.toLocaleLowerCase("ja").includes(query) || monster.id.toLocaleLowerCase().includes(query);
      })
      .slice()
      .sort(sorters[researchSort] || sorters.floor);
    const pageCount = Math.max(1, Math.ceil(filteredMonsters.length / RESEARCH_PAGE_SIZE));
    researchPage = clamp(researchPage, 0, pageCount - 1);
    const resultAnnouncement = `調査記録 ${filteredMonsters.length}体、${researchPage + 1}/${pageCount}ページ`;
    if (els.researchResultCount && els.researchResultCount.textContent !== resultAnnouncement) els.researchResultCount.textContent = resultAnnouncement;
    const visibleMonsters = filteredMonsters.slice(researchPage * RESEARCH_PAGE_SIZE, (researchPage + 1) * RESEARCH_PAGE_SIZE);
    const cards = visibleMonsters
      .map((monster) => {
        const rec = getResearch(monster.id);
        const lines = [];
        for (let level = 1; level <= rec.level; level += 1) {
          if (monster.research[level]) lines.push(`<p>${embellishedResearchNote(monster, level, monster.research[level])}</p>`);
        }
        if (rec.level >= 1 && isHypeThreat(monster)) lines.push(`<p>${monsterThreatHypeDescription(monster)}</p>`);
        if (rec.level >= 2 && monsterCanPhaseWalls(monster)) lines.push("<p>特性記録：実体を薄め、迷宮の内壁を通過する。</p>");
        if (rec.level >= 2) lines.push(`<p>${monsterTriviaDescription(monster)}</p>`);
        if (rec.level >= 3) lines.push(`<p>${monsterAttackFeatureDescription(monster)}</p>`);
        if (rec.level >= 2 && isCharacterfulMonster(monster)) lines.push(`<p>${monsterCharacterDescription(monster, rec.level)}</p>`);
        const floorText = monster.arenaOnly ? `闘技場 第${monster.arenaRank}戦` : BOUNTY.floorHint(monster, MAX_FLOOR);
        const rewardTag = rec.level >= 2 && monster.rewardProfile?.tag === "harvest-rich"
          ? '<span class="reward-tag harvest">剥ぎ取り豊富</span>'
          : rec.level >= 2 && monster.rewardProfile?.tag === "exp-rich" ? '<span class="reward-tag experience">経験値豊富</span>' : "";
        const heartRecord = rec.level >= MAX_RESEARCH_LEVEL
          ? `<p class="heart-enhancement"><strong>${monster.name}の心</strong>：基礎強化+${monsterHeartPower(monster)} / ${attrHtml(monster.attackAttribute)}属性値+${monsterHeartAttributePower(monster)} / ${Number(state.meta.monsterHearts[monster.id] || 0) > 0 ? `所持${state.meta.monsterHearts[monster.id]}個` : "取得済み・消費済み"}</p>`
          : "";
        const dots = Array.from({ length: MAX_RESEARCH_LEVEL }, (_, index) => `<i class="research-level-dot ${index < rec.level ? "filled" : ""}"></i>`).join("");
        const open = researchFocusId === monster.id ? " open" : "";
        const graphicClasses = rec.seen
          ? `research-monster-graphic enemy-${monster.attackAttribute || "neutral"} monster-tier-${monster.colorTier || "white"}${monster.unique ? " unique" : ""}${monster.uniqueStyle ? ` unique-${monster.uniqueStyle}` : ""}`
          : "research-monster-graphic unknown";
        return `<details class="research-card" data-research-card="${monster.id}"${open}>
          <summary><span class="${graphicClasses}" aria-hidden="true">${rec.seen ? monsterMarker(monster) : "?"}</span><span class="monster-research-title"><strong>${rec.seen ? monster.name : "未確認の魔物"}</strong><small>${rec.seen ? `${monsterSpeciesDisplay(monster, rec.level)} / ${monster.colorTierName}階級 / ` : ""}${rec.seen && monster.unique ? "ユニーク / " : ""}${rec.seen ? floorText : "出現階不明"}</small></span><span class="research-level-dots" aria-label="${researchStatusText(rec.level)}">${dots}</span><span>${rec.level}/5</span></summary>
          <div class="research-card-details"><p><strong>${researchStatusText(rec.level)}</strong> ${rewardTag}</p>${heartRecord}${rec.level >= 1 ? `<p class="research-stat-line"><span>基礎最大HP</span><strong>${monster.hp}</strong></p>` : ""}${rec.level >= 3 ? `<p class="research-stat-line"><span>弱点属性</span><strong>${monster.weaknesses?.length ? monster.weaknesses.map(attrHtml).join("・") : "なし"}</strong></p><p class="research-stat-line"><span>耐性属性</span><strong>${Object.keys(monster.resistances || {}).length ? formatResistances(monster.resistances) : "なし"}</strong></p>` : ""}${lines.length ? lines.join("") : "<p>まだ詳細不明。遭遇、戦闘、調査で記録が進む。</p>"}${rec.level >= 4 ? `<p>剥ぎ取り候補：${lootCandidateNames(monster).join("・") || "なし"}</p>` : ""}</div>
        </details>`;
      })
      .join("");
    const bountyCandidates = bountyTargets.slice().sort((a, b) => {
      const knownDifference = Number(Boolean(state.meta.bounties[b.id]?.intel)) - Number(Boolean(state.meta.bounties[a.id]?.intel));
      if (knownDifference) return knownDifference;
      return Math.abs(monsterNativeFloor(a) - state.adventurer.deepestFloor) - Math.abs(monsterNativeFloor(b) - state.adventurer.deepestFloor);
    }).slice(0, 24);
    const bountyCards = bountyCandidates.map((monster) => {
      const record = state.meta.bounties[monster.id];
      const known = Boolean(record?.intel);
      const cost = BOUNTY.intelCost(monster);
      const reward = nextBountyReward(monster);
      return `<article class="research-card bounty-card ${known ? "known" : "locked"}">
        <h2>${monster.name} <small>${BOUNTY.floorHint(monster, MAX_FLOOR)}</small></h2>
        ${known
          ? `<p>次回賞金 ${reward}G / 現冒険者の精算 ${Number(record.claimed || 0)}回</p><p>${monster.research[1] || "危険なユニーク個体。"}</p>`
          : `<p>詳細は未購入。情報料を払うと能力・弱点・剥ぎ取り条件を調査記録へ開示する。</p><button type="button" data-buy-bounty-intel="${monster.id}" ${state.adventurer.gold < cost ? "disabled" : ""}>${cost}Gで情報を買う</button>`}
      </article>`;
    }).join("");
    const deaths = state.meta.deathLog.map((item) => `<p>${item}</p>`).join("") || "<p>死因記録なし。</p>";
    els.researchView.innerHTML = `
      <section class="research-dashboard">
        <div><h2>万象調査記録</h2><p>${compendiumComplete ? "全モンスターの完全解析を達成済み。" : "遭遇・交戦・被弾・剥ぎ取りで調査度が進む。5/5で全情報が判明する。"}</p>${state.meta.compendiumEquipmentUnlocked ? "<p>称号「万象の記録者」・報酬受領済み</p>" : ""}</div>
        <div class="research-counts"><div class="research-count"><span>確認</span><strong>${seenResearchCount}</strong></div><div class="research-count"><span>解析中</span><strong>${inProgressCount}</strong></div><div class="research-count"><span>完全解析</span><strong>${completedResearchCount} / ${DATA.monsters.length}</strong></div></div>
        <div class="research-progress-track"><i class="research-progress-fill" style="width:${Math.round((completedResearchCount / DATA.monsters.length) * 100)}%"></i></div>
      </section>
      <section class="research-death-history">
        <article class="research-card">
          <h2>死亡歴 <small>累計${state.meta.deaths}回</small></h2>
          ${deaths}
        </article>
      </section>
      <details class="research-bounties"><summary><strong>注目賞金首台帳</strong><small>購入済みと到達深度周辺の24件</small></summary><p>情報購入後に対象を倒し、遺体を回収して生還し、ギルドで報酬を受け取る。</p><div class="card-list">${bountyCards}</div></details>
      <section class="research-monsters">
        <div class="research-tools">
          <div class="research-search"><label for="researchQueryInput">名前・ID検索</label><div><input id="researchQueryInput" type="search" value="${escapeHtml(researchQuery)}" placeholder="モンスター名"><button id="researchSearchButton" type="button">検索</button></div></div>
          <label>表示<select id="researchFilterSelect">
            <option value="seen" ${researchFilter === "seen" ? "selected" : ""}>確認済み</option>
            <option value="all" ${researchFilter === "all" ? "selected" : ""}>全モンスター</option>
            <option value="unseen" ${researchFilter === "unseen" ? "selected" : ""}>未確認</option>
            <option value="incomplete" ${researchFilter === "incomplete" ? "selected" : ""}>解析途中</option>
            <option value="complete" ${researchFilter === "complete" ? "selected" : ""}>完全解析</option>
            <option value="unique" ${researchFilter === "unique" ? "selected" : ""}>ユニーク</option>
          </select></label>
          <label>並び順<select id="researchSortSelect">
            <option value="floor" ${researchSort === "floor" ? "selected" : ""}>出現階順</option>
            <option value="name" ${researchSort === "name" ? "selected" : ""}>名前順</option>
            <option value="research" ${researchSort === "research" ? "selected" : ""}>調査度順</option>
            <option value="unique" ${researchSort === "unique" ? "selected" : ""}>ユニーク優先</option>
          </select></label>
          <strong>${filteredMonsters.length}体</strong>
        </div>
        <div class="list-pager"><button type="button" data-research-page="prev" ${researchPage === 0 ? "disabled" : ""}>前へ</button><strong>${researchPage + 1}/${pageCount}</strong><span>${filteredMonsters.length ? `${researchPage * RESEARCH_PAGE_SIZE + 1}〜${Math.min(filteredMonsters.length, (researchPage + 1) * RESEARCH_PAGE_SIZE)}件` : "0件"}</span><button type="button" data-research-page="next" ${researchPage >= pageCount - 1 ? "disabled" : ""}>次へ</button></div>
        <div class="card-list">${cards || "<p>条件に一致する記録がない。</p>"}</div>
      </section>
    `;
    document.querySelector("#researchFilterSelect").addEventListener("change", (event) => {
      researchFilter = event.target.value;
      researchPage = 0;
      renderResearch();
      document.querySelector("#researchFilterSelect")?.focus();
    });
    document.querySelector("#researchSortSelect").addEventListener("change", (event) => {
      researchSort = event.target.value;
      researchPage = 0;
      renderResearch();
      document.querySelector("#researchSortSelect")?.focus();
    });
    const submitSearch = () => {
      researchQuery = document.querySelector("#researchQueryInput").value;
      researchPage = 0;
      researchFocusId = null;
      renderResearch();
      document.querySelector("#researchQueryInput")?.focus();
    };
    document.querySelector("#researchSearchButton").addEventListener("click", submitSearch);
    document.querySelector("#researchQueryInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.isComposing) submitSearch();
    });
    document.querySelectorAll("[data-research-page]").forEach((button) => button.addEventListener("click", () => {
      researchPage += button.dataset.researchPage === "next" ? 1 : -1;
      researchFocusId = null;
      renderResearch();
      els.researchView.scrollTop = 0;
      document.querySelector(`[data-research-page="${button.dataset.researchPage}"]`)?.focus();
    }));
    document.querySelectorAll("[data-research-card]").forEach((card) => card.addEventListener("toggle", () => {
      if (card.open) researchFocusId = card.dataset.researchCard;
      else if (researchFocusId === card.dataset.researchCard) researchFocusId = null;
    }));
    document.querySelectorAll("[data-buy-bounty-intel]").forEach((button) => {
      button.addEventListener("click", () => buyBountyIntel(button.dataset.buyBountyIntel));
    });
  }

  function buyBountyIntel(monsterId) {
    const monster = monsters[monsterId];
    if (!monster?.unique || monster.arenaOnly || state.meta.bounties[monsterId]?.intel) return;
    const cost = BOUNTY.intelCost(monster);
    if (state.adventurer.gold < cost) return;
    state.adventurer.gold -= cost;
    state.meta.bounties[monsterId] = { intel: true, claimed: Number(state.meta.bounties[monsterId]?.claimed || 0) };
    markResearch(monsterId, MAX_RESEARCH_LEVEL, { force: true });
    log(`${cost}Gを払い、賞金首「${monster.name}」の完全な調査資料を入手した。`);
    playSfx("researchUp");
    saveGame();
    render();
  }

  function renderShop() {
    const adv = state.adventurer;
    const sellable = Object.entries(adv.materials).filter(([, count]) => count > 0);
    const sellableTreasures = (DATA.treasureItems || []).filter((item) => getItemCount(item.id) > 0 && item.sellPrice > 0);
    const equippedIds = new Set(Object.values(adv.equipment).filter(Boolean));
    const sellableEquipment = adv.ownedEquipment
      .map((id) => equipment[id])
      .filter((item) => item && !item.artifact && !equippedIds.has(item.id) && !item.masterOnly && !item.completionOnly)
      .sort((a, b) => ECONOMY.equipmentSellPrice(b, adv.craftedDetails[b.id]) - ECONOMY.equipmentSellPrice(a, adv.craftedDetails[a.id]));
    const shopSorters = {
      price: (a, b) => shopItemPrice(a) - shopItemPrice(b),
      priceDesc: (a, b) => shopItemPrice(b) - shopItemPrice(a),
      attack: (a, b) => (b.attack || 0) - (a.attack || 0),
      defense: (a, b) => (b.defense || 0) - (a.defense || 0),
      acceleration: (a, b) => (b.acceleration || 0) - (a.acceleration || 0),
      regen: (a, b) => (b.hpRegen || 0) - (a.hpRegen || 0),
      name: (a, b) => a.name.localeCompare(b.name, "ja"),
    };
    const stock = state.meta.shop.inventory
      .map((id) => equipment[id])
      .filter((item) => item
        && !item.artifact
        && (shopSlot === "all" || item.slot === shopSlot)
        && (!shopCompatibleOnly || item.jobs.includes(adv.jobId)))
      .sort(shopSorters[shopSort] || shopSorters.price);
    const pageCount = Math.max(1, Math.ceil(stock.length / 24));
    shopPage = clamp(shopPage, 0, pageCount - 1);
    const visibleStock = stock.slice(shopPage * 24, (shopPage + 1) * 24);
    els.shopView.innerHTML = `
      <section class="shop-wallet"><span>所持金</span><strong>${adv.gold}G</strong><small>死亡すると売却実績と入荷状況も失う。</small></section>
      <section class="shop-section">
        <h2>素材を売る</h2>
        <div class="shop-material-list">${sellable.length ? sellable.map(([id, count]) => `
          <article><div><strong>${materials[id].name}</strong><small>所持${count} / 1個${materialSellPrice(id)}G / 累計流通${state.meta.shop.soldMaterials[id] || 0}</small></div>
          <button type="button" data-sell-one="${id}">1個売る</button><button type="button" data-sell-all="${id}">全部売る</button></article>
        `).join("") : "<p>売却できる素材がない。</p>"}</div>
      </section>
      <section class="shop-section">
        <h2>宝箱の品を売る</h2>
        <p class="guild-guidance">魔法書は読まずに換金できる。ガラクタも収集家が買い取る。アーティファクトは商店では扱わない。</p>
        <div class="treasure-sell-list">${sellableTreasures.length ? sellableTreasures.map((item) => `<article class="inventory-card"><div><strong>${item.name}</strong><small>${treasureTierLabel(item)}${treasureTierLabel(item) ? " / " : ""}所持${getItemCount(item.id)} / 1個${item.sellPrice}G</small></div><button type="button" data-sell-item-one="${item.id}">1個売る</button><button type="button" data-sell-item-all="${item.id}">全部売る</button></article>`).join("") : "<p>売却できる宝箱の品がない。</p>"}</div>
      </section>
      <section class="shop-section">
        <h2>未装備の装備品を売る</h2>
        <p class="guild-guidance">装備中の品、アーティファクト、永続報酬は売却できない。初期支給品も別の装備へ替えれば売却でき、売った装備品は失われる。</p>
        <div class="card-list">${sellableEquipment.length ? sellableEquipment.map((item) => {
          const price = ECONOMY.equipmentSellPrice(item, adv.craftedDetails[item.id]);
          return `<article class="equipment-card"><strong>${equipmentDisplayName(item)}</strong><p>${ECONOMY.equipmentStats(item)} / ${formatAttackAttributes(equipmentAttackAttributes(item)) || "攻撃属性なし"} / ${formatResistances(item.resistances) || "耐性なし"}</p><button type="button" data-sell-equipment="${item.id}">${price}Gで売る</button></article>`;
        }).join("") : "<p>売却できる未装備品がない。</p>"}</div>
      </section>
      <section class="shop-section">
        <h2>流通装備品</h2>
        <div class="equipment-sortbar">
          <label>装備品<select id="shopSlotSelect"><option value="all" ${shopSlot === "all" ? "selected" : ""}>すべて</option><option value="weapon" ${shopSlot === "weapon" ? "selected" : ""}>武器</option><option value="upper" ${shopSlot === "upper" ? "selected" : ""}>上半身</option><option value="lower" ${shopSlot === "lower" ? "selected" : ""}>下半身</option><option value="feet" ${shopSlot === "feet" ? "selected" : ""}>足回り</option><option value="accessory" ${shopSlot === "accessory" ? "selected" : ""}>装飾品</option></select></label>
          <label>装備条件<select id="shopCompatibilitySelect"><option value="all" ${!shopCompatibleOnly ? "selected" : ""}>全職業を表示</option><option value="current" ${shopCompatibleOnly ? "selected" : ""}>${jobs[adv.jobId].name}で装備可能のみ</option></select></label>
          <label>並び順<select id="shopSortSelect"><option value="price" ${shopSort === "price" ? "selected" : ""}>価格が安い順</option><option value="priceDesc" ${shopSort === "priceDesc" ? "selected" : ""}>価格が高い順</option><option value="attack" ${shopSort === "attack" ? "selected" : ""}>攻撃力順</option><option value="defense" ${shopSort === "defense" ? "selected" : ""}>防御力順</option><option value="acceleration" ${shopSort === "acceleration" ? "selected" : ""}>加速度順</option><option value="regen" ${shopSort === "regen" ? "selected" : ""}>再生効果順</option><option value="name" ${shopSort === "name" ? "selected" : ""}>名前順</option></select></label>
        </div>
        <div class="list-pager"><button type="button" data-shop-page="prev" ${shopPage === 0 ? "disabled" : ""}>前へ</button><strong>${shopPage + 1}/${pageCount}</strong><span>全${stock.length}件</span><button type="button" data-shop-page="next" ${shopPage >= pageCount - 1 ? "disabled" : ""}>次へ</button></div>
        <div class="card-list">${visibleStock.length ? visibleStock.map((item) => {
          const price = shopItemPrice(item);
          const owned = ownsEquipment(item.id);
          return `<article class="recipe-card"><h2>${equipmentDisplayName(item)}</h2><p>${item.description}</p><div class="stat-row"><span>性能</span><div>${ECONOMY.equipmentStats(item)}</div></div><div class="stat-row"><span>攻撃属性</span><div>${formatAttackAttributes(equipmentAttackAttributes(item)) || "なし"}</div></div><div class="stat-row"><span>耐性</span><div>${formatResistances(item.resistances) || "なし"}</div></div><div class="stat-row"><span>装備可能</span><div>${equipmentJobNames(item)}</div></div><button type="button" data-buy="${item.id}" ${owned || adv.gold < price ? "disabled" : ""}>${owned ? "購入済み" : `${price}Gで購入`}</button></article>`;
        }).join("") : `<p>${shopCompatibleOnly ? `現在の職業「${jobs[adv.jobId].name}」で装備できる流通品がない。` : "素材を売ると装備が入荷する。"}</p>`}</div>
      </section>`;
    document.querySelectorAll("[data-sell-one]").forEach((button) => button.addEventListener("click", () => sellMaterial(button.dataset.sellOne, 1)));
    document.querySelectorAll("[data-sell-all]").forEach((button) => button.addEventListener("click", () => sellMaterial(button.dataset.sellAll, getMaterialCount(button.dataset.sellAll))));
    document.querySelectorAll("[data-sell-item-one]").forEach((button) => button.addEventListener("click", () => sellTreasureItem(button.dataset.sellItemOne, 1)));
    document.querySelectorAll("[data-sell-item-all]").forEach((button) => button.addEventListener("click", () => sellTreasureItem(button.dataset.sellItemAll, getItemCount(button.dataset.sellItemAll))));
    document.querySelectorAll("[data-sell-equipment]").forEach((button) => button.addEventListener("click", () => requestEquipmentSale(button.dataset.sellEquipment)));
    document.querySelectorAll("[data-buy]").forEach((button) => button.addEventListener("click", () => buyEquipment(button.dataset.buy)));
    document.querySelectorAll("[data-shop-page]").forEach((button) => button.addEventListener("click", () => {
      shopPage += button.dataset.shopPage === "next" ? 1 : -1;
      renderShop();
      els.shopView.scrollTop = 0;
    }));
    document.querySelector("#shopSlotSelect").addEventListener("change", (event) => {
      shopSlot = event.target.value;
      shopPage = 0;
      renderShop();
    });
    document.querySelector("#shopCompatibilitySelect").addEventListener("change", (event) => {
      shopCompatibleOnly = event.target.value === "current";
      shopPage = 0;
      renderShop();
    });
    document.querySelector("#shopSortSelect").addEventListener("change", (event) => {
      shopSort = event.target.value;
      shopPage = 0;
      renderShop();
    });
  }

  function materialSellPrice(materialId) {
    return ECONOMY.materialSellPrice(DATA, materialId);
  }

  function junkTokenValue(item) {
    const tierMultiplier = item?.junkTier === "legend" ? 2 : item?.junkTier === "ultra_luxury" ? 1.5 : item?.junkTier === "luxury" ? 1.25 : 1;
    return Math.max(1, Math.ceil(Number(item?.sellPrice || 1) * tierMultiplier / 8));
  }

  function junkMaterialCost(material) {
    return material?.junkDealerTier === "ultra" ? 7200 : material?.junkDealerTier === "super" ? 1440 : 540;
  }

  function recoveryMedicineCost(source) {
    return source === "guild" ? RECOVERY_MEDICINE.guildCost : RECOVERY_MEDICINE.junkTokenCost;
  }

  function junkDealerMaterialEligible(material) {
    return ["refined", "super", "ultra"].includes(material?.junkDealerTier);
  }

  function shuffledCopy(values) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  function refreshJunkDealerStock() {
    const tiers = { refined: 6, super: 4, ultra: 2 };
    state.meta.junkDealerStock = Object.entries(tiers).flatMap(([tier, count]) => shuffledCopy(
      DATA.materials.filter((material) => material.junkDealerTier === tier),
    ).slice(0, count).map((material) => material.id));
    saveGame();
  }

  function renderJunkDealer() {
    const adv = state.adventurer;
    const medicineCost = recoveryMedicineCost("junk");
    const ownedJunk = (DATA.junkItems || []).filter((item) => getItemCount(item.id) > 0)
      .sort((a, b) => junkTokenValue(b) - junkTokenValue(a));
    if (!Array.isArray(state.meta.junkDealerStock) || state.meta.junkDealerStock.length !== 12) refreshJunkDealerStock();
    const rareMaterials = state.meta.junkDealerStock.map((id) => materials[id]).filter(junkDealerMaterialEligible)
      .sort((a, b) => junkMaterialCost(a) - junkMaterialCost(b) || a.name.localeCompare(b.name, "ja"));
    els.junkDealerView.innerHTML = `
      <section class="junk-dealer-header"><div><span>ガラクタマニア</span><h2>珍品偏愛堂</h2><p>「金じゃない。用途の分からなさにこそ価値がある」</p></div><strong>偏愛札 ${adv.junkTokens}</strong></section>
      <button type="button" id="closeJunkDealerButton">街へ戻る</button>
      <section class="shop-section"><h2>ガラクタを鑑定へ出す</h2><p class="guild-guidance">商店でGに換える代わりに偏愛札へ交換する。高級品ほど査定倍率が高い。</p>
        <div class="treasure-sell-list">${ownedJunk.length ? ownedJunk.map((item) => `<article class="inventory-card"><div><strong>${item.name}</strong><small>${treasureTierLabel(item)} / 所持${getItemCount(item.id)} / 1個${junkTokenValue(item)}札</small></div><button type="button" data-appraise-junk-one="${item.id}">1個交換</button><button type="button" data-appraise-junk-all="${item.id}">全部交換</button></article>`).join("") : "<p>鑑定に出せるガラクタを持っていない。</p>"}</div>
      </section>
      <section class="shop-section"><h2>本日の珍素材・12枠</h2><p class="guild-guidance">上位加工素材540札、超レア1,440札、ウルトラレア7,200札。全48種の候補から毎回来店時に6・4・2枠をランダム陳列する。店内にいる間は品揃えが変わらない。</p>
        <div class="card-list">${rareMaterials.map((material) => { const cost = junkMaterialCost(material); return `<article class="recipe-card"><h2>${material.name}</h2><p>${material.description}</p><button type="button" data-junk-material="${material.id}" ${adv.junkTokens < cost ? "disabled" : ""}>${cost}札で交換</button></article>`; }).join("")}</div>
      </section>
      <section class="shop-section"><h2>偏愛堂の秘蔵品</h2><p class="guild-guidance">HPを完全回復する希少薬。ダンジョン内で1行動を使って飲む。</p><article class="recipe-card"><h2>${RECOVERY_MEDICINE.name}</h2><p>所持${getItemCount(RECOVERY_MEDICINE.id)}個。瓶だけはなぜか店主の私物である。</p><button type="button" data-junk-medicine ${adv.junkTokens < medicineCost ? "disabled" : ""}>${medicineCost}札で交換</button></article></section>`;
    document.querySelector("#closeJunkDealerButton")?.addEventListener("click", () => switchView("town"));
    document.querySelectorAll("[data-appraise-junk-one]").forEach((button) => button.addEventListener("click", () => appraiseJunk(button.dataset.appraiseJunkOne, 1)));
    document.querySelectorAll("[data-appraise-junk-all]").forEach((button) => button.addEventListener("click", () => appraiseJunk(button.dataset.appraiseJunkAll, getItemCount(button.dataset.appraiseJunkAll))));
    document.querySelectorAll("[data-junk-material]").forEach((button) => button.addEventListener("click", () => exchangeJunkMaterial(button.dataset.junkMaterial)));
    document.querySelector("[data-junk-medicine]")?.addEventListener("click", () => exchangeRecoveryMedicine("junk"));
  }

  function appraiseJunk(itemId, amount) {
    const item = treasureItems[itemId];
    const count = Math.min(getItemCount(itemId), Math.max(0, Math.floor(Number(amount || 0))));
    if (item?.type !== "junk" || !count) return;
    const tokens = junkTokenValue(item) * count;
    addItem(itemId, -count);
    state.adventurer.junkTokens += tokens;
    log(`ガラクタマニアが「${item.name}」${count}個を偏愛札${tokens}枚で引き取った。`);
    playSfx("coinSell");
    saveGame();
    render();
  }

  function exchangeJunkMaterial(materialId) {
    const material = materials[materialId];
    if (!junkDealerMaterialEligible(material) || !state.meta.junkDealerStock.includes(materialId)) return;
    const cost = junkMaterialCost(material);
    if (state.adventurer.junkTokens < cost) return;
    state.adventurer.junkTokens -= cost;
    addMaterial(materialId, 1);
    log(`偏愛札${cost}枚を「${material.name}」と交換した。ガラクタマニアは別れを惜しんで泣いた。`);
    playSfx("craft");
    saveGame();
    render();
  }

  function renderGuild() {
    const adv = state.adventurer;
    const medicineCost = recoveryMedicineCost("guild");
    const equippedIds = new Set(Object.values(adv.equipment).filter(Boolean));
    const donationCandidates = adv.ownedEquipment
      .map((id) => equipment[id])
      .filter((item) => item && !equippedIds.has(item.id))
      .sort((a, b) => ECONOMY.guildPointValue(b, adv.craftedDetails[b.id]) - ECONOMY.guildPointValue(a, adv.craftedDetails[a.id]));
    const artifactDonations = donationCandidates.filter((item) => item.artifact);
    const donations = donationCandidates.filter((item) => !item.artifact);
    const rewards = DATA.equipment.filter((item) => item.guildCost).sort((a, b) => a.guildCost - b.guildCost);
    const pendingClaims = state.meta.guildClaims || [];
    const pendingTotal = pendingClaims.reduce((sum, corpse) => sum + Number(corpse.reward || 0), 0);
    const relevantBounties = bountyTargets.slice().sort((a, b) => {
      const knownDifference = Number(Boolean(state.meta.bounties[b.id]?.intel)) - Number(Boolean(state.meta.bounties[a.id]?.intel));
      return knownDifference || Math.abs(monsterNativeFloor(a) - adv.deepestFloor) - Math.abs(monsterNativeFloor(b) - adv.deepestFloor);
    }).slice(0, 32);
    const bountyBoard = relevantBounties.map((monster) => {
      const record = state.meta.bounties[monster.id];
      const cost = BOUNTY.intelCost(monster);
      return `<article class="guild-bounty-row"><div><strong>${monster.name}</strong><small>${BOUNTY.floorHint(monster, MAX_FLOOR)} / ${record?.intel ? `情報購入済み・次回賞金${nextBountyReward(monster)}G` : `情報料${cost}G`}</small></div><button type="button" data-open-bounty-research="${monster.id}" ${!record?.intel && adv.gold < cost ? "disabled" : ""}>${record?.intel ? "調査を見る" : "情報を買う"}</button></article>`;
    }).join("");
    els.guildView.innerHTML = `
      <section class="guild-wallet"><span>現在のギルドポイント</span><strong>${adv.guildPoints}GP</strong><small>死亡すると全て失う。交換した装備も死亡時に失う。</small></section>
      <section class="guild-section guild-claims"><h2>報酬受取</h2><p class="guild-guidance">持ち帰った賞金首の遺体を確認し、ここで報酬を受け取る。</p>${pendingClaims.length ? `<div>${pendingClaims.map((corpse) => `<article class="guild-claim-row"><span>${corpse.name}</span><strong>${corpse.reward}G</strong></article>`).join("")}</div><button type="button" id="claimGuildRewardsButton">${pendingClaims.length}件・合計${pendingTotal}Gを受け取る</button>` : "<p>受取可能な報酬はない。</p>"}</section>
      <section class="guild-section"><h2>アーティファクト納品</h2><p class="guild-guidance">固定品の★印とランダム生成品の☆印は商店で売れない。装備から外してギルドへ納めるとGPに交換できる。</p><div class="card-list">${artifactDonations.length ? artifactDonations.map((item) => {
        const points = ECONOMY.guildPointValue(item, adv.craftedDetails[item.id]);
        return `<article class="equipment-card artifact-card"><span class="artifact-tier">${item.artifact.label}</span>${item.curse ? '<span class="cursed-label">呪われている</span>' : ""}<strong>${equipmentDisplayName(item)}</strong><p>${ECONOMY.equipmentStats(item)} / ${formatAttackAttributes(equipmentAttackAttributes(item)) || "攻撃属性なし"} / ${formatResistances(item.resistances) || "耐性なし"}</p><button type="button" data-guild-donate="${item.id}">${points}GPで納める</button></article>`;
      }).join("") : "<p>納品できるアーティファクトがない。</p>"}</div></section>
      <details class="guild-section"><summary><strong>賞金首出現情報</strong><small>購入済みと到達深度周辺の32件</small></summary><p class="guild-guidance">目撃報告から推定した大まかな階層。出現には幅がある。</p><div class="guild-bounty-list">${bountyBoard}</div></details>
      <section class="guild-section"><h2>GP交換所</h2><p class="guild-guidance">必要ポイントを満たすと交換できる。景品は常に全件表示される。</p><div class="card-list">${rewards.map((item) => {
        const owned = ownsEquipment(item.id);
        return `<article class="guild-reward ${adv.guildPoints >= item.guildCost ? "available" : ""}"><div class="guild-cost">${item.guildCost}GP</div><h2>${equipmentDisplayName(item)}</h2><p>${item.description}</p><div class="stat-row"><span>性能</span><div>${ECONOMY.equipmentStats(item)}</div></div><div class="stat-row"><span>攻撃属性</span><div>${formatAttackAttributes(equipmentAttackAttributes(item)) || "なし"}</div></div><div class="stat-row"><span>耐性</span><div>${formatResistances(item.resistances) || "なし"}</div></div><button type="button" data-guild-exchange="${item.id}" ${owned || adv.guildPoints < item.guildCost ? "disabled" : ""}>${owned ? "交換済み" : `${item.guildCost}GPで交換`}</button></article>`;
      }).join("")}<article class="guild-reward ${adv.guildPoints >= medicineCost ? "available" : ""}"><div class="guild-cost">${medicineCost}GP</div><h2>${RECOVERY_MEDICINE.name}</h2><p>HPを完全回復する希少な使い切り薬。所持${getItemCount(RECOVERY_MEDICINE.id)}個。</p><button type="button" data-guild-medicine ${adv.guildPoints < medicineCost ? "disabled" : ""}>${medicineCost}GPで交換</button></article></div></section>
      <section class="guild-section"><h2>装備引取</h2><p class="guild-guidance">装備から外した所持品は種類を問わずGPで引き取る。再入手できる品は何度でも納品できる。装備中の品だけは引き取れず、永続報酬を納品した場合、その冒険者には再支給されない。</p><div class="card-list">${donations.length ? donations.map((item) => {
        const points = ECONOMY.guildPointValue(item, adv.craftedDetails[item.id]);
        return `<article class="equipment-card"><strong>${equipmentDisplayName(item)}</strong><p>${ECONOMY.equipmentStats(item)} / ${formatResistances(item.resistances) || "耐性なし"}</p><button type="button" data-guild-donate="${item.id}">${points}GPで引き取ってもらう</button></article>`;
      }).join("") : "<p>引き取り可能な装備がない。</p>"}</div></section>`;
    document.querySelector("#claimGuildRewardsButton")?.addEventListener("click", settleBountyCorpses);
    document.querySelectorAll("[data-guild-donate]").forEach((button) => button.addEventListener("click", () => requestGuildDonation(button.dataset.guildDonate)));
    document.querySelectorAll("[data-guild-exchange]").forEach((button) => button.addEventListener("click", () => exchangeGuildReward(button.dataset.guildExchange)));
    document.querySelector("[data-guild-medicine]")?.addEventListener("click", () => exchangeRecoveryMedicine("guild"));
    document.querySelectorAll("[data-open-bounty-research]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.openBountyResearch;
      if (!state.meta.bounties[id]?.intel) buyBountyIntel(id);
      else {
        researchFocusId = id;
        researchQuery = monsters[id]?.name || "";
        researchFilter = "all";
        researchPage = 0;
        switchView("research");
      }
    }));
  }

  function requestGuildDonation(itemId) {
    const item = equipment[itemId];
    if (!item || !canDisposeEquipment(itemId, { allowArtifact: true, allowProtected: true, allowPermanent: true })) return;
    const points = ECONOMY.guildPointValue(item, state.adventurer.craftedDetails[itemId]);
    askConfirm(item.artifact ? "アーティファクト納品" : "装備引取", `${equipmentDisplayName(item)}を手放して${points}GPを受け取ります。取り消せません。`, () => donateEquipment(itemId, points));
  }

  function donateEquipment(itemId, points) {
    const item = equipment[itemId];
    if (!item || !canDisposeEquipment(itemId, { allowArtifact: true, allowProtected: true, allowPermanent: true })) return;
    const actualPoints = ECONOMY.guildPointValue(item, state.adventurer.craftedDetails[itemId]);
    state.adventurer.ownedEquipment = state.adventurer.ownedEquipment.filter((id) => id !== itemId);
    delete state.adventurer.craftedDetails[itemId];
    state.adventurer.guildPoints += actualPoints;
    if ((item.masterOnly || item.completionOnly) && !state.meta.donatedPermanentEquipmentIds.includes(item.id)) {
      state.meta.donatedPermanentEquipmentIds.push(item.id);
    }
    log(`${equipmentDisplayName(item)}をギルドへ引き渡し、${actualPoints}GPを得た。`);
    if (item.artifact?.random) {
      delete state.adventurer.randomArtifacts[itemId];
      delete equipment[itemId];
      state.adventurer.discoveredArtifacts = state.adventurer.discoveredArtifacts.filter((id) => id !== itemId);
    }
    playSfx("coinSell");
    saveGame();
    render();
  }

  function exchangeGuildReward(itemId) {
    const item = equipment[itemId];
    if (!item?.guildCost || ownsEquipment(itemId) || state.adventurer.guildPoints < item.guildCost) return;
    state.adventurer.guildPoints -= item.guildCost;
    state.adventurer.ownedEquipment.push(itemId);
    log(`${item.guildCost}GPを使い、ギルド景品「${equipmentDisplayName(item)}」を受け取った。`);
    playSfx("victory");
    saveGame();
    render();
  }

  function exchangeRecoveryMedicine(source) {
    const guildExchange = source === "guild";
    const cost = recoveryMedicineCost(source);
    const walletKey = guildExchange ? "guildPoints" : "junkTokens";
    if (Number(state.adventurer[walletKey] || 0) < cost) return;
    state.adventurer[walletKey] -= cost;
    addItem(RECOVERY_MEDICINE.id, 1);
    log(`${guildExchange ? `${cost}GP` : `偏愛札${cost}枚`}を使い、「${RECOVERY_MEDICINE.name}」を受け取った。`);
    playSfx("craft");
    saveGame();
    render();
  }

  // Spatial arena controller.
  function renderArena() {
    const arena = state.arena;
    if (!arena) {
      els.arenaView.innerHTML = `<section class="arena-intro"><h2>修練連武闘技場</h2><p>9×9の戦場で${ARENA_BATTLE_COUNT}体の専用ユニークへ順番に挑む。同じ相手との再戦を含め、勝利するたびG・経験値・GPを満額獲得できる。</p><div class="arena-record"><span>最高到達</span><strong>第${state.adventurer.arenaBestRound}戦</strong></div><button type="button" id="arenaStartButton">第1戦から挑戦</button></section>`;
      document.querySelector("#arenaStartButton").addEventListener("click", startArenaRun);
      return;
    }
    ensureArenaField(arena);
    const enemy = arena.enemy;
    const rec = getResearch(enemy.id);
    const hpRate = Math.max(0, Math.round((enemy.hp / enemy.maxHp) * 100));
    const distance = arenaDistance(arena.player, enemy);
    const currentJob = jobs[state.adventurer.jobId];
    const rangedRange = Number(currentJob.rangedRange || 0);
    const arenaHealCooldown = Number(arena.healCooldown || 0);
    const arenaJobSkillCooldown = jobSkillCooldownRemaining(currentJob.skill.id);
    const arenaSkillDisabled = currentJob.skill.tag === "heal"
      && (arenaHealCooldown > 0 || state.adventurer.hp >= getPlayerStats().maxHp);
    const arenaSkillLabel = currentJob.skill.tag === "capoeira_stance"
      ? capoeiraActive(arena) ? "カポエラ解除" : `技・${currentJob.skill.name}`
      : currentJob.skill.tag === "heal" && arenaHealCooldown > 0
        ? `${currentJob.skill.name} ${arenaHealCooldown}`
        : arenaJobSkillCooldown > 0 ? `${currentJob.skill.name} ${arenaJobSkillCooldown}` : `技・${currentJob.skill.name}`;
    const arenaSpell = activeLearnedSpell();
    const arenaSpellUsable = Boolean(arenaSpell?.jobs?.includes(state.adventurer.jobId));
    const arenaSpellCooldown = arenaSpell ? spellCooldownRemaining(arenaSpell.id) : 0;
    const cellsHtml = Array.from({ length: arena.size * arena.size }, (_, index) => {
      const x = index % arena.size;
      const y = Math.floor(index / arena.size);
      const obstacle = arena.obstacles.some((item) => item.x === x && item.y === y);
      const player = arena.player.x === x && arena.player.y === y;
      const foe = enemy.alive && enemy.x === x && enemy.y === y;
      if (obstacle) return `<span class="arena-cell arena-pillar" aria-label="柱">◆</span>`;
      if (player) return `<span class="arena-cell arena-player${state.adventurer.jobId === "ninja" ? " player-unlit" : ""}${capoeiraActive(arena) ? " capoeira-inverted" : ""}" aria-label="冒険者${capoeiraActive(arena) ? "・カポエラ状態" : ""}">@</span>`;
      if (foe) {
        const markerData = monsters[enemy.id] || enemy;
        const markerStyle = `--arena-marker-hue:${Number(markerData.arenaMarkerHue || 18)};--arena-marker-accent-hue:${Number(markerData.arenaMarkerAccentHue || 36)};--arena-marker-family-hue:${Number(markerData.arenaMarkerFamilyHue || 18)}`;
        return `<button type="button" class="arena-cell arena-foe monster-tier-${enemy.colorTier || "white"} unique-${enemy.uniqueStyle || "warrior"}" style="${markerStyle}" data-arena-enemy aria-label="${enemy.name}を狙う">${monsterMarker(enemy)}</button>`;
      }
      return `<span class="arena-cell arena-floor"></span>`;
    }).join("");
    const arenaStats = [
      rec.level >= 1 ? `${attrHtml(enemy.attackAttribute)}属性 / 加速度${enemy.acceleration || 0}` : null,
      rec.level >= 2 ? `攻撃${enemy.attack} / 防御${enemy.defense}` : null,
      rec.level >= 3 ? `弱点${enemy.weaknesses.map(attrHtml).join("・") || "なし"}` : null,
    ].filter(Boolean).join(" / ");
    const hpText = rec.level >= 1 ? `HP ${Math.max(0, enemy.hp)}/${enemy.maxHp}` : "HP ???";
    const rangeText = rangedRange ? `距離${distance}・射程${rangedRange}` : `距離${distance}・接近攻撃`;
    const researchText = `調査${rec.level}/${MAX_RESEARCH_LEVEL}${rec.level >= MAX_RESEARCH_LEVEL ? " MAX" : ""}`;
    const tactical = `
      <div class="arena-tactical-layout">
        <div class="arena-map" role="grid" aria-label="修練連武闘技場の戦場">${cellsHtml}</div>
        <div class="arena-move-pad" aria-label="修練連武闘技場8方向移動">
          <button type="button" data-arena-move="-1,-1" aria-label="左上へ移動">↖</button>
          <button type="button" data-arena-move="0,-1" aria-label="上へ移動">▲</button>
          <button type="button" data-arena-move="1,-1" aria-label="右上へ移動">↗</button>
          <button type="button" data-arena-move="-1,0" aria-label="左へ移動">◀</button>
          <button type="button" data-arena-guard aria-label="防御">防</button>
          <button type="button" data-arena-move="1,0" aria-label="右へ移動">▶</button>
          <button type="button" data-arena-move="-1,1" aria-label="左下へ移動">↙</button>
          <button type="button" data-arena-move="0,1" aria-label="下へ移動">▼</button>
          <button type="button" data-arena-move="1,1" aria-label="右下へ移動">↘</button>
        </div>
      </div>
    `;
    const victory = `<div class="arena-victory"><strong>勝利</strong><p>報酬を獲得した。次戦へ進むか、撤退して持ち帰る。</p><button type="button" id="arenaNextButton">${arena.round >= ARENA_BATTLE_COUNT ? "修練連武闘技場制覇" : "次の試合"}</button></div>`;
    els.arenaView.innerHTML = `
      <section class="arena-stage">
        <div class="floor-line arena-floor-line">
          <div title="${escapeHtml(`${researchStatusText(rec.level)} / ${hpText} / ${rangeText} / ${arenaStats || "能力未判明"}`)}">
            <span class="arena-round">第${arena.round}戦 / ${ARENA_BATTLE_COUNT}・${researchText}</span>
            <strong class="arena-enemy-name">${enemy.name}</strong>
            <small class="arena-compact-status">${hpText} / ${rangeText} / ${arenaStats || "能力未判明"}</small>
          </div>
          ${arena.awaitingNext ? "" : `<button type="button" id="arenaSkillButton" ${arenaSkillDisabled || arenaJobSkillCooldown > 0 ? "disabled" : ""}>${arenaSkillLabel}</button>`}
          ${arena.awaitingNext || !arenaSpellUsable ? "" : `<button type="button" id="arenaSpellButton" ${arenaSpellCooldown > 0 ? "disabled" : ""}>${arenaSpellCooldown > 0 ? `${arenaSpell.name} ${arenaSpellCooldown}` : `魔法・${arenaSpell.name}`}</button>`}
          <button type="button" id="arenaRetireButton">撤退</button>
        </div>
        ${arena.awaitingNext ? victory : tactical}
      </section>
    `;
    document.querySelectorAll("[data-arena-move]").forEach((button) => button.addEventListener("click", (event) => {
      const [dx, dy] = button.dataset.arenaMove.split(",").map(Number);
      arenaMove(dx, dy);
    }));
    document.querySelector("[data-arena-enemy]")?.addEventListener("click", () => arenaAttack("attack", true));
    document.querySelector("#arenaSkillButton")?.addEventListener("click", () => {
      if (currentJob.skill.tag === "capoeira_stance") toggleCapoeiraStance(arena, "arena");
      else arenaAttack("skill", false);
    });
    document.querySelector("#arenaSpellButton")?.addEventListener("click", arenaCastSpell);
    document.querySelector("[data-arena-guard]")?.addEventListener("click", arenaGuard);
    document.querySelector("#arenaNextButton")?.addEventListener("click", nextArenaRound);
    document.querySelector("#arenaRetireButton")?.addEventListener("click", retireArena);
  }

  function startArenaRun() {
    state.arena = { round: 1, enemy: null, awaitingNext: false, actionProgress: 0, size: 9, player: { x: 1, y: 4 }, obstacles: [] };
    spawnArenaEnemy();
    saveGame();
    render();
  }

  function spawnArenaEnemy() {
    const monster = ARENA_ROSTER[state.arena.round - 1];
    if (!monster) {
      log("修練連武闘技場の対戦表を最後まで踏破した。");
      state.arena = null;
      return;
    }
    resetArenaField(state.arena);
    state.arena.enemy = createEnemy(monster.id, { x: 7, y: 4 }, true);
    state.arena.enemy.asleep = false;
    state.arena.awaitingNext = false;
    markResearch(monster.id, 1);
    ensureUniqueEncounterSpeech(state.arena.enemy);
    playSfx("boss");
  }

  function ensureArenaField(arena) {
    if (!arena.size || !arena.player || !Array.isArray(arena.obstacles)) resetArenaField(arena);
    if (arena.enemy && (!Number.isFinite(arena.enemy.x) || !Number.isFinite(arena.enemy.y))) Object.assign(arena.enemy, { x: 7, y: 4 });
  }

  function resetArenaField(arena) {
    const layouts = [
      [{ x: 4, y: 2 }, { x: 4, y: 6 }],
      [{ x: 3, y: 2 }, { x: 5, y: 2 }, { x: 3, y: 6 }, { x: 5, y: 6 }],
      [{ x: 2, y: 3 }, { x: 6, y: 3 }, { x: 2, y: 5 }, { x: 6, y: 5 }],
      [{ x: 4, y: 1 }, { x: 4, y: 7 }, { x: 3, y: 4 }, { x: 5, y: 4 }],
    ];
    arena.size = 9;
    arena.player = { x: 1, y: 4 };
    arena.obstacles = layouts[(arena.round - 1) % layouts.length].map((item) => ({ ...item }));
  }

  function arenaDistance(a, b) {
    return chebyshevDistance(a, b);
  }

  function arenaBlocked(arena, x, y) {
    return x < 0 || y < 0 || x >= arena.size || y >= arena.size || arena.obstacles.some((item) => item.x === x && item.y === y);
  }

  function arenaMove(dx, dy) {
    const arena = state.arena;
    const enemy = arena?.enemy;
    if (!enemy?.alive || arena.awaitingNext) return;
    [dx, dy] = capoeiraDirection(dx, dy, arena);
    [dx, dy] = intoxicatedDirection(dx, dy);
    const x = arena.player.x + dx;
    const y = arena.player.y + dy;
    if (arenaBlocked(arena, x, y)) {
      playSfx("bump");
      return;
    }
    if (enemy.x === x && enemy.y === y) {
      arenaAttack("attack", false);
      return;
    }
    arena.player = { x, y };
    playSfx("step");
    advanceArenaWorld();
  }

  function arenaGuard() {
    if (!state.arena?.enemy?.alive || state.arena.awaitingNext) return;
    state.adventurer.guard = true;
    log("修練連武闘技場で防御態勢を取った。");
    playSfx("guard");
    advanceArenaWorld();
  }

  function arenaAttack(mode, fromTap) {
    const arena = state.arena;
    const enemy = arena?.enemy;
    if (!enemy?.alive || arena.awaitingNext) return;
    const job = jobs[state.adventurer.jobId];
    if (mode === "skill" && job.skill.tag === "heal") {
      if (castHealingMagic(arena)) advanceArenaWorld();
      else render();
      return;
    }
    const distance = arenaDistance(arena.player, enemy);
    const range = Number(job.rangedRange || 0);
    const observe = mode === "skill" && job.skill.tag === "observe";
    const allowedRange = observe ? Math.max(4, range) : Math.max(1, range);
    if (distance > allowedRange || (distance > 1 && !arenaLineOfSight(arena, arena.player, enemy))) {
      log(fromTap && !range ? "この職業は遠距離攻撃できない。敵へ接近せよ。" : `射程または射線が届かない（距離${distance}）。`);
      playSfx("warning");
      render();
      return;
    }
    log(mode === "skill"
      ? `${enemy.name}へ職業技「${job.skill.name}」を使った。`
      : distance > 1 ? `${enemy.name}へ距離${distance}から攻撃した。` : `${enemy.name}へ踏み込み攻撃した。`);
    const attackMode = mode === "attack" && distance > 1 ? "ranged" : mode;
    const outcome = playerAttack(enemy, attackMode);
    if (mode === "skill") {
      beginJobSkillCooldown(job.skill);
      applyRangedJobSkillEffect(enemy, job.skill, outcome);
    }
    // とどめでも選択した1行動を消費し、世界ターン処理後に勝敗を確定する。
    advanceArenaWorld();
  }

  function arenaCastSpell() {
    const arena = state.arena;
    const enemy = arena?.enemy;
    const spell = activeLearnedSpell();
    if (!enemy?.alive || !spell?.jobs?.includes(state.adventurer.jobId) || spellCooldownRemaining(spell.id) > 0) return;
    const distance = arenaDistance(arena.player, enemy);
    if (distance > Number(spell.range || 1) || (distance > 1 && !arenaLineOfSight(arena, arena.player, enemy))) {
      log(`魔法「${spell.name}」は射程または射線が届かない（距離${distance}）。`);
      playSfx("warning");
      render();
      return;
    }
    log(`${enemy.name}へ${spellbookRankLabel(spell.rank)}魔法「${spell.name}」を放った。`);
    const result = playerAttack(enemy, "spell", spell);
    beginSpellCooldown(spell);
    applySpellEffect(enemy, spell, result);
    advanceArenaWorld();
  }

  function arenaLineOfSight(arena, start, target) {
    return gridLineOfSight(start, target, (x, y) => arena.obstacles.some((item) => item.x === x && item.y === y));
  }

  function advanceArenaWorld() {
    const arena = state.arena;
    const enemy = arena?.enemy;
    if (!enemy?.alive) return;
    tickUniqueSpeech(enemy);
    const playerActions = 1 + Math.floor(Math.max(0, getPlayerStats().acceleration) / 10);
    arena.actionProgress += 1;
    if (arena.actionProgress >= playerActions) {
      arena.actionProgress = 0;
      tickIntoxication();
      tickSnackBuff();
      arena.healCooldown = Math.max(0, Number(arena.healCooldown || 0) - 1);
      tickSpellCooldowns(arena);
      tickJobSkillCooldowns(arena);
      const arenaSpellSlowed = Number(enemy.spellSlowedTurns || 0) > 0;
      if (arenaSpellSlowed) enemy.spellSlowedTurns -= 1;
      const enemyActions = 1 + Math.floor(Math.max(0, arenaSpellSlowed ? 0 : enemy.acceleration || 0) / 12);
      for (let index = 0; index < enemyActions && state.arena && state.adventurer.hp > 0 && enemy.alive && enemy.hp > 0; index += 1) {
        if (arenaEnemyAct(arena, enemy) === "telegraphed") break;
      }
      if (state.arena && state.adventurer.hp > 0) {
        applyEnemyRapidRegeneration([enemy]);
        applyRegeneration();
      }
    }
    if (state.arena && (!enemy.alive || enemy.hp <= 0)) {
      winArenaRound();
      return;
    }
    saveGame();
    render();
  }

  function arenaEnemyAct(arena, enemy) {
    const distance = arenaDistance(arena.player, enemy);
    if (Number(enemy.spellStunnedTurns || 0) > 0) {
      enemy.spellStunnedTurns -= 1;
      log(`${enemy.name}は雷術の痺れで行動できない。`);
      return;
    }
    if (distance <= 1) {
      return enemyTurn(enemy);
    }
    if (Number(enemy.spellCursedTurns || 0) > 0) enemy.spellCursedTurns -= 1;
    if (Number(enemy.spellArmorBreakTurns || 0) > 0) {
      enemy.spellArmorBreakTurns -= 1;
      if (enemy.spellArmorBreakTurns <= 0) enemy.spellArmorBreak = 0;
    }
    if (Number(enemy.spellBoundTurns || 0) > 0) {
      enemy.spellBoundTurns -= 1;
      return;
    }
    if (enemy.specialAttack === "ranged" && distance <= 6 && arenaLineOfSight(arena, enemy, arena.player) && Math.random() < 0.4) {
      enemyAttack(enemy, "遠隔攻撃", chooseEnemyAttackAttribute(enemy, enemy.attackAttribute), enemy.attack, { trials: 2 });
      return;
    }
    const options = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const x = enemy.x + dx;
        const y = enemy.y + dy;
        if (arenaBlocked(arena, x, y) || (arena.player.x === x && arena.player.y === y)) continue;
        options.push({ x, y, distance: arenaDistance({ x, y }, arena.player) });
      }
    }
    options.sort((a, b) => a.distance - b.distance);
    if (options.length) {
      Object.assign(enemy, pick(options.filter((item) => item.distance === options[0].distance)));
      uniqueSpeak(enemy, "move", { chance: 0.55 });
    }
  }

  function winArenaRound() {
    const arena = state.arena;
    const enemy = arena.enemy;
    enemy.alive = false;
    markResearch(enemy.id, MAX_RESEARCH_LEVEL);
    recordUniqueDefeat(enemy);
    const newRecord = arena.round > state.adventurer.arenaBestRound;
    const gold = Math.max(1, Math.round(12 + arena.round * 2));
    const points = 1 + Math.floor(arena.round / 12);
    state.adventurer.gold += gold;
    state.adventurer.guildPoints += points;
    const baseExperience = experienceFromEnemy(enemy);
    const selfDestructRate = enemy.selfDestructed ? 0.5 : 1;
    gainExperience(Math.max(1, Math.round(baseExperience * selfDestructRate)));
    state.adventurer.arenaBestRound = Math.max(state.adventurer.arenaBestRound, arena.round);
    arena.awaitingNext = true;
    log(newRecord
      ? `${enemy.name}を破って最高記録を更新し、${gold}Gと${points}GPを得た。`
      : `${enemy.name}との再戦を制し、${gold}Gと${points}GPを得た。`);
    uniqueSpeak(enemy, "defeat", { force: true });
    playSfx("victory");
    saveGame();
    render();
  }

  function nextArenaRound() {
    if (!state.arena?.awaitingNext) return;
    if (state.arena.round >= ARENA_BATTLE_COUNT) {
      log(`${ARENA_BATTLE_COUNT}連勝を達成し、修練連武闘技場の頂点へ立った！`);
      state.arena = null;
    } else {
      state.arena.round += 1;
      spawnArenaEnemy();
    }
    saveGame();
    render();
  }

  function retireArena() {
    if (!state.arena) return;
    log(`修練連武闘技場第${state.arena.round}戦で撤退した。獲得済み報酬を持ち帰った。`);
    state.arena = null;
    saveGame();
    switchView("town");
  }

  function shopItemPrice(item) {
    return ECONOMY.shopPurchasePrice(item);
  }

  function sellMaterial(materialId, amount) {
    const count = Math.min(getMaterialCount(materialId), Math.max(0, amount));
    if (!count) return;
    addMaterial(materialId, -count);
    const earned = materialSellPrice(materialId) * count;
    state.adventurer.gold += earned;
    state.meta.shop.soldMaterials[materialId] = (state.meta.shop.soldMaterials[materialId] || 0) + count;
    const unlocked = unlockShopEquipment(materialId);
    log(`${materials[materialId].name}を${count}個売り、${earned}Gを得た。${unlocked ? `新たに${unlocked}件の装備が入荷した。` : ""}`);
    playSfx("coinSell");
    saveGame();
    render();
  }

  function sellTreasureItem(itemId, amount) {
    const item = treasureItems[itemId];
    const count = Math.min(getItemCount(itemId), Math.max(0, Math.floor(Number(amount || 0))));
    if (!item || !count || !item.sellPrice) return;
    addItem(itemId, -count);
    const earned = ECONOMY.treasureSellPrice(item) * count;
    state.adventurer.gold += earned;
    log(`${item.name}を${count}個売り、${earned}Gを得た。`);
    playSfx("coinSell");
    saveGame();
    render();
  }

  function canDisposeEquipment(itemId, { allowArtifact = false, allowProtected = false, allowPermanent = false } = {}) {
    const item = equipment[itemId];
    return Boolean(
      item
      && ownsEquipment(itemId)
      && !Object.values(state.adventurer.equipment).includes(itemId)
      && (allowProtected || !PROTECTED_EQUIPMENT_IDS.has(itemId))
      && (allowPermanent || (!item.masterOnly && !item.completionOnly))
      && (allowArtifact || !item.artifact),
    );
  }

  function requestEquipmentSale(itemId) {
    if (!canDisposeEquipment(itemId, { allowProtected: true })) return;
    const item = equipment[itemId];
    const price = ECONOMY.equipmentSellPrice(item, state.adventurer.craftedDetails[itemId]);
    askConfirm("装備品を売る", `${equipmentDisplayName(item)}を${price}Gで売ります。取り消せません。`, () => sellEquipmentForGold(itemId, price));
  }

  function sellEquipmentForGold(itemId, price) {
    if (!canDisposeEquipment(itemId, { allowProtected: true })) return;
    const item = equipment[itemId];
    state.adventurer.ownedEquipment = state.adventurer.ownedEquipment.filter((id) => id !== itemId);
    delete state.adventurer.craftedDetails[itemId];
    state.adventurer.gold += Math.max(0, Math.floor(Number(price || 0)));
    log(`${equipmentDisplayName(item)}を商店へ売り、${price}Gを得た。`);
    playSfx("coinSell");
    saveGame();
    render();
  }

  function unlockShopEquipment(materialId) {
    const soldCount = state.meta.shop.soldMaterials[materialId] || 0;
    if (soldCount <= 0) return 0;
    const limit = 8 + Math.floor(soldCount / 3) * 4;
    const deepestFloor = Math.max(1, Number(state.adventurer.deepestFloor || 1));
    const candidates = DATA.equipment
      .filter((item) => !item.artifact && item.recipe && materialId in item.recipe && Number(item.shopMinFloor || 1) <= deepestFloor)
      .sort((a, b) => shopItemPrice(a) - shopItemPrice(b));
    const before = state.meta.shop.inventory.length;
    candidates.filter((item) => item.trueSight).forEach((item) => {
      if (!state.meta.shop.inventory.includes(item.id)) state.meta.shop.inventory.push(item.id);
    });
    candidates.slice(0, limit).forEach((item) => {
      if (!state.meta.shop.inventory.includes(item.id)) state.meta.shop.inventory.push(item.id);
    });
    return state.meta.shop.inventory.length - before;
  }

  function refreshShopInventoryForDepth() {
    if (!state?.meta?.shop || !state?.adventurer) return 0;
    return Object.entries(state.meta.shop.soldMaterials || {})
      .filter(([, count]) => Number(count || 0) > 0)
      .reduce((total, [materialId]) => total + unlockShopEquipment(materialId), 0);
  }

  function buyEquipment(itemId) {
    const item = equipment[itemId];
    if (!item || item.artifact || !state.meta.shop.inventory.includes(itemId) || ownsEquipment(itemId)) return;
    const price = shopItemPrice(item);
    if (state.adventurer.gold < price) return;
    state.adventurer.gold -= price;
    state.adventurer.ownedEquipment.push(itemId);
    log(`${equipmentDisplayName(item)}を${price}Gで購入し、自宅へ送った。`);
    playSfx("purchase");
    saveGame();
    render();
  }

  // Shared panels and character setup.
  function renderLog() {
    const combatView = state.adventurer.inDungeon || (currentView === "arena" && state.arena);
    const limit = combatView ? 14 : 10;
    els.log.innerHTML = state.log.slice(0, limit).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
    els.logHistoryCount.textContent = String(state.log.length);
    els.openLogHistory.disabled = state.log.length === 0;
    els.openLogHistory.setAttribute("aria-label", `戦闘ログ全履歴を開く（${state.log.length}件）`);
    if (!els.logHistoryPanel.classList.contains("hidden")) renderLogHistory();
  }

  function renderLogHistory() {
    const lines = Array.isArray(state.log) ? state.log.slice(0, LOG_HISTORY_LIMIT) : [];
    els.logHistoryDescription.textContent = `保存中の全${lines.length}件を新しい順に表示しています（最大${LOG_HISTORY_LIMIT}件）。`;
    els.logHistoryList.innerHTML = lines.length
      ? lines.map((line, index) => `<p${index === 0 ? ' class="latest"' : ""}>${escapeHtml(line)}</p>`).join("")
      : `<p class="empty">記録はまだありません。</p>`;
  }

  function openLogHistory() {
    if (!state.log.length) return;
    logHistoryReturnFocus = document.activeElement || els.openLogHistory;
    renderLogHistory();
    els.logHistoryPanel.classList.remove("hidden");
    els.logHistoryList.scrollTop = 0;
    els.logHistoryList.focus();
    playSfx("menuOpen");
  }

  function closeLogHistory(restoreFocus = true) {
    if (!els.logHistoryPanel) return;
    const wasOpen = !els.logHistoryPanel.classList.contains("hidden");
    els.logHistoryPanel.classList.add("hidden");
    if (wasOpen) playSfx("menuClose");
    const returnFocus = logHistoryReturnFocus;
    logHistoryReturnFocus = null;
    if (restoreFocus && wasOpen) returnFocus?.focus?.();
  }

  function renderSetupPanel() {
    if (!els.setupPanel) return;
    if (!pendingSetup) {
      els.setupPanel.classList.add("hidden");
      return;
    }
    const race = races[pendingSetup.raceId] || races.human;
    const job = jobs[pendingSetup.jobId] || jobs.swordsman;
    const personality = personalities[pendingSetup.personalityId] || personalities.gentle;
    els.adventurerNameInput.value = pendingSetup.name || "たかし";
    els.openRacePicker.innerHTML = `<span>種族</span><strong>${race.name}</strong><small>タップして変更</small>`;
    els.openJobPicker.innerHTML = `<span>職業</span><strong>${job.name}</strong><small>タップして変更</small>`;
    els.openPersonalityPicker.innerHTML = `<span>性格</span><strong>${personality.name}</strong><small>${personality.description}</small>`;
    const preview = CHARACTER.preview(DATA, race.id, job.id, personality.id);
    els.setupSummary.innerHTML = `
      <p>${personality.name}な${race.name}${escapeHtml(pendingSetup.name || "たかし")} / ${job.name}</p>
      <p>力${formatStatValue(preview.strength)} 素早さ${formatStatValue(preview.speed)} 器用さ${formatStatValue(preview.dexterity)} 耐久力${formatStatValue(preview.durability)} 運${formatStatValue(preview.luck)}</p>
      <p>加速度 ${formatStatValue(race.acceleration || 0)} / 世界1ターンの行動回数 ${1 + Math.floor((race.acceleration || 0) / 10)}</p>
      <p>種族耐性 ${formatResistances(race.resistances) || "なし"}</p>
      <p>成長難度 必要経験値×${Number(race.experienceMultiplier || 1).toFixed(2)}（強い種族ほどレベルアップが遅い）</p>
      <p>HP ${preview.maxHp} / 攻撃試行 ${job.combat.attackTrials} 回 / 命中 ${Math.round(job.combat.accuracy * 100)}%</p>
      <p>${race.description}</p>
      <p>性格成長: ${personality.description}</p>
    `;
    els.setupPanel.classList.remove("hidden");
    els.setupOk.textContent = initialSetupPending ? "この設定で開始" : "この設定に変更";
  }

  function openSetupPicker(type) {
    if (!pendingSetup) return;
    const configs = {
      race: { items: DATA.races, selected: "raceId", title: "種族を選ぶ", detail: (item) => `${item.traits.join("、")}／成長難度×${Number(item.experienceMultiplier || 1).toFixed(2)}` },
      job: { items: DATA.jobs, selected: "jobId", title: "職業を選ぶ", detail: (item) => `${item.description}／装備:${jobEquipmentHint(item.id)}` },
      personality: { items: DATA.personalities, selected: "personalityId", title: "性格を選ぶ", detail: (item) => item.description },
    };
    const config = configs[type] || configs.job;
    const selectedId = pendingSetup[config.selected];
    els.setupPickerTitle.textContent = config.title;
    els.setupPickerList.classList.toggle("race-picker-grid", type === "race");
    els.setupPickerList.innerHTML = config.items.map((item) => {
      const detail = config.detail(item);
      return `<button type="button" class="${item.id === selectedId ? "selected" : ""}" data-picker-id="${item.id}">
        <strong>${item.name}</strong><small>${detail}</small>
      </button>`;
    }).join("");
    els.setupPickerPanel.classList.remove("hidden");
    playSfx("uiOpen");
    document.querySelectorAll("[data-picker-id]").forEach((button) => {
      button.addEventListener("click", () => {
        pendingSetup[config.selected] = button.dataset.pickerId;
        closeSetupPicker();
        renderSetupPanel();
      });
    });
  }

  function closeSetupPicker() {
    const wasOpen = !els.setupPickerPanel.classList.contains("hidden");
    els.setupPickerPanel.classList.add("hidden");
    if (wasOpen) playSfx("uiClose");
  }

  function openSetup({ raceId, jobId, personalityId, name, preserveMeta } = {}) {
    pendingSetup = {
      raceId: raceId && races[raceId] ? raceId : state.adventurer.raceId || "human",
      jobId: jobId && jobs[jobId] ? jobId : state.adventurer.jobId || "swordsman",
      personalityId: personalityId && personalities[personalityId] ? personalityId : state.adventurer.personalityId || "gentle",
      name: String(name || state.adventurer.name || "たかし").slice(0, 12),
      preserveMeta: Boolean(preserveMeta),
    };
    initialSetupPending = false;
    renderSetupPanel();
  }

  function closeSetup() {
    if (els.setupPanel) els.setupPanel.classList.add("hidden");
    if (initialSetupPending) {
      showTitleScreen();
      return;
    }
    pendingSetup = null;
    initialSetupPending = false;
    saveGame();
    render();
  }

  function confirmSetup() {
    if (!pendingSetup) return;
    const selection = pendingSetup;
    selection.name = String(els.adventurerNameInput.value || selection.name || "たかし").trim().slice(0, 12) || "たかし";
    resetAdventurerProgressionMeta();
    state.adventurer = createAdventurer(selection.raceId, selection.jobId, selection.personalityId, selection.name);
    grantPersistentRewardEquipment();
    state.dungeon = null;
    state.arena = null;
    state.adventurer.inDungeon = false;
    state.adventurer.floor = 1;
    state.meta.awaitingCreation = false;
    if (selection.preserveMeta) {
      log(`新しい冒険者を登録した。${personalities[selection.personalityId].name}な${races[selection.raceId].name}${selection.name}、${jobs[selection.jobId].name}として出発する。`);
      log(START_GUIDANCE);
    } else {
      state.log = ["冒険者の登録が完了した。"];
      saveGame();
    }
    pendingSetup = null;
    initialSetupPending = false;
    currentView = "town";
    switchView("town");
    if (Object.keys(state.meta.monsterHearts || {}).length > 0) playSfx("heartRestore");
  }

  // Dungeon lifecycle, map rendering, and exploration actions.
  function specialRoomFeatures() {
    if (!state.dungeon) return [];
    return [
      { id: "madness", room: state.dungeon.madnessRoom, label: "狂気の部屋" },
      { id: "treasureVault", room: state.dungeon.treasureVault, label: "宝物庫" },
      { id: "thrill", room: state.dungeon.thrillRoom, label: "スリル部屋" },
    ].filter((entry) => entry.room);
  }

  function specialRoomContains(room, pos) {
    return window.HD_DUNGEON.roomContains(room, pos);
  }

  function isConcealedSpecialResident(item) {
    if (!item?.specialRoom || !state.dungeon) return false;
    const feature = specialRoomFeatures().find((entry) => entry.id === item.specialRoom);
    return Boolean(feature && !feature.room.discovered);
  }

  function discoverSpecialRoomsAt(x, y) {
    if (!state.dungeon) return false;
    const discovered = specialRoomFeatures().find((entry) => (
      !entry.room.discovered && specialRoomContains(entry.room, { x, y })
    ));
    if (!discovered) return false;
    discovered.room.discovered = true;
    const residents = state.dungeon.enemies
      .filter((enemy) => enemy.alive && enemy.specialRoom === discovered.id)
      .sort((left, right) => chebyshevDistance(left, state.dungeon.player) - chebyshevDistance(right, state.dungeon.player));
    residents.forEach((enemy, index) => {
      markResearch(enemy.id, 1);
      // The discovery action itself is always safe. In a madness room only the
      // two nearest residents wake on the following world turn; the rest lag one
      // additional turn so the encounter unfolds instead of resolving as a burst.
      enemy.specialRoomGraceTurns = discovered.id === "madness" && index >= 2 ? 2 : 1;
    });
    if (discovered.id === "madness") {
      log("足を踏み入れた瞬間、部屋の景色が歪んだ。ユニークモンスターが集結する狂気の部屋を発見した。");
      playSfx("chaos");
    } else if (discovered.id === "treasureVault") {
      log("部屋へ踏み込むと、暗がりに多数の宝箱が浮かび上がった。宝物庫を発見した。");
      playSfx("victory");
    } else {
      const guardian = state.dungeon.enemies.find((enemy) => enemy.alive && enemy.thrillRoomGuardian);
      log(`部屋へ踏み込むと、星を封じた宝箱と${guardian ? `、それを守る強敵「${guardian.name}」` : "守護者の痕跡"}が姿を現した。スリル部屋を発見した。`);
      playSfx("boss");
    }
    return true;
  }

  function currentSpecialRoomStatus() {
    const current = specialRoomFeatures().find((entry) => (
      entry.room.discovered && specialRoomContains(entry.room, state.dungeon.player)
    ));
    if (!current) return "";
    if (current.id === "treasureVault") {
      const unopened = state.dungeon.chests.filter((chest) => chest.treasureVault && !chest.opened).length;
      return `現在地「宝物庫」・未開封${unopened}箱 / `;
    }
    if (current.id === "thrill") {
      const guarded = state.dungeon.enemies.some((enemy) => enemy.alive && enemy.thrillRoomGuardian);
      return `現在地「スリル部屋」・宝箱${guarded ? "封印中" : "解放済み"} / `;
    }
    return "現在地「狂気の部屋」 / ";
  }

  function renderDungeon() {
    if (!state.adventurer.inDungeon || !state.dungeon) return;
    const floor = floorByNumber[state.adventurer.floor];
    els.floorName.textContent = `B${floor.floor}F`;
    els.floor.textContent = floor.name;
    const actionsPerTurn = 1 + Math.floor(Math.max(0, getPlayerStats().acceleration) / 10);
    const tension = currentDungeonTension();
    els.actionPace.textContent = `規模${state.dungeon.size || state.dungeon.map.length}×${state.dungeon.size || state.dungeon.map.length} / ${state.dungeon.layout ? `構造「${state.dungeon.layout.name}」 / ` : ""}${state.dungeon.anomaly ? `異変「${state.dungeon.anomaly.name}」 / ` : ""}${currentSpecialRoomStatus()}緊張度 ${tension.level}/5「${tension.label}」 / 連続行動 ${Number(state.dungeon.actionProgress || 0) + 1}/${actionsPerTurn}`;
    els.actionPace.parentElement.title = tension.strongestName
      ? `通常生成上限との戦力比 ${tension.peakRatio}倍 / 最大脅威 ${tension.strongestName}`
      : "通常生成範囲内";

    if (cells.length !== VIEW_SIZE * VIEW_SIZE) buildMapCells();
    const canSeeInvisible = getPlayerStats().canSeeInvisible;
    const enemyByPos = new Map(state.dungeon.enemies.filter((enemy) => (
      enemy.alive
      && !isConcealedSpecialResident(enemy)
      && (!enemy.invisible || canSeeInvisible || enemy.revealed)
    )).map((enemy) => [`${enemy.x},${enemy.y}`, enemy]));
    const corpseByPos = new Map(
      state.dungeon.enemies
        .filter((enemy) => !enemy.alive && corpseHarvestsRemaining(enemy) > 0)
        .map((enemy) => [`${enemy.x},${enemy.y}`, enemy]),
    );
    const chestByPos = new Set(state.dungeon.chests
      .filter((chest) => !chest.opened && !isConcealedSpecialResident(chest))
      .map((chest) => `${chest.x},${chest.y}`));
    if (state.adventurer.jobId === "hunter") {
      state.dungeon.traps?.forEach((trap) => {
        if (!trap.disarmed && chebyshevDistance(trap, state.dungeon.player) <= 1) trap.discovered = true;
      });
    }
    const trapByPos = new Map((state.dungeon.traps || []).filter((trap) => trap.discovered && !trap.disarmed).map((trap) => [`${trap.x},${trap.y}`, trap]));
    const excavatedByPos = new Set((state.dungeon.excavatedTiles || []).map((tile) => `${tile.x},${tile.y}`));
    const alwaysLitTiles = window.HD_DUNGEON.alwaysLitTileKeys(state.dungeon);
    const lightRadius = currentDungeonLightRadius();
    const center = Math.floor(VIEW_SIZE / 2);

    for (let vy = 0; vy < VIEW_SIZE; vy += 1) {
      for (let vx = 0; vx < VIEW_SIZE; vx += 1) {
        const x = state.dungeon.player.x + vx - center;
        const y = state.dungeon.player.y + vy - center;
        const cell = cells[vy * VIEW_SIZE + vx];
        const key = `${x},${y}`;
        const enemy = enemyByPos.get(key);
        const corpse = corpseByPos.get(key);
        cell.textContent = "";
        cell.removeAttribute("aria-label");
        cell.removeAttribute("tabindex");
        cell.setAttribute("role", "gridcell");
        delete cell.dataset.enemyX;
        delete cell.dataset.enemyY;
        cell.className = "cell";
        const lightDistance = Math.hypot(x - state.dungeon.player.x, y - state.dungeon.player.y);
        const alwaysLit = alwaysLitTiles.has(key);
        cell.classList.add(alwaysLit ? "light-room" : lightDistance <= lightRadius.near ? "light-near" : lightDistance <= lightRadius.mid ? "light-mid" : "light-far");
        const discoveredFeature = specialRoomFeatures().find((feature) => feature.room.discovered && specialRoomContains(feature.room, { x, y }));
        if (discoveredFeature) cell.classList.add(`room-${discoveredFeature.id}`);
        if (state.dungeon.player.x === x && state.dungeon.player.y === y) {
          cell.classList.add("tile-player");
          if (state.adventurer.jobId === "ninja") cell.classList.add("player-unlit");
          if (capoeiraActive(state.dungeon)) cell.classList.add("capoeira-inverted");
          if (state.dungeon.map[y]?.[x] === "wall") cell.classList.add("tile-phasing-wall");
          cell.textContent = "@";
        } else if (enemy) {
          const rec = getResearch(enemy.id);
          cell.classList.add(enemy.flowerPet ? "tile-flower-pet" : enemy.unique ? "tile-unique" : "tile-enemy");
          if (enemy.asleep) cell.classList.add("tile-sleeping");
          if (enemy.uniqueStyle) cell.classList.add(`unique-${enemy.uniqueStyle}`);
          if (enemy.invisible) cell.classList.add("tile-invisible-seen");
          if (state.dungeon.map[y]?.[x] === "wall") cell.classList.add("tile-phasing-wall");
          cell.classList.add(`enemy-${enemy.attackAttribute || "neutral"}`);
          cell.classList.add(`monster-tier-${enemy.colorTier || "white"}`);
          const hpRate = Math.max(0, Math.min(100, Math.round((enemy.hp / enemy.maxHp) * 100)));
          const hpBar = rec.level >= 1
            ? `<span class="mini-hp-bar"><i class="${hpColorClass(hpRate)}" style="width:${hpRate}%"></i></span>`
            : "";
          cell.innerHTML = `<span class="monster-marker">${monsterMarker(enemy)}</span>${enemy.asleep ? '<span class="sleep-indicator" aria-hidden="true">Z</span>' : ""}${hpBar}`;
          cell.setAttribute("aria-label", `${rec.seen ? enemy.name : "未確認の魔物"}${enemy.flowerPet ? "（使役中の花ペット）" : enemy.asleep ? "（睡眠中）" : ""}`);
          cell.setAttribute("role", "button");
          cell.setAttribute("tabindex", "0");
          cell.dataset.enemyX = String(enemy.x);
          cell.dataset.enemyY = String(enemy.y);
          if (rangedAttackStatus(enemy).available
            || (spellTargetArmed && activeSpellAttackStatus(enemy).available)
            || (jobSkillTargetArmed && jobSkillAttackStatus(enemy).available)) cell.classList.add("targetable-ranged");
        } else if (!state.dungeon.map[y] || !state.dungeon.map[y][x] || state.dungeon.map[y][x] === "wall") {
          cell.classList.add("tile-wall");
        } else if (corpse) {
          cell.classList.add("tile-corpse");
          cell.setAttribute("aria-label", `${corpse.name}の遺体`);
          cell.innerHTML = '<span class="corpse-icon" aria-hidden="true"></span>';
        } else if (trapByPos.has(key)) {
          const trap = trapByPos.get(key);
          cell.classList.add("tile-trap");
          cell.classList.add(`trap-danger-${trapDanger(trap)}`);
          cell.textContent = "罠";
          cell.setAttribute("aria-label", `危険度${trapDangerLabel(trap)}の${trapTypeLabel(trap)}`);
        } else if (state.dungeon.stairs.some((stairs) => stairs.x === x && stairs.y === y)) {
          cell.classList.add("tile-stairs");
          cell.setAttribute("aria-label", "下り階段");
          cell.innerHTML = '<span class="stair-icon" aria-hidden="true"></span>';
        } else if (chestByPos.has(key)) {
          cell.classList.add("tile-chest");
          cell.textContent = "箱";
        } else {
          cell.classList.add("tile-floor");
          if (excavatedByPos.has(key)) cell.classList.add("tile-excavated");
        }
      }
    }

    const harvestable = findHarvestableCorpse();
    const disarmableTrap = findDisarmableTrap();
    const disarmProfile = disarmableTrap ? trapDisarmProfile(disarmableTrap) : null;
    els.wait.textContent = harvestable ? "剥" : disarmableTrap ? "解" : "探";
    els.wait.setAttribute("aria-label", harvestable ? `${harvestable.name}を剥ぎ取る` : disarmableTrap ? `危険度${trapDangerLabel(disarmableTrap)}の${trapTypeLabel(disarmableTrap)}を解除、成功率${disarmProfile.percent}%` : "周囲の罠を探索する");
    els.wait.title = disarmableTrap ? `解除成功率 ${disarmProfile.percent}%` : "";
    els.wait.classList.toggle("has-action", Boolean(harvestable || disarmableTrap));
    const magicJob = MAGIC_JOB_IDS.has(state.adventurer.jobId);
    const psychicJob = state.adventurer.jobId === "psychic";
    const jobSkill = jobs[state.adventurer.jobId].skill;
    const learnedSpell = activeLearnedSpell();
    const canCastLearnedSpell = Boolean(learnedSpell?.jobs?.includes(state.adventurer.jobId));
    const activeSpellCooldown = learnedSpell ? spellCooldownRemaining(learnedSpell.id) : 0;
    const cooldowns = teleportCooldowns();
    els.magicMoveControls.classList.remove("hidden");
    els.jobSkill.classList.remove("hidden");
    els.teleport.classList.toggle("hidden", !magicJob);
    els.timeStop.classList.toggle("hidden", !psychicJob || state.adventurer.level < 40);
    els.activeSpell?.classList.toggle("hidden", !canCastLearnedSpell);
    els.teleport.disabled = !magicJob || cooldowns.long > 0;
    els.teleport.textContent = cooldowns.long > 0 ? `テレポート ${cooldowns.long}` : "テレポート";
    els.timeStop.disabled = Number(state.dungeon.timeStopCooldown || 0) > 0;
    const healCooldown = Number(state.dungeon.healCooldown || 0);
    const healingSkill = jobSkill.tag === "heal";
    const jobSkillCooldown = jobSkillCooldownRemaining(jobSkill.id);
    els.jobSkill.disabled = healingSkill ? (healCooldown > 0 || state.adventurer.hp >= getPlayerStats().maxHp) : jobSkillCooldown > 0;
    els.jobSkill.textContent = jobSkill.tag === "capoeira_stance"
      ? capoeiraActive(state.dungeon) ? "カポエラ解除" : `技・${jobSkill.name}`
      : healingSkill && healCooldown > 0
        ? `${jobSkill.name} ${healCooldown}`
      : jobSkillCooldown > 0 ? `${jobSkill.name} ${jobSkillCooldown}` : jobSkillTargetArmed ? "技の対象を選択" : `技・${jobSkill.name}`;
    els.jobSkill.classList.toggle("selected", jobSkillTargetArmed);
    if (els.activeSpell) {
      els.activeSpell.disabled = !canCastLearnedSpell || activeSpellCooldown > 0;
      els.activeSpell.textContent = canCastLearnedSpell ? activeSpellCooldown > 0 ? `${learnedSpell.name} ${activeSpellCooldown}` : (spellTargetArmed ? "対象を選択" : `魔法・${learnedSpell.name}`) : "習得魔法";
      els.activeSpell.classList.toggle("selected", spellTargetArmed);
    }
    els.timeStop.textContent = state.dungeon.timeStopCooldown > 0 ? `時間停止 ${state.dungeon.timeStopCooldown}` : "時間停止";
    if (els.recoveryMedicine) {
      const count = getItemCount(RECOVERY_MEDICINE.id);
      els.recoveryMedicine.textContent = `エリクサー ${count}`;
      els.recoveryMedicine.disabled = count <= 0 || state.adventurer.hp >= getPlayerStats().maxHp;
    }
  }

  function useRecoveryMedicine() {
    if (!state.dungeon || !state.adventurer.inDungeon || getItemCount(RECOVERY_MEDICINE.id) <= 0) return;
    const maxHp = getPlayerStats().maxHp;
    if (state.adventurer.hp >= maxHp) return;
    const before = state.adventurer.hp;
    addItem(RECOVERY_MEDICINE.id, -1);
    state.adventurer.hp = Math.min(maxHp, state.adventurer.hp + Math.max(1, Math.ceil(maxHp * RECOVERY_MEDICINE.healRatio)));
    log(`${RECOVERY_MEDICINE.name}を飲み、HPを${state.adventurer.hp - before}回復した。空瓶は妙にこちらを見ている。`);
    playSfx("heal");
    advanceWorldIfDue();
    if (!state.dungeon || !state.adventurer.inDungeon) return;
    saveGame();
    render();
  }

  function currentDungeonLightRadius() {
    if (state.adventurer.jobId === "ninja") return { near: 0, mid: 0 };
    const bonus = state.adventurer.jobId === "handyman" ? 1 : 0;
    return { near: DUNGEON_LIGHT_RADIUS.near + bonus, mid: DUNGEON_LIGHT_RADIUS.mid + bonus };
  }

  function capoeiraActive(host = state.arena || state.dungeon) {
    return state.adventurer.jobId === "capoeirista" && Boolean(host?.capoeiraActive);
  }

  function capoeiraDirection(dx, dy, host = state.arena || state.dungeon) {
    return capoeiraActive(host) ? [-dx, -dy] : [dx, dy];
  }

  function intoxicated() {
    return Number(state.adventurer.intoxicationTurns || 0) > 0;
  }

  function drunkenFistActive() {
    return intoxicated() && state.adventurer.jobId === "heavy" && !state.adventurer.equipment.weapon;
  }

  function intoxicatedDirection(dx, dy) {
    if (!intoxicated() || drunkenFistActive()) return [dx, dy];
    const drinks = Math.max(1, Number(state.adventurer.intoxicationDrinks || 1));
    const wobbleChance = Math.min(0.85, 0.3 + drinks * 0.07);
    if (Math.random() >= wobbleChance) return [dx, dy];
    const directions = Object.values(DIRECTION_VECTORS).filter(([x, y]) => x !== dx || y !== dy);
    const [wobbleX, wobbleY] = pick(directions);
    log(`酩酊で足がもつれ、進む向きが${directionLabel(wobbleX, wobbleY)}へ逸れた！`);
    return [wobbleX, wobbleY];
  }

  function tickIntoxication() {
    const adv = state.adventurer;
    if (Number(adv.intoxicationTurns || 0) <= 0) return;
    const wasDrunkenFist = drunkenFistActive();
    adv.intoxicationTurns -= 1;
    if (adv.intoxicationTurns > 0) return;
    adv.intoxicationTurns = 0;
    adv.intoxicationDrinks = 0;
    log(wasDrunkenFist ? "酒気が抜け、酔拳の冴えが消えた。" : "ようやく酔いが醒め、足取りが元へ戻った。");
  }

  function tickSnackBuff() {
    const buff = state.adventurer.snackBuff;
    if (!buff || Number(buff.turns || 0) <= 0) return;
    buff.turns -= 1;
    if (buff.turns > 0) return;
    log(`「${buff.snackName}」の満腹効果が切れ、${statLabel(buff.stat)}が元へ戻った。`);
    state.adventurer.snackBuff = null;
  }

  function directionLabel(dx, dy) {
    return `${dy < 0 ? "上" : dy > 0 ? "下" : ""}${dx < 0 ? "左" : dx > 0 ? "右" : ""}` || "その場";
  }

  function toggleCapoeiraStance(host, scene) {
    if (!host || state.adventurer.jobId !== "capoeirista") return;
    host.capoeiraActive = !host.capoeiraActive;
    jobSkillTargetArmed = false;
    log(host.capoeiraActive
      ? "逆立ちジンガ！ 天地も前後も裏返った。8方向の入力が逆転し、両脚が凶器と化す！"
      : "カポエラ状態を解き、天地と移動感覚が元へ戻った。");
    playSfx(host.capoeiraActive ? "critical" : "step");
    if (scene === "arena") advanceArenaWorld();
    else {
      advanceWorldIfDue();
      if (state.dungeon && state.adventurer.inDungeon) {
        saveGame();
        render();
      }
    }
  }

  function buildMapCells() {
    els.map.innerHTML = "";
    cells = [];
    for (let i = 0; i < VIEW_SIZE * VIEW_SIZE; i += 1) {
      const cell = document.createElement("div");
      cell.className = "cell tile-wall";
      cell.setAttribute("role", "gridcell");
      els.map.appendChild(cell);
      cells.push(cell);
    }
  }

  function changeJob(jobId) {
    startAudioFromGesture();
    if (state.adventurer.inDungeon) {
      log("転職は街でのみ行える。");
      return;
    }
    if (!jobs[jobId] || jobId === state.adventurer.jobId) return;
    const oldHpRatio = state.adventurer.hp / getPlayerStats().maxHp;
    saveActiveJobProgress();
    state.adventurer.jobId = jobId;
    loadActiveJobProgress();
    spellTargetArmed = false;
    jobSkillTargetArmed = false;
    Object.entries(state.adventurer.equipment).forEach(([slot, itemId]) => {
      if (itemId && equipment[itemId] && !equipment[itemId].jobs.includes(jobId)) {
        state.adventurer.equipment[slot] = null;
      }
    });
    const stats = getPlayerStats();
    state.adventurer.hp = Math.max(1, Math.round(stats.maxHp * oldHpRatio));
    log(`${jobs[jobId].name}（Lv${state.adventurer.level}）に転職した。`);
    playSfx("jobChange");
    saveGame();
    render();
  }

  function restAtInn() {
    startAudioFromGesture();
    if (state.adventurer.inDungeon || state.adventurer.gold < INN_COST) return;
    state.adventurer.gold -= INN_COST;
    const maxHp = getPlayerStats().maxHp;
    state.adventurer.hp = maxHp;
    state.adventurer.temporaryDebuffs = {};
    state.adventurer.slowTurns = 0;
    state.adventurer.intoxicationDrinks = 0;
    state.adventurer.intoxicationTurns = 0;
    state.adventurer.snackBuff = null;
    const advice = pickInnAdvice();
    log(`宿屋で${INN_COST}Gを払い一晩休んだ。HPと一時的な能力低下が完全に回復した。宿の主人「${advice}」`);
    playSfx("rest");
    saveGame();
    render();
  }

  function acuteAlcoholRisk(drinks) {
    const excess = Math.max(0, Number(drinks || 0) - 3);
    return Math.min(0.22, excess * excess * 0.004);
  }

  function refreshTavernSnackMenu() {
    const candidates = INN_CONTENT.snacks.slice();
    tavernSnackMenu = [];
    while (tavernSnackMenu.length < 5 && candidates.length) {
      const index = Math.floor(Math.random() * candidates.length);
      tavernSnackMenu.push(candidates.splice(index, 1)[0]);
    }
  }

  function eatTavernSnack(snackId) {
    startAudioFromGesture();
    const snack = INN_CONTENT.snacks.find((item) => item.id === snackId);
    const adv = state.adventurer;
    if (!snack || adv.inDungeon || adv.gold < snack.price || !tavernSnackMenu.some((item) => item.id === snackId)) return;
    adv.gold -= snack.price;
    const comment = (INN_CONTENT.personalityComments[adv.personalityId] || INN_CONTENT.personalityComments.ordinary)(snack);
    log(`${snack.price}Gで「${snack.name}」を食べた。${adv.name}「${comment}」`);
    if (adv.personalityId === "glutton") {
      const baseAmount = snack.price >= 4 ? 3 : 2;
      const sameStat = adv.snackBuff?.turns > 0 && adv.snackBuff.stat === snack.stat;
      adv.snackBuff = {
        stat: snack.stat,
        amount: sameStat ? Math.min(5, Math.max(baseAmount, Number(adv.snackBuff.amount || 0) + 1)) : baseAmount,
        turns: Math.min(30, (sameStat ? Number(adv.snackBuff.turns || 0) : 0) + 10 + snack.price),
        snackName: snack.name,
      };
      log(`食いしん坊の満腹効果！ ${statLabel(adv.snackBuff.stat)}+${adv.snackBuff.amount}が${adv.snackBuff.turns}世界ターン続く。`);
      playSfx("levelStatUp");
    }
    refreshTavernSnackMenu();
    playSfx("select");
    saveGame();
    render();
  }

  function pickInnAdvice() {
    const adviceIndexes = INN_CONTENT.advices.map((_, index) => index);
    const freshIndexes = adviceIndexes.filter((index) => !recentInnAdviceIndexes.includes(index));
    const adviceIndex = pick(freshIndexes.length ? freshIndexes : adviceIndexes);
    recentInnAdviceIndexes = [adviceIndex, ...recentInnAdviceIndexes].slice(0, 6);
    return INN_CONTENT.advices[adviceIndex];
  }

  function drinkAtInn() {
    startAudioFromGesture();
    const adv = state.adventurer;
    if (adv.inDungeon || adv.gold < DRINK_COST) return;
    adv.gold -= DRINK_COST;
    adv.intoxicationDrinks = Math.max(0, Number(adv.intoxicationDrinks || 0)) + 1;
    adv.intoxicationTurns = Math.max(0, Number(adv.intoxicationTurns || 0)) + 5 + adv.intoxicationDrinks * 2;
    const risk = acuteAlcoholRisk(adv.intoxicationDrinks);
    log(`宿屋で酒を一杯飲んだ（累計${adv.intoxicationDrinks}杯）。宿の主人「${pickInnAdvice()}」`);
    if (Math.random() < risk) {
      log("杯が指から落ちた。酔いではない。身体が酒を毒として拒絶し、呼吸が止まる――。");
      die("宿屋での急性アルコール中毒");
      return;
    }
    log(drunkenFistActive()
      ? `武器を持たぬバーサーカーの足腰に酒気が巡った。超強力な打撃「酔拳」が${adv.intoxicationTurns}世界ターン続く！`
      : `酩酊状態になった。移動がふらつく状態が${adv.intoxicationTurns}世界ターン続く。宿泊すれば即座に醒める。`);
    playSfx("drink");
    playSfx("intoxicate");
    saveGame();
    render();
  }

  function equipAtHome(itemId, targetSlot) {
    startAudioFromGesture();
    if (state.adventurer.inDungeon || !ownsEquipment(itemId)) return;
    const item = equipment[itemId];
    if (!item || !item.jobs.includes(state.adventurer.jobId)) return;
    const validTarget = item.slot === "accessory"
      ? ["accessory1", "accessory2"].includes(targetSlot)
      : targetSlot === item.slot;
    if (!validTarget) return;
    if (item.slot === "accessory") {
      const otherSlot = targetSlot === "accessory1" ? "accessory2" : "accessory1";
      if (state.adventurer.equipment[otherSlot] === item.id) state.adventurer.equipment[otherSlot] = null;
    }
    state.adventurer.equipment[targetSlot] = item.id;
    log(`自宅で${equipmentDisplayName(item)}を装備した。`);
    playSfx("equip");
    saveGame();
    render();
  }

  function unequipAtHome(slot) {
    startAudioFromGesture();
    if (state.adventurer.inDungeon || slot === "weapon" || !(slot in state.adventurer.equipment)) return;
    state.adventurer.equipment[slot] = null;
    log("自宅で装備を外した。");
    playSfx("equip");
    saveGame();
    render();
  }

  function enterDungeon() {
    startAudioFromGesture();
    if (state.adventurer.inDungeon) {
      switchView("dungeon");
      return;
    }
    const destinations = unlockedDungeonStarts();
    if (destinations.length === 1) startDungeonAt(1);
    else openDepthPicker(destinations);
  }

  function unlockedDungeonStarts() {
    return [1, ...(state.meta.clearedBossFloors || [])]
      .filter((floor, index, values) => floor >= 1 && floor <= MAX_FLOOR && values.indexOf(floor) === index)
      .sort((a, b) => a - b);
  }

  function openDepthPicker(destinations = unlockedDungeonStarts()) {
    if (!els.depthPickerPanel || !els.depthPickerList) return;
    depthPickerReturnFocus = document.activeElement || null;
    els.depthPickerList.innerHTML = destinations.map((floor) => {
      const floorData = floorByNumber[floor];
      return `<button type="button" data-start-floor="${floor}"><strong>B${floor}F</strong><small>${floor === 1 ? "入口から探索" : `${floorData?.name || "守護者階"}へ直接出発`}</small></button>`;
    }).join("");
    els.depthPickerPanel.classList.remove("hidden");
    const destinationButtons = document.querySelectorAll("[data-start-floor]");
    destinationButtons.forEach((button) => button.addEventListener("click", () => {
      const floor = Number(button.dataset.startFloor);
      closeDepthPicker();
      startDungeonAt(floor);
    }));
    destinationButtons[0]?.focus();
  }

  function closeDepthPicker() {
    const wasOpen = Boolean(els.depthPickerPanel && !els.depthPickerPanel.classList.contains("hidden"));
    els.depthPickerPanel?.classList.add("hidden");
    const returnFocus = depthPickerReturnFocus;
    depthPickerReturnFocus = null;
    if (wasOpen) returnFocus?.focus?.();
  }

  function trapModalFocus(event) {
    if (event.key !== "Tab") return false;
    const dialog = [els.deathReviewPanel, els.depthPickerPanel, els.logHistoryPanel, document.querySelector("#developerPanel")]
      .find((panel) => panel && !panel.classList.contains("hidden"));
    if (!dialog) return false;
    const focusable = Array.from(dialog.querySelectorAll(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ));
    if (!focusable.length) return false;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    const focusEscapesBackward = event.shiftKey && (!dialog.contains(active) || active === first);
    const focusEscapesForward = !event.shiftKey && (!dialog.contains(active) || active === last);
    if (!focusEscapesBackward && !focusEscapesForward) return false;
    event.preventDefault();
    (focusEscapesBackward ? last : first).focus();
    return true;
  }

  function startDungeonAt(floorNumber, debugOverride = false) {
    const destinations = unlockedDungeonStarts();
    const requestedFloor = clamp(Math.floor(Number(floorNumber || 1)), 1, MAX_FLOOR);
    const destination = debugOverride || destinations.includes(requestedFloor) ? requestedFloor : 1;
    spellTargetArmed = false;
    jobSkillTargetArmed = false;
    state.adventurer.inDungeon = true;
    state.adventurer.floor = destination;
    state.adventurer.deepestFloor = Math.max(state.adventurer.deepestFloor || 1, destination);
    refreshShopInventoryForDepth();
    state.dungeon = generateFloor(destination);
    log(`B${destination}Fへ足を踏み入れた。${state.dungeon.layout ? `構造は「${state.dungeon.layout.name}」。` : ""}`);
    if (state.dungeon.anomaly) {
      log(`迷宮異変「${state.dungeon.anomaly.name}」発生。${state.dungeon.anomaly.description}`);
      playSfx(state.dungeon.anomaly.chaotic ? "chaos" : "anomaly");
    }
    playSfx("descend");
    switchView("dungeon");
  }

  function returnTown() {
    startAudioFromGesture();
    if (!state.adventurer.inDungeon) return;
    if (hasAdjacentLivingEnemy()) {
      log("魔物が隣接しているため帰還できない。まず距離を取れ！");
      playSfx("warning");
      render();
      return;
    }
    const deliveredBounties = state.adventurer.bountyCorpses.splice(0);
    spellTargetArmed = false;
    jobSkillTargetArmed = false;
    state.meta.guildClaims.push(...deliveredBounties);
    state.adventurer.inDungeon = false;
    state.dungeon = null;
    const pendingBounties = deliveredBounties.length;
    log(pendingBounties
      ? `街へ帰還した。賞金首の遺体${pendingBounties}体をギルドへ運び込んだ。報酬受取窓口で精算できる。`
      : "街へ帰還した。傷を癒やすには宿屋で休む必要がある。");
    playSfx("return");
    saveGame();
    switchView("town");
  }

  function hasAdjacentLivingEnemy() {
    if (!state.dungeon) return false;
    const { x, y } = state.dungeon.player;
    return state.dungeon.enemies.some((enemy) => enemy.alive
      && chebyshevDistance(enemy, { x, y }) <= 1);
  }

  function settleBountyCorpses() {
    const corpses = state.meta.guildClaims || [];
    if (!corpses.length) return;
    const total = corpses.reduce((sum, corpse) => sum + Number(corpse.reward || 0), 0);
    corpses.forEach((corpse) => {
      const record = state.meta.bounties[corpse.id] || { intel: true, claimed: 0 };
      record.claimed = Number(record.claimed || 0) + 1;
      state.meta.bounties[corpse.id] = record;
    });
    state.adventurer.gold += total;
    state.meta.guildClaims = [];
    log(`ギルドの報酬窓口で賞金首の遺体${corpses.length}体を精算し、${total}Gを受け取った。`);
    playSfx("victory");
    saveGame();
    render();
  }

  function generateFloor(floorNumber) {
    const floor = floorByNumber[floorNumber];
    const trapCount = rollFloorTrapCount(floorNumber);
    const minimumSize = trapCount >= 12 ? 48 : trapCount >= 8 ? 42 : MAP_SIZE_RANGE[0];
    const madnessUniqueIds = (floor.uniques || []).filter((id) => (
      monsters[id]?.unique && !monsters[id].arenaOnly && id !== "dungeon_lord_nox"
    ));
    const deeperUniques = DATA.monsters.filter((monster) => {
      if (!monster.unique || monster.arenaOnly || monster.id === "dungeon_lord_nox") return false;
      const nativeFloor = monsterNativeFloor(monster);
      return nativeFloor >= floorNumber + 2 && nativeFloor <= Math.min(99, floorNumber + 9);
    });
    const thrillUniqueIds = deeperUniques.flatMap((monster) => {
      const gap = monsterNativeFloor(monster) - floorNumber;
      return Array.from({ length: Math.max(1, 10 - gap) }, () => monster.id);
    });
    const artifactId = pick(availableFixedArtifacts(null, true).map((item) => item.id));
    let dungeon = null;
    for (let generationAttempt = 0; generationAttempt < 12; generationAttempt += 1) {
      const size = rand(minimumSize, MAP_SIZE_RANGE[1]);
      dungeon = window.HD_DUNGEON.generate({
        size,
        floor,
        createEnemy,
        specialRooms: {
          madnessUniqueIds,
          thrillUniqueIds: thrillUniqueIds.length ? thrillUniqueIds : madnessUniqueIds,
          artifactId,
          thrillRandomArtifact: !artifactId,
        },
      });
      placeFloorTraps(dungeon, floorNumber, trapCount);
      if (dungeon.traps.length === trapCount) break;
    }
    if (!dungeon || dungeon.traps.length !== trapCount) throw new Error("安全な間隔で罠フロアを生成できませんでした。");
    dungeon.enemies.filter((enemy) => enemy.thrillRoomGuardian).forEach(sanitizeGuardianSpecialAttack);
    if (floorNumber % 10 === 0) appointFloorGuardian(dungeon, floorNumber);
    applyFloorAnomaly(dungeon, floor);
    return dungeon;
  }

  function sanitizeGuardianSpecialAttack(enemy) {
    if (!enemy || (!enemy.floorGuardian && !enemy.thrillRoomGuardian) || enemy.specialAttack !== "self_destruct") return;
    enemy.specialAttack = "knockback";
  }

  function appointFloorGuardian(dungeon, floorNumber) {
    const allCandidates = DATA.monsters.filter((monster) => monster.unique && !monster.arenaOnly && monster.id !== "dungeon_lord_nox" && monster.floors?.length);
    const nearby = allCandidates.filter((monster) => Math.abs(monsterNativeFloor(monster) - floorNumber) <= 4);
    const candidates = nearby.length ? nearby : [...allCandidates].sort((a, b) => Math.abs(monsterNativeFloor(a) - floorNumber) - Math.abs(monsterNativeFloor(b) - floorNumber)).slice(0, 8);
    const guardianId = floorNumber === MAX_FLOOR ? "dungeon_lord_nox" : pick(candidates).id;
    let guardian = dungeon.enemies.find((enemy) => enemy.id === guardianId && enemy.alive);
    if (!guardian) {
      const pos = window.HD_DUNGEON.spawnPosition(dungeon, 12);
      if (pos) {
        guardian = createEnemy(guardianId, pos, true);
        dungeon.enemies.push(guardian);
      }
    }
    if (!guardian) return;
    guardian.floorGuardian = true;
    sanitizeGuardianSpecialAttack(guardian);
    guardian.asleep = false;
    guardian.maxHp = Math.round(guardian.maxHp * (1.3 + floorNumber / 300));
    guardian.hp = guardian.maxHp;
    guardian.attack = Math.round(guardian.attack * (1.08 + floorNumber / 500));
    guardian.acceleration = Number(guardian.acceleration || 0) + 5;
    dungeon.guardianId = guardian.id;
    dungeon.guardianDefeated = false;
    dungeon.stairs = [];
    log(`B${floorNumber}Fを守るフロア守護者「${guardian.name}」が選定された。`);
  }

  function rollFloorTrapCount(floorNumber) {
    return Math.random() < TRAP_FLOOR_CHANCE
      ? (1 + Math.floor(floorNumber / 40)) * TRAP_COUNT_MULTIPLIER
      : 0;
  }

  function placeFloorTraps(dungeon, floorNumber, plannedCount = null) {
    dungeon.traps = [];
    const count = plannedCount === null
      ? rollFloorTrapCount(floorNumber)
      : Math.max(0, Math.floor(Number(plannedCount || 0)));
    for (let index = 0; index < count; index += 1) {
      const pos = window.HD_DUNGEON.trapPosition(dungeon, {
        minPlayerDistance: 5,
        minTrapDistance: 3,
        protectedDistance: 2,
      });
      if (pos && !dungeon.traps.some((trap) => trap.x === pos.x && trap.y === pos.y)) {
        dungeon.traps.push({
          ...pos,
          type: pick(["damage", "slow", "drain", "bear", "teleport", "summon", "scatter"]),
          danger: rollTrapDanger(floorNumber),
          discovered: false,
          disarmed: false,
          triggerCount: 0,
          disarmFailures: 0,
        });
      }
    }
  }

  function rollTrapDanger(floorNumber) {
    if (floorNumber >= 61 && floorNumber <= 90 && Math.random() < 0.02) return 5;
    const depthBase = 1 + Math.floor((Math.max(1, floorNumber) - 1) / 30);
    const roll = Math.random();
    return clamp(depthBase + (roll < 0.12 ? 1 : roll > 0.9 ? -1 : 0), 1, 5);
  }

  function applyFloorAnomaly(dungeon, floor) {
    if (dungeon.madnessRoom || dungeon.treasureVault || dungeon.thrillRoom) return;
    if (floor.floor < 11 || Math.random() >= Math.min(0.095, 0.05 + floor.floor * 0.00045)) return;
    const steadyAnomalies = [
      { id: "brittle", name: "脆化の月", description: "魔物の攻撃力が少し増す一方、防御力が大きく低下する。" },
      { id: "tailwind", name: "追風層", description: "冒険者の加速度+10、魔物の加速度+5。手数の組み方が変わる。" },
      { id: "rich_vein", name: "豊穣脈", description: "宝箱が増え、魔物も少しだけ集まる。" },
      { id: "rainbow", name: "虹属性嵐", description: "魔物の攻撃属性が全面的に入れ替わる。" },
    ];
    const chaoticAnomalies = [
      { id: "overdrive", name: "狂速界", description: "冒険者も魔物も加速度+20。世界が追いつけない。", chaotic: true },
      { id: "titan", name: "巨獣祭", description: "全ての魔物が巨大化。HPと攻撃力が激増する。", chaotic: true },
      { id: "swarm", name: "百鬼夜行", description: "通常より大幅に多い魔物がフロアを埋め尽くす。", chaotic: true },
      { id: "gold", name: "黄金墓", description: "宝箱が大量発生し、素材獲得量が倍になる。", chaotic: true },
    ];
    const chaosRoll = Math.random();
    const anomaly = chaosRoll < 0.025
      ? { id: "pandemonium", name: "迷宮大暴走", description: "巨獣・狂速・虹属性・大群・財宝が同時発生する。生還できれば大収穫。", chaotic: true }
      : chaosRoll < 0.18 ? pick(chaoticAnomalies) : pick(steadyAnomalies);
    dungeon.anomaly = anomaly;
    if (["overdrive", "pandemonium"].includes(anomaly.id)) {
      dungeon.enemies.forEach((enemy) => { enemy.acceleration = Number(enemy.acceleration || 0) + 20; });
    }
    if (["titan", "pandemonium"].includes(anomaly.id)) {
      dungeon.enemies.forEach((enemy) => {
        enemy.maxHp = Math.round(enemy.maxHp * (anomaly.id === "pandemonium" ? 1.45 : 1.75));
        enemy.hp = enemy.maxHp;
        enemy.attack = Math.round(enemy.attack * (anomaly.id === "pandemonium" ? 1.22 : 1.3));
        enemy.defense = Math.round(enemy.defense * 1.2);
      });
    }
    if (["rainbow", "pandemonium"].includes(anomaly.id)) {
      dungeon.enemies.forEach((enemy, index) => {
        enemy.attackAttribute = DATA.attributes[(floor.floor + index * 3) % DATA.attributes.length];
        if (enemy.dangerous) enemy.dangerous.attribute = DATA.attributes[(floor.floor + index * 3 + 7) % DATA.attributes.length];
      });
    }
    if (["swarm", "pandemonium", "rich_vein"].includes(anomaly.id)) {
      const ratio = anomaly.id === "swarm" ? 0.4 : anomaly.id === "pandemonium" ? 0.28 : 0.12;
      const extra = Math.floor(floor.enemyCount * ratio);
      for (let index = 0; index < extra; index += 1) {
        const pos = window.HD_DUNGEON.spawnPosition(dungeon, 7);
        if (!pos) break;
        dungeon.enemies.push(createEnemy(pick(floor.monsterPool), pos, false));
      }
    }
    if (["gold", "pandemonium", "rich_vein"].includes(anomaly.id)) {
      const chestCount = anomaly.id === "gold" ? 8 : anomaly.id === "pandemonium" ? 10 : 4;
      for (let index = 0; index < chestCount; index += 1) {
        const pos = window.HD_DUNGEON.spawnPosition(dungeon, 4);
        if (!pos) break;
        dungeon.chests.push({ ...pos, opened: false });
      }
    }
    if (anomaly.id === "brittle") {
      dungeon.enemies.forEach((enemy) => {
        enemy.attack = Math.max(1, Math.round(enemy.attack * 1.12));
        enemy.defense = Math.max(0, Math.floor(enemy.defense * 0.68));
      });
    }
    if (anomaly.id === "tailwind") dungeon.enemies.forEach((enemy) => { enemy.acceleration = Number(enemy.acceleration || 0) + 5; });
  }

  function createEnemy(monsterId, pos, forceUnique) {
    const data = monsters[monsterId];
    markResearch(monsterId, 0);
    const enemy = {
      ...JSON.parse(JSON.stringify(data)),
      x: pos.x,
      y: pos.y,
      maxHp: data.hp,
      hp: data.hp,
      alive: true,
      turns: 0,
      telegraphed: false,
      dialogueState: { recent: [], cooldown: 0, counters: {}, stages: {} },
      acceleration: Number(data.acceleration || 0),
      unique: Boolean(forceUnique || data.unique),
      summonToken: data.summon ? `${data.id}@${pos.x},${pos.y}` : null,
      summonsUsed: 0,
      asleep: Math.random() < (data.unique || forceUnique ? UNIQUE_SLEEP_CHANCE : MONSTER_SLEEP_CHANCE),
    };
    enemy.canPhaseWalls = monsterCanPhaseWalls(data);
    const nativeFloor = monsterNativeFloor(data);
    if (nativeFloor >= 35 && !enemy.specialAttack) {
      const specials = ["ranged", "drain", "knockback", "self_destruct", "debuff", "devour"];
      const hash = [...data.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
      enemy.specialAttack = data.unique && nativeFloor >= 60 && hash % 3 === 0 ? "time_stop" : specials[hash % specials.length];
    }
    return enemy;
  }

  function monsterCanPhaseWalls(monster) {
    const phaseHash = [...String(monster?.id || "")].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return Boolean(monster?.speciesId === "spirit"
      || (monster?.unique && (monster.uniqueStyle === "silent"
        || (PHASING_UNIQUE_ATTRIBUTES.includes(monster.attackAttribute) && phaseHash % 7 === 0))));
  }

  function canUseTeleport() {
    return state.adventurer.inDungeon && state.dungeon && MAGIC_JOB_IDS.has(state.adventurer.jobId);
  }

  function teleportRandomly() {
    if (!canUseTeleport()) return;
    const cooldowns = teleportCooldowns();
    if (cooldowns.long > 0) return;
    const destination = window.HD_DUNGEON.spawnPosition(state.dungeon, 10);
    if (!destination) {
      log("転移先の空間が安定しない。");
      return;
    }
    state.dungeon.player = destination;
    state.dungeon.teleportCooldowns = { ...cooldowns, long: 13 };
    log("テレポートでフロア内の遠い地点へ跳んだ。");
    discoverSpecialRoomsAt(destination.x, destination.y);
    playSfx("teleportLong");
    advanceWorldIfDue();
    saveGame();
    render();
  }

  function stopTime() {
    if (state.adventurer.jobId !== "psychic" || state.adventurer.level < 40 || !state.dungeon || state.dungeon.timeStopCooldown > 0) return;
    state.dungeon.timeStopTurns = 3;
    state.dungeon.timeStopCooldown = 25;
    log("超能力で時を止めた。敵は3世界ターン行動できない。 ");
    playSfx("timeStop");
    advanceWorldIfDue();
    if (!state.dungeon || !state.adventurer.inDungeon) return;
    saveGame();
    render();
  }

  function castHealingMagic(host) {
    if (state.adventurer.jobId !== "priest" || !host || Number(host.healCooldown || 0) > 0) return false;
    const stats = getPlayerStats();
    if (state.adventurer.hp >= stats.maxHp) return false;
    const amount = Math.max(6, Math.round(stats.maxHp * 0.28 + stats.luck * 1.8));
    const healed = Math.min(amount, stats.maxHp - state.adventurer.hp);
    state.adventurer.hp += healed;
    host.healCooldown = Number(jobs.priest.skill.cooldown || 8);
    log(`プリーストの癒光がHPを${healed}回復した。`);
    playSfx("heal");
    return true;
  }

  function useDungeonHealingMagic() {
    if (!castHealingMagic(state.dungeon)) return;
    advanceWorldIfDue();
    saveGame();
    render();
  }

  function movePlayer(dx, dy) {
    startAudioFromGesture();
    if (pendingConfirm) return;
    if (!state.adventurer.inDungeon || !state.dungeon) return;
    [dx, dy] = capoeiraDirection(dx, dy, state.dungeon);
    [dx, dy] = intoxicatedDirection(dx, dy);
    const nx = state.dungeon.player.x + dx;
    const ny = state.dungeon.player.y + dy;
    if (Number(state.adventurer.immobilizedTurns || 0) > 0) {
      const adjacentEnemy = state.dungeon.enemies.find((item) => item.alive && item.x === nx && item.y === ny);
      if (adjacentEnemy) {
        bumpAttack(adjacentEnemy);
        return;
      }
      log(`トラバサミが脚を噛み、移動できない。拘束残り${state.adventurer.immobilizedTurns}世界ターン。`);
      playSfx("bump");
      advanceWorldIfDue();
      if (state.dungeon && state.adventurer.inDungeon) {
        saveGame();
        render();
      }
      return;
    }
    const mapSize = state.dungeon.map.length;
    const insideMap = ny >= 0 && ny < mapSize && nx >= 0 && nx < mapSize;
    const wall = insideMap && state.dungeon.map[ny][nx] === "wall";
    const outerBoundary = nx <= 0 || ny <= 0 || nx >= mapSize - 1 || ny >= mapSize - 1;
    if (wall && !outerBoundary && state.adventurer.jobId === "handyman") {
      state.dungeon.map[ny][nx] = "floor";
      state.dungeon.excavatedTiles = Array.isArray(state.dungeon.excavatedTiles) ? state.dungeon.excavatedTiles : [];
      if (!state.dungeon.excavatedTiles.some((tile) => tile.x === nx && tile.y === ny)) {
        state.dungeon.excavatedTiles.push({ x: nx, y: ny });
      }
      log("便利屋が工具を振るい、内壁を1マス掘削した。");
      playSfx("blunt");
      advanceWorldIfDue();
      if (!state.dungeon || !state.adventurer.inDungeon) return;
      saveGame();
      render();
      return;
    }
    const ghostPhase = state.adventurer.raceId === "ghost" && wall && !outerBoundary;
    if (!insideMap || (wall && !ghostPhase)) {
      log("壁に阻まれた。");
      playSfx("bump");
      render();
      return;
    }
    if (ghostPhase) {
      log("幽霊の身体が淡く透け、内壁をすり抜けた。 ");
      playSfx("illusion");
    }

    const enemy = state.dungeon.enemies.find((item) => item.alive && item.x === nx && item.y === ny);
    if (enemy) {
      if (enemy.specialRoom) discoverSpecialRoomsAt(enemy.x, enemy.y);
      bumpAttack(enemy);
      return;
    }

    const chest = state.dungeon.chests.find((item) => !item.opened && item.x === nx && item.y === ny);
    state.dungeon.player.x = nx;
    state.dungeon.player.y = ny;
    discoverSpecialRoomsAt(nx, ny);
    triggerTrapAt(nx, ny);
    if (!state.dungeon || !state.adventurer.inDungeon) return;
    if (chest) openChest(chest);

    if (state.dungeon.stairs.some((stairs) => stairs.x === nx && stairs.y === ny)) {
      playSfx("step");
      advanceWorldIfDue();
      if (!state.dungeon || !state.adventurer.inDungeon) return;
      if (state.adventurer.floor >= MAX_FLOOR) {
        log("ここが迷宮の最深部だ。太古からの闇キキルクルスを討ち、百階踏破を成し遂げよ。");
        saveGame();
        render();
        return;
      }
      saveGame();
      render();
      askConfirm(
        "下り階段",
        `B${state.adventurer.floor + 1}Fへ下りますか？`,
        descend,
      );
      return;
    }

    advanceWorldIfDue();
    playSfx("step");
    saveGame();
    render();
  }

  function reservedArtifactIds(exceptChest = null) {
    return new Set((state.dungeon?.chests || [])
      .filter((chest) => chest !== exceptChest && !chest.opened && chest.thrillArtifact && chest.artifactId)
      .map((chest) => chest.artifactId));
  }

  function availableFixedArtifacts(exceptChest = null, ignoreReservations = false) {
    const reserved = ignoreReservations ? new Set() : reservedArtifactIds(exceptChest);
    return DATA.equipment.filter((item) => (
      item.artifact?.chestOnly
      && !item.artifact.random
      && !ownsEquipment(item.id)
      && !state.adventurer.discoveredArtifacts.includes(item.id)
      && !reserved.has(item.id)
    ));
  }

  function grantArtifact(item, message) {
    if (!item || ownsEquipment(item.id)) return false;
    state.adventurer.ownedEquipment.push(item.id);
    if (!item.artifact.random && !state.adventurer.discoveredArtifacts.includes(item.id)) state.adventurer.discoveredArtifacts.push(item.id);
    log(`${message}${item.artifact.label}「${equipmentDisplayName(item)}」を発見し、自宅へ送った。${item.curse ? "禍々しい呪いを帯びている。" : ""}`);
    playSfx("victory");
    return true;
  }

  function generateRandomArtifact(depth) {
    if (!ARTIFACTS) return null;
    if (state.dungeon?.randomArtifactFound) return null;
    state.meta.randomArtifactSerial = Math.max(0, Number(state.meta.randomArtifactSerial || 0)) + 1;
    const item = ARTIFACTS.generate({
      depth,
      serial: state.meta.randomArtifactSerial,
      attributes: DATA.attributes,
      jobs: DATA.jobs.map((job) => job.id),
    });
    state.adventurer.randomArtifacts[item.id] = item;
    equipment[item.id] = item;
    if (state.dungeon) state.dungeon.randomArtifactFound = true;
    return item;
  }

  function openThrillArtifactChest(chest) {
    const guardianAlive = state.dungeon.enemies.some((enemy) => enemy.alive && enemy.thrillRoomGuardian);
    if (guardianAlive) {
      log("強敵ユニークの力が宝箱を封じている。守護者を倒さなければ開かない。");
      playSfx("bump");
      return false;
    }
    if (chest.randomArtifactReward) {
      const generated = generateRandomArtifact(Math.min(100, state.adventurer.floor + 15));
      if (generated) {
        grantArtifact(generated, "守護者の封印が砕け、濃縮された迷宮魔力が白い星へ結晶化した。");
        return true;
      }
    }
    const promised = equipment[chest.artifactId];
    const item = promised && !ownsEquipment(promised.id) && !state.adventurer.discoveredArtifacts.includes(promised.id)
      ? promised
      : pick(availableFixedArtifacts(chest));
    if (!item) {
      log("守護者の封印は解けたが、星の器はすでに全て収集されていた。");
      playSfx("chest");
      return true;
    }
    grantArtifact(item, "守護者の封印が砕け、宝箱の奥で星が燃え上がった。");
    return true;
  }

  function openTreasureVaultChest(depth) {
    const artifactRoll = Math.random();
    const randomChance = ARTIFACTS.dropChance(depth) * 3;
    if (artifactRoll < randomChance) {
      const generated = generateRandomArtifact(depth);
      if (generated && grantArtifact(generated, "宝物庫の最奥で迷宮魔力が結晶化した。二つとない")) return;
    }
    const fixedArtifacts = availableFixedArtifacts();
    if (fixedArtifacts.length && artifactRoll < randomChance + VAULT_FIXED_ARTIFACT_CHANCE) {
      const tierWeights = { joke: 12, trash: 14, ordinary: 32, useful: 26, cheat: 3 };
      const item = weightedPick(fixedArtifacts, (candidate) => tierWeights[candidate.artifact.tier] || 1);
      if (grantArtifact(item, "宝物庫の箱から濃い星光があふれた。")) return;
    }

    const legendJunk = (DATA.junkItems || []).filter((item) => item.junkTier === "legend" && Number(item.minFloor || 1) <= depth);
    if (legendJunk.length && Math.random() < VAULT_LEGEND_JUNK_CHANCE) {
      const item = weightedPick(legendJunk, (candidate) => Number(candidate.rarityWeight || 0));
      addItem(item.id, 1);
      log(`宝物庫の沈黙が割れ、伝説級ガラクタ「${item.name}」を得た！ 商店なら${ECONOMY.treasureSellPrice(item)}Gで売れる。`);
      playSfx("victory");
      return;
    }

    const spellbooks = (DATA.spellbooks || []).filter((item) => Number(item.minFloor || 1) <= depth);
    const maximumRank = Math.max(1, ...spellbooks.map((item) => Number(DATA.spellbookRanksById[item.rank]?.order || 1)));
    const rareSpellbooks = spellbooks.filter((item) => Number(DATA.spellbookRanksById[item.rank]?.order || 1) >= maximumRank - 1);
    if (rareSpellbooks.length && Math.random() < 0.72) {
      const item = weightedPick(rareSpellbooks, (candidate) => Number(candidate.rarityWeight || 1));
      addItem(item.id, 1);
      log(`宝物庫の箱から希少な${item.name}を得た。`);
      playSfx("chest");
      return;
    }
    const valuableJunk = (DATA.junkItems || [])
      .filter((item) => item.junkTier !== "legend" && Number(item.minFloor || 1) <= depth)
      .sort((a, b) => Number(b.sellPrice || 0) - Number(a.sellPrice || 0))
      .slice(0, 12);
    const item = weightedPick(valuableJunk.length ? valuableJunk : DATA.junkItems.filter((candidate) => candidate.junkTier !== "legend"), (candidate) => Number(candidate.rarityWeight || 0));
    addItem(item.id, 1);
    log(`宝物庫の箱から高額品「${item.name}」を得た。商店なら${ECONOMY.treasureSellPrice(item)}Gで売れる。`);
    playSfx("chest");
  }

  function openChest(chest) {
    if (chest.thrillArtifact && !openThrillArtifactChest(chest)) return;
    chest.opened = true;
    const depth = state.adventurer.floor;
    if (chest.thrillArtifact) return;
    if (chest.treasureVault) {
      openTreasureVaultChest(depth);
      return;
    }
    const floor = floorByNumber[depth];
    const uniqueCandidates = (floor.uniques || []).filter((id) => (
      monsters[id]?.unique
      && !monsters[id].arenaOnly
      && !state.dungeon.enemies.some((enemy) => enemy.id === id)
    ));
    if (!state.dungeon.madnessRoom && !state.dungeon.thrillRoom
      && uniqueCandidates.length && Math.random() < 0.018 && releaseChestUnique(pick(uniqueCandidates))) {
      playSfx("boss");
      return;
    }

    const artifacts = availableFixedArtifacts();
    const artifactRoll = Math.random();
    const randomArtifactChance = ARTIFACTS.dropChance(depth);
    if (artifactRoll < randomArtifactChance) {
      const generated = generateRandomArtifact(depth);
      if (generated && grantArtifact(generated, "宝箱の中で迷宮魔力が偶然結晶化した。激レアの")) return;
    }
    if (artifacts.length && artifactRoll < randomArtifactChance + FIXED_ARTIFACT_CHEST_CHANCE) {
      const tierWeights = { joke: 28, trash: 34, ordinary: 24, useful: 11, cheat: 1 };
      const item = weightedPick(artifacts, (candidate) => tierWeights[candidate.artifact.tier] || 1);
      if (grantArtifact(item, "宝箱の奥で星が瞬いた。")) return;
    }

    const amount = 1;
    const minimumSpellRank = depth >= 90 ? 4 : depth >= 70 ? 3 : depth >= 40 ? 2 : 1;
    const spellbookCandidates = (DATA.spellbooks || []).filter((item) => (
      Number(item.minFloor || 1) <= depth
      && Number(DATA.spellbookRanksById[item.rank]?.order || 1) >= minimumSpellRank
    ));
    if (spellbookCandidates.length && Math.random() < 0.42) {
      const item = weightedPick(spellbookCandidates, (candidate) => Number(candidate.rarityWeight || 1));
      addItem(item.id, amount);
      log(`宝箱から${item.name}を${amount}冊得た。${spellbookRankLabel(item.rank)}の術式は${spellbookRankLabel(item.rank) === "初級" ? "比較的読み解きやすい" : "希少で高度なものだ"}。`);
      playSfx("chest");
      return;
    }

    const junkCandidates = (DATA.junkItems || []).filter((item) => Number(item.minFloor || 1) <= depth);
    const item = weightedPick(junkCandidates.length ? junkCandidates : DATA.junkItems, (candidate) => Number(candidate.rarityWeight || 1));
    if (item) {
      addItem(item.id, amount);
      log(`宝箱からガラクタ「${item.name}」を${amount}個得た。商店なら${ECONOMY.treasureSellPrice(item)}Gで売れる。`);
    } else {
      log("宝箱は空だった。誰かに先を越されたらしい。");
    }
    playSfx("chest");
  }

  function weightedPick(items, weightOf) {
    if (!items?.length) return null;
    const weighted = items.map((item) => ({ item, weight: Math.max(0, Number(weightOf(item) || 0)) }));
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    if (total <= 0) return pick(items);
    let roll = Math.random() * total;
    for (const entry of weighted) {
      roll -= entry.weight;
      if (roll <= 0) return entry.item;
    }
    return weighted[weighted.length - 1].item;
  }

  function releaseChestUnique(monsterId) {
    if (!state.dungeon || !monsters[monsterId]) return false;
    const directions = [
      [-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1],
    ].sort(() => Math.random() - 0.5);
    const origin = state.dungeon.player;
    const destination = directions.map(([dx, dy]) => ({ x: origin.x + dx, y: origin.y + dy })).find((pos) => (
      state.dungeon.map[pos.y]?.[pos.x] === "floor"
      && !state.dungeon.enemies.some((enemy) => enemy.alive && enemy.x === pos.x && enemy.y === pos.y)
      && !state.dungeon.stairs.some((stairs) => stairs.x === pos.x && stairs.y === pos.y)
      && !state.dungeon.chests.some((chest) => !chest.opened && chest.x === pos.x && chest.y === pos.y)
      && !(state.dungeon.traps || []).some((trap) => !trap.disarmed && trap.x === pos.x && trap.y === pos.y)
    ));
    if (!destination) return false;
    const enemy = createEnemy(monsterId, destination, true);
    enemy.asleep = false;
    enemy.chestAmbush = true;
    state.dungeon.enemies.push(enemy);
    state.dungeon.uniqueSpawned = true;
    markResearch(enemy.id, 1);
    log(`宝箱の中から${enemy.name}が飛び出した！ 中身は財宝ではなくユニークモンスターだった。`);
    ensureUniqueEncounterSpeech(enemy);
    return true;
  }

  function findDisarmableTrap() {
    if (!state.dungeon) return null;
    const { x, y } = state.dungeon.player;
    return state.dungeon.traps?.find((trap) => (
      trap.discovered
      && !trap.disarmed
      && chebyshevDistance(trap, { x, y }) <= 1
    )) || null;
  }

  function searchForTraps() {
    if (!state.dungeon || !state.adventurer.inDungeon) return false;
    const { x, y } = state.dungeon.player;
    const hiddenTraps = (state.dungeon.traps || []).filter((trap) => (
      !trap.discovered
      && !trap.disarmed
      && Math.hypot(trap.x - x, trap.y - y) <= 2.5
    ));
    const stats = getPlayerStats();
    const jobBonus = state.adventurer.jobId === "hunter" ? 0.5 : state.adventurer.jobId === "handyman" ? 0.18 : 0;
    const chance = clamp(0.34 + stats.dexterity * 0.025 + stats.luck * 0.012 + jobBonus, 0.18, 0.96);
    const found = hiddenTraps.find(() => Math.random() < chance) || null;
    if (found) {
      found.discovered = true;
      log(`床の違和感を調べ、危険度${trapDangerLabel(found)}の${trapTypeLabel(found)}を発見した。隣接すれば解除を試みられる。`);
      playSfx("trapDiscover");
    } else {
      log(hiddenTraps.length ? "周囲を探ったが、罠の仕掛けを見抜けなかった。" : "周囲を丁寧に調べたが、罠の気配はない。");
    }
    advanceWorldIfDue();
    if (!state.dungeon || !state.adventurer.inDungeon) return true;
    saveGame();
    render();
    return true;
  }

  function disarmTrap() {
    const trap = findDisarmableTrap();
    if (!trap) return false;
    const profile = trapDisarmProfile(trap);
    if (Math.random() < profile.chance) {
      trap.disarmed = true;
      log(`危険度${trapDangerLabel(trap)}の${trapTypeLabel(trap)}を解除し、無力化した（成功率${profile.percent}%）。`);
      playSfx("trapDisarm");
    } else {
      trap.disarmFailures = Number(trap.disarmFailures || 0) + 1;
      log(`危険度${trapDangerLabel(trap)}の${trapTypeLabel(trap)}の解除に失敗した（成功率${profile.percent}%）。仕掛けが半作動し、次回の解除率が上がる！`);
      activateTrap(trap, { effectMultiplier: profile.failureEffectMultiplier });
    }
    if (!state.dungeon || !state.adventurer.inDungeon) return true;
    advanceWorldIfDue();
    if (!state.dungeon || !state.adventurer.inDungeon) return true;
    saveGame();
    render();
    return true;
  }

  function triggerTrapAt(x, y) {
    const trap = state.dungeon.traps?.find((item) => !item.disarmed && item.x === x && item.y === y);
    if (trap) activateTrap(trap);
  }

  function activateTrap(trap, options = {}) {
    if (!trap || trap.disarmed) return;
    if (Number(trap.triggerCount || 0) >= 3) {
      trap.disarmed = true;
      return;
    }
    const firstTrigger = Number(trap.triggerCount || 0) === 0;
    const danger = trapDanger(trap);
    const effectMultiplier = clamp(Number(options.effectMultiplier ?? 1), 0.1, 1);
    trap.discovered = true;
    trap.triggerCount = Number(trap.triggerCount || 0) + 1;
    if (trap.type === "damage") {
      const damage = Math.max(1, Math.round((4 + Math.floor(state.adventurer.floor / 3)) * (1 + (danger - 1) * 0.22) * effectMultiplier));
      state.adventurer.hp -= damage;
      log(`危険度${trapDangerLabel(trap)}の床罠が作動し、${damage}ダメージを受けた。`);
    } else if (trap.type === "drain") {
      const drained = Math.max(1, Math.round((10 + state.adventurer.floor) * (1 + (danger - 1) * 0.18) * effectMultiplier));
      state.adventurer.experience = Math.max(0, state.adventurer.experience - drained);
      saveActiveJobProgress();
      log(`危険度${trapDangerLabel(trap)}の吸精罠が作動し、経験値を${drained}奪われた。`);
    } else if (trap.type === "slow") {
      const turns = Math.max(1, Math.round((6 + danger * 2) * effectMultiplier));
      state.adventurer.slowTurns = Math.max(state.adventurer.slowTurns, turns);
      log(`危険度${trapDangerLabel(trap)}の鈍化罠が作動し、素早さが${turns}世界ターン低下した。`);
    } else if (trap.type === "bear") {
      const turns = Math.max(1, Math.round((2 + danger) * effectMultiplier));
      state.adventurer.immobilizedTurns = Math.max(state.adventurer.immobilizedTurns, turns);
      const damage = Math.max(1, Math.round((2 + danger * 2) * effectMultiplier));
      state.adventurer.hp -= damage;
      log(`危険度${trapDangerLabel(trap)}のトラバサミが脚へ食い込み、${damage}ダメージ。${turns}世界ターン移動不能！`);
    } else if (trap.type === "teleport") {
      const distance = 6 + danger * 3;
      const destination = window.HD_DUNGEON.spawnPosition(state.dungeon, distance);
      if (destination) {
        state.dungeon.player = destination;
        discoverSpecialRoomsAt(destination.x, destination.y);
        log(`危険度${trapDangerLabel(trap)}の強制転移罠が空間を裏返し、フロア内の遠方へ放り出した！`);
      } else log(`強制転移罠が空間を歪めたが、転移先を確保できず不発に終わった。`);
    } else if (trap.type === "summon") {
      const summoned = summonTrapEncirclement(danger, effectMultiplier);
      log(`危険度${trapDangerLabel(trap)}の召喚罠が作動。周囲1マスへ${summoned}体の魔物が出現し、退路を塞いだ！`);
    } else if (trap.type === "scatter") {
      const scattered = scatterTrapField(danger, effectMultiplier);
      log(`危険度${trapDangerLabel(trap)}の罠バラまき罠が弾け、フロア全域へ新たな罠を${scattered}基ばらまいた！`);
    }
    if (firstTrigger) log("罠の場所と仕組みが露出した。まだ作動可能だが、隣接すれば解除を試みられる。 ");
    if (trap.triggerCount >= 3) {
      trap.disarmed = true;
      log("仕掛けは三度目の作動で壊れ、完全に沈黙した。 ");
    }
    const trapSound = { damage: "trapDamage", drain: "trapDrain", slow: "trapSlow", bear: "trapDamage", teleport: "teleportLong", summon: "chaos", scatter: "anomaly" }[trap.type] || "trapSlow";
    playSfx(trapSound);
    if (state.adventurer.hp <= 0) die("ダンジョンの罠");
  }

  function summonTrapEncirclement(danger, effectMultiplier = 1) {
    if (!state.dungeon) return 0;
    const floor = floorByNumber[state.adventurer.floor];
    const center = state.dungeon.player;
    const positions = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const x = center.x + dx;
        const y = center.y + dy;
        const inside = x > 0 && y > 0 && x < state.dungeon.map.length - 1 && y < state.dungeon.map.length - 1;
        if (!inside) continue;
        if (state.dungeon.map[y][x] === "wall") state.dungeon.map[y][x] = "floor";
        positions.push({ x, y });
      }
    }
    const targetCount = Math.min(positions.length, Math.max(1, Math.ceil(positions.length * effectMultiplier)));
    let summoned = 0;
    positions.slice(0, targetCount).forEach((position, index) => {
      if (state.dungeon.enemies.some((enemy) => enemy.alive && enemy.x === position.x && enemy.y === position.y)) return;
      const poolIndex = (danger * 3 + index + state.adventurer.floor) % floor.monsterPool.length;
      state.dungeon.enemies.push(createEnemy(floor.monsterPool[poolIndex], position, false));
      summoned += 1;
    });
    return summoned;
  }

  function scatterTrapField(danger, effectMultiplier = 1) {
    if (!state.dungeon) return 0;
    const targetCount = Math.max(1, Math.round((8 + danger * 5) * effectMultiplier));
    const scatteredTypes = ["damage", "slow", "drain", "bear", "teleport", "summon"];
    let scattered = 0;
    for (let index = 0; index < targetCount; index += 1) {
      const position = window.HD_DUNGEON.trapPosition(state.dungeon, { minPlayerDistance: 3, minTrapDistance: 1, protectedDistance: 1 });
      if (!position) break;
      state.dungeon.traps.push({
        ...position,
        type: scatteredTypes[(index + danger + state.adventurer.floor) % scatteredTypes.length],
        danger: clamp(danger + (index % 5 === 0 ? 1 : index % 7 === 0 ? -1 : 0), 1, 5),
        discovered: false,
        disarmed: false,
        triggerCount: 0,
        disarmFailures: 0,
      });
      scattered += 1;
    }
    return scattered;
  }

  function trapDanger(trap) {
    return clamp(Math.floor(Number(trap?.danger || 1)), 1, 5);
  }

  function trapDangerLabel(trap) {
    return TRAP_DANGER_LABELS[trapDanger(trap)];
  }

  function trapTypeLabel(trap) {
    return TRAP_TYPE_LABELS[trap?.type] || "罠";
  }

  function trapDisarmProfile(trap) {
    const stats = getPlayerStats();
    const dangerPenalty = (trapDanger(trap) - 1) * 0.12;
    const typePenalty = trap?.type === "scatter" ? 0.15 : trap?.type === "summon" ? 0.12 : trap?.type === "teleport" ? 0.08 : trap?.type === "bear" ? 0.06 : trap?.type === "drain" ? 0.05 : trap?.type === "slow" ? 0.02 : 0;
    const jobBonus = Number(TRAP_JOB_DISARM_BONUSES[state.adventurer.jobId] || 0);
    const personalityBonus = Number(TRAP_PERSONALITY_DISARM_BONUSES[state.adventurer.personalityId] || 0);
    const raceBonus = Number(TRAP_RACE_DISARM_BONUSES[state.adventurer.raceId] || 0);
    const retryBonus = Math.max(0, Number(trap?.disarmFailures || 0)) * 0.15;
    const rawChance = 0.38 + stats.dexterity * 0.02 + stats.luck * 0.01
      + jobBonus + personalityBonus + raceBonus + retryBonus - dangerPenalty - typePenalty;
    const chanceCap = state.adventurer.jobId === "hunter" ? 0.99 : state.adventurer.jobId === "handyman" ? 0.97 : 0.93;
    const chance = clamp(rawChance, 0.25, chanceCap);
    const failureEffectMultiplier = state.adventurer.jobId === "hunter" ? 0.2
      : state.adventurer.jobId === "handyman" ? 0.35
        : clamp(0.5 - Math.max(0, rawChance - chanceCap) * 0.5, 0.35, 0.5);
    return { chance, percent: Math.round(chance * 100), chanceCap, failureEffectMultiplier };
  }

  function descend() {
    if (state.adventurer.floor >= MAX_FLOOR) {
      log("これより先に階層はない。太古からの闇キキルクルスの討伐が最終目標だ。");
      return;
    }
    state.adventurer.floor += 1;
    state.adventurer.deepestFloor = Math.max(state.adventurer.deepestFloor || 1, state.adventurer.floor);
    refreshShopInventoryForDepth();
    state.adventurer.hp = Math.min(getPlayerStats().maxHp, state.adventurer.hp + 4);
    state.dungeon = generateFloor(state.adventurer.floor);
    log(`B${state.adventurer.floor}Fへ降りた。${state.dungeon.layout ? `構造は「${state.dungeon.layout.name}」。${state.dungeon.layout.description}` : ""}`);
    if (state.dungeon.anomaly) {
      log(`迷宮異変「${state.dungeon.anomaly.name}」発生。${state.dungeon.anomaly.description}`);
      playSfx(state.dungeon.anomaly.chaotic ? "chaos" : "anomaly");
    }
    playSfx("descend");
    saveGame();
    render();
  }

  // Combat, progression, corpses, and loot.
  function bumpAttack(enemy) {
    if (enemy?.flowerPet) {
      log(`${enemy.name}は花印に従い、道を譲ろうと花弁を揺らした。`);
      advanceWorldIfDue();
      saveGame();
      render();
      return;
    }
    markResearch(enemy.id, 1);
    if (enemy.invisible && !getPlayerStats().canSeeInvisible && !enemy.revealed) {
      enemy.revealed = true;
      log("見えない何かへ接触した。攻撃の瞬間だけ輪郭を捉えた！");
      playSfx("invisibleReveal");
    }
    const firstContact = !enemy.engaged;
    enemy.engaged = true;
    ensureUniqueEncounterSpeech(enemy);
    log(`${enemy.name}に踏み込み、連撃を放った。`);
    if (firstContact) playSfx(enemy.unique ? "boss" : "encounter");
    const result = playerAttack(enemy, "attack");
    finishDungeonAttack(enemy, result);
  }

  function finishDungeonAttack(enemy, result = null) {
    if (result?.skipWorldAdvance) return;
    if (enemy.hp <= 0 && enemy.alive) defeatEnemy(enemy);
    if (!state.dungeon || !state.adventurer.inDungeon) return;
    advanceWorldIfDue();
    if (!state.dungeon || !state.adventurer.inDungeon) return;
    saveGame();
    render();
  }

  function playerAttack(enemy, mode, learnedSpell = null) {
    const job = jobs[state.adventurer.jobId];
    if (mode === "skill" && job.skill.tag === "observe") {
      observeEnemy(enemy, Number(job.skill.researchAmount || 2));
      return;
    }
    const wasAsleep = Boolean(enemy.asleep);
    const thiefSleepAmbush = wasAsleep && state.adventurer.jobId === "hunter";
    if (wasAsleep) {
      enemy.asleep = false;
      log(thiefSleepAmbush
        ? `盗賊が眠る${enemy.name}の急所へ忍び寄った。寝込み襲撃で大ダメージを狙う！`
        : `${enemy.name}は攻撃の気配で目を覚ました！`);
    }
    ensureUniqueEncounterSpeech(enemy);
    const secretName = String(state.adventurer.name || "").trim();
    if (secretName === "サイタマ" && Math.random() < SAITAMA_ONE_PUNCH_CHANCE) {
      state.adventurer.lastAttack = { attribute: "blunt", attributes: ["blunt"], skill: "secret:one_punch" };
      enemy.hp = 0;
      markResearch(enemy.id, 4);
      log(`裏技発動。サイタマのワンパンチが${enemy.name}を一撃で沈めた！`);
      playSfx("critical");
      return;
    }
    if (secretName === "リムル" && state.adventurer.raceId === "slime" && state.dungeon && Math.random() < RIMURU_FLOOR_WIPE_CHANCE) {
      state.adventurer.lastAttack = { attribute: "dark", attributes: ["dark"], skill: "secret:imaginary_collapse" };
      if (annihilateDungeonFloor()) return { skipWorldAdvance: true };
    }
    const profile = getPlayerBattleProfile(enemy, mode, learnedSpell, { wasAsleep });
    const divineShielded = Number(enemy.divineInvulnerabilityCharges || 0) > 0;
    if (thiefSleepAmbush) {
      profile.hitChance = Math.max(profile.hitChance, 0.96);
      profile.critChance = Math.max(profile.critChance, 0.3);
    }
    const outcome = rollAttackSequence(profile, (raw) => {
      const resistedDamage = divineShielded ? 0 : damageAfterDefense(raw, profile.attributes, enemy, profile.defensePierce);
      const damage = resistedDamage <= 0
        ? 0
        : Math.max(1, Math.round(resistedDamage * (thiefSleepAmbush ? THIEF_SLEEP_AMBUSH_MULTIPLIER : 1)));
      enemy.hp -= damage;
      return damage;
    }, () => enemy.hp <= 0);
    state.adventurer.lastAttack = {
      attribute: profile.attribute,
      attributes: profile.attributes.slice(),
      skill: mode === "spell" && learnedSpell ? `spell:${learnedSpell.id}` : mode === "skill" ? job.skill.tag : null,
      sleepAmbush: thiefSleepAmbush,
    };
    if (divineShielded) {
      enemy.divineInvulnerabilityCharges = Math.max(0, enemy.divineInvulnerabilityCharges - 1);
      log(`${enemy.name}の神域が攻撃という出来事そのものを拒絶した。残る不可侵${enemy.divineInvulnerabilityCharges}回。`);
      playSfx("invulnerable");
    }
    log(`${profile.label}。${profile.attackTrials}回試行、${outcome.hitCount}ヒット、合計${outcome.total}ダメージ。`);
    if (outcome.critCount) log(`会心${outcome.critCount}回。`);
    if (enemy.rapidRegeneration && outcome.hitCount > 0 && enemy.hp > 0) {
      if (profile.attributes.includes("fire")) {
        enemy.regenerationSuppressedTurns = Math.max(2, Number(enemy.regenerationSuppressedTurns || 0));
        log(`火属性が${enemy.name}の再生創を焼き塞いだ。急速再生を2世界ターン封印！`);
      } else if (outcome.critCount > 0) {
        enemy.regenerationSuppressedTurns = Math.max(1, Number(enemy.regenerationSuppressedTurns || 0));
        log(`会心が${enemy.name}の再生器官を砕いた。急速再生を1世界ターン封印！`);
      }
      if (profile.attributes.includes("poison")) {
        enemy.regenerationWeakenedTurns = Math.max(3, Number(enemy.regenerationWeakenedTurns || 0));
        log(`毒属性が${enemy.name}の再生循環へ混入した。3世界ターン、回復量半減！`);
      }
    }
    if (outcome.hitCount) {
      playCombatSfx(profile.attribute, false);
      if (outcome.critCount) playSfx("critical");
    } else playSfx("warning");
    markResearch(enemy.id, 2);
    if (outcome.total > 0 && enemy.hp > 0 && tryFlowerCharm(enemy, mode)) return outcome;
    const milestoneSpoken = speakByHp(enemy);
    if (!milestoneSpoken && enemy.hp > 0) {
      uniqueSpeak(enemy, outcome.hitCount ? "hit" : "evade", { chance: outcome.hitCount ? 0.72 : 0.82 });
    }
    return outcome;
  }

  function activeFlowerPets() {
    return state.dungeon?.enemies.filter((enemy) => enemy.alive && enemy.flowerPet) || [];
  }

  function flowerPetLimit() {
    return Math.min(FLOWER_TAMER_CONFIG.maxPetLimit, FLOWER_TAMER_CONFIG.basePetLimit
      + Math.floor(Number(state.adventurer.level || 1) / FLOWER_TAMER_CONFIG.petLimitEvery));
  }

  function tryFlowerCharm(enemy, mode) {
    if (state.adventurer.jobId !== "flower_tamer" || !state.dungeon || enemy.flowerPet) return false;
    if (enemy.floorGuardian || enemy.thrillRoomGuardian || enemy.id === "dungeon_lord_nox") {
      log(`${enemy.name}は花印を力ずくで焼き切った。守護者は使役できない。`);
      return false;
    }
    if (activeFlowerPets().length >= flowerPetLimit()) {
      log(`花ペットは上限${flowerPetLimit()}体。新しい花印は根付かなかった。`);
      return false;
    }
    const stats = getPlayerStats();
    const weakenedBonus = Math.max(0, 1 - enemy.hp / Math.max(1, enemy.maxHp)) * FLOWER_TAMER_CONFIG.weakenedBonus;
    const baseChance = FLOWER_TAMER_CONFIG.baseCharmChance + stats.flowerCharmChanceBonus + stats.luck * FLOWER_TAMER_CONFIG.luckFactor
      + stats.dexterity * FLOWER_TAMER_CONFIG.dexterityFactor + state.adventurer.level * FLOWER_TAMER_CONFIG.levelFactor + weakenedBonus;
    const skillBonus = mode === "skill" ? FLOWER_TAMER_CONFIG.skillBonus : 0;
    const colorPenalty = Number(enemy.colorTierIndex || 0) * FLOWER_TAMER_CONFIG.colorPenalty;
    const uniqueMultiplier = enemy.unique ? FLOWER_TAMER_CONFIG.uniqueMultiplier : 1;
    const chanceRange = enemy.unique ? FLOWER_TAMER_CONFIG.uniqueChanceRange : FLOWER_TAMER_CONFIG.normalChanceRange;
    const chance = clamp((baseChance + skillBonus - colorPenalty) * uniqueMultiplier, chanceRange[0], chanceRange[1]);
    if (Math.random() >= chance) {
      log(`${enemy.name}へ花印を植えたが、洗脳に抵抗された（成功率${Math.round(chance * 100)}%）。`);
      return false;
    }
    enemy.flowerPet = true;
    enemy.flowerMaster = state.adventurer.name;
    enemy.flowerPetTurns = Math.min(FLOWER_TAMER_CONFIG.maxDuration, FLOWER_TAMER_CONFIG.baseDuration
      + Math.floor(stats.luck / FLOWER_TAMER_CONFIG.luckDurationEvery)
      + Math.floor(state.adventurer.level / FLOWER_TAMER_CONFIG.levelDurationEvery)
      + stats.flowerPetDurationBonus);
    enemy.asleep = false;
    enemy.telegraphed = false;
    enemy.telegraphedAttribute = null;
    enemy.alertedTurns = 0;
    enemy.fleeingTurns = 0;
    log(`${enemy.name}の意識へ花が咲いた！ 使い捨て花ペットとして${enemy.flowerPetTurns}ターン使役する（${activeFlowerPets().length}/${flowerPetLimit()}体）。`);
    playSfx("levelUp");
    return true;
  }

  function witherFlowerPet(pet, reason = "花の寿命が尽きた") {
    pet.alive = false;
    pet.hp = 0;
    pet.flowerPet = false;
    pet.destroyed = true;
    pet.harvested = true;
    pet.harvestsRemaining = 0;
    log(`${pet.name}は${reason}。花弁となって散り、遺体は残らなかった。`);
    playSfx("wind");
  }

  function flowerPetAct(pet) {
    if (!pet.alive || !pet.flowerPet || !state.dungeon) return;
    pet.flowerPetTurns = Math.max(0, Number(pet.flowerPetTurns || 0) - 1);
    pet.hp -= Math.max(1, Math.ceil(pet.maxHp * FLOWER_TAMER_CONFIG.hpDecayRate));
    if (pet.flowerPetTurns <= 0 || pet.hp <= 0) {
      witherFlowerPet(pet);
      return;
    }
    const hostiles = state.dungeon.enemies.filter((enemy) => enemy.alive && !enemy.flowerPet && enemy !== pet);
    if (!hostiles.length) return;
    hostiles.sort((left, right) => chebyshevDistance(pet, left) - chebyshevDistance(pet, right));
    const target = hostiles[0];
    if (chebyshevDistance(pet, target) <= 1) {
      const attribute = pet.attackAttribute;
      const weak = target.weaknesses.includes(attribute) ? 1.35 : 1;
      const resistance = DATA.resistanceMultipliers[target.resistances[attribute] || 0] ?? 1;
      const damage = resistance === 0 ? 0 : Math.max(1, Math.round(Math.max(1, pet.attack * weak - target.defense) * resistance));
      target.hp -= damage;
      log(`花ペット${pet.name}が${target.name}へ${attr(attribute)}属性で${damage}ダメージ。`);
      playCombatSfx(attribute, false);
      if (target.hp <= 0 && target.alive) defeatEnemy(target);
      return;
    }
    const options = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const x = pet.x + dx;
        const y = pet.y + dy;
        if (canEnemyMove(pet, x, y)) options.push({ x, y });
      }
    }
    options.sort((a, b) => chebyshevDistance(a, target) - chebyshevDistance(b, target));
    if (options.length) Object.assign(pet, options[0]);
  }

  function getDialogueState(enemy) {
    if (!enemy || !enemy.unique) return null;
    const dialogue = enemy.dialogueState && typeof enemy.dialogueState === "object" ? enemy.dialogueState : {};
    dialogue.recent = Array.isArray(dialogue.recent) ? dialogue.recent.slice(-3) : [];
    dialogue.cooldown = Math.max(0, Number(dialogue.cooldown || 0));
    dialogue.counters = dialogue.counters && typeof dialogue.counters === "object" ? dialogue.counters : {};
    dialogue.stages = dialogue.stages && typeof dialogue.stages === "object" ? dialogue.stages : {};
    enemy.dialogueState = dialogue;
    delete enemy.speech;
    return dialogue;
  }

  function speechLine(enemy, type) {
    const dialogue = getDialogueState(enemy);
    const variants = UNIQUE_DIALOGUE?.variants(enemy?.id, type) || [];
    if (!dialogue || !variants.length) return "";
    const unused = variants.filter((line) => !dialogue.recent.includes(line));
    const line = pick(unused.length ? unused : variants);
    dialogue.recent = [...dialogue.recent, line].slice(-3);
    dialogue.counters[type] = Number(dialogue.counters[type] || 0) + 1;
    return line;
  }

  function uniqueSpeak(enemy, type, options = {}) {
    const dialogue = getDialogueState(enemy);
    if (!dialogue) return false;
    const force = Boolean(options.force);
    if (!force && dialogue.cooldown > 0) return false;
    if (!force && Math.random() > Number(options.chance ?? 1)) return false;
    const line = speechLine(enemy, type);
    if (!line) return false;
    const cadence = Math.max(2, Number(enemy.speechCadence || UNIQUE_DIALOGUE?.get(enemy.id)?.cadence || 3));
    dialogue.cooldown = force ? Math.max(dialogue.cooldown, 1) : cadence;
    log(`${enemy.name} ${line}`);
    return true;
  }

  function ensureUniqueEncounterSpeech(enemy) {
    if (enemy?.asleep) return false;
    const dialogue = getDialogueState(enemy);
    if (!dialogue || dialogue.stages.encounter) return false;
    dialogue.stages.encounter = true;
    return uniqueSpeak(enemy, "encounter", { force: true });
  }

  function tickUniqueSpeech(enemy) {
    if (!enemy?.dialogueState || !enemy.unique) return;
    enemy.dialogueState.cooldown = Math.max(0, Number(enemy.dialogueState.cooldown || 0) - 1);
  }

  function speakByHp(enemy) {
    if (!enemy.unique || enemy.hp <= 0) return false;
    const rate = enemy.hp / enemy.maxHp;
    const stage = rate <= 0.25 ? "critical" : rate <= 0.6 ? "hurt" : null;
    const dialogue = getDialogueState(enemy);
    if (!stage || dialogue.stages[stage]) return false;
    dialogue.stages[stage] = true;
    return uniqueSpeak(enemy, stage, { force: true });
  }

  function observeEnemy(enemy, amount) {
    ensureUniqueEncounterSpeech(enemy);
    const before = getResearch(enemy.id).level;
    markResearch(enemy.id, 1, { evidence: Math.max(5, Number(amount || 1) * 5) });
    const after = getResearch(enemy.id).level;
    const rec = getResearch(enemy.id);
    log(after > before
      ? `${enemy.name}の調査度が${after}/${MAX_RESEARCH_LEVEL}になった。`
      : rec.level >= MAX_RESEARCH_LEVEL
        ? `${enemy.name}の情報は完全に判明している。`
        : `${enemy.name}の証拠を蓄積した（${rec.evidence}/${RESEARCH_EVIDENCE_THRESHOLDS[rec.level + 1]}）。`);
    const dialogue = getDialogueState(enemy);
    if (dialogue) {
      const firstObservation = !dialogue.stages.observe;
      dialogue.stages.observe = true;
      uniqueSpeak(enemy, "observe", { force: firstObservation, chance: 0.7 });
    }
    playSfx("observe");
  }

  function trySummonMinions(enemy) {
    const summon = enemy?.summon;
    if (!summon || !state.dungeon || state.arena) return false;
    const every = Math.max(2, Math.floor(Number(summon.every || 6)));
    if (enemy.turns % every !== 0) return false;
    enemy.summonToken = enemy.summonToken || `${enemy.id}@${enemy.x},${enemy.y}`;
    const aliveSummons = state.dungeon.enemies.filter((candidate) => candidate.alive && candidate.summonedBy === enemy.summonToken).length;
    const aliveCount = state.dungeon.enemies.filter((candidate) => candidate.alive).length;
    const maxAlive = Math.max(1, Math.floor(Number(summon.maxAlive || 2)));
    const maxTotal = Math.max(maxAlive, Math.floor(Number(summon.maxTotal || 4)));
    const floor = floorByNumber[state.adventurer.floor];
    const spawnLimit = Math.max(0, dungeonEnemySpawnLimit(floor) - aliveCount);
    const remaining = Math.min(maxAlive - aliveSummons, maxTotal - Number(enemy.summonsUsed || 0), spawnLimit);
    if (remaining <= 0) return false;

    const positions = [];
    for (let radius = 1; radius <= 2; radius += 1) {
      for (let y = enemy.y - radius; y <= enemy.y + radius; y += 1) {
        for (let x = enemy.x - radius; x <= enemy.x + radius; x += 1) {
          if (chebyshevDistance({ x, y }, enemy) !== radius) continue;
          if (state.dungeon.map[y]?.[x] !== "floor") continue;
          if (state.dungeon.player.x === x && state.dungeon.player.y === y) continue;
          if (state.dungeon.enemies.some((candidate) => candidate.alive && candidate.x === x && candidate.y === y)) continue;
          if (state.dungeon.stairs.some((stairs) => stairs.x === x && stairs.y === y)) continue;
          if (state.dungeon.chests.some((chest) => !chest.opened && chest.x === x && chest.y === y)) continue;
          if ((state.dungeon.traps || []).some((trap) => !trap.disarmed && trap.x === x && trap.y === y)) continue;
          positions.push({ x, y });
        }
      }
    }
    positions.sort(() => Math.random() - 0.5);
    const uniqueMemorySummon = summon.pool === "undefeated_deep_unique";
    const alreadySummonedIds = new Set(state.dungeon.enemies.filter((candidate) => candidate.alive && candidate.summonedBy === enemy.summonToken).map((candidate) => candidate.id));
    const floorCandidates = uniqueMemorySummon
      ? DATA.monsters.filter((monster) => monster.unique && !monster.arenaOnly && monster.id !== "dungeon_lord_nox"
        && monsterNativeFloor(monster) >= Number(summon.minFloor || 60)
        && monsterNativeFloor(monster) < MAX_FLOOR
        && !state.meta.uniqueKills[monster.id]
        && !alreadySummonedIds.has(monster.id))
        .sort((left, right) => window.HD_THREAT.score(right) - window.HD_THREAT.score(left))
        .slice(0, 12)
      : [...new Set(floor.monsterPool)].map((id) => monsters[id]).filter((monster) => monster && !monster.unique);
    const matchingCandidates = uniqueMemorySummon ? [] : floorCandidates.filter((monster) => monster.attackAttribute === enemy.attackAttribute);
    const candidates = matchingCandidates.length ? matchingCandidates : floorCandidates;
    const summonCount = Math.min(Math.max(1, Math.floor(Number(summon.count || 1))), remaining, positions.length);
    if (!candidates.length || summonCount <= 0) return false;

    const summonedNames = [];
    for (let index = 0; index < summonCount; index += 1) {
      const minion = createEnemy(pick(candidates).id, positions[index], uniqueMemorySummon);
      minion.asleep = false;
      minion.summoned = true;
      minion.summonedBy = enemy.summonToken;
      minion.rewardProfile = { harvestRolls: [1, 1], experienceMultiplier: uniqueMemorySummon ? 0.5 : 0.25 };
      state.dungeon.enemies.push(minion);
      summonedNames.push(minion.name);
    }
    enemy.summonsUsed = Number(enemy.summonsUsed || 0) + summonCount;
    log(uniqueMemorySummon
      ? `${enemy.name}が未決着の迷宮記憶を開き、未討伐ユニーク「${summonedNames.join("・")}」を召喚した！`
      : `${enemy.name}が眷属召喚を行い、${summonedNames.join("・")}を呼び出した！`);
    uniqueSpeak(enemy, "special", { chance: 0.9 });
    playSfx("summon");
    return true;
  }

  function enemyTurn(enemy) {
    if (enemy.hp <= 0) return;
    ensureUniqueEncounterSpeech(enemy);
    enemy.turns += 1;
    if (enemy.elixirAttrition && enemy.turns % enemy.elixirAttrition.every === 0) {
      const maxHp = getPlayerStats().maxHp;
      const damage = Math.max(1, Math.ceil(maxHp * enemy.elixirAttrition.ratio));
      state.adventurer.hp -= damage;
      log(`${enemy.name}の存在圧が生命を直接摩耗させ、最大HPの${Math.round(enemy.elixirAttrition.ratio * 100)}%にあたる${damage}ダメージ！ 防具は職務を放棄した。`);
      playSfx("curse");
      if (state.adventurer.hp <= 0) {
        die(`${enemy.name}の存在侵食`);
        return;
      }
    }
    if (Number(enemy.spellCursedTurns || 0) > 0) enemy.spellCursedTurns -= 1;
    if (Number(enemy.spellArmorBreakTurns || 0) > 0) {
      enemy.spellArmorBreakTurns -= 1;
      if (enemy.spellArmorBreakTurns <= 0) enemy.spellArmorBreak = 0;
    }
    if (Number(enemy.spellStunnedTurns || 0) > 0) {
      enemy.spellStunnedTurns -= 1;
      log(`${enemy.name}は雷術の痺れで行動できない。`);
      playSfx("debuff");
      return;
    }
    if (enemy.divineInvulnerability && enemy.turns % enemy.divineInvulnerability.every === 0
      && Number(enemy.divineInvulnerabilityCharges || 0) <= 0) {
      enemy.divineInvulnerabilityCharges = enemy.divineInvulnerability.charges;
      log(`${enemy.name}が「${enemy.divineInvulnerability.name}」を展開。次の${enemy.divineInvulnerabilityCharges}回、あらゆる攻撃を無効化する！`);
      playSfx("invulnerable");
      return;
    }
    const specialInterval = enemy.specialAttack === "gold_steal" ? 3 : 4;
    if (enemy.specialAttack && enemy.turns % specialInterval === 0 && useEnemySpecial(enemy)) return;
    if (enemy.telegraphed) {
      enemy.telegraphed = false;
      uniqueSpeak(enemy, "dangerousRelease", { chance: 0.82 });
      const dangerousAttribute = enemy.telegraphedAttribute || chooseEnemyAttackAttribute(enemy, enemy.dangerous.attribute);
      enemy.telegraphedAttribute = null;
      enemyAttack(enemy, enemy.dangerous.name, dangerousAttribute, enemy.dangerous.power, { trials: enemy.dragonBreath?.trials || 1, hitBonus: 0.08, critChance: 0.1 });
      return;
    }
    if (trySummonMinions(enemy)) return;
    if (enemy.dangerous && enemy.turns % enemy.dangerous.every === 0) {
      enemy.telegraphed = true;
      enemy.telegraphedAttribute = chooseEnemyAttackAttribute(enemy, enemy.dangerous.attribute);
      log(`${enemy.dangerous.telegraph} ${attr(enemy.telegraphedAttribute)}属性の気配が濃い。`);
      const dialogue = getDialogueState(enemy);
      const firstTechnique = dialogue && !dialogue.stages.dangerous;
      if (dialogue) dialogue.stages.dangerous = true;
      uniqueSpeak(enemy, "dangerous", { force: firstTechnique, chance: 0.58 });
      playSfx("warning");
      return "telegraphed";
    }
    if (enemy.turns % 3 === 1) uniqueSpeak(enemy, "battle", { chance: 0.62 });
    uniqueSpeak(enemy, "attack", { chance: 0.56 });
    enemyAttack(enemy, "攻撃", chooseEnemyAttackAttribute(enemy, enemy.attackAttribute), enemy.attack);
  }

  function enemyAttackAttributePool(enemy) {
    const nativeFloor = monsterNativeFloor(enemy);
    const strong = nativeFloor >= 25 || enemy.unique || Number(enemy.colorTierIndex || 0) >= 4;
    if (!strong) return [enemy.attackAttribute];
    const desiredSize = clamp(2 + Math.floor(nativeFloor / 25) + Math.floor(Number(enemy.colorTierIndex || 0) / 2), 2, 7);
    const seed = [...String(enemy.id || enemy.name)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const pool = [enemy.attackAttribute, enemy.dangerous?.attribute].filter(Boolean);
    for (let index = 0; pool.length < desiredSize && index < DATA.attributes.length * 2; index += 1) {
      const candidate = DATA.attributes[(seed + index * 5 + nativeFloor) % DATA.attributes.length];
      if (!pool.includes(candidate)) pool.push(candidate);
    }
    return pool;
  }

  function enemyTacticalIntelligence(enemy) {
    if (!enemy.unique || monsterNativeFloor(enemy) < 20) return 0;
    const smartStyleBonus = { scholar: 0.38, oracle: 0.38, regal: 0.22, trickster: 0.18, warrior: 0.08, silent: 0.1, zealot: 0.05, feral: 0 }[enemy.uniqueStyle] || 0;
    const smartSpeciesBonus = { elf: 0.22, demon: 0.2, angel: 0.24, construct: 0.12, aberration: 0.14, warrior: 0.08 }[enemy.speciesId] || 0;
    const depthBonus = Math.min(0.24, monsterNativeFloor(enemy) / 420);
    const colorBonus = Number(enemy.colorTierIndex || 0) * 0.035;
    return clamp(0.08 + smartStyleBonus + smartSpeciesBonus + depthBonus + colorBonus, 0, 0.9);
  }

  function chooseEnemyAttackAttribute(enemy, preferred) {
    const pool = enemyAttackAttributePool(enemy);
    if (preferred && !pool.includes(preferred)) pool.unshift(preferred);
    const intelligence = enemyTacticalIntelligence(enemy);
    let selected;
    if (intelligence > 0 && Math.random() < intelligence) {
      const resistances = getPlayerStats().resistances;
      const resistanceScore = (attribute) => resistances[attribute] === "immune" ? 99 : Number(resistances[attribute] || 0);
      const weakest = Math.min(...pool.map(resistanceScore));
      const weakCandidates = pool.filter((attribute) => resistanceScore(attribute) === weakest);
      selected = pick(weakCandidates);
      enemy.lastAttackReadWeakness = true;
    } else {
      const previousIndex = Math.max(-1, pool.indexOf(enemy.lastChosenAttackAttribute));
      selected = pool[(previousIndex + 1 + Math.max(0, Number(enemy.turns || 0) % Math.max(1, pool.length - 1))) % pool.length];
      enemy.lastAttackReadWeakness = false;
    }
    enemy.lastChosenAttackAttribute = selected;
    return selected || preferred || enemy.attackAttribute;
  }

  function useEnemySpecial(enemy) {
    if (enemy.specialAttack === "gold_steal") {
      if (!state.dungeon || state.arena) return false;
      if (enemy.hasStolenGold) return false;
      const theft = enemy.goldTheft || {};
      const preferredDistance = Math.max(12, Number(theft.escapeDistance || 12));
      const destination = window.HD_DUNGEON.spawnPosition(state.dungeon, preferredDistance)
        || window.HD_DUNGEON.spawnPosition(state.dungeon, 8);
      if (!destination) return false;
      const available = Math.max(0, Math.floor(Number(state.adventurer.gold || 0)));
      const maximumTheft = Math.floor(available * Math.min(0.8, Math.max(0, Number(theft.maxRate ?? 0.8))));
      const requested = Math.round(available * Math.min(0.8, Math.max(0, Number(theft.rate || 0.2))));
      const stolen = Math.min(available, maximumTheft, Math.max(available > 0 ? 1 : 0, requested));
      if (stolen > 0) {
        state.adventurer.gold -= stolen;
        enemy.hasStolenGold = true;
        log(`${enemy.name}が${stolen}Gを盗み取り、遠くの暗がりへ転移した！ 奪われた金は戻らない。`);
        playSfx("coinSell");
      } else {
        log(`${enemy.name}は財布を探ったが、盗める金がなく舌打ちして転移した。`);
      }
      enemy.x = destination.x;
      enemy.y = destination.y;
      enemy.alertedTurns = 0;
      enemy.fleeingTurns = 12;
      playSfx("teleportLong");
      return true;
    }
    if (enemy.specialAttack === "drain") {
      uniqueSpeak(enemy, "special", { chance: 0.88 });
      const outcome = enemyAttack(enemy, "経験吸収", chooseEnemyAttackAttribute(enemy, enemy.attackAttribute), enemy.attack);
      if (!state.dungeon && !state.arena) return true;
      if (outcome.hitCount > 0) {
        const drained = Math.min(state.adventurer.experience, 8 + state.adventurer.floor);
        state.adventurer.experience -= drained;
        saveActiveJobProgress();
        log(`${enemy.name}に経験値を${drained}奪われた。`);
        playSfx("trapDrain");
      }
    } else if (enemy.specialAttack === "knockback") {
      uniqueSpeak(enemy, "special", { chance: 0.88 });
      const outcome = enemyAttack(enemy, "吹き飛ばし", "blunt", enemy.attack);
      if (!state.dungeon && !state.arena) return true;
      if (outcome.hitCount > 0) {
        knockPlayerBack(enemy, 2);
        playSfx("knockback");
      }
    } else if (enemy.specialAttack === "self_destruct") {
      if (enemy.floorGuardian || enemy.thrillRoomGuardian) {
        sanitizeGuardianSpecialAttack(enemy);
        return false;
      }
      uniqueSpeak(enemy, "special", { force: true });
      playSfx("selfDestruct");
      enemyAttack(enemy, "自爆", "fire", enemy.attack * 2);
      if ((!state.dungeon && !state.arena) || state.adventurer.hp <= 0) return true;
      log(`${enemy.name}は爆散した。`);
      enemy.hp = 0;
      if (state.dungeon) defeatEnemy(enemy, { experienceMultiplier: 0.5, leaveCorpse: false });
      else {
        enemy.alive = false;
        enemy.selfDestructed = true;
      }
    } else if (enemy.specialAttack === "debuff") {
      uniqueSpeak(enemy, "special", { chance: 0.88 });
      const key = pick(STAT_KEYS);
      state.adventurer.temporaryDebuffs[key] = Number(state.adventurer.temporaryDebuffs[key] || 0) - 2;
      log(`${enemy.name}の弱体波で${{ strength: "力", speed: "素早さ", dexterity: "器用さ", durability: "耐久力", luck: "運" }[key]}が一時的に低下した。`);
      playSfx("debuff");
    } else if (enemy.specialAttack === "time_stop") {
      uniqueSpeak(enemy, "special", { force: true });
      log(`${enemy.name}が時間を停止した。止まった時の中で連続攻撃が迫る。`);
      playSfx("timeStop");
      enemyAttack(enemy, "時止め連撃", chooseEnemyAttackAttribute(enemy, enemy.attackAttribute), enemy.attack, { trials: 2 });
      if ((state.dungeon || state.arena) && state.adventurer.hp > 0) enemyAttack(enemy, "時止め追撃", chooseEnemyAttackAttribute(enemy, enemy.attackAttribute), enemy.attack, { trials: 2 });
    } else if (enemy.specialAttack === "devour") {
      const corpse = state.adventurer.bountyCorpses.shift();
      if (corpse) {
        uniqueSpeak(enemy, "special", { chance: 0.88 });
        log(`${enemy.name}が運搬中の賞金首「${corpse.name}」の遺体を食べた。`);
      }
      else {
        const materialId = Object.keys(state.adventurer.materials).find((id) => state.adventurer.materials[id] > 0);
        if (!materialId) return false;
        uniqueSpeak(enemy, "special", { chance: 0.88 });
        addMaterial(materialId, -1);
        log(`${enemy.name}が所持素材「${materials[materialId].name}」を食べた。`);
      }
      playSfx("devour");
    } else return false;
    return true;
  }

  function knockPlayerBack(enemy, distance) {
    if (!state.dungeon && state.arena) {
      const arena = state.arena;
      const dx = Math.sign(arena.player.x - enemy.x);
      const dy = Math.sign(arena.player.y - enemy.y);
      for (let step = 0; step < distance; step += 1) {
        const x = arena.player.x + dx;
        const y = arena.player.y + dy;
        if (arenaBlocked(arena, x, y) || (enemy.x === x && enemy.y === y)) break;
        arena.player = { x, y };
      }
      return;
    }
    if (!state.dungeon) return;
    const dx = Math.sign(state.dungeon.player.x - enemy.x);
    const dy = Math.sign(state.dungeon.player.y - enemy.y);
    for (let step = 0; step < distance; step += 1) {
      const x = state.dungeon.player.x + dx;
      const y = state.dungeon.player.y + dy;
      if (state.dungeon.map[y]?.[x] !== "floor" || state.dungeon.enemies.some((item) => item.alive && item.x === x && item.y === y)) break;
      state.dungeon.player = { x, y };
    }
    discoverSpecialRoomsAt(state.dungeon.player.x, state.dungeon.player.y);
  }

  function enemyAttack(enemy, name, attribute, power, options = {}) {
    const dampened = Number(enemy.spellDampenedTurns || 0) > 0;
    if (dampened) {
      power *= 0.78;
      enemy.spellDampenedTurns -= 1;
    }
    if (Number(enemy.spellConfusedTurns || 0) > 0) {
      options = { ...options, hitBonus: Number(options.hitBonus || 0) - 0.18 };
      enemy.spellConfusedTurns -= 1;
    }
    const profile = getEnemyBattleProfile(enemy, attribute, power, options);
    const stats = getPlayerStats();
    const guarding = state.adventurer.guard;
    const outcome = rollAttackSequence(profile, (raw) => {
      const multiplier = DATA.resistanceMultipliers[stats.resistances[attribute] || 0] ?? 1;
      let damage = multiplier === 0
        ? 0
        : Math.max(1, Math.round(Math.max(1, raw - stats.defense) * multiplier));
      if (guarding && damage > 0) damage = Math.max(1, Math.floor(damage / 2));
      state.adventurer.hp -= damage;
      return damage;
    }, () => state.adventurer.hp <= 0);
    if (guarding) state.adventurer.guard = false;
    log(`${enemy.name}の${name}（${attr(attribute)}）。${profile.attackTrials}回試行、${outcome.hitCount}ヒット、合計${outcome.total}ダメージ。${enemy.lastAttackReadWeakness ? " 耐性の隙を読まれた。" : ""}`);
    markResearch(enemy.id, 3);
    if (outcome.hitCount) playCombatSfx(attribute, true);
    else playSfx("warning");
    if (state.adventurer.hp <= 0) die(`${enemy.name}の${name}`);
    return outcome;
  }

  function handleFloorGuardianDefeat(enemy) {
    if (!enemy?.floorGuardian || !state.dungeon) return;
    state.dungeon.guardianDefeated = true;
    const guardianFloor = Math.floor(Number(state.adventurer.floor || 0));
    if (guardianFloor >= 10 && guardianFloor <= MAX_FLOOR && guardianFloor % 10 === 0 && !state.meta.clearedBossFloors.includes(guardianFloor)) {
      state.meta.clearedBossFloors.push(guardianFloor);
      state.meta.clearedBossFloors.sort((a, b) => a - b);
      log(`深度標B${guardianFloor}Fを解放した。以後、街からこの階層へ直接出発できる。`);
      if (guardianFloor === 10) {
        log("地下10階を踏破した功績が認められ、街の「修練連武闘技場」が解放された！");
        playSfx("victory");
      }
      if (guardianFloor === 20) {
        log("地下20階を踏破した噂を聞きつけ、ガラクタマニアの「珍品偏愛堂」が開店した！");
        playSfx("shopRefresh");
      }
    }
    if (state.adventurer.floor < MAX_FLOOR) state.dungeon.stairs = [{ x: enemy.x, y: enemy.y }];
    log(state.adventurer.floor < MAX_FLOOR ? `${enemy.name}が守っていた場所に下り階段が現れた。` : "最深層の守護者を打ち破った。");
  }

  function annihilateDungeonFloor() {
    if (!state.dungeon) return false;
    const targets = state.dungeon.enemies.filter((enemy) => enemy.alive);
    if (!targets.length) return false;
    log("裏技発動。リムルの『虚崩朧千変万華』がフロア全体を呑み込んだ！");
    let totalExperience = 0;
    targets.forEach((enemy) => {
      totalExperience += experienceFromEnemy(enemy);
      enemy.hp = 0;
      enemy.alive = false;
      enemy.telegraphed = false;
      enemy.lootMaterialId = resolveLoot(enemy);
      initializeCorpseHarvests(enemy);
      markResearch(enemy.id, 4);
      if (enemy.unique) recordUniqueDefeat(enemy);
      handleFloorGuardianDefeat(enemy);
      if (enemy.thrillRoomGuardian) log("スリル部屋の守護者が倒れ、星の宝箱を縛る封印が消えた。");
    });
    gainExperience(totalExperience);
    log(`虚崩朧千変万華により、フロアの魔物${targets.length}体が一掃された。遺体は剥ぎ取り可能だ。`);
    playSfx("victory");
    saveGame();
    render();
    return true;
  }

  function defeatEnemy(enemy, options = {}) {
    if (!enemy?.alive) return;
    const leaveCorpse = options.leaveCorpse !== false;
    const experienceMultiplier = Math.max(0, Number(options.experienceMultiplier ?? 1));
    enemy.alive = false;
    if (leaveCorpse) {
      enemy.lootMaterialId = resolveLoot(enemy);
      initializeCorpseHarvests(enemy);
    } else {
      enemy.lootMaterialId = null;
      enemy.harvestsTotal = 0;
      enemy.harvestsRemaining = 0;
      enemy.harvested = true;
      enemy.destroyed = true;
    }
    markResearch(enemy.id, 4);
    gainExperience(Math.max(1, Math.round(experienceFromEnemy(enemy) * experienceMultiplier)));
    uniqueSpeak(enemy, "defeat", { force: true });
    if (enemy.unique) recordUniqueDefeat(enemy);
    handleFloorGuardianDefeat(enemy);
    if (enemy.thrillRoomGuardian) log("スリル部屋の守護者が倒れ、星の宝箱を縛る封印が消えた。");
    log(leaveCorpse
      ? `${enemy.name}を倒した。遺体から素材を剥ぎ取れそうだ。`
      : `${enemy.name}は跡形もなく消滅し、剥ぎ取れる遺体を残さなかった。`);
    playSfx(enemy.unique ? "victory" : leaveCorpse ? "corpse" : "fire");
    saveGame();
    render();
  }

  function recordUniqueDefeat(enemy) {
    state.meta.uniqueKills[enemy.id] = true;
    if (enemy.id === "dungeon_lord_nox") state.adventurer.gameCleared = true;
    if (enemy.id === "dungeon_lord_nox" && !state.meta.titles.includes("迷宮踏破者")) {
      state.meta.titles.push("迷宮踏破者");
      log("称号「迷宮踏破者」を獲得した。 ");
    }
    const allDefeated = DATA.monsters.filter((monster) => monster.unique).every((monster) => state.meta.uniqueKills[monster.id]);
    if (allDefeated && !state.meta.titles.includes("ゲームマスター")) {
      state.meta.titles.push("ゲームマスター");
      state.meta.masterEquipmentUnlocked = true;
      grantMasterEquipment();
      log("全ユニークモンスターを討伐。称号「ゲームマスター」と特別装備を獲得した。 ");
    }
  }

  function grantMasterEquipment() {
    if (!state.meta.masterEquipmentUnlocked || state.meta.donatedPermanentEquipmentIds.includes("game_master_emblem") || state.adventurer.ownedEquipment.includes("game_master_emblem")) return;
    state.adventurer.ownedEquipment.push("game_master_emblem");
  }

  function grantCompendiumEquipment() {
    if (!state.meta.compendiumEquipmentUnlocked || state.meta.donatedPermanentEquipmentIds.includes("omniscient_archive") || state.adventurer.ownedEquipment.includes("omniscient_archive")) return;
    state.adventurer.ownedEquipment.push("omniscient_archive");
  }

  function grantPersistentRewardEquipment() {
    grantMasterEquipment();
    grantCompendiumEquipment();
  }

  function reconcileResearchCompletion(announce = false) {
    reconcileMonsterHearts(false);
    if (state.meta.compendiumEquipmentUnlocked) {
      grantCompendiumEquipment();
      return true;
    }
    const complete = DATA.monsters.every((monster) => Number(state.meta.research[monster.id]?.level || 0) >= MAX_RESEARCH_LEVEL);
    if (!complete) return false;
    state.meta.compendiumEquipmentUnlocked = true;
    if (!state.meta.titles.includes("万象の記録者")) state.meta.titles.push("万象の記録者");
    grantCompendiumEquipment();
    if (announce) {
      log(`全${DATA.monsters.length}体のモンスター情報を完全解析。称号「万象の記録者」と特別装備「万象録の観測環」を獲得した！`);
      playSfx("victory");
    }
    return true;
  }

  function monsterHeartPower(monster) {
    if (!monster) return 1;
    return clamp(1 + Math.floor(Number(monster.threatScore || monster.threatRank || 0) / 250) + (monster.unique ? 2 : 0), 1, 12);
  }

  function monsterHeartAttributePower(monster) {
    return clamp(Math.ceil(monsterHeartPower(monster) / 3), 1, 4);
  }

  function grantMonsterHeart(monsterId, announce = false) {
    const monster = monsters[monsterId];
    if (!monster || state.meta.monsterHeartClaims[monsterId]) return false;
    state.meta.monsterHeartClaims[monsterId] = true;
    state.meta.monsterHearts[monsterId] = Number(state.meta.monsterHearts[monsterId] || 0) + 1;
    if (announce) {
      log(`完全解析の果てに「${monster.name}の心」を得た。強化+${monsterHeartPower(monster)}、${attr(monster.attackAttribute)}属性値+${monsterHeartAttributePower(monster)}。自宅で装備へ宿せる。`);
      playSfx("researchUp");
    }
    return true;
  }

  function reconcileMonsterHearts(announce = false) {
    DATA.monsters.forEach((monster) => {
      if (Number(state.meta.research[monster.id]?.level || 0) >= MAX_RESEARCH_LEVEL) grantMonsterHeart(monster.id, announce);
    });
  }

  function equipmentEnhancement(itemId) {
    const record = state.adventurer.equipmentEnhancements?.[itemId] || {};
    return {
      level: Math.max(0, Math.floor(Number(record.level || 0))),
      total: Math.max(0, Math.floor(Number(record.total || 0))),
      attributes: record.attributes && typeof record.attributes === "object" ? record.attributes : {},
    };
  }

  function enhanceEquipmentWithHeart(itemId, monsterId) {
    if (state.adventurer.inDungeon) return;
    const item = equipment[itemId];
    const monster = monsters[monsterId];
    const count = Number(state.meta.monsterHearts?.[monsterId] || 0);
    if (!item || !state.adventurer.ownedEquipment.includes(itemId) || !monster || count <= 0 || equipmentEnhancement(itemId).level > 0) return;
    const power = monsterHeartPower(monster);
    const attributePower = monsterHeartAttributePower(monster);
    const attribute = monster.attackAttribute || "physical";
    const record = state.adventurer.equipmentEnhancements[itemId] || { level: 0, total: 0, attributes: {} };
    record.level = 1;
    record.total = Number(record.total || 0) + power;
    record.attributes = record.attributes && typeof record.attributes === "object" ? record.attributes : {};
    record.attributes[attribute] = Number(record.attributes[attribute] || 0) + attributePower;
    state.adventurer.equipmentEnhancements[itemId] = record;
    state.meta.monsterHearts[monsterId] = count - 1;
    if (state.meta.monsterHearts[monsterId] <= 0) delete state.meta.monsterHearts[monsterId];
    log(`${monster.name}の心を${equipmentDisplayName(item)}へ宿した。${item.slot === "weapon" ? "攻撃力" : "防御力"}+${power}、${attr(attribute)}属性値+${attributePower}。心は静かに砕けた。`);
    playSfx("heartEquip");
    saveGame();
    render();
  }

  function raceExperienceMultiplier(raceId = state.adventurer.raceId) {
    return Math.max(0.5, Number(races[raceId]?.experienceMultiplier || 1));
  }

  function experienceToNext(level, raceId = state.adventurer.raceId) {
    if (level >= MAX_LEVEL) return 0;
    const base = 18 + level * 11 + Math.pow(level, 1.42) * 3.5;
    return Math.ceil(base * raceExperienceMultiplier(raceId));
  }

  function ensureJobProgress(jobId = state.adventurer.jobId) {
    const adv = state.adventurer;
    adv.jobProgress = adv.jobProgress && typeof adv.jobProgress === "object" ? adv.jobProgress : {};
    if (!adv.jobProgress[jobId]) adv.jobProgress[jobId] = { level: 1, experience: 0 };
    return adv.jobProgress[jobId];
  }

  function saveActiveJobProgress() {
    const adv = state.adventurer;
    const progress = ensureJobProgress();
    progress.level = clamp(Number(adv.level || 1), 1, MAX_LEVEL);
    progress.experience = progress.level >= MAX_LEVEL ? 0 : Math.max(0, Number(adv.experience || 0));
  }

  function loadActiveJobProgress() {
    const adv = state.adventurer;
    const progress = ensureJobProgress();
    adv.level = clamp(Number(progress.level || 1), 1, MAX_LEVEL);
    adv.experience = adv.level >= MAX_LEVEL ? 0 : Math.max(0, Number(progress.experience || 0));
  }

  function experienceFromEnemy(enemy) {
    const base = Math.max(3, Math.round((enemy.maxHp + enemy.attack * 4 + enemy.defense * 5) / 10));
    const anomalyBonus = { brittle: 1.2, tailwind: 1.15, rich_vein: 1.1, overdrive: 1.5, titan: 2, rainbow: 1.45, swarm: 1.3, gold: 1, pandemonium: 2.75 }[state.dungeon?.anomaly?.id] || 1;
    const depthCatchUp = state.dungeon ? 1 + Math.max(0, state.adventurer.floor - state.adventurer.level) * 0.018 : 1;
    const rankBonus = enemy.floorGuardian ? 4.5 : enemy.unique ? 3 : 1.12;
    const rewardMultiplier = Math.max(0.1, Number(enemy.rewardProfile?.experienceMultiplier || 1));
    return Math.round(base * rankBonus * anomalyBonus * Math.min(1.8, depthCatchUp) * rewardMultiplier);
  }

  function gainExperience(amount) {
    const adv = state.adventurer;
    if (adv.level >= MAX_LEVEL) return;
    adv.experience += amount;
    log(`${amount}経験値を得た。`);
    let levelsGained = 0;
    const oldStats = { ...getPlayerStats() };
    while (adv.level < MAX_LEVEL) {
      const required = experienceToNext(adv.level);
      if (adv.experience < required) break;
      adv.experience -= required;
      adv.level += 1;
      levelsGained += 1;
    }
    if (adv.level >= MAX_LEVEL) adv.experience = 0;
    saveActiveJobProgress();
    if (!levelsGained) return;
    const newStats = { ...getPlayerStats() };
    adv.hp = Math.min(newStats.maxHp, adv.hp + (newStats.maxHp - oldStats.maxHp) + Math.max(2, Math.floor(newStats.maxHp * 0.15)));
    log(levelsGained > 1 ? `${levelsGained}レベル上昇し、Lv${adv.level}になった！` : `レベルアップ！ Lv${adv.level}になった！`);
    const growthEntries = levelGrowthEntries(oldStats, newStats);
    const growth = formatLevelGrowth(oldStats, newStats);
    if (growth) log(`成長: ${growth}`);
    showLevelUpEffect(adv.level, growthEntries);
    playSfx("levelUp");
  }

  function showLevelUpEffect(level, growthEntries) {
    window.clearTimeout(levelUpEffectTimer);
    levelUpStatTimers.forEach((timer) => window.clearTimeout(timer));
    levelUpStatTimers = [];
    els.levelUpTitle.textContent = `Lv${level}`;
    const entries = growthEntries;
    els.levelUpGrowth.innerHTML = entries.map((entry) => `
      <div class="level-up-stat ${entry.difference > 0 ? "will-rise" : "unchanged"}" data-level-stat="${entry.key}">
        <span>${entry.label}</span><span class="stat-before">${entry.before}</span><span class="stat-arrow">→</span><span class="stat-after">${entry.before}</span><strong class="stat-gain">+${entry.difference}</strong>
      </div>`).join("");
    const growthStepDelay = 750;
    const unchangedStepDelay = 480;
    const openingDelay = 800;
    let elapsed = openingDelay;
    const revealDelays = entries.map((entry) => {
      const delay = elapsed;
      elapsed += entry.difference > 0 ? growthStepDelay : unchangedStepDelay;
      return delay;
    });
    const duration = elapsed + 1500;
    els.levelUpEffect.style.setProperty("--level-up-duration", `${duration}ms`);
    els.levelUpEffect.classList.remove("active");
    void els.levelUpEffect.offsetWidth;
    els.levelUpEffect.setAttribute("aria-hidden", "false");
    els.levelUpEffect.classList.add("active");
    const rows = els.levelUpGrowth.querySelectorAll(".level-up-stat");
    entries.forEach((entry, index) => {
      levelUpStatTimers.push(window.setTimeout(() => {
        const row = rows[index];
        if (!row) return;
        row.querySelector(".stat-after").textContent = entry.after;
        row.classList.add("revealed");
        if (entry.difference > 0) playSfx("levelStatUp");
      }, revealDelays[index]));
    });
    levelUpEffectTimer = window.setTimeout(hideLevelUpEffect, duration);
  }

  function hideLevelUpEffect() {
    window.clearTimeout(levelUpEffectTimer);
    levelUpStatTimers.forEach((timer) => window.clearTimeout(timer));
    levelUpStatTimers = [];
    levelUpEffectTimer = null;
    els.levelUpEffect.classList.remove("active");
    els.levelUpEffect.setAttribute("aria-hidden", "true");
  }

  function formatLevelGrowth(before, after) {
    return levelGrowthEntries(before, after)
      .filter((entry) => entry.difference > 0)
      .map((entry) => `${entry.label}${entry.difference}上昇`).join("、");
  }

  function levelGrowthEntries(before, after) {
    const labels = { maxHp: "最大HP", strength: "力", speed: "素早さ", dexterity: "器用さ", durability: "耐久力", luck: "運", acceleration: "加速度" };
    return Object.keys(labels).map((key) => {
      const difference = Math.round((after[key] || 0) - (before[key] || 0));
      return { key, label: labels[key], before: Math.round(before[key] || 0), after: Math.round(after[key] || 0), difference };
    });
  }

  function initializeCorpseHarvests(enemy) {
    if (!enemy) return 0;
    const profileRange = enemy.rewardProfile?.harvestRolls;
    const range = enemy.unique ? [3, 5] : Array.isArray(profileRange) ? profileRange : [1, 2];
    const minimum = Math.max(1, Math.floor(Number(range[0] || 1)));
    const maximum = Math.max(minimum, Math.floor(Number(range[1] || minimum)));
    const jobBonus = state.adventurer.jobId === "handyman" ? 1 : 0;
    enemy.harvestsTotal = rand(minimum, maximum) + jobBonus;
    enemy.harvestsRemaining = enemy.harvestsTotal;
    enemy.harvested = false;
    return enemy.harvestsTotal;
  }

  function corpseHarvestsRemaining(enemy) {
    if (!enemy || enemy.alive) return 0;
    if (Number.isFinite(Number(enemy.harvestsRemaining))) return Math.max(0, Math.floor(Number(enemy.harvestsRemaining)));
    return enemy.harvested === false ? 1 : 0;
  }

  function findHarvestableCorpse() {
    if (!state.dungeon) return null;
    const player = state.dungeon.player;
    return state.dungeon.enemies.find((enemy) => (
      !enemy.alive
      && corpseHarvestsRemaining(enemy) > 0
      && chebyshevDistance(enemy, player) <= 1
    )) || null;
  }

  function harvestCorpse() {
    const corpse = findHarvestableCorpse();
    if (!corpse) return false;
    const materialId = corpse.lootMaterialId || resolveLoot(corpse);
    const quantityPerHarvest = Math.max(1, Math.floor(Number(corpse.rewardProfile?.harvestQuantity || 1)));
    const harvestsSpent = state.adventurer.jobId === "hunter" ? corpseHarvestsRemaining(corpse) : 1;
    const anomalyMultiplier = ["gold", "pandemonium"].includes(state.dungeon?.anomaly?.id) ? 2 : 1;
    const rarity = materials[materialId]?.rarity;
    const quantity = rarity ? 1 : quantityPerHarvest * harvestsSpent * anomalyMultiplier;
    corpse.harvestsRemaining = Math.max(0, corpseHarvestsRemaining(corpse) - harvestsSpent);
    corpse.harvested = corpse.harvestsRemaining <= 0;
    markResearch(corpse.id, corpse.harvested ? MAX_RESEARCH_LEVEL : 4);
    const bounty = state.meta.bounties[corpse.id];
    const bountyAvailable = corpse.harvested && corpse.unique && bounty?.intel && !state.adventurer.bountyCorpses.some((entry) => entry.id === corpse.id);
    if (state.adventurer.jobId === "scavenger") {
      feedScavenger(quantity, `${materials[materialId].name}を${quantity}個その場で食べた`);
      log(`${corpse.name}を剥ぎ取り、${materials[materialId].name}を${quantity}個その場で喰らった。${corpse.harvested ? "遺体から取れるものは尽きた。" : "まだ剥ぎ取れそうだ。"}`);
    } else {
      addMaterial(materialId, quantity);
      log(state.adventurer.jobId === "hunter"
        ? `盗賊が${corpse.name}の遺体を一気に剥ぎ尽くし、${materials[materialId].name}を合計${quantity}個得た。遺体から取れるものは尽きた。`
        : `${corpse.name}の遺体を剥ぎ取り、${materials[materialId].name}を${quantity}個得た。${corpse.harvested ? "遺体から取れるものは尽きた。" : "まだ剥ぎ取れそうだ。"}`);
    }
    if (rarity === "ultra") log(`奇跡のウルトラレア素材「${materials[materialId].name}」を発見した！`);
    else if (rarity === "super") log(`超レア素材「${materials[materialId].name}」を発見した！`);
    playSfx(rarity === "ultra" ? "victory" : rarity === "super" ? "researchUp" : "harvest");
    advanceWorldIfDue();
    if (!state.dungeon || !state.adventurer.inDungeon) return true;
    if (bountyAvailable) {
      const reward = nextBountyReward(monsters[corpse.id]);
      if (state.adventurer.jobId === "scavenger") {
        const feastValue = Math.max(3, 3 + Math.floor(monsterNativeFloor(corpse) / 10));
        askConfirm(
          "賞金首の遺体",
          `${corpse.name}の遺体を食べますか？ 食べると摂食値+${feastValue}、持ち帰ると生還時に${reward}Gです。`,
          () => {
            feedScavenger(feastValue, `${corpse.baseName || corpse.name}の遺体を食べ尽くした`);
            log(`${corpse.name}の遺体を食べ尽くした。賞金は受け取れない。`);
            saveGame();
            render();
          },
          () => {
            carryBountyCorpse(corpse, reward);
            saveGame();
            render();
          },
          { ok: "食べる", cancel: "持ち帰る" },
        );
      } else {
        carryBountyCorpse(corpse, reward);
      }
    }
    saveGame();
    render();
    return true;
  }

  function carryBountyCorpse(corpse, reward) {
    state.adventurer.bountyCorpses.push({ id: corpse.id, name: corpse.name, reward });
    log(`${corpse.name}の遺体を賞金証明として回収した。生還すれば${reward}Gを受け取れる。`);
    playSfx("bountyCarry");
  }

  function scavengerGrowth(nutrition) {
    const effectiveNutrition = Math.min(
      SCAVENGER_EFFECTIVE_NUTRITION_CAP,
      Math.max(0, Number(nutrition || 0)),
    );
    const root = Math.sqrt(effectiveNutrition);
    return {
      strength: Math.floor(root * 1.25),
      durability: Math.floor(root * 0.95),
      luck: Math.floor(root * 0.55),
      acceleration: Math.min(30, Math.floor(root / 2)),
      maxHp: Math.floor(root * 6),
    };
  }

  function feedScavenger(amount, reason) {
    const beforeMaxHp = getPlayerStats().maxHp;
    state.adventurer.scavengerNutrition = Number(state.adventurer.scavengerNutrition || 0) + Math.max(1, Number(amount || 1));
    const growth = scavengerGrowth(state.adventurer.scavengerNutrition);
    const afterMaxHp = getPlayerStats().maxHp;
    state.adventurer.hp = Math.min(afterMaxHp, state.adventurer.hp + Math.max(1, afterMaxHp - beforeMaxHp));
    log(`${reason}。摂食値${state.adventurer.scavengerNutrition}（力+${growth.strength}・耐久+${growth.durability}・運+${growth.luck}・最大HP+${growth.maxHp}・加速+${growth.acceleration}）。`);
    playSfx(amount >= 3 ? "feast" : "eat");
  }

  function resolveLoot(enemy) {
    const last = state.adventurer.lastAttack || {};
    const lastAttributes = Array.isArray(last.attributes) && last.attributes.length ? last.attributes : last.attribute ? [last.attribute] : [];
    const matches = (rule) => {
      if (rule.condition === "default") return false;
      const cond = rule.condition;
      if (cond.lastAttribute && !lastAttributes.includes(cond.lastAttribute)) return false;
      if (cond.notLastAttribute && lastAttributes.includes(cond.notLastAttribute)) return false;
      if (cond.lastSkill && cond.lastSkill !== last.skill) return false;
      return true;
    };
    const conditionalRules = enemy.loot.filter(matches);
    const matched = conditionalRules.find((rule) => rule.condition?.lastSkill)
      || conditionalRules.find((rule) => rule.condition?.lastAttribute)
      || conditionalRules[0];
    const normalMaterial = (matched || enemy.loot.find((rule) => rule.condition === "default")).material;
    if (!enemy.exceptionalLoot) return normalMaterial;
    const skillfulKill = ["precise", "piercing_arrow"].includes(last.skill) || enemy.weaknesses?.some((id) => lastAttributes.includes(id));
    const colorMultiplier = 1 + Number(enemy.colorTierIndex || 0) * EXCEPTIONAL_LOOT_CONFIG.colorStep;
    const uniqueMultiplier = enemy.unique ? EXCEPTIONAL_LOOT_CONFIG.uniqueMultiplier : 1;
    const techniqueMultiplier = skillfulKill ? EXCEPTIONAL_LOOT_CONFIG.skillfulMultiplier : 1;
    const luckMultiplier = 1 + Math.min(EXCEPTIONAL_LOOT_CONFIG.maxLuckBonus,
      Math.max(0, Number(getPlayerStats().luck || 0)) / EXCEPTIONAL_LOOT_CONFIG.luckDivisor);
    const equipmentMultiplier = getPlayerStats().exceptionalLootMultiplier;
    const ultraChance = EXCEPTIONAL_LOOT_CONFIG.ultraChance * colorMultiplier * uniqueMultiplier * techniqueMultiplier * luckMultiplier * equipmentMultiplier;
    const superChance = EXCEPTIONAL_LOOT_CONFIG.superChance * colorMultiplier * uniqueMultiplier * techniqueMultiplier * luckMultiplier * equipmentMultiplier;
    const roll = Math.random();
    if (roll < ultraChance) return enemy.exceptionalLoot.ultra;
    if (roll < ultraChance + superChance) return enemy.exceptionalLoot.super;
    return normalMaterial;
  }

  function resetAdventurerProgressionMeta() {
    state.meta.guildClaims = [];
    state.meta.clearedBossFloors = [];
    state.meta.uniqueKills = {};
    Object.values(state.meta.bounties || {}).forEach((record) => {
      if (record && typeof record === "object") record.claimed = 0;
    });
  }

  function resetAfterDeath(pendingDeathReview) {
    const deaths = Number(state.meta.deaths || 0);
    const deathLog = Array.isArray(state.meta.deathLog) ? state.meta.deathLog.slice(0, 12) : [];
    const research = JSON.parse(JSON.stringify(state.meta.research || {}));
    const retirementLog = JSON.parse(JSON.stringify(state.meta.retirementLog || []));
    const permanentClearTitles = (state.meta.titles || []).filter((title) => title === "迷宮踏破者");
    const fresh = defaultSave();
    state.adventurer = fresh.adventurer;
    state.meta = fresh.meta;
    state.meta.deaths = deaths;
    state.meta.deathLog = deathLog;
    state.meta.research = research;
    state.meta.retirementLog = retirementLog;
    state.meta.titles = permanentClearTitles;
    DATA.monsters.forEach((monster) => {
      if (Number(research[monster.id]?.level || 0) < MAX_RESEARCH_LEVEL) return;
      state.meta.monsterHeartClaims[monster.id] = true;
      state.meta.monsterHearts[monster.id] = 1;
    });
    state.meta.pendingDeathReview = pendingDeathReview;
    state.dungeon = null;
    state.arena = null;
    state.log = fresh.log;
  }

  function die(reason) {
    const floor = state.adventurer.floor;
    state.meta.deaths += 1;
    state.meta.deathLog.unshift(`B${floor}F: ${reason}で死亡`);
    state.meta.deathLog = state.meta.deathLog.slice(0, 12);
    const adventurerName = state.adventurer.name || "たかし";
    const deathCry = chooseDeathCry(state.adventurer, reason);
    const deathVoice = DEATH_CRY_VOICE_TYPES[Math.floor(Math.random() * DEATH_CRY_VOICE_TYPES.length)];
    log(`${adventurerName}の断末魔：「${deathCry}」`);
    const pendingDeathReview = {
      reason: String(reason || "不明").slice(0, 160),
      cry: deathCry,
      log: ["冒険者は失われた。調査記録は残り、完全調査済みの心は各1個へ復活した。それ以外の進行は初期化された。", ...state.log].slice(0, 20),
    };
    resetAfterDeath(pendingDeathReview);
    audio.musicBlocked = true;
    stopMusic();
    playSfx(deathVoice);
    currentView = "town";
    initialSetupPending = true;
    pendingSetup = { raceId: "human", jobId: "swordsman", personalityId: "gentle", name: "たかし", preserveMeta: true };
    saveGame();
    showDeathEffect(reason, deathCry);
  }

  const DEATH_CRY_COMMON = Object.freeze([
    "まだだ……まだ、百階の闇を見ていない……！",
    "こんなところで、剥ぎ取られる側になるなんてな……",
    "地上の空気を……もう一度だけ……！",
    "待て、今のは練習だ……本番は、次の命で……",
    "迷宮よ……俺の名前まで喰うんじゃないぞ……",
    "誰か、この記録だけは……持ち帰ってくれ……",
    "くそっ……あと一歩が、こんなに遠いのか……！",
    "聞こえるか……次の冒険者。ここから先は、頼んだ……",
  ]);

  const DEATH_CRY_VOICE_TYPES = Object.freeze(["deathCrySharp", "deathCryFading", "deathCryLow"]);

  const DEATH_CRY_PERSONALITY = Object.freeze({
    brave: ["退くものか……最期くらい、前を向いてやる！", "勝負はまだ……俺が倒れただけだ……！"],
    careful: ["計算は合っていた……死だけが、勘定の外だった……", "確認が……あと一つ、足りなかったか……"],
    lazy: ["ああ……もう、ここで寝ても……いいよな……", "次は……もっと楽な迷宮にしてくれ……"],
    lewd: ["未練なら……山ほどあるに決まってるだろ……！", "せめて最期に……夢くらい、見せろよ……"],
    gentle: ["泣くな……次の誰かが、生きて帰ればいい……", "魔物も……こんな気持ちで倒れていたのかな……"],
    lucky: ["運が尽きた？　違う……次の命へ前借りしただけだ……", "最後の幸運は……次の誰かに譲るよ……"],
  });

  function chooseDeathCry(adventurer, reason) {
    const personal = DEATH_CRY_PERSONALITY[adventurer.personalityId] || [];
    const situational = String(reason || "").includes("罠")
      ? ["床に殺されるとは……これは、誰にも言うな……", "罠師め……墓碑にまで仕掛ける気か……"]
      : String(reason || "").includes("呪")
        ? ["この声は……本当に、俺のものか……？", "名前が……ほどけて、消えていく……"]
        : [];
    const pool = [...situational, ...personal, ...DEATH_CRY_COMMON];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function showDeathEffect(reason, deathCry) {
    els.deathCry.textContent = deathCry;
    els.deathReason.textContent = `死因：${reason}`;
    els.deathEffect.classList.remove("active");
    void els.deathEffect.offsetWidth;
    els.deathEffect.setAttribute("aria-hidden", "false");
    els.deathEffect.classList.add("active");
    window.setTimeout(() => {
      els.deathEffect.classList.remove("active");
      els.deathEffect.setAttribute("aria-hidden", "true");
      openDeathReview(reason);
    }, 2900);
  }

  function openDeathReview(reason, lines = state.meta.pendingDeathReview?.log || state.log.slice(0, 20)) {
    if (!els.deathReviewPanel) return;
    closeLogHistory(false);
    audio.musicBlocked = true;
    stopMusic();
    els.titleScreen.classList.add("hidden");
    els.deathReviewReason.textContent = `死因：${reason}。死亡直前の記録は、読み終えるまで閉じません。`;
    els.deathReviewLog.innerHTML = lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
    els.deathReviewPanel.classList.remove("hidden");
    els.deathReviewLog?.focus();
  }

  function continueAfterDeath() {
    state.meta.pendingDeathReview = null;
    saveGame();
    els.deathReviewPanel?.classList.add("hidden");
    audio.musicBlocked = false;
    showTitleScreen();
    updateAudioScene(true);
  }

  // 旧工房製の一点物を持つ既存セーブとの表示互換だけを残す。
  function formatCraftBonus(detail) {
    const parts = [];
    if (detail.bonusAttack) parts.push(`追加攻撃+${detail.bonusAttack}`);
    if (detail.bonusDefense) parts.push(`追加防御+${detail.bonusDefense}`);
    if (detail.bonusAcceleration) parts.push(`追加加速+${detail.bonusAcceleration}`);
    const resistance = formatResistances(detail.bonusResistances);
    if (resistance) parts.push(`追加耐性:${resistance}`);
    return parts.join(" / ") || "追加補正なし";
  }

  // Derived player stats, battle formulas, and research records.
  function getPlayerStats() {
    const adv = state.adventurer;
    const race = races[adv.raceId] || races.human;
    const job = jobs[adv.jobId] || jobs.swordsman;
    const personality = personalities[adv.personalityId] || personalities.gentle;
    const equipped = Object.entries(adv.equipment)
      .map(([slot, id]) => ({ slot, id, item: equipment[id], crafted: adv.craftedDetails[id] }))
      .filter((entry) => entry.item);
    const risqueSynergyCount = adv.personalityId === "lewd" ? equipped.filter((entry) => entry.item.risque).length : 0;
    const powerPoleAwakened = String(adv.name || "").trim() === "孫悟空" && adv.equipment.weapon === "artifact_power_pole";
    const rimuruSlimeAwakened = String(adv.name || "").trim() === "リムル" && adv.raceId === "slime";
    const baseStats = CHARACTER.buildBaseStats(race, job, personality);
    const levelBonuses = CHARACTER.levelBonuses(DATA, adv.level, adv.jobId, adv.personalityId);
    const grownStats = { ...baseStats };
    STAT_KEYS.forEach((key) => { grownStats[key] = Number(baseStats[key] || 0) + Number(levelBonuses[key] || 0); });
    STAT_KEYS.forEach((key) => { grownStats[key] += Number(adv.temporaryDebuffs?.[key] || 0); });
    if (adv.snackBuff?.turns > 0 && STAT_KEYS.includes(adv.snackBuff.stat)) grownStats[adv.snackBuff.stat] += Number(adv.snackBuff.amount || 0);
    STAT_KEYS.forEach((key) => { grownStats[key] += Number(adv.debugBonuses?.[key] || 0); });
    if (adv.slowTurns > 0) grownStats.speed -= 2;
    const foodGrowth = adv.jobId === "scavenger" ? scavengerGrowth(Number(adv.scavengerNutrition || 0)) : scavengerGrowth(0);
    grownStats.strength += foodGrowth.strength;
    grownStats.durability += foodGrowth.durability;
    grownStats.luck += foodGrowth.luck;
    grownStats.strength += risqueSynergyCount * RISQUE_SYNERGY_PER_ITEM.strength;
    grownStats.speed += risqueSynergyCount * RISQUE_SYNERGY_PER_ITEM.speed;
    grownStats.dexterity += risqueSynergyCount * RISQUE_SYNERGY_PER_ITEM.dexterity;
    grownStats.durability += risqueSynergyCount * RISQUE_SYNERGY_PER_ITEM.durability;
    grownStats.luck += risqueSynergyCount * RISQUE_SYNERGY_PER_ITEM.luck;
    if (powerPoleAwakened) {
      grownStats.strength += 80;
      grownStats.speed += 40;
      grownStats.dexterity += 25;
      grownStats.durability += 60;
      grownStats.luck += 20;
    }
    if (rimuruSlimeAwakened) STAT_KEYS.forEach((key) => { grownStats[key] += RIMURU_SLIME_STAT_BONUS; });
    const weapon = equipment[adv.equipment.weapon] || null;
    const weaponHeartEnhancement = equipmentEnhancement(adv.equipment.weapon);
    const weaponAttributes = [...new Set([...equipmentAttackAttributes(weapon), ...Object.keys(weaponHeartEnhancement.attributes)])];
    const stats = {
      strength: grownStats.strength,
      speed: grownStats.speed,
      dexterity: grownStats.dexterity,
      durability: grownStats.durability,
      luck: grownStats.luck,
      acceleration: Number(race.acceleration || 0) + Number(job.acceleration || 0) + foodGrowth.acceleration
        + (job.accelerationGrowthEvery ? Math.floor((adv.level - 1) / job.accelerationGrowthEvery) : 0)
        + risqueSynergyCount * RISQUE_SYNERGY_PER_ITEM.acceleration
        + (powerPoleAwakened ? 50 : 0)
        + (rimuruSlimeAwakened ? RIMURU_SLIME_ACCELERATION_BONUS : 0),
      hpRegen: 0,
      canSeeInvisible: Boolean(race.canSeeInvisible || rimuruSlimeAwakened),
      materialBurden: 0,
      maxHp: baseStats.maxHp + (adv.level - 1) * 3 + foodGrowth.maxHp + (powerPoleAwakened ? 300 : 0)
        + (rimuruSlimeAwakened ? RIMURU_SLIME_HP_BONUS : 0),
      attack: Math.max(1, job.attack + grownStats.strength + (weapon ? Math.floor((weapon.attack || 0) / 2) : 0)),
      defense: Math.max(0, job.defense + Math.floor(grownStats.durability / 2) + Math.floor((adv.level - 1) / 10)),
      attackAttribute: weaponAttributes[0] || job.baseAttackAttribute,
      attackAttributes: weaponAttributes.length ? weaponAttributes.slice() : [job.baseAttackAttribute],
      attackAttributeValues: { ...weaponHeartEnhancement.attributes },
      resistances: Object.fromEntries(DATA.attributes.map((id) => [id, 0])),
      attackTrials: Math.max(1, Math.min(9, job.combat.attackTrials + Math.floor(grownStats.speed / 4))),
      attackMin: Math.max(1, job.combat.attackMin + Math.floor(grownStats.strength / 2) + Math.floor((adv.level - 1) / 5) + (weapon ? Math.floor((weapon.attack || 0) / 2) : 0)),
      attackMax: Math.max(1, job.combat.attackMax + grownStats.strength + Math.floor((adv.level - 1) / 3) + (weapon ? (weapon.attack || 0) : 0)),
      accuracy: clamp(job.combat.accuracy + (grownStats.dexterity * 0.018) + (grownStats.speed * 0.008) + (grownStats.luck * 0.004), 0.1, 0.96),
      evasion: clamp(job.combat.evasion + (grownStats.speed * 0.015) + (grownStats.dexterity * 0.006), 0.01, 0.38),
      critChance: clamp(job.combat.crit + (grownStats.luck * 0.012) + (grownStats.dexterity * 0.006), 0, 0.38),
      researchEvidenceMultiplier: 1,
      flowerCharmChanceBonus: 0,
      flowerPetDurationBonus: 0,
      exceptionalLootMultiplier: 1,
      risqueSynergyCount,
      powerPoleAwakened,
      rimuruSlimeAwakened,
    };
    stats.acceleration += Number(adv.debugBonuses?.acceleration || 0);
    if (state.adventurer.inDungeon && ["overdrive", "pandemonium"].includes(state.dungeon?.anomaly?.id)) stats.acceleration += 20;
    if (state.adventurer.inDungeon && state.dungeon?.anomaly?.id === "tailwind") stats.acceleration += 10;
    Object.entries(race.resistances || {}).forEach(([id, value]) => {
      stats.resistances[id] = combineResistance(stats.resistances[id], value);
    });
    equipped.forEach(({ item, crafted, slot }) => {
      const heartEnhancement = equipmentEnhancement(item.id);
      stats.attack += item.attack || 0;
      stats.defense += item.defense || 0;
      if (slot === "weapon") {
        stats.attack += heartEnhancement.total;
        stats.attackMin += Math.floor(heartEnhancement.total / 2);
        stats.attackMax += heartEnhancement.total;
      } else {
        stats.defense += heartEnhancement.total;
      }
      stats.attack += crafted?.bonusAttack || 0;
      stats.defense += crafted?.bonusDefense || 0;
      if (slot !== "weapon" && item.attack) {
        stats.attackMin += Math.floor(Number(item.attack || 0) / 2);
        stats.attackMax += Number(item.attack || 0);
      }
      if (crafted?.bonusAttack) {
        stats.attackMin += Math.floor(Number(crafted.bonusAttack) / 2);
        stats.attackMax += Number(crafted.bonusAttack);
      }
      stats.acceleration += Number(item.acceleration || 0) + Number(crafted?.bonusAcceleration || 0);
      stats.hpRegen += Number(item.hpRegen || 0);
      if (item.trueSight) stats.canSeeInvisible = true;
      if (slot !== "weapon") {
        equipmentAttackAttributes(item).forEach((attribute) => {
          if (!stats.attackAttributes.includes(attribute)) stats.attackAttributes.push(attribute);
        });
      }
      Object.entries(item.resistances || {}).forEach(([id, value]) => {
        stats.resistances[id] = combineResistance(stats.resistances[id], value);
      });
      if (slot !== "weapon") Object.entries(heartEnhancement.attributes).forEach(([id, value]) => {
        stats.resistances[id] = combineResistance(stats.resistances[id], value);
      });
      Object.entries(crafted?.bonusResistances || {}).forEach(([id, value]) => {
        stats.resistances[id] = combineResistance(stats.resistances[id], value);
      });
    });
    stats.activeEquipmentSets = applyEquipmentSetBonuses(stats, equipped.map((entry) => entry.item));
    DATA.attributes.forEach((id) => {
      if (stats.resistances[id] !== "immune") stats.resistances[id] = clamp(Number(stats.resistances[id] || 0), -4, 5);
    });
    if (rimuruSlimeAwakened) DATA.attributes.forEach((id) => { stats.resistances[id] = "immune"; });
    equipped.forEach(({ item }) => (item.puzzleEffects || []).forEach((effect) => applyEquipmentPuzzleEffect(stats, effect, adv)));
    stats.attackAttribute = stats.attackAttributes[0] || job.baseAttackAttribute;
    stats.cursePenaltyRate = DATA.resistanceMultipliers[stats.resistances.curse || 0] ?? 1;
    stats.cursePenalties = {};
    equipped.forEach(({ item }) => {
      Object.entries(item.curse?.penalties || {}).forEach(([key, value]) => {
        if (!(key in stats)) return;
        const rawPenalty = Number(value || 0);
        const roundedPenalty = Math.round(rawPenalty * stats.cursePenaltyRate);
        const applied = stats.cursePenaltyRate === 0 || rawPenalty === 0
          ? 0
          : roundedPenalty || Math.sign(rawPenalty);
        stats[key] += applied;
        if (key === "attack") {
          stats.attackMin += applied;
          stats.attackMax += applied;
        }
        stats.cursePenalties[key] = Number(stats.cursePenalties[key] || 0) + applied;
      });
    });
    stats.maxHp = Math.max(1, Math.round(stats.maxHp));
    stats.attack = Math.max(1, Math.round(stats.attack));
    stats.defense = Math.max(0, Math.round(stats.defense));
    stats.attackMin = Math.max(1, Math.round(stats.attackMin));
    stats.attackMax = Math.max(stats.attackMin, Math.round(stats.attackMax));
    stats.critChance = clamp(stats.critChance, 0, 0.6);
    if (drunkenFistActive()) {
      stats.evasion = clamp(stats.evasion + 0.2, 0.01, 0.58);
      stats.critChance = clamp(stats.critChance + 0.24, 0, 0.72);
      stats.acceleration += 12;
    }
    const materialCount = Object.values(adv.materials).reduce((sum, count) => sum + Number(count || 0), 0)
      + getItemCount(RECOVERY_MEDICINE.id) * RECOVERY_MEDICINE.weight;
    const materialCapacity = Number(job.materialCapacity || 30);
    const burdenStep = Number(job.materialBurdenStep || 15);
    stats.materialCount = materialCount;
    stats.materialCapacity = materialCapacity;
    stats.materialBurden = Math.min(30, Math.floor(Math.max(0, materialCount - materialCapacity) / burdenStep));
    stats.acceleration -= stats.materialBurden;
    adv.maxHp = stats.maxHp;
    adv.hp = Math.min(adv.hp, stats.maxHp);
    return stats;
  }

  function applyEquipmentSetBonuses(stats, equippedItems) {
    const equippedIds = new Set((equippedItems || []).map((item) => item.id));
    return (DATA.equipmentSets || []).map((set) => {
      const count = set.itemIds.filter((id) => equippedIds.has(id)).length;
      const activeBonuses = set.bonuses.filter((bonus) => count >= bonus.pieces);
      activeBonuses.forEach((bonus) => {
        stats.attack += Number(bonus.attack || 0);
        stats.attackMin += Number(bonus.attack || 0);
        stats.attackMax += Number(bonus.attack || 0);
        stats.defense += Number(bonus.defense || 0);
        stats.acceleration += Number(bonus.acceleration || 0);
        stats.hpRegen += Number(bonus.hpRegen || 0);
        (bonus.attackAttributes || []).forEach((attribute) => {
          if (!stats.attackAttributes.includes(attribute)) stats.attackAttributes.push(attribute);
        });
        Object.entries(bonus.resistances || {}).forEach(([attribute, value]) => {
          stats.resistances[attribute] = combineResistance(stats.resistances[attribute], value);
        });
      });
      return { ...set, count, activeBonuses };
    }).filter((set) => set.count > 0);
  }

  function resistanceAtLeast(value, threshold) {
    return value === "immune" || Number(value || 0) >= Number(threshold || 0);
  }

  function applyPuzzleStatBonuses(stats, effect) {
    const attack = Number(effect.attack || 0);
    stats.attack += attack;
    stats.attackMin += Math.floor(attack / 2);
    stats.attackMax += attack;
    stats.defense += Number(effect.defense || 0);
    stats.acceleration += Number(effect.acceleration || 0);
    stats.hpRegen += Number(effect.hpRegen || 0);
    stats.critChance += Number(effect.crit || 0);
    stats.luck += Number(effect.luck || 0);
  }

  function applyEquipmentPuzzleEffect(stats, effect, adventurer) {
    const status = equipmentPuzzleStatus(stats, effect, adventurer);
    const active = status.active;
    if (effect.type === "research") {
      stats.researchEvidenceMultiplier *= Number(effect.multiplier || 1);
      return;
    }
    if (effect.type === "flower") {
      stats.flowerCharmChanceBonus += Number(effect.chance || 0);
      stats.flowerPetDurationBonus += Number(effect.duration || 0);
      return;
    }
    if (effect.type === "rareLoot") {
      if (active) stats.exceptionalLootMultiplier *= Number(effect.multiplier || 1);
      return;
    }
    if (active) applyPuzzleStatBonuses(stats, effect);
  }

  function equipmentPuzzleStatus(stats, effect, adventurer = state.adventurer) {
    if (effect.type === "resistance") {
      const current = stats.resistances[effect.attribute];
      return { active: resistanceAtLeast(current, effect.threshold), progress: `${attr(effect.attribute)}耐性 ${current === "immune" ? "免疫" : current}/${effect.threshold}` };
    }
    if (effect.type === "resistancePair") {
      const parts = effect.attributes.map((id, index) => `${attr(id)}${stats.resistances[id] === "immune" ? "免疫" : stats.resistances[id]}/${effect.thresholds[index]}`);
      return { active: effect.attributes.every((id, index) => resistanceAtLeast(stats.resistances[id], effect.thresholds[index])), progress: parts.join("・") };
    }
    if (effect.type === "acceleration") return { active: stats.acceleration >= effect.threshold, progress: `加速度 ${stats.acceleration}/${effect.threshold}` };
    if (effect.type === "lowHp") {
      const percent = Math.round(Number(adventurer.hp || 0) / Math.max(1, stats.maxHp) * 100);
      return { active: percent <= effect.rate * 100, progress: `現在HP ${percent}% / 条件${Math.round(effect.rate * 100)}%以下` };
    }
    if (effect.type === "vulnerability") {
      const count = Object.values(stats.resistances).filter((value) => value !== "immune" && Number(value) < 0).length;
      return { active: count >= effect.count, progress: `負の耐性 ${count}/${effect.count}` };
    }
    if (effect.type === "resistanceDiversity") {
      const count = Object.values(stats.resistances).filter((value) => resistanceAtLeast(value, effect.threshold)).length;
      return { active: count >= effect.count, progress: `耐性${effect.threshold}以上 ${count}/${effect.count}属性` };
    }
    if (effect.type === "rareLoot") {
      const current = stats.resistances[effect.attribute];
      return { active: resistanceAtLeast(current, effect.threshold), progress: `${attr(effect.attribute)}耐性 ${current === "immune" ? "免疫" : current}/${effect.threshold}` };
    }
    if (["research", "flower"].includes(effect.type)) return { active: true, progress: "装備中は常時発動" };
    return { active: false, progress: "条件不明" };
  }

  function getPlayerBattleProfile(enemy, mode, learnedSpell = null, context = {}) {
    const adv = state.adventurer;
    const job = jobs[adv.jobId] || jobs.swordsman;
    const stats = getPlayerStats();
    const spellMode = mode === "spell" && learnedSpell;
    const rangedMode = mode === "ranged";
    const drunkenFist = mode === "attack" && drunkenFistActive();
    const capoeiraKick = !drunkenFist && mode === "attack" && capoeiraActive(state.arena || state.dungeon);
    const attackDistance = enemy ? chebyshevDistance(enemy, state.arena?.player || state.dungeon?.player || enemy) : 1;
    const spellDistance = spellMode && enemy
      ? chebyshevDistance(enemy, state.arena?.player || state.dungeon?.player || enemy)
      : 0;
    const magicJobMultiplier = !spellMode ? 1
      : adv.jobId === "mage" ? 1.16
        : adv.jobId === "spellblade" ? (spellDistance <= 2 ? 1.22 : 0.84)
          : adv.jobId === "priest" ? 0.9 : 1;
    const holySpeciesMultiplier = spellMode && learnedSpell.effect === "holy" && ["spirit", "fiend", "demon"].includes(enemy?.speciesId) ? 1.5 : 1;
    const rangedPower = !rangedMode ? 1
      : adv.jobId === "archer" ? 1 + Math.max(0, attackDistance - 2) * 0.08
        : adv.jobId === "ninja" ? 0.82
          : adv.jobId === "flower_tamer" ? 0.9 : 1;
    const conditionalSkillPower = mode !== "skill" ? 1
      : job.skill.tag === "shadow_assassination" && context.wasAsleep ? 2.4
        : Math.max(1, Number(job.skill.power || 1));
    const skillPower = drunkenFist ? DRUNKEN_FIST_POWER : capoeiraKick ? Math.max(1, Number(job.skill.power || 1.8)) : spellMode ? Math.max(1, Number(learnedSpell.power || 1)) * magicJobMultiplier * holySpeciesMultiplier : mode === "skill" ? conditionalSkillPower : rangedPower;
    const attributes = spellMode
      ? [learnedSpell.attribute]
      : drunkenFist || capoeiraKick ? ["blunt"]
        : mode === "skill" && job.skill.attribute ? [job.skill.attribute] : (stats.attackAttributes?.length ? stats.attackAttributes.slice() : [stats.attackAttribute || job.baseAttackAttribute]);
    const attribute = attributes[0];
    let attackTrials = mode === "skill" || spellMode
      ? Math.max(1, Math.ceil(stats.attackTrials * 0.6))
      : stats.attackTrials;
    if (rangedMode && adv.jobId === "ninja") attackTrials = Math.max(1, Math.ceil(attackTrials * 0.5));
    const heartAttributePower = Math.max(0, ...attributes.map((id) => Number(stats.attackAttributeValues?.[id] || 0)));
    const attackMin = Math.max(1, Math.round(stats.attackMin * skillPower) + heartAttributePower);
    const attackMax = Math.max(attackMin, Math.round(stats.attackMax * skillPower) + heartAttributePower);
    const spellAccuracy = spellMode ? Number(learnedSpell.accuracyModifier || 0) : 0;
    const enemyEvasion = Math.max(0, Number(enemy?.evasion || 0) - (Number(enemy?.spellConfusedTurns || 0) > 0 ? 0.12 : 0));
    const hitChance = drunkenFist ? Math.max(0.94, clamp(stats.accuracy - enemyEvasion, 0.1, 0.98)) : clamp((mode === "skill" || spellMode ? stats.accuracy + 0.08 + spellAccuracy : stats.accuracy) - enemyEvasion, 0.1, 0.98);
    const rangedCritBonus = rangedMode && adv.jobId === "archer" ? Math.max(0, attackDistance - 2) * 0.015 : 0;
    const skillCritBonus = mode === "skill" && job.skill.tag === "precise" ? 0.16 : mode === "skill" && job.skill.tag === "shadow_assassination" && context.wasAsleep ? 0.28 : mode === "skill" ? 0.05 : 0;
    const critChance = clamp(stats.critChance + rangedCritBonus + (drunkenFist ? 0.12 : spellMode ? 0.03 : skillCritBonus), 0, drunkenFist ? 0.82 : 0.6);
    return {
      label: drunkenFist ? "酔拳・八仙酔打" : capoeiraKick ? "逆立ち旋風脚" : spellMode ? `${spellbookRankLabel(learnedSpell.rank)}魔法「${learnedSpell.name}」` : mode === "skill" ? job.skill.name : rangedMode ? `${job.name}の遠隔攻撃` : `${job.name}の連撃`,
      attribute,
      attributes,
      attackTrials,
      attackMin,
      attackMax,
      hitChance,
      critChance,
      defensePierce: spellMode && learnedSpell.effect === "shatter" ? 1 : spellMode && learnedSpell.effect === "pierce" ? 0.5
        : mode === "skill" && job.skill.tag === "piercing_arrow" ? 0.7
          : mode === "skill" && job.skill.tag === "precise" ? 0.25 : 0,
    };
  }

  function getEnemyBattleProfile(enemy, attribute, power, options = {}) {
    const stats = getPlayerStats();
    const basePower = Math.max(1, power || enemy.attack || 1);
    const attackTrials = Math.max(1, Math.min(4, Math.floor(Number(options.trials ?? 1))));
    const attackMin = Math.max(1, options.attackMin || Math.max(1, basePower - 2));
    const attackMax = Math.max(attackMin, options.attackMax || (basePower + 2));
    const hitChance = clamp((options.hitChance || (0.68 + basePower * 0.006 + (enemy.unique ? 0.04 : 0))) + Number(options.hitBonus || 0) - stats.evasion, 0.1, 0.96);
    const critChance = clamp(options.critChance ?? (enemy.unique ? 0.1 : 0.05), 0, 0.45);
    return {
      attackTrials,
      attackMin,
      attackMax,
      hitChance,
      critChance,
      attribute,
    };
  }

  function rollAttackSequence(profile, onHit, stopCondition) {
    let total = 0;
    let hitCount = 0;
    let critCount = 0;
    for (let i = 0; i < profile.attackTrials; i += 1) {
      if (Math.random() > profile.hitChance) continue;
      hitCount += 1;
      let raw = rand(profile.attackMin, profile.attackMax);
      if (Math.random() < profile.critChance) {
        raw = Math.max(1, Math.round(raw * 1.5));
        critCount += 1;
      }
      total += onHit(raw);
      if (stopCondition && stopCondition()) break;
    }
    return { total, hitCount, critCount };
  }

  function combineResistance(a, b) {
    if (a === "immune" || b === "immune") return "immune";
    return Number(a || 0) + Number(b || 0);
  }

  function damageAfterDefense(raw, attackAttributes, enemy, defensePierce = 0) {
    const attributes = Array.isArray(attackAttributes) && attackAttributes.length ? attackAttributes : [attackAttributes].filter(Boolean);
    return Math.max(0, ...attributes.map((attribute) => {
      const weak = enemy.weaknesses.includes(attribute) ? 1.35 : 1;
      const res = enemy.resistances[attribute] || 0;
      const mult = DATA.resistanceMultipliers[res] ?? 1;
      const defense = Math.max(0, Number(enemy.defense || 0) * (1 - clamp(defensePierce, 0, 1)) - Number(enemy.spellArmorBreak || 0));
      const cursed = Number(enemy.spellCursedTurns || 0) > 0 ? 1.2 : 1;
      return mult === 0 ? 0 : Math.max(1, Math.round(Math.max(1, raw * weak - defense) * mult * cursed));
    }));
  }

  const RESEARCH_EVIDENCE_THRESHOLDS = [0, 1, 30, 85, 180, 320];
  const RESEARCH_EVENT_EVIDENCE = [0, 1, 1, 2, 3, 5];

  function markResearch(monsterId, level, options = {}) {
    const rec = getResearch(monsterId);
    const previousLevel = rec.level;
    const nextLevel = clamp(Math.floor(Number(level || 0)), 0, MAX_RESEARCH_LEVEL);
    if (nextLevel <= 0) return;
    rec.seen = true;
    let gainedEvidence = 0;
    if (options.force) rec.evidence = RESEARCH_EVIDENCE_THRESHOLDS[nextLevel];
    else {
      rec.milestones = rec.milestones && typeof rec.milestones === "object" ? rec.milestones : {};
      const firstMilestone = !rec.milestones[nextLevel];
      rec.milestones[nextLevel] = true;
      const depthMultiplier = 1 + Math.min(0.5, monsterNativeFloor(monsters[monsterId]) / 200);
      gainedEvidence = Math.max(0, Math.round(Number(options.evidence ?? RESEARCH_EVENT_EVIDENCE[nextLevel])
        * getPlayerStats().researchEvidenceMultiplier * depthMultiplier * (firstMilestone ? 2 : 1)));
      rec.evidence = Math.min(RESEARCH_EVIDENCE_THRESHOLDS[MAX_RESEARCH_LEVEL], Number(rec.evidence || 0) + gainedEvidence);
    }
    rec.level = RESEARCH_EVIDENCE_THRESHOLDS.reduce((result, threshold, index) => rec.evidence >= threshold ? index : result, 0);
    if (!options.force && gainedEvidence > 0) spreadSpeciesResearch(monsterId, gainedEvidence);
    if (previousLevel < MAX_RESEARCH_LEVEL && rec.level >= MAX_RESEARCH_LEVEL) {
      grantMonsterHeart(monsterId, true);
      reconcileResearchCompletion(true);
    }
  }

  function getResearch(monsterId) {
    if (!state.meta.research[monsterId]) state.meta.research[monsterId] = { seen: false, level: 0 };
    const rec = state.meta.research[monsterId];
    rec.level = clamp(Math.floor(Number(rec.level || 0)), 0, MAX_RESEARCH_LEVEL);
    const minimumEvidence = RESEARCH_EVIDENCE_THRESHOLDS[rec.level];
    rec.evidence = clamp(Math.floor(Number(rec.evidence ?? minimumEvidence)), minimumEvidence, RESEARCH_EVIDENCE_THRESHOLDS[MAX_RESEARCH_LEVEL]);
    rec.seen = Boolean(rec.seen || rec.level > 0);
    rec.milestones = rec.milestones && typeof rec.milestones === "object" ? rec.milestones : {};
    return rec;
  }

  function spreadSpeciesResearch(monsterId, gainedEvidence) {
    const source = monsters[monsterId];
    const shared = Math.max(1, Math.floor(gainedEvidence * 0.12));
    const peers = (monstersBySpecies[source?.speciesId] || [])
      .filter((monster) => monster.id !== monsterId && state.meta.research[monster.id]?.seen && getResearch(monster.id).level < MAX_RESEARCH_LEVEL)
      .sort((left, right) => getResearch(left.id).evidence - getResearch(right.id).evidence)
      .slice(0, 2);
    peers.forEach((monster) => {
      const record = getResearch(monster.id);
      record.evidence = Math.min(RESEARCH_EVIDENCE_THRESHOLDS[MAX_RESEARCH_LEVEL], record.evidence + shared);
      record.level = RESEARCH_EVIDENCE_THRESHOLDS.reduce((result, threshold, index) => record.evidence >= threshold ? index : result, 0);
    });
  }

  function getMaterialCount(id) {
    return state.adventurer.materials[id] || 0;
  }

  function getItemCount(id) {
    return state.adventurer.items[id] || 0;
  }

  function ownsEquipment(id) {
    return state.adventurer.ownedEquipment.includes(id);
  }

  function addMaterial(id, count) {
    state.adventurer.materials[id] = Math.max(0, (state.adventurer.materials[id] || 0) + count);
  }

  function addItem(id, count) {
    state.adventurer.items[id] = Math.max(0, (state.adventurer.items[id] || 0) + count);
    if (!state.adventurer.items[id]) delete state.adventurer.items[id];
  }

  function equipmentAttackAttributes(item) {
    if (!item) return [];
    const values = Array.isArray(item.attackAttributes) ? item.attackAttributes : item.attributeAttack ? [item.attributeAttack] : [];
    return [...new Set(values.filter((id) => DATA.attributes.includes(id)))];
  }

  function formatAttackAttributes(attributes) {
    return [...new Set((attributes || []).filter(Boolean))].map(attrHtml).join("・");
  }

  function equipmentDisplayName(item) {
    if (!item) return "なし";
    const artifactMark = item.artifact ? (item.artifact.random ? "☆" : "★") : "";
    return `${artifactMark}${item.name}${item.risque ? "♡" : ""}`;
  }

  function getEquipmentName(id) {
    return id && equipment[id] ? equipmentDisplayName(equipment[id]) : "なし";
  }

  function treasureTierLabel(item) {
    if (item?.junkTier === "legend") return "レジェンドガラクタ";
    if (item?.junkTier === "ultra_luxury") return "超高級ガラクタ";
    if (item?.junkTier === "luxury") return "高級ガラクタ";
    return item?.type === "junk" ? "ガラクタ" : "";
  }

  function formatCursePenalty(curse) {
    const penalties = Object.entries(curse?.penalties || {}).map(([key, value]) => `${statLabel(key)}${Number(value) > 0 ? "+" : ""}${value}`);
    return `${curse?.name || "不明な呪い"}${penalties.length ? `（${penalties.join("・")}）` : ""}`;
  }

  function statLabel(key) {
    return ({ strength: "力", speed: "素早さ", dexterity: "器用さ", durability: "耐久力", luck: "運", attack: "攻撃", defense: "防御", acceleration: "加速", maxHp: "最大HP", hpRegen: "再生" })[key] || key;
  }

  function formatResistances(resistances) {
    return Object.entries(resistances || {}).map(([id, value]) => `<span class="attr attr-${id}">${attr(id)}${value === "immune" ? "免疫" : value}</span>`).join("、");
  }

  function attrHtml(id) {
    return `<span class="attr attr-${id}">${attr(id)}</span>`;
  }

  function attr(id) {
    return DATA.attributeLabels[id] || id || "無";
  }

  function monsterMarker(enemy) {
    if (enemy.speciesGlyph) return enemy.speciesGlyph;
    const masterMarker = monsters[enemy.id]?.mapMarker;
    if (masterMarker) return masterMarker;
    if (enemy.mapMarker) return enemy.mapMarker;
    const special = {
      cave_rat: "ネ", carapace_rat: "コ", poison_bat: "バ", thunder_hare: "ウ", fire_lizard: "ト", red_garm: "ガ",
      white_fang_marta: "マ", iron_shell_gondo: "ゴ", venom_widow_nazka: "ナ", drowned_knight_ordo: "オ",
      thunder_emperor_barg: "バ", curse_mask_mimei: "ミ", frost_bloom_helka: "ヘ", ash_dragon_volda: "ヴ", abyss_eye_zahar: "ザ",
      moon_eater_luna: "ル", acid_king_doruba: "ド", wind_witch_sylphy: "シ", bone_lord_gazra: "ガ", steel_beast_orga: "オ",
      mirage_prince_nemu: "ネ", ice_empress_freya: "フ", sunken_god_molok: "モ", black_sun_azazel: "ア", dungeon_heart_eve: "イ",
    };
    if (special[enemy.id]) return special[enemy.id];
    const family = enemy.id.split("_")[0];
    const familyMarkers = { fang: "ケ", shell: "ム", wing: "ト", slime: "ス", spirit: "レ", storm: "セ", reptile: "リ", construct: "ゴ", stalker: "カ", deep: "シ" };
    return familyMarkers[family] || "モ";
  }

  function openMonsterInfo(enemy) {
    if (!enemy) return;
    startAudioFromGesture();
    const before = getResearch(enemy.id).level;
    if (!getResearch(enemy.id).seen) markResearch(enemy.id, 1);
    if (getResearch(enemy.id).level > before) saveGame();
    if (enemy.unique) {
      ensureUniqueEncounterSpeech(enemy);
      uniqueSpeak(enemy, "observe", { chance: 0.48 });
    }
    const rec = getResearch(enemy.id);
    const hpRate = Math.max(0, Math.min(100, Math.round((enemy.hp / enemy.maxHp) * 100)));
    const ranged = rangedAttackStatus(enemy);
    const jobSkillAttack = jobSkillAttackStatus(enemy);
    const spellAttack = activeSpellAttackStatus(enemy);
    const known = [];
    if (rec.level >= 1) {
      known.push(`<div class="monster-info-row"><span>種族</span><strong>${monsterSpeciesDisplay(enemy, rec.level)}</strong></div>`);
      known.push(`<div class="monster-info-row"><span>色階級</span><strong class="monster-tier-${enemy.colorTier || "white"}">${enemy.colorTierName} / 脅威${Number(enemy.threatScore ?? enemy.threatRank).toFixed(1)}</strong></div>`);
      known.push(`<div class="monster-info-row"><span>HP</span><strong>${Math.max(0, enemy.hp)} / ${enemy.maxHp}</strong></div>`);
      if (enemy.asleep) known.push('<div class="monster-info-row"><span>状態</span><strong>睡眠中</strong></div>');
      if (enemy.flowerPet) known.push(`<div class="monster-info-row"><span>状態</span><strong>花ペット / 残り${enemy.flowerPetTurns}ターン</strong></div>`);
      known.push(`<div class="monster-info-row"><span>攻撃属性</span><strong>${attrHtml(enemy.attackAttribute)}</strong></div>`);
      known.push(`<div class="monster-info-row"><span>加速度</span><strong>${enemy.acceleration || 0}</strong></div>`);
      if (enemy.invisible) known.push(`<div class="monster-info-row"><span>特性</span><strong>透明</strong></div>`);
      if (enemy.canPhaseWalls) known.push(`<div class="monster-info-row"><span>特性</span><strong>壁抜け</strong></div>`);
    }
    if (rec.level >= 2) {
      known.push(`<div class="monster-info-row"><span>攻撃力</span><strong>${enemy.attack}</strong></div>`);
      known.push(`<div class="monster-info-row"><span>防御力</span><strong>${enemy.defense}</strong></div>`);
      if (enemy.rewardProfile?.tag === "harvest-rich") known.push('<div class="monster-info-row"><span>特別報酬</span><strong class="reward-tag harvest">剥ぎ取りがおいしい個体</strong></div>');
      if (enemy.rewardProfile?.tag === "exp-rich") known.push('<div class="monster-info-row"><span>特別報酬</span><strong class="reward-tag experience">経験値がおいしい個体</strong></div>');
    }
    if (rec.level >= 3) {
      known.push(`<div class="monster-info-row"><span>弱点</span><strong>${enemy.weaknesses.map(attr).join("・") || "なし"}</strong></div>`);
      known.push(`<div class="monster-info-row"><span>耐性</span><strong>${formatResistances(enemy.resistances) || "なし"}</strong></div>`);
      if (enemy.rapidRegeneration) known.push(`<div class="monster-info-row"><span>急速再生</span><strong>世界ターンごとにHP${Math.ceil(enemy.maxHp * enemy.rapidRegeneration.rate)}回復 / 火で2ターン停止・毒で3ターン半減・会心で1ターン停止</strong></div>`);
      if (enemy.rapidRegeneration) known.push(`<div class="monster-info-row"><span>急速再生</span><strong>世界ターンごとにHP${enemy.rapidRegeneration.amount}回復</strong></div>`);
      const attackPool = enemyAttackAttributePool(enemy);
      known.push(`<div class="monster-info-row"><span>攻撃候補</span><strong>${attackPool.map(attrHtml).join("・")}</strong></div>`);
      if (enemyTacticalIntelligence(enemy) > 0) known.push(`<div class="monster-info-row"><span>戦術知性</span><strong>耐性の薄い属性を狙う確率 約${Math.round(enemyTacticalIntelligence(enemy) * 100)}%</strong></div>`);
      known.push(`<div class="monster-info-row"><span>危険技</span><strong>${enemy.dangerous ? `${enemy.dangerous.name}（${attrHtml(enemy.dangerous.attribute)}）` : "なし"}</strong></div>`);
      if (enemy.specialAttack) known.push(`<div class="monster-info-row"><span>特殊行動</span><strong>${SPECIAL_ATTACK_LABELS[enemy.specialAttack] || enemy.specialAttack}</strong></div>`);
      if (enemy.summon) known.push(`<div class="monster-info-row"><span>召喚</span><strong>${enemy.summon.every}行動ごと / 同時${enemy.summon.maxAlive}体まで</strong></div>`);
      if (enemy.dragonBreath) known.push(`<div class="monster-info-row"><span>竜息</span><strong>威力${enemy.dragonBreath.power} × ${enemy.dragonBreath.trials}回判定</strong></div>`);
      if (enemy.divineInvulnerability) known.push(`<div class="monster-info-row"><span>神域</span><strong>${enemy.divineInvulnerability.every}行動ごと / ${enemy.divineInvulnerability.charges}回完全無効</strong></div>`);
      if (enemy.demonicWard) known.push(`<div class="monster-info-row"><span>悪魔障壁</span><strong>${enemy.demonicWard.attributes.map(attrHtml).join("・")}耐性${enemy.demonicWard.tier}以上</strong></div>`);
    }
    if (rec.level >= 4) {
      known.push(`<div class="monster-loot-info"><span>剥ぎ取り候補</span><p>${lootCandidateNames(enemy).join("・") || "なし"}</p></div>`);
    }
    if (rec.level >= MAX_RESEARCH_LEVEL) {
      if (enemy.dangerous) known.push(`<div class="monster-info-row"><span>危険技詳細</span><strong>威力${enemy.dangerous.power} / ${enemy.dangerous.every}行動ごと</strong></div>`);
      known.push(`<div class="monster-loot-info"><span>剥ぎ取り条件</span>${lootHint(enemy).map((line) => `<p>${line}</p>`).join("")}</div>`);
    }
    const researchText = Object.entries(enemy.research || {})
      .filter(([level]) => Number(level) <= rec.level)
      .map(([, text]) => `<p>${text}</p>`)
      .concat(rec.level >= 1 && isHypeThreat(enemy) ? [`<p>${monsterThreatHypeDescription(enemy)}</p>`] : [])
      .concat(rec.level >= 2 ? [`<p>${monsterTriviaDescription(enemy)}</p>`] : [])
      .concat(rec.level >= 3 ? [`<p>${monsterAttackFeatureDescription(enemy)}</p>`] : [])
      .concat(rec.level >= 2 && isCharacterfulMonster(enemy) ? [`<p>${monsterCharacterDescription(enemy, rec.level)}</p>`] : [])
      .join("");
    els.monsterInfoContent.innerHTML = `
      <div class="monster-info-heading enemy-${enemy.attackAttribute || "neutral"} monster-tier-${enemy.colorTier || "white"} ${enemy.uniqueStyle ? `unique-${enemy.uniqueStyle}` : ""}">
        <span>${monsterMarker(enemy)}</span>
        <div><h2>${enemy.name}</h2><small>${enemy.unique ? `${enemy.uniqueTemperament || "ユニーク"} / ` : ""}${researchStatusText(rec.level)}</small></div>
      </div>
      <div class="monster-detail-hp"><span>HP</span><span class="hp-bar"><i class="${hpColorClass(hpRate)}" style="width:${hpRate}%"></i></span><strong>${rec.level >= 1 ? `${Math.max(0, enemy.hp)} / ${enemy.maxHp}` : "???"}</strong></div>
      ${known.length ? `<div class="monster-info-grid">${known.join("")}</div>` : `<p class="unknown-info">名前以外の情報はまだ判明していない。</p>`}
      ${researchText ? `<div class="monster-research-notes">${researchText}</div>` : ""}
      ${jobSkillAttack.skill?.tag !== "heal" ? `<button type="button" id="monsterJobSkillAttack" ${jobSkillAttack.available ? "" : "disabled"}>${jobSkillAttack.available ? `${jobSkillAttack.skill.name}を使う（射程${jobSkillAttack.range}）` : `${jobSkillAttack.skill?.name || "職業技"}：${jobSkillAttack.reason}`}</button>` : ""}
      ${ranged.range ? `<button type="button" id="monsterRangedAttack" ${ranged.available ? "" : "disabled"}>${ranged.available ? `遠隔攻撃（射程${ranged.range}）` : `遠隔攻撃不可：${ranged.reason}`}</button>` : ""}
      ${spellAttack.spell ? `<button type="button" id="monsterSpellAttack" ${spellAttack.available ? "" : "disabled"}>${spellAttack.available ? `${spellAttack.spell.name}を放つ（射程${spellAttack.range}）` : `${spellAttack.spell.name}：${spellAttack.reason}`}</button>` : ""}
    `;
    els.monsterInfoPanel.classList.remove("hidden");
    document.querySelector("#monsterJobSkillAttack")?.addEventListener("click", () => useJobSkillAt(enemy));
    document.querySelector("#monsterRangedAttack")?.addEventListener("click", () => rangedAttackEnemy(enemy));
    document.querySelector("#monsterSpellAttack")?.addEventListener("click", () => castActiveSpellAt(enemy));
    playSfx("select");
  }

  function closeMonsterInfo() {
    els.monsterInfoPanel.classList.add("hidden");
  }

  function hpColorClass(rate) {
    return rate <= 25 ? "hp-critical" : rate <= 55 ? "hp-warning" : "hp-healthy";
  }

  function updateHpFill(element, value, max) {
    if (!element) return;
    const rate = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
    element.style.width = `${rate}%`;
    element.className = hpColorClass(rate);
  }

  function rangedAttackStatus(enemy) {
    const job = jobs[state.adventurer.jobId];
    const range = Number(job.rangedRange || 0);
    if (enemy?.flowerPet) return { range, available: false, reason: "使役中の花ペット" };
    if (!range || !state.dungeon) return { range, available: false, reason: "遠隔職ではない" };
    const distance = chebyshevDistance(enemy, state.dungeon.player);
    if (distance > range) return { range, available: false, reason: `射程外（距離${distance}）` };
    if (!hasLineOfSight(state.dungeon.player.x, state.dungeon.player.y, enemy.x, enemy.y)) return { range, available: false, reason: "壁に遮られている" };
    return { range, available: true, reason: "" };
  }

  function jobSkillAttackStatus(enemy) {
    const job = jobs[state.adventurer.jobId];
    const skill = job?.skill;
    if (enemy?.flowerPet) return { skill, range: Number(job?.rangedRange || 1), available: false, reason: "使役中の花ペット" };
    if (!skill || !state.dungeon) return { skill, range: 0, available: false, reason: "ダンジョン内でのみ使用できる" };
    if (["heal", "capoeira_stance"].includes(skill.tag)) return { skill, range: 0, available: false, reason: "敵を対象にしない技" };
    const cooldown = jobSkillCooldownRemaining(skill.id);
    if (cooldown > 0) return { skill, range: Number(job.rangedRange || 1), cooldown, available: false, reason: `再使用まで${cooldown}世界ターン` };
    const rangedRange = Number(job.rangedRange || 0);
    const range = skill.tag === "observe" ? Math.max(4, rangedRange) : Math.max(1, rangedRange);
    const distance = chebyshevDistance(enemy, state.dungeon.player);
    if (distance > range) return { skill, range, available: false, reason: `射程外（距離${distance}）` };
    if (distance > 1 && !hasLineOfSight(state.dungeon.player.x, state.dungeon.player.y, enemy.x, enemy.y)) return { skill, range, available: false, reason: "壁に遮られている" };
    return { skill, range, available: true, reason: "" };
  }

  function activeSpellAttackStatus(enemy) {
    const spell = activeLearnedSpell();
    if (enemy?.flowerPet) return { spell, range: Number(spell?.range || 0), available: false, reason: "使役中の花ペット" };
    if (!spell || !spell.jobs.includes(state.adventurer.jobId) || !state.dungeon) return { spell, range: Number(spell?.range || 0), available: false, reason: "使用できる習得魔法がない" };
    const cooldown = spellCooldownRemaining(spell.id);
    if (cooldown > 0) return { spell, range: Number(spell.range || 1), cooldown, available: false, reason: `再詠唱まで${cooldown}世界ターン` };
    const range = Number(spell.range || 1);
    const distance = chebyshevDistance(enemy, state.dungeon.player);
    if (distance > range) return { spell, range, available: false, reason: `射程外（距離${distance}）` };
    if (!hasLineOfSight(state.dungeon.player.x, state.dungeon.player.y, enemy.x, enemy.y)) return { spell, range, available: false, reason: "壁に遮られている" };
    return { spell, range, available: true, reason: "" };
  }

  function combatCooldownHost() {
    return state.adventurer.inDungeon ? state.dungeon : state.arena;
  }

  function cooldownRemaining(bucket, id) {
    return Math.max(0, Number(combatCooldownHost()?.[bucket]?.[id] || 0));
  }

  function beginCooldown(bucket, id, turns) {
    const host = combatCooldownHost();
    if (!host || !id || Number(turns) <= 0) return;
    host[bucket] = host[bucket] && typeof host[bucket] === "object" ? host[bucket] : {};
    host[bucket][id] = Math.max(1, Number(turns));
  }

  function tickCooldownBucket(host, bucket) {
    if (!host?.[bucket]) return;
    Object.keys(host[bucket]).forEach((id) => {
      host[bucket][id] = Math.max(0, Number(host[bucket][id] || 0) - 1);
    });
  }

  function spellCooldownRemaining(spellId) {
    return cooldownRemaining("spellCooldowns", spellId);
  }

  function beginSpellCooldown(spell) {
    if (!spell) return;
    const jobReduction = state.adventurer.jobId === "mage" ? 1 : 0;
    beginCooldown("spellCooldowns", spell.id, Number(spell.cooldown || 2) - jobReduction);
  }

  function tickSpellCooldowns(host) {
    tickCooldownBucket(host, "spellCooldowns");
  }

  function jobSkillCooldownRemaining(skillId) {
    return cooldownRemaining("jobSkillCooldowns", skillId);
  }

  function beginJobSkillCooldown(skill) {
    if (!skill?.cooldown) return;
    beginCooldown("jobSkillCooldowns", skill.id, skill.cooldown);
  }

  function tickJobSkillCooldowns(host) {
    tickCooldownBucket(host, "jobSkillCooldowns");
  }

  function pushEnemyAwayFromPlayer(enemy, distance = 1) {
    const host = state.arena || state.dungeon;
    if (!host || !enemy) return { moved: 0, blocked: false };
    const dx = Math.sign(enemy.x - host.player.x);
    const dy = Math.sign(enemy.y - host.player.y);
    let moved = 0;
    let blockedAtEdge = false;
    for (let step = 0; step < distance; step += 1) {
      const x = enemy.x + dx;
      const y = enemy.y + dy;
      const blocked = state.arena
        ? arenaBlocked(state.arena, x, y) || (state.arena.player.x === x && state.arena.player.y === y)
        : !canEnemyMove(enemy, x, y);
      if (blocked) {
        blockedAtEdge = true;
        break;
      }
      enemy.x = x;
      enemy.y = y;
      moved += 1;
    }
    return { moved, blocked: blockedAtEdge };
  }

  function applyRangedJobSkillEffect(enemy, skill, outcome) {
    if (!enemy?.alive || enemy.hp <= 0 || !skill || !outcome?.hitCount) return;
    if (skill.tag === "psy") {
      const push = pushEnemyAwayFromPlayer(enemy, 2);
      if (push.blocked) {
        const collision = Math.max(1, Math.round(getPlayerStats().attackMax * 0.7));
        enemy.hp -= collision;
        log(`${enemy.name}が壁際へ叩きつけられ、衝突で${collision}ダメージ。`);
        playSfx("knockback");
        if (enemy.hp <= 0 && enemy.alive && !state.arena) defeatEnemy(enemy, { leaveCorpse: true });
      } else log(`${enemy.name}を念動衝撃で${push.moved}マス吹き飛ばした。`);
    } else if (skill.tag === "shadow_assassination") {
      enemy.spellBoundTurns = Math.max(3, Number(enemy.spellBoundTurns || 0));
      log(`${enemy.name}の影を地面へ縫い止め、3世界ターン移動を封じた。`);
    } else if (skill.tag === "piercing_arrow" && state.dungeon) {
      const player = state.dungeon.player;
      const vx = enemy.x - player.x;
      const vy = enemy.y - player.y;
      const targetDot = vx * vx + vy * vy;
      const pierced = state.dungeon.enemies.filter((candidate) => candidate.alive && candidate !== enemy
        && vx * (candidate.y - player.y) === vy * (candidate.x - player.x)
        && vx * (candidate.x - player.x) + vy * (candidate.y - player.y) > targetDot
        && chebyshevDistance(candidate, enemy) <= 3).sort((a, b) => chebyshevDistance(a, enemy) - chebyshevDistance(b, enemy))[0];
      if (pierced) {
        const damage = Math.max(1, Math.round(outcome.total * 0.45));
        pierced.hp -= damage;
        log(`貫通矢が背後の${pierced.name}まで射抜き、${damage}ダメージ。`);
        if (pierced.hp <= 0 && pierced.alive) defeatEnemy(pierced, { experienceMultiplier: 0.75 });
      }
    }
  }

  function applySpellEffect(enemy, spell, outcome) {
    if (!enemy?.alive || enemy.hp <= 0 || !spell || !outcome?.hitCount) return;
    const effect = spell.effect;
    let applied = true;
    if (effect === "burn") enemy.regenerationWeakenedTurns = Math.max(4, Number(enemy.regenerationWeakenedTurns || 0));
    else if (effect === "dampen") enemy.spellDampenedTurns = Math.max(3, Number(enemy.spellDampenedTurns || 0));
    else if (effect === "stun") {
      applied = Math.random() < 0.38;
      if (applied) enemy.spellStunnedTurns = Math.max(1, Number(enemy.spellStunnedTurns || 0));
    }
    else if (effect === "slow") enemy.spellSlowedTurns = Math.max(4, Number(enemy.spellSlowedTurns || 0));
    else if (effect === "knockback") pushEnemyAwayFromPlayer(enemy, 2);
    else if (effect === "corrode") {
      enemy.spellArmorBreak = Math.max(Number(enemy.spellArmorBreak || 0), Math.max(2, Math.ceil(enemy.defense * 0.35)));
      enemy.spellArmorBreakTurns = Math.max(6, Number(enemy.spellArmorBreakTurns || 0));
    }
    else if (effect === "bind") enemy.spellBoundTurns = Math.max(3, Number(enemy.spellBoundTurns || 0));
    else if (effect === "confuse") enemy.spellConfusedTurns = Math.max(5, Number(enemy.spellConfusedTurns || 0));
    else if (effect === "curse") enemy.spellCursedTurns = Math.max(5, Number(enemy.spellCursedTurns || 0));
    else if (effect === "black_sun") {
      enemy.regenerationSuppressedTurns = Math.max(8, Number(enemy.regenerationSuppressedTurns || 0));
      enemy.spellArmorBreak = Math.max(Number(enemy.spellArmorBreak || 0), Math.max(3, Math.ceil(enemy.defense * 0.25)));
      enemy.spellArmorBreakTurns = Math.max(8, Number(enemy.spellArmorBreakTurns || 0));
    } else if (effect === "erase") {
      enemy.regenerationSuppressedTurns = Math.max(10, Number(enemy.regenerationSuppressedTurns || 0));
      enemy.spellArmorBreak = Math.max(Number(enemy.spellArmorBreak || 0), Math.max(4, Math.ceil(enemy.defense * 0.5)));
      enemy.spellArmorBreakTurns = Math.max(10, Number(enemy.spellArmorBreakTurns || 0));
      enemy.spellConfusedTurns = Math.max(6, Number(enemy.spellConfusedTurns || 0));
    }
    else if (!["holy", "pierce", "shatter"].includes(effect)) applied = false;
    const effectLabels = { burn: "再生弱化", dampen: "攻撃減衰", stun: "感電", slow: "鈍化", knockback: "吹き飛ばし", corrode: "防御侵食", bind: "影縛り", confuse: "幻惑", curse: "被害増幅", black_sun: "再生封印", erase: "真名崩壊" };
    if (applied && effectLabels[effect]) log(`${spell.name}の追加効果「${effectLabels[effect]}」が${enemy.name}へ刻まれた。`);
  }

  function hasLineOfSight(x0, y0, x1, y1) {
    return gridLineOfSight(
      { x: x0, y: y0 },
      { x: x1, y: y1 },
      (x, y) => state.dungeon.map[y]?.[x] === "wall",
    );
  }

  function rangedAttackEnemy(enemy) {
    if (!enemy?.alive || !rangedAttackStatus(enemy).available) return;
    closeMonsterInfo();
    markResearch(enemy.id, 1);
    enemy.alertedTurns = Math.max(Number(enemy.alertedTurns || 0), 6);
    ensureUniqueEncounterSpeech(enemy);
    log(`${enemy.name}へ遠隔攻撃を放った。`);
    const result = playerAttack(enemy, "ranged");
    finishDungeonAttack(enemy, result);
  }

  function useJobSkillAt(enemy) {
    const status = jobSkillAttackStatus(enemy);
    if (!enemy?.alive || !status.available) {
      log(`職業技を使えない。${status.reason || "対象がいない"}。`);
      playSfx("warning");
      render();
      return false;
    }
    jobSkillTargetArmed = false;
    closeMonsterInfo();
    markResearch(enemy.id, 1);
    enemy.alertedTurns = Math.max(Number(enemy.alertedTurns || 0), 8);
    ensureUniqueEncounterSpeech(enemy);
    log(`${enemy.name}へ職業技「${status.skill.name}」を使った。`);
    const result = playerAttack(enemy, "skill");
    beginJobSkillCooldown(status.skill);
    applyRangedJobSkillEffect(enemy, status.skill, result);
    finishDungeonAttack(enemy, result);
    return true;
  }

  function castActiveSpellAt(enemy) {
    const status = activeSpellAttackStatus(enemy);
    if (!enemy?.alive || !status.available) {
      log(`魔法を放てない。${status.reason || "対象がいない"}。`);
      playSfx("warning");
      render();
      return false;
    }
    spellTargetArmed = false;
    closeMonsterInfo();
    markResearch(enemy.id, 1);
    enemy.alertedTurns = Math.max(Number(enemy.alertedTurns || 0), 8);
    ensureUniqueEncounterSpeech(enemy);
    log(`${enemy.name}へ${spellbookRankLabel(status.spell.rank)}魔法「${status.spell.name}」を放った。`);
    const result = playerAttack(enemy, "spell", status.spell);
    beginSpellCooldown(status.spell);
    applySpellEffect(enemy, status.spell, result);
    finishDungeonAttack(enemy, result);
    return true;
  }

  function lootHint(enemy) {
    const hints = enemy.loot.map((rule) => {
      const material = materials[rule.material].name;
      if (rule.condition === "default") return `通常:${material}`;
      if (rule.condition.lastAttribute) return `${attr(rule.condition.lastAttribute)}:${material}`;
      if (rule.condition.notLastAttribute) return `${attr(rule.condition.notLastAttribute)}以外:${material}`;
      if (rule.condition.lastSkill) return `${skillName(rule.condition.lastSkill)}:${material}`;
      return material;
    });
    if (enemy.exceptionalLoot) {
      hints.push(`超レア抽選: ${materials[enemy.exceptionalLoot.super].name}（基礎1.5%）`);
      hints.push(`ウルトラレア抽選: ${materials[enemy.exceptionalLoot.ultra].name}（基礎0.15%）`);
      hints.push("弱点・精密撃破、ユニーク、上位色、運で確率上昇");
    }
    return hints;
  }

  function skillName(tag) {
    const found = DATA.jobs.find((job) => job.skill.tag === tag);
    return found ? found.skill.name : tag;
  }

  function enemiesWander() {
    maybeSpawnMonster();
    const activeEnemies = state.dungeon.enemies.filter((enemy) => enemy.alive);
    activeEnemies.filter((enemy) => enemy.flowerPet).forEach(flowerPetAct);
    for (const enemy of activeEnemies) {
      if (!state.dungeon || !state.adventurer.inDungeon || state.adventurer.hp <= 0) return;
      if (!enemy.alive || enemy.flowerPet) continue;
      if (isConcealedSpecialResident(enemy)) continue;
      if (Number(enemy.specialRoomGraceTurns || 0) > 0) {
        enemy.specialRoomGraceTurns = Math.max(0, Number(enemy.specialRoomGraceTurns || 0) - 1);
        continue;
      }
      if (enemy.asleep) {
        const sleepDistance = chebyshevDistance(enemy, state.dungeon.player);
        const wakeChance = sleepDistance <= 1 ? 0.28 : 0.01;
        if (Math.random() >= wakeChance) continue;
        enemy.asleep = false;
        if (sleepDistance <= 6) log(`${enemy.name}が物音に気づいて目を覚ました。`);
      }
      const spellSlowed = Number(enemy.spellSlowedTurns || 0) > 0;
      if (spellSlowed) enemy.spellSlowedTurns -= 1;
      const effectiveAcceleration = spellSlowed ? 0 : Number(enemy.acceleration || 0);
      const actions = 1 + Math.floor(Math.max(0, effectiveAcceleration) / 12);
      for (let action = 0; action < actions; action += 1) {
        if (!state.dungeon || !state.adventurer.inDungeon || !enemy.alive || state.adventurer.hp <= 0) break;
        const dx = Math.abs(enemy.x - state.dungeon.player.x);
        const dy = Math.abs(enemy.y - state.dungeon.player.y);
        const dist = Math.max(dx, dy);
        if (dist <= 1) {
          if (enemyTurn(enemy) === "telegraphed") break;
          continue;
        }
        if (Number(enemy.spellBoundTurns || 0) > 0) {
          enemy.spellBoundTurns -= 1;
          continue;
        }
        if (enemy.specialAttack === "ranged" && dist <= 6
          && hasLineOfSight(enemy.x, enemy.y, state.dungeon.player.x, state.dungeon.player.y)
          && Math.random() < 0.35) {
          enemyAttack(enemy, "遠隔攻撃", enemy.attackAttribute, enemy.attack, { trials: 2 });
          continue;
        }
        const alerted = Number(enemy.alertedTurns || 0) > 0;
        if (alerted) enemy.alertedTurns -= 1;
        const fleeing = Number(enemy.fleeingTurns || 0) > 0;
        if (fleeing) enemy.fleeingTurns -= 1;
        const pursuitChance = fleeing ? 1 : alerted ? 0.98 : dist <= 10 ? 0.92 : 0.18;
        if (Math.random() > pursuitChance) continue;
        const options = [];
        for (let stepY = -1; stepY <= 1; stepY += 1) {
          for (let stepX = -1; stepX <= 1; stepX += 1) {
            if (!stepX && !stepY) continue;
            const pos = { x: enemy.x + stepX, y: enemy.y + stepY };
            if (canEnemyMove(enemy, pos.x, pos.y)) options.push(pos);
          }
        }
        options.sort((a, b) => {
          const distanceA = chebyshevDistance(a, state.dungeon.player);
          const distanceB = chebyshevDistance(b, state.dungeon.player);
          return fleeing ? distanceB - distanceA : distanceA - distanceB;
        });
        if (options.length) {
          const targetDistance = chebyshevDistance(options[0], state.dungeon.player);
          const bestOptions = options.filter((pos) => chebyshevDistance(pos, state.dungeon.player) === targetDistance);
          const next = pick(bestOptions);
          enemy.x = next.x;
          enemy.y = next.y;
          if (alerted || enemy.dialogueState?.stages?.encounter) uniqueSpeak(enemy, "move", { chance: 0.46 });
        }
      }
    }
    applyEnemyRapidRegeneration(activeEnemies);
    applyRegeneration();
  }

  function applyEnemyRapidRegeneration(enemies) {
    (enemies || []).forEach((enemy) => {
      if (!enemy?.alive || enemy.flowerPet || !enemy.rapidRegeneration || enemy.hp <= 0) return;
      const injured = enemy.hp < enemy.maxHp;
      if (Number(enemy.regenerationSuppressedTurns || 0) > 0) {
        enemy.regenerationSuppressedTurns -= 1;
        const nearby = state.arena || (state.dungeon && chebyshevDistance(enemy, state.dungeon.player) <= 6);
        if (injured && nearby) log(`${enemy.name}の急速再生は封じられている。傷口から火花だけが散った。`);
        return;
      }
      const weakened = Number(enemy.regenerationWeakenedTurns || 0) > 0;
      if (weakened) enemy.regenerationWeakenedTurns -= 1;
      if (!injured) return;
      const amount = Math.max(1, Math.ceil(enemy.maxHp * Number(enemy.rapidRegeneration.rate || 0) * (weakened ? 0.5 : 1)));
      const healed = Math.min(amount, enemy.maxHp - enemy.hp);
      enemy.hp += healed;
      const nearby = state.arena || (state.dungeon && chebyshevDistance(enemy, state.dungeon.player) <= 6);
      if (nearby) {
        log(`${enemy.name}の急速再生。傷が逆再生し、HPを${healed}回復した！${weakened ? " 毒により回復量半減。" : ""}`);
        playSfx("regenerate");
      }
    });
  }

  function applyRegeneration() {
    const activeBattle = (state.adventurer.inDungeon && state.dungeon) || state.arena;
    if (!activeBattle || state.adventurer.hp <= 0) return;
    const stats = getPlayerStats();
    if (!stats.hpRegen) return;
    if (stats.hpRegen < 0) {
      const damage = Math.abs(Math.round(stats.hpRegen));
      state.adventurer.hp -= damage;
      log(`呪われた装備が生命力を吸い、${damage}ダメージを受けた。`);
      if (state.adventurer.hp <= 0) die("アーティファクトの呪い");
      return;
    }
    if (state.adventurer.hp >= stats.maxHp) return;
    const before = state.adventurer.hp;
    state.adventurer.hp = Math.min(stats.maxHp, state.adventurer.hp + stats.hpRegen);
    const healed = state.adventurer.hp - before;
    if (healed > 0) log(`再生装備がHPを${healed}回復した。`);
  }

  function advanceWorldIfDue() {
    if (!state.dungeon || !state.adventurer.inDungeon) return false;
    state.dungeon.enemies.forEach(tickUniqueSpeech);
    const actionsPerTurn = 1 + Math.floor(Math.max(0, getPlayerStats().acceleration) / 10);
    state.dungeon.actionProgress = Number(state.dungeon.actionProgress || 0) + 1;
    if (state.dungeon.actionProgress < actionsPerTurn) return false;
    state.dungeon.actionProgress = 0;
    const cooldowns = state.dungeon.teleportCooldowns;
    if (cooldowns) {
      cooldowns.long = Math.max(0, Number(cooldowns.long || 0) - 1);
    }
    state.dungeon.timeStopCooldown = Math.max(0, Number(state.dungeon.timeStopCooldown || 0) - 1);
    state.dungeon.healCooldown = Math.max(0, Number(state.dungeon.healCooldown || 0) - 1);
    tickSpellCooldowns(state.dungeon);
    tickJobSkillCooldowns(state.dungeon);
    state.adventurer.slowTurns = Math.max(0, Number(state.adventurer.slowTurns || 0) - 1);
    if (state.adventurer.immobilizedTurns > 0) {
      state.adventurer.immobilizedTurns -= 1;
      if (state.adventurer.immobilizedTurns === 0) log("トラバサミの拘束を振りほどき、再び移動できるようになった。");
    }
    tickIntoxication();
    tickSnackBuff();
    if (state.dungeon.timeStopTurns > 0) {
      state.dungeon.timeStopTurns -= 1;
      applyRegeneration();
      log("停止した時間の中で、敵だけが動けない。 ");
      return true;
    }
    enemiesWander();
    return true;
  }

  function maybeSpawnMonster() {
    if (!state.dungeon || !state.adventurer.inDungeon) return;
    state.dungeon.turnsElapsed = Number(state.dungeon.turnsElapsed || 0) + 1;
    const swarm = ["swarm", "pandemonium"].includes(state.dungeon.anomaly?.id);
    const interval = swarm ? 5 : 8;
    const chance = swarm ? 0.58 : 0.36;
    if (state.dungeon.turnsElapsed % interval !== 0 || Math.random() >= chance) return;
    const floor = floorByNumber[state.adventurer.floor];
    const aliveCount = state.dungeon.enemies.filter((enemy) => enemy.alive).length;
    const spawnCap = dungeonEnemySpawnLimit(floor);
    if (aliveCount >= spawnCap) return;
    const pos = window.HD_DUNGEON.spawnPosition(state.dungeon, 9);
    if (!pos) return;
    let monsterId = pick(floor.monsterPool);
    let unique = false;
    const deepUniqueReinforcementChance = Math.min(0.42, 0.08 + Math.max(0, Number(floor.floor || 1) - 40) * 0.006);
    if (!state.dungeon.uniqueSpawned && floor.uniques?.length && Math.random() < deepUniqueReinforcementChance) {
      monsterId = pick(floor.uniques);
      unique = true;
      state.dungeon.uniqueSpawned = true;
    }
    const enemy = createEnemy(monsterId, pos, unique);
    state.dungeon.enemies.push(enemy);
    log(unique ? `遠くで異様な気配が目覚めた。ユニークモンスターが出現した。` : "遠くの暗がりから新たな魔物の気配が現れた。");
  }

  function dungeonEnemySpawnLimit(floor) {
    const densitySpawnCap = Math.max(0, Number(state.dungeon?.enemySpawnCap ?? floor?.spawnCap ?? 0));
    const swarm = ["swarm", "pandemonium"].includes(state.dungeon?.anomaly?.id);
    return swarm ? Math.max(densitySpawnCap, Number(floor?.spawnCap || 0)) : densitySpawnCap;
  }

  function canEnemyMove(moving, x, y) {
    const size = state.dungeon.map.length;
    if (!state.dungeon.map[y] || x <= 0 || y <= 0 || x >= size - 1 || y >= size - 1) return false;
    const tile = state.dungeon.map[y][x];
    if (tile !== "floor" && !(moving.canPhaseWalls && tile === "wall")) return false;
    if (state.dungeon.player.x === x && state.dungeon.player.y === y) return false;
    return !state.dungeon.enemies.some((enemy) => enemy !== moving && enemy.alive && enemy.x === x && enemy.y === y);
  }

  function askConfirm(title, text, onOk, onCancel = null, labels = {}) {
    pendingConfirm = onOk;
    pendingConfirmCancel = onCancel;
    els.confirmTitle.textContent = title;
    els.confirmText.textContent = text;
    els.confirmOk.textContent = labels.ok || "実行";
    els.confirmCancel.textContent = labels.cancel || "戻る";
    els.confirmPanel.classList.remove("hidden");
  }

  function closeConfirm() {
    pendingConfirm = null;
    pendingConfirmCancel = null;
    els.confirmOk.textContent = "実行";
    els.confirmCancel.textContent = "戻る";
    els.confirmPanel.classList.add("hidden");
  }

  function cancelConfirm() {
    const action = pendingConfirmCancel;
    closeConfirm();
    if (action) action();
  }

  // Music playback and the game-facing sound-effects bridge.
  function setupAudio() {
    const tracks = Object.fromEntries(Object.entries(BGM_TRACKS).map(([scene, source]) => [scene, new Audio(source)]));
    Object.entries(tracks).forEach(([scene, track]) => {
      track.loop = true;
      track.preload = scene === "town" ? "auto" : "metadata";
      track.volume = MUSIC_VOLUME;
    });
    audio = {
      context: null,
      master: null,
      sfx: null,
      tracks,
      currentTrack: null,
      musicFadeTimer: null,
      musicBlocked: false,
      tensionLevel: 1,
      enabled: localStorage.getItem(AUDIO_KEY) !== "0",
      started: false,
      scene: "silent",
    };
    updateAudioButton();
  }

  function toggleAudio() {
    if (state.adventurer.inDungeon || currentView === "arena") return;
    if (!audio.enabled) {
      audio.enabled = true;
      localStorage.setItem(AUDIO_KEY, "1");
      ensureAudio();
      playStartupSound();
      updateAudioScene(true);
      playSfx("select");
    } else if (!audio.started) {
      ensureAudio();
      playStartupSound();
      updateAudioScene(true);
      playSfx("select");
    } else {
      audio.enabled = false;
      localStorage.setItem(AUDIO_KEY, "0");
      stopMusic();
    }
    updateAudioButton();
  }

  function startAudioFromGesture() {
    if (!audio.enabled) return;
    const wasStarted = audio.started;
    ensureAudio();
    if (!wasStarted && audio.started) playStartupSound();
    updateAudioScene();
    updateAudioButton();
  }

  function ensureAudio() {
    if (!audio.enabled) return false;
    if (!audio.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        audio.enabled = false;
        updateAudioButton();
        return false;
      }
      audio.context = new AudioContext();
      audio.master = audio.context.createGain();
      audio.sfx = audio.context.createGain();
      audio.master.gain.value = 0.85;
      audio.sfx.gain.value = 0.82;
      audio.sfx.connect(audio.master);
      audio.master.connect(audio.context.destination);
      sfxPlayer = SFX.create(audio.context, audio.sfx);
    }
    if (audio.context.state === "suspended") audio.context.resume();
    audio.started = true;
    return true;
  }

  function updateAudioButton() {
    if (!els.audioButton) return;
    els.audioButton.classList.toggle("is-on", audio && audio.enabled);
    els.audioButton.setAttribute("aria-pressed", String(Boolean(audio && audio.enabled)));
    els.audioIcon.textContent = audio && audio.enabled ? "♫" : "♪";
    els.audioText.textContent = audio && audio.enabled ? (audio.started ? "ON" : "再生") : "OFF";
  }

  function playStartupSound() {
    playSfx("startup");
  }

  function currentDungeonTension() {
    if (!state.adventurer.inDungeon || !state.dungeon) return THREAT.LEVELS[0];
    const floor = floorByNumber[state.adventurer.floor];
    const revealedDungeon = {
      ...state.dungeon,
      enemies: state.dungeon.enemies.filter((enemy) => !isConcealedSpecialResident(enemy)),
    };
    return THREAT.assess(DATA, floor, revealedDungeon, getPlayerStats().canSeeInvisible);
  }

  function updateAudioScene(force) {
    if (!audio || !audio.enabled || !audio.started) return;
    if (audio.musicBlocked) return;
    let scene = currentView === "arena" && state.arena
      ? (state.arena.round % 25 === 0 || state.arena.round > ARENA_BATTLE_COUNT - 12 ? "boss" : "battle")
      : "town";
    let tensionLevel = 1;
    if (state.adventurer.inDungeon) {
      const tension = currentDungeonTension();
      tensionLevel = tension.level;
      scene = tension.level === 1
        ? (state.adventurer.floor >= 71 ? "abyss" : state.adventurer.floor >= 31 ? "deep" : "dungeon")
        : `tension${tension.level}`;
    }
    if (tensionLevel > Number(audio.tensionLevel || 1) && tensionLevel >= 3) playSfx(tensionLevel >= 5 ? "boss" : "warning");
    audio.tensionLevel = tensionLevel;
    if (force || scene !== audio.scene) startMusicScene(scene);
  }

  function startMusicScene(scene) {
    const track = audio.tracks[scene] || audio.tracks.town;
    if (!track || (audio.currentTrack === track && !track.paused)) return;
    if (audio.musicFadeTimer) window.clearInterval(audio.musicFadeTimer);
    const previous = audio.currentTrack;
    audio.scene = scene;
    audio.currentTrack = track;
    track.currentTime = 0;
    track.volume = previous ? 0.001 : MUSIC_VOLUME;
    const playback = track.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {
        audio.started = false;
        updateAudioButton();
      });
    }
    if (!previous || previous === track) return;
    let step = 0;
    const steps = 18;
    audio.musicFadeTimer = window.setInterval(() => {
      step += 1;
      const ratio = Math.min(1, step / steps);
      track.volume = 0.001 + (MUSIC_VOLUME - 0.001) * ratio;
      previous.volume = Math.max(0.001, MUSIC_VOLUME * (1 - ratio));
      if (ratio < 1) return;
      window.clearInterval(audio.musicFadeTimer);
      audio.musicFadeTimer = null;
      previous.pause();
      previous.currentTime = 0;
      previous.volume = MUSIC_VOLUME;
    }, 45);
  }

  function stopMusic() {
    if (audio) {
      if (audio.musicFadeTimer) window.clearInterval(audio.musicFadeTimer);
      audio.musicFadeTimer = null;
      Object.values(audio.tracks || {}).forEach((track) => {
        track.pause();
        track.currentTime = 0;
        track.volume = MUSIC_VOLUME;
      });
      audio.currentTrack = null;
      audio.scene = "silent";
    }
  }

  function playCombatSfx(attribute, impact) {
    const sound = DATA.attributes.includes(attribute) ? attribute : "hit";
    playSfx(sound);
    if (impact) playSfx(attribute === "fire" ? "fireHit" : "hit");
  }

  function playSfx(type) {
    if (!audio || !audio.enabled || !audio.started || !audio.context || !sfxPlayer) return;
    sfxPlayer.play(type);
  }

  // Static and delegated input bindings.
  els.tabs.forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.view === "arena" && !arenaUnlocked()) {
      log("修練連武闘技場は封鎖中。地下10階の守護者を倒した冒険者だけが入場できる。");
      playSfx("uiError");
      return;
    }
    if (button.dataset.view === "junkDealer" && !junkDealerUnlocked()) {
      log("珍品偏愛堂はまだ存在しない。地下20階を踏破すれば、ガラクタマニアが噂を聞きつけて現れるらしい。");
      playSfx("uiError");
      return;
    }
    if (button.dataset.view === "dungeon" && !state.adventurer.inDungeon) enterDungeon();
    else switchView(button.dataset.view);
  }));
  els.map.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-enemy-x][data-enemy-y]");
    if (!cell || !state.dungeon) return;
    const x = Number(cell.dataset.enemyX);
    const y = Number(cell.dataset.enemyY);
    const enemy = state.dungeon.enemies.find((candidate) => candidate.alive && candidate.x === x && candidate.y === y);
    if (!enemy) return;
    const distance = chebyshevDistance(enemy, state.dungeon.player);
    if (spellTargetArmed) castActiveSpellAt(enemy);
    else if (jobSkillTargetArmed) useJobSkillAt(enemy);
    else if (distance > 1 && rangedAttackStatus(enemy).available) rangedAttackEnemy(enemy);
    else openMonsterInfo(enemy);
  });
  els.map.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const cell = event.target.closest?.("[data-enemy-x][data-enemy-y]");
    if (!cell) return;
    event.preventDefault();
    cell.click();
  });
  els.monsterInfoClose.addEventListener("click", closeMonsterInfo);
  els.levelUpEffect.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    hideLevelUpEffect();
  });
  els.titleStart.addEventListener("click", startFromTitle);
  document.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => {
      const delta = MOVEMENT_BUTTON_DIRECTIONS[button.dataset.move];
      if (delta) movePlayer(delta[0], delta[1]);
    });
  });
  els.wait.addEventListener("click", () => {
    startAudioFromGesture();
    if (harvestCorpse()) return;
    if (disarmTrap()) return;
    searchForTraps();
  });
  els.teleport.addEventListener("click", teleportRandomly);
  els.timeStop.addEventListener("click", stopTime);
  els.recoveryMedicine?.addEventListener("click", useRecoveryMedicine);
  els.jobSkill?.addEventListener("click", () => {
    const skill = jobs[state.adventurer.jobId]?.skill;
    if (!skill || !state.dungeon) return;
    if (skill.tag === "capoeira_stance") {
      toggleCapoeiraStance(state.dungeon, "dungeon");
      return;
    }
    if (skill.tag === "heal") {
      jobSkillTargetArmed = false;
      useDungeonHealingMagic();
      return;
    }
    jobSkillTargetArmed = !jobSkillTargetArmed;
    if (jobSkillTargetArmed) {
      spellTargetArmed = false;
    }
    log(jobSkillTargetArmed ? `${skill.name}を構えた。光っている射程内の敵を選べ。` : `${skill.name}を取りやめた。`);
    playSfx("uiToggle");
    render();
  });
  els.activeSpell?.addEventListener("click", () => {
    const spell = activeLearnedSpell();
    if (!spell || !spell.jobs.includes(state.adventurer.jobId) || !state.dungeon) return;
    spellTargetArmed = !spellTargetArmed;
    if (spellTargetArmed) {
      jobSkillTargetArmed = false;
    }
    log(spellTargetArmed ? `${spell.name}を構えた。光っている射程内の敵を選べ。` : `${spell.name}の詠唱を取りやめた。`);
    playSfx("uiToggle");
    render();
  });
  els.returnTown.addEventListener("click", returnTown);
  els.audioButton.addEventListener("click", toggleAudio);
  els.confirmOk.addEventListener("click", () => {
    playSfx("uiConfirm");
    const action = pendingConfirm;
    closeConfirm();
    if (action) action();
  });
  els.confirmCancel.addEventListener("click", () => {
    playSfx("uiCancel");
    cancelConfirm();
  });
  els.setupOk.addEventListener("click", confirmSetup);
  els.setupCancel.addEventListener("click", closeSetup);
  els.openRacePicker.addEventListener("click", () => openSetupPicker("race"));
  els.openJobPicker.addEventListener("click", () => openSetupPicker("job"));
  els.openPersonalityPicker.addEventListener("click", () => openSetupPicker("personality"));
  els.adventurerNameInput.addEventListener("input", () => {
    if (pendingSetup) pendingSetup.name = els.adventurerNameInput.value.slice(0, 12);
  });
  els.setupPickerClose.addEventListener("click", closeSetupPicker);
  els.depthPickerClose?.addEventListener("click", closeDepthPicker);
  els.openLogHistory?.addEventListener("click", openLogHistory);
  els.closeLogHistory?.addEventListener("click", () => closeLogHistory());
  els.continueAfterDeath?.addEventListener("click", continueAfterDeath);
  document.querySelector("#closeDeveloperPanelButton")?.addEventListener("click", () => document.querySelector("#developerPanel")?.classList.add("hidden"));
  document.addEventListener("pointerdown", (event) => {
    if (event.target && event.target.closest && event.target.closest("#audioButton")) return;
    startAudioFromGesture();
  });
  document.addEventListener("change", (event) => {
    if (event.target?.matches?.("select")) playSfx("uiFilter");
  });
  document.addEventListener("click", (event) => {
    const button = event.target?.closest?.("[data-shop-page], [data-research-page]");
    if (button && !button.disabled) playSfx("uiPage");
  });
  document.addEventListener("keydown", (event) => {
    const developerPanel = document.querySelector("#developerPanel");
    if (event.key === "Escape" && developerPanel && !developerPanel.classList.contains("hidden")) {
      event.preventDefault();
      developerPanel.classList.add("hidden");
      document.querySelector("#openDeveloperPanelButton")?.focus();
      return;
    }
    if (event.key === "Escape" && !els.logHistoryPanel.classList.contains("hidden")) {
      event.preventDefault();
      closeLogHistory();
      return;
    }
    if (trapModalFocus(event)) return;
    if (event.isComposing || event.target?.closest?.("input, select, textarea, [contenteditable='true']")) return;
    startAudioFromGesture();
    const delta = MOVEMENT_KEY_DIRECTIONS[event.key];
    const arenaMovement = currentView === "arena" && state.arena && !state.arena.awaitingNext;
    const dungeonMovement = currentView === "dungeon" && state.adventurer.inDungeon && state.dungeon;
    if (!delta || (!arenaMovement && !dungeonMovement)) return;
    const overlayOpen = Boolean(
      pendingConfirm
      || !els.monsterInfoPanel.classList.contains("hidden")
      || !els.confirmPanel.classList.contains("hidden")
      || !els.setupPanel.classList.contains("hidden")
      || !els.setupPickerPanel.classList.contains("hidden")
      || !els.depthPickerPanel.classList.contains("hidden")
      || !els.deathReviewPanel.classList.contains("hidden")
      || !els.logHistoryPanel.classList.contains("hidden")
      || (developerPanel && !developerPanel.classList.contains("hidden"))
    );
    if (overlayOpen) return;
    event.preventDefault();
    if (arenaMovement) arenaMove(delta[0], delta[1]);
    else movePlayer(delta[0], delta[1]);
  });

  reconcileResearchCompletion(true);
  setupAudio();
  buildMapCells();
  switchView(currentView);
  if (state.meta.pendingDeathReview) {
    openDeathReview(state.meta.pendingDeathReview.reason, state.meta.pendingDeathReview.log);
  } else {
    showTitleScreen();
  }
})();
