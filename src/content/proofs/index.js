// Central map: reference entry ID → proof data object
// Import this wherever you need to look up a proof by entry ID.

import { DERIVATIVE_PROOFS } from './derivatives.js'
import { LIMIT_PROOFS } from './limits.js'
import { INTEGRAL_PROOFS } from './integrals.js'
import { ALGEBRA_PROOFS } from './algebra.js'
import { GEOMETRY_PROOFS } from './geometry.js'
import { TRIG_PROOFS } from './trig.js'
import { SERIES_PROOFS } from './series.js'

export const PROOFS = {
  ...DERIVATIVE_PROOFS,
  ...LIMIT_PROOFS,
  ...INTEGRAL_PROOFS,
  ...ALGEBRA_PROOFS,
  ...GEOMETRY_PROOFS,
  ...TRIG_PROOFS,
  ...SERIES_PROOFS,
}

export { DERIVATIVE_PROOFS, LIMIT_PROOFS, INTEGRAL_PROOFS, ALGEBRA_PROOFS, GEOMETRY_PROOFS, TRIG_PROOFS, SERIES_PROOFS }
