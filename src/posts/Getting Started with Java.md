# Getting Started with Java

## Your First Program (For Complete Beginners)

_"We're going to assume you've never programmed before."_

---

# What You'll Learn

By the end of this lesson you'll understand:

- What Java is
- What a program is
- What source code is
- What a compiler does
- What the JVM is
- How Java files are organized
- How to write your first program
- Why every piece of code exists
- How to run your program

No previous programming experience is required.

---

# Before We Write Code

Imagine telling another person exactly how to make a peanut butter sandwich.

You can't say:

> Make a sandwich.

You have to give every step.

Programming is exactly the same.

A program is simply a list of instructions for a computer.

Java is one language we use to write those instructions.

---

# What is Java?

Java is a programming language.

Programming languages allow humans to communicate with computers.

Instead of speaking English...

```
Make a sandwich.
```

...we write Java.

```
System.out.println("Hello");
```

The computer understands Java after it is translated into machine code.

---

# Source Code

The code you write is called **source code**.

Example:

```java
System.out.println("Hello");
```

Humans can read this.

Computers cannot.

Something has to translate it.

---

# The Compiler

Java uses something called a compiler.

Think of it as a translator.

```
You
   │
   ▼

Java Source Code

   │

Compiler

   │

Bytecode

   │

Java Virtual Machine

   │

Computer
```

---

# Why Doesn't Java Run Directly?

Different computers speak different machine languages.

Windows

↓

Linux

↓

Mac

↓

Each has different machine instructions.

Java solves this problem.

Instead of compiling directly to machine code...

```
Java

↓

Bytecode

↓

JVM

↓

Machine Code
```

That's why Java is famous for:

> Write Once, Run Anywhere

---

# The Java Virtual Machine (JVM)

The JVM is a program that runs Java programs.

Think of it as a translator that sits between your code and the operating system.

```
Your Program

↓

JVM

↓

Windows
```

or

```
Your Program

↓

JVM

↓

Mac
```

or

```
Your Program

↓

JVM

↓

Linux
```

As long as a computer has a JVM installed, it can run Java programs.

---

# Creating Your First Program

Create a file named

```
Main.java
```

Notice the extension:

```
.java
```

That tells the computer this is a Java source file.

---

# Your First Program

```java
public class Main {

    public static void main(String[] args) {

        System.out.println("Hello, World!");

    }

}
```

Don't panic.

We're going to explain every single word.

---

# Breaking It Apart

```java
public
```

**public** is an access modifier.

For now, think of it as saying:

> "Other parts of the program are allowed to use this."

---

```java
class
```

A class is a blueprint.

Everything in Java lives inside a class.

Imagine building a house.

The blueprint comes first.

A class is that blueprint.

---

```java
Main
```

This is the name of our class.

```java
public class Main
```

means

> Create a class named Main.

---

# Why Does the File Have to Match?

Notice:

```
Main.java
```

and

```java
class Main
```

have the same name.

Java requires this.

If they don't match, you'll get an error.

---

# Curly Braces

```java
{
```

means

Start.

```java
}
```

means

End.

Everything between them belongs together.

Like a box.

```
{

everything inside

}
```

---

# The Main Method

```java
public static void main(String[] args)
```

Looks scary.

Let's simplify it.

The important part is

```java
main
```

When Java starts your program...

it looks for something called

```
main()
```

Think of it like the front door.

Every Java program begins here.

---

# What Does static Mean?

Don't worry about it yet.

You'll learn later.

For now:

Every beginner Java program uses

```java
public static void main(...)
```

exactly like this.

---

# What Does void Mean?

Some methods return information.

This one doesn't.

```
void
```

means

Returns nothing.

---

# What Are String[] args?

When you run a Java program, you can send information into it.

Example:

```
java Main Michael
```

Then

```
args
```

would contain

```
Michael
```

We'll learn this later.

For now, leave it exactly as written.

---

# Finally...

Inside our method we have

```java
System.out.println("Hello, World!");
```

This is our first instruction.

---

# Breaking That Down

## System

```java
System
```

A built-in Java class.

Think of it as a toolbox.

---

## out

```java
System.out
```

Represents the computer's standard output.

Usually...

the console.

---

## println

```java
println()
```

Means

Print a line.

Whatever is inside the parentheses gets displayed.

---

# Parentheses

```java
()
```

Parentheses hold information.

Example:

```java
println("Hello")
```

The information is

```
Hello
```

---

# Quotation Marks

```java
"Hello"
```

Quotes create a String.

A String is simply text.

Examples:

```java
"Java"

"Programming"

"Pizza"

"Hello World"
```

---

# Semicolon

```java
;
```

A semicolon ends a statement.

Think of it like a period at the end of a sentence.

English:

```
I like pizza.
```

Java:

```java
System.out.println("Pizza");
```

---

# Running the Program

Compile:

```bash
javac Main.java
```

If there are no errors...

Java creates

```
Main.class
```

This contains bytecode.

---

Run it:

```bash
java Main
```

Output:

```
Hello, World!
```

Congratulations!

You just wrote your first Java program.

---

# Experiment 1

Change

```java
System.out.println("Hello, World!");
```

to

```java
System.out.println("Welcome to Java!");
```

Run it again.

Output:

```
Welcome to Java!
```

---

# Experiment 2

Print multiple lines.

```java
public class Main {

    public static void main(String[] args) {

        System.out.println("Hello");

        System.out.println("My name is Michael");

        System.out.println("I am learning Java.");

    }

}
```

Output

```
Hello
My name is Michael
I am learning Java.
```

---

# Experiment 3

Print numbers.

```java
public class Main {

    public static void main(String[] args) {

        System.out.println(5);

        System.out.println(100);

        System.out.println(-42);

    }

}
```

Output

```
5
100
-42
```

Notice there are **no quotation marks**. These are numbers, not text.

---

# Experiment 4

Print mathematical expressions.

```java
public class Main {

    public static void main(String[] args) {

        System.out.println(2 + 3);

        System.out.println(10 - 4);

        System.out.println(6 * 7);

        System.out.println(20 / 5);

    }

}
```

Output

```
5
6
42
4
```

Java evaluates the expressions before printing the results.

---

# Experiment 5

What happens if you remove the semicolon?

```java
System.out.println("Hello")
```

The program will not compile. You'll see an error similar to:

```
';' expected
```

This teaches an important lesson: **Java is very strict about its syntax**.

---

# Common Beginner Mistakes

| Mistake                                | Why It Happens                                             | How to Fix It                                   |
| -------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| File name doesn't match the class name | Java requires the public class name and file name to match | Rename the file or the class so both are `Main` |
| Missing semicolon                      | Every statement must end with `;`                          | Add the missing semicolon                       |
| Missing quotation marks around text    | Java thinks you're referring to a variable                 | Put text inside double quotes (`"..."`)         |
| Missing curly brace                    | Java can't determine where a block begins or ends          | Make sure every `{` has a matching `}`          |
| Running `java Main.java`               | The `java` command expects a class name, not a source file | Run `java Main` after compiling                 |
| Typing `Println` instead of `println`  | Java is case-sensitive                                     | Use the exact spelling: `println`               |

---

# Key Terms to Remember

| Term                       | Definition                                                       |
| -------------------------- | ---------------------------------------------------------------- |
| Program                    | A sequence of instructions executed by a computer                |
| Programming Language       | A language used to write programs                                |
| Source Code                | Human-readable code written by a programmer                      |
| Compiler                   | A program that translates source code into bytecode              |
| Bytecode                   | Platform-independent instructions generated by the Java compiler |
| JVM (Java Virtual Machine) | Software that executes Java bytecode on a computer               |
| Class                      | A blueprint that groups related data and behavior                |
| Method                     | A named block of code that performs a task                       |
| `main()`                   | The starting point of every Java application                     |
| String                     | A sequence of characters representing text                       |
| Statement                  | A single instruction in a Java program, usually ending with `;`  |
| Console                    | The text window where programs display output                    |

---

# What You've Accomplished

In this lesson, you learned:

- How Java programs are structured
- Why Java uses a compiler and the JVM
- What source code and bytecode are
- Why classes and files have matching names
- How the `main()` method serves as the entry point
- How to print text, numbers, and expressions
- The purpose of braces, parentheses, quotation marks, and semicolons
- How to compile and run a Java program
- How to recognize and fix common beginner mistakes

With this foundation, you're ready to move on to variables, data types, user input, and the basic building blocks of programming.
