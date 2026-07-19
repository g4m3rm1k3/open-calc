import { loadPyodide } from "pyodide"

// Replicates PythonNotebook.jsx's actual init sequence after the fix: preload
// micropip via loadPackage (JS side) BEFORE any cell tries `import micropip`
// in Python — this is exactly the step that was missing and caused the live
// "ModuleNotFoundError: No module named 'micropip'" the user hit.
const pyodide = await loadPyodide()
await pyodide.loadPackage(["micropip", "numpy", "pandas"])

// The exact code from the lesson's Python cell (002-symmetric-encryption.js)
const code = `import micropip
await micropip.install("pycryptodome")

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

key = get_random_bytes(32)

cipher = AES.new(key, AES.MODE_GCM)
nonce = cipher.nonce
plaintext = b"Meet at the docks at midnight"
ciphertext, tag = cipher.encrypt_and_digest(plaintext)

print("Ciphertext:", ciphertext.hex())
print("Auth tag:  ", tag.hex())

decrypt_cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
recovered = decrypt_cipher.decrypt_and_verify(ciphertext, tag)
print()
print("Decrypted:", recovered.decode())
assert recovered == plaintext
print("Matches original plaintext exactly.")

tampered = bytearray(ciphertext)
tampered[0] ^= 0xFF
print()
print("Attempting to decrypt tampered ciphertext...")
try:
    bad_cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    bad_cipher.decrypt_and_verify(bytes(tampered), tag)
    print("This line should never print.")
except ValueError as e:
    print(f"Rejected, as expected: {e}")
`

await pyodide.runPythonAsync(code)
console.log("--- Cell ran with no errors, matching the lesson's expected output above ---")
