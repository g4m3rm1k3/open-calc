import type { PracticeChallenge } from './loader'

export const title = 'Vectorization (R)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'r-program',
        prompt: 'Create `x <- c(2, 4, 6, 8, 10)`. Print `x + 5` (adds to every element, no loop). Print `x > 5` (a vector of booleans, one per element). Print `x[x > 5]` (boolean-indexed filtering). Create `y <- c(1, 1, 1, 1, 1)` and print `x - y` (element-wise, position by position).',
        starter: '',
        tests: `
assert output === '[1]  7  9 11 13 15\\n[1] FALSE FALSE  TRUE  TRUE  TRUE\\n[1]  6  8 10\\n[1] 1 3 5 7 9'
`,
        solution: `x <- c(2, 4, 6, 8, 10)
print(x + 5)
print(x > 5)
print(x[x > 5])

y <- c(1, 1, 1, 1, 1)
print(x - y)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'r-program',
        prompt: 'Fix `main`: it builds `result` with an explicit `for (i in 2:length(x))` loop instead of vectorization — the loop starts at `2`, silently skipping `x[1]` entirely (an off-by-one bug the loop makes easy to introduce), so the first element\'s transformation is missing from `result`. Delete the loop entirely and replace it with the vectorized `result <- x + 5`, which correctly (and more concisely) transforms every element including the first.',
        starter: `x <- c(2, 4, 6, 8, 10)
result <- c()
for (i in 2:length(x)) {
  result <- c(result, x[i] + 5)
}
print(result)
`,
        tests: `
assert output === '[1]  7  9 11 13 15'
`,
        solution: `x <- c(2, 4, 6, 8, 10)
result <- x + 5
print(result)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'r-program',
        prompt: 'Create `scores <- c(55, 82, 91, 40, 67, 78)`. Compute `passing <- scores >= 60` (a boolean vector) and print it. Print `scores[passing]` (filtering scores down to just the passing ones, R\'s idiomatic two-step filter pattern). Compute `bonus <- scores[passing] + 5` (vectorized arithmetic applied to the already-filtered result) and print it.',
        starter: '',
        tests: `
assert output === '[1] FALSE  TRUE  TRUE FALSE  TRUE  TRUE\\n[1] 82 91 67 78\\n[1] 87 96 72 83'
`,
        solution: `scores <- c(55, 82, 91, 40, 67, 78)
passing <- scores >= 60
print(passing)
print(scores[passing])

bonus <- scores[passing] + 5
print(bonus)
`,
      },
    ],
  },
]

export default challenges
