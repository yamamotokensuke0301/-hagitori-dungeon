(function () {
  "use strict";

  function byId(items) {
    return Object.fromEntries(items.map((item) => [item.id, item]));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function escapeHtml(value) {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(value).replace(/[&<>"']/g, (character) => entities[character]);
  }

  function chebyshevDistance(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  }

  function hasLineOfSight(start, target, isBlocked) {
    let x = start.x;
    let y = start.y;
    const dx = Math.abs(target.x - x);
    const dy = Math.abs(target.y - y);
    const sx = x < target.x ? 1 : -1;
    const sy = y < target.y ? 1 : -1;
    let error = dx - dy;
    while (x !== target.x || y !== target.y) {
      const twice = error * 2;
      if (twice > -dy) { error -= dy; x += sx; }
      if (twice < dx) { error += dx; y += sy; }
      if (x === target.x && y === target.y) return true;
      if (isBlocked?.(x, y)) return false;
    }
    return true;
  }

  window.HD_UTILS = Object.freeze({ byId, clamp, rand, pick, escapeHtml, chebyshevDistance, hasLineOfSight });
})();
