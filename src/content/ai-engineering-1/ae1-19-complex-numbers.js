export default {
  id: 'ae-p1-19-complex-numbers',
  slug: 'complex-numbers',
  chapter: 'ae-p1',
  order: 18,
  title: 'Complex Numbers for AI',
  subtitle: 'The square root of −1 is not imaginary. It is the key to rotations, frequencies, and half of signal processing.',
  tags: ['complex-numbers', 'Euler-formula', 'rotations', 'RoPE', 'positional-encodings', 'DFT', 'phasors'],

  hook: {
    question: 'Transformer positional encodings use sin and cos at different frequencies — why? And why does RoPE encode position as a rotation angle instead of an additive vector?',
    realWorldContext:
      'Every time something spins, vibrates, or oscillates, complex numbers are the right tool. Without them, you cannot understand the Discrete Fourier Transform, FFT, or why RoPE (Rotary Position Embedding) works in modern LLMs. Complex numbers seem abstract — a number system built on √(−1) — but they are the natural language of rotations. Multiplying by a complex number of magnitude 1 IS a rotation. This lesson connects that fact to where it appears throughout AI.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A complex number z = a + bi has a real part a and an imaginary part b. The imaginary unit i is defined by i² = −1. That is the entire definition — you extend the real number line into a 2D plane. Every complex number is a point in this plane: a + bi corresponds to the point (a, b). Complex arithmetic: addition adds parts separately, (a+bi)+(c+di) = (a+c)+(b+d)i. Multiplication uses distributive law with i² = −1: (a+bi)(c+di) = (ac−bd) + (ad+bc)i. Conjugate flips the imaginary sign: conj(a+bi) = a−bi. Key fact: z·conj(z) = a² + b² (always real, always positive). Division: multiply numerator and denominator by the conjugate of the denominator to clear the imaginary part.',
      'Polar form: any complex number can be written as z = r·(cos θ + i·sin θ) where r = |z| = √(a²+b²) is the magnitude and θ = atan2(b, a) is the phase angle. Polar form is multiplication-friendly: if z₁ = r₁·e^(iθ₁) and z₂ = r₂·e^(iθ₂) then z₁·z₂ = (r₁r₂)·e^(i(θ₁+θ₂)). Multiply magnitudes, ADD angles. This is why complex numbers are perfect for rotations: multiplying by a complex number with magnitude 1 is a PURE rotation. No scaling, just rotation by angle θ.',
      'Euler\'s formula: e^(iθ) = cos θ + i·sin θ. This is the most important formula in this lesson. At θ = π: e^(iπ) = −1, giving the famous Euler identity e^(iπ) + 1 = 0. As θ varies, e^(iθ) traces the unit circle. Complex exponentials ARE rotations. A rotating complex exponential e^(iωt) has real part cos(ωt) and imaginary part sin(ωt). A sinusoidal signal is the projection (shadow) of a rotating complex number onto the real axis. This is the phasor representation: instead of tracking a wiggly sine wave, track a smoothly rotating arrow. Phase shifts become angle offsets. Amplitude changes become magnitude changes.',
      'N-th roots of unity: the N equally-spaced points on the unit circle w_k = e^(2πik/N) for k = 0,1,...,N−1. Their sum is zero (symmetry: the vectors cancel). These are the foundation of the Discrete Fourier Transform. The DFT computes the correlation between a signal and each of these N rotating phasors: X[k] = Σ x[n]·e^(−2πikn/N). If the signal has energy at frequency k, the correlation is large. If not, it is near zero. The DFT is a change of basis from the time domain to the frequency domain.',
      'Complex numbers in ML. (1) RoPE (Rotary Position Embedding): to encode position m for a token, multiply the query/key vector by a complex rotation e^(imθ). The relative position between tokens at positions m and n becomes a rotation by (m−n)θ. Attention naturally becomes sensitive to relative position through complex multiplication — no additive positional vector needed. (2) Sinusoidal positional encodings (original Transformer): PE(pos, 2i) = sin(pos/10000^(2i/d)), PE(pos, 2i+1) = cos(pos/10000^(2i/d)). These are the real and imaginary parts of e^(i·pos/10000^(2i/d)). The geometric frequency spacing gives each position a unique fingerprint at multiple resolutions. (3) FFT: O(N log N) algorithm for the DFT, enabled by the symmetry of the roots of unity (see ae1-20).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Complex multiplication IS 2D rotation',
        body: 'Multiply the vector (x + yi) by (cos θ + i·sin θ):\n(x + yi)(cos θ + i·sin θ) = (x·cos θ − y·sin θ) + (x·sin θ + y·cos θ)i\n\nThis is identical to the 2D rotation matrix:\n[[cos θ, −sin θ], [sin θ, cos θ]] · [x, y]\n\nComplex multiplication with a unit-magnitude number IS the rotation matrix, written in complex notation. RoPE exploits this to rotate token embeddings by position-dependent angles.',
      },
      {
        type: 'insight',
        title: 'Why the N-th roots of unity sum to zero',
        body: 'The N roots of unity are N equally spaced points on the unit circle. By symmetry, their vector sum must be zero — no direction is preferred. Formally: Σ e^(2πik/N) = (1 − e^(2πi))/(1 − e^(2πi/N)) = 0 (geometric series).\n\nThis cancellation property is what makes the DFT invertible and orthogonal. Each basis vector e^(2πikn/N) is orthogonal to all others because their inner product involves summing the roots of unity — which is 0 unless k = k\'.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Complex Numbers for AI',
        mathBridge: 'Euler: e^(iθ) = cos(θ) + i·sin(θ). Complex multiply = rotation + scaling. RoPE: rotate position embeddings by m·θ in each 2D subspace.',
        caption: 'Build Complex from scratch, verify rotation via multiplication, and implement 2D RoPE positional encodings.',
        props: {
          initialCells: [
          {
            id: 1,
            prose: [
              'Build complex arithmetic from scratch using a Python class. This makes the operations explicit — you can see exactly how addition, multiplication, and the conjugate work.',
              'Complex multiplication: expand (a+bi)(c+di) using FOIL. The i² = −1 term flips the sign: you get (ac−bd) + (ad+bc)i.',
              'Key verification: z × conj(z) = |z|² = a² + b². The imaginary parts cancel out. This is why division works: multiply top and bottom by the conjugate of the denominator.',
            ],
            code: `import math

class Complex:
    def __init__(self, real, imag=0.0):
        self.real = real
        self.imag = imag

    def __add__(self, other):
        return Complex(self.real + other.real, self.imag + other.imag)

    def __mul__(self, other):
        # (a+bi)(c+di) = (ac-bd) + (ad+bc)i
        r = self.real * other.real - self.imag * other.imag
        i = self.real * other.imag + self.imag * other.real
        return Complex(r, i)

    def conjugate(self):
        return Complex(self.real, -self.imag)

    def magnitude(self):
        return math.sqrt(self.real**2 + self.imag**2)

    def phase(self):
        return math.atan2(self.imag, self.real)

    def __repr__(self):
        sign = '+' if self.imag >= 0 else '-'
        return f"{self.real:.4f} {sign} {abs(self.imag):.4f}i"

# Complex arithmetic examples
z1 = Complex(3, 2)
z2 = Complex(1, 4)

print(f"z1 = {z1}")
print(f"z2 = {z2}")
print(f"z1 + z2 = {z1 + z2}")
print(f"z1 * z2 = {z1 * z2}    (should be -5 + 14i)")
print(f"conj(z1) = {z1.conjugate()}")
print(f"z1 * conj(z1) = {z1 * z1.conjugate()}  (should be {z1.real**2 + z1.imag**2} + 0i)")
print()

# Euler's formula: e^(i*theta) = cos(theta) + i*sin(theta)
def euler(theta):
    return Complex(math.cos(theta), math.sin(theta))

for theta in [0, math.pi/4, math.pi/2, math.pi]:
    e = euler(theta)
    print(f"e^(i·{theta/math.pi:.2f}π) = {e}  |mag|={e.magnitude():.4f}")`,
          },
          {
            id: 2,
            prose: [
              'Rotations via complex multiplication: verify that multiplying by e^(iθ) rotates a point by exactly θ degrees.',
              'Start with the point (1, 0) — the rightmost point of the unit circle. After multiplying by e^(iπ/4), it should move to (cos 45°, sin 45°) = (√2/2, √2/2). Four multiplications of π/2 should return to (1, 0).',
              'Then show the connection to the 2D rotation matrix: complex multiplication and matrix multiplication give identical results.',
            ],
            code: `import math

def euler(theta):
    return (math.cos(theta), math.sin(theta))  # (real, imag) tuple

def complex_mul(a, b):
    """(a[0]+a[1]i) * (b[0]+b[1]i)"""
    return (a[0]*b[0] - a[1]*b[1], a[0]*b[1] + a[1]*b[0])

def rotation_matrix_mul(theta, x, y):
    """Rotate (x,y) by theta using the 2x2 rotation matrix."""
    return (x*math.cos(theta) - y*math.sin(theta),
            x*math.sin(theta) + y*math.cos(theta))

# Rotate the point (1, 0) by pi/4 four times
point = (1.0, 0.0)
theta = math.pi / 4
print("Rotating (1,0) by π/4 each step:")
for step in range(5):
    angle_deg = step * 45
    print(f"  Step {step} ({angle_deg}°): ({point[0]:+.4f}, {point[1]:+.4f})")
    point = complex_mul(point, euler(theta))

# Verify: complex multiplication = rotation matrix
print("\\nVerifying complex mul == rotation matrix (theta = pi/3):")
x, y = 2.0, 1.0
theta = math.pi / 3
cm = complex_mul((x, y), euler(theta))
rm = rotation_matrix_mul(theta, x, y)
print(f"  Complex mul:   ({cm[0]:.6f}, {cm[1]:.6f})")
print(f"  Rotation matrix: ({rm[0]:.6f}, {rm[1]:.6f})")
print(f"  Difference: ({abs(cm[0]-rm[0]):.2e}, {abs(cm[1]-rm[1]):.2e})")
print("\\nConclusion: complex multiplication IS the rotation matrix.")`,
          },
          {
            id: 3,
            prose: [
              'RoPE (Rotary Position Embedding): encode position m by rotating the query/key vector by angle m·θ. The relative position between tokens becomes a rotation difference.',
              'Compute a simple 2D RoPE embedding: for positions 0, 1, 2, 3, rotate a 2D "query" vector by increasing angles. The dot product between two rotated vectors then depends on their position difference, not their absolute positions.',
              'This is why RoPE is better than additive positional encodings: the relative position is directly encoded in the rotation angle, and attention (which computes dot products) naturally measures relative position.',
            ],
            code: `import math

def rope_rotate_2d(x, y, position, theta=0.1):
    """
    RoPE: rotate the 2D vector (x, y) by angle = position * theta.
    In practice, different dimension pairs use different base frequencies.
    """
    angle = position * theta
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    return (x * cos_a - y * sin_a, x * sin_a + y * cos_a)

def dot2(a, b):
    return a[0]*b[0] + a[1]*b[1]

# A query vector and how it rotates at different positions
q = (1.0, 0.5)      # same query at all positions
theta = 0.5         # base frequency

print("Query vector (1.0, 0.5) at different positions:")
rotated = {}
for pos in range(6):
    rv = rope_rotate_2d(q[0], q[1], pos, theta)
    rotated[pos] = rv
    angle_deg = pos * theta * 180 / math.pi
    print(f"  pos={pos}: ({rv[0]:+.4f}, {rv[1]:+.4f})  angle={angle_deg:.1f}°")

# Dot product depends on RELATIVE position, not absolute
print("\\nDot product between q at pos=0 and q at pos=k:")
for k in range(6):
    dp = dot2(rotated[0], rotated[k])
    print(f"  pos_diff={k}: dot={dp:.4f}  (depends only on diff, not abs positions)")`,
          },
          {
            id: 'c1',
            challengeType: 'write',
            prompt: 'Implement the N-th roots of unity and verify their key property: the sum of all N roots is exactly 0. Then compute the 4th roots of unity and show they are the four cardinal directions on the unit circle: (1,0), (0,1), (-1,0), (0,-1).',
            starterCode: `import math

def nth_roots_of_unity(N):
    """
    Compute the N-th roots of unity: w_k = e^(2*pi*i*k/N) for k = 0..N-1.
    Return a list of (real, imag) tuples.
    """
    # TODO: use Euler's formula: e^(i*theta) = (cos(theta), sin(theta))
    pass

# Test for N = 4 and N = 8
for N in [4, 8]:
    roots = nth_roots_of_unity(N)
    sum_real = sum(r[0] for r in roots)
    sum_imag = sum(r[1] for r in roots)
    print(f"N={N}: sum=({sum_real:.6f}, {sum_imag:.6f})  (should be ~0, 0)")

# Print the 4 roots clearly
print("\\n4th roots of unity:")
# TODO: print each root with its angle in degrees
`,
            hint: 'For root k: theta = 2*pi*k/N. Then real = cos(theta), imag = sin(theta). The sum should be ≈ (0, 0) due to floating-point near-zero values.',
            testCode: `try:
    roots4 = nth_roots_of_unity(4)
    assert len(roots4) == 4
    sr = sum(r[0] for r in roots4)
    si = sum(r[1] for r in roots4)
    assert abs(sr) < 1e-10 and abs(si) < 1e-10, f"Sum not zero: ({sr},{si})"
    # Check the 4 roots are the cardinal directions
    expected = [(1,0), (0,1), (-1,0), (0,-1)]
    for (er, ei), (gr, gi) in zip(expected, roots4):
        assert abs(gr-er) < 1e-10 and abs(gi-ei) < 1e-10
    print("PASS: 4th roots of unity are correct, sum = 0")
except AssertionError as e:
    print(f"FAIL: {e}")`,
          },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'What is the imaginary unit i defined by?',
      options: [
        'i = √2',
        'i² = −1',
        'i = −1',
        'i² = 1',
      ],
      answer: 'i² = −1',
      hints: [
        'i is defined by its square, not its value — there is no real number equal to √(−1)',
        'Geometrically: multiplying by i is a 90° rotation; i² = two 90° rotations = 180° rotation = multiply by −1',
      ],
      reviewSection: 'Complex Arithmetic',
    },
    {
      type: 'choice',
      question: 'What does Euler\'s formula e^(iθ) equal?',
      options: [
        'θ + i',
        'cos θ + i·sin θ',
        'sin θ + cos θ',
        'iθ',
      ],
      answer: 'cos θ + i·sin θ',
      hints: [
        'e^(iθ) traces the unit circle as θ varies — it has magnitude 1 and angle θ',
        'The real part is cos θ (horizontal), imaginary part is sin θ (vertical)',
      ],
      reviewSection: 'Euler\'s Formula',
    },
    {
      type: 'choice',
      question: 'What is the result of (3 + 2i)(1 + 4i)?',
      options: [
        '3 + 8i',
        '4 + 6i',
        '−5 + 14i',
        '5 + 14i',
      ],
      answer: '−5 + 14i',
      hints: [
        'FOIL: (3)(1) + (3)(4i) + (2i)(1) + (2i)(4i) = 3 + 12i + 2i + 8i²',
        'Replace i² with −1: 3 + 14i − 8 = −5 + 14i',
      ],
      reviewSection: 'Complex Arithmetic',
    },
    {
      type: 'choice',
      question: 'Why are complex numbers used in RoPE (Rotary Position Embedding) for transformers?',
      options: [
        'Complex numbers compress the position encoding to use less memory',
        'Multiplying query/key vectors by complex rotations encodes relative position as a rotation angle',
        'Complex numbers are required by the attention softmax function',
        'RoPE uses imaginary numbers to handle negative positions',
      ],
      answer: 'Multiplying query/key vectors by complex rotations encodes relative position as a rotation angle',
      hints: [
        'Rotating a query at position m by e^(imθ) and a key at position n by e^(inθ) makes their dot product depend on (m−n)θ',
        'The dot product in attention then measures relative position — tokens that are r positions apart always get the same geometric relationship',
      ],
      reviewSection: 'Complex Numbers in ML',
    },
    {
      type: 'choice',
      question: 'The N-th roots of unity are N equally spaced points on the unit circle. What is their sum?',
      options: [
        'N',
        '1',
        '0',
        'N/2',
      ],
      answer: '0',
      hints: [
        'By symmetry: the N roots are equally spaced, so no direction is preferred — the vectors cancel',
        'This is why DFT basis vectors are orthogonal: the inner product of two distinct basis vectors sums the roots of unity = 0',
      ],
      reviewSection: 'Roots of Unity',
    },
  ],
}
