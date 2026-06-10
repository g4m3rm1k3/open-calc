# Module 01 — Numbers, Vectors, and Matrices
### Plain English first. Math second. Code third. Nothing skipped.

---

## How to Use This Module

Every concept in here gets explained three ways:
1. What it IS in plain English — a concrete object you can picture
2. What it looks like in math notation — with every symbol defined
3. What it looks like in code — with every line mapped back to the English

Read all three. Do not skip to the code. The code will not make sense
without the English, and the English will not stick without the code.

Type every line. Including comments. Especially comments.

---

## PART 1 — Why We Need Vectors At All

---

### 1.1 The Problem in Plain English

A language model needs to work with words.
Computers can only work with numbers.
So we need to turn words into numbers.

The first idea most people have: give each word an integer.

```
cat   = 1
dog   = 2
fish  = 3
chair = 4
table = 5
```

This seems fine until you think about what it implies.

If cat=1 and dog=2, then mathematically:
- dog is "bigger" than cat
- fish is exactly halfway between dog and chair
- table minus chair equals dog

None of those sentences mean anything. But the math assumes they do.
If you tried to train a model on integer word IDs, it would spend forever
trying to figure out why "chair + 1 = table" and what that means for language.

We need a number representation where the GEOMETRY — the distances and
angles between things — carries meaning instead of the raw numbers.

That representation is a vector.

---

### 1.2 What a Vector Actually Is

**Plain English definition:**
A vector is a list of numbers that represents a point in space.
Not 2D space like a graph. Not 3D space like the real world.
A space with as many dimensions as numbers in the list.

If your vector has 3 numbers, it is a point in 3D space.
If your vector has 64 numbers, it is a point in 64-dimensional space.
You cannot picture 64D space, but the math works exactly the same as 2D.

**The key idea:**
We will represent each word as a point in a high-dimensional space.
The POSITION of the point encodes meaning.
Words with similar meanings will be placed near each other.
Words with different meanings will be far apart.

We do not decide where to place them — the model learns this automatically
during training. We will see how in module 04 (gradients).
For now, trust that it happens and focus on understanding the geometry.

**What it looks like as a number:**

```
cat   = [0.2, -0.5,  1.3,  0.8, -0.1]
dog   = [0.3, -0.4,  1.1,  0.9,  0.0]
chair = [-1.2, 0.8, -0.3,  0.1,  0.7]
```

Each row is a vector with 5 numbers (5-dimensional space).
Cat and dog have similar numbers — they are nearby in this space.
Chair has very different numbers — it is far away.

The individual numbers do not mean anything by themselves.
It is the relationship between vectors that matters.

**What it looks like in math notation:**

Mathematicians write vectors in bold or with an arrow:

```
v = [v₁, v₂, v₃, ..., vₙ]
```

The subscript numbers (v₁, v₂, etc.) just mean "the first number in v",
"the second number in v", and so on. They are indices, like array indices.

When you see vᵢ in a formula, it means "the i-th element of vector v".
That is all. It is just indexing.

---

### 1.3 The Dot Product — The Most Important Operation in All of Deep Learning

**Plain English definition:**
The dot product is a way to measure how similar two vectors are
in terms of their DIRECTION (not their size).

If two vectors point in the same direction: large positive dot product.
If two vectors are perpendicular (at 90°): dot product of zero.
If two vectors point in opposite directions: large negative dot product.

We use this constantly. Every attention calculation, every layer,
every comparison the model makes — it all comes down to dot products.

**How to compute it:**
Multiply each pair of corresponding elements, then add them all up.

Example with 3D vectors:

```
u = [1, 2, 3]
v = [4, 5, 6]

u · v = (1×4) + (2×5) + (3×6)
      =    4  +   10  +   18
      =   32
```

That is it. Element-wise multiply, then sum.

**In math notation:**

```
u · v = Σᵢ uᵢ vᵢ
```

The Σ (sigma) symbol means "sum up".
The i goes from 1 to n (the length of the vector).
uᵢ means "the i-th element of u".
vᵢ means "the i-th element of v".

So in plain English: "for each position i, multiply u's value by v's value,
then add all those products together."

**Why this measures similarity:**
If u and v point in the same direction, their elements tend to have
the same signs (both positive or both negative at each position).
Positive × positive = positive. Negative × negative = positive.
So the sum ends up large and positive.

If u and v are perpendicular, the positive products and negative products
cancel out and the sum is zero.

This is the geometric interpretation. We will prove it properly in section 1.5.

---

### 1.4 The Vector Norm — Measuring Length

**Plain English definition:**
The norm of a vector is its length — the distance from the origin (zero point)
to the tip of the vector.

In 2D, this is just the Pythagorean theorem: length = √(x² + y²).
In any number of dimensions, the same formula extends:

```
length = √(v₁² + v₂² + v₃² + ... + vₙ²)
```

**In math notation:**

```
‖v‖ = √(Σᵢ vᵢ²) = √(v · v)
```

The double bars ‖v‖ mean "the norm of v" or "the length of v".
Notice: the norm is the square root of the dot product of a vector with itself.
That is not a coincidence — it follows directly from the Pythagorean theorem
extended to n dimensions.

**Why we need it:**
The dot product depends on both the direction AND the length of vectors.
A very long vector will have a large dot product with anything, just because
of its length, not because of its direction.

To measure ONLY direction (only similarity, not size), we divide by the lengths.
That gives us cosine similarity, which we build next.

---

### 1.5 Cosine Similarity — Measuring Direction Alone

**Plain English definition:**
Cosine similarity measures the ANGLE between two vectors.
It does not care how long they are — only which way they point.

Result is always between -1 and 1:
- 1.0  means: the vectors point in exactly the same direction (very similar)
- 0.0  means: the vectors are perpendicular (unrelated)
- -1.0 means: the vectors point in exactly opposite directions

**Where the formula comes from:**

From geometry, there is a relationship between the dot product and the angle
between two vectors. This comes from the law of cosines (a generalization
of the Pythagorean theorem to triangles that are not right-angled).

The law of cosines says: for a triangle with sides a, b, c and angle θ opposite side c:
```
c² = a² + b² - 2ab cos(θ)
```

If we apply this to vectors u and v (treating them as sides of a triangle):
```
‖u - v‖² = ‖u‖² + ‖v‖² - 2‖u‖‖v‖cos(θ)
```

Expanding the left side using the dot product definition:
```
(u-v)·(u-v) = u·u - 2(u·v) + v·v
‖u‖² - 2(u·v) + ‖v‖² = ‖u‖² + ‖v‖² - 2‖u‖‖v‖cos(θ)
```

The ‖u‖² and ‖v‖² cancel:
```
-2(u·v) = -2‖u‖‖v‖cos(θ)
u·v = ‖u‖‖v‖cos(θ)
```

Rearranging:
```
cos(θ) = (u·v) / (‖u‖ × ‖v‖)
```

**This is cosine similarity.** It is not an arbitrary formula —
it falls directly out of the geometry of triangles.

**In plain English:**
Divide the dot product by both lengths.
The lengths cancel out and you are left with only the directional relationship.

---

## PART 2 — Writing the Code

Now we build everything above in Python, piece by piece.
Create a new file. Call it `01_vectors.py`.
Type everything — the imports, the functions, the comments, all of it.

---

### 2.1 Setup

```python
# 01_vectors.py
#
# In this file we build the fundamental operations that power every
# calculation in a language model.
#
# We use only Python's built-in math module here intentionally.
# No numpy, no torch. We want to see every single operation.
# Later we switch to numpy for speed, but we need to understand
# what numpy is doing under the hood first.

import math

# A note on how we represent vectors:
# In Python, a vector is just a list of floats.
# [0.2, -0.5, 1.3] is a 3-dimensional vector.
# The position in the list corresponds to the dimension.
# Element 0 is dimension 1, element 1 is dimension 2, etc.
```

---

### 2.2 The Dot Product

```python
# -------------------------------------------------------
# THE DOT PRODUCT
#
# Plain English: multiply each pair of elements, add them up.
# Math: u · v = Σᵢ uᵢvᵢ
#
# This is the most important operation we will write.
# Every attention score, every layer output, every similarity
# calculation in the model reduces to dot products.
# -------------------------------------------------------

def dot_product(u, v):
    # First: make sure the vectors are the same length.
    # You cannot dot-product vectors of different sizes —
    # there is no matching element for the leftover ones.
    if len(u) != len(v):
        raise ValueError(
            f"Vectors must be the same length. "
            f"Got {len(u)} and {len(v)}."
        )
    
    # Initialize a running total at zero
    total = 0.0
    
    # For each position i (0, 1, 2, ..., n-1):
    for i in range(len(u)):
        # Multiply the i-th element of u by the i-th element of v
        # and add to our running total.
        # This is one term of the sum: uᵢ × vᵢ
        total += u[i] * v[i]
    
    # After the loop, total = u₁v₁ + u₂v₂ + ... + uₙvₙ
    # That is the dot product.
    return total


# Let's test it with simple numbers we can verify by hand:
#
# u = [1, 2, 3]
# v = [4, 5, 6]
# u · v = (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32
#
u = [1.0, 2.0, 3.0]
v = [4.0, 5.0, 6.0]
result = dot_product(u, v)
print(f"dot_product([1,2,3], [4,5,6]) = {result}")
print(f"Expected: 32.0")
print(f"Correct: {result == 32.0}")
print()

# Now with word-like vectors:
cat   = [0.2, -0.5,  1.3,  0.8, -0.1]
dog   = [0.3, -0.4,  1.1,  0.9,  0.0]
chair = [-1.2, 0.8, -0.3,  0.1,  0.7]

print("Dot products between word vectors:")
print(f"  cat  · dog   = {dot_product(cat, dog):.4f}")
print(f"  cat  · chair = {dot_product(cat, chair):.4f}")
print(f"  dog  · chair = {dot_product(dog, chair):.4f}")
print()
# cat·dog should be larger (same direction) than cat·chair (different direction)
# But these are raw dot products — they depend on vector length too.
# We fix that with cosine similarity below.
```

---

### 2.3 The Vector Norm

```python
# -------------------------------------------------------
# THE VECTOR NORM (LENGTH)
#
# Plain English: how far is this vector from the origin?
# Math: ‖v‖ = √(v₁² + v₂² + ... + vₙ²) = √(v · v)
#
# This is the Pythagorean theorem extended to n dimensions.
# In 2D: distance = √(x² + y²)
# In nD: distance = √(x₁² + x₂² + ... + xₙ²)
# -------------------------------------------------------

def vector_norm(v):
    # The norm is the square root of the dot product of v with itself.
    # Why? Because v · v = v₁² + v₂² + ... + vₙ² (each element squared, summed).
    # And the norm is the square root of that sum.
    # So: ‖v‖ = √(v · v)
    
    sum_of_squares = dot_product(v, v)
    # dot_product(v, v) = v₁×v₁ + v₂×v₂ + ... = v₁² + v₂² + ...
    
    return math.sqrt(sum_of_squares)


# Test: a simple vector where we can verify by hand
# v = [3, 4]
# ‖v‖ = √(3² + 4²) = √(9 + 16) = √25 = 5
# (This is the classic 3-4-5 right triangle)

v_test = [3.0, 4.0]
print(f"‖[3, 4]‖ = {vector_norm(v_test):.4f}")
print(f"Expected: 5.0")
print()

print("Norms of our word vectors:")
print(f"  ‖cat‖   = {vector_norm(cat):.4f}")
print(f"  ‖dog‖   = {vector_norm(dog):.4f}")
print(f"  ‖chair‖ = {vector_norm(chair):.4f}")
print()
# These tell us the "size" of each vector, not its direction.
# We need to remove size to get pure direction (cosine similarity).
```

---

### 2.4 Cosine Similarity

```python
# -------------------------------------------------------
# COSINE SIMILARITY
#
# Plain English: measure only the DIRECTION relationship,
# not size. Are these vectors pointing the same way?
#
# Math (derived from law of cosines above):
#   cos(θ) = (u · v) / (‖u‖ × ‖v‖)
#
# Result is always between -1.0 and 1.0:
#   1.0  = same direction (very similar meaning)
#   0.0  = perpendicular (unrelated)
#  -1.0  = opposite direction (opposite meaning)
# -------------------------------------------------------

def cosine_similarity(u, v):
    # Step 1: compute the dot product of u and v
    # This captures both direction and magnitude
    numerator = dot_product(u, v)
    
    # Step 2: compute the product of the two norms
    # This is the "correction factor" to remove magnitude
    denominator = vector_norm(u) * vector_norm(v)
    
    # Step 3: guard against division by zero
    # A zero vector has no direction — similarity is undefined.
    # We return 0.0 as a convention (no similarity).
    if denominator == 0.0:
        return 0.0
    
    # Step 4: divide to get the cosine of the angle
    # The norms cancel out, leaving only directional information
    return numerator / denominator


# Test with vectors we designed to have known similarity:
same_direction = [1.0, 0.0, 0.0]
also_same      = [2.0, 0.0, 0.0]  # same direction, twice as long
perpendicular  = [0.0, 1.0, 0.0]  # 90 degrees to the first
opposite       = [-1.0, 0.0, 0.0] # exactly opposite

print("Cosine similarity tests:")
print(f"  same direction:      {cosine_similarity(same_direction, also_same):.4f}  (expected: 1.0)")
print(f"  perpendicular:       {cosine_similarity(same_direction, perpendicular):.4f}  (expected: 0.0)")
print(f"  opposite direction:  {cosine_similarity(same_direction, opposite):.4f}  (expected: -1.0)")
print()

# Notice: scaling a vector (making it longer or shorter) does NOT
# change cosine similarity. "same_direction" and "also_same" give 1.0
# even though one is twice as long. Only direction matters.

print("Word vector similarities (higher = more similar meaning):")
sim_cat_dog   = cosine_similarity(cat, dog)
sim_cat_chair = cosine_similarity(cat, chair)
sim_dog_chair = cosine_similarity(dog, chair)

print(f"  cat  ↔ dog:   {sim_cat_dog:.4f}")
print(f"  cat  ↔ chair: {sim_cat_chair:.4f}")
print(f"  dog  ↔ chair: {sim_dog_chair:.4f}")
print()
print("cat and dog should be most similar (both are animals)")
print("chair should be least similar to both (it's furniture)")
```

---

### 2.5 Vector Arithmetic — How Analogies Work

```python
# -------------------------------------------------------
# VECTOR ADDITION AND SCALAR MULTIPLICATION
#
# Plain English:
#   Addition: combine two vectors by adding element-wise.
#             Geometrically: place the second vector at the tip of the first.
#   Scalar multiply: stretch or shrink a vector.
#                    Multiplying by -1 flips its direction.
#
# These are how the famous word analogies work:
#   king - man + woman ≈ queen
# Which means: "take the king vector, remove the 'man' direction,
#               add the 'woman' direction, and you land near queen."
# -------------------------------------------------------

def vector_add(u, v):
    # Add each element of u to the corresponding element of v.
    # Result is a new vector of the same length.
    if len(u) != len(v):
        raise ValueError("Vectors must be the same length to add.")
    
    # List comprehension: for each index i, compute u[i] + v[i]
    return [u[i] + v[i] for i in range(len(u))]

def scalar_multiply(scalar, v):
    # Multiply every element of v by the scalar.
    # scalar > 1: stretches the vector (makes it longer)
    # scalar = 1: no change
    # 0 < scalar < 1: shrinks the vector
    # scalar = -1: flips the direction (points the other way)
    # scalar = 0: produces the zero vector
    return [scalar * element for element in v]

def vector_subtract(u, v):
    # Subtract v from u: equivalent to adding the negation of v.
    # u - v = u + (-1 × v)
    # We could write: vector_add(u, scalar_multiply(-1, v))
    # But element-wise subtraction is more readable:
    return [u[i] - v[i] for i in range(len(u))]


# The word analogy: king - man + woman ≈ queen
# We hand-craft vectors that demonstrate this.
# In a trained model, this emerges automatically.
#
# These vectors are in 4 dimensions:
# Dimension 0: royalty (high = royal, low = common)
# Dimension 1: gender (positive = male, negative = female)
# Dimension 2: age (positive = adult, negative = child)
# Dimension 3: power (how much authority this entity has)

king  = [2.0,  1.0,  1.0,  2.0]
queen = [2.0, -1.0,  1.0,  2.0]
man   = [0.1,  1.0,  0.8,  0.3]
woman = [0.1, -1.0,  0.8,  0.3]

# Compute: king - man + woman
# Step 1: king - man (remove the "man" properties from king)
step1 = vector_subtract(king, man)
print("Step 1 (king - man):", [round(x, 2) for x in step1])

# Step 2: + woman (add the "woman" properties)
result = vector_add(step1, woman)
print("Step 2 (+ woman):", [round(x, 2) for x in result])
print("Queen vector:    ", [round(x, 2) for x in queen])
print()

# Now measure similarity to all our words
words = {"king": king, "queen": queen, "man": man, "woman": woman}
print("Similarity of (king - man + woman) to each word:")
for word, vec in words.items():
    sim = cosine_similarity(result, vec)
    bar = "█" * int(sim * 40) if sim > 0 else ""
    print(f"  {word:8s}  {sim:.4f}  {bar}")
print()
print("'queen' should score highest — the analogy works!")
```

---

### 2.6 Visualizing Vector Space

```python
# -------------------------------------------------------
# VISUALIZATION
#
# We cannot picture 64-dimensional space.
# But we can picture 2D space, and the geometry is identical.
# All the similarity and direction concepts apply in any dimension.
#
# We will plot 2D word vectors as arrows from the origin.
# The angle between arrows = the relationship between words.
# -------------------------------------------------------

# We use matplotlib to draw the plots.
# matplotlib.use('Agg') means "save to a file instead of opening a window"
# This works on any system. Open the .png file to see the plot.

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# 2D vectors so we can plot them directly as x, y coordinates
words_2d = {
    "king":   [2.0,  1.0],
    "queen":  [2.0, -1.0],
    "man":    [0.5,  1.0],
    "woman":  [0.5, -1.0],
    "prince": [1.5,  0.9],
    "rock":   [-1.5, 0.2],
    "water":  [-1.2, 0.1],
}

# Colors to group related concepts visually
colors = {
    "king":   "royalblue",
    "queen":  "hotpink",
    "man":    "steelblue",
    "woman":  "salmon",
    "prince": "cornflowerblue",
    "rock":   "gray",
    "water":  "teal",
}

fig, ax = plt.subplots(figsize=(9, 7))

for word, vec in words_2d.items():
    color = colors[word]
    
    # Draw arrow from origin (0,0) to the vector tip
    # The arrow IS the vector — a direction and length from the origin
    ax.annotate(
        "",                          # no text on the arrow itself
        xy=(vec[0], vec[1]),         # tip of the arrow (the vector)
        xytext=(0, 0),               # tail of the arrow (origin)
        arrowprops=dict(
            arrowstyle="->",
            color=color,
            lw=2.0
        )
    )
    
    # Draw a dot at the tip
    ax.scatter(vec[0], vec[1], color=color, s=80, zorder=5)
    
    # Label the word slightly offset from the tip so it is readable
    ax.annotate(
        word,
        xy=(vec[0], vec[1]),
        xytext=(vec[0] + 0.07, vec[1] + 0.07),
        fontsize=12,
        color=color,
        fontweight='bold'
    )

# Draw the x and y axes
ax.axhline(0, color='black', lw=0.8, alpha=0.5)
ax.axvline(0, color='black', lw=0.8, alpha=0.5)

# Labels explaining what each axis roughly represents
ax.set_xlabel("← Not royal          Royalty          Royal →", fontsize=10)
ax.set_ylabel("← Female          Gender          Male →", fontsize=10)
ax.set_title(
    "Word Vectors in 2D\n"
    "Arrows = vectors. Angle between arrows = semantic similarity.",
    fontsize=12
)
ax.grid(True, alpha=0.2)
ax.set_xlim(-2.5, 3.0)
ax.set_ylim(-2.0, 2.0)

# Add a note about the analogy
ax.annotate(
    "king - man + woman ≈ queen\n(vector arithmetic encodes meaning)",
    xy=(1.5, -1.0),
    fontsize=9,
    color="purple",
    style='italic'
)

plt.tight_layout()
plt.savefig("01a_word_vectors.png", dpi=130)
print("Saved: 01a_word_vectors.png")
print("Open this file. Notice:")
print("  - king and queen are at the same royalty level (same x)")
print("  - man and woman are at the same royalty level (same x)")
print("  - king and man are at the same gender level (same y)")
print("  - rock and water are far from all the royalty words")
print()
```

---

## PART 3 — Matrices: Transformations on Vectors

---

### 3.1 What a Matrix Is in Plain English

**Plain English definition:**
A matrix is a rectangular grid of numbers. Nothing more.
But what makes it useful is that when you multiply a matrix by a vector,
you get a new vector. The matrix is a FUNCTION that transforms vectors.

Every layer in a neural network is a matrix that transforms vectors.
The layer takes a vector (a word's representation), applies a matrix to it,
and produces a new vector (an updated representation).

The matrix's job is to reorganize and remix the information in the vector.

A matrix has rows and columns. We describe its size as "rows × columns":
- A 3×4 matrix has 3 rows and 4 columns
- Each element is at position [row, column]

```
     col0  col1  col2  col3
row0 [  1    2    3    4  ]
row1 [  5    6    7    8  ]
row2 [  9   10   11   12  ]
```

This is a 3×4 matrix (3 rows, 4 columns).
Element at row 1, column 2 is 7. (Row and column indices start at 0.)

---

### 3.2 Matrix × Vector: The Core Operation

**Plain English:**
When you multiply a matrix W by a vector x, each row of the matrix
takes the dot product with the vector. The results become the elements
of the output vector.

If W has m rows and n columns, and x has n elements:
- Each of the m rows of W is a vector of length n
- We dot-product each row with x
- We get m results → an output vector of length m

So: W has shape [m, n], x has shape [n], output has shape [m].

This is the **shape rule** for matrix-vector multiplication:
the number of columns in the matrix must equal the length of the vector.

**Why the shapes must match:**
Each row of W is a vector of length n. We are dot-producting it with x.
A dot product requires both vectors to be the same length.
So x must have length n (same as the number of columns).

**Worked example by hand:**

```
W = [  2   0  ]     x = [ 3 ]
    [  1   3  ]         [ 1 ]
    [ -1   2  ]

Output element 0 = row 0 · x = (2×3) + (0×1) = 6 + 0 = 6
Output element 1 = row 1 · x = (1×3) + (3×1) = 3 + 3 = 6
Output element 2 = row 2 · x = (-1×3) + (2×1) = -3 + 2 = -1

Output = [ 6, 6, -1 ]
```

W was shape [3, 2]. x was shape [2]. Output is shape [3].
The 2s matched. Input had 2 dimensions. Output has 3.

---

### 3.3 The Column Picture — A Different Way to See It

There is a second way to understand matrix-vector multiplication that
becomes very important later when we study attention.

Instead of thinking "each row dot-products with x", think:

**The output is a WEIGHTED COMBINATION OF THE COLUMNS OF W,
where the weights are the elements of x.**

Let's see this with the same example:

```
W = [  2   0  ]     x = [ 3 ]
    [  1   3  ]         [ 1 ]
    [ -1   2  ]
```

Column 0 of W is: [2, 1, -1]
Column 1 of W is: [0, 3, 2]

Output = 3 × [2, 1, -1]  +  1 × [0, 3, 2]
       = [6, 3, -3]       +  [0, 3, 2]
       = [6, 6, -1]

Same answer. But now we see: the output is "3 times column 0 plus 1 times column 1."

The elements of x are the mixing coefficients.
The matrix's columns are the "basis directions" we are mixing.

**Why this matters for LLMs:**
The attention mechanism uses exactly this idea.
The "values" in attention are columns being mixed.
The attention weights are the mixing coefficients.
We will revisit this in module 04 when we build attention.

---

### 3.4 Code: Build Matrix Operations From Scratch

```python
# -------------------------------------------------------
# MATRIX-VECTOR MULTIPLICATION FROM SCRATCH
#
# We implement this by hand using the row-picture:
# each row of the matrix dot-products with the vector.
#
# W: a list of lists (matrix) with shape [m, n]
#    W[i] is row i, which has n elements
# x: a list (vector) with n elements
# output: a list (vector) with m elements
# -------------------------------------------------------

def mat_vec_multiply(W, x):
    # W is a list of rows. Each row is a list of numbers.
    # W[0] = first row, W[1] = second row, etc.
    
    m = len(W)       # number of rows in W = size of output vector
    n = len(W[0])    # number of columns in W = required size of x
    
    # Check the shapes match
    if len(x) != n:
        raise ValueError(
            f"Matrix has {n} columns but vector has {len(x)} elements. "
            f"These must match."
        )
    
    output = []  # we will build the output vector element by element
    
    for i in range(m):
        # Row i of W is: W[i]
        # The i-th output element is the dot product of row i with x
        row_i       = W[i]
        dot_with_x  = dot_product(row_i, x)  # using our function from above
        output.append(dot_with_x)
    
    # After the loop, output has m elements — one per row of W
    return output


# Test with our worked example:
W_test = [
    [2.0,  0.0],   # row 0
    [1.0,  3.0],   # row 1
    [-1.0, 2.0],   # row 2
]
x_test = [3.0, 1.0]

result = mat_vec_multiply(W_test, x_test)
print("Matrix-vector multiplication test:")
print(f"  W = {W_test}")
print(f"  x = {x_test}")
print(f"  W @ x = {result}")
print(f"  Expected: [6.0, 6.0, -1.0]")
print()
```

```python
# -------------------------------------------------------
# VISUALIZING MATRIX TRANSFORMATIONS
#
# A matrix transforms vectors — it moves points around in space.
# Different matrices do different things:
#   - Scale: stretch or shrink in some direction
#   - Rotate: spin the space
#   - Shear: push in one direction proportional to another
#
# In a neural network, the weight matrices do learned versions
# of these transformations — the model learns WHICH transformation
# is useful for understanding language.
# -------------------------------------------------------

import numpy as np  # we switch to numpy here for the plotting math

# Create a grid of points in 2D to show what each matrix does to space
# We will apply the matrix to every point and see where they end up

grid_x = np.linspace(-1, 1, 6)
grid_y = np.linspace(-1, 1, 6)
xx, yy = np.meshgrid(grid_x, grid_y)

# Stack into a [36, 2] array — 36 points, each with x and y coordinates
points = np.column_stack([xx.ravel(), yy.ravel()])

# Three different 2×2 transformation matrices
transformations = [
    (
        "Scale x by 2\n(stretches horizontally)",
        np.array([[2.0, 0.0],
                  [0.0, 1.0]])
    ),
    (
        "Rotate 45 degrees\n(spins the space)",
        np.array([[np.cos(np.pi/4), -np.sin(np.pi/4)],
                  [np.sin(np.pi/4),  np.cos(np.pi/4)]])
    ),
    (
        "Shear\n(pushes x proportional to y)",
        np.array([[1.0, 0.8],
                  [0.0, 1.0]])
    ),
]

fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))

for ax, (title, W_np) in zip(axes, transformations):
    # Apply the transformation to all 36 points at once
    # points is [36, 2], W_np is [2, 2]
    # points @ W_np.T is [36, 2] — each row is a transformed point
    # Why W_np.T? Because our convention is W @ x (matrix times column vector)
    # but numpy stores points as row vectors, so we transpose W
    transformed = points @ W_np.T
    
    # Plot original points (light gray)
    ax.scatter(
        points[:, 0], points[:, 1],
        color='lightgray', s=30, label='Original', zorder=3
    )
    
    # Plot transformed points (blue)
    ax.scatter(
        transformed[:, 0], transformed[:, 1],
        color='steelblue', s=30, label='After transform', zorder=4
    )
    
    # Draw arrows showing where a sample of points moved
    # We take every 4th point to avoid clutter
    for orig, new in zip(points[::4], transformed[::4]):
        ax.annotate(
            "",
            xy=new,
            xytext=orig,
            arrowprops=dict(arrowstyle="->", color="tomato", lw=1.3)
        )
    
    ax.axhline(0, color='black', lw=0.6, alpha=0.4)
    ax.axvline(0, color='black', lw=0.6, alpha=0.4)
    ax.set_title(title, fontsize=10)
    ax.set_xlim(-2.5, 2.5)
    ax.set_ylim(-2.0, 2.0)
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.2)
    
    # Print the matrix for reference
    print(f"Matrix for '{title.split(chr(10))[0]}':")
    print(f"  {W_np.tolist()}")

plt.suptitle(
    "Matrix Multiplication = Geometric Transformation\n"
    "Each weight matrix in the LLM is a learned version of these",
    fontsize=12
)
plt.tight_layout()
plt.savefig("01b_matrix_transforms.png", dpi=130)
print()
print("Saved: 01b_matrix_transforms.png")
print("Open this file and look at what each matrix does.")
print("The neural network learns matrices that are useful for language.")
```

```python
# -------------------------------------------------------
# THE SHAPES RULE — THE MOST PRACTICAL THING IN THIS MODULE
#
# When you multiply matrices and vectors, shapes must be compatible.
# This rule catches 90% of errors when writing neural network code.
#
# For W @ x:
#   W has shape [m, n]
#   x has shape [n]      ← the n must match
#   result has shape [m]
#
# For A @ B (matrix times matrix):
#   A has shape [m, k]
#   B has shape [k, n]   ← the k must match
#   result has shape [m, n]
#
# The "inner" dimensions must match.
# The "outer" dimensions are the result shape.
# -------------------------------------------------------

import numpy as np

print("=== THE SHAPES RULE ===")
print()
print("W @ x:  [m, n] @ [n] → [m]")
print("A @ B:  [m, k] @ [k, n] → [m, n]")
print()

# Worked examples with numpy — notice the shapes
examples = [
    # (description, A_shape, B_shape)
    ("Project 3D vector to 5D",    (5, 3),  (3,)),
    ("Project 5D vector to 2D",    (2, 5),  (5,)),
    ("Matrix × matrix",            (4, 8),  (8, 3)),
    ("Batch: 32 vectors, 64D→128D",(32, 64),(64, 128)),
]

for desc, shape_A, shape_B in examples:
    A = np.random.randn(*shape_A)
    B = np.random.randn(*shape_B)
    result = A @ B
    print(f"  {desc}:")
    print(f"    {shape_A} @ {shape_B} → {result.shape}")
    print()

# The most important shapes you will see in this tutorial:
print("Shapes you will see constantly:")
d_model = 128   # embedding dimension (we will use this size)
vocab   = 70    # number of unique characters in our vocabulary
seq_len = 64    # number of tokens in one training sequence
batch   = 32    # number of sequences we process at once

print(f"  Token embeddings:    [{vocab}, {d_model}]")
print(f"  One sequence:        [{seq_len}, {d_model}]")
print(f"  Full batch:          [{batch}, {seq_len}, {d_model}]")
print(f"  Weight matrix (Q,K): [{d_model}, {d_model//4}]")
print(f"  Attention scores:    [{seq_len}, {seq_len}]")
print()
print("When you see these shapes in later modules,")
print("you will know what dimension represents what.")
```

```python
# -------------------------------------------------------
# NUMPY — THE PRACTICAL VERSION
#
# Everything we built by hand above is what numpy does,
# but optimized to run thousands of times faster.
# From here on we use numpy for all vector and matrix math.
#
# The most important numpy operations:
#   np.dot(u, v)        — dot product
#   np.linalg.norm(v)   — vector norm
#   A @ B               — matrix multiply (@ operator)
#   A.T                 — transpose (swap rows and columns)
# -------------------------------------------------------

import numpy as np

# Our word vectors as numpy arrays
cat_np   = np.array([0.2, -0.5,  1.3,  0.8, -0.1])
dog_np   = np.array([0.3, -0.4,  1.1,  0.9,  0.0])
chair_np = np.array([-1.2, 0.8, -0.3,  0.1,  0.7])

# Dot product
dot_np = np.dot(cat_np, dog_np)
dot_py = dot_product(list(cat_np), list(dog_np))  # our hand-built version
print("Numpy vs hand-built dot product:")
print(f"  numpy:    {dot_np:.6f}")
print(f"  hand-built: {dot_py:.6f}")
print(f"  Match: {abs(dot_np - dot_py) < 1e-10}")
print()

# Norm
norm_np = np.linalg.norm(cat_np)
norm_py = vector_norm(list(cat_np))
print("Numpy vs hand-built norm:")
print(f"  numpy:    {norm_np:.6f}")
print(f"  hand-built: {norm_py:.6f}")
print(f"  Match: {abs(norm_np - norm_py) < 1e-10}")
print()

# Cosine similarity using numpy operations
def cosine_similarity_np(u, v):
    # Same formula, using numpy:
    # (u · v) / (‖u‖ × ‖v‖)
    return np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))

print("Cosine similarities (numpy):")
print(f"  cat  ↔ dog:   {cosine_similarity_np(cat_np, dog_np):.4f}")
print(f"  cat  ↔ chair: {cosine_similarity_np(cat_np, chair_np):.4f}")
print()

# Matrix multiplication with @
W_np = np.array([
    [2.0,  0.0],
    [1.0,  3.0],
    [-1.0, 2.0],
])
x_np = np.array([3.0, 1.0])

result_np = W_np @ x_np         # matrix @ vector
result_py = mat_vec_multiply(W_test, x_test)  # our hand-built version

print("Matrix-vector multiply (numpy @ operator):")
print(f"  numpy:    {result_np.tolist()}")
print(f"  hand-built: {result_py}")
print(f"  Match: {np.allclose(result_np, result_py)}")
print()

# The transpose: flipping rows and columns
# A [3, 2] matrix becomes [2, 3] after transpose
print(f"W shape:   {W_np.shape}")
print(f"W.T shape: {W_np.T.shape}")
print(f"W:\n{W_np}")
print(f"W.T:\n{W_np.T}")
```

---

## PART 4 — Connecting to the LLM

---

### 4.1 What You Just Built and Why It Matters

You have built four fundamental operations:
- Dot product: the core of similarity measurement
- Vector norm: measuring magnitude
- Cosine similarity: measuring direction only
- Matrix-vector multiply: the core of every neural network layer

Every single computation in an LLM is combinations of these four things.

When the model processes the sentence "The cat sat on the mat":
1. Each word becomes a vector (embedding lookup = selecting a row from a matrix)
2. Attention scores are computed with dot products (how much does each word attend to each other word?)
3. The attended information is mixed with matrix multiplications
4. Each layer transforms the vectors with matrix multiplications
5. The output is projected back to vocabulary scores with a matrix multiplication

Dot products and matrix multiplications, all the way down.

---

### 4.2 The Shape of the Data Through the Model

This is worth understanding before writing any model code.

```
Input text: "The cat sat"
     ↓ tokenize
Token IDs: [22, 8, 47]          shape: [3]  (3 tokens)
     ↓ look up embedding matrix
Token vectors: [[...], [...], [...]]  shape: [3, 128]  (3 tokens, each 128-dimensional)
     ↓ add position info
Still: [3, 128]
     ↓ transformer layer 1 (matrix multiplications inside)
Still: [3, 128]   ← shape is preserved through all layers
     ↓ transformer layer 2
Still: [3, 128]
     ↓ ... (repeat for all layers)
     ↓ final matrix multiplication
Output scores: [3, 70]   (3 positions, score for each of 70 vocabulary tokens)
```

The shape [3, 128] flows through the entire model.
Each layer transforms the 128-dimensional representation.
The shape stays the same — 3 tokens, 128 dimensions each.
Only the values change as information is processed.

In real training, we process many sequences at once (a "batch"):
```
Batch of 32 sequences, each 64 tokens long, each token 128-dimensional
Shape: [32, 64, 128]
```

This shape — [batch_size, sequence_length, d_model] — is what you
will see everywhere in the code from module 06 onward.

---

## ✅ Check Your Understanding

Answer these in your own words before moving on:

1. We represent words as vectors instead of integers.
   What is wrong with using integers?
   What does the geometry of the vector space give us that integers cannot?

2. The dot product of a vector with itself equals the sum of squares.
   What is the square root of that? Why?

3. Cosine similarity gives 1.0 for two identical vectors regardless
   of their length. Walk through the formula and show WHY length cancels.

4. A weight matrix W has shape [128, 64].
   What shape input does it require? What shape output does it produce?
   What does the transformation do in terms of dimensions?

5. The "column picture" of matrix multiplication says the output is
   a weighted combination of the matrix's columns. In attention, the
   "values" will be columns and the attention weights will be the weights.
   Re-read section 3.3 with this in mind.

---

## 🧪 Experiments — Do These Before Moving On

**Experiment 1: Zero vectors**
Create a zero vector `[0, 0, 0, 0, 0]`.
What is its norm? What happens when you compute cosine similarity
between it and another vector? Why is this a problem?
How might you guard against it in code?

**Experiment 2: Scaling does not change direction**
Take the cat vector `[0.2, -0.5, 1.3, 0.8, -0.1]`.
Multiply it by 10 to get `[2.0, -5.0, 13.0, 8.0, -1.0]`.
Compute cosine similarity between the original and the scaled version.
What do you get? What does this tell you?

**Experiment 3: Build your own 2D word vectors**
Pick 6 concepts you know well (any domain — cooking, sports, programming).
Design 2D vectors for them where the geometry makes sense.
Plot them. Does the geometry match your intuitions about which
concepts are related?

**Experiment 4: The shapes rule**
Try to multiply a [3, 4] matrix by a [3] vector using numpy.
What error do you get? What size vector would work?
Now try [4] — does it work? What is the output shape?

**Experiment 5: Matrix transformation**
Create a 2×2 matrix that reflects vectors across the x-axis
(flips the y-coordinate). Apply it to several vectors and verify.
Hint: what should happen to [1, 1]? To [0, 3]? To [-2, 4]?

---

> When you can answer the understanding questions and have run all experiments,
> move to Module 02: Probability and Information.
> We derive where the loss function comes from — starting from
> "what does it mean to be surprised?" and ending at cross-entropy.
