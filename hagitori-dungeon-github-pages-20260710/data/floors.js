(function () {
  window.HD_DATA = window.HD_DATA || {};

  window.HD_DATA.floors = [
    { floor: 1, name: "浅い横穴", monsterPool: ["cave_rat", "carapace_rat"], enemyCount: 3, roomRange: [5, 7], chestRange: [0, 1] },
    { floor: 2, name: "湿った巣道", monsterPool: ["cave_rat", "carapace_rat", "poison_bat"], enemyCount: 4, roomRange: [5, 8], chestRange: [0, 1] },
    { floor: 3, name: "毒牙の縦穴", monsterPool: ["carapace_rat", "poison_bat", "thunder_hare"], enemyCount: 4, roomRange: [6, 8], chestRange: [0, 2] },
    { floor: 4, name: "焦げた石廊", monsterPool: ["thunder_hare", "fire_lizard"], enemyCount: 5, roomRange: [6, 9], chestRange: [0, 2] },
    { floor: 5, name: "赤熱の巣", monsterPool: ["fire_lizard"], unique: "red_garm", enemyCount: 3, roomRange: [6, 9], chestRange: [0, 1] },
  ];
})();
