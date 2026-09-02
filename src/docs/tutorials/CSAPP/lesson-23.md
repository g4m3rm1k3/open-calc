# Lesson 23: Virtual Memory — Address Spaces, Pages, and the Kernel's Memory Map

**What you will build**
The reader will understand what virtual memory IS at the mechanism level: the virtual address space, how the MMU translates virtual to physical addresses using page tables, what a page fault is and how the OS handles it, and how to read /proc/PID/maps to see a process's memory layout. The transferable insight: virtual memory is the foundational abstraction that makes processes isolated, dynamic allocation possible, and memory-mapped files efficient. Everything above the hardware depends on it.

**What you need to know first**
Lessons 00-22.

**Terms used in this lesson**
- **Virtual Memory** — An abstraction that provides each process with the illusion of a large, private, contiguous address space. It decouples the addresses programs use from the actual physical memory addresses in RAM.
- **Virtual Address Space** — The range of addresses available to a process, typically from 0 to 2^48-1 on x86-64 Linux.
- **MMU (Memory Management Unit)** — The hardware component in the CPU responsible for translating virtual addresses to physical addresses on the fly.
- **Page** — A contiguous block of memory, typically 4KB in size, which is the smallest unit of memory management in a virtual memory system.
- **Page Table** — A data structure used by the virtual memory system in a computer operating system to store the mapping between virtual addresses and physical addresses.
- **Page Fault** — An exception raised by the MMU when a program attempts to access a page that is not currently mapped in physical memory or when there is a permissions violation.
- **Copy-on-Write (COW)** — An optimization strategy where multiple processes share the same physical memory page until one tries to write to it, at which point a private copy is made.
- **Demand Paging** — A memory allocation technique where physical memory pages are only allocated and mapped when they are actually accessed (faulted in).

**Objects and methods used**

- **`malloc`**
  - *What it is:* Standard library function to allocate dynamic memory.
  - *Implementation:* `void *malloc(size_t size);`
  - *Its use:* Allocates a block of memory on the heap.
  - *Type:* Standard C library function.
  - *Responsibility:* Manages the heap and returns a pointer to a chunk of memory of at least the requested size.
  - *Depends on:* The underlying operating system's memory management (e.g., `brk` or `mmap`).
  - *Connects to:* Called by user code; calls OS primitives to grow the heap.
  - *Shape:* A standard library API for application-level dynamic allocation.

- **`free`**
  - *What it is:* Standard library function to deallocate memory.
  - *Implementation:* `void free(void *ptr);`
  - *Its use:* Returns dynamically allocated memory back to the heap manager.
  - *Type:* Standard C library function.
  - *Responsibility:* Marks a previously allocated block of memory as available for future allocations.
  - *Depends on:* A valid pointer previously returned by `malloc`, `calloc`, or `realloc`.
  - *Connects to:* Called by user code.
  - *Shape:* A standard library API.

- **`sysconf`**
  - *What it is:* POSIX function to get configuration information at runtime.
  - *Implementation:* `long sysconf(int name);`
  - *Its use:* Retrieves the system's page size dynamically.
  - *Type:* POSIX standard function.
  - *Responsibility:* Queries system variables and limits.
  - *Depends on:* An integer constant specifying the configuration variable to query.
  - *Connects to:* Called by user code; asks the kernel or C library.
  - *Shape:* System API.

- **`mmap`**
  - *What it is:* POSIX system call to map files or devices into memory, or allocate anonymous virtual memory.
  - *Implementation:* `void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);`
  - *Its use:* Allocates a block of anonymous virtual memory for demand paging demonstration.
  - *Type:* System call wrapper.
  - *Responsibility:* Instructs the kernel to create a new mapping in the virtual address space of the calling process.
  - *Depends on:* Length, protection flags, mapping flags.
  - *Connects to:* Called by user code; traps into the OS kernel.
  - *Shape:* Boundary API between user space and the kernel's memory manager.

- **`munmap`**
  - *What it is:* POSIX system call to unmap pages of memory.
  - *Implementation:* `int munmap(void *addr, size_t length);`
  - *Its use:* Frees the virtual memory allocated by `mmap`.
  - *Type:* System call wrapper.
  - *Responsibility:* Removes the mappings for the specified address range.
  - *Depends on:* The address and length previously mapped.
  - *Connects to:* Called by user code; traps into the kernel.
  - *Shape:* Boundary API.

- **`getpid`**
  - *What it is:* POSIX system call to get the process ID.
  - *Implementation:* `pid_t getpid(void);`
  - *Its use:* Retrieves the PID to open the process's `/proc` maps file.
  - *Type:* System call wrapper.
  - *Responsibility:* Returns the unique identifier of the calling process.
  - *Depends on:* Nothing.
  - *Connects to:* Called by user code; returns kernel data.
  - *Shape:* System API.

- **`fork`**
  - *What it is:* POSIX system call to create a new process.
  - *Implementation:* `pid_t fork(void);`
  - *Its use:* Creates a child process to demonstrate copy-on-write semantics.
  - *Type:* System call wrapper.
  - *Responsibility:* Duplicates the calling process, creating a new address space that initially shares physical pages with the parent.
  - *Depends on:* Nothing.
  - *Connects to:* Called by user code; invokes the kernel scheduler and memory manager.
  - *Shape:* Core OS process creation API.

- **`wait`**
  - *What it is:* POSIX system call to wait for process state changes.
  - *Implementation:* `pid_t wait(int *wstatus);`
  - *Its use:* Synchronizes the parent process to wait for the child to finish modifying memory.
  - *Type:* System call wrapper.
  - *Responsibility:* Suspends execution of the calling thread until one of its children terminates.
  - *Depends on:* A child process existing.
  - *Connects to:* Called by user code; synchronizes with kernel process states.
  - *Shape:* Process synchronization API.

---

## Concept Unit: The virtual address space

### The Problem
How does a computer with multiple programs running at the same time prevent one program from overwriting another's memory? If two programs try to use the memory address `0x1000`, what happens? Could they collide? How does the OS keep them separated while giving each program the illusion that it owns all the memory?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <stdlib.h>

int global_init = 42;     /* .data */
int global_uninit;        /* .bss */

int main(void) {
    int local = 0;            /* stack */
    void *heap = malloc(64);  /* heap */
    static int svar = 10;     /* .data */

    printf("code (.text):    %p\n", (void*)main);
    printf("global (.data):  %p\n", (void*)&global_init);
    printf("uninit (.bss):   %p\n", (void*)&global_uninit);
    printf("heap:            %p\n", heap);
    printf("stack:           %p\n", (void*)&local);
    free(heap);
    return 0;
}
```
*Predicted confidently: code (.text): 0x401040, global (.data): 0x404020, uninit (.bss): 0x404024, heap: 0x55a3b2c0d260, stack: 0x7ffd1234abc0*

This is called the **Virtual Address Space**. It proves that different regions of a program are mapped to distinct, separated memory areas, with the stack at a very high address, the heap growing upwards, and globals near the code. These addresses are virtual—they exist only for this process.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are examining system memory layout in a standalone way.
- **Files affected:** `src/memory_layout.c` (created)
- **Change type:** add
- **Location:** New file.
- **Dependencies:** None.

### The New Code
```c
#include <stdio.h>

void show_addresses() {
    int stack_var;
    printf("Stack variable is at: %p\n", (void*)&stack_var);
}
```

### The Updated Project
```c
// ← new
1: #include <stdio.h>
2: 
3: void show_addresses() {
4:     int stack_var;
5:     printf("Stack variable is at: %p\n", (void*)&stack_var);
6: }
```
This new file creates a function to demonstrate that stack variables receive virtual addresses.

### Mechanical walkthrough
- `#include <stdio.h>`: Includes the standard I/O library for printing.
- `void show_addresses()`: Defines a new function returning no value.
- `{`: Begins the function block.
- `int stack_var;`: Declares a local integer variable, which the compiler places on the stack.
- `printf(`: Calls the standard library print function.
- `"Stack variable is at: %p\n"`: The format string, where `%p` formats a pointer address.
- `, (void*)&stack_var`: Takes the memory address of `stack_var` using the address-of operator `&`, and casts it to a `void*` for `%p`.
- `);`: Ends the statement.
- `}`: Closes the function block.

### CS lens
The fundamental CS concept is **Virtual Memory Abstraction**. It maps a logical view of memory onto physical hardware. 
- It appears in hypervisors mapping guest physical memory to host physical memory.
- It appears in file systems where logical block addresses are mapped to physical disk sectors.
- It appears in networking, where virtual IP addresses map to different physical servers (load balancing).

### SE lens
Design principle: **Isolation**. By giving each process a completely private virtual address space, a bug (like a wild pointer) in one program cannot crash another program or the OS. The alternative would be a shared physical address space (like early DOS), where one rogue process could overwrite the entire system.

### Commands needed
None for this unit.

### Run it
*Predicted confidently: The function will print a very large hex value like `0x7ffe...` indicating a high stack address.*

### One sentence connecting to previous unit
Now that we see processes use virtual addresses, we must understand how the hardware turns them into real physical addresses.

---

## Concept Unit: Pages and the page table

### The Problem
If every memory access uses a virtual address, how does the CPU know where the actual byte lives in RAM? Does it translate every single byte individually? Where does it store millions of mappings efficiently?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    long page_size = sysconf(_SC_PAGESIZE);
    printf("Page size: %ld bytes\n", page_size);  /* 4096 on x86-64 */

    int x = 42;
    unsigned long vaddr = (unsigned long)&x;
    unsigned long page_number = vaddr >> 12;        /* top 52 bits */
    unsigned long page_offset = vaddr & 0xFFF;      /* bottom 12 bits */
    printf("Virtual address: 0x%lx\n", vaddr);
    printf("Page number:     0x%lx\n", page_number);
    printf("Page offset:     0x%lx (%lu bytes into page)\n",
           page_offset, page_offset);
    return 0;
}
```
*Predicted confidently: Page size: 4096 bytes, Virtual address: 0x7ffd1234ab8c, Page number: 0x7ffd1234a, Page offset: 0xb8c (2956 bytes into page)*

This demonstrates a **Page Table Translation**. It proves that memory is not translated byte-by-byte, but in chunks called pages (4KB). The virtual address is split into a page number (to look up in the page table) and an offset (the exact byte within that page).

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are examining system memory layout in a standalone way.
- **Files affected:** `src/memory_layout.c` (modified)
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code
```c
void extract_page(unsigned long vaddr) {
    unsigned long page_num = vaddr >> 12;
    unsigned long offset = vaddr & 0xFFF;
    printf("Page: %lx, Offset: %lx\n", page_num, offset);
}
```

### The Updated Project
```c
  #include <stdio.h>
  
  void show_addresses() {
      int stack_var;
      printf("Stack variable is at: %p\n", (void*)&stack_var);
  }
  
// ← new
7: void extract_page(unsigned long vaddr) {
8:     unsigned long page_num = vaddr >> 12;
9:     unsigned long offset = vaddr & 0xFFF;
10:    printf("Page: %lx, Offset: %lx\n", page_num, offset);
11: }
```
This adds a function to compute and print the page number and offset for any given virtual address.

### Mechanical walkthrough
- `void extract_page(unsigned long vaddr)`: Declares a function taking a 64-bit unsigned integer representing a virtual address.
- `{`: Begins the block.
- `unsigned long page_num =`: Declares a variable to hold the extracted page number.
- `vaddr >> 12;`: Bitwise right-shifts the address by 12 bits to discard the lower 12 bits, leaving only the page number.
- `unsigned long offset =`: Declares a variable to hold the offset.
- `vaddr & 0xFFF;`: Bitwise ANDs the address with `0xFFF` (the lower 12 bits set to 1) to extract just the byte offset into the page.
- `printf("Page: %lx, Offset: %lx\n", page_num, offset);`: Prints both values in hexadecimal.
- `}`: Closes the block.

### CS lens
The fundamental CS concept is **Indirection and Chunking**.
- Relational databases chunk data into 8KB pages to minimize disk I/O.
- Networks chunk data into MTU-sized packets for routing.
- File systems allocate space in blocks (e.g., 4KB) rather than byte-by-byte.

### SE lens
Design principle: **Space vs Granularity Tradeoff**. If we translated every byte, the mapping table would be larger than the memory itself. By translating in 4KB chunks, the table is small enough to fit in RAM, but we waste some memory if a program only needs 10 bytes (internal fragmentation).

### Commands needed
None for this unit.

### Run it
*Predicted confidently: Calling `extract_page(0x12345678)` will print `Page: 12345, Offset: 678`.*

### One sentence connecting to previous unit
The hardware maps pages quickly, but what happens if the program tries to access a page that isn't mapped to physical memory yet?

---

## Concept Unit: Page faults — the OS intervenes

### The Problem
If you allocate 10GB of memory using `malloc`, but your computer only has 8GB of RAM, why doesn't it crash immediately? When you first write to a newly allocated chunk of memory, what exactly is the hardware doing behind the scenes?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>

int main(void) {
    size_t size = 10 * 1024 * 1024;  /* 10 MB */
    char *p = mmap(NULL, size,
                   PROT_READ | PROT_WRITE,
                   MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);

    p[0] = 'A';              /* fault on page 0 */
    p[4096] = 'B';           /* fault on page 1 */
    p[4096 * 2048] = 'C';   /* fault on page 2048 */
    printf("%c %c %c\n", p[0], p[4096], p[4096*2048]);

    munmap(p, size);
    return 0;
}
```
*Predicted confidently: A B C*

This demonstrates a **Page Fault** and **Demand Paging**. It proves that asking the OS for memory only reserves virtual address space; physical RAM is not assigned until the exact moment you write to the page, triggering a hardware exception (a page fault) that the OS catches and handles.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/memory_layout.c` (modified)
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** `#include <sys/mman.h>`

### The New Code
```c
#include <sys/mman.h>

void demand_page() {
    char *mem = mmap(NULL, 4096 * 2, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    mem[0] = 'X'; 
    munmap(mem, 4096 * 2);
}
```

### The Updated Project
```c
  #include <stdio.h>
// ← new
2: #include <sys/mman.h>
  
  void show_addresses() {
      int stack_var;
      printf("Stack variable is at: %p\n", (void*)&stack_var);
  }
  
  void extract_page(unsigned long vaddr) {
      unsigned long page_num = vaddr >> 12;
      unsigned long offset = vaddr & 0xFFF;
      printf("Page: %lx, Offset: %lx\n", page_num, offset);
  }

// ← new
15: void demand_page() {
16:     char *mem = mmap(NULL, 4096 * 2, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
17:     mem[0] = 'X'; 
18:     munmap(mem, 4096 * 2);
19: }
```
This adds a function mapping 8KB of anonymous memory, which faults in the first page when writing 'X'.

### Mechanical walkthrough
- `#include <sys/mman.h>`: Includes declarations for memory mapping functions.
- `void demand_page()`: Declares a new function.
- `char *mem =`: Declares a pointer for the mapped memory.
- `mmap(`: Calls the system call to map memory.
- `NULL,`: Lets the kernel choose the virtual address.
- `4096 * 2,`: Requests 8192 bytes (2 pages) of virtual address space.
- `PROT_READ | PROT_WRITE,`: Requests read and write permissions on the pages.
- `MAP_PRIVATE | MAP_ANONYMOUS,`: Requests a private mapping not backed by any file.
- `-1, 0);`: No file descriptor and zero offset because it's anonymous memory.
- `mem[0] = 'X';`: Writes to the first byte. The hardware MMU throws a page fault because no physical page exists yet. The OS intercepts it, maps a physical frame, and resumes.
- `munmap(mem, 4096 * 2);`: Tells the OS to unmap and free the memory.

### CS lens
The fundamental CS concept is **Lazy Evaluation (or Demand-driven Allocation)**.
- JIT compilers lazily compile methods only when they are first called.
- Infinite scrolling in UIs fetches data only when the user scrolls near the edge.
- Sparse matrices store only non-zero elements, allocating space lazily.

### SE lens
Design principle: **Optimistic Resource Management**. The OS assumes most programs ask for more memory than they actually use. By allocating lazily, the system can "overcommit" memory and run more programs efficiently. The tradeoff is unpredictable latency on the first write (the page fault overhead).

### Commands needed
None for this unit.

### Run it
*Predicted confidently: The code will execute silently, allocating a physical page behind the scenes when 'X' is written.*

### One sentence connecting to previous unit
Because the OS manages all these mappings lazily, we can ask the OS to show us exactly what regions are mapped into our virtual address space.

---

## Concept Unit: Reading /proc/PID/maps — seeing the VMA layout

### The Problem
Where exactly are the stack, heap, and libraries mapped in the 2^48 byte space? How can an external tool (like a debugger) know which memory addresses are valid to read for a specific process without causing a segmentation fault?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    char path[64];
    pid_t pid = getpid();
    snprintf(path, sizeof(path), "/proc/%d/maps", pid);

    FILE *f = fopen(path, "r");
    if (!f) { perror("fopen"); return 1; }

    char line[256];
    while (fgets(line, sizeof(line), f))
        printf("%s", line);
    fclose(f);
    return 0;
}
```
*Predicted confidently: Will print lines mapping virtual ranges to permissions and files, like `55a3b2c00000-55a3b2c01000 r--p 00000000 08:01 1234 /path/to/prog`.*

This demonstrates **Memory Layout Introspection**. It proves that the OS maintains a list of Virtual Memory Areas (VMAs) for every process, and exposes this data structure as a readable text file via the `/proc` filesystem on Linux.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/memory_layout.c` (modified)
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** `#include <unistd.h>`

### The New Code
```c
#include <unistd.h>

void print_maps() {
    char path[64];
    snprintf(path, sizeof(path), "/proc/%d/maps", getpid());
    FILE *f = fopen(path, "r");
    char line[128];
    if (f) {
        fgets(line, sizeof(line), f); // print just first line
        printf("Map: %s", line);
        fclose(f);
    }
}
```

### The Updated Project
```c
  #include <stdio.h>
  #include <sys/mman.h>
// ← new
3: #include <unistd.h>
  
  void show_addresses() {
      int stack_var;
      printf("Stack variable is at: %p\n", (void*)&stack_var);
  }
  
  void extract_page(unsigned long vaddr) {
      unsigned long page_num = vaddr >> 12;
      unsigned long offset = vaddr & 0xFFF;
      printf("Page: %lx, Offset: %lx\n", page_num, offset);
  }

  void demand_page() {
      char *mem = mmap(NULL, 4096 * 2, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
      mem[0] = 'X'; 
      munmap(mem, 4096 * 2);
  }

// ← new
24: void print_maps() {
25:     char path[64];
26:     snprintf(path, sizeof(path), "/proc/%d/maps", getpid());
27:     FILE *f = fopen(path, "r");
28:     char line[128];
29:     if (f) {
30:         fgets(line, sizeof(line), f); // print just first line
31:         printf("Map: %s", line);
32:         fclose(f);
33:     }
34: }
```
This adds a function that dynamically locates and prints the first mapped memory region for the running process.

### Mechanical walkthrough
- `#include <unistd.h>`: Includes the POSIX header for `getpid`.
- `void print_maps()`: Declares the function.
- `char path[64];`: Allocates a string buffer.
- `snprintf(path, sizeof(path), "/proc/%d/maps", getpid());`: Formats the string with the current process ID into the buffer.
- `FILE *f = fopen(path, "r");`: Opens the generated path for reading.
- `char line[128];`: Allocates a buffer for reading a line.
- `if (f) {`: Checks if the file opened successfully.
- `fgets(line, sizeof(line), f);`: Reads one line from the file into the buffer.
- `printf("Map: %s", line);`: Prints the read line.
- `fclose(f);`: Closes the file handle.
- `}`: Closes the condition block.

### CS lens
The fundamental CS concept is **Virtual Filesystems**.
- The `/proc` filesystem on Linux exposes kernel data structures as fake files.
- `/sys` exposes hardware device trees as files.
- `/dev` exposes device drivers as files.

### SE lens
Design principle: **Exposing State for Observability**. The kernel could keep VMAs purely hidden as internal structs. By exposing them via a text file, it makes debugging, profiling, and security auditing trivial using standard user-space tools (`cat`, `grep`).

### Commands needed
None for this unit.

### Run it
*Predicted confidently: Prints something like `Map: 55a3b2c00000-55a3b2c01000 r--p 00000000 08:01 1234 /path/to/prog`.*

### One sentence connecting to previous unit
Seeing the mappings allows us to understand what happens when a process forks and duplicates its memory.

---

## Concept Unit: Memory protection and copy-on-write

### The Problem
When a process forks, the child process gets a complete copy of the parent's memory. If a browser with 2GB of memory forks to open a new tab, copying 2GB would be extremely slow. How does the OS create a new process instantly without actually copying all that RAM?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int shared_data = 100;

int main(void) {
    pid_t pid = fork();
    if (pid == 0) {
        shared_data = 999;
        printf("child: shared_data = %d at %p\n",
               shared_data, (void*)&shared_data);
        return 0;
    }
    wait(NULL);
    printf("parent: shared_data = %d at %p\n",
           shared_data, (void*)&shared_data);
    return 0;
}
```
*Predicted confidently: child: shared_data = 999 at 0x404028, parent: shared_data = 100 at 0x404028.*

This demonstrates **Copy-on-Write (COW)**. It proves that after a fork, both processes use the exact same virtual addresses, but when the child writes to the variable, the OS intervenes via a protection fault, allocates a new physical page for the child, and copies the data. The parent remains untouched.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/memory_layout.c` (modified)
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** `#include <sys/wait.h>`

### The New Code
```c
#include <sys/wait.h>

int cow_var = 50;

void test_cow() {
    if (fork() == 0) {
        cow_var = 75;
        _exit(0);
    }
    wait(NULL);
}
```

### The Updated Project
```c
  #include <stdio.h>
  #include <sys/mman.h>
  #include <unistd.h>
// ← new
4: #include <sys/wait.h>
  
  void show_addresses() { ... }
  void extract_page(unsigned long vaddr) { ... }
  void demand_page() { ... }
  void print_maps() { ... }

// ← new
36: int cow_var = 50;
37: 
38: void test_cow() {
39:     if (fork() == 0) {
40:         cow_var = 75;
41:         _exit(0);
42:     }
43:     wait(NULL);
44: }
```
This adds a function that forks, modifies a global variable in the child, and demonstrates that the parent will not observe the modification due to COW.

### Mechanical walkthrough
- `#include <sys/wait.h>`: Includes declarations for `wait`.
- `int cow_var = 50;`: Declares a global initialized variable.
- `void test_cow()`: Declares a function to test fork semantics.
- `if (fork() == 0) {`: Calls `fork`. In the child process, `fork` returns 0, so the condition is true. The OS marks the parent's memory pages as read-only.
- `cow_var = 75;`: The child attempts to write to the read-only page. This traps into the OS (protection fault). The OS allocates a new physical page, copies the old data, updates the child's page table to point to the new page with read/write permissions, and restarts the instruction.
- `_exit(0);`: Terminates the child process immediately.
- `}`: Closes the child block.
- `wait(NULL);`: In the parent process, suspends execution until the child terminates.

### CS lens
The fundamental CS concept is **Immutability and Structural Sharing**.
- Git branches instantly by pointing to the same immutable commit until a new commit is made.
- Functional data structures (like immutable trees) share unmodified branches and only copy nodes along the path that changes.
- Filesystem snapshots use COW to instantly clone large disks without duplicating physical blocks.

### SE lens
Design principle: **Deferred Work**. Do not do expensive work (like copying memory) until it is strictly necessary, because often it never will be (e.g., if a child process immediately calls `exec` to run a new program).

### Commands needed
None for this unit.

### Run it
*Predicted confidently: The parent process waits, the child writes triggering COW, and the parent is unaffected.*

### One sentence connecting to previous unit
Understanding how memory protection enables optimizations like Copy-on-Write sets us up to look at how the MMU hardware processes these protections on every cycle.

---

## Closing

### Connect the pieces
Trace one virtual address through all concept units:
A program calls `malloc` for 8KB. The C library calls `mmap`, and the OS records a new VMA in `/proc/PID/maps` representing the virtual address range `0x5500` to `0x7500`. No physical memory is mapped yet (Demand Paging). The program accesses virtual address `0x5504`. The MMU takes this virtual address, extracts page number `0x5` and offset `0x504`, and checks the page table. The entry is invalid, triggering a page fault. The OS halts the program, allocates a 4KB physical page at physical address `0x20000`, updates the page table for page `0x5`, and restarts the instruction. Now, the hardware successfully translates the address to physical `0x20504`. Later, the program calls `fork()`. The OS marks page `0x5` as read-only for both parent and child. When the child tries to write to `0x5504`, the MMU triggers a protection fault. The OS creates a new physical page (Copy-on-Write) at `0x30000`, points the child's page table entry `0x5` to it, and lets the child write. Virtual memory is the OS's contract with each process — 'you have a private, contiguous address space from 0 to 2^48; what happens beneath it is none of your business.'
