import type { PracticeChallenge } from './loader'

export const title = 'CAP Theorem'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeCPNode()` (refuses reads during a partition — `{ ok: false, reason }`) and `makeAPNode()` (answers anyway with its last-known value, flagged `stale: true`, and refuses new writes while partitioned).',
        starter: '',
        tests: `
const cpNode = makeCPNode()
const apNode = makeAPNode()
assert (cpNode.setPartitioned(true), true)
assert (apNode.setPartitioned(true), true)
assert cpNode.read().ok === false
const apResult = apNode.read()
assert apResult.ok === true
assert apResult.stale === true
`,
        solution: `function makeCPNode() {
  let data = 100
  let partitioned = false
  return {
    setPartitioned(v) { partitioned = v },
    write(value) { data = value },
    read() {
      if (partitioned) return { ok: false, reason: 'unavailable during partition -- consistency preserved' }
      return { ok: true, value: data }
    },
  }
}
function makeAPNode() {
  let data = 100
  let partitioned = false
  return {
    setPartitioned(v) { partitioned = v },
    write(value) { if (!partitioned) data = value },
    read() { return { ok: true, value: data, stale: partitioned } },
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
        prompt: 'Fix `chooseCapStrategy(useCase)`: a banking balance can\'t tolerate showing a wrong number, so it should favor Consistency (`\'CP\'`); a social "like" counter would rather stay up with a slightly-stale count than go down, favoring Availability (`\'AP\'`).',
        starter: 'function chooseCapStrategy(useCase) {\n  // TODO: a banking balance can\'t tolerate showing a wrong number, so it\n  // should favor Consistency (CP); a social "like" counter would rather\n  // stay up with a slightly-stale count than go down, favoring Availability (AP)\n  return \'AP\'\n}',
        tests: `
assert chooseCapStrategy('banking-balance') === 'CP'
assert chooseCapStrategy('social-like-counter') === 'AP'
`,
        solution: `function chooseCapStrategy(useCase) {
  if (useCase === 'banking-balance') return 'CP'
  if (useCase === 'social-like-counter') return 'AP'
  return null
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeSplitBrainPair(initialValue)` returning `{ writeA(value), writeB(value), readA(), readB() }` — two nodes that BOTH keep accepting local writes during a partition (favoring Availability). Confirm that after each side accepts a DIFFERENT write, reading from A and reading from B gives genuinely different answers — the inconsistency AP nodes accept in exchange for never refusing a request.',
        starter: '',
        tests: `
const pair = makeSplitBrainPair(100)
assert (pair.writeA(200), true)
assert (pair.writeB(300), true)
assert pair.readA() === 200
assert pair.readB() === 300
assert pair.readA() !== pair.readB()
`,
        solution: `function makeSplitBrainPair(initialValue) {
  let dataA = initialValue
  let dataB = initialValue
  return {
    writeA(value) { dataA = value },
    writeB(value) { dataB = value },
    readA() { return dataA },
    readB() { return dataB },
  }
}`,
      },
    ],
  },
]

export default challenges
