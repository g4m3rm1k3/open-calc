import type { PracticeChallenge } from './loader'

export const title = 'Stack vs Heap'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `computeSum()` (locals `a`, `b` only needed during this one call — stack-like) and `makeUser()` (returns `{ name: \'Alice\' }`, an object that must outlive this function call — heap-like).',
        starter: '',
        tests: `
assert computeSum() === 15
const user = makeUser()
assert user.name === 'Alice'
`,
        solution: `function computeSum() {
  let a = 5
  let b = 10
  return a + b
}
function makeUser() {
  return { name: 'Alice' }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `deepRecursion(n)`: add a base case (`n <= 0` returns `0`) that stops the recursion — without one, this recurses forever and overflows the call stack, a fixed-size region, exactly the kind of bug that "stack overflow" errors come from.',
        starter: 'function deepRecursion(n) {\n  // TODO: add a base case (n <= 0) that returns 0 without recursing further —\n  // without one, this recurses forever and overflows the call stack\n  return 1 + deepRecursion(n - 1)\n}',
        tests: `
assert deepRecursion(5) === 5
assert deepRecursion(0) === 0
`,
        solution: `function deepRecursion(n) {
  if (n <= 0) return 0
  return 1 + deepRecursion(n - 1)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `buildLargeHeapArray(n)` building and returning an array of `n` sequential integers via a simple loop (not recursion) — the heap has no fixed depth limit the way the stack does, so it can hold far more data than an equivalent-depth recursive call chain ever could.',
        starter: '',
        tests: `
const arr = buildLargeHeapArray(10000)
assert arr.length === 10000
assert arr[9999] === 9999
`,
        solution: `function buildLargeHeapArray(n) {
  const arr = []
  for (let i = 0; i < n; i++) arr.push(i)
  return arr
}`,
      },
    ],
  },
]

export default challenges
