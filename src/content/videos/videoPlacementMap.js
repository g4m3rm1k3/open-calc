/**
 * Video Placement Map.
 * Maps lesson IDs to video playlists for each section.
 */
export const VIDEO_PLACEMENT_MAP = {
  'ch0-inequalities': {
    intuition: ["oct-polynomial-inequalities","oct-rational-inequalities"],
  },
  'ch0-conic-sections': {
    intuition: ["graphing-ellipses-circles","graphing-hyperbolas-in-standard-form","graphing-parabolas-in-standard-form","finding-equations-of-conics-from-given-conditions","application-of-ellipses","application-of-hyperbolas","applications-of-parabolas-in-standard-form","rotated-conic-section-identifying-graphing-4-examples"],
  },
  'ch0-functions': {
    intuition: ["oct-even-odd-functions-examples","oct-function-composition","graph-transformations","oct-piecewise-functions-intro"],
  },
  'ch0-absolute-value': {
    intuition: ["oct-absolute-value-equations","oct-absolute-value-inequality-graphs","derivative-of-absolute-value-functions-calculus-1-ab","limits-involving-absolute-value-functions-calculus-1-ab"],
  },
  'ch0-polynomial-division': {
    intuition: ["oct-polynomial-long-division","oct-synthetic-division"],
  },
  'ch0-completing-the-square': {
    intuition: ["oct-completing-the-square-intro","oct-quadratic-formula-derivation"],
  },
  'ch0-partial-fractions': {
    intuition: ["oct-partial-fraction-decomposition-pt1","oct-partial-fraction-decomposition-pt2"],
  },
  'ch0-01f': {
    intuition: ["binomial-theorem-introduction","ka-binomial-coefficient-intuition"],
  },
  'ch0-trig': {
    intuition: [
      "tr-00-introduction-to-the-trigonometry-series", "tr-08-similar-and-congruent-triangles", 
      "tr-10-pythagorean-triples", "tr-14-the-unit-circle", "tr-18-graphing-sine-and-cosine", 
      "tr-21-domain-and-range-of-trig-functions", "tr-22-algebra-review-of-inverse-functions", 
      "tr-24-other-inverse-trig-functions", "tr-34-using-pythagorean-identities", 
      "setting-up-the-unit-circle-part-2", "right-triangle-trigonometry-part-1-finding-missing-sides", 
      "right-triangle-trigonometry-part-2-solving-for-acute-angles", "solving-trigonometric-equations-5-examples"
    ],
  },
  'ch0-exponentials': {
    intuition: ["calculus-i-5-1-1-review-logarithmic-and-exponential-functions","graphing-exponential-functions-w-t-table-or-transformations","solving-compound-interest-problems"],
  },
  'ch0-assignment-playbook': {
    intuition: ["tips-for-success-in-flipped-classrooms-omg-baby"],
  },
  'ch1-limits-intro': {
    intuition: ["ka-EKvHQc3QEow","ka-riXcZT2ICjA","ka-W0VWO4asgmk","calculus-i-1-2-2-limits-that-fail-to-exist","calculus-i-1-2-1-finding-limits-numerically-and-graphically","calculus-i-1-1-1-a-preview-of-calculus","essence-of-calculus-chapter-6-limits","essence-of-calculus-chapter-1-the-paradox-of-the-derivative","hyperbolic-functions-introduction-6-ex-calculus-1-please-read-description","area-against-y-axis-riemman-limit-of-sums-calculus-1","sigma-notation-infinite-sums-with-limits-calculus-1-ab","oct-even-odd-functions-examples","horizontal-asymptotes-of-irrational-functions","limits-at-infinity-rational-irrational-and-trig-functions-calculus-1-ab-read-description","derivative-of-absolute-value-functions-calculus-1-ab","higher-order-derivative-introduction-calculus-1-ab","derivative-using-quotient-rule-3-examples-4k","derivative-using-product-rule-3-examples-4k","finding-derivative-with-definition-of-derivative-calculus-1-ab","curve-sketching-with-limits-calculus-1-ab","infinite-limits-vertical-asymptotes-calculus-1-ab","limits-involving-absolute-value-functions-calculus-1-ab","evaluating-a-limit-rationalizing-the-numerator-4k","limits-of-piecewise-function-calculus-1-ab","limits-of-rational-functions-3-examples-4k","properties-of-limits-calculus-1-ab","why-limits-are-important-in-calculus","finding-real-limits-graphical-numerical-approach-calculus-1-ab","finding-limits-with-properties-includes-quotient-rule-calculus-1-ab","limits-continuity","slope-of-tangent-line-derivative-at-a-point-calculus-1-ab","function-vs-limit-value-3-examples-graphing-review-4k","the-velocity-problem-part-ii-graphically","the-velocity-problem-part-i-numerically","a-tale-of-three-functions-intro-to-limits-part-ii","a-tale-of-three-functions-intro-to-limits-part-i","a-limit-example-combining-multiple-algebraic-tricks","top-4-algebraic-tricks-for-computing-limits"],
  },
  'ch1-limit-laws': {
    intuition: ["calculus-i-1-3-2-finding-limits-of-indeterminant-form-functions","calculus-i-1-3-1-properties-of-limits","calculus-i-1-2-1-finding-limits-numerically-and-graphically","first-fundamental-theorem-of-calculus-calculus-1-ab","squeeze-theorem-for-sequences-sandwich-theorem-calculus-1","limits-of-trig-functions-special-ratios-3-examples-4k","why-limits-are-important-in-calculus","limit-laws-breaking-up-complicated-limits-into-simpler-ones","building-up-to-computing-limits-of-rational-functions"],
  },
  'ch1-continuity': {
    intuition: ["calculus-i-1-4-3-the-intermediate-value-theorem","calculus-i-1-4-2-properties-of-continuity","calculus-i-1-4-1-continuity","calculus-i-1-2-2-limits-that-fail-to-exist","intermediate-value-theorem-calculus-1-ab-precalculus","limits-are-simple-for-continuous-functions","example-when-is-a-piecewise-function-continuous"],
  },
  'ch1-ivt': {
    intuition: ["calculus-i-1-4-3-the-intermediate-value-theorem","were-you-ever-exactly-3-feet-tall-the-intermediate-value-theorem"],
  },
  'ch1-discontinuities': {
    intuition: ["arc-length-of-a-curve-smooth-curve-calculus-1-bc-5-examples","second-fundamental-theorem-calculus-1-ab","what-is-an-infinite-limit"],
  },
  'ch1-epsilon-delta': {
    intuition: ["ka--ejyeII0i5c","ka-Fdu5-aNJTzU","calculus-i-1-2-3-the-epsilon-delta-limit-definition","definition-of-a-limit-epsilon-delta-proof-3-examples-calculus-1"],
  },
  'ch1-squeeze-theorem': {
    intuition: ["ka-igJdDN-DPgA","ka-Ve99biD1KtA","limits-of-oscillating-functions-and-the-squeeze-theorem"],
  },
  'ch1-fundamental-trig-limits': {
    intuition: ["the-most-important-limit-in-calculus-geometric-proof-applications"],
  },
  'ch1-limits-at-infinity': {
    intuition: ["calculus-i-3-5-2-horizontal-asymptotes-and-computational-techniques","calculus-i-3-5-1-limits-at-infinity","calculus-i-1-5-2-vertical-asymptotes","calculus-i-1-5-1-infinite-limits-and-their-properties","computing-limits-at-infinity-for-rational-functions","infinite-limit-vs-limits-at-infinity-of-a-composite-function"],
  },
  'limits-and-continuity': {
    intuition: ["continuity-on-an-interval-open-closed-intervals-1-sided-limits-calculus-1-ab","calculus-speedrun-limits-episode-1"],
  },
  'ch2-000': {
    intuition: ["calculus-i-2-1-2-the-derivative-using-the-definition-of-a-derivative","calculus-i-2-1-1-the-slope-of-the-tangent-line-using-the-definition-of-slope","graphical-comparison-function-to-its-1st-and-2nd-derivative-calculus-1-ab","horizontal-tangent-lines-and-differentiation-calculus-1-ab","tangent-line-of-curve-parallel-to-a-line-calculus-1-ab","tangent-line-through-point-not-on-curve-4k","tangent-line-parallel-to-a-given-line-calculus-derivative-4k","tangent-line-and-normal-line-in-calculus-4k","instantaneous-velocity-and-speed-of-linear-motion-calculus-1-ab","basic-differentiation-rules-calculus-1-ab","graphical-comparison-of-function-vs-derivative-graphs-calculus-1-ab","why-there-is-no-derivative-at-a-sharp-bend-4k","definition-of-derivative-and-vertical-tangent-line-calculus-1-ab","slope-of-tangent-line-derivative-at-a-point-calculus-1-ab","definition-of-a-derivative-alternative-form-at-a-point-4k","definition-of-derivative-tangent-line-problems-calculus-1-ab","definition-of-the-derivative-part-i","applying-the-definition-of-the-derivative-to-1-x","the-derivative-of-a-constant-and-of-x-2-from-the-definition","definition-of-derivative-example-f-x-x-1-x-1"],
  },
  'ch2-001': {
    intuition: ["ka-h78GdGiRmpM","ka-E_1gEtiGPNI","ka-dZnc3PtNaN4","calculus-i-2-3-1-the-product-and-quotient-rules-for-derivatives","calculus-i-2-2-2-applying-the-derivative-to-the-position-function","calculus-i-2-2-1-basic-differentiation-rules","essence-of-calculus-chapter-2-derivative-formulas-through-geometry","logarithmic-differentiation-derivative-of-a-fraction","derivative-rules-power-rule-additivity-and-scalar-multiplication","how-to-find-the-equation-of-a-tangent-line"],
  },
  'ch2-002': {
    intuition: ["ka-XIQ-KnsAsbg","ka-6_lmiPDedsY","essence-of-calculus-chapter-3-visualizing-the-chain-rule-and-product-rule","chain-rule-the-derivative-of-a-composition","calculus-i-2-4-1-the-chain-rule-and-general-power-rule","calculus-i-2-4-2-differentiation-strategies-and-practice","chain-rule-with-trig-functions-harder-examples","chain-rule-harder-algebraic-examples","chain-rule-3-algebraic-examples","interpreting-the-chain-rule-graphically","the-chain-rule-using-leibniz-notation"],
  },
  'ch2-002b': {
    intuition: ["calculus-i-5-3-2-the-derivative-of-the-inverse-of-a-function","derivative-of-inverse-function","derivative-of-inverse-trigonometric-functions-examples-calculus-1-ab","derivative-rules-for-inverse-trigonometric-functions-derived-calculus-1-ab","derivative-of-inverse-trig-functions-via-implicit-differentiation","evaluating-inverse-trigonometric-functions","evaluating-inverse-trigonometric-functions-full-length"],
  },
  'ch2-003': {
    intuition: ["calculus-i-5-7-2-inverse-trigonometric-functions-differentiation","calculus-i-2-3-2-trigonometric-and-higher-order-derivatives","derivative-rules-of-trigonometric-functions-calculus-1-ab","deriving-derivative-rules-for-trigonometric-functions-tan-cot-sec-csc-calculus-1-ab","derivative-of-inverse-trigonometric-functions","the-derivative-of-trigonometric-functions","setting-up-the-unit-circle-part-1-and-reference-angle","fundamental-trigonometric-identities-intro-proofs","intro-to-fundamental-trig-identities","understanding-basic-sine-cosine-graphs","evaluating-trig-functions-w-unit-circle-degrees-radians"],
  },
  'ch2-004': {
    intuition: ["calculus-i-5-5-1-logarithmic-and-exponential-functions-derivatives-and-integrals-base-not-e","calculus-i-5-4-1-derivatives-and-integrals-of-the-natural-exponential-function","calculus-i-5-1-2-the-natural-logarithmic-function-differentiation","derivative-of-logarithms-base-a-calculus-1-ab","derivative-of-exponential-functions-base-a-calculus-1-ab","derivative-of-natural-logarithm-functions-calculus-1-ab","the-derivative-of-e-x","logarithm-introduction","using-properties-of-logarithms-to-expand-logs","using-properties-of-logarithms-to-condense-logs","change-of-base-formula-logarithms","solving-natural-exponential-functions-3-examples-with-natural-logarithms","the-derivative-of-ln-x-via-implicit-differentiation","logarithmic-differentiation-example-x-sinx"],
  },
  'ch2-005': {
    intuition: ["ka-sL6MC-lKOrw","ka-PUsMyhds5S4","calculus-i-2-5-1-implicit-differentiation","implicit-differentiation-product-rule-normal-line","second-derivative-implicitly-calculus-1-ab","implicit-differentiation-3-examples-calculus-1-ab","introduction-to-implicit-differentiation-calculus-1-ab","implicit-differentiation-differentiation-when-you-only-have-an-equation-not-an-explicit-function"],
  },
  'ch2-reading-derivatives': {
    intuition: ["concavity-inflection-second-derivative-test-4-examples-calculus-1-ab","sketching-derivatives-from-graphs-of-functions-5-examples-calculus-1-ab","extrema-on-an-interval"],
  },
  'derivatives-introduction': {
    intuition: ["5-counterexamples-every-calculus-student-should-know","slope-of-tangent-line-derivative-at-a-point-calculus-1-ab","finding-derivative-with-definition-of-derivative-calculus-1-ab"],
  },
  'ch3-000': {
    intuition: ["calculus-i-2-6-2-related-rates-modeling-with-triangles","calculus-i-2-6-1-related-rates-modeling-with-circles","calculus-related-rates-example-volume-of-cone-calculus-1-ab","related-rates-similar-triangles-4k","related-rates-right-triangles-2-examples-4k","related-rates-part-2-linear-vs-angular-speed-calculus-1-ab","related-rates-introduction-area-volume-4k","intro-to-related-rates"],
  },
  'ch3-001': {
    intuition: ["calculus-3-9-2-propagated-and-relative-error-in-differentials","calculus-3-9-1-tangent-line-approximation-and-differentials","area-between-curves-8-examples","linear-approximations-using-tangent-lines-to-approximate-functions","setting-up-the-unit-circle-part-1-and-reference-angle","setting-up-the-unit-circle-part-2","evaluating-trig-functions-w-unit-circle-degrees-radians","intro-to-fundamental-trig-identities","tr-34-using-pythagorean-identities","sum-difference-identities-intro-5-examples","sum-and-difference-trigonometric-identities","sum-difference-identities-proofs-equation-3-examples","deriving-trig-identities-from-sin-a-b-and-cos-a-b","double-half-angle-identities-9-examples","evaluating-trigonometry-expressions-with-half-and-double-angles-pt1","evaluating-trigonometry-expressions-with-half-and-double-angles-pt2","trigonometry-proofs-involving-half-and-double-angles","product-to-sum-and-sum-to-product-formulas","verifying-trigonometric-identities-intro-4-examples","verifying-trigonometric-identities-pt-1","verifying-trigonometric-identities-pt2","verifying-trigonometric-identities-pt3","verifying-trigonometric-identities-involving-sum-difference"],
  },
  'ch3-002': {
    intuition: ["calculus-i-3-2-2-the-mean-value-theorem","mean-value-average-value-theorem-of-integration-calculus-1-ab","mean-value-theorem-for-derivatives-calculus-1-ab","the-mean-value-theorem-is-actually-very-nice","trigonometric-cofunctions","trig-expressions-finding-trig-functions-given-another-trig-ratio","trigonometric-functions-of-any-angle","right-triangle-trigonometry-part-1-finding-missing-sides","right-triangle-trigonometry-part-2-solving-for-acute-angles"],
  },
  'ch3-003': {
    intuition: ["calculus-i-3-6-2-curve-sketching-using-derivatives","calculus-i-3-6-1-curve-sketching-using-graph-attributes","calculus-i-3-4-2-the-second-derivative-test","calculus-i-3-4-1-intervals-of-concavity-and-points-of-inflection","calculus-i-3-3-2-the-first-derivative-test","calculus-i-3-3-1-increasing-and-decreasing-functions","calculus-i-3-1-2-critical-numbers-and-extrema","calculus-i-3-1-1-relative-and-absolute-extrema","essence-of-calculus-chapter-9-higher-order-derivatives","definite-integral-as-a-function-of-x-calculus-1-ab","summary-of-curve-sketching-rational-exponent-odd-function-calculus-1-ab","summary-of-curve-sketching-rational-function-with-slant-asymptote-calculus-1-ab","first-derivative-test-intervals-of-increasing-decreasing-relative-extrema-calculus-1-ab","relative-and-absolute-maximums-and-minimums-part-i","relative-and-absolute-maximums-and-minimums-part-ii","concavity-and-the-2nd-derivative-test","logarithm-introduction"],
  },
  'ch3-004': {
    intuition: ["calculus-i-final-exam-review","calculus-i-3-7-2-optimization-practice","calculus-i-3-7-1-optimization","calculus-i-3-1-2-critical-numbers-and-extrema","calculus-i-3-1-1-relative-and-absolute-extrema","area-between-2-curves-vertical-and-horizontal-representative-rectangles-calculus-1-ab","optimization-cylinder-in-sphere-with-radius-r","optimization-calculus-problems-volume-calculus-1-ab","optimization-calculus-problems-minimizing-lengths-calculus-1-ab-read-description","ex-optimizing-the-volume-of-a-box-with-fixed-surface-area","folding-a-wire-into-the-largest-rectangle-optimization-example","optimization-example-minimizing-surface-area-given-a-fixed-volume","tr-22-algebra-review-of-inverse-functions","tr-24-other-inverse-trig-functions"],
  },
  'ch3-005': {
    intuition: ["calculus-i-5-6-1-indeterminant-forms-and-l-hopital-s-rule","finding-the-equation-of-sine-cosine-from-a-graph","water-depth-word-problem-sinusoidal-model"],
  },
  'ch3-070': {
    intuition: ["calculus-3-9-2-propagated-and-relative-error-in-differentials","introduction-to-separable-differential-equations-7-examples","homogeneous-differential-equations-first-order3-examples","solving-first-order-linear-differential-equations-3-examples","more-solving-separable-differential-equations-calculus-1-ab","separable-differential-equations-growth-and-decay-model-calculus-1-ab","intro-to-solving-separable-differential-equation-calculus-1-ab","verifying-particular-solutions-to-differential-equations-calculus-1-ab","differentials-tangent-line-approximation-propagated-error-linearization"],
  },
  'ch4-000': {
    intuition: ["essence-of-calculus-chapter-7-integration-and-the-fundamental-theorem-of-calculus","area-under-a-curve-definite-integrals-with-ti-nspire-calculus-1-ab","inverse-hyperbolic-functions-derivative-and-integral-calculus-1","integrating-exponential-functions-base-a-calculus-1-ab","accumulation-function-definite-integral","properties-of-definite-integrals-calculus-1-ab","estimating-area-with-rectangles-part-1-of-2-calculus-1-ab"],
  },
  'ch4-001': {
    intuition: ["calculus-i-4-2-3-find-the-area-under-a-curve-using-the-limit-definition","calculus-i-4-2-2-approximating-the-area-under-a-curve","calculus-i-4-2-1-sigma-notation-and-summation-formulas","essence-of-calculus-chapter-8-what-does-area-have-to-do-with-slope","definite-integrals-defined-w-riemann-limit-of-sums-example-calculus-1-ab","riemann-sum-defined-w-2-limit-of-sums-examples-calculus-1","estimating-area-with-rectangles-riemann-limit-of-sums-definition-of-area-calculus-1-ab","definition-of-area-riemann-sum-limit-of-sums-part-2-of-2-calculus-1","estimating-area-with-riemann-sums-finite-rectangles-calculus-1-ab","riemann-sum-and-definite-integral-introduction","summation-notation-sigma","the-definite-integral-part-i-approximating-areas-with-rectangles","the-definite-integral-part-ii-using-summation-notation-to-define-the-definite-integral"],
  },
  'ch4-002': {
    intuition: ["calculus-i-4-3-2-evaluating-definite-integrals-without-the-ftc","calculus-i-4-3-1-riemann-sums-and-definite-integrals-defined","integration-involving-inverse-trig-functions","base-a-derivative-integration-13-examples","review-of-basic-integration-rules-calculus-1-ab-6-examples","integration-involving-inverse-trigonometric-functions-calculus-1-ab-6-examples","definite-integration-with-u-substitution-calculus-1-ab","indefinite-integration-by-u-substitution-calculus-1-ab","definite-integration-displacement-and-total-distance-of-linear-motion-calculus-1-ab","antiderivative-indefinite-integration-11-examples-calculus-1-ab","the-definite-integral-part-iii-evaluating-from-the-definition"],
  },
  'ch4-003': {
    intuition: ["calculus-i-4-4-3-the-second-fundamental-theorem-of-calculus","calculus-i-4-4-2-the-mean-value-theorem-for-integrals-and-the-average-value-of-a-function","calculus-i-4-4-1-the-fundamental-theorem-of-calculus","integrating-natural-logarithm-function-calculus-1-ab","definite-integrals-common-geometric-area-calculus-1-ab","fundamental-theorem-of-calculus-1-geometric-idea-chain-rule-example","fundamental-theorem-of-calculus-ii"],
  },
  'ch4-004': {
    intuition: ["calculus-i-5-4-1-derivatives-and-integrals-of-the-natural-exponential-function","calculus-i-5-2-1-the-natural-logarithmic-function-integration","calculus-i-4-1-2-initial-conditions-and-the-particular-solution-to-a-differential-equation","calculus-i-4-1-1-antiderivatives-and-the-general-solution-to-a-differential-equation","integration-techniques-reviewed-5-examples","integration-of-natural-exponential-functions-calculus-1-ab","integration-of-natural-exponential-function-e-x-4-examples","indefinite-integration-word-problems-calculus-1-ab","initial-condition-particular-solution-for-antiderivative-calculus-1-ab","solving-for-the-constant-in-the-general-anti-derivative"],
  },
  'ch4-005': {
    intuition: ["calculus-i-final-exam-review","calculus-i-4-4-2-the-mean-value-theorem-for-integrals-and-the-average-value-of-a-function","hyperbolic-functions-derivative-integrals-5-examples-calculus-1","average-value-of-a-continuous-function-on-an-interval","exam-walkthrough-calc-1-test-3-integration-ftc-i-ii-optimization-u-subs-graphing"],
  },
  'ch4-006': {
    intuition: ["calculus-i-5-2-2-natural-logarithmic-integration-difficult-examples","calculus-i-5-2-1-the-natural-logarithmic-function-integration","calculus-i-4-5-2-integration-by-substitution-definite-integrals","calculus-i-4-5-1-integration-by-substitution-indefinite-integrals","intro-to-substitution-undoing-the-chain-rule","adjusting-the-constant-in-integration-by-substitution","substitution-method-for-definite-integrals-careful"],
  },
  'ch4-006b': {
    intuition: ["volume-of-solids-with-cross-sections","intro-to-volumes-of-solids-geometry-vs-calculus","area-of-a-surface-of-revolution-calculus-1","volume-of-solid-of-revolution-shell-method-calculus-1-ab-3-examples","volumes-of-solids-with-known-cross-sections-calculus-1-ab-3-examples","volume-of-solid-of-revolution-disk-method-and-washer-method-calculus-1-ab-read-description","application-of-definite-integration-volume-rate-of-flow-calculus-1-ab"],
  },
  'ch4-008': {
    intuition: ["calculus-i-5-8-1-inverse-trigonometric-functions-integration","integration-involving-inverse-trig-functions","integration-involving-inverse-trigonometric-functions-calculus-1-ab-6-examples","integration-involving-natural-logarithm-function-5-examples"],
  },
  'ch4-009': {
    intuition: ["calculus-i-5-8-1-inverse-trigonometric-functions-integration"],
  },
  'ch4-centroid': {
    intuition: ["thank-you-calc-students-some-final-thoughts"],
  },
  'ch5-004': {
    intuition: ["essence-of-calculus-chapter-10-taylor-series"],
  },
  'ch6-polar': {
    intuition: ["tr-46-polar-equations-trigonometry-series-by-dennis-f-davis","tr-45-polar-coordinates-trigonometry-series-by-dennis-f-davis"],
  },
  'ch1-graphs-001': {
    intuition: ["function-vs-relation","visually-identifying-key-characteristics-of-graphs","identifying-domain-and-range-from-a-graph","equations-of-lines-and-graphing","graphing-lines-in-slope-intercept-form-y-mx-b","equation-of-parallel-perpendicular-lines-given-point-line"],
  },
  'ch1-graphs-002': {
    intuition: ["transformation-of-functions","piecewise-functions-evaluating-graphing","average-rate-of-change","difference-quotient"],
  },
  'ch1-graphs-003': {
    intuition: ["even-odd-polynomial-functions-symmetry","even-and-odd-functions-many-examples","horizontal-asymptotes-of-rational-equations","graphing-rational-functions-with-slant-asymptotes","finding-vertical-asymptotes-and-holes-of-rational-equations","determining-domain-of-functions","domain-of-rational-functions-decomposing-functions"],
  },
  'ch1-graphs-004': {
    intuition: ["polynomial-graphs-part-1","polynomial-graphs-part-2","synthetic-division-remainder-theorem","long-division-of-polynomials","finding-polynomials-using-the-linear-factorization-theorem","solving-higher-order-polynomials-pt-1-rational-zeros-descartes-rule","solving-higher-order-polynomials-pt-2-rational-zeros-descartes-rule","graphing-rational-functions-part-1","graphing-rational-functions-part-2","composition-of-functions","inverse-functions","combination-of-functions-analytical-graphical","modeling-with-functions-part-1","modeling-with-functions-part-2","modeling-with-functions-part-3"],
  },
  'ch1-graphs-005': {
    intuition: ["understanding-polar-coordinates","converting-coordinates-between-polar-and-rectangular-form","converting-equations-between-polar-rectangular-form","graphing-polar-equations-test-for-symmetry-4-examples-corrected","introduction-to-vectors","writing-vector-in-terms-of-magnitude-direction-example","vector-application-examples","dot-product-angle-between-vectors","projection-of-a-vector-onto-another-vector","introduction-to-parametric-equations","parametric-equations-eliminating-parameter-t"],
  },
  'ch2-alg-002': {
    intuition: ["factoring-overview","factoring-polynomials-by-grouping"],
  },
  'ch2-alg-003': {
    intuition: ["graphing-parabolas-w-vertex-intercepts","parabola-applications-maximizing-minimizing-reflectors-etc","complex-imaginary-numbers-part-1","complex-solutions-imaginary-part-2-of-parabola-quadratic-equation"],
  },
  'ch2-alg-004': {
    intuition: ["partial-fraction-decomposition-part-1","partial-fractions-decomposition-part-2"],
  },
  'ch2-alg-005': {
    intuition: ["solving-linear-systems-with-substitution-and-linear-combination-simultaneous-equations","solving-3-variable-linear-systems-substitution-gaussian-elimination","3-variable-systems-parabola-equation-given-3-points-investment-word-problem","non-square-3-variable-linear-systems","2-variable-non-linear-systems-substitution-method","2-variable-non-linear-systems-addition-elimination-method","matrices-and-gaussian-jordan-elimination","determinant-of-square-matrices"],
  },
  'ch2-alg-006': {
    intuition: ["complex-numbers-in-polar-form","product-quotient-of-polar-complex-numbers"],
  },
  'ch2-alg-007': {
    intuition: ["solving-polynomial-inequalities-a-graphical-approach","solving-rational-inequalities","solving-polynomial-inequalities","graphing-linear-inequalities-3-examples","graphing-1-variable-inequalities","graphing-non-linear-inequalities","graphing-system-of-linear-inequalities"],
  },
  'precalc3-solving-triangles': {
    intuition: ["tr-26-solving-right-triangles","tr-27-triangle-types-to-solve","tr-30-ssa-triangles-overview","tr-31-solving-ssa-triangles","solving-trigonometric-equations-5-examples"],
  },
  'precalc3-polar-coordinates': {
    intuition: ["tr-45-polar-coordinates","tr-46-polar-equations"],
  },
  'ch3-trig-000': {
    intuition: ["tr-00-introduction-to-the-trigonometry-series"],
  },
  'ch3-trig-005': {
    intuition: ["tr-18-graphing-sine-and-cosine","tr-21-domain-and-range-of-trig-functions"],
  },
  'ch3-trig-006': {
    intuition: ["tr-26-solving-right-triangles","tr-27-triangle-types-to-solve","tr-30-ssa-triangles-overview","tr-31-solving-ssa-triangles","solving-trigonometric-equations-5-examples"],
  },
  'ch3-trig-002': {
    intuition: ["tr-08-similar-and-congruent-triangles","tr-10-pythagorean-triples"],
  },
  'ch3-trig-003': {
    intuition: ["tr-14-the-unit-circle"],
  },
  'discrete-1-00': {
    hook: ["discrete-intro"],
  },
  'discrete-1-01': {
    intuition: ["logic-statements", "truth-tables-intro", "truth-table-ex", "logical-equivalence", "tautology-contradiction", "demorgans-laws", "conditional-statements", "vacuously-true", "negating-conditional", "contrapositive-intro", "converse-inverse", "biconditional-intro"],
  },
  'discrete-1-01a': {
    intuition: ["predicates-truth-sets", "quantifiers-intro", "negating-quantifiers", "multiple-quantifiers", "universal-conditionals", "necessary-sufficient"],
  },
  'discrete-1-01b': {
    intuition: ["modus-ponens-tollens", "argument-forms", "argument-validity", "even-odd-integers", "prove-even-odd", "prove-evens-product", "rational-numbers-proof", "divisibility-transitive", "counterexamples-implications", "proof-by-cases", "proof-by-contradiction", "proof-by-contrapositive"],
  },
  'discrete-1-02a': {
    intuition: ["set-intro", "set-notation", "empty-set", "cartesian-product", "function-intuition", "function-formal", "relation-is-function", "subset-element-method", "set-equality-proof", "set-union", "set-intersection", "set-complements", "subset-containment-proof", "power-sets"],
  },
  'discrete-1-02': {
    intuition: ["relations-intro", "inverse-relations", "reflexive-symmetric-transitive", "equivalence-relations", "reflexivity-check"],
  },
  'discrete-1-03': {
    intuition: ["induction-intro", "induction-inequality", "strong-induction", "sequences-intro", "sequence-formal", "sequence-sum-product"],
  },
  'discrete-1-04': {
     intuition: ["permutations-intro", "summation-rule", "inclusion-exclusion", "combinations-formula", "mississippi-counting"],
  },
  'discrete-1-08': {
    intuition: ["graph-theory-intro", "graph-properties", "vertex-degrees", "euler-paths"],
    math: ["discrete-outro"],
  },
  'graph-theory-intro': {
    intuition: ["graph-theory-intro", "graph-properties", "vertex-degrees", "euler-paths"],
  },
  'discrete-1-05': {
    intuition: ["mod-arithmetic", "infinite-primes"],
  },
  'discrete-1-06': {
    intuition: ["probability-intro", "probability-examples", "pin-code-probability", "triple-intersections", "probability-walkthrough", "conditional-probability", "conditional-prob-examples", "probability-tables", "bayes-simple", "bayes-false-positives", "bayes-disjoint-union", "chess-chance", "markov-chains-intro", "markov-matrices"],
  },
  'discrete-1-07': {
    intuition: ["recursive-sequences", "fibonacci-sequence"],
  },

  // Physics Chapter 0: Introduction
  'p0-001': { intuition: ['vb-motion-1d-1'] },
  'p0-003': { intuition: ['vb-motion-1d-2'] },
  'p0-004': { intuition: ['vb-motion-1d-7'] },
  'p0-005': { intuition: ['vb-motion-1d-3', 'vb-motion-1d-4', 'vb-motion-1d-5'] },
  'p0-006': { intuition: ['vb-vectors-1'] },
  'p0-007': { intuition: ['vb-relative-1'] },
  'p0-008': { intuition: ['ka-EKvHQc3QEow'] },

  // Physics Chapter 1: Vectors
  'p1-ch1-001': { intuition: ['vb-vectors-1'] },
  'p1-ch1-002': { intuition: ['vb-vectors-2'] },
  'p1-ch1-003': { intuition: ['vb-vectors-3', 'vb-vectors-4'] },
  'p1-ch1-004': { intuition: ['vb-vectors-5'] },
  'p1-ch1-005': { intuition: ['vb-vectors-6'] },
  'p1-ch1-006': { intuition: ['vb-vectors-7', 'vb-vectors-8'] },
  'p1-ch1-007': { intuition: ['vb-vectors-9'] },
  'p1-ch1-008': { intuition: ['vb-vectors-10'] },
  'p1-ch1-009': { intuition: ['vb-vectors-11'] },
  'p1-ch1-010': { intuition: ['vb-vectors-12'] },
  'p1-ch1-011': { intuition: ['vb-vectors-13', 'vb-vectors-14'] },
  'p1-ch1-012': { intuition: ['vb-vectors-12'] }, // Shared dot product concept
  'p1-ch1-013': { intuition: ['vb-vectors-15', 'vb-vectors-20'] },
  'p1-ch1-014': { intuition: ['vb-vectors-16'] },
  'p1-ch1-015': { intuition: ['vb-vectors-17', 'vb-vectors-18'] },
  'p1-ch1-016': { intuition: ['vb-vectors-16'] },
  'p1-ch1-017': { intuition: ['vb-vectors-19'] },

  // Physics Chapter 2: 1D Motion
  'p1-ch2-001': { intuition: ['vb-motion-1d-1'] },
  'p1-ch2-002': { intuition: ['vb-motion-1d-2'] },
  'p1-ch2-003': { intuition: ['vb-motion-1d-3'] },
  'p1-ch2-004': { intuition: ['vb-motion-1d-4'] },
  'p1-ch2-005': { intuition: ['vb-motion-1d-5'] },
  'p1-ch2-006': { intuition: ['vb-motion-1d-6'] },
  'p1-ch2-007': { intuition: ['vb-motion-1d-7'] },
  'p1-ch2-008': { intuition: ['vb-motion-1d-8'] },
  'p1-ch2-009': { intuition: ['vb-motion-1d-6'] },
  'p1-ch2-010': { intuition: ['vb-motion-1d-9', 'vb-motion-1d-10', 'vb-motion-1d-11'] },
  'p1-ch2-012': { intuition: ['vb-motion-1d-12', 'vb-motion-1d-13'] },
  'p1-ch2-013': { intuition: ['vb-motion-1d-13'] },
  'p1-ch2-014': { intuition: ['vb-motion-1d-13'] },
  'p1-ch2-015': { intuition: ['vb-motion-1d-14', 'vb-motion-1d-16'] },
  'p1-ch2-016': { intuition: ['vb-motion-1d-15', 'vb-motion-1d-17'] },
  'p1-ch2-017': { intuition: ['vb-motion-1d-18'] },
  'p1-ch2-019': { intuition: ['vb-motion-1d-19'] },
  'p1-ch2-020': { intuition: ['vb-motion-1d-20'] },
  'p1-ch2-021': { intuition: ['vb-motion-1d-21'] },
  'p1-ch2-022': { intuition: ['vb-motion-1d-22'] },

  // Physics Chapter 3: 2D Motion (Projectile & Circular)
  'p1-ch3-001': { intuition: ['vb-motion-2d-1'] },
  'p1-ch3-002': { intuition: ['vb-motion-2d-2', 'vb-motion-2d-3', 'vb-motion-2d-4'] },
  'p1-ch3-005': { intuition: ['vb-motion-2d-5', 'vb-motion-2d-6'] },
  'p1-ch3-010': { intuition: ['vb-motion-2d-10', 'vb-motion-2d-11'] },
  'p1-ch3-100': { intuition: ['vb-motion-2d-7', 'vb-motion-2d-8', 'vb-motion-2d-9', 'vb-motion-2d-12', 'vb-motion-2d-13', 'vb-motion-2d-14', 'vb-motion-2d-15'] },
  'p1-ch3-016': { intuition: ['vb-motion-2d-16', 'vb-motion-2d-17'] },
  'p1-ch3-018': { intuition: ['vb-motion-2d-18', 'vb-motion-2d-19'] },

  // Physics Chapter 4: Newton's Laws
  'p1-ch4-001': { intuition: ['vb-newton-1', 'vb-newton-5', 'vb-newton-6', 'vb-newton-7'] },
  'p1-ch4-002': { intuition: ['vb-newton-2', 'vb-newton-8', 'vb-newton-9', 'vb-newton-10', 'vb-newton-11', 'vb-newton-12'] },
  'p1-ch4-003': { intuition: ['vb-newton-3', 'vb-newton-13', 'vb-newton-14', 'vb-newton-15', 'vb-newton-16', 'vb-newton-17'] },
  'p1-ch4-004': { intuition: ['vb-newton-4', 'vb-fbd-incline-ex1'] },
  'p1-ch4-100': { intuition: ['vb-mechanics-app-1', 'vb-mechanics-app-6'] },
  'p1-ch4-200': { intuition: ['vb-newton-statics-1', 'vb-newton-statics-2', 'vb-newton-statics-3', 'vb-block-wall'] },
  'p1-ch4-300': { intuition: ['vb-mechanics-app-2', 'vb-mechanics-app-3', 'vb-mechanics-app-4', 'vb-mechanics-app-5', 'vb-mechanics-app-14', 'vb-incline-1', 'vb-incline-2'] },
  'p1-ch4-400': { intuition: ['vb-mechanics-app-10', 'vb-mechanics-app-11', 'vb-mechanics-app-13', 'vb-mechanics-app-16', 'vb-pulley-table-1', 'vb-pulley-table-2', 'vb-pulley-heavy-1', 'vb-pulley-heavy-2', 'vb-pulley-incline-1', 'vb-pulley-incline-2'] },
  'p1-ch4-500': { intuition: ['vb-circular-1', 'vb-circular-2', 'vb-circular-3', 'vb-circular-4', 'vb-circular-5', 'vb-circular-6', 'vb-circular-7', 'vb-circular-8', 'vb-circular-9', 'vb-circular-10'] },

  // Physics Chapter 5: Work & Energy
  'p1-ch5-001': { intuition: ['vb-energy-1', 'vb-energy-2', 'vb-energy-3', 'vb-energy-8', 'vb-energy-10'] },
  'p1-ch5-002': { intuition: ['vb-energy-1', 'vb-energy-2'] }, // Kinetic basics in intros
  'p1-ch5-003': { intuition: ['vb-energy-4', 'vb-energy-9'] }, // Springs as potential example
  'p1-ch5-004': { intuition: ['vb-cons-energy-1', 'vb-cons-energy-2', 'vb-cons-energy-3', 'vb-cons-energy-4', 'vb-cons-energy-5', 'vb-cons-energy-6', 'vb-cons-energy-7', 'vb-cons-energy-8', 'vb-cons-energy-9', 'vb-cons-energy-10'] },
  'p1-ch5-011': { intuition: ['vb-energy-11', 'vb-energy-12', 'vb-energy-13', 'vb-energy-14', 'vb-energy-15', 'vb-energy-16', 'vb-energy-17', 'vb-energy-18', 'vb-energy-19', 'vb-energy-20'] },
  'p1-ch5-100': { intuition: ['vb-energy-21', 'vb-energy-22', 'vb-energy-23', 'vb-energy-24', 'vb-energy-25', 'vb-energy-26'] },
  // Precalc 1 - Functions & Graphs
  'ch1-graphs-001': ['pre-1-1', 'pre-1-2', 'pre-1-3'],
  'ch1-graphs-002': ['pre-1-7'],
  'ch1-graphs-003': ['pre-1-5'],
  'ch1-graphs-004': ['pre-1-6'],
  'precalc1-04': ['pre-1-4'],
  'precalc1-09': ['pre-1-9'],
  'precalc1-10': ['pre-1-10'],

  // Precalc 2 - Algebra
  'ch1-algebra-003': ['pre-2-1'],
  'ch1-algebra-004': ['pre-2-6'],
  'ch1-algebra-005': ['pre-7-1', 'pre-7-2', 'pre-7-3'],
  'ch1-algebra-006': ['pre-2-4'],
  'ch1-algebra-007': ['pre-2-7', 'pre-7-5'],
  'ch2-alg-008': ['pre-7-6'],

  // Precalc 3 - Trig Foundations
  'angles-foundations': ['pre-4-1'],
  'triangle-geometry': ['pre-4-2'],
  'trig-ratios-right-triangles': ['pre-4-3'],
  'trig-any-angle': ['pre-4-4'],
  'graphing-trig-functions': ['pre-4-5', 'pre-4-6'],
  'inverse-trig-functions': ['pre-4-7'],
  'trig-applications': ['pre-4-8'],

  // Precalc 4 - Exponential & Log
  'exponential-functions': ['pre-3-1'],
  'logarithms-intro': ['pre-3-2'],
  'log-properties': ['pre-3-3'],
  'solving-exponential-log': ['pre-3-4'],
  'exponential-applications': ['pre-3-5'],

  // Precalc 5 - Polar & Vectors
  'vectors-2d': ['pre-6-3', 'pre-6-4'],
  'polar-coordinates-deep': ['pre-6-5'],
  'complex-polar-demoivre': ['pre-6-6'],

  // Geometry 1 - Foundations
  'geo-1-1': ['geo-3', 'geo-7', 'geo-11'],
  'geo-1-2': ['geo-15', 'geo-219', 'geo-215'],
  'geo-1-3': ['geo-19', 'geo-31', 'geo-51', 'geo-55'],

  // Geometry 2 - Logic & Proofs
  'geo-2-1': ['geo-35', 'geo-59', 'geo-63', 'geo-67'],
  'geo-2-2': ['geo-79', 'geo-83', 'geo-147'],
  'geo-2-3': ['geo-75', 'geo-151'],

  // Geometry 3 - Triangles
  'geo-3-1': ['geo-87', 'geo-91', 'geo-115', 'geo-119'],
  'geo-3-2': ['geo-95', 'geo-99', 'geo-103', 'geo-135', 'geo-139'],
  'geo-3-3': ['geo-107', 'geo-111'],

  // Geometry 4 - Polygons
  'geo-4-1': ['geo-163', 'geo-167', 'geo-227'],
  'geo-4-2': ['geo-171', 'geo-183', 'geo-191'],
  'geo-4-3': ['geo-175', 'geo-179', 'geo-187', 'geo-195'],

  // Geometry 5 - Similarity & Right Triangles
  'geo-5-1': ['geo-231', 'geo-235', 'geo-239', 'geo-243', 'geo-247', 'geo-251'],
  'geo-5-2': ['geo-255', 'geo-259', 'geo-263', 'geo-267'],
  'geo-5-3': ['geo-271', 'geo-275'],

  // Geometry 6 - Area, Volume & Circles
  'geo-6-1': ['geo-299', 'geo-303', 'geo-307', 'geo-311', 'geo-315', 'geo-319', 'geo-323', 'geo-327', 'geo-331', 'geo-335', 'geo-339', 'geo-343', 'geo-347', 'geo-351', 'geo-355'],
  'geo-6-2': ['geo-359', 'geo-363', 'geo-455', 'geo-459', 'geo-463', 'geo-467', 'geo-471', 'geo-479', 'geo-483', 'geo-487', 'geo-491'],
  'geo-6-3': ['geo-375', 'geo-379', 'geo-383', 'geo-387', 'geo-391', 'geo-395', 'geo-399', 'geo-403', 'geo-407', 'geo-411', 'geo-415', 'geo-419', 'geo-423', 'geo-427', 'geo-431', 'geo-435', 'geo-439', 'geo-443', 'geo-447', 'geo-451'],
  'geo-1-1': ["geo-v1","geo-v2","geo-v3","geo-v5","geo-v46","geo-v47","geo-v55","geo-v90","geo-v113","geo-v126"],
  'geo-1-2': ["geo-v7","geo-v10","geo-v11","geo-v14","geo-v15","geo-v18","geo-v19","geo-v23","geo-v30","geo-v33","geo-v34","geo-v35","geo-v37","geo-v53","geo-v54","geo-v65","geo-v66","geo-v115","geo-v124","geo-v129"],
  'geo-1-3': ["geo-v4","geo-v6","geo-v12","geo-v13","geo-v17","geo-v20","geo-v21","geo-v22","geo-v24","geo-v25","geo-v26","geo-v27","geo-v29","geo-v32","geo-v38","geo-v39","geo-v41","geo-v44","geo-v58","geo-v59","geo-v60","geo-v61","geo-v67","geo-v68","geo-v70","geo-v71","geo-v72","geo-v73","geo-v74","geo-v77","geo-v78","geo-v83","geo-v87","geo-v88","geo-v91","geo-v96","geo-v114","geo-v116","geo-v117","geo-v123","geo-v125"],
  'geo-2-1': ["geo-v8"],
  'geo-2-2': ["geo-v16","geo-v28","geo-v31","geo-v36","geo-v48","geo-v49","geo-v50","geo-v51","geo-v52","geo-v121"],
  'geo-2-3': ["geo-v43","geo-v80"],
  'geo-3-1': [],
  'geo-3-2': ["geo-v57","geo-v62"],
  'geo-3-3': ["geo-v45","geo-v69"],
  'geo-4-1': ["geo-v40","geo-v56","geo-v118"],
  'geo-4-2': ["geo-v42","geo-v81","geo-v85","geo-v86"],
  'geo-4-3': ["geo-v93"],
  'geo-5-1': ["geo-v103"],
  'geo-5-2': ["geo-v63","geo-v64"],
  'geo-5-3': [],
  'geo-6-1': ["geo-v9","geo-v75","geo-v76","geo-v79","geo-v82","geo-v84","geo-v89","geo-v92","geo-v95","geo-v98","geo-v99","geo-v100","geo-v102","geo-v105","geo-v106","geo-v108","geo-v110","geo-v112","geo-v127","geo-v128"],
  'geo-6-2': ["geo-v119","geo-v120","geo-v122","geo-v130","geo-v131"],
  'geo-6-3': ["geo-v94","geo-v97","geo-v101","geo-v104","geo-v107","geo-v109","geo-v111"],
};
