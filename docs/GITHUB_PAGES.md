# GitHub Pages 公開手順

このプロジェクトの公開入口はリポジトリ直下の `index.html` です。`src/` は旧プロトタイプの保存用なので使用しません。

## 1. 公開前確認

```bash
osascript -l JavaScript tools/smoke_test.js
```

macOS以外では、GitHub Actionsが全 `data/*.js` と `js/*.js` の構文を検査します。

現時点ではプロジェクトのライセンスを設定していません。第三者による再利用を許可する場合は、公開前にライセンスを選び `LICENSE` を追加してください。

## 2. GitHubリポジトリへ送る

GitHubで空のリポジトリを作成します。GitHub FreeでPagesを利用する場合は公開リポジトリにします。

ローカルで初回コミットが済んでいる場合は、作成したリポジトリを接続して送信します。

```bash
git remote add origin https://github.com/<OWNER>/hagitori-dungeon.git
git push -u origin main
```

`<OWNER>` はGitHubのユーザー名または組織名へ置き換えます。

## 3. Pagesを有効にする

1. GitHubのリポジトリで `Settings` を開く
2. `Pages` を開く
3. `Build and deployment` の `Source` を `GitHub Actions` にする
4. `Actions` の `Deploy GitHub Pages` が完了するまで待つ

公開URLは通常、プロジェクトサイトなら次の形式です。

```text
https://<OWNER>.github.io/hagitori-dungeon/
```

## 自動公開の対象

`.github/workflows/pages.yml` は次だけをPages成果物へ収録します。

- `index.html`
- `.nojekyll`
- `css/`
- `data/`
- `js/`
- 実行時に参照するBGM 10本
- `assets/images/down-stairs.png`

`main` ブランチへpushするたび、構文検査後に自動公開されます。`src/`、`docs/`、`tools/`、未使用の制作素材は公開サイトへ含めません。

## 公開後確認

- タイトル画面からゲームを開始できる
- BGMボタンで音が再生される
- ダンジョンへ入って移動・戦闘・剥ぎ取りができる
- ページ再読込後もセーブが残る
- スマートフォン幅でマップと操作欄をスクロールできる
- GitHub PagesのURLがリポジトリ名を含む場合でも画像・音声が読み込める

## 容量について

公開用BGMは48kHzステレオ・AAC 192kbpsのM4Aが10本、合計約12MiBです。生成元WAV約98MiBは公開対象から除外しています。`js/main.js`と開発用BGMラボはいずれもM4Aを参照します。
