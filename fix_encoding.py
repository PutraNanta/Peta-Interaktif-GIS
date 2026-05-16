import re

filepath = r'd:\DOCUMENT\KULIAH UDAYANA\SEMESTER 6\GIS\Tugas1PetaInteraktif\peta-sig\src\MapComponent.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all non-ASCII characters that are garbled (mojibake)
# Strategy: replace any sequence of non-ASCII chars with empty string
# but preserve valid JSX/JS structure

# Fix specific known patterns first
content = content.replace('\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u0094', ' -- ')
content = content.replace('\u00c3\u00a2\u00e2\u0080\u0094', ' -- ')
content = content.replace('\u00e2\u0080\u0094', ' -- ')
content = content.replace('\u00c3\u0082\u00c2\u00a9', '(c)')
content = content.replace('\u00c3\u00a2\u00e2\u0080 \u00e2\u0080\u0099', ' -> ')

# Remove remaining non-ASCII sequences (garbled emoji/symbols in comments and JSX text)
# Only remove from comment lines and string literals, not from actual code
lines = content.split('\n')
fixed_lines = []
for line in lines:
    # Check if line has non-ASCII
    if any(ord(c) > 127 for c in line):
        # Replace non-ASCII chars with empty string
        fixed = ''.join(c if ord(c) < 128 else '' for c in line)
        # Clean up multiple spaces
        fixed = re.sub(r'  +', ' ', fixed)
        fixed_lines.append(fixed)
    else:
        fixed_lines.append(line)

content = '\n'.join(fixed_lines)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done - all non-ASCII chars removed')
