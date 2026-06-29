# MatJS — Project Setup Guide
## Windows, monorepo, TypeScript, from scratch.

---

## Step 1: Install pnpm

pnpm is a faster, smarter version of npm that handles monorepos
properly. npm puts copies of packages everywhere; pnpm stores one
copy and links to it. For a monorepo with multiple packages that
share dependencies, this matters.

Open PowerShell (or Windows Terminal) and run:

```powershell
npm install -g pnpm
```

Verify:

```powershell
pnpm --version
# Should show 8.x.x or higher
```

---

## Step 2: Create the project folder

```powershell
# Go to wherever you keep projects
cd C:\Users\YourName\projects    # or wherever you want it

# Create the root folder
mkdir matjs
cd matjs
```

---

## Step 3: Initialize the monorepo

```powershell
# Initialize pnpm workspace
pnpm init
```

This creates a package.json. Now open it and replace everything
with this:

```json
{
  "name": "matjs",
  "version": "0.0.1",
  "private": true,
  "description": "A MATLAB-compatible math engine for JavaScript",
  "scripts": {
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "dev": "turbo dev"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.0.0"
  }
}
```

**What each field means:**
- `"private": true` — this root package will never be published to npm.
  Only the packages inside `packages/` get published.
- `"scripts"` — commands you can run with `pnpm <command>`.
  `turbo build` tells Turborepo to build ALL packages in the right order.
- `"devDependencies"` — tools needed to build the project, not part
  of the published library.

---

## Step 4: Create the pnpm workspace file

Create a file called `pnpm-workspace.yaml` in the root folder:

```yaml
packages:
  - "packages/*"
```

This tells pnpm: "everything inside the packages/ folder is a
separate package in this monorepo." Each subfolder of packages/
will be its own npm package with its own package.json.

---

## Step 5: Create the Turborepo config

Create a file called `turbo.json` in the root folder:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**What this means:**
- `"build"` pipeline: before building a package, first build
  everything it depends on (`"^build"` means "build my dependencies first").
  Output goes into `dist/` folder.
- `"test"` pipeline: run tests after building.
- `"dev"` pipeline: don't cache (always re-run), keep running
  (persistent = watch mode).

---

## Step 6: Create the TypeScript base config

Create `tsconfig.base.json` in the root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**What each option means:**
- `"target": "ES2020"` — compile to modern JavaScript (2020 features).
  Older targets would require more polyfills.
- `"module": "ESNext"` — use ES modules (import/export) not CommonJS
  (require/module.exports). Modern standard.
- `"declaration": true` — generate `.d.ts` type definition files.
  These let other TypeScript users import your library and get
  autocomplete and type checking.
- `"declarationMap": true` — maps type definitions back to source.
  Makes "go to definition" in editors work correctly.
- `"sourceMap": true` — maps compiled JS back to TypeScript source.
  Makes debugging show TypeScript lines, not compiled JS lines.
- `"strict": true` — enables ALL strict type checks. Catches more
  bugs at compile time. Always use this.
- `"esModuleInterop": true` — allows cleaner imports from CommonJS
  packages (most npm packages are still CommonJS).
- `"skipLibCheck": true` — skip type checking of node_modules.
  Speeds up compilation, avoids errors from poorly typed packages.

---

## Step 7: Create the packages folder structure

```powershell
# Create the three package directories
mkdir packages\core
mkdir packages\parser
mkdir packages\ui
```

Your folder structure should now look like this:

```
matjs/
├── packages/
│   ├── core/
│   ├── parser/
│   └── ui/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## Step 8: Set up @matjs/core

Navigate into the core package:

```powershell
cd packages\core
pnpm init
```

Replace the generated package.json with:

```json
{
  "name": "@matjs/core",
  "version": "0.1.0",
  "description": "Core linear algebra engine for MatJS",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest run",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "vitest": "^1.0.0",
    "typescript": "^5.0.0"
  },
  "files": [
    "dist"
  ]
}
```

**What each field means:**
- `"name": "@matjs/core"` — scoped package name. The `@matjs/` prefix
  groups your packages together on npm. When you publish, people install
  with `npm install @matjs/core`.
- `"main"` — entry point for CommonJS (old require() style).
- `"module"` — entry point for ES modules (modern import style).
- `"types"` — entry point for TypeScript type definitions.
- `"exports"` — modern way to declare entry points. Overrides main/module
  for bundlers that support it. Lets the same package work in both
  CommonJS and ESM environments.
- `"scripts"`:
  - `tsup` — a zero-config TypeScript bundler. Much simpler than
    configuring webpack/rollup manually for a library.
  - `--format cjs,esm` — output both CommonJS and ES module formats.
  - `--dts` — generate TypeScript declaration files.
  - `vitest` — a fast test runner compatible with Jest's API.
- `"files": ["dist"]` — when publishing to npm, only include the
  `dist/` folder. Don't publish source code, tests, or config files.

Create the TypeScript config for core:

```powershell
# Still in packages/core
```

Create `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**What this means:**
- `"extends": "../../tsconfig.base.json"` — inherit all settings from
  the root config. Only override what needs to be different for this package.
- `"outDir": "dist"` — compiled JavaScript goes here.
- `"rootDir": "src"` — TypeScript source files are here.

Create the src folder and first file:

```powershell
mkdir src
```

Create `src/index.ts`:

```typescript
// src/index.ts
// This is the entry point for @matjs/core.
// Everything exported from here is available to users of the package.

export { Matrix } from './matrix/Matrix';
export { Vector } from './matrix/Vector';
export type { MatrixLike, Dimensions } from './matrix/types';
```

Create `src/matrix/` folder:

```powershell
mkdir src\matrix
```

Create `src/matrix/types.ts`:

```typescript
// src/matrix/types.ts
// Type definitions used throughout the core package.
// Defining types in one place means changing a type automatically
// updates all the code that uses it.

/**
 * Anything that can be used to create a Matrix.
 * The | means "or" — a MatrixLike can be any of these types.
 */
export type MatrixLike =
  | number[][]        // 2D array: [[1,2],[3,4]]
  | number[]          // 1D array treated as a row vector: [1,2,3]
  | Matrix;           // another Matrix (copy constructor)

// Forward declaration needed because Matrix.ts imports from this file
// and this file references Matrix. TypeScript handles this fine.
import type { Matrix } from './Matrix';

/**
 * The dimensions of a matrix: rows and columns.
 * Using an interface (named object type) instead of a plain object
 * makes the code self-documenting.
 */
export interface Dimensions {
  rows: number;
  cols: number;
}

/**
 * Options for matrix operations.
 * The ? means the field is optional.
 */
export interface MatrixOptions {
  tolerance?: number;    // for floating-point comparisons (default: 1e-10)
}
```

Now create the Matrix class. This is the core of the entire project:

Create `src/matrix/Matrix.ts`:

```typescript
// src/matrix/Matrix.ts
// The Matrix class — the foundation of the entire matjs library.
//
// Design decisions:
// - Immutable: operations return NEW matrices, never modify in place.
//   This prevents bugs where a matrix is accidentally changed.
// - Flat storage: internally, an m×n matrix is stored as a single
//   array of m*n numbers. Entry (i,j) is at index i*cols + j.
//   This is more cache-friendly than an array of arrays.
// - TypeScript generics are NOT used here — Matrix is always a
//   matrix of numbers. Generics would add complexity without benefit.

import type { MatrixLike, Dimensions, MatrixOptions } from './types';

export class Matrix {
  // ============================================================
  // INTERNAL STORAGE
  // ============================================================

  // The matrix data stored as a flat array.
  // Private means only code inside this class can access it directly.
  // Readonly means the reference cannot be reassigned after construction.
  // (The contents of the array can still change — see note on immutability below.)
  private readonly _data: Float64Array;

  // Number of rows and columns.
  // Readonly means these cannot be changed after construction.
  readonly rows: number;
  readonly cols: number;

  // Default tolerance for floating-point comparisons.
  // Two numbers are considered equal if they differ by less than this.
  // 1e-10 = 0.0000000001
  static readonly DEFAULT_TOLERANCE = 1e-10;

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  /**
   * Create a Matrix from various input formats.
   *
   * Examples:
   *   new Matrix([[1,2],[3,4]])        // from 2D array
   *   new Matrix([1,2,3,4], 2, 2)     // from flat array with dimensions
   *   new Matrix(3, 4)                 // 3x4 matrix of zeros
   */
  constructor(
    data: number[][] | number[] | Float64Array | number,
    rows?: number,
    cols?: number
  ) {
    // Case 1: new Matrix(3, 4) — create a rows×cols matrix of zeros
    if (typeof data === 'number') {
      this.rows = data;
      // cols defaults to rows if not provided (makes a square matrix)
      this.cols = rows ?? data;
      this._data = new Float64Array(this.rows * this.cols);
      return;
    }

    // Case 2: new Matrix([[1,2],[3,4]]) — from 2D array
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const data2D = data as number[][];
      this.rows = data2D.length;
      // All rows must have the same length.
      // data2D[0].length is the length of the first row.
      this.cols = data2D[0]?.length ?? 0;
      this._data = new Float64Array(this.rows * this.cols);

      // Fill the flat array from the 2D array.
      // For row i and column j, the flat index is i * this.cols + j.
      for (let i = 0; i < this.rows; i++) {
        if (data2D[i].length !== this.cols) {
          throw new Error(
            `Row ${i} has ${data2D[i].length} elements but expected ${this.cols}`
          );
        }
        for (let j = 0; j < this.cols; j++) {
          this._data[i * this.cols + j] = data2D[i][j];
        }
      }
      return;
    }

    // Case 3: new Matrix([1,2,3,4], 2, 2) — from flat array with dimensions
    if ((Array.isArray(data) || data instanceof Float64Array) && rows !== undefined && cols !== undefined) {
      this.rows = rows;
      this.cols = cols;
      if (data.length !== rows * cols) {
        throw new Error(
          `Data length ${data.length} does not match dimensions ${rows}×${cols} = ${rows * cols}`
        );
      }
      this._data = new Float64Array(data);
      return;
    }

    throw new Error('Invalid Matrix constructor arguments');
  }

  // ============================================================
  // ELEMENT ACCESS
  // ============================================================

  /**
   * Get the value at row i, column j (0-indexed).
   *
   * Why 0-indexed? JavaScript arrays are 0-indexed. MATLAB is 1-indexed.
   * The parser layer will handle converting MATLAB's 1-indexed access
   * to 0-indexed calls here.
   */
  get(i: number, j: number): number {
    this._checkBounds(i, j);
    return this._data[i * this.cols + j];
  }

  /**
   * Return a new Matrix with the value at (i,j) set to value.
   * Does NOT modify this matrix (immutable design).
   */
  set(i: number, j: number, value: number): Matrix {
    this._checkBounds(i, j);
    const newData = new Float64Array(this._data);
    newData[i * this.cols + j] = value;
    return new Matrix(newData, this.rows, this.cols);
  }

  /**
   * Get an entire row as a new Matrix (1×cols).
   */
  row(i: number): Matrix {
    if (i < 0 || i >= this.rows) {
      throw new Error(`Row index ${i} out of bounds for ${this.rows}×${this.cols} matrix`);
    }
    const rowData = this._data.slice(i * this.cols, (i + 1) * this.cols);
    return new Matrix(rowData, 1, this.cols);
  }

  /**
   * Get an entire column as a new Matrix (rows×1).
   */
  col(j: number): Matrix {
    if (j < 0 || j >= this.cols) {
      throw new Error(`Column index ${j} out of bounds for ${this.rows}×${this.cols} matrix`);
    }
    const colData = new Float64Array(this.rows);
    for (let i = 0; i < this.rows; i++) {
      colData[i] = this._data[i * this.cols + j];
    }
    return new Matrix(colData, this.rows, 1);
  }

  // ============================================================
  // DIMENSIONS
  // ============================================================

  get dimensions(): Dimensions {
    return { rows: this.rows, cols: this.cols };
  }

  get isSquare(): boolean {
    return this.rows === this.cols;
  }

  get isVector(): boolean {
    return this.rows === 1 || this.cols === 1;
  }

  get isRowVector(): boolean {
    return this.rows === 1;
  }

  get isColumnVector(): boolean {
    return this.cols === 1;
  }

  // ============================================================
  // STATIC FACTORY METHODS
  // ============================================================

  /**
   * Create an n×n identity matrix.
   * Identity matrix: 1s on the diagonal, 0s everywhere else.
   */
  static identity(n: number): Matrix {
    const data = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
      data[i * n + i] = 1;    // diagonal entries: i*n+i is the flat index for (i,i)
    }
    return new Matrix(data, n, n);
  }

  /**
   * Create an m×n matrix of all zeros.
   */
  static zeros(m: number, n?: number): Matrix {
    const cols = n ?? m;
    return new Matrix(m, cols);
  }

  /**
   * Create an m×n matrix of all ones.
   */
  static ones(m: number, n?: number): Matrix {
    const cols = n ?? m;
    const data = new Float64Array(m * cols).fill(1);
    return new Matrix(data, m, cols);
  }

  /**
   * Create a diagonal matrix from an array of values.
   * The values go on the main diagonal; everything else is 0.
   */
  static diagonal(values: number[]): Matrix {
    const n = values.length;
    const data = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
      data[i * n + i] = values[i];
    }
    return new Matrix(data, n, n);
  }

  // ============================================================
  // BASIC OPERATIONS
  // These all return NEW matrices (immutable design).
  // ============================================================

  /**
   * Matrix addition: A + B.
   * Both matrices must have the same dimensions.
   */
  add(other: Matrix): Matrix {
    this._checkSameDimensions(other, 'add');
    const result = new Float64Array(this._data.length);
    for (let k = 0; k < this._data.length; k++) {
      result[k] = this._data[k] + other._data[k];
    }
    return new Matrix(result, this.rows, this.cols);
  }

  /**
   * Matrix subtraction: A - B.
   */
  subtract(other: Matrix): Matrix {
    this._checkSameDimensions(other, 'subtract');
    const result = new Float64Array(this._data.length);
    for (let k = 0; k < this._data.length; k++) {
      result[k] = this._data[k] - other._data[k];
    }
    return new Matrix(result, this.rows, this.cols);
  }

  /**
   * Scalar multiplication: multiply every entry by a number.
   */
  scale(scalar: number): Matrix {
    const result = new Float64Array(this._data.length);
    for (let k = 0; k < this._data.length; k++) {
      result[k] = this._data[k] * scalar;
    }
    return new Matrix(result, this.rows, this.cols);
  }

  /**
   * Matrix multiplication: A * B (NOT element-wise).
   *
   * For A (m×n) and B (n×p), the result is (m×p).
   * Entry (i,j) of result = dot product of row i of A with column j of B.
   *
   * This is the most important operation in linear algebra.
   * Time complexity: O(m * n * p) — can be slow for large matrices.
   */
  multiply(other: Matrix): Matrix {
    if (this.cols !== other.rows) {
      throw new Error(
        `Cannot multiply ${this.rows}×${this.cols} by ${other.rows}×${other.cols}: ` +
        `inner dimensions must match (${this.cols} ≠ ${other.rows})`
      );
    }

    const result = new Float64Array(this.rows * other.cols);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          // this.get(i,k) * other.get(k,j) but using direct array access
          // for speed (avoids bounds checking on every inner loop iteration)
          sum += this._data[i * this.cols + k] * other._data[k * other.cols + j];
        }
        result[i * other.cols + j] = sum;
      }
    }

    return new Matrix(result, this.rows, other.cols);
  }

  /**
   * Element-wise multiplication: A .* B (MATLAB notation).
   * Each entry of A multiplied by the corresponding entry of B.
   * Both matrices must have the same dimensions.
   */
  elementMultiply(other: Matrix): Matrix {
    this._checkSameDimensions(other, 'element-wise multiply');
    const result = new Float64Array(this._data.length);
    for (let k = 0; k < this._data.length; k++) {
      result[k] = this._data[k] * other._data[k];
    }
    return new Matrix(result, this.rows, this.cols);
  }

  /**
   * Transpose: swap rows and columns.
   * Entry (i,j) of A becomes entry (j,i) of A^T.
   */
  transpose(): Matrix {
    const result = new Float64Array(this.rows * this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        // Entry (i,j) of this goes to entry (j,i) of result.
        // In result (which is cols×rows), (j,i) is at index j*this.rows + i.
        result[j * this.rows + i] = this._data[i * this.cols + j];
      }
    }
    return new Matrix(result, this.cols, this.rows);
  }

  // ============================================================
  // CONVERSION AND DISPLAY
  // ============================================================

  /**
   * Convert to a 2D JavaScript array.
   * Useful for interoperability with other libraries.
   */
  toArray(): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < this.rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < this.cols; j++) {
        row.push(this._data[i * this.cols + j]);
      }
      result.push(row);
    }
    return result;
  }

  /**
   * Convert to a flat 1D array.
   */
  toFlatArray(): number[] {
    return Array.from(this._data);
  }

  /**
   * Format the matrix as a string for display.
   * Aligns columns so numbers line up.
   */
  toString(precision = 4): string {
    const rows: string[] = [];
    for (let i = 0; i < this.rows; i++) {
      const entries: string[] = [];
      for (let j = 0; j < this.cols; j++) {
        entries.push(this._data[i * this.cols + j].toFixed(precision).padStart(precision + 4));
      }
      rows.push(`  ${entries.join('  ')}`);
    }
    return rows.join('\n');
  }

  // ============================================================
  // PRIVATE HELPERS
  // These are only used internally, not exposed to users.
  // ============================================================

  private _checkBounds(i: number, j: number): void {
    if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
      throw new Error(
        `Index (${i}, ${j}) out of bounds for ${this.rows}×${this.cols} matrix`
      );
    }
  }

  private _checkSameDimensions(other: Matrix, operation: string): void {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error(
        `Cannot ${operation} matrices of different sizes: ` +
        `${this.rows}×${this.cols} and ${other.rows}×${other.cols}`
      );
    }
  }
}
```

Create `src/matrix/Vector.ts`:

```typescript
// src/matrix/Vector.ts
// A Vector is just a Matrix with one column (or one row).
// We give it a separate class for convenience — cleaner API
// for the common case of working with 1D data.

import { Matrix } from './Matrix';

export class Vector extends Matrix {
  /**
   * Create a column vector from an array of numbers.
   * [1, 2, 3] becomes a 3×1 matrix.
   */
  constructor(values: number[]) {
    super(values.map(v => [v]));
  }

  /**
   * Get the value at position i.
   * More natural than .get(i, 0) for a column vector.
   */
  at(i: number): number {
    return this.get(i, 0);
  }

  /**
   * Dot product with another vector.
   * Multiply matching entries and sum them.
   */
  dot(other: Vector): number {
    if (this.rows !== other.rows) {
      throw new Error(
        `Cannot dot vectors of different lengths: ${this.rows} and ${other.rows}`
      );
    }
    let sum = 0;
    for (let i = 0; i < this.rows; i++) {
      sum += this.get(i, 0) * other.get(i, 0);
    }
    return sum;
  }

  /**
   * The Euclidean length (norm) of this vector.
   * sqrt(v1² + v2² + ... + vn²)
   */
  get norm(): number {
    return Math.sqrt(this.dot(this));
  }

  /**
   * Return a unit vector pointing in the same direction.
   * Divide every entry by the norm.
   */
  normalize(): Vector {
    const n = this.norm;
    if (n < Matrix.DEFAULT_TOLERANCE) {
      throw new Error('Cannot normalize the zero vector');
    }
    const values: number[] = [];
    for (let i = 0; i < this.rows; i++) {
      values.push(this.get(i, 0) / n);
    }
    return new Vector(values);
  }
}
```

---

## Step 9: Install dependencies and build

Go back to the root:

```powershell
cd ..\..    # or: cd C:\path\to\matjs
```

Install everything:

```powershell
pnpm install
```

Install tools for the core package:

```powershell
cd packages\core
pnpm add -D tsup vitest typescript
```

Back to root and build:

```powershell
cd ..\..
pnpm build
```

---

## Step 10: Write your first test

Create `packages/core/src/matrix/Matrix.test.ts`:

```typescript
// Matrix.test.ts
// Tests for the Matrix class.
// We use Vitest — it has the same API as Jest but is faster.
//
// Test-driven development means: write the test first,
// run it (it fails), then write the code that makes it pass.
// For this file, code already exists — but the pattern matters.

import { describe, it, expect } from 'vitest';
import { Matrix } from './Matrix';

// describe() groups related tests together.
// The string is a label shown in test output.
describe('Matrix construction', () => {

  // it() (or test()) defines one test case.
  // The string describes what should happen.
  it('creates a matrix from a 2D array', () => {
    const m = new Matrix([[1, 2], [3, 4]]);
    // expect() starts an assertion.
    // .toBe() checks strict equality.
    expect(m.rows).toBe(2);
    expect(m.cols).toBe(2);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(2);
    expect(m.get(1, 0)).toBe(3);
    expect(m.get(1, 1)).toBe(4);
  });

  it('creates a zero matrix from dimensions', () => {
    const m = new Matrix(3, 4);
    expect(m.rows).toBe(3);
    expect(m.cols).toBe(4);
    expect(m.get(0, 0)).toBe(0);
    expect(m.get(2, 3)).toBe(0);
  });

  it('throws on mismatched row lengths', () => {
    // expect(() => ...).toThrow() checks that the function throws an error.
    expect(() => new Matrix([[1, 2], [3]])).toThrow();
  });
});

describe('Matrix identity', () => {
  it('creates the correct identity matrix', () => {
    const I = Matrix.identity(3);
    expect(I.get(0, 0)).toBe(1);
    expect(I.get(1, 1)).toBe(1);
    expect(I.get(2, 2)).toBe(1);
    expect(I.get(0, 1)).toBe(0);
    expect(I.get(1, 0)).toBe(0);
  });
});

describe('Matrix addition', () => {
  it('adds two matrices correctly', () => {
    const A = new Matrix([[1, 2], [3, 4]]);
    const B = new Matrix([[5, 6], [7, 8]]);
    const C = A.add(B);
    expect(C.get(0, 0)).toBe(6);
    expect(C.get(0, 1)).toBe(8);
    expect(C.get(1, 0)).toBe(10);
    expect(C.get(1, 1)).toBe(12);
  });

  it('does not modify original matrices (immutable)', () => {
    const A = new Matrix([[1, 2], [3, 4]]);
    const B = new Matrix([[5, 6], [7, 8]]);
    A.add(B);
    // A should be unchanged
    expect(A.get(0, 0)).toBe(1);
  });

  it('throws when adding matrices of different sizes', () => {
    const A = new Matrix([[1, 2], [3, 4]]);
    const B = new Matrix([[1, 2, 3]]);
    expect(() => A.add(B)).toThrow();
  });
});

describe('Matrix multiplication', () => {
  it('multiplies two matrices correctly', () => {
    const A = new Matrix([[1, 2], [3, 4]]);
    const B = new Matrix([[5, 6], [7, 8]]);
    const C = A.multiply(B);
    // (1*5 + 2*7) = 19
    expect(C.get(0, 0)).toBe(19);
    // (1*6 + 2*8) = 22
    expect(C.get(0, 1)).toBe(22);
    // (3*5 + 4*7) = 43
    expect(C.get(1, 0)).toBe(43);
    // (3*6 + 4*8) = 50
    expect(C.get(1, 1)).toBe(50);
  });

  it('multiplies identity matrix correctly', () => {
    const A = new Matrix([[1, 2], [3, 4]]);
    const I = Matrix.identity(2);
    const result = A.multiply(I);
    expect(result.get(0, 0)).toBe(1);
    expect(result.get(0, 1)).toBe(2);
    expect(result.get(1, 0)).toBe(3);
    expect(result.get(1, 1)).toBe(4);
  });

  it('throws when inner dimensions do not match', () => {
    const A = new Matrix([[1, 2, 3]]);      // 1×3
    const B = new Matrix([[1, 2], [3, 4]]); // 2×2
    expect(() => A.multiply(B)).toThrow();
  });
});

describe('Matrix transpose', () => {
  it('transposes correctly', () => {
    const A = new Matrix([[1, 2, 3], [4, 5, 6]]);
    const T = A.transpose();
    expect(T.rows).toBe(3);
    expect(T.cols).toBe(2);
    expect(T.get(0, 0)).toBe(1);
    expect(T.get(1, 0)).toBe(2);
    expect(T.get(2, 0)).toBe(3);
    expect(T.get(0, 1)).toBe(4);
  });
});

// ============================================================
// YOUR TASKS
// Add tests for these before implementing them:
// ============================================================

describe('YOUR TASKS', () => {
  it('TODO: Matrix.zeros creates correct matrix', () => {
    // Write this test, then implement Matrix.zeros if not done
  });

  it('TODO: Matrix.ones creates correct matrix', () => {
    // Write this test
  });

  it('TODO: Matrix.diagonal creates correct matrix', () => {
    // Write this test
  });

  it('TODO: scale multiplies every entry by scalar', () => {
    // Write this test
  });

  it('TODO: element-wise multiply works correctly', () => {
    // Write this test
  });
});
```

Run the tests:

```powershell
cd packages\core
pnpm test
```

---

## Your first tasks

```
TASK 1:
  Run pnpm install from the root.
  Run pnpm build from the root.
  Fix any errors you see (likely path or missing file issues).
  Tell me the exact error message if something fails.

TASK 2:
  Run pnpm test from packages/core.
  All existing tests should pass.
  The TODO tests should be skipped (empty test bodies pass by default).

TASK 3:
  Fill in the TODO tests in Matrix.test.ts.
  Run the tests — they should fail (you haven't implemented yet).
  The Matrix class already has zeros(), ones(), diagonal(), scale(),
  elementMultiply() — so actually they should PASS.
  If they don't, the implementation has a bug. Find and fix it.

TASK 4 (from scratch):
  Add a method called submatrix(rowStart, rowEnd, colStart, colEnd)
  to the Matrix class.
  It should return the rectangular sub-region of the matrix.
  Write the test first, then implement it.
  Example: A.submatrix(0, 1, 0, 1) on a 3×3 matrix gives the
  top-left 2×2 corner.

TASK 5 (from scratch):
  Add a method called augment(other: Matrix): Matrix
  that places two matrices side by side horizontally.
  [A | B] — used constantly in RREF and linear system solving.
  Write the test first.
```

---

## What you just built and why each piece matters

```
Float64Array     — stores 64-bit floating point numbers efficiently.
                   A regular JS number[] would work but is slower.
                   Float64Array is what numpy uses internally.

Flat storage     — storing an m×n matrix as one array of length m*n
                   instead of an array of arrays. More cache-friendly,
                   faster for the inner loop of matrix multiplication.

Immutable design — every operation returns a NEW matrix.
                   This prevents subtle bugs where you pass a matrix
                   to a function and it changes underneath you.
                   Trade-off: more memory allocation. Fine for now.

Factory methods  — Matrix.identity(), Matrix.zeros(), Matrix.ones()
                   These are static methods (called on the class,
                   not on an instance). Cleaner than new Matrix(...)
                   for common special cases.

Private helpers  — _checkBounds() and _checkSameDimensions()
                   Called before every operation. Give clear error
                   messages instead of cryptic "undefined" crashes.
```
