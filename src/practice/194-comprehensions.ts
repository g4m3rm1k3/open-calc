import type { PracticeChallenge } from './loader'

export const title = 'Comprehensions (Python)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write a list comprehension `cubes` for `x ** 3` over `range(6)` where `x` is odd, a dict comprehension `word_lengths` mapping each word to its length over `["apple", "kiwi", "fig"]`, and a set comprehension `unique_lengths` of the lengths of `["apple", "kiwi", "fig", "pear"]`. Print `cubes`, `word_lengths`, and `sorted(unique_lengths)`.',
        starter: '',
        tests: `
assert output === "[1, 27, 125]\\n{'apple': 5, 'kiwi': 4, 'fig': 3}\\n[3, 4, 5]"
`,
        solution: `cubes = [x ** 3 for x in range(6) if x % 2 != 0]
word_lengths = {w: len(w) for w in ["apple", "kiwi", "fig"]}
unique_lengths = {len(w) for w in ["apple", "kiwi", "fig", "pear"]}

print(cubes)
print(word_lengths)
print(sorted(unique_lengths))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Fix `flat`: the two `for` clauses in the nested comprehension are in the wrong order — a comprehension\'s `for` clauses run LEFT TO RIGHT, outermost first, so `for x in row` runs before `row` is ever bound by the later `for row in matrix`, raising `NameError: name \'row\' is not defined`. Swap them to `[x for row in matrix for x in row]`, matching an equivalent explicit nested loop (`for row in matrix: for x in row: ...`).',
        starter: `matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for x in row for row in matrix]
print(flat)
`,
        tests: `
assert output === '[1, 2, 3, 4, 5, 6, 7, 8, 9]'
`,
        solution: `matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for row in matrix for x in row]
print(flat)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write a list comprehension `labels` over `numbers = [1, 2, ..., 10]` using a TERNARY conditional INSIDE the expression part (not a filter `if` clause after the `for`) — `"even" if n % 2 == 0 else "odd"` for each `n` — producing exactly one label per input number. This differs from a filter `if`, which would EXCLUDE non-matching elements instead of transforming every one of them. Print `labels`.',
        starter: '',
        tests: `
assert output === "['odd', 'even', 'odd', 'even', 'odd', 'even', 'odd', 'even', 'odd', 'even']"
`,
        solution: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
labels = ["even" if n % 2 == 0 else "odd" for n in numbers]
print(labels)
`,
      },
    ],
  },
]

export default challenges
