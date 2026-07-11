(function () {
  "use strict";

  const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const intersects = (a, b, padding = 1) => a.x <= b.x + b.w + padding && a.x + a.w + padding >= b.x && a.y <= b.y + b.h + padding && a.y + a.h + padding >= b.y;
  const distance = (a, b) => Math.abs(a.cx - b.cx) + Math.abs(a.cy - b.cy);
  const gridDistance = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  const ALWAYS_LIT_ROOM_RATIO = 0.25;
  const CRAMPED_ROOM_INTERVAL = 8;
  const LARGE_ROOM_CANDIDATE_CHANCE = 0.36;
  const MIN_NORMAL_ROOM_COUNT = 9;
  const CORRIDOR_BAY_THRESHOLD = 24;
  const CORRIDOR_BAY_INTERVAL = 14;
  const SPECIAL_ROOM_RATES = Object.freeze({
    madness: 0.005,
    treasureVault: 0.008,
    thrill: 0.01,
  });
  const LAYOUTS = Object.freeze([
    { id: "classic", name: "連結遺構", description: "大小の部屋が長めの一本道で連なる標準構造。", roomScale: 1, minSize: 3, maxSize: 7, spacing: 2, connection: "chain", extraLinks: 0.04 },
    { id: "warrens", name: "蟻道迷宮", description: "小部屋と一マス幅の分岐が密集し、接敵方向が目まぐるしく変わる。", roomScale: 1.16, minSize: 3, maxSize: 5, spacing: 1, connection: "nearest", extraLinks: 0.08 },
    { id: "great_halls", name: "巨間回廊", description: "少数の大広間を長い一本道が結ぶ、見通しのよい構造。", roomScale: 0.42, minSize: 7, maxSize: 11, spacing: 2, connection: "chain", extraLinks: 0.08 },
    { id: "crossroads", name: "放射聖堂", description: "中央広間から各区画へ長めの道が伸び、敵が中央へ集まりやすい。", roomScale: 0.68, minSize: 3, maxSize: 7, spacing: 2, connection: "hub", extraLinks: 0.05 },
    { id: "rings", name: "環状遺跡", description: "一マス幅の回廊が輪を作り、追跡をかわす逃げ道が多い。", roomScale: 0.86, minSize: 4, maxSize: 7, spacing: 2, connection: "nearest", extraLinks: 0.24 },
    { id: "longways", name: "遠路坑道", description: "離れた区画を長い一本道が結び、移動中の判断が重要になる。", roomScale: 0.62, minSize: 3, maxSize: 6, spacing: 3, connection: "farthest", extraLinks: 0.04 },
  ]);

  function carveRoom(map, room) {
    for (let y = room.y; y < room.y + room.h; y += 1) {
      for (let x = room.x; x < room.x + room.w; x += 1) map[y][x] = "floor";
    }
  }

  function carveH(map, x1, x2, y) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x += 1) map[y][x] = "floor";
  }

  function carveV(map, y1, y2, x) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y += 1) map[y][x] = "floor";
  }

  function connect(map, a, b) {
    if (Math.random() > 0.5) {
      carveH(map, a.cx, b.cx, a.cy);
      carveV(map, a.cy, b.cy, b.cx);
    } else {
      carveV(map, a.cy, b.cy, a.cx);
      carveH(map, a.cx, b.cx, b.cy);
    }
  }

  function assignRoomLighting(rooms) {
    rooms.forEach((room) => { room.alwaysLit = false; });
    const candidates = rooms.slice();
    const litRoomCount = Math.max(1, Math.round(rooms.length * ALWAYS_LIT_ROOM_RATIO));
    for (let index = 0; index < litRoomCount && candidates.length; index += 1) {
      const candidateIndex = rand(0, candidates.length - 1);
      candidates.splice(candidateIndex, 1)[0].alwaysLit = true;
    }
  }

  function alwaysLitTileKeys(dungeon) {
    const rooms = Array.isArray(dungeon?.rooms) ? dungeon.rooms : [];
    const map = Array.isArray(dungeon?.map) ? dungeon.map : [];
    const litRooms = rooms.filter((room) => room.alwaysLit);
    const keys = new Set();
    const addFloor = (x, y) => {
      if (map[y]?.[x] === "floor") keys.add(`${x},${y}`);
    };

    litRooms.forEach((room) => {
      for (let y = room.y; y < room.y + room.h; y += 1) {
        for (let x = room.x; x < room.x + room.w; x += 1) addFloor(x, y);
      }

      // 部屋から通路へ踏み出す最初の一マスだけ、部屋の常時照明を延長する。
      for (let x = room.x; x < room.x + room.w; x += 1) {
        [[x, room.y - 1], [x, room.y + room.h]].forEach(([tileX, tileY]) => {
          if (!rooms.some((candidate) => roomContains(candidate, { x: tileX, y: tileY }))) addFloor(tileX, tileY);
        });
      }
      for (let y = room.y; y < room.y + room.h; y += 1) {
        [[room.x - 1, y], [room.x + room.w, y]].forEach(([tileX, tileY]) => {
          if (!rooms.some((candidate) => roomContains(candidate, { x: tileX, y: tileY }))) addFloor(tileX, tileY);
        });
      }
    });
    return keys;
  }

  function roomArea(room) {
    return Math.max(0, Number(room?.w || 0) * Number(room?.h || 0));
  }

  function weightedPick(items, getWeight) {
    const weighted = items
      .map((item) => ({ item, weight: Math.max(0, Number(getWeight(item) || 0)) }))
      .filter((entry) => entry.weight > 0);
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    if (!total) return null;
    let roll = Math.random() * total;
    for (const entry of weighted) {
      roll -= entry.weight;
      if (roll < 0) return entry.item;
    }
    return weighted[weighted.length - 1].item;
  }

  function randomFloorPosition(dungeon, blocked, roomFilter = null) {
    const rooms = dungeon.rooms.filter((room, roomIndex) => !roomFilter || roomFilter(room, roomIndex));
    if (!rooms.length) return null;
    for (let attempts = 0; attempts < 500; attempts += 1) {
      // Picking by area makes every room tile approximately equally likely. A 1x3
      // pocket no longer receives the same population ticket as a 10x10 hall.
      const room = weightedPick(rooms, roomArea);
      if (!room) return null;
      const pos = { x: rand(room.x, room.x + room.w - 1), y: rand(room.y, room.y + room.h - 1) };
      if (!blocked.some((item) => item && item.x === pos.x && item.y === pos.y)) return pos;
    }
    return null;
  }

  function roomContains(room, pos) {
    return Boolean(room && pos
      && pos.x >= room.x && pos.x < room.x + room.w
      && pos.y >= room.y && pos.y < room.y + room.h);
  }

  function samePosition(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function roomEntryTiles(dungeon, room) {
    if (!room) return [];
    const entries = [];
    for (let y = room.y; y < room.y + room.h; y += 1) {
      for (let x = room.x; x < room.x + room.w; x += 1) {
        const pos = { x, y };
        let opensOutside = false;
        for (let dy = -1; dy <= 1 && !opensOutside; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if ((!dx && !dy) || roomContains(room, { x: x + dx, y: y + dy })) continue;
            if (dungeon.map[y + dy]?.[x + dx] === "floor") {
              opensOutside = true;
              break;
            }
          }
        }
        if (opensOutside) entries.push(pos);
      }
    }
    return entries;
  }

  function specialRoomIndexSet(dungeon) {
    return new Set([dungeon.madnessRoom, dungeon.treasureVault, dungeon.thrillRoom]
      .filter(Boolean)
      .map((room) => Number(room.roomIndex)));
  }

  function shuffled(items) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = rand(0, index);
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function roomEventTiles(dungeon, room) {
    const blocked = [dungeon.player, ...dungeon.stairs, ...dungeon.enemies, ...dungeon.chests];
    const entryTiles = roomEntryTiles(dungeon, room);
    const tiles = [];
    for (let y = room.y; y < room.y + room.h; y += 1) {
      for (let x = room.x; x < room.x + room.w; x += 1) {
        // Every corridor reaches a room through its centre. Keep a 3x3 landing clear.
        if (Math.max(Math.abs(x - room.cx), Math.abs(y - room.cy)) <= 1) continue;
        const pos = { x, y };
        // Discovery occurs on the room boundary. Keep every possible approach and
        // its two-tile landing buffer free so concealed contents can never block it.
        if (entryTiles.some((entry) => gridDistance(entry, pos) <= 2)) continue;
        if (!blocked.some((item) => samePosition(item, pos))) tiles.push(pos);
      }
    }
    return tiles;
  }

  function roomMetadata(dungeon, room, extra = {}) {
    return {
      roomIndex: dungeon.rooms.indexOf(room),
      x: room.x,
      y: room.y,
      w: room.w,
      h: room.h,
      discovered: false,
      ...extra,
    };
  }

  function eligibleEventRooms(dungeon, usedRoomIndices, minimumTiles) {
    return dungeon.rooms.filter((room, roomIndex) => (
      roomIndex > 0
      && !usedRoomIndices.has(roomIndex)
      && !room.cramped
      && room.w >= 4
      && room.h >= 4
      && !dungeon.stairs.some((stairs) => roomContains(room, stairs))
      && roomEventTiles(dungeon, room).length >= minimumTiles
    ));
  }

  function weightedDistinctEnemies(tickets, count, createEnemy, positions) {
    const pool = tickets.slice();
    const enemies = [];
    let summonerCount = 0;
    let timeStopCount = 0;
    while (pool.length && enemies.length < count) {
      const id = pick(pool);
      for (let index = pool.length - 1; index >= 0; index -= 1) {
        if (pool[index] === id) pool.splice(index, 1);
      }
      const enemy = createEnemy(id, positions[enemies.length], true);
      const summoner = Boolean(enemy.summon);
      const timeStopper = enemy.specialAttack === "time_stop";
      if ((summoner && summonerCount >= 1) || (timeStopper && timeStopCount >= 1)) continue;
      summonerCount += Number(summoner);
      timeStopCount += Number(timeStopper);
      enemies.push(enemy);
    }
    return enemies;
  }

  function populateMadnessRoom(dungeon, floor, createEnemy, tickets, usedRoomIndices) {
    const maximum = floor.floor < 40 ? 4 : floor.floor < 70 ? 5 : 6;
    const minimum = maximum === 4 ? 4 : maximum - 1;
    const rooms = eligibleEventRooms(dungeon, usedRoomIndices, minimum);
    if (!rooms.length || new Set(tickets).size < minimum) return false;
    const room = pick(rooms);
    const positions = shuffled(roomEventTiles(dungeon, room));
    const desiredCount = rand(minimum, maximum);
    const enemies = weightedDistinctEnemies(tickets, desiredCount, createEnemy, positions);
    if (enemies.length < minimum) return false;
    enemies.forEach((enemy) => {
      enemy.specialRoom = "madness";
      enemy.madnessGathering = true;
      dungeon.enemies.push(enemy);
    });
    const roomIndex = dungeon.rooms.indexOf(room);
    usedRoomIndices.add(roomIndex);
    dungeon.madnessRoom = roomMetadata(dungeon, room, { enemyCount: enemies.length });
    dungeon.uniqueSpawned = true;
    return true;
  }

  function populateTreasureVault(dungeon, usedRoomIndices) {
    const minimum = 7;
    const rooms = eligibleEventRooms(dungeon, usedRoomIndices, minimum);
    if (!rooms.length) return false;
    const room = pick(rooms);
    const positions = shuffled(roomEventTiles(dungeon, room));
    const chestCount = Math.min(rand(7, 11), positions.length);
    positions.slice(0, chestCount).forEach((pos) => {
      dungeon.chests.push({ ...pos, opened: false, specialRoom: "treasureVault", treasureVault: true });
    });
    const roomIndex = dungeon.rooms.indexOf(room);
    usedRoomIndices.add(roomIndex);
    dungeon.treasureVault = roomMetadata(dungeon, room, { chestCount });
    return true;
  }

  function populateThrillRoom(dungeon, createEnemy, tickets, artifactId, randomArtifactReward, usedRoomIndices) {
    if (!tickets.length || (!artifactId && !randomArtifactReward)) return false;
    const rooms = eligibleEventRooms(dungeon, usedRoomIndices, 2);
    if (!rooms.length) return false;
    const room = pick(rooms);
    const positions = roomEventTiles(dungeon, room);
    const chestPos = positions.slice().sort((a, b) => (
      Math.max(Math.abs(b.x - room.cx), Math.abs(b.y - room.cy))
      - Math.max(Math.abs(a.x - room.cx), Math.abs(a.y - room.cy))
    ))[0];
    const guardianPos = positions.filter((pos) => !samePosition(pos, chestPos)).sort((a, b) => (
      Math.max(Math.abs(a.x - chestPos.x), Math.abs(a.y - chestPos.y))
      - Math.max(Math.abs(b.x - chestPos.x), Math.abs(b.y - chestPos.y))
    ))[0];
    if (!chestPos || !guardianPos) return false;
    const guardian = createEnemy(pick(tickets), guardianPos, true);
    guardian.maxHp = Math.round(guardian.maxHp * 1.5);
    guardian.hp = guardian.maxHp;
    guardian.attack = Math.round(guardian.attack * 1.25);
    guardian.defense = Math.round(guardian.defense * 1.15);
    guardian.acceleration = Number(guardian.acceleration || 0) + 8;
    guardian.specialRoom = "thrill";
    guardian.thrillRoomGuardian = true;
    guardian.asleep = false;
    dungeon.enemies.push(guardian);
    dungeon.chests.push({
      ...chestPos,
      opened: false,
      specialRoom: "thrill",
      thrillArtifact: true,
      artifactId,
      randomArtifactReward: Boolean(randomArtifactReward),
    });
    const roomIndex = dungeon.rooms.indexOf(room);
    usedRoomIndices.add(roomIndex);
    dungeon.thrillRoom = roomMetadata(dungeon, room, {
      guardianName: guardian.name,
      artifactId,
      randomArtifactReward: Boolean(randomArtifactReward),
    });
    dungeon.uniqueSpawned = true;
    return true;
  }

  function populateSpecialRooms(dungeon, floor, createEnemy, options, rolls) {
    const usedRoomIndices = new Set();
    const requests = [
      {
        id: "thrill",
        rolled: rolls.thrill,
        populate: () => populateThrillRoom(dungeon, createEnemy, options.thrillUniqueIds || [], options.artifactId, options.thrillRandomArtifact, usedRoomIndices),
      },
      {
        id: "madness",
        rolled: rolls.madness,
        populate: () => populateMadnessRoom(dungeon, floor, createEnemy, options.madnessUniqueIds || [], usedRoomIndices),
      },
      { id: "treasureVault", rolled: rolls.treasureVault, populate: () => populateTreasureVault(dungeon, usedRoomIndices) },
    ].filter((request) => request.rolled);
    const failed = [];
    let placed = 0;
    requests.forEach((request) => {
      if (request.populate()) placed += 1;
      else failed.push(request.id);
    });
    // A single rare-room roll is guaranteed across map retries. Simultaneous
    // rolls degrade explicitly in thrill -> madness -> vault priority instead of
    // ever stopping floor generation because three safe rooms did not fit.
    dungeon.deferredSpecialRooms = failed;
    return requests.length <= 1 ? failed.length === 0 : placed > 0;
  }

  function specialRoomTiles(dungeon, undiscoveredOnly = true) {
    return [dungeon.madnessRoom, dungeon.treasureVault, dungeon.thrillRoom]
      .filter((room) => room && (!undiscoveredOnly || !room.discovered))
      .flatMap((room) => {
        const tiles = [];
        for (let y = room.y; y < room.y + room.h; y += 1) {
          for (let x = room.x; x < room.x + room.w; x += 1) tiles.push({ x, y });
        }
        return tiles;
      });
  }

  function spawnPosition(dungeon, minDistance) {
    const blocked = [
      dungeon.player,
      ...dungeon.stairs,
      ...dungeon.enemies.filter((enemy) => enemy.alive),
      ...dungeon.chests.filter((chest) => !chest.opened),
      ...(dungeon.traps || []).filter((trap) => !trap.disarmed),
      ...specialRoomTiles(dungeon),
    ];
    for (let attempts = 0; attempts < 500; attempts += 1) {
      const pos = randomFloorPosition(dungeon, blocked);
      if (!pos) return null;
      const distanceFromPlayer = Math.max(Math.abs(pos.x - dungeon.player.x), Math.abs(pos.y - dungeon.player.y));
      if (distanceFromPlayer >= minDistance) return pos;
    }
    return null;
  }

  function trapPosition(dungeon, options = {}) {
    const minPlayerDistance = Math.max(0, Number(options.minPlayerDistance ?? 5));
    const minTrapDistance = Math.max(1, Number(options.minTrapDistance ?? 3));
    const protectedDistance = Math.max(0, Number(options.protectedDistance ?? 2));
    const specialIndices = specialRoomIndexSet(dungeon);
    const blocked = [
      dungeon.player,
      ...dungeon.stairs,
      ...dungeon.enemies.filter((enemy) => enemy.alive),
      ...dungeon.chests.filter((chest) => !chest.opened),
      ...(dungeon.traps || []).filter((trap) => !trap.disarmed),
      ...specialRoomTiles(dungeon, false),
    ];
    const candidates = [];
    dungeon.rooms.forEach((room, roomIndex) => {
      if (specialIndices.has(roomIndex) || room.cramped || Math.min(room.w, room.h) <= 1) return;
      const entries = roomEntryTiles(dungeon, room);
      for (let y = room.y; y < room.y + room.h; y += 1) {
        for (let x = room.x; x < room.x + room.w; x += 1) {
          const pos = { x, y };
          if (blocked.some((item) => item && samePosition(item, pos))) continue;
          if (gridDistance(pos, dungeon.player) < minPlayerDistance) continue;
          if (dungeon.stairs.some((stairs) => gridDistance(pos, stairs) <= protectedDistance)) continue;
          if (entries.some((entry) => gridDistance(pos, entry) <= protectedDistance)) continue;
          if ((dungeon.traps || []).some((trap) => !trap.disarmed && gridDistance(pos, trap) < minTrapDistance)) continue;
          candidates.push(pos);
        }
      }
    });
    if (!candidates.length) return null;
    const activeTraps = (dungeon.traps || []).filter((trap) => !trap.disarmed);
    if (!activeTraps.length) return pick(candidates);
    const scored = candidates.map((pos) => ({
      pos,
      spacing: Math.min(...activeTraps.map((trap) => gridDistance(pos, trap))),
    }));
    const widestSpacing = Math.max(...scored.map((entry) => entry.spacing));
    return pick(scored.filter((entry) => entry.spacing === widestSpacing).map((entry) => entry.pos));
  }

  function layoutCompatible(layout, size) {
    if (layout.id === "great_halls" && size < 48) return false;
    if (layout.id === "warrens" && size > 52) return false;
    return true;
  }

  function chooseLayout(layoutId, size) {
    const compatible = LAYOUTS.filter((layout) => layoutCompatible(layout, size));
    const requested = compatible.find((layout) => layout.id === layoutId);
    return requested || pick(compatible);
  }

  function connectionTarget(rooms, room, layout) {
    if (layout.connection === "hub") return rooms[0];
    if (layout.connection === "nearest") return [...rooms].sort((a, b) => distance(a, room) - distance(b, room))[0];
    if (layout.connection === "farthest") return [...rooms].sort((a, b) => distance(b, room) - distance(a, room))[0];
    return rooms[rooms.length - 1];
  }

  function reachableTiles(map, start) {
    const seen = new Set([`${start.x},${start.y}`]);
    const queue = [{ x: start.x, y: start.y }];
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const x = current.x + dx;
        const y = current.y + dy;
        const key = `${x},${y}`;
        if (seen.has(key) || map[y]?.[x] !== "floor") return;
        seen.add(key);
        queue.push({ x, y });
      });
    }
    return seen;
  }

  function isReachableDungeon(dungeon) {
    const reachable = reachableTiles(dungeon.map, dungeon.player);
    const targets = [
      ...dungeon.rooms.map((room) => ({ x: room.cx, y: room.cy })),
      ...dungeon.stairs,
      ...dungeon.enemies,
      ...dungeon.chests,
    ];
    return targets.every((target) => reachable.has(`${target.x},${target.y}`));
  }

  function walkableTileCount(map) {
    return map.reduce((total, row) => total + row.filter((tile) => tile === "floor").length, 0);
  }

  function enemyDensityBand(floorNumber) {
    return floorNumber <= 30
      ? { min: 0.03, max: 0.065 }
      : { min: 0.04, max: 0.08 };
  }

  function initialEnemyTarget(floor, walkableCount) {
    const configured = Math.max(0, Math.floor(Number(floor.enemyCount || 0)));
    if (!configured) return 0;
    const band = enemyDensityBand(Number(floor.floor || 1));
    // Leave a small headroom inside the hard density ceiling for a natural
    // unique, a guardian, or a later spawn without immediately overflowing it.
    const placementMax = Math.max(band.min, band.max - 0.005);
    return clamp(configured, Math.ceil(walkableCount * band.min), Math.floor(walkableCount * placementMax));
  }

  function roomEnemyLimit(room) {
    if (room.cramped || Math.min(room.w, room.h) <= 1) return 1;
    return Math.max(1, Math.ceil(roomArea(room) / 10));
  }

  function initialEnemyPosition(dungeon, blocked) {
    const specialIndices = specialRoomIndexSet(dungeon);
    const eligibleRooms = dungeon.rooms.filter((room, roomIndex) => {
      if (roomIndex === 0 || specialIndices.has(roomIndex)) return false;
      const occupied = dungeon.enemies.filter((enemy) => !enemy.specialRoom && roomContains(room, enemy)).length;
      return occupied < roomEnemyLimit(room);
    });
    if (!eligibleRooms.length) return null;

    const available = eligibleRooms.map((room) => {
      const occupied = dungeon.enemies.filter((enemy) => !enemy.specialRoom && roomContains(room, enemy));
      if (occupied.length >= roomEnemyLimit(room)) return null;
      const entries = roomEntryTiles(dungeon, room);
      const positions = [];
      for (let y = room.y; y < room.y + room.h; y += 1) {
        for (let x = room.x; x < room.x + room.w; x += 1) {
          const pos = { x, y };
          if (blocked.some((item) => item && samePosition(item, pos))) continue;
          const crowdedEntrance = entries.some((entry) => (
            gridDistance(entry, pos) <= 3
            && occupied.filter((enemy) => gridDistance(entry, enemy) <= 3).length >= 2
          ));
          if (!crowdedEntrance) positions.push(pos);
        }
      }
      return positions.length ? { room, positions } : null;
    }).filter(Boolean);
    const selected = weightedPick(available, (entry) => roomArea(entry.room));
    return selected ? pick(selected.positions) : null;
  }

  function populateInitialEnemies(dungeon, floor, createEnemy) {
    const walkableCount = walkableTileCount(dungeon.map);
    const target = initialEnemyTarget(floor, walkableCount);
    const plans = [];
    if (target && floor.rareMonsterPool?.length && Math.random() < Number(floor.rareMonsterChance || 0)) {
      plans.push({ id: pick(floor.rareMonsterPool), unique: false });
    }
    const uniqueIds = floor.uniques || (floor.unique ? [floor.unique] : []);
    if (target && !dungeon.uniqueSpawned && uniqueIds.length && Math.random() < Number(floor.uniqueChance || 0)) {
      plans.push({ id: pick(uniqueIds), unique: true });
    }
    while (plans.length < target) plans.push({ id: pick(floor.monsterPool), unique: false });

    const baseBlocked = [dungeon.player, ...dungeon.stairs, ...specialRoomTiles(dungeon, false)];
    let placed = 0;
    for (const plan of plans) {
      const pos = initialEnemyPosition(dungeon, baseBlocked.concat(dungeon.enemies));
      if (!pos) throw new Error("初期敵を安全な密度で配置できませんでした。");
      dungeon.enemies.push(createEnemy(plan.id, pos, plan.unique));
      if (plan.unique) dungeon.uniqueSpawned = true;
      placed += 1;
    }

    const band = enemyDensityBand(Number(floor.floor || 1));
    const configuredSpawnCap = Math.max(target, Math.floor(Number(floor.spawnCap || target)));
    dungeon.walkableTileCount = walkableCount;
    dungeon.initialEnemyTarget = target;
    dungeon.initialEnemyCount = placed;
    dungeon.enemyDensityBand = band;
    dungeon.enemySpawnCap = Math.max(target, Math.min(configuredSpawnCap, Math.floor(walkableCount * band.max)));
  }

  function carvePassingBays(map, rooms) {
    const roomTiles = new Set();
    rooms.forEach((room) => {
      for (let y = room.y; y < room.y + room.h; y += 1) {
        for (let x = room.x; x < room.x + room.w; x += 1) roomTiles.add(`${x},${y}`);
      }
    });
    const corridor = (x, y) => map[y]?.[x] === "floor" && !roomTiles.has(`${x},${y}`);
    const segments = [];
    for (let y = 1; y < map.length - 1; y += 1) {
      let start = null;
      for (let x = 1; x < map.length; x += 1) {
        if (corridor(x, y) && start === null) start = x;
        if ((!corridor(x, y) || x === map.length - 1) && start !== null) {
          const end = corridor(x, y) ? x : x - 1;
          if (end - start + 1 > CORRIDOR_BAY_THRESHOLD) segments.push({ axis: "h", fixed: y, start, end });
          start = null;
        }
      }
    }
    for (let x = 1; x < map.length - 1; x += 1) {
      let start = null;
      for (let y = 1; y < map.length; y += 1) {
        if (corridor(x, y) && start === null) start = y;
        if ((!corridor(x, y) || y === map.length - 1) && start !== null) {
          const end = corridor(x, y) ? y : y - 1;
          if (end - start + 1 > CORRIDOR_BAY_THRESHOLD) segments.push({ axis: "v", fixed: x, start, end });
          start = null;
        }
      }
    }

    const passingBays = [];
    const carveBay = (cells) => {
      if (!cells.every(({ x, y }) => x > 0 && y > 0 && x < map.length - 1 && y < map.length - 1 && map[y][x] === "wall")) return false;
      cells.forEach(({ x, y }) => { map[y][x] = "floor"; });
      passingBays.push(...cells);
      return true;
    };
    segments.forEach((segment) => {
      for (let offset = CORRIDOR_BAY_INTERVAL; segment.start + offset < segment.end; offset += CORRIDOR_BAY_INTERVAL) {
        const position = segment.start + offset;
        const sides = Math.random() < 0.5 ? [-1, 1] : [1, -1];
        for (const side of sides) {
          const cells = segment.axis === "h"
            ? [{ x: position, y: segment.fixed + side }, { x: position + 1, y: segment.fixed + side }]
            : [{ x: segment.fixed + side, y: position }, { x: segment.fixed + side, y: position + 1 }];
          if (carveBay(cells)) break;
        }
      }
    });
    return passingBays;
  }

  function generateOnce({ size, floor, createEnemy, layout, specialRooms, specialRoomRolls }) {
    const map = Array.from({ length: size }, () => Array(size).fill("wall"));
    const rooms = [];
    const minimumRoomCount = floor.floor < 100
      ? Math.max(MIN_NORMAL_ROOM_COUNT, Number(floor.stairRange?.[1] || 5) + 3)
      : Math.max(2, Number(floor.stairRange?.[0] || 1) + 1);
    const roomTarget = Math.max(minimumRoomCount, Math.round(rand(floor.roomRange[0], floor.roomRange[1]) * layout.roomScale));
    if (layout.connection === "hub") {
      const w = 9;
      const h = 9;
      const x = Math.floor((size - w) / 2);
      const y = Math.floor((size - h) / 2);
      const hub = { x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2), cramped: false, large: true };
      carveRoom(map, hub);
      rooms.push(hub);
    }
    for (let attempts = 0; attempts < 3200 && rooms.length < roomTarget; attempts += 1) {
      const cramped = rooms.length % CRAMPED_ROOM_INTERVAL === 1;
      const naturallyLarge = layout.id === "great_halls";
      const large = !cramped && (naturallyLarge || Math.random() < LARGE_ROOM_CANDIDATE_CHANCE);
      const largeMin = Math.max(7, layout.maxSize + 1);
      const largeMax = Math.min(11, largeMin + 3);
      let w = cramped ? rand(1, 2) : large && !naturallyLarge ? rand(largeMin, largeMax) : rand(layout.minSize, layout.maxSize);
      let h = cramped ? rand(Math.max(3, layout.minSize), Math.max(3, layout.maxSize)) : large && !naturallyLarge ? rand(largeMin, largeMax) : rand(layout.minSize, layout.maxSize);
      if (cramped && Math.random() > 0.5) [w, h] = [h, w];
      const x = rand(1, size - w - 2);
      const y = rand(1, size - h - 2);
      const room = { x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2), cramped, large };
      if (rooms.some((other) => intersects(room, other, layout.spacing))) continue;
      carveRoom(map, room);
      if (rooms.length) connect(map, connectionTarget(rooms, room, layout), room);
      rooms.push(room);
    }
    if (rooms.length < minimumRoomCount) throw new Error("ダンジョン生成に失敗しました。");
    const extraConnectionCount = Math.floor(rooms.length * layout.extraLinks);
    for (let index = 0; index < extraConnectionCount; index += 1) {
      const a = pick(rooms);
      const candidates = rooms.filter((room) => room !== a);
      if (candidates.length) connect(map, a, pick(candidates));
    }
    const passingBays = carvePassingBays(map, rooms);
    assignRoomLighting(rooms);
    const startRoom = rooms[0];
    const stairCount = Math.min(rooms.length - 1, rand(floor.stairRange?.[0] || 3, floor.stairRange?.[1] || 5));
    const stairRooms = rooms.slice(1).sort((a, b) => distance(startRoom, b) - distance(startRoom, a)).slice(0, stairCount);
    const dungeon = {
      size, map, rooms,
      layout: { id: layout.id, name: layout.name, description: layout.description },
      player: { x: startRoom.cx, y: startRoom.cy },
      stairs: stairRooms.map((room) => ({ x: room.cx, y: room.cy })),
      enemies: [], chests: [], traps: [], passingBays, excavatedTiles: [], turnsElapsed: 0, actionProgress: 0, uniqueSpawned: false,
    };
    if (!populateSpecialRooms(dungeon, floor, createEnemy, specialRooms, specialRoomRolls)) {
      throw new Error("特別室の安全な配置に失敗しました。");
    }
    const blocked = [dungeon.player, ...dungeon.stairs, ...specialRoomTiles(dungeon, false)];
    populateInitialEnemies(dungeon, floor, createEnemy);
    const chestCount = rand(floor.chestRange[0], floor.chestRange[1]);
    for (let i = 0; i < chestCount; i += 1) {
      const pos = randomFloorPosition(dungeon, blocked.concat(dungeon.enemies, dungeon.chests));
      if (!pos) break;
      dungeon.chests.push({ ...pos, opened: false });
    }
    return dungeon;
  }

  function generate({ size, floor, createEnemy, layoutId, specialRooms = {}, specialRoomChances = {} }) {
    const selected = chooseLayout(layoutId, size);
    const compatibleAlternatives = shuffled(LAYOUTS.filter((layout) => layoutCompatible(layout, size) && layout !== selected));
    const attempts = [
      selected, selected, selected, selected, selected, selected,
      ...compatibleAlternatives.flatMap((layout) => [layout, layout, layout]),
    ];
    const specialRoomsEnabled = Object.keys(specialRooms).length > 0 || Object.keys(specialRoomChances).length > 0;
    const specialRoomRates = specialRoomsEnabled
      ? { ...SPECIAL_ROOM_RATES, ...specialRoomChances }
      : { madness: 0, treasureVault: 0, thrill: 0 };
    const ordinaryFloor = floor.floor >= 11 && floor.floor < 100 && floor.floor % 10 !== 0;
    const nonFinalFloor = floor.floor < 100 && floor.floor % 10 !== 0;
    const madnessMaximum = floor.floor < 40 ? 4 : floor.floor < 70 ? 5 : 6;
    const madnessMinimum = madnessMaximum === 4 ? 4 : madnessMaximum - 1;
    const canMadness = new Set(specialRooms.madnessUniqueIds || []).size >= madnessMinimum;
    const canThrill = Boolean((specialRooms.thrillUniqueIds || []).length && (specialRooms.artifactId || specialRooms.thrillRandomArtifact));
    // Roll once per floor, then preserve that decision across layout retries. A
    // rare-room roll is never silently lost merely because the first map had no
    // safe room after stairs and entrance buffers were reserved.
    const specialRoomRolls = {
      madness: ordinaryFloor && canMadness && Math.random() < specialRoomRates.madness,
      treasureVault: nonFinalFloor && Math.random() < specialRoomRates.treasureVault,
      thrill: ordinaryFloor && canThrill && Math.random() < specialRoomRates.thrill,
    };
    for (const layout of attempts) {
      try {
        const dungeon = generateOnce({ size, floor, createEnemy, layout, specialRooms, specialRoomRolls });
        if (isReachableDungeon(dungeon)) return dungeon;
      } catch (error) {
        // Try the same style once more, then fall back to the proven classic layout.
      }
    }
    throw new Error("到達可能なダンジョンを生成できませんでした。");
  }

  window.HD_DUNGEON = {
    generate,
    spawnPosition,
    trapPosition,
    layouts: LAYOUTS,
    alwaysLitRoomRatio: ALWAYS_LIT_ROOM_RATIO,
    crampedRoomInterval: CRAMPED_ROOM_INTERVAL,
    largeRoomCandidateChance: LARGE_ROOM_CANDIDATE_CHANCE,
    minNormalRoomCount: MIN_NORMAL_ROOM_COUNT,
    corridorBayThreshold: CORRIDOR_BAY_THRESHOLD,
    specialRoomRates: SPECIAL_ROOM_RATES,
    roomContains,
    roomEntryTiles,
    alwaysLitTileKeys,
    isReachableDungeon,
  };
})();
