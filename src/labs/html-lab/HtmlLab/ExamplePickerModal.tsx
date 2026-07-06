import styles from "./HtmlLab.module.css";
import type { Example } from "./types";

interface Props {
  items: Example[];
  title: string;
  onSelect: (ex: Example) => void;
  onClose: () => void;
}

export default function ExamplePickerModal({ items, title, onSelect, onClose }: Props) {
  return (
    <div
      className={styles.exPickerOverlay}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.exPickerBox}>
        <div className={styles.exPickerHeader}>
          <span>{title}</span>
          <button className={styles.exPickerClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.exPickerGrid}>
          {items.map((ex) => (
            <button
              key={ex.id}
              className={styles.exPickerCard}
              onClick={() => onSelect(ex)}
            >
              <span className={styles.exPickerIcon}>{ex.icon}</span>
              <span className={styles.exPickerName}>{ex.name}</span>
              <span className={styles.exPickerDesc}>{ex.description}</span>
              {ex.badge && (
                <span className={styles.exPickerBadge}>{ex.badge}</span>
              )}
              {ex.requiresCdn && (
                <span className={styles.exPickerCdn}>
                  requires {ex.requiresCdn.join(", ")} CDN
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
