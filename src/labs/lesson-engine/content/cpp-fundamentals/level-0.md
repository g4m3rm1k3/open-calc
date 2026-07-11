---
title: C++ Level 0: Hello, Types, and Memory
series: cpp-fundamentals
level: 0
topic: cpp
lang: cpp
---

# C++ Level 0: Hello, Types, and Memory

## A Program Has a Starting Point

C++ programs usually begin at `main()`. The braces hold the instructions that run, top to bottom.

**CS lens:** C++ makes memory and types more visible than Python or JavaScript, so it is a good language for learning what the machine is doing underneath your code.

```cpp
#include <iostream>
using namespace std;

int main() {
  int count = 3;
  cout << "Count: " << count << endl;
  return 0;
}
```

## Values Have Types

The type is part of the variable declaration. It tells the compiler how much space a value needs and what operations make sense.

```cpp
#include <iostream>
using namespace std;

int main() {
  int score = 42;
  double ratio = 0.75;
  bool passed = true;

  cout << score << endl;
  cout << ratio << endl;
  cout << passed << endl;
  return 0;
}
```
