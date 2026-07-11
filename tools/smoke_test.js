ObjC.import("Foundation");

function read(path) {
  return ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(
    path,
    $.NSUTF8StringEncoding,
    null,
  ));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const scriptFiles = [
  "data/materials.js",
  "data/races.js",
  "data/jobs.js",
  "data/personalities.js",
  "data/equipment.js",
  "data/treasures.js",
  "data/monsters.js",
  "data/floors.js",
  "js/unique-dialogue.js",
  "js/utils.js",
  "js/threat-system.js",
  "js/dungeon-generator.js",
  "js/economy.js",
  "js/character-system.js",
  "js/bounty-system.js",
  "js/audio-effects.js",
  "js/main.js",
];

scriptFiles.forEach((path) => new Function(read(path)));

const styleSource = read("css/style.css");
const mainSource = read("js/main.js");
const indexSource = read("index.html");
assert(!/\.enemy-fire\s*\{[^}]*background/.test(styleSource), "monster attribute color still changes the background");
const arenaFoeRule = styleSource.match(/\.arena-foe\s*\{[^}]*\}/)?.[0] || "";
assert(arenaFoeRule.includes("color: hsl(var(--arena-marker-hue)"), "arena marker text color is missing");
assert(arenaFoeRule.includes("background: rgba(94, 70, 52, 0.18)"), "arena monster background is not shared");
assert(!styleSource.includes(".arena-actions"), "arena floating action panel still exists");
assert(styleSource.includes("grid-template-columns: repeat(13, var(--tile))"), "dungeon viewport is not 13 columns");
assert(styleSource.includes(".map::after") && styleSource.includes("pointer-events: none"), "dungeon light-source overlay is missing");
assert(styleSource.includes("#dungeonView") && styleSource.includes("overflow-y: auto"), "narrow dungeon view cannot scroll");
assert(indexSource.includes('id="jobSkillButton"'), "dungeon job skill control is missing");
assert(indexSource.includes('id="liveLogAnnouncer"') && indexSource.includes('role="log"'), "accessible incremental log announcer is missing");
assert(mainSource.includes('id="arenaSkillButton"'), "arena job skill control is missing");
assert(mainSource.includes("enemy.unique ? [3, 5]") && mainSource.includes(": [1, 2]"), "harvest count ranges are missing");
assert(!mainSource.includes("残り${corpse.harvestsRemaining}回"), "harvest count is exposed to the player");
assert(mainSource.includes("Math.random() < 0.21"), "trap frequency was not increased");

var window = {};
[
  "data/materials.js",
  "data/races.js",
  "data/jobs.js",
  "data/personalities.js",
  "data/equipment.js",
  "data/treasures.js",
  "data/monsters.js",
  "data/floors.js",
  "js/unique-dialogue.js",
  "js/utils.js",
  "js/threat-system.js",
  "js/dungeon-generator.js",
  "js/economy.js",
  "js/character-system.js",
  "js/bounty-system.js",
  "js/audio-effects.js",
].forEach((path) => eval(read(path)));

assert(window.HD_DATA.monsters.length === 949, "monster count changed");
assert(window.HD_DATA.equipment.length === 1224, "equipment count changed");
assert(window.HD_DATA.equipment.every((item) => Array.isArray(item.attackAttributes)), "equipment attackAttributes were not normalized");
assert(window.HD_DATA.equipment.some((item) => item.attackAttributes.length >= 2), "multi-attribute equipment is missing");
const chestArtifacts = window.HD_DATA.equipment.filter((item) => item.artifact?.chestOnly);
assert(chestArtifacts.length === 20, "artifact catalog count changed");
assert(["joke", "trash", "ordinary", "useful", "cheat"].every((tier) => chestArtifacts.filter((item) => item.artifact.tier === tier).length === 4), "artifact tiers are not evenly represented");
assert(chestArtifacts.filter((item) => item.curse).length >= 15, "artifacts are not often cursed");
assert(chestArtifacts.every((item) => item.artifact.guildPoints > 0), "an artifact has no guild point value");
assert(window.HD_DATA.spellbookRanks.length === 5, "spellbook rank count changed");
assert(window.HD_DATA.spellbookRanks.every((rank, index, ranks) => index === 0 || (rank.rarityWeight < ranks[index - 1].rarityWeight && rank.minFloor > ranks[index - 1].minFloor)), "higher spellbook ranks are not progressively rarer");
assert(window.HD_DATA.spells.length === 15 && window.HD_DATA.spellbooks.length === 15, "spell/spellbook catalog count changed");
assert(window.HD_DATA.spells.every((spell) => spell.range >= 1 && spell.range <= 6), "a spell range exceeds the visible targeting radius");
assert(window.HD_DATA.junkItems.length === 15, "junk catalog count changed");
assert(new Set(window.HD_DATA.monsters.map((monster) => monster.id)).size === window.HD_DATA.monsters.length, "monster id collision");
assert(new Set(window.HD_DATA.monsters.filter((monster) => monster.unique).map((monster) => monster.name)).size === 580, "unique monster name collision");
assert(window.HD_DATA.monsters.every((monster) => window.HD_DATA.attributes.includes(monster.attackAttribute)), "monster has an invalid attack attribute");
assert(window.HD_DATA.monsters.every((monster) => !monster.dangerous || window.HD_DATA.attributes.includes(monster.dangerous.attribute)), "monster has an invalid dangerous attribute");
const materialIds = new Set(window.HD_DATA.materials.map((material) => material.id));
assert(window.HD_DATA.monsters.every((monster) => monster.loot.every((rule) => materialIds.has(rule.material))), "monster references an invalid material");
const monsterIds = new Set(window.HD_DATA.monsters.map((monster) => monster.id));
assert(window.HD_DATA.floors.every((floor) => floor.monsterPool.every((id) => monsterIds.has(id))), "floor references an invalid regular monster");
assert(window.HD_DATA.floors.every((floor) => floor.uniques.every((id) => monsterIds.has(id))), "floor references an invalid unique monster");
assert(window.HD_DATA.monsters.every((monster) => (
  [1, 2, 3, 4, 5].every((level) => typeof monster.research[level] === "string")
)), "a monster is missing a research stage");
const uniqueMonsters = window.HD_DATA.monsters.filter((monster) => monster.unique);
const harvestRichMonsters = window.HD_DATA.monsters.filter((monster) => monster.rewardProfile?.tag === "harvest-rich");
const experienceRichMonsters = window.HD_DATA.monsters.filter((monster) => monster.rewardProfile?.tag === "exp-rich");
assert(harvestRichMonsters.length >= 12 && harvestRichMonsters.every((monster) => monster.rewardProfile.harvestQuantity >= 2), "harvest-rich monsters are missing or under-rewarded");
assert(experienceRichMonsters.length >= 10 && experienceRichMonsters.every((monster) => monster.rewardProfile.experienceMultiplier >= 2), "experience-rich monsters are missing or under-rewarded");
const arenaMonsters = uniqueMonsters.filter((monster) => monster.arenaOnly);
const dungeonUniques = uniqueMonsters.filter((monster) => !monster.arenaOnly);
const transferredUniques = dungeonUniques.filter((monster) => Number.isFinite(monster.migratedFromArenaRank));
const expansionUniques = dungeonUniques.filter((monster) => monster.dungeonExpansion);
assert(uniqueMonsters.length === 580, "unique monster count changed");
assert(arenaMonsters.length === 192, "arena roster must contain 192 uniques");
assert(new Set(arenaMonsters.map((monster) => monster.mapMarker)).size === arenaMonsters.length, "arena kana markers are not unique");
assert(arenaMonsters.every((monster) => /^[\u3041-\u3096\u30a1-\u30fa\u31f0-\u31ff]$/u.test(monster.mapMarker)), "arena monster marker is not one kana character");
assert(arenaMonsters.slice(0, 90).every((monster) => /^[\u30a1-\u30fa]$/u.test(monster.mapMarker)), "katakana was not used before hiragana");
assert(arenaMonsters.slice(90, 176).every((monster) => /^[\u3041-\u3096]$/u.test(monster.mapMarker)), "hiragana fallback range is invalid");
assert(new Set(arenaMonsters.map((monster) => `${monster.mapMarker}:${monster.arenaMarkerFamilyHue}`)).size === arenaMonsters.length, "arena katakana/color identities are not unique");
assert(arenaMonsters.every((monster) => Number.isFinite(monster.arenaMarkerHue) && Number.isFinite(monster.arenaMarkerAccentHue)), "arena marker color is missing");
assert(dungeonUniques.length === 388, "dungeon roster must contain 388 uniques");
assert(transferredUniques.length === 150, "150 arena uniques were not transferred");
assert(expansionUniques.length === 200, "200 dungeon uniques were not added");
assert(arenaMonsters.map((monster) => monster.arenaRank).sort((a, b) => a - b).every((rank, index) => rank === index + 1), "arena ranks are not continuous");
assert(transferredUniques.every((monster) => monster.migratedFromArenaRank >= 193 && monster.migratedFromArenaRank <= 342), "transferred arena rank is invalid");
assert(dungeonUniques.every((monster) => monster.floors?.length && monster.floors.every((floor) => floor >= 1 && floor <= 100)), "dungeon unique has no valid floor");
assert(window.HD_DATA.floors.every((floor) => floor.uniques.every((id) => dungeonUniques.some((monster) => monster.id === id))), "floor contains a non-dungeon unique");
assert(Math.max(...window.HD_DATA.floors.map((floor) => floor.uniques.length)) < 120, "weighted unique pool grew unexpectedly large");
assert(window.HD_UNIQUE_DIALOGUE.count === uniqueMonsters.length, "unique dialogue count mismatch");
const dialogueLines = new Set();
uniqueMonsters.forEach((monster) => {
  window.HD_UNIQUE_DIALOGUE.contexts.forEach((context) => {
    const variants = window.HD_UNIQUE_DIALOGUE.variants(monster.id, context);
    assert(variants.length === 4, `${monster.id}/${context} dialogue coverage mismatch`);
    assert(new Set(variants).size === variants.length, `${monster.id}/${context} dialogue repeats internally`);
    variants.forEach((line) => {
      assert(!dialogueLines.has(line), `global dialogue collision: ${line}`);
      dialogueLines.add(line);
    });
  });
});
assert(window.HD_DATA.monsters.every((monster) => !monster.speech), "dialogue was copied into monster records");

const tensionFloor = window.HD_DATA.floors[0];
assert(window.HD_DATA.floors.every((floor) => {
  const normalEnemies = [...new Set(floor.monsterPool)].map((id) => {
    const enemy = JSON.parse(JSON.stringify(window.HD_DATA.monsters.find((monster) => monster.id === id)));
    enemy.maxHp = enemy.hp;
    enemy.alive = true;
    return enemy;
  });
  return window.HD_THREAT.assess(window.HD_DATA, floor, { enemies: normalEnemies }).level === 1;
}), "a normal floor roster raises dungeon tension");
const tensionSource = tensionFloor.monsterPool
  .map((id) => window.HD_DATA.monsters.find((monster) => monster.id === id))
  .sort((left, right) => window.HD_THREAT.score(right) - window.HD_THREAT.score(left))[0];
function scaledThreatEnemy(scale) {
  const enemy = JSON.parse(JSON.stringify(tensionSource));
  enemy.maxHp = Math.round(enemy.hp * scale);
  enemy.hp = enemy.maxHp;
  enemy.attack = Math.round(enemy.attack * scale);
  enemy.defense = Math.round(enemy.defense * scale);
  enemy.acceleration = Math.round(Number(enemy.acceleration || 0) * scale);
  if (enemy.dangerous) enemy.dangerous.power = Math.round(enemy.dangerous.power * scale);
  enemy.alive = true;
  return enemy;
}
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [scaledThreatEnemy(1)] }).level === 1, "normal floor threat is not tension level 1");
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [scaledThreatEnemy(1.3)] }).level === 2, "mild overlevel threat is not tension level 2");
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [scaledThreatEnemy(2)] }).level === 3, "strong overlevel threat is not tension level 3");
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [scaledThreatEnemy(3)] }).level === 4, "severe overlevel threat is not tension level 4");
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [scaledThreatEnemy(4)] }).level === 5, "overwhelming threat is not tension level 5");
const uniqueThreat = scaledThreatEnemy(0.5);
uniqueThreat.unique = true;
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [uniqueThreat] }).level === 2, "unique spawn does not guarantee tension level 2");
uniqueThreat.floorGuardian = true;
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [uniqueThreat] }).level === 4, "floor guardian does not guarantee tension level 4");
const noxThreat = JSON.parse(JSON.stringify(window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox")));
noxThreat.maxHp = noxThreat.hp;
noxThreat.alive = true;
noxThreat.floorGuardian = true;
assert(window.HD_THREAT.assess(window.HD_DATA, window.HD_DATA.floors[99], { enemies: [noxThreat] }).level === 5, "dungeon lord does not trigger tension level 5");

function FakeAudioParam() {
  this.value = 0;
}
FakeAudioParam.prototype.setValueAtTime = function (value) { this.value = value; };
FakeAudioParam.prototype.exponentialRampToValueAtTime = function (value) { this.value = value; };
FakeAudioParam.prototype.linearRampToValueAtTime = function (value) { this.value = value; };

function FakeAudioNode() {
  this.gain = new FakeAudioParam();
  this.frequency = new FakeAudioParam();
  this.detune = new FakeAudioParam();
  this.Q = new FakeAudioParam();
  this.pan = new FakeAudioParam();
  this.threshold = new FakeAudioParam();
  this.knee = new FakeAudioParam();
  this.ratio = new FakeAudioParam();
  this.attack = new FakeAudioParam();
  this.release = new FakeAudioParam();
}
FakeAudioNode.prototype.connect = function () {};
FakeAudioNode.prototype.start = function () {};
FakeAudioNode.prototype.stop = function () {};

function FakeAudioContext() {
  this.currentTime = 1;
  this.sampleRate = 48000;
}
FakeAudioContext.prototype.createGain = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createBiquadFilter = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createDynamicsCompressor = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createConvolver = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createStereoPanner = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createOscillator = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createBufferSource = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createBuffer = function (channels, length) {
  const channelData = Array.from({ length: channels }, () => new Float32Array(length));
  return { getChannelData(index) { return channelData[index]; } };
};

const fakeAudioContext = new FakeAudioContext();
const sfxPlayer = window.HD_SFX.create(fakeAudioContext, new FakeAudioNode());
assert(sfxPlayer.types.length === 57, "sound effect recipe count changed");
sfxPlayer.types.forEach((type) => sfxPlayer.play(type));

function FakeClassList() {
  this.values = new Set();
}
FakeClassList.prototype.add = function (name) {
  this.values.add(name);
};
FakeClassList.prototype.remove = function (name) {
  this.values.delete(name);
};
FakeClassList.prototype.toggle = function (name, force) {
  const enabled = force === undefined ? !this.values.has(name) : Boolean(force);
  if (enabled) this.values.add(name);
  else this.values.delete(name);
  return enabled;
};
FakeClassList.prototype.contains = function (name) {
  return this.values.has(name);
};

function FakeElement() {
  this.classList = new FakeClassList();
  this.dataset = {};
  this.style = {};
  this.listeners = {};
  this.innerHTML = "";
  this.textContent = "";
  this.value = "";
  this.disabled = false;
  this.parentElement = { title: "" };
}
FakeElement.prototype.addEventListener = function (type, listener) {
  this.listeners[type] = listener;
};
FakeElement.prototype.appendChild = function () {};
FakeElement.prototype.setAttribute = function () {};
FakeElement.prototype.removeAttribute = function () {};
FakeElement.prototype.closest = function () { return null; };
FakeElement.prototype.focus = function () {};

const elements = new Map();
const viewTabs = ["town", "dungeon", "research", "guild", "arena"].map((view) => {
  const tab = new FakeElement();
  tab.dataset.view = view;
  return tab;
});
var document = {
  listeners: {},
  querySelector(selector) {
    if (!elements.has(selector)) elements.set(selector, new FakeElement());
    return elements.get(selector);
  },
  querySelectorAll(selector) {
    if (selector === "[data-view]") return viewTabs;
    if (selector === "[data-read-spellbook]") {
      const html = elements.get("#homeView")?.innerHTML || "";
      const ids = [];
      const pattern = /data-read-spellbook="([^"]+)"/g;
      let match;
      while ((match = pattern.exec(html))) ids.push(match[1]);
      return ids.map((id) => {
        const key = `dynamic:read:${id}`;
        if (!elements.has(key)) elements.set(key, new FakeElement());
        const element = elements.get(key);
        element.dataset.readSpellbook = id;
        return element;
      });
    }
    if (selector === "[data-guild-donate]") {
      const html = elements.get("#guildView")?.innerHTML || "";
      const ids = [];
      const pattern = /data-guild-donate="([^"]+)"/g;
      let match;
      while ((match = pattern.exec(html))) ids.push(match[1]);
      return ids.map((id) => {
        const key = `dynamic:donate:${id}`;
        if (!elements.has(key)) elements.set(key, new FakeElement());
        const element = elements.get(key);
        element.dataset.guildDonate = id;
        return element;
      });
    }
    return [];
  },
  createElement() {
    return new FakeElement();
  },
  addEventListener(type, listener) {
    this.listeners[type] = listener;
  },
};

function Audio(source) {
  this.source = source;
  this.loop = false;
  this.preload = "none";
  this.volume = 1;
  this.currentTime = 0;
  this.paused = true;
}
Audio.prototype.play = function () {
  this.paused = false;
  return { catch() {} };
};
Audio.prototype.pause = function () {
  this.paused = true;
};

const legacySave = {
  adventurer: {
    raceId: "human",
    jobId: "swordsman",
    personalityId: "gentle",
    name: "たかし",
    hp: 40,
    maxHp: 40,
    floor: 1,
    deepestFloor: 1,
    inDungeon: false,
    equipment: {
      weapon: "artifact_owner_seeking_boomerang",
      upper: "cloth",
      lower: null,
      feet: null,
      accessory1: null,
      accessory2: null,
    },
    ownedEquipment: ["rusty_knife", "cloth", "artifact_owner_seeking_boomerang", "artifact_invisible_emperor_cloak"],
    materials: {},
    items: { spellbook_ember_shot: 1, junk_bent_spoon: 2 },
    learnedSpells: ["ember_shot"],
    activeSpellId: "ember_shot",
  },
  meta: {
    guildClaims: [{ id: "red_garm", name: "赤熱のガルム", reward: 400 }],
    research: {
      cave_rat: { seen: true, level: 1 },
      carapace_rat: { seen: true, level: 2 },
      poison_bat: { seen: true, level: 3 },
    },
  },
  dungeon: null,
  arena: null,
  log: [],
};

var localStorage = {
  getItem(key) {
    return key === "hagitori-dungeon-save-v1" ? JSON.stringify(legacySave) : null;
  },
  setItem() {},
  removeItem() {},
};

window.setTimeout = function () { return 1; };
window.clearTimeout = function () {};
window.setInterval = function () { return 1; };
window.clearInterval = function () {};

eval(read("js/main.js"));

const researchHtml = elements.get("#researchView").innerHTML;
assert(researchHtml.includes("調査度 1/5"), "legacy level 1 migration failed");
assert(researchHtml.includes("調査度 3/5"), "legacy level 2 migration failed");
assert(researchHtml.includes("調査度 5/5 MAX"), "legacy level 3 migration failed");

elements.get("#openHomeButton").listeners.click();
assert(viewTabs.find((tab) => tab.dataset.view === "town").classList.contains("active"), "town tab is not active inside home");
assert(!viewTabs.some((tab) => tab.dataset.view === "home"), "duplicate home tab remains");
assert(!elements.get("#homeView").classList.contains("hidden"), "home view did not open from town");
assert(elements.get("#townView").classList.contains("hidden"), "town view remained visible over home");
const homeHtml = elements.get("#homeView").innerHTML;
assert(homeHtml.includes("通常攻撃期待値"), "home combat expectation is missing");
assert(homeHtml.includes("初級魔法書「火の粉弾」"), "spellbook shelf is missing");
assert(homeHtml.includes("習得魔法"), "learned spell section is missing");
assert(homeHtml.includes("★持ち主狙いのブーメラン"), "artifact star marker is missing");
assert(homeHtml.includes("呪われている"), "artifact curse label is missing");

viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
assert(elements.get("#guildView").innerHTML.includes("報酬受取"), "guild reward claim section is missing");
assert(elements.get("#guildView").innerHTML.includes("合計400Gを受け取る"), "pending guild reward is missing");
assert(elements.get("#guildView").innerHTML.includes("★王様の透明外套"), "artifact guild turn-in is missing");
elements.get("#claimGuildRewardsButton").listeners.click();
assert(elements.get("#goldText").textContent === 400, "guild reward claim did not pay gold");
assert(elements.get("#guildView").innerHTML.includes("受取可能な報酬はない"), "claimed guild reward remained pending");

viewTabs.find((tab) => tab.dataset.view === "town").listeners.click();
elements.get("#openShopButton").listeners.click();
assert(elements.get("#shopView").innerHTML.includes("宝箱の品を売る"), "treasure selling section is missing");
assert(elements.get("#shopView").innerHTML.includes("装備品<select"), "shop equipment label was not changed");

viewTabs.find((tab) => tab.dataset.view === "research").listeners.click();
assert(elements.get("#researchView").innerHTML.includes("researchQueryInput"), "research search UI is missing");
assert(elements.get("#researchView").innerHTML.includes("完全解析"), "research progress dashboard is missing");

viewTabs.find((tab) => tab.dataset.view === "arena").listeners.click();
elements.get("#arenaStartButton").listeners.click();
const appShell = elements.get("#appShell");
const arenaHtml = elements.get("#arenaView").innerHTML;
assert(appShell.classList.contains("arena-mode"), "arena mode was not activated");
assert(!appShell.classList.contains("town-mode"), "town mode remained active during arena battle");
assert(arenaHtml.includes("arena-floor-line"), "compact arena header is missing");
assert(arenaHtml.includes("arena-move-pad"), "arena movement pad is missing");
assert(arenaHtml.includes("第1戦 / 192"), "reduced arena battle count is not shown");
assert(arenaHtml.includes(">レ</button>"), "katakana arena monster marker is not rendered");
assert(arenaHtml.includes("--arena-marker-hue:"), "arena marker attribute color is not rendered");
assert(arenaHtml.includes("--arena-marker-family-hue:"), "arena marker title color is not rendered");
assert(!arenaHtml.includes("arena-actions"), "arena action button still overlaps the log");
assert(elements.get("#logList").innerHTML.includes("「"), "arena unique encounter dialogue did not trigger");
assert((arenaHtml.match(/id="arenaRetireButton"/g) || []).length === 1, "arena retreat control is duplicated");

elements.get("#arenaRetireButton").listeners.click();
assert(!appShell.classList.contains("arena-mode"), "arena mode remained active after retreat");
assert(appShell.classList.contains("town-mode"), "town mode was not restored after retreat");

const arenaReloadSave = JSON.parse(JSON.stringify(legacySave));
const arenaReloadMonster = window.HD_DATA.monsters.find((monster) => monster.arenaRank === 1);
const arenaReloadEnemy = JSON.parse(JSON.stringify(arenaReloadMonster));
Object.assign(arenaReloadEnemy, {
  x: 7, y: 4, maxHp: arenaReloadMonster.hp, hp: arenaReloadMonster.hp, alive: true,
  turns: 0, telegraphed: false, unique: true, dialogueState: { recent: [], cooldown: 0, counters: {}, stages: {} },
});
arenaReloadSave.meta.awaitingCreation = false;
arenaReloadSave.adventurer.inDungeon = false;
arenaReloadSave.dungeon = null;
arenaReloadSave.arena = {
  round: 1, enemy: arenaReloadEnemy, awaitingNext: false, actionProgress: 0,
  size: 9, player: { x: 1, y: 4 }, obstacles: [],
};
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(arenaReloadSave) : null;
};
localStorage.setItem = function () {};
eval(read("js/main.js"));
assert(appShell.classList.contains("arena-mode"), "active arena save reloaded into town mode");
assert(!elements.get("#arenaView").classList.contains("hidden"), "active arena save did not reopen the arena view");
assert(elements.get("#townView").classList.contains("hidden"), "town view remained accessible after active arena reload");
assert(elements.get("#arenaView").innerHTML.includes("第1戦 / 192"), "reloaded arena round was not rendered");

const spellbookSave = JSON.parse(JSON.stringify(legacySave));
spellbookSave.meta.awaitingCreation = false;
spellbookSave.meta.guildClaims = [];
spellbookSave.adventurer.jobId = "mage";
spellbookSave.adventurer.inDungeon = false;
spellbookSave.adventurer.items = { spellbook_ember_shot: 1 };
spellbookSave.adventurer.learnedSpells = [];
spellbookSave.adventurer.activeSpellId = null;
spellbookSave.dungeon = null;
let persistedSpellbookSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(spellbookSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSpellbookSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("dynamic:read:spellbook_ember_shot").listeners.click();
assert(!persistedSpellbookSave.adventurer.items.spellbook_ember_shot, "reading a spellbook did not consume it");
assert(persistedSpellbookSave.adventurer.learnedSpells.includes("ember_shot"), "reading a spellbook did not teach its spell");
assert(persistedSpellbookSave.adventurer.activeSpellId === "ember_shot", "newly learned spell was not selected");

const corpseSave = JSON.parse(JSON.stringify(legacySave));
corpseSave.meta.awaitingCreation = false;
corpseSave.meta.guildClaims = [];
corpseSave.adventurer.inDungeon = true;
corpseSave.adventurer.floor = 1;
corpseSave.adventurer.materials = {};
const corpseMap = Array.from({ length: 48 }, (_, y) => Array.from({ length: 48 }, (_, x) => (x === 0 || y === 0 || x === 47 || y === 47 ? "wall" : "floor")));
const corpseEnemy = JSON.parse(JSON.stringify(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat")));
Object.assign(corpseEnemy, {
  x: 11, y: 10, maxHp: corpseEnemy.hp, hp: 0, alive: false, harvested: false,
  harvestsTotal: 2, harvestsRemaining: 2, lootMaterialId: "small_beast_meat",
});
corpseSave.dungeon = {
  map: corpseMap, rooms: [], player: { x: 10, y: 10 }, stairs: [], enemies: [corpseEnemy], chests: [], traps: [],
  turnsElapsed: 0, actionProgress: 0, uniqueSpawned: false,
};
let persistedCorpseSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(corpseSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedCorpseSave = JSON.parse(value);
};
eval(read("js/main.js"));
assert(elements.get("#waitButton").textContent === "剥", "multi-harvest corpse is not actionable");
elements.get("#waitButton").listeners.click();
assert(persistedCorpseSave.dungeon.enemies[0].harvestsRemaining === 1, "first harvest did not preserve the corpse");
assert(!/残り\d+回/.test(persistedCorpseSave.log[0]), "remaining harvest count leaked into the log");
elements.get("#waitButton").listeners.click();
assert(persistedCorpseSave.dungeon.enemies[0].harvestsRemaining === 0, "final harvest did not exhaust the corpse");
assert(persistedCorpseSave.adventurer.materials.small_beast_meat === 2, "multi-harvest rewards were not granted per action");

const selfDestructGuardianSave = JSON.parse(JSON.stringify(corpseSave));
const selfDestructGuardian = JSON.parse(JSON.stringify(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat")));
Object.assign(selfDestructGuardian, {
  x: 11, y: 10, maxHp: selfDestructGuardian.hp, alive: true, turns: 3, telegraphed: false,
  specialAttack: "self_destruct", floorGuardian: true,
});
selfDestructGuardianSave.adventurer.hp = 40;
selfDestructGuardianSave.dungeon.enemies = [selfDestructGuardian];
selfDestructGuardianSave.dungeon.stairs = [];
selfDestructGuardianSave.dungeon.guardianDefeated = false;
let persistedSelfDestructGuardianSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(selfDestructGuardianSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSelfDestructGuardianSave = JSON.parse(value);
};
const selfDestructOriginalRandom = Math.random;
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = selfDestructOriginalRandom;
assert(!persistedSelfDestructGuardianSave.dungeon.enemies[0].alive, "self-destructing guardian remained alive");
assert(persistedSelfDestructGuardianSave.dungeon.guardianDefeated, "self-destructing guardian did not clear the floor");
assert(persistedSelfDestructGuardianSave.dungeon.stairs.length === 1, "self-destructing guardian did not create stairs");

const legacyUniqueCorpseSave = JSON.parse(JSON.stringify(corpseSave));
const legacyUniqueCorpse = JSON.parse(JSON.stringify(dungeonUniques[0]));
Object.assign(legacyUniqueCorpse, {
  x: 11, y: 10, maxHp: legacyUniqueCorpse.hp, hp: 0, alive: false, harvested: false,
});
delete legacyUniqueCorpse.harvestsTotal;
delete legacyUniqueCorpse.harvestsRemaining;
legacyUniqueCorpseSave.dungeon.enemies = [legacyUniqueCorpse];
let persistedLegacyUniqueCorpseSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(legacyUniqueCorpseSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedLegacyUniqueCorpseSave = JSON.parse(value);
};
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowLeft", preventDefault() {} });
const migratedUniqueCorpse = persistedLegacyUniqueCorpseSave.dungeon.enemies[0];
assert(migratedUniqueCorpse.harvestsRemaining >= 3 && migratedUniqueCorpse.harvestsRemaining <= 5, "legacy unique corpse did not migrate to 3-5 harvests");
assert(migratedUniqueCorpse.harvestsTotal === migratedUniqueCorpse.harvestsRemaining, "legacy unique corpse harvest total was not initialized consistently");
assert(migratedUniqueCorpse.harvested === false, "legacy unique corpse became exhausted during migration");

const replacementSave = JSON.parse(JSON.stringify(legacySave));
replacementSave.meta.awaitingCreation = false;
replacementSave.adventurer.inDungeon = false;
replacementSave.dungeon = null;
replacementSave.arena = null;
let persistedReplacementSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(replacementSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedReplacementSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#newAdventurerButton").listeners.click();
elements.get("#confirmOk").listeners.click();
elements.get("#setupOk").listeners.click();
assert(persistedReplacementSave.meta.guildClaims.length === 0, "confirmSetup carried guild claims into the next adventurer");

const deathClaimSave = JSON.parse(JSON.stringify(corpseSave));
deathClaimSave.meta.guildClaims = [{ id: "red_garm", name: "赤熱のガルム", reward: 400 }];
deathClaimSave.adventurer.hp = 1;
deathClaimSave.dungeon.enemies = [];
deathClaimSave.dungeon.chests = [];
deathClaimSave.dungeon.traps = [{ x: 11, y: 10, type: "damage", discovered: false, triggered: false }];
let persistedDeathClaimSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(deathClaimSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedDeathClaimSave = JSON.parse(value);
};
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
assert(persistedDeathClaimSave.meta.guildClaims.length === 0, "death carried guild claims into the next adventurer");
assert(persistedDeathClaimSave.meta.awaitingCreation, "death did not return to adventurer creation");

const chestSave = JSON.parse(JSON.stringify(corpseSave));
chestSave.adventurer.materials = {};
chestSave.adventurer.items = {};
chestSave.dungeon.enemies = [];
chestSave.dungeon.chests = [{ x: 11, y: 10, opened: false }];
let persistedChestSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(chestSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedChestSave = JSON.parse(value);
};
const originalRandom = Math.random;
const chestRolls = [0.5, 0.1, 0.5];
Math.random = function () { return chestRolls.length ? chestRolls.shift() : 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
assert(Object.keys(persistedChestSave.adventurer.materials).length === 0, "chest still granted monster material");
assert(Object.keys(persistedChestSave.adventurer.items).some((id) => id.startsWith("spellbook_")), "forced spellbook chest did not grant a spellbook");
assert(persistedChestSave.dungeon.chests[0].opened, "chest was not marked opened");

const artifactChestSave = JSON.parse(JSON.stringify(chestSave));
let persistedArtifactChestSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(artifactChestSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArtifactChestSave = JSON.parse(value);
};
const artifactRolls = [0.001, 0.5];
Math.random = function () { return artifactRolls.length ? artifactRolls.shift() : 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
assert(persistedArtifactChestSave.adventurer.ownedEquipment.length === artifactChestSave.adventurer.ownedEquipment.length + 1, "artifact chest did not grant unique equipment");
assert(persistedArtifactChestSave.log.some((line) => line.includes("★")), "artifact acquisition did not show a star marker");

const donatedArtifactId = "artifact_invisible_emperor_cloak";
const artifactDonationSave = JSON.parse(JSON.stringify(legacySave));
artifactDonationSave.meta.awaitingCreation = false;
artifactDonationSave.meta.guildClaims = [];
artifactDonationSave.adventurer.inDungeon = false;
artifactDonationSave.adventurer.equipment = { weapon: "rusty_knife", upper: "cloth", lower: null, feet: null, accessory1: null, accessory2: null };
artifactDonationSave.adventurer.ownedEquipment = ["rusty_knife", "cloth", donatedArtifactId];
delete artifactDonationSave.adventurer.discoveredArtifacts;
artifactDonationSave.dungeon = null;
artifactDonationSave.arena = null;
let persistedArtifactDonationSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(artifactDonationSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArtifactDonationSave = JSON.parse(value);
};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
elements.get(`dynamic:donate:${donatedArtifactId}`).listeners.click();
elements.get("#confirmOk").listeners.click();
assert(!persistedArtifactDonationSave.adventurer.ownedEquipment.includes(donatedArtifactId), "donated artifact remained owned");
assert(persistedArtifactDonationSave.adventurer.discoveredArtifacts.includes(donatedArtifactId), "donated artifact was removed from discovery history");

const artifactRedropSave = JSON.parse(JSON.stringify(persistedArtifactDonationSave));
artifactRedropSave.adventurer.inDungeon = true;
artifactRedropSave.adventurer.floor = 1;
artifactRedropSave.dungeon = {
  map: corpseMap, rooms: [], player: { x: 10, y: 10 }, stairs: [], enemies: [],
  chests: [{ x: 11, y: 10, opened: false }], traps: [], turnsElapsed: 0, actionProgress: 0, uniqueSpawned: false,
};
let persistedArtifactRedropSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(artifactRedropSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArtifactRedropSave = JSON.parse(value);
};
const artifactRedropRolls = [0.001, 0];
Math.random = function () { return artifactRedropRolls.length ? artifactRedropRolls.shift() : 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
const redroppedArtifactIds = persistedArtifactRedropSave.adventurer.ownedEquipment.filter((id) => window.HD_DATA.equipment.find((item) => item.id === id)?.artifact);
assert(!persistedArtifactRedropSave.adventurer.ownedEquipment.includes(donatedArtifactId), "donated artifact became a chest candidate again");
assert(redroppedArtifactIds.length === 1 && redroppedArtifactIds[0] !== donatedArtifactId, "artifact discovery history did not advance to a different chest candidate");
assert(persistedArtifactRedropSave.adventurer.discoveredArtifacts.filter((id) => id === donatedArtifactId).length === 1, "donated artifact discovery history was duplicated or lost");

const uniqueChestSave = JSON.parse(JSON.stringify(chestSave));
uniqueChestSave.adventurer.floor = 2;
uniqueChestSave.dungeon.timeStopTurns = 1;
let persistedUniqueChestSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(uniqueChestSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedUniqueChestSave = JSON.parse(value);
};
Math.random = function () { return 0.001; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
assert(persistedUniqueChestSave.dungeon.enemies.some((enemy) => enemy.unique && enemy.chestAmbush), "rare unique chest ambush did not spawn");

const rangedSave = JSON.parse(JSON.stringify(chestSave));
rangedSave.adventurer.jobId = "archer";
rangedSave.dungeon.chests = [];
const rangedEnemy = JSON.parse(JSON.stringify(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat")));
Object.assign(rangedEnemy, { x: 13, y: 10, maxHp: rangedEnemy.hp, alive: true, turns: 0, telegraphed: false });
rangedSave.dungeon.enemies = [rangedEnemy];
let persistedRangedSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(rangedSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedRangedSave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#map").listeners.click({ target: { closest() { return { dataset: { enemyX: "13", enemyY: "10" } }; } } });
Math.random = originalRandom;
assert(persistedRangedSave.log.some((line) => line.includes("遠隔攻撃を放った")), "enemy tap did not perform direct ranged attack");
assert(persistedRangedSave.adventurer.lastAttack.attributes.length >= 2, "multi-attribute equipment was reduced to one combat attribute");

const jobSkillSave = JSON.parse(JSON.stringify(chestSave));
jobSkillSave.adventurer.jobId = "hunter";
jobSkillSave.adventurer.equipment.weapon = "rusty_knife";
jobSkillSave.dungeon.chests = [];
const preciseEnemy = JSON.parse(JSON.stringify(window.HD_DATA.monsters.find((monster) => monster.id === "carapace_rat")));
Object.assign(preciseEnemy, { x: 13, y: 10, maxHp: preciseEnemy.hp, hp: 1, alive: true, turns: 0, telegraphed: false });
jobSkillSave.dungeon.enemies = [preciseEnemy];
let persistedJobSkillSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(jobSkillSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedJobSkillSave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#jobSkillButton").listeners.click();
elements.get("#map").listeners.click({ target: { closest() { return { dataset: { enemyX: "13", enemyY: "10" } }; } } });
Math.random = originalRandom;
assert(persistedJobSkillSave.adventurer.lastAttack.skill === "precise", "dungeon job skill did not enter combat");
assert(persistedJobSkillSave.dungeon.enemies[0].lootMaterialId === "fine_pelt", "skill-specific loot lost priority to attack attribute loot");

const spellCastSave = JSON.parse(JSON.stringify(rangedSave));
spellCastSave.adventurer.jobId = "mage";
spellCastSave.adventurer.learnedSpells = ["ember_shot"];
spellCastSave.adventurer.activeSpellId = "ember_shot";
let persistedSpellCastSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(spellCastSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSpellCastSave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#activeSpellButton").listeners.click();
elements.get("#map").listeners.click({ target: { closest() { return { dataset: { enemyX: "13", enemyY: "10" } }; } } });
Math.random = originalRandom;
assert(persistedSpellCastSave.adventurer.lastAttack.skill === "spell:ember_shot", "learned spell was not usable in dungeon combat");

const lowCurseSave = JSON.parse(JSON.stringify(legacySave));
lowCurseSave.meta.awaitingCreation = false;
lowCurseSave.meta.guildClaims = [];
lowCurseSave.adventurer.inDungeon = false;
lowCurseSave.adventurer.equipment.accessory1 = null;
lowCurseSave.dungeon = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(lowCurseSave) : null;
};
localStorage.setItem = function () {};
eval(read("js/main.js"));
const lowCurseMaxHp = Number(elements.get("#maxHpText").textContent);
const highCurseSave = JSON.parse(JSON.stringify(lowCurseSave));
highCurseSave.adventurer.ownedEquipment.push("artifact_zero_crown");
highCurseSave.adventurer.equipment.accessory1 = "artifact_zero_crown";
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(highCurseSave) : null;
};
eval(read("js/main.js"));
const highCurseMaxHp = Number(elements.get("#maxHpText").textContent);
assert(highCurseMaxHp > lowCurseMaxHp, "strong curse resistance did not reduce artifact curse penalties");

const drainingCurseSave = JSON.parse(JSON.stringify(corpseSave));
drainingCurseSave.adventurer.hp = 20;
drainingCurseSave.adventurer.equipment.weapon = "rusty_knife";
drainingCurseSave.adventurer.equipment.accessory1 = "artifact_endless_alarm";
drainingCurseSave.adventurer.ownedEquipment.push("artifact_endless_alarm");
drainingCurseSave.dungeon.enemies = [];
let persistedDrainingCurseSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(drainingCurseSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedDrainingCurseSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
assert(persistedDrainingCurseSave.adventurer.hp < 20, "negative cursed regeneration did not drain HP");
assert(persistedDrainingCurseSave.log.some((line) => line.includes("呪われた装備が生命力を吸い")), "cursed HP drain was silent");

const completeSave = JSON.parse(JSON.stringify(legacySave));
completeSave.meta.researchSchemaVersion = 2;
completeSave.meta.awaitingCreation = false;
completeSave.meta.research = Object.fromEntries(window.HD_DATA.monsters.map((monster) => [monster.id, { seen: true, level: 5 }]));
let persistedCompleteSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(completeSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedCompleteSave = JSON.parse(value);
};

eval(read("js/main.js"));
assert(persistedCompleteSave?.meta?.compendiumEquipmentUnlocked, "complete compendium reward flag was not saved");
assert(persistedCompleteSave.meta.titles.includes("万象の記録者"), "complete compendium title was not awarded");
assert(persistedCompleteSave.adventurer.ownedEquipment.includes("omniscient_archive"), "complete compendium equipment was not awarded");
viewTabs.find((tab) => tab.dataset.view === "research").listeners.click();
assert(elements.get("#researchView").innerHTML.includes("949 / 949"), "complete compendium progress is not shown");
assert(elements.get("#researchView").innerHTML.includes("報酬受領済み"), "complete compendium reward status is not shown");
viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
assert(!elements.get("#guildView").innerHTML.includes('data-guild-donate="omniscient_archive"'), "complete compendium reward can be donated");

"smoke test: ok";
