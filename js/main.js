(function () {
  "use strict";

  const SAVE_KEY = "hagitori-dungeon-save-v1";
  const AUDIO_KEY = "hagitori-audio-enabled-v4";
  const MAP_SIZE = 15;
  const VIEW_SIZE = 11;
  const MAX_FLOOR = 5;
  const DATA = window.HD_DATA;

  const byId = (items) => Object.fromEntries(items.map((item) => [item.id, item]));
  const jobs = byId(DATA.jobs);
  const monsters = byId(DATA.monsters);
  const materials = byId(DATA.materials);
  const equipment = byId(DATA.equipment);
  const floorByNumber = Object.fromEntries(DATA.floors.map((floor) => [floor.floor, floor]));

  const els = {
    place: document.querySelector("#placeText"),
    job: document.querySelector("#jobText"),
    hp: document.querySelector("#hpText"),
    maxHp: document.querySelector("#maxHpText"),
    deaths: document.querySelector("#deathText"),
    weapon: document.querySelector("#weaponText"),
    armor: document.querySelector("#armorText"),
    charm: document.querySelector("#charmText"),
    tabs: document.querySelectorAll("[data-view]"),
    townView: document.querySelector("#townView"),
    dungeonView: document.querySelector("#dungeonView"),
    workshopView: document.querySelector("#workshopView"),
    researchView: document.querySelector("#researchView"),
    floorName: document.querySelector("#floorNameText"),
    floor: document.querySelector("#floorText"),
    map: document.querySelector("#map"),
    returnTown: document.querySelector("#returnTownButton"),
    wait: document.querySelector("#waitButton"),
    materials: document.querySelector("#materialsList"),
    log: document.querySelector("#logList"),
    confirmPanel: document.querySelector("#confirmPanel"),
    confirmTitle: document.querySelector("#confirmTitle"),
    confirmText: document.querySelector("#confirmText"),
    confirmOk: document.querySelector("#confirmOk"),
    confirmCancel: document.querySelector("#confirmCancel"),
    audioButton: document.querySelector("#audioButton"),
    audioIcon: document.querySelector("#audioIcon"),
    audioText: document.querySelector("#audioText"),
  };

  let state = loadGame();
  let currentView = state.adventurer.inDungeon ? "dungeon" : "town";
  let cells = [];
  let pendingConfirm = null;
  let audio = null;

  function defaultSave() {
    return {
      adventurer: createAdventurer("swordsman"),
      meta: {
        research: {},
        deaths: 0,
        deathLog: [],
        discoveredRecipes: [],
        bounties: {},
      },
      dungeon: null,
      log: ["街の冒険者ギルドに到着した。"],
    };
  }

  function createAdventurer(jobId) {
    const job = jobs[jobId];
    return {
      alive: true,
      jobId,
      hp: job.hp,
      maxHp: job.hp,
      floor: 1,
      inDungeon: false,
      equipment: { weapon: "rusty_knife", armor: "cloth", charm: null },
      materials: {},
      guard: false,
      lastAttack: null,
    };
  }

  function loadGame() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved && saved.adventurer && saved.meta) return saved;
    } catch (error) {
      console.warn(error);
    }
    return defaultSave();
  }

  function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function log(text) {
    state.log.unshift(text);
    state.log = state.log.slice(0, 60);
    saveGame();
    renderLog();
  }

  function switchView(view) {
    currentView = view;
    if (view === "dungeon" && !state.adventurer.inDungeon) view = "town";
    ["town", "dungeon", "workshop", "research"].forEach((name) => {
      document.querySelector(`#${name}View`).classList.toggle("hidden", name !== view);
    });
    els.tabs.forEach((button) => button.classList.toggle("active", button.dataset.view === view));
    render();
  }

  function render() {
    const adv = state.adventurer;
    const stats = getPlayerStats();
    els.place.textContent = adv.inDungeon ? `B${adv.floor}F` : "街";
    els.job.textContent = jobs[adv.jobId].name;
    els.hp.textContent = adv.hp;
    els.maxHp.textContent = stats.maxHp;
    els.deaths.textContent = state.meta.deaths;
    els.weapon.textContent = getEquipmentName(adv.equipment.weapon);
    els.armor.textContent = getEquipmentName(adv.equipment.armor);
    els.charm.textContent = getEquipmentName(adv.equipment.charm);

    renderTown();
    renderWorkshop();
    renderResearch();
    renderMaterials();
    renderDungeon();
    renderLog();
    updateAudioScene();
  }

  function renderTown() {
    const adv = state.adventurer;
    const jobButtons = DATA.jobs
      .map((job) => {
        const selected = job.id === adv.jobId ? "selected" : "";
        return `<button type="button" class="${selected}" data-job="${job.id}">
          <strong>${job.name}</strong><small>${job.description}</small>
        </button>`;
      })
      .join("");

    const bountyDone = state.meta.bounties.red_garm ? "達成済み" : "未達成";
    els.townView.innerHTML = `
      <div class="town-grid">
        <article class="town-card">
          <h2>冒険者ギルド</h2>
          <p>賞金首: 赤熱のガルム / 出現階層: B5F / 推奨: 火耐性2以上 / 状態: ${bountyDone}</p>
          <button type="button" id="enterDungeonButton">${adv.inDungeon ? "探索を再開" : "ダンジョンへ入る"}</button>
        </article>
        <article class="town-card">
          <h2>転職所</h2>
          <div class="job-grid">${jobButtons}</div>
        </article>
        <article class="town-card">
          <h2>商店</h2>
          <p>売買は未実装。現段階では工房と調査所を優先する。</p>
        </article>
        <article class="town-card">
          <h2>管理</h2>
          <div class="inline-actions">
            <button type="button" id="newAdventurerButton">新しい冒険者</button>
            <button type="button" id="resetSaveButton">セーブ初期化</button>
          </div>
        </article>
      </div>
    `;

    document.querySelector("#enterDungeonButton").addEventListener("click", enterDungeon);
    document.querySelector("#newAdventurerButton").addEventListener("click", () => {
      askConfirm("新しい冒険者", "調査記録を残して、現在の冒険者を作り直します。", () => {
        state.adventurer = createAdventurer(state.adventurer.jobId);
        state.dungeon = null;
        log("新しい冒険者が登録された。");
        switchView("town");
      });
    });
    document.querySelector("#resetSaveButton").addEventListener("click", () => {
      askConfirm("セーブ初期化", "調査記録と死亡記録を含む全データを削除します。", () => {
        localStorage.removeItem(SAVE_KEY);
        state = defaultSave();
        log("セーブデータを初期化した。");
        switchView("town");
      });
    });
    document.querySelectorAll("[data-job]").forEach((button) => {
      button.addEventListener("click", () => changeJob(button.dataset.job));
    });
  }

  function renderWorkshop() {
    const craftables = DATA.equipment.filter((item) => item.recipe);
    els.workshopView.innerHTML = `
      <div class="card-list">
        ${craftables.map(renderRecipe).join("")}
      </div>
    `;
    document.querySelectorAll("[data-craft]").forEach((button) => {
      button.addEventListener("click", () => craft(button.dataset.craft));
    });
  }

  function renderRecipe(item) {
    const adv = state.adventurer;
    const owned = adv.equipment[item.slot] === item.id;
    const canJob = item.jobs.includes(adv.jobId);
    const canCraft = canAfford(item.recipe) && canJob;
    const recipe = Object.entries(item.recipe)
      .map(([id, count]) => `${materials[id].name} ${getMaterialCount(id)}/${count}`)
      .join("、");
    const res = formatResistances(item.resistances);
    const label = owned ? "装備中" : canCraft ? "製作して装備" : "素材不足";
    return `<article class="recipe-card">
      <h2>${item.name}</h2>
      <p>${item.description}</p>
      <div class="stat-row"><span>性能</span><div>攻撃+${item.attack} 防御+${item.defense} ${item.attributeAttack ? `属性:${attr(item.attributeAttack)}` : ""}</div></div>
      <div class="stat-row"><span>耐性</span><div>${res || "なし"}</div></div>
      <div class="stat-row"><span>素材</span><div>${recipe}</div></div>
      <button type="button" data-craft="${item.id}" ${canCraft && !owned ? "" : "disabled"}>${label}</button>
    </article>`;
  }

  function renderResearch() {
    const cards = DATA.monsters
      .map((monster) => {
        const rec = getResearch(monster.id);
        const lines = [];
        for (let level = 1; level <= rec.level; level += 1) {
          if (monster.research[level]) lines.push(`<p>${monster.research[level]}</p>`);
        }
        return `<article class="research-card">
          <h2>${rec.seen ? monster.name : "未確認の魔物"} <small>調査度${rec.level}</small></h2>
          ${lines.length ? lines.join("") : "<p>まだ詳細不明。遭遇、戦闘、調査で記録が進む。</p>"}
        </article>`;
      })
      .join("");
    const deaths = state.meta.deathLog.map((item) => `<p>${item}</p>`).join("") || "<p>死因記録なし。</p>";
    els.researchView.innerHTML = `
      <div class="card-list">
        <article class="research-card">
          <h2>死因記録</h2>
          ${deaths}
        </article>
        ${cards}
      </div>
    `;
  }

  function renderMaterials() {
    const entries = Object.entries(state.adventurer.materials).filter(([, count]) => count > 0);
    els.materials.innerHTML = entries.length
      ? entries.map(([id, count]) => `<div><span>${materials[id].name}</span><strong>${count}</strong></div>`).join("")
      : `<div><span>素材なし</span><strong>0</strong></div>`;
  }

  function renderLog() {
    els.log.innerHTML = state.log.slice(0, 8).map((line) => `<p>${line}</p>`).join("");
  }

  function renderDungeon() {
    if (!state.adventurer.inDungeon || !state.dungeon) return;
    const floor = floorByNumber[state.adventurer.floor];
    els.floorName.textContent = `B${floor.floor}F`;
    els.floor.textContent = floor.name;

    if (cells.length !== VIEW_SIZE * VIEW_SIZE) buildMapCells();
    const enemyByPos = new Map(state.dungeon.enemies.filter((enemy) => enemy.alive).map((enemy) => [`${enemy.x},${enemy.y}`, enemy]));
    const chestByPos = new Set(state.dungeon.chests.filter((chest) => !chest.opened).map((chest) => `${chest.x},${chest.y}`));
    const center = Math.floor(VIEW_SIZE / 2);

    for (let vy = 0; vy < VIEW_SIZE; vy += 1) {
      for (let vx = 0; vx < VIEW_SIZE; vx += 1) {
        const x = state.dungeon.player.x + vx - center;
        const y = state.dungeon.player.y + vy - center;
        const cell = cells[vy * VIEW_SIZE + vx];
        const key = `${x},${y}`;
        const enemy = enemyByPos.get(key);
        cell.textContent = "";
        cell.className = "cell";
        if (!state.dungeon.map[y] || !state.dungeon.map[y][x] || state.dungeon.map[y][x] === "wall") {
          cell.classList.add("tile-wall");
        } else if (state.dungeon.player.x === x && state.dungeon.player.y === y) {
          cell.classList.add("tile-player");
          cell.textContent = "@";
        } else if (enemy) {
          cell.classList.add(enemy.unique ? "tile-unique" : "tile-enemy");
          cell.textContent = enemy.glyph;
        } else if (state.dungeon.stairs.x === x && state.dungeon.stairs.y === y) {
          cell.classList.add("tile-stairs");
          cell.textContent = "階";
        } else if (chestByPos.has(key)) {
          cell.classList.add("tile-chest");
          cell.textContent = "箱";
        } else {
          cell.classList.add("tile-floor");
        }
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
    const oldHpRatio = state.adventurer.hp / getPlayerStats().maxHp;
    state.adventurer.jobId = jobId;
    const stats = getPlayerStats();
    state.adventurer.hp = Math.max(1, Math.round(stats.maxHp * oldHpRatio));
    log(`${jobs[jobId].name}に転職した。`);
    playSfx("select");
    saveGame();
    render();
  }

  function enterDungeon() {
    startAudioFromGesture();
    if (!state.adventurer.inDungeon) {
      state.adventurer.inDungeon = true;
      state.adventurer.floor = 1;
      state.dungeon = generateFloor(1);
      log("B1Fへ足を踏み入れた。");
      playSfx("descend");
    }
    switchView("dungeon");
  }

  function returnTown() {
    startAudioFromGesture();
    if (!state.adventurer.inDungeon) return;
    state.adventurer.inDungeon = false;
    state.dungeon = null;
    state.adventurer.hp = Math.min(getPlayerStats().maxHp, state.adventurer.hp + 8);
    log("街へ帰還した。工房で素材を確認できる。");
    playSfx("return");
    switchView("town");
  }

  function generateFloor(floorNumber) {
    const floor = floorByNumber[floorNumber];
    const map = Array.from({ length: MAP_SIZE }, () => Array.from({ length: MAP_SIZE }, () => "wall"));
    const rooms = [];
    const roomTarget = rand(floor.roomRange[0], floor.roomRange[1]);

    for (let attempts = 0; attempts < 220 && rooms.length < roomTarget; attempts += 1) {
      const w = rand(3, 5);
      const h = rand(3, 5);
      const x = rand(1, MAP_SIZE - w - 2);
      const y = rand(1, MAP_SIZE - h - 2);
      const room = { x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2) };
      if (rooms.some((other) => intersects(room, other))) continue;
      carveRoom(map, room);
      if (rooms.length) carveCorridor(map, rooms[rooms.length - 1], room);
      rooms.push(room);
    }

    if (!rooms.length) {
      const fallback = { x: 1, y: 1, w: 5, h: 5, cx: 3, cy: 3 };
      carveRoom(map, fallback);
      rooms.push(fallback);
    }

    const startRoom = rooms[0];
    const endRoom = farthestRoom(startRoom, rooms);
    const dungeon = {
      map,
      rooms,
      player: { x: startRoom.cx, y: startRoom.cy },
      stairs: { x: endRoom.cx, y: endRoom.cy },
      enemies: [],
      chests: [],
    };

    const blocked = [{ x: dungeon.player.x, y: dungeon.player.y }, dungeon.stairs];
    const enemyCount = floor.enemyCount;
    for (let i = 0; i < enemyCount; i += 1) {
      const monsterId = pick(floor.monsterPool);
      dungeon.enemies.push(createEnemy(monsterId, randomFloorPosition(dungeon, blocked.concat(dungeon.enemies))));
    }
    if (floor.unique) {
      dungeon.enemies.push(createEnemy(floor.unique, randomFloorPosition(dungeon, blocked.concat(dungeon.enemies)), true));
    }

    const chestCount = rand(floor.chestRange[0], floor.chestRange[1]);
    for (let i = 0; i < chestCount; i += 1) {
      dungeon.chests.push({ ...randomFloorPosition(dungeon, blocked.concat(dungeon.enemies, dungeon.chests)), opened: false });
    }

    return dungeon;
  }

  function createEnemy(monsterId, pos, forceUnique) {
    const data = monsters[monsterId];
    markResearch(monsterId, 0);
    return {
      ...JSON.parse(JSON.stringify(data)),
      x: pos.x,
      y: pos.y,
      maxHp: data.hp,
      hp: data.hp,
      alive: true,
      turns: 0,
      telegraphed: false,
      unique: Boolean(forceUnique || data.unique),
    };
  }

  function movePlayer(dx, dy) {
    startAudioFromGesture();
    if (!state.adventurer.inDungeon || !state.dungeon) return;
    const nx = state.dungeon.player.x + dx;
    const ny = state.dungeon.player.y + dy;
    if (!state.dungeon.map[ny] || state.dungeon.map[ny][nx] === "wall") {
      log("壁に阻まれた。");
      playSfx("bump");
      render();
      return;
    }

    const enemy = state.dungeon.enemies.find((item) => item.alive && item.x === nx && item.y === ny);
    if (enemy) {
      bumpAttack(enemy);
      return;
    }

    const chest = state.dungeon.chests.find((item) => !item.opened && item.x === nx && item.y === ny);
    state.dungeon.player.x = nx;
    state.dungeon.player.y = ny;
    if (chest) openChest(chest);

    if (state.dungeon.stairs.x === nx && state.dungeon.stairs.y === ny) {
      descend();
      return;
    }

    enemiesWander();
    playSfx("step");
    saveGame();
    render();
  }

  function openChest(chest) {
    chest.opened = true;
    const materialId = pick(["clean_pelt", "broken_carapace", "poison_fang", "thunder_horn"]);
    addMaterial(materialId, 1);
    log(`宝箱から${materials[materialId].name}を得た。`);
    playSfx("loot");
  }

  function descend() {
    if (state.adventurer.floor >= MAX_FLOOR) {
      log("この先はまだ封鎖されている。赤熱のガルム討伐が今回の目標だ。");
      return;
    }
    state.adventurer.floor += 1;
    state.adventurer.hp = Math.min(getPlayerStats().maxHp, state.adventurer.hp + 4);
    state.dungeon = generateFloor(state.adventurer.floor);
    log(`B${state.adventurer.floor}Fへ降りた。`);
    playSfx("descend");
    saveGame();
    render();
  }

  function bumpAttack(enemy) {
    markResearch(enemy.id, 1);
    log(`${enemy.name}に踏み込み、武器を振るった。`);
    playSfx(enemy.unique ? "boss" : "encounter");
    playerAttack(enemy, "attack");
    if (enemy.hp <= 0) {
      defeatEnemy(enemy);
      return;
    }
    enemyTurn(enemy);
    saveGame();
    render();
  }

  function playerAttack(enemy, mode) {
    const stats = getPlayerStats();
    const attrId = stats.attackAttribute || jobs[state.adventurer.jobId].baseAttackAttribute;
    const raw = stats.attack + rand(0, 3);
    const damage = damageAfterDefense(raw, attrId, enemy);
    enemy.hp -= damage;
    state.adventurer.lastAttack = { attribute: attrId, skill: mode === "skill" ? jobs[state.adventurer.jobId].skill.tag : null };
    log(`${attr(attrId)}属性で${enemy.name}に${damage}ダメージ。`);
    playSfx(attrId === "fire" ? "fire" : attrId === "blunt" ? "blunt" : "slash");
    markResearch(enemy.id, 2);
  }

  function playerSkill(enemy) {
    const job = jobs[state.adventurer.jobId];
    if (job.skill.tag === "observe") {
      observeEnemy(enemy, 2);
      return;
    }
    const stats = getPlayerStats();
    const raw = Math.round((stats.attack + rand(1, 4)) * job.skill.power);
    const damage = damageAfterDefense(raw, job.skill.attribute, enemy);
    enemy.hp -= damage;
    state.adventurer.lastAttack = { attribute: job.skill.attribute, skill: job.skill.tag };
    log(`${job.skill.name}で${enemy.name}に${damage}ダメージ。`);
    playSfx(job.skill.attribute === "blunt" ? "blunt" : "skill");
    markResearch(enemy.id, 2);
  }

  function observeEnemy(enemy, amount) {
    const before = getResearch(enemy.id).level;
    markResearch(enemy.id, Math.min(3, before + (amount || 1)));
    const after = getResearch(enemy.id).level;
    log(after > before ? `${enemy.name}の調査度が${after}になった。` : `${enemy.name}はこれ以上この場で分からない。`);
    playSfx("observe");
  }

  function enemyTurn(enemy) {
    if (enemy.hp <= 0) return;
    enemy.turns += 1;
    if (enemy.telegraphed) {
      enemy.telegraphed = false;
      enemyAttack(enemy, enemy.dangerous.name, enemy.dangerous.attribute, enemy.dangerous.power);
      return;
    }
    if (enemy.dangerous && enemy.turns % enemy.dangerous.every === 0) {
      enemy.telegraphed = true;
      log(enemy.dangerous.telegraph);
      playSfx("warning");
      return;
    }
    enemyAttack(enemy, "攻撃", enemy.attackAttribute, enemy.attack);
  }

  function enemyAttack(enemy, name, attribute, power) {
    const stats = getPlayerStats();
    const res = stats.resistances[attribute] || 0;
    const mult = DATA.resistanceMultipliers[res] ?? 1;
    let damage = Math.max(1, Math.round((power - Math.floor(stats.defense / 2)) * mult));
    if (state.adventurer.guard) {
      damage = Math.max(1, Math.floor(damage / 2));
      state.adventurer.guard = false;
    }
    state.adventurer.hp -= damage;
    log(`${enemy.name}の${name}。${attr(attribute)}属性で${damage}ダメージ。`);
    playSfx(attribute === "fire" ? "fireHit" : "hit");
    if (state.adventurer.hp <= 0) die(`${enemy.name}の${name}`);
  }

  function defeatEnemy(enemy) {
    enemy.alive = false;
    markResearch(enemy.id, 3);
    const materialId = resolveLoot(enemy);
    addMaterial(materialId, 1);
    log(`${enemy.name}を倒し、${materials[materialId].name}を剥ぎ取った。`);
    playSfx(enemy.unique ? "victory" : "loot");
    if (enemy.id === "red_garm" && materialId === "garm_fire_core") {
      state.meta.bounties.red_garm = true;
      log("賞金首依頼達成。ガルムの火除けを製作できる。");
    }
    saveGame();
    render();
  }

  function resolveLoot(enemy) {
    const last = state.adventurer.lastAttack || {};
    const matched = enemy.loot.find((rule) => {
      if (rule.condition === "default") return false;
      const cond = rule.condition;
      if (cond.lastAttribute && cond.lastAttribute !== last.attribute) return false;
      if (cond.notLastAttribute && cond.notLastAttribute === last.attribute) return false;
      if (cond.lastSkill && cond.lastSkill !== last.skill) return false;
      return true;
    });
    return (matched || enemy.loot.find((rule) => rule.condition === "default")).material;
  }

  function die(reason) {
    const floor = state.adventurer.floor;
    state.meta.deaths += 1;
    state.meta.deathLog.unshift(`B${floor}F: ${reason}で死亡`);
    state.meta.deathLog = state.meta.deathLog.slice(0, 12);
    const jobId = state.adventurer.jobId;
    state.adventurer = createAdventurer(jobId);
    state.dungeon = null;
    log("冒険者は失われた。調査記録だけが次の冒険者へ残る。");
    playSfx("death");
    switchView("town");
  }

  function craft(itemId) {
    startAudioFromGesture();
    const item = equipment[itemId];
    if (!item || !item.recipe || !canAfford(item.recipe) || !item.jobs.includes(state.adventurer.jobId)) return;
    Object.entries(item.recipe).forEach(([id, count]) => addMaterial(id, -count));
    state.adventurer.equipment[item.slot] = item.id;
    log(`${item.name}を製作して装備した。`);
    playSfx("craft");
    saveGame();
    render();
  }

  function getPlayerStats() {
    const adv = state.adventurer;
    const job = jobs[adv.jobId];
    const equipped = Object.values(adv.equipment).map((id) => equipment[id]).filter(Boolean);
    const stats = {
      maxHp: job.hp,
      attack: job.attack,
      defense: job.defense,
      attackAttribute: job.baseAttackAttribute,
      resistances: Object.fromEntries(DATA.attributes.map((id) => [id, 0])),
    };
    equipped.forEach((item) => {
      stats.attack += item.attack || 0;
      stats.defense += item.defense || 0;
      if (item.attributeAttack) stats.attackAttribute = item.attributeAttack;
      Object.entries(item.resistances || {}).forEach(([id, value]) => {
        stats.resistances[id] = combineResistance(stats.resistances[id], value);
      });
    });
    adv.maxHp = stats.maxHp;
    adv.hp = Math.min(adv.hp, stats.maxHp);
    return stats;
  }

  function combineResistance(a, b) {
    if (a === "immune" || b === "immune") return "immune";
    return Math.min(5, Number(a || 0) + Number(b || 0));
  }

  function damageAfterDefense(raw, attribute, enemy) {
    const weak = enemy.weaknesses.includes(attribute) ? 1.35 : 1;
    const res = enemy.resistances[attribute] || 0;
    const mult = DATA.resistanceMultipliers[res] ?? 1;
    return Math.max(1, Math.round((raw * weak * mult) - enemy.defense));
  }

  function markResearch(monsterId, level) {
    const rec = getResearch(monsterId);
    rec.seen = true;
    rec.level = Math.max(rec.level, level);
  }

  function getResearch(monsterId) {
    if (!state.meta.research[monsterId]) state.meta.research[monsterId] = { seen: false, level: 0 };
    return state.meta.research[monsterId];
  }

  function canAfford(recipe) {
    return Object.entries(recipe).every(([id, count]) => getMaterialCount(id) >= count);
  }

  function getMaterialCount(id) {
    return state.adventurer.materials[id] || 0;
  }

  function addMaterial(id, count) {
    state.adventurer.materials[id] = Math.max(0, (state.adventurer.materials[id] || 0) + count);
  }

  function getEquipmentName(id) {
    return id && equipment[id] ? equipment[id].name : "なし";
  }

  function formatResistances(resistances) {
    return Object.entries(resistances || {}).map(([id, value]) => `${attr(id)}${value}`).join("、");
  }

  function attr(id) {
    return DATA.attributeLabels[id] || id || "無";
  }

  function lootHint(enemy) {
    return enemy.loot.map((rule) => {
      const material = materials[rule.material].name;
      if (rule.condition === "default") return `通常:${material}`;
      if (rule.condition.lastAttribute) return `${attr(rule.condition.lastAttribute)}:${material}`;
      if (rule.condition.notLastAttribute) return `${attr(rule.condition.notLastAttribute)}以外:${material}`;
      if (rule.condition.lastSkill) return `${skillName(rule.condition.lastSkill)}:${material}`;
      return material;
    });
  }

  function skillName(tag) {
    const found = DATA.jobs.find((job) => job.skill.tag === tag);
    return found ? found.skill.name : tag;
  }

  function enemiesWander() {
    state.dungeon.enemies.filter((enemy) => enemy.alive).forEach((enemy) => {
      const dx = Math.abs(enemy.x - state.dungeon.player.x);
      const dy = Math.abs(enemy.y - state.dungeon.player.y);
      const dist = Math.max(dx, dy);
      if (dist <= 1) {
        enemyTurn(enemy);
        return;
      }
      if (dist > 5 || Math.random() > 0.55) return;
      const options = [
        { x: enemy.x + Math.sign(state.dungeon.player.x - enemy.x), y: enemy.y },
        { x: enemy.x, y: enemy.y + Math.sign(state.dungeon.player.y - enemy.y) },
      ].filter((pos) => canEnemyMove(enemy, pos.x, pos.y));
      if (options.length) {
        const next = pick(options);
        enemy.x = next.x;
        enemy.y = next.y;
      }
    });
  }

  function canEnemyMove(moving, x, y) {
    if (!state.dungeon.map[y] || state.dungeon.map[y][x] !== "floor") return false;
    if (state.dungeon.player.x === x && state.dungeon.player.y === y) return false;
    return !state.dungeon.enemies.some((enemy) => enemy !== moving && enemy.alive && enemy.x === x && enemy.y === y);
  }

  function intersects(a, b) {
    return a.x <= b.x + b.w + 1 && a.x + a.w + 1 >= b.x && a.y <= b.y + b.h + 1 && a.y + a.h + 1 >= b.y;
  }

  function carveRoom(map, room) {
    for (let y = room.y; y < room.y + room.h; y += 1) {
      for (let x = room.x; x < room.x + room.w; x += 1) map[y][x] = "floor";
    }
  }

  function carveCorridor(map, a, b) {
    const firstHorizontal = Math.random() > 0.5;
    if (firstHorizontal) {
      carveH(map, a.cx, b.cx, a.cy);
      carveV(map, a.cy, b.cy, b.cx);
    } else {
      carveV(map, a.cy, b.cy, a.cx);
      carveH(map, a.cx, b.cx, b.cy);
    }
  }

  function carveH(map, x1, x2, y) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x += 1) map[y][x] = "floor";
  }

  function carveV(map, y1, y2, x) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y += 1) map[y][x] = "floor";
  }

  function farthestRoom(from, rooms) {
    return rooms.slice().sort((a, b) => distance(b, from) - distance(a, from))[0];
  }

  function distance(a, b) {
    return Math.abs(a.cx - b.cx) + Math.abs(a.cy - b.cy);
  }

  function randomFloorPosition(dungeon, blocked) {
    for (let attempt = 0; attempt < 300; attempt += 1) {
      const room = pick(dungeon.rooms);
      const x = rand(room.x, room.x + room.w - 1);
      const y = rand(room.y, room.y + room.h - 1);
      if (!blocked.some((item) => item && item.x === x && item.y === y)) return { x, y };
    }
    return { x: 1, y: 1 };
  }

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function askConfirm(title, text, onOk) {
    pendingConfirm = onOk;
    els.confirmTitle.textContent = title;
    els.confirmText.textContent = text;
    els.confirmPanel.classList.remove("hidden");
  }

  function closeConfirm() {
    pendingConfirm = null;
    els.confirmPanel.classList.add("hidden");
  }

  function setupAudio() {
    audio = {
      context: null,
      master: null,
      music: null,
      sfx: null,
      delay: null,
      delayGain: null,
      enabled: localStorage.getItem(AUDIO_KEY) !== "0",
      started: false,
      scene: "silent",
      step: 0,
      timer: null,
    };
    updateAudioButton();
  }

  function toggleAudio() {
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
      audio.music = audio.context.createGain();
      audio.sfx = audio.context.createGain();
      audio.delay = audio.context.createDelay(0.8);
      audio.delayGain = audio.context.createGain();
      audio.master.gain.value = 0.85;
      audio.music.gain.value = 0.55;
      audio.sfx.gain.value = 0.82;
      audio.delay.delayTime.value = 0.24;
      audio.delayGain.gain.value = 0.18;
      audio.music.connect(audio.delay);
      audio.delay.connect(audio.delayGain);
      audio.delayGain.connect(audio.master);
      audio.music.connect(audio.master);
      audio.sfx.connect(audio.master);
      audio.master.connect(audio.context.destination);
    }
    if (audio.context.state === "suspended") audio.context.resume();
    audio.started = true;
    return true;
  }

  function updateAudioButton() {
    if (!els.audioButton) return;
    els.audioButton.classList.toggle("is-on", audio && audio.enabled);
    els.audioIcon.textContent = audio && audio.enabled ? "♫" : "♪";
    els.audioText.textContent = audio && audio.enabled ? (audio.started ? "ON" : "再生") : "音楽";
  }

  function playStartupSound() {
    if (!audio || !audio.context) return;
    const now = audio.context.currentTime + 0.02;
    playTone(523.25, now, 0.16, 0.32, "triangle", audio.sfx);
    playTone(659.25, now + 0.07, 0.18, 0.28, "triangle", audio.sfx);
    playTone(783.99, now + 0.15, 0.24, 0.24, "triangle", audio.sfx);
  }

  function updateAudioScene(force) {
    if (!audio || !audio.enabled || !audio.started) return;
    let scene = "town";
    if (state.adventurer.inDungeon) scene = "dungeon";
    if (force || scene !== audio.scene) startMusicScene(scene);
  }

  function startMusicScene(scene) {
    stopMusic();
    audio.scene = scene;
    audio.step = 0;
    const tick = () => playMusicStep(scene);
    tick();
    audio.timer = window.setInterval(tick, getSceneConfig(scene).interval);
  }

  function stopMusic() {
    if (audio && audio.timer) window.clearInterval(audio.timer);
    if (audio) {
      audio.timer = null;
      audio.scene = "silent";
    }
  }

  function getSceneConfig(scene) {
    const configs = {
      town: {
        interval: 780,
        root: 146.83,
        scale: [0, 3, 5, 7, 10, 12],
        bass: [0, 0, -5, 3],
        melody: [12, 15, 17, 19, 17, 15, 12, 10],
        color: "triangle",
        gain: 0.12,
      },
      dungeon: {
        interval: 920,
        root: 110,
        scale: [0, 2, 3, 7, 8, 10, 12],
        bass: [0, -12, -5, -7],
        melody: [7, 3, 10, 2, 8, 0, 12, 3],
        color: "sine",
        gain: 0.11,
      },
      boss: {
        interval: 360,
        root: 98,
        scale: [0, 1, 4, 6, 7, 10, 12],
        bass: [0, -1, -5, -6],
        melody: [12, 13, 10, 7, 18, 13, 10, 6],
        color: "square",
        gain: 0.12,
      },
    };
    return configs[scene] || configs.town;
  }

  function playMusicStep(scene) {
    if (!ensureAudio()) return;
    const config = getSceneConfig(scene);
    const step = audio.step;
    const now = audio.context.currentTime;
    const bassSemi = config.bass[step % config.bass.length];
    const melodySemi = config.melody[step % config.melody.length];
    const chord = [0, config.scale[2], config.scale[4]].map((semi) => bassSemi + semi);
    chord.forEach((semi, index) => {
      playTone(config.root * semitone(semi - 12), now + index * 0.012, 0.62, config.gain * (index === 0 ? 1.15 : 0.6), "sine", audio.music);
    });
    if (step % 2 === 0) {
      playTone(config.root * semitone(melodySemi), now + 0.04, scene === "town" ? 0.42 : 0.24, config.gain * 0.9, config.color, audio.music);
    }
    if (scene === "boss") {
      playNoise(now, 0.035, 0.035, audio.music, scene === "boss" ? 900 : 1200);
    }
    audio.step += 1;
  }

  function playSfx(type) {
    if (!audio || !audio.enabled || !audio.started || !audio.context) return;
    const now = audio.context.currentTime;
    const out = audio.sfx;
    if (type === "step") playNoise(now, 0.018, 0.055, out, 900);
    if (type === "bump") playTone(92, now, 0.07, 0.08, "square", out);
    if (type === "select") playArp([440, 554.37], now, 0.04, 0.055, out);
    if (type === "descend") playArp([220, 164.81, 110], now, 0.09, 0.07, out);
    if (type === "return") playArp([196, 246.94, 329.63], now, 0.08, 0.06, out);
    if (type === "encounter") playArp([146.83, 220, 277.18], now, 0.065, 0.075, out);
    if (type === "boss") playArp([98, 92.5, 87.31, 196], now, 0.095, 0.09, out);
    if (type === "slash") playSweep(880, 240, now, 0.09, 0.06, "sawtooth", out);
    if (type === "blunt") playTone(72, now, 0.12, 0.11, "square", out);
    if (type === "skill") playArp([392, 523.25, 659.25], now, 0.045, 0.07, out);
    if (type === "fire") playSweep(180, 520, now, 0.16, 0.065, "sawtooth", out);
    if (type === "water") playArp([659.25, 493.88, 369.99], now, 0.045, 0.06, out);
    if (type === "observe") playArp([261.63, 392, 523.25], now, 0.05, 0.052, out);
    if (type === "guard") playTone(164.81, now, 0.12, 0.055, "triangle", out);
    if (type === "warning") playArp([220, 233.08, 220, 233.08], now, 0.055, 0.08, out);
    if (type === "hit") playNoise(now, 0.06, 0.09, out, 700);
    if (type === "fireHit") {
      playNoise(now, 0.14, 0.08, out, 500);
      playSweep(160, 360, now, 0.18, 0.06, "sawtooth", out);
    }
    if (type === "loot") playArp([523.25, 659.25, 783.99], now, 0.055, 0.055, out);
    if (type === "craft") playArp([246.94, 329.63, 493.88, 659.25], now, 0.055, 0.065, out);
    if (type === "victory") playArp([261.63, 329.63, 392, 523.25, 659.25], now, 0.08, 0.075, out);
    if (type === "death") playArp([220, 196, 164.81, 110], now, 0.13, 0.095, out);
    if (type === "flee") playSweep(440, 180, now, 0.16, 0.05, "triangle", out);
  }

  function playArp(freqs, start, gap, gain, out) {
    freqs.forEach((freq, index) => playTone(freq, start + index * gap, gap * 1.7, gain, "triangle", out));
  }

  function playTone(freq, start, duration, gainValue, type, out) {
    if (!audio.context) return;
    const osc = audio.context.createOscillator();
    const gain = audio.context.createGain();
    const filter = audio.context.createBiquadFilter();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(type === "sawtooth" || type === "square" ? 1200 : 1800, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playSweep(from, to, start, duration, gainValue, type, out) {
    if (!audio.context) return;
    const osc = audio.context.createOscillator();
    const gain = audio.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(out);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playNoise(start, duration, gainValue, out, filterFreq) {
    if (!audio.context) return;
    const length = Math.max(1, Math.floor(audio.context.sampleRate * duration));
    const buffer = audio.context.createBuffer(1, length, audio.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const source = audio.context.createBufferSource();
    const filter = audio.context.createBiquadFilter();
    const gain = audio.context.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    source.start(start);
  }

  function semitone(amount) {
    return 2 ** (amount / 12);
  }

  els.tabs.forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  const moveDirections = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0],
    "up-left": [-1, -1],
    "up-right": [1, -1],
    "down-left": [-1, 1],
    "down-right": [1, 1],
  };
  document.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const delta = moveDirections[button.dataset.move];
      if (delta) movePlayer(delta[0], delta[1]);
    });
  });
  els.wait.addEventListener("click", () => {
    startAudioFromGesture();
    enemiesWander();
    log("周囲の気配を探った。");
    render();
  });
  els.returnTown.addEventListener("click", returnTown);
  els.audioButton.addEventListener("click", toggleAudio);
  els.confirmOk.addEventListener("click", () => {
    const action = pendingConfirm;
    closeConfirm();
    if (action) action();
  });
  els.confirmCancel.addEventListener("click", closeConfirm);
  document.addEventListener("pointerdown", (event) => {
    if (event.target && event.target.closest && event.target.closest("#audioButton")) return;
    startAudioFromGesture();
  });
  document.addEventListener("keydown", (event) => {
    startAudioFromGesture();
    const keyDirections = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      Home: [-1, -1],
      PageUp: [1, -1],
      End: [-1, 1],
      PageDown: [1, 1],
      "7": [-1, -1],
      "8": [0, -1],
      "9": [1, -1],
      "4": [-1, 0],
      "6": [1, 0],
      "1": [-1, 1],
      "2": [0, 1],
      "3": [1, 1],
      y: [-1, -1],
      u: [1, -1],
      h: [-1, 0],
      l: [1, 0],
      b: [-1, 1],
      j: [0, 1],
      k: [0, -1],
      n: [1, 1],
    };
    const delta = keyDirections[event.key];
    if (!delta) return;
    event.preventDefault();
    movePlayer(delta[0], delta[1]);
  });

  setupAudio();
  buildMapCells();
  switchView(currentView);
})();
