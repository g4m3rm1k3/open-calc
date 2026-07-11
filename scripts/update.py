import re

with open('src/styles/courseColors.js', 'r') as f:
    content = f.read()

patterns = {
    'grid': 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0H0v20h20V0zm-1 19H1V1h18v18z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    'dots': 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'2\' fill=\'%23ffffff\' fill-opacity=\'1\'/%3E%3C/svg%3E")',
    'waves': 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 5c5 0 5 5 10 5s5-5 10-5-5-5-10-5S5 5 0 5z\' stroke=\'%23ffffff\' stroke-width=\'1\' fill=\'none\'/%3E%3C/svg%3E")',
    'lines': 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M-1 1l2-2M9 11l2-2M4 11L11 4\' stroke=\'%23ffffff\' stroke-width=\'1\' fill=\'none\'/%3E%3C/svg%3E")'
}

map_data = {
    'indigo':  {'h': 'from-indigo-500 via-purple-500 to-indigo-600', 'p': patterns['grid']},
    'blue':    {'h': 'from-blue-500 via-indigo-500 to-blue-600', 'p': patterns['dots']},
    'emerald': {'h': 'from-emerald-400 via-teal-500 to-emerald-600', 'p': patterns['lines']},
    'red':     {'h': 'from-red-500 via-rose-500 to-red-600', 'p': patterns['waves']},
    'purple':  {'h': 'from-purple-500 via-fuchsia-500 to-purple-600', 'p': patterns['grid']},
    'orange':  {'h': 'from-orange-400 via-amber-500 to-orange-500', 'p': patterns['lines']},
    'teal':    {'h': 'from-teal-400 via-cyan-500 to-teal-600', 'p': patterns['dots']},
    'amber':   {'h': 'from-amber-400 via-orange-500 to-amber-500', 'p': patterns['waves']},
    'sky':     {'h': 'from-sky-400 via-blue-500 to-sky-500', 'p': patterns['grid']},
    'cyan':    {'h': 'from-cyan-400 via-sky-500 to-cyan-500', 'p': patterns['dots']},
    'rose':    {'h': 'from-rose-500 via-pink-500 to-rose-600', 'p': patterns['waves']},
    'violet':  {'h': 'from-violet-500 via-purple-500 to-violet-600', 'p': patterns['lines']},
    'lime':    {'h': 'from-lime-400 via-green-500 to-lime-500', 'p': patterns['dots']},
    'slate':   {'h': 'from-slate-600 via-slate-500 to-slate-700', 'p': patterns['grid']},
    'fuchsia': {'h': 'from-fuchsia-500 via-pink-500 to-fuchsia-600', 'p': patterns['waves']},
    'green':   {'h': 'from-green-500 via-emerald-500 to-green-600', 'p': patterns['lines']},
    'pink':    {'h': 'from-pink-500 via-rose-500 to-pink-600', 'p': patterns['dots']},
    'yellow':  {'h': 'from-yellow-400 via-amber-500 to-yellow-500', 'p': patterns['grid']},
}

for k, v in map_data.items():
    content = re.sub(
        r'(' + k + r':\s*\{[^}]*header:\')([^\']+)((?:\',|\' \}).*)',
        lambda m: m.group(1) + v['h'] + "', pattern: '" + v['p'] + m.group(3),
        content
    )

with open('src/styles/courseColors.js', 'w') as f:
    f.write(content)
print('Updated courseColors.js')
