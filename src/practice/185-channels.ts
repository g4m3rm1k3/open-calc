import type { PracticeChallenge } from './loader'

export const title = 'Channels (Go)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write `func worker(ch chan<- string)` that sends `"result from worker"` on `ch`. In `main`, create an unbuffered channel with `make(chan string)`, start `worker` with `go`, then receive from it with `msg := <-ch` and print it — the receive blocks until the goroutine actually sends, so no `sync.WaitGroup` is needed for synchronization.',
        starter: '',
        tests: `
assert output === 'result from worker'
`,
        solution: `package main

import "fmt"

func worker(ch chan<- string) {
	ch <- "result from worker"
}

func main() {
	ch := make(chan string)
	go worker(ch)
	msg := <-ch
	fmt.Println(msg)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Fix `main`: it sends on the unbuffered channel directly (`ch <- "hello"`) with no other goroutine ready to receive — since nothing can unblock that send, Go\'s runtime crashes with `fatal error: all goroutines are asleep - deadlock!`. Move the send into a goroutine (`go func() { ch <- "hello" }()`) so `main`\'s own receive is what rendezvous with it.',
        starter: `package main

import "fmt"

func main() {
	ch := make(chan string)
	ch <- "hello"
	msg := <-ch
	fmt.Println(msg)
}`,
        tests: `
assert output === 'hello'
`,
        solution: `package main

import "fmt"

func main() {
	ch := make(chan string)
	go func() {
		ch <- "hello"
	}()
	msg := <-ch
	fmt.Println(msg)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write `func worker(id int, ch chan<- int)` that sends `id * id` on `ch`. In `main`, launch `worker` for `id` 1 through 3 with `go`, then receive from the channel exactly 3 times in a loop, summing the values, and print the sum — receiving 3 times naturally waits for all 3 sends, with no `sync.WaitGroup` required.',
        starter: '',
        tests: `
assert output === '14'
`,
        solution: `package main

import "fmt"

func worker(id int, ch chan<- int) {
	ch <- id * id
}

func main() {
	ch := make(chan int)
	for i := 1; i <= 3; i++ {
		go worker(i, ch)
	}

	sum := 0
	for i := 0; i < 3; i++ {
		sum += <-ch
	}
	fmt.Println(sum)
}`,
      },
    ],
  },
]

export default challenges
