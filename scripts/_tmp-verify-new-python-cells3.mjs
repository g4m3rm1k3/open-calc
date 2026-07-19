import { loadPyodide } from "pyodide"

const pyodide = await loadPyodide()
await pyodide.loadPackage(["micropip"])
const micropip = pyodide.pyimport("micropip")
await micropip.install("pycryptodome")

await pyodide.runPythonAsync(`
import time
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256

password = "password123"
salt = b"fixed-demo-salt"

def derive(iterations):
    start = time.perf_counter()
    key = PBKDF2(password, salt, dkLen=32, count=iterations, hmac_hash_module=SHA256)
    elapsed_ms = (time.perf_counter() - start) * 1000
    return key.hex(), elapsed_ms

for iterations in [1_000, 10_000, 100_000]:
    key_hex, elapsed = derive(iterations)
    print(f"{iterations:>7,} iterations -> {elapsed:7.1f} ms  key={key_hex[:32]}...")
`)
console.log("--- OK ---")
