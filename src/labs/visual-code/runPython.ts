// Generates an iframe srcdoc that runs Python via Skulpt (browser-based Python WASM).
// Skulpt supports core Python 3 — functions, classes, loops, print, basic stdlib.
// Output is forwarded to the parent frame via postMessage (same protocol as runJavaScript.ts).

const SKULPT_CORE = 'https://skulpt.org/js/skulpt.min.js'
const SKULPT_STDLIB = 'https://skulpt.org/js/skulpt-stdlib.js'

export function buildRunnablePythonHtml(code: string): string {
  const escaped = JSON.stringify(code)
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <script src="${SKULPT_CORE}"></script>
    <script src="${SKULPT_STDLIB}"></script>
    <style>
      body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #111827; }
    </style>
  </head>
  <body>
    <script>
      const send = (type, value) => parent.postMessage({ source: "visual-code-runner", type, value }, "*");

      // Skulpt calls output() for every chunk of stdout text (may include \\n).
      // Split on newlines so each print() becomes a separate "log" message.
      let buf = "";
      function flush() {
        if (buf) { send("log", buf); buf = ""; }
      }
      function outf(text) {
        buf += text;
        const lines = buf.split("\\n");
        for (let i = 0; i < lines.length - 1; i++) {
          send("log", lines[i]);
        }
        buf = lines[lines.length - 1];
      }

      Sk.configure({
        output: outf,
        read: function(filename) {
          if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[filename] === undefined) {
            throw "File not found: '" + filename + "'";
          }
          return Sk.builtinFiles.files[filename];
        }
      });

      Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, ${escaped}, true);
      }).then(function() {
        flush();
      }).catch(function(err) {
        flush();
        send("error", err.toString());
      });
    </script>
  </body>
</html>`
}
