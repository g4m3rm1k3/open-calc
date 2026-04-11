export default {
  id: 'dsa6-002',
  slug: 'binary-search',
  chapter: 'dsa6',
  order: 2,
  title: 'Binary Search',
  subtitle: 'Eliminate half the search space with every comparison — O(log n)',
  tags: ['binary search', 'search', 'algorithms', 'sorted arrays'],
  aliases: 'binary search bisect log n search answer space leftmost rightmost',

  hook: {
    question: 'Scanning an array one element at a time is O(n). If the array is sorted, every comparison should cut the remaining work in half — O(log n). Binary search does exactly that, and the same template generalises to problems with no array at all.',
    realWorldContext: 'Binary search is everywhere: finding a word in a dictionary, a package version in a registry, a commit that introduced a bug (git bisect), or the minimum viable server count for a deployment. The "search on answer space" variant solves problems phrased as "find the minimum X such that condition(X) is true."',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You can sort data in O(n log n). Binary search exploits sorted order to find a target in O(log n) — which is why sorting is worth the cost.',
      '**The template:** maintain a live window [lo, hi] of candidates. At every step, check the midpoint: if it matches — done; if it is too small, the left half is dead; if it is too large, the right half is dead. After k steps only n / 2^k candidates remain.',
      '**Leftmost / rightmost variants:** when duplicates exist, classic binary search returns any match. A tiny tweak — keep searching left or right after a match — finds the first or last occurrence.',
      '**Search on answer space:** the most powerful form. No sorted array needed. If the feasibility condition is monotone ("if speed k works, k+1 also works"), binary search finds the threshold in O(log(max_value)) time.',
    ],
    callouts: [
      { type: 'sequencing', title: 'Chapter 6, Lesson 2: Binary Search', body: '**Previous lesson:** Sorting algorithms — bubble, insertion, merge, quicksort.\n**This lesson:** Binary search — classic, leftmost/rightmost, search on answer space.\n**Next chapter:** Algorithmic paradigms — D&C, greedy, DP.' },
      { type: 'insight', title: 'lo + (hi - lo) / 2 vs (lo + hi) / 2', body: 'Both give the same result mathematically. The first form avoids integer overflow when lo and hi are very large — relevant in languages with fixed-width integers.' },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Binary Search in Action',
        caption: 'Classic search, leftmost variant, and search on answer space.',
        props: {
          lesson: {
            title: 'Binary Search Visualized',
            subtitle: 'Watch the window shrink.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Binary Search — Step by Step',
                instruction: 'Watch the live window [lo, hi] shrink as the algorithm zeros in on the target.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');

function binarySearchSteps(arr, target) {
  let lo = 0, hi = arr.length - 1;
  const steps = [];
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ lo, hi, mid, midVal: arr[mid],
      decision: arr[mid] === target ? 'FOUND' : arr[mid] < target ? 'go right →' : '← go left' });
    if (arr[mid] === target) break;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return steps;
}

const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const target = 23;
const steps = binarySearchSteps(arr, target);

let html = '<div style="color:#60a5fa;font-size:14px;margin-bottom:8px">Array: [' + arr.join(', ') + '] — searching for <b style="color:#f59e0b">' + target + '</b></div>';

steps.forEach((s, i) => {
  const row = arr.map((v, idx) => {
    if (idx === s.mid) return '<b style="color:#f59e0b">' + v + '</b>';
    if (idx >= s.lo && idx <= s.hi) return '<span style="color:#e2e8f0">' + v + '</span>';
    return '<span style="color:#334155">' + v + '</span>';
  }).join(', ');
  const dc = s.decision === 'FOUND' ? '#4ade80' : '#60a5fa';
  html += '<div style="margin-bottom:6px;padding:6px 10px;background:#1e293b;border-radius:4px">' +
    '<span style="color:#64748b">Step ' + (i+1) + ': lo=' + s.lo + ' hi=' + s.hi + ' mid=' + s.mid + '</span><br>' +
    '[' + row + ']<br>' +
    '<span style="color:' + dc + '">arr[' + s.mid + ']=' + s.midVal + ' → ' + s.decision + '</span>' +
    '</div>';
});
d.innerHTML = html;`,
                outputHeight: 340,
              },
              {
                type: 'js',
                title: 'Leftmost and Rightmost Variants',
                instruction: 'When match is found, keep searching left (hi = mid - 1) for leftmost, or right (lo = mid + 1) for rightmost.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');

function findLeftmost(arr, target) {
  let lo = 0, hi = arr.length - 1, result = -1, steps = [];
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) { result = mid; steps.push({ mid, note: 'match! keep searching left', hi: mid - 1 }); hi = mid - 1; }
    else if (arr[mid] < target) { steps.push({ mid, note: 'too small → go right' }); lo = mid + 1; }
    else { steps.push({ mid, note: 'too large → go left' }); hi = mid - 1; }
  }
  return { result, steps };
}

const arr = [1, 2, 2, 2, 3, 4, 4, 5];
const target = 2;
const { result, steps } = findLeftmost(arr, target);

let html = '<div style="color:#60a5fa;margin-bottom:6px">arr=' + JSON.stringify(arr) + ' — leftmost ' + target + '</div>';
html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:8px">Key: when match found, record index but keep searching LEFT (hi = mid - 1)</div>';
steps.forEach((s, i) => {
  const c = s.note.startsWith('match') ? '#4ade80' : '#94a3b8';
  html += '<div style="padding:5px 10px;margin-bottom:4px;background:#1e293b;border-radius:3px">Step ' + (i+1) + ': mid=' + s.mid + ' — <span style="color:' + c + '">' + s.note + '</span></div>';
});
html += '<div style="color:#4ade80;margin-top:8px">→ leftmost index of ' + target + ': <b>' + result + '</b></div>';
d.innerHTML = html;`,
                outputHeight: 260,
              },
              {
                type: 'js',
                title: 'Binary Search on Answer Space — minEatingSpeed',
                instruction: 'Search over a range of possible answers, not an array index. Works whenever the feasibility condition is monotone.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');

function canFinish(piles, h, speed) {
  let hours = 0;
  for (const p of piles) hours += Math.ceil(p / speed);
  return hours <= h;
}

function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles), result = hi;
  const steps = [];
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canFinish(piles, h, mid)) {
      result = mid;
      steps.push({ mid, ok: true, note: 'speed=' + mid + ' works → try slower (hi=mid-1)' });
      hi = mid - 1;
    } else {
      steps.push({ mid, ok: false, note: 'speed=' + mid + ' too slow → try faster (lo=mid+1)' });
      lo = mid + 1;
    }
  }
  return { result, steps };
}

const piles = [3, 6, 7, 11], h = 8;
const { result, steps } = minEatingSpeed(piles, h);

let html = '<div style="color:#60a5fa;margin-bottom:4px">piles=' + JSON.stringify(piles) + ', h=' + h + ' — minimum eating speed?</div>';
html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:8px">No array — searching the space of possible speed values [1, max(piles)]</div>';
steps.forEach((s, i) => {
  const c = s.ok ? '#4ade80' : '#f87171';
  html += '<div style="padding:5px 10px;margin-bottom:4px;background:#1e293b;border-radius:3px">Step ' + (i+1) + ': <span style="color:' + c + '">' + s.note + '</span></div>';
});
html += '<div style="color:#4ade80;margin-top:8px;font-weight:bold">Answer: minimum speed = ' + result + '</div>';
d.innerHTML = html;`,
                outputHeight: 260,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Binary Search in JavaScript',
        caption: 'Classic search, leftmost/rightmost, answer space — then from scratch.',
        props: {
          lesson: {
            title: 'Binary Search in JavaScript',
            subtitle: 'Write every variant from scratch.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Classic Binary Search

Maintain \`lo\` and \`hi\` as inclusive bounds. At each step, check the midpoint and eliminate the half that cannot contain the target.

Use \`lo + Math.floor((hi - lo) / 2)\` instead of \`(lo + hi) / 2\` to avoid integer overflow.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `// Search sorted array for target. Return index or -1.
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    // TODO: const mid = lo + Math.floor((hi - lo) / 2)
    // TODO: if (arr[mid] === target) return mid
    // TODO: if (arr[mid] < target)  lo = mid + 1
    // TODO: else                    hi = mid - 1
  }

  return -1;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;
}

const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
test('find 7 → index 3',    binarySearch(arr, 7),  3);
test('find 1 → index 0',    binarySearch(arr, 1),  0);
test('find 19 → index 9',   binarySearch(arr, 19), 9);
test('find 6 → not found',  binarySearch(arr, 6),  -1);
test('find 20 → not found', binarySearch(arr, 20), -1);`,
                solutionCode: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target)  lo = mid + 1;
    else                    hi = mid - 1;
  }
  return -1;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;
}

const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
test('find 7 → index 3',    binarySearch(arr, 7),  3);
test('find 1 → index 0',    binarySearch(arr, 1),  0);
test('find 19 → index 9',   binarySearch(arr, 19), 9);
test('find 6 → not found',  binarySearch(arr, 6),  -1);
test('find 20 → not found', binarySearch(arr, 20), -1);`,
                outputHeight: 160,
              },

              {
                type: 'js',
                instruction: `## Step 2 — Leftmost and Rightmost Occurrence

When duplicates exist, classic binary search returns any match.

**Leftmost:** when \`arr[mid] === target\`, record the index but continue searching left (\`hi = mid - 1\`).
**Rightmost:** when \`arr[mid] === target\`, continue searching right (\`lo = mid + 1\`).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `// Return index of FIRST occurrence of target, or -1
function findLeftmost(arr, target) {
  let lo = 0, hi = arr.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      result = mid;
      // TODO: keep searching left — hi = mid - 1
    } else if (arr[mid] < target) {
      // TODO: lo = mid + 1
    } else {
      // TODO: hi = mid - 1
    }
  }
  return result;
}

// Return index of LAST occurrence of target, or -1
function findRightmost(arr, target) {
  let lo = 0, hi = arr.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      result = mid;
      // TODO: keep searching right — lo = mid + 1
    } else if (arr[mid] < target) {
      // TODO: lo = mid + 1
    } else {
      // TODO: hi = mid - 1
    }
  }
  return result;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;
}

const arr = [1, 2, 2, 2, 3, 4, 4, 5];
test('leftmost 2',   findLeftmost(arr, 2),  1);
test('rightmost 2',  findRightmost(arr, 2), 3);
test('leftmost 4',   findLeftmost(arr, 4),  5);
test('rightmost 4',  findRightmost(arr, 4), 6);
test('leftmost 9',   findLeftmost(arr, 9),  -1);`,
                solutionCode: `function findLeftmost(arr, target) {
  let lo = 0, hi = arr.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) { result = mid; hi = mid - 1; }
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return result;
}

function findRightmost(arr, target) {
  let lo = 0, hi = arr.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) { result = mid; lo = mid + 1; }
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return result;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;
}

const arr = [1, 2, 2, 2, 3, 4, 4, 5];
test('leftmost 2',   findLeftmost(arr, 2),  1);
test('rightmost 2',  findRightmost(arr, 2), 3);
test('leftmost 4',   findLeftmost(arr, 4),  5);
test('rightmost 4',  findRightmost(arr, 4), 6);
test('leftmost 9',   findLeftmost(arr, 9),  -1);`,
                outputHeight: 160,
              },

              {
                type: 'js',
                instruction: `## Step 3 — Binary Search on Answer Space

The most powerful form: binary search over a *range of possible answers*, not an array.

**Key insight:** if the feasibility condition is monotone ("if speed k works, k+1 also works"), binary search finds the smallest k that works. No sorted array needed — just lo=1, hi=max possible answer.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `// Given piles of bananas and h hours, find the minimum eating speed k
// such that ceil(pile/k) hours summed over all piles is <= h.
function canFinish(piles, h, speed) {
  // TODO: sum Math.ceil(p / speed) for each pile; return true if total <= h
}

function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles), result = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    // TODO: if canFinish → record result, search lower (hi = mid - 1)
    // TODO: else → search higher (lo = mid + 1)
  }
  return result;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;
}

test('piles [3,6,7,11] h=8',       minEatingSpeed([3,6,7,11], 8),        4);
test('piles [30,11,23,4,20] h=5',  minEatingSpeed([30,11,23,4,20], 5),  30);
test('piles [30,11,23,4,20] h=6',  minEatingSpeed([30,11,23,4,20], 6),  23);`,
                solutionCode: `function canFinish(piles, h, speed) {
  let hours = 0;
  for (const p of piles) hours += Math.ceil(p / speed);
  return hours <= h;
}

function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles), result = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canFinish(piles, h, mid)) { result = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return result;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;
}

test('piles [3,6,7,11] h=8',       minEatingSpeed([3,6,7,11], 8),        4);
test('piles [30,11,23,4,20] h=5',  minEatingSpeed([30,11,23,4,20], 5),  30);
test('piles [30,11,23,4,20] h=6',  minEatingSpeed([30,11,23,4,20], 6),  23);`,
                outputHeight: 120,
              },

              {
                type: 'js',
                instruction: `## From Scratch — All Binary Search Variants

Empty shells — fill in all five functions from memory. 10 tests verify correctness.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function binarySearch(arr, target) {
  // your code — return index or -1
}

function findLeftmost(arr, target) {
  // your code — return index of first occurrence or -1
}

function findRightmost(arr, target) {
  // your code — return index of last occurrence or -1
}

function canFinish(piles, h, speed) {
  // your code — return bool
}

function minEatingSpeed(piles, h) {
  // your code — return minimum speed integer
}

const out = document.getElementById('out');
const results = [];
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  results.push(p);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;
}

const arr = [1, 3, 5, 7, 9, 11];
test('bsearch found',   binarySearch(arr, 7),  3);
test('bsearch missing', binarySearch(arr, 4), -1);

const dup = [1, 2, 2, 2, 3, 4, 4, 5];
test('leftmost 2',       findLeftmost(dup, 2),  1);
test('rightmost 2',      findRightmost(dup, 2), 3);
test('leftmost 4',       findLeftmost(dup, 4),  5);
test('rightmost 4',      findRightmost(dup, 4), 6);
test('leftmost missing', findLeftmost(dup, 9), -1);

test('minEating 1', minEatingSpeed([3,6,7,11], 8), 4);
test('minEating 2', minEatingSpeed([30,11,23,4,20], 5), 30);
test('minEating 3', minEatingSpeed([30,11,23,4,20], 6), 23);

const all = results.every(Boolean);
out.innerHTML += \`<div style="margin-top:8px;color:\${all?'#4ade80':'#f59e0b'}">\${results.filter(Boolean).length}/\${results.length} tests passed</div>\`;`,
                solutionCode: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

function findLeftmost(arr, target) {
  let lo = 0, hi = arr.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) { result = mid; hi = mid - 1; }
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return result;
}

function findRightmost(arr, target) {
  let lo = 0, hi = arr.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) { result = mid; lo = mid + 1; }
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return result;
}

function canFinish(piles, h, speed) {
  let hours = 0;
  for (const p of piles) hours += Math.ceil(p / speed);
  return hours <= h;
}

function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles), result = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canFinish(piles, h, mid)) { result = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return result;
}

const out = document.getElementById('out');
const results = [];
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  results.push(p);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;
}

const arr = [1, 3, 5, 7, 9, 11];
test('bsearch found',   binarySearch(arr, 7),  3);
test('bsearch missing', binarySearch(arr, 4), -1);

const dup = [1, 2, 2, 2, 3, 4, 4, 5];
test('leftmost 2',       findLeftmost(dup, 2),  1);
test('rightmost 2',      findRightmost(dup, 2), 3);
test('leftmost 4',       findLeftmost(dup, 4),  5);
test('rightmost 4',      findRightmost(dup, 4), 6);
test('leftmost missing', findLeftmost(dup, 9), -1);

test('minEating 1', minEatingSpeed([3,6,7,11], 8), 4);
test('minEating 2', minEatingSpeed([30,11,23,4,20], 5), 30);
test('minEating 3', minEatingSpeed([30,11,23,4,20], 6), 23);

const all = results.every(Boolean);
out.innerHTML += \`<div style="margin-top:8px;color:\${all?'#4ade80':'#f59e0b'}">\${results.filter(Boolean).length}/\${results.length} tests passed</div>\`;`,
                outputHeight: 300,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Build Binary Search in Python',
        caption: 'All variants in Python with search-space visualization.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — Classic Binary Search',
              prose: [
                'Same template as JavaScript. Python integer division is // — no Math.floor needed.',
                'Use lo + (hi - lo) // 2 to stay safe even with very large indices.',
              ],
              instructions: 'Fill in binary_search(). Return the index or -1.',
              code: `# TODO: fill in binary_search
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    # while lo <= hi:
    #   mid = lo + (hi - lo) // 2
    #   if arr[mid] == target: return mid
    #   elif arr[mid] < target: lo = mid + 1
    #   else: hi = mid - 1
    # return -1
    pass

arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
print('find 7:', binary_search(arr, 7))    # 3
print('find 1:', binary_search(arr, 1))    # 0
print('find 19:', binary_search(arr, 19))  # 9
print('find 6:', binary_search(arr, 6))    # -1`,
              output: `find 7: 3
find 1: 0
find 19: 9
find 6: -1`,
              status: 'idle',
              figureJson: null,
            },

            {
              id: 2,
              cellTitle: 'Step 2 — Leftmost, Rightmost, and Answer Space',
              prose: [
                'Three variants on the same template. The only difference is what you do when arr[mid] == target.',
                'Python ceiling division trick: -(-p // speed) avoids importing math.',
              ],
              instructions: 'Implement find_leftmost(), find_rightmost(), and min_eating_speed().',
              code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

# TODO: find_leftmost — return index of first occurrence or -1
def find_leftmost(arr, target):
    lo, hi, result = 0, len(arr) - 1, -1
    # while lo <= hi:
    #   mid = lo + (hi - lo) // 2
    #   if arr[mid] == target: result = mid; hi = mid - 1
    #   elif arr[mid] < target: lo = mid + 1
    #   else: hi = mid - 1
    # return result
    pass

# TODO: find_rightmost — return index of last occurrence or -1
def find_rightmost(arr, target):
    pass

def can_finish(piles, h, speed):
    return sum(-(-p // speed) for p in piles) <= h  # ceiling division

# TODO: min_eating_speed — binary search on answer space [1, max(piles)]
def min_eating_speed(piles, h):
    pass

dup = [1, 2, 2, 2, 3, 4, 4, 5]
print('leftmost 2:', find_leftmost(dup, 2))    # 1
print('rightmost 2:', find_rightmost(dup, 2))  # 3
print('min speed:', min_eating_speed([3,6,7,11], 8))  # 4`,
              output: `leftmost 2: 1
rightmost 2: 3
min speed: 4`,
              status: 'idle',
              figureJson: null,
            },

            {
              id: 3,
              cellTitle: 'From Scratch — All Variants + Search Space Visualization',
              prose: [
                'Write all five functions from memory. When assertions pass, opencalc draws the binary search elimination steps — each row shows which half of the array survives.',
              ],
              instructions: 'Fill in all functions. The figure visualizes how the search window shrinks step by step.',
              code: `from opencalc import Figure

def binary_search(arr, target):
    pass  # your code

def find_leftmost(arr, target):
    pass  # your code

def find_rightmost(arr, target):
    pass  # your code

def can_finish(piles, h, speed):
    pass  # your code

def min_eating_speed(piles, h):
    pass  # your code

# ---------- Assertions ----------
arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
assert binary_search(arr, 7)  == 3,  "find 7"
assert binary_search(arr, 1)  == 0,  "find 1"
assert binary_search(arr, 6)  == -1, "find 6 (missing)"

dup = [1, 2, 2, 2, 3, 4, 4, 5]
assert find_leftmost(dup, 2)  == 1,  "leftmost 2"
assert find_rightmost(dup, 2) == 3,  "rightmost 2"
assert find_leftmost(dup, 9)  == -1, "leftmost missing"

assert min_eating_speed([3,6,7,11], 8)        == 4,  "min speed 1"
assert min_eating_speed([30,11,23,4,20], 5)   == 30, "min speed 2"

print("All assertions passed!")

# ---------- Visualize: search space elimination ----------
search_arr = list(range(2, 22, 2))  # [2, 4, 6, ..., 20]
target = 14

steps = []
lo, hi = 0, len(search_arr) - 1
while lo <= hi:
    mid = lo + (hi - lo) // 2
    steps.append({'lo': lo, 'hi': hi, 'mid': mid})
    if search_arr[mid] == target: break
    elif search_arr[mid] < target: lo = mid + 1
    else: hi = mid - 1

fig = Figure()
fig.set_title(f"Binary search for {target} in {search_arr}")

for step_i, step in enumerate(steps):
    for i, v in enumerate(search_arr):
        y = -step_i * 1.5
        if i < step['lo'] or i > step['hi']:
            fig.point(i, y, label="", color="#1e293b", size=4)
        elif i == step['mid']:
            fig.point(i, y, label=str(v), color="#f59e0b", size=8)
        else:
            fig.point(i, y, label=str(v), color="#60a5fa", size=6)

fig.show()`,
              output: `All assertions passed!`,
              status: 'idle',
              figureJson: null,
            },
          ],
        },
      },
    ],
  },
};
