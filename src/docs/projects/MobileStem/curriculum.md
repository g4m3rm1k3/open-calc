# Mobile STEM & Software Engineering Laboratory

## Complete Build-From-Zero Curriculum

**One mobile application. One continuous codebase. Approximately 160 lessons.**

The learner starts with an empty mobile application and progressively builds a scientific-computing platform in which the phone becomes:

* a software system,
* a mathematical workspace,
* a scientific instrument,
* an experimental laboratory,
* a signal-processing environment,
* a physics laboratory,
* a computer-vision system,
* an embedded-device interface,
* and ultimately a general scientific-computing platform.

Every lesson adds a permanent capability to the same application.

---

# CURRICULUM CONTRACT

Every lesson follows:

```text
USER STORY
    ↓
BUILD
    ↓
TEACH
    ↓
TEST
    ↓
INTEGRATE
    ↓
VISIBLE RESULT
```

Each lesson must explicitly identify:

* **User Story**
* **Permanent Capability**
* **STEM Concepts**
* **Mathematics**
* **Software Engineering**
* **Existing Systems Reused**
* **Architecture Change**
* **Tests**
* **Visible Result**

### Architectural Rule

Never create a throwaway implementation when the application already contains a subsystem that can be generalized.

If the architecture cannot support the new requirement:

```text
new requirement
      ↓
architectural limitation
      ↓
refactor/generalize
      ↓
new capability
      ↓
existing features continue working
```

---

# PART I — COMPUTATIONAL FOUNDATION

## Lesson 1 — Create the STEM Lab

**Build:** Application shell, home screen, navigation, major application areas.

**Teach:** Mobile application structure, screens, components, state, event handling, separation of UI and domain logic.

**Engineering:** Project structure, source control, build/run cycle, debugging.

**Result:** Empty STEM Lab application.

---

## Lesson 2 — Build the Instrument Dashboard

**Build:** Instrument cards, capabilities, unavailable states, metadata.

**Teach:** Capability detection, domain models, reusable components, state-driven UI.

**Engineering:** Interfaces and abstraction boundaries.

**Result:** The phone reports which scientific instruments it provides.

---

## Lesson 3 — Build the Experiment Workspace

**Build:** Configure/run/stop/save experiment workflow.

**Teach:** State machines, lifecycle, state transitions.

**Engineering:** Separation of presentation state from domain state.

**Result:** A generic experiment can be executed.

---

## Lesson 4 — Build the Experiment Registry

**Build:** Experiment IDs, metadata, categories, requirements, dynamic registration.

**Teach:** Registries, metadata-driven architecture, dependency discovery.

**Engineering:** Open/closed design and plugin-like architecture.

**Result:** Experiments become discoverable without hardcoded navigation.

---

## Lesson 5 — Build the Scientific Data Model

**Build:**

```text
Experiment
 └── Session
      └── Trial
           └── Dataset
                └── Channel
                     └── Sample
```

**Teach:** Entities, relationships, time-series data, provenance.

**Engineering:** Domain modeling and immutable measurement records.

**Result:** One common representation exists for all future scientific data.

---

## Lesson 6 — Build Quantity and Unit Types

**Build:** Quantity/value/unit representation.

**Teach:** Physical dimensions, SI units, derived units, conversion.

**Engineering:** Type-safe domain modeling.

**Result:** The application can distinguish `5 m`, `5 s`, and `5 m/s`.

---

## Lesson 7 — Build Dimensional Analysis

**Build:** Unit compatibility and dimensional validation.

**Teach:** Dimensional equations, dimensional consistency, derived quantities.

**Engineering:** Validation and domain constraints.

**Result:** Invalid scientific operations can be detected automatically.

---

## Lesson 8 — Build the Function Laboratory

**Build:** Functions with variables, parameters, evaluation, and graphs.

**Teach:** Independent/dependent variables, domain, range, parameters, composition.

**Engineering:** Function objects and reusable computation.

**Result:** Mathematical functions become executable application objects.

---

## Lesson 9 — Build the Measurement Simulator

**Build:** Simulated accelerometer, gyroscope, microphone, GPS.

**Teach:** Simulation, noise, timestamps, sampling rates.

**Engineering:** Interfaces, dependency injection, deterministic testing.

**Result:** The entire measurement architecture works without hardware.

---

## Lesson 10 — Build the Test Harness

**Build:** Unit-test infrastructure for scientific calculations and domain objects.

**Teach:** Assertions, test cases, fixtures, deterministic inputs.

**Engineering:** Unit testing and regression testing.

**Result:** Scientific algorithms can be changed without silently breaking earlier work.

---

# PART II — MEASUREMENT AND DATA ENGINEERING

## Lesson 11 — Connect the Accelerometer

**Build:** Real accelerometer acquisition.

**Teach:** Sensor APIs, event streams, lifecycle, hardware abstraction.

**Result:** Phone motion becomes live scientific data.

---

## Lesson 12 — Build the Generic Measurement Stream

**Build:** Generic acquisition interface.

**Teach:** Producers, consumers, streams, events.

**Engineering:** Dependency inversion and adapters.

**Result:** Any compatible sensor can feed the same pipeline.

---

## Lesson 13 — Build the Live Graph

**Build:** Scrolling multi-channel graph.

**Teach:** Time-series visualization and sampling.

**Engineering:** Rendering performance and circular buffers.

**Result:** Live sensor data is visualized.

---

## Lesson 14 — Build the Ring Buffer

**Build:** Fixed-size streaming buffer.

**Teach:** Arrays, queues, circular indexing, memory bounds.

**Engineering:** Data structures and performance.

**Result:** Live streams operate without unbounded memory growth.

---

## Lesson 15 — Record Measurement Sessions

**Build:** Start/stop recording, metadata, sample counts, duration.

**Teach:** Streaming data, buffering, measurement integrity.

**Result:** Sensor streams become datasets.

---

## Lesson 16 — Persist Experiments

**Build:** Local database/storage.

**Teach:** Serialization, persistence, schema.

**Engineering:** Repository abstraction and storage boundaries.

**Result:** Experiments survive application restarts.

---

## Lesson 17 — Build Schema Migration

**Build:** Versioned scientific-data schema.

**Teach:** Schema evolution and backward compatibility.

**Engineering:** Database migrations.

**Result:** Future application versions can read older experiments.

---

## Lesson 18 — Build Import and Export

**Build:** CSV and JSON export/import.

**Teach:** Structured data and interchange formats.

**Engineering:** Serialization boundaries.

**Result:** Scientific datasets can leave and re-enter the application.

---

## Lesson 19 — Build the Measurement Table

**Build:** Virtualized tabular dataset viewer.

**Teach:** Tables, selection, indexing.

**Engineering:** Large-data UI and virtualization.

**Result:** Individual samples can be inspected.

---

## Lesson 20 — Build the Experiment Library

**Build:** Search, sorting, filtering, recent experiments.

**Teach:** Searching and indexing.

**Engineering:** Query architecture and indexed persistence.

**Result:** The application can manage many experiments.

---

# PART III — NUMBERS, VECTORS, AND GEOMETRY

## Lesson 21 — Build the Scalar Laboratory

**Build:** Scalar calculations and visualization.

**Teach:** Magnitude, signed values, ranges, precision.

**Engineering:** Numeric types and validation.

---

## Lesson 22 — Build the Vector Laboratory

**Build:** Vector type and operations.

**Teach:** Addition, subtraction, magnitude, normalization.

**Engineering:** Value objects and mathematical APIs.

---

## Lesson 23 — Build Dot Products

**Teach:** Projection, angle relationships, orthogonality.

**Engineering:** Generic vector operations.

---

## Lesson 24 — Build Cross Products

**Teach:** Perpendicular vectors, orientation, torque intuition.

**Engineering:** Three-dimensional vector operations.

---

## Lesson 25 — Build Coordinate Frames

**Build:** Device/world/local coordinate representations.

**Teach:** Reference frames and coordinate systems.

**Result:** Measurements become spatially meaningful.

---

## Lesson 26 — Build Vector Visualization

**Build:** 3D vector arrows and coordinate axes.

**Teach:** Components and geometric interpretation.

**Result:** Sensor vectors become visible geometry.

---

## Lesson 27 — Build the Matrix Laboratory

**Build:** Matrix representation and operations.

**Teach:** Multiplication, transpose, determinant, inverse.

**Engineering:** Generic matrix abstraction.

---

## Lesson 28 — Build Matrix-Vector Transformations

**Teach:** Linear transformations and basis changes.

**Result:** Vectors can be transformed between coordinate systems.

---

## Lesson 29 — Build Transformation Composition

**Build:** Chained transformations.

**Teach:** Transformation composition and reference frames.

**Engineering:** Transformation pipeline.

---

## Lesson 30 — Refactor Existing Sensor Math

**Build:** Replace ad-hoc vector/matrix calculations.

**Teach:** Refactoring and abstraction extraction.

**Engineering:** Safe architectural change and regression testing.

**Result:** All earlier sensor features use the common math engine.

---

# PART IV — CALCULUS THROUGH MEASUREMENT

## Lesson 31 — Build Numerical Differentiation

**Build:** Forward and central differences.

**Teach:** Derivatives, finite differences, step size.

**Result:** Measured data can produce numerical derivatives.

---

## Lesson 32 — Study Derivative Noise

**Build:** Compare derivatives at different sampling rates/noise levels.

**Teach:** Noise amplification and numerical error.

**Engineering:** Experimental algorithm evaluation.

---

## Lesson 33 — Build Numerical Integration

**Build:** Euler and trapezoidal integration.

**Teach:** Accumulation, initial conditions, quadrature.

---

## Lesson 34 — Build Integration Error Analysis

**Teach:** Step size, accumulated error, drift.

**Engineering:** Numerical benchmarking.

---

## Lesson 35 — Build the Calculus Graph

**Build:** Display:

```text
position
velocity
acceleration
```

and their derivative/integral relationships.

**Teach:** Derivative/integral as inverse operations.

---

## Lesson 36 — Build the Acceleration Magnitude Meter

**Build:** `sqrt(x²+y²+z²)`.

**Teach:** Euclidean norm and derived measurements.

---

## Lesson 37 — Build the Gravity Meter

**Build:** Stillness detection, averaging, statistics.

**Teach:** Experimental estimation and measurement noise.

---

## Lesson 38 — Build the Digital Spirit Level

**Build:** Pitch, roll, gravity vector, level threshold.

**Teach:** Trigonometry and coordinate frames.

---

## Lesson 39 — Build Accelerometer Calibration

**Build:** Bias measurement, correction, persistence.

**Teach:** Calibration, systematic error, reference measurements.

---

## Lesson 40 — Build Motion Event Detection

**Build:** Shake, impact, free fall, sudden acceleration, sudden stop.

**Teach:** Thresholds, windows, event classification.

**Result:** Events become annotations on scientific datasets.

---

# PART V — STATISTICS AND EXPERIMENTAL SCIENCE

## Lesson 41 — Build Descriptive Statistics

**Build:** Mean, median, min, max, range, variance, standard deviation.

**Teach:** Population vs sample.

---

## Lesson 42 — Build Histograms

**Teach:** Distributions, bins, frequency, variability.

---

## Lesson 43 — Build Percentiles and Quantiles

**Teach:** Distribution shape and robust statistics.

---

## Lesson 44 — Build Correlation

**Teach:** Covariance, correlation coefficient, relationship vs causation.

---

## Lesson 45 — Build Outlier Detection

**Build:** Statistical outlier identification.

**Teach:** Robust analysis and anomaly detection.

---

## Lesson 46 — Build Repeated Trials

**Build:** Multiple trials per experiment.

**Teach:** Replication and between-trial variation.

---

## Lesson 47 — Build Trial Aggregation

**Build:** Mean trial, variance between trials, overlays.

**Teach:** Experimental replication.

---

## Lesson 48 — Build Measurement Uncertainty

**Teach:** Accuracy, precision, random/systematic error.

---

## Lesson 49 — Build Error Propagation

**Teach:** Propagation through mathematical functions.

**Result:** Derived measurements can carry uncertainty.

---

## Lesson 50 — Build Confidence Intervals

**Teach:** Sampling distributions and confidence intervals.

---

## Lesson 51 — Build Linear Regression

**Build:** Slope, intercept, R², best-fit line.

**Teach:** Least squares and model parameters.

---

## Lesson 52 — Build Residual Analysis

**Build:** Residual dataset and graph.

**Teach:** Model error, systematic error, random error.

---

## Lesson 53 — Build Calibration Curves

**Build:** Reference data → fitted correction function.

**Teach:** Calibration and systematic error correction.

---

## Lesson 54 — Build Scientific Reports

**Build:** Question, hypothesis, procedure, data, analysis, model, uncertainty, conclusion.

**Teach:** Reproducibility and provenance.

---

# PART VI — DIGITAL SIGNAL PROCESSING

## Lesson 55 — Build the Signal Inspector

**Build:** Duration, sample count, rate, RMS, statistics.

**Teach:** Signal characterization.

---

## Lesson 56 — Build the Sampling Laboratory

**Build:** Continuous waveform simulator, sampling controls.

**Teach:** Sampling theorem and discrete signals.

The existing curriculum already has this excellent idea: deliberately create aliasing so the learner sees the consequence rather than merely reading about Nyquist.

---

## Lesson 57 — Build Aliasing Experiments

**Teach:** Nyquist limit, alias frequencies, reconstruction limitations.

---

## Lesson 58 — Build Convolution

**Build:** Generic discrete convolution.

**Teach:** Kernel/window operations.

---

## Lesson 59 — Build Moving-Average Filtering

**Teach:** Smoothing and noise/responsiveness tradeoff.

---

## Lesson 60 — Build Low-Pass Filtering

**Teach:** Cutoff frequency and frequency-domain interpretation.

---

## Lesson 61 — Build High-Pass Filtering

**Teach:** Removing low-frequency components.

---

## Lesson 62 — Build Filter Comparison

**Build:** Multiple filters against one signal.

**Teach:** Filter behavior and tradeoffs.

---

## Lesson 63 — Build Window Functions

**Teach:** Spectral leakage and windowing.

---

## Lesson 64 — Build the DFT Laboratory

**Build:** Direct discrete Fourier transform.

**Teach:** Frequency-domain representation.

---

## Lesson 65 — Build the FFT

**Build:** Efficient FFT implementation.

**Teach:** Algorithmic decomposition and computational complexity.

**Engineering:** O(n²) vs O(n log n).

---

## Lesson 66 — Build Spectrum Visualization

**Build:** Frequency bins, magnitude, phase.

---

## Lesson 67 — Build Peak Detection

**Teach:** Local maxima, thresholds, peak prominence.

---

## Lesson 68 — Build Live Frequency Tracking

**Build:** Streaming FFT and dominant-frequency tracking.

The existing curriculum correctly makes the FFT reusable so the microphone and later instruments consume the same engine.

---

## Lesson 69 — Build the Microphone Oscilloscope

**Build:** Microphone waveform acquisition.

**Teach:** Audio sampling and continuous streams.

---

## Lesson 70 — Build the Audio Spectrum Analyzer

**Build:** Fundamental/harmonic analysis.

---

## Lesson 71 — Build the Scientific Tuner

**Teach:** Frequency error and logarithmic pitch relationships.

---

## Lesson 72 — Build the Resonance Experiment

**Build:** Frequency sweep and resonance detection.

**Teach:** Frequency response and resonance.

---

## Lesson 73 — Build the Doppler Experiment

**Build:** Frequency shift → velocity estimate.

**Teach:** Doppler effect and physical modeling.

---

# PART VII — ROTATION AND 3D MATHEMATICS

## Lesson 74 — Connect the Gyroscope

**Build:** Angular velocity acquisition.

---

## Lesson 75 — Build Angular Integration

**Build:** Angular velocity → angle.

**Teach:** Numerical integration and drift.

---

## Lesson 76 — Build the 3D Orientation Viewer

**Build:** Virtual phone/cube.

**Teach:** 3D transformations.

---

## Lesson 77 — Build Rotation Matrices

**Teach:** Rotation about X/Y/Z axes.

---

## Lesson 78 — Build Euler Angles

**Teach:** Roll, pitch, yaw and their limitations.

---

## Lesson 79 — Build Quaternions

**Teach:** Quaternion representation and composition.

---

## Lesson 80 — Build Quaternion/Matrix/Euler Conversion

**Teach:** Equivalent rotation representations.

---

## Lesson 81 — Build Gyroscope Drift Analysis

**Teach:** Bias, integration drift, accumulated error.

---

## Lesson 82 — Connect the Magnetometer

**Build:** Magnetic-field measurement.

---

## Lesson 83 — Build the Compass

**Teach:** Heading and magnetic north.

---

## Lesson 84 — Build Magnetic Calibration

**Teach:** Hard-iron and soft-iron distortion.

---

## Lesson 85 — Build Sensor Fusion

**Build:** Accelerometer + gyroscope + magnetometer.

**Teach:** Complementary information and sensor fusion.

The existing design already establishes this as a multi-stream architecture rather than a special compass implementation.

---

## Lesson 86 — Build the Orientation Experiment

**Build:** Synchronized accelerometer/gyro/magnetometer/orientation dataset.

**Teach:** Sensor synchronization and derived streams.

---

# PART VIII — PHYSICS I: MECHANICS

## Lesson 87 — Build the Free-Fall Experiment

**Build:** Measure acceleration during free fall.

**Teach:** Gravity and experimental limitations.

---

## Lesson 88 — Build Velocity Measurement

**Build:** Acceleration → velocity.

**Teach:** Initial conditions and drift.

---

## Lesson 89 — Build Position Measurement

**Build:** Acceleration → velocity → position.

**Teach:** Error accumulation.

---

## Lesson 90 — Build the Pendulum Experiment

**Build:** Length, period, repeated trials, g estimate.

**Teach:** Periodic motion and pendulum model.

---

## Lesson 91 — Build Pendulum Regression

**Teach:** Linearization and regression.

---

## Lesson 92 — Build the Spring Experiment

**Build:** Mass, period, trials, regression.

**Teach:** Harmonic motion.

---

## Lesson 93 — Build Energy Measurement

**Build:** Kinetic and potential energy calculations.

**Teach:** Energy and conservation.

---

## Lesson 94 — Build Momentum

**Build:** Momentum and impulse calculator/experiment.

**Teach:** Conservation of momentum.

---

## Lesson 95 — Build Collision Analysis

**Build:** Measure before/after velocities.

**Teach:** Momentum conservation and experimental error.

---

## Lesson 96 — Build Projectile Measurement

**Build:** Camera tracking → physical trajectory.

**Teach:** 2D kinematics.

---

# PART IX — CAMERA AND COMPUTER VISION

The existing camera section is structurally strong because camera frames enter the same measurement architecture as physical sensors.

## Lesson 97 — Build the Camera Instrument

**Build:** Camera acquisition and metadata.

---

## Lesson 98 — Build the Pixel Inspector

**Teach:** Pixels, RGB, luminance, image coordinates.

---

## Lesson 99 — Build Image Histograms

**Teach:** Intensity distributions.

---

## Lesson 100 — Build Image Processing

**Build:** Grayscale, contrast, blur, sharpen, threshold.

---

## Lesson 101 — Build Image Convolution

**Build:** Editable kernels.

**Teach:** Neighborhood operations and convolution.

---

## Lesson 102 — Build Image Gradients

**Teach:** Derivatives in two dimensions.

---

## Lesson 103 — Build Edge Detection

**Teach:** Gradient-based feature extraction.

---

## Lesson 104 — Build Threshold Segmentation

**Teach:** Binary classification of pixels.

---

## Lesson 105 — Build Connected Components

**Teach:** Graph-like image regions and object labeling.

---

## Lesson 106 — Build Feature Detection

**Teach:** Image features and correspondence.

---

## Lesson 107 — Build Feature Tracking

**Build:** Frame-to-frame motion tracking.

**Teach:** Temporal correspondence.

---

## Lesson 108 — Build Optical Motion Measurement

**Build:** Pixels → calibrated distance → velocity.

**Teach:** Scale calibration and numerical differentiation.

---

## Lesson 109 — Build Camera Calibration

**Build:** Intrinsic calibration workflow.

**Teach:** Focal length, principal point, distortion.

---

## Lesson 110 — Build Perspective Transformation

**Build:** Four-point selection and rectification.

**Teach:** Homogeneous coordinates and projective geometry.

The existing curriculum already identifies homogeneous coordinates and projective geometry here; the important change is moving the general transformation machinery earlier so this becomes an application of it.

---

## Lesson 111 — Build the Optical Tachometer

**Build:** Periodic visual motion → RPM.

**Teach:** Frequency analysis and aliasing.

---

## Lesson 112 — Build the Projectile Measurement System

**Build:** Track projectile and reconstruct trajectory.

**Teach:** Coordinate transformation, timing, velocity, acceleration.

---

# PART X — EARTH AND SPATIAL MEASUREMENT

## Lesson 113 — Connect the Barometer

**Build:** Pressure instrument.

**Teach:** Atmospheric pressure and sampling.

---

## Lesson 114 — Build the Altimeter

**Build:** Pressure → altitude model.

**Teach:** Atmospheric model assumptions.

---

## Lesson 115 — Build Vertical Motion Detection

**Build:** Pressure trend + accelerometer.

**Teach:** Multi-sensor correlation.

The existing curriculum uses this exact combination and correctly feeds the result into the synchronized-data/event architecture.

---

## Lesson 116 — Connect GPS

**Build:** Latitude, longitude, altitude, speed, bearing, accuracy.

---

## Lesson 117 — Build GPS Track Recording

**Build:** Geographic time series.

---

## Lesson 118 — Build Track Analysis

**Build:** Map, speed, elevation, acceleration.

---

## Lesson 119 — Build Geographic Distance

**Teach:** Geographic distance and displacement.

---

## Lesson 120 — Build Local Coordinate Systems

**Build:** Geographic → local X/Y/Z.

**Teach:** Local tangent frames and transformations.

---

## Lesson 121 — Build Spatial Measurement

**Build:** Distance, bearing, displacement, velocity.

---

# PART XI — PHYSICS II: DYNAMICAL SYSTEMS

## Lesson 122 — Build the General State Model

**Build:**

```text
state
derivative
parameters
time
```

**Teach:** Dynamical systems and state variables.

---

## Lesson 123 — Build the General ODE Interface

**Build:** Model-independent differential-equation interface.

**Teach:** Ordinary differential equations.

---

## Lesson 124 — Build the Euler Integrator

**Teach:** Discretization and numerical error.

---

## Lesson 125 — Build the RK4 Integrator

**Teach:** Runge-Kutta methods and higher-order integration.

---

## Lesson 126 — Build Integrator Comparison

**Build:** Accuracy/runtime/step-size comparison.

**Teach:** Stability and computational cost.

The current curriculum already has this strong comparison laboratory; it should remain, but now it sits inside a general numerical-methods subsystem.

---

## Lesson 127 — Build the Projectile Simulator

**Build:** Initial velocity, angle, height, gravity.

---

## Lesson 128 — Build the Pendulum Simulator

**Teach:** Nonlinear dynamical systems.

---

## Lesson 129 — Build the Spring-Mass Simulator

**Teach:** Harmonic oscillators.

---

## Lesson 130 — Build Damping

**Build:** Damped oscillator.

**Teach:** Energy loss and differential equations.

---

## Lesson 131 — Build Driven Oscillation

**Teach:** Driving force and frequency response.

---

## Lesson 132 — Build Resonance Simulation

**Build:** Simulated resonance curve.

**Teach:** Model vs measured frequency response.

---

## Lesson 133 — Build Simulation Recording

**Build:** Simulated states stored as datasets.

**Result:** Simulation and measurement now use the same data model.

---

## Lesson 134 — Build Simulation-vs-Measurement Comparison

**Build:** Overlay and error metrics.

**Teach:** Model validation.

---

# PART XII — PROBABILITY, ESTIMATION, AND MODEL FITTING

## Lesson 135 — Build Random Variables

**Build:** Random-data laboratory.

**Teach:** Random variables and distributions.

---

## Lesson 136 — Build Probability Distributions

**Build:** Normal, uniform, exponential distributions.

**Teach:** Distribution parameters.

---

## Lesson 137 — Build Monte Carlo Simulation

**Build:** Repeated random experiments.

**Teach:** Sampling and empirical probability.

---

## Lesson 138 — Build Uncertainty Propagation Laboratory

**Build:** Monte Carlo vs analytical uncertainty propagation.

**Teach:** Error propagation from a probabilistic perspective.

---

## Lesson 139 — Build Parameter Estimation

**Build:** Estimate unknown physical parameters from measurements.

**Teach:** Inverse problems.

---

## Lesson 140 — Build Objective Functions

**Build:** Model error/loss function.

**Teach:** Optimization formulation.

---

## Lesson 141 — Build Parameter Sweeps

**Build:** Systematically vary parameters and visualize error.

**Teach:** Search spaces and sensitivity.

---

## Lesson 142 — Build Optimization

**Build:** Generic optimization workspace.

**Teach:** Objective functions, parameters, search.

---

## Lesson 143 — Build Gradient Descent

**Teach:** Gradients and iterative optimization.

---

## Lesson 144 — Build Sensitivity Analysis

**Build:** Determine which parameters affect results most.

---

## Lesson 145 — Build Model Calibration

**Build:** Fit a physical model to measured data.

**Teach:** Parameter estimation and calibration.

---

# PART XIII — ELECTRICAL ENGINEERING

This is the major STEM branch missing from the original 128-lesson structure.

## Lesson 146 — Build the Electrical Quantity Laboratory

**Build:** Voltage, current, resistance, power calculator.

**Teach:** Electrical quantities and units.

---

## Lesson 147 — Build Ohm's Law

**Build:** Interactive V-I-R relationships.

**Teach:** Ohm's law.

---

## Lesson 148 — Build Series Circuits

**Teach:** Voltage/current relationships.

---

## Lesson 149 — Build Parallel Circuits

**Teach:** Equivalent resistance.

---

## Lesson 150 — Build Electrical Power

**Teach:** `P = VI`, energy consumption.

---

## Lesson 151 — Build the RC Simulator

**Teach:** Capacitors, charging/discharging, exponential behavior.

---

## Lesson 152 — Build Analog Signals

**Build:** Voltage waveform simulator.

**Teach:** Analog signals, amplitude, frequency, phase.

---

## Lesson 153 — Build ADC Simulation

**Teach:** Quantization, resolution, sampling.

---

## Lesson 154 — Build DAC Simulation

**Teach:** Digital-to-analog reconstruction.

---

## Lesson 155 — Connect an External Electrical Sensor

**Build:** External voltage/current/temperature measurement.

**Teach:** Hardware acquisition and calibration.

---

# PART XIV — EMBEDDED SYSTEMS AND COMMUNICATION

## Lesson 156 — Build the NFC Laboratory

**Build:** NFC tag detection and structured data.

**Teach:** Near-field communication and records.

The existing curriculum already uses NFC as a bridge between physical devices and the scientific metadata system.

---

## Lesson 157 — Build the BLE Scanner

**Build:** Device discovery.

**Teach:** BLE architecture.

---

## Lesson 158 — Build BLE Services and Characteristics

**Teach:** Service discovery, characteristics, read/write operations.

---

## Lesson 159 — Build BLE Connection Management

**Teach:** Asynchronous communication and connection state.

---

## Lesson 160 — Build Binary Protocols

**Build:** Encode/decode structured measurement packets.

**Teach:** Bytes, framing, serialization, endianness.

---

## Lesson 161 — Build Checksums

**Build:** Checksum and CRC validation.

**Teach:** Error detection and data integrity.

The existing curriculum already includes parity/checksum/CRC and a corruption simulator; this should remain because it turns an abstract networking concept into an experimentally observable one.

---

## Lesson 162 — Build External Sensor Integration

**Build:**

```text
Phone Sensor ─┐
              ├── Measurement Pipeline
BLE Sensor ───┘
```

**Teach:** Adapters, protocol boundaries, hardware abstraction.

---

## Lesson 163 — Build Sensor Synchronization

**Teach:** Clock differences, timestamps, alignment.

---

## Lesson 164 — Build Sensor Latency Analysis

**Build:** Measure acquisition/communication latency.

---

## Lesson 165 — Build Sensor Comparison

**Build:** Bias, noise, latency, correlation, difference.

**Teach:** Sensor characterization.

The existing design already correctly treats this as an application of generic datasets, synchronization, statistics, and uncertainty.

---

# PART XV — ALGORITHMS AND DATA STRUCTURES IN THE APPLICATION

## Lesson 166 — Build Search

**Build:** Experiment/data search.

**Teach:** Linear and indexed search, complexity.

---

## Lesson 167 — Build Sorting

**Build:** Sort experiments and datasets.

**Teach:** Comparison sorting and complexity.

---

## Lesson 168 — Build Hash-Based Lookup

**Build:** Fast experiment/channel lookup.

**Teach:** Hash tables and expected O(1) lookup.

---

## Lesson 169 — Build Priority Queues

**Build:** Analysis/task scheduling queue.

**Teach:** Priority queues and heaps.

---

## Lesson 170 — Build Graph Data Structures

**Build:** Represent relationships between processing operations.

**Teach:** Graphs and traversal.

---

## Lesson 171 — Build the Processing DAG

**Build:**

```text
raw
 ↓
calibrate
 ↓
filter
 ↓
transform
 ↓
derive
 ↓
analyze
```

**Teach:** Directed acyclic graphs and dependency relationships.

---

## Lesson 172 — Build Dirty-Flag Propagation

**Build:** Automatically recompute downstream results after upstream data changes.

**Teach:** Dependency graphs, invalidation, incremental computation.

---

## Lesson 173 — Build Cached Analysis

**Build:** Cache expensive derived datasets.

**Teach:** Memoization, cache invalidation.

---

## Lesson 174 — Build Large-Dataset Processing

**Build:** Process hundreds of thousands/millions of samples without freezing UI.

**Teach:** Complexity, memory locality, streaming algorithms.

---

# PART XVI — CONCURRENCY AND PERFORMANCE

## Lesson 175 — Build Background Analysis

**Build:** Run expensive analysis away from the UI thread.

**Teach:** Concurrency and asynchronous execution.

---

## Lesson 176 — Build Cancellation

**Build:** Cancel long-running FFT/simulation/import operations.

**Teach:** Cooperative cancellation.

---

## Lesson 177 — Build Progress Reporting

**Build:** Progress model for long-running computations.

**Teach:** Task state and UI synchronization.

---

## Lesson 178 — Build Performance Profiling

**Build:** Instrument execution time and memory.

**Teach:** Profiling and measurement-driven optimization.

---

## Lesson 179 — Build Benchmarking

**Build:** Benchmark numerical algorithms.

**Teach:** Benchmark methodology and algorithmic complexity.

---

## Lesson 180 — Optimize the Scientific Pipeline

**Build:** Identify and eliminate actual bottlenecks.

**Teach:** Performance engineering.

**Rule:** No optimization without measurement.

---

# PART XVII — SCIENTIFIC SOFTWARE ENGINEERING

## Lesson 181 — Build Structured Logging

**Build:** Application/system/scientific logs.

**Teach:** Logging levels, structured events, diagnostic context.

---

## Lesson 182 — Build Error Handling

**Build:** Domain errors, hardware errors, storage errors, recoverable failures.

**Teach:** Exceptions/errors, recovery boundaries.

---

## Lesson 183 — Build Validation

**Build:** Validate experiment configuration and scientific data.

**Teach:** Invariants and defensive programming.

---

## Lesson 184 — Build Integration Tests

**Build:** Sensor → pipeline → persistence tests.

**Teach:** Integration testing.

---

## Lesson 185 — Build Property Tests

**Build:** Mathematical invariants.

Examples:

```text
|v| >= 0
rotation preserves vector magnitude
unit conversion is reversible
```

**Teach:** Property-based testing.

---

## Lesson 186 — Build Golden Scientific Datasets

**Build:** Known datasets with expected outputs.

**Teach:** Regression testing for numerical software.

---

## Lesson 187 — Build Reproducible Experiments

**Build:** Store configuration, software version, model version, calibration version, and data provenance.

**Teach:** Reproducibility.

---

## Lesson 188 — Build Versioned Analysis Pipelines

**Build:** Record which processing operations generated a result.

**Teach:** Provenance and reproducible computation.

---

# PART XVIII — PRODUCTION APPLICATION ARCHITECTURE

## Lesson 189 — Build Experiment Templates

**Build:** Gravity, free fall, pendulum, projectile, vibration, sound, magnetic-field, motion, custom templates.

**Teach:** Configuration schemas and reusable workflows.

---

## Lesson 190 — Build Experiment Duplication

**Build:** Duplicate configuration while preserving provenance.

---

## Lesson 191 — Build Scientific Notes

**Build:** Notes attached to experiments, trials, measurements, graphs, and results.

---

## Lesson 192 — Build Experiment Detail

**Build:** One complete scientific record.

```text
configuration
measurements
trials
graphs
statistics
models
results
notes
provenance
```

---

## Lesson 193 — Build Scientific Data Export

**Build:** CSV, JSON, images, structured experiment data.

---

## Lesson 194 — Build Scientific Reports

**Build:** Complete generated report.

**Teach:** Artifact composition and reproducibility.

---

## Lesson 195 — Build Background Measurement

**Build:** Continue measurement outside foreground UI where platform rules permit.

**Teach:** Mobile lifecycle and background execution.

---

## Lesson 196 — Build Resource Management

**Build:** Correctly release sensors, camera, microphone, connections, storage, and computation resources.

**Teach:** Resource ownership and lifecycle.

---

## Lesson 197 — Build Permissions Architecture

**Build:** Central permission handling.

**Teach:** Least privilege and capability boundaries.

---

## Lesson 198 — Build Privacy Controls

**Build:** Data deletion, export, permission state, local-data controls.

**Teach:** Privacy-by-design.

---

# PART XIX — DIGITAL TWIN AND SCIENTIFIC COMPUTING

## Lesson 199 — Build the General Simulation Library

**Build:** Common model interface.

**Teach:** Model abstraction.

---

## Lesson 200 — Build the Simulation Engine

**Build:**

```text
Model
Integrator
State
Parameters
Time
Results
```

---

## Lesson 201 — Build Simulation Controls

**Build:** Pause, reset, time step, playback speed, parameters.

---

## Lesson 202 — Build Simulation Data Recording

**Build:** Simulation states use the Dataset model.

---

## Lesson 203 — Build Model/Measurement Overlay

**Build:** Real and simulated datasets on one graph.

---

## Lesson 204 — Build RMSE and Model Error

**Teach:** Error metrics and model evaluation.

---

## Lesson 205 — Build Parameter Fitting

**Build:** Estimate model parameters from experimental data.

---

## Lesson 206 — Build Parameter Sweeps

**Build:** Run many simulations across parameter ranges.

---

## Lesson 207 — Build Sensitivity Analysis

**Build:** Parameter influence visualization.

---

## Lesson 208 — Build Model Uncertainty

**Build:** Propagate parameter uncertainty through simulations.

---

## Lesson 209 — Build the Digital Twin

**Build:**

```text
REAL SYSTEM
     ↕
MEASUREMENTS
     ↕
MATHEMATICAL MODEL
     ↕
SIMULATION
```

**Teach:** Digital twins, calibration, model validation.

---

# PART XX — ADVANCED STATE ESTIMATION

## Lesson 210 — Build the Physical State Model

**Build:** Unified state:

```text
position
velocity
acceleration
orientation
angular velocity
altitude
```

**Teach:** State representation.

---

## Lesson 211 — Build Sensor Confidence

**Build:** Confidence metadata for measurements.

**Teach:** Measurement quality.

---

## Lesson 212 — Build Multi-Sensor State Estimation

**Build:** Combine independent measurements into one estimate.

**Teach:** State estimation.

---

## Lesson 213 — Build the Prediction/Correction Model

**Build:** Predict state → receive measurement → correct state.

**Teach:** Recursive estimation.

---

## Lesson 214 — Build a Basic Kalman Filter

**Build:** Linear state estimator.

**Teach:** State-space models, covariance, prediction, correction.

---

## Lesson 215 — Build Sensor-Fusion Diagnostics

**Build:** Compare raw sensors, predicted state, corrected state.

---

## Lesson 216 — Build the Unified Motion Instrument

**Build:** One instrument reporting:

```text
position
velocity
orientation
altitude
motion state
confidence
```

**Result:** The phone becomes a general physical-state measurement system.

---

# PART XXI — FINAL SCIENTIFIC COMPUTING PLATFORM

## Lesson 217 — Build the Analysis Pipeline Editor

**Build:** Visual pipeline:

```text
Acquire
  ↓
Calibrate
  ↓
Filter
  ↓
Transform
  ↓
Derive
  ↓
Analyze
  ↓
Visualize
```

**Teach:** DAGs, composition, dataflow programming.

---

## Lesson 218 — Build Reusable Analysis Operations

**Build:** Operations become discoverable components.

**Teach:** Plugin architecture and composability.

---

## Lesson 219 — Build Custom Experiments

**Build:** User-defined experiment configuration.

**Teach:** Declarative application design.

---

## Lesson 220 — Build Custom Models

**Build:** User-defined mathematical models.

**Teach:** Model interfaces and parameterization.

---

## Lesson 221 — Build Custom Sensors

**Build:** User-defined measurement sources.

**Teach:** Extension architecture.

---

## Lesson 222 — Build Custom Visualizations

**Build:** User-defined graph/visualization components.

---

## Lesson 223 — Build Scientific Workflow Reproduction

**Build:** Re-run an old experiment from its recorded configuration and pipeline.

**Teach:** Determinism, provenance, reproducibility.

---

## Lesson 224 — Build Experiment Comparison

**Build:** Compare arbitrary experiments, datasets, models, and trials.

**Teach:** Generalized comparison architecture.

---

## Lesson 225 — Build the Scientific Workspace

**Build:** Unified workspace containing:

```text
Experiment
Data
Math
Analysis
Simulation
Visualization
Report
```

---

## Lesson 226 — Stress-Test the Platform

**Build:** Large datasets, many experiments, multiple sensors, long-running simulations.

**Teach:** Scalability and failure analysis.

---

## Lesson 227 — Architectural Refactoring

**Build:** Identify duplicated abstractions and consolidate them.

**Teach:** Refactoring, architecture evaluation, technical debt.

---

## Lesson 228 — Final Security and Reliability Pass

**Build:** Validate permissions, persistence, error handling, corruption detection, recovery, and data integrity.

---

## Lesson 229 — Final Performance Pass

**Build:** Profile and optimize actual bottlenecks.

---

## Lesson 230 — Build the Final STEM Laboratory

**Final capability:**

```text
                       STEM LAB
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       MEASURE         EXPERIMENT        SIMULATE
          │                │                │
     ┌────┼────┐      ┌────┼────┐      ┌────┼────┐
   Sensors Camera   Trials Data Reports Physics Models
     │       │         │      │      │       │
     └───────┴─────────┴──────┴──────┴───────┘
                           │
                    DATA PIPELINE
                           │
             ┌─────────────┼─────────────┐
             │             │             │
          Filter       Transform      Analyze
             │             │             │
             └─────────────┼─────────────┘
                           │
                     VISUALIZATION
                           │
                     EXPERIMENT
                           │
             ┌─────────────┴─────────────┐
             │                           │
         REAL DATA                  SIMULATION
             │                           │
             └─────────────┬─────────────┘
                           │
                       COMPARISON
                           │
                       CONCLUSION
```

---

# FINAL DEPENDENCY MAP

The entire curriculum should converge toward this dependency graph:

```text
PROGRAMMING
    │
    ├── Data Structures
    ├── Algorithms
    ├── Testing
    ├── Architecture
    ├── Concurrency
    └── Performance
             │
             ▼
      SCIENTIFIC SOFTWARE
             │
      ┌──────┼────────┐
      ▼      ▼        ▼
    DATA    MATH    HARDWARE
      │      │        │
      │      ├── Functions
      │      ├── Vectors
      │      ├── Matrices
      │      ├── Calculus
      │      ├── Probability
      │      ├── Statistics
      │      ├── Numerical Methods
      │      └── Optimization
      │
      ├── Time Series
      ├── Units
      ├── Uncertainty
      └── Provenance
             │
             ▼
       MEASUREMENT
             │
      ┌──────┼───────────────┐
      ▼      ▼       ▼       ▼
   Motion  Audio   Vision   GPS
      │      │       │       │
      └──────┴───────┴───────┘
             │
             ▼
       SIGNAL PROCESSING
             │
             ▼
        PHYSICS MODELS
             │
             ▼
       DIFFERENTIAL EQUATIONS
             │
             ▼
       NUMERICAL SIMULATION
             │
             ▼
       PARAMETER ESTIMATION
             │
             ▼
          OPTIMIZATION
             │
             ▼
        SENSOR FUSION
             │
             ▼
        STATE ESTIMATION
             │
             ▼
         DIGITAL TWIN
             │
             ▼
    SCIENTIFIC COMPUTING PLATFORM
```

# THE LEARNING ARC

The learner should therefore experience this progression:

```text
Build an app
    ↓
Make the app measure something
    ↓
Represent the measurement correctly
    ↓
Store the measurement
    ↓
Visualize the measurement
    ↓
Understand the mathematics behind it
    ↓
Analyze the data statistically
    ↓
Process signals
    ↓
Measure physical motion
    ↓
Build mathematical models
    ↓
Solve models numerically
    ↓
Compare models against reality
    ↓
Estimate unknown parameters
    ↓
Optimize models
    ↓
Connect external hardware
    ↓
Process images
    ↓
Combine sensors
    ↓
Estimate physical state
    ↓
Build digital twins
    ↓
Engineer a scalable scientific-computing platform
```

The crucial architectural outcome is that **the mathematics does not sit beside the application**.

It becomes the application:

```text
Vector library
       ↓
sensor processing
       ↓
orientation
       ↓
camera geometry
       ↓
GPS transformations
       ↓
physics
       ↓
simulation
       ↓
state estimation
```

Likewise, the software-engineering curriculum is not a separate sequence of toy projects. It is continuously forced by the growing system:

```text
simple code
    ↓
abstraction
    ↓
interfaces
    ↓
data structures
    ↓
persistence
    ↓
testing
    ↓
concurrency
    ↓
performance
    ↓
caching
    ↓
DAG computation
    ↓
plugin architecture
    ↓
scientific reproducibility
    ↓
production architecture
```

That is the structure I would use as the **master curriculum**. The original 128-lesson version already had the right central idea—mobile application → scientific instrument → measurement system → data platform → signal processing → physics → engineering mathematics → scientific computing. This version makes the prerequisite mathematics and engineering capabilities appear **before the systems that depend on them**, while retaining the strongest parts of the existing sequence such as reusable FFT processing, computer-vision measurement, external sensor integration, numerical integration, and model comparison.
