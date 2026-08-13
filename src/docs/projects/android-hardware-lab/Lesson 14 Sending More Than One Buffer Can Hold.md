# Lesson 14: Sending More Than One Buffer Can Hold

**What you will build:** a real file, sent whole, over the exact same
socket Lessons 10 and 11 already opened — replacing their hardcoded
one-line `"Hello from Android"` with real file bytes, of a size the
receiving side has no way to guess in advance. This is the lesson that
turns "this series can exchange a sentence" into "this series can
actually transfer something."

**What you need to know first:** Lessons 10 and 11 in full — this
lesson modifies both sides of that same connection, not a new one.

**Terms introduced in this lesson:**
- **Framing** — sending, up front, some fixed-size piece of
  information describing how much data is about to follow, so the
  receiving side knows exactly when it has received all of it. Lessons
  10 and 11 never needed this: a one-line message, read once, was
  small enough that a single `read()` call happened to be enough by
  accident, not by any real guarantee.
- **Chunked reading** — reading a stream through a fixed-size buffer,
  in a loop, accumulating the total across possibly many reads —
  necessary the moment the data being read might be larger than any
  one buffer, which a real file frequently is and a one-line message
  (Lessons 10–11) never was.

**Objects and methods this lesson uses:**
- **`DataOutputStream` / `DataInputStream`**
  - *What they are:* wrapper streams that add the ability to write
    and read whole typed values — `long`, `int`, and others — as a
    fixed, well-defined number of bytes, instead of you hand-encoding
    a number into bytes yourself.
  - *Implementation:* each wraps an existing `OutputStream`/
    `InputStream` — here, the same socket streams Lessons 10 and 11
    already obtained; `writeLong(long)` writes exactly 8 bytes,
    `readLong()` reads exactly 8 bytes back and reconstructs the
    original `long`.
  - *Its use:* sending the file's exact byte count *before* the file
    itself — this lesson's real framing mechanism.
- **`FileInputStream` / `FileOutputStream`**
  - *What they are:* ordinary Java file I/O — not Bluetooth-specific
    at all.
  - *Implementation:* constructed from a `File` object; read and
    written through the same generic `InputStream`/`OutputStream`
    methods this series has already used on socket streams since
    Lesson 10.
  - *Its use:* reading the real file to send, and writing the real
    file as it's received, on `getFilesDir()` — this app's own
    private storage, needing no extra storage permission.
- **`File.length()`**
  - *What it is:* the file's real size, in bytes, on disk right now.
  - *Implementation:* a plain `long`.
  - *Its use:* the exact value sent via `writeLong`, below — the
    receiving side's promise of how much to expect.

---

## Concept Unit: Knowing When You've Received It All

### The Problem

Lesson 11's `in.read(buffer)` returned once, and that single call
happened to contain the entire message — a coincidence of the message
being short, not a real guarantee `InputStream.read` ever makes. A
real file can easily be larger than any one buffer this series has
used (1024 bytes), which means reading it needs a loop — and a loop
needs a real stopping condition. Nothing about the raw bytes arriving
over a socket announces "this is the last chunk of the file" on their
own; the two sides have to agree on that boundary themselves, ahead of
time.

### Introduce the Concept in Isolation — Step 1: A Stream With No Announced End

Scratch file, no Android, no sockets — `PipedOutputStream`/
`PipedInputStream` stand in for two ends of a real stream, entirely
within one program:

```java
PipedOutputStream pipeOut = new PipedOutputStream();
PipedInputStream pipeIn = new PipedInputStream(pipeOut);

new Thread(() -> {
    try {
        pipeOut.write("Hello, this is the real content.".getBytes());
        pipeOut.close();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}).start();

byte[] buffer = new byte[8]; // deliberately smaller than the real message
int totalRead = 0;
int bytesThisRead;
try {
    while ((bytesThisRead = pipeIn.read(buffer)) != -1) {
        totalRead += bytesThisRead;
        System.out.println("Read " + bytesThisRead + " bytes this call, "
                + totalRead + " total so far");
    }
} catch (IOException e) {
    throw new RuntimeException(e);
}
```

Run it. Expected output — several separate reads, not one:

```
Read 8 bytes this call, 8 total so far
Read 8 bytes this call, 16 total so far
Read 8 bytes this call, 24 total so far
Read 8 bytes this call, 32 total so far
Read 1 bytes this call, 33 total so far
```

A deliberately small, 8-byte buffer proves the real point: one
`read()` call is never guaranteed to return everything, and the *only*
reason this loop knew when to stop was `-1` — a signal that only
appears here because this scratch file's own writer called
`pipeOut.close()`. Over a real socket, closing the stream to signal
"done" would also end the *entire connection* — fine for one message,
useless the moment a second file needs to follow over the same
connection later. This lesson's real code answers that with framing
instead: telling the receiver the exact byte count up front, so it
never has to rely on the stream closing at all.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — this lesson modifies
this project's own existing socket code (Lessons 10 and 11) rather
than porting from any external source. `DataOutputStream`/
`DataInputStream` are ordinary `java.io` classes, not Android-specific.

**Files affected:** `MainActivity.java` only — both `connectToDevice`
(Lesson 13's extracted version of Lesson 10's client code) and Lesson
11's server-side `AcceptThread` block are modified.

**Change type:** replace — the hardcoded one-line message on both
sides is replaced with real file framing and transfer.

**Location:** inside `connectToDevice`, replacing its
`out.write("Hello from Android\n".getBytes())` line and the read
immediately after it. Inside Lesson 11's block, replacing its
matching `in.read(buffer)`/`out.write(...)` pair.

**Dependencies:** a real file to send — this lesson first writes one
to this app's own private storage, so the demo works without needing
any external storage permission.

First, a small setup addition — write a real file to send, once,
before either socket side runs:

```java
File demoFile = new File(getFilesDir(), "demo.txt");                     // <- new
try (FileOutputStream setup = new FileOutputStream(demoFile)) {          // <- new
    setup.write("This is a real file, sent over Bluetooth.\n".repeat(50) // <- new
            .getBytes());                                                 // <- new
} catch (IOException e) {                                                 // <- new
    Log.d("BtFile", "Could not create demo file: " + e.getMessage());    // <- new
}                                                                          // <- new
```

Inside `connectToDevice`, the sending side — replacing Lesson 13's
`out.write("Hello from Android\n".getBytes())` and the read that
followed it:

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());   // <- new
File fileToSend = new File(getFilesDir(), "demo.txt");                   // <- new
out.writeLong(fileToSend.length());                                       // <- new
Log.d("BtFile", "Sending " + fileToSend.length() + " bytes");            // <- new

try (FileInputStream fileIn = new FileInputStream(fileToSend)) {         // <- new
    byte[] buffer = new byte[1024];                                       // <- new
    int bytesRead;                                                        // <- new
    while ((bytesRead = fileIn.read(buffer)) != -1) {                    // <- new
        out.write(buffer, 0, bytesRead);                                  // <- new
    }                                                                     // <- new
}                                                                          // <- new
Log.d("BtFile", "Send complete");                                        // <- new
```

Inside Lesson 11's accepting side, replacing its
`in.read(buffer)`/`String received = ...` pair:

```java
DataInputStream in = new DataInputStream(socket.getInputStream());       // <- new
long expectedBytes = in.readLong();                                       // <- new
Log.d("BtFile", "Expecting " + expectedBytes + " bytes");                // <- new

File receivedFile = new File(getFilesDir(), "received.txt");             // <- new
try (FileOutputStream fileOut = new FileOutputStream(receivedFile)) {    // <- new
    byte[] buffer = new byte[1024];                                       // <- new
    long totalReceived = 0;                                               // <- new
    while (totalReceived < expectedBytes) {                               // <- new
        int bytesRead = in.read(buffer, 0,                                // <- new
                (int) Math.min(buffer.length, expectedBytes - totalReceived)); // <- new
        if (bytesRead == -1) break;                                       // <- new
        fileOut.write(buffer, 0, bytesRead);                              // <- new
        totalReceived += bytesRead;                                       // <- new
    }                                                                     // <- new
    Log.d("BtFile", "Received " + totalReceived + " of " + expectedBytes + " bytes"); // <- new
}                                                                          // <- new
```

### Mechanical Walkthrough

- `new File(getFilesDir(), "demo.txt")` — **first appearance.**
  `getFilesDir()`, inherited from `Context`, returns this app's own
  private storage directory — files here need no storage permission
  at all, unlike shared/external storage.
- `new FileOutputStream(demoFile)` / `.write(...)` — **first
  appearance**, full treatment above.
- `"...".repeat(50)` — **first appearance of `String.repeat`.** Real
  Java, not Android-specific; used here purely to make the demo file
  large enough to genuinely exceed the 1024-byte buffer used below,
  so chunked reading is actually exercised, not merely written.
- `new DataOutputStream(socket.getOutputStream())` — **first
  appearance**, full treatment above (Objects and methods). Wraps,
  rather than replaces, the same `OutputStream` Lesson 10 already
  obtained.
- `out.writeLong(fileToSend.length())` — **first appearance**, full
  treatment above.
- `new FileInputStream(fileToSend)` / chunked `while ((bytesRead = fileIn.read(buffer)) != -1)` —
  **first appearance of this exact loop shape in real project code** —
  proven first, in isolation, by Step 1.
- `out.write(buffer, 0, bytesRead)` — **first appearance of this
  three-argument overload.** Writes only the first `bytesRead` bytes
  of `buffer`, not the whole array — the same "don't trust the full
  buffer, trust the actual count" discipline Lesson 10's
  `new String(buffer, 0, bytesRead)` already established for reading.
- `new DataInputStream(socket.getInputStream())` — **first
  appearance**, full treatment above.
- `in.readLong()` — **first appearance**, full treatment above.
- `while (totalReceived < expectedBytes)` — **first appearance of a
  length-bounded read loop**, this lesson's actual answer to Step 1's
  isolated problem — stopping not on `-1` (which would also mean the
  whole connection ended) but on having received the exact promised
  count.
- `(int) Math.min(buffer.length, expectedBytes - totalReceived)` —
  **first appearance.** Ensures the very last read of a file doesn't
  request more bytes than actually remain — without this, a read
  could legally wait for a full buffer's worth that will never arrive
  because the sender has nothing left to send.

### Execution Trace

**Same honesty note as the rest of this arc:** predicted output,
verified against `java.io`'s own documented behavior, not a captured
run.

1. `demo.txt` is written once — predict its real size:
   `"This is a real file, sent over Bluetooth.\n"` is 43 bytes; ×50 =
   2150 bytes.
2. The connecting phone sends `2150` via `writeLong`, then the file's
   real bytes, in chunks of up to 1024 — predict three real `write`
   calls inside the loop (1024, then 1024, then the remaining 102),
   though `DataOutputStream` may itself buffer or split these
   further at the OS level; the *logical* chunk count from this
   lesson's own loop is three.
3. The accepting phone's `readLong()` returns `2150`. Its own loop
   runs until `totalReceived` reaches exactly `2150` — predict this
   also takes multiple `read` calls, not necessarily aligned to the
   same three-chunk boundary the sender used, since TCP-like stream
   protocols never guarantee reads and writes line up one-to-one.
4. Predict the final log: `"Received 2150 of 2150 bytes"` — and a
   real file, `received.txt`, sitting in the accepting phone's own
   private storage, byte-for-byte identical to `demo.txt` on the
   sending phone.

### CS Lens

**Length-prefixing (framing) is exactly how nearly every real network
protocol built on top of a raw byte stream solves this same problem**
— recognized in: HTTP's `Content-Length` header, telling a client
exactly how many body bytes to read before the response is complete;
gRPC and Protocol Buffers' own length-delimited message framing; even
the file-manifest headers inside a `.zip` archive, stating each
entry's real size before its compressed bytes. The underlying
constraint is identical everywhere it shows up: a raw stream of bytes,
by itself, carries no boundaries at all — every format built on top of
one has to invent its own way of saying "this much, then stop."

### SE Lens

**Why send the length as a fixed 8-byte `long` specifically, rather
than, say, a human-readable number followed by a newline?** A fixed
8-byte encoding is trivial to read correctly: read exactly 8 bytes,
always, no ambiguity, no scanning for a delimiter that might
accidentally appear inside binary file data itself. A newline-terminated
text number would break the instant a real file's own bytes happened
to contain a newline before the actual intended delimiter — a real,
recurring bug family in hand-rolled binary protocols. The honest cost
of `DataOutputStream`/`DataInputStream`'s fixed-width approach: it
caps a single transfer at whatever a `long` can represent (far larger
than any realistic file for this project, so not a practical concern
here) and requires both sides to agree on the exact same wrapper type
— which they do, simply by both being this same project's own code.

---

## Connect the Pieces

`File.length()`, sent via `DataOutputStream.writeLong` before a single
byte of real content follows, is this lesson's entire answer to Step
1's isolated problem: a receiver that knows, in advance, exactly how
much to expect never has to guess where a message ends. Both sides'
chunked read/write loops — bounded by a fixed buffer size on the way
out, and by the promised total on the way in — handle a file of any
realistic size the same way, one bounded piece at a time, exactly the
behavior Step 1 first observed with a deliberately tiny 8-byte buffer
before any file or socket was involved.

## What Breaks Without This

Skip sending the length, and have the receiving side just read until
the stream naturally ends:

```java
// out.writeLong(fileToSend.length()); // <- omitted
```

```java
// no expectedBytes at all — just read until -1, the way Lesson 11 did
while ((bytesRead = in.read(buffer)) != -1) {
    fileOut.write(buffer, 0, bytesRead);
}
```

Predicted result: this actually still works correctly for a *single*
file transfer, because the sender's socket eventually closes and
produces a real `-1` — but attempt to send a *second* file over the
same still-open connection afterward, and the receiver's `-1`-based
loop has no way to tell "first file just ended" apart from "connection
just ended," because both look identical from its side. Restore the
length-prefixing when done, and confirm for yourself that only the
framed version can support more than one transfer per connection.

## Exercises

1. Change `demo.txt`'s content to something larger than the 1024-byte
   buffer by a much wider margin (repeat the string 1000 times
   instead of 50) and confirm, from the real logged chunk counts, that
   more reads/writes happen — proportionally, not by a fixed number
   this lesson's own prediction assumed.
2. After a successful transfer, open both `demo.txt` and
   `received.txt` (via `adb shell run-as <package> cat
   files/demo.txt`, or by adding a quick byte-for-byte comparison in
   code) and confirm they are genuinely identical, not merely the same
   length.
3. Deliberately send the wrong length — call
   `out.writeLong(fileToSend.length() - 10)` on purpose. Predict, then
   confirm, what the receiving side actually does: does it stop 10
   bytes early, hang waiting for bytes that never come, or something
   else?

## Definition of Done

- [ ] You ran Step 1's scratch file and saw a real message arrive
      across several small reads, not one, with `-1` as the only
      signal that it was actually finished.
- [ ] You ran the real Step 2 code between two real, paired phones and
      confirmed a real file transferred completely — matching sizes,
      matching content.
- [ ] You can explain, without looking, why relying on `-1` alone
      would break the moment a connection needs to carry more than one
      file.
- [ ] You can explain why the length is sent as a fixed 8-byte value
      rather than a human-readable, delimiter-terminated one.
- [ ] You broke the "no length prefix" case on purpose, confirmed it
      still works for one file, and understood exactly why it wouldn't
      for two.
- [ ] Commit: the file-writing setup, and the reframed send/receive
      code on both sides, in `MainActivity.java`.
