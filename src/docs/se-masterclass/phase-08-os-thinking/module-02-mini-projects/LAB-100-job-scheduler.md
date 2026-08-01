# SE Masterclass — LAB-100 — Job Scheduler

**Prerequisites:** LAB-99 (Memory Visualizer)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why does FIFO scheduling risk starving short jobs behind one long one, when priority scheduling doesn't have that exact problem?
2. What does "preemption" mean in the context of a scheduler, and why does round-robin need it while FIFO doesn't?
3. Why does "average wait time" alone not tell the whole story about a scheduling algorithm's fairness?

## What You Will Build

A simulated CPU scheduler comparing three classic algorithms — FIFO, priority, and round-robin — on the identical set of jobs, measuring and reporting wait time and turnaround time for each strategy, directly showing why operating systems don't just pick one and call it done.

```
Jobs: [A(burst=10), B(burst=2), C(burst=5), D(burst=1)]

FIFO:         A B C D   -- D waits 17 units despite needing only 1 unit of work
Priority:     D B C A   -- (if D has highest priority) short/important jobs go first
Round-robin:  A B C D A C A  (quantum=3) -- every job gets a turn quickly, none waits too long
```

## Concept: Scheduling Algorithms — OS-Level Resource Allocation Strategies

**What it is:** A CPU scheduler decides which of several ready-to-run processes/threads actually gets the CPU next, and for how long. This lab simulates that decision entirely in software — no real processes, no real CPU — because the *algorithm*, not the hardware, is what's being taught: given a set of jobs with known "burst times" (how long each needs to run), how should a scheduler order and interleave them?

**The problem before:** LAB-97's process manager tracked lifecycle state (running/stopped/crashed) but never had to decide *which* of multiple simultaneously-runnable processes gets CPU time first — it assumed the OS handles that invisibly. Real schedulers make that decision constantly, and different policies produce very different outcomes for the same set of jobs: FIFO is simple but can make a 1-unit job wait behind a 100-unit job; round-robin avoids that by giving every job a bounded turn, at the cost of more overhead from constantly switching between jobs.

**The solution:** Simulate each algorithm over the identical job list and *measure* the outcome (LAB-08's "benchmark, don't guess" instinct, applied to scheduling policy instead of code complexity) — wait time (how long a job sits ready before it first runs) and turnaround time (from arrival to completion) for each job, under each strategy, made directly comparable because the input never changes, only the algorithm.

**Canonical example:**

```typescript
interface Job { id: string; burstTime: number; priority?: number }

function simulateFIFO(jobs: Job[]): { id: string; waitTime: number; turnaroundTime: number }[] {
  let clock = 0
  return jobs.map(job => {
    const waitTime = clock
    clock += job.burstTime
    return { id: job.id, waitTime, turnaroundTime: clock }
  })
}
```

**Project Application:** This is the last lab of Phase 8 — its job-queue-plus-metrics shape is the same pattern LAB-97's process registry and LAB-52's (Phase 4) task scheduler both used, now applied specifically to comparing scheduling *policies* rather than just executing scheduled work.

**Watch for:** Reporting only average wait time as "the" measure of a good scheduler. FIFO and round-robin can have similar averages while producing wildly different *individual* experiences (one job waiting a very long time versus every job waiting a moderate amount) — the Challenge below makes this concrete by also tracking maximum wait time.

## Step 1: FIFO — first-in, first-out

```typescript
interface Job { id: string; burstTime: number; priority?: number }
interface JobResult { id: string; waitTime: number; turnaroundTime: number }

function simulateFIFO(jobs: Job[]): JobResult[] {
  let clock = 0
  const results: JobResult[] = []

  for (const job of jobs) {
    const waitTime = clock // this job starts exactly when the clock reaches this point
    clock += job.burstTime
    results.push({ id: job.id, waitTime, turnaroundTime: clock })
  }
  return results
}

const jobs: Job[] = [
  { id: "A", burstTime: 10 },
  { id: "B", burstTime: 2 },
  { id: "C", burstTime: 5 },
  { id: "D", burstTime: 1 },
]
console.log(simulateFIFO(jobs))
```

FIFO runs jobs to completion in the exact order they arrived, with `clock` tracking total elapsed time — each job's `waitTime` is simply the accumulated burst time of every job before it. This is the simplest possible scheduler and also the one most exposed to the concept section's warning: `D` (burst=1, could finish almost instantly) waits behind `A`, `B`, and `C`'s combined 17 units purely because of arrival order, with no regard for how little work it actually needs.

### SAVE AND TRY

Run `simulateFIFO(jobs)`. Confirm `D`'s `waitTime` is `17` (10 + 2 + 5) despite needing only 1 unit of actual work — directly observing the "short job starved behind long ones" problem the concept section named, as a concrete number rather than an abstract claim.

## Step 2: Priority scheduling — order by importance, not arrival

```typescript
function simulatePriority(jobs: Job[]): JobResult[] {
  const sorted = [...jobs].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)) // higher priority first
  let clock = 0
  const results: JobResult[] = []

  for (const job of sorted) {
    const waitTime = clock
    clock += job.burstTime
    results.push({ id: job.id, waitTime, turnaroundTime: clock })
  }
  return results
}

const priorityJobs: Job[] = [
  { id: "A", burstTime: 10, priority: 1 },
  { id: "B", burstTime: 2, priority: 3 },
  { id: "C", burstTime: 5, priority: 2 },
  { id: "D", burstTime: 1, priority: 5 }, // highest priority
]
console.log(simulatePriority(priorityJobs))
```

`[...jobs].sort(...)` copies before sorting — the same discipline LAB-72's painter's algorithm used, since mutating the caller's original job order as a side effect of scheduling would be a surprising, hard-to-trace bug. Priority scheduling directly fixes Step 1's exact problem: `D`, despite being last in the input array, runs first here because its `priority: 5` is highest — its `waitTime` drops from `17` (FIFO) to `0`.

### SAVE AND TRY

Run `simulatePriority(priorityJobs)` and confirm `D`'s `waitTime` is now `0` — but also check `A`'s (`priority: 1`, the lowest): its `waitTime` should now be higher than in FIFO, since it's pushed to run last. Priority scheduling didn't eliminate the "some job waits a long time" problem — it just moved which job bears that cost, from whichever arrived last to whichever matters least.

## Step 3: Round-robin — bounded turns via preemption

```typescript
function simulateRoundRobin(jobs: Job[], quantum: number): JobResult[] {
  const remaining = jobs.map(j => ({ id: j.id, remainingBurst: j.burstTime }))
  const firstStart = new Map<string, number>()
  const finishTime = new Map<string, number>()
  let clock = 0
  const queue = [...remaining]

  while (queue.length > 0) {
    const job = queue.shift()!
    if (!firstStart.has(job.id)) firstStart.set(job.id, clock)

    const runFor = Math.min(quantum, job.remainingBurst)
    clock += runFor
    job.remainingBurst -= runFor

    if (job.remainingBurst > 0) {
      queue.push(job) // preempted -- not done yet, goes to the back of the line
    } else {
      finishTime.set(job.id, clock)
    }
  }

  return jobs.map(j => ({
    id: j.id,
    waitTime: firstStart.get(j.id)!,
    turnaroundTime: finishTime.get(j.id)!,
  }))
}

console.log(simulateRoundRobin(jobs, 3)) // quantum of 3 time units per turn
```

**Preemption** is the mechanism this algorithm adds that FIFO and priority scheduling don't need: a job that isn't finished within its `quantum` gets forcibly interrupted (`job.remainingBurst > 0`) and sent to the back of the queue rather than allowed to keep running — `A` (burst=10) with `quantum=3` runs for 3 units, then *must* yield even though it's nowhere near done, giving every other queued job a chance before `A` gets to resume. FIFO never preempts (a job that starts always runs to completion); round-robin's entire fairness guarantee depends on preempting long jobs repeatedly.

### SAVE AND TRY

Run `simulateRoundRobin(jobs, 3)` and compare `D`'s `waitTime` against Step 1's FIFO result (`17`). Even though `D` arrived last, round-robin gets to it within the first few quantum rotations — its wait time should be dramatically lower than FIFO's, without needing priority information at all (unlike Step 2, which required knowing `D` was important in advance).

## Step 4: Comparing all three on identical metrics

```typescript
function averageWaitTime(results: JobResult[]): number {
  return results.reduce((sum, r) => sum + r.waitTime, 0) / results.length
}

function compareSchedulers(): void {
  const fifoResults = simulateFIFO(jobs)
  const priorityResults = simulatePriority(priorityJobs)
  const rrResults = simulateRoundRobin(jobs, 3)

  console.log("FIFO avg wait:", averageWaitTime(fifoResults))
  console.log("Priority avg wait:", averageWaitTime(priorityResults))
  console.log("Round-robin avg wait:", averageWaitTime(rrResults))
}

compareSchedulers()
```

Running all three against comparable inputs and reporting the same metric (`averageWaitTime`) is what makes this a real comparison rather than three disconnected demos — exactly the "benchmark, don't guess" instinct the concept section named, applied here to scheduling policy instead of algorithmic complexity (LAB-08) or collision-detection strategy (LAB-75).

### SAVE AND TRY

Run `compareSchedulers()` and look at the three averages side by side. Round-robin's average is often close to priority's or even FIFO's despite guaranteeing something neither does (no job waits more than roughly `(n-1) * quantum` before its first turn) — a reminder that *average* wait time alone doesn't capture everything a scheduler guarantees, setting up the Challenge below.

## 🎯 Challenge

Add `maxWaitTime` alongside `averageWaitTime`, and re-run the comparison. Confirm that FIFO's `maxWaitTime` (`D`'s `17`) is dramatically worse than round-robin's `maxWaitTime`, even in cases where their *average* wait times end up similar — demonstrating that average alone can hide a badly-starved individual job that a max/fairness metric exposes immediately.

<details>
<summary>Solution</summary>

```typescript
function maxWaitTime(results: JobResult[]): number {
  return Math.max(...results.map(r => r.waitTime))
}

function compareSchedulersFully(): void {
  const fifoResults = simulateFIFO(jobs)
  const rrResults = simulateRoundRobin(jobs, 3)

  console.log(`FIFO:         avg=${averageWaitTime(fifoResults).toFixed(1)}  max=${maxWaitTime(fifoResults)}`)
  console.log(`Round-robin:  avg=${averageWaitTime(rrResults).toFixed(1)}  max=${maxWaitTime(rrResults)}`)
}

compareSchedulersFully()
```

`maxWaitTime` surfaces exactly the "worst individual experience" the concept section's warning was about — two schedulers can report deceptively similar averages while one of them lets a single job wait far longer than any job ever does under the other, and only a max (or a full distribution) reveals that gap; averages alone can mask serious unfairness to any one particular job.

</details>

## Mental Model

| Concept | FIFO | Priority | Round-robin |
|---|---|---|---|
| Order | Strictly by arrival | By priority value | Cyclical, bounded turns |
| Preemption | Never | Never (in this simple version) | Always, at every quantum boundary |
| Best for | Simplicity, predictability | When some jobs are known to matter more | Fairness with no advance priority info |
| Worst case | A short job stuck behind a long one | A low-priority job starved indefinitely | More overhead from frequent switching |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does FIFO's `D` (burst=1) end up waiting 17 units despite needing so little actual work? | |
| 2 | What would happen to round-robin's fairness guarantee if `quantum` were set larger than every job's total burst time? | |
| 3 | Why is `maxWaitTime` a meaningfully different signal than `averageWaitTime`? | |

## Quick Check Answers

1. FIFO commits to running whichever job arrived first all the way to completion before considering any other job at all — a job with high priority but no special treatment in FIFO can only be starved by jobs ahead of it in arrival order, which priority scheduling fixes by reordering based on importance instead of arrival time.
2. Preemption means forcibly interrupting a running job before it finishes, to give another job a turn — FIFO never needs this because it always lets the current job run to completion; round-robin's entire fairness model depends on cutting a job off after its quantum, specifically to prevent one long job from monopolizing the CPU the way it can under FIFO.
3. Average wait time is a single number summarizing every job's experience together — two very different underlying distributions (one job waiting extremely long while others wait almost none, versus every job waiting a similar moderate amount) can produce nearly identical averages, so relying on average alone can hide serious unfairness to a specific job.

## Phase 8 Complete

This closes Operating-System Thinking: process/thread isolation (LAB-92), IPC across every level of process relatedness (LAB-93), synchronization and its failure modes (LAB-94), memory management and its leaks (LAB-95), then four real tools — a shell (LAB-96), a process manager (LAB-97), a file watcher (LAB-98), a heap simulator (LAB-99) — culminating in this lab's scheduling comparison. Every OS abstraction this phase covered was chosen specifically because it prevents a whole category of production bug: race conditions, deadlocks, leaks, zombie processes, and now, starvation.

*Next: [Phase 9 — Capstone →](../../phase-09-capstone/README.md)*
