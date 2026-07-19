import { loadPyodide } from "pyodide"

const pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/" })
await pyodide.loadPackage("micropip")
const micropip = pyodide.pyimport("micropip")
try {
  await micropip.install("pycryptodome")
  const result = await pyodide.runPythonAsync(`
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
key = get_random_bytes(16)
cipher = AES.new(key, AES.MODE_ECB)
data = b"YELLOW SUBMARINE"
ct = cipher.encrypt(data)
pt2 = AES.new(key, AES.MODE_ECB).decrypt(ct)
(ct.hex(), pt2)
`)
  console.log("SUCCESS on pyodide v0.26.4 (matches app's actual runtime):", result)
} catch (e) {
  console.log("FAILED on v0.26.4:", e.message)
}
