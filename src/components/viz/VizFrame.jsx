import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { usePins } from "../../context/PinsContext.jsx";
const VIZ_REGISTRY = {
  MiniGolfGame: lazy(() => import("./react/MiniGolfGame.jsx")),
  VideoEmbed: lazy(() => import("./react/VideoEmbed.jsx")),
  CNCLab: lazy(() => import("./cnc/CNCLab.jsx")),
  ErrorAccumulationLab: lazy(() => import("./cnc/ErrorAccumulationLab.jsx")),
  CNCBackplot: lazy(() => import("./cnc/CNCBackplot.jsx")),
  CNCMacroLab: lazy(() => import("./cnc/CNCMacroLab.jsx")),
  CNCAxesExplorer: lazy(() => import("./cnc/CNCAxesExplorer.jsx")),
  CNCChainDiagram: lazy(() => import("./cnc/CNCChainDiagram.jsx")),
  CNCClosedLoopSim: lazy(() => import("./cnc/CNCClosedLoopSim.jsx")),
  CNCDialectTable: lazy(() => import("./cnc/CNCDialectTable.jsx")),
  CNCHistoryTimeline: lazy(() => import("./cnc/CNCHistoryTimeline.jsx")),
  CNCMachineTypes: lazy(() => import("./cnc/CNCMachineTypes.jsx")),
  LinearInterpolationViz: lazy(
    () => import("./cnc/LinearInterpolationViz.jsx"),
  ),
  GitLab: lazy(() => import("./git/GitLab.jsx")),
  VideoCarousel: lazy(() => import("./react/VideoCarousel.jsx")),
  NumberLine: lazy(() => import("./d3/NumberLine.jsx")),
  FunctionMachine: lazy(() => import("./d3/FunctionMachine.jsx")),
  FunctionPlotter: lazy(() => import("./d3/FunctionPlotter.jsx")),
  UnitCircle: lazy(() => import("./d3/UnitCircle.jsx")),
  UnitCircleMirror: lazy(() => import("./d3/UnitCircleMirror.jsx")),
  ExponentialGrowth: lazy(() => import("./d3/ExponentialGrowth.jsx")),
  LimitApproach: lazy(() => import("./d3/LimitApproach.jsx")),
  SecantToTangent: lazy(() => import("./d3/SecantToTangent.jsx")),
  EpsilonDelta: lazy(() => import("./d3/EpsilonDelta.jsx")),
  GraphicalEpsilonDelta: lazy(() => import("./d3/EpsilonDelta.jsx")),
  SqueezeTheorem: lazy(() => import("./d3/SqueezeTheorem.jsx")),
  ContinuityViz: lazy(() => import("./d3/ContinuityViz.jsx")),
  RiemannSum: lazy(() => import("./d3/RiemannSum.jsx")),
  PowerRulePattern: lazy(() => import("./d3/PowerRulePattern.jsx")),
  CompositionVisualization: lazy(
    () => import("./d3/CompositionVisualization.jsx"),
  ),
  SineCosineSlope: lazy(() => import("./d3/SineCosineSlope.jsx")),
  ExponentialSlopeAtZero: lazy(() => import("./d3/ExponentialSlopeAtZero.jsx")),
  ImplicitCurveExplorer: lazy(() => import("./d3/ImplicitCurveExplorer.jsx")),
  PythagoreanProof: lazy(() => import("./d3/PythagoreanProof.jsx")),
  CircleAreaProof: lazy(() => import("./d3/CircleAreaProof.jsx")),
  TriangleAreaProof: lazy(() => import("./d3/TriangleAreaProof.jsx")),
  ProjectileMotion: lazy(() => import("./d3/ProjectileMotion.jsx")),
  PositionVelocityAcceleration: lazy(
    () => import("./d3/PositionVelocityAcceleration.jsx"),
  ),
  LimitRacingCar: lazy(() => import("./d3/LimitRacingCar.jsx")),
  DifferentiationRulesDemo: lazy(
    () => import("./d3/DifferentiationRulesDemo.jsx"),
  ),
  TangentLineConstructor: lazy(() => import("./d3/TangentLineConstructor.jsx")),
  TangentToImplicitCurve: lazy(() => import("./d3/TangentToImplicitCurve.jsx")),
  TrigDerivativeGeometric: lazy(
    () => import("./d3/TrigDerivativeGeometric.jsx"),
  ),
  ExpLogBridgeLab: lazy(() => import("./react/ExpLogBridgeLab.jsx")),
  ExpLogGeometricProof: lazy(() => import("./d3/ExpLogGeometricProof.jsx")),
  FTCGeometricProof: lazy(() => import("./d3/FTCGeometricProof.jsx")),
  SqueezeTrigGeometric: lazy(() => import("./d3/SqueezeTrigGeometric.jsx")),
  SineUnwrap: lazy(() => import("./d3/SineUnwrap.jsx")),
  ArcChordLimit: lazy(() => import("./d3/ArcChordLimit.jsx")),
  ProductRuleRectangle: lazy(() => import("./d3/ProductRuleRectangle.jsx")),
  SlopeField: lazy(() => import("./d3/SlopeField.jsx")),
  IVPFamilyCurves: lazy(() => import("./d3/IVPFamilyCurves.jsx")),
  EulerMethodStepper: lazy(() => import("./d3/EulerMethodStepper.jsx")),
  IntegratingFactorViz: lazy(() => import("./d3/IntegratingFactorViz.jsx")),
  TangentPlane3D: lazy(() => import("./three/TangentPlane3D.jsx")),
  ParametricCurve3D: lazy(() => import("./three/ParametricCurve3D.jsx")),
  // Chapter 0 — Pre-Calc additions
  MotionTracer: lazy(() => import("./d3/MotionTracer.jsx")),
  TransformationExplorer: lazy(() => import("./d3/TransformationExplorer.jsx")),
  GraphMorph: lazy(() => import("./d3/GraphMorph.jsx")),
  // Chapter 1 — Physics examples
  ShrinkingInterval: lazy(() => import("./d3/ShrinkingInterval.jsx")),
  // Chapter 0 — Physics orientation
  SignConventionExplorer: lazy(() => import("./d3/SignConventionExplorer.jsx")),
  // Chapter 2 — Physics examples
  DisplacementVsDistance: lazy(() => import("./d3/DisplacementVsDistance.jsx")),
  VerticalThrow: lazy(() => import("./d3/VerticalThrow.jsx")),
  // PhysicsNext — Projectile & circular motion
  AngledLaunchIntuition: lazy(
    () => import("./react/AngledLaunchIntuition.jsx"),
  ),
  CentripetaAccelProof: lazy(() => import("./react/CentripetaAccelProof.jsx")),
  CircularMotionIntuition: lazy(
    () => import("./react/CircularMotionIntuition.jsx"),
  ),
  CliffLaunchIntuition: lazy(() => import("./react/CliffLaunchIntuition.jsx")),
  HorizontalLaunchIntuition: lazy(
    () => import("./react/HorizontalLaunchIntuition.jsx"),
  ),
  IndependentMotionIntuition: lazy(
    () => import("./react/IndependentMotionIntuition.jsx"),
  ),
  ProjectileExplorer: lazy(() => import("./react/ProjectileExplorer.jsx")),
  ProjectileFormRecogniser: lazy(
    () => import("./react/ProjectileFormRecogniser.jsx"),
  ),
  ProjectilePatternSpotter: lazy(
    () => import("./react/ProjectilePatternSpotter.jsx"),
  ),
  ProjectileProof: lazy(() => import("./react/ProjectileProof.jsx")),
  RangeExplorer: lazy(() => import("./react/RangeExplorer.jsx")),
  RangeIntuition: lazy(() => import("./react/RangeIntuition.jsx")),
  RangePatternSpotter: lazy(() => import("./react/RangePatternSpotter.jsx")),
  SlopeLandingIntuition: lazy(
    () => import("./react/SlopeLandingIntuition.jsx"),
  ),
  WallClearanceIntuition: lazy(
    () => import("./react/WallClearanceIntuition.jsx"),
  ),
  // Chapter 1 — Limits additions
  ZenoParadoxViz: lazy(() => import("./d3/ZenoParadoxViz.jsx")),
  TwoSidedLimit: lazy(() => import("./d3/TwoSidedLimit.jsx")),
  HoleVsValue: lazy(() => import("./d3/HoleVsValue.jsx")),
  OscillationViz: lazy(() => import("./d3/OscillationViz.jsx")),
  DeltaMinSelector: lazy(() => import("./d3/DeltaMinSelector.jsx")),
  LineFoundationsLab: lazy(() => import("./react/LineFoundationsLab.jsx")),
  // Chapter 2 — Derivatives additions
  DerivativeBuilder: lazy(() => import("./d3/DerivativeBuilder.jsx")),
  // Chapter 4 — Integration
  AreaAccumulator: lazy(() => import("./d3/AreaAccumulator.jsx")),
  FTCLink: lazy(() => import("./d3/FTCLink.jsx")),
  WaterTank: lazy(() => import("./d3/WaterTank.jsx")),
  SignedArea: lazy(() => import("./d3/SignedArea.jsx")),
  AreaBetweenCurves: lazy(() => import("./d3/AreaBetweenCurves.jsx")),
  IntegrationMethodLab: lazy(() => import("./d3/IntegrationMethodLab.jsx")),
  // ── Chapter Review Boards (end-of-chapter summary + bridge panels) ─────────
  // Order: Ch2–Ch6 map to project chapters 1–6 (OpenStax Calc Vol 1 numbering)
  Ch1Review: lazy(() => import("./react/Ch1Review.jsx")), // Functions & Graphs (Ch0 prereq review)
  Ch2Review: lazy(() => import("./react/Ch2Review.jsx")), // Limits & Continuity  → chapter-1
  Ch3Review: lazy(() => import("./react/Ch3Review.jsx")), // Derivatives          → chapter-2
  Ch4Review: lazy(() => import("./react/Ch4Review.jsx")), // Applications (Optim) → chapter-3
  Ch5Review: lazy(() => import("./react/Ch5Review.jsx")), // Integration          → chapter-4
  Ch6Review: lazy(() => import("./react/Ch6Review.jsx")), // Applications of Int  → chapter-5/6
  // ── Chapter Applied Problem Sets (real-world capstone beside each review) ──
  Ch1Applied: lazy(() => import("./react/Ch1Applied.jsx")), // Domain, composition, demand
  Ch2Applied: lazy(() => import("./react/Ch2Applied.jsx")), // Drug clearance, avg cost, continuity
  Ch3Applied: lazy(() => import("./react/Ch3Applied.jsx")), // Marginal analysis, motion, rates
  Ch4Applied: lazy(() => import("./react/Ch4Applied.jsx")), // Box, cylinder, 5-step optimisation
  Ch5Applied: lazy(() => import("./react/Ch5Applied.jsx")), // Series applications (Taylor bounds, etc.)
  // Physics — Interactive Simulations (Matter.js / canvas)
  ForceBlockSim: lazy(() => import("./matter/ForceBlockSim.jsx")),
  InclinedPlaneSim: lazy(() => import("./matter/InclinedPlaneSim.jsx")),
  AtwoodMachineSim: lazy(() => import("./matter/AtwoodMachineSim.jsx")),
  // Chapter 3 — Applications of Derivatives
  NewtonsMethod: lazy(() => import("./d3/NewtonsMethod.jsx")),
  SpringOscillation: lazy(() => import("./d3/SpringOscillation.jsx")),
  RelatedRatesLadder: lazy(() => import("./d3/RelatedRatesLadder.jsx")),
  SlidingLadder: lazy(() => import("./react/SlidingLadder.jsx")),
  RelatedRatesRocket: lazy(() => import("./react/RelatedRatesRocket.jsx")),
  RocketCamera: lazy(() => import("./react/RocketCamera.jsx")),
  LinearApproximation: lazy(() => import("./d3/LinearApproximation.jsx")),
  MVTViz: lazy(() => import("./d3/MVTViz.jsx")),
  CurveSketchingBoard: lazy(() => import("./d3/CurveSketchingBoard.jsx")),
  SignChartBuilder: lazy(() => import("./d3/SignChartBuilder.jsx")),
  ChainRulePeeler: lazy(() => import("./react/ChainRulePeeler.jsx")),
  PolynomialScrubber: lazy(() => import("./d3/PolynomialScrubber.jsx")),
  PolarCoordinateMorph: lazy(() => import("./d3/PolarCoordinateMorph.jsx")),
  ChainRuleMicroscope: lazy(() => import("./d3/ChainRuleMicroscope.jsx")),
  TrigDerivativeSync: lazy(() => import("./d3/TrigDerivativeSync.jsx")),
  TriangleInequalityViz: lazy(() => import("./d3/TriangleInequalityViz.jsx")),
  OptimizationViz: lazy(() => import("./d3/OptimizationViz.jsx")),
  LHopitalViz: lazy(() => import("./d3/LHopitalViz.jsx")),
  // Chapter 5 — Sequences & Series
  TaylorApproximation: lazy(() => import("./d3/TaylorApproximation.jsx")),
  ConvergenceViz: lazy(() => import("./d3/ConvergenceViz.jsx")),
  SeriesConvergenceLab: lazy(() => import("./d3/SeriesConvergenceLab.jsx")),
  // Web Development Module
  WebLesson01_DOMTree: lazy(() => import("./react/WebLesson01_DOMTree.jsx")),
  WebLesson02_HTML: lazy(() => import("./react/WebLesson02_HTML.jsx")),
  WebLesson03_CSSCascade: lazy(
    () => import("./react/WebLesson03_CSSCascade.jsx"),
  ),
  WebLesson04_Layout: lazy(() => import("./react/WebLesson04_Layout.jsx")),
  WebLesson05_Variables: lazy(
    () => import("./react/WebLesson05_Variables.jsx"),
  ),
  WebLesson06_Functions: lazy(
    () => import("./react/WebLesson06_Functions.jsx"),
  ),
  WebLesson07_Events: lazy(() => import("./react/WebLesson07_Events.jsx")),
  WebLesson08_DOM: lazy(() => import("./react/WebLesson08_DOM.jsx")),
  WebLesson09_EventLoop: lazy(
    () => import("./react/WebLesson09_EventLoop.jsx"),
  ),
  WebLesson10_Async: lazy(() => import("./react/WebLesson10_Async.jsx")),
  WebLesson11_StateUI: lazy(() => import("./react/WebLesson11_StateUI.jsx")),
  WebLesson12_Components: lazy(
    () => import("./react/WebLesson12_Components.jsx"),
  ),
  WebLesson13_Reactive: lazy(() => import("./react/WebLesson13_Reactive.jsx")),
  WebLesson14_APIs: lazy(() => import("./react/WebLesson14_APIs.jsx")),
  WebLesson15_StateAsync: lazy(
    () => import("./react/WebLesson15_StateAsync.jsx"),
  ),
  WebLesson16_Performance: lazy(
    () => import("./react/WebLesson16_Performance.jsx"),
  ),
  WebLesson17_Abstraction: lazy(
    () => import("./react/WebLesson17_Abstraction.jsx"),
  ),
  WebLesson18_Architecture: lazy(
    () => import("./react/WebLesson18_Architecture.jsx"),
  ),
  WebLesson19_Capstone: lazy(() => import("./react/WebLesson19_Capstone.jsx")),
  // Linear Algebra Module
  LALesson01_Vectors: lazy(() => import("./react/LALesson01_Vectors.jsx")),
  LALesson02_Combinations: lazy(
    () => import("./react/LALesson02_Combinations.jsx"),
  ),
  LALesson03_DotCross: lazy(() => import("./react/LALesson03_DotCross.jsx")),
  LALesson04_Matrices: lazy(() => import("./react/LALesson04_Matrices.jsx")),
  LALesson05_MatrixMult: lazy(
    () => import("./react/LALesson05_MatrixMult.jsx"),
  ),
  LALesson06_Inverses: lazy(() => import("./react/LALesson06_Inverses.jsx")),
  LALesson07_NullSpace: lazy(() => import("./react/LALesson07_NullSpace.jsx")),
  LALesson08_Eigen: lazy(() => import("./react/LALesson08_Eigen.jsx")),
  LALesson09_Diagonalization: lazy(
    () => import("./react/LALesson09_Diagonalization.jsx"),
  ),
  LALesson10_ComplexEigen: lazy(
    () => import("./react/LALesson10_ComplexEigen.jsx"),
  ),
  LALesson11_OrthogonalProjections: lazy(
    () => import("./react/LALesson11_OrthogonalProjectionsFull.jsx"),
  ),
  LALesson12_SVD: lazy(() => import("./react/LALesson12_SVD.jsx")),
  // Linear Algebra secondary vizzes
  MagnitudeAndDirectionViz: lazy(
    () => import("./react/MagnitudeAndDirectionViz.jsx"),
  ),
  LinearDependenceViz: lazy(() => import("./react/LinearDependenceViz.jsx")),
  CrossProductViz: lazy(() => import("./react/CrossProductViz.jsx")),
  GaussianEliminationStepper: lazy(
    () => import("./react/GaussianEliminationStepper.jsx"),
  ),
  CharacteristicPolynomialViz: lazy(
    () => import("./react/CharacteristicPolynomialViz.jsx"),
  ),
  DiagonalizationStepperViz: lazy(
    () => import("./react/DiagonalizationStepperViz.jsx"),
  ),
  ComplexPlaneEigenvalueViz: lazy(
    () => import("./react/ComplexPlaneEigenvalueViz.jsx"),
  ),
  ProjectionMatrixViz: lazy(() => import("./react/ProjectionMatrixViz.jsx")),
  QRDecompositionViz: lazy(() => import("./react/QRDecompositionViz.jsx")),
  LeastSquaresProjectionViz: lazy(
    () => import("./react/LeastSquaresProjectionViz.jsx"),
  ),
  LowRankApproximationViz: lazy(
    () => import("./react/LowRankApproximationViz.jsx"),
  ),
  PythonNotebook: lazy(() => import("./react/PythonNotebook.jsx")),
  JSNotebook: lazy(() => import("./react/JSNotebook.jsx")),
  ScienceNotebook: lazy(() => import("./react/ScienceNotebook.jsx")),
  // Chemistry lessons
  WhyChemistry: lazy(() => import("./react/WhyChemistry.jsx")),
  WhatIsAnAtom: lazy(() => import("./react/WhatIsAnAtom.jsx")),
  InsideTheAtom: lazy(() => import("./react/InsideTheAtom.jsx")),
  // Digital Fundamentals lessons
  AnalogVsDigital: lazy(() => import("./react/AnalogVsDigital.jsx")),
  BinaryAndWaveforms: lazy(() => import("./react/BinaryAndWaveforms.jsx")),
  DF_L3_1_ANDORNOTGates: lazy(
    () => import("./react/DF_L3_1_ANDORNOTGates.jsx"),
  ),
  JS1_DomIntro: lazy(() => import("./react/JS1_DomIntro.jsx")),
  // Chapter 2 — Additions
  DualGraphSync: lazy(() => import("./react/DualGraphSync.jsx")),
  Ch2_1_LighthouseAngle: lazy(
    () => import("./react/Ch2_1_LighthouseAngle.jsx"),
  ),
  Ch2_2_TwoStars: lazy(() => import("./react/Ch2_2_TwoStars.jsx")),
  Ch2_3_RippleAndWave: lazy(() => import("./react/Ch2_3_RippleAndWave.jsx")),
  Ch2_4_AngleAddition: lazy(() => import("./react/Ch2_4_AngleAddition.jsx")),
  Ch2_5_SpinningWheel: lazy(() => import("./react/Ch2_5_SpinningWheel.jsx")),
  Ch2_6_EchoProblem: lazy(() => import("./react/Ch2_6_EchoProblem.jsx")),
  Ch3_1_HowFastWasIt: lazy(() => import("./react/Ch3_1_HowFastWasIt.jsx")),
  Ch3_2_GettingCloser: lazy(() => import("./react/Ch3_2_GettingCloser.jsx")),
  Ch3_3_InfiniteStaircase: lazy(
    () => import("./react/Ch3_3_InfiniteStaircase.jsx"),
  ),
  Ch3_4_SineOfAlmostNothing: lazy(
    () => import("./react/Ch3_4_SineOfAlmostNothing.jsx"),
  ),
  Ch3_5_BrokenFunction: lazy(() => import("./react/Ch3_5_BrokenFunction.jsx")),
  Ch3_6_BridgeToCalculus: lazy(
    () => import("./react/Ch3_6_BridgeToCalculus.jsx"),
  ),
  PascalsTriangle: lazy(() => import("./react/PascalsTriangle.jsx")),
  // Chapter 4 — Volumes of Revolution
  VolumesOfRevolution: lazy(() => import("./d3/VolumesOfRevolution.jsx")),
  // Chapter 6 — Polar & Parametric
  PolarCurve: lazy(() => import("./d3/PolarCurve.jsx")),
  VectorKinematicsLab: lazy(() => import("./d3/VectorKinematicsLab.jsx")),
  FourierSeries: lazy(() => import("./d3/FourierSeries.jsx")),
  GradientDescentLoss: lazy(() => import("./d3/GradientDescentLoss.jsx")),
  PoiseuilleBloodFlow: lazy(() => import("./d3/PoiseuilleBloodFlow.jsx")),
  // Chapter 2 — Higher-order derivatives & trig intuition
  DerivativeCycleClock: lazy(() => import("./d3/DerivativeCycleClock.jsx")),
  TangentExplosion: lazy(() => import("./d3/TangentExplosion.jsx")),
  SinDerivativeGeometric: lazy(() => import("./d3/SinDerivativeGeometric.jsx")),
  LimitGeometric: lazy(() => import("./d3/LimitGeometric.jsx")),
  // Physics p0 - Orientation
  ModelVsReality: lazy(() => import("./react/ModelVsReality.jsx")),
  UnitValidator: lazy(() => import("./react/UnitValidator.jsx")),
  GraphInterpreter: lazy(() => import("./react/GraphInterpreter.jsx")),
  VectorBuilder: lazy(() => import("./react/VectorBuilder.jsx")),
  FrameSwitcher: lazy(() => import("./react/FrameSwitcher.jsx")),
  DiscreteVsContinuous: lazy(() => import("./react/DiscreteVsContinuous.jsx")),
  VelocityComparison: lazy(() => import("./react/VelocityComparison.jsx")),
  LocalLinearityZoom: lazy(() => import("./react/LocalLinearityZoom.jsx")),
  SplitScreenLimitSync: lazy(() => import("./react/SplitScreenLimitSync.jsx")),
  SpaceTimeRibbon: lazy(() => import("./react/SpaceTimeRibbon.jsx")),
  BrakeOrCrashSim: lazy(() => import("./react/BrakeOrCrashSim.jsx")),
  MasterLimitGraph: lazy(() => import("./react/MasterLimitGraph.jsx")),
  // Chapter 5 — New additions
  BisectionMethod: lazy(() => import("./d3/BisectionMethod.jsx")),
  ShellMethod: lazy(() => import("./d3/ShellMethod.jsx")),
  ArcLengthViz: lazy(() => import("./d3/ArcLengthViz.jsx")),
  CentroidViz: lazy(() => import("./d3/CentroidViz.jsx")),
  SequenceViz: lazy(() => import("./d3/SequenceViz.jsx")),
  // Course: Discrete Math
  PigeonholeViz: lazy(() => import("./react/PigeonholeViz.jsx")),
  PigeonHoleDemo: lazy(() => import("./react/PigeonHoleDemo.jsx")),
  TruthTableLab: lazy(() => import("./react/TruthTableLab.jsx")),
  TruthTableBuilderDemo: lazy(
    () => import("./react/TruthTableBuilderDemo.jsx"),
  ),
  TruthTableViz: lazy(() => import("./react/TruthTableViz.jsx")),
  LogicConnectiveBuilder: lazy(
    () => import("./react/LogicConnectiveBuilder.jsx"),
  ),
  ImplicationExplorer: lazy(() => import("./react/ImplicationExplorer.jsx")),
  DeMorganViz: lazy(() => import("./react/DeMorganViz.jsx")),
  QuantifierExplorer: lazy(() => import("./react/QuantifierExplorer.jsx")),
  ProofStrategyChooser: lazy(() => import("./react/ProofStrategyChooser.jsx")),
  DiscreteDependencyMap: lazy(
    () => import("./react/DiscreteDependencyMap.jsx"),
  ),
  ModClockViz: lazy(() => import("./react/ModClockViz.jsx")),
  CardDiceLab: lazy(() => import("./react/CardDiceLab.jsx")),
  GraphTraversalGame: lazy(() => import("./react/GraphTraversalGame.jsx")),
  DFAChallengeGame: lazy(() => import("./react/DFAChallengeGame.jsx")),
  RecurrenceExplorer: lazy(() => import("./d3/RecurrenceExplorer.jsx")),
  BayesGridLab: lazy(() => import("./d3/BayesGridLab.jsx")),
  ComplexityLab: lazy(() => import("./d3/ComplexityLab.jsx")),
  GraphNetwork3D: lazy(() => import("./three/GraphNetwork3D.jsx")),
  TruthCube3D: lazy(() => import("./react/TruthCube3D.jsx")),
  LogicGateSim: lazy(() => import("./react/LogicGateSim.jsx")),
  LogicalOperatorsExplorer: lazy(
    () => import("./react/LogicalOperatorsExplorer.jsx"),
  ),
  VennDiagram: lazy(() => import("./react/VennDiagram.jsx")),
  QuantifierGridLab: lazy(() => import("./react/QuantifierGridLab.jsx")),
  InductionFailureViz: lazy(() => import("./react/InductionFailureViz.jsx")),
  DominoInductionLab: lazy(() => import("./react/DominoInductionLab.jsx")),
  RecursionTreeViz: lazy(() => import("./react/RecursionTreeViz.jsx")),
  StrongInductionPuzzle: lazy(
    () => import("./react/StrongInductionPuzzle.jsx"),
  ),
  RecursionStackViz: lazy(() => import("./react/RecursionStackViz.jsx")),
  BipartiteQuantifierViz: lazy(
    () => import("./react/BipartiteQuantifierViz.jsx"),
  ),
  DomainExplorerLab: lazy(() => import("./react/DomainExplorerLab.jsx")),
  FunctionMappingLab: lazy(() => import("./react/FunctionMappingLab.jsx")),
  SetsAndFunctionsExplorer: lazy(
    () => import("./react/SetsAndFunctionsExplorer.jsx"),
  ),
  SetExplorer: lazy(() => import("./react/SetExplorer.jsx")),
  PowerSetTreeLab: lazy(() => import("./react/PowerSetTreeLab.jsx")),
  CartesianGridLab: lazy(() => import("./react/CartesianGridLab.jsx")),
  FunctionCompositionLab: lazy(
    () => import("./react/FunctionCompositionLab.jsx"),
  ),
  SetBuilderDecoderLab: lazy(() => import("./react/SetBuilderDecoderLab.jsx")),
  HorizontalLineTestLab: lazy(
    () => import("./react/HorizontalLineTestLab.jsx"),
  ),
  SetProofVisualizer: lazy(() => import("./react/SetProofVisualizer.jsx")),
  RelationMatrixLab: lazy(() => import("./react/RelationMatrixLab.jsx")),
  RelationsExplorer: lazy(() => import("./react/RelationsExplorer.jsx")),
  ModuloPartitionLab: lazy(() => import("./react/ModuloPartitionLab.jsx")),
  HasseTransformerLab: lazy(() => import("./react/HasseTransformerLab.jsx")),
  EquivalenceDecoderLab: lazy(
    () => import("./react/EquivalenceDecoderLab.jsx"),
  ),
  DivisibilityExplorer: lazy(() => import("./react/DivisibilityExplorer.jsx")),
  PrimeFactorizationViz: lazy(
    () => import("./react/PrimeFactorizationViz.jsx"),
  ),
  EuclideanAlgorithmViz: lazy(
    () => import("./react/EuclideanAlgorithmViz.jsx"),
  ),
  ModularArithmeticGrid: lazy(
    () => import("./react/ModularArithmeticGrid.jsx"),
  ),
  ExtendedEuclideanViz: lazy(() => import("./react/ExtendedEuclideanViz.jsx")),
  ModularInverseExplorer: lazy(
    () => import("./react/ModularInverseExplorer.jsx"),
  ),
  FermatTheoremViz: lazy(() => import("./react/FermatTheoremViz.jsx")),
  RSAMiniDemo: lazy(() => import("./react/RSAMiniDemo.jsx")),
  MultiplicationRuleTree: lazy(
    () => import("./react/MultiplicationRuleTree.jsx"),
  ),
  SlotMachineCounter: lazy(() => import("./react/SlotMachineCounter.jsx")),
  FactorialExplorer: lazy(() => import("./react/FactorialExplorer.jsx")),
  PermutationVsCombinationAnimator: lazy(
    () => import("./react/PermutationVsCombinationAnimator.jsx"),
  ),
  ComplementaryCountingViz: lazy(
    () => import("./react/ComplementaryCountingViz.jsx"),
  ),
  InclusionExclusionAnimator: lazy(
    () => import("./react/InclusionExclusionAnimator.jsx"),
  ),
  StateExplosionViz: lazy(() => import("./react/StateExplosionViz.jsx")),
  InductionAlgebraDecoderLab: lazy(
    () => import("./react/InductionAlgebraDecoderLab.jsx"),
  ),
  SigmaDecoderLab: lazy(() => import("./react/SigmaDecoderLab.jsx")),
  StrongInductionWallLab: lazy(
    () => import("./react/StrongInductionWallLab.jsx"),
  ),
  CombinationVsPermutationLab: lazy(
    () => import("./react/CombinationVsPermutationLab.jsx"),
  ),
  HandshakeCliqueLab: lazy(() => import("./react/HandshakeCliqueLab.jsx")),
  CountingTreeLab: lazy(() => import("./react/CountingTreeLab.jsx")),
  PascalsTriangleLab: lazy(() => import("./react/PascalsTriangleLab.jsx")),
  StarsAndBarsLab: lazy(() => import("./react/StarsAndBarsLab.jsx")),
  RadianDegreeLimitLab: lazy(() => import("./react/RadianDegreeLimitLab.jsx")),
  AreaSqueezeLab: lazy(() => import("./react/AreaSqueezeLab.jsx")),
  AlgebraicSqueezeWalkthrough: lazy(
    () => import("./react/AlgebraicSqueezeWalkthrough.jsx"),
  ),
  ConjugateVisualizer: lazy(() => import("./react/ConjugateVisualizer.jsx")),
  SmallAnglePendulumLab: lazy(
    () => import("./react/SmallAnglePendulumLab.jsx"),
  ),
  CosGapVisualizer: lazy(() => import("./react/CosGapVisualizer.jsx")),
  VelocityVectorProofLab: lazy(
    () => import("./react/VelocityVectorProofLab.jsx"),
  ),
  CoDirectionCompass: lazy(() => import("./react/CoDirectionCompass.jsx")),
  NestedTrigMachine: lazy(() => import("./react/NestedTrigMachine.jsx")),
  QuotientRuleTanBuilder: lazy(
    () => import("./react/QuotientRuleTanBuilder.jsx"),
  ),
  SineAdditionProofBuilder: lazy(
    () => import("./react/SineAdditionProofBuilder.jsx"),
  ),
  InverseBridgeTriangleLab: lazy(
    () => import("./react/InverseBridgeTriangleLab.jsx"),
  ),
  ArcSinTriangleDerivationLab: lazy(
    () => import("./react/ArcSinTriangleDerivationLab.jsx"),
  ),
  InterlockingGearsViz: lazy(() => import("./react/InterlockingGearsViz.jsx")),
  ChainRuleOnionLab: lazy(() => import("./react/ChainRuleOnionLab.jsx")),
  ProofCircleLinkLab: lazy(() => import("./react/ProofCircleLinkLab.jsx")),
  LayerScanGame: lazy(() => import("./react/LayerScanGame.jsx")),
  ChainRulePipelineLab: lazy(() => import("./react/ChainRulePipelineLab.jsx")),
  LeibnizUnitTrackerLab: lazy(
    () => import("./react/LeibnizUnitTrackerLab.jsx"),
  ),
  ChainRuleProofMapLab: lazy(() => import("./react/ChainRuleProofMapLab.jsx")),
  DeepProofSolver: lazy(() => import("./react/DeepProofSolver.jsx")),
  ImplicitDiffProof: lazy(() => import("./react/ImplicitDiffProof.jsx")),
  RecursiveProofStepper: lazy(
    () => import("./react/RecursiveProofStepper.jsx"),
  ),
  BrokenChainTrapLab: lazy(() => import("./react/BrokenChainTrapLab.jsx")),
  ProductRuleChainTrap: lazy(() => import("./react/ProductRuleChainTrap.jsx")),
  LimitBridgeLab: lazy(() => import("./react/LimitBridgeLab.jsx")),
  ContinuityRepairGame: lazy(() => import("./react/ContinuityRepairGame.jsx")),
  ChainRuleAssemblerGame: lazy(
    () => import("./react/ChainRuleAssemblerGame.jsx"),
  ),
  ImplicitTangentPlayground: lazy(
    () => import("./react/ImplicitTangentPlayground.jsx"),
  ),
  TrigMotionBridgeLab: lazy(() => import("./react/TrigMotionBridgeLab.jsx")),
  DerivativeRuleArenaGame: lazy(
    () => import("./react/DerivativeRuleArenaGame.jsx"),
  ),
  Ch1_BrokenFitting: lazy(() => import("./react/Ch1_BrokenFitting.jsx")),
  Ch2_RopeBridge: lazy(() => import("./react/Ch2_RopeBridge.jsx")),
  Ch3_MissingAngle: lazy(() => import("./react/Ch3_MissingAngle.jsx")),
  Ch4_RampSlope: lazy(() => import("./react/Ch4_RampSlope.jsx")),
  Ch5_QuadraticShadow: lazy(() => import("./react/Ch5_QuadraticShadow.jsx")),
  Ch6_TwoTanks: lazy(() => import("./react/Ch6_TwoTanks.jsx")),
  // Chapter 2 — Inverse functions & differentiability
  InverseSlopeReflectionLab: lazy(
    () => import("./react/InverseSlopeReflectionLab.jsx"),
  ),
  ArcTanDerivationLab: lazy(() => import("./react/ArcTanDerivationLab.jsx")),
  AbsoluteValueDiffViz: lazy(() => import("./react/AbsoluteValueDiffViz.jsx")),
  UniversalInverseLab: lazy(() => import("./d3/UniversalInverseLab.jsx")),
  InverseFunctionExplorer: lazy(
    () => import("./d3/InverseFunctionExplorer.jsx"),
  ),
  PythagoreanSlopeEngine: lazy(() => import("./d3/PythagoreanSlopeEngine.jsx")),
  LogExpReciprocalViz: lazy(() => import("./d3/LogExpReciprocalViz.jsx")),
  InverseFunctionExplainer: lazy(
    () => import("./react/InverseFunctionExplainer.jsx"),
  ),
  RationalExponentProof: lazy(
    () => import("./react/RationalExponentProof.jsx"),
  ),
  CalculusFoundationsLab: lazy(
    () => import("./react/CalculusFoundationsLab.jsx"),
  ),
  ImplicitDifferentiation: lazy(
    () => import("./react/ImplicitDifferentiation.jsx"),
  ),
  // Chapter 2 — Reading derivatives game
  SketchDerivativeGame: lazy(() => import("./react/SketchDerivativeGame.jsx")),
  // Precalc — Algebra (contributed components)
  FactoringAreaViz: lazy(() => import("./d3/FactoringAreaViz.jsx")),
  CompleteSquareViz: lazy(() => import("./d3/CompleteSquareViz.jsx")),
  ComplexPlaneViz: lazy(() => import("./d3/ComplexPlaneViz.jsx")),
  PartialFractionViz: lazy(() => import("./d3/PartialFractionViz.jsx")),
  SignChartViz: lazy(() => import("./d3/SignChartViz.jsx")),
  SystemsGeometryViz: lazy(() => import("./d3/SystemsGeometryViz.jsx")),
  // Chapter 1 — Rate of change & modeling
  RateOfChangeViz: lazy(() => import("./d3/RateOfChangeViz.jsx")),
  FunctionModelingViz: lazy(() => import("./d3/FunctionModelingViz.jsx")),
  // Chapter 2 — Polynomial division
  PolynomialDivisionViz: lazy(
    () => import("./react/PolynomialDivisionViz.jsx"),
  ),
  // Alias: NumberLine already exists, expose as NumberLineViz for algebra lessons
  NumberLineViz: lazy(() => import("./d3/NumberLine.jsx")),
  // Precalc — Functions & Graphs (contributed components)
  CartesianFoundationsViz: lazy(
    () => import("./d3/CartesianFoundationsViz.jsx"),
  ),
  TransformationBuilderViz: lazy(
    () => import("./d3/TransformationBuilderViz.jsx"),
  ),
  RootMultiplicityViz: lazy(() => import("./d3/RootMultiplicityViz.jsx")),
  FunctionBehaviourViz: lazy(() => import("./d3/FunctionBehaviourViz.jsx")),
  PolarCartesianViz: lazy(() => import("./d3/PolarCartesianViz.jsx")),
  // Precalc — stub aliases (same-topic components until dedicated viz are built)
  ZerosAndInterceptsViz: lazy(() => import("./d3/CartesianFoundationsViz.jsx")),
  EvenOddSymmetryViz: lazy(() => import("./d3/TransformationBuilderViz.jsx")),
  InverseFunctionViz: lazy(() => import("./d3/TransformationBuilderViz.jsx")),
  AsymptoteTypesViz: lazy(() => import("./d3/FunctionBehaviourViz.jsx")),
  RationalSketchViz: lazy(() => import("./d3/FunctionBehaviourViz.jsx")),
  Vectors3DViz: lazy(() => import("./d3/PolarCartesianViz.jsx")),
  // Contribution files — new viz components
  TangentLineViz: lazy(() => import("./d3/TangentLineViz.jsx")),
  PythagoreanViz: lazy(() => import("./d3/PythagoreanViz.jsx")),
  GraphExplorerViz: lazy(() => import("./d3/GraphExplorerViz.jsx")),
  // Contribution files — aliases to closest existing components
  LimitApproachViz: lazy(() => import("./d3/LimitApproach.jsx")),
  EpsilonDeltaViz: lazy(() => import("./d3/EpsilonDelta.jsx")),
  DerivativeFromFirstPrinciplesViz: lazy(
    () => import("./d3/TangentLineConstructor.jsx"),
  ),
  CircleUnrollViz: lazy(() => import("./d3/CircleAreaProof.jsx")),
  TriangleAreaViz: lazy(() => import("./d3/TriangleAreaProof.jsx")),
  AlgebraSquareViz: lazy(() => import("./d3/PythagoreanProof.jsx")),
  // Precalc 3 — Trig identities
  UnitCircleIdentityViz: lazy(() => import("./d3/UnitCircleIdentityViz.jsx")),
  DoubleAngleViz: lazy(() => import("./d3/DoubleAngleViz.jsx")),
  AngleAdditionProofViz: lazy(() => import("./d3/AngleAdditionProofViz.jsx")),
  PowerReductionViz: lazy(() => import("./d3/PowerReductionViz.jsx")),
  // Precalc 3 — Trig in calculus
  TrigSubstitutionViz: lazy(() => import("./d3/TrigSubstitutionViz.jsx")),
  TrigIntegrationStrategyViz: lazy(
    () => import("./react/TrigIntegrationStrategyViz.jsx"),
  ),
  // Precalc 3 — Logarithms
  LogAsAreaViz: lazy(() => import("./d3/LogAsAreaViz.jsx")),
  LogLawsViz: lazy(() => import("./d3/LogLawsViz.jsx")),
  // Precalc 3 — Inverse trig
  InverseTrigViz: lazy(() => import("./d3/InverseTrigViz.jsx")),
  // Precalc 3 — Applications
  SinusoidalModelViz: lazy(() => import("./d3/SinusoidalModelViz.jsx")),

  // Precalc 3 — Trig foundations (angles, triangles, ratios, graphs, solving)
  AngleMeasurementViz: lazy(() => import("./d3/AngleMeasurementViz.jsx")),
  TriangleGeometryViz: lazy(() => import("./d3/TriangleGeometryViz.jsx")),
  TrigRatiosViz: lazy(() => import("./d3/TrigRatiosViz.jsx")),
  UnitCircleFullViz: lazy(() => import("./d3/UnitCircleFullViz.jsx")),
  SixTrigGraphsViz: lazy(() => import("./d3/SixTrigGraphsViz.jsx")),
  LawOfSinesViz: lazy(() => import("./d3/LawOfSinesViz.jsx")),
  SSAAmbiguousViz: lazy(() => import("./d3/SSAAmbiguousViz.jsx")),
  // Chain Rule vizzes
  ChainRuleCompositionViz: lazy(
    () => import("./d3/ChainRuleCompositionViz.jsx"),
  ),
  DerivativeMotionLabPro: lazy(
    () => import("./react/DerivativeMotionLabPro.jsx"),
  ),
  ChainRuleZoomViz: lazy(() => import("./d3/ChainRuleZoomViz.jsx")),
  ChainRuleRatesViz: lazy(() => import("./d3/ChainRuleRatesViz.jsx")),
  ChainRuleLimitBridgeViz: lazy(
    () => import("./react/ChainRuleLimitBridgeViz.jsx"),
  ),
  ChainRulePracticeViz: lazy(() => import("./react/ChainRulePracticeViz.jsx")),
  ChainRuleLimitBridgeViz2: lazy(
    () => import("./react/ChainRuleLimitBridgeViz2.jsx"),
  ),
  ChainRulePracticeViz2: lazy(
    () => import("./react/ChainRulePracticeViz2.jsx"),
  ),
  ProductPowerChainRuleViz: lazy(
    () => import("./react/ProductPowerChainRuleViz.jsx"),
  ),
  CombinedDerivativeSolver: lazy(
    () => import("./react/CombinedDerivativeSolver.jsx"),
  ),
  DerivativeCoach: lazy(() => import("./react/DerivativeCoach.jsx")),
  StepByStepMathViz: lazy(() => import("./react/StepByStepMathViz.jsx")),
  // Precalc-5 — polar, complex, vectors
  PolarConversionViz: lazy(() => import("./d3/PolarConversionViz.jsx")),
  ComplexPolarViz: lazy(() => import("./d3/ComplexPolarViz.jsx")),
  VectorOperationsViz: lazy(() =>
    import("./d3/VectorVizzes.jsx").then((m) => ({
      default: m.VectorOperationsViz,
    })),
  ),
  DotProductViz: lazy(() =>
    import("./d3/VectorVizzes.jsx").then((m) => ({ default: m.DotProductViz })),
  ),
  // Precalc-4 — exponential & log vizzes
  ExponentialGraphViz: lazy(() => import("./d3/ExponentialGraphViz.jsx")),
  GrowthDecayViz: lazy(() => import("./d3/GrowthDecayViz.jsx")),
  LogGraphViz: lazy(() => import("./d3/LogGraphViz.jsx")),
  LogPropertiesViz: lazy(() => import("./d3/LogPropertiesViz.jsx")),
  ExpLogSolverViz: lazy(() => import("./d3/ExpLogSolverViz.jsx")),

  // ─── Physics Chapter 1: Vectors ─────────────────────────────────────────────
  // Lesson 1: What Is a Vector? (P1-P5)
  VectorArrowIntuition: lazy(() => import("./react/VectorArrowIntuition.jsx")),
  VectorEqualityProof: lazy(() => import("./react/VectorEqualityProof.jsx")),
  VectorPatternSpotter: lazy(() => import("./react/VectorPatternSpotter.jsx")),
  VectorComponentDecomposer: lazy(
    () => import("./react/VectorComponentDecomposer.jsx"),
  ),
  VectorFormRecogniser: lazy(() => import("./react/VectorFormRecogniser.jsx")),

  // Lesson 2: Vector Notation (P1-P5)
  NotationGallery: lazy(() => import("./react/NotationGallery.jsx")),
  BasisVectorProof: lazy(() => import("./react/BasisVectorProof.jsx")),
  NotationPatternSpotter: lazy(
    () => import("./react/NotationPatternSpotter.jsx"),
  ),
  UnitVectorBuilder: lazy(() => import("./react/UnitVectorBuilder.jsx")),
  NotationFormRecogniser: lazy(
    () => import("./react/NotationFormRecogniser.jsx"),
  ),

  // Lesson 3: Components and Magnitudes (P1-P5)
  ComponentDecomposerLive: lazy(
    () => import("./react/ComponentDecomposerLive.jsx"),
  ),
  ComponentDerivationProof: lazy(
    () => import("./react/ComponentDerivationProof.jsx"),
  ),
  ComponentPatternSpotter: lazy(
    () => import("./react/ComponentPatternSpotter.jsx"),
  ),
  ComponentConversionExplorer: lazy(
    () => import("./react/ComponentConversionExplorer.jsx"),
  ),
  ComponentFormRecogniser: lazy(
    () => import("./react/ComponentFormRecogniser.jsx"),
  ),

  // Lesson 4: Adding Vectors — Parallelogram (P1-P5)
  ParallelogramIntuition: lazy(
    () => import("./react/ParallelogramIntuition.jsx"),
  ),
  ParallelogramProof: lazy(() => import("./react/ParallelogramProof.jsx")),
  ParallelogramPatternSpotter: lazy(
    () => import("./react/ParallelogramPatternSpotter.jsx"),
  ),
  ParallelogramAngleExplorer: lazy(
    () => import("./react/ParallelogramAngleExplorer.jsx"),
  ),
  ParallelogramFormRecogniser: lazy(
    () => import("./react/ParallelogramFormRecogniser.jsx"),
  ),

  // Lesson 5: Adding Vectors — Tip-to-Toe (P1-P5)
  TipToToeIntuition: lazy(() => import("./react/TipToToeIntuition.jsx")),
  TipToToeProof: lazy(() => import("./react/TipToToeProof.jsx")),
  TipToToePatternSpotter: lazy(
    () => import("./react/TipToToePatternSpotter.jsx"),
  ),
  TipToToeOrderProof: lazy(() => import("./react/TipToToeOrderProof.jsx")),
  TipToToeFormRecogniser: lazy(
    () => import("./react/TipToToeFormRecogniser.jsx"),
  ),

  // Lesson 6: Adding Vectors Numerically (P1-P5)
  NumericalAdditionWalkthrough: lazy(
    () => import("./react/NumericalAdditionWalkthrough.jsx"),
  ),
  NumericalMethodProof: lazy(() => import("./react/NumericalMethodProof.jsx")),
  NumericalPatternSpotter: lazy(
    () => import("./react/NumericalPatternSpotter.jsx"),
  ),
  NumericalAdditionTable: lazy(
    () => import("./react/NumericalAdditionTable.jsx"),
  ),
  NumericalFormRecogniser: lazy(
    () => import("./react/NumericalFormRecogniser.jsx"),
  ),

  // Lesson 7: Subtracting Vectors Graphically (P1-P5)
  SubtractionIntuition: lazy(() => import("./react/SubtractionIntuition.jsx")),
  SubtractionProof: lazy(() => import("./react/SubtractionProof.jsx")),
  SubtractionPatternSpotter: lazy(
    () => import("./react/SubtractionPatternSpotter.jsx"),
  ),
  SubtractionDeltaV: lazy(() => import("./react/SubtractionDeltaV.jsx")),
  SubtractionFormRecogniser: lazy(
    () => import("./react/SubtractionFormRecogniser.jsx"),
  ),

  // Lesson 8: Subtracting Vectors Numerically (P1-P5)
  NumericalSubtractionWalkthrough: lazy(
    () => import("./react/NumericalSubtractionWalkthrough.jsx"),
  ),
  SubtractionNumericalProof: lazy(
    () => import("./react/SubtractionNumericalProof.jsx"),
  ),
  SubtractionNumericalPatternSpotter: lazy(
    () => import("./react/SubtractionNumericalPatternSpotter.jsx"),
  ),
  SubtractionComponentTable: lazy(
    () => import("./react/SubtractionComponentTable.jsx"),
  ),
  SubtractionNumericalFormRecogniser: lazy(
    () => import("./react/SubtractionNumericalFormRecogniser.jsx"),
  ),

  // Lesson 9: Adding Force Vectors (P1-P5)
  ForceVectorIntuition: lazy(() => import("./react/ForceVectorIntuition.jsx")),
  ForceProof: lazy(() => import("./react/ForceProof.jsx")),
  ForcePatternSpotter: lazy(() => import("./react/ForcePatternSpotter.jsx")),
  ForceComponentTable: lazy(() => import("./react/ForceComponentTable.jsx")),
  ForceFormRecogniser: lazy(() => import("./react/ForceFormRecogniser.jsx")),

  // Lessons 10–13: Dot Product
  DotProductIntuition: lazy(() => import("./react/DotProductIntuition.jsx")),
  DotProductExampleIntuition: lazy(
    () => import("./react/DotProductExampleIntuition.jsx"),
  ),
  OrthogonalityIntuition: lazy(
    () => import("./react/OrthogonalityIntuition.jsx"),
  ),
  AngleBetweenIntuition: lazy(
    () => import("./react/AngleBetweenIntuition.jsx"),
  ),
  DotProductProof: lazy(() => import("./react/DotProductProof.jsx")),
  DotProductPatternSpotter: lazy(
    () => import("./react/DotProductPatternSpotter.jsx"),
  ),
  OrthogonalityPatternSpotter: lazy(
    () => import("./react/OrthogonalityPatternSpotter.jsx"),
  ),
  AngleBetweenPatternSpotter: lazy(
    () => import("./react/AngleBetweenPatternSpotter.jsx"),
  ),
  DotProductCalculator: lazy(() => import("./react/DotProductCalculator.jsx")),
  DotProductExplorer: lazy(() => import("./react/DotProductExplorer.jsx")),
  AngleBetweenExplorer: lazy(() => import("./react/AngleBetweenExplorer.jsx")),
  DotProductFormRecogniser: lazy(
    () => import("./react/DotProductFormRecogniser.jsx"),
  ),

  // Lessons 14–16: Cross Product
  CrossProductIntuition: lazy(
    () => import("./react/CrossProductIntuition.jsx"),
  ),
  CrossProductProof: lazy(() => import("./react/CrossProductProof.jsx")),
  CrossProductPatternSpotter: lazy(
    () => import("./react/CrossProductPatternSpotter.jsx"),
  ),
  CrossProductCalculator: lazy(
    () => import("./react/CrossProductCalculator.jsx"),
  ),
  CrossProductExplorer: lazy(() => import("./react/CrossProductExplorer.jsx")),
  CrossProductFormRecogniser: lazy(
    () => import("./react/CrossProductFormRecogniser.jsx"),
  ),

  // Lesson 17: Direction Cosines
  DirectionCosineIntuition: lazy(
    () => import("./react/DirectionCosineIntuition.jsx"),
  ),
  DirectionCosineProof: lazy(() => import("./react/DirectionCosineProof.jsx")),
  DirectionCosinePatternSpotter: lazy(
    () => import("./react/DirectionCosinePatternSpotter.jsx"),
  ),
  DirectionCosineExplorer: lazy(
    () => import("./react/DirectionCosineExplorer.jsx"),
  ),
  DirectionCosineFormRecogniser: lazy(
    () => import("./react/DirectionCosineFormRecogniser.jsx"),
  ),
  NewtonCooling: lazy(() => import("./react/NewtonCooling.jsx")),
  NewtonCoolingDeep: lazy(() => import("./react/NewtonCoolingDeep.jsx")),
  RollerCoaster: lazy(() => import("./react/RollerCoaster.jsx")),
  RollerCoasterDeep: lazy(() => import("./react/RollerCoasterDeep.jsx")),
  SpeedingTicket: lazy(() => import("./react/SpeedingTicket.jsx")),
  KineticEnergySpeeding: lazy(
    () => import("./react/KineticEnergySpeeding.jsx"),
  ),

  // Physics Chapter 2: Motion in One Dimension
  KinematicProof: lazy(() => import("./ch2/KinematicProof.jsx")),
  KinematicsPatternSpotter: lazy(
    () => import("./ch2/KinematicsPatternSpotter.jsx"),
  ),
  KinematicEquationSelector: lazy(
    () => import("./ch2/KinematicEquationSelector.jsx"),
  ),
  KinematicsFormRecogniser: lazy(
    () => import("./ch2/KinematicsFormRecogniser.jsx"),
  ),
  KinematicsDefinitionIntuition: lazy(
    () => import("./ch2/KinematicsDefinitionIntuition.jsx"),
  ),
  KinematicsDefinitionPatternSpotter: lazy(
    () => import("./ch2/KinematicsDefinitionPatternSpotter.jsx"),
  ),
  KinematicsQuantitiesExplorer: lazy(
    () => import("./ch2/KinematicsQuantitiesExplorer.jsx"),
  ),
  KinematicsDerivativeProof: lazy(
    () => import("./ch2/KinematicsDerivativeProof.jsx"),
  ),
  KinematicEquationsIntuition: lazy(
    () => import("./ch2/KinematicEquationsIntuition.jsx"),
  ),
  PositionGraphIntuition: lazy(
    () => import("./ch2/PositionGraphIntuition.jsx"),
  ),
  VelocityGraphIntuition: lazy(
    () => import("./ch2/VelocityGraphIntuition.jsx"),
  ),
  AccelerationGraphIntuition: lazy(
    () => import("./ch2/AccelerationGraphIntuition.jsx"),
  ),
  TripleGraphIntuition: lazy(() => import("./ch2/TripleGraphIntuition.jsx")),
  PositionGraphPatternSpotter: lazy(
    () => import("./ch2/PositionGraphPatternSpotter.jsx"),
  ),
  PositionGraphExplorer: lazy(() => import("./ch2/PositionGraphExplorer.jsx")),
  VelocityGraphExplorer: lazy(() => import("./ch2/VelocityGraphExplorer.jsx")),
  TripleGraphExplorer: lazy(() => import("./ch2/TripleGraphExplorer.jsx")),
  DerivativeLimitIntuition: lazy(
    () => import("./ch2/DerivativeLimitIntuition.jsx"),
  ),
  DerivativeLimitExplorer: lazy(
    () => import("./ch2/DerivativeLimitExplorer.jsx"),
  ),
  KinematicsExampleIntuition: lazy(
    () => import("./ch2/KinematicsExampleIntuition.jsx"),
  ),
  IntegrationIntuition: lazy(() => import("./ch2/IntegrationIntuition.jsx")),
  TwoPhaseMotionIntuition: lazy(
    () => import("./ch2/TwoPhaseMotionIntuition.jsx"),
  ),
  FreeFallIntuition: lazy(() => import("./ch2/FreeFallIntuition.jsx")),
  FreeFallSymmetryIntuition: lazy(
    () => import("./ch2/FreeFallSymmetryIntuition.jsx"),
  ),
  FreeFallPatternSpotter: lazy(
    () => import("./ch2/FreeFallPatternSpotter.jsx"),
  ),
  FreeFallExplorer: lazy(() => import("./ch2/FreeFallExplorer.jsx")),
  TwoObjectsIntuition: lazy(() => import("./ch2/TwoObjectsIntuition.jsx")),
  TwoObjectsPatternSpotter: lazy(
    () => import("./ch2/TwoObjectsPatternSpotter.jsx"),
  ),
  TwoObjectsExplorer: lazy(() => import("./ch2/TwoObjectsExplorer.jsx")),
  VariableAccelerationIntuition: lazy(
    () => import("./ch2/VariableAccelerationIntuition.jsx"),
  ),
  VariableAccelerationPatternSpotter: lazy(
    () => import("./ch2/VariableAccelerationPatternSpotter.jsx"),
  ),
  VariableAccelerationExplorer: lazy(
    () => import("./ch2/VariableAccelerationExplorer.jsx"),
  ),

  // Standard Calculus Proofs (moved from incomplete ideas)
  FundamentalTheoremProof: lazy(
    () => import("./react/FundamentalTheoremProof.jsx"),
  ),
  LHopitalProof: lazy(() => import("./react/LHopitalProof.jsx")),
  ProductRuleProof: lazy(() => import("./react/ProductRuleProof.jsx")),
  RelatedRatesProof: lazy(() => import("./react/RelatedRatesProof.jsx")),
  TaylorSeriesProof: lazy(() => import("./react/TaylorSeriesProof.jsx")),
  ProofEngineViz: lazy(() => import("./react/ProofEngineViz.jsx")),
  InverseDerivativeProof: lazy(
    () => import("./react/InverseDerivativeProof.jsx"),
  ),
  InverseFunctionReflection: lazy(
    () => import("./react/InverseFunctionReflection.jsx"),
  ),
  InverseTrigDomainViz: lazy(() => import("./react/InverseTrigDomainViz.jsx")),
  MonotoneSignChart: lazy(() => import("./react/MonotoneSignChart.jsx")),
  SlopeReciprocalViz: lazy(() => import("./react/SlopeReciprocalViz.jsx")),
  InverseDerivativeTriangle: lazy(
    () => import("./react/InverseDerivativeTriangle.jsx"),
  ),
  VideoLauncher: lazy(() => import("./react/VideoLauncher.jsx")),
  // Chapter 3 — Applications of Derivatives (self-contained lesson components)
  HigherOrderDerivatives: lazy(
    () => import("./react/HigherOrderDerivatives.jsx"),
  ),
  DerivativesRatesOfChange: lazy(
    () => import("./react/DerivativesRatesOfChange.jsx"),
  ),
  MotionAlongLine: lazy(() => import("./react/MotionAlongLine.jsx")),
  MaximaMinima: lazy(() => import("./react/MaximaMinima.jsx")),
  ImplicitDiffReal: lazy(() => import("./react/ImplicitDiffReal.jsx")),
  RelatedRatesBalloon: lazy(() => import("./react/RelatedRatesBalloon.jsx")),
  RelatedRatesEngine: lazy(() => import("./react/RelatedRatesEngine.jsx")),

  // Geometry Book 1
  G1_1_FivePostulates: lazy(() => import("./geometry/G1_1_FivePostulates.jsx")),
  G1_2_AnglesAtAPoint: lazy(() => import("./geometry/G1_2_AnglesAtAPoint.jsx")),
  G1_3_ParallelLines: lazy(() => import("./geometry/G1_3_ParallelLines.jsx")),
  G1_4_TriangleAngleSum: lazy(
    () => import("./geometry/G1_4_TriangleAngleSum.jsx"),
  ),
  G1_5_Congruence: lazy(() => import("./geometry/G1_5_Congruence.jsx")),
  G1_6_Pythagorean: lazy(() => import("./geometry/G1_6_Pythagorean.jsx")),

  // Geometry Book 2
  G2_1_CircleTheorems1: lazy(
    () => import("./geometry/G2_1_CircleTheorems1.jsx"),
  ),
  G2_2_CircleTheorems2: lazy(
    () => import("./geometry/G2_2_CircleTheorems2.jsx"),
  ),
  G2_3_Constructions: lazy(() => import("./geometry/G2_3_Constructions.jsx")),
  G2_4_SimilarTriangles: lazy(
    () => import("./geometry/G2_4_SimilarTriangles.jsx"),
  ),
  G2_5_AreaFormulas: lazy(() => import("./geometry/G2_5_AreaFormulas.jsx")),
  G2_6_ArcSectorPi: lazy(() => import("./geometry/G2_6_ArcSectorPi.jsx")),

  // Geometry Book 3
  G3_1_CoordinatePlane: lazy(
    () => import("./geometry/G3_1_CoordinatePlane.jsx"),
  ),
  G3_2_LinesInPlane: lazy(() => import("./geometry/G3_2_LinesInPlane.jsx")),
  G3_3_CircleEquation: lazy(() => import("./geometry/G3_3_CircleEquation.jsx")),
  G3_4_Transformations: lazy(
    () => import("./geometry/G3_4_Transformations.jsx"),
  ),
  G3_5_ConicSections: lazy(() => import("./geometry/G3_5_ConicSections.jsx")),
  G3_6_Vectors: lazy(() => import("./geometry/G3_6_Vectors.jsx")),

  // Geometry Book 4
  G4_1_PrismsCylinders: lazy(
    () => import("./geometry/G4_1_PrismsCylinders.jsx"),
  ),
  G4_2_PyramidsCones: lazy(() => import("./geometry/G4_2_PyramidsCones.jsx")),
  G4_3_Sphere: lazy(() => import("./geometry/G4_3_Sphere.jsx")),
  G4_4_CrossSections: lazy(() => import("./geometry/G4_4_CrossSections.jsx")),

  // Static SVG diagrams — use props: { type: "kinematic-chain" } etc.
  SVGDiagram: lazy(() => import("./SVGDiagram.jsx")),

  // ─── Computer Science ─────────────────────────────────────────────────────
  LogicSim: lazy(() => import("./react/LogicSim.jsx")),

  // ─── Chemistry ────────────────────────────────────────────────────────────
  PeriodicTable: lazy(() => import("./react/PeriodicTable.jsx")),
  MoleculeBuilder: lazy(() => import("./react/MoleculeBuilder.jsx")),

  // ─── Physics Chapter 3: Forces & Newton's Laws ───────────────────────────
  FBDIntuition: lazy(() => import("./react/FBDIntuition.jsx")),
  FBDMethodology: lazy(() => import("./react/FBDMethodology.jsx")),
  FrictionIntuition: lazy(() => import("./react/FrictionIntuition.jsx")),
  FrictionDerivation: lazy(() => import("./react/FrictionDerivation.jsx")),
  StaticsIntuition: lazy(() => import("./react/StaticsIntuition.jsx")),
  StaticsDerivation: lazy(() => import("./react/StaticsDerivation.jsx")),
  ThirdLawIntuition: lazy(() => import("./react/ThirdLawIntuition.jsx")),
  ThirdLawDerivation: lazy(() => import("./react/ThirdLawDerivation.jsx")),
  SecondLawDerivation: lazy(() => import("./react/SecondLawDerivation.jsx")),
  WorkDotProductViz: lazy(() => import("./react/WorkDotProductViz.jsx")),

  // ─── Physics Chapter 4: Projectile & Circular Motion (additional) ────────
  ProjectileBasicsViz: lazy(() => import("./react/ProjectileBasicsViz.jsx")),
  WaveformViz: lazy(() => import("./react/WaveformViz.jsx")),
  IndependenceIntuition: lazy(
    () => import("./react/IndependenceIntuition.jsx"),
  ),
  IndependenceDerivation: lazy(
    () => import("./react/IndependenceDerivation.jsx"),
  ),
  TrajectoryDerivation: lazy(() => import("./react/TrajectoryDerivation.jsx")),
  MaxHeightViz: lazy(() => import("./react/MaxHeightViz.jsx")),
  MaxHeightDerivation: lazy(() => import("./react/MaxHeightDerivation.jsx")),
  RangeDerivation: lazy(() => import("./react/RangeDerivation.jsx")),
  ProjectileExamplesViz: lazy(
    () => import("./react/ProjectileExamplesViz.jsx"),
  ),
  ProjectileSymmetry: lazy(() => import("./react/ProjectileSymmetry.jsx")),
  CentripetalViz: lazy(() => import("./react/CentripetalViz.jsx")),
  CentripetalDerivation: lazy(
    () => import("./react/CentripetalDerivation.jsx"),
  ),
  CircularMotionDerivation: lazy(
    () => import("./react/CircularMotionDerivation.jsx"),
  ),

  // ─── Precalc / Algebra additional vizzes ─────────────────────────────────
  SystemsOfEquationsGeometric: lazy(
    () => import("./react/SystemsOfEquationsGeometric.jsx"),
  ),
  GramSchmidtProcess: lazy(() => import("./react/GramSchmidtProcess.jsx")),
  SecantLineViz: lazy(() => import("./react/SecantLineViz.jsx")),
  SymmetryViz: lazy(() => import("./react/SymmetryViz.jsx")),
  InequalityGeometryViz: lazy(
    () => import("./react/InequalityGeometryViz.jsx"),
  ),
  CeilingFunctionViz: lazy(() => import("./react/CeilingFunctionViz.jsx")),
  BlindChainRuleLab: lazy(() => import("./react/BlindChainRuleLab.jsx")),
  LeastSquaresFit: lazy(() => import("./react/LeastSquaresFit.jsx")),

  // ─── Discrete Math additional vizzes ─────────────────────────────────────
  ProofStrategySelector: lazy(
    () => import("./react/ProofStrategySelector.jsx"),
  ),
  QuantifierNegationPusher: lazy(
    () => import("./react/QuantifierNegationPusher.jsx"),
  ),
};

// Vizzes that work fine on a phone-sized screen
const PHONE_OK = new Set([
  "PythonNotebook",
  "JSNotebook",
  "ScienceNotebook",
  "VideoEmbed",
  "VideoCarousel",
  "VideoLauncher",
]);

function VizSkeleton() {
  return (
    <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg h-64 flex items-center justify-center">
      <span className="text-slate-400 dark:text-slate-500 text-sm">
        Loading visualization…
      </span>
    </div>
  );
}

export default function VizFrame({ id, initialProps = {}, title }) {
  const [params, setParams] = useState(initialProps);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPhone, setIsPhone] = useState(() => window.innerWidth < 640);
  const VizComponent = VIZ_REGISTRY[id];
  const initialPropsKey = useMemo(
    () => JSON.stringify(initialProps ?? {}),
    [initialProps],
  );
  const location = useLocation();
  const { isPinned, addPin, removePin } = usePins();
  const pinId = `${id}::${location.pathname}`;
  const pinned = isPinned(pinId);

  useEffect(() => {
    setParams(initialProps ?? {});
  }, [id, initialPropsKey]);

  useEffect(() => {
    const h = () => setIsPhone(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  if (!VizComponent) {
    if (import.meta.env.DEV) {
      return (
        <div className="my-4 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
          <p className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
            ⚠ Unknown viz id:{" "}
            <span className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
              {id}
            </span>
          </p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
            Register it in VizFrame.jsx → VIZ_REGISTRY
          </p>
        </div>
      );
    }
    return null;
  }

  // On phone-sized screens (< 640px), most interactive vizzes don't work well.
  // Show a "Desktop only" placeholder unless this viz is known to work on phones.
  if (!isExpanded && isPhone && !PHONE_OK.has(id)) {
    return (
      <div id={`viz-${id}`} className="viz-frame rounded-xl overflow-hidden">
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-3xl mb-2">🖥️</span>
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
            Desktop &amp; tablet only
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            This interactive works best on a larger screen
          </p>
        </div>
      </div>
    );
  }

  const content = (
    <Suspense fallback={<VizSkeleton />}>
      <VizComponent params={params} onParamChange={setParams} />
    </Suspense>
  );

  if (isExpanded) {
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-700">
          <h2 className="text-sm font-bold text-white truncate">
            {title || "Interactive Visualizer"}
          </h2>
          <button
            onClick={() => setIsExpanded(false)}
            className="ml-4 flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors"
          >
            ✕ Close
          </button>
        </div>
        {/* Content — fills remaining height, scrolls if needed */}
        <div className="flex-1 overflow-auto bg-white dark:bg-slate-950 p-4 sm:p-6">
          <div className="w-full max-w-5xl mx-auto">{content}</div>
        </div>
      </div>,
      document.body,
    );
  }

  function togglePin() {
    if (pinned) {
      removePin(pinId);
    } else {
      addPin({
        id: pinId,
        title: title || id,
        subtitle: location.pathname
          .replace("/chapter/", "Ch. ")
          .replace("/", " › "),
        path: location.pathname,
        elementId: `viz-${id}`,
      });
    }
  }

  return (
    <div
      id={`viz-${id}`}
      className="viz-frame relative group w-full max-w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-xl"
    >
      {/* ── Dev Mode Label — hidden until html.dev-mode is toggled via Shift+D ── */}
      <div className="dev-viz-label absolute top-0 left-0 z-[9999] items-center gap-1.5 px-2 py-1 rounded-br-lg rounded-tl-xl bg-amber-400 text-slate-900 pointer-events-none select-none">
        <span className="text-[10px] font-black uppercase tracking-widest">
          VIZ
        </span>
        <span className="text-xs font-mono font-bold">{id}</span>
      </div>
      {title && (
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 px-2 pt-2">
          {title}
        </p>
      )}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Pin button — desktop only */}
        <button
          onClick={togglePin}
          title={pinned ? "Unpin" : "Pin this visualization"}
          className={`hidden lg:flex items-center gap-1 px-2 py-1 text-xs font-bold rounded shadow-md border transition-colors ${pinned ? "bg-amber-500 border-amber-400 text-white" : "bg-slate-800 border-slate-600 text-white hover:bg-amber-500 hover:border-amber-400"}`}
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
      <div className="p-2">{content}</div>
    </div>
  );
}
