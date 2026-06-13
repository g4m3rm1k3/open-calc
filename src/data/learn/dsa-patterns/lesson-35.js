// DSA + Design Patterns — Lesson 35
// Rolling Hash + Proxy

export const lesson = {
  id: 'dsa-patterns-35',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '35. Rolling Hash + Proxy',
  checkpoints: [
    { id: 'cp-hash',   label: 'Rolling Hash' },
    { id: 'cp-rabin',  label: 'Rabin-Karp' },
    { id: 'cp-proxy',  label: 'Proxy Pattern' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You need to find every position in a long text where a fixed-length pattern occurs. The naive approach re-examines every character for each position: for a text of length n and a pattern of length m you do O(nm) comparisons — scanning a million-character text for a 1 000-character pattern means a billion operations. There has to be a way to reuse the work from the previous position instead of starting over. The same problem appears in virus scanners, search engines, and plagiarism detectors. The goal is a method that moves the comparison window one step to the right in O(1) each time.',
      code: null,
    },

    // ── Step 1: Polynomial hash ───────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-poly-hash',
      text: 'A polynomial hash maps a string of length m to a number. Each character c at position i contributes charCode(c) * BASE^(m-1-i). Summing all contributions gives the hash. BASE is a prime (often 31 or 101). MOD is a large prime that keeps the number from overflowing (in JavaScript numbers lose integer precision above 2^53). Choosing a prime MOD reduces the probability that two different strings produce the same hash value — a collision. Computing the hash from scratch is O(m) — one multiplication and addition per character.',
      code: `// Polynomial hash — maps a string to a number
const BASE = 31
const MOD  = 1_000_000_007   // large prime keeps hash values manageable

function charCode(c) {
  return c.charCodeAt(0) - 96   // 'a'=1, 'b'=2 … 'z'=26
}

function polynomialHash(str) {
  let hash = 0
  let power = 1
  // Iterate right-to-left so the leftmost character gets the highest power
  for (let i = str.length - 1; i >= 0; i--) {
    hash  = (hash + charCode(str[i]) * power) % MOD
    power = (power * BASE) % MOD
  }
  return hash
}

console.log(polynomialHash('ab'))   // a deterministic number
console.log(polynomialHash('ba'))   // different from 'ab' — order matters
console.log(polynomialHash('ab') === polynomialHash('ab'))   // true — repeatable`,
    },

    // ── Step 2: Rolling window intuition ─────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-rolling-intuition',
      text: 'The key insight: when the window slides one step right, you remove one character from the left and add one character to the right. The hash of the new window can be derived from the old hash without recomputing all m terms. Remove: subtract the leftmost character\'s contribution, which is charCode(leftChar) * BASE^(m-1). Multiply the remaining hash by BASE (this shifts every position up by one). Add: add the charCode of the new rightmost character. Each slide is three arithmetic operations — O(1). The precomputed term BASE^(m-1) mod MOD is called the "highest power" and is computed once before the loop.',
      code: `// Sliding the window — the three steps
// Window "ab" (m=2) slides to "bc":
// hash("ab") = charCode('a')*BASE^1 + charCode('b')*BASE^0
// hash("bc") = charCode('b')*BASE^1 + charCode('c')*BASE^0
//            = (hash("ab") - charCode('a')*BASE^1) * BASE + charCode('c')

const BASE = 31
const MOD  = 1_000_000_007

function charCode(c) { return c.charCodeAt(0) - 96 }

function highestPower(m) {
  // BASE^(m-1) mod MOD — precomputed once, used for every slide
  let p = 1
  for (let i = 0; i < m - 1; i++) p = (p * BASE) % MOD
  return p
}

// Illustrate one manual slide
const text = 'abcde', m = 3
let pow = highestPower(m)   // BASE^2 mod MOD

// Hash of first window "abc"
let h = 0, p = 1
for (let i = m - 1; i >= 0; i--) { h = (h + charCode(text[i]) * p) % MOD; p = (p * BASE) % MOD }
console.log('hash(abc):', h)

// Slide: remove 'a', add 'd'
h = ((h - charCode(text[0]) * pow % MOD + MOD) * BASE + charCode(text[m])) % MOD
console.log('hash(bcd) by slide:', h)

// Verify directly
let h2 = 0, p2 = 1
for (let i = m - 1; i >= 0; i--) { h2 = (h2 + charCode(text[i+1]) * p2) % MOD; p2 = (p2 * BASE) % MOD }
console.log('hash(bcd) direct:', h2)
console.log('match:', h === h2)`,
    },

    // ── Step 3: RollingHash class ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-rolling-class',
      text: 'The RollingHash class encapsulates the window state: the current hash value, the window length, and the precomputed highest power. The slide(remove, add) method performs the O(1) update. The +MOD before the final mod in the subtraction prevents negative numbers — JavaScript\'s % operator can return negative values for negative operands, which would corrupt every subsequent hash.',
      code: `const BASE = 31
const MOD  = 1_000_000_007

function charCode(c) { return c.charCodeAt(0) - 96 }

class RollingHash {
  constructor(windowSize) {
    this.m    = windowSize
    this.hash = 0
    // Precompute BASE^(m-1) mod MOD — used each time the window slides
    this.pow  = 1                                      // ← NEW
    for (let i = 0; i < windowSize - 1; i++) {        // ← NEW
      this.pow = (this.pow * BASE) % MOD               // ← NEW
    }
  }

  // Initialize hash from the first window string
  init(str) {                                          // ← NEW
    this.hash = 0                                      // ← NEW
    let p = 1                                          // ← NEW
    for (let i = str.length - 1; i >= 0; i--) {       // ← NEW
      this.hash = (this.hash + charCode(str[i]) * p) % MOD  // ← NEW
      p = (p * BASE) % MOD                            // ← NEW
    }
    return this.hash                                   // ← NEW
  }

  // Slide the window: remove leftmost char, add new rightmost char
  slide(remove, add) {                                 // ← NEW
    this.hash = (                                      // ← NEW
      (this.hash - charCode(remove) * this.pow % MOD + MOD)  // ← NEW  remove left
      * BASE                                           // ← NEW  shift everything up
      + charCode(add)                                  // ← NEW  add right
    ) % MOD                                            // ← NEW
    return this.hash                                   // ← NEW
  }
}

const rh = new RollingHash(3)
console.log(rh.init('abc'))          // hash of "abc"
console.log(rh.slide('a', 'd'))      // hash of "bcd" in O(1)
console.log(rh.slide('b', 'e'))      // hash of "cde" in O(1)`,
    },

    // ── Step 4: Rabin-Karp search ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-rabin-karp',
      text: 'Rabin-Karp (Michael Rabin and Richard Karp, 1987) uses rolling hash to search for all occurrences of a pattern in a text. Step 1: hash the pattern — O(m). Step 2: hash the first window of the text — O(m). Step 3: slide the window across the text. When the hashes match, verify character by character to rule out a collision — a false positive where two different strings happen to hash to the same number. Average time: O(n + m) because collisions are rare with a good hash. Worst case: O(nm) if every window is a false positive. Multiple patterns can be searched simultaneously by storing all pattern hashes in a Set.',
      code: `const BASE = 31
const MOD  = 1_000_000_007
function charCode(c) { return c.charCodeAt(0) - 96 }

class RollingHash {
  constructor(m) {
    this.m = m; this.hash = 0
    this.pow = 1
    for (let i = 0; i < m - 1; i++) this.pow = (this.pow * BASE) % MOD
  }
  init(str) {
    this.hash = 0; let p = 1
    for (let i = str.length - 1; i >= 0; i--) {
      this.hash = (this.hash + charCode(str[i]) * p) % MOD; p = (p * BASE) % MOD
    }
    return this.hash
  }
  slide(remove, add) {
    this.hash = ((this.hash - charCode(remove) * this.pow % MOD + MOD) * BASE + charCode(add)) % MOD
    return this.hash
  }
}

function rabinKarp(text, pattern) {
  const n = text.length, m = pattern.length
  if (m > n) return []

  const patHash  = new RollingHash(m)            // ← NEW
  const winHash  = new RollingHash(m)            // ← NEW
  const target   = patHash.init(pattern)         // ← NEW  O(m): hash the pattern once
  winHash.init(text.slice(0, m))                 // ← NEW  O(m): hash first window

  const matches = []                             // ← NEW

  for (let i = 0; i <= n - m; i++) {            // ← NEW  slide from 0 to n-m inclusive
    if (winHash.hash === target) {               // ← NEW  hash match — possible hit
      if (text.slice(i, i + m) === pattern) {   // ← NEW  verify to rule out collision
        matches.push(i)                          // ← NEW  confirmed match at index i
      }
    }
    if (i < n - m) {                            // ← NEW  slide the window
      winHash.slide(text[i], text[i + m])       // ← NEW  O(1) per step
    }
  }

  return matches                                 // ← NEW
}

console.log(rabinKarp('ababab', 'ab'))           // [0, 2, 4]
console.log(rabinKarp('aaaa', 'aa'))             // [0, 1, 2]
console.log(rabinKarp('hello world', 'world'))   // [6]
console.log(rabinKarp('abc', 'xyz'))             // []`,
    },

    // ── Challenge 1: slide ────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-slide',
      text: 'Implement the slide(remove, add) method in RollingHash. It must: (1) subtract the contribution of the leftmost character (charCode(remove) * this.pow), (2) multiply the remaining hash by BASE to shift all positions, (3) add charCode(add) for the new rightmost character. All arithmetic mod MOD. Add MOD before the final mod after subtraction to avoid negative results. Test: init("abc") then slide("a","d") should give the same hash as init("bcd"). Log both hashes and whether they match.',
      expectedOutput: null,
      startCode: `const BASE = 31
const MOD  = 1_000_000_007
function charCode(c) { return c.charCodeAt(0) - 96 }

class RollingHash {
  constructor(m) {
    this.m = m; this.hash = 0
    this.pow = 1
    for (let i = 0; i < m - 1; i++) this.pow = (this.pow * BASE) % MOD
  }
  init(str) {
    this.hash = 0; let p = 1
    for (let i = str.length - 1; i >= 0; i--) {
      this.hash = (this.hash + charCode(str[i]) * p) % MOD
      p = (p * BASE) % MOD
    }
    return this.hash
  }
  slide(remove, add) {
    // YOUR CODE HERE
    // Step 1: remove leftmost: subtract charCode(remove) * this.pow
    // Step 2: shift: multiply by BASE
    // Step 3: add rightmost: add charCode(add)
    // All mod MOD — add MOD after subtraction to stay positive
    return this.hash
  }
}

const rh1 = new RollingHash(3)
rh1.init('abc')
const slid = rh1.slide('a', 'd')

const rh2 = new RollingHash(3)
const direct = rh2.init('bcd')

console.log('slid:  ', slid)
console.log('direct:', direct)
console.log('match:', slid === direct)`,
      hint: 'this.hash = ((this.hash - charCode(remove) * this.pow % MOD + MOD) * BASE + charCode(add)) % MOD',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('true') || flat.toLowerCase().includes('match: true')
      },
    },

    // ── Challenge 2: Rabin-Karp search ────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-rabin-karp',
      text: 'Use the complete rabinKarp(text, pattern) function to find all occurrences of "ab" in "ababab". Expected: [0, 2, 4]. Also find "aa" in "aaaa" — expected [0, 1, 2]. Log both results.',
      expectedOutput: null,
      startCode: `const BASE = 31
const MOD  = 1_000_000_007
function charCode(c) { return c.charCodeAt(0) - 96 }

class RollingHash {
  constructor(m) {
    this.m = m; this.hash = 0
    this.pow = 1
    for (let i = 0; i < m - 1; i++) this.pow = (this.pow * BASE) % MOD
  }
  init(str) {
    this.hash = 0; let p = 1
    for (let i = str.length - 1; i >= 0; i--) {
      this.hash = (this.hash + charCode(str[i]) * p) % MOD
      p = (p * BASE) % MOD
    }
    return this.hash
  }
  slide(remove, add) {
    this.hash = ((this.hash - charCode(remove) * this.pow % MOD + MOD) * BASE + charCode(add)) % MOD
    return this.hash
  }
}

function rabinKarp(text, pattern) {
  const n = text.length, m = pattern.length
  if (m > n) return []
  const patHash = new RollingHash(m), winHash = new RollingHash(m)
  const target = patHash.init(pattern)
  winHash.init(text.slice(0, m))
  const matches = []
  for (let i = 0; i <= n - m; i++) {
    if (winHash.hash === target && text.slice(i, i + m) === pattern) matches.push(i)
    if (i < n - m) winHash.slide(text[i], text[i + m])
  }
  return matches
}

// YOUR CODE HERE: call rabinKarp and log results
`,
      hint: 'console.log(rabinKarp("ababab", "ab")); console.log(rabinKarp("aaaa", "aa"));',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('0') && flat.includes('2') && flat.includes('4')
      },
    },

    { type: 'checkpoint', id: 'cp-hash' },
    { type: 'checkpoint', id: 'cp-rabin' },

    // ── Step 5: Proxy pattern — introduction ──────────────────────────────────

    {
      type: 'narration',
      id: 'step5-proxy-intro',
      text: 'The Proxy design pattern (one of the Gang of Four structural patterns) places a surrogate object in front of another object. The proxy intercepts calls, adding behaviour such as access control, logging, or caching without modifying the original. It presents the same interface as the real object so callers never know a proxy is involved. This is different from a decorator — a proxy controls access to the subject, while a decorator adds behaviour. Real uses: lazy initialisation of expensive resources, virtual proxies that load data on demand, protection proxies that check permissions.',
      code: `// The minimal proxy shape in JavaScript
// Subject interface: the contract both subject and proxy must honour
// RealSubject: the actual computation
// Proxy: intercepts calls and optionally delegates

class RealStringSubject {
  charAt(i)        { return this._str[i] }
  slice(start, end){ return this._str.slice(start, end) }
  get length()     { return this._str.length }
  constructor(str) { this._str = str }
}

class LoggingProxy {
  constructor(subject) { this._subject = subject }
  charAt(i)         { console.log('charAt', i); return this._subject.charAt(i) }
  slice(start, end) { console.log('slice', start, end); return this._subject.slice(start, end) }
  get length()      { return this._subject.length }
}

const real  = new RealStringSubject('hello')
const proxy = new LoggingProxy(real)

console.log(proxy.charAt(1))       // logs "charAt 1", returns 'e'
console.log(proxy.slice(1, 3))     // logs "slice 1 3", returns 'el'`,
    },

    // ── Step 6: RollingHashProxy ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-proxy-code',
      text: 'The RollingHashProxy wraps a text string and exposes the same charAt/slice/length interface. Internally it holds a RollingHash and a cache (Map) from window index to hash value. When rabinKarp asks for windowHash(i), the proxy computes it lazily: if it is already in the cache, return it immediately (O(1)); if not, slide from the last computed position to i, caching each intermediate hash. This is the virtual proxy pattern — expensive work (sliding the hash to an arbitrary position) is deferred until actually needed, and never repeated.',
      code: `const BASE = 31, MOD = 1_000_000_007
function charCode(c) { return c.charCodeAt(0) - 96 }

class RollingHash {
  constructor(m) {
    this.m = m; this.hash = 0
    this.pow = 1
    for (let i = 0; i < m - 1; i++) this.pow = (this.pow * BASE) % MOD
  }
  init(str) {
    this.hash = 0; let p = 1
    for (let i = str.length - 1; i >= 0; i--) {
      this.hash = (this.hash + charCode(str[i]) * p) % MOD; p = (p * BASE) % MOD
    }
    return this.hash
  }
  slide(remove, add) {
    this.hash = ((this.hash - charCode(remove) * this.pow % MOD + MOD) * BASE + charCode(add)) % MOD
    return this.hash
  }
}

// Proxy: same charAt/slice/length interface as a plain string
// Adds: windowHash(i) computed lazily and cached
class RollingHashProxy {                           // ← NEW
  constructor(text, windowSize) {                  // ← NEW
    this._text   = text                            // ← NEW
    this._m      = windowSize                      // ← NEW
    this._rh     = new RollingHash(windowSize)     // ← NEW
    this._cache  = new Map()                       // ← NEW  index → hash
    this._cursor = -1                              // ← NEW  last computed position

    // Warm up: initialise hash at position 0
    if (text.length >= windowSize) {               // ← NEW
      this._rh.init(text.slice(0, windowSize))     // ← NEW
      this._cache.set(0, this._rh.hash)            // ← NEW
      this._cursor = 0                             // ← NEW
    }
  }

  // Same interface as string
  get length()     { return this._text.length }           // ← NEW
  charAt(i)        { return this._text[i] }               // ← NEW
  slice(s, e)      { return this._text.slice(s, e) }      // ← NEW

  // New capability: O(1) amortised hash for window at position i
  windowHash(i) {                                         // ← NEW
    if (this._cache.has(i)) return this._cache.get(i)    // ← NEW  cache hit
    // Slide from cursor to i, caching each position
    while (this._cursor < i) {                           // ← NEW
      const j = this._cursor                             // ← NEW
      this._rh.slide(this._text[j], this._text[j + this._m])  // ← NEW
      this._cursor++                                     // ← NEW
      this._cache.set(this._cursor, this._rh.hash)       // ← NEW
    }
    return this._rh.hash                                 // ← NEW
  }
}

const proxy = new RollingHashProxy('ababab', 2)
console.log('hash at 0:', proxy.windowHash(0))   // hash of "ab"
console.log('hash at 2:', proxy.windowHash(2))   // hash of "ab" (same — cached)
console.log('hash at 1:', proxy.windowHash(1))   // hash of "ba" (retrieved from cache)
console.log('charAt(3):', proxy.charAt(3))       // 'b' — same as string interface`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-meeting-point',
      text: 'The meeting point between Rolling Hash and Proxy: Rabin-Karp needs hash values for every window in the text. Without a proxy, the caller is responsible for managing the RollingHash object, calling slide at every step, and never skipping ahead. With RollingHashProxy, the caller just asks for windowHash(i) at any index — the proxy hides the statefulness (the cursor must advance monotonically), caches past results, and presents the same charAt/slice interface as a plain string. The DSA concern (maintain hash state across slides) is encapsulated behind the proxy\'s interface. Neither half knows about the other\'s internals.',
      code: `// Rabin-Karp using the proxy — caller never touches RollingHash directly
const BASE = 31, MOD = 1_000_000_007
function charCode(c) { return c.charCodeAt(0) - 96 }

class RollingHash {
  constructor(m){this.m=m;this.hash=0;this.pow=1;for(let i=0;i<m-1;i++)this.pow=(this.pow*BASE)%MOD}
  init(str){this.hash=0;let p=1;for(let i=str.length-1;i>=0;i--){this.hash=(this.hash+charCode(str[i])*p)%MOD;p=(p*BASE)%MOD}return this.hash}
  slide(remove,add){this.hash=((this.hash-charCode(remove)*this.pow%MOD+MOD)*BASE+charCode(add))%MOD;return this.hash}
}

class RollingHashProxy {
  constructor(text,m){this._text=text;this._m=m;this._rh=new RollingHash(m);this._cache=new Map();this._cursor=-1;if(text.length>=m){this._rh.init(text.slice(0,m));this._cache.set(0,this._rh.hash);this._cursor=0}}
  get length(){return this._text.length}
  charAt(i){return this._text[i]}
  slice(s,e){return this._text.slice(s,e)}
  windowHash(i){if(this._cache.has(i))return this._cache.get(i);while(this._cursor<i){const j=this._cursor;this._rh.slide(this._text[j],this._text[j+this._m]);this._cursor++;this._cache.set(this._cursor,this._rh.hash)}return this._rh.hash}
}

function rabinKarpProxy(text, pattern) {          // ← NEW
  const proxy = new RollingHashProxy(text, pattern.length)  // ← NEW
  const rh    = new RollingHash(pattern.length)             // ← NEW
  const target = rh.init(pattern)                           // ← NEW
  const matches = []                                        // ← NEW
  for (let i = 0; i <= text.length - pattern.length; i++) {// ← NEW
    if (proxy.windowHash(i) === target) {                   // ← NEW  proxy handles state
      if (proxy.slice(i, i + pattern.length) === pattern) {// ← NEW  verify collision
        matches.push(i)                                     // ← NEW
      }
    }
  }
  return matches                                            // ← NEW
}

console.log(rabinKarpProxy('ababab', 'ab'))          // [0, 2, 4]
console.log(rabinKarpProxy('mississippi', 'issi'))   // [1, 4]`,
    },

    // ── Challenge 3: combined ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Use rabinKarpProxy to find all occurrences of "issi" in "mississippi". Expected: [1, 4]. Also find "ss" in "mississippi" — expected [2, 5]. Log both results labelled.',
      expectedOutput: null,
      startCode: `const BASE = 31, MOD = 1_000_000_007
function charCode(c) { return c.charCodeAt(0) - 96 }

class RollingHash {
  constructor(m){this.m=m;this.hash=0;this.pow=1;for(let i=0;i<m-1;i++)this.pow=(this.pow*BASE)%MOD}
  init(str){this.hash=0;let p=1;for(let i=str.length-1;i>=0;i--){this.hash=(this.hash+charCode(str[i])*p)%MOD;p=(p*BASE)%MOD}return this.hash}
  slide(remove,add){this.hash=((this.hash-charCode(remove)*this.pow%MOD+MOD)*BASE+charCode(add))%MOD;return this.hash}
}

class RollingHashProxy {
  constructor(text,m){this._text=text;this._m=m;this._rh=new RollingHash(m);this._cache=new Map();this._cursor=-1;if(text.length>=m){this._rh.init(text.slice(0,m));this._cache.set(0,this._rh.hash);this._cursor=0}}
  get length(){return this._text.length}
  charAt(i){return this._text[i]}
  slice(s,e){return this._text.slice(s,e)}
  windowHash(i){if(this._cache.has(i))return this._cache.get(i);while(this._cursor<i){const j=this._cursor;this._rh.slide(this._text[j],this._text[j+this._m]);this._cursor++;this._cache.set(this._cursor,this._rh.hash)}return this._rh.hash}
}

function rabinKarpProxy(text, pattern) {
  const proxy = new RollingHashProxy(text, pattern.length)
  const rh = new RollingHash(pattern.length)
  const target = rh.init(pattern)
  const matches = []
  for (let i = 0; i <= text.length - pattern.length; i++) {
    if (proxy.windowHash(i) === target && proxy.slice(i, i + pattern.length) === pattern) {
      matches.push(i)
    }
  }
  return matches
}

// YOUR CODE HERE: find 'issi' and 'ss' in 'mississippi' and log labelled results
`,
      hint: 'console.log("issi:", rabinKarpProxy("mississippi", "issi")); console.log("ss:", rabinKarpProxy("mississippi", "ss"));',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('1') && flat.includes('4') && flat.includes('2') && flat.includes('5')
      },
    },

    { type: 'checkpoint', id: 'cp-proxy' },

    // ── Step 8: Combined narration ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-combined',
      text: 'Rolling hash and proxy compose naturally in a caching proxy for multi-pattern search. Build a RollingHashProxy over the text once and then query it for several patterns without recomputing any window hash. This is especially efficient in virus scanners that check every 64-byte block of a file against thousands of known signatures: one pass, all signatures checked simultaneously using a Set of target hashes, with the proxy caching every block hash.',
      code: `// Multi-pattern search: one proxy, many patterns
const BASE = 31, MOD = 1_000_000_007
function charCode(c) { return c.charCodeAt(0) - 96 }

class RollingHash {
  constructor(m){this.m=m;this.hash=0;this.pow=1;for(let i=0;i<m-1;i++)this.pow=(this.pow*BASE)%MOD}
  init(str){this.hash=0;let p=1;for(let i=str.length-1;i>=0;i--){this.hash=(this.hash+charCode(str[i])*p)%MOD;p=(p*BASE)%MOD}return this.hash}
  slide(remove,add){this.hash=((this.hash-charCode(remove)*this.pow%MOD+MOD)*BASE+charCode(add))%MOD;return this.hash}
}

class RollingHashProxy {
  constructor(text,m){this._text=text;this._m=m;this._rh=new RollingHash(m);this._cache=new Map();this._cursor=-1;if(text.length>=m){this._rh.init(text.slice(0,m));this._cache.set(0,this._rh.hash);this._cursor=0}}
  get length(){return this._text.length}
  charAt(i){return this._text[i]}
  slice(s,e){return this._text.slice(s,e)}
  windowHash(i){if(this._cache.has(i))return this._cache.get(i);while(this._cursor<i){const j=this._cursor;this._rh.slide(this._text[j],this._text[j+this._m]);this._cursor++;this._cache.set(this._cursor,this._rh.hash)}return this._rh.hash}
}

function multiSearch(text, patterns) {
  // All patterns must have the same length for one shared proxy
  const m = patterns[0].length
  const proxy = new RollingHashProxy(text, m)
  const rh = new RollingHash(m)
  // Build set of target hashes (pattern → hash)
  const targets = new Map(patterns.map(p => [rh.init(p), p]))
  const results = Object.fromEntries(patterns.map(p => [p, []]))
  for (let i = 0; i <= text.length - m; i++) {
    const h = proxy.windowHash(i)
    if (targets.has(h)) {
      const pat = targets.get(h)
      if (proxy.slice(i, i + m) === pat) results[pat].push(i)
    }
  }
  return results
}

const res = multiSearch('abcababcab', ['ab', 'ca'])
console.log('ab:', res['ab'])   // [0, 3, 4, 7]
console.log('ca:', res['ca'])   // [2, 6]`,
    },

    // ── Challenge 4: multi-search ─────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-multi',
      text: 'Use multiSearch to find all occurrences of "ab" and "ca" in "abcababcab". Expected: ab → [0, 3, 4, 7], ca → [2, 6]. Log results labelled.',
      expectedOutput: null,
      startCode: `const BASE = 31, MOD = 1_000_000_007
function charCode(c) { return c.charCodeAt(0) - 96 }

class RollingHash {
  constructor(m){this.m=m;this.hash=0;this.pow=1;for(let i=0;i<m-1;i++)this.pow=(this.pow*BASE)%MOD}
  init(str){this.hash=0;let p=1;for(let i=str.length-1;i>=0;i--){this.hash=(this.hash+charCode(str[i])*p)%MOD;p=(p*BASE)%MOD}return this.hash}
  slide(remove,add){this.hash=((this.hash-charCode(remove)*this.pow%MOD+MOD)*BASE+charCode(add))%MOD;return this.hash}
}

class RollingHashProxy {
  constructor(text,m){this._text=text;this._m=m;this._rh=new RollingHash(m);this._cache=new Map();this._cursor=-1;if(text.length>=m){this._rh.init(text.slice(0,m));this._cache.set(0,this._rh.hash);this._cursor=0}}
  get length(){return this._text.length}
  charAt(i){return this._text[i]}
  slice(s,e){return this._text.slice(s,e)}
  windowHash(i){if(this._cache.has(i))return this._cache.get(i);while(this._cursor<i){const j=this._cursor;this._rh.slide(this._text[j],this._text[j+this._m]);this._cursor++;this._cache.set(this._cursor,this._rh.hash)}return this._rh.hash}
}

function multiSearch(text, patterns) {
  const m = patterns[0].length
  const proxy = new RollingHashProxy(text, m)
  const rh = new RollingHash(m)
  const targets = new Map(patterns.map(p => [rh.init(p), p]))
  const results = Object.fromEntries(patterns.map(p => [p, []]))
  for (let i = 0; i <= text.length - m; i++) {
    const h = proxy.windowHash(i)
    if (targets.has(h)) {
      const pat = targets.get(h)
      if (proxy.slice(i, i + m) === pat) results[pat].push(i)
    }
  }
  return results
}

// YOUR CODE HERE: call multiSearch and log labelled results
`,
      hint: 'const res = multiSearch("abcababcab", ["ab", "ca"]); console.log("ab:", res["ab"]); console.log("ca:", res["ca"]);',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('0') && flat.includes('3') && flat.includes('4') && flat.includes('7')
      },
    },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through the RollingHash.slide method. Watch this.hash change at each arithmetic step: subtraction of the left character\'s weighted contribution, multiplication by BASE to shift positions, addition of the new right character. Compare the sliding result with the direct polynomialHash of the new window — they match. Then step through rabinKarpProxy and observe how the proxy intercepts windowHash calls, returning cached values on repeated access.',
      code: null,
    },

    {
      type: 'codelens',
      id: 'cl-rolling',
      text: 'Step through the slide method and the Rabin-Karp search loop. Watch the hash state evolve: each slide is three arithmetic operations. See the proxy\'s cache grow as new positions are computed. Observe that when the same index is queried twice, no sliding happens — the cached value is returned immediately.',
      code: `const BASE=31,MOD=1_000_000_007
function charCode(c){return c.charCodeAt(0)-96}
class RollingHash{
  constructor(m){this.m=m;this.hash=0;this.pow=1;for(let i=0;i<m-1;i++)this.pow=(this.pow*BASE)%MOD}
  init(str){this.hash=0;let p=1;for(let i=str.length-1;i>=0;i--){this.hash=(this.hash+charCode(str[i])*p)%MOD;p=(p*BASE)%MOD}return this.hash}
  slide(remove,add){this.hash=((this.hash-charCode(remove)*this.pow%MOD+MOD)*BASE+charCode(add))%MOD;return this.hash}
}
const rh=new RollingHash(3)
console.log(rh.init('abc'))
console.log(rh.slide('a','d'))
console.log(rh.slide('b','e'))
const rh2=new RollingHash(3)
console.log(rh2.init('bcd'))
console.log(rh2.init('cde'))`,
      lang: 'js',
    },

  ],
}
