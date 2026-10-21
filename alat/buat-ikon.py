# buat-ikon.py — membuat ikon PNG aplikasi dari pixel art bintang (sama dengan ikon.svg).
# Dibutuhkan hanya jika ikon diubah. Jalankan dari folder proyek: python alat/buat-ikon.py
# Butuh Pillow (pip install pillow). Hasil: ikon-192.png, ikon-512.png, ikon-maskable-512.png, ikon-apple-180.png

from PIL import Image

BINTANG = [
    '.....yy.....',
    '.....yy.....',
    '....yyyy....',
    'yyyyyyyyyyyy',
    '.yyyyyyyyyy.',
    '..yyyyyyyy..',
    '...yyyyyy...',
    '..yyyyyyyy..',
    '..yyy..yyy..',
    '.yyy....yyy.',
    '.yy......yy.',
    '............',
]
LATAR = (0x1c, 0x6f, 0xd1, 255)
KUNING = (0xff, 0xd4, 0x3b, 255)


def buat(ukuran, isi):
    """isi = bagian lebar gambar yang dipakai bintang (sisanya latar biru)."""
    img = Image.new('RGBA', (ukuran, ukuran), LATAR)
    sel = int(ukuran * isi / 12)
    ox = (ukuran - sel * 12) // 2
    oy = (ukuran - sel * 12) // 2 + sel // 2
    for y, baris in enumerate(BINTANG):
        for x, c in enumerate(baris):
            if c == 'y':
                img.paste(KUNING, (ox + x * sel, oy + y * sel, ox + (x + 1) * sel, oy + (y + 1) * sel))
    return img


buat(192, 0.75).save('ikon-192.png')
buat(512, 0.75).save('ikon-512.png')
buat(512, 0.58).save('ikon-maskable-512.png')  # zona aman ikon maskable: lingkaran 80% di tengah
buat(180, 0.75).convert('RGB').save('ikon-apple-180.png')
print('Ikon dibuat.')
