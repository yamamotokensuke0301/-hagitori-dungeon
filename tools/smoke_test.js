ObjC.import("Foundation");

function read(path) {
  return ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(
    path,
    $.NSUTF8StringEncoding,
    null,
  ));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const scriptFiles = [
  "data/materials.js",
  "data/races.js",
  "data/jobs.js",
  "data/personalities.js",
  "data/equipment.js",
  "data/treasures.js",
  "data/monsters.js",
  "data/floors.js",
  "js/unique-dialogue.js",
  "js/utils.js",
  "js/threat-system.js",
  "js/dungeon-generator.js",
  "js/artifact-generator.js",
  "js/economy.js",
  "js/character-system.js",
  "js/bounty-system.js",
  "js/inn-content.js",
  "js/audio-effects.js",
  "js/surreal-text.js",
  "js/main.js",
];

scriptFiles.forEach((path) => new Function(read(path)));

const styleSource = read("css/style.css");
const mainSource = read("js/main.js");
const innContentSource = read("js/inn-content.js");
const jobsSource = read("data/jobs.js");
const dungeonGeneratorSource = read("js/dungeon-generator.js");
const indexSource = read("index.html");
const combatSimSource = read("tools/combat_balance_sim.js");
const bgmTrackBlock = mainSource.match(/const BGM_TRACKS = \{([\s\S]*?)\n  \};/)?.[1] || "";
const publicBgmPaths = [...bgmTrackBlock.matchAll(/"\.\/(assets\/audio\/[^"?]+\.m4a)\?/g)].map((match) => match[1]);
assert(mainSource.includes('const APP_VERSION = "Prototype 3.7.0"'), "public version was not updated to Prototype 3.7.0");
assert(publicBgmPaths.length === 10 && !bgmTrackBlock.includes(".wav")
  && publicBgmPaths.every((path) => $.NSFileManager.defaultManager.fileExistsAtPath(path)),
"public BGM paths are not ten existing compressed M4A files");
assert(!/\.enemy-fire\s*\{[^}]*background/.test(styleSource), "monster attribute color still changes the background");
assert(mainSource.includes("RESEARCH_EVIDENCE_THRESHOLDS = [0, 1, 30, 85, 180, 320]") && mainSource.includes("function spreadSpeciesResearch") && mainSource.includes("firstMilestone ? 2 : 1"), "long-term research progression does not include milestones and species sharing");
assert(mainSource.includes("if (completedPeer) reconcileResearchCompletion(true)"), "species-shared research can reach maximum without immediate heart/completion reconciliation");
assert(mainSource.includes("function colorizeResearchAttributes") && mainSource.includes("function embellishedResearchNote") && styleSource.includes(".research-note-label"), "colored theatrical research notes are missing");
assert(mainSource.includes("弱点属性") && mainSource.includes("耐性属性") && mainSource.includes("monster.weaknesses.map(attrHtml)"), "explicit colored research affinities are missing");
assert(indexSource.includes('id="deathCryText"') && mainSource.includes("function chooseDeathCry") && mainSource.includes("DEATH_CRY_PERSONALITY"), "player death-cry variation is missing");
assert(mainSource.includes('log(`${adventurerName}の断末魔') && !mainSource.includes('playSfx("death");\n    playSfx(deathVoice)'), "death cry is not logged or is still masked by the old death jingle");
const commonDeathCryBlock = mainSource.match(/const DEATH_CRY_COMMON = Object\.freeze\(\[([\s\S]*?)\]\);/)?.[1] || "";
assert((commonDeathCryBlock.match(/^\s*"/gm) || []).length === 32, "common death-cry catalog must contain 32 lines");
assert(/\.research-card-details \.attr\s*\{[^}]*font-size:\s*1\.15em;/.test(styleSource), "colored research attributes are not enlarged");
const arenaFoeRule = styleSource.match(/\.arena-foe\s*\{[^}]*\}/)?.[0] || "";
assert(arenaFoeRule.includes("color: hsl(var(--arena-marker-hue)"), "arena marker text color is missing");
assert(arenaFoeRule.includes("background: rgba(94, 70, 52, 0.18)"), "arena monster background is not shared");
assert(arenaFoeRule.includes("-webkit-text-stroke: 0") && arenaFoeRule.includes("text-shadow: 0 1px 2px rgba(0, 0, 0, 0.92)"), "arena monster lettering still uses excessive glow");
assert(!styleSource.includes(".arena-actions"), "arena floating action panel still exists");
assert(!mainSource.includes("shortTeleport") && !indexSource.includes("shortTeleportButton"), "removed short teleport still leaves dead UI or runtime code");
assert((jobsSource.match(/長距離テレポートを扱う/g) || []).length >= 2 && !jobsSource.includes("短距離転移・テレポート"), "mage job descriptions still advertise short teleport");
assert(indexSource.includes('class="dungeon-action-dock"') && /\.dungeon-action-dock\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto/.test(styleSource) && /\.controls\s*\{[^}]*position:\s*static/.test(styleSource), "shared dungeon action dock does not place abilities and keypad side by side");
assert(styleSource.includes("grid-template-columns: repeat(13, var(--tile))"), "dungeon viewport is not 13 columns");
assert(/\.map\s*\{[^}]*gap:\s*0;/.test(styleSource), "dungeon floor tiles are still separated by grid gaps");
assert(/\.map\s*\{[^}]*background:\s*#1b241c;/.test(styleSource), "dungeon map underlay can expose black subpixel seams");
assert(styleSource.includes("width: calc(var(--tile) + 0.6px)") && styleSource.includes("height: calc(var(--tile) + 0.6px)"), "dungeon cells do not overlap fractional-pixel seams");
assert(/\.tile-floor\s*\{[^}]*border:\s*0;/.test(styleSource), "dungeon floor tiles still draw individual borders");
const playerTileRule = styleSource.match(/\.tile-player\s*\{[^}]*\}/)?.[0] || "";
assert(playerTileRule.includes("box-shadow: none") && !playerTileRule.includes("radial-gradient"), "player marker still has a surrounding tile frame");
assert(playerTileRule.includes("font-size: calc(var(--tile) * 0.62)") && playerTileRule.includes("font-weight: 400"), "player marker is not using the enlarged lighter style");
assert(/\.cell\.light-room\.tile-floor\s*\{[^}]*box-shadow:\s*none;/.test(styleSource), "always-lit floor still draws per-tile lighting frames");
assert(/\.cell\.light-near\s*\{[^}]*brightness\(1\.18\)[^}]*saturate\(1\.08\)/.test(styleSource) && /\.cell\.light-room\s*\{[^}]*brightness\(1\.18\)[^}]*saturate\(1\.08\)/.test(styleSource), "always-lit rooms no longer match player-light brightness");
assert(/\.cell\.light-room\.tile-floor\s*\{[^}]*background:\s*#1b241c;/.test(styleSource), "always-lit floor color differs from player-lit floor");
assert(styleSource.includes(".map::after") && styleSource.includes("pointer-events: none"), "dungeon light-source overlay is missing");
const dungeonOverlayRule = styleSource.match(/\.dungeon-stats-overlay\s*\{[^}]*\}/)?.[0] || "";
assert(indexSource.includes('class="dungeon-projection"') && indexSource.includes('id="dungeonStatsOverlay"'), "in-projection dungeon stat overlay is missing");
assert(indexSource.includes('id="dungeonHpText"') && indexSource.includes('id="dungeonMaxHpText"') && indexSource.includes('id="dungeonHpFill"'), "dungeon HP is not inside the projection overlay");
assert(styleSource.includes(".app-shell.dungeon-mode .status-hp") && styleSource.includes("display: none") && styleSource.includes(".dungeon-hp-stat"), "top HP remains visible in dungeon mode or projected HP lacks styling");
assert(dungeonOverlayRule.includes("position: absolute") && dungeonOverlayRule.includes("pointer-events: none"), "dungeon stat overlay does not float safely over the projection");
assert(dungeonOverlayRule.includes("border: 0") && dungeonOverlayRule.includes("background: transparent") && dungeonOverlayRule.includes("box-shadow: none"), "dungeon stat overlay frame is still visible");
assert(!indexSource.includes('id="dungeonGoldText"') && !mainSource.includes("dungeonGold"), "gold is still shown inside the dungeon projection");
assert((indexSource.match(/data-view=/g) || []).length === 10 && indexSource.includes('data-view="inn"') && indexSource.includes('data-view="jobCenter"') && indexSource.includes('data-view="junkDealer"'), "town facilities are not distributed across ten tabs");
assert(styleSource.includes("grid-template-rows: repeat(2, minmax(32px, auto))") && styleSource.includes("grid-template-rows: repeat(2, minmax(38px, auto))"), "navigation is not fixed to two rows on desktop and mobile");
assert(mainSource.includes("function renderInn") && mainSource.includes("function renderJobCenter") && mainSource.includes('施設は上のタブへ分散した'), "town facility rendering remains concentrated in the town view");
assert(styleSource.includes(".app-shell.dungeon-mode > .character-strip") && styleSource.includes(".app-shell.dungeon-mode .equipment-strip"), "old dungeon HUD strips were not hidden");
assert(styleSource.includes(".research-monster-graphic"), "research monster graphic style is missing");
assert(styleSource.includes("#dungeonView") && styleSource.includes("overflow-y: auto"), "narrow dungeon view cannot scroll");
assert(indexSource.includes('id="jobSkillButton"'), "dungeon job skill control is missing");
assert(indexSource.includes('id="liveLogAnnouncer"') && indexSource.includes('role="log"'), "accessible incremental log announcer is missing");
assert(indexSource.includes('aria-rowcount="13" aria-colcount="13"') && mainSource.includes('row.setAttribute("role", "row")')
  && styleSource.includes(".map-grid-row"),
"dungeon map does not expose an ARIA row/gridcell structure");
assert(indexSource.includes('id="openLogHistoryButton"') && indexSource.includes('aria-controls="logHistoryPanel"'), "log-history opener is missing or does not name its dialog");
assert(indexSource.includes('id="logHistoryPanel"') && indexSource.includes('aria-labelledby="logHistoryTitle"') && indexSource.includes('aria-modal="true"'), "accessible log-history dialog is missing");
assert(indexSource.includes('id="appShell" class="app-shell town-mode" aria-label="剥ぎ取りダンジョン" aria-hidden="true" inert')
  && (indexSource.match(/aria-modal="true"/g) || []).length >= 9
  && mainSource.includes("function syncOverlayAccessibility"),
"title or modal backgrounds are not made inert and hidden from assistive technology");
assert(indexSource.includes('id="saveWarning"') && indexSource.includes('id="saveWarningReloadButton"')
  && styleSource.includes(".save-warning") && mainSource.includes("function markSaveConflict"),
"save failures or multi-tab conflicts have no visible recovery warning");
assert(mainSource.includes('SAVE_REVISION_KEY = "hagitori-dungeon-save-revision-v1"')
  && (mainSource.match(/if \(saved\.dungeon && !isValidDungeonState/g) || []).length === 1,
"save revision reads were not separated or dungeon validation still runs twice");
assert(indexSource.includes('id="logHistoryList"') && indexSource.includes('aria-live="off"') && indexSource.includes('tabindex="0"'), "log-history focus target can announce the whole history live");
assert(styleSource.includes(".log-history-card") && styleSource.includes(".log-history-list") && styleSource.includes("overscroll-behavior: contain"), "log-history dialog cannot scroll safely on short screens");
assert(/\.setup-card\s*\{[^}]*max-height:\s*calc\(100dvh - 32px\);[^}]*overflow-y:\s*auto;/.test(styleSource)
  && /\.setup-picker-card\s*\{[^}]*overflow-y:\s*auto;/.test(styleSource),
"character setup dialogs cannot scroll on short phones");
assert(mainSource.includes("LOG_HISTORY_LIMIT = 60") && mainSource.includes("function openLogHistory") && mainSource.includes("function closeLogHistory"), "bounded log-history behavior is missing");
assert(mainSource.includes("const DEVELOPER_MODE_ENABLED") && mainSource.includes("localhost|127\\.0\\.0\\.1") && mainSource.includes("if (!DEVELOPER_MODE_ENABLED) return"), "developer controls are not sealed on public hosts");
assert(mainSource.includes("DEVELOPER_MODE_ENABLED ? '<button type=\"button\" id=\"openDeveloperPanelButton\""), "developer-panel opener is still unconditional");
assert(mainSource.includes('id="shopCompatibilitySelect"') && mainSource.includes("!shopCompatibleOnly || item.jobs.includes(adv.jobId)"), "shop current-job compatibility filter is missing");
assert(mainSource.includes("function equipmentRole(item)") && mainSource.includes("window.HD_EQUIPMENT_ROLES"), "internal equipment role classification is missing");
assert(!mainSource.includes('id="shopEquipmentRoleSelect"') && !mainSource.includes('id="homeEquipmentRoleSelect"') && !styleSource.includes(".equipment-role-tag"), "internal equipment roles leaked into player-facing UI");
assert(mainSource.includes("function arenaUnlocked") && mainSource.includes(".includes(10)") && mainSource.includes("地下10階を踏破した功績が認められ"), "arena is not gated behind clearing B10");
assert(styleSource.includes(".tabs button.locked") && mainSource.includes('button.textContent = arenaLocked ? "闘技場・封"'), "locked arena tab has no visible state");
assert(mainSource.includes("function junkDealerUnlocked") && mainSource.includes(".includes(20)") && mainSource.includes("地下20階を踏破した噂を聞きつけ"), "junk dealer is not gated behind clearing B20");
assert(mainSource.includes('button.textContent = junkDealerLocked ? "珍品店・封"'), "locked junk-dealer tab has no visible state");
assert(mainSource.includes('`${attr(item.attributeAttack)}攻`') && mainSource.includes('`${attr(resistanceFocus)}耐`'), "equipment specialization tags do not expose their focus");
assert(mainSource.includes('playSfx("levelStatUp")') && mainSource.includes("data-level-stat"), "sequential level-up stat presentation is missing");
assert(mainSource.includes('state.adventurer.jobId === "ninja"') && mainSource.includes('cell.classList.add("player-unlit")') && styleSource.includes(".player-unlit"), "ninja player marker still emits a glow");
assert(mainSource.includes("const growthStepDelay = 750") && mainSource.includes("const unchangedStepDelay = 480") && mainSource.includes('entry.difference > 0 ? "will-rise" : "unchanged"'), "level-up stat presentation is not using growth-aware cadence");
assert(mainSource.includes('class="stat-gain">+${entry.difference}') && styleSource.includes(".level-up-stat.will-rise.revealed .stat-gain"), "level-up stat point gains are not visually exposed");
assert(mainSource.includes('luck: "運", acceleration: "加速度"') && !mainSource.includes('defense: "防御", attackMin: "最低攻撃"'), "level-up presentation includes stats that cannot grow directly");
assert(mainSource.includes("function activeModalPanel") && mainSource.includes("function showDialog") && mainSource.includes("function closeTopModalFromEscape") && mainSource.includes('event.key === "Escape"'), "shared modal focus trapping or Escape close is missing");
assert(mainSource.includes('id="arenaSkillButton"'), "arena job skill control is missing");
assert(mainSource.includes('class="arena-grid-row" role="row"') && mainSource.includes('class="arena-gridcell" role="gridcell"')
  && styleSource.includes(".arena-grid-row"),
"arena board does not expose a valid row/gridcell structure");
assert(mainSource.includes("enemy.unique ? [3, 5]") && mainSource.includes(": [1, 2]"), "harvest count ranges are missing");
assert(!mainSource.includes("残り${corpse.harvestsRemaining}回"), "harvest count is exposed to the player");
assert(mainSource.includes("TRAP_FLOOR_CHANCE = 0.42") && mainSource.includes("Math.random() < TRAP_FLOOR_CHANCE"), "trap floor chance was not doubled to 42%");
assert(mainSource.includes("TRAP_COUNT_MULTIPLIER = 4") && mainSource.includes("* TRAP_COUNT_MULTIPLIER"), "trap count was not increased to four times the original");
assert(mainSource.includes('bear: "トラバサミ"') && mainSource.includes('teleport: "強制転移罠"') && mainSource.includes('summon: "召喚罠"'), "new trap type labels are missing");
assert(mainSource.includes('pick(["damage", "slow", "drain", "bear", "teleport", "summon", "scatter"])'), "new trap types are not generated");
assert(mainSource.includes("function summonTrapEncirclement") && mainSource.includes("positions.length * effectMultiplier") && mainSource.includes('state.dungeon.map[y][x] = "floor"'), "summon trap does not form a complete surrounding ring");
assert(mainSource.includes("immobilizedTurns") && mainSource.includes("トラバサミが脚を噛み、移動できない"), "bear trap immobilization is missing");
assert(mainSource.includes("強制転移罠が空間を裏返し") && mainSource.includes("spawnPosition(state.dungeon, distance)"), "forced teleport trap behavior is missing");
assert(mainSource.includes('scatter: "罠バラまき罠"') && mainSource.includes("function scatterTrapField") && mainSource.includes("8 + danger * 5"), "trap-scatter trap is missing");
assert(mainSource.includes('const scatteredTypes = ["damage", "slow", "drain", "bear", "teleport", "summon"]'), "trap-scatter trap can recurse or lacks mixed trap types");
assert(mainSource.includes("Math.hypot(x - state.dungeon.player.x, y - state.dungeon.player.y)"), "dungeon light distance is not circular");
assert(mainSource.includes("DUNGEON_LIGHT_RADIUS") && mainSource.includes("near: 2.25, mid: 4.6"), "dungeon light radius is not using the reduced range");
assert(mainSource.includes('jobId === "ninja") return { near: 0, mid: 0 }') && mainSource.includes('jobId === "handyman" ? 1 : 0'), "job-specific dungeon light ranges are missing");
assert(mainSource.includes("function capoeiraDirection") && mainSource.includes("return capoeiraActive(host) ? [-dx, -dy] : [dx, dy]") && mainSource.includes('capoeiraKick ? "逆立ち旋風脚"'), "capoeira inversion or kick behavior is missing");
assert(styleSource.includes(".capoeira-inverted") && styleSource.includes("transform: rotate(180deg)"), "capoeira player marker is not inverted");
assert(mainSource.includes("DRINK_COST = 1") && mainSource.includes("function drinkAtInn") && mainSource.includes("function acuteAlcoholRisk"), "inn drinking and alcohol poisoning risk are missing");
assert(mainSource.includes("function intoxicatedDirection") && mainSource.includes("function tickIntoxication"), "drunken movement or duration is missing");
assert(mainSource.includes("DRUNKEN_FIST_POWER = 3.6") && mainSource.includes('state.adventurer.jobId === "heavy" && !state.adventurer.equipment.weapon') && mainSource.includes("酔拳・八仙酔打"), "bare-handed berserker drunken fist is missing or not top tier");
assert(innContentSource.includes("const ingredients") && innContentSource.includes("const styles") && mainSource.includes("function eatTavernSnack"), "random tavern snack system is missing");
assert(mainSource.includes("INN_CONTENT.snacks.find") && mainSource.includes("INN_CONTENT.personalityComments[adv.personalityId]"), "snacks do not use personality-specific comments");
assert(mainSource.includes('adv.personalityId === "glutton"') && mainSource.includes("function tickSnackBuff") && mainSource.includes("grownStats[adv.snackBuff.stat]"), "glutton snack stat buff is missing");
assert(indexSource.includes('id="junkDealerView"') && mainSource.includes("function renderJunkDealer") && mainSource.includes("function appraiseJunk") && mainSource.includes("function exchangeJunkMaterial"), "junk dealer store is missing");
assert(mainSource.includes('material?.junkDealerTier === "ultra" ? 7200') && mainSource.includes('material?.junkDealerTier === "super" ? 1440 : 540') && mainSource.includes('item?.junkTier === "legend" ? 2'), "junk dealer rarity exchange rates are invalid");
assert(mainSource.includes("function refreshJunkDealerStock") && mainSource.includes("refined: 6, super: 4, ultra: 2") && mainSource.includes("enteringJunkDealer"), "junk dealer does not randomly stock materials on each visit");
assert(styleSource.includes(".tavern-snack-menu"), "tavern snack menu styling is missing");
assert(mainSource.includes("MAP_SIZE_RANGE = Object.freeze([36, 60])") && mainSource.includes("rand(minimumSize, MAP_SIZE_RANGE[1])"), "dungeon map size does not vary from 36 to 60");
assert(styleSource.includes(".cell.light-room") && mainSource.includes("alwaysLitTiles") && dungeonGeneratorSource.includes("alwaysLitTileKeys"), "always-lit rooms and their first corridor tile are not rendered above dungeon darkness");
assert(!dungeonGeneratorSource.includes("corridorWidth"), "two-tile corridor generation remains enabled");
assert(mainSource.includes('state.adventurer.jobId === "handyman" ? 1 : 0'), "handyman harvest-count bonus is missing");
assert(mainSource.includes('adv.personalityId === "lewd"') && mainSource.includes("RISQUE_SYNERGY_PER_ITEM") && mainSource.includes("risqueSynergyCount * RISQUE_SYNERGY_PER_ITEM.acceleration"), "lewd/risque equipment synergy is missing");
assert(mainSource.includes('secretName === "サイタマ"') && mainSource.includes("SAITAMA_ONE_PUNCH_CHANCE"), "Saitama name secret is missing");
assert(mainSource.includes('secretName === "リムル" && state.adventurer.raceId === "slime"') && mainSource.includes("虚崩朧千変万華"), "Rimuru/slime floor-wipe secret is missing or applies to another race");
assert(mainSource.includes('adv.raceId === "slime"') && mainSource.includes("RIMURU_SLIME_STAT_BONUS") && mainSource.includes("rimuruSlimeAwakened"), "Rimuru/slime strongest-race secret is missing");
assert(mainSource.includes('=== "孫悟空"') && mainSource.includes('adv.equipment.weapon === "artifact_power_pole"') && mainSource.includes("powerPoleAwakened ? 300"), "Son Goku/Power Pole awakening is missing");
assert(mainSource.includes("function searchForTraps") && mainSource.includes("function disarmTrap"), "active trap search/disarm actions are missing");
assert(mainSource.includes("TRAP_JOB_DISARM_BONUSES") && mainSource.includes("dangerPenalty") && mainSource.includes("triggerCount"), "persistent traps or character-based danger disarming is missing");
assert(mainSource.includes('state.adventurer.jobId === "hunter" ? corpseHarvestsRemaining(corpse) : 1'), "thief bulk harvesting is missing");
assert(mainSource.includes("MONSTER_SLEEP_CHANCE = 0.14") && mainSource.includes("THIEF_SLEEP_AMBUSH_MULTIPLIER = 3"), "sleeping-monster/thief ambush rules are missing");
assert(styleSource.includes(".tile-sleeping") && styleSource.includes(".sleep-indicator"), "sleeping monster has no visible map state");
assert(indexSource.includes('id="deathReviewPanel"') && indexSource.includes('id="continueAfterDeathButton"'), "manual death-log review UI is missing");
assert(indexSource.includes('id="deathReviewLog"') && indexSource.includes('tabindex="0"'), "death-log review focus target is missing");
assert(indexSource.includes('id="depthPickerPanel"') && indexSource.includes('aria-labelledby="depthPickerTitle"'), "accessible boss-floor departure picker is missing");
assert(indexSource.indexOf('id="magicMoveControls"') < indexSource.indexOf('class="controls"') && styleSource.includes(".death-review-card"), "action-dock control order or short-screen death review layout is missing");
assert(/\.controls\s*\{[^}]*border:\s*0;[^}]*background:[^}]*rgba\([^)]*,\s*0\.(?:42|5)\)[^}]*box-shadow:\s*none;/.test(styleSource), "keypad outer frame is not transparently blended into the map");
assert(styleSource.includes("grid-template-columns: repeat(3, 54px)") && styleSource.includes("grid-template-rows: repeat(3, 50px)"), "keypad did not receive the requested six-pixel size increase");
assert(styleSource.includes("@media (min-width: 980px)") && styleSource.includes("width: min(100vw, 1180px)") && styleSource.includes("grid-template-columns: repeat(10, minmax(0, 1fr))"), "desktop-wide town layout is missing");
assert(styleSource.includes("grid-template-columns: minmax(600px, 1fr) minmax(310px, 360px)") && styleSource.includes("min(42px, calc((100svh - 360px) / 13))"), "desktop dungeon map and side-log layout is missing");
assert(/\.controls\s*\{[^}]*transform:\s*translateY\(-3px\)/.test(styleSource), "keypad does not include the additional one-pixel upward offset");
assert(/\.magic-move-controls\s*\{[^}]*transform:\s*translateY\(-4px\) scale\(0\.9\)[^}]*transform-origin:\s*right center/.test(styleSource), "purple ability box size or four-pixel upward offset is missing");
assert(styleSource.includes("clamp(105px, 15svh, 132px)") && styleSource.includes("calc((100svh - 328px) / 13)"), "removed dungeon status space was not assigned to the log");
assert(/\.app-shell\.dungeon-mode \.status-bar\s*\{[^}]*display:\s*none/.test(styleSource), "dungeon still shows the top place/job/race status bar");
assert(mainSource.includes('writeStorage(AUDIO_KEY, "0")') && mainSource.includes('currentView === "arena"') && styleSource.includes('.app-shell:not(.town-mode) .audio-button') && indexSource.includes("街で音楽を切り替える"), "music switching is not restricted to town screens");
assert(styleSource.includes("min(32px, calc((100vw - 42px) / 13)") && styleSource.includes("min(29px, calc((100vw - 42px) / 13)"), "dungeon map tiles do not use the reclaimed phone viewport space");
assert(mainSource.includes("const overlayOpen") && mainSource.includes("const dungeonMovement"), "global movement keys are not gated to active combat");
assert(mainSource.includes("function trapModalFocus") && mainSource.includes("focusEscapesForward"), "modal keyboard focus can escape into the background");
assert(combatSimSource.includes("const RANDOM_SEED") && combatSimSource.includes("pairedProfiles")
  && combatSimSource.includes("[10, 30, 50]") && combatSimSource.includes("attritionRecoveryDebt")
  && combatSimSource.includes("telegraphedAttribute"),
"combat simulator lacks deterministic paired 10/30/50 runs or corrected boss scheduling");
assert(indexSource.includes("js/artifact-generator.js"), "random artifact generator is not loaded before the game");
assert(mainSource.includes('item.artifact.random ? "☆" : "★"'), "fixed/random artifact star marks are not differentiated");
assert(mainSource.includes("discoverSpecialRoomsAt") && mainSource.includes("openTreasureVaultChest") && mainSource.includes("openThrillArtifactChest"), "rare special-room interactions are missing");
assert((mainSource.match(/finishDungeonAttack\(enemy, result\)/g) || []).length === 4, "a dungeon attack path can still skip action consumption on a kill");
assert(mainSource.includes("options.trials ?? 1"), "enemy normal attacks do not default to one trial");
assert(mainSource.includes("return Number(a || 0) + Number(b || 0)") && mainSource.includes("stats.resistances[id] = clamp(Number(stats.resistances[id] || 0), -4, 5)"), "stacked resistance is not summed before its final -4..5 clamp");
assert(mainSource.includes("multiplier === 0") && mainSource.includes("resistedDamage <= 0"), "true immunity can still be converted into chip damage");
assert((mainSource.match(/=== "telegraphed"\) break/g) || []).length >= 2, "an accelerated enemy can continue acting after a danger telegraph");
assert(mainSource.includes("experienceMultiplier: 0.5, leaveCorpse: false") && mainSource.includes("sanitizeGuardianSpecialAttack"), "self-destruct reward/corpse/guardian rules are missing");
assert(mainSource.includes("outcome.hitCount > 0") && mainSource.includes("knockPlayerBack(enemy, 2)"), "drain or knockback can apply without a hit");
assert(mainSource.includes("SCAVENGER_EFFECTIVE_NUTRITION_CAP = 1600"), "scavenger effective nutrition cap is missing");
const innAdviceBlock = innContentSource.slice(innContentSource.indexOf("const advices"), innContentSource.indexOf("const ingredients"));
assert((innAdviceBlock.match(/^    \"/gm) || []).length >= 45, "innkeeper advice was not expanded to at least 45 entries");
assert(mainSource.includes("recentInnAdviceIndexes") && mainSource.includes(".slice(0, 6)"), "innkeeper advice does not avoid the six most recent entries");

var window = {};
[
  "data/materials.js",
  "data/races.js",
  "data/jobs.js",
  "data/personalities.js",
  "data/equipment.js",
  "data/treasures.js",
  "data/monsters.js",
  "data/floors.js",
  "js/unique-dialogue.js",
  "js/utils.js",
  "js/threat-system.js",
  "js/dungeon-generator.js",
  "js/artifact-generator.js",
  "js/economy.js",
  "js/character-system.js",
  "js/bounty-system.js",
  "js/inn-content.js",
  "js/audio-effects.js",
  "js/surreal-text.js",
].forEach((path) => eval(read(path)));

const surrealSampleCount = Array.from({ length: 1000 }, (_, index) => window.HD_SURREAL.decorate("基準文", `sample:${index}`)).filter((text) => text !== "基準文").length;
assert(surrealSampleCount >= 85 && surrealSampleCount <= 115, "surreal text seasoning is not approximately ten percent");
assert(window.HD_SURREAL.fragments.length >= 30 && indexSource.includes("js/surreal-text.js"), "surreal text variety or script loading is missing");
assert(mainSource.includes("SURREAL?.decorateData(DATA)") && mainSource.includes("SURREAL?.decorateLog"), "surreal seasoning does not cover data prose and runtime logs");

assert(window.HD_UTILS.chebyshevDistance({ x: 0, y: 0 }, { x: -3, y: 2 }) === 3, "shared grid distance is invalid");
assert(!window.HD_UTILS.hasLineOfSight({ x: 0, y: 0 }, { x: 4, y: 0 }, (x) => x === 2), "shared line of sight ignored an intermediate blocker");
assert(window.HD_UTILS.hasLineOfSight({ x: 0, y: 0 }, { x: 2, y: 0 }, (x) => x === 2), "shared line of sight treated the target as an intermediate blocker");
assert(window.HD_DATA.races.length === 30, "race roster must contain 30 races");
assert(window.HD_DATA.materials.filter((material) => material.junkDealerTier).length === 48, "junk dealer material candidate variety must be forty-eight");
assert(window.HD_DATA.materials.filter((material) => material.junkDealerTier === "refined").length === 16, "junk dealer refined material pool is incomplete");
assert(window.HD_DATA.races.every((race) => Number.isFinite(race.powerRating) && race.experienceMultiplier >= 0.75 && race.experienceMultiplier <= 1.8), "race growth difficulty is missing or out of range");
const highElfRace = window.HD_DATA.races.find((race) => race.id === "high_elf" && race.name === "ハイエルフ");
const superhumanRace = window.HD_DATA.races.find((race) => race.id === "superhuman" && race.name === "超人");
const weakestSlimeRace = window.HD_DATA.races.find((race) => race.id === "slime" && race.name === "スライム");
assert(highElfRace?.canSeeInvisible && highElfRace.acceleration === 5 && highElfRace.stats.dexterity === 5, "high elf race traits are invalid");
assert(superhumanRace?.stats.strength === 6 && superhumanRace.stats.durability === 6 && superhumanRace.resistances.blunt === 3, "superhuman race traits are invalid");
assert(highElfRace.experienceMultiplier > window.HD_DATA.races.find((race) => race.id === "elf").experienceMultiplier && superhumanRace.experienceMultiplier > window.HD_DATA.races.find((race) => race.id === "human").experienceMultiplier && weakestSlimeRace.experienceMultiplier < 1, "stronger races do not take longer to level");
assert(["strength", "speed", "dexterity", "durability", "luck"].every((key) => highElfRace.stats[key] >= window.HD_DATA.races.find((race) => race.id === "elf").stats[key]), "high elf is not a complete upgrade over elf");
assert(["strength", "speed", "dexterity", "durability", "luck"].every((key) => superhumanRace.stats[key] > window.HD_DATA.races.find((race) => race.id === "human").stats[key]), "superhuman is not a complete upgrade over human");
const raceStatTotal = (race) => Object.values(race.stats).reduce((sum, value) => sum + value, 0);
assert(weakestSlimeRace?.resistances.poison === "immune" && weakestSlimeRace.acceleration === -4, "weakest slime race traits are invalid");
assert(window.HD_DATA.races.every((race) => race === weakestSlimeRace || raceStatTotal(weakestSlimeRace) < raceStatTotal(race)), "slime is not the weakest race by stat budget");
assert(window.HD_CHARACTER.generateBackstory({ name: "アルシア", race: highElfRace, personality: window.HD_DATA.personalities[0] }).includes("千年樹"), "high elf backstory origin is missing");
assert(window.HD_CHARACTER.generateBackstory({ name: "剛", race: superhumanRace, personality: window.HD_DATA.personalities[0] }).includes("高峰の修練城"), "superhuman backstory origin is missing");
assert(window.HD_CHARACTER.generateBackstory({ name: "ぷるる", race: weakestSlimeRace, personality: window.HD_DATA.personalities[0] }).includes("錬金釜"), "slime backstory origin is missing");
const lazyBackstory = window.HD_CHARACTER.generateBackstory({
  name: "ねむり丸",
  race: window.HD_DATA.races.find((race) => race.id === "human"),
  personality: window.HD_DATA.personalities.find((personality) => personality.id === "lazy"),
});
assert(lazyBackstory === window.HD_CHARACTER.generateBackstory({
  name: "ねむり丸",
  race: window.HD_DATA.races.find((race) => race.id === "human"),
  personality: window.HD_DATA.personalities.find((personality) => personality.id === "lazy"),
}), "backstory generation is not deterministic");
assert(lazyBackstory.includes("ねむり丸") && lazyBackstory.includes("昼寝と遠回り"), "lazy backstory traits were lost during extraction");

assert(window.HD_DATA.monsters.length === 793, "monster count changed");
assert(window.HD_DATA.equipment.length === 2724, "equipment count changed");
const starterBuildEquipment = window.HD_DATA.equipment.filter((item) => item.starterOnly);
assert(starterBuildEquipment.length === 15 && window.HD_DATA.jobs.every((job) => starterBuildEquipment.some((item) => item.jobs.includes(job.id))), "job-specific starter equipment is incomplete");
assert(starterBuildEquipment.every((item) => item.attackAttributes.length >= 1 && item.description), "starter equipment lacks build identity");
assert(mainSource.includes("function starterBuildLoadout") && mainSource.includes('capoeirista: null') && mainSource.includes('job.id === "capoeirista" ? "starter_capoeira_wraps"'), "character-aware starter loadout selection is missing");
assert(window.HD_DATA.equipment.every((item) => Array.isArray(item.attackAttributes)), "equipment attackAttributes were not normalized");
assert(window.HD_DATA.equipment.some((item) => item.attackAttributes.length >= 2), "multi-attribute equipment is missing");
const puzzleEquipment = window.HD_DATA.equipment.filter((item) => item.puzzleEffects?.length);
assert(puzzleEquipment.length === 17 && puzzleEquipment.every((item) => item.description.includes("連携効果")), "hand-authored equipment puzzle set is incomplete");
const chestArtifacts = window.HD_DATA.equipment.filter((item) => item.artifact?.chestOnly);
assert(chestArtifacts.length === 65, "fixed artifact catalog must contain 65 items");
assert(["joke", "trash", "ordinary", "useful"].every((tier) => chestArtifacts.filter((item) => item.artifact.tier === tier).length === 12) && chestArtifacts.filter((item) => item.artifact.tier === "cheat").length === 17, "fixed artifact tier counts are invalid");
assert(chestArtifacts.some((item) => item.id === "artifact_power_pole" && item.name === "如意棒"), "Power Pole artifact is missing");
const outrageousBikinis = chestArtifacts.filter((item) => item.id.startsWith("artifact_outrageous_bikini_"));
assert(outrageousBikinis.length === 2
  && outrageousBikinis.every((item) => item.risque && item.rousesDungeon && item.defense === 0 && Object.values(item.resistances).filter((value) => value === "immune").length === 6),
"outrageous bikini artifacts are missing their zero-defense/multi-immunity tradeoff");
assert(mainSource.includes("function hasDungeonRousingEquipment")
  && mainSource.includes("asleep: !hasDungeonRousingEquipment()")
  && mainSource.includes("ダンジョン中のモンスターが一斉に目を覚ました"),
"outrageous bikini dungeon-wide awakening effect is missing");
assert(chestArtifacts.filter((item) => item.curse).length >= 45, "artifacts are not often cursed");
assert(chestArtifacts.every((item) => item.artifact.guildPoints > 0), "an artifact has no guild point value");
const gradeShopFloors = [1, 1, 15, 25, 35, 45, 55, 70, 85];
assert(gradeShopFloors.every((minimumFloor, index) => window.HD_DATA.equipment
  .filter((item) => item.id.startsWith(`series_${index + 1}_`))
  .every((item) => item.shopMinFloor === minimumFloor)), "equipment grade shop-depth gates are invalid");
assert(window.HD_DATA.spellbookRanks.length === 5, "spellbook rank count changed");
assert(window.HD_DATA.spellbookRanks.every((rank, index, ranks) => index === 0 || (rank.rarityWeight < ranks[index - 1].rarityWeight && rank.minFloor > ranks[index - 1].minFloor)), "higher spellbook ranks are not progressively rarer");
assert(window.HD_DATA.spells.length === 15 && window.HD_DATA.spellbooks.length === 15, "spell/spellbook catalog count changed");
assert(window.HD_DATA.spells.every((spell) => spell.range >= 1 && spell.range <= 6), "a spell range exceeds the visible targeting radius");
assert(window.HD_DATA.spells.every((spell) => spell.cooldown >= 1 && spell.effect), "a spell lacks recast timing or a distinct effect");
assert(new Set(window.HD_DATA.spells.map((spell) => spell.effect)).size >= 12, "spell effects are not sufficiently differentiated");
assert(mainSource.includes("function applySpellEffect") && mainSource.includes("function tickSpellCooldowns") && mainSource.includes('id="arenaSpellButton"'), "spell effects, recast timing, or arena casting is missing");
const rangedJobs = window.HD_DATA.jobs.filter((job) => ["hunter", "archer", "psychic", "ninja", "flower_tamer"].includes(job.id));
assert(rangedJobs.every((job) => job.rangedRange >= 4 && job.skill.cooldown >= 3), "a non-magic ranged job lacks range or skill recast timing");
assert(window.HD_DATA.jobs.find((job) => job.id === "archer").rangedRange === 7, "archer is not the longest-range weapon job");
assert(mainSource.includes("function applyRangedJobSkillEffect") && mainSource.includes('job.skill.tag === "piercing_arrow"') && mainSource.includes('job.skill.tag === "shadow_assassination"'), "ranged-job signature mechanics are missing");
assert(mainSource.includes('rangedMode && adv.jobId === "ninja"') && mainSource.includes("attackTrials * 0.5"), "ninja ranged attacks still retain full melee attack count");
assert(mainSource.includes("VAULT_LEGEND_JUNK_CHANCE = 0.008") && mainSource.includes('item.junkTier !== "legend"') && mainSource.includes(".slice(0, 12)"), "treasure vault still guarantees top-price legend junk");
assert(mainSource.includes("minimumSpellRank = depth >= 90 ? 4 : depth >= 70 ? 3 : depth >= 40 ? 2 : 1"), "normal chest spellbook ranks do not improve with depth");
assert(mainSource.includes("OUT_OF_DEPTH_SPELLBOOK_CHANCE = 0.0001")
  && (mainSource.match(/outOfDepthSpellbooks/g) || []).length >= 6,
"out-of-depth spellbooks do not have a very rare shallow-floor route");
assert(mainSource.includes('state.adventurer.jobId === "hunter" ? 0.99') && mainSource.includes('state.adventurer.jobId === "handyman" ? 0.97') && mainSource.includes("failureEffectMultiplier"), "late-game trap disarm expertise is flattened by a shared cap");
assert(mainSource.includes("floorNumber >= 61 && floorNumber <= 90 && Math.random() < 0.02"), "danger-five traps have no rare pre-final-depth appearance");
assert(window.HD_DATA.personalities.some((item) => item.id === "ordinary" && item.name === "ふつう"), "ordinary personality is missing");
assert(window.HD_DATA.personalities.some((item) => item.id === "lewd" && item.name === "すけべ"), "lewd personality is missing");
assert(window.HD_DATA.personalities.some((item) => item.id === "glutton" && item.name === "食いしん坊" && item.stats.strength === 1), "glutton personality is missing");
assert(window.HD_DATA.personalities.some((item) => item.id === "lazy" && item.name === "なまけもの"), "lazy personality is missing");
assert(window.HD_DATA.personalities.every((item) => Object.values(item.stats).reduce((sum, value) => sum + value, 0) === 1), "personality starting-stat budget changed");
assert(window.HD_DATA.jobs.length === 15, "job roster must contain 15 jobs");
assert(window.HD_DATA.equipment.filter((item) => item.equipmentArchetype).length >= 2000, "generated equipment does not have strong archetype variance");
assert(new Set(window.HD_DATA.equipment.map((item) => item.equipmentArchetype).filter(Boolean)).size === 6, "equipment archetype variety changed");
const archetypedEquipment = window.HD_DATA.equipment.filter((item) => item.equipmentArchetype);
assert(archetypedEquipment.filter((item) => Object.values(item.resistances || {}).some((value) => value !== "immune" && Number(value) < 0)).length >= 1700, "negative equipment resistances are not widespread enough");
assert(archetypedEquipment.filter((item) => Object.values(item.resistances || {}).some((value) => value !== "immune" && Number(value) <= -2)).length >= 800, "severe equipment weaknesses are too rare");
assert(window.HD_DATA.attributes.every((attribute) => window.HD_DATA.equipment.filter((item) => item.resistances?.[attribute] === "immune").length >= 18), "an attribute lacks enough immunity equipment to cover build weaknesses");
assert(mainSource.includes('if (a === "immune" || b === "immune") return "immune"'), "immunity does not override combined negative resistance");
const fixedArtifactSupports = window.HD_DATA.equipment.filter((item) => item.attributePuzzleSupport);
assert(fixedArtifactSupports.length === 39, "fixed artifact attribute-puzzle support count changed");
assert(window.HD_DATA.attributes.every((attribute) => fixedArtifactSupports.filter((item) => item.resistances?.[attribute] === "immune").length >= 2), "fixed artifacts do not cover every attribute with immunity");
assert(fixedArtifactSupports.filter((item) => item.artifact.tier === "cheat").every((item) => window.HD_DATA.attributes.every((attribute) => item.resistances[attribute] === "immune" || Number(item.resistances[attribute]) >= 2)), "cheat artifacts lack the all-attribute resistance foundation");
assert(window.HD_DATA.equipmentSets.length === 25 && window.HD_DATA.equipmentSets.every((set) => set.itemIds.length === 4 && set.bonuses.map((bonus) => bonus.pieces).join(",") === "2,3,4"), "equipment set catalog is missing or malformed");
assert(window.HD_DATA.equipmentSets.every((set) => set.itemIds.every((id) => window.HD_DATA.equipment.find((item) => item.id === id)?.setId === set.id)), "equipment set membership is incomplete");
assert(mainSource.includes("function applyEquipmentSetBonuses") && mainSource.includes("stats.activeEquipmentSets"), "equipment set bonuses are not applied to player stats");
assert(styleSource.includes(".equipment-set-card") && styleSource.includes(".equipment-set-label"), "equipment set UI styling is missing");
assert(mainSource.includes("BEGINNER_COURSE_LESSONS") && mainSource.includes("function offerBeginnerCourse") && mainSource.includes("function showBeginnerCourseLesson"), "optional first-guild beginner course is missing");
assert(mainSource.includes("モンスターの心") && mainSource.includes("function grantMonsterHeart") && mainSource.includes("function enhanceEquipmentWithHeart"), "monster-heart research reward or home enhancement is missing");
assert(mainSource.includes("equipmentEnhancement(itemId).level > 0") && mainSource.includes("この装備は心強化済み") && mainSource.includes("record.level = 1"), "equipment can receive more than one monster-heart enhancement");
assert(mainSource.includes("monsterHeartPower") && mainSource.includes("threatScore") && mainSource.includes("attackAttributeValues"), "monster hearts do not scale with threat or grant attribute values");
assert(mainSource.includes("state.adventurer.guildPoints += 1") && mainSource.includes("修了報酬として1GP"), "beginner course completion does not award exactly one guild point");
assert(mainSource.includes('const START_GUIDANCE = "まずはギルドにいけ。') && mainSource.includes("saved.log.unshift(START_GUIDANCE)") && mainSource.includes("log(START_GUIDANCE)"), "new and migrated games do not direct the player to the guild");
assert(window.HD_DATA.jobs.some((job) => job.id === "flower_tamer" && job.skill.tag === "flower_command"), "flower tamer job is missing");
assert(window.HD_DATA.jobs.some((job) => job.id === "capoeirista" && job.skill.tag === "capoeira_stance" && job.skill.power >= 1.8), "capoeira job is missing or its kick is too weak");
const ninjaJob = window.HD_DATA.jobs.find((job) => job.id === "ninja" && job.name === "忍者");
assert(ninjaJob?.acceleration === 14 && ninjaJob.accelerationGrowthEvery === 6 && ninjaJob.stats.speed === 8 && ninjaJob.rangedRange === 5, "ninja strongest-class profile is invalid");
const handymanJob = window.HD_DATA.jobs.find((job) => job.id === "handyman" && job.name === "便利屋");
assert(handymanJob?.acceleration === 3 && handymanJob.accelerationGrowthEvery === 12, "handyman acceleration balance is invalid");
const finalBoss = window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox");
assert(finalBoss?.hp === 160000 && finalBoss.attack === 108 && finalBoss.defense === 33 && finalBoss.dangerous?.power === 255, "final boss dedicated stats received a generic multiplier");
assert(window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox")?.acceleration === 48, "final boss acceleration balance is invalid");
assert(window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox")?.summon?.every === 3, "final boss summon frequency is invalid");
assert(window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox")?.elixirAttrition?.every === 2
  && window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox")?.elixirAttrition?.ratio === 0.05,
"final boss unavoidable existence erosion is invalid");
assert(window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox")?.automaticSpecialAttack === false
  && mainSource.includes('data.automaticSpecialAttack !== false'),
"final boss still receives an undocumented automatic special attack");
assert(JSON.stringify(window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox")?.weaknesses) === JSON.stringify(["light"]), "final boss unique weakness is not light");
assert(mainSource.includes("index * 7 + nativeFloor"), "enemy attack attribute pool does not traverse all fifteen attributes");
assert(mainSource.includes("selected = pool[(previousIndex + 1) % pool.length]"), "enemy attack attribute selection does not round-robin through its full pool");
assert(mainSource.includes('guardian.id !== "dungeon_lord_nox"'), "final boss still receives the generic floor-guardian stat multiplier");
assert(mainSource.includes("if (floor.floor === MAX_FLOOR) return"), "a random floor anomaly can still alter the final boss dedicated stats");
const deepUniquePowerUps = window.HD_DATA.monsters.filter((monster) => monster.unique && !monster.arenaOnly && monster.id !== "dungeon_lord_nox" && Math.min(...(monster.floors || [0])) >= 61);
assert(deepUniquePowerUps.length > 0 && deepUniquePowerUps.every((monster) => Number(monster.deepUniquePower) >= 1.13), "deep unique strengthening is missing");
assert(indexSource.includes('id="recoveryMedicineButton"') && mainSource.includes('id: "recovery_medicine"') && mainSource.includes("function exchangeRecoveryMedicine") && mainSource.includes("function useRecoveryMedicine"), "recovery medicine acquisition or dungeon use is missing");
assert(mainSource.includes('name: "エリクサー", guildCost: 320, junkTokenCost: 7200, healRatio: 1, weight: 8') && mainSource.includes("getItemCount(RECOVERY_MEDICINE.id) * RECOVERY_MEDICINE.weight"), "elixir weight or full-heal handling is invalid");
assert(mainSource.includes('return source === "guild" ? RECOVERY_MEDICINE.guildCost : RECOVERY_MEDICINE.junkTokenCost')
  && !mainSource.includes("RECOVERY_MEDICINE_SALE_CHANCE")
  && !mainSource.includes("recoveryMedicineSale")
  && !mainSource.includes("エリクサー半額セールが始まった"), "elixir sale still exists");
assert(mainSource.includes('junkDealerTier === "ultra" ? 7200 : material?.junkDealerTier === "super" ? 1440 : 540')
  && mainSource.includes("上位加工素材540札、超レア1,440札、ウルトラレア7,200札"),
"junk-dealer exchange prices are not exactly twelve times their original values");
assert(mainSource.includes('id="retireClearedAdventurerButton"') && mainSource.includes("function retireClearedAdventurer") && mainSource.includes('title: "迷宮踏破者"'), "cleared adventurer retirement is missing");
const elixirSiegeUniques = [80, 85, 90, 95].map((floor) => window.HD_DATA.monsters.find((monster) => monster.id === `abyss_unique_${floor}`));
assert(elixirSiegeUniques.every((monster) => monster?.elixirAttrition?.recommended >= 2) && mainSource.includes("enemy.elixirAttrition && enemy.turns % enemy.elixirAttrition.every === 0"), "late-game elixir attrition uniques are missing");
const finalBossSummon = window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox")?.summon;
assert(finalBossSummon?.pool === "undefeated_deep_unique" && finalBossSummon.every === 3 && finalBossSummon.maxTotal === 8, "final boss unique-memory summon profile is invalid");
assert(mainSource.includes('summon.pool === "undefeated_deep_unique"') && mainSource.includes("!state.meta.uniqueKills[monster.id]"), "defeated deep uniques are not removed from the final boss summon pool");
assert(mainSource.includes("function canSpawnDungeonUnique")
  && (mainSource.match(/canSpawnDungeonUnique\(/g) || []).length >= 8
  && dungeonGeneratorSource.includes("availableTickets"),
"defeated or duplicate dungeon uniques are not excluded from every spawn route");
assert(mainSource.includes("markResearch(enemy.id, MAX_RESEARCH_LEVEL, { force: true })"), "unique defeat does not immediately complete research");
assert(window.HD_DATA.equipment.find((item) => item.id === "rusty_knife").jobs.includes("ninja") && window.HD_DATA.equipment.find((item) => item.id === "cloth").jobs.includes("ninja"), "ninja cannot use starter equipment");
const guildWeaponCosts = window.HD_DATA.equipment.filter((item) => item.slot === "weapon" && item.guildCost).map((item) => item.guildCost).sort((a, b) => a - b);
const lateGameEquipment = window.HD_DATA.equipment.filter((item) => item.lateGamePower);
assert(lateGameEquipment.length === 831 && [1, 2, 3].every((power) => lateGameEquipment.some((item) => item.lateGamePower === power)), "late-game equipment strengthening coverage is invalid");
assert(!window.HD_DATA.equipment.some((item) => item.lateGamePower && (item.starterOnly || ["joke", "trash"].includes(item.artifact?.tier))), "starter or intentionally weak artifact received late-game strengthening");
assert(JSON.stringify(guildWeaponCosts) === JSON.stringify([200, 264, 328, 360, 392, 440, 456, 520, 720]),
"guild exchange weapon costs are not exactly eight times their base prices");
assert(window.HD_DATA.equipment.filter((item) => item.guildCost).length === 40
  && window.HD_DATA.equipment.filter((item) => item.guildCost).every((item) => item.guildCost >= 200 && item.guildCost % 8 === 0),
"eight-times guild reward pricing does not cover every equipment prize");
assert(["iron_sword", "crafted_beast_tool", "carapace_armor", "ward_fire_stride"].every((id) => window.HD_DATA.equipment.find((item) => item.id === id)?.jobs.includes("ninja")), "ninja regular blade/tool/leg/foot equipment compatibility is incomplete");
assert(window.HD_DATA.floors.slice(0, 99).every((floor) => floor.stairRange[0] === 4 && floor.stairRange[1] === 6), "normal stair count was not increased to 4-6");
assert(window.HD_DATA.floors.find((floor) => floor.floor === 50).uniqueChance >= 0.52
  && window.HD_DATA.floors.find((floor) => floor.floor === 80).uniqueChance >= 0.83
  && window.HD_DATA.floors.find((floor) => floor.floor === 99).uniqueChance === 0.93, "deep unique monster appearance curve is not harsh enough");
assert(mainSource.includes("deepUniqueReinforcementChance") && mainSource.includes("Math.min(0.42"), "deep unique reinforcement chance is missing");
assert(styleSource.includes("clamp(105px, 15svh, 132px)") && styleSource.includes("min-height: 105px") && styleSource.includes("padding: 6px 8px"), "expanded dungeon log balance is missing");
assert(window.HD_DATA.junkItems.length === 170, "junk catalog count changed");
assert(window.HD_DATA.junkItems.filter((item) => !item.junkTier).length === 135, "normal junk catalog must be tripled to 135");
assert(window.HD_DATA.junkItems.filter((item) => item.junkTier === "luxury").length === 15, "luxury junk catalog must be tripled to 15");
assert(window.HD_DATA.junkItems.filter((item) => item.junkTier === "ultra_luxury").length === 15, "ultra-luxury junk catalog must be tripled to 15");
assert(window.HD_DATA.junkItems.filter((item) => item.junkTier === "legend").length === 5, "legend junk tier is missing");
assert(new Set(window.HD_DATA.junkItems.map((item) => item.name)).size === window.HD_DATA.junkItems.length, "junk names are duplicated");
assert(new Set(window.HD_DATA.monsters.map((monster) => monster.id)).size === window.HD_DATA.monsters.length, "monster id collision");
assert(new Set(window.HD_DATA.monsters.filter((monster) => monster.unique).map((monster) => monster.name)).size === 488, "unique monster name collision");
const uniqueNameStyles = window.HD_DATA.monsters.filter((monster) => monster.unique).map((monster) => monster.name);
assert(!uniqueNameStyles.some((name) => name.includes("迷宮異名録")), "unique monster registry-style names remain overused");
assert(uniqueNameStyles.filter((name) => ["％＝", "≠？"].includes(name)).length === 2,
"symbol-only unique names must remain exceptional");
assert(uniqueNameStyles.filter((name) => ["さわやかなミルクオレ", "午後三時のクリームパン"].includes(name)).length === 2,
"mundane outlier unique names must remain exceptional");
assert(uniqueNameStyles.includes("機械仕掛けの脱獄王"), "story-like outlier unique name is missing");
assert(uniqueNameStyles.includes("川の流れのようにアサハカ"), "absurd outlier unique name is missing");
assert(uniqueNameStyles.includes("麒麟児印のニュースター・メテオ"), "showman-like outlier unique name is missing");
const curatedOutlierNames = [
  "だいたい無敵の田中", "倒すと縁起が悪い鳥", "うすしお味の破壊神", "たぶん佐々木",
  "無事故無違反の暴走王", "返品不可の救世主", "株式会社あの世・迷宮支店長", "説明書をなくした神様",
  "有給休暇中の死神", "ご家庭用ブラックホール", "第二形態から来た新人", "※画像はイメージです",
];
assert(curatedOutlierNames.every((name) => uniqueNameStyles.includes(name)), "curated outlier unique names are missing");
const expandedOutlierNames = [
  "湯上がり決戦兵器ポカポカ", "お会計は世界の終わりに", "実家が太いデスワーム", "昨日届いた最後通告",
  "午前二時だけ正義の味方", "おばあちゃんの最終定理", "こちら側のどなたか", "三割引のラストエンペラー",
  "まだ温かい石田", "先着一名様の永遠", "うしろめたい太陽", "月刊ムーンサルト八月号",
  "おかわり自由の飢餓", "全自動ぬか喜び製造機", "電池別売りの超新星", "低気圧由来のカリスマ",
  "既読をつけない預言者", "迷子センターのラスボス", "生まれたての古代兵器", "予約の取れない亡霊",
  "だれより普通の異常者", "世界で二番目に鋭い豆腐", "概念としての鈴木", "夕方には帰る魔王",
  "よく振ってから絶望", "ただいま混み合っております", "賞味期限は昨日まで", "安全第一デストロイヤー",
  "お近くの終末", "来週から本気を出す龍",
];
assert(expandedOutlierNames.every((name) => uniqueNameStyles.includes(name)), "expanded outlier unique names are missing");
const outlierNameCount = curatedOutlierNames.length + expandedOutlierNames.length + 7;
const additionalComedyUniqueNames = window.HD_DATA.additionalComedyUniqueNames || [];
assert(additionalComedyUniqueNames.length === 98 && new Set(additionalComedyUniqueNames).size === 98
  && additionalComedyUniqueNames.every((name) => uniqueNameStyles.includes(name)),
"additional comedy unique names are missing or duplicated");
assert(additionalComedyUniqueNames.filter((name) => /[【】［］《》★→←＠※／＋≒…㊙￥]/.test(name)).length >= 25,
"symbol styling is not varied across comedy unique names");
const tripledOutlierNameCount = outlierNameCount + additionalComedyUniqueNames.length;
assert(tripledOutlierNameCount === 147 && tripledOutlierNameCount / uniqueNameStyles.length >= 0.29 && tripledOutlierNameCount / uniqueNameStyles.length <= 0.31,
"comedy unique-name ratio is outside the intended thirty-percent band");
assert(window.HD_DATA.monsters.filter((monster) => monster.unique && monster.name === monster.baseName).length >= 340,
"generic epithet templates still overwrite authored unique names");
assert(window.HD_DATA.monsters.filter((monster) => monster.migratedFromArenaRank && monster.singularTrait).every((monster) => monster.baseName === monster.singularTrait.name),
"singular migrated uniques do not use their individual trait as their authored name");
const individuallyAuthoredUniqueNames = window.HD_DATA.individuallyAuthoredUniqueNames;
assert(individuallyAuthoredUniqueNames instanceof Map && individuallyAuthoredUniqueNames.size === 270
  && new Set(individuallyAuthoredUniqueNames.values()).size === 270,
"individually authored unique-name map is incomplete or duplicated");
assert(window.HD_DATA.monsters.filter((monster) => monster.dungeonExpansion && individuallyAuthoredUniqueNames.has(monster.id)).length === 118
  && window.HD_DATA.monsters.filter((monster) => monster.migratedFromArenaRank && individuallyAuthoredUniqueNames.has(monster.id)).length === 80
  && window.HD_DATA.monsters.filter((monster) => monster.arenaOnly && individuallyAuthoredUniqueNames.has(monster.id)).length === 72,
"individually authored unique names do not cover every remaining generated-name offender");
const renamedGeneratedUniques = window.HD_DATA.monsters.filter((monster) => monster.unique
  && (monster.dungeonExpansion || monster.migratedFromArenaRank || monster.arenaOnly));
assert(renamedGeneratedUniques.every((monster) => !monster.dangerous?.telegraph || monster.dangerous.telegraph.includes(monster.name)),
"a renamed unique still uses an obsolete name in its danger telegraph");
assert(mainSource.includes("enemy.name = canonicalMonster.name")
  && mainSource.includes("enemy.baseName = canonicalMonster.baseName || canonicalMonster.name")
  && mainSource.includes("enemy.dangerous.telegraph = canonicalMonster.dangerous.telegraph")
  && mainSource.includes("enemy.uniqueTemperament = canonicalMonster.uniqueTemperament")
  && mainSource.includes("enemy.dialogueNameMatched = Boolean(canonicalMonster.dialogueNameMatched)"),
"saved enemy display names are not synchronized from current monster data");
assert(window.HD_DATA.monsters.every((monster) => window.HD_DATA.attributes.includes(monster.attackAttribute)), "monster has an invalid attack attribute");
assert(window.HD_DATA.monsters.every((monster) => !monster.dangerous || window.HD_DATA.attributes.includes(monster.dangerous.attribute)), "monster has an invalid dangerous attribute");
const materialIds = new Set(window.HD_DATA.materials.map((material) => material.id));
assert(window.HD_DATA.monsters.every((monster) => monster.loot.every((rule) => materialIds.has(rule.material))), "monster references an invalid material");
const monsterIds = new Set(window.HD_DATA.monsters.map((monster) => monster.id));
assert(window.HD_DATA.floors.every((floor) => floor.monsterPool.every((id) => monsterIds.has(id))), "floor references an invalid regular monster");
assert(window.HD_DATA.floors.every((floor) => floor.uniques.every((id) => monsterIds.has(id))), "floor references an invalid unique monster");
assert(window.HD_DATA.monsters.every((monster) => (
  [1, 2, 3, 4, 5].every((level) => typeof monster.research[level] === "string")
)), "a monster is missing a research stage");
const uniqueMonsters = window.HD_DATA.monsters.filter((monster) => monster.unique);
const generalMonsters = window.HD_DATA.monsters.filter((monster) => !monster.unique);
const rapidlyRegeneratingUniques = uniqueMonsters.filter((monster) => monster.rapidRegeneration);
assert(rapidlyRegeneratingUniques.length >= 100 && rapidlyRegeneratingUniques.every((monster) => monster.rapidRegeneration.amount > 0 && monster.rapidRegeneration.rate <= 0.14), "strong unique rapid regeneration is missing or invalid");
assert(rapidlyRegeneratingUniques.every((monster) => monster.rapidRegeneration.amount === Math.ceil(monster.hp * monster.rapidRegeneration.rate)), "rapid-regeneration display amount is stale after final HP scaling");
assert(window.HD_DATA.monsters.every((monster) => (monster.weaknesses || []).every((attribute) => {
  const resistance = monster.resistances?.[attribute];
  return resistance !== "immune" && Number(resistance || 0) <= 0;
})), "a monster is simultaneously weak and positively resistant to the same attribute");
assert(window.HD_DATA.monsters.find((monster) => monster.id === "white_fang_marta")?.speciesId === "vermin"
  && window.HD_DATA.monsters.find((monster) => monster.id === "thunder_emperor_barg")?.speciesId === "vermin",
"hand-authored beast uniques still receive contradictory fallback species");
assert(window.HD_DATA.monsters.find((monster) => monster.id === "white_fang_marta")?.loot.some((rule) => rule.material === "fine_pelt")
  && window.HD_DATA.monsters.find((monster) => monster.id === "thunder_emperor_barg")?.loot.some((rule) => rule.material === "unbroken_horn"),
"hand-authored beast unique loot was overwritten by generic species loot");
assert(window.HD_DATA.equipment.every((item) => item.attributeAttack === (item.attackAttributes?.[0] || null)), "equipment attackAttributes and legacy attributeAttack are out of sync");
const obtainableMaterialIds = new Set([
  ...window.HD_DATA.monsters.flatMap((monster) => (monster.loot || []).map((rule) => rule.material)),
  ...window.HD_DATA.materials.filter((material) => material.junkDealerTier).map((material) => material.id),
]);
const unreachableRecipeMaterials = [...new Set(window.HD_DATA.equipment.flatMap((item) => Object.keys(item.recipe || {})))]
  .filter((materialId) => !obtainableMaterialIds.has(materialId));
assert(unreachableRecipeMaterials.length === 0, `recipe materials are unreachable: ${unreachableRecipeMaterials.join(",")}`);
assert(window.HD_DATA.equipment.filter((item) => item.recipe && !item.artifact)
  .every((item) => Object.keys(item.recipe).some((materialId) => obtainableMaterialIds.has(materialId))),
"ordinary recipe equipment has no shop-unlock material route");
const trueDragons = window.HD_DATA.monsters.filter((monster) => monster.speciesId === "dragon");
assert(trueDragons.length >= 7 && trueDragons.every((monster) => monster.dragonBreath?.power > monster.attack && /ブレス|竜息/.test(monster.dangerous?.name)), "dragon breath progression is missing");
assert(trueDragons.filter((monster) => monster.colorTier === "rainbow").every((monster) => monster.dragonBreath.trials === 3), "rainbow dragons do not use triple breath attacks");
const hostileAngels = window.HD_DATA.monsters.filter((monster) => monster.speciesId === "angel");
assert(hostileAngels.length >= 7 && hostileAngels.every((monster) => monster.divineInvulnerability?.charges >= 1), "enemy-only angel invulnerability is missing");
const hostileDemons = window.HD_DATA.monsters.filter((monster) => monster.speciesId === "demon");
assert(hostileDemons.length >= 7 && hostileDemons.every((monster) => monster.demonicWard?.tier >= 3), "enemy demon elemental wards are missing");
const goldThiefMonsters = window.HD_DATA.monsters.filter((monster) => monster.specialAttack === "gold_steal");
assert(goldThiefMonsters.length === 8 && goldThiefMonsters.every((monster) => monster.rareSpawn && monster.goldTheft?.escapeDistance >= 8), "gold-stealing teleport monster roster is invalid");
assert(!mainSource.includes("Math.min(4, 1 + Math.floor(Math.max(0, arenaSpellSlowed") && !mainSource.includes("const actionCap = enemy.specialAttack"), "enemy action-count cap still exists");
assert(Math.min(...goldThiefMonsters.map((monster) => monster.acceleration)) >= 36 && Math.max(...goldThiefMonsters.map((monster) => monster.acceleration)) >= 59, "gold thieves are not uniformly hyper-fast");
assert(Math.min(...goldThiefMonsters.map((monster) => monster.goldTheft.rate)) === 0.2 && Math.max(...goldThiefMonsters.map((monster) => monster.goldTheft.rate)) === 0.8, "gold thief rates do not span 20% to 80%");
assert(goldThiefMonsters.every((monster) => monster.goldTheft.maxRate === 0.8 && monster.goldTheft.flat == null && monster.goldTheft.max == null), "gold theft is not capped at 80% of current holdings");
assert(window.HD_DATA.floors.every((floor) => !floor.monsterPool.some((id) => goldThiefMonsters.some((monster) => monster.id === id))), "gold thief leaked into the high-density normal pool");
assert(window.HD_DATA.floors.some((floor) => floor.rareMonsterPool?.length) && window.HD_DATA.floors.every((floor) => floor.rareMonsterPool.length <= 1), "rare gold-thief floor pool is invalid");
assert(window.HD_DATA.floors.filter((floor) => floor.rareMonsterPool?.length).every((floor) => floor.rareMonsterChance === 0.7), "gold-thief appearance chance is not 70%");
const harvestRichMonsters = window.HD_DATA.monsters.filter((monster) => monster.rewardProfile?.tag === "harvest-rich");
const experienceRichMonsters = window.HD_DATA.monsters.filter((monster) => monster.rewardProfile?.tag === "exp-rich");
assert(harvestRichMonsters.length >= 12 && harvestRichMonsters.every((monster) => monster.rewardProfile.harvestQuantity >= 2), "harvest-rich monsters are missing or under-rewarded");
assert(experienceRichMonsters.length >= 10 && experienceRichMonsters.every((monster) => monster.rewardProfile.experienceMultiplier >= 2), "experience-rich monsters are missing or under-rewarded");
const arenaMonsters = uniqueMonsters.filter((monster) => monster.arenaOnly);
const dungeonUniques = uniqueMonsters.filter((monster) => !monster.arenaOnly);
const arenaFirstCombatant = arenaMonsters.find((monster) => monster.arenaRank === 1);
const arenaFinalCombatant = arenaMonsters.find((monster) => monster.arenaRank === 100);
assert(arenaFirstCombatant?.hp >= 45 && arenaFirstCombatant.acceleration >= 6 && arenaFinalCombatant?.hp >= 2000 && arenaFinalCombatant.acceleration >= 30, "arena difficulty escalation is missing");
const transferredUniques = dungeonUniques.filter((monster) => Number.isFinite(monster.migratedFromArenaRank));
const expansionUniques = dungeonUniques.filter((monster) => monster.dungeonExpansion);
const summoningUniques = dungeonUniques.filter((monster) => monster.summon);
const peakyDungeonUniques = dungeonUniques.filter((monster) => monster.peakyProfile);
const singularDungeonUniques = dungeonUniques.filter((monster) => monster.singularTrait);
assert(uniqueMonsters.length === 488, "unique monster count changed");
assert(generalMonsters.length === 305, "curated general monster count changed");
const curatedAbyssGenerals = generalMonsters.filter((monster) => /^abyss_f\d+_v\d+$/.test(monster.id));
assert(curatedAbyssGenerals.length === 170, "deep general-monster curation did not remove exactly one hundred redundant variants");
for (let floor = 11; floor <= 100; floor += 1) {
  const expected = floor % 10 === 5 || floor === 100 ? 1 : 2;
  assert(curatedAbyssGenerals.filter((monster) => monster.floors[0] === floor).length === expected, `curated general-monster floor coverage mismatch: B${floor}F`);
}
assert(arenaMonsters.length === 100, "curated arena roster must contain 100 uniques");
assert(peakyDungeonUniques.length === 100 && peakyDungeonUniques.every((monster) => Number.isFinite(monster.migratedFromArenaRank)), "one hundred bland transferred uniques were not rewritten as peaky dungeon monsters");
assert(singularDungeonUniques.length === 50 && singularDungeonUniques.every((monster) => Number.isFinite(monster.migratedFromArenaRank)), "fifty remaining bland dungeon uniques did not receive singular mechanics");
assert(peakyDungeonUniques.length + singularDungeonUniques.length === transferredUniques.length, "a transferred dungeon unique remains mechanically generic");
assert(new Set(singularDungeonUniques.map((monster) => monster.singularTrait.name)).size === 50, "singular dungeon-unique trait names collide");
const singularFingerprints = singularDungeonUniques.map((monster) => {
  const trait = monster.singularTrait;
  return JSON.stringify([trait.specialAttack, trait.dangerEvery, trait.regenerationRate, trait.summonEvery, trait.shieldEvery, trait.shieldCharges, trait.addedWeakness, trait.resistanceAttribute, trait.resistanceTier, trait.hpScale, trait.attackScale, trait.accelerationDelta]);
});
assert(new Set(singularFingerprints).size === 50, "two singular dungeon uniques share the same mechanical fingerprint");
assert(new Set(singularDungeonUniques.map((monster) => monster.specialAttack)).size === 7, "singular dungeon uniques do not cover all supported special actions");
assert(singularDungeonUniques.every((monster) => monster.research[1].includes(monster.singularTrait.name) && monster.weaknesses.includes(monster.singularTrait.addedWeakness)), "singular mechanic is missing from research or weaknesses");
assert(new Set(peakyDungeonUniques.map((monster) => Math.min(9, Math.floor((monster.floors[0] - 11) / 9)))).size === 10, "peaky dungeon-unique rewrites do not span all depth bands");
const expectedPeakyProfiles = ["glass_cannon", "immovable_fortress", "blink_assassin", "elemental_bastion", "doomsday_engine"];
expectedPeakyProfiles.forEach((profile) => assert(peakyDungeonUniques.filter((monster) => monster.peakyProfile === profile).length === 20, `peaky profile count mismatch: ${profile}`));
assert(peakyDungeonUniques.filter((monster) => monster.peakyProfile === "glass_cannon").every((monster) => monster.attack >= monster.peakyBaseline.attack * 1.65 && monster.hp <= monster.peakyBaseline.hp * 0.7), "glass-cannon uniques are not sufficiently extreme");
assert(peakyDungeonUniques.filter((monster) => monster.peakyProfile === "immovable_fortress").every((monster) => monster.hp >= monster.peakyBaseline.hp * 1.55 && monster.defense >= monster.peakyBaseline.defense * 2.2), "fortress uniques are not sufficiently extreme");
assert(peakyDungeonUniques.filter((monster) => monster.peakyProfile === "blink_assassin").every((monster) => monster.acceleration >= monster.peakyBaseline.acceleration + 16 && monster.defense <= monster.peakyBaseline.defense * 0.75), "assassin uniques are not sufficiently extreme");
assert(peakyDungeonUniques.filter((monster) => monster.peakyProfile === "elemental_bastion").every((monster) => monster.resistances[monster.attackAttribute] === 5 || monster.weaknesses.includes(monster.attackAttribute)), "elemental bastion uniques lack extreme elemental protection");
assert(peakyDungeonUniques.filter((monster) => monster.peakyProfile === "doomsday_engine").every((monster) => monster.dangerous.power >= monster.peakyBaseline.danger * 2.2), "doomsday uniques lack extreme telegraphed attacks");
assert(mainSource.includes("currentMonsterIds") && mainSource.includes("delete records[monsterId]"), "removed arena monsters remain in migrated research or heart records");
assert(arenaMonsters.filter((monster) => monster.colorTier === "rainbow").length <= 24, "rainbow arena monsters are too common");
assert(arenaMonsters.every((monster) => typeof monster.speciesGlyph === "string" && [...monster.speciesGlyph].length === 1), "arena species marker is not one character");
assert(window.HD_DATA.monsters.every((monster) => /^[\u3400-\u9fff]$/u.test(monster.speciesGlyph)), "monster species marker is not kanji");
assert(window.HD_DATA.monsters.every((monster) => !/[蟲鱗]/u.test(monster.speciesGlyph)), "monster species marker uses an overly intricate kanji");
assert(window.HD_DATA.monsters.every((monster) => window.HD_DATA.monsters.filter((peer) => peer.speciesId === monster.speciesId).every((peer) => peer.speciesGlyph === monster.speciesGlyph)), "species marker is not consistent");
assert(arenaMonsters.every((monster) => Number.isFinite(monster.arenaMarkerHue) && Number.isFinite(monster.arenaMarkerAccentHue)), "arena marker color is missing");
assert(dungeonUniques.length === 388, "dungeon roster must contain 388 uniques");
assert(transferredUniques.length === 150, "150 arena uniques were not transferred");
assert(expansionUniques.length === 200, "200 dungeon uniques were not added");
assert(summoningUniques.length >= 30 && summoningUniques.length <= 42, "summoning unique population is outside the intended range after singular-trait additions");
assert(summoningUniques.filter((monster) => !monster.singularTrait && monster.id !== "dungeon_lord_nox").every((monster) => monster.summon.every === 6 && monster.summon.maxAlive === 2 && monster.summon.maxTotal === 4), "standard summoning limits are invalid");
assert(summoningUniques.filter((monster) => monster.singularTrait).every((monster) => monster.summon.every >= 4 && monster.summon.maxAlive >= 1 && monster.summon.maxTotal >= monster.summon.maxAlive), "singular summoning limits are invalid");
assert(arenaMonsters.map((monster) => monster.arenaRank).sort((a, b) => a - b).every((rank, index) => rank === index + 1), "arena ranks are not continuous");
assert(window.HD_BOUNTY.nativeFloor(arenaMonsters[0], 100) === 1
  && window.HD_BOUNTY.nativeFloor(arenaMonsters[arenaMonsters.length - 1], 100) === 100,
"arena virtual depth still treats every combatant as B100");
const capoeiraGrowth = window.HD_CHARACTER.levelBonuses(window.HD_DATA, 6, "capoeirista", "gentle");
const swordsmanGrowth = window.HD_CHARACTER.levelBonuses(window.HD_DATA, 6, "swordsman", "gentle");
assert(JSON.stringify(capoeiraGrowth) !== JSON.stringify(swordsmanGrowth) && capoeiraGrowth.speed >= 2, "capoeirista still falls back to swordsman growth");
assert(new Set(arenaMonsters.map((monster) => Math.floor((monster.formerArenaRank - 1) * 10 / 192))).size === 10, "arena curation did not preserve all ten strength bands");
assert(transferredUniques.every((monster) => monster.migratedFromArenaRank >= 193 && monster.migratedFromArenaRank <= 342), "transferred arena rank is invalid");
assert(dungeonUniques.every((monster) => monster.floors?.length && monster.floors.every((floor) => floor >= 1 && floor <= 100)), "dungeon unique has no valid floor");
assert(window.HD_DATA.floors.every((floor) => floor.uniques.every((id) => dungeonUniques.some((monster) => monster.id === id))), "floor contains a non-dungeon unique");
assert(Math.max(...window.HD_DATA.floors.map((floor) => floor.uniques.length)) < 120, "weighted unique pool grew unexpectedly large");
assert(window.HD_UNIQUE_DIALOGUE.count === uniqueMonsters.length, "unique dialogue count mismatch");
const displayRenamedUniques = uniqueMonsters.filter((monster) => (
  monster.id !== "dungeon_lord_nox" && monster.name !== monster.baseName
));
assert(displayRenamedUniques.length === 147 && displayRenamedUniques.every((monster) => (
  monster.dialogueNameMatched
  && [monster.dialogueDesire, monster.dialogueKeepsake, monster.dialogueSecret].every((text) => text?.includes(monster.name))
)), "comedy-name uniques did not receive name-matched identities and research notes");
assert(uniqueMonsters.every((monster) => window.HD_UNIQUE_DIALOGUE.variants(monster.id, "encounter")
  .some((line) => line.includes(monster.name))),
"a unique monster never states its current display name on encounter");
displayRenamedUniques.forEach((monster) => {
  const contextLines = window.HD_UNIQUE_DIALOGUE.contexts.map((context) => window.HD_UNIQUE_DIALOGUE.variants(monster.id, context));
  assert(contextLines.every((lines) => lines.some((line) => line.includes(monster.name))), `${monster.name} has a dialogue context detached from its display name`);
  const lines = contextLines.flat();
  const staleNames = [monster.baseName, monster.coreName]
    .filter((name) => name && !monster.name.includes(name));
  assert(staleNames.every((name) => lines.every((line) => !line.includes(name))), `${monster.name} still speaks under an obsolete name`);
});
const dialogueLines = new Set();
uniqueMonsters.forEach((monster) => {
  window.HD_UNIQUE_DIALOGUE.contexts.forEach((context) => {
    const variants = window.HD_UNIQUE_DIALOGUE.variants(monster.id, context);
    assert(variants.length === 4, `${monster.id}/${context} dialogue coverage mismatch`);
    assert(new Set(variants).size === variants.length, `${monster.id}/${context} dialogue repeats internally`);
    variants.forEach((line) => {
      assert(!dialogueLines.has(line), `global dialogue collision: ${line}`);
      dialogueLines.add(line);
    });
  });
});
assert(window.HD_DATA.monsters.every((monster) => !monster.speech), "dialogue was copied into monster records");
assert(window.HD_DATA.equipment.filter((item) => item.risque).length >= 6, "risque equipment catalog is too small");
assert(window.HD_ECONOMY.equipmentSellPrice(window.HD_DATA.equipment.find((item) => item.id === "iron_sword")) > 0, "equipment sell price is missing");
const purchasePriceProbe = window.HD_DATA.equipment.find((item) => item.id === "iron_sword");
assert(window.HD_ECONOMY.shopPurchasePrice(purchasePriceProbe) === window.HD_ECONOMY.shopItemPrice(purchasePriceProbe) * 20,
"shop equipment purchase price is not exactly twenty times its base value");
assert(window.HD_ECONOMY.equipmentSellPrice(purchasePriceProbe) < window.HD_ECONOMY.shopItemPrice(purchasePriceProbe),
"purchase-only multiplier leaked into equipment buyback pricing");
assert(mainSource.includes("return ECONOMY.shopPurchasePrice(item)"), "shop UI or purchase handling bypasses the purchase-only price");
const bountyFormulaTarget = window.HD_DATA.monsters.find((monster) => monster.id === "red_garm");
const expectedFirstBounty = Math.round(100 + bountyFormulaTarget.hp * 2 + bountyFormulaTarget.attack * 12 + bountyFormulaTarget.defense * 10 + Number(bountyFormulaTarget.acceleration || 0) * 5);
assert(window.HD_BOUNTY.reward(bountyFormulaTarget) === expectedFirstBounty, "first bounty reward formula is invalid");
assert(window.HD_BOUNTY.reward(bountyFormulaTarget, 1) === expectedFirstBounty && !("REPEAT_REWARD_RATE" in window.HD_BOUNTY), "obsolete repeat-bounty discount still exists");
assert(mainSource.includes("FIXED_ARTIFACT_CHEST_CHANCE = 0.01") && mainSource.includes("VAULT_FIXED_ARTIFACT_CHANCE = 0.05"), "fixed artifact chest rates were not raised");

function generatorEnemy(id, pos) {
  const source = window.HD_DATA.monsters.find((monster) => monster.id === id);
  return { ...clone(source), ...pos, maxHp: source.hp, hp: source.hp, alive: true };
}
assert(window.HD_DUNGEON.alwaysLitRoomRatio === 0.25, "always-lit room ratio changed");
assert(window.HD_DUNGEON.crampedRoomInterval === 8, "cramped rooms are still too frequent");
assert(window.HD_DUNGEON.largeRoomCandidateChance === 0.36, "large-room mixing chance changed");
assert(window.HD_DUNGEON.specialRoomRates.madness === 0.005 && window.HD_DUNGEON.specialRoomRates.treasureVault === 0.008 && window.HD_DUNGEON.specialRoomRates.thrill === 0.01, "rare-room generation rates changed");
assert(window.HD_DUNGEON.minNormalRoomCount === 9 && window.HD_DUNGEON.corridorBayThreshold === 24, "dungeon room/corridor safety targets changed");
assert(window.HD_ARTIFACTS.dropChance(1) === window.HD_ARTIFACTS.BASE_DROP_CHANCE, "shallow random-artifact rate is invalid");
assert(window.HD_ARTIFACTS.dropChance(100) === window.HD_ARTIFACTS.MAX_DROP_CHANCE, "deep random-artifact rate is invalid");
assert(window.HD_ARTIFACTS.qualityIndex(1, () => 0) === 0 && window.HD_ARTIFACTS.qualityIndex(100, () => 0.999) === 4, "random-artifact quality does not improve with depth");
const generatedArtifact = window.HD_ARTIFACTS.generate({
  depth: 100,
  serial: 1,
  attributes: window.HD_DATA.attributes,
  jobs: window.HD_DATA.jobs.map((job) => job.id),
  rng: () => 0.5,
});
assert(generatedArtifact.id === "random_artifact_0001" && generatedArtifact.artifact.random, "random artifact generation failed");
assert(window.HD_ARTIFACTS.isValid(generatedArtifact, window.HD_DATA.attributes, window.HD_DATA.jobs.map((job) => job.id)), "generated artifact failed schema validation");
let artifactSeed = 0x13572468;
const artifactRng = () => {
  artifactSeed = (artifactSeed * 1664525 + 1013904223) >>> 0;
  return artifactSeed / 4294967296;
};
let shallowArtifactQuality = 0;
let deepArtifactQuality = 0;
for (let index = 0; index < 500; index += 1) {
  const shallow = window.HD_ARTIFACTS.generate({ depth: 1, serial: 10 + index, attributes: window.HD_DATA.attributes, jobs: window.HD_DATA.jobs.map((job) => job.id), rng: artifactRng });
  const deep = window.HD_ARTIFACTS.generate({ depth: 100, serial: 1000 + index, attributes: window.HD_DATA.attributes, jobs: window.HD_DATA.jobs.map((job) => job.id), rng: artifactRng });
  assert(window.HD_ARTIFACTS.isValid(shallow, window.HD_DATA.attributes, window.HD_DATA.jobs.map((job) => job.id)), "shallow random artifact exceeded its saved schema");
  assert(window.HD_ARTIFACTS.isValid(deep, window.HD_DATA.attributes, window.HD_DATA.jobs.map((job) => job.id)), "deep random artifact exceeded its saved schema");
  assert(shallow.slot === "weapon" || shallow.attackAttributes.length <= 1, "non-weapon random artifact gained too many attack attributes");
  assert(deep.slot === "weapon" || deep.attackAttributes.length <= 1, "deep non-weapon random artifact gained too many attack attributes");
  shallowArtifactQuality += shallow.artifact.quality;
  deepArtifactQuality += deep.artifact.quality;
}
assert(deepArtifactQuality > shallowArtifactQuality + 1000, "deep floors do not materially improve random-artifact quality");
assert(window.HD_DUNGEON.layouts.every((layout) => layout.spacing >= 1), "a layout still places rooms too tightly for longer corridors");
assert(window.HD_DUNGEON.layouts.filter((layout) => layout.id !== "warrens").every((layout) => layout.spacing >= 2), "non-warren corridors were not lengthened");
window.HD_DUNGEON.layouts.forEach((layout) => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const requestedSize = [36, 48, 60][attempt % 3];
    const dungeon = window.HD_DUNGEON.generate({ size: requestedSize, floor: window.HD_DATA.floors[0], createEnemy: generatorEnemy, layoutId: layout.id });
    assert(!(dungeon.layout.id === "great_halls" && requestedSize < 48) && !(dungeon.layout.id === "warrens" && requestedSize > 52), `incompatible layout survived selection: ${layout.id}/${requestedSize}`);
    assert(dungeon.size === requestedSize && dungeon.map.length === requestedSize && dungeon.map.every((row) => row.length === requestedSize), `variable map size failed: ${layout.id}/${requestedSize}`);
    assert(dungeon.map[0].every((tile) => tile === "wall") && dungeon.map[dungeon.map.length - 1].every((tile) => tile === "wall") && dungeon.map.every((row) => row[0] === "wall" && row[row.length - 1] === "wall"), `outer boundary is not sealed: ${layout.id}/${requestedSize}`);
    assert(window.HD_DUNGEON.isReachableDungeon(dungeon), `unreachable layout: ${layout.id}`);
    assert(dungeon.stairs.length >= 4 && dungeon.stairs.length <= 6, `stair count outside 4-6: ${layout.id}`);
    assert(dungeon.rooms.length >= 9, `normal floor has fewer than nine rooms: ${layout.id}/${requestedSize}`);
    assert(new Set(dungeon.stairs.map((stairs) => `${stairs.x},${stairs.y}`)).size === dungeon.stairs.length, `duplicate stairs: ${layout.id}`);
    assert(dungeon.rooms.every((room) => typeof room.alwaysLit === "boolean"), `room lighting flag is missing: ${layout.id}`);
    assert(dungeon.rooms.filter((room) => room.alwaysLit).length === Math.max(1, Math.round(dungeon.rooms.length * 0.25)), `always-lit room ratio is invalid: ${layout.id}`);
    assert(dungeon.rooms.some((room) => room.cramped && Math.min(room.w, room.h) <= 2 && Math.max(room.w, room.h) >= 3), `extremely narrow room is missing: ${layout.id}`);
    const initialDensity = dungeon.initialEnemyCount / dungeon.walkableTileCount;
    assert(initialDensity >= 0.03 && initialDensity <= 0.065, `shallow initial enemy density escaped its band: ${layout.id}/${requestedSize}/${initialDensity}`);
    assert(!dungeon.enemies.some((enemy) => window.HD_DUNGEON.roomContains(dungeon.rooms[0], enemy)), `start room contains an initial enemy: ${layout.id}/${requestedSize}`);
    dungeon.rooms.forEach((room) => {
      const occupants = dungeon.enemies.filter((enemy) => window.HD_DUNGEON.roomContains(room, enemy));
      const localLimit = room.cramped || Math.min(room.w, room.h) <= 1 ? 1 : Math.max(1, Math.ceil((room.w * room.h) / 10));
      assert(occupants.length <= localLimit, `room enemy capacity exceeded: ${layout.id}/${requestedSize}/${room.w}x${room.h}`);
      window.HD_DUNGEON.roomEntryTiles(dungeon, room).forEach((entry) => {
        assert(occupants.filter((enemy) => Math.max(Math.abs(enemy.x - entry.x), Math.abs(enemy.y - entry.y)) <= 3).length <= 2, `room entrance is overcrowded: ${layout.id}/${requestedSize}`);
      });
    });
    const alwaysLitTiles = window.HD_DUNGEON.alwaysLitTileKeys(dungeon);
    dungeon.rooms.filter((room) => room.alwaysLit).forEach((room) => {
      for (let y = room.y; y < room.y + room.h; y += 1) {
        for (let x = room.x; x < room.x + room.w; x += 1) assert(alwaysLitTiles.has(`${x},${y}`), `always-lit room tile is dark: ${layout.id}/${x},${y}`);
      }
      const firstSteps = [];
      for (let x = room.x; x < room.x + room.w; x += 1) firstSteps.push([x, room.y - 1], [x, room.y + room.h]);
      for (let y = room.y; y < room.y + room.h; y += 1) firstSteps.push([room.x - 1, y], [room.x + room.w, y]);
      firstSteps.forEach(([x, y]) => {
        const insideAnotherRoom = dungeon.rooms.some((candidate) => window.HD_DUNGEON.roomContains(candidate, { x, y }));
        if (dungeon.map[y]?.[x] === "floor" && !insideAnotherRoom) assert(alwaysLitTiles.has(`${x},${y}`), `first corridor tile is dark: ${layout.id}/${x},${y}`);
      });
    });
  }
});

[window.HD_DATA.floors[49], window.HD_DATA.floors[99]].forEach((floor) => {
  window.HD_DUNGEON.layouts.forEach((layout, layoutIndex) => {
    const requestedSize = layoutIndex % 2 ? 36 : 60;
    const dungeon = window.HD_DUNGEON.generate({ size: requestedSize, floor, createEnemy: generatorEnemy, layoutId: layout.id });
    assert(!(dungeon.layout.id === "great_halls" && requestedSize < 48) && !(dungeon.layout.id === "warrens" && requestedSize > 52), `deep incompatible layout survived selection: B${floor.floor}/${layout.id}`);
    assert(window.HD_DUNGEON.isReachableDungeon(dungeon), `unreachable deep layout: B${floor.floor}/${layout.id}`);
    assert(dungeon.map.length === requestedSize, `deep variable map size failed: B${floor.floor}/${layout.id}`);
    if (floor.floor < 100) assert(dungeon.rooms.length >= 9, `deep normal floor has fewer than nine rooms: B${floor.floor}/${layout.id}`);
    const deepDensity = dungeon.initialEnemyCount / dungeon.walkableTileCount;
    assert(deepDensity >= 0.04 && deepDensity <= 0.08, `deep initial enemy density escaped its band: B${floor.floor}/${layout.id}/${deepDensity}`);
    assert(!dungeon.enemies.filter((enemy) => !enemy.specialRoom).some((enemy) => window.HD_DUNGEON.roomContains(dungeon.rooms[0], enemy)), `deep start room contains an initial enemy: B${floor.floor}/${layout.id}`);
    assert(dungeon.rooms.some((room) => room.cramped), `deep cramped room is missing: B${floor.floor}/${layout.id}`);
    assert(dungeon.rooms.some((room) => room.alwaysLit), `deep always-lit room is missing: B${floor.floor}/${layout.id}`);
    const occupied = [dungeon.player, ...dungeon.stairs, ...dungeon.enemies, ...dungeon.chests];
    assert(new Set(occupied.map((item) => `${item.x},${item.y}`)).size === occupied.length, `deep generation overlap: B${floor.floor}/${layout.id}`);
  });
});

const rareRoomFloor = window.HD_DATA.floors[10];
const rareRoomTickets = rareRoomFloor.uniques.filter((id) => id !== "dungeon_lord_nox");
const rareRoomOptions = {
  madnessUniqueIds: rareRoomTickets,
  thrillUniqueIds: rareRoomTickets,
  artifactId: "artifact_old_guard_blade",
};
function distanceFromRoomEntries(dungeon, room, item) {
  return Math.min(...window.HD_DUNGEON.roomEntryTiles(dungeon, room)
    .map((entry) => Math.max(Math.abs(entry.x - item.x), Math.abs(entry.y - item.y))));
}
const madnessDungeon = window.HD_DUNGEON.generate({
  size: 60,
  floor: rareRoomFloor,
  createEnemy: generatorEnemy,
  layoutId: "classic",
  specialRooms: rareRoomOptions,
  specialRoomChances: { madness: 1, treasureVault: 0, thrill: 0 },
});
const madnessResidents = madnessDungeon.enemies.filter((enemy) => enemy.madnessGathering);
assert(madnessDungeon.madnessRoom && !madnessDungeon.madnessRoom.discovered, "madness room was not generated hidden");
assert(madnessResidents.length >= 4 && madnessResidents.length <= 6, "madness room unique count is outside the depth range");
assert(new Set(madnessResidents.map((enemy) => enemy.id)).size === madnessResidents.length, "madness room duplicated a unique monster");
assert(madnessResidents.every((enemy) => enemy.unique && window.HD_DUNGEON.roomContains(madnessDungeon.madnessRoom, enemy)), "madness residents are outside their room");
assert(madnessResidents.every((enemy) => distanceFromRoomEntries(madnessDungeon, madnessDungeon.madnessRoom, enemy) > 2), "madness resident blocks a room entrance buffer");
assert(window.HD_DUNGEON.isReachableDungeon(madnessDungeon), "madness room broke dungeon reachability");

const vaultDungeon = window.HD_DUNGEON.generate({
  size: 60,
  floor: rareRoomFloor,
  createEnemy: generatorEnemy,
  layoutId: "classic",
  specialRooms: rareRoomOptions,
  specialRoomChances: { madness: 0, treasureVault: 1, thrill: 0 },
});
const vaultChests = vaultDungeon.chests.filter((chest) => chest.treasureVault);
assert(vaultDungeon.treasureVault && !vaultDungeon.treasureVault.discovered, "treasure vault was not generated hidden");
assert(vaultChests.length >= 7 && vaultChests.length <= 11, "treasure vault chest count is invalid");
assert(vaultChests.every((chest) => window.HD_DUNGEON.roomContains(vaultDungeon.treasureVault, chest)), "vault chest was placed outside the vault");
assert(vaultChests.every((chest) => distanceFromRoomEntries(vaultDungeon, vaultDungeon.treasureVault, chest) > 2), "vault chest blocks a room entrance buffer");
assert(window.HD_DUNGEON.isReachableDungeon(vaultDungeon), "treasure vault broke dungeon reachability");

const thrillDungeon = window.HD_DUNGEON.generate({
  size: 60,
  floor: rareRoomFloor,
  createEnemy: generatorEnemy,
  layoutId: "classic",
  specialRooms: rareRoomOptions,
  specialRoomChances: { madness: 0, treasureVault: 0, thrill: 1 },
});
const thrillGuardian = thrillDungeon.enemies.find((enemy) => enemy.thrillRoomGuardian);
const thrillChest = thrillDungeon.chests.find((chest) => chest.thrillArtifact);
assert(thrillDungeon.thrillRoom && !thrillDungeon.thrillRoom.discovered, "thrill room was not generated hidden");
assert(thrillGuardian?.unique && thrillChest?.artifactId === rareRoomOptions.artifactId, "thrill guardian or guaranteed artifact chest is missing");
assert(window.HD_DUNGEON.roomContains(thrillDungeon.thrillRoom, thrillGuardian) && window.HD_DUNGEON.roomContains(thrillDungeon.thrillRoom, thrillChest), "thrill-room contents are misplaced");
assert(distanceFromRoomEntries(thrillDungeon, thrillDungeon.thrillRoom, thrillGuardian) > 2 && distanceFromRoomEntries(thrillDungeon, thrillDungeon.thrillRoom, thrillChest) > 2, "thrill-room content blocks an entrance buffer");
assert(window.HD_DUNGEON.isReachableDungeon(thrillDungeon), "thrill room broke dungeon reachability");

const simultaneousSpecialDungeon = window.HD_DUNGEON.generate({
  size: 36,
  floor: rareRoomFloor,
  createEnemy: generatorEnemy,
  specialRooms: rareRoomOptions,
  specialRoomChances: { madness: 1, treasureVault: 1, thrill: 1 },
});
assert(simultaneousSpecialDungeon.thrillRoom, "simultaneous special-room rolls did not preserve thrill-room priority");
assert(Array.isArray(simultaneousSpecialDungeon.deferredSpecialRooms), "simultaneous special-room fallback was not recorded");

let trapSafetyDungeon = null;
for (let attempt = 0; attempt < 12 && (!trapSafetyDungeon || trapSafetyDungeon.traps.length < 12); attempt += 1) {
  trapSafetyDungeon = window.HD_DUNGEON.generate({ size: 60, floor: window.HD_DATA.floors[90], createEnemy: generatorEnemy });
  trapSafetyDungeon.traps = [];
  for (let index = 0; index < 12; index += 1) {
    const pos = window.HD_DUNGEON.trapPosition(trapSafetyDungeon);
    if (pos) trapSafetyDungeon.traps.push({ ...pos, disarmed: false });
  }
}
assert(trapSafetyDungeon?.traps.length === 12, "deep trap floor could not place all twelve safe traps");
trapSafetyDungeon.traps.forEach((trap, index) => {
  const room = trapSafetyDungeon.rooms.find((candidate) => window.HD_DUNGEON.roomContains(candidate, trap));
  assert(room && !room.cramped && Math.min(room.w, room.h) > 1, "trap was placed in an extremely narrow room");
  assert(distanceFromRoomEntries(trapSafetyDungeon, room, trap) > 2, "trap was placed inside a room entrance buffer");
  assert(trapSafetyDungeon.stairs.every((stairs) => Math.max(Math.abs(stairs.x - trap.x), Math.abs(stairs.y - trap.y)) > 2), "trap was placed inside a stair buffer");
  assert(trapSafetyDungeon.traps.slice(index + 1).every((other) => Math.max(Math.abs(other.x - trap.x), Math.abs(other.y - trap.y)) >= 3), "traps are closer than three tiles");
});

const tensionFloor = window.HD_DATA.floors[0];
assert(window.HD_DATA.floors.every((floor) => {
  const normalEnemies = [...new Set(floor.monsterPool)].map((id) => {
    const enemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === id));
    enemy.maxHp = enemy.hp;
    enemy.alive = true;
    return enemy;
  });
  return window.HD_THREAT.assess(window.HD_DATA, floor, { enemies: normalEnemies }).level === 1;
}), "a normal floor roster raises dungeon tension");
const tensionSource = tensionFloor.monsterPool
  .map((id) => window.HD_DATA.monsters.find((monster) => monster.id === id))
  .sort((left, right) => window.HD_THREAT.score(right) - window.HD_THREAT.score(left))[0];
function scaledThreatEnemy(scale) {
  const enemy = clone(tensionSource);
  enemy.maxHp = Math.round(enemy.hp * scale);
  enemy.hp = enemy.maxHp;
  enemy.attack = Math.round(enemy.attack * scale);
  enemy.defense = Math.round(enemy.defense * scale);
  enemy.acceleration = Math.round(Number(enemy.acceleration || 0) * scale);
  if (enemy.dangerous) enemy.dangerous.power = Math.round(enemy.dangerous.power * scale);
  enemy.alive = true;
  return enemy;
}
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [scaledThreatEnemy(1)] }).level === 1, "normal floor threat is not tension level 1");
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [scaledThreatEnemy(1.3)] }).level === 2, "mild overlevel threat is not tension level 2");
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [scaledThreatEnemy(2)] }).level === 3, "strong overlevel threat is not tension level 3");
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [scaledThreatEnemy(3)] }).level === 4, "severe overlevel threat is not tension level 4");
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [scaledThreatEnemy(4)] }).level === 5, "overwhelming threat is not tension level 5");
const uniqueThreat = scaledThreatEnemy(0.5);
uniqueThreat.unique = true;
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [uniqueThreat] }).level === 2, "unique spawn does not guarantee tension level 2");
uniqueThreat.floorGuardian = true;
assert(window.HD_THREAT.assess(window.HD_DATA, tensionFloor, { enemies: [uniqueThreat] }).level === 4, "floor guardian does not guarantee tension level 4");
const noxThreat = clone(window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox"));
noxThreat.maxHp = noxThreat.hp;
noxThreat.alive = true;
noxThreat.floorGuardian = true;
assert(window.HD_THREAT.assess(window.HD_DATA, window.HD_DATA.floors[99], { enemies: [noxThreat] }).level === 5, "dungeon lord does not trigger tension level 5");

function FakeAudioParam() {
  this.value = 0;
}
FakeAudioParam.prototype.setValueAtTime = function (value) { this.value = value; };
FakeAudioParam.prototype.exponentialRampToValueAtTime = function (value) { this.value = value; };
FakeAudioParam.prototype.linearRampToValueAtTime = function (value) { this.value = value; };

let audioVoiceStarts = 0;

function FakeAudioNode() {
  this.gain = new FakeAudioParam();
  this.frequency = new FakeAudioParam();
  this.detune = new FakeAudioParam();
  this.Q = new FakeAudioParam();
  this.pan = new FakeAudioParam();
  this.threshold = new FakeAudioParam();
  this.knee = new FakeAudioParam();
  this.ratio = new FakeAudioParam();
  this.attack = new FakeAudioParam();
  this.release = new FakeAudioParam();
}
FakeAudioNode.prototype.connect = function () {};
FakeAudioNode.prototype.start = function () { audioVoiceStarts += 1; };
FakeAudioNode.prototype.stop = function () {};

function FakeAudioContext() {
  this.currentTime = 1;
  this.sampleRate = 48000;
}
FakeAudioContext.prototype.createGain = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createBiquadFilter = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createDynamicsCompressor = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createConvolver = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createStereoPanner = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createOscillator = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createBufferSource = function () { return new FakeAudioNode(); };
FakeAudioContext.prototype.createBuffer = function (channels, length) {
  const channelData = Array.from({ length: channels }, () => new Float32Array(length));
  return { getChannelData(index) { return channelData[index]; } };
};

const fakeAudioContext = new FakeAudioContext();
const sfxPlayer = window.HD_SFX.create(fakeAudioContext, new FakeAudioNode());
assert(sfxPlayer.types.length === 88, "sound effect recipe count changed");
assert(["uiTab", "uiConfirm", "uiCancel", "drink", "heartEquip", "trapDiscover", "trapDisarm", "summon", "invulnerable", "regenerate", "knockback", "selfDestruct", "debuff", "devour", "jobChange", "tutorial", "shopRefresh"].every((type) => sfxPlayer.types.includes(type)), "expanded sound-effect recipes are missing");
const voicesBeforeLevelUp = audioVoiceStarts;
sfxPlayer.play("levelUp");
assert(audioVoiceStarts - voicesBeforeLevelUp >= 18, "level-up fanfare is not sufficiently layered");
sfxPlayer.types.filter((type) => type !== "levelUp").forEach((type) => sfxPlayer.play(type));
assert(["deathCrySharp", "deathCryFading", "deathCryLow"].every((type) => sfxPlayer.types.includes(type)), "death-cry sound variants are missing");

function FakeClassList() {
  this.values = new Set();
}
FakeClassList.prototype.add = function (name) {
  this.values.add(name);
};
FakeClassList.prototype.remove = function (name) {
  this.values.delete(name);
};
FakeClassList.prototype.toggle = function (name, force) {
  const enabled = force === undefined ? !this.values.has(name) : Boolean(force);
  if (enabled) this.values.add(name);
  else this.values.delete(name);
  return enabled;
};
FakeClassList.prototype.contains = function (name) {
  return this.values.has(name);
};

function FakeElement() {
  this.classList = new FakeClassList();
  this.dataset = {};
  this.style = {};
  this.listeners = {};
  this.innerHTML = "";
  this.textContent = "";
  this.value = "";
  this.disabled = false;
  this.parentElement = { title: "" };
}
FakeElement.prototype.addEventListener = function (type, listener) {
  this.listeners[type] = listener;
};
FakeElement.prototype.appendChild = function () {};
FakeElement.prototype.setAttribute = function () {};
FakeElement.prototype.removeAttribute = function () {};
FakeElement.prototype.closest = function () { return null; };
FakeElement.prototype.focus = function () { document.activeElement = this; };

const elements = new Map();
const viewTabs = ["town", "dungeon", "research", "guild", "arena", "inn", "shop", "home", "jobCenter", "junkDealer"].map((view) => {
  const tab = new FakeElement();
  tab.dataset.view = view;
  return tab;
});
var document = {
  listeners: {},
  querySelector(selector) {
    if (!elements.has(selector)) {
      const element = new FakeElement();
      if (["#developerPanel", "#saveWarning", "#saveWarningReloadButton"].includes(selector)) element.classList.add("hidden");
      elements.set(selector, element);
    }
    return elements.get(selector);
  },
  querySelectorAll(selector) {
    if (selector === "[data-view]") return viewTabs;
    if (selector === "[data-read-spellbook]") {
      const html = elements.get("#homeView")?.innerHTML || "";
      const ids = [];
      const pattern = /data-read-spellbook="([^"]+)"/g;
      let match;
      while ((match = pattern.exec(html))) ids.push(match[1]);
      return ids.map((id) => {
        const key = `dynamic:read:${id}`;
        if (!elements.has(key)) elements.set(key, new FakeElement());
        const element = elements.get(key);
        element.dataset.readSpellbook = id;
        return element;
      });
    }
    if (selector === "[data-guild-donate]") {
      const html = elements.get("#guildView")?.innerHTML || "";
      const ids = [];
      const pattern = /data-guild-donate="([^"]+)"/g;
      let match;
      while ((match = pattern.exec(html))) ids.push(match[1]);
      return ids.map((id) => {
        const key = `dynamic:donate:${id}`;
        if (!elements.has(key)) elements.set(key, new FakeElement());
        const element = elements.get(key);
        element.dataset.guildDonate = id;
        return element;
      });
    }
    if (selector === "[data-sell-equipment]") {
      const html = elements.get("#shopView")?.innerHTML || "";
      const ids = [];
      const pattern = /data-sell-equipment="([^"]+)"/g;
      let match;
      while ((match = pattern.exec(html))) ids.push(match[1]);
      return ids.map((id) => {
        const key = `dynamic:sell-equipment:${id}`;
        if (!elements.has(key)) elements.set(key, new FakeElement());
        const element = elements.get(key);
        element.dataset.sellEquipment = id;
        return element;
      });
    }
    if (selector === "[data-tavern-snack]") {
      const html = elements.get("#innView")?.innerHTML || "";
      const ids = [];
      const pattern = /data-tavern-snack="([^"]+)"/g;
      let match;
      while ((match = pattern.exec(html))) ids.push(match[1]);
      return ids.map((id) => {
        const key = `dynamic:tavern-snack:${id}`;
        if (!elements.has(key)) elements.set(key, new FakeElement());
        const element = elements.get(key);
        element.dataset.tavernSnack = id;
        return element;
      });
    }
    return [];
  },
  createElement() {
    return new FakeElement();
  },
  addEventListener(type, listener) {
    this.listeners[type] = listener;
  },
};

function Audio(source) {
  this.source = source;
  this.loop = false;
  this.preload = "none";
  this.volume = 1;
  this.currentTime = 0;
  this.paused = true;
}
Audio.prototype.play = function () {
  this.paused = false;
  return { catch() {} };
};
Audio.prototype.pause = function () {
  this.paused = true;
};

const legacySave = {
  adventurer: {
    raceId: "human",
    jobId: "swordsman",
    personalityId: "gentle",
    name: "たかし",
    hp: 40,
    maxHp: 40,
    floor: 1,
    deepestFloor: 1,
    inDungeon: false,
    equipment: {
      weapon: "artifact_owner_seeking_boomerang",
      upper: "cloth",
      lower: null,
      feet: null,
      accessory1: null,
      accessory2: null,
    },
    ownedEquipment: ["rusty_knife", "cloth", "iron_sword", "artifact_owner_seeking_boomerang", "artifact_invisible_emperor_cloak"],
    materials: {},
    items: { spellbook_ember_shot: 1, junk_bent_spoon: 2 },
    learnedSpells: ["ember_shot"],
    activeSpellId: "ember_shot",
  },
  meta: {
    startGuidanceShown: true,
    clearedBossFloors: [20],
    guildClaims: [{ id: "red_garm", name: "赤熱のガルム", reward: 400 }],
    research: {
      cave_rat: { seen: true, level: 1 },
      carapace_rat: { seen: true, level: 2 },
      poison_bat: { seen: true, level: 3 },
    },
  },
  dungeon: null,
  arena: null,
  log: Array.from({ length: 62 }, (_, index) => (
    index === 0
      ? "<strong>最新の記録</strong>"
      : index === 59
        ? "最古の保存記録"
        : index === 61
          ? "破棄される古い記録"
        : `履歴${index + 1}`
  )),
};

var localStorage = {
  getItem(key) {
    return key === "hagitori-dungeon-save-v1" ? JSON.stringify(legacySave) : null;
  },
  setItem() {},
  removeItem() {},
};

const scheduledTimeouts = [];
window.setTimeout = function (callback, delay) {
  scheduledTimeouts.push({ callback, delay });
  return scheduledTimeouts.length;
};
window.clearTimeout = function () {};
window.setInterval = function () { return 1; };
window.clearInterval = function () {};

eval(read("js/main.js"));

const equipmentRoleCounts = window.HD_DATA.equipment.reduce((counts, item) => {
  const roleId = window.HD_EQUIPMENT_ROLES.classify(item).id;
  counts[roleId] = Number(counts[roleId] || 0) + 1;
  return counts;
}, {});
assert(["basic", "specialized", "conditional", "core", "novelty", "final"].every((id) => equipmentRoleCounts[id] > 0), "equipment role classification left an empty category");

const compactLogHtml = elements.get("#logList").innerHTML;
assert((compactLogHtml.match(/<p\b/g) || []).length === 10, "town log no longer uses its expanded ten-entry view");
assert(compactLogHtml.includes("&lt;strong&gt;最新の記録&lt;/strong&gt;") && !compactLogHtml.includes("<strong>最新の記録</strong>"), "compact log did not escape saved HTML");
const logHistoryOpenButton = elements.get("#openLogHistoryButton");
logHistoryOpenButton.focus();
logHistoryOpenButton.listeners.click();
assert(!elements.get("#logHistoryPanel").classList.contains("hidden"), "log-history dialog did not open");
const fullLogHtml = elements.get("#logHistoryList").innerHTML;
assert((fullLogHtml.match(/<p\b/g) || []).length === 60, "log-history dialog did not render all sixty saved entries");
assert(fullLogHtml.includes("&lt;strong&gt;最新の記録&lt;/strong&gt;") && fullLogHtml.includes("最古の保存記録"), "log-history dialog lost its newest or oldest retained entry");
assert(!fullLogHtml.includes("破棄される古い記録"), "log-history migration kept entries beyond its sixty-entry limit");
assert(fullLogHtml.indexOf("最新の記録") < fullLogHtml.indexOf("最古の保存記録"), "log-history entries are not newest-first");
assert(elements.get("#logHistoryDescription").textContent.includes("全60件"), "log-history dialog does not report its entry count");
assert(document.activeElement === elements.get("#logHistoryList"), "opening log history did not move focus into the dialog");
let logEscapePrevented = false;
document.listeners.keydown({ key: "Escape", preventDefault() { logEscapePrevented = true; } });
assert(logEscapePrevented && elements.get("#logHistoryPanel").classList.contains("hidden"), "Escape did not close log history");
assert(document.activeElement === logHistoryOpenButton, "closing log history did not restore focus to its opener");
logHistoryOpenButton.listeners.click();
elements.get("#closeLogHistoryButton").listeners.click();
assert(elements.get("#logHistoryPanel").classList.contains("hidden"), "log-history close button did not close the dialog");

assert(elements.get("#dungeonStrengthText").textContent === elements.get("#strengthText").textContent, "dungeon strength overlay is not synchronized");
assert(elements.get("#dungeonAccelerationText").textContent === elements.get("#accelerationText").textContent, "dungeon acceleration overlay is not synchronized");

let townArrowPrevented = false;
document.listeners.keydown({ key: "ArrowDown", preventDefault() { townArrowPrevented = true; } });
assert(!townArrowPrevented, "town arrow key was captured and prevented normal scrolling");

const researchHtml = elements.get("#researchView").innerHTML;
assert(researchHtml.includes("基礎最大HP"), "researched monster base HP is not shown in the compendium");
const caveRatResearchCard = researchHtml.match(/<details[^>]*data-research-card="cave_rat"[\s\S]*?<\/details>/)?.[0] || "";
assert(caveRatResearchCard.includes("<span>加速度</span><strong>0</strong>"), "research level one does not disclose acceleration in the compendium");
assert(researchHtml.includes("剥ぎ取り条件")
  && researchHtml.includes("精密射撃:蝙蝠の翼膜")
  && researchHtml.includes("超レア抽選:"),
"maximum research does not show canonical loot conditions in the compendium");
assert(researchHtml.includes("調査度 1/5"), "legacy level 1 migration failed");
assert(researchHtml.includes("調査度 3/5"), "legacy level 2 migration failed");
assert(researchHtml.includes("調査度 5/5 MAX"), "legacy level 3 migration failed");

viewTabs.find((tab) => tab.dataset.view === "home").listeners.click();
assert(viewTabs.find((tab) => tab.dataset.view === "home").classList.contains("active"), "home facility tab is not active");
assert(viewTabs.length === 10, "facility navigation is not a two-row ten-tab layout");
assert(!elements.get("#homeView").classList.contains("hidden"), "home view did not open from town");
assert(elements.get("#townView").classList.contains("hidden"), "town view remained visible over home");
const homeHtml = elements.get("#homeView").innerHTML;
assert(homeHtml.includes("セット装備") && homeHtml.includes("2・3・4部位"), "home equipment set activation board is missing");
assert(homeHtml.includes("通常攻撃期待値"), "home combat expectation is missing");
assert(homeHtml.includes("初級魔法書「火の粉弾」"), "spellbook shelf is missing");
assert(homeHtml.includes("習得魔法"), "learned spell section is missing");
assert(homeHtml.includes("★持ち主狙いのブーメラン"), "artifact star marker is missing");
assert(homeHtml.includes("呪われている"), "artifact curse label is missing");
assert(homeHtml.includes('id="backstoryInput"') && homeHtml.includes("たかしは"), "generated editable backstory is missing");
document.querySelector("#backstoryInput").value = "自分で書き直した生い立ち。";
elements.get("#saveBackstoryButton").listeners.click();
assert(elements.get("#homeView").innerHTML.includes("自分で書き直した生い立ち。"), "edited backstory was not saved at home");

viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
assert(elements.get("#confirmTitle").textContent === "冒険者ギルド初心者講座" && elements.get("#confirmOk").textContent === "講座を受ける" && elements.get("#confirmCancel").textContent === "今回は受けない", "first guild visit did not offer the optional beginner course");
elements.get("#confirmCancel").listeners.click();
assert(elements.get("#guildView").innerHTML.includes("報酬受取"), "guild reward claim section is missing");
assert(elements.get("#guildView").innerHTML.includes("合計400Gを受け取る"), "pending guild reward is missing");
assert(elements.get("#guildView").innerHTML.includes("★王様のインビジブル外套"), "artifact guild turn-in is missing");
elements.get("#claimGuildRewardsButton").listeners.click();
assert(elements.get("#goldText").textContent === 400, "guild reward claim did not pay gold");
assert(elements.get("#guildView").innerHTML.includes("受取可能な報酬はない"), "claimed guild reward remained pending");

viewTabs.find((tab) => tab.dataset.view === "town").listeners.click();
viewTabs.find((tab) => tab.dataset.view === "junkDealer").listeners.click();
assert(elements.get("#junkDealerView").innerHTML.includes("珍品偏愛堂") && elements.get("#junkDealerView").innerHTML.includes("本日の珍素材・12枠"), "junk dealer view did not open");
assert((elements.get("#junkDealerView").innerHTML.match(/data-junk-material=/g) || []).length === 12, "junk dealer did not display exactly twelve random materials");
elements.get("#closeJunkDealerButton").listeners.click();
elements.get("#restInnButton").listeners.click();
assert(elements.get("#goldText").textContent === 390, "inn did not charge exactly 10G");
assert(elements.get("#logList").innerHTML.includes("宿の主人"), "inn advice was not added to the log");
assert((elements.get("#innView").innerHTML.match(/data-tavern-snack=/g) || []).length === 5, "inn does not show exactly five random snacks");
const goldBeforeSnack = Number(elements.get("#goldText").textContent);
document.querySelectorAll("[data-tavern-snack]")[0].listeners.click();
assert(Number(elements.get("#goldText").textContent) < goldBeforeSnack, "eating a tavern snack did not charge gold");
assert(elements.get("#logList").innerHTML.includes("を食べた。たかし「"), "tavern snack did not produce an in-character comment");
assert((elements.get("#innView").innerHTML.match(/data-tavern-snack=/g) || []).length === 5, "tavern snacks were not replenished after eating");
viewTabs.find((tab) => tab.dataset.view === "shop").listeners.click();
assert(elements.get("#shopView").innerHTML.includes("宝箱の品を売る"), "treasure selling section is missing");
assert(elements.get("#shopView").innerHTML.includes("装備品<select"), "shop equipment label was not changed");
assert(elements.get("#shopView").innerHTML.includes("未装備の装備品を売る"), "equipment selling section is missing");
assert(elements.get("#shopView").innerHTML.includes('data-sell-equipment="rusty_knife"'), "unequipped starter weapon cannot be sold");
const goldBeforeStarterSale = Number(elements.get("#goldText").textContent);
elements.get("dynamic:sell-equipment:rusty_knife").listeners.click();
elements.get("#confirmOk").listeners.click();
assert(Number(elements.get("#goldText").textContent) > goldBeforeStarterSale, "selling starter equipment did not pay gold");
assert(!elements.get("#shopView").innerHTML.includes('data-sell-equipment="rusty_knife"'), "sold starter equipment returned immediately");
const goldBeforeEquipmentSale = Number(elements.get("#goldText").textContent);
elements.get("dynamic:sell-equipment:iron_sword").listeners.click();
elements.get("#confirmOk").listeners.click();
assert(Number(elements.get("#goldText").textContent) > goldBeforeEquipmentSale, "selling unequipped equipment did not pay gold");
assert(!elements.get("#shopView").innerHTML.includes('data-sell-equipment="iron_sword"'), "sold equipment remained in shop disposal list");

const normalDonationSave = clone(legacySave);
normalDonationSave.meta.awaitingCreation = false;
normalDonationSave.meta.guildClaims = [];
normalDonationSave.adventurer.inDungeon = false;
normalDonationSave.adventurer.equipment = { weapon: "rusty_knife", upper: "cloth", lower: null, feet: null, accessory1: null, accessory2: null };
normalDonationSave.adventurer.ownedEquipment = ["rusty_knife", "cloth", "iron_sword"];
normalDonationSave.dungeon = null;
normalDonationSave.arena = null;
let persistedNormalDonationSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(normalDonationSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedNormalDonationSave = JSON.parse(value);
};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
assert(!elements.get("#guildView").innerHTML.includes('data-guild-donate="rusty_knife"'), "equipped equipment was offered for GP donation");
elements.get("dynamic:donate:iron_sword").listeners.click();
elements.get("#confirmOk").listeners.click();
assert(!persistedNormalDonationSave.adventurer.ownedEquipment.includes("iron_sword") && persistedNormalDonationSave.adventurer.guildPoints > 0, "first normal equipment donation did not grant GP and remove the item");

const repeatedNormalDonationSave = clone(persistedNormalDonationSave);
repeatedNormalDonationSave.adventurer.ownedEquipment.push("iron_sword");
const firstNormalDonationPoints = repeatedNormalDonationSave.adventurer.guildPoints;
let persistedRepeatedNormalDonationSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(repeatedNormalDonationSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedRepeatedNormalDonationSave = JSON.parse(value);
};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
assert(elements.get("#guildView").innerHTML.includes('data-guild-donate="iron_sword"'), "reacquired normal equipment could not be donated again");
elements.get("dynamic:donate:iron_sword").listeners.click();
elements.get("#confirmOk").listeners.click();
assert(persistedRepeatedNormalDonationSave.adventurer.guildPoints > firstNormalDonationPoints
  && !persistedRepeatedNormalDonationSave.adventurer.ownedEquipment.includes("iron_sword"),
"repeated normal equipment donation did not grant GP and remove the item");

const starterDonationSave = clone(normalDonationSave);
starterDonationSave.adventurer.equipment.weapon = "iron_sword";
starterDonationSave.adventurer.ownedEquipment = ["rusty_knife", "cloth", "iron_sword"];
let persistedStarterDonationSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(starterDonationSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedStarterDonationSave = JSON.parse(value);
};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
assert(elements.get("#guildView").innerHTML.includes('data-guild-donate="rusty_knife"'), "unequipped starter item was not offered for GP donation");
elements.get("dynamic:donate:rusty_knife").listeners.click();
elements.get("#confirmOk").listeners.click();
assert(persistedStarterDonationSave.adventurer.guildPoints > 0
  && !persistedStarterDonationSave.adventurer.ownedEquipment.includes("rusty_knife"),
"starter equipment donation did not grant GP and remove the item");

const shallowShopGateSave = clone(legacySave);
shallowShopGateSave.meta.awaitingCreation = false;
shallowShopGateSave.meta.economySchemaVersion = 2;
shallowShopGateSave.meta.progressionSchemaVersion = 2;
shallowShopGateSave.meta.shop = { soldMaterials: { small_beast_meat: 999 }, inventory: [] };
shallowShopGateSave.adventurer.inDungeon = false;
shallowShopGateSave.adventurer.deepestFloor = 1;
shallowShopGateSave.meta.clearedBossFloors = [];
shallowShopGateSave.adventurer.gold = 10;
shallowShopGateSave.dungeon = null;
let persistedShallowShopGateSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(shallowShopGateSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedShallowShopGateSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#restInnButton").listeners.click();
assert(persistedShallowShopGateSave.meta.shop.inventory.length > 0 && persistedShallowShopGateSave.meta.shop.inventory.every((id) => Number(window.HD_DATA.equipment.find((item) => item.id === id)?.shopMinFloor || 1) <= 1), "shallow circulation unlocked depth-gated equipment");

const depth15ShopGateSave = clone(shallowShopGateSave);
depth15ShopGateSave.adventurer.deepestFloor = 15;
let persistedDepth15ShopGateSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(depth15ShopGateSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedDepth15ShopGateSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#restInnButton").listeners.click();
assert(persistedDepth15ShopGateSave.meta.shop.inventory.some((id) => window.HD_DATA.equipment.find((item) => item.id === id)?.shopMinFloor === 15), "B15 did not unlock grade-three shop equipment from existing circulation");
assert(persistedDepth15ShopGateSave.meta.shop.inventory.every((id) => Number(window.HD_DATA.equipment.find((item) => item.id === id)?.shopMinFloor || 1) <= 15), "B15 unlocked a later equipment grade");

const legacyShopGateSave = clone(shallowShopGateSave);
delete legacyShopGateSave.meta.economySchemaVersion;
legacyShopGateSave.meta.clearedBossFloors = [10];
legacyShopGateSave.meta.shop.inventory = [window.HD_DATA.equipment.find((item) => item.shopMinFloor === 85).id];
let persistedLegacyShopGateSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(legacyShopGateSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedLegacyShopGateSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#restInnButton").listeners.click();
assert(!persistedLegacyShopGateSave.meta.shop.inventory.some((id) => window.HD_DATA.equipment.find((item) => item.id === id)?.shopMinFloor === 85), "legacy shallow save retained prematurely unlocked top-grade equipment");

viewTabs.find((tab) => tab.dataset.view === "research").listeners.click();
assert(elements.get("#researchView").innerHTML.includes("researchQueryInput"), "research search UI is missing");
assert(elements.get("#researchView").innerHTML.includes("完全解析"), "research progress dashboard is missing");

viewTabs.find((tab) => tab.dataset.view === "arena").listeners.click();
elements.get("#arenaStartButton").listeners.click();
const appShell = elements.get("#appShell");
const arenaHtml = elements.get("#arenaView").innerHTML;
assert(appShell.classList.contains("arena-mode"), "arena mode was not activated");
assert(!appShell.classList.contains("town-mode"), "town mode remained active during arena battle");
assert(arenaHtml.includes("arena-floor-line"), "compact arena header is missing");
assert(arenaHtml.includes("arena-move-pad"), "arena movement pad is missing");
assert(arenaHtml.includes("第1戦 / 100"), "curated arena battle count is not shown");
assert(arenaHtml.includes(`>${arenaMonsters[0].speciesGlyph}</button>`), "arena species marker is not rendered");
assert(arenaHtml.includes("--arena-marker-hue:"), "arena marker attribute color is not rendered");
assert(arenaHtml.includes("--arena-marker-family-hue:"), "arena marker title color is not rendered");
assert(!arenaHtml.includes("arena-actions"), "arena action button still overlaps the log");
assert(elements.get("#logList").innerHTML.includes("「"), "arena unique encounter dialogue did not trigger");
assert((arenaHtml.match(/id="arenaRetireButton"/g) || []).length === 1, "arena retreat control is duplicated");

elements.get("#arenaRetireButton").listeners.click();
assert(!appShell.classList.contains("arena-mode"), "arena mode remained active after retreat");
assert(appShell.classList.contains("town-mode"), "town mode was not restored after retreat");

const arenaReloadSave = clone(legacySave);
const arenaReloadMonster = window.HD_DATA.monsters.find((monster) => monster.arenaRank === 1);
const arenaReloadEnemy = clone(arenaReloadMonster);
Object.assign(arenaReloadEnemy, {
  x: 7, y: 4, maxHp: arenaReloadMonster.hp, hp: arenaReloadMonster.hp, alive: true,
  turns: 0, telegraphed: false, unique: true, dialogueState: { recent: [], cooldown: 0, counters: {}, stages: {} },
});
arenaReloadSave.meta.awaitingCreation = false;
arenaReloadSave.adventurer.inDungeon = false;
arenaReloadSave.dungeon = null;
arenaReloadSave.arena = {
  round: 1, enemy: arenaReloadEnemy, awaitingNext: false, actionProgress: 0,
  size: 9, player: { x: 1, y: 4 }, obstacles: [],
};
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(arenaReloadSave) : null;
};
localStorage.setItem = function () {};
eval(read("js/main.js"));
assert(appShell.classList.contains("arena-mode"), "active arena save reloaded into town mode");
assert(!elements.get("#arenaView").classList.contains("hidden"), "active arena save did not reopen the arena view");
assert(elements.get("#townView").classList.contains("hidden"), "town view remained accessible after active arena reload");
assert(elements.get("#arenaView").innerHTML.includes("第1戦 / 100"), "reloaded arena round was not rendered");

const legacyArenaFieldSave = clone(arenaReloadSave);
delete legacyArenaFieldSave.arena.size;
delete legacyArenaFieldSave.arena.player;
delete legacyArenaFieldSave.arena.obstacles;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(legacyArenaFieldSave) : null;
};
localStorage.setItem = function () {};
eval(read("js/main.js"));
assert(elements.get("#appShell").classList.contains("arena-mode")
  && elements.get("#arenaView").innerHTML.includes("第1戦 / 100"),
"repairable legacy arena coordinates were discarded before field migration");

const arenaWorldTurnSave = clone(arenaReloadSave);
arenaWorldTurnSave.adventurer.jobId = "ninja";
arenaWorldTurnSave.adventurer.hp = 20;
arenaWorldTurnSave.adventurer.equipment.upper = "artifact_riverstone_mail";
arenaWorldTurnSave.adventurer.ownedEquipment.push("artifact_riverstone_mail");
arenaWorldTurnSave.arena.healCooldown = 2;
arenaWorldTurnSave.arena.enemy.acceleration = 0;
arenaWorldTurnSave.arena.enemy.specialAttack = null;
let persistedArenaWorldTurnSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(arenaWorldTurnSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArenaWorldTurnSave = JSON.parse(value);
};
const arenaTurnOriginalRandom = Math.random;
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
for (let action = 0; action < 2; action += 1) elements.get("[data-arena-guard]").listeners.click();
assert(persistedArenaWorldTurnSave.arena.healCooldown === 2 && persistedArenaWorldTurnSave.adventurer.hp === 20, "arena cooldown or regeneration advanced before a world turn");
elements.get("[data-arena-guard]").listeners.click();
Math.random = arenaTurnOriginalRandom;
assert(persistedArenaWorldTurnSave.arena.healCooldown === 1, "arena heal cooldown did not advance on the world turn");
assert(persistedArenaWorldTurnSave.adventurer.hp === 21, "arena regeneration did not apply exactly once on the world turn");

const arenaFinisherSave = clone(arenaReloadSave);
arenaFinisherSave.adventurer.level = 300;
arenaFinisherSave.adventurer.hp = 20;
arenaFinisherSave.adventurer.equipment.weapon = "rusty_knife";
arenaFinisherSave.adventurer.equipment.upper = "artifact_riverstone_mail";
arenaFinisherSave.adventurer.ownedEquipment.push("artifact_riverstone_mail");
arenaFinisherSave.arena.player = { x: 1, y: 4 };
Object.assign(arenaFinisherSave.arena.enemy, { x: 2, y: 4, hp: 1, acceleration: 0, specialAttack: null });
arenaFinisherSave.arena.healCooldown = 2;
let persistedArenaFinisherSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(arenaFinisherSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArenaFinisherSave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
elements.get("[data-arena-enemy]").listeners.click();
Math.random = arenaTurnOriginalRandom;
assert(persistedArenaFinisherSave.arena.awaitingNext, "arena finishing blow did not resolve the round");
assert(persistedArenaFinisherSave.arena.healCooldown === 1 && persistedArenaFinisherSave.adventurer.hp === 21, "arena finishing blow did not consume its world-turn action");

const arenaCarrySave = clone(arenaReloadSave);
arenaCarrySave.adventurer.jobId = "ninja";
arenaCarrySave.adventurer.level = 1;
arenaCarrySave.arena.actionProgress = 0;
arenaCarrySave.arena.player = { x: 6, y: 4 };
Object.assign(arenaCarrySave.arena.enemy, { hp: 1, alive: true, specialAttack: null, acceleration: 0 });
let persistedArenaCarrySave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(arenaCarrySave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArenaCarrySave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
elements.get("[data-arena-enemy]").listeners.click();
assert(persistedArenaCarrySave.arena.awaitingNext && persistedArenaCarrySave.arena.actionProgress === 1, "arena finishing blow lost its partial world-turn progress");
elements.get("#arenaNextButton").listeners.click();
Math.random = arenaTurnOriginalRandom;
assert(persistedArenaCarrySave.arena.round === 2 && persistedArenaCarrySave.arena.actionProgress === 1, "arena round transition reset carried action progress");

const arenaSelfDestructSave = clone(arenaReloadSave);
arenaSelfDestructSave.adventurer.hp = 999;
arenaSelfDestructSave.arena.player = { x: 6, y: 4 };
Object.assign(arenaSelfDestructSave.arena.enemy, {
  hp: arenaSelfDestructSave.arena.enemy.maxHp,
  alive: true,
  turns: 3,
  specialAttack: "self_destruct",
  acceleration: 0,
});
let persistedArenaSelfDestructSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(arenaSelfDestructSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArenaSelfDestructSave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("[data-arena-guard]").listeners.click();
Math.random = arenaTurnOriginalRandom;
assert(persistedArenaSelfDestructSave.arena.awaitingNext && !persistedArenaSelfDestructSave.arena.enemy.alive && persistedArenaSelfDestructSave.arena.enemy.hp === 0, "arena self-destruct left a living or positive-HP enemy state");

const arenaFirstRewardSave = clone(arenaReloadSave);
arenaFirstRewardSave.adventurer.gold = 0;
arenaFirstRewardSave.adventurer.guildPoints = 0;
arenaFirstRewardSave.adventurer.level = 1;
arenaFirstRewardSave.adventurer.experience = 0;
arenaFirstRewardSave.adventurer.arenaBestRound = 0;
arenaFirstRewardSave.arena.player = { x: 6, y: 4 };
arenaFirstRewardSave.arena.enemy.hp = 1;
arenaFirstRewardSave.arena.enemy.alive = true;
arenaFirstRewardSave.arena.awaitingNext = false;
let persistedArenaFirstRewardSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(arenaFirstRewardSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArenaFirstRewardSave = JSON.parse(value);
};
const arenaRewardOriginalRandom = Math.random;
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("[data-arena-enemy]").listeners.click();
assert(persistedArenaFirstRewardSave.adventurer.gold === 14 && persistedArenaFirstRewardSave.adventurer.guildPoints === 1, "first-clear arena reward was not paid in full");
assert(persistedArenaFirstRewardSave.adventurer.experience >= 18 && persistedArenaFirstRewardSave.adventurer.arenaBestRound === 1, "first-clear arena XP or record is invalid");

const arenaReplayRewardSave = clone(arenaFirstRewardSave);
arenaReplayRewardSave.adventurer.arenaBestRound = 1;
arenaReplayRewardSave.arena.enemy.hp = 1;
arenaReplayRewardSave.arena.enemy.alive = true;
arenaReplayRewardSave.arena.awaitingNext = false;
let persistedArenaReplayRewardSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(arenaReplayRewardSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArenaReplayRewardSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("[data-arena-enemy]").listeners.click();
Math.random = arenaRewardOriginalRandom;
assert(persistedArenaReplayRewardSave.adventurer.gold === 14 && persistedArenaReplayRewardSave.adventurer.guildPoints === 1, "arena replay did not pay full gold and GP");
assert(persistedArenaReplayRewardSave.adventurer.experience === persistedArenaFirstRewardSave.adventurer.experience, "arena replay did not pay full experience");

const spellbookSave = clone(legacySave);
spellbookSave.meta.awaitingCreation = false;
spellbookSave.meta.guildClaims = [];
spellbookSave.adventurer.jobId = "mage";
spellbookSave.adventurer.inDungeon = false;
spellbookSave.adventurer.items = { spellbook_ember_shot: 1 };
spellbookSave.adventurer.learnedSpells = [];
spellbookSave.adventurer.activeSpellId = null;
spellbookSave.dungeon = null;
let persistedSpellbookSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(spellbookSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSpellbookSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("dynamic:read:spellbook_ember_shot").listeners.click();
assert(!persistedSpellbookSave.adventurer.items.spellbook_ember_shot, "reading a spellbook did not consume it");
assert(persistedSpellbookSave.adventurer.learnedSpells.includes("ember_shot"), "reading a spellbook did not teach its spell");
assert(persistedSpellbookSave.adventurer.activeSpellId === "ember_shot", "newly learned spell was not selected");

const corpseSave = clone(legacySave);
corpseSave.meta.awaitingCreation = false;
corpseSave.meta.guildClaims = [];
corpseSave.adventurer.inDungeon = true;
corpseSave.adventurer.floor = 1;
corpseSave.adventurer.materials = {};
const corpseMap = Array.from({ length: 48 }, (_, y) => Array.from({ length: 48 }, (_, x) => (x === 0 || y === 0 || x === 47 || y === 47 ? "wall" : "floor")));
const corpseEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(corpseEnemy, {
  x: 11, y: 10, maxHp: corpseEnemy.hp, hp: 0, alive: false, harvested: false,
  harvestsTotal: 2, harvestsRemaining: 2, lootMaterialId: "small_beast_meat",
});
corpseSave.dungeon = {
  map: corpseMap, rooms: [], player: { x: 10, y: 10 }, stairs: [], enemies: [corpseEnemy], chests: [], traps: [],
  turnsElapsed: 0, actionProgress: 0, uniqueSpawned: false,
};
let persistedCorpseSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(corpseSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedCorpseSave = JSON.parse(value);
};
eval(read("js/main.js"));
assert(elements.get("#waitButton").textContent === "剥", "multi-harvest corpse is not actionable");
elements.get("#waitButton").listeners.click();
assert(persistedCorpseSave.dungeon.enemies[0].harvestsRemaining === 1, "first harvest did not preserve the corpse");
assert(!/残り\d+回/.test(persistedCorpseSave.log[0]), "remaining harvest count leaked into the log");
elements.get("#waitButton").listeners.click();
assert(persistedCorpseSave.dungeon.enemies[0].harvestsRemaining === 0, "final harvest did not exhaust the corpse");
assert(persistedCorpseSave.adventurer.materials.small_beast_meat === 2, "multi-harvest rewards were not granted per action");

const wallPositionSave = clone(corpseSave);
wallPositionSave.adventurer.raceId = "ghost";
wallPositionSave.dungeon.map[10][10] = "wall";
wallPositionSave.dungeon.map[12][12] = "wall";
wallPositionSave.dungeon.map[13][13] = "wall";
wallPositionSave.dungeon.stairs = [{ x: 12, y: 12 }];
wallPositionSave.dungeon.chests = [{ x: 13, y: 13, opened: false }];
let persistedWallPositionSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(wallPositionSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedWallPositionSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
assert(persistedWallPositionSave?.dungeon
  && persistedWallPositionSave.dungeon.player.x === 10
  && persistedWallPositionSave.dungeon.stairs[0].x === 12
  && persistedWallPositionSave.dungeon.chests[0].x === 13,
"valid ghost, stair, or chest wall positions caused the active dungeon to be discarded");

const brokenDungeonSave = clone(corpseSave);
delete brokenDungeonSave.dungeon.player;
delete brokenDungeonSave.dungeon.chests;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(brokenDungeonSave) : null;
};
localStorage.setItem = function () {};
eval(read("js/main.js"));
assert(elements.get("#appShell").classList.contains("town-mode") && elements.get("#placeText").textContent === "街", "partial dungeon save did not recover safely to town");

const corruptNumericSave = clone(legacySave);
corruptNumericSave.meta.awaitingCreation = false;
corruptNumericSave.meta.shop = { soldMaterials: { rat_tail: "2.9", unknown_material: 99 }, inventory: [] };
corruptNumericSave.adventurer.hp = "not-a-number";
corruptNumericSave.adventurer.maxHp = "also-bad";
corruptNumericSave.adventurer.gold = 20;
corruptNumericSave.adventurer.materials = { rat_tail: "3.8", unknown_material: 99 };
corruptNumericSave.adventurer.items = { recovery_medicine: "2.9", unknown_item: 99 };
corruptNumericSave.dungeon = null;
corruptNumericSave.adventurer.inDungeon = false;
let persistedCorruptNumericSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(corruptNumericSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedCorruptNumericSave = JSON.parse(value);
};
eval(read("js/main.js"));
assert(Number.isFinite(Number(elements.get("#hpText").textContent)) && Number(elements.get("#hpText").textContent) > 0, "missing HP migrated to NaN");
elements.get("#restInnButton").listeners.click();
assert(persistedCorruptNumericSave.adventurer.materials.rat_tail === 3
  && !persistedCorruptNumericSave.adventurer.materials.unknown_material
  && persistedCorruptNumericSave.adventurer.items.recovery_medicine === 2
  && !persistedCorruptNumericSave.adventurer.items.unknown_item,
"save count dictionaries were not normalized to finite known integer quantities");
assert(persistedCorruptNumericSave.meta.shop.soldMaterials.rat_tail === 2
  && !persistedCorruptNumericSave.meta.shop.soldMaterials.unknown_material,
"shop material counts were not normalized");

const deniedStorageSave = clone(corruptNumericSave);
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(deniedStorageSave) : null;
};
localStorage.setItem = function () { throw new Error("quota denied"); };
let deniedStorageInterruptedPlay = false;
let deniedStorageError = "";
try {
  eval(read("js/main.js"));
  elements.get("#restInnButton").listeners.click();
} catch (error) {
  deniedStorageInterruptedPlay = true;
  deniedStorageError = String(error);
}
assert(!deniedStorageInterruptedPlay, `localStorage write failure interrupted gameplay: ${deniedStorageError}`);

const revisionKeySave = clone(corruptNumericSave);
revisionKeySave.meta.saveRevision = 7;
revisionKeySave.adventurer.gold = 20;
let revisionKeyDisk = clone(revisionKeySave);
let revisionKeyValue = "7";
let fullSaveReads = 0;
localStorage.getItem = function (key) {
  if (key === "hagitori-dungeon-save-v1") {
    fullSaveReads += 1;
    return JSON.stringify(revisionKeyDisk);
  }
  return key === "hagitori-dungeon-save-revision-v1" ? revisionKeyValue : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") revisionKeyDisk = JSON.parse(value);
  if (key === "hagitori-dungeon-save-revision-v1") revisionKeyValue = String(value);
};
eval(read("js/main.js"));
const fullSaveReadsAfterLoad = fullSaveReads;
elements.get("#restInnButton").listeners.click();
assert(fullSaveReads === fullSaveReadsAfterLoad && Number(revisionKeyValue) === revisionKeyDisk.meta.saveRevision,
`routine saves still parse the full stored game: reads=${fullSaveReads}/${fullSaveReadsAfterLoad}, revisions=${revisionKeyValue}/${revisionKeyDisk.meta.saveRevision}`);

const multiTabSave = clone(corruptNumericSave);
multiTabSave.meta.saveRevision = 5;
multiTabSave.adventurer.gold = 20;
let multiTabDisk = clone(multiTabSave);
let multiTabWrites = 0;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(multiTabDisk) : null;
};
localStorage.setItem = function (key, value) {
  if (key !== "hagitori-dungeon-save-v1") return;
  multiTabWrites += 1;
  multiTabDisk = JSON.parse(value);
};
eval(read("js/main.js"));
const writesBeforeExternalChange = multiTabWrites;
multiTabDisk.meta.saveRevision = Number(multiTabDisk.meta.saveRevision || 0) + 1;
elements.get("#restInnButton").listeners.click();
assert(multiTabWrites === writesBeforeExternalChange
  && elements.get("#liveLogAnnouncer").textContent.includes("別のタブ"),
`an older tab overwrote a newer save revision: writes=${multiTabWrites}/${writesBeforeExternalChange}, notice=${elements.get("#liveLogAnnouncer").textContent}`);
assert(!elements.get("#saveWarning").classList.contains("hidden")
  && elements.get("#saveWarningText").textContent.includes("別のタブ")
  && !elements.get("#saveWarningReloadButton").classList.contains("hidden"),
"multi-tab save refusal was announced only to screen readers and offered no reload action");

const legacyNoxSave = clone(corpseSave);
legacyNoxSave.adventurer.floor = 100;
legacyNoxSave.dungeon.enemies = [clone(window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox"))];
Object.assign(legacyNoxSave.dungeon.enemies[0], {
  x: 20, y: 20, maxHp: legacyNoxSave.dungeon.enemies[0].hp, alive: true,
  turns: 0, acceleration: 0, asleep: false, summonProgress: 0,
  summon: { every: 5, count: 1, maxAlive: 2, maxTotal: 8, pool: "undefeated_deep_unique", minFloor: 60 },
  specialAttack: "time_stop",
  dialogueState: { recent: [], cooldown: 0, counters: {}, stages: {} },
});
delete legacyNoxSave.dungeon.enemies[0].elixirAttrition;
delete legacyNoxSave.dungeon.enemies[0].automaticSpecialAttack;
let persistedLegacyNoxSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(legacyNoxSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedLegacyNoxSave = JSON.parse(value);
};
const legacyNoxOriginalRandom = Math.random;
Math.random = function () { return 0.99; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = legacyNoxOriginalRandom;
const migratedLegacyNox = persistedLegacyNoxSave.dungeon.enemies.find((enemy) => enemy.id === "dungeon_lord_nox");
assert(migratedLegacyNox.elixirAttrition?.every === 2
  && migratedLegacyNox.summon?.every === 3
  && !migratedLegacyNox.specialAttack,
"a 3.5 final-boss instance kept time stop or missed current attrition/summon rules");
assert(!migratedLegacyNox.dialogueState?.stages?.encounter,
"a distant unique consumed its first-encounter dialogue before the player reached it");

const rangedStunSave = clone(corpseSave);
const rangedStunEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(rangedStunEnemy, {
  x: 20, y: 20, maxHp: rangedStunEnemy.hp, alive: true, turns: 0, acceleration: 0,
  spellStunnedTurns: 1, specialAttack: null, dangerous: null,
});
rangedStunSave.dungeon.enemies = [rangedStunEnemy];
let persistedRangedStunSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(rangedStunSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedRangedStunSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
assert(persistedRangedStunSave.dungeon.enemies[0].turns === 1
  && persistedRangedStunSave.dungeon.enemies[0].spellStunnedTurns === 0
  && persistedRangedStunSave.dungeon.enemies[0].x === 20
  && persistedRangedStunSave.dungeon.enemies[0].y === 20,
"a stunned enemy at range moved or failed to consume its action opportunity");

const rangedCadenceSave = clone(rangedStunSave);
Object.assign(rangedCadenceSave.dungeon.enemies[0], {
  turns: 2, spellStunnedTurns: 0,
  dangerous: { every: 3, name: "遠距離誤発動試験", attribute: "fire", power: 9999, telegraph: "遠距離誤発動の予兆。" },
});
let persistedRangedCadenceSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(rangedCadenceSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedRangedCadenceSave = JSON.parse(value);
};
eval(read("js/main.js"));
const rangedCadenceHpBefore = Number(elements.get("#hpText").textContent);
elements.get("#waitButton").listeners.click();
assert(persistedRangedCadenceSave.dungeon.enemies[0].turns === 3
  && !persistedRangedCadenceSave.dungeon.enemies[0].telegraphed
  && persistedRangedCadenceSave.adventurer.hp === rangedCadenceHpBefore,
"a distant melee enemy fired a dangerous technique globally while its action counter advanced");

const attritionDebtSave = clone(corpseSave);
const attritionEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "dungeon_lord_nox"));
Object.assign(attritionEnemy, {
  x: 20, y: 20, maxHp: attritionEnemy.hp, alive: true, turns: 1, acceleration: 0,
  specialAttack: null, dangerous: null, summon: null,
});
attritionDebtSave.adventurer.hp = 999;
attritionDebtSave.adventurer.maxHp = 999;
attritionDebtSave.adventurer.equipment.upper = "artifact_riverstone_mail";
if (!attritionDebtSave.adventurer.ownedEquipment.includes("artifact_riverstone_mail")) attritionDebtSave.adventurer.ownedEquipment.push("artifact_riverstone_mail");
attritionDebtSave.dungeon.enemies = [attritionEnemy];
let persistedAttritionDebtSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(attritionDebtSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedAttritionDebtSave = JSON.parse(value);
};
eval(read("js/main.js"));
const attritionHpBefore = Number(elements.get("#hpText").textContent);
elements.get("#waitButton").listeners.click();
const attritionDamage = Math.ceil(Number(elements.get("#maxHpText").textContent) * 0.05);
assert(persistedAttritionDebtSave.adventurer.hp === attritionHpBefore - attritionDamage
  && persistedAttritionDebtSave.adventurer.attritionRecoveryDebt === attritionDamage,
`passive HP regeneration canceled existence attrition: before=${attritionHpBefore}, damage=${attritionDamage}, after=${persistedAttritionDebtSave.adventurer.hp}, debt=${persistedAttritionDebtSave.adventurer.attritionRecoveryDebt}`);

const timeStopActionSave = clone(corpseSave);
timeStopActionSave.adventurer.jobId = "psychic";
timeStopActionSave.adventurer.level = 40;
timeStopActionSave.dungeon.enemies = [];
timeStopActionSave.dungeon.timeStopCooldown = 0;
timeStopActionSave.dungeon.timeStopTurns = 0;
let persistedTimeStopActionSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(timeStopActionSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedTimeStopActionSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#timeStopButton").listeners.click();
assert(persistedTimeStopActionSave.dungeon.timeStopCooldown === 24 && persistedTimeStopActionSave.dungeon.timeStopTurns === 2, "time stop did not consume its world-turn action");

const stairActionSave = clone(corpseSave);
stairActionSave.dungeon.enemies = [];
stairActionSave.dungeon.stairs = [{ x: 11, y: 10 }];
let persistedStairActionSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(stairActionSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedStairActionSave = JSON.parse(value);
};
const stairOriginalRandom = Math.random;
Math.random = function () { return 0.99; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
elements.get("#confirmCancel").listeners.click();
Math.random = stairOriginalRandom;
assert(persistedStairActionSave.dungeon.player.x === 11 && persistedStairActionSave.dungeon.turnsElapsed === 1, "moving onto and then declining a stair did not consume an action");

const goldenHarvestSave = clone(corpseSave);
goldenHarvestSave.dungeon.anomaly = { id: "gold", name: "黄金墓" };
let persistedGoldenHarvestSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(goldenHarvestSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedGoldenHarvestSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
assert(persistedGoldenHarvestSave.adventurer.materials.small_beast_meat === 2, "golden anomaly did not double harvest quantity");

const repeatBountySave = clone(corpseSave);
const repeatBountyEnemy = clone(bountyFormulaTarget);
Object.assign(repeatBountyEnemy, {
  x: 11, y: 10, maxHp: repeatBountyEnemy.hp, hp: 0, alive: false, harvested: false,
  harvestsTotal: 1, harvestsRemaining: 1, lootMaterialId: "garm_red_pelt", unique: true,
});
repeatBountySave.meta.bounties = { [repeatBountyEnemy.id]: { intel: true, claimed: 1 } };
repeatBountySave.meta.guildClaims = [];
repeatBountySave.adventurer.bountyCorpses = [];
repeatBountySave.dungeon.enemies = [repeatBountyEnemy];
let persistedRepeatBountySave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(repeatBountySave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedRepeatBountySave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
assert(persistedRepeatBountySave.adventurer.bountyCorpses[0].reward === expectedFirstBounty, "legacy claimed-count data still reduced a bounty reward");

const thiefCorpseSave = clone(corpseSave);
thiefCorpseSave.adventurer.jobId = "hunter";
let persistedThiefCorpseSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(thiefCorpseSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedThiefCorpseSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
assert(persistedThiefCorpseSave.dungeon.enemies[0].harvestsRemaining === 0, "thief did not exhaust all harvests in one action");
assert(persistedThiefCorpseSave.adventurer.materials.small_beast_meat === 2, "thief bulk harvest did not grant every material");
assert(persistedThiefCorpseSave.log.some((line) => line.includes("一気に剥ぎ尽くし")), "thief bulk harvest log is missing");

const awakeTargetSave = clone(corpseSave);
const awakeTarget = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(awakeTarget, { x: 11, y: 10, maxHp: 1000, hp: 1000, attack: 1, alive: true, asleep: false, turns: 0, telegraphed: false });
awakeTargetSave.adventurer.jobId = "hunter";
awakeTargetSave.dungeon.enemies = [awakeTarget];
awakeTargetSave.dungeon.traps = [];
let persistedAwakeTargetSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(awakeTargetSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedAwakeTargetSave = JSON.parse(value);
};
const sleepingAttackOriginalRandom = Math.random;
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
const awakeDamage = 1000 - persistedAwakeTargetSave.dungeon.enemies[0].hp;

const sleepingTargetSave = clone(awakeTargetSave);
sleepingTargetSave.dungeon.enemies[0].asleep = true;
let persistedSleepingTargetSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(sleepingTargetSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSleepingTargetSave = JSON.parse(value);
};
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = sleepingAttackOriginalRandom;
const sleepingAmbushDamage = 1000 - persistedSleepingTargetSave.dungeon.enemies[0].hp;
assert(sleepingAmbushDamage >= awakeDamage * 2.5, "thief sleeping-target ambush did not deal major bonus damage");
assert(!persistedSleepingTargetSave.dungeon.enemies[0].asleep && persistedSleepingTargetSave.adventurer.lastAttack.sleepAmbush, "sleeping target did not wake or ambush state was not recorded");
assert(persistedSleepingTargetSave.log.some((line) => line.includes("寝込み襲撃")), "thief sleeping ambush log is missing");

const handymanDigSave = clone(corpseSave);
handymanDigSave.adventurer.jobId = "handyman";
handymanDigSave.dungeon.enemies = [];
handymanDigSave.dungeon.traps = [];
handymanDigSave.dungeon.map[10][11] = "wall";
let persistedHandymanDigSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(handymanDigSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedHandymanDigSave = JSON.parse(value);
};
const digOriginalRandom = Math.random;
Math.random = function () { return 0.99; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
assert(persistedHandymanDigSave.dungeon.map[10][11] === "floor", "handyman did not excavate an interior wall");
assert(persistedHandymanDigSave.dungeon.player.x === 10 && persistedHandymanDigSave.dungeon.player.y === 10, "handyman moved during the excavation action");
assert(persistedHandymanDigSave.dungeon.excavatedTiles.filter((tile) => tile.x === 11 && tile.y === 10).length === 1, "excavated tile was not recorded exactly once");
assert(persistedHandymanDigSave.log.some((line) => line.includes("内壁を1マス掘削")), "handyman excavation log is missing");
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = digOriginalRandom;
assert(persistedHandymanDigSave.dungeon.player.x === 11 && persistedHandymanDigSave.dungeon.player.y === 10, "handyman could not enter the excavated tile on the next action");

const handymanBoundarySave = clone(corpseSave);
handymanBoundarySave.adventurer.jobId = "handyman";
handymanBoundarySave.dungeon.enemies = [];
handymanBoundarySave.dungeon.player = { x: 1, y: 10 };
let persistedHandymanBoundarySave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(handymanBoundarySave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedHandymanBoundarySave = JSON.parse(value);
};
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowLeft", preventDefault() {} });
assert(persistedHandymanBoundarySave.dungeon.map[10][0] === "wall", "handyman excavated the outer boundary");
assert(!(persistedHandymanBoundarySave.dungeon.excavatedTiles || []).some((tile) => tile.x === 0 && tile.y === 10), "outer boundary was recorded as excavated");

const madnessDiscoverySave = clone(corpseSave);
const madnessTestUniques = window.HD_DATA.monsters.filter((monster) => monster.unique && !monster.arenaOnly).slice(0, 3);
const madnessTestUnique = madnessTestUniques[0];
madnessDiscoverySave.dungeon.enemies = [14, 15, 16].map((x, index) => Object.assign(clone(madnessTestUniques[index]), {
  x, y: 10, maxHp: 999, hp: 999, alive: true, specialRoom: "madness", madnessGathering: true,
}));
madnessDiscoverySave.dungeon.madnessRoom = { x: 11, y: 8, w: 6, h: 5, discovered: false, enemyCount: 3 };
let persistedMadnessDiscoverySave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(madnessDiscoverySave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedMadnessDiscoverySave = JSON.parse(value);
};
Math.random = function () { return 0.99; };
eval(read("js/main.js"));
assert(!elements.get("#actionPaceText").textContent.includes("狂気の部屋"), "undiscovered madness room leaked into the HUD");
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = digOriginalRandom;
assert(persistedMadnessDiscoverySave.dungeon.madnessRoom.discovered, "entering a madness room did not discover it");
assert(persistedMadnessDiscoverySave.log.some((line) => line.includes("狂気の部屋を発見")), "madness-room discovery log is missing");
assert(persistedMadnessDiscoverySave.dungeon.enemies.filter((enemy) => enemy.specialRoomGraceTurns === 0).length === 2
  && persistedMadnessDiscoverySave.dungeon.enemies.filter((enemy) => enemy.specialRoomGraceTurns === 1).length === 1, "madness-room residents did not activate in a two-then-rest wave");

const specialContactSave = clone(corpseSave);
specialContactSave.dungeon.enemies = [Object.assign(clone(madnessTestUnique), {
  x: 11, y: 10, maxHp: 9999, hp: 9999, defense: 9999, alive: true, specialRoom: "madness", madnessGathering: true,
})];
specialContactSave.dungeon.madnessRoom = { x: 11, y: 8, w: 6, h: 5, discovered: false, enemyCount: 1 };
let persistedSpecialContactSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(specialContactSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSpecialContactSave = JSON.parse(value);
};
Math.random = function () { return 0.99; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = digOriginalRandom;
assert(persistedSpecialContactSave.dungeon.madnessRoom.discovered && persistedSpecialContactSave.dungeon.player.x === 10, "contact with a concealed special resident did not reveal its room before combat");

const treasureVaultSave = clone(corpseSave);
treasureVaultSave.dungeon.enemies = [];
treasureVaultSave.dungeon.treasureVault = { x: 11, y: 8, w: 6, h: 5, discovered: false, chestCount: 1 };
treasureVaultSave.dungeon.chests = [{ x: 12, y: 10, opened: false, specialRoom: "treasureVault", treasureVault: true }];
let persistedTreasureVaultSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(treasureVaultSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedTreasureVaultSave = JSON.parse(value);
};
Math.random = function () { return 0.99; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = digOriginalRandom;
assert(persistedTreasureVaultSave.dungeon.treasureVault.discovered, "entering a treasure vault did not discover it");
assert(persistedTreasureVaultSave.dungeon.chests[0].opened, "treasure-vault chest did not open");
assert(Object.values(persistedTreasureVaultSave.adventurer.items).reduce((sum, count) => sum + count, 0) > 0, "treasure-vault chest granted no rare item");

const thrillRoomSave = clone(corpseSave);
const thrillGuard = Object.assign(clone(window.HD_DATA.monsters.find((monster) => monster.unique && !monster.arenaOnly)), {
  x: 14, y: 10, maxHp: 999, hp: 999, alive: true, specialRoom: "thrill", thrillRoomGuardian: true,
});
thrillRoomSave.dungeon.enemies = [thrillGuard];
thrillRoomSave.dungeon.thrillRoom = { x: 11, y: 8, w: 6, h: 5, discovered: false, guardianName: thrillGuard.name, artifactId: "artifact_old_guard_blade" };
thrillRoomSave.dungeon.chests = [{ x: 12, y: 10, opened: false, specialRoom: "thrill", thrillArtifact: true, artifactId: "artifact_old_guard_blade" }];
let persistedThrillRoomSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(thrillRoomSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedThrillRoomSave = JSON.parse(value);
};
Math.random = function () { return 0.99; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = digOriginalRandom;
assert(persistedThrillRoomSave.dungeon.thrillRoom.discovered, "entering a thrill room did not discover it");
assert(!persistedThrillRoomSave.dungeon.chests[0].opened, "thrill artifact chest opened before its guardian was defeated");
assert(persistedThrillRoomSave.log.some((line) => line.includes("守護者を倒さなければ開かない")), "thrill-room seal warning is missing");

const clearedThrillRoomSave = clone(persistedThrillRoomSave);
clearedThrillRoomSave.dungeon.player = { x: 11, y: 10 };
clearedThrillRoomSave.dungeon.enemies[0].alive = false;
clearedThrillRoomSave.dungeon.enemies[0].hp = 0;
let persistedClearedThrillRoomSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(clearedThrillRoomSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedClearedThrillRoomSave = JSON.parse(value);
};
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
assert(persistedClearedThrillRoomSave.dungeon.chests[0].opened, "cleared thrill-room artifact chest stayed sealed");
assert(persistedClearedThrillRoomSave.adventurer.ownedEquipment.includes("artifact_old_guard_blade"), "thrill-room chest did not grant its promised fixed artifact");

const triggeredTrapSave = clone(corpseSave);
triggeredTrapSave.adventurer.hp = 100;
triggeredTrapSave.dungeon.enemies = [];
triggeredTrapSave.dungeon.traps = [{ x: 11, y: 10, type: "damage", danger: 3, discovered: false, disarmed: false, triggerCount: 0 }];
let persistedTriggeredTrapSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(triggeredTrapSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedTriggeredTrapSave = JSON.parse(value);
};
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
assert(persistedTriggeredTrapSave.dungeon.traps[0].discovered, "triggered trap was not revealed");
assert(!persistedTriggeredTrapSave.dungeon.traps[0].disarmed && persistedTriggeredTrapSave.dungeon.traps[0].triggerCount === 1, "triggered trap did not remain active");
assert(elements.get("#waitButton").textContent === "解", "triggered trap cannot be disarmed afterward");

const trapDisarmSave = clone(corpseSave);
trapDisarmSave.dungeon.enemies = [];
trapDisarmSave.dungeon.traps = [{ x: 11, y: 10, type: "slow", danger: 1, discovered: true, disarmed: false, triggerCount: 0 }];
let persistedTrapDisarmSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(trapDisarmSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedTrapDisarmSave = JSON.parse(value);
};
const trapOriginalRandom = Math.random;
Math.random = function () { return 0; };
eval(read("js/main.js"));
assert(elements.get("#waitButton").textContent === "解", "discovered adjacent trap is not actionable");
elements.get("#waitButton").listeners.click();
Math.random = trapOriginalRandom;
assert(persistedTrapDisarmSave.dungeon.traps[0].disarmed, "trap disarm action did not neutralize the trap");

const trapRetrySave = clone(corpseSave);
trapRetrySave.adventurer.hp = 100;
trapRetrySave.dungeon.enemies = [];
trapRetrySave.dungeon.traps = [{ x: 11, y: 10, type: "damage", danger: 1, discovered: true, disarmed: false, triggerCount: 0, disarmFailures: 0 }];
let persistedTrapRetrySave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(trapRetrySave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedTrapRetrySave = JSON.parse(value);
};
Math.random = function () { return 0.999; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = trapOriginalRandom;
assert(persistedTrapRetrySave.dungeon.traps[0].disarmFailures === 1 && persistedTrapRetrySave.dungeon.traps[0].triggerCount === 1, "failed trap disarm did not record retry progress");
assert(persistedTrapRetrySave.log.some((line) => line.includes("2ダメージ")), "failed trap disarm did not apply half-strength damage");

const thirdTrapTriggerSave = clone(corpseSave);
thirdTrapTriggerSave.adventurer.hp = 100;
thirdTrapTriggerSave.dungeon.enemies = [];
thirdTrapTriggerSave.dungeon.traps = [{ x: 11, y: 10, type: "damage", danger: 1, discovered: true, disarmed: false, triggerCount: 2, disarmFailures: 0 }];
let persistedThirdTrapTriggerSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(thirdTrapTriggerSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedThirdTrapTriggerSave = JSON.parse(value);
};
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
assert(persistedThirdTrapTriggerSave.dungeon.traps[0].triggerCount === 3 && persistedThirdTrapTriggerSave.dungeon.traps[0].disarmed, "trap did not break after its third activation");

const summonSave = clone(corpseSave);
const summoner = clone(window.HD_DATA.monsters.find((monster) => monster.id === "venom_widow_nazka"));
Object.assign(summoner, { x: 11, y: 10, maxHp: summoner.hp, alive: true, turns: 5, telegraphed: false });
summonSave.dungeon.enemies = [summoner];
summonSave.dungeon.traps = [];
let persistedSummonSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(summonSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSummonSave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = trapOriginalRandom;
const summonedEnemy = persistedSummonSave.dungeon.enemies.find((enemy) => enemy.summoned);
assert(summonedEnemy && summonedEnemy.summonedBy, "summoning unique did not create a minion");
assert(summonedEnemy.rewardProfile.experienceMultiplier === 0.25 && summonedEnemy.rewardProfile.harvestRolls[1] === 1, "summoned minion reward limits are missing");

const summonCollisionSave = clone(summonSave);
Object.assign(summonCollisionSave.dungeon.enemies[0], {
  turns: 3, summonProgress: 5, specialAttack: "time_stop", telegraphed: false,
});
let persistedSummonCollisionSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(summonCollisionSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSummonCollisionSave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = trapOriginalRandom;
assert(persistedSummonCollisionSave.dungeon.enemies.some((enemy) => enemy.summoned)
  && persistedSummonCollisionSave.dungeon.enemies[0].summonProgress === 0,
"summon cadence was skipped when it collided with a periodic special action");

const telegraphSummonCollisionSave = clone(summonSave);
Object.assign(telegraphSummonCollisionSave.dungeon.enemies[0], {
  turns: 5,
  summonProgress: 5,
  acceleration: 0,
  telegraphed: true,
  telegraphedAttribute: "poison",
  dangerous: { every: 3, name: "予告解放試験", attribute: "poison", power: 1, telegraph: "予告解放試験の構え。" },
});
let persistedTelegraphSummonCollisionSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(telegraphSummonCollisionSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedTelegraphSummonCollisionSave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = trapOriginalRandom;
assert(!persistedTelegraphSummonCollisionSave.dungeon.enemies[0].telegraphed
  && persistedTelegraphSummonCollisionSave.dungeon.enemies[0].summonProgress === 6
  && !persistedTelegraphSummonCollisionSave.dungeon.enemies.some((enemy) => enemy.summoned),
"a due summon ran before releasing an already-telegraphed dangerous attack");
elements.get("#waitButton").listeners.click();
assert(persistedTelegraphSummonCollisionSave.dungeon.enemies[0].summonProgress === 0
  && persistedTelegraphSummonCollisionSave.dungeon.enemies.some((enemy) => enemy.summoned),
"a summon due on the telegraph-release action was lost instead of running on the next action");

const cappedSummonSave = clone(summonSave);
cappedSummonSave.dungeon.enemySpawnCap = 1;
let persistedCappedSummonSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(cappedSummonSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedCappedSummonSave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = trapOriginalRandom;
assert(!persistedCappedSummonSave.dungeon.enemies.some((enemy) => enemy.summoned), "summoning exceeded the generated dungeon density cap");

const goldTheftSave = clone(corpseSave);
const goldThief = clone(window.HD_DATA.monsters.find((monster) => monster.id === "coin_snatcher_imp"));
Object.assign(goldThief, { x: 11, y: 10, maxHp: goldThief.hp, alive: true, turns: 2, telegraphed: false });
goldTheftSave.adventurer.floor = 3;
goldTheftSave.adventurer.gold = 100;
goldTheftSave.dungeon.rooms = [{ x: 1, y: 1, w: 46, h: 46, cx: 24, cy: 24, alwaysLit: false, cramped: false }];
goldTheftSave.dungeon.enemies = [goldThief];
goldTheftSave.dungeon.traps = [];
let persistedGoldTheftSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(goldTheftSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedGoldTheftSave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = trapOriginalRandom;
const escapedGoldThief = persistedGoldTheftSave.dungeon.enemies[0];
assert(persistedGoldTheftSave.adventurer.gold === 80 && escapedGoldThief.hasStolenGold && escapedGoldThief.stolenGold == null, "gold thief did not permanently steal the expected share");
assert(Math.max(Math.abs(escapedGoldThief.x - 10), Math.abs(escapedGoldThief.y - 10)) >= 8, "gold thief did not teleport away after stealing");
assert(persistedGoldTheftSave.log.some((line) => line.includes("奪われた金は戻らない")), "permanent gold-theft warning is missing");

const goldRecoverySave = clone(persistedGoldTheftSave);
goldRecoverySave.adventurer.name = "サイタマ";
goldRecoverySave.dungeon.player = { x: 10, y: 10 };
Object.assign(goldRecoverySave.dungeon.enemies[0], { x: 11, y: 10, alive: true, hp: goldRecoverySave.dungeon.enemies[0].maxHp });
let persistedGoldRecoverySave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(goldRecoverySave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedGoldRecoverySave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = trapOriginalRandom;
assert(persistedGoldRecoverySave.adventurer.gold === 80, "defeating the thief incorrectly refunded stolen gold");
assert(!persistedGoldRecoverySave.log.some((line) => line.includes("Gを取り返した")), "stolen-gold refund log still exists");

const saitamaSave = clone(corpseSave);
const saitamaTarget = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(saitamaTarget, { x: 11, y: 10, maxHp: saitamaTarget.hp, alive: true, turns: 0, telegraphed: false });
saitamaSave.adventurer.name = "サイタマ";
saitamaSave.dungeon.enemies = [saitamaTarget];
let persistedSaitamaSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(saitamaSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSaitamaSave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = trapOriginalRandom;
assert(!persistedSaitamaSave.dungeon.enemies[0].alive, "Saitama secret did not one-punch the target");
assert(persistedSaitamaSave.log.some((line) => line.includes("ワンパンチ")), "Saitama secret log is missing");
assert(persistedSaitamaSave.dungeon.turnsElapsed === 1, "a killing normal attack did not consume an action");

const rimuruSave = clone(corpseSave);
const rimuruTargets = ["cave_rat", "carapace_rat"].map((id, index) => {
  const target = clone(window.HD_DATA.monsters.find((monster) => monster.id === id));
  return Object.assign(target, { x: 11 + index, y: 10, maxHp: target.hp, alive: true, turns: 0, telegraphed: false });
});
const humanRimuruSave = clone(corpseSave);
humanRimuruSave.adventurer.name = "リムル";
humanRimuruSave.adventurer.raceId = "human";
humanRimuruSave.dungeon.enemies = clone(rimuruTargets).map((enemy) => Object.assign(enemy, { maxHp: 999, hp: 999 }));
let persistedHumanRimuruSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(humanRimuruSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedHumanRimuruSave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = trapOriginalRandom;
assert(persistedHumanRimuruSave.dungeon.enemies.every((enemy) => enemy.alive), "a non-slime named Rimuru wiped the floor");
assert(!persistedHumanRimuruSave.log.some((line) => line.includes("虚崩朧千変万華")), "a non-slime triggered the Rimuru floor-wipe log");

rimuruSave.adventurer.name = "リムル";
rimuruSave.adventurer.raceId = "slime";
rimuruSave.dungeon.enemies = rimuruTargets;
let persistedRimuruSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(rimuruSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedRimuruSave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = trapOriginalRandom;
assert(persistedRimuruSave.dungeon.enemies.every((enemy) => !enemy.alive), "Rimuru secret did not wipe the floor");
assert(persistedRimuruSave.log.some((line) => line.includes("虚崩朧千変万華")), "Rimuru secret log is missing");

const selfDestructGuardianSave = clone(corpseSave);
const selfDestructGuardian = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(selfDestructGuardian, {
  x: 11, y: 10, maxHp: selfDestructGuardian.hp, alive: true, turns: 3, telegraphed: false,
  specialAttack: "self_destruct", floorGuardian: true,
});
selfDestructGuardianSave.adventurer.hp = 40;
selfDestructGuardianSave.adventurer.floor = 10;
selfDestructGuardianSave.dungeon.enemies = [selfDestructGuardian];
selfDestructGuardianSave.dungeon.stairs = [];
selfDestructGuardianSave.dungeon.guardianDefeated = false;
let persistedSelfDestructGuardianSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(selfDestructGuardianSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSelfDestructGuardianSave = JSON.parse(value);
};
const selfDestructOriginalRandom = Math.random;
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = selfDestructOriginalRandom;
assert(persistedSelfDestructGuardianSave.dungeon.enemies[0].alive, "a floor guardian was allowed to self-destruct");
assert(persistedSelfDestructGuardianSave.dungeon.enemies[0].specialAttack === "knockback", "forbidden guardian self-destruct was not replaced");
assert(!persistedSelfDestructGuardianSave.dungeon.guardianDefeated, "forbidden guardian self-destruct cleared the floor");
assert(persistedSelfDestructGuardianSave.dungeon.stairs.length === 0, "forbidden guardian self-destruct created stairs");
assert(!persistedSelfDestructGuardianSave.meta.clearedBossFloors.includes(10), "forbidden guardian self-destruct unlocked the B10 departure point");

const selfDestructEnemySave = clone(corpseSave);
const selfDestructEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(selfDestructEnemy, {
  x: 11, y: 10, maxHp: selfDestructEnemy.hp, alive: true, turns: 3, telegraphed: false,
  specialAttack: "self_destruct",
});
selfDestructEnemySave.adventurer.experience = 0;
selfDestructEnemySave.adventurer.equipment.weapon = "rusty_knife";
selfDestructEnemySave.dungeon.enemies = [selfDestructEnemy];
let persistedSelfDestructEnemySave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(selfDestructEnemySave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSelfDestructEnemySave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = selfDestructOriginalRandom;
const explodedEnemy = persistedSelfDestructEnemySave.dungeon.enemies[0];
assert(!explodedEnemy.alive && explodedEnemy.hp === 0 && explodedEnemy.destroyed && explodedEnemy.harvested && explodedEnemy.harvestsRemaining === 0, "self-destruct left a positive-HP or harvestable corpse");
assert(persistedSelfDestructEnemySave.adventurer.experience === 2, "self-destruct did not award half experience");

const oneTrialSave = clone(corpseSave);
const oneTrialEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(oneTrialEnemy, { x: 11, y: 10, maxHp: oneTrialEnemy.hp, alive: true, turns: 0, telegraphed: false, specialAttack: null });
oneTrialSave.adventurer.equipment.weapon = "rusty_knife";
oneTrialSave.dungeon.enemies = [oneTrialEnemy];
let persistedOneTrialSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(oneTrialSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedOneTrialSave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = selfDestructOriginalRandom;
assert(persistedOneTrialSave.log.some((line) => line.includes("の攻撃（") && line.includes("。1回試行")), "enemy normal attack did not use exactly one trial");

const telegraphStopSave = clone(corpseSave);
const telegraphStopEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(telegraphStopEnemy, {
  x: 11, y: 10, maxHp: 100, hp: 100, attack: 20, alive: true, turns: 2, telegraphed: false,
  acceleration: 12, specialAttack: null,
  dangerous: { every: 3, name: "試験大技", attribute: "fire", power: 99, telegraph: "試験大技の予兆。" },
});
telegraphStopSave.adventurer.equipment.weapon = "rusty_knife";
telegraphStopSave.dungeon.enemies = [telegraphStopEnemy];
let persistedTelegraphStopSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(telegraphStopSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedTelegraphStopSave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
const telegraphHpBefore = Number(elements.get("#hpText").textContent);
elements.get("#waitButton").listeners.click();
Math.random = selfDestructOriginalRandom;
assert(persistedTelegraphStopSave.dungeon.enemies[0].turns === 3 && persistedTelegraphStopSave.dungeon.enemies[0].telegraphed, "accelerated enemy continued after creating a danger telegraph");
assert(persistedTelegraphStopSave.adventurer.hp === telegraphHpBefore, "accelerated enemy released a newly telegraphed danger attack in the same world turn");

const drainMissSave = clone(corpseSave);
const drainMissEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(drainMissEnemy, { x: 11, y: 10, maxHp: drainMissEnemy.hp, alive: true, turns: 3, telegraphed: false, specialAttack: "drain" });
drainMissSave.adventurer.experience = 50;
drainMissSave.adventurer.equipment.weapon = "rusty_knife";
drainMissSave.dungeon.enemies = [drainMissEnemy];
let persistedDrainMissSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(drainMissSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedDrainMissSave = JSON.parse(value);
};
Math.random = function () { return 0.99; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = selfDestructOriginalRandom;
assert(persistedDrainMissSave.adventurer.experience === 50, "missed drain still removed experience");

const knockbackMissSave = clone(drainMissSave);
knockbackMissSave.dungeon.enemies[0].specialAttack = "knockback";
let persistedKnockbackMissSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(knockbackMissSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedKnockbackMissSave = JSON.parse(value);
};
Math.random = function () { return 0.99; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = selfDestructOriginalRandom;
assert(persistedKnockbackMissSave.dungeon.player.x === 10 && persistedKnockbackMissSave.dungeon.player.y === 10, "missed knockback still moved the player");

const incomingImmunitySave = clone(corpseSave);
const poisonEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(poisonEnemy, { x: 11, y: 10, maxHp: poisonEnemy.hp, alive: true, turns: 0, telegraphed: false, specialAttack: null, attackAttribute: "poison" });
incomingImmunitySave.adventurer.raceId = "slime";
incomingImmunitySave.adventurer.name = "ぷるる";
incomingImmunitySave.adventurer.equipment.weapon = "rusty_knife";
incomingImmunitySave.dungeon.enemies = [poisonEnemy];
let persistedIncomingImmunitySave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(incomingImmunitySave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedIncomingImmunitySave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
const immuneHpBefore = Number(elements.get("#hpText").textContent);
elements.get("#waitButton").listeners.click();
Math.random = selfDestructOriginalRandom;
assert(persistedIncomingImmunitySave.adventurer.hp === immuneHpBefore, "incoming true immunity still took chip damage");
assert(persistedIncomingImmunitySave.log.some((line) => line.includes("合計0ダメージ")), "incoming immunity result was not reported as zero damage");

const outgoingImmunitySave = clone(corpseSave);
const slashImmuneEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(slashImmuneEnemy, { x: 11, y: 10, maxHp: 999, hp: 999, attack: 1, alive: true, turns: 0, telegraphed: false, resistances: { ...slashImmuneEnemy.resistances, slash: "immune" } });
outgoingImmunitySave.adventurer.equipment.weapon = "rusty_knife";
outgoingImmunitySave.dungeon.enemies = [slashImmuneEnemy];
let persistedOutgoingImmunitySave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(outgoingImmunitySave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedOutgoingImmunitySave = JSON.parse(value);
};
Math.random = function () { return 0; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = selfDestructOriginalRandom;
assert(persistedOutgoingImmunitySave.dungeon.enemies[0].hp === 999, "outgoing true immunity still took chip damage");

const legacyNoxDefeatedSave = clone(legacySave);
legacyNoxDefeatedSave.adventurer.deepestFloor = 100;
legacyNoxDefeatedSave.meta.uniqueKills = { dungeon_lord_nox: 1 };
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(legacyNoxDefeatedSave) : null;
};
localStorage.setItem = function () {};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "dungeon").listeners.click();
const legacyNoxDepthChoices = elements.get("#depthPickerList").innerHTML;
assert(legacyNoxDepthChoices.includes('data-start-floor="100"'), "legacy Nox kill did not unlock the B100 departure point");

const legacyB100ReachedSave = clone(legacySave);
legacyB100ReachedSave.adventurer.deepestFloor = 100;
legacyB100ReachedSave.meta.uniqueKills = {};
legacyB100ReachedSave.meta.titles = [];
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(legacyB100ReachedSave) : null;
};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "dungeon").listeners.click();
assert(!elements.get("#depthPickerList").innerHTML.includes('data-start-floor="100"'), "merely reaching B100 incorrectly unlocked its departure point");

const existingB100UnlockSave = clone(legacySave);
existingB100UnlockSave.meta.clearedBossFloors = [100, 100];
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(existingB100UnlockSave) : null;
};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "dungeon").listeners.click();
const existingB100DepthChoices = elements.get("#depthPickerList").innerHTML;
assert((existingB100DepthChoices.match(/data-start-floor="100"/g) || []).length === 1, "existing B100 departure point was duplicated");

const legacyUniqueCorpseSave = clone(corpseSave);
const legacyUniqueCorpse = clone(dungeonUniques[0]);
Object.assign(legacyUniqueCorpse, {
  x: 11, y: 10, maxHp: legacyUniqueCorpse.hp, hp: 0, alive: false, harvested: false,
  name: "旧ユニーク名", baseName: "旧基礎名", epithet: "旧異名",
});
if (legacyUniqueCorpse.dangerous) {
  legacyUniqueCorpse.dangerous.name = "旧危険技名";
  legacyUniqueCorpse.dangerous.telegraph = "旧ユニーク名が旧予告を構えた。";
}
delete legacyUniqueCorpse.harvestsTotal;
delete legacyUniqueCorpse.harvestsRemaining;
legacyUniqueCorpseSave.dungeon.enemies = [legacyUniqueCorpse];
let persistedLegacyUniqueCorpseSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(legacyUniqueCorpseSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedLegacyUniqueCorpseSave = JSON.parse(value);
};
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowLeft", preventDefault() {} });
const migratedUniqueCorpse = persistedLegacyUniqueCorpseSave.dungeon.enemies[0];
assert(migratedUniqueCorpse.harvestsRemaining >= 3 && migratedUniqueCorpse.harvestsRemaining <= 5, "legacy unique corpse did not migrate to 3-5 harvests");
assert(migratedUniqueCorpse.harvestsTotal === migratedUniqueCorpse.harvestsRemaining, "legacy unique corpse harvest total was not initialized consistently");
assert(migratedUniqueCorpse.harvested === false, "legacy unique corpse became exhausted during migration");
assert(migratedUniqueCorpse.name === dungeonUniques[0].name
  && migratedUniqueCorpse.baseName === dungeonUniques[0].baseName
  && migratedUniqueCorpse.epithet === dungeonUniques[0].epithet,
"saved unique corpse did not synchronize its renamed display identity");
assert(!migratedUniqueCorpse.dangerous || (migratedUniqueCorpse.dangerous.name === dungeonUniques[0].dangerous.name
  && migratedUniqueCorpse.dangerous.telegraph === dungeonUniques[0].dangerous.telegraph),
"saved unique corpse did not synchronize its renamed danger text");

const defeatedUniqueReloadSave = clone(corpseSave);
const defeatedUniqueReloadEnemy = clone(bountyFormulaTarget);
Object.assign(defeatedUniqueReloadEnemy, {
  x: 16, y: 16, maxHp: defeatedUniqueReloadEnemy.hp, hp: defeatedUniqueReloadEnemy.hp,
  alive: true, asleep: false, turns: 0, telegraphed: false, unique: true, floorGuardian: true,
});
defeatedUniqueReloadSave.meta.uniqueKills = { [defeatedUniqueReloadEnemy.id]: true };
defeatedUniqueReloadSave.dungeon.enemies = [defeatedUniqueReloadEnemy];
defeatedUniqueReloadSave.dungeon.stairs = [];
let persistedDefeatedUniqueReloadSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(defeatedUniqueReloadSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedDefeatedUniqueReloadSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
assert(!persistedDefeatedUniqueReloadSave.dungeon.enemies.some((enemy) => enemy.alive && enemy.id === defeatedUniqueReloadEnemy.id),
"a defeated dungeon unique survived save migration and reappeared alive");
assert(persistedDefeatedUniqueReloadSave.dungeon.guardianDefeated
  && persistedDefeatedUniqueReloadSave.dungeon.stairs.some((stairs) => stairs.x === 16 && stairs.y === 16),
"removing an already-defeated saved guardian left the floor without an exit");

const replacementSave = clone(legacySave);
replacementSave.meta.awaitingCreation = false;
replacementSave.meta.clearedBossFloors = [10, 20];
replacementSave.meta.bounties = { red_garm: { intel: true, claimed: 2 } };
replacementSave.meta.shop = { soldMaterials: { rat_tail: 4 }, inventory: ["iron_sword"] };
replacementSave.meta.titles = ["交代後も残る称号"];
replacementSave.meta.compendiumEquipmentUnlocked = true;
replacementSave.meta.donatedPermanentEquipmentIds = ["omniscient_archive"];
replacementSave.adventurer.ownedEquipment = replacementSave.adventurer.ownedEquipment.filter((id) => id !== "omniscient_archive");
replacementSave.adventurer.jobId = "capoeirista";
replacementSave.adventurer.inDungeon = false;
replacementSave.dungeon = null;
replacementSave.arena = clone(arenaReloadSave.arena);
let persistedReplacementSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(replacementSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedReplacementSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#newAdventurerButton").listeners.click();
elements.get("#confirmOk").listeners.click();
elements.get("#setupOk").listeners.click();
assert(persistedReplacementSave.meta.guildClaims.length === 0, "confirmSetup carried guild claims into the next adventurer");
assert(persistedReplacementSave.arena === null, "confirmSetup carried an arena run into the next adventurer");
assert(persistedReplacementSave.meta.clearedBossFloors.length === 0 && persistedReplacementSave.meta.bounties.red_garm.claimed === 0, "new adventurer retained per-life depth or bounty claims");
assert(Object.keys(persistedReplacementSave.meta.uniqueKills).length === 0 && !persistedReplacementSave.adventurer.gameCleared, "new adventurer inherited final-boss clearance or unique kills");
assert(persistedReplacementSave.meta.bounties.red_garm.intel && persistedReplacementSave.meta.shop.soldMaterials.rat_tail === 4 && persistedReplacementSave.meta.titles.includes("交代後も残る称号"), "new adventurer lost inherited knowledge or town progress");
assert(persistedReplacementSave.adventurer.equipment.weapon === null
  && persistedReplacementSave.adventurer.equipment.feet === "starter_capoeira_wraps",
"capoeirista did not begin weaponless with its starter wraps");
assert(persistedReplacementSave.adventurer.ownedEquipment.includes("omniscient_archive")
  && persistedReplacementSave.adventurer.donatedPermanentEquipmentIds.length === 0,
"a permanent reward donated by the previous adventurer remained suppressed for the next generation");

const deathLoopSave = clone(corpseSave);
deathLoopSave.adventurer.hp = 1;
const lethalEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(lethalEnemy, {
  x: 11, y: 10, maxHp: lethalEnemy.hp, alive: true, asleep: false, turns: 0,
  attack: 9999, specialAttack: null, dangerous: null,
});
const sleepingAfterDeathEnemy = clone(lethalEnemy);
Object.assign(sleepingAfterDeathEnemy, { x: 20, y: 20, attack: 1, asleep: true });
deathLoopSave.dungeon.enemies = [lethalEnemy, sleepingAfterDeathEnemy];
let persistedDeathLoopSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(deathLoopSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedDeathLoopSave = JSON.parse(value);
};
const deathLoopOriginalRandom = Math.random;
Math.random = function () { return 0; };
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
Math.random = deathLoopOriginalRandom;
assert(persistedDeathLoopSave.meta.pendingDeathReview?.reason, "enemy loop did not terminate cleanly after a lethal attack");

const deathClaimSave = clone(corpseSave);
deathClaimSave.meta.guildClaims = [{ id: "red_garm", name: "赤熱のガルム", reward: 400 }];
deathClaimSave.meta.clearedBossFloors = [10, 20];
deathClaimSave.meta.bounties = { red_garm: { intel: true, claimed: 3 } };
deathClaimSave.meta.shop = { soldMaterials: { small_beast_meat: 9 }, inventory: ["iron_sword"] };
deathClaimSave.meta.titles = ["引継ぎ称号"];
deathClaimSave.meta.research = {
  red_garm: { seen: true, level: 5, evidence: 320 },
  cave_rat: { seen: true, level: 5, evidence: 320 },
};
deathClaimSave.meta.monsterHearts = {};
deathClaimSave.meta.monsterHeartClaims = { red_garm: true, cave_rat: true };
deathClaimSave.adventurer.gold = 321;
deathClaimSave.adventurer.guildPoints = 12;
deathClaimSave.adventurer.equipmentEnhancements = { rusty_knife: { level: 3, total: 9, attributes: { fire: 3 } } };
deathClaimSave.adventurer.hp = 1;
deathClaimSave.dungeon.enemies = [];
deathClaimSave.dungeon.chests = [];
deathClaimSave.dungeon.traps = [{ x: 11, y: 10, type: "damage", discovered: false, triggered: false }];
let persistedDeathClaimSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(deathClaimSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedDeathClaimSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#titleScreen").classList.add("hidden");
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
assert(persistedDeathClaimSave.meta.guildClaims.length === 0, "death carried guild claims into the next adventurer");
assert(persistedDeathClaimSave.meta.clearedBossFloors.length === 0, "death retained cleared boss-floor departure points");
assert(Object.keys(persistedDeathClaimSave.meta.bounties).length === 0, "death retained bounty information");
assert(Object.keys(persistedDeathClaimSave.meta.shop.soldMaterials).length === 0 && persistedDeathClaimSave.meta.titles.length === 0, "death retained town circulation or titles");
assert(Number(persistedDeathClaimSave.meta.research.red_garm?.level || 0) === 0
  && persistedDeathClaimSave.meta.research.cave_rat.level === 5,
"death did not reset unique research while preserving ordinary-monster research");
assert(!persistedDeathClaimSave.meta.monsterHearts.red_garm
  && !persistedDeathClaimSave.meta.monsterHeartClaims.red_garm
  && persistedDeathClaimSave.meta.monsterHearts.cave_rat === 1
  && persistedDeathClaimSave.meta.monsterHeartClaims.cave_rat,
"death restored a unique heart or failed to restore an ordinary-monster heart");
assert(Object.keys(persistedDeathClaimSave.adventurer.equipmentEnhancements).length === 0, "death retained equipment heart enhancements");
assert(persistedDeathClaimSave.adventurer.gold === 0 && persistedDeathClaimSave.adventurer.guildPoints === 0, "death retained adventurer currency");
assert(persistedDeathClaimSave.meta.deaths > 0 && persistedDeathClaimSave.meta.deathLog.length > 0, "death erased its own history record");
assert(persistedDeathClaimSave.meta.awaitingCreation, "death did not return to adventurer creation");
assert(persistedDeathClaimSave.meta.pendingDeathReview?.reason, "death review was not persisted");
assert(persistedDeathClaimSave.meta.pendingDeathReview.log.some((line) => line.includes("冒険者は失われた")), "persisted death review is missing the final log");
const deathTimeout = scheduledTimeouts.slice().reverse().find((entry) => entry.delay === 2900);
assert(deathTimeout, "death review timer was not scheduled");
deathTimeout.callback();
assert(elements.get("#titleScreen").classList.contains("hidden"), "death automatically returned to the title screen");
assert(!elements.get("#deathReviewPanel").classList.contains("hidden"), "death log review did not open");
assert(elements.get("#deathReviewLog").innerHTML.includes("冒険者は失われた"), "death review is missing the final log");

elements.get("#deathReviewPanel").classList.add("hidden");
elements.get("#titleScreen").classList.remove("hidden");
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(persistedDeathClaimSave) : null;
};
eval(read("js/main.js"));
assert(elements.get("#titleScreen").classList.contains("hidden"), "reloaded pending death review exposed the title screen");
assert(!elements.get("#deathReviewPanel").classList.contains("hidden"), "pending death review was not restored after reload");
assert(elements.get("#deathReviewLog").innerHTML.includes("冒険者は失われた"), "restored death review lost its saved log snapshot");
elements.get("#continueAfterDeathButton").listeners.click();
assert(!elements.get("#titleScreen").classList.contains("hidden"), "manual death continuation did not open the title screen");
assert(persistedDeathClaimSave.meta.pendingDeathReview === null, "manual death continuation did not clear the persisted review");

elements.get("#deathReviewPanel").classList.add("hidden");
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(persistedDeathClaimSave) : null;
};
eval(read("js/main.js"));
assert(elements.get("#deathReviewPanel").classList.contains("hidden"), "cleared death review returned after another reload");

const chestSave = clone(corpseSave);
chestSave.adventurer.materials = {};
chestSave.adventurer.items = {};
chestSave.dungeon.enemies = [];
chestSave.dungeon.chests = [{ x: 11, y: 10, opened: false }];
let persistedChestSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(chestSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedChestSave = JSON.parse(value);
};
const originalRandom = Math.random;
const chestRolls = [0.5, 0.1, 0.5];
Math.random = function () { return chestRolls.length ? chestRolls.shift() : 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
assert(Object.keys(persistedChestSave.adventurer.materials).length === 0, "chest still granted monster material");
assert(Object.keys(persistedChestSave.adventurer.items).some((id) => id.startsWith("spellbook_")), "forced spellbook chest did not grant a spellbook");
assert(persistedChestSave.dungeon.chests[0].opened, "chest was not marked opened");

const outOfDepthSpellbookSave = clone(chestSave);
outOfDepthSpellbookSave.dungeon.chests = [{ x: 11, y: 10, opened: false }];
let persistedOutOfDepthSpellbookSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(outOfDepthSpellbookSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedOutOfDepthSpellbookSave = JSON.parse(value);
};
const outOfDepthSpellbookRolls = [0.5, 0.00005, 0.5];
Math.random = function () { return outOfDepthSpellbookRolls.length ? outOfDepthSpellbookRolls.shift() : 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
const earlySpellbookId = Object.keys(persistedOutOfDepthSpellbookSave.adventurer.items)
  .find((id) => id.startsWith("spellbook_") && Number(window.HD_DATA.treasureItems.find((item) => item.id === id)?.minFloor || 1) > outOfDepthSpellbookSave.adventurer.floor);
assert(earlySpellbookId && persistedOutOfDepthSpellbookSave.log.some((line) => line.includes("ごくごく稀")),
"the very rare roll did not grant and announce an out-of-depth spellbook");

const phaseResearchSave = clone(chestSave);
phaseResearchSave.meta.researchSchemaVersion = 2;
phaseResearchSave.meta.research.spirit_1 = { seen: true, level: 1, evidence: 1, milestones: {} };
phaseResearchSave.dungeon.chests = [];
const phaseResearchEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "spirit_1"));
Object.assign(phaseResearchEnemy, {
  x: 11, y: 10, maxHp: phaseResearchEnemy.hp, hp: phaseResearchEnemy.hp, alive: true,
  turns: 0, telegraphed: false, canPhaseWalls: true,
});
phaseResearchSave.dungeon.enemies = [phaseResearchEnemy];
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(phaseResearchSave) : null;
};
localStorage.setItem = function () {};
eval(read("js/main.js"));
elements.get("#map").listeners.click({ target: { closest() { return { dataset: { enemyX: "11", enemyY: "10" } }; } } });
const phaseLevelOneHtml = elements.get("#monsterInfoContent").innerHTML;
assert(!phaseLevelOneHtml.includes("<span>特性</span><strong>壁抜け</strong>"), "wall phasing leaked in live monster details at research level one");

const phaseResearchLevelTwoSave = clone(phaseResearchSave);
phaseResearchLevelTwoSave.meta.research.spirit_1 = { seen: true, level: 2, evidence: 30, milestones: {} };
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(phaseResearchLevelTwoSave) : null;
};
eval(read("js/main.js"));
elements.get("#map").listeners.click({ target: { closest() { return { dataset: { enemyX: "11", enemyY: "10" } }; } } });
assert(elements.get("#monsterInfoContent").innerHTML.includes("<span>特性</span><strong>壁抜け</strong>"), "wall phasing was not disclosed in live monster details at research level two");

const goldenChestSave = clone(chestSave);
goldenChestSave.dungeon.anomaly = { id: "gold", name: "黄金墓" };
let persistedGoldenChestSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(goldenChestSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedGoldenChestSave = JSON.parse(value);
};
const goldenChestRolls = [0.5, 0.1, 0.5];
Math.random = function () { return goldenChestRolls.length ? goldenChestRolls.shift() : 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
assert(Object.values(persistedGoldenChestSave.adventurer.items).reduce((sum, count) => sum + count, 0) === 1, "golden anomaly still doubled spellbooks or junk inside each chest");

const artifactChestSave = clone(chestSave);
let persistedArtifactChestSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(artifactChestSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArtifactChestSave = JSON.parse(value);
};
const artifactRolls = [0.006, 0.5];
Math.random = function () { return artifactRolls.length ? artifactRolls.shift() : 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
assert(persistedArtifactChestSave.adventurer.ownedEquipment.length === artifactChestSave.adventurer.ownedEquipment.length + 1, "artifact chest did not grant unique equipment");
assert(persistedArtifactChestSave.log.some((line) => line.includes("★")), "artifact acquisition did not show a star marker");

const vaultArtifactSave = clone(chestSave);
vaultArtifactSave.adventurer.floor = 50;
vaultArtifactSave.adventurer.deepestFloor = 50;
vaultArtifactSave.dungeon.chests[0].treasureVault = true;
let persistedVaultArtifactSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(vaultArtifactSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedVaultArtifactSave = JSON.parse(value);
};
const vaultArtifactRolls = [0.03, 0.5];
Math.random = function () { return vaultArtifactRolls.length ? vaultArtifactRolls.shift() : 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
assert(persistedVaultArtifactSave.adventurer.ownedEquipment.length === vaultArtifactSave.adventurer.ownedEquipment.length + 1, "treasure-vault fixed artifact rate was not raised to five percent");

const randomArtifactSave = clone(chestSave);
randomArtifactSave.adventurer.floor = 100;
randomArtifactSave.adventurer.deepestFloor = 100;
randomArtifactSave.adventurer.randomArtifacts = {};
randomArtifactSave.meta.randomArtifactSerial = 0;
let persistedRandomArtifactSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(randomArtifactSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedRandomArtifactSave = JSON.parse(value);
};
const randomArtifactRolls = [0.5, 0];
Math.random = function () { return randomArtifactRolls.length ? randomArtifactRolls.shift() : 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
const generatedArtifactId = Object.keys(persistedRandomArtifactSave.adventurer.randomArtifacts)[0];
const savedGeneratedArtifact = persistedRandomArtifactSave.adventurer.randomArtifacts[generatedArtifactId];
assert(generatedArtifactId?.startsWith("random_artifact_") && persistedRandomArtifactSave.adventurer.ownedEquipment.includes(generatedArtifactId), "ultra-rare random artifact was not granted");
assert(savedGeneratedArtifact.artifact.random && savedGeneratedArtifact.artifact.depth === 100, "random artifact depth/identity was not persisted");
assert(persistedRandomArtifactSave.log.some((line) => line.includes("☆")), "random artifact did not use the white star mark");
assert(!persistedRandomArtifactSave.adventurer.discoveredArtifacts.includes(generatedArtifactId), "random artifact polluted the fixed-artifact discovery history");

const randomArtifactReloadSave = clone(persistedRandomArtifactSave);
randomArtifactReloadSave.adventurer.inDungeon = false;
randomArtifactReloadSave.dungeon = null;
const randomArtifactGuildPoints = randomArtifactReloadSave.adventurer.guildPoints;
let persistedRandomArtifactDonation = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(randomArtifactReloadSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedRandomArtifactDonation = JSON.parse(value);
};
eval(read("js/main.js"));
assert(elements.get("#homeView").innerHTML.includes(`☆${savedGeneratedArtifact.name}`), "reloaded random artifact is missing from home storage");
viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
elements.get(`dynamic:donate:${generatedArtifactId}`).listeners.click();
elements.get("#confirmOk").listeners.click();
assert(!persistedRandomArtifactDonation.adventurer.ownedEquipment.includes(generatedArtifactId), "donated random artifact remained owned");
assert(!persistedRandomArtifactDonation.adventurer.randomArtifacts[generatedArtifactId], "donated random artifact definition was not removed");
assert(persistedRandomArtifactDonation.adventurer.guildPoints > randomArtifactGuildPoints, "random artifact donation granted no guild points");

const donatedArtifactId = "artifact_invisible_emperor_cloak";
const artifactDonationSave = clone(legacySave);
artifactDonationSave.meta.awaitingCreation = false;
artifactDonationSave.meta.guildClaims = [];
artifactDonationSave.adventurer.inDungeon = false;
artifactDonationSave.adventurer.equipment = { weapon: "rusty_knife", upper: "cloth", lower: null, feet: null, accessory1: null, accessory2: null };
artifactDonationSave.adventurer.ownedEquipment = ["rusty_knife", "cloth", donatedArtifactId];
delete artifactDonationSave.adventurer.discoveredArtifacts;
artifactDonationSave.dungeon = null;
artifactDonationSave.arena = null;
let persistedArtifactDonationSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(artifactDonationSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArtifactDonationSave = JSON.parse(value);
};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
elements.get(`dynamic:donate:${donatedArtifactId}`).listeners.click();
elements.get("#confirmOk").listeners.click();
assert(!persistedArtifactDonationSave.adventurer.ownedEquipment.includes(donatedArtifactId), "donated artifact remained owned");
assert(persistedArtifactDonationSave.adventurer.discoveredArtifacts.includes(donatedArtifactId), "donated artifact was removed from discovery history");

const artifactRedropSave = clone(persistedArtifactDonationSave);
artifactRedropSave.adventurer.inDungeon = true;
artifactRedropSave.adventurer.floor = 1;
artifactRedropSave.dungeon = {
  map: corpseMap, rooms: [], player: { x: 10, y: 10 }, stairs: [], enemies: [],
  chests: [{ x: 11, y: 10, opened: false }], traps: [], turnsElapsed: 0, actionProgress: 0, uniqueSpawned: false,
};
let persistedArtifactRedropSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(artifactRedropSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedArtifactRedropSave = JSON.parse(value);
};
const artifactRedropRolls = [0.001, 0];
Math.random = function () { return artifactRedropRolls.length ? artifactRedropRolls.shift() : 0.5; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
const redroppedArtifactIds = persistedArtifactRedropSave.adventurer.ownedEquipment.filter((id) => window.HD_DATA.equipment.find((item) => item.id === id)?.artifact);
assert(!persistedArtifactRedropSave.adventurer.ownedEquipment.includes(donatedArtifactId), "donated artifact became a chest candidate again");
assert(redroppedArtifactIds.length === 1 && redroppedArtifactIds[0] !== donatedArtifactId, "artifact discovery history did not advance to a different chest candidate");
assert(persistedArtifactRedropSave.adventurer.discoveredArtifacts.filter((id) => id === donatedArtifactId).length === 1, "donated artifact discovery history was duplicated or lost");

const uniqueChestSave = clone(chestSave);
uniqueChestSave.adventurer.floor = 2;
uniqueChestSave.dungeon.timeStopTurns = 1;
let persistedUniqueChestSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(uniqueChestSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedUniqueChestSave = JSON.parse(value);
};
Math.random = function () { return 0.001; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
assert(persistedUniqueChestSave.dungeon.enemies.some((enemy) => enemy.unique && enemy.chestAmbush), "rare unique chest ambush did not spawn");

const defeatedUniqueChestSave = clone(uniqueChestSave);
const defeatedFloorUniqueIds = window.HD_DATA.floors.find((floor) => floor.floor === defeatedUniqueChestSave.adventurer.floor).uniques;
defeatedUniqueChestSave.meta.uniqueKills = Object.fromEntries(defeatedFloorUniqueIds.map((id) => [id, true]));
defeatedUniqueChestSave.dungeon.enemies = [];
defeatedUniqueChestSave.dungeon.chests = [{ x: 11, y: 10, opened: false }];
let persistedDefeatedUniqueChestSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(defeatedUniqueChestSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedDefeatedUniqueChestSave = JSON.parse(value);
};
Math.random = function () { return 0.001; };
eval(read("js/main.js"));
document.listeners.keydown({ key: "ArrowRight", preventDefault() {} });
Math.random = originalRandom;
assert(!persistedDefeatedUniqueChestSave.dungeon.enemies.some((enemy) => defeatedFloorUniqueIds.includes(enemy.id)),
"a defeated dungeon unique returned through a chest ambush");

const rangedSave = clone(chestSave);
rangedSave.adventurer.jobId = "archer";
rangedSave.dungeon.chests = [];
const rangedEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "cave_rat"));
Object.assign(rangedEnemy, { x: 13, y: 10, maxHp: rangedEnemy.hp, hp: 1, alive: true, turns: 0, telegraphed: false });
rangedSave.dungeon.enemies = [rangedEnemy];
let persistedRangedSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(rangedSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedRangedSave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#map").listeners.click({ target: { closest() { return { dataset: { enemyX: "13", enemyY: "10" } }; } } });
Math.random = originalRandom;
assert(persistedRangedSave.log.some((line) => line.includes("遠隔攻撃を放った")), "enemy tap did not perform direct ranged attack");
assert(persistedRangedSave.adventurer.lastAttack.attributes.length >= 2, "multi-attribute equipment was reduced to one combat attribute");
assert(!persistedRangedSave.dungeon.enemies[0].alive && persistedRangedSave.dungeon.turnsElapsed === 1, "a killing ranged attack did not consume an action");

const uniqueResearchKillSave = clone(rangedSave);
const uniqueResearchTarget = clone(bountyFormulaTarget);
Object.assign(uniqueResearchTarget, {
  x: 13, y: 10, maxHp: uniqueResearchTarget.hp, hp: 1, alive: true, asleep: false,
  turns: 0, telegraphed: false, unique: true,
});
uniqueResearchKillSave.adventurer.level = 100;
uniqueResearchKillSave.adventurer.experience = 0;
uniqueResearchKillSave.adventurer.jobProgress = { archer: { level: 100, experience: 0 } };
uniqueResearchKillSave.meta.researchSchemaVersion = 2;
uniqueResearchKillSave.meta.research[uniqueResearchTarget.id] = { seen: true, level: 1, evidence: 1, milestones: { 1: true } };
uniqueResearchKillSave.meta.uniqueKills = {};
uniqueResearchKillSave.meta.monsterHearts = {};
uniqueResearchKillSave.meta.monsterHeartClaims = {};
uniqueResearchKillSave.dungeon.enemies = [uniqueResearchTarget];
let persistedUniqueResearchKillSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(uniqueResearchKillSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedUniqueResearchKillSave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#map").listeners.click({ target: { closest() { return { dataset: { enemyX: "13", enemyY: "10" } }; } } });
Math.random = originalRandom;
assert(persistedUniqueResearchKillSave.meta.uniqueKills[uniqueResearchTarget.id]
  && persistedUniqueResearchKillSave.meta.research[uniqueResearchTarget.id].level === 5
  && persistedUniqueResearchKillSave.meta.research[uniqueResearchTarget.id].evidence === 320,
"defeating a dungeon unique did not record the one-time kill and force research to maximum");
assert(persistedUniqueResearchKillSave.meta.monsterHearts[uniqueResearchTarget.id] === 1
  && persistedUniqueResearchKillSave.meta.monsterHeartClaims[uniqueResearchTarget.id],
"maximum research from a unique defeat did not grant its heart");

const jobSkillSave = clone(chestSave);
jobSkillSave.adventurer.jobId = "hunter";
jobSkillSave.adventurer.equipment.weapon = "rusty_knife";
jobSkillSave.dungeon.chests = [];
const preciseEnemy = clone(window.HD_DATA.monsters.find((monster) => monster.id === "carapace_rat"));
Object.assign(preciseEnemy, { x: 13, y: 10, maxHp: preciseEnemy.hp, hp: 1, alive: true, turns: 0, telegraphed: false });
jobSkillSave.dungeon.enemies = [preciseEnemy];
let persistedJobSkillSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(jobSkillSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedJobSkillSave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#jobSkillButton").listeners.click();
elements.get("#map").listeners.click({ target: { closest() { return { dataset: { enemyX: "13", enemyY: "10" } }; } } });
Math.random = originalRandom;
assert(persistedJobSkillSave.adventurer.lastAttack.skill === "precise", "dungeon job skill did not enter combat");
assert(persistedJobSkillSave.dungeon.enemies[0].lootMaterialId === "fine_pelt", "carapace-rat hand-authored precise loot was overwritten");
assert(persistedJobSkillSave.dungeon.turnsElapsed === 1, "a killing job skill did not consume an action");

const spellCastSave = clone(rangedSave);
spellCastSave.adventurer.jobId = "mage";
spellCastSave.adventurer.learnedSpells = ["ember_shot"];
spellCastSave.adventurer.activeSpellId = "ember_shot";
let persistedSpellCastSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(spellCastSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedSpellCastSave = JSON.parse(value);
};
Math.random = function () { return 0.5; };
eval(read("js/main.js"));
elements.get("#activeSpellButton").listeners.click();
elements.get("#map").listeners.click({ target: { closest() { return { dataset: { enemyX: "13", enemyY: "10" } }; } } });
Math.random = originalRandom;
assert(persistedSpellCastSave.adventurer.lastAttack.skill === "spell:ember_shot", "learned spell was not usable in dungeon combat");
assert(!persistedSpellCastSave.dungeon.enemies[0].alive && persistedSpellCastSave.dungeon.turnsElapsed === 1, "a killing spell did not consume an action");

const lowCurseSave = clone(legacySave);
lowCurseSave.meta.awaitingCreation = false;
lowCurseSave.meta.guildClaims = [];
lowCurseSave.adventurer.inDungeon = false;
lowCurseSave.adventurer.equipment.accessory1 = null;
lowCurseSave.dungeon = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(lowCurseSave) : null;
};
localStorage.setItem = function () {};
eval(read("js/main.js"));
const lowCurseMaxHp = Number(elements.get("#maxHpText").textContent);
const highCurseSave = clone(lowCurseSave);
highCurseSave.adventurer.ownedEquipment.push("artifact_zero_crown");
highCurseSave.adventurer.equipment.accessory1 = "artifact_zero_crown";
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(highCurseSave) : null;
};
eval(read("js/main.js"));
const highCurseMaxHp = Number(elements.get("#maxHpText").textContent);
assert(highCurseMaxHp > lowCurseMaxHp, "strong curse resistance did not reduce artifact curse penalties");

const resistanceOrderSave = clone(lowCurseSave);
resistanceOrderSave.adventurer.raceId = "angel";
resistanceOrderSave.adventurer.jobId = "swordsman";
resistanceOrderSave.adventurer.ownedEquipment.push("guild_comet_blade", "guild_void_talisman");
resistanceOrderSave.adventurer.equipment.weapon = "guild_comet_blade";
resistanceOrderSave.adventurer.equipment.accessory1 = "guild_void_talisman";
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(resistanceOrderSave) : null;
};
localStorage.setItem = function () {};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "home").listeners.click();
assert(elements.get("#homeView").innerHTML.includes("<span>光</span><strong>4</strong>"), "resistance stacking was clamped before all positive and negative sources were summed");

const drainingCurseSave = clone(corpseSave);
drainingCurseSave.adventurer.hp = 20;
drainingCurseSave.adventurer.equipment.weapon = "rusty_knife";
drainingCurseSave.adventurer.equipment.accessory1 = "artifact_endless_alarm";
drainingCurseSave.adventurer.ownedEquipment.push("artifact_endless_alarm");
drainingCurseSave.dungeon.enemies = [];
let persistedDrainingCurseSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(drainingCurseSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedDrainingCurseSave = JSON.parse(value);
};
eval(read("js/main.js"));
elements.get("#waitButton").listeners.click();
assert(persistedDrainingCurseSave.adventurer.hp < 20, "negative cursed regeneration did not drain HP");
assert(persistedDrainingCurseSave.log.some((line) => line.includes("呪われた装備が生命力を吸い")), "cursed HP drain was silent");

const lewdSynergySave = clone(lowCurseSave);
lewdSynergySave.adventurer.personalityId = "lewd";
lewdSynergySave.adventurer.equipment.upper = "artifact_invisible_emperor_cloak";
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(lewdSynergySave) : null;
};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "home").listeners.click();
assert(elements.get("#homeView").innerHTML.includes("すけべ共鳴・真艶覚醒：艶装備1個"), "lewd/risque equipment synergy is not shown at home");

const gokuSave = clone(lowCurseSave);
gokuSave.adventurer.name = "孫悟空";
gokuSave.adventurer.ownedEquipment.push("artifact_power_pole");
gokuSave.adventurer.equipment.weapon = "artifact_power_pole";
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(gokuSave) : null;
};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "home").listeners.click();
assert(Number(elements.get("#maxHpText").textContent) > 300, "Son Goku/Power Pole max HP awakening is too small");
assert(elements.get("#homeView").innerHTML.includes("★如意棒：真価解放中"), "Son Goku/Power Pole awakening is not shown at home");

const weakSlimeSave = clone(lowCurseSave);
weakSlimeSave.adventurer.raceId = "slime";
weakSlimeSave.adventurer.name = "ぷるる";
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(weakSlimeSave) : null;
};
eval(read("js/main.js"));
const weakSlimeStrength = Number(elements.get("#strengthText").textContent);
const rimuruSlimeSave = clone(weakSlimeSave);
rimuruSlimeSave.adventurer.name = "リムル";
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(rimuruSlimeSave) : null;
};
eval(read("js/main.js"));
viewTabs.find((tab) => tab.dataset.view === "home").listeners.click();
assert(Number(elements.get("#strengthText").textContent) >= weakSlimeStrength + 150, "Rimuru slime did not receive the strongest stat awakening");
assert(Number(elements.get("#maxHpText").textContent) > 1000 && Number(elements.get("#accelerationText").textContent) > 100, "Rimuru slime HP/acceleration awakening is too small");
assert(elements.get("#homeView").innerHTML.includes("魔王覚醒・最強化中"), "Rimuru slime awakening is not shown at home");

const cappedScavengerSave = clone(lowCurseSave);
cappedScavengerSave.adventurer.jobId = "scavenger";
cappedScavengerSave.adventurer.scavengerNutrition = 1600;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(cappedScavengerSave) : null;
};
localStorage.setItem = function () {};
eval(read("js/main.js"));
const cappedScavengerStats = ["#strengthText", "#maxHpText", "#accelerationText"].map((selector) => Number(elements.get(selector).textContent));
const overfedScavengerSave = clone(cappedScavengerSave);
overfedScavengerSave.adventurer.scavengerNutrition = 6400;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(overfedScavengerSave) : null;
};
eval(read("js/main.js"));
const overfedScavengerStats = ["#strengthText", "#maxHpText", "#accelerationText"].map((selector) => Number(elements.get(selector).textContent));
assert(cappedScavengerStats.every((value, index) => value === overfedScavengerStats[index]), "scavenger growth continued above effective nutrition 1600");

const completeSave = clone(legacySave);
completeSave.meta.researchSchemaVersion = 2;
completeSave.meta.awaitingCreation = false;
completeSave.meta.research = Object.fromEntries(window.HD_DATA.monsters.map((monster) => [monster.id, { seen: true, level: 5 }]));
let persistedCompleteSave = null;
localStorage.getItem = function (key) {
  return key === "hagitori-dungeon-save-v1" ? JSON.stringify(completeSave) : null;
};
localStorage.setItem = function (key, value) {
  if (key === "hagitori-dungeon-save-v1") persistedCompleteSave = JSON.parse(value);
};

eval(read("js/main.js"));
assert(persistedCompleteSave?.meta?.compendiumEquipmentUnlocked, "complete compendium reward flag was not saved");
assert(persistedCompleteSave.meta.titles.includes("万象の記録者"), "complete compendium title was not awarded");
assert(persistedCompleteSave.adventurer.ownedEquipment.includes("omniscient_archive"), "complete compendium equipment was not awarded");
viewTabs.find((tab) => tab.dataset.view === "research").listeners.click();
assert(elements.get("#researchView").innerHTML.includes("793 / 793"), "complete compendium progress is not shown");
assert(elements.get("#researchView").innerHTML.includes("報酬受領済み"), "complete compendium reward status is not shown");
viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
assert(elements.get("#guildView").innerHTML.includes('data-guild-donate="omniscient_archive"'), "unequipped permanent reward was not offered for GP donation");
const compendiumDonationPointsBefore = persistedCompleteSave.adventurer.guildPoints;
elements.get("dynamic:donate:omniscient_archive").listeners.click();
elements.get("#confirmOk").listeners.click();
assert(!persistedCompleteSave.adventurer.ownedEquipment.includes("omniscient_archive")
  && persistedCompleteSave.adventurer.guildPoints > compendiumDonationPointsBefore
  && persistedCompleteSave.adventurer.donatedPermanentEquipmentIds.includes("omniscient_archive"),
"permanent reward donation did not grant GP, remove the item, and suppress reissue");
viewTabs.find((tab) => tab.dataset.view === "research").listeners.click();
viewTabs.find((tab) => tab.dataset.view === "guild").listeners.click();
assert(!persistedCompleteSave.adventurer.ownedEquipment.includes("omniscient_archive"), "donated permanent reward was automatically reissued");

`smoke test: ok / equipment roles ${JSON.stringify(equipmentRoleCounts)}`;
