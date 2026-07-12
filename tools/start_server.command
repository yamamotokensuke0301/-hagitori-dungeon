#!/bin/bash
# 剥ぎ取りダンジョン 開発サーバー起動（ダブルクリックで実行）
cd "$(dirname "$0")/.."
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "IP取得失敗")
echo "======================================================"
echo " 剥ぎ取りダンジョン 開発サーバー"
echo "======================================================"
echo ""
echo "  Macで開く:     http://127.0.0.1:5174/index.html"
echo "  iPhoneで開く:  http://${IP}:5174/index.html"
echo "                 （MacとiPhoneが同じWi-Fiにあること）"
echo ""
echo "  BGM試聴:   /tools/bgm_lab.html"
echo "  効果音試聴: /tools/sfx_lab.html"
echo ""
echo "  終了: このウィンドウで Ctrl+C、またはウィンドウを閉じる"
echo "======================================================"
python3 -m http.server 5174 -d .
