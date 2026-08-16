# Lesson 12: Standard Library Containers

**What you will build:** You will write isolated console programs that store, retrieve, and organize collections of data. These programs demonstrate how to hold multiple values dynamically without manually managing raw memory arrays. The transferable problem this solves is selecting the right data structure—whether you need fast iteration, instant lookups by a key, or guaranteed uniqueness—using the C++ Standard Library.

**What you need to know first:** Lesson 11 Templates, Lesson 03 Pointers.

**Terms introduced in this lesson:**
- **Container** — A data structure that holds a collection of other objects. *Why it exists:* To manage the allocation and deallocation of memory for multiple items automatically, freeing you from manual pointer math.
- **Iterator** — An object that points to an element inside a container and can move to the next element. *Why it exists:* To provide a uniform way to traverse different types of containers (like vectors and maps) without needing to know how they are structured internally.
- **Hash function** — A mathematical algorithm that converts a key (like a string) into an integer. *Why it exists:* To determine exactly where a value should be stored in memory, enabling instant lookups without scanning the entire collection.

**Objects and methods used:**
- **`std::vector<T>` / `push_back`**
  - *What it is:* A dynamic array that can grow in size.
  - *Implementation:* `void push_back(const T& value);`
  - *Its use:* Appends an item to the end of the array, automatically allocating more memory if the current array is full.
- **`std::map<Key, T>` / `[]` operator**
  - *What it is:* A collection of key-value pairs, kept sorted by the key.
  - *Implementation:* `T& operator[](const Key& key);`
  - *Its use:* Retrieves or inserts a value associated with a specific key.
- **`std::unordered_map<Key, T>` / `find`**
  - *What it is:* A collection of key-value pairs stored via hashing, without any sorting order.
  - *Implementation:* `iterator find(const Key& key);`
  - *Its use:* Searches for a key directly, returning an iterator to it if it exists.
- **`std::set<Key>` / `insert`**
  - *What it is:* A collection that strictly holds only unique elements, keeping them sorted.
  - *Implementation:* `std::pair<iterator, bool> insert(const Key& value);`
  - *Its use:* Ensures no duplicate values exist in the collection while adding new ones.

---

## Concept Unit: `std::vector`

### The Problem
When storing multiple items of the same type, raw arrays require you to specify an exact size at the moment they are created. If you create an array of size five and later need to add a sixth element, you must manually allocate a new, larger block of memory, copy the five existing items over using pointers, and then delete the old block. You need a data structure that does this resizing work for you.

### The New Code
```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores;
    scores.push_back(100);
    scores.push_back(85);
    scores.push_back(95);
    
    std::cout << "Total scores: " << scores.size() << "\n";
    std::cout << "Second score: " << scores[1] << "\n";
    
    for (int score : scores) {
        std::cout << score << "\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <vector>`: Instructs the compiler to include the file defining the `std::vector` template. Without this, the compiler will not recognize the word `vector`.
- `std::vector<int> scores;`: Declares a variable named `scores`. The `<int>` template argument specifies that this vector will only hold integers. Initially, it holds zero elements.
- `scores.push_back(100);`: Calls the `push_back` method on the `scores` object. This requests the vector to store the value `100` at the end. The vector secretly allocates memory for this integer.
- `scores.size()`: Calls a method returning the total number of elements currently held.
- `scores[1]`: The subscript operator accesses the element at offset `1` (the second item, because counting starts at `0`). This reads directly from that memory location.
- `for (int score : scores)`: A range-based for loop. It asks the vector for its beginning and end iterators, sequentially pulling each integer into the local `score` variable for the loop body.
- `std::cout << score << "\n";`: Prints the current integer to the console, followed by a newline.

### CS Lens
This is a dynamic array. Under the hood, a vector keeps three pointers: one to the start of its allocated memory, one to the last element placed, and one to the end of the allocated memory. When you push an item and hit the allocated limit, the vector allocates a new, larger block (usually doubling in size), copies the old items, and frees the old block. 

### SE Lens
The alternative not chosen is manually managing `int*` pointers and using `new[]` and `delete[]`. The tradeoff here is a slight, occasional performance pause when the vector doubles its capacity, in exchange for guaranteed memory safety—you will not leak memory because the vector cleans itself up when it goes out of scope.

### Run It Yourself
1. Open a terminal and create a file named `vector_demo.cpp` with the code above.
2. Compile it: `g++ -std=c++17 vector_demo.cpp -o vector_demo`.
3. Run the executable: `./vector_demo` (or `vector_demo.exe` on Windows).
4. Observe the output:
   Total scores: 3
   Second score: 85
   100
   85
   95

---

## Concept Unit: `std::map`

### The Problem
Sometimes you need to look up data based on a specific label or identifier, such as a name, rather than a numeric sequence index. If you only have a `std::vector`, finding a specific record means looping through every single item until you find a match. You need a collection that maps a unique key directly to a value.

### The New Code
```cpp
#include <iostream>
#include <map>
#include <string>

int main() {
    std::map<std::string, int> ages;
    
    ages["Alice"] = 30;
    ages["Bob"] = 25;
    ages["Charlie"] = 35;
    
    std::cout << "Bob is " << ages["Bob"] << " years old.\n";
    
    for (const auto& pair : ages) {
        std::cout << pair.first << ": " << pair.second << "\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <map>`: Brings in the definition for `std::map`.
- `std::map<std::string, int> ages;`: Instantiates a map requiring two template types. The first (`std::string`) is the Key, and the second (`int`) is the Value.
- `ages["Alice"] = 30;`: The `[]` operator searches for the key `"Alice"`. Because it does not exist yet, the map creates a new entry for `"Alice"` and assigns the value `30` to it.
- `ages["Bob"]`: Searches the map for the key `"Bob"` and returns the integer associated with it.
- `for (const auto& pair : ages)`: Iterates through the map. Because a map holds two pieces of data per entry, it yields a `std::pair` object. The `const auto&` tells the compiler to deduce the exact type (`std::pair<const std::string, int>`) and take it by reference to avoid copying the data.
- `pair.first` and `pair.second`: Properties of the `std::pair` object. `first` holds the key (the string), and `second` holds the value (the integer).

### CS Lens
A `std::map` is typically implemented as a self-balancing binary search tree (like a Red-Black tree). This guarantees that the keys are always kept in sorted order. Finding, inserting, or removing an item takes logarithmic time based on the number of elements.

### SE Lens
The alternative not chosen is two parallel vectors (one for names, one for ages). The tradeoff here is memory overhead. A binary tree requires allocating individual nodes with extra pointers for the tree structure, using more memory than contiguous vectors, but it drastically reduces the time spent searching.

### Run It Yourself
1. Save the code in `map_demo.cpp`.
2. Compile: `g++ -std=c++17 map_demo.cpp -o map_demo`.
3. Run: `./map_demo`.
4. Observe the output. Notice that Alice, Bob, and Charlie print in alphabetical order, regardless of the order they were inserted.

---

## Concept Unit: `std::unordered_map`

### The Problem
`std::map` keeps everything sorted, which is useful, but maintaining that sorted tree structure takes a small amount of computational work on every insertion. If you only care about instantly looking up a value by its key and do not care about the order in which items are stored, that sorting work is wasted effort. 

### The New Code
```cpp
#include <iostream>
#include <unordered_map>
#include <string>

int main() {
    std::unordered_map<std::string, std::string> capitals;
    
    capitals["France"] = "Paris";
    capitals["Japan"] = "Tokyo";
    capitals["Egypt"] = "Cairo";
    
    if (capitals.find("Japan") != capitals.end()) {
        std::cout << "Capital of Japan is " << capitals["Japan"] << "\n";
    }
    
    for (const auto& pair : capitals) {
        std::cout << pair.first << " -> " << pair.second << "\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <unordered_map>`: Includes the hash table implementation.
- `std::unordered_map<std::string, std::string> capitals;`: Creates the container mapping a string key to a string value.
- `capitals.find("Japan")`: A method that searches for the key `"Japan"`. It returns an iterator pointing to the found element. If the key is not found, it returns an iterator representing the end of the map.
- `capitals.end()`: A method returning a special iterator that acts as a placeholder for "past the last element." It is used to check if a search failed.
- `!=`: The inequality operator. The statement `capitals.find("Japan") != capitals.end()` explicitly checks that the key was actually found before we try to read it.
- `capitals["Japan"]`: Retrieves the value. We do this safely because the `if` statement just proved the key exists.

### CS Lens
This is a hash table. When you provide `"Japan"`, the container runs a hash function on the string to produce an integer. It uses that integer as a direct array index to store or find the value. This provides constant-time lookups (O(1)), meaning it takes the same amount of time to find an item whether the map holds ten entries or a million.

### SE Lens
The alternative not chosen is using `std::map`. The tradeoff is that `std::unordered_map` has slightly higher memory requirements and an unpredictable internal order. You choose `std::unordered_map` when lookup speed is paramount; you choose `std::map` when you need to iterate over the keys in alphabetical or numeric order.

### Run It Yourself
1. Save the code in `unordered_map_demo.cpp`.
2. Compile: `g++ -std=c++17 unordered_map_demo.cpp -o unordered_map`.
3. Run: `./unordered_map`.
4. Observe the output. Notice that the countries do not print in alphabetical order or insertion order.

---

## Concept Unit: `std::set`

### The Problem
Sometimes you do not have key-value pairs; you only have single values, but you must ensure that no duplicates ever exist in your collection. If you use a `std::vector`, you would have to manually search the entire vector before every insertion to see if the item is already there. You need a container that enforces uniqueness automatically.

### The New Code
```cpp
#include <iostream>
#include <set>

int main() {
    std::set<int> uniqueNumbers;
    
    uniqueNumbers.insert(10);
    uniqueNumbers.insert(20);
    uniqueNumbers.insert(10); // Duplicate!
    uniqueNumbers.insert(5);
    
    std::cout << "Total unique numbers: " << uniqueNumbers.size() << "\n";
    
    for (int num : uniqueNumbers) {
        std::cout << num << "\n";
    }
    
    return 0;
}
```

### Mechanical Walkthrough
- `#include <set>`: Includes the set implementation.
- `std::set<int> uniqueNumbers;`: Declares a set that holds integers. There is no second template parameter because there are no values mapped to keys; the element itself is the key.
- `uniqueNumbers.insert(10);`: Attempts to add the integer `10` to the set.
- `uniqueNumbers.insert(10);`: On this second call, the set checks if `10` is already present. Because it is, the set silently rejects the insertion. The collection does not grow.
- `uniqueNumbers.size()`: Returns `3`, proving that the duplicate insertion was ignored.

### CS Lens
Like `std::map`, `std::set` is implemented as a binary search tree. The only difference is that the node in the tree stores just one value, not a pair. Because it is a tree, iterating through `std::set` will always return the elements in sorted order.

### SE Lens
The alternative not chosen is `std::vector` coupled with a manual `std::find` check before every push. The tradeoff here is insertion performance. Checking a vector for a duplicate takes linear time (checking every item). `std::set` does it in logarithmic time, making it vastly superior for maintaining a large collection of unique items.

### Run It Yourself
1. Save the code in `set_demo.cpp`.
2. Compile: `g++ -std=c++17 set_demo.cpp -o set_demo`.
3. Run: `./set_demo`.
4. Observe the output: 3 elements, printed sequentially as 5, 10, 20.

---

## Connect the Pieces

Observe how the type system and memory management work seamlessly across all these structures. You never wrote `new` or `delete`. When the `main()` function finishes, the `std::vector`, `std::map`, `std::unordered_map`, and `std::set` all run their destructors. They automatically free every piece of heap memory they allocated behind the scenes, completely preventing memory leaks. Furthermore, because you use template arguments like `<int>` or `<std::string>`, the C++ compiler strictly enforces type safety, guaranteeing you cannot accidentally insert a string into your integer set.

## What Breaks Without This

If you ignore the container's strict template types, the compiler will stop you immediately.

Modify the `std::vector` code to insert a string:
```cpp
std::vector<int> scores;
scores.push_back("Hello");
```

**The compiler error:**
`error: no matching function for call to 'std::vector<int>::push_back(const char [6])'`

Because you declared `std::vector<int>`, the `push_back` method is permanently locked to accept only integers. The compiler refuses to compile the program. 

## Exercises

1. **Vector Processing:** Create a `std::vector<double>` containing five prices. Write a `for` loop that calculates and prints the total sum of all the prices.
2. **Frequency Counter:** Read about `std::unordered_map`. Create an `std::unordered_map<std::string, int>`. Insert the word `"apple"` twice and `"banana"` once by writing `wordCount["apple"]++;`. Print the final map to prove it correctly counted the occurrences.
3. **Unique Sorting:** Create a `std::set<std::string>`. Insert five names, deliberately including a duplicate name in your code. Print the set to verify that it sorted the names alphabetically and removed the duplicate.

## Definition of Done

- [ ] You have compiled and run a `std::vector` and retrieved items by index.
- [ ] You have compiled and run a `std::map` and retrieved a value by its key.
- [ ] You have compiled and run a `std::unordered_map` and observed its lack of sorting.
- [ ] You have compiled and run a `std::set` and observed it filtering out duplicates.
- [ ] You can explain out loud why you would choose a vector versus a map.
