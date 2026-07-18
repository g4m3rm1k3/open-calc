import type { PracticeChallenge } from './loader'

export const title = 'Lazy Evaluation (Haskell)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Write `naturals :: [Integer]` as the infinite list `[1..]`. Print `take 4 naturals`. Print `take 3 (filter (\\x -> x \`mod\` 3 == 0) naturals)` — laziness means only enough of the infinite list is evaluated to find 3 multiples of 3, without ever hanging.',
        starter: '',
        tests: `
assert output === '[1,2,3,4]\\n[3,6,9]'
`,
        solution: `naturals :: [Integer]
naturals = [1..]

main :: IO ()
main = do
  print (take 4 naturals)
  print (take 3 (filter (\\x -> x \`mod\` 3 == 0) naturals))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Fix `main`: `badList = [1, 2, error "boom"]` is fine to DEFINE (nothing is evaluated yet), but `sum badList` needs EVERY element to compute a total, forcing the `error "boom"` thunk and crashing at runtime. Change it to `sum (take 2 badList)`, which only ever forces the first 2 elements, never touching the erroring third one.',
        starter: `badList :: [Int]
badList = [1, 2, error "boom"]

main :: IO ()
main = do
  print (sum badList)
`,
        tests: `
assert output === '3'
`,
        solution: `badList :: [Int]
badList = [1, 2, error "boom"]

main :: IO ()
main = do
  print (sum (take 2 badList))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Write `fibs :: [Integer]` as the SELF-REFERENTIAL infinite list `0 : 1 : zipWith (+) fibs (tail fibs)` — a classic laziness showcase impossible to define this way in a strict language, since `fibs` refers to ITSELF while still being built. Print `take 10 fibs`.',
        starter: '',
        tests: `
assert output === '[0,1,1,2,3,5,8,13,21,34]'
`,
        solution: `fibs :: [Integer]
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)

main :: IO ()
main = do
  print (take 10 fibs)
`,
      },
    ],
  },
]

export default challenges
