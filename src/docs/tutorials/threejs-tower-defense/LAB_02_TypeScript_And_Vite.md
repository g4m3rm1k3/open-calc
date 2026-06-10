# TypeScript Tower Defense — LAB 02 — TypeScript and Vite

**Prerequisites:** Lab 01 complete. You have `index.html` with a rotating Three.js cube working in Chrome.

**What this lab adds:**
- A proper project structure — code in its own files, not inline in HTML
- TypeScript — a version of JavaScript that checks your types before running
- Vite — a tool that watches your files and refreshes the browser automatically on every save
- Your first TypeScript types and your first interface

**Time:** 60–90 minutes. The tool installation steps are one-time only.

---

## What You Will Build

By the end of this lab, your rotating cube from Lab 01 still looks exactly the same in the browser:

```
┌─────────────────────────────────────────────┐
│  Grid Commander                   (tab title)│
├─────────────────────────────────────────────┤
│                                             │
│              ┌──────────┐                  │
│             /│  (shaded)│\                 │
│            / │          │ \                │
│           │  └──────────┘  │               │
│           (same rotating cube)              │
│                                             │
└─────────────────────────────────────────────┘
```

The visible result is identical to Lab 01. What changes is everything *underneath*:

- The code now lives in `src/main.ts` — a TypeScript file — not inside `index.html`
- Vite runs a development server that refreshes the browser instantly on every save
- TypeScript checks your code for type mistakes before it runs
- The configuration values are grouped into a typed interface called `GameConfig`

Lab 02 does not add features. It builds the foundation that every future lab depends on.

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Lab 01 our JavaScript code was written directly inside the HTML file in a `<script>` tag. What problem do you think that causes as the code grows longer?
> 2. What do you think "type checking" means? What kind of mistake do you think it could catch?
> 3. Every time you saved in Lab 01 you had to manually refresh the browser. What would have to happen automatically to remove that step?
>
> *(Answers at the end of this lab)*

---

## Before You Start — Install Node.js

Node.js is required before any other step in this lab. This is a one-time installation — you will not repeat it in future labs.

---

### Concept: What Is Node.js?

**What it is:** A program that runs JavaScript outside the browser. Browsers run JavaScript inside a web page. Node.js runs JavaScript directly on your computer — from the terminal.

**Why you need it:**
The tools you will use for the rest of this series — Vite, TypeScript, test runners, servers — are all JavaScript programs that run on Node.js. Without Node.js they cannot run.

**npm comes with it:**
When you install Node.js, it also installs npm — the Node Package Manager. npm is the tool you use to install libraries (like Three.js) and run development tools (like Vite). You will use npm in every lab from here onwards.

**Node.js does not run in the browser:**
When you run `node somefile.js` in the terminal, your browser is not involved. Node.js is its own runtime. The browser and Node.js are two separate environments that both understand JavaScript but have different built-in capabilities.

**Watch for:** There are two common versions: LTS (Long Term Support) and Current. Always install LTS — it is the stable version that all professional tools are tested against.

---

### Concept: What Is a Terminal?

**What it is:** A text interface to your computer. Instead of clicking icons, you type commands and press Enter. The terminal runs the command and shows you the output.

**Why developers use it:**
Most development tools — compilers, servers, package managers — are command-line programs. They have no graphical interface. The terminal is the only way to run them.

**Opening the terminal in VS Code:**
The easiest approach for this series: open VS Code, then go to the menu bar and click **Terminal → New Terminal**. A panel appears at the bottom of VS Code. This terminal is already pointed at your project folder — no navigation needed.

**What you type is always shown in this format in this series:**
```
> node --version
```
The `>` is not something you type — it represents the terminal prompt. Type everything after the `>`.

**Watch for:** Terminal commands are case-sensitive and spacing matters. `npm install` works. `NPM Install` does not. `npm  install` (two spaces) also does not.

---

Go to `nodejs.org` and download the **LTS** version for Windows. Run the installer. Accept all defaults.

When the installation finishes, open the VS Code terminal and run:

```
> node --version
```

**Expected output:**
```
v20.11.0
```
(Your number may be different — any version starting with `v20` or higher is fine.)

Run this second command to confirm npm also installed:

```
> npm --version
```

**Expected output:**
```
10.2.4
```
(Again, the exact number may differ. Any output without an error message means npm is working.)

If either command shows an error like `command not found`, close VS Code completely, reopen it, and try again. The terminal sometimes does not pick up new installations until it restarts.

---

## Step 1 — Create the Vite Project

Now that Node.js is installed, you will create a new TypeScript project using Vite.

---

### Concept: What Is npm?

**What it is:** Node Package Manager — a tool that downloads and manages libraries (called *packages*) for your project.

**Three npm commands you will use constantly:**

```
npm create vite@latest   — creates a new project using a Vite template
npm install              — reads package.json and downloads all listed packages
npm run dev              — runs the "dev" script defined in package.json
```

**`package.json` — the project's manifest:**
Every Node.js project has a `package.json` file. It records:
- The project's name and version
- Every library the project depends on (and their versions)
- Scripts — shortcuts for terminal commands you run frequently

When you share a project with another developer, they run `npm install` and npm reads `package.json` to download exactly the right packages. This is why you do not need to share the `node_modules` folder — it is always regenerated from `package.json`.

**Watch for:** Never manually edit `node_modules`. It contains hundreds of files generated by npm. If it gets corrupted, delete it and run `npm install` again.

---

### Concept: What Is Vite?

**What it is:** A development tool with two jobs:
1. **Development server** — watches your files, compiles TypeScript to JavaScript, and serves your project to the browser. When you save a file, the browser refreshes automatically.
2. **Build tool** — when you are ready to deploy, Vite bundles all your TypeScript files into optimized JavaScript that browsers can run directly.

**The problem before Vite:**
In Lab 01, every time you saved you had to manually press `F5` to refresh the browser. You also needed an `importmap` in your HTML to tell the browser where to find Three.js. TypeScript requires compilation — something has to turn your `.ts` files into `.js` before the browser can run them.

**Vite handles all of this automatically:**
- Save a `.ts` file → Vite compiles it → browser refreshes
- Import a package by name → Vite finds it in `node_modules`
- TypeScript errors → Vite shows them in the terminal and in VS Code

**Watch for:** Vite is a *development* tool. In production, `npm run build` creates a `dist/` folder with optimized files you deploy to a server. You will not do this until later labs.

---

In the VS Code terminal, navigate to your Desktop's `tower-defense` folder. If you are not already there, you can check where you are:

```
> pwd
```

This prints the current directory. If it does not show your `tower-defense` folder, use `cd` to navigate:

```
> cd C:/Users/YourName/Desktop/tower-defense
```

Now create the Vite project. This command asks you a few questions:

```
> npm create vite@latest grid-commander
```

Vite will ask: **Select a framework**
Use the arrow keys. Select: **Vanilla**
Press Enter.

Vite will ask: **Select a variant**
Select: **TypeScript**
Press Enter.

Vite creates a folder called `grid-commander` inside `tower-defense`. Now move into it and install dependencies:

```
> cd grid-commander
> npm install
```

`npm install` reads the `package.json` Vite created and downloads all the packages it lists into a `node_modules` folder. This takes 10–30 seconds.

When it finishes, start the development server:

```
> npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### SAVE AND TRY

Open Chrome and go to `http://localhost:5173/`.

**You should see:** Vite's default starter page — a Vite logo, a TypeScript logo, and a counter button. This is the placeholder content Vite generates when you create a new project.

This is not your game yet. The next steps replace this placeholder content with the rotating cube from Lab 01.

**In the console:**
The console should have no errors. If you see errors about missing files, stop the server (`Ctrl + C` in the terminal) and run `npm install` again.

**The key difference from Lab 01:**
You did not manually open a file. You opened a URL — `localhost:5173`. Vite is running a local web server on your machine. Port `5173` is where that server listens. From here on, always open `localhost:5173` instead of dragging a file into Chrome.

---

## Step 2 — Understand the Project Structure

Before changing anything, look at what Vite created. In VS Code's file explorer, you should see:

```
grid-commander/
├── node_modules/       ← downloaded packages (do not edit these)
├── public/             ← static files (images, fonts) served as-is
│   └── vite.svg
├── src/                ← your code lives here
│   ├── counter.ts      ← example file (we will delete this)
│   ├── main.ts         ← the entry point — this is where your code goes
│   ├── style.css       ← global CSS
│   ├── typescript.svg  ← example file (we will delete this)
│   └── vite-env.d.ts   ← TypeScript declarations for Vite (do not edit)
├── index.html          ← the HTML file the browser loads
├── package.json        ← project manifest — name, dependencies, scripts
├── package-lock.json   ← exact versions of every installed package (do not edit)
└── tsconfig.json       ← TypeScript configuration
```

---

### Concept: What Is `index.html` in a Vite Project?

**What it is:** The HTML file the browser loads first — same as in Lab 01. But with one important difference: instead of containing all your JavaScript inline, it just references `src/main.ts`.

Open `index.html` now and look at the bottom of the `<body>`:

```html
<script type="module" src="/src/main.ts"></script>
```

This one line tells the browser: "load and run `src/main.ts`." Vite intercepts this request, compiles `main.ts` from TypeScript to JavaScript, and sends the result to the browser — all automatically.

**Compared to Lab 01's approach:**
```html
<!-- Lab 01 — everything inline, hard to manage as code grows -->
<script type="module">
  import * as THREE from 'three';
  const renderer = new THREE.WebGLRenderer();
  // ... hundreds more lines here
</script>

<!-- Lab 02 — code is in its own file, HTML stays clean -->
<script type="module" src="/src/main.ts"></script>
```

As the game grows to thousands of lines, having the code in separate files becomes essential. By Lab 25, your project will have dozens of files. The `index.html` stays small no matter how large the codebase gets.

**Watch for:** The `src="/src/main.ts"` path starts with `/` — it is relative to the server root, not to `index.html`'s location. Vite handles this correctly. If you used a relative path (`./src/main.ts`) it would also work, but the absolute-from-root path is the Vite convention.

---

### Concept: What Is `tsconfig.json`?

**What it is:** The configuration file for the TypeScript compiler. It tells TypeScript which files to check, how strict to be, and what JavaScript version to output.

Open `tsconfig.json`. You will see something like this:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["src"]
}
```

The four settings that matter right now:

| Setting | What it means |
|---|---|
| `"strict": true` | Enables all strict type checks — TypeScript is maximally helpful |
| `"target": "ES2020"` | Output JavaScript compatible with modern browsers |
| `"lib": ["ES2020", "DOM"]` | TypeScript knows about browser APIs (`document`, `window`, etc.) |
| `"include": ["src"]` | Only check files inside the `src/` folder |

**Do not change `tsconfig.json`.** The settings Vite chose are correct for this project. Understanding what they mean is enough for now.

**Watch for:** `"strict": true` is important. It means TypeScript will catch more mistakes. Some tutorials suggest turning it off to avoid errors — do not do this. The errors it catches are real bugs.

---

### Concept: What Is `package.json`?

**What it is:** The project's manifest file. It records the project name, the scripts you can run, and the packages (libraries) the project depends on.

Open `package.json`:

```json
{
  "name": "grid-commander",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

**The `scripts` section:**
Running `npm run dev` runs the `"dev"` script — which is just `vite`. Running `npm run build` runs `tsc && vite build` — TypeScript compiler first, then Vite's bundler.

**`devDependencies`:**
Packages listed here are only needed during development — not when the game is deployed. TypeScript and Vite go here because the browser never sees them; they only run on your machine. Later, when you add Three.js with `npm install three`, it goes into `dependencies` (not `devDependencies`) because it is needed at runtime.

**Do not manually edit `package.json` to add packages.** Always use `npm install package-name`. npm updates `package.json` automatically and also updates `package-lock.json` to record the exact version installed.

---

## Step 3 — Install Three.js

The project Vite created does not include Three.js. You need to install it.

---

### Concept: What Are Type Definitions (`@types/three`)?

**What it is:** Three.js was originally written in plain JavaScript — no TypeScript types. TypeScript does not know what `THREE.Scene` or `THREE.Camera` are unless you tell it.

`@types/three` is a separate package that contains *type definition files* — files that describe the shape of the Three.js API in TypeScript terms. They tell TypeScript: "the `Scene` class has a `children` property of type `Object3D[]`", and "the `PerspectiveCamera` constructor takes four numbers."

**Two packages to install:**

| Package | What it is |
|---|---|
| `three` | The actual Three.js library code |
| `@types/three` | Type definitions so TypeScript understands Three.js |

In your terminal (make sure you are inside `grid-commander/`):

```
> npm install three
> npm install --save-dev @types/three
```

The `--save-dev` flag on the second command tells npm that `@types/three` is a development-only dependency — it is only needed while you are writing code, not when the game runs in the browser.

When both commands finish, open `package.json`. You should see:

```json
"dependencies": {
  "three": "^0.160.0"
},
"devDependencies": {
  "@types/three": "^0.160.0",
  "typescript": "^5.2.2",
  "vite": "^5.0.8"
}
```

---

### SAVE AND TRY

Open `src/main.ts` and add one line at the top (above all existing code):

```ts
import * as THREE from 'three';
console.log('Three.js version:', THREE.REVISION);
```

Save. Look at the browser at `localhost:5173`.

**You should see:** The browser refreshes automatically — you did not press `F5`. This is Vite working.

**In the console:**
```
Three.js version: 160
```

The browser refreshed and Three.js printed its version without you doing anything. **This is the development workflow for every lab from here on:** save the file, Vite recompiles, browser refreshes automatically.

Remove the `console.log` line — it was just a verification. Keep the `import` line.

---

## Step 4 — Port the Lab 01 Code

Now you replace Vite's placeholder content with your rotating cube from Lab 01. This involves three files: `index.html`, `src/style.css`, and `src/main.ts`.

---

### Concept: Separation of Concerns

**What it is:** The principle that different types of content should live in different files. Structure (HTML) in one place, appearance (CSS) in another, behavior (JavaScript/TypeScript) in a third.

**The problem before:**
In Lab 01, all three lived in one file:
```html
<html>          ← structure
  <style>       ← appearance mixed into structure
  </style>
  <body>
    <script>    ← behavior mixed into structure
    </script>
  </body>
</html>
```

**The solution:**
Vite's project structure enforces separation:
```
index.html     ← structure only
src/style.css  ← appearance only
src/main.ts    ← behavior only
```

**Why it matters for the game:**
As the project grows, you will split `main.ts` into more files — one for towers, one for enemies, one for the game grid. Separation of concerns is what makes that splitting possible. You cannot split a single HTML file into logical pieces.

**Watch for:** The separation is a convention, not enforced by the tools. You *could* put CSS in `main.ts` using JavaScript. Do not — keep each type of content in its own place.

---

**File 1 — Update `index.html`:**

Open `index.html`. Replace the entire contents with this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grid Commander</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

What changed from Vite's default:
- Title is now `Grid Commander`
- The `<div id="app">` is removed — Three.js adds its own canvas to `<body>`
- Vite's logo links are removed
- The `<link>` to `style.css` is added

**File 2 — Replace `src/style.css`:**

Open `src/style.css`. Replace the entire contents with this:

```css
/* Remove the default margin browsers add around the body.
   Without this there is an 8px white gap around the canvas. */
body {
  margin: 0;
}
```

---

### CSS AND SEE

Save `style.css`. Look at the browser.

**You should see:** The placeholder content may jump slightly as the margin is removed. The white border around the page disappears.

**Why `margin: 0` matters:** Browsers add a small default margin to `<body>`. When the Three.js canvas fills the page, that margin creates a visible white gap around the edges. One line of CSS removes it.

**Compare:** Temporarily change `margin: 0` to `margin: 20px`. Save. The white gap reappears around the canvas. Change it back to `margin: 0`.

---

**File 3 — Replace `src/main.ts`:**

Open `src/main.ts`. Delete everything currently in it and type this:

```ts
import * as THREE from 'three';

// ── Constants ────────────────────────────────────────────────────────────────
const CANVAS_WIDTH  = 800; // canvas width in pixels
const CANVAS_HEIGHT = 600; // canvas height in pixels

// ── Renderer ─────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer();
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
document.body.appendChild(renderer.domElement);

// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  CANVAS_WIDTH / CANVAS_HEIGHT,
  0.1,
  1000
);
camera.position.z = 5;

// ── Box ───────────────────────────────────────────────────────────────────────
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
const box         = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

// ── Lights ────────────────────────────────────────────────────────────────────
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// ── Animation Loop ────────────────────────────────────────────────────────────
function animate(): void {
  requestAnimationFrame(animate);
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();
```

---

### SAVE AND TRY

Save `main.ts`. The browser refreshes automatically.

**You should see:** The same rotating blue cube from Lab 01. Identical visually.

**The difference you cannot see:**
- The code is now TypeScript, not plain JavaScript
- It lives in `src/main.ts`, not inside `index.html`
- Vite compiled it and served it automatically
- VS Code is now checking your types as you type

**In the browser console:**
No errors. The console should be clean.

**Notice `function animate(): void`:**
In Lab 01 this was `function animate()`. The `: void` is new — it is a TypeScript *type annotation* on the function's return value. `void` means "this function does not return anything." You will learn type annotations in the next step.

**Change something:** Change `color: 0x00aaff` to `color: 0xff6600`. Save. The browser refreshes automatically — no `F5` needed. The cube turns orange. Change it back to `0x00aaff`.

---

## Step 5 — Add Type Annotations

The code in Step 4 works but is missing one of TypeScript's most useful features — explicit type annotations. You will add them now and see what they give you.

---

### Concept: What Is a Type?

**What it is:** A description of what kind of value a variable holds. In JavaScript, any variable can hold any value — a number, then a string, then an object. TypeScript adds rules: a variable declared to hold a `number` can only ever hold numbers.

**The four basic types in TypeScript:**

| Type | What it holds | Example |
|---|---|---|
| `number` | Any numeric value | `5`, `3.14`, `-100` |
| `string` | Text | `"hello"`, `'world'` |
| `boolean` | True or false | `true`, `false` |
| `void` | Nothing — used for functions that do not return a value | — |

**These are primitives — the building blocks.** More complex types (arrays, objects, classes) are built on top of these.

---

### Concept: Type Annotations

**What it is:** Text you add to a variable declaration that explicitly tells TypeScript what type the variable holds. Written as `: TypeName` directly after the variable name.

**The syntax:**
```ts
const score: number = 0;
//          ↑ the annotation — "score holds a number"

let playerName: string = 'Alice';
//             ↑ "playerName holds a string"
```

**The problem type annotations solve:**
```ts
// Without annotations — no protection:
let health = 100;
health = 'full'; // this is clearly wrong, but JavaScript allows it

// With annotations — TypeScript catches it:
let health: number = 100;
health = 'full'; // Error: Type 'string' is not assignable to type 'number'
```

**Why this matters in a game:**
Tower health is a number. If you accidentally assign a string to it, your damage calculation produces `NaN` instead of `0` — the tower never dies, but also never has any visible effect. A type error at write-time is infinitely easier to fix than a NaN bug at runtime.

---

### Concept: Type Inference

**What it is:** TypeScript's ability to figure out the type of a variable *without* you writing an annotation, based on the value assigned to it.

**Example:**
```ts
const score = 0;
//    ↑ no annotation — TypeScript infers: score is of type 'number'

const playerName = 'Alice';
//    ↑ TypeScript infers: playerName is of type 'string'
```

**When to write annotations and when to rely on inference:**

| Situation | Write annotation? | Why |
|---|---|---|
| `const x = 5` | No | TypeScript infers `number` correctly |
| Function parameters | Yes | TypeScript cannot infer what callers will pass |
| Function return values | Yes | Makes the function's contract explicit |
| Variable initialized to `null` or `undefined` | Yes | No value to infer from |

**In this series:** We write annotations on function parameters and return values always. For variables initialized with a value, we let TypeScript infer the type — the annotation would just repeat information already visible.

**Watch for:** Hover over any variable name in VS Code. A tooltip shows the inferred type. This works without you writing a single annotation.

---

### Concept: Three.js Types

**What it is:** Every class in Three.js is also a TypeScript type. `THREE.WebGLRenderer` is both a class you instantiate (`new THREE.WebGLRenderer()`) and a type you annotate with (`: THREE.WebGLRenderer`).

**This is why `@types/three` matters:**
The type definitions from `@types/three` tell TypeScript about every class, method, and property in Three.js. Hover over `renderer` in VS Code — you see `THREE.WebGLRenderer`. Hover over `.setSize` — you see it takes two numbers. If you pass a string by accident, TypeScript flags it immediately.

---

Update `src/main.ts`. Add type annotations to the variables as shown. The annotations are marked with `// ← type annotation`:

```ts
import * as THREE from 'three';

// ── Constants ────────────────────────────────────────────────────────────────
const CANVAS_WIDTH: number  = 800; // ← type annotation
const CANVAS_HEIGHT: number = 600; // ← type annotation

// ── Renderer ─────────────────────────────────────────────────────────────────
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer(); // ← type annotation
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
document.body.appendChild(renderer.domElement);

// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene: THREE.Scene = new THREE.Scene(); // ← type annotation

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera( // ← type annotation
  75,
  CANVAS_WIDTH / CANVAS_HEIGHT,
  0.1,
  1000
);
camera.position.z = 5;

// ── Box ───────────────────────────────────────────────────────────────────────
const boxGeometry: THREE.BoxGeometry          = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
const box: THREE.Mesh                         = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

// ── Lights ────────────────────────────────────────────────────────────────────
const sunLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7);
scene.add(sunLight);

const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// ── Animation Loop ────────────────────────────────────────────────────────────
function animate(): void { // ← ': void' = this function returns nothing
  requestAnimationFrame(animate);
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();
```

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** The exact same rotating cube. No visual change — type annotations are invisible at runtime. They only affect what VS Code shows you while you write code.

**In VS Code — try this:**
Hover your cursor over `renderer` (the variable, not the `new` call). VS Code shows a tooltip:
```
const renderer: THREE.WebGLRenderer
```

Hover over `scene`. You see:
```
const scene: THREE.Scene
```

Hover over `.setSize` on the renderer. You see its full signature:
```
setSize(width: number, height: number, updateStyle?: boolean): void
```

TypeScript now knows exactly what every variable is and what every method expects. This is the value of `@types/three`.

**Change something:** Try changing `camera.position.z = 5` to `camera.position.z = "five"`. VS Code immediately draws a red squiggle under `"five"`. Hover over it — you see:
```
Type 'string' is not assignable to type 'number'.
```

This error appears *before you save and before the browser runs the code*. TypeScript caught it as you typed. Change it back to `5`.

---

## Challenge: What Type Is `box.rotation.x`?

**You know:** Hover over any variable in VS Code to see its type. `box` is a `THREE.Mesh`. `box.rotation` is a property on `Mesh`. `box.rotation.x` is a property on that.

**Task:** Without looking it up — hover over `box.rotation.x` in VS Code. What type does it say?

Then look at this line:
```ts
box.rotation.x += 0.01;
```

`+= 0.01` adds a number to whatever is in `box.rotation.x`. Based on the type you found, does this operation make sense? Why?

**This is a thinking challenge — no code to write.**

Try for 2 minutes before revealing the answer.

---

<details>
<summary>▶ Show Answer</summary>

`box.rotation.x` is of type `number`. The `+=` operator adds a number to a number, which is valid. TypeScript confirms this — no error.

**Key insight:** TypeScript is not just about catching mistakes. It is also about *documentation*. When you hover over `box.rotation.x` and see `number`, you immediately know how to work with it — you can do math on it, compare it, pass it to functions that expect numbers. You do not need to look it up or guess. The type is the documentation.

</details>

---

## Step 6 — Create a `GameConfig` Interface

The constants at the top of `main.ts` work, but they are loose — each one is its own unconnected variable. In a real application, related configuration values are grouped together. TypeScript provides `interface` as the tool for describing the shape of a grouped object.

---

### Concept: What Is an Interface?

**What it is:** A named contract that describes the *shape* of an object — what properties it must have and what type each property holds. An interface does not create a value. It creates a type.

**The problem before:**
```ts
const CANVAS_WIDTH: number  = 800;
const CANVAS_HEIGHT: number = 600;
const CAMERA_FOV: number    = 75;
const CAMERA_NEAR: number   = 0.1;
const CAMERA_FAR: number    = 1000;
const CAMERA_Z: number      = 5;
// Six separate variables with no connection to each other.
// To pass them to a function you must pass them individually.
```

**The solution:**
```ts
interface GameConfig {
  canvasWidth:  number;
  canvasHeight: number;
  cameraFov:    number;
  cameraNear:   number;
  cameraFar:    number;
  cameraZ:      number;
}
// One named type. Any object that matches this shape IS a GameConfig.
```

**An interface defines a contract:**
Any object that has all the properties listed, with the right types, satisfies the interface. TypeScript checks this automatically.

**The syntax rules:**
- Properties are separated by semicolons (not commas)
- Each property is `name: type`
- No default values — an interface only describes shape, it does not hold values

**Interface vs object:**
```ts
// This is an interface — a type description, not a value:
interface GameConfig {
  canvasWidth: number;
}

// This is an object — an actual value that matches the interface:
const CONFIG: GameConfig = {
  canvasWidth: 800,
};
```

**Why it matters here:**
In later labs, functions will take a `GameConfig` argument. When TypeScript knows the shape, it autocompletes property names as you type and catches typos. Without the interface, you pass raw numbers to functions and have no way to know which number is which.

**Watch for:** Interfaces only exist in TypeScript. When the compiler turns your `.ts` file into `.js`, all interface declarations disappear completely — they have zero cost at runtime. They are purely a writing-time tool.

---

Add the interface to the top of `src/main.ts`, and then use it. Replace the constants section with this:

```ts
import * as THREE from 'three';

// ── GameConfig Interface ──────────────────────────────────────────────────────
// Describes the shape of the configuration object.
// An interface is a type only — it produces no code when compiled.
interface GameConfig {
  canvasWidth:  number; // canvas width in pixels
  canvasHeight: number; // canvas height in pixels
  cameraFov:    number; // field of view in degrees
  cameraNear:   number; // near clip distance
  cameraFar:    number; // far clip distance
  cameraZ:      number; // camera starting position on the Z axis
}

// ── Configuration ─────────────────────────────────────────────────────────────
// One object holds all configuration. TypeScript verifies every property
// matches the GameConfig interface — wrong type or missing property = error.
const CONFIG: GameConfig = {
  canvasWidth:  800,
  canvasHeight: 600,
  cameraFov:    75,
  cameraNear:   0.1,
  cameraFar:    1000,
  cameraZ:      5,
};
```

Now update the rest of `main.ts` to use `CONFIG` instead of separate constants:

```ts
// ── Renderer ─────────────────────────────────────────────────────────────────
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(CONFIG.canvasWidth, CONFIG.canvasHeight); // ← use CONFIG
document.body.appendChild(renderer.domElement);

// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene: THREE.Scene = new THREE.Scene();

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
  CONFIG.cameraFov,                              // ← use CONFIG
  CONFIG.canvasWidth / CONFIG.canvasHeight,      // ← use CONFIG
  CONFIG.cameraNear,                             // ← use CONFIG
  CONFIG.cameraFar                               // ← use CONFIG
);
camera.position.z = CONFIG.cameraZ;              // ← use CONFIG

// ── Box ───────────────────────────────────────────────────────────────────────
const boxGeometry: THREE.BoxGeometry          = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
const box: THREE.Mesh                         = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

// ── Lights ────────────────────────────────────────────────────────────────────
const sunLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7);
scene.add(sunLight);

const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// ── Animation Loop ────────────────────────────────────────────────────────────
function animate(): void {
  requestAnimationFrame(animate);
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();
```

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** The exact same rotating cube. No visual change.

**In VS Code — try this:**
Type `CONFIG.` (with the dot). VS Code shows autocomplete with every property name in the interface: `canvasWidth`, `canvasHeight`, `cameraFov`, etc. TypeScript knows the shape of `CONFIG` and offers every valid option.

**In VS Code — try this:**
Temporarily add a property to the object that is not in the interface:
```ts
const CONFIG: GameConfig = {
  canvasWidth:  800,
  canvasHeight: 600,
  cameraFov:    75,
  cameraNear:   0.1,
  cameraFar:    1000,
  cameraZ:      5,
  tileSize:     64, // ← not in GameConfig
};
```

VS Code immediately underlines `tileSize` in red:
```
Object literal may only specify known properties,
and 'tileSize' does not exist in type 'GameConfig'.
```

TypeScript caught a property that does not belong. Remove `tileSize` before continuing.

---

## Challenge: Add a Box Color to the Interface

**You know:** `interface` describes the shape of a configuration object. `number` is a type. Properties are added with `propertyName: type;`.

**Task:** Add a `boxColor` property of type `number` to the `GameConfig` interface and to the `CONFIG` object. Then use `CONFIG.boxColor` where the `MeshStandardMaterial` color is currently hardcoded.

**Starting code:**
```ts
interface GameConfig {
  canvasWidth:  number;
  canvasHeight: number;
  cameraFov:    number;
  cameraNear:   number;
  cameraFar:    number;
  cameraZ:      number;
  // add boxColor here
}

const CONFIG: GameConfig = {
  canvasWidth:  800,
  canvasHeight: 600,
  cameraFov:    75,
  cameraNear:   0.1,
  cameraFar:    1000,
  cameraZ:      5,
  // add boxColor here — use 0x00aaff
};
```

**Hint:** The color is used in `new THREE.MeshStandardMaterial({ color: 0x00aaff })`.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
interface GameConfig {
  canvasWidth:  number;
  canvasHeight: number;
  cameraFov:    number;
  cameraNear:   number;
  cameraFar:    number;
  cameraZ:      number;
  boxColor:     number; // ← added
}

const CONFIG: GameConfig = {
  canvasWidth:  800,
  canvasHeight: 600,
  cameraFov:    75,
  cameraNear:   0.1,
  cameraFar:    1000,
  cameraZ:      5,
  boxColor:     0x00aaff, // ← added
};

// Then use it:
const boxMaterial = new THREE.MeshStandardMaterial({ color: CONFIG.boxColor });
```

**Key insight:** Now when you want to change the box color you change one value in `CONFIG`. You do not hunt through the code for every place the color appears. In a real game with dozens of configurable values, this pattern — one config object, one place to change — saves enormous amounts of time and prevents mistakes where you change the color in one place but forget it in another.

</details>

---

## Step 7 — See TypeScript Catch a Real Mistake

Type annotations are most useful when they catch bugs you did not realize you were making. This step demonstrates that with a deliberate mistake.

---

### Concept: What Is a Type Error?

**What it is:** A mistake TypeScript catches because you used a value of the wrong type. The error appears in VS Code as a red squiggle *while you type* — before you save, before Vite compiles, before the browser runs anything.

**The two places errors appear:**
1. In VS Code — red squiggle under the problematic code, with an explanation on hover
2. In the Vite terminal — a formatted error message if you save with type errors present

**The important distinction — TypeScript errors vs runtime errors:**

| | TypeScript error | Runtime error |
|---|---|---|
| When discovered | While writing | After running |
| Where it appears | VS Code squiggle | Browser console (red) |
| Easy to find? | Yes — exact line highlighted | Sometimes — stack trace may be unclear |
| Cost | Zero — no code ran | Variable — may have corrupted state |

TypeScript moves mistakes from "discovered while using the game" to "discovered while writing the code."

**Watch for:** TypeScript errors do NOT prevent Vite from serving the file to the browser. Vite still compiles and serves code with type errors. The browser still runs it. TypeScript errors are warnings about correctness, not hard stops. This is intentional — it lets you keep working even with errors present — but it means you should not ignore them.

---

Make this deliberate mistake in `main.ts`. Add the wrong type to the canvas width:

```ts
// Temporary mistake — add this line after the CONFIG declaration:
const brokenWidth: string = CONFIG.canvasWidth;
```

**You should see immediately in VS Code:**
```
Type 'number' is not assignable to type 'string'.
```

The error appears the moment you finish typing the line — before you save.

Now try passing the wrong type to a Three.js function. Replace the existing renderer setup with this temporarily:

```ts
renderer.setSize("800", CONFIG.canvasHeight); // wrong — "800" is a string, not a number
```

**VS Code shows:**
```
Argument of type 'string' is not assignable to parameter of type 'number'.
```

`setSize` expects two numbers. TypeScript knows this because `@types/three` describes the method signature. The string `"800"` would cause `NaN` calculations inside Three.js at runtime — a bug that is nearly invisible because the canvas renders but with wrong dimensions. TypeScript surfaces it immediately.

---

### SAVE AND TRY

**Before saving:** Undo both deliberate mistakes — remove the `brokenWidth` line and fix `setSize` back to `renderer.setSize(CONFIG.canvasWidth, CONFIG.canvasHeight)`.

Save. The browser refreshes.

**You should see:** The rotating cube. No errors in the console or the terminal.

**In the Vite terminal:** No error messages.

---

## Final Check

Go through this table before moving to Lab 03.

| Feature | How to verify |
|---|---|
| `npm run dev` starts without errors | Terminal shows `VITE ready` and a `localhost` URL |
| Browser auto-refreshes on save | Change `boxColor` in CONFIG, save, see color change without pressing F5 |
| Rotating cube appears | Blue cube visible at `localhost:5173` |
| No console errors | Browser console (`F12`) shows no red messages |
| Type annotations present | Hover over `renderer` in VS Code — tooltip shows `THREE.WebGLRenderer` |
| `GameConfig` interface in use | `CONFIG.canvasWidth` is used in `renderer.setSize()` |
| TypeScript catches wrong types | Add `: string` to a number variable — VS Code shows a red squiggle |
| `@types/three` working | Hover over `renderer.setSize` — tooltip shows the method signature with parameter types |

---

## Your Complete Files

### `index.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grid Commander</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### `src/style.css`
```css
body {
  margin: 0;
}
```

### `src/main.ts`
```ts
import * as THREE from 'three';

// ── GameConfig Interface ──────────────────────────────────────────────────────
interface GameConfig {
  canvasWidth:  number;
  canvasHeight: number;
  cameraFov:    number;
  cameraNear:   number;
  cameraFar:    number;
  cameraZ:      number;
  boxColor:     number;
}

// ── Configuration ─────────────────────────────────────────────────────────────
const CONFIG: GameConfig = {
  canvasWidth:  800,
  canvasHeight: 600,
  cameraFov:    75,
  cameraNear:   0.1,
  cameraFar:    1000,
  cameraZ:      5,
  boxColor:     0x00aaff,
};

// ── Renderer ─────────────────────────────────────────────────────────────────
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(CONFIG.canvasWidth, CONFIG.canvasHeight);
document.body.appendChild(renderer.domElement);

// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene: THREE.Scene = new THREE.Scene();

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
  CONFIG.cameraFov,
  CONFIG.canvasWidth / CONFIG.canvasHeight,
  CONFIG.cameraNear,
  CONFIG.cameraFar
);
camera.position.z = CONFIG.cameraZ;

// ── Box ───────────────────────────────────────────────────────────────────────
const boxGeometry: THREE.BoxGeometry          = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({ color: CONFIG.boxColor });
const box: THREE.Mesh                         = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

// ── Lights ────────────────────────────────────────────────────────────────────
const sunLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7);
scene.add(sunLight);

const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// ── Animation Loop ────────────────────────────────────────────────────────────
function animate(): void {
  requestAnimationFrame(animate);
  box.rotation.x += 0.01;
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();
```

---

## Quick Check Answers

**1. What problem does inline JavaScript in an HTML file cause as the code grows?**
The HTML file becomes enormous and unmanageable. HTML, CSS, and JavaScript have different purposes — mixing them in one file makes it impossible to find things, difficult to test in isolation, and impossible to split into logical modules later. In the finished game, the code will span dozens of files (`towers.ts`, `enemies.ts`, `pathfinding.ts`, etc.). That split is only possible if the code starts in `.ts` files rather than embedded in HTML.

**2. What does "type checking" mean, and what kind of mistake can it catch?**
Type checking means verifying that every value in the program is used according to its declared type. It catches mistakes like passing a `string` where a `number` is expected, calling a method that does not exist on a particular type, or accessing a property that was not declared. In Step 7 you saw a concrete example: TypeScript caught `renderer.setSize("800", ...)` because `setSize` expects a `number` and `"800"` is a `string`. At runtime this would have silently produced wrong behavior — TypeScript surfaces it while you are still writing.

**3. What would have to happen automatically to remove the manual browser refresh step?**
Something has to watch your files for changes, recompile them when they change, and notify the browser to reload. That is exactly what Vite does. When you save `main.ts`, Vite detects the change, compiles the TypeScript to JavaScript, and sends a signal to the browser via a WebSocket connection — the browser reloads without you pressing anything. This is called *Hot Module Replacement* (HMR) in its full form, though in this series we use the simpler full-page refresh.

---

*End of Lab 02.*

*Lab 03 adds delta time and separates the animation loop into proper `update()` and `render()` functions — the first step toward a real game loop that runs at the same speed on every machine.*
