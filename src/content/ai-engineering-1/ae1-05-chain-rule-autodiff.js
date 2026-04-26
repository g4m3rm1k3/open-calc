export default {
  id: 'ae-p1-05-chain-rule-autodiff',
  slug: 'chain-rule-and-autodiff',
  chapter: 'ae-p1',
  order: 4,
  title: 'Chain Rule & Automatic Differentiation',
  subtitle: 'The chain rule is the engine behind every neural network that learns.',
  tags: ['chain-rule', 'autodiff', 'backpropagation', 'computational-graph', 'reverse-mode', 'forward-mode', 'value-class', 'micrograd'],

  hook: {
    question: 'How does PyTorch compute the exact gradient of a loss through a 100-layer network in one backward pass?',
    realWorldContext:
      'You can compute derivatives of simple functions. But a neural network is not a simple function — it is hundreds of functions composed together: matrix multiply, add bias, apply activation, matrix multiply again, softmax, cross-entropy loss. To train the network, you need the gradient of the loss with respect to every single weight. Doing this by hand is impossible for millions of parameters. The chain rule gives you the math. Automatic differentiation gives you the algorithm. Together they compute exact gradients through arbitrary compositions of functions in time proportional to a single forward pass.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'If y = f(g(x)), the chain rule says dy/dx = f\'(g(x)) × g\'(x). Every layer in a neural network is one link in this chain. Backpropagation is the chain rule applied repeatedly from output to input — starting with dy/dy = 1, multiplying the local derivative at each node.',
      'Neural networks have millions of input weights but one scalar loss. Reverse-mode autodiff (backpropagation) computes all gradients in one backward pass by seeding dy/dy = 1 and propagating backward. Forward mode needs one pass per input — millions of passes — so reverse mode is the only practical choice for training.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'PyTorch autograd is the same algorithm, built at scale',
        body: 'Your from-scratch Value class does exactly what PyTorch does: wrap values, record operations in a graph, topological-sort the graph, propagate gradients backward with `+=`. The difference is PyTorch runs this on GPU with BLAS routines.',
      },
      {
        type: 'warning',
        title: 'Use += not = for gradient accumulation',
        body: 'When a value is used in multiple operations (e.g., `x` in both `x*y` and `x+z`), its gradient is the SUM of all contributions. Using `=` instead of `+=` would silently overwrite earlier contributions and produce wrong gradients.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Chain Rule & Automatic Differentiation',
        mathBridge: 'Reverse mode: seed dL/dL = 1. At each node: pass dL/d(output) × d(output)/d(input) to parent nodes. For multiply: d(a*b)/da = b, so parent_a.grad += b * out.grad.',
        caption: 'Build a minimal autograd engine (Value class) then train a neural network on XOR using only your engine.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'The Value class: wrap scalars with gradient tracking',
              prose: [
                '## Three things an autograd engine needs',
                '1. **Value wrapping** — every number stores its value and gradient\n2. **Graph recording** — every operation records its inputs and local gradient function\n3. **Backward pass** — topological sort + walk in reverse, apply chain rule at each node',
              ],
              code: `class Value:
    def __init__(self, data, children=(), op=''):
        self.data = data
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(children)
        self._op = op

    def __repr__(self):
        return f"Value(data={self.data:.4f}, grad={self.grad:.4f})"

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')
        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    def relu(self):
        out = Value(max(0, self.data), (self,), 'relu')
        def _backward():
            self.grad += (1.0 if out.data > 0 else 0.0) * out.grad
        out._backward = _backward
        return out

    def backward(self):
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()

x1 = Value(2.0)
x2 = Value(3.0)
a = x1 * x2          # a = 6.0
b = a + Value(1.0)   # b = 7.0
y = b.relu()          # y = 7.0

y.backward()
print(f"y = {y.data}")
print(f"dy/dx1 = {x1.grad}")   # 3.0 (= x2)
print(f"dy/dx2 = {x2.grad}")   # 2.0 (= x1)`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Complete Value class with all operations',
              prose: [
                '## Additional operations for a real autograd engine',
                '| Operation | Backward rule | Used in |\n|-----------|--------------|--------|\n| sub | Reuses add + neg | Loss (pred - target) |\n| pow | n × x^(n-1) | MSE (error²) |\n| exp | exp(x) × upstream | Softmax |\n| log | (1/x) × upstream | Cross-entropy |\n| tanh | (1 - tanh²) × upstream | Activation |',
              ],
              code: `import math

class Value:
    def __init__(self, data, children=(), op=''):
        self.data = float(data)
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(children)
        self._op = op

    def __repr__(self):
        return f"Value(data={self.data:.4f}, grad={self.grad:.4f})"

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')
        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    def __neg__(self):
        return self * -1

    def __sub__(self, other):
        return self + (-other)

    def __radd__(self, other): return self + other
    def __rmul__(self, other): return self * other
    def __rsub__(self, other): return other + (-self)

    def __pow__(self, n):
        out = Value(self.data ** n, (self,), f'**{n}')
        def _backward():
            self.grad += n * (self.data ** (n - 1)) * out.grad
        out._backward = _backward
        return out

    def __truediv__(self, other):
        return self * (other ** -1) if isinstance(other, Value) else self * (Value(other) ** -1)

    def exp(self):
        e = math.exp(self.data)
        out = Value(e, (self,), 'exp')
        def _backward(): self.grad += e * out.grad
        out._backward = _backward
        return out

    def log(self):
        out = Value(math.log(self.data), (self,), 'log')
        def _backward(): self.grad += (1.0 / self.data) * out.grad
        out._backward = _backward
        return out

    def tanh(self):
        t = math.tanh(self.data)
        out = Value(t, (self,), 'tanh')
        def _backward(): self.grad += (1 - t ** 2) * out.grad
        out._backward = _backward
        return out

    def relu(self):
        out = Value(max(0, self.data), (self,), 'relu')
        def _backward(): self.grad += (1.0 if out.data > 0 else 0.0) * out.grad
        out._backward = _backward
        return out

    def backward(self):
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()

# Verify a complex expression
a = Value(2.0)
b = Value(-3.0)
c = Value(10.0)
f = (a * b + c).relu()   # relu(2*(-3)+10) = relu(4) = 4

f.backward()
print(f"f = relu(a*b + c) = {f.data}")
print(f"df/da = {a.grad}")  # -3.0 (= b)
print(f"df/db = {b.grad}")  #  2.0 (= a)
print(f"df/dc = {c.grad}")  #  1.0`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Mini MLP and XOR training',
              prose: [
                '## Build a neural network with only the Value class',
                'A `Neuron` computes `tanh(w1×x1 + w2×x2 + ... + b)`. A `Layer` is a list of neurons. An `MLP` stacks layers.',
                'Calling `loss.backward()` propagates gradients to every parameter.',
              ],
              code: `import random
random.seed(42)

class Neuron:
    def __init__(self, n_inputs):
        self.w = [Value(random.uniform(-1, 1)) for _ in range(n_inputs)]
        self.b = Value(0.0)
    def __call__(self, x):
        act = sum((wi * xi for wi, xi in zip(self.w, x)), self.b)
        return act.tanh()
    def parameters(self):
        return self.w + [self.b]

class Layer:
    def __init__(self, n_inputs, n_outputs):
        self.neurons = [Neuron(n_inputs) for _ in range(n_outputs)]
    def __call__(self, x):
        return [n(x) for n in self.neurons]
    def parameters(self):
        return [p for n in self.neurons for p in n.parameters()]

class MLP:
    def __init__(self, sizes):
        self.layers = [Layer(sizes[i], sizes[i+1]) for i in range(len(sizes)-1)]
    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x[0] if len(x) == 1 else x
    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]

model = MLP([2, 4, 1])  # 2 inputs, 4 hidden, 1 output

xs = [[0, 0], [0, 1], [1, 0], [1, 1]]
ys = [-1, 1, 1, -1]   # XOR pattern

for step in range(100):
    preds = [model(x) for x in xs]
    loss = sum((p - y) ** 2 for p, y in zip(preds, ys))
    for p in model.parameters():
        p.grad = 0.0
    loss.backward()
    lr = 0.05
    for p in model.parameters():
        p.data -= lr * p.grad
    if step % 20 == 0:
        print(f"step {step:3d}  loss = {loss.data:.4f}")

print("\\nPredictions after training:")
for x, y in zip(xs, ys):
    print(f"  input={x}  target={y:2d}  pred={model(x).data:6.3f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Gradient checking: verify your backward pass',
              prose: [
                '## Compare autodiff gradients against numerical derivatives',
                'Gradient checking is essential when implementing new operations. If your backward pass has a bug, numerical comparison catches it.',
                '## When to use',
                '- Adding a new operation to your autograd ✓\n- Debugging a training loop that won\'t converge ✓\n- Production training — too slow (2× forward passes per parameter) ✗',
              ],
              code: `def gradient_check(build_expr, x_val, h=1e-7):
    """Compare autodiff gradient against numerical finite difference."""
    x = Value(x_val)
    y = build_expr(x)
    y.backward()
    autodiff_grad = x.grad

    y_plus = build_expr(Value(x_val + h)).data
    y_minus = build_expr(Value(x_val - h)).data
    numerical_grad = (y_plus - y_minus) / (2 * h)

    diff = abs(autodiff_grad - numerical_grad)
    return autodiff_grad, numerical_grad, diff

# Test several expressions
expressions = [
    ("x^2", lambda x: x ** 2),
    ("x^3", lambda x: x ** 3),
    ("tanh(x)", lambda x: x.tanh()),
    ("exp(x)", lambda x: x.exp()),
    ("(x^3 + 2x + 1).tanh()", lambda x: (x ** 3 + x * 2 + 1).tanh()),
]

print(f"{'Expression':<25} {'Autodiff':>12} {'Numerical':>12} {'Diff':>12}")
print("-" * 65)
for name, expr in expressions:
    ad, num, diff = gradient_check(expr, 0.5)
    status = "✓" if diff < 1e-5 else "✗"
    print(f"{name:<25} {ad:12.8f} {num:12.8f} {diff:12.2e} {status}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Add sigmoid to Value class',
              difficulty: 'easy',
              prompt: 'Add `sigmoid(self)` to the Value class. sigmoid(x) = 1 / (1 + exp(-x)). Its derivative is sigmoid(x) × (1 - sigmoid(x)). Verify that sigmoid\'(0) = 0.25 and sigmoid\'(2) ≈ 0.1050.',
              code: `import math

class Value:
    def __init__(self, data, children=(), op=''):
        self.data = float(data)
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(children)
        self._op = op

    def __repr__(self):
        return f"Value(data={self.data:.4f}, grad={self.grad:.4f})"

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')
        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __radd__(self, other): return self + other
    def __rmul__(self, other): return self * other

    def backward(self):
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()

    def sigmoid(self):
        """Add sigmoid: 1/(1+exp(-x)), derivative: s*(1-s)"""
        pass

# Test
x0 = Value(0.0)
y0 = x0.sigmoid()
y0.backward()
print(f"sigmoid(0) = {y0.data:.6f}")  # 0.5
print(f"sigmoid'(0) = {x0.grad:.6f}")  # 0.25

x2 = Value(2.0)
y2 = x2.sigmoid()
y2.backward()
print(f"sigmoid(2) = {y2.data:.6f}")   # ~0.8808
print(f"sigmoid'(2) = {x2.grad:.6f}")  # ~0.1050
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'Value' not in dir() or not hasattr(Value(0.0), 'sigmoid'):
    res = "ERROR: Value class or sigmoid method not defined."
else:
    x0 = Value(0.0)
    y0 = x0.sigmoid()
    y0.backward()
    if abs(y0.data - 0.5) > 0.001:
        res = f"ERROR: sigmoid(0) should be 0.5, got {y0.data}"
    elif abs(x0.grad - 0.25) > 0.001:
        res = f"ERROR: sigmoid'(0) should be 0.25, got {x0.grad}"
    else:
        x2 = Value(2.0)
        y2 = x2.sigmoid()
        y2.backward()
        if abs(x2.grad - 0.1050) > 0.002:
            res = f"ERROR: sigmoid'(2) should be ~0.1050, got {x2.grad}"
        else:
            res = "SUCCESS: sigmoid correctly computes forward and backward pass."
res
`,
              hint: 's = 1 / (1 + exp(-self.data)). out = Value(s, (self,), "sigmoid"). In _backward: self.grad += s * (1 - s) * out.grad.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Computation graph tracer',
              difficulty: 'medium',
              prompt: 'Write `trace_graph(root)` that takes a Value and returns a dict with `"nodes"` (list of all Value objects in topological order), `"ops"` (list of operation names for each node, "input" for leaf nodes), and `"n_params"` (count of leaf nodes with grad tracking, i.e., nodes with no children). This is useful for debugging autograd graphs.',
              code: `def trace_graph(root):
    """
    Trace the computation graph starting from root.
    Returns: {nodes: [Value, ...], ops: [str, ...], n_params: int}
    """
    pass

# Build a computation graph
import math

class Value:
    def __init__(self, data, children=(), op=''):
        self.data = float(data)
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(children)
        self._op = op
    def __repr__(self):
        return f"Value(data={self.data:.3f}, op='{self._op}')"
    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')
        def _backward():
            self.grad += out.grad; other.grad += out.grad
        out._backward = _backward
        return out
    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')
        def _backward():
            self.grad += other.data * out.grad; other.grad += self.data * out.grad
        out._backward = _backward
        return out
    def __radd__(self, other): return self + other
    def __rmul__(self, other): return self * other

x = Value(2.0)    # leaf
w1 = Value(3.0)   # leaf (weight)
w2 = Value(-1.0)  # leaf (weight)
b = Value(0.5)    # leaf (bias)

h = w1 * x + w2 * x + b   # linear: w1*x + w2*x + b

graph = trace_graph(h)
print(f"Total nodes: {len(graph['nodes'])}")
print(f"Leaf nodes (inputs/params): {graph['n_params']}")
print(f"Operations: {graph['ops']}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'trace_graph' not in dir():
    res = "ERROR: trace_graph not defined."
else:
    class Value:
        def __init__(self, data, children=(), op=''):
            self.data = float(data)
            self.grad = 0.0
            self._backward = lambda: None
            self._prev = set(children)
            self._op = op
        def __add__(self, other):
            other = other if isinstance(other, Value) else Value(other)
            out = Value(self.data + other.data, (self, other), '+')
            def _backward(): self.grad += out.grad; other.grad += out.grad
            out._backward = _backward
            return out
        def __mul__(self, other):
            other = other if isinstance(other, Value) else Value(other)
            out = Value(self.data * other.data, (self, other), '*')
            def _backward(): self.grad += other.data * out.grad; other.grad += self.data * out.grad
            out._backward = _backward
            return out
        def __radd__(self, other): return self + other
        def __rmul__(self, other): return self * other
    x = Value(2.0); w = Value(3.0); b = Value(1.0)
    y = w * x + b
    g = trace_graph(y)
    if 'nodes' not in g or 'ops' not in g or 'n_params' not in g:
        res = f"ERROR: trace_graph must return dict with nodes, ops, n_params keys, got {list(g.keys())}"
    elif g.get('n_params') != 3:
        res = f"ERROR: x, w, b are 3 leaf nodes, got n_params={g.get('n_params')}"
    elif len(g['nodes']) < 3:
        res = f"ERROR: should have at least 3 nodes (x, w, b), got {len(g['nodes'])}"
    else:
        res = "SUCCESS: trace_graph correctly counts nodes, operations, and leaf parameters."
res
`,
              hint: 'Use topological sort (same as backward()). A leaf node has len(v._prev) == 0. ops = [v._op if v._op else "input" for v in topo]. n_params = sum(1 for v in topo if not v._prev).',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What does the chain rule in calculus state?',
      options: [
        'The derivative of a sum is the sum of derivatives',
        'The derivative of composed functions is the product of their individual derivatives',
        'The integral of a product is the product of integrals',
        'Functions can only be differentiated if they are linear',
      ],
      correct: 1,
      explanation: "For y = f(g(x)), the chain rule says dy/dx = f'(g(x)) * g'(x). You multiply the derivatives at each link in the chain. This is the mathematical basis of backpropagation.",
    },
    {
      id: 'q2',
      question: 'What is a computational graph?',
      options: [
        'A plot of loss vs training steps',
        'A directed graph where nodes are operations and edges carry values forward or gradients backward',
        'A diagram showing the architecture of a neural network',
        'A graph database used for storing training data',
      ],
      correct: 1,
      explanation: 'A computational graph represents the sequence of operations in a computation. Data flows forward through the graph, and gradients flow backward during backpropagation.',
    },
    {
      id: 'q3',
      question: 'Why does PyTorch use reverse-mode autodiff (backpropagation) instead of forward-mode?',
      options: [
        'Reverse mode is more numerically accurate',
        'Reverse mode computes all gradients in one backward pass, while forward mode needs one pass per input variable — neural networks have millions of inputs but one loss output',
        'Reverse mode uses less memory',
        'Forward mode cannot handle non-linear functions',
      ],
      correct: 1,
      explanation: 'Neural networks have millions of weight inputs but produce a single scalar loss. Reverse mode needs one backward pass total. Forward mode would need one pass per weight — millions of passes — making it impractical.',
    },
    {
      id: 'q4',
      question: "In the Value class autograd engine, why does the backward function use '+=' instead of '=' for accumulating gradients?",
      options: [
        'To average the gradients across multiple samples',
        'Because a value used in multiple operations receives gradient contributions from each one, which must be summed',
        'To prevent numerical overflow in the gradients',
        "Because Python does not support the '=' operator in closures",
      ],
      correct: 1,
      explanation: "When a value feeds into multiple operations (e.g., x used in both x*y and x+z), its total gradient is the sum of all incoming gradient contributions. Using '=' would overwrite earlier contributions.",
    },
    {
      id: 'q5',
      question: 'What is gradient checking and when should you use it?',
      options: [
        'Checking that gradients are below a threshold to prevent exploding gradients',
        'Comparing autodiff gradients against numerical finite-difference gradients to verify correctness of the backward pass',
        'Checking that all parameters received non-zero gradients during training',
        'Monitoring gradient magnitudes during training to detect vanishing gradients',
      ],
      correct: 1,
      explanation: 'Gradient checking computes numerical derivatives via (f(x+h) - f(x-h)) / 2h and compares them to autodiff gradients. Use it when adding new operations to your autograd engine or debugging training failures.',
    },
  ],
}
