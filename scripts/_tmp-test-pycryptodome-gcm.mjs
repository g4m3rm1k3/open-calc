import { loadPyodide } from "pyodide"

const pyodide = await loadPyodide()
await pyodide.loadPackage("micropip")
const micropip = pyodide.pyimport("micropip")
await micropip.install("pycryptodome")
const result = await pyodide.runPythonAsync(`
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

key = get_random_bytes(32)
cipher = AES.new(key, AES.MODE_GCM)
nonce = cipher.nonce
data = b"Meet at the docks at midnight"
ciphertext, tag = cipher.encrypt_and_digest(data)

# Decrypt correctly
cipher2 = AES.new(key, AES.MODE_GCM, nonce=nonce)
plaintext = cipher2.decrypt_and_verify(ciphertext, tag)

# Now tamper with one byte and confirm it's rejected
tampered = bytearray(ciphertext)
tampered[0] ^= 0xFF
tamper_failed = False
try:
    cipher3 = AES.new(key, AES.MODE_GCM, nonce=nonce)
    cipher3.decrypt_and_verify(bytes(tampered), tag)
except ValueError as e:
    tamper_failed = True
    tamper_error = str(e)

print("plaintext:", plaintext.decode())
print("tamper_failed:", tamper_failed)
print("tamper_error:", tamper_error if tamper_failed else None)
`)
console.log("DONE")
