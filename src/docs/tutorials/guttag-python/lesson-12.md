# Lesson 12: Functions as Objects — `lambda`, `map`, `filter`, `sorted`

The reader will understand that functions are first-class objects in Python — they can be stored in variables, passed as arguments, and returned from other functions. We will build an understanding of higher-order programming by using `lambda`, `map()`, `filter()`, `sorted()` with `key=`, and writing our own higher-order functions. The transferable problems are: treating functions as values enables abstraction over BEHAVIOR, not just data; `sorted(data, key=fn)` is the canonical example of sorting by any criterion by passing a function; and writing custom higher-order functions builds the mental model for decorators.

**What you need to know first:** Lessons 0–11 (REPL, all types, variables, conditionals, iteration, functions, strings, lists, tuples, dicts, sets, comprehensions).

**Terms used in this lesson:**
- **`def`** — keyword that creates a named function object and binds it to a variable in the current scope. Solves the problem of defining reusable logic.
- **`return`** — exits a function, passing a computed value back to the caller. Solves the problem of retrieving results from function bodies.
- **`is`** — identity operator. Checks if two variables refer to the exact same object in memory. Solves the problem of verifying object identity versus structural equality.
- **`lambda`** — keyword for anonymous functions. Evaluates to a function object without assigning a name. Solves the problem of defining short, single-expression functions inline.
- **`key`** — parameter for sort criteria. Accepts a function to extract a comparison key from each element. Solves the problem of sorting data by arbitrary attributes.
- **`reverse`** — parameter for descending sort. Reverses the resulting order. Solves the problem of needing largest-first sorting without negating keys.
- **`None`** — singleton representing the absence of a value. Solves the problem of needing a null literal.

**Objects and methods used:**

**`type`**
- *What it is:* Built-in function to query the runtime type of an object.
- *Implementation:* `class type(object)`
- *Its use:* To prove that functions are instances of `<class 'function'>`.
- *Type:* Built-in function/class.
- *Responsibility:* Returns the type object of the argument.
- *Depends on:* Any Python object.
- *Connects to:* Called by user code to inspect objects.
- *Shape:* Diagnostic utility.

**`abs`**
- *What it is:* Built-in absolute value function.
- *Implementation:* `def abs(__x: SupportsAbs[_T]) -> _T`
- *Its use:* Used as an example function to pass as an argument.
- *Type:* Built-in function.
- *Responsibility:* Computes the non-negative magnitude of a number.
- *Depends on:* A numeric argument.
- *Connects to:* Called by higher-order functions to transform numbers.
- *Shape:* Standard library math utility.

**`len`**
- *What it is:* Built-in length function.
- *Implementation:* `def len(__obj: Sized) -> int`
- *Its use:* Used as a key function for sorting words by length.
- *Type:* Built-in function.
- *Responsibility:* Counts the number of items in a container.
- *Depends on:* A container object (like a string or list).
- *Connects to:* Passed to `sorted` to dictate sort order.
- *Shape:* Standard library utility.

**`print`**
- *What it is:* Built-in output function.
- *Implementation:* `def print(*values: object, sep: str | None = ..., end: str | None = ..., file: SupportsWrite[str] | None = ..., flush: bool = ...) -> None`
- *Its use:* To display execution results.
- *Type:* Built-in function.
- *Responsibility:* Writes string representations of objects to standard output.
- *Depends on:* Objects to print.
- *Connects to:* Outputs to the console.
- *Shape:* Standard I/O utility.

**`sorted`**
- *What it is:* Built-in function that returns a new sorted list from an iterable.
- *Implementation:* `def sorted(__iterable: Iterable[_T], *, key: Callable[[_T], SupportsRichComparison] | None = ..., reverse: bool = ...) -> list[_T]`
- *Its use:* To demonstrate sorting data using function arguments as keys.
- *Type:* Built-in function.
- *Responsibility:* Produces a new list containing all items from the iterable in ascending order (or descending if specified).
- *Depends on:* An iterable, and optionally a `key` function.
- *Connects to:* Calls the `key` function on each element.
- *Shape:* Standard library collection processing.

**`map`**
- *What it is:* Built-in function to apply a function to every item of an iterable.
- *Implementation:* `class map(Iterator[_R])`
- *Its use:* To transform sequences without explicit loops.
- *Type:* Built-in class/iterator.
- *Responsibility:* Lazily evaluates a function over elements of an iterable.
- *Depends on:* A function and one or more iterables.
- *Connects to:* Calls the provided function for each iteration step.
- *Shape:* Standard functional primitive.

**`list`**
- *What it is:* Built-in mutable sequence type.
- *Implementation:* `class list(MutableSequence[_T])`
- *Its use:* To force evaluation of lazy iterators like `map` and `filter` for display.
- *Type:* Built-in class.
- *Responsibility:* Stores an ordered, mutable collection of objects.
- *Depends on:* An iterable (optional) to populate it.
- *Connects to:* Consumes iterators to realize them in memory.
- *Shape:* Core data structure.

**`range`**
- *What it is:* Built-in sequence type for numbers.
- *Implementation:* `class range(Sequence[int])`
- *Its use:* To generate numbers for mapping and filtering examples.
- *Type:* Built-in class.
- *Responsibility:* Yields a sequence of integers lazily.
- *Depends on:* Start, stop, and step integer arguments.
- *Connects to:* Iterated over by loops or functions like `map`.
- *Shape:* Core sequence generator.

**`str`**
- *What it is:* Built-in text sequence type.
- *Implementation:* `class str(Sequence[str])`
- *Its use:* Passed to `map` to convert numbers to strings.
- *Type:* Built-in class.
- *Responsibility:* Represents immutable text data.
- *Depends on:* An object to convert to its string representation.
- *Connects to:* Called by `map` on each number.
- *Shape:* Core data type.

**`filter`**
- *What it is:* Built-in function to construct an iterator from elements for which a function returns true.
- *Implementation:* `class filter(Iterator[_T])`
- *Its use:* To keep specific elements in a sequence based on a predicate.
- *Type:* Built-in class/iterator.
- *Responsibility:* Lazily yields items from the iterable that pass the predicate.
- *Depends on:* A predicate function (or None) and an iterable.
- *Connects to:* Calls the predicate function on each item.
- *Shape:* Standard functional primitive.

**`functools.reduce`**
- *What it is:* Function to fold a sequence down to a single value.
- *Implementation:* `def reduce(__function: Callable[[_T, _S], _T], __sequence: Iterable[_S], __initial: _T = ...) -> _T`
- *Its use:* To accumulate a result over a sequence, such as summing numbers.
- *Type:* Library function.
- *Responsibility:* Applies a function of two arguments cumulatively to the items of a sequence.
- *Depends on:* A binary function and a sequence.
- *Connects to:* Iterates through the sequence, passing the accumulator and the next item to the function.
- *Shape:* Functional fold operation.

**`max`**
- *What it is:* Built-in function to find the largest item.
- *Implementation:* `def max(__arg1: _T, __arg2: _T, *args: _T, key: Callable[[_T], SupportsRichComparison] | None = ...) -> _T`
- *Its use:* Passed to `reduce` to find the maximum in a sequence.
- *Type:* Built-in function.
- *Responsibility:* Returns the maximum value from its arguments or an iterable.
- *Depends on:* Comparable objects.
- *Connects to:* Uses rich comparison methods on objects.
- *Shape:* Standard library math utility.


## Concept Unit: Functions are Objects

### The Problem
How can we treat a piece of logic as a piece of data? If we define a function to square a number, what happens if we assign that function to a variable, or put it in a list? What would you try here first? Pause and sketch what you think `type(square)` would print.

### Introduce the concept in isolation
```python
# Lab 1
>>> def lab_func(): return 1
...
>>> x = lab_func
>>> x()
1
```
This proves we can assign a function to a new variable and call it via that new variable. This is called treating functions as **first-class objects**.

### Discard the throwaway example
The throwaway example `lab_func` is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating core language semantics.
- **Files affected:** `demo.py`
- **Change type:** Add
- **Location:** Brand-new file
- **Dependencies:** None

### The New Code
```python
def square(x):
    return x * x

f = square
print(f(5))
print(type(f))
print(type(square))
print(f is square)

functions = [square, abs, len]
print(functions[0](4))
print(functions[1](-7))
print(functions[2]([1, 2, 3]))
```

### The Updated Project
```python
# demo.py
def square(x):
    return x * x

f = square
print(f(5))
print(type(f))
print(type(square))
print(f is square)

functions = [square, abs, len]
print(functions[0](4))
print(functions[1](-7))
print(functions[2]([1, 2, 3]))
```
The file now defines a function, binds it to variables, and executes it from a list.

### Mechanical walkthrough
- `def square(x):` defines a new function object and binds it to the name `square`.
- `f = square` assigns the exact same function object to a new variable `f`. Note there are no parentheses `()`, meaning we are referring to the function itself, not calling it.
- `f(5)` calls the function object held in `f` with argument `5`.
- `type(f)` queries the class of the object, proving it is a `<class 'function'>`.
- `f is square` tests object identity, proving `f` and `square` are identical in memory.
- `functions = [square, abs, len]` creates a list containing three function objects.
- `functions[0](4)` accesses the first function in the list and calls it.

### CS Lens
Functions as first-class objects is the foundation of functional programming. Also recognized in: callbacks in JavaScript, delegates in C#, function pointers in C, and closures in Lisp.

### SE Lens
Treating functions as objects allows us to abstract over behavior. The alternative is writing repetitive boilerplate or complex conditionals for every variation of logic.

### Commands needed
`python demo.py` - Runs the script.

### Run it
```
25
<class 'function'>
<class 'function'>
True
16
7
3
```
This proves the file executes successfully and the function object has identity.

### One sentence connecting this unit
Now that we can store functions in variables, we can pass them as arguments to other functions.

## Concept Unit: Functions as arguments

### The Problem
If we can pass data to functions to abstract over values, can we pass functions to functions to abstract over actions? What happens if you define a function that takes a parameter `f`, and then does `f(x)` inside its body? Pause and try to write a function that executes another function twice.

### Introduce the concept in isolation
```python
# Lab 2
>>> def run_it(f): return f()
...
>>> run_it(lambda: "hello")
'hello'
```
This proves a function can accept another function as an argument and execute it. Functions that accept or return other functions are called **higher-order functions**.

### Discard the throwaway example
The throwaway example `run_it` is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `demo.py`
- **Change type:** Add
- **Location:** Bottom of `demo.py`
- **Dependencies:** None

### The New Code
```python
def apply_twice(f, x):
    return f(f(x))

def double(x):
    return x * 2

print(apply_twice(double, 3))
print(apply_twice(square, 2))
print(apply_twice(abs, -5))
```

### The Updated Project
```python
# demo.py
def square(x):
    return x * x
# ... previous code ...

# ← new
def apply_twice(f, x):
    return f(f(x))

def double(x):
    return x * 2

print(apply_twice(double, 3))
print(apply_twice(square, 2))
print(apply_twice(abs, -5))
```
The file now demonstrates higher-order programming with `apply_twice`.

### Mechanical walkthrough
- `def apply_twice(f, x):` defines a function taking a function `f` and a value `x`.
- `f(x)` calls the incoming function with the value.
- `f(f(x))` calls the incoming function again on the result of the first call.
- `apply_twice(double, 3)` passes the function object `double` and the integer `3`.

1. Call `apply_twice(double, 3)`: Call frame opens. `f=double`, `x=3`.
2. First call `f(x)` is `double(3)`, evaluates to `6`.
3. Second call `f(6)` is `double(6)`, evaluates to `12`.
4. Returns `12`.

### CS Lens
Higher-order functions allow algorithms to be parameterized by behavior. Also recognized in: Strategy pattern, map/reduce, event listeners.

### SE Lens
This design enables extreme reuse. The alternative is writing `apply_double_twice()`, `apply_square_twice()`, duplicating the structural logic.

### Commands needed
`python demo.py`

### Run it
```
12
16
5
```
Proves the higher-order execution works correctly for different injected behaviors.

### One sentence connecting this unit
Passing named functions works well, but sometimes defining a whole function for a single use is tedious, which introduces anonymous functions.

## Concept Unit: lambda

### The Problem
If we only need a tiny function once (like adding two numbers), writing a full `def` block is verbose. How do we create a function object directly in an expression? Pause and guess how you might write a function without a name.

### Introduce the concept in isolation
```python
# Lab 3
>>> (lambda: 42)()
42
```
This proves we can create and instantly call a function without naming it. This is called a **lambda expression**.

### Discard the throwaway example
The throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `demo.py`
- **Change type:** Add
- **Location:** Bottom of `demo.py`

### The New Code
```python
square_lambda = lambda x: x * x
print(square_lambda(5))
print((lambda x, y: x + y)(3, 4))
add = lambda a, b: a + b
print(add(10, 20))
```

### The Updated Project
```python
# demo.py
# ... previous code ...

# ← new
square_lambda = lambda x: x * x
print(square_lambda(5))
print((lambda x, y: x + y)(3, 4))
add = lambda a, b: a + b
print(add(10, 20))
```

### Mechanical walkthrough
- `lambda x: x * x` evaluates to a new anonymous function object taking parameter `x`. The colon separates parameters from the body. There is no `return` keyword because the expression *is* the return value.
- `square_lambda = ...` assigns the anonymous function to a variable, showing it's just an object.
- `(lambda x, y: x + y)(3, 4)` creates a function object and immediately calls it with arguments `3, 4`.

### CS Lens
Lambda calculus is the foundational mathematical system underlying functional programming. Also recognized in: arrow functions in JS, lambdas in Java/C++, closures in Swift.

### SE Lens
Lambdas are ideal for one-off callbacks. The alternative is polluting the namespace with single-use named functions. Use `def` for anything more complex than a single expression.

### Commands needed
`python demo.py`

### Run it
```
25
7
30
```
Proves lambdas evaluate correctly and can be called like normal functions.

### One sentence connecting this unit
Lambdas become incredibly powerful when paired with built-in higher-order functions like sorting.

## Concept Unit: sorted()

### The Problem
How do you sort a list of strings by their length instead of alphabetically? Or sort a list of dictionaries by a specific key? Pause and look up the `key` parameter of the built-in `sorted` function.

### Introduce the concept in isolation
```python
# Lab 4
>>> sorted(["cc", "a", "bbb"], key=len)
['a', 'cc', 'bbb']
```
This proves `sorted` can accept a function to extract the sort criterion from each element. This relies on the **key function** pattern.

### Discard the throwaway example
The throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `demo.py`
- **Change type:** Add
- **Location:** Bottom of `demo.py`

### The New Code
```python
words = ['banana', 'apple', 'fig', 'cherry', 'date']

print(sorted(words, key=len))
print(sorted(words, key=lambda w: w[-1]))

people = [{'name': 'Carol', 'age': 35},
          {'name': 'Alice', 'age': 28},
          {'name': 'Bob',   'age': 42}]
print(sorted(people, key=lambda p: p['age']))
print(sorted([3,1,4,1,5], reverse=True))
```

### The Updated Project
```python
# demo.py
# ... previous code ...

# ← new
words = ['banana', 'apple', 'fig', 'cherry', 'date']

print(sorted(words, key=len))
print(sorted(words, key=lambda w: w[-1]))

people = [{'name': 'Carol', 'age': 35},
          {'name': 'Alice', 'age': 28},
          {'name': 'Bob',   'age': 42}]
print(sorted(people, key=lambda p: p['age']))
print(sorted([3,1,4,1,5], reverse=True))
```

### Mechanical walkthrough
- `sorted(words, key=len)` passes the built-in `len` function as the sorting key.
- `key=lambda w: w[-1]` creates a lambda that takes a word and returns its last character, using that for the alphabetical sort.
- `key=lambda p: p['age']` extracts the 'age' value from each dictionary, instructing `sorted` to compare integers instead of dictionaries.
- `reverse=True` passes a boolean flag reversing the final output list.

Trace of `sorted(words, key=len)`:
1. For each word in `words`, compute `len`. `banana` -> 6, `apple` -> 5, `fig` -> 3, `cherry` -> 6, `date` -> 4.
2. Use those lengths as comparison keys.
3. Return words ordered by the key: `fig`, `date`, `apple`, `banana`, `cherry`.

### CS Lens
Decorate-Sort-Undecorate (Schwartzian transform) is the underlying technique applied here. Also recognized in: SQL `ORDER BY`, custom comparators in Java `Collections.sort`.

### SE Lens
Key functions are simpler and safer than writing custom full-comparator functions (`cmp` in Python 2) because they guarantee stable properties.

### Commands needed
`python demo.py`

### Run it
```
['fig', 'date', 'apple', 'banana', 'cherry']
['banana', 'apple', 'date', 'fig', 'cherry']
[{'name': 'Alice', 'age': 28}, {'name': 'Carol', 'age': 35}, {'name': 'Bob', 'age': 42}]
[5, 4, 3, 1, 1]
```
Proves flexible sorting mechanisms using function injection.

### One sentence connecting this unit
If we can extract values for sorting, we can also extract or transform values for general mapping.

## Concept Unit: map()

### The Problem
Applying a function to every item in a list usually requires a `for` loop. Can we express this more directly? Pause and consider what a function that transforms lists via another function would look like.

### Introduce the concept in isolation
```python
# Lab 5
>>> list(map(str, [1, 2]))
['1', '2']
```
This proves we can map a single function across a collection natively. This is the **map** primitive.

### Discard the throwaway example
The throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `demo.py`
- **Change type:** Add
- **Location:** Bottom of `demo.py`

### The New Code
```python
print(list(map(str, [1, 2, 3])))
print(list(map(len, ['apple', 'fig', 'banana'])))
print(list(map(lambda x: x**2, range(5))))
print(list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30])))
```

### The Updated Project
```python
# demo.py
# ... previous code ...

# ← new
print(list(map(str, [1, 2, 3])))
print(list(map(len, ['apple', 'fig', 'banana'])))
print(list(map(lambda x: x**2, range(5))))
print(list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30])))
```

### Mechanical walkthrough
- `map(str, [1, 2, 3])` applies the `str` function to 1, 2, and 3. `map` returns a LAZY iterator.
- `list(...)` forces the lazy iterator to run immediately and stores the outputs in a list.
- `map(lambda x: x**2, range(5))` squares each number generated by `range`.
- `map(lambda a, b: a + b, list1, list2)` consumes two iterables in parallel, passing elements pair-wise into the lambda.

### CS Lens
Map is a fundamental functor operation in category theory. Also recognized in: `.map()` in JavaScript, `Stream.map` in Java, `Select` in LINQ.

### SE Lens
While `map` is powerful, Python's list comprehensions `[f(x) for x in iterable]` are generally preferred for clarity. They both accomplish the exact same behavior.

### Commands needed
`python demo.py`

### Run it
```
['1', '2', '3']
[3, 3, 6]
[0, 1, 4, 9, 16]
[11, 22, 33]
```
Proves the mapping transformations execute successfully.

### One sentence connecting this unit
Just as we can transform elements, we can selectively filter them using a similar functional primitive.

## Concept Unit: filter()

### The Problem
Extracting subset elements based on a condition usually requires a loop with an `if`. Is there a functional equivalent to `map` for conditions? Pause and guess how `filter` works.

### Introduce the concept in isolation
```python
# Lab 6
>>> list(filter(lambda x: x > 0, [-1, 0, 1]))
[1]
```
This proves we can retain items using a predicate function. This is the **filter** primitive.

### Discard the throwaway example
The throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `demo.py`
- **Change type:** Add
- **Location:** Bottom of `demo.py`

### The New Code
```python
print(list(filter(lambda x: x % 2 == 0, range(10))))
print(list(filter(None, [0, 1, '', 'hello', None, [], [1,2]])))
```

### The Updated Project
```python
# demo.py
# ... previous code ...

# ← new
print(list(filter(lambda x: x % 2 == 0, range(10))))
print(list(filter(None, [0, 1, '', 'hello', None, [], [1,2]])))
```

### Mechanical walkthrough
- `filter(lambda x: x % 2 == 0, range(10))` applies the modulo lambda to each item. If the lambda returns truthy, the item is kept.
- `filter(None, iterable)` is a special case: when `None` is the predicate, it uses the truthiness of each element directly, discarding `0`, `''`, `None`, and `[]`.

### CS Lens
Filtering is the exact complement to mapping. Also recognized in: `.filter()` in JS, `Where` in LINQ.

### SE Lens
Like `map`, `filter` is largely superseded by list comprehensions with `if` conditions `[x for x in iterable if f(x)]` in modern Python code.

### Commands needed
`python demo.py`

### Run it
```
[0, 2, 4, 6, 8]
[1, 'hello', [1, 2]]
```
Proves filtering based on predicates and implicit truthiness.

### One sentence connecting this unit
Functions don't just consume other functions; they can also manufacture and return them.

## Concept Unit: Functions as return values

### The Problem
If a function can return an object, and a function *is* an object, what happens if a function creates another function and returns it? Pause and sketch a function that returns another function.

### Introduce the concept in isolation
```python
# Lab 7
>>> def outer():
...     def inner(): return 1
...     return inner
>>> outer()()
1
```
This proves a function can return a dynamically constructed nested function. This relies on **closures**.

### Discard the throwaway example
The throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `demo.py`
- **Change type:** Add
- **Location:** Bottom of `demo.py`

### The New Code
```python
def make_adder(n):
    def add(x):
        return x + n
    return add

add5 = make_adder(5)
add10 = make_adder(10)
print(add5(3))
print(add10(3))
print(add5(add10(1)))

def make_multiplier(n):
    return lambda x: x * n

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(7))
print(triple(7))
```

### The Updated Project
```python
# demo.py
# ... previous code ...

# ← new
def make_adder(n):
    def add(x):
        return x + n
    return add

add5 = make_adder(5)
add10 = make_adder(10)
print(add5(3))
print(add10(3))
print(add5(add10(1)))

def make_multiplier(n):
    return lambda x: x * n

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(7))
print(triple(7))
```

### Mechanical walkthrough
- `def make_adder(n):` defines an outer function accepting `n`.
- `def add(x): return x + n` defines a nested inner function that uses the parameter `n` from the outer scope.
- `return add` returns the function object itself, not its execution.
- `add5 = make_adder(5)` calls the factory, which returns a new closure where `n` is fixed to 5.
- `add10 = make_adder(10)` creates a DIFFERENT closure where `n` is fixed to 10.
- `lambda x: x * n` is the identical technique, just using anonymous function syntax.

Trace for `make_adder`:
1. `make_adder(5)` executes. Inner function `add` closes over `n=5`. Returns `add`.
2. `make_adder(10)` executes. Inner function `add` closes over `n=10`. Returns new `add`.
3. Call `add10(1)`. Inside closure, `x=1, n=10`. Returns `11`.
4. Call `add5(11)`. Inside closure, `x=11, n=5`. Returns `16`.

### CS Lens
A closure is a record storing a function together with an environment. Also recognized in: function currying, object-oriented encapsulation alternatives.

### SE Lens
Returning functions allows for function factories and decorators, allowing for modular dynamic behavior assembly.

### Commands needed
`python demo.py`

### Run it
```
8
13
16
14
21
```
Proves functions dynamically generated maintain their distinct state enclosures.

### One sentence connecting this unit
Finally, what if we want to combine elements down into a single result instead of transforming them one-by-one?

## Concept Unit: functools.reduce()

### The Problem
If you have a list of numbers and want their sum, you accumulate them. How can we generalize the logic of accumulating a result over an iterable? Pause and think of how you would write a function to repeatedly apply an operation to collapse a list.

### Introduce the concept in isolation
```python
# Lab 8
>>> import functools
>>> functools.reduce(lambda acc, x: acc + x, [1, 2])
3
```
This proves we can repeatedly apply a binary function to fold a sequence down to a single value. This is the **reduce** primitive.

### Discard the throwaway example
The throwaway example is discarded.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `demo.py`
- **Change type:** Add
- **Location:** Bottom of `demo.py`

### The New Code
```python
from functools import reduce

print(reduce(lambda acc, x: acc + x, [1, 2, 3, 4, 5]))
print(reduce(lambda acc, x: acc * x, [1, 2, 3, 4, 5]))
print(reduce(max, [3, 1, 4, 1, 5, 9, 2, 6]))
```

### The Updated Project
```python
# demo.py
# ... previous code ...

# ← new
from functools import reduce

print(reduce(lambda acc, x: acc + x, [1, 2, 3, 4, 5]))
print(reduce(lambda acc, x: acc * x, [1, 2, 3, 4, 5]))
print(reduce(max, [3, 1, 4, 1, 5, 9, 2, 6]))
```

### Mechanical walkthrough
- `from functools import reduce` imports the `reduce` function from the standard library module `functools`.
- `reduce(lambda acc, x: acc + x, [1, 2, 3, 4, 5])` applies the lambda.
- The lambda accepts an accumulator `acc` and the current item `x`.
- `reduce(max, [...])` passes the built-in `max` function to find the largest value across the list.

Trace for `reduce(+, [1,2,3,4,5])`:
1. Initialize `acc=1` (first element), `x=2` (second element). Function yields `3`.
2. Update `acc=3`, `x=3`. Function yields `6`.
3. Update `acc=6`, `x=4`. Function yields `10`.
4. Update `acc=10`, `x=5`. Function yields `15`. Returns `15`.

### CS Lens
Reduce is the canonical fold operation in functional data processing. Also recognized in: `.reduce()` in JS, `aggregate` in C#, Hadoop MapReduce framework.

### SE Lens
While powerful, `reduce` is notoriously hard to read for complex logic. Python moved it out of built-ins to `functools` to encourage explicit loops or comprehensions when possible.

### Commands needed
`python demo.py`

### Run it
```
15
120
9
```
Proves the sequence accumulates correctly according to the provided function.

### One sentence connecting this unit
By treating functions as objects, we enable entirely new ways to structure and abstract our code.

## Connect the pieces
Functions as first-class objects enable the functional style. We proved a function could be assigned to a variable, we passed it into `apply_twice`, we created anonymous ones with `lambda` for `sorted` and `map` and `filter`, returned them as closures in `make_adder`, and finally accumulated with them via `functools.reduce`.

Lesson 13 introduces recursion — the technique of a function calling itself. Exercises: write `compose(f, g)` that returns a new function that applies g then f; sort the people list by last name (split the name and sort by the last word); write `my_map(f, lst)` and `my_filter(pred, lst)` from scratch using loops.
