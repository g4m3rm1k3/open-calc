import os, glob

folder = r'c:\Users\g4m3r\Documents\testing tutorials\open-calc\src\posts\Getting started with C++'
files = sorted(glob.glob(os.path.join(folder, '*.md')))

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    in_cpp = False
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith('```cpp'):
            in_cpp = True
        elif stripped == '```' and in_cpp:
            in_cpp = False
        elif in_cpp and r'\n' in line and '"' in line:
            print(os.path.basename(fpath) + ':' + str(i) + ': ' + line.rstrip())
