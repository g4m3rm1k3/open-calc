# Lesson 22: Signals — Asynchronous Notification Between Processes

What you will build:
The reader will understand Unix signals as a software-level exceptional control flow mechanism: how signals are sent, how they are received and handled, what async-signal safety means and why it matters, and how to write correct signal handlers. The transferable insight: signals are the OS's way of delivering exceptional events (a process died, a timer fired, the user pressed Ctrl-C) to a running process asynchronously. Getting signal handlers wrong is one of the most subtle sources of bugs in systems software.

What you need to know first:
Lessons 00-21.

Terms used in this lesson:
**Signal** — a small integer message delivered by the OS to a process.
**Async-signal safety** — a property of functions that makes them safe to call from within a signal handler.
**Signal mask** — a set of signals that are currently blocked from being delivered to the process.
**Zombie process** — a terminated child process that has not yet been reaped by its parent.
**Pending signal** — a signal that has been sent but not yet delivered.

Objects and methods used:

**kill**
- What it is: A system call to send a signal to a process or process group.
- Implementation: `int kill(pid_t pid, int sig);`
- Its use: Used to send signals like SIGKILL or SIGTERM to child processes.
- Type: Function.
- Responsibility: Sends a specified signal to a specified process ID.
- Depends on: Requires the caller to have permission to send signals to the target process.
- Connects to: Communicates with the OS kernel to initiate signal delivery.
- Shape: A fundamental OS API boundary.

**sigaction**
- What it is: A system call to change the action taken by a process on receipt of a specific signal.
- Implementation: `int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact);`
- Its use: Used to install custom signal handlers robustly.
- Type: Function.
- Responsibility: Registers a function to be executed when a specific signal arrives, and configures its execution context.
- Depends on: A valid signal number and a populated `struct sigaction`.
- Connects to: Registers callback state within the OS kernel for the current process.
- Shape: An API boundary for configuring process behavior.

**sigprocmask**
- What it is: A system call to examine and change blocked signals.
- Implementation: `int sigprocmask(int how, const sigset_t *set, sigset_t *oldset);`
- Its use: Used to block signals during critical sections of code.
- Type: Function.
- Responsibility: Updates the process's signal mask to block or unblock specific signals.
- Depends on: A valid `sigset_t` containing the signals to block/unblock.
- Connects to: Modifies the kernel's process control block.
- Shape: An API boundary for managing asynchronous interruption.

**waitpid**
- What it is: A system call to wait for state changes in a child of the calling process.
- Implementation: `pid_t waitpid(pid_t pid, int *wstatus, int options);`
- Its use: Used to reap terminated child processes.
- Type: Function.
- Responsibility: Suspends execution of the calling thread until a child specified by `pid` changes state.
- Depends on: A valid child process ID or -1 for any child.
- Connects to: Retrieves exit status from the kernel and cleans up process table entries.
- Shape: An API boundary for process synchronization and resource cleanup.

## Concept Unit: What a signal is — software interrupts

### The Problem
How does an operating system notify a running process of an external event, like a user pressing Ctrl-C or a child process terminating? If the process is busy executing an infinite loop, how can we interrupt it? What mechanism exists to force a process to handle an event asynchronously without polling?

### Introduce the concept in isolation
Here is a throwaway example demonstrating signal delivery.

```c
#include <stdio.h>
#include <unistd.h>

int main(void)
{
    printf("PID: %d\n", getpid());
    /* From another terminal: kill -SIGTERM <pid> */
    /* This process will print its PID and then terminate when SIGTERM arrives */
    while (1) {
        printf("running...\n");
        sleep(1);
    }
    return 0;
}
/* When SIGTERM sent externally:
   PID: 1234
   running...
   running...
   Terminated     <- OS default SIGTERM handler */
```

This proves that signals interrupt execution asynchronously — the process didn't poll for signals; the OS delivered it. This is called a **signal**.

### Discard the throwaway
The throwaway code above is discarded and will not be used in the project.

### Project Change
- Reference Source: No reference counterpart — this is a standalone theory lesson.
- Files affected: `src/main.c` (created)
- Change type: add
- Location: Brand new file.
- Dependencies: None.

### The New Code
```c
/* Signals are small integers. Common defaults: */
/* SIGINT   (2)  | Terminate | Ctrl-C from terminal */
/* SIGTERM  (15) | Terminate | Polite termination request */
/* SIGKILL  (9)  | Terminate | Immediate kill (cannot be caught) */
```

### The Updated Project
```c
1: /* Signals are small integers. Common defaults: */ // <- new
2: /* SIGINT   (2)  | Terminate | Ctrl-C from terminal */ // <- new
3: /* SIGTERM  (15) | Terminate | Polite termination request */ // <- new
4: /* SIGKILL  (9)  | Terminate | Immediate kill (cannot be caught) */ // <- new
```
This simply documents the signals we will be working with.

### Mechanical walkthrough
- `SIGINT`: A macro expanding to the integer value 2, representing an interrupt signal.
- `SIGTERM`: A macro expanding to 15, representing a polite request to terminate.
- `SIGKILL`: A macro expanding to 9, representing a forceful termination that cannot be blocked or caught.

### CS lens
The concept here is an **Asynchronous Interrupt**. Real-world analogies: a fire alarm ringing in a building (everyone stops what they are doing immediately), a phone call interrupting a conversation, or a hardware interrupt from a disk drive indicating data is ready.

### SE lens
The design principle is **Event-Driven Notification**. The alternative NOT chosen is polling, where the process would constantly check "has the user pressed Ctrl-C?". The tradeoff is that asynchronous delivery is highly efficient but makes reasoning about control flow much harder because execution can jump at any moment.

### Commands needed
`kill -SIGTERM <pid>`

### Run it
Predicted confidently: The process will print "running..." indefinitely until interrupted by SIGTERM, at which point it prints "Terminated" and exits.

### One sentence connecting to previous unit
Now that we know what a signal is, we need to know how to send one programmatically.

## Concept Unit: Sending signals — kill() and raise()

### The Problem
If signals are delivered by the OS, how can our process instruct the OS to send a signal to another process? How can a parent terminate a misbehaving child? What system call exposes this capability?

### Introduce the concept in isolation
Here is a throwaway example sending a signal.

```c
#include <signal.h>
#include <unistd.h>
#include <stdio.h>
#include <sys/wait.h>

int main(void)
{
    pid_t pid = fork();
    if (pid == 0) {
        printf("Child %d sleeping\n", getpid());
        sleep(100);
        return 0;
    }
    sleep(1);
    printf("Parent sending SIGKILL to child %d\n", pid);
    kill(pid, SIGKILL);
    int status;
    waitpid(pid, &status, 0);
    if (WIFSIGNALED(status))
        printf("Child killed by signal %d\n", WTERMSIG(status));
    return 0;
}
/* Output:
   Child 1235 sleeping
   Parent sending SIGKILL to child 1235
   Child killed by signal 9 */
```

This proves that a process can send arbitrary signals to another process using its PID. This is called **signal sending**.

### Discard the throwaway
The throwaway example is discarded and will not be used further.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/main.c`
- Change type: add
- Location: Appended to file.
- Dependencies: Requires `kill` and `fork`.

### The New Code
```c
kill(pid, SIGKILL);
```

### The Updated Project
```c
1: int main(void) {
2:     pid_t pid = fork();
3:     if (pid > 0) {
4:         kill(pid, SIGKILL); // <- new
5:     }
6: }
```
This snippet shows the parent aggressively terminating the child process.

### Mechanical walkthrough
- `kill`: A function call. It instructs the OS to deliver a signal. It returns 0 on success, -1 on error.
- `pid`: A variable of type `pid_t`. The target process ID.
- `SIGKILL`: A macro representing signal 9.

### CS lens
The concept is **Inter-Process Communication (IPC)** via signals. Real-world analogy: sending a direct order to a subordinate department to halt operations.

### SE lens
The design principle is **Process Management**. The alternative NOT chosen is shared memory flags. The tradeoff is that signals carry no payload (just a number) but require zero shared memory setup.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The parent terminates the child immediately.

### One sentence connecting to previous unit
Now that we can send signals, we must learn how to intercept them using custom handlers.

## Concept Unit: Installing signal handlers — signal() and sigaction()

### The Problem
By default, SIGINT kills a process. What if we want to save data before exiting? How do we tell the OS to run our function instead of the default action? What is the robust way to do this in POSIX?

### Introduce the concept in isolation
Here is a throwaway example installing a handler.

```c
#include <signal.h>
#include <stdio.h>
#include <unistd.h>

void handler(int sig)
{
    write(1, "Caught SIGINT\n", 14);
}

int main(void)
{
    struct sigaction sa;
    sa.sa_handler = handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;
    sigaction(SIGINT, &sa, NULL);

    printf("Press Ctrl-C\n");
    while (1) {
        sleep(1);
        printf("tick\n");
    }
    return 0;
}
/* When Ctrl-C pressed:
   Press Ctrl-C
   tick
   tick
   Caught SIGINT   <- handler ran instead of default termination
   tick            <- continues after handler returns */
```
This proves that we can intercept signals and resume execution. This is called a **signal handler**.

### Discard the throwaway
The throwaway code is discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/main.c`
- Change type: replace
- Location: Replaces main block.
- Dependencies: None.

### The New Code
```c
struct sigaction sa;
sa.sa_handler = handler;
sigemptyset(&sa.sa_mask);
sa.sa_flags = SA_RESTART;
sigaction(SIGINT, &sa, NULL);
```

### The Updated Project
```c
1: void handler(int sig) { write(1, "Caught\n", 7); }
2: int main(void) {
3:     struct sigaction sa; // <- new
4:     sa.sa_handler = handler; // <- new
5:     sigemptyset(&sa.sa_mask); // <- new
6:     sa.sa_flags = SA_RESTART; // <- new
7:     sigaction(SIGINT, &sa, NULL); // <- new
8:     while(1) sleep(1);
9: }
```
This sets up a custom handler for SIGINT that will write "Caught\n".

### Mechanical walkthrough
- `struct sigaction sa;`: Declares a local structure variable `sa` to hold handler configuration.
- `sa.sa_handler`: A function pointer field assigned to our `handler` function.
- `sigemptyset(&sa.sa_mask)`: A function call initializing the mask to empty, so no other signals are blocked while the handler runs. Returns 0 on success.
- `sa.sa_flags = SA_RESTART`: Sets a flag to automatically restart slow system calls like `read` if they are interrupted by this signal.
- `sigaction(SIGINT, &sa, NULL)`: A system call that registers `sa` as the action for `SIGINT`. Returns 0 on success.

### CS lens
The concept is **Callbacks / Interrupt Service Routines**. Real-world analogy: setting up a forwarding address so mail goes to a new location instead of the default.

### SE lens
The principle is **Hooking/Overriding Defaults**. The alternative NOT chosen is the older `signal()` function. The tradeoff is that `sigaction` is much more complex to set up but provides POSIX-guaranteed semantics across all platforms.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Pressing Ctrl-C prints "Caught\n" instead of killing the program.

### One sentence connecting to previous unit
If we can run arbitrary code in a handler, what happens if we call a function like `printf`?

## Concept Unit: Async-signal safety — why printf() is forbidden in handlers

### The Problem
Can we put any code inside a signal handler? What if the main program is inside `printf` (which holds a lock) and the signal handler also calls `printf`? How do we avoid deadlock in an asynchronous environment?

### Introduce the concept in isolation
Throwaway example of bad vs good handlers.

```c
/* WRONG handler -- potential deadlock: */
void bad_handler(int sig) {
    printf("got signal %d\n", sig);
}

/* CORRECT handler -- only async-signal safe functions: */
void good_handler(int sig) {
    const char *msg = "got signal\n";
    write(STDOUT_FILENO, msg, 10);
}
```
This proves that some functions are fundamentally unsafe in handlers. This is called **async-signal safety**.

### Discard the throwaway
The throwaway snippet is discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/main.c`
- Change type: modify
- Location: inside `handler`
- Dependencies: None.

### The New Code
```c
write(STDOUT_FILENO, "Safe\n", 5);
```

### The Updated Project
```c
1: void handler(int sig) {
2:     write(STDOUT_FILENO, "Safe\n", 5); // <- new
3: }
```
This uses a safe direct system call instead of `printf`.

### Mechanical walkthrough
- `write`: A system call that writes data directly to a file descriptor. It is async-signal safe.
- `STDOUT_FILENO`: A macro (typically 1) representing standard output.
- `"Safe\n"`: A string literal.
- `5`: An integer literal for the byte count.

### CS lens
The concept is **Reentrancy and Concurrency**. Real-world analogy: trying to use a public telephone while someone else (who you interrupted) is currently holding the handset.

### SE lens
The principle is **Restricted Execution Environments**. The alternative NOT chosen is disabling all signals during library calls. The tradeoff is that signal handlers are extremely limited in what they can do (no malloc, no printf), pushing complex logic back to the main thread.

### Commands needed
None for this unit.

### Run it
Predicted confidently: Safely prints "Safe" when a signal is handled.

### One sentence connecting to previous unit
If we can't do complex work in a handler, we might need to briefly block signals in the main thread to do critical work safely.

## Concept Unit: Blocking and unblocking signals — sigprocmask()

### The Problem
What if we have a critical section of code (like updating a linked list) that must not be interrupted by a signal? How do we temporarily delay signal delivery until the critical section is over?

### Introduce the concept in isolation
Throwaway example for blocking signals.

```c
#include <signal.h>
#include <stdio.h>
#include <unistd.h>

int main(void)
{
    sigset_t mask, prev;
    sigemptyset(&mask);
    sigaddset(&mask, SIGINT);
    sigprocmask(SIG_BLOCK, &mask, &prev);

    printf("Critical section: Ctrl-C is blocked\n");
    sleep(3);
    printf("Critical section done\n");

    sigprocmask(SIG_SETMASK, &prev, NULL);
    printf("SIGINT unblocked\n");
    while(1) sleep(1);
    return 0;
}
```
This proves that signals can be queued (pending) and delivered later. This is called **signal blocking**.

### Discard the throwaway
The throwaway code is discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/main.c`
- Change type: replace
- Location: main function
- Dependencies: None.

### The New Code
```c
sigset_t mask, prev;
sigemptyset(&mask);
sigaddset(&mask, SIGINT);
sigprocmask(SIG_BLOCK, &mask, &prev);
/* critical section */
sigprocmask(SIG_SETMASK, &prev, NULL);
```

### The Updated Project
```c
1: int main(void) {
2:     sigset_t mask, prev; // <- new
3:     sigemptyset(&mask); // <- new
4:     sigaddset(&mask, SIGINT); // <- new
5:     sigprocmask(SIG_BLOCK, &mask, &prev); // <- new
6:     /* safe work */
7:     sigprocmask(SIG_SETMASK, &prev, NULL); // <- new
8: }
```
This protects a block of code from being interrupted by SIGINT.

### Mechanical walkthrough
- `sigset_t`: A data type representing a set of signals.
- `sigemptyset`: Initializes the set to empty. Returns 0.
- `sigaddset`: Adds a specific signal (SIGINT) to the set. Returns 0.
- `sigprocmask(SIG_BLOCK, &mask, &prev)`: Blocks the signals in `mask` and saves the previous mask state into `prev`. Returns 0.
- `sigprocmask(SIG_SETMASK, &prev, NULL)`: Restores the old mask, unblocking the signals.

### CS lens
The concept is **Critical Sections / Mutual Exclusion**. Real-world analogy: putting a "Do Not Disturb" sign on your door while working on something delicate.

### SE lens
The principle is **State Restoration**. The alternative NOT chosen is unblocking just SIGINT manually. The tradeoff is `prev` perfectly restores whatever the state was before, making this safe to nest.

### Commands needed
None for this unit.

### Run it
Predicted confidently: If you press Ctrl-C during the sleep, nothing happens until `sigprocmask` restores the old mask, at which point the signal is delivered.

### One sentence connecting to previous unit
Blocking signals is useful, but we also have to deal with the fact that signals of the same type don't queue multiple times.

## Concept Unit: Signal races and the SIGCHLD problem

### The Problem
If multiple child processes terminate at the exact same time, the OS sends multiple SIGCHLD signals. But standard Unix signals are not queued — if a signal is already pending, subsequent signals of the same type are discarded. How do we ensure we reap all children?

### Introduce the concept in isolation
Throwaway code demonstrating the loop.

```c
#include <signal.h>
#include <sys/wait.h>
#include <stdio.h>

volatile int child_done = 0;

void sigchld_handler(int sig)
{
    int status;
    while (waitpid(-1, &status, WNOHANG) > 0) {
        child_done++;
    }
}

int main(void)
{
    signal(SIGCHLD, sigchld_handler);
    for (int i = 0; i < 3; i++) {
        if (fork() == 0) return i;
    }
    while (child_done < 3);
    printf("All %d children reaped\n", child_done);
    return 0;
}
```
This proves we must loop in the handler to catch all events. This is called a **signal race**.

### Discard the throwaway
The throwaway example is discarded.

### Project Change
- Reference Source: No reference counterpart.
- Files affected: `src/main.c`
- Change type: replace
- Location: handler function
- Dependencies: None.

### The New Code
```c
int status;
while (waitpid(-1, &status, WNOHANG) > 0) {
    child_done++;
}
```

### The Updated Project
```c
1: void sigchld_handler(int sig) {
2:     int status; // <- new
3:     while (waitpid(-1, &status, WNOHANG) > 0) { // <- new
4:         child_done++; // <- new
5:     } // <- new
6: }
```
This loops until no more zombie children are available to be reaped.

### Mechanical walkthrough
- `while`: A loop construct that continues as long as the condition is true.
- `waitpid`: Called with `-1` (any child) and `WNOHANG` (return immediately if no children have exited). Returns the PID of the reaped child, or 0 if none are ready.
- `status`: Integer holding exit status.
- `> 0`: Checks if a child was actually reaped.
- `child_done++`: Increments a counter.

### CS lens
The concept is **Idempotent Edge-Triggered Polling**. Real-world analogy: when the doorbell rings (edge trigger), you don't just let one person in; you open the door and let everyone standing on the porch in until it's empty.

### SE lens
The principle is **Defensive Programming**. The alternative NOT chosen is assuming one signal = one child. The tradeoff is that looping does slightly more work but guarantees correctness in the face of signal compression.

### Commands needed
None for this unit.

### Run it
Predicted confidently: All 3 children will be reaped regardless of how many SIGCHLD signals were actually delivered.

### One sentence connecting to previous unit
You have now seen how to handle signals robustly.

## Closing
### Connect the pieces
Trace one concrete scenario through ALL concept units: We start a process. We want to clean up temp files if the user hits Ctrl-C (`SIGINT`). We use `sigaction` to install a custom handler. In that handler, we use only async-signal-safe functions like `write` and `unlink`. To ensure our main thread doesn't leave data structures corrupted if interrupted, we use `sigprocmask` to block `SIGINT` during critical updates. Finally, if this process spans worker children, it catches `SIGCHLD` and loops `waitpid` to ensure no zombies remain even if signals arrive simultaneously. Signals are ECF at the process level — the OS equivalent of hardware interrupts, delivered via the kernel to user processes. Next lesson: virtual memory.
