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

  window.HD_DATA.spellbookRanks = spellbookRanks;
  window.HD_DATA.spellbookRanksById = rankById;
  window.HD_DATA.spells = spells;
  window.HD_DATA.spellbooks = spellbooks;
  window.HD_DATA.junkItems = junkItems;
  window.HD_DATA.treasureItems = [...spellbooks, ...junkItems];
})();
