# コード構成

実行対象はプロジェクト直下の `index.html`、`css/`、`js/`、`data/` です。`src/` は旧小型プロトタイプ、`publish/` は過去の配布スナップショットで、通常の修正対象には含めません。

## 読み込み順

`index.html` は通常の `script` タグを次の順序で読み込みます。

1. `data/materials.js`
2. `data/races.js`、`data/jobs.js`、`data/personalities.js`
3. `data/equipment.js`、`data/treasures.js`、`data/monsters.js`、`data/floors.js`
4. `js/unique-dialogue.js`
5. `js/utils.js`、`js/threat-system.js`
6. `js/dungeon-generator.js`、`js/economy.js`、`js/character-system.js`、`js/bounty-system.js`
7. `js/audio-effects.js`
8. `js/main.js`

各ファイルはIIFEでグローバル汚染を抑え、共有APIだけを `window.HD_*` として公開します。

## 責務

- `data/`: 職業、種族、装備、宝箱アイテム、魔法、モンスター、階層などの定義と生成規則
- `data/treasures.js`: 5ランクの魔法書、習得魔法、売却用ガラクタの定義
- `js/utils.js`: 状態を持たない共通関数
- `js/dungeon-generator.js`: マップ生成
- `js/economy.js`: 価格、ギルドポイント、景品計算
- `js/character-system.js`: 基礎能力とレベル成長
- `js/bounty-system.js`: 賞金首の抽出、報酬、出現階情報
- `js/unique-dialogue.js`: 全ユニークの個体設定、文脈別台詞候補、重複回避済み静的台詞表
- `js/threat-system.js`: 階層の通常生成上限と生存敵を比較する5段階緊張度判定
- `js/audio-effects.js`: Web Audioによる効果音レシピ
- `js/main.js`: セーブ移行、画面制御、ダンジョン・闘技場・戦闘・剥ぎ取り・宝箱・魔法習得の進行
- `tools/generate_bgm.py`: 現行BGMの生成元
- `tools/smoke_test.js`: JavaScript構文、ロスター、五段階調査、全台詞衝突、全効果音、剥ぎ取り回数、職業技、魔法書、アーティファクト、呪い軽減、旧セーブ移行のスモークテスト
- `.github/workflows/pages.yml`: `main` の現行実行対象だけを `_site` へまとめ、GitHub Pagesへ自動公開するワークフロー
- `docs/GITHUB_PAGES.md`: 初回公開、Pages有効化、公開後確認の手順

## 変更時の注意

- `materials.js` の属性定義順は装備・モンスター生成に使うため、単なる整列目的で変更しない。
- `monsters.js` の配列順はユニーク個体の二つ名と個体モチーフ生成に影響するため、並べ替えない。
- 台詞本体は敵インスタンスへ複製せず、`unique-dialogue.js` の静的表をID参照する。セーブには直近履歴とクールダウンだけを持たせる。
- 装備データは `jobs.js` 読み込み後に生成する。
- `treasures.js` は装備の後、モンスターと階層の前に読み込む。魔法書ランクは希少度と解禁階層を兼ねるため、IDや順序を変える場合は旧セーブの `items` と `learnedSpells` も確認する。
- 調査記録は `meta.researchSchemaVersion` で一度だけ移行し、既存セーブの判明情報を後退させない。
- 状態更新を伴う処理は `main.js` に残し、純粋関数や外部状態に依存しない処理からモジュールへ分離する。

## 次の分割候補

`main.js` には表示、戦闘、セーブ処理がまだ集中しています。次に分割する場合は、回帰テストを追加してから、共通の距離・射線計算、装備カード描画、闘技場盤面計算の順で切り出します。
