import type { PracticeChallenge } from './loader'

export const title = 'SQL Injection'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `vulnerableQuery(users, nameInput)` (simulating naive string concatenation — if `nameInput` contains `\' OR \'1\'=\'1`, return EVERY user) and `parameterizedQuery(users, nameInput)` (always treats `nameInput` as a literal value to match, never as query logic).',
        starter: '',
        tests: `
const users = [{id:1,name:'alice'},{id:2,name:'bob'}]
const attackerInput = "x' OR '1'='1"
assert vulnerableQuery(users, attackerInput).length === 2
assert parameterizedQuery(users, attackerInput).length === 0
`,
        solution: `function vulnerableQuery(users, nameInput) {
  const injected = nameInput.includes("' OR '1'='1")
  return injected ? users : users.filter(u => u.name === nameInput)
}
function parameterizedQuery(users, nameInput) {
  return users.filter(u => u.name === nameInput)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `parameterizedNumericQuery(products, idInput)`: it must ALWAYS compare `idInput` as a literal value, never inspecting its contents for injection-like patterns — a numeric field injection (`\'1 OR 1=1\'`) needs no quotes at all, so "blocking quote characters" wouldn\'t have helped here either.',
        starter: 'function parameterizedNumericQuery(products, idInput) {\n  // TODO: parameterized means ALWAYS comparing idInput as a literal value —\n  // never special-casing or interpreting its contents. A numeric field\n  // injection doesn\'t even need quotes, so "blocking quote characters"\n  // wouldn\'t have helped here either.\n  const injected = idInput.includes(\'OR 1=1\')\n  return injected ? products : products.filter(p => String(p.id) === idInput)\n}',
        tests: `
const products = [{id:1,name:'Widget'},{id:2,name:'Gadget'}]
const attackerInput = '1 OR 1=1'
assert parameterizedNumericQuery(products, attackerInput).length === 0
`,
        solution: `function parameterizedNumericQuery(products, idInput) {
  return products.filter(p => String(p.id) === idInput)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeQueryBuilder(rows)` returning `{ where(field, value), whereRaw(rawCondition) }`. `where` is safe (parameterized, filters by literal equality); `whereRaw` simulates an ORM\'s "raw query" escape hatch, vulnerable to the same injection as string concatenation — even a normally-safe query builder reintroduces the bug once raw text is allowed back in.',
        starter: '',
        tests: `
const users = [{id:1,name:'alice'},{id:2,name:'bob'}]
const attackerInput = "x' OR '1'='1"
const qb = makeQueryBuilder(users)
assert qb.where('name', attackerInput).length === 0
assert qb.whereRaw(attackerInput).length === 2
`,
        solution: `function makeQueryBuilder(rows) {
  return {
    where(field, value) {
      return rows.filter(r => r[field] === value)
    },
    whereRaw(rawCondition) {
      const injected = rawCondition.includes("OR '1'='1")
      return injected ? rows : rows.filter(r => String(r.name) === rawCondition)
    },
  }
}`,
      },
    ],
  },
]

export default challenges
