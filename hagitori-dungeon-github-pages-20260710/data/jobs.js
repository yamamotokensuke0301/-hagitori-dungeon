(function () {
  window.HD_DATA = window.HD_DATA || {};

  window.HD_DATA.jobs = [
    {
      id: "swordsman",
      name: "剣士",
      hp: 38,
      attack: 7,
      defense: 2,
      baseAttackAttribute: "slash",
      skill: { id: "sever", name: "切断撃", attribute: "slash", power: 1.45, tag: "sever" },
      description: "斬属性と部位切断素材に強い。扱いやすい前衛職。",
    },
    {
      id: "heavy",
      name: "重戦士",
      hp: 46,
      attack: 6,
      defense: 4,
      baseAttackAttribute: "blunt",
      skill: { id: "crush", name: "粉砕撃", attribute: "blunt", power: 1.5, tag: "crush" },
      description: "打属性と甲殻破壊素材に強い。防御力が高い。",
    },
    {
      id: "hunter",
      name: "狩人",
      hp: 34,
      attack: 6,
      defense: 2,
      baseAttackAttribute: "slash",
      skill: { id: "precise", name: "精密射撃", attribute: "slash", power: 1.25, tag: "precise" },
      description: "素材品質を損ないにくい。特殊素材狙いに向く。",
    },
    {
      id: "researcher",
      name: "魔物調査官",
      hp: 30,
      attack: 4,
      defense: 1,
      baseAttackAttribute: "blunt",
      skill: { id: "observe_plus", name: "観察", attribute: null, power: 0, tag: "observe" },
      description: "戦闘力は低いが、調査記録を進めやすい。",
    },
  ];
})();
