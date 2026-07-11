(function () {
  "use strict";

  const DATA = window.HD_DATA;
  const CONTEXTS = Object.freeze([
    "encounter", "battle", "move", "attack", "hit", "evade", "hurt",
    "critical", "dangerous", "dangerousRelease", "special", "observe", "defeat",
  ]);

  const ATTRIBUTE_VOICES = {
    fire: ["炉心の火", "灰へ変える", "焦げた風", "消えない熱傷"],
    water: ["底なしの水", "息ごと沈める", "遠い潮騒", "肺に残る冷たさ"],
    thunder: ["天を裂く雷", "鼓動より先に穿つ", "青白い残光", "耳奥の雷鳴"],
    poison: ["巡り続ける毒", "血の内側から蝕む", "甘い紫煙", "遅れて開く毒花"],
    ice: ["白夜の氷", "時間ごと凍らせる", "音を奪う霜", "砕けない凍傷"],
    curse: ["名を喰う呪い", "記憶へ絡みつく", "逆さの祈り", "消せない黒い文字"],
    acid: ["形を拒む酸", "誇りまで溶かす", "緑の雨", "泡立つ古傷"],
    dark: ["光を呑む闇", "影から輪郭を奪う", "星のない夜", "背後に残る空洞"],
    light: ["偽りを暴く光", "影ごと焼き切る", "白い残像", "瞼の裏の刻印"],
    earth: ["眠らない大地", "足場ごと砕く", "低い地鳴り", "骨へ届く震動"],
    wind: ["名もない風", "声より速く斬る", "逆巻く気流", "皮膚に残る風紋"],
    steel: ["迷わない鋼", "刃ごと折り伏せる", "澄んだ金属音", "錆びない裂傷"],
    illusion: ["真実を疑う幻", "確信から崩す", "二重の足音", "思い出に混じる偽物"],
    slash: ["一線の刃", "間合いごと断つ", "遅れて走る剣光", "閉じない切創"],
    blunt: ["理屈を潰す衝撃", "骨の奥まで砕く", "腹に響く轟音", "形を失う鈍痛"],
  };

  const VOICE_PROFILES = {
    monarch: {
      label: "秩序に飢えた王",
      first: "余",
      second: "貴様",
      open: ["{second}、顔を上げよ。{first}の前で死ぬ許しを与える", "{station}の序列は一つ。頂にいるのは{first}だ", "{shortName}の名を知らぬなら、今ここで覚えよ"],
      pressure: ["退くな。王命はまだ終わっていない", "その膝が地へ着くまで、{first}は歩みを止めぬ", "抵抗はよい。服従より見栄えがする"],
      wound: ["玉座へ傷を付けたな", "血は王冠を曇らせるが、価値までは奪えぬ", "その一撃、褒美に値する"],
      brink: ["王は退路を持たぬ。だから王なのだ", "ここから先は国ではない。{first}自身を相手にせよ", "冠が落ちても、頭はまだ高い"],
      finish: ["空いた玉座へ座ってみよ。重さに潰れぬならな", "王なき後の秩序を、{second}が背負え", "敗北を認めよう。屈服はせぬ"],
      technique: ["勅命を下す。{technique}", "王威を解く。{force}よ、道を空けよ", "{second}の最期を国史へ刻め"],
    },
    beast: {
      label: "記憶を嗅ぎ分ける獣",
      first: "俺",
      second: "おまえ",
      open: ["匂うぞ。恐れと、古い傷と、まだ温かい血だ", "走るな。追えば腹が減る", "{shortName}の縄張りへ足を入れたな"],
      pressure: ["もっと速く逃げろ。狩りが短くなる", "骨の鳴る場所が分かるぞ", "息が乱れた。次は喉だ"],
      wound: ["痛いな。だから、おまえを覚えた", "その血の味、悪くない", "牙へ触れた手は持ち帰れないぞ"],
      brink: ["腹が減った。何もかも喰えば静かになる", "追い詰めたつもりか。獣は壁を背にしてから噛む", "最後の力ほど、よく熟れている"],
      finish: ["強い匂いだ。忘れない", "喰えなかったか……なら、覚えておけ", "群れのない夜へ、また戻るだけだ"],
      technique: ["骨まで響け。{technique}", "{force}の匂いだ。伏せろ", "今から鳴くのは、おまえの骨だ"],
    },
    oracle: {
      label: "結末を疑う託宣者",
      first: "私",
      second: "あなた",
      open: ["三つの結末を見た。いちばん静かなものを選んで", "{station}の先で、あなたは一度こちらを振り返る", "{shortName}という誤植を、運命はまだ直せずにいる"],
      pressure: ["今の一歩は、昨日の夢と同じだ", "未来が一枚ずつ剥がれていく", "その選択だけ、まだ読めない"],
      wound: ["この傷は見ていなかった。よい空白だ", "予言が外れた。少しだけ嬉しい", "血の形まで同じとは限らないのね"],
      brink: ["頁の端が白く焼けて、先が読めない", "結末を捨てる。今だけは現在を選ぶ", "未来の私が、ここへ来るなと泣いている"],
      finish: ["ここが空白だったのね", "次の頁には、あなたの名がある", "予言は敗れた。記録だけは残る"],
      technique: ["未読の結末を開く。{technique}", "{omen}が告げている。次は避けられない", "時系列を一つ折る。立っていられる？"],
    },
    jester: {
      label: "敗北まで演目にする道化",
      first: "ボク",
      second: "キミ",
      open: ["拍手は後でいいよ。悲鳴のほうが先だから", "{station}の出し物は命がけ。台本は今破った", "{shortName}の喜劇へようこそ。帰り道は小道具箱の中"],
      pressure: ["いい顔！ そのまま次の失敗へどうぞ", "ルール変更。今から床も敵役ね", "笑ってよ。真顔で死ぬなんてもったいない"],
      wound: ["当たり！ 景品は反撃でーす", "痛い痛い。だから舞台はやめられない", "衣装が破れた。キミの血で直そう"],
      brink: ["幕を下ろすな！ まだオチを決めてない", "拍手が足りない。もっと壊さなきゃ", "主役を譲る気はないよ。死体役ならどうぞ"],
      finish: ["お見事。棺からアンコールを送るよ", "笑えたならボクの勝ち。生き残ったならキミの勝ち", "幕引きかぁ。次はもっと悪い台本を書くね"],
      technique: ["照明、音響、そして{technique}！", "大仕掛けだよ。{force}まで笑ってる", "ここで全員、派手に間違えよう！"],
    },
    warrior: {
      label: "言葉を刃へ削る武人",
      first: "俺",
      second: "お前",
      open: ["名乗りは一度でいい。後は刃で語れ", "{station}、一合目。互いの嘘を捨てよう", "{shortName}だ。覚える必要はない、勝てば残る"],
      pressure: ["間合いが甘い", "足ではなく、意志を前へ出せ", "次の一手に迷いがある"],
      wound: ["良い太刀筋だ", "その痛み、稽古代として受け取る", "見切ったと言えば嘘になる。だから面白い"],
      brink: ["ここからは技ではない。意地だ", "立っている限り勝負は終わらぬ", "一命を一振りへまとめる"],
      finish: ["見事。刃に偽りなし", "この敗北は墓まで持っていく", "勝者よ、次の一合を粗末にするな"],
      technique: ["奥伝、{technique}", "呼吸を断つ。{force}と共に", "一度だけ見せる。二度目はない"],
    },
    ghost: {
      label: "静けさを守る怪異",
      first: "わたし",
      second: "あなた",
      open: ["……音を立てないで。底が起きる", "{station}では、影の数を間違えないで", "{shortName}を呼んだ？ その声、もう返せない"],
      pressure: ["……足音がひとつ多い", "静かに。あなたの後ろが聞いている", "息を止めて。今、何かが通る"],
      wound: ["……赤い。静けさに色が付いた", "欠けた音がする", "痛みは、まだこちら側の証"],
      brink: ["……底が目を開けた", "もう戻れない。あなたも、わたしも", "静寂が割れる前に終わらせる"],
      finish: ["……やっと眠れる", "静かだ……とても", "影を一つ、置いていくね"],
      technique: ["……来る。{technique}", "{omen}の向こうで、何かが笑った", "声を捨てて。{force}が聞いている"],
    },
    zealot: {
      label: "傷を祝福と呼ぶ狂信者",
      first: "我",
      second: "供物",
      open: ["祝福せよ！ この邂逅こそ祭壇だ！", "{station}へ供物が自ら歩いてきた！", "{shortName}の祈りは刃で書く。読めるものなら読め！"],
      pressure: ["痛みこそ証！ もっと深く祈れ！", "逃げる足跡まで聖句になる！", "血を惜しむな。神は薄い祈りを嫌う！"],
      wound: ["よい傷だ！ 光が内側へ入ってくる！", "もっと刻め、祈りが足りぬ！", "この血で祭壇が満ちてゆく！"],
      brink: ["奇跡は死の寸前で起きる！", "神よ、今だけ目を開け！", "最後の一滴まで讃歌に変えよう！"],
      finish: ["祭壇は……満ちた……", "この血で、扉が開く……", "供物よ、次は我を祈れ"],
      technique: ["神罰を賜る。{technique}！", "{force}よ、供物を清めよ！", "聖痕を刻め。骨の裏側まで！"],
    },
    scholar: {
      label: "敗因まで収集する研究者",
      first: "私",
      second: "被験体",
      open: ["新しい標本だ。壊れ方を記録しよう", "{station}の条件は良好。再現性を期待する", "{shortName}の仮説を、君の死で査読してくれ"],
      pressure: ["反応速度、低下。次の刺激へ移る", "その回避は二度目からデータになる", "抵抗を続けてくれ。比較資料が要る"],
      wound: ["興味深い。仮説を修正しよう", "痛覚は正常。観察者も例外ではないらしい", "その結果は未記録だ。もう一度頼む"],
      brink: ["観察対象が観察者を追い詰めるか", "記録は終わっていない。心停止後も続ける", "誤差ではない。私の敗北が有意になった"],
      finish: ["結論……私の負けだ", "資料は持っていけ。読めるならな", "最終記録、勝者は被験体"],
      technique: ["最終試験、{technique}", "{force}の致死域を実測する", "条件を固定。君だけを変数にする"],
    },
    guardian: {
      label: "約束から動かない番人",
      first: "私",
      second: "侵入者",
      open: ["ここから先は通さない。理由はとうに失った", "{station}を守る。それだけが私の形だ", "{shortName}は待っていた。来てほしくない誰かを"],
      pressure: ["一歩も譲らない。譲れば約束が崩れる", "戻れ。まだ引き返せるうちに", "私を倒しても、門はお前を覚える"],
      wound: ["古い鎧に、新しい傷が増えた", "痛みは役目を確認させてくれる", "まだ立てる。ならば守れる"],
      brink: ["門が背にある限り、倒れる方向は前だけだ", "約束の名を忘れても、重さは消えない", "最後の一歩を、ここへ置く"],
      finish: ["通れ。だが、後ろを振り返るな", "約束は終わった。誰とのものだったのだろう", "門よ、次はお前が立て"],
      technique: ["封鎖を解く。{technique}", "{force}よ、境界を閉じよ", "侵入者を記憶から排除する"],
    },
    gambler: {
      label: "命を賭け金にする勝負師",
      first: "俺",
      second: "あんた",
      open: ["賭けよう。俺は命、あんたは帰り道だ", "{station}の倍率は悪くない。大穴はあんただ", "{shortName}の卓へようこそ。降りるなら今だ"],
      pressure: ["まだ張れるだろう？ 指が残っている", "勝負は傾いてからが美味い", "その一歩、払い戻しはないぜ"],
      wound: ["いい目だ。痛みまで当たりに変わった", "胴元が血を流すと客は喜ぶ", "その札は読めなかった。次は読む"],
      brink: ["全賭けだ。墓石まで担保に入れる", "破産と勝利は、最後の一枚まで同じ顔だ", "ここで降りたら俺じゃない"],
      finish: ["大当たりだ。取り分は全部持っていけ", "負け札も集めれば一組になる", "卓を片付けてくれ。俺はもう払えない"],
      technique: ["切り札、{technique}", "{force}へ全額を賭ける", "倍率を壊す。生き残れば払い戻しだ"],
    },
    poet: {
      label: "戦場を詩へ変える語り部",
      first: "僕",
      second: "旅人",
      open: ["旅人よ、君の最期に韻を贈ろう", "{station}の風はまだ題名を持たない", "{shortName}の詩は、刃でしか改行できない"],
      pressure: ["足音が一行、血が一行。よい詩になりそうだ", "急がないで。終止符は逃げない", "君の呼吸が、少しずつ短句になる"],
      wound: ["赤い比喩だ。少し直接的すぎるね", "痛みには韻がない。だから忘れられない", "この傷を、次の連へ残そう"],
      brink: ["最終連だけが書けない。君が続きを選んで", "言葉が尽きたら、骨で韻を踏む", "結末は短いほど深く刺さる"],
      finish: ["よい終止符だ。題名は君に任せる", "詩は残る。作者だけが消える", "最後の一行を、持っていって"],
      technique: ["朗誦する。{technique}", "{omen}を前奏に、{force}を落とす", "この一節は声ではなく傷で読む"],
    },
    artisan: {
      label: "戦闘を仕事にする職人",
      first: "俺",
      second: "素材",
      open: ["立ち方が歪んでいる。直すには一度壊す", "{station}の仕事だ。手早く、丁寧に終える", "{shortName}の道具は鈍らない。使い手も同じだ"],
      pressure: ["継ぎ目が見えた。そこから外す", "力むな。壊れ方が汚くなる", "一手ずつだ。雑な仕事は後で祟る"],
      wound: ["なるほど、その工具は使える", "傷口は正直だ。改善点を教えてくれる", "仕上げ前に寸法が変わったな"],
      brink: ["納期が来た。完成させる", "腕が動く限り、仕事は未完だ", "最後の一打だけは曲げない"],
      finish: ["いい仕事だった。代金はこの命で足りるか", "完成だ。俺のほうが先に壊れた", "道具を拾え。手入れだけは怠るな"],
      technique: ["仕上げる。{technique}", "{force}で継ぎ目を焼き切る", "寸分違わず、急所へ入れる"],
    },
  };

  const PROFILE_STYLES = Object.freeze({
    monarch: "regal", beast: "feral", oracle: "oracle", jester: "trickster",
    warrior: "warrior", ghost: "silent", zealot: "zealot", scholar: "scholar",
    guardian: "warrior", gambler: "trickster", poet: "silent", artisan: "warrior",
  });

  const ARENA_TITLE_PERSONAS = {
    紅蓮: ["勝敗を熱量で測る", "敗者の灰を小瓶へ残す", "自分の火が冷める夜を恐れる"],
    蒼海: ["相手の呼吸を潮として読む", "古い貝殻へ勝利数を刻む", "陸へ上がれば弱くなると思っている"],
    轟雷: ["一瞬の決着だけを美徳とする", "焦げた銅貨を指で弾く", "雷鳴の後の静けさが怖い"],
    猛毒: ["時間を味方につけて待つ", "毒草の押し葉を胸へ忍ばせる", "自分だけ解毒法を知らない"],
    氷刃: ["感情を温度として切り捨てる", "溶けない氷片を布で包む", "春という季節を見たことがない"],
    呪王: ["名を奪うほど存在が増すと信じる", "読めない墓碑の欠片を持つ", "自分の本名だけ思い出せない"],
    酸雨: ["形あるものの傲慢を嫌う", "穴だらけの銀杯を愛用する", "触れたものを残せない"],
    黒月: ["光の裏側こそ真実だと語る", "欠けた月盤を毎夜磨く", "夜明けに自分が消えると信じる"],
    白陽: ["隠し事を罪として裁く", "白布へ敗者の影を写す", "自分の影だけ映らない"],
    地裂: ["動かない者が最後に勝つと信じる", "故郷の小石を靴へ入れる", "帰るべき大地がもうない"],
    暴風: ["止まることを敗北と呼ぶ", "千切れた旗を首へ巻く", "無風になると息ができない"],
    鋼拳: ["鍛えた回数だけ魂が硬くなると信じる", "ひび割れた鉄輪を握る", "柔らかなものへ触れるのが苦手"],
    幻夢: ["信じたものだけが現実だと笑う", "他人の夢を書いた手帳を持つ", "自分が誰の夢か確かめられない"],
    斬鬼: ["迷いのない一線を求める", "欠けた鞘へ毎朝礼をする", "最初に斬った相手の顔を忘れない"],
    砕城: ["大きな障害ほど礼儀正しく壊す", "城門の蝶番を護符にする", "守る城を持てなかった"],
    星界: ["戦いを天体の運行として捉える", "落ちた星砂を数え続ける", "空の外から呼ぶ声を聞いている"],
    時逆: ["敗北を何度でもやり直せると信じる", "止まった懐中時計を携える", "本当は一度も時間を戻せない"],
    終極: ["最後の一人になることだけを望む", "無名の対戦表を折り畳む", "終わった後に何をするか決めていない"],
  };

  const ARENA_CORE_VOICES = {
    レオン: ["monarch", "余", "貴様", "左手の指輪を回してから宣告する"],
    ミドラ: ["oracle", "私", "あなた", "相手の瞬きを数えて未来を決める"],
    ガルド: ["guardian", "俺", "侵入者", "一歩ごとに故郷の門の名を唱える"],
    ネフィラ: ["poet", "わたし", "旅人", "血の色を季節の名で呼ぶ"],
    オズマ: ["jester", "ボク", "キミ", "不利になるほど声を立てて笑う"],
    ラグナ: ["warrior", "俺", "お前", "攻撃前に必ず一度だけ息を止める"],
    セレス: ["scholar", "私", "被験体", "受けた傷へ小さな通し番号を付ける"],
    バロウ: ["beast", "俺", "おまえ", "敵の匂いを古い獣の名に置き換える"],
    キリエ: ["zealot", "我", "供物", "痛みのたび見えない鐘へ祈る"],
    ドグマ: ["artisan", "俺", "素材", "武器の傷から相手の生活を推測する"],
    ヴェイン: ["gambler", "俺", "あんた", "自分の鼓動を賭け金として数える"],
    アルマ: ["ghost", "わたし", "あなた", "言葉の前後へ長い沈黙を置く"],
    ザクロ: ["jester", "あたし", "お客さん", "敗北寸前だけ丁寧語になる"],
    ノイン: ["scholar", "僕", "観測対象", "九という数字を不吉なほど避ける"],
    ヘリオ: ["monarch", "我", "臣下", "光の向きへ立ち位置を細かく直す"],
    クオン: ["poet", "僕", "旅の人", "昔の歌を一節だけ思い出せない"],
    メビウス: ["oracle", "私", "あなた", "同じ問いを違う答えで二度繰り返す"],
    イグナ: ["artisan", "俺", "材料", "焦げた手袋の縫い目を気にしている"],
    ゼロス: ["gambler", "俺", "挑戦者", "勝数をゼロへ戻すたび機嫌がよくなる"],
  };

  const DUNGEON_IDENTITIES = {
    red_garm: ["beast", "消えた群れの匂いを火の中に探す", "焼けた首輪", "自分を捨てた狩人を待っている"],
    white_fang_marta: ["warrior", "白い牙へ一度も泥を付けない", "折れた乳歯", "幼い群れを逃がすため囮になった"],
    iron_shell_gondo: ["artisan", "壊れない甲殻の完成を目指す", "最初に割れた殻片", "内側の柔らかさを誰にも見せたくない"],
    venom_widow_nazka: ["monarch", "巣に生まれる全てを自分の子と呼ぶ", "空の卵嚢", "守るべき子はとうに孵らなかった"],
    drowned_knight_ordo: ["guardian", "沈んだ主君の命令を守り続ける", "錆びた徽章", "命令の内容だけ忘れてしまった"],
    thunder_emperor_barg: ["monarch", "最速の一撃で老いを否定する", "欠けた雷角", "若い群れへ王座を譲るのが怖い"],
    curse_mask_mimei: ["ghost", "奪った名で空洞を埋める", "自分の顔を描いた紙", "仮面の下にはもう何もない"],
    frost_bloom_helka: ["poet", "溶ける前の一瞬を永遠に保存する", "枯れた花弁", "春の匂いだけを覚えている"],
    ash_dragon_volda: ["gambler", "最後の火を誰へ渡すか賭ける", "炭化した王冠", "炎を吐くたび寿命が縮む"],
    abyss_eye_zahar: ["oracle", "百の瞳で一つの真実を探す", "閉じたままの小眼", "見えすぎるため自分を見失った"],
    moon_eater_luna: ["poet", "月を喰らい夜を独占する", "銀色の欠片", "本当は暗闇をひどく怖がる"],
    acid_king_doruba: ["monarch", "溶けても残る権威を証明する", "穴の開いた玉座片", "王国を自らの酸で滅ぼした"],
    wind_witch_sylphy: ["jester", "誰にも捕まらない噂になる", "千切れたリボン", "一度だけ待っていた相手が来なかった"],
    bone_lord_gazra: ["guardian", "名もない骨へ役目を与える", "小さな指骨", "軍勢の全員が自分より先に死んだ"],
    steel_beast_orga: ["beast", "鋼より硬い心臓を育てる", "錆びた餌皿", "かつて人の手から餌を食べていた"],
    mirage_prince_nemu: ["jester", "目覚めない祝宴を続ける", "割れた仮面", "客席には最初から誰もいない"],
    ice_empress_freya: ["monarch", "感情を凍らせ国を保つ", "温かな手袋", "一度だけ抱いた子の温度を忘れない"],
    sunken_god_molok: ["zealot", "沈黙する信徒の祈りを聞き続ける", "水没した聖印", "神ではなく祈りに作られた怪物"],
    black_sun_azazel: ["zealot", "偽りの太陽で地下を照らす", "煤けた羽根", "本物の空を一度も見ていない"],
    dungeon_heart_eve: ["ghost", "迷宮の鼓動を止めない", "最初の石片", "自分が迷宮を生んだのか迷宮に生まれたのか分からない"],
    abyss_unique_15: ["oracle", "二つの顔で異なる未来を選ぶ", "片面だけの鏡", "どちらの顔も本物ではない"],
    abyss_unique_20: ["guardian", "裁く相手が来るまで立ち続ける", "文字の消えた判決文", "自分の罪だけ裁けない"],
    abyss_unique_25: ["beast", "空腹の向こう側にある静けさを探す", "噛み跡の付いた器", "満腹になると大切な記憶が消える"],
    abyss_unique_30: ["warrior", "怒りを一撃へ畳み込む", "逆向きの鱗", "怒りの理由をもう覚えていない"],
    abyss_unique_35: ["ghost", "光のない場所で輪郭を保つ", "黒い蝋燭", "誰かに見られないと消えてしまう"],
    abyss_unique_40: ["poet", "星を喰らい新しい夜を綴る", "空の星図", "飲み込んだ星の声が眠りを妨げる"],
    abyss_unique_45: ["scholar", "腐敗を生命の完成形として記録する", "密封された花", "自分だけ腐ることができない"],
    abyss_unique_50: ["monarch", "天井を空と定め地下を支配する", "青く塗った石", "空という言葉の意味を疑っている"],
    abyss_unique_55: ["poet", "最後の鐘で全ての名を弔う", "舌のない鐘", "自分の名だけ鐘が鳴らない"],
    abyss_unique_60: ["monarch", "空虚を領土として広げる", "誰も座らない椅子", "臣下を一人も持ったことがない"],
    abyss_unique_65: ["scholar", "千の視点で敗北の原因を分類する", "曇った単眼鏡", "目を閉じた時だけ真実が見える"],
    abyss_unique_70: ["zealot", "灰の冠を次代へ継がせる", "冷えた炭片", "冠を外せば自分が誰か分からない"],
    abyss_unique_75: ["beast", "過ぎた時間を喰らい若返ろうとする", "砂のない砂時計", "喰らった時間だけ孤独が長くなる"],
    abyss_unique_80: ["artisan", "夢を牢獄として精密に組み上げる", "曲がった小鍵", "自分も同じ夢から出られない"],
    abyss_unique_85: ["guardian", "冥府の入口を一人で守る", "帰路のない地図", "門の向こうを見たことがない"],
    abyss_unique_90: ["zealot", "神の骸へ新しい祈りを宿す", "砕けた肋骨", "崇める神を自ら殺した"],
    abyss_unique_95: ["oracle", "世界が零へ戻る瞬間を待つ", "数字のない算盤", "零の後に何が来るか知らない"],
    dungeon_lord_nox: ["oracle", "百層すべてを太古の闇へ還す", "形を判別できない黒い遺物", "本当は迷宮を支配しているのではなく、迷宮全体を自分の領域だと思っている"],
  };

  const PERSONAL_OBJECTS = ["欠けた鐘", "濡れた王冠", "逆さの星", "錆びた鍵", "白い羽根", "空の鞘", "黒い花", "古い傷", "止まった針", "割れた鏡", "小さな骨", "青い火", "消えた足跡", "無名の札", "千切れた糸", "冷えた灰", "遠い潮", "伏せた杯", "閉じた眼", "最後の頁"];
  const PERSONAL_VOWS = ["七つ目の傷を刻む", "敗者の名だけを記す", "夜明けまで問い続ける", "帰らぬ者の歌を捧げる", "一度だけ嘘を許す", "勝利のたび磨き直す", "痛みの数を忘れない", "誰にも見せず守り抜く", "最期の言葉を預ける", "次の季節まで待ち続ける", "沈黙の理由を尋ねる", "自分の名を伏せて祈る", "三度目の敗北を拒む", "壊れる音へ耳を澄ます", "空になっても掲げ続ける", "昨日の敵を弔う", "足跡が消えるまで追う", "答えのない印を刻む", "最後の一つを残しておく", "勝者へ返す日を待つ"];

  const CONTEXT_TAILS = {
    encounter: ["{mark}。それが{first}の名刺代わりだ", "『{desire}』。その願いを邪魔するなら容赦はない", "『{keepsake}』――それだけが{first}の来歴を知っている", "『{truth}』。だから{second}を試す"],
    battle: ["{mark}。まだ話の途中だ", "{omen}が{station}を満たしている", "『{desire}』――成し遂げるまで、あと一歩だ", "『{keepsake}』へ、この勝負を報告しよう"],
    move: ["{mark}。足取りだけは偽れない", "{omen}より先へ回る", "{second}の逃げ道を{force}が覚えた", "{station}の床へ次の印を刻む"],
    attack: ["{mark}。今の一手へ全てを乗せる", "{force}はためらわない", "{second}の呼吸へ狙いを合わせた", "『{desire}』――その願いのため、この一撃は外せない"],
    hit: ["{mark}。その傷は覚えておく", "{scar}がまた一つ増えた", "『{keepsake}』を失う痛みに比べれば軽い", "{second}の手筋をようやく理解した"],
    evade: ["{mark}。今の軌道は読めていた", "{omen}のほうがまだ速い", "{second}の迷いが先に見えた", "{station}では半歩の遅れが命取りだ"],
    hurt: ["{mark}。痛みで輪郭が鮮明になる", "{scar}が古傷へ重なった", "『{truth}』――それを思えば、まだ倒れられない", "『{desire}』。その願いはこの程度で折れない"],
    critical: ["{mark}。最後の言葉ほど静かに選ぶ", "『{keepsake}』を、まだ手放すわけにはいかない", "『{truth}』。それでも退く理由にはならない", "{station}へ最期の足跡を残す"],
    dangerous: ["{mark}。ここから先は奥義の領分だ", "{omen}を合図に{technique}を開く", "{force}よ、{second}の逃げ道を閉じろ", "『{desire}』――その願いのため禁じ手を使う"],
    dangerousRelease: ["{mark}。受けろ、{technique}", "{force}が答えた。もう遅い", "{second}の運命を一手で畳む", "{station}の記憶へこの技を焼き付ける"],
    special: ["{mark}。定石の外へ出よう", "『{truth}』――それを知る者だけの手だ", "{force}へ別の形を与える", "{second}の予想を一つ壊す"],
    observe: ["{mark}。見る者もまた見られている", "{second}は何を知って安心したい？", "『{keepsake}』の意味までは数値にできない", "『{truth}』だけは調査票へ書くな"],
    defeat: ["{mark}。この言葉だけは持っていけ", "『{desire}』――未完の願いを{second}へ残す", "『{keepsake}』。それだけはここへ置いていけ", "『{truth}』。知ったのなら、忘れないでくれ"],
  };

  const SECOND_PERSON_ALIASES = Object.freeze({ scholar: ["君"], guardian: ["お前"], poet: ["君"] });

  function hashText(text) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function format(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  }

  function cleanSentence(text) {
    return text
      .replace(/\s+/g, " ")
      .replace(/。{2,}/g, "。")
      .replace(/([！？])。/g, "$1")
      .trim();
  }

  function adaptVoice(text, voiceId, profile, first, second) {
    let adapted = text.split(profile.first).join(first).split(profile.second).join(second);
    (SECOND_PERSON_ALIASES[voiceId] || []).forEach((alias) => {
      adapted = adapted.split(alias).join(second);
    });
    return adapted;
  }

  const records = Object.create(null);
  const usedLines = new Set();
  const uniques = DATA.monsters.filter((monster) => monster.unique);

  uniques.forEach((monster, uniqueIndex) => {
    const seed = hashText(monster.id);
    const shortName = monster.coreName || monster.baseName || monster.name;
    const floor = monster.floors?.length ? Math.min(...monster.floors) : 0;
    const station = monster.arenaOnly ? `第${monster.arenaRank}戦` : `B${floor}F`;
    const motif = `${PERSONAL_OBJECTS[uniqueIndex % PERSONAL_OBJECTS.length]}へ${PERSONAL_VOWS[Math.floor(uniqueIndex / PERSONAL_OBJECTS.length) % PERSONAL_VOWS.length]}`;
    const arenaPersona = ARENA_TITLE_PERSONAS[monster.arenaTitle] || ["勝利の意味を探す", "古い対戦票を持つ", "敗北後の自分を想像できない"];
    const coreVoice = ARENA_CORE_VOICES[monster.coreName] || ["warrior", "俺", "お前", "構える前に一度だけ目を閉じる"];
    const dungeonIdentity = DUNGEON_IDENTITIES[monster.id];
    const authoredIdentity = monster.dialogueProfile ? [
      monster.dialogueProfile,
      monster.dialogueDesire || `${shortName}だけの勝利を探す`,
      monster.dialogueKeepsake || `${shortName}が拾った無名の遺品`,
      monster.dialogueSecret || `${shortName}自身にも明かせない過去を持つ`,
    ] : null;
    const inheritedArenaIdentity = Boolean(monster.arenaTitle && monster.coreName);
    const identity = dungeonIdentity || authoredIdentity || [coreVoice[0], arenaPersona[0], arenaPersona[1], arenaPersona[2]];
    const profile = VOICE_PROFILES[identity[0]] || VOICE_PROFILES.warrior;
    const attribute = ATTRIBUTE_VOICES[monster.attackAttribute] || ATTRIBUTE_VOICES.dark;
    const dangerAttribute = ATTRIBUTE_VOICES[monster.dangerous?.attribute] || attribute;
    const first = inheritedArenaIdentity ? coreVoice[1] : profile.first;
    const second = inheritedArenaIdentity ? coreVoice[2] : profile.second;
    const technique = monster.dangerous?.originalName || monster.dangerous?.name || `${DATA.attributeLabels[monster.dangerous?.attribute || monster.attackAttribute]}奥義`;
    const values = {
      first,
      second,
      shortName,
      station,
      desire: identity[1],
      keepsake: identity[2],
      truth: identity[3],
      mark: monster.arenaOnly ? `${station}で${coreVoice[3]}` : inheritedArenaIdentity ? `${motif}。${coreVoice[3]}` : motif,
      force: dangerAttribute[0],
      verb: dangerAttribute[1],
      omen: dangerAttribute[2],
      scar: attribute[3],
      technique,
    };

    function makeVariants(context) {
      const poolName = {
        encounter: "open",
        battle: "pressure",
        move: "pressure",
        attack: "pressure",
        hit: "wound",
        evade: "pressure",
        hurt: "wound",
        critical: "brink",
        dangerous: "technique",
        dangerousRelease: "technique",
        special: "technique",
        observe: "open",
        defeat: "finish",
      }[context];
      const pool = profile[poolName];
      const tails = CONTEXT_TAILS[context];
      return Array.from({ length: 4 }, (_, slot) => {
        const baseTemplate = pool[(seed + slot * 5 + context.length) % pool.length];
        const base = format(adaptVoice(baseTemplate, identity[0], profile, first, second), values);
        const tail = format(tails[(seed + slot * 7 + uniqueIndex) % tails.length], values);
        let line = cleanSentence(`${base}。${tail}`);
        const firstTechnique = line.indexOf(technique);
        const repeatedTechnique = firstTechnique < 0 ? -1 : line.indexOf(technique, firstTechnique + technique.length);
        if (repeatedTechnique >= 0) {
          line = cleanSentence(`${line.slice(0, repeatedTechnique)}その一撃${line.slice(repeatedTechnique + technique.length)}`);
        }
        if (usedLines.has(line)) line = cleanSentence(`${line}――${shortName}は${motif}`);
        let retry = 0;
        while (usedLines.has(line)) {
          retry += 1;
          line = cleanSentence(`${line}。これは${shortName}が守る${retry + 1}番目の戒めだ`);
        }
        usedLines.add(line);
        return `「${line}」`;
      });
    }

    const speech = Object.fromEntries(CONTEXTS.map((context) => [`${context}Variants`, makeVariants(context)]));
    CONTEXTS.forEach((context) => {
      speech[context] = speech[`${context}Variants`][0];
    });
    records[monster.id] = Object.freeze({
      id: monster.id,
      voiceId: profile === VOICE_PROFILES[identity[0]] ? identity[0] : "warrior",
      label: profile.label,
      cadence: 2 + (seed % 3),
      speech: Object.freeze(speech),
    });

    monster.uniqueTemperament = `${profile.label}／${identity[1]}`;
    monster.uniqueStyle = PROFILE_STYLES[records[monster.id].voiceId] || "warrior";
    monster.speechCadence = records[monster.id].cadence;
    if (monster.dangerous?.originalName) monster.dangerous.name = monster.dangerous.originalName;
    if (monster.research?.[1]) {
      const baseResearch = monster.research[1].replace(/^気質は「[^」]+」。/, "");
      monster.research[1] = `気質は「${profile.label}」。${baseResearch}`;
    }
    delete monster.speech;
  });

  function get(monsterId) {
    return records[monsterId] || null;
  }

  function variants(monsterId, context) {
    return get(monsterId)?.speech?.[`${context}Variants`] || [];
  }

  window.HD_UNIQUE_DIALOGUE = Object.freeze({
    contexts: CONTEXTS,
    count: uniques.length,
    get,
    variants,
  });
})();
