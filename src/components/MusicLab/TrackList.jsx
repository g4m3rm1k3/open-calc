import { useState } from "react";
import StepGrid from "./StepGrid";
import styles from "./MusicLab.module.css";

const TRACK_TYPES = [
  { type: "kick",    label: "🥁 Kick" },
  { type: "snare",   label: "🎯 Snare" },
  { type: "hihat",   label: "🎪 Hi-hat" },
  { type: "openhat", label: "🔔 Open Hat" },
  { type: "clap",    label: "👏 Clap" },
  { type: "synth",   label: "🎹 Synth" },
  { type: "bass",    label: "🎸 Bass" },
  { type: "sampler", label: "🎛 Sampler" },
];

export default function TrackList({
  tracks, currentStep, selectedTrackId, stepCount, isPlaying,
  onSelect, onToggleStep, onSetVelocity, onMute, onSolo, onRemove,
  onRename, onClearSteps, onRandomize, onAddTrack, onOpenPianoRoll,
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className={styles.trackList}>
      <div className={styles.trackListHeader}>
        <span className={styles.trackListLabel}>Tracks</span>
        <div className={styles.stepNumbers}>
          {Array.from({ length: stepCount }, (_, i) => (
            <span
              key={i}
              className={`${styles.stepNum} ${i === currentStep ? styles.stepNumActive : ""}`}
            >
              {i % 4 === 0 ? i + 1 : "·"}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.tracks}>
        {tracks.map(track => (
          <Track
            key={track.id}
            track={track}
            currentStep={currentStep}
            isSelected={track.id === selectedTrackId}
            stepCount={stepCount}
            isPlaying={isPlaying}
            onSelect={() => onSelect(track.id)}
            onToggleStep={(i) => onToggleStep(track.id, i)}
            onSetVelocity={(i, vel) => onSetVelocity?.(track.id, i, vel)}
            onMute={() => onMute(track.id)}
            onSolo={() => onSolo(track.id)}
            onRemove={() => onRemove(track.id)}
            onRename={(name) => onRename(track.id, name)}
            onClear={() => onClearSteps(track.id)}
            onRandomize={() => onRandomize(track.id)}
            onOpenPianoRoll={onOpenPianoRoll}
          />
        ))}
      </div>

      <div className={styles.addTrackRow}>
        <div className={styles.addTrackMenu}>
          <button
            className={styles.addTrackBtn}
            onClick={() => setShowAddMenu(v => !v)}
          >
            + Add Track
          </button>
          {showAddMenu && (
            <div className={styles.addTrackDropdown}>
              {TRACK_TYPES.map(({ type, label }) => (
                <button
                  key={type}
                  className={styles.addTrackOption}
                  onClick={() => { onAddTrack(type); setShowAddMenu(false); }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Track({
  track, currentStep, isSelected, stepCount, isPlaying,
  onSelect, onToggleStep, onSetVelocity, onMute, onSolo, onRemove,
  onRename, onClear, onRandomize, onOpenPianoRoll,
}) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(track.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleNameBlur = () => {
    setEditing(false);
    onRename(nameVal);
  };

  const hasPianoRoll = ["synth", "bass", "sampler"].includes(track.type);

  return (
    <div
      className={`${styles.track} ${isSelected ? styles.trackSelected : ""}`}
      onClick={onSelect}
      style={{ "--track-color": track.color }}
    >
      {/* Left controls */}
      <div className={styles.trackControls}>
        <div
          className={styles.trackColorBar}
          style={{ background: track.color }}
        />

        {editing ? (
          <input
            className={styles.trackNameInput}
            value={nameVal}
            autoFocus
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === "Enter" && handleNameBlur()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={styles.trackName}
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
            title="Double-click to rename"
          >
            {track.name}
          </span>
        )}

        <div className={styles.trackBtns}>
          <button
            className={`${styles.trackBtn} ${track.muted ? styles.trackBtnMuted : ""}`}
            onClick={(e) => { e.stopPropagation(); onMute(); }}
            title="Mute"
          >M</button>
          <button
            className={`${styles.trackBtn} ${track.soloed ? styles.trackBtnSolo : ""}`}
            onClick={(e) => { e.stopPropagation(); onSolo(); }}
            title="Solo"
          >S</button>
        </div>

        <div className={styles.trackMenuWrap}>
          <button
            className={styles.trackMenuBtn}
            onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
            title="Track options"
          >⋮</button>
          {showMenu && (
            <div className={styles.trackMenuDropdown}>
              {hasPianoRoll && (
                <button onClick={(e) => { e.stopPropagation(); onOpenPianoRoll(); setShowMenu(false); }}>
                  🎹 Piano Roll
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onClear(); setShowMenu(false); }}>
                Clear Steps
              </button>
              <button onClick={(e) => { e.stopPropagation(); onRandomize(); setShowMenu(false); }}>
                Randomize
              </button>
              <button
                className={styles.trackMenuDanger}
                onClick={(e) => { e.stopPropagation(); onRemove(); setShowMenu(false); }}
              >
                Delete Track
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step grid */}
      <StepGrid
        steps={track.steps}
        currentStep={currentStep}
        color={track.color}
        muted={track.muted}
        isPlaying={isPlaying}
        onToggle={onToggleStep}
        onSetVelocity={onSetVelocity}
      />
    </div>
  );
}
