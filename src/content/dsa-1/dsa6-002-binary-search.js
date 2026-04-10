const lesson = {
  id: 'dsa6-002',
  title: 'Binary Search',
  subtitle: 'Eliminate half the search space with every comparison — O(log n)',
  course: 'dsa-1',
  chapter: 'dsa6',

  scienceNotebook: {
    title: 'Binary Search and Its Generalizations',
    subtitle: 'The core algorithm, then the pattern for solving harder problems',
    sequential: true,
    cells: [
      {
        id: 'binary-search-demo',
        title: 'Binary Search — Step by Step',
        type: 'js',
        code: `
const display = document.getElementById('display');

function binarySearchSteps(arr, target) {
  let lo = 0, hi = arr.length - 1;
  const steps = [];
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ lo, hi, mid, midVal: arr[mid], target,
                 decision: arr[mid] === target ? 'FOUND' : arr[mid] < target ? 'go right' : 'go left' });
    if (arr[mid] === target) break;
    if (arr[mid] < target) lo = mid + 1;
    else                   hi = mid - 1;
  }
  if (steps[steps.length-1]?.decision !== 'FOUND') steps.push({ notFound: true });
  return steps;
}

const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const target = 23;
const steps = binarySearchSteps(arr, target);

let html = '<h3 style="color:#60a5fa;margin:0 0 4px">Array: [' + arr.join(', ') + ']</h3>';
html += '<p style="color:#94a3b8;margin:0 0 12px;font-size:13px">Searching for <b style="color:#f59e0b">' + target + '</b> — only ' + (steps.length - (steps[steps.length-1].notFound ? 1 : 0)) + ' comparisons needed for 10 elements</p>';

steps.forEach((s, i) => {
  if (s.notFound) { html += '<div style="color:#f87171;padding:8px">Not found</div>'; return; }
  const arrDisplay = arr.map((v, idx) => {
    if (idx === s.mid) return '<b style="color:#f59e0b">' + v + '</b>';
    if (idx >= s.lo && idx <= s.hi) return '<span style="color:#e2e8f0">' + v + '</span>';
    return '<span style="color:#334155">' + v + '</span>';
  }).join(', ');
  const decColor = s.decision === 'FOUND' ? '#4ade80' : '#60a5fa';
  html += '<div style="margin-bottom:8px;padding:8px;background:#1e293b;border-radius:4px;font-size:13px">' +
    '<div style="color:#94a3b8;font-size:11px">Step ' + (i+1) + ': lo=' + s.lo + ' hi=' + s.hi + ' mid=' + s.mid + '</div>' +
    '<div style="font-family:monospace;margin:4px 0">[' + arrDisplay + ']</div>' +
    '<div style="color:' + decColor + '">arr[' + s.mid + ']=' + s.midVal + ' → ' + s.decision + '</div>' +
    '</div>';
});
display.innerHTML = html;
        `,
        html: '<div id="display" style="padding:12px"></div>',
      },

      {
        id: 'binary-search-template',
        title: 'The Binary Search Template',
        type: 'js',
        code: `
const display = document.getElementById('display');

display.innerHTML = \`
<div style="color:#e2e8f0;font-size:14px;line-height:1.8">
  <h3 style="color:#60a5fa;margin:0 0 12px">The Universal Binary Search Template</h3>
  <pre style="background:#1e293b;padding:12px;border-radius:6px;font-size:13px;color:#e2e8f0;overflow:auto">
<span style="color:#94a3b8">// Works for: "find value", "find leftmost", "find rightmost",</span>
<span style="color:#94a3b8">// "find insertion point", "search on answer space"</span>
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;   <span style="color:#64748b">// inclusive bounds</span>

  while (lo &lt;= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); <span style="color:#64748b">// avoids integer overflow</span>

    if (arr[mid] === target) return mid;   <span style="color:#4ade80">// ✓ exact match</span>
    if (arr[mid] &lt; target)  lo = mid + 1; <span style="color:#60a5fa">// target is in right half</span>
    else                    hi = mid - 1; <span style="color:#f59e0b">// target is in left half</span>
  }

  return -1; <span style="color:#f87171">// not found</span>
}
  </pre>
  <div style="margin-top:12px;background:#0f172a;border-radius:6px;padding:10px;font-size:13px;color:#94a3b8">
    Key insight: lo + (hi - lo) / 2 and (lo + hi) / 2 give the same result mathematically,
    but the first form avoids integer overflow when lo and hi are very large numbers.
  </div>
</div>
\`;
        `,
        html: '<div id="display" style="padding:12px"></div>',
      },

      {
        id: 'binary-search-variants',
        title: 'Binary Search on the Answer — A Powerful Generalization',
        type: 'js',
        code: `
const display = document.getElementById('display');

// Problem: "What is the minimum speed (k) at which a person can eat
// all bananas in piles[] within h hours?"
// This is binary search on the ANSWER SPACE, not an array index.

function canFinish(piles, h, speed) {
  let hours = 0;
  for (const p of piles) hours += Math.ceil(p / speed);
  return hours <= h;
}

function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  let result = hi;
  const steps = [];
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (canFinish(piles, h, mid)) {
      result = mid;
      steps.push({ mid, feasible: true, note: 'speed=' + mid + ' works → try slower' });
      hi = mid - 1;
    } else {
      steps.push({ mid, feasible: false, note: 'speed=' + mid + ' too slow → try faster' });
      lo = mid + 1;
    }
  }
  return { result, steps };
}

const piles = [3, 6, 7, 11];
const h = 8;
const { result, steps } = minEatingSpeed(piles, h);

let html = '<h3 style="color:#60a5fa;margin:0 0 4px">Binary Search on Answer Space</h3>';
html += '<p style="color:#94a3b8;font-size:13px;margin:0 0 12px">piles=[3,6,7,11], h=' + h + ' hours — minimum speed to finish?</p>';
steps.forEach((s, i) => {
  const c = s.feasible ? '#4ade80' : '#f87171';
  html += '<div style="padding:6px 10px;margin-bottom:5px;background:#1e293b;border-radius:4px;font-size:13px">' +
    'Step ' + (i+1) + ': try mid=<b style="color:#f59e0b">' + s.mid + '</b> — <span style="color:' + c + '">' + s.note + '</span>' +
    '</div>';
});
html += '<p style="color:#4ade80;margin-top:8px;font-weight:bold">Answer: minimum speed = ' + result + '</p>';
html += '<p style="color:#94a3b8;font-size:12px">The array doesn\'t exist — we\'re searching a range of possible answers. The condition is monotone: if speed k works, k+1 also works.</p>';
display.innerHTML = html;
        `,
        html: '<div id="display" style="padding:12px"></div>',
      },
    ],
  },

  jsNotebook: {
    title: 'Binary Search — JavaScript',
    subtitle: 'Classic binary search, leftmost/rightmost variants, and search on answer space',
    cells: [
      {
        id: 'bsearch-js-classic',
        title: 'Step 1 — Classic Binary Search',
        prose: [
          'The array must be sorted. Maintain lo and hi as inclusive bounds. At each step, check the middle element and eliminate the half that can\'t contain the target.',
        ],
        instructions: 'Implement binarySearch(). Return the index if found, -1 if not.',
        startCode: `// Search sorted array for target. Return index or -1.
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    // TODO: mid = lo + Math.floor((hi - lo) / 2)
    // TODO: if arr[mid] === target: return mid
    // TODO: if arr[mid] < target:  lo = mid + 1
    // TODO: else:                  hi = mid - 1
  }

  return -1;
}

// --- Tests ---
const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
console.log('find 7:', binarySearch(arr, 7));   // 3
console.log('find 1:', binarySearch(arr, 1));   // 0
console.log('find 19:', binarySearch(arr, 19)); // 9
console.log('find 6:', binarySearch(arr, 6));   // -1
console.log('find 20:', binarySearch(arr, 20)); // -1
`,
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

const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
console.log('find 7:', binarySearch(arr, 7));
console.log('find 1:', binarySearch(arr, 1));
console.log('find 19:', binarySearch(arr, 19));
console.log('find 6:', binarySearch(arr, 6));
console.log('find 20:', binarySearch(arr, 20));
`,
        check: (output) => {
          return output.includes('find 7: 3') &&
                 output.includes('find 1: 0') &&
                 output.includes('find 19: 9') &&
                 output.includes('find 6: -1') &&
                 output.includes('find 20: -1');
        },
      },

      {
        id: 'bsearch-js-leftmost',
        title: 'Step 2 — Leftmost and Rightmost Occurrence',
        prose: [
          'When duplicates exist, classic binary search returns any matching index. Sometimes you need the first or last occurrence.',
          'leftmost: when found, don\'t stop — record the index but keep searching left (hi = mid - 1). rightmost: keep searching right (lo = mid + 1).',
        ],
        instructions: 'Implement findLeftmost() and findRightmost().',
        startCode: `// Return index of FIRST occurrence of target, or -1 if not found
function findLeftmost(arr, target) {
  let lo = 0, hi = arr.length - 1;
  let result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      result = mid;
      // TODO: don't stop — keep searching left (hi = mid - 1)
    } else if (arr[mid] < target) {
      // TODO: lo = mid + 1
    } else {
      // TODO: hi = mid - 1
    }
  }
  return result;
}

// Return index of LAST occurrence of target, or -1 if not found
function findRightmost(arr, target) {
  let lo = 0, hi = arr.length - 1;
  let result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      result = mid;
      // TODO: keep searching right (lo = mid + 1)
    } else if (arr[mid] < target) {
      // TODO: lo = mid + 1
    } else {
      // TODO: hi = mid - 1
    }
  }
  return result;
}

// --- Tests ---
const arr = [1, 2, 2, 2, 3, 4, 4, 5];
console.log('leftmost 2:', findLeftmost(arr, 2));   // 1
console.log('rightmost 2:', findRightmost(arr, 2)); // 3
console.log('leftmost 4:', findLeftmost(arr, 4));   // 5
console.log('rightmost 4:', findRightmost(arr, 4)); // 6
console.log('leftmost 9:', findLeftmost(arr, 9));   // -1
`,
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

const arr = [1, 2, 2, 2, 3, 4, 4, 5];
console.log('leftmost 2:', findLeftmost(arr, 2));
console.log('rightmost 2:', findRightmost(arr, 2));
console.log('leftmost 4:', findLeftmost(arr, 4));
console.log('rightmost 4:', findRightmost(arr, 4));
console.log('leftmost 9:', findLeftmost(arr, 9));
`,
        check: (output) => {
          return output.includes('leftmost 2: 1') &&
                 output.includes('rightmost 2: 3') &&
                 output.includes('leftmost 4: 5') &&
                 output.includes('rightmost 4: 6') &&
                 output.includes('leftmost 9: -1');
        },
      },

      {
        id: 'bsearch-js-answer-space',
        title: 'Step 3 — Binary Search on Answer Space',
        prose: [
          'The most powerful form: binary search over a range of possible answers, not an array.',
          'Key insight: if the answer has a monotone property ("if X works, X+1 also works"), you can binary search for the smallest X that works.',
        ],
        instructions: 'Implement minEatingSpeed() — find the minimum eating speed to finish all bananas in h hours.',
        startCode: `// Given piles of bananas and h hours, find the minimum eating speed k
// such that eating k bananas per hour finishes all piles in <= h hours.
// At each pile, you eat min(k, pile) bananas per hour for that pile.

function canFinish(piles, h, speed) {
  // TODO: sum up Math.ceil(pile / speed) for each pile
  // return true if total hours <= h
}

function minEatingSpeed(piles, h) {
  // Binary search on speed: lo=1, hi=max(piles)
  // If canFinish at mid: record mid as result, search lower (hi = mid - 1)
  // Else: search higher (lo = mid + 1)
  // TODO
}

// --- Tests ---
console.log('test 1:', minEatingSpeed([3,6,7,11], 8));  // 4
console.log('test 2:', minEatingSpeed([30,11,23,4,20], 5)); // 30
console.log('test 3:', minEatingSpeed([30,11,23,4,20], 6)); // 23
`,
        solutionCode: `function canFinish(piles, h, speed) {
  let hours = 0;
  for (const p of piles) hours += Math.ceil(p / speed);
  return hours <= h;
}

function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  let result = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canFinish(piles, h, mid)) { result = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return result;
}

console.log('test 1:', minEatingSpeed([3,6,7,11], 8));
console.log('test 2:', minEatingSpeed([30,11,23,4,20], 5));
console.log('test 3:', minEatingSpeed([30,11,23,4,20], 6));
`,
        check: (output) => {
          return output.includes('test 1: 4') &&
                 output.includes('test 2: 30') &&
                 output.includes('test 3: 23');
        },
      },

      {
        id: 'bsearch-js-scratch',
        title: 'From Scratch — All Binary Search Variants',
        prose: [
          'Write binarySearch, findLeftmost, findRightmost, canFinish, and minEatingSpeed from memory.',
        ],
        instructions: 'Empty shells — fill in all five functions. 10 tests verify correctness.',
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

// --- Test Suite ---
let pass = 0, fail = 0;
function test(desc, got, expected) {
  const g = JSON.stringify(got), e = JSON.stringify(expected);
  if (g === e) { console.log('✓', desc); pass++; }
  else { console.log('✗', desc, '| expected:', e, '| got:', g); fail++; }
}

const arr = [1, 3, 5, 7, 9, 11];
test('bsearch found',    binarySearch(arr, 7),  3);
test('bsearch missing',  binarySearch(arr, 4), -1);

const dup = [1, 2, 2, 2, 3, 4, 4, 5];
test('leftmost 2',  findLeftmost(dup, 2),  1);
test('rightmost 2', findRightmost(dup, 2), 3);
test('leftmost 4',  findLeftmost(dup, 4),  5);
test('rightmost 4', findRightmost(dup, 4), 6);
test('leftmost missing', findLeftmost(dup, 9), -1);

test('minEating 1', minEatingSpeed([3,6,7,11], 8), 4);
test('minEating 2', minEatingSpeed([30,11,23,4,20], 5), 30);
test('minEating 3', minEatingSpeed([30,11,23,4,20], 6), 23);

console.log('\\n' + pass + '/' + (pass+fail) + ' tests passed');
`,
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

let pass = 0, fail = 0;
function test(desc, got, expected) {
  const g = JSON.stringify(got), e = JSON.stringify(expected);
  if (g === e) { console.log('✓', desc); pass++; }
  else { console.log('✗', desc, '| expected:', e, '| got:', g); fail++; }
}

const arr = [1, 3, 5, 7, 9, 11];
test('bsearch found',    binarySearch(arr, 7),  3);
test('bsearch missing',  binarySearch(arr, 4), -1);

const dup = [1, 2, 2, 2, 3, 4, 4, 5];
test('leftmost 2',  findLeftmost(dup, 2),  1);
test('rightmost 2', findRightmost(dup, 2), 3);
test('leftmost 4',  findLeftmost(dup, 4),  5);
test('rightmost 4', findRightmost(dup, 4), 6);
test('leftmost missing', findLeftmost(dup, 9), -1);

test('minEating 1', minEatingSpeed([3,6,7,11], 8), 4);
test('minEating 2', minEatingSpeed([30,11,23,4,20], 5), 30);
test('minEating 3', minEatingSpeed([30,11,23,4,20], 6), 23);

console.log('\\n' + pass + '/' + (pass+fail) + ' tests passed');
`,
        check: (output) => {
          return output.includes('10/10 tests passed');
        },
      },
    ],
  },

  pythonNotebook: {
    title: 'Binary Search — Python',
    subtitle: 'All variants in Python with search-space visualization',
    cells: [
      {
        id: 'bsearch-py-classic',
        cellTitle: 'Step 1 — Classic Binary Search',
        prose: [
          'Same template as JavaScript. Python integer division is // — no Math.floor needed.',
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
print('find 7:', binary_search(arr, 7))   # 3
print('find 1:', binary_search(arr, 1))   # 0
print('find 19:', binary_search(arr, 19)) # 9
print('find 6:', binary_search(arr, 6))   # -1
`,
        output: `find 7: 3
find 1: 0
find 19: 9
find 6: -1`,
        status: 'incomplete',
      },

      {
        id: 'bsearch-py-variants',
        cellTitle: 'Step 2 — Leftmost, Rightmost, and Answer Space',
        prose: [
          'Three variants on the same template. The only difference is what you do when arr[mid] == target.',
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

# TODO: fill in find_leftmost — return index of first occurrence or -1
def find_leftmost(arr, target):
    pass

# TODO: fill in find_rightmost — return index of last occurrence or -1
def find_rightmost(arr, target):
    pass

def can_finish(piles, h, speed):
    return sum(-(-p // speed) for p in piles) <= h  # ceiling division trick

# TODO: fill in min_eating_speed
def min_eating_speed(piles, h):
    # lo, hi = 1, max(piles)
    # result = hi
    # while lo <= hi:
    #   mid = lo + (hi - lo) // 2
    #   if can_finish(piles, h, mid): result = mid; hi = mid - 1
    #   else: lo = mid + 1
    # return result
    pass

dup = [1, 2, 2, 2, 3, 4, 4, 5]
print('leftmost 2:', find_leftmost(dup, 2))    # 1
print('rightmost 2:', find_rightmost(dup, 2))  # 3
print('min speed:', min_eating_speed([3,6,7,11], 8))  # 4
`,
        output: `leftmost 2: 1
rightmost 2: 3
min speed: 4`,
        status: 'incomplete',
      },

      {
        id: 'bsearch-py-scratch',
        cellTitle: 'From Scratch — All Variants + Search Space Visualization',
        prose: [
          'Write all five functions from memory. When assertions pass, opencalc draws the binary search process on an array — showing which half gets eliminated at each step.',
        ],
        instructions: 'Fill in all functions. The figure visualizes search space elimination.',
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
assert find_leftmost(dup, 2)  == 1, "leftmost 2"
assert find_rightmost(dup, 2) == 3, "rightmost 2"
assert find_leftmost(dup, 9)  == -1, "leftmost missing"

assert min_eating_speed([3,6,7,11], 8) == 4, "min speed"
assert min_eating_speed([30,11,23,4,20], 5) == 30, "min speed 2"

print("All assertions passed!")

# ---------- Visualize binary search elimination ----------
search_arr = list(range(2, 22, 2))  # [2,4,6,...,20]
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

# Draw each step as a row of bars, grayed out eliminated halves
for step_i, step in enumerate(steps):
    for i, v in enumerate(search_arr):
        y = -step_i * 1.5
        if i < step['lo'] or i > step['hi']:
            fig.point(i, y, label="", color="#1e293b", size=4)
        elif i == step['mid']:
            fig.point(i, y, label=str(v), color="#f59e0b", size=8)
        else:
            fig.point(i, y, label=str(v), color="#60a5fa", size=6)

fig.show()
`,
        output: `All assertions passed!`,
        status: 'incomplete',
        figureJson: null,
      },
    ],
  },
};

export default lesson;
