import { useState } from "react";
import styles from "./HtmlLab.module.css";

const SKIP_PREFIX = "htmllab_skip_";

export function shouldSkip(key) {
  return localStorage.getItem(SKIP_PREFIX + key) === "true";
}

export default function ConfirmDialog({ storageKey, message, onConfirm, onCancel }) {
  const [dontShow, setDontShow] = useState(false);

  const handleOk = () => {
    if (dontShow) localStorage.setItem(SKIP_PREFIX + storageKey, "true");
    onConfirm();
  };

  return (
    <div className={styles.confirmOverlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={styles.confirmBox}>
        <p className={styles.confirmMsg}>{message}</p>
        <label className={styles.confirmSkip}>
          <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} />
          Don't show this again
        </label>
        <div className={styles.confirmBtns}>
          <button className={styles.confirmCancel} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmOk} onClick={handleOk}>OK</button>
        </div>
      </div>
    </div>
  );
}
