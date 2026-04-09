export default {
  id: 'dsa1-004',
  slug: 'strings',
  chapter: 'dsa1',
  order: 4,
  title: 'Strings',
  subtitle: 'Strings are arrays of characters — and every string algorithm is really an array algorithm in disguise. Master the two-pointer technique, sliding windows, and the hidden cost of string concatenation.',
  tags: ['string', 'two-pointer', 'sliding window', 'palindrome', 'anagram', 'immutable', 'character frequency', 'substring'],
  aliases: 'string character array two pointer sliding window palindrome anagram substring reverse',

  hook: {
    question: 'What does reversing a string, detecting a palindrome, finding an anagram, and finding the longest substring without repeating characters all have in common?',
    realWorldContext: 'String algorithms are everywhere: search engines parse and index text, DNA sequencing compares genetic strings, compilers tokenize source code strings, databases use string matching for LIKE queries. Every web form validates a string. Every URL is parsed as a string. Knowing how strings work at the character level — not just calling library methods — is what separates engineers who understand their tools from engineers who just use them.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You\'ve built arrays, linked lists, stacks, and queues. A string is just an array of characters — but with two important properties that change how you work with it: **indexability** (you can access any character by index in O(1), just like an array) and **immutability** (in most languages, you can\'t change a character in place — you must build a new string).',
      '**Immutability and the concatenation trap.** In Python and JavaScript, `str + str` creates a brand new string every time. If you concatenate inside a loop — `result = result + char` — you do O(n) work per step, giving O(n²) total. The fix: collect characters into a list and join once at the end (Python: `"".join(parts)`, JS: `parts.join("")`).',
      '**The Two-Pointer Technique.** Place one pointer at the start and one at the end. Move them toward each other. This eliminates the need for nested loops in many string problems. Palindrome check, reversing a string, and checking if two strings can be made equal all use two pointers in O(n) instead of O(n²).',
      '**The Sliding Window.** For problems about substrings — "longest substring with at most k distinct characters," "smallest window containing all characters" — use a window defined by two pointers that expand right and shrink left. The window slides across the string in O(n), avoiding O(n²) brute-force approaches.',
      '**Character frequency with a hash map.** Anagram detection, character counting, and frequency-based problems all use a dictionary to count occurrences. Counting all characters is O(n). Comparing two frequency maps is O(1) if the alphabet is fixed (26 letters).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of Linear Structures',
        body: '**Previous:** Stacks & Queues — constrained access patterns.\n**This lesson:** Strings — indexable, immutable, and the home of two-pointer and sliding window patterns.\n**Next:** Chapter 2 — Recursion & State.',
      },
      {
        type: 'warning',
        title: 'Never concatenate strings in a loop',
        body: '`result += char` inside a loop = O(n²). Use a list and join at the end. This is one of the most common performance bugs in Python and JavaScript — and it\'s invisible until you hit large inputs.',
      },
      {
        type: 'insight',
        title: 'Two pointers = cutting nested loops',
        body: 'Whenever you find yourself wanting to write `for i... for j...` over a string, ask: can two pointers solve this? A two-pointer scan is O(n) and often replaces an O(n²) brute force.',
      },
      {
        type: 'strategy',
        title: 'Pattern map for string problems',
        body: 'Reverse / palindrome → two pointers\nAnagram / frequency → hash map (Counter/dict)\nLongest unique substring → sliding window\nSubstring search → built-in (or KMP for interviews)',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Two Pointers & Sliding Window in Action',
        mathBridge: 'Watch the pointers move. Notice that two pointers never go backwards — so the total number of steps is O(n), not O(n²). The sliding window expands right and contracts left, always maintaining a valid window.',
        caption: 'Two algorithms, both O(n), both built on the same idea: control two indices deliberately instead of nesting loops.',
        props: {
          lesson: {
            title: 'String Techniques: Two Pointers & Sliding Window',
            subtitle: 'See the patterns before you code them.',
            sequential: false,
            cells: [
              {
                type: 'js',
                title: 'Two Pointers: Palindrome Check',
                instruction: 'Watch left and right pointers move inward. At each step, the characters at both pointers must match. If they ever don\'t — not a palindrome. If they meet in the middle without mismatch — palindrome.\n\nType any word and click **Check** to trace the two-pointer walk.',
                html: `<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center">
  <input id="word" type="text" value="racecar" maxlength="18" style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:14px;width:160px">
  <button id="btn-check" style="padding:7px 18px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Check</button>
  <button id="btn-step" style="padding:7px 14px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer">Step</button>
</div>
<div id="chars" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;min-height:52px"></div>
<div id="info" style="font-family:monospace;font-size:12px;color:#94a3b8;min-height:36px"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.ch{display:flex;flex-direction:column;align-items:center;gap:2px}
.box{width:36px;height:36px;border:2px solid #334155;border-radius:5px;background:#1e293b;color:#94a3b8;font-weight:bold;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .2s}
.box.left{border-color:#6366f1;background:#1e1b4b;color:#a5b4fc}
.box.right{border-color:#2dd4bf;background:#042f2e;color:#2dd4bf}
.box.both{border-color:#f59e0b;background:#1c1007;color:#f59e0b}
.box.match{border-color:#4ade80;background:#052e16;color:#4ade80}
.box.mismatch{border-color:#f87171;background:#450a0a;color:#f87171}
.label{font-size:9px;color:#475569;height:12px}`,
                startCode: `let word = '', L = 0, R = 0, steps = [], stepIdx = 0, done = false;

function buildSteps(w) {
  const s = [];
  let l = 0, r = w.length - 1;
  while (l <= r) {
    const match = w[l] === w[r];
    s.push({ l, r, match, ch: [w[l], w[r]] });
    if (!match) break;
    l++; r--;
  }
  return s;
}

function render(state) {
  const chars = document.getElementById('chars');
  const info  = document.getElementById('info');
  chars.innerHTML = '';
  for (let i = 0; i < word.length; i++) {
    const isL = i === state.l, isR = i === state.r;
    const cls = state.done
      ? (state.isPalin ? 'match' : (i === state.l || i === state.r ? 'mismatch' : ''))
      : (isL && isR ? 'both' : isL ? 'left' : isR ? 'right' : '');
    const wrap = document.createElement('div'); wrap.className = 'ch';
    const box  = document.createElement('div'); box.className = 'box ' + cls;
    box.textContent = word[i];
    const lbl  = document.createElement('div'); lbl.className = 'label';
    lbl.textContent = isL && isR ? 'L=R' : isL ? 'L' : isR ? 'R' : '';
    wrap.appendChild(box); wrap.appendChild(lbl);
    chars.appendChild(wrap);
  }
  if (state.done) {
    info.style.color = state.isPalin ? '#4ade80' : '#f87171';
    info.textContent = state.isPalin ? \`"\${word}" is a palindrome ✓\` : \`"\${word}" is NOT a palindrome — mismatch at L[\${state.l}]='\${word[state.l]}' vs R[\${state.r}]='\${word[state.r]}'\`;
  } else {
    info.style.color = state.match ? '#4ade80' : '#f87171';
    info.textContent = \`L[\${state.l}]='\${word[state.l]}' vs R[\${state.r}]='\${word[state.r]}' → \${state.match ? 'match ✓ — move inward' : 'MISMATCH — not a palindrome'}\`;
  }
}

function init() {
  word = document.getElementById('word').value.replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
  steps = buildSteps(word);
  stepIdx = 0; done = false;
  if (steps.length === 0) return;
  render({ ...steps[0], done: false });
}

document.getElementById('btn-check').addEventListener('click', () => {
  init();
  // Auto-play
  let i = 0;
  const t = setInterval(() => {
    if (i >= steps.length) {
      const last = steps[steps.length - 1];
      render({ ...last, done: true, isPalin: last.match && steps.every(s => s.match) });
      clearInterval(t); return;
    }
    render({ ...steps[i], done: false });
    i++;
  }, 600);
});

document.getElementById('btn-step').addEventListener('click', () => {
  if (!word || steps.length === 0) { init(); return; }
  if (stepIdx < steps.length) {
    render({ ...steps[stepIdx], done: false });
    stepIdx++;
  } else {
    const last = steps[steps.length-1];
    render({ ...last, done: true, isPalin: steps.every(s => s.match) });
  }
});

init();`,
                outputHeight: 200,
              },
              {
                type: 'js',
                title: 'Sliding Window: Longest Substring Without Repeating Characters',
                instruction: 'The window (blue to teal) expands right on each step. When a duplicate character enters the window, the left pointer advances past the previous occurrence — shrinking the window to remove the duplicate.\n\nClick **Step** to walk through character by character.',
                html: `<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
  <input id="str" type="text" value="abcabcbb" maxlength="16" style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:14px;width:150px">
  <button id="btn-play" style="padding:7px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Play</button>
  <button id="btn-step" style="padding:7px 14px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer">Step</button>
  <button id="btn-rst" style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
</div>
<div id="chars" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;min-height:52px"></div>
<div id="info" style="font-family:monospace;font-size:11px;color:#94a3b8;min-height:44px"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.ch{display:flex;flex-direction:column;align-items:center;gap:2px}
.box{width:34px;height:34px;border:2px solid #334155;border-radius:5px;background:#1e293b;color:#475569;font-weight:bold;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .25s}
.box.win{border-color:#6366f1;background:#1e1b4b;color:#a5b4fc}
.box.right{border-color:#2dd4bf;background:#042f2e;color:#2dd4bf}
.box.left{border-color:#f59e0b;background:#1c1007;color:#f59e0b}
.box.best{border-color:#4ade80;background:#052e16;color:#4ade80}
.label{font-size:9px;color:#475569;height:12px}`,
                startCode: `let s='',steps=[],idx=0,playing=false;

function buildSteps(str) {
  const res = [];
  let l = 0, best = 0, bestL = 0, bestR = -1;
  const seen = new Map();
  for (let r = 0; r < str.length; r++) {
    const ch = str[r];
    if (seen.has(ch) && seen.get(ch) >= l) {
      l = seen.get(ch) + 1;
    }
    seen.set(ch, r);
    const len = r - l + 1;
    if (len > best) { best = len; bestL = l; bestR = r; }
    res.push({ l, r, best, bestL, bestR, ch, seen: new Map(seen) });
  }
  return res;
}

function render(step, final=false) {
  const chars = document.getElementById('chars');
  const info  = document.getElementById('info');
  chars.innerHTML = '';
  for (let i = 0; i < s.length; i++) {
    const inWin = i >= step.l && i <= step.r;
    const isL = i === step.l, isR = i === step.r;
    const cls = isR && inWin ? 'right' : isL && inWin ? 'left' : inWin ? 'win' : '';
    const wrap = document.createElement('div'); wrap.className = 'ch';
    const box  = document.createElement('div'); box.className = 'box ' + cls;
    box.textContent = s[i];
    const lbl  = document.createElement('div'); lbl.className = 'label';
    lbl.textContent = isL && isR ? 'L=R' : isL ? 'L' : isR ? 'R' : '';
    wrap.appendChild(box); wrap.appendChild(lbl); chars.appendChild(wrap);
  }
  const win = s.slice(step.l, step.r+1);
  info.innerHTML = \`window: "\${win}" (len \${step.r-step.l+1}) | best so far: "\${s.slice(step.bestL,step.bestR+1)}" (len \${step.best})\${final?'<br><span style="color:#4ade80">✓ Longest = "'+s.slice(step.bestL,step.bestR+1)+'" len='+step.best+'</span>':''}\`;
}

function init() {
  s = document.getElementById('str').value;
  steps = buildSteps(s);
  idx = 0;
  if (steps.length) render(steps[0]);
}

document.getElementById('btn-step').addEventListener('click', () => {
  if (!s || !steps.length) { init(); return; }
  if (idx < steps.length) { render(steps[idx], idx === steps.length-1); idx++; }
});

document.getElementById('btn-play').addEventListener('click', () => {
  init();
  let i = 0;
  const t = setInterval(() => {
    if (i >= steps.length) { clearInterval(t); return; }
    render(steps[i], i === steps.length-1); i++;
  }, 400);
});

document.getElementById('btn-rst').addEventListener('click', init);
init();`,
                outputHeight: 210,
              },
            ],
          },
        },
      },

      // ── JavaScript guided walkthrough ─────────────────────────────────────────
      {
        id: 'JSNotebook',
        title: 'Build String Algorithms in JavaScript',
        caption: 'Implement each technique step by step, then write all three from scratch.',
        props: {
          lesson: {
            title: 'String Algorithms in JavaScript',
            subtitle: 'Two pointers, sliding window — typed by you.',
            cells: [
              // ── JS Cell 1: Reverse a string (two pointers) ────────────────────
              {
                type: 'js',
                instruction: `## Step 1 — Reverse a String with Two Pointers

Reversing a string is the simplest two-pointer problem — and it teaches the pattern for everything else.

**Why not just \`s.split("").reverse().join("")\`?** That works, but you won't understand *why* it works or how to apply the same thinking to harder problems. Build it manually.

**The algorithm:**
1. Split the string into an array of characters: \`const arr = s.split('')\`
2. Set \`left = 0\`, \`right = arr.length - 1\`
3. While \`left < right\`: swap \`arr[left]\` and \`arr[right]\`, then move both inward
4. Join back: \`return arr.join('')\`

The swap without a temp variable: \`[arr[left], arr[right]] = [arr[right], arr[left]]\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.info{color:#94a3b8;margin:2px 0}`,
                startCode: `function reverseString(s) {
  const arr = s.split('');
  let left  = 0;
  let right = arr.length - 1;

  while (left < right) {
    // TODO: swap arr[left] and arr[right]
    // Hint: [arr[left], arr[right]] = [arr[right], arr[left]]

    // TODO: move both pointers inward

  }

  return arr.join('');
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: got "\${got}"\${pass?'':' — expected "'+expected+'"'}</div>\`;
}

test('reverseString("hello")',   reverseString('hello'),   'olleh');
test('reverseString("racecar")', reverseString('racecar'), 'racecar');
test('reverseString("ab")',      reverseString('ab'),      'ba');
test('reverseString("a")',       reverseString('a'),       'a');
test('reverseString("")',        reverseString(''),        '');`,
                solutionCode: `function reverseString(s) {
  const arr = s.split('');
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++; right--;
  }
  return arr.join('');
}
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: "\${got}"</div>\`;
}
test('reverseString("hello")',   reverseString('hello'),   'olleh');
test('reverseString("racecar")', reverseString('racecar'), 'racecar');
test('reverseString("ab")',      reverseString('ab'),      'ba');`,
                outputHeight: 140,
              },

              // ── JS Cell 2: isPalindrome ───────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 2 — isPalindrome with Two Pointers

A palindrome reads the same forwards and backwards. Two pointers check both ends simultaneously — the moment they mismatch, you know it's not a palindrome. If they meet in the middle without a mismatch, it is.

**Implement \`isPalindrome(s)\`:**
1. \`left = 0\`, \`right = s.length - 1\`
2. While \`left < right\`:
   - If \`s[left] !== s[right]\`, **return false**
   - Move both pointers inward
3. **Return true** — met in the middle with no mismatch

This is O(n) time, O(1) space — no array copy needed because you access string characters by index.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function isPalindrome(s) {
  let left  = 0;
  let right = s.length - 1;

  while (left < right) {
    // TODO: if characters don't match, return false

    // TODO: move both pointers inward

  }

  // TODO: return true (no mismatch found)
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}\${pass?'':' (expected '+expected+')'}</div>\`;
}

test('isPalindrome("racecar")', isPalindrome('racecar'), true);
test('isPalindrome("hello")',   isPalindrome('hello'),   false);
test('isPalindrome("a")',       isPalindrome('a'),       true);
test('isPalindrome("aba")',     isPalindrome('aba'),     true);
test('isPalindrome("abba")',    isPalindrome('abba'),    true);
test('isPalindrome("abc")',     isPalindrome('abc'),     false);`,
                solutionCode: `function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++; right--;
  }
  return true;
}
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}</div>\`;
}
test('isPalindrome("racecar")', isPalindrome('racecar'), true);
test('isPalindrome("hello")',   isPalindrome('hello'),   false);
test('isPalindrome("abba")',    isPalindrome('abba'),    true);`,
                outputHeight: 160,
              },

              // ── JS Cell 3: isAnagram ──────────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 3 — isAnagram with a Frequency Map

Two strings are anagrams if they contain the same characters with the same counts. "listen" and "silent" are anagrams. "hello" and "world" are not.

**The algorithm:**
1. If lengths differ, return false immediately
2. Build a frequency map for string \`a\`: increment count for each character
3. Walk string \`b\`: decrement count for each character
4. If any count goes below 0, return false (b has a char that a doesn't)
5. Return true

One map, two passes, O(n) total.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function isAnagram(a, b) {
  // TODO: if lengths differ, return false immediately

  const freq = {};

  // TODO: build frequency map from string a
  // for each char in a: freq[char] = (freq[char] || 0) + 1

  // TODO: walk string b, decrement counts
  // for each char in b:
  //   freq[char] = (freq[char] || 0) - 1
  //   if freq[char] < 0, return false (too many of this char)

  return true;
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}\${pass?'':' (expected '+expected+')'}</div>\`;
}

test('isAnagram("listen","silent")', isAnagram('listen','silent'), true);
test('isAnagram("hello","world")',   isAnagram('hello','world'),   false);
test('isAnagram("anagram","nagaram")',isAnagram('anagram','nagaram'),true);
test('isAnagram("rat","car")',       isAnagram('rat','car'),       false);
test('isAnagram("ab","a")',          isAnagram('ab','a'),          false);`,
                solutionCode: `function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const freq = {};
  for (const ch of a) freq[ch] = (freq[ch] || 0) + 1;
  for (const ch of b) {
    freq[ch] = (freq[ch] || 0) - 1;
    if (freq[ch] < 0) return false;
  }
  return true;
}
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}</div>\`;
}
test('isAnagram("listen","silent")', isAnagram('listen','silent'), true);
test('isAnagram("hello","world")',   isAnagram('hello','world'),   false);
test('isAnagram("rat","car")',       isAnagram('rat','car'),       false);`,
                outputHeight: 140,
              },

              // ── JS Cell 4: Sliding window ─────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 4 — Sliding Window: Longest Substring Without Repeating Characters

This is a classic sliding window problem. You maintain a window \`[left, right]\` and expand it rightward. When a repeated character enters the window, shrink from the left until the duplicate is gone.

**Implement \`lengthOfLongestSubstring(s)\`:**
1. \`left = 0\`, \`maxLen = 0\`
2. \`seen = new Map()\` — maps character to its **last seen index**
3. For each \`right\` from 0 to s.length-1:
   - If \`seen.has(s[right])\` AND \`seen.get(s[right]) >= left\`:
     - Move \`left = seen.get(s[right]) + 1\` (jump past the duplicate)
   - Update \`seen.set(s[right], right)\`
   - Update \`maxLen = Math.max(maxLen, right - left + 1)\`
4. Return \`maxLen\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function lengthOfLongestSubstring(s) {
  let left   = 0;
  let maxLen = 0;
  const seen = new Map(); // char → last seen index

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];

    // TODO: if ch is in seen AND its last index is inside the window,
    //   move left to seen.get(ch) + 1

    // TODO: update seen with current index

    // TODO: update maxLen

  }

  return maxLen;
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}\${pass?'':' (expected '+expected+')'}</div>\`;
}

test('lengthOfLongestSubstring("abcabcbb")', lengthOfLongestSubstring('abcabcbb'), 3);
test('lengthOfLongestSubstring("bbbbb")',    lengthOfLongestSubstring('bbbbb'),    1);
test('lengthOfLongestSubstring("pwwkew")',   lengthOfLongestSubstring('pwwkew'),   3);
test('lengthOfLongestSubstring("")',         lengthOfLongestSubstring(''),         0);
test('lengthOfLongestSubstring("au")',        lengthOfLongestSubstring('au'),       2);`,
                solutionCode: `function lengthOfLongestSubstring(s) {
  let left = 0, maxLen = 0;
  const seen = new Map();
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (seen.has(ch) && seen.get(ch) >= left) left = seen.get(ch) + 1;
    seen.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}</div>\`;
}
test('lengthOfLongestSubstring("abcabcbb")', lengthOfLongestSubstring('abcabcbb'), 3);
test('lengthOfLongestSubstring("bbbbb")',    lengthOfLongestSubstring('bbbbb'),    1);
test('lengthOfLongestSubstring("pwwkew")',   lengthOfLongestSubstring('pwwkew'),   3);`,
                outputHeight: 140,
              },

              // ── JS Cell 5: From scratch ───────────────────────────────────────
              {
                type: 'js',
                instruction: `## Challenge — All Four From Scratch

Empty function signatures. Write every algorithm from memory.

- \`reverseString(s)\` — two pointers, swap in place
- \`isPalindrome(s)\` — two pointers, check as you go
- \`isAnagram(a, b)\` — frequency map
- \`lengthOfLongestSubstring(s)\` — sliding window with Map`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}
.section{color:#64748b;font-size:11px;margin-top:10px;border-top:1px solid #1e293b;padding-top:6px}
.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}
.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}
.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `function reverseString(s) {
  // two pointers — swap characters inward
}

function isPalindrome(s) {
  // two pointers — return false on first mismatch
}

function isAnagram(a, b) {
  // frequency map — one map, two passes
}

function lengthOfLongestSubstring(s) {
  // sliding window — Map tracks last seen index
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
const results = [];
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

try {
  out.innerHTML += '<div class="section">reverseString</div>';
  test('"hello"',   reverseString('hello'),   'olleh');
  test('"racecar"', reverseString('racecar'), 'racecar');
  test('"ab"',      reverseString('ab'),      'ba');

  out.innerHTML += '<div class="section">isPalindrome</div>';
  test('"racecar"', isPalindrome('racecar'), true);
  test('"hello"',   isPalindrome('hello'),   false);
  test('"abba"',    isPalindrome('abba'),    true);
  test('"abc"',     isPalindrome('abc'),     false);

  out.innerHTML += '<div class="section">isAnagram</div>';
  test('"listen","silent"',  isAnagram('listen','silent'),  true);
  test('"hello","world"',    isAnagram('hello','world'),    false);
  test('"anagram","nagaram"',isAnagram('anagram','nagaram'),true);
  test('"ab","a"',           isAnagram('ab','a'),           false);

  out.innerHTML += '<div class="section">lengthOfLongestSubstring</div>';
  test('"abcabcbb"', lengthOfLongestSubstring('abcabcbb'), 3);
  test('"bbbbb"',    lengthOfLongestSubstring('bbbbb'),    1);
  test('"pwwkew"',   lengthOfLongestSubstring('pwwkew'),   3);
  test('""',         lengthOfLongestSubstring(''),         0);

  const all = results.every(Boolean);
  out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all
    ? '✓ All tests pass. Two pointers, frequency maps, sliding window — from scratch.'
    : results.filter(Boolean).length + '/' + results.length + ' passing.'
  }</div>\`;
} catch(e) {
  out.innerHTML += '<div class="fail">Error: ' + e.message + '</div>';
}`,
                solutionCode: `function reverseString(s) {
  const arr = s.split('');
  let l = 0, r = arr.length - 1;
  while (l < r) { [arr[l], arr[r]] = [arr[r], arr[l]]; l++; r--; }
  return arr.join('');
}
function isPalindrome(s) {
  let l = 0, r = s.length - 1;
  while (l < r) { if (s[l] !== s[r]) return false; l++; r--; }
  return true;
}
function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const freq = {};
  for (const ch of a) freq[ch] = (freq[ch] || 0) + 1;
  for (const ch of b) { freq[ch] = (freq[ch] || 0) - 1; if (freq[ch] < 0) return false; }
  return true;
}
function lengthOfLongestSubstring(s) {
  let l = 0, max = 0; const seen = new Map();
  for (let r = 0; r < s.length; r++) {
    const ch = s[r];
    if (seen.has(ch) && seen.get(ch) >= l) l = seen.get(ch) + 1;
    seen.set(ch, r); max = Math.max(max, r - l + 1);
  }
  return max;
}
const out=document.getElementById('out');const results=[];
function test(label,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);results.push(pass);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}</div>\`;}
out.innerHTML+='<div class="section">reverseString</div>';test('"hello"',reverseString('hello'),'olleh');test('"racecar"',reverseString('racecar'),'racecar');
out.innerHTML+='<div class="section">isPalindrome</div>';test('"racecar"',isPalindrome('racecar'),true);test('"hello"',isPalindrome('hello'),false);test('"abba"',isPalindrome('abba'),true);
out.innerHTML+='<div class="section">isAnagram</div>';test('"listen","silent"',isAnagram('listen','silent'),true);test('"hello","world"',isAnagram('hello','world'),false);
out.innerHTML+='<div class="section">lengthOfLongestSubstring</div>';test('"abcabcbb"',lengthOfLongestSubstring('abcabcbb'),3);test('"bbbbb"',lengthOfLongestSubstring('bbbbb'),1);test('"pwwkew"',lengthOfLongestSubstring('pwwkew'),3);
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
        title: 'Build String Algorithms in Python',
        caption: 'Same algorithms in Python. Build each one, then write all four from scratch.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — reverseString and isPalindrome (two pointers)',
              prose: [
                'Python strings are immutable — you can\'t change a character in place. So: convert to a list, swap, join back.',
                'For isPalindrome, you can read by index directly: `s[left]`. No list conversion needed because you\'re only reading.',
              ],
              instructions: `Implement reverse_string() and is_palindrome(). Both use two pointers. Run to check all test cases.`,
              code: `def reverse_string(s):
    """Reverse s using two pointers. O(n) time, O(n) space (new list)."""
    chars = list(s)
    left, right = 0, len(chars) - 1

    while left < right:
        # TODO: swap chars[left] and chars[right]
        # Python: chars[left], chars[right] = chars[right], chars[left]

        # TODO: move both inward

    return ''.join(chars)


def is_palindrome(s):
    """Two pointers — return False on first mismatch. O(n) time, O(1) space."""
    left, right = 0, len(s) - 1

    while left < right:
        # TODO: if s[left] != s[right], return False
        # TODO: move both inward

    return True


# ── Tests ──────────────────────────────────────────────
assert reverse_string('hello')   == 'olleh',   f"got {reverse_string('hello')}"
assert reverse_string('racecar') == 'racecar', f"got {reverse_string('racecar')}"
assert reverse_string('ab')      == 'ba',      f"got {reverse_string('ab')}"
print("✓ reverse_string: all pass")

assert is_palindrome('racecar') == True
assert is_palindrome('hello')   == False
assert is_palindrome('abba')    == True
assert is_palindrome('abc')     == False
print("✓ is_palindrome: all pass")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — isAnagram with a frequency map',
              prose: [
                'Python\'s `Counter` does this for you — but building it manually teaches you what Counter actually does under the hood.',
                'One dict, two passes: increment on the first string, decrement on the second. If any count drops below zero, the strings aren\'t anagrams.',
              ],
              instructions: `Implement is_anagram() manually using a dict. No Counter allowed here — you're learning the pattern, not the shortcut.`,
              code: `def is_anagram(a, b):
    """Frequency map — one dict, two passes. O(n) time."""
    # TODO: return False if lengths differ

    freq = {}

    # TODO: for each char in a, increment freq[char]
    # freq[char] = freq.get(char, 0) + 1

    # TODO: for each char in b, decrement freq[char]
    # if freq[char] drops below 0, return False

    return True


# ── Tests ──────────────────────────────────────────────
assert is_anagram('listen',  'silent')  == True
assert is_anagram('hello',   'world')   == False
assert is_anagram('anagram', 'nagaram') == True
assert is_anagram('rat',     'car')     == False
assert is_anagram('ab',      'a')       == False
print("✓ is_anagram: all pass")

# Bonus: show the frequency map for 'listen'
freq = {}
for ch in 'listen':
    freq[ch] = freq.get(ch, 0) + 1
print(f"freq('listen') = {freq}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Step 3 — Sliding window: longest substring without repeating characters',
              prose: [
                'The sliding window keeps a window [left, right]. It expands right on each step. When a duplicate enters the window, left jumps past the previous occurrence of that character.',
                'A dict maps each character to its last seen index — this lets you jump left in O(1) instead of crawling.',
              ],
              instructions: `Implement length_of_longest_substring(s). Walk through the algorithm comment by comment. The visualization shows your window on the test string after.`,
              code: `from opencalc import Figure, BLUE, GREEN, AMBER

def length_of_longest_substring(s):
    """Sliding window. O(n) time, O(min(n, alphabet)) space."""
    left   = 0
    max_len = 0
    seen   = {}   # char -> last seen index

    for right in range(len(s)):
        ch = s[right]

        # TODO: if ch in seen AND seen[ch] >= left (it's inside the window):
        #   move left to seen[ch] + 1

        # TODO: update seen[ch] = right

        # TODO: update max_len = max(max_len, right - left + 1)

    return max_len


# ── Tests ──────────────────────────────────────────────
assert length_of_longest_substring('abcabcbb') == 3
assert length_of_longest_substring('bbbbb')    == 1
assert length_of_longest_substring('pwwkew')   == 3
assert length_of_longest_substring('')          == 0
print("✓ length_of_longest_substring: all pass")

# ── Visualize the window on 'abcabcbb' ────────────────
s = 'abcabcbb'
n = len(s)
# Replay to find best window bounds
left = 0; max_len = 0; best_l = 0; best_r = 0; seen = {}
for right in range(n):
    ch = s[right]
    if ch in seen and seen[ch] >= left:
        left = seen[ch] + 1
    seen[ch] = right
    if right - left + 1 > max_len:
        max_len = right - left + 1
        best_l, best_r = left, right

fig = Figure(xmin=0, xmax=n+1, ymin=0, ymax=3,
             width=max(300, n*50), height=100,
             title=f'Best window: "{s[best_l:best_r+1]}" (len={max_len})')
fig.axes(labels=False, ticks=False)
for i, ch in enumerate(s):
    x = i + 0.5
    in_win = best_l <= i <= best_r
    color = GREEN if in_win else BLUE
    fig.point((x+0.5, 1.5), color=color, label=ch, radius=18)
print(fig.show())`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Challenge — All Four From Scratch in Python',
              prose: [
                'No fill-in-the-blank. Write every function from memory.',
                'When all assertions pass, the cell prints a summary and draws an opencalc Figure showing the sliding window result.',
              ],
              instructions: `Implement all four functions. Every assert must pass.`,
              code: `from opencalc import Figure, BLUE, GREEN, AMBER

def reverse_string(s):
    pass

def is_palindrome(s):
    pass

def is_anagram(a, b):
    pass

def length_of_longest_substring(s):
    pass

# ── Assertions ─────────────────────────────────────────
assert reverse_string('hello')   == 'olleh',   "reverse_string failed"
assert reverse_string('racecar') == 'racecar', "reverse_string palindrome failed"
assert reverse_string('ab')      == 'ba',      "reverse_string 2-char failed"
print("✓ reverse_string")

assert is_palindrome('racecar') == True,  "palindrome missed"
assert is_palindrome('hello')   == False, "not palindrome missed"
assert is_palindrome('abba')    == True,  "even palindrome missed"
print("✓ is_palindrome")

assert is_anagram('listen',  'silent')  == True,  "anagram missed"
assert is_anagram('hello',   'world')   == False, "non-anagram missed"
assert is_anagram('anagram', 'nagaram') == True,  "anagram 2 missed"
assert is_anagram('ab',      'a')       == False, "length check missed"
print("✓ is_anagram")

assert length_of_longest_substring('abcabcbb') == 3
assert length_of_longest_substring('bbbbb')    == 1
assert length_of_longest_substring('pwwkew')   == 3
assert length_of_longest_substring('')          == 0
print("✓ length_of_longest_substring")

print()
print("All assertions passed.")

# ── Visualize sliding window ───────────────────────────
s = 'pwwkew'
n = len(s)
left = 0; max_len = 0; best_l = 0; best_r = 0; seen = {}
for right in range(n):
    ch = s[right]
    if ch in seen and seen[ch] >= left:
        left = seen[ch] + 1
    seen[ch] = right
    if right - left + 1 > max_len:
        max_len = right - left + 1
        best_l, best_r = left, right

fig = Figure(xmin=0, xmax=n+1, ymin=0, ymax=3,
             width=max(280, n*52), height=100,
             title=f'Longest unique window in "{s}": "{s[best_l:best_r+1]}" len={max_len}')
fig.axes(labels=False, ticks=False)
for i, ch in enumerate(s):
    x = i + 0.5
    color = GREEN if best_l <= i <= best_r else BLUE
    fig.point((x+0.5, 1.5), color=color, label=ch, radius=18)
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
      'String algorithm complexities:\n- Reverse: O(n) time, O(n) space (new array)\n- isPalindrome (two pointers): O(n) time, O(1) space\n- isAnagram (frequency map): O(n) time, O(1) space (fixed alphabet)\n- Longest substring without repeating: O(n) time, O(min(n, |Σ|)) space where Σ is alphabet size',
      'Concatenation trap: joining strings in a loop with += is O(n²) total. Always collect into a list and join once.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The sliding window is a general pattern',
        body: 'Once you understand the window expand-right / contract-left pattern, you can solve: longest substring with at most k distinct characters, minimum window substring, maximum sum subarray of size k. All are the same idea.',
      },
    ],
    visualizations: [],
  },

  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],

  challenges: [
    {
      id: 'dsa1-004-c1',
      title: 'Valid Palindrome (Alphanumeric Only)',
      difficulty: 'medium',
      description: 'A phrase is a palindrome if, after removing all non-alphanumeric characters and lowercasing, it reads the same forwards and backwards. Implement isPalindrome("A man, a plan, a canal: Panama") → true.',
      starterCode: `def is_palindrome_phrase(s):
    # Step 1: filter to only alphanumeric, lowercase
    cleaned = ''.join(ch.lower() for ch in s if ch.isalnum())
    # Step 2: two-pointer check on cleaned
    left, right = 0, len(cleaned) - 1
    while left < right:
        # TODO
        pass
    return True

print(is_palindrome_phrase("A man, a plan, a canal: Panama"))  # True
print(is_palindrome_phrase("race a car"))                      # False`,
      solution: `def is_palindrome_phrase(s):
    cleaned = ''.join(ch.lower() for ch in s if ch.isalnum())
    left, right = 0, len(cleaned) - 1
    while left < right:
        if cleaned[left] != cleaned[right]: return False
        left += 1; right -= 1
    return True`,
      hint: 'Clean the string first, then apply the exact same two-pointer palindrome check you already built.',
    },
  ],
};
