// Shared Pyodide singleton for Robot Arm Lab and similar tools.
// PythonNotebook has its own separate singleton with opencalc/matplotlib setup.
let pyodidePromise = null;

export async function getPyodide() {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    if (!window.loadPyodide) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Failed to load Pyodide CDN"));
        document.head.appendChild(script);
      });
    }
    const py = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      fullStdLib: false,
    });
    await py.runPythonAsync("from math import *; print('Python ready')");
    return py;
  })();
  return pyodidePromise;
}
