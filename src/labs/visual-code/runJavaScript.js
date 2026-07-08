export function buildRunnableHtml({ html, code }) {
  const safeHtml = html?.trim() || '<main id="app"></main>';
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        margin: 0;
        font-family: Inter, system-ui, sans-serif;
        color: #111827;
        background: #f8fafc;
      }
      #app {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
        box-sizing: border-box;
        font-size: 24px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    ${safeHtml}
    <script>
      const send = (type, value) => parent.postMessage({ source: "visual-code-runner", type, value }, "*");
      ["log", "warn", "error"].forEach((level) => {
        const original = console[level];
        console[level] = (...args) => {
          send(level, args.map((arg) => {
            if (typeof arg === "string") return arg;
            try { return JSON.stringify(arg); } catch { return String(arg); }
          }).join(" "));
          original.apply(console, args);
        };
      });
      window.addEventListener("error", (event) => send("error", event.message));
      try {
${String(code || "").split("\n").map((line) => `        ${line}`).join("\n")}
      } catch (error) {
        console.error(error?.stack || error?.message || String(error));
      }
    </script>
  </body>
</html>`;
}

