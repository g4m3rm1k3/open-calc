# Lesson 14: The Main Thread Cannot Wait — Threading, ANRs, and Executors

**What you will build:** No new visible feature. This lesson goes back
and fixes something invisible that has been true since Lesson 12:
`loadItemsFromDatabase()` on every launch, `insert` on every Add tap,
and `delete` on every swipe have all been running directly on the exact
same thread that draws your screen and responds to your taps — the
whole time, completely unnoticed, because the database has stayed
small and fast so far. The transferable problem: every single line of
code this project has written since Lesson 2 — every `onCreate`, every
click listener — has silently run on one specific thread the entire
time, and nothing forced you to notice. Today that thread becomes
visible. You'll deliberately break it on purpose to see exactly what
failure looks like, then move all three database operations off it for
good, correctly, using the real vocabulary (`Thread`, `Runnable`,
`ExecutorService`) to reason about *why*, not just a pattern that
happens to work.

**What you need to know first:** Lesson 2c (the OS calls `onCreate` —
this lesson is about *which* thread makes that call, and every other
call since). Lesson 12–13 (`DatabaseHelper`, `loadItemsFromDatabase`,
`insert`, `delete` — the three real operations this lesson moves).

**Terms introduced in this lesson:**
- **Main thread / UI thread** — the single thread Android uses to call
  every lifecycle method and every click listener in your app; every
  line of code this project has run since Lesson 2 has run here.
- **`Runnable`** — a single-abstract-method interface (one method,
  `run()`, no arguments, no return value) representing "a task to run
  later," the same functional-interface shape as `View.OnClickListener`.
- **`Queue` / `LinkedList` / `poll()`** — `Queue` is an ordered
  collection meant to be added to at one end and removed from the
  other; `LinkedList` is one concrete class implementing it;
  `poll()` removes and returns the item at the front, or `null` if
  empty.
- **Event loop** — a single thread that continuously pulls queued tasks
  and runs each one to completion before starting the next.
- **`Looper` / `MessageQueue`** — Android's real event-loop machinery:
  every lifecycle call and click listener since Lesson 2 has been one
  task pulled off the same `MessageQueue` by the main thread's `Looper`.
- **ANR (Application Not Responding)** — the system dialog Android
  shows when the main thread hasn't returned to its loop for roughly
  five seconds, offering to close the unresponsive app.
- **Checked exception** — a category of exception the compiler forces
  you to either `catch` or declare with `throws`, checked at compile
  time — distinct from an unchecked exception like
  `NumberFormatException` (Lesson 9), which the compiler never forces
  you to handle at all.
- **`Thread`** — a real, independent line of execution; `new
  Thread(Runnable)` builds one, `.start()` actually begins running it
  concurrently, and `.join()` blocks the calling thread until it
  finishes.
- **`ExecutorService` / `Executors`** — `Executors` is a factory for
  pre-built thread-management strategies; `ExecutorService` is the
  resulting object you submit `Runnable`s to via `.execute(...)`,
  without creating or managing any `Thread` object yourself.
- **Object Pool pattern** — reusing a small set of expensive-to-create
  resources across many requests instead of creating and discarding one
  per request.
- **`runOnUiThread(Runnable)`** — posts a `Runnable` to run on the main
  thread specifically, from any other thread.
- **`CalledFromWrongThreadException`** — the real exception Android
  throws immediately when a non-main thread tries to touch a `View`.

---

## Concept Unit: The Main Thread Is a Queue, Continuously Drained

### The Problem

Lesson 2c established that Android calls `onCreate`. Lesson 4
established that Android calls your click listener the moment a user
taps a button. Both are true — but *what*, mechanically, is doing the
calling? And why have you never once seen two of these calls overlap —
a click listener firing in the middle of `onCreate`, say — in this
entire project?

### Introduce the Concept in Isolation

The mechanism is genuinely simple once isolated from Android
completely: a loop that continuously pulls tasks off a queue and runs
them, one at a time, forever. Create a folder for this lesson's labs
(plain folder, no `package` line needed — same convention as every lab
so far). Inside it, create `LooperDemo.java`:

```java
import java.util.LinkedList;
import java.util.Queue;

public class LooperDemo {
    public static void main(String[] args) throws InterruptedException {
        Queue<Runnable> taskQueue = new LinkedList<>();
        taskQueue.add(() -> System.out.println("Task A running"));
        taskQueue.add(() -> System.out.println("Task B running"));
        taskQueue.add(() -> System.out.println("Task C running"));

        while (!taskQueue.isEmpty()) {
            Runnable task = taskQueue.poll();
            task.run();
        }
    }
}
```

Compile and run this yourself:

```
javac LooperDemo.java
java LooperDemo
```

Real output — verified this session:

```
Task A running
Task B running
Task C running
```

#### Execution Trace

1. `taskQueue.isEmpty()` is `false` — three tasks are waiting — so
   `task = taskQueue.poll()` removes and returns Task A's `Runnable`
   from the front of the queue, because `poll()` always hands back
   whichever element is currently first in line. `task.run()` then
   executes it immediately, printing `"Task A running"`.
2. `taskQueue.isEmpty()` is still `false` — two tasks remain, since Task
   A was removed last iteration — so `poll()` now returns Task B's
   `Runnable`, the new front of the queue. `task.run()` prints `"Task B
   running"`.
3. `taskQueue.isEmpty()` is still `false` — one task remains — so
   `poll()` returns Task C's `Runnable`, the only one left.
   `task.run()` prints `"Task C running"`, and the queue is now empty,
   which is what makes the loop's next `!taskQueue.isEmpty()` check
   `false` and end the loop.

What this proves: `Runnable` is a single-abstract-method interface —
one method, `run()`, taking no arguments and returning nothing, a pure
"do this later" wrapper, the exact same shape as `View.OnClickListener`
(Lesson 4) or `TapCallback` from that same lesson's own lab. The
`while` loop pulls exactly one `Runnable` at a time and runs it fully
to completion before even checking the queue again — there is no way,
in this code, for two tasks to run at once, because one thread can
only ever be doing one thing.

### Discard the Throwaway Example

Delete `LooperDemo.java`. Android's real main thread runs a class
called `Looper`, backed by a `MessageQueue`, doing exactly this —
continuously pulling and running one task at a time, forever, for the
entire life of your app's process. Every `onCreate` call, every click
listener invocation, every `Log.d` you have written since Lesson 2 has
been one task pulled off that same queue and run to completion before
the next one starts. This is *why* two callbacks never overlap in this
project — there has only ever been one thread doing the pulling, and
that thread never starts a second task until the first one fully
returns.

### Mechanical Walkthrough

- `Queue<Runnable> taskQueue = new LinkedList<>();` — **first
  appearance of `Queue`/`LinkedList`.** `Queue` is an interface
  describing an ordered collection meant to be added to at one end and
  removed from the other, first-in-first-out; `LinkedList` is one
  concrete class that implements it (the same interface/implementation
  split `List`/`ArrayList` already established back in Lesson 6a — a
  `Queue` reference variable can hold any class that implements
  `Queue`, and `LinkedList` happens to implement both `List` and
  `Queue` at once).
- `taskQueue.add(() -> System.out.println(...))` — **first appearance
  of a `Runnable` built as a lambda.** `Runnable` is a
  single-abstract-method interface — its one method, `run()`, takes no
  arguments and returns nothing — so a lambda with empty parentheses
  and a single statement body legally builds one, the same mechanism
  Lesson 4's `OnTapListener` lambda used. Three separate `Runnable`
  objects are built and added here, each one remembering exactly which
  `println` call it will run, once actually invoked.
- `while (!taskQueue.isEmpty())` — **reappearing** loop syntax
  (already-basic), the condition that ends the loop the instant nothing
  is left to run.
- `taskQueue.poll()` — **first appearance.** Removes and returns the
  item currently at the front of the queue — or `null`, if the queue is
  empty, though this loop's own `!isEmpty()` check guarantees `poll()`
  never actually returns `null` here, since it never runs on an empty
  queue.
- `task.run()` — **first appearance of manually invoking a
  `Runnable`.** Calling `.run()` directly executes the `Runnable`'s
  body on whichever thread makes the call — here, the same thread
  running `main` — synchronously, exactly like calling any other
  method. Nothing about `run()` itself creates a new thread; that
  distinction matters directly for a later unit in this lesson.

### CS Lens

This is the **event loop** pattern — a single thread continuously
consuming and executing queued units of work, one fully finishing
before the next begins. Also recognized in: JavaScript's own
single-threaded event loop (the exact same shape, a different
runtime), any GUI toolkit's message pump (Windows' classic message
loop, GTK's main loop), and a game engine's per-frame loop pulling
queued input events off a buffer before rendering the next frame.

### SE Lens

**Why does Android route every lifecycle call and every click listener
through one single thread's queue, instead of just calling whichever
callback directly and immediately, on whatever thread happens to
trigger it (the way a raw hardware interrupt might)?** The alternative
— call callbacks directly, from whatever thread noticed the event —
sounds simpler, but it means two different pieces of your own code
could run at the exact same instant, on different threads, both
reading and writing the same fields and the same views with no
ordering guarantee at all — the exact kind of race condition that
produces a bug appearing only occasionally, on some devices, that
nobody can reliably reproduce. Funneling everything through one
thread's queue means your own code never has to defend against itself
running twice at once; every `onCreate`, every click listener, every
`Log.d` this project has ever executed has had the entire main thread
to itself, uninterrupted, the whole time. The cost of that guarantee is
exactly what the next unit demonstrates: if any one of those tasks
takes too long, every task waiting behind it — including the ones that
keep your UI responsive — has to wait too.

---

## Concept Unit: Blocking the Loop — a Real ANR, on Purpose

### The Problem

If the main thread is one loop processing one task at a time, what
happens if *one* task simply takes a very long time to finish?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java` (temporary — added and
  fully removed within this unit).
- **Change type:** Add, then fully revert.

### The New Code

Temporarily add a fourth button to `activity_inventory.xml` (any
throwaway `Button`, or reuse `settingsButton`'s existing click listener
briefly — either works; a dedicated temporary button is cleaner to
remove afterward) wired to:

```java
android.util.Log.d("ANRDemo", "Button tapped, about to block");
try {
    Thread.sleep(8000);
} catch (InterruptedException e) {
    e.printStackTrace();
}
android.util.Log.d("ANRDemo", "Finished blocking");
```

### Run It

Run the app, tap the button, and **immediately** try to scroll the list
or tap anything else. Nothing responds — the whole screen is frozen —
because the single main-thread loop from the previous unit is sitting
inside `Thread.sleep(8000)`, unable to pull the *next* task (your
scroll gesture, another tap) off the queue until this one returns. Wait
roughly five seconds without tapping again: Android itself detects the
main thread hasn't returned to its loop in time and shows a real system
**"Pocket Inventory isn't responding"** dialog, offering to close the
app — a genuine, documented Android platform behavior (this specific
five-second threshold and the dialog itself are real, standard Android
behavior, not something fabricated for this lesson) rather than a
hypothetical — the actual ANR (**A**pplication **N**ot **R**esponding)
this unit is named for.

This is not an abstract warning about someone else's code. Right now,
in this exact project, `loadItemsFromDatabase()` runs directly inside
`onCreate`, and `insert`/`delete` run directly inside a click listener
and `onSwiped` — on this exact same thread, the one you just watched
freeze solid for eight seconds. Today those calls are fast enough that
you have never noticed a freeze. Nothing about *how* the main thread
works cares whether the task sitting in it is `Thread.sleep(8000)` or a
`SELECT` against a table that has quietly grown to ten thousand rows on
a slow phone's flash storage — both are "one task, taking too long,"
and the main thread cannot tell them apart.

### Discard the Throwaway Example

Delete this block and the temporary button entirely — it never appears
in the project again. The next two units build the real, permanent fix
this demonstration motivates.

### Mechanical Walkthrough

- `Thread.sleep(8000)` — **first appearance.** A `static` method that
  pauses *the calling thread* — here, the main thread, since that is
  what ran this click listener — for the given number of milliseconds,
  doing no other work at all in the meantime, not even checking its own
  task queue.
- `throws InterruptedException` / `try` / `catch (InterruptedException e)`
  — **first appearance of a checked exception.** `NumberFormatException`
  (Lesson 9) is an *unchecked* exception — the compiler never forces you
  to handle it; the code compiles fine even with no `try`/`catch` at
  all, and the failure only surfaces at runtime if bad input actually
  arrives. `InterruptedException` is *checked* — the compiler will not
  let this code compile at all unless it is caught right here or
  declared with `throws` on the enclosing method, because
  `Thread.sleep` might be interrupted by another thread while paused,
  and Java's designers decided that specific, recoverable possibility
  was important enough to force every caller to at least acknowledge it
  in the source, rather than let it surface only if it happens to occur.

### CS Lens

**This is a hard concept — blocking a single-threaded event loop — and
it recurs constantly:** any system built around one thread processing
one queue is only ever as responsive as its single slowest task. Also
recognized in: a Node.js server handling one slow synchronous
computation and freezing every other request the whole process is
handling, a desktop GUI's event handler doing a slow file read and
freezing the entire window's message pump for as long as that read
takes, and any single-threaded game loop whose per-frame logic
occasionally spikes, producing a visible stutter players actually
notice.

### SE Lens

**Why does Android use one single main thread for all UI work at all,
instead of letting any thread touch any view directly, with careful
locking?** The alternative — multi-threaded UI access, guarded by locks
— sounds more flexible, but introduces exactly the kind of subtle race
condition the previous unit's SE Lens described: two threads updating
the same view's state at slightly different times, producing an
ordering-dependent bug that appears only occasionally and is
notoriously hard to reproduce or debug. Confining all UI mutation to
one thread makes an entire category of bugs structurally impossible to
write by accident, at the direct cost you just watched: that one
thread must never be kept busy with anything slow, or the whole UI
stalls, exactly as it just did for eight full seconds.

---

## Concept Unit: `Thread` and `Runnable` — the Manual Way, and Why Not

### The Problem

The obvious fix for "don't block the main thread" is: run the slow work
on a *different* thread. Java's most basic tool for that is the
`Thread` class itself, used directly — worth seeing once, so the next
unit's `ExecutorService` reads as a deliberate improvement over
something real, not just a name to memorize.

### Introduce the Concept in Isolation

Create `ThreadDemo.java` in the same lesson folder:

```java
public class ThreadDemo {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("Main thread: " + Thread.currentThread().getName());

        Thread worker = new Thread(() -> {
            System.out.println("Worker thread: " + Thread.currentThread().getName());
        });
        worker.start();
        worker.join();

        System.out.println("Main thread again, worker is done");
    }
}
```

Compile and run this yourself:

```
javac ThreadDemo.java
java ThreadDemo
```

Real output — verified this session:

```
Main thread: main
Worker thread: Thread-0
Main thread again, worker is done
```

This proves two genuinely separate threads existed, each reporting a
different name via `Thread.currentThread().getName()`, and that
`worker.start()` itself does not pause `main` at all — `main` could, in
principle, keep going immediately after `start()` returns.
`worker.join()`, explained below, is specifically what makes `"Main
thread again..."` wait until the worker has genuinely finished, rather
than printing early, out of order, before the worker's own line.

### Discard the Throwaway Example

Delete `ThreadDemo.java` — the real project never creates a raw
`Thread` object directly; the next unit explains exactly why, and
introduces the tool this project actually uses instead.

### Mechanical Walkthrough

- `Thread.currentThread().getName()` — **first appearance.**
  `Thread.currentThread()` is a `static` method returning the `Thread`
  object actually executing this line right now; `.getName()` reads its
  name — `"main"` is a fixed, special name every Java (and Android)
  process's very first thread carries, distinguishing it from any
  thread created afterward.
- `new Thread(() -> { ... })` — **first appearance.** `Thread`'s
  constructor accepts a `Runnable` — the exact same interface labbed in
  this lesson's first unit — describing what the new thread should run
  once it actually starts; building this object does not start a
  thread by itself, it only prepares one.
- `worker.start()` — **first appearance.** Actually begins the new
  thread's execution, running its `Runnable` concurrently with whatever
  called `start()` — critically **not** the same as calling
  `worker.run()` directly, which (per the first unit's own walkthrough)
  would just execute the `Runnable`'s code on the *current* thread,
  synchronously, with no new thread ever created at all — a common
  first mistake worth naming explicitly, since both lines compile and
  neither one errors, but only one of them actually runs concurrently.
- `worker.join()` — **first appearance.** Blocks the thread that calls
  it — here, `main` — until `worker` finishes running, guaranteeing the
  final `println` cannot execute before the worker's own line does.
  This is the deliberate, controlled version of "wait for this to be
  done," in direct contrast to the *accidental*, uncontrolled blocking
  the previous unit's ANR demo caused — `join()` here runs on `main`,
  which is harmless in this standalone demo since nothing here is an
  Android UI thread with real responsiveness requirements, but calling
  `.join()` on Android's actual main thread would reproduce exactly the
  same freeze as `Thread.sleep` did, for exactly the same reason.

### CS Lens

`Runnable` and `Thread` are two separate ideas, deliberately kept apart:
`Runnable` is the **Command pattern** — a unit of work packaged up as
an object (here, "print this line"), decoupled from anything about
*how* or *where* it eventually runs; `Thread` is a separate object
supplying an actual execution context to run one in. Passing a
`Runnable` into a `Thread`'s constructor is handing one object (the
what) to another (the where), rather than a single object trying to be
both at once. Also recognized in: a GUI toolkit's action objects
handed to a menu item or button (the same "what to do" separated from
"what triggers it" idea), job objects submitted to any task queue, and
undo/redo systems that store a command object rather than directly
executing and forgetting an action.

### SE Lens

**Why doesn't the real project just write `new Thread(() -> { ...
database work... }).start()` directly, for every database operation,
now that this works and is understood?** Creating a real OS thread has
a genuine, measurable cost — the operating system has to allocate its
stack and register it with its scheduler — and this project's database
work happens repeatedly: every launch's initial load, every item added,
every item swiped away. Spinning up a brand-new `Thread` object for
each one of those, then discarding it the moment it finishes, pays that
setup cost over and over, for work that is individually small. The next
unit's tool reuses a small, fixed number of already-created threads
across every submitted task instead — you pay the thread-creation cost
once, not per operation, at the cost of losing the direct,
one-object-per-task simplicity `Thread` gives you here.

---

## Concept Unit: `ExecutorService` — Moving Our Real Database Work Off the Main Thread

### The Problem

Three real operations in this project — `loadItemsFromDatabase()` on
launch, `insert` on Add, `delete` on swipe — still run directly on the
main thread today. Now that the cost of a raw `Thread` per call is
understood, it is time to fix this for real, with the tool this project
actually keeps: a small, reusable pool of background threads.

### Introduce the Concept in Isolation

`Executors` (a standard-library factory class) builds several shapes of
thread pool; the one this project needs is
`Executors.newSingleThreadExecutor()` — exactly one background thread,
processing every submitted task strictly one at a time, in submission
order. Create `ExecutorDemo.java` in the same lesson folder:

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class ExecutorDemo {
    public static void main(String[] args) throws InterruptedException {
        ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
        System.out.println("Main thread: " + Thread.currentThread().getName());

        dbExecutor.execute(() ->
                System.out.println("Background thread: " + Thread.currentThread().getName()));
        dbExecutor.execute(() ->
                System.out.println("Background thread again: " + Thread.currentThread().getName()));

        dbExecutor.shutdown();
        dbExecutor.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("Main thread again, executor tasks are done");
    }
}
```

Compile and run this yourself:

```
javac ExecutorDemo.java
java ExecutorDemo
```

Real output — verified this session:

```
Main thread: main
Background thread: pool-1-thread-1
Background thread again: pool-1-thread-1
Main thread again, executor tasks are done
```

What this proves, and it is the entire point of this unit: both
submitted tasks report the exact same background thread name,
`pool-1-thread-1` — not `pool-1-thread-1` and `pool-1-thread-2`. One
real background thread was created once, then reused for the second
task, instead of a second `Thread` being created and discarded the way
the previous unit's manual approach would have required for each call.

### Discard the Throwaway Example

Delete `ExecutorDemo.java`. The real project keeps one
`ExecutorService`, as a field, for its entire lifetime — the next
section wires it into `InventoryActivity` for real.

### Mechanical Walkthrough

- `ExecutorService dbExecutor = Executors.newSingleThreadExecutor();`
  — **first appearance.** `Executors.newSingleThreadExecutor()` is a
  `static` factory method building one `ExecutorService` object backed
  by exactly one background thread; the variable's declared type,
  `ExecutorService`, is an interface — the concrete class actually
  returned is an implementation detail this project never needs to
  name.
- `dbExecutor.execute(() -> ...)` — **first appearance.** Submits a
  `Runnable` to be run on the executor's background thread, at some
  point after this call returns — `execute` itself returns immediately,
  without waiting for the submitted task to actually run, the same
  "don't block, hand off and continue" idea `startActivity` (Lesson 4)
  already used for a different kind of request.
- `dbExecutor.shutdown()` / `dbExecutor.awaitTermination(1, TimeUnit.SECONDS)`
  — **first appearance**, worth one clause: these two lines exist only
  so this throwaway demo's `main` method actually waits for the
  background thread's work to finish before printing its own final line
  and exiting — the real project, next, never calls either of them,
  since an Android `Activity`'s executor is meant to keep running for
  as long as the Activity itself might still need it, not shut down the
  moment one task finishes.

### CS Lens

A thread pool is the **Object Pool pattern** applied specifically to
threads — an expensive-to-create resource kept alive and reused across
many requests for work, instead of created and destroyed per request,
exactly as the real output above proved. Also recognized in: database
connection pools (a real production concern for a full server-side
database, out of scope for this project's local SQLite file), HTTP
client connection reuse (keep-alive), and a game engine pooling
bullet or particle objects instead of allocating a brand-new one every
single frame.

### SE Lens

**Why does this project use exactly one background thread
(`newSingleThreadExecutor()`) instead of, say,
`Executors.newFixedThreadPool(4)`, letting up to four database
operations run genuinely simultaneously?** Because a single-thread
executor gives this project something a bigger pool would not: every
database operation this app performs — the launch-time load, every
insert, every delete — gets submitted through the *same one* executor,
which means only one of them can ever actually be running against
`pocketinventory.db` at any given instant, no matter how quickly a user
taps. A bigger pool would let two of those operations genuinely overlap
in time, and nothing in `DatabaseHelper` (Lesson 12) or
`SQLiteDatabase` itself was written to be safe against two threads
touching the same database file at the exact same moment. One
background thread costs this project the *ability* to run two database
operations at once — something it was never trying to do in the first
place — in exchange for never having to reason about that kind of
overlap at all.

### Project Change — Wiring This Into the Real Project

- **Reference Source:** No reference counterpart — `track/`'s own
  Lesson 13 introduces an executor and Room together, as a single
  architectural unit; this course introduces the executor here on its
  own, wired into the raw SQLite code Lessons 12–13 already built,
  since this course never adopts Room.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Add a field, then refactor three existing call
  sites — the launch-time load, the Add button's `insert`, and
  `onSwiped`'s `delete` — to run through it.
- **Dependencies:** `DatabaseHelper` (Lesson 12), `loadItemsFromDatabase`
  (Lesson 13).

### The New Code — the Field

```java
private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
```

(Needs `import java.util.concurrent.ExecutorService;` and
`import java.util.concurrent.Executors;` at the top of the file,
alongside the existing imports.)

### The New Code — Moving the Launch-Time Load

Replace the single line that currently builds `items` synchronously:

```java
List<Item> items = loadItemsFromDatabase();
```

with an empty list built immediately, and the real load happening in
the background, after the adapter already exists:

```java
List<Item> items = new ArrayList<>();
```

```java
dbExecutor.execute(() -> {
    List<Item> loadedItems = loadItemsFromDatabase();
    runOnUiThread(() -> {
        items.addAll(loadedItems);
        adapter.notifyDataSetChanged();
    });
});
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    private InventoryAdapter adapter;
    private DatabaseHelper dbHelper;
    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();  // ← new

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        dbHelper = new DatabaseHelper(this);

        List<Item> items = new ArrayList<>();                                        // ← changed (was loadItemsFromDatabase())

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(items, item -> {
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        dbExecutor.execute(() -> {                                                   // ← new
            List<Item> loadedItems = loadItemsFromDatabase();                        // ← new
            runOnUiThread(() -> {                                                     // ← new
                items.addAll(loadedItems);                                           // ← new
                adapter.notifyDataSetChanged();                                       // ← new
            });                                                                       // ← new
        });                                                                            // ← new

        ItemTouchHelper itemTouchHelper = new ItemTouchHelper(new ItemTouchHelper.SimpleCallback(
                0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) {
            @Override
            public boolean onMove(@NonNull RecyclerView recyclerView,
                                   @NonNull RecyclerView.ViewHolder viewHolder,
                                   @NonNull RecyclerView.ViewHolder target) {
                return false;
            }

            @Override
            public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {
                int position = viewHolder.getAdapterPosition();
                Item removedItem = adapter.getItemAt(position);
                adapter.removeItem(position);
                dbExecutor.execute(() ->                                             // ← changed (was a direct call)
                        dbHelper.getWritableDatabase().delete("items", "id = ?",
                                new String[]{String.valueOf(removedItem.getId())}));
            }
        });
        itemTouchHelper.attachToRecyclerView(recyclerView);

        EditText nameInput = findViewById(R.id.nameInput);
        EditText quantityInput = findViewById(R.id.quantityInput);
        EditText locationInput = findViewById(R.id.locationInput);
        Button addItemButton = findViewById(R.id.addItemButton);

        addItemButton.setOnClickListener(v -> {
            String name = nameInput.getText().toString().trim();
            String quantityText = quantityInput.getText().toString().trim();
            String location = locationInput.getText().toString().trim();

            if (name.isEmpty() || location.isEmpty()) {
                return;
            }

            int quantity;
            try {
                quantity = Integer.parseInt(quantityText);
            } catch (NumberFormatException e) {
                return;
            }

            adapter.addItem(new Item(name, quantity, location));

            ContentValues values = new ContentValues();
            values.put("name", name);
            values.put("quantity", quantity);
            values.put("location", location);
            dbExecutor.execute(() ->                                                 // ← changed (was a direct call)
                    dbHelper.getWritableDatabase().insert("items", null, values));

            nameInput.setText("");
            quantityInput.setText("");
            locationInput.setText("");
        });

        Button settingsButton = findViewById(R.id.settingsButton);
        settingsButton.setOnClickListener(v ->
                startActivity(new Intent(InventoryActivity.this, SettingsActivity.class)));
    }

    @Override
    protected void onResume() {
        super.onResume();
        SharedPreferences prefs = getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE);
        int threshold = prefs.getInt("low_stock_threshold", 5);
        adapter.setLowStockThreshold(threshold);
    }

    private List<Item> loadItemsFromDatabase() {
        List<Item> loadedItems = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        Cursor cursor = db.rawQuery("SELECT id, name, quantity, location FROM items", null);
        while (cursor.moveToNext()) {
            int id = cursor.getInt(0);
            String name = cursor.getString(1);
            int quantity = cursor.getInt(2);
            String location = cursor.getString(3);
            loadedItems.add(new Item(id, name, quantity, location));
        }
        cursor.close();
        return loadedItems;
    }
}
```

`InventoryActivity` as a whole now starts every launch with an
intentionally empty on-screen list for a brief moment, fills it in
asynchronously the instant the real database read finishes, and routes
every insert and delete through the same background executor —
`loadItemsFromDatabase()` itself is completely unchanged; only *where*
it runs, and *when* its result reaches the screen, are different.

### Mechanical Walkthrough

- `private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();`
  — reappearing (field declaration, Lesson 5), new detail worth naming:
  this field is `final` and initialized once, at construction, and lives
  for exactly as long as this `InventoryActivity` object does — every
  database operation this Activity ever performs, across its entire
  lifetime, is submitted through this one same executor.
- `List<Item> items = new ArrayList<>();` — reappearing (`ArrayList`
  construction, Lesson 6a), now genuinely empty at this line instead of
  already populated — `adapter` is built from this same empty list one
  line later, meaning the very first frame the user sees shows no rows
  at all, briefly, until the background load below finishes.
- `dbExecutor.execute(() -> { ... })` — reappearing (this unit's own
  lab), now wrapping the real `loadItemsFromDatabase()` call instead of
  a `println`. Everything inside this outer lambda's body runs on
  `dbExecutor`'s background thread, not the main thread — including the
  `loadItemsFromDatabase()` call itself.
- `List<Item> loadedItems = loadItemsFromDatabase();` — reappearing
  (Lesson 13's own method, unchanged), now genuinely running on a
  background thread instead of the main thread — this is the actual
  fix this entire lesson has been building toward.
- `runOnUiThread(() -> { ... })` — **first appearance.** Posts the
  `Runnable` passed to it onto the main thread's own queue, to run
  there — called *from* the background thread, *while still running on
  it*, this is how a background task hands a result back to the one
  thread allowed to touch views, without ever calling a view method
  directly from the background thread itself.
- `items.addAll(loadedItems);` — reappearing (`List.addAll`, a `List`
  method not yet individually named in this course but mechanically
  identical to the already-familiar `List.add` used everywhere since
  Lesson 6a, just adding every element of `loadedItems` at once), now
  running inside the `runOnUiThread` block — meaning this specific
  mutation happens on the main thread, safely, even though the value
  being added, `loadedItems`, was computed moments earlier on a
  different thread entirely.
- `adapter.notifyDataSetChanged();` — reappearing (Lesson 10), telling
  `RecyclerView` its entire backing list may have changed and every
  currently-visible row should be re-bound — the correct choice here
  specifically because `items` went from completely empty to fully
  populated in one step, not one item at a time, which is exactly the
  case Lesson 11's more precise `notifyItemRemoved`/`notifyItemInserted`
  were built to avoid needing.
- `dbExecutor.execute(() -> dbHelper.getWritableDatabase().insert(...))`
  in the Add button's listener, and the matching change inside
  `onSwiped` — both reappearing (this unit's own executor pattern),
  worth one shared clause: neither of these two wraps its call in
  `runOnUiThread`, unlike the load above — because neither `insert` nor
  `delete` touches a `View` or an adapter method at all; they only write
  to the database file itself. The next unit proves exactly why the
  load needed that extra wrapping and these two do not. Both lambdas
  also reappear (Lesson 9's own effectively final lambda capture): the
  insert lambda reads `values`, and the delete lambda reads
  `removedItem`, neither ever reassigned after being built, which is
  exactly what makes both legal to read from inside a lambda body.

---

## Concept Unit: Crossing Back — Why Views Demand the Main Thread

### The Problem

The retrofit above wraps `items.addAll(...)` and
`adapter.notifyDataSetChanged()` specifically in `runOnUiThread`, while
leaving `insert` and `delete` running directly on the background
thread with no such wrapping. What actually happens if that one
specific piece of wrapping is skipped?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java` (temporary — reverted at
  the end of this unit).
- **Change type:** Modify, then fully revert.

### The New Code

Temporarily change the launch-time load added in the previous unit to
skip `runOnUiThread` entirely:

```java
dbExecutor.execute(() -> {
    List<Item> loadedItems = loadItemsFromDatabase();
    items.addAll(loadedItems);
    adapter.notifyDataSetChanged();  // called directly from the background thread
});
```

### Run It

Run the app. Read the real crash reported in Logcat:
`android.view.ViewRootImpl$CalledFromWrongThreadException: Only the
original thread that created a view hierarchy can touch its views.`
(this exact exception class and message are real, documented Android
platform behavior — cited precisely, not paraphrased — though
reproducing the crash yourself, on your own emulator, is how you
actually confirm it, not this lesson's prose alone).
`adapter.notifyDataSetChanged()` internally touches the `RecyclerView`
itself to schedule a re-layout, and the framework explicitly checks,
every single time, which thread is making that call — the moment it
detects the caller is not the main thread, it throws immediately. This
is not a vague, occasional race condition you got unlucky with; it is
an immediate, deliberate, always-reproducible guard the framework
enforces on purpose.

### Discard the Throwaway Example

Restore the `runOnUiThread(...)`-wrapped version from the previous
unit — that is the permanent code; this was only ever a demonstration
of the exact guard it satisfies.

### Mechanical Walkthrough

- `items.addAll(loadedItems);` running with no `runOnUiThread` wrapper
  — this line itself does not crash; `items` is a plain `List`, and
  mutating a plain Java collection from any thread is completely legal
  by itself.
- `adapter.notifyDataSetChanged();` running with no `runOnUiThread`
  wrapper — **this is the line that actually throws.** The crash is not
  caused by "background thread code touching data" in general — it is
  caused specifically by a method that reaches into `RecyclerView`'s own
  view hierarchy, checked and rejected the instant it runs anywhere but
  the main thread.

### CS Lens

`CalledFromWrongThreadException` is a concrete instance of a
**thread-confinement invariant, enforced defensively at the
boundary** — rather than allowing unsafe cross-thread view access and
hoping developers never trigger the resulting race, the framework
actively checks and fails loudly and immediately, the first time the
rule is broken, instead of failing silently or intermittently. Also
recognized in: Python's GIL-related restrictions on certain
C-extension calls, database drivers that refuse to let one connection
object be shared across threads, and any framework's explicit
`assertOnMainThread()`-style guard.

### SE Lens

**If `items.addAll(...)` alone is harmless off the main thread, why
does this project's retrofit still wrap it inside the same
`runOnUiThread` block as `notifyDataSetChanged()`, instead of only
wrapping the one line that actually needs it?** Because `items` and
`adapter`'s own backing list are meant to always agree with what is
currently drawn on screen — if `items.addAll(...)` ran on the
background thread while `notifyDataSetChanged()` ran moments later on
the main thread, there would be a real (if narrow) window where the
list has already changed but the screen has not been told yet, and
nothing in this project's code stops some other main-thread event from
reading `items` in that exact window and seeing a state the screen
does not yet reflect. Keeping both lines together, on the same thread,
in the same `Runnable`, removes that window entirely — the small cost
is one attribute (`items.addAll`) technically didn't need the
protection on its own; the benefit is never having to reason about
whether it needed it in this specific case or not.

---

## Connect the Pieces

Full trace, now fully explained rather than just used: Android's main
thread runs one continuous loop (the `LooperDemo` lab's shape, for
real) pulling and running one task at a time — every lifecycle call,
every click listener, since Lesson 2. Blocking that loop with
`Thread.sleep` froze the entire app and produced a real ANR after
roughly five seconds, proving why this project's database work could
not keep running there directly. A raw `Thread` per operation would
have worked but paid a real, repeated creation cost for work this
project performs constantly — `dbExecutor`, a single-thread
`ExecutorService`, reuses one background thread across every launch's
load, every Add tap's insert, and every swipe's delete instead, closing
that cost and, as a side effect, guaranteeing only one database
operation is ever in flight at once. Touching a `View` from that
background thread is *also* forbidden, enforced immediately by
`CalledFromWrongThreadException` — which is exactly why the load path
specifically wraps its UI-touching half in `runOnUiThread`, posting
that work back onto the one thread allowed to do it, while `insert` and
`delete`, which never touch a view at all, need no such wrapping.

## What Breaks Without This

Already demonstrated twice, on purpose, within this lesson's own units:
the real ANR dialog from blocking the main thread directly, and the
real `CalledFromWrongThreadException` from touching a view off the main
thread. Both were reverted immediately after observing them — no
further break-it exercise is needed this lesson.

## Exercises

1. In the `ThreadDemo` lab, remove `worker.join()` and rerun it several
   times. Because there is no `join()`, `"Main thread again, worker is
   done"` and `"Worker thread: Thread-0"` are now racing — predict,
   then observe, whether the output order stays consistent across
   multiple runs. This is a direct, hands-on demonstration of why
   unsynchronized concurrent output ordering can never be relied upon.
2. Change `dbExecutor` in `InventoryActivity` from
   `Executors.newSingleThreadExecutor()` to
   `Executors.newFixedThreadPool(4)` and rapidly tap "+ Add Item"
   several times in a row. Nothing should visibly break for this
   project's simple insert pattern — but think through, and write down
   for yourself, a scenario involving two genuinely *simultaneous*
   writes where a fixed pool of more than one thread structurally could
   cause a problem a single-thread executor could not. Revert to
   `newSingleThreadExecutor()` afterward — it remains the correct
   choice for this project, for the reason this lesson's SE Lens named.

## Definition of Done

- [ ] You ran the `LooperDemo` lab and can explain the main thread as a
      queue-processing loop in your own words.
- [ ] You triggered a real ANR dialog on purpose by blocking the main
      thread, and reverted the code afterward.
- [ ] You ran the `ThreadDemo` lab and can explain the difference
      between `.start()` and calling `.run()` directly.
- [ ] You ran the `ExecutorDemo` lab and can explain, from its real
      output, why both tasks reported the same thread name.
- [ ] `loadItemsFromDatabase()`, `insert`, and `delete` all now run
      through `dbExecutor`, confirmed by watching the app still load,
      add, and delete items correctly.
- [ ] You triggered a real `CalledFromWrongThreadException` on purpose
      and can explain why `runOnUiThread` fixes it.
- [ ] You can explain, in your own words, why `dbExecutor` uses a
      single-thread executor rather than a raw `Thread` per call or a
      larger pool.
- [ ] Commit: message explaining why (e.g. "Move loadItemsFromDatabase,
      insert, and delete off the main thread onto a single-thread
      executor, after confirming a blocked main thread produces a real
      ANR and an unwrapped adapter update off that thread crashes with
      CalledFromWrongThreadException").

Lesson 15 is next: `items` and `adapter` still live as plain fields on
`InventoryActivity`, which means Lesson 5's rotation problem never
actually went away for anything except one hand-rescued `tapCount` —
`ViewModel`, and state that survives configuration changes without a
hand-written `Bundle` rescue for every single field.
