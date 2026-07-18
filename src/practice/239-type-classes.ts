import type { PracticeChallenge } from './loader'

export const title = 'Type Classes (Haskell)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Write `class Soundable a where sound :: a -> String`. Write `data Instrument = Drum | Guitar` and `instance Soundable Instrument` (`sound Drum = "Boom"`, `sound Guitar = "Strum"`). Write `play :: Soundable a => a -> String` returning `"Playing: " ++ sound x`. Call `play Drum` and `play Guitar`.',
        starter: '',
        tests: `
assert output === 'Playing: Boom\\nPlaying: Strum'
`,
        solution: `class Soundable a where
  sound :: a -> String

data Instrument = Drum | Guitar

instance Soundable Instrument where
  sound Drum = "Boom"
  sound Guitar = "Strum"

play :: Soundable a => a -> String
play x = "Playing: " ++ sound x

main :: IO ()
main = do
  putStrLn (play Drum)
  putStrLn (play Guitar)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Fix `play`: its type signature is `play :: a -> String`, with NO `Soundable a =>` constraint — calling `sound x` inside it is then a COMPILE ERROR ("No instance for (Soundable a)"), since the compiler has no guarantee `a` supports `sound` at all. Add the constraint: `play :: Soundable a => a -> String`.',
        starter: `class Soundable a where
  sound :: a -> String

data Instrument = Drum | Guitar

instance Soundable Instrument where
  sound Drum = "Boom"
  sound Guitar = "Strum"

play :: a -> String
play x = "Playing: " ++ sound x

main :: IO ()
main = do
  putStrLn (play Drum)
`,
        tests: `
assert output === 'Playing: Boom'
`,
        solution: `class Soundable a where
  sound :: a -> String

data Instrument = Drum | Guitar

instance Soundable Instrument where
  sound Drum = "Boom"
  sound Guitar = "Strum"

play :: Soundable a => a -> String
play x = "Playing: " ++ sound x

main :: IO ()
main = do
  putStrLn (play Drum)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'haskell-program',
        prompt: 'Write `class Describable a where describe :: a -> String`. Write `data Animal = Dog | Cat deriving (Eq, Show)` (AUTO-DERIVED, no hand-written boilerplate) and a completely UNRELATED `data Vehicle = Car | Bike` — make BOTH instances of `Describable`. Write the SAME generic `announce :: Describable a => a -> String` (`"Behold: " ++ describe x`) and call it with BOTH `Dog` and `Car`. Print `Dog == Dog`, `Dog == Cat` (both via the derived `Eq`), and `Dog` itself (via the derived `Show`).',
        starter: '',
        tests: `
assert output === 'Behold: a dog\\nBehold: a car\\nTrue\\nFalse\\nDog'
`,
        solution: `class Describable a where
  describe :: a -> String

data Animal = Dog | Cat deriving (Eq, Show)
data Vehicle = Car | Bike

instance Describable Animal where
  describe Dog = "a dog"
  describe Cat = "a cat"

instance Describable Vehicle where
  describe Car = "a car"
  describe Bike = "a bike"

announce :: Describable a => a -> String
announce x = "Behold: " ++ describe x

main :: IO ()
main = do
  putStrLn (announce Dog)
  putStrLn (announce Car)
  print (Dog == Dog)
  print (Dog == Cat)
  print Dog
`,
      },
    ],
  },
]

export default challenges
