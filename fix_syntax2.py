import re

with open('src/styles/courseColors.js', 'r', encoding='utf-8') as f:
    content = f.read()

# The issue is that the pattern was replaced with a backtick at the start, but the single quote at the end remained.
# Current state: pattern: `url("data...svg%3E")'`,
# I will use a regex to fix this: replace `url("data...%3E")'`, with `url("data...%3E")`,

content = re.sub(r'pattern: `url\("(.*?)"\)\'(, *)', r'pattern: `url("\1")`\2', content)

# just in case my previous replace failed to hit some, let's also fix if there's any starting single quote left
content = re.sub(r'pattern: \'url\("(.*?)"\)\'(, *)', r'pattern: `url("\1")`\2', content)

with open('src/styles/courseColors.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Syntax fixed.")
