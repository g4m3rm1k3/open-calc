import type { PracticeChallenge } from './loader'

export const title = 'Merge Conflicts'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `threeWayMerge(ancestorLine, branchALine, branchBLine)`. If BOTH branches changed the line differently from the ancestor AND from each other, return `{ conflict: true, markers }`; otherwise return `{ conflict: false, result }` with whichever side actually changed (or the unchanged ancestor).',
        starter: '',
        tests: `
assert threeWayMerge('Hello', 'Hello there', 'Hi').conflict === true
assert threeWayMerge('Hello', 'Hello there', 'Hello').conflict === false
assert threeWayMerge('Hello', 'Hello there', 'Hello').result === 'Hello there'
`,
        solution: `function threeWayMerge(ancestorLine, branchALine, branchBLine) {
  const aChanged = branchALine !== ancestorLine
  const bChanged = branchBLine !== ancestorLine
  if (aChanged && bChanged && branchALine !== branchBLine) {
    return { conflict: true, markers: '<<<<<<< A\\n' + branchALine + '\\n=======\\n' + branchBLine + '\\n>>>>>>> B' }
  }
  if (aChanged) return { conflict: false, result: branchALine }
  if (bChanged) return { conflict: false, result: branchBLine }
  return { conflict: false, result: ancestorLine }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `mergeFile(ancestorLines, aLines, bLines)`: run `threeWayMerge` line-by-line across the whole file, using each line\'s ancestor/A/B versions. Two branches changing DIFFERENT lines must merge cleanly with no conflict — only touching the exact same line differently triggers one.',
        starter: `function threeWayMerge(ancestorLine, branchALine, branchBLine) {
  const aChanged = branchALine !== ancestorLine
  const bChanged = branchBLine !== ancestorLine
  if (aChanged && bChanged && branchALine !== branchBLine) {
    return { conflict: true, markers: '<<<<<<< A\\n' + branchALine + '\\n=======\\n' + branchBLine + '\\n>>>>>>> B' }
  }
  if (aChanged) return { conflict: false, result: branchALine }
  if (bChanged) return { conflict: false, result: branchBLine }
  return { conflict: false, result: ancestorLine }
}
function mergeFile(ancestorLines, aLines, bLines) {
  // TODO: run threeWayMerge line-by-line across the whole file, using each
  // line's ancestor/A/B versions — not just always taking A's lines
  return aLines.map(line => ({ conflict: false, result: line }))
}`,
        tests: `
const ancestor = ['Hello', 'World']
const a = ['Hello there', 'World']
const b = ['Hello', 'Earth']
const result = mergeFile(ancestor, a, b)
assert result[0].conflict === false
assert result[0].result === 'Hello there'
assert result[1].conflict === false
assert result[1].result === 'Earth'
`,
        solution: `function threeWayMerge(ancestorLine, branchALine, branchBLine) {
  const aChanged = branchALine !== ancestorLine
  const bChanged = branchBLine !== ancestorLine
  if (aChanged && bChanged && branchALine !== branchBLine) {
    return { conflict: true, markers: '<<<<<<< A\\n' + branchALine + '\\n=======\\n' + branchBLine + '\\n>>>>>>> B' }
  }
  if (aChanged) return { conflict: false, result: branchALine }
  if (bChanged) return { conflict: false, result: branchBLine }
  return { conflict: false, result: ancestorLine }
}
function mergeFile(ancestorLines, aLines, bLines) {
  return ancestorLines.map((line, i) => threeWayMerge(line, aLines[i], bLines[i]))
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `resolveConflict(conflictResult, resolvedLine)`: if `conflictResult.conflict` is `false`, return its already-resolved `result` unchanged; otherwise return `resolvedLine` — the human-provided resolution, with no conflict markers left behind in the final output.',
        starter: '',
        tests: `
const conflict = threeWayMerge('Hello', 'Hello there', 'Hi')
const resolved = resolveConflict(conflict, 'Hello there, Hi!')
assert resolved === 'Hello there, Hi!'
assert resolved.includes('<<<<<<<') === false
const clean = threeWayMerge('Hello', 'Hello there', 'Hello')
assert resolveConflict(clean, 'ignored') === 'Hello there'
`,
        solution: `function threeWayMerge(ancestorLine, branchALine, branchBLine) {
  const aChanged = branchALine !== ancestorLine
  const bChanged = branchBLine !== ancestorLine
  if (aChanged && bChanged && branchALine !== branchBLine) {
    return { conflict: true, markers: '<<<<<<< A\\n' + branchALine + '\\n=======\\n' + branchBLine + '\\n>>>>>>> B' }
  }
  if (aChanged) return { conflict: false, result: branchALine }
  if (bChanged) return { conflict: false, result: branchBLine }
  return { conflict: false, result: ancestorLine }
}
function resolveConflict(conflictResult, resolvedLine) {
  if (!conflictResult.conflict) return conflictResult.result
  return resolvedLine
}`,
      },
    ],
  },
]

export default challenges
