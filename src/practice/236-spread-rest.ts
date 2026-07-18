import type { PracticeChallenge } from './loader'

export const title = 'Spread and Rest (JavaScript)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'SPREAD two arrays `[1,2]`/`[3,4]` into `combined`, print `combined.join(\',\')`. SPREAD two objects `{a:1,b:2}`/`{b:99,c:3}` into `merged` (later spread\'s `b` wins), print all three fields. Use SPREAD in a call: `Math.max(...numbers)` for `[5,10,15]`, print it. Write `sum(...nums)` (REST) using `.reduce`, call `sum(1,2,3,4)`, print it. Destructure `[first, ...others] = [1,2,3]` (REST in destructuring), print both.',
        starter: '',
        tests: `
assert output === '1,2,3,4\\na=1, b=99, c=3\\n15\\n10\\nfirst=1, others=2,3'
`,
        solution: `const arr1 = [1, 2]
const arr2 = [3, 4]
const combined = [...arr1, ...arr2]
console.log(combined.join(','))

const obj1 = { a: 1, b: 2 }
const obj2 = { b: 99, c: 3 }
const merged = { ...obj1, ...obj2 }
console.log(\`a=\${merged.a}, b=\${merged.b}, c=\${merged.c}\`)

const numbers = [5, 10, 15]
console.log(Math.max(...numbers))

function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0)
}
console.log(sum(1, 2, 3, 4))

const [first, ...others] = [1, 2, 3]
console.log(\`first=\${first}, others=\${others.join(',')}\`)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Fix `main`: `const copy = { ...original }` is a SHALLOW copy — `copy.address` is the SAME object reference as `original.address`, so `copy.address.city = \'Seattle\'` mutates BOTH. Change the copy to `{ ...original, address: { ...original.address } }`, explicitly spreading the nested object too, so `copy.address` is a genuinely separate object.',
        starter: `const original = { name: 'Alice', address: { city: 'Boston' } }
const copy = { ...original }

copy.name = 'Bob'
copy.address.city = 'Seattle'

console.log(\`original.name=\${original.name}, copy.name=\${copy.name}\`)
console.log(\`original.city=\${original.address.city}, copy.city=\${copy.address.city}\`)
`,
        tests: `
assert output === 'original.name=Alice, copy.name=Bob\\noriginal.city=Boston, copy.city=Seattle'
`,
        solution: `const original = { name: 'Alice', address: { city: 'Boston' } }
const copy = { ...original, address: { ...original.address } }

copy.name = 'Bob'
copy.address.city = 'Seattle'

console.log(\`original.name=\${original.name}, copy.name=\${copy.name}\`)
console.log(\`original.city=\${original.address.city}, copy.city=\${copy.address.city}\`)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Write `multiplyAll(...nums)` (REST — reduces with `*`, starting from `1`). Write `logAndMultiply(label, ...nums)` — a REST parameter after a NAMED one, collecting everything past `label` — which logs `` `${label}: multiplying ${nums.length} numbers` `` then returns `multiplyAll(...nums)` (SPREADING the collected rest array to forward it). Call `logAndMultiply(\'batch1\', 2, 3, 4)` directly, then call it again as `logAndMultiply(\'batch2\', ...values)` where `values = [5, 6, 7]`.',
        starter: '',
        tests: `
assert output === 'batch1: multiplying 3 numbers\\n24\\nbatch2: multiplying 3 numbers\\n210'
`,
        solution: `function multiplyAll(...nums) {
  return nums.reduce((a, b) => a * b, 1)
}

function logAndMultiply(label, ...nums) {
  console.log(\`\${label}: multiplying \${nums.length} numbers\`)
  return multiplyAll(...nums)
}

console.log(logAndMultiply('batch1', 2, 3, 4))

const values = [5, 6, 7]
console.log(logAndMultiply('batch2', ...values))
`,
      },
    ],
  },
]

export default challenges
