import { loadPyodide } from "pyodide"

async function run(label, fn) {
  console.log(`\n=== ${label} ===`)
  try {
    await fn()
    console.log(`--- ${label}: OK ---`)
  } catch (e) {
    console.log(`--- ${label}: FAILED ---`)
    console.log(String(e).slice(0, 500))
  }
}

const pyodide = await loadPyodide()
await pyodide.loadPackage(["micropip"])

await run("Lesson 1, Cell A: hashlib cross-check", async () => {
  await pyodide.runPythonAsync(`
import hashlib
text = "password123"
print("MD5:", hashlib.md5(text.encode()).hexdigest())
print("SHA-1:", hashlib.sha1(text.encode()).hexdigest())
print("SHA-256:", hashlib.sha256(text.encode()).hexdigest())
`)
})

await run("Lesson 1, Cell B: real PBKDF2 timing", async () => {
  await pyodide.runPythonAsync(`
import hashlib, time
password = "password123"
salt = b"fixed-demo-salt"
start = time.perf_counter()
key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 10000)
elapsed_ms = (time.perf_counter() - start) * 1000
print("key:", key.hex()[:32], "elapsed_ms:", elapsed_ms)
`)
})

await run("Lesson 2, install pycryptodome", async () => {
  const micropip = pyodide.pyimport("micropip")
  await micropip.install("pycryptodome")
})

await run("Lesson 2, AES-ECB pattern leak", async () => {
  await pyodide.runPythonAsync(`
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
key = get_random_bytes(32)
block = b"REPEATEDBLOCK!!!"
plaintext = block + block + block
ecb_cipher = AES.new(key, AES.MODE_ECB)
ecb_ciphertext = ecb_cipher.encrypt(plaintext)
blocks = [ecb_ciphertext[i:i+16].hex() for i in range(0, len(ecb_ciphertext), 16)]
print("ECB blocks:", blocks)
print("All identical:", len(set(blocks)) == 1)
`)
})
