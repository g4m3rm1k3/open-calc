export default {
  id: 'dp8-001',
  slug: 'stock-trading-state-machines',
  chapter: 'dp8',
  order: 1,
  title: 'State-Machine DP: Stock Trading with Cooldown and Fees',
  subtitle: 'Modeling "what can happen next" as an explicit finite state machine',
  tags: ['dynamic programming', 'state machine dp', 'stock trading dp', 'cooldown', 'transaction fee'],
  aliases: 'state machine dp stock trading cooldown transaction fee buy sell stock',

  hook: {
    question: 'Buying and selling a stock to maximize profit, with a twist: after selling, you must wait one full day before buying again (a cooldown). A single `dp[i]` "best profit up to day i" cannot capture this — the day-i decision depends on WHETHER you sold yesterday, not just on the best profit so far. The fix is to make the DP\'s state explicitly track "which situation am I in" — holding a stock, just sold, or resting — and write one recurrence PER situation. This is state-machine DP: instead of one number per day, track one number per (day, situation) pair, where "situation" is a node in an explicit finite state machine.',
    realWorldContext: 'State-machine DP is the standard approach for any sequential decision problem with a small number of qualitatively different "modes" a process can be in — stock trading strategies (holding vs. not holding, with or without a cooldown/fee), traffic-light-style scheduling, and text/parsing validity checks (Chapter 4\'s digit DP "tight" flag was already a tiny two-state machine) all reduce to the same idea: enumerate the modes, then write one recurrence per mode describing the legal transitions.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Why a single dp[i] is not enough.** In the plain "buy once, sell once" stock problem, `dp[i]` (best profit achievable using days `0..i`) works because the decision on day `i` doesn\'t depend on anything except the best profit so far. Add a cooldown rule ("must wait a day after selling before buying again") and that stops being true: whether you\'re ALLOWED to buy on day `i` depends on whether you sold on day `i-1`. The fix is to stop tracking one number per day and start tracking one number per (day, SITUATION) — the situation captures exactly the extra fact ("did I just sell?") that the plain version was missing.',
      '**Naming the states, precisely.** Three mutually exclusive situations exist on any given day: `hold` (currently own a share, whenever it was bought), `sold` (just sold TODAY, so tomorrow is a forced cooldown day), and `rest` (own nothing, and did not just sell — free to buy today). Define `hold[i]`, `sold[i]`, `rest[i]` as the best profit achievable by end of day `i`, GIVEN that day `i` ends in that respective situation.',
      '**One recurrence per state, each one a small "what could have led here" question.** `hold[i] = max(hold[i-1], rest[i-1] - prices[i])` — either you were already holding, or you just bought today (only legal from `rest`, never from `sold`, since cooldown forbids buying the day right after selling). `sold[i] = hold[i-1] + prices[i]` — the only way to be in `sold` today is to have held yesterday and sold today. `rest[i] = max(rest[i-1], sold[i-1])` — you\'re resting today either because you were already resting, or because you sold yesterday and today is the forced cooldown. The final answer is `max(sold[n-1], rest[n-1])` (ending while still holding a share can never be optimal, since selling it for free is always at least as good).',
      '**A transaction fee is a different rule on the SAME two-state skeleton.** Drop the cooldown, add a flat fee charged per completed sale: only two states are needed now, `hold` and `cash` (not holding). `hold[i] = max(hold[i-1], cash[i-1] - prices[i])` (buying has no fee), `cash[i] = max(cash[i-1], hold[i-1] + prices[i] - fee)` (the fee is charged exactly once, at the moment of selling). Same discipline — name the states, write one recurrence per state describing every way to arrive there — produces a completely different-looking, equally correct solution.',
      '**The general recipe, reusable beyond stock trading.** (1) Identify the qualitatively different "modes" the process can be in on any given step. (2) For each mode, ask "what state could I have been in YESTERDAY, and what transition gets me to THIS mode today?" (3) Write one recurrence per mode capturing every legal transition into it. (4) The final answer is typically a max/min/sum over whichever END states are valid to stop in. This recipe is exactly what Lesson 2 will generalize further (a variable NUMBER of "modes," not just a fixed small set), and it is the same instinct already used informally in Chapter 4\'s digit-DP "tight" flag and Chapter 5\'s wildcard-matching states.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 8, Lesson 1: Stock Trading State Machines',
        body: '**This lesson:** naming explicit states (hold/sold/rest, or hold/cash) and writing one recurrence per state.\n**Next:** State Machine DP, generalized — adding a transaction-count dimension so the "machine" scales to k allowed trades.\n**Then:** a practice lesson applying the same state-machine habit to a completely different domain (attendance-record validity).',
      },
      {
        type: 'insight',
        title: 'The cooldown machine, drawn as transitions',
        body: 'rest --(buy)--> hold. hold --(sell)--> sold. sold --(forced)--> rest. hold --(do nothing)--> hold. rest --(do nothing)--> rest. Every dp recurrence is just "sum over the arrows pointing INTO this state, from yesterday\'s value."',
      },
      {
        type: 'strategy',
        title: 'Draw the state diagram before writing any code',
        body: 'For any state-machine DP, sketch states as nodes and legal single-step transitions as arrows FIRST. Every dp[state][i] recurrence is then mechanical: it is a max/sum over every arrow that points into that state, evaluated at day i-1 (plus today\'s price/fee/cost along that arrow). Skipping the diagram and trying to write the recurrences directly is the most common source of missing-transition bugs.',
      },
      {
        type: 'warning',
        title: 'A forbidden transition is not the same as "worse" — it must be structurally absent',
        body: 'The cooldown rule doesn\'t make buying-the-day-after-selling merely suboptimal — it makes it ILLEGAL. That is why hold[i] only ever reads FROM rest[i-1], never from sold[i-1]: the transition sold -> hold simply does not exist in the state diagram, so no arithmetic needs to "discourage" it — it is absent from the recurrence entirely.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Stock Cooldown: Watching the Three States Evolve',
        caption: 'Watch hold[i], sold[i], and rest[i] update day by day, each reading only its legal predecessor states.',
        props: {
          lesson: {
            title: 'State-Machine DP Step by Step',
            subtitle: 'Three states, one recurrence each, day by day.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'hold / sold / rest, Day by Day',
                instruction: 'For prices [1, 2, 3, 0, 2], watch each state\'s best profit update using only its legal predecessor states.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const prices = [1, 2, 3, 0, 2];
const n = prices.length;
const hold = new Array(n).fill(0);
const sold = new Array(n).fill(0);
const rest = new Array(n).fill(0);
hold[0] = -prices[0];
sold[0] = -Infinity;
rest[0] = 0;

d.innerHTML += '<div style="color:#60a5fa;margin-bottom:6px">Day 0: hold=' + hold[0] + ', sold=n/a, rest=' + rest[0] + '</div>';
for (let i = 1; i < n; i++) {
  hold[i] = Math.max(hold[i-1], rest[i-1] - prices[i]);
  sold[i] = hold[i-1] + prices[i];
  rest[i] = Math.max(rest[i-1], sold[i-1]);
  d.innerHTML += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px">Day ' + i + ' (price=' + prices[i] + '): hold=max(' + hold[i-1] + ', ' + rest[i-1] + '-' + prices[i] + ')=<b style="color:#60a5fa">' + hold[i] + '</b>, sold=' + hold[i-1] + '+' + prices[i] + '=<b style="color:#facc15">' + sold[i] + '</b>, rest=max(' + rest[i-1] + ', ' + (i>=2?sold[i-1]:'n/a') + ')=<b style="color:#4ade80">' + rest[i] + '</b></div>';
}
d.innerHTML += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Final answer = max(sold[' + (n-1) + '], rest[' + (n-1) + ']) = ' + Math.max(sold[n-1], rest[n-1]) + '</div>';`,
                outputHeight: 400,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Stock Trading State Machines from Scratch',
        caption: 'Cooldown first (three states), then transaction fee (two states).',
        props: {
          lesson: {
            title: 'Stock Trading State Machines in JavaScript',
            subtitle: 'Two different rule sets, two different (small) state machines.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Cooldown: hold / sold / rest

Implement \`maxProfitCooldown(prices)\` using the three-state recurrence: hold[i] = max(hold[i-1], rest[i-1]-prices[i]); sold[i] = hold[i-1]+prices[i]; rest[i] = max(rest[i-1], sold[i-1]).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function maxProfitCooldown(prices) {
  const n = prices.length;
  if (n === 0) return 0;
  const hold = new Array(n).fill(0);
  const sold = new Array(n).fill(0);
  const rest = new Array(n).fill(0);
  hold[0] = -prices[0];
  sold[0] = -Infinity;
  rest[0] = 0;

  for (let i = 1; i < n; i++) {
    // TODO: hold[i] = max(hold[i-1], rest[i-1] - prices[i])
    // TODO: sold[i] = hold[i-1] + prices[i]
    // TODO: rest[i] = max(rest[i-1], sold[i-1])
  }
  return Math.max(sold[n-1], rest[n-1]);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('[1,2,3,0,2]', maxProfitCooldown([1,2,3,0,2]), 3);
test('[1]', maxProfitCooldown([1]), 0);`,
                solutionCode: `function maxProfitCooldown(prices) {
  const n = prices.length;
  if (n === 0) return 0;
  const hold = new Array(n).fill(0);
  const sold = new Array(n).fill(0);
  const rest = new Array(n).fill(0);
  hold[0] = -prices[0];
  sold[0] = -Infinity;
  rest[0] = 0;

  for (let i = 1; i < n; i++) {
    hold[i] = Math.max(hold[i-1], rest[i-1] - prices[i]);
    sold[i] = hold[i-1] + prices[i];
    rest[i] = Math.max(rest[i-1], sold[i-1]);
  }
  return Math.max(sold[n-1], rest[n-1]);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('[1,2,3,0,2]', maxProfitCooldown([1,2,3,0,2]), 3);
test('[1]', maxProfitCooldown([1]), 0);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Transaction Fee: hold / cash

Implement \`maxProfitFee(prices, fee)\` using the two-state recurrence: hold[i] = max(hold[i-1], cash[i-1]-prices[i]); cash[i] = max(cash[i-1], hold[i-1]+prices[i]-fee).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function maxProfitFee(prices, fee) {
  const n = prices.length;
  let hold = -prices[0];
  let cash = 0;
  for (let i = 1; i < n; i++) {
    // TODO: newHold = max(hold, cash - prices[i])
    // TODO: newCash = max(cash, hold + prices[i] - fee)
    // TODO: hold = newHold; cash = newCash
  }
  return cash;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('[1,3,2,8,4,9] fee=2', maxProfitFee([1,3,2,8,4,9], 2), 8);`,
                solutionCode: `function maxProfitFee(prices, fee) {
  const n = prices.length;
  let hold = -prices[0];
  let cash = 0;
  for (let i = 1; i < n; i++) {
    const newHold = Math.max(hold, cash - prices[i]);
    const newCash = Math.max(cash, hold + prices[i] - fee);
    hold = newHold;
    cash = newCash;
  }
  return cash;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('[1,3,2,8,4,9] fee=2', maxProfitFee([1,3,2,8,4,9], 2), 8);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Stock Trading State Machines in Python',
        caption: 'Verify both variants, visualize the three-state cooldown machine, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Cooldown and Fee Variants — Verified',
              code: `def max_profit_cooldown(prices):
    n = len(prices)
    if n == 0:
        return 0
    hold = [0] * n
    sold = [0] * n
    rest = [0] * n
    hold[0] = -prices[0]
    sold[0] = float("-inf")
    rest[0] = 0
    for i in range(1, n):
        hold[i] = max(hold[i - 1], rest[i - 1] - prices[i])
        sold[i] = hold[i - 1] + prices[i]
        rest[i] = max(rest[i - 1], sold[i - 1])
    return max(sold[n - 1], rest[n - 1])


def max_profit_fee(prices, fee):
    n = len(prices)
    hold = -prices[0]
    cash = 0
    for i in range(1, n):
        hold, cash = max(hold, cash - prices[i]), max(cash, hold + prices[i] - fee)
    return cash


print("cooldown [1,2,3,0,2]:", max_profit_cooldown([1, 2, 3, 0, 2]))
assert max_profit_cooldown([1, 2, 3, 0, 2]) == 3
assert max_profit_cooldown([1]) == 0

print("fee [1,3,2,8,4,9] fee=2:", max_profit_fee([1, 3, 2, 8, 4, 9], 2))
assert max_profit_fee([1, 3, 2, 8, 4, 9], 2) == 8

print("All assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: The Three Cooldown States Over Time',
              code: `import matplotlib.pyplot as plt


def cooldown_states(prices):
    n = len(prices)
    hold = [0] * n
    sold = [0] * n
    rest = [0] * n
    hold[0] = -prices[0]
    sold[0] = float("-inf")
    rest[0] = 0
    for i in range(1, n):
        hold[i] = max(hold[i - 1], rest[i - 1] - prices[i])
        sold[i] = hold[i - 1] + prices[i]
        rest[i] = max(rest[i - 1], sold[i - 1])
    return hold, sold, rest


prices = [3, 2, 5, 0, 3, 6, 1, 4]
hold, sold, rest = cooldown_states(prices)
days = list(range(len(prices)))

fig, ax = plt.subplots(figsize=(8, 4.5), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
ax.plot(days, hold, "o-", color="#60a5fa", label="hold[i]")
ax.plot(days, [s if s != float("-inf") else None for s in sold], "o-", color="#facc15", label="sold[i]")
ax.plot(days, rest, "o-", color="#4ade80", label="rest[i]")
ax.set_xlabel("day", color="#94a3b8")
ax.set_ylabel("best profit in this state", color="#94a3b8")
ax.set_title(f"Three cooldown states over prices={prices}", color="#e2e8f0", fontsize=11)
ax.tick_params(colors="#94a3b8")
ax.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#e2e8f0")
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()
print(f"Final answer: max(sold[-1], rest[-1]) = {max(sold[-1], rest[-1])}")`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Cooldown state machine, from scratch',
              difficulty: 'medium',
              prompt: 'Fill in the three-state recurrence in max_profit_cooldown_scratch(prices): hold, sold, and rest, each reading only its legal predecessor state(s) from the previous day. Uncomment the assertion once ready.',
              hint: 'hold[i] = max(hold[i-1], rest[i-1] - prices[i]). sold[i] = hold[i-1] + prices[i]. rest[i] = max(rest[i-1], sold[i-1]). The answer is max(sold[-1], rest[-1]).',
              label: 'From Scratch — Cooldown State Machine',
              code: `def max_profit_cooldown_scratch(prices):
    n = len(prices)
    if n == 0:
        return 0
    hold = [0] * n
    sold = [0] * n
    rest = [0] * n
    hold[0] = -prices[0]
    sold[0] = float("-inf")
    rest[0] = 0

    for i in range(1, n):
        # YOUR CODE HERE:
        # hold[i] = max(hold[i-1], rest[i-1] - prices[i])
        # sold[i] = hold[i-1] + prices[i]
        # rest[i] = max(rest[i-1], sold[i-1])
        pass

    return max(sold[n - 1], rest[n - 1])


prices = [6, 1, 3, 2, 4, 7]

# --- Uncomment to test when ready ---
# result = max_profit_cooldown_scratch(prices)
# print(f"max_profit_cooldown_scratch({prices}) = {result}")
# assert result == 6, f"got {result}"
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
      text: 'Why does a single dp[i] ("best profit through day i") fail once a cooldown rule is added?',
      options: [
        'It does not fail — cooldown does not change the recurrence at all',
        'Because whether buying is LEGAL on day i now depends on whether you sold on day i-1, a fact the plain dp[i] does not track — the state must be expanded to capture "which situation (holding/just sold/resting) am I in," not just the best profit so far',
        'Because prices can never be equal on two different days once cooldown is introduced',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'In the cooldown state machine, why does hold[i] read from rest[i-1] but never from sold[i-1]?',
      options: [
        'Reading from sold[i-1] would just be redundant with rest[i-1], since they always hold equal values',
        'Because the transition sold -> hold (buying the day immediately after selling) is illegal under the cooldown rule — it is structurally absent from the state diagram, not merely penalized in the arithmetic',
        'Because sold[i-1] is always less profitable than rest[i-1], so it would never be chosen by the max anyway',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'What is the recommended first step before writing any state-machine DP recurrence?',
      options: [
        'Write the base cases first, then figure out the states afterward',
        'Sketch the states as nodes and the legal single-step transitions as arrows — each state\'s recurrence is then mechanical: a max/sum over every arrow pointing INTO that state from the previous step',
        'Directly translate the naive brute-force recursion into an array without identifying states at all',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The transaction-fee variant uses only two states (hold, cash) instead of the cooldown variant\'s three (hold, sold, rest). Why?',
      options: [
        'Because the fee variant is a simpler problem overall',
        'Because the fee rule does not need to distinguish "just sold today" from "resting" as separate situations — there is no cooldown restricting the next buy, so those two cases collapse into a single "not holding" state, with the fee simply subtracted at the moment of selling',
        'Because two states are always sufficient for any stock trading variant, regardless of the rules',
      ],
      correct: 1,
    },
  ],
};
