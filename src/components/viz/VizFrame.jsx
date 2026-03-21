import { lazy, Suspense, useState } from 'react'

const VIZ_REGISTRY = {
  NumberLine:               lazy(() => import('./d3/NumberLine.jsx')),
  FunctionMachine:          lazy(() => import('./d3/FunctionMachine.jsx')),
  FunctionPlotter:          lazy(() => import('./d3/FunctionPlotter.jsx')),
  UnitCircle:               lazy(() => import('./d3/UnitCircle.jsx')),
  ExponentialGrowth:        lazy(() => import('./d3/ExponentialGrowth.jsx')),
  LimitApproach:            lazy(() => import('./d3/LimitApproach.jsx')),
  SecantToTangent:          lazy(() => import('./d3/SecantToTangent.jsx')),
  EpsilonDelta:             lazy(() => import('./d3/EpsilonDelta.jsx')),
  SqueezeTheorem:           lazy(() => import('./d3/SqueezeTheorem.jsx')),
  ContinuityViz:            lazy(() => import('./d3/ContinuityViz.jsx')),
  RiemannSum:               lazy(() => import('./d3/RiemannSum.jsx')),
  PowerRulePattern:           lazy(() => import('./d3/PowerRulePattern.jsx')),
  CompositionVisualization:   lazy(() => import('./d3/CompositionVisualization.jsx')),
  SineCosineSlope:            lazy(() => import('./d3/SineCosineSlope.jsx')),
  ExponentialSlopeAtZero:     lazy(() => import('./d3/ExponentialSlopeAtZero.jsx')),
  ImplicitCurveExplorer:      lazy(() => import('./d3/ImplicitCurveExplorer.jsx')),
  PythagoreanProof:             lazy(() => import('./d3/PythagoreanProof.jsx')),
  CircleAreaProof:              lazy(() => import('./d3/CircleAreaProof.jsx')),
  TriangleAreaProof:            lazy(() => import('./d3/TriangleAreaProof.jsx')),
  ProjectileMotion:             lazy(() => import('./d3/ProjectileMotion.jsx')),
  PositionVelocityAcceleration: lazy(() => import('./d3/PositionVelocityAcceleration.jsx')),
  LimitRacingCar:               lazy(() => import('./d3/LimitRacingCar.jsx')),
  DifferentiationRulesDemo:     lazy(() => import('./d3/DifferentiationRulesDemo.jsx')),
  TangentLineConstructor:       lazy(() => import('./d3/TangentLineConstructor.jsx')),
  TangentToImplicitCurve:       lazy(() => import('./d3/TangentToImplicitCurve.jsx')),
  SineUnwrap:                   lazy(() => import('./d3/SineUnwrap.jsx')),
  ProductRuleRectangle:         lazy(() => import('./d3/ProductRuleRectangle.jsx')),
  SlopeField:                   lazy(() => import('./d3/SlopeField.jsx')),
  TangentPlane3D:               lazy(() => import('./three/TangentPlane3D.jsx')),
  ParametricCurve3D:            lazy(() => import('./three/ParametricCurve3D.jsx')),
  // Chapter 0 — Pre-Calc additions
  TransformationExplorer:       lazy(() => import('./d3/TransformationExplorer.jsx')),
  GraphMorph:                   lazy(() => import('./d3/GraphMorph.jsx')),
  // Chapter 1 — Limits additions
  TwoSidedLimit:                lazy(() => import('./d3/TwoSidedLimit.jsx')),
  HoleVsValue:                  lazy(() => import('./d3/HoleVsValue.jsx')),
  OscillationViz:               lazy(() => import('./d3/OscillationViz.jsx')),
  // Chapter 2 — Derivatives additions
  DerivativeBuilder:            lazy(() => import('./d3/DerivativeBuilder.jsx')),
  // Chapter 3 — Applications of Derivatives
  NewtonsMethod:                lazy(() => import('./d3/NewtonsMethod.jsx')),
  SpringOscillation:            lazy(() => import('./d3/SpringOscillation.jsx')),
  RelatedRatesLadder:           lazy(() => import('./d3/RelatedRatesLadder.jsx')),
  LinearApproximation:          lazy(() => import('./d3/LinearApproximation.jsx')),
  MVTViz:                       lazy(() => import('./d3/MVTViz.jsx')),
  CurveSketchingBoard:          lazy(() => import('./d3/CurveSketchingBoard.jsx')),
  OptimizationViz:              lazy(() => import('./d3/OptimizationViz.jsx')),
  LHopitalViz:                  lazy(() => import('./d3/LHopitalViz.jsx')),
}

function VizSkeleton() {
  return (
    <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg h-64 flex items-center justify-center">
      <span className="text-slate-400 dark:text-slate-500 text-sm">Loading visualization…</span>
    </div>
  )
}

export default function VizFrame({ id, initialProps = {}, title }) {
  const [params, setParams] = useState(initialProps)
  const VizComponent = VIZ_REGISTRY[id]

  if (!VizComponent) return null

  return (
    <div className="viz-frame">
      {title && (
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">{title}</p>
      )}
      <Suspense fallback={<VizSkeleton />}>
        <VizComponent params={params} onParamChange={setParams} />
      </Suspense>
    </div>
  )
}
