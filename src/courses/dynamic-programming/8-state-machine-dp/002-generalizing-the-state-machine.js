export default {
  id: 'dp8-002',
  slug: 'generalizing-the-state-machine',
  chapter: 'dp8',
  order: 2,
  title: 'Generalizing the State Machine: k Allowed Transactions',
  subtitle: 'When the number of "modes" is a variable, not a fixed handful',
  tags: ['dynamic programming', 'state machine dp', 'stock trading dp', 'k transactions'],
  aliases: 'state machine dp generalized k transactions stock buy sell iv',

  hook: {
    question: 'Lesson 1\'s state machines had a FIXED, small number of named states (hold/sold/rest, or hold/cash) — the same three or two states applied no matter how long the price array was. What happens when the natural number of "modes" is itself a parameter of the problem — say, at most k buy-sell transactions allowed, for an arbitrary k passed in? The state machine doesn\'t stay fixed-size; it needs one hold/cash PAIR of states per transaction count, and the states must be indexed by "how many transactions have I used so far," not just named individually.',
    realWorldContext: 'Generalizing a fixed handful of named states into an array of states indexed by a count (transactions used, moves made, resources spent) is the standard way state-machine DP scales beyond toy examples — inventory systems with a budget of restocks, routing problems with a budget of detours, and multi-transaction trading strategies all need the SAME "index the state machine by a count" generalization taught here.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**From two named states to an array of states.** With `k=1`, Lesson 1\'s fee-variant states (`hold`, `cash`) are enough. With a general `k`, define `hold[t]` and `cash[t]` for `t` from `1` to `k`: `hold[t]` is the best profit while CURRENTLY holding a share, having used `t` transactions so far counting the one in progress; `cash[t]` is the best profit while NOT holding, having COMPLETED exactly `t` transactions. The state machine now has `2k` states instead of a fixed 2 or 3 — but the RECIPE from Lesson 1 (name the states, write one recurrence per state) still applies unchanged.',
      '**The recurrence, one transaction-count at a time.** For each day\'s price, and for `t` from `1` to `k`: `hold[t] = max(hold[t], cash[t-1] - price)` (keep holding, or buy today — starting the `t`-th transaction, which is why buying reads from `cash[t-1]`, the state having used one FEWER completed transaction) and `cash[t] = max(cash[t], hold[t] + price)` (keep not-holding, or sell today — completing the `t`-th transaction). Crucially, `hold[t]` and `cash[t]` are updated using values from the SAME day\'s in-progress sweep (in careful order, `t` ascending, since `hold[t]` needs the OLD `cash[t-1]` from before today, while `cash[t]` needs the JUST-UPDATED `hold[t]` from earlier in the same day\'s sweep) — a subtlety worth tracing by hand once, exactly as done in the visualization below.',
      '**Why this counts as "the same technique," not a new one.** This is not a different algorithm from Lesson 1\'s — it is Lesson 1\'s exact two-state recipe, replicated `k` times and linked by the transaction-count index. `k=1` recovers exactly the single-transaction case. This mirrors a pattern seen before: Chapter 4\'s digit DP added an "extra dimension" (digit sum, previous digit) onto its tight/started base machine; Chapter 3\'s bitmask DP added a dimension (the bitmask itself) onto a base "which items are used" idea. Adding a transaction-count DIMENSION to a small state machine is the exact same generalization instinct, applied here.',
      '**A subtle edge case: when k is "large enough," the transaction limit stops mattering.** If `k >= n/2` (more allowed transactions than there could possibly be profitable price increases in an array of length `n`), the k-transaction problem degenerates into "unlimited transactions" — simply sum every profitable adjacent price increase. Recognizing this degenerate case matters for both correctness (an unbounded `k` should not require an unbounded amount of state) and performance (skip the `O(n*k)` DP entirely when it is not needed, dropping to the much simpler `O(n)` unlimited-transactions greedy sum).',
      '**What this generalizes to next.** The "index a state array by a count" pattern used here — buy-sell transactions here, but equally a budget of coin flips, a budget of allowed mistakes, or a budget of resource units elsewhere — is one of the most common ways a state machine grows beyond a small fixed handful of named states. The closing practice lesson applies the SAME base "enumerate legal transitions" recipe from Lesson 1 to a domain that has nothing to do with stock trading, reinforcing that the recipe — not the stock-market framing — is the actual transferable idea.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 8, Lesson 2: Generalizing the State Machine',
        body: '**Previous:** Stock Trading State Machines — a small, fixed set of named states (hold/sold/rest, hold/cash).\n**This lesson:** indexing an array of hold/cash state PAIRS by a transaction-count parameter k.\n**Next:** a practice lesson applying the same enumerate-states-and-transitions recipe outside of stock trading.',
      },
      {
        type: 'insight',
        title: 'The k-transaction recurrence, stated precisely',
        body: 'For each price, for t = 1..k (ascending): hold[t] = max(hold[t], cash[t-1] - price); cash[t] = max(cash[t], hold[t] + price). hold[0] is never used (0 transactions in progress is meaningless); cash[0] = 0 (0 completed transactions, no profit, valid starting point).',
      },
      {
        type: 'strategy',
        title: 'Ascending t order within a single day is not arbitrary',
        body: 'hold[t] needs cash[t-1] as it stood BEFORE today\'s updates (correct, since t ascends and cash[t-1] for the current day hasn\'t been touched yet this sweep when hold[t] is computed). cash[t] then needs the just-updated hold[t] from earlier in the SAME day\'s sweep (also correct — selling today can only follow buying today or earlier). Processing t in descending order would silently use next-day-shifted values and produce a wrong, hard-to-notice answer.',
      },
      {
        type: 'warning',
        title: 'Do not allocate O(n·k) states if k is effectively unbounded',
        body: 'When k >= n/2, there cannot be more than n/2 genuinely profitable transactions in an array of n prices, so the transaction limit never actually binds — special-case this to the O(n) unlimited-transactions sum instead of running an O(n·k) DP with a k that could be far larger than necessary.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'k-Transaction DP: Watching the State Array Fill',
        caption: 'Watch hold[t] and cash[t] update for every t, one price at a time, in the correct ascending-t order.',
        props: {
          lesson: {
            title: 'Generalized State-Machine DP Step by Step',
            subtitle: 'One hold/cash pair per allowed transaction count.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'hold[t] and cash[t] for k=2, Price by Price',
                instruction: 'For prices [3, 2, 6, 5, 0, 3] and k=2, watch the two hold/cash pairs update in ascending-t order each day.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const prices = [3, 2, 6, 5, 0, 3];
const k = 2;
const hold = new Array(k + 1).fill(-Infinity);
const cash = new Array(k + 1).fill(0);

d.innerHTML += '<div style="color:#60a5fa;margin-bottom:6px">Start: cash=[0,0,0], hold=[-,-Inf,-Inf]</div>';
for (const price of prices) {
  const rowParts = [];
  for (let t = 1; t <= k; t++) {
    const oldHold = hold[t];
    hold[t] = Math.max(hold[t], cash[t-1] - price);
    const oldCash = cash[t];
    cash[t] = Math.max(cash[t], hold[t] + price);
    rowParts.push('t=' + t + ': hold ' + (oldHold===-Infinity?'-Inf':oldHold) + '&rarr;<b style="color:#60a5fa">' + hold[t] + '</b>, cash ' + oldCash + '&rarr;<b style="color:#4ade80">' + cash[t] + '</b>');
  }
  d.innerHTML += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:4px">price=' + price + ': ' + rowParts.join(' | ') + '</div>';
}
d.innerHTML += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Final answer = cash[' + k + '] = ' + cash[k] + '</div>';`,
                outputHeight: 480,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build k-Transaction Stock DP from Scratch',
        caption: 'The unlimited-transactions degenerate case first, then the full k-indexed state array.',
        props: {
          lesson: {
            title: 'k-Transaction State-Machine DP in JavaScript',
            subtitle: 'Recognizing the degenerate case, then the general k-indexed recurrence.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Degenerate Case: Unlimited Transactions

Implement \`maxProfitUnlimited(prices)\`: when k is effectively unbounded, just sum every profitable adjacent price increase.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function maxProfitUnlimited(prices) {
  let total = 0;
  for (let i = 1; i < prices.length; i++) {
    // TODO: if prices[i] > prices[i-1], add the difference to total
  }
  return total;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('[7,1,5,3,6,4]', maxProfitUnlimited([7,1,5,3,6,4]), 7);
test('[1,2,3,4,5]', maxProfitUnlimited([1,2,3,4,5]), 4);`,
                solutionCode: `function maxProfitUnlimited(prices) {
  let total = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i-1]) total += prices[i] - prices[i-1];
  }
  return total;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('[7,1,5,3,6,4]', maxProfitUnlimited([7,1,5,3,6,4]), 7);
test('[1,2,3,4,5]', maxProfitUnlimited([1,2,3,4,5]), 4);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — General k-Transaction DP: O(n·k)

Implement \`maxProfitK(k, prices)\` using hold[t]/cash[t] arrays indexed by transaction count, falling back to Step 1 when k is large enough to be unbounded.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function maxProfitUnlimited(prices) {
  let total = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i-1]) total += prices[i] - prices[i-1];
  }
  return total;
}

function maxProfitK(k, prices) {
  const n = prices.length;
  if (n === 0) return 0;
  if (k >= Math.floor(n / 2)) return maxProfitUnlimited(prices);

  const hold = new Array(k + 1).fill(-Infinity);
  const cash = new Array(k + 1).fill(0);
  for (const price of prices) {
    for (let t = 1; t <= k; t++) {
      // TODO: hold[t] = max(hold[t], cash[t-1] - price)
      // TODO: cash[t] = max(cash[t], hold[t] + price)
    }
  }
  return cash[k];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('k=2 [3,2,6,5,0,3]', maxProfitK(2, [3,2,6,5,0,3]), 7);
test('k=2 [2,4,1]', maxProfitK(2, [2,4,1]), 2);`,
                solutionCode: `function maxProfitUnlimited(prices) {
  let total = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i-1]) total += prices[i] - prices[i-1];
  }
  return total;
}

function maxProfitK(k, prices) {
  const n = prices.length;
  if (n === 0) return 0;
  if (k >= Math.floor(n / 2)) return maxProfitUnlimited(prices);

  const hold = new Array(k + 1).fill(-Infinity);
  const cash = new Array(k + 1).fill(0);
  for (const price of prices) {
    for (let t = 1; t <= k; t++) {
      hold[t] = Math.max(hold[t], cash[t-1] - price);
      cash[t] = Math.max(cash[t], hold[t] + price);
    }
  }
  return cash[k];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('k=2 [3,2,6,5,0,3]', maxProfitK(2, [3,2,6,5,0,3]), 7);
test('k=2 [2,4,1]', maxProfitK(2, [2,4,1]), 2);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Generalized State-Machine DP in Python',
        caption: 'Verify against known cases, visualize how the answer grows with k, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'k-Transaction DP — Verified',
              code: `def max_profit_unlimited(prices):
    return sum(max(0, prices[i] - prices[i - 1]) for i in range(1, len(prices)))


def max_profit_k(k, prices):
    n = len(prices)
    if n == 0:
        return 0
    if k >= n // 2:
        return max_profit_unlimited(prices)

    hold = [float("-inf")] * (k + 1)
    cash = [0] * (k + 1)
    for price in prices:
        for t in range(1, k + 1):
            hold[t] = max(hold[t], cash[t - 1] - price)
            cash[t] = max(cash[t], hold[t] + price)
    return cash[k]


tests = [
    (2, [3, 2, 6, 5, 0, 3], 7),
    (2, [2, 4, 1], 2),
]
for k, prices, expected in tests:
    result = max_profit_k(k, prices)
    print(f"k={k} prices={prices}: got={result}, expected={expected}")
    assert result == expected

print("All assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Profit as a Function of k',
              code: `import matplotlib.pyplot as plt


def max_profit_unlimited(prices):
    return sum(max(0, prices[i] - prices[i - 1]) for i in range(1, len(prices)))


def max_profit_k(k, prices):
    n = len(prices)
    if n == 0:
        return 0
    if k >= n // 2:
        return max_profit_unlimited(prices)
    hold = [float("-inf")] * (k + 1)
    cash = [0] * (k + 1)
    for price in prices:
        for t in range(1, k + 1):
            hold[t] = max(hold[t], cash[t - 1] - price)
            cash[t] = max(cash[t], hold[t] + price)
    return cash[k]


prices = [3, 3, 5, 0, 0, 3, 1, 4, 6, 2, 5, 0]
ks = list(range(0, 7))
profits = [max_profit_k(k, prices) for k in ks]

fig, ax = plt.subplots(figsize=(7, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
ax.plot(ks, profits, "o-", color="#4ade80")
ax.set_xlabel("k (max allowed transactions)", color="#94a3b8")
ax.set_ylabel("max profit", color="#94a3b8")
ax.set_title(f"Profit plateaus once k is large enough (prices={prices})", color="#e2e8f0", fontsize=10)
ax.tick_params(colors="#94a3b8")
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()
print("profits by k:", profits)
print("unlimited-transactions profit:", max_profit_unlimited(prices))`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'k-transaction state array, from scratch',
              difficulty: 'hard',
              prompt: 'Fill in the ascending-t sweep in max_profit_k_scratch(k, prices): for each price, update hold[t] then cash[t] for t=1..k, in that order. Uncomment the assertion once ready.',
              hint: 'hold[t] = max(hold[t], cash[t-1] - price) must be computed BEFORE cash[t] = max(cash[t], hold[t] + price) for the same t, and t must ascend from 1 to k.',
              label: 'From Scratch — k-Transaction DP',
              code: `def max_profit_k_scratch(k, prices):
    n = len(prices)
    if n == 0:
        return 0
    if k >= n // 2:
        return sum(max(0, prices[i] - prices[i - 1]) for i in range(1, n))

    hold = [float("-inf")] * (k + 1)
    cash = [0] * (k + 1)
    for price in prices:
        for t in range(1, k + 1):
            # YOUR CODE HERE:
            # hold[t] = max(hold[t], cash[t-1] - price)
            # cash[t] = max(cash[t], hold[t] + price)
            pass

    return cash[k]


prices = [1, 7, 2, 8, 3, 9, 4, 10]

# --- Uncomment to test when ready ---
# result = max_profit_k_scratch(3, prices)
# print(f"max_profit_k_scratch(3, {prices}) = {result}")
# assert result == 19, f"got {result}"
# print("All assertions passed!")`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'How does the k-transaction state machine relate to Lesson 1\'s fixed hold/cash states?',
      options: [
        'It is a completely different algorithm with no connection to Lesson 1',
        'It is the same hold/cash recipe from Lesson 1, replicated once per allowed transaction count and linked by a transaction-count index — k=1 recovers exactly the single-transaction case',
        'It replaces hold/cash entirely with a brand-new set of unrelated states',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: "Within a single day's price update, why must t be processed in ASCENDING order from 1 to k?",
      options: [
        'Order does not matter; any order produces the same result',
        'hold[t] needs cash[t-1] as it stood before today\'s sweep touched it, and cash[t] then needs the just-updated hold[t] from earlier in the same sweep — processing t in descending order would use values that have already been advanced past where they should be, producing a silently wrong answer',
        'Descending order is actually required, not ascending',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does k >= n/2 make the k-transaction limit stop mattering?',
      options: [
        'Because prices arrays of length n can never contain more than n/2 genuinely profitable price increases, so a transaction budget of at least n/2 can never actually bind — the problem degenerates into the simpler unlimited-transactions case',
        'Because k >= n/2 is mathematically impossible and never needs to be handled',
        'Because the DP recurrence divides by zero when k is that large, requiring a special case purely to avoid a crash',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the general pattern this lesson demonstrates for scaling a state machine beyond a small fixed set of named states?',
      options: [
        'Replacing the state machine with a completely different data structure such as a graph or a tree',
        'Indexing an array of states by a count (here, transactions used) rather than trying to name a new fixed state for every possible count — the same generalization instinct used when Chapter 3\'s bitmask DP and Chapter 4\'s digit DP added extra dimensions to a base state',
        'Abandoning DP altogether once the number of states depends on an input parameter',
      ],
      correct: 1,
    },
  ],
};
