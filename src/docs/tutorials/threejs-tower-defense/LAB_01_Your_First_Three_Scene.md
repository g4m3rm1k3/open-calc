# TypeScript Tower Defense — LAB 01 — Your First Three.js Scene

**Prerequisites:** None. This is the very first lab. You need a text editor and a web browser. That is everything.

**What this lab adds:**
- A colored 3D box that rotates on screen
- An understanding of what a renderer, scene, camera, and mesh are
- Your first working HTML file with JavaScript running in the browser

**Time:** 45–60 minutes. Do not rush it.

---

## What You Will Build

When this lab is complete, you will see this in your browser:

```
┌─────────────────────────────────────────────┐
│  Grid Commander                   (tab title)│
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│              ┌──────────┐                  │
│             /│          │\                 │
│            / │          │ \                │
│           │  └──────────┘  │               │
│            \ │          │ /                │
│             \│          │/                 │
│              └──────────┘                  │
│           (rotating blue cube)              │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

A light blue 3D cube rotating continuously on a black background. Different faces of the cube are different shades — the faces pointing toward the light are bright, the faces pointing away are dark. It looks solid and three-dimensional.

This is not a game yet. This is the foundation that every lab in this series builds on.

---

> **Quick Check — try to answer these before reading further:**
>
> 1. What do you think a "scene" is in a 3D program? Write your best guess in one sentence.
> 2. A 3D world has three axes (X, Y, Z). A screen is flat — it only has X and Y. What do you think has to happen to show a 3D world on a flat screen?
> 3. What do you think is the difference between a shape's *geometry* and its *material*?
>
> *(Answers at the end of this lab)*

---

## What You Need Before Starting

- **A text editor.** VS Code is recommended — it is free and used by professional developers worldwide. Download it at `code.visualstudio.com`.
- **A web browser.** Chrome is recommended. Firefox also works.
- **An internet connection** for this lab only (to load Three.js). Later labs remove this requirement.

That is the complete list. No account creation. No installation commands. No configuration.

---

### Concept: What Is a Text Editor?

**What it is:** A program that writes and saves plain text files — files that contain only characters, with no hidden formatting.

**The problem before:**
Word processors like Microsoft Word save files in their own formats. Those files contain invisible data about fonts, spacing, and layout. A browser trying to read a Word document would see that hidden data and fail — it expects plain text, not Word's internal format.

**The solution:**
A text editor saves *exactly* what you type and nothing else. The file `index.html` you create in VS Code is pure text — open it in Notepad and every character is visible.

**Why VS Code specifically:**
VS Code is free, works on Windows/Mac/Linux, understands HTML/CSS/JavaScript/TypeScript, and will serve you from this first HTML file through every advanced lab in this series. Learning it now pays off for years.

**Watch for:** Do not use Notepad on Windows or TextEdit on Mac for code. Both can silently add formatting that corrupts your files. Use VS Code.

---

### Concept: What Is a Web Browser?

**What it is:** A program that reads HTML, CSS, and JavaScript files and turns them into visual, interactive pages.

**Three things a browser does:**
1. Reads your HTML file and builds a visual structure on screen
2. Applies CSS rules to style that structure (colors, sizes, layout)
3. Runs your JavaScript code (calculations, movement, user interaction)

**Why this matters:**
Every lab in this series runs inside a browser. You write code, save the file, open or refresh the browser, and see results immediately. No deployment. No server (for now). No waiting.

**The browser console:**
Every browser has a built-in developer tools panel. The most important part is the Console — a panel where JavaScript can print messages and where errors appear in red. To open it in Chrome: press `F12`, then click the **Console** tab.

You will use the console in every single lab. Get comfortable opening it.

**Watch for:** If something is not working and you see a red error in the console, read it carefully. Browser error messages usually tell you exactly what went wrong and on which line.

---

## Step 1 — Create the HTML File

First, create a folder. On your Desktop, create a new folder called `tower-defense`. All files for this series live inside this folder.

Open VS Code. Use **File → Open Folder** and open the `tower-defense` folder.

Create a new file inside it called `index.html`.

Type the following exactly as written:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Grid Commander</title>
  </head>
  <body>
  </body>
</html>
```

Save the file (`Ctrl + S` on Windows, `Cmd + S` on Mac).

---

### Concept: What Is HTML?

**What it is:** A text file that tells the browser what *structure* a page has. HTML is not a programming language — it does not do calculations or make decisions. It describes what is on the page.

**HTML uses tags:**
A tag is a word inside angle brackets. Most tags come in pairs — an opening tag and a closing tag:

```html
<title>Grid Commander</title>
<!--   ↑ opening tag        ↑ closing tag (has a forward slash) -->
```

Everything between the opening and closing tag is the tag's *content*.

**The tags in your file, one by one:**

```html
<!DOCTYPE html>
```
Not a tag — a declaration. Tells the browser "this file uses modern HTML." Always the first line of every HTML file.

```html
<html lang="en">
```
The root container. Every other tag lives inside this one. `lang="en"` tells the browser the page is in English — this helps screen readers and search engines.

```html
<head>
```
A section for information *about* the page. Nothing inside `<head>` appears visually on screen. Think of it as the page's settings.

```html
<meta charset="UTF-8" />
```
Tells the browser to use modern text encoding. Without this, special characters like `é`, `ü`, or `→` might display as garbage. The `/` before `>` means this tag closes itself — it has no closing tag.

```html
<title>Grid Commander</title>
```
The text that appears in the browser tab. Not visible in the page body — only in the tab.

```html
<body>
```
Everything visible on screen goes here. Currently empty.

**Watch for:** Every opening tag needs a matching closing tag (except self-closing tags like `<meta />`). If you forget a closing tag, the browser will guess — and it will guess wrong, causing layout problems that are hard to diagnose.

---

### CSS AND SEE

Save. Open `index.html` in Chrome by dragging the file into the browser window, or right-clicking the file → **Open with** → **Chrome**.

**You should see:** A completely blank white page. The browser tab shows **Grid Commander**.

This is correct. The `<body>` is empty, so there is nothing to display. The tab title confirms the browser read your file.

**Change something:** Change `Grid Commander` in the `<title>` tag to your name. Save. Press `F5` in the browser to refresh. The browser tab now shows your name. Change it back to `Grid Commander`.

---

## Step 2 — Load Three.js

Three.js is a JavaScript library — code that someone else wrote, which you can use in your own project. It handles all the complex 3D math so you do not have to.

We will load it from a CDN. Before writing any code, here is what those terms mean.

---

### Concept: What Is a Library?

**What it is:** A collection of code that someone else wrote and published for others to use. Instead of writing every function yourself, you load the library and use its functions.

**The problem before:**
Drawing a 3D rotating box from scratch requires hundreds of lines of WebGL code — raw instructions to the graphics card. Very few people understand all of it, and writing it takes weeks.

**The solution:**
Three.js wraps all of that into simple commands like `new THREE.BoxGeometry(1, 1, 1)`. You describe what you want; Three.js figures out the WebGL.

**Watch for:** Using a library means learning its API — the set of functions and objects it provides. This series teaches the Three.js API step by step, concept by concept.

---

### Concept: What Is a CDN?

**What it is:** CDN stands for Content Delivery Network. It is a server on the internet that hosts files. Instead of downloading Three.js and storing it in your folder, you point your HTML file at the CDN and the browser downloads it automatically when the page loads.

**The advantage:** One line of HTML and Three.js is available. No installation, no commands, no package manager.

**The disadvantage:** You need an internet connection. In Lab 2, we switch to a local setup that works offline and adds TypeScript. The CDN is only for Lab 1, to keep the starting point as simple as possible.

**Watch for:** If you see an error in the console about Three.js not loading, check that your internet connection is working and that the URL in your file exactly matches the one in this lab.

---

### Concept: What Is JavaScript?

**What it is:** The programming language that runs inside browsers. Unlike HTML (structure) and CSS (appearance), JavaScript is a real programming language — it can do calculations, react to user input, and change the page while it is open.

**How it gets into a page:**
Through a `<script>` tag in your HTML. The browser sees the tag, reads the code, and runs it.

Two kinds of `<script>` tags:
```html
<!-- Kind 1: loads JavaScript from a file -->
<script src="some-file.js"></script>

<!-- Kind 2: runs JavaScript written directly in the HTML -->
<script>
  console.log("this runs immediately");
</script>
```

**`type="module"` — what it means:**
Modern JavaScript has a feature called *modules* — a way for code in one file to use code from another file. The `type="module"` attribute on a script tag enables this feature. Without it, `import` statements (which you will see shortly) do not work.

**Watch for:** The `type="module"` attribute changes how the browser runs your script in a few subtle ways. The most important: module scripts are always run *after* the HTML is parsed. This is usually what you want.

---

### Concept: What Is an Import Statement?

**What it is:** A line of JavaScript that brings code from another file into the current file. Instead of copy-pasting Three.js's thousands of lines into your file, you write one `import` line and get access to everything.

**The problem before:**
Without imports, the only way to use code from another file was to load it with a `<script src="...">` tag, which dumps everything into the global scope — a shared space where names can accidentally collide.

**The solution:**
```js
import * as THREE from 'three';
//     ↑           ↑     ↑
//     import      give  where to find it
//     everything  it    (defined in the importmap, shown next)
//     from it     the
//                 name
//                 THREE
```

`THREE` is now a *namespace* — an object that holds everything Three.js provides. `THREE.Scene`, `THREE.Camera`, `THREE.BoxGeometry` — all of Three.js lives under `THREE.something`. The dot is your way in.

**Watch for:** The name `'three'` in the import statement must match a name in the `importmap` — the block that maps short names to full URLs. If they do not match, the import fails.

---

### Concept: What Is an importmap?

**What it is:** A block of JSON in your HTML file that tells the browser "when JavaScript says `import ... from 'three'`, fetch Three.js from this URL."

**Why it exists:**
Without it, you would need to write the full CDN URL in every import statement — messy and hard to update. The importmap defines the name once, and import statements use the short name.

**The format:**
```html
<script type="importmap">
  {
    "imports": {
      "three": "https://..."
    }
  }
</script>
```

This is JSON — a text format for structured data. Every key and value must be in double quotes. The importmap must appear before any `<script type="module">` that uses the names it defines.

**Watch for:** JSON does not allow trailing commas. `{ "three": "url", }` is invalid — the comma after the last item will cause an error.

---

Update `index.html`. Add the two new blocks inside `<body>`, before the closing `</body>` tag. The new lines are marked:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Grid Commander</title>
  </head>
  <body>

    <!-- NEW: maps the short name "three" to the full CDN URL -->
    <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
        }
      }
    </script>

    <!-- NEW: our game code. type="module" enables the import statement -->
    <script type="module">
      import * as THREE from 'three'; // loads Three.js; everything lives under THREE

      // Verify Three.js loaded. We will remove this line after confirming.
      console.log('Three.js version:', THREE.REVISION);
    </script>

  </body>
</html>
```

---

### SAVE AND TRY

Save. Press `F5` in Chrome to refresh (or drag the file in again if you closed Chrome).

Open the console: press `F12`, click the **Console** tab.

**You should see:**
```
Three.js version: 160
```

The number `160` is Three.js's version number. Seeing this confirms Three.js loaded successfully from the CDN.

**If you see a red error instead:** The most common causes are:
- The importmap URL has a typo (copy it again carefully)
- The importmap JSON has invalid syntax (missing quotes or a trailing comma)
- No internet connection

**In the console, type this and press Enter:**
```js
THREE
```
**Expected:** The browser prints the Three.js namespace object — a large object with hundreds of entries. This confirms you have access to the entire library.

**Change something:** Replace `THREE.REVISION` with `THREE.MathUtils`. Save. Refresh. The console now prints an object full of math utility functions — `clamp`, `lerp`, `degToRad`, etc. These are Three.js helpers you will use later. Change it back to `THREE.REVISION`.

---

## Step 3 — Create the Renderer

The renderer is the part of Three.js that does the actual drawing. Everything else in Three.js exists to tell the renderer what to draw.

---

### Concept: The Renderer

**What it is:** The engine that converts a 3D scene into 2D pixels on screen. It does this using WebGL — a browser technology that sends drawing instructions directly to your graphics card.

**The problem before:**
Writing raw WebGL means writing assembly-like instructions: define a vertex buffer, compile a shader program, bind textures, manage GPU memory. This takes months to learn and hundreds of lines for anything visible.

**The solution:**
`new THREE.WebGLRenderer()` creates a renderer that handles all of that. You describe your 3D world in human-readable terms. The renderer handles the GPU.

**What the renderer creates:**
The renderer internally creates a `<canvas>` element — an HTML element that code can draw pixels onto. This canvas is what you see in the browser. You access it via `renderer.domElement` and add it to the page yourself.

**The three things you always do with a renderer:**
```js
const renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 600);                  // set the canvas size in pixels
document.body.appendChild(renderer.domElement); // add the canvas to the page
```

**Why it matters here:** Without a renderer, nothing ever appears on screen. This is the first thing you create in every Three.js project.

**Watch for:** `renderer.domElement` is the `<canvas>` element. You append `renderer.domElement` to the page — not `renderer` itself. `renderer` is a JavaScript object; `renderer.domElement` is the actual HTML element.

---

### Concept: What Is a canvas Element?

**What it is:** An HTML element that JavaScript can draw pixels onto directly. Unlike a `<p>` (paragraph) or `<img>` (image), a canvas has no built-in appearance — it is a blank surface that code controls completely.

**Why Three.js uses it:**
The WebGL renderer draws 3D graphics by writing pixel data to the canvas on every frame. The browser displays whatever the renderer draws. The canvas is the bridge between Three.js's 3D world and the flat pixels you see.

**Watch for:** A canvas element with no explicit size defaults to 300×150 pixels — small and easy to miss. Always call `renderer.setSize()` to set the size you actually want.

---

### Concept: Named Constants

**What it is:** A variable declared with `const` whose purpose is to give a name to a specific value.

**The problem before:**
```js
renderer.setSize(800, 600);
// What are 800 and 600? Are they the canvas size? The window size? In what units?
```

**The solution:**
```js
const CANVAS_WIDTH  = 800; // canvas width in pixels
const CANVAS_HEIGHT = 600; // canvas height in pixels
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
// Now the intent is clear.
```

**The convention:**
Constants that represent fixed configuration values are written in `ALL_CAPS_WITH_UNDERSCORES`. This signals "this value is intentional and shared — if you want to change it, change it here."

**Why it matters for this series:**
Every number in this series has a name. `CANVAS_WIDTH` not `800`. `TILE_SIZE` not `64`. `TOWER_RANGE` not `3`. Named constants make code readable, make changes easy, and eliminate the question "what is this number?"

**Watch for:** `const` means you cannot reassign the variable (`CANVAS_WIDTH = 900` later would throw an error). That is intentional — constants should not change. For values that change (like a tower's health), we use `let`.

---

Replace the entire `<script type="module">` block with this:

```html
<script type="module">
  import * as THREE from 'three';

  // ── Constants ────────────────────────────────────────────────────────────
  const CANVAS_WIDTH  = 800; // canvas width in pixels
  const CANVAS_HEIGHT = 600; // canvas height in pixels

  // ── Renderer ─────────────────────────────────────────────────────────────
  // The renderer converts 3D scene data into 2D pixels.
  // It internally creates a <canvas> element via renderer.domElement.
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

  // Add the canvas to the page so it is visible.
  document.body.appendChild(renderer.domElement);
</script>
```

---

### SAVE AND TRY

Save. Refresh.

**You should see:** A black rectangle on the page — 800 pixels wide, 600 pixels tall. The rest of the page background is white. The black rectangle is the renderer's canvas, empty because we have not given it anything to draw yet.

**In the console:**
```js
document.querySelector('canvas')
```
**Expected:** The browser prints a `<canvas>` element. This confirms the renderer added the canvas to the page.

```js
document.querySelector('canvas').width
```
**Expected:** `800`

**Change something:** Change `CANVAS_WIDTH` to `400`. Save. Refresh. The black rectangle is now half as wide. Change it back to `800`.

---

## Step 4 — Create a Scene and Camera

The renderer draws *something*. A scene and camera define what that something is, and from where you are looking at it.

---

### Concept: The Scene

**What it is:** A container that holds every 3D object in your world. Think of it as an empty stage before any actors have walked on. The renderer looks at the scene and draws everything in it.

**The problem before:**
Without a scene, there is no organized way to manage 3D objects. You would need to track every object manually and tell the renderer about each one individually. Removing an object (like a destroyed enemy) would mean finding it in multiple lists.

**The solution:**
The scene is a tree. Objects are added with `scene.add(object)` and removed with `scene.remove(object)`. The renderer automatically draws everything currently in the tree.

```js
const scene = new THREE.Scene();
scene.add(someObject);    // now in the world — will be drawn
scene.remove(someObject); // removed from the world — will not be drawn
```

**You can inspect the scene:**
`scene.children` is an array of everything currently in the scene. In Lab 1 it will hold three items: your box, and two lights.

**Why it matters here:** Every tower, enemy, bullet, and tile in the finished game will be added to the scene. When an enemy is destroyed, `scene.remove(enemy.mesh)` removes it from the world.

**Watch for:** Adding an object to the scene does not make it visible by itself. You also need a camera pointed at it and a renderer drawing the result.

---

### Concept: The Camera

**What it is:** Your viewpoint into the 3D scene. The camera defines what part of the scene is visible, from what angle, and how the 3D world is flattened onto your 2D screen.

**The problem it solves:**
A 3D scene has X, Y, and Z coordinates. A screen is flat — it only has X and Y. Something has to define the rules for converting the three-dimensional world into a two-dimensional image. That is the camera's job.

**Two types of camera:**

| Type | How it works | When to use |
|---|---|---|
| `PerspectiveCamera` | Objects farther away look smaller — like real life | Most games, cinematic 3D |
| `OrthographicCamera` | Objects the same size regardless of distance | CAD programs, 2D games, maps |

We use `PerspectiveCamera` now. In a later lab you will use `OrthographicCamera` — it matters for the tower defense top-down view, and it is the camera type used in CAD viewports.

**The four numbers in `PerspectiveCamera`:**

```js
new THREE.PerspectiveCamera(
  75,                           // FOV — field of view in degrees. Higher = wider view.
  CANVAS_WIDTH / CANVAS_HEIGHT, // aspect ratio — must match your canvas (width ÷ height)
  0.1,                          // near clip — objects closer than this become invisible
  1000                          // far clip — objects farther than this become invisible
)
```

**The near and far clip values:**
The renderer only draws what is between `near` and `far` units from the camera. This exists for performance — the GPU does not waste time on objects that are too close to see or too far away to matter.

**Why `camera.position.z = 5` is required:**
By default, the camera sits at position `(0, 0, 0)` — the exact center of the coordinate system. If you add a box at `(0, 0, 0)`, the camera is inside the box and sees nothing. Moving the camera back along the Z axis (`position.z = 5`) puts it 5 units in front of the scene.

**Watch for:** The camera is NOT added to the scene with `scene.add()`. You do not add it to the scene — you pass it directly to the renderer when drawing. This is a common point of confusion.

---

Add these lines inside your `<script type="module">`, after the renderer setup:

```js
  // ── Scene ────────────────────────────────────────────────────────────────
  // The scene holds every 3D object in the world.
  const scene = new THREE.Scene();

  // ── Camera ───────────────────────────────────────────────────────────────
  // The camera defines our viewpoint — where we are looking from and toward.
  const camera = new THREE.PerspectiveCamera(
    75,                           // field of view in degrees
    CANVAS_WIDTH / CANVAS_HEIGHT, // aspect ratio must match the canvas
    0.1,                          // near clip: closer than this = invisible
    1000                          // far clip: farther than this = invisible
  );

  // Move the camera 5 units back along Z so it faces the origin.
  // Without this the camera is at (0,0,0) — inside any object placed there.
  camera.position.z = 5;

  // Draw the scene from the camera's viewpoint.
  // With an empty scene this still shows black — but the system is wired up.
  renderer.render(scene, camera);
```

---

### SAVE AND TRY

Save. Refresh. The canvas is still black — the scene is empty.

**In the console:**
```js
scene.children
```
**Expected:** `[]` — an empty array. Nothing is in the scene yet.

```js
camera.position
```
**Expected:** An object with `x: 0`, `y: 0`, `z: 5`. The camera is 5 units back from the origin.

**Change something:** Change `camera.position.z = 5` to `camera.position.z = 0`. Save. Refresh. The canvas is still black — the scene is empty so there is nothing to see either way. Change it back to `5`. This will matter as soon as we add a box.

---

## Step 5 — Add a Box

Now we add something visible to the scene. In Three.js, every visible 3D object is called a **mesh**. A mesh is made of two parts: a geometry and a material.

---

### Concept: Geometry

**What it is:** The *shape* of a 3D object — a set of points (called vertices) connected into triangles (called faces). Geometry has no color and no appearance. It is pure mathematical shape.

Think of it as: a wire-frame skeleton.

**Smallest possible example:**
```js
// A box: 1 unit wide, 1 unit tall, 1 unit deep.
const geometry = new THREE.BoxGeometry(1, 1, 1);
```

**Three.js includes many built-in geometry types:**

| Geometry | What it looks like | Used for |
|---|---|---|
| `BoxGeometry(w, h, d)` | Cube or rectangular box | Towers, crates, tiles |
| `PlaneGeometry(w, h)` | Flat rectangle | Ground tiles, walls |
| `SphereGeometry(r)` | Ball | Enemies, projectiles |
| `CylinderGeometry(r, r, h)` | Cylinder | Towers, pillars |

**About the units:**
The numbers in `BoxGeometry(1, 1, 1)` are Three.js *units* — not pixels. There is no direct pixel equivalent. The renderer decides how large one unit appears on screen based on the camera's field of view and position. Move the camera closer and the box looks bigger. Move it farther and it looks smaller.

**Watch for:** Geometry is just data — points and faces in memory. Creating a geometry does not put anything on screen. You need a mesh for that.

---

### Concept: Material

**What it is:** How the surface of a geometry *looks* — its color, shininess, transparency, and how it responds to light.

Think of it as: the paint and finish applied to the wire-frame skeleton.

**Two materials you will use in this lab:**

| Material | What it does | Needs lighting? |
|---|---|---|
| `MeshBasicMaterial` | Flat solid color — always fully bright | No |
| `MeshStandardMaterial` | Realistic color — darker where light does not reach | Yes |

We start with `MeshBasicMaterial` so you can see the box without setting up lights first. We add `MeshStandardMaterial` and lights in Step 7.

```js
const material = new THREE.MeshBasicMaterial({ color: 0x00aaff }); // light blue
```

**The color format `0x00aaff`:**
Colors in Three.js use hexadecimal — the same system as CSS colors. The prefix `0x` means "this number is in hexadecimal." `0x00aaff` is exactly the same color as CSS `#00aaff` — a light blue.

**Watch for:** `MeshBasicMaterial` ignores all lights in the scene. Every face is the same brightness. This is useful for debugging (you can always see the shape) but unrealistic. You will switch to `MeshStandardMaterial` in Step 7.

---

### Concept: Mesh

**What it is:** A geometry and a material combined into one 3D object that can be positioned in the scene.

**The relationship:**
```
Geometry alone → invisible shape (has no appearance)
Material alone → appearance with nothing to apply it to
Mesh          → geometry + material = a visible, positionable 3D object
```

**Creating a mesh:**
```js
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh); // adds it to the scene — the renderer will now draw it
```

**Default position:**
Every new mesh starts at position `(0, 0, 0)` — the origin. You move it with:
```js
mesh.position.set(x, y, z);   // set all three at once
mesh.position.x = 2;           // set one axis at a time
```

**Why it matters here:**
Every visual object in the finished game — every tile, tower, enemy, and bullet — will be a mesh (or a group of meshes). Understanding mesh = geometry + material is the foundation of all 3D graphics.

**Watch for:** The same geometry can be shared across multiple meshes. If you create ten tiles, you create the geometry *once* and create ten meshes that all reference it. The same material can also be shared. This saves memory.

---

Add these lines inside your `<script type="module">`, after the camera setup and before `renderer.render()`:

```js
  // ── Box ──────────────────────────────────────────────────────────────────
  // Geometry: the shape — a 1×1×1 unit cube (no color, no appearance yet).
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

  // Material: the surface — flat light-blue color.
  // MeshBasicMaterial ignores lights — useful here since we have none yet.
  const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });

  // Mesh: geometry + material = a visible, positionable 3D object.
  const box = new THREE.Mesh(boxGeometry, boxMaterial);

  // Add the box to the scene. The renderer will now draw it.
  scene.add(box);

  // renderer.render() is already below — do not add it again.
```

---

### SAVE AND TRY

Save. Refresh.

**You should see:** A light blue square in the center of the black canvas.

It looks flat — like a 2D square. This is because `MeshBasicMaterial` gives every face the same flat color, and the camera is looking straight at the front face. We fix this in Step 7 with lighting.

**In the console:**
```js
scene.children.length
```
**Expected:** `1` — just the box.

```js
box.position
```
**Expected:** `{x: 0, y: 0, z: 0}` — the box is at the origin.

**Change something:** Change `color: 0x00aaff` to `color: 0xff4444`. Save. Refresh. The box turns red. Change it back to `0x00aaff`.

---

## Challenge: Change the Box Proportions

**You know:** `BoxGeometry(width, height, depth)` defines the box dimensions in Three.js units.

**Task:** Change the box so it is wider than it is tall — 2 units wide, 0.5 units tall, 1 unit deep. This is the proportions of a flat tile, which is exactly what we will use for the game grid in Lab 4.

**Starting code:**
```js
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
```

**Hint:** The three numbers are width, height, and depth, in that order.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
const boxGeometry = new THREE.BoxGeometry(2, 0.5, 1);
```

**Key insight:** In Lab 4, every tile on the game grid will share one `PlaneGeometry` — created once, used by many meshes. Geometry is data; creating it is cheap but sharing it is still better. One geometry in memory, fifty tile meshes all pointing to it.

Change the values back to `(1, 1, 1)` before continuing.

</details>

---

## Step 6 — The Animation Loop

Right now `renderer.render()` is called once and the image is frozen. To animate, the renderer must redraw the scene many times per second — updating it each time before drawing.

---

### Concept: `requestAnimationFrame`

**What it is:** A browser function that says "call this function just before the next time the screen refreshes." Screens typically refresh 60 times per second, so `requestAnimationFrame` runs your function approximately 60 times per second.

**The problem before:**
```js
// This runs once and stops:
renderer.render(scene, camera);

// This would work but blocks the browser — the page freezes:
while (true) {
  renderer.render(scene, camera);
}
```

**The solution:**
`requestAnimationFrame` schedules one call and then stops — but you pass it the same function again, creating a loop that the browser controls:

```js
function loop() {
  requestAnimationFrame(loop); // schedule the next call
  renderer.render(scene, camera); // draw the current frame
}
loop(); // start the loop
```

**Why the browser controls it:**
The browser knows when the screen is about to refresh. It calls your function at exactly the right moment — never faster than the screen can display it, and it pauses automatically when the browser tab is hidden (no wasted computation on a tab you cannot see).

**Watch for:** The function schedules itself — `loop` calls `requestAnimationFrame(loop)`. This is called *recursion*. It looks like it would run forever, but the browser controls the timing and stops it when the tab is closed.

---

### Mental Model: The Game Loop

**Official name:** Game Loop (also called the Render Loop or Animation Loop)

**Why it exists:**
Every interactive program needs to do two things repeatedly:
1. **Update** — change the state of the world: move objects, check collisions, process input
2. **Render** — draw the current state of the world to screen

Without a loop, you draw the initial state once and nothing ever changes.

**The order always matters — update first, then render:**
```
update() → render() → wait for screen refresh → update() → render() → ...
```

If you render before updating, you draw the *previous* frame's state. The player presses a key, the update moves the character, but the render already happened — the character appears to lag by one frame.

**In this lab:** The loop rotates the box a tiny amount each frame and then renders. The rotation accumulates across frames, creating continuous spinning. In Lab 3 we add *delta time* — a way to make the game run at the same speed on fast computers and slow ones.

**You will see this again in:** Every lab from Lab 3 onwards. The game loop is permanent. It never goes away.

---

Replace the single `renderer.render(scene, camera)` line at the bottom of your script with this animation loop. The render call moves inside the loop function:

```js
  // ── Animation Loop ───────────────────────────────────────────────────────
  // Called approximately 60 times per second by the browser.
  function animate() {
    requestAnimationFrame(animate); // schedule the next call before anything else

    // Rotate the box a small amount each frame.
    // 0.01 radians × 60 frames/second ≈ 34 degrees/second.
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    renderer.render(scene, camera); // draw the scene with the updated rotation
  }

  animate(); // start the loop — this call kicks off the first frame
```

---

### SAVE AND TRY

Save. Refresh.

**You should see:** The light blue shape rotating continuously — tumbling diagonally because it is spinning on both X and Y axes simultaneously.

It still looks flat because `MeshBasicMaterial` ignores lighting. You can see it is 3D only because of the rotation. Step 7 fixes this.

**In the console:**
```js
box.rotation.y
```
**Expected:** A number that is different every time you run the command — the rotation is continuously changing.

**Change something:** Change `box.rotation.x += 0.01` to `box.rotation.x += 0`. Save. Refresh. The box now only spins on the Y axis — horizontal spin only. Change it back to `0.01`.

---

## Challenge: Make It Spin the Other Way

**You know:** Adding a positive value to `rotation.y` spins the box one direction. Adding a negative value spins it the other direction.

**Task:** Make the box spin *backward* on the Y axis and *forward* on the X axis — the opposite of what it does now.

**Starting code:**
```js
box.rotation.x += 0.01;
box.rotation.y += 0.01;
```

**No hints — you have everything you need.**

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
box.rotation.x += 0.01;
box.rotation.y -= 0.01; // negative sign reverses direction
```

**Key insight:** Rotation in Three.js is measured in *radians*, not degrees. One full rotation is `2 × Math.PI` radians (approximately 6.28). You do not need to know this yet — just know that `0.01` radians per frame is a slow, smooth spin. Lab 3 covers radians properly when we calculate rotation speed.

Change it back to `+= 0.01` before continuing.

</details>

---

## Step 7 — Lighting and a 3D-Looking Material

The flat blue box tells you it is rotating but looks like a spinning cardboard shape. Lighting makes it look genuinely solid and three-dimensional.

---

### Concept: Why Lighting Makes Things Look 3D

**What it is:**
In real life, a 3D object looks three-dimensional because light hits different faces at different angles. Faces pointing toward the light are bright. Faces pointing away are dark. This difference in brightness tells your brain the object has depth.

`MeshBasicMaterial` does not simulate this — every face gets the same flat color regardless of direction. `MeshStandardMaterial` does simulate it — it uses the lights in your scene to calculate how bright each face should be.

**Two lights you will add:**

**`DirectionalLight`** — simulates a distant light source (like the sun). It has a direction and casts light from that direction onto every object in the scene. Faces pointing toward it are bright; faces pointing away are dark.

**`AmbientLight`** — adds a base level of brightness to everything equally. Without it, the faces pointing away from the directional light are completely black. The ambient light fills in the shadows just enough to see the shape.

**Together they create:**
- Bright face (facing the sun): directional + ambient
- Medium face (side): partial directional + ambient
- Dark face (facing away): ambient only

This combination is used in almost every 3D game and application.

```js
// Directional light: simulates sunlight
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7); // light comes from this direction toward the origin
scene.add(sunLight);             // lights ARE added to the scene

// Ambient light: prevents fully-black shadows
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
```

**Watch for:** Lights ARE added to the scene with `scene.add()` — unlike the camera, which is not. This trips people up constantly.

---

### Concept: `MeshStandardMaterial` vs `MeshBasicMaterial`

**What it is:**
`MeshStandardMaterial` is a physically-based material — it simulates how light behaves in the real world. It uses the lights in the scene to calculate how bright each face should appear.

**Side by side:**

| | `MeshBasicMaterial` | `MeshStandardMaterial` |
|---|---|---|
| Lighting? | Ignored — always full brightness | Required — dark without lights |
| Looks 3D? | No — all faces identical | Yes — faces vary by lighting |
| Performance | Slightly cheaper | Slightly more expensive |
| Use for | Debugging, UI, sprites | Any object that should look solid |

**You only change one line:** The `MeshBasicMaterial` line becomes `MeshStandardMaterial`. Everything else stays the same.

**Watch for:** If you switch to `MeshStandardMaterial` without adding lights, the box will be completely black. The material needs light to calculate color.

---

**Change 1:** In your script, replace the `MeshBasicMaterial` line:

```js
  // Replace this:
  const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff });

  // With this:
  // MeshStandardMaterial responds to lights — faces closer to the light are brighter.
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
```

**Change 2:** Add lights to the scene. Place these lines after `scene.add(box)`:

```js
  // ── Lights ───────────────────────────────────────────────────────────────
  // Directional light: simulates sunlight from upper-right-front.
  const sunLight = new THREE.DirectionalLight(
    0xffffff, // white light
    1.5       // intensity — 1.0 is standard, higher is brighter
  );
  sunLight.position.set(5, 10, 7); // light source position (points toward origin)
  scene.add(sunLight);             // lights go in the scene, same as meshes

  // Ambient light: low-intensity fill that prevents fully-black shadow faces.
  const ambientLight = new THREE.AmbientLight(
    0xffffff, // white light
    0.4       // low intensity — just enough to reveal the shape in shadow
  );
  scene.add(ambientLight);
```

---

### SAVE AND TRY

Save. Refresh.

**You should see:** The box rotating with visible shading. The face pointing toward the upper-right light source is bright. The face pointing away is darker. The box looks unmistakably three-dimensional now.

**You should notice:** The top face is brighter than the front face, and the bottom face is the darkest — this matches the light position at `(5, 10, 7)`. The `10` on the Y axis (up) means the light is mostly above.

**In the console:**
```js
scene.children.length
```
**Expected:** `3` — the box mesh, the directional light, and the ambient light.

**Change something:** Change the directional light intensity from `1.5` to `0`. Save. Refresh. The box is now lit only by the dim ambient light — you can barely see the shape. Change it back to `1.5`.

---

## Challenge: Colored Lighting

**You know:** `DirectionalLight(color, intensity)` takes a hex color as its first argument.

**Task:** Change the directional light to a warm orange (`0xff8844`) and the ambient light to a cool dark blue (`0x223344`). Observe how the lit faces and shadow faces look different in color, not just brightness. This technique — warm light, cool shadow — is used throughout the game for visual atmosphere.

**Starting code:**
```js
const sunLight    = new THREE.DirectionalLight(0xffffff, 1.5);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
const sunLight    = new THREE.DirectionalLight(0xff8844, 1.5); // warm orange sun
const ambientLight = new THREE.AmbientLight(0x223344, 0.4);   // cool blue fill
```

**Key insight:** The lit faces take on the directional light's color. The shadow faces take on the ambient light's color. Using a warm light with a cool shadow is a classic technique from film and game art — it makes 3D objects feel more alive than neutral white lighting. You will use this intentionally in the game to make towers feel warm and enemies feel cold.

Change the colors back to `0xffffff` for both before continuing.

</details>

---

## Final Check

Go through this table before moving to Lab 2. Every item should work exactly as described.

| Feature | How to verify |
|---|---|
| Page loads without errors | The browser console (`F12`) shows no red errors |
| Three.js loads from CDN | Refresh the page — no network error in console |
| Canvas appears on the page | A dark rectangle is visible when the page loads |
| Canvas is the right size | Right-click the canvas → Inspect — it shows `width="800" height="600"` |
| Box is visible | A blue cube is visible in the center of the canvas |
| Box rotates | The cube tumbles continuously — it does not stop or freeze |
| Box looks 3D | Different faces have noticeably different brightness levels |
| Lights are in the scene | `scene.children.length` in console returns `3` |
| Camera is positioned | `camera.position.z` in console returns `5` |

---

## Your Complete `index.html`

Here is the entire file from this lab. If any step went wrong, compare your file against this line by line.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Grid Commander</title>
  </head>
  <body>

    <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
        }
      }
    </script>

    <script type="module">
      import * as THREE from 'three';

      // ── Constants ────────────────────────────────────────────────────────
      const CANVAS_WIDTH  = 800; // canvas width in pixels
      const CANVAS_HEIGHT = 600; // canvas height in pixels

      // ── Renderer ─────────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
      document.body.appendChild(renderer.domElement);

      // ── Scene & Camera ────────────────────────────────────────────────────
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        75,
        CANVAS_WIDTH / CANVAS_HEIGHT,
        0.1,
        1000
      );
      camera.position.z = 5;

      // ── Box ───────────────────────────────────────────────────────────────
      const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
      const box         = new THREE.Mesh(boxGeometry, boxMaterial);
      scene.add(box);

      // ── Lights ────────────────────────────────────────────────────────────
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
      sunLight.position.set(5, 10, 7);
      scene.add(sunLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      // ── Animation Loop ────────────────────────────────────────────────────
      function animate() {
        requestAnimationFrame(animate);
        box.rotation.x += 0.01;
        box.rotation.y += 0.01;
        renderer.render(scene, camera);
      }

      animate();
    </script>

  </body>
</html>
```

---

## Quick Check Answers

**1. What do you think a "scene" is in a 3D program?**
A scene is a container that holds every object in your 3D world — meshes, lights, cameras (though in Three.js the camera is kept separately). In this lab, `scene.children` contains three items: the box mesh, the directional light, and the ambient light. The renderer draws everything currently in the scene on every frame. When the game is running, enemies and towers will be added and removed from the scene as the game progresses.

**2. A 3D world has three axes (X, Y, Z). A screen is flat — only X and Y. What has to happen to show a 3D world on a flat screen?**
The camera performs a *projection* — it applies a mathematical transformation that converts 3D coordinates into 2D screen coordinates. The `PerspectiveCamera` uses a projection that makes objects farther away appear smaller, which is how human vision works. The `near` and `far` values define the range of depth that is visible. Everything outside that range is discarded. This projection step is why you need a camera — without it, there is no rule for how to flatten the 3D world.

**3. What do you think is the difference between a shape's geometry and its material?**
Geometry is the mathematical shape — the positions of the vertices and how they connect into triangles. It has no color or appearance. Material is the surface description — color, how shiny it is, whether it is transparent, and how it responds to light. The same geometry can have different materials applied to it (imagine the same cube shape that is sometimes metal, sometimes wood). The same material can be shared across different geometries. A mesh combines one geometry and one material into a single visible 3D object that can be positioned in the scene.

---

*End of Lab 1.*

*Lab 2 adds TypeScript to this exact scene. The same renderer, scene, camera, box, and animation loop — but now with a TypeScript compiler that catches mistakes before you run the code, and with explicit types on every variable.*
