ObjC.import("Foundation");

function read(path) {
  return ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(
    path, $.NSUTF8StringEncoding, null,
  ));
}

var window = { HD_DATA: {} };
eval(read("data/materials.js"));
eval(read("data/jobs.js"));
eval(read("data/equipment.js"));

const equipment = window.HD_DATA.equipment.filter((item) => !item.artifact && !item.masterOnly && !item.completionOnly);
const attributes = window.HD_DATA.attributes;
const value = (item, key) => Number(item[key] || 0);
const resistanceValue = (item, id) => item.resistances?.[id] === "immune" ? 99 : Number(item.resistances?.[id] || 0);
const jobSignature = (item) => (item.jobs || []).slice().sort().join(",");
const comparisonGroup = (item) => `${item.slot}|${jobSignature(item)}|${Math.floor(Number(item.shopMinFloor || 1) / 10)}`;
const fingerprint = (item) => JSON.stringify({
  slot: item.slot,
  jobs: jobSignature(item),
  attack: value(item, "attack"), defense: value(item, "defense"),
  acceleration: value(item, "acceleration"), hpRegen: value(item, "hpRegen"),
  attackAttributes: item.attackAttributes,
  resistances: attributes.map((id) => resistanceValue(item, id)),
  puzzle: (item.puzzleEffects || []).map((effect) => effect.type),
  setId: item.setId || null,
});

const exactGroups = new Map();
equipment.forEach((item) => {
  const key = fingerprint(item);
  if (!exactGroups.has(key)) exactGroups.set(key, []);
  exactGroups.get(key).push(item);
});
const exactDuplicates = [...exactGroups.values()].filter((group) => group.length > 1);

function dominates(left, right) {
  if (comparisonGroup(left) !== comparisonGroup(right)) return false;
  if ((left.attackAttributes || []).some((id) => !(right.attackAttributes || []).includes(id))) return false;
  const leftValues = ["attack", "defense", "acceleration", "hpRegen"].map((key) => value(left, key));
  const rightValues = ["attack", "defense", "acceleration", "hpRegen"].map((key) => value(right, key));
  const resistanceLeft = attributes.map((id) => resistanceValue(left, id));
  const resistanceRight = attributes.map((id) => resistanceValue(right, id));
  const noWorse = leftValues.every((number, index) => number >= rightValues[index])
    && resistanceLeft.every((number, index) => number >= resistanceRight[index]);
  const strictlyBetter = leftValues.some((number, index) => number > rightValues[index])
    || resistanceLeft.some((number, index) => number > resistanceRight[index]);
  return noWorse && strictlyBetter && !(right.puzzleEffects || []).length && !right.setId;
}

const groups = new Map();
equipment.forEach((item) => {
  const key = comparisonGroup(item);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(item);
});
const dominated = [];
groups.forEach((items) => {
  items.forEach((candidate) => {
    const superior = items.find((item) => item !== candidate && dominates(item, candidate));
    if (superior) dominated.push({ inferior: candidate.id, superior: superior.id, group: comparisonGroup(candidate) });
  });
});

const report = {
  total: window.HD_DATA.equipment.length,
  auditedNormalEquipment: equipment.length,
  puzzleEquipment: window.HD_DATA.equipment.filter((item) => item.puzzleEffects?.length).length,
  exactDuplicateGroups: exactDuplicates.length,
  exactDuplicateItems: exactDuplicates.reduce((sum, group) => sum + group.length, 0),
  exactDuplicateRate: Number((exactDuplicates.reduce((sum, group) => sum + group.length, 0) / window.HD_DATA.equipment.length * 100).toFixed(2)),
  removableExactDuplicates: exactDuplicates.reduce((sum, group) => sum + group.length - 1, 0),
  dominatedItems: dominated.length,
  largestExactDuplicateGroups: exactDuplicates
    .sort((left, right) => right.length - left.length)
    .slice(0, 12)
    .map((group) => group.map((item) => item.id)),
  dominanceExamples: dominated.slice(0, 40),
};

JSON.stringify(report, null, 2);
