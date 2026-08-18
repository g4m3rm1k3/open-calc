# Lesson 14: std::filesystem

What you will build
In this lesson, you will build a set of robust file-management utilities. You will write code that constructs file paths safely across different operating systems, creates nested directory structures, recursively walks through folders to find specific files, and inspects file permissions. The underlying transferable problem is how to interact with the host operating system's file system safely and portably without writing platform-specific string manipulation or system calls.

What you need to know first
- C++ From Scratch series
- Lesson 13: std::fstream

Terms used in this lesson
- **File System** — the operating system's mechanism for storing, organizing, and retrieving data on a disk. It abstracts the raw hardware blocks into a hierarchy of directories and files.
- **Path** — a string-like object that identifies the location of a file or directory within the file system hierarchy. Different operating systems use different separator characters (like `/` or `\`), making raw strings dangerous for representing paths.
- **Directory Iteration** — the process of programmatically walking through the contents of a directory, often descending into subdirectories recursively, to discover or process files without knowing their names in advance.
- **File Permissions** — metadata attached to a file that dictates which users or processes are allowed to read, write, or execute the file, critical for security and access control.

Objects and methods used
- **`std::filesystem::path`**
  - *What it is:* A class representing a path on a file system.
  - *Implementation:* `class path;` inside `<filesystem>`. It internally handles the host OS's native string format and character encoding.
  - *Its use:* We use it to construct, combine, and manipulate file paths reliably, avoiding manual string concatenation and hardcoded separator characters.
- **`std::filesystem::path::preferred_separator`**
  - *What it is:* A static constant character representing the host operating system's preferred directory separator (`/` on POSIX, `\` on Windows).
  - *Implementation:* `static constexpr path::value_type preferred_separator;`
  - *Its use:* We use it when we need to explicitly refer to the separator for the current platform.
- **`std::filesystem::exists`**
  - *What it is:* A free function that checks if a path actually exists on disk.
  - *Implementation:* `bool exists(const std::filesystem::path& p);`
  - *Its use:* We use it to verify whether a file or directory is present before attempting to read from it or create it.
- **`std::filesystem::create_directories`**
  - *What it is:* A free function that creates a directory and any missing parent directories in its path.
  - *Implementation:* `bool create_directories(const std::filesystem::path& p);`
  - *Its use:* We use it to guarantee a nested directory structure exists before writing files into it, handling intermediate folder creation automatically.
- **`std::filesystem::remove_all`**
  - *What it is:* A free function that deletes a file or a directory and all of its contents recursively.
  - *Implementation:* `std::uintmax_t remove_all(const std::filesystem::path& p);`
  - *Its use:* We use it to clean up temporary directories or completely wipe out a folder hierarchy.
- **`std::filesystem::recursive_directory_iterator`**
  - *What it is:* An iterator class that traverses a directory and recursively descends into all its subdirectories.
  - *Implementation:* `class recursive_directory_iterator;` satisfying standard input iterator requirements.
  - *Its use:* We use it in range-based for loops to discover every file nested within a root directory.
- **`std::filesystem::status`**
  - *What it is:* A free function that retrieves information about a file, including its type and permissions.
  - *Implementation:* `std::filesystem::file_status status(const std::filesystem::path& p);`
  - *Its use:* We use it to fetch the metadata of a file.
- **`std::filesystem::perms`**
  - *What it is:* A bitmask type representing file permissions (read, write, execute for owner, group, others).
  - *Implementation:* `enum class perms;` with bitwise operators overloaded.
  - *Its use:* We use it to inspect or check specific permission bits against a file's status.

Everything else in the file, not this lesson's subject but still explained
- **`std::cout`**
  - *What it is:* The standard character output stream.
  - *Implementation:* An instance of `std::ostream`.
  - *Its use:* Used to display output to the terminal.
- **`std::ofstream`**
  - *What it is:* An output file stream class.
  - *Implementation:* `class ofstream;` inheriting from `ostream`.
  - *Its use:* Used to quickly write dummy content into files to test our filesystem operations.

---

## Concept Unit: Safely Constructing Paths

### The Problem
File paths look different depending on the operating system. Windows traditionally uses backslashes (`C:\app\data\file.txt`), while Linux and macOS use forward slashes (`/var/app/data/file.txt`). If you build paths by concatenating raw strings with hardcoded slashes (`dir + "/" + filename`), your code will break or behave inconsistently on different platforms. We need a way to construct paths that automatically uses the correct semantics for the operating system it compiles on.

### Introduce the concept in isolation
Here is a throwaway example showing `std::filesystem::path` and how it handles appending:

```cpp
#include <iostream>
#include <filesystem>

int main() {
    std::filesystem::path root = "app_data";
    std::filesystem::path full_path = root / "config" / "settings.ini";
    
    std::cout << "Path: " << full_path << "\n";
    std::cout << "Separator: " << (char)std::filesystem::path::preferred_separator << "\n";
    return 0;
}
```

When compiled and run on a POSIX system (like Linux or macOS):
```text
Path: "app_data/config/settings.ini"
Separator: /
```

When compiled and run on Windows:
```text
Path: "app_data\config\settings.ini"
Separator: \
```

This output proves that `std::filesystem::path` automatically inserts the correct platform-specific separator when we use the `/` operator to combine path segments. This is called a **path object**.

### Discard the throwaway example
The throwaway example above is discarded and will not appear in the project again.

### Project Change
No reference counterpart — this is a from-scratch addition because we are building our own self-contained file management utility to demonstrate the standard library.
- **Files affected**: Created `file_manager.cpp`.
- **Change type**: Add.
- **Location**: N/A (new file).
- **Dependencies**: `<filesystem>`, `<iostream>`

### The New Code — type it yourself
```cpp
#include <iostream>
#include <filesystem>

namespace fs = std::filesystem;

void display_path_info() {
    fs::path base_dir = "workspace";
    fs::path target_file = base_dir / "logs" / "latest.log";
    
    std::cout << "Target file is: " << target_file << "\n";
    std::cout << "Filename only: " << target_file.filename() << "\n";
    std::cout << "Extension: " << target_file.extension() << "\n";
}

int main() {
    display_path_info();
    return 0;
}
```

### The Updated Project
The code above is the entirety of `file_manager.cpp` so far. It sets up our namespace alias and demonstrates path decomposition.

### Mechanical walkthrough
1. `#include <filesystem>` — includes the standard library header that provides all file system operations and classes.
2. `namespace fs = std::filesystem;` — creates a namespace alias. `std::filesystem` is long to type, so it is idiomatic C++ to alias it to `fs` to keep code readable.
3. `void display_path_info() {` — declares our function.
4. `fs::path base_dir = "workspace";` — constructs an `fs::path` object from a string literal. The compiler implicitly converts the `const char*` into a path object.
5. `fs::path target_file = base_dir / "logs" / "latest.log";` — uses the overloaded `operator/` provided by `fs::path`. This operator appends "logs" to `base_dir`, inserting the correct `preferred_separator` automatically if one isn't already there, and then does the same for "latest.log". It returns a new `fs::path` object.
6. `std::cout << "Target file is: " << target_file << "\n";` — prints the path. The standard library overloads `operator<<` for `fs::path`, which automatically wraps the output in quotes on many implementations to clearly demarcate the string boundaries.
7. `target_file.filename()` — calls the `filename()` method on the path object. This parses the path and returns just the last component (the file or directory name), stripped of all parent directories.
8. `target_file.extension()` — calls the `extension()` method on the path object. This returns the suffix of the filename, starting from the last dot (inclusive), returning `".log"`.

### CS Lens
The `/` operator overloading here is an implementation of the Builder or Composite pattern for strings, specifically representing a tree traversal path. By abstracting the path as an object rather than a raw string, the type system prevents accidental mis-concatenation (like double slashes `//` or missing slashes) and allows the underlying platform to handle character encoding (UTF-8 vs UTF-16) transparently.

### SE Lens
Hardcoding file separators (like `\\` or `/`) is a classic source of technical debt when migrating code between platforms. By using `fs::path` and `operator/`, we eliminate this class of cross-platform bug entirely. The tradeoff is a slight overhead compared to raw string concatenation, but for file I/O operations, the disk access time vastly dwarfs the cost of path object construction, making the safety well worth it.

### Commands needed to make this unit real
To compile this code, you need a compiler that supports C++17, as `std::filesystem` was introduced in C++17.
```bash
g++ -std=c++17 file_manager.cpp -o file_manager
```

### Run it. Show the real output.
```text
Target file is: "workspace/logs/latest.log"
Filename only: "latest.log"
Extension: ".log"
```

### One sentence connecting this unit to what came immediately before
Now that we can safely represent where a file should go in memory, we need the ability to actually create those directories and clean them up on the physical disk.

---

## Concept Unit: Modifying the File System

### The Problem
You have a path to a file you want to write to, like `workspace/logs/latest.log`. If the `workspace/logs` directories do not already exist on disk, attempting to open a file stream (`std::ofstream`) to that path will silently fail. We need a way to check if directories exist, create them if they don't, and clean them up later.

### Introduce the concept in isolation
Here is a throwaway example showing how to create and remove directories:

```cpp
#include <iostream>
#include <filesystem>

namespace fs = std::filesystem;

int main() {
    fs::path temp_dir = "throwaway_test_dir/subdir";
    
    bool created = fs::create_directories(temp_dir);
    std::cout << "Created: " << (created ? "yes" : "no") << "\n";
    std::cout << "Exists: " << (fs::exists(temp_dir) ? "yes" : "no") << "\n";
    
    std::uintmax_t removed = fs::remove_all("throwaway_test_dir");
    std::cout << "Removed items: " << removed << "\n";
    std::cout << "Exists now: " << (fs::exists(temp_dir) ? "yes" : "no") << "\n";
    return 0;
}
```

Output:
```text
Created: yes
Exists: yes
Removed items: 2
Exists now: no
```

This output proves that `fs::create_directories` successfully built the entire nested structure at once, `fs::exists` correctly reported its presence, and `fs::remove_all` successfully deleted both the parent and the child directory in one sweep. These are our **file system modification functions**.

### Discard the throwaway example
The throwaway example above is discarded and will not appear in the project again.

### Project Change
No reference counterpart — continuing our from-scratch `file_manager.cpp`.
- **Files affected**: Modified `file_manager.cpp`.
- **Change type**: Add.
- **Location**: Below `display_path_info`, adding a new function `setup_and_teardown()` and updating `main`.
- **Dependencies**: `<fstream>` (for creating dummy files)

### The New Code — type it yourself
```cpp
#include <fstream>

void setup_and_teardown() {
    fs::path base_dir = "workspace";
    fs::path log_dir = base_dir / "logs";
    fs::path log_file = log_dir / "latest.log";

    if (!fs::exists(log_dir)) {
        fs::create_directories(log_dir);
        std::cout << "Created directory structure for logs.\n";
    }

    std::ofstream file(log_file);
    file << "Application started.\n";
    file.close();

    if (fs::exists(log_file)) {
        std::cout << "Log file was successfully created.\n";
    }

    fs::remove_all(base_dir);
    std::cout << "Cleaned up workspace.\n";
}
```

### The Updated Project
```cpp
#include <iostream>
#include <filesystem>
#include <fstream>

namespace fs = std::filesystem;

void display_path_info() {
    // ...unchanged from earlier
}

// ← new
void setup_and_teardown() {
    fs::path base_dir = "workspace";
    fs::path log_dir = base_dir / "logs";
    fs::path log_file = log_dir / "latest.log";

    if (!fs::exists(log_dir)) {
        fs::create_directories(log_dir);
        std::cout << "Created directory structure for logs.\n";
    }

    std::ofstream file(log_file);
    file << "Application started.\n";
    file.close();

    if (fs::exists(log_file)) {
        std::cout << "Log file was successfully created.\n";
    }

    fs::remove_all(base_dir);
    std::cout << "Cleaned up workspace.\n";
}

int main() {
    display_path_info();
    setup_and_teardown(); // ← new
    return 0;
}
```
The project now includes a function that reliably creates a directory tree, writes a file into it, verifies it worked, and cleans up the footprint.

### Mechanical walkthrough
1. `if (!fs::exists(log_dir))` — calls `fs::exists`, passing the `log_dir` path. This queries the operating system's file tables to see if an entry exists at that path. The logical NOT `!` means we enter the block if the directory is missing.
2. `fs::create_directories(log_dir);` — calls the free function to create the directory. Crucially, unlike the older `mkdir` system calls, `create_directories` will traverse the path and create `workspace` first, then `workspace/logs`, ensuring the whole chain exists. It returns a boolean indicating if it created anything, which we ignore here.
3. `std::ofstream file(log_file);` — opens a standard output file stream to our target file. Because we just guaranteed `log_dir` exists, this is guaranteed to succeed in creating the file (permissions notwithstanding).
4. `file << "Application started.\n";` — writes a dummy string to the file to give it content.
5. `file.close();` — flushes and closes the file stream.
6. `if (fs::exists(log_file))` — uses `fs::exists` again, this time on a file rather than a directory. `exists` works on any file system entity.
7. `fs::remove_all(base_dir);` — calls `remove_all` on the root `workspace` path. This descends into `workspace`, deletes `logs/latest.log`, then deletes the `logs` folder, and finally deletes `workspace`. It returns the number of entities deleted.

### CS Lens
The `create_directories` and `remove_all` functions represent recursive operations over a tree data structure (the file system hierarchy). Because the file system is managed by the OS kernel, these functions act as wrappers around a sequence of system calls (like `mkdir` and `rmdir` on POSIX), abstracting away the low-level tree traversal and error-handling loops required to build or dismantle a deep directory structure.

### SE Lens
Checking for existence before creation (`!fs::exists`) is defensive programming. However, file systems are highly concurrent: another process could delete or create the directory in the microsecond between `fs::exists` and `fs::create_directories` (a Time-Of-Check to Time-Of-Use, or TOCTOU, race condition). For strict security or mission-critical software, you often just attempt the operation and handle the resulting error code rather than checking first. For typical application logic, checking first produces cleaner logs and is standard practice.

### Commands needed to make this unit real
```bash
g++ -std=c++17 file_manager.cpp -o file_manager
```

### Run it. Show the real output.
```text
Target file is: "workspace/logs/latest.log"
Filename only: "latest.log"
Extension: ".log"
Created directory structure for logs.
Log file was successfully created.
Cleaned up workspace.
```

### One sentence connecting this unit to what came immediately before
We can now create and delete precise structures on disk, but in the real world, we often need to inspect directories whose contents we *don't* know in advance.

---

## Concept Unit: Directory Iteration

### The Problem
If you need to find all `.log` files in a folder, or calculate the total size of a directory, you cannot hardcode the filenames because you don't know them. You need a way to programmatically ask the operating system for a list of everything inside a directory, including files hidden inside subdirectories.

### Introduce the concept in isolation
Here is a throwaway example showing `recursive_directory_iterator`:

```cpp
#include <iostream>
#include <filesystem>
#include <fstream>

namespace fs = std::filesystem;

int main() {
    fs::create_directories("throwaway_iter/a/b");
    std::ofstream("throwaway_iter/file1.txt");
    std::ofstream("throwaway_iter/a/b/file2.txt");

    for (const auto& entry : fs::recursive_directory_iterator("throwaway_iter")) {
        std::cout << entry.path() << "\n";
    }

    fs::remove_all("throwaway_iter");
    return 0;
}
```

Output:
```text
"throwaway_iter/file1.txt"
"throwaway_iter/a"
"throwaway_iter/a/b"
"throwaway_iter/a/b/file2.txt"
```

This output proves that the iterator visited the file at the root, the subdirectory `a`, descended into it to find `b`, and descended further to find `file2.txt`. It automatically walks the entire tree. This is called a **recursive directory iterator**.

### Discard the throwaway example
The throwaway example above is discarded and will not appear in the project again.

### Project Change
No reference counterpart — continuing our from-scratch `file_manager.cpp`.
- **Files affected**: Modified `file_manager.cpp`.
- **Change type**: Add.
- **Location**: Below `setup_and_teardown`, adding a new function `scan_directory()`, and temporarily modifying `setup_and_teardown` to *not* delete the workspace so we have something to scan.
- **Dependencies**: None.

### The New Code — type it yourself
```cpp
void scan_directory() {
    fs::path base_dir = "workspace";
    
    std::cout << "Scanning directory: " << base_dir << "\n";
    for (const auto& entry : fs::recursive_directory_iterator(base_dir)) {
        if (entry.is_regular_file()) {
            std::cout << "File found: " << entry.path().filename() << "\n";
        } else if (entry.is_directory()) {
            std::cout << "Directory found: " << entry.path().filename() << "\n";
        }
    }
}
```

### The Updated Project
```cpp
// ...includes unchanged

void setup_and_teardown() {
    fs::path base_dir = "workspace";
    fs::path log_dir = base_dir / "logs";
    fs::path log_file = log_dir / "latest.log";

    fs::create_directories(log_dir);
    std::ofstream file(log_file);
    file << "Application started.\n";
    file.close();

    // TEMPORARILY REMOVED fs::remove_all(base_dir); so we can scan it
}

// ← new
void scan_directory() {
    fs::path base_dir = "workspace";
    
    std::cout << "Scanning directory: " << base_dir << "\n";
    for (const auto& entry : fs::recursive_directory_iterator(base_dir)) {
        if (entry.is_regular_file()) {
            std::cout << "File found: " << entry.path().filename() << "\n";
        } else if (entry.is_directory()) {
            std::cout << "Directory found: " << entry.path().filename() << "\n";
        }
    }
}

int main() {
    setup_and_teardown();
    scan_directory(); // ← new
    fs::remove_all("workspace"); // Clean up at the very end
    return 0;
}
```
We temporarily moved the cleanup to the end of `main` so `scan_directory` has a real nested folder to explore.

### Mechanical walkthrough
1. `for (const auto& entry : fs::recursive_directory_iterator(base_dir))` — instantiates an anonymous `recursive_directory_iterator` object pointing at `base_dir`. The range-based for loop utilizes the iterator's `begin()` and `end()` semantics to step through every entry.
2. `const auto& entry` — declares a const reference to the loop variable. The type deduced here is `std::filesystem::directory_entry`, which acts as a cache holding both the path and pre-fetched metadata (like file type) about the entity it points to.
3. `entry.is_regular_file()` — calls a method on the `directory_entry` object. It returns `true` if the entry is a standard file (not a directory, not a symlink, not a socket).
4. `entry.path().filename()` — calls `.path()` on the entry to retrieve the underlying `fs::path` object, then chains `.filename()` to extract just the name.
5. `entry.is_directory()` — calls a method on the `directory_entry` object. It returns `true` if the entry represents a folder.

### CS Lens
A file system is a Tree graph where directories are internal nodes and files are leaf nodes. `recursive_directory_iterator` implements Depth-First Search (DFS) traversal over this tree. Standard library iterators abstract away the complex stack-management usually required to implement DFS manually, letting you treat a hierarchical tree traversal exactly like you are looping over a flat array.
Also recognized in: parsing Abstract Syntax Trees (ASTs), DOM node traversal in web browsers, and garbage collection reachability tracing.

### SE Lens
Iterating over a file system is inherently unpredictable. A folder might contain a million files, or the user might lack permission to read a subdirectory, which would cause the iterator to throw an exception by default when it tries to enter it. Robust software must account for this by passing a `std::error_code` argument to the iterator constructor, or explicitly catching `fs::filesystem_error`, to prevent a permissions error deep in a subdirectory from crashing the entire program.

### Commands needed to make this unit real
```bash
g++ -std=c++17 file_manager.cpp -o file_manager
```

### Run it. Show the real output.
```text
Scanning directory: "workspace"
Directory found: "logs"
File found: "latest.log"
```

### One sentence connecting this unit to what came immediately before
Now that we can find files dynamically, we need to inspect their metadata to understand if we are actually allowed to interact with them.

---

## Concept Unit: File Status and Permissions

### The Problem
Just because a file exists doesn't mean your program is allowed to write to it. Operating systems enforce permissions. If a file is marked read-only by an administrator, attempting to open it for writing will fail. We need to be able to query the OS for a file's permission mask before attempting operations that might be rejected.

### Introduce the concept in isolation
Here is a throwaway example showing file status and permissions:

```cpp
#include <iostream>
#include <filesystem>
#include <fstream>

namespace fs = std::filesystem;

int main() {
    fs::path temp = "throwaway_perms.txt";
    std::ofstream(temp) << "test";
    
    fs::file_status stat = fs::status(temp);
    fs::perms p = stat.permissions();
    
    bool can_write = (p & fs::perms::owner_write) != fs::perms::none;
    std::cout << "Owner can write: " << (can_write ? "yes" : "no") << "\n";
    
    fs::remove(temp);
    return 0;
}
```

Output:
```text
Owner can write: yes
```

This output proves that we can retrieve the metadata object for a file and use bitwise operators to isolate and check specific permission bits. This is called **file permission inspection**.

### Discard the throwaway example
The throwaway example above is discarded and will not appear in the project again.

### Project Change
No reference counterpart — finishing our `file_manager.cpp`.
- **Files affected**: Modified `file_manager.cpp`.
- **Change type**: Add.
- **Location**: Below `scan_directory`, adding `check_permissions()`, and updating `main`.
- **Dependencies**: None.

### The New Code — type it yourself
```cpp
void check_permissions() {
    fs::path log_file = "workspace/logs/latest.log";
    
    if (!fs::exists(log_file)) return;

    fs::file_status status = fs::status(log_file);
    fs::perms permissions = status.permissions();

    std::cout << "Checking permissions for " << log_file.filename() << ":\n";

    if ((permissions & fs::perms::owner_read) != fs::perms::none) {
        std::cout << "- Owner can read\n";
    }
    if ((permissions & fs::perms::owner_write) != fs::perms::none) {
        std::cout << "- Owner can write\n";
    }
}
```

### The Updated Project
```cpp
// ...includes unchanged

void setup_and_teardown() { /* unchanged */ }
void scan_directory() { /* unchanged */ }

// ← new
void check_permissions() {
    fs::path log_file = "workspace/logs/latest.log";
    
    if (!fs::exists(log_file)) return;

    fs::file_status status = fs::status(log_file);
    fs::perms permissions = status.permissions();

    std::cout << "Checking permissions for " << log_file.filename() << ":\n";

    if ((permissions & fs::perms::owner_read) != fs::perms::none) {
        std::cout << "- Owner can read\n";
    }
    if ((permissions & fs::perms::owner_write) != fs::perms::none) {
        std::cout << "- Owner can write\n";
    }
}

int main() {
    setup_and_teardown();
    scan_directory();
    check_permissions(); // ← new
    fs::remove_all("workspace");
    return 0;
}
```
The program now creates a file hierarchy, scans it, inspects the precise permissions of the resulting log file, and then safely cleans up.

### Mechanical walkthrough
1. `fs::file_status status = fs::status(log_file);` — calls `fs::status()`, which performs a system call (like `stat` on POSIX) to fetch the metadata for `log_file`. It returns an `fs::file_status` object containing the file type and permissions.
2. `fs::perms permissions = status.permissions();` — calls `.permissions()` on the status object to extract the permission mask. `fs::perms` is a strongly-typed `enum class` designed for bitwise operations.
3. `(permissions & fs::perms::owner_read)` — uses the bitwise AND operator `&`. Because permissions are stored as a bitmask (where each bit represents a specific right, like read, write, or execute), bitwise AND isolates exactly the `owner_read` bit. If the bit is set to `1` in `permissions`, the result is non-zero.
4. `!= fs::perms::none` — compares the result of the bitwise AND against `fs::perms::none` (which is 0). If the isolated bit wasn't zero, it means the owner has read permission.

### CS Lens
Permission bitmasks are a classic application of bitwise packing in systems programming. An entire suite of boolean flags (owner read/write/execute, group read/write/execute, other read/write/execute) is packed into a single 16-bit or 32-bit integer. This minimizes memory overhead and allows checking multiple permissions simultaneously in a single CPU instruction using bitwise math.
Also recognized in: network packet headers (TCP flags like SYN/ACK), graphics processing (color channel masking), and CPU status registers.

### SE Lens
While querying permissions is useful for logging and UI feedback (e.g., greying out a "Save" button), it suffers from the same Time-Of-Check to Time-Of-Use (TOCTOU) race condition as `exists()`. The permissions could change instantly after you check them. The only truly safe way to know if you can write to a file is to attempt the write operation and properly catch and handle the exception or error code it returns if it fails.

### Commands needed to make this unit real
```bash
g++ -std=c++17 file_manager.cpp -o file_manager
```

### Run it. Show the real output.
```text
Scanning directory: "workspace"
Directory found: "logs"
File found: "latest.log"
Checking permissions for "latest.log":
- Owner can read
- Owner can write
```

### One sentence connecting this unit to what came immediately before
By combining path manipulation, creation, iteration, and inspection, you now have a complete, platform-independent toolkit for managing the external environment your software runs in.

---

## Closing

Connect the pieces
In this lesson, we traced a single conceptual path: `"workspace/logs/latest.log"`. We started by safely constructing that path string into an object so we wouldn't break on Windows or POSIX. Then, we instructed the OS to physically build that directory chain on the hard drive using `create_directories`. Next, we simulated not knowing the path, using `recursive_directory_iterator` to traverse the tree structure from the root until we dynamically re-discovered the file. Finally, we pulled the file's metadata from the OS to inspect its bitmask permissions, confirming we had read and write access, before wiping the whole tree out.

What breaks without this
Without `std::filesystem`, interacting with directories requires `#ifdef _WIN32` preprocessor blocks to call Windows API functions like `CreateDirectoryA` or `FindFirstFile`, and `#else` blocks to call POSIX functions like `mkdir` or `opendir`. If you forget to include a platform, or concatenate a backslash manually on a Linux build, your program will crash or write to garbage locations.

Exercises
1. Modify `scan_directory` to keep a running total of the file sizes it finds. You will need to look up `fs::file_size()`.
2. Change the setup function to write out three different `.log` files in different nested folders, and modify `scan_directory` to only print the path if `entry.path().extension() == ".log"`.
3. Experiment with `fs::copy_file()` to copy `latest.log` to `backup.log` before the cleanup phase happens.

Definition of done
- You can construct paths using `operator/` safely.
- You can create and delete nested directories.
- You can iterate through a directory recursively.
- You can check basic file permissions using bitwise operations.
- Code is committed: `git commit -m "Add robust filesystem management patterns for cross-platform I/O"`
