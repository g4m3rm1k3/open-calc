import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getPyodide } from "../../utils/pyodideRuntime.js";
import { executeScript } from "../../utils/openmatEngine.js";
import TutorPanel from "../tutor/TutorPanel.jsx";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ================================================================
//  MATH ENGINE
// ================================================================
const mul4 = (A, B) => {
  const C = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  for (let i=0;i<4;i++) for (let j=0;j<4;j++) for (let k=0;k<4;k++) C[i][j]+=A[i][k]*B[k][j];
  return C;
};
const eye4 = () => [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
const Rz   = t  => [[Math.cos(t),-Math.sin(t),0,0],[Math.sin(t),Math.cos(t),0,0],[0,0,1,0],[0,0,0,1]];
const Txy  = (dx,dy) => [[1,0,0,dx],[0,1,0,dy],[0,0,1,0],[0,0,0,1]];
const applyM = (M,x,y) => ({ x:M[0][0]*x+M[0][1]*y+M[0][3], y:M[1][0]*x+M[1][1]*y+M[1][3] });

const fk = (angles, lengths) => {
  let M = eye4();
  const joints = [{ x:0, y:0, M:eye4() }];
  for (let i=0;i<angles.length;i++) {
    const th = (angles[i]*Math.PI)/180;
    M = mul4(M, Rz(th));
    const tip = applyM(M, lengths[i], 0);
    M = mul4(M, Txy(lengths[i], 0));
    joints.push({ x:tip.x, y:tip.y, M:M.map(r=>[...r]) });
  }
  return joints;
};

// ================================================================
//  2D INVERSE KINEMATICS + OBSTACLE DETECTION
// ================================================================

// Analytic 2D IK — returns joint angles (degrees) or null if unreachable.
// Supports 1, 2, and 3-link arms.  For 3-link, targetAngleDeg must be provided.
function ik2d(wx, wy, lengths, targetAngleDeg = null) {
  const n = lengths.length;
  if (n === 1) {
    return [Math.atan2(wy, wx) * 180/Math.PI];
  }
  if (n >= 2) {
    const [L1, L2] = lengths;
    const wrist_x = n === 3 && targetAngleDeg !== null
      ? wx - lengths[2]*Math.cos(targetAngleDeg*Math.PI/180)
      : wx;
    const wrist_y = n === 3 && targetAngleDeg !== null
      ? wy - lengths[2]*Math.sin(targetAngleDeg*Math.PI/180)
      : wy;
    const D = (wrist_x*wrist_x + wrist_y*wrist_y - L1*L1 - L2*L2) / (2*L1*L2);
    if (D < -1 || D > 1) return null; // unreachable
    // Elbow-up solution (positive theta2)
    const t2 = Math.atan2(Math.sqrt(1 - D*D), D);
    const t1 = Math.atan2(wrist_y, wrist_x) - Math.atan2(L2*Math.sin(t2), L1 + L2*Math.cos(t2));
    const sol = [t1*180/Math.PI, t2*180/Math.PI];
    if (n === 3 && targetAngleDeg !== null) {
      const t3 = targetAngleDeg - sol[0] - sol[1];
      sol.push(t3);
    }
    return sol;
  }
  return null;
}

// Minimum distance from point (px,py) to line segment (x1,y1)-(x2,y2)
function distPointSegment(px, py, x1, y1, x2, y2) {
  const dx = x2-x1, dy = y2-y1;
  const len2 = dx*dx + dy*dy;
  if (len2 === 0) return Math.sqrt((px-x1)**2 + (py-y1)**2);
  const t = Math.max(0, Math.min(1, ((px-x1)*dx + (py-y1)*dy) / len2));
  return Math.sqrt((px-(x1+t*dx))**2 + (py-(y1+t*dy))**2);
}

// Check each arm link against each circular obstacle.
// Returns array of collision message strings (empty = no collision).
function checkCollisions(joints, obstacles) {
  if (!obstacles || obstacles.length === 0) return [];
  const msgs = [];
  joints.forEach((j, i) => {
    if (i === joints.length-1) return;
    const next = joints[i+1];
    obstacles.forEach(obs => {
      const dist = distPointSegment(obs.cx, obs.cy, j.x, j.y, next.x, next.y);
      if (dist < obs.r) msgs.push(`✗ Link ${i+1} collides with "${obs.label||"obstacle"}"`);
    });
  });
  return msgs;
}

// ================================================================
//  3D MATH ENGINE  (Teach Pendant — 6-DOF UR5-style arm)
// ================================================================
const Rx3 = t => { const c=Math.cos(t),s=Math.sin(t); return [[1,0,0,0],[0,c,-s,0],[0,s,c,0],[0,0,0,1]]; };
const Ry3 = t => { const c=Math.cos(t),s=Math.sin(t); return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]]; };
const T3  = (dx,dy,dz) => [[1,0,0,dx],[0,1,0,dy],[0,0,1,dz],[0,0,0,1]];
const getPos3  = M => [M[0][3], M[1][3], M[2][3]];
const getColX  = M => [M[0][0], M[1][0], M[2][0]];
const getColZ  = M => [M[0][2], M[1][2], M[2][2]];

// 6-DOF arm config — all dimensions mm
// axes: rotation axis per joint; d: pre-Z-translate; a: post-X-translate
const A3D = {
  axes:   ["z","y","y","z","y","z"],
  d:      [100, 0,  0,  0,  0,  0 ],
  a:      [0, 180, 150, 60, 80,  50],
  limits: [[-180,180],[-120,120],[-120,120],[-180,180],[-120,120],[-360,360]],
  labels: ["J1 Base Rz","J2 Shoulder Ry","J3 Elbow Ry","J4 Wrist Roll Rz","J5 Wrist Ry","J6 Tool Rz"],
};
const ARM3D_COLORS = [0xf59e0b,0x818cf8,0xf43f5e,0x10b981,0x22d3ee,0xf97316];

function fk3d(anglesDeg) {
  const frames = [eye4()];
  let T = eye4();
  const N = Math.min(anglesDeg.length, A3D.axes.length);
  for (let i=0;i<N;i++) {
    const t = (anglesDeg[i]*Math.PI)/180;
    if (A3D.d[i]) T = mul4(T, T3(0,0,A3D.d[i]));
    if (A3D.axes[i]==="z") T = mul4(T, Rz(t));
    else if (A3D.axes[i]==="y") T = mul4(T, Ry3(t));
    else T = mul4(T, Rx3(t));
    if (A3D.a[i]) T = mul4(T, T3(A3D.a[i],0,0));
    frames.push(T.map(r=>[...r]));
  }
  return frames; // length N+1  [base, after J1, ..., end-effector]
}

// FK3D uses x=forward, y=left, z=up.  Three.js: x=right, y=up, z=toward viewer.
// Mapping: FK3D(x,y,z) → Three.js(x, z, -y) scaled by SC3.
const SC3 = 0.01; // mm → Three.js units  (1 unit = 100 mm)
const toTHREE = M => new THREE.Vector3(M[0][3]*SC3, M[2][3]*SC3, -M[1][3]*SC3);

function distPointSegment3d(px,py,pz, x1,y1,z1, x2,y2,z2) {
  const dx=x2-x1, dy=y2-y1, dz=z2-z1;
  const len2 = dx*dx+dy*dy+dz*dz;
  if (len2===0) return Math.sqrt((px-x1)**2+(py-y1)**2+(pz-z1)**2);
  const t = Math.max(0, Math.min(1, ((px-x1)*dx+(py-y1)*dy+(pz-z1)*dz)/len2));
  return Math.sqrt((px-(x1+t*dx))**2+(py-(y1+t*dy))**2+(pz-(z1+t*dz))**2);
}

function checkCollisions3d(frames, obstacles3d) {
  if (!obstacles3d || obstacles3d.length===0) return [];
  const msgs = [];
  for (let i=0; i<frames.length-1; i++) {
    const M1=frames[i], M2=frames[i+1];
    for (const obs of obstacles3d) {
      const dist = distPointSegment3d(
        obs.cx, obs.cy, obs.cz,
        M1[0][3],M1[1][3],M1[2][3],
        M2[0][3],M2[1][3],M2[2][3]
      );
      if (dist < obs.r) msgs.push(`✗ Link ${i+1} collides with "${obs.label||"obstacle"}"`);
    }
  }
  return msgs;
}

// ================================================================
//  CODE RUNNERS
// ================================================================
const MATH_API = {
  sin:Math.sin, cos:Math.cos, tan:Math.tan,
  asin:Math.asin, acos:Math.acos, atan:Math.atan, atan2:Math.atan2,
  sqrt:Math.sqrt, abs:Math.abs, log:Math.log, exp:Math.exp,
  round:Math.round, floor:Math.floor, ceil:Math.ceil,
  max:Math.max, min:Math.min, sign:Math.sign, hypot:Math.hypot,
  pi:Math.PI, PI:Math.PI, e:Math.E,
  degrees: r => (r*180)/Math.PI,
  radians: d => (d*Math.PI)/180,
  deg2rad: d => (d*Math.PI)/180,
  rad2deg: r => (r*180)/Math.PI,
};

function makePrintFn(output) {
  return (...args) => output.push(
    args.map(a => typeof a==="number"
      ? (Number.isInteger(a) ? String(a) : a.toFixed(4).replace(/\.?0+$/,""))
      : String(a)
    ).join(" ")
  );
}

function runCode(rawCode, numJoints) {
  const output = [];
  const printFn = makePrintFn(output);
  const jsCode = rawCode
    .replace(/#[^\n]*/g, m => "//"+m.slice(1))
    .replace(/^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?<![+\-*/%&|^!=<>])=(?![=>])/gm, "$1var $2 =");
  try {
    const fn = new Function(...Object.keys(MATH_API), "print",
      jsCode + "\nreturn typeof joint_angles!=='undefined'?joint_angles:undefined;"
    );
    const result = fn(...Object.values(MATH_API), printFn);
    if (result===undefined) return { angles:null, output, error:"Set joint_angles = [...] at the end." };
    if (!Array.isArray(result)) return { angles:null, output, error:"joint_angles must be an array." };
    if (result.length!==numJoints) return { angles:null, output, error:`Need ${numJoints} values in joint_angles for this mission.` };
    if (result.some(isNaN)) return { angles:null, output, error:"joint_angles contains NaN — check for sqrt of negative or ÷0." };
    return { angles:result, output, error:null };
  } catch(e) {
    return { angles:null, output, error:e.message };
  }
}

function runMatlabReal(rawCode, numJoints) {
  try {
    const result = executeScript(rawCode, {});
    const rawOut = (result.output === "No output." || !result.output) ? "" : result.output;
    const output = rawOut ? rawOut.split("\n").filter(Boolean) : [];
    const wv = (result.workspace || []).find(v => v.name === "joint_angles");
    if (!wv) return { angles:null, output, error:"Set joint_angles = [...] at the end." };
    const flat = Array.isArray(wv.value) ? wv.value.flat(Infinity).map(Number) : [Number(wv.value)];
    if (flat.length !== numJoints) return { angles:null, output, error:`Need ${numJoints} values in joint_angles for this mission.` };
    if (flat.some(isNaN)) return { angles:null, output, error:"joint_angles contains NaN — check for sqrt of negative or ÷0." };
    return { angles:flat, output, error:null };
  } catch(e) {
    return { angles:null, output:[], error:e.message };
  }
}

async function runPythonReal(userCode, numJoints) {
  const output = [];
  try {
    const pyodide = await getPyodide();
    pyodide.setStdout({ batched: (msg) => output.push(msg) });
    pyodide.setStderr({ batched: (msg) => output.push("⚠ " + msg) });
    const wrapped =
      `from math import *\n${userCode}\ntry:\n    _rfl_result = list(joint_angles)\nexcept NameError:\n    _rfl_result = None`;
    await pyodide.runPythonAsync(wrapped);
    const proxy = pyodide.globals.get("_rfl_result");
    if (proxy === null || proxy === undefined) {
      return { angles:null, output, error:"Set joint_angles = [...] at the end." };
    }
    const arr = proxy.toJs ? proxy.toJs() : Array.from(proxy);
    if (typeof proxy.destroy === "function") proxy.destroy();
    const numbers = arr.map(Number);
    if (numbers.length !== numJoints) return { angles:null, output, error:`Need ${numJoints} values in joint_angles for this mission.` };
    if (numbers.some(isNaN)) return { angles:null, output, error:"joint_angles contains NaN — check for sqrt of negative or ÷0." };
    return { angles:numbers, output, error:null };
  } catch(e) {
    return { angles:null, output, error:e.message };
  }
}

// ================================================================
//  MATLAB TEXT GENERATOR  —  live matrix display
// ================================================================
function fmt(v, w=8) {
  if (v === undefined || v === null || isNaN(v)) return "    ?   ".padStart(w);
  const s = v>=0 ? " "+v.toFixed(4) : v.toFixed(4);
  return s.padStart(w);
}
function matRow(row) {
  if (!row) return "[ ? ]";
  return `[ ${row.map(v=>fmt(v)).join("  ")} ]`;
}

function generateMatlabText(angles, lengths, mission, highlightJoint) {
  if (!angles || !lengths || angles.length===0 || lengths.length===0) return "% (run code first)";
  const n = Math.min(angles.length, lengths.length);
  const lines = [];

  lines.push(`%% Robot Arm — Forward Kinematics`);
  lines.push(`%% Mission: ${mission.title}`);
  lines.push(`%% ${angles.slice(0,n).map((a,i)=>`θ${i+1} = ${a.toFixed(2)}°`).join(",  ")}`);
  lines.push(``);

  let Tcum = eye4();

  for (let i=0;i<n;i++) {
    const isHigh = highlightJoint===null || highlightJoint>=i+1;
    const dim = !isHigh ? "%% (not yet applied)" : "";
    const t = (angles[i]*Math.PI)/180;
    const L = lengths[i];

    lines.push(`%%${"─".repeat(42)} Joint ${i+1} ${dim}`);
    lines.push(`t${i+1} = deg2rad(${angles[i].toFixed(2)});   %% = ${t.toFixed(4)} rad`);
    lines.push(``);

    if (isHigh) {
      const Rzm = Rz(t);
      const Txym = Txy(L,0);
      lines.push(`Rz(t${i+1}) =`);
      Rzm.forEach(row => lines.push(`    ${matRow(row)}`));
      lines.push(``);
      lines.push(`Txy(${L}, 0) =`);
      Txym.forEach(row => lines.push(`    ${matRow(row)}`));
      lines.push(``);

      Tcum = mul4(mul4(Tcum, Rzm), Txym);
      const label = i===0
        ? "Rz(t1) * Txy(L1, 0)"
        : `T_${Array.from({length:i},(_,k)=>k+1).join("..")} * Rz(t${i+1}) * Txy(L${i+1}, 0)`;
      lines.push(`T_${Array.from({length:i+1},(_,k)=>k+1).join("..")} = ${label} =`);
      Tcum.forEach((row,ri) => {
        const note = ri===0 ? `  %% pos-x = ${Tcum[0][3].toFixed(3)}`
                   : ri===1 ? `  %% pos-y = ${Tcum[1][3].toFixed(3)}` : "";
        lines.push(`    ${matRow(row)}${note}`);
      });
      lines.push(``);
    } else {
      lines.push(`%% (step forward to reveal joint ${i+1})`);
      lines.push(``);
    }
  }

  const joints = fk(angles.slice(0,n), lengths.slice(0,n));
  const tip = joints[joints.length-1];
  const psi = (Math.atan2(Tcum[1][0], Tcum[0][0])*180)/Math.PI;
  const detR = Tcum[0][0]*Tcum[1][1]-Tcum[0][1]*Tcum[1][0];

  lines.push(`%%${"─".repeat(42)} End Effector`);
  lines.push(`x  = T_total(1,4) = ${tip.x.toFixed(3)} mm`);
  lines.push(`y  = T_total(2,4) = ${tip.y.toFixed(3)} mm`);
  lines.push(`ψ  = atan2(T(2,1), T(1,1)) = ${psi.toFixed(3)}°`);
  lines.push(`det(R) = ${detR.toFixed(6)}   %% must be 1.0 for valid rotation`);

  const dx=tip.x-mission.targetX, dy=tip.y-mission.targetY;
  const dist=Math.sqrt(dx*dx+dy*dy);
  lines.push(``);
  lines.push(`%% Distance to target: ${dist.toFixed(2)} mm  ${dist<mission.tolerance?"✓ WITHIN TOLERANCE":"✗ not there yet"}`);

  return lines.join("\n");
}

// ================================================================
//  MISSIONS  (0-4 = beginner, 5-9 = intermediate/advanced)
// ================================================================
const MISSIONS = [

  // ── CHAPTER 1: FIRST STEPS ─────────────────────────────────────
  {
    id:0, title:"Hello, Robot!", badge:"Hello World", color:"#4ade80",
    chapter:"ch1",
    tagline:"Change one number. Watch the arm move. That's all there is to it.",
    numJoints:1, lengths:[150], targetX:106, targetY:106, targetAngle:null, tolerance:35, scene:"plain",
    starterCode:
`# Welcome to the Robot Arm Simulator!
# This arm has ONE joint (J1) and ONE link (150 mm long).
#
# Change the number below to rotate the arm.
# Positive = counter-clockwise, Negative = clockwise.
# Try: 0, 45, 90, -30 ...

theta1 = 0   # degrees

# Send the angle to the arm:
joint_angles = [theta1]`,
    matlabStarterCode:
`% Welcome to the Robot Arm Simulator!
% This arm has ONE joint (J1) and ONE link (150 mm long).
%
% Change the number below to rotate the arm.
% Positive = counter-clockwise, Negative = clockwise.

theta1 = 0;   % degrees

joint_angles = [theta1];`,
    tutorial:[
      { heading:"What is a Robot Arm?",
        body:`A robot arm is a chain of rigid LINKS
connected by JOINTS.

Each joint has one degree of freedom:
it rotates by some angle θ (theta).

This simulator has a 2D planar arm.
Real industrial robots (UR5, KUKA, ABB)
use the same math — just in 3D.

▶  Press Run (or Ctrl+Enter) and watch
   the arm snap to your chosen angle.` },
      { heading:"Angles and Degrees",
        body:`θ = 0°   → arm points RIGHT   (3 o'clock)
θ = 90°  → arm points UP      (12 o'clock)
θ = 180° → arm points LEFT    (9 o'clock)
θ = -90° → arm points DOWN    (6 o'clock)

The small arrows at each joint show:
  Green → local X-axis
  Red   → local Y-axis

These axes ROTATE with the joint —
that's the local coordinate FRAME.` },
      { heading:"Your Mission",
        body:`The dashed circle is the TARGET.
Get the arm tip (the gripper ⊕) inside it.

1. Read the HUD (top-left) — it shows
   the current tip position x and y.

2. Adjust theta1 until the tip is
   close to (106, 106) mm.

Hint: which angle points at 45°?
  → cos(45°) = sin(45°) = 0.707
  → x = 150 × 0.707 ≈ 106

When you're in the circle: ✓ DONE!` },
    ],
  },

  {
    id:1, title:"Trig Makes Arms Move", badge:"Trig Review", color:"#22d3ee",
    chapter:"ch1",
    tagline:"sin and cos tell you exactly where the tip lands — no guessing needed.",
    numJoints:1, lengths:[150], targetX:120, targetY:90, targetAngle:null, tolerance:22, scene:"plain",
    starterCode:
`# FK Formula for 1 joint:
#   x = L * cos(theta)    ← how far right
#   y = L * sin(theta)    ← how far up
#
# L = 150 mm,  Target ≈ (120, 90)
# Adjust theta1 until x ≈ 120 and y ≈ 90

L = 150
theta1 = 30   # degrees — try adjusting this

x = L * cos(radians(theta1))
y = L * sin(radians(theta1))
print("tip x =", round(x, 1), "mm")
print("tip y =", round(y, 1), "mm")

# Hint: atan2(90, 120) gives the exact angle
joint_angles = [theta1]`,
    matlabStarterCode:
`% FK Formula for 1 joint:
%   x = L * cos(t)    <- how far right
%   y = L * sin(t)    <- how far up
%
% L = 150 mm,  Target ~ (120, 90)

L = 150;
theta1 = 30;   % degrees — adjust this

t = deg2rad(theta1);
x = L * cos(t);
y = L * sin(t);
fprintf('tip x = %.1f mm', x)
fprintf('tip y = %.1f mm', y)

% Hint: rad2deg(atan2(90, 120)) gives the exact angle
joint_angles = [theta1];`,
    tutorial:[
      { heading:"Sine and Cosine",
        body:`Imagine a point moving around a circle
of radius L.  At angle θ from horizontal:

  x = L · cos(θ)
  y = L · sin(θ)

Key values to remember:
  θ =  0° → cos=1,    sin=0    → tip at (L, 0)
  θ = 30° → cos=0.87, sin=0.5  → tip at (130, 75)
  θ = 45° → cos=0.71, sin=0.71 → tip at (106, 106)
  θ = 60° → cos=0.5,  sin=0.87 → tip at (75, 130)
  θ = 90° → cos=0,    sin=1    → tip at (0, 150)` },
      { heading:"Radians vs Degrees",
        body:`Python's cos() and sin() expect RADIANS.
MATLAB's cos() and sin() also expect RADIANS.

Convert:  radians = degrees × π / 180

Python:  radians(30) = 0.5236  ← from math import *
MATLAB:  deg2rad(30) = 0.5236

Going back:
Python:  degrees(0.5236) = 30.0
MATLAB:  rad2deg(0.5236) = 30.0

In the Matrix View (MATLAB tab) you'll
see both radians and degrees side by side.` },
      { heading:"Solve for θ",
        body:`If you KNOW the target (x=120, y=90):
  dist = sqrt(120² + 90²) = 150  ← same as L

Great — the target is exactly on the
circle of radius L=150.

The angle that hits (120, 90):
  θ = atan2(y, x)
    = atan2(90, 120)
    ≈ 36.87°

So theta1 = 36.87 should solve it.
Try it — then go to Mission 2 where
we automate this calculation.` },
    ],
  },

  {
    id:2, title:"Aim Automatically", badge:"atan2", color:"#f97316",
    chapter:"ch1",
    tagline:"atan2(y, x) computes the angle you need — the foundation of inverse kinematics.",
    numJoints:1, lengths:[150], targetX:75, targetY:130, targetAngle:null, tolerance:22, scene:"plain",
    starterCode:
`# atan2(y, x) gives the angle pointing at (x, y)
# It's the inverse of cos/sin — crucial for IK.
#
# Target: (75, 130)

L = 150
target_x = 75
target_y = 130

# Compute the exact angle needed:
theta1 = degrees(atan2(target_y, target_x))
print("computed angle:", round(theta1, 2), "deg")

# Check the tip position:
x = L * cos(radians(theta1))
y = L * sin(radians(theta1))
print("tip:", round(x,1), round(y,1))

joint_angles = [theta1]`,
    matlabStarterCode:
`% atan2(y, x) gives the angle pointing at (x, y).
% MATLAB: atan2 returns radians — use rad2deg() to convert.
%
% Target: (75, 130)

L = 150;
target_x = 75;
target_y = 130;

% Compute the exact angle:
theta1 = rad2deg(atan2(target_y, target_x));
fprintf('computed angle: %.2f deg', theta1)

% Verify:
t = deg2rad(theta1);
x = L * cos(t);
y = L * sin(t);
fprintf('tip: %.1f  %.1f mm', x, y)

joint_angles = [theta1];`,
    tutorial:[
      { heading:"atan2 — The Inverse",
        body:`cos(θ) = x/L   and   sin(θ) = y/L

To go backwards (x,y → θ) use atan2:
  θ = atan2(y, x)

Why atan2 and not just atan(y/x)?
atan(y/x) fails when x ≤ 0 — it
can't tell which quadrant you're in.

atan2(y, x) uses BOTH signs to return
a value in the full range [-180°, +180°].

Example:
  atan2(130, 75)  ≈  60°   ← Q1 ✓
  atan2(130, -75) ≈ 120°   ← Q2 ✓
  atan(130/-75)   ≈ -60°   ← WRONG` },
      { heading:"Reachability Check",
        body:`Before computing the angle, always check:
is the target REACHABLE?

For a 1-link arm of length L:
  dist = sqrt(x² + y²)

  if dist ≤ L → reachable  ✓
  if dist > L → out of reach ✗

For this target:
  dist = sqrt(75² + 130²)
       = sqrt(5625 + 16900)
       = sqrt(22525)
       ≈ 150.1 mm ≈ L

Just barely on the edge!` },
      { heading:"Where This Leads",
        body:`For a SINGLE-LINK arm, atan2 gives the
exact answer in one line of code.

For TWO links, it gets more interesting:
  • There are TWO solutions (elbow up / down)
  • We need the law of cosines

For SIX links (like a UR5 robot):
  • There are up to 16 solutions
  • Solved numerically using the Jacobian

All of this builds on atan2.
You just learned the foundation of
Inverse Kinematics (IK).` },
    ],
  },

  // ── CHAPTER 2: MULTI-LINK ARMS ─────────────────────────────────
  {
    id:3, title:"Add an Elbow", badge:"2-Joint FK", color:"#a78bfa",
    chapter:"ch2",
    tagline:"Chain two links. The tip position adds — that's the heart of forward kinematics.",
    numJoints:2, lengths:[120, 80], targetX:160, targetY:80, targetAngle:null, tolerance:30, scene:"plain",
    starterCode:
`# 2-Joint FK Formula:
#   x = L1*cos(t1) + L2*cos(t1+t2)
#   y = L1*sin(t1) + L2*sin(t1+t2)
#
# Key insight: theta2 is RELATIVE to link 1.
# The second term uses (t1+t2) — the TOTAL rotation.

L1 = 120
L2 = 80
theta1 = 30   # shoulder — moves the WHOLE arm
theta2 = 20   # elbow — moves only link 2

x = L1*cos(radians(theta1)) + L2*cos(radians(theta1 + theta2))
y = L1*sin(radians(theta1)) + L2*sin(radians(theta1 + theta2))
print("tip:", round(x,1), round(y,1), "mm")
print("target: (160, 80)")

joint_angles = [theta1, theta2]`,
    matlabStarterCode:
`% 2-Joint FK Formula:
%   x = L1*cos(t1) + L2*cos(t1+t2)
%   y = L1*sin(t1) + L2*sin(t1+t2)
%
% theta2 is relative to link 1 — total rotation = t1+t2

L1 = 120;  L2 = 80;
theta1 = 30;   % shoulder — moves the whole arm
theta2 = 20;   % elbow — moves only link 2

t1 = deg2rad(theta1);
t2 = deg2rad(theta2);

x = L1*cos(t1) + L2*cos(t1+t2);
y = L1*sin(t1) + L2*sin(t1+t2);
fprintf('tip: %.1f  %.1f mm', x, y)
fprintf('target: (160, 80)')

joint_angles = [theta1, theta2];`,
    tutorial:[
      { heading:"Chaining Two Links",
        body:`Link 1 tip = (L1·cos θ₁,  L1·sin θ₁)
Link 2 ADDS onto link 1's tip:
  x = L1·cos θ₁ + L2·cos(θ₁+θ₂)
  y = L1·sin θ₁ + L2·sin(θ₁+θ₂)

Why θ₁+θ₂ in the second term?
Because θ₂ is defined RELATIVE to link 1.
If link 1 rotated 30° and then the elbow
added 20°, the total world rotation is 50°.

This "relative angles add up" rule is
the foundation of the FK chain.` },
      { heading:"Joint Hierarchy",
        body:`Try this to build intuition:

1. Set theta2 = 0.
   Adjust theta1 → whole arm rotates.

2. Set theta1 = 30 (fixed).
   Adjust theta2 → only link 2 moves.
   Notice: link 1's position doesn't change.

3. Now adjust BOTH.
   They combine to reach any point in
   the reachable workspace.

This hierarchy is exactly how industrial
robots work — each joint only "sees"
the joints downstream from it.` },
      { heading:"Adjust to Reach (160, 80)",
        body:`Start: theta1=30, theta2=20 → too high.

Reducing theta2 pulls the tip DOWN.
Try theta2 = -20 and see what happens.

For the exact solution:
  The target is inside the workspace
  (L1+L2 = 200, distance to target ≈ 178).

  Adjust theta1 upward slightly,
  theta2 more negative, until you're
  inside the dashed circle.

The Matrix View (MATLAB tab) shows
the 4×4 matrix for EACH joint position.` },
    ],
  },

  {
    id:4, title:"Reach Any Point", badge:"Workspace", color:"#fb923c",
    chapter:"ch2",
    tagline:"The workspace is an annulus. Reach the far-left target by thinking about what theta1 has to be.",
    numJoints:2, lengths:[120, 80], targetX:-90, targetY:150, targetAngle:null, tolerance:35, scene:"plain",
    starterCode:
`# Target: (-90, 150) — left side of the workspace
#
# Insight: to reach NEGATIVE x, theta1 must be > 90°
# (the arm has to swing past vertical into Q2)
#
# Start here and adjust:

L1 = 120
L2 = 80
theta1 = 100  # shoulder — try 100 → 130
theta2 = 0    # elbow — try adjusting this too

x = L1*cos(radians(theta1)) + L2*cos(radians(theta1 + theta2))
y = L1*sin(radians(theta1)) + L2*sin(radians(theta1 + theta2))
print("tip:", round(x,1), round(y,1))
print("target: (-90, 150)")

joint_angles = [theta1, theta2]`,
    matlabStarterCode:
`% Target: (-90, 150) — left side of the workspace
%
% To reach NEGATIVE x, theta1 must be > 90 degrees.

L1 = 120;  L2 = 80;
theta1 = 100;   % try 100 to 130
theta2 = 0;     % elbow — adjust this too

t1 = deg2rad(theta1);
t2 = deg2rad(theta2);

x = L1*cos(t1) + L2*cos(t1+t2);
y = L1*sin(t1) + L2*sin(t1+t2);
fprintf('tip: %.1f  %.1f mm', x, y)
fprintf('target: (-90, 150)')

joint_angles = [theta1, theta2];`,
    tutorial:[
      { heading:"The Workspace",
        body:`For a 2-link arm (L1=120, L2=80):

WORKSPACE = all reachable points.
Shape: an ANNULUS (ring).

  Outer radius = L1 + L2 = 200 mm
    (arm fully extended)
  Inner radius = |L1 - L2| = 40 mm
    (arm fully folded)

Any point where 40 ≤ dist ≤ 200
is reachable. Points outside this
ring cannot be reached — IK would
give you D > 1 or D < −1.` },
      { heading:"Two Solutions",
        body:`Most points in the workspace have
TWO solutions:

  Elbow UP:   theta2 > 0
  Elbow DOWN: theta2 < 0

Both reach the same tip position!
Industrial robots choose based on:
  • Avoiding obstacles
  • Not flipping the wrist
  • Staying near current position

This is called the IK CONFIGURATION
SPACE problem — beyond this mission,
but now you know it exists.` },
      { heading:"What's Next",
        body:`You've mastered:
  ✓ 1-joint arm (trig)
  ✓ atan2 (inverse trig)
  ✓ 2-joint arm (chain formula)
  ✓ Workspace (reachability)

The next chapter introduces 4×4 matrices.
They might seem like overkill for 2D —
but they're what makes 3D robots possible.

In 3D you have:
  3 position values (x, y, z)
  3 orientation values (roll, pitch, yaw)

A 4×4 matrix captures ALL 6 at once.
Mission 5 shows WHY.` },
    ],
  },

  // ── CHAPTER 3: MATRIX MECHANICS (former missions 0-4) ──────────
  {
    id:5, title:"Why 4×4? The Translation Problem", badge:"Foundation", color:"#00c2a8",
    chapter:"ch3",
    tagline:"A 3×3 matrix can rotate. It cannot translate. See why one extra dimension changes everything.",
    numJoints:2, lengths:[120,90], targetX:140, targetY:100, targetAngle:null, tolerance:22, scene:"plain",
    starterCode:
`# Forward kinematics — given angles, where does the arm end up?
# Arm: L1 = 120mm,  L2 = 90mm
# Target: (140, 100)

L1 = 120
L2 = 90

# Set joint angles in degrees:
theta1 = 30    # shoulder — rotates the whole arm
theta2 = -20   # elbow    — rotates only the second link

# FK formula (what the 4x4 matrices compute):
x = L1 * cos(radians(theta1)) + L2 * cos(radians(theta1 + theta2))
y = L1 * sin(radians(theta1)) + L2 * sin(radians(theta1 + theta2))
print("tip x =", round(x, 2), "mm")
print("tip y =", round(y, 2), "mm")

# Adjust until the arm reaches the green target.
joint_angles = [theta1, theta2]`,
    matlabStarterCode:
`%% 4x4 Homogeneous Transforms — Forward Kinematics
%% Arm: L1=120mm, L2=90mm  ->  Target: (140, 100)

L1 = 120;
L2 = 90;
theta1 = 30;   %% shoulder (degrees)
theta2 = -20;  %% elbow (degrees)

t1 = deg2rad(theta1);
t2 = deg2rad(theta2);

x = L1 * cos(t1) + L2 * cos(t1 + t2);
y = L1 * sin(t1) + L2 * sin(t1 + t2);
fprintf('tip x = %.2f mm', x)
fprintf('tip y = %.2f mm', y)

%% Switch to Matrix View to see full 4x4 matrices.
joint_angles = [theta1, theta2];`,
    tutorial:[
      { heading:"Why 3×3 fails",
        body:`A 2×2 rotation matrix R multiplied by
any vector [x, y] always produces a
vector through the ORIGIN.

Translation — moving by (dx, dy) — is
NOT a linear operation. You can't
represent it with R·v alone.

To see why: R·[0,0] = [0,0] always.
So if the arm is at the origin, no
rotation can move it anywhere.` },
      { heading:"The 4×4 fix",
        body:`Append a 1 to every point:
  [x, y]  →  [x, y, 0, 1]

Now one 4×4 matrix does BOTH:

  [ cos t  -sin t  0  dx ] [ x ]
  [ sin t   cos t  0  dy ] [ y ]
  [   0       0    1   0 ] [ 0 ]
  [   0       0    0   1 ] [ 1 ]

Top-left = rotation.  Right col = translation.
Bottom row = always [0,0,0,1].

This is why every robotics library
(ROS, MATLAB, URScript) uses 4×4.` },
      { heading:"Reading the matrix",
        body:`After one joint (angle t₁, length L₁):

T₁ = Rz(t₁) · Txy(L₁, 0)

Right column (col 4) = joint position:
  T₁(1,4) = L₁·cos(t₁)   ← x
  T₁(2,4) = L₁·sin(t₁)   ← y

Columns 1-2 = where local X and Y
point in world coordinates.

Switch to MATLAB tab — watch those
exact numbers change as you Run.` },
    ],
  },

  {
    id:6, title:"Chaining Transforms: Pick Up a Part", badge:"Fwd Kinematics", color:"#f59e0b",
    chapter:"ch3",
    tagline:"Each joint multiplies in a 4×4. The chain gives you the end-effector.",
    numJoints:3, lengths:[100,80,60], targetX:-80, targetY:150, targetAngle:null, tolerance:25, scene:"parts",
    starterCode:
`# 3-joint FK chain: T = Rz(t1)·T(L1) · Rz(t2)·T(L2) · Rz(t3)·T(L3)
# Lengths: L1=100mm, L2=80mm, L3=60mm
# Target: (-80, 150)

# Joint hierarchy:
#   theta1 moves the WHOLE arm
#   theta2 moves joints 2 and 3
#   theta3 moves only the gripper

theta1 = 90    # sweep broadly first
theta2 = -45   # bend the elbow
theta3 = 10    # fine-tune the tip

print("angle sum =", theta1 + theta2 + theta3, "deg")

# Check MATLAB tab to see T_1, T_1..2, T_1..2..3 build up.
joint_angles = [theta1, theta2, theta3]`,
    matlabStarterCode:
`%% 3-Joint FK Chain
%% T = Rz(t1)*Txy(L1) * Rz(t2)*Txy(L2) * Rz(t3)*Txy(L3)
L1 = 100;  L2 = 80;  L3 = 60;

theta1 = 90;
theta2 = -45;
theta3 = 10;

t1 = deg2rad(theta1);
t2 = deg2rad(theta2);
t3 = deg2rad(theta3);

x1 = L1*cos(t1);
y1 = L1*sin(t1);
x2 = x1 + L2*cos(t1+t2);
y2 = y1 + L2*sin(t1+t2);
x  = x2 + L3*cos(t1+t2+t3);
y  = y2 + L3*sin(t1+t2+t3);
fprintf('tip: %.2f %.2f', x, y)
fprintf('angle sum = %.2f deg', theta1+theta2+theta3)

joint_angles = [theta1, theta2, theta3];`,
    tutorial:[
      { heading:"The FK chain",
        body:`T_total = I
  · Rz(t₁) · Txy(L₁, 0)
  · Rz(t₂) · Txy(L₂, 0)
  · Rz(t₃) · Txy(L₃, 0)

Each joint contributes one Rz·Txy pair.
Rz rotates the LOCAL frame.
Txy moves along the NEW local X-axis.

T_total's right column = end-effector
position in WORLD coordinates.` },
      { heading:"Order matters",
        body:`Matrix multiplication is NOT commutative:
  A · B  ≠  B · A  in general

Rz(t) · Txy(L, 0):
  → rotate THEN translate along new axis
  → moves the arm segment  ✓

Txy(L, 0) · Rz(t):
  → translate THEN rotate in place
  → spins around a far point  ✗

Real robot controllers always use the
first form (Denavit-Hartenberg convention).` },
      { heading:"Joint hierarchy",
        body:`Try this:
  Set theta2 = theta3 = 0.
  Adjust theta1 → whole arm rotates.

  Now set theta1 = 90 (fixed).
  Adjust theta2 → joints 2+3 move.

  Now fix theta1 and theta2.
  Adjust theta3 → only the gripper.

This hierarchy is exactly why industrial
robots can reach any point in space —
each joint "zooms in" on the target.` },
    ],
  },

  {
    id:7, title:"Orientation Control: Unscrew a Bolt", badge:"Rotation Matrices", color:"#818cf8",
    chapter:"ch3",
    tagline:"Position alone isn't enough — the gripper must arrive at exactly −90° to align with the bolt.",
    numJoints:3, lengths:[100,80,60], targetX:30, targetY:-160, targetAngle:-90, tolerance:22, angleTolerance:15, scene:"bolt",
    starterCode:
`# KEY INSIGHT: gripper_angle = theta1 + theta2 + theta3
# Because Rz(a) · Rz(b) = Rz(a+b) — rotations ADD
#
# Goal: reach (30, -160) with gripper pointing DOWN (-90°)
# Constraint: theta1 + theta2 + theta3 = -90 (exactly)

L1 = 100
L2 = 80
L3 = 60

# Step 1: pick theta1 and theta2 to reach near the bolt
theta1 = 60
theta2 = -30

# Step 2: set theta3 to SATISFY the orientation constraint
theta3 = -90 - theta1 - theta2

gripper_angle = theta1 + theta2 + theta3
print("gripper angle =", gripper_angle, "deg  (must be -90)")

joint_angles = [theta1, theta2, theta3]`,
    matlabStarterCode:
`%% Orientation Control — Rz(a)*Rz(b) = Rz(a+b)
%% Goal: reach (30, -160) with gripper at -90 deg
L1 = 100;  L2 = 80;  L3 = 60;

theta1 = 60;
theta2 = -30;

%% Orientation constraint: total rotation = desired angle
psi = -90;   %% desired gripper angle (degrees)
theta3 = psi - theta1 - theta2;

psi_rad = deg2rad(psi);
fprintf('cos(psi) = %.4f', cos(psi_rad))
fprintf('sin(psi) = %.4f', sin(psi_rad))
fprintf('gripper angle = %.2f deg', theta1+theta2+theta3)

%% Switch to Matrix View — see det(R) = 1.0 always.
joint_angles = [theta1, theta2, theta3];`,
    tutorial:[
      { heading:"Orientation from the matrix",
        body:`For a planar arm, gripper angle ψ is:

  ψ = atan2(T[2,1], T[1,1])
    = atan2(sin(t₁+t₂+t₃), cos(t₁+t₂+t₃))
    = t₁ + t₂ + t₃

Why? Because Rz(a)·Rz(b) = Rz(a+b).
Rotation matrices compose by addition.

To point the gripper DOWN (−90°):
  t₁ + t₂ + t₃ = −90°

Set theta3 = −90 − theta1 − theta2
and the orientation is always satisfied.` },
      { heading:"Basis vectors",
        body:`Rotation submatrix of T_total:

  col 1: [cos ψ, sin ψ]  — "forward"
  col 2: [-sin ψ, cos ψ] — "left"

Both are UNIT VECTORS. They are always
ORTHOGONAL to each other.

Checks for a valid rotation matrix:
  1. |col₁| = 1  (unit length)
  2. col₁ · col₂ = 0  (perpendicular)
  3. det(R) = +1  (not a reflection)

Real robots CHECK these before moving.
See MATLAB tab: det(R) is always 1.0.` },
      { heading:"Degrees of freedom",
        body:`N-joint arm has N degrees of freedom.

  2-link: controls x and y only (2 DOF)
  3-link: controls x, y, AND angle (3 DOF)

For this bolt: need all 3:
  x = 30 mm
  y = −160 mm
  ψ = −90°

Industrial robots have 6 DOF:
  3 for position (x, y, z)
  3 for orientation (roll, pitch, yaw)
  → same 4×4 math, just 3D Rx/Ry/Rz` },
    ],
  },

  {
    id:8, title:"Inverse Kinematics: Bottle Cap", badge:"Inv Kinematics", color:"#f43f5e",
    chapter:"ch4",
    tagline:"Derive the joint angles from first principles using the law of cosines.",
    numJoints:2, lengths:[130,100], targetX:80, targetY:190, targetAngle:null, tolerance:20, scene:"bottle",
    starterCode:
`# INVERSE KINEMATICS — target position → joint angles
# 2-link arm: L1=130mm, L2=100mm
# Target: (80, 190)

L1 = 130
L2 = 100
target_x = 80
target_y = 190

# ── Step 1: law of cosines → find theta2 ──────────────
# cos(theta2) = (px² + py² - L1² - L2²) / (2·L1·L2)
D = (target_x**2 + target_y**2 - L1**2 - L2**2) / (2 * L1 * L2)
print("D = cos(theta2) =", round(D, 4), " (must be in [-1, 1])")

# Two solutions: +sqrt = elbow-down, -sqrt = elbow-up
theta2 = atan2(-sqrt(1 - D**2), D)    # radians, elbow-up

# ── Step 2: geometric formula → find theta1 ───────────
theta1 = atan2(target_y, target_x) - atan2(L2*sin(theta2), L1 + L2*cos(theta2))

print("theta1 =", round(degrees(theta1), 2), "deg")
print("theta2 =", round(degrees(theta2), 2), "deg")

joint_angles = [degrees(theta1), degrees(theta2)]`,
    matlabStarterCode:
`%% Inverse Kinematics — 2-link arm
%% L1=130mm, L2=100mm  ->  Target: (80, 190)
L1 = 130;  L2 = 100;
px = 80;   py = 190;

%% Law of cosines: cos(theta2) = D
D = (px^2 + py^2 - L1^2 - L2^2) / (2*L1*L2);
fprintf('D = cos(theta2) = %.4f', D)

%% Two solutions: +sqrt=elbow-down, -sqrt=elbow-up
theta2 = atan2(-sqrt(1 - D^2), D);   %% radians, elbow-up

%% Geometric formula for theta1:
theta1 = atan2(py, px) - atan2(L2*sin(theta2), L1 + L2*cos(theta2));

fprintf('theta1 = %.2f deg', rad2deg(theta1))
fprintf('theta2 = %.2f deg', rad2deg(theta2))

joint_angles = [rad2deg(theta1), rad2deg(theta2)];`,
    tutorial:[
      { heading:"The IK problem",
        body:`Forward: angles → position  (just multiply)
Inverse: position → angles  (solve equations)

For a 2-link arm, exact analytic solution:

Given target (px, py), links L₁, L₂:

Step 1 — law of cosines for θ₂:
  cos(θ₂) = (px² + py² - L₁² - L₂²)
             ─────────────────────────
                     2·L₁·L₂

Two solutions: elbow-up and elbow-down.` },
      { heading:"Completing the IK",
        body:`Step 2 — geometric formula for θ₁:

  θ₁ = atan2(py, px)
     − atan2(L₂·sin(θ₂), L₁ + L₂·cos(θ₂))

This is the exact analytic 2-DOF IK.

For a UR5 (6-DOF, 3D), IK is solved
numerically using the Jacobian J:

  dθ/dt = J⁺ · v_ee

where J⁺ is the pseudoinverse via SVD.
That's where linear algebra really earns
its keep.` },
      { heading:"Workspace & singularities",
        body:`WORKSPACE: all reachable points.
For a 2-link arm — an annulus:
  inner radius = |L₁ − L₂|  (fully folded)
  outer radius = L₁ + L₂    (fully extended)

If D > 1 or D < −1, target is out of reach.

SINGULARITIES: arm loses a DOF.
  Fully extended → det(J) = 0
  Fully folded   → det(J) = 0

The Jacobian can't be inverted at
a singularity. UR5 throws a warning
when det(J) < 0.001.` },
    ],
  },

  {
    id:9, title:"Pick, Orient, Place: Full Assembly", badge:"Full Application", color:"#10b981",
    chapter:"ch4",
    tagline:"Wrist decoupling — the exact technique used in every 6-DOF industrial robot.",
    numJoints:3, lengths:[110,85,65], targetX:-120, targetY:130, targetAngle:45, tolerance:22, angleTolerance:12, scene:"assembly",
    starterCode:
`# FULL IK WITH ORIENTATION — wrist decoupling
# Used in ALL 6-DOF industrial robots (UR5, KUKA, ABB).
# L1=110mm, L2=85mm, L3=65mm
# Target: (-120, 130) at 45 degrees

L1 = 110
L2 = 85
L3 = 65
target_x = -120
target_y = 130
psi = radians(45)   # desired gripper orientation

# ── Step 1: wrist decoupling ───────────────────────────
# L3 points at angle psi from the wrist.
# Back-project by L3 to find where the WRIST must be:
wrist_x = target_x - L3 * cos(psi)
wrist_y = target_y - L3 * sin(psi)
print("wrist target:", round(wrist_x, 1), round(wrist_y, 1))

# ── Step 2: 2-link IK to reach the wrist ──────────────
D = (wrist_x**2 + wrist_y**2 - L1**2 - L2**2) / (2 * L1 * L2)
theta2 = atan2(-sqrt(1 - D**2), D)
theta1 = atan2(wrist_y, wrist_x) - atan2(L2*sin(theta2), L1 + L2*cos(theta2))

# ── Step 3: theta3 handles the remaining rotation ──────
theta3 = psi - theta1 - theta2

print("theta1 =", round(degrees(theta1), 1), "deg")
print("theta2 =", round(degrees(theta2), 1), "deg")
print("theta3 =", round(degrees(theta3), 1), "deg")

joint_angles = [degrees(theta1), degrees(theta2), degrees(theta3)]`,
    matlabStarterCode:
`%% Full IK with Orientation — Wrist Decoupling
%% L1=110mm, L2=85mm, L3=65mm  ->  Target: (-120,130) at 45 deg
L1 = 110;  L2 = 85;  L3 = 65;
px = -120;  py = 130;
psi = deg2rad(45);   %% desired end-effector angle (radians)

%% Step 1: back-project wrist by L3 along psi:
wx = px - L3*cos(psi);
wy = py - L3*sin(psi);
fprintf('wrist: %.1f %.1f', wx, wy)

%% Step 2: 2-link IK to reach the wrist
D = (wx^2 + wy^2 - L1^2 - L2^2) / (2*L1*L2);
theta2 = atan2(-sqrt(1 - D^2), D);
theta1 = atan2(wy, wx) - atan2(L2*sin(theta2), L1+L2*cos(theta2));

%% Step 3: theta3 satisfies orientation
theta3 = psi - theta1 - theta2;

fprintf('theta1 = %.1f deg', rad2deg(theta1))
fprintf('theta2 = %.1f deg', rad2deg(theta2))
fprintf('theta3 = %.1f deg', rad2deg(theta3))

joint_angles = [rad2deg(theta1), rad2deg(theta2), rad2deg(theta3)];`,
    tutorial:[
      { heading:"Wrist decoupling",
        body:`Split the problem in two:

1. Find where the WRIST must be
   (the joint before the last link):
   wrist = target − L₃·[cos ψ, sin ψ]

2. Solve 2-link IK for (L₁, L₂)
   to reach the wrist position.

3. θ₃ = ψ − θ₁ − θ₂
   (satisfies the orientation constraint)

This exact technique is used in every
industrial 6-DOF robot controller.` },
      { heading:"Real URScript code",
        body:`A UR5 move command:
  movel(p[x, y, z, rx, ry, rz], v=0.25)

The 6 params = position + rotation vector.
Internally the controller does:
  1. Build T_target (4×4 matrix)
  2. Extract wrist position via decoupling
  3. Solve shoulder IK (joints 1-3)
  4. Solve wrist IK analytically (joints 4-6)
  5. Interpolate and execute

Every waypoint in a robot program is
a 4×4 matrix solved this way.` },
      { heading:"Extending to 3D",
        body:`2D arm: 4×4 matrices, Rz only
3D arm: same 4×4, but use Rx, Ry, Rz

Rx(α) = [1    0       0    0]
        [0  cos α  -sin α  0]
        [0  sin α   cos α  0]
        [0    0       0    1]

Ry(β) = [cos β  0  sin β  0]
        [  0    1    0    0]
        [-sin β 0  cos β  0]
        [  0    0    0    1]

A UR5 chains 6 of these matrices.
T_total = T₁·T₂·T₃·T₄·T₅·T₆` },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  //  CHAPTER 5 — OBSTACLE AVOIDANCE
  // ──────────────────────────────────────────────────────────────

  {
    id:10, title:"The Blocker: Elbow Choice Matters", badge:"Obstacle Avoidance", color:"#f43f5e",
    chapter:"ch5",
    tagline:"Two valid IK solutions — only one avoids the obstacle. IK choice is an engineering decision.",
    numJoints:2, lengths:[130,100], targetX:130, targetY:150, tolerance:18, scene:"workshop",
    obstacles:[{ cx:100, cy:80, r:40, label:"BLOCK" }],
    starterCode:
`# OBSTACLE AVOIDANCE — Elbow-Up vs Elbow-Down
# L1=130mm, L2=100mm
# Target: (130, 150) — obstacle at (100, 80) r=40mm
#
# The elbow-UP solution cuts through the obstacle.
# Find the elbow-DOWN solution that avoids it.

import math
L1, L2 = 130, 100
px, py = 130, 150

D = (px**2 + py**2 - L1**2 - L2**2) / (2 * L1 * L2)
print("D =", round(D, 4))

# Elbow-UP (avoids nothing):
theta2_up = math.atan2(math.sqrt(1 - D**2), D)
theta1_up = math.atan2(py, px) - math.atan2(L2*math.sin(theta2_up), L1 + L2*math.cos(theta2_up))
print("Elbow-UP:  theta1 =", round(math.degrees(theta1_up),1), "theta2 =", round(math.degrees(theta2_up),1))

# TODO: compute the elbow-DOWN solution (negate sqrt term)
# theta2_down = ???
# theta1_down = ???

# Set the obstacle-avoiding solution:
joint_angles = [math.degrees(theta1_up), math.degrees(theta2_up)]`,
    matlabStarterCode:
`%% Obstacle Avoidance — Elbow Choice
%% L1=130mm, L2=100mm, Target: (130,150), obstacle at (100,80) r=40mm
L1 = 130; L2 = 100;
px = 130; py = 150;

D = (px^2 + py^2 - L1^2 - L2^2) / (2*L1*L2);
fprintf('D = %.4f\\n', D)

%% Elbow-UP (hits obstacle):
theta2_up = atan2(sqrt(1 - D^2), D);
theta1_up = atan2(py,px) - atan2(L2*sin(theta2_up), L1+L2*cos(theta2_up));
fprintf('Elbow-UP: theta1=%.1f  theta2=%.1f\\n', rad2deg(theta1_up), rad2deg(theta2_up))

%% TODO: compute elbow-DOWN (negate sqrt term)
%% theta2_down = ???
%% theta1_down = ???

%% Set the obstacle-avoiding solution:
joint_angles = [rad2deg(theta1_up), rad2deg(theta2_up)];`,
    tutorial:[
      { heading:"Two solutions to IK",
        body:`For any reachable 2-link target there
are exactly TWO IK solutions:

  Elbow-UP:   θ₂ = atan2(+√(1−D²), D)
  Elbow-DOWN: θ₂ = atan2(−√(1−D²), D)

They both reach the same end-effector
position, but the elbow swings to
opposite sides of the line.

In an empty workspace this doesn't
matter. Add an obstacle and suddenly
the choice is critical.` },
      { heading:"Collision checking",
        body:`To check if link i hits a sphere:

1. Parameterise the link segment:
   P(t) = A + t·(B−A),  t ∈ [0,1]

2. Find the t that minimises |P(t)−C|:
   t* = clamp(dot(C−A, B−A) / |B−A|², 0, 1)

3. Min distance = |P(t*)−C|

If min_dist < obstacle.radius → COLLISION.

Industrial robots run this check
every 8 ms in their safety PLC.` },
      { heading:"Path planning hint",
        body:`If BOTH IK solutions collide, the
arm must take a detour:

  1. Move to an intermediate via-point
     that clears the obstacle.
  2. Then move to the target.

This is the core idea behind RRT
(Rapidly-exploring Random Trees):
sample random configs, connect only
if collision-free, grow a tree to goal.

Today you just need elbow-down. :)` },
    ],
  },

  {
    id:11, title:"The Maze: Navigate Between Walls", badge:"Multi-Obstacle", color:"#f43f5e",
    chapter:"ch5",
    tagline:"Three joints, two walls — plan your path or the arm gets stuck.",
    numJoints:3, lengths:[120,90,70], targetX:-80, targetY:180, targetAngle:-30, tolerance:20, angleTolerance:15, scene:"assembly",
    obstacles:[
      { cx:30,  cy:100, r:35, label:"WALL-A" },
      { cx:-40, cy:110, r:30, label:"WALL-B" },
    ],
    starterCode:
`# MAZE NAVIGATION — 3-joint IK with obstacles
# L1=120  L2=90  L3=70
# Target: (-80, 180) at -30 deg
# Obstacles: WALL-A at (30,100) r=35  |  WALL-B at (-40,110) r=30
#
# Use wrist decoupling (M9 technique) then check your elbow choice.

import math
L1, L2, L3 = 120, 90, 70
px, py = -80, 180
psi = math.radians(-30)   # desired gripper angle

# Step 1: wrist decoupling
wx = px - L3 * math.cos(psi)
wy = py - L3 * math.sin(psi)
print("wrist:", round(wx,1), round(wy,1))

# Step 2: 2-link IK to wrist — try both elbow solutions
D = (wx**2 + wy**2 - L1**2 - L2**2) / (2 * L1 * L2)
if abs(D) > 1:
    print("OUT OF REACH")
else:
    # Try elbow-up first, then elbow-down if needed
    for sign in [1, -1]:
        t2 = math.atan2(sign * math.sqrt(1 - D**2), D)
        t1 = math.atan2(wy, wx) - math.atan2(L2*math.sin(t2), L1 + L2*math.cos(t2))
        t3 = psi - t1 - t2
        label = "UP" if sign > 0 else "DOWN"
        print(f"Elbow-{label}: {round(math.degrees(t1),1)}, {round(math.degrees(t2),1)}, {round(math.degrees(t3),1)}")

    # TODO: choose the solution that avoids both obstacles
    # joint_angles = [deg1, deg2, deg3]
    joint_angles = [math.degrees(t1), math.degrees(t2), math.degrees(t3)]`,
    matlabStarterCode:
`%% Maze Navigation — 3-joint IK with obstacles
%% L1=120  L2=90  L3=70
%% Target: (-80,180) at -30 deg
L1=120; L2=90; L3=70;
px=-80; py=180; psi=deg2rad(-30);

%% Step 1: wrist decoupling
wx = px - L3*cos(psi);
wy = py - L3*sin(psi);
fprintf('wrist: %.1f %.1f\\n', wx, wy)

%% Step 2: 2-link IK — try both elbow solutions
D = (wx^2 + wy^2 - L1^2 - L2^2) / (2*L1*L2);
for s = [1, -1]
    t2 = atan2(s*sqrt(1-D^2), D);
    t1 = atan2(wy,wx) - atan2(L2*sin(t2), L1+L2*cos(t2));
    t3 = psi - t1 - t2;
    if s > 0, label='UP'; else label='DOWN'; end
    fprintf('Elbow-%s: %.1f %.1f %.1f\\n', label, rad2deg(t1), rad2deg(t2), rad2deg(t3))
end

%% TODO: pick the collision-free solution
joint_angles = [rad2deg(t1), rad2deg(t2), rad2deg(t3)];`,
    tutorial:[
      { heading:"Multiple obstacles",
        body:`With multiple obstacles you check
each link against each obstacle.

Total checks = (numLinks) × (numObs)

If ANY check fails → plan rejected.

The arm must find a configuration
where ALL checks pass simultaneously.` },
      { heading:"Joint limits help",
        body:`Physical joints can't rotate freely.
UR5 real limits:
  J1: ±360°  J2/J3: ±120°
  J4: ±360°  J5: ±120°  J6: ±360°

Joint limits eliminate huge chunks of
configuration space — often the
infeasible obstacle-colliding configs
are outside limits anyway.

When you get stuck: check limits first.` },
      { heading:"Via-points",
        body:`If no single-step solution is clear:

1. Find a safe intermediate config Q_via
   (arm is clear of all obstacles)
2. Plan: Q_start → Q_via → Q_goal

Industrial robots call these
"via-points" or "blend points".

URScript:
  movej(q_via, a=1.4, v=1.0)
  movej(q_goal, a=1.4, v=1.0)

We'll build a full trajectory planner
in the 3D missions ahead.` },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  //  CHAPTER 6 — 3D ARM (UR5-STYLE 6-DOF)
  // ──────────────────────────────────────────────────────────────

  {
    id:12, title:"First 3D Move: FK on a Real Arm", badge:"3D Arm", color:"#00c2a8",
    chapter:"ch6",
    type:"3d",
    numJoints:6,
    tagline:"Six joints, six matrices — understand where the end-effector ends up in 3D space.",
    target3d:[489, 0, 136], target3dTol:35,
    starterCode:
`# 3D FORWARD KINEMATICS — UR5-style 6-DOF arm
# Axis sequence: Rz, Ry, Ry, Rz, Ry, Rz
# d offsets (mm):   [100, 0, 0, 0, 0, 0]
# a offsets (mm):   [0, 180, 150, 60, 80, 50]
#
# Goal: set joint_angles so the tool tip reaches
# roughly (489, 0, 136) mm from the base.

import math

def fk3d(joint_angles_deg):
    """Return (x,y,z) end-effector position in mm."""
    axes = ['z','y','y','z','y','z']
    d    = [100, 0, 0, 0, 0, 0]
    a    = [0, 180, 150, 60, 80, 50]

    def mat_mul(A, B):
        n = len(A)
        return [[sum(A[i][k]*B[k][j] for k in range(n)) for j in range(n)] for i in range(n)]

    def eye():
        return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]

    def Rz(t):
        c,s = math.cos(t),math.sin(t)
        return [[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]]

    def Ry(t):
        c,s = math.cos(t),math.sin(t)
        return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]]

    def Tx(v):
        return [[1,0,0,v],[0,1,0,0],[0,0,1,0],[0,0,0,1]]

    def Tz(v):
        return [[1,0,0,0],[0,1,0,0],[0,0,1,v],[0,0,0,1]]

    T = eye()
    for i in range(6):
        t = math.radians(joint_angles_deg[i])
        if d[i]:  T = mat_mul(T, Tz(d[i]))
        if axes[i] == 'z': T = mat_mul(T, Rz(t))
        else:               T = mat_mul(T, Ry(t))
        if a[i]:  T = mat_mul(T, Tx(a[i]))
    return T[0][3], T[1][3], T[2][3]

# ── Try this home-ish config ──────────────────────────────────
angles = [0, -30, 60, 0, -30, 0]
x, y, z = fk3d(angles)
print(f"End-effector: x={x:.1f}  y={y:.1f}  z={z:.1f} mm")

# Adjust angles until you hit the target ~(489, 0, 136) ± 35mm
joint_angles = angles`,
    matlabStarterCode:
`%% 3D Forward Kinematics — UR5-style 6-DOF
%% Axes: Rz Ry Ry Rz Ry Rz   d=[100 0 0 0 0 0]   a=[0 180 150 60 80 50]
%% Goal: reach (~489, 0, 136) mm

function T = fk3d(q_deg)
    axes = {'z','y','y','z','y','z'};
    d = [100 0 0 0 0 0];
    a = [0 180 150 60 80 50];
    T = eye(4);
    for i = 1:6
        t = deg2rad(q_deg(i));
        if d(i), T = T * Tz(d(i)); end
        if strcmp(axes{i},'z'), T = T*Rz(t); else T = T*Ry(t); end
        if a(i), T = T * Tx(a(i)); end
    end
end

angles = [0, -30, 60, 0, -30, 0];
T = fk3d(angles);
fprintf('EE: x=%.1f  y=%.1f  z=%.1f mm\\n', T(1,4), T(2,4), T(3,4))

%% Adjust angles to reach target (489, 0, 136) ± 35 mm
joint_angles = angles;

function M = Rz(t), c=cos(t);s=sin(t); M=[c -s 0 0;s c 0 0;0 0 1 0;0 0 0 1]; end
function M = Ry(t), c=cos(t);s=sin(t); M=[c 0 s 0;0 1 0 0;-s 0 c 0;0 0 0 1]; end
function M = Tx(v), M=eye(4); M(1,4)=v; end
function M = Tz(v), M=eye(4); M(3,4)=v; end`,
    tutorial:[
      { heading:"3D FK: chain of 4×4 matrices",
        body:`Each joint multiplies a new matrix:

T_total = T₁·T₂·T₃·T₄·T₅·T₆

Each Tᵢ is the product of:
  • A translation along the previous z-axis (d offset)
  • A rotation about z or y
  • A translation along the new x-axis (a offset)

The final column of T_total gives the
end-effector position [x, y, z, 1]ᵀ.` },
      { heading:"UR5 DH parameters",
        body:`d  = [100, 0,  0,   0,  0,  0 ] mm
a  = [0, 180, 150, 60, 80, 50] mm
α  = [90°, 0°, 0°, 90°, -90°, 0°]

(This sim uses a simplified form with
pure Ry/Rz — real UR5 uses full DH with
α twists. The FK logic is identical.)

Home config [0,0,0,0,0,0] gives the arm
pointing straight up with the tool at
(0, 0, 580) mm — 580 = sum of all d+a.` },
      { heading:"Reading the 4×4 matrix",
        body:`T = [ R  | p ]
    [ 0  | 1 ]

Top-left 3×3  R  = rotation matrix
  (columns = unit vectors of tool frame)
Top-right 3×1  p  = position (mm)
Bottom row = [0 0 0 1]

T[0][3] = x,  T[1][3] = y,  T[2][3] = z

Multiplying two 4×4 matrices composes
both the rotation AND the translation —
that's why homogeneous coords are used.` },
    ],
  },

  {
    id:13, title:"3D Target: Sweep the Workspace", badge:"3D Arm", color:"#00c2a8",
    chapter:"ch6",
    type:"3d",
    numJoints:6,
    tagline:"Rotate J1 and tune the shoulder — reach any point in the horizontal workspace.",
    target3d:[346, 346, 136], target3dTol:35,
    starterCode:
`# 3D FK CHALLENGE — reach a diagonal target
# Target: (346, 346, 136) mm  ±35 mm tolerance
# Hint: J1 (base Rz) rotates the whole arm about the vertical axis.
#       Setting J1 = 45° points the arm diagonally.
#       Then tune J2-J5 as in M12 for the right height/reach.

import math

def fk3d(joint_angles_deg):
    axes = ['z','y','y','z','y','z']
    d    = [100, 0, 0, 0, 0, 0]
    a    = [0, 180, 150, 60, 80, 50]
    def mm(A,B): return [[sum(A[i][k]*B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    def ey(): return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]
    def Rz(t): c,s=math.cos(t),math.sin(t); return [[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]]
    def Ry(t): c,s=math.cos(t),math.sin(t); return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]]
    def Tx(v): M=ey(); M[0][3]=v; return M
    def Tz(v): M=ey(); M[2][3]=v; return M
    T=ey()
    for i in range(6):
        t=math.radians(joint_angles_deg[i])
        if d[i]: T=mm(T,Tz(d[i]))
        if axes[i]=='z': T=mm(T,Rz(t))
        else: T=mm(T,Ry(t))
        if a[i]: T=mm(T,Tx(a[i]))
    return T[0][3], T[1][3], T[2][3]

# Start from M12's solution rotated by J1=45°
angles = [45, -30, 60, 0, -30, 0]
x, y, z = fk3d(angles)
print(f"End-effector: x={x:.1f}  y={y:.1f}  z={z:.1f} mm")
dist = math.sqrt((x-346)**2 + (y-346)**2 + (z-136)**2)
print(f"Distance from target: {dist:.1f} mm")

joint_angles = angles`,
    matlabStarterCode:
`%% 3D FK Challenge — reach (346, 346, 136) mm
%% Hint: J1=45 deg points the arm diagonally.

function T = fk3d(q_deg)
    axes = {'z','y','y','z','y','z'};
    d = [100 0 0 0 0 0];
    a = [0 180 150 60 80 50];
    T = eye(4);
    for i = 1:6
        t = deg2rad(q_deg(i));
        if d(i), T = T * Tz(d(i)); end
        if strcmp(axes{i},'z'), T = T*Rz(t); else T = T*Ry(t); end
        if a(i), T = T * Tx(a(i)); end
    end
end

angles = [45, -30, 60, 0, -30, 0];
T = fk3d(angles);
x=T(1,4); y=T(2,4); z=T(3,4);
fprintf('EE: x=%.1f  y=%.1f  z=%.1f mm\\n', x, y, z)
dist = sqrt((x-346)^2 + (y-346)^2 + (z-136)^2);
fprintf('Distance from target: %.1f mm\\n', dist)

joint_angles = angles;

function M = Rz(t), c=cos(t);s=sin(t); M=[c -s 0 0;s c 0 0;0 0 1 0;0 0 0 1]; end
function M = Ry(t), c=cos(t);s=sin(t); M=[c 0 s 0;0 1 0 0;-s 0 c 0;0 0 0 1]; end
function M = Tx(v), M=eye(4); M(1,4)=v; end
function M = Tz(v), M=eye(4); M(3,4)=v; end`,
    tutorial:[
      { heading:"J1: the base rotation",
        body:`J1 (Rz) rotates the ENTIRE arm about
the vertical (z) axis — like a turntable.

If your 2D arm solved (r, 0, z) you can
reach (r·cos θ, r·sin θ, z) by setting
J1 = θ.

So for a symmetric target at 45°:
  J1 = 45°
  J2..J5 = same as the straight-ahead case

This decoupling is why UR5 IK solves
J1 independently before joints 2-6.` },
      { heading:"Workspace in 3D",
        body:`The 6-DOF arm can reach any point in
a torus-shaped workspace:

  Inner radius ≈ |L_shoulder − reach|
  Outer radius ≈ L_shoulder + reach
  Height range ≈ base_d to full_reach

For our simplified arm:
  Max reach ≈ 180+150+60+80+50 = 520 mm
  Base height offset: d₁ = 100 mm

Points outside the torus are unreachable.
Points near the centre column are near
a singularity — avoid them.` },
      { heading:"From FK to IK in 3D",
        body:`In this mission you solve 3D FK manually
by adjusting angles until you hit the target.

Real 6-DOF analytic IK:
  1. Extract wrist position from target pose
  2. Use J1 = atan2(wy, wx)
  3. Solve J2/J3 via 2-link IK in the
     shoulder plane (same as M8)
  4. Solve J4/J5/J6 from orientation matrix
     using atan2 of matrix entries

We'll build the full IK solver in M14.` },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  //  CHAPTER 7 — 3D OBSTACLE AVOIDANCE
  // ──────────────────────────────────────────────────────────────

  {
    id:14, title:"3D Obstacle: Around the Column", badge:"3D Avoidance", color:"#f43f5e",
    chapter:"ch7",
    type:"3d", numJoints:6,
    tagline:"A column blocks the direct path — plan a via-point to sweep around it.",
    target3d:[300, 200, 120], target3dTol:40,
    obstacles3d:[{ cx:220, cy:100, cz:200, r:95, label:"COLUMN" }],
    starterCode:
`# 3D OBSTACLE AVOIDANCE — via-point planning
# Target: (300, 200, 120) mm  Obstacle: sphere at (220, 100, 200) r=95mm
#
# The column is in the space between the base and the target.
# A single-step move from home likely clips it.
#
# Strategy: find a "via-point" config where the arm clears the column,
# then set joint_angles to the final target config.
#
# Use the console's collision check to verify: ✓ or ✗

import math

def fk3d(q):
    axes = ['z','y','y','z','y','z']
    d    = [100, 0, 0, 0, 0, 0]
    a    = [0, 180, 150, 60, 80, 50]
    def mm(A,B): return [[sum(A[i][k]*B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    def ey(): return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]
    def Rz(t): c,s=math.cos(t),math.sin(t); return [[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]]
    def Ry(t): c,s=math.cos(t),math.sin(t); return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]]
    def Tx(v): M=ey(); M[0][3]=v; return M
    def Tz(v): M=ey(); M[2][3]=v; return M
    T=ey()
    for i in range(6):
        t=math.radians(q[i])
        if d[i]: T=mm(T,Tz(d[i]))
        if axes[i]=='z': T=mm(T,Rz(t))
        else: T=mm(T,Ry(t))
        if a[i]: T=mm(T,Tx(a[i]))
    return T[0][3], T[1][3], T[2][3]

# The COLUMN is at (220, 100, 200) with radius 95mm.
# J1 = atan2(200, 300) ≈ 33.7° points the arm toward the target.
# But the shoulder region passes near the column at that angle.
#
# HINT: Swing J1 further (e.g. 50-60°) to arc PAST the column,
#       or raise J2/J3 higher so the elbow clears above it.

# Try this config — check if it collides, then tune:
angles = [34, -35, 55, 0, -20, 0]
x, y, z = fk3d(angles)
print(f"EE: x={x:.1f}  y={y:.1f}  z={z:.1f} mm")
dist = math.sqrt((x-300)**2 + (y-200)**2 + (z-120)**2)
print(f"Distance from target: {dist:.1f} mm")

joint_angles = angles`,
    matlabStarterCode:
`%% 3D Obstacle Avoidance — Column at (220,100,200) r=95mm
%% Target: (300, 200, 120) mm
function T = fk3d(q)
    axes = {'z','y','y','z','y','z'};
    d = [100 0 0 0 0 0]; a = [0 180 150 60 80 50];
    T = eye(4);
    for i = 1:6
        t = deg2rad(q(i));
        if d(i), T = T * Tz(d(i)); end
        if strcmp(axes{i},'z'), T = T*Rz(t); else T = T*Ry(t); end
        if a(i), T = T * Tx(a(i)); end
    end
end

angles = [34, -35, 55, 0, -20, 0];
T = fk3d(angles);
fprintf('EE: x=%.1f  y=%.1f  z=%.1f mm\\n', T(1,4), T(2,4), T(3,4))
dist = sqrt((T(1,4)-300)^2 + (T(2,4)-200)^2 + (T(3,4)-120)^2);
fprintf('Distance from target: %.1f mm\\n', dist)

joint_angles = angles;

function M = Rz(t), c=cos(t);s=sin(t); M=[c -s 0 0;s c 0 0;0 0 1 0;0 0 0 1]; end
function M = Ry(t), c=cos(t);s=sin(t); M=[c 0 s 0;0 1 0 0;-s 0 c 0;0 0 0 1]; end
function M = Tx(v), M=eye(4); M(1,4)=v; end
function M = Tz(v), M=eye(4); M(3,4)=v; end`,
    tutorial:[
      { heading:"Via-point planning",
        body:`Direct path = straight line in JOINT space.
The arm doesn't follow a straight Cartesian path.

If the direct path collides with an obstacle:
  1. Find a via-point Q_via that clears the obstacle
  2. Plan: Home → Q_via → Q_goal
  3. Check each segment for collisions

The via-point must be collision-free by itself
AND the path through it must also be clear.

Industrial robot software (ROBOGUIDE, RobotStudio)
does this with RRT or potential-field planning.
Here you'll do it by hand — which is what you do
on the real teach pendant too.` },
      { heading:"Shoulder vs. elbow clearance",
        body:`Two places an arm can collide with obstacles:

SHOULDER REGION (links 1-2):
  Controlled by J1 (base rotation) and J2 (shoulder lift).
  Swing J1 wider to arc around a column.

ELBOW REGION (links 3-4):
  Controlled by J3 (elbow).
  Raise J3 to lift the elbow OVER an obstacle.

For this column:
  • Increasing J1 by ~25° swings the shoulder past it.
  • OR: raise J2/J3 to push the elbow above the sphere.

Try both approaches and compare joint motion.` },
      { heading:"Real robot approach",
        body:`On a real Fanuc, you'd do this in ROBOGUIDE:

1. Import CAD model of the obstacle
2. Set up collision detection zones
3. Jog the arm manually around the obstacle
4. Record the via-point

OR use the KAREL macro:
  CALL FIND_VIA_POINT(obs_pos, goal_pos, via_point)

Industrial motion planners (Fanuc's iRVision,
KUKA WorkVisual) automate this via-point
search — but they still fail without good
initial joint seeds.

Understanding the geometry (like we're doing
here) is what lets you debug those failures.` },
    ],
  },

  {
    id:15, title:"Tool Frame: Where's the Real TCP?", badge:"UTOOL", color:"#818cf8",
    chapter:"ch7",
    type:"3d", numJoints:6,
    tagline:"The flange is NOT the tool tip. Define UTOOL and compute the actual TCP position.",
    target3d:[350, 0, 80], target3dTol:35,
    starterCode:
`# TOOL FRAME (UTOOL) — the single most important Fanuc concept
#
# Problem: a welding torch is mounted 140mm along the J6 flange's Z-axis.
# The FK gives you the FLANGE position.
# The robot must position the TORCH TIP at the target, not the flange.
#
# T_tcp = T_arm × T_tool     (the tool frame is an extra transform)
# T_tool = simple 140mm offset along flange-Z
#
# If the flange Z-axis points along world +Z:
#   TCP = flange_position + [0, 0, 140] mm
#
# Target TCP position: (350, 0, 220) mm
# → Flange must be at: (350, 0, ??? ) with Z-axis pointing UP

import math

TOOL_LENGTH = 140  # mm along flange Z-axis

def fk3d_full(q):
    """Returns (flange_x, flange_y, flange_z, tool_z_x, tool_z_y, tool_z_z)."""
    axes = ['z','y','y','z','y','z']
    d    = [100, 0, 0, 0, 0, 0]
    a    = [0, 180, 150, 60, 80, 50]
    def mm(A,B): return [[sum(A[i][k]*B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    def ey(): return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]
    def Rz(t): c,s=math.cos(t),math.sin(t); return [[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]]
    def Ry(t): c,s=math.cos(t),math.sin(t); return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]]
    def Tx(v): M=ey(); M[0][3]=v; return M
    def Tz(v): M=ey(); M[2][3]=v; return M
    T=ey()
    for i in range(6):
        t=math.radians(q[i])
        if d[i]: T=mm(T,Tz(d[i]))
        if axes[i]=='z': T=mm(T,Rz(t))
        else: T=mm(T,Ry(t))
        if a[i]: T=mm(T,Tx(a[i]))
    # Flange position
    fx, fy, fz = T[0][3], T[1][3], T[2][3]
    # Tool Z-axis = 3rd column of the rotation matrix
    tz_x, tz_y, tz_z = T[0][2], T[1][2], T[2][2]
    # TCP = flange + TOOL_LENGTH * tool_Z_axis
    tcp_x = fx + TOOL_LENGTH * tz_x
    tcp_y = fy + TOOL_LENGTH * tz_y
    tcp_z = fz + TOOL_LENGTH * tz_z
    return fx, fy, fz, tcp_x, tcp_y, tcp_z, tz_x, tz_y, tz_z

# Goal: TCP at (350, 0, 220) mm
# Hint: J5 controls the wrist tilt. J5=0 means tool Z ≈ world -X.
# J5=90 means tool Z ≈ world +Z (pointing up), so TCP = flange + [0,0,140].
# Try tuning J5 and then adjusting J1/J2/J3 to put the FLANGE at (350,0,80).

angles = [0, -30, 60, 0, 90, 0]
fx,fy,fz, tcx,tcy,tcz, tzx,tzy,tzz = fk3d_full(angles)
print(f"Flange:  ({fx:.1f}, {fy:.1f}, {fz:.1f}) mm")
print(f"Tool Z:  ({tzx:.3f}, {tzy:.3f}, {tzz:.3f})")
print(f"TCP:     ({tcx:.1f}, {tcy:.1f}, {tcz:.1f}) mm")
tcp_dist = math.sqrt((tcx-350)**2 + (tcy-0)**2 + (tcz-220)**2)
print(f"TCP distance from target (350,0,220): {tcp_dist:.1f} mm")

# joint_angles is checked against FLANGE target (350, 0, 80)
# Get both flange AND tcp on target!
joint_angles = angles`,
    matlabStarterCode:
`%% Tool Frame (UTOOL) — Fanuc's most important concept
%% TCP target: (350, 0, 220) mm  |  Tool length: 140mm along flange Z
%% Flange target (with tool Z pointing up): (350, 0, 80) mm

TOOL_LENGTH = 140;

function [fx,fy,fz,tcx,tcy,tcz,tzx,tzy,tzz] = fk3d_full(q, tl)
    axes = {'z','y','y','z','y','z'};
    d = [100 0 0 0 0 0]; a = [0 180 150 60 80 50];
    T = eye(4);
    for i = 1:6
        t = deg2rad(q(i));
        if d(i), T = T * Tz(d(i)); end
        if strcmp(axes{i},'z'), T = T*Rz(t); else T = T*Ry(t); end
        if a(i), T = T * Tx(a(i)); end
    end
    fx=T(1,4); fy=T(2,4); fz=T(3,4);
    tzx=T(1,3); tzy=T(2,3); tzz=T(3,3);  %% 3rd column = tool Z
    tcx=fx+tl*tzx; tcy=fy+tl*tzy; tcz=fz+tl*tzz;
end

angles = [0, -30, 60, 0, 90, 0];
[fx,fy,fz,tcx,tcy,tcz,tzx,tzy,tzz] = fk3d_full(angles, TOOL_LENGTH);
fprintf('Flange: (%.1f, %.1f, %.1f) mm\\n', fx, fy, fz)
fprintf('Tool Z: (%.3f, %.3f, %.3f)\\n', tzx, tzy, tzz)
fprintf('TCP:    (%.1f, %.1f, %.1f) mm\\n', tcx, tcy, tcz)
tcp_dist = sqrt((tcx-350)^2 + (tcy-0)^2 + (tcz-220)^2);
fprintf('TCP distance from target (350,0,220): %.1f mm\\n', tcp_dist)

joint_angles = angles;

function M = Rz(t), c=cos(t);s=sin(t); M=[c -s 0 0;s c 0 0;0 0 1 0;0 0 0 1]; end
function M = Ry(t), c=cos(t);s=sin(t); M=[c 0 s 0;0 1 0 0;-s 0 c 0;0 0 0 1]; end
function M = Tx(v), M=eye(4); M(1,4)=v; end
function M = Tz(v), M=eye(4); M(3,4)=v; end`,
    tutorial:[
      { heading:"Why UTOOL matters",
        body:`Every robot leaves the factory with the
TOOL FRAME set to zero — meaning the
controller thinks the tool tip IS the J6 flange.

Before ANY work, you MUST define UTOOL:
  X, Y, Z offset from flange to tool tip
  Rx, Ry, Rz rotation of the tool

Set wrongly: the robot will miss every target.
Set correctly: the robot moves the TOOL TIP
  to the programmed positions, not the flange.

On Fanuc TP:
  UTOOL_NUM = 1
  UTOOL[1] = [0.0, 0.0, 140.0, 0.0, 0.0, 0.0]
  (X Y Z Rx Ry Rz from flange)

This sim: T_tcp = T_arm × Tz(TOOL_LENGTH).` },
      { heading:"The 3rd column is tool-Z",
        body:`The rotation matrix has 3 columns:
  Col 1 → tool X-axis in world frame
  Col 2 → tool Y-axis in world frame
  Col 3 → tool Z-axis in world frame

TCP = flange + tool_length × col3

When J5=0 (UR5-style home):
  The tool Z-axis points along world -X.
  TCP = flange + tool_len * [-1, 0, 0]

When J5=90°:
  Tool Z rotates 90° → points along world +Z.
  TCP = flange + tool_len * [0, 0, +1]

This is why J5 is called the "WRIST PITCH" —
it changes the tool direction.` },
      { heading:"Tool frame calibration",
        body:`How Fanuc REALLY computes UTOOL:
"3-point method":
  1. Touch a sharp point on the workbench
     with the tool tip from 3 different
     arm orientations.
  2. The controller solves for the TCP offset
     that makes all 3 tool-tip positions match.

"6-point method": same + 3 extra orientations
  to also determine the tool ROTATION.

After calibration, the controller stores the
result in UTOOL[n] — and every motion command
now automatically accounts for the tool.

In this mission: you're doing the math yourself
so you understand what the controller does.` },
    ],
  },

  // ──────────────────────────────────────────────────────────────
  //  CHAPTER 8 — PICK AND PLACE + REAL APPLICATIONS
  // ──────────────────────────────────────────────────────────────

  {
    id:16, title:"Pick & Place: The 7-Point Pattern", badge:"Industry Standard", color:"#f59e0b",
    chapter:"ch8",
    type:"3d", numJoints:6,
    tagline:"Every industrial robot program is built around this sequence — learn it cold.",
    target3d:[0, 400, 80], target3dTol:40,
    starterCode:
`# PICK AND PLACE — The 7-Point Industrial Standard
#
# Every production robot cell uses this pattern:
#   P1: Approach Pick  (JOINT move, fast)
#   P2: Pick           (LINEAR move, slow, FINE stop)
#      [gripper CLOSE]
#   P3: Depart Pick    (LINEAR move, slow)
#   P4: Transport      (JOINT move, fast, CNT blended)
#   P5: Approach Place (JOINT move, medium)
#   P6: Place          (LINEAR move, slow, FINE stop)
#      [gripper OPEN]
#   P7: Depart Place   (LINEAR move, slow)
#
# In this sim: PICK at (400, 0, 80), PLACE at (0, 400, 80).
# Approach height = 160mm above each (z+160).
# Compute joint configs for each point, then set joint_angles = P6 (place).

import math

def fk3d(q):
    axes = ['z','y','y','z','y','z']
    d    = [100, 0, 0, 0, 0, 0]
    a    = [0, 180, 150, 60, 80, 50]
    def mm(A,B): return [[sum(A[i][k]*B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    def ey(): return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]
    def Rz(t): c,s=math.cos(t),math.sin(t); return [[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]]
    def Ry(t): c,s=math.cos(t),math.sin(t); return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]]
    def Tx(v): M=ey(); M[0][3]=v; return M
    def Tz(v): M=ey(); M[2][3]=v; return M
    T=ey()
    for i in range(6):
        t=math.radians(q[i])
        if d[i]: T=mm(T,Tz(d[i]))
        if axes[i]=='z': T=mm(T,Rz(t))
        else: T=mm(T,Ry(t))
        if a[i]: T=mm(T,Tx(a[i]))
    return T[0][3], T[1][3], T[2][3]

# ── Known configs (tune these using FK output) ──────────────────
# P1/P3 = approach/depart PICK  at (400, 0, 240):  J1≈0°, arm high
# P2    = PICK              at (400, 0, 80):        J1≈0°, arm low
P1_approach_pick   = [0,  -20, 40,  0, -20,  0]   # tune to (400,0,240)
P2_pick            = [0,  -40, 60,  0,  -20,  0]   # tune to (400,0,80)
P3_depart_pick     = P1_approach_pick              # same as approach

# P4 = transport (fast joint move — arm config between pick and place)
P4_transport       = [45, -30, 50,  0, -20,  0]   # mid-air

# P5/P7 = approach/depart PLACE at (0, 400, 240): J1≈90°
# P6    = PLACE             at (0, 400, 80):       J1≈90°
P5_approach_place  = [90, -20, 40,  0, -20,  0]   # tune to (0,400,240)
P6_place           = [90, -40, 60,  0, -20,  0]   # tune to (0,400,80)
P7_depart_place    = P5_approach_place             # same as approach

# Print all positions
for name, cfg in [
    ("P1 approach-pick",  P1_approach_pick),
    ("P2 PICK",           P2_pick),
    ("P4 transport",      P4_transport),
    ("P5 approach-place", P5_approach_place),
    ("P6 PLACE",          P6_place),
]:
    x,y,z = fk3d(cfg)
    print(f"{name}: ({x:.0f}, {y:.0f}, {z:.0f}) mm")

# ── The program (Fanuc TP equivalent) ──────────────────────────
print("\\n-- Fanuc TP program would be:")
print("J P[1] 100% CNT100   ; // approach pick (fast)")
print("L P[2] 200mm/sec FINE; // pick (slow, stop exactly)")
print("DO[1]=ON             ; // gripper CLOSE")
print("WAIT .3(sec)         ;")
print("L P[3] 200mm/sec FINE; // depart pick")
print("J P[4]  80% CNT100   ; // transport (fast)")
print("J P[5]  80% CNT50    ; // approach place")
print("L P[6] 200mm/sec FINE; // place (slow, stop exactly)")
print("DO[1]=OFF            ; // gripper OPEN")
print("WAIT .3(sec)         ;")
print("L P[7] 200mm/sec FINE; // depart place")

# Win condition: reach the PLACE position
joint_angles = P6_place`,
    matlabStarterCode:
`%% Pick and Place — 7-Point Industrial Pattern
%% PICK at (400,0,80) | PLACE at (0,400,80) | Approach height 160mm

function T = fk3d(q)
    axes = {'z','y','y','z','y','z'};
    d = [100 0 0 0 0 0]; a = [0 180 150 60 80 50];
    T = eye(4);
    for i = 1:6
        t = deg2rad(q(i));
        if d(i), T = T * Tz(d(i)); end
        if strcmp(axes{i},'z'), T = T*Rz(t); else T = T*Ry(t); end
        if a(i), T = T * Tx(a(i)); end
    end
end

P1 = [0,  -20, 40, 0, -20, 0];   %% approach pick
P2 = [0,  -40, 60, 0, -20, 0];   %% PICK
P4 = [45, -30, 50, 0, -20, 0];   %% transport
P5 = [90, -20, 40, 0, -20, 0];   %% approach place
P6 = [90, -40, 60, 0, -20, 0];   %% PLACE

points = {P1, P2, P4, P5, P6};
names  = {'P1 approach-pick','P2 PICK','P4 transport','P5 approach-place','P6 PLACE'};
for k = 1:5
    T = fk3d(points{k});
    fprintf('%s: (%.0f, %.0f, %.0f) mm\\n', names{k}, T(1,4), T(2,4), T(3,4))
end

joint_angles = P6;  %% win condition: reach PLACE

function M = Rz(t), c=cos(t);s=sin(t); M=[c -s 0 0;s c 0 0;0 0 1 0;0 0 0 1]; end
function M = Ry(t), c=cos(t);s=sin(t); M=[c 0 s 0;0 1 0 0;-s 0 c 0;0 0 0 1]; end
function M = Tx(v), M=eye(4); M(1,4)=v; end
function M = Tz(v), M=eye(4); M(3,4)=v; end`,
    tutorial:[
      { heading:"Why 7 points?",
        body:`You could just program PICK and PLACE.
But the robot would CRASH.

The robot doesn't know what's between the
two points — it takes the fastest path in
joint space, swinging through whatever is
in the way.

The 7-point pattern solves this:
  • Approach from directly above (clear path)
  • Depart straight up (no sweep into fixtures)
  • Transport in open air at mid height
  • These 3 "safety moves" prevent 90% of
    crashes in production cells.

This is taught on day 1 of every robot
training course worldwide.` },
      { heading:"FINE vs CNT in Fanuc TP",
        body:`FINE: robot stops EXACTLY at the point.
  → Use for pick, place, any contact.
  → Slow — full deceleration to zero.

CNT0..CNT100: continuous (blended) termination.
  → Robot rounds the corner; never fully stops.
  → CNT100 = maximum rounding (fastest).
  → Use for via-points, transport moves.

Example path:
  J P[1] 80% CNT100  ; // approach — fast, blended
  L P[2] 200mm/sec FINE ; // pick — must stop exactly
  DO[1]=ON ;             // gripper fires only when stopped
  L P[3] 200mm/sec CNT50 ; // depart — slight blend OK

If you use CNT at a pick point, the gripper
fires BEFORE the robot reaches the part.
Everything breaks. Use FINE at contact points.` },
      { heading:"J vs L motion types",
        body:`J (Joint): each joint moves independently
  at its own speed to reach the target config.
  → Fastest motion, unpredictable Cartesian path.
  → Use for transport, approach, depart in open air.

L (Linear): robot interpolates a STRAIGHT LINE
  in Cartesian space (X,Y,Z).
  → Slower, uses more computation.
  → Required when path shape matters:
    - Welding (torch must travel a weld seam)
    - Dispensing (glue path must be straight)
    - Pick/place (approach must be vertical)

C (Circular): interpolates an arc.
  → Defined by start, via, end points.

Rule of thumb:
  Approach/depart = L (controlled path)
  Transport = J (fast, don't care about path)` },
    ],
  },

  {
    id:17, title:"User Frame: Work in Part Coordinates", badge:"UFRAME", color:"#818cf8",
    chapter:"ch8",
    type:"3d", numJoints:6,
    tagline:"Define a coordinate frame on the workpiece — then program in part coordinates.",
    target3d:[293, 293, 150], target3dTol:40,
    starterCode:
`# USER FRAME (UFRAME) — working in part coordinates
#
# In Fanuc: you define a User Frame on the workpiece.
# All P[] positions are then given in the PART frame, not world frame.
#
# This mission: A fixture is placed at world position (200, 200, 0),
# rotated 45° around Z.
#
# User Frame definition:
#   T_UF = Rz(45°) then Tx(200), Ty(200) → a 4×4 matrix
#   T_world = T_UF × T_part
#
# Part-frame target: (100, 0, 150) — straight ahead in the part frame.
# In world coords this maps to ~(293, 293, 150) after the 45° rotation.

import math

def fk3d(q):
    axes = ['z','y','y','z','y','z']
    d    = [100, 0, 0, 0, 0, 0]
    a    = [0, 180, 150, 60, 80, 50]
    def mm(A,B): return [[sum(A[i][k]*B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    def ey(): return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]
    def Rz(t): c,s=math.cos(t),math.sin(t); return [[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]]
    def Ry(t): c,s=math.cos(t),math.sin(t); return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]]
    def Tx(v): M=ey(); M[0][3]=v; return M
    def Tz(v): M=ey(); M[2][3]=v; return M
    def matmul(A,B): return [[sum(A[i][k]*B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    T=ey()
    for i in range(6):
        t=math.radians(q[i])
        if d[i]: T=matmul(T,Tz(d[i]))
        if axes[i]=='z': T=matmul(T,Rz(t))
        else: T=matmul(T,Ry(t))
        if a[i]: T=matmul(T,Tx(a[i]))
    return T

# ── Step 1: Build the User Frame transform ────────────────────
angle_uf = math.radians(45)
c, s = math.cos(angle_uf), math.sin(angle_uf)

# T_UF: rotate 45° then translate to (200, 200, 0)
T_UF = [
    [c, -s, 0, 200],
    [s,  c, 0, 200],
    [0,  0, 1,   0],
    [0,  0, 0,   1],
]

# ── Step 2: Target in PART frame → transform to WORLD frame ──
# Part-frame target: x=100, y=0, z=150
def transform_point(T, px, py, pz):
    wx = T[0][0]*px + T[0][1]*py + T[0][2]*pz + T[0][3]
    wy = T[1][0]*px + T[1][1]*py + T[1][2]*pz + T[1][3]
    wz = T[2][0]*px + T[2][1]*py + T[2][2]*pz + T[2][3]
    return wx, wy, wz

part_target = (100, 0, 150)
world_target = transform_point(T_UF, *part_target)
print(f"Part  frame target: {part_target}")
print(f"World frame target: ({world_target[0]:.1f}, {world_target[1]:.1f}, {world_target[2]:.1f})")

# ── Step 3: Solve FK to reach world target ─────────────────────
# J1 = atan2(wy, wx) for the rotated target
J1 = math.degrees(math.atan2(world_target[1], world_target[0]))
print(f"J1 for world target: {J1:.1f}°")

angles = [J1, -35, 55, 0, -20, 0]
T = fk3d(angles)
print(f"EE: ({T[0][3]:.1f}, {T[1][3]:.1f}, {T[2][3]:.1f}) mm")

joint_angles = angles`,
    matlabStarterCode:
`%% User Frame (UFRAME) — work in part coordinates
%% Fixture at world (200,200,0) rotated 45° around Z
%% Part-frame target: (100, 0, 150)

angle_uf = deg2rad(45);
c = cos(angle_uf); s = sin(angle_uf);
T_UF = [c -s 0 200; s c 0 200; 0 0 1 0; 0 0 0 1];

part_target = [100; 0; 150; 1];
world_h = T_UF * part_target;
fprintf('World target: (%.1f, %.1f, %.1f) mm\\n', world_h(1), world_h(2), world_h(3))

J1 = rad2deg(atan2(world_h(2), world_h(1)));
fprintf('J1: %.1f deg\\n', J1)

angles = [J1, -35, 55, 0, -20, 0];

function T = fk3d(q)
    axes = {'z','y','y','z','y','z'};
    d = [100 0 0 0 0 0]; a = [0 180 150 60 80 50];
    T = eye(4);
    for i = 1:6
        t = deg2rad(q(i));
        if d(i), T = T * Tz(d(i)); end
        if strcmp(axes{i},'z'), T = T*Rz(t); else T = T*Ry(t); end
        if a(i), T = T * Tx(a(i)); end
    end
end

T = fk3d(angles);
fprintf('EE: (%.1f, %.1f, %.1f) mm\\n', T(1,4), T(2,4), T(3,4))
joint_angles = angles;

function M = Rz(t), c=cos(t);s=sin(t); M=[c -s 0 0;s c 0 0;0 0 1 0;0 0 0 1]; end
function M = Ry(t), c=cos(t);s=sin(t); M=[c 0 s 0;0 1 0 0;-s 0 c 0;0 0 0 1]; end
function M = Tx(v), M=eye(4); M(1,4)=v; end
function M = Tz(v), M=eye(4); M(3,4)=v; end`,
    tutorial:[
      { heading:"Why User Frames?",
        body:`Without UFRAME: every target must be in
WORLD coordinates — robot-base origin.

Problem: the fixture moves 5mm.
  → You must re-teach ALL 47 points.

With UFRAME: targets are in PART coords.
  → Move the fixture? Update UFRAME only.
  → All 47 points update automatically.

Fanuc UFRAME setup:
  1. Touch 3 reference points on the fixture
     (origin, X-direction, XY-plane point)
  2. Controller computes T_UF automatically
  3. Set UFRAME_NUM = 1 in your program

The math: T_world = T_UF × T_part
This is the same matrix chain you've been
building all along — now the chain has one
more frame.` },
      { heading:"Frames on frames",
        body:`Real programs stack multiple frames:

  T_world_TCP = T_WORLD_ROBOT
              × T_ROBOT_UFRAME
              × T_UFRAME_UTOOL
              × T_UTOOL_TCP

Every level can be calibrated independently:
  WORLD frame: robot base in factory layout
  UFRAME: workpiece position
  UTOOL:  tool tip offset

Change one frame → all dependent positions
update automatically.

This is why experienced robot programmers
spend most setup time on frame calibration —
it makes everything else easy.` },
      { heading:"Palletizing = user frames",
        body:`Palletizing (stacking boxes on a pallet):

Define UFRAME at pallet corner.
Part-frame positions are offsets within pallet:
  row 0, col 0: (0,   0,   0)
  row 0, col 1: (0,   400, 0)
  row 1, col 0: (300, 0,   0)
  ...

In Fanuc Karel/TP, you compute each position:
  PR[1] = LPOS  ; // get current UF position
  PR[1].x = row * ROW_PITCH
  PR[1].y = col * COL_PITCH
  MOVE L PR[1] ;

The robot places at the computed offset.
One program, any size pallet.` },
    ],
  },

  {
    id:18, title:"Fanuc TP: Read Real Robot Code", badge:"Fanuc TP", color:"#f97316",
    chapter:"ch8",
    type:"3d", numJoints:6,
    tagline:"Those pages you couldn't read? Let's decode them — and write our own.",
    target3d:[350, 200, 120], target3dTol:40,
    starterCode:
`# FANUC TP CODE GENERATOR
#
# A real Fanuc TP program looks like this (from the actual teach pendant):
#
#  /PROG PICK_PLACE_v1
#  /ATTR
#    OWNER = MNEDITOR
#    COMMENT = "Pick box from conv A"
#  /MN
#    1: J P[1] 100% CNT100 ;          // home to approach pick (joint, fast, blend)
#    2: L P[2] 200mm/sec FINE ;        // descend to pick (linear, slow, stop)
#    3: DO[1:GripperClose]=ON ;        // close gripper
#    4: WAIT   .30(sec) ;              // wait for grip
#    5: L P[3] 300mm/sec FINE ;        // depart pick (linear)
#    6: J P[4]  80% CNT100 ;           // transport to place area (joint, blend)
#    7: J P[5]  60% CNT50 ;            // approach place (joint, blend into next)
#    8: L P[6] 150mm/sec FINE ;        // place (linear, stop)
#    9: DO[1:GripperClose]=OFF ;       // open gripper
#   10: WAIT   .30(sec) ;
#   11: L P[7] 300mm/sec FINE ;        // depart place (linear)
#   12: J P[8] 100% CNT100 ;           // return to home
#  /END
#
# YOUR MISSION: write Python that generates Fanuc TP code
# from a list of waypoints, and reach the target with joint_angles.

import math

def fk3d(q):
    axes = ['z','y','y','z','y','z']
    d=[100,0,0,0,0,0]; a=[0,180,150,60,80,50]
    def mm(A,B): return [[sum(A[i][k]*B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    def ey(): return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]
    def Rz(t): c,s=math.cos(t),math.sin(t); return [[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]]
    def Ry(t): c,s=math.cos(t),math.sin(t); return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]]
    def Tx(v): M=ey(); M[0][3]=v; return M
    def Tz(v): M=ey(); M[2][3]=v; return M
    T=ey()
    for i in range(6):
        t=math.radians(q[i])
        if d[i]: T=mm(T,Tz(d[i]))
        if axes[i]=='z': T=mm(T,Rz(t))
        else: T=mm(T,Ry(t))
        if a[i]: T=mm(T,Tx(a[i]))
    return T[0][3], T[1][3], T[2][3]

# ── Define your waypoints ─────────────────────────────────────
HOME           = [0,   0,   0,  0,  0,  0]
APPROACH_PICK  = [0,  -25, 45,  0, -20, 0]
PICK           = [0,  -45, 65,  0, -20, 0]
TRANSPORT      = [20, -30, 50,  0, -20, 0]
APPROACH_PLACE = [35, -30, 50,  0, -20, 0]
PLACE          = [35, -45, 65,  0, -20, 0]

waypoints = [
    ("HOME",          HOME,          "J",  "100%",      "CNT100"),
    ("APPROACH_PICK", APPROACH_PICK, "J",  "80%",       "CNT100"),
    ("PICK",          PICK,          "L",  "200mm/sec", "FINE"),
    ("TRANSPORT",     TRANSPORT,     "J",  "80%",       "CNT100"),
    ("APPROACH_PL",   APPROACH_PLACE,"J",  "60%",       "CNT50"),
    ("PLACE",         PLACE,         "L",  "150mm/sec", "FINE"),
]

# ── Generate Fanuc TP code ─────────────────────────────────────
def gen_tp(prog_name, waypoints_list, gripper_close_at, gripper_open_at):
    lines = [f"/PROG {prog_name}", "/MN"]
    line_n = 1
    for i, (name, cfg, mtype, speed, term) in enumerate(waypoints_list):
        x, y, z = fk3d(cfg)
        comment = f"P[{i+1}] = ({x:.0f},{y:.0f},{z:.0f})mm"
        lines.append(f"  {line_n:2d}: {mtype} P[{i+1}] {speed} {term} ; // {name}: {comment}")
        line_n += 1
        if name == gripper_close_at:
            lines.append(f"  {line_n:2d}: DO[1:Gripper]=ON ;")
            lines.append(f"  {line_n+1:2d}: WAIT .30(sec) ;")
            line_n += 2
        if name == gripper_open_at:
            lines.append(f"  {line_n:2d}: DO[1:Gripper]=OFF ;")
            lines.append(f"  {line_n+1:2d}: WAIT .30(sec) ;")
            line_n += 2
    lines.append("/END")
    return "\\n".join(lines)

tp_code = gen_tp("MISSION_18", waypoints, "PICK", "PLACE")
print(tp_code)

# Win: reach the PLACE position
joint_angles = PLACE`,
    matlabStarterCode:
`%% Fanuc TP Code Generator — Mission 18
%% Read the theory panel to understand the TP syntax,
%% then tune the waypoints to hit the target.

function T = fk3d(q)
    axes = {'z','y','y','z','y','z'};
    d = [100 0 0 0 0 0]; a = [0 180 150 60 80 50];
    T = eye(4);
    for i = 1:6
        t = deg2rad(q(i));
        if d(i), T = T * Tz(d(i)); end
        if strcmp(axes{i},'z'), T = T*Rz(t); else T = T*Ry(t); end
        if a(i), T = T * Tx(a(i)); end
    end
end

HOME           = [0,   0,  0, 0,  0, 0];
APPROACH_PICK  = [0,  -25,45, 0,-20, 0];
PICK           = [0,  -45,65, 0,-20, 0];
TRANSPORT      = [20, -30,50, 0,-20, 0];
APPROACH_PLACE = [35, -30,50, 0,-20, 0];
PLACE          = [35, -45,65, 0,-20, 0];

configs = {HOME, APPROACH_PICK, PICK, TRANSPORT, APPROACH_PLACE, PLACE};
names   = {'HOME','APPROACH_PICK','PICK','TRANSPORT','APPROACH_PLACE','PLACE'};
types   = {'J','J','L','J','J','L'};
speeds  = {'100%','80%','200mm/sec','80%','60%','150mm/sec'};
terms   = {'CNT100','CNT100','FINE','CNT100','CNT50','FINE'};

fprintf('/PROG MISSION_18\\n/MN\\n')
for i = 1:6
    T = fk3d(configs{i});
    fprintf('  %2d: %s P[%d] %s %s ; %% %s (%.0f,%.0f,%.0f)\\n', ...
        i, types{i}, i, speeds{i}, terms{i}, names{i}, T(1,4),T(2,4),T(3,4))
    if strcmp(names{i},'PICK')
        fprintf('  %2d: DO[1:Gripper]=ON ;\\n', i+0.1)
    end
    if strcmp(names{i},'PLACE')
        fprintf('  %2d: DO[1:Gripper]=OFF ;\\n', i+0.1)
    end
end
fprintf('/END\\n')

joint_angles = PLACE;

function M = Rz(t), c=cos(t);s=sin(t); M=[c -s 0 0;s c 0 0;0 0 1 0;0 0 0 1]; end
function M = Ry(t), c=cos(t);s=sin(t); M=[c 0 s 0;0 1 0 0;-s 0 c 0;0 0 0 1]; end
function M = Tx(v), M=eye(4); M(1,4)=v; end
function M = Tz(v), M=eye(4); M(3,4)=v; end`,
    tutorial:[
      { heading:"Decoding a TP program",
        body:`The format you'll see on every Fanuc:

  J P[1] 100% CNT100 ;
  ^       ^     ^
  │       │     └── termination: FINE or CNT0-100
  │       └──────── speed: % (joint) or mm/sec (linear)
  └──────────────── motion type: J/L/C

P[n]: a taught position (X,Y,Z,W,P,R in UFRAME).
DO[1]=ON: digital output 1 → gripper close.
WAIT .3(sec): pause for gripper to settle.

R[n]: numeric register (use for counters, offsets).
PR[n]: position register (a full 6D pose).

The scary-looking pages are just these
patterns repeated. Once you can read one
block, you can read all of them.` },
      { heading:"The gripper I/O pattern",
        body:`Robot grippers (pneumatic, servo, vacuum)
are controlled via digital I/O:

  DO[1]=ON  ; // output 1 HIGH → gripper closes
  WAIT .3(sec) ;  // wait for mechanism
  // now carry the part...
  DO[1]=OFF ; // output 1 LOW → gripper opens

Real Fanuc cells also read back:
  DI[1]: gripper-closed sensor
  DI[2]: gripper-open sensor
  WAIT DI[1]=ON ; // confirm closed before moving!

Without this wait, the robot moves while
the gripper is still opening/closing.
Parts fall. Production stops.

This is why robot programs are long —
50% of lines are I/O and interlocks.` },
      { heading:"Before your Fanuc training",
        body:`What you now understand that trainees don't:

✓ FK/IK math (why positions sometimes fail)
✓ 4×4 matrices (why frame setup matters)
✓ UTOOL and UFRAME (critical setup steps)
✓ J vs L, FINE vs CNT (when to use each)
✓ Pick-and-place pattern (7-point standard)
✓ Obstacle via-points (collision avoidance)
✓ TP syntax (you can READ programs now)
✓ I/O patterns (gripper close/open logic)

Fanuc training will cover:
  → The physical teach pendant (TP device)
  → ROBOGUIDE simulation software
  → Tool/user frame calibration procedures
  → Fault recovery and error codes
  → Application-specific options (iRVision etc.)

You'll be ahead on everything conceptual.` },
    ],
  },
];

// ================================================================
//  DRAW ENGINE
// ================================================================
const JCOLORS = ["#f59e0b","#818cf8","#f43f5e","#10b981"];

const drawBackground = (ctx, W, H) => {
  const g = ctx.createRadialGradient(W*0.45, H*0.4, 0, W*0.45, H*0.4, Math.max(W,H)*0.7);
  g.addColorStop(0, "#0e1c30");
  g.addColorStop(1, "#050a12");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(30,60,100,0.22)";
  ctx.lineWidth = 0.5;
  for (let x=0; x<W; x+=30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y=0; y<H; y+=30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
};

const drawAxes = (ctx, W, H, ox, oy) => {
  ctx.strokeStyle = "rgba(60,120,200,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke();
  ctx.fillStyle = "rgba(80,140,220,0.5)";
  ctx.font = "11px monospace";
  ctx.fillText("X", W-16, oy-6);
  ctx.fillText("Y", ox+5, 14);
  ctx.fillStyle = "rgba(60,100,160,0.4)";
  ctx.font = "9px monospace";
  ctx.textAlign = "center";
  for (let i=-5;i<=5;i++) {
    if(i===0) continue;
    ctx.fillText(i*50, ox+i*50*0.78, oy+12);
    ctx.textAlign = "right";
    ctx.fillText(i*50, ox-4, oy-i*50*0.78+3);
    ctx.textAlign = "center";
  }
  ctx.textAlign = "left";
};

const drawBase = (ctx, ox, oy) => {
  ctx.fillStyle = "#0d1828"; ctx.strokeStyle = "#1e3555"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.rect(ox-52, oy+20, 104, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#121f35"; ctx.strokeStyle = "#2a4060"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(ox-26, oy, 52, 22, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#080e18"; ctx.strokeStyle = "#3a5a80"; ctx.lineWidth = 1;
  [-18,18].forEach(bx=>{
    ctx.beginPath(); ctx.arc(ox+bx, oy+14, 4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  });
};

const drawSceneObjects = (ctx, W, H, ox, oy, sc, scene, mission, won) => {
  const tx = ox+mission.targetX*sc, ty = oy-mission.targetY*sc;
  const col = won?"#10b981":mission.color;

  if (scene==="parts") {
    ctx.save(); ctx.translate(tx+2, ty+4);
    ctx.fillStyle=col+"18"; ctx.strokeStyle=col+"66"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.rect(-28,8,56,34); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.rect(-32,3,64,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle=col+"aa"; ctx.strokeStyle=col+"dd"; ctx.lineWidth=1;
    [[-13,20],[6,16],[-2,30],[15,26]].forEach(([px,py])=>{
      ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill(); ctx.stroke();
    });
    ctx.fillStyle=col+"77"; ctx.font="9px monospace";
    ctx.textAlign="center"; ctx.fillText("PARTS BIN",0,50); ctx.textAlign="left";
    ctx.restore();
  }

  if (scene==="bolt") {
    ctx.save(); ctx.translate(tx,ty);
    ctx.fillStyle="#101c2e"; ctx.strokeStyle="#2a4060"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.rect(-40,14,80,16); ctx.fill(); ctx.stroke();
    ctx.strokeStyle="#1a2e48"; ctx.lineWidth=1;
    for(let i=-34;i<40;i+=11){ ctx.beginPath(); ctx.moveTo(i,14); ctx.lineTo(i-8,30); ctx.stroke(); }
    ctx.shadowColor=col; ctx.shadowBlur=8;
    ctx.strokeStyle=col+"dd"; ctx.lineWidth=9; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(0,14); ctx.lineTo(0,-8); ctx.stroke();
    ctx.shadowBlur=0; ctx.strokeStyle=col+"44"; ctx.lineWidth=1; ctx.lineCap="butt";
    for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(-6,i*5); ctx.lineTo(6,i*5); ctx.stroke(); }
    ctx.shadowColor=col; ctx.shadowBlur=10;
    const r=14; ctx.fillStyle="#0e1828"; ctx.strokeStyle=col+"ee"; ctx.lineWidth=2;
    ctx.beginPath();
    for(let i=0;i<6;i++){const a=(i*Math.PI)/3+Math.PI/6; i===0?ctx.moveTo(r*Math.cos(a),r*Math.sin(a)-12):ctx.lineTo(r*Math.cos(a),r*Math.sin(a)-12);}
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
    ctx.strokeStyle=col+"99"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(-6,-12); ctx.lineTo(6,-12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(0,-17); ctx.stroke();
    ctx.fillStyle=col+"88"; ctx.font="9px monospace";
    ctx.textAlign="center"; ctx.fillText("BOLT  (needs −90°)",0,40); ctx.textAlign="left";
    ctx.restore();
  }

  if (scene==="bottle") {
    ctx.save(); ctx.translate(tx,ty);
    ctx.fillStyle=col+"10"; ctx.strokeStyle=col+"66"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(-15,18,30,54,5); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-15,18); ctx.bezierCurveTo(-15,6,-8,2,-6,-2);
    ctx.lineTo(6,-2); ctx.bezierCurveTo(8,2,15,6,15,18);
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.rect(-6,-22,12,22); ctx.fill(); ctx.stroke();
    ctx.shadowColor=col; ctx.shadowBlur=won?14:6;
    ctx.fillStyle=won?"rgba(16,185,129,0.4)":col+"2e";
    ctx.strokeStyle=col+"cc"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(-9,-32,18,13,4); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle=col+"cc"; ctx.font="bold 7px monospace";
    ctx.textAlign="center"; ctx.fillText("CAP",0,-22);
    ctx.fillStyle=col+"66"; ctx.font="9px monospace";
    ctx.fillText("BOTTLE",0,82); ctx.textAlign="left";
    ctx.restore();
  }

  if (scene==="assembly") {
    const cvx=ox+120*sc, cvy=oy+24;
    ctx.save(); ctx.translate(cvx,cvy);
    ctx.strokeStyle="#2a405566"; ctx.fillStyle="#111d2e44"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.rect(-55,-10,110,18); ctx.fill(); ctx.stroke();
    ctx.strokeStyle="#1a2c4433"; ctx.lineWidth=1;
    for(let i=-48;i<55;i+=14){ ctx.beginPath(); ctx.moveTo(i,-10); ctx.lineTo(i+9,8); ctx.stroke(); }
    ctx.fillStyle="#1e3050"; ctx.strokeStyle="#2e4870";
    [-46,46].forEach(rx=>{ ctx.beginPath(); ctx.arc(rx,0,10,0,Math.PI*2); ctx.fill(); ctx.stroke(); });
    ctx.shadowColor=col; ctx.shadowBlur=8;
    ctx.strokeStyle=col+"88"; ctx.fillStyle=col+"22"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(0,-14,11,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle=col+"77"; ctx.lineWidth=4; ctx.lineCap="round";
    for(let i=0;i<6;i++){const a=(i*Math.PI)/3; ctx.beginPath(); ctx.moveTo(11*Math.cos(a),-14+11*Math.sin(a)); ctx.lineTo(18*Math.cos(a),-14+18*Math.sin(a)); ctx.stroke();}
    ctx.shadowBlur=0; ctx.lineCap="butt";
    ctx.fillStyle="#2a4060"; ctx.font="8px monospace";
    ctx.textAlign="center"; ctx.fillText("CONVEYOR",0,22); ctx.textAlign="left";
    ctx.restore();
    ctx.save(); ctx.translate(tx,ty);
    const ang=mission.targetAngle?(mission.targetAngle*Math.PI)/180:0;
    ctx.rotate(-ang);
    ctx.shadowColor=col; ctx.shadowBlur=6;
    ctx.strokeStyle=col+"88"; ctx.fillStyle=col+"12"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.rect(-24,-15,48,30); ctx.fill(); ctx.stroke();
    ctx.strokeStyle=col+"44"; ctx.beginPath(); ctx.rect(-10,-17,20,6); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0; ctx.restore();
    ctx.fillStyle=col+"88"; ctx.font="9px monospace";
    ctx.textAlign="center"; ctx.fillText("HOUSING (45°)",tx,ty-26); ctx.textAlign="left";
  }

  // Obstacle circles — drawn on top of scene objects
  if (mission.obstacles) {
    mission.obstacles.forEach(obs => {
      const bx = ox+obs.cx*sc, by = oy-obs.cy*sc, br = obs.r*sc;
      // Hazard stripes fill
      ctx.save();
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI*2); ctx.clip();
      const stripeCount = 8;
      for (let k=0; k<stripeCount; k++) {
        const angle = (k/stripeCount)*Math.PI*2;
        ctx.fillStyle = k%2===0 ? "rgba(244,63,94,0.18)" : "rgba(0,0,0,0.10)";
        ctx.beginPath();
        ctx.moveTo(bx,by);
        ctx.arc(bx, by, br, angle, angle + Math.PI*2/stripeCount);
        ctx.fill();
      }
      ctx.restore();
      // Outer ring
      ctx.shadowColor="#f43f5e"; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI*2);
      ctx.strokeStyle="#f43f5eaa"; ctx.lineWidth=2;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.shadowBlur=0;
      // Label
      ctx.fillStyle="#f43f5ecc"; ctx.font="bold 9px monospace";
      ctx.textAlign="center";
      ctx.fillText(obs.label||"OBS", bx, by+3);
      ctx.textAlign="left";
    });
  }
};

const drawTarget = (ctx, ox, oy, sc, mission, won) => {
  const tx=ox+mission.targetX*sc, ty=oy-mission.targetY*sc, tol=mission.tolerance*sc;
  const col=won?"#10b981":mission.color;
  if (won) { ctx.shadowColor="#10b981"; ctx.shadowBlur=20; }
  ctx.beginPath(); ctx.arc(tx,ty,tol,0,Math.PI*2);
  ctx.fillStyle=won?"rgba(16,185,129,0.12)":mission.color+"12"; ctx.fill();
  ctx.strokeStyle=col; ctx.lineWidth=won?2:1.5;
  ctx.setLineDash([5,3]); ctx.stroke(); ctx.setLineDash([]);
  ctx.shadowBlur=0;
  if (mission.targetAngle!==null) {
    const ang=(mission.targetAngle*Math.PI)/180;
    ctx.strokeStyle=col; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(tx-Math.cos(ang)*7, ty+Math.sin(ang)*7);
    ctx.lineTo(tx+Math.cos(ang)*(tol+20), ty-Math.sin(ang)*(tol+20));
    ctx.stroke();
    ctx.fillStyle=col; ctx.font="10px monospace";
    ctx.fillText(`${mission.targetAngle}°`, tx+tol+5, ty-4);
  }
  ctx.fillStyle=col+"cc"; ctx.font="bold 10px monospace";
  ctx.fillText("TARGET", tx-tol*0.5, ty+tol+14);
};

const drawArm = (ctx, joints, sc, ox, oy, won, highlightJoint) => {
  joints.forEach((j,i)=>{
    if (i===joints.length-1) return;
    const next=joints[i+1];
    const x1=ox+j.x*sc, y1=oy-j.y*sc, x2=ox+next.x*sc, y2=oy-next.y*sc;
    const col=JCOLORS[i%JCOLORS.length];
    const dimmed = highlightJoint!==null && i>=highlightJoint;
    const alpha = dimmed ? 0.25 : 1;

    ctx.globalAlpha=0.4*alpha;
    ctx.strokeStyle="rgba(0,0,0,0.8)"; ctx.lineWidth=18; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(x1+3,y1+4); ctx.lineTo(x2+3,y2+4); ctx.stroke();
    ctx.globalAlpha=alpha;

    ctx.strokeStyle=col; ctx.lineWidth=13;
    ctx.shadowColor=col; ctx.shadowBlur=dimmed?0:6;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    ctx.shadowBlur=0;

    ctx.strokeStyle="rgba(255,255,255,0.14)"; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();

    ctx.fillStyle=`rgba(255,255,255,${0.55*alpha})`; ctx.font="10px monospace";
    ctx.fillText(`L${i+1}`, (x1+x2)/2+6, (y1+y2)/2-6);

    ctx.shadowColor=col; ctx.shadowBlur=dimmed?0:14;
    ctx.beginPath(); ctx.arc(x1,y1,10,0,Math.PI*2);
    ctx.fillStyle="#07101e"; ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=2; ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle=col; ctx.font="bold 9px monospace";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(`J${i+1}`,x1,y1);
    ctx.textAlign="left"; ctx.textBaseline="alphabetic";

    const M=j.M, alen=22;
    ctx.globalAlpha=0.6*alpha;
    ctx.shadowColor="#22c55e"; ctx.shadowBlur=4;
    ctx.strokeStyle="#22c55e"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x1+M[0][0]*alen,y1-M[1][0]*alen); ctx.stroke();
    ctx.shadowColor="#ef4444";
    ctx.strokeStyle="#ef4444";
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x1+M[0][1]*alen,y1-M[1][1]*alen); ctx.stroke();
    ctx.shadowBlur=0; ctx.globalAlpha=1;
  });

  const tip=joints[joints.length-1];
  const ex=ox+tip.x*sc, ey=oy-tip.y*sc;
  const tipCol=won?"#10b981":"#e2f0ff";
  ctx.shadowColor=tipCol; ctx.shadowBlur=won?20:10;
  ctx.beginPath(); ctx.arc(ex,ey,12,0,Math.PI*2);
  ctx.fillStyle="#07101e"; ctx.fill();
  ctx.strokeStyle=tipCol; ctx.lineWidth=2.5; ctx.stroke();
  ctx.shadowBlur=0;
  const M=tip.M;
  [1,-1].forEach(s=>{
    const px=ex+M[0][1]*s*9, py=ey-M[1][1]*s*9;
    ctx.strokeStyle=won?"#10b981cc":"#8ca0c0";
    ctx.lineWidth=3.5; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+M[0][0]*18,py-M[1][0]*18); ctx.stroke();
    ctx.lineCap="butt";
  });
};

const drawHUD = (ctx, W, H, tip, tipAngle, mission, won) => {
  ctx.fillStyle="rgba(5,12,24,0.88)";
  ctx.beginPath(); ctx.roundRect(10,10,172,78,7); ctx.fill();
  ctx.strokeStyle="#1a3050"; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle="#4a7098"; ctx.font="9px monospace"; ctx.letterSpacing="1px";
  ctx.fillText("END EFFECTOR", 18,26);
  ctx.fillStyle="#c8dff5"; ctx.font="bold 11px monospace";
  ctx.fillText(`x = ${tip.x.toFixed(1)} mm`, 18,42);
  ctx.fillText(`y = ${tip.y.toFixed(1)} mm`, 18,57);
  ctx.fillText(`ψ = ${tipAngle.toFixed(1)}°`, 18,72);

  const dx=tip.x-mission.targetX, dy=tip.y-mission.targetY;
  const dist=Math.sqrt(dx*dx+dy*dy);
  const dcol=dist<mission.tolerance?"#10b981":dist<70?"#f59e0b":"#f43f5e";
  ctx.fillStyle="rgba(5,12,24,0.88)";
  ctx.beginPath(); ctx.roundRect(W-106,10,96,38,7); ctx.fill();
  ctx.strokeStyle="#1a3050"; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle="#4a7098"; ctx.font="9px monospace"; ctx.fillText("DIST",W-98,26);
  ctx.fillStyle=dcol; ctx.font="bold 13px monospace"; ctx.fillText(`${dist.toFixed(1)}mm`,W-98,41);

  ctx.fillStyle="#22c55e88"; ctx.font="10px monospace"; ctx.fillText("— local X",W-90,H-24);
  ctx.fillStyle="#ef444488"; ctx.fillText("— local Y",W-90,H-10);

  if (won) {
    ctx.fillStyle="rgba(16,185,129,0.07)"; ctx.fillRect(0,0,W,H);
    ctx.shadowColor="#10b981"; ctx.shadowBlur=20;
    ctx.fillStyle="#10b981"; ctx.font="bold 15px monospace";
    ctx.textAlign="center"; ctx.fillText("✓  TARGET REACHED",W/2,H/2);
    ctx.shadowBlur=0; ctx.textAlign="left";
  }
};

// ================================================================
//  ARM 3D CANVAS  — Three.js 6-DOF render
// ================================================================
function Arm3DCanvas({ angles, waypoints, highlightWpIdx, target3d, target3dTol, obstacles3d }) {
  const mountRef    = useRef(null);
  const threeRef    = useRef(null); // {scene, camera, renderer, controls, armGroup, wpGroup, tgtGroup, obsGroup}
  const armObjsRef  = useRef([]);
  const wpObjsRef   = useRef([]);
  const tgtObjsRef  = useRef([]);
  const obsObjsRef  = useRef([]);
  const rafRef3    = useRef(null);

  // ── Bootstrap Three.js (once) ───────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || threeRef.current) return;

    const W = mount.clientWidth  || 620;
    const H = mount.clientHeight || 520;

    const renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x060e1a);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060e1a, 0.012);

    const camera = new THREE.PerspectiveCamera(42, W/H, 0.1, 200);
    camera.position.set(6, 5, 6);
    camera.lookAt(0, 2, 0);

    scene.add(new THREE.AmbientLight(0x4a6090, 1.1));
    const dir = new THREE.DirectionalLight(0xc8e0ff, 1.6);
    dir.position.set(4, 8, 3);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    scene.add(dir);
    scene.add(new THREE.PointLight(0x3050a0, 0.4, 20));

    const grid = new THREE.GridHelper(14, 28, 0x1a2e4a, 0x101c30);
    scene.add(grid);

    const floorMat = new THREE.MeshStandardMaterial({ color:0x050c18, roughness:1 });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(5, 64), floorMat);
    floor.rotation.x = -Math.PI/2;
    floor.position.y = 0.001;
    floor.receiveShadow = true;
    scene.add(floor);

    const baseMat = new THREE.MeshStandardMaterial({ color:0x0d1828, metalness:0.8, roughness:0.2 });
    const base    = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 0.2, 32), baseMat);
    base.position.y = 0.1;
    base.castShadow = true;
    scene.add(base);
    const ringMat = new THREE.MeshStandardMaterial({ color:0x2a4060, metalness:0.9, roughness:0.1 });
    const ring    = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.04, 8, 32), ringMat);
    ring.rotation.x = Math.PI/2;
    ring.position.y  = 0.19;
    scene.add(ring);

    const armGroup = new THREE.Group();  scene.add(armGroup);
    const wpGroup  = new THREE.Group();  scene.add(wpGroup);
    const tgtGroup = new THREE.Group();  scene.add(tgtGroup);
    const obsGroup = new THREE.Group();  scene.add(obsGroup);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.08;
    controls.minDistance    = 2;
    controls.maxDistance    = 25;
    controls.maxPolarAngle  = Math.PI * 0.85;

    threeRef.current = { scene, camera, renderer, controls, armGroup, wpGroup, tgtGroup, obsGroup };

    const ro = new ResizeObserver(() => {
      const W2 = mount.clientWidth, H2 = mount.clientHeight;
      if (!W2 || !H2) return;
      camera.aspect = W2/H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    });
    ro.observe(mount);

    const animate = () => {
      rafRef3.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef3.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      threeRef.current = null;
    };
  }, []);

  // ── Rebuild arm geometry on angle change ───────────────────────
  useEffect(() => {
    if (!threeRef.current) return;
    const { armGroup } = threeRef.current;

    armObjsRef.current.forEach(o => {
      o.geometry?.dispose();
      if (Array.isArray(o.material)) o.material.forEach(m=>m.dispose());
      else o.material?.dispose();
      armGroup.remove(o);
    });
    armObjsRef.current = [];

    const frames = fk3d(angles);
    const objs   = [];

    const addObj = (obj) => { armGroup.add(obj); objs.push(obj); return obj; };

    frames.forEach((T, i) => {
      if (i === frames.length-1) return;
      const col = ARM3D_COLORS[i % ARM3D_COLORS.length];
      const p1  = toTHREE(T);
      const p2  = toTHREE(frames[i+1]);
      const d   = p1.distanceTo(p2);

      // Link cylinder
      if (d > 0.01) {
        const dir = p2.clone().sub(p1).normalize();
        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        const r   = i < 3 ? 0.09 : 0.07;
        const geo = new THREE.CylinderGeometry(r, r, d, 14);
        const mat = new THREE.MeshStandardMaterial({
          color:col, metalness:0.55, roughness:0.35,
          emissive:col, emissiveIntensity:0.07,
        });
        const link = addObj(new THREE.Mesh(geo, mat));
        link.position.copy(mid);
        link.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
        link.castShadow = true;
      }

      // Joint sphere
      const jSphere = addObj(new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 16),
        new THREE.MeshStandardMaterial({ color:0x0d1828, metalness:0.8, roughness:0.2, emissive:col, emissiveIntensity:0.3 })
      ));
      jSphere.position.copy(p1);
      jSphere.castShadow = true;

      // Joint ring
      const jRing = addObj(new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.035, 8, 24),
        new THREE.MeshStandardMaterial({ color:col, metalness:0.8, roughness:0.15 })
      ));
      jRing.position.copy(p1);
      if (d > 0.01) {
        jRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), p2.clone().sub(p1).normalize());
      }
    });

    // End-effector
    const tipT  = frames[frames.length-1];
    const tipP  = toTHREE(tipT);
    const xDir3 = new THREE.Vector3(tipT[0][0], tipT[2][0], -tipT[1][0]).normalize();
    const yDir3 = new THREE.Vector3(tipT[0][1], tipT[2][1], -tipT[1][1]).normalize();
    const zDir3 = new THREE.Vector3(tipT[0][2], tipT[2][2], -tipT[1][2]).normalize();

    addObj(new THREE.Mesh(
      new THREE.SphereGeometry(0.10, 16, 16),
      new THREE.MeshStandardMaterial({ color:0xe2f0ff, metalness:0.5, roughness:0.4, emissive:0x4060a0, emissiveIntensity:0.35 })
    )).position.copy(tipP);

    // Gripper fingers
    [-1, 1].forEach(side => {
      const fp  = tipP.clone().add(yDir3.clone().multiplyScalar(0.18*side)).add(xDir3.clone().multiplyScalar(0.12));
      const fgr = addObj(new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 0.22, 0.055),
        new THREE.MeshStandardMaterial({ color:0xc8d8f0, metalness:0.4, roughness:0.5 })
      ));
      fgr.position.copy(fp);
      fgr.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), xDir3);
      fgr.castShadow = true;
    });

    // Coordinate frame at tip  (X=red, Y=green, Z=blue)
    const axLen = 0.36;
    [[xDir3,0xff3333],[yDir3,0x33ff33],[zDir3,0x3366ff]].forEach(([d,c]) => {
      const geo  = new THREE.BufferGeometry().setFromPoints([tipP, tipP.clone().add(d.clone().multiplyScalar(axLen))]);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color:c }));
      armGroup.add(line);
      objs.push(line);
    });

    armObjsRef.current = objs;
  }, [angles]);

  // ── Update waypoint path overlay ───────────────────────────────
  useEffect(() => {
    if (!threeRef.current) return;
    const { wpGroup } = threeRef.current;

    wpObjsRef.current.forEach(o => {
      o.geometry?.dispose();
      if (Array.isArray(o.material)) o.material.forEach(m=>m.dispose());
      else o.material?.dispose();
      wpGroup.remove(o);
    });
    wpObjsRef.current = [];
    if (!waypoints || waypoints.length === 0) return;

    const objs  = [];
    const tipPts = waypoints.map(wp => {
      const fr = fk3d(wp);
      return toTHREE(fr[fr.length-1]);
    });

    if (tipPts.length > 1) {
      const geo  = new THREE.BufferGeometry().setFromPoints(tipPts);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color:0x00c2a8, linewidth:2 }));
      wpGroup.add(line);
      objs.push(line);
    }

    tipPts.forEach((pos, i) => {
      const hl     = i === highlightWpIdx;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(hl ? 0.13 : 0.09, 16, 16),
        new THREE.MeshStandardMaterial({ color:hl?0x10b981:0x00c2a8, emissive:hl?0x10b981:0x005040, emissiveIntensity:hl?0.55:0.25 })
      );
      sphere.position.copy(pos);
      wpGroup.add(sphere);
      objs.push(sphere);
    });

    wpObjsRef.current = objs;
  }, [waypoints, highlightWpIdx]);

  // ── Target sphere for 3D missions ──────────────────────────────
  useEffect(() => {
    if (!threeRef.current) return;
    const { tgtGroup, scene } = threeRef.current;

    tgtObjsRef.current.forEach(o => {
      o.geometry?.dispose();
      if (Array.isArray(o.material)) o.material.forEach(m=>m.dispose());
      else o.material?.dispose();
      tgtGroup.remove(o);
    });
    tgtObjsRef.current = [];
    if (!target3d) return;

    const [tx,ty,tz] = target3d;
    const pos = new THREE.Vector3(tx*SC3, tz*SC3, -ty*SC3);

    // Tolerance zone (wireframe sphere)
    const tolR = (target3dTol||35)*SC3;
    const tolGeo = new THREE.SphereGeometry(tolR, 20, 20);
    const tolMat = new THREE.MeshBasicMaterial({ color:0x10b981, wireframe:true, opacity:0.18, transparent:true });
    const tolMesh = new THREE.Mesh(tolGeo, tolMat);
    tolMesh.position.copy(pos);
    tgtGroup.add(tolMesh);
    tgtObjsRef.current.push(tolMesh);

    // Target centre sphere
    const tgtGeo = new THREE.SphereGeometry(0.10, 16, 16);
    const tgtMat = new THREE.MeshStandardMaterial({ color:0x10b981, emissive:0x10b981, emissiveIntensity:0.7, transparent:true, opacity:0.9 });
    const tgtMesh = new THREE.Mesh(tgtGeo, tgtMat);
    tgtMesh.position.copy(pos);
    tgtGroup.add(tgtMesh);
    tgtObjsRef.current.push(tgtMesh);

    // Crosshair lines through target
    [[1,0,0],[0,1,0],[0,0,1]].forEach(d => {
      const pts = [
        pos.clone().add(new THREE.Vector3(...d).multiplyScalar(-tolR*1.4)),
        pos.clone().add(new THREE.Vector3(...d).multiplyScalar( tolR*1.4)),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color:0x10b981, opacity:0.4, transparent:true }));
      tgtGroup.add(line);
      tgtObjsRef.current.push(line);
    });

  }, [target3d, target3dTol]);

  // ── 3D obstacle rendering ──────────────────────────────────────
  useEffect(() => {
    if (!threeRef.current) return;
    const { obsGroup } = threeRef.current;

    obsObjsRef.current.forEach(o => {
      o.geometry?.dispose();
      if (Array.isArray(o.material)) o.material.forEach(m=>m.dispose());
      else o.material?.dispose();
      obsGroup.remove(o);
    });
    obsObjsRef.current = [];
    if (!obstacles3d || obstacles3d.length===0) return;

    const objs = [];
    obstacles3d.forEach(obs => {
      const pos = new THREE.Vector3(obs.cx*SC3, obs.cz*SC3, -obs.cy*SC3);
      const r = obs.r * SC3;

      // Outer wireframe shell
      const wfGeo = new THREE.SphereGeometry(r, 18, 18);
      const wfMat = new THREE.MeshBasicMaterial({ color:0xf43f5e, wireframe:true, opacity:0.2, transparent:true });
      const wfMesh = new THREE.Mesh(wfGeo, wfMat);
      wfMesh.position.copy(pos);
      obsGroup.add(wfMesh); objs.push(wfMesh);

      // Semi-transparent fill
      const fillGeo = new THREE.SphereGeometry(r*0.96, 18, 18);
      const fillMat = new THREE.MeshStandardMaterial({ color:0xf43f5e, opacity:0.10, transparent:true, roughness:1 });
      const fillMesh = new THREE.Mesh(fillGeo, fillMat);
      fillMesh.position.copy(pos);
      obsGroup.add(fillMesh); objs.push(fillMesh);

      // Bright equator ring
      const ringGeo = new THREE.TorusGeometry(r, r*0.03, 8, 36);
      const ringMat = new THREE.MeshBasicMaterial({ color:0xf43f5e });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.rotation.x = Math.PI/2;
      obsGroup.add(ringMesh); objs.push(ringMesh);
    });

    obsObjsRef.current = objs;
  }, [obstacles3d]);

  return (
    <div ref={mountRef} style={{ width:"100%", height:"100%", position:"relative" }}>
      <div style={{
        position:"absolute", top:8, left:8, background:"rgba(5,12,24,0.72)",
        padding:"5px 10px", borderRadius:5, fontSize:9,
        color:"#2a5070", letterSpacing:1, pointerEvents:"none", userSelect:"none",
      }}>ORBIT: drag  ·  ZOOM: scroll  ·  PAN: right-drag</div>
    </div>
  );
}

// ================================================================
//  TEACH PENDANT PANEL
// ================================================================
// ================================================================
//  2D TEACH PENDANT PANEL
// ================================================================
function Teach2DPanel({ mission, angles, setAngles, waypoints, setWaypoints, highlightWpIdx, playing, onPlay, onStop }) {
  const [innerTab, setInnerTab] = useState("jog");
  const [codeLang, setCodeLang] = useState("python");
  const [copied, setCopied] = useState(false);

  const n = mission.numJoints;
  const limits = Array.from({length:n}, (_,i) => i===0 ? [-180,180] : [-150,150]);
  const labelList = Array.from({length:n}, (_,i) => ["J1 θ₁","J2 θ₂","J3 θ₃","J4 θ₄"][i] || `J${i+1}`);

  // FK for current angles
  const joints2d = fk(angles, mission.lengths);
  const tip2d = joints2d[joints2d.length-1];

  const genCode = () => {
    if (waypoints.length === 0) {
      return codeLang === "python"
        ? "# No waypoints recorded yet.\n# Move sliders then press Record Point."
        : "%% No waypoints recorded yet.\n%% Move sliders then press Record Point.";
    }
    const L = mission.lengths;
    const lStr = L.join(", ");
    if (codeLang === "python") {
      const wpLines = waypoints.map((wp,i) =>
        `    [${wp.map(a=>a.toFixed(1)).join(", ")}],  # P${i+1}  tip≈(${
          (() => { const j=fk(wp,L), t=j[j.length-1]; return `${t.x.toFixed(0)}, ${t.y.toFixed(0)}`; })()
        }) mm`
      ).join("\n");
      return [
        `# 2D Teach Pendant Recording — ${n}-joint arm`,
        `# Lengths: L = [${lStr}] mm`,
        `from math import *`,
        ``,
        `L = [${lStr}]`,
        ``,
        `waypoints = [`,
        wpLines,
        `]`,
        ``,
        `def fk2d(angles_deg, lengths):`,
        `    x, y, theta = 0.0, 0.0, 0.0`,
        `    for a, l in zip(angles_deg, lengths):`,
        `        theta += radians(a)`,
        `        x += l * cos(theta)`,
        `        y += l * sin(theta)`,
        `    return x, y, degrees(theta)`,
        ``,
        `for i, wp in enumerate(waypoints):`,
        `    x, y, ang = fk2d(wp, L)`,
        `    print(f"P{i+1}: angles={[round(a,1) for a in wp]}  tip=({x:.1f}, {y:.1f}) mm")`,
        `    # robot.move_joints(wp)  # ← send to real controller`,
      ].join("\n");
    } else {
      const wpMat = waypoints.map((wp,i) =>
        `  ${wp.map(a=>a.toFixed(1)).join(" ")};  %% P${i+1}`
      ).join("\n");
      return [
        `%% 2D Teach Pendant Recording — ${n}-joint arm`,
        `%% Lengths: L = [${lStr}] mm`,
        `L = [${lStr}];`,
        ``,
        `waypoints = [`,
        wpMat,
        `];`,
        ``,
        `function [x, y] = fk2d(angles_deg, L)`,
        `    theta = 0; x = 0; y = 0;`,
        `    for i = 1:length(L)`,
        `        theta = theta + deg2rad(angles_deg(i));`,
        `        x = x + L(i)*cos(theta);`,
        `        y = y + L(i)*sin(theta);`,
        `    end`,
        `end`,
        ``,
        `for i = 1:size(waypoints,1)`,
        `    wp = waypoints(i,:);`,
        `    [x, y] = fk2d(wp, L);`,
        `    fprintf('P%d: tip=(%.1f, %.1f) mm\\n', i, x, y)`,
        `    %% robot.move_joints(wp)  %% send to real controller`,
        `end`,
      ].join("\n");
    }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(genCode()).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false), 1500); });
  };

  const TAB = {color:"#00c2a8"};
  const INACTIVE = {color:"#3a6080"};

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
      {/* Inner tab bar */}
      <div style={{display:"flex",background:"#07101e",borderBottom:"1px solid #1a2e4a",flexShrink:0,gap:2,padding:"0 8px"}}>
        {[["jog","Jog Joints"],["program","Program"],["code","Code"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setInnerTab(id)} style={{
            background:"none", border:"none",
            borderBottom:innerTab===id?"2px solid #00c2a8":"2px solid transparent",
            color:innerTab===id?"#00c2a8":"#3a6080",
            padding:"7px 12px", fontSize:10, cursor:"pointer", fontFamily:"inherit",
          }}>{lbl}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,padding:"0 4px"}}>
          <span style={{fontSize:9,color:"#1a3050"}}>tip:</span>
          <span style={{fontSize:9,color:"#7dd3fc",fontFamily:"monospace"}}>
            ({tip2d.x.toFixed(0)}, {tip2d.y.toFixed(0)}) mm
          </span>
        </div>
      </div>

      {/* JOG JOINTS */}
      {innerTab==="jog" && (
        <div style={{flex:1,overflowY:"auto",padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>
          {Array.from({length:n},(_,i)=>{
            const [min,max] = limits[i];
            const val = angles[i] ?? 0;
            return (
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:10,color:"#00c2a8"}}>{labelList[i]}</span>
                  <span style={{fontSize:10,color:"#7dd3fc",fontFamily:"monospace"}}>{val.toFixed(1)}°</span>
                </div>
                <input type="range" min={min} max={max} step={0.5} value={val}
                  onChange={e=>{ const next=[...angles]; next[i]=parseFloat(e.target.value); setAngles(next); }}
                  style={{width:"100%",accentColor:"#00c2a8",cursor:"pointer"}}
                />
              </div>
            );
          })}
          <div style={{borderTop:"1px solid #1a2e4a",paddingTop:10,marginTop:4,display:"flex",flexDirection:"column",gap:6}}>
            <div style={{fontSize:9,color:"#2a4870",letterSpacing:1}}>FORWARD KINEMATICS</div>
            <div style={{fontFamily:"monospace",fontSize:11,color:"#7dd3fc",lineHeight:1.7}}>
              <div>tip X: <b>{tip2d.x.toFixed(2)}</b> mm</div>
              <div>tip Y: <b>{tip2d.y.toFixed(2)}</b> mm</div>
              <div>angle: <b>{((Math.atan2(tip2d.M[1][0],tip2d.M[0][0])*180)/Math.PI).toFixed(1)}</b>°</div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <button onClick={()=>setWaypoints(wps=>[...wps,[...angles]])} style={{
                background:"#00c2a822",border:"1px solid #00c2a866",borderRadius:5,
                color:"#00c2a8",padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit",
              }}>+ Record Point</button>
              <button onClick={()=>setAngles(Array(n).fill(0))} style={{
                background:"#0f1e33",border:"1px solid #1a3050",borderRadius:5,
                color:"#3a5870",padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit",
              }}>Reset Home</button>
            </div>
          </div>
        </div>
      )}

      {/* PROGRAM */}
      {innerTab==="program" && (
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden",padding:"10px 14px",gap:8}}>
          {waypoints.length===0 && (
            <div style={{fontSize:11,color:"#1e3a5a",padding:"20px 0",textAlign:"center"}}>
              No waypoints yet. Go to Jog tab and press Record Point.
            </div>
          )}
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {waypoints.map((wp,i)=>{
              const j=fk(wp,mission.lengths), t=j[j.length-1];
              const isHl = i===highlightWpIdx;
              return (
                <div key={i} style={{
                  display:"flex",alignItems:"center",gap:8,
                  background:isHl?"#00c2a822":"#0a1828",
                  border:`1px solid ${isHl?"#00c2a866":"#1a2e4a"}`,
                  borderRadius:5,padding:"6px 10px",
                }}>
                  <span style={{fontSize:9,color:"#00c2a8",fontWeight:700,minWidth:22}}>P{i+1}</span>
                  <span style={{fontSize:9,color:"#7dd3fc",fontFamily:"monospace",flex:1}}>
                    [{wp.map(a=>a.toFixed(0)).join(", ")}]° → ({t.x.toFixed(0)}, {t.y.toFixed(0)}) mm
                  </span>
                  <button onClick={()=>setAngles([...wp])} style={{
                    background:"none",border:"none",color:"#2a5070",cursor:"pointer",fontSize:10,padding:"0 3px",
                  }}>⟳</button>
                  <button onClick={()=>setWaypoints(wps=>wps.filter((_,j2)=>j2!==i))} style={{
                    background:"none",border:"none",color:"#f43f5e55",cursor:"pointer",fontSize:11,padding:"0 3px",
                  }}>✕</button>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap"}}>
            <button onClick={playing?onStop:onPlay} disabled={waypoints.length<2} style={{
              background:playing?"#f43f5e22":"#00c2a822",
              border:`1px solid ${playing?"#f43f5e66":"#00c2a866"}`,
              borderRadius:5,color:playing?"#f43f5e":"#00c2a8",
              padding:"6px 14px",fontSize:11,cursor:waypoints.length<2?"not-allowed":"pointer",
              fontFamily:"inherit",opacity:waypoints.length<2?0.4:1,
            }}>{playing?"⏹ Stop":"▶ Play Sequence"}</button>
            <button onClick={()=>setWaypoints([])} disabled={waypoints.length===0} style={{
              background:"#0f1e33",border:"1px solid #1a3050",borderRadius:5,
              color:"#3a5870",padding:"6px 14px",fontSize:11,
              cursor:waypoints.length===0?"not-allowed":"pointer",fontFamily:"inherit",
              opacity:waypoints.length===0?0.4:1,
            }}>Clear All</button>
          </div>
        </div>
      )}

      {/* CODE */}
      {innerTab==="code" && (
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:"#0a1622",borderBottom:"1px solid #1a2e4a",flexShrink:0}}>
            {["python","matlab"].map(l=>(
              <button key={l} onClick={()=>setCodeLang(l)} style={{
                background:codeLang===l?l==="python"?"#7dd3fc22":"#818cf822":"transparent",
                border:`1px solid ${codeLang===l?l==="python"?"#7dd3fc66":"#818cf866":"#1a2e4a"}`,
                borderRadius:4,color:codeLang===l?l==="python"?"#7dd3fc":"#818cf8":"#3a6080",
                padding:"3px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit",
              }}>{l==="python"?"Python":"MATLAB"}</button>
            ))}
            <button onClick={copyCode} style={{
              marginLeft:"auto",background:copied?"#10b98122":"#0f1e33",
              border:`1px solid ${copied?"#10b98166":"#1a3050"}`,borderRadius:4,
              color:copied?"#10b981":"#3a5870",padding:"3px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit",
            }}>{copied?"✓ Copied":"Copy"}</button>
          </div>
          <pre style={{
            flex:1,margin:0,padding:"12px 16px",background:"#050c18",
            color:"#c8e8ff",fontFamily:"'JetBrains Mono',Consolas,monospace",
            fontSize:10.5,lineHeight:1.8,overflowY:"auto",whiteSpace:"pre",minHeight:0,
          }}>{genCode()}</pre>
        </div>
      )}
    </div>
  );
}

// ================================================================
//  3D TEACH PENDANT PANEL
// ================================================================
function TeachPendantPanel({ angles, setAngles, waypoints, setWaypoints, highlightWpIdx, teachPlaying, onPlay, onStop }) {
  const [innerTab, setInnerTab] = useState("jog");
  const [codeLang, setCodeLang] = useState("python");

  const frames = fk3d(angles);
  const tipT   = frames[frames.length-1];
  const [ex, ey, ez] = getPos3(tipT);

  const genCode = () => {
    if (waypoints.length === 0) return codeLang === "python"
      ? "# No waypoints recorded yet.\n# Go to Jog tab and press Record Point."
      : "%% No waypoints recorded yet.\n%% Go to Jog tab and press Record Point.";

    if (codeLang === "python") {
      const wpLines = waypoints.map((wp,i) =>
        `    [${wp.map(a=>a.toFixed(1)).join(", ")}],  # P${i+1}`
      ).join("\n");
      return [
        "from math import *",
        "",
        "# 6-DOF Robot Arm — Teach Pendant Recording",
        "# Angles in degrees: [J1-Base, J2-Shoulder, J3-Elbow,",
        "#                     J4-Wrist Roll, J5-Wrist, J6-Tool]",
        "",
        "waypoints = [",
        wpLines,
        "]",
        "",
        "for i, joint_angles in enumerate(waypoints):",
        "    j1, j2, j3, j4, j5, j6 = joint_angles",
        "    print(f'Moving to P{i+1}: {joint_angles}')",
        "    # robot.move_joints(joint_angles)  # ← send to real robot",
      ].join("\n");
    } else {
      const wpLines = waypoints.map((wp,i) =>
        `    ${wp.map(a=>a.toFixed(1)).join(", ")};  %% P${i+1}`
      ).join("\n");
      return [
        "%% 6-DOF Robot Arm — Teach Pendant Recording",
        "%% Angles in degrees: [J1-Base, J2-Shoulder, J3-Elbow,",
        "%%                     J4-Wrist Roll, J5-Wrist, J6-Tool]",
        "",
        "waypoints = [",
        wpLines,
        "];",
        "",
        "for i = 1:size(waypoints,1)",
        "    joint_angles = waypoints(i,:);",
        "    fprintf('Moving to P%d\\n', i);",
        "    disp(joint_angles);",
        "    %% robot.move_joints(joint_angles);  %% send to real robot",
        "end",
      ].join("\n");
    }
  };

  const STYL = { width:"100%", accentColor:"#00c2a8", cursor:"pointer", height:4 };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {/* Inner tab bar */}
      <div style={{ display:"flex", background:"#07101e", borderBottom:"1px solid #1a2e4a", flexShrink:0 }}>
        {[["jog","Jog Joints"],["program","Program"],["code","Code"]].map(([id,lbl]) => (
          <button key={id} onClick={() => setInnerTab(id)} style={{
            background:innerTab===id?"#0c1828":"transparent",
            border:"none", borderBottom:innerTab===id?"2px solid #00c2a8":"2px solid transparent",
            color:innerTab===id?"#00c2a8":"#3a6080",
            padding:"8px 16px", fontSize:10, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.3,
          }}>{lbl}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 14px" }}>

        {/* ── JOG TAB ── */}
        {innerTab === "jog" && (
          <div>
            <div style={{ fontSize:9, color:"#1e3050", letterSpacing:1, marginBottom:10 }}>JOINT ANGLES</div>
            {A3D.labels.map((label, i) => (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:9, color:"#4a7098", letterSpacing:0.5 }}>{label}</span>
                  <span style={{ fontSize:11, color:"#c8e8ff", fontFamily:"monospace", fontWeight:700 }}>
                    {angles[i].toFixed(1)}°
                  </span>
                </div>
                <input type="range"
                  min={A3D.limits[i][0]} max={A3D.limits[i][1]} step={1}
                  value={angles[i]}
                  onChange={e => { const a=[...angles]; a[i]=Number(e.target.value); setAngles(a); }}
                  style={STYL}
                />
              </div>
            ))}

            {/* FK result */}
            <div style={{ marginTop:10, background:"#050c18", borderRadius:4, padding:"10px 12px", fontSize:10, lineHeight:1.9, color:"#7a9ab8" }}>
              <div style={{ fontSize:9, color:"#1e3050", letterSpacing:1, marginBottom:4 }}>END-EFFECTOR</div>
              <div>x = <span style={{color:"#7dd3fc"}}>{ex.toFixed(1)}</span> mm</div>
              <div>y = <span style={{color:"#7dd3fc"}}>{ey.toFixed(1)}</span> mm</div>
              <div>z = <span style={{color:"#7dd3fc"}}>{ez.toFixed(1)}</span> mm</div>
              <div style={{marginTop:4,fontSize:9,color:"#3a6080"}}>
                X-axis: [{getColX(tipT).map(v=>v.toFixed(2)).join(", ")}]
              </div>
              <div style={{fontSize:9,color:"#3a6080"}}>
                Z-axis: [{getColZ(tipT).map(v=>v.toFixed(2)).join(", ")}]
              </div>
            </div>

            <button onClick={() => setWaypoints(w => [...w, [...angles]])} style={{
              marginTop:10, width:"100%", background:"#00c2a822",
              border:"1px solid #00c2a855", borderRadius:5, color:"#00c2a8",
              padding:"7px", fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:700,
            }}>+ Record Point  P{waypoints.length+1}</button>

            <button onClick={() => setAngles([0,-30,60,0,-30,0])} style={{
              marginTop:6, width:"100%", background:"none",
              border:"1px solid #1a2e4a", borderRadius:5, color:"#3a5870",
              padding:"5px", fontSize:10, cursor:"pointer", fontFamily:"inherit",
            }}>⌂ Reset to Home</button>
          </div>
        )}

        {/* ── PROGRAM TAB ── */}
        {innerTab === "program" && (
          <div>
            {waypoints.length === 0 ? (
              <div style={{ fontSize:11, color:"#1e3050", textAlign:"center", padding:"30px 0", lineHeight:2.2 }}>
                No waypoints yet.<br/>
                <span style={{fontSize:10,color:"#1a2e4a"}}>
                  Go to Jog, position the arm,<br/>then press "Record Point".
                </span>
              </div>
            ) : (
              <div>
                <div style={{fontSize:9,color:"#1e3050",letterSpacing:1,marginBottom:8}}>
                  WAYPOINTS ({waypoints.length})  ·  click to preview
                </div>
                {waypoints.map((wp, i) => {
                  const fr = fk3d(wp);
                  const [px,py,pz] = getPos3(fr[fr.length-1]);
                  return (
                    <div key={i} onClick={() => setAngles([...wp])} style={{
                      display:"flex", alignItems:"center", gap:6, marginBottom:5,
                      padding:"7px 10px", borderRadius:4, cursor:"pointer",
                      background:highlightWpIdx===i?"rgba(0,194,168,0.10)":"#0a1828",
                      border:`1px solid ${highlightWpIdx===i?"#00c2a855":"#1a2e4a"}`,
                      transition:"border-color .15s",
                    }}>
                      <span style={{ fontSize:10, color:"#00c2a8", fontWeight:700, minWidth:24 }}>P{i+1}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:9, color:"#4a7098" }}>
                          ({px.toFixed(0)}, {py.toFixed(0)}, {pz.toFixed(0)}) mm
                        </div>
                        <div style={{ fontSize:8, color:"#1e3050" }}>
                          [{wp.map(a=>a.toFixed(0)).join(", ")}]°
                        </div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setWaypoints(w=>w.filter((_,j)=>j!==i));}} style={{
                        background:"none", border:"none", color:"#f43f5e44",
                        cursor:"pointer", fontSize:14, lineHeight:1, padding:"0 2px",
                      }} title="Delete">×</button>
                    </div>
                  );
                })}
                <div style={{ display:"flex", gap:6, marginTop:12 }}>
                  <button
                    onClick={teachPlaying ? onStop : onPlay}
                    disabled={waypoints.length < 2}
                    style={{
                      flex:1, background:teachPlaying?"#f43f5e22":"#818cf822",
                      border:`1px solid ${teachPlaying?"#f43f5e55":"#818cf855"}`,
                      borderRadius:5, color:teachPlaying?"#f43f5e":"#818cf8",
                      padding:"7px", fontSize:11, cursor:waypoints.length>=2?"pointer":"not-allowed",
                      fontFamily:"inherit", fontWeight:700, opacity:waypoints.length>=2?1:0.4,
                    }}>
                    {teachPlaying ? "⏹ Stop" : "▶ Play Sequence"}
                  </button>
                  <button onClick={()=>setWaypoints([])} style={{
                    background:"none", border:"1px solid #1a2e4a",
                    borderRadius:5, color:"#3a5870", padding:"7px 10px",
                    fontSize:10, cursor:"pointer", fontFamily:"inherit",
                  }}>Clear All</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CODE TAB ── */}
        {innerTab === "code" && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {["python","matlab"].map(l => (
                <button key={l} onClick={()=>setCodeLang(l)} style={{
                  background:codeLang===l?"#0c1828":"transparent",
                  border:`1px solid ${codeLang===l?"#4a7098":"#1a2e4a"}`,
                  borderRadius:4, color:codeLang===l?"#c8e8ff":"#3a6080",
                  padding:"3px 12px", fontSize:10, cursor:"pointer", fontFamily:"inherit",
                }}>{l==="python"?"Python":"MATLAB"}</button>
              ))}
              <button onClick={()=>navigator.clipboard?.writeText(genCode())} style={{
                marginLeft:"auto", background:"none", border:"1px solid #1a2e4a",
                borderRadius:4, color:"#3a6080", padding:"3px 8px",
                fontSize:9, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5,
              }}>Copy</button>
            </div>
            <pre style={{
              margin:0, padding:"12px 14px", background:"#050c18", borderRadius:4,
              fontSize:10, lineHeight:1.75, color:"#7dd3fc",
              overflowX:"auto", whiteSpace:"pre-wrap", fontFamily:"inherit",
            }}>{genCode()}</pre>
          </div>
        )}

      </div>
    </div>
  );
}

// ================================================================
//  INTRO MODAL
// ================================================================
function IntroModal({ onClose }) {
  return (
    <div style={{
      position:"absolute", inset:0, background:"rgba(3,8,18,0.96)",
      zIndex:100, display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'JetBrains Mono',Consolas,monospace",
    }}>
      <div style={{
        width:"min(820px,95vw)", background:"#07101e",
        border:"1px solid #1a3050", borderRadius:10,
        padding:32, color:"#c8d8f0",
      }}>
        <div style={{fontSize:10,letterSpacing:3,color:"#00c2a8",marginBottom:8}}>
          ROBOT ARM SIMULATOR
        </div>
        <div style={{fontSize:20,fontWeight:700,color:"#e8f4ff",marginBottom:6}}>
          Learn Robot Programming — From Zero
        </div>
        <div style={{fontSize:11,color:"#3a6080",marginBottom:20}}>
          10 guided missions · Real Python (Pyodide) · Real MATLAB (OpenMat) · STEM Tutor included
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#4ade80",marginBottom:8,letterSpacing:1}}>
              CHAPTER 1 — FIRST STEPS (M0–M2)
            </div>
            <div style={{fontSize:11,color:"#7a9ab8",lineHeight:1.8,marginBottom:12}}>
              <div style={{marginBottom:4}}>M0 — <span style={{color:"#4ade80"}}>Hello Robot</span> — change one number, see it move</div>
              <div style={{marginBottom:4}}>M1 — <span style={{color:"#22d3ee"}}>Trig Review</span> — sin, cos, the FK formula</div>
              <div>M2 — <span style={{color:"#f97316"}}>atan2</span> — compute angles automatically</div>
            </div>
            <div style={{fontSize:10,fontWeight:700,color:"#a78bfa",marginBottom:8,letterSpacing:1}}>
              CHAPTER 2 — MULTI-LINK ARMS (M3–M4)
            </div>
            <div style={{fontSize:11,color:"#7a9ab8",lineHeight:1.8}}>
              <div style={{marginBottom:4}}>M3 — <span style={{color:"#a78bfa"}}>2-Joint FK</span> — chain two links</div>
              <div>M4 — <span style={{color:"#fb923c"}}>Workspace</span> — reach any point in the annulus</div>
            </div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#00c2a8",marginBottom:8,letterSpacing:1}}>
              CHAPTER 3 — MATRIX MECHANICS (M5–M7)
            </div>
            <div style={{fontSize:11,color:"#7a9ab8",lineHeight:1.8,marginBottom:12}}>
              <div style={{marginBottom:4}}>M5 — <span style={{color:"#00c2a8"}}>4×4 Matrices</span> — why homogeneous coords?</div>
              <div style={{marginBottom:4}}>M6 — <span style={{color:"#f59e0b"}}>FK Chain</span> — 3-joint matrix multiplication</div>
              <div>M7 — <span style={{color:"#818cf8"}}>Orientation</span> — gripper angle constraint</div>
            </div>
            <div style={{fontSize:10,fontWeight:700,color:"#f43f5e",marginBottom:8,letterSpacing:1}}>
              CHAPTER 4 — INVERSE KINEMATICS (M8–M9)
            </div>
            <div style={{fontSize:11,color:"#7a9ab8",lineHeight:1.8}}>
              <div style={{marginBottom:4}}>M8 — <span style={{color:"#f43f5e"}}>Law of Cosines IK</span> — analytic 2-link solution</div>
              <div>M9 — <span style={{color:"#10b981"}}>Wrist Decoupling</span> — full 3-link with orientation</div>
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#00c2a8",marginBottom:8,letterSpacing:1}}>THREE TABS</div>
            <div style={{fontSize:11,color:"#7a9ab8",lineHeight:1.8}}>
              <div style={{padding:"5px 10px",background:"#0a1828",borderLeft:"2px solid #7dd3fc",borderRadius:"0 4px 4px 0",marginBottom:6}}>
                <span style={{color:"#7dd3fc",fontWeight:700}}>Python</span> — real Python via Pyodide. Set <code style={{background:"#060e1a",padding:"1px 4px"}}>joint_angles=[...]</code> and hit ▶ Run.
              </div>
              <div style={{padding:"5px 10px",background:"#0a1828",borderLeft:"2px solid #818cf8",borderRadius:"0 4px 4px 0",marginBottom:6}}>
                <span style={{color:"#818cf8",fontWeight:700}}>MATLAB</span> — real OpenMat engine. Live 4×4 Matrix View updates after each run.
              </div>
              <div style={{padding:"5px 10px",background:"#0a1828",borderLeft:"2px solid #f59e0b",borderRadius:"0 4px 4px 0"}}>
                <span style={{color:"#f59e0b",fontWeight:700}}>Theory</span> — math explanations for each mission.
              </div>
            </div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#00c2a8",marginBottom:8,letterSpacing:1}}>THE FLOW</div>
            <div style={{fontSize:11,color:"#7a9ab8",lineHeight:1.9}}>
              <div><span style={{color:"#e8f4ff"}}>1.</span> Read Theory to learn the concept.</div>
              <div><span style={{color:"#e8f4ff"}}>2.</span> Edit the code (Python or MATLAB).</div>
              <div><span style={{color:"#e8f4ff"}}>3.</span> Press ▶ Run — arm animates.</div>
              <div><span style={{color:"#e8f4ff"}}>4.</span> Land the gripper inside the target circle.</div>
              <div><span style={{color:"#e8f4ff"}}>5.</span> Click 🤖 Tutor for AI help anytime.</div>
            </div>
          </div>
        </div>

        <button onClick={onClose} style={{
          background:"#00c2a822", border:"1px solid #00c2a8",
          borderRadius:6, color:"#00c2a8", padding:"10px 32px",
          fontSize:12, fontFamily:"inherit", fontWeight:700,
          letterSpacing:1, cursor:"pointer",
        }}>
          Start Mission 0: Hello, Robot! →
        </button>
      </div>
    </div>
  );
}

// ================================================================
//  MAIN COMPONENT
// ================================================================
export default function RobotArmLab({ onBack }) {
  const [mIdx, setMIdx] = useState(0);
  const [rightTab, setRightTab] = useState("python");
  const [code, setCode] = useState(MISSIONS[0].starterCode);
  const [matlabCode, setMatlabCode] = useState(MISSIONS[0].matlabStarterCode);
  const [angles, setAngles] = useState(Array(MISSIONS[0].numJoints).fill(0));
  const [targetAngles, setTargetAngles] = useState(null);
  const [consoleLines, setConsoleLines] = useState([]);
  const [codeError, setCodeError] = useState(null);
  const [hasRun, setHasRun] = useState(false);
  const [won, setWon] = useState(false);
  const [completed, setCompleted] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("rfl-completed-v2")||"[]");}catch{return [];}
  });
  const [tutPage, setTutPage] = useState(0);
  const [matStep, setMatStep] = useState(null);
  const [playback, setPlayback] = useState({ active:false, frame:0, frames:45, start:null, end:null });
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem("rfl-intro-seen"));
  const [pyLoading, setPyLoading] = useState(false);
  const [showTutor, setShowTutor] = useState(false);

  // ── 3D Teach Pendant state ──────────────────────────────────────
  const [teachAngles, setTeachAngles] = useState([0,-30,60,0,-30,0]);
  const [waypoints,   setWaypoints]   = useState([]);
  const [teachPlaying, setTeachPlaying] = useState(false);
  const [teachPlayIdx, setTeachPlayIdx] = useState(-1);

  // ── 2D Teach Pendant state ──────────────────────────────────────
  const [teach2dAngles, setTeach2dAngles] = useState(null); // null = follow main angles
  const [teach2dWaypoints, setTeach2dWaypoints] = useState([]);
  const [teach2dPlaying, setTeach2dPlaying] = useState(false);
  const [teach2dPlayIdx, setTeach2dPlayIdx] = useState(-1);
  const teach2dPlayRef = useRef(null);

  const rafRef       = useRef(null);
  const canvasRef    = useRef(null);
  const teachPlayRef = useRef(null);
  const SC = 0.78;

  const mission = MISSIONS[mIdx];
  const isUnlocked = () => true; // all missions open — no device-lock dependency

  useEffect(()=>{
    const m = MISSIONS[mIdx];
    setCode(m.starterCode);
    setMatlabCode(m.matlabStarterCode);
    setConsoleLines([]); setCodeError(null); setHasRun(false);
    setWon(false); setTutPage(0); setMatStep(null);
    setTargetAngles(null);
    setTeach2dAngles(null);
    setTeach2dWaypoints([]);
    setTeach2dPlaying(false);
    setTeach2dPlayIdx(-1);
    stopPlayback();
    if (m.type === "3d") {
      setAngles([0, -30, 60, 0, -30, 0]);
    } else {
      const {angles:a} = runCode(m.starterCode, m.numJoints);
      setAngles(a || Array(m.numJoints).fill(0));
    }
  }, [mIdx]);

  const stopPlayback = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPlayback(p=>({...p, active:false}));
  };

  useEffect(()=>{
    if (!playback.active || !playback.start || !playback.end) return;
    const step = () => {
      setPlayback(p=>{
        if (!p.active) return p;
        const nextFrame = p.frame + 1;
        const t = nextFrame / p.frames;
        const lerped = p.start.map((s,i)=>s+(p.end[i]-s)*t);
        setAngles(lerped);
        if (nextFrame >= p.frames) {
          setAngles([...p.end]);
          return {...p, active:false, frame:p.frames};
        }
        rafRef.current = requestAnimationFrame(step);
        return {...p, frame:nextFrame};
      });
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if(rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playback.active]);

  const is3D = mission.type === "3d";
  const joints = is3D ? [] : fk(angles, mission.lengths);
  const tip = is3D ? { x:0, y:0, M:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]] } : joints[joints.length-1];
  const tipAngle = is3D ? 0 : (Math.atan2(tip.M[1][0], tip.M[0][0])*180)/Math.PI;

  // 3D end-effector position derived from fk3d
  const tip3D = useMemo(()=>{
    if (!is3D) return null;
    const frames = fk3d(angles.length===6 ? angles : [0,0,0,0,0,0]);
    const M = frames[frames.length-1];
    return { x: M[0][3], y: M[1][3], z: M[2][3] };
  }, [is3D, angles]);

  useEffect(()=>{
    if (is3D) {
      if (!tip3D || !mission.target3d) return;
      const [tx,ty,tz] = mission.target3d;
      const dist = Math.sqrt((tip3D.x-tx)**2+(tip3D.y-ty)**2+(tip3D.z-tz)**2);
      setWon(dist < mission.target3dTol);
    } else {
      const dx=tip.x-mission.targetX, dy=tip.y-mission.targetY;
      const posOk = Math.sqrt(dx*dx+dy*dy)<mission.tolerance;
      if (mission.targetAngle!==null && mission.angleTolerance) {
        let d=Math.abs(tipAngle-mission.targetAngle); while(d>180) d=Math.abs(d-360);
        setWon(posOk && d<mission.angleTolerance);
      } else setWon(posOk);
    }
  }, [tip,tip3D,tipAngle,mission,is3D]);

  useEffect(()=>{
    if (won && !completed.includes(mIdx)) {
      const n=[...completed,mIdx]; setCompleted(n);
      localStorage.setItem("rfl-completed-v2",JSON.stringify(n));
    }
  }, [won]);

  const handleRun = useCallback(async ()=>{
    const isMatlab = rightTab === "matlab";
    let runResult;
    if (isMatlab) {
      runResult = runMatlabReal(matlabCode, mission.numJoints);
    } else {
      setPyLoading(true);
      runResult = await runPythonReal(code, mission.numJoints);
      setPyLoading(false);
    }
    const {angles:a, output, error} = runResult;
    setHasRun(true); setCodeError(error);
    const extra = [];
    if (a) {
      setTargetAngles(a);
      if (is3D) {
        // 3D FK analysis
        const frames = fk3d(a);
        const M = frames[frames.length-1];
        const ex=M[0][3], ey=M[1][3], ez=M[2][3];
        extra.push(`→ end-effector: x=${ex.toFixed(1)}  y=${ey.toFixed(1)}  z=${ez.toFixed(1)} mm`);
        if (mission.target3d) {
          const [tx,ty,tz] = mission.target3d;
          const dist = Math.sqrt((ex-tx)**2+(ey-ty)**2+(ez-tz)**2);
          extra.push(`→ target: (${tx}, ${ty}, ${tz}) mm`);
          extra.push(`→ distance to target: ${dist.toFixed(1)} mm  ${dist<mission.target3dTol?"✓":"✗"}`);
        }
        // Show the X-axis and Z-axis of tool frame
        extra.push(`→ tool X-axis: [${M[0][0].toFixed(3)}, ${M[1][0].toFixed(3)}, ${M[2][0].toFixed(3)}]`);
        extra.push(`→ tool Z-axis: [${M[0][2].toFixed(3)}, ${M[1][2].toFixed(3)}, ${M[2][2].toFixed(3)}]`);
        if (mission.obstacles3d) {
          const c3 = checkCollisions3d(frames, mission.obstacles3d);
          if (c3.length > 0) c3.forEach(msg => extra.push(msg));
          else extra.push("✓ No obstacle collisions in this configuration");
        }
        setAngles([...a]);
      } else {
        const j2=fk(a,mission.lengths), t2=j2[j2.length-1];
        const dx=t2.x-mission.targetX, dy=t2.y-mission.targetY;
        const dist=Math.sqrt(dx*dx+dy*dy);
        const ang=(Math.atan2(t2.M[1][0],t2.M[0][0])*180)/Math.PI;
        extra.push(`→ tip: (${t2.x.toFixed(2)}, ${t2.y.toFixed(2)}) mm`);
        extra.push(`→ distance to target: ${dist.toFixed(2)} mm  ${dist<mission.tolerance?"✓":"✗"}`);
        if (mission.targetAngle!==null) {
          let d=Math.abs(ang-mission.targetAngle); while(d>180) d=Math.abs(d-360);
          extra.push(`→ gripper angle: ${ang.toFixed(2)}°  (target: ${mission.targetAngle}°)  ${d<(mission.angleTolerance||15)?"✓":"✗"}`);
        }
        // Collision check for obstacle missions
        if (mission.obstacles) {
          const collisions = checkCollisions(j2, mission.obstacles);
          if (collisions.length > 0) {
            collisions.forEach(msg => extra.push(msg));
          } else {
            extra.push("✓ No collisions detected");
          }
        }
        const startA=[...angles];
        setPlayback({ active:true, frame:0, frames:45, start:startA, end:a });
      }
    }
    setConsoleLines([...output, ...extra]);
  }, [code, matlabCode, rightTab, mission, angles, is3D]);

  const handleStep = useCallback(()=>{
    if (!targetAngles) return;
    const total=45;
    setPlayback(p=>{
      const nextFrame = Math.min(p.frame+3, total);
      const t = nextFrame/total;
      const start = p.start || [...angles];
      const lerped = start.map((s,i)=>s+(targetAngles[i]-s)*t);
      setAngles(lerped);
      if (nextFrame>=total) setAngles([...targetAngles]);
      return {...p, active:false, frame:nextFrame, start, end:targetAngles};
    });
  }, [targetAngles, angles]);

  const handleReset = useCallback(()=>{
    stopPlayback();
    if (is3D) {
      setAngles([0, -30, 60, 0, -30, 0]);
    } else {
      const {angles:a}=runCode(mission.starterCode, mission.numJoints);
      setAngles(a||Array(mission.numJoints).fill(0));
    }
    setCode(mission.starterCode);
    setMatlabCode(mission.matlabStarterCode);
    setConsoleLines([]); setCodeError(null); setHasRun(false); setTargetAngles(null);
  }, [mission, is3D]);

  const makeKeyDownHandler = (setter, getCode) => (e) => {
    if ((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();handleRun();}
    if (e.key==="Tab"){
      e.preventDefault();
      const ta=e.target, s=ta.selectionStart, end=ta.selectionEnd;
      const n=getCode().slice(0,s)+"    "+getCode().slice(end); setter(n);
      requestAnimationFrame(()=>{ta.selectionStart=ta.selectionEnd=s+4;});
    }
  };

  const handleKeyDown = useCallback(makeKeyDownHandler(setCode, ()=>code), [handleRun,code]);
  const handleMatlabKeyDown = useCallback(makeKeyDownHandler(setMatlabCode, ()=>matlabCode), [handleRun,matlabCode]);

  useEffect(()=>{
    if (is3D) return; // 3D missions use Arm3DCanvas, not the 2D canvas
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d");
    const W=canvas.width, H=canvas.height;
    ctx.clearRect(0,0,W,H);
    const ox=W/2, oy=H*0.6;
    drawBackground(ctx,W,H);
    drawAxes(ctx,W,H,ox,oy);
    drawSceneObjects(ctx,W,H,ox,oy,SC,mission.scene,mission,won);
    drawTarget(ctx,ox,oy,SC,mission,won);
    drawBase(ctx,ox,oy);
    drawArm(ctx,joints,SC,ox,oy,won,matStep);
    drawHUD(ctx,W,H,tip,tipAngle,mission,won);
    // Draw teach2d waypoint dots when in teach2d mode
    if (rightTab==="teach2d" && teach2dWaypoints.length>0) {
      teach2dWaypoints.forEach((wp,i)=>{
        const j=fk(wp,mission.lengths), t=j[j.length-1];
        const bx=ox+t.x*SC, by=oy-t.y*SC;
        const isHl = i===teach2dPlayIdx;
        ctx.beginPath(); ctx.arc(bx,by,isHl?7:4.5,0,Math.PI*2);
        ctx.fillStyle=isHl?"#10b981":"#00c2a8cc";
        ctx.fill();
        ctx.fillStyle="#e8f4ff"; ctx.font="bold 8px monospace";
        ctx.textAlign="center"; ctx.fillText(`P${i+1}`,bx,by-9); ctx.textAlign="left";
        if (i<teach2dWaypoints.length-1) {
          const wp2=teach2dWaypoints[i+1], j2=fk(wp2,mission.lengths), t2=j2[j2.length-1];
          ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(ox+t2.x*SC,oy-t2.y*SC);
          ctx.strokeStyle="#00c2a866"; ctx.lineWidth=1.5; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
        }
      });
    }
  }, [is3D,joints,tip,tipAngle,won,mission,matStep,rightTab,teach2dWaypoints,teach2dPlayIdx]);

  // Pre-warm Pyodide so first run is faster
  useEffect(() => { getPyodide().catch(()=>{}); }, []);

  // ── Teach Pendant playback ──────────────────────────────────────
  const handleTeachPlay = useCallback(() => {
    if (waypoints.length < 2) return;
    const wps = waypoints; // snapshot at call time
    let idx = 0, frame = 0;
    const FRAMES = 60;
    setTeachPlaying(true);
    setTeachPlayIdx(0);
    setTeachAngles([...wps[0]]);

    const step = () => {
      frame++;
      const t = Math.min(frame / FRAMES, 1);
      const from = wps[idx], to = wps[idx+1];
      setTeachAngles(from.map((a,j) => a + (to[j]-a)*t));
      if (t >= 1) {
        idx++;  frame = 0;
        setTeachPlayIdx(idx);
        if (idx >= wps.length-1) {
          setTeachAngles([...wps[wps.length-1]]);
          setTeachPlaying(false);
          setTeachPlayIdx(-1);
          return;
        }
      }
      teachPlayRef.current = requestAnimationFrame(step);
    };
    teachPlayRef.current = requestAnimationFrame(step);
  }, [waypoints]);

  const handleTeachStop = useCallback(() => {
    if (teachPlayRef.current) cancelAnimationFrame(teachPlayRef.current);
    setTeachPlaying(false);
    setTeachPlayIdx(-1);
  }, []);

  // Cleanup teach playback on unmount
  useEffect(() => () => { if (teachPlayRef.current) cancelAnimationFrame(teachPlayRef.current); }, []);

  // ── 2D Teach Pendant play/stop ─────────────────────────────────
  const handleTeach2dPlay = useCallback(() => {
    if (teach2dWaypoints.length < 2) return;
    const wps = teach2dWaypoints;
    let idx = 0, frame = 0;
    const FRAMES = 60;
    setTeach2dPlaying(true);
    setTeach2dPlayIdx(0);
    setAngles([...wps[0]]);

    const step = () => {
      frame++;
      const t = Math.min(frame / FRAMES, 1);
      const from = wps[idx], to = wps[idx+1];
      setAngles(from.map((a,j) => a + (to[j]-a)*t));
      if (t >= 1) {
        idx++;  frame = 0;
        setTeach2dPlayIdx(idx);
        if (idx >= wps.length-1) {
          setAngles([...wps[wps.length-1]]);
          setTeach2dPlaying(false);
          setTeach2dPlayIdx(-1);
          return;
        }
      }
      teach2dPlayRef.current = requestAnimationFrame(step);
    };
    teach2dPlayRef.current = requestAnimationFrame(step);
  }, [teach2dWaypoints]);

  const handleTeach2dStop = useCallback(() => {
    if (teach2dPlayRef.current) cancelAnimationFrame(teach2dPlayRef.current);
    setTeach2dPlaying(false);
    setTeach2dPlayIdx(-1);
  }, []);

  useEffect(() => () => { if (teach2dPlayRef.current) cancelAnimationFrame(teach2dPlayRef.current); }, []);

  const langNote = rightTab === "matlab"
    ? `CURRENT LANGUAGE: MATLAB\nThe user is writing MATLAB code. Use MATLAB syntax ONLY in all examples and suggestions.\nMATLAB: use deg2rad(), rad2deg(), fprintf('val = %.2f', x), disp(x), % for comments, ^ for power, semicolons (;) suppress output.\nNEVER suggest Python syntax (print, degrees, radians, **, #) when in MATLAB mode.`
    : `CURRENT LANGUAGE: Python\nThe user is writing Python code. Use Python syntax ONLY in all examples and suggestions.\nPython: use print(), degrees(), radians(), from math import *, ** for power, # for comments.\nNEVER suggest MATLAB syntax (fprintf, disp, deg2rad, rad2deg, ^, %) when in Python mode.`;

  const tutorContext = useMemo(() => ({
    title: `Robot Arm Simulator — Mission ${mission.id}: ${mission.title}`,
    summary: `${mission.tagline} (${mission.numJoints}-joint arm${mission.lengths ? `, lengths: ${mission.lengths.join(", ")} mm` : ", 6-DOF 3D"})`,
    activeCode: rightTab === "matlab" ? matlabCode : code,
    output: consoleLines.join("\n"),
    lastRunStatus: codeError ? "error" : hasRun ? "success" : "not run",
    lastRunSource: rightTab === "matlab" ? "MATLAB (OpenMat engine)" : "Python (Pyodide)",
    docsExcerpt: `${langNote}\n\nMISSION THEORY:\n${mission.tutorial.map(t => `## ${t.heading}\n${t.body}`).join("\n\n")}`,
  }), [mission, rightTab, code, matlabCode, consoleLines, codeError, hasRun, langNote]);

  const matlabText = is3D ? "" : generateMatlabText(angles, mission.lengths, mission, matStep);
  const playProgress = playback.frames>0 ? Math.round((playback.frame/playback.frames)*100) : 0;

  const runBtn = (
    <button onClick={handleRun} disabled={pyLoading} style={{
      marginLeft:"auto", background:pyLoading?"#1a2e4a":mission.color+"22",
      border:`1px solid ${pyLoading?"#2a4060":mission.color+"55"}`, borderRadius:5,
      color:pyLoading?"#3a6080":mission.color, padding:"4px 16px", fontSize:11,
      cursor:pyLoading?"not-allowed":"pointer",
      fontFamily:"inherit", fontWeight:700, letterSpacing:0.5, transition:"all .2s",
    }}>{pyLoading ? "⏳ Loading Python…" : "▶ Run"}</button>
  );

  const consolePanel = (
    <div style={{
      flexShrink:0, background:"#07101e", padding:"8px 14px",
      minHeight:68, maxHeight:140, overflowY:"auto",
      borderTop:"1px solid #1a2e4a",
    }}>
      <div style={{fontSize:9,color:"#1e3050",letterSpacing:1,marginBottom:4}}>
        CONSOLE  {pyLoading&&<span style={{color:"#00c2a8"}}>— loading Python runtime…</span>}
        {!hasRun&&!pyLoading&&<span style={{color:"#162440"}}>— press ▶ Run</span>}
      </div>
      {codeError&&<div style={{color:"#f43f5e",fontSize:11,fontFamily:"monospace",marginBottom:4}}>✗ {codeError}</div>}
      {consoleLines.map((line,i)=>(
        <div key={i} style={{
          fontSize:11,fontFamily:"monospace",lineHeight:1.7,
          color:line.startsWith("→")?(line.includes("✓")?"#10b981":line.includes("✗")?"#f43f5e":"#818cf8"):"#7dd3fc",
        }}>{line.startsWith("→")?line:`> ${line}`}</div>
      ))}
      {hasRun&&!codeError&&consoleLines.length===0&&(
        <div style={{fontSize:11,color:"#1e3050",fontFamily:"monospace"}}>(add print(...) to see intermediate values)</div>
      )}
    </div>
  );

  return (
    <div style={{
      height:"100vh", background:"rgba(5,10,18,0.94)",
      fontFamily:"'JetBrains Mono',Consolas,monospace",
      color:"#c8d8f0", display:"flex", flexDirection:"column",
      overflow:"hidden", position:"relative",
    }}>
      {showIntro && (
        <IntroModal onClose={()=>{
          localStorage.setItem("rfl-intro-seen","1");
          setShowIntro(false);
        }}/>
      )}

      {/* ── HEADER ── */}
      <div style={{
        background:"#07101e", borderBottom:"1px solid #1a2e4a",
        padding:"10px 20px", display:"flex", alignItems:"center", gap:14, flexShrink:0,
      }}>
        {onBack && <>
          <button onClick={onBack} style={{
            background:"none",border:"none",color:"#3a6080",
            cursor:"pointer",fontSize:11,letterSpacing:"2px",fontFamily:"inherit",padding:0,
          }}>← LABS</button>
          <div style={{width:1,height:22,background:"#1a2e4a"}}/>
        </>}
        <div style={{
          width:36,height:36,borderRadius:8,background:mission.color,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,
        }}>🦾</div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#e8f4ff",letterSpacing:0.3}}>Robot Arm Lab</div>
          <div style={{fontSize:9,color:"#3a5870",letterSpacing:1.2}}>
            4×4 HOMOGENEOUS TRANSFORMS · FORWARD & INVERSE KINEMATICS
          </div>
        </div>
        <button onClick={()=>setShowIntro(true)} style={{
          background:"none", border:"1px solid #1a3050", borderRadius:5,
          color:"#2a5070", cursor:"pointer", fontSize:10,
          fontFamily:"inherit", padding:"3px 10px", letterSpacing:0.5,
        }}>? Help</button>
        <button onClick={()=>setShowTutor(t=>!t)} style={{
          background:showTutor?"rgba(0,194,168,0.12)":"none",
          border:`1px solid ${showTutor?"#00c2a866":"#1a3050"}`,
          borderRadius:5, color:showTutor?"#00c2a8":"#2a5070",
          cursor:"pointer", fontSize:10,
          fontFamily:"inherit", padding:"3px 10px", letterSpacing:0.5,
        }}>🤖 Tutor</button>
        <div style={{marginLeft:"auto",display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
          {MISSIONS.map((m,i)=>{
            const unlocked=isUnlocked(i), done=completed.includes(i);
            return (
              <button key={i} onClick={()=>unlocked&&setMIdx(i)}
                title={!unlocked?`Complete Mission ${i-1} first`:`M${i}: ${m.title}`}
                style={{
                  background:i===mIdx?m.color+"22":done?m.color+"0e":"transparent",
                  border:`1px solid ${i===mIdx?m.color:done?m.color+"44":"#1a2e4a"}`,
                  borderRadius:4, padding:"2px 8px", fontSize:9, fontFamily:"inherit",
                  color:i===mIdx?m.color:done?m.color+"99":unlocked?"#3a6080":"#1e3050",
                  cursor:unlocked?"pointer":"not-allowed", opacity:unlocked?1:0.4,
                  display:"flex",alignItems:"center",gap:3,transition:"all .15s",minWidth:0,
                }}>
                {done&&<span style={{fontSize:8}}>✓</span>}
                {!unlocked&&<span style={{fontSize:8}}>🔒</span>}
                M{i}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MISSION BANNER ── */}
      <div style={{
        background:"#07101e", borderBottom:`2px solid ${mission.color}33`,
        padding:"8px 20px", display:"flex", alignItems:"center",
        justifyContent:"space-between", gap:16, flexShrink:0,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{
            fontSize:9,fontWeight:700,letterSpacing:1.2,
            background:mission.color+"22",color:mission.color,
            border:`1px solid ${mission.color}44`,borderRadius:3,padding:"2px 8px",
          }}>{mission.badge.toUpperCase()}</span>
          <span style={{fontSize:13,fontWeight:700,color:"#e8f4ff"}}>{mission.title}</span>
          <span style={{fontSize:11,color:"#3a6080"}}>{mission.tagline}</span>
          {won&&<span style={{
            fontSize:11,color:"#10b981",background:"rgba(16,185,129,0.1)",
            border:"1px solid #10b98144",borderRadius:4,padding:"2px 9px",
          }}>✓ Mission complete!</span>}
        </div>
        {won&&mIdx<MISSIONS.length-1&&(
          <button onClick={()=>setMIdx(mIdx+1)} style={{
            background:MISSIONS[mIdx+1].color+"22",
            border:`1px solid ${MISSIONS[mIdx+1].color}55`,
            borderRadius:6,color:MISSIONS[mIdx+1].color,
            padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit",flexShrink:0,
          }}>Next Mission →</button>
        )}
      </div>

      {/* ── BODY ── */}
      <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>

        {/* LEFT: 2D canvas (2D missions) or 3D canvas (3D missions / teach3d tab) */}
        <div style={{
          flex:"0 0 62%",display:"flex",flexDirection:"column",
          borderRight:"1px solid #1a2e4a",minHeight:0,overflow:"hidden",
        }}>
          {/* 2D canvas — shown for 2D missions, hidden in teach3d mode or 3D missions */}
          <div style={{
            flex:1,display:(is3D||rightTab==="teach3d")?"none":"flex",
            flexDirection:"column",minHeight:0,overflow:"hidden",
          }}>
            <div style={{flex:1,position:"relative",minHeight:0,overflow:"hidden"}}>
              <canvas ref={canvasRef} width={620} height={520}
                style={{width:"100%",height:"100%",display:"block"}}
              />
            </div>
            {/* Playback controls */}
            <div style={{
              background:"#07101e",borderTop:"1px solid #1a2e4a",
              padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0,
            }}>
              <button onClick={()=>{ if(playback.active){stopPlayback();}else if(targetAngles){setPlayback({active:true,frame:0,frames:45,start:[...angles],end:targetAngles});}}}
                disabled={!targetAngles}
                style={{
                  background:playback.active?mission.color+"33":"#0f1e33",
                  border:`1px solid ${playback.active?mission.color+"88":"#1a3050"}`,
                  borderRadius:5,color:playback.active?mission.color:"#4a7098",
                  padding:"5px 14px",fontSize:10,cursor:targetAngles?"pointer":"not-allowed",
                  fontFamily:"inherit",opacity:targetAngles?1:0.4,
                }}>
                {playback.active?"⏸ Pause":"▶ Replay"}
              </button>
              <button onClick={handleStep} disabled={!targetAngles||playback.active}
                style={{
                  background:"#0f1e33",border:"1px solid #1a3050",borderRadius:5,
                  color:"#4a7098",padding:"5px 14px",fontSize:10,
                  cursor:(targetAngles&&!playback.active)?"pointer":"not-allowed",
                  fontFamily:"inherit",opacity:(targetAngles&&!playback.active)?1:0.4,
                }}>⏭ Step</button>
              <div style={{flex:1,height:3,background:"#1a2e4a",borderRadius:2,overflow:"hidden"}}>
                {targetAngles&&<div style={{width:`${playProgress}%`,height:"100%",background:mission.color,transition:"width .1s"}}/>}
              </div>
              <button onClick={handleReset} style={{
                background:"#0f1e33",border:"1px solid #1a3050",borderRadius:5,
                color:"#3a5870",padding:"5px 14px",fontSize:10,cursor:"pointer",fontFamily:"inherit",
              }}>↺ Reset</button>
            </div>
          </div>

          {/* 3D canvas — shown for 3D missions OR teach3d tab */}
          <div style={{
            flex:1,display:(is3D||rightTab==="teach3d")?"flex":"none",
            flexDirection:"column",minHeight:0,
          }}>
            <Arm3DCanvas
              angles={is3D && rightTab!=="teach3d" ? angles : teachAngles}
              waypoints={rightTab==="teach3d" ? waypoints : []}
              highlightWpIdx={rightTab==="teach3d" ? teachPlayIdx : -1}
              target3d={is3D && rightTab!=="teach3d" ? mission.target3d : null}
              target3dTol={is3D && rightTab!=="teach3d" ? mission.target3dTol : null}
              obstacles3d={is3D ? mission.obstacles3d : null}
            />
          </div>
        </div>

        {/* RIGHT: tabs */}
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,minHeight:0,overflow:"hidden"}}>
          {/* Tab bar */}
          <div style={{
            display:"flex",background:"#07101e",borderBottom:"1px solid #1a2e4a",flexShrink:0,
          }}>
            {[
              ["python","Python"],
              ["matlab","MATLAB"],
              ["theory","Theory"],
              ...(!is3D ? [["teach2d","2D Teach"]] : []),
              ["teach3d","3D Teach"],
            ].map(([id,label])=>(
              <button key={id} onClick={()=>setRightTab(id)} style={{
                background:rightTab===id?"#0c1828":"transparent",
                border:"none",
                borderBottom:rightTab===id?`2px solid ${id==="teach3d"||id==="teach2d"?"#00c2a8":mission.color}`:"2px solid transparent",
                color:rightTab===id?id==="teach3d"||id==="teach2d"?"#00c2a8":"#e8f4ff":"#3a6080",
                padding:"9px 16px",fontSize:11,cursor:"pointer",fontFamily:"inherit",letterSpacing:0.3,
                transition:"color .15s",
              }}>{label}</button>
            ))}
          </div>

          {/* PYTHON TAB */}
          {rightTab==="python" && (
            <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
              <div style={{
                display:"flex",alignItems:"center",gap:8,padding:"6px 12px",
                background:"#0a1622",borderBottom:"1px solid #1a2e4a",flexShrink:0,
              }}>
                <span style={{fontSize:9,color:"#2a4870",letterSpacing:1}}>
                  set <span style={{color:"#7dd3fc"}}>joint_angles</span> = [...]  ·  Ctrl+Enter to run
                </span>
                {runBtn}
              </div>
              <textarea value={code} onChange={e=>setCode(e.target.value)} onKeyDown={handleKeyDown}
                spellCheck={false}
                style={{
                  flex:1,background:"#060e1a",color:"#c8e8ff",
                  border:"none",borderBottom:"1px solid #1a2e4a",
                  padding:"14px 16px",fontFamily:"inherit",fontSize:12.5,lineHeight:1.8,
                  resize:"none",outline:"none",minHeight:0,tabSize:4,
                }}
              />
              {consolePanel}
            </div>
          )}

          {/* MATLAB TAB */}
          {rightTab==="matlab" && (
            <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
              {/* Editor header */}
              <div style={{
                display:"flex",alignItems:"center",gap:8,padding:"6px 12px",
                background:"#0a1622",borderBottom:"1px solid #1a2e4a",flexShrink:0,
              }}>
                <span style={{fontSize:9,color:"#2a4870",letterSpacing:1}}>
                  set <span style={{color:"#818cf8"}}>joint_angles</span> = [...]  ·  <span style={{color:"#2a4870"}}>% comments · ^ for power</span>
                </span>
                {runBtn}
              </div>
              {/* MATLAB code editor */}
              <textarea value={matlabCode} onChange={e=>setMatlabCode(e.target.value)} onKeyDown={handleMatlabKeyDown}
                spellCheck={false}
                style={{
                  flex:"0 0 42%",background:"#060e1a",color:"#c8e8ff",
                  border:"none",borderBottom:"1px solid #1a2e4a",
                  padding:"14px 16px",fontFamily:"inherit",fontSize:12.5,lineHeight:1.8,
                  resize:"none",outline:"none",tabSize:4,
                }}
              />
              {/* Console */}
              {consolePanel}
              {/* Matrix view header */}
              <div style={{
                display:"flex",alignItems:"center",gap:6,padding:"5px 12px",
                background:"#0a1622",borderBottom:"1px solid #1a2e4a",flexShrink:0,flexWrap:"wrap",
              }}>
                <span style={{fontSize:9,color:"#2a4870",letterSpacing:1}}>MATRIX VIEW:</span>
                <button onClick={()=>setMatStep(null)} style={{
                  background:matStep===null?"#818cf822":"transparent",
                  border:`1px solid ${matStep===null?"#818cf866":"#1a2e4a"}`,
                  borderRadius:4,color:matStep===null?"#818cf8":"#3a6080",
                  padding:"2px 9px",fontSize:10,cursor:"pointer",fontFamily:"inherit",
                }}>All</button>
                {(mission.lengths||[]).map((_,i)=>(
                  <button key={i} onClick={()=>setMatStep(i+1)} style={{
                    background:matStep===i+1?JCOLORS[i%JCOLORS.length]+"22":"transparent",
                    border:`1px solid ${matStep===i+1?JCOLORS[i%JCOLORS.length]+"66":"#1a2e4a"}`,
                    borderRadius:4,color:matStep===i+1?JCOLORS[i%JCOLORS.length]:"#3a6080",
                    padding:"2px 9px",fontSize:10,cursor:"pointer",fontFamily:"inherit",
                  }}>T_{Array.from({length:i+1},(_,k)=>k+1).join("..")}</button>
                ))}
                <span style={{fontSize:9,color:"#1e3050",marginLeft:"auto"}}>live · updates with ▶ Run</span>
              </div>
              {/* Live matrix display */}
              <pre style={{
                flex:1,margin:0,padding:"12px 16px",
                background:"#050c18",color:"#7dd3fc",
                fontFamily:"'JetBrains Mono',Consolas,monospace",
                fontSize:10.5,lineHeight:1.8,overflowY:"auto",whiteSpace:"pre",minHeight:0,
              }}>
                {matlabText}
              </pre>
            </div>
          )}

          {/* THEORY TAB */}
          {rightTab==="theory" && (
            <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
              <div style={{
                display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"8px 14px",background:"#0a1622",borderBottom:"1px solid #1a2e4a",flexShrink:0,
              }}>
                <div style={{fontSize:9,color:"#2a4870",letterSpacing:1}}>THEORY</div>
                <div style={{display:"flex",gap:5}}>
                  {mission.tutorial.map((_,i)=>(
                    <div key={i} onClick={()=>setTutPage(i)} style={{
                      width:7,height:7,borderRadius:"50%",cursor:"pointer",
                      background:i===tutPage?mission.color:"#1a2e4a",
                      border:`1px solid ${i===tutPage?mission.color:"#2a4060"}`,
                    }}/>
                  ))}
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
                <div style={{
                  fontSize:12,color:mission.color,fontWeight:700,marginBottom:12,lineHeight:1.4,
                }}>
                  {mission.tutorial[tutPage].heading}
                </div>
                <pre style={{
                  fontSize:11,color:"#7a9ab8",fontFamily:"inherit",
                  lineHeight:1.9,whiteSpace:"pre-wrap",margin:0,
                }}>
                  {mission.tutorial[tutPage].body}
                </pre>
              </div>
              <div style={{
                padding:"10px 14px",borderTop:"1px solid #1a2e4a",
                display:"flex",justifyContent:"space-between",flexShrink:0,
              }}>
                <button onClick={()=>setTutPage(p=>Math.max(0,p-1))} disabled={tutPage===0} style={{
                  background:"transparent",border:"1px solid #1a2e4a",borderRadius:4,
                  color:tutPage===0?"#1a2e4a":"#3a6080",
                  padding:"5px 12px",fontSize:10,cursor:"pointer",fontFamily:"inherit",
                }}>prev</button>
                <span style={{fontSize:9,color:"#1a3050",alignSelf:"center"}}>
                  {tutPage+1} / {mission.tutorial.length}
                </span>
                <button onClick={()=>setTutPage(p=>Math.min(mission.tutorial.length-1,p+1))}
                  disabled={tutPage===mission.tutorial.length-1} style={{
                  background:"transparent",border:"1px solid #1a2e4a",borderRadius:4,
                  color:tutPage===mission.tutorial.length-1?"#1a2e4a":mission.color,
                  padding:"5px 12px",fontSize:10,cursor:"pointer",fontFamily:"inherit",
                }}>next</button>
              </div>
            </div>
          )}

          {/* 2D TEACH TAB */}
          {rightTab==="teach2d" && !is3D && (
            <Teach2DPanel
              mission={mission}
              angles={angles}
              setAngles={setAngles}
              waypoints={teach2dWaypoints}
              setWaypoints={setTeach2dWaypoints}
              highlightWpIdx={teach2dPlayIdx}
              playing={teach2dPlaying}
              onPlay={handleTeach2dPlay}
              onStop={handleTeach2dStop}
            />
          )}

          {/* 3D TEACH TAB */}
          {rightTab==="teach3d" && (
            <TeachPendantPanel
              angles={teachAngles}
              setAngles={setTeachAngles}
              waypoints={waypoints}
              setWaypoints={setWaypoints}
              highlightWpIdx={teachPlayIdx}
              teachPlaying={teachPlaying}
              onPlay={handleTeachPlay}
              onStop={handleTeachStop}
            />
          )}

        </div>
      </div>
      {showTutor && <TutorPanel context={tutorContext} />}
    </div>
  );
}
