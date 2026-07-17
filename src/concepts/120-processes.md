---
concept: 120-processes
name: Processes
---

## Definition

A process is an independent running instance of a program, with its own
private memory space — isolated from every other process, unlike threads
which share memory within the same process.

## Problem

Some work needs true isolation (a crash in one part shouldn't take down
everything else) or needs to bypass a language runtime's limitations on
parallelism (Python's GIL, see the Threads concept). Spawning a separate
process gives a completely independent execution environment, at the cost
of needing explicit communication, since memory isn't shared automatically.

## Execution

Main process starts a NEW child process to run a separate program or script
↓
Child process runs independently, in its OWN memory space — it cannot see
or modify the parent's variables directly
↓
Child process finishes, optionally sending its result back via some
explicit channel (stdout, a message, a file)
↓
Parent process receives that result and continues

## Computer Science

Because processes don't share memory, communicating between them requires
an explicit mechanism — inter-process communication (IPC) — like pipes,
sockets, or shared memory segments explicitly set up for that purpose. This
is a strict contrast to threads, where communication is "free" (just read
the shared variable) but comes with real coordination risk.

Tags: Process isolation, Inter-process communication, Memory isolation, Fault isolation

## Software Engineering

Using separate processes (Python's `multiprocessing` module, spawning a
subprocess) sidesteps the GIL entirely for CPU-bound parallelism, at the
cost of higher overhead — starting a process is more expensive than
starting a thread — and needing explicit serialization to pass data back
and forth, since processes can't just share objects directly.

Tags: Multiprocessing, GIL workaround, Process overhead, Serialization

## Common Mistakes

- Assuming a child process can directly read or modify the parent's variables — it cannot; only whatever was explicitly passed to it is available.
- Using multiprocessing for I/O-bound work where threads (lighter weight) would have been sufficient — process overhead is only worth paying when true CPU-bound parallelism is actually needed.

## Exercises

- Spawn a child process, have it compute something and print it, then confirm the value is NOT accessible as a variable in the parent process directly.
- Compare the startup overhead of spawning a process versus a thread for the same tiny task.

## javascript

```javascript
const { execFileSync } = require('child_process')

const result = execFileSync('node', ['-e', 'console.log(5 * 5)'])
console.log('Result from child process:', result.toString().trim())
```
Walkthrough: `execFileSync` spawns an entirely separate `node` process
running its own tiny script, waits for it to finish, and captures whatever
it printed to stdout as the only way to get a result back — there's no
shared variable between the parent and the child process the way there
would be between two threads.

## python

```python
import multiprocessing

def compute_square(n, result_dict):
    result_dict[n] = n * n

if __name__ == '__main__':
    manager = multiprocessing.Manager()
    results = manager.dict()   # a dict specifically shared across process boundaries

    process = multiprocessing.Process(target=compute_square, args=(5, results))
    process.start()
    process.join()

    print('Result from process:', results[5])
```
Walkthrough: unlike `threading.Thread` (which shares an ordinary dict
directly), a real separate process needs a `Manager().dict()` — a special
proxy object that explicitly handles the inter-process communication
needed to get a value back from a process with its own separate memory
space.
