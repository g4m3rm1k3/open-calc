import type { PracticeChallenge } from './loader'

export const title = 'Explicit Error Handling (Go)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write `func safeDivide(a, b int) (int, error)` returning `errors.New("cannot divide by zero")` when `b` is 0, otherwise `a / b, nil`. In `main`, call it with `(20, 4)` then `(20, 0)`, each time checking `if err != nil` and printing either `"error: " + err` or `"result: " + result`.',
        starter: '',
        tests: `
assert output === 'result: 5\\nerror: cannot divide by zero'
`,
        solution: `package main

import (
	"errors"
	"fmt"
)

func safeDivide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("cannot divide by zero")
	}
	return a / b, nil
}

func main() {
	result, err := safeDivide(20, 4)
	if err != nil {
		fmt.Println("error:", err)
	} else {
		fmt.Println("result:", result)
	}

	result, err = safeDivide(20, 0)
	if err != nil {
		fmt.Println("error:", err)
	} else {
		fmt.Println("result:", result)
	}
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Fix `main`: it calls `age, _ := parseAge("abc")`, silently discarding the error with `_` — since `parseAge` still returns `0` on failure, this prints the misleading `"age: 0"` as if it were a real result. Capture the error as `err` instead, check `if err != nil`, and print `"error: " + err` (returning immediately) instead of falling through to the success print.',
        starter: `package main

import (
	"errors"
	"fmt"
)

func parseAge(input string) (int, error) {
	if input == "abc" {
		return 0, errors.New("invalid age")
	}
	return 42, nil
}

func main() {
	age, _ := parseAge("abc")
	fmt.Println("age:", age)
}`,
        tests: `
assert output === 'error: invalid age'
`,
        solution: `package main

import (
	"errors"
	"fmt"
)

func parseAge(input string) (int, error) {
	if input == "abc" {
		return 0, errors.New("invalid age")
	}
	return 42, nil
}

func main() {
	age, err := parseAge("abc")
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	fmt.Println("age:", age)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write `func step1(x int) (int, error)` (errors `"step1: negative input"` if `x < 0`, else returns `x + 1, nil`) and `func step2(x int) (int, error)` (errors `"step2: too large"` if `x > 100`, else returns `x * 2, nil`). Write `func process(x int) (int, error)` that calls `step1`, explicitly checks its error and returns early if present, then does the same for `step2` on `step1`\'s result. In `main`, loop over `[5, -1, 100]`, printing `"result: N"` or `"error: ..."` for each.',
        starter: '',
        tests: `
assert output === 'result: 12\\nerror: step1: negative input\\nerror: step2: too large'
`,
        solution: `package main

import (
	"errors"
	"fmt"
)

func step1(x int) (int, error) {
	if x < 0 {
		return 0, errors.New("step1: negative input")
	}
	return x + 1, nil
}

func step2(x int) (int, error) {
	if x > 100 {
		return 0, errors.New("step2: too large")
	}
	return x * 2, nil
}

func process(x int) (int, error) {
	r1, err := step1(x)
	if err != nil {
		return 0, err
	}
	r2, err := step2(r1)
	if err != nil {
		return 0, err
	}
	return r2, nil
}

func main() {
	for _, input := range []int{5, -1, 100} {
		result, err := process(input)
		if err != nil {
			fmt.Println("error:", err)
		} else {
			fmt.Println("result:", result)
		}
	}
}`,
      },
    ],
  },
]

export default challenges
