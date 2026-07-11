(function () {
  "use strict";

  window.HD_DATA = window.HD_DATA || {};

  const spellbookRanks = [
    { id: "beginner", label: "初級", order: 1, rarityWeight: 60, minFloor: 1, baseSellPrice: 28 },
    { id: "intermediate", label: "中級", order: 2, rarityWeight: 24, minFloor: 8, baseSellPrice: 75 },
    { id: "advanced", label: "上級", order: 3, rarityWeight: 9, minFloor: 22, baseSellPrice: 180 },
    { id: "supreme", label: "最上級", order: 4, rarityWeight: 3, minFloor: 48, baseSellPrice: 460 },
    { id: "forbidden", label: "禁断", order: 5, rarityWeight: 0.6, minFloor: 72, baseSellPrice: 1200 },
  ];

  const spells = [
    { id: "ember_shot", name: "火の粉弾", rank: "beginner", attribute: "fire", power: 1.15, range: 4, jobs: ["mage", "spellblade"], description: "小さな火弾をまっすぐ飛ばす、火術の入門魔法。" },
    { id: "water_needle", name: "水針", rank: "beginner", attribute: "water", power: 1.1, range: 5, jobs: ["mage", "spellblade", "priest"], description: "圧縮した水を針のように撃ち出す扱いやすい術。" },
    { id: "guiding_ray", name: "導きの光", rank: "beginner", attribute: "light", power: 1.05, range: 5, jobs: ["mage", "priest"], description: "闇を照らす細い光を敵へ向ける初歩の光術。" },

    { id: "thunder_lance", name: "雷槍", rank: "intermediate", attribute: "thunder", power: 1.45, range: 6, jobs: ["mage", "spellblade"], description: "槍状に束ねた雷を射線上の敵へ突き立てる。" },
    { id: "ice_shards", name: "氷晶散華", rank: "intermediate", attribute: "ice", power: 1.4, range: 5, jobs: ["mage", "spellblade"], description: "複数の氷片を花弁のように散らして切り刻む。" },
    { id: "wind_cutter", name: "風裂刃", rank: "intermediate", attribute: "wind", power: 1.5, range: 6, jobs: ["mage", "spellblade", "priest"], description: "見えない風の刃を遠くまで走らせる中級術。" },

    { id: "acid_nova", name: "酸星爆", rank: "advanced", attribute: "acid", power: 1.9, range: 5, jobs: ["mage", "spellblade"], description: "着弾地点で強酸の星を弾けさせ、硬い外殻を侵す。" },
    { id: "night_chain", name: "夜鎖", rank: "advanced", attribute: "dark", power: 2, range: 6, jobs: ["mage", "priest"], description: "影から伸びる鎖で遠方の敵を闇へ縫い留める。" },
    { id: "earth_javelin", name: "地脈投槍", rank: "advanced", attribute: "earth", power: 2.05, range: 6, jobs: ["mage", "spellblade", "priest"], description: "地脈から石槍を抜き出し、強烈な勢いで投射する。" },

    { id: "steel_comet", name: "鋼天彗星", rank: "supreme", attribute: "steel", power: 2.55, range: 6, jobs: ["mage", "spellblade"], description: "天井から鋼の彗星を落とす、破城級の最上位魔法。" },
    { id: "mirage_maze", name: "千景迷宮", rank: "supreme", attribute: "illusion", power: 2.45, range: 6, jobs: ["mage", "priest"], description: "千の偽景を一瞬で重ね、敵の知覚そのものを砕く。" },
    { id: "grave_benediction", name: "墓標祝祷", rank: "supreme", attribute: "curse", power: 2.7, range: 6, jobs: ["mage", "priest"], description: "墓標へ捧げた祈りを反転させ、強烈な呪いとして放つ。" },

    { id: "black_sun", name: "黒陽墜落", rank: "forbidden", attribute: "dark", power: 3.45, range: 6, jobs: ["mage"], description: "偽りの黒い太陽を迷宮へ落とす、封印指定の殲滅術。" },
    { id: "name_erasure", name: "真名抹消", rank: "forbidden", attribute: "curse", power: 3.7, range: 6, jobs: ["mage", "priest"], description: "対象の真名を術式から消し去る、使用を禁じられた呪法。" },
    { id: "heaven_sunder", name: "天断光", rank: "forbidden", attribute: "light", power: 3.6, range: 6, jobs: ["mage", "spellblade", "priest"], description: "迷宮の天蓋ごと敵を断つと伝わる禁断の光術。" },
  ];

  const rankById = Object.fromEntries(spellbookRanks.map((rank) => [rank.id, rank]));
  const spellbooks = spells.map((spell, index) => {
    const rank = rankById[spell.rank];
    return {
      id: `spellbook_${spell.id}`,
      type: "spellbook",
      name: `${rank.label}魔法書「${spell.name}」`,
      spellId: spell.id,
      rank: rank.id,
      rankLabel: rank.label,
      sellPrice: rank.baseSellPrice + (index % 3) * Math.max(2, Math.round(rank.baseSellPrice * 0.08)),
      rarityWeight: rank.rarityWeight,
      minFloor: rank.minFloor,
      stackable: true,
      description: `自宅で読むと${spell.name}を習得する。読むと魔法書は失われる。`,
    };
  });

  const junkItems = [
    { id: "junk_bent_spoon", type: "junk", name: "ひどく曲がったスプーン", sellPrice: 2, rarityWeight: 22, minFloor: 1, stackable: true, description: "何をすくおうとしたのか分からないほど曲がっている。" },
    { id: "junk_boot_left", type: "junk", name: "左だけの長靴", sellPrice: 3, rarityWeight: 20, minFloor: 1, stackable: true, description: "右足用は迷宮のどこかで今も待っている。" },
    { id: "junk_cracked_mug", type: "junk", name: "罅割れた酒杯", sellPrice: 4, rarityWeight: 18, minFloor: 1, stackable: true, description: "底の罅から酒より先に思い出が漏れそうだ。" },
    { id: "junk_rusty_key", type: "junk", name: "錆びきった鍵", sellPrice: 6, rarityWeight: 17, minFloor: 2, stackable: true, description: "対応する錠前はとうに朽ちたらしい。" },
    { id: "junk_blank_map", type: "junk", name: "何も描かれていない地図", sellPrice: 8, rarityWeight: 15, minFloor: 4, stackable: true, description: "余白だけは驚くほど広大な古地図。" },
    { id: "junk_chipped_die", type: "junk", name: "七の目がある骰子", sellPrice: 12, rarityWeight: 13, minFloor: 6, stackable: true, description: "勝負には使えないが、いかさま師には人気がある。" },
    { id: "junk_silent_bell", type: "junk", name: "鳴らない小鐘", sellPrice: 16, rarityWeight: 11, minFloor: 10, stackable: true, description: "振ると音の代わりに冷たい気配だけが残る。" },
    { id: "junk_glass_eye", type: "junk", name: "曇った義眼", sellPrice: 22, rarityWeight: 10, minFloor: 14, stackable: true, description: "こちらを見返しているような錯覚だけは鮮明だ。" },
    { id: "junk_clock_hand", type: "junk", name: "逆回りの時計針", sellPrice: 30, rarityWeight: 8, minFloor: 20, stackable: true, description: "文字盤を失ってなお、昨日の方角を指し続ける。" },
    { id: "junk_false_crown", type: "junk", name: "王を選ばない紙冠", sellPrice: 45, rarityWeight: 6, minFloor: 28, stackable: true, description: "被る者すべてを平等にみすぼらしく見せる。" },
    { id: "junk_moon_shard", type: "junk", name: "月を名乗るガラス片", sellPrice: 65, rarityWeight: 5, minFloor: 38, stackable: true, description: "光へかざすと、どの角度からでも三日月に見える。" },
    { id: "junk_dry_mermaid_scale", type: "junk", name: "干からびた人魚の鱗", sellPrice: 90, rarityWeight: 4, minFloor: 50, stackable: true, description: "本物かどうかは誰も保証しないが、土産物としては上等。" },
    { id: "junk_empty_reliquary", type: "junk", name: "空っぽの聖遺物箱", sellPrice: 125, rarityWeight: 3, minFloor: 62, stackable: true, description: "中身より箱の細工に価値が残った。" },
    { id: "junk_fossilized_shadow", type: "junk", name: "化石になった影", sellPrice: 180, rarityWeight: 2, minFloor: 76, stackable: true, description: "壁から剥がされた影が薄い板状に固まっている。" },
    { id: "junk_last_receipt", type: "junk", name: "世界最後の領収書", sellPrice: 260, rarityWeight: 1.2, minFloor: 88, stackable: true, description: "但し書きは『世界一式』。印鑑だけが妙に新しい。" },
    { id: "junk_three_legged_stool", type: "junk", name: "二本半脚の丸椅子", sellPrice: 2, rarityWeight: 22, minFloor: 1, stackable: true, description: "三本目の脚が途中で人生を諦めている。" },
    { id: "junk_wet_match", type: "junk", name: "永久に湿ったマッチ", sellPrice: 3, rarityWeight: 21, minFloor: 1, stackable: true, description: "火のそばへ置くほど湿っていく反抗的な一本。" },
    { id: "junk_wrong_sock", type: "junk", name: "誰の足にも合わない靴下", sellPrice: 4, rarityWeight: 19, minFloor: 2, stackable: true, description: "伸びるのに、履こうとした足だけは頑として拒む。" },
    { id: "junk_tiny_door", type: "junk", name: "親指ほどの扉", sellPrice: 5, rarityWeight: 18, minFloor: 3, stackable: true, description: "開くが、向こう側も同じ扉の裏側である。" },
    { id: "junk_apology_note", type: "junk", name: "宛名のない反省文", sellPrice: 7, rarityWeight: 16, minFloor: 4, stackable: true, description: "百回『もう宝箱へ隠れません』と書かれている。" },
    { id: "junk_square_coin", type: "junk", name: "転がらない丸金貨", sellPrice: 9, rarityWeight: 15, minFloor: 5, stackable: true, description: "見た目は丸いのに、落とすと必ず四角く止まる。" },
    { id: "junk_self_stirring_fork", type: "junk", name: "勝手に混ぜるフォーク", sellPrice: 11, rarityWeight: 14, minFloor: 7, stackable: true, description: "皿が空でも熱心に何かを混ぜ続ける。" },
    { id: "junk_cowardly_knife", type: "junk", name: "食材を怖がる果物ナイフ", sellPrice: 14, rarityWeight: 12, minFloor: 9, stackable: true, description: "林檎へ近づけると鞘の奥へ震えながら引っ込む。" },
    { id: "junk_undelivered_letter", type: "junk", name: "昨日へ届かなかった手紙", sellPrice: 18, rarityWeight: 11, minFloor: 11, stackable: true, description: "消印だけが明日の日付になっている。" },
    { id: "junk_sleepy_compass", type: "junk", name: "昼寝する方位磁針", sellPrice: 21, rarityWeight: 10, minFloor: 13, stackable: true, description: "肝心な分かれ道に来ると針が横になって眠る。" },
    { id: "junk_invisible_inkpot", type: "junk", name: "中身だけ見える透明インク壺", sellPrice: 25, rarityWeight: 9.5, minFloor: 16, stackable: true, description: "壺は見えないが、中の透明インクだけはなぜか見える。" },
    { id: "junk_borrowed_moustache", type: "junk", name: "返却期限切れの付け髭", sellPrice: 28, rarityWeight: 9, minFloor: 18, stackable: true, description: "裏側に『王様より拝借』と小さく書かれている。" },
    { id: "junk_echo_bottle", type: "junk", name: "咳払い入りの小瓶", sellPrice: 34, rarityWeight: 8, minFloor: 21, stackable: true, description: "栓を開けると気まずそうな咳払いが一度だけ聞こえる。" },
    { id: "junk_petrified_sandwich", type: "junk", name: "石化した三角サンド", sellPrice: 39, rarityWeight: 7.5, minFloor: 24, stackable: true, description: "具材まで完璧に石。歯型らしき跡だけが残る。" },
    { id: "junk_retired_wand", type: "junk", name: "引退届を出した魔法杖", sellPrice: 48, rarityWeight: 6.5, minFloor: 28, stackable: true, description: "振ると火球ではなく有給休暇の申請書が出る。" },
    { id: "junk_second_place_medal", type: "junk", name: "一人大会の銀メダル", sellPrice: 54, rarityWeight: 6, minFloor: 32, stackable: true, description: "参加者一名。優勝者の欄だけ空白になっている。" },
    { id: "junk_rain_fragment", type: "junk", name: "降り損ねた雨粒", sellPrice: 62, rarityWeight: 5.5, minFloor: 36, stackable: true, description: "触れると指先だけ一瞬曇り空になる。" },
    { id: "junk_half_prophecy", type: "junk", name: "後半だけの予言書", sellPrice: 72, rarityWeight: 5, minFloor: 40, stackable: true, description: "『――というわけで世界は助かった』から始まる。" },
    { id: "junk_miniature_throne", type: "junk", name: "威厳だけ実物大の小王座", sellPrice: 84, rarityWeight: 4.5, minFloor: 45, stackable: true, description: "人形用の大きさだが、前に立つとなぜか跪きたくなる。" },
    { id: "junk_orphaned_nameplate", type: "junk", name: "主を忘れた名札", sellPrice: 98, rarityWeight: 4, minFloor: 50, stackable: true, description: "覗き込むたび違う名前を名乗り、どれも少し寂しそうだ。" },
    { id: "junk_warm_snowball", type: "junk", name: "溶けない温雪玉", sellPrice: 112, rarityWeight: 3.7, minFloor: 55, stackable: true, description: "手のひらより温かいのに、永遠に雪のままでいる。" },
    { id: "junk_demon_coupon", type: "junk", name: "魔王城の一割引券", sellPrice: 130, rarityWeight: 3.3, minFloor: 60, stackable: true, description: "有効期限は千年前。併用不可の条件だけ十二頁ある。" },
    { id: "junk_angel_feather_duster", type: "junk", name: "聖性を失った羽根箒", sellPrice: 148, rarityWeight: 3, minFloor: 65, stackable: true, description: "埃はよく取れるが、罪までは落としてくれない。" },
    { id: "junk_dragon_baby_tooth", type: "junk", name: "竜を自称する乳歯", sellPrice: 165, rarityWeight: 2.7, minFloor: 70, stackable: true, description: "どう見ても人間の乳歯だが、火へ近づけると威嚇する。" },
    { id: "junk_folded_horizon", type: "junk", name: "四つ折りの地平線", sellPrice: 190, rarityWeight: 2.3, minFloor: 75, stackable: true, description: "広げようとすると、部屋のほうが遠くへ伸びる。" },
    { id: "junk_unborn_memory", type: "junk", name: "まだ生まれていない思い出", sellPrice: 215, rarityWeight: 2, minFloor: 80, stackable: true, description: "懐かしいのに、誰の人生にもまだ起きていない。" },
    { id: "junk_retired_constellation", type: "junk", name: "引退した星座の名札", sellPrice: 245, rarityWeight: 1.7, minFloor: 85, stackable: true, description: "夜空の配置換えで職を失ったらしい。" },
    { id: "junk_spare_reality", type: "junk", name: "予備の現実一枚", sellPrice: 290, rarityWeight: 1.4, minFloor: 90, stackable: true, description: "破れた現実へ貼る補修布。説明書には『気休め』とある。" },
    { id: "junk_god_doodle", type: "junk", name: "神の会議中の落書き", sellPrice: 340, rarityWeight: 1.1, minFloor: 95, stackable: true, description: "世界創造案の横に、妙に上手な猫が描かれている。" },
    { id: "junk_end_credit", type: "junk", name: "世界のエンドロール切れ端", sellPrice: 420, rarityWeight: 0.8, minFloor: 99, stackable: true, description: "出演者欄に冒険者の名前があるが、役名は『通行人』。" },
    { id: "junk_luxury_royal_teacup", type: "junk", junkTier: "luxury", name: "◇亡国王家の金縁茶杯", sellPrice: 750, rarityWeight: 0.65, minFloor: 32, stackable: true, description: "飲み口の金細工だけで小さな家が買える。茶渋も王家由来らしい。" },
    { id: "junk_luxury_elven_music_box", type: "junk", junkTier: "luxury", name: "◇千年樹製の自鳴楽箱", sellPrice: 920, rarityWeight: 0.55, minFloor: 44, stackable: true, description: "蓋を閉じている間だけ、失われた森の夜曲を奏でる。" },
    { id: "junk_luxury_dragon_decanter", type: "junk", junkTier: "luxury", name: "◇竜王晩餐会の酒器", sellPrice: 1150, rarityWeight: 0.46, minFloor: 56, stackable: true, description: "空だが、内側には三百年ものの竜酒の香りが残る。" },
    { id: "junk_luxury_demon_chess", type: "junk", junkTier: "luxury", name: "◇魔界侯爵の黒曜棋盤", sellPrice: 1420, rarityWeight: 0.38, minFloor: 66, stackable: true, description: "駒が勝手に動く。対局料として寿命ではなく現金を要求する良心的な品。" },
    { id: "junk_luxury_angel_telescope", type: "junk", junkTier: "luxury", name: "◇天上庭園の星見筒", sellPrice: 1800, rarityWeight: 0.3, minFloor: 76, stackable: true, description: "昼でも星が見えるが、星のほうからもこちらを観察している。" },
    { id: "junk_ultra_creation_pen", type: "junk", junkTier: "ultra_luxury", name: "♛創世会議の予備羽根筆", sellPrice: 4000, rarityWeight: 0.16, minFloor: 70, stackable: true, description: "一度も使われなかった世界創造用の筆。試し書きは禁止されている。" },
    { id: "junk_ultra_first_crown", type: "junk", junkTier: "ultra_luxury", name: "♛最初の王が断った王冠", sellPrice: 5600, rarityWeight: 0.12, minFloor: 80, stackable: true, description: "権力ではなく、それを拒んだ決断に途方もない価値が付いている。" },
    { id: "junk_ultra_timepiece", type: "junk", junkTier: "ultra_luxury", name: "♛宇宙開闢前の懐中時計", sellPrice: 7200, rarityWeight: 0.09, minFloor: 88, stackable: true, description: "針は時刻ではなく、時間という概念が始まるまでの残りを示す。" },
    { id: "junk_ultra_god_coin", type: "junk", junkTier: "ultra_luxury", name: "♛神々の閉店記念金貨", sellPrice: 9000, rarityWeight: 0.065, minFloor: 94, stackable: true, description: "神代最後の営業日に一枚だけ配られた。使える店はもう存在しない。" },
    { id: "junk_ultra_universe_box", type: "junk", junkTier: "ultra_luxury", name: "♛未使用宇宙の化粧箱", sellPrice: 12000, rarityWeight: 0.04, minFloor: 99, stackable: true, description: "中身は空。正確には、まだ何も始まっていない完全な空が詰まっている。" },
  ];

  const expandedJunkSubjects = [
    ["片方だけ拍手する手袋", "もう片方を待たず、夜中に一度だけ乾いた拍手をする。"],
    ["迷子になった玄関マット", "踏むと知らない家へ帰ってきた気分になる。"],
    ["決して沸かない薬缶", "火に掛けると中の水が冷静さを取り戻す。"],
    ["逆さに育った鉢植え", "根が空を求め、葉が土へ潜ろうとしている。"],
    ["嘘だけ映す手鏡", "持ち主が一番信じたい顔を映してしまう。"],
    ["休日を主張する歯車", "平日には回るが、迷宮暦の祝日は頑として動かない。"],
    ["一段足りない梯子", "どこへ掛けても最後の一歩だけ届かない。"],
    ["雨音を忘れた傘", "濡れは防ぐが、雨粒がすべて無音になる。"],
    ["寝返りを打つ枕石", "眠る者より先に快適な位置を探し続ける。"],
    ["勝手に閉店する看板", "客が来るたび『本日休業』へ裏返る。"],
    ["余白を食べる栞", "本へ挟むと文字ではなく余白だけが少し減る。"],
    ["出口を嫌う蝶番", "扉を開けるほど入口側へ戻そうと軋む。"],
    ["音痴な音叉", "叩くたび本人だけは正しいと思っている音を出す。"],
    ["昨日を温める湯たんぽ", "抱くと過ぎた冬の記憶だけがぬくもる。"],
    ["持ち主を値踏みする秤", "物を載せても、針は持ち主の未練の重さを示す。"],
  ];
  const expandedJunkConditions = [
    ["半透明の", "向こう側は見えるが、見られたくない部分だけ曇る"],
    ["妙に礼儀正しい", "触れるたび小さく会釈する"],
    ["月曜だけ重い", "週の始まりを誰より深刻に受け止めている"],
    ["勇者のお下がりを自称する", "英雄譚の肝心な部分だけ記憶が曖昧だ"],
    ["三秒先から届いた", "今起きる小さな失敗だけ先に知っている"],
    ["猫にだけ高価に見える", "猫が前を通ると王冠のような威厳を放つ"],
  ];
  expandedJunkSubjects.forEach(([subject, description], subjectIndex) => {
    expandedJunkConditions.forEach(([condition, oddity], conditionIndex) => {
      const depth = 1 + ((subjectIndex * 7 + conditionIndex * 5) % 99);
      junkItems.push({
        id: `junk_expanded_${subjectIndex + 1}_${conditionIndex + 1}`,
        type: "junk",
        name: `${condition}${subject}`,
        sellPrice: 3 + depth * 3 + conditionIndex * 2,
        rarityWeight: Math.max(0.85, 22 - depth * 0.2),
        minFloor: depth,
        stackable: true,
        description: `${description}${oddity}という、用途不明の珍品。`,
      });
    });
  });

  const additionalLuxuryJunk = [
    ["junk_luxury_moonlit_violin", "◇月光伯の無弦ヴァイオリン", 2050, 34, "弦はないが、月明かりが差すと宮廷舞曲を奏でる。"],
    ["junk_luxury_mermaid_mirror", "◇人魚女王の真珠手鏡", 2380, 40, "海を離れてなお、鏡面には深海の宮殿が揺れる。"],
    ["junk_luxury_giant_cufflink", "◇巨人皇帝の片袖留め", 2700, 46, "人間には盾ほど大きいが、細工は髪の毛より精密。"],
    ["junk_luxury_phantom_carpet", "◇幽王宮の透過絨毯", 3150, 52, "床へ敷くと絨毯だけが一階下へ落ちていく。"],
    ["junk_luxury_sun_chalice", "◇太陽神殿の夕映え杯", 3600, 58, "注いだ水が夕焼け色に染まり、味だけ朝露になる。"],
    ["junk_luxury_dwarven_clock", "◇鉱山王の純金鳩時計", 4200, 64, "時刻になると鳩ではなく小さな坑夫が出て休憩を要求する。"],
    ["junk_luxury_fairy_chandelier", "◇妖精宮の携帯シャンデリア", 4850, 70, "掌に載る大きさで、百人分の舞踏会を照らす。"],
    ["junk_luxury_witch_teaset", "◇大魔女の逆流茶器", 5500, 76, "飲み終えた紅茶が注ぎ口から勝手に戻ってくる。"],
    ["junk_luxury_star_atlas", "◇星侯爵の銀河革地図", 6300, 84, "開くたび星座の領地境界が書き換わる。"],
    ["junk_luxury_dragon_throne_leg", "◇竜帝玉座の黄金脚一本", 7200, 92, "一本だけでも座る者のいない威圧感を放っている。"],
  ];
  additionalLuxuryJunk.forEach(([id, name, sellPrice, minFloor, description], index) => junkItems.push({ id, type: "junk", junkTier: "luxury", name, sellPrice, rarityWeight: 0.28 - index * 0.018, minFloor, stackable: true, description }));

  const additionalUltraJunk = [
    ["junk_ultra_unwritten_epic", "♛まだ書かれていない英雄叙事詩", 13500, 72, "頁を開く者の未来を主人公にするが、第一章で必ず筆が止まる。"],
    ["junk_ultra_heaven_key", "♛天国の勝手口の合鍵", 15000, 75, "正門を通れない者向けらしいが、肝心の勝手口が見つからない。"],
    ["junk_ultra_hell_receipt", "♛地獄全階層の完済証明書", 16800, 78, "あらゆる罪の支払い済み印がある。名義だけが空欄。"],
    ["junk_ultra_first_lie", "♛世界で最初につかれた嘘の標本", 19000, 81, "封印瓶の中で今も真実らしい顔をしている。"],
    ["junk_ultra_zero_shadow", "♛光が生まれる前の原初影", 21500, 84, "照らしても消えず、暗闇では逆に白く浮かぶ。"],
    ["junk_ultra_fate_eraser", "♛運命台帳専用の消しゴム", 24500, 87, "一度使われた跡があるが、何が消えたかは誰も思い出せない。"],
    ["junk_ultra_god_spare_halo", "♛神が忘れた予備の後光", 28000, 90, "背負うと荘厳だが、少しだけ左へ傾いている。"],
    ["junk_ultra_eternity_wrapper", "♛永遠を包んでいた包装紙", 32000, 93, "中身より長く残る保証書が裏面に貼られている。"],
    ["junk_ultra_world_seed_shell", "♛孵化済み世界卵の殻", 37000, 96, "内側に見知らぬ大陸の痕跡がこびりついている。"],
    ["junk_ultra_creator_lunchbox", "♛創造神の食べ残し弁当箱", 44000, 99, "隅に残った一粒が惑星らしい軌道で回っている。"],
  ];
  additionalUltraJunk.forEach(([id, name, sellPrice, minFloor, description], index) => junkItems.push({ id, type: "junk", junkTier: "ultra_luxury", name, sellPrice, rarityWeight: 0.038 - index * 0.0032, minFloor, stackable: true, description }));

  const legendJunk = [
    ["junk_legend_deleted_tomorrow", "♚削除された明日そのもの", 120000, 96, "存在しないはずの一日が、薄い暦の形で折り畳まれている。"],
    ["junk_legend_creator_nameplate", "♚創造主が辞職時に外した名札", 180000, 97, "裏面には『後任募集中、経験不問』と刻まれている。"],
    ["junk_legend_universe_receipt", "♚全宇宙返品時の控え", 260000, 98, "返品理由は『思っていた色と違う』。再購入期限は永遠に過ぎている。"],
    ["junk_legend_last_save", "♚世界終了直前の最後のセーブデータ", 380000, 99, "読み込める機械はないが、中から冒険者を呼ぶ声がする。"],
    ["junk_legend_nothing_fragment", "♚無が割れた時に出た破片", 600000, 100, "何もないはずなのに重く、観測するほど周囲の存在感を奪う。"],
  ];
  legendJunk.forEach(([id, name, sellPrice, minFloor, description], index) => junkItems.push({ id, type: "junk", junkTier: "legend", name, sellPrice, rarityWeight: 0.004 - index * 0.00065, minFloor, stackable: true, description }));

  window.HD_DATA.spellbookRanks = spellbookRanks;
  window.HD_DATA.spellbookRanksById = rankById;
  window.HD_DATA.spells = spells;
  window.HD_DATA.spellbooks = spellbooks;
  window.HD_DATA.junkItems = junkItems;
  window.HD_DATA.treasureItems = [...spellbooks, ...junkItems];
})();
