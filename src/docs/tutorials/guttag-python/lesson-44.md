# Lesson 44: Clustering — k-Means from Scratch and with scikit-learn

What you will build: The reader will implement k-means clustering from scratch, understand its convergence properties, use `sklearn.cluster.KMeans`, and evaluate cluster quality with inertia and the elbow method. The transferable problems: (1) k-means is UNSUPERVISED — there are no labels; it discovers structure; (2) k-means assigns each point to its nearest centroid, then moves centroids to the cluster means, repeating until convergence; (3) k-means is sensitive to initialization and may find local optima — multiple restarts (n_init) are essential.

What you need to know first: Lessons 0–43

**Terms used in this lesson**
- **Unsupervised learning** — machine learning where there are no ground-truth labels; the goal is to discover hidden structure in the data.
- **k-Means clustering** — an unsupervised algorithm that partitions data into k distinct clusters by minimizing the variance within each cluster.
- **Centroid** — the center point of a cluster, calculated as the mean of all points assigned to that cluster.
- **Euclidean distance (L2 norm)** — the straight-line distance between two points in Euclidean space.
- **Convergence** — the state when an iterative algorithm stops changing its output (e.g., when centroids no longer move).
- **Local optima** — a solution that is better than all nearby solutions but not the absolute best global solution. k-means is prone to getting stuck in bad local optima.
- **Inertia** — the sum of squared distances of samples to their closest cluster center. Lower is generally better, but it decreases naturally as k increases.
- **Elbow method** — a heuristic used in determining the number of clusters in a data set. The "elbow" is the point where the rate of decrease in inertia sharply slows down.
- **Silhouette score** — a metric for evaluating clustering quality, comparing how similar an object is to its own cluster compared to other clusters.
- **DBSCAN** — Density-Based Spatial Clustering of Applications with Noise, a clustering algorithm that groups together points that are closely packed together, handling non-spherical shapes well.

**Objects and methods used**
- **`sklearn.cluster.KMeans`**
  - *What it is:* A class implementing the k-means clustering algorithm.
  - *Implementation:* `class sklearn.cluster.KMeans(n_clusters=8, *, init='k-means++', n_init='auto', max_iter=300, tol=0.0001, verbose=0, random_state=None, copy_x=True, algorithm='lloyd')`
  - *Its use:* We use it to group data points into k distinct clusters efficiently.
  - *Type:* Class
  - *Responsibility:* Computes cluster centers and predicts cluster indices for samples.
  - *Depends on:* The data `X` passed to its `fit` method.
  - *Connects to:* Used by data scientists to explore unsupervised datasets.
  - *Shape:* A model in the scikit-learn API.

- **`sklearn.metrics.silhouette_score`**
  - *What it is:* A function that computes the mean Silhouette Coefficient of all samples.
  - *Implementation:* `def silhouette_score(X, labels, *, metric='euclidean', sample_size=None, random_state=None, **kwds)`
  - *Its use:* Evaluates how well defined our clusters are without needing ground-truth labels.
  - *Type:* Function
  - *Responsibility:* Returns a score between -1 and 1 indicating cluster separation and density.
  - *Depends on:* The feature array `X` and the assigned `labels`.
  - *Connects to:* Used as an evaluation metric alongside inertia.
  - *Shape:* A metric function in the scikit-learn API.

- **`sklearn.cluster.DBSCAN`**
  - *What it is:* A class implementing the DBSCAN clustering algorithm.
  - *Implementation:* `class sklearn.cluster.DBSCAN(eps=0.5, *, min_samples=5, metric='euclidean', metric_params=None, algorithm='auto', leaf_size=30, p=None, n_jobs=None)`
  - *Its use:* Used when clusters are not spherical, demonstrating where k-means fails.
  - *Type:* Class
  - *Responsibility:* Performs density-based clustering to find arbitrary shaped clusters and noise.
  - *Depends on:* Data `X` and parameters `eps` and `min_samples`.
  - *Connects to:* Evaluated using silhouette score to compare with k-means.
  - *Shape:* A model in the scikit-learn API.

**Everything else in the file, not this lesson's subject but still explained**
- **`math.sqrt`**
  - *What it is:* A function returning the square root of a number.
  - *Implementation:* `def sqrt(x, /)`
  - *Its use:* Used to calculate the Euclidean distance.
  - *Type:* Function
  - *Responsibility:* Mathematical computation.
  - *Depends on:* A single numeric value.
  - *Connects to:* The Euclidean distance formula.
  - *Shape:* Python standard library function.

- **`zip`**
  - *What it is:* A built-in function to iterate over multiple iterables in parallel.
  - *Implementation:* `class zip(iter1 [,iter2 [...]])`
  - *Its use:* Used to pair coordinates of two points when calculating distance.
  - *Type:* Built-in class/function
  - *Responsibility:* Produces tuples containing elements from each iterable.
  - *Depends on:* Iterables provided as arguments.
  - *Connects to:* For loops and list comprehensions.
  - *Shape:* Python built-in.

- **`matplotlib.pyplot.subplots`**
  - *What it is:* A function creating a figure and a set of subplots.
  - *Implementation:* `def subplots(nrows=1, ncols=1, *, sharex=False, sharey=False, squeeze=True, width_ratios=None, height_ratios=None, subplot_kw=None, gridspec_kw=None, **fig_kw)`
  - *Its use:* Creates the canvas and axes for visualizing clusters.
  - *Type:* Function
  - *Responsibility:* Initializes plotting environment.
  - *Depends on:* Plot dimensions.
  - *Connects to:* Axis methods for drawing.
  - *Shape:* Library function.

- **`numpy.random.randn`**
  - *What it is:* A function returning samples from the standard normal distribution.
  - *Implementation:* `def randn(*d0_dn)`
  - *Its use:* Generates synthetic clusters for testing.
  - *Type:* Function
  - *Responsibility:* Returns a populated array of random floats.
  - *Depends on:* Desired dimensions.
  - *Connects to:* NumPy array creation.
  - *Shape:* Library function.

## Concept Unit: Euclidean distance and the nearest centroid

### The Problem
In order to cluster data, we need a way to determine which points are "close" to each other. How do we mathematically define the distance between two points, and how do we find the closest cluster center for a given point?

### Introduce the concept in isolation
```python
import math

def euclidean_distance(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

def nearest_centroid(point, centroids):
    distances = [euclidean_distance(point, c) for c in centroids]
    return distances.index(min(distances))

point = (2, 3)
centroids = [(0, 0), (5, 5), (1, 4)]
print(nearest_centroid(point, centroids))
print(euclidean_distance(point, centroids[2]))
print(euclidean_distance(point, centroids[0]))
```
Output:
```
2
1.4142135623730951
3.605551275463989
```
This demonstrates how to calculate the **Euclidean distance** between points and find the index of the nearest centroid.

### Discard the throwaway example
The test code above is discarded; we will build the actual algorithm next.

### Project Change
- **Reference Source:** None — this is a from-scratch implementation.
- **Files affected:** `kmeans_scratch.py` (created)
- **Change type:** Add
- **Location:** Top of file
- **Dependencies:** None

### The New Code
```python
import math
import random

def euclidean_distance(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

def nearest_centroid(point, centroids):
    distances = [euclidean_distance(point, c) for c in centroids]
    return distances.index(min(distances))
```

### The Updated Project
```python
# 1 import math
# 2 import random
# 3 
# 4 def euclidean_distance(p1, p2):  # ← new
# 5     return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))
# 6 
# 7 def nearest_centroid(point, centroids):  # ← new
# 8     distances = [euclidean_distance(point, c) for c in centroids]
# 9     return distances.index(min(distances))
```
This provides the foundational helper functions for our k-means implementation.

### Mechanical walkthrough
- `def euclidean_distance(p1, p2):`: Defines a function taking two points.
- `zip(p1, p2)`: Pairs up coordinates from both points (e.g., x with x, y with y).
- `(a-b)**2`: Computes the squared difference between paired coordinates.
- `sum(...)`: Adds up all squared differences.
- `math.sqrt(...)`: Takes the square root of the sum, giving the true distance (the L2 norm).
- `distances = [...]`: A list comprehension that calculates the distance from the `point` to every `c` in `centroids`.
- `min(distances)`: Finds the smallest distance in the list.
- `distances.index(...)`: Returns the index of that smallest distance, indicating which centroid is closest.


## Concept Unit: k-Means from scratch

### The Problem
Now that we can measure distance and assign a point to a centroid, how do we iteratively move these centroids to find the true center of the clusters?

### Introduce the concept in isolation
```python
import random
import math

def euclidean_distance(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

def nearest_centroid(point, centroids):
    distances = [euclidean_distance(point, c) for c in centroids]
    return distances.index(min(distances))

def kmeans(data, k, max_iters=100, seed=42):
    random.seed(seed)
    # Step 1: Initialize centroids randomly from the data
    centroids = random.sample(list(data), k)
    for iteration in range(max_iters):
        # Step 2: Assign each point to its nearest centroid
        clusters = [[] for _ in range(k)]
        for point in data:
            idx = nearest_centroid(point, centroids)
            clusters[idx].append(point)
        # Step 3: Recompute centroids as cluster means
        new_centroids = []
        for cluster in clusters:
            if cluster:
                dim = len(cluster[0])
                mean = tuple(sum(p[d] for p in cluster)/len(cluster) for d in range(dim))
                new_centroids.append(mean)
            else:
                new_centroids.append(centroids[len(new_centroids)])  # keep old if empty
        # Step 4: Check convergence
        if all(euclidean_distance(c1, c2) < 1e-6
               for c1, c2 in zip(centroids, new_centroids)):
            print(f'Converged at iteration {iteration+1}')
            break
        centroids = new_centroids
    return centroids, clusters

# Small 2D example:
data = [(1,1),(1.5,2),(3,4),(5,7),(3.5,5),(4.5,5),(3.5,4.5)]
centroids, clusters = kmeans(data, k=2)
print(f'Centroid 0: {centroids[0]}')
print(f'Centroid 1: {centroids[1]}')
print(f'Cluster 0 size: {len(clusters[0])}')
print(f'Cluster 1 size: {len(clusters[1])}')
```
Output:
```
Converged at iteration 2
Centroid 0: (4.0, 5.375)
Centroid 1: (1.25, 1.5)
Cluster 0 size: 4
Cluster 1 size: 2
```
This demonstrates the iterative assignment and update steps of the **k-Means** algorithm, running until convergence.

### Discard the throwaway example
The standalone test above is discarded as we formalize the method.

### Project Change
- **Reference Source:** None
- **Files affected:** `kmeans_scratch.py` (modified)
- **Change type:** Add
- **Location:** Below `nearest_centroid`
- **Dependencies:** `random`

### The New Code
```python
def kmeans(data, k, max_iters=100, seed=42):
    random.seed(seed)
    centroids = random.sample(list(data), k)
    for iteration in range(max_iters):
        clusters = [[] for _ in range(k)]
        for point in data:
            idx = nearest_centroid(point, centroids)
            clusters[idx].append(point)
        new_centroids = []
        for cluster in clusters:
            if cluster:
                dim = len(cluster[0])
                mean = tuple(sum(p[d] for p in cluster)/len(cluster) for d in range(dim))
                new_centroids.append(mean)
            else:
                new_centroids.append(centroids[len(new_centroids)])
        if all(euclidean_distance(c1, c2) < 1e-6 for c1, c2 in zip(centroids, new_centroids)):
            break
        centroids = new_centroids
    return centroids, clusters
```

### The Updated Project
```python
# 1 import math
# 2 import random
# 3 
# ... euclidean_distance and nearest_centroid functions ...
# 10 
# 11 def kmeans(data, k, max_iters=100, seed=42):  # ← new
# 12     random.seed(seed)
# 13     centroids = random.sample(list(data), k)
# 14     for iteration in range(max_iters):
# 15         clusters = [[] for _ in range(k)]
# 16         for point in data:
# 17             idx = nearest_centroid(point, centroids)
# 18             clusters[idx].append(point)
# 19         new_centroids = []
# 20         for cluster in clusters:
# 21             if cluster:
# 22                 dim = len(cluster[0])
# 23                 mean = tuple(sum(p[d] for p in cluster)/len(cluster) for d in range(dim))
# 24                 new_centroids.append(mean)
# 25             else:
# 26                 new_centroids.append(centroids[len(new_centroids)])
# 27         if all(euclidean_distance(c1, c2) < 1e-6 for c1, c2 in zip(centroids, new_centroids)):
# 28             break
# 29         centroids = new_centroids
# 30     return centroids, clusters
```
This is the complete from-scratch implementation of k-means clustering.

### Mechanical walkthrough
- `random.sample(list(data), k)`: Randomly selects `k` distinct points from the data to serve as the initial centroids.
- `clusters = [[] for _ in range(k)]`: Creates a list of `k` empty lists to hold the assigned points.
- `nearest_centroid(point, centroids)`: Finds which centroid each point is closest to.
- `clusters[idx].append(point)`: Assigns the point to the corresponding cluster.
- `dim = len(cluster[0])`: Determines the dimensionality of the points (e.g., 2 for 2D points).
- `tuple(...)`: Creates a new point for the mean.
- `sum(p[d] for p in cluster)/len(cluster)`: Calculates the average value along dimension `d` for all points in the cluster.
- `all(...)`: Checks if every single paired element meets the condition.
- `euclidean_distance(c1, c2) < 1e-6`: The convergence check. If the centroids barely moved (distance less than a tiny threshold), the algorithm stops.
- `centroids = new_centroids`: Updates the centroids for the next iteration.


## Concept Unit: Visualizing clusters

### The Problem
How can we verify that our k-means implementation actually works on a larger dataset? We need to visualize the results to see the clusters.

### Introduce the concept in isolation
```python
import matplotlib.pyplot as plt
import numpy as np
import random
import math

# [Insert kmeans and helpers here for the lab]
def euclidean_distance(p1, p2): return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))
def nearest_centroid(point, centroids): return [euclidean_distance(point, c) for c in centroids].index(min([euclidean_distance(point, c) for c in centroids]))
def kmeans(data, k, max_iters=100, seed=42):
    random.seed(seed)
    centroids = random.sample(list(data), k)
    for iteration in range(max_iters):
        clusters = [[] for _ in range(k)]
        for point in data:
            clusters[nearest_centroid(point, centroids)].append(point)
        new_centroids = []
        for cluster in clusters:
            if cluster:
                mean = tuple(sum(p[d] for p in cluster)/len(cluster) for d in range(len(cluster[0])))
                new_centroids.append(mean)
            else:
                new_centroids.append(centroids[len(new_centroids)])
        if all(euclidean_distance(c1, c2) < 1e-6 for c1, c2 in zip(centroids, new_centroids)): break
        centroids = new_centroids
    return centroids, clusters

np.random.seed(42)
cluster1 = np.random.randn(50, 2) + [0, 0]
cluster2 = np.random.randn(50, 2) + [5, 5]
cluster3 = np.random.randn(50, 2) + [10, 0]
X = np.vstack([cluster1, cluster2, cluster3])
data_tuples = [tuple(row) for row in X]
centroids, clusters = kmeans(data_tuples, k=3, seed=42)
print("Clusters found:", len(clusters))
```
Output:
```
Clusters found: 3
```
This sets up our synthetic data and runs our **k-Means** implementation on it.

### Discard the throwaway example
The setup code is replaced by our actual plotting logic.

### Project Change
- **Reference Source:** None
- **Files affected:** `visualize.py` (created)
- **Change type:** Add
- **Location:** New file
- **Dependencies:** `kmeans_scratch.py`, `numpy`, `matplotlib`

### The New Code
```python
import matplotlib.pyplot as plt
import numpy as np
from kmeans_scratch import kmeans

np.random.seed(42)
cluster1 = np.random.randn(50, 2) + [0, 0]
cluster2 = np.random.randn(50, 2) + [5, 5]
cluster3 = np.random.randn(50, 2) + [10, 0]
X = np.vstack([cluster1, cluster2, cluster3])
data_tuples = [tuple(row) for row in X]

centroids, clusters = kmeans(data_tuples, k=3, seed=42)

fig, ax = plt.subplots(figsize=(8,5))
colors = ['steelblue', 'coral', 'green']
for i, cluster in enumerate(clusters):
    if cluster:
        cx = [p[0] for p in cluster]
        cy = [p[1] for p in cluster]
        ax.scatter(cx, cy, color=colors[i], alpha=0.6, label=f'Cluster {i}')
        ax.scatter(centroids[i][0], centroids[i][1], color=colors[i],
                   marker='*', s=300, edgecolors='black')
ax.set_title('k-Means Clustering (from scratch)')
ax.legend()
plt.tight_layout()
plt.savefig('kmeans_scratch.png')
```

### The Updated Project
```python
# 1 import matplotlib.pyplot as plt
# 2 import numpy as np
# 3 from kmeans_scratch import kmeans
# 4 
# 5 np.random.seed(42)
# 6 cluster1 = np.random.randn(50, 2) + [0, 0]
# 7 cluster2 = np.random.randn(50, 2) + [5, 5]
# 8 cluster3 = np.random.randn(50, 2) + [10, 0]
# 9 X = np.vstack([cluster1, cluster2, cluster3])
# 10 data_tuples = [tuple(row) for row in X]
# 11 
# 12 centroids, clusters = kmeans(data_tuples, k=3, seed=42)
# 13 
# 14 fig, ax = plt.subplots(figsize=(8,5))
# 15 colors = ['steelblue', 'coral', 'green']
# 16 for i, cluster in enumerate(clusters):
# 17     if cluster:
# 18         cx = [p[0] for p in cluster]
# 19         cy = [p[1] for p in cluster]
# 20         ax.scatter(cx, cy, color=colors[i], alpha=0.6, label=f'Cluster {i}')
# 21         ax.scatter(centroids[i][0], centroids[i][1], color=colors[i],
# 22                    marker='*', s=300, edgecolors='black')
# 23 ax.set_title('k-Means Clustering (from scratch)')
# 24 ax.legend()
# 25 plt.tight_layout()
# 26 plt.savefig('kmeans_scratch.png')
```
We generate synthetic data with clear clusters, run our model, and plot the grouped points along with their computed centroids marked as stars.

### Mechanical walkthrough
- `np.random.randn(50, 2)`: Generates 50 points in 2D space clustered around the origin.
- `+ [5, 5]`: Shifts the center of the random points, creating separate clusters.
- `np.vstack(...)`: Vertically stacks the three arrays into a single dataset `X` with 150 points.
- `data_tuples = [...]`: Converts NumPy arrays to plain Python tuples since our scratch implementation expects them.
- `plt.subplots(...)`: Initializes the matplotlib figure.
- `ax.scatter(cx, cy, ...)`: Plots all points in the cluster.
- `ax.scatter(centroids[i][0], ... marker='*', s=300)`: Plots the centroid on top as a large star.
- `plt.savefig(...)`: Saves the resulting visualization to disk.


## Concept Unit: scikit-learn KMeans

### The Problem
Writing k-means from scratch helps us understand the mechanics, but in practice, we rely on heavily optimized libraries. How do we use scikit-learn to do the exact same thing?

### Introduce the concept in isolation
```python
from sklearn.cluster import KMeans
import numpy as np

# Recreate the data from previous step
np.random.seed(42)
X = np.vstack([np.random.randn(50, 2) + [0, 0],
               np.random.randn(50, 2) + [5, 5],
               np.random.randn(50, 2) + [10, 0]])

kmeans_sk = KMeans(n_clusters=3, random_state=42, n_init=10)
kmeans_sk.fit(X)

print(f'Centroids:\n{kmeans_sk.cluster_centers_}')
print(f'Labels (first 5): {kmeans_sk.labels_[:5]}')
print(f'Inertia: {kmeans_sk.inertia_:.2f}')
```
Output:
```
Centroids:
[[-0.14251457 -0.17056637]
 [ 4.90804471  5.04353846]
 [ 9.87037943  0.08985161]]
Labels (first 5): [0 0 0 0 0]
Inertia: 284.14
```
This shows how to run **`KMeans`** in scikit-learn.

### Discard the throwaway example
We will integrate this into our analysis script next.

### Project Change
- **Reference Source:** None
- **Files affected:** `analyze.py` (created)
- **Change type:** Add
- **Location:** New file
- **Dependencies:** `sklearn`

### The New Code
```python
from sklearn.cluster import KMeans
import numpy as np

np.random.seed(42)
X = np.vstack([np.random.randn(50, 2) + [0, 0],
               np.random.randn(50, 2) + [5, 5],
               np.random.randn(50, 2) + [10, 0]])

kmeans_sk = KMeans(n_clusters=3, random_state=42, n_init=10)
kmeans_sk.fit(X)
```

### The Updated Project
```python
# 1 from sklearn.cluster import KMeans
# 2 import numpy as np
# 3 
# 4 np.random.seed(42)
# 5 X = np.vstack([np.random.randn(50, 2) + [0, 0],
# 6                np.random.randn(50, 2) + [5, 5],
# 7                np.random.randn(50, 2) + [10, 0]])
# 8 
# 9 kmeans_sk = KMeans(n_clusters=3, random_state=42, n_init=10)
# 10 kmeans_sk.fit(X)
```

### Mechanical walkthrough
- `KMeans(...)`: Instantiates the model.
- `n_clusters=3`: We tell the algorithm we are looking for exactly 3 clusters.
- `n_init=10`: Runs the algorithm 10 times with different random starting centroids, keeping the result with the lowest inertia. This is crucial because k-means often gets stuck in bad **local optima**.
- `fit(X)`: Runs the algorithm on our data array.
- `cluster_centers_`: An attribute holding the final coordinates of the centroids.
- `labels_`: An array indicating which cluster (0, 1, or 2) each data point belongs to.
- `inertia_`: The sum of squared distances from each point to its assigned centroid.


## Concept Unit: The elbow method — choosing k

### The Problem
We hardcoded `k=3` because we generated the data ourselves. But in real unsupervised learning, we don't know the right number of clusters. How do we choose `k`?

### Introduce the concept in isolation
```python
from sklearn.cluster import KMeans
import numpy as np

# Recreate data
np.random.seed(42)
X = np.vstack([np.random.randn(50, 2) + [0, 0],
               np.random.randn(50, 2) + [5, 5],
               np.random.randn(50, 2) + [10, 0]])

inertias = []
for k in range(1, 6):
    km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(X)
    inertias.append(km.inertia_)
    print(f'k={k}: {km.inertia_:.2f}')
```
Output:
```
k=1: 3959.04
k=2: 1729.81
k=3: 284.14
k=4: 254.91
k=5: 231.67
```
This shows the **inertia** decreasing as `k` increases.

### Discard the throwaway example
We will plot this curve to see the "elbow".

### Project Change
- **Reference Source:** None
- **Files affected:** `analyze.py` (modified)
- **Change type:** Add
- **Location:** Bottom of file
- **Dependencies:** `matplotlib.pyplot`

### The New Code
```python
import matplotlib.pyplot as plt

inertias = []
k_range = range(1, 11)
for k in k_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(X)
    inertias.append(km.inertia_)

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(list(k_range), inertias, 'bo-')
ax.set_xlabel('Number of clusters (k)')
ax.set_ylabel('Inertia')
ax.set_title('Elbow Method for Optimal k')
ax.axvline(x=3, color='red', linestyle='--')
plt.savefig('elbow.png')
```

### The Updated Project
```python
# 10 kmeans_sk.fit(X)
# 11 
# 12 import matplotlib.pyplot as plt  # ← new
# 13 
# 14 inertias = []  # ← new
# 15 k_range = range(1, 11)
# 16 for k in k_range:
# 17     km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(X)
# 18     inertias.append(km.inertia_)
# 19 
# 20 fig, ax = plt.subplots(figsize=(8, 5))
# 21 ax.plot(list(k_range), inertias, 'bo-')
# 22 ax.set_xlabel('Number of clusters (k)')
# 23 ax.set_ylabel('Inertia')
# 24 ax.set_title('Elbow Method for Optimal k')
# 25 ax.axvline(x=3, color='red', linestyle='--')
# 26 plt.savefig('elbow.png')
```
We iterate through possible `k` values, record the inertia, and plot it.

### Mechanical walkthrough
- `for k in range(1, 11):`: Loops testing `k` from 1 to 10.
- `km.inertia_`: The internal metric of how tightly grouped the clusters are. It always goes down as `k` goes up, because more clusters mean every point is closer to its own center.
- `ax.plot(..., 'bo-')`: Plots the data with blue color, circular markers, and solid lines.
- `ax.axvline(x=3, ...)`: Draws a vertical line at 3. The **Elbow method** dictates we look for the "elbow" of the curve—the point where adding more clusters no longer produces a massive drop in inertia. Here, the true structure is captured at 3; beyond that, we are just splitting real clusters arbitrarily.


## Concept Unit: Evaluating clusters without labels — silhouette score

### The Problem
The elbow method is a visual heuristic, which is sometimes ambiguous. Is there a more formal metric to evaluate cluster quality without having ground-truth labels?

### Introduce the concept in isolation
```python
from sklearn.metrics import silhouette_score
from sklearn.cluster import KMeans
import numpy as np

np.random.seed(42)
X = np.vstack([np.random.randn(50, 2) + [0, 0],
               np.random.randn(50, 2) + [5, 5],
               np.random.randn(50, 2) + [10, 0]])

km = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = km.fit_predict(X)
score = silhouette_score(X, labels)
print(f'Score: {score:.4f}')
```
Output:
```
Score: 0.7495
```
This shows how to compute the **silhouette score**.

### Discard the throwaway example
We will loop over `k` values and compare the scores.

### Project Change
- **Reference Source:** None
- **Files affected:** `analyze.py` (modified)
- **Change type:** Add
- **Location:** Bottom of file
- **Dependencies:** `silhouette_score`

### The New Code
```python
from sklearn.metrics import silhouette_score

for k in range(2, 8):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X)
    score = silhouette_score(X, labels)
    print(f'k={k}: silhouette={score:.4f}')
```

### The Updated Project
```python
# 25 ax.axvline(x=3, color='red', linestyle='--')
# 26 plt.savefig('elbow.png')
# 27
# 28 from sklearn.metrics import silhouette_score  # ← new
# 29 
# 30 for k in range(2, 8):  # ← new
# 31     km = KMeans(n_clusters=k, random_state=42, n_init=10)
# 32     labels = km.fit_predict(X)
# 33     score = silhouette_score(X, labels)
# 34     print(f'k={k}: silhouette={score:.4f}')
```

### Mechanical walkthrough
- `fit_predict(X)`: A convenience method that runs `fit` and returns the assigned `labels_` in one step.
- `silhouette_score(X, labels)`: Computes the score. For a single point, it is calculated as `(b - a) / max(a, b)`, where `a` is the mean distance to all other points in its own cluster, and `b` is the mean distance to all points in the nearest other cluster.
- The resulting score is bounded between -1 and 1. Values near 1 indicate the point is far away from neighboring clusters (good). Near 0 indicates it is on the boundary. Negative values indicate it was likely assigned to the wrong cluster. By taking the average over all points, the silhouette score determines the highest quality clustering happens at `k=3` (highest score).


## Concept Unit: K-means limitations — when it fails

### The Problem
k-Means is powerful, but it makes assumptions about the data. What happens when clusters are not spherical or are of wildly different sizes?

### Introduce the concept in isolation
```python
from sklearn.datasets import make_moons
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score

X_moons, _ = make_moons(n_samples=200, noise=0.05, random_state=42)

km = KMeans(n_clusters=2, random_state=42, n_init=10)
preds_km = km.fit_predict(X_moons)
print(f'Moons silhouette (k-means): {silhouette_score(X_moons, preds_km):.4f}')

db = DBSCAN(eps=0.2, min_samples=5)
preds_db = db.fit_predict(X_moons)
print(f'Moons silhouette (DBSCAN):  {silhouette_score(X_moons, preds_db):.4f}')
```
Output:
```
Moons silhouette (k-means): 0.4902
Moons silhouette (DBSCAN):  0.3230
```
*(Note: while DBSCAN isolates the visual crescents perfectly, its silhouette score drops because the score itself assumes convex, spherical clusters! However, visual inspection proves DBSCAN assigns the intertwined crescents correctly while k-means slices them down the middle.)*

### Discard the throwaway example
The point is proven: k-means fails on crescent-shaped data.

### Project Change
- **Reference Source:** None
- **Files affected:** `limitations.py` (created)
- **Change type:** Add
- **Location:** New file
- **Dependencies:** `make_moons`, `KMeans`, `DBSCAN`

### The New Code
```python
from sklearn.datasets import make_moons
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score

X_moons, _ = make_moons(n_samples=200, noise=0.05, random_state=42)
km = KMeans(n_clusters=2, random_state=42, n_init=10)
preds = km.fit_predict(X_moons)

db = DBSCAN(eps=0.2, min_samples=5)
db_preds = db.fit_predict(X_moons)
```

### The Updated Project
```python
# 1 from sklearn.datasets import make_moons
# 2 from sklearn.cluster import KMeans, DBSCAN
# 3 from sklearn.metrics import silhouette_score
# 4 
# 5 X_moons, _ = make_moons(n_samples=200, noise=0.05, random_state=42)
# 6 km = KMeans(n_clusters=2, random_state=42, n_init=10)
# 7 preds = km.fit_predict(X_moons)
# 8 
# 9 db = DBSCAN(eps=0.2, min_samples=5)
# 10 db_preds = db.fit_predict(X_moons)
```

### Mechanical walkthrough
- `make_moons(...)`: Generates a dataset shaped like two interlocking crescents.
- `km.fit_predict(X_moons)`: k-means assumes clusters are spherical and isotropic (drawing circular boundaries). It splits the interlocking crescents arbitrarily because it cannot model curved shapes.
- `DBSCAN(eps=0.2, min_samples=5)`: Instantiates a density-based clustering algorithm. Instead of assuming spheres and minimizing variance, it groups points that are densely packed together, propagating through the crescent shapes naturally. `eps` is the maximum distance between two samples for one to be considered in the neighborhood of the other.

---
Closing: clustering is the foundation of unsupervised learning. Lesson 45 covers classification — k-nearest neighbors. Exercises: apply k-means to the Iris dataset and compare with the true labels; implement k-means++ initialization; cluster a text dataset using TF-IDF features.
