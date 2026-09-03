# Lesson 10: Pointers and Memory in Depth — Pointer Arithmetic, Function Pointers, and void*

What you will build: The reader will master pointers: pointer arithmetic (how p+1 knows how many bytes to advance), multi-level pointers, function pointers (and how they enable callbacks and polymorphism in C), the void* generic pointer, and const correctness. The transferable insight: a pointer is just an integer that holds a memory address. All the 'power' of pointers comes from the compiler knowing the type behind the pointer (so it can compute the right offset for pointer arithmetic) and from the hardware's ability to use an integer as a memory address.

What you need to know first: Lessons 00-09.

**Terms used in this lesson**
- **Pointer arithmetic** — the process of adding or subtracting integers to pointers; it solves the problem of navigating arrays by automatically scaling the offset by the size of the pointed-to type.
- **Multi-level pointer** — a pointer that holds the address of another pointer; it solves the problem of needing to modify a pointer's value (its stored address) from within a function.
- **`void*` (generic pointer)** — a pointer with no associated type; it solves the problem of writing generic functions that can operate on any data type without knowing that type at compile time.
- **Function pointer** — a pointer that holds the memory address of executable code; it solves the problem of runtime dispatch, allowing callbacks and polymorphism by treating functions as data.
- **`const` correctness** — the practice of using the `const` keyword to declare when data should not be modified; it solves the problem of accidental mutations by having the compiler enforce read-only contracts.

**Objects and methods used**
- **`malloc`**
  - *What it is:* A standard library function for dynamic memory allocation.
  - *Implementation:* `void *malloc(size_t size);`
  - *Its use:* To allocate memory on the heap for our integer through a multi-level pointer.
  - *Type:* Free function.
  - *Responsibility:* Allocates a specified number of bytes of uninitialized memory and returns a generic pointer to it.
  - *Depends on:* The requested size in bytes.
  - *Connects to:* Called by user code; returns a pointer that the caller must later `free`.
  - *Shape:* A fundamental OS/runtime memory management boundary.

- **`free`**
  - *What it is:* A standard library function for deallocating dynamic memory.
  - *Implementation:* `void free(void *ptr);`
  - *Its use:* To release memory previously allocated by `malloc`.
  - *Type:* Free function.
  - *Responsibility:* Returns dynamically allocated memory to the system heap.
  - *Depends on:* A pointer previously returned by a dynamic allocation function.
  - *Connects to:* Called by user code; interacts with the heap manager.
  - *Shape:* A fundamental OS/runtime memory management boundary.

- **`memcpy`**
  - *What it is:* A standard library function for copying blocks of memory.
  - *Implementation:* `void *memcpy(void *dst, const void *src, size_t n);`
  - *Its use:* Mentioned conceptually to demonstrate how `void*` enables type-agnostic operations.
  - *Type:* Free function.
  - *Responsibility:* Copies exactly `n` bytes from a source memory address to a destination memory address.
  - *Depends on:* Valid, non-overlapping source and destination pointers and a byte count.
  - *Connects to:* Called by user code.
  - *Shape:* Low-level memory manipulation utility.

- **`qsort`**
  - *What it is:* A standard library function for sorting arrays.
  - *Implementation:* `void qsort(void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *));`
  - *Its use:* To demonstrate a practical standard library use of `void*` and function pointers for generic sorting.
  - *Type:* Free function.
  - *Responsibility:* Sorts an array of any type using a user-provided comparison callback.
  - *Depends on:* Array base pointer, element count, element size, and a comparison function pointer.
  - *Connects to:* Called by user code; calls back into the user-provided comparison function multiple times.
  - *Shape:* Standard algorithmic utility bridging generic library code and specific user types.

## Concept Unit: Pointer arithmetic

### The Problem
When iterating over contiguous memory like an array, how do we advance to the next element? If an integer is 4 bytes and a double is 8 bytes, do we have to manually add 4 or 8 to our addresses every time? What if we want to write a loop that just says "go to the next item" regardless of its size?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <stdint.h>
#include <stddef.h>

int main(void) {
    int    arr_int[4]  = {1, 2, 3, 4};
    double arr_dbl[4]  = {1.0, 2.0, 3.0, 4.0};
    char   arr_chr[4]  = {'a', 'b', 'c', 'd'};

    int    *pi = arr_int;
    double *pd = arr_dbl;
    char   *pc = arr_chr;

    printf("int*  p+1 advances %td bytes\n", (char*)(pi+1) - (char*)pi);
    printf("double* p+1 advances %td bytes\n", (char*)(pd+1) - (char*)pd);
    printf("char*  p+1 advances %td bytes\n", (char*)(pc+1) - (char*)pc);
    return 0;
}
/* Output:
int*  p+1 advances 4 bytes
double* p+1 advances 8 bytes
char*  p+1 advances 1 bytes
*/
```
This is called **pointer arithmetic**. The output proves that adding 1 to a pointer actually adds the `sizeof` the type it points to. A pointer is an integer holding an address, but its type tells the compiler how to scale arithmetic operations on it.

### Discard the throwaway
The isolation code above is discarded and will not be added to the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating pointer arithmetic.
- **Files affected:** `pointer_arithmetic.c` (created)
- **Change type:** add
- **Location:** Brand-new file.
- **Dependencies:** Standard C library.

### The New Code
```c
#include <stdio.h>
#include <stdint.h>
#include <stddef.h>

int main(void) {
    int arr_int[4] = {1, 2, 3, 4};
    int *pi = arr_int;
    
    printf("pi+3 = %p\n", (void*)(pi+3));
    
    int *start = arr_int, *end = arr_int + 4;
    printf("end - start = %td elements\n", end - start);
    printf("byte diff = %td\n", (char*)end - (char*)start);
    return 0;
}
```

### The Updated Project
```c
// ← new (entire file)
1: #include <stdio.h>
2: #include <stdint.h>
3: #include <stddef.h>
4: 
5: int main(void) {
6:     int arr_int[4] = {1, 2, 3, 4};
7:     int *pi = arr_int;
8:     
9:     printf("pi+3 = %p\n", (void*)(pi+3));
10:     
11:     int *start = arr_int, *end = arr_int + 4;
12:     printf("end - start = %td elements\n", end - start);
13:     printf("byte diff = %td\n", (char*)end - (char*)start);
14:     return 0;
15: }
```
This file creates an array, demonstrates adding offsets to pointers, and shows the difference between subtracting pointers versus subtracting their byte addresses.

### Mechanical walkthrough
- `#include <stdio.h>`: Includes the standard I/O library for `printf`.
- `#include <stdint.h>`: Includes standard integer types.
- `#include <stddef.h>`: Includes definitions like `ptrdiff_t`.
- `int main(void) {`: Defines the entry point of the program.
- `int arr_int[4] = {1, 2, 3, 4};`: Declares an array of 4 integers and initializes them.
- `int *pi = arr_int;`: Declares a pointer to an `int` and points it to the first element of `arr_int`.
- `printf("pi+3 = %p\n", (void*)(pi+3));`: Calculates `pi+3`, casts the resulting address to `void*` for printing with `%p`. The address is advanced by `3 * sizeof(int)` bytes.
- `int *start = arr_int, *end = arr_int + 4;`: Creates a pointer to the start of the array and another pointer to one-past-the-end.
- `printf("end - start = %td elements\n", end - start);`: Subtracts the two pointers. Pointer difference is in elements, so the compiler divides the byte difference by `sizeof(int)`.
- `printf("byte diff = %td\n", (char*)end - (char*)start);`: Casts both pointers to `char*` before subtracting, which forces the compiler to calculate the difference in single bytes.
- `return 0;`: Exits the program successfully.
- `}`: Closes the main function.

### CS lens
Pointer arithmetic is the fundamental mechanism for array traversal and memory mapping. It appears in:
1. Virtual memory allocators scanning page tables.
2. Network packet parsers stepping through headers.
3. Graphics engines traversing vertex buffers.

### SE lens
By making pointer arithmetic implicitly scale by the type's size, C avoids manual offset calculations (e.g., `addr + i * 4`) which are highly error-prone. The tradeoff is that accidentally casting to the wrong pointer type before doing math will result in silent memory corruption as the compiler scales by the wrong size.

### Commands needed
`gcc -Wall -Wextra pointer_arithmetic.c -o pointer_arithmetic && ./pointer_arithmetic`

### Run it
Predicted confidently: Assuming `arr_int` is at `0x1000`, `pi+3` will be `0x100C`. `end - start` will be `4`, and `byte diff` will be `16`.

### One sentence connecting to previous unit
Now that we can navigate memory using pointer arithmetic, we need a way to modify pointers themselves from within functions.

## Concept Unit: Multi-level pointers

### The Problem
In C, everything is passed by value, including pointers. If a function receives a pointer and allocates new memory for it, the caller's pointer won't change because the function only modified its own local copy. How can a function alter the actual memory address stored in the caller's pointer?

### Introduce the concept in isolation
```c
#include <stdio.h>
#include <stdlib.h>

void set_value(int **pp, int val) {
    *pp = malloc(sizeof(int));
    **pp = val;
}

int main(void) {
    int *p = NULL;
    int **pp = &p;
    printf("p   = %p\n", (void*)p);
    printf("pp  = %p\n", (void*)pp);
    return 0;
}
/* Output:
p   = (nil)
pp  = 0x7ffd8... (some stack address)
*/
```
This introduces a **multi-level pointer**. The output proves that `pp` holds the address of the pointer `p`, not the address of an integer. By passing the address of a pointer, a function can dereference it to modify the original pointer.

### Discard the throwaway
This throwaway example is discarded and will not be part of the final project.

### Project Change
- **Reference Source:** No reference counterpart — demonstrating multi-level pointers.
- **Files affected:** `multilevel.c` (created)
- **Change type:** add
- **Location:** Brand-new file.
- **Dependencies:** `stdlib.h` for `malloc`.

### The New Code
```c
#include <stdio.h>
#include <stdlib.h>

void set_value(int **pp, int val) {
    *pp = malloc(sizeof(int));
    **pp = val;
}

int main(void) {
    int *p = NULL;
    set_value(&p, 42);
    printf("p = %p, *p = %d\n", (void*)p, *p);
    free(p);
    return 0;
}
```

### The Updated Project
```c
// ← new (entire file)
1: #include <stdio.h>
2: #include <stdlib.h>
3: 
4: void set_value(int **pp, int val) {
5:     *pp = malloc(sizeof(int));
6:     **pp = val;
7: }
8: 
9: int main(void) {
10:     int *p = NULL;
11:     set_value(&p, 42);
12:     printf("p = %p, *p = %d\n", (void*)p, *p);
13:     free(p);
14:     return 0;
15: }
```
This code passes the address of pointer `p` into `set_value`, which allocates memory and assigns it to `p` indirectly, then writes a value to that new memory.

### Mechanical walkthrough
- `#include <stdio.h>`: Standard I/O.
- `#include <stdlib.h>`: Includes `malloc` and `free`.
- `void set_value(int **pp, int val) {`: Declares a function taking a pointer-to-pointer-to-int `pp` and an integer `val`.
- `*pp = malloc(sizeof(int));`: Dereferences `pp` once to access the caller's pointer (`p`), and assigns it the address of freshly allocated memory.
- `**pp = val;`: Dereferences `pp` twice: first to get the caller's pointer, second to access the newly allocated integer, and writes `val` (42) into it.
- `}`: Closes `set_value`.
- `int main(void) {`: Defines entry point.
- `int *p = NULL;`: Declares a pointer `p` initialized to `NULL`.
- `set_value(&p, 42);`: Calls `set_value`, passing the address of `p` (creating the `int**`) and the value 42.
- `printf("p = %p, *p = %d\n", (void*)p, *p);`: Prints the newly allocated address in `p` and the value it points to (42).
- `free(p);`: Frees the dynamically allocated memory to prevent memory leaks.
- `return 0;`: Exits successfully.
- `}`: Closes `main`.

### CS lens
Multi-level pointers represent indirection, a core CS concept. They appear in:
1. Two-dimensional arrays (arrays of pointers).
2. Linked list insertion algorithms that update the `head` pointer.
3. Command-line argument parsing (`char **argv`).

### SE lens
Passing double pointers allows functions to initialize structures without returning them, which frees up the return value for error codes (e.g., `int create_thing(Thing **out_thing)`). The alternative is returning a pointer, which means errors must be signaled via `NULL` or global variables like `errno`.

### Commands needed
`gcc -Wall -Wextra multilevel.c -o multilevel && ./multilevel`

### Run it
Predicted confidently: `p` will print a valid heap address (e.g., `0x55d3...`), and `*p` will print `42`.

### One sentence connecting to previous unit
While multi-level pointers let us modify pointers across scopes, sometimes we want to write functions that can handle pointers to *any* data type, not just `int`.

## Concept Unit: void*

### The Problem
If we want to write a function that finds the maximum of two values, we normally have to write one for `int`, one for `double`, etc. How can we build a single, generic function that can hold addresses of varying types and process them without the compiler enforcing rigid type checks on the pointers?

### Introduce the concept in isolation
```c
#include <stdio.h>

int main(void) {
    int x = 10;
    double y = 3.14;
    void *ptr;
    
    ptr = &x;
    printf("ptr holds int: %d\n", *(int*)ptr);
    
    ptr = &y;
    printf("ptr holds double: %f\n", *(double*)ptr);
    return 0;
}
/* Output:
ptr holds int: 10
ptr holds double: 3.140000
*/
```
This uses **`void*`**, the generic pointer. The output proves that a `void*` can seamlessly hold the address of an `int` and then a `double`. However, because it has no type, it cannot be dereferenced or used for pointer arithmetic without being explicitly cast to a concrete type first.

### Discard the throwaway
This throwaway snippet is deleted and won't be used in the final project.

### Project Change
- **Reference Source:** No reference counterpart — demonstrating generic pointers.
- **Files affected:** `generic_max.c` (created)
- **Change type:** add
- **Location:** Brand-new file.
- **Dependencies:** `stdlib.h`

### The New Code
```c
#include <stdio.h>
#include <stdlib.h>

void *generic_max(void *a, void *b, int (*cmp)(const void*, const void*)) {
    return cmp(a, b) >= 0 ? a : b;
}

int cmp_int(const void *a, const void *b) {
    return *(int*)a - *(int*)b;
}

int main(void) {
    int x = 10, y = 20;
    int *max_int = generic_max(&x, &y, cmp_int);
    printf("max int: %d\n", *max_int);
    return 0;
}
```

### The Updated Project
```c
// ← new (entire file)
1: #include <stdio.h>
2: #include <stdlib.h>
3: 
4: void *generic_max(void *a, void *b, int (*cmp)(const void*, const void*)) {
5:     return cmp(a, b) >= 0 ? a : b;
6: }
7: 
8: int cmp_int(const void *a, const void *b) {
9:     return *(int*)a - *(int*)b;
10: }
11: 
12: int main(void) {
13:     int x = 10, y = 20;
14:     int *max_int = generic_max(&x, &y, cmp_int);
15:     printf("max int: %d\n", *max_int);
16:     return 0;
17: }
```
This shows a generic maximum function that takes `void*` arguments and relies on a type-aware comparison function to do the actual logic.

### Mechanical walkthrough
- `#include <stdio.h>`: For `printf`.
- `#include <stdlib.h>`: Standard library definitions.
- `void *generic_max(void *a, void *b, int (*cmp)(const void*, const void*)) {`: Defines a generic max function returning `void*`. It accepts two `void*` elements and a function pointer `cmp` used to compare them.
- `return cmp(a, b) >= 0 ? a : b;`: Calls the `cmp` function with `a` and `b`. If the result is >= 0, it returns `a`, otherwise `b`.
- `}`: Closes `generic_max`.
- `int cmp_int(const void *a, const void *b) {`: Defines a comparison function that matches the signature expected by `generic_max`.
- `return *(int*)a - *(int*)b;`: Casts the `void*` inputs to `int*`, dereferences them to get the actual integer values, and subtracts them. A negative result means `a < b`.
- `}`: Closes `cmp_int`.
- `int main(void) {`: Main entry point.
- `int x = 10, y = 20;`: Declares two integers.
- `int *max_int = generic_max(&x, &y, cmp_int);`: Calls the generic max function, passing the addresses of the ints (implicitly cast to `void*`) and the `cmp_int` function. The returned `void*` is assigned to an `int*`.
- `printf("max int: %d\n", *max_int);`: Dereferences the returned pointer and prints it (20).
- `return 0;`: Exits cleanly.
- `}`: Closes main.

### CS lens
Generic pointers represent type erasure. The language runtime strips type information, passing raw bytes, while relying on the programmer to reconstruct the type accurately later. This shows up in:
1. Custom memory allocators (like `malloc` itself).
2. POSIX threading (`pthread_create` passes arguments as `void*`).
3. Serialization protocols processing raw buffers.

### SE lens
Using `void*` allows for highly reusable code (like C's `qsort`), shrinking binary size by avoiding template bloat. The trade-off is complete loss of compile-time type safety: passing a `cmp_double` function to evaluate two integer addresses will compile fine but fail at runtime.

### Commands needed
`gcc -Wall -Wextra generic_max.c -o generic_max && ./generic_max`

### Run it
Predicted confidently: The output will be `max int: 20` because `10 - 20 = -10` which is less than 0, causing `generic_max` to return `b` (`&y`).

### One sentence connecting to previous unit
The generic `void*` approach relies entirely on being able to pass logic around as data, which brings us to function pointers.

## Concept Unit: Function pointers

### The Problem
If we want a generic function to perform different behaviors depending on the context (like sorting in ascending vs descending order, or applying different mathematical operations to a stream of numbers), how can we pass the *behavior* itself as an argument?

### Introduce the concept in isolation
```c
#include <stdio.h>

int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }

int main(void) {
    int (*op)(int, int) = add;
    printf("Result: %d\n", op(2, 3));
    op = mul;
    printf("Result: %d\n", op(2, 3));
    return 0;
}
/* Output:
Result: 5
Result: 6
*/
```
This is a **function pointer**. The output proves that `op` can hold the memory address of the `add` function, and later be reassigned to hold the address of the `mul` function. The CPU executes whatever machine code lives at the address currently held in the pointer.

### Discard the throwaway
The throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `func_pointers.c` (created)
- **Change type:** add
- **Location:** Brand-new file.
- **Dependencies:** `math.h`

### The New Code
```c
#include <stdio.h>
#include <math.h>

typedef double (*MathFn)(double);

double apply(MathFn fn, double x) {
    return fn(x);
}

double square(double x) { return x * x; }
double cube(double x)   { return x * x * x; }

int main(void) {
    MathFn ops[] = {square, cube, sqrt, fabs};
    const char *names[] = {"square", "cube", "sqrt", "fabs"};
    double x = 4.0;
    
    for (int i = 0; i < 4; i++) {
        printf("%s(%.1f) = %.4f\n", names[i], x, ops[i](x));
    }
    return 0;
}
```

### The Updated Project
```c
// ← new (entire file)
1: #include <stdio.h>
2: #include <math.h>
3: 
4: typedef double (*MathFn)(double);
5: 
6: double apply(MathFn fn, double x) {
7:     return fn(x);
8: }
9: 
10: double square(double x) { return x * x; }
11: double cube(double x)   { return x * x * x; }
12: 
13: int main(void) {
14:     MathFn ops[] = {square, cube, sqrt, fabs};
15:     const char *names[] = {"square", "cube", "sqrt", "fabs"};
16:     double x = 4.0;
17:     
18:     for (int i = 0; i < 4; i++) {
19:         printf("%s(%.1f) = %.4f\n", names[i], x, ops[i](x));
20:     }
21:     return 0;
22: }
```
We define a function pointer type `MathFn`, create an array of these pointers (mixing custom functions and standard math library functions), and loop through them to apply different behaviors to the same number.

### Mechanical walkthrough
- `#include <stdio.h>`: For output.
- `#include <math.h>`: Provides standard math functions like `sqrt` and `fabs`.
- `typedef double (*MathFn)(double);`: Creates an alias `MathFn` for a pointer to a function that takes a `double` and returns a `double`.
- `double apply(MathFn fn, double x) {`: Declares a function that takes a function pointer and a double.
- `return fn(x);`: Invokes the function whose address is stored in `fn`, passing it `x`.
- `}`: Closes `apply`.
- `double square(double x) { return x * x; }`: Defines a custom function matching the `MathFn` signature.
- `double cube(double x) { return x * x * x; }`: Defines another custom function.
- `int main(void) {`: Main function.
- `MathFn ops[] = {square, cube, sqrt, fabs};`: Creates an array of function pointers. It seamlessly mixes our local functions with `math.h` library functions.
- `const char *names[] = {"square", "cube", "sqrt", "fabs"};`: Array of string literals for printing.
- `double x = 4.0;`: The test value.
- `for (int i = 0; i < 4; i++) {`: Iterates over the array.
- `printf("%s(%.1f) = %.4f\n", names[i], x, ops[i](x));`: Uses `ops[i](x)` to dereference the function pointer at index `i` and call it with `x`.
- `}`: Closes the loop.
- `return 0;`: Exits.
- `}`: Closes main.

### CS lens
Function pointers are the bedrock of runtime polymorphism. They are the implementation behind:
1. Virtual Method Tables (vtables) in object-oriented languages like C++ and Java.
2. Event-driven programming callbacks (e.g., UI button clicks).
3. Plugin architectures loading shared libraries dynamically.

### SE lens
Arrays of function pointers enable the "Command Pattern" in C. It allows branching logic (`if/else` or `switch` statements) to be replaced by a simple lookup table, which scales infinitely without growing the complexity of the main loop. The downside is that static analysis tools struggle to track control flow through pointers.

### Commands needed
`gcc -Wall -Wextra func_pointers.c -lm -o func_pointers && ./func_pointers`

### Run it
Predicted confidently:
```
square(4.0) = 16.0000
cube(4.0) = 64.0000
sqrt(4.0) = 2.0000
fabs(4.0) = 4.0000
```

### One sentence connecting to previous unit
As we start passing pointers all over our program—especially strings and buffers—we need a way to promise that a function won't accidentally overwrite the data a pointer points to.

## Concept Unit: const correctness

### The Problem
If I pass you a pointer to my data, you have direct memory access and can change it. How can I enforce, at compile time, a strict contract that says "you can look at this data, but you cannot alter it"?

### Introduce the concept in isolation
```c
#include <stdio.h>

int main(void) {
    int x = 5;
    const int *p = &x;
    
    // *p = 10; // This line would cause a compile error
    x = 10;     // This is fine
    
    printf("Value is %d\n", *p);
    return 0;
}
/* Output:
Value is 10
*/
```
This is **`const` correctness**. The output proves that while the data itself (`x`) can still be mutated directly, the pointer `p` acts as a read-only lens. The compiler will reject any attempt to modify the value *through* `p`.

### Discard the throwaway
The throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `const_correct.c` (created)
- **Change type:** add
- **Location:** Brand-new file.
- **Dependencies:** `string.h`

### The New Code
```c
#include <stdio.h>
#include <string.h>

size_t my_strlen(const char *s) {
    size_t len = 0;
    while (*s++) len++;
    return len;
}

void print_array(const int *arr, int n) {
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
}

int main(void) {
    char s[] = "hello";
    printf("strlen = %zu\n", my_strlen(s));
    
    int arr[] = {3, 1, 4, 1, 5};
    print_array(arr, 5);
    return 0;
}
```

### The Updated Project
```c
// ← new (entire file)
1: #include <stdio.h>
2: #include <string.h>
3: 
4: size_t my_strlen(const char *s) {
5:     size_t len = 0;
6:     while (*s++) len++;
7:     return len;
8: }
9: 
10: void print_array(const int *arr, int n) {
11:     for (int i = 0; i < n; i++) {
12:         printf("%d ", arr[i]);
13:     }
14:     printf("\n");
15: }
16: 
17: int main(void) {
18:     char s[] = "hello";
19:     printf("strlen = %zu\n", my_strlen(s));
20:     
21:     int arr[] = {3, 1, 4, 1, 5};
22:     print_array(arr, 5);
23:     return 0;
24: }
```
This code demonstrates common patterns for read-only parameter passing: taking a string and an array without modifying them.

### Mechanical walkthrough
- `#include <stdio.h>`: I/O definitions.
- `#include <string.h>`: String utility definitions.
- `size_t my_strlen(const char *s) {`: Takes a pointer to a `char`, but the `const` promises the compiler that `my_strlen` will not modify the characters in the string.
- `size_t len = 0;`: Counter initialization.
- `while (*s++) len++;`: Dereferences `s`, checks if it is non-zero (not the null terminator), then increments the pointer (pointer arithmetic), then increments `len`.
- `return len;`: Returns the length.
- `}`: Closes `my_strlen`.
- `void print_array(const int *arr, int n) {`: Takes a `const int *`, promising not to alter the array elements.
- `for (int i = 0; i < n; i++) {`: Loops `n` times.
- `printf("%d ", arr[i]);`: Reads the value using array indexing (which is syntactic sugar for pointer arithmetic `*(arr + i)`).
- `}`: Closes the loop.
- `printf("\n");`: Prints a newline.
- `}`: Closes `print_array`.
- `int main(void) {`: Main entry point.
- `char s[] = "hello";`: Creates a mutable character array.
- `printf("strlen = %zu\n", my_strlen(s));`: Calls `my_strlen`. The mutable `char[]` implicitly converts to a read-only `const char*`.
- `int arr[] = {3, 1, 4, 1, 5};`: Creates an array of integers.
- `print_array(arr, 5);`: Passes the array to the printing function safely.
- `return 0;`: Exits successfully.
- `}`: Closes main.

### CS lens
`const` is an application of static analysis and type theory where immutability is encoded into the type system itself. This appears in:
1. Rust's borrow checker (default immutability).
2. Operating system kernel APIs distinguishing between read-only and writeable page faults.
3. Functional programming languages where all state is immutable.

### SE lens
Using `const` generously on function parameters creates self-documenting code. A caller instantly knows if they can safely pass critical data to a function. The tradeoff is "const infection"—once a pointer is const, any function it gets passed into must also declare it const, which can require widespread refactoring in older codebases.

### Commands needed
`gcc -Wall -Wextra const_correct.c -o const_correct && ./const_correct`

### Run it
Predicted confidently:
```
strlen = 5
3 1 4 1 5 
```

### One sentence connecting to previous unit
With const protecting our memory, we are prepared to explore what happens when memory allocation goes wrong.

## Closing

### Connect the pieces
Trace a generic swap function across everything we've learned:
```c
void swap(void *a, void *b, size_t size) {
    char temp[size]; // VLAs or dynamic allocation
    memcpy(temp, a, size);
    memcpy(a, b, size);
    memcpy(b, temp, size);
}
```
If we call this function, `a` and `b` are `void*` generic pointers (Unit 3). To move the data, `memcpy` must treat these addresses as `char*` to perform single-byte pointer arithmetic (Unit 1) up to `size`. Because it alters the caller's variables through their addresses, it acts as a generalized multi-level pointer mechanism (Unit 2). In a broader system, a callback passed as a function pointer (Unit 4) might use `swap` internally to rearrange elements, provided the caller hasn't locked the targets down with `const` (Unit 5).

Pointers are addresses; types give them meaning. Lesson 11 covers the memory allocation bugs that arise from using pointers incorrectly. A function pointer is just a code address stored in a variable — it is the C foundation for callbacks, vtables, plugin systems, and every other form of runtime dispatch.
