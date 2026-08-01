---
series: java-fundamentals
level: 4
title: Strings Deep Dive
lang: java
---

# Strings Deep Dive

Level 0 already used `String` as a type; this lesson treats it as a real, deep API — the methods every Java program leans on for real text processing, plus the one structural fact (immutability) that changes how string code has to be written.

## String Methods

```java
public class Main {
    public static void main(String[] args) {
        String s = "  Hello, World!  ";
        System.out.println(s.trim());
        System.out.println(s.trim().toUpperCase());
        System.out.println(s.trim().toLowerCase());
        System.out.println(s.trim().length());
        System.out.println(s.trim().substring(7));
        System.out.println(s.trim().indexOf("World"));
        System.out.println(s.trim().replace("World", "Java"));
        System.out.println(s.trim().contains("Hello"));
    }
}
```

```text
Hello, World!
HELLO, WORLD!
hello, world!
13
World!
7
Hello, Java!
true
```

`s.trim()` — returns a new string with leading and trailing whitespace removed; `s` itself is untouched (the next section proves exactly why).

`.toUpperCase()` / `.toLowerCase()` — case conversion. `.length()` — character count (note the parentheses — a method call, unlike an array's plain `.length` field from Level 2). `.substring(7)` — everything from index `7` onward. `.indexOf("World")` — the starting index of the first match, or `-1` if not found. `.replace("World", "Java")` — every occurrence of the first argument replaced with the second. `.contains("Hello")` — `true`/`false` for whether the substring appears anywhere.

Every one of these methods is chained directly off `s.trim()` — proof that each call *returns* a new `String`, which the next call in the chain immediately operates on.

## Strings Are Immutable

```java
public class Main {
    public static void main(String[] args) {
        String a = "hello";
        String b = a.toUpperCase();
        System.out.println(a);
        System.out.println(b);
        System.out.println(a == b);
    }
}
```

```text
hello
HELLO
false
```

`a.toUpperCase()` does not change `a` — `a` still prints `"hello"` afterward. Every `String` method that looks like it "changes" a string actually leaves the original completely alone and returns a brand-new `String` object instead — this is what **immutable** means: once created, a `String`'s own characters can never change.

`a == b` — `false`, because `a` and `b` are two genuinely different `String` objects in memory (`==` on objects compares identity, not content — a real trap this lesson names directly so Level 7's own object-equality material has firm ground to build on). `.equals()`, not `==`, is the correct way to compare two strings' actual contents — used throughout this course's own `assert` lines already, for exactly this reason.

**CS lens:** Immutability is why `String` is safe to share freely — if ten different parts of a program all hold a reference to the same `String`, none of them can ever corrupt it for the others, because none of them can change it at all. This is also *why* string-building methods return new objects instead of mutating in place — the next section's `StringBuilder` exists specifically for the situation where that becomes genuinely expensive.

## StringBuilder — Building Strings Efficiently

```java
public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello");
        sb.append(", ");
        sb.append("World!");
        System.out.println(sb.toString());
        System.out.println(sb.length());
        sb.reverse();
        System.out.println(sb.toString());
    }
}
```

```text
Hello, World!
13
!dlroW ,olleH
```

`new StringBuilder()` — unlike `String`, `StringBuilder` is **mutable**: its own internal character buffer really does grow and change in place. `.append(...)` — adds text onto the end, modifying `sb` itself, not creating a new object each time. `.reverse()` — reverses the characters in place. `.toString()` — converts back to a real, immutable `String` once building is done.

**SE lens:** `"a" + "b" + "c"` repeated inside a loop silently creates a brand-new `String` object on *every single concatenation* — each one immediately discarded except the last, real, wasted allocation. `StringBuilder` exists precisely for that situation: building a string piece by piece, especially inside a loop, should use `.append()`, reserving plain `+` concatenation (Level 0's own `"Name: " + name`) for the rare, one-shot case where performance was never actually at stake.

## Splitting and Joining

```java
public class Main {
    public static void main(String[] args) {
        String csv = "a,b,c,d";
        String[] parts = csv.split(",");
        for (String p : parts) System.out.println(p);
        System.out.println(String.join("-", parts));
        System.out.println("".split(",").length);
    }
}
```

```text
a
b
c
d
a-b-c-d
1
```

`csv.split(",")` — breaks a string into a `String[]` wherever the given delimiter appears. `String.join("-", parts)` — the reverse: combines an array of strings into one, with `"-"` placed between each element.

`"".split(",")` — a real trap: an empty string split on anything still returns an array with **one** element (`[""]`), not zero — `.length` here is `1`, not `0`. Any code counting words or fields by calling `.split()` needs to handle this explicitly, usually with an `isEmpty()` check on the original string first.

## Comparing Strings

```java
public class Main {
    public static void main(String[] args) {
        String a = "apple";
        String b = "banana";
        System.out.println(a.compareTo(b));
        System.out.println(a.equals("apple"));
        System.out.println(a.equalsIgnoreCase("APPLE"));
    }
}
```

```text
-1
true
true
```

`a.compareTo(b)` — lexicographic (dictionary-order) comparison: negative when `a` sorts before `b`, positive when after, `0` when equal. The exact negative number isn't meaningful on its own — only its sign is.

`.equals(...)` — content equality, the correct choice for comparing two strings' actual characters (never `==`, per the previous section). `.equalsIgnoreCase(...)` — the same comparison, case-insensitively.

## Challenge: reverse_words

Write a `static String reverseWords(String s)` method that reverses the *order* of the words in `s` (splitting on single spaces), without reversing the letters inside each word.

```challenge
static String reverseWords(String s) {
    // TODO
}
```

```test
assert reverseWords("hello world").equals("world hello")
assert reverseWords("a b c").equals("c b a")
assert reverseWords("single").equals("single")
assert reverseWords("one two three four").equals("four three two one")
```
