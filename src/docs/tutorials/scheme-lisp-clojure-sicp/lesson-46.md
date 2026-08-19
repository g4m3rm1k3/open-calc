# Lesson 46: Java Interop — Clojure on the JVM

The reader will learn to call Java code from Clojure: instantiating Java objects, calling methods, using static methods and fields, importing Java classes, and working with Java collections. They will build a file reader using Java's `java.io.File` and a simple HTTP request using Java's `java.net.http.HttpClient`. The transferable problems are: (1) Clojure runs on the JVM and has zero-overhead access to any Java library — this is the primary reason Clojure is used in production; (2) the interop syntax (`.method`, `new`, `import`) is small and regular; (3) understanding interop means you can use ANY Java library from Clojure — the entire Java ecosystem is available.

**What you need to know first:**
- Lessons 0–45 (all prior concepts through Clojure functions, protocols, records, atoms).

**Terms used in this lesson:**
- **JVM (Java Virtual Machine)** — The runtime environment that executes Java bytecode, providing memory management and cross-platform execution. Clojure is compiled to this bytecode.
- **Java Interop** — The ability to directly call Java code from Clojure without any wrapping or overhead, giving Clojure access to the entire Java ecosystem.
- **Static Method** — A method that belongs to a class rather than an instance of a class, called directly on the class itself.
- **Static Field** — A value that belongs to a class rather than an instance, acting as a global constant or variable on that class.
- **Instance** — A specific object created from a class, possessing its own state.
- **Instance Method** — A method that operates on a specific instance of a class, typically modifying its state or returning information about it.
- **Constructor** — A special method used to create and initialize a new instance of a class.
- **Mutable** — Capable of being changed after creation. Java objects are often mutable, unlike Clojure's default persistent data structures.
- **Exception** — A runtime error or exceptional condition thrown by Java code, interrupting the normal flow of execution.
- **`try` / `catch` / `finally`** — The Java and Clojure constructs for handling exceptions, providing an escape-continuation mechanism to catch errors and ensure cleanup code runs.

**Objects and methods used:**
- **`Math/sqrt`**
  - *What it is:* A static method call on the Java `Math` class.
  - *Implementation:* `public static double sqrt(double a)` in `java.lang.Math`.
  - *Its use:* Used here to demonstrate calling Java static methods.
  - *Type:* Static method.
  - *Responsibility:* Computes the square root of a given number.
  - *Depends on:* A numeric argument.
  - *Connects to:* Calls into the JVM's math libraries.
  - *Shape:* A standard library mathematical utility.
- **`Math/pow`**
  - *What it is:* A static method call on the Java `Math` class.
  - *Implementation:* `public static double pow(double a, double b)` in `java.lang.Math`.
  - *Its use:* Used here to demonstrate calling Java static methods with multiple arguments.
  - *Type:* Static method.
  - *Responsibility:* Computes the value of the first argument raised to the power of the second argument.
  - *Depends on:* Two numeric arguments.
  - *Connects to:* Calls into the JVM's math libraries.
  - *Shape:* A standard library mathematical utility.
- **`Math/abs`**
  - *What it is:* A static method call on the Java `Math` class.
  - *Implementation:* `public static int abs(int a)` (and other overloads) in `java.lang.Math`.
  - *Its use:* Used here to demonstrate calling Java static methods.
  - *Type:* Static method.
  - *Responsibility:* Computes the absolute value of a given number.
  - *Depends on:* A numeric argument.
  - *Connects to:* Calls into the JVM's math libraries.
  - *Shape:* A standard library mathematical utility.
- **`System/currentTimeMillis`**
  - *What it is:* A static method call on the Java `System` class.
  - *Implementation:* `public static long currentTimeMillis()` in `java.lang.System`.
  - *Its use:* Used here to demonstrate calling static methods with no arguments to get the current time.
  - *Type:* Static method.
  - *Responsibility:* Returns the current time in milliseconds since the Unix epoch.
  - *Depends on:* The system clock.
  - *Connects to:* The underlying operating system's time provider.
  - *Shape:* A standard library system utility.
- **`Math/PI`**
  - *What it is:* A static field access on the Java `Math` class.
  - *Implementation:* `public static final double PI` in `java.lang.Math`.
  - *Its use:* Used here to demonstrate accessing Java static fields.
  - *Type:* Static field constant.
  - *Responsibility:* Provides the mathematical constant pi.
  - *Depends on:* Nothing.
  - *Connects to:* Accessed directly by callers.
  - *Shape:* A static constant.
- **`Math/E`**
  - *What it is:* A static field access on the Java `Math` class.
  - *Implementation:* `public static final double E` in `java.lang.Math`.
  - *Its use:* Used here to demonstrate accessing Java static fields.
  - *Type:* Static field constant.
  - *Responsibility:* Provides the mathematical constant e.
  - *Depends on:* Nothing.
  - *Connects to:* Accessed directly by callers.
  - *Shape:* A static constant.
- **`Integer/MAX_VALUE`**
  - *What it is:* A static field access on the Java `Integer` class.
  - *Implementation:* `public static final int MAX_VALUE` in `java.lang.Integer`.
  - *Its use:* Used here to demonstrate accessing static field constants.
  - *Type:* Static field constant.
  - *Responsibility:* Provides the maximum value an `int` can hold.
  - *Depends on:* Nothing.
  - *Connects to:* Accessed directly by callers.
  - *Shape:* A static constant.
- **`new`**
  - *What it is:* The Clojure special form for instantiating Java objects.
  - *Implementation:* `(new ClassName args...)`.
  - *Its use:* Used to create instances of Java classes.
  - *Type:* Special form.
  - *Responsibility:* Allocates memory and calls the class constructor to initialize a new object.
  - *Depends on:* A Java class name and any required constructor arguments.
  - *Connects to:* The Java class's constructor.
  - *Shape:* Interop syntax.
- **`java.util.Date.`**
  - *What it is:* The dot-suffix syntax for instantiating a Java class, equivalent to using `new`.
  - *Implementation:* `(ClassName. args...)`.
  - *Its use:* Used as the idiomatic shorthand for creating object instances.
  - *Type:* Syntactic sugar for constructors.
  - *Responsibility:* Calls the constructor of `java.util.Date`.
  - *Depends on:* Constructor arguments (none in this case).
  - *Connects to:* `java.util.Date`'s constructor.
  - *Shape:* Interop syntax.
- **`java.util.ArrayList.`**
  - *What it is:* The dot-suffix constructor syntax for `ArrayList`.
  - *Implementation:* `(java.util.ArrayList. collection)`.
  - *Its use:* Used to create a Java `ArrayList` from a Clojure collection.
  - *Type:* Constructor call.
  - *Responsibility:* Instantiates an `ArrayList` initialized with the given elements.
  - *Depends on:* A collection of elements.
  - *Connects to:* `java.util.ArrayList`'s constructor.
  - *Shape:* Java collection initialization.
- **`java.lang.StringBuilder.`**
  - *What it is:* The dot-suffix constructor syntax for `StringBuilder`.
  - *Implementation:* `(java.lang.StringBuilder.)`.
  - *Its use:* Used to create a mutable string builder object.
  - *Type:* Constructor call.
  - *Responsibility:* Instantiates an empty `StringBuilder` for efficient string concatenation.
  - *Depends on:* Nothing.
  - *Connects to:* `java.lang.StringBuilder`'s default constructor.
  - *Shape:* Java string manipulation class.
- **`.append`**
  - *What it is:* The dot-prefix syntax for calling an instance method, specifically `append` on a `StringBuilder`.
  - *Implementation:* `(.methodName object args...)`.
  - *Its use:* Used to mutate the `StringBuilder` by appending text.
  - *Type:* Instance method call.
  - *Responsibility:* Appends the given string to the string builder's internal buffer.
  - *Depends on:* An object instance and the arguments to pass.
  - *Connects to:* The `StringBuilder` instance.
  - *Shape:* Interop instance method invocation.
- **`.toString`**
  - *What it is:* The dot-prefix syntax for calling the `toString` instance method.
  - *Implementation:* `(.toString object)`.
  - *Its use:* Used to extract the final string from a `StringBuilder`.
  - *Type:* Instance method call.
  - *Responsibility:* Converts the object's state into a string representation.
  - *Depends on:* An object instance.
  - *Connects to:* The object's `toString` method.
  - *Shape:* Standard Java object method.
- **`doto`**
  - *What it is:* A macro that evaluates an initial expression to get an object, then applies a series of method calls to that object, and finally returns the object.
  - *Implementation:* `(doto obj (method args) ...)`.
  - *Its use:* Used to cleanly initialize or mutate Java objects that require multiple method calls without repeating the object name.
  - *Type:* Macro.
  - *Responsibility:* Sequences method calls on a single object and returns the mutated object.
  - *Depends on:* An object and a list of method call forms.
  - *Connects to:* The target object and the methods being called.
  - *Shape:* Idiomatic Clojure utility for mutable interop.
- **`import`**
  - *What it is:* A function (or macro when used in `ns`) that makes Java classes available by their unqualified names.
  - *Implementation:* `(import java.io.File)`.
  - *Its use:* Used to avoid typing fully qualified class names.
  - *Type:* Special form / macro.
  - *Responsibility:* Resolves short class names to their fully qualified Java counterparts within the current namespace.
  - *Depends on:* Fully qualified class names.
  - *Connects to:* The Clojure namespace registry and Java classloader.
  - *Shape:* Namespace management construct.
- **`ns`**
  - *What it is:* The namespace declaration macro.
  - *Implementation:* `(ns name (:import ...))`.
  - *Its use:* Used to define a new namespace and declare its dependencies, including Java imports.
  - *Type:* Macro.
  - *Responsibility:* Creates a namespace and configures aliases, requires, and imports for it.
  - *Depends on:* The namespace name and clause lists.
  - *Connects to:* The Clojure environment.
  - *Shape:* Top-level file organization construct.
- **`java.io.File.`**
  - *What it is:* The constructor for Java's `File` class.
  - *Implementation:* `(java.io.File. pathString)`.
  - *Its use:* Used to create a file handle for reading or writing.
  - *Type:* Constructor call.
  - *Responsibility:* Represents a file or directory path in the filesystem.
  - *Depends on:* A string path.
  - *Connects to:* The underlying operating system filesystem.
  - *Shape:* Standard Java IO class.
- **`.toPath`**
  - *What it is:* An instance method on `java.io.File` that converts it to a modern `java.nio.file.Path`.
  - *Implementation:* `(.toPath fileObj)`.
  - *Its use:* Used to interoperate with newer Java NIO APIs.
  - *Type:* Instance method call.
  - *Responsibility:* Returns a `Path` object corresponding to the `File`.
  - *Depends on:* A `File` instance.
  - *Connects to:* The `java.nio` system.
  - *Shape:* Java IO bridging method.
- **`java.nio.file.Files/readAllBytes`**
  - *What it is:* A static method that reads all bytes from a file.
  - *Implementation:* `(Files/readAllBytes pathObj)`.
  - *Its use:* Used to read file contents directly from the filesystem.
  - *Type:* Static method.
  - *Responsibility:* Opens a file, reads all its bytes into an array, and closes the file.
  - *Depends on:* A `Path` object.
  - *Connects to:* The filesystem.
  - *Shape:* Modern Java IO utility.
- **`String.`**
  - *What it is:* The constructor for a Java `String`, specifying bytes and an encoding.
  - *Implementation:* `(String. bytes charset)`.
  - *Its use:* Used to convert a raw byte array into a decoded string.
  - *Type:* Constructor call.
  - *Responsibility:* Decodes bytes into characters using the specified charset.
  - *Depends on:* A byte array and a charset object.
  - *Connects to:* String allocation.
  - *Shape:* Fundamental Java class.
- **`java.nio.charset.StandardCharsets/UTF_8`**
  - *What it is:* A static field containing the UTF-8 charset object.
  - *Implementation:* `StandardCharsets/UTF_8`.
  - *Its use:* Used to specify the text encoding when decoding bytes.
  - *Type:* Static field constant.
  - *Responsibility:* Represents the UTF-8 encoding standard.
  - *Depends on:* Nothing.
  - *Connects to:* Used by string constructors and decoders.
  - *Shape:* Standard Java constant.
- **`slurp`**
  - *What it is:* A core Clojure function that reads the entire contents of a file or URL into a string.
  - *Implementation:* `(slurp path)`.
  - *Its use:* Used as the simpler, idiomatic alternative to raw Java IO for most common cases.
  - *Type:* Function.
  - *Responsibility:* Handles opening, reading, and closing a resource, returning its contents as a string.
  - *Depends on:* A path or URL.
  - *Connects to:* Java IO internally.
  - *Shape:* Core Clojure utility.
- **`vec`**
  - *What it is:* A core Clojure function that creates a vector from a collection.
  - *Implementation:* `(vec coll)`.
  - *Its use:* Used to convert a Java `List` into a persistent Clojure vector.
  - *Type:* Function.
  - *Responsibility:* Iterates over the input collection and builds a new Clojure vector.
  - *Depends on:* An iterable collection or array.
  - *Connects to:* Clojure's persistent data structures.
  - *Shape:* Core Clojure collection converter.
- **`into`**
  - *What it is:* A core Clojure function that pours items from one collection into another.
  - *Implementation:* `(into to from)`.
  - *Its use:* Used to convert Java collections into specific Clojure collections, like putting a Java `HashMap` into a Clojure map.
  - *Type:* Function.
  - *Responsibility:* Conjoins items from the source collection into the target collection.
  - *Depends on:* A target collection and a source collection.
  - *Connects to:* The `conj` operation for the specific target type.
  - *Shape:* Core Clojure data manipulation.
- **`java.util.HashMap.`**
  - *What it is:* The constructor for a Java `HashMap`.
  - *Implementation:* `(java.util.HashMap.)`.
  - *Its use:* Used to create a mutable Java map.
  - *Type:* Constructor call.
  - *Responsibility:* Allocates an empty hash table-based map.
  - *Depends on:* Nothing.
  - *Connects to:* Java's collections framework.
  - *Shape:* Standard Java collection class.
- **`.put`**
  - *What it is:* The instance method to insert a key-value pair into a Java map.
  - *Implementation:* `(.put map key value)`.
  - *Its use:* Used to mutate a Java `HashMap`.
  - *Type:* Instance method call.
  - *Responsibility:* Associates the specified value with the specified key in the map.
  - *Depends on:* A map instance, a key, and a value.
  - *Connects to:* The map's internal hash table.
  - *Shape:* Standard map operation.
- **`java.util.List`**
  - *What it is:* The standard Java interface for an ordered collection (sequence).
  - *Implementation:* `interface List<E>`.
  - *Its use:* Explained as the interface that Clojure vectors implement.
  - *Type:* Interface.
  - *Responsibility:* Defines the contract for list-like collections in Java.
  - *Depends on:* N/A (interface).
  - *Connects to:* Implemented by classes like `ArrayList` and Clojure vectors.
  - *Shape:* Java Collections framework interface.
- **`java.util.Map`**
  - *What it is:* The standard Java interface for an object that maps keys to values.
  - *Implementation:* `interface Map<K, V>`.
  - *Its use:* Explained as the interface that Clojure maps implement.
  - *Type:* Interface.
  - *Responsibility:* Defines the contract for key-value mappings in Java.
  - *Depends on:* N/A (interface).
  - *Connects to:* Implemented by classes like `HashMap` and Clojure maps.
  - *Shape:* Java Collections framework interface.
- **`ArithmeticException`**
  - *What it is:* A standard Java exception class thrown for exceptional arithmetic conditions (like divide by zero).
  - *Implementation:* `class ArithmeticException extends RuntimeException`.
  - *Its use:* Caught in the `try`/`catch` block to demonstrate error handling.
  - *Type:* Class.
  - *Responsibility:* Represents a specific runtime arithmetic error.
  - *Depends on:* The math operation that fails.
  - *Connects to:* The JVM's exception handling system.
  - *Shape:* Standard Java error type.
- **`.getMessage`**
  - *What it is:* An instance method on Java exceptions.
  - *Implementation:* `(.getMessage exception)`.
  - *Its use:* Used to retrieve the descriptive error message from the caught exception object.
  - *Type:* Instance method call.
  - *Responsibility:* Returns the detail message string of the throwable.
  - *Depends on:* An exception instance.
  - *Connects to:* The exception object.
  - *Shape:* Standard error reporting method.

## Concept Unit: Static Methods and Fields

### The Problem

Clojure runs on the JVM. The JVM has an enormous ecosystem of battle-tested, high-performance libraries built over decades — from advanced math and cryptography to networking and database drivers. We need a way to call into this existing Java code directly from Clojure without having to write wrappers or translation layers. The simplest Java code to call are static methods and fields, which belong to a class itself rather than a specific object instance.

### Introduce the concept in isolation

We can call Java's math library directly from the REPL to perform calculations:

```clojure
; Static method: ClassName/methodName
user=> (Math/sqrt 16)
4.0
user=> (Math/pow 2 10)
1024.0
user=> (Math/abs -5)
5
user=> (System/currentTimeMillis)
1712000000000

; Static field: ClassName/fieldName
user=> Math/PI
3.141592653589793
user=> Math/E
2.718281828459045
user=> Integer/MAX_VALUE
2147483647
```

This output proves that we are executing real Java methods and accessing real Java constants from Clojure, with the results returned seamlessly as Clojure values. This syntax is called **Java Interop**.

### Discard the throwaway example

These math calls were a demonstration of the syntax and will not be added to our project.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition to demonstrate the interop syntax.
- **Files affected:** `src/clj_arc/interop.clj` (created)
- **Change type:** Add
- **Location:** A new file.
- **Dependencies:** None.

### The New Code

```clojure
(ns clj-arc.interop)

(defn calculate-circle-area [radius]
  (* Math/PI (Math/pow radius 2)))
```

### The Updated Project

```clojure
(ns clj-arc.interop)

// ← new
(defn calculate-circle-area [radius]
  (* Math/PI (Math/pow radius 2)))
```

The new file introduces a function `calculate-circle-area` that computes the area of a circle using pure Java math constants and methods, multiplied by Clojure's standard `*` operator.

### Mechanical walkthrough

- **`Math/PI`**: Accesses a static field. The `/` character separates the Java class name (`Math`) from the field name (`PI`). Clojure looks up the class, finds the public static constant, and retrieves its value (`3.141592653589793`).
- **`Math/pow`**: Calls a static method. The form is `(ClassName/methodName arg1 arg2)`. Clojure translates this directly into a Java static method invocation: `Math.pow(radius, 2)`.
- **`*`**: Clojure's core multiplication function takes the result of the Java interop and multiplies it natively.

## Concept Unit: Creating Instances and Calling Methods

### The Problem

Static methods are useful for utility functions, but most Java code is object-oriented: you instantiate a class to create an object, then call instance methods on that specific object to change its state or retrieve data. Clojure needs a syntax to both create these objects and interact with their instance methods.

### Introduce the concept in isolation

We can create a Java `ArrayList` and `StringBuilder` in the REPL:

```clojure
; Create an instance: (new ClassName args) or (ClassName. args)
user=> (new java.util.Date)
#inst "2024-04-01T12:00:00.000-00:00"
user=> (java.util.Date.)
#inst "2024-04-01T12:00:00.000-00:00"
user=> (java.util.ArrayList. [1 2 3])
[1, 2, 3]

; Call instance methods: (.method object args)
user=> (def sb (java.lang.StringBuilder.))
#'user/sb
user=> (.append sb "Hello")
#object[java.lang.StringBuilder 0x1234567 "Hello"]
user=> (.append sb ", ")
#object[java.lang.StringBuilder 0x1234567 "Hello, "]
user=> (.append sb "World")
#object[java.lang.StringBuilder 0x1234567 "Hello, World"]
user=> (.toString sb)
"Hello, World"

; Chaining with doto (apply multiple methods to the same object):
user=> (def sb2
         (doto (java.lang.StringBuilder.)
           (.append "Hello")
           (.append ", ")
           (.append "World")))
#'user/sb2
user=> (.toString sb2)
"Hello, World"
```

This output proves we can allocate real Java objects, hold onto them in Clojure variables, and invoke their methods to mutate their internal state. The `doto` macro proves that we can streamline a sequence of mutations on a single object without repeating the object name.

### Discard the throwaway example

This string builder example is discarded and will not be added to our project.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/clj_arc/interop.clj` (modified)
- **Change type:** Add
- **Location:** After `calculate-circle-area`.
- **Dependencies:** None.

### The New Code

```clojure
(defn build-greeting [name]
  (let [builder (doto (java.lang.StringBuilder.)
                  (.append "Welcome, ")
                  (.append name)
                  (.append "!"))]
    (.toString builder)))
```

### The Updated Project

```clojure
(ns clj-arc.interop)

(defn calculate-circle-area [radius]
  (* Math/PI (Math/pow radius 2)))

// ← new
(defn build-greeting [name]
  (let [builder (doto (java.lang.StringBuilder.)
                  (.append "Welcome, ")
                  (.append name)
                  (.append "!"))]
    (.toString builder)))
```

The file now includes `build-greeting`, which uses Java's mutable `StringBuilder` to assemble a greeting string efficiently, demonstrating instantiation, method chaining, and final extraction.

### Mechanical walkthrough

- **`java.lang.StringBuilder.`**: The dot suffix `. ` signifies a constructor call. It is exactly equivalent to `(new java.lang.StringBuilder)`. This allocates a new object in JVM memory.
- **`doto`**: This macro takes the newly instantiated `StringBuilder` as its first argument. For every subsequent list (`(.append ...)`), it automatically inserts the `StringBuilder` object as the first argument to the method call. After all methods are executed, `doto` returns the mutated `StringBuilder` object.
- **`.append`**: The dot prefix `.` signifies an instance method call. The format is `(.methodName object arguments)`. Here, it mutates the Java object directly. Java objects are often mutable, breaking Clojure's functional purity rules — but Clojure allows this safely at boundaries.
- **`.toString`**: Another instance method call. It extracts the final, immutable Java string from the builder so we can return a normal value back to our Clojure program.

## Concept Unit: `import` and the ns form

### The Problem

Typing fully qualified Java class names like `java.lang.StringBuilder` or `java.util.ArrayList` is verbose and tedious. Just like we need aliases for Clojure namespaces, we need a way to bring Java classes into our current scope so we can refer to them by their short names (e.g., `StringBuilder`, `File`).

### Introduce the concept in isolation

We can use the `import` special form directly in the REPL:

```clojure
user=> (import java.io.File
               java.util.ArrayList
               java.util.HashMap)
java.util.HashMap

; Now use short names:
user=> (File. "/tmp")
#object[java.io.File 0x7654321 "/tmp"]
user=> (ArrayList.)
[]
```

This output proves that after importing, the Clojure compiler knows that `File` means `java.io.File`, allowing us to construct it concisely.

### Discard the throwaway example

This REPL-level `import` is discarded. In real projects, imports are declared at the top of the file.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/clj_arc/interop.clj` (modified)
- **Change type:** Refactor
- **Location:** The `ns` declaration at the top of the file.
- **Dependencies:** None.

### The New Code

```clojure
(ns clj-arc.interop
  (:import [java.io File]
           [java.util ArrayList HashMap]))
```

### The Updated Project

```clojure
// ← new (replaced old ns)
(ns clj-arc.interop
  (:import [java.io File]
           [java.util ArrayList HashMap]))

(defn calculate-circle-area [radius]
  (* Math/PI (Math/pow radius 2)))
```

The file's namespace declaration now includes an `:import` clause. This tells the Clojure compiler to resolve the short names `File`, `ArrayList`, and `HashMap` throughout the rest of the file. Note that classes in `java.lang` (like `Math`, `String`, and `StringBuilder`) are imported automatically and do not need to be declared.

### Mechanical walkthrough

- **`:import`**: A clause within the `ns` macro. It takes lists where the first element is the Java package name (`java.io`) and the subsequent elements are the specific class names in that package (`File`).
- **`[java.io File]`**: This tells Clojure: "Whenever you see `File` in this namespace, treat it as `java.io.File`." This is purely a compiler-level name resolution convenience; it doesn't load code at runtime the way Python's `import` does, because the JVM has already loaded the classes.

## Concept Unit: Reading a File using Java Interop

### The Problem

Clojure provides built-in functions for reading files, but underneath, it is just calling Java APIs. To truly understand interop, we need to see how we could write our own file reader using raw Java IO classes. This gives us the power to use new Java APIs (like NIO) or specialized file handlers that Clojure doesn't wrap for us.

### Introduce the concept in isolation

We can read a file directly from the REPL using Java's `Files` utility:

```clojure
user=> (import java.io.File
               java.nio.file.Files
               java.nio.charset.StandardCharsets)
java.nio.charset.StandardCharsets
user=> (String.
         (Files/readAllBytes (.toPath (File. "project.clj")))
         StandardCharsets/UTF_8)
"(defproject clj-arc \"0.1.0-SNAPSHOT\" ... )"
```

This output proves we can navigate Java's object hierarchy — converting a `File` to a `Path`, passing it to a static `Files` method to get a byte array, and constructing a Java `String` from those bytes.

### Discard the throwaway example

This manual interop is discarded as throwaway.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/clj_arc/interop.clj` (modified)
- **Change type:** Add
- **Location:** After `build-greeting`.
- **Dependencies:** The previous imports.

### The New Code

```clojure
(import java.nio.file.Files
        java.nio.charset.StandardCharsets)

(defn read-file-java [path]
  (String.
    (Files/readAllBytes (.toPath (File. path)))
    StandardCharsets/UTF_8))

(defn read-file-clojure [path]
  (slurp path))
```

### The Updated Project

```clojure
(defn build-greeting [name]
  (let [builder (doto (java.lang.StringBuilder.)
                  (.append "Welcome, ")
                  (.append name)
                  (.append "!"))]
    (.toString builder)))

// ← new
(import java.nio.file.Files
        java.nio.charset.StandardCharsets)

(defn read-file-java [path]
  (String.
    (Files/readAllBytes (.toPath (File. path)))
    StandardCharsets/UTF_8))

(defn read-file-clojure [path]
  (slurp path))
```

The file adds `read-file-java` to demonstrate the exact mechanism of raw Java IO, and immediately pairs it with `read-file-clojure` using `slurp` to show how Clojure's standard library abstracts this away for common tasks.

### Mechanical walkthrough

- **`File.`**: Constructs a `java.io.File` object representing the path string.
- **`.toPath`**: An instance method call on the `File` object that returns a `java.nio.file.Path` object, which newer Java IO APIs require.
- **`Files/readAllBytes`**: A static method call that takes the `Path`, reads every byte from the file, and returns a raw Java byte array (`byte[]`).
- **`StandardCharsets/UTF_8`**: A static field returning the UTF-8 charset object.
- **`String.`**: The constructor for a Java string. It takes the byte array and the charset, decoding the raw bytes into a formatted string.
- **`slurp`**: A core Clojure function that wraps similar Java IO logic internally. For most file reading, `slurp` is preferred over manual interop because it is shorter and handles edge cases automatically, but the manual interop is always available when you need behavior `slurp` doesn't provide.

## Concept Unit: Converting Between Java and Clojure Collections

### The Problem

Java APIs return Java collections (like `ArrayList` or `HashMap`), which are inherently mutable. Clojure code expects persistent, immutable collections (like vectors and Clojure maps). We need a mechanism to translate data cleanly across this boundary, turning Java objects into Clojure data structures and vice versa.

### Introduce the concept in isolation

We can construct Java collections and pull them into Clojure vectors and maps:

```clojure
; Java ArrayList -> Clojure vector:
user=> (def java-list (java.util.ArrayList. [1 2 3 4 5]))
#'user/java-list
user=> (vec java-list)
[1 2 3 4 5]
user=> (into [] java-list)
[1 2 3 4 5]

; Clojure vector -> Java ArrayList:
user=> (java.util.ArrayList. [1 2 3])
[1, 2, 3]

; Java HashMap -> Clojure map:
user=> (def java-map (doto (java.util.HashMap.)
                       (.put "a" 1)
                       (.put "b" 2)))
#'user/java-map
user=> (into {} java-map)
{"a" 1, "b" 2}
```

This output proves that Clojure's core collection functions natively understand Java collections. When we call `vec` on an `ArrayList`, it copies the items into an immutable Clojure vector.

### Discard the throwaway example

These conversions are discarded as throwaway.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/clj_arc/interop.clj` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code

```clojure
(defn process-java-map [java-map]
  (let [clj-map (into {} java-map)]
    (assoc clj-map "processed" true)))
```

### The Updated Project

```clojure
(defn read-file-clojure [path]
  (slurp path))

// ← new
(defn process-java-map [java-map]
  (let [clj-map (into {} java-map)]
    (assoc clj-map "processed" true)))
```

The file adds a function that takes a mutable Java map, safely converts it to an immutable Clojure map, and then performs a standard Clojure update on it.

### Mechanical walkthrough

- **`into`**: A core Clojure function that takes a target collection (`{}`) and pours elements from a source collection into it. Because Clojure's persistent collections implement standard Java interfaces (`java.util.List`, `java.util.Map`), and Java collections do too, `into` seamlessly iterates over the `java.util.HashMap` and inserts its key-value pairs into the new Clojure map.
- **`{}`**: The empty Clojure map literal acting as the target.
- **`assoc`**: Operates on the newly created, immutable `clj-map`, safely returning a new version without mutating the original Java map.

## Concept Unit: Exception Handling

### The Problem

Java code throws exceptions when errors occur (like division by zero, missing files, or network timeouts). If we call Java methods, those exceptions will bubble up into our Clojure code. We need a way to catch these Java exceptions, handle the error gracefully, and ensure cleanup code runs regardless of success or failure.

### Introduce the concept in isolation

We can trigger and catch an exception in the REPL:

```clojure
user=> (try
         (/ 10 0)
         (catch ArithmeticException e
           (println "Cannot divide by zero:" (.getMessage e))
           nil)
         (finally
           (println "divide attempt complete")))
Cannot divide by zero: Divide by zero
divide attempt complete
nil
```

This output proves that the `try` block executes code, the `catch` block intercepts specific Java exception types when they occur, and the `finally` block executes unconditionally at the end, returning the result of the `catch` block.

### Discard the throwaway example

This REPL test is discarded.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/clj_arc/interop.clj` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code

```clojure
(defn safe-divide [a b]
  (try
    (/ a b)
    (catch ArithmeticException e
      (println "Cannot divide by zero:" (.getMessage e))
      nil)
    (finally
      (println "divide attempt complete"))))
```

### The Updated Project

```clojure
(defn process-java-map [java-map]
  (let [clj-map (into {} java-map)]
    (assoc clj-map "processed" true)))

// ← new
(defn safe-divide [a b]
  (try
    (/ a b)
    (catch ArithmeticException e
      (println "Cannot divide by zero:" (.getMessage e))
      nil)
    (finally
      (println "divide attempt complete"))))
```

The file adds `safe-divide`, which wraps a mathematical operation in an error-handling boundary, catching bad inputs and returning `nil` instead of crashing the program.

### Mechanical walkthrough

- **`try`**: A special form that establishes a boundary. Code inside it is executed, but if a Java exception is thrown, control immediately jumps out of the normal flow and looks for a matching `catch` clause. This is the same escape-continuation mechanism from Lesson 20, but mapped to the JVM's underlying exception model.
- **`catch`**: Specifies the exact Java exception class to intercept (`ArithmeticException`). If an exception of this type (or a subclass) is thrown, it is bound to the local variable name (`e`), and the body of the `catch` block executes. The result of the `catch` block becomes the result of the entire `try` form.
- **`ArithmeticException`**: A specific Java class representing a mathematical error. We match on the class name.
- **`.getMessage`**: An instance method call on the exception object `e`. Java exceptions carry descriptive strings; this retrieves that string.
- **`finally`**: A block of code guaranteed to run exactly once, whether the `try` block succeeded or an exception was caught. It is typically used to close files or release resources. Its return value is ignored; it executes purely for side effects.

---

Java interop is why Clojure is used in production. The entire Java ecosystem — databases (JDBC), HTTP (HttpClient, Ring), JSON (Jackson, Cheshire), machine learning, AWS SDKs — is available. The interop syntax is minimal and consistent. You can construct objects, call methods, access constants, and catch errors using a handful of predictable syntactic patterns.

In the next lesson, we will look at how Clojure manages state over time.
