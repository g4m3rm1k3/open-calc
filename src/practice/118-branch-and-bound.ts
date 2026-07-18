import type { PracticeChallenge } from './loader'

export const title = 'Branch and Bound'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `branchAndBoundMinCost(partialCost, remainingBoundEstimate, bestSoFar)` returning `{ pruned }`. Compute the optimistic total (`partialCost + remainingBoundEstimate`); if it\'s `>= bestSoFar`, this branch can\'t possibly win, so `pruned` is `true`.',
        starter: '',
        tests: `
assert branchAndBoundMinCost(50, 40, 100).pruned === false
assert branchAndBoundMinCost(70, 40, 100).pruned === true
`,
        solution: `function branchAndBoundMinCost(partialCost, remainingBoundEstimate, bestSoFar) {
  const optimisticTotal = partialCost + remainingBoundEstimate
  if (optimisticTotal >= bestSoFar) {
    return { pruned: true }
  }
  return { pruned: false }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `remainingBound(index, currentValue)` inside `knapsackBranchAndBound`: it must return `currentValue` PLUS the value of every remaining item (`index..end`) — an optimistic best case. Ignoring the remaining items makes the bound too tight, incorrectly pruning branches that could still win and silently producing the WRONG (too low) optimal value.',
        starter: 'function knapsackBranchAndBound(items, capacity) {\n  let best = 0\n  function remainingBound(index, currentValue) {\n    // TODO: this bound must account for the value of every REMAINING item\n    // (index..end), an optimistic best case — ignoring them makes the bound\n    // too tight, incorrectly pruning branches that could still win\n    return currentValue\n  }\n  function search(index, currentWeight, currentValue) {\n    if (currentValue > best) best = currentValue\n    if (index === items.length) return\n    if (remainingBound(index, currentValue) <= best) return\n    if (currentWeight + items[index].weight <= capacity) {\n      search(index + 1, currentWeight + items[index].weight, currentValue + items[index].value)\n    }\n    search(index + 1, currentWeight, currentValue)\n  }\n  search(0, 0, 0)\n  return best\n}',
        tests: `
const items = [{weight:2,value:3},{weight:3,value:4},{weight:4,value:5},{weight:5,value:6}]
assert knapsackBranchAndBound(items, 5) === 7
`,
        solution: `function knapsackBranchAndBound(items, capacity) {
  let best = 0
  function remainingBound(index, currentValue) {
    let bound = currentValue
    for (let i = index; i < items.length; i++) bound += items[i].value
    return bound
  }
  function search(index, currentWeight, currentValue) {
    if (currentValue > best) best = currentValue
    if (index === items.length) return
    if (remainingBound(index, currentValue) <= best) return
    if (currentWeight + items[index].weight <= capacity) {
      search(index + 1, currentWeight + items[index].weight, currentValue + items[index].value)
    }
    search(index + 1, currentWeight, currentValue)
  }
  search(0, 0, 0)
  return best
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `knapsackWithSelection(items, capacity)` returning `{ value, selected }` — same branch-and-bound search as before, but also tracking WHICH item indices make up the best solution found, snapshotting the current selection every time a new best is recorded.',
        starter: '',
        tests: `
const items = [{weight:2,value:3},{weight:3,value:4},{weight:4,value:5},{weight:5,value:6}]
const result = knapsackWithSelection(items, 5)
assert result.value === 7
assert JSON.stringify([...result.selected].sort()) === JSON.stringify([0,1])
`,
        solution: `function knapsackWithSelection(items, capacity) {
  let best = { value: 0, selected: [] }
  function remainingBound(index, currentValue) {
    let bound = currentValue
    for (let i = index; i < items.length; i++) bound += items[i].value
    return bound
  }
  function search(index, currentWeight, currentValue, chosen) {
    if (currentValue > best.value) best = { value: currentValue, selected: [...chosen] }
    if (index === items.length) return
    if (remainingBound(index, currentValue) <= best.value) return
    if (currentWeight + items[index].weight <= capacity) {
      chosen.push(index)
      search(index + 1, currentWeight + items[index].weight, currentValue + items[index].value, chosen)
      chosen.pop()
    }
    search(index + 1, currentWeight, currentValue, chosen)
  }
  search(0, 0, 0, [])
  return best
}`,
      },
    ],
  },
]

export default challenges
