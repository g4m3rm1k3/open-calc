import { loadPyodide } from "pyodide"

const pyodide = await loadPyodide()
await pyodide.loadPackage(["micropip"])
const micropip = pyodide.pyimport("micropip")
await micropip.install("pycryptodome")

await pyodide.runPythonAsync(`
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

key = get_random_bytes(32)
block = b"REPEATEDBLOCK!!!"
plaintext = block + block + block

ecb_cipher = AES.new(key, AES.MODE_ECB)
ecb_ct = ecb_cipher.encrypt(plaintext)
ecb_blocks = [ecb_ct[i:i+16].hex() for i in range(0, len(ecb_ct), 16)]
print("ECB blocks:")
for b in ecb_blocks: print(" ", b)
print("All identical:", len(set(ecb_blocks)) == 1)

iv = get_random_bytes(16)
cbc_cipher = AES.new(key, AES.MODE_CBC, iv=iv)
cbc_ct = cbc_cipher.encrypt(plaintext)
cbc_blocks = [cbc_ct[i:i+16].hex() for i in range(0, len(cbc_ct), 16)]
print()
print("CBC blocks:")
for b in cbc_blocks: print(" ", b)
print("All identical:", len(set(cbc_blocks)) == 1)
`)
console.log("--- OK ---")
