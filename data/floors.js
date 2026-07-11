(function () {
  window.HD_DATA = window.HD_DATA || {};

  const weightedIds = (monsters, floor) => monsters.flatMap((monster) => {
    const distance = Math.min(...monster.floors.map((nativeFloor) => Math.abs(nativeFloor - floor)));
    const weight = distance === 0 ? 10 : distance === 1 ? 4 : distance === 2 ? 1 : 0;
    return Array.from({ length: weight }, () => monster.id);
  });
  const pool = (floor) => {
    if (floor === 1) return [
      "cave_rat", "carapace_rat", "starter_mushroom", "starter_slime", "starter_moth", "starter_beetle",
      "starter_snake", "starter_frog", "starter_wisp", "starter_crab", "starter_gecko", "starter_puff",
    ];
    return weightedIds(window.HD_DATA.monsters.filter((monster) => !monster.unique && !monster.rareSpawn), floor);
  };
  const uniquePool = (floor) => {
    if (floor === 1) return [];
    return window.HD_DATA.monsters
      .filter((monster) => monster.unique && !monster.arenaOnly && monster.floors?.length)
      .flatMap((monster) => {
        const nativeFloor = Math.min(...monster.floors);
        const distance = Math.min(...monster.floors.map((candidateFloor) => Math.abs(candidateFloor - floor)));
        const hash = [...monster.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
        // 10:4:1の比率で適正階層を優先。深層個体の乱入票は個体ごとに間引き、
        // 大規模ロスターでも浅層が深層個体だらけにならないようにする。
        const rareIntrusion = nativeFloor > floor && (hash + floor * 31) % 173 === 0;
        const weight = distance === 0 ? 10 : distance === 1 ? 4 : distance === 2 ? 1 : rareIntrusion ? 1 : 0;
        return Array.from({ length: weight }, () => monster.id);
      });
  };
  window.HD_DATA.floors = [
    { floor: 1, name: "浅い横穴", monsterPool: pool(1), uniques: uniquePool(1), uniqueChance: 0, enemyCount: 28, spawnCap: 40, roomRange: [30, 36], chestRange: [4, 7], stairRange: [3, 5] },
    { floor: 2, name: "湿った巣道", monsterPool: pool(2), uniques: uniquePool(2), uniqueChance: 0.18, enemyCount: 31, spawnCap: 43, roomRange: [32, 38], chestRange: [5, 8], stairRange: [3, 5] },
    { floor: 3, name: "毒牙の縦穴", monsterPool: pool(3), uniques: uniquePool(3), uniqueChance: 0.2, enemyCount: 34, spawnCap: 46, roomRange: [34, 40], chestRange: [6, 9], stairRange: [3, 5] },
    { floor: 4, name: "焦げた石廊", monsterPool: pool(4), uniques: uniquePool(4), uniqueChance: 0.22, enemyCount: 37, spawnCap: 49, roomRange: [36, 42], chestRange: [6, 10], stairRange: [3, 5] },
    { floor: 5, name: "赤熱の巣", monsterPool: pool(5), uniques: uniquePool(5), uniqueChance: 0.24, enemyCount: 40, spawnCap: 52, roomRange: [38, 45], chestRange: [7, 10], stairRange: [3, 5] },
    { floor: 6, name: "月影の奈落", monsterPool: pool(6), uniques: uniquePool(6), uniqueChance: 0.26, enemyCount: 42, spawnCap: 54, roomRange: [38, 45], chestRange: [7, 10], stairRange: [3, 5] },
    { floor: 7, name: "骸風回廊", monsterPool: pool(7), uniques: uniquePool(7), uniqueChance: 0.28, enemyCount: 44, spawnCap: 56, roomRange: [39, 46], chestRange: [8, 11], stairRange: [3, 5] },
    { floor: 8, name: "鋼幻宮", monsterPool: pool(8), uniques: uniquePool(8), uniqueChance: 0.3, enemyCount: 46, spawnCap: 58, roomRange: [40, 47], chestRange: [8, 11], stairRange: [3, 5] },
    { floor: 9, name: "氷没神殿", monsterPool: pool(9), uniques: uniquePool(9), uniqueChance: 0.32, enemyCount: 48, spawnCap: 60, roomRange: [40, 47], chestRange: [9, 12], stairRange: [3, 5] },
    { floor: 10, name: "迷宮心臓部", monsterPool: pool(10), uniques: uniquePool(10), uniqueChance: 0.34, enemyCount: 50, spawnCap: 62, roomRange: [41, 48], chestRange: [9, 12], stairRange: [3, 5] },
  ];

  const regionNames = ["燐光坑道", "水没王墓", "雷鳴断崖", "毒晶庭園", "氷結書庫", "呪詛聖堂", "酸蝕工廠", "無明星界", "終焉迷宮"];
  for (let floor = 11; floor <= 100; floor += 1) {
    const regionIndex = Math.min(regionNames.length - 1, Math.floor((floor - 11) / 10));
    const finalFloor = floor === 100;
    window.HD_DATA.floors.push({
      floor,
      name: finalFloor ? "キキルクルスの蛇宮" : `${regionNames[regionIndex]}・${floor}`,
      monsterPool: pool(floor),
      uniques: finalFloor ? ["dungeon_lord_nox"] : uniquePool(floor),
      uniqueChance: finalFloor ? 1 : Math.min(0.48, 0.24 + floor * 0.0024),
      enemyCount: Math.min(70, 48 + Math.floor(floor / 4)),
      spawnCap: Math.min(84, 62 + Math.floor(floor / 4)),
      roomRange: [40, 48],
      chestRange: [8, 13],
      stairRange: finalFloor ? [1, 1] : [3, 5],
    });
  }

  // 浅層は判断の余白を残し、深層ほど密度が増す。討伐の反復より装備更新と探索判断を主軸にする。
  window.HD_DATA.floors.forEach((floor) => {
    floor.enemyCount = Math.max(18, Math.round(floor.enemyCount * 0.78));
    floor.spawnCap = floor.enemyCount + 10 + Math.floor(floor.floor / 12);
    if (floor.floor < 100) floor.stairRange = [4, 6];
    floor.rareMonsterPool = window.HD_DATA.monsters
      .filter((monster) => monster.rareSpawn && monster.floors?.includes(floor.floor))
      .map((monster) => monster.id);
    floor.rareMonsterChance = floor.floor % 10 === 0 ? 0 : 0.07;
  });
})();
