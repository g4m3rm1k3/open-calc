// Touch controls overlay — mobile has no keyboard, so this is the entire
// input surface on touch devices: a D-pad, jump, and ability/flipper
// buttons that only appear once relevant (abilities unlocked / inside a
// pinball chamber), mirroring what the keyboard legend shows on desktop
// (see Sidebar.jsx).
//
// These buttons don't call into GameScene directly — they just flip flags
// on `touchRef.current`, the same mutable ref object GameScene polls each
// frame in its own update() loop (merged alongside keyboard state). See
// RealityRunner.jsx for where touchRef is created and handed to the scene
// via the Phaser registry.

function TouchBtn({ onDown, onUp, onTap, children, style }) {
  const press = (e) => { e.preventDefault(); if (onDown) onDown(); if (onTap) onTap(); };
  const release = (e) => { e.preventDefault(); if (onUp) onUp(); };
  return (
    <button
      onTouchStart={press}
      onTouchEnd={release}
      onTouchCancel={release}
      style={{
        WebkitTapHighlightColor: "transparent", touchAction: "none", userSelect: "none",
        borderRadius: 16, border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(20,30,45,0.65)", color: "#e6eef7",
        fontFamily: "ui-monospace, monospace", fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        ...style,
      }}
    >{children}</button>
  );
}

export default function TouchControls({ touchRef, abilities, inPinball }) {
  const setFlag = (key, val) => { touchRef.current[key] = val; };
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Move pad — bottom-left */}
      <div style={{ position: "absolute", left: 18, bottom: 18, display: "flex", gap: 10, pointerEvents: "auto" }}>
        <TouchBtn onDown={() => setFlag("left", true)} onUp={() => setFlag("left", false)} style={{ width: 64, height: 64, fontSize: 22 }}>◀</TouchBtn>
        <TouchBtn onDown={() => setFlag("right", true)} onUp={() => setFlag("right", false)} style={{ width: 64, height: 64, fontSize: 22 }}>▶</TouchBtn>
      </div>

      {/* Ability / flipper buttons — only shown once relevant */}
      <div style={{ position: "absolute", right: 18, bottom: 96, display: "flex", gap: 10, pointerEvents: "auto" }}>
        {inPinball && (
          <>
            <TouchBtn onDown={() => setFlag("flipL", true)} onUp={() => setFlag("flipL", false)} style={{ width: 56, height: 48, fontSize: 12 }}>FLP-L</TouchBtn>
            <TouchBtn onDown={() => setFlag("flipR", true)} onUp={() => setFlag("flipR", false)} style={{ width: 56, height: 48, fontSize: 12 }}>FLP-R</TouchBtn>
          </>
        )}
        {abilities.superJump && (
          <TouchBtn onTap={() => { touchRef.current.powerJumpQueued = true; }} style={{ width: 56, height: 48, fontSize: 11, background: "rgba(251,191,36,0.25)" }}>POWER<br />J</TouchBtn>
        )}
        {abilities.crush && (
          <TouchBtn
            onDown={() => setFlag("poundHeld", true)}
            onUp={() => setFlag("poundHeld", false)}
            onTap={() => { touchRef.current.poundQueued = true; }}
            style={{ width: 56, height: 48, fontSize: 11, background: "rgba(248,113,113,0.25)" }}
          >POUND<br />K</TouchBtn>
        )}
      </div>

      {/* Jump — bottom-right, primary action */}
      <div style={{ position: "absolute", right: 18, bottom: 18, pointerEvents: "auto" }}>
        <TouchBtn onTap={() => { touchRef.current.jumpQueued = true; }} style={{ width: 76, height: 76, fontSize: 13, background: "rgba(56,189,248,0.25)" }}>JUMP</TouchBtn>
      </div>
    </div>
  );
}
