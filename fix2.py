import re

filepath = r'd:\DOCUMENT\KULIAH UDAYANA\SEMESTER 6\GIS\Tugas1PetaInteraktif\peta-sig\src\MapComponent.js'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixed = []
for i, line in enumerate(lines):
    ln = line

    # Fix alert messages with leading space/garbage
    ln = re.sub(r'alert\(\s*" Gagal menyimpan data:', 'alert("Gagal menyimpan data:', ln)
    ln = re.sub(r'alert\(\s*" Nama lokasi', 'alert("Nama lokasi', ln)
    ln = re.sub(r'alert\(\s*" Kategori belum', 'alert("Kategori belum', ln)

    # Fix statusColor labels
    ln = ln.replace('label: " Pending"', 'label: "Pending"')
    ln = ln.replace('label: " Ditolak"', 'label: "Ditolak"')
    ln = ln.replace('label: " Diterima"', 'label: "Diterima"')

    # Fix Kembali button text with leading garbage
    ln = re.sub(r'<- Kembali', 'Kembali', ln)
    ln = re.sub(r'> Kembali', '> Kembali', ln)

    # Fix attribution strings
    ln = ln.replace('attribution="(c) OSM"', 'attribution="\u00a9 OSM"')
    ln = ln.replace('attribution="(c) Esri"', 'attribution="\u00a9 Esri"')

    # Fix sidebar comment
    ln = ln.replace('{/* SIDEBAR INFO MARKER Google Maps style (kiri) */', '{/* SIDEBAR INFO MARKER -- Google Maps style (kiri) */')

    fixed.append(ln)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(fixed)

print('Done fix2')
