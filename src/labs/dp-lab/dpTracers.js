// Pure step-tracer functions for the DP Lab — no React/JSX/theme dependencies,
// so each can be independently verified (see the standalone verification run
// during planning) without touching the rest of the lab.
//
// Every tracer returns an array of DPStep objects:
//   kind:        "dp1d" | "dp2d" — dispatches which viz layout DPTableViz renders
//   table:       the full table snapshot at this step (null = not yet computed)
//   cursor:      the cell written/highlighted this step — {index} for dp1d, {row,col} for dp2d
//   sources:     the dependency cell(s) that fed `cursor` this step
//   cellKind:    "base" | "compute" | "unreachable" | "done"
//   decision:    optional small text badge — "take"/"skip"/"match"/etc.
//   note:        narration for this step
//   phase:       mirrors DSA01's phase field
//   codePattern: literal substring searched in the user's code to highlight the active line
//                (must be a substring valid in BOTH the JS and Python starter/solution code)

export function traceClimbingStairsTab(n) {
  const steps = [];
  const dp = new Array(n + 1).fill(null);

  dp[1] = 1;
  steps.push({
    kind: "dp1d", table: [...dp], cursor: { index: 1 }, sources: [], cellKind: "base",
    note: "Base case: dp[1] = 1 — one way to climb 1 step",
    phase: "base", codePattern: "dp[1] = 1",
  });

  if (n >= 2) {
    dp[2] = 2;
    steps.push({
      kind: "dp1d", table: [...dp], cursor: { index: 2 }, sources: [], cellKind: "base",
      note: "Base case: dp[2] = 2 — two singles or one double-step",
      phase: "base", codePattern: "dp[2] = 2",
    });
  }

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push({
      kind: "dp1d", table: [...dp], cursor: { index: i },
      sources: [{ index: i - 1 }, { index: i - 2 }], cellKind: "compute",
      note: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
      phase: "fill", codePattern: "dp[i - 1] + dp[i - 2]",
    });
  }

  steps.push({
    kind: "dp1d", table: [...dp], cursor: { index: n }, sources: [], cellKind: "done",
    note: `dp[${n}] = ${dp[n]} ways to climb ${n} steps ✓`,
    phase: "done", codePattern: "return dp[n]",
  });
  return steps;
}

export function traceHouseRobberTab(nums) {
  const steps = [];
  const n = nums.length;
  const dp = new Array(n).fill(null);

  dp[0] = nums[0];
  steps.push({
    kind: "dp1d", table: [...dp], cursor: { index: 0 }, sources: [], cellKind: "base",
    note: `Only house 0 available → dp[0] = nums[0] = ${nums[0]}`,
    phase: "base", codePattern: "dp[0] = nums[0]",
  });

  if (n > 1) {
    dp[1] = Math.max(nums[0], nums[1]);
    steps.push({
      kind: "dp1d", table: [...dp], cursor: { index: 1 }, sources: [{ index: 0 }],
      cellKind: "base", decision: nums[1] >= nums[0] ? "take" : "skip",
      note: `dp[1] = max(nums[0], nums[1]) = max(${nums[0]}, ${nums[1]}) = ${dp[1]}`,
      phase: "base", codePattern: "max(nums[0], nums[1])",
    });
  }

  for (let i = 2; i < n; i++) {
    const skip = dp[i - 1];
    const take = dp[i - 2] + nums[i];
    dp[i] = Math.max(skip, take);
    steps.push({
      kind: "dp1d", table: [...dp], cursor: { index: i },
      sources: [{ index: i - 1 }, { index: i - 2 }], cellKind: "compute",
      decision: take > skip ? "take" : "skip",
      note: `dp[${i}] = max(dp[${i - 1}]=${skip}, dp[${i - 2}]+nums[${i}]=${take}) = ${dp[i]}`,
      phase: "fill", codePattern: "dp[i - 2] + nums[i]",
    });
  }

  steps.push({
    kind: "dp1d", table: [...dp], cursor: { index: n - 1 }, sources: [], cellKind: "done",
    note: `Max loot = dp[${n - 1}] = ${dp[n - 1]} ✓`,
    phase: "done", codePattern: "return dp[n - 1]",
  });
  return steps;
}

export function traceCoinChangeTab(coins, amount) {
  const steps = [];
  const INF = Infinity;
  const dp = new Array(amount + 1).fill(null);
  const view = (a) => a.map((v) => (v === INF ? -1 : v)); // -1 = unreachable, null = not yet computed

  dp[0] = 0;
  steps.push({
    kind: "dp1d", table: view(dp), cursor: { index: 0 }, sources: [], cellKind: "base",
    note: "dp[0] = 0 — zero coins needed for amount 0",
    phase: "base", codePattern: "dp[0] = 0",
  });

  for (let a = 1; a <= amount; a++) {
    let best = INF;
    let bestCoin = null;
    const sources = [];
    for (const c of coins) {
      if (c <= a && dp[a - c] !== null && dp[a - c] !== INF) {
        sources.push({ index: a - c });
        if (dp[a - c] + 1 < best) {
          best = dp[a - c] + 1;
          bestCoin = c;
        }
      }
    }
    dp[a] = best;
    steps.push({
      kind: "dp1d", table: view(dp), cursor: { index: a }, sources,
      cellKind: best === INF ? "unreachable" : "compute",
      decision: bestCoin !== null ? `coin ${bestCoin}` : null,
      note: best === INF
        ? `No coin combination reaches amount ${a} yet`
        : `dp[${a}] = min over coins → coin ${bestCoin}: dp[${a - bestCoin}] + 1 = ${dp[a]}`,
      phase: "fill", codePattern: "dp[a - c] + 1",
    });
  }

  const final = dp[amount] === INF ? -1 : dp[amount];
  steps.push({
    kind: "dp1d", table: view(dp), cursor: { index: amount }, sources: [], cellKind: "done",
    note: final === -1 ? "Unreachable → return -1" : `dp[${amount}] = ${final} ✓`,
    phase: "done", codePattern: "return dp[amount]",
  });
  return steps;
}

export function traceLCSTab(s1, s2) {
  const steps = [];
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

  for (let j = 0; j <= n; j++) dp[0][j] = 0;
  for (let i = 0; i <= m; i++) dp[i][0] = 0;
  steps.push({
    kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: 0, col: 0 }, sources: [],
    cellKind: "base", note: "Empty string shares 0 characters with anything → dp[0][*] = dp[*][0] = 0",
    phase: "base", codePattern: "dp[0][j] = 0",
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        steps.push({
          kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: i, col: j },
          sources: [{ row: i - 1, col: j - 1 }], cellKind: "compute", decision: "match",
          note: `'${s1[i - 1]}' === '${s2[j - 1]}' → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
          phase: "fill", codePattern: "dp[i - 1][j - 1] + 1",
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        steps.push({
          kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: i, col: j },
          sources: [{ row: i - 1, col: j }, { row: i, col: j - 1 }], cellKind: "compute", decision: "no-match",
          note: `'${s1[i - 1]}' ≠ '${s2[j - 1]}' → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`,
          phase: "fill", codePattern: "dp[i][j - 1]",
        });
      }
    }
  }

  steps.push({
    kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: m, col: n }, sources: [], cellKind: "done",
    note: `LCS length = dp[${m}][${n}] = ${dp[m][n]} ✓`,
    phase: "done", codePattern: "return dp[m][n]",
  });
  return steps;
}

export function traceKnapsackTab(values, weights, capacity) {
  const steps = [];
  const n = values.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(null));

  for (let w = 0; w <= capacity; w++) dp[0][w] = 0;
  steps.push({
    kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: 0, col: 0 }, sources: [], cellKind: "base",
    note: "0 items available → dp[0][w] = 0 for every capacity w",
    phase: "base", codePattern: "dp[0][w] = 0",
  });

  for (let i = 1; i <= n; i++) {
    const wt = weights[i - 1];
    const val = values[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (wt > w) {
        dp[i][w] = dp[i - 1][w];
        steps.push({
          kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: i, col: w },
          sources: [{ row: i - 1, col: w }], cellKind: "compute", decision: "skip (too heavy)",
          note: `item ${i} weighs ${wt} > capacity ${w} → dp[${i}][${w}] = dp[${i - 1}][${w}] = ${dp[i][w]}`,
          phase: "fill", codePattern: "dp[i - 1][w]",
        });
      } else {
        const skip = dp[i - 1][w];
        const take = dp[i - 1][w - wt] + val;
        dp[i][w] = Math.max(skip, take);
        steps.push({
          kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: i, col: w },
          sources: [{ row: i - 1, col: w }, { row: i - 1, col: w - wt }], cellKind: "compute",
          decision: take > skip ? "take" : "skip",
          note: `dp[${i}][${w}] = max(skip:${skip}, take:dp[${i - 1}][${w - wt}]+${val}=${take}) = ${dp[i][w]}`,
          phase: "fill", codePattern: "dp[i - 1][w - wt] + val",
        });
      }
    }
  }

  steps.push({
    kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: n, col: capacity }, sources: [], cellKind: "done",
    note: `Max value = dp[${n}][${capacity}] = ${dp[n][capacity]} ✓`,
    phase: "done", codePattern: "return dp[n][capacity]",
  });
  return steps;
}

export function traceEditDistanceTab(s1, s2) {
  const steps = [];
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  steps.push({
    kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: 0, col: 0 }, sources: [], cellKind: "base",
    note: "Converting to/from \"\" costs one insert/delete per character → dp[0][j]=j, dp[i][0]=i",
    phase: "base", codePattern: "dp[0][j] = j",
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        steps.push({
          kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: i, col: j },
          sources: [{ row: i - 1, col: j - 1 }], cellKind: "compute", decision: "match",
          note: `'${s1[i - 1]}' === '${s2[j - 1]}' → no edit. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}`,
          phase: "fill", codePattern: "dp[i - 1][j - 1]",
        });
      } else {
        const rep = dp[i - 1][j - 1];
        const del = dp[i - 1][j];
        const ins = dp[i][j - 1];
        dp[i][j] = 1 + Math.min(rep, del, ins);
        const decision = rep <= del && rep <= ins ? "replace" : del <= ins ? "delete" : "insert";
        steps.push({
          kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: i, col: j },
          sources: [{ row: i - 1, col: j - 1 }, { row: i - 1, col: j }, { row: i, col: j - 1 }],
          cellKind: "compute", decision,
          note: `'${s1[i - 1]}' ≠ '${s2[j - 1]}' → dp[${i}][${j}] = 1+min(replace:${rep}, delete:${del}, insert:${ins}) = ${dp[i][j]} (${decision})`,
          phase: "fill", codePattern: "dp[i - 1][j]",
        });
      }
    }
  }

  steps.push({
    kind: "dp2d", table: dp.map((r) => [...r]), cursor: { row: m, col: n }, sources: [], cellKind: "done",
    note: `Edit distance = dp[${m}][${n}] = ${dp[m][n]} ✓`,
    phase: "done", codePattern: "return dp[m][n]",
  });
  return steps;
}
