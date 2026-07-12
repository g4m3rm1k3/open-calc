---
series: go-fundamentals
level: 1
title: Goroutines and Channels
lang: javascript
---

# Goroutines and Channels

Most languages build concurrent programs by managing threads — operating-system constructs that each require a large stack (typically 1–8 MB) and expensive context switches. Go takes a different model: **goroutines** are lightweight functions scheduled by the Go runtime, starting at 2 KB of stack and multiplexed across OS threads automatically. Goroutines communicate through **channels** — typed conduits where values are sent and received. This is Go's implementation of CSP (Communicating Sequential Processes), Tony Hoare's 1978 model for safe concurrent programs. By the end of this lesson you will understand goroutines, buffered vs unbuffered channels, and the `select` statement.

## Goroutines — Lightweight Concurrent Execution

A goroutine is started with the `go` keyword. It runs concurrently with the caller.

```javascript
// In real Go:
//   func sayHello(name string) { fmt.Println("Hello,", name) }
//   go sayHello("Alice")  // starts a goroutine — runs concurrently
//   go sayHello("Bob")
//   time.Sleep(100 * time.Millisecond)  // give goroutines time to run

// In JavaScript we simulate with async functions and setTimeout:
function demonstrateGoroutines() {
  const log = []

  function goroutine(task) {
    return new Promise(resolve => {
      // Simulate the runtime scheduling the goroutine (non-zero delay)
      const delay = Math.floor(Math.random() * 10)
      setTimeout(() => {
        const result = task()
        log.push(result)
        resolve(result)
      }, delay)
    })
  }

  return Promise.all([
    goroutine(() => 'goroutine 1: Hello, Alice'),
    goroutine(() => 'goroutine 2: Hello, Bob'),
    goroutine(() => 'goroutine 3: Hello, Carol'),
  ]).then(() => {
    console.log('All goroutines finished:')
    // Note: order may vary — goroutines run concurrently
    log.forEach(entry => console.log(' ', entry))
    console.log('(order determined by scheduler, not source order)')
  })
}

demonstrateGoroutines()
```

```text
All goroutines finished:
  goroutine 1: Hello, Alice
  goroutine 2: Hello, Bob
  goroutine 3: Hello, Carol
(order determined by scheduler, not source order)
```

**CS lens:** Go uses an **M:N threading model**: M goroutines are multiplexed onto N OS threads (where N = GOMAXPROCS, defaulting to the number of CPU cores). A goroutine that blocks on I/O or a channel is moved off the OS thread so another goroutine can run — the OS thread is never idle waiting. This is why Go can maintain hundreds of thousands of goroutines with modest memory. Java or Python threads cannot scale past a few thousand.

## Channels — Typed Communication Pipes

A channel is a typed conduit. You send a value into a channel with `<-` and receive from it with `<-`. By default (unbuffered), send and receive both block until the other side is ready.

```javascript
// In real Go:
//   ch := make(chan int)         // unbuffered channel
//   go func() { ch <- 42 }()    // send in a goroutine (would block if not received)
//   value := <-ch               // receive (blocks until sent)
//   fmt.Println(value)          // 42

// We simulate channels with JavaScript Promises:
function makeChannel() {
  let resolver = null
  const queue = []

  return {
    // send: blocks until a receiver is ready (simulated with Promise)
    async send(value) {
      if (resolver) {
        resolver(value)
        resolver = null
      } else {
        await new Promise(resolve => queue.push({ value, resolve }))
      }
    },

    // receive: blocks until a value is sent
    async recv() {
      if (queue.length > 0) {
        const { value, resolve } = queue.shift()
        resolve()
        return value
      }
      return new Promise(resolve => { resolver = resolve })
    },
  }
}

async function demonstrateUnbufferedChannel() {
  const ch = makeChannel()

  // Goroutine: sends a value into the channel
  setTimeout(async () => {
    console.log('goroutine: sending 42')
    await ch.send(42)
    console.log('goroutine: send complete')
  }, 0)

  // Main: receives from the channel (blocks until sent)
  console.log('main: waiting to receive...')
  const value = await ch.recv()
  console.log('main: received', value)
}

demonstrateUnbufferedChannel()
```

```text
main: waiting to receive...
goroutine: sending 42
goroutine: send complete
main: received 42
```

Execution trace:
```text
main calls recv()     → no sender ready → main suspends
goroutine calls send(42) → main is waiting → hands 42 to main → resumes
main resumes with value=42
goroutine resumes (send complete)
```

The key: **sender and receiver synchronise at the channel**. The unbuffered channel is a rendezvous point — both sides arrive and exchange the value at the same moment. This synchronisation makes the communication order explicit and race-free.

**CS lens:** An unbuffered channel is a **synchronous message-passing primitive** from Hoare's CSP (Communicating Sequential Processes, 1978). CSP proved that concurrent systems built on message passing (rather than shared mutable state) are easier to reason about: communication is explicit, synchronisation is automatic, and data races are impossible because data is transferred, not shared.

## Buffered Channels — Asynchronous up to Capacity

A buffered channel can hold values without a receiver being ready, up to its capacity:

```javascript
// In real Go:
//   ch := make(chan int, 3)   // buffered: capacity 3
//   ch <- 1                  // does not block — buffer has room
//   ch <- 2
//   ch <- 3
//   ch <- 4                  // BLOCKS — buffer is full

async function demonstrateBufferedChannel() {
  const capacity = 3
  const buffer = []
  let recvResolvers = []

  const bufferedCh = {
    async send(value) {
      if (buffer.length < capacity) {
        buffer.push(value)
        console.log(`  sent ${value}, buffer: [${buffer.join(', ')}]`)
        if (recvResolvers.length > 0) {
          const resolve = recvResolvers.shift()
          resolve(buffer.shift())
        }
      } else {
        console.log(`  send ${value} BLOCKED (buffer full)`)
        await new Promise(resolve => {
          const waitForSpace = () => {
            buffer.push(value)
            resolve()
          }
          recvResolvers.push(waitForSpace)
        })
      }
    },
    async recv() {
      if (buffer.length > 0) return buffer.shift()
      return new Promise(resolve => recvResolvers.push(resolve))
    }
  }

  console.log('--- Filling buffer ---')
  await bufferedCh.send(1)
  await bufferedCh.send(2)
  await bufferedCh.send(3)

  console.log('--- Receiving ---')
  console.log('received:', await bufferedCh.recv())
  console.log('received:', await bufferedCh.recv())
  console.log('received:', await bufferedCh.recv())
}

demonstrateBufferedChannel()
```

```text
--- Filling buffer ---
  sent 1, buffer: [1]
  sent 2, buffer: [1, 2]
  sent 3, buffer: [1, 2, 3]
--- Receiving ---
received: 1
received: 2
received: 3
```

**SE lens:** Buffered channels decouple producer and consumer when the producer is temporarily faster than the consumer. The buffer capacity is a design decision: too small and the sender blocks frequently (back-pressure); too large and you hide performance problems by accumulating data in memory. In Go's HTTP servers, buffered channels are used to implement worker pools — tasks are sent to a buffered channel and N worker goroutines drain it. The capacity limits the number of tasks queued in memory.

## The select Statement

`select` chooses from multiple channel operations — whichever is ready first:

```javascript
// In real Go:
//   select {
//   case msg := <-ch1:
//     fmt.Println("received from ch1:", msg)
//   case msg := <-ch2:
//     fmt.Println("received from ch2:", msg)
//   case <-time.After(1 * time.Second):
//     fmt.Println("timed out")
//   }

async function demonstrateSelect() {
  // Simulate two channels delivering values at different times
  const ch1 = new Promise(r => setTimeout(() => r({ channel: 'ch1', value: 'hello' }), 30))
  const ch2 = new Promise(r => setTimeout(() => r({ channel: 'ch2', value: 'world' }), 10))
  const timeout = new Promise(r => setTimeout(() => r({ channel: 'timeout', value: null }), 100))

  // select: first one that resolves wins
  async function select(...cases) {
    return Promise.race(cases)
  }

  console.log('waiting on ch1, ch2, timeout...')
  const result = await select(ch1, ch2, timeout)
  console.log(`${result.channel} won: ${result.value}`)

  // ch2 delivered at 10ms, ch1 at 30ms — ch2 wins
  // If none deliver within 100ms, timeout would win
}

demonstrateSelect()
```

```text
waiting on ch1, ch2, timeout...
ch2 won: world
```

`select` is Go's built-in non-blocking multiplexer. It is the mechanism behind Go's timeout pattern: `case <-time.After(5 * time.Second)` means "if no other case is ready within 5 seconds, take this case." Every production Go program that makes network calls uses this pattern.

## Challenge: channel_pipeline

Implement a simulated three-stage pipeline using async functions.

`createChannelPipeline(values)` — `values` is an array of numbers; returns a Promise that resolves to the final array after passing through three stages:
1. **generate** — emits each value
2. **square** — multiplies each value by itself
3. **filter** — keeps only values where value > 10

Process the values through all three stages in order. The final result is the filtered, squared values.

```challenge
function createChannelPipeline(values) {
  return Promise.resolve([])
}
```

```test
const result1 = await createChannelPipeline([1, 2, 3, 4, 5])
assert result1.includes(25)  // 5² = 25 > 10
assert result1.includes(16)  // 4² = 16 > 10
assert !result1.includes(9)  // 3² = 9, not > 10
assert !result1.includes(4)  // 2² = 4, not > 10
assert !result1.includes(1)  // 1² = 1, not > 10
assert result1.length === 2
```
