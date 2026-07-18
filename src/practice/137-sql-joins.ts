import type { PracticeChallenge } from './loader'

export const title = 'SQL Joins'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `innerJoin(left, right, leftKey, rightKey)` pairing every `left` row with every `right` row where `left[leftKey] === right[rightKey]`, merging the matched pair into one object. A `left` row with no match contributes nothing to the result.',
        starter: '',
        tests: `
const customers = [{id:1,name:'Alice'},{id:2,name:'Bob'},{id:3,name:'Carol'}]
const orders = [{id:101,customerId:1,item:'Book'},{id:102,customerId:1,item:'Pen'},{id:103,customerId:2,item:'Mug'}]
assert innerJoin(customers, orders, 'id', 'customerId').length === 3
`,
        solution: `function innerJoin(left, right, leftKey, rightKey) {
  const result = []
  for (const l of left) {
    for (const r of right) {
      if (l[leftKey] === r[rightKey]) result.push({ ...l, ...r })
    }
  }
  return result
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `leftJoin(left, right, leftKey, rightKey)`: unlike `innerJoin`, a `left` row with NO match must still appear in the result exactly once, with `item: null` filled in — every left-side row is preserved regardless of whether a match exists.',
        starter: 'function leftJoin(left, right, leftKey, rightKey) {\n  // TODO: unlike innerJoin, a left row with NO match must still appear in\n  // the result once, with the right-side fields (like item) set to null\n  const result = []\n  for (const l of left) {\n    for (const r of right) {\n      if (l[leftKey] === r[rightKey]) result.push({ ...l, ...r })\n    }\n  }\n  return result\n}',
        tests: `
const customers = [{id:1,name:'Alice'},{id:2,name:'Bob'},{id:3,name:'Carol'}]
const orders = [{id:101,customerId:1,item:'Book'},{id:102,customerId:1,item:'Pen'},{id:103,customerId:2,item:'Mug'}]
const result = leftJoin(customers, orders, 'id', 'customerId')
assert result.length === 4
const carolRow = result.find(r => r.name === 'Carol')
assert carolRow.item === null
`,
        solution: `function leftJoin(left, right, leftKey, rightKey) {
  const result = []
  for (const l of left) {
    const matches = right.filter(r => r[rightKey] === l[leftKey])
    if (matches.length === 0) result.push({ ...l, item: null })
    else matches.forEach(r => result.push({ ...l, ...r }))
  }
  return result
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `safeInnerJoin(left, right, leftKey, rightKey)`: same as `innerJoin`, but THROW first if `leftKey`\'s values aren\'t unique across `left` — joining on a non-unique column (like a name instead of an id) silently pairs unrelated rows together, so this refuses to even attempt it.',
        starter: '',
        tests: `
const uniqueCustomers = [{id:1,name:'Alice'},{id:2,name:'Bob'}]
const orders = [{id:101,customerId:1,item:'Book'}]
assert safeInnerJoin(uniqueCustomers, orders, 'id', 'customerId').length === 1
const duplicateNamedCustomers = [{name:'Alice', region:'East'},{name:'Alice', region:'West'}]
const ordersByName = [{customerName:'Alice', item:'Book'}]
let threw = false
try { safeInnerJoin(duplicateNamedCustomers, ordersByName, 'name', 'customerName') } catch (e) { threw = true }
assert threw === true
`,
        solution: `function safeInnerJoin(left, right, leftKey, rightKey) {
  const leftKeys = left.map(l => l[leftKey])
  if (new Set(leftKeys).size !== leftKeys.length) {
    throw new Error('join key "' + leftKey + '" is not unique on the left table')
  }
  const result = []
  for (const l of left) {
    for (const r of right) {
      if (l[leftKey] === r[rightKey]) result.push({ ...l, ...r })
    }
  }
  return result
}`,
      },
    ],
  },
]

export default challenges
