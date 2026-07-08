with open('src/pages/AboutPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Open Source. Non-Commercial section
old_os = 'className="relative rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 \\nvia-slate-950/80 to-violet-950/50 backdrop-blur-sm p-10 sm:p-14 overflow-hidden"'
new_os = 'className="group relative rounded-[32px] border border-indigo-500/30 dark:border-indigo-500/20 bg-indigo-50/80 dark:bg-indigo-950/20 backdrop-blur-xl p-10 sm:p-14 overflow-hidden transition-all duration-500 shadow-[0_8px_40px_rgba(99,102,241,0.1)] hover:shadow-[0_20px_60px_rgba(99,102,241,0.2)] dark:shadow-[0_8px_40px_rgba(99,102,241,0.05)] hover:-translate-y-1"'
# Need to make sure we replace regardless of newlines
import re
content = re.sub(r'className="relative rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50\s*via-slate-950/80 to-violet-950/50 backdrop-blur-sm p-10 sm:p-14 overflow-hidden"', new_os, content)

with open('src/pages/AboutPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("AboutPage fixed.")
