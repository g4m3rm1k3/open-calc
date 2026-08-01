# SE Masterclass — LAB-42 — Terminal Emulator

**Language: TypeScript (Browser)** — same module as LAB-37–41.

**Prerequisites:** LAB-09 (dispatch tables — commands are dispatched exactly like operators), LAB-10 (tokenizing — splitting a command line into arguments), LAB-05 (stacks — command history navigation).

**What this lab adds:**
- A REPL loop in the browser: read a line, evaluate it as a command, print output, repeat
- Command-line tokenizing: splitting `echo "hello world"` into `['echo', 'hello world']`, respecting quotes
- A command registry (dispatch table) for built-in commands
- Command history navigation with Up/Down arrows — a stack-like structure, browsed with an index pointer

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `echo hello world` should split into `['hello', 'world']` as two separate arguments, but `echo "hello world"` should split into ONE argument, `'hello world'`. What does the quoting change about the SPLITTING rule?
> 2. A REPL is "Read, Evaluate, Print, Loop." Which of Phase 1's calculator pipeline stages does the "Evaluate" step reuse?
> 3. Pressing Up-arrow recalls the PREVIOUS command; pressing it again recalls the one before THAT. What data structure naturally supports "step backward through a sequence, then forward again"?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows a terminal-style UI:

```
$ help
Available commands: help, echo, clear, history

$ echo hello world
hello world

$ echo "hello world"
hello world

$ history
1: help
2: echo hello world
3: echo "hello world"

$ unknowncommand
unknowncommand: command not found
```

Pressing Up-arrow recalls previous commands; Down-arrow moves forward again.

---

### Concept: A REPL Is Read-Evaluate-Print-Loop

**What it is:** Every terminal, and every language REPL (`node`, `python`), follows the same 4-step loop: READ one line of input, EVALUATE it (figure out what it means and do it), PRINT the result, and LOOP back to read the next line. This lab builds a browser-based REPL for a small, made-up command set.

**Project Application (The "Why" here):** "Evaluate" here is exactly LAB-09's dispatch table (look up the command name, call the matching function) — a terminal command dispatcher and a calculator's operator dispatcher are the SAME pattern, just with different vocabularies.

---

## Step 1 — The Terminal UI Shell

```ts
// main.ts
const app = document.querySelector<HTMLDivElement>('#app')!
const terminal = document.createElement('div')
terminal.style.fontFamily = 'monospace'
terminal.style.background = '#111'
terminal.style.color = '#0f0'
terminal.style.padding = '8px'
terminal.style.height = '300px'
terminal.style.overflowY = 'auto'
app.appendChild(terminal)

const output = document.createElement('div')
const inputLine = document.createElement('div')
const prompt = document.createElement('span')
prompt.textContent = '$ '
const input = document.createElement('input')
input.style.background = 'transparent'
input.style.color = '#0f0'
input.style.border = 'none'
input.style.outline = 'none'
input.style.fontFamily = 'monospace'
input.style.width = '80%'

inputLine.append(prompt, input)
terminal.append(output, inputLine)
input.focus()

function print(text: string): void {
  const line = document.createElement('div')
  line.textContent = text
  output.appendChild(line)
  terminal.scrollTop = terminal.scrollHeight          // auto-scroll to the bottom, like a real terminal
}
```

### SAVE AND TRY

Save. Confirm a dark terminal-styled box with a `$` prompt and a focused text input appears in the browser.

---

## Step 2 — Tokenize the Command Line (Respecting Quotes)

```ts
// command-lexer.ts
export function tokenizeCommand(line: string): string[] {
  const tokens: string[] = []
  let pos = 0

  while (pos < line.length) {
    if (line[pos] === ' ') { pos++; continue }

    if (line[pos] === '"') {                          // ← add: quoted argument — treat everything until the NEXT quote as ONE token
      pos++
      const start = pos
      while (pos < line.length && line[pos] !== '"') pos++
      tokens.push(line.slice(start, pos))
      pos++                                              // skip the closing quote
      continue
    }

    const start = pos                                   // ← add: unquoted argument — stop at the next space
    while (pos < line.length && line[pos] !== ' ') pos++
    tokens.push(line.slice(start, pos))
  }
  return tokens
}
```

Add to `main.ts`:

```ts
import { tokenizeCommand } from './command-lexer'

console.log(tokenizeCommand('echo hello world'))          // ['echo', 'hello', 'world']
console.log(tokenizeCommand('echo "hello world"'))         // ['echo', 'hello world']
```

### SAVE AND TRY

Check DevTools console.

**Expected:**
```
[ 'echo', 'hello', 'world' ]
[ 'echo', 'hello world' ]
```

**Confirm the quoting changes tokenization, not just display:** WITHOUT quotes, a space ALWAYS ends a token — `hello` and `world` become TWO separate array entries. WITH quotes, the tokenizer switches into a different scanning mode (LAB-10's sliding window, again) that ignores spaces entirely until it finds the CLOSING quote — producing ONE token containing an internal space. This is exactly LAB-10's "classify the current character, decide what to consume" pattern, with quotes as a special character class.

---

## Step 3 — A Command Registry (Dispatch Table)

```ts
// commands.ts
type CommandFn = (args: string[]) => string

const history: string[] = []

const commands: Record<string, CommandFn> = {                // ← add: LAB-09's dispatch table, once more
  help: () => `Available commands: ${Object.keys(commands).join(', ')}`,
  echo: (args) => args.join(' '),
  clear: () => '\x00CLEAR\x00',                                // a sentinel value main.ts checks for
  history: () => history.map((cmd, i) => `${i + 1}: ${cmd}`).join('\n'),
}

export function runCommand(line: string, tokenize: (s: string) => string[]): string {
  history.push(line)
  const [name, ...args] = tokenize(line)
  const fn = commands[name]
  if (!fn) return `${name}: command not found`               // LAB-09's boundary validation, once more
  return fn(args)
}

export function getHistory(): string[] {
  return history
}
```

Add to `main.ts`:

```ts
import { runCommand } from './commands'

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const line = input.value
    print(`$ ${line}`)
    const result = runCommand(line, tokenizeCommand)
    if (result === '\x00CLEAR\x00') {
      output.innerHTML = ''
    } else if (result) {
      print(result)
    }
    input.value = ''
  }
})
```

### SAVE AND TRY

Save. In the browser terminal, type `help`, press Enter. Type `echo hello world`. Type `echo "hello world"`. Type `history`. Type `nonsense`.

**Expected terminal output:**
```
$ help
Available commands: help, echo, clear, history

$ echo hello world
hello world

$ echo "hello world"
hello world

$ history
1: help
2: echo hello world
3: echo "hello world"

$ unknowncommand
unknowncommand: command not found
```

**Confirm the dispatch mechanism directly:** `commands[name]` is an O(1) lookup (LAB-08), exactly like `operators[op]` in LAB-09 — adding a NEW command means adding ONE new entry to the `commands` object, never touching `runCommand`'s dispatch logic itself.

---

## Step 4 — Command History Navigation (Up/Down Arrows)

```ts
// Add to main.ts:
let historyIndex = -1     // -1 means "not currently browsing history — at the live input"

input.addEventListener('keydown', (e) => {
  const hist = getHistory()

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (historyIndex < hist.length - 1) {
      historyIndex++
      input.value = hist[hist.length - 1 - historyIndex]    // walk BACKWARD from the most recent
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (historyIndex > 0) {
      historyIndex--
      input.value = hist[hist.length - 1 - historyIndex]
    } else if (historyIndex === 0) {
      historyIndex = -1
      input.value = ''                                        // walked all the way back to a fresh line
    }
  }
})
```

(Merge this into the SAME `keydown` listener as Step 3, alongside the `Enter` handling — and reset `historyIndex = -1` whenever `Enter` runs a new command.)

### SAVE AND TRY

Save. Run a few commands (`help`, `echo test`, `history`). Press Up-arrow repeatedly — confirm you cycle BACKWARD through your command history, most recent first. Press Down-arrow — confirm you walk FORWARD again, ending at an empty line.

**Confirm the mechanism:** `historyIndex` acts as a POINTER into the history array, similar in spirit to LAB-24's undo stack — except here, both "Up" and "Down" simply MOVE the pointer (never mutating the history itself), while LAB-24's undo/redo actually MOVED commands between two stacks. This is a read-only NAVIGATION over a fixed, append-only log, closer to how you'd page through LAB-23's replay log (Step 5/Challenge there) than to undo/redo's structural mutation.

---

## 🎯 Challenge: A Filesystem-Aware `ls` Command

**You know:** LAB-41's `FileNode`/`FolderNode` tree already represents a file system. A `ls` command can walk it.

**Task:** Add an `ls` command that lists the names of the CURRENT folder's direct children (start at the root of LAB-41's `sampleTree` for simplicity — a full `cd`-aware version would track a "current folder" pointer, similar to this lab's `historyIndex` tracking a position).

<details>
<summary>▶ Show Solution</summary>

```ts
import { sampleTree } from './file-tree'   // from LAB-41

commands.ls = () => sampleTree.children.map(child =>
  child.type === 'folder' ? `${child.name}/` : child.name
).join('  ')
```

**Key insight:** `ls` doesn't need ANY new architecture — it's just a new entry in the SAME `commands` dispatch table (LAB-18's OCP: extension without modification), whose implementation happens to walk LAB-41's tree instead of doing simple string formatting like `echo`. This is exactly the kind of composability this curriculum has been building toward: LAB-41's data model and LAB-42's command dispatcher combine with zero friction, because both were built on the SAME small set of well-understood patterns (trees, dispatch tables) from the start.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `tokenizeCommand` | Bash's own command-line parsing (quoting, escaping — bash's rules are MORE elaborate, but the same idea) |
| `commands` dispatch table | Every shell's built-in command table |
| Up/Down history navigation | Every terminal emulator (bash's `readline`, zsh) |
| `\x00CLEAR\x00` sentinel | A simplified stand-in for how real shells signal "special," non-printable results |

**Where you will see this again:** LAB-96 (Shell) builds a REAL shell — this lab's browser-based toy version, generalized to actually spawn OS processes, redirect I/O, and pipe commands together.

---

## Final Check

| Feature | How to verify |
|---|---|
| The terminal UI accepts input and displays a scrolling output history | Step 1 |
| Unquoted arguments split on spaces; quoted arguments preserve internal spaces | Step 2 |
| `help`, `echo`, `clear`, `history` all work correctly via the dispatch table | Step 3 |
| An unknown command produces a clear "command not found" message | Step 3 |
| Up/Down arrows correctly navigate command history, ending back at a fresh line | Step 4 |
| A filesystem-aware `ls` command works using LAB-41's tree, with zero architecture changes | Challenge |

---

## Quick Check Answers

**1. What does quoting change about the splitting rule?**

Without quotes, EVERY space is a token boundary — `hello world` becomes two tokens. WITH quotes, the tokenizer enters a different scanning mode (Step 2) that treats spaces as ORDINARY characters until it reaches the matching closing quote, producing ONE token that happens to CONTAIN a space. This is the same "classify the current character, then decide how much to consume" logic from LAB-10, just with an added rule for quote characters specifically.

**2. Which Phase 1 pipeline stage does "Evaluate" reuse?**

The dispatch/evaluation stage from LAB-09 (and generalized in LAB-12) — `runCommand` looks up `commands[name]` and calls it, exactly like LAB-09's `applyOperator` looked up `operators[op]` and called it. "Evaluate" in a REPL is fundamentally "look up what this input means, and execute the corresponding logic" — the SAME shape regardless of whether the input is a math operator or a terminal command name.

**3. What data structure supports "step backward, then forward again" through a sequence?**

An array combined with an INDEX POINTER that moves within its bounds (Step 4's `historyIndex`) — rather than a true stack (LAB-05), which only supports removing from ONE end, this needs BIDIRECTIONAL movement through a FIXED sequence, which a plain array with a movable index handles naturally: incrementing the index walks backward through history (toward older commands), decrementing walks forward again (toward the live input), without ever actually removing anything from the underlying array.

---

*Next: [LAB-43 — IDE Layout System](LAB-43-ide-layout-system.md) — TypeScript (Browser), same module*
