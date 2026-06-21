import { useState, useEffect } from "react";

export function useViewportSize(ref) {
  const [size, setSize] = useState({ width: 960, height: 640 });

  useEffect(() => {
    if (!ref.current) return undefined;
    const node = ref.current;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(420, Math.floor(rect.width)),
        height: Math.max(420, Math.floor(rect.height)),
      });
    };
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(node);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return size;
}
