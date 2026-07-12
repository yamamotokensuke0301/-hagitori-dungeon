(function () {
  "use strict";

  function targets(data) {
    return data.monsters.filter((monster) => monster.unique && !monster.arenaOnly && monster.floors?.length);
  }

  const REPEAT_REWARD_RATE = 0.35;

  function baseReward(monster) {
    return Math.round(100 + monster.hp * 2 + monster.attack * 12 + monster.defense * 10 + Number(monster.acceleration || 0) * 5);
  }

  function reward(monster, priorClaims = 0) {
    const base = baseReward(monster);
    return Number(priorClaims || 0) > 0 ? Math.max(1, Math.round(base * REPEAT_REWARD_RATE)) : base;
  }

  function intelCost(monster) {
    return Math.max(50, Math.round(reward(monster) * 0.1 / 10) * 10);
  }

  function nativeFloor(monster, maxFloor = 100) {
    if (monster?.arenaOnly && Number.isFinite(Number(monster.arenaRank))) {
      const rank = Math.max(1, Math.floor(Number(monster.arenaRank)));
      const rosterSize = Math.max(rank, Number(window.HD_DATA?.monsters?.filter((candidate) => candidate.arenaOnly).length || rank));
      return 1 + Math.floor((rank - 1) * Math.max(0, maxFloor - 1) / Math.max(1, rosterSize - 1));
    }
    return Math.min(...(monster.floors?.length ? monster.floors : [maxFloor]));
  }

  function floorHint(monster, maxFloor = 100) {
    const floor = nativeFloor(monster, maxFloor);
    return `B${Math.max(1, floor - 2)}〜B${Math.min(maxFloor, floor + 2)}F付近`;
  }

  window.HD_BOUNTY = { REPEAT_REWARD_RATE, targets, baseReward, reward, intelCost, nativeFloor, floorHint };
})();
