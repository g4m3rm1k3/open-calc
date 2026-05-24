export default {
  id: 'la3-006',
  slug: 'cayley-hamilton',
  chapter: 'la3',
  order: 6,
  title: 'The Cayley-Hamilton Theorem',
  subtitle: 'Every matrix satisfies its own characteristic equation. Plug the matrix in for the scalar variable — and you get the zero matrix.',
  tags: ['Cayley-Hamilton', 'characteristic polynomial', 'minimal polynomial', 'matrix polynomial', 'matrix inverse', 'matrix powers'],
  aliases: 'Cayley Hamilton characteristic polynomial minimal polynomial matrix polynomial annihilator',

  hook: {
    question: "The characteristic polynomial $p(\\lambda) = \\det(A - \\lambda I)$ is a polynomial in the scalar $\\lambda$. What happens if you replace $\\lambda$ with the matrix $A$ itself? You get the zero matrix — every single time.",
    realWorldContext: "The Cayley-Hamilton theorem has a surprisingly practical consequence: it gives you an efficient way to compute high powers of matrices and to find matrix inverses without computing determinants. In control theory, it is used to prove that any polynomial in a matrix can be reduced to degree $\\leq n-1$. In signal processing, it bounds the order of recurrence relations. In robotics, it simplifies the computation of matrix exponentials used in joint kinematics. Wherever you need to evaluate a function of a matrix, Cayley-Hamilton is in the background.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The surprise.** The characteristic polynomial $p(\\lambda) = \\det(A - \\lambda I)$ is a polynomial in the scalar variable $\\lambda$. It is derived from $A$, but it is an ordinary polynomial — it knows nothing about matrix algebra. Yet when you substitute the matrix $A$ itself into this polynomial (replacing $\\lambda^k$ with $A^k$ and the constant term with a scalar multiple of $I$), you get the zero matrix. This is the Cayley-Hamilton theorem.',
      '**Example first.** Let $A = \\begin{bmatrix}2&1\\\\5&3\\end{bmatrix}$. The characteristic polynomial is $p(\\lambda) = \\lambda^2 - 5\\lambda + 1$ (since trace $= 5$, det $= 1$). Cayley-Hamilton says $A^2 - 5A + I = 0$, meaning $A^2 = 5A - I$. You can verify this directly by computing $A^2$ and checking the equality.',
      '**Two key applications.** First, computing matrix inverses: from $A^2 - 5A + I = 0$, multiply by $A^{-1}$: $A - 5I + A^{-1} = 0$, so $A^{-1} = 5I - A$. No Gauss-Jordan needed! Second, reducing matrix powers: $A^2 = 5A - I$, so $A^3 = A \\cdot A^2 = A(5A - I) = 5A^2 - A = 5(5A - I) - A = 24A - 5I$. Any power of $A$ can be expressed as a linear combination of $I$ and $A$ (since the characteristic polynomial has degree 2).',
      '**Minimal polynomial.** The minimal polynomial $m(\\lambda)$ is the monic polynomial of smallest degree such that $m(A) = 0$. The characteristic polynomial $p(\\lambda)$ is always an annihilating polynomial, but it may not be minimal. For a diagonalizable matrix, the minimal polynomial has no repeated roots. For a Jordan block $J_k(\\lambda_0)$, the minimal polynomial is $(\\lambda - \\lambda_0)^k$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cayley-Hamilton Theorem',
        body: 'Let $A$ be an $n \\times n$ matrix and $p(\\lambda) = \\det(A - \\lambda I)$ its characteristic polynomial. Then $p(A) = 0$ (the zero matrix).',
      },
      {
        type: 'insight',
        title: 'Computing the Inverse via Cayley-Hamilton',
        body: 'If $p(\\lambda) = \\lambda^n + c_{n-1}\\lambda^{n-1} + \\cdots + c_1 \\lambda + c_0$ and $c_0 = (-1)^n \\det(A) \\neq 0$, then:\n$A^n + c_{n-1}A^{n-1} + \\cdots + c_1 A + c_0 I = 0$\nMultiply by $A^{-1}$:\n$A^{-1} = -c_0^{-1}(A^{n-1} + c_{n-1}A^{n-2} + \\cdots + c_1 I)$',
      },
      {
        type: 'warning',
        title: 'Do Not Prove It by Substitution',
        body: 'A common mistake: writing $p(A) = \\det(A - A \\cdot I) = \\det(0) = 0$ and thinking the theorem is obvious. This is wrong — $\\det(A - \\lambda I)$ is a scalar polynomial, and you cannot just substitute a matrix for the scalar and call it done. The actual proof requires care with polynomial rings and matrix algebra.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Cayley-Hamilton Verification',
        mathBridge: 'Compute the characteristic polynomial and verify that plugging A into it gives zero.',
        caption: 'The matrix satisfies its own characteristic equation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Verify Cayley-Hamilton for a 2x2 matrix',
              prose: ['For A = [2 1; 5 3], char poly is lambda^2 - 5*lambda + 1. Verify A^2 - 5A + I = 0.'],
              code: `A = [2 1; 5 3]
% Characteristic polynomial coefficients: trace and det
t = trace(A)
d = det(A)
disp('Char poly: lambda^2 - trace*lambda + det*I')
% p(A) = A^2 - trace(A)*A + det(A)*I
p_A = A^2 - t*A + d*eye(2)
disp('A^2 - 5A + I (should be zero matrix):')
p_A
`,
            },
            {
              id: 2,
              cellTitle: 'Use Cayley-Hamilton to compute the inverse',
              prose: ['From A^2 - 5A + I = 0, we get A^{-1} = 5I - A.'],
              code: `A = [2 1; 5 3]
t = trace(A);
d = det(A);
% A^{-1} = (1/d) * (A - t*I)... wait: from p(A)=0:
% A^2 - t*A + d*I = 0  => multiply by A^{-1}:
% A - t*I + d*A^{-1} = 0 => A^{-1} = (t*I - A) / d
A_inv_CH = (t*eye(2) - A) / d
disp('Standard inverse for comparison:')
inv(A)
disp('Match? (difference should be zero):')
A_inv_CH - inv(A)
`,
            },
            {
              id: 3,
              cellTitle: 'Compute A^10 using Cayley-Hamilton',
              prose: ['Since A^2 = 5A - I, express any A^n as aA + bI using recurrence.'],
              code: `A = [2 1; 5 3]
% Direct computation
A_pow = A^10;
disp('A^10 (direct):')
A_pow

% Verify via minimal polynomial recurrence
% a(n) and b(n) where A^n = a(n)*A + b(n)*I
% A^1 = 1*A + 0*I => a(1)=1, b(1)=0
% A^2 = 5*A - I   => a(2)=5, b(2)=-1
% A^{n+1} = 5*A^n - A^{n-1}  (recurrence)
a = [0; 1]; b = [1; 0];  % A^0 = I, A^1 = A
for n = 2:10
  an_new = 5*a(end) - a(end-1);
  bn_new = 5*b(end) - b(end-1);
  a = [a; an_new];
  b = [b; bn_new];
end
disp('A^10 via Cayley-Hamilton recurrence:')
a(end)*A + b(end)*eye(2)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof sketch (via Jordan form).** Over $\\mathbb{C}$, every $A$ is similar to its Jordan form $J$: $A = SJS^{-1}$. Then $p(A) = Sp(J)S^{-1}$. The characteristic polynomial factors as $p(\\lambda) = \\prod_i (\\lambda - \\lambda_i)^{m_i}$. For a Jordan block $J_k(\\lambda_0)$, we have $(J_k(\\lambda_0) - \\lambda_0 I)^k = 0$ (the nilpotent part raised to its degree). Since $p(\\lambda) = (\\lambda - \\lambda_0)^{m_0} \\cdot q(\\lambda)$ where $m_0 \\geq k$, $p(J_k(\\lambda_0)) = 0$. Block-diagonal application completes the proof.',
      '**Minimal polynomial.** Define $m(\\lambda)$ as the monic polynomial of least degree with $m(A) = 0$. It divides the characteristic polynomial: $p(\\lambda) = m(\\lambda) \\cdot q(\\lambda)$ for some polynomial $q$. The minimal polynomial has the same roots as the characteristic polynomial (just possibly smaller multiplicities). For a diagonalizable matrix, $m(\\lambda) = \\prod_i (\\lambda - \\lambda_i)$ (all roots simple). For $J_k(\\lambda_0)$ (a single Jordan block), $m(\\lambda) = (\\lambda - \\lambda_0)^k$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cayley-Hamilton via Minimal Polynomial',
        body: 'The minimal polynomial $m(\\lambda)$ divides the characteristic polynomial $p(\\lambda)$. Since $m(A) = 0$, and $p(\\lambda) = m(\\lambda) q(\\lambda)$, we get $p(A) = m(A) q(A) = 0 \\cdot q(A) = 0$.',
      },
      {
        type: 'insight',
        title: 'The Minimal Polynomial Determines the Jordan Structure',
        body: 'The degree of the largest Jordan block for eigenvalue $\\lambda_0$ equals the multiplicity of $\\lambda_0$ as a root of the minimal polynomial. So the minimal polynomial encodes the Jordan structure more precisely than the characteristic polynomial.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Hamilton\'s original proof (1853).** Hamilton proved the $2 \\times 2$ case in his work on quaternions; Cayley observed it held more generally. The first rigorous general proof uses the adjugate matrix: write $\\text{adj}(A - \\lambda I) = B_{n-1}\\lambda^{n-1} + \\cdots + B_0$ for matrix polynomial coefficients $B_k$. Multiply both sides of $(A - \\lambda I)\\text{adj}(A - \\lambda I) = p(\\lambda)I$ by collecting powers of $\\lambda$, then substitute carefully.',
      '**Over commutative rings.** The Cayley-Hamilton theorem holds for any $n \\times n$ matrix over a commutative ring $R$ (not just fields). The proof via adjoints carries through unchanged, which makes it valid over $\\mathbb{Z}[x]$, polynomial rings, etc. This generality is important in algebraic K-theory and module theory.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Span of Matrix Powers',
        body: 'By Cayley-Hamilton, $A^n = -c_{n-1}A^{n-1} - \\cdots - c_0 I$. So every power $A^k$ (for $k \\geq n$) is a linear combination of $\\{I, A, A^2, \\ldots, A^{n-1}\\}$. The vector space of matrix polynomials in $A$ has dimension at most $n$ (actually it equals the degree of the minimal polynomial).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la3-006-1',
      title: 'Cayley-Hamilton for a $3 \\times 3$ matrix',
      problem: 'Verify Cayley-Hamilton for $A = \\begin{bmatrix}1&0&0\\\\0&2&0\\\\0&0&3\\end{bmatrix}$ (diagonal).',
      solution: '$p(\\lambda) = (1-\\lambda)(2-\\lambda)(3-\\lambda) = -\\lambda^3 + 6\\lambda^2 - 11\\lambda + 6$. Then $p(A) = -A^3 + 6A^2 - 11A + 6I = \\text{diag}(-1+6-11+6, -8+24-22+6, -27+54-33+6) = \\text{diag}(0,0,0)$. ✓',
    },
  ],

  challenges: [
    {
      id: 'ch-la3-006-1',
      title: 'Inverse via Cayley-Hamilton',
      difficulty: 'medium',
      prompt: 'Let $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$. Use Cayley-Hamilton to find $A^{-1}$ without using the inverse formula.',
      hint: 'Find the characteristic polynomial, apply C-H to get $A^2 - 5A - 2I = 0$, then solve for $A^{-1}$.',
      solution: '$p(\\lambda) = \\lambda^2 - 5\\lambda - 2$. By C-H: $A^2 = 5A + 2I$. Multiply by $A^{-1}$: $A = 5I + 2A^{-1}$, so $A^{-1} = (A - 5I)/2 = \\frac{1}{2}\\begin{bmatrix}-4&2\\\\3&-1\\end{bmatrix}$.',
    },
  ],

  mentalModel: [
    'Every matrix annihilates its own characteristic polynomial: plug $A$ in for $\\lambda$, get 0.',
    'Application 1: compute $A^{-1}$ via polynomial algebra instead of row reduction.',
    'Application 2: reduce any $A^k$ to a linear combination of $\\{I, A, \\ldots, A^{n-1}\\}$.',
    'Minimal polynomial = smallest annihilating polynomial; it encodes the Jordan block sizes.',
  ],

  checkpoints: [
    { id: 'cp-la3-006-1', question: 'What does Cayley-Hamilton state?', answer: 'Every matrix satisfies its own characteristic equation: $p(A) = 0$.' },
    { id: 'cp-la3-006-2', question: 'Why can\'t you prove it by writing $p(A) = \\det(A - AI) = \\det(0) = 0$?', answer: '$\\det(A - \\lambda I)$ is a scalar polynomial; you cannot substitute a matrix for the scalar argument this way.' },
    { id: 'cp-la3-006-3', question: 'If $A$ is $n \\times n$, what is the maximum degree of the minimal polynomial?', answer: '$n$ (the degree of the characteristic polynomial).' },
  ],

  assessment: 'For $A = \\begin{bmatrix}3&1\\\\-2&0\\end{bmatrix}$, find the characteristic polynomial, verify Cayley-Hamilton, and use it to compute $A^5$ as a linear combination of $I$ and $A$.',

  quiz: [
    { id: 'q-la3-006-1', question: 'Cayley-Hamilton says that for any $n \\times n$ matrix $A$:', options: ['$A^n = 0$', '$p(A) = 0$ where $p$ is the char. poly.', '$\\det(A) = 0$', '$A$ is diagonalizable'], answer: '$p(A) = 0$ where $p$ is the char. poly.' },
    { id: 'q-la3-006-2', question: 'The minimal polynomial of a diagonalizable matrix with distinct eigenvalues $\\lambda_1, \\lambda_2, \\lambda_3$ is:', options: ['$(\\lambda-\\lambda_1)^3$', '$(\\lambda-\\lambda_1)(\\lambda-\\lambda_2)(\\lambda-\\lambda_3)$', '$(\\lambda-\\lambda_1)^2(\\lambda-\\lambda_2)$', '$\\lambda^3$'], answer: '$(\\lambda-\\lambda_1)(\\lambda-\\lambda_2)(\\lambda-\\lambda_3)$' },
    { id: 'q-la3-006-3', question: 'Using Cayley-Hamilton, any $A^k$ for $k \\geq n$ can be expressed as:', options: ['$0$', '$A^n$', 'a linear combination of $I, A, \\ldots, A^{n-1}$', '$\\lambda^k I$'], answer: 'a linear combination of $I, A, \\ldots, A^{n-1}$' },
  ],
};
