import type { PracticeChallenge } from './loader'

export const title = 'Monads (Haskell)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Write `safeSqrt :: Int -> Maybe Int` returning `Nothing` if `n < 0`, otherwise `Just (floor (sqrt (fromIntegral n)))`. Print `Just 16 >>= safeSqrt`, `Just (-4) >>= safeSqrt`, and the chain `Just 16 >>= safeSqrt >>= \\y -> safeSqrt (y - 20)` — the third chain succeeds at the first step (`Just 4`) but fails at the second (`safeSqrt (-16)`), short-circuiting to `Nothing`.',
        starter: '',
        tests: `
assert output === 'Just 4\\nNothing\\nNothing'
`,
        solution: `safeSqrt :: Int -> Maybe Int
safeSqrt n
  | n < 0 = Nothing
  | otherwise = Just (floor (sqrt (fromIntegral n)))

main :: IO ()
main = do
  print (Just 16 >>= safeSqrt)
  print (Just (-4) >>= safeSqrt)
  print (Just 16 >>= safeSqrt >>= \\y -> safeSqrt (y - 20))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Fix `main`: `result + 1` tries to add directly to `result`, which is `Maybe Int` (not `Int`) — this is a COMPILE ERROR ("No instance for (Num (Maybe Int))"), since you can\'t "escape" a monadic value with an ordinary operator instead of chaining WITHIN it. Replace it with `result >>= \\x -> Just (x + 1)`, staying inside the `Maybe` context.',
        starter: `safeSqrt :: Int -> Maybe Int
safeSqrt n
  | n < 0 = Nothing
  | otherwise = Just (floor (sqrt (fromIntegral n)))

main :: IO ()
main = do
  let result = safeSqrt 16
  print (result + 1)
`,
        tests: `
assert output === 'Just 5'
`,
        solution: `safeSqrt :: Int -> Maybe Int
safeSqrt n
  | n < 0 = Nothing
  | otherwise = Just (floor (sqrt (fromIntegral n)))

main :: IO ()
main = do
  let result = safeSqrt 16
  print (result >>= \\x -> Just (x + 1))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Write `pairs :: [(Int, Int)]` as `[1, 2, 3] >>= \\x -> [10, 20] >>= \\y -> return (x, y)` — the LIST Monad instance of `>>=`, not `Maybe` or `IO`, producing every combination of an element from each list (proving Monads apply well beyond I/O and failure-handling). Print `length pairs` and `pairs` itself.',
        starter: '',
        tests: `
assert output === '6\\n[(1,10),(1,20),(2,10),(2,20),(3,10),(3,20)]'
`,
        solution: `pairs :: [(Int, Int)]
pairs = [1, 2, 3] >>= \\x -> [10, 20] >>= \\y -> return (x, y)

main :: IO ()
main = do
  print (length pairs)
  print pairs
`,
      },
    ],
  },
]

export default challenges
