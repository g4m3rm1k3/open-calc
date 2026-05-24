import la1_001 from './la1-001-vectors.js';
import la1_002 from './la1-002-linear-combinations.js';
import la1_003 from './la1-003-dot-and-cross-products.js';
import la1_004 from './la1-004-systems-of-equations.js';
import la1_005 from './la1-005-lines-and-planes.js';
import la1_006 from './la1-006-gauss-jordan-rref.js';

import la2_001 from './la2-001-matrices-as-transformations.js';
import la2_002 from './la2-002-matrix-multiplication.js';
import la2_003 from './la2-003-inverse-matrices.js';
import la2_004 from './la2-004-null-space-and-column-space.js';
import la2_005 from './la2-005-determinants-general.js';
import la2_006 from './la2-006-lu-decomposition.js';
import la2_007 from './la2-007-special-matrices.js';
import la2_008 from './la2-008-cramers-rule.js';
import la2_009 from './la2-009-matrix-calculus.js';
import la2_010 from './la2-010-invertible-matrix-theorem.js';

import la3_001 from './la3-001-eigenvectors-and-eigenvalues.js';
import la3_002 from './la3-002-diagonalization.js';
import la3_003 from './la3-003-complex-eigenvalues.js';
import la3_004 from './la3-004-jordan-normal-form.js';
import la3_005 from './la3-005-markov-chains.js';
import la3_006 from './la3-006-cayley-hamilton.js';
import la3_007 from './la3-007-matrix-exponential.js';

import la4_001 from './la4-001-orthogonal-projections.js';
import la4_002 from './la4-002-gram-schmidt.js';
import la4_003 from './la4-003-least-squares.js';
import la4_004 from './la4-002-svd.js';
import la4_005 from './la4-005-inner-product-spaces.js';
import la4_006 from './la4-006-spectral-theorem.js';
import la4_007 from './la4-007-quadratic-forms.js';

import la_sandbox from './la-sandbox.js';

import la6_001 from './la6-001-abstract-vector-spaces.js';
import la6_002 from './la6-002-basis-and-dimension.js';
import la6_003 from './la6-003-linear-transformations.js';
import la6_004 from './la6-004-matrix-representations.js';
import la6_005 from './la6-005-isomorphisms.js';
import la6_006 from './la6-006-coordinates-change-of-basis.js';

import la7_001 from './la7-001-qr-decomposition.js';
import la7_002 from './la7-002-cholesky-decomposition.js';
import la7_003 from './la7-003-matrix-norms-conditioning.js';
import la7_004 from './la7-004-numerical-stability.js';
import la7_005 from './la7-005-sparse-matrices.js';

import la8_001 from './la8-001-pca-dimensionality-reduction.js';
import la8_002 from './la8-002-markov-pagerank.js';
import la8_003 from './la8-003-odes-linear-systems.js';
import la8_004 from './la8-004-computer-graphics.js';

import la9_001 from './la9-001-jacobi-gauss-seidel.js';
import la9_002 from './la9-002-conjugate-gradient.js';
import la9_003 from './la9-003-gmres.js';
import la9_004 from './la9-004-preconditioning.js';
import la9_005 from './la9-005-sparse-direct-solvers.js';

import la10_001 from './la10-001-dual-spaces.js';
import la10_002 from './la10-002-tensor-products.js';
import la10_003 from './la10-003-exterior-algebra.js';
import la10_004 from './la10-004-operator-theory.js';
import la10_005 from './la10-005-banach-hilbert-spaces.js';

// Chapter 1: Vectors & Spaces
const LA1 = {
  title: 'Vectors & Spaces',
  number: 'la1',
  slug: 'vectors-and-spaces',
  lessons: [
    la1_001,
    la1_002,
    la1_003,
    la1_004,
    la1_005,
    la1_006,
  ],
};

// Chapter 2: Matrices & Transformations
const LA2 = {
  title: 'Matrices & Transformations',
  number: 'la2',
  slug: 'matrices-and-transformations',
  lessons: [
    la2_001,
    la2_002,
    la2_003,
    la2_004,
    la2_005,
    la2_006,
    la2_007,
    la2_008,
    la2_009,
    la2_010,
  ],
};

// Chapter 3: Eigenvalues & Eigenvectors
const LA3 = {
  title: 'Eigenvalues & Eigenvectors',
  number: 'la3',
  slug: 'eigenvalues-and-eigenvectors',
  lessons: [
    la3_001,
    la3_002,
    la3_003,
    la3_004,
    la3_005,
    la3_006,
    la3_007,
  ],
};

// Chapter 4: Orthogonality, Projections & SVD
const LA4 = {
  title: 'Orthogonality, Projections & SVD',
  number: 'la4',
  slug: 'orthogonality-projections-svd',
  lessons: [
    la4_001,
    la4_002,
    la4_003,
    la4_004,
    la4_005,
    la4_006,
    la4_007,
  ],
};

// Chapter 5: Python Lab
const LA5 = {
  title: 'Python in the Browser',
  number: 'la5',
  slug: 'python-in-the-browser',
  lessons: [
    la_sandbox,
  ],
};

// Chapter 6: Abstract Vector Spaces
const LA6 = {
  title: 'Abstract Vector Spaces',
  number: 'la6',
  slug: 'abstract-vector-spaces',
  lessons: [
    la6_001,
    la6_002,
    la6_003,
    la6_004,
    la6_005,
    la6_006,
  ],
};

// Chapter 7: Numerical Linear Algebra
const LA7 = {
  title: 'Numerical Linear Algebra',
  number: 'la7',
  slug: 'numerical-linear-algebra',
  lessons: [
    la7_001,
    la7_002,
    la7_003,
    la7_004,
    la7_005,
  ],
};

// Chapter 8: Applications
const LA8 = {
  title: 'Applications of Linear Algebra',
  number: 'la8',
  slug: 'applications-of-linear-algebra',
  lessons: [
    la8_001,
    la8_002,
    la8_003,
    la8_004,
  ],
};

// Chapter 9: Iterative Solvers
const LA9 = {
  title: 'Iterative Solvers & Preconditioning',
  number: 'la9',
  slug: 'iterative-solvers-preconditioning',
  lessons: [
    la9_001,
    la9_002,
    la9_003,
    la9_004,
    la9_005,
  ],
};

// Chapter 10: Advanced Theory
const LA10 = {
  title: 'Advanced Theory',
  number: 'la10',
  slug: 'advanced-theory',
  lessons: [
    la10_001,
    la10_002,
    la10_003,
    la10_004,
    la10_005,
  ],
};

export default [LA1, LA2, LA3, LA4, LA5, LA6, LA7, LA8, LA9, LA10];
