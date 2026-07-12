# コード構成

実行対象はプロジェクト直下の `index.html`、`css/`、`js/`、`data/` です。`src/` は旧小型プロトタイプ、`publish/` は過去の配布スナップショットで、通常の修正対象には含めません。

## 読み込み順

`index.html` は通常の `script` タグを次の順序で読み込みます。

1. `data/materials.js`
2. `data/races.js`、`data/jobs.js`、`data/personalities.js`
3. `data/equipment.js`、`data/treasures.js`、`data/monsters.js`、`data/floors.js`
4. `js/unique-dialogue.js`
5. `js/utils.js`、`js/threat-system.js`
6. `js/dungeon-generator.js`、`js/artifact-generator.js`、`js/economy.js`、`js/character-system.js`、`js/bounty-system.js`
7. `js/inn-content.js`、`js/audio-effects.js`
8. `js/main.js`

各ファイルはIIFEでグローバル汚染を抑え、共有APIだけを `window.HD_*` として公開します。

## 責務

- `data/`: 職業、種族、装備、宝箱アイテム、魔法、モンスター、階層などの定義と生成規則
- `data/treasures.js`: 5ランクの魔法書、習得魔法、売却用ガラクタの定義
- `js/utils.js`: 状態を持たない共通関数。ID索引、数値制限、乱数、HTMLエスケープ、グリッド距離・射線判定
- `js/dungeon-generator.js`: マップ生成
- `js/artifact-generator.js`: 激レアなランダムアーティファクトの深度別品質・能力・複数属性・呪い生成と保存スキーマ検証
- `js/economy.js`: 価格、ギルドポイント、景品計算
- `js/character-system.js`: 基礎能力、レベル成長、名前・種族・性格による生い立ち生成
- `js/bounty-system.js`: 賞金首の抽出、報酬、出現階情報
- `js/inn-content.js`: 宿屋の助言、つまみ生成素材、性格別の食事コメント
- `js/unique-dialogue.js`: 全ユニークの個体設定、文脈別台詞候補、重複回避済み静的台詞表
- `js/threat-system.js`: 階層の通常生成上限と生存敵を比較する5段階緊張度判定
- `js/audio-effects.js`: Web Audioによる効果音レシピ
- `js/main.js`: セーブ移行、画面制御、ダンジョン・闘技場・戦闘・剥ぎ取り・宝箱・魔法習得の進行。花ペット、希少素材、壁抜けの調整値はファイル先頭の設定オブジェクトへ集約する
- `tools/generate_bgm.py`: 現行BGMの生成元
- `tools/smoke_test.js`: JavaScript構文、ロスター、部屋比率・敵密度・開始室、常時照明境界、特別室と入口猶予、五段階調査、全台詞衝突、全効果音、剥ぎ取り回数・盗賊一括処理、再作動罠と安全配置、便利屋掘削、金品盗難、戦闘ターン・耐性・召喚上限、職業技、魔法書、固定／ランダムアーティファクト、賞金・商店・GP・闘技場報酬、死亡継承境界、旧セーブ移行のスモークテスト
- `.github/workflows/pages.yml`: `main` の現行実行対象だけを `_site` へまとめ、GitHub Pagesへ自動公開するワークフロー
- `docs/GITHUB_PAGES.md`: 初回公開、Pages有効化、公開後確認の手順

## 変更時の注意

- `materials.js` の属性定義順は装備・モンスター生成に使うため、単なる整列目的で変更しない。
- `monsters.js` の表示名はモンスターIDに結び付け、セーブ上の敵名もロード時に現行データへ同期する。配列順は固有異能・戦型・個体モチーフの割当へ影響するため、単なる整列目的では変更しない。
- 台詞本体は敵インスタンスへ複製せず、`unique-dialogue.js` の静的表をID参照する。セーブには直近履歴とクールダウンだけを持たせる。
- 装備データは `jobs.js` 読み込み後に生成する。
- `treasures.js` は装備の後、モンスターと階層の前に読み込む。魔法書ランクは希少度と解禁階層を兼ねるため、IDや順序を変える場合は旧セーブの `items` と `learnedSpells` も確認する。
- `artifact-generator.js` は装備・階層データと `dungeon-generator.js` の後、`main.js` の前に読み込む。ランダム品は生成結果全体を保存し、アルゴリズム変更で既存品の性能を再計算しない。
- 調査記録は `meta.researchSchemaVersion` で一度だけ移行し、既存セーブの判明情報を後退させない。
- 状態更新を伴う処理は `main.js` に残し、純粋関数や外部状態に依存しない処理からモジュールへ分離する。
- `index.html` のローカルCSS・JavaScriptは同じキャッシュ識別子へ揃える。個別機能名の版番号を混在させない。

## 次の分割候補

`main.js` には表示、戦闘、セーブ処理がまだ集中しています。共通の距離・射線計算と生い立ち生成は分離済みです。属性ラベル変換表、花使い・特殊素材確率、壁抜けユニーク条件、レベルアップ時間、死亡音種など、頻繁に参照する設定は再生成せず一か所で管理する。次に分割する場合は、回帰テストを追加してから、モンスター調査文生成、花ペットAI、セーブ正規化、装備カード描画、闘技場盤面計算の順で切り出します。テストプレイ直前の大規模分割は避ける。
