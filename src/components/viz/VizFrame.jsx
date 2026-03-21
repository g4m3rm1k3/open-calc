import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

const VIZ_REGISTRY = {
  NumberLine:               lazy(() => import('./d3/NumberLine.jsx')),
  FunctionMachine:          lazy(() => import('./d3/FunctionMachine.jsx')),
  FunctionPlotter:          lazy(() => import('./d3/FunctionPlotter.jsx')),
  UnitCircle:               lazy(() => import('./d3/UnitCircle.jsx')),
  ExponentialGrowth:        lazy(() => import('./d3/ExponentialGrowth.jsx')),
  LimitApproach:            lazy(() => import('./d3/LimitApproach.jsx')),
  SecantToTangent:          lazy(() => import('./d3/SecantToTangent.jsx')),
  EpsilonDelta:             lazy(() => import('./d3/EpsilonDelta.jsx')),
  GraphicalEpsilonDelta:    lazy(() => import('./d3/EpsilonDelta.jsx')),
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
  ArcChordLimit:                lazy(() => import('./d3/ArcChordLimit.jsx')),
  ProductRuleRectangle:         lazy(() => import('./d3/ProductRuleRectangle.jsx')),
  SlopeField:                   lazy(() => import('./d3/SlopeField.jsx')),
  TangentPlane3D:               lazy(() => import('./three/TangentPlane3D.jsx')),
  ParametricCurve3D:            lazy(() => import('./three/ParametricCurve3D.jsx')),
  // Chapter 0 — Pre-Calc additions
  MotionTracer:                 lazy(() => import('./d3/MotionTracer.jsx')),
  TransformationExplorer:       lazy(() => import('./d3/TransformationExplorer.jsx')),
  GraphMorph:                   lazy(() => import('./d3/GraphMorph.jsx')),
  // Chapter 1 — Physics examples
  ShrinkingInterval:            lazy(() => import('./d3/ShrinkingInterval.jsx')),
  // Chapter 2 — Physics examples
  VerticalThrow:                lazy(() => import('./d3/VerticalThrow.jsx')),
  // Chapter 1 — Limits additions
  ZenoParadoxViz:               lazy(() => import('./d3/ZenoParadoxViz.jsx')),
  TwoSidedLimit:                lazy(() => import('./d3/TwoSidedLimit.jsx')),
  HoleVsValue:                  lazy(() => import('./d3/HoleVsValue.jsx')),
  OscillationViz:               lazy(() => import('./d3/OscillationViz.jsx')),
  DeltaMinSelector:             lazy(() => import('./d3/DeltaMinSelector.jsx')),
  // Chapter 2 — Derivatives additions
  DerivativeBuilder:            lazy(() => import('./d3/DerivativeBuilder.jsx')),
  // Chapter 4 — Integration
  AreaAccumulator:              lazy(() => import('./d3/AreaAccumulator.jsx')),
  FTCLink:                      lazy(() => import('./d3/FTCLink.jsx')),
  WaterTank:                    lazy(() => import('./d3/WaterTank.jsx')),
  SignedArea:                   lazy(() => import('./d3/SignedArea.jsx')),
  AreaBetweenCurves:            lazy(() => import('./d3/AreaBetweenCurves.jsx')),
  IntegrationMethodLab:         lazy(() => import('./d3/IntegrationMethodLab.jsx')),
  // Chapter 3 — Applications of Derivatives
  NewtonsMethod:                lazy(() => import('./d3/NewtonsMethod.jsx')),
  SpringOscillation:            lazy(() => import('./d3/SpringOscillation.jsx')),
  RelatedRatesLadder:           lazy(() => import('./d3/RelatedRatesLadder.jsx')),
  LinearApproximation:          lazy(() => import('./d3/LinearApproximation.jsx')),
  MVTViz:                       lazy(() => import('./d3/MVTViz.jsx')),
  CurveSketchingBoard:          lazy(() => import('./d3/CurveSketchingBoard.jsx')),
  SignChartBuilder:             lazy(() => import('./d3/SignChartBuilder.jsx')),
  ChainRulePeeler:              lazy(() => import('./react/ChainRulePeeler.jsx')),
  PolynomialScrubber:           lazy(() => import('./d3/PolynomialScrubber.jsx')),
  PolarCoordinateMorph:         lazy(() => import('./d3/PolarCoordinateMorph.jsx')),
  ChainRuleMicroscope:          lazy(() => import('./d3/ChainRuleMicroscope.jsx')),
  TrigDerivativeSync:           lazy(() => import('./d3/TrigDerivativeSync.jsx')),
  TriangleInequalityViz:        lazy(() => import('./d3/TriangleInequalityViz.jsx')),
  OptimizationViz:              lazy(() => import('./d3/OptimizationViz.jsx')),
  LHopitalViz:                  lazy(() => import('./d3/LHopitalViz.jsx')),
  // Chapter 5 — Sequences & Series
  TaylorApproximation:           lazy(() => import('./d3/TaylorApproximation.jsx')),
  ConvergenceViz:                lazy(() => import('./d3/ConvergenceViz.jsx')),
  SeriesConvergenceLab:          lazy(() => import('./d3/SeriesConvergenceLab.jsx')),
  // Chapter 2 — Additions
  DualGraphSync:                 lazy(() => import('./react/DualGraphSync.jsx')),
  PascalsTriangle:               lazy(() => import('./react/PascalsTriangle.jsx')),
  // Chapter 4 — Volumes of Revolution
  VolumesOfRevolution:           lazy(() => import('./d3/VolumesOfRevolution.jsx')),
  // Chapter 6 — Polar & Parametric
  PolarCurve:                    lazy(() => import('./d3/PolarCurve.jsx')),
  VectorKinematicsLab:           lazy(() => import('./d3/VectorKinematicsLab.jsx')),
  FourierSeries:                 lazy(() => import('./d3/FourierSeries.jsx')),
  GradientDescentLoss:           lazy(() => import('./d3/GradientDescentLoss.jsx')),
  PoiseuilleBloodFlow:           lazy(() => import('./d3/PoiseuilleBloodFlow.jsx')),
  // Chapter 2 — Higher-order derivatives & trig intuition
  DerivativeCycleClock:          lazy(() => import('./d3/DerivativeCycleClock.jsx')),
  TangentExplosion:              lazy(() => import('./d3/TangentExplosion.jsx')),
  // Chapter 5 — New additions
  BisectionMethod:               lazy(() => import('./d3/BisectionMethod.jsx')),
  ShellMethod:                   lazy(() => import('./d3/ShellMethod.jsx')),
  ArcLengthViz:                  lazy(() => import('./d3/ArcLengthViz.jsx')),
  CentroidViz:                   lazy(() => import('./d3/CentroidViz.jsx')),
  SequenceViz:                   lazy(() => import('./d3/SequenceViz.jsx')),
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
  const [isExpanded, setIsExpanded] = useState(false)
  const VizComponent = VIZ_REGISTRY[id]
  const initialPropsKey = useMemo(() => JSON.stringify(initialProps ?? {}), [initialProps])

  useEffect(() => {
    setParams(initialProps ?? {})
  }, [id, initialPropsKey])

  if (!VizComponent) return null

  const content = (
    <Suspense fallback={<VizSkeleton />}>
      <VizComponent params={params} onParamChange={setParams} />
    </Suspense>
  )

  if (isExpanded) {
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
         <div className="w-full max-w-[95vw] sm:max-w-[90vw] h-[95vh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-[#0f172a] shadow-2xl rounded-2xl overflow-hidden relative border border-slate-700">
            {/* Header / Nav inside bounded container */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
               <h2 className="text-xl font-bold truncate pr-4">{title || 'Interactive Visualizer'}</h2>
               <button 
                  onClick={() => setIsExpanded(false)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-4 rounded shadow transition-colors flex-shrink-0"
               >
                 Close
               </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 w-full flex items-center justify-center">
               <div className="w-full max-w-5xl bg-white dark:bg-[#0f172a] rounded-xl">
                   {content}
               </div>
            </div>
         </div>
      </div>,
      document.body
    )
  }

  return (
    <div className="viz-frame relative group w-full max-w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-xl">
      {title && (
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 px-2 pt-2">{title}</p>
      )}
      <button 
         onClick={() => setIsExpanded(true)}
         title="Expand to Full Width"
         className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-2 py-1 flex items-center gap-1 text-xs font-bold rounded shadow-md border border-slate-600 hover:bg-brand-500 hover:border-brand-400"
      >
        <span>⛶</span> Expand
      </button>
      <div className="p-2">
        {content}
      </div>
    </div>
  )
}
