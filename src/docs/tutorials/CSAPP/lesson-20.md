# Lesson 20: Processes — fork, exec, wait, and the Process Model

In this lesson, you will build a minimal Unix shell that can execute commands, wait for them to finish, and manage process groups. Through this, you will understand the Unix process model completely: how `fork()` creates a child, how `exec()` replaces a process image, how `wait()` reaps children, and how the shell implements job control. The transferable insight here is that `fork()` + `exec()` is the Unix way to start any program. Understanding it explains every shell command, every server process, and every daemon.

**What you need to know first:**
- Lesson 00–19.
- C programming basics, pointers, and memory layout (text, data, bss, heap, stack).

**Terms used in this lesson:**
- **Process** — An instance of a running program. It provides the illusion of exclusive use of the CPU and memory.
- **Process ID (PID)** — A unique positive integer that the operating system assigns to each active process to identify it.
- **Copy-on-write** — A resource-management technique where the operating system gives the child process a virtual copy of the parent's memory, but only physically copies a page if one of the processes modifies it.
- **Zombie process** — A child process that has terminated but has not yet been reaped by its parent, thus still consuming system resources to hold its exit status.
- **Orphan process** — A child process whose parent has terminated before it. It is adopted by `init` (PID 1).
- **Process group** — A collection of one or more processes used for distribution of signals (like `Ctrl-C` sending `SIGINT` to the foreground process group).
- **Address space** — The completely isolated memory area a process operates in, including text, data, heap, and stack segments.

**Objects and methods used:**

- **`fork`**
  - *What it is:* A system call that creates a new process by duplicating the calling process.
  - *Implementation:* `pid_t fork(void);`
  - *Its use:* Used to spawn child processes so they can execute independent tasks or run new programs.
  - *Type:* System call (C standard library function wrapper).
  - *Responsibility:* Duplicates the current process, returning 0 to the child and the child's PID to the parent.
  - *Depends on:* Operating system resources to allocate a new process control block and address space.
  - *Connects to:* Called by application code; transitions control to the kernel.
  - *Shape:* Boundary between user space and kernel space process management.

- **`execve`**
  - *What it is:* A system call that executes a program, completely replacing the calling process's image.
  - *Implementation:* `int execve(const char *pathname, char *const argv[], char *const envp[]);`
  - *Its use:* Used to run a different program after a `fork()`.
  - *Type:* System call (C standard library function wrapper).
  - *Responsibility:* Loads a new executable into the current process's address space and starts it, never returning if successful.
  - *Depends on:* An executable file, argument array, and environment array.
  - *Connects to:* Called by application code; replaces the application with a new one.
  - *Shape:* A one-way transition replacing the execution context.

- **`waitpid`**
  - *What it is:* A system call that blocks until a specific child process changes state (e.g., terminates).
  - *Implementation:* `pid_t waitpid(pid_t pid, int *status, int options);`
  - *Its use:* Used by parents to reap zombie children and read their exit statuses.
  - *Type:* System call (C standard library function wrapper).
  - *Responsibility:* Suspends execution of the parent until a child finishes, and retrieves its exit code.
  - *Depends on:* A target child PID and a pointer to store the status.
  - *Connects to:* Called by parent process; interacts with the kernel's process table.
  - *Shape:* Synchronization boundary between parent and child lifecycles.

- **`wait`**
  - *What it is:* A system call that blocks until any child process terminates.
  - *Implementation:* `pid_t wait(int *status);`
  - *Its use:* A simpler variant of `waitpid` to reap the next available child.
  - *Type:* System call (C standard library function wrapper).
  - *Responsibility:* Reaps any terminated child process.
  - *Depends on:* A pointer to store the status.
  - *Connects to:* Called by parent process.
  - *Shape:* Synchronization boundary.

- **`getpid`**
  - *What it is:* A system call that gets the calling process's ID.
  - *Implementation:* `pid_t getpid(void);`
  - *Its use:* Used for logging or identifying the current process.
  - *Type:* System call (C standard library function wrapper).
  - *Responsibility:* Returns the PID of the caller.
  - *Depends on:* Nothing.
  - *Connects to:* Called by application code.
  - *Shape:* Informational kernel query.

- **`getppid`**
  - *What it is:* A system call that gets the parent process's ID.
  - *Implementation:* `pid_t getppid(void);`
  - *Its use:* Used to identify who spawned the current process.
  - *Type:* System call (C standard library function wrapper).
  - *Responsibility:* Returns the PPID of the caller.
  - *Depends on:* Nothing.
  - *Connects to:* Called by application code.
  - *Shape:* Informational kernel query.

- **`getuid`**
  - *What it is:* A system call that gets the real user ID of the calling process.
  - *Implementation:* `uid_t getuid(void);`
  - *Its use:* Used to check the privileges of the running process.
  - *Type:* System call (C standard library function wrapper).
  - *Responsibility:* Returns the user ID executing the process.
  - *Depends on:* Nothing.
  - *Connects to:* Called by application code.
  - *Shape:* Informational kernel query.

- **`execl`, `execlp`, `execvp`**
  - *What it is:* Variadic and array-based frontends to `execve`.
  - *Implementation:* `int execvp(const char *file, char *const argv[]);`
  - *Its use:* Used to conveniently launch programs, sometimes searching the `PATH`.
  - *Type:* C standard library functions.
  - *Responsibility:* Format arguments and environment before invoking `execve`.
  - *Depends on:* Arguments matching the exec family conventions.
  - *Connects to:* Application code calling these, which in turn call `execve`.
  - *Shape:* User-space wrapper around `execve`.

- **`setpgid`**
  - *What it is:* A system call that sets the process group ID.
  - *Implementation:* `int setpgid(pid_t pid, pid_t pgid);`
  - *Its use:* Used by shells to put a command pipeline into its own process group.
  - *Type:* System call.
  - *Responsibility:* Assigns a process to a process group.
  - *Depends on:* Target PID and desired process group ID.
  - *Connects to:* Kernel process management.
  - *Shape:* State modifier for process relationships.

- **`killpg`**
  - *What it is:* A system call that sends a signal to a process group.
  - *Implementation:* `int killpg(int pgrp, int sig);`
  - *Its use:* Used to terminate all processes in a job simultaneously.
  - *Type:* System call.
  - *Responsibility:* Delivers a signal to an entire group of processes.
  - *Depends on:* Process group ID and a valid signal number.
  - *Connects to:* Kernel signal delivery.
  - *Shape:* Control-flow interruption boundary.


## Concept Unit: What a process is -- the complete picture

### The Problem
When we write a C program, we think of variables, functions, and memory. But how does the operating system see our program? Before we can create new programs dynamically, we need to understand the container that holds our running code. How do we inspect the boundaries and identity of this container?

What would you try first to find out your program's unique ID and memory locations?

### Introduce the concept in isolation
We will write a throwaway program to inspect its own process state. 

```c
#include <unistd.h>
#include <stdio.h>

int global = 100;  /* data segment */

int main(void)
{
    int local = 200;  /* stack */
    static int svar = 300;  /* data segment (static) */

    printf("PID:    %d\n",   getpid());
    printf("PPID:   %d\n",   getppid());  /* parent's PID */
    printf("UID:    %d\n",   getuid());   /* user ID */
    printf("global: %p\n",   (void*)&global);  /* data addr */
    printf("local:  %p\n",   (void*)&local);   /* stack addr */
    return 0;
}
```

*Predicted output (since PIDs and addresses are dynamic, but shape is deterministic):*
```text
PID:    1234
PPID:   890
UID:    1000
global: 0x601040
local:  0x7ffd12345678
```

This output proves that a process is an entity with a specific PID, spawned by a parent (PPID), running under a user (UID), and containing a completely isolated address space where global and local variables reside in distinct memory regions. This is called a **Process**.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our shell project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our shell project.
- **Files affected:** `shell.c` (created)
- **Change type:** add
- **Location:** Brand-new file
- **Dependencies:** None

### The New Code
```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    printf("Shell started. PID: %d\n", getpid());
    return 0;
}
```

### The Updated Project
```c
// ← new
1: #include <stdio.h>
2: #include <unistd.h>
3: 
4: int main(void) {
5:     printf("Shell started. PID: %d\n", getpid());
6:     return 0;
7: }
```
This structure creates a minimal shell program that announces its process identity before exiting.

### Mechanical walkthrough
- `#include <stdio.h>`: The C preprocessor directive to include the standard input/output library, providing `printf`.
- `#include <unistd.h>`: The C preprocessor directive to include POSIX operating system API definitions, providing `getpid`.
- `int main(void) {`: The entry point of a C program, returning an integer status and taking no arguments.
- `printf("Shell started. PID: %d\n",`: A standard library function call to format and print a string.
- `getpid()`: A system call that returns the process ID of the calling process.
- `);`: Closes the `printf` function call.
- `return 0;`: Returns a status code of 0 (success) to the operating system.
- `}`: Closes the `main` function body.


## Concept Unit: fork() -- creating a child process

### The Problem
Our shell starts as one process. But a shell's entire job is to run *other* programs while staying alive itself. If the shell runs a command, it can't just turn into that command, or the shell would be gone. How does a single process duplicate itself so one copy can run the command while the other waits?

### Introduce the concept in isolation
We will write a throwaway program to demonstrate `fork()`.

```c
#include <unistd.h>
#include <stdio.h>

int x = 10;  /* global */

int main(void)
{
    x = 20;  /* modify before fork */

    pid_t pid = fork();  /* THE FORK */

    /* Both parent and child run this code after the fork */
    if (pid < 0) {
        perror("fork");  /* fork failed */
        return 1;
    } else if (pid == 0) {
        /* CHILD: fork returns 0 */
        x = 30;  /* child modifies its OWN copy of x */
        printf("child:  pid=%d ppid=%d x=%d\n", getpid(), getppid(), x);
        /* Output: child: pid=1235 ppid=1234 x=30 */
    } else {
        /* PARENT: fork returns child's pid */
        printf("parent: pid=%d child=%d x=%d\n", getpid(), pid, x);
        /* Output: parent: pid=1234 child=1235 x=20 (x unchanged in parent) */
    }
    return 0;  /* both parent and child reach here */
}
```

*Predicted output (order is nondeterministic):*
```text
parent: pid=1234 child=1235 x=20
child:  pid=1235 ppid=1234 x=30
```

This output proves that `fork()` creates an exact duplicate of the parent process. Both processes continue executing from the instruction immediately following the fork. However, memory is isolated: the child modifying `x` to 30 does not affect the parent's `x`, which stays 20. This is achieved via **Copy-on-write**.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our shell project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `shell.c` (modified)
- **Change type:** add
- **Location:** Inside `main`, before `return 0;`
- **Dependencies:** POSIX environment

### The New Code
```c
    pid_t child_pid = fork();
    if (child_pid == 0) {
        printf("Child process executing.\n");
        return 0;
    }
```

### The Updated Project
```c
1: #include <stdio.h>
2: #include <unistd.h>
3: 
4: int main(void) {
5:     printf("Shell started. PID: %d\n", getpid());
6:     // ← new
7:     pid_t child_pid = fork();
8:     if (child_pid == 0) {
9:         printf("Child process executing.\n");
10:        return 0;
11:    }
12:    return 0;
13: }
```
The shell now spawns a child process. The child prints a message and exits, while the parent simply exits.

### Mechanical walkthrough
- `pid_t`: A signed integer type used to represent process IDs.
- `child_pid`: A variable holding the return value of `fork()`.
- `=`: The assignment operator.
- `fork()`: A system call that duplicates the calling process, returning 0 to the child and the child's PID to the parent.
- `;`: Statement terminator.
- `if`: Conditional statement keyword.
- `(`: Opens the condition.
- `child_pid`: The variable being checked.
- `==`: Equality operator.
- `0`: Integer literal. `fork()` returns 0 in the child process.
- `)`: Closes the condition.
- `{`: Opens the `if` block.
- `printf("Child process executing.\n");`: Prints a message.
- `return 0;`: The child process exits with status 0.
- `}`: Closes the `if` block.


## Concept Unit: wait() and waitpid() -- reaping children

### The Problem
When a child process exits, it leaves behind an exit status in the kernel. If the parent doesn't collect this status, the child becomes a zombie process, permanently leaking system resources. How does a parent wait for its child to finish and clean up its zombie?

### Introduce the concept in isolation
We will write a throwaway program to demonstrate `waitpid()`.

```c
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>

int main(void)
{
    pid_t pid = fork();

    if (pid == 0) {
        /* child */
        printf("child running\n");
        return 42;  /* exit status = 42 */
    }
    /* parent */
    int status;
    pid_t child = waitpid(pid, &status, 0);
    /* waitpid blocks until child exits */

    if (WIFEXITED(status)) {
        printf("child %d exited normally, status=%d\n",
               child, WEXITSTATUS(status));  /* prints: status=42 */
    }
    return 0;
}
```

*Predicted output:*
```text
child running
child 1235 exited normally, status=42
```

This proves that `waitpid()` suspends the parent's execution until the specified child process terminates, reaps the resulting **Zombie process**, and provides access to the 8-bit exit status (`42`) via the `WEXITSTATUS` macro.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our shell project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `shell.c` (modified)
- **Change type:** add
- **Location:** Inside `main`, after the `if (child_pid == 0)` block.
- **Dependencies:** `<sys/wait.h>`

### The New Code
```c
    int status;
    waitpid(child_pid, &status, 0);
```

### The Updated Project
```c
1: #include <stdio.h>
2: #include <unistd.h>
3: #include <sys/wait.h> // ← new
4: 
5: int main(void) {
6:     printf("Shell started. PID: %d\n", getpid());
7:     pid_t child_pid = fork();
8:     if (child_pid == 0) {
9:         printf("Child process executing.\n");
10:        return 0;
11:    }
12:    // ← new
13:    int status;
14:    waitpid(child_pid, &status, 0);
15:    return 0;
16: }
```
The parent process now correctly suspends its execution, waiting for the child to exit and reaping it before the shell itself exits.

### Mechanical walkthrough
- `#include <sys/wait.h>`: The preprocessor directive to include definitions for waiting on processes, such as `waitpid`.
- `int`: The standard C integer type.
- `status`: Variable to hold the integer status information returned by the kernel.
- `;`: Statement terminator.
- `waitpid`: A system call that blocks until a specific child process changes state.
- `(`: Opens function arguments.
- `child_pid`: The PID of the specific child to wait for.
- `,`: Argument separator.
- `&`: The address-of operator, creating a pointer to `status`.
- `status`: The variable being passed by reference to receive the exit information.
- `,`: Argument separator.
- `0`: Integer literal representing options. `0` means default blocking behavior.
- `)`: Closes function arguments.
- `;`: Statement terminator.


## Concept Unit: execve() -- replacing the process image

### The Problem
Our shell can now duplicate itself, but both parent and child are still running the *shell's* code. How do we make the child run a completely different program, like `ls` or `echo`? We need a way to discard the child's current memory and load a new executable file in its place.

### Introduce the concept in isolation
We will write a throwaway program to demonstrate `execve()`.

```c
#include <unistd.h>
#include <stdio.h>

int main(void)
{
    char *argv[] = {"/bin/ls", "-l", "/tmp", NULL};
    char *envp[] = {"HOME=/home/user", "PATH=/bin:/usr/bin", NULL};

    printf("before exec\n");  /* this prints */

    execve("/bin/ls", argv, envp);

    /* execve REPLACES this process -- the following NEVER executes */
    printf("after exec\n");   /* never reached if execve succeeds */
    perror("execve");         /* only reached if execve fails */
    return 1;
}
```

*Predicted output (exact output depends on /tmp contents, but shape is deterministic):*
```text
before exec
total 12
drwxrwxrwt 14 root root 4096 Aug 26 19:00 .
...
```

This proves that `execve()` completely overwrites the calling process's address space with the new program. The line `printf("after exec\n");` is never executed because the original program ceases to exist at the moment `execve()` succeeds. The PID remains the same.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our shell project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `shell.c` (modified)
- **Change type:** replace
- **Location:** Inside `main`, modifying the child block.
- **Dependencies:** None

### The New Code
```c
        char *args[] = {"echo", "hello", NULL};
        execvp("echo", args);
        perror("execvp failed");
        return 1;
```

### The Updated Project
```c
1:  #include <stdio.h>
2:  #include <unistd.h>
3:  #include <sys/wait.h>
4:  
5:  int main(void) {
6:      printf("Shell started. PID: %d\n", getpid());
7:      pid_t child_pid = fork();
8:      if (child_pid == 0) {
9:          // ← new (replaced block)
10:         char *args[] = {"echo", "hello", NULL};
11:         execvp("echo", args);
12:         perror("execvp failed");
13:         return 1;
14:     }
15:     int status;
16:     waitpid(child_pid, &status, 0);
17:     return 0;
18: }
```
The child process now attempts to load and execute the `echo` program instead of just printing a message. If `execvp` succeeds, the child's execution of `shell.c` code ends there.

### Mechanical walkthrough
- `char`: Character type.
- `*`: Pointer operator, making it a string.
- `args`: Name of the array.
- `[]`: Array declarator.
- `=`: Assignment operator.
- `{`: Array initializer start.
- `"echo"`: String literal for argv[0].
- `,`: Separator.
- `"hello"`: String literal for argv[1].
- `,`: Separator.
- `NULL`: The null pointer constant, required to terminate the argv array for the exec family.
- `}`: Array initializer end.
- `;`: Statement terminator.
- `execvp`: A C standard library function frontend to `execve` that searches the `PATH` environment variable for the executable.
- `(`: Opens arguments.
- `"echo"`: The command to find in `PATH`.
- `,`: Separator.
- `args`: The argument array.
- `)`: Closes arguments.
- `;`: Statement terminator.
- `perror`: A standard library function that prints a descriptive error message to stderr based on the current value of `errno`.
- `(`: Opens arguments.
- `"execvp failed"`: The prefix string for the error message.
- `)`: Closes arguments.
- `;`: Statement terminator.
- `return 1;`: Exits the child with a failure status if `execvp` failed.


## Concept Unit: fork + exec -- the shell model

### The Problem
We have seen `fork()` and `execvp()` separately. How do they combine to form a complete shell? The shell needs to read a command, spawn a child, replace the child with the command, wait for it to finish, and then report the outcome, doing this in a continuous loop.

### Introduce the concept in isolation
We will write a throwaway program to demonstrate the complete `fork()` + `exec()` shell model.

```c
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>
#include <string.h>

/* Simplified shell: run one command then exit */
int main(void)
{
    char *cmd = "/bin/echo";
    char *args[] = {"echo", "hello from shell", NULL};

    pid_t pid = fork();  /* create child */
    if (pid == 0) {
        /* child: replace itself with the command */
        execvp(cmd, args);
        perror(cmd);  /* only if execvp fails */
        return 127;   /* command not found convention */
    }
    /* parent: wait for command to finish */
    int status;
    waitpid(pid, &status, 0);
    printf("Command finished with status %d\n", WEXITSTATUS(status));
    return 0;
}
```

*Predicted output:*
```text
hello from shell
Command finished with status 0
```

This output proves the fundamental Unix pattern: the parent (`fork()`) creates an isolated context, the child (`execvp()`) drops its old memory to become a new program, and the parent (`waitpid()`) reaps the result. 

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our shell project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `shell.c` (modified)
- **Change type:** add
- **Location:** Inside `main`, modifying the parent block.
- **Dependencies:** None

### The New Code
```c
    if (WIFEXITED(status)) {
        printf("Command exited with status %d\n", WEXITSTATUS(status));
    }
```

### The Updated Project
```c
1:  #include <stdio.h>
2:  #include <unistd.h>
3:  #include <sys/wait.h>
4:  
5:  int main(void) {
6:      printf("Shell started. PID: %d\n", getpid());
7:      pid_t child_pid = fork();
8:      if (child_pid == 0) {
9:          char *args[] = {"echo", "hello", NULL};
10:         execvp("echo", args);
11:         perror("execvp failed");
12:         return 1;
13:     }
14:     int status;
15:     waitpid(child_pid, &status, 0);
16:     // ← new
17:     if (WIFEXITED(status)) {
18:         printf("Command exited with status %d\n", WEXITSTATUS(status));
19:     }
20:     return 0;
21: }
```
The shell parent now inspects the integer status returned by the kernel to determine exactly how the child terminated, extracting and printing its 8-bit exit code.

### Mechanical walkthrough
- `if`: Conditional statement keyword.
- `(`: Opens condition.
- `WIFEXITED`: A macro that returns true if the child terminated normally (i.e., by calling `exit()` or returning from `main`).
- `(`: Opens macro argument.
- `status`: The integer status variable populated by `waitpid`.
- `)`: Closes macro argument.
- `)`: Closes condition.
- `{`: Opens block.
- `printf`: Standard formatted print function.
- `(`: Opens arguments.
- `"Command exited with status %d\n"`: Format string expecting an integer.
- `,`: Separator.
- `WEXITSTATUS`: A macro that evaluates to the lowest 8 bits of the child's exit status.
- `(`: Opens macro argument.
- `status`: The status integer.
- `)`: Closes macro argument.
- `)`: Closes function arguments.
- `;`: Statement terminator.
- `}`: Closes block.


## Concept Unit: Multiple children and process trees

### The Problem
A real shell can run multiple background jobs or pipelines simultaneously. How does a parent process handle multiple children when it doesn't want to block on one specific child, but rather reap *any* child that finishes first?

### Introduce the concept in isolation
We will write a throwaway program to demonstrate `wait()`.

```c
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>

int main(void)
{
    /* Fork three children */
    for (int i = 0; i < 3; i++) {
        pid_t pid = fork();
        if (pid == 0) {
            printf("child %d: pid=%d\n", i, getpid());
            return i;  /* child exits with its index */
        }
    }

    /* Parent reaps all three children (in any order) */
    for (int i = 0; i < 3; i++) {
        int status;
        pid_t child = wait(&status);  /* wait for ANY child */
        printf("reaped child %d with status %d\n",
               child, WEXITSTATUS(status));
    }
    return 0;
}
```

*Predicted output (order of reaps is nondeterministic):*
```text
child 0: pid=1235
child 1: pid=1236
child 2: pid=1237
reaped child 1235 with status 0
reaped child 1237 with status 2
reaped child 1236 with status 1
```

This output proves that a parent can spawn a process tree of multiple concurrent children. The `wait()` system call blocks until *any* child terminates, returning that child's PID. `wait(&status)` is perfectly equivalent to calling `waitpid(-1, &status, 0)`.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our shell project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None modified to include `wait()`. We maintain our focus on a single foreground command for our simplified shell, but recognize the mechanic.
- **Change type:** configure
- **Location:** N/A
- **Dependencies:** N/A

### The New Code
```c
// (No code added. We rely on the isolated example to teach wait().)
```

### The Updated Project
```c
// Project structure unchanged.
```

### Mechanical walkthrough
- `wait`: A system call that blocks until any child process terminates.
- `(`: Opens arguments.
- `&`: Address-of operator.
- `status`: Variable to receive the status.
- `)`: Closes arguments.


## Concept Unit: Process groups, sessions, and signals overview

### The Problem
When you press `Ctrl-C` in a terminal, it stops the running command, but it doesn't kill the shell itself. If `Ctrl-C` sends a signal to the terminal, how does the OS know to route the signal only to the foreground command and its children, leaving the shell alone?

### Introduce the concept in isolation
We will write a throwaway program to demonstrate process groups.

```c
#include <unistd.h>
#include <signal.h>
#include <stdio.h>

int main(void)
{
    pid_t pid = fork();
    if (pid == 0) {
        /* Make child its own process group leader */
        setpgid(0, 0);  /* pgid = child's PID */
        printf("child pgid: %d\n", getpgrp());

        /* Simulate a long-running child */
        for (int i = 0; i < 5; i++) {
            printf("child working... %d\n", i);
            sleep(1);
        }
        return 0;
    }

    /* Parent: after 2 seconds, send SIGTERM to the child's process group */
    sleep(2);
    killpg(pid, SIGTERM);  /* send SIGTERM to process group pid */
    int status;
    waitpid(pid, &status, 0);
    if (WIFSIGNALED(status))
        printf("child killed by signal %d\n", WTERMSIG(status));  /* 15 */
    return 0;
}
```

*Predicted output:*
```text
child pgid: 1235
child working... 0
child working... 1
child killed by signal 15
```

This output proves that the OS can group processes. By calling `setpgid(0, 0)`, the child becomes a new process group leader. The parent then uses `killpg` to deliver a signal (`SIGTERM`, signal 15) to the entire process group. The `WIFSIGNALED` macro confirms the child died due to a signal. This is exactly how job control and `Ctrl-C` work in real shells.

### Discard the throwaway example
We are deleting this throwaway code; it will not appear in our shell project.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `shell.c` (modified)
- **Change type:** add
- **Location:** Inside the child process block and parent block.
- **Dependencies:** `<signal.h>`

### The New Code
```c
        setpgid(0, 0);
```
and
```c
    if (WIFSIGNALED(status)) {
        printf("Command killed by signal %d\n", WTERMSIG(status));
    }
```

### The Updated Project
```c
1:  #include <stdio.h>
2:  #include <unistd.h>
3:  #include <sys/wait.h>
4:  #include <signal.h> // ← new
5:  
6:  int main(void) {
7:      printf("Shell started. PID: %d\n", getpid());
8:      pid_t child_pid = fork();
9:      if (child_pid == 0) {
10:         // ← new
11:         setpgid(0, 0);
12:         char *args[] = {"echo", "hello", NULL};
13:         execvp("echo", args);
14:         perror("execvp failed");
15:         return 1;
16:     }
17:     int status;
18:     waitpid(child_pid, &status, 0);
19:     if (WIFEXITED(status)) {
20:         printf("Command exited with status %d\n", WEXITSTATUS(status));
21:     }
22:     // ← new
23:     if (WIFSIGNALED(status)) {
24:         printf("Command killed by signal %d\n", WTERMSIG(status));
25:     }
26:     return 0;
27: }
```
The shell child now establishes itself as a new process group leader before calling `execvp`, meaning `Ctrl-C` (if wired properly) would terminate the command group, leaving the parent shell alive. The parent shell now checks if the child was killed by a signal.

### Mechanical walkthrough
- `setpgid`: A system call that sets the process group ID.
- `(`: Opens arguments.
- `0`: PID 0 means "the calling process".
- `,`: Separator.
- `0`: PGID 0 means "use the process ID of the specified process".
- `)`: Closes arguments.
- `;`: Statement terminator.
- `if`: Conditional keyword.
- `(`: Opens condition.
- `WIFSIGNALED`: A macro returning true if the child was terminated by a signal.
- `(`: Opens macro argument.
- `status`: The integer status variable.
- `)`: Closes macro argument.
- `)`: Closes condition.
- `{`: Opens block.
- `printf`: Print function.
- `(`: Opens arguments.
- `"Command killed by signal %d\n"`: Format string.
- `,`: Separator.
- `WTERMSIG`: A macro returning the number of the signal that caused the child process to terminate.
- `(`: Opens macro argument.
- `status`: The integer status variable.
- `)`: Closes macro argument.
- `)`: Closes function arguments.
- `;`: Statement terminator.
- `}`: Closes block.

---
You now understand the Unix process model at the system call level. Lesson 21 covers Exceptional Control Flow in depth -- interrupts, traps, faults, and aborts. 

**Exercises:** 
1. Draw the process tree for a program that calls `fork()` three times.
2. Explain what happens to a zombie process if its parent exits (it becomes an orphan, adopted by `init` / PID 1, which automatically reaps it).
3. Write pseudocode for a minimal shell main loop that reads commands and executes them using the `fork` + `exec` + `waitpid` pattern we built here.
