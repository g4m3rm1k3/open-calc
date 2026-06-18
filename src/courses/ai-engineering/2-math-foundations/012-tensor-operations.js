export default {
  id: 'ae-p1-12-tensor-operations',
  slug: 'tensor-operations',
  chapter: 'ae-p1',
  order: 11,
  title: 'Tensor Operations',
  subtitle: 'Neural networks are just a chain of tensor manipulations. Master the shapes.',
  tags: ['tensors', 'reshape', 'broadcasting', 'einsum', 'attention', 'strides', 'memory-layout', 'PyTorch', 'numpy'],

  hook: {
    question: 'Why does a tiny shape mistake crash your entire training run?',
    realWorldContext:
      'Every bug in a neural network is a shape bug. The attention mechanism in transformers requires reshaping a (B, T, D) tensor into (B, H, T, D_head), transposing, computing scaled dot-product attention across the head dimension, and merging back. Getting one axis wrong produces silent wrong answers or an error you\'ll debug for hours. Understanding tensors — their shape, strides, memory layout, and how operations like reshape, transpose, and einsum work — is the difference between copying code and actually understanding it.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A tensor is a multi-dimensional array. Rank (number of dimensions) determines what it represents: rank-0 = scalar, rank-1 = vector, rank-2 = matrix, rank-3+ = tensor. In AI, almost everything is a batch: images are (B, C, H, W) meaning batch × channels × height × width. Text tokens are (B, T, D) meaning batch × sequence_length × embedding_dim. Attention scores are (B, H, T, T) meaning batch × heads × target_seq × source_seq.',
      'Reshape, transpose, and permute do not move data in memory — they change the strides (how many elements to skip per step in each dimension). A transpose swaps two strides. Reshape changes the shape but keeps data contiguous. This is why these operations are "free" — no computation, just a different view of the same memory. Broadcasting eliminates the need to explicitly copy data when operating on tensors with compatible but different shapes.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Strides are how tensors interpret flat memory',
        body: 'A (3, 4) array in C order (row-major) has strides (4, 1): advancing one row = skip 4 elements, advancing one column = skip 1 element. Transpose gives strides (1, 4). Reshape to (2, 6) gives strides (6, 1). The underlying flat array never moves — only the strides change. This is why view/reshape is O(1) but requires the tensor to be contiguous; otherwise you need .contiguous() first.',
      },
      {
        type: 'insight',
        title: 'Einsum unifies all tensor contractions in one notation',
        body: '"ij,jk->ik" is matrix multiply. "i,i->" is dot product. "bte,ek->btk" is batched linear layer. "bhts,bhsd->bhtd" is multi-head attention output aggregation. Learning einsum notation means you can read and write any tensor operation in a single line, without memorizing dozens of special functions.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Tensor Operations',
        mathBridge: 'shape → strides. reshape: new shape, same data. transpose: swap strides. broadcast: expand dimensions of size 1. einsum("subscripts", A, B) = generalized contraction.',
        caption: 'Master shapes, strides, broadcasting, and einsum — the building blocks of every neural network.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Shapes and strides',
              prose: [
                '## Tensor Rank and Shape',
                '```\nscalar:   shape = ()        rank = 0\nvector:   shape = (5,)      rank = 1\nmatrix:   shape = (3, 4)    rank = 2\n3D:       shape = (2,3,4)   rank = 3\n```',
                '## Strides: How Memory Maps to Shape',
                'For shape (3, 4) in row-major order: strides = (4, 1)',
                '- Moving one row forward: skip 4 elements',
                '- Moving one column forward: skip 1 element',
                '`element[i,j] = base + i*stride[0] + j*stride[1]`',
                '**Transpose just swaps strides — no data movement.**',
              ],
              code: `import numpy as np

# Create a (3, 4) matrix
a = np.arange(12, dtype=float).reshape(3, 4)
print(f"a.shape:   {a.shape}")
print(f"a.strides: {a.strides}  (bytes: 4 elements × 8 bytes = 32, 1 × 8 = 8)")
print(f"a.flags['C_CONTIGUOUS']: {a.flags['C_CONTIGUOUS']}  (row-major)")
print(f"a:\\n{a}")

# Transpose: just swaps strides, no copy
at = a.T
print(f"\\na.T.shape:   {at.shape}")
print(f"a.T.strides: {at.strides}  (swapped!)")
print(f"a.T.flags['C_CONTIGUOUS']: {at.flags['C_CONTIGUOUS']}  (now column-major)")

# Reshape: changes shape but not data
b = a.reshape(2, 6)
print(f"\\na.reshape(2,6).shape:   {b.shape}")
print(f"a.reshape(2,6).strides: {b.strides}")

# Squeeze and unsqueeze
v = np.array([1, 2, 3, 4])
print(f"\\nv.shape: {v.shape}")
print(f"v[np.newaxis,:].shape:  {v[np.newaxis,:].shape}  (add axis at front)")
print(f"v[:,np.newaxis].shape:  {v[:,np.newaxis].shape}  (add axis at back)")

# Common AI shapes
print("\\nCommon AI tensor shapes:")
shapes = {"scalar": (), "token_id": (512,), "batch_tokens": (16,512),
          "embeddings": (16,512,768), "image_batch": (32,3,224,224)}
for name, shape in shapes.items():
    elements = 1
    for s in shape: elements *= s
    print(f"  {name:<16} shape={str(shape):<24} elements={elements:>12,}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Reshape, transpose, and broadcasting',
              prose: [
                '## Reshape vs Transpose',
                'Reshape reinterprets the flat layout (row-major order). Transpose swaps axes.',
                '```python\na = [[1,2,3],[4,5,6]]   # shape (2,3)\na.reshape(3,2)  → [[1,2],[3,4],[5,6]]  # row-major reorder\na.T             → [[1,4],[2,5],[3,6]]  # swap axes\n```',
                '## Broadcasting Rules',
                'Two shapes are broadcast-compatible if for each dimension pair, they are equal OR one of them is 1. The size-1 dimension is virtually repeated to match the other.',
                '```\n(3,4) + (4,)   → (4,) treated as (1,4) → (3,4)  ✓\n(3,1) + (1,4)  → (3,4)  ✓\n(3,4) + (3,)   → ERROR: last dims 4 vs 3 mismatch\n```',
              ],
              code: `import numpy as np

# Reshape vs Transpose distinction
a = np.arange(6).reshape(2, 3)
print("Original (2,3):")
print(a)
print(f"reshape(3,2):\\n{a.reshape(3,2)}")
print(f"transpose:\\n{a.T}")
print("(Same data, different interpretations)")

# Broadcasting: add bias to batch of vectors
batch = np.random.randn(4, 3)  # 4 samples, 3 features
bias = np.array([0.1, 0.2, 0.3])  # broadcast from (3,) to (4,3)
result = batch + bias
print(f"\\nbatch {batch.shape} + bias {bias.shape} = {result.shape}  (bias applied to each row)")

# Channel-wise scaling: (B,C,H,W) × (C,)
images = np.random.randn(2, 3, 4, 4)  # 2 images, 3 channels, 4×4
scale = np.array([0.5, 1.0, 1.5])
scale_4d = scale.reshape(1, 3, 1, 1)  # make broadcastable with (B,C,H,W)
scaled = images * scale_4d
print(f"images {images.shape} * scale {scale_4d.shape} = {scaled.shape}")

# Pairwise distances via broadcasting
points_a = np.random.randn(5, 2)
points_b = np.random.randn(3, 2)
# diff[i,j] = points_a[i] - points_b[j]
diff = points_a[:, np.newaxis, :] - points_b[np.newaxis, :, :]  # (5,1,2) - (1,3,2) = (5,3,2)
distances = np.sqrt(np.sum(diff**2, axis=-1))  # (5,3)
print(f"\\nPairwise distances: {points_a.shape} vs {points_b.shape} -> {distances.shape}")

# What does np.newaxis do?
v = np.array([1, 2, 3])
print(f"\\nv shape: {v.shape}")
print(f"v[:, np.newaxis] shape: {v[:,np.newaxis].shape}  (column vector)")
print(f"outer = v[:, np.newaxis] * v[np.newaxis, :]:")
print(np.outer(v, v))`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Einsum: one notation for all tensor operations',
              prose: [
                '## Einstein Summation Notation',
                '`np.einsum("subscripts", A, B)` — each letter labels an axis. Letters in both inputs are summed over (contracted). Letters in output are kept.',
                '```\n"i,i->"        dot product             a·b\n"i,j->ij"      outer product           np.outer(a,b)\n"ij,jk->ik"    matrix multiply         A @ B\n"ij->ji"       transpose               A.T\n"ii->"         trace                   np.trace(A)\n"bij,bjk->bik" batched matmul          np.matmul(A, B)\n"bte,ed->btd"  linear layer on batch   X @ W.T\n```',
              ],
              code: `import numpy as np

np.random.seed(42)

# Basic operations via einsum
a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 5.0, 6.0])
A = np.arange(6, dtype=float).reshape(3, 2)
B = np.arange(8, dtype=float).reshape(2, 4)

print("Einsum operations:")
print(f"  dot product 'i,i->':        {np.einsum('i,i->', a, b):.0f}  (= {np.dot(a,b):.0f})")
print(f"  outer product 'i,j->ij':    shape {np.einsum('i,j->ij', a, b).shape}")
print(f"  matrix multiply 'ij,jk->ik': shape {np.einsum('ij,jk->ik', A, B).shape}  (= A@B)")
M = np.random.randn(4, 4)
print(f"  trace 'ii->':               {np.einsum('ii->', M):.4f}  (= {np.trace(M):.4f})")
print(f"  row sums 'ij->i':           {np.einsum('ij->i', A.reshape(2,3))}")

# Batched matrix multiply
batch_A = np.random.randn(4, 3, 5)
batch_B = np.random.randn(4, 5, 2)
result_e = np.einsum("bij,bjk->bik", batch_A, batch_B)
result_m = np.matmul(batch_A, batch_B)
print(f"\\nBatch matmul 'bij,bjk->bik': shape {result_e.shape}  match={np.allclose(result_e, result_m)}")

# Linear layer on a batch of sequences
B_size, T, D_in, D_out = 2, 5, 8, 6
X = np.random.randn(B_size, T, D_in)     # (B, T, D_in)
W = np.random.randn(D_in, D_out)          # (D_in, D_out) — weight matrix
out_e = np.einsum("bte,eo->bto", X, W)   # batched linear layer
out_m = X @ W                              # same thing
print(f"\\nLinear layer 'bte,eo->bto': {X.shape} × {W.shape} = {out_e.shape}  match={np.allclose(out_e, out_m)}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Multi-head attention tensor shapes',
              prose: [
                '## The Multi-Head Attention Shape Journey',
                '```\nInput:     (B, T, D)          batch × seq_len × embed\nQ, K, V:   (B, T, D)          linear projection\nSplit:     (B, T, H, D_h) → (B, H, T, D_h)  split into H heads\nScores:    (B, H, T, T)       Q·Kᵀ / sqrt(D_h)\nWeights:   (B, H, T, T)       softmax over last dim\nOutput:    (B, H, T, D_h) → (B, T, D)        merge heads\n```',
                'Every single one of these shapes must be exact or you get wrong answers.',
              ],
              code: `import numpy as np

np.random.seed(42)

# Transformer multi-head attention shapes
B = 2       # batch size
T = 8       # sequence length
D = 64      # embedding dim
H = 4       # number of heads
D_h = D // H  # head dim = 16

print(f"B={B}, T={T}, D={D}, H={H}, D_h={D_h}")
print()

# Input sequence
X = np.random.randn(B, T, D)
print(f"Input X:        {X.shape}  (batch, seq_len, embed_dim)")

# Project to Q, K, V using weight matrices
W_q = np.random.randn(D, D) * 0.02
W_k = np.random.randn(D, D) * 0.02
W_v = np.random.randn(D, D) * 0.02

Q = np.einsum("bte,ed->btd", X, W_q)  # (B, T, D)
K = np.einsum("bte,ed->btd", X, W_k)  # (B, T, D)
V = np.einsum("bte,ed->btd", X, W_v)  # (B, T, D)
print(f"Q, K, V:        {Q.shape}  (after linear projection)")

# Split into H heads: (B, T, D) -> (B, T, H, D_h) -> (B, H, T, D_h)
Q = Q.reshape(B, T, H, D_h).transpose(0, 2, 1, 3)
K = K.reshape(B, T, H, D_h).transpose(0, 2, 1, 3)
V = V.reshape(B, T, H, D_h).transpose(0, 2, 1, 3)
print(f"After split:    {Q.shape}  (batch, heads, seq_len, head_dim)")

# Scaled dot-product attention: Q·Kᵀ / sqrt(D_h)
scores = np.einsum("bhtd,bhsd->bhts", Q, K) / np.sqrt(D_h)
print(f"Attn scores:    {scores.shape}  (batch, heads, tgt, src)")

# Softmax over source dimension
exp_scores = np.exp(scores - scores.max(axis=-1, keepdims=True))
weights = exp_scores / exp_scores.sum(axis=-1, keepdims=True)
print(f"Attn weights:   {weights.shape}  (sum to 1 over src)")
print(f"  row sums check: {weights[0,0,0].sum():.6f}  (should be 1.0)")

# Apply attention weights to V
attn_out = np.einsum("bhts,bhsd->bhtd", weights, V)
print(f"Attn output:    {attn_out.shape}  (batch, heads, seq_len, head_dim)")

# Merge heads back: (B, H, T, D_h) -> (B, T, H, D_h) -> (B, T, D)
output = attn_out.transpose(0, 2, 1, 3).reshape(B, T, D)
print(f"Merged output:  {output.shape}  (batch, seq_len, embed_dim)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Implement einsum operations from scratch',
              difficulty: 'easy',
              prompt: 'Without using np.einsum, implement three operations: `dot_product(a, b)` (inner product of two 1D arrays), `outer_product(a, b)` (returns 2D array), and `batch_matmul(A, B)` where A is (B,m,k) and B is (B,k,n), returning (B,m,n). Verify each matches np.einsum.',
              code: `import numpy as np

np.random.seed(42)

def dot_product(a, b):
    """Inner product of two 1D arrays. Same as np.einsum('i,i->', a, b)."""
    pass

def outer_product(a, b):
    """Returns 2D array outer[i,j] = a[i]*b[j]. Same as np.einsum('i,j->ij', a, b)."""
    pass

def batch_matmul(A, B):
    """Batched matrix multiply. A: (B,m,k), B: (B,k,n) -> (B,m,n).
    Same as np.einsum('bij,bjk->bik', A, B)."""
    pass

# Test vectors
a = np.array([1.0, 2.0, 3.0])
b = np.array([4.0, 5.0, 6.0])

dp = dot_product(a, b)
print(f"dot_product: {dp}  (expected: {np.einsum('i,i->', a, b):.0f})")

op = outer_product(a, b)
print(f"outer_product shape: {op.shape}  match: {np.allclose(op, np.einsum('i,j->ij', a, b))}")
print(op)

# Test batch matmul
batch_A = np.random.randn(3, 4, 5)
batch_B = np.random.randn(3, 5, 2)
result = batch_matmul(batch_A, batch_B)
expected = np.einsum("bij,bjk->bik", batch_A, batch_B)
print(f"\\nbatch_matmul shape: {result.shape}  match: {np.allclose(result, expected)}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
np.random.seed(42)
if 'dot_product' not in dir() or 'outer_product' not in dir() or 'batch_matmul' not in dir():
    res = "ERROR: one or more functions not defined."
else:
    a = np.array([1.0, 2.0, 3.0])
    b = np.array([4.0, 5.0, 6.0])

    dp = dot_product(a, b)
    if abs(dp - 32.0) > 0.001:
        res = f"ERROR: dot_product([1,2,3],[4,5,6]) should be 32, got {dp}"
    else:
        op = outer_product(a, b)
        if op.shape != (3, 3):
            res = f"ERROR: outer_product should return (3,3) array, got {op.shape}"
        elif not np.allclose(op, np.outer(a, b)):
            res = f"ERROR: outer_product values wrong"
        else:
            batch_A = np.random.randn(3, 4, 5)
            batch_B = np.random.randn(3, 5, 2)
            result = batch_matmul(batch_A, batch_B)
            expected = np.einsum("bij,bjk->bik", batch_A, batch_B)
            if result.shape != (3, 4, 2):
                res = f"ERROR: batch_matmul shape should be (3,4,2), got {result.shape}"
            elif not np.allclose(result, expected):
                res = "ERROR: batch_matmul values incorrect"
            else:
                res = "SUCCESS: all three tensor operations are correct."
res
`,
              hint: 'dot_product: return sum(ai*bi for ai,bi in zip(a,b)). outer_product: return np.array([[ai*bj for bj in b] for ai in a]). batch_matmul: result = np.zeros((A.shape[0],A.shape[1],B.shape[2])). For b in range(len(A)): result[b] = A[b] @ B[b].',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Reshape for multi-head attention',
              difficulty: 'medium',
              prompt: 'Implement `split_heads(X, H)` that takes X of shape (B, T, D) and returns shape (B, H, T, D//H) by reshaping and transposing. Implement `merge_heads(X)` that takes (B, H, T, D_h) and returns (B, T, H*D_h). These are the two key shape transforms in multi-head attention.',
              code: `import numpy as np

def split_heads(X, H):
    """
    X: (B, T, D)
    Returns: (B, H, T, D_h) where D_h = D // H
    Steps: reshape to (B, T, H, D_h), then transpose to (B, H, T, D_h)
    """
    pass

def merge_heads(X):
    """
    X: (B, H, T, D_h)
    Returns: (B, T, H*D_h)
    Steps: transpose to (B, T, H, D_h), then reshape to (B, T, D)
    """
    pass

# Test with typical transformer dimensions
B, T, D, H = 2, 10, 64, 8
D_h = D // H
X = np.random.randn(B, T, D)

split = split_heads(X, H)
print(f"split_heads({X.shape}, H={H}) -> {split.shape}")
print(f"Expected: ({B}, {H}, {T}, {D_h})")

merged = merge_heads(split)
print(f"merge_heads({split.shape}) -> {merged.shape}")
print(f"Expected: ({B}, {T}, {D})")

# Round-trip should recover original
print(f"Round-trip matches: {np.allclose(X, merged)}")

# Verify split is correct: token 0, head 0 should be first D_h features
print(f"\\nToken 0 first {D_h} features: {X[0,0,:D_h].round(4)}")
print(f"Head 0 of token 0:            {split[0,0,0,:].round(4)}")
print(f"Match: {np.allclose(X[0,0,:D_h], split[0,0,0,:])}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
np.random.seed(42)
if 'split_heads' not in dir() or 'merge_heads' not in dir():
    res = "ERROR: split_heads or merge_heads not defined."
else:
    B, T, D, H = 2, 8, 64, 4
    D_h = D // H
    X = np.random.randn(B, T, D)

    split = split_heads(X, H)
    if split.shape != (B, H, T, D_h):
        res = f"ERROR: split_heads should return ({B},{H},{T},{D_h}), got {split.shape}"
    else:
        merged = merge_heads(split)
        if merged.shape != (B, T, D):
            res = f"ERROR: merge_heads should return ({B},{T},{D}), got {merged.shape}"
        elif not np.allclose(X, merged):
            res = "ERROR: merge_heads(split_heads(X)) should return original X"
        else:
            # Verify split correctness: head h should contain features [h*D_h : (h+1)*D_h]
            for h in range(H):
                expected_head_data = X[:, :, h*D_h:(h+1)*D_h]
                if not np.allclose(split[:, h, :, :], expected_head_data):
                    res = f"ERROR: head {h} should contain features [{h*D_h}:{(h+1)*D_h}]"
                    break
            else:
                res = f"SUCCESS: split_heads and merge_heads work. ({B},{T},{D}) ↔ ({B},{H},{T},{D_h})"
res
`,
              hint: 'split_heads: B,T,D = X.shape. D_h = D//H. X reshaped to (B,T,H,D_h), then transpose(0,2,1,3) gives (B,H,T,D_h). merge_heads: B,H,T,D_h = X.shape. Transpose(0,2,1,3) gives (B,T,H,D_h). Reshape(-1,T,H*D_h) or reshape(B,T,H*D_h) gives (B,T,D).',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What does np.transpose do to the strides of an array?',
      options: [
        'It copies the data to a new contiguous layout',
        'It swaps the stride values, creating a view of the same data with no copying',
        'It multiplies each stride by the corresponding axis size',
        'It converts the array from row-major to column-major order by moving data',
      ],
      correct: 1,
      explanation: 'Transpose only reorders the stride tuple — no data is moved. A (3,4) array with strides (4,1) becomes a (4,3) array with strides (1,4). Both point to the same flat memory. This is why transpose is O(1) but the result is non-contiguous.',
    },
    {
      id: 'q2',
      question: 'Two shapes (3, 1, 4) and (1, 5, 4) are broadcast together. What is the result shape?',
      options: [
        'Cannot be broadcast — dimensions do not match',
        '(3, 5, 4)',
        '(3, 5, 8)',
        '(1, 1, 4)',
      ],
      correct: 1,
      explanation: 'Broadcasting aligns from the right. Dim 0: 3 vs 1 → 3. Dim 1: 1 vs 5 → 5. Dim 2: 4 vs 4 → 4. Result: (3, 5, 4). A size-1 dimension is "stretched" to match the other.',
    },
    {
      id: 'q3',
      question: 'What does np.einsum("bte,ed->btd", X, W) compute?',
      options: [
        'The transpose of X multiplied by W',
        'For each batch b and position t, compute the dot product of X[b,t,:] with each column of W',
        'The outer product of X and W',
        'The trace of the product X @ W',
      ],
      correct: 1,
      explanation: '"bte,ed->btd": axes b and t pass through, axis e is contracted. For each (b,t,d): output[b,t,d] = Σ_e X[b,t,e] * W[e,d]. This is exactly X @ W applied to each (b,t) position — a batched linear layer.',
    },
    {
      id: 'q4',
      question: 'In multi-head attention, why is the input reshaped from (B, T, D) to (B, H, T, D_h)?',
      options: [
        'To reduce memory usage by compressing the embedding',
        'To split the embedding into H independent subspaces, each of which learns different attention patterns',
        'To apply H different softmax operations to the same embeddings',
        'Because attention scores must be square matrices',
      ],
      correct: 1,
      explanation: 'Each head operates on a D_h = D/H dimensional slice of the embedding. Different heads can learn to attend to different aspects (syntax, semantics, position). The split allows H parallel attention computations that are later merged back.',
    },
    {
      id: 'q5',
      question: 'A (2, 3, 4) tensor has strides (12, 4, 1) in row-major order. What is the strides of its transpose (axes 0 and 2 swapped)?',
      options: [
        '(4, 4, 12)',
        '(1, 4, 12)',
        '(12, 1, 4)',
        '(1, 12, 4)',
      ],
      correct: 1,
      explanation: 'Transposing axes 0 and 2 swaps the corresponding strides: (12, 4, 1) → (1, 4, 12). Shape also changes from (2,3,4) to (4,3,2). Element [i,j,k] now accesses base + 1*i + 4*j + 12*k, which was element [k,j,i] in the original.',
    },
  ],
}
