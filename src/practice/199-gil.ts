import type { PracticeChallenge } from './loader'

export const title = 'The GIL (Python)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write `cpu_bound_work(n, results, idx)` that sums `i * i` for `i in range(n)` into `results[idx]`. Run it in TWO `threading.Thread`s (same `n`, writing to `results[0]` and `results[1]`), `.start()`/`.join()` both. Compare each result against the closed-form `expected = sum(i * i for i in range(n))` and print both comparisons — the GIL serializes the two threads\' bytecode execution, but each still computes the correct total.',
        starter: '',
        tests: `
assert output === 'True\\nTrue'
`,
        solution: `import threading


def cpu_bound_work(n, results, idx):
    total = 0
    for i in range(n):
        total += i * i
    results[idx] = total


results = [None, None]
n = 10000

t1 = threading.Thread(target=cpu_bound_work, args=(n, results, 0))
t2 = threading.Thread(target=cpu_bound_work, args=(n, results, 1))
t1.start()
t2.start()
t1.join()
t2.join()

expected = sum(i * i for i in range(n))
print(results[0] == expected)
print(results[1] == expected)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Fix `cpu_bound_work`: it hardcodes `results[0] = total` instead of `results[idx] = total` — both threads end up writing their (identical) total into the SAME slot, so `results[1]` is silently left `None`. Change the assignment to use `idx`, so each thread writes into its own slot.',
        starter: `import threading


def cpu_bound_work(n, results, idx):
    total = 0
    for i in range(n):
        total += i
    results[0] = total


results = [None, None]
n = 1000

t1 = threading.Thread(target=cpu_bound_work, args=(n, results, 0))
t2 = threading.Thread(target=cpu_bound_work, args=(n, results, 1))
t1.start()
t2.start()
t1.join()
t2.join()

print(results)
`,
        tests: `
assert output === '[499500, 499500]'
`,
        solution: `import threading


def cpu_bound_work(n, results, idx):
    total = 0
    for i in range(n):
        total += i
    results[idx] = total


results = [None, None]
n = 1000

t1 = threading.Thread(target=cpu_bound_work, args=(n, results, 0))
t2 = threading.Thread(target=cpu_bound_work, args=(n, results, 1))
t1.start()
t2.start()
t1.join()
t2.join()

print(results)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write `increment_many(n)` that increments a shared module-level `counter` (`global counter`) `n` times, using `with lock:` (a `threading.Lock()`) around each `counter += 1` — the GIL does NOT make `counter += 1` atomic on its own (it\'s load, add, store as separate steps), so an explicit lock is still required for a genuinely SHARED counter. Run `increment_many(5000)` in two threads, `.join()` both, and print the final `counter` — deterministically `10000`, since the lock serializes every individual increment.',
        starter: '',
        tests: `
assert output === '10000'
`,
        solution: `import threading

counter = 0
lock = threading.Lock()


def increment_many(n):
    global counter
    for _ in range(n):
        with lock:
            counter += 1


n = 5000
t1 = threading.Thread(target=increment_many, args=(n,))
t2 = threading.Thread(target=increment_many, args=(n,))
t1.start()
t2.start()
t1.join()
t2.join()

print(counter)
`,
      },
    ],
  },
]

export default challenges
