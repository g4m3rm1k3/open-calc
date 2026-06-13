import styles from "./HtmlLab.module.css";
import { EXAMPLES } from "./exampleGallery";

export default function ExamplePickerModal({ onSelect, onClose }) {
  return (
    <div
      className={styles.exPickerOverlay}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.exPickerBox}>
        <div className={styles.exPickerHeader}>
          <span>Choose an Example Project</span>
          <button className={styles.exPickerClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.exPickerGrid}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              className={styles.exPickerCard}
              onClick={() => onSelect(ex)}
            >
              <span className={styles.exPickerIcon}>{ex.icon}</span>
              <span className={styles.exPickerName}>{ex.name}</span>
              <span className={styles.exPickerDesc}>{ex.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
