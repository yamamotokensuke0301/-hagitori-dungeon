const SIZE = 10;
const TEST_BOSS_FLOOR = 10;
const FINAL_FLOOR = 100;

const cells = [];
const els = {
  map: document.querySelector("#map"),
  floor: document.querySelector("#floorText"),
  hp: document.querySelector("#hpText"),
  maxHp: document.querySelector("#maxHpText"),
  attack: document.querySelector("#attackText"),
  message: document.querySelector("#messageText"),
  music: document.querySelector("#musicButton"),
  lootPanel: document.querySelector("#lootPanel"),
  lootEnemy: document.querySelector("#lootEnemyText"),
  lootChoices: document.querySelector("#lootChoices"),
  endPanel: document.querySelector("#endPanel"),
  endTitle: document.querySelector("#endTitle"),
  endText: document.querySelector("#endText"),
  restart: document.querySelector("#restartButton"),
  fang: document.querySelector("#fangCount"),
  hide: document.querySelector("#hideCount"),
  bone: document.querySelector("#boneCount"),
  rare: document.querySelector("#rareCount"),
  ultra: document.querySelector("#ultraCount"),
  weapon: document.querySelector("#weaponText"),
  weaponLevel: document.querySelector("#weaponLevelText"),
  armor: document.querySelector("#armorText"),
  armorLevel: document.querySelector("#armorLevelText"),
  charm: document.querySelector("#charmText"),
  charmLevel: document.querySelector("#charmLevelText"),
  waitButton: document.querySelector("#waitButton"),
};

const materialMap = {
  fang: "牙",
  hide: "皮",
  bone: "骨",
  sharpFang: "鋭牙",
  thickHide: "厚皮",
  magicBone: "魔骨",
  kingFang: "王牙",
  ancientBone: "古竜骨",
  curseCore: "呪核",
};

let state;
let audio;
let nextId = 1;

window.addEventListener("error", (event) => {
  document.body.innerHTML = `<main style="padding:16px;color:#fff;font-family:sans-serif;background:#151713;min-height:100vh;"><h1>読み込みエラー</h1><p>${event.message}</p></main>`;
});

function createInitialState() {
  return {
    floor: 1,
    player: { x: 1, y: 1, hp: 20, maxHp: 20, attack: 4 },
    materials: {
      fang: 0,
      hide: 0,
      bone: 0,
      sharpFang: 0,
      thickHide: 0,
      magicBone: 0,
      kingFang: 0,
      ancientBone: 0,
      curseCore: 0,
    },
    gear: {
      weapon: { name: "石の短剣", level: 1 },
      armor: { name: "裂けた外套", level: 1 },
      charm: { name: "骨片の護符", level: 1 },
    },
    map: [],
    enemies: [],
    stairs: { x: 8, y: 8 },
    pendingLoot: null,
    ended: false,
    turn: 0,
  };
}

function buildCells() {
  els.map.innerHTML = "";
  cells.length = 0;
  for (let i = 0; i < SIZE * SIZE; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell floor";
    cell.setAttribute("role", "gridcell");
    els.map.appendChild(cell);
    cells.push(cell);
  }
}

function newFloor() {
  state.map = Array.from({ length: SIZE }, (_, y) =>
    Array.from({ length: SIZE }, (_, x) => {
      if (x === 0 || y === 0 || x === SIZE - 1 || y === SIZE - 1) return "wall";
      return "floor";
    })
  );

  const wallCount = state.floor >= TEST_BOSS_FLOOR ? 0 : 10;
  for (let i = 0; i < wallCount; i += 1) {
    const pos = randomOpenPosition();
    if (pos.x !== 1 || pos.y !== 1) state.map[pos.y][pos.x] = "wall";
  }

  state.player.x = 1;
  state.player.y = 1;
  state.enemies = [];

  if (isBossFloor()) {
    state.stairs = null;
    state.enemies.push({
      id: createId(),
      name: "地下百階の主",
      x: 7,
      y: 7,
      hp: 34,
      maxHp: 34,
      attack: 6,
      boss: true,
    });
    setMessage("B100F相当の試験フロア。ラスボスを倒せばクリア。");
    return;
  }

  state.stairs = randomOpenPosition([{ x: 1, y: 1 }]);
  const enemyCount = Math.min(2 + Math.floor(state.floor / 2), 6);
  for (let i = 0; i < enemyCount; i += 1) {
    const pos = randomOpenPosition([{ x: 1, y: 1 }, state.stairs, ...state.enemies]);
    state.enemies.push({
      id: createId(),
      name: state.floor >= 6 ? "硬殻獣" : "穴獣",
      x: pos.x,
      y: pos.y,
      hp: 5 + state.floor,
      maxHp: 5 + state.floor,
      attack: 2 + Math.floor(state.floor / 3),
      boss: false,
    });
  }
}

function isBossFloor() {
  return state.floor >= TEST_BOSS_FLOOR;
}

function randomOpenPosition(blocked = []) {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const x = 1 + Math.floor(Math.random() * (SIZE - 2));
    const y = 1 + Math.floor(Math.random() * (SIZE - 2));
    const occupied = blocked.some((item) => item && item.x === x && item.y === y);
    const enemy = state && state.enemies && state.enemies.some((item) => item.x === x && item.y === y);
    const tile = state && state.map && state.map[y] ? state.map[y][x] : "wall";
    if (!occupied && !enemy && tile !== "wall") return { x, y };
  }
  return { x: 8, y: 8 };
}

function createId() {
  nextId += 1;
  return `enemy-${nextId}`;
}

function render() {
  const enemyByPos = new Map(state.enemies.map((enemy) => [`${enemy.x},${enemy.y}`, enemy]));

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const cell = cells[y * SIZE + x];
      const enemy = enemyByPos.get(`${x},${y}`);
      cell.textContent = "";
      cell.className = "cell floor";

      if (state.map[y][x] === "wall") {
        cell.className = "cell wall";
        cell.textContent = "■";
      } else if (state.player.x === x && state.player.y === y) {
        cell.className = "cell player";
        cell.textContent = "@";
      } else if (enemy) {
        cell.className = enemy.boss ? "cell boss" : "cell enemy";
        cell.textContent = enemy.boss ? "闇" : "獣";
      } else if (state.stairs && state.stairs.x === x && state.stairs.y === y) {
        cell.className = "cell stairs";
        cell.textContent = "≡";
      }
    }
  }

  els.floor.textContent = isBossFloor() ? "B100F" : `B${state.floor}F`;
  els.hp.textContent = state.player.hp;
  els.maxHp.textContent = state.player.maxHp;
  els.attack.textContent = state.player.attack;
  els.fang.textContent = state.materials.fang;
  els.hide.textContent = state.materials.hide;
  els.bone.textContent = state.materials.bone;
  els.rare.textContent = state.materials.sharpFang + state.materials.thickHide + state.materials.magicBone;
  els.ultra.textContent = state.materials.kingFang + state.materials.ancientBone + state.materials.curseCore;
  els.weapon.textContent = state.gear.weapon.name;
  els.weaponLevel.textContent = `Lv.${state.gear.weapon.level}`;
  els.armor.textContent = state.gear.armor.name;
  els.armorLevel.textContent = `Lv.${state.gear.armor.level}`;
  els.charm.textContent = state.gear.charm.name;
  els.charmLevel.textContent = `Lv.${state.gear.charm.level}`;
}

function move(dx, dy) {
  if (state.ended || state.pendingLoot) return;
  startAudioIfNeeded();

  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (state.map[ny][nx] === "wall") {
    setMessage("壁に阻まれた。");
    enemyTurn();
    render();
    return;
  }

  const enemy = state.enemies.find((item) => item.x === nx && item.y === ny);
  if (enemy) {
    attackEnemy(enemy);
    if (!state.pendingLoot && !state.ended) enemyTurn();
    render();
    return;
  }

  state.player.x = nx;
  state.player.y = ny;

  if (state.stairs && nx === state.stairs.x && ny === state.stairs.y) {
    descend();
    render();
    return;
  }

  setMessage("一歩進んだ。");
  enemyTurn();
  render();
}

function waitTurn() {
  if (state.ended || state.pendingLoot) return;
  startAudioIfNeeded();
  setMessage("息を整えた。");
  enemyTurn();
  render();
}

function attackEnemy(enemy) {
  const damage = state.player.attack + Math.floor(Math.random() * 3);
  enemy.hp -= damage;
  pulseAudio(170, 0.08);

  if (enemy.hp <= 0) {
    state.enemies = state.enemies.filter((item) => item.id !== enemy.id);
    if (enemy.boss) {
      endGame(true);
      return;
    }
    state.pendingLoot = { enemyName: enemy.name, choices: createLootChoices(enemy) };
    showLoot();
    setMessage(`${enemy.name}を倒した。素材を剥ぎ取る。`);
    return;
  }

  setMessage(`${enemy.name}に${damage}ダメージ。残りHP ${enemy.hp}/${enemy.maxHp}。`);
}

function enemyTurn() {
  state.turn += 1;
  for (const enemy of state.enemies) {
    const dist = Math.abs(enemy.x - state.player.x) + Math.abs(enemy.y - state.player.y);
    if (dist === 1) {
      const damage = Math.max(1, enemy.attack - Math.floor(Math.random() * 2));
      state.player.hp -= damage;
      setMessage(`${enemy.name}の反撃。${damage}ダメージ。`);
      pulseAudio(90, 0.1);
      if (state.player.hp <= 0) {
        state.player.hp = 0;
        endGame(false);
        return;
      }
    } else if (dist <= 5) {
      stepEnemyToward(enemy);
    }
  }
}

function stepEnemyToward(enemy) {
  const options = [
    { x: enemy.x + Math.sign(state.player.x - enemy.x), y: enemy.y },
    { x: enemy.x, y: enemy.y + Math.sign(state.player.y - enemy.y) },
  ].filter((pos) => canEnemyMoveTo(pos.x, pos.y, enemy));

  if (options.length === 0) return;
  const next = options[Math.floor(Math.random() * options.length)];
  enemy.x = next.x;
  enemy.y = next.y;
}

function canEnemyMoveTo(x, y, movingEnemy) {
  if (!state.map[y] || state.map[y][x] !== "floor") return false;
  if (state.player.x === x && state.player.y === y) return false;
  return !state.enemies.some((enemy) => enemy !== movingEnemy && enemy.x === x && enemy.y === y);
}

function descend() {
  state.floor += 1;
  if (state.floor >= TEST_BOSS_FLOOR) state.floor = TEST_BOSS_FLOOR;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + 3);
  newFloor();
  setMessage(isBossFloor() ? "最深部に到達した。" : `B${state.floor}Fへ降りた。`);
}

function createLootChoices() {
  const base = [
    { key: "fang", rarity: "通常", name: materialMap.fang },
    { key: "hide", rarity: "通常", name: materialMap.hide },
    { key: "bone", rarity: "通常", name: materialMap.bone },
  ];
  const rare = [
    { key: "sharpFang", rarity: "レア", name: materialMap.sharpFang },
    { key: "thickHide", rarity: "レア", name: materialMap.thickHide },
    { key: "magicBone", rarity: "レア", name: materialMap.magicBone },
  ];
  const ultra = [
    { key: "kingFang", rarity: "超レア", name: materialMap.kingFang },
    { key: "ancientBone", rarity: "超レア", name: materialMap.ancientBone },
    { key: "curseCore", rarity: "超レア", name: materialMap.curseCore },
  ];

  return [rollLoot(base, rare, ultra), rollLoot(base, rare, ultra), rollLoot(base, rare, ultra)];
}

function rollLoot(base, rare, ultra) {
  const roll = Math.random() * 100;
  if (roll < 2) return pick(ultra);
  if (roll < 20) return pick(rare);
  return pick(base);
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function showLoot() {
  els.lootPanel.classList.remove("hidden");
  els.lootEnemy.textContent = state.pendingLoot.enemyName;
  els.lootChoices.innerHTML = "";

  state.pendingLoot.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = choice.rarity === "超レア" ? "ultra" : choice.rarity === "レア" ? "rare" : "";
    button.innerHTML = `<strong>${choice.name}</strong><span>${choice.rarity}</span><small>${getLootEffectText(choice)}</small>`;
    button.addEventListener("click", () => takeLoot(choice));
    els.lootChoices.appendChild(button);
  });
}

function takeLoot(choice) {
  startAudioIfNeeded();
  state.materials[choice.key] += 1;
  applyMaterialEffect(choice);
  state.pendingLoot = null;
  els.lootPanel.classList.add("hidden");
  pulseAudio(choice.rarity === "超レア" ? 620 : choice.rarity === "レア" ? 420 : 260, 0.14);
  setMessage(`${choice.name}を入手。${getLootEffectText(choice)}。`);
  enemyTurn();
  render();
}

function applyMaterialEffect(choice) {
  if (choice.key === "fang" || choice.key.includes("Fang")) {
    state.gear.weapon.level += getRarityPower(choice);
    state.gear.weapon.name = getWeaponName(choice);
    state.player.attack += getRarityPower(choice);
  }
  if (choice.key === "hide" || choice.key.includes("Hide")) {
    state.gear.armor.level += getRarityPower(choice);
    state.gear.armor.name = getArmorName(choice);
    state.player.maxHp += getRarityPower(choice);
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 1);
  }
  if (choice.key === "bone" || choice.key.includes("Bone")) {
    state.gear.charm.level += getRarityPower(choice);
    state.gear.charm.name = getCharmName(choice);
    state.player.maxHp += 1 + Math.floor(getRarityPower(choice) / 2);
    if (choice.rarity !== "通常") state.player.attack += 1;
  }
  if (choice.key === "curseCore") {
    state.gear.charm.level += 2;
    state.gear.charm.name = "呪核の護符";
    state.player.attack += 2;
  }
}

function getRarityPower(choice) {
  if (choice.rarity === "超レア") return 3;
  if (choice.rarity === "レア") return 2;
  return 1;
}

function getLootEffectText(choice) {
  if (choice.key === "curseCore") return "護符Lv+2 攻撃+2";
  if (choice.key === "fang" || choice.key.includes("Fang")) return `武器Lv+${getRarityPower(choice)} 攻撃+${getRarityPower(choice)}`;
  if (choice.key === "hide" || choice.key.includes("Hide")) return `防具Lv+${getRarityPower(choice)} 最大HP+${getRarityPower(choice)}`;
  if (choice.key === "bone" || choice.key.includes("Bone")) {
    const hp = 1 + Math.floor(getRarityPower(choice) / 2);
    return choice.rarity === "通常" ? `護符Lv+1 最大HP+${hp}` : `護符Lv+${getRarityPower(choice)} 攻撃+1 最大HP+${hp}`;
  }
  return "装備素材";
}

function getWeaponName(choice) {
  if (choice.key === "kingFang") return "王牙の大剣";
  if (choice.key === "sharpFang") return "鋭牙の短剣";
  return "牙削りの刃";
}

function getArmorName(choice) {
  if (choice.key === "thickHide") return "厚皮の胴";
  return "獣皮の外套";
}

function getCharmName(choice) {
  if (choice.key === "ancientBone") return "古竜骨の護符";
  if (choice.key === "magicBone") return "魔骨の護符";
  return "骨片の護符";
}

function endGame(won) {
  state.ended = true;
  els.endPanel.classList.remove("hidden");
  els.endTitle.textContent = won ? "クリア" : "探索失敗";
  els.endText.textContent = won
    ? "地下100階のラスボスを倒した。剥ぎ取った素材は装備づくりの礎になる。"
    : "HPが尽きた。素材を集め、装備を鍛えて再挑戦する。";
  setMessage(won ? "ラスボス撃破。" : "倒れてしまった。");
  render();
}

function restart() {
  state = createInitialState();
  els.endPanel.classList.add("hidden");
  els.lootPanel.classList.add("hidden");
  newFloor();
  setMessage("探索を開始します。矢印で移動。");
  render();
}

function setMessage(text) {
  els.message.textContent = text;
}

function setupAudio() {
  audio = {
    context: null,
    playing: false,
    interval: null,
    master: null,
  };
}

function toggleAudio() {
  if (audio.playing) {
    stopAudio();
  } else {
    startAudioIfNeeded(true);
  }
}

function startAudioIfNeeded(force = false) {
  if (!force && !audio.playing) return;
  if (!audio.context) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audio.context = new AudioContext();
    audio.master = audio.context.createGain();
    audio.master.gain.value = 0.12;
    audio.master.connect(audio.context.destination);
  }
  if (audio.context.state === "suspended") audio.context.resume();
  if (audio.playing) return;

  audio.playing = true;
  els.music.textContent = "♫";
  playDrone();
  audio.interval = window.setInterval(playDrone, 1800);
}

function stopAudio() {
  audio.playing = false;
  els.music.textContent = "♪";
  window.clearInterval(audio.interval);
}

function playDrone() {
  if (!audio.context || !audio.playing) return;
  const now = audio.context.currentTime;
  const notes = [55, 73.42, 82.41, 98];
  notes.forEach((freq, index) => {
    const osc = audio.context.createOscillator();
    const gain = audio.context.createGain();
    osc.type = index === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(index === 0 ? 0.12 : 0.035, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.45 + index * 0.08);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(now + index * 0.04);
    osc.stop(now + 1.65 + index * 0.08);
  });
}

function pulseAudio(freq, duration) {
  if (!audio.context || !audio.playing) return;
  const now = audio.context.currentTime;
  const osc = audio.context.createOscillator();
  const gain = audio.context.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(audio.master);
  osc.start(now);
  osc.stop(now + duration);
}

document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.dataset.dir;
    if (dir === "up") move(0, -1);
    if (dir === "down") move(0, 1);
    if (dir === "left") move(-1, 0);
    if (dir === "right") move(1, 0);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") move(0, -1);
  if (event.key === "ArrowDown") move(0, 1);
  if (event.key === "ArrowLeft") move(-1, 0);
  if (event.key === "ArrowRight") move(1, 0);
  if (event.key === " " || event.key === "Enter") waitTurn();
});

els.waitButton.addEventListener("click", waitTurn);
els.music.addEventListener("click", toggleAudio);
els.restart.addEventListener("click", restart);

buildCells();
setupAudio();
restart();
