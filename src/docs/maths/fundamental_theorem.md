# The Fundamental Theorem of Linear Algebra
## Built from scratch. Every concept earned before it is named.

---

## What this document assumes you already know

```
✓ A matrix is a grid of numbers
✓ A vector is a list of numbers
✓ You can multiply a matrix by a vector
✓ RREF exists (we will explain what it actually means here)
```

Nothing else assumed.

---

## Part 1: The one problem this entire lesson is about

We want to solve:

```
Ax = b
```

Where:
- A is a matrix (a grid of numbers, given to you)
- b is a vector (a list of numbers, given to you)
- x is a vector of UNKNOWNS — this is what we are solving for

**Our goal:** find every possible x that makes this equation true.

That's it. Everything in this lesson exists to answer that one question.

---

## Part 2: What A actually does — the machine picture

Think of A as a machine.

```
         A (the machine)

  x  ──────────────────>  Ax
(input)                 (output)
```

You feed a vector x in. The machine multiplies it by A. You get a
new vector Ax out.

For example, with:

```
A = [3  1  0]
    [2  1 -1]
    [-1 -1  2]
```

Feed in x = [1, 0, 0]:

```
A * [1]   =   [3*1 + 1*0 + 0*0]   =   [3]
    [0]       [2*1 + 1*0 + -1*0]      [2]
    [0]       [-1*1 + -1*0 + 2*0]     [-1]
```

So the machine turned [1,0,0] into [3,2,-1].

**The problem Ax=b asks:** which input x makes the machine
produce the specific output b?

With b = [4, 2, 0]:

```
Find x such that: A * x = [4]
                           [2]
                           [0]
```

---

## Part 3: Why we row reduce — the core reason

The equation Ax=b is really THREE equations hiding in matrix form.

Writing it out:

```
3x₁ +  x₂ + 0x₃ = 4    ← row 1 of A times x = row 1 of b
2x₁ +  x₂ - x₃  = 2    ← row 2 of A times x = row 2 of b
-x₁ -  x₂ + 2x₃ = 0    ← row 3 of A times x = row 3 of b
```

These three equations are hard to solve directly — the variables
are tangled together.

**Row reduction rewrites these same equations into a simpler form
that has EXACTLY THE SAME SOLUTIONS.**

Nothing changes about what x values are solutions. Only the
equations themselves get simpler, the same way:

```
Original: 2x = 10     →     Simplified: x = 5
```

Both have the same solution (x=5). The simplified version is
just easier to read.

RREF is the SIMPLEST possible form of the equations.

---

## Part 4: Reading the RREF result

After row-reducing [A|b], you got:

```
[1   0   1  |  2 ]   ← equation 1
[0   1  -3  | -2 ]   ← equation 2
[0   0   0  |  0 ]   ← equation 3
```

The vertical bar | separates the A-part (left) from the b-part (right).
The three left columns correspond to x₁, x₂, x₃.

**Translate each row back into an equation:**

Row 1: 1·x₁ + 0·x₂ + 1·x₃ = 2   →   x₁ + x₃ = 2
Row 2: 0·x₁ + 1·x₂ - 3·x₃ = -2  →   x₂ - 3x₃ = -2
Row 3: 0·x₁ + 0·x₂ + 0·x₃ = 0   →   0 = 0  (no information)

Row 3 tells us nothing — it just confirms the system is consistent
(has solutions). We ignore it.

**So we have two equations and three unknowns:**

```
x₁ + x₃ = 2         ...(1)
x₂ - 3x₃ = -2       ...(2)
```

---

## Part 5: Pivot columns — what to look for visually

Look at the RREF and find where the leading 1s are:

```
[1   0   1  |  2 ]
 ^
 leading 1 in column 1 → column 1 is a PIVOT column

[0   1  -3  | -2 ]
     ^
     leading 1 in column 2 → column 2 is a PIVOT column

column 3: no leading 1 anywhere → column 3 is a FREE column
```

**Pivot column** = has a leading 1. The variable for this column
is a PIVOT VARIABLE. Its value will be determined by the equations.

**Free column** = no leading 1. The variable for this column is a
FREE VARIABLE.

In this problem:
```
x₁ → pivot variable (column 1 has a pivot)
x₂ → pivot variable (column 2 has a pivot)
x₃ → free variable  (column 3 has no pivot)
```

---

## Part 6: WHY free variables are free — the concrete reason

Look at equation (1): x₁ + x₃ = 2

Can you solve for x₁? Not yet — you need to know x₃ first.

Look at equation (2): x₂ - 3x₃ = -2

Can you solve for x₂? Not yet — you need to know x₃ first.

**x₃ doesn't appear as a pivot in any equation. No equation says
"x₃ equals something." So the equations simply never pin down what
x₃ must be.**

x₃ is free because the equations leave it completely undetermined.
You pick it. Then x₁ and x₂ are forced to adjust to whatever you
chose.

This isn't magic or a special rule — it's just that there are only
2 independent equations for 3 unknowns, so one unknown must be
chosen freely.

---

## Part 7: Generating actual solutions — building intuition before formulas

Since x₃ can be ANYTHING, let's try a few values and see what happens.

**Try x₃ = 0:**

From (1): x₁ + 0 = 2  →  x₁ = 2
From (2): x₂ - 3(0) = -2  →  x₂ = -2

Solution: x = (2, -2, 0)

**Try x₃ = 1:**

From (1): x₁ + 1 = 2  →  x₁ = 1
From (2): x₂ - 3(1) = -2  →  x₂ = 1

Solution: x = (1, 1, 1)

**Try x₃ = 2:**

From (1): x₁ + 2 = 2  →  x₁ = 0
From (2): x₂ - 3(2) = -2  →  x₂ = 4

Solution: x = (0, 4, 2)

**Try x₃ = -1:**

From (1): x₁ + (-1) = 2  →  x₁ = 3
From (2): x₂ - 3(-1) = -2  →  x₂ = -5

Solution: x = (3, -5, -1)

Now look at all four solutions side by side:

```
t=0:   (2, -2,  0)
t=1:   (1,  1,  1)
t=2:   (0,  4,  2)
t=-1:  (3, -5, -1)
```

**Do you notice a pattern?** Every time t increases by 1, x₁
decreases by 1, x₂ increases by 3, and x₃ increases by 1.

The solutions are always changing by the same "direction vector":
(-1, 3, 1).

Check: (1,1,1) - (2,-2,0) = (-1, 3, 1) ✓
Check: (0,4,2) - (1,1,1) = (-1, 3, 1) ✓

**This repeating direction is not a coincidence.** It comes
directly from the equations. Now we can write a formula.

Let's break down exactly what those numbers are and how they build that final formula.

### 1. Where the "Check" Numbers Come From

In Part 7, the tutorial calculates a few specific solutions by plugging in random values for $x_3$ (which we are calling $t$):

* When $t = 0$, the solution is **$(2, -2, 0)$**
* When $t = 1$, the solution is **$(1, 1, 1)$**
* When $t = 2$, the solution is **$(0, 4, 2)$**

The "Check" lines are simply taking two adjacent solutions from that list and subtracting them:

> `Check: (1,1,1) - (2,-2,0)` is really just: `(Solution at t=1) - (Solution at t=0)`

**Why do we do this?** We are looking for the "rate of change." If you think of this like a program's state loop, we want to know exactly how the output vector updates every time $t$ ticks up by 1.

When you subtract the $t=0$ state from the $t=1$ state, you get $(-1, 3, 1)$.
When you subtract the $t=1$ state from the $t=2$ state, you *also* get $(-1, 3, 1)$.

This proves that no matter which solution you are looking at, increasing your free variable $t$ by exactly 1 will *always* shift your $x_1$ down by 1, your $x_2$ up by 3, and your $x_3$ up by 1. That is your constant **direction vector**.

### 2. Building the Formula (Part 8)

Now that we know how the system behaves step-by-step, we can write a master formula to instantly calculate the solution for *any* value of $t$, without having to calculate it from scratch every time.

To build this, you only need two things:

1. **An initial base state (a starting point):** The easiest starting point is what happens when $t = 0$. From our list, that vector is **$(2, -2, 0)$**.
2. **The state update per tick (the direction vector):** We just proved that for every 1 unit of $t$, the vector changes by **$(-1, 3, 1)$**.

If you want to find the solution for *any* $t$, you just take your starting point and add $t$ amount of those directional steps.

Written out in vector math, it looks like this:

$$x = \begin{pmatrix} 2 \\ -2 \\ 0 \end{pmatrix} + t \begin{pmatrix} -1 \\ 3 \\ 1 \end{pmatrix}$$

This is essentially the exact same logic as the equation for a line ($y = mx + b$), just scaled up into 3D space: `current_position = initial_position + (time * velocity)`.

The $(2, -2, 0)$ is your $b$ (initial position), the $(-1, 3, 1)$ is your $m$ (velocity/slope), and $t$ is your $x$ (time/multiplier).

---

## Part 8: The general solution formula

Since every solution differs from (2,-2,0) by some multiple of
(-1,3,1), we can write ALL solutions as:

```
x = [2 ] + t[-1]    where t can be any real number
    [-2]    [3 ]
    [0 ]    [1 ]
```

Give t a value, get a solution. Every solution comes from
exactly one value of t.

How to read this formula:
- [2,-2,0] is the solution when t=0 (called the PARTICULAR solution)
- [-1,3,1] is the "direction of change" (called the NULL SPACE vector)
- t is the free parameter (any real number)

Let's verify this formula produces our earlier solutions:

```
t=0:  [2,-2,0] + 0[-1,3,1] = [2,-2,0]     ✓
t=1:  [2,-2,0] + 1[-1,3,1] = [1,1,1]       ✓
t=2:  [2,-2,0] + 2[-1,3,1] = [0,4,2]       ✓
t=-1: [2,-2,0] + (-1)[-1,3,1] = [3,-5,-1]  ✓
```

The secret lies in what happens when two different inputs produce the exact same output.

### The "Invisible Difference"

Let's look at what we actually did when we subtracted those two solutions in Part 7. We had two valid states that solved our system:

* **State 1:** $(1, 1, 1)$
* **State 2:** $(2, -2, 0)$

Because both of these are valid solutions to the problem $Ax = b$, we know for a fact that:

1. $A(1, 1, 1) = b$
2. $A(2, -2, 0) = b$

When we subtracted them to find the "slope" (the direction of change), we calculated $(1,1,1) - (2,-2,0) = (-1,3,1)$.

But what happens if we feed that exact "slope" into the matrix machine $A$? Because matrix multiplication follows the distributive property ($A(u - v) = Au - Av$), we can expand it:

$$A(-1, 3, 1) = A((1, 1, 1) - (2, -2, 0))$$

$$= A(1, 1, 1) - A(2, -2, 0)$$

Since both of those inputs produce the exact same output vector $b$, the equation simplifies to:

$$= b - b$$

$$= 0$$

### Why the Slope *Is* the Null Space

This proves that the "slope" or "distance" between *any* two valid solutions to $Ax = b$ will always equal $0$ when multiplied by $A$.

If the machine produces the output $b$ for State 1, and still produces that exact same output $b$ for State 2, then the *difference* between those two states must be completely invisible to the machine.

Therefore, the direction of change (the slope) between solutions **is** the null space, because the null space is precisely the collection of all vectors that the matrix $A$ ignores (sends to zero).
---

## Part 9: Why does adding (-1,3,1) change nothing?

The vector (-1,3,1) is special. Let's see what happens when A
multiplies it:

```
A * [-1]   =   [3(-1) + 1(3) + 0(1)]   =   [-3+3+0]   =   [0]
    [ 3]       [2(-1) + 1(3) - 1(1)]       [-2+3-1]       [0]
    [ 1]       [-1(-1) + -1(3) + 2(1)]     [1-3+2]        [0]
```

A sends (-1,3,1) to zero. The machine makes it disappear.

**Now watch why adding it to any solution x gives another solution:**

If Ax = b, and A(-1,3,1) = 0, then:

```
A(x + (-1,3,1))
= Ax + A(-1,3,1)      ← distributive law: A(u+v) = Au + Av
= b  +  0              ← Ax=b and A(-1,3,1)=0
= b
```

So x + (-1,3,1) is ALSO a solution. Adding a vector that A makes
disappear doesn't change the output. This is WHY infinitely many
solutions exist — because the machine can't distinguish between
x and x + (anything it sends to zero).

---

## Part 10: What is a space? (Built from the pattern above)

You just discovered that all vectors A sends to zero form a
"direction" — specifically, the direction (-1,3,1) and all its
multiples: 2(-1,3,1), -5(-1,3,1), π(-1,3,1), etc.

This entire collection of vectors forms a LINE through the origin
in 3D. That line is a SUBSPACE.

**What makes something a subspace:**

A collection of vectors is a subspace if:
1. The zero vector is in it
2. Add any two vectors from it — the result stays in it
3. Scale any vector from it — the result stays in it

In plain terms: a subspace is a "flat" region through the origin
(a line, a plane, or higher-dimensional equivalent) that has
no edges and extends infinitely.

**Examples:**
```
A line through the origin   → 1-dimensional subspace
A plane through the origin  → 2-dimensional subspace
All of 3D space             → 3-dimensional subspace
Just the zero vector {0}    → 0-dimensional subspace
```

Here is how the different types of variables dictate the physical geometry of your solutions:

### The Dimensional Breakdown

* **Total Variables (3):** You have $x_1$, $x_2$, and $x_3$. This dictates the "world" your vectors live in—which is 3D space ($\mathbb{R}^3$).
* **Pivot Variables (2):** Your row reduction locked down $x_1$ and $x_2$. These act as rigid constraints. In $\mathbb{R}^3$, every independent constraint removes a dimension of freedom.
* **Free Variables (1):** Your $x_3$ (which you renamed to the parameter $t$) is the only variable left completely unconstrained.

### Degrees of Freedom

The geometric shape of a subspace is always determined by its "degrees of freedom," which is perfectly equal to the number of **free variables** (often called the *nullity*).

Because you only have **one** free variable ($t$), you can only scale your direction vector $(-1, 3, 1)$ forwards and backwards along a single, one-dimensional path.

If the math had worked out differently:

* **0 Free Variables:** 0 degrees of freedom = A single dot (just the origin).
* **1 Free Variable:** 1 degree of freedom = A 1D line through the origin.
* **2 Free Variables:** 2 degrees of freedom = A flat 2D plane through the origin.
* **3 Free Variables:** 3 degrees of freedom = The entirety of 3D space.

So, the collection of vectors forms a line precisely because those two pivot variables forced all the "wiggle room" down to just a single free variable!

Here is exactly how the "trivial" and "non-trivial" vocabulary fits into the null space you just built.

### The "Trivial" Solution (The All 0's)

When you are trying to figure out which inputs the machine destroys (which is solving $Ax = 0$), there is always one painfully obvious answer: feeding it nothing.

If your input is the zero vector, $x = \begin{pmatrix} 0 \\ 0 \\ 0 \end{pmatrix}$, the matrix will always multiply it out to zero. Mathematicians call this the **trivial solution** because it requires zero effort to find and tells us absolutely nothing special about the internal mechanics of the matrix $A$. It's the mathematical equivalent of a "no duh" answer.

### The "Non-Trivial" Solutions

The real meat of linear algebra is asking: "Does the machine destroy *anything else*?" Are there any actual, non-zero inputs that still get crushed to zero?

Any non-zero vector that solves $Ax = 0$ is called a **non-trivial solution**.

### Tying it Back to Your Free Variables

This directly connects back to the dimensions and degrees of freedom we just talked about:

* **0 Free Variables:** The machine *only* destroys the origin. The null space is just a single dot, meaning it contains **only the trivial solution**.
* **1 or More Free Variables:** The machine destroys an entire line, plane, or 3D volume. Because there are valid vectors stretching out into space, you have infinitely many **non-trivial solutions**.

Since the system you just worked through in the tutorial had one free variable (creating a 1D line), every single point on that line—except the origin itself—is a non-trivial solution. You have already found them; you just hadn't slapped the official textbook vocabulary on them yet!

"Crushed to zero" is just a visual metaphor I used, let's look at what is actually happening mathematically.

### 1. What does "crushed to zero" mean?

It simply means the matrix multiplication results in the zero vector.

If you think of the matrix $A$ like a function in C++ or Python, the "null space" is just the specific set of inputs that cause that function to return exactly `0`.

When I say an input is "crushed," it just means that you fed a perfectly good, non-zero vector (like $x = (-1, 3, 1)$) into the matrix $A$, and the multiplication mathematically erased all of its values, resulting in $Ax = (0, 0, 0)$. The machine essentially milled the input away to nothing.

### 2. Untangling the Shapes: Single Point vs. All 3D Space

The difference comes down to whether the **Matrix** is all zeros, or if the **Solution** is all zeros.

Here are the two extremes:

#### Extreme A: The Single Point (0 Free Variables)

* **What it means:** The matrix $A$ is highly restrictive and locks down every single variable (3 pivot columns, 0 free variables).
* **The result:** The machine will *only* output $(0, 0, 0)$ if you feed it the zero vector $(0, 0, 0)$ to begin with.
* **The shape:** Because the trivial solution (the origin) is the *only* thing that works, the null space is just a **single point** floating in space.

#### Extreme B: All 3D Space (3 Free Variables)

* **What it means:** The matrix $A$ itself is completely empty—it is literally a grid of all zeros.
* **The result:** Because the machine is just multiplying everything by zero, it doesn't matter what vector you feed into it. You could input $(1, 1, 1)$, $(99, -5, 42)$, or any other coordinate. Every single possible input will output $(0, 0, 0)$.
* **The shape:** Because *every* vector in existence is a valid solution, the null space is the **entirety of 3D space** ($\mathbb{R}^3$).

To summarize: A **single point** means the machine is so strict it only accepts the origin. **All of 3D space** means the machine is basically "broken" (made of zeros) and accepts absolutely everything.
---

## Part 11: The four spaces — four questions about the machine

For any matrix A, there are four naturally occurring subspaces.
Each answers a different question about the machine A:

```
Question                              Space

What outputs can A produce?        → Column space (also called range)
Which inputs disappear?            → Null space (also called kernel)
What is the content of the rows?   → Row space
Which outputs are impossible?      → Left null space
```

**Null space** — the set of all inputs x where Ax = 0:

```
null(A) = {x : Ax = 0}
```

For our matrix, null(A) = span{(-1,3,1)} — the line through
the origin in the direction (-1,3,1).

**Column space** — all possible outputs Ax:

```
col(A) = {Ax : x is any vector}
```

This answers: which b vectors have a solution to Ax=b?

**Row space** — all combinations of A's rows:

```
row(A) = span of the rows of A
```

To make this intuitive, let’s build a visual example.

Imagine a machine called **The Shadow Maker**. It takes a 3D object hovering in the air (your input vector) and shines a light straight down from the ceiling, projecting a flat, 2D shadow of that object onto the floor (your output vector).

Mathematically, this machine simply takes any $(x, y, z)$ coordinate and forces the height ($z$) to zero, outputting $(x, y, 0)$.

Here is exactly how the four spaces answer the four questions about The Shadow Maker:

### 1. Column Space: What outputs can A produce?

If you feed every possible 3D point in the universe into this machine, what does the final collection of outputs look like?

* **The Example:** Because the machine flattens everything, every single output will be stuck exactly on the floor.
* **The Space:** The **Column Space** is that entire flat 2D floor. If a point is hovering 5 feet in the air, it is *not* in the column space, because this machine is incapable of putting an output there.

### 2. Null Space: Which inputs disappear?

What specific inputs get completely crushed into the origin point $(0, 0, 0)$?

* **The Example:** Think about the exact center of the floor. What casts a shadow right there? Anything sitting perfectly vertical on the z-axis (like a straight pole rising up from the center).
* **The Space:** The **Null Space** is that vertical line. If you feed the machine the point $(0, 0, 10)$, the machine destroys the $10$ and it becomes $(0, 0, 0)$.

### 3. Row Space: What parts of the input does the machine actually care about?

If the machine is destroying some information (the vertical height), what information is it actually keeping and using to build the output?

* **The Example:** The machine only cares about how far left/right ($x$) and forward/backward ($y$) the object is. It completely ignores height.
* **The Space:** The **Row Space** consists of those $x$ and $y$ dimensions. *Notice how this is perfectly perpendicular to the Null Space (the $z$-axis).* The Fundamental Theorem says that every input can be split cleanly into the part the machine sees (Row Space) and the part the machine is blind to (Null Space).

### 4. Left Null Space: Which outputs are impossible?

If someone hands you a random vector and asks, "Did the Shadow Maker produce this?", how do you know if they are lying?

* **The Example:** If they hand you a point hovering in the air, like $(2, 3, 5)$, you know instantly it's impossible. The machine only makes flat shadows.
* **The Space:** The **Left Null Space** represents all those impossible vertical "off-the-floor" directions that the machine can never reach. It is the mathematical graveyard of impossible outputs.

---

### The "Shadow Maker" Matrix

To understand the four spaces, let's look at a machine that takes a 3D coordinate and projects a flat shadow of it straight down onto the floor. It keeps the $x$ and $y$ positions exactly the same, but it completely crushes the $z$ (height) dimension to $0$.

The matrix for this machine looks like this:


$$A = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 0 \end{pmatrix}$$

Let's ask the four fundamental questions about this machine.

#### 1. The Null Space: Which inputs disappear?

The Null Space is the collection of all inputs that the machine crushes to the zero vector $(0,0,0)$. For the Shadow Maker, anything sitting perfectly vertical on the z-axis (like a pole rising from the center of the room) gets flattened to zero.

```matlab
A = [1 0 0; 0 1 0; 0 0 0];
N = null(A) 

```

*MATLAB Output:* `[0; 0; 1]`
*Walkthrough:* MATLAB confirms that the only direction completely erased by the matrix is the z-axis (a 1D line).

#### 2. The Column Space: What outputs can it produce?

If you feed every possible 3D point into this machine, what does the final collection of outputs look like? Since the machine flattens everything, every single output will be stuck exactly on the 2D floor.

```matlab
A = [1 0 0; 0 1 0; 0 0 0];
C = orth(A) % orth() finds the orthogonal basis of the column space

```

*MATLAB Output:* The $x$ vector `[1; 0; 0]` and the $y$ vector `[0; 1; 0]`.
*Walkthrough:* The output space is the flat 2D plane perfectly aligned with the floor.

#### 3. The Row Space: What parts of the input does it care about?

If the machine destroys the vertical height, what information is it actually keeping to build the shadow? It only cares about how far left/right and forward/backward the object is.

```matlab
A = [1 0 0; 0 1 0; 0 0 0];
R = orth(A') % Transposing A gives us the Row Space

```

*MATLAB Output:* The $x$ vector `[1; 0; 0]` and the $y$ vector `[0; 1; 0]`.
*Walkthrough:* The machine only reads the $x$ and $y$ dimensions. Notice that the Row Space (what the machine sees) is perfectly perpendicular to the Null Space (what the machine is blind to).

#### 4. The Left Null Space: Which outputs are impossible?

If someone hands you a random vector, how do you know if the Shadow Maker produced it? If the vector has any vertical height, it is impossible. The Left Null Space represents all the impossible "off-the-floor" directions that the machine can never reach.

```matlab
A = [1 0 0; 0 1 0; 0 0 0];
LN = null(A') % Transposing A and finding the null space

```

*MATLAB Output:* `[0; 0; 1]`
*Walkthrough:* The z-axis is the exact direction the machine is incapable of moving toward.

Your code is actually 100% correct! You are getting the exact right solutions, but your built-in `OpenMAT` environment formats its text output differently than a traditional desktop MATLAB terminal.

Let's break down why `[[1, 0], [0, 1], [0, 0]]` is exactly what we are looking for.

### The Nested Array Format

Standard desktop MATLAB prints column vectors vertically on the screen. However, because OpenMAT is running in your browser, it outputs matrices using a web-friendly nested list format (similar to Python, JavaScript, or JSON).

It groups the numbers by **rows**. If we take your output and hit "enter" after each comma to stack those rows vertically, here is what it physically represents:

```text
Row 1:  [1,  0]
Row 2:  [0,  1]
Row 3:  [0,  0]

```

Now, if you read straight down the vertical columns, you will see the exact vectors we expected:

* **Column 1:** `[1; 0; 0]` (The $x$-axis vector)
* **Column 2:** `[0; 1; 0]` (The $y$-axis vector)

### What about the Null Space?

The exact same thing is happening with your `N = [0, 0, 1]` output for the Null Space.

In standard MATLAB, this would print as a tall, 3-row column. OpenMAT is just saving vertical screen space by printing it horizontally in a single array. Mathematically, it is still the exact same $z$-axis vector `[0; 0; 1]` that gets crushed by the Shadow Maker.



---

## Part 12: The Fundamental Theorem — the payoff

You now have everything needed to understand the theorem.

The theorem says:

**null(A) and row(A) are orthogonal complements.**

This means two things:
1. Every vector in null(A) is perpendicular to every vector in row(A)
   (their dot product = 0)
2. Together they cover ALL of ℝⁿ — every vector in ℝⁿ splits
   UNIQUELY into a null-space piece plus a row-space piece

```
Every vector x = xᵣ + xₙ

where xᵣ is in row(A)    ← the part A can "see"
  and xₙ is in null(A)   ← the part A is "blind to"
  and ⟨xᵣ, xₙ⟩ = 0      ← they are perpendicular
```

**Applied to solving Ax = b:**

```
x = xᵣ + xₙ

     A              A
xᵣ ──────> b    xₙ ──────> 0

So: A(xᵣ + xₙ) = Axᵣ + Axₙ = b + 0 = b ✓
```

The row-space piece xᵣ does all the work of producing b.
The null-space piece xₙ is invisible to A — you can add any
amount of it without changing the output.

---

## Part 13: Finding xᵣ and xₙ for our example

We found the particular solution xₚ = (2,-2,0) (when t=0).

This particular solution is a MIXTURE of row-space and null-space
components. We need to separate them.

**Step 1: Find xₙ by projecting xₚ onto the null space.**

The null space basis vector is u = (-1, 3, 1).

The projection formula:

```
xₙ = (⟨xₚ, u⟩ / ⟨u, u⟩) · u
```

This is the same projection formula from the orthogonality chapter:
"how much of xₚ points in the u direction?"

Compute ⟨xₚ, u⟩:

```
xₚ = (2, -2, 0)
u  = (-1, 3, 1)

⟨xₚ, u⟩ = 2·(-1) + (-2)·3 + 0·1
         = -2 - 6 + 0
         = -8
```

Compute ⟨u, u⟩:

```
⟨u, u⟩ = (-1)² + 3² + 1²
        = 1 + 9 + 1
        = 11
```

So:

```
xₙ = (-8/11) · (-1, 3, 1)
   = (8/11, -24/11, -8/11)
```

**Step 2: Find xᵣ by subtracting xₙ from xₚ.**

```
xᵣ = xₚ - xₙ
   = (2, -2, 0) - (8/11, -24/11, -8/11)
   = (22/11 - 8/11, -22/11 + 24/11, 0 + 8/11)
   = (14/11, 2/11, 8/11)
```

**Verification:**

```
A·xᵣ should = b:
A·(14/11, 2/11, 8/11) = (4, 2, 0) ✓

A·xₙ should = 0:
A·(8/11, -24/11, -8/11) = (0, 0, 0) ✓

xᵣ + xₙ should = xₚ:
(14/11, 2/11, 8/11) + (8/11, -24/11, -8/11) = (2, -2, 0) ✓
```

**General solution:**

```
x = xᵣ + c·xₙ    for any real number c

  = (14/11, 2/11, 8/11) + c·(8/11, -24/11, -8/11)
```

Or equivalently (factoring out 8/11 from the null part):

```
x = (14/11, 2/11, 8/11) + c·(-1, 3, 1)
```

(since any multiple of a null space vector is still a null space vector)

---

## Part 14: MATLAB — complete code with every line explained

```matlab
%% SETUP
% Define the matrix A
% [row1; row2; row3] — semicolons separate rows inside brackets
A = [3 1 0; 2 1 -1; -1 -1 2];

% Define the target vector b
% Column vector — semicolons stack numbers vertically
b = [4; 2; 0];

%% STEP 1: ROW REDUCE to find the solution structure
% rref() takes a matrix and returns its reduced row echelon form
% We augment A with b by putting them side by side: [A, b]
% The comma between A and b means "put these next to each other"
augmented = [A, b];
rref_result = rref(augmented)
% Read off: pivot columns → pivot variables
%           free columns  → free variables

%% STEP 2: FIND THE NULL SPACE
% null(A, 'r') finds the null space of A
% The 'r' argument means "rational" — gives exact fractions
% instead of floating-point decimals
% Returns a matrix whose COLUMNS are the null space basis vectors
null_basis = null(A, 'r')

% In our case this should give [-1; 3; 1] (or a multiple of it)
% This is the vector A sends to zero

% Verify: A times any null space vector should give zero
u = null_basis(:, 1);   % get the first (and only) null space basis vector
                        % (:,1) means "all rows, column 1"
disp('A * u should be zero:')
A * u

%% STEP 3: FIND A PARTICULAR SOLUTION
% The backslash operator A\b solves Ax=b
% It finds ONE particular solution (not all solutions)
% Think of it as MATLAB's built-in solver for linear systems
xp = A \ b;
disp('Particular solution xp:')
disp(xp)

% Verify: A * xp should equal b
disp('A * xp should equal b:')
A * xp

%% STEP 4: DECOMPOSE xp INTO ROW-SPACE AND NULL-SPACE PARTS

% dot(u, v) computes the dot product of two vectors
% = u₁v₁ + u₂v₂ + u₃v₃ = one number
numerator   = dot(xp, u);    % how much xp overlaps with the null direction
denominator = dot(u, u);     % size of u squared

% The scalar tells us how much of u to subtract
% numerator/denominator = one number (a scalar)
scalar = numerator / denominator;

% xn = the null-space component of xp
% scalar * u: multiply every entry of u by this one number
xn = scalar * u;

% xr = the row-space component of xp
% vector subtraction: subtract matching entries
xr = xp - xn;

disp('Null-space component xn:')
disp(xn)
disp('Row-space component xr:')
disp(xr)

%% STEP 5: VERIFY THE DECOMPOSITION

disp('=== VERIFICATION ===')

% xr + xn should equal xp
disp('xr + xn should equal xp:')
disp(xr + xn)

% A*xr should equal b (xr does all the work)
disp('A*xr should equal b:')
disp(A * xr)

% A*xn should equal zero (xn is invisible to A)
disp('A*xn should equal zero:')
disp(A * xn)

% xr and xn should be perpendicular (dot product = 0)
disp('dot(xr, xn) should equal 0:')
disp(dot(xr, xn))

%% STEP 6: WRITE OUT THE GENERAL SOLUTION

disp('=== GENERAL SOLUTION ===')
disp('x = xr + c * u, for any real number c')
disp('xr ='); disp(xr)
disp('u (null space direction) ='); disp(u)
disp('Verify with c=0:'); disp(xr + 0*u)
disp('Verify with c=1:'); disp(xr + 1*u)
disp('Verify with c=-1:'); disp(xr + (-1)*u)
```

---

## Part 15: Summary — the complete picture

```
THE MACHINE:
         A
  x  ──────────>  Ax
```

```
THE PROBLEM: find all x where Ax = b
```

```
THE SOLUTION STRUCTURE:
Every solution x = xᵣ + c·xₙ

xₚ = particular solution    (one specific x that works, found by A\b)
xₙ = null space vector      (what A sends to zero, found by null(A,'r'))
c  = any real number        (the free parameter)
xᵣ = xₚ - proj_null(xₚ)   (the row-space part, perpendicular to xₙ)
```

```
THE FUNDAMENTAL THEOREM:
xᵣ and xₙ are always perpendicular.
xᵣ ∈ row(A)   — the part A can see
xₙ ∈ null(A)  — the part A is blind to
dot(xᵣ, xₙ) = 0
```

```
WHY IT WORKS:
A(xᵣ + c·xₙ) = A·xᵣ + c·A·xₙ = b + c·0 = b ✓
```
