import type { PracticeChallenge } from './loader'

export const title = 'Goroutines (Go)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write `func sayHello(wg *sync.WaitGroup)` (deferred `wg.Done()`, then prints `"hello from goroutine"`). In `main`, use a `sync.WaitGroup`: `Add(1)`, start `sayHello` with `go`, `Wait()`, then print `"goroutine has finished"` — `Wait()` guarantees the goroutine\'s print happens first.',
        starter: '',
        tests: `
assert output === 'hello from goroutine\\ngoroutine has finished'
`,
        solution: `package main

import (
	"fmt"
	"sync"
)

func sayHello(wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Println("hello from goroutine")
}

func main() {
	var wg sync.WaitGroup
	wg.Add(1)
	go sayHello(&wg)
	wg.Wait()
	fmt.Println("goroutine has finished")
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Fix `main`: it\'s missing `wg.Add(1)` before starting the goroutine — without it, the WaitGroup\'s internal counter is still `0` when the goroutine calls `wg.Done()`, which PANICS ("negative WaitGroup counter"). Add `wg.Add(1)` before `go sayHello(&wg)`.',
        starter: `package main

import (
	"fmt"
	"sync"
)

func sayHello(wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Println("hello from goroutine")
}

func main() {
	var wg sync.WaitGroup
	go sayHello(&wg)
	wg.Wait()
	fmt.Println("done")
}`,
        tests: `
assert output === 'hello from goroutine\\ndone'
`,
        solution: `package main

import (
	"fmt"
	"sync"
)

func sayHello(wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Println("hello from goroutine")
}

func main() {
	var wg sync.WaitGroup
	wg.Add(1)
	go sayHello(&wg)
	wg.Wait()
	fmt.Println("done")
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write a program that launches 5 goroutines, each incrementing a shared `counter` protected by a `sync.Mutex`, using a `sync.WaitGroup` to wait for all 5 to finish before printing the final `counter` value — correct regardless of the actual scheduling order the goroutines run in.',
        starter: '',
        tests: `
assert output === '5'
`,
        solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	var mu sync.Mutex
	counter := 0

	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			mu.Lock()
			counter++
			mu.Unlock()
		}()
	}

	wg.Wait()
	fmt.Println(counter)
}`,
      },
    ],
  },
]

export default challenges
