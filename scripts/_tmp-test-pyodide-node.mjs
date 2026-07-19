import { loadPyodide } from "pyodide"

const pyodide = await loadPyodide()
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
ct.hex()
`)
  console.log("SUCCESS pycryptodome AES-ECB works. ciphertext:", result)
} catch (e) {
  console.log("FAILED pycryptodome:", e.message)
}
