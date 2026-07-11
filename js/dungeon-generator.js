(function () {
  "use strict";

  const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const intersects = (a, b) => a.x <= b.x + b.w + 1 && a.x + a.w + 1 >= b.x && a.y <= b.y + b.h + 1 && a.y + a.h + 1 >= b.y;
  const distance = (a, b) => Math.abs(a.cx - b.cx) + Math.abs(a.cy - b.cy);

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

  function randomFloorPosition(dungeon, blocked) {
    for (let attempts = 0; attempts < 500; attempts += 1) {
      const room = pick(dungeon.rooms);
      const pos = { x: rand(room.x, room.x + room.w - 1), y: rand(room.y, room.y + room.h - 1) };
      if (!blocked.some((item) => item && item.x === pos.x && item.y === pos.y)) return pos;
    }
    return { x: dungeon.player.x, y: dungeon.player.y };
  }

  function spawnPosition(dungeon, minDistance) {
    const blocked = [dungeon.player, ...dungeon.stairs, ...dungeon.enemies.filter((enemy) => enemy.alive), ...dungeon.chests.filter((chest) => !chest.opened)];
    for (let attempts = 0; attempts < 500; attempts += 1) {
      const pos = randomFloorPosition(dungeon, blocked);
      const distanceFromPlayer = Math.max(Math.abs(pos.x - dungeon.player.x), Math.abs(pos.y - dungeon.player.y));
      if (distanceFromPlayer >= minDistance) return pos;
    }
    return null;
  }

  function generate({ size, floor, createEnemy }) {
    const map = Array.from({ length: size }, () => Array(size).fill("wall"));
    const rooms = [];
    const roomTarget = rand(floor.roomRange[0], floor.roomRange[1]);
    for (let attempts = 0; attempts < 2400 && rooms.length < roomTarget; attempts += 1) {
      const w = rand(3, 7);
      const h = rand(3, 7);
      const x = rand(1, size - w - 2);
      const y = rand(1, size - h - 2);
      const room = { x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2) };
      if (rooms.some((other) => intersects(room, other))) continue;
      carveRoom(map, room);
      if (rooms.length) connect(map, rooms[rooms.length - 1], room);
      rooms.push(room);
    }
    if (!rooms.length) throw new Error("ダンジョン生成に失敗しました。");
    const startRoom = rooms[0];
    const stairCount = rand(floor.stairRange?.[0] || 3, floor.stairRange?.[1] || 5);
    const stairRooms = rooms.slice(1).sort((a, b) => distance(startRoom, b) - distance(startRoom, a)).slice(0, stairCount);
    const dungeon = {
      map, rooms,
      player: { x: startRoom.cx, y: startRoom.cy },
      stairs: stairRooms.map((room) => ({ x: room.cx, y: room.cy })),
      enemies: [], chests: [], turnsElapsed: 0, actionProgress: 0, uniqueSpawned: false,
    };
    const blocked = [dungeon.player, ...dungeon.stairs];
    for (let i = 0; i < floor.enemyCount; i += 1) {
      const pos = randomFloorPosition(dungeon, blocked.concat(dungeon.enemies));
      dungeon.enemies.push(createEnemy(pick(floor.monsterPool), pos, false));
    }
    const uniqueIds = floor.uniques || (floor.unique ? [floor.unique] : []);
    if (uniqueIds.length && Math.random() < (floor.uniqueChance || 0)) {
      const uniqueId = pick(uniqueIds);
      const pos = randomFloorPosition(dungeon, blocked.concat(dungeon.enemies));
      dungeon.enemies.push(createEnemy(uniqueId, pos, true));
      dungeon.uniqueSpawned = true;
    }
    const chestCount = rand(floor.chestRange[0], floor.chestRange[1]);
    for (let i = 0; i < chestCount; i += 1) {
      dungeon.chests.push({ ...randomFloorPosition(dungeon, blocked.concat(dungeon.enemies, dungeon.chests)), opened: false });
    }
    return dungeon;
  }

  window.HD_DUNGEON = { generate, spawnPosition };
})();
