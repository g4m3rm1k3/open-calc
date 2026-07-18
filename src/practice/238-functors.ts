import type { PracticeChallenge } from './loader'

export const title = 'Functors (Haskell)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Print `fmap (*3) (Just 4)`, `fmap (*3) (Nothing :: Maybe Int)`, `fmap (+10) [1, 2, 3, 4]`, and `(*3) <$> Just 4` — confirming `<$>` is just `fmap` used infix, and that `fmap` applies the function inside a `Just`/list but leaves `Nothing` untouched.',
        starter: '',
        tests: `
assert output === 'Just 12\\nNothing\\n[11,12,13,14]\\nJust 12'
`,
        solution: `main :: IO ()
main = do
  print (fmap (*3) (Just 4))
  print (fmap (*3) (Nothing :: Maybe Int))
  print (fmap (+10) [1, 2, 3, 4])
  print ((*3) <$> Just 4)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Fix `main`: `doubleMaybe` is a hand-written pattern match that only handles `Just x`, missing a case for `Nothing` — calling `doubleMaybe Nothing` crashes at RUNTIME with "Non-exhaustive patterns in function doubleMaybe". Delete `doubleMaybe` entirely and use `fmap (*2)` directly instead, which generically and correctly handles BOTH `Just` and `Nothing` without needing hand-written pattern matching.',
        starter: `doubleMaybe :: Maybe Int -> Maybe Int
doubleMaybe (Just x) = Just (x * 2)

main :: IO ()
main = do
  print (doubleMaybe (Just 5))
  print (doubleMaybe Nothing)
`,
        tests: `
assert output === 'Just 10\\nNothing'
`,
        solution: `main :: IO ()
main = do
  print (fmap (*2) (Just 5))
  print (fmap (*2) (Nothing :: Maybe Int))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Print `fmap (*2) ([] :: [Int])` (an empty list — nothing to map over, so it stays `[]`) and `fmap (*2) [5, 10]`. Then, demonstrating that `IO` is ALSO a Functor: `result <- fmap (+1) (return 41 :: IO Int)`, and print `result`.',
        starter: '',
        tests: `
assert output === '[]\\n[10,20]\\n42'
`,
        solution: `main :: IO ()
main = do
  print (fmap (*2) ([] :: [Int]))
  print (fmap (*2) [5, 10])
  result <- fmap (+1) (return 41 :: IO Int)
  print result
`,
      },
    ],
  },
]

export default challenges
