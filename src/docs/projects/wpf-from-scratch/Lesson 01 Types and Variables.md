# Lesson 01: Types and Variables

**What you will build:** A series of isolated console programs that allocate memory for data, manipulate that data, and prove how the C# compiler enforces rules about what that data represents. You will observe how values are copied in memory and how the compiler acts as a gatekeeper to prevent invalid operations before the program is ever allowed to run.

**What you need to know first:** Nothing.

**Terms introduced in this lesson:**
- **Variable** — a named location in memory used to store data. *Why it exists:* so that your program can store, retrieve, and manipulate data over time without needing to hardcode memory addresses.
- **Value Type** — a category of data types where the variable directly contains its data. *Why it exists:* to provide fast, stack-allocated storage for small, fundamental pieces of data.
- **Immutability** — the property of an object whose state cannot be modified after it is created. *Why it exists:* to guarantee that data remains consistent and predictable, especially when shared across different parts of a program.
- **Type Safety** — a language feature ensuring that a variable is only used in ways consistent with its defined type. *Why it exists:* to catch errors at compile time rather than crashing unexpectedly while the program is running.
- **Compile Time** — the period when the C# compiler translates your source code into executable instructions. *Why it exists:* to validate the structure, syntax, and type safety of your code before it executes.
- **Runtime** — the period when the executable instructions are actively executing on the computer. *Why it exists:* to perform the actual computational work defined by your code.
- **Type Inference** — the compiler's ability to deduce the type of a variable from the value assigned to it. *Why it exists:* to reduce redundant typing without sacrificing the guarantees of type safety.

**Objects and methods used:**
- **Console / WriteLine**
  - *What it is:* A built-in command that outputs text to the standard output stream (usually the terminal) followed by a line break.
  - *Implementation:* `public static void WriteLine(string value)` (and overloads for other types).
  - *Its use:* To make the internal state of your variables visible so you can verify what your program is doing.

---

## Concept Unit: Value Types

### The Problem
A program needs to hold onto information—numbers, characters, true/false states—so it can use them later. When you store this information, you need a guarantee that if you give a copy of this information to another part of your program, altering the copy will not accidentally overwrite the original data.

### The New Code
```csharp
int originalScore = 100;
double temperature = 98.6;
bool isOnline = true;
char grade = 'A';

int copiedScore = originalScore;
copiedScore = 50;

Console.WriteLine(originalScore);
Console.WriteLine(copiedScore);
```

### Mechanical Walkthrough
- `int originalScore = 100;` declares a variable of type `int` (a 32-bit integer) named `originalScore` and assigns it the value 100. The compiler allocates memory specifically sized for an integer, because without exactly defining the size and shape of the data, the computer cannot safely store or retrieve it.
- `double temperature = 98.6;` allocates memory for a double-precision floating-point number. The `double` type is used here because an `int` cannot store fractional values; attempting to do so would result in the compiler rejecting the code.
- `bool isOnline = true;` allocates memory for a boolean value. This works because a `bool` strictly represents binary logic (true or false), which is the fundamental unit of decision-making in computation.
- `char grade = 'A';` allocates memory for a single Unicode character. The single quotes are required to tell the compiler this is a character literal, not a variable name or text string.
- `int copiedScore = originalScore;` creates a completely new `int` variable named `copiedScore`. It reads the value stored in `originalScore` (100) and writes that exact value into the new memory location belonging to `copiedScore`.
- `copiedScore = 50;` overwrites the data in the memory location of `copiedScore`. Because `copiedScore` is a separate location in memory, this change affects only `copiedScore`. The original memory location remains completely untouched.
- `Console.WriteLine(...)` prints the values. Because the variables are isolated in memory, printing `originalScore` outputs 100, and printing `copiedScore` outputs 50.

### CS Lens
This embodies the concept of "Pass by Value" and stack allocation. Small, fundamental units of data are stored directly where they are declared. When you assign one value type to another, the computer physically copies the binary data from one memory address to another, ensuring total isolation between the two variables.

### SE Lens
The engineering principle is data isolation by default. The alternative not chosen is storing all variables as shared references (like a shared document online). The tradeoff is that value types require copying memory every time they are assigned, which is incredibly fast for small data (like an `int`), but would be computationally expensive if applied to massive structures.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n ValueTypesConcept`.
2. Navigate into the folder with `cd ValueTypesConcept`.
3. Open `Program.cs` and replace all its contents with the code above.
4. Run the program with `dotnet run`.
5. Expected output:
   ```
   100
   50
   ```

---

## Concept Unit: Strings and Immutability

### The Problem
Single characters (`char`) are rarely enough; programs need to store sequences of text, like names or messages. Furthermore, when dealing with text, replacing a word shouldn't inadvertently rewrite the original text held by other parts of the program. 

### The New Code
```csharp
string originalGreeting = "Hello";
string copiedGreeting = originalGreeting;

originalGreeting = "Goodbye";

Console.WriteLine(originalGreeting);
Console.WriteLine(copiedGreeting);
```

### Mechanical Walkthrough
- `string originalGreeting = "Hello";` declares a variable of type `string` and assigns it a sequence of characters. The double quotes are mandatory because they signal to the compiler that this is a string literal.
- `string copiedGreeting = originalGreeting;` assigns the existing string to a new variable. 
- `originalGreeting = "Goodbye";` points `originalGreeting` to a completely new string in memory. It does not alter the text "Hello". Because strings are immutable, the text "Hello" is locked in memory the moment it is created. `originalGreeting` simply abandons the old text and points to the new text.
- `Console.WriteLine(originalGreeting);` outputs "Goodbye", because the variable was pointed to a new string.
- `Console.WriteLine(copiedGreeting);` outputs "Hello". The original string was never mutated, so `copiedGreeting` still points to the unaltered "Hello" in memory.

### CS Lens
This embodies the concept of Immutability. Like an etched stone tablet, the data cannot be changed once created. If you want a different text, you must carve a new tablet. In computer science, this is crucial for predictable state management, particularly when multiple processes read the same data concurrently.

### SE Lens
The alternative not chosen is mutable strings (where you could alter the 3rd letter of "Hello" directly in memory). The tradeoff C# makes is increased memory allocation: every time you modify a string, you are actually creating a brand new string and leaving the old one behind for the garbage collector. This costs more memory and processing power, but eliminates an entire class of bugs where data changes unexpectedly beneath you.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n StringsConcept`.
2. Navigate into the folder with `cd StringsConcept`.
3. Open `Program.cs` and replace all its contents with the code above.
4. Run the program with `dotnet run`.
5. Expected output:
   ```
   Goodbye
   Hello
   ```

---

## Concept Unit: Type Safety

### The Problem
If a variable is designed to hold an integer, storing text inside it represents a catastrophic logic failure. If the program attempts to perform arithmetic on the word "Hello", the computer does not know how to process that instruction. We need the system to categorically refuse invalid data long before the code is actually executed.

### The New Code
```csharp
int quantity = 5;
string item = "apples";

// The compiler requires strict types.
// We must convert the integer to a string explicitly to combine them.
string message = quantity.ToString() + " " + item;

Console.WriteLine(message);
```

### Mechanical Walkthrough
- `int quantity = 5;` creates a variable strictly bound to the rules of 32-bit integers.
- `string item = "apples";` creates a variable strictly bound to the rules of text strings.
- `quantity.ToString()` explicitly asks the integer to generate a text-string representation of itself. Because an integer is not a string, they cannot be directly merged without translation. This method translates the mathematical value `5` into the character `'5'`.
- `+ " " + item` concatenates (joins) the strings together. This works because the compiler verifies that the left side of the `+` is a string, and the right side is a string. If we had typed `int x = "hello";`, the compiler would refuse to compile the program because the memory layout of a string cannot fit into the memory layout of an integer.

### CS Lens
This embodies Static Typing. The shape and constraints of every variable are evaluated against strict rules before the program is permitted to run. This is similar to a physical puzzle box: if you try to put a square peg in a round hole, the physical constraints prevent it immediately, rather than letting you drop it in and causing a jam later.

### SE Lens
The alternative not chosen is Dynamic Typing (used by Python or JavaScript), where variables have no fixed type and can hold anything at any time. The real tradeoff here is friction versus safety. C# forces you to explicitly declare intentions and write translation logic (like `.ToString()`), which slows down initial development but drastically reduces runtime crashes in production.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n TypeSafetyConcept`.
2. Navigate into the folder with `cd TypeSafetyConcept`.
3. Open `Program.cs` and replace all its contents with the code above.
4. Run the program with `dotnet run`.
5. Expected output:
   ```
   5 apples
   ```

---

## Concept Unit: Local Type Inference (var)

### The Problem
When the type of a variable is blatantly obvious from the value being assigned to it, forcing the programmer to write out the type name is redundant. We need a way to let the compiler figure out the type automatically, without sacrificing the strict safety rules established in the previous unit.

### The New Code
```csharp
var name = "Alice";
var year = 2024;
var isComplete = false;

Console.WriteLine(name.ToUpper());
Console.WriteLine(year + 1);
```

### Mechanical Walkthrough
- `var name = "Alice";` instructs the compiler to deduce the type of `name` by looking at the right side of the equals sign. Because `"Alice"` is a string literal, the compiler locks `name` to the `string` type. It is exactly identical to writing `string name = "Alice";`.
- `var year = 2024;` causes the compiler to lock `year` to the `int` type, because `2024` is an integer literal.
- `var isComplete = false;` locks `isComplete` to the `bool` type.
- `name.ToUpper()` calls a method specific to strings. This proves that `name` is strongly typed as a string at compile time. The compiler knows `name` is a string, so it allows string operations.
- `year + 1` performs integer math. If `var` meant "dynamic type", the compiler wouldn't know if this was a valid operation until runtime. Because `var` is statically typed, the compiler guarantees this math is valid before the program runs.

### CS Lens
This embodies Type Inference. The compiler acts as a static analyzer, tracing the flow of data to prove the type without explicit annotation. 

### SE Lens
The alternative not chosen is requiring explicit type annotations everywhere. The tradeoff `var` introduces is readability. While it saves keystrokes and makes code visually cleaner, it can obscure the exact type from the human reader if the right side of the assignment is a complex method call rather than an obvious literal.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n VarConcept`.
2. Navigate into the folder with `cd VarConcept`.
3. Open `Program.cs` and replace all its contents with the code above.
4. Run the program with `dotnet run`.
5. Expected output:
   ```
   ALICE
   2025
   ```

---

## Connect the Pieces

Observe how strict data typing governs data isolation and behavior:
We define `int a = 10;`. The compiler allocates a 32-bit integer. We use type inference to create a copy: `var b = a;`. The compiler infers `b` is also an `int`. We assign `b = 20;`. Because `int` is a value type, `a` remains 10. We attempt to store text: `b = "twenty";`. The compiler strictly enforces type safety, completely rejecting the change because `b` was locked as an `int` at compile time, demonstrating that `var` does not bypass the rules of static typing.

## What Breaks Without This

Without type safety, your programs would crash unpredictably when given incompatible data. Let's force the compiler to stop you.

Open a console project and write this single line:
```csharp
int target = "hello";
```

Run `dotnet build`. The compilation fails before the program ever runs.
**The error:**
`error CS0029: Cannot implicitly convert type 'string' to 'int'`

The compiler caught the logic flaw. To fix it, you must respect the types. Restore it by either changing the variable type to `string`, or the value to a number.

## Exercises

1. Create a `double` variable representing a price. Use `var` to create a second variable that holds that price. Change the second variable. Print both to prove the first price did not change.
2. Create a string variable using `var` and assign it your first name. On the next line, attempt to assign the number `42` to that same variable. Run `dotnet build` to observe the type inference locking the variable's type, causing a compile-time error.
3. Fix the error in exercise 2 by using `.ToString()` on the number to satisfy the type constraints of the string variable.

## Definition of Done
- [ ] You have written and executed code that proves changing a copied integer does not change the original.
- [ ] You have written and executed code that proves strings act immutably upon reassignment.
- [ ] You have intentionally triggered a compiler error by assigning the wrong data type to a variable.
- [ ] You have verified that `var` enforces type safety at compile time.
- [ ] You can explain type safety out loud, in your own words, to someone who hasn't read this lesson.
