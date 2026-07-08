with open('src/styles/courseColors.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "pattern: 'url(" in line:
        line = line.replace("pattern: 'url(", "pattern: `url(")
        line = line.replace(')")\',', ')")`,')
        line = line.replace(')")\',   glow', ')")`,   glow')
        line = line.replace(')")\',     glow', ')")`,     glow')
        line = line.replace(')")\',    glow', ')")`,    glow')
        line = line.replace(')")\',        glow', ')")`,        glow')
        line = line.replace(')")\'', ')")`')
    new_lines.append(line)

with open('src/styles/courseColors.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Fixed syntax in courseColors.js')
