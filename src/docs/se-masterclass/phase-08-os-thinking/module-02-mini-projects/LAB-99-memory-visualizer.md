# SE Masterclass — LAB-99 — Memory Visualizer

**Prerequisites:** LAB-98 (File Watcher)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why does a simulated heap need to track free blocks as a list, rather than just a single "next free address" pointer?
2. What is fragmentation, and why can a heap have plenty of total free memory but still fail to satisfy an allocation request?
3. Why does "first-fit" allocation risk more fragmentation over time than "best-fit," even though first-fit is faster per allocation?

## What You Will Build

A simulated heap allocator — `malloc`/`free` implemented entirely as an array-backed data structure, with no real memory involved — that tracks allocated and free blocks, visualizes fragmentation as it accumulates, and compares first-fit against best-fit allocation strategies on identical workloads.

```
Heap (100 units): [AAAA____BBBBBBBB____CCCC__________]
                    ^allocated  ^free  ^allocated ^free  ^allocated  ^free

malloc(6) with first-fit:  fails (largest free block is only 4, even though 14 total units are free)
malloc(6) with best-fit:   also fails -- no single free block is >= 6, regardless of strategy
Total free: 14 units. Largest contiguous free block: 4 units. THIS is fragmentation.
```

## Concept: Heap Simulation — Manual Memory Management in Software

**What it is:** LAB-95 (Phase 8) observed *automatic* memory management (V8's garbage collector) from the outside. This lab builds a *manual* allocator from scratch — the kind of thing `malloc`/`free` do in C, or what a GC's own internal heap bookkeeping looks like underneath the automation — to see directly what "allocate," "free," and "fragmentation" actually mean as data structure operations, not just words.

**The problem before:** LAB-01 (Phase 1) introduced "the heap" as a concept — dynamic memory, unlike the stack's fixed frames — but never showed *how* a heap actually tracks which regions are in use and which are free. Without that mechanism visible, "fragmentation" is just a word; this lab makes it a directly observable, measurable property of a real (if simulated) data structure.

**The solution:** Model the heap as a fixed-size array, and maintain a list of blocks — each block either `allocated` or `free`, with a start offset and a length — covering the entire array with no gaps and no overlaps. `malloc(size)` searches the free blocks for one large enough (by some strategy — first-fit or best-fit), splits it if there's leftover space, and marks the used portion allocated. `free(pointer)` marks a block free again and merges it with any adjacent free blocks, to fight fragmentation as it happens rather than just before running out of memory.

**Canonical example:**

```typescript
interface Block { start: number; length: number; allocated: boolean }

function mallocFirstFit(heap: Block[], size: number): number | null {
  const block = heap.find(b => !b.allocated && b.length >= size)
  return block ? splitAndAllocate(heap, block, size) : null
}
```

**Project Application:** This lab's block-list-with-coalescing pattern is a smaller, from-scratch version of exactly what a production allocator (and much of what LAB-95's GC does internally) implements — seeing it built by hand here demystifies what "the heap" actually *is*, mechanically, for every language and runtime this curriculum has used.

**Watch for:** Freeing a block and forgetting to merge it with adjacent free blocks. Without coalescing, two neighboring small free blocks stay two separate small free blocks forever — even though together they might satisfy an allocation that neither could alone — which is fragmentation actively getting worse with every unmerged free, not just an unlucky starting layout.

## Step 1: The block list — modeling the heap's layout

```typescript
interface Block { start: number; length: number; allocated: boolean }

class SimulatedHeap {
  private blocks: Block[]

  constructor(private totalSize: number) {
    this.blocks = [{ start: 0, length: totalSize, allocated: false }] // starts as one big free block
  }

  visualize(): string {
    return this.blocks.map(b => (b.allocated ? "A" : "_").repeat(b.length)).join("")
  }
}

const heap = new SimulatedHeap(40)
console.log(heap.visualize()) // "________________________________________" (40 underscores)
```

The entire heap starts as a single free `Block` spanning the whole array — every subsequent `malloc`/`free` operation's job is to split and merge this list of blocks while always keeping it a complete, non-overlapping cover of the full `totalSize`, never leaving a gap unaccounted for by any block.

### SAVE AND TRY

Confirm `heap.visualize().length === 40` and that it's all `_` characters — a fresh heap with nothing allocated yet, matching the single-free-block initial state.

## Step 2: `malloc` — first-fit allocation with splitting

```typescript
class SimulatedHeap {
  // ...continued from Step 1...

  mallocFirstFit(size: number): number | null {
    const index = this.blocks.findIndex(b => !b.allocated && b.length >= size)
    if (index === -1) return null // no free block large enough -- allocation fails

    const block = this.blocks[index]
    if (block.length > size) {
      // split: the allocated portion becomes its own block, the leftover stays free
      const remainder: Block = { start: block.start + size, length: block.length - size, allocated: false }
      this.blocks.splice(index + 1, 0, remainder)
    }
    block.length = size
    block.allocated = true
    return block.start // the "pointer" -- just an offset into the simulated heap
  }
}
```

Splitting is what keeps the block list precise: allocating 6 units from a 20-unit free block doesn't waste the other 14 units as if they were also allocated — it carves out exactly `size` units as a new `allocated` block and leaves a smaller `free` block covering the rest, both still summing to the original 20. `findIndex` (not `find`) is used deliberately here, since the split needs the block's *position* in the array to `splice` the new remainder block in right after it.

### SAVE AND TRY

```typescript
const heap = new SimulatedHeap(40)
const ptr1 = heap.mallocFirstFit(10)
console.log(ptr1, heap.visualize())
// 0  "AAAAAAAAAA______________________________"
```

10 `A`s followed by 30 `_`s — confirming the allocation carved exactly 10 units from the front, leaving the remaining 30 as one still-free block.

## Step 3: `free` — releasing a block, with coalescing

```typescript
class SimulatedHeap {
  // ...continued from Step 2...

  free(pointer: number): void {
    const index = this.blocks.findIndex(b => b.start === pointer && b.allocated)
    if (index === -1) throw new Error(`Invalid free: no allocated block at offset ${pointer}`)

    this.blocks[index].allocated = false
    this.coalesce()
  }

  private coalesce(): void {
    for (let i = 0; i < this.blocks.length - 1; i++) {
      if (!this.blocks[i].allocated && !this.blocks[i + 1].allocated) {
        this.blocks[i].length += this.blocks[i + 1].length // merge the next block into this one
        this.blocks.splice(i + 1, 1) // remove the now-redundant second block
        i-- // re-check this same index in case a THIRD consecutive free block also needs merging
      }
    }
  }
}
```

`coalesce()` is the concept section's "watch for" solved directly: after any `free`, scan for adjacent free blocks and merge them into one larger free block, repeating (`i--` re-checks the same position) in case three or more free blocks ended up consecutive after a merge — a single pass without the `i--` retry would miss merging a third block that only became adjacent-to-free *after* the first merge happened.

### SAVE AND TRY

```typescript
const heap = new SimulatedHeap(40)
const ptr1 = heap.mallocFirstFit(10)
const ptr2 = heap.mallocFirstFit(10)
heap.free(ptr1)
heap.free(ptr2)
console.log(heap.visualize())
// "________________________________________" -- back to ONE big free block, not two adjacent ones
```

Freeing both allocations restores the heap to a single 40-unit free block — not two separate 10-unit free blocks sitting next to each other — proving `coalesce()` actually merged them rather than just marking each `allocated: false` independently.

## Step 4: Fragmentation, made visible

```typescript
class SimulatedHeap {
  // ...continued from Step 3...

  largestFreeBlock(): number {
    return Math.max(0, ...this.blocks.filter(b => !b.allocated).map(b => b.length))
  }

  totalFree(): number {
    return this.blocks.filter(b => !b.allocated).reduce((sum, b) => sum + b.length, 0)
  }

  fragmentationReport(): string {
    return `total free: ${this.totalFree()}, largest contiguous: ${this.largestFreeBlock()}, blocks: ${this.blocks.length}`
  }
}

const heap = new SimulatedHeap(40)
const a = heap.mallocFirstFit(8)
const b = heap.mallocFirstFit(8)
const c = heap.mallocFirstFit(8)
heap.free(b) // free only the MIDDLE allocation -- creates a gap neither neighbor can merge with (both are allocated)
console.log(heap.visualize())
console.log(heap.fragmentationReport())
// "AAAAAAAA________AAAAAAAA_______________"
// total free: 24, largest contiguous: 16, blocks: 3
```

Freeing the *middle* allocation while its neighbors stay allocated is exactly how fragmentation forms: `coalesce()` only merges blocks that are *both* free and adjacent, and here the freed block's neighbors are both still allocated, so it can't merge with anything — it just sits there as an isolated, unmergeable free block. `fragmentationReport()` makes the concept section's core claim directly checkable: `totalFree()` (24) can be far larger than `largestFreeBlock()` (16 here, or much worse in adversarial patterns), meaning "there's enough free memory in total" and "there's enough free memory *in one place*" are genuinely different, checkable facts about the same heap.

### SAVE AND TRY

Try `heap.mallocFirstFit(20)` on the heap from the example above (24 total free, but largest contiguous is only 16). It should return `null` — allocation fails — even though `totalFree()` reports more than enough memory exists somewhere in the heap, directly demonstrating why "out of memory" errors can happen well before a system is actually, literally out of free bytes.

## 🎯 Challenge

Implement `mallocBestFit(size)` alongside the existing `mallocFirstFit`: instead of taking the *first* free block large enough, scan all free blocks and pick the *smallest* one that's still large enough (minimizing leftover waste per allocation). Run an identical sequence of allocations and frees through both strategies and compare their `fragmentationReport()` output at the end.

<details>
<summary>Solution</summary>

```typescript
class SimulatedHeap {
  mallocBestFit(size: number): number | null {
    let bestIndex = -1
    let bestLength = Infinity

    this.blocks.forEach((block, i) => {
      if (!block.allocated && block.length >= size && block.length < bestLength) {
        bestIndex = i
        bestLength = block.length
      }
    })

    if (bestIndex === -1) return null

    const block = this.blocks[bestIndex]
    if (block.length > size) {
      const remainder: Block = { start: block.start + size, length: block.length - size, allocated: false }
      this.blocks.splice(bestIndex + 1, 0, remainder)
    }
    block.length = size
    block.allocated = true
    return block.start
  }
}
```

Best-fit trades a slower search (scan every free block instead of stopping at the first match) for tighter-fitting allocations, which *sounds* strictly better — but it tends to leave many very small, mostly-useless leftover free slivers scattered throughout the heap (a large block was never touched, so it stays available for future large requests, while size-matched blocks get consumed almost exactly), which is its own, different fragmentation pattern worth comparing against first-fit's — neither strategy is universally superior, which is exactly why real allocators offer several.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Heap tracking | A single "next free" pointer | A list of blocks, each allocated or free |
| `free()` | Just flip a flag to "not allocated" | Flip the flag, then coalesce with free neighbors |
| "Out of memory" | Means total free bytes hit zero | Can mean no single free block is large enough, even with free bytes remaining |
| First-fit vs. best-fit | One is objectively better | Different fragmentation trade-offs, no universal winner |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `free()` need to call `coalesce()` immediately, rather than merging free blocks lazily later? | |
| 2 | What's the concrete difference between `totalFree()` and `largestFreeBlock()`, and why can a `malloc` call fail even when the former is large? | |
| 3 | Why does the `coalesce()` loop use `i--` after a merge instead of just moving on to `i + 1`? | |

## Quick Check Answers

1. A single "next free address" pointer only works for memory that's allocated and freed in strict, undoing order (like a stack) — a heap allows allocations and frees in any order, so tracking every free region's location and size explicitly (a list of blocks) is required to find one that fits a later request.
2. Fragmentation is free memory that exists but is scattered across multiple small, non-contiguous blocks instead of one large one — a heap can have a large total amount of free memory (`totalFree()`) while its `largestFreeBlock()` is much smaller, meaning a request bigger than any single block fails even though the sum of all free space would technically be enough.
3. Because first-fit stops searching the instant it finds any block that's merely large enough, doing less total work per allocation; best-fit always searches every free block to find the tightest fit, doing more work but potentially wasting less space per individual allocation — the trade-off is search speed versus leftover-space efficiency, not raw fragmentation resistance in general.

*Next: [LAB-100 — Job Scheduler](LAB-100-job-scheduler.md)*
