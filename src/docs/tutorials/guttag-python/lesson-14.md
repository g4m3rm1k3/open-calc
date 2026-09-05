# Lesson 14: Modules and Packages — import and the Standard Library

**What you will build**
The reader understands Python's module system: `import`, `from...import`, aliasing (`as`), writing their own module, and key standard library modules (`math`, `random`, `os`, `sys`, `collections`, `itertools`). The transferable insight: a module is a namespace. `import math` gives you the `math` namespace; `math.sqrt` is the `sqrt` function in that namespace. This prevents name conflicts and enables code reuse across files.

**What you need to know first**
Lessons 00-13.

**Terms used in this lesson**
- **Module** — a single Python file containing code (functions, classes, variables) meant to be reused. It serves as an isolated namespace, preventing naming collisions.
- **Package** — a directory containing multiple modules, usually marked by an `__init__.py` file, allowing hierarchical organization of code.
- **Namespace** — a container where names (variables, functions, classes) are mapped to objects. It ensures that names in different modules don't clash.
- **Alias** — a temporary alternative name given to an imported module or function (using `as`), usually to make the code shorter or avoid name conflicts.
- **Standard Library** — the collection of built-in modules that come packaged with Python, providing ready-to-use tools for math, system operations, and data structures.

**Objects and methods used**

- **`math`**
  - *What it is:* A standard library module for mathematical functions.
  - *Implementation:* Built-in C module wrapped in Python, containing constants and functions.
  - *Its use:* Used to perform standard mathematical operations.
  - *Type:* Module.
  - *Responsibility:* Groups common math operations into one accessible namespace.
  - *Depends on:* Core Python runtime.
  - *Connects to:* Called by user code needing mathematical capabilities.
  - *Shape:* A global utility namespace.

- **`math.sqrt`**
  - *What it is:* A function to calculate the square root of a number.
  - *Implementation:* `def sqrt(x: float) -> float`
  - *Its use:* Returns the square root of a given argument.
  - *Type:* Function.
  - *Responsibility:* Computes the principal square root of the argument.
  - *Depends on:* A numeric argument passed to it.
  - *Connects to:* Returns a float result to the caller.
  - *Shape:* Public utility function within the `math` module.

- **`math.pi`**
  - *What it is:* The mathematical constant π.
  - *Implementation:* `pi = 3.141592653589793`
  - *Its use:* Used in geometry calculations.
  - *Type:* Float constant.
  - *Responsibility:* Holds the precise, predefined value of pi.
  - *Depends on:* None.
  - *Connects to:* Used directly in mathematical expressions.
  - *Shape:* Public constant in the `math` module.

- **`dir()`**
  - *What it is:* A built-in function to list names within a namespace.
  - *Implementation:* `def dir([object]) -> list[str]`
  - *Its use:* Exploring the contents of an imported module.
  - *Type:* Built-in function.
  - *Responsibility:* Returns an alphabetical list of valid attributes for the given object.
  - *Depends on:* The object passed to it.
  - *Connects to:* Used interactively or for script reflection.
  - *Shape:* Built-in utility.

- **`type()`**
  - *What it is:* A built-in function to get an object's exact type.
  - *Implementation:* `def type(object) -> type`
  - *Its use:* Checking that a module is indeed represented as a 'module' object.
  - *Type:* Built-in function.
  - *Responsibility:* Returns the exact runtime type of the given object.
  - *Depends on:* An object argument.
  - *Connects to:* Used for introspection.
  - *Shape:* Built-in utility.

- **`random`**
  - *What it is:* A standard library module for random number generation.
  - *Implementation:* A module providing functions like `randint`, `choice`, and `shuffle`.
  - *Its use:* Simulating unpredictable events, dice rolls, or shuffling data.
  - *Type:* Module.
  - *Responsibility:* Generates pseudo-random numbers and choices based on entropy.
  - *Depends on:* System entropy for initial seeding.
  - *Connects to:* Called by scripts needing randomness.
  - *Shape:* Public standard library API.

- **`os`**
  - *What it is:* A standard library module for operating system interfaces.
  - *Implementation:* A Python module mapping to OS-specific system calls.
  - *Its use:* Path manipulation, directory checks, and environment interaction.
  - *Type:* Module.
  - *Responsibility:* Provides a portable way to use operating system dependent functionality.
  - *Depends on:* The underlying operating system architecture.
  - *Connects to:* Makes lower-level system calls on behalf of Python.
  - *Shape:* Public standard library API.

- **`sys`**
  - *What it is:* A standard library module for interpreter system-specific parameters.
  - *Implementation:* A module containing Python interpreter variables.
  - *Its use:* Checking Python version and reading command-line arguments.
  - *Type:* Module.
  - *Responsibility:* Provides access to variables and functions maintained by the Python interpreter.
  - *Depends on:* The running Python interpreter environment.
  - *Connects to:* The runtime environment state.
  - *Shape:* Public standard library API.

- **`collections.Counter`**
  - *What it is:* A dictionary subclass designed for counting hashable objects.
  - *Implementation:* `class Counter(dict)`
  - *Its use:* Rapidly counting occurrences of elements in sequences or strings.
  - *Type:* Class.
  - *Responsibility:* Tallies elements and provides frequency data (like `most_common`).
  - *Depends on:* An iterable passed into its constructor.
  - *Connects to:* Used as an efficient data structure in counting logic.
  - *Shape:* Standard library data structure.

- **`__name__`**
  - *What it is:* A special built-in variable inside every Python module.
  - *Implementation:* `__name__: str`
  - *Its use:* Checking whether a module is run as the main program or imported.
  - *Type:* String variable.
  - *Responsibility:* Evaluates to `"__main__"` when run directly, or the actual module name if imported.
  - *Depends on:* The interpreter's execution context.
  - *Connects to:* Used in `if __name__ == '__main__':` execution guards.
  - *Shape:* Module-level built-in attribute.

## Concept Unit: import and module namespaces
### The Problem
How do we use code that someone else wrote, or organize our own code across multiple files without names colliding? What if two files both define a `calculate()` function? How do we tell Python which one we mean?

### Introduce the concept in isolation
```python
import math

print(math.pi)          # 3.141592653589793
print(math.sqrt(16))    # 4.0
print(math.floor(3.7))  # 3
print(type(math))       # <class 'module'>

print([x for x in dir(math) if not x.startswith('_')][:5])
# ['acos', 'acosh', 'asin', 'asinh', 'atan']
```
This is called an **import**. 
It proves that `math` behaves as an isolated container (a namespace) where all mathematical functions live. Python finds `math.py` in the standard library, executes it, stores the resulting namespace as the name `math`, and allows us to look up functions like `sqrt` using the `.` operator.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** None - this is a from-scratch addition because we are exploring module namespaces.
- **Files affected:** `main.py` (created).
- **Change type:** Add.
- **Location:** At the top of the file.
- **Dependencies:** Standard library `math` module.

### The New Code
```python
import math
print(math.sqrt(144))
```

### The Updated Project
```python
# main.py
1: import math          # <- new
2: print(math.sqrt(144))# <- new
```
The file now imports the math module and calls a function from it.

### Mechanical walkthrough
- `import` is a keyword that tells Python to load a module.
- `math` is the name of the standard library module to load.
- `print` is the built-in function to display output.
- `(` opens the call to print.
- `math.sqrt` accesses the `sqrt` function inside the `math` namespace using the `.` operator.
- `(` opens the call to `math.sqrt`.
- `144` is the integer argument passed to `sqrt`.
- `)` closes the call to `math.sqrt`.
- `)` closes the call to `print`.

### CS lens
This is the concept of a **Namespace**. In computer science, namespaces provide scope for names so that the same name can be used in different contexts without ambiguity. Real-world appearances include file systems (directories), XML namespaces, domain names (DNS), and network subnets.

### SE lens
This demonstrates the principle of **Encapsulation** and **Modularity**. The alternative not chosen would be to have all functions loaded globally (e.g., just `sqrt()`). The tradeoff is that typing `math.` is slightly more verbose, but it completely eliminates name collisions, keeping the global scope clean and organized.

### Commands needed
`python3 main.py`

### Run it
Predicted confidently: `12.0`

### One sentence connecting to previous unit
Now that we can import a whole module namespace, let's look at how to pull specific items out directly or rename them.

## Concept Unit: from...import and import...as
### The Problem
What if we use `math.sqrt` dozens of times and typing `math.` becomes tedious? Is there a way to bring a specific function directly into our current namespace without bringing in everything else?

### Introduce the concept in isolation
```python
from math import sqrt, pi
print(sqrt(25))  # 5.0
print(pi)        # 3.141592653589793

import math as m
print(m.sqrt(9)) # 3.0
```
This is called a **from...import** and **import...as**. 
It proves that you can extract specific names into the local namespace, binding the local name `sqrt` directly to the `math.sqrt` function object. It also proves you can rename a module locally (`as m`) to save typing while avoiding the module prefix.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** None - this is a from-scratch addition.
- **Files affected:** `main.py` (modified).
- **Change type:** Replace.
- **Location:** Replacing the previous `import math` lines.
- **Dependencies:** Standard library `math` module.

### The New Code
```python
from math import sqrt
print(sqrt(144))
```

### The Updated Project
```python
# main.py
1: from math import sqrt  # <- new
2: print(sqrt(144))       # <- new
```
The file now imports just the `sqrt` function directly, removing the need for the `math.` prefix.

### Mechanical walkthrough
- `from` is a keyword indicating the source module.
- `math` is the module name.
- `import` is the keyword indicating what names to extract.
- `sqrt` is the specific function being brought into the local namespace.
- `print` is the built-in output function.
- `(` opens the call to print.
- `sqrt` is called directly without the `math.` prefix.
- `(` opens the call to `sqrt`.
- `144` is the integer argument.
- `)` closes the `sqrt` call.
- `)` closes the `print` call.

### CS lens
This is **Symbol Binding**. We are binding a specific symbol (`sqrt`) from an external dictionary directly into our current environment dictionary. Real-world appearances include dynamic linking in C (`dlsym`), destructuring imports in JavaScript, SQL aliasing (`SELECT name AS n`), and shell aliases.

### SE lens
This touches on **Coupling vs. Convenience**. The alternative not chosen is `from math import *`. The real tradeoff is that `from math import *` is highly convenient but creates "namespace pollution," where it becomes impossible to track where a function originated if multiple modules are imported this way. `from math import sqrt` is explicit, trackable, and much safer.

### Commands needed
`python3 main.py`

### Run it
Predicted confidently: `12.0`

### One sentence connecting to previous unit
Using standard libraries is great, but we also need to build our own reusable components.

## Concept Unit: Writing your own module
### The Problem
How do we separate our own code into multiple files? If we define a function in one file, how do we use it in another without copy-pasting it?

### Introduce the concept in isolation
```python
# File: throwaway_math.py
def square(x):
    return x * x

if __name__ == '__main__':
    print(square(3))
```
This is called a **custom module**. 
It proves that any Python file can be imported by another Python file. It also proves that when imported, Python looks for the file in `sys.path`, executes it, but skips the `if __name__ == '__main__'` block because `__name__` is not `'__main__'` during an import.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** None - this is a from-scratch addition.
- **Files affected:** `mymath.py` (created), `main.py` (modified).
- **Change type:** Add.
- **Location:** New file `mymath.py`; updating `main.py` to use it.
- **Dependencies:** None.

### The New Code
```python
# mymath.py
def square(x):
    return x * x

def cube(x):
    return x * x * x

PI = 3.14159

if __name__ == '__main__':
    print('Testing mymath:')
    print(square(3))
    print(cube(3))
```

### The Updated Project
```python
# mymath.py
1: def square(x):                               # <- new
2:     return x * x                             # <- new
3:                                              # <- new
4: def cube(x):                                 # <- new
5:     return x * x * x                         # <- new
6:                                              # <- new
7: PI = 3.14159                                 # <- new
8:                                              # <- new
9: if __name__ == '__main__':                   # <- new
10:    print('Testing mymath:')                 # <- new
11:    print(square(3))                         # <- new
12:    print(cube(3))                           # <- new

# main.py
1: import mymath                                # <- new
2: print(mymath.square(12))                     # <- new
3: print(mymath.PI)                             # <- new
```
We now have our own module `mymath.py` providing a `square` function and a constant, and `main.py` imports and uses them.

### Mechanical walkthrough
- `def square(x):` defines a function named `square` taking parameter `x`.
- `return x * x` calculates and returns the square.
- `def cube(x):` defines a function `cube`.
- `return x * x * x` returns the cube.
- `PI = 3.14159` defines a module-level constant.
- `if` starts a conditional statement.
- `__name__` is a built-in variable holding the context name.
- `==` is the equality operator.
- `'__main__'` is the string value `__name__` gets when the script is run directly.
- `:` starts the block.
- `print` outputs testing information.
- `import mymath` in `main.py` locates `mymath.py` and creates a namespace.
- `mymath.square(12)` calls the `square` function from our custom module namespace.
- `mymath.PI` accesses the constant from our custom module namespace.

### CS lens
This is **Code Organization**. Software is decomposed into separate files for maintainability and code reuse. Real-world appearances include header files in C/C++, classes in Java, modules in Rust, and components in React.

### SE lens
This relies on the **Single Responsibility Principle**. A module should group related functionality (like math operations). The alternative not chosen is putting all code in a massive `main.py` file. The tradeoff is having to manage multiple files and imports, but it scales to large codebases where a single file would be completely unreadable.

### Commands needed
`python3 main.py`

### Run it
Predicted confidently:
```
144
3.14159
```

### One sentence connecting to previous unit
Beyond our own modules, Python provides a rich set of built-in tools for everyday tasks.

## Concept Unit: Key standard library modules
### The Problem
How do we generate random numbers, interact with the operating system, or efficiently count items without writing everything from scratch?

### Introduce the concept in isolation
```python
import random
import os
import sys
from collections import Counter

print(random.randint(1, 6))
print(os.getcwd())
print(sys.version[:5])
c = Counter('abracadabra')
print(c.most_common(1))
```
This is the **Standard Library**. 
It proves that Python comes with batteries included for common system, math, and data structure tasks. For example, `Counter` iterates the string, counts each character, and `most_common` returns the highest occurrences.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.py` (modified).
- **Change type:** Replace.
- **Location:** Overwriting `main.py`.
- **Dependencies:** Standard library.

### The New Code
```python
import random
import os
import sys
from collections import Counter

print(random.randint(1, 6))
print(os.getcwd())
print(sys.version)
c = Counter('abracadabra')
print(c.most_common(3))
```

### The Updated Project
```python
# main.py
1: import random                                # <- new
2: import os                                    # <- new
3: import sys                                   # <- new
4: from collections import Counter              # <- new
5:                                              # <- new
6: print(random.randint(1, 6))                  # <- new
7: print(os.getcwd())                           # <- new
8: print(sys.version)                           # <- new
9: c = Counter('abracadabra')                   # <- new
10: print(c.most_common(3))                     # <- new
```
`main.py` now leverages multiple powerful standard library modules directly.

### Mechanical walkthrough
- `import random` loads the random number generator module.
- `import os` loads the operating system interface module.
- `import sys` loads interpreter system tools.
- `from collections import Counter` imports a specific class for counting.
- `random.randint` is called to generate an integer.
- `1, 6` are the bounds passed to `randint`.
- `os.getcwd()` calls a function to get the Current Working Directory.
- `sys.version` accesses a string property containing the Python version.
- `Counter` is instantiated with the string literal `'abracadabra'`.
- `c` is the variable storing the Counter object.
- `c.most_common` is a method on the Counter object.
- `(3)` specifies we want the top 3 items.

### CS lens
This is **Standard API usage**. Most ecosystems provide a core set of battle-tested utilities. Real-world appearances include the POSIX standard in C, the JDK in Java, the .NET Base Class Library, and Node's core modules (`fs`, `path`).

### SE lens
This shows **Don't Reinvent the Wheel**. The alternative not chosen is writing a custom pseudo-random number generator or building a custom tallying dictionary. The tradeoff: you must learn the standard API's specific quirks, but you gain reliability, performance (many are backed by fast C code), and your code is instantly recognizable to other developers.

### Commands needed
`python3 main.py`

### Run it
Predicted confidently:
*(Output will vary due to random/os/sys, but structurally:)*
```
4
/current/directory/path
3.x.x (version info)
[('a', 5), ('b', 2), ('r', 2)]
```

### One sentence connecting to previous unit
As our codebase grows into many files, we need to organize them into structured directories.

## Concept Unit: Package structure and __init__.py
### The Problem
What if we have dozens of modules? How do we group related modules (like multiple files for database interaction) into a single folder and import them cleanly?

### Introduce the concept in isolation
```python
# Directory mypackage/
# mypackage/__init__.py
# mypackage/utils.py

# In main.py:
# import mypackage.utils
```
This is called a **Package**. 
It proves that a directory containing an `__init__.py` file acts as a hierarchical module namespace. Python checks `sys.path`, finds the `mypackage/` directory with `__init__.py`, executes the package init, executes `utils.py`, and binds `mypackage.utils` as a namespace.

### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.

### Project Change
- **Reference Source:** None.
- **Files affected:** `main.py` (modified), `mypackage/__init__.py` (created), `mypackage/utils.py` (created).
- **Change type:** Add.
- **Location:** Creating a subdirectory and updating `main.py`.
- **Dependencies:** None.

### The New Code
```python
# mypackage/__init__.py
# (Empty file to mark the directory as a package)

# mypackage/utils.py
def helper_fn():
    return "Helper working!"
```

### The Updated Project
```python
# mypackage/__init__.py
1: # empty                                      # <- new

# mypackage/utils.py
1: def helper_fn():                             # <- new
2:     return "Helper working!"                 # <- new

# main.py
1: import mypackage.utils                       # <- new
2: print(mypackage.utils.helper_fn())           # <- new
3:                                              # <- new
4: import sys                                   # <- new
5: print(sys.path[:1])                          # <- new
```
We now structure our code into a formal package and inspect Python's search path.

### Mechanical walkthrough
- `mypackage/` is a physical directory created on the filesystem.
- `__init__.py` is a special file name that tells Python to treat the directory as a package.
- `def helper_fn():` defines a function inside `utils.py`.
- `return "Helper working!"` returns a string.
- `import mypackage.utils` uses dot notation to import a submodule from a package namespace.
- `print` is called to output the result.
- `mypackage.utils.helper_fn()` accesses the function through the package and module namespaces.
- `import sys` loads the system module.
- `sys.path` accesses the list of directories Python searches for imports.
- `[:1]` slices the list to show just the first entry.

### CS lens
This is **Hierarchical Namespaces**. By using directories, namespaces become a tree rather than a flat list. Real-world appearances include Java packages (`com.company.project`), DNS domains (`www.example.com`), URL paths, and REST API route grouping.

### SE lens
This supports **Large-Scale Architecture**. The alternative not chosen is prefixing filenames (e.g., `mypackage_utils.py`) in a flat directory. The tradeoff: packages require maintaining `__init__.py` files and managing deep imports, but they allow proper encapsulation of subsystems.

### Commands needed
`python3 main.py`

### Run it
Predicted confidently:
```
Helper working!
['/current/working/directory']
```

### One sentence connecting to previous unit
All these concepts build a unified way to load and organize code across projects of any size.

## Closing
### Connect the pieces
We started by importing a built-in module, tracing how `import math` creates a namespace and allows us to call `math.sqrt(144)`. We then learned how to define our own functionality by writing `mymath.py` with a `square()` function. We traced how `import mymath` creates a namespace from our file, letting us execute `mymath.square(12)`. We leveraged other powerful standard libraries like `random`, `os`, and `Counter` to get complex behavior for free. Finally, we grouped modules into packages using `__init__.py`, organizing our codebase into hierarchical namespaces. Whether using `import math` or `import mypackage.utils`, the transferable insight is the same: modules are namespaces that cleanly organize and encapsulate code.
