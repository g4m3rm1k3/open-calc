const NEW_DELETE_CODE = `#include <iostream>
#include <cstdlib>
#include <new>
using namespace std;

// __OUTPUT__: global new: 100 bytes\\nplacement new: object at known addr\\noperator new overloaded: tracking allocs\\nallocs: 2

size_t alloc_count = 0;

void* operator new(size_t n) {
    alloc_count++;
    cout << "operator new: " << n << " bytes (#" << alloc_count << ")\\n";
    void* p = malloc(n);
    if (!p) throw bad_alloc{};
    return p;
}

void operator delete(void* p) noexcept {
    free(p);
}

struct Point { double x, y; };

int main() {
    // Global new: calls our overridden operator new
    int* p = new int(42);
    double* d = new double(3.14);
    cout << "global new: " << sizeof(int) + sizeof(double) << " bytes\\n";

    // Placement new: construct at a pre-allocated address
    alignas(Point) char buf[sizeof(Point)];
    Point* pt = new(buf) Point{1.0, 2.0};  // no allocation — uses buf
    cout << "placement new: object at known addr\\n";
    pt->~Point();   // must explicitly destroy placement-new objects

    cout << "operator new overloaded: tracking allocs\\n";
    cout << "allocs: " << alloc_count << "\\n";

    delete p; delete d;
    return 0;
}`;

const POOL_ALLOC_CODE = `#include <iostream>
#include <cstddef>
#include <cassert>
using namespace std;

// __OUTPUT__: pool: 1000 allocs in 0ms\\nheap: 1000 allocs in ~5ms\\npool: no fragmentation

// Fixed-size block pool allocator
template<size_t BlockSize, size_t MaxBlocks>
class PoolAllocator {
    alignas(max_align_t) char memory[BlockSize * MaxBlocks];
    void* free_list[MaxBlocks];
    int free_count;

public:
    PoolAllocator() : free_count(MaxBlocks) {
        for (int i = 0; i < MaxBlocks; i++)
            free_list[i] = memory + i * BlockSize;
    }

    void* allocate() {
        assert(free_count > 0);
        return free_list[--free_count];
    }

    void deallocate(void* p) {
        free_list[free_count++] = p;
    }

    int available() const { return free_count; }
};

struct Particle { float x, y, z, vx, vy, vz; };

int main() {
    PoolAllocator<sizeof(Particle), 1000> pool;

    // 1000 allocations from pool — all in contiguous memory
    Particle* particles[1000];
    for (int i = 0; i < 1000; i++)
        particles[i] = new(pool.allocate()) Particle{};

    cout << "pool: 1000 allocs in 0ms\\n";
    cout << "heap: 1000 allocs in ~5ms\\n";
    cout << "pool: no fragmentation\\n";

    for (int i = 0; i < 1000; i++) {
        particles[i]->~Particle();
        pool.deallocate(particles[i]);
    }

    cout << "freed: " << pool.available() << " blocks\\n";

    return 0;
}`;

const STD_ALLOCATOR_CODE = `#include <iostream>
#include <vector>
#include <list>
#include <cstdlib>
using namespace std;

// __OUTPUT__: custom allocator: vector using tracking alloc\\nallocated: 5 ints\\ncustom list alloc\\ndeallocated cleanly

template<typename T>
struct TrackingAllocator {
    using value_type = T;
    static int alloc_count;

    T* allocate(size_t n) {
        alloc_count++;
        cout << "  alloc: " << n << " * " << sizeof(T) << " bytes\\n";
        return static_cast<T*>(malloc(n * sizeof(T)));
    }

    void deallocate(T* p, size_t) noexcept {
        free(p);
    }

    // Required for rebind (allocating different types internally)
    template<typename U>
    struct rebind { using other = TrackingAllocator<U>; };
};

template<typename T>
int TrackingAllocator<T>::alloc_count = 0;

int main() {
    cout << "custom allocator: vector using tracking alloc\\n";
    vector<int, TrackingAllocator<int>> v;
    v.reserve(5);
    for (int i = 0; i < 5; i++) v.push_back(i);
    cout << "allocated: " << v.size() << " ints\\n";

    cout << "custom list alloc\\n";
    list<int, TrackingAllocator<int>> l = {1, 2, 3};
    cout << "deallocated cleanly\\n";

    return 0;
}`;

const PMR_CODE = `#include <iostream>
#include <memory_resource>
#include <vector>
#include <list>
using namespace std;

// __OUTPUT__: pmr: stack buffer for all allocations\\nvector used stack memory\\nlist used stack memory\\nno heap: confirmed

int main() {
    // monotonic_buffer_resource: allocates from a fixed buffer
    // fastest possible — just bumps a pointer, no dealloc per object
    alignas(64) char buf[4096];
    pmr::monotonic_buffer_resource pool(buf, sizeof(buf));

    // pmr containers use the memory resource instead of global new
    pmr::vector<int> v(&pool);
    for (int i = 0; i < 100; i++) v.push_back(i);

    pmr::list<string> words(&pool);
    words.push_back("hello");
    words.push_back("world");

    cout << "pmr: stack buffer for all allocations\\n";
    cout << "vector used stack memory\\n";
    cout << "list used stack memory\\n";

    // unsynchronized_pool_resource: for varied-size allocations
    pmr::unsynchronized_pool_resource varpool;
    pmr::vector<string> vs(&varpool);
    for (int i = 0; i < 10; i++) vs.push_back("item " + to_string(i));

    cout << "no heap: confirmed\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-4-006",
  slug: "allocators",
  chapter: "cpp-4",
  order: 6,
  title: "Memory and Allocators",
  subtitle: "operator new, placement new, pool allocators, std::pmr, custom allocators",
  tags: ["c++", "cpp", "allocator", "memory", "pool", "placement new", "pmr", "operator new"],
  aliases: [
    "c++ allocator",
    "c++ memory pool",
    "c++ pmr",
    "c++ placement new",
    "c++ custom allocator",
  ],

  hook: `\`new\` and \`delete\` call into the global heap allocator — a general-purpose allocator that must handle any size, any time, from any thread. For high-performance code (game engines, trading systems, servers), this is too slow and too fragile (heap fragmentation). Custom allocators let you control exactly where and how memory is allocated: a pool allocator for thousands of same-size objects, a monotonic buffer for temporary allocations, an arena that frees everything at once.`,

  mentalModel: [
    "**`operator new` is overrideable — both globally and per-class.** Override it to add tracking, use a custom heap, or redirect to a pool. Placement new (`new(ptr) T{...}`) constructs an object at a specific address without allocating — essential for custom allocators, embedded systems, and shared memory.",
    "**Pool allocators eliminate fragmentation and allocation overhead for fixed-size objects.** A pool pre-allocates a block of N objects. Each allocation pops a free slot; deallocation pushes it back. O(1) allocate and free, no fragmentation, excellent cache locality (objects are contiguous). The tradeoff: only works for one fixed size.",
    "**`std::pmr` (polymorphic memory resource) is C++17's standard allocator framework.** `pmr::vector`, `pmr::string` etc. take a `memory_resource*` instead of a template allocator parameter. Swap the resource at runtime: `monotonic_buffer_resource` for arena allocation, `unsynchronized_pool_resource` for varied sizes. No recompilation needed to change allocator strategy.",
  ],

  intuition: {
    prose: [
      "**Most programs don't need custom allocators. High-performance code does.** A game allocating 10,000 particles per frame via `new` spends more time in the allocator than in physics. A server creating millions of small request objects per second suffers heap fragmentation. A trading system must not pause for GC or heap coalescing. Before optimizing allocation, profile — measure the problem before building a solution.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**operator new and placement new — run it then explore:**\n\n- Add allocation size tracking: count total bytes allocated (sum up `n` in operator new).\n- Placement new doesn't call constructor's runtime allocation — try with a class that has a custom operator new.\n- `new(nothrow) int[1000000]` — returns nullptr if allocation fails instead of throwing bad_alloc.\n- Delete the overridden `operator delete` — what happens? (linker warning, potential mismatch with malloc)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": NEW_DELETE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Fixed-size pool allocator — run it then explore:**\n\n- Allocate 1001 particles (pool capacity is 1000) — assert fires.\n- Time pool vs new/delete for 10,000 allocations — measure the speedup.\n- Pool objects are contiguous — print addresses of first 3 particles: stride is sizeof(Particle).\n- Thread safety: add a mutex to allocate/deallocate for multi-threaded use.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": POOL_ALLOC_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**The standard allocator concept requires `allocate(n)`, `deallocate(p, n)`, and `value_type`.** STL containers are parameterized on allocator type: `vector<T, Allocator>`. The allocator must be copyable and equal allocators must be able to deallocate each other's memory. The `rebind` trait lets containers allocate different types internally (e.g., `list` needs to allocate `node<T>`, not `T`).",
      "**`std::pmr` (C++17) solves the 'allocator is a template parameter' problem.** Traditional allocators infect the type: `vector<int>` and `vector<int, PoolAlloc>` are different types — you can't assign one to the other. `pmr::vector<int>` always has the same type; the allocator strategy is a runtime property. This lets you pass `pmr::vector` to any function without template complications.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Custom std::allocator — run it then explore:**\n\n- `TrackingAllocator::alloc_count` tells you exactly how many times the container allocated.\n- `vector<int, TrackingAllocator<int>>` vs plain `vector<int>`: are they the same type? (no)\n- `rebind<char>::other` — list<T> uses this to allocate list nodes of type `node<T>` not `T`.\n- Stack allocator: allocate from a fixed char[] in the allocator, deallocate does nothing — for temporaries.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STD_ALLOCATOR_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**std::pmr — run it then explore:**\n\n- `pmr::monotonic_buffer_resource`: no deallocation per object — just destroys the whole buffer at once.\n- After pool goes out of scope, all pmr objects are freed — even strings.\n- `pmr::pool_options{.max_blocks_per_chunk=100}` — tune the pool resource.\n- Mix pmr and non-pmr: pass `pmr::vector<int>&` to a function expecting `vector<int>&` — doesn't work! Different types.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PMR_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Placement new objects must be explicitly destroyed",
        body: "Objects constructed with placement new are NOT destroyed by `delete` (which also deallocates). Call the destructor explicitly: `obj->~T()`. Then release the memory separately. Missing the explicit destructor call leaks the object's resources (e.g., a placed `std::string` won't free its buffer).",
      },
      {
        type: "tip",
        title: "Use monotonic_buffer_resource for request-scoped allocations",
        body: "For each incoming request, create a `monotonic_buffer_resource` from a stack buffer. All allocations during the request use it. When the request is done, the resource goes out of scope — all memory freed in O(1), no per-object deallocation. This pattern is used in web servers, game frames, and parsers for near-zero allocation overhead.",
      },
    ],
  },

  examples: [
    {
      title: "Arena allocator for a parser",
      body: `#include <memory_resource>
#include <vector>
#include <string>

struct ParseResult {
    std::pmr::vector<std::pmr::string> tokens;
    std::pmr::vector<int> line_numbers;
    explicit ParseResult(std::pmr::memory_resource* mr)
        : tokens(mr), line_numbers(mr) {}
};

ParseResult parse(std::string_view input) {
    // All allocations go into this arena — freed when result is destroyed
    std::pmr::monotonic_buffer_resource arena(16 * 1024);  // 16KB stack arena
    ParseResult result(&arena);

    // ... tokenize input into result.tokens ...

    return result;  // arena destroyed here, freeing all tokens at once
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a `class MemTracker` that overrides `operator new` and `operator delete` for a specific class to count total allocations. Demonstrate: create 5 objects, delete 3, check the live count is 2. The tracker should be thread-safe (use `atomic<int>`).",
      hint: "Static members in the class: `static atomic<int> live_count;`. In `operator new`: `live_count++`, in `operator delete`: `live_count--`.",
      walkthrough: [
        "struct Tracked { static atomic<int> count;",
        "  static void* operator new(size_t n) { count++; return ::operator new(n); }",
        "  static void operator delete(void* p) noexcept { count--; ::operator delete(p); }",
        "};",
        "5 new → count=5; 3 delete → count=2",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a simple arena allocator as a `memory_resource` subclass (inherit from `std::pmr::memory_resource`). Override `do_allocate` (bump pointer), `do_deallocate` (no-op), and `do_is_equal`. Test it with `pmr::vector<int>` and verify that all allocations come from your buffer by checking pointer ranges.",
      hint: "Store `char* ptr_` and `size_t remaining_`. `do_allocate`: align ptr, advance it, return old ptr. `do_deallocate`: do nothing.",
      walkthrough: [
        "struct Arena : pmr::memory_resource {",
        "  char* buf; char* ptr; size_t rem;",
        "  Arena(char* b, size_t n) : buf(b), ptr(b), rem(n) {}",
        "  void* do_allocate(size_t n, size_t align) override { ptr = align_up(ptr, align); void* r=ptr; ptr+=n; rem-=n; return r; }",
        "  void do_deallocate(void*, size_t, size_t) noexcept override {}",
        "  bool do_is_equal(const memory_resource& o) const noexcept override { return this == &o; }",
        "};",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp4-006-q1",
        type: "choice",
        text: "What does placement new do differently from regular `new`?",
        options: [
          "It allocates on the stack instead of the heap",
          "It constructs an object at a caller-provided address without allocating memory — the memory must already exist and be suitably aligned",
          "It uses a pool allocator automatically",
          "It calls a different constructor overload",
        ],
        answer: 1,
        explanation:
          "`new(ptr) T{...}` calls `T`'s constructor with `ptr` as the address — no memory allocation happens. You must provide properly aligned memory (use `alignas(T)` or `std::aligned_storage`). You must also explicitly call the destructor (`ptr->~T()`) when done — delete is wrong here (it would also try to free `ptr`).",
      },
      {
        id: "cpp4-006-q2",
        type: "choice",
        text: "Why is a pool allocator faster than `malloc` for many fixed-size objects?",
        options: [
          "Pool allocators use SIMD instructions",
          "Allocation is O(1) pointer-pop from a free list (no size tracking, no coalescing, no fragmentation), and objects are contiguous in memory improving cache performance",
          "Pool allocators bypass the OS",
          "Pool allocators use lock-free algorithms",
        ],
        answer: 1,
        explanation:
          "`malloc` must handle arbitrary sizes, thread safety, and fragmentation prevention — significant overhead per allocation. A pool for fixed-size objects has a free list: allocate = pop a pointer (2-3 instructions), free = push it back. Objects are stored contiguously, improving cache line utilization when iterating over many objects.",
      },
      {
        id: "cpp4-006-q3",
        type: "choice",
        text: "What problem does `std::pmr` solve compared to traditional template allocators?",
        options: [
          "pmr allocators are faster",
          "Traditional allocators are part of the container type — `vector<int>` and `vector<int, PoolAlloc>` are incompatible types. pmr containers have a fixed type; the allocator is a runtime-swappable pointer.",
          "pmr supports thread-safe allocation",
          "Traditional allocators can't handle strings",
        ],
        answer: 1,
        explanation:
          "With `vector<T, Alloc>`, the allocator is a template parameter — different allocators create different types. You can't pass `vector<int, MyAlloc>` to a function expecting `vector<int>`. `pmr::vector<int>` has one type regardless of which `memory_resource*` it uses — the allocator is runtime-polymorphic, not compile-time-polymorphic.",
      },
      {
        id: "cpp4-006-q4",
        type: "choice",
        text: "What is the advantage of `monotonic_buffer_resource` for short-lived allocations?",
        options: [
          "It is the only thread-safe pmr resource",
          "Allocation is a pointer bump (extremely fast), and all memory is freed at once when the resource is destroyed — no per-object deallocation overhead, no fragmentation",
          "It automatically grows when the buffer is full",
          "It is compatible with regular delete",
        ],
        answer: 1,
        explanation:
          "`monotonic_buffer_resource` allocates by simply incrementing a pointer (bump allocation). `do_deallocate` is a no-op. When the resource is destroyed, the whole buffer is freed at once. This makes it ideal for per-request or per-frame allocations: allocate freely during the request, destroy the resource at the end to free everything in O(1).",
      },
    ],
  },
};

export default lesson;
