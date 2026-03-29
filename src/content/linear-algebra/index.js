import la1_001 from './la1-001-vectors.js';
import la1_002 from './la1-002-linear-combinations.js';
import la1_003 from './la1-003-dot-and-cross-products.js';

import la2_001 from './la2-001-matrices-as-transformations.js';
import la2_002 from './la2-002-matrix-multiplication.js';
import la2_003 from './la2-003-inverse-matrices.js';
import la2_004 from './la2-004-null-space-and-column-space.js';

import la3_001 from './la3-001-eigenvectors-and-eigenvalues.js';
import la3_002 from './la3-002-diagonalization.js';
import la3_003 from './la3-003-complex-eigenvalues.js';

import la4_001 from './la4-001-orthogonal-projections.js';
import la4_002 from './la4-002-svd.js';

// Phase 1: Vectors & Spaces
const LA1 = {
  title: 'Vectors & Spaces',
  number: 'la1',
  slug: 'vectors-and-spaces',
  lessons: [
    la1_001,
    la1_002,
    la1_003
  ],
};

// Phase 2: Matrices & Transformations
const LA2 = {
  title: 'Matrices & Transformations',
  number: 'la2',
  slug: 'matrices-and-transformations',
  lessons: [
    la2_001,
    la2_002,
    la2_003,
    la2_004
  ],
};

// Phase 3: Eigenvalues & Eigenvectors
const LA3 = {
  title: 'Eigenvalues & Eigenvectors',
  number: 'la3',
  slug: 'eigenvalues-and-eigenvectors',
  lessons: [
    la3_001,
    la3_002,
    la3_003
  ],
};

// Phase 4: Advanced Projections & SVD
const LA4 = {
  title: 'Advanced Projections & SVD',
  number: 'la4',
  slug: 'advanced-projections-svd',
  lessons: [
    la4_001,
    la4_002
  ],
};

export default [LA1, LA2, LA3, LA4];
