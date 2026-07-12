(function () {
  "use strict";

  function materialSellPrice(data, materialId) {
    const index = Math.max(0, data.materials.findIndex((material) => material.id === materialId));
    return 5 + index * 3;
  }

  function treasureSellPrice(item) {
    return Math.max(0, Math.round(Number(item?.sellPrice || 0)));
  }

  function attackAttributeCount(item) {
    const attributes = Array.isArray(item?.attackAttributes)
      ? item.attackAttributes
      : item?.attributeAttack ? [item.attributeAttack] : [];
    return new Set(attributes.filter(Boolean)).size;
  }

  function shopItemPrice(item) {
    const resistanceValue = Object.values(item.resistances || {}).reduce((total, value) => total + (value === "immune" ? 15 : Number(value || 0)), 0);
    const acceleration = Number(item.acceleration || 0);
    const accelerationValue = acceleration >= 0 ? acceleration * 42 : acceleration * 8;
    const attributeValue = attackAttributeCount(item) * 14;
    return Math.max(20, Math.round(24 + (item.attack || 0) * 16 + (item.defense || 0) * 14 + accelerationValue + (item.hpRegen || 0) * 90 + resistanceValue * 22 + attributeValue));
  }

  function shopPurchasePrice(item) {
    return shopItemPrice(item) * 20;
  }

  function guildPointValue(item, crafted) {
    const artifactValue = Number(item?.artifact?.guildPoints);
    if (Number.isFinite(artifactValue) && artifactValue > 0) return Math.max(1, Math.round(artifactValue));
    const base = Math.max(1, Math.round(shopItemPrice(item) / 55));
    const qualityMultiplier = crafted ? 1 + Number(crafted.quality || 0) * 0.35 : 1;
    return Math.max(1, Math.round(base * qualityMultiplier));
  }

  function equipmentSellPrice(item, crafted) {
    const qualityMultiplier = crafted ? 1 + Number(crafted.quality || 0) * 0.12 : 1;
    return Math.max(5, Math.floor(shopItemPrice(item) * 0.45 * qualityMultiplier));
  }

  function equipmentStats(item) {
    const parts = [];
    if (item.attack) parts.push(`攻撃${item.attack > 0 ? "+" : ""}${item.attack}`);
    if (item.defense) parts.push(`防御${item.defense > 0 ? "+" : ""}${item.defense}`);
    if (item.acceleration) parts.push(`加速${item.acceleration > 0 ? "+" : ""}${item.acceleration}`);
    if (item.hpRegen) parts.push(`再生${item.hpRegen > 0 ? "+" : ""}${item.hpRegen}`);
    if (item.trueSight) parts.push("透明視認");
    return parts.join(" ") || "基礎数値補正なし";
  }

  window.HD_ECONOMY = { materialSellPrice, treasureSellPrice, shopItemPrice, shopPurchasePrice, equipmentSellPrice, guildPointValue, equipmentStats };
})();
