# Lesson 13: Storage Technologies — SRAM, DRAM, Disk, and SSD
**Series:** Computer Systems: A Programmer's Perspective (CS:APP by Bryant & O'Hallaron)
**Module:** Module 2 — The Memory Hierarchy

## Introduction

**What you need to know first:**
Lessons 00–12 (all of Module 0 and Module 1).

**What you will build:**
The reader will understand why the memory hierarchy exists, the physical properties of each storage technology, the access time numbers every programmer should know, and how these numbers determine which optimizations matter. The transferable insight: all performance bottlenecks in real programs trace back to storage technology limits. A 100-ns DRAM access is 300 CPU cycles of wasted time — the cache hierarchy exists entirely to hide this gap.

## Objects and Methods

- **SRAM (Static RAM)**
  - What it is: A type of memory that stores each bit using a bistable circuit of six transistors.
  - Implementation: Built directly on the CPU die (or package) using identical manufacturing processes to the CPU logic itself.
  - Its use: Implementing the L1, L2, and L3 caches in modern processors.
  - Type: Volatile storage technology.
  - Responsibility: Provide sub-nanosecond to nanosecond access times for the CPU to hide the latency of main memory.
  - Depends on: Continuous power supply to hold its state.
  - Connects to: CPU registers on one side, lower-level caches or DRAM on the other side.
  - Shape: Hardware array of 6-transistor cells with address decoders.

- **DRAM (Dynamic RAM)**
  - What it is: A type of memory that stores each bit as a charge on a single capacitor, accompanied by a single access transistor.
  - Implementation: Built on separate silicon dies from the CPU and packaged into DIMM modules, optimized for density.
  - Its use: Implementing the system's main memory.
  - Type: Volatile storage technology.
  - Responsibility: Provide large capacity storage (gigabytes) at moderate access speeds.
  - Depends on: Periodic electrical refresh operations (every ~64 ms) to prevent charge leakage and data loss.
  - Connects to: The CPU via the memory bus and memory controller.
  - Shape: 2D array (supercells) of capacitor-transistor pairs arranged in rows and columns.

- **HDD (Hard Disk Drive)**
  - What it is: Mechanical storage using rotating magnetic platters and moving read/write heads.
  - Implementation: Physical disk enclosed with a motor, actuator arm, and magnetic coating.
  - Its use: Bulk, inexpensive, persistent storage for large files and operating systems.
  - Type: Non-volatile storage technology.
  - Responsibility: Provide terabytes of storage at very low cost per gigabyte.
  - Depends on: Mechanical movement (spindle rotation and actuator arm seeking).
  - Connects to: The system via SATA or SAS interfaces.
  - Shape: Concentric tracks and sectors on physical disks.

- **SSD (Solid-State Drive)**
  - What it is: Persistent storage using NAND flash memory (floating gate transistors).
  - Implementation: Flash memory chips (planes, blocks, pages) arranged on a circuit board with a controller.
  - Its use: Fast persistent storage, heavily favored over HDDs for operating systems and frequently accessed data.
  - Type: Non-volatile storage technology.
  - Responsibility: Provide rapid non-volatile storage with fast random access times compared to HDDs.
  - Depends on: Complex flash translation layer (FTL) to manage wear leveling and write amplification.
  - Connects to: The system via PCIe/NVMe or SATA interfaces.
  - Shape: Grid of floating-gate transistors grouped into pages (for reads/writes) and blocks (for erases).

## Concept Units

### 1. The speed-cost-capacity tradeoff

The fundamental tradeoff in storage technology is a physical one: faster memory is inherently more expensive to build, and therefore systems can afford less capacity of it. 

Consider the hierarchy of storage technologies:

| Storage tier     | Capacity   | Access time    | Cost/GB      | Location     |
|------------------|------------|----------------|--------------|--------------|
| Registers        | ~128 bytes | ~0.3 ns (1 cy) | N/A          | On CPU die   |
| L1 cache (SRAM)  | 32-64 KB   | ~1-4 ns        | ~$10,000/GB  | On CPU die   |
| L2 cache (SRAM)  | 256-512 KB | ~5-12 ns       | ~$1,000/GB   | On CPU die   |
| L3 cache (SRAM)  | 4-32 MB    | ~20-40 ns      | ~$100/GB     | On CPU package|
| Main memory (DRAM)| 8-128 GB  | ~60-100 ns     | ~$5/GB       | DIMM modules |
| SSD (NAND Flash) | 0.5-8 TB   | ~100 μs read   | ~$0.10/GB    | PCIe/SATA    |
| Hard disk (HDD)  | 1-20 TB    | ~3-10 ms       | ~$0.02/GB    | SATA         |
| Tape             | 1-60 TB    | seconds        | ~$0.002/GB   | Tape library |

There are critical access times every programmer should memorize:
- L1 cache hit: 4 cycles (~1 ns)
- L2 cache hit: 12 cycles (~4 ns)
- L3 cache hit: 40 cycles (~13 ns)
- DRAM: 200 cycles (~60 ns)
- SSD random read: ~100,000 cycles (~33 μs)
- HDD random read: ~10,000,000 cycles (~3 ms)

The gap between L1 and DRAM is a staggering factor of 50×. The gap between L1 and a mechanical HDD is an astronomical 2,500,000×.

*Throwaway lab:*
Let's consider a simple program simulating access times. We won't keep this code in our final project.
```c
#include <stdio.h>

int main() {
    // A simplified model showing cycle wait times
    long long l1_wait = 4;
    long long dram_wait = 200;
    long long hdd_wait = 10000000;
    
    printf("L1 wait cycles: %lld\n", l1_wait);
    printf("DRAM wait cycles: %lld\n", dram_wait);
    printf("HDD wait cycles: %lld\n", hdd_wait);
    
    return 0;
}
```
**Output:**
```
L1 wait cycles: 4
DRAM wait cycles: 200
HDD wait cycles: 10000000
```
This lab is discarded as we move to the next concept.

### 2. SRAM (Static RAM) — the cache technology

Static RAM (SRAM) stores each bit using a bistable circuit comprised of 6 transistors. It holds its state as long as power is applied — no refreshing is required.

**Properties:**
- Access time: 1–4 ns (sub-nanosecond in the fastest cases)
- Volatile: loses data when power is turned off
- Very expensive: ~100× more per bit than DRAM
- Low density: 6 transistors per bit versus 1 per bit for DRAM
- Low power: only switching states consumes significant power, not holding state

Why is SRAM used for caches? An L1 cache must respond in roughly 4 cycles. At a CPU clock speed of 3 GHz, 4 cycles is equal to 1.3 ns. Only SRAM can achieve this latency. If a CPU had to rely on DRAM at 60 ns for L1, it would require 180 cycles of waiting per memory access — utterly unacceptable for performance.

*Throwaway lab:*
Let's simulate a cache lookup vs a main memory lookup conceptually.
```c
#include <stdio.h>

void sram_lookup() {
    printf("SRAM (Cache) Access: ~1 ns (4 cycles)\n");
}

int main() {
    sram_lookup();
    return 0;
}
```
**Output:**
```
SRAM (Cache) Access: ~1 ns (4 cycles)
```
This conceptual lab is discarded.

### 3. DRAM (Dynamic RAM) — main memory technology

Dynamic RAM (DRAM) is the main memory technology. Each DRAM cell stores 1 bit using a single capacitor and a single access transistor. Because capacitors leak charge over time, DRAM must be actively refreshed every ~64 ms.

**Properties:**
- Access time: 60–100 ns. DRAM is organized as rows and columns. Accessing a row is slow, but accessing columns within that same row is fast.
- Volatile: loses data when power is off
- Dense: 1 transistor + 1 capacitor per bit
- Cheap: ~$5/GB
- Refresh overhead: the memory controller spends ~1-3% of its time just refreshing the cells.

**DRAM organization:**
```
DRAM chip
  |-- supercell (d x w bits): d rows, w columns
     |-- Each supercell is 1 bit at a specific (row, column)
```

The access sequence works as follows:
1. Row Access Strobe (RAS): select the row, copy it to a row buffer (~50 ns)
2. Column Access Strobe (CAS): select column from row buffer (~20 ns)
3. Read the bit from row buffer

Accessing the same row repeatedly is faster because the row is already in the row buffer. Crossing into new rows requires a slow, new RAS. This explains why sequential memory access is faster than random access, even entirely within DRAM.

*Throwaway lab:*
Simulating row versus column access delay.
```c
#include <stdio.h>

int main() {
    int ras_delay_ns = 50;
    int cas_delay_ns = 20;
    
    printf("Accessing new row total delay: %d ns\n", ras_delay_ns + cas_delay_ns);
    printf("Accessing same row total delay: %d ns\n", cas_delay_ns);
    
    return 0;
}
```
**Output:**
```
Accessing new row total delay: 70 ns
Accessing same row total delay: 20 ns
```
This lab is discarded.

### 4. The memory bus — how CPU requests data from DRAM

The CPU, memory controller, and DRAM communicate over a shared channel known as the memory bus.

```
[CPU] <--[system bus]--> [I/O bridge] <--[memory bus]--> [DRAM]
```

When an assembly instruction like `movq A, %rax` executes (loading from address A), the sequence is:
1. CPU places address A on the memory bus: "I want the 8 bytes at address A"
2. Main memory receives this address
3. Memory controller translates the address to a (module, row, column) format
4. DRAM performs the RAS + CAS sequence
5. DRAM outputs the data back onto the memory bus
6. CPU reads the data from the bus into the `%rax` register

The bus width is crucial. Modern systems use 64-bit or 128-bit buses. A 64-bit bus transfers 8 bytes per clock cycle. Since a cache line is 64 bytes, loading a single cache miss requires transferring 64 / 8 = 8 bus cycles of data across the memory bus.

*Throwaway lab:*
Calculating bus cycles for a cache line.
```c
#include <stdio.h>

int main() {
    int cache_line_bytes = 64;
    int bus_width_bytes = 8; // 64 bits
    
    printf("Bus cycles required: %d\n", cache_line_bytes / bus_width_bytes);
    
    return 0;
}
```
**Output:**
```
Bus cycles required: 8
```
This lab is discarded.

### 5. Disk drives (HDD) — mechanical storage

A hard disk (HDD) consists of one or more magnetic platters spinning rapidly, typically between 5,400 and 15,000 RPM. Each platter features concentric tracks, and each track is divided into sectors (usually 512 bytes or 4096 bytes).

```
Platter (rotating at 7200 RPM = 120 rotations/second):
  |-- Tracks (concentric rings): ~50,000 tracks per platter
     |-- Sectors: 512 bytes or 4096 bytes each
        |-- Gap: between sectors

Read/write head on actuator arm:
  |-- Seeks to the correct track (seek time)
  |-- Waits for the right sector to rotate under the head (rotational latency)
  |-- Reads/writes as the sector passes (transfer time)
```

**Access time breakdown:**
- Seek time: 3–9 ms (to mechanically move the head to the correct track)
- Rotational latency: 0–8 ms average (at 7200 RPM, a full rotation takes 8.3 ms, so the average wait is 4.2 ms)
- Transfer time: ~0.02 ms (at 7200 RPM and 500 sectors/track, reading 1 sector is 8.3ms / 500 = 0.017 ms)
- Total average access time: ~4–12 ms

The key insight is that random access time on a disk (~10 ms) is roughly 100,000× slower than DRAM. Sequential reads are much faster because the seek and rotational latency are paid only once per track, and then the data flows continuously.

*Throwaway lab:*
Modeling disk latency components.
```c
#include <stdio.h>

int main() {
    float seek_ms = 6.0;
    float rotational_ms = 4.2;
    float transfer_ms = 0.02;
    
    printf("Total average disk latency: %.2f ms\n", seek_ms + rotational_ms + transfer_ms);
    
    return 0;
}
```
**Output:**
```
Total average disk latency: 10.22 ms
```
This lab is discarded.

### 6. Solid-State Drives (SSD) — flash memory

Solid-State Drives store data in NAND flash memory, built from floating gate transistors. Unlike HDDs, they have no moving parts.

```
SSD structure:
  |-- Package (chip)
     |-- Die
        |-- Plane
           |-- Block (~256 KB): unit of ERASE
              |-- Page (~4 KB): unit of READ and WRITE
```

**Critical SSD properties:**
- Read: Random reads take ~100 μs. Sequential reads hit ~500 MB/s (SATA) or ~3500 MB/s (NVMe).
- Write: Must erase an entire block (~1 ms) before writing a specific page within it.
- Wear: Each flash cell can only be written ~3,000–100,000 times before physically degrading.
- Write amplification: A single byte write operation may internally require the SSD controller to read, erase, and rewrite an entire 256 KB block.

Comparison between technologies:

| Operation    | HDD        | SSD (SATA) | SSD (NVMe) |
|--------------|------------|------------|------------|
| Random read  | 0.5-2 MB/s | 50-100 MB/s| 500 MB/s   |
| Seq. read    | 150 MB/s   | 550 MB/s   | 3500 MB/s  |
| Random write | 0.5-2 MB/s | 30-60 MB/s | 300 MB/s   |
| Seq. write   | 120 MB/s   | 520 MB/s   | 3000 MB/s  |

*Throwaway lab:*
Comparing SSD vs HDD random read rates.
```c
#include <stdio.h>

int main() {
    float hdd_random_mb_s = 1.0;
    float ssd_nvme_random_mb_s = 500.0;
    
    printf("NVMe SSD is %.0fx faster at random reads.\n", ssd_nvme_random_mb_s / hdd_random_mb_s);
    
    return 0;
}
```
**Output:**
```
NVMe SSD is 500x faster at random reads.
```
This lab is discarded.

### 7. The memory hierarchy as a whole — what it means for programming

The memory hierarchy works as a complex caching system: each level caches a subset of the data from the slower, larger level beneath it.

```
CPU registers cache   --> L1 cache
L1 cache caches      --> L2 cache
L2 cache caches      --> L3 cache
L3 cache caches      --> main memory (DRAM)
Main memory caches   --> disk (via virtual memory / page file)
Disk caches          --> network storage (NFS, S3)
```

The foundational property is that data moves between levels in FIXED-SIZE BLOCKS:
- L1/L2/L3 caches: 64-byte cache lines
- DRAM ↔ disk: 4 KB pages (virtual memory)
- Disk ↔ network: varies (packets, blocks)

Consider the programmer's perspective with two simple nested loops. These two loops perform the exact same mathematical work but run at drastically different speeds due to the storage hierarchy.

```c
#include <stdio.h>

// A global array to avoid stack overflow for 1024x1024 doubles
double a[1024][1024];

int main() {
    // Loop 1: stride-1 access (cache-friendly)
    for (int i = 0; i < 1024; i++) {
        for (int j = 0; j < 1024; j++) {
            a[i][j] *= 2.0;   // accesses a[i][0], a[i][1], ... (sequential)
        }
    }

    // Loop 2: stride-1024 access (cache-unfriendly)
    for (int j = 0; j < 1024; j++) {
        for (int i = 0; i < 1024; i++) {
            a[i][j] *= 2.0;   // accesses a[0][j], a[1][j], ... (stride 1024*8 = 8192 bytes)
        }
    }
    
    printf("Both loops finished.\n");
    return 0;
}
```
**Output:**
```
Both loops finished.
```

In Loop 1, the inner loop iterates over `j`. In C, 2D arrays are stored in row-major order, meaning `a[i][0]` is directly adjacent to `a[i][1]` in memory. This is called a stride-1 access pattern. When the CPU fetches `a[0][0]`, the L1 cache brings in a full 64-byte block (eight 8-byte doubles). The next 7 accesses hit the fast L1 cache.

In Loop 2, the inner loop iterates over `i`. The code jumps between rows: `a[0][0]`, `a[1][0]`, `a[2][0]`. Each jump skips 1024 doubles (8192 bytes) into the future. None of these elements exist in the same 64-byte cache line. Therefore, every single access results in a cache miss, forcing the CPU to wait hundreds of cycles for DRAM. Loop 2 may be 10-100× slower because it misses the cache on every single iteration.

## Closing

Storage technology determines the memory hierarchy's structure. The physical realities of SRAM, DRAM, and disks dictate that data must be staged and cached in progressively larger, slower pools. The hierarchy's structure determines what code is fast and what code is slow. Lesson 14 introduces the principle of locality — the one idea that explains almost all cache-related performance phenomena.

**Exercises:**
1. Compute the average rotational latency for a 7200 RPM drive. (Hint: 1 minute / 7200 rotations).
2. Explain why DRAM must be periodically refreshed but SRAM does not.
3. Calculate the number of bus cycles needed to transfer one 64-byte cache line over a 64-bit wide memory bus.
