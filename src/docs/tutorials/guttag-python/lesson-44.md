# Lesson 44: Clustering — k-Means from Scratch

What you will build: The reader implements k-means clustering from scratch: initialize k centroids, assign each point to nearest centroid, recompute centroids, repeat until convergence. The transferable insight: k-means is UNSUPERVISED. There are no labels. The algorithm discovers structure by grouping nearby points. It minimizes within-cluster variance. It is sensitive to initialization (random restarts help) and requires you to choose k (the elbow method helps).

What you need to know first: Lessons 00-43.

**Terms used in this lesson**
- **Unsupervised learning** — learning without ground-truth labels — it exists to discover hidden structures, groupings, or patterns in raw data where no "correct answer" is provided beforehand.
- **Centroid** — the center point of a cluster — it serves as the representative prototype for all data points assigned to that group, allowing us to summarize a cluster mathematically.
- **Inertia** — the sum of squared distances from each point to its assigned centroid — it provides a quantitative metric of cluster compactness to help evaluate whether our algorithm is converging to a tight grouping.
- **Silhouette score** — a metric comparing a point's distance to its own cluster against its distance to the nearest neighboring cluster — it solves the problem of evaluating cluster quality when we have no ground-truth labels, by quantifying separation.
- **Elbow method** — a heuristic approach to finding the optimal number of clusters $k$ — it exists to prevent guessing $k$ blindly by visually locating the point of diminishing returns in the inertia plot.

**Objects and methods used**
- **`math.sqrt`**
  - *What it is:* A mathematical function to compute the square root.
  - *Implementation:* `def sqrt(x: float) -> float`
  - *Its use:* Calculates the straight-line Euclidean distance between two points.
  - *Type:* `static` function in the `math` module.
  - *Responsibility:* Computes the principal square root of a non-negative number.
  - *Depends on:* A single non-negative numeric argument.
  - *Connects to:* Called by `euclidean_distance`, relies on C-level standard library math.
  - *Shape:* Internal implementation detail for mathematical operations.

- **`zip`**
  - *What it is:* A built-in function to iterate over multiple iterables in parallel.
  - *Implementation:* `class zip(iter1 [,iter2 [...]])`
  - *Its use:* Pairs up coordinates from two multi-dimensional points (e.g. `x1` with `x2`, `y1` with `y2`) so we can compute distances per dimension.
  - *Type:* Built-in Python class/iterator.
  - *Responsibility:* Produces an iterator of tuples, where the i-th tuple contains the i-th element from each of the argument sequences.
  - *Depends on:* One or more iterables.
  - *Connects to:* Called by `euclidean_distance` comprehension, yields tuples to the caller.
  - *Shape:* Core Python syntax for aggregating sequences.

- **`random.sample`**
  - *What it is:* A function to choose multiple unique random elements from a population.
  - *Implementation:* `def sample(population, k, *, counts=None)`
  - *Its use:* Picks the initial $k$ centroids from the existing data points.
  - *Type:* Method in the `random` module.
  - *Responsibility:* Returns a new list containing elements from the population without replacement, leaving the original population unchanged.
  - *Depends on:* A sequence or set, and an integer $k$.
  - *Connects to:* Called by `kmeans` to initialize state.
  - *Shape:* Algorithm initialization boundary.

- **`random.seed`**
  - *What it is:* A function to initialize the internal state of the random number generator.
  - *Implementation:* `def seed(a=None, version=2)`
  - *Its use:* Ensures our clustering results are reproducible across multiple runs, despite random initialization.
  - *Type:* Method in the `random` module.
  - *Responsibility:* Sets the starting seed for the pseudo-random number generator.
  - *Depends on:* An integer or hashable object `a`.
  - *Connects to:* Called at the start of `kmeans`, affects all subsequent `random.*` calls.
  - *Shape:* Setup/configuration step for stochastic algorithms.


## Concept Unit: The k-means algorithm

### The Problem
How do we mathematically group a set of coordinates into discrete clusters when we don't know the categories in advance? Given a list of arbitrary points in 2D space, what would be your first step to determine which points "belong" together? If you randomly guessed two center points right now, how would you decide which data points belong to which center? 

### Introduce the concept in isolation
Here is our **k-means centroid assignment** concept demonstrated in isolation.
```python
import math
def temp_dist(a, b): return math.sqrt(sum((x-y)**2 for x,y in zip(a,b)))
points = [[1,1],[1,2],[2,1],[5,5],[5,6],[6,5]]
centroids = [[1,1],[6,6]]
assignments = [0 if temp_dist(p, centroids[0]) < temp_dist(p, centroids[1]) else 1 for p in points]
print(assignments)
# [0, 0, 0, 1, 1, 1]
```
This proves that by defining prototype centers (centroids) and mathematically mapping points to the centroid with the minimum Euclidean distance, data naturally segments into groups based on proximity.

### Discard the throwaway
The throwaway example above is completely discarded. It will not appear in our final project code.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because we are exploring a standalone theory lesson.
- **Files affected:** `kmeans.py` (created)
- **Change type:** Add
- **Location:** Brand new file
- **Dependencies:** `math`

### The New Code
```python
import math

def euclidean_distance(a, b):
    return math.sqrt(sum((ai - bi)**2 for ai, bi in zip(a, b)))

def assign_clusters(points, centroids):
    '''Assign each point to its nearest centroid. Returns list of cluster IDs.'''
    assignments = []
    for point in points:
        distances = [euclidean_distance(point, c) for c in centroids]
        assignments.append(distances.index(min(distances)))
    return assignments

def update_centroids(points, assignments, k):
    '''Recompute centroid as mean of all points assigned to each cluster.'''
    n_features = len(points[0])
    new_centroids = []
    for cluster_id in range(k):
        cluster_points = [points[i] for i in range(len(points)) if assignments[i] == cluster_id]
        if not cluster_points:  # empty cluster: keep old centroid
            new_centroids.append(None)
        else:
            centroid = [sum(p[f] for p in cluster_points)/len(cluster_points)
                       for f in range(n_features)]
            new_centroids.append(centroid)
    return new_centroids
```

### The Updated Project
```python
1: import math # <- new
2: 
3: def euclidean_distance(a, b): # <- new
4:     return math.sqrt(sum((ai - bi)**2 for ai, bi in zip(a, b))) # <- new
5: 
6: def assign_clusters(points, centroids): # <- new
7:     '''Assign each point to its nearest centroid. Returns list of cluster IDs.''' # <- new
8:     assignments = [] # <- new
9:     for point in points: # <- new
10:        distances = [euclidean_distance(point, c) for c in centroids] # <- new
11:        assignments.append(distances.index(min(distances))) # <- new
12:    return assignments # <- new
13: 
14: def update_centroids(points, assignments, k): # <- new
15:     '''Recompute centroid as mean of all points assigned to each cluster.''' # <- new
16:     n_features = len(points[0]) # <- new
17:     new_centroids = [] # <- new
18:     for cluster_id in range(k): # <- new
19:         cluster_points = [points[i] for i in range(len(points)) if assignments[i] == cluster_id] # <- new
20:         if not cluster_points:  # empty cluster: keep old centroid # <- new
21:             new_centroids.append(None) # <- new
22:         else: # <- new
23:             centroid = [sum(p[f] for p in cluster_points)/len(cluster_points) # <- new
24:                        for f in range(n_features)] # <- new
25:             new_centroids.append(centroid) # <- new
26:     return new_centroids # <- new
```
Our new `kmeans.py` module now provides the structural primitives of k-means clustering: a function to compute distance, a function to assign groups based on those distances, and a function to slide the centers to the mathematical mean of their assigned groups.

### Mechanical walkthrough
- `def euclidean_distance(a, b):` declares a new function taking two points `a` and `b`.
- `zip(a, b)` aligns the individual dimensional coordinates of `a` and `b`.
- `(ai - bi)**2` computes the squared difference for a single dimension.
- `sum(...)` aggregates all squared dimensional differences into one scalar.
- `math.sqrt(...)` takes the square root of that sum, giving actual physical distance.
- `assignments = []` initializes an empty list to store the cluster ID for each point.
- `distances = [euclidean_distance(point, c) for c in centroids]` constructs a temporary list mapping the point's distance to every single candidate center.
- `min(distances)` finds the smallest distance in that list.
- `.index(...)` retrieves the integer index (cluster ID) corresponding to that minimum distance.
- `n_features = len(points[0])` calculates the dimensionality of our dataset based on the first point.
- `cluster_points = [...]` uses a list comprehension to filter the dataset down to only the points matching the current `cluster_id`.
- `if not cluster_points:` checks if any points actually fell into this cluster.
- `new_centroids.append(None)` pushes a sentinel value for empty clusters so we don't accidentally divide by zero.
- `sum(p[f] for p in cluster_points)/len(cluster_points)` averages the coordinates for the $f$-th feature across all points in the cluster.

### CS lens
The concept here is **Lloyd's Algorithm (Expectation-Maximization)**. By assigning data (Expectation) and updating parameters to fit that assignment (Maximization), we iteratively refine an unlabelled structure. You see this everywhere in CS:
1. Garbage collection tracing relies on iterative marking until convergence.
2. Routing protocols (like OSPF or BGP) update path weights iteratively until the network state settles.
3. Rendering engines simulate light bouncing (radiosity) across surfaces iteratively until the scene converges.
4. Data compression algorithms (like LBG for vector quantization) use the exact same iterative clustering logic to build color palettes.

### SE lens
**Design Principle:** Pure Functions and Statelessness. `assign_clusters` and `update_centroids` have no side effects and do not mutate the input lists. 
**Alternative NOT chosen:** We could have implemented a `Cluster` class that stores its own points and mutates its own centroid state internally (`cluster.add_point(p)`).
**Real tradeoff:** A stateful object-oriented approach makes intuitive sense, but functional immutability here makes debugging the mathematical progression vastly simpler because we can perfectly snapshot the arrays at any discrete iteration.

### Commands needed
`python3`

### Run it
Predicted confidently:
Trace assign_clusters: point [1,1]: dist to [1,1]=0, dist to [6,6]=7.07 -> cluster 0. point [5,5]: dist to [1,1]=5.66, dist to [6,6]=1.41 -> cluster 1. All 6 points correctly assigned. update_centroids: cluster 0 = {[1,1],[1,2],[2,1]}, mean=[1.33,1.33].

### One sentence connecting to previous unit
With the primitives to compute distances and shift centroids defined, we now need a mechanism to repeatedly apply them until the centers stop moving.

## Concept Unit: Full k-means loop

### The Problem
How do we know when to stop updating centroids? If we apply `assign` and `update` over and over, what is the mathematical signal that our clusters are as good as they are going to get? If the assignments never change from one iteration to the next, is there any point in continuing?

### Introduce the concept in isolation
Here is a **convergence loop** demonstrated in isolation.
```python
state = 0
for i in range(10):
    new_state = state + (1 if state < 3 else 0)
    if new_state == state:
        print(f"Converged at {i}")
        break
    state = new_state
# Converged at 3
```
This proves that by comparing the next state to the current state, we can short-circuit a predetermined loop limit as soon as the system reaches a steady equilibrium.

### Discard the throwaway
The throwaway example above is completely discarded. It will not appear in our final project code.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because we are exploring a standalone theory lesson.
- **Files affected:** `kmeans.py` (modified)
- **Change type:** Add
- **Location:** Below `update_centroids`.
- **Dependencies:** `random`

### The New Code
```python
import random

def kmeans(points, k, max_iters=100, seed=42):
    random.seed(seed)
    # Initialize: pick k random points as starting centroids
    centroids = random.sample(points, k)
    assignments = [0] * len(points)

    for iteration in range(max_iters):
        new_assignments = assign_clusters(points, centroids)
        new_centroids = update_centroids(points, new_assignments, k)
        # Replace None centroids (empty clusters) with old ones
        for i in range(k):
            if new_centroids[i] is None:
                new_centroids[i] = centroids[i]

        # Check convergence: if assignments unchanged, stop
        if new_assignments == assignments:
            print(f'Converged at iteration {iteration+1}')
            break
        assignments = new_assignments
        centroids = new_centroids

    return centroids, assignments
```

### The Updated Project
```python
27: import random # <- new
28: 
29: def kmeans(points, k, max_iters=100, seed=42): # <- new
30:     random.seed(seed) # <- new
31:     # Initialize: pick k random points as starting centroids # <- new
32:     centroids = random.sample(points, k) # <- new
33:     assignments = [0] * len(points) # <- new
34: 
35:     for iteration in range(max_iters): # <- new
36:         new_assignments = assign_clusters(points, centroids) # <- new
37:         new_centroids = update_centroids(points, new_assignments, k) # <- new
38:         # Replace None centroids (empty clusters) with old ones # <- new
39:         for i in range(k): # <- new
40:             if new_centroids[i] is None: # <- new
41:                 new_centroids[i] = centroids[i] # <- new
42: 
43:         # Check convergence: if assignments unchanged, stop # <- new
44:         if new_assignments == assignments: # <- new
45:             print(f'Converged at iteration {iteration+1}') # <- new
46:             break # <- new
47:         assignments = new_assignments # <- new
48:         centroids = new_centroids # <- new
49: 
50:     return centroids, assignments # <- new
```
Our `kmeans.py` module now orchestrates the clustering algorithm, randomly picking initial points and repeatedly ping-ponging between assignment and updates until the cluster boundaries stabilize.

### Mechanical walkthrough
- `import random` pulls in Python's standard pseudo-random number generator.
- `def kmeans(points, k, max_iters=100, seed=42):` defines the main entry function, providing defaults for iteration bounds and random seeding.
- `random.seed(seed)` deterministically primes the random engine so our outputs don't flap randomly.
- `random.sample(points, k)` pulls $k$ unique data points to serve as the initial generation of centroids.
- `assignments = [0] * len(points)` pre-allocates an array of zeros representing the 'previous' state of assignments.
- `for iteration in range(max_iters):` starts a bounded loop, ensuring the algorithm won't hang infinitely if it oscillates.
- `new_assignments = assign_clusters(...)` generates the next expected state based on the current centers.
- `new_centroids = update_centroids(...)` shifts the centers based on the fresh assignments.
- `if new_centroids[i] is None:` guards against a cluster having zero points assigned to it.
- `new_centroids[i] = centroids[i]` safely rolls back the dead centroid to its previous known location.
- `if new_assignments == assignments:` performs a deep equality check on the two lists to see if any single point changed alliances.
- `break` exits the iteration limit early because steady-state has been reached.

### CS lens
The concept here is **Convergence in Iterative Numerical Methods**. Many problems lack closed-form algebraic solutions. Instead, you start with a guess and refine it.
1. Newton-Raphson method for finding roots of functions.
2. PageRank calculating the relative importance of web pages.
3. Gradient descent training a neural network's weights.
4. Markov chain mixing times approaching a stationary distribution.

### SE lens
**Design Principle:** Defensive Bounding. The `max_iters` parameter forces a worst-case stop condition.
**Alternative NOT chosen:** We could have used a `while True:` loop that only exits on absolute convergence.
**Real tradeoff:** While mathematically pure k-means is proven to converge, floating-point inaccuracies or highly specific degenerate data can cause infinite oscillation between two equally valid states. Capping the loop guarantees the software halts.

### Commands needed
`python3`

### Run it
Predicted confidently:
Trace kmeans(points, k=2): init centroids (random). Iter 1: assign all points, update centroids. Iter 2: re-assign, update. Assignments same as iter 1: converged. Centroids: mean of group A = [1.5,1.5], group B = [5.5,5.5].

### One sentence connecting to previous unit
Now that we can group points automatically, we need a mathematical way to grade how "good" those groupings actually are.

## Concept Unit: Inertia — measuring cluster quality

### The Problem
If the algorithm finishes, how do we know if it did a good job? If we ask for $k=2$ clusters, but the data naturally forms 3 clusters, how could we mathematically detect that $k$ was poorly chosen? What happens to the distances inside a cluster if the grouping is terrible?

### Introduce the concept in isolation
Here is the **Sum of Squared Errors (SSE)** concept demonstrated in isolation.
```python
# Distance from a fixed center (5)
center = 5
bad_cluster = [1, 9]
good_cluster = [4, 6]
bad_inertia = sum((x-center)**2 for x in bad_cluster) # (16) + (16) = 32
good_inertia = sum((x-center)**2 for x in good_cluster) # (1) + (1) = 2
print(bad_inertia, good_inertia)
# 32 2
```
This proves that squaring the distances from elements to their center heavily penalizes points that are far away, creating a singular metric (inertia) where lower is strictly better.

### Discard the throwaway
The throwaway example above is completely discarded. It will not appear in our final project code.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because we are exploring a standalone theory lesson.
- **Files affected:** `kmeans.py` (modified)
- **Change type:** Add
- **Location:** Below `kmeans`.
- **Dependencies:** None

### The New Code
```python
def inertia(points, centroids, assignments):
    '''Sum of squared distances from each point to its centroid.
       Lower inertia = tighter, more compact clusters.'''
    total = 0
    for i, point in enumerate(points):
        centroid = centroids[assignments[i]]
        total += sum((point[f] - centroid[f])**2 for f in range(len(point)))
    return total
```

### The Updated Project
```python
51: def inertia(points, centroids, assignments): # <- new
52:     '''Sum of squared distances from each point to its centroid. # <- new
53:        Lower inertia = tighter, more compact clusters.''' # <- new
54:     total = 0 # <- new
55:     for i, point in enumerate(points): # <- new
56:         centroid = centroids[assignments[i]] # <- new
57:         total += sum((point[f] - centroid[f])**2 for f in range(len(point))) # <- new
58:     return total # <- new
```
We now have an objective function, `inertia`, that collapses a multi-dimensional, multi-cluster outcome into a single scalar grade.

### Mechanical walkthrough
- `def inertia(...)` takes the full state of a finished clustering run: points, final centers, and final assignments.
- `total = 0` sets up an accumulator variable.
- `for i, point in enumerate(points):` iterates over the dataset while preserving the index `i` so we can look up its assignment.
- `centroid = centroids[assignments[i]]` fetches the exact center this specific point belongs to.
- `sum((point[f] - centroid[f])**2 for f in range(len(point)))` computes the squared Euclidean distance without taking the square root.
- `total += ...` adds this point's squared penalty to the global accumulator.

### CS lens
The concept here is a **Loss/Cost Function**. You compress complex system behavior into one number to be minimized.
1. Mean Squared Error (MSE) in linear regression.
2. Cross-entropy loss in classification neural networks.
3. Path cost functions in A* search algorithms.
4. Energy functions in simulated annealing.

### SE lens
**Design Principle:** Decoupled Evaluation. The `inertia` function is completely separated from the `kmeans` algorithm itself.
**Alternative NOT chosen:** We could have calculated inertia inside the `kmeans` loop and returned it as a third element in the tuple.
**Real tradeoff:** Decoupling evaluation allows us to compute the metric selectively (e.g., only after we've finished looping multiple times) saving CPU cycles during the hot loop of the algorithm itself.

### Commands needed
`python3`

### Run it
Predicted confidently:
Trace inertia(points, centroids, assignments): for each point, compute squared distance to its assigned centroid, sum all. k=1: centroid at mean of all 12 points ~(5.33,5.33). Points at [1,1] are far: (1-5.33)^2+(1-5.33)^2=37.5. Sum all 12: ~300. k=3: three tight clusters: inertia ~12.

### One sentence connecting to previous unit
Although inertia gives us a grade, we will soon see that running the exact same algorithm on the exact same data can yield entirely different grades.

## Concept Unit: k-means sensitivity to initialization

### The Problem
What happens if our initial random guess for the centers is incredibly unlucky? If $k=2$ and both random centers happen to spawn in the exact same clump of data, how will the algorithm recover? Will it always find the true global minimum?

### Introduce the concept in isolation
Here is the **Local Minima** concept demonstrated in isolation.
```python
# A simple greedy climber finding a peak
peaks = [1, 2, 5, 4, 1, 9, 8, 2]
start_idx = 1
while peaks[start_idx+1] > peaks[start_idx]:
    start_idx += 1
print(f"Stuck at peak value: {peaks[start_idx]}")
# Stuck at peak value: 5
```
This proves that greedy optimization algorithms will gleefully halt at a local extreme (5) if they start close to it, completely missing the global extreme (9) that exists elsewhere in the space.

### Discard the throwaway
The throwaway example above is completely discarded. It will not appear in our final project code.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because we are exploring a standalone theory lesson.
- **Files affected:** `kmeans.py` (modified)
- **Change type:** Add
- **Location:** Below `inertia`.
- **Dependencies:** None

### The New Code
```python
# Bad initialization: both centroids in same cluster
def kmeans_bad_init(points, k):
    # Force bad initialization: first k points (all from cluster A)
    centroids = points[:k]
    assignments = [0] * len(points)
    for iteration in range(10):
        new_assignments = assign_clusters(points, centroids)
        new_centroids = update_centroids(points, new_assignments, k)
        for i in range(k):
            if new_centroids[i] is None:
                new_centroids[i] = centroids[i]
        if new_assignments == assignments: break
        assignments = new_assignments
        centroids = new_centroids
    return centroids, assignments, inertia(points, centroids, assignments)
```

### The Updated Project
```python
59: # Bad initialization: both centroids in same cluster # <- new
60: def kmeans_bad_init(points, k): # <- new
61:     # Force bad initialization: first k points (all from cluster A) # <- new
62:     centroids = points[:k] # <- new
63:     assignments = [0] * len(points) # <- new
64:     for iteration in range(10): # <- new
65:         new_assignments = assign_clusters(points, centroids) # <- new
66:         new_centroids = update_centroids(points, new_assignments, k) # <- new
67:         for i in range(k): # <- new
68:             if new_centroids[i] is None: # <- new
69:                 new_centroids[i] = centroids[i] # <- new
70:         if new_assignments == assignments: break # <- new
71:         assignments = new_assignments # <- new
72:         centroids = new_centroids # <- new
73:     return centroids, assignments, inertia(points, centroids, assignments) # <- new
```
By forcing a deterministic, terrible start state (just picking the first $k$ points verbatim), we deliberately break the algorithm to show its fragility. 

### Mechanical walkthrough
- `def kmeans_bad_init(points, k):` defines a variant of our algorithm designed to fail.
- `centroids = points[:k]` intentionally subverts the randomness by grabbing the first $k$ points, which in sorted data usually belong to the same cluster.
- `for iteration in range(10):` runs a shortened identical loop to regular `kmeans`.
- `return centroids, assignments, inertia(...)` returns the final state alongside its objective score so we can compare it to a good run.

### CS lens
The concept here is **Sensitivity to Initial Conditions**. Optimization algorithms behave wildly differently based on where they start.
1. Chaotic systems (like double pendulums) diverging based on micro-adjustments.
2. Weight initialization in neural nets causing vanishing/exploding gradients.
3. K-means++ algorithm specifically designed to space out initial seeds to fix this exact bug.
4. Ray marching artifacts depending on step size origins.

### SE lens
**Design Principle:** Reproducibility through seeding.
**Alternative NOT chosen:** We could have just let `random.sample()` use system time implicitly.
**Real tradeoff:** If we rely on implicit seeding, a user will run `kmeans()` and get different cluster shapes and different inertia scores randomly on every execution. Explicit seeding (`seed=42`) allows us to deterministically prove that bad starts exist without relying on chance to demonstrate the flaw.

### Commands needed
`python3`

### Run it
Predicted confidently:
Trace bad init: both initial centroids in cluster A. Some cluster B points may be assigned to the 'A-biased' centroid. Algorithm may converge to suboptimal solution. Solution: k-means++ initialization (choose centroids spread out), or run multiple random restarts and pick best inertia.

### One sentence connecting to previous unit
If inertia relies on distance to the center, it decreases naturally as we artificially inflate $k$, so we need a metric that measures actual separation quality instead.

## Concept Unit: Evaluating clusters — when there are no labels

### The Problem
If $k=N$ (every point is its own cluster), inertia drops to zero, which looks "perfect" mathematically but is utterly useless functionally. How do we punish the algorithm for putting clusters too close together? If a point is tightly bound to its centroid, shouldn't we also verify that it is *far away* from the next closest cluster?

### Introduce the concept in isolation
Here is the **Silhouette Ratio** concept demonstrated in isolation.
```python
my_dist = 1.0     # very close to my friends
other_dist = 10.0 # very far from the next group
score = (other_dist - my_dist) / max(my_dist, other_dist)
print(score)
# 0.9
```
This proves that by comparing internal cohesion against external separation, we generate a normalized score between -1 and 1 where higher numbers strictly mean "well separated."

### Discard the throwaway
The throwaway example above is completely discarded. It will not appear in our final project code.

### Project Change
- **Reference Source:** None — this is a from-scratch addition because we are exploring a standalone theory lesson.
- **Files affected:** `kmeans.py` (modified)
- **Change type:** Add
- **Location:** Below `kmeans_bad_init`.
- **Dependencies:** None

### The New Code
```python
def silhouette_score_point(point_idx, points, assignments):
    '''Silhouette coefficient for one point: (b-a)/max(a,b).
       a = mean distance to points in same cluster.
       b = mean distance to points in nearest other cluster.
       Range: [-1, 1]. Higher = better separation.'''
    assignments_list = assignments
    cluster = assignments_list[point_idx]
    point = points[point_idx]

    # a: mean intra-cluster distance
    same = [points[i] for i in range(len(points))
            if assignments_list[i] == cluster and i != point_idx]
    a = sum(euclidean_distance(point, p) for p in same) / len(same) if same else 0

    # b: mean distance to nearest other cluster
    other_clusters = set(assignments_list) - {cluster}
    b = min(
        sum(euclidean_distance(point, points[i]) for i in range(len(points))
            if assignments_list[i] == c) / sum(1 for a2 in assignments_list if a2 == c)
        for c in other_clusters
    )
    return (b - a) / max(a, b) if max(a, b) > 0 else 0
```

### The Updated Project
```python
74: def silhouette_score_point(point_idx, points, assignments): # <- new
75:     '''Silhouette coefficient for one point: (b-a)/max(a,b). # <- new
76:        a = mean distance to points in same cluster. # <- new
77:        b = mean distance to points in nearest other cluster. # <- new
78:        Range: [-1, 1]. Higher = better separation.''' # <- new
79:     assignments_list = assignments # <- new
80:     cluster = assignments_list[point_idx] # <- new
81:     point = points[point_idx] # <- new
82: 
83:     # a: mean intra-cluster distance # <- new
84:     same = [points[i] for i in range(len(points)) # <- new
85:             if assignments_list[i] == cluster and i != point_idx] # <- new
86:     a = sum(euclidean_distance(point, p) for p in same) / len(same) if same else 0 # <- new
87: 
88:     # b: mean distance to nearest other cluster # <- new
89:     other_clusters = set(assignments_list) - {cluster} # <- new
90:     b = min( # <- new
91:         sum(euclidean_distance(point, points[i]) for i in range(len(points)) # <- new
92:             if assignments_list[i] == c) / sum(1 for a2 in assignments_list if a2 == c) # <- new
93:         for c in other_clusters # <- new
94:     ) # <- new
95:     return (b - a) / max(a, b) if max(a, b) > 0 else 0 # <- new
```
We now have a mechanism that evaluates the relative quality of the geometric structure discovered by the algorithm, entirely divorced from ground-truth labels.

### Mechanical walkthrough
- `def silhouette_score_point(point_idx, points, assignments):` defines a scoring function aimed at exactly one point in the dataset.
- `assignments_list = assignments` aliases the array for clarity.
- `cluster = assignments_list[point_idx]` determines the point's home cluster.
- `same = [...]` constructs a list of all other coordinate points residing in that exact same home cluster.
- `sum(...) / len(same)` averages the Euclidean distances to all peer points, defining `a`.
- `other_clusters = set(assignments_list) - {cluster}` leverages Python sets to construct a unique collection of all competing clusters.
- `min(...)` evaluates the mean distance to *every* other cluster and selects the lowest one (i.e., the closest neighboring cluster), defining `b`.
- `return (b - a) / max(a, b)` normalizes the difference, bounding it securely between -1.0 and 1.0.

### CS lens
The concept here is **Normalization of Unbounded Metrics**. `a` and `b` could be distances of 0.5 or 50,000 depending on the scale of the raw data.
1. Audio volume compression capping massive dynamic range.
2. Cosine similarity scaling raw dot products into the [-1, 1] range.
3. TF-IDF normalizing word counts against document length.
4. Sigmoid functions clamping arbitrary neural network activations into a (0, 1) probability space.

### SE lens
**Design Principle:** O(N^2) computation tradeoffs. 
**Alternative NOT chosen:** We calculate `silhouette` per-point, forcing the caller to loop over the dataset, meaning the overall operation compares every point against every other point.
**Real tradeoff:** This metric is exceptionally expensive to compute on massive datasets compared to `inertia` (which just compares points to their centroids). In production ML systems, you often compute silhouette scores on a small random sample of the data rather than the entire dataset to save processing time.

### Commands needed
`python3`

### Run it
Predicted confidently:
Trace silhouette for point [1,1] in cluster 0: same cluster: [1,2],[2,1],[2,2]. a=mean dist to those=mean(1,1,1.41)=1.14. Other cluster (1) points: [5,5],[5,6],[6,5],[6,6]. b=mean dist=5.66,6.08,6.40,7.07, mean=6.30. score=(6.30-1.14)/max=5.16/6.30=0.82. Good separation.

### One sentence connecting to previous unit
With initialization limits, iterative shifting, inertia grading, and silhouette checking, we possess the complete structural pipeline of unsupervised discovery.

## Closing

### Connect the pieces
Trace `kmeans(6-point-dataset, k=2)`:
1. **Init centroids:** `random.sample` pulls two random starting coordinates, e.g., `[1, 1]` and `[6, 6]`.
2. **Assign iteration 1:** We loop over all points. `[1, 2]` is physically closer to `[1, 1]`, so it receives cluster ID `0`. `[5, 5]` is closer to `[6, 6]`, getting cluster ID `1`.
3. **Update centroids:** We average all coordinates in cluster `0`, shifting the center to `[1.33, 1.33]`. We average cluster `1`, shifting it to `[5.33, 5.33]`.
4. **Assign iteration 2:** We evaluate distances again. The borders haven't shifted enough to cross over any points, so assignments remain unchanged.
5. **Convergence check:** The deep equality check `new_assignments == assignments` passes. The `break` triggers.
6. **Inertia & Silhouette:** The resulting compact groupings yield a low `inertia` (tight internal squared distance) and a high `silhouette` score (~0.82, showing clear separation between the two clusters), proving the algorithm successfully discovered the underlying geometric truth without labels.
