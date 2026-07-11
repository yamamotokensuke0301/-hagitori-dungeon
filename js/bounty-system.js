(function () {
  "use strict";

  function targets(data) {
    return data.monsters.filter((monster) => monster.unique && !monster.arenaOnly && monster.floors?.length);
  }

  function reward(monster) {
    return Math.round(200 + monster.hp * 8 + monster.attack * 35 + monster.defense * 30 + Number(monster.acceleration || 0) * 15);
  }

  function intelCost(monster) {
    return Math.max(50, Math.round(reward(monster) * 0.1 / 10) * 10);
  }

  function nativeFloor(monster, maxFloor = 100) {
    return Math.min(...(monster.floors?.length ? monster.floors : [maxFloor]));
  }

  function floorHint(monster, maxFloor = 100) {
    const floor = nativeFloor(monster, maxFloor);
    return `B${Math.max(1, floor - 2)}〜B${Math.min(maxFloor, floor + 2)}F付近`;
  }

  window.HD_BOUNTY = { targets, reward, intelCost, nativeFloor, floorHint };
})();
