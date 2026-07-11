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

ユニーク個体は `unique: true` を持つ。ダンジョン個体は `floors`、闘技場限定個体は `arenaOnly: true` と連続した `arenaRank` を持つ。手作り人格を追加する場合は、台詞本体ではなく次の設定だけをデータへ置く。

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

固定アーティファクトは `data/equipment.js` に20種類あり、全て `artifact.chestOnly: true` の一点物として扱う。UIでは名称先頭へ `★` を付ける。商店売却は不可で、装備から外した状態なら `artifact.guildPoints` を基準にギルドへ納品できる。発見済みIDは冒険者の `discoveredArtifacts` に残り、ギルド納品後も同じ一点物を再抽選しない。`curse.penalties` は装備中だけ適用し、呪耐性のダメージ倍率と同じ係数で軽減する。呪免疫ならペナルティは0になる。

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

宝箱からモンスターの剥ぎ取り素材は出ない。開封結果は魔法書、ガラクタ、ごくまれな固定アーティファクト、その階層のユニークモンスターによる奇襲のいずれかになる。

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
  stairRange: [3, 5]
}
```

現行データはこの配列を地下100階まで生成し、階層ごとに敵数、生成上限、部屋、宝箱、階段、ユニーク抽選率を持つ。

## セーブデータ

localStorageキーは `hagitori-dungeon-save-v1`。

```js
{
  adventurer: {
    alive: true,
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
    bountyCorpses: []
  },
  meta: {
    researchSchemaVersion: 2,
    compendiumEquipmentUnlocked: false,
    research: {
      cave_rat: { level: 3, seen: true }
    },
    deaths: 0,
    deathLog: [],
    discoveredRecipes: [],
    bounties: {},
    guildClaims: []
  }
}
```

死亡時は調査・死因・商店流通などの `meta` を残し、`adventurer` を初期化する。未精算の `meta.guildClaims` は次の冒険者へ持ち越さない。
