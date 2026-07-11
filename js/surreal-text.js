(function () {
  "use strict";

  const fragments = Object.freeze([
    "近くの椅子だけが事情を理解している。",
    "なぜか領収書には『月曜日』とだけ書かれている。",
    "遠くで拍手が一度だけ聞こえたが、誰もいなかった。",
    "この件について床は黙秘を続けている。",
    "専門家によれば、だいたい鳩のせいらしい。",
    "昨日まではもう少し四角かったという証言もある。",
    "本人は道具ではなく親戚だと言い張っている。",
    "迷宮の規約上、これは一応くだものに分類される。",
    "見なかったことにすると、少しだけ温かくなる。",
    "三人の賢者が調べたが、二人は昼寝へ移行した。",
    "ときどき北を向いて反省している。",
    "王国は公式には存在を認めているが、触りたくはない。",
    "匂いだけは立派な会議に出席している。",
    "満月の夜には税金の話を始める。",
    "横から見ると、わずかに謝っているようにも見える。",
    "説明書の最後には小さく『たぶん』とある。",
    "これを発見した学者は現在、盆栽として静養中。",
    "迷宮主も一度拾ったが、気まずそうに戻した。",
    "用途を尋ねると、周囲の時計が三秒だけ遅れる。",
    "食べられない。ただし向こうはこちらを食材だと思っている。",
    "夜になると自分の名前を少し忘れる。",
    "正面から見るぶんには合法である。",
    "冒険者保険では『天気』として処理される。",
    "誰も困ってはいないが、全員が少し困った顔をする。",
    "二個並べると片方が上司になる。",
    "静かな場所では小声で転職を勧めてくる。",
    "これ以上考えると家具側の思うつぼである。",
    "過去に一度だけ選挙へ立候補して落選した。",
    "おおむね無害だが、火曜日だけ態度が大きい。",
    "調査記録の余白に、知らない筆跡で『了解』とある。",
  ]);

  function hash(value) {
    let result = 2166136261;
    for (const character of String(value || "")) {
      result ^= character.codePointAt(0);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function decorate(text, key) {
    if (typeof text !== "string" || !text || hash(key) % 10 !== 0) return text;
    return `${text} なお、${fragments[hash(`${key}:fragment`) % fragments.length]}`;
  }

  function decorateData(data) {
    if (data.__surrealDecorated) return data;
    Object.defineProperty(data, "__surrealDecorated", { value: true, enumerable: false });
    const collections = ["races", "jobs", "personalities", "equipment", "materials", "treasureItems"];
    const visited = new Set();
    collections.forEach((collectionName) => (data[collectionName] || []).forEach((entry) => {
      if (!entry?.id || visited.has(entry)) return;
      visited.add(entry);
      entry.description = decorate(entry.description, `${collectionName}:${entry.id}:description`);
    }));
    (data.monsters || []).forEach((monster) => {
      monster.description = decorate(monster.description, `monster:${monster.id}:description`);
      Object.keys(monster.research || {}).forEach((level) => {
        monster.research[level] = decorate(monster.research[level], `monster:${monster.id}:research:${level}`);
      });
      if (monster.dangerous?.telegraph) monster.dangerous.telegraph = decorate(monster.dangerous.telegraph, `monster:${monster.id}:telegraph`);
    });
    return data;
  }

  function decorateLog(text, logIndex) {
    return decorate(String(text), `log:${logIndex}:${text}`);
  }

  window.HD_SURREAL = Object.freeze({ decorate, decorateData, decorateLog, fragments });
})();
