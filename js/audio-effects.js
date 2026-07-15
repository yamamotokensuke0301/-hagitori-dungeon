(function () {
  "use strict";

  // Web Audio recipes are isolated from game state so they can evolve independently.
  function create(context, output) {
    // [event level, ambience amount]. Dense recipes are deliberately quieter so
    // rapid combat playback retains headroom without making UI cues disappear.
    const EVENT_PROFILES = Object.freeze({
      startup: [0.82, 1.1], step: [0.7, 0.18], bump: [0.9, 0.25], select: [0.8, 0.72],
      descend: [0.62, 0.9], return: [0.78, 0.9], encounter: [0.72, 0.65], boss: [0.58, 0.82],
      slash: [0.88, 0.38], blunt: [0.82, 0.28], skill: [0.74, 0.86], fire: [0.76, 0.62],
      water: [0.78, 1.0], thunder: [0.62, 0.52], poison: [0.76, 0.82], ice: [0.74, 1.12],
      curse: [0.68, 1.0], acid: [0.72, 0.55], dark: [0.66, 1.12], light: [0.7, 1.32],
      earth: [0.7, 0.42], wind: [0.76, 0.82], steel: [0.72, 0.92], illusion: [0.72, 1.3],
      observe: [0.78, 0.84], guard: [0.84, 0.5], warning: [0.76, 0.38], hit: [0.82, 0.22], playerHurt: [0.74, 0.3],
      fireHit: [0.68, 0.52], loot: [0.8, 0.96], chest: [0.7, 1.0], coinSell: [0.78, 1.12],
      purchase: [0.78, 0.88], researchUp: [0.7, 1.18], critical: [0.66, 0.52], trapDamage: [0.66, 0.32],
      trapDrain: [0.68, 0.84], trapSlow: [0.68, 1.0], teleportShort: [0.7, 1.12], teleportLong: [0.6, 1.22],
      timeStop: [0.64, 1.28], eat: [0.74, 0.3], feast: [0.6, 0.72], bountyCarry: [0.7, 0.78],
      anomaly: [0.6, 1.22], chaos: [0.42, 0.98], invisibleReveal: [0.66, 1.18], heal: [0.6, 1.4],
      corpse: [0.7, 0.32], corpseDrop: [0.8, 0.35], corpseDropUnique: [0.6, 0.95],
      harvest: [0.45, 0.72], craft: [0.74, 0.88], equip: [0.78, 0.72],
      rest: [0.68, 1.2], victory: [0.66, 1.18], levelUp: [0.58, 1.48], levelStatUp: [0.7, 1.1], death: [0.42, 1.15],
      deathCrySharp: [0.5, 0.82], deathCryFading: [0.46, 1.05], deathCryLow: [0.48, 0.72], flee: [0.8, 0.38],
      uiTab: [0.68, 0.34], uiConfirm: [0.7, 0.5], uiCancel: [0.66, 0.42], uiOpen: [0.68, 0.58], uiClose: [0.68, 0.4],
      uiPage: [0.7, 0.36], uiFilter: [0.66, 0.46], uiToggle: [0.68, 0.38], uiError: [0.72, 0.3], menuOpen: [0.66, 0.72], menuClose: [0.68, 0.55],
      drink: [0.7, 0.46], intoxicate: [0.6, 0.82], heartEquip: [0.58, 1.18], heartRestore: [0.6, 1.2], trapDiscover: [0.66, 0.62], trapDisarm: [0.66, 0.5],
      summon: [0.54, 1.05], invulnerable: [0.58, 1.28], regenerate: [0.62, 0.78], knockback: [0.7, 0.28], selfDestruct: [0.46, 0.48], debuff: [0.64, 0.8],
      devour: [0.58, 0.42], jobChange: [0.62, 0.94], tutorial: [0.66, 0.82], shopRefresh: [0.64, 0.88],
    });

    let activeLevel = 1;
    let activeSpace = 1;
    let panIndex = 0;
    let reverbInput = null;
    const mixOutput = context && output ? createOutputStage(output) : output;

    function play(type, delaySeconds = 0) {
      if (!context || !output) return;
      const profile = EVENT_PROFILES[type];
      if (!profile) return;
      activeLevel = profile[0];
      activeSpace = profile[1];
      // A few milliseconds of look-ahead avoids clipped attacks on busy frames.
      const now = context.currentTime + 0.005 + Math.max(0, Number(delaySeconds) || 0);
      const out = mixOutput;
      if (type === "startup") {
        playTone(261.63, now, 0.52, 0.055, "sine", out, { attack: 0.018, sustain: 0.72, pan: 0, reverb: 0.2 });
        playArp([523.25, 659.25, 783.99], now + 0.02, 0.085, 0.082, out, { spread: 0.34, lastTail: 1.45 });
      }
      if (type === "step") {
        playNoise(now, 0.032, 0.048, out, 1050, { attack: 0.001, pan: nextPan(0.16), reverb: 0.012 });
        playImpact(118, now + 0.002, 0.045, 0.035, out, { click: 680, pan: nextPan(0.08) });
      }
      if (type === "bump") playImpact(96, now, 0.1, 0.105, out, { click: 760, pan: 0 });
      if (type === "select") playArp([440, 554.37], now, 0.042, 0.058, out, { spread: 0.2, lastTail: 1.25 });
      if (type === "descend") {
        playSweep(196, 49, now, 0.72, 0.11, "sawtooth", out);
        playNoise(now, 0.5, 0.075, out, 260);
        playArp([293.66, 220, 164.81, 110, 73.42], now + 0.04, 0.1, 0.055, out);
        playImpact(82, now + 0.44, 0.28, 0.07, out, { click: 240, pan: 0 });
      }
      if (type === "return") {
        playTone(98, now, 0.36, 0.045, "sine", out, { pan: 0, reverb: 0.14 });
        playArp([196, 246.94, 329.63], now + 0.015, 0.08, 0.06, out, { spread: 0.28, lastTail: 1.35 });
      }
      if (type === "encounter") {
        playImpact(110, now, 0.13, 0.07, out, { click: 920, pan: 0 });
        playArp([146.83, 220, 277.18], now + 0.012, 0.065, 0.07, out, { spread: 0.24 });
      }
      if (type === "boss") {
        playImpact(62, now, 0.28, 0.12, out, { click: 340, pan: 0 });
        playArp([98, 92.5, 87.31, 196], now + 0.025, 0.095, 0.082, out, { spread: 0.18, type: "sawtooth" });
      }
      if (type === "slash") {
        playNoiseBand(now, 0.045, 0.072, out, 4600, 1.2, -0.38, { attack: 0.001, reverb: 0.025 });
        playSweep(1180, 190, now + 0.003, 0.095, 0.07, "sawtooth", out, { pan: -0.42, panEnd: 0.46, reverb: 0.035 });
        playImpact(145, now + 0.055, 0.07, 0.034, out, { click: 1200, pan: 0.2 });
      }
      if (type === "blunt") playImpact(76, now, 0.16, 0.13, out, { click: 820, pan: 0 });
      if (type === "skill") {
        playSweep(260, 780, now, 0.19, 0.038, "sine", out, { pan: -0.24, panEnd: 0.24, reverb: 0.16 });
        playArp([392, 523.25, 659.25], now + 0.014, 0.045, 0.062, out, { spread: 0.32 });
      }
      if (type === "fire") {
        playImpact(105, now, 0.12, 0.045, out, { click: 430, pan: 0 });
        playNoiseBand(now, 0.18, 0.052, out, 1750, 0.62, -0.24, { reverb: 0.045 });
        playSweep(150, 640, now + 0.008, 0.2, 0.068, "sawtooth", out, { pan: -0.22, panEnd: 0.3 });
      }
      if (type === "water") {
        playNoiseBand(now, 0.22, 0.034, out, 1250, 0.7, -0.38, { attack: 0.012, reverb: 0.14 });
        playSweep(740, 310, now + 0.008, 0.26, 0.032, "sine", out, { pan: 0.45, panEnd: -0.4, reverb: 0.2 });
        playArp([659.25, 493.88, 369.99], now + 0.02, 0.05, 0.052, out, { spread: 0.3, lastTail: 1.35 });
      }
      if (type === "thunder") {
        playImpact(58, now + 0.008, 0.24, 0.11, out, { click: 1750, pan: 0 });
        playNoiseBand(now, 0.105, 0.09, out, 6200, 0.7, -0.38, { attack: 0.001, reverb: 0.035 });
        playNoiseBand(now + 0.025, 0.2, 0.052, out, 2100, 0.55, 0.32, { reverb: 0.05 });
        playArp([880, 1760, 1174.66, 2349.32], now, 0.026, 0.048, out, { spread: 0.42, lastTail: 1.15 });
      }
      if (type === "poison") {
        playTone(146.83, now, 0.26, 0.052, "sine", out, { sustain: 0.7, pan: -0.18, reverb: 0.15 });
        playSweep(310, 92, now + 0.04, 0.31, 0.048, "triangle", out, { pan: 0.25, panEnd: -0.28 });
        playNoiseBand(now + 0.08, 0.2, 0.044, out, 720, 1.1, 0.28, { attack: 0.014, reverb: 0.09 });
        playTone(196, now + 0.12, 0.09, 0.022, "sine", out, { attack: 0.004, pan: 0.36, reverb: 0.18 });
      }
      if (type === "ice") {
        playNoiseBand(now, 0.045, 0.068, out, 8200, 3.1, -0.42, { attack: 0.001, reverb: 0.16 });
        playArp([1318.51, 1046.5, 1567.98, 2093], now + 0.006, 0.04, 0.048, out, { spread: 0.48, lastTail: 1.4 });
        playNoiseBand(now + 0.08, 0.14, 0.055, out, 6900, 2.8, 0.4, { reverb: 0.12 });
      }
      if (type === "curse") {
        playSweep(233.08, 58.27, now, 0.46, 0.07, "sawtooth", out, { pan: -0.3, panEnd: 0.28, reverb: 0.12 });
        playTone(155.56, now + 0.08, 0.38, 0.045, "square", out, { sustain: 0.62, pan: 0.24, reverb: 0.13 });
        playTone(164.81, now + 0.095, 0.4, 0.026, "sine", out, { sustain: 0.76, pan: -0.22, reverb: 0.18 });
      }
      if (type === "acid") {
        playNoiseBand(now, 0.24, 0.066, out, 1450, 0.55, -0.28, { attack: 0.005, reverb: 0.055 });
        playNoiseBand(now + 0.06, 0.16, 0.038, out, 2680, 1.3, 0.38, { reverb: 0.075 });
        playSweep(540, 118, now + 0.03, 0.32, 0.052, "sawtooth", out, { pan: 0.3, panEnd: -0.24 });
      }
      if (type === "dark") {
        playTone(55, now, 0.46, 0.1, "sine", out, { attack: 0.012, sustain: 0.76, pan: 0, reverb: 0.08 });
        playSweep(164.81, 41.2, now, 0.52, 0.055, "triangle", out, { pan: -0.16, panEnd: 0.18, reverb: 0.16 });
        playNoiseBand(now + 0.04, 0.4, 0.026, out, 420, 0.7, 0.22, { attack: 0.03, reverb: 0.1 });
      }
      if (type === "light") {
        playArp([783.99, 1046.5, 1318.51, 1567.98], now, 0.036, 0.056, out, { spread: 0.48, lastTail: 1.45 });
        playTone(2093, now + 0.08, 0.38, 0.028, "sine", out, { sustain: 0.68, pan: 0.12, reverb: 0.24 });
        playTone(3135.96, now + 0.13, 0.24, 0.016, "sine", out, { pan: -0.3, reverb: 0.28 });
      }
      if (type === "earth") {
        playImpact(65.41, now, 0.25, 0.145, out, { click: 430, pan: 0 });
        playNoise(now + 0.012, 0.2, 0.085, out, 380, { attack: 0.002, pan: -0.08, reverb: 0.025 });
        playNoiseBand(now + 0.025, 0.14, 0.042, out, 980, 0.72, 0.18, { reverb: 0.03 });
      }
      if (type === "wind") {
        playNoiseBand(now, 0.28, 0.062, out, 3100, 0.75, -0.58, { attack: 0.02, panEnd: 0.58, reverb: 0.07 });
        playNoiseBand(now + 0.05, 0.22, 0.034, out, 1450, 0.55, 0.46, { panEnd: -0.42, reverb: 0.08 });
        playSweep(420, 1320, now + 0.01, 0.23, 0.04, "sine", out, { pan: -0.42, panEnd: 0.5, reverb: 0.13 });
      }
      if (type === "steel") {
        playMetal(880, now, 0.34, 0.052, out, -0.12);
        playNoiseBand(now, 0.055, 0.054, out, 5400, 3.2, 0.42, { attack: 0.001, reverb: 0.11 });
        playImpact(125, now + 0.018, 0.1, 0.038, out, { click: 1850, pan: 0 });
      }
      if (type === "illusion") {
        playArp([523.25, 739.99, 554.37, 830.61], now, 0.048, 0.045, out, { spread: 0.56, lastTail: 1.35 });
        playSweep(980, 245, now + 0.05, 0.34, 0.03, "sine", out, { pan: 0.52, panEnd: -0.52, reverb: 0.22 });
        playSweep(490, 1046.5, now + 0.07, 0.31, 0.018, "sine", out, { pan: -0.5, panEnd: 0.46, reverb: 0.24 });
      }
      if (type === "observe") {
        playMetal(523.25, now, 0.18, 0.025, out, -0.16);
        playArp([261.63, 392, 523.25], now + 0.012, 0.05, 0.05, out, { spread: 0.28, lastTail: 1.25 });
      }
      if (type === "guard") {
        playImpact(138, now, 0.12, 0.07, out, { click: 1500, pan: 0 });
        playMetal(440, now + 0.005, 0.24, 0.036, out, 0.08);
      }
      if (type === "warning") {
        playImpact(92, now, 0.13, 0.038, out, { click: 520, pan: 0 });
        playArp([220, 233.08, 220, 233.08], now, 0.058, 0.067, out, { spread: 0.22, lastTail: 0.9 });
      }
      if (type === "hit") {
        playImpact(118, now, 0.085, 0.092, out, { click: 980, pan: 0 });
        playNoise(now, 0.072, 0.07, out, 820, { attack: 0.001, pan: nextPan(0.12), reverb: 0.018 });
      }
      if (type === "playerHurt") {
        // 攻撃側の属性音と聞き分けられる、低く近い被弾専用の衝撃。
        playImpact(64, now, 0.18, 0.12, out, { click: 520, pan: 0 });
        playNoiseBand(now + 0.012, 0.13, 0.085, out, 760, 0.64, 0, { attack: 0.001, reverb: 0.025 });
        playTone(116, now + 0.045, 0.2, 0.052, "triangle", out, { sustain: 0.28, pan: 0, reverb: 0.04 });
      }
      if (type === "fireHit") {
        playImpact(96, now, 0.12, 0.074, out, { click: 640, pan: 0 });
        playNoiseBand(now, 0.18, 0.067, out, 1120, 0.58, -0.24, { reverb: 0.035 });
        playSweep(150, 420, now + 0.008, 0.2, 0.058, "sawtooth", out, { pan: -0.16, panEnd: 0.28 });
      }
      if (type === "loot") {
        playMetal(1046.5, now, 0.22, 0.02, out, -0.22);
        playArp([523.25, 659.25, 783.99], now + 0.008, 0.055, 0.052, out, { spread: 0.34, lastTail: 1.4 });
      }
      if (type === "chest") {
        playImpact(105, now, 0.1, 0.048, out, { click: 1200, pan: -0.08 });
        playMetal(740, now + 0.012, 0.24, 0.03, out, -0.2);
        playNoiseBand(now, 0.08, 0.04, out, 2100, 1.8, 0.22, { attack: 0.001, reverb: 0.08 });
        playArp([392, 523.25, 659.25, 987.77], now + 0.065, 0.065, 0.055, out, { spread: 0.4, lastTail: 1.5 });
      }
      if (type === "coinSell") {
        playMetal(1318.51, now, 0.22, 0.03, out, -0.3);
        playMetal(1567.98, now + 0.042, 0.2, 0.026, out, 0.28);
        playArp([1318.51, 1567.98, 2093], now + 0.006, 0.036, 0.035, out, { spread: 0.38, lastTail: 1.35 });
        playTone(2637.02, now + 0.11, 0.22, 0.022, "sine", out, { pan: 0.08, reverb: 0.24 });
      }
      if (type === "purchase") {
        playMetal(987.77, now, 0.16, 0.02, out, -0.16);
        playArp([1046.5, 783.99, 987.77, 1318.51], now + 0.006, 0.047, 0.047, out, { spread: 0.32, lastTail: 1.35 });
      }
      if (type === "researchUp") {
        playTone(220, now, 0.42, 0.03, "sine", out, { attack: 0.015, sustain: 0.7, pan: 0, reverb: 0.16 });
        playArp([440, 659.25, 880, 1174.66], now + 0.01, 0.055, 0.046, out, { spread: 0.4, lastTail: 1.4 });
        playTone(1760, now + 0.24, 0.28, 0.024, "sine", out, { pan: 0.12, reverb: 0.25 });
      }
      if (type === "critical") {
        playImpact(72, now, 0.19, 0.125, out, { click: 1800, pan: 0 });
        playNoiseBand(now, 0.068, 0.088, out, 4800, 1.4, -0.18, { attack: 0.001, panEnd: 0.2, reverb: 0.035 });
        playSweep(330, 1480, now + 0.002, 0.19, 0.068, "sawtooth", out, { pan: -0.3, panEnd: 0.34 });
      }
      if (type === "trapDamage") {
        playImpact(73.42, now, 0.24, 0.135, out, { click: 1300, pan: 0 });
        playNoise(now, 0.17, 0.1, out, 940, { attack: 0.001, pan: -0.12, reverb: 0.02 });
      }
      if (type === "trapDrain") {
        playArp([392, 293.66, 220, 146.83, 98], now, 0.07, 0.06, out, { spread: 0.32, lastTail: 1.35 });
        playTone(49, now + 0.16, 0.52, 0.055, "sine", out, { attack: 0.025, sustain: 0.76, pan: 0, reverb: 0.1 });
      }
      if (type === "trapSlow") {
        playSweep(440, 55, now, 0.65, 0.062, "triangle", out, { pan: -0.3, panEnd: 0.28, reverb: 0.16 });
        playTone(82.41, now + 0.15, 0.54, 0.045, "sine", out, { attack: 0.02, sustain: 0.72, pan: 0, reverb: 0.12 });
      }
      if (type === "teleportShort") {
        playSweep(260, 1568, now, 0.26, 0.055, "sine", out, { pan: -0.48, panEnd: 0.5, reverb: 0.22 });
        playNoiseBand(now, 0.2, 0.037, out, 5200, 1.2, 0.5, { attack: 0.008, panEnd: -0.42, reverb: 0.15 });
      }
      if (type === "teleportLong") {
        playTone(55, now, 0.58, 0.05, "sine", out, { attack: 0.022, sustain: 0.72, pan: 0, reverb: 0.08 });
        playSweep(110, 2093, now, 0.54, 0.07, "sawtooth", out, { pan: -0.52, panEnd: 0.54, reverb: 0.18 });
        playArp([261.63, 523.25, 1046.5, 2093], now + 0.08, 0.09, 0.042, out, { spread: 0.5, lastTail: 1.45 });
      }
      if (type === "timeStop") {
        playSweep(880, 55, now, 0.7, 0.062, "sine", out, { pan: 0.38, panEnd: -0.38, reverb: 0.2 });
        playMetal(1760, now, 0.13, 0.05, out, -0.22);
        playMetal(1760, now + 0.64, 0.3, 0.036, out, 0.24);
      }
      if (type === "eat" || type === "feast") {
        const scale = type === "feast" ? 1.45 : 1;
        playNoiseBand(now, 0.12 * scale, 0.095, out, 950, 1.8, -0.25);
        playTone(92, now + 0.05, 0.16 * scale, 0.09, "triangle", out);
        playNoiseBand(now + 0.14, 0.18 * scale, 0.07, out, 520, 0.65, 0.28);
        if (type === "feast") playArp([98, 146.83, 196, 293.66], now + 0.32, 0.08, 0.065, out);
      }
      if (type === "bountyCarry") {
        playImpact(73.42, now, 0.25, 0.1, out, { click: 480, pan: 0 });
        playArp([220, 277.18, 329.63], now + 0.12, 0.08, 0.043, out, { spread: 0.25, lastTail: 1.3 });
      }
      if (type === "anomaly") {
        playNoiseBand(now, 0.72, 0.027, out, 2300, 0.48, -0.45, { attack: 0.035, panEnd: 0.45, reverb: 0.12 });
        playSweep(110, 880, now, 0.82, 0.058, "triangle", out, { pan: -0.28, panEnd: 0.3, reverb: 0.2 });
        playArp([293.66, 440, 659.25, 987.77], now + 0.18, 0.12, 0.048, out, { spread: 0.46, lastTail: 1.35 });
      }
      if (type === "chaos") {
        playNoiseBand(now, 0.7, 0.1, out, 4200, 0.65, 0);
        playSweep(55, 1760, now, 0.9, 0.09, "sawtooth", out);
        playArp([110, 220, 440, 880, 1760, 2349.32], now + 0.08, 0.1, 0.07, out);
      }
      if (type === "invisibleReveal") {
        playNoiseBand(now, 0.3, 0.052, out, 5800, 0.8, -0.52, { attack: 0.015, panEnd: 0.48, reverb: 0.13 });
        playSweep(1480, 185, now, 0.36, 0.05, "sine", out, { pan: 0.46, panEnd: -0.42, reverb: 0.2 });
        playArp([739.99, 554.37, 830.61], now + 0.06, 0.055, 0.038, out, { spread: 0.42, lastTail: 1.4 });
      }
      if (type === "heal") {
        playTone(130.81, now, 0.76, 0.032, "sine", out, { attack: 0.035, sustain: 0.78, pan: 0, reverb: 0.15 });
        playArp([523.25, 659.25, 783.99, 1046.5], now + 0.01, 0.075, 0.05, out, { spread: 0.44, lastTail: 1.5 });
        playSweep(220, 880, now + 0.06, 0.64, 0.038, "sine", out, { pan: -0.34, panEnd: 0.36, reverb: 0.25 });
        playTone(1318.51, now + 0.38, 0.52, 0.03, "sine", out, { sustain: 0.7, pan: 0.18, reverb: 0.3 });
      }
      if (type === "corpse") {
        playImpact(82.41, now, 0.18, 0.11, out, { click: 360, pan: 0 });
        playNoise(now, 0.09, 0.052, out, 440, { attack: 0.0015, pan: -0.1, reverb: 0.02 });
      }
      if (type === "corpseDrop") {
        // 一般モンスターの遺体が「残った」当たりを告げる、小さく乾いた「ことり」。
        playImpact(74, now, 0.12, 0.06, out, { click: 480, pan: 0 });
        playTone(196, now + 0.055, 0.1, 0.026, "triangle", out, { attack: 0.002, pan: 0.12, reverb: 0.07 });
      }
      if (type === "corpseDropUnique") {
        // ユニークの色違い遺体。勝利ファンファーレの後に重なる荘重な低い鐘。
        playImpact(56, now + 0.3, 0.2, 0.085, out, { click: 340, pan: 0 });
        playMetal(311.13, now + 0.34, 0.5, 0.03, out, -0.14);
        playTone(1244.51, now + 0.5, 0.6, 0.014, "sine", out, { sustain: 0.68, pan: 0.18, reverb: 0.32 });
      }
      if (type === "harvest") {
        // 刃先が触れる高域と、三度の短い切断。
        playNoiseBand(now, 0.045, 0.105, out, 5200, 2.4, -0.45);
        playSweep(1900, 260, now + 0.008, 0.075, 0.045, "sawtooth", out);
        playNoiseBand(now + 0.075, 0.052, 0.09, out, 3900, 2.0, 0.3);
        playSweep(1420, 230, now + 0.08, 0.07, 0.038, "sawtooth", out);
        playNoiseBand(now + 0.145, 0.06, 0.08, out, 3300, 1.7, -0.2);

        // 皮と組織を引き剥がす、長く湿った摩擦音。
        playNoiseBand(now + 0.105, 0.27, 0.074, out, 680, 0.7, -0.3);
        playNoiseBand(now + 0.16, 0.24, 0.062, out, 1250, 1.0, 0.35);
        playNoiseBand(now + 0.22, 0.19, 0.045, out, 2100, 1.5, -0.1);
        playSweep(310, 92, now + 0.17, 0.25, 0.045, "triangle", out);

        // 腱や硬質部位が外れる低い衝撃。
        playTone(118, now + 0.36, 0.1, 0.085, "triangle", out);
        playTone(74, now + 0.382, 0.16, 0.07, "sine", out);
        playNoiseBand(now + 0.36, 0.075, 0.082, out, 1850, 2.6, 0.15);

        // 素材を回収したことが伝わる、短い金属質の余韻。
        playArp([392, 523.25, 659.25, 783.99], now + 0.46, 0.052, 0.038, out);
        playTone(1046.5, now + 0.63, 0.28, 0.024, "sine", out);
      }
      if (type === "craft") {
        playImpact(104, now, 0.1, 0.048, out, { click: 1320, pan: -0.08 });
        playMetal(493.88, now + 0.006, 0.24, 0.035, out, 0.16);
        playArp([246.94, 329.63, 493.88, 659.25], now + 0.025, 0.056, 0.052, out, { spread: 0.34, lastTail: 1.35 });
      }
      if (type === "equip") {
        playMetal(493.88, now, 0.2, 0.038, out, -0.1);
        playArp([329.63, 493.88], now + 0.012, 0.06, 0.052, out, { spread: 0.22, lastTail: 1.3 });
      }
      if (type === "rest") {
        playTone(130.81, now, 0.82, 0.036, "sine", out, { attack: 0.04, sustain: 0.78, pan: 0, reverb: 0.16 });
        playArp([261.63, 329.63, 392, 523.25], now + 0.012, 0.12, 0.042, out, { spread: 0.36, lastTail: 1.5 });
        playTone(659.25, now + 0.52, 0.36, 0.035, "sine", out, { pan: 0.14, reverb: 0.28 });
      }
      if (type === "victory") {
        playTone(130.81, now, 0.72, 0.055, "sine", out, { attack: 0.012, sustain: 0.68, pan: 0, reverb: 0.14 });
        playArp([261.63, 329.63, 392, 523.25, 659.25], now + 0.006, 0.08, 0.062, out, { spread: 0.42, lastTail: 1.5 });
      }
      if (type === "levelUp") {
        // 約3秒かけて二度上昇し、能力表示の開始へ余韻を渡すファンファーレ。
        playSweep(110, 880, now, 1.15, 0.038, "sine", out, { pan: -0.38, panEnd: 0.38, reverb: 0.26 });
        playNoiseBand(now, 0.82, 0.026, out, 4200, 0.68, -0.42, { attack: 0.025, panEnd: 0.42, reverb: 0.14 });
        playArp([261.63, 329.63, 392, 523.25, 659.25, 783.99], now + 0.025, 0.15, 0.058, out, { spread: 0.52, lastTail: 1.55, reverb: 0.24 });
        playArp([392, 523.25, 659.25, 783.99, 1046.5, 1318.51], now + 0.88, 0.14, 0.048, out, { spread: 0.58, lastTail: 1.7, reverb: 0.3 });
        playMetal(1567.98, now + 1.72, 0.82, 0.032, out, -0.2);
        playMetal(2093, now + 1.82, 0.76, 0.025, out, 0.24);
        playTone(523.25, now + 1.74, 1.32, 0.028, "sine", out, { attack: 0.018, sustain: 0.78, pan: -0.28, reverb: 0.34 });
        playTone(659.25, now + 1.74, 1.32, 0.026, "sine", out, { attack: 0.018, sustain: 0.78, pan: 0, reverb: 0.34 });
        playTone(783.99, now + 1.74, 1.32, 0.024, "sine", out, { attack: 0.018, sustain: 0.78, pan: 0.28, reverb: 0.34 });
        playTone(1567.98, now + 1.88, 1.08, 0.018, "triangle", out, { sustain: 0.7, pan: 0.1, reverb: 0.38 });
      }
      if (type === "levelStatUp") {
        playMetal(1567.98, now, 0.3, 0.032, out, -0.08);
        playTone(2093, now + 0.018, 0.34, 0.025, "sine", out, { attack: 0.003, sustain: 0.62, pan: 0.12, reverb: 0.3 });
      }
      if (type === "death") {
        playTone(55, now, 0.34, 0.14, "sine", out);
        playTone(49, now + 0.38, 0.42, 0.12, "sine", out);
        playNoise(now + 0.08, 0.8, 0.095, out, 380);
        playArp([220, 185, 146.83, 110, 73.42], now + 0.15, 0.16, 0.085, out);
        playSweep(120, 32, now + 0.28, 1.25, 0.09, "sawtooth", out);
      }
      if (type === "deathCrySharp") {
        // 「アァッ！」に聞こえる急な声帯降下と、口腔・喉の共鳴帯。
        playSweep(560, 185, now, 0.82, 0.075, "sawtooth", out, { pan: -0.05, panEnd: 0.04, reverb: 0.09 });
        playSweep(980, 690, now + 0.018, 0.72, 0.038, "triangle", out, { pan: 0.04, panEnd: -0.03, reverb: 0.12 });
        playSweep(2380, 1680, now + 0.025, 0.58, 0.022, "sine", out, { pan: -0.08, panEnd: 0.07, reverb: 0.14 });
        playNoiseBand(now + 0.03, 0.48, 0.045, out, 1650, 0.9, 0, { attack: 0.004, reverb: 0.06 });
        playImpact(54, now + 0.68, 0.48, 0.085, out, { click: 160, pan: 0 });
      }
      if (type === "deathCryFading") {
        // 長い「アァァ……」が息と一緒に細く消える型。
        playSweep(390, 105, now, 1.62, 0.066, "sawtooth", out, { pan: -0.06, panEnd: 0.05, reverb: 0.18 });
        playSweep(860, 540, now + 0.035, 1.42, 0.034, "triangle", out, { pan: 0.05, panEnd: -0.04, reverb: 0.22 });
        playSweep(2180, 1420, now + 0.05, 1.08, 0.018, "sine", out, { pan: -0.08, panEnd: 0.08, reverb: 0.24 });
        playNoiseBand(now + 0.08, 1.28, 0.032, out, 1250, 0.72, 0, { attack: 0.025, reverb: 0.13 });
        playTone(49, now + 1.1, 0.72, 0.082, "sine", out, { attack: 0.03, sustain: 0.55, pan: 0, reverb: 0.08 });
      }
      if (type === "deathCryLow") {
        // 胸から絞り出す「ぐ、あぁ……」型。二段の声帯破綻を作る。
        playSweep(245, 118, now, 0.52, 0.078, "sawtooth", out, { pan: 0.04, panEnd: -0.03, reverb: 0.08 });
        playSweep(310, 72, now + 0.34, 1.02, 0.07, "sawtooth", out, { pan: -0.04, panEnd: 0.03, reverb: 0.12 });
        playSweep(720, 430, now + 0.05, 0.94, 0.034, "triangle", out, { pan: 0.05, panEnd: -0.04, reverb: 0.14 });
        playNoiseBand(now, 0.92, 0.052, out, 760, 0.66, 0, { attack: 0.012, reverb: 0.05 });
        playImpact(46, now + 0.9, 0.62, 0.1, out, { click: 115, pan: 0 });
      }
      if (type === "uiTab") playArp([392, 493.88, 587.33], now, 0.026, 0.034, out, { spread: 0.18 });
      if (type === "uiConfirm") playArp([523.25, 659.25, 783.99], now, 0.034, 0.045, out, { spread: 0.2 });
      if (type === "uiCancel") playArp([493.88, 392, 329.63], now, 0.038, 0.038, out, { spread: 0.16 });
      if (type === "uiOpen" || type === "menuOpen") playSweep(280, type === "menuOpen" ? 760 : 560, now, 0.14, 0.028, "sine", out, { reverb: 0.12 });
      if (type === "uiClose" || type === "menuClose") playSweep(type === "menuClose" ? 680 : 520, 240, now, 0.13, 0.026, "sine", out, { reverb: 0.08 });
      if (type === "uiPage") playNoiseBand(now, 0.065, 0.032, out, 2100, 0.8, -0.3, { panEnd: 0.3 });
      if (type === "uiFilter") playArp([440, 554.37], now, 0.028, 0.032, out, { spread: 0.12 });
      if (type === "uiToggle") playMetal(880, now, 0.09, 0.018, out, 0);
      if (type === "uiError") playArp([196, 185], now, 0.055, 0.052, out, { spread: 0.08, type: "square" });
      if (type === "drink") {
        playNoiseBand(now, 0.22, 0.042, out, 950, 0.7, -0.2, { panEnd: 0.2 });
        playMetal(1174.66, now + 0.16, 0.16, 0.022, out, 0.18);
      }
      if (type === "intoxicate") {
        playSweep(330, 118, now, 0.48, 0.045, "triangle", out, { pan: -0.45, panEnd: 0.45, reverb: 0.16 });
        playArp([220, 277.18, 207.65], now + 0.05, 0.09, 0.034, out, { spread: 0.5 });
      }
      if (type === "heartEquip" || type === "heartRestore") {
        const restore = type === "heartRestore";
        playTone(restore ? 98 : 73.42, now, 0.58, 0.05, "sine", out, { reverb: 0.18 });
        playArp(restore ? [293.66, 440, 587.33, 880] : [220, 329.63, 493.88, 739.99], now + 0.03, 0.07, 0.05, out, { spread: 0.38, lastTail: 1.5 });
      }
      if (type === "trapDiscover") {
        playMetal(1760, now, 0.18, 0.026, out, -0.12);
        playArp([880, 1174.66], now + 0.02, 0.04, 0.034, out, { spread: 0.22 });
      }
      if (type === "trapDisarm") {
        playMetal(740, now, 0.13, 0.025, out, -0.18);
        playMetal(987.77, now + 0.07, 0.15, 0.022, out, 0.18);
      }
      if (type === "summon") {
        playTone(55, now, 0.52, 0.072, "sine", out, { reverb: 0.12 });
        playArp([110, 164.81, 220, 329.63], now + 0.03, 0.08, 0.052, out, { spread: 0.48 });
      }
      if (type === "invulnerable") {
        playArp([659.25, 987.77, 1318.51, 1975.53], now, 0.055, 0.05, out, { spread: 0.5, lastTail: 1.5 });
        playTone(2637.02, now + 0.13, 0.42, 0.022, "sine", out, { reverb: 0.32 });
      }
      if (type === "regenerate") {
        playSweep(146.83, 440, now, 0.28, 0.032, "sine", out, { pan: -0.2, panEnd: 0.2, reverb: 0.14 });
        playTone(659.25, now + 0.12, 0.22, 0.018, "sine", out, { reverb: 0.2 });
      }
      if (type === "knockback") playImpact(58, now, 0.24, 0.14, out, { click: 620, pan: 0 });
      if (type === "selfDestruct") {
        playImpact(45, now, 0.42, 0.18, out, { click: 1900, pan: 0 });
        playNoiseBand(now, 0.48, 0.12, out, 1350, 0.5, 0, { reverb: 0.08 });
      }
      if (type === "debuff") playSweep(420, 82.41, now, 0.46, 0.045, "sawtooth", out, { pan: 0.3, panEnd: -0.3, reverb: 0.13 });
      if (type === "devour") {
        playNoiseBand(now, 0.28, 0.09, out, 540, 0.7, -0.2, { panEnd: 0.2 });
        playImpact(72, now + 0.16, 0.14, 0.08, out, { click: 310, pan: 0 });
      }
      if (type === "jobChange") playArp([196, 293.66, 392, 587.33, 783.99], now, 0.065, 0.052, out, { spread: 0.4, lastTail: 1.45 });
      if (type === "tutorial") playArp([523.25, 587.33, 659.25], now, 0.05, 0.038, out, { spread: 0.2 });
      if (type === "shopRefresh") {
        playNoiseBand(now, 0.12, 0.038, out, 1800, 0.8, -0.35, { panEnd: 0.35 });
        playArp([392, 523.25, 698.46], now + 0.06, 0.045, 0.038, out, { spread: 0.3 });
      }
      if (type === "flee") {
        playNoise(now, 0.11, 0.045, out, 1200, { attack: 0.001, pan: -0.28, reverb: 0.018 });
        playSweep(440, 180, now, 0.18, 0.052, "triangle", out, { pan: 0.38, panEnd: -0.42, reverb: 0.06 });
      }

      activeLevel = 1;
      activeSpace = 1;
    }

    function createOutputStage(destination) {
      const input = context.createGain();
      const highpass = context.createBiquadFilter();
      const body = context.createBiquadFilter();
      const trim = context.createGain();
      const compressor = context.createDynamicsCompressor ? context.createDynamicsCompressor() : null;

      highpass.type = "highpass";
      highpass.frequency.value = 28;
      highpass.Q.value = 0.7;
      body.type = "lowshelf";
      body.frequency.value = 170;
      body.gain.value = 1.8;
      trim.gain.value = 0.72;

      input.connect(highpass);
      highpass.connect(body);
      if (compressor) {
        compressor.threshold.value = -18;
        compressor.knee.value = 12;
        compressor.ratio.value = 6;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.14;
        body.connect(compressor);
        compressor.connect(trim);
      } else {
        body.connect(trim);
      }
      trim.connect(destination);

      if (context.createConvolver) {
        const convolver = context.createConvolver();
        const reverbHighpass = context.createBiquadFilter();
        const reverbLowpass = context.createBiquadFilter();
        const wet = context.createGain();
        reverbInput = context.createGain();
        convolver.buffer = createRoomImpulse(0.68);
        reverbHighpass.type = "highpass";
        reverbHighpass.frequency.value = 190;
        reverbLowpass.type = "lowpass";
        reverbLowpass.frequency.value = 5600;
        reverbLowpass.Q.value = 0.4;
        wet.gain.value = 0.14;
        reverbInput.connect(convolver);
        convolver.connect(reverbHighpass);
        reverbHighpass.connect(reverbLowpass);
        reverbLowpass.connect(wet);
        wet.connect(input);
      }

      return input;
    }

    function createRoomImpulse(duration) {
      const length = Math.max(1, Math.floor(context.sampleRate * duration));
      const impulse = context.createBuffer(2, length, context.sampleRate);
      for (let channel = 0; channel < 2; channel += 1) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i += 1) {
          const progress = i / length;
          const onset = Math.min(1, i / Math.max(1, context.sampleRate * 0.004));
          const decay = Math.pow(1 - progress, 3.2);
          data[i] = (Math.random() * 2 - 1) * onset * decay;
        }
      }
      return impulse;
    }

    function playArp(freqs, start, gap, gain, out, options) {
      const opts = options || {};
      const spread = opts.spread === undefined ? 0.3 : opts.spread;
      const center = opts.pan || 0;
      const toneType = opts.type || "triangle";
      const lastIndex = Math.max(1, freqs.length - 1);
      freqs.forEach((freq, index) => {
        const position = freqs.length === 1 ? 0 : (index / lastIndex) * 2 - 1;
        const tail = index === freqs.length - 1 ? (opts.lastTail || 1.18) : 1;
        playTone(freq, start + index * gap, gap * 1.78 * tail, gain * (index ? 0.94 : 1), toneType, out, {
          attack: opts.attack,
          cutoff: opts.cutoff,
          pan: clamp(center + position * spread, -0.82, 0.82),
          reverb: opts.reverb === undefined ? 0.17 : opts.reverb,
          sustain: opts.sustain === undefined ? 0.5 : opts.sustain,
        });
      });
    }

    function playTone(freq, start, duration, gainValue, type, out, options) {
      if (!context) return;
      const opts = options || {};
      const osc = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const rough = type === "sawtooth" || type === "square";
      const peak = Math.max(0.0002, gainValue * activeLevel * (rough ? 0.74 : 1));
      const attack = clamp(opts.attack === undefined ? Math.min(0.007, duration * 0.12) : opts.attack, 0.001, duration * 0.4);
      const sustainRatio = opts.sustain === undefined ? (type === "sine" ? 0.62 : 0.46) : opts.sustain;
      const settle = Math.min(start + duration * 0.42, start + attack + 0.075);
      const cutoff = clamp(opts.cutoff || freq * (rough ? 10 : 16), rough ? 760 : 1400, 7600);
      const defaultPan = freq < 160 ? nextPan(0.045) : nextPan(0.12);

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(1, freq), start);
      if (osc.detune) osc.detune.setValueAtTime((Math.random() - 0.5) * 3.2, start);
      if (rough) {
        // A softly detuned twin removes the raw single-oscillator buzz.
        const twin = context.createOscillator();
        twin.type = type;
        twin.frequency.setValueAtTime(Math.max(1, freq), start);
        if (twin.detune) twin.detune.setValueAtTime(6.5 + Math.random() * 2.5, start);
        twin.connect(filter);
        twin.start(start);
        twin.stop(start + duration + 0.025);
      }
      filter.type = "lowpass";
      filter.Q.value = rough ? 0.82 : 0.48;
      filter.frequency.setValueAtTime(cutoff, start);
      filter.frequency.exponentialRampToValueAtTime(Math.max(180, Math.min(cutoff, freq * 4.5)), start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + attack);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * sustainRatio), settle);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(filter);
      filter.connect(gain);
      connectVoice(gain, out, start, duration, {
        pan: opts.pan === undefined ? defaultPan : opts.pan,
        panEnd: opts.panEnd,
        reverb: opts.reverb === undefined ? (type === "sine" ? 0.16 : 0.1) : opts.reverb,
      });
      osc.start(start);
      osc.stop(start + duration + 0.025);
    }

    function playSweep(from, to, start, duration, gainValue, type, out, options) {
      if (!context) return;
      const opts = options || {};
      const osc = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const peak = Math.max(0.0002, gainValue * activeLevel);
      const attack = clamp(opts.attack === undefined ? Math.min(0.006, duration * 0.1) : opts.attack, 0.001, duration * 0.35);
      const sustain = opts.sustain === undefined ? 0.5 : opts.sustain;
      const rough = type === "sawtooth" || type === "square";
      const highest = Math.max(from, to);
      const cutoff = clamp(opts.cutoff || highest * (rough ? 5.5 : 8), rough ? 900 : 1800, 7800);
      const panStart = opts.pan === undefined ? nextPan(from < 160 ? 0.08 : 0.24) : opts.pan;
      const panEnd = opts.panEnd === undefined ? -panStart : opts.panEnd;

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(1, from), start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
      if (osc.detune) osc.detune.setValueAtTime((Math.random() - 0.5) * 2.4, start);
      filter.type = "lowpass";
      filter.Q.value = rough ? 0.72 : 0.4;
      filter.frequency.setValueAtTime(cutoff, start);
      filter.frequency.exponentialRampToValueAtTime(Math.max(260, cutoff * 0.58), start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + attack);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * sustain), start + duration * 0.36);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(filter);
      filter.connect(gain);
      connectVoice(gain, out, start, duration, {
        pan: panStart,
        panEnd,
        reverb: opts.reverb === undefined ? 0.11 : opts.reverb,
      });
      osc.start(start);
      osc.stop(start + duration + 0.025);
    }

    function playNoise(start, duration, gainValue, out, filterFreq, options) {
      if (!context) return;
      const opts = options || {};
      const length = Math.max(1, Math.floor(context.sampleRate * duration));
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      let smoothed = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        smoothed = smoothed * 0.56 + white * 0.44;
        const color = filterFreq < 700 ? smoothed : white * 0.74 + smoothed * 0.26;
        data[i] = color * Math.pow(1 - i / length, 0.72);
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const attack = clamp(opts.attack === undefined ? 0.002 : opts.attack, 0.0008, duration * 0.35);
      const peak = Math.max(0.0002, gainValue * activeLevel);
      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = Math.min(filterFreq, context.sampleRate * 0.46);
      filter.Q.value = opts.q || 0.72;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(gain);
      connectVoice(gain, out, start, duration, {
        pan: opts.pan === undefined ? nextPan(0.11) : opts.pan,
        panEnd: opts.panEnd,
        reverb: opts.reverb === undefined ? 0.025 : opts.reverb,
      });
      source.start(start);
    }

    function playNoiseBand(start, duration, gainValue, out, frequency, q, panValue, options) {
      if (!context) return;
      const opts = options || {};
      const length = Math.max(1, Math.floor(context.sampleRate * duration));
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      const decayPower = opts.decay || 1.35;
      for (let i = 0; i < length; i += 1) {
        const fade = Math.pow(1 - i / length, decayPower);
        data[i] = (Math.random() * 2 - 1) * fade;
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const attack = clamp(opts.attack === undefined ? 0.004 : opts.attack, 0.0008, duration * 0.35);
      const peak = Math.max(0.0002, gainValue * activeLevel);
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = Math.min(frequency, context.sampleRate * 0.46);
      filter.Q.value = Math.max(0.05, q);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(gain);
      connectVoice(gain, out, start, duration, {
        pan: panValue === undefined ? nextPan(0.24) : panValue,
        panEnd: opts.panEnd,
        reverb: opts.reverb === undefined ? 0.065 : opts.reverb,
      });
      source.start(start);
    }

    function playImpact(frequency, start, duration, gainValue, out, options) {
      const opts = options || {};
      const pan = opts.pan === undefined ? 0 : opts.pan;
      playSweep(frequency * 1.42, Math.max(31, frequency * 0.7), start, duration, gainValue * 0.72, "sine", out, {
        attack: 0.0014, sustain: 0.24, pan, panEnd: pan, reverb: opts.reverb === undefined ? 0.035 : opts.reverb,
      });
      playTone(Math.max(32, frequency * 0.5), start + 0.005, duration * 1.3, gainValue * 0.34, "sine", out, {
        attack: 0.003, sustain: 0.3, pan: pan * 0.25, reverb: 0.045,
      });
      playNoiseBand(start, Math.max(0.025, duration * 0.42), gainValue * 0.42, out, opts.click || 980, 0.78, pan, {
        attack: 0.0008, decay: 2.4, reverb: 0.018,
      });
    }

    function playFM(frequency, start, duration, gainValue, out, options) {
      // Two-operator FM: the modulation index decays so the strike is bright
      // and the tail settles into a near-pure tone, like a struck body.
      if (!context) return;
      const opts = options || {};
      const carrier = context.createOscillator();
      const modulator = context.createOscillator();
      const modGain = context.createGain();
      const gain = context.createGain();
      const peak = Math.max(0.0002, gainValue * activeLevel);
      const ratio = opts.ratio || 2.756;
      const index = opts.index === undefined ? 2.2 : opts.index;
      const indexDecay = Math.max(0.01, opts.indexDecay === undefined ? duration * 0.45 : opts.indexDecay);
      const attack = clamp(opts.attack === undefined ? 0.0012 : opts.attack, 0.0008, duration * 0.3);
      const modFreq = Math.max(1, frequency * ratio);
      carrier.type = "sine";
      modulator.type = "sine";
      carrier.frequency.setValueAtTime(Math.max(1, frequency), start);
      modulator.frequency.setValueAtTime(modFreq, start);
      modGain.gain.setValueAtTime(index * modFreq, start);
      modGain.gain.exponentialRampToValueAtTime(Math.max(0.6, index * modFreq * 0.02), start + indexDecay);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(gain);
      connectVoice(gain, out, start, duration, {
        pan: opts.pan === undefined ? nextPan(0.14) : opts.pan,
        panEnd: opts.panEnd,
        reverb: opts.reverb === undefined ? 0.2 : opts.reverb,
      });
      carrier.start(start);
      modulator.start(start);
      carrier.stop(start + duration + 0.025);
      modulator.stop(start + duration + 0.025);
    }

    function playMetal(frequency, start, duration, gainValue, out, pan) {
      // A clangorous FM strike plus true inharmonic bell partials; coins,
      // bells, blades and UI chimes all share this voice.
      playFM(frequency, start, duration, gainValue * 0.62, out, {
        ratio: 3.01, index: 2.6, indexDecay: duration * 0.3, pan: pan || 0, reverb: 0.22,
      });
      const ratios = [1, 2.756, 5.404, 8.933];
      const levels = [1, 0.5, 0.24, 0.11];
      const lengths = [1, 0.74, 0.52, 0.36];
      ratios.forEach((ratio, index) => {
        const partial = frequency * ratio;
        if (partial > 9200) return;
        playTone(partial, start + index * 0.0012, duration * lengths[index], gainValue * levels[index] * 0.55, "sine", out, {
          attack: 0.0012,
          sustain: 0.3,
          pan: clamp((pan || 0) + (index % 2 ? 0.09 : -0.07), -0.8, 0.8),
          reverb: 0.22,
        });
      });
      playNoiseBand(start, Math.min(0.045, duration * 0.3), gainValue * 0.3, out, Math.min(7600, frequency * 4.6), 2.8, pan || 0, {
        attack: 0.0008, decay: 2.8, reverb: 0.08,
      });
    }

    function connectVoice(node, out, start, duration, options) {
      const opts = options || {};
      const panStart = clamp(opts.pan || 0, -0.9, 0.9);
      const panEnd = opts.panEnd === undefined ? panStart : clamp(opts.panEnd, -0.9, 0.9);
      const panner = context.createStereoPanner ? context.createStereoPanner() : null;
      const spatialNode = panner || node;
      if (panner) {
        panner.pan.setValueAtTime(panStart, start);
        if (panEnd !== panStart) panner.pan.linearRampToValueAtTime(panEnd, start + duration);
        node.connect(panner);
      }
      spatialNode.connect(out);
      if (reverbInput && opts.reverb > 0) {
        const send = context.createGain();
        send.gain.value = clamp(opts.reverb * activeSpace, 0, 0.42);
        spatialNode.connect(send);
        send.connect(reverbInput);
      }
    }

    function nextPan(amount) {
      const positions = [-1, 0.72, -0.46, 0.88, -0.18, 0.42, 0];
      const value = positions[panIndex % positions.length] * amount;
      panIndex += 1;
      return value;
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    return Object.freeze({ play, types: Object.freeze(Object.keys(EVENT_PROFILES)) });
  }

  window.HD_SFX = Object.freeze({ create });
})();
