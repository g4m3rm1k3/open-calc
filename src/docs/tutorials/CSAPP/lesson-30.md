# Lesson 30: Processes and Programs — exec, Environment, and /proc

What you will build: The reader will understand how `exec()` loads a new program, how environment variables are passed and read, how `/proc` exposes kernel data as files, and how a shell implements its core loop. The transferable insight: the `exec()` + environment mechanism is how every Unix program receives its configuration context — PATH, HOME, LD_LIBRARY_PATH, and every other env var flow through this exact channel.

What you need to know first: Lessons 00-29.

Terms used in this lesson:
- **Environment variable** — A dynamic-named string value passed to a process at execution, existing to provide runtime configuration without coupling or hardcoding paths.
- **Process Address Space** — The exact, isolated virtual memory layout a single process possesses, existing to prevent independent programs from corrupting each other's memory.
- **Virtual file system** — A filesystem that does not exist on disk but is generated dynamically by the kernel upon read, existing to expose internal kernel structures through the standard file I/O interface.
- **Null-terminated array** — An array of pointers where the iteration boundary is marked by a trailing `NULL` rather than a separate length integer, existing to allow unbounded arrays to be passed across system boundaries efficiently.

Objects and methods used:

**`execve`**
- *What it is:* A system call that replaces the current process image with a new process image.
- *Implementation:* `int execve(const char *pathname, char *const argv[], char *const envp[]);`
- *Its use:* To launch an executable file and replace the currently running process with it.
- *Type:* Standard library system call wrapper (function).
- *Responsibility:* To map the ELF segments of the new program into memory, set up the initial stack, and jump to its entry point.
- *Depends on:* A valid executable path, an array of argument strings, and an array of environment variable strings.
- *Connects to:* Called by user code, handled by the kernel, transferring control flow irrevocably to the target executable.
- *Shape:* The absolute boundary between one program terminating its own execution logic and adopting the logic of a completely different binary.

**`getenv`**
- *What it is:* A standard library function to retrieve the value of an environment variable.
- *Implementation:* `char *getenv(const char *name);`
- *Its use:* To safely extract configuration like `PATH` or `HOME` at runtime.
- *Type:* Standard library function.
- *Responsibility:* To linearly scan the global `environ` array for a string starting with `name=`, returning a pointer to the value portion.
- *Depends on:* The globally maintained `environ` array.
- *Connects to:* Called by application logic, returns a reference to internal environment storage.
- *Shape:* A query abstraction over the raw string-array environment context.

**`setenv`**
- *What it is:* A standard library function to add or change an environment variable.
- *Implementation:* `int setenv(const char *name, const char *value, int overwrite);`
- *Its use:* To prepare the environment array before spawning child processes or passing context along.
- *Type:* Standard library function.
- *Responsibility:* To modify or reallocate the `environ` array to include the new `name=value` pair.
- *Depends on:* Dynamically allocated memory if the `environ` array needs to grow.
- *Connects to:* Called by application logic, mutates the global `environ` pointer.
- *Shape:* A mutation operation on the application's global configuration state.

**`unsetenv`**
- *What it is:* A standard library function to remove an environment variable.
- *Implementation:* `int unsetenv(const char *name);`
- *Its use:* To sanitize the environment before executing untrusted binaries.
- *Type:* Standard library function.
- *Responsibility:* To scan the `environ` array and remove the specified key by shifting subsequent pointers down.
- *Depends on:* The global `environ` array.
- *Connects to:* Mutates internal environment storage.
- *Shape:* A mutation/sanitization step over global state.

**`atexit`**
- *What it is:* A function to register a callback to execute upon normal program termination.
- *Implementation:* `int atexit(void (*function)(void));`
- *Its use:* To ensure cleanup tasks run regardless of where `exit()` is called.
- *Type:* Standard library function.
- *Responsibility:* To push a function pointer onto a stack of routines that the C runtime invokes during `exit()`.
- *Depends on:* A valid function pointer returning `void` and taking no arguments.
- *Connects to:* Registered by application code, invoked internally by `__libc_start_main` or `exit`.
- *Shape:* A lifecycle hook in the C runtime environment.

**`fork`**
- *What it is:* A system call that creates a new process by duplicating the calling process.
- *Implementation:* `pid_t fork(void);`
- *Its use:* To spawn a child process that will eventually call `execve`.
- *Type:* System call wrapper.
- *Responsibility:* To create an exact copy of the parent's memory layout and file descriptors for the child.
- *Depends on:* OS process table capacity.
- *Connects to:* Parent process (receives child PID), child process (receives 0).
- *Shape:* The structural fork point for concurrency in Unix.

**`waitpid`**
- *What it is:* A system call to wait for process state changes.
- *Implementation:* `pid_t waitpid(pid_t pid, int *wstatus, int options);`
- *Its use:* To block the shell parent until the child process finishes.
- *Type:* System call wrapper.
- *Responsibility:* To pause the calling process until the specified child process terminates, and to collect its exit status to prevent zombie processes.
- *Depends on:* A valid child `pid` and a memory location to write the status.
- *Connects to:* The kernel's process scheduler.
- *Shape:* A synchronization boundary between asynchronous concurrent processes.


## Concept Unit: How exec() loads a new program

### The Problem
How do we actually run a different program from within C? Socratic questions: What happens to the current program's memory when we run a new one? If a function that launches a program never returns, how do we handle its success versus its failure? What would you guess the OS needs to fully context-switch into a new binary?

### Introduce the concept in isolation
Here is a minimal demonstration of throwing away the current program to run `/bin/ls`.

```c
#include <unistd.h>
int main() {
    char *args[] = {"ls", NULL};
    execve("/bin/ls", args, NULL);
    return 1;
}
```
Predicted confidently: The current process will list the directory contents and terminate. The `return 1` is never executed. This proves that **execve** replaces the entire process image; control flow does not return to the caller on success.

### Discard the throwaway
The code above is explicitly discarded and will not be used in our project.

### Project Change
- Reference Source: standalone theory — no running project.
- Files affected: `program_loader.c` (created).
- Change type: add.
- Location: entire file.
- Dependencies: Standard C library.

### The New Code
```c
execve("/bin/echo", argv, envp);
perror("execve failed");
```

### The Updated Project
Here is the full file showing how `execve` is utilized with arguments and environment variables.

```c
1: #include <unistd.h>
2: #include <stdio.h>
3: 
4: int main(void) {
5:     printf("before exec\n");
6:     char *argv[] = { "/bin/echo", "hello", "from", "exec", NULL }; // <- new
7:     char *envp[] = { "HOME=/tmp", "PATH=/bin", NULL }; // <- new
8:     execve("/bin/echo", argv, envp); // <- new
9:     perror("execve failed"); // <- new
10:    return 1; // <- new
11: }
```
The `main` function sets up arrays for arguments and the environment, then hands control to `/bin/echo`.

### Mechanical walkthrough
- `execve`: the system call function replacing the process image.
- `(`: begins the function arguments.
- `"/bin/echo"`: a string literal indicating the exact absolute path to the binary to load.
- `,`: separates arguments.
- `argv`: the null-terminated array of strings forming the command line arguments.
- `,`: separates arguments.
- `envp`: the null-terminated array of strings forming the environment context.
- `)`: closes the function arguments.
- `;`: terminates the statement.
- `perror`: a standard library function that prints a descriptive error message to standard error.
- `(`: begins the function arguments.
- `"execve failed"`: a string literal prefix for the error message.
- `)`: closes the function arguments.
- `;`: terminates the statement.

### CS lens
The fundamental CS concept here is **Process Overlay** or **Image Replacement**. This is how operating systems decouple process creation (allocating a PID) from program execution (loading code). Real-world places this concept appears: container runtimes launching entrypoints, JVMs invoking the bootstrap classloader, and bootloaders transitioning to kernel code.

### SE lens
The design principle is **"No Return on Success."** The alternative not chosen was to have `exec()` return a handle to the newly running process while the parent keeps going. The real tradeoff is that Unix separates concurrency (`fork`) from execution (`exec`), yielding an extremely simple interface for `exec` (no complex multithreading state inside a single call) at the cost of making developers orchestrate two system calls to run a background job.

### Commands needed
`gcc program_loader.c -o program_loader && ./program_loader`

### Run it
```text
before exec
hello from exec
```

### One sentence connecting to previous unit
With the process image completely replaced by `execve`, the new program needs a way to discover its runtime configuration, which leads us to environment variables.


## Concept Unit: Environment variables — getenv, setenv, environ

### The Problem
How does `/bin/echo` or any other program actually read the `envp` array that was passed into `execve`? Socratic questions: If the kernel pushes the environment onto the stack, how does standard library code access it globally? What would you try if you wanted to change an environment variable dynamically before calling a new program?

### Introduce the concept in isolation
Here is a minimal demonstration of reading the environment context.

```c
#include <stdlib.h>
#include <stdio.h>
int main() {
    printf("User is: %s\n", getenv("USER"));
    return 0;
}
```
Predicted confidently: Will print "User is: root" (or whichever user executes the binary). This proves that the **environment variable** abstraction (`getenv`) successfully pulls arbitrary string data injected by the OS without needing explicit function parameters.

### Discard the throwaway
The code above is explicitly discarded and will not be used in our project.

### Project Change
- Reference Source: standalone theory.
- Files affected: `env_explorer.c` (created).
- Change type: add.
- Location: entire file.
- Dependencies: Standard C library.

### The New Code
```c
char *path = getenv("PATH");
setenv("MY_VAR", "hello", 1);
```

### The Updated Project
Here is the full file showing how variables are accessed, modified, and iterated.

```c
1: #include <stdlib.h>
2: #include <stdio.h>
3: 
4: extern char **environ; // <- new
5: 
6: int main(int argc, char *argv[], char *envp[]) {
7:     char *home = getenv("HOME"); // <- new
8:     char *path = getenv("PATH"); // <- new
9:     printf("HOME=%s\n", home ? home : "(not set)");
10:    printf("PATH=%.40s...\n", path ? path : "(not set)");
11:
12:    printf("\nAll environment variables:\n");
13:    for (char **e = environ; *e != NULL; e++) { // <- new
14:        printf("  %s\n", *e);
15:    }
16:
17:    setenv("MY_VAR", "hello", 1); // <- new
18:    printf("MY_VAR=%s\n", getenv("MY_VAR")); // <- new
19:
20:    unsetenv("MY_VAR"); // <- new
21:    printf("MY_VAR after unset=%s\n", getenv("MY_VAR") ? getenv("MY_VAR") : "(null)");
22:    return 0;
23: }
```
This program demonstrates accessing environment variables using `getenv`, mutating the list using `setenv`, and bypassing the helpers to walk the raw `environ` array directly.

### Mechanical walkthrough
- `char`: the data type for a character.
- `*`: denotes a pointer.
- `path`: the variable identifier storing the return value.
- `=`: the assignment operator.
- `getenv`: the standard library function to retrieve an environment variable.
- `(`: begins the function arguments.
- `"PATH"`: a string literal indicating the key to search for.
- `)`: closes the function arguments.
- `;`: terminates the statement.
- `setenv`: the standard library function to create or overwrite a variable.
- `(`: begins the function arguments.
- `"MY_VAR"`: a string literal representing the key.
- `,`: separates arguments.
- `"hello"`: a string literal representing the value.
- `,`: separates arguments.
- `1`: integer literal indicating that we want to overwrite the key if it already exists.
- `)`: closes the function arguments.
- `;`: terminates the statement.

### CS lens
The fundamental CS concept is **Out-of-band Context**. Real-world places this concept appears: HTTP Headers in web requests, thread-local storage in concurrent applications, and hidden auxiliary vectors passed by bootloaders.

### SE lens
The design principle is **Global Configuration State**. The alternative not chosen is requiring every function from `main` down to receive a configuration struct passed explicitly as a parameter. The real tradeoff is extreme decoupling (a deeply nested function can read `HOME` directly) at the cost of hidden dependencies and mutable global state that can cause cross-contamination during testing.

### Commands needed
`gcc env_explorer.c -o env_explorer && ./env_explorer`

### Run it
```text
HOME=/tmp
PATH=/bin...

All environment variables:
  HOME=/tmp
  PATH=/bin
MY_VAR=hello
MY_VAR after unset=(null)
```

### One sentence connecting to previous unit
Once the kernel maps the environment and arguments, it doesn't just jump to `main`, but rather to a lower-level routine that orchestrates the program's lifecycle.


## Concept Unit: The startup sequence — _start, __libc_start_main, main()

### The Problem
If the OS passes arguments and environment variables to a new program, who actually calls `main(argc, argv, envp)`? Socratic questions: Have you ever wondered why `main` can just return 0 to exit gracefully? If `printf` buffers data, who flushes that data if `main` returns without explicitly calling `fflush`?

### Introduce the concept in isolation
Here is a minimal demonstration of registering cleanup hooks before `main` exits.

```c
#include <stdlib.h>
#include <stdio.h>
void my_hook() { printf("Hook fired\n"); }
int main() {
    atexit(my_hook);
    return 0;
}
```
Predicted confidently: Will print "Hook fired" even though `my_hook` is never explicitly called by `main`. This proves that **`atexit`** and the C runtime startup sequence wrap `main` in a lifecycle harness that intercepts program termination.

### Discard the throwaway
The code above is explicitly discarded and will not be used in our project.

### Project Change
- Reference Source: standalone theory.
- Files affected: `lifecycle.c` (created).
- Change type: add.
- Location: entire file.
- Dependencies: Standard C library.

### The New Code
```c
atexit(cleanup);
return 0;
```

### The Updated Project
Here is the full file showing the C runtime lifecycle hooks.

```c
1: #include <stdlib.h>
2: #include <stdio.h>
3: 
4: void cleanup(void) {
5:     printf("atexit: cleanup running\n");
6: }
7: 
8: int main(void) {
9:     atexit(cleanup); // <- new
10:    printf("main: running\n");
11:    return 0; // <- new
12: }
```
When `main` returns 0, the runtime wrapper (`__libc_start_main`) catches that return value, calls `exit(0)`, flushes stdio, and runs the registered `cleanup` function before the actual `_exit` system call.

### Mechanical walkthrough
- `atexit`: standard library function that registers a function to be called at termination.
- `(`: begins the function arguments.
- `cleanup`: the identifier of the function pointer to register.
- `)`: closes the function arguments.
- `;`: terminates the statement.
- `return`: keyword that exits the current function.
- `0`: integer literal indicating successful execution.
- `;`: terminates the statement.

### CS lens
The fundamental CS concept is **Runtime Harness** or **Execution Environment**. Real-world places this concept appears: React's root render loop, the Python VM's interpreter initialization, and Unity's game loop architecture.

### SE lens
The design principle is **Inversion of Control (IoC)**. The alternative not chosen is making `main` literally the first instruction the CPU executes, requiring the developer to manually write assembly to initialize the stack, parse command-line strings, and explicitly call the exit syscall. The real tradeoff is hiding massive complexity to provide a clean high-level abstraction at the cost of obscuring the true execution flow when debugging native crashes.

### Commands needed
`gcc lifecycle.c -o lifecycle && ./lifecycle`

### Run it
```text
main: running
atexit: cleanup running
```

### One sentence connecting to previous unit
The kernel handles the complexities of process setup behind the scenes, but it also exposes internal process data as simple readable files using a special filesystem called `/proc`.


## Concept Unit: /proc — the kernel's file-system interface

### The Problem
How can a user-space tool like `ps` or `top` possibly know how much memory a process uses or what its command line was? Socratic questions: If the kernel keeps process data secure in kernel space, how do we inspect it? What if instead of adding hundreds of new system calls, we reused the oldest abstraction in Unix?

### Introduce the concept in isolation
Here is a minimal demonstration of reading the kernel's view of the current process's command line.

```c
#include <stdio.h>
#include <unistd.h>
int main() {
    char buf[128];
    sprintf(buf, "cat /proc/%d/cmdline", getpid());
    system(buf);
    return 0;
}
```
Predicted confidently: Will print the executable's invocation path. This proves that **`/proc`** creates dynamic text files containing live kernel structs accessible via normal file commands.

### Discard the throwaway
The code above is explicitly discarded and will not be used in our project.

### Project Change
- Reference Source: standalone theory.
- Files affected: `proc_reader.c` (created).
- Change type: add.
- Location: entire file.
- Dependencies: Standard C library.

### The New Code
```c
pid_t pid = getpid();
snprintf(path, sizeof(path), "/proc/%d/cmdline", pid);
```

### The Updated Project
Here is the full file showing how to introspect our own process memory maps and arguments using `/proc`.

```c
1:  #include <stdio.h>
2:  #include <unistd.h>
3:  
4:  int main(void) {
5:      pid_t pid = getpid(); // <- new
6:      char path[64];
7:  
8:      snprintf(path, sizeof(path), "/proc/%d/cmdline", pid); // <- new
9:      FILE *f = fopen(path, "r");
10:     char buf[256];
11:     size_t n = fread(buf, 1, sizeof(buf)-1, f);
12:     buf[n] = '\0';
13:     printf("cmdline: %s\n", buf);
14:     fclose(f);
15: 
16:     snprintf(path, sizeof(path), "/proc/%d/maps", pid); // <- new
17:     f = fopen(path, "r");
18:     char line[256];
19:     int count = 0;
20:     while (fgets(line, sizeof(line), f) && count < 3) {
21:         printf("%s", line);
22:         count++;
23:     }
24:     fclose(f);
25:     return 0;
26: }
```
By simply opening files dynamically mapped to `getpid()`, we query kernel memory structures.

### Mechanical walkthrough
- `pid_t`: the system data type for a process ID.
- `pid`: the variable identifier.
- `=`: assignment operator.
- `getpid`: standard library function to retrieve the caller's process ID.
- `(`: begins the function arguments.
- `)`: closes the function arguments.
- `;`: terminates the statement.
- `snprintf`: a standard library function to format strings safely into a buffer.
- `(`: begins the function arguments.
- `path`: the destination buffer variable.
- `,`: separates arguments.
- `sizeof`: compile-time operator to get the byte size of a type or variable.
- `(`: bounds the sizeof operator argument.
- `path`: the variable being measured.
- `)`: closes the sizeof argument.
- `,`: separates arguments.
- `"/proc/%d/cmdline"`: the format string containing a `%d` placeholder for the PID.
- `,`: separates arguments.
- `pid`: the process ID value injected into the format string.
- `)`: closes the function arguments.
- `;`: terminates the statement.

### CS lens
The fundamental CS concept is **Virtual Interfaces** or **Everything is a File**. Real-world places this concept appears: Unix sockets mapped to the filesystem, the Windows Registry (hierarchical keys acting like a filesystem), and HTTP REST APIs exposing database rows as URL endpoints.

### SE lens
The design principle is **Uniform Interface**. The alternative not chosen is providing hundreds of complex ioctl calls or specialized structs for `get_process_memory()`, `get_process_cmdline()`, etc. The real tradeoff is performance overhead from serializing kernel data into text and back out into structs, in exchange for immense scriptability where `cat` and `grep` instantly become system monitoring tools.

### Commands needed
`gcc proc_reader.c -o proc_reader && ./proc_reader`

### Run it
Predicted confidently:
```text
cmdline: ./proc_reader
7f0012340000-7f0012360000 r--p 00000000 08:01 1234  /lib/x86_64.../libc.so.6
7f0012360000-7f00124d0000 r-xp 00020000 08:01 1234  /lib/x86_64.../libc.so.6
7f00124d0000-7f0012519000 r--p 00190000 08:01 1234  /lib/x86_64.../libc.so.6
```
We state this confidently because standard compilation dynamically links libc, causing its memory mappings to reliably occupy the first few virtual memory areas (VMAs).

### One sentence connecting to previous unit
Understanding how execution, arguments, and process inspection work provides the literal building blocks needed to construct a tool that orchestrates all of this: a shell.


## Concept Unit: A minimal shell — fork + exec + wait loop

### The Problem
How does a terminal prompt like bash actually execute commands continuously? Socratic questions: If `execve` replaces the process, what happens if bash just calls `execve` directly on the first command? How can a parent process survive while launching hundreds of child programs over time?

### Introduce the concept in isolation
Here is a minimal demonstration of protecting the parent while launching a child.

```c
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>
int main() {
    if (fork() == 0) {
        execlp("ls", "ls", NULL);
    } else {
        wait(NULL);
        printf("Child finished.\n");
    }
    return 0;
}
```
Predicted confidently: It will run `ls`, output the directory contents, and then the parent will print "Child finished." This proves that a **fork + exec + wait** loop safely delegates execution to a duplicate child process, preserving the parent's memory and control flow.

### Discard the throwaway
The code above is explicitly discarded and will not be used in our project.

### Project Change
- Reference Source: standalone theory.
- Files affected: `mysh.c` (created).
- Change type: add.
- Location: entire file.
- Dependencies: Standard C library, POSIX standard headers.

### The New Code
```c
pid_t pid = fork();
if (pid == 0) {
    execvp(argv[0], argv);
}
waitpid(pid, &status, 0);
```

### The Updated Project
Here is the full file showing the foundational loop of every Unix shell.

```c
1:  #include <stdio.h>
2:  #include <stdlib.h>
3:  #include <string.h>
4:  #include <unistd.h>
5:  #include <sys/wait.h>
6:  
7:  #define MAXARGS 64
8:  
9:  void parse(char *line, char **argv) {
10:     int i = 0;
11:     argv[i] = strtok(line, " \t\n");
12:     while (argv[i] && i < MAXARGS - 1)
13:         argv[++i] = strtok(NULL, " \t\n");
14:     argv[i] = NULL;
15: }
16: 
17: int main(void) {
18:     char line[1024];
19:     char *argv[MAXARGS];
20: 
21:     while (1) {
22:         printf("mysh> ");
23:         fflush(stdout);
24:         if (!fgets(line, sizeof(line), stdin))
25:             break;
26: 
27:         parse(line, argv);
28:         if (!argv[0]) continue;
29: 
30:         pid_t pid = fork(); // <- new
31:         if (pid == 0) { // <- new
32:             execvp(argv[0], argv); // <- new
33:             perror(argv[0]); // <- new
34:             exit(127); // <- new
35:         } // <- new
36:         
37:         int status;
38:         waitpid(pid, &status, 0); // <- new
39:         if (WIFEXITED(status)) // <- new
40:             printf("[exited %d]\n", WEXITSTATUS(status)); // <- new
41:     }
42:     return 0;
43: }
```
This loop reads a line from standard input, tokenizes it into an `argv` array, forks a child process to run `execvp`, and relies on `waitpid` to pause the parent until the child terminates.

### Mechanical walkthrough
- `pid_t`: process ID data type.
- `pid`: variable holding the result.
- `=`: assignment operator.
- `fork`: system call duplicating the process.
- `(`: begins arguments.
- `)`: closes arguments.
- `;`: terminates statement.
- `if`: conditional keyword.
- `(`: begins condition.
- `pid`: variable being checked.
- `==`: equality operator.
- `0`: integer indicating we are currently inside the child process.
- `)`: closes condition.
- `{`: opens block.
- `execvp`: system call replacing the process, taking a filename and argument array, and automatically searching `PATH`.
- `(`: begins arguments.
- `argv`: the argument array.
- `[`: array subscript operator.
- `0`: first index.
- `]`: closes subscript.
- `,`: separates arguments.
- `argv`: the full array passed as `envp`.
- `)`: closes arguments.
- `;`: terminates statement.
- `waitpid`: system call to block parent until child terminates.
- `(`: begins arguments.
- `pid`: the ID of the specific child to wait for.
- `,`: separates arguments.
- `&`: address-of operator.
- `status`: integer variable to receive exit information.
- `,`: separates arguments.
- `0`: options integer.
- `)`: closes arguments.
- `;`: terminates statement.

### CS lens
The fundamental CS concept is the **Event Loop** or **REPL (Read-Eval-Print Loop)**. Real-world places this concept appears: language interactive prompts (like `python` or `node`), GUI application run loops listening for clicks, and game engine logic loops.

### SE lens
The design principle is **Delegated Execution**. The alternative not chosen is compiling every command (like `echo` or `ls`) statically into the shell itself (which MS-DOS command.com partly did). The real tradeoff is a massive modularity win (the shell can run programs invented ten years after the shell was compiled) at the cost of high process-creation overhead for tiny tasks.

### Commands needed
`gcc mysh.c -o mysh && ./mysh`

### Run it
```text
mysh> echo hello world
hello world
[exited 0]
mysh> ls /tmp
test.txt  demo.txt
[exited 0]
```

### One sentence connecting to previous unit
`exec()` + environment variables + `/proc` together form the complete runtime context every Unix program receives — configuration without coupling.

## Closing

### Connect the pieces
When you type a command into your shell, it reads the input (via `fgets`), parses it into an `argv` array, and duplicates itself using `fork()`. The new child process inherits a copy of the parent's `environ` arrays. The child immediately calls `execvp()`, which queries `/proc`-exposed kernel mappings to swap the child's memory image entirely with the binary (like `/bin/echo`). The kernel sets up the stack with `argv` and `environ`, jumps to `_start`, and eventually `main()` runs with total isolation. Finally, when `main()` returns, `atexit` handlers flush standard I/O and issue `exit()`, signaling the kernel to wake the parent shell's `waitpid()` blocking call, closing the loop.

(Lesson 31 covers pipes — how the shell implements `prog1 | prog2`.)
