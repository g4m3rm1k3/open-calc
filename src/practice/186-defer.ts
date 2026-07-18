import type { PracticeChallenge } from './loader'

export const title = 'Defer (Go)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write `func openResource(name string)` that prints `"opened " + name`, then IMMEDIATELY defers `fmt.Println("closed " + name)`, then prints `"using " + name`. Call `openResource("file.txt")` from `main` — the deferred close only actually runs right before the function returns, after the rest of the body has executed.',
        starter: '',
        tests: `
assert output === 'opened file.txt\\nusing file.txt\\nclosed file.txt'
`,
        solution: `package main

import "fmt"

func openResource(name string) {
	fmt.Println("opened " + name)
	defer fmt.Println("closed " + name)
	fmt.Println("using " + name)
}

func main() {
	openResource("file.txt")
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Fix `process`: the `defer` for releasing the resource is placed AFTER the early-return check, so when `fail` is true, the function returns before that `defer` statement ever executes — the resource never gets released on that path. Move `defer fmt.Println("released resource")` to run immediately after `"acquired resource"` prints, before the `if fail` check, so cleanup happens on every exit path.',
        starter: `package main

import "fmt"

func process(fail bool) {
	fmt.Println("acquired resource")
	if fail {
		fmt.Println("failed, returning early")
		return
	}
	defer fmt.Println("released resource")
	fmt.Println("processing succeeded")
}

func main() {
	process(true)
	fmt.Println("---")
	process(false)
}`,
        tests: `
assert output === 'acquired resource\\nfailed, returning early\\nreleased resource\\n---\\nacquired resource\\nprocessing succeeded\\nreleased resource'
`,
        solution: `package main

import "fmt"

func process(fail bool) {
	fmt.Println("acquired resource")
	defer fmt.Println("released resource")
	if fail {
		fmt.Println("failed, returning early")
		return
	}
	fmt.Println("processing succeeded")
}

func main() {
	process(true)
	fmt.Println("---")
	process(false)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write a `main` that loops `i` from 1 to 3, deferring `fmt.Println("deferred:", i)` on each iteration, then prints `"loop done"` — a deferred call\'s arguments are captured immediately when the `defer` statement runs (not when it finally executes), and the three deferred calls all fire in LIFO order only after the loop and the print statement finish.',
        starter: '',
        tests: `
assert output === 'loop done\\ndeferred: 3\\ndeferred: 2\\ndeferred: 1'
`,
        solution: `package main

import "fmt"

func main() {
	for i := 1; i <= 3; i++ {
		defer fmt.Println("deferred:", i)
	}
	fmt.Println("loop done")
}`,
      },
    ],
  },
]

export default challenges
