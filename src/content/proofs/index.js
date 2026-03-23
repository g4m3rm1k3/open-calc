// Central map: reference entry ID → proof data object
// Import this wherever you need to look up a proof by entry ID.

import { DERIVATIVE_PROOFS } from './derivatives.js'
import { LIMIT_PROOFS } from './limits.js'
import { INTEGRAL_PROOFS } from './integrals.js'

export const PROOFS = {
  ...DERIVATIVE_PROOFS,
  ...LIMIT_PROOFS,
  ...INTEGRAL_PROOFS,
}

export { DERIVATIVE_PROOFS, LIMIT_PROOFS, INTEGRAL_PROOFS }
