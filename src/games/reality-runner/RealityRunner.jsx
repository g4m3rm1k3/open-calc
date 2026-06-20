// RealityRunner — React shell around a Phaser game. This file only does
// React-side bookkeeping: mounting/tearing down the Phaser.Game instance,
// keeping the canvas correctly sized, wiring up audio + touch input refs,
// and rendering the surrounding UI (Sidebar, TouchControls, DeadOverlay).
//
// All actual gameplay — world generation, physics, collisions, scoring — is
// in lib/GameScene.js. Start there if you're adding a new enemy/hazard/
// pickup; that file has a "how to add a new X" recipe at the top.
import { useCallback, useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";
import GameHelp from "../shared/GameHelp.jsx";
import { createAudioContext } from "../shared/audio.js";
import GameScene from "./lib/GameScene.js";
import { W, H, isTouchCapable } from "./lib/constants.js";
import TouchControls from "./components/TouchControls.jsx";
import Sidebar from "./components/Sidebar.jsx";
import DeadOverlay from "./components/DeadOverlay.jsx";

export default function RealityRunner({ onClose }) {
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const paramsRef = useRef(null);
  // Mutable, polled every frame by GameScene.update() — NOT React state,
  // since that would re-render on every touch and fight the game loop.
  const touchRef = useRef({
    left: false, right: false, jumpQueued: false, powerJumpQueued: false,
    poundQueued: false, poundHeld: false, flipL: false, flipR: false,
  });
  const audioCtxRef = useRef(null);

  const [params, setParams] = useState({
    gravity: 760, jumpSpeed: 480, elasticity: 0.62, friction: 0.1, controlGain: 1.0,
  });
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(90);
  const [msg, setMsg] = useState("");
  const [abilities, setAbilities] = useState({ superJump: false, crush: false });
  const [dead, setDead] = useState(null);
  const [runId, setRunId] = useState(0);
  const [inPinball, setInPinball] = useState(false);
  const [isTouch] = useState(isTouchCapable);

  paramsRef.current = params;

  // Browsers block audio playback before a user gesture — lazily create the
  // context on the first key/tap rather than at mount.
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) audioCtxRef.current = createAudioContext();
      window.removeEventListener("keydown", initAudio);
      window.removeEventListener("pointerdown", initAudio);
    };
    window.addEventListener("keydown", initAudio);
    window.addEventListener("pointerdown", initAudio);
    return () => {
      window.removeEventListener("keydown", initAudio);
      window.removeEventListener("pointerdown", initAudio);
    };
  }, []);

  // Boots one Phaser.Game per run (runId bumps on reset, remounting fresh).
  useEffect(() => {
    if (!mountRef.current) return;
    const pr = paramsRef;
    const tr = touchRef;

    const config = {
      type: Phaser.AUTO,
      width: W,
      height: H,
      parent: mountRef.current,
      backgroundColor: "#0b1422",
      physics: { default: "arcade", arcade: { gravity: { y: params.gravity }, debug: false } },
      scene: [GameScene],
      // Keep the world's logical resolution fixed at W×H (all level-gen and
      // camera math in GameScene is hardcoded against it) but scale the
      // displayed canvas to fit whatever space is actually available.
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    };

    const game = new Phaser.Game(config);
    // The registry is Phaser's way of handing data INTO a scene — GameScene
    // reads these back out in its own create(). Refs (paramsRef, touchRef,
    // audioCtxRef) let the scene read live values every frame without React
    // re-renders; the onX callbacks let the scene push events back out to
    // React state.
    game.registry.set("paramsRef", pr);
    game.registry.set("touchRef", tr);
    game.registry.set("audioCtxRef", audioCtxRef);
    game.registry.set("onScore", (v) => setScore(v));
    game.registry.set("onEnergy", (v) => setEnergy(v));
    game.registry.set("onAbility", (key) => setAbilities((prev) => ({ ...prev, [key]: true })));
    game.registry.set("onMsg", (v) => setMsg(v));
    game.registry.set("onDead", (info) => setDead(info));
    game.registry.set("onZone", (v) => setInPinball(v));
    gameRef.current = game;

    // Phaser's FIT mode recalculates on `window.resize`, but this lab can
    // also be resized by the desktop window manager (maximize/restore is a
    // CSS/layout change, not a browser resize event) — the same class of bug
    // found in golf/basketball. `game.scale.refresh()` did fire correctly on
    // every container-size change (confirmed via logging) but the canvas's
    // CSS size never actually updated to match — so this sets the canvas's
    // displayed size directly instead of going through ScaleManager.
    const fitCanvas = () => {
      const parent = mountRef.current;
      if (!parent || !game.canvas) return;
      const pw = parent.clientWidth, ph = parent.clientHeight;
      if (!pw || !ph) return;
      const scale = Math.min(pw / W, ph / H);
      game.canvas.style.width = `${Math.round(W * scale)}px`;
      game.canvas.style.height = `${Math.round(H * scale)}px`;
    };
    const resizeObserver = new ResizeObserver(fitCanvas);
    resizeObserver.observe(mountRef.current);
    const settleTimer = setTimeout(fitCanvas, 120);

    return () => { clearTimeout(settleTimer); resizeObserver.disconnect(); game.destroy(true); gameRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  const handleParam = useCallback((key, val) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  }, []);

  const reset = useCallback(() => {
    setScore(0);
    setEnergy(90);
    setMsg("");
    setAbilities({ superJump: false, crush: false });
    setDead(null);
    setRunId((id) => id + 1);
  }, []);

  return (
    <div style={{ display: "flex", height: "100%", background: "#0b1422", color: "#e6eef7", fontFamily: "ui-monospace, monospace", position: "relative" }}>
      <GameHelp
        title="Reality Runner — Physics Sandbox"
        sections={[
          { heading: "What you’re learning", body: "Every interaction is a real physics formula, shown live in the sidebar as you trigger it: jump height from v₀=√(2gh), bounce pads from restitution e=v₂/v₁, bumpers from elastic collisions, lightning rods from Q=CV. Drag the sliders to see how changing gravity, jump speed, friction, control gain, and elasticity changes how the world feels." },
          { heading: "How to play", body: isTouch
              ? "Use the on-screen left/right pad to move and the jump button to jump. Once you unlock Power Jump or Ground Pound, buttons for those appear too. In a pinball chamber, flipper buttons appear automatically."
              : "Move with ←/→ or A/D, jump with Space/Up/W. Power Jump (J) and Ground Pound (K) unlock as you run further. Z/X control the flippers inside pinball chambers." },
          { heading: "Goal", body: "There's no finish line — it's an endless runner. Survive as far as you can, collect energy and life pickups, and rack up the highest score before you run out of lives." },
        ]}
      />

      <Sidebar
        onClose={onClose}
        score={score}
        energy={energy}
        msg={msg}
        params={params}
        onParamChange={handleParam}
        abilities={abilities}
        onReset={reset}
        isTouch={isTouch}
      />

      {/* Canvas */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        <div ref={mountRef} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} />

        {isTouch && <TouchControls touchRef={touchRef} abilities={abilities} inPinball={inPinball} />}

        <DeadOverlay dead={dead} onReset={reset} />
      </div>
    </div>
  );
}
