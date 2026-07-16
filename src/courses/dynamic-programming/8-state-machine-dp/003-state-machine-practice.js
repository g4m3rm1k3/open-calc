export default {
  id: 'dp8-003',
  slug: 'state-machine-practice',
  chapter: 'dp8',
  order: 3,
  title: 'Practice: State-Machine DP Beyond Stock Trading',
  subtitle: 'The same enumerate-states-and-transitions recipe, applied to a counting problem',
  tags: ['dynamic programming', 'state machine dp', 'attendance record', 'counting dp', 'practice'],
  aliases: 'state machine dp practice student attendance record counting automaton',

  hook: {
    question: 'A student\'s attendance record is a string of \'P\' (present), \'A\' (absent), and \'L\' (late), one character per day. The record is "eligible for an award" if it contains FEWER THAN 2 total absences AND never has 3 or more LATEs in a row. Given a record length n, how many distinct eligible records of that length exist? There is no stock and no price here — but the exact same recipe from Lessons 1 and 2 applies: name the qualitatively different situations a record-in-progress can be in, and write one recurrence per situation describing how one more day\'s letter transitions between them.',
    realWorldContext: 'Counting the number of strings/sequences satisfying a small set of local constraints (no 3-in-a-row, at most k of something, no forbidden adjacent pair) is one of the most common state-machine DP applications outside of trading — input validation, DNA/protein sequence constraints, and any "count valid configurations" problem with a bounded memory of recent history reduces to exactly this shape.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Naming the states: what does the DP need to remember about the past?** To decide whether appending one more letter keeps a record eligible, the DP does not need the ENTIRE record so far — only two small facts: how many total absences have occurred (capped, since 2 or more is already disqualifying — so `0` or `1` is all that needs tracking, as `2+` is simply "already ineligible" and can be discarded from further consideration), and how many CONSECUTIVE lates have just occurred (capped at `0`, `1`, or `2`, since a 3rd in a row disqualifies). That is a state of just `2 x 3 = 6` possibilities — `(absences so far, trailing consecutive lates)` — regardless of how long the record is.',
      '**The transitions: what can today\'s letter be, from each state?** From state `(a, l)` (a absences so far, l trailing lates), appending `\'P\'` (present) always transitions to `(a, 0)` — presence resets the late-streak and is always legal. Appending `\'A\'` (absent) transitions to `(1, 0)` — but ONLY legal if `a == 0` (a second absence is disqualifying, so that transition is simply absent from the machine when `a` is already `1`). Appending `\'L\'` (late) transitions to `(a, l+1)` — but ONLY legal if `l < 2` (a 3rd consecutive late is disqualifying, so that transition is absent when `l` is already `2`). Every legal transition is counted once; the total count of length-`n` eligible records is the sum, over all 6 states, of how many ways to reach that state after `n` days.',
      '**Why this is the SAME recipe as stock trading, despite looking nothing alike.** Compare directly: Lesson 1\'s `hold`/`sold`/`rest` were three named situations with legal transitions between them; here, `(absences, trailing lates)` are six named situations with legal transitions between them. Lesson 1 asked "what is the best PROFIT reachable in this situation," summing/maxing over incoming transitions; this lesson asks "how many WAYS are there to reach this situation," summing over incoming transitions instead of maxing. The aggregation operation changed (max profit vs. count of ways) but the state-machine SHAPE — enumerate situations, enumerate legal transitions, one recurrence per situation — is identical.',
      '**Modular arithmetic is a housekeeping detail, not a new technique.** Since the count of valid records grows exponentially with `n`, the answer is conventionally reported modulo `10^9 + 7` (a detail seen already in Chapter 3\'s counting-style bitmask problems). Every addition in the recurrence takes `% (10**9 + 7)` — this changes nothing about which states or transitions exist, only how the numbers are represented, so it should be the very last thing added once the state machine itself is verified correct on small, un-modded cases.',
      '**Closing the chapter: the transferable skill was never "stock trading."** Across all three lessons, the actual content taught was always the same four-step recipe: identify the qualitatively different situations a process can be in; enumerate the legal transitions between them; write one recurrence per situation, aggregating over its incoming transitions; and read the final answer off of whichever ending situations are valid. Stock trading, k-transaction budgets, and attendance-record validity are three completely different stories wrapped around the identical recipe — recognizing the recipe underneath a new problem\'s story, rather than needing to have seen that exact story before, is the actual goal of this entire chapter.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 8, Lesson 3: State-Machine DP Practice (closing lesson)',
        body: '**Previous:** Generalizing the State Machine — indexing states by a transaction-count parameter k.\n**This lesson:** the same "enumerate states and transitions" recipe applied to a counting problem with no stock market in sight.\n**This closes Chapter 8** and the seven-chapter dynamic programming expansion beyond the original Foundations chapter.',
      },
      {
        type: 'insight',
        title: 'The six states, enumerated',
        body: '(absences ∈ {0,1}) × (trailing consecutive lates ∈ {0,1,2}) = 6 states. From (a,l): \'P\' → (a,0) always legal. \'A\' → (1,0) legal only if a=0. \'L\' → (a,l+1) legal only if l<2. The answer for length n is the sum of counts across all 6 states after n transitions, starting from (0,0)=1 way (the empty record).',
      },
      {
        type: 'strategy',
        title: 'Counting DP sums over incoming transitions; optimization DP maxes over them',
        body: 'The mechanical process (name states, enumerate transitions, one recurrence per state) is identical whether the problem asks "best value" (use max/min, as in Lessons 1–2) or "number of ways" (use sum/addition, as here) — only the aggregation operator at each state changes.',
      },
      {
        type: 'warning',
        title: 'Absent transitions must be OMITTED, not counted as zero-weight',
        body: 'Just like the cooldown machine\'s missing sold→hold transition in Lesson 1, the missing A-transition from (1, l) and the missing L-transition from (a, 2) must not appear in the recurrence at all — they are illegal moves, not legal moves worth 0 additional records. Accidentally including them (e.g., by forgetting the a==0 or l<2 guard) silently overcounts ineligible records as if they were valid.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Attendance Records: Watching the Six-State Machine Fill',
        caption: 'Watch how many ways exist to reach each of the 6 states, day by day.',
        props: {
          lesson: {
            title: 'Counting-Style State-Machine DP Step by Step',
            subtitle: 'Six states, each tracking a count of ways rather than a best profit.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Ways to Reach Each (absences, trailing lates) State',
                instruction: 'Watch the count in each of the 6 states grow over 4 days, starting from the empty record.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const MOD = 1000000007;
let dp = {}; // key "a,l" -> count
for (let a = 0; a < 2; a++) for (let l = 0; l < 3; l++) dp[a+','+l] = 0;
dp['0,0'] = 1;

function render(day) {
  const rows = [];
  for (let a = 0; a < 2; a++) for (let l = 0; l < 3; l++) rows.push('(a=' + a + ',l=' + l + ')=' + dp[a+','+l]);
  d.innerHTML += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:4px">Day ' + day + ': ' + rows.join(', ') + '</div>';
}
render(0);

for (let day = 1; day <= 4; day++) {
  const ndp = {};
  for (let a = 0; a < 2; a++) for (let l = 0; l < 3; l++) ndp[a+','+l] = 0;
  for (let a = 0; a < 2; a++) {
    for (let l = 0; l < 3; l++) {
      const cur = dp[a+','+l];
      if (cur === 0) continue;
      ndp[a+',0'] = (ndp[a+',0'] + cur) % MOD;
      if (a === 0) ndp['1,0'] = (ndp['1,0'] + cur) % MOD;
      if (l < 2) ndp[a+','+(l+1)] = (ndp[a+','+(l+1)] + cur) % MOD;
    }
  }
  dp = ndp;
  render(day);
}
let total = 0;
for (const k in dp) total = (total + dp[k]) % MOD;
d.innerHTML += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Total eligible records of length 4 = ' + total + '</div>';`,
                outputHeight: 480,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Attendance Record Counting from Scratch',
        caption: 'Brute-force enumeration first (to confirm the answer on tiny n), then the six-state DP.',
        props: {
          lesson: {
            title: 'Attendance Record DP in JavaScript',
            subtitle: 'Counting via a small finite state machine, verified against brute force.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Brute-Force Enumeration (Tiny n Only)

Implement \`checkRecordBrute(n)\`: generate every string of length n over {P, A, L}, count how many are eligible (< 2 absences, no 3+ consecutive lates). Only feasible for very small n (3^n grows fast).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function isEligible(record) {
  let absences = 0, trailingLates = 0;
  for (const ch of record) {
    if (ch === 'A') { absences++; trailingLates = 0; }
    else if (ch === 'L') { trailingLates++; }
    else { trailingLates = 0; }
    if (absences >= 2 || trailingLates >= 3) return false;
  }
  return true;
}

function checkRecordBrute(n) {
  const letters = ['P', 'A', 'L'];
  let count = 0;
  function build(record) {
    if (record.length === n) {
      // TODO: if isEligible(record), increment count
      return;
    }
    for (const ch of letters) build(record + ch);
  }
  build('');
  return count;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('n=1', checkRecordBrute(1), 3);
test('n=2', checkRecordBrute(2), 8);
test('n=3', checkRecordBrute(3), 19);`,
                solutionCode: `function isEligible(record) {
  let absences = 0, trailingLates = 0;
  for (const ch of record) {
    if (ch === 'A') { absences++; trailingLates = 0; }
    else if (ch === 'L') { trailingLates++; }
    else { trailingLates = 0; }
    if (absences >= 2 || trailingLates >= 3) return false;
  }
  return true;
}

function checkRecordBrute(n) {
  const letters = ['P', 'A', 'L'];
  let count = 0;
  function build(record) {
    if (record.length === n) {
      if (isEligible(record)) count++;
      return;
    }
    for (const ch of letters) build(record + ch);
  }
  build('');
  return count;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('n=1', checkRecordBrute(1), 3);
test('n=2', checkRecordBrute(2), 8);
test('n=3', checkRecordBrute(3), 19);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Six-State DP: O(n)

Implement \`checkRecord(n)\` using the six-state (absences, trailing lates) machine, correct for any n (not just tiny ones).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function checkRecord(n) {
  const MOD = 1000000007;
  // dp[a][l] = number of ways to reach (a absences, l trailing lates)
  let dp = [[1, 0, 0], [0, 0, 0]];
  for (let day = 0; day < n; day++) {
    const ndp = [[0, 0, 0], [0, 0, 0]];
    for (let a = 0; a < 2; a++) {
      for (let l = 0; l < 3; l++) {
        const cur = dp[a][l];
        if (cur === 0) continue;
        // TODO: 'P' transition: ndp[a][0] += cur
        // TODO: 'A' transition (only if a === 0): ndp[1][0] += cur
        // TODO: 'L' transition (only if l < 2): ndp[a][l+1] += cur
        // remember to take % MOD after each addition
      }
    }
    dp = ndp;
  }
  let total = 0;
  for (let a = 0; a < 2; a++) for (let l = 0; l < 3; l++) total = (total + dp[a][l]) % MOD;
  return total;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('n=1', checkRecord(1), 3);
test('n=2', checkRecord(2), 8);
test('n=3', checkRecord(3), 19);`,
                solutionCode: `function checkRecord(n) {
  const MOD = 1000000007;
  let dp = [[1, 0, 0], [0, 0, 0]];
  for (let day = 0; day < n; day++) {
    const ndp = [[0, 0, 0], [0, 0, 0]];
    for (let a = 0; a < 2; a++) {
      for (let l = 0; l < 3; l++) {
        const cur = dp[a][l];
        if (cur === 0) continue;
        ndp[a][0] = (ndp[a][0] + cur) % MOD;
        if (a === 0) ndp[1][0] = (ndp[1][0] + cur) % MOD;
        if (l < 2) ndp[a][l+1] = (ndp[a][l+1] + cur) % MOD;
      }
    }
    dp = ndp;
  }
  let total = 0;
  for (let a = 0; a < 2; a++) for (let l = 0; l < 3; l++) total = (total + dp[a][l]) % MOD;
  return total;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('n=1', checkRecord(1), 3);
test('n=2', checkRecord(2), 8);
test('n=3', checkRecord(3), 19);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Attendance Record Counting in Python',
        caption: 'Verify against brute force, visualize the state distribution over time, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Six-State DP vs Brute Force — Verify',
              code: `from itertools import product

MOD = 10**9 + 7


def check_record(n):
    dp = {(a, l): 0 for a in range(2) for l in range(3)}
    dp[(0, 0)] = 1
    for _ in range(n):
        ndp = {(a, l): 0 for a in range(2) for l in range(3)}
        for a in range(2):
            for l in range(3):
                cur = dp[(a, l)]
                if cur == 0:
                    continue
                ndp[(a, 0)] = (ndp[(a, 0)] + cur) % MOD
                if a == 0:
                    ndp[(1, 0)] = (ndp[(1, 0)] + cur) % MOD
                if l < 2:
                    ndp[(a, l + 1)] = (ndp[(a, l + 1)] + cur) % MOD
        dp = ndp
    return sum(dp.values()) % MOD


def is_eligible(record):
    absences, trailing = 0, 0
    for ch in record:
        if ch == "A":
            absences += 1
            trailing = 0
        elif ch == "L":
            trailing += 1
        else:
            trailing = 0
        if absences >= 2 or trailing >= 3:
            return False
    return True


def check_record_brute(n):
    return sum(1 for combo in product("PAL", repeat=n) if is_eligible("".join(combo)))


for n in range(1, 6):
    dp_result = check_record(n)
    brute_result = check_record_brute(n)
    print(f"n={n}: dp={dp_result}, brute={brute_result}, match={dp_result == brute_result}")
    assert dp_result == brute_result

print("check_record(10101) =", check_record(10101))
print("All assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: How the 6 States Contribute Over Time',
              code: `import matplotlib.pyplot as plt

MOD = 10**9 + 7


def check_record_history(n):
    dp = {(a, l): 0 for a in range(2) for l in range(3)}
    dp[(0, 0)] = 1
    history = [dict(dp)]
    for _ in range(n):
        ndp = {(a, l): 0 for a in range(2) for l in range(3)}
        for a in range(2):
            for l in range(3):
                cur = dp[(a, l)]
                if cur == 0:
                    continue
                ndp[(a, 0)] = (ndp[(a, 0)] + cur) % MOD
                if a == 0:
                    ndp[(1, 0)] = (ndp[(1, 0)] + cur) % MOD
                if l < 2:
                    ndp[(a, l + 1)] = (ndp[(a, l + 1)] + cur) % MOD
        dp = ndp
        history.append(dict(dp))
    return history


history = check_record_history(12)
states = [(a, l) for a in range(2) for l in range(3)]
days = list(range(len(history)))

fig, ax = plt.subplots(figsize=(8, 4.5), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
colors = ["#4ade80", "#60a5fa", "#facc15", "#f87171", "#a78bfa", "#22d3ee"]
for state, color in zip(states, colors):
    values = [h[state] for h in history]
    ax.plot(days, values, "o-", color=color, label=f"a={state[0]},l={state[1]}", markersize=3)
ax.set_xlabel("day", color="#94a3b8")
ax.set_ylabel("ways to reach this state", color="#94a3b8")
ax.set_yscale("log")
ax.set_title("Growth of each (absences, trailing lates) state over 12 days", color="#e2e8f0", fontsize=10)
ax.tick_params(colors="#94a3b8")
ax.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#e2e8f0", fontsize=8)
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()
print("Final counts at day 12:", history[-1])
print("Total at day 12:", sum(history[-1].values()) % MOD)`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Attendance record counting, from scratch',
              difficulty: 'medium',
              prompt: 'Fill in the transition loop in check_record_scratch(n): for each of the 6 states, add its count into the P, A (if legal), and L (if legal) destination states. Uncomment the assertion once ready.',
              hint: 'From (a,l): P always goes to (a,0). A only from a=0, goes to (1,0). L only if l<2, goes to (a,l+1). Take modulo MOD after every addition.',
              label: 'From Scratch — Attendance Record Counting',
              code: `MOD = 10**9 + 7


def check_record_scratch(n):
    dp = {(a, l): 0 for a in range(2) for l in range(3)}
    dp[(0, 0)] = 1
    for _ in range(n):
        ndp = {(a, l): 0 for a in range(2) for l in range(3)}
        for a in range(2):
            for l in range(3):
                cur = dp[(a, l)]
                if cur == 0:
                    continue
                # YOUR CODE HERE:
                # ndp[(a, 0)] += cur  (P transition, always legal)
                # if a == 0: ndp[(1, 0)] += cur  (A transition)
                # if l < 2: ndp[(a, l+1)] += cur  (L transition)
                # remember modulo MOD after each addition
                pass
        dp = ndp
    return sum(dp.values()) % MOD


# --- Uncomment to test when ready ---
# result = check_record_scratch(5)
# print(f"check_record_scratch(5) = {result}")
# assert result == 94, f"got {result}"
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
      text: 'Why is a state of just (absences so far, trailing consecutive lates) enough to decide eligibility, rather than needing the entire record so far?',
      options: [
        'It is not enough — the full record must always be kept',
        'Because eligibility only depends on the TOTAL absence count (capped at "0, 1, or already-disqualified") and the CURRENT streak of consecutive lates (capped at "0, 1, 2, or already-disqualified") — no other detail of the earlier record affects whether future letters keep it eligible',
        'Because the record is always sorted alphabetically, making earlier letters irrelevant',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'How does this counting problem\'s state machine relate to Lesson 1\'s stock-trading state machine?',
      options: [
        'They are unrelated — counting problems require an entirely different family of techniques than optimization problems',
        'They share the identical recipe (enumerate situations, enumerate legal transitions, one recurrence per situation) — only the aggregation operator differs: this lesson SUMS over incoming transitions to count ways, while Lesson 1 took a MAX over incoming transitions to find best profit',
        'They are related only in that both happen to use loops',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why must the transition from (a=1, l) on letter \'A\', and from (a, l=2) on letter \'L\', be OMITTED from the recurrence rather than included with a count of 0?',
      options: [
        'Omitting vs. including with 0 makes no difference to the final answer either way',
        'Because these are genuinely illegal transitions (a second absence, or a third consecutive late, disqualifies the record) — accidentally including them (e.g. forgetting the a==0 or l<2 guard) would silently add ineligible records into the count, overcounting the true answer',
        'Because Python dictionaries cannot store a value of 0',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the single biggest takeaway from seeing the same recipe applied to stock trading, k-transaction budgets, and attendance-record counting across this chapter?',
      options: [
        'That dynamic programming problems must always involve either money or scheduling',
        'That the surface story of a problem (trading stocks vs. counting valid strings) is not what determines the technique — recognizing the underlying state-machine SHAPE (a small set of situations with legal transitions between them) is what allows the same recipe to solve genuinely new, unfamiliar problems',
        'That state-machine DP only works when the number of states is exactly 3',
      ],
      correct: 1,
    },
  ],
};
