# 3.6.0 未コミット差分レビュー結果と引き継ぎタスク

2026-07-13 Claude Code によるレビュー。約30候補を検証エージェントで裏取りし、生存8件。
深刻度順。行番号はレビュー時点の作業ツリー基準（ずれている場合は引用コードで探すこと）。

## 修正状況

2026-07-13 Codex が A-1〜A-8 を修正し、各問題の回帰ケースを `tools/smoke_test.js` へ追加した。全スモークテストと `git diff --check` は合格。以下は発見時の記録として残す。

## 修正タスクA: バグ修正（コミット前推奨）

### A-1. 壁タイル上のプレイヤー・階段でセーブが黙って全破棄される【重大】
- `js/main.js:554` 付近の `isValidDungeonState` が `isValidGridPosition(dungeon.player, dungeon.map)` と階段検査で「floor」タイルしか認めない。敵には `allowWall` フラグがある（562行）のにプレイヤー・階段には無い。
- 発火1: 幽霊種族の壁抜け（`movePlayer` の `ghostPhase`、3935-3956行）中に `saveGame()`（3984行）→ リロードで `migrateSave` がダンジョンをnull化・inDungeon解除・floor=1（745-748行）。
- 発火2: 壁抜け守護者（`monsterCanPhaseWalls`、3831行）を壁内で撃破すると `state.dungeon.stairs = [{x: enemy.x, y: enemy.y}]`（5067行）が壁座標になる。
- 修正案: プレイヤー検査と階段・宝箱検査に敵と同じ壁許容を適用する（プレイヤーは種族が幽霊の場合のみ許容でも可。階段は常に許容が安全）。

### A-2. マルチタブ競合検知後、セーブ拒否が視覚的に通知されない【重大】
- 別タブのセーブで `saveConflictDetected = true`（7062行）になると `saveGame()` は毎回false（978-984行）。復帰経路はセーブ全消去のみ（1544行）。
- 警告は `els.liveLogAnnouncer`（sr-only、index.html:142、視覚的に不可視）にのみ出力。晴眼プレイヤーはセーブ停止に気づけず進行を失う。
- 修正案: 可視の戦闘ログ `log()` とモーダル（または画面上部の常設バナー）で通知し、「再読み込みで最新セーブを引き継ぐ」導線を出す。

### A-3. 召喚が予告攻撃の解放より先に処理され、予告が黙って持ち越される
- `beginEnemyAction`（4812行）で `advanceSummonProgress && trySummonMinions` が telegraph解放ブロック（4823-4830行）より前にあり、召喚成功時 `enemy.telegraphed` が残ったまま次の行動へ。危険攻撃が再警告なしで1行動遅れて着弾する。
- 該当: `dungeon_lord_nox`（dangerous.every=2 + summon.every=3、ターン2予告→ターン3召喚で確定衝突）、forcedSummoners 8種（例 thunder_emperor_barg）。
- 修正案: telegraph解放を召喚判定より先に戻す（旧3.5.0の順序、旧4551行）。

### A-4. ユニークの初対面台詞がフロア開始直後にマップ全体で発火・消費される
- ワールドターンが距離無制限で `beginEnemyAction`（6562行）を回し、その2行目の `ensureUniqueEncounterSpeech`（4665-4671行）は睡眠と一度きりフラグしか見ない（距離・視認チェックなし、`force: true` でログ出力）。
- ユニークは95%覚醒スポーン（UNIQUE_SLEEP_CHANCE=0.05）なので、未遭遇ユニークの初対面台詞が到達初ターンにログへ流れ、encounterステージが消費される。実際の接敵時の呼び出し（6464/6482/6503/4193行）は空振り。
- 修正案: `ensureUniqueEncounterSpeech` に距離または視界内チェックを追加する（接敵時呼び出し側は既に適切な位置にあるため、beginEnemyAction からの呼び出しを距離ゲートするだけでも可）。

### A-5. 3.5.0セーブのラスボスがtime_stopを保持し、存在侵食が発動しない
- `migrateSave` の savedEnemies パス（754-779行）が名前系フィールドしか再同期しない。3.5.0で保存された Nox インスタンスはハッシュ付与の `specialAttack: "time_stop"` を保持（4821行の判定で発動し続ける）し、テンプレート側にしか無い `elixirAttrition` は undefined のため存在侵食（4786行）が一切発動しない。
- 修正案: savedEnemies パスで `canonicalMonster`（755行で取得済み）から `elixirAttrition` を補填し、`automaticSpecialAttack === false` の個体から旧付与スペシャルを除去する。

### A-6. saveGame()が毎回セーブ全体をJSON.parseしてリビジョン1整数を読む
- 979-991行。saveGameは全行動後に走り（log経由で1歩2〜3回）、後期セーブは数百KB。スマホで毎入力の同期パースはジャンクの原因。
- 注意: storageイベントだけでは代替不可（書き込みタブにイベントは飛ばず、モバイルのタブ凍結中は取りこぼす）。読み戻し自体は正当。
- 修正案: リビジョンを独立した小さなlocalStorageキー（例 `hagitori.saveRevision`）に分離し、saveGameはそれだけ読む。本体保存時に両方書く。

### A-7.（低優先・PLAUSIBLE）旧形式アリーナセーブが修復前に破棄される
- `isValidArenaState`（566行）が `ensureArenaField`（2529行）で修復可能だった形状（player/obstacles/size欠落）を738行で破棄。リポジトリ内の全コミットは完全形状を書くため、発火はリポジトリ以前のビルドのセーブに限る。余力があれば isValidArenaState を「修復不能な形状のみ拒否」へ緩める。

### A-8.（クリーンアップ）isValidDungeonState リセットブロックの重複
- 745-749行と833-837行が同一。間にダンジョンを無効化する処理はなく、最大3600タイル全走査が2回走る。後者だけ残して前者を削除。

## シロ判定（修正不要と確認済み）
- 遠距離での状態異常タイマー進行・無敵再チャージ・召喚サイクル消費: 「敵移動を含む行動カウンター統一」の意図された仕様（docs/TODO.md、smoke_test検査あり）。
- 永続報酬装備の世代毎再支給・再納品: DATA_SCHEMA.md に明記された設計（GPは冒険者スコープなので無限ループにならない）。
- bounty nativeFloor のフォールバック: 実際のロード順・テストでは到達不能。

## 修正タスクB: BGMのAAC圧縮（ロード軽量化）

- 現状 `assets/audio/*.wav` 11曲で約100MB。GitHub Pages初回ロードが重い。
- macOS標準の afconvert でAAC化: `afconvert -f m4af -d aac -b 192000 in.wav out.m4a`（全11曲で約10MBになる見込み）。
- 参照の書き換えは js/main.js 内の音声パス（`assets/audio/○○-bgm.wav`）を `.m4a` へ。
- 注意: tools/generate_bgm.py はWAVを出力する（生成元として維持）。圧縮はビルド/公開時の変換として扱い、README「開発メモ」に手順を1行追記すること。wavをリポジトリから外すかは容量方針次第（Pages公開ワークフローが現行ルートだけを公開する点に注意）。

## 検証方法
- `osascript -l JavaScript tools/smoke_test.js`
- A-1: 幽霊種族で壁内セーブ→リロード、守護者階段の壁座標セーブ→リロード
- A-3: Noxまたはforced summoner戦で予告→召喚ターンの挙動をログで確認
- A-4: フロア到達初ターンのログにユニーク台詞が出ないこと、接敵時に出ること
