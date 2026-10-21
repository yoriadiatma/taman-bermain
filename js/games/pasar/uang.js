// uang.js — hitungan uang dan gambar uang (tanpa DOM kecuali string SVG).

import { PECAHAN } from '../../../data/pasar.js';

export const rupiah = n => `Rp${Math.round(n).toLocaleString('id-ID')}`;

/** Kunci unik untuk tiap pecahan (koin dan kertas Rp1.000 dibedakan). */
export const kunciPecahan = p => `${p.jenis}-${p.nilai}`;
export const cariPecahan = kunci => PECAHAN.find(p => kunciPecahan(p) === kunci);

/**
 * Susunan uang paling sedikit lembar/kepingnya untuk `jumlah`, dengan pecahan yang ada.
 * Untuk pecahan rupiah (pola 1-2-5), cara serakah (ambil yang terbesar dulu) selalu paling sedikit.
 * Mengembalikan array nilai, atau null jika tidak bisa disusun pas.
 */
export function susunanTersedikit(jumlah, nilaiTersedia = [...new Set(PECAHAN.map(p => p.nilai))]) {
  const urut = [...new Set(nilaiTersedia)].sort((a, b) => b - a);
  const hasil = [];
  let sisa = jumlah;
  for (const n of urut) {
    while (sisa >= n) { hasil.push(n); sisa -= n; }
  }
  return sisa === 0 ? hasil : null;
}

export const jumlahUang = daftar => daftar.reduce((a, b) => a + b, 0);

// Warna tiap pecahan: berbeda-beda agar mudah dikenali, bukan tiruan warna uang asli.
const WARNA = {
  'koin-100': ['#ced4da', '#868e96'],
  'koin-200': ['#dee2e6', '#868e96'],
  'koin-500': ['#e9ecef', '#adb5bd'],
  'koin-1000': ['#ffe066', '#c49000'],
  'kertas-1000': ['#d8f5a2', '#66a80f'],
  'kertas-2000': ['#d0bfff', '#7048e8'],
  'kertas-5000': ['#ffd8a8', '#d9480f'],
  'kertas-10000': ['#eebefa', '#ae3ec9'],
  'kertas-20000': ['#b2f2bb', '#2b8a3e'],
  'kertas-50000': ['#a5d8ff', '#1971c2'],
  'kertas-100000': ['#ffc9c9', '#c92a2a'],
};

const angkaPendek = n => n.toLocaleString('id-ID');

/** String SVG untuk satu pecahan uang. */
export function svgUang(p) {
  const [isi, tepi] = WARNA[kunciPecahan(p)] ?? ['#fff', '#000'];
  if (p.jenis === 'koin') {
    const r = { 100: 34, 200: 37, 500: 40, 1000: 43 }[p.nilai] ?? 40;
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="${r}" fill="${isi}" stroke="${tepi}" stroke-width="5"/>
      <circle cx="50" cy="50" r="${r - 8}" fill="none" stroke="${tepi}" stroke-width="1.5" stroke-dasharray="3 3"/>
      <text x="50" y="${p.nilai >= 1000 ? 56 : 58}" text-anchor="middle" font-size="${p.nilai >= 1000 ? 20 : 24}" font-weight="900" fill="#343a40" font-family="system-ui, sans-serif">${angkaPendek(p.nilai)}</text>
      <text x="50" y="${p.nilai >= 1000 ? 74 : 76}" text-anchor="middle" font-size="11" font-weight="700" fill="#343a40" font-family="system-ui, sans-serif">Rp</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 200 100" aria-hidden="true">
    <rect x="3" y="3" width="194" height="94" rx="10" fill="${isi}" stroke="${tepi}" stroke-width="5"/>
    <rect x="14" y="14" width="172" height="72" rx="6" fill="none" stroke="${tepi}" stroke-width="2" stroke-dasharray="6 4"/>
    <circle cx="48" cy="50" r="22" fill="${tepi}" opacity="0.25"/>
    <text x="118" y="58" text-anchor="middle" font-size="${p.nilai >= 100000 ? 30 : 34}" font-weight="900" fill="#212529" font-family="system-ui, sans-serif">${angkaPendek(p.nilai)}</text>
    <text x="118" y="78" text-anchor="middle" font-size="13" font-weight="700" fill="#212529" font-family="system-ui, sans-serif">RUPIAH</text>
  </svg>`;
}

/** Pecahan kertas (atau koin bila tidak ada kertas) untuk sebuah nilai, dipakai saat menampilkan uang. */
export function pecahanUntuk(nilai) {
  return PECAHAN.find(p => p.nilai === nilai && p.jenis === 'kertas') ?? PECAHAN.find(p => p.nilai === nilai);
}
