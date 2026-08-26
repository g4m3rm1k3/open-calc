# Lesson 25: Special Methods — Making Objects Feel Like Python

What you will build: You will implement special (dunder) methods on a `Vector` class to make it work seamlessly with Python's native operators and built-in functions like `+`, `-`, `*`, `len()`, `abs()`, `[]`, `in`, and `with`. The transferable problems you will solve are: (1) how Python's operators and built-in functions dispatch to your class (e.g., `a + b` calls `a.__add__(b)`); (2) how implementing `__len__` and `__getitem__` makes your class a sequence that works with `for`, `list()`, `len()`, `in`, and slicing for free; and (3) how `__enter__` and `__exit__` implement the context manager protocol used by the `with` statement.

What you need to know first: Lessons 0–24 (full curriculum through inheritance).

Terms used in this lesson:
- **Special methods (dunder methods)** — Methods with double underscores before and after their names (e.g., `__add__`). They exist to allow user-defined classes to hook into Python's built-in syntax and operators, providing a native feel.
- **Operator overloading** — The ability to define custom behavior for operators like `+` or `*` when applied to instances of a class. It exists so that objects can interact using standard, readable mathematical notation.
- **Context manager** — An object that defines the setup and teardown logic for a block of code, usually used with the `with` statement. It exists to guarantee that resources (like files or network connections) are properly released regardless of whether the block succeeds or raises an exception.
- **Iterable** — An object capable of returning its members one at a time. It exists to allow objects to be looped over in a `for` loop.
- **Iterator** — An object representing a stream of data, returned by an iterable. It exists to maintain the state of iteration and produce the next value when requested.
- **Callable** — An object that can be called like a function using parentheses `()`. It exists to allow objects that represent actions or computations to present a function-like interface.
- **Horner's method** — An algorithm for polynomial evaluation. It exists to evaluate polynomials efficiently with fewer multiplications than the naive approach.

Objects and methods used:

**`Vector`**
- What it is: A class representing a two-dimensional mathematical vector.
- Implementation: `class Vector:`
- Its use: Acts as the primary project code to demonstrate arithmetic, comparison, and container special methods.
- Type: Class.
- Responsibility: Holds x and y coordinates and implements mathematical vector operations.
- Depends on: Numeric `x` and `y` coordinates provided at initialization.
- Connects to: Python's arithmetic and comparison operators.
- Shape: A standalone domain object representing mathematical data.

**`Polynomial`**
- What it is: A class representing a mathematical polynomial.
- Implementation: `class Polynomial:`
- Its use: Demonstrates container special methods and callable objects.
- Type: Class.
- Responsibility: Manages polynomial coefficients and computes values.
- Depends on: A list of coefficients.
- Connects to: Python's slicing, iteration, and function call syntaxes.
- Shape: A standalone domain object representing a mathematical function.

**`CountDown`**
- What it is: A class representing a countdown sequence.
- Implementation: `class CountDown:`
- Its use: Demonstrates the iterator protocol.
- Type: Class.
- Responsibility: Maintains iteration state and yields decreasing values.
- Depends on: A starting integer.
- Connects to: Python's `for` loops and `list()` constructors.
- Shape: An iterator object.

**`ManagedFile`**
- What it is: A class managing file resources safely.
- Implementation: `class ManagedFile:`
- Its use: Demonstrates the context manager protocol.
- Type: Class.
- Responsibility: Opens a file and ensures it is closed after a block of code executes.
- Depends on: A filename and file mode.
- Connects to: Python's `with` statement and the operating system's file handles.
- Shape: A resource management wrapper.

**`len()`**
- What it is: A built-in Python function that returns the number of items in a container.
- Implementation: `def len(obj, /):`
- Its use: To compute the dimension or size of our custom objects.
- Type: Built-in function.
- Responsibility: Requests the length from an object by calling its `__len__` method.
- Depends on: An object that implements `__len__`.
- Connects to: The `__len__` method of the target object.
- Shape: Public built-in utility.

**`abs()`**
- What it is: A built-in Python function that returns the absolute value or magnitude of a number.
- Implementation: `def abs(x, /):`
- Its use: To compute the magnitude of our `Vector`.
- Type: Built-in function.
- Responsibility: Requests the absolute value from an object by calling its `__abs__` method.
- Depends on: An object that implements `__abs__`.
- Connects to: The `__abs__` method of the target object.
- Shape: Public built-in utility.

**`bool()`**
- What it is: A built-in Python function that returns the boolean truth value of an object.
- Implementation: `class bool(x=False):`
- Its use: To evaluate whether our custom objects are considered true or false.
- Type: Built-in type/function.
- Responsibility: Requests the truth value from an object by calling its `__bool__` method, falling back to `__len__`.
- Depends on: An object.
- Connects to: The `__bool__` or `__len__` methods of the target object.
- Shape: Public built-in utility.

**`hash()`**
- What it is: A built-in Python function that returns the hash value of an object.
- Implementation: `def hash(obj, /):`
- Its use: To allow our custom objects to be used as dictionary keys or in sets.
- Type: Built-in function.
- Responsibility: Requests an integer hash from an object by calling its `__hash__` method.
- Depends on: A hashable object.
- Connects to: The `__hash__` method of the target object.
- Shape: Public built-in utility.

**`isinstance()`**
- What it is: A built-in Python function that checks if an object is an instance or subclass of a class.
- Implementation: `def isinstance(obj, class_or_tuple, /):`
- Its use: To ensure safe comparisons in our `__eq__` method.
- Type: Built-in function.
- Responsibility: Validates the type of an object at runtime.
- Depends on: An object and a class or tuple of classes.
- Connects to: The object's type metadata.
- Shape: Public built-in utility.

**`callable()`**
- What it is: A built-in Python function that returns True if the object appears callable.
- Implementation: `def callable(obj, /):`
- Its use: To verify that our object implementing `__call__` can be invoked as a function.
- Type: Built-in function.
- Responsibility: Inspects an object to see if it implements the `__call__` method.
- Depends on: An object.
- Connects to: The object's `__call__` method.
- Shape: Public built-in utility.

**`open()`**
- What it is: A built-in Python function that opens a file and returns a file object.
- Implementation: `def open(file, mode='r', ...):`
- Its use: To acquire a file resource within our custom context manager.
- Type: Built-in function.
- Responsibility: Interacts with the operating system to open a file descriptor.
- Depends on: A filepath and an access mode.
- Connects to: The filesystem and OS file APIs.
- Shape: System boundary function.

## Concept Unit: Arithmetic Special Methods

### The Problem
When you create a custom class representing mathematical entities, like a `Vector` with `x` and `y` coordinates, you often want to add them together. If you just write `v1 + v2`, Python will throw a `TypeError`, stating it doesn't know how to add two `Vector` objects. How do you tell Python that `+` should combine their `x` and `y` coordinates? What if you want to multiply a vector by a scalar number?

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating Python's unique special method protocols.
- **Files affected**: `vector.py` (created).
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: None.

### The New Code
```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f'Vector({self.x}, {self.y})'

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar):
        return self.__mul__(scalar)

    def __neg__(self):
        return Vector(-self.x, -self.y)
```

### The Updated Project
```python
# 1: class Vector:
# 2:     def __init__(self, x, y):
# 3:         self.x = x
# 4:         self.y = y
# 5: 
# 6:     def __repr__(self):
# 7:         return f'Vector({self.x}, {self.y})'
# 8: 
# 9:     def __add__(self, other):  # ← new
# 10:        return Vector(self.x + other.x, self.y + other.y)  # ← new
# 11:
# 12:    def __sub__(self, other):  # ← new
# 13:        return Vector(self.x - other.x, self.y - other.y)  # ← new
# 14:
# 15:    def __mul__(self, scalar):  # ← new
# 16:        return Vector(self.x * scalar, self.y * scalar)  # ← new
# 17:
# 18:    def __rmul__(self, scalar):  # ← new
# 19:        return self.__mul__(scalar)  # ← new
# 20:
# 21:    def __neg__(self):  # ← new
# 22:        return Vector(-self.x, -self.y)  # ← new
```
We now have a `Vector` class with standard coordinate initialization, string representation, and mathematical operations defined via special methods.

### Introduce the concept in isolation
```python
v1 = Vector(1, 2)
v2 = Vector(3, 4)
print(v1 + v2)
print(v1 - v2)
print(v1 * 3)
print(3 * v1)
print(-v1)
```

Output:
```text
Vector(4, 6)
Vector(-2, -2)
Vector(3, 6)
Vector(3, 6)
Vector(-1, -2)
```
This proves that Python automatically translates the `+`, `-`, `*`, and `-` (unary) operators into calls to the corresponding **special methods (dunder methods)** like `__add__` and `__mul__`. For `3 * v1`, Python first tries `int.__mul__(3, v1)` which returns `NotImplemented`; Python then tries `v1.__rmul__(3)`. The `r` prefix stands for "reflected."

### Discard the throwaway example
The test variables and print statements are discarded and will not appear in the project again.

### Mechanical walkthrough
- **`__add__`**: A special method called by Python when the `+` operator is used. It takes `self` and `other`, adds their respective `x` and `y` attributes, and returns a new `Vector`.
- **`__sub__`**: A special method called by Python when the `-` operator is used. It subtracts the components and returns a new `Vector`.
- **`__mul__`**: A special method called by Python when the `*` operator is used with the object on the left side. It multiplies the components by the given `scalar`.
- **`__rmul__`**: A special method called by Python when the `*` operator is used and the left-hand operand does not support the operation with the right-hand operand. It handles reflected multiplication. Here, it simply delegates to `__mul__` since scalar multiplication is commutative.
- **`__neg__`**: A special method called by Python when the unary `-` operator is placed before an object. It negates both coordinates.

## Concept Unit: Comparison and Hashing

### The Problem
If you create two `Vector(1, 2)` objects, they represent the same mathematical vector. However, if you test `v1 == v2`, Python returns `False` by default because they are two distinct objects in memory. How do you teach Python that equality for vectors means having the same coordinates? How do you allow vectors to be used as keys in a dictionary?

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating Python's unique special method protocols.
- **Files affected**: `vector.py` (modified).
- **Change type**: Add.
- **Location**: Inside `Vector` class, after `__neg__`.
- **Dependencies**: The `math` module.

### The New Code
```python
    def __eq__(self, other):
        if not isinstance(other, Vector):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __abs__(self):
        import math
        return math.sqrt(self.x**2 + self.y**2)

    def __bool__(self):
        return self.x != 0 or self.y != 0

    def __hash__(self):
        return hash((self.x, self.y))
```

### The Updated Project
```python
# 21:    def __neg__(self):
# 22:        return Vector(-self.x, -self.y)
# 23:
# 24:    def __eq__(self, other):  # ← new
# 25:        if not isinstance(other, Vector):  # ← new
# 26:            return NotImplemented  # ← new
# 27:        return self.x == other.x and self.y == other.y  # ← new
# 28:
# 29:    def __abs__(self):  # ← new
# 30:        import math  # ← new
# 31:        return math.sqrt(self.x**2 + self.y**2)  # ← new
# 32:
# 33:    def __bool__(self):  # ← new
# 34:        return self.x != 0 or self.y != 0  # ← new
# 35:
# 36:    def __hash__(self):  # ← new
# 37:        return hash((self.x, self.y))  # ← new
```
We have added methods to evaluate equality, absolute value (magnitude), truthiness, and a hash representation for our vector.

### Introduce the concept in isolation
```python
v1 = Vector(1, 2)
v2 = Vector(1, 2)
v3 = Vector(0, 0)
print(v1 == v2)
print(v1 is v2)
print(abs(v1))
print(bool(v3))
if v1:
    print('v1 is non-zero')
```

Output:
```text
True
False
2.23606797749979
False
v1 is non-zero
```
This proves that defining **special methods** for equality and absolute value allows `==` and `abs()` to work seamlessly. The `__bool__` method is used by `if obj:`, `while obj:`, and `bool(obj)`. If not defined, Python falls back to `__len__` (falsy if length is 0), and then to `True`.

### Discard the throwaway example
The test variables and print statements are discarded and will not appear in the project again.

### Mechanical walkthrough
- **`__eq__`**: Called by the `==` operator. It first checks if `other` is a `Vector` using `isinstance()`. If not, it returns `NotImplemented`, signaling Python to try the right-hand object's equality logic. If it is a `Vector`, it compares coordinates.
- **`__abs__`**: Called by the `abs()` built-in function. It computes the mathematical magnitude of the vector.
- **`__bool__`**: Called when evaluating an object in a boolean context. Returns `True` if the vector is not the zero vector.
- **`__hash__`**: Called by the `hash()` built-in function. By hashing a tuple of its immutable coordinate values, we allow `Vector` instances to be used as dictionary keys or stored in sets.

## Concept Unit: Container Special Methods

### The Problem
If you write a class that stores a collection of items—like coefficients in a mathematical polynomial—you might want to access a specific item using `p[2]`, check the length with `len(p)`, or check if a value exists with `3 in p`. How do you make a custom class behave like a Python list or tuple?

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `polynomial.py` (created).
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: None.

### The New Code
```python
class Polynomial:
    def __init__(self, coefficients):
        self._coeffs = list(coefficients)

    def __len__(self):
        return len(self._coeffs)

    def __getitem__(self, index):
        return self._coeffs[index]

    def __contains__(self, value):
        return value in self._coeffs

    def __repr__(self):
        terms = [f'{c}x^{i}' for i, c in enumerate(self._coeffs)]
        return ' + '.join(terms)
```

### The Updated Project
```python
# 1: class Polynomial:
# 2:     def __init__(self, coefficients):
# 3:         self._coeffs = list(coefficients)
# 4: 
# 5:     def __len__(self):  # ← new
# 6:         return len(self._coeffs)  # ← new
# 7: 
# 8:     def __getitem__(self, index):  # ← new
# 9:         return self._coeffs[index]  # ← new
# 10:
# 11:    def __contains__(self, value):  # ← new
# 12:        return value in self._coeffs  # ← new
# 13:
# 14:    def __repr__(self):
# 15:        terms = [f'{c}x^{i}' for i, c in enumerate(self._coeffs)]
# 16:        return ' + '.join(terms)
```
The `Polynomial` class now acts like a sequence because it defines the necessary special methods to report its length, retrieve items by index, and check for membership.

### Introduce the concept in isolation
```python
p = Polynomial([1, 0, 3, -2])
print(len(p))
print(p[0])
print(p[2])
print(p[1:3])
print(3 in p)
print(5 in p)
for coeff in p:
    print(coeff)
```

Output:
```text
4
1
3
[0, 3]
True
False
1
0
3
-2
```
This proves that once you implement `__len__` and `__getitem__`, Python gives you iteration (`for`), `list()`, `sum()`, `min()`, `max()`, `in` (via `__contains__` if defined, else falling back to iteration), and slicing for free. Slicing passes a `slice` object to `__getitem__`, which our underlying list handles natively.

### Discard the throwaway example
The testing logic is discarded and will not appear in the project again.

### Mechanical walkthrough
- **`__len__`**: Called by `len()`. Delegates to the length of the internal list.
- **`__getitem__`**: Called by square bracket notation `[]` for both single indexing and slicing. Delegates directly to the internal list.
- **`__contains__`**: Called by the `in` operator. Checks if a value exists within the internal list.
- **Iteration**: Because `__getitem__` is implemented, Python can automatically iterate over the object by requesting indexes 0, 1, 2, until an `IndexError` is raised.

## Concept Unit: Callable Instances

### The Problem
Sometimes an object fundamentally represents an action or a mathematical function. In our case, a polynomial is mathematically evaluated at a given `x`. Instead of writing `p.evaluate(2)`, it is more natural to write `p(2)`. How do we make an instance object executable like a function?

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `polynomial.py` (modified).
- **Change type**: Add.
- **Location**: Inside `Polynomial` class, at the bottom.
- **Dependencies**: None.

### The New Code
```python
    def __call__(self, x):
        result = 0
        for coeff in reversed(self._coeffs):
            result = result * x + coeff
        return result
```

### The Updated Project
```python
# 14:    def __repr__(self):
# 15:        terms = [f'{c}x^{i}' for i, c in enumerate(self._coeffs)]
# 16:        return ' + '.join(terms)
# 17:
# 18:    def __call__(self, x):  # ← new
# 19:        result = 0  # ← new
# 20:        for coeff in reversed(self._coeffs):  # ← new
# 21:            result = result * x + coeff  # ← new
# 22:        return result  # ← new
```
We have added the `__call__` method which uses **Horner's method** to evaluate the polynomial at a given value of `x`.

### Introduce the concept in isolation
```python
p = Polynomial([1, 0, 3, -2])
print(p(0))
print(p(1))
print(p(2))
print(callable(p))
```

Output:
```text
1
2
-3
True
```
This proves that implementing `__call__` makes an instance usable as a function, making it a **callable** object. For `p(2)`, Python calls `p.__call__(2)`, which returns `-3` (calculated as `1 + 0 + 12 - 16 = -3`).

### Discard the throwaway example
The test variables are discarded and will not appear in the project again.

### Mechanical walkthrough
- **`__call__`**: A special method that allows instances to be invoked like functions using parentheses. Here, it accepts an argument `x`.
- **Horner's method logic**: Evaluates the polynomial efficiently by keeping a running result, multiplying by `x`, and adding coefficients starting from the highest degree.

## Concept Unit: Iterators

### The Problem
We saw that defining `__getitem__` gives free iteration. But what if your sequence doesn't have an index, or isn't backed by a list? What if it generates values on the fly, like a countdown? How do you hook directly into Python's `for` loop mechanics?

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `countdown.py` (created).
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: None.

### The New Code
```python
class CountDown:
    def __init__(self, start):
        self._start = start
        self._current = start

    def __iter__(self):
        self._current = self._start
        return self

    def __next__(self):
        if self._current < 0:
            raise StopIteration
        value = self._current
        self._current -= 1
        return value
```

### The Updated Project
```python
# 1: class CountDown:
# 2:     def __init__(self, start):
# 3:         self._start = start
# 4:         self._current = start
# 5: 
# 6:     def __iter__(self):  # ← new
# 7:         self._current = self._start  # ← new
# 8:         return self  # ← new
# 9: 
# 10:    def __next__(self):  # ← new
# 11:        if self._current < 0:  # ← new
# 12:            raise StopIteration  # ← new
# 13:        value = self._current  # ← new
# 14:        self._current -= 1  # ← new
# 15:        return value  # ← new
```
We created a class that follows the iterator protocol by implementing both `__iter__` and `__next__`.

### Introduce the concept in isolation
```python
cd = CountDown(3)
for n in cd:
    print(n)

print(list(cd))
```

Output:
```text
3
2
1
0
[3, 2, 1, 0]
```
This proves how an **iterator** works. When the `for` loop begins, it calls `__iter__` to get an iterator object. In this case, `__iter__` resets the countdown and returns `self`. The loop repeatedly calls `__next__` to get values until `StopIteration` is raised. Since `__iter__` resets the internal state, we can iterate over the same object multiple times (as shown by `list(cd)` working right after).

### Discard the throwaway example
The loop and list output test are discarded and will not appear in the project again.

### Mechanical walkthrough
- **`__iter__`**: Called to initiate iteration. Must return an **iterator** object. Here, it resets `_current` and returns `self` (since the object itself acts as the iterator).
- **`__next__`**: Called to produce the next value in the sequence. Once no values remain, it must raise a `StopIteration` exception to signal the end of the loop.
- **`StopIteration`**: A built-in exception specifically designed to signal the end of an iteration stream.

## Concept Unit: Context Managers

### The Problem
When dealing with external resources—like files, network sockets, or database connections—you must ensure they are closed or released when you're done. If an exception occurs during processing, the cleanup step might be skipped. How do you hook into Python's `with` statement to guarantee setup and teardown?

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `managed_file.py` (created).
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: None.

### The New Code
```python
class ManagedFile:
    def __init__(self, filename, mode='r'):
        self.filename = filename
        self.mode = mode
        self.file = None

    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        return False
```

### The Updated Project
```python
# 1: class ManagedFile:
# 2:     def __init__(self, filename, mode='r'):
# 3:         self.filename = filename
# 4:         self.mode = mode
# 5:         self.file = None
# 6: 
# 7:     def __enter__(self):  # ← new
# 8:         self.file = open(self.filename, self.mode)  # ← new
# 9:         return self.file  # ← new
# 10:
# 11:    def __exit__(self, exc_type, exc_val, exc_tb):  # ← new
# 12:        if self.file:  # ← new
# 13:            self.file.close()  # ← new
# 14:        return False  # ← new
```
We define a **context manager** that safely opens a file in `__enter__` and guarantees it will be closed in `__exit__`.

### Introduce the concept in isolation
```python
with ManagedFile('test.txt', 'w') as f:
    f.write('Hello from context manager!')

print(f.closed)
```

Output:
```text
True
```
This proves that `with ManagedFile(...) as f:` calls `ManagedFile.__enter__()`, which opens the file and returns it. `f` is bound to the return value. On exit, `__exit__` is called, closing the file.

### Discard the throwaway example
The file write block and printing is discarded and will not appear in the project again.

### Mechanical walkthrough
- **`__enter__`**: A special method executed when execution enters the `with` block. It allocates resources and its return value is bound to the variable in the `as` clause.
- **`__exit__`**: A special method executed when execution leaves the `with` block, regardless of whether it left normally or via an exception. It receives exception information (`exc_type`, `exc_val`, `exc_tb`) which are all `None` if no exception occurred.
- **Return False in `__exit__`**: Returning `False` (or `None`) allows any exception raised within the `with` block to propagate normally. Returning `True` would suppress the exception.

## Concept Unit: The Full Vector Class

### The Problem
We built multiple powerful special methods across previous units. How do they look when combined into a single, comprehensive domain object representing a mathematical vector that supports arithmetic, sequence unpacking, dimension checking, and callable operations?

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: `vector.py` (modified).
- **Change type**: Refactor/Add.
- **Location**: Throughout the `Vector` class.
- **Dependencies**: None.

### The New Code
```python
    def __len__(self):
        return 2

    def __getitem__(self, index):
        return (self.x, self.y)[index]

    def __iter__(self):
        yield self.x
        yield self.y

    def __call__(self, other):
        # Compute dot product
        return self.x * other.x + self.y * other.y
```

### The Updated Project
```python
# 1: class Vector:
# 2:     def __init__(self, x, y):
# 3:         self.x = x
# 4:         self.y = y
# 5: 
# ... (existing arithmetic and comparison methods) ...
# 37:    def __hash__(self):
# 38:        return hash((self.x, self.y))
# 39:
# 40:    def __len__(self):  # ← new
# 41:        return 2  # ← new
# 42:
# 43:    def __getitem__(self, index):  # ← new
# 44:        return (self.x, self.y)[index]  # ← new
# 45:
# 46:    def __iter__(self):  # ← new
# 47:        yield self.x  # ← new
# 48:        yield self.y  # ← new
# 49:
# 50:    def __call__(self, other):  # ← new
# 51:        return self.x * other.x + self.y * other.y  # ← new
```
We integrated `__len__`, `__getitem__`, `__iter__`, and `__call__` into `Vector` to make it a fully-featured sequence and mathematical operator.

### Introduce the concept in isolation
```python
v1 = Vector(2, 3)
v2 = Vector(4, 5)

print(len(v1))
print(v1[0])
for coord in v1:
    print(coord)
print(v1(v2))  # Dot product
```

Output:
```text
2
2
2
3
23
```
This proves that by defining sequence and callable special methods on our `Vector`, it integrates fully into Python's native toolset. The `Vector` now has a dimension of 2, allows indexed access to its coordinates, can be iterated over unpacking `x` then `y`, and acts as a function to compute a mathematical dot product.

### Discard the throwaway example
The test variables are discarded and will not appear in the project again.

### Mechanical walkthrough
- **`__len__`**: Hardcoded to return 2 since this is a two-dimensional vector.
- **`__getitem__`**: Creates a temporary tuple `(self.x, self.y)` and indexes into it, cleanly mapping `0` to `x` and `1` to `y`.
- **`__iter__`**: Uses the `yield` keyword to return an iterator that yields `x` first, then `y`. This allows `v1` to be unpacked like `x, y = v1`.
- **`__call__`**: Now calculates the dot product between this vector and another vector.

---

Special methods make your classes first-class citizens in Python's ecosystem — they work with all built-in functions and operators. Lesson 26 covers polymorphism and duck typing. 

**Exercises:** 
1. Implement `__lt__` (less-than by magnitude), `__le__`, `__gt__`, and `__ge__` on `Vector` so they can be sorted.
2. Implement a `Matrix` class with `__add__`, `__mul__` (matrix product), `__getitem__`, and `__repr__`.
