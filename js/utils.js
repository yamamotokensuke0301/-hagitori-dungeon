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

  window.HD_UTILS = Object.freeze({ byId, clamp, rand, pick, escapeHtml });
})();
