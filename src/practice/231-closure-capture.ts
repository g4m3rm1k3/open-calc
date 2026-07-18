import type { PracticeChallenge } from './loader'

export const title = 'Closure Capture (Swift)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Write `makeAccumulator() -> (Int) -> Int` with a local `var total = 0`, returning a closure `{ amount in total += amount; return total }` — the closure captures `total` by reference, keeping it alive across calls even after `makeAccumulator` itself has returned. Call `accumulate(10)`, `accumulate(5)`, `accumulate(20)`, printing each result.',
        starter: '',
        tests: `
assert output === '10\\n15\\n35'
`,
        solution: `func makeAccumulator() -> (Int) -> Int {
    var total = 0
    return { amount in
        total += amount
        return total
    }
}

let accumulate = makeAccumulator()
print(accumulate(10))
print(accumulate(5))
print(accumulate(20))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Fix `Counter`: `onIncrement`\'s closure captures `self` STRONGLY, and `self` (via the `onIncrement` property) holds a strong reference right back — a RETAIN CYCLE. Even after `run()` returns and its local `counter` goes out of scope, neither object can ever be deallocated, so `deinit`\'s `"Counter deallocated"` never prints. Add a `[weak self]` capture list to the closure, and use `self?.count` / `if let self = self` inside it — this breaks the cycle, letting `counter` deallocate the instant `run()` returns.',
        starter: `class Counter {
    var count = 0
    var onIncrement: (() -> Void)?

    func start() {
        onIncrement = {
            self.count += 1
            print("count is now \\(self.count)")
        }
    }

    deinit {
        print("Counter deallocated")
    }
}

func run() {
    let counter = Counter()
    counter.start()
    counter.onIncrement?()
}

run()
print("after run()")
`,
        tests: `
assert output === 'count is now 1\\nCounter deallocated\\nafter run()'
`,
        solution: `class Counter {
    var count = 0
    var onIncrement: (() -> Void)?

    func start() {
        onIncrement = { [weak self] in
            self?.count += 1
            if let self = self {
                print("count is now \\(self.count)")
            }
        }
    }

    deinit {
        print("Counter deallocated")
    }
}

func run() {
    let counter = Counter()
    counter.start()
    counter.onIncrement?()
}

run()
print("after run()")
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Using the same `makeCounter() -> () -> Int` pattern (a local `var count = 0`, returning `{ count += 1; return count }`), create TWO SEPARATE closures: `let counterA = makeCounter()` and `let counterB = makeCounter()` — each call to `makeCounter()` captures its OWN independent `count`. Call `counterA()` twice, `counterB()` once, `counterA()` again, `counterB()` again, printing each result — confirming the two closures never share state.',
        starter: '',
        tests: `
assert output === '1\\n2\\n1\\n3\\n2'
`,
        solution: `func makeCounter() -> () -> Int {
    var count = 0
    return {
        count += 1
        return count
    }
}

let counterA = makeCounter()
let counterB = makeCounter()

print(counterA())
print(counterA())
print(counterB())
print(counterA())
print(counterB())
`,
      },
    ],
  },
]

export default challenges
