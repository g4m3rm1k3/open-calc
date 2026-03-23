import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { usePins } from '../../context/PinsContext.jsx'
const VIZ_REGISTRY = {
  VideoEmbed:               lazy(() => import('./react/VideoEmbed.jsx')),
  VideoCarousel:            lazy(() => import('./react/VideoCarousel.jsx')),
  NumberLine:               lazy(() => import('./d3/NumberLine.jsx')),
  FunctionMachine:          lazy(() => import('./d3/FunctionMachine.jsx')),
  FunctionPlotter:          lazy(() => import('./d3/FunctionPlotter.jsx')),
  UnitCircle:               lazy(() => import('./d3/UnitCircle.jsx')),
  UnitCircleMirror:         lazy(() => import('./d3/UnitCircleMirror.jsx')),
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
  TrigDerivativeGeometric:      lazy(() => import('./d3/TrigDerivativeGeometric.jsx')),
  ExpLogBridgeLab:              lazy(() => import('./react/ExpLogBridgeLab.jsx')),
  ExpLogGeometricProof:         lazy(() => import('./d3/ExpLogGeometricProof.jsx')),
  FTCGeometricProof:            lazy(() => import('./d3/FTCGeometricProof.jsx')),
  SqueezeTrigGeometric:         lazy(() => import('./d3/SqueezeTrigGeometric.jsx')),
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
  SinDerivativeGeometric:        lazy(() => import('./d3/SinDerivativeGeometric.jsx')),
  LimitGeometric:                lazy(() => import('./d3/LimitGeometric.jsx')),
  // Physics p0 - Orientation
  ModelVsReality:                lazy(() => import('./react/ModelVsReality.jsx')),
  UnitValidator:                 lazy(() => import('./react/UnitValidator.jsx')),
  GraphInterpreter:              lazy(() => import('./react/GraphInterpreter.jsx')),
  VectorBuilder:                 lazy(() => import('./react/VectorBuilder.jsx')),
  FrameSwitcher:                 lazy(() => import('./react/FrameSwitcher.jsx')),
  DiscreteVsContinuous:          lazy(() => import('./react/DiscreteVsContinuous.jsx')),
  VelocityComparison:            lazy(() => import('./react/VelocityComparison.jsx')),
  LocalLinearityZoom:            lazy(() => import('./react/LocalLinearityZoom.jsx')),
  SplitScreenLimitSync:          lazy(() => import('./react/SplitScreenLimitSync.jsx')),
  SpaceTimeRibbon:               lazy(() => import('./react/SpaceTimeRibbon.jsx')),
  BrakeOrCrashSim:               lazy(() => import('./react/BrakeOrCrashSim.jsx')),
  MasterLimitGraph:              lazy(() => import('./react/MasterLimitGraph.jsx')),
  // Chapter 5 — New additions
  BisectionMethod:               lazy(() => import('./d3/BisectionMethod.jsx')),
  ShellMethod:                   lazy(() => import('./d3/ShellMethod.jsx')),
  ArcLengthViz:                  lazy(() => import('./d3/ArcLengthViz.jsx')),
  CentroidViz:                   lazy(() => import('./d3/CentroidViz.jsx')),
  SequenceViz:                   lazy(() => import('./d3/SequenceViz.jsx')),
  // Course: Discrete Math
  PigeonholeViz:                 lazy(() => import('./react/PigeonholeViz.jsx')),
  TruthTableLab:                 lazy(() => import('./react/TruthTableLab.jsx')),
  DiscreteDependencyMap:         lazy(() => import('./react/DiscreteDependencyMap.jsx')),
  ModClockViz:                   lazy(() => import('./react/ModClockViz.jsx')),
  CardDiceLab:                   lazy(() => import('./react/CardDiceLab.jsx')),
  GraphTraversalGame:            lazy(() => import('./react/GraphTraversalGame.jsx')),
  DFAChallengeGame:              lazy(() => import('./react/DFAChallengeGame.jsx')),
  RecurrenceExplorer:            lazy(() => import('./d3/RecurrenceExplorer.jsx')),
  BayesGridLab:                  lazy(() => import('./d3/BayesGridLab.jsx')),
  ComplexityLab:                 lazy(() => import('./d3/ComplexityLab.jsx')),
  GraphNetwork3D:                lazy(() => import('./three/GraphNetwork3D.jsx')),
  TruthCube3D:                   lazy(() => import('./react/TruthCube3D.jsx')),
  LogicGateSim:                  lazy(() => import('./react/LogicGateSim.jsx')),
  VennDiagram:                   lazy(() => import('./react/VennDiagram.jsx')),
  QuantifierGridLab:             lazy(() => import('./react/QuantifierGridLab.jsx')),
  BipartiteQuantifierViz:        lazy(() => import('./react/BipartiteQuantifierViz.jsx')),
  DomainExplorerLab:             lazy(() => import('./react/DomainExplorerLab.jsx')),
  FunctionMappingLab:            lazy(() => import('./react/FunctionMappingLab.jsx')),
  SetExplorer:                   lazy(() => import('./react/SetExplorer.jsx')),
  PowerSetTreeLab:               lazy(() => import('./react/PowerSetTreeLab.jsx')),
  CartesianGridLab:              lazy(() => import('./react/CartesianGridLab.jsx')),
  FunctionCompositionLab:        lazy(() => import('./react/FunctionCompositionLab.jsx')),
  SetBuilderDecoderLab:          lazy(() => import('./react/SetBuilderDecoderLab.jsx')),
  HorizontalLineTestLab:         lazy(() => import('./react/HorizontalLineTestLab.jsx')),
  SetProofVisualizer:            lazy(() => import('./react/SetProofVisualizer.jsx')),
  RelationMatrixLab:             lazy(() => import('./react/RelationMatrixLab.jsx')),
  ModuloPartitionLab:            lazy(() => import('./react/ModuloPartitionLab.jsx')),
  HasseTransformerLab:           lazy(() => import('./react/HasseTransformerLab.jsx')),
  EquivalenceDecoderLab:         lazy(() => import('./react/EquivalenceDecoderLab.jsx')),
  DominoInductionLab:            lazy(() => import('./react/DominoInductionLab.jsx')),
  RecursiveStackLab:             lazy(() => import('./react/RecursiveStackLab.jsx')),
  InductionAlgebraDecoderLab:    lazy(() => import('./react/InductionAlgebraDecoderLab.jsx')),
  SigmaDecoderLab:               lazy(() => import('./react/SigmaDecoderLab.jsx')),
  StrongInductionWallLab:        lazy(() => import('./react/StrongInductionWallLab.jsx')),
  CombinationVsPermutationLab:   lazy(() => import('./react/CombinationVsPermutationLab.jsx')),
  HandshakeCliqueLab:            lazy(() => import('./react/HandshakeCliqueLab.jsx')),
  CountingTreeLab:               lazy(() => import('./react/CountingTreeLab.jsx')),
  PascalsTriangleLab:            lazy(() => import('./react/PascalsTriangleLab.jsx')),
  StarsAndBarsLab:               lazy(() => import('./react/StarsAndBarsLab.jsx')),
  RadianDegreeLimitLab:          lazy(() => import('./react/RadianDegreeLimitLab.jsx')),
  AreaSqueezeLab:                lazy(() => import('./react/AreaSqueezeLab.jsx')),
  AlgebraicSqueezeWalkthrough:   lazy(() => import('./react/AlgebraicSqueezeWalkthrough.jsx')),
  ConjugateVisualizer:           lazy(() => import('./react/ConjugateVisualizer.jsx')),
  SmallAnglePendulumLab:         lazy(() => import('./react/SmallAnglePendulumLab.jsx')),
  CosGapVisualizer:              lazy(() => import('./react/CosGapVisualizer.jsx')),
  VelocityVectorProofLab:        lazy(() => import('./react/VelocityVectorProofLab.jsx')),
  CoDirectionCompass:            lazy(() => import('./react/CoDirectionCompass.jsx')),
  NestedTrigMachine:             lazy(() => import('./react/NestedTrigMachine.jsx')),
  QuotientRuleTanBuilder:        lazy(() => import('./react/QuotientRuleTanBuilder.jsx')),
  SineAdditionProofBuilder:      lazy(() => import('./react/SineAdditionProofBuilder.jsx')),
  InverseBridgeTriangleLab:      lazy(() => import('./react/InverseBridgeTriangleLab.jsx')),
  InterlockingGearsViz:          lazy(() => import('./react/InterlockingGearsViz.jsx')),
  ChainRuleOnionLab:             lazy(() => import('./react/ChainRuleOnionLab.jsx')),
  ProofCircleLinkLab:            lazy(() => import('./react/ProofCircleLinkLab.jsx')),
  LayerScanGame:                 lazy(() => import('./react/LayerScanGame.jsx')),
  ChainRulePipelineLab:          lazy(() => import('./react/ChainRulePipelineLab.jsx')),
  LeibnizUnitTrackerLab:         lazy(() => import('./react/LeibnizUnitTrackerLab.jsx')),
  ChainRuleProofMapLab:          lazy(() => import('./react/ChainRuleProofMapLab.jsx')),
  DeepProofSolver:               lazy(() => import('./react/DeepProofSolver.jsx')),
  ImplicitDiffProof:             lazy(() => import('./react/ImplicitDiffProof.jsx')),
  RecursiveProofStepper:         lazy(() => import('./react/RecursiveProofStepper.jsx')),
  BrokenChainTrapLab:            lazy(() => import('./react/BrokenChainTrapLab.jsx')),
  LimitBridgeLab:                lazy(() => import('./react/LimitBridgeLab.jsx')),
  ContinuityRepairGame:          lazy(() => import('./react/ContinuityRepairGame.jsx')),
  ChainRuleAssemblerGame:        lazy(() => import('./react/ChainRuleAssemblerGame.jsx')),
  ImplicitTangentPlayground:     lazy(() => import('./react/ImplicitTangentPlayground.jsx')),
  TrigMotionBridgeLab:           lazy(() => import('./react/TrigMotionBridgeLab.jsx')),
  DerivativeRuleArenaGame:       lazy(() => import('./react/DerivativeRuleArenaGame.jsx')),
  // Chapter 2 — Inverse functions & differentiability
  InverseSlopeReflectionLab:     lazy(() => import('./react/InverseSlopeReflectionLab.jsx')),
  ArcTanDerivationLab:           lazy(() => import('./react/ArcTanDerivationLab.jsx')),
  AbsoluteValueDiffViz:          lazy(() => import('./react/AbsoluteValueDiffViz.jsx')),
  // Chapter 2 — Reading derivatives game
  SketchDerivativeGame:          lazy(() => import('./react/SketchDerivativeGame.jsx')),
  // Precalc — Algebra (contributed components)
  FactoringAreaViz:      lazy(() => import('./d3/FactoringAreaViz.jsx')),
  CompleteSquareViz:     lazy(() => import('./d3/CompleteSquareViz.jsx')),
  ComplexPlaneViz:       lazy(() => import('./d3/ComplexPlaneViz.jsx')),
  PartialFractionViz:    lazy(() => import('./d3/PartialFractionViz.jsx')),
  SignChartViz:          lazy(() => import('./d3/SignChartViz.jsx')),
  SystemsGeometryViz:    lazy(() => import('./d3/SystemsGeometryViz.jsx')),
  // Chapter 1 — Rate of change & modeling
  RateOfChangeViz:       lazy(() => import('./d3/RateOfChangeViz.jsx')),
  FunctionModelingViz:   lazy(() => import('./d3/FunctionModelingViz.jsx')),
  // Chapter 2 — Polynomial division
  PolynomialDivisionViz: lazy(() => import('./react/PolynomialDivisionViz.jsx')),
  // Alias: NumberLine already exists, expose as NumberLineViz for algebra lessons
  NumberLineViz:         lazy(() => import('./d3/NumberLine.jsx')),
  // Precalc — Functions & Graphs (contributed components)
  CartesianFoundationsViz:       lazy(() => import('./d3/CartesianFoundationsViz.jsx')),
  TransformationBuilderViz:      lazy(() => import('./d3/TransformationBuilderViz.jsx')),
  RootMultiplicityViz:           lazy(() => import('./d3/RootMultiplicityViz.jsx')),
  FunctionBehaviourViz:          lazy(() => import('./d3/FunctionBehaviourViz.jsx')),
  PolarCartesianViz:             lazy(() => import('./d3/PolarCartesianViz.jsx')),
  // Precalc — stub aliases (same-topic components until dedicated viz are built)
  ZerosAndInterceptsViz:         lazy(() => import('./d3/CartesianFoundationsViz.jsx')),
  EvenOddSymmetryViz:            lazy(() => import('./d3/TransformationBuilderViz.jsx')),
  InverseFunctionViz:            lazy(() => import('./d3/TransformationBuilderViz.jsx')),
  AsymptoteTypesViz:             lazy(() => import('./d3/FunctionBehaviourViz.jsx')),
  RationalSketchViz:             lazy(() => import('./d3/FunctionBehaviourViz.jsx')),
  Vectors3DViz:                  lazy(() => import('./d3/PolarCartesianViz.jsx')),
  // Contribution files — new viz components
  TangentLineViz:                lazy(() => import('./d3/TangentLineViz.jsx')),
  PythagoreanViz:                lazy(() => import('./d3/PythagoreanViz.jsx')),
  GraphExplorerViz:              lazy(() => import('./d3/GraphExplorerViz.jsx')),
  // Contribution files — aliases to closest existing components
  LimitApproachViz:              lazy(() => import('./d3/LimitApproach.jsx')),
  EpsilonDeltaViz:               lazy(() => import('./d3/EpsilonDelta.jsx')),
  DerivativeFromFirstPrinciplesViz: lazy(() => import('./d3/TangentLineConstructor.jsx')),
  CircleUnrollViz:               lazy(() => import('./d3/CircleAreaProof.jsx')),
  TriangleAreaViz:               lazy(() => import('./d3/TriangleAreaProof.jsx')),
  AlgebraSquareViz:              lazy(() => import('./d3/PythagoreanProof.jsx')),
  TruthTableViz:                 lazy(() => import('./react/TruthTableLab.jsx')),
  // Precalc 3 — Trig identities
  UnitCircleIdentityViz:         lazy(() => import('./d3/UnitCircleIdentityViz.jsx')),
  DoubleAngleViz:                lazy(() => import('./d3/DoubleAngleViz.jsx')),
  AngleAdditionProofViz:         lazy(() => import('./d3/AngleAdditionProofViz.jsx')),
  PowerReductionViz:             lazy(() => import('./d3/PowerReductionViz.jsx')),
  // Precalc 3 — Trig in calculus
  TrigSubstitutionViz:           lazy(() => import('./d3/TrigSubstitutionViz.jsx')),
  TrigIntegrationStrategyViz:    lazy(() => import('./react/TrigIntegrationStrategyViz.jsx')),
  // Precalc 3 — Logarithms
  LogAsAreaViz:                  lazy(() => import('./d3/LogAsAreaViz.jsx')),
  LogLawsViz:                    lazy(() => import('./d3/LogLawsViz.jsx')),
  // Precalc 3 — Inverse trig
  InverseTrigViz:                lazy(() => import('./d3/InverseTrigViz.jsx')),
  // Precalc 3 — Applications
  SinusoidalModelViz:            lazy(() => import('./d3/SinusoidalModelViz.jsx')),

  // Precalc 3 — Trig foundations (angles, triangles, ratios, graphs, solving)
  AngleMeasurementViz:   lazy(() => import('./d3/AngleMeasurementViz.jsx')),
  TriangleGeometryViz:   lazy(() => import('./d3/TriangleGeometryViz.jsx')),
  TrigRatiosViz:         lazy(() => import('./d3/TrigRatiosViz.jsx')),
  UnitCircleFullViz:     lazy(() => import('./d3/UnitCircleFullViz.jsx')),
  SixTrigGraphsViz:      lazy(() => import('./d3/SixTrigGraphsViz.jsx')),
  LawOfSinesViz:         lazy(() => import('./d3/LawOfSinesViz.jsx')),
  SSAAmbiguousViz:       lazy(() => import('./d3/SSAAmbiguousViz.jsx')),
  // Chain Rule vizzes
  ChainRuleCompositionViz:  lazy(() => import('./d3/ChainRuleCompositionViz.jsx')),
  ChainRuleZoomViz:         lazy(() => import('./d3/ChainRuleZoomViz.jsx')),
  ChainRuleRatesViz:        lazy(() => import('./d3/ChainRuleRatesViz.jsx')),
  ChainRuleLimitBridgeViz:  lazy(() => import('./react/ChainRuleLimitBridgeViz.jsx')),
  ChainRulePracticeViz:     lazy(() => import('./react/ChainRulePracticeViz.jsx')),
  ChainRuleLimitBridgeViz2: lazy(() => import('./react/ChainRuleLimitBridgeViz2.jsx')),
  ChainRulePracticeViz2:    lazy(() => import('./react/ChainRulePracticeViz2.jsx')),
  ProductPowerChainRuleViz: lazy(() => import('./react/ProductPowerChainRuleViz.jsx')),
  // Precalc-5 — polar, complex, vectors
  PolarConversionViz:       lazy(() => import('./d3/PolarConversionViz.jsx')),
  ComplexPolarViz:          lazy(() => import('./d3/ComplexPolarViz.jsx')),
  VectorOperationsViz:      lazy(() => import('./d3/VectorVizzes.jsx').then(m => ({ default: m.VectorOperationsViz }))),
  DotProductViz:            lazy(() => import('./d3/VectorVizzes.jsx').then(m => ({ default: m.DotProductViz }))),
  // Precalc-4 — exponential & log vizzes
  ExponentialGraphViz:   lazy(() => import('./d3/ExponentialGraphViz.jsx')),
  GrowthDecayViz:        lazy(() => import('./d3/GrowthDecayViz.jsx')),
  LogGraphViz:           lazy(() => import('./d3/LogGraphViz.jsx')),
  LogPropertiesViz:      lazy(() => import('./d3/LogPropertiesViz.jsx')),
  ExpLogSolverViz:       lazy(() => import('./d3/ExpLogSolverViz.jsx')),
  // ─── Physics Chapter 1: Vectors ─────────────────────────────────────────────
  // Lesson 1: What Is a Vector? (P1-P5)
  VectorArrowIntuition:        lazy(() => import('./react/VectorArrowIntuition.jsx')),
  VectorEqualityProof:         lazy(() => import('./react/VectorEqualityProof.jsx')),
  VectorPatternSpotter:        lazy(() => import('./react/VectorPatternSpotter.jsx')),
  VectorComponentDecomposer:   lazy(() => import('./react/VectorComponentDecomposer.jsx')),
  VectorFormRecogniser:        lazy(() => import('./react/VectorFormRecogniser.jsx')),

  // Lesson 2: Vector Notation (P1-P5)
  NotationGallery:             lazy(() => import('./react/NotationGallery.jsx')),
  BasisVectorProof:            lazy(() => import('./react/BasisVectorProof.jsx')),
  NotationPatternSpotter:      lazy(() => import('./react/NotationPatternSpotter.jsx')),
  UnitVectorBuilder:           lazy(() => import('./react/UnitVectorBuilder.jsx')),
  NotationFormRecogniser:      lazy(() => import('./react/NotationFormRecogniser.jsx')),

  // Lesson 3: Components and Magnitudes (P1-P5)
  ComponentDecomposerLive:     lazy(() => import('./react/ComponentDecomposerLive.jsx')),
  ComponentDerivationProof:    lazy(() => import('./react/ComponentDerivationProof.jsx')),
  ComponentPatternSpotter:     lazy(() => import('./react/ComponentPatternSpotter.jsx')),
  ComponentConversionExplorer: lazy(() => import('./react/ComponentConversionExplorer.jsx')),
  ComponentFormRecogniser:     lazy(() => import('./react/ComponentFormRecogniser.jsx')),

  // Lesson 4: Adding Vectors — Parallelogram (P1-P5)
  ParallelogramIntuition:      lazy(() => import('./react/ParallelogramIntuition.jsx')),
  ParallelogramProof:          lazy(() => import('./react/ParallelogramProof.jsx')),
  ParallelogramPatternSpotter: lazy(() => import('./react/ParallelogramPatternSpotter.jsx')),
  ParallelogramAngleExplorer:  lazy(() => import('./react/ParallelogramAngleExplorer.jsx')),
  ParallelogramFormRecogniser: lazy(() => import('./react/ParallelogramFormRecogniser.jsx')),

  // Lesson 5: Adding Vectors — Tip-to-Toe (P1-P5)
  TipToToeIntuition:           lazy(() => import('./react/TipToToeIntuition.jsx')),
  TipToToeProof:               lazy(() => import('./react/TipToToeProof.jsx')),
  TipToToePatternSpotter:      lazy(() => import('./react/TipToToePatternSpotter.jsx')),
  TipToToeOrderProof:          lazy(() => import('./react/TipToToeOrderProof.jsx')),
  TipToToeFormRecogniser:      lazy(() => import('./react/TipToToeFormRecogniser.jsx')),

  // Lesson 6: Adding Vectors Numerically (P1-P5)
  NumericalAdditionWalkthrough: lazy(() => import('./react/NumericalAdditionWalkthrough.jsx')),
  NumericalMethodProof:         lazy(() => import('./react/NumericalMethodProof.jsx')),
  NumericalPatternSpotter:      lazy(() => import('./react/NumericalPatternSpotter.jsx')),
  NumericalAdditionTable:       lazy(() => import('./react/NumericalAdditionTable.jsx')),
  NumericalFormRecogniser:      lazy(() => import('./react/NumericalFormRecogniser.jsx')),

  // Lesson 7: Subtracting Vectors Graphically (P1-P5)
  SubtractionIntuition:        lazy(() => import('./react/SubtractionIntuition.jsx')),
  SubtractionProof:            lazy(() => import('./react/SubtractionProof.jsx')),
  SubtractionPatternSpotter:   lazy(() => import('./react/SubtractionPatternSpotter.jsx')),
  SubtractionDeltaV:           lazy(() => import('./react/SubtractionDeltaV.jsx')),
  SubtractionFormRecogniser:   lazy(() => import('./react/SubtractionFormRecogniser.jsx')),

  // Lesson 8: Subtracting Vectors Numerically (P1-P5)
  NumericalSubtractionWalkthrough: lazy(() => import('./react/NumericalSubtractionWalkthrough.jsx')),
  SubtractionNumericalProof:       lazy(() => import('./react/SubtractionNumericalProof.jsx')),
  SubtractionNumericalPatternSpotter: lazy(() => import('./react/SubtractionNumericalPatternSpotter.jsx')),
  SubtractionComponentTable:       lazy(() => import('./react/SubtractionComponentTable.jsx')),
  SubtractionNumericalFormRecogniser: lazy(() => import('./react/SubtractionNumericalFormRecogniser.jsx')),

  // Lesson 9: Adding Force Vectors (P1-P5)
  ForceVectorIntuition:        lazy(() => import('./react/ForceVectorIntuition.jsx')),
  ForceProof:                  lazy(() => import('./react/ForceProof.jsx')),
  ForcePatternSpotter:         lazy(() => import('./react/ForcePatternSpotter.jsx')),
  ForceComponentTable:         lazy(() => import('./react/ForceComponentTable.jsx')),
  ForceFormRecogniser:         lazy(() => import('./react/ForceFormRecogniser.jsx')),

  // Lessons 10–13: Dot Product
  DotProductIntuition:         lazy(() => import('./react/DotProductIntuition.jsx')),
  DotProductExampleIntuition:  lazy(() => import('./react/DotProductExampleIntuition.jsx')),
  OrthogonalityIntuition:      lazy(() => import('./react/OrthogonalityIntuition.jsx')),
  AngleBetweenIntuition:       lazy(() => import('./react/AngleBetweenIntuition.jsx')),
  DotProductProof:             lazy(() => import('./react/DotProductProof.jsx')),
  DotProductPatternSpotter:    lazy(() => import('./react/DotProductPatternSpotter.jsx')),
  OrthogonalityPatternSpotter: lazy(() => import('./react/OrthogonalityPatternSpotter.jsx')),
  AngleBetweenPatternSpotter:  lazy(() => import('./react/AngleBetweenPatternSpotter.jsx')),
  DotProductCalculator:        lazy(() => import('./react/DotProductCalculator.jsx')),
  DotProductExplorer:          lazy(() => import('./react/DotProductExplorer.jsx')),
  AngleBetweenExplorer:        lazy(() => import('./react/AngleBetweenExplorer.jsx')),
  DotProductFormRecogniser:    lazy(() => import('./react/DotProductFormRecogniser.jsx')),

  // Lessons 14–16: Cross Product
  CrossProductIntuition:       lazy(() => import('./react/CrossProductIntuition.jsx')),
  CrossProductProof:           lazy(() => import('./react/CrossProductProof.jsx')),
  CrossProductPatternSpotter:  lazy(() => import('./react/CrossProductPatternSpotter.jsx')),
  CrossProductCalculator:      lazy(() => import('./react/CrossProductCalculator.jsx')),
  CrossProductExplorer:        lazy(() => import('./react/CrossProductExplorer.jsx')),
  CrossProductFormRecogniser:  lazy(() => import('./react/CrossProductFormRecogniser.jsx')),

  // Lesson 17: Direction Cosines
  DirectionCosineIntuition:    lazy(() => import('./react/DirectionCosineIntuition.jsx')),
  DirectionCosineProof:        lazy(() => import('./react/DirectionCosineProof.jsx')),
  DirectionCosinePatternSpotter: lazy(() => import('./react/DirectionCosinePatternSpotter.jsx')),
  DirectionCosineExplorer:     lazy(() => import('./react/DirectionCosineExplorer.jsx')),
  DirectionCosineFormRecogniser: lazy(() => import('./react/DirectionCosineFormRecogniser.jsx')),
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
  const location = useLocation()
  const { isPinned, addPin, removePin } = usePins()
  const pinId = `${id}::${location.pathname}`
  const pinned = isPinned(pinId)

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
      <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-700">
          <h2 className="text-sm font-bold text-white truncate">{title || 'Interactive Visualizer'}</h2>
          <button
            onClick={() => setIsExpanded(false)}
            className="ml-4 flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors"
          >
            ✕ Close
          </button>
        </div>
        {/* Content — fills remaining height, scrolls if needed */}
        <div className="flex-1 overflow-auto bg-white dark:bg-slate-950 p-4 sm:p-6">
          <div className="w-full max-w-5xl mx-auto">
            {content}
          </div>
        </div>
      </div>,
      document.body
    )
  }

  function togglePin() {
    if (pinned) {
      removePin(pinId)
    } else {
      addPin({ id: pinId, title: title || id, subtitle: location.pathname.replace('/chapter/', 'Ch. ').replace('/', ' › '), path: location.pathname, elementId: `viz-${id}` })
    }
  }

  return (
    <div id={`viz-${id}`} className="viz-frame relative group w-full max-w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-xl">
      {title && (
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 px-2 pt-2">{title}</p>
      )}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Pin button — desktop only */}
        <button
          onClick={togglePin}
          title={pinned ? 'Unpin' : 'Pin this visualization'}
          className={`hidden lg:flex items-center gap-1 px-2 py-1 text-xs font-bold rounded shadow-md border transition-colors ${pinned ? 'bg-amber-500 border-amber-400 text-white' : 'bg-slate-800 border-slate-600 text-white hover:bg-amber-500 hover:border-amber-400'}`}
        >
          📌
        </button>
        <button
          onClick={() => setIsExpanded(true)}
          title="Expand to Full Width"
          className="bg-slate-800 text-white px-2 py-1 flex items-center gap-1 text-xs font-bold rounded shadow-md border border-slate-600 hover:bg-brand-500 hover:border-brand-400"
        >
          <span>⛶</span> Expand
        </button>
      </div>
      <div className="p-2">
        {content}
      </div>
    </div>
  )
}
