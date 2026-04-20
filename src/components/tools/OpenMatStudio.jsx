import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { create, all, format as mathFormat } from "mathjs";
import { useNavigate } from "react-router-dom";
import MarkdownProse from "../math/MarkdownProse.jsx";
import {
  Play,
  Pause,
  Plus,
  Pencil,
  RefreshCw,
  Cpu,
  LineChart,
  Sigma,
  Rows3,
  AlertCircle,
  Waves,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Scan,
  Grid3X3,
  Maximize2,
  X,
  CircleHelp,
} from "lucide-react";
import FigureRenderer from "../viz/react/FigureRenderer.jsx";
import GlobalGrapher3D from "../ui/GlobalGrapher3D.jsx";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";
import { useGrapher } from "../../context/GrapherContext.jsx";
import { setupOpenCalcMonaco } from "../../utils/monacoThemes.js";
import openMatGuide from "../../../docs/OpenMAT.md?raw";

const math = create(all);
math.config({ matrix: "Array", number: "number" });

function useColors() {
  const isDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return {
    isDark: dark,
    pageBg: dark ? "#07111e" : "#f4f7fb",
    pageGlow: dark ? "rgba(33, 102, 255, 0.10)" : "rgba(33, 102, 255, 0.08)",
    surface: dark ? "#0f172a" : "#ffffff",
    surface2: dark ? "#132033" : "#edf4ff",
    surface3: dark ? "#0b1424" : "#f8fbff",
    border: dark ? "#2b3a55" : "#d5dfef",
    text: dark ? "#e6eefb" : "#15253a",
    muted: dark ? "#90a4c2" : "#607188",
    hint: dark ? "#61738e" : "#8a99ae",
    blue: dark ? "#63b8ff" : "#1769d1",
    amber: dark ? "#f0b44c" : "#b36d05",
    green: dark ? "#46d89f" : "#198754",
    red: dark ? "#ff8b8b" : "#c03535",
    purple: dark ? "#b89cff" : "#6f42c1",
    teal: dark ? "#31d0c4" : "#0f8d85",
    heroBg: dark
      ? "linear-gradient(135deg, #091324 0%, #0a314e 52%, #0f5f64 100%)"
      : "linear-gradient(135deg, #eef6ff 0%, #daeefe 48%, #ddfbf3 100%)",
    heroBorder: dark ? "rgba(148, 184, 255, 0.18)" : "rgba(23, 105, 209, 0.16)",
    heroText: dark ? "#ffffff" : "#10243e",
    heroMuted: dark ? "#d8e5f5" : "#3d5878",
    heroBadgeBg: dark ? "rgba(255,255,255,0.10)" : "rgba(23, 105, 209, 0.10)",
    heroBadgeBorder: dark ? "rgba(255,255,255,0.18)" : "rgba(23, 105, 209, 0.18)",
    heroBadgeText: dark ? "#d9f9ff" : "#1769d1",
    heroPillBg: dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.66)",
    heroPillText: dark ? "#e7f4ff" : "#244667",
  };
}

const DEFAULT_CODE = `A = [1 2 3; 4 5 6; 7 8 10];
b = [3; 3; 4];
x = A \\ b

[V, D] = eig(A);
[Q, R] = qr(A);

t = linspace(0, 2*pi, 240);
y = sin(2*t) .* exp(-0.12*t);
plot(t, y)
title('Damped Signal')
xlabel('t')
ylabel('y')
`;

const EXAMPLES = [
  {
    id: "linear-system",
    label: "Linear System",
    icon: Rows3,
    description: "Solve Ax = b, inspect inverse, and check residuals.",
    code: `A = [3 -1 2; 2 4 1; -1 2 5];
b = [10; 8; 7];
x = A \\ b
inv(A)
A*x - b
`,
  },
  {
    id: "signals",
    label: "Signals",
    icon: Waves,
    description: "Combine waves, use hold on, and compare envelopes.",
    code: `t = linspace(0, 8*pi, 500);
y1 = sin(t) + 0.35*sin(3*t);
y2 = exp(-0.06*t);
plot(t, y1 .* y2)
hold on
plot(t, y2)
title('Signal + Envelope')
xlabel('time')
ylabel('amplitude')
`,
  },
  {
    id: "eigen-qr",
    label: "Eigen / QR",
    icon: Sigma,
    description: "Use multi-output assignment with eig and qr.",
    code: `A = [4 1; 2 3];
[V, D] = eig(A)
[Q, R] = qr(A)
Q * R
`,
  },
  {
    id: "range-plot",
    label: "Range Syntax",
    icon: Cpu,
    description: "Use colon ranges, elementwise power, and indexing.",
    code: `x = -4:0.05:4;
y = x.^3 - 3*x;
plot(x, y)
y(1:5)
`,
  },
  {
    id: "subplots",
    label: "Subplots",
    icon: LineChart,
    description: "Multiple plots in a grid with subplot(rows, cols, idx).",
    code: `t = linspace(0, 2*pi, 200);

subplot(2, 2, 1)
plot(t, sin(t))
title('sin(t)')
xlabel('t')

subplot(2, 2, 2)
plot(t, cos(t))
title('cos(t)')
xlabel('t')

subplot(2, 2, 3)
plot(t, sin(t) .* exp(-0.3*t))
title('Damped sine')
xlabel('t')

subplot(2, 2, 4)
x = randn(1, 200);
hist(x, 15)
title('Normal dist')
`,
  },
  {
    id: "control-flow",
    label: "Control Flow",
    icon: Grid3X3,
    description: "if/else, for loops, while loops, and break.",
    code: `% Fibonacci with a for loop
n = 12;
fib = zeros(1, n);
fib(1) = 1;
fib(2) = 1;
for i = 3:n
  fib(i) = fib(i-1) + fib(i-2);
end
disp(fib)
bar(fib)
title('Fibonacci Numbers')

% while with break
x = 1;
while x < 500
  x = x * 2;
  if x > 200
    break
  end
end
disp(x)
`,
  },
  {
    id: "functions",
    label: "Functions",
    icon: Sigma,
    description: "Define and call your own functions.",
    code: `function result = factorial(n)
  if n <= 1
    result = 1;
  else
    result = n * factorial(n - 1);
  end
end

function [mn, mx, rng] = stats(v)
  mn = mean(v);
  mx = max(v);
  rng = mx - min(v);
end

disp(factorial(7))

data = [3 8 1 6 2 9 4 7 5];
[m, x, r] = stats(data)
disp(mean(data))
disp(std(data))
hist(data, 5)
title('Data Distribution')
`,
  },
  {
    id: "anonymous-3d",
    label: "Anonymous + 3D",
    icon: Waves,
    description: "Use anonymous functions, roots, integration, and launch a surface into the 3D grapher.",
    code: `f = @(x) x.^3 - 4*x + 1;
x = linspace(-3, 3, 200);
y = f(x);
plot(x, y)
grid on
title('Anonymous function')

coeffs = [1 0 -4 1];
roots(coeffs)
trapz(x, y)

[X, Y] = meshgrid(-4:0.4:4, -4:0.4:4);
Z = sin(sqrt(X.^2 + Y.^2));
surf(X, Y, Z)
`,
  },
  {
    id: "interactive-signal",
    label: "Interactive Signal",
    icon: Waves,
    description: "Drive a plot with sliders and rerun it live from the controls pane.",
    code: `amp = slider('amp', 0.2, 2.5, 0.1, 1.2);
freq = slider('freq', 0.5, 6, 0.1, 2.0);
damp = slider('damp', 0, 0.3, 0.01, 0.08);

t = linspace(0, 10, 600);
y = amp * sin(freq * t) .* exp(-damp * t);
plot(t, y)
grid on
title('Interactive Signal')
xlabel('time')
ylabel('amplitude')
`,
  },
  {
    id: "animated-wave",
    label: "Animated Wave",
    icon: Waves,
    description: "Use an animate control to scrub or play a time-like parameter.",
    code: `phase = animate('phase', 0, 2*pi, 0.08, 0, 1.2, 1);
x = linspace(0, 8*pi, 500);
y = sin(x - phase) .* exp(-0.03 * x);
plot(x, y)
grid on
title('Animated Wave')
xlabel('position')
ylabel('amplitude')
`,
  },
  {
    id: "pendulum-lab",
    label: "Pendulum Lab",
    icon: Sigma,
    description: "Animate a small-angle pendulum with tunable length, gravity, and release angle.",
    code: `t = animate('t', 0, 18, 0.06, 0, 1.0, 1);
L = slider('L', 0.6, 2.0, 0.1, 1.2);
g = slider('g', 1, 20, 0.5, 9.8);
theta0 = slider('theta0', 0.1, 1.1, 0.05, 0.75);

omega = sqrt(g / L);
theta = theta0 * cos(omega * t);
x = L * sin(theta);
y = -L * cos(theta);

trailT = linspace(max(0, t - 5), t, 120);
trailTheta = theta0 * cos(omega * trailT);
trailX = L * sin(trailTheta);
trailY = -L * cos(trailTheta);

plot([0 x], [0 y])
hold on
plot(trailX, trailY)
scatter(x, y)
grid on
axis equal
xlim(-L - 0.4, L + 0.4)
ylim(-L - 0.4, 0.4)
title('Pendulum Lab')
xlabel('horizontal position')
ylabel('vertical position')
`,
  },
  {
    id: "spring-mass-lab",
    label: "Spring-Mass",
    icon: Cpu,
    description: "Explore damping and stiffness with a one-dimensional spring-mass animation.",
    code: `t = animate('t', 0, 24, 0.05, 0, 1.0, 1);
A = slider('A', 0.3, 2.0, 0.05, 1.1);
k = slider('k', 0.5, 8.0, 0.1, 3.2);
m = slider('m', 0.5, 5.0, 0.1, 1.4);
c = slider('c', 0.0, 2.5, 0.05, 0.35);

alpha = c / (2 * m);
omega = sqrt(max(k / m - alpha^2, 0.001));
x = A * exp(-alpha * t) * cos(omega * t);

tt = linspace(max(0, t - 10), t, 220);
xx = A * exp(-alpha * tt) .* cos(omega * tt);

plot(tt, xx)
hold on
scatter(t, x)
grid on
xlim(max(0, t - 10), max(10, t))
ylim(-A * 1.3, A * 1.3)
title('Spring-Mass Response')
xlabel('time')
ylabel('displacement')
`,
  },
  {
    id: "projectile-lab",
    label: "Projectile Lab",
    icon: LineChart,
    description: "Animate a projectile arc and tune launch speed, angle, and gravity.",
    code: `t = animate('t', 0, 14, 0.05, 0, 1.0, 1);
v0 = slider('v0', 6, 40, 1, 22);
angle = slider('angle', 0.2, 1.3, 0.02, 0.85);
g = slider('g', 1, 20, 0.5, 9.8);

vx = v0 * cos(angle);
vy = v0 * sin(angle);
flight = max(2 * vy / g, 0.1);
tc = min(t, flight);
tt = linspace(0, tc, 180);
x = vx * tt;
y = vy * tt - 0.5 * g * tt.^2;

px = vx * tc;
py = vy * tc - 0.5 * g * tc.^2;
range = vx * flight;
peak = (vy^2) / (2 * g);

plot(x, y)
hold on
scatter(px, py)
grid on
xlim(0, range * 1.1 + 1)
ylim(0, peak * 1.35 + 1)
title('Projectile Lab')
xlabel('downrange')
ylabel('height')
`,
  },
  {
    id: "merchant-lab",
    label: "Merchant Circle",
    icon: AlertCircle,
    description: "Explore cutting-force decomposition with Merchant-style machining parameters.",
    code: `rake = slider('rake', 0, 25, 1, 10);
friction = slider('friction', 10, 45, 1, 28);
shear = slider('shear', 10, 40, 1, 22);
cut = slider('cut', 50, 350, 5, 180);
feed = slider('feed', 20, 180, 5, 90);

alpha = rake * pi / 180;
beta = friction * pi / 180;
phi = shear * pi / 180;

Fc = cut;
Ft = feed;
R = sqrt(Fc^2 + Ft^2);
Fs = R * cos(beta - alpha + phi);
Fn = R * sin(beta - alpha + phi);
mu = tan(beta);

theta = linspace(0, 2*pi, 240);
circleX = R * cos(theta);
circleY = R * sin(theta);

plot(circleX, circleY)
hold on
plot([0 Fc], [0 Ft])
grid on
axis equal
title('Merchant Circle')
xlabel('Cutting force axis')
ylabel('Thrust force axis')
`,
  },
  {
    id: "beam-lab",
    label: "Beam / Cantilever",
    icon: LineChart,
    description: "Study deflection, stress, and strain for a cantilever beam with an end load.",
    code: `L = slider('L', 0.4, 3.0, 0.05, 1.6);
F = slider('F', 20, 1500, 10, 320);
b = slider('b', 0.02, 0.18, 0.005, 0.06);
h = slider('h', 0.02, 0.24, 0.005, 0.12);
E_GPa = slider('E_GPa', 20, 220, 5, 69);

E = E_GPa * 1e9;
I = b * h^3 / 12;
delta = F * L^3 / (3 * E * I);
sigma = F * L * (h / 2) / I;
strain = sigma / E;

x = linspace(0, L, 180);
y = -(F .* x.^2 .* (3 * L - x)) / (6 * E * I);

plot(x, y)
grid on
title('Cantilever Deflection')
xlabel('beam length (m)')
ylabel('deflection (m)')
`,
  },
  {
    id: "chatter-lab",
    label: "Natural Frequency / Chatter",
    icon: AlertCircle,
    description: "Estimate endmill stiffness, natural frequency, tooth-pass excitation, and chatter risk.",
    code: `L = slider('L', 0.02, 0.18, 0.002, 0.09);
d_mm = slider('d_mm', 4, 25, 0.5, 12);
E_GPa = slider('E_GPa', 20, 220, 5, 210);
rho = slider('rho', 2500, 9000, 100, 7850);
F = slider('F', 10, 1200, 10, 180);
rpm = slider('rpm', 500, 30000, 100, 12000);
teeth = slider('teeth', 1, 8, 1, 4);

d = d_mm / 1000;
E = E_GPa * 1e9;
I = pi * d^4 / 64;
A = pi * d^2 / 4;
m_eff = 0.24 * rho * A * L;
k_tip = 3 * E * I / L^3;
delta = F / k_tip;
f_n = (1 / (2*pi)) * sqrt(k_tip / max(m_eff, 1e-9));
tooth_hz = rpm * teeth / 60;
chatter_ratio = tooth_hz / f_n;

x = [0 tooth_hz tooth_hz];
y = [0 0 f_n];
plot([0 3000], [f_n f_n])
hold on
stem([tooth_hz], [f_n])
title('Natural Frequency / Chatter')
xlabel('excitation frequency (Hz)')
ylabel('natural frequency (Hz)')
`,
  },
];

const SIMULATION_WORKSPACES = [
  {
    id: "pendulum-lab",
    title: "Pendulum",
    summary: "Small-angle pendulum with tunable length, gravity, and release angle.",
    controls: ["L", "g", "theta0", "t"],
    outcomes: [
      "See how period changes with length and gravity.",
      "Compare geometric motion to the plotted angle response.",
      "Use the console to inspect intermediate values like theta or bob position.",
    ],
    prompts: [
      "What happens to the period when you double L?",
      "How sensitive is the motion to the release angle inside the small-angle regime?",
      "What variable would you plot next to study energy?",
    ],
    lesson: {
      title: "Pendulum starter",
      steps: [
        { title: "Run the lab", body: "Press Run and watch the bob, trail, and plot all respond from the same session." },
        { title: "Change one parameter", body: "Adjust length or gravity and notice how the period changes before touching the code." },
        { title: "Inspect the workspace", body: "Open Workspace and look for L, theta, x, and y so the geometry and math stay connected." },
      ],
    },
  },
  {
    id: "spring-mass-lab",
    title: "Spring-Mass",
    summary: "Oscillation lab for amplitude, stiffness, mass, damping, and time.",
    controls: ["A", "k", "m", "c", "t"],
    outcomes: [
      "Study how damping changes the envelope and settling behavior.",
      "Compare how stiffness and mass reshape the oscillation frequency.",
      "Reuse the same session to test closed-form ideas in the console.",
    ],
    prompts: [
      "Which parameter changes frequency most directly?",
      "How much damping is needed before the motion looks heavily suppressed?",
      "What extra plot would help compare displacement and envelope?",
    ],
    lesson: {
      title: "Spring-mass starter",
      steps: [
        { title: "Run and observe", body: "Press Run, then compare the viewport motion to the plotted displacement." },
        { title: "Tune damping", body: "Increase c and watch the response settle sooner while the envelope tightens." },
        { title: "Replace a part", body: "Select the mass or spring, then import ScratchPad geometry to swap in your own shape." },
      ],
    },
  },
  {
    id: "projectile-lab",
    title: "Projectile",
    summary: "Kinematics workspace for launch speed, angle, gravity, and animated trajectory.",
    controls: ["v0", "angle", "g", "t"],
    outcomes: [
      "Connect launch parameters to range, peak height, and flight shape.",
      "Use the figure pane to read the arc while the controls rerun the lab.",
      "Turn one configuration into a reusable script or worksheet example.",
    ],
    prompts: [
      "Which angle maximizes range for a fixed speed?",
      "How does changing gravity affect peak height versus total range?",
      "What console command would help compute the peak directly?",
    ],
    lesson: {
      title: "Projectile starter",
      steps: [
        { title: "Run the launch", body: "Use Run once, then move speed and angle controls to build intuition about the arc." },
        { title: "Read the scene", body: "Compare the live marker in the viewport with the trajectory plot and workspace values." },
        { title: "Ask a question", body: "Use the Console for a quick range or peak-height check without rewriting the script." },
      ],
    },
  },
  {
    id: "merchant-lab",
    title: "Merchant Circle",
    summary: "Cutting-force workbench for rake, friction, shear angle, and force decomposition.",
    controls: ["rake", "friction", "shear", "cut", "feed"],
    outcomes: [
      "Decompose cutting and thrust forces into resultant and shear-plane components.",
      "Connect machining geometry to the force circle instead of only plotting a waveform.",
      "Use this as a stepping stone toward chatter, harmonics, and long-tool discussions.",
    ],
    prompts: [
      "How does friction angle change the resultant force direction?",
      "What happens to the circle when you increase cutting force but keep feed force fixed?",
      "Which variable would you add next to discuss tool deflection or chatter risk?",
    ],
    lesson: {
      title: "Merchant circle starter",
      steps: [
        { title: "Run the force circle", body: "Use the sliders to change rake, friction, and shear while watching the force vectors update." },
        { title: "Read the decomposition", body: "Compare Fc, Ft, and R in the workspace so the geometry matches the machining forces." },
        { title: "Think like a machinist", body: "Ask how these forces would affect a long endmill, chatter risk, or workholding." },
      ],
    },
  },
  {
    id: "beam-lab",
    title: "Beam / Cantilever",
    summary: "Cantilever workbench for beam length, section size, load, deflection, stress, and strain.",
    controls: ["L", "F", "b", "h", "E_GPa"],
    outcomes: [
      "See how beam length and section height dominate deflection.",
      "Connect geometry, material stiffness, stress, and strain in one guided workbench.",
      "Use this as the first serious bridge from drawing geometry to structural analysis.",
    ],
    prompts: [
      "What happens to tip deflection when you double beam length?",
      "Which matters more for stiffness here: width or height?",
      "How would you model a second force or a distributed load next?",
    ],
    lesson: {
      title: "Beam / Cantilever getting started",
      steps: [
        { title: "Run the baseline beam", body: "Press Run and note the deflected shape, end load arrow, and support condition at the wall." },
        { title: "Change geometry first", body: "Adjust height h and width b before changing the force so you can feel how cross-section affects stiffness." },
        { title: "Read engineering outputs", body: "Open Workspace and look for I, delta, sigma, and strain to tie the scene to beam theory." },
        { title: "Replace editable parts", body: "Select the beam or wall geometry, then send one ScratchPad shape into OpenMAT to replace it." },
      ],
    },
  },
  {
    id: "chatter-lab",
    title: "Natural Frequency / Chatter",
    summary: "Machining-focused workbench for endmill stiffness, natural frequency, tooth-pass excitation, and chatter risk.",
    controls: ["L", "d_mm", "E_GPa", "rho", "F", "rpm", "teeth"],
    outcomes: [
      "Estimate how stickout and diameter change stiffness and deflection.",
      "Compare tooth-pass frequency to the tool's natural frequency.",
      "Use this as a bridge from beam theory to machining vibration intuition.",
    ],
    prompts: [
      "What happens to natural frequency when you increase stickout?",
      "How much does tool diameter matter compared with spindle speed?",
      "When does tooth-pass frequency get close enough to warn about resonance?",
    ],
    lesson: {
      title: "Chatter workbench starter",
      steps: [
        { title: "Run the baseline tool", body: "Press Run and note the natural frequency, tooth-pass frequency, and static tip deflection." },
        { title: "Change stickout first", body: "Increase L and watch stiffness drop while the chatter risk rises." },
        { title: "Think like a machinist", body: "Adjust RPM and tooth count to see when excitation approaches the natural frequency band." },
      ],
    },
  },
];

const OPENMAT_INTERACTIVE_TOURS = {
  "spring-mass-basics": {
    id: "spring-mass-basics",
    simulationId: "spring-mass-lab",
    title: "Spring-Mass Getting Started",
    subtitle: "Learn the bench first, then modify the original model.",
    steps: [
      {
        id: "run-workbench",
        title: "Run the workbench",
        body: "Press Run once so OpenMAT loads the Spring-Mass script, viewport state, sliders, and workspace together.",
      },
      {
        id: "play-animation",
        title: "Play the motion",
        body: "Use Play in Parameters to start the animated time driver and connect the numbers to the moving scene.",
      },
      {
        id: "select-part",
        title: "Select a part",
        body: "Click the spring, mass, or wall in the viewport so the Properties rail becomes the assembly editor for that part.",
      },
      {
        id: "edit-part",
        title: "Modify the original model",
        body: "With a part selected, use the highlighted Selected Part Controls sliders on the right to change that original part and make your own variant.",
      },
      {
        id: "reload-lab",
        title: "Recover the default scene",
        body: "Press Reload Lab to restore the original guided assembly after your edits.",
      },
    ],
  },
};

const HELP_TEXT = [
  "Supported MATLAB-like syntax:",
  "",
  "── Language Model ──",
  "OpenMAT is a MATLAB-like dialect built on top of a local math engine.",
  "It is not raw JavaScript, Python, or full MATLAB compatibility.",
  "Docs source of truth: docs/OpenMAT.md",
  "",
  "── Interaction Model ──",
  "Editor tabs hold saved scripts and labs.",
  "Run executes the current script tab and refreshes Figure, Workspace, and Console.",
  "Console runs quick commands against the current workspace without editing the file.",
  "Promote to Script appends the last console command into the active tab.",
  "Workspace shows variables from the latest script run or console command.",
  "Simulation Mode adds a guided panel layer on top of the same session.",
  "",
  "── Matrices ──",
  "A = [1 2; 3 4]   A'   A \\ b   inv(A)   det(A)   trace(A)",
  "[V,D] = eig(A)   [Q,R] = qr(A)   [U,S,V] = svd(A)",
  "",
  "── Arrays ──",
  "x = 0:0.1:2*pi   linspace(a,b,n)   logspace(a,b,n)",
  "zeros(m,n)   ones(m,n)   eye(n)   rand(m,n)   randn(m,n)",
  "reshape(A,m,n)   repmat(A,m,n)   size   length   numel",
  "",
  "── Statistics ──",
  "mean  median  std  var  min  max  sum  prod",
  "sort  unique  find  any  all  hist(x,bins)",
  "interp1(x,y,xi)",
  "",
  "── Control Flow ──",
  "if cond ... elseif cond ... else ... end",
  "for i = 1:n ... end",
  "while cond ... end",
  "break   continue",
  "",
  "── Functions ──",
  "function [out1,out2] = myFunc(a, b)",
  "  out1 = a + b;",
  "  out2 = a * b;",
  "end",
  "f = @(x) x.^2 - 1",
  "",
  "── Plotting ──",
  "plot, scatter, bar, stem, area, hist, hold on/off, clf",
  "title, xlabel, ylabel, legend, grid on/off, xlim, ylim",
  "axis tight/equal/auto/[xmin xmax ymin ymax]",
  "surf(X,Y,Z)   mesh(X,Y,Z) -> opens the 3D Grapher",
  "slider('gain', min, max, step, default) -> interactive controls",
  "animate('t', min, max, step, default, speed, loop) -> play-ready control",
  "",
  "── Output ──",
  "disp(x)   sprintf('%g', x)   fprintf('val = %f\\n', x)",
  "num2str(x)   who   clear   clc",
  "",
  "── Extensions ──",
  "window.OpenMAT.registerExtension(name, { functions, onRun })",
].join("\n");

const SERIES_COLORS = ["teal", "blue", "amber", "purple", "red", "green"];
const OPENMAT_EXTENSION_REGISTRY = new Map();

function makeDocumentId() {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createOpenMatDocument(name = "untitled.m", code = "") {
  return {
    id: makeDocumentId(),
    name,
    code,
  };
}

function getNextUntitledName(documents) {
  const untitledCount = documents.filter((doc) => /^untitled(?: \d+)?\.m$/i.test(doc.name)).length;
  return untitledCount === 0 ? "untitled.m" : `untitled ${untitledCount + 1}.m`;
}

function normalizeImportedDocuments(value) {
  if (!Array.isArray(value) || value.length === 0) return null;
  const docs = value
    .map((doc, index) => ({
      id: typeof doc?.id === "string" ? doc.id : makeDocumentId(),
      name: typeof doc?.name === "string" && doc.name.trim() ? doc.name.trim() : `script ${index + 1}.m`,
      code: typeof doc?.code === "string" ? doc.code : "",
    }));
  return docs.length ? docs : null;
}

function getInitialOpenMatDocuments() {
  if (typeof window === "undefined") {
    return [createOpenMatDocument("untitled.m", DEFAULT_CODE)];
  }
  try {
    const savedDocs = window.localStorage.getItem("openmat-documents");
    const parsedDocs = normalizeImportedDocuments(savedDocs ? JSON.parse(savedDocs) : null);
    if (parsedDocs) return parsedDocs;

    const legacyCode = window.localStorage.getItem("openmat-code");
    const parsedCode = legacyCode ? JSON.parse(legacyCode) : DEFAULT_CODE;
    return [createOpenMatDocument("untitled.m", typeof parsedCode === "string" ? parsedCode : DEFAULT_CODE)];
  } catch {
    return [createOpenMatDocument("untitled.m", DEFAULT_CODE)];
  }
}

function getInitialActiveDocumentId(documents) {
  if (typeof window === "undefined") return documents[0]?.id || null;
  try {
    const savedId = window.localStorage.getItem("openmat-active-document-id");
    const parsedId = savedId ? JSON.parse(savedId) : null;
    if (typeof parsedId === "string" && documents.some((doc) => doc.id === parsedId)) {
      return parsedId;
    }
  } catch {
    // fall through to first document
  }
  return documents[0]?.id || null;
}

function buildRecoverySnapshot({
  documents,
  activeDocumentId,
  browserTab,
  workspaceTab,
  controlValues,
  reason,
}) {
  return {
    documents,
    activeDocumentId,
    browserTab,
    workspaceTab,
    controlValues,
    reason,
    createdAt: new Date().toISOString(),
  };
}

function compactDocumentLabel(name, crowded = false) {
  const safeName = typeof name === "string" && name.trim() ? name.trim() : "untitled.m";
  if (!crowded) return safeName;

  const extIndex = safeName.lastIndexOf(".");
  const base = extIndex > 0 ? safeName.slice(0, extIndex) : safeName;
  const extension = extIndex > 0 ? safeName.slice(extIndex) : "";
  const compactBase = base.length <= 6 ? base : `${base.slice(0, 3)}...`;
  return `${compactBase}${extension}`;
}

function registerOpenMatExtension(name, extension) {
  if (!name || typeof name !== "string") {
    throw new Error("OpenMAT extensions require a string name.");
  }
  OPENMAT_EXTENSION_REGISTRY.set(name, { name, ...extension });
  return name;
}

function unregisterOpenMatExtension(name) {
  OPENMAT_EXTENSION_REGISTRY.delete(name);
}

function listOpenMatExtensions() {
  return Array.from(OPENMAT_EXTENSION_REGISTRY.values());
}

function toPlain(value) {
  if (value && typeof value.valueOf === "function") {
    const plain = value.valueOf();
    if (plain !== value) return toPlain(plain);
  }
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    if ("re" in value && "im" in value && Object.keys(value).length <= 3) {
      return value;
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
}

function isComplexLike(value) {
  return value && typeof value === "object" && "re" in value && "im" in value;
}

function realValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (isComplexLike(value)) return Number(value.re ?? 0);
  return Number(value);
}

function flattenNumbers(value) {
  const plain = toPlain(value);
  if (!Array.isArray(plain)) return [realValue(plain)];
  return plain.flat(Infinity).map(realValue);
}

function normalizeVector(value) {
  const plain = toPlain(value);
  if (!Array.isArray(plain)) return [realValue(plain)];
  if (Array.isArray(plain[0]) && plain[0].length === 1) {
    return plain.map((row) => realValue(row[0]));
  }
  return plain.flat().map(realValue);
}

function makeDiagonal(values) {
  const vector = normalizeVector(values);
  return vector.map((value, index) =>
    vector.map((_, column) => (column === index ? value : 0)),
  );
}

function makeRandomArray(shape) {
  if (shape.length === 0) return Math.random();
  const [head, ...tail] = shape;
  return Array.from({ length: Number(head) }, () => makeRandomArray(tail));
}

function isMatrix(value) {
  return Array.isArray(value) && Array.isArray(value[0]);
}

function toColumnSeries(value) {
  const plain = toPlain(value);
  if (!Array.isArray(plain)) return [[realValue(plain)]];
  if (!isMatrix(plain)) return [normalizeVector(plain)];
  const columnCount = Math.max(...plain.map((row) => row.length), 0);
  return Array.from({ length: columnCount }, (_, column) =>
    plain.map((row) => realValue(row[column] ?? 0)),
  );
}

function buildLinspace(start, stop, count = 100) {
  const n = Math.max(1, Math.round(Number(count)));
  const a = Number(start);
  const b = Number(stop);
  if (n === 1) return [a];
  const step = (b - a) / (n - 1);
  return Array.from({ length: n }, (_, index) => a + step * index);
}

function buildLogspace(a, b, count = 50) {
  return buildLinspace(Number(a), Number(b), count).map((value) => 10 ** value);
}

function meshgrid(xValues, yValues = xValues) {
  const x = normalizeVector(xValues);
  const y = normalizeVector(yValues);
  return {
    __multi: [
      y.map(() => [...x]),
      y.map((value) => Array.from({ length: x.length }, () => value)),
    ],
  };
}

function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function diffArray(value) {
  const vector = normalizeVector(value);
  return vector.slice(1).map((entry, index) => entry - vector[index]);
}

function cumulative(values, reducer, initial) {
  const vector = normalizeVector(values);
  const output = [];
  let acc = initial;
  vector.forEach((value, index) => {
    acc = index === 0 && initial == null ? value : reducer(acc, value);
    output.push(acc);
  });
  return output;
}

function dotProduct(a, b) {
  const left = normalizeVector(a);
  const right = normalizeVector(b);
  const length = Math.min(left.length, right.length);
  return Array.from({ length }, (_, index) => left[index] * right[index]).reduce(
    (sum, value) => sum + value,
    0,
  );
}

function crossProduct(a, b) {
  const [ax, ay, az] = normalizeVector(a);
  const [bx, by, bz] = normalizeVector(b);
  return [
    ay * bz - az * by,
    az * bx - ax * bz,
    ax * by - ay * bx,
  ];
}

function polyfit(xValues, yValues, degree) {
  const x = normalizeVector(xValues);
  const y = normalizeVector(yValues);
  const n = Math.max(0, Math.round(Number(degree)));
  const vandermonde = x.map((value) =>
    Array.from({ length: n + 1 }, (_, index) => value ** (n - index)),
  );
  const coeffs = toPlain(math.multiply(math.pinv(vandermonde), y));
  return normalizeVector(coeffs);
}

function polyval(coefficients, xValues) {
  const coeffs = normalizeVector(coefficients);
  return normalizeVector(xValues).map((value) =>
    coeffs.reduce((acc, coefficient) => acc * value + coefficient, 0),
  );
}

// ─── Statistics helpers ───────────────────────────────────────────────────────
function statMean(value) {
  const v = normalizeVector(value);
  return v.reduce((a, b) => a + b, 0) / v.length;
}
function statMedian(value) {
  const v = [...normalizeVector(value)].sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 === 0 ? (v[m - 1] + v[m]) / 2 : v[m];
}
function statStd(value, flag = 0) {
  const v = normalizeVector(value);
  const mu = statMean(v);
  const denom = flag === 1 ? v.length : v.length - 1;
  return Math.sqrt(v.reduce((s, x) => s + (x - mu) ** 2, 0) / denom);
}
function statVar(value, flag = 0) { return statStd(value, flag) ** 2; }
function statMin(value) {
  const v = normalizeVector(value);
  return Array.isArray(toPlain(value)) ? Math.min(...v) : v[0];
}
function statMax(value) {
  const v = normalizeVector(value);
  return Array.isArray(toPlain(value)) ? Math.max(...v) : v[0];
}
function statSum(value) { return normalizeVector(value).reduce((a, b) => a + b, 0); }
function statProd(value) { return normalizeVector(value).reduce((a, b) => a * b, 1); }
function statSort(value, dir = 'ascend') {
  const v = [...normalizeVector(value)];
  v.sort((a, b) => a - b);
  return dir === 'descend' ? v.reverse() : v;
}
function statUnique(value) { return [...new Set(normalizeVector(value))].sort((a, b) => a - b); }
function statMod(a, b) { return ((Number(a) % Number(b)) + Number(b)) % Number(b); }
function statRem(a, b) { return Number(a) % Number(b); }
function statFix(value) {
  const fn = (x) => x >= 0 ? Math.floor(x) : Math.ceil(x);
  return isCollection(value) ? mapDeep(value, fn) : fn(Number(value));
}

function statAny(value) { return normalizeVector(value).some(Boolean) ? 1 : 0; }
function statAll(value) { return normalizeVector(value).every(Boolean) ? 1 : 0; }
function statFind(value) {
  const v = normalizeVector(value);
  return v.map((x, i) => (x ? i + 1 : null)).filter((x) => x !== null);
}
function reshapeArray(value, rows, cols) {
  const flat = normalizeVector(value);
  const r = Number(rows), c = Number(cols);
  const out = [];
  for (let i = 0; i < r; i++) {
    out.push(flat.slice(i * c, i * c + c));
  }
  return out;
}
function repmatArray(value, m, n) {
  const plain = toPlain(value);
  const isVec = !isMatrix(plain);
  const mat = isVec ? [normalizeVector(plain)] : plain;
  const rowRep = Array.from({ length: m }, () => mat).flat();
  return rowRep.map((row) => Array.from({ length: n }, () => row).flat());
}
function histArray(value, bins = 10) {
  const v = normalizeVector(value);
  const mn = Math.min(...v), mx = Math.max(...v);
  const w = (mx - mn) / Number(bins);
  const counts = Array(Number(bins)).fill(0);
  v.forEach((x) => {
    const i = Math.min(Math.floor((x - mn) / w), Number(bins) - 1);
    counts[i]++;
  });
  const centers = Array.from({ length: Number(bins) }, (_, i) => mn + w * (i + 0.5));
  return { __histData: { centers, counts } };
}
function interp1Array(x, y, xi) {
  const xv = normalizeVector(x), yv = normalizeVector(y), xiv = normalizeVector(xi);
  return xiv.map((xq) => {
    if (xq <= xv[0]) return yv[0];
    if (xq >= xv[xv.length - 1]) return yv[yv.length - 1];
    let lo = 0;
    for (let i = 0; i < xv.length - 1; i++) { if (xv[i] <= xq && xq <= xv[i + 1]) { lo = i; break; } }
    const t = (xq - xv[lo]) / (xv[lo + 1] - xv[lo]);
    return yv[lo] + t * (yv[lo + 1] - yv[lo]);
  });
}
function trapzArray(x, y = null) {
  const xv = y == null ? null : normalizeVector(x);
  const yv = normalizeVector(y == null ? x : y);
  if (yv.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < yv.length - 1; i += 1) {
    const dx = xv ? xv[i + 1] - xv[i] : 1;
    total += dx * (yv[i] + yv[i + 1]) / 2;
  }
  return total;
}
function gradientArray(value, spacing = 1) {
  const v = normalizeVector(value);
  if (v.length <= 1) return v.map(() => 0);
  const h = Number(spacing) || 1;
  return v.map((entry, index) => {
    if (index === 0) return (v[1] - v[0]) / h;
    if (index === v.length - 1) return (v[index] - v[index - 1]) / h;
    return (v[index + 1] - v[index - 1]) / (2 * h);
  });
}
function companionRoots(coefficients) {
  const coeffs = normalizeVector(coefficients).map(Number);
  while (coeffs.length > 1 && Math.abs(coeffs[0]) < 1e-12) coeffs.shift();
  const degree = coeffs.length - 1;
  if (degree <= 0) return [];
  if (degree === 1) return [-coeffs[1] / coeffs[0]];
  const lead = coeffs[0];
  const companion = Array.from({ length: degree }, (_, row) =>
    Array.from({ length: degree }, (_, col) => {
      if (row === 0) return -(coeffs[col + 1] ?? 0) / lead;
      return col === row - 1 ? 1 : 0;
    }),
  );
  const eigen = math.eigs(companion);
  return toPlain(eigen.values ?? []);
}
function singularValues(A) {
  const result = math.svd(A);
  const raw = Array.isArray(result.S?.[0]) ? math.diag(result.S) : result.S;
  return normalizeVector(raw).map((entry) => Math.abs(Number(entry)));
}
function matrixRank(A, tolerance = null) {
  const s = singularValues(A);
  const max = Math.max(...s, 0);
  const tol = tolerance == null ? max * Math.max(inferSize(A)[0], inferSize(A)[1]) * 1e-10 : Number(tolerance);
  return s.filter((entry) => entry > tol).length;
}
function conditionNumber(A) {
  const s = singularValues(A).filter((entry) => entry > 1e-12);
  if (!s.length) return Infinity;
  return Math.max(...s) / Math.min(...s);
}
function orthonormalBasis(A, mode = "orth") {
  const { U, V, S } = math.svd(A);
  const singular = normalizeVector(Array.isArray(S?.[0]) ? math.diag(S) : S).map((entry) => Math.abs(Number(entry)));
  const tol = Math.max(...singular, 0) * Math.max(inferSize(A)[0], inferSize(A)[1]) * 1e-10;
  const source = mode === "null" ? toPlain(V) : toPlain(U);
  const columns = math.transpose(source);
  const keep = columns.filter((_, index) =>
    mode === "null" ? singular[index] <= tol : singular[index] > tol,
  );
  return keep.length ? math.transpose(keep) : [];
}
function normalizeSurfaceMatrices(x, y, z) {
  const Z = toPlain(z);
  const rows = Array.isArray(Z) ? Z.length : 0;
  const cols = rows ? Math.max(...Z.map((row) => row.length), 0) : 0;
  const defaultX = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => c - (cols - 1) / 2),
  );
  const defaultY = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => r - (rows - 1) / 2),
  );
  const expandGrid = (value, fallback) => {
    const plain = toPlain(value);
    if (!Array.isArray(plain)) return fallback;
    if (Array.isArray(plain[0])) return plain;
    if (plain.length === cols) {
      return Array.from({ length: rows }, () => [...plain]);
    }
    if (plain.length === rows) {
      return plain.map((entry) => Array.from({ length: cols }, () => entry));
    }
    return fallback;
  };
  return {
    X: x == null ? defaultX : expandGrid(x, defaultX),
    Y: y == null ? defaultY : expandGrid(y, defaultY),
    Z,
  };
}
function convertSurfaceTo3DConfig(kind, args, plotState) {
  let X;
  let Y;
  let Z;
  if (args.length === 1) {
    Z = args[0];
  } else if (args.length >= 3) {
    [X, Y, Z] = args;
  } else {
    Z = args[args.length - 1];
  }
  const surfaceData = normalizeSurfaceMatrices(X, Y, Z);
  return {
    mode: "3d",
    title: plotState.title || `OpenMAT ${kind === "mesh" ? "Mesh" : "Surface"} Lab`,
    replace: true,
    functions: [
      {
        id: Date.now(),
        latex: kind === "mesh" ? "mesh data" : "surface data",
        color: "#6366f1",
        visible: true,
        wireframe: kind === "mesh",
        opacity: kind === "mesh" ? 1 : 0.82,
        surfaceData,
      },
    ],
    settings: {
      range: Math.max(surfaceData.Z.length, surfaceData.Z[0]?.length || 10),
      resolution: Math.min(128, Math.max(surfaceData.Z.length, surfaceData.Z[0]?.length || 32)),
    },
  };
}
function svdDecomp(A) {
  const result = math.svd(A);
  const U = toPlain(result.U), S = toPlain(result.S), V = toPlain(result.V);
  const diagS = Array.isArray(S[0]) ? S : makeDiagonal(S);
  return { __multi: [U, diagS, V], U, S: diagS, V };
}
function sprintfFormat(fmt, ...args) {
  let i = 0;
  return String(fmt).replace(/%[\d.]*[diouxXeEfgGs]/g, (m) => {
    const val = args[i++];
    if (val == null) return m;
    if (m.endsWith('d') || m.endsWith('i')) return Math.round(Number(val)).toString();
    if (m.endsWith('f') || m.endsWith('e') || m.endsWith('g')) {
      const prec = (m.match(/\.(\d+)/) || [, '6'])[1];
      return Number(val).toFixed(Number(prec));
    }
    return String(val);
  });
}

// ─── Block-aware script parser ────────────────────────────────────────────────
// Parses MATLAB source into a tree of Statement nodes before execution.
// Handles: if/elseif/else/end, for/end, while/end, function/end

function parseBlocks(lines) {
  const stack = [{ type: 'root', body: [] }];
  const top = () => stack[stack.length - 1];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const stripped = raw.replace(/%.*$/, '').trim();
    if (!stripped) continue;

    const lower = stripped.toLowerCase();

    // function definition
    const fnMatch = stripped.match(/^function\s+(?:\[([^\]]*)\]\s*=\s*|([A-Za-z_]\w*)\s*=\s*)?([A-Za-z_]\w*)\s*\(([^)]*)\)/i);
    if (fnMatch) {
      const outMulti = fnMatch[1] ? fnMatch[1].split(',').map(s => s.trim()).filter(Boolean) : null;
      const outSingle = fnMatch[2] ? [fnMatch[2].trim()] : null;
      const outs = outMulti || outSingle || [];
      const name = fnMatch[3];
      const ins = fnMatch[4].split(',').map(s => s.trim()).filter(Boolean);
      const node = { type: 'function', name, ins, outs, body: [] };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    // for loop
    const forMatch = stripped.match(/^for\s+([A-Za-z_]\w*)\s*=\s*(.+)$/i);
    if (forMatch) {
      const node = { type: 'for', varName: forMatch[1], iterExpr: forMatch[2], body: [] };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    // while loop
    const whileMatch = stripped.match(/^while\s+(.+)$/i);
    if (whileMatch) {
      const node = { type: 'while', condExpr: whileMatch[1], body: [] };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    // if
    const ifMatch = stripped.match(/^if\s+(.+)$/i);
    if (ifMatch) {
      const node = { type: 'if', branches: [{ cond: ifMatch[1], body: [] }], elseBody: null };
      top().body.push(node);
      stack.push(node);
      continue;
    }

    // elseif — attach to current if node
    const elseifMatch = stripped.match(/^elseif\s+(.+)$/i);
    if (elseifMatch) {
      const ifNode = top();
      if (ifNode.type === 'if') ifNode.branches.push({ cond: elseifMatch[1], body: [] });
      continue;
    }

    // else
    if (lower === 'else') {
      const ifNode = top();
      if (ifNode.type === 'if') ifNode.elseBody = [];
      continue;
    }

    // end
    if (lower === 'end') {
      if (stack.length > 1) stack.pop();
      continue;
    }

    // Resolve the correct body array for the current top node
    // (if nodes have branches/elseBody instead of a direct body)
    const getTargetBody = (node) => {
      if (node.type === 'if') {
        return node.elseBody !== null
          ? node.elseBody
          : node.branches[node.branches.length - 1].body;
      }
      return node.body;
    };

    // break / continue / return
    if (lower === 'break') { getTargetBody(top()).push({ type: 'break' }); continue; }
    if (lower === 'continue') { getTargetBody(top()).push({ type: 'continue' }); continue; }
    if (lower === 'return') { getTargetBody(top()).push({ type: 'return' }); continue; }

    // plain statement
    getTargetBody(top()).push({ type: 'line', raw: stripped });
  }

  return stack[0].body;
}

function isCollection(value) {
  return Array.isArray(toPlain(value));
}

function mapDeep(value, mapper) {
  const plain = toPlain(value);
  if (Array.isArray(plain)) {
    return plain.map((entry) => mapDeep(entry, mapper));
  }
  return mapper(plain);
}

function registerElementwiseUnary(parser, names) {
  names.forEach((name) => {
    const fn = math[name];
    if (typeof fn !== "function") return;
    parser.set(name, (value) => (isCollection(value) ? mapDeep(value, fn) : fn(value)));
  });
}

function normalizeMatrixSyntax(line) {
  return line.replace(/\[([^[\]]+)\]/g, (_, inner) => {
    const rows = inner.split(";").map((row) =>
      row
        .trim()
        .replace(/,/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .join(", "),
    );
    return `[${rows.join("; ")}]`;
  });
}

function replaceIndexing(line, variables, functionNames = new Set()) {
  if (variables.size === 0) return line;
  return line.replace(/\b([A-Za-z_]\w*)\s*\(([^()]+)\)/g, (match, name, inner) => {
    if (!variables.has(name) || functionNames.has(name)) return match;
    return `${name}[${inner}]`;
  });
}

function replaceBackslash(expr) {
  let depth = 0;
  for (let i = 0; i < expr.length; i += 1) {
    const char = expr[i];
    if (char === "[" || char === "(" || char === "{") depth += 1;
    if (char === "]" || char === ")" || char === "}") depth -= 1;
    if (char === "\\" && depth === 0) {
      const left = expr.slice(0, i).trim();
      const right = expr.slice(i + 1).trim();
      return `mldivide(${left}, ${right})`;
    }
  }
  return expr;
}

function preprocessLine(line, variables, functionNames = new Set()) {
  let output = line.replace(/%.*$/, "").trim();
  if (!output) return "";
  output = output.replace(/^hold\s+on$/i, "hold('on')");
  output = output.replace(/^hold\s+off$/i, "hold('off')");
  output = output.replace(/^grid\s+on$/i, "grid('on')");
  output = output.replace(/^grid\s+off$/i, "grid('off')");
  output = output.replace(/^axis\s+tight$/i, "axis('tight')");
  output = output.replace(/^axis\s+equal$/i, "axis('equal')");
  output = output.replace(/^axis\s+auto$/i, "axis('auto')");
  output = normalizeMatrixSyntax(output);
  output = replaceIndexing(output, variables, functionNames);
  output = replaceBackslash(output);
  return output;
}

function formatValue(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (value && value.__multi) {
    return value.__multi.map((item) => formatValue(item)).join("\n\n");
  }
  const plain = toPlain(value);
  try {
    return mathFormat(plain, { precision: 6, notation: "auto" });
  } catch {
    return JSON.stringify(plain, null, 2);
  }
}

function inferClass(value) {
  const plain = toPlain(value);
  if (plain == null) return "null";
  if (typeof plain === "number") return Number.isInteger(plain) ? "double" : "double";
  if (typeof plain === "string") return "char";
  if (typeof plain === "boolean") return "logical";
  if (isComplexLike(plain)) return "complex double";
  if (Array.isArray(plain)) return "double array";
  if (plain?.__multi) return "tuple";
  return typeof plain;
}

function inferSize(value) {
  const plain = toPlain(value);
  if (plain == null) return [0, 0];
  if (!Array.isArray(plain)) return [1, 1];
  if (!plain.length) return [0, 0];
  if (Array.isArray(plain[0])) {
    return [plain.length, Math.max(...plain.map((row) => row.length), 0)];
  }
  return [1, plain.length];
}

function estimateBytes(value) {
  const plain = toPlain(value);
  try {
    return new Blob([JSON.stringify(plain)]).size;
  } catch {
    return 0;
  }
}

function summarizeValue(value) {
  const text = formatValue(value).replace(/\s+/g, " ").trim();
  return text.length > 90 ? `${text.slice(0, 87)}...` : text || "(empty)";
}

function buildWorkspaceSnapshot(parser, variables) {
  return Array.from(variables)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const value = toPlain(parser.get(name));
      const size = inferSize(value);
      return {
        name,
        className: inferClass(value),
        size,
        bytes: estimateBytes(value),
        preview: summarizeValue(value),
        value,
      };
    });
}

function makeWorkspaceItem(name, value) {
  const plain = toPlain(value);
  return {
    name,
    className: inferClass(plain),
    size: inferSize(plain),
    bytes: estimateBytes(plain),
    preview: summarizeValue(plain),
    value: plain,
  };
}

function parseFigureJson(figureJson) {
  if (!figureJson) return null;
  try {
    return typeof figureJson === "string" ? JSON.parse(figureJson) : figureJson;
  } catch {
    return null;
  }
}

function stringifyFigure(fig) {
  return JSON.stringify(fig);
}

function updateFigureBounds(figureJson, updater) {
  const fig = parseFigureJson(figureJson);
  if (!fig) return figureJson;
  const nextBounds = updater({
    xmin: fig.xmin,
    xmax: fig.xmax,
    ymin: fig.ymin,
    ymax: fig.ymax,
  });
  if (!nextBounds) return figureJson;
  return stringifyFigure({ ...fig, ...nextBounds });
}

function scaleFigureBounds(figureJson, factor) {
  return updateFigureBounds(figureJson, ({ xmin, xmax, ymin, ymax }) => {
    const xCenter = (xmin + xmax) / 2;
    const yCenter = (ymin + ymax) / 2;
    const xHalf = ((xmax - xmin) * factor) / 2;
    const yHalf = ((ymax - ymin) * factor) / 2;
    return {
      xmin: xCenter - xHalf,
      xmax: xCenter + xHalf,
      ymin: yCenter - yHalf,
      ymax: yCenter + yHalf,
    };
  });
}

function toggleFigureGrid(figureJson) {
  const fig = parseFigureJson(figureJson);
  if (!fig) return figureJson;
  const hasGrid = fig.elements?.some((element) => element.type === "grid");
  const elements = hasGrid
    ? fig.elements.filter((element) => element.type !== "grid")
    : [
        {
          type: "grid",
          step: Math.max((fig.xmax - fig.xmin) / 8, 1e-6),
          color: "border",
        },
        ...(fig.elements || []),
      ];
  return stringifyFigure({ ...fig, elements });
}

function extractFigureMeta(figureJson) {
  const fig = parseFigureJson(figureJson);
  if (!fig) return { axisMode: "auto", hasGrid: true };
  return {
    axisMode: fig.axisMode || "auto",
    hasGrid: fig.elements?.some((element) => element.type === "grid") ?? true,
  };
}

function renderOpenMatFigure(figureJson, C, emptyHeight = 180) {
  const parsed = parseFigureJson(figureJson);
  if (parsed?.type === "opencalc_subplots") {
    const { cols, panels } = parsed;
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 8,
        }}
      >
        {panels.map((panel, idx) => (
          <div key={idx} style={{ minWidth: 0 }}>
            {panel ? (
              <FigureRenderer figureJson={panel} C={C} />
            ) : (
              <div
                style={{
                  height: emptyHeight,
                  borderRadius: 8,
                  background: C.surface2,
                  border: `1px solid ${C.border}`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }
  return <FigureRenderer figureJson={figureJson} C={C} />;
}

function augmentSpringMassFigure(figureJson, model, C) {
  if (!model?.active) return figureJson;
  const parsed = parseFigureJson(figureJson);
  if (!parsed || parsed.type !== "opencalc_figure") return figureJson;
  const next = {
    ...parsed,
    elements: [
      ...(parsed.elements || []),
      {
        type: "curve",
        xs: model.tt,
        ys: model.xx,
        color: C.purple,
        width: 2,
      },
      {
        type: "scatter",
        xs: [model.t],
        ys: [model.displacement],
        color: C.red,
        radius: 4,
        labels: null,
      },
      {
        type: "text",
        pos: [parsed.xmin + (parsed.xmax - parsed.xmin) * 0.03, parsed.ymax - (parsed.ymax - parsed.ymin) * 0.08],
        content: "Assembly response",
        color: C.purple,
        size: 11,
      },
    ],
  };
  return stringifyFigure(next);
}

function getWorkspaceItemValue(workspaceItems, name, fallback = null) {
  return workspaceItems.find((item) => item.name === name)?.value ?? fallback;
}

function toFiniteNumber(value, fallback = 0) {
  if (Array.isArray(value)) return toFiniteNumber(value[0], fallback);
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function sanitizeName(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "item";
}

function buildPolylinePath(xs, ys, width, height, padding = 28) {
  if (!Array.isArray(xs) || !Array.isArray(ys) || xs.length === 0 || ys.length === 0) return "";
  const points = xs
    .map((x, index) => [Number(x), Number(ys[index])])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (!points.length) return "";

  const xMin = Math.min(...points.map(([x]) => x));
  const xMax = Math.max(...points.map(([x]) => x));
  const yMin = Math.min(...points.map(([, y]) => y));
  const yMax = Math.max(...points.map(([, y]) => y));
  const xSpan = Math.max(xMax - xMin, 1e-6);
  const ySpan = Math.max(yMax - yMin, 1e-6);

  return points
    .map(([x, y], index) => {
      const px = padding + ((x - xMin) / xSpan) * (width - padding * 2);
      const py = height - padding - ((y - yMin) / ySpan) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(" ");
}

function offsetPath(path, dx, dy) {
  if (!path) return "";
  return path.replace(/([ML])\s*([\d.-]+)\s*([\d.-]+)/g, (match, cmd, x, y) => (
    `${cmd} ${(Number(x) + dx).toFixed(2)} ${(Number(y) + dy).toFixed(2)}`
  ));
}

const SIM_SCENE_WIDTH = 520;
const SIM_SCENE_HEIGHT = 320;

function createSimElement(type) {
  const id = `sim-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  if (type === "line") {
    return {
      id,
      type: "line",
      role: "rod",
      name: "Rod",
      x1: 120,
      y1: 92,
      x2: 300,
      y2: 156,
      stroke: "#63b8ff",
      density: 1,
    };
  }
  if (type === "rect") {
    return {
      id,
      type: "rect",
      role: "mass",
      name: "Mass",
      x: 190,
      y: 132,
      width: 84,
      height: 56,
      fill: "#63b8ff",
      density: 1,
    };
  }
  if (type === "circle") {
    return {
      id,
      type: "circle",
      role: "mass",
      name: "Body",
      cx: 240,
      cy: 152,
      r: 28,
      fill: "#31d0c4",
      density: 1,
    };
  }
  if (type === "force") {
    return {
      id,
      type: "force",
      role: "force",
      name: "Force",
      x1: 180,
      y1: 140,
      x2: 300,
      y2: 96,
      stroke: "#ff8b8b",
      magnitude: 120,
      label: "F",
    };
  }
  if (type === "support") {
    return {
      id,
      type: "support",
      role: "support",
      name: "Support",
      x: 220,
      y: 210,
      size: 28,
      fill: "#f0b44c",
    };
  }
  if (type === "moment") {
    return {
      id,
      type: "moment",
      role: "moment",
      name: "Moment",
      x: 240,
      y: 140,
      radius: 34,
      magnitude: 45,
      label: "M",
      stroke: "#b89cff",
    };
  }
  if (type === "dimension") {
    return {
      id,
      type: "dimension",
      role: "dimension",
      name: "Dimension",
      x1: 120,
      y1: 250,
      x2: 320,
      y2: 250,
      offset: 18,
      label: "L",
      stroke: "#90a4c2",
    };
  }
  return {
    id,
    type: "point",
    role: "anchor",
    name: "Joint",
      x: 240,
      y: 152,
      fill: "#f0b44c",
    };
}

function convertScratchShapeToSimElement(shape, existing = null) {
  if (!shape?.type || !Array.isArray(shape.points)) return null;
  const id = existing?.id || `sim-import-${shape.id ?? Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const source = {
    kind: "scratch",
    shapeId: shape.id,
    linked: true,
  };

  if (shape.type === "segment") {
    const [x1, y1, x2, y2] = shape.points.map(Number);
    return {
      ...existing,
      id,
      type: "line",
      role: existing?.role || "rod",
      name: existing?.name || "Imported Segment",
      x1,
      y1,
      x2,
      y2,
      stroke: shape.color || existing?.stroke || "#63b8ff",
      density: existing?.density ?? 1,
      source,
    };
  }

  if (shape.type === "rect") {
    const [x1, y1, x2, y2] = shape.points.map(Number);
    return {
      ...existing,
      id,
      type: "rect",
      role: existing?.role || "mass",
      name: existing?.name || "Imported Rectangle",
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
      fill: shape.color || existing?.fill || "#63b8ff",
      density: existing?.density ?? 1,
      source,
    };
  }

  if (shape.type === "circle") {
    const [cx, cy, rx, ry] = shape.points.map(Number);
    return {
      ...existing,
      id,
      type: "circle",
      role: existing?.role || "mass",
      name: existing?.name || "Imported Circle",
      cx,
      cy,
      r: Math.hypot(rx - cx, ry - cy),
      fill: shape.color || existing?.fill || "#31d0c4",
      density: existing?.density ?? 1,
      source,
    };
  }

  if (shape.type === "triangle" || shape.type === "polygon") {
    return {
      ...existing,
      id,
      type: "polygon",
      role: existing?.role || "body",
      name: existing?.name || (shape.type === "triangle" ? "Imported Triangle" : "Imported Polygon"),
      points: shape.points.map(Number),
      fill: shape.color || existing?.fill || "#31d0c4",
      stroke: shape.color || existing?.stroke || "#31d0c4",
      density: existing?.density ?? 1,
      source,
    };
  }

  return null;
}

function convertSimElementToScratchShape(element) {
  if (!element) return null;
  const id = `oc-openmat-${element.id}-${Date.now()}`;
  const color = element.stroke || element.fill || "#63b8ff";
  const sw = element.role === "rod" ? 5 : 3;

  if (element.type === "line") {
    return {
      id,
      type: "segment",
      points: [Number(element.x1), Number(element.y1), Number(element.x2), Number(element.y2)],
      color,
      sw,
      sourceOpenMatElementId: element.id,
    };
  }
  if (element.type === "rect") {
    return {
      id,
      type: "rect",
      points: [
        Number(element.x),
        Number(element.y),
        Number(element.x) + Number(element.width),
        Number(element.y) + Number(element.height),
      ],
      color,
      sw,
      sourceOpenMatElementId: element.id,
    };
  }
  if (element.type === "circle") {
    return {
      id,
      type: "circle",
      points: [
        Number(element.cx),
        Number(element.cy),
        Number(element.cx) + Number(element.r),
        Number(element.cy),
      ],
      color,
      sw,
      sourceOpenMatElementId: element.id,
    };
  }
  if (element.type === "polygon") {
    const points = Array.isArray(element.points) ? element.points.map(Number) : [];
    const type = points.length === 6 ? "triangle" : "polygon";
    return {
      id,
      type,
      points,
      color,
      sw,
      sourceOpenMatElementId: element.id,
    };
  }
  if (element.type === "point") {
    return {
      id,
      type: "circle",
      points: [Number(element.x), Number(element.y), Number(element.x) + 10, Number(element.y)],
      color,
      sw,
      sourceOpenMatElementId: element.id,
    };
  }
  return null;
}

function createGuidedSource(simulationId) {
  return { kind: "guided", linked: true, simulationId };
}

function buildGuidedSceneElements(activeSimulation, workspaceItems, C) {
  if (!activeSimulation?.id) return [];
  const source = createGuidedSource(activeSimulation.id);

  if (activeSimulation.id === "pendulum-lab") {
    const L = Math.max(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "L", 1.2), 1.2), 0.2);
    const bobX = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "x", 0), 0);
    const bobY = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "y", -L), -L);
    const scale = 135 / Math.max(L, 1);
    const pivotX = 170;
    const pivotY = 52;
    const viewX = pivotX + bobX * scale;
    const viewY = pivotY + Math.abs(bobY) * scale;
    return [
      { id: "guided-pendulum-anchor", type: "point", role: "anchor", name: "Pivot", x: pivotX, y: pivotY, fill: C.text, source },
      { id: "guided-pendulum-rod", type: "line", role: "rod", name: "Rod", x1: pivotX, y1: pivotY, x2: viewX, y2: viewY, stroke: C.blue, source },
      { id: "guided-pendulum-bob", type: "circle", role: "mass", name: "Bob", cx: viewX, cy: viewY, r: 24, fill: C.blue, source },
    ];
  }

  if (activeSimulation.id === "spring-mass-lab") {
    const x = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "asm_x", getWorkspaceItemValue(workspaceItems, "x", 0)), 0);
    const massX = 290 + x * 72;
    return [
      { id: "guided-spring-wall", type: "rect", role: "anchor", name: "Wall", x: 45, y: 120, width: 18, height: 100, fill: C.border, source },
      { id: "guided-spring-link", type: "line", role: "spring", name: "Spring", x1: 63, y1: 170, x2: massX, y2: 170, stroke: C.teal, source },
      { id: "guided-spring-mass", type: "rect", role: "mass", name: "Mass", x: massX, y: 132, width: 86, height: 76, fill: C.blue, source },
    ];
  }

  if (activeSimulation.id === "projectile-lab") {
    const px = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "px", 0), 0);
    const py = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "py", 0), 0);
    const xs = getWorkspaceItemValue(workspaceItems, "x", []);
    const ys = getWorkspaceItemValue(workspaceItems, "y", []);
    const xMax = Math.max(...(Array.isArray(xs) ? xs.map((value) => Number(value)).filter(Number.isFinite) : [1]), 1);
    const yMax = Math.max(...(Array.isArray(ys) ? ys.map((value) => Number(value)).filter(Number.isFinite) : [1]), 1);
    const markerX = 34 + (px / xMax) * (SIM_SCENE_WIDTH - 68);
    const markerY = SIM_SCENE_HEIGHT - 34 - (Math.max(py, 0) / yMax) * (SIM_SCENE_HEIGHT - 68);
    return [
      { id: "guided-projectile-ground", type: "line", role: "anchor", name: "Ground", x1: 28, y1: SIM_SCENE_HEIGHT - 34, x2: SIM_SCENE_WIDTH - 24, y2: SIM_SCENE_HEIGHT - 34, stroke: C.border, source },
      { id: "guided-projectile-axis", type: "line", role: "anchor", name: "Axis", x1: 34, y1: SIM_SCENE_HEIGHT - 28, x2: 34, y2: 30, stroke: C.border, source },
      { id: "guided-projectile-body", type: "circle", role: "mass", name: "Projectile", cx: markerX, cy: markerY, r: 10, fill: C.blue, source },
    ];
  }

  if (activeSimulation.id === "merchant-lab") {
    const Fc = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "Fc", 180), 180);
    const Ft = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "Ft", 90), 90);
    const R = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "R", Math.hypot(Fc, Ft)), Math.hypot(Fc, Ft));
    const scale = 0.65;
    const originX = 170;
    const originY = 190;
    return [
      { id: "guided-merchant-tool", type: "polygon", role: "body", name: "Tool", points: [90, 90, 158, 90, 122, 152], fill: C.border, stroke: C.blue, source },
      { id: "guided-merchant-chip", type: "polygon", role: "body", name: "Chip", points: [158, 88, 230, 66, 246, 96, 176, 116], fill: C.teal, stroke: C.teal, source },
      { id: "guided-merchant-cut", type: "force", role: "force", name: "Cutting Force", x1: originX, y1: originY, x2: originX + Fc * scale, y2: originY, magnitude: Fc, label: "Fc", stroke: C.red, source },
      { id: "guided-merchant-thrust", type: "force", role: "force", name: "Thrust Force", x1: originX, y1: originY, x2: originX, y2: originY - Ft * scale, magnitude: Ft, label: "Ft", stroke: C.amber, source },
      { id: "guided-merchant-resultant", type: "force", role: "force", name: "Resultant", x1: originX, y1: originY, x2: originX + Fc * scale, y2: originY - Ft * scale, magnitude: R, label: "R", stroke: C.blue, source },
      { id: "guided-merchant-support", type: "support", role: "support", name: "Reference", x: originX, y: originY + 16, size: 24, fill: C.hint, source },
    ];
  }

  if (activeSimulation.id === "beam-lab") {
    const L = Math.max(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "L", 1.6), 1.6), 0.2);
    const F = Math.max(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "F", 320), 320), 0);
    const delta = Math.abs(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "delta", 0.01), 0.01));
    const sigma = Math.abs(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "sigma", 0), 0));
    const beamStartX = 90;
    const beamY = 156;
    const beamEndX = 350;
    const beamEndY = beamY + Math.min(80, Math.max(6, delta * 3200));
    return [
      { id: "guided-beam-wall", type: "rect", role: "anchor", name: "Wall", x: 44, y: 110, width: 26, height: 112, fill: C.border, source },
      { id: "guided-beam-support", type: "support", role: "support", name: "Fixed Support", x: beamStartX, y: beamY, size: 20, fill: C.amber, source },
      { id: "guided-beam-member", type: "line", role: "rod", name: "Beam", x1: beamStartX, y1: beamY, x2: beamEndX, y2: beamEndY, stroke: C.blue, stiffness: 1, source },
      { id: "guided-beam-load", type: "force", role: "force", name: "End Load", x1: beamEndX, y1: beamEndY - 48, x2: beamEndX, y2: beamEndY + 20, magnitude: F, label: "F", stroke: C.red, source },
      { id: "guided-beam-span", type: "dimension", role: "dimension", name: "Span", x1: beamStartX, y1: 252, x2: beamEndX, y2: 252, offset: 16, label: `Span ${L.toFixed(2)} m`, stroke: C.hint, source },
    ];
  }

  if (activeSimulation.id === "chatter-lab") {
    const L = Math.max(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "L", 0.09), 0.09), 0.02);
    const d_mm = Math.max(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "d_mm", 12), 12), 1);
    const delta = Math.abs(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "delta", 0.0002), 0.0002));
    const beamStartX = 96;
    const beamY = 154;
    const beamEndX = 356;
    const beamEndY = beamY + Math.min(44, Math.max(2, delta * 18000));
    const toolRadius = Math.max(8, Math.min(22, d_mm * 0.9));
    return [
      { id: "guided-chatter-holder", type: "rect", role: "anchor", name: "Holder", x: 54, y: 102, width: 36, height: 104, fill: C.border, source },
      { id: "guided-chatter-tool", type: "line", role: "rod", name: "Tool", x1: beamStartX, y1: beamY, x2: beamEndX, y2: beamEndY, stroke: C.blue, stiffness: 1, source },
      { id: "guided-chatter-tip", type: "circle", role: "mass", name: "Tool Tip", cx: beamEndX, cy: beamEndY, r: toolRadius, fill: C.teal, density: 1, source },
      { id: "guided-chatter-stickout", type: "dimension", role: "dimension", name: "Stickout", x1: beamStartX, y1: 252, x2: beamEndX, y2: 252, offset: 14, label: `L ${Number(L).toFixed(3)} m`, stroke: C.hint, source },
    ];
  }

  return [];
}

function resolveLinkedSimulationElements(elements, activeSimulation, workspaceItems, C) {
  if (!Array.isArray(elements) || !elements.length) return [];
  const guided = buildGuidedSceneElements(activeSimulation, workspaceItems, C);
  if (!guided.length) return elements;
  const guidedById = new Map(guided.map((element) => [element.id, element]));
  return elements.map((element) => {
    if (element?.source?.kind !== "guided" || !element?.source?.linked) {
      return element;
    }
    const nextGuided = guidedById.get(element.id);
    if (!nextGuided) return element;
    return {
      ...nextGuided,
      name: element.name || nextGuided.name,
      role: element.role || nextGuided.role,
      source: element.source,
    };
  });
}

function makeConstraintId(type = "constraint") {
  return `sim-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createMateConstraint(sourceElementId, sourceAttachmentId, targetElementId, targetAttachmentId) {
  return {
    id: makeConstraintId("mate"),
    type: "mate",
    sourceElementId,
    sourceAttachmentId,
    targetElementId,
    targetAttachmentId,
  };
}

function describeConstraint(constraint, elements) {
  if (!constraint) return "Constraint";
  const source = elements.find((element) => element.id === constraint.sourceElementId);
  const target = elements.find((element) => element.id === constraint.targetElementId);
  if (constraint.type === "mate") {
    return `${source?.name || "Part"} -> ${target?.name || "Part"} mate`;
  }
  return constraint.type || "Constraint";
}

function getSimElementAttachmentPoints(element) {
  if (!element) return [];
  if (element.type === "force" || element.type === "dimension") {
    const cx = (Number(element.x1) + Number(element.x2)) / 2;
    const cy = (Number(element.y1) + Number(element.y2)) / 2;
    return [
      { id: `${element.id}-start`, label: "Start", x: Number(element.x1), y: Number(element.y1) },
      { id: `${element.id}-center`, label: "Center", x: cx, y: cy },
      { id: `${element.id}-end`, label: "End", x: Number(element.x2), y: Number(element.y2) },
    ];
  }
  if (element.type === "support" || element.type === "moment") {
    return [{ id: `${element.id}-center`, label: "Center", x: Number(element.x), y: Number(element.y) }];
  }
  if (element.type === "line") {
    const cx = (Number(element.x1) + Number(element.x2)) / 2;
    const cy = (Number(element.y1) + Number(element.y2)) / 2;
    return [
      { id: `${element.id}-start`, label: "Start", x: Number(element.x1), y: Number(element.y1) },
      { id: `${element.id}-center`, label: "Center", x: cx, y: cy },
      { id: `${element.id}-end`, label: "End", x: Number(element.x2), y: Number(element.y2) },
    ];
  }
  if (element.type === "rect") {
    const x = Number(element.x);
    const y = Number(element.y);
    const width = Number(element.width);
    const height = Number(element.height);
    return [
      { id: `${element.id}-center`, label: "Center", x: x + width / 2, y: y + height / 2 },
      { id: `${element.id}-tl`, label: "Top Left", x, y },
      { id: `${element.id}-tr`, label: "Top Right", x: x + width, y },
      { id: `${element.id}-bl`, label: "Bottom Left", x, y: y + height },
      { id: `${element.id}-br`, label: "Bottom Right", x: x + width, y: y + height },
    ];
  }
  if (element.type === "circle") {
    const cx = Number(element.cx);
    const cy = Number(element.cy);
    const r = Number(element.r);
    return [
      { id: `${element.id}-center`, label: "Center", x: cx, y: cy },
      { id: `${element.id}-top`, label: "Top", x: cx, y: cy - r },
      { id: `${element.id}-right`, label: "Right", x: cx + r, y: cy },
      { id: `${element.id}-bottom`, label: "Bottom", x: cx, y: cy + r },
      { id: `${element.id}-left`, label: "Left", x: cx - r, y: cy },
    ];
  }
  if (element.type === "polygon") {
    const points = [];
    for (let index = 0; index < element.points.length; index += 2) {
      points.push({ x: Number(element.points[index]), y: Number(element.points[index + 1]) });
    }
    const centroid = points.reduce(
      (acc, point) => ({ x: acc.x + point.x / points.length, y: acc.y + point.y / points.length }),
      { x: 0, y: 0 },
    );
    return [
      ...points.map((point, index) => ({
        id: `${element.id}-v${index + 1}`,
        label: `Vertex ${index + 1}`,
        x: point.x,
        y: point.y,
      })),
      { id: `${element.id}-center`, label: "Center", x: centroid.x, y: centroid.y },
    ];
  }
  return [{ id: `${element.id}-point`, label: "Point", x: Number(element.x), y: Number(element.y) }];
}

function getAttachmentPointById(element, attachmentId) {
  return getSimElementAttachmentPoints(element).find((point) => point.id === attachmentId) || null;
}

function polygonMetrics(points) {
  if (!Array.isArray(points) || points.length < 6) return { area: 0, centroidX: 0, centroidY: 0 };
  let signedArea = 0;
  let cx = 0;
  let cy = 0;
  const vertexCount = points.length / 2;
  for (let index = 0; index < vertexCount; index += 1) {
    const next = (index + 1) % vertexCount;
    const x0 = Number(points[index * 2]);
    const y0 = Number(points[index * 2 + 1]);
    const x1 = Number(points[next * 2]);
    const y1 = Number(points[next * 2 + 1]);
    const cross = x0 * y1 - x1 * y0;
    signedArea += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  const area = Math.abs(signedArea) / 2;
  if (Math.abs(signedArea) < 1e-8) {
    const coords = Array.from({ length: vertexCount }, (_, index) => ({
      x: Number(points[index * 2]),
      y: Number(points[index * 2 + 1]),
    }));
    return {
      area,
      centroidX: coords.reduce((sum, point) => sum + point.x, 0) / Math.max(coords.length, 1),
      centroidY: coords.reduce((sum, point) => sum + point.y, 0) / Math.max(coords.length, 1),
    };
  }
  return {
    area,
    centroidX: cx / (3 * signedArea),
    centroidY: cy / (3 * signedArea),
  };
}

function deriveMechanicalModel(elements, constraints = []) {
  const entities = [];
  const workspace = [];
  let bodyCount = 0;
  let springCount = 0;
  let supportCount = 0;
  let constraintCount = Array.isArray(constraints) ? constraints.length : 0;
  let totalMass = 0;
  let totalForceMagnitude = 0;

  elements.forEach((element) => {
    if (!element) return;
    if (element.type === "line" && element.role !== "force" && element.role !== "dimension") {
      const length = Math.hypot(Number(element.x2) - Number(element.x1), Number(element.y2) - Number(element.y1));
      const model = {
        id: element.id,
        kind: element.role === "spring" ? "spring" : "member",
        name: element.name,
        length,
        stiffness: Number(element.stiffness ?? 1),
        damping: Number(element.damping ?? 0),
      };
      entities.push(model);
      workspace.push({ name: `${sanitizeName(element.name || element.id)}_length`, value: Number(length.toFixed(3)) });
      if (element.role === "spring") {
        springCount += 1;
        workspace.push({ name: `${sanitizeName(element.name || element.id)}_k`, value: model.stiffness });
      }
      return;
    }
    if (element.type === "rect" || element.type === "circle" || element.type === "polygon") {
      let area = 0;
      let centroidX = 0;
      let centroidY = 0;
      if (element.type === "rect") {
        area = Number(element.width) * Number(element.height);
        centroidX = Number(element.x) + Number(element.width) / 2;
        centroidY = Number(element.y) + Number(element.height) / 2;
      } else if (element.type === "circle") {
        area = Math.PI * Number(element.r) * Number(element.r);
        centroidX = Number(element.cx);
        centroidY = Number(element.cy);
      } else {
        const polygon = polygonMetrics(element.points);
        area = polygon.area;
        centroidX = polygon.centroidX;
        centroidY = polygon.centroidY;
      }
      const density = Number(element.density ?? 1);
      const mass = area * density;
      totalMass += mass;
      bodyCount += 1;
      entities.push({
        id: element.id,
        kind: element.role === "mass" ? "mass" : "body",
        name: element.name,
        area,
        density,
        mass,
        centroidX,
        centroidY,
      });
      const safeName = sanitizeName(element.name || element.id);
      workspace.push({ name: `${safeName}_area`, value: Number(area.toFixed(3)) });
      workspace.push({ name: `${safeName}_mass`, value: Number(mass.toFixed(3)) });
      return;
    }
    if (element.type === "point" || element.type === "support") {
      supportCount += 1;
      entities.push({
        id: element.id,
        kind: element.type === "support" ? "support" : "anchor",
        name: element.name,
        x: Number(element.x),
        y: Number(element.y),
      });
      return;
    }
    if (element.type === "force") {
      const magnitude = Number(element.magnitude) || Math.hypot(Number(element.x2) - Number(element.x1), Number(element.y2) - Number(element.y1));
      totalForceMagnitude += magnitude;
      entities.push({
        id: element.id,
        kind: "force",
        name: element.name,
        magnitude,
        fx: Number(element.x2) - Number(element.x1),
        fy: Number(element.y2) - Number(element.y1),
      });
      workspace.push({ name: `${sanitizeName(element.name || element.id)}_force`, value: Number(magnitude.toFixed(3)) });
    }
  });

  return {
    entities,
    summary: {
      bodyCount,
      springCount,
      supportCount,
      constraintCount,
      totalMass: Number(totalMass.toFixed(3)),
      totalForceMagnitude: Number(totalForceMagnitude.toFixed(3)),
    },
    workspace,
  };
}

function deriveConstraintSemantics(elements, constraints = []) {
  const byId = new Map((elements || []).map((element) => [element.id, element]));
  const semantics = {
    fixed: [],
    springConnections: [],
    massBodies: [],
    drivenInputs: [],
  };

  elements.forEach((element) => {
    if (!element) return;
    if (element.role === "mass" && ["rect", "circle", "polygon"].includes(element.type)) {
      semantics.massBodies.push({ id: element.id, name: element.name || element.id, element });
    }
    if (element.role === "anchor" || element.role === "support" || element.type === "support" || element.type === "point") {
      semantics.fixed.push({ id: element.id, name: element.name || element.id, element });
    }
  });

  constraints.forEach((constraint) => {
    if (!constraint || constraint.type !== "mate") return;
    const source = byId.get(constraint.sourceElementId);
    const target = byId.get(constraint.targetElementId);
    if (!source || !target) return;
    const sourcePoint = getAttachmentPointById(source, constraint.sourceAttachmentId);
    const targetPoint = getAttachmentPointById(target, constraint.targetAttachmentId);
    if (!sourcePoint || !targetPoint) return;

    const sourceFixed = source.role === "anchor" || source.role === "support" || source.type === "support" || source.type === "point";
    const targetFixed = target.role === "anchor" || target.role === "support" || target.type === "support" || target.type === "point";
    const sourceMass = source.role === "mass";
    const targetMass = target.role === "mass";
    const sourceSpring = source.role === "spring" && source.type === "line";
    const targetSpring = target.role === "spring" && target.type === "line";

    if (sourceSpring) {
      semantics.springConnections.push({
        springElementId: source.id,
        springAttachmentId: constraint.sourceAttachmentId,
        counterpartElementId: target.id,
        counterpartAttachmentId: constraint.targetAttachmentId,
        kind: targetFixed ? "fixed" : targetMass ? "mass" : "other",
        springPoint: sourcePoint,
        counterpartPoint: targetPoint,
      });
    }
    if (targetSpring) {
      semantics.springConnections.push({
        springElementId: target.id,
        springAttachmentId: constraint.targetAttachmentId,
        counterpartElementId: source.id,
        counterpartAttachmentId: constraint.sourceAttachmentId,
        kind: sourceFixed ? "fixed" : sourceMass ? "mass" : "other",
        springPoint: targetPoint,
        counterpartPoint: sourcePoint,
      });
    }
  });

  return semantics;
}

function deriveConstraintDrivenSpringMassModel(elements, constraints = [], workspaceItems = []) {
  const semantics = deriveConstraintSemantics(elements, constraints);
  const springs = elements.filter((element) => element?.role === "spring" && element?.type === "line");
  const masses = elements.filter((element) => element?.role === "mass" && ["rect", "circle", "polygon"].includes(element?.type));
  const fixedElements = elements.filter((element) => element && (element.role === "anchor" || element.role === "support" || element.type === "support" || element.type === "point"));

  const t = Math.max(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "t", 0), 0), 0);
  const amplitude = Math.abs(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "A", 0.35), 0.35));
  const fallbackSpring = springs[0] || null;
  const fallbackMass = masses[0] || null;
  const fallbackFixed = fixedElements[0] || null;

  let activeSpring = null;
  let activeMass = null;
  let fixedEndpoint = null;
  let springMassAttachment = null;

  springs.some((spring) => {
    const links = semantics.springConnections.filter((connection) => connection.springElementId === spring.id);
    const fixedLink = links.find((connection) => connection.kind === "fixed");
    const massLink = links.find((connection) => connection.kind === "mass");
    if (!fixedLink || !massLink) return false;
    activeSpring = spring;
    activeMass = elements.find((element) => element.id === massLink.counterpartElementId) || null;
    fixedEndpoint = fixedLink.counterpartPoint;
    springMassAttachment = {
      springAttachmentId: massLink.springAttachmentId,
      massAttachmentId: massLink.counterpartAttachmentId,
      massPoint: massLink.counterpartPoint,
    };
    return true;
  });

  if (!activeSpring || !activeMass || !fixedEndpoint || !springMassAttachment?.massPoint) {
    if (!fallbackSpring || !fallbackMass || !fallbackFixed) {
      return { active: false, semantics };
    }
    activeSpring = fallbackSpring;
    activeMass = fallbackMass;
    fixedEndpoint = getSimElementAttachmentPoints(fallbackFixed)[0] || null;
    springMassAttachment = {
      springAttachmentId: `${fallbackSpring.id}-end`,
      massAttachmentId: `${fallbackMass.id}-center`,
      massPoint: getAttachmentPointById(fallbackMass, `${fallbackMass.id}-center`) || getSimElementAttachmentPoints(fallbackMass)[0] || null,
    };
  }

  if (!fixedEndpoint || !springMassAttachment?.massPoint) {
    return { active: false, semantics };
  }

  const springLength = Math.hypot(Number(activeSpring.x2) - Number(activeSpring.x1), Number(activeSpring.y2) - Number(activeSpring.y1));
  const derivedMass = (() => {
    if (activeMass.type === "rect") return (Number(activeMass.width) * Number(activeMass.height) * Number(activeMass.density ?? 1)) / 9000;
    if (activeMass.type === "circle") return (Math.PI * Number(activeMass.r) * Number(activeMass.r) * Number(activeMass.density ?? 1)) / 9000;
    if (activeMass.type === "polygon") return (polygonMetrics(activeMass.points).area * Number(activeMass.density ?? 1)) / 9000;
    return 1;
  })();

  const k = Math.max(toFiniteNumber(activeSpring.stiffness, getWorkspaceItemValue(workspaceItems, "k", 3.2)), 0.05);
  const m = Math.max(toFiniteNumber(activeMass.massValue, getWorkspaceItemValue(workspaceItems, "m", derivedMass)), 0.05);
  const c = Math.max(toFiniteNumber(activeSpring.damping, getWorkspaceItemValue(workspaceItems, "c", 0.35)), 0);
  const alpha = c / (2 * m);
  const omegaN = Math.sqrt(Math.max(k / m, 1e-6));
  const omegaD = Math.sqrt(Math.max(omegaN * omegaN - alpha * alpha, 1e-6));
  const dampingRatio = Math.min(alpha / Math.max(omegaN, 1e-6), 5);
  const displacement = amplitude * Math.exp(-alpha * t) * Math.cos(omegaD * t);
  const startT = Math.max(0, t - 10);
  const tt = Array.from({ length: 220 }, (_, index) => startT + ((t - startT) * index) / 219);
  const xx = tt.map((time) => amplitude * Math.exp(-alpha * time) * Math.cos(omegaD * time));
  const unitDx = Number(springMassAttachment.massPoint.x) - Number(fixedEndpoint.x);
  const unitDy = Number(springMassAttachment.massPoint.y) - Number(fixedEndpoint.y);
  const axisLength = Math.hypot(unitDx, unitDy) || 1;
  const axis = { x: unitDx / axisLength, y: unitDy / axisLength };
  const viewportScale = 92 / Math.max(amplitude, 0.35);
  const offset = {
    dx: axis.x * displacement * viewportScale,
    dy: axis.y * displacement * viewportScale,
  };

  return {
    active: true,
    semantics,
    springElementId: activeSpring.id,
    massElementId: activeMass.id,
    displacement,
    omegaN,
    omegaD,
    dampingRatio,
    springLength,
    k,
    m,
    c,
    t,
    tt,
    xx,
    offset,
    massAttachmentId: springMassAttachment.massAttachmentId,
    springAttachmentId: springMassAttachment.springAttachmentId,
  };
}

function applyConstraintDrivenSpringMassPose(elements, model) {
  if (!model?.active || !Array.isArray(elements) || !elements.length) return elements;
  return elements.map((element) => {
    if (element.id === model.massElementId) {
      return translateSimElement(element, model.offset.dx, model.offset.dy);
    }
    if (element.id === model.springElementId && element.type === "line") {
      const movedMass = elements.find((entry) => entry.id === model.massElementId);
      const massPoint = movedMass ? getAttachmentPointById(movedMass, model.massAttachmentId) : null;
      const movedPoint = massPoint ? { x: massPoint.x + model.offset.dx, y: massPoint.y + model.offset.dy } : null;
      if (!movedPoint) return element;
      const suffix = model.springAttachmentId.replace(`${element.id}-`, "");
      if (suffix === "start") return { ...element, x1: movedPoint.x, y1: movedPoint.y };
      if (suffix === "end") return { ...element, x2: movedPoint.x, y2: movedPoint.y };
    }
    return element;
  });
}

function updateElementFromAttachmentDrag(element, attachmentId, x, y) {
  if (!element || !attachmentId) return element;
  const suffix = attachmentId.replace(`${element.id}-`, "");

  if (element.type === "line") {
    if (suffix === "start") return { ...element, x1: x, y1: y };
    if (suffix === "end") return { ...element, x2: x, y2: y };
    if (suffix === "center") {
      const cx = (Number(element.x1) + Number(element.x2)) / 2;
      const cy = (Number(element.y1) + Number(element.y2)) / 2;
      const dx = x - cx;
      const dy = y - cy;
      return { ...element, x1: Number(element.x1) + dx, y1: Number(element.y1) + dy, x2: Number(element.x2) + dx, y2: Number(element.y2) + dy };
    }
  }

  if (element.type === "force" || element.type === "dimension") {
    if (suffix === "start") return { ...element, x1: x, y1: y };
    if (suffix === "end") return { ...element, x2: x, y2: y };
    if (suffix === "center") {
      const cx = (Number(element.x1) + Number(element.x2)) / 2;
      const cy = (Number(element.y1) + Number(element.y2)) / 2;
      const dx = x - cx;
      const dy = y - cy;
      return { ...element, x1: Number(element.x1) + dx, y1: Number(element.y1) + dy, x2: Number(element.x2) + dx, y2: Number(element.y2) + dy };
    }
  }

  if (element.type === "support" || element.type === "moment") {
    if (suffix === "center") return { ...element, x, y };
  }

  if (element.type === "rect") {
    const left = Number(element.x);
    const top = Number(element.y);
    const right = left + Number(element.width);
    const bottom = top + Number(element.height);
    if (suffix === "center") {
      return { ...element, x: x - Number(element.width) / 2, y: y - Number(element.height) / 2 };
    }
    if (suffix === "tl") return { ...element, x, y, width: Math.max(8, right - x), height: Math.max(8, bottom - y) };
    if (suffix === "tr") return { ...element, y, width: Math.max(8, x - left), height: Math.max(8, bottom - y) };
    if (suffix === "bl") return { ...element, x, width: Math.max(8, right - x), height: Math.max(8, y - top) };
    if (suffix === "br") return { ...element, width: Math.max(8, x - left), height: Math.max(8, y - top) };
  }

  if (element.type === "circle") {
    const cx = Number(element.cx);
    const cy = Number(element.cy);
    if (suffix === "center") return { ...element, cx: x, cy: y };
    const r = Math.max(6, Math.hypot(x - cx, y - cy));
    return { ...element, r };
  }

  if (element.type === "polygon") {
    const points = [...element.points];
    if (suffix === "center") {
      const attachments = getSimElementAttachmentPoints(element);
      const center = attachments.find((point) => point.id.endsWith("-center"));
      const dx = x - (center?.x ?? 0);
      const dy = y - (center?.y ?? 0);
      for (let index = 0; index < points.length; index += 2) {
        points[index] += dx;
        points[index + 1] += dy;
      }
      return { ...element, points };
    }
    const match = suffix.match(/^v(\d+)$/);
    if (match) {
      const vertexIndex = (Number(match[1]) - 1) * 2;
      points[vertexIndex] = x;
      points[vertexIndex + 1] = y;
      return { ...element, points };
    }
  }

  if (element.type === "point") {
    return { ...element, x, y };
  }

  return element;
}

function buildSpringPolyline(x1, y1, x2, y2, turns = 7, amplitude = 12) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const points = [];

  for (let index = 0; index <= turns + 1; index += 1) {
    const t = index / (turns + 1);
    const baseX = x1 + dx * t;
    const baseY = y1 + dy * t;
    let offset = 0;
    if (index !== 0 && index !== turns + 1) {
      offset = index % 2 === 0 ? amplitude : -amplitude;
    }
    points.push(`${(baseX + nx * offset).toFixed(2)},${(baseY + ny * offset).toFixed(2)}`);
  }

  return points.join(" ");
}

function getElementBounds(element) {
  if (!element) return null;
  if (element.type === "line" || element.type === "force" || element.type === "dimension") {
    return {
      minX: Math.min(Number(element.x1), Number(element.x2)),
      maxX: Math.max(Number(element.x1), Number(element.x2)),
      minY: Math.min(Number(element.y1), Number(element.y2)),
      maxY: Math.max(Number(element.y1), Number(element.y2)),
    };
  }
  if (element.type === "rect") {
    return {
      minX: Number(element.x),
      maxX: Number(element.x) + Number(element.width),
      minY: Number(element.y),
      maxY: Number(element.y) + Number(element.height),
    };
  }
  if (element.type === "circle") {
    return {
      minX: Number(element.cx) - Number(element.r),
      maxX: Number(element.cx) + Number(element.r),
      minY: Number(element.cy) - Number(element.r),
      maxY: Number(element.cy) + Number(element.r),
    };
  }
  if (element.type === "point" || element.type === "support" || element.type === "moment") {
    const size = Number(element.size || element.radius || 8);
    return {
      minX: Number(element.x) - size,
      maxX: Number(element.x) + size,
      minY: Number(element.y) - size,
      maxY: Number(element.y) + size,
    };
  }
  if (element.type === "polygon") {
    const xs = [];
    const ys = [];
    for (let index = 0; index < element.points.length; index += 2) {
      xs.push(Number(element.points[index]));
      ys.push(Number(element.points[index + 1]));
    }
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }
  return null;
}

function translateSimElement(element, dx, dy) {
  if (!element) return element;
  if (element.type === "line" || element.type === "force" || element.type === "dimension") {
    return { ...element, x1: Number(element.x1) + dx, y1: Number(element.y1) + dy, x2: Number(element.x2) + dx, y2: Number(element.y2) + dy };
  }
  if (element.type === "rect") return { ...element, x: Number(element.x) + dx, y: Number(element.y) + dy };
  if (element.type === "circle") return { ...element, cx: Number(element.cx) + dx, cy: Number(element.cy) + dy };
  if (element.type === "polygon") {
    return {
      ...element,
      points: element.points.map((value, index) => Number(value) + (index % 2 === 0 ? dx : dy)),
    };
  }
  return { ...element, x: Number(element.x) + dx, y: Number(element.y) + dy };
}

function centerSimulationElements(elements, width = SIM_SCENE_WIDTH, height = SIM_SCENE_HEIGHT) {
  if (!Array.isArray(elements) || !elements.length) return [];
  const bounds = elements.map(getElementBounds).filter(Boolean);
  if (!bounds.length) return elements;
  const minX = Math.min(...bounds.map((bound) => bound.minX));
  const maxX = Math.max(...bounds.map((bound) => bound.maxX));
  const minY = Math.min(...bounds.map((bound) => bound.minY));
  const maxY = Math.max(...bounds.map((bound) => bound.maxY));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const dx = width / 2 - centerX;
  const dy = height / 2 - centerY;
  return elements.map((element) => translateSimElement(element, dx, dy));
}

function alignSimulationElementToTarget(element, target) {
  const sourceBounds = getElementBounds(element);
  const targetBounds = getElementBounds(target);
  if (!sourceBounds || !targetBounds) return element;
  const sourceCenterX = (sourceBounds.minX + sourceBounds.maxX) / 2;
  const sourceCenterY = (sourceBounds.minY + sourceBounds.maxY) / 2;
  const targetCenterX = (targetBounds.minX + targetBounds.maxX) / 2;
  const targetCenterY = (targetBounds.minY + targetBounds.maxY) / 2;
  return translateSimElement(element, targetCenterX - sourceCenterX, targetCenterY - sourceCenterY);
}

function getSimulationRoleMeta(role) {
  if (role === "anchor") return { label: "Fixed", description: "Locked support or wall" };
  if (role === "spring") return { label: "Spring", description: "Flexible connector" };
  if (role === "mass") return { label: "Mass", description: "Body with area and mass" };
  if (role === "support") return { label: "Support", description: "Support symbol / reaction point" };
  if (role === "force") return { label: "Force", description: "Applied load" };
  if (role === "dimension") return { label: "Dimension", description: "Measurement marker" };
  if (role === "body") return { label: "Body", description: "General geometry body" };
  return { label: "Member", description: "Structural member / rod" };
}

const SIMULATION_TYPE_PROPERTY_SCHEMAS = {
  line: [
    { field: "x1", label: "x1", type: "number", min: -600, max: 1200, step: 1 },
    { field: "y1", label: "y1", type: "number", min: -600, max: 1200, step: 1 },
    { field: "x2", label: "x2", type: "number", min: -600, max: 1200, step: 1 },
    { field: "y2", label: "y2", type: "number", min: -600, max: 1200, step: 1 },
  ],
  rect: [
    { field: "x", label: "x", type: "number", min: -600, max: 1200, step: 1 },
    { field: "y", label: "y", type: "number", min: -600, max: 1200, step: 1 },
    { field: "width", label: "width", type: "number", min: 4, max: 800, step: 1, slider: true },
    { field: "height", label: "height", type: "number", min: 4, max: 800, step: 1, slider: true },
  ],
  circle: [
    { field: "cx", label: "cx", type: "number", min: -600, max: 1200, step: 1 },
    { field: "cy", label: "cy", type: "number", min: -600, max: 1200, step: 1 },
    { field: "r", label: "radius", type: "number", min: 2, max: 240, step: 1, slider: true },
  ],
  point: [
    { field: "x", label: "x", type: "number", min: -600, max: 1200, step: 1 },
    { field: "y", label: "y", type: "number", min: -600, max: 1200, step: 1 },
  ],
  force: [
    { field: "x1", label: "x1", type: "number", min: -600, max: 1200, step: 1 },
    { field: "y1", label: "y1", type: "number", min: -600, max: 1200, step: 1 },
    { field: "x2", label: "x2", type: "number", min: -600, max: 1200, step: 1 },
    { field: "y2", label: "y2", type: "number", min: -600, max: 1200, step: 1 },
    { field: "magnitude", label: "magnitude", type: "number", min: -5000, max: 5000, step: 1, slider: true },
    { field: "label", label: "label", type: "text" },
  ],
  dimension: [
    { field: "x1", label: "x1", type: "number", min: -600, max: 1200, step: 1 },
    { field: "y1", label: "y1", type: "number", min: -600, max: 1200, step: 1 },
    { field: "x2", label: "x2", type: "number", min: -600, max: 1200, step: 1 },
    { field: "y2", label: "y2", type: "number", min: -600, max: 1200, step: 1 },
    { field: "offset", label: "offset", type: "number", min: -200, max: 200, step: 1, slider: true },
    { field: "label", label: "label", type: "text" },
  ],
  support: [
    { field: "x", label: "x", type: "number", min: -600, max: 1200, step: 1 },
    { field: "y", label: "y", type: "number", min: -600, max: 1200, step: 1 },
    { field: "size", label: "size", type: "number", min: 8, max: 240, step: 1, slider: true },
  ],
  moment: [
    { field: "x", label: "x", type: "number", min: -600, max: 1200, step: 1 },
    { field: "y", label: "y", type: "number", min: -600, max: 1200, step: 1 },
    { field: "radius", label: "radius", type: "number", min: 8, max: 240, step: 1, slider: true },
    { field: "magnitude", label: "magnitude", type: "number", min: -5000, max: 5000, step: 1, slider: true },
  ],
};

const SIMULATION_ROLE_PROPERTY_SCHEMAS = {
  anchor: [
    { field: "stiffness", label: "support stiffness", type: "number", min: 0, max: 50000, step: 10, slider: true },
    { field: "damping", label: "support damping", type: "number", min: 0, max: 2000, step: 1, slider: true },
  ],
  rod: [
    { field: "density", label: "density", type: "number", min: 0, max: 20000, step: 10, slider: true },
    { field: "stiffness", label: "axial stiffness", type: "number", min: 0, max: 50000, step: 10, slider: true },
    { field: "damping", label: "damping", type: "number", min: 0, max: 2000, step: 1, slider: true },
    { field: "youngsModulus", label: "Young's modulus", type: "number", min: 0, max: 400000000000, step: 1000000000 },
    { field: "area", label: "area", type: "number", min: 0, max: 10000, step: 1 },
  ],
  spring: [
    { field: "stiffness", label: "spring constant", type: "number", min: 0, max: 50000, step: 10, slider: true },
    { field: "damping", label: "damping", type: "number", min: 0, max: 5000, step: 1, slider: true },
    { field: "restLength", label: "rest length", type: "number", min: 0, max: 800, step: 1, slider: true },
  ],
  mass: [
    { field: "density", label: "density", type: "number", min: 0, max: 20000, step: 10, slider: true },
    { field: "massValue", label: "mass", type: "number", min: 0, max: 10000, step: 0.1, slider: true },
    { field: "damping", label: "damping", type: "number", min: 0, max: 2000, step: 1, slider: true },
    { field: "centerOfMassOffset", label: "center of mass offset", type: "number", min: -200, max: 200, step: 1 },
  ],
  support: [
    { field: "size", label: "support size", type: "number", min: 8, max: 240, step: 1, slider: true },
    { field: "stiffness", label: "reaction stiffness", type: "number", min: 0, max: 50000, step: 10, slider: true },
  ],
  force: [
    { field: "magnitude", label: "load magnitude", type: "number", min: -5000, max: 5000, step: 1, slider: true },
  ],
};

function getSimulationPropertySchema(element) {
  if (!element) return [];
  const baseFields = [
    { field: "name", label: "name", type: "text" },
  ];
  const typeFields = SIMULATION_TYPE_PROPERTY_SCHEMAS[element.type] || [];
  const roleFields = SIMULATION_ROLE_PROPERTY_SCHEMAS[element.role] || [];
  const schema = [...baseFields, ...typeFields, ...roleFields];
  const seen = new Set();
  return schema.filter((item) => {
    if (seen.has(item.field)) return false;
    seen.add(item.field);
    return true;
  });
}

function getSimulationPropertyValue(element, field) {
  if (!element) return "";
  const value = element[field];
  return value ?? "";
}

function getSimulationQuickStart(activeSimulation, hasAnimatedControls) {
  const title = activeSimulation?.title || "this workbench";
  return [
    `Press Run to load ${title}. ${hasAnimatedControls ? "Animated workbenches use Play inside Parameters after the first run." : "Static workbenches use Run plus the sliders in Parameters; there is no Play button."}`,
    "Click a part in the viewport to select it. The Properties rail is where you rename it, change its role, or replace it from ScratchPad.",
    "Pick one attachment point on the selected part, then use Start Mate and click a point on another part to snap them together.",
    "Double-click a part to open a ScratchPad copy for shape editing, then Send to OpenMAT to bring the edited shape back.",
    "Use Reload Lab to restore the default editable scene, and Refresh Model when you want to recalculate without losing your scene edits.",
  ];
}

function simulationElementsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    const av = a[key];
    const bv = b[key];
    if (Array.isArray(av) || Array.isArray(bv)) {
      if (JSON.stringify(av) !== JSON.stringify(bv)) return false;
      continue;
    }
    if (av && typeof av === "object" || bv && typeof bv === "object") {
      if (JSON.stringify(av) !== JSON.stringify(bv)) return false;
      continue;
    }
    if (av !== bv) return false;
  }
  return true;
}

function OpenMatTooltip({ content, children, delay = 700, fullWidth = false }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const show = () => {
    if (!content) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setOpen(true);
    }, delay);
  };

  const hide = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
  };

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      className={fullWidth ? "relative w-full" : "relative inline-flex"}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open && content && (
        <div
          className="pointer-events-none absolute bottom-full left-1/2 z-[120] mb-2 w-64 -translate-x-1/2 rounded-xl border px-3 py-2 text-[11px] leading-5 shadow-2xl"
          style={{
            borderColor: "rgba(125, 211, 252, 0.28)",
            background: "rgba(8, 15, 31, 0.96)",
            color: "#d8f0ff",
            backdropFilter: "blur(10px)",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

function renderAuthoredSimElement(element, C, isSelected, onSelect, onDoubleSelect) {
  const common = {
    onClick: (event) => {
      event.stopPropagation();
      onSelect?.(element.id);
    },
    onDoubleClick: (event) => {
      event.stopPropagation();
      onDoubleSelect?.(element.id);
    },
    style: { cursor: "pointer" },
  };
  const highlight = isSelected ? { stroke: C.amber, strokeWidth: 3 } : {};

  if (element.type === "line") {
    if (element.role === "spring") {
      return (
        <polyline
          key={element.id}
          points={buildSpringPolyline(Number(element.x1), Number(element.y1), Number(element.x2), Number(element.y2))}
          fill="none"
          stroke={isSelected ? C.amber : C.teal}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...common}
        />
      );
    }
    return (
      <line
        key={element.id}
        x1={element.x1}
        y1={element.y1}
        x2={element.x2}
        y2={element.y2}
        stroke={isSelected ? C.amber : element.stroke || C.blue}
        strokeWidth={element.role === "rod" ? 6 : 4}
        strokeLinecap="round"
        {...common}
      />
    );
  }

  if (element.type === "rect") {
    return (
      <rect
        key={element.id}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rx={element.role === "mass" ? 14 : 8}
        fill={element.fill || C.blue}
        opacity={0.88}
        {...highlight}
        {...common}
      />
    );
  }

  if (element.type === "circle") {
    return (
      <circle
        key={element.id}
        cx={element.cx}
        cy={element.cy}
        r={element.r}
        fill={element.fill || C.teal}
        opacity={0.9}
        {...highlight}
        {...common}
      />
    );
  }

  if (element.type === "polygon") {
    const points = [];
    for (let index = 0; index < element.points.length; index += 2) {
      points.push(`${element.points[index]},${element.points[index + 1]}`);
    }
    return (
      <polygon
        key={element.id}
        points={points.join(" ")}
        fill={element.fill || C.teal}
        fillOpacity={0.2}
        stroke={isSelected ? C.amber : element.stroke || C.teal}
        strokeWidth={isSelected ? 3 : 2}
        {...common}
      />
    );
  }

  if (element.type === "force") {
    const dx = Number(element.x2) - Number(element.x1);
    const dy = Number(element.y2) - Number(element.y1);
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    const arrow = 14;
    const px = -uy;
    const py = ux;
    const tipX = Number(element.x2);
    const tipY = Number(element.y2);
    const baseX = tipX - ux * arrow;
    const baseY = tipY - uy * arrow;
    const color = isSelected ? C.amber : element.stroke || C.red;
    return (
      <g key={element.id} {...common}>
        <line x1={element.x1} y1={element.y1} x2={tipX} y2={tipY} stroke={color} strokeWidth={4} strokeLinecap="round" />
        <polygon
          points={`${tipX},${tipY} ${baseX + px * 6},${baseY + py * 6} ${baseX - px * 6},${baseY - py * 6}`}
          fill={color}
        />
        <text x={baseX + px * 10} y={baseY + py * 10} fill={color} fontSize="12" fontWeight="700">
          {element.label || "F"} {Number(element.magnitude || length).toFixed(0)}
        </text>
      </g>
    );
  }

  if (element.type === "support") {
    const size = Number(element.size || 26);
    const x = Number(element.x);
    const y = Number(element.y);
    const color = isSelected ? C.amber : element.fill || C.amber;
    return (
      <g key={element.id} {...common}>
        <polygon points={`${x},${y} ${x - size / 2},${y + size} ${x + size / 2},${y + size}`} fill={color} fillOpacity="0.3" stroke={color} strokeWidth={2} />
        <line x1={x - size / 2 - 8} y1={y + size} x2={x + size / 2 + 8} y2={y + size} stroke={color} strokeWidth={3} />
      </g>
    );
  }

  if (element.type === "moment") {
    const radius = Number(element.radius || 32);
    const x = Number(element.x);
    const y = Number(element.y);
    const color = isSelected ? C.amber : element.stroke || C.purple;
    const d = `M ${x - radius} ${y} A ${radius} ${radius} 0 1 1 ${x + radius * 0.6} ${y - radius * 0.78}`;
    return (
      <g key={element.id} {...common}>
        <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
        <polygon points={`${x + radius * 0.6},${y - radius * 0.78} ${x + radius * 0.2},${y - radius * 0.72} ${x + radius * 0.42},${y - radius * 0.38}`} fill={color} />
        <text x={x + radius + 4} y={y - radius + 4} fill={color} fontSize="12" fontWeight="700">
          {element.label || "M"} {Number(element.magnitude || 0).toFixed(0)}
        </text>
      </g>
    );
  }

  if (element.type === "dimension") {
    const x1 = Number(element.x1);
    const y1 = Number(element.y1);
    const x2 = Number(element.x2);
    const y2 = Number(element.y2);
    const offset = Number(element.offset || 16);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    const sx1 = x1 + nx * offset;
    const sy1 = y1 + ny * offset;
    const sx2 = x2 + nx * offset;
    const sy2 = y2 + ny * offset;
    const color = isSelected ? C.amber : element.stroke || C.muted;
    return (
      <g key={element.id} {...common}>
        <line x1={x1} y1={y1} x2={sx1} y2={sy1} stroke={color} strokeWidth={2} />
        <line x1={x2} y1={y2} x2={sx2} y2={sy2} stroke={color} strokeWidth={2} />
        <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke={color} strokeWidth={2} />
        <text x={(sx1 + sx2) / 2 + nx * 8} y={(sy1 + sy2) / 2 + ny * 8} fill={color} fontSize="12" fontWeight="700">
          {element.label ? element.label : `L ${length.toFixed(1)}`}
        </text>
      </g>
    );
  }

  return (
    <circle
      key={element.id}
      cx={element.x}
      cy={element.y}
      r={isSelected ? 9 : 7}
      fill={element.fill || C.amber}
      stroke={isSelected ? C.text : C.surface}
      strokeWidth={2}
      {...common}
    />
  );
}

function buildSimulationScene(activeSimulation, workspaceItems, C, authoredElements = []) {
  if (!activeSimulation?.id) return null;
  const hasAuthoredScene = authoredElements.length > 0;

  if (activeSimulation.id === "pendulum-lab") {
    const L = Math.max(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "L", 1.2), 1.2), 0.2);
    const bobX = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "x", 0), 0);
    const bobY = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "y", -L), -L);
    const scale = 135 / Math.max(L, 1);
    const pivotX = 170;
    const pivotY = 52;
    const viewX = pivotX + bobX * scale;
    const viewY = pivotY + Math.abs(bobY) * scale;

    return {
      title: "Pendulum scene",
      note: "Figure output still available in the script workspace.",
      width: 520,
      height: 320,
      defs: [
        {
          type: "linearGradient",
          id: "pendulum-glow",
          x1: "0%",
          x2: "100%",
          stops: [
            { offset: "0%", color: C.blue, opacity: "0.25" },
            { offset: "100%", color: C.teal, opacity: "0.5" },
          ],
        },
      ],
      shapes: [
        { type: "rect", x: 0, y: 0, width: 520, height: 320, fill: C.surface3 },
        { type: "line", x1: 60, y1: 260, x2: 460, y2: 260, stroke: C.border, strokeWidth: 2 },
        ...(!hasAuthoredScene ? [
          { type: "line", x1: pivotX, y1: pivotY, x2: viewX, y2: viewY, stroke: "url(#pendulum-glow)", strokeWidth: 5 },
          { type: "circle", cx: pivotX, cy: pivotY, r: 8, fill: C.text },
          { type: "circle", cx: viewX, cy: viewY, r: 24, fill: C.blue, opacity: 0.9 },
          { type: "circle", cx: viewX, cy: viewY, r: 34, fill: C.blue, opacity: 0.12 },
        ] : []),
        {
          type: "path",
          d: `M ${pivotX - 90} ${pivotY + 170} Q ${pivotX} ${pivotY + 210} ${pivotX + 90} ${pivotY + 170}`,
          fill: "none",
          stroke: C.border,
          strokeDasharray: "8 8",
        },
        { type: "text", x: 28, y: 34, fill: C.muted, fontSize: 14, text: "Pivot and bob geometry" },
        {
          type: "text",
          x: 28,
          y: 56,
          fill: C.hint,
          fontSize: 12,
          text: hasAuthoredScene
            ? "Editable pendulum scene active. Select a part, pick a point, then Mate or replace it."
            : "This panel is meant to feel like a scene viewport, not just a graph.",
        },
      ],
    };
  }

  if (activeSimulation.id === "spring-mass-lab") {
    const x = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "x", 0), 0);
    const amplitude = Math.max(Math.abs(x), 0.2);
    const massX = 290 + x * 72;
    const springPoints = Array.from({ length: 9 }, (_, index) => {
      const t = index / 8;
      const px = 70 + t * (massX - 100);
      const py = 170 + (index % 2 === 0 ? -22 : 22);
      return `${px},${index === 0 || index === 8 ? 170 : py}`;
    }).join(" ");

    return {
      title: "Spring-mass scene",
      width: 520,
      height: 320,
      shapes: [
        { type: "rect", x: 0, y: 0, width: 520, height: 320, fill: C.surface3 },
        ...(!hasAuthoredScene ? [
          { type: "rect", x: 45, y: 120, width: 18, height: 100, rx: 4, fill: C.border },
          { type: "line", x1: 63, y1: 170, x2: 100, y2: 170, stroke: C.border, strokeWidth: 4 },
          {
            type: "polyline",
            points: springPoints,
            fill: "none",
            stroke: C.teal,
            strokeWidth: 5,
            strokeLinejoin: "round",
            strokeLinecap: "round",
          },
          { type: "rect", x: massX, y: 132, width: 86, height: 76, rx: 18, fill: C.blue, opacity: 0.92 },
          { type: "rect", x: massX, y: 132, width: 86, height: 76, rx: 18, fill: "none", stroke: C.surface, strokeWidth: 2, opacity: 0.3 },
        ] : []),
        { type: "line", x1: 36, y1: 246, x2: 484, y2: 246, stroke: C.border, strokeWidth: 2 },
        { type: "text", x: 28, y: 34, fill: C.muted, fontSize: 14, text: `Mass displacement: ${amplitude.toFixed(3)}` },
        {
          type: "text",
          x: 28,
          y: 56,
          fill: C.hint,
          fontSize: 12,
          text: hasAuthoredScene
            ? "Editable spring-mass scene active. Select the wall, spring, or mass to modify or replace it."
            : "The center viewport is becoming a model scene instead of just a plot target.",
        },
      ],
    };
  }

  if (activeSimulation.id === "projectile-lab") {
    const xs = getWorkspaceItemValue(workspaceItems, "x", []);
    const ys = getWorkspaceItemValue(workspaceItems, "y", []);
    const px = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "px", 0), 0);
    const py = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "py", 0), 0);
    const width = 520;
    const height = 320;
    const path = buildPolylinePath(xs, ys, width, height, 34);
    const xMax = Math.max(...(Array.isArray(xs) ? xs.map((value) => Number(value)).filter(Number.isFinite) : [1]), 1);
    const yMax = Math.max(...(Array.isArray(ys) ? ys.map((value) => Number(value)).filter(Number.isFinite) : [1]), 1);
    const markerX = 34 + (px / xMax) * (width - 68);
    const markerY = height - 34 - (Math.max(py, 0) / yMax) * (height - 68);

    return {
      title: "Projectile scene",
      width,
      height,
      shapes: [
        { type: "rect", x: 0, y: 0, width, height, fill: C.surface3 },
        ...(!hasAuthoredScene ? [
          { type: "line", x1: 28, y1: height - 34, x2: width - 24, y2: height - 34, stroke: C.border, strokeWidth: 2 },
          { type: "line", x1: 34, y1: height - 28, x2: 34, y2: 30, stroke: C.border, strokeWidth: 2 },
        ] : []),
        ...(path ? [{ type: "path", d: path, fill: "none", stroke: C.teal, strokeWidth: 5, strokeLinecap: "round" }] : []),
        ...(!hasAuthoredScene ? [
          { type: "circle", cx: markerX, cy: markerY, r: 10, fill: C.blue },
          { type: "circle", cx: markerX, cy: markerY, r: 18, fill: C.blue, opacity: 0.16 },
        ] : []),
        { type: "text", x: 28, y: 34, fill: C.muted, fontSize: 14, text: "Trajectory viewport with live projectile marker" },
        {
          type: "text",
          x: 28,
          y: 56,
          fill: C.hint,
          fontSize: 12,
          text: hasAuthoredScene
            ? "Editable projectile scene active. Select the projectile or ground, then modify, mate, or replace it."
            : "The graph still matters, but the center panel should read as a simulation scene first.",
        },
      ],
    };
  }

  if (activeSimulation.id === "merchant-lab") {
    const Fc = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "Fc", 180), 180);
    const Ft = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "Ft", 90), 90);
    const R = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "R", Math.hypot(Fc, Ft)), Math.hypot(Fc, Ft));
    const scale = 0.65;
    const originX = 170;
    const originY = 190;
    const radius = Math.max(R * scale, 12);

    return {
      title: "Merchant cutting-force scene",
      width: 520,
      height: 320,
      shapes: [
        { type: "rect", x: 0, y: 0, width: 520, height: 320, fill: C.surface3 },
        { type: "circle", cx: originX, cy: originY, r: radius, fill: "none", stroke: C.border, strokeWidth: 2, opacity: 0.8 },
        ...(!hasAuthoredScene ? [
          { type: "polygon", points: "90,90 158,90 122,152", fill: C.border, stroke: C.blue, strokeWidth: 2, fillOpacity: 0.2 },
          { type: "polygon", points: "158,88 230,66 246,96 176,116", fill: C.teal, stroke: C.teal, strokeWidth: 2, fillOpacity: 0.16 },
        ] : []),
        { type: "text", x: 28, y: 34, fill: C.muted, fontSize: 14, text: "Merchant circle and cutting-force decomposition" },
        {
          type: "text",
          x: 28,
          y: 56,
          fill: C.hint,
          fontSize: 12,
          text: hasAuthoredScene
            ? "Editable cutting-force scene active. Select tool, chip, or force vectors and modify them directly."
            : "Useful for cutting mechanics, tool loads, and the bridge toward machining simulations.",
        },
      ],
    };
  }

  if (activeSimulation.id === "beam-lab") {
    const xs = getWorkspaceItemValue(workspaceItems, "x", []);
    const ys = getWorkspaceItemValue(workspaceItems, "y", []);
    const F = Math.max(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "F", 320), 320), 0);
    const delta = Math.abs(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "delta", 0.01), 0.01));
    const sigma = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "sigma", 0), 0);
    const strain = toFiniteNumber(getWorkspaceItemValue(workspaceItems, "strain", 0), 0);
    const width = 520;
    const height = 320;
    const path = buildPolylinePath(xs, ys, width - 120, 120, 0);
    const beamPath = path ? offsetPath(path, 94, 112) : null;
    const tipX = 430;
    const tipY = 156 + Math.min(80, Math.max(6, delta * 3200));

    return {
      title: "Beam / cantilever scene",
      width,
      height,
      shapes: [
        { type: "rect", x: 0, y: 0, width, height, fill: C.surface3 },
        ...(!authoredElements.length ? [
          { type: "rect", x: 48, y: 108, width: 28, height: 116, rx: 4, fill: C.border },
          { type: "support", x: 90, y: 156, size: 18, fill: C.amber },
          { type: "line", x1: 74, y1: 156, x2: 430, y2: 156, stroke: C.border, strokeWidth: 2, strokeDasharray: "8 8" },
          ...(beamPath ? [{ type: "path", d: beamPath, fill: "none", stroke: C.blue, strokeWidth: 6, strokeLinecap: "round" }] : []),
          { type: "line", x1: tipX, y1: tipY - 46, x2: tipX, y2: tipY + 18, stroke: C.red, strokeWidth: 4 },
          { type: "polygon", points: `${tipX - 8},${tipY + 4} ${tipX + 8},${tipY + 4} ${tipX},${tipY + 20}`, fill: C.red, stroke: C.red, strokeWidth: 2 },
          { type: "line", x1: 90, y1: 250, x2: 430, y2: 250, stroke: C.hint, strokeWidth: 2 },
        ] : []),
        { type: "text", x: 28, y: 30, fill: C.muted, fontSize: 14, text: `Tip deflection: ${delta.toExponential(2)} m` },
        { type: "text", x: 28, y: 52, fill: C.hint, fontSize: 12, text: `Stress ${sigma.toExponential(2)} Pa • Strain ${strain.toExponential(2)}` },
        {
          type: "text",
          x: 28,
          y: 74,
          fill: C.hint,
          fontSize: 12,
          text: authoredElements.length
            ? "Editable scene active. Select a part, then use Mate or ScratchPad replacement."
            : "A first engineering workbench: support, member, load, section, and response.",
        },
        ...(!authoredElements.length ? [{ type: "text", x: tipX - 18, y: tipY - 54, fill: C.red, fontSize: 12, text: `F ${F.toFixed(0)} N` }] : []),
      ],
    };
  }

  if (activeSimulation.id === "chatter-lab") {
    const f_n = Math.abs(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "f_n", 480), 480));
    const toothHz = Math.abs(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "tooth_hz", 800), 800));
    const delta = Math.abs(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "delta", 0.0002), 0.0002));
    const ratio = Math.abs(toFiniteNumber(getWorkspaceItemValue(workspaceItems, "chatter_ratio", 1.2), 1.2));
    const tipX = 362;
    const baseY = 160;
    const tipY = baseY + Math.min(42, Math.max(2, delta * 18000));
    return {
      title: "Natural frequency / chatter scene",
      width: 520,
      height: 320,
      shapes: [
        { type: "rect", x: 0, y: 0, width: 520, height: 320, fill: C.surface3 },
        ...(!hasAuthoredScene ? [
          { type: "rect", x: 54, y: 102, width: 36, height: 104, rx: 8, fill: C.border },
          { type: "line", x1: 96, y1: baseY, x2: tipX, y2: tipY, stroke: C.blue, strokeWidth: 6, strokeLinecap: "round" },
          { type: "circle", cx: tipX, cy: tipY, r: 14, fill: C.teal, opacity: 0.92 },
          { type: "line", x1: 408, y1: 78, x2: 408, y2: 222, stroke: C.border, strokeWidth: 1.5, strokeDasharray: "6 6" },
          { type: "line", x1: 84, y1: 250, x2: 448, y2: 250, stroke: C.border, strokeWidth: 2 },
        ] : []),
        { type: "text", x: 28, y: 34, fill: C.muted, fontSize: 14, text: `Natural ${f_n.toFixed(0)} Hz • Tooth-pass ${toothHz.toFixed(0)} Hz` },
        { type: "text", x: 28, y: 56, fill: ratio > 0.85 && ratio < 1.15 ? C.red : C.hint, fontSize: 12, text: ratio > 0.85 && ratio < 1.15 ? "Warning: excitation is near the natural frequency band." : `Chatter ratio: ${ratio.toFixed(2)}` },
      ],
    };
  }

  return null;
}

function SimulationSceneRenderer({
  scene,
  C,
  showFigureNote = false,
  authoredElements = [],
  selectedElementId = "",
  selectedAttachmentId = "",
  mateSource = null,
  onSelectElement,
  onDoubleSelectElement,
  onSelectAttachment,
  onCompleteMate,
  onClearSelection,
  onDragAttachment,
}) {
  if (!scene) return null;
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const panRef = useRef(null);

  const screenToWorld = useCallback((clientX, clientY) => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = point.matrixTransform(ctm.inverse());
    return {
      x: (local.x - camera.x) / camera.scale,
      y: (local.y - camera.y) / camera.scale,
    };
  }, [camera]);

  useEffect(() => {
    const handleMove = (event) => {
      if (dragRef.current && typeof onDragAttachment === "function") {
        const world = screenToWorld(event.clientX, event.clientY);
        if (!world) return;
        onDragAttachment(dragRef.current, world.x, world.y);
        return;
      }
      if (panRef.current) {
        const dx = event.clientX - panRef.current.x;
        const dy = event.clientY - panRef.current.y;
        panRef.current = { x: event.clientX, y: event.clientY };
        setCamera((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
      }
    };

    const handleUp = () => {
      dragRef.current = null;
      panRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [onDragAttachment, screenToWorld]);

  const renderShape = (shape, index) => {
    const { type, text, ...rest } = shape;
    if (type === "text") {
      return (
        <text key={`${type}-${index}`} {...rest}>
          {text}
        </text>
      );
    }
    if (type === "line") return <line key={`${type}-${index}`} {...rest} />;
    if (type === "circle") return <circle key={`${type}-${index}`} {...rest} />;
    if (type === "rect") return <rect key={`${type}-${index}`} {...rest} />;
    if (type === "path") return <path key={`${type}-${index}`} {...rest} />;
    if (type === "polyline") return <polyline key={`${type}-${index}`} {...rest} />;
    if (type === "polygon") return <polygon key={`${type}-${index}`} {...rest} />;
    return null;
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
            Model viewport
          </div>
          <div className="mt-1 text-sm font-semibold">{scene.title}</div>
        </div>
        {showFigureNote && scene.note && (
          <div className="text-[11px]" style={{ color: C.muted }}>
            {scene.note}
          </div>
        )}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${scene.width} ${scene.height}`}
        className="min-h-0 flex-1 rounded-2xl"
        style={{ background: C.surface3 }}
        onClick={() => onClearSelection?.()}
        onWheel={(event) => {
          event.preventDefault();
          const factor = event.deltaY < 0 ? 1.08 : 0.92;
          setCamera((current) => ({
            ...current,
            scale: Math.min(4, Math.max(0.35, current.scale * factor)),
          }));
        }}
        onMouseDown={(event) => {
          if (event.target === svgRef.current) {
            panRef.current = { x: event.clientX, y: event.clientY };
          }
        }}
      >
        {Array.isArray(scene.defs) && scene.defs.length > 0 && (
          <defs>
            {scene.defs.map((def, index) => {
              if (def.type === "linearGradient") {
                return (
                  <linearGradient key={`def-${index}`} id={def.id} x1={def.x1} x2={def.x2} y1={def.y1} y2={def.y2}>
                    {def.stops?.map((stop, stopIndex) => (
                      <stop
                        key={`stop-${stopIndex}`}
                        offset={stop.offset}
                        stopColor={stop.color}
                        stopOpacity={stop.opacity}
                      />
                    ))}
                  </linearGradient>
                );
              }
              return null;
            })}
          </defs>
        )}
        <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}>
          {scene.shapes.map(renderShape)}
          {authoredElements.map((element) =>
            renderAuthoredSimElement(element, C, element.id === selectedElementId, onSelectElement, onDoubleSelectElement),
          )}
          {authoredElements.flatMap((element) => {
            const isSelectedElement = element.id === selectedElementId;
            const isMateTargetElement = Boolean(mateSource) && element.id !== mateSource.elementId;
            if (!isSelectedElement && !isMateTargetElement) return [];
            return getSimElementAttachmentPoints(element).map((point) => {
              const active = point.id === selectedAttachmentId;
              const isMateSourcePoint = mateSource?.elementId === element.id && mateSource?.attachmentId === point.id;
              const isMateTargetPoint = Boolean(mateSource) && element.id !== mateSource.elementId;
              return (
                <g
                  key={point.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (isMateTargetPoint) {
                      onCompleteMate?.(element.id, point.id);
                      return;
                    }
                    onSelectAttachment?.(point.id);
                  }}
                  onMouseDown={(event) => {
                    if (isMateTargetPoint) return;
                    event.stopPropagation();
                    dragRef.current = point.id;
                    onSelectAttachment?.(point.id);
                  }}
                  style={{ cursor: isMateTargetPoint ? "copy" : "pointer" }}
                >
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isMateSourcePoint ? 8 : active ? 7 : 5}
                    fill={isMateSourcePoint ? C.teal : active ? C.amber : isMateTargetPoint ? C.surface2 : C.surface}
                    stroke={isMateSourcePoint ? C.text : active ? C.text : isMateTargetPoint ? C.teal : C.blue}
                    strokeWidth={2}
                  />
                </g>
              );
            });
          })}
        </g>
      </svg>
      <div className="mt-3 flex items-center justify-between gap-3 text-[11px]" style={{ color: C.muted }}>
        <span>Drag empty space to pan. Mouse wheel to zoom.</span>
        <button
          type="button"
          onClick={() => setCamera({ x: 0, y: 0, scale: 1 })}
          className="rounded-lg border px-2.5 py-1 font-semibold"
          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
        >
          Reset View
        </button>
      </div>
    </div>
  );
}

function OpenMatSimulationViewport({
  activeSimulation,
  workspaceItems,
  figureJson,
  surfaceConfig,
  plotKind,
  setPlotKind,
  C,
  openGrapher,
  authoredElements = [],
  selectedElementId = "",
  selectedAttachmentId = "",
  mateSource = null,
  onSelectElement,
  onDoubleSelectElement,
  onSelectAttachment,
  onCompleteMate,
  onClearSelection,
  onDragAttachment,
}) {
  if (plotKind === "3d" && surfaceConfig) {
    return (
      <div className="flex h-full min-h-[420px] flex-col">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs" style={{ color: C.muted }}>
          <div>Embedded 3D simulation viewport</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlotKind("2d")}
              className="rounded-lg border px-2.5 py-1.5 font-semibold"
              style={{ borderColor: C.border, background: C.surface2, color: C.text }}
            >
              Show 2D
            </button>
            <button
              type="button"
              onClick={() => openGrapher(surfaceConfig)}
              className="rounded-lg border px-2.5 py-1.5 font-semibold"
              style={{ borderColor: C.border, background: C.surface2, color: C.text }}
            >
              Open Separate 3D
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border" style={{ borderColor: C.border }}>
          <GlobalGrapher3D
            embedded
            isOpen
            launchConfig={surfaceConfig}
            onClose={() => setPlotKind("2d")}
            onSwitchTo2D={() => setPlotKind("2d")}
            onSwitchToJSX={() => openGrapher({ mode: "pro" })}
          />
        </div>
      </div>
    );
  }

  const scene = buildSimulationScene(activeSimulation, workspaceItems, C, authoredElements);
  if (scene) {
    return (
      <SimulationSceneRenderer
        scene={scene}
        C={C}
        showFigureNote={Boolean(figureJson)}
        authoredElements={authoredElements}
        selectedElementId={selectedElementId}
        selectedAttachmentId={selectedAttachmentId}
        mateSource={mateSource}
        onSelectElement={onSelectElement}
        onDoubleSelectElement={onDoubleSelectElement}
        onSelectAttachment={onSelectAttachment}
        onCompleteMate={onCompleteMate}
        onClearSelection={onClearSelection}
        onDragAttachment={onDragAttachment}
      />
    );
  }

  if (figureJson) {
    return (
      <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
        {renderOpenMatFigure(figureJson, C, 280)}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[420px] items-center justify-center rounded-2xl border p-8 text-center" style={{ borderColor: C.border, background: C.surface }}>
      <div>
        <div className="text-sm font-semibold">Simulation viewport ready</div>
        <div className="mt-2 text-xs leading-6" style={{ color: C.muted }}>
          Load a guided lab and run it to populate the model scene, controls, and result panels.
        </div>
      </div>
    </div>
  );
}

function OpenMatPlotWindow({ isOpen, onClose, figureJson, figureMeta, C }) {
  if (!isOpen || !figureJson) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/55 backdrop-blur-md">
      <div
        className="flex h-full w-full flex-col"
        style={{ background: C.pageBg }}
      >
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: C.border, background: C.surface }}
        >
          <div>
            <div className="text-sm font-semibold" style={{ color: C.text }}>
              OpenMAT Plot Window
            </div>
            <div className="text-xs" style={{ color: C.muted }}>
              Larger figure view for dense plots and subplot layouts.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-xs md:block" style={{ color: C.muted }}>
              Axis mode: {figureMeta.axisMode}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: C.border, background: C.surface2, color: C.text }}
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          <div
            className="min-h-full rounded-3xl border p-4 md:p-6"
            style={{ borderColor: C.border, background: C.surface }}
          >
            {renderOpenMatFigure(figureJson, C, 280)}
          </div>
        </div>
      </div>
      <OpenMatPlotWindow
        isOpen={isPlotWindowOpen}
        onClose={() => setIsPlotWindowOpen(false)}
        figureJson={displayFigureJson}
        figureMeta={figureMeta}
        C={C}
      />
    </div>
  );
}

function buildFigureFromPlotState(plotState) {
  if (plotState.series.length === 0) return null;

  const xs = plotState.series.flatMap((series) =>
    series.kind === "bar"
      ? series.values.map((_, index) => index)
      : series.x,
  );
  const ys = plotState.series.flatMap((series) =>
    series.kind === "bar" ? series.values : series.y,
  );

  let xmin = Math.min(...xs);
  let xmax = Math.max(...xs);
  let ymin = Math.min(...ys);
  let ymax = Math.max(...ys);

  if (!Number.isFinite(xmin)) xmin = -1;
  if (!Number.isFinite(xmax)) xmax = 1;
  if (!Number.isFinite(ymin)) ymin = -1;
  if (!Number.isFinite(ymax)) ymax = 1;
  if (xmin === xmax) {
    xmin -= 1;
    xmax += 1;
  }
  if (ymin === ymax) {
    ymin -= 1;
    ymax += 1;
  }

  const isTight = plotState.axisMode === "tight";
  const padX = (xmax - xmin) * (isTight ? 0.02 : 0.08);
  const padY = (ymax - ymin) * (isTight ? 0.02 : 0.15);
  const xBounds =
    plotState.xlim?.length === 2 ? plotState.xlim : [xmin - padX, xmax + padX];
  const yBounds =
    plotState.ylim?.length === 2 ? plotState.ylim : [ymin - padY, ymax + padY];
  const elements = [];

  if (plotState.grid) {
    elements.push({
      type: "grid",
      step: Math.max((xBounds[1] - xBounds[0]) / 8, 1e-6),
      color: "border",
    });
  }

  elements.push({ type: "axes", labels: true, ticks: true });

  plotState.series.forEach((series, index) => {
    const color = SERIES_COLORS[index % SERIES_COLORS.length];
    if (series.kind === "plot") {
      elements.push({
        type: "curve",
        xs: series.x,
        ys: series.y,
        color,
        width: 2.5,
        label: series.label || null,
      });
    } else if (series.kind === "area") {
      elements.push({
        type: "curve",
        xs: series.x,
        ys: series.y,
        color,
        width: 2.5,
        fill: true,
        fill_alpha: 0.18,
        label: series.label || null,
      });
    } else if (series.kind === "scatter") {
      elements.push({
        type: "scatter",
        xs: series.x,
        ys: series.y,
        color,
        radius: 4,
        labels: null,
      });
    } else if (series.kind === "stem") {
      series.x.forEach((x, stemIndex) => {
        elements.push({
          type: "line",
          start: [x, 0],
          end: [x, series.y[stemIndex]],
          color,
          width: 1.5,
        });
      });
      elements.push({
        type: "scatter",
        xs: series.x,
        ys: series.y,
        color,
        radius: 4,
        labels: null,
      });
    } else if (series.kind === "bar") {
      elements.push({
        type: "bars",
        labels: series.labels,
        values: series.values,
        color,
        alpha: 0.8,
      });
    }
  });

  if (plotState.xlabel) {
    elements.push({
      type: "text",
      pos: [(xmin + xmax) / 2, ymin - padY * 0.55],
      content: plotState.xlabel,
      color: "muted",
      size: 12,
    });
  }

  if (plotState.ylabel) {
    elements.push({
      type: "text",
      pos: [xmin - padX * 0.35, (ymin + ymax) / 2],
      content: plotState.ylabel,
      color: "muted",
      size: 12,
    });
  }

  return JSON.stringify({
    type: "opencalc_figure",
    title: plotState.title || "OpenMAT Plot",
    xmin: xBounds[0],
    xmax: xBounds[1],
    ymin: yBounds[0],
    ymax: yBounds[1],
    height: 340,
    axisMode: plotState.axisMode,
    elements,
  });
}

function makePlotState() {
  return { series: [], hold: false, title: "", xlabel: "", ylabel: "", legend: [], grid: true, xlim: null, ylim: null, axisMode: "auto" };
}

function createExecutionEngine(options = {}) {
  const extensions = options.extensions || [];
  const controlValues = options.controlValues || {};
  const parser = math.parser();
  const variables = new Set();
  const functionNames = new Set();
  const logs = [];
  let plot3DRequest = null;
  const controls = [];
  const controlSet = new Set();

  // Subplot state: null = single figure, otherwise grid layout
  const subplotState = { active: false, rows: 1, cols: 1, slots: [], current: 0 };

  const plotState = makePlotState();
  const initialWorkspace = Array.isArray(options.initialWorkspace) ? options.initialWorkspace : [];

  initialWorkspace.forEach((item) => {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    if (!name) return;
    parser.set(name, toPlain(item.value));
    variables.add(name);
  });

  const registerControl = (type, name, min, max, step = 1, defaultValue = null, meta = {}) => {
    const key = String(name);
    const lower = Number(min);
    const upper = Number(max);
    const safeMin = Number.isFinite(lower) ? lower : 0;
    const safeMax = Number.isFinite(upper) ? upper : safeMin + 1;
    const safeStep = Math.abs(Number(step)) || 1;
    const fallback = defaultValue == null ? safeMin : Number(defaultValue);
    const rawValue = Object.prototype.hasOwnProperty.call(controlValues, key)
      ? Number(controlValues[key])
      : fallback;
    const value = clampValue(
      Number.isFinite(rawValue) ? rawValue : fallback,
      Math.min(safeMin, safeMax),
      Math.max(safeMin, safeMax),
    );
    parser.set(key, value);
    variables.add(key);
    if (!controlSet.has(key)) {
      controls.push({
        name: key,
        type,
        min: Math.min(safeMin, safeMax),
        max: Math.max(safeMin, safeMax),
        step: safeStep,
        value,
        defaultValue: fallback,
        ...meta,
      });
      controlSet.add(key);
    }
    return value;
  };

  const clearPlots = () => {
    Object.assign(plotState, makePlotState());
  };

  const registerPlot = (kind, first, second) => {
    if (!plotState.hold) {
      clearPlots();
    }
    if (kind === "bar") {
      const values = normalizeVector(first);
      const labels =
        second && Array.isArray(second)
          ? second.map(String)
          : values.map((_, index) => String(index + 1));
      plotState.series.push({ kind, values, labels });
      return values;
    }

    const ySeries = second == null ? toColumnSeries(first) : toColumnSeries(second);
    const xBase =
      second == null
        ? ySeries[0].map((_, index) => index)
        : normalizeVector(first);
    const startIndex = plotState.series.length;

    ySeries.forEach((y, seriesIndex) => {
      const x = xBase.slice(0, y.length);
      plotState.series.push({
        kind,
        x,
        y,
        label: plotState.legend[startIndex + seriesIndex] || null,
      });
    });

    return ySeries.length === 1 ? ySeries[0] : ySeries;
  };

  registerElementwiseUnary(parser, [
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "sinh",
    "cosh",
    "tanh",
    "exp",
    "log",
    "log10",
    "sqrt",
    "abs",
    "sign",
    "floor",
    "ceil",
    "round",
    "conj",
    "re",
    "im",
  ]);
  parser.set("real", (value) =>
    isCollection(value) ? mapDeep(value, math.re) : math.re(value),
  );
  parser.set("imag", (value) =>
    isCollection(value) ? mapDeep(value, math.im) : math.im(value),
  );

  parser.set("mldivide", (A, b) => toPlain(math.lusolve(A, b)));
  parser.set("linspace", (a, b, n = 100) => buildLinspace(a, b, n));
  parser.set("logspace", (a, b, n = 50) => buildLogspace(a, b, n));
  parser.set("rand", (...shape) => {
    if (shape.length === 0) return Math.random();
    return makeRandomArray(shape.map(Number));
  });
  parser.set("eye", (n) => toPlain(math.identity(Number(n))));
  parser.set("meshgrid", (x, y) => meshgrid(x, y));
  parser.set("diff", (value) => diffArray(value));
  parser.set("cumsum", (value) =>
    cumulative(value, (acc, entry) => acc + entry, null),
  );
  parser.set("cumprod", (value) =>
    cumulative(value, (acc, entry) => acc * entry, null),
  );
  parser.set("dot", (a, b) => dotProduct(a, b));
  parser.set("cross", (a, b) => crossProduct(a, b));
  parser.set("polyfit", (x, y, degree) => polyfit(x, y, degree));
  parser.set("polyval", (coefficients, x) => polyval(coefficients, x));
  parser.set("size", (value, dim) => {
    const size = toPlain(math.size(value));
    return dim == null ? size : size[Number(dim) - 1];
  });
  parser.set("length", (value) => {
    const size = toPlain(math.size(value));
    return Math.max(...size, 0);
  });
  parser.set("numel", (value) => flattenNumbers(value).length);
  parser.set("who", () => Array.from(variables));
  parser.set("disp", (value) => {
    logs.push(formatValue(value));
    return value;
  });
  parser.set("help", () => {
    logs.push(HELP_TEXT);
    return HELP_TEXT;
  });
  parser.set("clc", () => {
    logs.length = 0;
    return null;
  });
  parser.set("clf", () => {
    clearPlots();
    return null;
  });
  parser.set("hold", (mode = "on") => {
    plotState.hold = String(mode).toLowerCase() === "on";
    return plotState.hold;
  });
  parser.set("grid", (mode = "on") => {
    plotState.grid = String(mode).toLowerCase() === "on";
    return plotState.grid;
  });
  parser.set("title", (text) => {
    plotState.title = String(text);
    return text;
  });
  parser.set("xlabel", (text) => {
    plotState.xlabel = String(text);
    return text;
  });
  parser.set("ylabel", (text) => {
    plotState.ylabel = String(text);
    return text;
  });
  parser.set("xlim", (min, max) => {
    if (max !== undefined) {
      plotState.xlim = [Number(min), Number(max)];
    } else {
      plotState.xlim = normalizeVector(min).slice(0, 2);
    }
    return plotState.xlim;
  });
  parser.set("ylim", (min, max) => {
    if (max !== undefined) {
      plotState.ylim = [Number(min), Number(max)];
    } else {
      plotState.ylim = normalizeVector(min).slice(0, 2);
    }
    return plotState.ylim;
  });
  parser.set("axis", (mode) => {
    if (typeof mode === "string") {
      const normalized = mode.toLowerCase();
      if (["equal", "tight", "auto"].includes(normalized)) {
        plotState.axisMode = normalized;
        if (normalized === "auto") {
          plotState.xlim = null;
          plotState.ylim = null;
        }
        return normalized;
      }
    }
    const bounds = normalizeVector(mode).slice(0, 4);
    if (bounds.length === 4) {
      plotState.xlim = bounds.slice(0, 2);
      plotState.ylim = bounds.slice(2, 4);
      plotState.axisMode = "manual";
      return bounds;
    }
    return plotState.axisMode;
  });
  parser.set("legend", (...labels) => {
    plotState.legend = labels.map(String);
    plotState.series.forEach((series, index) => {
      series.label = plotState.legend[index] || series.label;
    });
    return labels;
  });
  parser.set("plot", (...args) => registerPlot("plot", args[0], args[1]));
  parser.set("scatter", (...args) => registerPlot("scatter", args[0], args[1]));
  parser.set("stem", (...args) => registerPlot("stem", args[0], args[1]));
  parser.set("area", (...args) => registerPlot("area", args[0], args[1]));
  parser.set("bar", (...args) =>
    args.length === 1
      ? registerPlot("bar", args[0], null)
      : registerPlot("bar", args[1], normalizeVector(args[0]).map(String)),
  );
  parser.set("eig", (A) => {
    const result = math.eigs(A);
    const values = normalizeVector(result.values);
    const vectors = result.eigenvectors.map((entry) => toPlain(entry.vector));
    return {
      __multi: [math.transpose(vectors), makeDiagonal(values)],
      values,
      eigenvectors: vectors,
    };
  });
  parser.set("qr", (A) => {
    const { Q, R } = math.qr(A);
    return { __multi: [toPlain(Q), toPlain(R)], Q: toPlain(Q), R: toPlain(R) };
  });
  parser.set("svd", (A) => svdDecomp(A));
  parser.set("trapz", (x, y = null) => trapzArray(x, y));
  parser.set("gradient", (value, spacing = 1) => gradientArray(value, spacing));
  parser.set("roots", (coefficients) => companionRoots(coefficients));
  parser.set("rank", (A, tolerance = null) => matrixRank(A, tolerance));
  parser.set("cond", (A) => conditionNumber(A));
  parser.set("orth", (A) => orthonormalBasis(A, "orth"));
  parser.set("null", (A) => orthonormalBasis(A, "null"));
  parser.set("surf", (...args) => {
    plot3DRequest = convertSurfaceTo3DConfig("surf", args, plotState);
    logs.push("3D surface ready. Opened in 3D Grapher.");
    return args[args.length - 1] ?? null;
  });
  parser.set("mesh", (...args) => {
    plot3DRequest = convertSurfaceTo3DConfig("mesh", args, plotState);
    logs.push("3D mesh ready. Opened in 3D Grapher.");
    return args[args.length - 1] ?? null;
  });
  parser.set("slider", (name, min, max, step = 1, defaultValue = null) =>
    registerControl("slider", name, min, max, step, defaultValue),
  );
  parser.set(
    "animate",
    (name, min, max, step = 1, defaultValue = null, speed = 1, loop = 1) =>
      registerControl("animate", name, min, max, step, defaultValue, {
        speed: Math.abs(Number(speed)) || 1,
        loop: Boolean(Number(loop)),
      }),
  );
  parser.set("whos", () => buildWorkspaceSnapshot(parser, variables));

  // ── Subplot ──
  parser.set("subplot", (rows, cols, idx) => {
    const r = Number(rows), c = Number(cols), i = Number(idx);
    if (!subplotState.active || subplotState.rows !== r || subplotState.cols !== c) {
      // Save any current plotState before switching
      if (subplotState.active && subplotState.current > 0) {
        subplotState.slots[subplotState.current - 1] = { ...makePlotState(), ...plotState, series: [...plotState.series] };
      }
      subplotState.active = true;
      subplotState.rows = r;
      subplotState.cols = c;
      subplotState.slots = Array.from({ length: r * c }, () => null);
    } else if (subplotState.current > 0) {
      // Save the current panel before moving to next
      subplotState.slots[subplotState.current - 1] = { ...makePlotState(), ...plotState, series: [...plotState.series] };
    }
    subplotState.current = i;
    // Reset plotState for the new panel
    Object.assign(plotState, makePlotState());
    return null;
  });

  // ── Statistics ──
  parser.set("mean", (v) => statMean(v));
  parser.set("median", (v) => statMedian(v));
  parser.set("std", (v, flag = 0) => statStd(v, Number(flag)));
  parser.set("var", (v, flag = 0) => statVar(v, Number(flag)));
  parser.set("min", (v) => statMin(v));
  parser.set("max", (v) => statMax(v));
  parser.set("sum", (v) => statSum(v));
  parser.set("prod", (v) => statProd(v));
  parser.set("sort", (v, dir = 'ascend') => statSort(v, String(dir)));
  parser.set("unique", (v) => statUnique(v));
  parser.set("any", (v) => statAny(v));
  parser.set("all", (v) => statAll(v));
  parser.set("find", (v) => statFind(v));
  parser.set("mod", (a, b) => statMod(a, b));
  parser.set("rem", (a, b) => statRem(a, b));
  parser.set("fix", (v) => statFix(v));
  parser.set("reshape", (v, r, c) => reshapeArray(v, r, c));
  parser.set("repmat", (v, m, n) => repmatArray(v, m, n));
  parser.set("hist", (v, bins = 10) => {
    const h = histArray(v, bins);
    registerPlot('bar', h.__histData.counts, h.__histData.centers.map(x => x.toFixed(2)));
    return h.__histData.counts;
  });
  parser.set("interp1", (x, y, xi) => interp1Array(x, y, xi));
  parser.set("sprintf", (fmt, ...args) => sprintfFormat(fmt, ...args));
  parser.set("fprintf", (fmt, ...args) => { logs.push(sprintfFormat(fmt, ...args)); return null; });
  parser.set("num2str", (v, fmt) => fmt ? sprintfFormat(`%${fmt}f`, v) : String(Number(v)));
  parser.set("str2num", (s) => Number(s));
  parser.set("isempty", (v) => (normalizeVector(v).length === 0 ? 1 : 0));
  parser.set("zeros", (m, n = null) => {
    const r = Number(m), c = n == null ? r : Number(n);
    if (r === 1) return Array(c).fill(0); // row vector → flat
    return Array.from({ length: r }, () => Array(c).fill(0));
  });
  parser.set("ones", (m, n = null) => {
    const r = Number(m), c = n == null ? r : Number(n);
    if (r === 1) return Array(c).fill(1); // row vector → flat
    return Array.from({ length: r }, () => Array(c).fill(1));
  });
  // randnormal via Box-Muller
  parser.set("randn", (...shape) => {
    const bm = () => {
      const u = 1 - Math.random(), v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    if (shape.length === 0) return bm();
    return makeRandomArray(shape.map(Number)).map ? (() => {
      function fill(arr) { return Array.isArray(arr) ? arr.map(fill) : bm(); }
      return fill(makeRandomArray(shape.map(Number)));
    })() : bm();
  });

  extensions.forEach((extension) => {
    Object.entries(extension?.functions || {}).forEach(([name, fn]) => {
      if (typeof fn !== "function") return;
      parser.set(name, (...args) =>
        toPlain(fn(...args, {
          math,
          parser,
          variables,
          logs,
          plotState,
          setPlot3DRequest: (config) => {
            plot3DRequest = config;
          },
        })),
      );
      functionNames.add(name);
    });
  });

  return {
    parser,
    logs,
    plotState,
    subplotState,
    variables,
    functionNames,
    getPlot3DRequest() {
      return plot3DRequest;
    },
    getControls() {
      return controls;
    },
    clearVariables(names) {
      if (names.length === 0) {
        Array.from(variables).forEach((name) => parser.remove(name));
        variables.clear();
        return;
      }
      names.forEach((name) => {
        parser.remove(name);
        variables.delete(name);
      });
    },
  };
}

// Signals for non-local flow inside block interpreter
const BREAK = Symbol('break');
const CONTINUE = Symbol('continue');
const RETURN = Symbol('return');

function executeScript(source, options = {}) {
  const extensions = options.extensions || [];
  const engine = createExecutionEngine({
    extensions,
    controlValues: options.controlValues || {},
    initialWorkspace: options.initialWorkspace || [],
  });
  const { parser, logs, plotState, subplotState, variables, functionNames } = engine;

  // User-defined functions registry: name -> { ins, outs, body }
  const userFunctions = {};

  function isTruthy(val) {
    if (val == null) return false;
    if (typeof val === 'number') return val !== 0;
    if (typeof val === 'boolean') return val;
    if (Array.isArray(val)) return val.flat(Infinity).some((x) => x !== 0 && x != null);
    return Boolean(val);
  }

  function executeLine(rawLine) {
    const trimmedRaw = rawLine.replace(/%.*$/, '').trim();
    if (!trimmedRaw) return null;

    const hasSemicolon = /;\s*$/.test(trimmedRaw);
    const withoutSemicolon = trimmedRaw.replace(/;\s*$/, '');

    if (/^clear(\s+.+)?$/i.test(withoutSemicolon)) {
      const args = withoutSemicolon.replace(/^clear/i, '').trim().split(/\s+/).filter(Boolean);
      engine.clearVariables(args);
      return null;
    }

    const line = preprocessLine(withoutSemicolon, variables, functionNames);
    if (!line) return null;

    const anonymousAssign = withoutSemicolon.match(/^([A-Za-z_]\w*)\s*=\s*@\(([^)]*)\)\s*(.+)$/);
    if (anonymousAssign) {
      const [, name, paramsRaw, bodyRaw] = anonymousAssign;
      const params = paramsRaw.split(",").map((entry) => entry.trim()).filter(Boolean);
      const body = preprocessLine(bodyRaw, variables, functionNames);
      const anonymousFn = (...args) => {
        const saved = new Map();
        params.forEach((param, index) => {
          try {
            saved.set(param, parser.get(param));
          } catch {
            saved.set(param, undefined);
          }
          parser.set(param, args[index] ?? null);
        });
        const result = toPlain(parser.evaluate(body));
        params.forEach((param) => {
          if (saved.get(param) === undefined) parser.remove(param);
          else parser.set(param, saved.get(param));
        });
        return result;
      };
      parser.set(name, anonymousFn);
      variables.add(name);
      functionNames.add(name);
      return hasSemicolon ? null : anonymousFn;
    }

    const multiAssign = line.match(/^\[([^\]]+)\]\s*=\s*(.+)$/);
    if (multiAssign) {
      const names = multiAssign[1].split(',').map((n) => n.trim()).filter(Boolean);
      const result = toPlain(parser.evaluate(preprocessLine(multiAssign[2], variables, functionNames)));
      const values = result?.__multi || [];
      names.forEach((name, idx) => {
        parser.set(name, values[idx]);
        variables.add(name);
      });
      return hasSemicolon ? null : (values.length === 1 ? values[0] : values);
    }

    // Indexed assignment: name[i] = expr  (result of replaceIndexing on name(i) = expr)
    const indexedAssign = line.match(/^([A-Za-z_]\w*)\[([^\]]+)\]\s*=\s*(.+)$/);
    if (indexedAssign) {
      const [, name, idxExpr, valExpr] = indexedAssign;
      const arr = parser.get(name);
      const idx = Number(toPlain(parser.evaluate(idxExpr)));
      const val = toPlain(parser.evaluate(valExpr));
      const updated = Array.isArray(arr) ? [...arr] : arr;
      if (Array.isArray(updated)) {
        updated[idx - 1] = val; // 1-based
      }
      parser.set(name, updated);
      variables.add(name);
      return hasSemicolon ? null : updated;
    }

    const assign = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (assign) {
      const [, name, expr] = assign;
      const result = toPlain(parser.evaluate(expr));
      parser.set(name, result);
      parser.set('ans', result);
      variables.add(name);
      return hasSemicolon ? null : result;
    }

    const result = toPlain(parser.evaluate(line));
    parser.set('ans', result);
    return (hasSemicolon || result == null || result === '') ? null : result;
  }

  function executeBlock(nodes) {
    let last = null;
    for (const node of nodes) {
      const sig = executeNode(node);
      if (sig === BREAK || sig === CONTINUE || sig === RETURN) return sig;
      if (sig != null && sig !== BREAK && sig !== CONTINUE && sig !== RETURN) last = sig;
    }
    return last;
  }

  function executeNode(node) {
    if (node.type === 'line') {
      return executeLine(node.raw);
    }

    if (node.type === 'if') {
      for (const branch of node.branches) {
        const condExpr = preprocessLine(branch.cond.replace(/;\s*$/, ''), variables, functionNames);
        const condVal = toPlain(parser.evaluate(condExpr));
        if (isTruthy(condVal)) {
          return executeBlock(branch.body);
        }
      }
      if (node.elseBody) return executeBlock(node.elseBody);
      return null;
    }

    if (node.type === 'for') {
      const iterExpr = preprocessLine(node.iterExpr.replace(/;\s*$/, ''), variables, functionNames);
      const iterVal = toPlain(parser.evaluate(iterExpr));
      const items = Array.isArray(iterVal) ? normalizeVector(iterVal) : [realValue(iterVal)];
      let last = null;
      for (const item of items) {
        parser.set(node.varName, item);
        variables.add(node.varName);
        const sig = executeBlock(node.body);
        if (sig === BREAK) break;
        if (sig === RETURN) return sig;
        if (sig !== CONTINUE && sig != null) last = sig;
      }
      return last;
    }

    if (node.type === 'while') {
      let last = null;
      let guard = 0;
      while (guard++ < 100000) {
        const condExpr = preprocessLine(node.condExpr.replace(/;\s*$/, ''), variables, functionNames);
        const condVal = toPlain(parser.evaluate(condExpr));
        if (!isTruthy(condVal)) break;
        const sig = executeBlock(node.body);
        if (sig === BREAK) break;
        if (sig === RETURN) return sig;
        if (sig !== CONTINUE && sig != null) last = sig;
      }
      return last;
    }

    if (node.type === 'function') {
      // Register user function — called later when invoked
      const { name, ins, outs, body } = node;
      userFunctions[name] = { ins, outs, body };
      parser.set(name, (...args) => {
        // Create a scoped parser by saving/restoring variables
        const saved = {};
        ins.forEach((param, i) => { saved[param] = parser.get(param); parser.set(param, args[i] ?? null); });
        outs.forEach((o) => { saved[o] = parser.get(o); });
        executeBlock(body);
        const result = outs.length === 1
          ? parser.get(outs[0])
          : outs.length > 1 ? { __multi: outs.map((o) => parser.get(o)) } : null;
        // Restore outer scope
        Object.entries(saved).forEach(([k, v]) => v == null ? null : parser.set(k, v));
        return result;
      });
      functionNames.add(name);
      return null;
    }

    if (node.type === 'break') return BREAK;
    if (node.type === 'continue') return CONTINUE;
    if (node.type === 'return') return RETURN;
    return null;
  }

  const lines = source.split(/\r?\n/);
  const tree = parseBlocks(lines);
  let lastVisibleResult = null;

  for (const node of tree) {
    const result = executeNode(node);
    if (result != null && result !== BREAK && result !== CONTINUE && result !== RETURN) {
      lastVisibleResult = result;
    }
  }

  // Flush last subplot panel if active
  let figureJson;
  if (subplotState.active) {
    if (subplotState.current > 0) {
      subplotState.slots[subplotState.current - 1] = { ...makePlotState(), ...plotState, series: [...plotState.series] };
    }
    const panels = subplotState.slots.map((slot) =>
      slot && slot.series.length > 0 ? buildFigureFromPlotState(slot) : null
    );
    figureJson = JSON.stringify({
      type: 'opencalc_subplots',
      rows: subplotState.rows,
      cols: subplotState.cols,
      panels,
    });
  } else {
    figureJson = buildFigureFromPlotState(plotState);
  }

  const outputBlocks = [];
  if (logs.length) outputBlocks.push(logs.filter(Boolean).join('\n'));
  if (lastVisibleResult != null && lastVisibleResult !== '') {
    outputBlocks.push(formatValue(lastVisibleResult));
  }

  const result = {
    output: outputBlocks.filter(Boolean).join('\n\n') || (figureJson ? 'Plot rendered.' : 'No output.'),
    figureJson,
    workspace: buildWorkspaceSnapshot(parser, variables),
    plot3DRequest: engine.getPlot3DRequest(),
    controls: engine.getControls(),
  };
  extensions.forEach((extension) => {
    if (typeof extension?.onRun === "function") {
      try {
        extension.onRun(result, { parser, variables, logs, plotState, subplotState });
      } catch {
        // Keep the core run resilient even if an extension hook fails.
      }
    }
  });
  return result;
}

export default function OpenMatStudio() {
  const navigate = useNavigate();
  const C = useColors();
  const { openGrapher } = useGrapher();
  const [documents, setDocuments] = useLocalStorage("openmat-documents", getInitialOpenMatDocuments());
  const [activeDocumentId, setActiveDocumentId] = useLocalStorage(
    "openmat-active-document-id",
    getInitialActiveDocumentId(getInitialOpenMatDocuments()),
  );
  const [rightPaneWidth, setRightPaneWidth] = useLocalStorage("openmat-right-pane-width", 390);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [figureJson, setFigureJson] = useState(null);
  const [baseFigureJson, setBaseFigureJson] = useState(null);
  const [isPlotWindowOpen, setIsPlotWindowOpen] = useState(false);
  const [plotPanelMode, setPlotPanelMode] = useLocalStorage("openmat-plot-panel-mode", "pane");
  const [surfaceConfig, setSurfaceConfig] = useState(null);
  const [plotKind, setPlotKind] = useState("2d");
  const [controlSpecs, setControlSpecs] = useState([]);
  const [controlValues, setControlValues] = useLocalStorage("openmat-control-values", {});
  const [controlPlayback, setControlPlayback] = useLocalStorage("openmat-control-playback", {});
  const [recoverySnapshot, setRecoverySnapshot] = useLocalStorage("openmat-recovery-snapshot", null);
  const [normalizedPreview, setNormalizedPreview] = useState("");
  const [workspaceItems, setWorkspaceItems] = useState([]);
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useLocalStorage("openmat-workspace-tab", "plot");
  const [browserTab, setBrowserTab] = useLocalStorage("openmat-browser-tab", "examples");
  const [workspaceMode, setWorkspaceMode] = useLocalStorage("openmat-workspace-mode", "script");
  const [activeSimulationId, setActiveSimulationId] = useLocalStorage("openmat-active-simulation", "pendulum-lab");
  const [simBridgeTab, setSimBridgeTab] = useLocalStorage("openmat-sim-bridge-tab", "script");
  const [simLeftTab, setSimLeftTab] = useLocalStorage("openmat-sim-left-tab", "models");
  const [simRightTab, setSimRightTab] = useLocalStorage("openmat-sim-right-tab", "params");
  const [simEditorWidth, setSimEditorWidth] = useLocalStorage("openmat-sim-editor-width", 40);
  const [simGeometryStore, setSimGeometryStore] = useLocalStorage("openmat-sim-geometry-store", {});
  const [simConstraintStore, setSimConstraintStore] = useLocalStorage("openmat-sim-constraint-store", {});
  const [workbenchLessonProgress, setWorkbenchLessonProgress] = useLocalStorage("openmat-workbench-lesson-progress", {});
  const [interactiveTour, setInteractiveTour] = useLocalStorage("openmat-interactive-tour", {
    active: false,
    id: "",
    stepIndex: 0,
    lastAction: "",
  });
  const [commandHistory, setCommandHistory] = useLocalStorage("openmat-command-history", []);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isResizingRightPane, setIsResizingRightPane] = useState(false);
  const [isResizingSimCenter, setIsResizingSimCenter] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);
  const [lastConsoleCommand, setLastConsoleCommand] = useState("");
  const [selectedSimElementId, setSelectedSimElementId] = useState("");
  const [selectedAttachmentId, setSelectedAttachmentId] = useState("");
  const [pendingMateSource, setPendingMateSource] = useState(null);
  const outputRef = useRef(null);
  const consoleInputRef = useRef(null);
  const importRef = useRef(null);
  const shellRef = useRef(null);
  const stateRef = useRef({});
  const controlValuesRef = useRef(controlValues);
  const monacoRef = useRef(null);
  const pendingAutoRunDocumentIdRef = useRef(null);

  const activeDocument = useMemo(
    () => documents.find((doc) => doc.id === activeDocumentId) || documents[0] || null,
    [activeDocumentId, documents],
  );
  const code = activeDocument?.code ?? "";

  useEffect(() => {
    controlValuesRef.current = controlValues;
  }, [controlValues]);

  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(C.isDark ? "openmat-dark" : "openmat-light");
  }, [C.isDark]);

  useEffect(() => {
    if (!documents.length) {
      const fallback = createOpenMatDocument("untitled.m", DEFAULT_CODE);
      setDocuments([fallback]);
      setActiveDocumentId(fallback.id);
      return;
    }
    if (!documents.some((doc) => doc.id === activeDocumentId)) {
      setActiveDocumentId(documents[0].id);
    }
  }, [activeDocumentId, documents, setActiveDocumentId, setDocuments]);

  const exampleMap = useMemo(
    () => Object.fromEntries(EXAMPLES.map((example) => [example.id, example])),
    [],
  );
  const simulationMap = useMemo(
    () => Object.fromEntries(SIMULATION_WORKSPACES.map((workspace) => [workspace.id, workspace])),
    [],
  );
  const activeSimulation = simulationMap[activeSimulationId] || SIMULATION_WORKSPACES[0];
  const activeSimulationTour = useMemo(
    () => Object.values(OPENMAT_INTERACTIVE_TOURS).find((tour) => tour.simulationId === activeSimulationId) || null,
    [activeSimulationId],
  );
  const activeInteractiveTour = interactiveTour?.id ? OPENMAT_INTERACTIVE_TOURS[interactiveTour.id] || null : null;
  const activeInteractiveTourStep = activeInteractiveTour?.steps?.[interactiveTour.stepIndex] || null;
  const interactiveTourProgressLabel = activeInteractiveTour
    ? `${Math.min((interactiveTour.stepIndex || 0) + 1, activeInteractiveTour.steps.length)} / ${activeInteractiveTour.steps.length}`
    : "";
  const activeInteractiveTourTarget = useMemo(() => {
    if (!interactiveTour?.active || !activeInteractiveTourStep) return "";
    switch (activeInteractiveTourStep.id) {
      case "run-workbench":
        return "tour-run";
      case "play-animation":
        return "tour-play";
      case "select-part":
        return "tour-viewport";
      case "edit-part":
        return "tour-params";
      case "reload-lab":
        return "tour-reload";
      default:
        return "";
    }
  }, [activeInteractiveTourStep, interactiveTour?.active]);
  const getInteractiveTourHighlight = useCallback((targetId) => {
    if (activeInteractiveTourTarget !== targetId) {
      return { className: "", style: {} };
    }
    return {
      className: "animate-pulse",
      style: {
        borderColor: C.blue,
        boxShadow: `0 0 0 2px rgba(99, 184, 255, 0.45), 0 0 28px rgba(99, 184, 255, 0.2)`,
      },
    };
  }, [C.blue, activeInteractiveTourTarget]);
  const interactiveTourOverlayPosition = useMemo(() => {
    switch (activeInteractiveTourTarget) {
      case "tour-run":
      case "tour-reload":
        return { left: 16, bottom: 16 };
      case "tour-play":
      case "tour-params":
        return { left: 16, top: 16 };
      case "tour-viewport":
        return { left: 16, top: 16 };
      default:
        return { right: 16, top: 16 };
    }
  }, [activeInteractiveTourTarget]);
  const activeLesson = activeSimulation?.lesson || null;
  const activeLessonStepIndex = Math.min(
    Math.max(Number(workbenchLessonProgress?.[activeSimulationId] ?? 0), 0),
    Math.max((activeLesson?.steps?.length || 1) - 1, 0),
  );
  const activeLessonStep = activeLesson?.steps?.[activeLessonStepIndex] || null;
  const authoredSimElements = useMemo(
    () => simGeometryStore[activeSimulationId] || [],
    [activeSimulationId, simGeometryStore],
  );
  const hasInitializedSimGeometry = useMemo(
    () => Object.prototype.hasOwnProperty.call(simGeometryStore || {}, activeSimulationId),
    [activeSimulationId, simGeometryStore],
  );
  const activeConstraints = useMemo(
    () => simConstraintStore[activeSimulationId] || [],
    [activeSimulationId, simConstraintStore],
  );
  const liveSimElements = useMemo(
    () => resolveLinkedSimulationElements(authoredSimElements, activeSimulation, workspaceItems, C),
    [C, activeSimulation, authoredSimElements, workspaceItems],
  );
  const hasCustomSpringMassAssembly = useMemo(
    () => activeSimulationId === "spring-mass-lab" && (
      activeConstraints.length > 0 ||
      liveSimElements.some((element) => element?.source?.kind !== "guided")
    ),
    [activeConstraints.length, activeSimulationId, liveSimElements],
  );
  const customSpringMassModel = useMemo(
    () => hasCustomSpringMassAssembly
      ? deriveConstraintDrivenSpringMassModel(liveSimElements, activeConstraints, workspaceItems)
      : { active: false, semantics: { fixed: [], springConnections: [], massBodies: [], drivenInputs: [] } },
    [activeConstraints, hasCustomSpringMassAssembly, liveSimElements, workspaceItems],
  );
  const displayedSimElements = useMemo(
    () => activeSimulationId === "spring-mass-lab"
      ? applyConstraintDrivenSpringMassPose(liveSimElements, customSpringMassModel)
      : liveSimElements,
    [activeSimulationId, customSpringMassModel, liveSimElements],
  );
  const generatedWorkspaceItems = useMemo(() => {
    if (!customSpringMassModel?.active) return [];
    return [
      makeWorkspaceItem("asm_k", Number(customSpringMassModel.k.toFixed(4))),
      makeWorkspaceItem("asm_m", Number(customSpringMassModel.m.toFixed(4))),
      makeWorkspaceItem("asm_c", Number(customSpringMassModel.c.toFixed(4))),
      makeWorkspaceItem("asm_omega_n", Number(customSpringMassModel.omegaN.toFixed(4))),
      makeWorkspaceItem("asm_zeta", Number(customSpringMassModel.dampingRatio.toFixed(4))),
      makeWorkspaceItem("asm_x", Number(customSpringMassModel.displacement.toFixed(6))),
    ];
  }, [customSpringMassModel]);
  const displayWorkspaceItems = useMemo(() => {
    if (!generatedWorkspaceItems.length) return workspaceItems;
    const reserved = new Set(generatedWorkspaceItems.map((item) => item.name));
    return [...workspaceItems.filter((item) => !reserved.has(item.name)), ...generatedWorkspaceItems];
  }, [generatedWorkspaceItems, workspaceItems]);
  const selectedSimElement = useMemo(
    () => displayedSimElements.find((element) => element.id === selectedSimElementId) || null,
    [displayedSimElements, selectedSimElementId],
  );
  const selectedSimElementPropertySchema = useMemo(
    () => getSimulationPropertySchema(selectedSimElement),
    [selectedSimElement],
  );
  const selectedSimElementSliderControls = useMemo(
    () => selectedSimElementPropertySchema
      .filter((item) => item.slider && item.type === "number")
      .map((item) => ({
        ...item,
        name: `${selectedSimElement?.name || getSimulationRoleMeta(selectedSimElement?.role).label} · ${item.label}`,
        value: Number(getSimulationPropertyValue(selectedSimElement, item.field) || 0),
      })),
    [selectedSimElement, selectedSimElementPropertySchema],
  );
  const selectedAttachment = useMemo(
    () => getSimElementAttachmentPoints(selectedSimElement).find((point) => point.id === selectedAttachmentId) || null,
    [selectedAttachmentId, selectedSimElement],
  );
  const derivedMechanicalModel = useMemo(
    () => deriveMechanicalModel(liveSimElements, activeConstraints),
    [activeConstraints, liveSimElements],
  );
  const displayFigureJson = useMemo(
    () => activeSimulationId === "spring-mass-lab" ? augmentSpringMassFigure(figureJson, customSpringMassModel, C) : figureJson,
    [C, activeSimulationId, customSpringMassModel, figureJson],
  );
  const runButtonHighlight = getInteractiveTourHighlight("tour-run");
  const reloadLabHighlight = getInteractiveTourHighlight("tour-reload");
  const viewportHighlight = getInteractiveTourHighlight("tour-viewport");
  const selectedControlsHighlight = getInteractiveTourHighlight("tour-params");
  const markInteractiveTourAction = useCallback((action) => {
    if (!action) return;
    setInteractiveTour((current) => {
      if (!current?.active) return current;
      return { ...current, lastAction: action };
    });
  }, [setInteractiveTour]);

  const closeInteractiveTour = useCallback(() => {
    setInteractiveTour({
      active: false,
      id: "",
      stepIndex: 0,
      lastAction: "",
    });
  }, [setInteractiveTour]);

  useEffect(() => {
    if (!interactiveTour?.active || !activeInteractiveTour || activeInteractiveTour.simulationId !== activeSimulationId) return;
    if (interactiveTour.stepIndex >= activeInteractiveTour.steps.length) return;
    const stepId = activeInteractiveTourStep?.id;
    let completed = false;
    if (stepId === "run-workbench") {
      completed = controlSpecs.length > 0 && workspaceItems.length > 0;
    } else if (stepId === "play-animation") {
      completed = controlSpecs.some((control) => control.type === "animate" && controlPlayback[control.name]?.playing);
    } else if (stepId === "select-part") {
      completed = Boolean(selectedSimElementId);
    } else if (stepId === "edit-part") {
      completed = interactiveTour.lastAction === "edit-part";
    } else if (stepId === "reload-lab") {
      completed = interactiveTour.lastAction === "reload-lab";
    }
    if (!completed) return;
    setInteractiveTour((current) => {
      if (!current?.active || current.id !== interactiveTour.id) return current;
      return {
        ...current,
        stepIndex: Math.min((current.stepIndex || 0) + 1, activeInteractiveTour.steps.length),
        lastAction: "",
      };
    });
  }, [
    activeInteractiveTour,
    activeInteractiveTourStep,
    activeSimulationId,
    controlPlayback,
    controlSpecs,
    interactiveTour,
    selectedSimElementId,
    setInteractiveTour,
    workspaceItems.length,
  ]);
  useEffect(() => {
    if (!interactiveTour?.active) return;
    if (activeInteractiveTourStep?.id !== "edit-part") return;
    if (simRightTab === "params") return;
    setSimRightTab("params");
  }, [activeInteractiveTourStep?.id, interactiveTour?.active, setSimRightTab, simRightTab]);
  const setActiveLessonStep = useCallback((nextIndex) => {
    setWorkbenchLessonProgress((current) => ({
      ...(current && typeof current === "object" ? current : {}),
      [activeSimulationId]: Math.max(0, Number(nextIndex) || 0),
    }));
  }, [activeSimulationId, setWorkbenchLessonProgress]);
  const simulationTreeItems = useMemo(() => ([
    {
      id: "model",
      title: "Model",
      detail: activeSimulation?.title || "Simulation model",
      lines: [
        "Shared OpenMAT session",
        surfaceConfig ? "3D surface attached" : "Scene viewport active",
        `${liveSimElements.length} authored element${liveSimElements.length === 1 ? "" : "s"}`,
        `${activeConstraints.length} assembly constraint${activeConstraints.length === 1 ? "" : "s"}`,
        `${derivedMechanicalModel.summary.bodyCount} bodies • ${derivedMechanicalModel.summary.springCount} springs`,
      ],
    },
    {
      id: "inputs",
      title: "Inputs",
      detail: `${controlSpecs.length} interactive parameter${controlSpecs.length === 1 ? "" : "s"}`,
      lines: controlSpecs.length
        ? controlSpecs.slice(0, 4).map((control) => `${control.name}: ${control.type}`)
        : ["Run the lab to populate control inputs"],
    },
    {
      id: "solver",
      title: "Solver",
      detail: "Local browser engine",
      lines: [
        "MATLAB-like preprocessing",
        "Numerics + plotting on the same run cycle",
      ],
    },
    {
      id: "results",
      title: "Results",
      detail: `${displayWorkspaceItems.length} workspace variable${displayWorkspaceItems.length === 1 ? "" : "s"}`,
      lines: displayWorkspaceItems.length
        ? displayWorkspaceItems.slice(0, 4).map((item) => `${item.name}: ${item.preview}`)
        : derivedMechanicalModel.workspace.length
          ? derivedMechanicalModel.workspace.slice(0, 4).map((item) => `${item.name}: ${item.value}`)
          : ["No results yet"],
    },
    {
      id: "bridge",
      title: "Bridge",
      detail: "Script + console workflow",
      lines: [
        "Use the lower bridge to edit code",
        "Promote console experiments back into the script",
      ],
    },
  ]), [activeConstraints.length, activeSimulation?.title, controlSpecs, derivedMechanicalModel, displayWorkspaceItems, liveSimElements.length, surfaceConfig]);

  useEffect(() => {
    if (!displayedSimElements.some((element) => element.id === selectedSimElementId)) {
      setSelectedSimElementId("");
      setSelectedAttachmentId("");
      setPendingMateSource(null);
    }
  }, [displayedSimElements, selectedSimElementId]);

  useEffect(() => {
    if (!displayWorkspaceItems.length) {
      setSelectedVariable(null);
      return;
    }
    setSelectedVariable((current) =>
      displayWorkspaceItems.find((item) => item.name === current?.name) || current || displayWorkspaceItems[0] || null,
    );
  }, [displayWorkspaceItems]);

  const updateSimulationElements = useCallback((updater) => {
    setSimGeometryStore((current) => {
      const currentItems = current[activeSimulationId] || [];
      const nextItems = updater(currentItems);
      if (nextItems === currentItems) {
        return current;
      }
      return { ...current, [activeSimulationId]: nextItems };
    });
  }, [activeSimulationId, setSimGeometryStore]);

  useEffect(() => {
    if (typeof window === "undefined" || workspaceMode !== "sim") return undefined;
    let lastRaw = window.localStorage.getItem("oc-pad-shapes") || "";
    const sync = () => {
      const nextRaw = window.localStorage.getItem("oc-pad-shapes") || "";
      if (nextRaw === lastRaw) return;
      lastRaw = nextRaw;
      try {
        const parsed = nextRaw ? JSON.parse(nextRaw) : [];
        if (!Array.isArray(parsed)) return;
        updateSimulationElements((items) =>
          items.map((element) => {
            const shapeId = element?.source?.kind === "scratch" && element?.source?.linked ? element.source.shapeId : null;
            if (!shapeId) return element;
            const shape = parsed.find((entry) => entry?.id === shapeId);
            return shape ? convertScratchShapeToSimElement(shape, element) : element;
          }),
        );
      } catch {
        // Ignore malformed scratch storage and leave the current scene intact.
      }
    };
    const interval = window.setInterval(sync, 1200);
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", sync);
    };
  }, [updateSimulationElements, workspaceMode]);

  useEffect(() => {
    if (workspaceMode !== "sim") return;
    if (hasInitializedSimGeometry) return;
    if (!workspaceItems.length) return;
    const guided = buildGuidedSceneElements(activeSimulation, workspaceItems, C);
    if (!guided.length) return;
    updateSimulationElements(() => guided);
  }, [C, activeSimulation, hasInitializedSimGeometry, updateSimulationElements, workspaceItems, workspaceMode]);

  useEffect(() => {
    if (workspaceMode !== "sim") return;
    if (!workspaceItems.length) return;
    const guided = buildGuidedSceneElements(activeSimulation, workspaceItems, C);
    if (!guided.length) return;
    const guidedById = new Map(guided.map((element) => [element.id, element]));
    updateSimulationElements((items) => {
      let changed = false;
      const nextItems = items.map((element) => {
        if (element?.source?.kind !== "guided" || !element?.source?.linked) return element;
        const nextGuided = guidedById.get(element.id);
        if (!nextGuided) return element;
        const merged = {
          ...nextGuided,
          name: element.name || nextGuided.name,
          role: element.role || nextGuided.role,
          source: element.source,
        };
        if (!simulationElementsEqual(element, merged)) {
          changed = true;
          return merged;
        }
        return element;
      });
      return changed ? nextItems : items;
    });
  }, [C, activeSimulation, updateSimulationElements, workspaceItems, workspaceMode]);

  const addSimulationElement = useCallback((type) => {
    const next = createSimElement(type);
    updateSimulationElements((items) => [...items, next]);
    setSelectedSimElementId(next.id);
    setSelectedAttachmentId("");
  }, [updateSimulationElements]);

  const updateSelectedSimulationElement = useCallback((field, value) => {
    if (!selectedSimElementId) return;
    const schemaField = selectedSimElementPropertySchema.find((item) => item.field === field);
    updateSimulationElements((items) =>
      items.map((element) => {
        if (element.id !== selectedSimElementId) return element;
        return { ...element, [field]: schemaField?.type === "number" ? Number(value) : value };
      }),
    );
    markInteractiveTourAction("edit-part");
  }, [markInteractiveTourAction, selectedSimElementId, selectedSimElementPropertySchema, updateSimulationElements]);

  const updateSelectedSimulationSliderValue = useCallback((field, nextValue, config) => {
    const min = Number(config?.min ?? nextValue);
    const max = Number(config?.max ?? nextValue);
    const step = Number(config?.step ?? 0);
    const clamped = clampValue(Number(nextValue), min, max);
    const snapped = step > 0
      ? Number((Math.round((clamped - min) / step) * step + min).toFixed(6))
      : clamped;
    updateSelectedSimulationElement(field, snapped);
  }, [updateSelectedSimulationElement]);

  const convertSelectedSimulationElement = useCallback((role) => {
    if (!selectedSimElementId) return;
    updateSimulationElements((items) =>
      items.map((element) => element.id === selectedSimElementId ? {
        ...element,
        role,
        name:
          role === "mass" ? "Mass" :
          role === "spring" ? "Spring" :
          role === "anchor" ? "Anchor" :
          role === "support" ? "Support" :
          role === "force" ? "Force" :
          "Rod",
      } : element),
    );
  }, [selectedSimElementId, updateSimulationElements]);

  const deleteSelectedSimulationElement = useCallback(() => {
    if (!selectedSimElementId) return;
    updateSimulationElements((items) => items.filter((element) => element.id !== selectedSimElementId));
    setSimConstraintStore((current) => {
      const nextConstraints = (current?.[activeSimulationId] || []).filter((constraint) =>
        constraint.sourceElementId !== selectedSimElementId && constraint.targetElementId !== selectedSimElementId,
      );
      if (nextConstraints.length === (current?.[activeSimulationId] || []).length) return current;
      return { ...(current && typeof current === "object" ? current : {}), [activeSimulationId]: nextConstraints };
    });
    setSelectedSimElementId("");
    setSelectedAttachmentId("");
  }, [activeSimulationId, selectedSimElementId, setSimConstraintStore, updateSimulationElements]);

  const createJointFromAttachment = useCallback(() => {
    if (!selectedAttachment) return;
    const next = {
      id: `sim-point-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "point",
      role: "anchor",
      name: `${selectedAttachment.label} Joint`,
      x: selectedAttachment.x,
      y: selectedAttachment.y,
      fill: C.amber,
    };
    updateSimulationElements((items) => [...items, next]);
    setSelectedSimElementId(next.id);
    setSelectedAttachmentId("");
  }, [C.amber, selectedAttachment, updateSimulationElements]);

  const beginMateFromSelectedAttachment = useCallback(() => {
    if (!selectedSimElementId || !selectedAttachmentId) return;
    setPendingMateSource({ elementId: selectedSimElementId, attachmentId: selectedAttachmentId });
  }, [selectedAttachmentId, selectedSimElementId]);

  const cancelPendingMate = useCallback(() => {
    setPendingMateSource(null);
  }, []);

  const completeMateToAttachment = useCallback((targetElementId, targetAttachmentId) => {
    if (!pendingMateSource || !targetElementId || !targetAttachmentId) return;
    if (pendingMateSource.elementId === targetElementId) return;
    updateSimulationElements((items) => {
      const sourceElement = items.find((element) => element.id === pendingMateSource.elementId);
      const targetElement = items.find((element) => element.id === targetElementId);
      if (!sourceElement || !targetElement) return items;
      const targetPoint = getSimElementAttachmentPoints(targetElement).find((point) => point.id === targetAttachmentId);
      if (!targetPoint) return items;
      return items.map((element) =>
        element.id === pendingMateSource.elementId
          ? updateElementFromAttachmentDrag(element, pendingMateSource.attachmentId, targetPoint.x, targetPoint.y)
          : element,
      );
    });
    setSelectedSimElementId(pendingMateSource.elementId);
    setSelectedAttachmentId("");
    setPendingMateSource(null);
    setSimRightTab("properties");
    const nextConstraint = createMateConstraint(
      pendingMateSource.elementId,
      pendingMateSource.attachmentId,
      targetElementId,
      targetAttachmentId,
    );
    setSimConstraintStore((current) => {
      const next = [...(current?.[activeSimulationId] || []).filter((constraint) =>
        !(
          constraint.type === "mate"
          && constraint.sourceElementId === nextConstraint.sourceElementId
          && constraint.sourceAttachmentId === nextConstraint.sourceAttachmentId
        )
      ), nextConstraint];
      return { ...(current && typeof current === "object" ? current : {}), [activeSimulationId]: next };
    });
  }, [activeSimulationId, pendingMateSource, setSimConstraintStore, updateSimulationElements]);

  const deleteConstraint = useCallback((constraintId) => {
    setSimConstraintStore((current) => {
      const nextConstraints = (current?.[activeSimulationId] || []).filter((constraint) => constraint.id !== constraintId);
      if (nextConstraints.length === (current?.[activeSimulationId] || []).length) return current;
      return { ...(current && typeof current === "object" ? current : {}), [activeSimulationId]: nextConstraints };
    });
  }, [activeSimulationId, setSimConstraintStore]);

  const openScratchGeometryTool = useCallback(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("oc-open-scratchpad", { detail: { mode: "geo", tool: "select" } }));
    setOutput("ScratchPad opened in Geo Select mode. Pick one shape, then click Send to OpenMAT.");
  }, []);

  const importScratchGeometry = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("oc-pad-shapes");
      const selectedShapeId = window.localStorage.getItem("oc-pad-selected-shape-id");
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed) || !parsed.length) {
        window.dispatchEvent(new CustomEvent("oc-open-scratchpad", { detail: { mode: "geo", tool: "select" } }));
        setOutput("No scratchpad geometry found yet. ScratchPad was opened so you can draw or select a shape.");
        return;
      }
      if (!selectedShapeId) {
        window.dispatchEvent(new CustomEvent("oc-open-scratchpad", { detail: { mode: "geo", tool: "select" } }));
        setOutput("No ScratchPad geometry is selected. ScratchPad was opened so you can select one shape in Geo mode, then import it here.");
        return;
      }
      const selectedShape = parsed.find((shape) => String(shape?.id) === String(selectedShapeId));
      if (!selectedShape) {
        window.dispatchEvent(new CustomEvent("oc-open-scratchpad", { detail: { mode: "geo", tool: "select" } }));
        setOutput("The selected ScratchPad shape was not found. ScratchPad was opened so you can re-select it and try again.");
        return;
      }
      let importedElement = convertScratchShapeToSimElement(selectedShape);
      if (!importedElement) {
        setOutput("The selected ScratchPad shape could not be converted into simulation geometry.");
        return;
      }
      const targetElement = selectedSimElementId
        ? authoredSimElements.find((element) => element.id === selectedSimElementId) || null
        : null;
      if (targetElement) {
        importedElement = alignSimulationElementToTarget(
          convertScratchShapeToSimElement(selectedShape, targetElement),
          targetElement,
        );
        updateSimulationElements((items) =>
          items.map((element) => (element.id === targetElement.id ? importedElement : element)),
        );
      } else {
        importedElement = centerSimulationElements([importedElement])[0];
        updateSimulationElements((items) => [...items, importedElement]);
      }
      setSelectedSimElementId(importedElement.id);
      setSelectedAttachmentId("");
      setSimLeftTab("geometry");
      setSimRightTab("properties");
      setOutput(
        targetElement
          ? `Replaced "${targetElement.name}" with the selected ScratchPad geometry.`
          : "Imported the selected ScratchPad shape into the center of the simulation scene.",
      );
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  }, [authoredSimElements, selectedSimElementId, updateSimulationElements]);

  const syncScratchGeometry = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("oc-pad-shapes");
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) {
        setOutput("Scratch geometry store is not available.");
        return;
      }
      let synced = 0;
      updateSimulationElements((items) =>
        items.map((element) => {
          const shapeId = element?.source?.kind === "scratch" && element?.source?.linked ? element.source.shapeId : null;
          if (!shapeId) return element;
          const shape = parsed.find((entry) => entry?.id === shapeId);
          if (!shape) return element;
          synced += 1;
          return convertScratchShapeToSimElement(shape, element);
        }),
      );
      setOutput(
        synced
          ? `Synced ${synced} linked scratch shape${synced === 1 ? "" : "s"} into the current simulation scene.`
          : "No linked scratch geometry was found in the current scene.",
      );
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  }, [updateSimulationElements]);

  useEffect(() => {
    const handleExport = () => {
      importScratchGeometry();
    };
    window.addEventListener("oc-export-scratch-geometry", handleExport);
    return () => window.removeEventListener("oc-export-scratch-geometry", handleExport);
  }, [importScratchGeometry]);

  const loadGuidedScenePrimitives = useCallback(() => {
    const guided = buildGuidedSceneElements(activeSimulation, workspaceItems, C);
    if (!guided.length) {
      setOutput("No guided scene primitives are available for this simulation yet.");
      return;
    }
    updateSimulationElements(() => guided);
    setSelectedSimElementId(guided[0].id);
    setSelectedAttachmentId("");
    setSimLeftTab("geometry");
    setSimRightTab("properties");
    setOutput(`Loaded ${guided.length} guided scene primitive${guided.length === 1 ? "" : "s"} for ${activeSimulation.title}.`);
  }, [C, activeSimulation, updateSimulationElements, workspaceItems]);

  const revertSimulationScene = useCallback(() => {
    const guided = buildGuidedSceneElements(activeSimulation, workspaceItems, C);
    if (!guided.length) {
      setOutput("No default guided scene is available to reload for this workbench.");
      return;
    }
    updateSimulationElements(() => guided);
    setSelectedSimElementId(guided[0]?.id || "");
    setSelectedAttachmentId("");
    setPendingMateSource(null);
    setSimLeftTab("geometry");
    setSimRightTab("properties");
    setOutput(`Reloaded the default ${activeSimulation.title} scene and cleared custom edits to this workbench geometry.`);
    markInteractiveTourAction("reload-lab");
  }, [C, activeSimulation, markInteractiveTourAction, updateSimulationElements, workspaceItems]);

  const openSelectedElementInScratchPad = useCallback((elementId) => {
    if (typeof window === "undefined") return;
    const element = authoredSimElements.find((entry) => entry.id === elementId);
    if (!element) return;
    const scratchShape = convertSimElementToScratchShape(element);
    if (!scratchShape) {
      setOutput("This scene object cannot be edited in ScratchPad yet. Try lines, rectangles, circles, polygons, or points.");
      return;
    }
    try {
      const raw = window.localStorage.getItem("oc-pad-shapes");
      const existing = raw ? JSON.parse(raw) : [];
      const nextShapes = Array.isArray(existing) ? [...existing, scratchShape] : [scratchShape];
      window.localStorage.setItem("oc-pad-shapes", JSON.stringify(nextShapes));
      window.localStorage.setItem("oc-pad-selected-shape-id", String(scratchShape.id));
      window.dispatchEvent(new CustomEvent("oc-open-scratchpad", { detail: { mode: "geo", tool: "select" } }));
      setOutput(`Opened ${element.name} in ScratchPad. Edit it there, then Send to OpenMAT to replace or import it back.`);
    } catch {
      setOutput("Could not open this scene object in ScratchPad.");
    }
  }, [authoredSimElements]);

  const dragSimulationAttachment = useCallback((attachmentId, x, y) => {
    const ownerId = authoredSimElements.find((element) => attachmentId.startsWith(`${element.id}-`))?.id;
    if (!ownerId) return;
    updateSimulationElements((items) =>
      items.map((element) => element.id === ownerId ? updateElementFromAttachmentDrag(element, attachmentId, x, y) : element),
    );
  }, [authoredSimElements, updateSimulationElements]);
  const simulationMetricCards = useMemo(() => {
    const workspaceCards = displayWorkspaceItems
      .filter((item) => typeof item.value === "number" || (Array.isArray(item.value) && item.value.length <= 4))
      .slice(0, 4);
    if (workspaceCards.length) return workspaceCards;
    return [
      {
        name: "Bodies",
        preview: String(derivedMechanicalModel.summary.bodyCount),
        className: "model",
        size: [1, 1],
        bytes: 0,
      },
      {
        name: "Springs",
        preview: String(derivedMechanicalModel.summary.springCount),
        className: "model",
        size: [1, 1],
        bytes: 0,
      },
      {
        name: "Total Mass",
        preview: String(derivedMechanicalModel.summary.totalMass),
        className: "model",
        size: [1, 1],
        bytes: 0,
      },
      {
        name: "Total Force",
        preview: String(derivedMechanicalModel.summary.totalForceMagnitude),
        className: "model",
        size: [1, 1],
        bytes: 0,
      },
    ];
  }, [derivedMechanicalModel, displayWorkspaceItems]);

  const captureRecoverySnapshot = useCallback((reason) => {
    setRecoverySnapshot(
      buildRecoverySnapshot({
        documents,
        activeDocumentId,
        browserTab,
        workspaceTab,
        controlValues,
        reason,
      }),
    );
  }, [activeDocumentId, browserTab, controlValues, documents, setRecoverySnapshot, workspaceTab]);

  const setCode = useCallback((value) => {
    if (!activeDocument) return;
    setDocuments((current) =>
      current.map((doc) => {
        if (doc.id !== activeDocument.id) return doc;
        const nextCode = value instanceof Function ? value(doc.code) : value;
        return { ...doc, code: String(nextCode ?? "") };
      }),
    );
  }, [activeDocument, setDocuments]);


  const workspaceTabs = [
    { id: "plot", label: "Figure", icon: LineChart },
    { id: "console", label: "Console", icon: Rows3 },
    { id: "workspace", label: "Workspace", icon: Waves },
    { id: "reference", label: "Reference", icon: Sigma },
    { id: "normalized", label: "Normalized", icon: Cpu },
  ];
  const browserTabs = [
    { id: "examples", label: "Examples" },
    { id: "functions", label: "Functions" },
    { id: "notes", label: "Notes" },
  ];
  const crowdedTabs = documents.length >= 6;
  const interactionModelItems = [
    "Editor tabs store saved scripts, examples, and labs.",
    "Run executes the active script and refreshes Figure, Workspace, and Console together.",
    "Console is for one-line experiments against the current workspace, not for editing files.",
    "Promote to Script copies the last useful console command into the active script tab.",
    "Workspace shows the current live variables that simulation and plotting tools build on.",
    "Simulation Mode wraps the same session with guided models, prompts, and lab workflow.",
  ];
  const referenceItems = [
    "Language: MATLAB-like syntax over a local math engine, not raw JS/Python",
    "Matrices: [1 2; 3 4], A', A \\\\ b, inv, det, trace, eig, qr, svd",
    "Arrays: linspace, logspace, zeros, ones, eye, rand, randn, reshape, repmat",
    "Statistics: mean, median, std, var, min, max, sum, prod, sort, unique, find",
    "Numerics: trapz, gradient, roots, rank, cond, orth, null, interp1",
    "Plots: plot, scatter, bar, hist, stem, area, hold on/off, clf, subplot",
    "3D: surf(X,Y,Z), mesh(X,Y,Z) launch into the 3D grapher",
    "Axes: title, xlabel, ylabel, legend, grid, xlim, ylim, axis tight/equal/auto",
    "Control: if/elseif/else/end, for i=1:n...end, while cond...end, break, continue",
    "Interactivity: slider('name', min, max, step, default)",
    "Animation: animate('t', min, max, step, default, speed, loop)",
  "Simulation authoring: rods, springs, masses, supports, forces, moments, dimensions",
  "Linked geometry: scratchpad geometry can sync back into simulation scenes by shape id",
  "Workbenches: pendulum, spring-mass, projectile, Merchant circle, beam/cantilever",
  "Functions: function [out]=name(in)...end and f = @(x) expr",
  "Math: sin, cos, exp, log, fft, ifft, polyfit, polyval, diff, cumsum",
  "Output/API: disp, sprintf, fprintf, num2str, who, whos, clear, clc, window.OpenMAT",
  "Workbench API: listWorkbenches(), getWorkbench(id), openWorkbench(id), exportSession()",
  ];
  const hasWorkspaceContext = displayWorkspaceItems.length > 0;
  const sessionSummary = [
    `${documents.length} script tab${documents.length === 1 ? "" : "s"}`,
    `${displayWorkspaceItems.length} workspace variable${displayWorkspaceItems.length === 1 ? "" : "s"}`,
    `${commandHistory.length} console command${commandHistory.length === 1 ? "" : "s"} saved`,
  ];
  const quickStartGuide = `## Quick start

### Switching modes

- Click **Script Mode** in the top header when you want the regular coding workspace.
- Click **Simulation Mode** in the same place when you want guided labs and prompts.
- Both modes use the **same session**, so the editor, figure, console, and workspace stay connected.

### Example users can try

1. Click **Simulation Mode**.
2. In the left panel, choose **Pendulum**.
3. OpenMAT loads the guided lab into a script tab.
4. Press **Run** if it has not already run.
5. In the **Figure** pane, move the sliders like \`length\`, \`gravity\`, or \`theta0\`.
6. Watch the plot update, then open **Workspace** or **Console** to inspect the same session.
7. Click **Script Mode** again if you want to edit the code directly.

### Importing or replacing geometry

1. In **Simulation Mode**, select a scene object first if you want to replace it.
2. Open the **Geometry** rail and click **Open ScratchPad** or **Import Scratch Geometry**.
3. ScratchPad opens directly in **Geo** mode with **Select** active when needed.
4. In ScratchPad, click one shape and use **Send to OpenMAT**.
5. If a simulation object was selected, the imported shape replaces it.
6. If nothing was selected, the imported shape is centered into the simulation viewport.
7. Use **Sync Linked Scratch Geometry** later if you keep editing that shape in ScratchPad.

### Mental model

- **Editor**: saved scripts and labs
- **Run**: refreshes figure, workspace, and console from the active tab
- **Console**: quick one-line experiments against the current workspace
- **Workspace**: variables from the latest run
- **Promote to Script**: moves a useful console command back into the active script
`;
  const helpMarkdown = `${quickStartGuide}\n\n---\n\n${openMatGuide}`;

  const clearRunState = useCallback(() => {
    setOutput("");
    setFigureJson(null);
    setBaseFigureJson(null);
    setSurfaceConfig(null);
    setPlotKind("2d");
    setControlSpecs([]);
    setControlValues({});
    setControlPlayback({});
    setLastConsoleCommand("");
    setIsPlotWindowOpen(false);
    setNormalizedPreview("");
    setWorkspaceItems([]);
    setSelectedVariable(null);
  }, [setControlPlayback, setControlValues]);

  const restoreRecoverySnapshot = useCallback(() => {
    const importedDocuments = normalizeImportedDocuments(recoverySnapshot?.documents);
    if (!importedDocuments) return;
    setDocuments(importedDocuments);
    const importedActiveId =
      typeof recoverySnapshot?.activeDocumentId === "string"
      && importedDocuments.some((doc) => doc.id === recoverySnapshot.activeDocumentId)
        ? recoverySnapshot.activeDocumentId
        : importedDocuments[0].id;
    setActiveDocumentId(importedActiveId);
    if (typeof recoverySnapshot?.browserTab === "string") setBrowserTab(recoverySnapshot.browserTab);
    if (typeof recoverySnapshot?.workspaceTab === "string") setWorkspaceTab(recoverySnapshot.workspaceTab);
    clearRunState();
    setControlValues(
      recoverySnapshot?.controlValues && typeof recoverySnapshot.controlValues === "object"
        ? recoverySnapshot.controlValues
        : {},
    );
  }, [
    clearRunState,
    recoverySnapshot,
    setActiveDocumentId,
    setBrowserTab,
    setControlValues,
    setDocuments,
    setWorkspaceTab,
  ]);

  const applyExecutionResult = useCallback((result, source, nextControlValues, commandLabel = "") => {
      const normalized = source
        .split(/\r?\n/)
        .map((line) => preprocessLine(line.replace(/;\s*$/, ""), new Set()))
        .filter(Boolean)
        .join("\n");
      setNormalizedPreview(normalized);
      const consoleOutput = commandLabel
        ? `>> ${commandLabel}\n${result.output || "No output."}`
        : result.output;
      setOutput(consoleOutput);
      setFigureJson(result.figureJson);
      setBaseFigureJson(result.figureJson);
      setSurfaceConfig(result.plot3DRequest || null);
      setControlSpecs((current) => {
        const incoming = result.controls || [];
        if (
          current.length === incoming.length &&
          current.every((c, i) => c.name === incoming[i].name && c.type === incoming[i].type)
        ) {
          return current;
        }
        return incoming;
      });
      setControlValues((current) => {
        const merged = { ...current };
        (result.controls || []).forEach((control) => {
          merged[control.name] = Object.prototype.hasOwnProperty.call(nextControlValues, control.name)
            ? nextControlValues[control.name]
            : control.value;
        });
        return merged;
      });
      setControlPlayback((current) => {
        const incoming = result.controls || [];
        const animateControls = incoming.filter((c) => c.type === "animate");
        const allMatch =
          Object.keys(current).length === animateControls.length &&
          animateControls.every((c) => c.name in current);
        if (allMatch) return current;
        const next = {};
        animateControls.forEach((control) => {
          next[control.name] = {
            playing: current[control.name]?.playing ?? false,
          };
        });
        return next;
      });
      if (result.plot3DRequest) {
        setPlotKind("3d");
      } else if (result.figureJson) {
        setPlotKind("2d");
      } else {
        setPlotKind("2d");
      }
      setWorkspaceItems(result.workspace || []);
      setSelectedVariable((current) =>
        result.workspace?.find((item) => item.name === current?.name) ||
        result.workspace?.[0] ||
        null,
      );
      setWorkspaceTab((current) => {
        const desired = result.figureJson ? "plot" : result.workspace?.length ? "workspace" : "console";
        return current === desired ? current : desired;
      });
      setLastConsoleCommand(commandLabel);
      window.dispatchEvent(new CustomEvent("openmat:run", { detail: result }));
    }, [setControlPlayback, setControlValues, setWorkspaceTab]);

  const runCode = useCallback((nextControlValues = controlValues) => {
    setRunning(true);
    try {
      const result = executeScript(code, {
        extensions: listOpenMatExtensions(),
        controlValues: nextControlValues,
      });
      applyExecutionResult(result, code, nextControlValues, "");
      markInteractiveTourAction("run-workbench");
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setFigureJson(null);
      setBaseFigureJson(null);
      setIsPlotWindowOpen(false);
      setSurfaceConfig(null);
      setPlotKind("2d");
      setControlSpecs([]);
      setControlPlayback({});
      setLastConsoleCommand("");
      setWorkspaceItems([]);
      setSelectedVariable(null);
      setWorkspaceTab("console");
    } finally {
      setRunning(false);
      requestAnimationFrame(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [applyExecutionResult, code, controlValues, markInteractiveTourAction, setControlPlayback, setControlValues, setWorkspaceTab]);

  useEffect(() => {
    if (pendingAutoRunDocumentIdRef.current !== activeDocumentId) return;
    pendingAutoRunDocumentIdRef.current = null;
    runCode();
  }, [activeDocumentId, runCode]);

  const refreshSimulationModel = useCallback(() => {
    runCode();
    setOutput(`Refreshed ${activeSimulation.title} from the current script, sliders, and scene state.`);
  }, [activeSimulation.title, runCode]);

  const runConsoleCommand = useCallback(() => {
    const command = commandInput.trim();
    if (!command) return;
    setRunning(true);
    try {
      const source = command;
      const result = executeScript(source, {
        extensions: listOpenMatExtensions(),
        controlValues,
        initialWorkspace: workspaceItems,
      });
      applyExecutionResult(result, source, controlValues, command);
      setCommandHistory((current) => {
        const trimmed = current.filter((entry) => entry !== command);
        return [...trimmed.slice(-99), command];
      });
      setCommandHistoryIndex(-1);
      setCommandInput("");
      setWorkspaceTab(result.figureJson ? "plot" : result.workspace?.length ? "workspace" : "console");
    } catch (error) {
      setOutput(`>> ${command}\nError: ${error.message}`);
      setLastConsoleCommand(command);
      setWorkspaceTab("console");
    } finally {
      setRunning(false);
      requestAnimationFrame(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        consoleInputRef.current?.focus();
      });
    }
  }, [
    applyExecutionResult,
    commandInput,
    controlValues,
    setCommandHistory,
    setWorkspaceTab,
    workspaceItems,
  ]);

  const insertLastCommandIntoScript = useCallback(() => {
    if (!lastConsoleCommand) return;
    setCode((prev) => `${prev}${prev.endsWith("\n") || !prev ? "" : "\n"}${lastConsoleCommand}\n`);
  }, [lastConsoleCommand, setCode]);

  const resetWorkspace = useCallback(() => {
    captureRecoverySnapshot("Reset workspace");
    const resetDocument = createOpenMatDocument("untitled.m", DEFAULT_CODE);
    setDocuments([resetDocument]);
    setActiveDocumentId(resetDocument.id);
    clearRunState();
  }, [captureRecoverySnapshot, clearRunState, setActiveDocumentId, setDocuments]);

  const loadExample = useCallback(
    (exampleId) => {
      const example = exampleMap[exampleId];
      if (!example) return;
      captureRecoverySnapshot(`Load example: ${example.label}`);
      const document = createOpenMatDocument(`${example.label}.m`, example.code);
      setDocuments((current) => [...current, document]);
      setActiveDocumentId(document.id);
      clearRunState();
    },
    [captureRecoverySnapshot, clearRunState, exampleMap, setActiveDocumentId, setDocuments],
  );

  const openSimulationWorkspace = useCallback((simulationId) => {
    const simulation = simulationMap[simulationId];
    const example = exampleMap[simulationId];
    if (!simulation || !example) return;
    setWorkspaceMode("sim");
    setActiveSimulationId(simulationId);
    setWorkbenchLessonProgress((current) => ({
      ...(current && typeof current === "object" ? current : {}),
      [simulationId]: 0,
    }));
    const existing = documents.find((doc) => doc.name === `${example.label}.m`);
    if (existing) {
      setActiveDocumentId(existing.id);
      pendingAutoRunDocumentIdRef.current = existing.id;
      return;
    }
    const document = createOpenMatDocument(`${example.label}.m`, example.code);
    setDocuments((current) => [...current, document]);
    setActiveDocumentId(document.id);
    pendingAutoRunDocumentIdRef.current = document.id;
    clearRunState();
  }, [
    clearRunState,
    documents,
    exampleMap,
    setWorkbenchLessonProgress,
    setActiveDocumentId,
    setActiveSimulationId,
    setDocuments,
    setWorkspaceMode,
    simulationMap,
  ]);

  const startInteractiveTour = useCallback((tourId = "spring-mass-basics") => {
    const tour = OPENMAT_INTERACTIVE_TOURS[tourId];
    if (!tour) return;
    openSimulationWorkspace(tour.simulationId);
    setSimRightTab("params");
    setInteractiveTour({
      active: true,
      id: tourId,
      stepIndex: 0,
      lastAction: "",
    });
  }, [openSimulationWorkspace, setInteractiveTour, setSimRightTab]);

  const exportWorkspace = useCallback(() => {
    const payload = {
      documents,
      activeDocumentId,
      browserTab,
      workspaceTab,
      workspaceMode,
      activeSimulationId,
      simGeometryStore,
      simConstraintStore,
      simLeftTab,
      simRightTab,
      workbenchLessonProgress,
      controlValues,
      exportedAt: new Date().toISOString(),
      app: "OpenMAT",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "openmat-session.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [activeDocumentId, activeSimulationId, browserTab, controlValues, documents, simConstraintStore, simGeometryStore, simLeftTab, simRightTab, workbenchLessonProgress, workspaceMode, workspaceTab]);

  const importWorkspace = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        captureRecoverySnapshot(`Import session: ${file.name}`);
        const parsed = JSON.parse(String(loadEvent.target?.result || "{}"));
        const importedDocuments = normalizeImportedDocuments(parsed.documents)
          || (typeof parsed.code === "string"
            ? [createOpenMatDocument("untitled.m", parsed.code)]
            : null);
        if (!importedDocuments) {
          throw new Error("No valid OpenMAT documents were found in this file.");
        }
        setDocuments(importedDocuments);
        const importedActiveId =
          typeof parsed.activeDocumentId === "string"
          && importedDocuments.some((doc) => doc.id === parsed.activeDocumentId)
            ? parsed.activeDocumentId
            : importedDocuments[0].id;
        setActiveDocumentId(importedActiveId);
        if (typeof parsed.browserTab === "string") setBrowserTab(parsed.browserTab);
        if (typeof parsed.workspaceTab === "string") setWorkspaceTab(parsed.workspaceTab);
        if (typeof parsed.workspaceMode === "string") setWorkspaceMode(parsed.workspaceMode);
        if (typeof parsed.activeSimulationId === "string") setActiveSimulationId(parsed.activeSimulationId);
        if (parsed.simGeometryStore && typeof parsed.simGeometryStore === "object") setSimGeometryStore(parsed.simGeometryStore);
        if (parsed.simConstraintStore && typeof parsed.simConstraintStore === "object") setSimConstraintStore(parsed.simConstraintStore);
        if (typeof parsed.simLeftTab === "string") setSimLeftTab(parsed.simLeftTab);
        if (typeof parsed.simRightTab === "string") setSimRightTab(parsed.simRightTab);
        if (parsed.workbenchLessonProgress && typeof parsed.workbenchLessonProgress === "object") {
          setWorkbenchLessonProgress(parsed.workbenchLessonProgress);
        }
        clearRunState();
        setControlValues(
          parsed.controlValues && typeof parsed.controlValues === "object" ? parsed.controlValues : {},
        );
      } catch (error) {
        setOutput(`Error: Could not import workspace. ${error.message}`);
        setWorkspaceTab("console");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }, [captureRecoverySnapshot, clearRunState, setActiveDocumentId, setActiveSimulationId, setBrowserTab, setControlPlayback, setControlValues, setDocuments, setSimConstraintStore, setSimGeometryStore, setSimLeftTab, setSimRightTab, setWorkbenchLessonProgress, setWorkspaceMode, setWorkspaceTab]);

  const createNewDocument = useCallback(() => {
    const document = createOpenMatDocument(getNextUntitledName(documents), "");
    setDocuments((current) => [...current, document]);
    setActiveDocumentId(document.id);
    clearRunState();
  }, [clearRunState, documents, setActiveDocumentId, setDocuments]);

  const renameActiveDocument = useCallback(() => {
    if (!activeDocument) return;
    const nextName = window.prompt("Rename script", activeDocument.name);
    if (!nextName) return;
    const trimmed = nextName.trim();
    if (!trimmed) return;
    setDocuments((current) =>
      current.map((doc) => (doc.id === activeDocument.id ? { ...doc, name: trimmed } : doc)),
    );
  }, [activeDocument, setDocuments]);

  const switchDocument = useCallback((documentId) => {
    if (!documentId || documentId === activeDocumentId) return;
    setActiveDocumentId(documentId);
    clearRunState();
  }, [activeDocumentId, clearRunState, setActiveDocumentId]);

  const closeDocument = useCallback((documentId) => {
    if (!documentId) return;
    captureRecoverySnapshot("Close script tab");
    if (documents.length <= 1) {
      resetWorkspace();
      return;
    }
    const currentIndex = documents.findIndex((doc) => doc.id === documentId);
    const nextDocuments = documents.filter((doc) => doc.id !== documentId);
    const nextActive =
      activeDocumentId === documentId
        ? nextDocuments[Math.max(0, currentIndex - 1)]?.id || nextDocuments[0]?.id
        : activeDocumentId;
    setDocuments(nextDocuments);
    setActiveDocumentId(nextActive);
    if (activeDocumentId === documentId) {
      clearRunState();
    }
  }, [activeDocumentId, captureRecoverySnapshot, clearRunState, documents, resetWorkspace, setActiveDocumentId, setDocuments]);

  const figureMeta = useMemo(() => extractFigureMeta(displayFigureJson), [displayFigureJson]);

  useEffect(() => {
    stateRef.current = {
      documents,
      activeDocumentId,
      activeDocument,
      code,
      output,
      workspaceItems: displayWorkspaceItems,
      figureJson: displayFigureJson,
      recoverySnapshot,
      workspaceMode,
      activeSimulation,
    };
  }, [activeDocument, activeDocumentId, activeSimulation, code, displayFigureJson, displayWorkspaceItems, documents, output, recoverySnapshot, workspaceMode]);

  useEffect(() => {
    const api = {
      registerExtension: registerOpenMatExtension,
      unregisterExtension: unregisterOpenMatExtension,
      listExtensions: () => listOpenMatExtensions().map(({ name }) => name),
      run: (source) => executeScript(String(source ?? stateRef.current.code ?? ""), { extensions: listOpenMatExtensions() }),
      setCode: (nextCode) => setCode(String(nextCode ?? "")),
      appendCode: (snippet) => setCode((prev) => `${prev}${prev.endsWith("\n") ? "" : "\n"}${String(snippet ?? "")}`),
      createDocument: (name = null, nextCode = "") => {
        const document = createOpenMatDocument(name || getNextUntitledName(stateRef.current.documents || []), String(nextCode ?? ""));
        setDocuments((current) => [...current, document]);
        setActiveDocumentId(document.id);
        return document.id;
      },
      renameDocument: (id, name) => {
        if (!id || !name) return;
        setDocuments((current) =>
          current.map((doc) => (doc.id === id ? { ...doc, name: String(name).trim() || doc.name } : doc)),
        );
      },
      setActiveDocument: (id) => {
        if (typeof id === "string") setActiveDocumentId(id);
      },
      listWorkbenches: () => SIMULATION_WORKSPACES.map(({ id, title, summary, controls, lesson }) => ({
        id,
        title,
        summary,
        controls,
        lessonTitle: lesson?.title || "",
      })),
      getWorkbench: (id) => simulationMap[id] || null,
      openWorkbench: (id) => {
        if (typeof id === "string" && simulationMap[id]) openSimulationWorkspace(id);
      },
      restoreLastSnapshot: () => restoreRecoverySnapshot(),
      getState: () => ({ ...stateRef.current }),
      exportSession: exportWorkspace,
      open3D: (config) => openGrapher({ mode: "3d", ...config }),
    };
    window.OpenMAT = api;
    window.dispatchEvent(new CustomEvent("openmat:ready", { detail: { extensions: api.listExtensions() } }));
    return () => {
      if (window.OpenMAT === api) delete window.OpenMAT;
    };
  }, [exportWorkspace, openGrapher, openSimulationWorkspace, restoreRecoverySnapshot, setActiveDocumentId, setCode, setDocuments, simulationMap]);

  useEffect(() => {
    if (!isResizingRightPane) return undefined;

    const handleMove = (event) => {
      const shellRect = shellRef.current?.getBoundingClientRect();
      if (!shellRect) return;
      const nextWidth = shellRect.right - event.clientX;
      const clamped = Math.max(300, Math.min(820, nextWidth));
      setRightPaneWidth(Math.round(clamped));
    };

    const handleUp = () => {
      setIsResizingRightPane(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingRightPane, setRightPaneWidth]);

  useEffect(() => {
    if (!isResizingSimCenter) return undefined;

    const handleMove = (event) => {
      const shellRect = shellRef.current?.getBoundingClientRect();
      if (!shellRect) return;
      const nextPercent = ((event.clientX - shellRect.left) / shellRect.width) * 100;
      const clamped = Math.max(28, Math.min(62, nextPercent));
      setSimEditorWidth(Math.round(clamped));
    };

    const handleUp = () => {
      setIsResizingSimCenter(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingSimCenter, setSimEditorWidth]);

  const isPlotFocused = plotPanelMode === "focus";
  const rightPaneCssWidth = isPlotFocused
    ? "min(100%, max(56vw, 760px))"
    : `min(100%, ${rightPaneWidth}px)`;
  const updateControlValue = useCallback((name, nextValue) => {
    const spec = controlSpecs.find((control) => control.name === name);
    if (!spec) return;
    const clamped = clampValue(Number(nextValue), spec.min, spec.max);
    const snapped = spec.step > 0
      ? Number((Math.round((clamped - spec.min) / spec.step) * spec.step + spec.min).toFixed(6))
      : clamped;
    const nextControls = { ...controlValues, [name]: snapped };
    setControlValues(nextControls);
    runCode(nextControls);
  }, [controlSpecs, controlValues, runCode, setControlValues]);

  const toggleAnimatedControl = useCallback((name) => {
    setControlPlayback((current) => ({
      ...current,
      [name]: {
        playing: !(current[name]?.playing ?? false),
      },
    }));
  }, [setControlPlayback]);

  const resetAnimatedControl = useCallback((name) => {
    const spec = controlSpecs.find((control) => control.name === name);
    if (!spec) return;
    const resetValue = spec.defaultValue ?? spec.min;
    const nextControls = { ...controlValuesRef.current, [name]: resetValue };
    setControlPlayback((current) => ({
      ...current,
      [name]: {
        playing: false,
      },
    }));
    setControlValues(nextControls);
    runCode(nextControls);
  }, [controlSpecs, runCode, setControlPlayback, setControlValues]);

  const stepAnimatedControls = useCallback(() => {
    const animatedControls = controlSpecs.filter(
      (control) => control.type === "animate" && controlPlayback[control.name]?.playing,
    );
    if (!animatedControls.length) return;

    const nextControls = { ...controlValuesRef.current };
    const stoppedNames = [];

    animatedControls.forEach((control) => {
      const currentValue = Object.prototype.hasOwnProperty.call(nextControls, control.name)
        ? Number(nextControls[control.name])
        : control.value;
      let nextValue = currentValue + control.step * (control.speed || 1);
      if (nextValue > control.max + 1e-9) {
        if (control.loop) {
          nextValue = control.min;
        } else {
          nextValue = control.max;
          stoppedNames.push(control.name);
        }
      }
      nextControls[control.name] = Number(nextValue.toFixed(6));
    });

    if (stoppedNames.length) {
      setControlPlayback((current) => {
        const next = { ...current };
        stoppedNames.forEach((name) => {
          next[name] = { playing: false };
        });
        return next;
      });
    }

    setControlValues(nextControls);
    runCode(nextControls);
  }, [controlPlayback, controlSpecs, runCode, setControlPlayback, setControlValues]);

  useEffect(() => {
    const hasActiveAnimation = controlSpecs.some(
      (control) => control.type === "animate" && controlPlayback[control.name]?.playing,
    );
    if (!hasActiveAnimation) return undefined;

    const timer = window.setInterval(() => {
      stepAnimatedControls();
    }, 80);

    return () => window.clearInterval(timer);
  }, [controlPlayback, controlSpecs, stepAnimatedControls]);

  return (
    <div
      ref={shellRef}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border"
      style={{
        background: C.surface,
        borderColor: C.border,
        color: C.text,
        boxShadow: `0 24px 70px ${C.pageGlow}`,
      }}
    >
      <div
        className="flex items-center justify-between gap-4 border-b px-4 py-2"
        style={{ background: C.surface3, borderColor: C.border }}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div
              className="rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ background: C.surface2, color: C.blue }}
            >
              OpenMAT
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <div className="truncate text-sm font-semibold">{activeDocument?.name || "untitled.m"}</div>
                <button
                  type="button"
                  onClick={renameActiveDocument}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold"
                  style={{ borderColor: C.border, background: C.surface, color: C.text }}
                  title="Rename current script"
                >
                  <Pencil className="h-3 w-3" />
                  Rename
                </button>
              </div>
              <div className="text-[11px]" style={{ color: C.muted }}>
                Matrix computing workspace • local engine • mobile-aware layout
              </div>
            </div>
            <div className="ml-2 inline-flex rounded-lg border p-1" style={{ borderColor: C.border, background: C.surface }}>
              {[
                { id: "script", label: "Script Mode" },
                { id: "sim", label: "Simulation Mode" },
              ].map((mode) => {
                const active = workspaceMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setWorkspaceMode(mode.id);
                      if (mode.id === "sim" && activeSimulation?.id) {
                        setActiveSimulationId(activeSimulation.id);
                      }
                    }}
                    className="rounded-md px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      background: active ? C.surface2 : "transparent",
                      color: active ? C.text : C.muted,
                    }}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => startInteractiveTour()}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
            title="Launch the interactive OpenMAT getting-started tour"
          >
            <Play className="h-3.5 w-3.5" />
            Start Tour
          </button>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
            title="Open OpenMAT help"
          >
            <CircleHelp className="h-3.5 w-3.5" />
            Help
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
          >
            {sidebarOpen ? "Hide Browser" : "Show Browser"}
          </button>
          <button
            type="button"
            onClick={exportWorkspace}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </button>
          {normalizeImportedDocuments(recoverySnapshot?.documents) && (
            <button
              type="button"
              onClick={restoreRecoverySnapshot}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: C.border, background: C.surface, color: C.text }}
              title={recoverySnapshot?.reason ? `Restore: ${recoverySnapshot.reason}` : "Restore last snapshot"}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Restore
            </button>
          )}
          <button
            type="button"
            onClick={resetWorkspace}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{
              background: C.surface,
              borderColor: C.border,
              color: C.text,
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
          {surfaceConfig && (
            <button
              type="button"
              onClick={() => openGrapher(surfaceConfig)}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: C.border, background: C.surface, color: C.text }}
            >
              Separate 3D
            </button>
          )}
          <OpenMatTooltip content={workspaceMode === "sim" ? "Run the current workbench model. Static workbenches use Run plus sliders instead of a Play button." : "Run the current OpenMAT script and refresh the figure, workspace, and console."}>
            <button
              type="button"
              onClick={runCode}
              disabled={running}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 ${runButtonHighlight.className}`}
              style={{ background: "linear-gradient(135deg, #0f8d85, #1769d1)", borderColor: "transparent", ...runButtonHighlight.style }}
            >
              <Play className="h-3.5 w-3.5" />
              {running ? "Running..." : "Run"}
            </button>
          </OpenMatTooltip>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: C.border, background: C.surface, color: C.text }}
            title="Close OpenMAT"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>
      </div>
      <input
        ref={importRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={importWorkspace}
      />

      {workspaceMode === "sim" ? (
        <div className="flex min-h-0 flex-1">
          <div className="flex w-14 shrink-0 flex-col border-r" style={{ borderColor: C.border, background: C.surface3 }}>
            {[
              { id: "models", label: "Models", icon: Waves },
              { id: "project", label: "Project", icon: Rows3 },
              { id: "geometry", label: "Geometry", icon: Pencil },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = simLeftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSimLeftTab((current) => current === tab.id ? "" : tab.id)}
                  className="m-2 inline-flex h-10 items-center justify-center rounded-xl border"
                  style={{ borderColor: active ? C.blue : C.border, background: active ? C.surface2 : C.surface, color: active ? C.blue : C.muted }}
                  title={tab.label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          {simLeftTab && (
            <div className="flex w-[280px] shrink-0 flex-col border-r" style={{ borderColor: C.border, background: C.surface3 }}>
              <div className="border-b px-4 py-3" style={{ borderColor: C.border }}>
                <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                  {simLeftTab === "models" ? "Simulation Browser" : simLeftTab === "project" ? "Project Tree" : "Geometry Authoring"}
                </div>
                <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                  {simLeftTab === "models"
                    ? "Choose guided labs and swap between simulation families."
                    : simLeftTab === "project"
                      ? "Toggle the support panels you need instead of showing everything at once."
                      : "Place simple scene geometry, then convert it into rods, springs, masses, and anchors."}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-3">
                {simLeftTab === "models" ? (
                  <div className="space-y-3">
                    {SIMULATION_WORKSPACES.map((simulation) => {
                      const active = activeSimulation?.id === simulation.id;
                      return (
                        <button
                          key={simulation.id}
                          type="button"
                          onClick={() => openSimulationWorkspace(simulation.id)}
                          className="block w-full rounded-2xl border px-3 py-3 text-left"
                          style={{ borderColor: active ? C.blue : C.border, background: active ? C.surface : C.surface2 }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold">{simulation.title}</div>
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ background: active ? "rgba(23, 105, 209, 0.14)" : C.surface, color: active ? C.blue : C.muted }}>
                              {active ? "Loaded" : "Open"}
                            </span>
                          </div>
                          <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                            {simulation.summary}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : simLeftTab === "project" ? (
                  <div className="space-y-3">
                    {simulationTreeItems.map((section) => (
                      <div key={section.id} className="rounded-2xl border p-3" style={{ borderColor: C.border, background: C.surface }}>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.hint }}>
                          {section.title}
                        </div>
                        <div className="mt-1 text-sm font-semibold">{section.detail}</div>
                        <div className="mt-2 grid gap-2">
                          {section.lines.map((line) => (
                            <div key={line} className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-2xl border p-3" style={{ borderColor: C.border, background: C.surface }}>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.hint }}>
                        Add primitive
                      </div>
                      <div className="grid gap-2">
                        {[
                          { type: "line", label: "Add Rod Line", tip: "Create a straight member you can later treat as a beam, rod, or spring-like connector." },
                          { type: "rect", label: "Add Rect / Wall Block", tip: "Create a block or wall shape. This is useful for masses, housings, and fixed supports." },
                          { type: "circle", label: "Add Body Circle", tip: "Create a circular body or bob. Good for simple masses, rollers, or pulley-like placeholders." },
                          { type: "point", label: "Add Joint Point", tip: "Create a free point marker you can use as a joint, pivot, or reference point." },
                          { type: "force", label: "Add Force Arrow", tip: "Create an applied load arrow with a direction and magnitude." },
                          { type: "support", label: "Add Support", tip: "Create a support symbol to mark where the model is constrained or reacts." },
                          { type: "moment", label: "Add Moment", tip: "Create a rotational load marker for torques or moments." },
                          { type: "dimension", label: "Add Dimension", tip: "Create a measurement marker to show span, width, height, or spacing." },
                        ].map((item) => (
                          <OpenMatTooltip key={item.type} content={item.tip} fullWidth>
                            <button
                              type="button"
                              onClick={() => addSimulationElement(item.type)}
                              className="w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold"
                              style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                            >
                              {item.label}
                            </button>
                          </OpenMatTooltip>
                        ))}
                      </div>
                      <OpenMatTooltip content="Open ScratchPad directly in geometry-select mode so you can choose or edit one shape and send it back into this workbench." fullWidth>
                        <button
                          type="button"
                          onClick={openScratchGeometryTool}
                          className="mt-3 w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                        >
                          Open ScratchPad
                        </button>
                      </OpenMatTooltip>
                      <div className="mt-2 text-[11px] leading-5" style={{ color: C.muted }}>
                        Opens ScratchPad directly in Geo Select mode so you can choose one shape and send it back here.
                      </div>
                      <OpenMatTooltip content="Bring the currently selected ScratchPad shape into the simulation. If a scene part is selected first, that part will be replaced." fullWidth>
                        <button
                          type="button"
                          onClick={importScratchGeometry}
                          className="mt-3 w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                        >
                          Import Scratch Geometry
                        </button>
                      </OpenMatTooltip>
                      <div className="mt-2 text-[11px] leading-5" style={{ color: C.muted }}>
                        Imports the currently selected ScratchPad shape. If a scene part is selected first, the imported shape replaces that part.
                      </div>
                      <div className="mt-2 text-[11px] leading-5" style={{ color: C.muted }}>
                        Tip: use the Properties rail to rename parts, mark them as Fixed, Member, Spring, or Mass, and start a Mate from any attachment point.
                      </div>
                      <OpenMatTooltip content="Refresh any scene parts that are still linked to their original ScratchPad geometry." fullWidth>
                        <button
                          type="button"
                          onClick={syncScratchGeometry}
                          className="mt-3 w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                        >
                          Sync Linked Scratch Geometry
                        </button>
                      </OpenMatTooltip>
                      <div className="mt-2 text-[11px] leading-5" style={{ color: C.muted }}>
                        Keeps imported scratch shapes live-linked so later edits update here too.
                      </div>
                      <OpenMatTooltip content="Convert the built-in workbench scene into editable parts so you can select, replace, delete, or mate them." fullWidth>
                        <button
                          type="button"
                          onClick={loadGuidedScenePrimitives}
                          className="mt-3 w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                        >
                          Load Guided Scene Primitives
                        </button>
                      </OpenMatTooltip>
                      <div className="mt-2 text-[11px] leading-5" style={{ color: C.muted }}>
                        Converts the current guided lab into editable primitives so you can delete, replace, or annotate parts directly.
                      </div>
                    </div>
                    <div className="rounded-2xl border p-3" style={{ borderColor: C.border, background: C.surface }}>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.hint }}>
                        Scene objects
                      </div>
                      {liveSimElements.length ? (
                        <div className="grid gap-2">
                          {liveSimElements.map((element) => {
                            const active = element.id === selectedSimElementId;
                            const roleMeta = getSimulationRoleMeta(element.role);
                            return (
                              <OpenMatTooltip key={element.id} content={`Double-click to open this part in ScratchPad for geometry editing.`} fullWidth>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSimElementId(element.id);
                                    setSelectedAttachmentId("");
                                    setSimRightTab("properties");
                                  }}
                                  onDoubleClick={() => openSelectedElementInScratchPad(element.id)}
                                  className="w-full rounded-xl border px-3 py-2 text-left"
                                  style={{ borderColor: active ? C.blue : C.border, background: active ? C.surface2 : C.surface, color: C.text }}
                                >
                                  <div className="text-sm font-semibold">{element.name}</div>
                                  <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                                    {roleMeta.label} • {element.type}
                                  </div>
                                </button>
                              </OpenMatTooltip>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border px-3 py-4 text-sm" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                          No custom geometry yet. Add a primitive to start building your own scene.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex min-w-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col" style={{ width: `${simEditorWidth}%` }}>
              <div className="border-b px-4 py-3" style={{ borderColor: C.border, background: C.surface2 }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                      Script Editor
                    </div>
                    <div className="mt-1 text-sm font-semibold">{activeDocument?.name || "untitled.m"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={createNewDocument}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border"
                      style={{ borderColor: C.border, background: C.surface, color: C.text }}
                      title="New script tab"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={renameActiveDocument}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold"
                      style={{ borderColor: C.border, background: C.surface, color: C.text }}
                    >
                      <Pencil className="h-3 w-3" />
                      Rename
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex min-w-0 items-end gap-1 overflow-x-auto pb-1">
                  {documents.map((document) => {
                    const active = document.id === activeDocument?.id;
                    return (
                      <button
                        key={document.id}
                        type="button"
                        onClick={() => switchDocument(document.id)}
                        className="inline-flex items-center gap-2 rounded-t-lg border border-b-0 px-3 py-1.5 pr-2 text-xs font-semibold"
                        style={{ background: active ? C.surface : C.surface2, borderColor: C.border, color: active ? C.text : C.muted }}
                        title={document.name}
                      >
                        <span className={crowdedTabs ? "max-w-[74px] truncate" : "max-w-[116px] truncate"}>
                          {compactDocumentLabel(document.name, crowdedTabs)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="min-h-0 flex-1 p-2 md:p-3">
                <Editor
                  height="100%"
                  beforeMount={setupOpenCalcMonaco}
                  defaultLanguage="openmat"
                  language="openmat"
                  theme={C.isDark ? "openmat-dark" : "openmat-light"}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineHeight: 21,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: "on",
                    padding: { top: 14, bottom: 14 },
                  }}
                  onMount={(editor, monaco) => {
                    monacoRef.current = monaco;
                    monaco.editor.setTheme(C.isDark ? "openmat-dark" : "openmat-light");
                    editor.addCommand(1024 | 3, () => {
                      runCode();
                    });
                  }}
                />
              </div>
            </div>

            <div
              className="hidden w-2 shrink-0 cursor-ew-resize border-l border-r lg:flex lg:items-center lg:justify-center"
              style={{ borderColor: C.border, background: C.surface3 }}
              onMouseDown={(event) => {
                event.preventDefault();
                setIsResizingSimCenter(true);
              }}
              title="Drag to resize editor and viewport"
            >
              <div className="h-12 w-1 rounded-full" style={{ background: C.border }} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="border-b px-4 py-3" style={{ borderColor: C.border, background: C.surface2 }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                      Viewport
                    </div>
                    <div className="mt-1 text-sm font-semibold">{activeSimulation?.title || "Simulation"}</div>
                    <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                      {activeSimulation?.summary || "A guided simulation scene built on the same plotting and workspace engine."}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {activeSimulationTour && (
                      <button
                        type="button"
                        onClick={() => startInteractiveTour(activeSimulationTour.id)}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                        style={{ borderColor: C.border, background: C.surface, color: C.text }}
                        title="Start an interactive tour for this workbench"
                      >
                        {interactiveTour?.active && activeInteractiveTour?.id === activeSimulationTour.id ? "Restart Tour" : "Start Tour"}
                      </button>
                    )}
                    {surfaceConfig && (
                      <button
                        type="button"
                        onClick={() => setPlotKind((current) => current === "3d" ? "2d" : "3d")}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                        style={{ borderColor: C.border, background: C.surface, color: C.text }}
                      >
                        {plotKind === "3d" ? "Show 2D" : "Show 3D"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={revertSimulationScene}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${reloadLabHighlight.className}`}
                      style={{ borderColor: C.border, background: C.surface, color: C.text, ...reloadLabHighlight.style }}
                      title="Restore the default editable scene for this workbench"
                    >
                      Reload Lab
                    </button>
                    <button
                      type="button"
                      onClick={refreshSimulationModel}
                      className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                      style={{ borderColor: C.blue, background: "rgba(23, 105, 209, 0.12)", color: C.blue }}
                      title="Rerun the current script and slider state without wiping your scene edits"
                    >
                      Refresh Model
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative min-h-0 flex-1 p-3">
                {interactiveTour?.active && activeInteractiveTour && activeInteractiveTour.simulationId === activeSimulationId && (
                  <div
                    className="pointer-events-auto absolute z-20 w-[340px] rounded-2xl border p-4 shadow-2xl"
                    style={{
                      ...interactiveTourOverlayPosition,
                      borderColor: C.border,
                      background: "linear-gradient(180deg, rgba(23,105,209,0.18), rgba(8,15,31,0.92))",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                          Interactive Tour
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {activeInteractiveTour.title}
                        </div>
                        <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                          {activeInteractiveTour.subtitle}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: C.surface, color: C.blue }}>
                          {interactiveTour.stepIndex >= activeInteractiveTour.steps.length ? "Complete" : `Step ${interactiveTourProgressLabel}`}
                        </span>
                        <button
                          type="button"
                          onClick={closeInteractiveTour}
                          className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                          style={{ borderColor: C.border, background: C.surface, color: C.text }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    {interactiveTour.stepIndex < activeInteractiveTour.steps.length ? (
                      <div className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: C.border, background: C.surface }}>
                        <div className="text-sm font-semibold">{activeInteractiveTourStep?.title}</div>
                        <div className="mt-1 text-xs leading-6" style={{ color: C.muted }}>
                          {activeInteractiveTourStep?.body}
                        </div>
                        <div className="mt-3 text-[11px]" style={{ color: C.hint }}>
                          Look for the blinking highlighted control in the real UI. The tour advances automatically when you complete that step.
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: C.border, background: C.surface }}>
                        <div className="text-sm font-semibold">Tour complete</div>
                        <div className="mt-1 text-xs leading-6" style={{ color: C.muted }}>
                          You have run the bench, played the motion, selected a part, changed the original model, and restored the default scene. Restart it any time from Start Tour.
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`rounded-[28px] ${viewportHighlight.className}`}
                  style={viewportHighlight.style}
                >
                  <OpenMatSimulationViewport
                    activeSimulation={activeSimulation}
                    workspaceItems={displayWorkspaceItems}
                    figureJson={displayFigureJson}
                    surfaceConfig={surfaceConfig}
                    plotKind={plotKind}
                    setPlotKind={setPlotKind}
                    C={C}
                    openGrapher={openGrapher}
                    authoredElements={displayedSimElements}
                    selectedElementId={selectedSimElementId}
                    selectedAttachmentId={selectedAttachmentId}
                    mateSource={pendingMateSource}
                    onSelectElement={(id) => {
                      setSelectedSimElementId(id);
                      setSelectedAttachmentId("");
                      setPendingMateSource(null);
                      setSimRightTab("properties");
                    }}
                    onDoubleSelectElement={openSelectedElementInScratchPad}
                    onSelectAttachment={(id) => {
                      setSelectedAttachmentId(id);
                      setSimRightTab("properties");
                    }}
                    onCompleteMate={completeMateToAttachment}
                    onDragAttachment={dragSimulationAttachment}
                    onClearSelection={() => {
                      setSelectedSimElementId("");
                      setSelectedAttachmentId("");
                      setPendingMateSource(null);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {simRightTab && (
            <div className="flex w-[340px] shrink-0 flex-col border-l" style={{ borderColor: C.border, background: C.surface2 }}>
              <div className="border-b px-4 py-3" style={{ borderColor: C.border }}>
                <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                  {simRightTab === "params" ? "Parameters" : simRightTab === "results" ? "Results" : simRightTab === "assembly" ? "Assembly" : simRightTab === "console" ? "Console" : simRightTab === "workspace" ? "Workspace" : simRightTab === "properties" ? "Properties" : "Reference"}
                </div>
                <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                  Toggle only the panel you need while keeping the editor and viewport side by side.
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-3">
                {simRightTab === "params" && (
                  <div className="space-y-3">
                    <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                        Use this workbench
                      </div>
                      <div className="grid gap-2">
                        {getSimulationQuickStart(activeSimulation, controlSpecs.some((control) => control.type === "animate")).slice(0, 2).map((item) => (
                          <div key={item} className="rounded-xl border px-3 py-2 text-xs leading-5" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                      <div className="text-sm font-semibold">{activeSimulation.title}</div>
                      <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                        {activeSimulation.summary}
                      </div>
                    </div>
                    {!controlSpecs.some((control) => control.type === "animate") && (
                      <div className="rounded-2xl border p-4 text-xs leading-5" style={{ borderColor: C.border, background: C.surface, color: C.muted }}>
                        This workbench is a static analysis setup, so there is no Play button here. Use <span style={{ color: C.text, fontWeight: 700 }}>Run</span> once, then adjust the sliders to refresh the model.
                      </div>
                    )}
                    {selectedSimElementSliderControls.length > 0 && (
                      <div
                        className={`rounded-2xl border p-4 ${selectedControlsHighlight.className}`}
                        style={{ borderColor: C.border, background: C.surface, ...selectedControlsHighlight.style }}
                      >
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                          Selected Part Controls
                        </div>
                        <div className="text-[11px] leading-5" style={{ color: C.muted }}>
                          Slider-ready properties from the selected simulation object appear here automatically.
                        </div>
                      </div>
                    )}
                    {controlSpecs.map((control) => {
                      const currentValue = Object.prototype.hasOwnProperty.call(controlValues, control.name)
                        ? Number(controlValues[control.name])
                        : control.value;
                      return (
                        <div key={control.name} className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-mono text-sm font-semibold">{control.name}</div>
                              <div className="text-[11px]" style={{ color: C.muted }}>
                                {control.type === "animate" ? "Animated driver" : "Interactive input"}
                              </div>
                            </div>
                            <div className="text-xs font-semibold" style={{ color: C.blue }}>
                              {Number(currentValue).toFixed(3).replace(/\.?0+$/, "")}
                            </div>
                          </div>
                          <input
                            type="range"
                            min={control.min}
                            max={control.max}
                            step={control.step || 0.01}
                            value={currentValue}
                            onChange={(event) => updateControlValue(control.name, event.target.value)}
                            className="w-full accent-sky-500"
                          />
                          <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: C.muted }}>
                            <span>{control.min}</span>
                            <span>step {control.step}</span>
                            <span>{control.max}</span>
                          </div>
                          {control.type === "animate" && (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleAnimatedControl(control.name)}
                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${activeInteractiveTourTarget === "tour-play" ? "animate-pulse" : ""}`}
                                style={{
                                  borderColor: controlPlayback[control.name]?.playing ? C.blue : C.border,
                                  background: C.surface2,
                                  color: controlPlayback[control.name]?.playing ? C.blue : C.text,
                                  ...(activeInteractiveTourTarget === "tour-play"
                                    ? {
                                        borderColor: C.blue,
                                        boxShadow: `0 0 0 2px rgba(99, 184, 255, 0.45), 0 0 28px rgba(99, 184, 255, 0.2)`,
                                      }
                                    : {}),
                                }}
                              >
                                {controlPlayback[control.name]?.playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                {controlPlayback[control.name]?.playing ? "Pause" : "Play"}
                              </button>
                              <button
                                type="button"
                                onClick={() => resetAnimatedControl(control.name)}
                                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold"
                                style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                              >
                                <RefreshCw className="h-3 w-3" />
                                Reset
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {selectedSimElementSliderControls.map((control) => {
                      const currentValue = Number(getSimulationPropertyValue(selectedSimElement, control.field) || 0);
                      return (
                        <div key={`${selectedSimElement?.id}-${control.field}`} className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-mono text-sm font-semibold">{control.label}</div>
                              <div className="text-[11px]" style={{ color: C.muted }}>
                                {getSimulationRoleMeta(selectedSimElement?.role).label} property
                              </div>
                            </div>
                            <div className="text-xs font-semibold" style={{ color: C.blue }}>
                              {Number(currentValue).toFixed(3).replace(/\.?0+$/, "")}
                            </div>
                          </div>
                          <input
                            type="range"
                            min={control.min}
                            max={control.max}
                            step={control.step || 0.01}
                            value={currentValue}
                            onChange={(event) => updateSelectedSimulationSliderValue(control.field, event.target.value, control)}
                            className="w-full accent-sky-500"
                          />
                          <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: C.muted }}>
                            <span>{control.min}</span>
                            <span>step {control.step}</span>
                            <span>{control.max}</span>
                          </div>
                        </div>
                      );
                    })}
                    {!controlSpecs.length && !selectedSimElementSliderControls.length && (
                      <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: C.border, background: C.surface, color: C.muted }}>
                        Run the current model to populate interactive parameters.
                      </div>
                    )}
                  </div>
                )}

                {simRightTab === "results" && (
                  <div className="grid gap-2">
                    {simulationMetricCards.length ? simulationMetricCards.map((item) => (
                      <div key={item.name} className="rounded-2xl border px-3 py-3" style={{ borderColor: C.border, background: C.surface }}>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.hint }}>
                          {item.name}
                        </div>
                        <div className="mt-1 text-sm font-semibold">{item.preview}</div>
                        <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                          {item.className} • {item.size[0]}×{item.size[1]}
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: C.border, background: C.surface, color: C.muted }}>
                        Run the model to populate result cards.
                      </div>
                    )}
                  </div>
                )}

                {simRightTab === "assembly" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                        Constraint Summary
                      </div>
                      <div className="grid gap-2">
                        {[
                          `${activeConstraints.length} saved constraint${activeConstraints.length === 1 ? "" : "s"}`,
                          `${derivedMechanicalModel.summary.supportCount} supports / anchors`,
                          `${derivedMechanicalModel.summary.springCount} springs`,
                        ].map((item) => (
                          <div key={item} className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                        Constraints
                      </div>
                      <div className="mb-3 text-[11px] leading-5" style={{ color: C.muted }}>
                        Mates created from attachment points are stored here as assembly relationships for this workbench.
                      </div>
                      {activeConstraints.length ? (
                        <div className="grid gap-2">
                          {activeConstraints.map((constraint) => (
                            <div key={constraint.id} className="rounded-xl border px-3 py-3" style={{ borderColor: C.border, background: C.surface2 }}>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold" style={{ color: C.text }}>
                                    {describeConstraint(constraint, liveSimElements)}
                                  </div>
                                  <div className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>
                                    {`${constraint.sourceAttachmentId} -> ${constraint.targetAttachmentId}`}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteConstraint(constraint.id)}
                                  className="rounded-lg border px-2.5 py-1 text-xs font-semibold"
                                  style={{ borderColor: C.border, background: C.surface, color: C.text }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border px-3 py-3 text-sm leading-6" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                          Select a part, choose an attachment point, then use <span style={{ color: C.text, fontWeight: 700 }}>Start Mate</span> to create a saved assembly constraint.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {simRightTab === "console" && (
                  <div className="flex h-full min-h-[420px] flex-col gap-3">
                    <div className="rounded-2xl border p-3" style={{ borderColor: C.border, background: C.surface }}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                          Command bridge
                        </div>
                        <button
                          type="button"
                          onClick={insertLastCommandIntoScript}
                          disabled={!lastConsoleCommand}
                          className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: lastConsoleCommand ? C.text : C.hint, opacity: lastConsoleCommand ? 1 : 0.55 }}
                        >
                          Promote to Script
                        </button>
                      </div>
                      <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap text-xs leading-6" style={{ color: C.text }}>
                        {output || "Run the lab or issue a console command to inspect the current workspace."}
                      </pre>
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      <input
                        ref={consoleInputRef}
                        value={commandInput}
                        onChange={(event) => {
                          setCommandInput(event.target.value);
                          setCommandHistoryIndex(-1);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            runConsoleCommand();
                          }
                        }}
                        placeholder="Type a one-line command, for example: theta"
                        className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
                        style={{ borderColor: C.border, background: C.surface, color: C.text }}
                      />
                      <button
                        type="button"
                        onClick={runConsoleCommand}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, #0f8d85, #1769d1)" }}
                      >
                        <Play className="h-4 w-4" />
                        Run
                      </button>
                    </div>
                  </div>
                )}

                {simRightTab === "workspace" && (
                  <div className="grid gap-2">
                    {displayWorkspaceItems.length ? displayWorkspaceItems.map((item) => (
                      <div key={item.name} className="rounded-2xl border p-3" style={{ borderColor: C.border, background: C.surface }}>
                        <div className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: C.hint }}>
                          {item.name}
                        </div>
                        <div className="mt-1 text-sm font-semibold">{item.preview}</div>
                        <div className="mt-2 text-[11px]" style={{ color: C.muted }}>
                          {item.className} • {item.size[0]}×{item.size[1]} • {item.bytes} bytes
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: C.border, background: C.surface, color: C.muted }}>
                        Run the current model to populate the workspace.
                      </div>
                    )}
                  </div>
                )}

                {simRightTab === "properties" && (
                  <div className="grid gap-3">
                    {selectedSimElement ? (
                      <>
                        <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold">{selectedSimElement.name}</div>
                              <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                                {getSimulationRoleMeta(selectedSimElement.role).label} • {selectedSimElement.type}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={deleteSelectedSimulationElement}
                              className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                              style={{ borderColor: C.border, background: C.surface2, color: C.red }}
                            >
                              Delete
                            </button>
                          </div>

                          <div className="mb-3 grid gap-2">
                            {["rod", "spring", "mass", "anchor", "support", "force"].map((role) => {
                              const meta = getSimulationRoleMeta(role);
                              return (
                              <OpenMatTooltip key={role} content={`${meta.label}: ${meta.description}`} fullWidth>
                                <button
                                  type="button"
                                  onClick={() => convertSelectedSimulationElement(role)}
                                  className="w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold capitalize"
                                  style={{
                                    borderColor: selectedSimElement.role === role ? C.blue : C.border,
                                    background: selectedSimElement.role === role ? C.surface2 : C.surface,
                                    color: selectedSimElement.role === role ? C.blue : C.text,
                                  }}
                                >
                                  <div>{meta.label}</div>
                                  <div className="mt-1 text-[11px] font-normal normal-case" style={{ color: selectedSimElement.role === role ? C.blue : C.muted }}>
                                    {meta.description}
                                  </div>
                                </button>
                              </OpenMatTooltip>
                            )})}
                          </div>

                          {selectedSimElement.source?.kind === "scratch" && (
                            <div className="mb-3 rounded-xl border px-3 py-2 text-xs leading-5" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                              Linked to ScratchPad geometry #{selectedSimElement.source.shapeId}. Shape edits there can sync back into this scene.
                            </div>
                          )}

                          <OpenMatTooltip content="Open ScratchPad, edit or select one shape, then send it back to replace the currently selected scene part." fullWidth>
                            <button
                              type="button"
                              onClick={openScratchGeometryTool}
                              className="mb-3 w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold"
                              style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                            >
                              Replace This Part From ScratchPad
                            </button>
                          </OpenMatTooltip>
                          <div className="mb-3 text-[11px] leading-5" style={{ color: C.muted }}>
                            Select a scene part first, open ScratchPad, choose one shape, then send it back to replace this part.
                          </div>

                          <div className="grid gap-2">
                            <div className="grid gap-2 md:grid-cols-2">
                              {selectedSimElementPropertySchema.map((field) => (
                                <div
                                  key={field.field}
                                  className={field.type === "text" ? "grid gap-1 md:col-span-2" : "grid gap-1"}
                                >
                                  <label className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.hint }}>
                                    {field.label}
                                  </label>
                                  <input
                                    type={field.type === "text" ? "text" : "number"}
                                    min={field.type === "number" ? field.min : undefined}
                                    max={field.type === "number" ? field.max : undefined}
                                    step={field.type === "number" ? field.step : undefined}
                                    value={getSimulationPropertyValue(selectedSimElement, field.field)}
                                    onChange={(event) => updateSelectedSimulationElement(field.field, event.target.value)}
                                    className="rounded-xl border px-3 py-2 text-sm outline-none"
                                    style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                                  />
                                </div>
                              ))}
                            </div>

                            {selectedSimElement.type === "polygon" && (
                              <div className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                                Polygon vertices are edited directly in the viewport by dragging attachment points.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                            Attachment points
                          </div>
                          <div className="mb-3 text-[11px] leading-5" style={{ color: C.muted }}>
                            Pick a point on this part, then either create a free joint marker or start a Mate to snap that point onto another part.
                          </div>
                          <div className="grid gap-2">
                            {getSimElementAttachmentPoints(selectedSimElement).map((point) => {
                              const active = selectedAttachmentId === point.id;
                              return (
                                <button
                                  key={point.id}
                                  type="button"
                                  onClick={() => setSelectedAttachmentId(point.id)}
                                  className="rounded-xl border px-3 py-2 text-left"
                                  style={{ borderColor: active ? C.blue : C.border, background: active ? C.surface2 : C.surface, color: C.text }}
                                >
                                  <div className="text-sm font-semibold">{point.label}</div>
                                  <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                                    ({point.x.toFixed(1)}, {point.y.toFixed(1)})
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {pendingMateSource ? (
                            <div className="mt-3 rounded-xl border px-3 py-3 text-sm" style={{ borderColor: C.teal, background: C.surface2, color: C.text }}>
                              <div className="font-semibold">Mate mode active</div>
                              <div className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>
                                Click an attachment point on another part in the viewport to snap this point into place.
                              </div>
                              <button
                                type="button"
                                onClick={cancelPendingMate}
                                className="mt-3 w-full rounded-xl border px-3 py-2 text-sm font-semibold"
                                style={{ borderColor: C.border, background: C.surface, color: C.text }}
                              >
                                Cancel Mate
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3 grid gap-2">
                              <OpenMatTooltip content="Start an assembly-style mate. After clicking this, pick an attachment point on another part to snap the selected point there." fullWidth>
                                <button
                                  type="button"
                                  onClick={beginMateFromSelectedAttachment}
                                  disabled={!selectedAttachment}
                                  className="w-full rounded-xl border px-3 py-2 text-sm font-semibold"
                                  style={{ borderColor: C.border, background: C.surface2, color: selectedAttachment ? C.text : C.hint, opacity: selectedAttachment ? 1 : 0.55 }}
                                >
                                  Start Mate From Selected Point
                                </button>
                              </OpenMatTooltip>
                              <OpenMatTooltip content="Drop a free joint marker at the selected point so you can use it as a visible pivot or reference point." fullWidth>
                                <button
                                  type="button"
                                  onClick={createJointFromAttachment}
                                  disabled={!selectedAttachment}
                                  className="w-full rounded-xl border px-3 py-2 text-sm font-semibold"
                                  style={{ borderColor: C.border, background: C.surface2, color: selectedAttachment ? C.text : C.hint, opacity: selectedAttachment ? 1 : 0.55 }}
                                >
                                  Create Joint Marker From Selected Point
                                </button>
                              </OpenMatTooltip>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: C.border, background: C.surface, color: C.muted }}>
                        <div className="font-semibold" style={{ color: C.text }}>No part selected yet</div>
                        <div className="mt-2">
                          Select a scene part in the viewport or object list to rename it, change what it means physically, replace it from ScratchPad, or mate one of its points to another part.
                        </div>
                        <div className="mt-3 grid gap-2">
                          {getSimulationQuickStart(activeSimulation, controlSpecs.some((control) => control.type === "animate")).slice(1, 4).map((item) => (
                            <div key={item} className="rounded-xl border px-3 py-2 text-xs leading-5" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {simRightTab === "reference" && (
                  <div className="grid gap-3">
                    <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                        Use this workbench
                      </div>
                      <div className="grid gap-2">
                        {getSimulationQuickStart(activeSimulation, controlSpecs.some((control) => control.type === "animate")).map((item) => (
                          <div key={item} className="rounded-xl border px-3 py-2 text-xs leading-5" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    {activeLesson && activeLessonStep && (
                      <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                          Lesson
                        </div>
                        <div className="text-sm font-semibold">{activeLesson.title}</div>
                        <div className="mt-1 text-xs" style={{ color: C.muted }}>
                          Step {activeLessonStepIndex + 1} of {activeLesson.steps.length}
                        </div>
                        <div className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: C.border, background: C.surface2 }}>
                          <div className="text-sm font-semibold">{activeLessonStep.title}</div>
                          <div className="mt-1 text-xs leading-6" style={{ color: C.muted }}>
                            {activeLessonStep.body}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveLessonStep(activeLessonStepIndex - 1)}
                            disabled={activeLessonStepIndex <= 0}
                            className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                            style={{ borderColor: C.border, background: C.surface2, color: activeLessonStepIndex <= 0 ? C.hint : C.text, opacity: activeLessonStepIndex <= 0 ? 0.55 : 1 }}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveLessonStep(activeLessonStepIndex + 1)}
                            disabled={activeLessonStepIndex >= activeLesson.steps.length - 1}
                            className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                            style={{ borderColor: activeLessonStepIndex >= activeLesson.steps.length - 1 ? C.border : C.blue, background: C.surface2, color: activeLessonStepIndex >= activeLesson.steps.length - 1 ? C.hint : C.blue, opacity: activeLessonStepIndex >= activeLesson.steps.length - 1 ? 0.55 : 1 }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                        Interaction model
                      </div>
                      <div className="grid gap-2">
                        {interactionModelItems.map((item) => (
                          <div key={item} className="rounded-xl border px-3 py-2 text-xs leading-5" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border p-4" style={{ borderColor: C.border, background: C.surface }}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                        Learning prompts
                      </div>
                      <div className="grid gap-2">
                        {activeSimulation.prompts.map((item) => (
                          <div key={item} className="rounded-xl border px-3 py-2 text-xs leading-5" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex w-14 shrink-0 flex-col border-l" style={{ borderColor: C.border, background: C.surface3 }}>
            {[
              { id: "params", label: "Params", icon: Cpu },
              { id: "properties", label: "Properties", icon: Pencil },
              { id: "assembly", label: "Assembly", icon: Rows3 },
              { id: "results", label: "Results", icon: LineChart },
              { id: "console", label: "Console", icon: Rows3 },
              { id: "workspace", label: "Workspace", icon: Sigma },
              { id: "reference", label: "Reference", icon: AlertCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = simRightTab === tab.id;
              const isTourTarget = tab.id === "params" && activeInteractiveTourTarget === "tour-params";
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSimRightTab((current) => current === tab.id ? "" : tab.id)}
                  className={`m-2 inline-flex h-10 items-center justify-center rounded-xl border ${isTourTarget ? "animate-pulse" : ""}`}
                  style={{
                    borderColor: isTourTarget ? C.blue : active ? C.blue : C.border,
                    background: active ? C.surface2 : C.surface,
                    color: active || isTourTarget ? C.blue : C.muted,
                    ...(isTourTarget
                      ? {
                          boxShadow: `0 0 0 2px rgba(99, 184, 255, 0.45), 0 0 28px rgba(99, 184, 255, 0.2)`,
                        }
                      : {}),
                  }}
                  title={tab.label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {sidebarOpen && (
          <div
            className="flex w-full shrink-0 flex-col border-b lg:w-[280px] lg:border-b-0 lg:border-r"
            style={{ borderColor: C.border, background: C.surface3 }}
          >
            {workspaceMode === "script" ? (
              <div className="flex items-center gap-1 border-b px-3 py-2" style={{ borderColor: C.border }}>
                {browserTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBrowserTab(tab.id)}
                    className="rounded-md px-2.5 py-1 text-xs font-semibold"
                    style={{
                      background: browserTab === tab.id ? C.surface : "transparent",
                      color: browserTab === tab.id ? C.text : C.muted,
                      border:
                        browserTab === tab.id
                          ? `1px solid ${C.border}`
                          : "1px solid transparent",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="border-b px-3 py-3" style={{ borderColor: C.border }}>
                <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                  OpenMAT Sim
                </div>
                <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                  Guided simulation workflow built on the same OpenMAT script, console, and workspace session.
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-auto p-3">
              {workspaceMode === "sim" && (
                <div className="space-y-3">
                  <div
                    className="rounded-2xl border px-3 py-2 text-xs leading-5"
                    style={{ borderColor: C.border, background: C.surface, color: C.muted }}
                  >
                    Choose a guided model to load its lab into the shared OpenMAT session. Then use the same controls,
                    figure pane, workspace, and console to explore it.
                  </div>
                  {SIMULATION_WORKSPACES.map((simulation) => {
                    const active = activeSimulation?.id === simulation.id;
                    return (
                      <button
                        key={simulation.id}
                        type="button"
                        onClick={() => openSimulationWorkspace(simulation.id)}
                        className="block w-full rounded-2xl border px-3 py-3 text-left"
                        style={{
                          borderColor: active ? C.blue : C.border,
                          background: active ? C.surface : C.surface2,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold">{simulation.title}</div>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                            style={{ background: active ? "rgba(23, 105, 209, 0.14)" : C.surface, color: active ? C.blue : C.muted }}
                          >
                            {active ? "Active" : "Load"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                          {simulation.summary}
                        </div>
                        <div className="mt-2 text-[11px]" style={{ color: C.hint }}>
                          Controls: {simulation.controls.join(", ")}
                        </div>
                      </button>
                    );
                  })}
                  {activeSimulation && (
                    <div
                      className="rounded-2xl border p-4 text-sm leading-6"
                      style={{ borderColor: C.border, background: C.surface }}
                    >
                      <div className="mb-2 font-semibold">{activeSimulation.title} guide</div>
                      <div style={{ color: C.muted }}>{activeSimulation.summary}</div>
                      <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                        What to look for
                      </div>
                      <div className="mt-2 grid gap-2">
                        {activeSimulation.outcomes.map((item) => (
                          <div key={item} className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                        Prompts
                      </div>
                      <div className="mt-2 grid gap-2">
                        {activeSimulation.prompts.map((item) => (
                          <div key={item} className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                            {item}
                          </div>
                        ))}
                      </div>
                      {activeLesson && activeLessonStep && (
                        <>
                          <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                            Lesson step
                          </div>
                          <div className="mt-2 rounded-xl border px-3 py-3 text-xs" style={{ borderColor: C.border, background: C.surface2, color: C.muted }}>
                            <div className="font-semibold" style={{ color: C.text }}>{activeLessonStep.title}</div>
                            <div className="mt-1">{activeLessonStep.body}</div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveLessonStep(activeLessonStepIndex - 1)}
                              disabled={activeLessonStepIndex <= 0}
                              className="rounded-lg border px-3 py-1 text-[11px] font-semibold"
                              style={{ borderColor: C.border, background: C.surface, color: activeLessonStepIndex <= 0 ? C.hint : C.text, opacity: activeLessonStepIndex <= 0 ? 0.55 : 1 }}
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveLessonStep(activeLessonStepIndex + 1)}
                              disabled={activeLessonStepIndex >= activeLesson.steps.length - 1}
                              className="rounded-lg border px-3 py-1 text-[11px] font-semibold"
                              style={{ borderColor: activeLessonStepIndex >= activeLesson.steps.length - 1 ? C.border : C.blue, background: C.surface, color: activeLessonStepIndex >= activeLesson.steps.length - 1 ? C.hint : C.blue, opacity: activeLessonStepIndex >= activeLesson.steps.length - 1 ? 0.55 : 1 }}
                            >
                              Next
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {workspaceMode === "script" && browserTab === "examples" && (
                <div className="space-y-3">
                  <div
                    className="rounded-2xl border px-3 py-2 text-xs leading-5"
                    style={{ borderColor: C.border, background: C.surface, color: C.muted }}
                  >
                    Examples open in a new script tab so your current work stays intact. `Restore`
                    brings back the last session snapshot after resets, imports, or accidental closes.
                  </div>
                  {EXAMPLES.map((example) => {
                    const Icon = example.icon;
                    return (
                      <button
                        key={example.id}
                        type="button"
                        onClick={() => loadExample(example.id)}
                        className="flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left"
                        style={{ borderColor: C.border, background: C.surface }}
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: "rgba(23, 105, 209, 0.12)" }}
                        >
                          <Icon className="h-4 w-4" style={{ color: C.blue }} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{example.label}</div>
                          <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                            {example.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {workspaceMode === "script" && browserTab === "functions" && (
                <div className="grid gap-2">
                  {referenceItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border px-3 py-2 text-xs font-mono"
                      style={{ borderColor: C.border, background: C.surface }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {workspaceMode === "script" && browserTab === "notes" && (
                <div
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 font-semibold">Roadmap</div>
                  <div style={{ color: C.muted }}>
                    The next MATLAB-like upgrades should focus on workflow: multi-file tabs,
                    subplot layouts, surface commands backed by the app&apos;s 3D grapher, and
                    more numeric helpers such as interpolation and integration tools.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b px-3 py-2" style={{ borderColor: C.border }}>
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex min-w-0 items-end gap-1 overflow-x-auto pb-1">
                {documents.map((document) => {
                  const active = document.id === activeDocument?.id;
                  return (
                    <div
                      key={document.id}
                      className="flex items-center"
                    >
                      <button
                        type="button"
                        onClick={() => switchDocument(document.id)}
                        onMouseDown={(event) => {
                          if (event.button === 1) {
                            event.preventDefault();
                            closeDocument(document.id);
                          }
                        }}
                        onDoubleClick={() => {
                          if (document.id === activeDocument?.id) renameActiveDocument();
                        }}
                        className="inline-flex items-center gap-2 rounded-t-lg border border-b-0 px-3 py-1.5 pr-2 text-xs font-semibold"
                        style={{
                          background: active ? C.surface : C.surface2,
                          borderColor: C.border,
                          color: active ? C.text : C.muted,
                          transition: "background-color 140ms ease, color 140ms ease, border-color 140ms ease",
                        }}
                        title={document.name}
                        onMouseEnter={(event) => {
                          if (document.id !== activeDocument?.id) {
                            event.currentTarget.style.background = C.surface;
                            event.currentTarget.style.color = C.text;
                          }
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background =
                            document.id === activeDocument?.id ? C.surface : C.surface2;
                          event.currentTarget.style.color =
                            document.id === activeDocument?.id ? C.text : C.muted;
                        }}
                      >
                        <span className={crowdedTabs ? "max-w-[74px] truncate" : "max-w-[116px] truncate"}>
                          {compactDocumentLabel(document.name, crowdedTabs)}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            closeDocument(document.id);
                          }}
                          onMouseDown={(event) => {
                            event.stopPropagation();
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              closeDocument(document.id);
                            }
                          }}
                          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-[11px]"
                          style={{
                            color: C.muted,
                            transition: "background-color 140ms ease, color 140ms ease",
                          }}
                          title={`Close ${document.name}`}
                          aria-label={`Close ${document.name}`}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background = "rgba(220, 38, 38, 0.14)";
                            event.currentTarget.style.color = "#f87171";
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background = "transparent";
                            event.currentTarget.style.color = C.muted;
                          }}
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={createNewDocument}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold"
                style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                title="New script tab"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="text-[11px]" style={{ color: C.muted }}>
              Cmd/Ctrl + Enter to run
            </div>
          </div>

          <div className="min-h-0 min-w-0 flex-1 p-2 md:p-3">
            <Editor
              height="100%"
              beforeMount={setupOpenCalcMonaco}
              defaultLanguage="openmat"
              language="openmat"
              theme={C.isDark ? "openmat-dark" : "openmat-light"}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 22,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
              }}
              onMount={(editor, monaco) => {
                monacoRef.current = monaco;
                monaco.editor.setTheme(C.isDark ? "openmat-dark" : "openmat-light");
                editor.addCommand(1024 | 3, () => {
                  runCode();
                });
              }}
            />
          </div>
        </div>

        <div
          className="hidden w-2 shrink-0 cursor-ew-resize border-l border-r lg:flex lg:items-center lg:justify-center"
          style={{ borderColor: C.border, background: C.surface3 }}
          onMouseDown={(event) => {
            event.preventDefault();
            setIsResizingRightPane(true);
          }}
          title="Drag to resize workspace pane"
        >
          <div
            className="h-12 w-1 rounded-full"
            style={{ background: C.border }}
          />
        </div>

        <div
          className="flex w-full min-w-0 shrink-0 flex-col border-t lg:border-t-0"
          style={{
            borderColor: C.border,
            background: C.surface2,
            width: rightPaneCssWidth,
          }}
        >
          <div
            className="flex items-center gap-1 border-b px-3 py-2"
            style={{ borderColor: C.border }}
          >
            {workspaceTabs.map((tab) => {
              const Icon = tab.icon;
              const active = workspaceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setWorkspaceTab(tab.id)}
                  className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold"
                  style={{
                    background: active ? C.surface : "transparent",
                    color: active ? C.text : C.muted,
                    border: active ? `1px solid ${C.border}` : "1px solid transparent",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-3">
            {workspaceTab === "plot" && (
              <div className="space-y-3">
                {workspaceMode === "sim" && activeSimulation && (
                  <div
                    className="rounded-2xl border p-3"
                    style={{ borderColor: C.border, background: C.surface }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                          Simulation Workbench
                        </div>
                        <div className="mt-1 text-sm font-semibold">{activeSimulation.title}</div>
                        <div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>
                          {activeSimulation.summary}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openSimulationWorkspace(activeSimulation.id)}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                        style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                      >
                        Load Guided Lab
                      </button>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      {activeSimulation.outcomes.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border px-3 py-2 text-xs"
                          style={{ borderColor: C.border, background: C.surface2, color: C.muted }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div
                  className="rounded-2xl border p-3"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                    Figure
                  </div>
                  {displayFigureJson || surfaceConfig ? (
                    <>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPlotPanelMode((current) => {
                              const next = current === "focus" ? "pane" : "focus";
                              if (next === "focus") setSidebarOpen(false);
                              return next;
                            });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{ borderColor: isPlotFocused ? C.blue : C.border, background: C.surface2, color: isPlotFocused ? C.blue : C.text }}
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                          {isPlotFocused ? "Exit Focus" : "Focus Plot"}
                        </button>
                        {surfaceConfig && (
                          <button
                            type="button"
                            onClick={() => setPlotKind((current) => current === "3d" ? "2d" : "3d")}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                            style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                          >
                            {plotKind === "3d" ? "Show 2D" : "Show 3D"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setFigureJson((current) => scaleFigureBounds(current, 0.8))}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                          Zoom In
                        </button>
                        <button
                          type="button"
                          onClick={() => setFigureJson((current) => scaleFigureBounds(current, 1.25))}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                        >
                          <ZoomOut className="h-3.5 w-3.5" />
                          Zoom Out
                        </button>
                        <button
                          type="button"
                          onClick={() => setFigureJson(baseFigureJson)}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                        >
                          <Scan className="h-3.5 w-3.5" />
                          Reset View
                        </button>
                        <button
                          type="button"
                          onClick={() => setFigureJson((current) => toggleFigureGrid(current))}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{
                            borderColor: figureMeta.hasGrid ? C.blue : C.border,
                            background: figureMeta.hasGrid ? C.surface : C.surface2,
                            color: figureMeta.hasGrid ? C.blue : C.text,
                          }}
                        >
                          <Grid3X3 className="h-3.5 w-3.5" />
                          Grid
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPlotWindowOpen(true)}
                          disabled={!displayFigureJson}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
                          style={{ borderColor: C.border, background: C.surface2, color: C.text, opacity: displayFigureJson ? 1 : 0.5 }}
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                          Full Screen
                        </button>
                      </div>
                      <div className="mb-2 flex items-center justify-between gap-3 text-[11px]" style={{ color: C.muted }}>
                        <span>{plotKind === "3d" ? "Surface viewport" : `Axis mode: ${figureMeta.axisMode}`}</span>
                        <span>{plotKind === "3d" ? "Use `surf` or `mesh` to populate the local 3D view." : "Use `axis equal`, `axis tight`, `xlim`, and `ylim` in scripts."}</span>
                      </div>
                      {plotKind === "3d" && surfaceConfig ? (
                        <div className="h-[540px] overflow-hidden rounded-2xl border" style={{ borderColor: C.border }}>
                          <GlobalGrapher3D
                            embedded
                            isOpen
                            launchConfig={surfaceConfig}
                            onClose={() => {
                              setSurfaceConfig(null);
                              setPlotKind("2d");
                            }}
                            onSwitchTo2D={() => setPlotKind("2d")}
                            onSwitchToJSX={() => openGrapher({ mode: "pro" })}
                          />
                        </div>
                      ) : renderOpenMatFigure(displayFigureJson, C)}
                      {controlSpecs.length > 0 && (
                        <div
                          className="mt-4 rounded-2xl border p-3"
                          style={{ borderColor: C.border, background: C.surface2 }}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                              Controls
                            </div>
                            <div className="text-[11px]" style={{ color: C.muted }}>
                              Slider changes rerun the script.
                            </div>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            {controlSpecs.map((control) => {
                              const currentValue = Object.prototype.hasOwnProperty.call(controlValues, control.name)
                                ? Number(controlValues[control.name])
                                : control.value;
                              return (
                                <div
                                  key={control.name}
                                  className="rounded-xl border px-3 py-3"
                                  style={{ borderColor: C.border, background: C.surface }}
                                >
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <div>
                                      <span className="font-mono text-sm font-semibold">{control.name}</span>
                                      <div className="text-[11px]" style={{ color: C.muted }}>
                                        {control.type === "animate" ? "Animated parameter" : "Interactive parameter"}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {control.type === "animate" && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => toggleAnimatedControl(control.name)}
                                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold"
                                            style={{
                                              borderColor: controlPlayback[control.name]?.playing ? C.blue : C.border,
                                              background: C.surface2,
                                              color: controlPlayback[control.name]?.playing ? C.blue : C.text,
                                            }}
                                          >
                                            {controlPlayback[control.name]?.playing ? (
                                              <Pause className="h-3 w-3" />
                                            ) : (
                                              <Play className="h-3 w-3" />
                                            )}
                                            {controlPlayback[control.name]?.playing ? "Pause" : "Play"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => resetAnimatedControl(control.name)}
                                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold"
                                            style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                                          >
                                            <RefreshCw className="h-3 w-3" />
                                            Reset
                                          </button>
                                        </>
                                      )}
                                      <input
                                        type="number"
                                        value={currentValue}
                                        min={control.min}
                                        max={control.max}
                                        step={control.step}
                                        onChange={(event) => updateControlValue(control.name, event.target.value)}
                                        className="w-24 rounded-md border px-2 py-1 text-xs"
                                        style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                                      />
                                    </div>
                                  </div>
                                  <input
                                    type="range"
                                    min={control.min}
                                    max={control.max}
                                    step={control.step}
                                    value={currentValue}
                                    onChange={(event) => updateControlValue(control.name, event.target.value)}
                                    className="w-full accent-cyan-500"
                                  />
                                  <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: C.muted }}>
                                    <span>{control.min}</span>
                                    <span>
                                      step {control.step}
                                      {control.type === "animate" ? ` • speed ${control.speed || 1}x` : ""}
                                    </span>
                                    <span>{control.max}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      className="rounded-xl border px-3 py-10 text-center text-sm"
                      style={{ borderColor: C.border, color: C.muted }}
                    >
                      Run a script with `plot`, `stem`, `area`, `scatter`, or `bar` to render a figure here.
                    </div>
                  )}
                </div>
                {surfaceConfig && (
                  <button
                    type="button"
                    onClick={() => openGrapher(surfaceConfig)}
                    className="w-full rounded-xl border px-3 py-2 text-sm font-semibold"
                    style={{ borderColor: C.border, background: C.surface, color: C.text }}
                  >
                    Open Separate 3D Window
                  </button>
                )}
              </div>
            )}

              {workspaceTab === "console" && (
                <div
                  ref={outputRef}
                  className="grid min-h-[220px] gap-3 rounded-2xl border p-4"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{ color: C.hint }}
                    >
                      Command Window
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={insertLastCommandIntoScript}
                        disabled={!lastConsoleCommand}
                        className="rounded-md border px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          borderColor: C.border,
                          background: C.surface2,
                          color: lastConsoleCommand ? C.text : C.hint,
                          opacity: lastConsoleCommand ? 1 : 0.55,
                        }}
                        title="Append the last console command to the active script"
                      >
                        Promote to Script
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCommandInput("");
                          setCommandHistoryIndex(-1);
                          consoleInputRef.current?.focus();
                        }}
                        className="rounded-md border px-2.5 py-1 text-[11px] font-semibold"
                        style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                      >
                        Clear Input
                      </button>
                    </div>
                  </div>
                  <div
                    className="rounded-xl border px-3 py-3"
                    style={{ borderColor: C.border, background: C.surface3 }}
                  >
                    <label
                      htmlFor="openmat-command-input"
                      className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: C.hint }}
                    >
                      Command
                    </label>
                    <div className="flex items-center gap-2">
                      <span
                        className="shrink-0 text-sm font-semibold"
                        style={{ color: C.blue }}
                      >
                        &gt;&gt;
                      </span>
                      <input
                        id="openmat-command-input"
                        ref={consoleInputRef}
                        type="text"
                        value={commandInput}
                        onChange={(event) => {
                          setCommandInput(event.target.value);
                          setCommandHistoryIndex(-1);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            runConsoleCommand();
                            return;
                          }
                          if (event.key === "ArrowUp") {
                            if (!commandHistory.length) return;
                            event.preventDefault();
                            const nextIndex =
                              commandHistoryIndex < 0
                                ? commandHistory.length - 1
                                : Math.max(0, commandHistoryIndex - 1);
                            setCommandHistoryIndex(nextIndex);
                            setCommandInput(commandHistory[nextIndex] || "");
                            return;
                          }
                          if (event.key === "ArrowDown") {
                            if (!commandHistory.length) return;
                            event.preventDefault();
                            if (commandHistoryIndex < 0) return;
                            const nextIndex = commandHistoryIndex + 1;
                            if (nextIndex >= commandHistory.length) {
                              setCommandHistoryIndex(-1);
                              setCommandInput("");
                              return;
                            }
                            setCommandHistoryIndex(nextIndex);
                            setCommandInput(commandHistory[nextIndex] || "");
                          }
                        }}
                        placeholder="Try: x = 0:0.1:10"
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                        style={{ color: C.text }}
                      />
                      <button
                        type="button"
                        onClick={runConsoleCommand}
                        disabled={running || !commandInput.trim()}
                        className="rounded-md px-3 py-1.5 text-xs font-semibold"
                        style={{
                          background: running || !commandInput.trim() ? C.surface2 : C.blue,
                          color: running || !commandInput.trim() ? C.hint : "#06121f",
                          opacity: running || !commandInput.trim() ? 0.7 : 1,
                        }}
                      >
                        Run
                      </button>
                    </div>
                    <div className="mt-2 text-[11px]" style={{ color: C.muted }}>
                      Up/Down recalls command history. Commands run against the current workspace without changing the file.
                    </div>
                  </div>
                  <div
                    className="rounded-xl border p-3"
                    style={{ borderColor: C.border, background: C.surface2 }}
                  >
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                      Session State
                    </div>
                    <div className="grid gap-1 text-xs" style={{ color: C.muted }}>
                      {sessionSummary.map((item) => (
                        <div key={item}>{item}</div>
                      ))}
                      <div>
                        Workspace context: {hasWorkspaceContext ? "ready for console commands" : "run a script first"}
                      </div>
                    </div>
                  </div>
                  {commandHistory.length > 0 && (
                    <div
                      className="rounded-xl border p-3"
                      style={{ borderColor: C.border, background: C.surface2 }}
                    >
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                        Recent Commands
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {commandHistory.slice(-8).reverse().map((entry, index) => (
                          <button
                            key={`${entry}-${index}`}
                            type="button"
                            onClick={() => {
                              setCommandInput(entry);
                              setCommandHistoryIndex(-1);
                              consoleInputRef.current?.focus();
                            }}
                            className="rounded-md border px-2.5 py-1 text-left text-[11px] font-mono"
                            style={{ borderColor: C.border, background: C.surface, color: C.text }}
                            title={entry}
                          >
                            {entry.length > 36 ? `${entry.slice(0, 33)}...` : entry}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <pre
                    className="whitespace-pre-wrap break-words text-sm leading-6"
                    style={{ color: output.startsWith("Error:") ? C.red : C.text }}
                  >
                    {output || "Run a script to see matrix output, variables, or plots here."}
                  </pre>
                </div>
              )}

            {workspaceTab === "workspace" && (
              <div className="grid gap-3">
                <div
                  className="rounded-2xl border p-3"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                    Workspace
                  </div>
                  {displayWorkspaceItems.length ? (
                    <div className="space-y-2">
                      {displayWorkspaceItems.map((item) => {
                        const active = selectedVariable?.name === item.name;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setSelectedVariable(item)}
                            className="block w-full rounded-xl border px-3 py-2 text-left"
                            style={{
                              borderColor: active ? C.blue : C.border,
                              background: active ? C.surface2 : C.surface,
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-mono text-sm font-semibold">{item.name}</span>
                              <span className="text-[11px]" style={{ color: C.muted }}>
                                {item.size.join("x")}
                              </span>
                            </div>
                            <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                              {item.className} • {item.bytes} bytes
                            </div>
                            <div className="mt-1 text-xs" style={{ color: C.text }}>
                              {item.preview}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border px-3 py-6 text-center text-sm" style={{ borderColor: C.border, color: C.muted }}>
                      Run a script to populate the workspace browser.
                    </div>
                  )}
                </div>

                {selectedVariable && (
                  <div
                    className="rounded-2xl border p-3"
                    style={{ borderColor: C.border, background: C.surface }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="font-mono text-sm font-semibold">{selectedVariable.name}</div>
                      <div className="text-[11px]" style={{ color: C.muted }}>
                        {selectedVariable.className}
                      </div>
                    </div>
                    <div className="mb-2 text-[11px]" style={{ color: C.muted }}>
                      Size {selectedVariable.size.join(" x ")} • {selectedVariable.bytes} bytes
                    </div>
                    <pre
                      className="max-h-[240px] overflow-auto rounded-xl border p-3 text-xs leading-6"
                      style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                    >
                      {formatValue(selectedVariable.value)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {workspaceTab === "reference" && (
              <div className="space-y-3">
                <div
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-3 font-semibold">Interaction Model</div>
                  <div className="grid gap-2">
                    {interactionModelItems.map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border px-3 py-2"
                        style={{ borderColor: C.border, background: C.surface2, color: C.muted }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-3 font-semibold">Supported features</div>
                  <div className="grid gap-2">
                    {[
                      "A = [1 2; 3 4]",
                      "x = A \\\\ b",
                      "A' transpose",
                      "x = 0:0.1:2*pi",
                      "x(1:5) indexing",
                      ".*  ./  .^",
                      "[V, D] = eig(A)",
                      "[Q, R] = qr(A)",
                      "plot / scatter / bar / stem / area",
                      "hold on / clf / legend / xlim / ylim",
                      "zeros / ones / eye / rand / meshgrid",
                      "polyfit / polyval / diff / cumsum",
                      "fft / ifft / norm / trace / diag",
                      "dot / cross / logspace",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border px-3 py-2 font-mono text-xs"
                        style={{ borderColor: C.border, background: C.surface2 }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 font-semibold">What OpenMAT Is</div>
                  <div style={{ color: C.muted }}>
                    OpenMAT is a MATLAB-like scripting layer implemented inside the browser on top of
                    a local math engine and Open Calc&apos;s figure system. It is not raw JavaScript,
                    not Python, and not full MATLAB compatibility. The user language is intentionally
                    hybrid so we can keep matrix-first syntax while staying browser-native.
                  </div>
                </div>

                <div
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 font-semibold">Current modes</div>
                  <div style={{ color: C.muted }}>
                    Script Mode is the MATLAB-like workspace for editing, running, plotting, and using the console.
                    Simulation Mode adds a guided layer for focused labs without leaving the same session.
                  </div>
                </div>

                <div
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 font-semibold">Foundation for OpenMAT Sim</div>
                  <div style={{ color: C.muted }}>
                    The next guided simulation workspace should sit on top of this same engine and
                    session model. Script Mode stays MATLAB-like, while Simulation Mode can become
                    more ANSYS-like with project trees, setup panels, solver controls, and results
                    views that still feed the same workspace, figures, and console.
                  </div>
                </div>

                <div
                  className="rounded-2xl border p-4 text-sm leading-6"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="mb-2 font-semibold">Docs To Keep Updated</div>
                  <div style={{ color: C.muted }}>
                    Keep these in sync as features land: `docs/OpenMAT.md`, the in-app Reference tab,
                    built-in `help`, and the example scripts. If a feature only exists in code, OpenMAT
                    becomes harder to learn and harder to extend.
                  </div>
                </div>

                <div
                  className="rounded-2xl border px-4 py-3 text-sm leading-6"
                  style={{
                    borderColor: "rgba(178, 106, 0, 0.22)",
                    background: "rgba(178, 106, 0, 0.08)",
                    color: C.text,
                  }}
                >
                  <div className="mb-1 flex items-center gap-2 font-semibold" style={{ color: C.amber }}>
                    <AlertCircle className="h-4 w-4" />
                    Current limitation
                  </div>
                  This is already strong for matrix algebra, plotting, and classroom-style labs,
                  but it is still not full MATLAB yet. The next leap is desktop workflow polish:
                  multi-document tabs, richer subplot layouts, and deeper integration with the
                  app&apos;s 3D and symbolic tooling.
                </div>
              </div>
            )}

            {workspaceTab === "normalized" && (
              <pre
                className="max-h-full overflow-auto rounded-2xl border p-4 text-xs leading-6"
                style={{ borderColor: C.border, background: C.surface, color: C.text }}
              >
                {normalizedPreview || "Run a script to inspect the normalized form."}
              </pre>
            )}
          </div>
        </div>
      </div>
      )}

      {helpOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-stretch justify-end bg-slate-950/55 backdrop-blur-[2px]"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-[900px] flex-col border-l shadow-2xl"
            style={{ borderColor: C.border, background: C.surface3 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-center justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: C.hint }}>
                  OpenMAT Help
                </div>
                <div className="mt-1 text-sm" style={{ color: C.muted }}>
                  Rendered from <code>docs/OpenMAT.md</code> so the in-app help stays aligned with the docs.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                style={{ borderColor: C.border, background: C.surface2, color: C.text }}
                title="Close help"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-5 py-5">
              <MarkdownProse
                text={helpMarkdown}
                className="[&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 dark:[&_code]:bg-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
