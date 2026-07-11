# データ形式

このプロトタイプは `data/*.js` に定義したデータを `window.HD_DATA` へ登録して読み込む。通常のWebサーバーやWordPress配下に置きやすくするため、現段階ではES Modulesではなく通常のscriptタグで読み込む。

## 属性

全属性は `data/materials.js` の `ATTRIBUTES` に配列で定義する。

```js
["light", "dark", "fire", "water", "earth", "wind", "thunder", "poison", "ice", "curse", "acid", "slash", "blunt", "illusion", "steel"]
```

耐性値は数値 `0` から `5`、または文字列 `"immune"` を使う。倍率は以下。

```js
{ 0: 1, 1: 0.75, 2: 0.5, 3: 0.25, 4: 0.1, 5: 0.01, immune: 0 }
```

## 職業

`data/jobs.js` の `jobs` に配列で定義する。

```js
{
  id: "swordsman",
  name: "戦士",
  hp: 40,
  attack: 6,
  defense: 2,
  baseAttackAttribute: "slash",
  stats: { strength: 3, speed: 0, dexterity: 0, durability: 2, luck: 0 },
  combat: { attackTrials: 5, attackMin: 4, attackMax: 12, accuracy: 0.74, evasion: 0.03, crit: 0.06 },
  skill: {
    id: "sever",
    name: "切断撃",
    attribute: "slash",
    power: 1.45,
    tag: "sever"
  },
  description: "手数が多く、安定した近接戦ができる前衛職。"
}
```

現行は15職。`ninja` は `acceleration: 30` と `accelerationGrowthEvery: 3` を持つ最強格高速職で、`hunter`（表示名「盗賊」）は睡眠中の敵に3倍の寝込み襲撃を行う。`capoeirista` はカポエラ状態中に8方向の入力を反転し、通常攻撃を威力1.8倍の打属性足技へ変える。

## 種族

`data/races.js` の `races` に、五能力、加速度、耐性、透明視認などを定義する。現行は30種族。能力値・加速度・耐性から `powerRating` と `experienceMultiplier` を算出し、強い種族ほど職業レベルの必要経験値が増える。`high_elf` は `elf`、`superhuman` は `human` の意図的な完全上位で、`slime` は能力値合計と加速度が最低の最弱種族である。`slime` と名前 `リムル` の組み合わせによる最強化は、保存データを変形せず `getPlayerStats()` の派生補正として適用する。

## モンスター

`data/monsters.js` の `monsters` に配列で定義する。

```js
{
  id: "carapace_rat",
  name: "甲殻ネズミ",
  floors: [1, 2, 3],
  hp: 18,
  attack: 5,
  defense: 2,
  attackAttribute: "blunt",
  weaknesses: ["blunt"],
  resistances: { slash: 1 },
  dangerous: null,
  loot: [
    { condition: "default", material: "small_beast_meat" },
    { condition: { lastAttribute: "slash" }, material: "clean_pelt" },
    { condition: { lastAttribute: "blunt" }, material: "broken_carapace" },
    { condition: { lastAttribute: "fire" }, material: "scorched_hide" },
    { condition: { lastSkill: "precise" }, material: "fine_pelt" }
  ],
  research: {
    1: "目撃情報と基礎的な特徴。",
    2: "攻撃・防御・加速度などの基礎能力。",
    3: "弱点、耐性、危険行動。",
    4: "剥ぎ取れる素材候補。",
    5: "素材変化を含む正確な剥ぎ取り条件。"
  }
}
```

調査度は0が未解析、1から5が判明段階で、5が完全解析（MAX）。モンスター生成後に全個体の1〜5を揃える。

調査度1以上のUIでは `monster.hp` を「基礎最大HP」として開示する。敵インスタンスの `maxHp` は守護者補正や異変で増減するため、図鑑値とは別に扱う。

通常種の一部は、任意の `rewardProfile` で「剥ぎ取りがおいしい個体」または「経験値がおいしい個体」にできる。

```js
rewardProfile: {
  tag: "harvest-rich",       // または "exp-rich"
  harvestRolls: [2, 2],
  harvestQuantity: 2,
  experienceMultiplier: 1
}
```

撃破後の敵インスタンスには `harvestsTotal` と `harvestsRemaining` を保存する。通常個体は1〜2回、ユニーク個体は3〜5回を撃破時に抽選する。これらはセーブ安定性のための内部値であり、UIには合計回数も残り回数も表示しない。表示は「まだ剥ぎ取れそうだ」「取り尽くした」のみとする。

生存中の敵インスタンスは任意の `asleep: true` を持つ。通常生成14%、ユニーク5%で付与し、睡眠中はAI行動を停止する。攻撃時に解除し、盗賊の初撃だけ命中・会心補正と最終ダメージ3倍を適用する。守護者、闘技場敵、宝箱奇襲、召喚個体、スリル部屋守護者は生成後に `asleep: false` へ固定する。

ユニーク個体は `unique: true` を持つ。ダンジョン個体は `floors`、闘技場限定個体は `arenaOnly: true` と連続した `arenaRank` を持つ。手作り人格を追加する場合は、台詞本体ではなく次の設定だけをデータへ置く。

一部のダンジョンユニークは `summon: { every: 6, count: 1, maxAlive: 2, maxTotal: 4, pool: "floor_attribute" }` を持つ。召喚個体には召喚主ID、経験値0.25倍、剥ぎ取り1回固定を保存し、同時数・累計数・階層の生成上限を全て守る。

金品盗賊8種は `rareSpawn: true`、`specialAttack: "gold_steal"`、`goldTheft: { rate, flat, max, escapeDistance }` を持つ。通常の `monsterPool` から除外し、階層の `rareMonsterPool` から最大1体だけ抽選する。敵インスタンスの `stolenGold` と `hasStolenGold` を保存し、討伐時に全額返還する。

```js
{
  dialogueProfile: "artisan",
  dialogueDesire: "完成させたい目的",
  dialogueKeepsake: "手放せない遺品",
  dialogueSecret: "本人だけの秘密"
}
```

実際の台詞候補は `js/unique-dialogue.js` がモンスターIDから参照できる静的表として構築する。敵インスタンスとセーブデータへ台詞全文を複製しない。

危険技は以下。

```js
dangerous: {
  every: 3,
  telegraph: "火喰い蜥蜴が大きく息を吸い込んだ。",
  name: "火炎放射",
  attribute: "fire",
  power: 16
}
```

## 素材

`data/materials.js` の `materials` に配列で定義する。

```js
{
  id: "cool_fire_gland",
  name: "冷却された火腺",
  description: "水属性で火蜥蜴を仕留めた時に得られる火器官。"
}
```

所持数は `state.adventurer.materials[materialId] = count` で管理する。

## 装備

`data/equipment.js` の `equipment` に配列で定義する。

```js
{
  id: "artifact_steam_twinblade",
  name: "蒸界の双相剣",
  slot: "weapon",
  attack: 24,
  defense: 3,
  attributeAttack: "fire",             // 旧形式との互換用先頭属性
  attackAttributes: ["fire", "water"],
  resistances: { fire: 3, water: 3 },
  jobs: allJobs,
  recipe: null,
  artifact: {
    tier: "useful",
    label: "使えるアーティファクト",
    guildPoints: 58,
    chestOnly: true
  },
  curse: {
    id: "boiling_blood",
    name: "沸血",
    severity: 2,
    penalties: { maxHp: -10 },
    description: "火と水が交わるたび、使い手の血も熱を帯びる。"
  },
  description: "火と水の刃を同時に保つ名剣。"
}
```

`slot` は `weapon`、`upper`、`lower`、`feet`、`accessory` のいずれか。`attackAttributes` は0個以上の攻撃属性を持てる配列で、複数ある場合は攻撃対象へ最も有効な属性のダメージを採用する。全装備に配列形式を正規化し、旧 `attributeAttack` は先頭属性として互換維持する。

流通装備の任意フィールド `shopMinFloor` は、その装備が素材売却によって入荷できる最小到達階層を示す。派生等級1・2は1、等級3〜9は順に15、25、35、45、55、70、85を持つ。条件を満たした入荷済みIDと素材売却履歴は `meta.shop` に保存し、冒険者死亡後も維持する。

生成系列装備は任意の `equipmentArchetype` で猛攻・城塞・疾風・再生・多相・背水の強偏差原型を示す。セット構成品は `setId` を持ち、`equipmentSets` の `itemIds` と対応する。各セットの `bonuses` は `{ pieces, attack?, defense?, acceleration?, hpRegen?, attackAttributes?, resistances?, text }` 形式で、必要部位数を満たした段階まで累積適用する。装備監査では `setId` も用途の一部として完全一致判定へ含める。

固定アーティファクトは `data/equipment.js` に63種類あり、全て `artifact.chestOnly: true` の一点物として扱う。UIでは名称先頭へ黒星`★`を付ける。通常箱は1%、宝物庫箱は5%で固定品を抽選する。商店売却は不可で、装備から外した状態なら `artifact.guildPoints` を基準にギルドへ納品できる。発見済みIDは冒険者の `discoveredArtifacts` に残り、ギルド納品後も同じ一点物を再抽選しない。`curse.penalties` は装備中だけ適用し、呪耐性のダメージ倍率と同じ係数で軽減する。呪免疫ならペナルティは0になる。任意の `risque: true` は♡印の艶装備を表し、性格 `lewd` の装備数に応じた共鳴補正へ使う。

`js/artifact-generator.js` が作るランダム生成品は `random_artifact_####` IDと `artifact.random: true` を持ち、UIでは白星`☆`を付ける。生成済み定義は `adventurer.randomArtifacts[id]` に丸ごと保存し、読込時に静的装備マップへ登録する。固定品用の `discoveredArtifacts` には混ぜず、ギルド納品時に個体定義も削除する。`meta.randomArtifactSerial` は保存済み個体の最大番号以上へ正規化し、ID衝突を防ぐ。

## 宝箱アイテムと魔法

`data/treasures.js` が `spellbookRanks`、`spells`、`spellbooks`、`junkItems`、`treasureItems` を登録する。

```js
{
  id: "advanced",
  label: "上級",
  order: 3,
  rarityWeight: 9,
  minFloor: 22,
  baseSellPrice: 180
}
```

魔法書ランクは `beginner`（初級）、`intermediate`（中級）、`advanced`（上級）、`supreme`（最上級）、`forbidden`（禁断）の5段階。上位ほど `rarityWeight` が小さく、出現開始階層と売値が高い。

```js
{
  id: "thunder_lance",
  name: "雷槍",
  rank: "intermediate",
  attribute: "thunder",
  power: 1.45,
  range: 6,
  jobs: ["mage", "spellblade"],
  description: "槍状に束ねた雷を射線上の敵へ突き立てる。"
}
```

`spells` から同IDに対応する `spellbook_*` を生成する。魔法書は自宅で対応職が読むと1冊減り、`learnedSpells` に魔法IDが加わる。未読本と余った本は商店で売却できる。ガラクタは `type: "junk"`、`sellPrice`、`rarityWeight`、`minFloor` を持つ売却品である。

宝箱からモンスターの剥ぎ取り素材は出ない。開封結果は魔法書、ガラクタ、通常箱1%・宝物庫箱5%の固定アーティファクト、激レアのランダム生成アーティファクト、その階層のユニークモンスターによる奇襲のいずれかになる。宝物庫の箱はランダム生成品率を通常の3倍にし、希少魔法書・高額品へ抽選を寄せる。スリル部屋の箱は守護者討伐まで封印される。黄金墓・迷宮大暴走でも魔法書とガラクタの `amount` は1のままで、剥ぎ取り素材だけを2倍にする。

## 階層

`data/floors.js` の `floors` に配列で定義する。

```js
{
  floor: 5,
  name: "赤熱の巣",
  monsterPool: ["fire_lizard"],
  uniques: ["red_garm"],
  uniqueChance: 0.24,
  enemyCount: 31,
  spawnCap: 41,
  roomRange: [38, 45],
  chestRange: [7, 10],
  stairRange: [4, 6]
}
```

現行データはこの配列を地下100階まで生成し、階層ごとに敵数、生成上限、部屋、宝箱、階段、ユニーク抽選率、希少敵枠を持つ。生成時の一辺は36〜60から抽選して `dungeon.size` に保存する。生成後の `dungeon.layout` には6種類の構造ID・名称・説明を保存する。通常階は9室以上を持つ。各 `dungeon.rooms[]` は `alwaysLit`、`cramped`、`large` を持ち、約25%が接続通路1マス目まで照らす常時照明部屋、およそ8室に1室が短辺1〜2マスの極狭房になる。大広間型以外にも7〜11マス級の大部屋候補を混ぜる。便利屋が掘削した座標は `dungeon.excavatedTiles[]` に保存する。

初期敵は部屋面積を重みにして配置し、`rooms[0]` の開始室には置かない。極狭房は最大1体、通常室は `ceil(w * h / 10)` 体、各入口の半径3以内は最大2体。`walkableTileCount`、`initialEnemyTarget`、`initialEnemyCount`、`enemyDensityBand`、`enemySpawnCap` をダンジョンへ保存し、浅層3〜6.5%、中深層4〜8%の密度と再出現上限を復元できるようにする。

特別室は `dungeon.madnessRoom`、`dungeon.treasureVault`、`dungeon.thrillRoom` として `{ roomIndex, x, y, w, h, discovered, ... }` を保存する。専用の敵・箱は `specialRoom` で所属を示し、`discovered:false` の間は描画・行動・緊張度計算・通常スポーンから除外する。入口から2マス以内へ内容物を置かず、発見時に住人へ `specialRoomGraceTurns` を設定する。小型フロアで同時当選した副次室を安全配置できない場合は `deferredSpecialRooms` にIDを記録する。

生成直後から `traps: []` と `excavatedTiles: []` も持つ。罠インスタンスは `{ x, y, type, danger, discovered, disarmed, triggerCount, disarmFailures }` を持つ。解除失敗ごとに `disarmFailures` が1増え、次回成功率へ15ポイントを加算し、半分の効果で1回作動する。`triggerCount >= 3` になると `disarmed:true` へ移行する。配置時は罠間3マス、階段・入口から3マス以上を確保し、極狭房と特別室を除外する。

## セーブデータ

localStorageキーは `hagitori-dungeon-save-v1`。

```js
{
  adventurer: {
    alive: true,
    name: "たかし",
    backstory: "名前・種族・性格から生成され、自宅で編集した生い立ち",
    jobId: "swordsman",
    hp: 34,
    maxHp: 34,
    floor: 1,
    inDungeon: false,
    equipment: { weapon: "rusty_knife", upper: "cloth", lower: null, feet: null, accessory1: null, accessory2: null },
    ownedEquipment: ["rusty_knife", "cloth"],
    materials: {},
    items: { spellbook_ember_shot: 1, junk_bent_spoon: 2 },
    learnedSpells: ["ember_shot"],
    activeSpellId: "ember_shot",
    discoveredArtifacts: ["artifact_invisible_emperor_cloak"],
    randomArtifacts: {
      random_artifact_0001: { id: "random_artifact_0001", artifact: { random: true, quality: 3, depth: 74 } }
    },
    bountyCorpses: []
  },
  meta: {
    researchSchemaVersion: 2,
    economySchemaVersion: 2,
    progressionSchemaVersion: 2,
    compendiumEquipmentUnlocked: false,
    research: {
      cave_rat: { level: 3, seen: true }
    },
    deaths: 0,
    deathLog: [],
    discoveredRecipes: [],
    bounties: { red_garm: { intel: true, claimed: 1 } },
    guildClaims: [],
    guildDonatedEquipmentIds: ["iron_sword"],
    clearedBossFloors: [10, 20],
    shop: { soldMaterials: { small_beast_meat: 8 }, inventory: ["series_1_iron_sword"] },
    titles: [],
    randomArtifactSerial: 1,
    pendingDeathReview: null // 未読時は { reason, log: [直前ログ最大20件] }
  }
}
```

死亡時は調査・死因・商店流通・称号・賞金情報・`guildDonatedEquipmentIds` を残し、`adventurer` を初期化する。例外として `meta.guildClaims`、`meta.clearedBossFloors`、各 `meta.bounties[id].claimed` はリセットする。購入済み情報を表す `intel` は維持する。死亡直前ログは `pendingDeathReview` にスナップショット保存し、リロード後もプレイヤーが閉じるまで復元する。
