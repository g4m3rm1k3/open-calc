export default {
  id: 'dsa3-002',
  slug: 'hashmap-applications',
  chapter: 'dsa3',
  order: 2,
  title: 'Hash Map Applications',
  subtitle: 'The hash map is not just a data structure — it\'s a problem-solving pattern. Frequency counting, two-sum, grouping, and deduplication all collapse into O(n) with a single map.',
  tags: ['frequency map', 'two-sum', 'grouping', 'deduplication', 'anagram grouping', 'O(n)', 'hash map pattern', 'counter'],
  aliases: 'frequency map two sum grouping anagram counter deduplication hash map pattern O(n)',

  hook: {
    question: 'You built the hash table. Now use it. What problems that seemed to require O(n²) brute force can be solved in O(n) with a single hash map?',
    realWorldContext: 'Every autocomplete system counts word frequencies. Every recommendation engine groups users by behavior. Every duplicate-file detector hashes file contents. The two-sum pattern appears in dozens of real interview problems. Once you internalize "when in doubt, try a hash map," your ability to write efficient code changes permanently.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You built a hash table from scratch. Now use Python\'s `dict` and JavaScript\'s `Map`/`{}` — the production tools built on the same idea — to solve real algorithmic problems.',
      '**Pattern 1 — Frequency counting.** Walk the input once, incrementing a count for each element. O(n). Then query counts in O(1). This replaces O(n) nested loops for "how many times does X appear?"',
      '**Pattern 2 — Two-sum: the classic O(n) trade.** Given an array and a target, find two numbers that add up to target. Brute force: O(n²) nested loop. With a map: walk the array, for each number check if `target - number` is already in the map. If yes, found it. If no, add the current number to the map. O(n) total — one pass.',
      '**Pattern 3 — Grouping by key.** Map each item to its "group key" and collect into buckets. Anagram grouping: the sorted string is the key. All words that sort to the same string are anagrams of each other. O(n × k log k) where k = average word length.',
      '**Pattern 4 — Deduplication and seen-sets.** To detect duplicates in O(n): walk the array, add each element to a set. If you see it a second time, it\'s a duplicate. This replaces O(n²) "has this appeared before?" checks.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 3, Lesson 2: Hash Map Applications',
        body: '**Previous:** Hash Tables — built from scratch, understand chaining and O(1) lookup.\n**This lesson:** Four core hash map patterns applied to real problems.\n**Next:** Chapter 4 — Trees.',
      },
      {
        type: 'insight',
        title: 'The hash map trade: space for time',
        body: 'Every hash map optimization trades O(n) extra space for a reduction from O(n²) to O(n) time. This is almost always worth it. The space cost is linear; the time savings are quadratic.',
      },
      {
        type: 'strategy',
        title: '"When in doubt, hash map" — the mental trigger',
        body: 'See a nested loop over an array? Ask: can I replace the inner loop with a hash map lookup?\nSee "find a pair"? Two-sum pattern — map of complements.\nSee "count occurrences"? Frequency map.\nSee "group by property"? Map of lists.\nSee "detect duplicate"? Seen-set.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Two-Sum: Brute Force vs Hash Map',
        mathBridge: 'The brute force checks every pair — O(n²). The hash map solution makes one pass, checking the complement in O(1) each time — O(n) total.',
        caption: 'Same answer. One approach checks n² pairs. The other checks n elements once each.',
        props: {
          lesson: {
            title: 'Two-Sum: O(n²) vs O(n)',
            subtitle: 'Watch the difference.',
            sequential: false,
            cells: [
              {
                type: 'js',
                title: 'Two-Sum: Brute Force vs Hash Map Side by Side',
                instruction: 'Click **Step** to walk both algorithms simultaneously on the same input.\n\n**Left (red):** brute force — every pair is checked.\n**Right (green):** hash map — one pass, O(1) complement lookup.\n\nWatch how many checks each one makes before finding the answer.',
                html: `<div style="margin-bottom:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
  <label style="font-family:monospace;font-size:11px;color:#94a3b8">target:</label>
  <input id="target" type="number" value="9" style="width:56px;padding:5px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:13px">
  <button id="btn-step" style="padding:6px 14px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Step →</button>
  <button id="btn-play" style="padding:6px 12px;border-radius:6px;border:none;background:#0d9488;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Play</button>
  <button id="btn-rst" style="padding:6px 10px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
</div>
<div style="display:flex;gap:12px">
  <div style="flex:1;border:1px solid #7f1d1d;border-radius:6px;padding:10px">
    <div style="color:#f87171;font-size:10px;font-family:monospace;margin-bottom:6px">BRUTE FORCE — O(n²)</div>
    <div id="bf-arr" style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:6px"></div>
    <div id="bf-info" style="font-family:monospace;font-size:11px;color:#64748b;min-height:36px"></div>
    <div id="bf-count" style="font-family:monospace;font-size:11px;color:#f87171;margin-top:4px"></div>
  </div>
  <div style="flex:1;border:1px solid #166534;border-radius:6px;padding:10px">
    <div style="color:#4ade80;font-size:10px;font-family:monospace;margin-bottom:6px">HASH MAP — O(n)</div>
    <div id="hm-arr" style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:6px"></div>
    <div id="hm-map" style="font-family:monospace;font-size:10px;color:#64748b;min-height:20px"></div>
    <div id="hm-info" style="font-family:monospace;font-size:11px;color:#64748b;min-height:18px"></div>
    <div id="hm-count" style="font-family:monospace;font-size:11px;color:#4ade80;margin-top:4px"></div>
  </div>
</div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.el{width:30px;height:30px;border:1px solid #334155;border-radius:4px;background:#1e293b;color:#94a3b8;font-size:13px;display:flex;align-items:center;justify-content:center;font-weight:bold;transition:all .2s}
.el.i{border-color:#f87171;background:#450a0a;color:#f87171}
.el.j{border-color:#f59e0b;background:#1c1007;color:#f59e0b}
.el.found{border-color:#4ade80;background:#052e16;color:#4ade80}
.el.cur{border-color:#6366f1;background:#1e1b4b;color:#a5b4fc}`,
                startCode: `const NUMS = [2, 7, 11, 15, 3, 6, 1, 8];
let target = 9;
let bfI = 0, bfJ = 1, bfChecks = 0, bfDone = false;
let hmI = 0, hmMap = {}, hmChecks = 0, hmDone = false;

function getTarget() { return parseInt(document.getElementById('target').value) || 9; }

function renderArr(id, nums, highlights) {
  const el = document.getElementById(id);
  el.innerHTML = '';
  nums.forEach((n, i) => {
    const d = document.createElement('div');
    d.className = 'el ' + (highlights[i] || '');
    d.textContent = n; el.appendChild(d);
  });
}

function stepBF() {
  if (bfDone) return;
  target = getTarget();
  bfChecks++;
  const h = {}; h[bfI] = 'i'; h[bfJ] = 'j';
  if (NUMS[bfI] + NUMS[bfJ] === target) {
    h[bfI] = 'found'; h[bfJ] = 'found';
    document.getElementById('bf-info').style.color = '#4ade80';
    document.getElementById('bf-info').textContent = \`Found! [\${bfI},\${bfJ}] → \${NUMS[bfI]}+\${NUMS[bfJ]}=\${target}\`;
    bfDone = true;
  } else {
    document.getElementById('bf-info').textContent = \`\${NUMS[bfI]}+\${NUMS[bfJ]}=\${NUMS[bfI]+NUMS[bfJ]} ≠ \${target}\`;
    bfJ++;
    if (bfJ >= NUMS.length) { bfI++; bfJ = bfI + 1; }
    if (bfI >= NUMS.length - 1) bfDone = true;
  }
  renderArr('bf-arr', NUMS, h);
  document.getElementById('bf-count').textContent = \`checks: \${bfChecks}\`;
}

function stepHM() {
  if (hmDone) return;
  target = getTarget();
  const n = NUMS[hmI]; const comp = target - n;
  hmChecks++;
  const h = {}; h[hmI] = 'cur';
  if (comp in hmMap) {
    h[hmMap[comp]] = 'found'; h[hmI] = 'found';
    document.getElementById('hm-info').style.color = '#4ade80';
    document.getElementById('hm-info').textContent = \`Found! complement \${comp} was at index \${hmMap[comp]}\`;
    hmDone = true;
  } else {
    hmMap[n] = hmI;
    document.getElementById('hm-info').textContent = \`\${comp} not in map → store \${n}:\${hmI}\`;
  }
  renderArr('hm-arr', NUMS, h);
  document.getElementById('hm-map').textContent = 'map: {' + Object.entries(hmMap).map(([k,v])=>k+':'+v).join(', ') + '}';
  document.getElementById('hm-count').textContent = \`checks: \${hmChecks}\`;
  hmI++;
}

function reset() {
  bfI=0;bfJ=1;bfChecks=0;bfDone=false;
  hmI=0;hmMap={};hmChecks=0;hmDone=false;
  renderArr('bf-arr',NUMS,{});renderArr('hm-arr',NUMS,{});
  ['bf-info','hm-info','bf-count','hm-count','hm-map'].forEach(id=>document.getElementById(id).textContent='');
}

document.getElementById('btn-step').addEventListener('click',()=>{stepBF();stepHM();});
document.getElementById('btn-rst').addEventListener('click', reset);
document.getElementById('btn-play').addEventListener('click',()=>{
  reset();
  const t=setInterval(()=>{if(bfDone&&hmDone){clearInterval(t);return;}stepBF();stepHM();},500);
});
reset();`,
                outputHeight: 280,
              },
            ],
          },
        },
      },

      // ── JavaScript guided walkthrough ─────────────────────────────────────────
      {
        id: 'JSNotebook',
        title: 'Four Hash Map Patterns in JavaScript',
        caption: 'Frequency count, two-sum, group by key, deduplicate — all in O(n).',
        props: {
          lesson: {
            title: 'Hash Map Patterns in JavaScript',
            subtitle: 'One map. Four problems. All O(n).',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Frequency Count

Count how many times each element appears. The map stores \`element → count\`.

**Implement \`frequencyCount(arr)\`:**
- Create an empty map \`{}\`
- For each element: \`map[el] = (map[el] || 0) + 1\`
- Return the map

Then implement \`mostFrequent(arr)\` — iterate the map's entries to find the key with the highest value.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.info{color:#94a3b8;font-size:11px;margin:1px 0}`,
                startCode: `function frequencyCount(arr) {
  const map = {};
  // TODO: for each element in arr, increment map[el]

  return map;
}

function mostFrequent(arr) {
  const freq = frequencyCount(arr);
  let best = null, bestCount = 0;
  // TODO: iterate Object.entries(freq), find the key with highest value
  // for (const [key, count] of Object.entries(freq)) { ... }

  return best;
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

const freq = frequencyCount(['a','b','a','c','b','a']);
test('freq["a"]', freq['a'], 3);
test('freq["b"]', freq['b'], 2);
test('freq["c"]', freq['c'], 1);
test('mostFrequent', mostFrequent(['a','b','a','c','b','a']), 'a');
test('mostFrequent [1,1,2,3,3,3]', mostFrequent([1,1,2,3,3,3]), 3);

// Show the map
out.innerHTML += '<br>';
Object.entries(freq).forEach(([k,v]) => {
  out.innerHTML += \`<div class="info">'\${k}' appears \${v} time\${v>1?'s':''}</div>\`;
});`,
                solutionCode: `function frequencyCount(arr) {
  const map = {};
  for (const el of arr) map[el] = (map[el] || 0) + 1;
  return map;
}
function mostFrequent(arr) {
  const freq = frequencyCount(arr);
  let best = null, bestCount = 0;
  for (const [key, count] of Object.entries(freq)) {
    if (count > bestCount) { bestCount = count; best = key; }
  }
  return best;
}
const out=document.getElementById('out');
function test(label,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}</div>\`;}
const freq=frequencyCount(['a','b','a','c','b','a']);
test('freq["a"]',freq['a'],3);test('freq["b"]',freq['b'],2);test('freq["c"]',freq['c'],1);
test('mostFrequent',mostFrequent(['a','b','a','c','b','a']),'a');
test('mostFrequent [1,1,2,3,3,3]',mostFrequent([1,1,2,3,3,3]),3);`,
                outputHeight: 180,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Two-Sum: O(n) with a Map

Find indices of two numbers that add up to \`target\`. Return \`[i, j]\`.

**The O(n) insight:** for each number at index \`i\`, you need \`target - nums[i]\` (the complement). Check if the complement is already in the map. If yes — done. If no — store \`nums[i] → i\` in the map and move on.

**Implement \`twoSum(nums, target)\`:**
\`\`\`
const seen = {};
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (complement in seen) return [seen[complement], i];
  seen[nums[i]] = i;
}
\`\`\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function twoSum(nums, target) {
  const seen = {};  // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    // TODO: if complement is already in seen, return [seen[complement], i]

    // TODO: store nums[i] → i in seen

  }

  return null;  // no solution
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

test('twoSum([2,7,11,15], 9)',  twoSum([2,7,11,15], 9),  [0,1]);
test('twoSum([3,2,4], 6)',      twoSum([3,2,4], 6),      [1,2]);
test('twoSum([3,3], 6)',        twoSum([3,3], 6),        [0,1]);
test('twoSum([1,2,3,4], 7)',    twoSum([1,2,3,4], 7),    [2,3]);
test('twoSum([1,2,3], 10)',     twoSum([1,2,3], 10),     null);`,
                solutionCode: `function twoSum(nums, target) {
  const seen = {};
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (comp in seen) return [seen[comp], i];
    seen[nums[i]] = i;
  }
  return null;
}
const out=document.getElementById('out');
function test(label,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}</div>\`;}
test('twoSum([2,7,11,15],9)',twoSum([2,7,11,15],9),[0,1]);
test('twoSum([3,2,4],6)',twoSum([3,2,4],6),[1,2]);
test('twoSum([3,3],6)',twoSum([3,3],6),[0,1]);
test('twoSum([1,2,3],10)',twoSum([1,2,3],10),null);`,
                outputHeight: 150,
              },
              {
                type: 'js',
                instruction: `## Step 3 — Group Anagrams

Group an array of strings by which strings are anagrams of each other. "eat", "tea", "tan", "ate", "nat", "bat" → \`[["eat","tea","ate"],["tan","nat"],["bat"]]\`.

**The key insight:** all anagrams of a word produce the same string when sorted. \`"eat".split('').sort().join('') === "tea".split('').sort().join('')\` → both become \`"aet"\`.

Use the sorted string as the map key. Map it to an array of all words that produce that sorted form.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.group{color:#a5b4fc;font-size:11px;margin:1px 0}`,
                startCode: `function groupAnagrams(words) {
  const map = {};  // sorted_key → [words]

  for (const word of words) {
    // TODO: compute the sorted key for this word
    // const key = word.split('').sort().join('');

    // TODO: if key not in map, create an empty array there
    // if (!map[key]) map[key] = [];

    // TODO: push word into map[key]

  }

  return Object.values(map);
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');

const input = ['eat','tea','tan','ate','nat','bat'];
const groups = groupAnagrams(input);

// Sort for stable comparison
const sorted = groups.map(g => [...g].sort()).sort((a,b) => a[0].localeCompare(b[0]));
const expected = [['ate','eat','tea'],['bat'],['nat','tan']];
const pass = JSON.stringify(sorted) === JSON.stringify(expected);
out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} groupAnagrams: \${groups.length} groups</div>\`;

if (groups.length > 0) {
  out.innerHTML += '<br>';
  sorted.forEach(g => { out.innerHTML += \`<div class="group">[\${g.join(', ')}]</div>\`; });
}`,
                solutionCode: `function groupAnagrams(words) {
  const map = {};
  for (const word of words) {
    const key = word.split('').sort().join('');
    if (!map[key]) map[key] = [];
    map[key].push(word);
  }
  return Object.values(map);
}
const out=document.getElementById('out');
const input=['eat','tea','tan','ate','nat','bat'];
const groups=groupAnagrams(input);
const sorted=groups.map(g=>[...g].sort()).sort((a,b)=>a[0].localeCompare(b[0]));
const expected=[['ate','eat','tea'],['bat'],['nat','tan']];
const pass=JSON.stringify(sorted)===JSON.stringify(expected);
out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} groupAnagrams: \${groups.length} groups</div>\`;
sorted.forEach(g=>{out.innerHTML+=\`<div style="color:#a5b4fc;font-size:11px">[\${g.join(', ')}]</div>\`;});`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Challenge — All Four From Scratch

Empty function signatures. Write all four from memory:

- **\`frequencyCount(arr)\`** — map of element → count
- **\`mostFrequent(arr)\`** — element with highest count
- **\`twoSum(nums, target)\`** — [i, j] where nums[i]+nums[j]===target, O(n)
- **\`groupAnagrams(words)\`** — group by sorted-string key`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}
.section{color:#64748b;font-size:11px;margin-top:10px;border-top:1px solid #1e293b;padding-top:6px}
.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}
.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}
.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `function frequencyCount(arr) {
  // element → count
}

function mostFrequent(arr) {
  // element with highest count
}

function twoSum(nums, target) {
  // O(n) — map of complement → index
}

function groupAnagrams(words) {
  // sorted string → [words]
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
const results = [];
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}
function testGroups(label, got, expectedLen) {
  const pass = Array.isArray(got) && got.length === expectedLen;
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got?.length} groups\${pass?'':' (expected '+expectedLen+')'}</div>\`;
}

try {
  out.innerHTML += '<div class="section">frequencyCount</div>';
  const f = frequencyCount(['a','b','a','c','b','a']);
  test('freq["a"]', f['a'], 3);
  test('freq["b"]', f['b'], 2);
  test('freq["c"]', f['c'], 1);

  out.innerHTML += '<div class="section">mostFrequent</div>';
  test('[a,b,a,c,b,a]', mostFrequent(['a','b','a','c','b','a']), 'a');
  test('[1,1,2,3,3,3]', mostFrequent([1,1,2,3,3,3]), 3);

  out.innerHTML += '<div class="section">twoSum</div>';
  test('[2,7,11,15] t=9', twoSum([2,7,11,15], 9), [0,1]);
  test('[3,2,4] t=6',     twoSum([3,2,4], 6),     [1,2]);
  test('[3,3] t=6',       twoSum([3,3], 6),       [0,1]);
  test('no solution',     twoSum([1,2,3], 10),    null);

  out.innerHTML += '<div class="section">groupAnagrams</div>';
  testGroups('["eat","tea","tan","ate","nat","bat"]', groupAnagrams(['eat','tea','tan','ate','nat','bat']), 3);
  testGroups('["abc","bca","xyz"]', groupAnagrams(['abc','bca','xyz']), 2);

  const all = results.every(Boolean);
  out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all
    ? '✓ All tests pass. Four hash map patterns — from scratch.'
    : results.filter(Boolean).length + '/' + results.length + ' passing.'
  }</div>\`;
} catch(e) {
  out.innerHTML += '<div class="fail">Error: ' + e.message + '</div>';
}`,
                solutionCode: `function frequencyCount(arr){const m={};for(const el of arr)m[el]=(m[el]||0)+1;return m;}
function mostFrequent(arr){const f=frequencyCount(arr);let best=null,bc=0;for(const[k,c]of Object.entries(f)){if(c>bc){bc=c;best=isNaN(k)?k:Number(k)||k;}}return best;}
function twoSum(nums,target){const seen={};for(let i=0;i<nums.length;i++){const c=target-nums[i];if(c in seen)return[seen[c],i];seen[nums[i]]=i;}return null;}
function groupAnagrams(words){const m={};for(const w of words){const k=w.split('').sort().join('');if(!m[k])m[k]=[];m[k].push(w);}return Object.values(m);}
const out=document.getElementById('out');const results=[];
function test(l,g,e){const pass=JSON.stringify(g)===JSON.stringify(e);results.push(pass);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
function testGroups(l,g,n){const pass=Array.isArray(g)&&g.length===n;results.push(pass);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${l}: \${g?.length} groups</div>\`;}
const f=frequencyCount(['a','b','a','c','b','a']);test('freq a',f['a'],3);test('freq b',f['b'],2);
test('mostFrequent',mostFrequent(['a','b','a','c','b','a']),'a');
test('twoSum [2,7,11,15] t=9',twoSum([2,7,11,15],9),[0,1]);test('twoSum [3,2,4] t=6',twoSum([3,2,4],6),[1,2]);test('no solution',twoSum([1,2,3],10),null);
testGroups('groupAnagrams 3 groups',groupAnagrams(['eat','tea','tan','ate','nat','bat']),3);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 340,
              },
            ],
          },
        },
      },

      // ── Python guided walkthrough ─────────────────────────────────────────────
      {
        id: 'PythonNotebook',
        title: 'Four Hash Map Patterns in Python',
        caption: 'Same four patterns in Python. Use dict and Counter, visualize with opencalc.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — Frequency count and most frequent element',
              prose: [
                'Python\'s `dict.get(key, default)` is perfect for frequency counting: `freq[el] = freq.get(el, 0) + 1`.',
                'After implementing manually, the cell shows you `collections.Counter` — Python\'s built-in frequency counter. You\'re learning both the pattern and the shortcut.',
              ],
              instructions: `Implement frequency_count() and most_frequent() manually. Then compare to Counter.`,
              code: `from collections import Counter
from opencalc import Figure, BLUE, AMBER, GREEN

def frequency_count(arr):
    freq = {}
    # TODO: for each element, increment freq[el]
    # freq[el] = freq.get(el, 0) + 1
    return freq


def most_frequent(arr):
    freq = frequency_count(arr)
    best, best_count = None, 0
    # TODO: iterate freq.items(), find key with max value
    return best


# ── Tests ──────────────────────────────────────────────
data = ['a', 'b', 'a', 'c', 'b', 'a']
freq = frequency_count(data)

assert freq['a'] == 3, f"freq['a'] = {freq.get('a')}"
assert freq['b'] == 2, f"freq['b'] = {freq.get('b')}"
assert freq['c'] == 1, f"freq['c'] = {freq.get('c')}"
print("✓ frequency_count")

assert most_frequent(data) == 'a', f"got {most_frequent(data)}"
assert most_frequent([1,1,2,3,3,3]) == 3
print("✓ most_frequent")

# Show Counter comparison
print(f"\nYour result: {freq}")
print(f"Counter:     {dict(Counter(data))}")

# Visualize
words = ['apple','banana','apple','cherry','banana','apple','date']
freq2 = frequency_count(words)
items = sorted(freq2.items(), key=lambda x: -x[1])

fig = Figure(xmin=0, xmax=len(items)+1, ymin=0, ymax=max(freq2.values())+1,
             width=380, height=160, title='Word frequency')
for i, (word, count) in enumerate(items):
    color = GREEN if count == max(freq2.values()) else BLUE
    fig.bar(i+1, count, width=0.5, color=color, label=word[:5])
print(fig.show())`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — Two-sum O(n)',
              prose: [
                'For each element, you need `target - element` (the complement). Check if it\'s already in the dict. If yes, you\'ve found the pair. If no, store the current element.',
                'One pass. O(n). No nested loop.',
              ],
              instructions: `Implement two_sum(nums, target). Return the pair of values (not indices, in Python convention here). All assertions must pass.`,
              code: `def two_sum(nums, target):
    """Return [i, j] where nums[i] + nums[j] == target. O(n)."""
    seen = {}  # value → index

    for i, n in enumerate(nums):
        complement = target - n

        # TODO: if complement is in seen, return [seen[complement], i]

        # TODO: store seen[n] = i

    return None


# ── Tests ──────────────────────────────────────────────
assert two_sum([2, 7, 11, 15], 9)  == [0, 1], f"got {two_sum([2,7,11,15],9)}"
assert two_sum([3, 2, 4], 6)       == [1, 2], f"got {two_sum([3,2,4],6)}"
assert two_sum([3, 3], 6)          == [0, 1], f"got {two_sum([3,3],6)}"
assert two_sum([1, 2, 3], 10)      is None,   f"got {two_sum([1,2,3],10)}"
print("✓ two_sum: all pass")

# Show it working
nums = [2, 7, 11, 15, 3, 6]
for t in [9, 14, 18]:
    result = two_sum(nums, t)
    if result:
        i, j = result
        print(f"two_sum({nums}, {t}) → [{i},{j}] = {nums[i]}+{nums[j]}")
    else:
        print(f"two_sum({nums}, {t}) → no solution")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Step 3 — Group anagrams + full scratch challenge',
              prose: [
                'Group by the sorted key — `"".join(sorted(word))` is the Python idiom.',
                'The from-scratch challenge has you implement all four patterns, then draws an opencalc visualization of the anagram groups.',
              ],
              instructions: `Implement group_anagrams(). Then in the scratch section below, implement all four functions from memory.`,
              code: `from opencalc import Figure, BLUE, GREEN, AMBER, PURPLE, RED

def group_anagrams(words):
    groups = {}
    for word in words:
        # TODO: compute sorted key — ''.join(sorted(word))

        # TODO: if key not in groups, set groups[key] = []

        # TODO: append word to groups[key]

    return list(groups.values())


# ── Test ───────────────────────────────────────────────
result = group_anagrams(['eat','tea','tan','ate','nat','bat'])
assert len(result) == 3, f"expected 3 groups, got {len(result)}"
print(f"✓ group_anagrams: {len(result)} groups")
for g in sorted(result, key=lambda x: x[0]):
    print(f"  {sorted(g)}")

# ─────────────────────────────────────────────────────
# SCRATCH — all four from memory below this line
# ─────────────────────────────────────────────────────

def frequency_count(arr):
    pass

def most_frequent(arr):
    pass

def two_sum(nums, target):
    pass

def group_anagrams_scratch(words):
    pass


# ── Assertions ─────────────────────────────────────────
freq = frequency_count(['a','b','a','c','b','a'])
assert freq == {'a':3,'b':2,'c':1}, f"freq: {freq}"
print("✓ frequency_count")

assert most_frequent(['a','b','a','c','b','a']) == 'a'
assert most_frequent([1,1,2,3,3,3]) == 3
print("✓ most_frequent")

assert two_sum([2,7,11,15], 9)  == [0,1]
assert two_sum([3,2,4],    6)   == [1,2]
assert two_sum([1,2,3],    10)  is None
print("✓ two_sum")

ga = group_anagrams_scratch(['eat','tea','tan','ate','nat','bat'])
assert len(ga) == 3
print("✓ group_anagrams_scratch")

print()
print("All assertions passed. Drawing anagram groups:")

# ── Visualize groups ───────────────────────────────────
ga_sorted = sorted(ga, key=lambda g: -len(g))
colors = [GREEN, BLUE, AMBER, PURPLE, RED]
fig = Figure(xmin=0, xmax=len(ga_sorted)*3+1, ymin=0, ymax=len(max(ga_sorted,key=len))+1,
             width=380, height=160,
             title='Anagram groups')
for gi, group in enumerate(ga_sorted):
    for wi, word in enumerate(sorted(group)):
        fig.point((gi*3+1.5, wi+0.5), color=colors[gi % len(colors)],
                  label=word, radius=20)
print(fig.show())`,
              output: '', status: 'idle', figureJson: null,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      'All four patterns are O(n) time:\n- frequencyCount: one pass, O(1) per insert\n- twoSum: one pass, O(1) complement lookup\n- groupAnagrams: one pass, O(k log k) per word for sort (k = word length)\n- deduplication: one pass, O(1) set lookup',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'These four patterns cover ~40% of hash map interview questions',
        body: 'Frequency count, two-sum, group-by-key, and seen-set are the foundation of almost every hash map problem. Master these four and you can recognize and solve most hash map variants on sight.',
      },
    ],
    visualizations: [],
  },

  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],

  challenges: [
    {
      id: 'dsa3-002-c1',
      title: 'Longest Consecutive Sequence',
      difficulty: 'hard',
      description: 'Given an unsorted array of integers, find the length of the longest consecutive elements sequence. O(n) required — no sorting.',
      starterCode: `def longest_consecutive(nums):
    """
    Strategy: put all nums in a set for O(1) lookup.
    For each num, only start counting if num-1 is NOT in the set
    (it's the start of a new sequence). Count up from there.
    O(n) total — each element is visited at most twice.
    """
    num_set = set(nums)
    best = 0

    for n in num_set:
        # TODO: only start a sequence if n-1 is not in num_set
        #   length = 1
        #   while n + length in num_set: length += 1
        #   best = max(best, length)
        pass

    return best

print(longest_consecutive([100,4,200,1,3,2]))   # 4  (1,2,3,4)
print(longest_consecutive([0,3,7,2,5,8,4,6,0,1])) # 9`,
      solution: `def longest_consecutive(nums):
    num_set = set(nums)
    best = 0
    for n in num_set:
        if n - 1 not in num_set:
            length = 1
            while n + length in num_set:
                length += 1
            best = max(best, length)
    return best`,
      hint: 'The key: only start counting from the beginning of a sequence (where n-1 is not in the set). This ensures each number is the start of exactly one counting run, giving O(n) total.',
    },
  ],
};
