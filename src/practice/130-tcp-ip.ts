import type { PracticeChallenge } from './loader'

export const title = 'TCP/IP'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `reassembleInOrder(receivedPackets, expectedCount)`, each packet `{ seq, data }`. If any sequence number `1..expectedCount` is missing, return `{ complete: false, missing }`; otherwise return `{ complete: true, data }` with the pieces joined IN SEQUENCE ORDER, regardless of arrival order.',
        starter: '',
        tests: `
const arrived = [{seq:1,data:'A'},{seq:3,data:'C'}]
assert JSON.stringify(reassembleInOrder(arrived, 3)) === JSON.stringify({complete:false, missing:[2]})
const complete = [{seq:1,data:'A'},{seq:3,data:'C'},{seq:2,data:'B'}]
assert JSON.stringify(reassembleInOrder(complete, 3)) === JSON.stringify({complete:true, data:'ABC'})
`,
        solution: `function reassembleInOrder(receivedPackets, expectedCount) {
  const bySequence = new Map(receivedPackets.map(p => [p.seq, p.data]))
  const missing = []
  for (let seq = 1; seq <= expectedCount; seq++) {
    if (!bySequence.has(seq)) missing.push(seq)
  }
  if (missing.length > 0) return { complete: false, missing }
  const ordered = []
  for (let seq = 1; seq <= expectedCount; seq++) ordered.push(bySequence.get(seq))
  return { complete: true, data: ordered.join('') }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `findMissingSequences(receivedPackets, expectedCount)`: it must collect EVERY missing sequence number in `1..expectedCount`, not stop and return after finding just the first one.',
        starter: 'function findMissingSequences(receivedPackets, expectedCount) {\n  const seen = new Set(receivedPackets.map(p => p.seq))\n  const missing = []\n  for (let seq = 1; seq <= expectedCount; seq++) {\n    // TODO: collect EVERY missing sequence number, not just the first one found\n    if (!seen.has(seq)) return [seq]\n  }\n  return missing\n}',
        tests: `
const arrived = [{seq:1,data:'A'},{seq:4,data:'D'}]
assert JSON.stringify(findMissingSequences(arrived, 4)) === JSON.stringify([2,3])
`,
        solution: `function findMissingSequences(receivedPackets, expectedCount) {
  const seen = new Set(receivedPackets.map(p => p.seq))
  const missing = []
  for (let seq = 1; seq <= expectedCount; seq++) {
    if (!seen.has(seq)) missing.push(seq)
  }
  return missing
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `nextExpectedSeq(receivedSeqs)`, modeling TCP\'s cumulative acknowledgment: return the smallest sequence number NOT yet received starting from `1` — even if LATER sequence numbers have already arrived, the cumulative ack can never advance past the first gap.',
        starter: '',
        tests: `
assert nextExpectedSeq([1,2,3]) === 4
assert nextExpectedSeq([1,3,4]) === 2
assert nextExpectedSeq([]) === 1
`,
        solution: `function nextExpectedSeq(receivedSeqs) {
  const seen = new Set(receivedSeqs)
  let seq = 1
  while (seen.has(seq)) seq++
  return seq
}`,
      },
    ],
  },
]

export default challenges
