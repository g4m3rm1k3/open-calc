import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Ry, Rz, mat4vec, norm3, ikFromNormal, wrapDeg180 } from "./FiveAxisKinematics.tsx";
import type { Vec3 } from "./FiveAxisKinematics.tsx";

const vecStr = (v: Vec3) => `[${v.map((x) => (x >= 0 ? " " : "") + x.toFixed(3)).join(", ")}]`;

function rotateByZthenY(n: Vec3, C_deg: number, B_deg: number): { afterC: Vec3; afterB: Vec3 } {
  const afterCraw = mat4vec(Rz((C_deg * Math.PI) / 180), [n[0], n[1], n[2], 0]);
  const afterC: Vec3 = [afterCraw[0], afterCraw[1], afterCraw[2]];
  const afterBraw = mat4vec(Ry((B_deg * Math.PI) / 180), [afterC[0], afterC[1], afterC[2], 0]);
  const afterB: Vec3 = [afterBraw[0], afterBraw[1], afterBraw[2]];
  return { afterC, afterB };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{title}</div>
      {children}
    </div>
  );
}

function PostureTrace({ label, n, ik, color }: { label: string; n: Vec3; ik: { B_deg: number; C_deg: number }; color: string }) {
  const { afterC, afterB } = rotateByZthenY(n, ik.C_deg, ik.B_deg);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 flex flex-col gap-1.5 flex-1 min-w-[220px]">
      <div className="text-[10px] font-black uppercase tracking-wide" style={{ color }}>{label}</div>
      <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">C = {ik.C_deg.toFixed(2)}°, B = {ik.B_deg.toFixed(2)}°</div>
      <div className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300 mt-1">n = {vecStr(n)}</div>
      <div className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300">after Rz(C) → {vecStr(afterC)}</div>
      <div className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300">
        after Ry(B) → {vecStr(afterB)}
        <span className={Math.abs(afterB[0]) < 0.01 && Math.abs(afterB[1]) < 0.01 && afterB[2] > 0.99 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
          {" "}{Math.abs(afterB[0]) < 0.01 && Math.abs(afterB[1]) < 0.01 && afterB[2] > 0.99 ? "✓" : "✗"}
        </span>
      </div>
    </div>
  );
}

export default function FiveAxisHelpModal({ onClose, targetNormal }: { onClose: () => void; targetNormal: Vec3 }) {
  const primaryIk = ikFromNormal(targetNormal[0], targetNormal[1], targetNormal[2], 0);
  const altIk = { B_deg: -primaryIk.B_deg, C_deg: wrapDeg180(primaryIk.C_deg + 180) };

  // Practice section — deliberately independent state, so this can be worked
  // on a completely different normal than whatever the Calculator currently
  // has dialed in.
  const [pnx, setPnx] = useState("0.3");
  const [pny, setPny] = useState("-0.4");
  const [pnz, setPnz] = useState("0.866");
  const [revealed, setRevealed] = useState<0 | 1 | 2 | 3>(0);

  const practiceN = useMemo<Vec3>(() => {
    const x = parseFloat(pnx), y = parseFloat(pny), z = parseFloat(pnz);
    if (![x, y, z].every(Number.isFinite)) return [0, 0, 1];
    return norm3([x, y, z]);
  }, [pnx, pny, pnz]);
  const practiceIk = ikFromNormal(practiceN[0], practiceN[1], practiceN[2], 0);
  const practiceTrace = rotateByZthenY(practiceN, practiceIk.C_deg, practiceIk.B_deg);

  // Portaled straight to document.body — this lab's root wrapper uses
  // backdrop-blur, which (like `transform`) creates a new containing block
  // for `position: fixed` descendants. Rendered in place, this modal would
  // get pinned to that ancestor's box instead of the real viewport.
  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[720px] max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-2xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-black tracking-wide">How B and C are actually found</div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-[16px] leading-none">×</button>
        </div>

        <Section title="1. The machine's chain">
          <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
            This machine spins the part with C first, then tilts the whole cradle (and the spinning part with it) with B.
            In matrix form that's <span className="font-mono">p_machine = Ry(B) · Rz(C) · p_part</span> — C is applied to the part directly (innermost), B is applied second, to everything at once (outermost).
          </p>
        </Section>

        <Section title="2. Why C is solved from the raw normal alone">
          <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
            A rotation about Z (that's C) never changes a vector's Z-component, and never changes its distance from the Z-axis (√(nx²+ny²)) — it only spins the (nx, ny) pair around in a circle.
            So C's job is purely to pick the spin angle that lines that (nx, ny) pair up with the +X direction: <span className="font-mono">C = atan2(-ny, nx)</span>. That's the "viewed from directly above" intuition — tilt magnitude never enters into it.
          </p>
        </Section>

        <Section title="3. Why B finishes the job">
          <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
            After C, the normal sits at (r, 0, nz) where r = √(nx²+ny²) — all the tilt is now in the X/Z plane. Ry(B) rotates exactly that plane, so a single angle finishes the alignment: <span className="font-mono">B = atan2(-r, nz)</span>.
            Notice both formulas only ever use the ORIGINAL nx, ny, nz — neither one waits on the other to be computed first, even though physically C moves before B.
          </p>
        </Section>

        <Section title="4. Worked example — your current target normal">
          <div className="flex flex-wrap gap-3">
            <PostureTrace label="This side" n={targetNormal} ik={primaryIk} color="#6366f1" />
            <PostureTrace label="Opposite side (flip)" n={targetNormal} ik={altIk} color="#ec4899" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Same starting normal, two different (B, C) pairs, both land on [0, 0, 1] — flipping B's sign and spinning C the other 180° around cancels out exactly.
          </p>
        </Section>

        <Section title="5. Practice it yourself">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Type any target normal (it'll be normalized), work out C and B on paper, then reveal each step to check yourself.
          </p>
          <div className="flex gap-2">
            {[["nx", pnx, setPnx], ["ny", pny, setPny], ["nz", pnz, setPnz]].map(([lbl, val, setter]) => (
              <label key={lbl as string} className="flex-1 flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold">{lbl as string}</span>
                <input
                  value={val as string}
                  onChange={(e) => { (setter as (v: string) => void)(e.target.value); setRevealed(0); }}
                  className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[11px] font-mono outline-none focus:border-indigo-400"
                />
              </label>
            ))}
          </div>
          <div className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400">normalized n = {vecStr(practiceN)}</div>

          <div className="flex flex-col gap-2 mt-1">
            {revealed >= 1 && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 text-[11px] font-mono">
                C = atan2(-ny, nx) = atan2({(-practiceN[1]).toFixed(3)}, {practiceN[0].toFixed(3)}) = <span className="font-bold text-purple-500">{practiceIk.C_deg.toFixed(2)}°</span>
              </div>
            )}
            {revealed >= 2 && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 text-[11px] font-mono">
                after Rz(C): n → {vecStr(practiceTrace.afterC)}
              </div>
            )}
            {revealed >= 3 && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 text-[11px] font-mono flex flex-col gap-1">
                <div>B = atan2(-r, nz) = <span className="font-bold text-rose-500">{practiceIk.B_deg.toFixed(2)}°</span></div>
                <div>
                  after Ry(B): → {vecStr(practiceTrace.afterB)}
                  <span className={Math.abs(practiceTrace.afterB[0]) < 0.01 && Math.abs(practiceTrace.afterB[1]) < 0.01 && practiceTrace.afterB[2] > 0.99 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                    {" "}{Math.abs(practiceTrace.afterB[0]) < 0.01 && Math.abs(practiceTrace.afterB[1]) < 0.01 && practiceTrace.afterB[2] > 0.99 ? "✓" : "✗"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {revealed < 3 ? (
            <button
              onClick={() => setRevealed((r) => (Math.min(3, r + 1) as 0 | 1 | 2 | 3))}
              className="self-start px-3 py-1.5 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wide"
            >
              {revealed === 0 ? "Reveal C" : revealed === 1 ? "Reveal after-Rz(C) vector" : "Reveal B + final check"}
            </button>
          ) : (
            <button
              onClick={() => setRevealed(0)}
              className="self-start px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide"
            >
              Hide steps
            </button>
          )}
        </Section>
      </div>
    </div>,
    document.body
  );
}
