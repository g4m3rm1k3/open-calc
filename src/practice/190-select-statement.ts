import type { PracticeChallenge } from './loader'

export const title = 'Select Statement (Go)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write a `main` that creates an unbuffered `chan string` and uses `select` to try receiving from it — with a `case msg := <-ch` printing `"received: " + msg`, and a `default` case printing `"no message ready"`. Since nothing ever sends on the channel, `default` makes the check non-blocking instead of waiting forever.',
        starter: '',
        tests: `
assert output === 'no message ready'
`,
        solution: `package main

import "fmt"

func main() {
	ch := make(chan string)

	select {
	case msg := <-ch:
		fmt.Println("received:", msg)
	default:
		fmt.Println("no message ready")
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
        prompt: 'Fix `main`: the `select` waits on `ch` with no `default` case, but nothing ever calls `fetchData` to send on it — since `select` with no ready case and no `default` blocks forever, this deadlocks (`fatal error: all goroutines are asleep`). Add `go fetchData(ch)` before the `select` so something actually sends a value.',
        starter: `package main

import "fmt"

func fetchData(ch chan<- string) {
	ch <- "data ready"
}

func main() {
	ch := make(chan string)

	select {
	case msg := <-ch:
		fmt.Println("received:", msg)
	}
	fmt.Println("done")
}`,
        tests: `
assert output === 'received: data ready\\ndone'
`,
        solution: `package main

import "fmt"

func fetchData(ch chan<- string) {
	ch <- "data ready"
}

func main() {
	ch := make(chan string)
	go fetchData(ch)

	select {
	case msg := <-ch:
		fmt.Println("received:", msg)
	}
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
        prompt: 'Create two channels, `ch1` and `ch2`. Start a goroutine that sleeps 10ms then sends `"fast"` on `ch1`, and another that sleeps 100ms then sends `"slow"` on `ch2`. Loop twice, each time using `select` to wait on BOTH channels simultaneously and print whichever value arrives — since `ch1`\'s goroutine wakes up first, the first iteration should print `"fast"`, the second `"slow"`.',
        starter: '',
        tests: `
assert output === 'fast\\nslow'
`,
        solution: `package main

import (
	"fmt"
	"time"
)

func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	go func() {
		time.Sleep(10 * time.Millisecond)
		ch1 <- "fast"
	}()
	go func() {
		time.Sleep(100 * time.Millisecond)
		ch2 <- "slow"
	}()

	for i := 0; i < 2; i++ {
		select {
		case msg1 := <-ch1:
			fmt.Println(msg1)
		case msg2 := <-ch2:
			fmt.Println(msg2)
		}
	}
}`,
      },
    ],
  },
]

export default challenges
