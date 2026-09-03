# Lesson 20: Processes — fork, exec, wait, and the Unix Process Model

What you will build
The reader will understand the Unix process creation model: fork() creates a child that is a copy of the parent; exec() replaces a process image with a new program; wait() reaps a child's exit status. They will understand process groups, sessions, and how the shell uses these primitives to run commands. The transferable insight: fork+exec is the Unix way to run any program. It is the foundation for shells, web servers, daemons, parallel computation, and any program that needs to spawn child processes.

What you need to know first
Lessons 00-19.

Terms used in this lesson
- **Process** — An instance of a running program, providing the illusion of exclusive use of the CPU and memory. It exists to isolate programs from one another.
- **Zombie process** — A process that has terminated but has not yet been reaped by its parent. It exists to hold the exit status so the parent can read it later.
- **Signal** — A small message sent by the kernel or another process to notify a process that an event has occurred.
- **Child process** — A new process created by a parent process. It exists to perform work independently of the parent.
- **Parent process** — The process that created a child process.

Objects and methods used
- **`fork`**
  - What it is: A system call that creates a new child process.
  - Implementation: `pid_t fork(void);`
  - Its use: To duplicate the current process.
  - Type: C library function wrapping a system call.
  - Responsibility: Creates an almost-exact copy of the calling process, returning the child's PID to the parent and 0 to the child.
  - Depends on: OS resources to allocate memory and tracking structures.
  - Connects to: Called by a process, handled by the kernel, returns control to both parent and child.
  - Shape: System call boundary.
- **`getpid`**
  - What it is: A system call to get the current process ID.
  - Implementation: `pid_t getpid(void);`
  - Its use: To identify the running process.
  - Type: C library function wrapping a system call.
  - Responsibility: Returns the caller's unique process ID.
  - Depends on: Nothing.
  - Connects to: Kernel data structures.
  - Shape: System call boundary.
- **`getppid`**
  - What it is: A system call to get the parent process ID.
  - Implementation: `pid_t getppid(void);`
  - Its use: To identify the parent of the running process.
  - Type: C library function wrapping a system call.
  - Responsibility: Returns the PID of the caller's parent.
  - Depends on: Nothing.
  - Connects to: Kernel data structures.
  - Shape: System call boundary.
- **`perror`**
  - What it is: A standard library function to print an error message.
  - Implementation: `void perror(const char *s);`
  - Its use: To print a description of the last error that occurred during a system call.
  - Type: C standard library function.
  - Responsibility: Maps the current value of `errno` to a string and prints it to stderr along with a custom prefix.
  - Depends on: `errno` set by a previous failed system call.
  - Connects to: Writes to stderr (file descriptor 2).
  - Shape: Standard library I/O.
- **`waitpid`**
  - What it is: A system call to wait for state changes in a child process.
  - Implementation: `pid_t waitpid(pid_t pid, int *status, int options);`
  - Its use: To block until a child exits, and to reap its exit status.
  - Type: C library function wrapping a system call.
  - Responsibility: Suspends execution of the calling process until a child specified by `pid` changes state.
  - Depends on: A valid child process existing.
  - Connects to: Kernel process management, writes exit status to the integer pointed to by `status`.
  - Shape: System call boundary.
- **`sleep`**
  - What it is: A standard library function to suspend execution.
  - Implementation: `unsigned int sleep(unsigned int seconds);`
  - Its use: To simulate work or wait for a duration.
  - Type: C standard library function.
  - Responsibility: Suspends execution of the calling thread for at least the specified number of seconds.
  - Depends on: System timer.
  - Connects to: Kernel scheduling.
  - Shape: Standard library function.
- **`WIFEXITED`**
  - What it is: A macro to check if a child exited normally.
  - Implementation: `int WIFEXITED(int status);`
  - Its use: To interpret the status integer set by `waitpid`.
  - Type: C preprocessor macro.
  - Responsibility: Evaluates to non-zero if the child process terminated normally.
  - Depends on: The raw status integer from `waitpid`.
  - Connects to: Bitwise operations on the status integer.
  - Shape: Macro.
- **`WEXITSTATUS`**
  - What it is: A macro to extract the exit status of a child.
  - Implementation: `int WEXITSTATUS(int status);`
  - Its use: To get the specific return code of the child.
  - Type: C preprocessor macro.
  - Responsibility: Extracts the low-order 8 bits of the exit status, provided `WIFEXITED` is true.
  - Depends on: The raw status integer from `waitpid`.
  - Connects to: Bitwise operations on the status integer.
  - Shape: Macro.
- **`WIFSIGNALED`**
  - What it is: A macro to check if a child was terminated by a signal.
  - Implementation: `int WIFSIGNALED(int status);`
  - Its use: To handle abnormal child termination.
  - Type: C preprocessor macro.
  - Responsibility: Evaluates to non-zero if the child process was terminated by a signal.
  - Depends on: The raw status integer from `waitpid`.
  - Connects to: Bitwise operations on the status integer.
  - Shape: Macro.
- **`WTERMSIG`**
  - What it is: A macro to extract the terminating signal of a child.
  - Implementation: `int WTERMSIG(int status);`
  - Its use: To find out which signal killed the child.
  - Type: C preprocessor macro.
  - Responsibility: Extracts the signal number that caused the child process to terminate.
  - Depends on: The raw status integer from `waitpid`.
  - Connects to: Bitwise operations on the status integer.
  - Shape: Macro.
- **`execvp`**
  - What it is: A standard library function to replace the current process image.
  - Implementation: `int execvp(const char *file, char *const argv[]);`
  - Its use: To run a new program in the current process.
  - Type: C library function wrapping the `execve` system call.
  - Responsibility: Replaces the calling process's memory and state with a new program loaded from the filesystem, searching the PATH.
  - Depends on: A valid executable file and argument array.
  - Connects to: Kernel executable loader. Never returns on success.
  - Shape: System call boundary.
- **`_exit`**
  - What it is: A system call to terminate the calling process immediately.
  - Implementation: `void _exit(int status);`
  - Its use: To terminate a child process without flushing standard I/O buffers of the parent.
  - Type: C library function wrapping a system call.
  - Responsibility: Terminates the process and returns the status to the parent, bypassing user-space teardown like `atexit` handlers.
  - Depends on: An integer status code.
  - Connects to: Kernel process termination.
  - Shape: System call boundary.
- **`sigaction`**
  - What it is: A system call to examine and change a signal action.
  - Implementation: `int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact);`
  - Its use: To install a signal handler.
  - Type: C library function wrapping a system call.
  - Responsibility: Tells the kernel how to behave when it delivers a specific signal to the process.
  - Depends on: A signal number and a populated `sigaction` struct.
  - Connects to: Kernel signal dispatch table.
  - Shape: System call boundary.
- **`sigemptyset`**
  - What it is: A standard library function to initialize a signal set.
  - Implementation: `int sigemptyset(sigset_t *set);`
  - Its use: To clear all signals from a signal mask.
  - Type: C standard library function.
  - Responsibility: Initializes the signal set given by `set` to empty, with all signals excluded from the set.
  - Depends on: A pointer to a `sigset_t` struct.
  - Connects to: Memory manipulation of the set.
  - Shape: Standard library helper.

Everything else in the file, not this lesson's subject but still explained:
- **`printf`**
  - What it is: Formatted output function.
  - Implementation: `int printf(const char *format, ...);`
  - Its use: To display output.
  - Type: C standard library function.
  - Responsibility: Formats and prints data to stdout.
  - Depends on: Format string and arguments.
  - Connects to: Writes to file descriptor 1.
  - Shape: Standard library I/O.


## Concept Unit: fork() — creating a child process
### The Problem
How do we create a new process to run tasks in parallel? If you need a program to do two things at once, what would you reach for? What does the operating system need to do to safely isolate two running tasks?
### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main(void) {
    printf("Before fork: PID=%d\n", getpid());

    pid_t pid = fork();  /* fork here: parent AND child resume below */

    if (pid < 0) {
        perror("fork"); return 1;  /* fork failed */
    } else if (pid == 0) {
        /* CHILD: pid==0 */
        printf("Child:  PID=%d, PPID=%d\n", getpid(), getppid());
    } else {
        /* PARENT: pid = child's PID */
        printf("Parent: PID=%d, child_pid=%d\n", getpid(), pid);
    }
    printf("Both parent and child print this\n");
    return 0;
}
```
Trace: PID=1000. `fork()`: kernel creates child process 1001. Child is a copy: same code, same stack, same heap, same file descriptors. In parent: fork returns 1001 (child PID). In child: fork returns 0. Both processes continue independently from the line after `fork()`. 'Both parent and child print this' appears TWICE. This is called a **fork**, which proves that a single process can duplicate itself into two identical, concurrently executing processes.
### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.
### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/main.c` (created)
- Change type: add
- Location: entire file
- Dependencies: POSIX standard library.
### The New Code
```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    if (pid == 0) {
        printf("I am the child\n");
    } else {
        printf("I am the parent\n");
    }
    return 0;
}
```
### The Updated Project
```c
// 1: #include <stdio.h>
// 2: #include <unistd.h>
// 3:
// 4: int main(void) {
// 5:     pid_t pid = fork(); // <- new
// 6:     if (pid == 0) { // <- new
// 7:         printf("I am the child\n"); // <- new
// 8:     } else { // <- new
// 9:         printf("I am the parent\n"); // <- new
// 10:    } // <- new
// 11:    return 0;
// 12: }
```
This minimal structure executes `fork()` and branches based on the return value to separate parent and child logic.
### Mechanical walkthrough
- `#include <stdio.h>`: Includes the standard I/O library for `printf`.
- `#include <unistd.h>`: Includes the POSIX OS API, which provides the `fork` function.
- `int main(void)`: Defines the main entry point of the program.
- `pid_t`: A data type used to represent process IDs.
- `pid`: The variable storing the result of `fork()`.
- `=`: The assignment operator.
- `fork()`: The system call that duplicates the current process. Returns the new child's PID to the parent, and 0 to the child.
- `if (pid == 0)`: The conditional branch testing if this execution path is the child process.
- `printf("I am the child\n");`: The output executed only by the child.
- `else`: The branch executed if the condition is false (i.e., if this is the parent process).
- `printf("I am the parent\n");`: The output executed only by the parent.
- `return 0;`: Exits the main function for both processes.
### CS lens
The concept here is **process duplication**. It appears anywhere a system uses a "copy-on-write" mechanism to cheaply create copies, such as in virtual memory management, snapshotting databases, and cloning virtual machines.
### SE lens
A design principle here is **fork-join parallelism**. The alternative not chosen is threading. The real tradeoff is that processes offer strong memory isolation (a crash in the child won't crash the parent), but IPC (Inter-Process Communication) is much more expensive than threads sharing memory.
### Commands needed
`gcc src/main.c -o main && ./main`
### Run it
Predicted confidently: The program will print both "I am the parent" and "I am the child", though the order is non-deterministic because the OS scheduler decides which process runs first.
### One sentence connecting to previous unit
With a child process created, we now need a way to track when it finishes and clean up its resources.


## Concept Unit: wait() and waitpid() — reaping children
### The Problem
What happens when a child process finishes before its parent? How does the parent know if the child succeeded or failed? How does the operating system store that exit result without wasting memory?
### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main(void) {
    pid_t child_pid = fork();

    if (child_pid == 0) {
        printf("Child (PID=%d) working...\n", getpid());
        sleep(1);
        printf("Child done, exiting with status 42\n");
        return 42;
    }

    int status;
    pid_t reaped = waitpid(child_pid, &status, 0);

    if (WIFEXITED(status)) {
        int exit_code = WEXITSTATUS(status);
        printf("Parent: child %d exited with status %d\n", reaped, exit_code);
    }
    return 0;
}
```
Trace `waitpid(child_pid, &status, 0)`: parent blocks until child 1001 exits. Child calls `return 42`: kernel converts to exit syscall. Child process becomes a **zombie**. Kernel sends `SIGCHLD`. `waitpid` returns. `WIFEXITED(status)` checks if child exited normally. `WEXITSTATUS(status)` extracts the low 8 bits of exit code = 42. This is called **reaping**, which proves that a parent can synchronize with and read the final state of its child.
### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.
### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/main.c` (modified)
- Change type: replace
- Location: inside `main()`
- Dependencies: POSIX standard library, `sys/wait.h`.
### The New Code
```c
#include <sys/wait.h>

    // inside main:
    pid_t pid = fork();
    if (pid == 0) {
        return 42;
    } else {
        int status;
        waitpid(pid, &status, 0);
        printf("Child exit status: %d\n", WEXITSTATUS(status));
    }
```
### The Updated Project
```c
// 1: #include <stdio.h>
// 2: #include <unistd.h>
// 3: #include <sys/wait.h> // <- new
// 4:
// 5: int main(void) {
// 6:     pid_t pid = fork();
// 7:     if (pid == 0) {
// 8:         return 42; // <- new
// 9:     } else {
// 10:        int status; // <- new
// 11:        waitpid(pid, &status, 0); // <- new
// 12:        printf("Child exit status: %d\n", WEXITSTATUS(status)); // <- new
// 13:    }
// 14:    return 0;
// 15: }
```
This replaces the print statements with a child that exits immediately with a specific status, and a parent that waits to read and print that status.
### Mechanical walkthrough
- `#include <sys/wait.h>`: Includes the definitions for `waitpid` and status macros.
- `return 42;`: The child process terminates with an exit status of 42.
- `int status;`: Declares an integer to hold the raw status information provided by the kernel.
- `waitpid(pid, &status, 0);`: A system call that suspends the parent until the process specified by `pid` terminates, storing the status into the memory address of `status`. The `0` means no special options.
- `printf`: Formatted print function.
- `"Child exit status: %d\n"`: The format string specifying an integer output.
- `WEXITSTATUS(status)`: A macro that extracts the actual 8-bit exit code (42) from the raw integer status.
### CS lens
The concept here is **synchronization and lifecycle management**. It appears in thread joining, garbage collection systems (where dead objects are reaped), and container orchestration platforms (like Kubernetes waiting for a pod to terminate).
### SE lens
A design principle here is **blocking IO/syscalls**. The alternative not chosen is asynchronous waiting (using non-blocking flags or signals). The real tradeoff is that blocking is simple and easy to reason about in linear code, but it wastes the parent process's CPU time by forcing it to idle while the child works.
### Commands needed
`gcc src/main.c -o main && ./main`
### Run it
Predicted confidently: The program will print "Child exit status: 42" because the parent waits for the child to return 42, then extracts and prints that exact value.
### One sentence connecting to previous unit
Now that we can spawn identical children and wait for them to finish, we need a way to make those children run entirely different programs instead of just copying the parent.

## Concept Unit: exec() — replacing the process image
### The Problem
If `fork()` only creates a copy of the parent, how do we ever run a completely different program, like `ls` or `grep`? How can a process change its own executable code while keeping the same identity (PID)?
### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    printf("Before exec: PID=%d\n", getpid());

    char *argv[] = {"ls", "-l", "/tmp", NULL};
    execvp("ls", argv);

    perror("execvp");
    return 1;
}
```
Trace `execvp("ls", argv)`: kernel loads `/bin/ls` ELF binary. Maps `.text`, `.data`, `.bss` into virtual address space of the current PID. Resets stack to new stack. Sets `rip` to `ls`'s `_start` entry point. File descriptors inherited. PID remains the same. 'Before exec' line only appears once. This is called an **exec**, which proves that a process can overwrite its own memory space with a completely new program.
### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.
### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/main.c` (modified)
- Change type: replace
- Location: inside `main()`
- Dependencies: None.
### The New Code
```c
    printf("Before exec\n");
    char *argv[] = {"echo", "replaced!", NULL};
    execvp("echo", argv);
    perror("exec failed");
    return 1;
```
### The Updated Project
```c
// 1: #include <stdio.h>
// 2: #include <unistd.h>
// 3:
// 4: int main(void) {
// 5:     printf("Before exec\n"); // <- new
// 6:     char *argv[] = {"echo", "replaced!", NULL}; // <- new
// 7:     execvp("echo", argv); // <- new
// 8:     perror("exec failed"); // <- new
// 9:     return 1; // <- new
// 10: }
```
This structure demonstrates how a process replaces itself entirely; the code following `execvp` is only reached if the call fails.
### Mechanical walkthrough
- `printf("Before exec\n");`: Prints a message before the replacement occurs.
- `char *argv[]`: Declares an array of string pointers representing the command-line arguments.
- `= {"echo", "replaced!", NULL};`: Initializes the array. By convention, the first argument is the program name, followed by arguments, and it must be terminated by a `NULL` pointer.
- `execvp("echo", argv);`: System call wrapper that searches the `PATH` for "echo" and replaces the current process's memory space with that program, passing `argv` as its arguments.
- `perror("exec failed");`: Prints an error message if `execvp` returns. Since `execvp` replaces the program on success, returning implies a failure.
- `return 1;`: Exits with an error code if exec fails.
### CS lens
The concept here is **program loading/image replacement**. It appears in dynamic linkers, bootloaders replacing themselves with operating system kernels, and hot-reloading systems.
### SE lens
A design principle here is **separation of concerns (creation vs. loading)**. The alternative not chosen is a combined `spawn()` system call (like in Windows). The real tradeoff is that separating `fork` and `exec` allows the parent to modify the child's environment (like changing file descriptors or dropping privileges) *after* the child is created but *before* the new program starts running.
### Commands needed
`gcc src/main.c -o main && ./main`
### Run it
Predicted confidently: The program will print "Before exec", followed immediately by "replaced!" as the `echo` utility takes over the process and executes.
### One sentence connecting to previous unit
By combining the ability to duplicate a process with the ability to replace it, we arrive at the standard Unix way to launch any command.

## Concept Unit: fork + exec — running a new program
### The Problem
How do we launch a new program without destroying our current one? If `exec()` replaces the process, how does a shell stay alive to accept the next command after running `ls`?
### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int run_command(const char *path, char *argv[]) {
    pid_t pid = fork();
    if (pid == 0) {
        execvp(path, argv);
        perror("exec");
        _exit(127);
    }
    int status;
    waitpid(pid, &status, 0);
    return WIFEXITED(status) ? WEXITSTATUS(status) : -1;
}

int main(void) {
    char *ls_args[] = {"ls", "-la", "/tmp", NULL};
    run_command("ls", ls_args);
    return 0;
}
```
Trace `run_command("ls", ls_args)`: `fork()`: child PID=2001. Child: `execvp("ls", ls_args)`: replaces child's address space with `ls`. `ls` runs, outputs to fd 1. `ls` exits. Parent: `waitpid` blocks. Child exits. `waitpid` returns. Returns 0. This is called the **fork-exec pattern**, which proves how to safely spawn and manage external programs.
### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.
### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/main.c` (modified)
- Change type: replace
- Location: entire file
- Dependencies: POSIX standard library.
### The New Code
```c
int run_command(const char *path, char *argv[]) {
    pid_t pid = fork();
    if (pid == 0) {
        execvp(path, argv);
        _exit(127);
    }
    int status;
    waitpid(pid, &status, 0);
    return WEXITSTATUS(status);
}
```
### The Updated Project
```c
// 1: #include <stdio.h>
// 2: #include <unistd.h>
// 3: #include <sys/wait.h>
// 4:
// 5: int run_command(const char *path, char *argv[]) { // <- new
// 6:     pid_t pid = fork(); // <- new
// 7:     if (pid == 0) { // <- new
// 8:         execvp(path, argv); // <- new
// 9:         _exit(127); // <- new
// 10:    } // <- new
// 11:    int status; // <- new
// 12:    waitpid(pid, &status, 0); // <- new
// 13:    return WEXITSTATUS(status); // <- new
// 14: } // <- new
// 15:
// 16: int main(void) {
// 17:     char *args[] = {"echo", "hello", NULL};
// 18:     run_command("echo", args);
// 19:     return 0;
// 20: }
```
This introduces a reusable function combining the three system calls to safely run any external program while the parent waits.
### Mechanical walkthrough
- `int run_command(const char *path, char *argv[])`: Declares a function taking a program name and a null-terminated array of arguments.
- `pid_t pid = fork();`: The parent duplicates itself.
- `if (pid == 0)`: The child path.
- `execvp(path, argv);`: The child replaces its own image with the target program.
- `_exit(127);`: Only reached if `execvp` fails; terminates the child immediately with code 127 (command not found convention) to prevent the child from returning into the parent's logic.
- `int status;`: Declares the status variable for the parent.
- `waitpid(pid, &status, 0);`: The parent waits exclusively for this specific child to finish.
- `return WEXITSTATUS(status);`: The parent extracts and returns the exit status of the executed command.
### CS lens
The concept here is **process orchestration**. It appears in init systems (like systemd), build tools (like Make or Ninja), and language runtimes spawning subprocesses (like Python's `subprocess` module).
### SE lens
A design principle here is **encapsulation of complex system interactions**. The alternative not chosen is making the caller handle the system calls directly every time. The real tradeoff is that hiding the fork/exec/wait triad inside `run_command` reduces boilerplate, but it restricts flexibility if the caller needs to customize the child environment (e.g., redirecting standard output) before the `exec` happens.
### Commands needed
`gcc src/main.c -o main && ./main`
### Run it
Predicted confidently: The program will print "hello" as the parent successfully spawns a child that executes `echo hello`, and then the parent will gracefully exit.
### One sentence connecting to previous unit
While blocking to wait for one child is useful, a real server or shell needs to handle multiple children simultaneously without freezing, which requires asynchronous notification.

## Concept Unit: Zombie processes and signal SIGCHLD
### The Problem
If a parent process is busy doing its own work (like a web server accepting connections) and a child finishes, how does the parent know to reap it? If it never calls `waitpid`, what happens to the terminated child?
### Introduce the concept in isolation
```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <signal.h>

void sigchld_handler(int sig) {
    int status;
    pid_t pid;
    while ((pid = waitpid(-1, &status, WNOHANG)) > 0) {
        if (WIFEXITED(status))
            printf("Reaped child %d\n", pid);
    }
    (void)sig;
}

int main(void) {
    struct sigaction sa;
    sa.sa_handler = sigchld_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;
    sigaction(SIGCHLD, &sa, NULL);

    for (int i = 0; i < 3; i++) {
        if (fork() == 0) return 0;
    }
    sleep(1);
    return 0;
}
```
Trace: `sigaction` installs `sigchld_handler` for `SIGCHLD`. Fork 3 children. Parent sleeps. Children exit, becoming zombies, and kernel sends `SIGCHLD` to parent. Parent's `SIGCHLD` handler runs, interrupting the sleep. `waitpid(-1, ..., WNOHANG)` reaps any exited child without blocking. The loop ensures all zombies are reaped even if multiple exited simultaneously. This is called **asynchronous signal handling**, which proves a process can react to events without explicitly polling for them.
### Discard the throwaway
This throwaway example is discarded and will not appear in the project again.
### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/main.c` (modified)
- Change type: replace
- Location: entire file
- Dependencies: POSIX standard library, `signal.h`.
### The New Code
```c
void sigchld_handler(int sig) {
    int status;
    while (waitpid(-1, &status, WNOHANG) > 0) {
        // reaped
    }
}

int main(void) {
    struct sigaction sa;
    sa.sa_handler = sigchld_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;
    sigaction(SIGCHLD, &sa, NULL);

    if (fork() == 0) return 0;
    sleep(1);
    return 0;
}
```
### The Updated Project
```c
// 1: #include <stdio.h>
// 2: #include <unistd.h>
// 3: #include <sys/wait.h>
// 4: #include <signal.h> // <- new
// 5:
// 6: void sigchld_handler(int sig) { // <- new
// 7:     int status; // <- new
// 8:     while (waitpid(-1, &status, WNOHANG) > 0) { // <- new
// 9:         // reaped // <- new
// 10:    } // <- new
// 11: } // <- new
// 12:
// 13: int main(void) {
// 14:     struct sigaction sa; // <- new
// 15:     sa.sa_handler = sigchld_handler; // <- new
// 16:     sigemptyset(&sa.sa_mask); // <- new
// 17:     sa.sa_flags = SA_RESTART; // <- new
// 18:     sigaction(SIGCHLD, &sa, NULL); // <- new
// 19:
// 20:     if (fork() == 0) return 0;
// 21:     sleep(1);
// 22:     return 0;
// 23: }
```
This registers an asynchronous callback that the operating system invokes whenever a child process terminates, allowing the parent to reap zombies automatically in the background.
### Mechanical walkthrough
- `void sigchld_handler(int sig)`: A function matching the required signature for a signal handler, receiving the signal number.
- `int status;`: Status integer for `waitpid`.
- `while`: A loop to continuously call `waitpid` because signals can coalesce (multiple children dying might only generate one `SIGCHLD`).
- `waitpid(-1, &status, WNOHANG)`: The `-1` means "wait for any child." `WNOHANG` is a flag that tells `waitpid` to return 0 immediately if no children are zombies, instead of blocking.
- `> 0`: Evaluates to true if a child PID was successfully reaped.
- `struct sigaction sa;`: Declares the configuration structure for the signal handler.
- `sa.sa_handler = sigchld_handler;`: Assigns our custom function to handle the signal.
- `sigemptyset(&sa.sa_mask);`: Initializes the mask of signals to block during execution of the handler to empty (none).
- `sa.sa_flags = SA_RESTART;`: Tells the kernel to automatically restart interrupted system calls (like a blocking `read`) after the signal handler returns.
- `sigaction(SIGCHLD, &sa, NULL);`: System call instructing the kernel to use the `sa` configuration whenever the `SIGCHLD` signal is delivered.
- `if (fork() == 0) return 0;`: Creates a child that exits immediately, becoming a zombie.
- `sleep(1);`: The parent idles, simulating other work, until the signal interrupts it to run the handler.
### CS lens
The concept here is **hardware interrupts and asynchronous event handling**. It appears in GUI event loops, Node.js's asynchronous I/O model, and hardware device drivers responding to physical events.
### SE lens
A design principle here is **event-driven programming**. The alternative not chosen is synchronous polling (the parent calling `waitpid` with `WNOHANG` in a tight loop). The real tradeoff is that event-driven handling uses zero CPU while waiting, but reasoning about execution flow becomes much harder because the handler can interrupt the main program at literally any instruction.
### Commands needed
`gcc src/main.c -o main && ./main`
### Run it
Predicted confidently: The program will silently exit after about one second, having safely spawned a child and asynchronously reaped it behind the scenes without blocking explicitly on `waitpid`.
### One sentence connecting to previous unit
With all the primitives in place, we can fully understand how any Unix system builds complex process trees.

## Closing
### Connect the pieces
When a user types `ls | wc -l`, the shell relies on every primitive we learned. First, the shell calls `fork()` twice to create two child processes. In the first child, it calls `execvp()` to replace the child's image with the `ls` program. In the second child, it calls `execvp()` to replace the image with the `wc` program. The shell uses the `SIGCHLD` signal and `waitpid()` to track when these commands finish, reaping their zombie processes so system resources are freed. `fork()`, `exec()`, and `wait()`—together these three system calls are how every Unix shell, web server, and parallel program creates and manages subprocesses. Lesson 21 covers exceptional control flow in depth.
