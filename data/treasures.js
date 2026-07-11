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
  ];

  window.HD_DATA.spellbookRanks = spellbookRanks;
  window.HD_DATA.spellbookRanksById = rankById;
  window.HD_DATA.spells = spells;
  window.HD_DATA.spellbooks = spellbooks;
  window.HD_DATA.junkItems = junkItems;
  window.HD_DATA.treasureItems = [...spellbooks, ...junkItems];
})();
