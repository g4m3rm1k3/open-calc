import type { PracticeChallenge } from './loader'

export const title = 'Data Frames (R)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'r-program',
        prompt: 'Create `df <- data.frame(name = c("Sam", "Nina", "Tom"), score = c(72, 88, 95), passed = c(FALSE, TRUE, TRUE))`. Print `df$score` (a plain numeric vector). Filter with `top <- df[df$score > 80, ]` and print it (ALL columns kept, for matching rows only). Add a new column `df$grade <- ifelse(df$score >= 90, "A", "B")` (computed via vectorized comparison, no loop) and print the whole `df`.',
        starter: '',
        tests: `
assert output === '[1] 72 88 95\\n  name score passed\\n2 Nina    88   TRUE\\n3  Tom    95   TRUE\\n  name score passed grade\\n1  Sam    72  FALSE     B\\n2 Nina    88   TRUE     B\\n3  Tom    95   TRUE     A'
`,
        solution: `df <- data.frame(name = c("Sam", "Nina", "Tom"), score = c(72, 88, 95), passed = c(FALSE, TRUE, TRUE))

print(df$score)

top <- df[df$score > 80, ]
print(top)

df$grade <- ifelse(df$score >= 90, "A", "B")
print(df)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'r-program',
        prompt: 'Fix `main`: `df["score"]` extracts the `score` column but KEEPS it as a one-column DATA FRAME, not a bare numeric vector — passing that into `mean()` silently produces `NA` instead of the actual average. Change `df["score"]` to `df$score`, which correctly extracts a plain vector `mean()` can compute over.',
        starter: `df <- data.frame(name = c("Sam", "Nina"), score = c(72, 88))
cat("Average score:", mean(df["score"]), "\\n")
`,
        tests: `
assert output === 'Average score: 80'
`,
        solution: `df <- data.frame(name = c("Sam", "Nina"), score = c(72, 88))
cat("Average score:", mean(df$score), "\\n")
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'r-program',
        prompt: 'Create `df` with `name` and `score` columns for four students (`72, 88, 95, 61`). Add `df$grade` via a nested `ifelse` (`"A"` for `>=90`, `"B"` for `>=70`, else `"C"`) and print the full `df`. Filter to `topStudents <- df[df$grade == "A", ]` (filtering on the NEWLY-COMPUTED column) and print `topStudents$name`. Compute and print `mean(df$score)`.',
        starter: '',
        tests: `
assert output === '  name score grade\\n1  Sam    72     B\\n2 Nina    88     B\\n3  Tom    95     A\\n4  Amy    61     C\\n[1] "Tom"\\n[1] 79'
`,
        solution: `df <- data.frame(name = c("Sam", "Nina", "Tom", "Amy"), score = c(72, 88, 95, 61))

df$grade <- ifelse(df$score >= 90, "A", ifelse(df$score >= 70, "B", "C"))
print(df)

topStudents <- df[df$grade == "A", ]
print(topStudents$name)

avgScore <- mean(df$score)
print(avgScore)
`,
      },
    ],
  },
]

export default challenges
