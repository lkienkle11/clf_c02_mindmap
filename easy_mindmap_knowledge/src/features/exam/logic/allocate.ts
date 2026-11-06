/**
 * Splits `min(total, sum(caps))` across buckets in proportion to `weights`, largest remainder style.
 *
 * - Buckets are the keys of `weights` and `caps` together; a missing weight or cap counts as 0.
 * - No bucket gets more than its cap. Shares that capped buckets cannot take go to buckets with room, by weight.
 * - `minEach` is reserved first for buckets whose cap is at least `minEach`; if the total cannot cover all of them, each gets less.
 * - Weight-0 buckets receive only what the weighted buckets cannot absorb.
 * - Deterministic: when fractional parts tie, the earlier key wins.
 *
 * Caps and total are counts: NaN or negative values count as 0 and fractions are floored.
 * Weights that are not finite positive numbers count as 0.
 */
export function allocate(
  weights: Record<string, number>,
  caps: Record<string, number>,
  total: number,
  minEach = 0,
): Record<string, number> {
  const keys = [...new Set([...Object.keys(weights), ...Object.keys(caps)])];
  const weight = keys.map((k) => positiveWeight(weights[k]));
  const cap = keys.map((k) => count(caps[k]));
  const target = Math.min(count(total), sum(cap));

  const floorEach = count(minEach);
  const eligible = keys.map((_, i) => i).filter((i) => floorEach > 0 && cap[i] >= floorEach);
  const base = keys.map(() => 0);
  if (eligible.length > 0) {
    const each = Math.min(floorEach, Math.floor(target / eligible.length));
    for (const i of eligible) base[i] = each;
  }

  const room = cap.map((c, i) => c - base[i]);
  const budget = target - sum(base);
  const weightedRoom = sum(room.filter((_, i) => weight[i] > 0));
  const weightedBudget = Math.min(budget, weightedRoom);
  const share = waterFill(weight, room, weightedBudget);
  const rest = budget - weightedBudget;
  if (rest > 0) {
    const zeroWeightRoom = room.map((r, i) => (weight[i] > 0 ? 0 : r));
    waterFill(zeroWeightRoom, room, rest).forEach((x, i) => {
      share[i] += x;
    });
  }

  const counts = roundToBudget(share, room, budget);
  return Object.fromEntries(keys.map((k, i) => [k, base[i] + counts[i]]));
}

/**
 * Real-valued water-filling: bucket i gets `lambda * weight[i]`, clipped at `room[i]`,
 * with `lambda` raised until `budget` is used up. Only buckets with weight > 0 and room > 0 take part.
 */
function waterFill(weight: number[], room: number[], budget: number): number[] {
  const share = weight.map(() => 0);
  let open = weight.map((_, i) => i).filter((i) => weight[i] > 0 && room[i] > 0);
  let left = budget;
  while (open.length > 0 && left > 0) {
    const perWeight = left / sum(open.map((i) => weight[i]));
    const full = open.filter((i) => perWeight * weight[i] >= room[i]);
    if (full.length === 0) {
      for (const i of open) share[i] = perWeight * weight[i];
      break;
    }
    for (const i of full) {
      share[i] = room[i];
      left -= room[i];
    }
    open = open.filter((i) => !full.includes(i));
  }
  return share;
}

/** Fractional parts closer than this are treated as equal, so float noise cannot reorder exact ties. */
const FRACTION_TIE = 1e-9;

/**
 * Turns real shares into whole numbers summing to `budget`: take the floors, then give the
 * missing units to the largest fractional parts (earlier key on ties), never past a bucket's room.
 */
function roundToBudget(share: number[], room: number[], budget: number): number[] {
  const counts = share.map((x) => Math.floor(x));
  let missing = budget - sum(counts);
  const order = share
    .map((_, i) => i)
    .filter((i) => share[i] > counts[i] && counts[i] < room[i])
    .sort((a, b) => {
      const gap = share[b] - counts[b] - (share[a] - counts[a]);
      return Math.abs(gap) > FRACTION_TIE ? gap : a - b;
    });
  for (const i of order) {
    if (missing <= 0) break;
    counts[i] += 1;
    missing -= 1;
  }
  return counts;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** Whole, non-negative count: NaN and negatives count as 0. */
function count(value: number): number {
  return value > 0 ? Math.floor(value) : 0;
}

/** Finite positive weight: anything else counts as 0. */
function positiveWeight(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}
