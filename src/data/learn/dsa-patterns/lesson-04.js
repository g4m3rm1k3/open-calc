// DSA + Design Patterns — Lesson 04
// Space/Time Tradeoff + Proxy

export const lesson = {
  id: 'dsa-patterns-04',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '4. Space/Time Tradeoff + Proxy',
  checkpoints: [
    { id: 'cp-tradeoff', label: 'Space/Time Tradeoff' },
    { id: 'cp-proxy',    label: 'Proxy Pattern' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You have a function that takes 200 milliseconds to run. It computes something expensive: reading from a database, fetching from an API, solving a complex calculation. It gets called hundreds of times a day, sometimes with the same inputs over and over. Each call is identical work — the same input, the same output — but you pay the full cost every time. The answer is not a faster algorithm. The answer is to stop computing the same thing twice. You can trade memory — space — for computation time. Store the result the first time; return the stored result every time after. This idea lives simultaneously in the field of algorithms and in a design pattern. They are the same idea from two different angles.',
      code: null,
    },

    // ── Step 1: The cost of repeated work ────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-repeated-work',
      text: 'Start by making the problem concrete. The Fibonacci sequence is the classic example: fib(n) = fib(n-1) + fib(n-2). Computing it naively with recursion — calling the function again for each smaller problem — is O(2ⁿ): exponential growth. The reason: fib(3) is computed once when called for fib(5) and again when called for fib(4). The same subproblem is recalculated dozens of times. Every node in the call tree represents one function call. The call tree doubles in size with each increment of n. By n=40 it is over 300 million calls.',
      code: `let callCount = 0

function fib(n) {
  callCount++
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
}

callCount = 0; console.log('fib(10):', fib(10), '— calls:', callCount)   // 55, 177
callCount = 0; console.log('fib(20):', fib(20), '— calls:', callCount)   // 6765, 21891
callCount = 0; console.log('fib(30):', fib(30), '— calls:', callCount)   // 832040, 2692537
// fib(40) would be 300+ million calls
// The call count roughly doubles with each step — that is O(2ⁿ)`,
    },

    // ── Step 2: The tradeoff — use memory to avoid recomputation ─────────────

    {
      type: 'narration',
      id: 'step2-tradeoff',
      text: 'The space/time tradeoff is this: you can spend memory to save time. Store the result of a computation the first time you perform it. Every subsequent request for the same result returns the stored value — zero computation. The storage used for results is called a cache (also called a memo table in the context of algorithms): a place where you save the result of expensive work so you do not have to redo it. This transforms fib from O(2ⁿ) to O(n): each unique sub-problem is computed exactly once, then retrieved in O(1) from the cache. The cost is that the cache consumes memory — but memory is almost always cheaper than time.',
      code: `let callCount = 0

function fibMemo(n, memo = {}) {
  callCount++
  if (n <= 1) return n
  if (memo[n] !== undefined) return memo[n]   // cache hit: return stored result immediately
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  return memo[n]
}

callCount = 0; console.log('fib(10):', fibMemo(10), '— calls:', callCount)  // 55, 19
callCount = 0; console.log('fib(20):', fibMemo(20), '— calls:', callCount)  // 6765, 39
callCount = 0; console.log('fib(30):', fibMemo(30), '— calls:', callCount)  // 832040, 59
callCount = 0; console.log('fib(40):', fibMemo(40), '— calls:', callCount)  // calls: 79
// 2n-1 calls instead of 2ⁿ — O(n) not O(2ⁿ)`,
    },

    // ── Step 3: General memoization function ─────────────────────────────────

    {
      type: 'narration',
      id: 'step3-general-memo',
      text: 'The caching logic — check cache, compute if missing, store result — is the same for any pure function. A pure function is one that always returns the same output for the same input and has no side effects. For any pure function, you can extract the caching logic into a wrapper. The original function does not change. The wrapper intercepts the call, checks its own cache, and only calls the original if the result is not stored yet. This wrapper is doing exactly what a cache does: it sits between the caller and the function, intercepting calls and returning stored results when available.',
      code: `// A general memoize wrapper that works with any pure function
function memoize(fn) {
  const cache = {}                    // the cache: stores results by argument
  return function(...args) {
    const key = JSON.stringify(args)  // convert arguments to a string key
    if (cache[key] !== undefined) {
      return cache[key]               // cache hit — no call to fn
    }
    const result = fn(...args)        // cache miss — call the real function
    cache[key] = result               // store the result
    return result
  }
}

// Wrap any expensive pure function
function expensiveCalc(n) {
  let result = 0
  for (let i = 0; i < n * 1000; i++) result += i  // simulate expensive work
  return result
}

const fastCalc = memoize(expensiveCalc)

console.log(fastCalc(100))  // computed the first time (slow)
console.log(fastCalc(100))  // returned from cache instantly
console.log(fastCalc(200))  // different argument: computed fresh
console.log(fastCalc(200))  // cached`,
    },

    // ── Challenge: space/time tradeoff ────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-tradeoff',
      text: 'Write a function called countWords(text) that counts how many times each word appears in a string. Return a plain object where each key is a word and each value is its count. Convert all words to lowercase. Split on spaces. Do not use any external library. Test with "the cat sat on the mat the cat" — expected: { the: 3, cat: 2, sat: 1, on: 1, mat: 1 }. Then demonstrate the space/time tradeoff: wrap countWords in a memoize() wrapper (the one written above, already available), call it twice with the same text, and log "cached" after the second call to show it returned from cache.',
      expectedOutput: null,
      startCode: `function memoize(fn) {
  const cache = {}
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache[key] !== undefined) return cache[key]
    const result = fn(...args)
    cache[key] = result
    return result
  }
}

function countWords(text) {
  // split text into words, count each word
  // return { word: count, ... }
}

const fastCount = memoize(countWords)

const text = 'the cat sat on the mat the cat'
const result = fastCount(text)
console.log(result.the)    // 3
console.log(result.cat)    // 2

fastCount(text)             // same text: returned from cache
console.log('cached')      // this line proves the second call was instant`,
      hint: 'Split text with text.toLowerCase().split(" "). Then for each word: counts[word] = (counts[word] || 0) + 1. Return counts.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        const hasCached = flat.includes('cached')
        const has3 = logs.some(l => parseInt(String(l).trim(), 10) === 3)
        const has2 = logs.some(l => parseInt(String(l).trim(), 10) === 2)
        return hasCached && has3 && has2
      },
    },

    { type: 'checkpoint', id: 'cp-tradeoff' },

    // ── Step 4: Proxy pattern intro ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-proxy-intro',
      text: 'The Proxy pattern is a structural design pattern (one that deals with how objects are composed and connected). A proxy is an object that stands in front of another object — the real subject — and controls access to it. The proxy has the same interface as the real subject. The caller cannot tell the difference. The proxy intercepts each call and can decide to: forward the call to the real subject, return a cached result without calling the subject, add logging around the call, add access control, or delay the real object\'s creation until it is actually needed. The memoize wrapper you just wrote is a proxy — it intercepts calls to a function and returns cached results instead of forwarding to the real function every time.',
      code: null,
    },

    // ── Step 5: Proxy as a class ──────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-proxy-class',
      text: 'Build a Proxy class for an expensive API client. The real client makes network calls. The proxy intercepts each call, checks its cache, and only forwards to the real client on a cache miss. The caller interacts with the proxy exactly as if it were the real client.',
      code: `// The real API client — expensive, makes actual network calls
class ApiClient {
  fetch(endpoint) {
    console.log('  [ApiClient] FETCHING', endpoint)  // simulating network call
    if (endpoint === '/users/1') return { id: 1, name: 'Alice' }
    if (endpoint === '/users/2') return { id: 2, name: 'Bob' }
    return null
  }
}

// Proxy intercepts calls to ApiClient
class CachingProxy {
  constructor(client) {
    this.client = client   // reference to the real subject
    this.cache  = {}       // ← NEW: the cache lives in the proxy, not the client
  }

  fetch(endpoint) {        // ← NEW: same interface as ApiClient
    if (this.cache[endpoint] !== undefined) {
      console.log('  [Proxy] CACHE HIT', endpoint)
      return this.cache[endpoint]
    }
    console.log('  [Proxy] cache miss, forwarding to client')
    const result = this.client.fetch(endpoint)  // forward to real client
    this.cache[endpoint] = result               // store for next time
    return result
  }
}

const proxy = new CachingProxy(new ApiClient())

proxy.fetch('/users/1')   // cache miss — calls ApiClient
proxy.fetch('/users/1')   // cache hit — returns stored result
proxy.fetch('/users/2')   // cache miss for new endpoint
proxy.fetch('/users/2')   // cache hit`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-meeting',
      text: 'This is where the two ideas meet. The space/time tradeoff is the algorithmic insight: use memory to store results you will need again. The Proxy pattern is the structural implementation of that insight: an object that sits in front of the real subject, intercepts calls, and returns cached results when available. The memoize() function from the algorithm section IS a proxy — a functional proxy wrapping a function. The CachingProxy class IS the same idea expressed as an object wrapping another object. Both are trading space for time. Both intercept the call and return stored results. The pattern gives the concept a name and a shape; the algorithm gives it mathematical justification.',
      code: null,
    },

    // ── Challenge: Proxy ──────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-proxy',
      text: 'Write a class called LoggingProxy that wraps any object and intercepts calls to a single method named execute(input). The proxy must: (1) log "calling execute with: <input>" before forwarding, (2) call the real object\'s execute(input) method, (3) log "result: <result>" after receiving the result, (4) return the result. Do not store a cache — this proxy\'s job is logging, not caching. Test: create an object called calculator with an execute(n) method that returns n * 2. Wrap it in LoggingProxy. Call proxy.execute(5) and verify the logs appear and the result is 10.',
      expectedOutput: null,
      startCode: `class LoggingProxy {
  constructor(subject) {
    this.subject = subject   // the real object being wrapped
  }

  execute(input) {
    // log, call subject.execute(input), log result, return result
  }
}

const calculator = {
  execute(n) { return n * 2 }
}

const proxy = new LoggingProxy(calculator)
const result = proxy.execute(5)
console.log('final result:', result)   // 10`,
      hint: 'console.log("calling execute with:", input); const result = this.subject.execute(input); console.log("result:", result); return result',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('10') && flat.includes('5') && flat.toLowerCase().includes('calling')
      },
    },

    { type: 'checkpoint', id: 'cp-proxy' },

    // ── Step 7: Combined ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-combined',
      text: 'Combine both ideas in a realistic component: a weather service proxy that caches results and logs misses. The real service is expensive. The proxy intercepts each call, returns the cached result if it exists, logs when it must forward to the real service, and stores the result after the first fetch. This is exactly how HTTP caches, CDN edge nodes, and browser caches work — a proxy layer that absorbs repeated requests and only forwards novel ones.',
      code: `class WeatherService {
  getWeather(city) {
    console.log('  [WeatherService] fetching for', city)
    const data = { London: 12, Paris: 18, Tokyo: 24 }
    return data[city] ?? null
  }
}

class WeatherProxy {
  constructor(service, ttlMs = 5000) {
    this.service = service
    this.cache   = {}     // { city: { temp, expiresAt } }
    this.ttlMs   = ttlMs  // TTL: time to live — how long a cache entry stays valid
  }

  getWeather(city) {
    const now   = Date.now()
    const entry = this.cache[city]

    if (entry && entry.expiresAt > now) {
      console.log('  [Proxy] cache hit for', city)
      return entry.temp
    }

    const temp = this.service.getWeather(city)
    this.cache[city] = { temp, expiresAt: now + this.ttlMs }  // store with expiry
    return temp
  }
}

const proxy = new WeatherProxy(new WeatherService())

console.log(proxy.getWeather('London'))   // fetches
console.log(proxy.getWeather('London'))   // cache hit
console.log(proxy.getWeather('Paris'))    // fetches
console.log(proxy.getWeather('London'))   // still cached`,
    },

    // ── Challenge: combined ───────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Write a class called CurrencyProxy that wraps an exchange rate service and caches results. The exchange rate service has a method getRate(from, to) that returns a number. Your proxy should cache results with the key `${from}_${to}`. On a cache hit, log "cache hit: <from>/<to>" and return the stored rate. On a cache miss, call the real service, store the result, and return it. Do not implement TTL — cache entries never expire in this version. Test: call proxy.getRate("USD", "EUR") twice. First call should reach the service; second should be a cache hit. Log both returned values — both must equal 0.92.',
      expectedOutput: null,
      startCode: `class ExchangeService {
  getRate(from, to) {
    console.log('  [Service] looking up', from, '->', to)
    if (from === 'USD' && to === 'EUR') return 0.92
    if (from === 'USD' && to === 'GBP') return 0.79
    return null
  }
}

class CurrencyProxy {
  constructor(service) {
    this.service = service
    this.cache   = {}
  }

  getRate(from, to) {
    // check cache with key \`\${from}_\${to}\`
    // on hit: log and return cached value
    // on miss: call service, store result, return it
  }
}

const proxy = new CurrencyProxy(new ExchangeService())

console.log(proxy.getRate('USD', 'EUR'))  // 0.92 — service called
console.log(proxy.getRate('USD', 'EUR'))  // 0.92 — cache hit`,
      hint: 'const key = `${from}_${to}`; if (this.cache[key] !== undefined) { console.log("cache hit:", ...); return this.cache[key]; } const rate = this.service.getRate(from, to); this.cache[key] = rate; return rate',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseFloat(String(l).trim()))
        const has092 = nums.filter(n => Math.abs(n - 0.92) < 0.001).length >= 2
        const hasHit = logs.some(l => String(l).toLowerCase().includes('cache hit'))
        return has092 && hasHit
      },
    },

    { type: 'checkpoint', id: 'cp-together' },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Step through the CachingProxy.fetch call for "/users/1" the first time. Watch the cache object in the Variables panel: it starts empty. The condition "cache[endpoint] !== undefined" is false — miss. The proxy forwards to the real client. Watch the result arrive and then watch cache["/users/1"] get populated. Now step through the second call to fetch("/users/1"). The cache check is now true — hit. The proxy returns the stored result immediately. The client.fetch() line is never reached. That is the space/time tradeoff: one memory entry saved one network call.',
      code: `class ApiClient {
  fetch(endpoint) {
    console.log('[client] fetching', endpoint)
    if (endpoint === '/users/1') return { id: 1, name: 'Alice' }
    return null
  }
}

class CachingProxy {
  constructor(client) { this.client = client; this.cache = {} }
  fetch(endpoint) {
    if (this.cache[endpoint] !== undefined) {
      console.log('[proxy] cache hit:', endpoint)
      return this.cache[endpoint]
    }
    const result = this.client.fetch(endpoint)
    this.cache[endpoint] = result
    return result
  }
}

const proxy = new CachingProxy(new ApiClient())
const a = proxy.fetch('/users/1')
console.log('first:', a.name)
const b = proxy.fetch('/users/1')
console.log('second:', b.name)`,
    },

    {
      type: 'codelens',
      id: 'cl-proxy',
      text: `Step to: if (this.cache[endpoint] !== undefined)
Variables panel: this.cache is an empty object {}. The condition is false — cache miss.

Step to: const result = this.client.fetch(endpoint)
This line executes — the proxy forwards to the real client. Watch the client log its fetch message.

Step to: this.cache[endpoint] = result
Variables panel: this.cache now contains { '/users/1': { id: 1, name: 'Alice' } }. The result is stored.

Now the second call begins. Step to the cache check again.
Variables panel: this.cache['/users/1'] is defined — condition is true — cache hit.
The proxy returns immediately. The client.fetch line is skipped entirely.`,
      code: `class ApiClient {
  fetch(endpoint) {
    console.log('[client] fetching', endpoint)
    if (endpoint === '/users/1') return { id: 1, name: 'Alice' }
    return null
  }
}
class CachingProxy {
  constructor(client) { this.client = client; this.cache = {} }
  fetch(endpoint) {
    if (this.cache[endpoint] !== undefined) {
      console.log('[proxy] cache hit:', endpoint)
      return this.cache[endpoint]
    }
    const result = this.client.fetch(endpoint)
    this.cache[endpoint] = result
    return result
  }
}
const proxy = new CachingProxy(new ApiClient())
const a = proxy.fetch('/users/1')
console.log('first:', a.name)
const b = proxy.fetch('/users/1')
console.log('second:', b.name)`,
      lang: 'js',
    },

  ],
}
