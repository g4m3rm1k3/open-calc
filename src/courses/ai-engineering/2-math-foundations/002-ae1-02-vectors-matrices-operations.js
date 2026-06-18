export default {
  id: 'ae-p1-02-vectors-matrices-operations',
  slug: 'vectors-matrices-operations',
  chapter: 'ae-p1',
  order: 1,
  title: 'Vectors, Matrices & Operations',
  subtitle: 'Every neural network is just matrix multiplication with extra steps.',
  tags: ['vectors', 'matrices', 'matrix-multiply', 'determinant', 'inverse', 'broadcasting', 'numpy', 'neural-network-layer'],

  hook: {
    question: 'What is the line `output = activation(weights @ input + bias)` actually doing?',
    realWorldContext:
      'You want to build a neural network. You read the code and see `output = activation(weights @ input + bias)`. That `@` is matrix multiplication. The `weights` are a matrix. The `input` is a vector. If you do not know what those operations do, this line is magic. If you do know, it is the entire forward pass of a layer in three operations. Every image your model processes is a matrix. Every word embedding is a vector. Every layer of every neural network is a matrix transformation.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Matrix multiplication has a strict rule: (m × n) @ (n × p) = (m × p). The inner dimensions must match. A layer with 784 inputs and 128 outputs uses a 128×784 weight matrix: (128×784) @ (784×1) = (128×1). If you get a shape mismatch error in PyTorch, this is why.',
      'Element-wise multiplication and matrix multiplication are completely different operations. Element-wise multiplies matching positions (same shape required). Matrix multiplication computes dot products between rows and columns. Confusing them is one of the most common bugs in neural network implementations.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Element-wise ≠ matrix multiply',
        body: '`A * B` is element-wise (Hadamard product — same shape required). `A @ B` is matrix multiplication (inner dimensions must match). In PyTorch: `torch.mul` vs `torch.matmul`. Mixing them up silently computes the wrong thing.',
      },
      {
        type: 'insight',
        title: 'Broadcasting makes bias addition work',
        body: 'When you add a bias vector b to a matrix of batch outputs, their shapes don\'t match. Broadcasting stretches the smaller array to fit automatically. This is how every neural network framework handles bias addition.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Vectors, Matrices & Operations',
        mathBridge: 'For (m×n) @ (n×p) = (m×p): result[i][j] = sum over k of A[i][k] * B[k][j]. Each output element is a dot product of a row from A with a column from B.',
        caption: 'Build a Matrix class from scratch, then see why NumPy is 100x faster on the same math.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Vector class',
              prose: [
                '## Vectors: ordered lists of numbers',
                'A vector `[3, 4]` has magnitude 5 (the 3-4-5 triangle). Its direction points to coordinates (3, 4). In AI, vectors represent data points, features, and parameters.',
              ],
              code: `class Vector:
    def __init__(self, data):
        self.data = list(data)
        self.size = len(self.data)

    def __repr__(self):
        return f"Vector({self.data})"

    def __add__(self, other):
        return Vector([a + b for a, b in zip(self.data, other.data)])

    def __sub__(self, other):
        return Vector([a - b for a, b in zip(self.data, other.data)])

    def __mul__(self, scalar):
        return Vector([x * scalar for x in self.data])

    def dot(self, other):
        return sum(a * b for a, b in zip(self.data, other.data))

    def magnitude(self):
        return sum(x ** 2 for x in self.data) ** 0.5

v1 = Vector([3, 4])
v2 = Vector([1, 2])
print(f"v1 = {v1}")
print(f"v2 = {v2}")
print(f"v1 + v2 = {v1 + v2}")
print(f"v1 · v2 = {v1.dot(v2)}")
print(f"|v1| = {v1.magnitude():.4f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Matrix class with core operations',
              prose: [
                '## Why shapes matter',
                '`(m × n) @ (n × p) = (m × p)` — inner dimensions must match. A layer with 784 inputs and 128 outputs: `(128×784) @ (784×1) = (128×1)`.',
                '## Element-wise vs matrix multiplication',
                'Element-wise: multiply matching positions. Both must be same shape.\nMatrix: dot products of rows and columns. Inner dims must match.',
              ],
              code: `class Matrix:
    def __init__(self, data):
        self.data = [list(row) for row in data]
        self.rows = len(self.data)
        self.cols = len(self.data[0])
        self.shape = (self.rows, self.cols)

    def __repr__(self):
        rows_str = "\\n  ".join(str(row) for row in self.data)
        return f"Matrix({self.shape}):\\n  {rows_str}"

    def __add__(self, other):
        return Matrix([
            [self.data[i][j] + other.data[i][j] for j in range(self.cols)]
            for i in range(self.rows)
        ])

    def element_wise_multiply(self, other):
        return Matrix([
            [self.data[i][j] * other.data[i][j] for j in range(self.cols)]
            for i in range(self.rows)
        ])

    def matmul(self, other):
        return Matrix([
            [
                sum(self.data[i][k] * other.data[k][j] for k in range(self.cols))
                for j in range(other.cols)
            ]
            for i in range(self.rows)
        ])

    def transpose(self):
        return Matrix([
            [self.data[j][i] for j in range(self.rows)]
            for i in range(self.cols)
        ])

    def determinant(self):
        if self.shape == (1, 1): return self.data[0][0]
        if self.shape == (2, 2):
            return self.data[0][0]*self.data[1][1] - self.data[0][1]*self.data[1][0]
        det = 0
        for j in range(self.cols):
            minor = Matrix([
                [self.data[i][k] for k in range(self.cols) if k != j]
                for i in range(1, self.rows)
            ])
            det += ((-1) ** j) * self.data[0][j] * minor.determinant()
        return det

    def inverse_2x2(self):
        det = self.determinant()
        if det == 0: raise ValueError("Matrix is singular, no inverse exists")
        return Matrix([
            [self.data[1][1] / det, -self.data[0][1] / det],
            [-self.data[1][0] / det, self.data[0][0] / det]
        ])

    @staticmethod
    def identity(n):
        return Matrix([[1 if i == j else 0 for j in range(n)] for i in range(n)])


A = Matrix([[1, 2], [3, 4]])
B = Matrix([[5, 6], [7, 8]])

print(f"A + B = {(A + B).data}")
print(f"A * B (element-wise) = {A.element_wise_multiply(B).data}")
print(f"A @ B (matrix mul)   = {A.matmul(B).data}")
print(f"A^T = {A.transpose().data}")
print(f"det(A) = {A.determinant()}")
print(f"A^-1 = {[[round(x,4) for x in row] for row in A.inverse_2x2().data]}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'A neural network layer from scratch',
              prose: [
                '## output = relu(W @ x + b)',
                'This is the complete forward pass of a dense layer.',
                '- `W` is the weight matrix: (output_size × input_size)\n- `x` is the input vector: (input_size × 1)\n- `b` is the bias: (output_size × 1)\n- `relu` is the activation: max(0, x)',
              ],
              code: `import random

random.seed(42)

# Input: 3 features, hidden: 2 neurons
inputs = Matrix([[0.5], [0.8], [0.2]])       # (3 x 1)
weights = Matrix([
    [random.uniform(-1, 1) for _ in range(3)]
    for _ in range(2)
])                                              # (2 x 3)
bias = Matrix([[0.1], [0.1]])                  # (2 x 1)

def relu_matrix(m):
    return Matrix([[max(0, val) for val in row] for row in m.data])

pre_activation = weights.matmul(inputs)
pre_activation_biased = Matrix([
    [pre_activation.data[i][0] + bias.data[i][0]]
    for i in range(pre_activation.rows)
])
output = relu_matrix(pre_activation_biased)

print(f"Input shape:   {inputs.shape}")
print(f"Weight shape:  {weights.shape}")
print(f"Output shape:  {output.shape}")
print(f"Output: {output.data}")
print()
print("This is output = relu(W @ x + b)")
print("Every dense layer in every neural network does exactly this.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'NumPy: the same math, 100x faster',
              prose: [
                '## NumPy uses optimized BLAS routines',
                'The `@` operator calls `__matmul__`. NumPy implements it with optimized C and Fortran BLAS routines.',
                '## Broadcasting',
                '```python\nmatrix = np.array([[1, 2, 3], [4, 5, 6]])\nbias = np.array([10, 20, 30])\nprint(matrix + bias)\n# NumPy broadcasts bias across both rows automatically\n```',
              ],
              code: `import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

print("A + B =\\n", A + B)
print("A * B (element-wise) =\\n", A * B)
print("A @ B (matrix multiply) =\\n", A @ B)
print("A^T =\\n", A.T)
print("det(A) =", np.linalg.det(A))
print("A^-1 =\\n", np.linalg.inv(A))
print("I =\\n", np.eye(2))

# Neural network layer with NumPy
inputs = np.random.randn(3, 1)
weights = np.random.randn(2, 3)
bias = np.array([[0.1], [0.1]])

pre_act = weights @ inputs + bias
output = np.maximum(0, pre_act)  # relu

print(f"\\nNeural network layer (NumPy):")
print(f"  inputs: {inputs.T}")
print(f"  output: {output.T}")

# Broadcasting demonstration
matrix = np.array([[1, 2, 3], [4, 5, 6]])
row_bias = np.array([10, 20, 30])
print(f"\\nBroadcasting: matrix + row_bias")
print(f"  matrix:\\n  {matrix}")
print(f"  bias: {row_bias}")
print(f"  result:\\n  {matrix + row_bias}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Matrix multiply shape checker',
              difficulty: 'easy',
              prompt: 'Write `check_matmul_shapes(shapes_a, shapes_b)` that takes two tuples representing matrix shapes and returns a dict with `"valid"` (bool), `"result_shape"` (tuple if valid), and `"error"` (string if invalid). Also write `chain_shapes(shapes_list)` that takes a list of shape tuples representing a sequence of matrix multiplications and returns the final output shape, or raises `ValueError` if any multiplication is incompatible.',
              code: `def check_matmul_shapes(shapes_a, shapes_b):
    """
    Check if two matrices can be multiplied.
    shapes_a: (m, n), shapes_b: (n, p)
    Returns: {valid: bool, result_shape: tuple or None, error: str or None}
    """
    pass

def chain_shapes(shapes_list):
    """
    Compute result shape from a chain of matrix multiplications.
    shapes_list: [(m,n), (n,p), (p,q), ...]
    Returns the final shape, raises ValueError on incompatible dimensions.
    """
    pass

# Test cases
print("Shape compatibility checks:")
cases = [
    ((128, 784), (784, 1)),    # valid: dense layer
    ((32, 512), (512, 256)),   # valid: layer-to-layer
    ((128, 784), (512, 1)),    # invalid: inner dims don't match
    ((3, 4), (4, 5)),          # valid
]

for a, b in cases:
    result = check_matmul_shapes(a, b)
    status = "✓" if result['valid'] else "✗"
    if result['valid']:
        print(f"  {status} {a} @ {b} = {result['result_shape']}")
    else:
        print(f"  {status} {a} @ {b}: {result['error']}")

# Chain of a two-layer network
print("\\nTwo-layer network shape chain:")
shapes = [(784, 1), (128, 784), (10, 128)]  # input, W1, W2
# Note: chain goes right to left in forward pass: W2 @ W1 @ x
# But let's check pairwise left to right for the chain
try:
    final = chain_shapes([(128, 784), (784, 1)])
    print(f"  Layer 1: {final}")
    final2 = chain_shapes([(10, 128), (128, 784), (784, 1)])
    print(f"  Full network: {final2}")
except ValueError as e:
    print(f"  Error: {e}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'check_matmul_shapes' not in dir() or 'chain_shapes' not in dir():
    res = "ERROR: check_matmul_shapes or chain_shapes not defined."
else:
    r1 = check_matmul_shapes((128, 784), (784, 1))
    if not r1.get('valid') or r1.get('result_shape') != (128, 1):
        res = f"ERROR: (128,784)@(784,1) should give (128,1), got {r1}"
    else:
        r2 = check_matmul_shapes((128, 784), (512, 1))
        if r2.get('valid'):
            res = f"ERROR: (128,784)@(512,1) should be invalid, got {r2}"
        else:
            try:
                chain = chain_shapes([(10, 128), (128, 784), (784, 1)])
                if chain != (10, 1):
                    res = f"ERROR: chain should give (10,1), got {chain}"
                else:
                    try:
                        chain_shapes([(10, 128), (512, 1)])
                        res = "ERROR: Should raise ValueError for incompatible chain"
                    except ValueError:
                        res = "SUCCESS: check_matmul_shapes and chain_shapes work correctly."
            except Exception as e:
                res = f"ERROR in chain_shapes: {e}"
res
`,
              hint: 'check_matmul_shapes: valid if shapes_a[1] == shapes_b[0], result = (shapes_a[0], shapes_b[1]). chain_shapes: start with first shape, then for each subsequent shape call check_matmul_shapes with current_result and next_shape.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Dense layer implementation',
              difficulty: 'medium',
              prompt: 'Write a `DenseLayer` class with `__init__(self, input_size, output_size, seed=42)` that initializes weights W (output_size × input_size) and bias b (output_size × 1) with small random values. Add `forward(self, x)` that takes a list of floats and returns `relu(W @ x + b)` as a list. Use only Python lists — no NumPy. ReLU is max(0, x) applied element-wise.',
              code: `import random
import math

class DenseLayer:
    """A single fully-connected neural network layer: output = relu(W @ x + b)"""

    def __init__(self, input_size, output_size, seed=42):
        """Initialize with small random weights and zero biases."""
        pass

    def forward(self, x):
        """
        Forward pass: output = relu(W @ x + b)
        x: list of input_size floats
        Returns: list of output_size floats
        """
        pass

# Test: 3-input, 2-neuron layer
layer = DenseLayer(3, 2, seed=42)
x = [0.5, 0.8, 0.2]
output = layer.forward(x)

print(f"Input: {x}")
print(f"Weights shape: ({len(layer.W)} x {len(layer.W[0])})")
print(f"Bias shape: {len(layer.b)}")
print(f"Output: {[round(v, 4) for v in output]}")
print(f"Output > 0 (relu applied): {all(v >= 0 for v in output)}")

# Chain two layers
layer2 = DenseLayer(2, 1, seed=0)
final = layer2.forward(output)
print(f"\\nChained output (3→2→1): {[round(v, 4) for v in final]}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import random
if 'DenseLayer' not in dir():
    res = "ERROR: DenseLayer not defined."
else:
    layer = DenseLayer(3, 2, seed=42)
    if not hasattr(layer, 'W') or not hasattr(layer, 'b'):
        res = "ERROR: DenseLayer must have attributes W and b."
    elif len(layer.W) != 2 or len(layer.W[0]) != 3:
        res = f"ERROR: W should be (2 x 3), got ({len(layer.W)} x {len(layer.W[0])})"
    else:
        x = [1.0, 0.0, 0.0]
        output = layer.forward(x)
        if len(output) != 2:
            res = f"ERROR: output should have 2 elements, got {len(output)}"
        elif any(v < 0 for v in output):
            res = f"ERROR: relu should make all outputs >= 0, got {output}"
        else:
            # Zero input → bias only, all relu'd
            x_zero = [0.0, 0.0, 0.0]
            out_zero = layer.forward(x_zero)
            if len(out_zero) != 2:
                res = f"ERROR: zero input should give 2-element output, got {out_zero}"
            else:
                res = "SUCCESS: DenseLayer correctly implements output = relu(W @ x + b)."
res
`,
              hint: 'In __init__: use random.seed(seed), then W = [[random.gauss(0, 0.1) for _ in range(input_size)] for _ in range(output_size)], b = [0.0] * output_size. In forward: compute W@x+b manually (dot each row of W with x, add bias), then apply relu.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'For matrix multiplication (m x n) @ (n x p), what must be true about the dimensions?',
      options: [
        'm must equal p',
        'The inner dimensions n must match',
        'All dimensions must be equal',
        'm must be greater than p',
      ],
      correct: 1,
      explanation: 'Matrix multiplication requires the number of columns in the first matrix (n) to equal the number of rows in the second matrix (n). The result has shape (m x p).',
    },
    {
      id: 'q2',
      question: 'What is the identity matrix?',
      options: [
        'A matrix of all ones',
        'A square matrix with ones on the diagonal and zeros elsewhere that acts as the multiplicative identity',
        'A matrix where every element is unique',
        'The transpose of any given matrix',
      ],
      correct: 1,
      explanation: 'The identity matrix I has ones on the diagonal and zeros everywhere else. Multiplying any matrix by I returns the original matrix unchanged, like multiplying a number by 1.',
    },
    {
      id: 'q3',
      question: 'What is the key difference between element-wise multiplication and matrix multiplication?',
      options: [
        'Element-wise is faster while matrix multiplication is more accurate',
        'Element-wise multiplies matching positions (same shape required), matrix multiplication takes dot products of rows and columns (inner dimensions must match)',
        'They produce the same result but use different notation',
        'Element-wise only works on vectors while matrix multiplication works on matrices',
      ],
      correct: 1,
      explanation: 'Element-wise (Hadamard) product multiplies corresponding elements and requires identical shapes. Matrix multiplication computes dot products between rows and columns with the rule (m,n)@(n,p)=(m,p).',
    },
    {
      id: 'q4',
      question: "In the expression 'output = relu(W @ x + b)', what role does broadcasting play?",
      options: [
        'It broadcasts the computation across multiple GPUs',
        'It automatically stretches the bias vector b to match the shape of W @ x so they can be added',
        'It converts the data types of W and x to match',
        'It repeats the relu activation across all elements',
      ],
      correct: 1,
      explanation: 'W @ x produces a column vector, and b is also a vector. Broadcasting stretches b across the batch dimension if needed, allowing element-wise addition without explicit shape matching.',
    },
    {
      id: 'q5',
      question: 'What does a determinant of zero for a matrix indicate?',
      options: [
        'The matrix has all zero entries',
        'The matrix is singular: it crushes at least one dimension, cannot be inverted, and has no unique solution',
        'The matrix is the identity matrix',
        'The matrix performs a rotation',
      ],
      correct: 1,
      explanation: 'A zero determinant means the transformation collapses space by at least one dimension (e.g., mapping 2D to a line). The matrix has no inverse, and linear systems using it have either no solution or infinitely many.',
    },
  ],
}
