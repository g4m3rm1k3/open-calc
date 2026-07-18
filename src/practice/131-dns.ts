import type { PracticeChallenge } from './loader'

export const title = 'DNS'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeFakeDNS()` returning `{ resolve(domain), lookups }`. The first `resolve` call for a domain performs a real lookup (incrementing `lookups`) and caches the result; every later call for the SAME domain must be served from the cache without incrementing `lookups`.',
        starter: '',
        tests: `
const dns = makeFakeDNS()
assert dns.resolve('example.com') === '93.184.216.34'
assert dns.resolve('example.com') === '93.184.216.34'
assert dns.lookups === 1
`,
        solution: `function makeFakeDNS() {
  const records = { 'example.com': '93.184.216.34' }
  const cache = new Map()
  let lookups = 0
  return {
    resolve(domain) {
      if (cache.has(domain)) return cache.get(domain)
      lookups++
      const ip = records[domain]
      cache.set(domain, ip)
      return ip
    },
    get lookups() { return lookups },
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `makeFakeDNSWithTTL(ttlMs, nowFn)`: a cached entry is only valid while `nowFn() - cachedAt < ttlMs`. Once the TTL has passed, treat it as a cache miss and perform a fresh lookup — exactly why a DNS change doesn\'t propagate everywhere instantly.',
        starter: 'function makeFakeDNSWithTTL(ttlMs, nowFn) {\n  const records = { \'example.com\': \'93.184.216.34\' }\n  const cache = new Map()\n  let lookups = 0\n  return {\n    resolve(domain) {\n      // TODO: a cached entry is only valid while nowFn() - cachedAt < ttlMs —\n      // once the TTL has passed, treat it as a cache miss and look up again\n      if (cache.has(domain)) return cache.get(domain).ip\n      lookups++\n      const ip = records[domain]\n      cache.set(domain, { ip, cachedAt: nowFn() })\n      return ip\n    },\n    get lookups() { return lookups },\n  }\n}',
        tests: `
let currentTime = 0
const dns = makeFakeDNSWithTTL(1000, () => currentTime)
assert dns.resolve('example.com') === '93.184.216.34'
assert dns.lookups === 1
currentTime = 500
assert dns.resolve('example.com') === '93.184.216.34'
assert dns.lookups === 1
currentTime = 1500
assert dns.resolve('example.com') === '93.184.216.34'
assert dns.lookups === 2
`,
        solution: `function makeFakeDNSWithTTL(ttlMs, nowFn) {
  const records = { 'example.com': '93.184.216.34' }
  const cache = new Map()
  let lookups = 0
  return {
    resolve(domain) {
      const cached = cache.get(domain)
      if (cached && nowFn() - cached.cachedAt < ttlMs) return cached.ip
      lookups++
      const ip = records[domain]
      cache.set(domain, { ip, cachedAt: nowFn() })
      return ip
    },
    get lookups() { return lookups },
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `resolveHierarchy(domain, resolverChain)`, where each resolver has `lookup(domain)` returning an IP or `null` (doesn\'t know it). No single resolver holds every answer — try each resolver in the chain, in order, returning the first non-null result, or `null` if none of them know it.',
        starter: '',
        tests: `
const rootResolver = { lookup: d => null }
const tldResolver = { lookup: d => null }
const authoritativeResolver = { lookup: d => d === 'example.com' ? '93.184.216.34' : null }
assert resolveHierarchy('example.com', [rootResolver, tldResolver, authoritativeResolver]) === '93.184.216.34'
assert resolveHierarchy('missing.com', [rootResolver, tldResolver, authoritativeResolver]) === null
`,
        solution: `function resolveHierarchy(domain, resolverChain) {
  for (const resolver of resolverChain) {
    const answer = resolver.lookup(domain)
    if (answer) return answer
  }
  return null
}`,
      },
    ],
  },
]

export default challenges
