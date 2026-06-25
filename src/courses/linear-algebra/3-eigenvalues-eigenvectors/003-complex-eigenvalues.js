import complexEigenvaluePlaneUrl from '../diagrams/la-complex-eigenvalue-plane.svg?url'

export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la3-003',
  slug: 'complex-eigenvalues',
  chapter: 'la3',
  order: 3,
  title: 'Complex Eigenvalues',
  subtitle: 'When a matrix rotates space, real eigenvectors vanish — and algebra forces us into complex numbers that beautifully encode both rotation and scaling.',
  tags: ['complex eigenvalues', 'rotation matrix', 'conjugate pairs', 'spiral', 'imaginary numbers', 'polar form', 'dynamical systems'],
  aliases: 'complex eigenvalues imaginary rotation spiral conjugate pair polar form oscillation dynamical systems',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "A 90-degree rotation matrix spins every single vector off its original line. According to our definition, it has no eigenvectors. So why does the characteristic equation still have solutions?",
    realWorldContext: "Complex eigenvalues are the mathematical fingerprint of oscillation and rotation. Electrical engineers see them in AC circuits (where current oscillates). Mechanical engineers see them when analyzing vibrations and resonance. The roots of a feedback control system's characteristic equation are eigenvalues — complex roots mean the system oscillates, real roots mean it decays steadily. Even the stability of an aircraft autopilot is determined by whether its system matrix has complex eigenvalues and how large their real parts are. Understanding complex eigenvalues means understanding any system that oscillates, spirals, or rotates.",
    previewVisualizationId: 'LALesson10_ComplexEigen',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Take the rotation matrix $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ (90° counterclockwise). The characteristic equation: $\\det(A - \\lambda I) = \\lambda^2 + 1 = 0$, so $\\lambda = \\pm i$. No real solutions. Yet the algebra forced a clean answer: eigenvalue $i = 0+1\\cdot i$ has magnitude $|i| = 1$ (no scaling), angle $\\arg(i) = 90°$ (rotation by 90°). After $k$ applications of $A$: eigenvalue $i^k$ spirals around the unit circle. After 4 steps: $i^4 = 1$ — back to the start. The imaginary number $i$ is encoding the rotation you can see geometrically.',
      '**Where you are in the story:** You know how to find eigenvalues from the characteristic equation $\\det(A - \\lambda I) = 0$, and you know how to diagonalize a matrix when it has enough real eigenvectors. But what about a matrix that only rotates — like a 90° rotation? Geometrically, it pushes every single vector off its original line. There are no real eigenvectors at all.',
      'Yet the characteristic equation is a polynomial — and by the Fundamental Theorem of Algebra, every polynomial with real coefficients has roots. They might just be complex numbers. This is not a failure of linear algebra; it is algebra doing exactly what it is supposed to do.',
      'Here is the key: when a matrix has complex eigenvalues, those eigenvalues come in **conjugate pairs** $a + bi$ and $a - bi$ (for real matrices). The real part $a$ controls stretching/shrinking, and the imaginary part $b$ controls rotation.',
      'Think of the complex eigenvalue $\\lambda = a + bi$ in polar form: its **magnitude** is $r = \\sqrt{a^2 + b^2}$ (the stretch factor) and its **angle** is $\\theta = \\arctan(b/a)$ (the rotation angle). Multiplying repeatedly by $\\lambda$ spirals outward if $r > 1$, spirals inward if $r < 1$, and circles if $r = 1$.',
      'For the 90° rotation matrix, $\\lambda = i = 0 + 1\\cdot i$. The real part is 0 (no stretching), the imaginary part is 1. Magnitude = $\\sqrt{0^2+1^2} = 1$ (no scaling), angle = 90° (pure rotation). Exactly what a rotation matrix should do.',
      ] },
      { type: 'image', src: complexEigenvaluePlaneUrl,
        alt: 'A complex plane with a unit circle drawn dashed, and the eigenvalue lambda equals a plus b i plotted as a point with a vector from the origin, its angle theta and radius r labeled',
        caption: 'r = |λ| is the stretch per application, θ is the rotation per application — together they decide spiral in, circle, or spiral out.' },
      { type: 'prose', paragraphs: [
      '**Predict before reading on.** Matrix $A = \\begin{bmatrix}0.8&-0.6\\\\0.6&0.8\\end{bmatrix}$. Without computing: do you expect real or complex eigenvalues? Will repeated application spiral inward, outward, or circle? Write your prediction, then compute $\\det(A - \\lambda I)$.',
      '**Why this matters practically.** If you are analyzing a dynamical system — anything that evolves over time — the eigenvalues of its matrix tell you everything about long-term behavior: do things grow, shrink, or oscillate? Complex eigenvalues with $|\\lambda| > 1$ mean spiral growth. $|\\lambda| < 1$ means spiral decay toward equilibrium. $|\\lambda| = 1$ means perfect sustained oscillation. The eigenvalues are the system\'s fate, written in complex numbers.',
      '**CNC spindle control — when complex eigenvalues cause chatter.** A CNC spindle speed controller has a transfer function with a characteristic equation — and its roots are eigenvalues. When all roots are real and negative (continuous-time) or inside the unit circle (discrete-time), the spindle holds stable speed. When a root crosses into the right half-plane (or outside the unit circle), the controller becomes unstable and the spindle oscillates — this is **chatter**, the ringing vibration that ruins surface finish and tool life. Complex eigenvalues near the stability boundary ($|\\lambda| \\approx 1$) produce lightly-damped oscillations: the spindle "rings" but eventually settles. The frequency of the chatter ring is exactly $\\omega = \\arctan(b/a)$ radians per sample — the imaginary part of the eigenvalue.',
      '**Where this is heading:** Phase 4 moves to non-square matrices and the most powerful factorization in linear algebra: the Singular Value Decomposition (SVD), which generalizes everything you have learned about eigenvalues.',
      ] },
      { type: 'viz', id: 'LALesson10_ComplexEigen',
        title: 'Complex Eigenvalues and Spiral Behavior',
        mathBridge: 'Drag the slider from "Shear" to "Rotation." Watch the real eigenvectors vanish from the 2D plane — no arrow stays on its line after a rotation. Now enter a matrix with complex eigenvalues $a + bi$. Apply the matrix repeatedly to a starting vector. When $|\\lambda| > 1$, the vector spirals outward. When $|\\lambda| < 1$, it spirals in. When $|\\lambda| = 1$, it traces a circle. The magnitude $r = \\sqrt{a^2+b^2}$ determines the spiral direction.',
        caption: 'Complex eigenvalues encode the spiral rate and rotation angle of a transformation.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 7 — Eigenvalues & Eigenvectors',
        body: '**Previous (Lesson 2):** Diagonalization — rebuilding coordinates in the eigenvector basis.\n**This lesson:** Complex eigenvalues — what rotation looks like algebraically, and how $a + bi$ encodes spinning and scaling.\n**Next (Lesson 4):** Jordan Normal Form — what to do when a matrix cannot be diagonalized.',
      },
      {
        type: 'procedure',
        title: 'Procedure: Analyze a Matrix with Complex Eigenvalues',
        body: 'Step 1. Set up $\\det(A - \\lambda I) = 0$. If the discriminant is negative, the eigenvalues are complex.\nStep 2. Solve the quadratic (or use the quadratic formula) to get $\\lambda = a \\pm bi$.\nStep 3. Compute the magnitude $r = |\\lambda| = \\sqrt{a^2 + b^2}$.\nStep 4. Classify: $r < 1$ → stable (spirals in); $r = 1$ → neutral (orbits); $r > 1$ → unstable (spirals out).\nStep 5. Compute the rotation angle $\\theta = \\arctan(b/a)$ to determine the rotation per application.\nStep 6. Verify: trace $= 2a$ and det $= a^2 + b^2 = r^2$.',
      },
      {
        type: 'insight',
        title: 'Complex Eigenvalue Geometry',
        body: 'For $\\lambda = a + bi$:\n\n• $r = |\\lambda| = \\sqrt{a^2 + b^2}$ → stretch factor\n• $\\theta = \\arctan(b/a)$ → rotation angle per step\n\n$r > 1$: spirals outward\n$r = 1$: pure rotation (circle)\n$r < 1$: spirals inward (decays)',
      },
      {
        type: 'theorem',
        title: 'Conjugate Pairs Theorem',
        body: 'If $A$ is a real matrix and $\\lambda = a + bi$ is an eigenvalue, then $\\bar{\\lambda} = a - bi$ is also an eigenvalue.\n\nReal matrices always have complex eigenvalues in conjugate pairs.',
      },
      {
        type: 'warning',
        title: 'No Real Eigenvectors for Pure Rotations',
        body: 'A matrix that purely rotates space (no fixed directions) has no real eigenvectors. This is not a problem — it just means diagonalization over $\\mathbb{R}$ fails. Over $\\mathbb{C}$ (complex numbers), the matrix is still diagonalizable.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      '**The 90° rotation matrix.** The standard counterclockwise 90° rotation is:\n\n$A = \\begin{bmatrix}0 & -1 \\\\ 1 & 0\\end{bmatrix}$\n\nThe characteristic equation:\n\n$\\det(A - \\lambda I) = \\det\\begin{bmatrix}-\\lambda & -1 \\\\ 1 & -\\lambda\\end{bmatrix} = \\lambda^2 + 1 = 0$\n\nSolving: $\\lambda^2 = -1 \\Rightarrow \\lambda = \\pm i$. The eigenvalues are $i$ and $-i$ — a conjugate pair.',
      '**General rotation by angle $\\theta$.** The counterclockwise rotation matrix is:\n\n$R_\\theta = \\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}$\n\nIts characteristic equation is $\\lambda^2 - 2\\cos\\theta\\,\\lambda + 1 = 0$, giving:\n\n$\\lambda = \\cos\\theta \\pm i\\sin\\theta = e^{\\pm i\\theta}$\n\nThe eigenvalues are points on the unit circle at angle $\\pm\\theta$ in the complex plane. Their magnitude is always 1 — pure rotation, no scaling.',
      '**Reading off spiral behavior.** For a general $2\\times 2$ real matrix with complex eigenvalues $\\lambda = a \\pm bi$:\n\n- Magnitude: $r = |\\lambda| = \\sqrt{a^2 + b^2}$\n- Angle per application: $\\theta = \\arctan(b/a)$\n- After $k$ applications: the transformation is equivalent to scaling by $r^k$ and rotating by $k\\theta$\n\nSo $r > 1$ grows, $r < 1$ decays, $r = 1$ oscillates indefinitely.',
      '**Euler\'s formula connects everything.** Euler\'s formula states $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$. This means a complex eigenvalue $a + bi$ can be written in polar form as $re^{i\\theta}$, where $r = \\sqrt{a^2+b^2}$ and $\\theta = \\arctan(b/a)$. Repeated application of the eigenvalue is $r^n e^{in\\theta}$ — a spiral in the complex plane.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Complex Eigenvalue in Polar Form',
        body: '\\lambda = a + bi = re^{i\\theta}\n\n\\text{where} \\quad r = \\sqrt{a^2+b^2}, \\quad \\theta = \\arctan(b/a)\n\n\\lambda^k = r^k e^{ik\\theta} \\quad \\text{(spirals after k steps)}',
      },
      {
        type: 'theorem',
        title: 'Rotation Matrix Eigenvalues',
        body: '\\text{Rotation by } \\theta: \\quad \\lambda = e^{\\pm i\\theta} = \\cos\\theta \\pm i\\sin\\theta\n\n|\\lambda| = 1 \\; \\text{always (pure rotation, no scaling)}',
      },
      {
        type: 'insight',
        title: 'Stability in Dynamical Systems',
        body: 'For a system $\\mathbf{x}_{n+1} = A\\mathbf{x}_n$:\n\n• All $|\\lambda_i| < 1$ → stable (converges to origin)\n• Any $|\\lambda_i| > 1$ → unstable (blows up)\n• All $|\\lambda_i| = 1$ → neutral (oscillates forever)\n\nThis is the eigenvalue stability criterion.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Complex Eigenvalues and Stability',
        mathBridge: 'MATLAB: `eig()` returns complex eigenvalues automatically. `abs(lambda)` gives magnitude. `angle(lambda)` gives angle in radians. Plot trajectories with `plot(real(traj), imag(traj))` in the complex plane.',
        caption: 'Three cells: complex eigenvalues from eig(), rotation matrix analysis, and CNC spindle control stability check.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Complex eigenvalues with eig() — magnitude and angle',
              prose: [
                'For a rotation-scaling matrix $A = \\begin{bmatrix}a&-b\\\\b&a\\end{bmatrix}$, the eigenvalues are $\\lambda = a \\pm bi$. `eig(A)` returns these automatically as complex numbers. `real(lk)` and `imag(lk)` extract the real and imaginary parts, `abs(lk)` computes $|\\lambda| = \\sqrt{a^2+b^2}$, and `rad2deg(angle(lk))` converts the argument to degrees.',
                'The stability test `all(abs(lambda) < 1)` checks whether every eigenvalue is strictly inside the unit circle — the discrete-time stability criterion. For the matrix with $a=0.8$, $b=0.6$: $|\\lambda| = \\sqrt{0.64+0.36} = 1.0$, so this is a pure rotation with no scaling (neutral stability). Changing $a$ and $b$ while watching $|\\lambda|$ shows how slight growth or decay is introduced.',
                'Complex eigenvalues always appear in conjugate pairs for real matrices: since the characteristic polynomial has real coefficients, complex roots must come in conjugate pairs $a \\pm bi$. For each conjugate pair, `abs(lk)` and `abs(lk_conj)` are identical (same magnitude), and `angle(lk_conj) = -angle(lk)` (opposite rotation direction). The eigenvectors are also conjugates: $\\text{Re}(\\mathbf{v})$ and $\\text{Im}(\\mathbf{v})$ form a 2D "rotation plane" in which $A$ acts as rotation by $\\arg(\\lambda)$ scaled by $|\\lambda|$.',
              ],
              code: `% Matrix with complex eigenvalues (rotation + scaling)
a = 0.8; b = 0.6;
A = [a -b; b a];   % rotation by arctan(b/a) and scale by sqrt(a^2+b^2)

[V, D] = eig(A);
lambda = diag(D);

fprintf('Eigenvalues:\\n');
for k = 1:length(lambda)
    lk = lambda(k);
    fprintf('  λ%d = %.4f + %.4fi\\n', k, real(lk), imag(lk))
    fprintf('     |λ| = %.4f   angle = %.2f°\\n', abs(lk), rad2deg(angle(lk)))
end

fprintf('\\n|λ| < 1 → stable? %d\\n', all(abs(lambda) < 1))`,
            },
            {
              id: 2,
              cellTitle: 'Rotation matrix: eigenvalues trace the unit circle',
              prose: [
                'The rotation matrix $R_\\theta = \\begin{bmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{bmatrix}$ has eigenvalues $e^{\\pm i\\theta} = \\cos\\theta \\pm i\\sin\\theta$. Since $|e^{\\pm i\\theta}| = 1$ always, pure rotations are neutral — neither growing nor decaying. `real(lambda(1))` reads $\\cos\\theta$ and `abs(imag(lambda(1)))` reads $|\\sin\\theta|$.',
                'The table shows how trace $= 2\\cos\\theta$ changes as $\\theta$ varies: trace $= 2$ at $\\theta=0°$ (identity), trace $= 0$ at $\\theta=90°$ (pure quarter-turn), trace $= -2$ at $\\theta=180°$ (negation). This gives a fast check: if trace is between $-2$ and $2$, the $2\\times 2$ matrix has complex eigenvalues on the unit circle; if outside, eigenvalues are real.',
                'Rotation matrices are orthogonal ($R^T R = I$), which forces all singular values to equal 1 and all eigenvalues to satisfy $|\\lambda| = 1$ — they lie exactly on the unit circle. Computing $R_\\theta^n = R_{n\\theta}$ in eigenvalue form: $\\lambda^n = e^{in\\theta}$, so $n$ rotations by $\\theta$ = one rotation by $n\\theta$. This is the matrix-algebra form of De Moivre\'s theorem: $(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)$. The table confirms it: `trace(R^n) = 2*cos(n*theta)`.',
              ],
              code: `% Sweep rotation angle and watch eigenvalues
angles_deg = 0:30:330;

fprintf('θ         eigenvalues                  |λ|     trace\\n')
fprintf('--------------------------------------------------------\\n')
for theta_deg = angles_deg
    theta = deg2rad(theta_deg);
    R = [cos(theta) -sin(theta); sin(theta) cos(theta)];
    lambda = eig(R);
    fprintf('%3d°     %.3f Â± %.3fi        %.4f   %.4f\\n', ...
        theta_deg, real(lambda(1)), abs(imag(lambda(1))), abs(lambda(1)), trace(R))
end`,
            },
            {
              id: 3,
              cellTitle: 'CNC spindle control: stability via eigenvalue analysis',
              prose: [
                'The state matrix `A_ctrl` is derived from a discrete 2nd-order PID model at 1 kHz sampling. Its eigenvalues determine stability: if any $|\\lambda| \\geq 1$, the controller is on or beyond the stability boundary. `abs(lk)` computes each eigenvalue\'s magnitude; the code flags the controller as stable only if all magnitudes are strictly below 1.',
                'When eigenvalues are complex, `abs(angle(lk)) / (2*pi) * 1000` converts the argument to chatter frequency in Hz: an eigenvalue with argument $\\theta$ radians/sample at 1000 samples/s oscillates at $\\theta/(2\\pi) \\times 1000$ Hz. This is the predicted chatter tone if the controller becomes marginally unstable. Engineers detune $K_p$ and $K_d$ to push all eigenvalues away from the unit circle boundary while keeping the chatter frequency above the audible range.',
                'In continuous-time systems (differential equations), stability requires $\\text{Re}(\\lambda) < 0$. In discrete-time systems sampled at rate $f_s$, stability requires $|\\lambda| < 1$ — the half-plane $\\{s : \\text{Re}(s) < 0\\}$ maps to the unit disk $\\{z : |z| < 1\\}$ via $z = e^{sT}$ where $T = 1/f_s = 1/1000$ s. This is why the code checks `all(abs(lambda) < 1)` rather than `all(real(lambda) < 0)`: the sampler converts continuous-time poles to discrete-time poles, changing the stability boundary from the imaginary axis to the unit circle.',
              ],
              code: `% CNC spindle controller state matrix (2nd-order discrete model)
% Gains tuned for 1 kHz sampling
Kp = 0.9; Kd = 0.1;
A_ctrl = [2 - Kp*0.001,  -1 + Kd*0.001;
           1,               0           ];

lambda = eig(A_ctrl);
fprintf('Controller eigenvalues:\\n')
for k = 1:length(lambda)
    lk = lambda(k);
    fprintf('  λ%d = %.4f + %.4fi\\n', k, real(lk), imag(lk))
    fprintf('     |λ| = %.6f  (must be < 1 for stability)\\n', abs(lk))
    if abs(imag(lk)) > 1e-6
        freq_Hz = abs(angle(lk)) / (2*pi) * 1000;  % 1kHz loop
        fprintf('     Chatter frequency if unstable: %.1f Hz\\n', freq_Hz)
    end
end

stable = all(abs(lambda) < 1);
fprintf('\\nController is %s\\n', ternary(stable, 'STABLE', 'UNSTABLE'))`,
            },
          ]
        }
      },
      {
        id: 'ComplexPlaneEigenvalueViz',
        title: 'Eigenvalues in the Complex Plane',
        mathBridge: 'The complex plane is shown with the unit circle. Each eigenvalue $\\lambda = a + bi$ appears as a point at coordinates $(a, b)$. Drag the eigenvalue point and watch the trajectory of a starting vector as the matrix is applied repeatedly. Points inside the unit circle → spiral in. Outside → spiral out. On the circle → orbit. The angle $\\theta$ from the positive real axis is the rotation angle per step.',
        caption: 'The unit circle separates convergence from divergence.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Complex Eigenvalues and Spirals',
        mathBridge: 'np.linalg.eig() returns complex eigenvalues automatically. |λ| = np.abs(λ). Angle θ = np.angle(λ). If |λ| < 1 → spirals in; |λ| > 1 → spirals out; |λ| = 1 → pure rotation.',
        caption: 'Compute complex eigenvalues, extract magnitude and angle, and trace the spiral trajectory of iterated application.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Computing complex eigenvalues',
              prose: [
                'NumPy returns complex eigenvalues as Python complex numbers. `np.abs(evals)` computes $|\\lambda|$ for each eigenvalue (element-wise), and `np.angle(evals)` returns the argument $\\theta = \\arctan(b/a)$ in radians. For the 45° rotation matrix, both eigenvalues have $|\\lambda| = 1$ and arguments $\\pm\\pi/4$.',
                'The heatmap plots both eigenvalues as points in the complex plane with the unit circle for reference. Points on the unit circle → neutral stability. The dashed unit circle is the boundary separating convergence (inside) from divergence (outside). For the rotation matrix, both points lie exactly on the circle at angle $\\pm 45°$.',
                'Complex eigenvalues always appear as conjugate pairs for real matrices — `np.linalg.eig` returns them in consecutive entries with `evals[1] == np.conj(evals[0])`. Each pair corresponds to a 2D rotation-scaling plane in which the matrix acts as $|\\lambda|$-scaling combined with $\\arg(\\lambda)$-rotation. The eigenvectors are also conjugates: `evecs[:,1] == np.conj(evecs[:,0])`. Taking `np.real(evecs[:,0])` and `np.imag(evecs[:,0])` gives the two real vectors that span this rotation plane — the basis in which $A$ becomes a pure rotation-scaling block.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

theta = np.pi / 4  # 45 degrees rotation
A = np.array([[np.cos(theta), -np.sin(theta)],
              [np.sin(theta),  np.cos(theta)]])
evals, evecs = np.linalg.eig(A)
print("Eigenvalues:", evals.round(4))
print("|lambda|:", [abs(e) for e in evals])

fig, ax = plt.subplots(figsize=(5, 5))
circle = plt.Circle((0,0), 1, fill=False, color='gray', lw=1.5, linestyle='--', alpha=0.6)
ax.add_patch(circle)
for e, color, lbl in zip(evals, ['steelblue','darkorange'], ['lam1','lam2']):
    ax.plot([0, e.real], [0, e.imag], 'o-', color=color, lw=2.5, markersize=8)
    ax.text(e.real+0.05, e.imag+0.05, f'{lbl}={e:.3f}', color=color, fontsize=9)
ax.set_title(f"Complex eigenvalues on unit circle (rotation {np.degrees(theta):.0f} deg)", fontsize=11)
ax.set_xlabel("Real"); ax.set_ylabel("Imaginary")
ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Tracing the spiral trajectory',
              prose: [
                'The matrix `A = [[0.9, -0.4],[0.4, 0.9]]` has $a=0.9$, $b=0.4$, so $|\\lambda| = \\sqrt{0.81+0.16} = \\sqrt{0.97} \\approx 0.985 < 1$. Each multiplication by $A$ rotates by $\\arctan(0.4/0.9) \\approx 24°$ and shrinks by $0.985$. After 40 steps the vector is much closer to the origin — the left plot shows the inward spiral.',
                'The right plot shows $\\|v_n\\|$ vs step $n$ on a linear scale: the norm decays geometrically as $|\\lambda|^n \\approx 0.985^n$. For the spiral to be visible, the magnitude change per step is subtle; the angular sweep is about $24°$/step, taking roughly $360°/24° = 15$ steps per "lap." Understanding both plots together shows why $|\\lambda|$ is the key quantity: it controls the radial decay rate.',
                'The spiral trajectory has a closed form: $\\mathbf{x}_n = |\\lambda|^n[\\cos(n\\theta)\\mathbf{p} - \\sin(n\\theta)\\mathbf{q}]$ where $\\mathbf{p} = \\text{Re}(\\mathbf{v})$, $\\mathbf{q} = \\text{Im}(\\mathbf{v})$, and $\\theta = \\arg(\\lambda)$. The $|\\lambda|^n$ factor controls radius (spiral inward if $|\\lambda| < 1$, outward if $|\\lambda| > 1$) and $\\cos(n\\theta)/\\sin(n\\theta)$ controls angular position. This is the matrix analog of Euler\'s formula: $e^{(a+ib)t} = e^{at}(\\cos bt + i\\sin bt)$ where $a = \\ln|\\lambda|$ and $b = \\theta = \\arg(\\lambda)$.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Spiral inward: |lambda| < 1
A = np.array([[0.9, -0.4], [0.4, 0.9]])
evals, _ = np.linalg.eig(A)
print("Eigenvalues:", evals.round(4))
print("|lambda|:", [round(abs(e), 4) for e in evals])

v = np.array([1.0, 0.0])
traj = [v.copy()]
for _ in range(40):
    v = A @ v
    traj.append(v.copy())
traj = np.array(traj)

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].plot(traj[:,0], traj[:,1], 'o-', markersize=3, color='steelblue')
axes[0].scatter(*traj[0], color='green', s=80, zorder=5, label='start')
axes[0].scatter(*traj[-1], color='crimson', s=80, zorder=5, label='end')
axes[0].set_title(f"|lambda|={abs(evals[0]):.4f} < 1: spiral inward", fontsize=11)
axes[0].set_aspect('equal'); axes[0].grid(True, alpha=0.3); axes[0].legend(fontsize=9)
axes[0].axhline(0, color='k', lw=0.5); axes[0].axvline(0, color='k', lw=0.5)
norms = np.linalg.norm(traj, axis=1)
axes[1].plot(norms, 'o-', color='darkorange', markersize=3)
axes[1].set_xlabel("Iteration"); axes[1].set_ylabel("||v||")
axes[1].set_title("Norm decays exponentially", fontsize=11)
axes[1].grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Application: discrete filter stability — eigenvalues of the system matrix',
              prose: [
                'A discrete-time system $\\mathbf{x}_{n+1} = A\\mathbf{x}_n$ is stable iff all eigenvalues of $A$ satisfy $|\\lambda| < 1$. Each eigenvalue has magnitude $r = |\\lambda|$ (controls radial growth/decay) and argument $\\theta = \\arg(\\lambda)$ (controls oscillation frequency). The system produces a spiral trajectory in state space: inward if $r < 1$, circular if $r = 1$, outward if $r > 1$. The natural frequency of oscillation in samples is $f = \\theta / (2\\pi)$ cycles per sample.',
                'The stability boundary plot shows a grid of $(a, b)$ values for $A = \\begin{bmatrix}a&-b\\\\b&a\\end{bmatrix}$ colored by stability ($|\\lambda| = \\sqrt{a^2+b^2} < 1$). The stable region is exactly the unit disk — reflecting the fact that eigenvalues of this rotation-scaling matrix are $a \\pm bi$. Varying $a$ (the "growth" parameter) moves the eigenvalue radially, while varying $b$ (the "rotation" parameter) rotates it without changing $|\\lambda|$.',
                'This pattern directly models a CNC servo controlled with a digital filter: the filter coefficients determine the matrix $A$, and stability requires all eigenvalues inside the unit disk. Over-aggressive gains push eigenvalues outside — the servo oscillates and crashes. The frequency of oscillation at the stability boundary ($|\\lambda| = 1$) is the "ringing frequency" that appears as vibration on the machined surface.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Rotation-scaling matrix A = [[a,-b],[b,a]] with eigenvalues a+bi, a-bi
# Stable iff |lambda| = sqrt(a^2 + b^2) < 1

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Left: stability boundary in (a,b) space
a_vals = np.linspace(-1.4, 1.4, 100)
b_vals = np.linspace(-1.4, 1.4, 100)
AA, BB = np.meshgrid(a_vals, b_vals)
mag = np.sqrt(AA**2 + BB**2)  # |lambda| for this family of matrices
axes[0].contourf(AA, BB, mag, levels=[0, 1], colors=['lightgreen'], alpha=0.6)
axes[0].contour(AA, BB, mag, levels=[1], colors=['red'], linewidths=2)
axes[0].set_xlabel('a (real part of lambda)', fontsize=10)
axes[0].set_ylabel('b (imag part of lambda)', fontsize=10)
axes[0].set_title('Stability region: |lambda| < 1 (green)', fontsize=11)
axes[0].set_aspect('equal'); axes[0].grid(True, alpha=0.3)

# Right: phase portrait for three systems
x0 = np.array([1., 0.])
configs = [
    (0.90, 0.30, 'steelblue',  f'Stable |λ|={np.sqrt(0.9**2+0.3**2):.2f}'),
    (1.00, 0.00, 'darkorange', 'Neutral |λ|=1.00'),
    (1.05, 0.20, 'crimson',    f'Unstable |λ|={np.sqrt(1.05**2+0.2**2):.2f}'),
]
for a, b, color, label in configs:
    A_sys = np.array([[a, -b], [b, a]])
    traj = [x0.copy()]
    x = x0.copy()
    for _ in range(20):
        x = A_sys @ x
        traj.append(x.copy())
    traj = np.array(traj)
    axes[1].plot(traj[:, 0], traj[:, 1], 'o-', color=color, lw=1.5, markersize=3, label=label)
    axes[1].scatter([traj[0, 0]], [traj[0, 1]], s=50, color=color, zorder=5)
axes[1].set_title("Phase portraits: 20 steps from x0=[1,0]", fontsize=11)
axes[1].set_aspect('equal'); axes[1].grid(True, alpha=0.3)
axes[1].axhline(0, color='k', lw=0.5); axes[1].axvline(0, color='k', lw=0.5)
axes[1].legend(fontsize=9)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Stability classification',
              difficulty: 'medium',
              prompt: 'For each matrix below, compute its eigenvalues, find |λ| for each, and classify as: stable (all |λ| < 1), unstable (any |λ| > 1), or neutral (all |λ| = 1). Print your classification and the reason.',
              code: `import numpy as np

theta = np.radians(45)
A = np.array([[np.cos(theta), -np.sin(theta)],
              [np.sin(theta),  np.cos(theta)]])     # pure rotation

B = 1.1 * A   # rotation + slight growth

C = np.array([[0.5, 0.2],
              [0.0, 0.8]])   # triangular — eigenvalues are diagonal entries

# For each: compute evals, |λ|, classify stability
`,
              hint: 'evals, _ = np.linalg.eig(A). magnitudes = np.abs(evals). All < 1 → stable. Any > 1 → unstable. All = 1 → neutral. Use np.allclose(magnitudes, 1) for the neutral check.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Why conjugate pairs?** Let $A$ be a real matrix with $A\\mathbf{v} = \\lambda\\mathbf{v}$ where $\\lambda = a + bi \\in \\mathbb{C}$. Take the complex conjugate of both sides: $\\overline{A\\mathbf{v}} = \\overline{\\lambda\\mathbf{v}}$. Since $A$ has real entries, $\\overline{A\\mathbf{v}} = A\\bar{\\mathbf{v}}$. So $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$. Thus $\\bar{\\lambda} = a - bi$ is also an eigenvalue with eigenvector $\\bar{\\mathbf{v}}$.',
      '**The real canonical form.** Even though we cannot diagonalize a real matrix with complex eigenvalues over $\\mathbb{R}$, we can put it in a **real block diagonal form**: each conjugate pair $a \\pm bi$ contributes a $2 \\times 2$ rotation-scaling block:\n\n$\\begin{bmatrix}a & -b \\\\ b & a\\end{bmatrix}$\n\nThis block rotates by $\\arctan(b/a)$ and scales by $\\sqrt{a^2+b^2}$. The full matrix in this basis becomes block diagonal with these $2\\times 2$ blocks for complex pairs and scalar entries for real eigenvalues.',
      '**Over $\\mathbb{C}$, every matrix is diagonalizable... almost.** The Fundamental Theorem of Algebra guarantees the characteristic polynomial has $n$ roots in $\\mathbb{C}$. If those roots are all distinct, the matrix is diagonalizable over $\\mathbb{C}$. If there are repeated roots, the Jordan form (over $\\mathbb{C}$) captures the structure, with 1s on the superdiagonal for non-diagonalizable cases.',
      '**Future connections: spectral radius and the Leslie matrix.** The largest eigenvalue magnitude $\\rho(A) = \\max_i |\\lambda_i|$ is called the **spectral radius**. It governs the long-run growth rate of any iterated system $\\mathbf{x}_n = A^n\\mathbf{x}_0$: if $\\rho(A) > 1$ the system grows, if $\\rho(A) < 1$ it decays, regardless of whether eigenvalues are real or complex. In population biology, the Leslie matrix models age-structured populations; its dominant eigenvalue (which may be complex for oscillating populations) determines extinction vs. growth. In numerical analysis, iterative solvers like Jacobi and Gauss-Seidel converge when the spectral radius of the iteration matrix is less than 1 — complex eigenvalues contribute to oscillatory convergence, visible as a spiral path in the residual plot.',
    ],
    callouts: [
      {
        type: 'proof',
        title: 'Why Real Matrices Have Conjugate Pairs',
        body: 'Let $A$ be real and $A\\mathbf{v} = \\lambda\\mathbf{v}$ with $\\lambda = a + bi$. Take the complex conjugate of both sides:\n\n$\\overline{A\\mathbf{v}} = \\overline{\\lambda\\mathbf{v}}$\n\nSince $A$ has real entries: $\\overline{A\\mathbf{v}} = A\\bar{\\mathbf{v}}$. So:\n\n$A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$\n\nThus $\\bar{\\lambda} = a - bi$ is also an eigenvalue with eigenvector $\\bar{\\mathbf{v}}$. $\\blacksquare$\n\n**Consequence:** The characteristic polynomial of a real matrix has real coefficients, so complex roots always appear in conjugate pairs.',
      },
      {
        type: 'theorem',
        title: 'Real Canonical (Block Diagonal) Form',
        body: 'Every real matrix with conjugate eigenvalue pair $a \\pm bi$ has a $2\\times 2$ block in its real canonical form:\n\n$\\begin{bmatrix}a & -b \\\\ b & a\\end{bmatrix} = r\\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}$\n\nwhere $r = \\sqrt{a^2+b^2}$ and $\\theta = \\arctan(b/a)$.\n\nThis is the real-number substitute for diagonalization when the eigenvalues are complex.',
      },
      {
        type: 'insight',
        title: 'Trace and Determinant Still Apply',
        body: 'For a 2×2 real matrix with complex eigenvalues $a \\pm bi$:\n\n$\\text{trace}(A) = 2a$ (sum of conjugates)\n\n$\\det(A) = a^2 + b^2 = r^2$ (product of conjugates)\n\nThese are real even though the eigenvalues are complex.',
      },
      {
        type: 'insight',
        title: 'Continuous-Time vs Discrete-Time Stability',
        body: 'Stability criteria differ depending on whether the system evolves continuously or in discrete steps:\n\n**Discrete-time** ($\\mathbf{x}_{n+1} = A\\mathbf{x}_n$):\n- Stable: all $|\\lambda_i| < 1$ (inside unit circle)\n- Critical: $|\\lambda_i| = 1$ (on unit circle)\n\n**Continuous-time** ($\\dot{\\mathbf{x}} = A\\mathbf{x}$):\n- Stable: all $\\text{Re}(\\lambda_i) < 0$ (left half-plane)\n- Critical: $\\text{Re}(\\lambda_i) = 0$ (imaginary axis)\n\nFor a discrete controller (like a CNC servo loop), the stability boundary is the unit circle, not the imaginary axis.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la3-003-ex1',
      title: 'Finding Complex Eigenvalues of a Rotation Matrix',
      problem: 'Find the eigenvalues of the 90° rotation matrix $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ and interpret them geometrically.',
      steps: [
        {
          expression: '\\det(A - \\lambda I) = \\det\\begin{bmatrix}-\\lambda&-1\\\\1&-\\lambda\\end{bmatrix} = \\lambda^2 - (0) + 1 = \\lambda^2 + 1 = 0',
          annotation: 'The characteristic equation. Note: trace $= 0$ (no real part), det $= 1$ (unit magnitude). Both match conjugate-pair predictions.',
          strategyTitle: 'Characteristic equation',
          checkpoint: 'Why is there no $\\lambda$ term in the middle?',
          hints: ['The middle coefficient is $-\\text{trace}(A) = 0$, since both diagonal entries of $A$ are 0.'],
        },
        {
          expression: '\\lambda^2 = -1 \\quad \\Rightarrow \\quad \\lambda = \\pm i',
          annotation: 'No real solutions — imaginary roots. This confirms: no real vector stays on its line after a 90° rotation.',
          strategyTitle: 'Solve for eigenvalues',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '|\\lambda| = \\sqrt{0^2 + 1^2} = 1, \\quad \\theta = \\arctan(1/0) = 90°',
          annotation: 'Magnitude 1: no stretching. Angle 90°: rotates each step by exactly 90°. The eigenvalue IS the rotation — written as a complex number.',
          strategyTitle: 'Interpret geometrically',
          checkpoint: 'What happens after 4 applications of $A$?',
          hints: ['$\\lambda^4 = i^4 = 1$ — back to the identity. Four 90° rotations = 360° = no net rotation. Makes sense geometrically.'],
        },
      ],
      conclusion: 'Eigenvalues $\\pm i$ encode a pure 90° rotation with no scaling. Repeated application traces a perfect circle. After 4 steps, every vector returns to its starting position.',
    },
    {
      id: 'la3-003-ex2',
      title: 'Spiral Behavior from Complex Eigenvalues',
      problem: 'A matrix has eigenvalue $\\lambda = 0.5 + 0.5i$. Describe the long-term behavior of vectors under repeated application.',
      steps: [
        {
          expression: 'r = |\\lambda| = \\sqrt{0.5^2 + 0.5^2} = \\sqrt{0.5} = \\frac{1}{\\sqrt{2}} \\approx 0.707',
          annotation: 'Compute the magnitude. Since $r < 1$, the transformation shrinks vectors.',
          strategyTitle: 'Compute magnitude',
          checkpoint: 'Is $r$ greater than, equal to, or less than 1?',
          hints: ['$r \\approx 0.707 < 1$. So the transformation shrinks — vectors spiral inward.'],
        },
        {
          expression: '\\theta = \\arctan\\!\\left(\\frac{0.5}{0.5}\\right) = \\arctan(1) = 45°',
          annotation: 'Each application rotates by 45°.',
          strategyTitle: 'Compute rotation angle',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\text{After } k \\text{ steps: scale by } r^k = \\left(\\tfrac{1}{\\sqrt{2}}\\right)^k, \\text{ rotate by } 45k°',
          annotation: 'The vector spirals inward (shrinking) while rotating. After 8 steps: $45° \\times 8 = 360°$ (full circle), but $r^8 = (1/\\sqrt{2})^8 = 1/16$ — now 16 times smaller.',
          strategyTitle: 'Describe trajectory',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'r^k \\to 0 \\text{ as } k \\to \\infty',
          annotation: 'Long-term: the vector spirals toward the origin. The system is stable — all vectors converge to zero.',
          strategyTitle: 'Long-term behavior',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: '$\\lambda = 0.5 + 0.5i$ produces a stable spiral: each step rotates 45° and shrinks by $1/\\sqrt{2} \\approx 0.707$. In the long run, every vector decays to the origin. The system is stable.',
    },
    {
      id: 'la3-003-ex3',
      title: 'Connecting Complex Eigenvalues to Trace and Determinant',
      problem: 'A $2 \\times 2$ real matrix has eigenvalues $\\lambda = 3 \\pm 2i$. Find its trace and determinant without knowing the matrix entries. What does the determinant tell you about invertibility?',
      steps: [
        {
          expression: '\\text{trace}(A) = \\lambda_1 + \\lambda_2 = (3+2i) + (3-2i) = 6',
          annotation: 'Sum of eigenvalues equals trace. The imaginary parts cancel for conjugate pairs.',
          strategyTitle: 'Compute trace from eigenvalues',
          checkpoint: 'Why does trace always come out real for real matrices with complex eigenvalues?',
          hints: ['Conjugate pairs sum to $2a$ where $a$ is the real part. The imaginary parts $+bi$ and $-bi$ always cancel.'],
        },
        {
          expression: '\\det(A) = \\lambda_1 \\cdot \\lambda_2 = (3+2i)(3-2i) = 9 + 4 = 13',
          annotation: 'Product of conjugate pair: $(a+bi)(a-bi) = a^2 + b^2$. Always real and positive.',
          strategyTitle: 'Compute determinant from eigenvalues',
          checkpoint: 'Is A invertible?',
          hints: ['$\\det(A) = 13 \\neq 0$, so $A$ is invertible (IMT). Complex eigenvalues are never zero (they have positive magnitude), so any matrix with only complex eigenvalues is automatically invertible.'],
        },
        {
          expression: '|\\lambda| = \\sqrt{3^2 + 2^2} = \\sqrt{13} \\approx 3.61 > 1',
          annotation: 'The magnitude exceeds 1. Under repeated application, vectors spiral outward.',
          strategyTitle: 'Determine stability from magnitude',
          checkpoint: 'What is the rotation angle per step?',
          hints: ['$\\theta = \\arctan(2/3) \\approx 33.7°$ per step.'],
        },
      ],
      conclusion: 'For conjugate pair eigenvalues $a \\pm bi$: trace $= 2a$ (real), determinant $= a^2 + b^2 > 0$ (always positive, always invertible). The magnitude $\\sqrt{a^2+b^2}$ determines stability — exactly the same as the determinant.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la3-003-ch1',
      difficulty: 'easy',
      problem: 'Find the eigenvalues of $A = \\begin{bmatrix}1&-2\\\\2&1\\end{bmatrix}$ and state whether each vector spirals in, out, or circles.',
      hint: 'Compute the characteristic equation. Then find $|\\lambda|$.',
      walkthrough: [
        {
          expression: '\\det(A - \\lambda I) = (1-\\lambda)^2 + 4 = \\lambda^2 - 2\\lambda + 5 = 0',
          annotation: 'Characteristic equation.',
        },
        {
          expression: '\\lambda = \\frac{2 \\pm \\sqrt{4 - 20}}{2} = \\frac{2 \\pm \\sqrt{-16}}{2} = 1 \\pm 2i',
          annotation: 'Quadratic formula with complex discriminant.',
        },
        {
          expression: 'r = |1 + 2i| = \\sqrt{1^2 + 2^2} = \\sqrt{5} \\approx 2.24 > 1',
          annotation: '$r > 1$: vectors spiral outward — the system is unstable.',
        },
      ],
      answer: 'λ = 1 Â± 2i, |λ| = âˆš5 > 1, spirals outward (unstable)',
    },
    {
      id: 'la3-003-ch2',
      difficulty: 'medium',
      problem: 'For a system with eigenvalue $\\lambda = -0.8i$, what is the magnitude $r$, the rotation angle $\\theta$, and the long-term behavior?',
      hint: 'Write $\\lambda = 0 + (-0.8)i$. Then $r = |\\lambda|$ and $\\theta = \\arctan(-0.8/0)$.',
      walkthrough: [
        {
          expression: 'r = |\\lambda| = \\sqrt{0^2 + (-0.8)^2} = 0.8',
          annotation: 'Magnitude is 0.8 — less than 1.',
        },
        {
          expression: '\\theta = \\arctan(-0.8 / 0) = -90°',
          annotation: 'The imaginary axis has $a = 0$, so the angle is $\\pm 90°$. Negative imaginary part → $-90°$ (clockwise rotation).',
        },
        {
          expression: 'r = 0.8 < 1 \\Rightarrow \\text{spiral inward — stable}',
          annotation: 'Each step rotates 90° clockwise and shrinks by 0.8. Converges to origin.',
        },
      ],
      answer: 'r = 0.8 < 1, θ = -90° (clockwise), spirals inward — stable convergence',
    },
    {
      id: 'la3-003-ch3',
      difficulty: 'hard',
      problem: 'A real $2\\times 2$ matrix has complex eigenvalues $\\lambda = 3 \\pm 4i$. Without finding the matrix, state: (a) its trace, (b) its determinant, (c) whether it is stable.',
      hint: 'Trace = sum of eigenvalues. Det = product of eigenvalues. Use conjugate pair properties.',
      walkthrough: [
        {
          expression: '\\text{trace}(A) = \\lambda_1 + \\lambda_2 = (3+4i) + (3-4i) = 6',
          annotation: 'Sum of conjugates: imaginary parts cancel.',
        },
        {
          expression: '\\det(A) = \\lambda_1 \\cdot \\lambda_2 = (3+4i)(3-4i) = 9 + 16 = 25',
          annotation: 'Product of conjugates: $(a+bi)(a-bi) = a^2 + b^2 = 3^2 + 4^2 = 25$.',
        },
        {
          expression: 'r = |\\lambda| = \\sqrt{3^2 + 4^2} = 5 > 1 \\Rightarrow \\text{unstable}',
          annotation: 'Magnitude 5 — each step grows by factor 5. Vectors spiral outward rapidly.',
        },
      ],
      answer: 'trace = 6, det = 25, |λ| = 5 > 1 → unstable (spirals out)',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: '\\lambda = a + bi', meaning: 'Complex eigenvalue: a = real part (scaling), b = imaginary part (rotation)' },
      { symbol: 'r = |\\lambda| = \\sqrt{a^2+b^2}', meaning: 'Magnitude — the stretch/shrink factor per step' },
      { symbol: '\\theta = \\arctan(b/a)', meaning: 'Angle — the rotation per step in radians (or degrees)' },
      { symbol: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta', meaning: "Euler's formula — connects complex exponentials to rotation" },
    ],
    rulesOfThumb: [
      '|λ| > 1 → unstable (grows/spirals out). |λ| < 1 → stable (decays/spirals in). |λ| = 1 → neutral (orbits).',
      'Real matrices always have complex eigenvalues in conjugate pairs aÂ±bi.',
      'Trace = sum of eigenvalues (real even for complex pairs). Det = product (also real).',
      'Pure imaginary eigenvalues (a=0) → pure rotation with no scaling.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la3-001',
        label: 'Characteristic Equation',
        note: 'Complex eigenvalues come from the same $\\det(A - \\lambda I) = 0$ equation — just with no real roots. The quadratic formula gives complex solutions when the discriminant $b^2 - 4ac < 0$.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la4-001',
        label: 'Orthogonal Projections',
        note: 'Phase 4 moves away from eigenvalues to projections and decompositions. SVD at the end of Phase 4 brings everything together — including what to do with non-square matrices that have no eigenvalues at all.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'No real eigenvectors → characteristic polynomial has complex roots.',
    'λ = a + bi encodes rotation (b) and scaling (a) in one number.',
    'Magnitude |λ| = âˆš(a²+b²) tells you if it grows, shrinks, or stays constant.',
    'Real matrices → complex eigenvalues always come in conjugate pairs aÂ±bi.',
    '|λ| < 1 → stable (decays). |λ| > 1 → unstable (grows). |λ| = 1 → oscillates.',
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la3-003-1', label: 'Read: understand how complex eigenvalues encode rotation and scaling via magnitude and angle', type: 'read' },
    { id: 'cp-la3-003-2', label: 'Read: follow why real matrices produce conjugate pairs and how they factor through real 2×2 blocks', type: 'read' },
    { id: 'cp-la3-003-3', label: 'Read: understand the stability condition |λ| < 1 and the Jury/Lyapunov connection', type: 'read' },
    { id: 'cp-la3-003-4', label: 'Run the lab visualization — see vectors spiraling under repeated matrix application', type: 'lab' },
    { id: 'cp-la3-003-5', label: 'Run Python/OpenMAT code — compute complex eigenvalues and trace the spiral trajectory', type: 'lab' },
    { id: 'cp-la3-003-6', label: 'Complete example 1: find complex eigenvalues of the 90° rotation matrix', type: 'example' },
    { id: 'cp-la3-003-7', label: 'Complete example 2: analyze a spiral matrix using |λ| and arg(λ)', type: 'example' },
    { id: 'cp-la3-003-8', label: 'Attempt challenge 3: design a rotation-scaling matrix with given complex eigenvalue', type: 'challenge' },
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la3-003-assess-1',
        type: 'choice',
        text: 'A matrix has eigenvalue $\\lambda = 0 + 3i$. What is $|\\lambda|$?',
        options: ['3', '9', '$\\sqrt{3}$', '0'],
        answer: '3',
        hints: ['$|0 + 3i| = \\sqrt{0^2 + 3^2} = \\sqrt{9} = 3$.'],
        reviewSection: 'Intuition tab — magnitude of a complex eigenvalue',
      },
      {
        id: 'la3-003-assess-2',
        type: 'choice',
        text: 'If a real matrix has complex eigenvalue $\\lambda = 2 + 3i$, what other eigenvalue must it have?',
        options: [
          '$\\bar{\\lambda} = 2 - 3i$ — complex eigenvalues of real matrices come in conjugate pairs',
          '$-\\lambda = -2 - 3i$',
          '$\\lambda^2 = -5 + 12i$',
          'No other eigenvalue is required',
        ],
        answer: '$\\bar{\\lambda} = 2 - 3i$ — complex eigenvalues of real matrices come in conjugate pairs',
        hints: ['For a real matrix $A$, if $A\\mathbf{v} = \\lambda\\mathbf{v}$ then $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$ (take conjugate of both sides). So conjugates come in pairs.'],
      },
      {
        id: 'la3-003-assess-3',
        type: 'choice',
        text: 'A matrix has eigenvalue $\\lambda = a + bi$ with $|\\lambda| = 1$ and $a > 0$, $b > 0$. What does the corresponding transformation do to vectors?',
        options: [
          'Rotates them without scaling — $|\\lambda| = 1$ means no magnification or shrinking',
          'Scales them by $a + b$',
          'Reflects them through the origin',
          'Collapses them to the origin',
        ],
        answer: 'Rotates them without scaling — $|\\lambda| = 1$ means no magnification or shrinking',
        hints: ['The magnitude $|\\lambda|$ determines scaling. $|\\lambda| = 1$: pure rotation. $|\\lambda| > 1$: rotation + expansion. $|\\lambda| < 1$: rotation + contraction.'],
      },
      {
        id: 'la3-003-assess-4',
        type: 'choice',
        text: 'For the rotation matrix $R_{\\theta} = \\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}$, what are the eigenvalues?',
        options: [
          '$e^{\\pm i\\theta} = \\cos\\theta \\pm i\\sin\\theta$ — complex conjugate pair with magnitude 1',
          '$\\cos\\theta$ and $\\sin\\theta$',
          '$\\pm 1$ always',
          'No real eigenvalues and no complex eigenvalues',
        ],
        answer: '$e^{\\pm i\\theta} = \\cos\\theta \\pm i\\sin\\theta$ — complex conjugate pair with magnitude 1',
        hints: ['$\\det(R - \\lambda I) = (\\cos\\theta - \\lambda)^2 + \\sin^2\\theta = \\lambda^2 - 2\\cos\\theta\\lambda + 1 = 0$. Quadratic formula: $\\lambda = \\cos\\theta \\pm i\\sin\\theta = e^{\\pm i\\theta}$.'],
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'complex-eigenvalues-q1',
      type: 'choice',
      text: 'A system has eigenvalue $\\lambda = 0.9 + 0.3i$. What is the long-term behavior of vectors under repeated application?',
      options: [
        'They grow larger without bound',
        'They spiral inward toward the origin',
        'They orbit in a perfect circle',
        'They stay at a fixed point',
      ],
      answer: 'They spiral inward toward the origin',
      hints: ['Compute $|\\lambda| = \\sqrt{0.9^2 + 0.3^2} = \\sqrt{0.81+0.09} = \\sqrt{0.90} \\approx 0.949 < 1$. Magnitude less than 1 means spiraling inward.'],
      reviewSection: 'Intuition tab — Complex Eigenvalue Geometry',
    },
    {
      id: 'complex-eigenvalues-q2',
      type: 'choice',
      text: 'Why do real matrices always have complex eigenvalues in conjugate pairs?',
      options: [
        'Because complex numbers always come in pairs',
        'Because taking the complex conjugate of both sides of $A\\mathbf{v}=\\lambda\\mathbf{v}$ gives $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$, and $A$ stays the same since it has real entries',
        'Because the characteristic polynomial has even degree',
        'Because eigenvalues must be real in the end',
      ],
      answer: 'Because taking the complex conjugate of both sides of $A\\mathbf{v}=\\lambda\\mathbf{v}$ gives $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$, and $A$ stays the same since it has real entries',
      hints: ['Conjugating $A\\mathbf{v} = \\lambda\\mathbf{v}$: since $A$ is real, $\\overline{A\\mathbf{v}} = A\\bar{\\mathbf{v}}$. So $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$ — $\\bar{\\lambda}$ is automatically also an eigenvalue.'],
      reviewSection: 'Rigor tab — Why Conjugate Pairs?',
    },
    {
      id: 'complex-eigenvalues-q3',
      type: 'choice',
      text: 'A real $2\\times 2$ matrix has eigenvalues $2 \\pm 3i$. What is its determinant?',
      options: ['$4$', '$6$', '$13$', '$9$'],
      answer: '$13$',
      hints: ['$\\det = \\lambda_1 \\cdot \\lambda_2 = (2+3i)(2-3i) = 4+9 = 13$. For conjugate pairs, det $= a^2+b^2$.'],
      reviewSection: 'Rigor tab — Trace and Determinant Still Apply',
    },
    {
      id: 'complex-eigenvalues-q4',
      type: 'choice',
      text: 'The eigenvalues of the 90° rotation matrix are $\\lambda = \\pm i$. What is $\\lambda^4$ (after 4 applications)?',
      options: ['$-1$', '$i$', '$1$', '$0$'],
      answer: '$1$',
      hints: ['$i^4 = i^2 \\cdot i^2 = (-1)(-1) = 1$. Four 90° rotations = 360° = full circle back to the start.'],
      reviewSection: 'Examples tab — 90° Rotation Matrix',
    },
    {
      id: 'complex-eigenvalues-q5',
      type: 'choice',
      text: 'A real $3 \\times 3$ matrix has one real eigenvalue $\\lambda_1 = 2$ and one pair of complex eigenvalues $\\lambda_{2,3} = 1 \\pm i$. What is its trace?',
      options: ['$4 + i$', '$2$', '$4$', '$6$'],
      answer: '$4$',
      hints: ['Trace $= \\lambda_1 + \\lambda_2 + \\lambda_3 = 2 + (1+i) + (1-i) = 2 + 2 = 4$. Complex conjugate pair always contributes $2a$ to the trace.'],
      reviewSection: 'Rigor tab — Trace and Determinant',
    },
    {
      id: 'complex-eigenvalues-q6',
      type: 'choice',
      text: 'A feedback control system has characteristic equation $\\lambda^2 - 2\\lambda + 5 = 0$. Are the poles (eigenvalues) stable in discrete time ($|\\lambda| < 1$)?',
      options: [
        'Yes — both eigenvalues have negative real part.',
        'No — both eigenvalues have magnitude $\\sqrt{5} > 1$.',
        'Yes — the discriminant is negative.',
        'Cannot determine without more information.',
      ],
      answer: 'No — both eigenvalues have magnitude $\\sqrt{5} > 1$.',
      hints: ['$\\lambda = 1 \\pm 2i$. Magnitude: $|1+2i| = \\sqrt{1+4} = \\sqrt{5} \\approx 2.24 > 1$. In discrete-time systems, stability requires $|\\lambda| < 1$. This system is unstable — it oscillates with growing amplitude.'],
      reviewSection: 'Intuition tab — long-term behavior',
    },
    {
      id: 'complex-eigenvalues-q7',
      type: 'choice',
      text: 'Complex eigenvalues come in conjugate pairs for real matrices because:',
      options: [
        'The characteristic polynomial has even degree.',
        'Complex conjugation maps real matrix eigenpairs to eigenpairs: if $A\\mathbf{v} = \\lambda\\mathbf{v}$ and $A = \\bar{A}$, then $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$.',
        'All matrices have an even number of eigenvalues.',
        'Complex eigenvalues are always roots of quadratic factors.',
      ],
      answer: 'Complex conjugation maps real matrix eigenpairs to eigenpairs: if $A\\mathbf{v} = \\lambda\\mathbf{v}$ and $A = \\bar{A}$, then $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$.',
      hints: ['Take $A\\mathbf{v} = \\lambda\\mathbf{v}$. Conjugate both sides. Since $A$ is real, $\\bar{A} = A$, so $A\\bar{\\mathbf{v}} = \\bar{\\lambda}\\bar{\\mathbf{v}}$. This proves $\\bar{\\lambda}$ is automatically an eigenvalue with eigenvector $\\bar{\\mathbf{v}}$.'],
      reviewSection: 'Rigor tab — Why Conjugate Pairs?',
    },
    {
      id: 'complex-eigenvalues-q8',
      type: 'choice',
      text: 'For a $2 \\times 2$ real rotation-scaling matrix, the real Jordan form (without complex entries) looks like $\\begin{bmatrix}a&-b\\\\b&a\\end{bmatrix}$ instead of $\\begin{bmatrix}a+bi&0\\\\0&a-bi\\end{bmatrix}$. Why is the real form preferred?',
      options: [
        'Because real matrices cannot have complex eigenvalues.',
        'Because working with purely real numbers avoids complex arithmetic in simulations and numerical software.',
        'Because the real block form has smaller determinant.',
        'Because the complex form does not represent a valid matrix.',
      ],
      answer: 'Because working with purely real numbers avoids complex arithmetic in simulations and numerical software.',
      hints: ['The real Jordan block $\\begin{bmatrix}a&-b\\\\b&a\\end{bmatrix}$ represents the same rotation-scaling as $\\lambda = a+bi$, but uses only real entries. Numerical software (MATLAB, NumPy) returns real matrices for real inputs, avoiding complex arithmetic overhead when the eigenvalues happen to be complex.'],
      reviewSection: 'Rigor tab — Real Jordan Form',
    },
    {
      id: 'complex-eigenvalues-q9',
      type: 'choice',
      text: 'A $2 \\times 2$ matrix has trace $= 6$ and determinant $= 13$. What are its eigenvalues?',
      options: ['$3 \\pm 2i$', '$6 \\pm i$', '$2 \\pm 3i$', '$1 \\pm 2\\sqrt{3}i$'],
      answer: '$3 \\pm 2i$',
      hints: ['$\\lambda^2 - 6\\lambda + 13 = 0$ (use trace $= \\lambda_1+\\lambda_2$ and det $= \\lambda_1\\lambda_2$). Quadratic formula: $\\lambda = (6 \\pm \\sqrt{36-52})/2 = (6 \\pm \\sqrt{-16})/2 = 3 \\pm 2i$.'],
      reviewSection: 'Examples tab — Example 3',
    },
    {
      id: 'complex-eigenvalues-q10',
      type: 'choice',
      text: 'A matrix has eigenvalue $\\lambda = e^{i\\pi/6} = \\cos(30°) + i\\sin(30°)$. After 12 applications, every vector returns exactly to its starting position. Why?',
      options: [
        'Because $|\\lambda| = 1$, so there is no scaling.',
        'Because $\\lambda^{12} = e^{i \\cdot 12\\pi/6} = e^{i2\\pi} = 1$ — 12 rotations of 30° complete a full circle.',
        'Because eigenvalue 1 means the identity transformation.',
        'Because real and imaginary parts cancel after many applications.',
      ],
      answer: 'Because $\\lambda^{12} = e^{i \\cdot 12\\pi/6} = e^{i2\\pi} = 1$ — 12 rotations of 30° complete a full circle.',
      hints: ['$\\lambda^k = e^{ik\\pi/6}$. This has period $T$ where $k\\pi/6 = 2\\pi$, so $k = 12$. After 12 steps, the angle returns to 0 and $\\lambda^{12} = 1$. Every vector is back to its original position.'],
      reviewSection: 'Intuition tab — repeated application',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'A real matrix with complex eigenvalues has "no eigenvectors" and cannot be analyzed.',
      whyStudentsThinkIt: 'Students know eigenvectors must be non-zero, and the complex eigenvectors of a real matrix are complex-valued — not real vectors. They conclude there is nothing geometric to say.',
      correctionExample: 'The rotation matrix $A = \\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ has eigenvectors $[1,-i]^\\top$ and $[1,i]^\\top$ (complex). These do not correspond to real directions, but the real-form Jordan block $\\begin{bmatrix}0&-1\\\\1&0\\end{bmatrix}$ (which IS $A$ itself here!) reveals the geometry: 90° rotation. The behavior of REAL vectors under $A$ is still fully determined.',
      contrastCase: 'Symmetric matrices have only real eigenvalues and real eigenvectors — the Spectral Theorem. Complex eigenvalues arise precisely when the transformation includes a rotation component that cannot be described purely by real stretching.',
    },
    {
      falseBelief: 'Complex eigenvalues always come from "complicated" matrices. Simple-looking matrices have real eigenvalues.',
      whyStudentsThinkIt: 'Students associate complexity of matrix entries with complexity of eigenvalues. A simple 2×2 matrix with small integers seems like it should have simple real eigenvalues.',
      correctionExample: '$A = \\begin{bmatrix}1&-1\\\\1&1\\end{bmatrix}$ has entries 0 and 1, but eigenvalues $1 \\pm i$. The off-diagonal entries $-1$ and $+1$ create a rotation component. Simple entries, complex eigenvalues.',
      contrastCase: 'Triangular matrices always have real eigenvalues (the diagonal entries). Symmetric matrices always have real eigenvalues (Spectral Theorem). For these special cases, simple structure guarantees real eigenvalues regardless of entry complexity.',
    },
  ],

  transferPrompts: [
    {
      situation: 'An electrical engineer analyzes an RLC circuit. The characteristic equation of the circuit is $s^2 + Rs/L + 1/(LC) = 0$. For $R = 2$, $L = 1$, $C = 1/2$, the roots are $s = -1 \\pm i$.',
      competingTechniques: 'Time-domain simulation (accurate but slow), Laplace transform (requires complex analysis), eigenvalue analysis of the state-space matrix.',
      whyThisTechniqueWins: 'The complex roots $s = -1 \\pm i$ reveal everything: real part $-1$ means exponential decay (damping), imaginary part $1$ means oscillation at 1 rad/s. The circuit response is $e^{-t}\\cos(t)$ — a damped sinusoid. No simulation needed; the eigenvalue gives the full qualitative picture.',
    },
    {
      situation: 'A robotics engineer needs to verify that a discrete-time control loop (running at 100 Hz) will not oscillate unstably. The state transition matrix $A$ has been computed numerically, and its largest eigenvalue has magnitude $0.98$ and argument $15°$.',
      competingTechniques: 'Run the simulation for many time steps (finds instability but slowly), check all eigenvalue magnitudes algebraically, use Lyapunov stability theory.',
      whyThisTechniqueWins: 'The criterion is immediate: $|\\lambda| = 0.98 < 1$ → stable. The imaginary part (15°/step) predicts a damped oscillation at frequency $15° \\times 100$ Hz $/ 360° \\approx 4.2$ Hz. If the mechanical resonance of the robot arm is near 4.2 Hz, the controller will excite it — an eigenvalue check predicts the resonance interaction without simulation.',
    },
  ],

  debugging: [
    {
      commonError: 'Forgetting that complex eigenvalues of real matrices always come in conjugate pairs, and listing only one.',
      symptom: 'For a $2 \\times 2$ real matrix, the student finds one complex eigenvalue $3+2i$ and stops. The characteristic equation has degree 2 — both roots must be found.',
      whyItHappened: 'The quadratic formula produces both roots simultaneously, but students sometimes only use $\\sqrt{\\Delta}$ (not $\\pm\\sqrt{\\Delta}$), missing the conjugate.',
      repairStrategy: 'For the characteristic polynomial $\\lambda^2 - b\\lambda + c = 0$ with $b^2 - 4c < 0$: the two roots are always $\\frac{b \\pm \\sqrt{b^2-4c}}{2}$, which are conjugates. Always write both.',
    },
    {
      commonError: 'Confusing the magnitude $|\\lambda|$ with the real part $a$ when checking stability.',
      symptom: 'For $\\lambda = -0.5 + 0.9i$, student says "negative real part → stable" without checking $|\\lambda| = \\sqrt{0.25+0.81} = \\sqrt{1.06} > 1$.',
      whyItHappened: 'Continuous-time stability (differential equations, $\\dot{\\mathbf{x}} = A\\mathbf{x}$) requires real part $< 0$. Discrete-time stability (difference equations, $\\mathbf{x}_{n+1} = A\\mathbf{x}_n$) requires magnitude $< 1$. The two criteria are different.',
      repairStrategy: 'Always identify which type of system before checking: continuous-time → check $\\text{Re}(\\lambda) < 0$; discrete-time → check $|\\lambda| < 1$. In this course, matrix powers use discrete-time criterion.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Find complex eigenvalues of a 2×2 real matrix using the quadratic formula, interpret them geometrically as rotation-scaling, and determine stability ($|\\lambda|$ vs 1).',
    explainVerbally: 'Explain why complex eigenvalues come in conjugate pairs for real matrices, why $|\\lambda|$ determines long-term growth/decay, and how the argument of $\\lambda$ determines rotation angle.',
    detectIncorrectApplication: 'Spot when someone applies the continuous-time stability criterion (Re(λ) < 0) to a discrete-time system, or when someone finds only one of the two conjugate eigenvalues.',
    transferToUnfamiliar: 'Given a new physical system (circuit, control system, vibration) with a state matrix, compute eigenvalues and predict the qualitative behavior (stable/unstable, oscillating, frequency of oscillation).',
  },
};
