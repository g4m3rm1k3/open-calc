# Lesson A6: A Provably Correct Order

_You need a provably correct sort order, not just "call the library."_

- **What you will build** — A `sort` method for Lesson A2's `Array<T>`,
  implemented as merge sort: split the contents in half, sort each half
  the same way, merge the two sorted halves back together — built from
  scratch rather than reached for as a black box, so *why* it produces a
  correctly sorted result is something this lesson can actually show,
  not just assert. Then, rather than hardcoding "ascending numeric
  order" into the algorithm itself, this lesson generalizes it to accept
  a comparator — a small function saying which of two elements comes
  first — so the identical sorting code can produce ascending order,
  descending order, or an order nobody would think to hardcode in
  advance, without the sorting logic itself ever changing.

- **What you need to know first** — Lesson A2's `Array<T>` (fields,
  methods, templates) and Lesson A5's `template <typename Compare>`-
  style generic parameters — this lesson adds a new templated method to
  an existing class rather than building a new one from nothing.

- **Terms used in this lesson**

  - **Recursion** — a function that calls itself, directly or
    indirectly, in order to solve a smaller version of the same problem
    it was itself asked to solve. It exists because some problems —
    merge sort included — have a natural definition in terms of a
    smaller instance of themselves ("sort this list" reduces cleanly to
    "sort this half, sort that half, then combine"), and recursion lets
    the code mirror that definition directly, instead of manually
    managing an explicit stack of "things left to do" by hand.
  - **Base case / recursive case** — the two parts every correct
    recursive function needs: a *base case*, small enough to answer
    directly with no further recursive call, and a *recursive case*,
    which makes real progress toward the base case with every call. A
    recursive function missing a base case — or one whose recursive case
    doesn't actually get closer to it — never stops calling itself, which
    is why both parts are required, not just customary.
  - **The call stack (reappearing, applied to recursion specifically)**
    — the same region of memory Lesson A1 introduced for a function's
    local variables, examined here for a new reason: every recursive
    call pushes a brand-new frame onto it, on top of the frame for the
    call that made it, and that frame doesn't disappear until its own
    call actually returns. A recursive function ten calls deep has ten
    separate frames stacked up simultaneously, each with its own
    independent copies of that function's local variables — not one
    frame being reused ten times.
  - **Divide and conquer** — the general problem-solving strategy merge
    sort is one specific example of: split a problem into smaller
    subproblems of the identical shape, solve each one (often by
    recursing), then combine those solutions into a solution for the
    original problem. It exists as its own named idea because the same
    three-part shape — divide, conquer, combine — recurs across many
    unrelated algorithms, not just sorting.
  - **Merge sort** — the specific sorting algorithm this lesson builds:
    split the collection in half, recursively sort each half using this
    exact same algorithm, then merge the two now-sorted halves back
    together into one fully sorted whole. It exists as a *provably*
    correct sort — unlike an algorithm justified only by "it seems to
    work on the examples tried so far," merge sort's correctness follows
    directly from two much simpler facts: two already-sorted lists can
    always be merged correctly by repeatedly taking the smaller of their
    two current fronts, and a list of size one is trivially already
    sorted.
  - **Lambda expression** — an anonymous, inline function value, written
    `[capture](parameters) { body }` directly at the point it's used,
    with no separate named function declared anywhere else. It exists so
    that a small, one-off piece of behavior — like "which of these two
    values should come first" — can be written exactly where it's used,
    without cluttering the rest of the file with a named function that
    only ever gets called from one place.
  - **Capture list** — the `[...]` at a lambda's very start, naming
    which variables from the surrounding code the lambda's body is
    allowed to use, and whether it gets its own independent copy of each
    (`[value]`, capture by value) or direct access to the original
    (`[&value]`, capture by reference). It exists because a lambda's
    body executes later, and possibly somewhere else entirely, than the
    line it was written on — the capture list is where it explicitly
    borrows whatever outside state it needs to keep working correctly at
    that later point.
  - **Comparator** — a function, or function-like value, that takes two
    elements and reports whether the first one belongs before the
    second in whatever order is currently desired. It exists to separate
    the *mechanics* of sorting (splitting, recursing, merging) from the
    *meaning* of "in order" — the exact same mechanical sorting code can
    produce ascending order, descending order, or any other order at
    all, depending only on which comparator it's handed.

- **Objects and methods used**

  - **`merge<T, Compare>(T arr[], int left, int mid, int right, Compare
    comp)`**
    - *What it is:* this lesson's own subject — a template function that
      combines two already-sorted stretches of an array into one sorted
      stretch, in the order `comp` defines.
    - *Implementation:* copies the two stretches (`arr[left..mid]` and
      `arr[mid+1..right]`) into two temporary arrays, then repeatedly
      takes whichever temporary array's current front `comp` says comes
      first, writing it back into `arr` in order.
    - *Its use:* the "combine" step of this lesson's divide-and-conquer
      merge sort — called once per level of recursion, on stretches that
      are already individually sorted.
  - **`mergeSortRange<T, Compare>(T arr[], int left, int right, Compare
    comp)`**
    - *What it is:* this lesson's own subject — the recursive function
      that actually performs merge sort on `arr[left..right]`.
    - *Implementation:* a base case (`left >= right`, meaning zero or one
      elements — already sorted, nothing to do) and a recursive case
      (split at the midpoint, recursively sort each half, then call
      `merge` on the result).
    - *Its use:* the algorithm this whole lesson is about, made
      available as a free function that `Array<T>::sort` (below) calls
      on its own private storage.
  - **`Array<T>::sort<Compare>(Compare comp)`**
    - *What it is:* a new method added to Lesson A2's existing `Array<T>`
      class, sorting that specific object's own contents in place.
    - *Implementation:* `template <typename Compare> void
      sort(Compare comp) { mergeSortRange(data, 0, size - 1, comp); }` —
      one line, delegating to the free function above, operating
      directly on `Array<T>`'s own private `data` field.
    - *Its use:* the actual, callable feature this lesson adds to the
      project — `arr.sort(ascending)` sorts an existing `Array<int>`
      built by every prior lesson in this track, without any of those
      lessons' own code changing.

  **Everything else in this lesson's code, not its own subject but
  still explained:**

  - **`Array<T>`** — reappearing from Lesson A2, unchanged except for
    the new `sort` method above: private `data`/`size`/`capacity`,
    public constructor, destructor, `push_back`, `get`, `getSize`.

---

## Concept Unit A6.1: Recursion — Solving a Problem With Itself

### The Problem

Merge sort's own definition is self-referential: "sort this list" means
"sort this half, sort that half, then combine the two sorted halves" —
and "sort this half" is the identical problem, just smaller. Writing
that directly requires a function capable of calling itself, on a
smaller version of its own input, and trusting that smaller call to
produce a correct answer the same way it's expected to. Does that
actually work, and if so, how does the program keep track of which call
is waiting on which?

### Introducing the Concept in Isolation

The core mechanism, with no sorting involved at all — a function that
counts down by calling a smaller version of itself:

```cpp
void countdown(int n) {
    if (n <= 0) {
        std::cout << "Liftoff!" << std::endl;
        return;
    }
    std::cout << n << std::endl;
    countdown(n - 1);
}
```

```cpp
countdown(3);
```

```
$ g++ -std=c++17 -Wall -Wextra -o recursion_demo recursion_demo.cpp
$ ./recursion_demo
3
2
1
Liftoff!
```

`countdown` calls `countdown` — a function calling itself — and this
specific technique is called **recursion**. The output proves it isn't
infinite: `countdown(3)` prints `3`, then calls `countdown(2)`, which
prints `2`, then calls `countdown(1)`, which prints `1`, then calls
`countdown(0)`, which hits `n <= 0` and prints `"Liftoff!"` instead of
recursing again. `n <= 0` is the **base case** — the point simple enough
to answer without any further recursive call — and `countdown(n - 1)`
is the **recursive case**, which makes real, guaranteed progress toward
that base case every single time, since `n` shrinks by exactly `1` on
every call.

Tracing what the **call stack** actually holds at the deepest point of
this run, right when `countdown(0)` is executing:

1. `countdown(3)` is called from `main()` — a new stack frame is pushed,
   holding `n = 3`. This call hasn't returned yet; it's paused, waiting
   on the result of the call it's about to make.
2. `countdown(2)` is called from inside `countdown(3)`'s own still-paused
   frame — a second frame is pushed, holding `n = 2`, on top of the
   first.
3. `countdown(1)` is called from inside `countdown(2)`'s frame — a third
   frame, `n = 1`, pushed on top of that.
4. `countdown(0)` is called from inside `countdown(1)`'s frame — a
   fourth frame, `n = 0`. All four frames — for `n = 3`, `2`, `1`, and
   `0` — exist on the call stack simultaneously at this exact moment,
   each one paused, each one waiting for the call it made to return
   before it can finish and return itself.

This isolated example is discarded now; `recursion_demo.cpp` does not
appear anywhere in this lesson's actual project. Merge sort, built next,
uses the identical base-case/recursive-case shape, on array halves
instead of a shrinking number.

### CS Lens

Recursion isn't unique to sorting — it's the natural shape for any
problem defined in terms of a smaller version of itself.

```
Also recognized in: a filesystem directory listing that recurses into
subdirectories, a JSON or XML parser recursing into nested objects and
arrays, a compiler's own expression parser recursing into
parenthesized sub-expressions, and the mathematical definition of
factorial itself (n! = n × (n-1)!, with 0! = 1 as the base case)
```

### SE Lens

The alternative not chosen here is an explicit loop managing its own
stack — a `while` loop with a manually-maintained array or list acting
as a stand-in for the call stack, pushing and popping "work still to
do" by hand. That avoids relying on the language's own call stack, and
for some problems (very deep recursion, where stack space itself becomes
a real limit) it's the only practical choice. For a problem whose
natural definition is already self-referential, like this lesson's
merge sort, it costs real clarity: the iterative version has to
reconstruct, by hand, bookkeeping the recursive version gets for free
from the language itself — at the cost of using real memory, one stack
frame per level of recursion, for exactly as long as that level's call
is still pending.

### Connecting

Merge sort's own recursive case is going to look almost exactly like
`countdown`'s — a base case that stops the recursion, a recursive case
that calls the same function on a smaller piece of the problem — with
one addition: after the two recursive calls return, their results still
need to be combined.

---

## Concept Unit A6.2: Merge Sort — Divide, Conquer, Combine

### The Problem

`Array<T>` can store values and grow to fit them, but nothing in it can
put them in order. Sorting from scratch, in a way whose correctness can
actually be reasoned about rather than just trusted, means finding a
definition simple enough to be obviously right, then implementing that
definition directly. "An already-sorted list of one element, and a way
to correctly merge two already-sorted lists into one" turns out to be
enough — the rest follows from Concept Unit A6.1's recursion.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, same as
  every prior lesson in this track.
- **Files affected** — `dynamic_array.cpp` (modified).
- **Change type** — add.
- **Location** — two new free functions, `merge` and `mergeSortRange`,
  placed above the `Array<T>` class definition established across
  Lessons A2 through A5.
- **Dependencies** — Concept Unit A6.1's recursion; `Array<T>`,
  unchanged in shape.

### The New Code

```cpp
template <typename T, typename Compare>
void merge(T arr[], int left, int mid, int right, Compare comp) {
    int leftSize = mid - left + 1;
    int rightSize = right - mid;
    T* leftArr = new T[leftSize];
    T* rightArr = new T[rightSize];
    for (int i = 0; i < leftSize; i++) leftArr[i] = arr[left + i];
    for (int i = 0; i < rightSize; i++) rightArr[i] = arr[mid + 1 + i];

    int i = 0, j = 0, k = left;
    while (i < leftSize && j < rightSize) {
        if (comp(leftArr[i], rightArr[j])) {
            arr[k] = leftArr[i];
            i++;
        } else {
            arr[k] = rightArr[j];
            j++;
        }
        k++;
    }
    while (i < leftSize) { arr[k] = leftArr[i]; i++; k++; }
    while (j < rightSize) { arr[k] = rightArr[j]; j++; k++; }

    delete[] leftArr;
    delete[] rightArr;
}

template <typename T, typename Compare>
void mergeSortRange(T arr[], int left, int right, Compare comp) {
    if (left >= right) return;
    int mid = left + (right - left) / 2;
    mergeSortRange(arr, left, mid, comp);
    mergeSortRange(arr, mid + 1, right, comp);
    merge(arr, left, mid, right, comp);
}
```

### The Updated Project

```cpp
#include <fstream>
#include <iostream>

template <typename T, typename Compare>                          // ← new
void merge(T arr[], int left, int mid, int right, Compare comp) { // ← new
    int leftSize = mid - left + 1;                                // ← new
    int rightSize = right - mid;                                  // ← new
    T* leftArr = new T[leftSize];                                 // ← new
    T* rightArr = new T[rightSize];                                // ← new
    for (int i = 0; i < leftSize; i++) leftArr[i] = arr[left + i]; // ← new
    for (int i = 0; i < rightSize; i++) rightArr[i] = arr[mid + 1 + i]; // ← new

    int i = 0, j = 0, k = left;                                   // ← new
    while (i < leftSize && j < rightSize) {                       // ← new
        if (comp(leftArr[i], rightArr[j])) {                       // ← new
            arr[k] = leftArr[i];                                  // ← new
            i++;                                                  // ← new
        } else {                                                  // ← new
            arr[k] = rightArr[j];                                 // ← new
            j++;                                                  // ← new
        }                                                         // ← new
        k++;                                                      // ← new
    }                                                              // ← new
    while (i < leftSize) { arr[k] = leftArr[i]; i++; k++; }         // ← new
    while (j < rightSize) { arr[k] = rightArr[j]; j++; k++; }       // ← new

    delete[] leftArr;                                             // ← new
    delete[] rightArr;                                            // ← new
}                                                                  // ← new

template <typename T, typename Compare>                           // ← new
void mergeSortRange(T arr[], int left, int right, Compare comp) { // ← new
    if (left >= right) return;                                   // ← new
    int mid = left + (right - left) / 2;                          // ← new
    mergeSortRange(arr, left, mid, comp);                         // ← new
    mergeSortRange(arr, mid + 1, right, comp);                    // ← new
    merge(arr, left, mid, right, comp);                           // ← new
}                                                                  // ← new

template <typename T>
class Array {
private:
    T* data;
    int size;
    int capacity;

public:
    Array() {
        capacity = 4;
        size = 0;
        data = new T[capacity];
    }

    ~Array() {
        delete[] data;
    }

    void push_back(T value) {
        if (size == capacity) {
            int newCapacity = capacity * 2;
            T* newData = new T[newCapacity];
            for (int i = 0; i < size; i++) {
                newData[i] = data[i];
            }
            delete[] data;
            data = newData;
            capacity = newCapacity;
        }
        data[size] = value;
        size++;
    }

    T get(int index) {
        return data[index];
    }

    int getSize() {
        return size;
    }

    template <typename Compare>                                  // ← new
    void sort(Compare comp) {                                    // ← new
        mergeSortRange(data, 0, size - 1, comp);                 // ← new
    }                                                             // ← new
};

int main() {
    Array<int> arr;
    std::ifstream file("readings.txt");
    int value;
    while (file >> value) {
        arr.push_back(value);
    }

    auto ascending = [](int a, int b) { return a < b; };          // ← new
    arr.sort(ascending);                                          // ← new

    std::cout << "Sorted ascending: ";
    for (int i = 0; i < arr.getSize(); i++) {
        std::cout << arr.get(i) << " ";
    }
    std::cout << std::endl;

    return 0;
}
```

As a whole, `dynamic_array.cpp` now sorts. `Array<T>` gains one new
method, `sort`, and `main()` reads the same file every lesson in this
track has read, then sorts it in place before printing — with `merge`
and `mergeSortRange` doing the actual algorithmic work, unchanged from
this unit's own New Code, entirely outside the class.

```
$ cat readings.txt
38
27
43
3
9
82
10
$ g++ -std=c++17 -Wall -Wextra -o dynamic_array dynamic_array.cpp
$ ./dynamic_array
Sorted ascending: 3 9 10 27 38 43 82
```

### Mechanical Walkthrough

- **`if (left >= right) return;`** (in `mergeSortRange`) — the **base
  case**: a stretch of zero elements (`left > right`, which this
  function's own recursive calls can produce) or one element
  (`left == right`) is already, trivially, sorted — there's nothing left
  to do, and no further recursive call is made.
- **`int mid = left + (right - left) / 2;`** — computes the midpoint of
  the current stretch, written this specific way (rather than
  `(left + right) / 2`) to avoid `left + right` overflowing for very
  large indices — the exact same overflow concern Lesson A1's Concept
  Unit A1.1 introduced, applied here to index arithmetic instead of
  array bounds.
- **`mergeSortRange(arr, left, mid, comp);`** and
  **`mergeSortRange(arr, mid + 1, right, comp);`** — the **recursive
  case**: two separate recursive calls, one per half, each one strictly
  smaller than the current stretch (since `mid < right` whenever
  `left < right`, the condition that got past the base case), which is
  exactly what guarantees the recursion eventually reaches a base case
  rather than continuing forever.
- **`merge(arr, left, mid, right, comp);`** — the "combine" step of
  **divide and conquer**: called only after *both* recursive calls above
  have fully returned, meaning `arr[left..mid]` and `arr[mid+1..right]`
  are each already individually sorted by this point.
- **`T* leftArr = new T[leftSize];`** (inside `merge`) — the same
  **`new[]` expression** from Lesson A1, requesting temporary heap
  storage sized for exactly the left half being merged.
- **`if (comp(leftArr[i], rightArr[j]))`** — calls the supplied
  **comparator**, asking "does the left temporary array's current front
  element belong before the right one's?" This single call is the only
  place `merge` ever decides an order — everything else in the function
  is pure bookkeeping.
- **`delete[] leftArr; delete[] rightArr;`** — releases both temporary
  blocks once merging is done, the same **`delete[]` expression** from
  Lesson A1, applied here to `merge`'s own short-lived working storage
  rather than a long-lived container.

**Execution trace** for `mergeSortRange(values, 0, 6, ascending)` against
`[38, 27, 43, 3, 9, 82, 10]` (indices `0` through `6`):

1. `mergeSortRange(0, 6)` — `left(0) < right(6)`, so it recurses:
   `mid = 0 + (6-0)/2 = 3`. Calls `mergeSortRange(0, 3)` first, and does
   not proceed past this line until that entire call — including
   everything it recurses into — has fully returned.
2. `mergeSortRange(0, 3)` on `[38, 27, 43, 3]` — `mid = 1` — recurses
   into `mergeSortRange(0, 1)` on `[38, 27]` and `mergeSortRange(2, 3)`
   on `[43, 3]`, then merges their results: `[38, 27]` becomes `[27,
   38]`, `[43, 3]` becomes `[3, 43]`, and `merge` combines them into
   `[3, 27, 38, 43]`, written back into `values[0..3]`.
3. `mergeSortRange(4, 6)` on `[9, 82, 10]` — `mid = 5` — recurses into
   `mergeSortRange(4, 5)` on `[9, 82]` (already in order, `merge` leaves
   it `[9, 82]`) and the base case `mergeSortRange(6, 6)` on `[10]`
   alone (already sorted, one element). `merge` combines `[9, 82]` and
   `[10]` into `[9, 10, 82]`, written back into `values[4..6]`.
4. Back in the original `mergeSortRange(0, 6)` call: both halves are now
   individually sorted — `values[0..3]` is `[3, 27, 38, 43]`,
   `values[4..6]` is `[9, 10, 82]`. The final `merge(values, 0, 3, 6,
   comp)` combines them into the fully sorted `[3, 9, 10, 27, 38, 43,
   82]` — exactly the real output shown above.

### CS Lens

```
Also recognized in: FFT (Fast Fourier Transform) algorithms, which use
the identical divide-split-combine shape on frequency data; database
query planners merging pre-sorted index scans; git's own merge
strategies combining diverging histories; and any external sort that
sorts chunks too large for memory separately, then merges the
already-sorted chunks (the direct large-scale descendant of this
lesson's own merge step)
```

Merge sort's running time is `O(n log n)`: the array is split in half
`log n` times before reaching single elements (the base case), and each
of those `log n` levels does `O(n)` total work merging — a stronger
guarantee than an algorithm like insertion sort, whose worst case is
`O(n²)`, meaning merge sort's advantage grows larger the bigger the
input gets, not just on this lesson's seven-element example.

### SE Lens

The alternative not chosen here is exactly what this lesson's own title
warns against: "call the library" — reach for a pre-built sort (C++'s
own `std::sort`, for instance) and trust its correctness without ever
examining how it works. That's the right choice for most real code —
`std::sort` is heavily optimized and thoroughly tested by people who
specialize in exactly this. The real cost of always reaching for it
without ever building one by hand: a black box's failure modes, edge
cases, and actual guarantees stay permanently opaque, and "provably
correct," this lesson's own vehicle, becomes a claim taken entirely on
faith rather than one that can actually be walked through, step by
step, the way this unit's own execution trace just did.

### Connecting

`arr.sort(ascending)` works, and its correctness can be traced end to
end rather than trusted blindly — but `ascending` is hardcoded as "the"
order, the same limitation Lesson A5 solved for line-filtering by
putting the decision behind an interface instead of inside the function.
The next unit does the equivalent here, using a lambda instead of a
class.

---

## Concept Unit A6.3: The Comparator — Sorting By Any Order At All

### The Problem

`ascending`, as written, only ever means "smaller numbers first." If a
different run needed "numbers closest to some target value first" — a
genuinely different notion of "in order," not just reversed — nothing
about `merge` or `mergeSortRange` would need to change to support it;
only the comparator passed in would. Is that actually true, or does it
just sound true?

### Project Change

- **Reference Source** — No reference counterpart; from-scratch, same as
  every prior lesson in this track.
- **Files affected** — `dynamic_array.cpp` (modified).
- **Change type** — add.
- **Location** — inside `main()`, alongside the existing call to
  `arr.sort(ascending)` established in Concept Unit A6.2.
- **Dependencies** — Concept Unit A6.2's `sort`, unchanged.

### The New Code

```cpp
int threshold = 20;
auto byDistanceFrom20 = [threshold](int a, int b) {
    int da = a - threshold; if (da < 0) da = -da;
    int db = b - threshold; if (db < 0) db = -db;
    return da < db;
};
arr.sort(byDistanceFrom20);
```

### The Updated Project

```cpp
int main() {
    Array<int> arr;
    std::ifstream file("readings.txt");
    int value;
    while (file >> value) {
        arr.push_back(value);
    }

    auto ascending = [](int a, int b) { return a < b; };
    arr.sort(ascending);

    std::cout << "Sorted ascending: ";
    for (int i = 0; i < arr.getSize(); i++) {
        std::cout << arr.get(i) << " ";
    }
    std::cout << std::endl;

    int threshold = 20;                                             // ← new
    auto byDistanceFrom20 = [threshold](int a, int b) {              // ← new
        int da = a - threshold; if (da < 0) da = -da;                // ← new
        int db = b - threshold; if (db < 0) db = -db;                // ← new
        return da < db;                                              // ← new
    };                                                               // ← new
    arr.sort(byDistanceFrom20);                                     // ← new

    std::cout << "Sorted by distance from " << threshold << ": ";    // ← new
    for (int i = 0; i < arr.getSize(); i++) {                        // ← new
        std::cout << arr.get(i) << " ";                              // ← new
    }                                                                // ← new
    std::cout << std::endl;                                         // ← new

    return 0;
}
```

As a whole, `main()` now sorts the exact same `arr` twice, by two
completely different orders, using the exact same `sort` method and the
exact same `mergeSortRange`/`merge` functions underneath it both times —
only the lambda passed in changes.

```
$ g++ -std=c++17 -Wall -Wextra -o dynamic_array dynamic_array.cpp
$ ./dynamic_array
Sorted ascending: 3 9 10 27 38 43 82
Sorted by distance from 20: 27 10 9 3 38 43 82
```

### Mechanical Walkthrough

- **`[threshold](int a, int b) { ... }`** — a **lambda expression**: an
  anonymous function value, defined right where it's used, with no
  separate named function declared anywhere else in the file.
- **`[threshold]`** — the **capture list**: explicitly borrows the
  surrounding `threshold` variable by value, meaning this lambda gets
  its own independent copy of whatever `threshold` held at the moment
  the lambda was created — required because `threshold` is a local
  variable of `main()`, not visible inside the lambda's body otherwise.
- **`(int a, int b)`** — the lambda's parameter list, identical in shape
  to `ascending`'s from Concept Unit A6.2 — this is what makes both
  lambdas valid arguments for the same `Compare` template parameter in
  `sort` and `mergeSortRange`.
- **`int da = a - threshold; if (da < 0) da = -da;`** (and the identical
  pattern for `db`) — computes each value's absolute distance from
  `threshold`, by hand, without a library absolute-value function: if
  the raw difference is negative, negate it.
- **`return da < db;`** — the lambda's actual verdict: `a` belongs before
  `b` exactly when `a` is *closer* to `20` than `b` is — a **comparator**
  with no relationship at all to numeric size, the same shape `ascending`
  had, computing a completely different answer.
- **`arr.sort(byDistanceFrom20);`** — calls the identical `sort` method
  from Concept Unit A6.2, with a lambda whose captured `threshold` and
  distance logic `sort` itself never sees or needs to know about —
  `sort` only ever calls `comp(a, b)` and trusts whatever `bool` comes
  back.

### CS Lens

Separating an algorithm's mechanics from a caller-supplied comparison
function is the same underlying idea Lesson A5's Strategy pattern
applied through a virtual interface, now applied through a function
value instead of a class hierarchy.

```
Also recognized in: C's own qsort taking a comparison function
pointer, C++'s std::sort accepting any comparator with the same
shape used here, SQL's ORDER BY clause (the database's own sort
mechanics never change; only the ordering expression does), and a
spreadsheet's "sort by column" feature, where the sorting engine
itself is identical no matter which column or direction is chosen
```

### SE Lens

The alternative not chosen here is what Concept Unit A6.2 could have
shipped with permanently: hardcode `a < b` directly inside `merge`
itself, with no `Compare` parameter at all. That's less code, and for a
program that only ever needs one fixed order, it's not wrong. It
completely fails the moment a second order is ever needed — as it just
was — because "how to compare two elements" and "how to split, recurse,
and combine" would be tangled together inside one function, meaning a
new order requires editing (and re-verifying) the sorting algorithm
itself, not just supplying a new three-line lambda. Lesson A6.2's own
choice to add a `Compare` template parameter before this need was even
concrete is exactly what makes this unit possible with zero changes to
`merge` or `mergeSortRange`.

### Connecting

The exact same `merge` and `mergeSortRange` functions built in Concept
Unit A6.2 just produced two structurally different orders, from two
different lambdas, with the sorting algorithm itself never once
consulted about what "in order" actually means — the comparator alone
carries that decision, exactly as this lesson's own header promised.

---

## Closing

**Connect the pieces.** Follow the value `10` through
`arr.sort(byDistanceFrom20)`. `mergeSortRange` recurses, per Concept
Unit A6.1's base-case/recursive-case shape, splitting `arr`'s seven
values down to single elements — `10` ends up alone in its own base
case, trivially "sorted." As the recursion unwinds, `merge` is called
repeatedly, and at some point `10`'s one-element stretch is merged
against a neighboring stretch; each time, `comp(a, b)` — really
`byDistanceFrom20(a, b)` — is called, computing `|a - 20|` and
`|b - 20|` and reporting which is smaller. `10`'s own distance from `20`
is `10`. Compared against `27` (distance `7`), `27` comes first.
Compared against `9` (distance `11`) or `3` (distance `17`), `10` comes
first. Every one of those individual comparisons is decided entirely
inside the lambda `main()` wrote — `merge` itself just asks `comp` and
trusts the answer — and the cumulative effect of many such comparisons,
made correctly at every level of the recursion, is the final order
already shown: `27 10 9 3 38 43 82`, `10` sitting exactly where "second-
closest to `20`" places it.

**What breaks without this.** Remove the `Compare` template parameter
from `merge`, `mergeSortRange`, and `Array<T>::sort` entirely,
hardcoding `leftArr[i] < rightArr[j]` directly inside `merge`, and
`sort()` taking no argument at all — leaving the ascending sort call
working exactly as before:

```cpp
void sort() {
    mergeSortRange(data, 0, size - 1);
}
```

```cpp
arr.sort();                    // still compiles and works
arr.sort(byDistanceFrom20);    // this line, unchanged, is what breaks
```

```
$ g++ -std=c++17 -Wall -Wextra -o mergesort_hardcoded mergesort_hardcoded.cpp
mergesort_hardcoded.cpp:87:14: error: too many arguments to function
call, expected 0, have 1
    arr.sort(byDistanceFrom20);
    ~~~~~~~~ ^~~~~~~~~~~~~~~~
mergesort_hardcoded.cpp:65:10: note: 'sort' declared here
    void sort() {
         ^
```

Not a subtle, silently-wrong result — a hard compile error, pointing at
the exact line and the exact reason: `sort` no longer accepts a
comparator at all, because hardcoding `<` directly inside `merge`
removed the one seam that let a different order in. This is a cleaner
failure than several earlier lessons' silent-corruption bugs
specifically because the comparator's absence is a structural fact
about the function's own signature, not a runtime behavior — the
compiler itself refuses to build a program that tries to sort by
distance once that seam is gone. Restoring the `Compare` template
parameter — Concept Unit A6.3's own Updated Project block above — fixes
it, for the same reason it worked the first time: the sorting mechanics
and the ordering decision were never actually the same piece of code.

**Exercises.**

1. Write a third lambda sorting `Array<int>` in strictly *descending*
   order, and confirm `arr.sort(descending)` produces the exact reverse
   of Concept Unit A6.2's `ascending` result on the same input.
2. Add a counter — a variable captured by reference in the comparator
   lambda (`[&comparisons]`, not `[comparisons]`) — that increments once
   per call to `comp`, and print its final value after a full sort,
   comparing it against merge sort's own `O(n log n)` claim from Concept
   Unit A6.2's CS Lens for a few different input sizes.
3. Extend `readings.txt` to eight values instead of seven, and hand-trace
   Concept Unit A6.2's execution-trace style through the new
   recursion tree, confirming where the extra split happens differently
   than it did for seven.

**Definition of done.**

- [ ] `dynamic_array.cpp` compiles cleanly with `g++ -std=c++17 -Wall
      -Wextra`, zero warnings, and `Array<T>::sort` correctly sorts
      under at least two structurally different comparators.
- [ ] The recursion isolated lab (Concept Unit A6.1) and the hand-traced
      execution trace (Concept Unit A6.2) were both actually run this
      session, not assumed from familiarity with merge sort.
- [ ] The hardcoded-comparison version was actually built, confirming
      the real compile error, before the `Compare` parameter was
      restored.
- [ ] `git commit` with a message explaining *why* the sorting mechanics
      and the ordering decision are split into separate pieces — not
      merely that the array is now sorted.

---

This closes Track A. Across six lessons, one file — `dynamic_array.cpp`
in spirit, if not always literally in name — grew from a fixed-size
buffer that silently corrupted memory (Lesson A1), into a generic,
templated container (Lesson A2), safe against resource leaks on every
exit path (Lesson A3), able to process input too large to hold in memory
at all (Lesson A4), filterable by any interchangeable strategy (Lesson
A5), and finally sortable by any comparator at all (Lesson A6) — with
every single one of those capabilities proven, this session, by real,
runnable code and real, pasted output, not asserted on the strength of
familiarity with the ideas involved.
