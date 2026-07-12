---
series: go-fundamentals
level: 4
title: Testing and Go Philosophy
lang: javascript
---

# Testing and Go Philosophy

Go's testing package is part of the standard library. There are no third-party test frameworks in most Go codebases — the language ships with `go test`, table-driven tests, benchmarks, and a race detector out of the box. Testing in Go reflects the same design values as the language itself: explicit, readable, minimal ceremony. By the end of this lesson you will understand how Go tests are structured, why table-driven tests are the idiomatic pattern, how benchmarks work, and how Go's design philosophy unifies all of the language's choices.

## Testing Package — No Magic

Go tests are ordinary functions with a specific name pattern. No annotations, no test classes, no lifecycle hooks.

```javascript
// In real Go:
//   func TestAdd(t *testing.T) {
//     result := Add(2, 3)
//     if result != 5 { t.Errorf("Add(2, 3) = %d; want 5", result) }
//   }
//   // Discovered by go test because name starts with Test and file ends in _test.go

// We simulate testing.T in JavaScript:
function createTestRunner(suiteName) {
  const tests = []
  return {
    test(name, fn) { tests.push({ name, fn }) },
    run() {
      let passed = 0, failed = 0
      for (const { name, fn } of tests) {
        const errors = []
        const t = {
          Errorf(msg, ...args) {
            errors.push(msg.replace(/%[sdvf]/g, () => String(args.shift())))
          },
          Fatal(msg) {
            errors.push(msg)
            throw new Error('fatal: ' + msg)
          },
        }
        try { fn(t) } catch (_) {}
        if (errors.length > 0) {
          console.log(`FAIL ${suiteName}.${name}`)
          errors.forEach(e => console.log('    ', e))
          failed++
        } else {
          console.log(`ok   ${suiteName}.${name}`)
          passed++
        }
      }
      console.log(`\n--- ${passed} passed, ${failed} failed ---`)
    }
  }
}

function add(a, b) { return a + b }
function divide(a, b) {
  if (b === 0) return { value: 0, err: new Error('division by zero') }
  return { value: a / b, err: null }
}

const suite = createTestRunner('mymath')

suite.test('TestAdd', t => {
  const result = add(2, 3)
  if (result !== 5) t.Errorf('Add(2, 3) = %d; want 5', result)
})

suite.test('TestDivideByZero', t => {
  const { value, err } = divide(5, 0)
  if (err === null) t.Fatal('expected an error, got nil')
  if (err.message !== 'division by zero') t.Errorf('err = %s; want division by zero', err.message)
})

suite.run()
```

```text
ok   mymath.TestAdd
ok   mymath.TestDivideByZero

--- 2 passed, 0 failed ---
```

**CS lens:** Go's testing package deliberately provides no `assert` function. This forces you to write explicit error messages: `t.Errorf("processOrder(%v) = %v; want %v", input, got, want)`. Explicit messages make test failures self-documenting — you don't need to re-read the test code to understand what failed. `t.Fatal` vs `t.Error` is a **fail-fast vs fail-slow** choice: use `Fatal` when later assertions would panic on a nil value; use `Error` when independent checks can all run.

## Table-Driven Tests — The Idiomatic Go Pattern

Rather than writing one function per test case, Go programmers group all cases into a slice of structs and loop through them with `t.Run` for subtests.

```javascript
// In real Go:
//   tests := []struct { name string; a, b float64; want float64; wantErr bool }{
//     {"positive", 10, 2, 5.0, false},
//     {"by zero",   5, 0, 0.0, true},
//   }
//   for _, tt := range tests {
//     t.Run(tt.name, func(t *testing.T) { ... })
//   }
//   // Run one subtest: go test -run TestDivide/by_zero

function tableTest(suiteName, cases, testFn) {
  let passed = 0, failed = 0
  for (const tc of cases) {
    const errors = []
    const t = {
      Errorf(msg, ...args) {
        errors.push(msg.replace(/%[sdvf.0-9]*/g, () => String(args.shift())))
      }
    }
    testFn(t, tc)
    const label = `${suiteName}/${tc.name}`
    if (errors.length > 0) {
      console.log(`FAIL ${label}`)
      errors.forEach(e => console.log('    ', e))
      failed++
    } else {
      console.log(`ok   ${label}`)
      passed++
    }
  }
  console.log(`\n--- ${passed} passed, ${failed} failed ---`)
}

const divideTestCases = [
  { name: 'positive',  a: 10,  b: 2,  want: 5,    wantErr: false },
  { name: 'negative',  a: -6,  b: 2,  want: -3,   wantErr: false },
  { name: 'by_zero',   a: 5,   b: 0,  want: 0,    wantErr: true  },
  { name: 'fraction',  a: 1,   b: 4,  want: 0.25, wantErr: false },
]

tableTest('TestDivide', divideTestCases, (t, tc) => {
  const { value, err } = divide(tc.a, tc.b)
  if ((err !== null) !== tc.wantErr) {
    t.Errorf('Divide(%d, %d) error=%v; wantErr=%v', tc.a, tc.b, err, tc.wantErr)
  }
  if (!tc.wantErr && value !== tc.want) {
    t.Errorf('Divide(%d, %d) = %d; want %d', tc.a, tc.b, value, tc.want)
  }
})
```

```text
ok   TestDivide/positive
ok   TestDivide/negative
ok   TestDivide/by_zero
ok   TestDivide/fraction

--- 4 passed, 0 failed ---
```

**SE lens:** Table-driven tests force you to identify the test dimensions upfront: inputs, expected outputs, error conditions. Adding a new test case is one line. Code review of a table-driven test is reviewing a data structure, not an imperative procedure — it is immediately obvious if a case is missing (e.g., no row for `b = -1`). This is why almost all Go standard library code is tested with table-driven tests.

## Benchmarks — Measuring Real Performance

Go's `testing.B` runs the code under test `b.N` times and adjusts `N` until the total measurement is stable (~1 second). This gives reliable ns/op numbers.

```javascript
// In real Go:
//   func BenchmarkSumLoop(b *testing.B) {
//     data := make([]int, 1000)
//     b.ResetTimer()   // exclude setup
//     for i := 0; i < b.N; i++ { sumArray(data) }
//   }
//   // go test -bench=. -benchmem
//   // BenchmarkSumLoop-8   1000000   1234 ns/op   0 B/op   0 allocs/op

function benchmark(name, setupFn, benchFn, iterations = 50000) {
  const state = setupFn()
  const start = performance.now()
  for (let i = 0; i < iterations; i++) benchFn(state)
  const elapsedMs = performance.now() - start
  const nsPerOp = (elapsedMs * 1e6) / iterations
  console.log(`Benchmark${name.padEnd(16)} ${iterations} runs   ${nsPerOp.toFixed(2)} ns/op`)
}

function sumLoop(arr) {
  let s = 0
  for (const n of arr) s += n
  return s
}

function sumReduce(arr) {
  return arr.reduce((acc, n) => acc + n, 0)
}

const arr1000 = Array.from({ length: 1000 }, (_, i) => i)
const arr10000 = Array.from({ length: 10000 }, (_, i) => i)

benchmark('SumLoop1k',    () => arr1000,  a => sumLoop(a))
benchmark('SumReduce1k',  () => arr1000,  a => sumReduce(a))
benchmark('SumLoop10k',   () => arr10000, a => sumLoop(a))
benchmark('SumReduce10k', () => arr10000, a => sumReduce(a))
```

```text
BenchmarkSumLoop1k     50000 runs   X.XX ns/op
BenchmarkSumReduce1k   50000 runs   X.XX ns/op
BenchmarkSumLoop10k    50000 runs   X.XX ns/op
BenchmarkSumReduce10k  50000 runs   X.XX ns/op
```

**SE lens:** In real Go, `-benchmem` shows `B/op` (bytes allocated per operation) and `allocs/op` (allocations per operation). In performance-sensitive Go programs, reducing allocations often matters more than algorithmic changes, because each allocation eventually triggers garbage collection. A zero-allocation hot path is a measurable goal: `0 B/op   0 allocs/op`.

## Go's Philosophy — Explicit Over Clever

All Go design choices follow from one principle:

```javascript
function explainPhilosophy() {
  const axioms = [
    {
      axiom: 'Explicit is better than implicit',
      evidence: ['errors as return values (visible at call site)', 'uppercase = exported (in the name itself)', 'no constructors (NewFoo() is an ordinary function)', 'no magic methods']
    },
    {
      axiom: 'Simple beats clever',
      evidence: ['one for-loop, no forEach/map/comprehension built-in', 'gofmt enforces identical formatting — no debates', 'no ternaries', 'no macros — what you read is what compiles']
    },
    {
      axiom: 'Reader over writer',
      evidence: ['long clear names (errConnectionRefused not e)', 'imports must be used (unused = compile error)', 'if/else always shows both branches', 'left-to-right, top-to-bottom control flow — no hidden jumps']
    },
    {
      axiom: 'Complexity is multiplicative (Rob Pike)',
      evidence: ['each feature interacts with every other feature', 'N features → N² potential interactions', 'smaller language → faster onboarding → less tribal knowledge required']
    },
  ]

  for (const { axiom, evidence } of axioms) {
    console.log(`Axiom: "${axiom}"`)
    evidence.forEach(e => console.log(`  · ${e}`))
  }
}

explainPhilosophy()
```

```text
Axiom: "Explicit is better than implicit"
  · errors as return values (visible at call site)
  · uppercase = exported (in the name itself)
  · no constructors (NewFoo() is an ordinary function)
  · no magic methods
Axiom: "Simple beats clever"
  · one for-loop, no forEach/map/comprehension built-in
  · gofmt enforces identical formatting — no debates
  · no ternaries
  · no macros — what you read is what compiles
Axiom: "Reader over writer"
  · long clear names (errConnectionRefused not e)
  · imports must be used (unused = compile error)
  · if/else always shows both branches
  · left-to-right, top-to-bottom control flow — no hidden jumps
Axiom: "Complexity is multiplicative (Rob Pike)"
  · each feature interacts with every other feature
  · N features → N² potential interactions
  · smaller language → faster onboarding → less tribal knowledge required
```

**CS lens:** The Go team measures success by **time to productivity for a new team member** — not by language benchmark rankings or expressiveness. This is why Go code feels more verbose than Python or Haskell: the writer does more work so the reader does less. A Go codebase can be read by anyone with a week of Go experience; a Haskell or Scala codebase requires months to fully understand even with language expertise.

## Non-Usage

- **Not Go**: when you need fine-grained memory control (Rust), heavy data science (Python/NumPy), browser runtime (JavaScript), or mobile (Swift/Kotlin)
- **Not Go**: scripts under ~50 lines — Python's interpreted startup is acceptable, and Go compilation is overkill
- **Not Go**: when your problem is inherently mathematical or needs a theorem prover

## Challenge: mini_test_framework

Implement a miniature table-driven test runner.

`createTestFramework()` — returns an object with:
- `.test(name, fn)` — registers a test; `fn` receives a `t` object with:
  - `t.ok(condition, msg)` — marks fail with `msg` if `condition` is falsy
  - `t.equals(a, b, msg)` — marks fail if `a !== b`, with a message including both values
- `.run()` — runs all tests; returns `{ passed: number, failed: number, results: Array<{ name: string, passed: boolean, errors: string[] }> }`

```challenge
function createTestFramework() {
  return {
    test(name, fn) {},
    run() {
      return { passed: 0, failed: 0, results: [] }
    },
  }
}
```

```test
const fw = createTestFramework()
fw.test('addition', t => { t.ok(1 + 1 === 2, '1+1 should be 2') })
fw.test('strings',  t => { t.equals('hello', 'hello', 'strings match') })
fw.test('failing',  t => { t.ok(false, 'this should fail') })
const result = fw.run()
assert result.passed === 2
assert result.failed === 1
assert result.results.length === 3
assert result.results[0].name === 'addition'
assert result.results[0].passed === true
assert result.results[2].passed === false
assert result.results[2].errors.length > 0
```
