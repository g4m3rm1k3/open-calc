import os
import re

CNC_DIR = r"c:\Users\g4m3r\Documents\testing tutorials\open-calc\src\labs\cnc-sim\cnc"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Add import if not present
    if "useCncTheme" not in content and filepath.endswith(".jsx"):
        # Find the last import
        imports = list(re.finditer(r'^import .*?;?\n', content, re.MULTILINE))
        if imports:
            last_import = imports[-1]
            
            # calculate relative path to theme/useCncTheme.js
            # if we are in cnc_dir, it's ./theme/useCncTheme.js
            rel_path = "./theme/useCncTheme.js"
            if filepath != os.path.join(CNC_DIR, "CNCSim.jsx"): # wait, all files are in cnc dir except if they are in subdirs, but we know they are in cnc dir
                pass # they are all in cnc dir

            insert_pos = last_import.end()
            content = content[:insert_pos] + f'import {{ useCncTheme }} from "{rel_path}";\n' + content[insert_pos:]

    # Remove PALETTE_DARK and PALETTE_LIGHT
    content = re.sub(r'const PALETTE_DARK = \{[\s\S]*?\};\n?', '', content)
    content = re.sub(r'const PALETTE_LIGHT = \{[\s\S]*?\};\n?', '', content)

    # CNCSim.jsx special handling
    if os.path.basename(filepath) == "CNCSim.jsx":
        # Replace global const C = { ... } with let C = {};
        content = re.sub(
            r'const C = \{\s*\.\.\.\(typeof document !== "undefined"[\s\S]*?\),\s*\};',
            'let C = {};',
            content
        )
        
        # Replace the useEffect that assigns C
        content = re.sub(
            r'useEffect\(\(\) => \{\s*Object\.assign\(C, dark \? PALETTE_DARK : PALETTE_LIGHT\);\s*\}, \[dark\]\);',
            'const themeC = useCncTheme();\n    Object.assign(C, themeC);',
            content
        )

    else:
        # For other files, replace the const C = useMemo(...) block
        content = re.sub(
            r'const C = useMemo\(\(\) =>.*?isDark \? \{[\s\S]*?\} : \{[\s\S]*?\}, \[isDark\]\);',
            'const C = useCncTheme();',
            content
        )
        # some files define const C = { ... } inside the component, sometimes using isDark inline
        content = re.sub(
            r'const C = \{[\s\S]*?bg: isDark \?[\s\S]*?\};',
            'const C = useCncTheme();',
            content
        )
        # CNCBackplot uses `const colors = { bg: isDark ? ... }`
        # We can just leave CNCBackplot or map it? CNCBackplot needs hex numbers (e.g. 0x0f172a), not strings!
        # Wait, if CNCBackplot uses hex numbers for THREE.js, we should handle that.

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {os.path.basename(filepath)}")
    else:
        print(f"No changes for {os.path.basename(filepath)}")

for filename in os.listdir(CNC_DIR):
    if filename.endswith(".jsx") or filename.endswith(".js"):
        process_file(os.path.join(CNC_DIR, filename))
