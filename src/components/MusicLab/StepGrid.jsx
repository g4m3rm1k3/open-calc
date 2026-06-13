import { useCallback, useRef } from "react";
import styles from "./MusicLab.module.css";

export default function StepGrid({ steps, currentStep, color, muted, isPlaying, onToggle, onSetVelocity }) {
  const dragRef = useRef(null); // { index, startY, startVel }

  const handleMouseDown = useCallback((i, e) => {
    e.stopPropagation();
    const vel = steps[i];
    if (vel > 0) {
      // Start drag to change velocity
      dragRef.current = { index: i, startY: e.clientY, startVel: vel };
      const onMove = (mv) => {
        if (!dragRef.current) return;
        const delta = dragRef.current.startY - mv.clientY; // drag up = higher
        const newVel = Math.max(1, Math.min(127, Math.round(dragRef.current.startVel + delta)));
        onSetVelocity?.(i, newVel);
      };
      const onUp = (ue) => {
        if (!dragRef.current) return;
        const totalDelta = Math.abs(dragRef.current.startY - ue.clientY);
        if (totalDelta < 3) onToggle(i); // treat as click if barely moved
        dragRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    } else {
      onToggle(i);
    }
  }, [steps, onToggle, onSetVelocity]);

  const handleContextMenu = useCallback((i, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (steps[i] > 0) onToggle(i); // right-click an active step = turn off
  }, [steps, onToggle]);

  return (
    <div className={styles.stepGrid}>
      {steps.map((vel, i) => {
        const on = vel > 0;
        const isCurrent = isPlaying && i === currentStep;
        const isGroup = i % 4 === 0;
        const velFraction = on ? vel / 127 : 0;

        return (
          <button
            key={i}
            className={[
              styles.step,
              on ? styles.stepOn : styles.stepOff,
              isCurrent ? styles.stepCurrent : "",
              isGroup ? styles.stepGroupStart : "",
              muted ? styles.stepMuted : "",
            ].join(" ")}
            style={on ? {
              "--step-color": color,
              "--step-vel": velFraction,
            } : undefined}
            onMouseDown={(e) => handleMouseDown(i, e)}
            onContextMenu={(e) => handleContextMenu(i, e)}
            title={on ? `Step ${i + 1} · vel ${vel} (drag to adjust, right-click to clear)` : `Step ${i + 1}`}
          />
        );
      })}
    </div>
  );
}
