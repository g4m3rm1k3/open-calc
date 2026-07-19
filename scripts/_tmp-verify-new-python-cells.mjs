import { loadPyodide } from "pyodide"

const pyodide = await loadPyodide()
await pyodide.loadPackage(["micropip"])

console.log("=== Lesson 1, Cell A: hashlib cross-check ===")
await pyodide.runPythonAsync(`
import hashlib

text = "password123"
md5_hash = hashlib.md5(text.encode()).hexdigest()
sha1_hash = hashlib.sha1(text.encode()).hexdigest()
sha256_hash = hashlib.sha256(text.encode()).hexdigest()

print(f"Input: {text!r}")
print(f"MD5:     {md5_hash}")
print(f"SHA-1:   {sha1_hash}")
print(f"SHA-256: {sha256_hash}")
`)

console.log("\n=== Lesson 1, Cell B: real PBKDF2 timing ===")
await pyodide.runPythonAsync(`
import hashlib
import time

password = "password123"
salt = b"fixed-demo-salt"

def derive(iterations):
    start = time.perf_counter()
    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, iterations)
    elapsed_ms = (time.perf_counter() - start) * 1000
    return key.hex(), elapsed_ms

for iterations in [1_000, 10_000, 100_000]:
    key_hex, elapsed = derive(iterations)
    print(f"{iterations:>7,} iterations -> {elapsed:7.1f} ms  key={key_hex[:32]}...")
`)

console.log("\n=== Lesson 2, new Cell: real AES-ECB pattern leak in Python ===")
await pyodide.loadPackage(["micropip"])
const micropip = pyodide.pyimport("micropip")
await micropip.install("pycryptodome")
await pyodide.runPythonAsync(`
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

key = get_random_bytes(32)

block = b"REPEATEDBLOCK!!!"  # exactly 16 bytes
plaintext = block + block + block  # three identical blocks back to back

ecb_cipher = AES.new(key, AES.MODE_ECB)
ecb_ciphertext = ecb_cipher.encrypt(plaintext)
ecb_blocks = [ecb_ciphertext[i:i+16].hex() for i in range(0, len(ecb_ciphertext), 16)]
print("ECB ciphertext blocks:")
for b in ecb_blocks:
    print(" ", b)
print("All identical?", len(set(ecb_blocks)) == 1)

iv = get_random_bytes(16)
cbc_cipher = AES.new(key, AES.MODE_CBC, iv=iv)
cbc_ciphertext = cbc_cipher.encrypt(plaintext)
cbc_blocks = [cbc_ciphertext[i:i+16].hex() for i in range(0, len(cbc_ciphertext), 16)]
print()
print("CBC ciphertext blocks:")
for b in cbc_blocks:
    print(" ", b)
print("All identical?", len(set(cbc_blocks)) == 1)
`)
console.log("\n--- All cells ran with no errors ---")
