# Junior to Senior — T1·L4 — Node.js File I/O and Modules

**Prerequisites:** T1·L3 (Discriminated Unions and Type Guards). You have a
solid TypeScript foundation. This lesson covers reading and writing files in
Node.js and how modules work — the foundation for the CSV parsing project.

**What this lab adds:**
- CommonJS vs ESM — what each is, how to recognise them, when each is used
- Reading files synchronously and asynchronously
- Writing files and creating directories
- Module resolution — how Node.js finds a file when you `import` it
- Barrel files and re-exports — organising a project's public API

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. What is the difference between `fs.readFileSync` and `fs.promises.readFile`?
>    When would you prefer each?
> 2. A Node.js project has `"type": "module"` in `package.json`. What changes
>    about how you import other files?
> 3. You run `import './utils'` and get `Cannot find module './utils'`. What
>    are the three most likely causes?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contact file manager that reads, writes, and organises contact data in files:

```
$ npx ts-node file-io.ts

--- Reading Files ---
Read contacts.csv: 3 lines
Line 1: Alice,alice@example.com,London

--- Writing Files ---
Written 3 contacts to output/contacts-backup.csv

--- Directory Operations ---
Created output/ directory (if not exists)
Listed output/: [ 'contacts-backup.csv' ]

--- Module Resolution ---
Imported formatContact from ./utils/format
Formatted: Alice <alice@example.com> — London
```

---

### Concept: CommonJS vs ESM — Two Module Systems

**What it is:** JavaScript has two module systems. CommonJS (CJS) uses `require()`
and `module.exports`. ES Modules (ESM) use `import` and `export`. Node.js
supports both; which one runs depends on the project configuration.

**CommonJS (CJS) — older, synchronous:**
```js
// Loading a module:
const fs = require('fs');
const { join } = require('path');

// Exporting:
module.exports = { myFunction };
// or:
module.exports.myFunction = myFunction;
```

**ES Modules (ESM) — modern, static:**
```ts
// Loading a module:
import fs from 'fs';
import { join } from 'path';

// Exporting:
export function myFunction() { ... }
export default myFunction;
```

**How to tell which system a project uses:**

| Signal | Module system |
|---|---|
| `"type": "module"` in `package.json` | ESM |
| `"type": "commonjs"` or no `type` field | CJS |
| Files ending in `.mjs` | Always ESM |
| Files ending in `.cjs` | Always CJS |
| `tsconfig.json` `"module": "ESNext"` or `"module": "NodeNext"` | ESM |
| `tsconfig.json` `"module": "CommonJS"` | CJS |

**What it hides:** The module system hides the mechanism by which JavaScript
finds and loads other files. CJS loads synchronously at `require()` time.
ESM is parsed and linked before any code runs — imports are hoisted and static.

The invariant: within a single module system, imports are resolved once and
cached. The second `require('fs')` returns the same object as the first.

**Canonical example:** CJS is like calling directory assistance every time you
need a phone number — the lookup happens when you call. ESM is like printing
all your contacts in an address book before you leave the house — all lookups
happen before any calls are made.

**Smallest possible example:**
```ts
// ESM (the modern standard — what you use in this series):
import { readFileSync } from 'fs';           // named import
import path from 'path';                      // default import
import type { Stats } from 'fs';             // type-only import (erased at runtime)

export function readContact(filePath: string): string {
  return readFileSync(filePath, 'utf-8');
}

export default readContact;                   // default export
```

**You will see this again in:** Every Node.js project, every frontend project.
The module system determines whether you write `require` or `import`. In this
series, all TypeScript code uses ESM (`import`/`export`).

**Watch for:** In ESM, relative imports must include the file extension in some
configurations: `import './utils.js'` not `import './utils'`. TypeScript with
`moduleResolution: 'bundler'` relaxes this rule. Know which you are using.

---

## Step 1 — Set Up the Project

Create the project structure:

```bash
mkdir contact-files
cd contact-files
npm init -y
npm install -D typescript ts-node @types/node
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Create `contacts.csv` in the project root:

```
Alice,alice@example.com,London
Bob,bob@example.com,Paris
Charlie,charlie@example.com,Berlin
```

Create `file-io.ts`:

```ts
import * as fs   from 'fs';
import * as path from 'path';
```

### SAVE AND TRY

```bash
npx ts-node file-io.ts
```

Expected: no output, no errors — just imports confirmed working.

**Change something:** Change `"module": "CommonJS"` to `"module": "ESNext"` in
tsconfig and run again. You will likely get a module resolution error. Change it back.
This shows how the module setting directly affects which syntax works.

---

### Concept: Reading Files — Sync vs Async

**What it is:** Node.js provides two styles of file reading:
- Synchronous (`readFileSync`) — blocks execution until the file is fully read
- Asynchronous (`fs.promises.readFile`) — returns a Promise; other code can run while waiting

**When to use each:**

| Use synchronous | Use asynchronous |
|---|---|
| CLI scripts that run once and exit | Servers handling multiple requests |
| Application startup (before any requests arrive) | Any code that runs in a loop |
| Test fixtures | Reading files in parallel |
| Simple one-shot tools | Any time other operations can proceed |

**The problem with sync in servers:**

```ts
// Synchronous in a web server — blocks ALL requests:
app.get('/contacts', (req, res) => {
  const data = fs.readFileSync('contacts.csv'); // blocks the server for everyone!
  res.send(data);
});
```

Every request to this endpoint blocks the entire Node.js event loop.
While the file is being read, no other request can be processed.

**The solution — async for servers:**

```ts
app.get('/contacts', async (req, res) => {
  const data = await fs.promises.readFile('contacts.csv', 'utf-8'); // non-blocking
  res.send(data);
});
```

**What it hides:** Async file reading hides the waiting. While Node.js waits
for the OS to read the file, it processes other events (other requests, timers,
etc.). The `await` suspends the current handler without blocking anything else.

**Canonical example:** Synchronous is like boiling water and standing at the
stove watching it — nothing else gets done until the water boils. Asynchronous
is like starting the kettle and going back to work — when it boils, you are notified.

**Smallest possible example:**
```ts
import { readFileSync } from 'fs';
import { readFile }     from 'fs/promises';

// Synchronous — blocks:
const data1 = readFileSync('file.txt', 'utf-8');

// Async — does not block:
const data2 = await readFile('file.txt', 'utf-8');
```

**You will see this again in:** Every file operation in Node.js. FastAPI's Python
equivalent is `open()` (sync) vs `aiofiles.open()` (async).

**Watch for:** `readFileSync` throws if the file does not exist. `readFile`
(async) rejects the Promise. Always handle `ENOENT` (file not found) errors.

---

## Step 2 — Reading Files

Add to `file-io.ts`:

```ts
console.log('--- Reading Files ---');

// __dirname is the directory of the current file (CommonJS):
const csvPath = path.join(__dirname, 'contacts.csv');

// Synchronous — fine for a startup script:
const rawContent: string = fs.readFileSync(csvPath, 'utf-8');
const lines: string[] = rawContent.trim().split('\n');

console.log(`Read contacts.csv: ${lines.length} lines`);
console.log(`Line 1: ${lines[0]}`);

// Async alternative — better for servers:
async function readContactsAsync(filePath: string): Promise<string[]> {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return content.trim().split('\n');
}

// Call the async function (top-level await requires ESM; wrap in async for CJS):
readContactsAsync(csvPath).then(asyncLines => {
  console.log(`Async read: ${asyncLines.length} lines confirmed`);
});
```

### SAVE AND TRY

```bash
npx ts-node file-io.ts
```

Expected:
```
--- Reading Files ---
Read contacts.csv: 3 lines
Line 1: Alice,alice@example.com,London
Async read: 3 lines confirmed
```

**Change something:** Change `csvPath` to point to a file that does not exist:
`path.join(__dirname, 'missing.csv')`. Run again. Expected: `Error: ENOENT: no
such file or directory`. Wrap the `readFileSync` in `try/catch` to handle it
gracefully:
```ts
try {
  const data = fs.readFileSync(csvPath, 'utf-8');
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
    console.log('File not found — creating empty list');
  }
}
```

---

### Concept: Writing Files and Creating Directories

**What it is:** `writeFileSync` and `fs.promises.writeFile` write a string or
buffer to a file, creating it if it does not exist or overwriting it if it does.
`mkdirSync` and `fs.promises.mkdir` create directories.

**The key options:**

```ts
// Create parent directories automatically:
fs.mkdirSync('output/contacts', { recursive: true });
// 'recursive: true' = create output/ first if needed, then contacts/
// Without it: throws if 'output/' does not exist

// Write file:
fs.writeFileSync('output/data.csv', content, 'utf-8');

// Append to existing file (does not overwrite):
fs.appendFileSync('output/log.txt', newLine + '\n', 'utf-8');
```

**What it hides:** `recursive: true` hides the need to check whether each
parent directory exists before creating it. Without it, you would call `mkdir`
on each parent in sequence.

**Canonical example:** Writing to `output/contacts/backup.csv` without `recursive: true`
is like trying to put a letter in a drawer inside a cabinet that does not exist.
`recursive: true` builds the cabinet and the drawer for you before placing the letter.

---

## Step 3 — Writing Files

```ts
console.log('\n--- Writing Files ---');

// Create the output directory (recursive: true creates parents as needed):
const outputDir = path.join(__dirname, 'output');
fs.mkdirSync(outputDir, { recursive: true });  // no error if already exists

// Write a backup CSV:
const backupPath = path.join(outputDir, 'contacts-backup.csv');
fs.writeFileSync(backupPath, lines.join('\n') + '\n', 'utf-8');

console.log(`Written ${lines.length} contacts to output/contacts-backup.csv`);

// List files in the output directory:
const outputFiles = fs.readdirSync(outputDir);
console.log('Listed output/:', outputFiles);
```

### SAVE AND TRY

```bash
npx ts-node file-io.ts
```

Expected:
```
--- Writing Files ---
Written 3 contacts to output/contacts-backup.csv

Listed output/: [ 'contacts-backup.csv' ]
```

**Change something:** Run the script twice. Does the file grow? No — `writeFileSync`
overwrites. Change it to `appendFileSync(backupPath, lines[0] + '\n', 'utf-8')`.
Run twice. The first line is now appended — the file has 4 lines (the backup content
plus one appended line). Switch back to `writeFileSync`.

---

### Concept: Module Resolution and Barrel Files

**What it is:** Module resolution is the algorithm Node.js uses to find the
file behind an `import` statement. A barrel file (`index.ts`) re-exports
from multiple modules, providing a clean single import point.

**Module resolution rules (CommonJS, simplified):**

```
import './utils'      → look for ./utils.ts, ./utils/index.ts
import 'lodash'       → look in node_modules/lodash
import '../shared'    → look for ../shared.ts, ../shared/index.ts
```

**Barrel files — organising exports:**

```ts
// utils/format.ts:
export function formatContact(c: Contact): string { ... }

// utils/validate.ts:
export function validateEmail(email: string): boolean { ... }

// utils/index.ts (the barrel):
export { formatContact } from './format';
export { validateEmail } from './validate';

// Consumer:
import { formatContact, validateEmail } from './utils';
// ↑ One import, many modules — the barrel provides the public API
```

**What it hides:** The barrel file hides the internal structure of the `utils`
folder. Consumers do not know (or care) whether `formatContact` is in `format.ts`
or `contact-formatting.ts`. Renaming the file does not break consumers.

The invariant: the barrel is the public API. Only what the barrel re-exports
is part of the public interface. Internal files can change freely.

**Canonical example:** A barrel file is like a store's catalogue. Customers
order from the catalogue (the barrel) — they do not care which warehouse shelf
(which file) holds the item. The catalogue can reorganise the shelves without
reprinting; customers always order the same way.

**You will see this again in:** Every well-organised TypeScript project.
React component libraries always use barrel files: `import { Button, Card, Modal }
from 'my-ui-library'`. The library's `index.ts` re-exports everything.

**Watch for:** Barrel files can cause circular import problems in large codebases.
If `utils/format.ts` imports from `utils/validate.ts` and both are re-exported
from `utils/index.ts`, importing `index.ts` from within the utils folder creates
a cycle. Keep barrel files thin — re-exports only, no logic.

---

## Step 4 — Create a Utility Module with a Barrel

Create the directory structure:

```bash
mkdir utils
```

Create `utils/format.ts`:

```ts
export interface Contact {
  name:  string;
  email: string;
  city:  string;
}

// Parse a CSV line into a Contact:
export function parseContactLine(line: string): Contact {
  const [name, email, city] = line.split(',').map(s => s.trim());
  return { name, email, city };
}

// Format a Contact for display:
export function formatContact(contact: Contact): string {
  return `${contact.name} <${contact.email}> — ${contact.city}`;
}
```

Create `utils/index.ts` (the barrel):

```ts
// Re-export everything from each module:
export { parseContactLine, formatContact } from './format';
export type { Contact } from './format';
```

Add to `file-io.ts`:

```ts
console.log('\n--- Module Resolution ---');

// Import from the barrel — the directory, not the specific file:
import { parseContactLine, formatContact, Contact } from './utils';

const contacts: Contact[] = lines.map(parseContactLine);
console.log(`Imported formatContact from ./utils/format`);
console.log('Formatted:', formatContact(contacts[0]));
```

### SAVE AND TRY

```bash
npx ts-node file-io.ts
```

Expected:
```
--- Module Resolution ---
Imported formatContact from ./utils/format
Formatted: Alice <alice@example.com> — London
```

**Change something:** Import directly from the file instead of the barrel:
`import { formatContact } from './utils/format'`. Both work — the barrel
just provides a cleaner single import point. Now rename `utils/format.ts`
to `utils/contact-format.ts`. The barrel import breaks (you need to update
the barrel's re-export). The direct import also breaks. This shows that the
barrel consolidates the change to one place: the barrel itself.

---

## 🎯 Challenge: Config File Reader

**You know:** File reading, writing, module resolution, type guards.

**Task:** Write a `loadConfig<T>(filePath: string, validator: (x: unknown) => x is T): T`
function that:
1. Reads a JSON file
2. Parses it with `JSON.parse` (returns `unknown`)
3. Validates the result using the provided type predicate
4. Returns the typed config or throws a descriptive error

```ts
interface AppConfig {
  port:       number;
  dbPath:     string;
  maxRetries: number;
}

function isAppConfig(value: unknown): value is AppConfig {
  // your implementation
}

const config = loadConfig<AppConfig>('./app.config.json', isAppConfig);
console.log(config.port);  // TypeScript knows this is number
```

**Requirements:**
- `loadConfig` must use `fs.readFileSync` (synchronous — config loads at startup)
- The error message must say which file failed and why
- `isAppConfig` must check each field's type, not just presence

**Starting file `app.config.json`:**
```json
{ "port": 3000, "dbPath": "./data/contacts.db", "maxRetries": 3 }
```

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
import * as fs from 'fs';

function loadConfig<T>(
  filePath: string,
  validator: (x: unknown) => x is T,
): T {
  // Read the file — throw with a clear message if it does not exist:
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch {
    throw new Error(`Config file not found: ${filePath}`);
  }

  // Parse JSON — throw with a clear message if malformed:
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Config file is not valid JSON: ${filePath}`);
  }

  // Validate shape:
  if (!validator(parsed)) {
    throw new Error(`Config file has unexpected shape: ${filePath}`);
  }

  return parsed;
}

function isAppConfig(value: unknown): value is AppConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).port       === 'number' &&
    typeof (value as Record<string, unknown>).dbPath     === 'string' &&
    typeof (value as Record<string, unknown>).maxRetries === 'number'
  );
}

interface AppConfig { port: number; dbPath: string; maxRetries: number }

const config = loadConfig<AppConfig>('./app.config.json', isAppConfig);
console.log('Port:', config.port);       // number — TypeScript knows
console.log('DB path:', config.dbPath);  // string — TypeScript knows
```

**Key insight:** `loadConfig` is generic but validated at runtime. TypeScript
trusts the `validator` predicate — after it returns `true`, the return type
is `T` with full type safety. The three `try/catch` blocks provide specific
error messages for each failure mode: file not found, invalid JSON, wrong shape.
This pattern is the correct way to load typed configuration from files.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| CJS vs ESM | Check `package.json "type"` field | Determines which syntax works |
| Sync read works | `readFileSync('contacts.csv', 'utf-8')` | File content as string |
| Async read works | `await readFile('contacts.csv', 'utf-8')` | Same content |
| Directory created | `mkdirSync('output', { recursive: true })` twice | No error on second call |
| Barrel imports | `import { formatContact } from './utils'` | Works — resolves to barrel |
| File not found | `readFileSync('missing.csv', 'utf-8')` | Throws ENOENT |

---

## Quick Check Answers

**1. `readFileSync` vs `fs.promises.readFile` — when to prefer each?**

`readFileSync` blocks Node.js execution until the file is fully read.
Use it for scripts that run once and exit (CLI tools, startup config loading,
test fixtures) where blocking is acceptable. `fs.promises.readFile` (async)
returns a Promise and does not block. Node.js can handle other events while
waiting for the OS to read the file. Use it in servers, anywhere the code runs
in a loop, and any time multiple files should be read in parallel
(`Promise.all([readFile(a), readFile(b)])`). The rule: if blocking would affect
other users or operations, use async.

**2. What changes with `"type": "module"` in `package.json`?**

All `.js` files in the project are treated as ES Modules instead of CommonJS.
This means: (1) `require()` no longer works — use `import` instead,
(2) `module.exports` no longer works — use `export` instead,
(3) Relative imports in `.js` files must include the extension: `import './utils.js'`
not `import './utils'`, (4) `__dirname` and `__filename` are not available —
use `import.meta.url` and `path.dirname(fileURLToPath(import.meta.url))`.
TypeScript's behaviour with ESM also changes — the tsconfig `"module"` field
must match (`"ESNext"` or `"NodeNext"`).

**3. Three causes of `Cannot find module './utils'`?**

1. The file does not exist at that relative path — check spelling and location
2. The file extension is missing and the module system requires it (ESM without
   `moduleResolution: 'bundler'`)
3. A TypeScript compilation issue — the `.ts` file exists but TypeScript cannot
   find its type declarations (check `tsconfig.json`'s `include` and `paths`)
   A fourth common cause: circular imports that cause a module to be partially
   loaded when referenced.
