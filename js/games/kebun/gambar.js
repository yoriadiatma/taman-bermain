// gambar.js — gambar petak, tanaman di setiap tahap, dan hewan (SVG piksel buatan kode).

import { pixelSvg } from '../../core/ui.js';
import { TANAMAN } from '../../../data/kebun.js';
import { tahapKe } from './logika.js';

const kotak = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const TANAH = 20; // baris permukaan tanah dalam viewBox 32 x 32

function tanah(basah, pupuk) {
  const warna = basah ? '#6b4226' : '#a0703c';
  const garis = basah ? '#523119' : '#8b5a2b';
  let s = kotak(0, TANAH, 32, 12, warna);
  for (let y = TANAH + 3; y < 32; y += 4) s += kotak(2, y, 28, 1, garis);
  if (pupuk) for (const [x, y] of [[4, 22], [24, 25], [9, 29], [20, 21], [27, 29]]) s += kotak(x, y, 2, 1, '#2b1a0e');
  return s;
}

function batang(x, atas, warna, lebar = 3) {
  return kotak(x, atas, lebar, TANAH - atas, warna);
}

function daun(cx, y, warna, lebar = 4) {
  return kotak(cx - lebar - 1, y, lebar, 3, warna) + kotak(cx + 2, y, lebar, 3, warna);
}

/** Gambar tanaman (tanpa tanah) sesuai jenis dan tahap. */
function tanaman(id, tahap, layu) {
  const g = TANAMAN[id].gambar;
  const hijau = layu ? '#a9a14b' : g.daun;
  const gelap = layu ? '#8a7f36' : '#1b5e20';
  let s = '';
  if (tahap === 0) return kotak(13, TANAH - 1, 6, 2, '#8b5a2b') + kotak(15, TANAH - 2, 2, 2, '#d9a066');
  if (tahap === 1) return batang(15, TANAH - 7, hijau) + kotak(10, TANAH - 9, 5, 3, hijau) + kotak(18, TANAH - 9, 5, 3, hijau);

  if (g.bentuk === 'bulir') {
    // Padi: rumpun daun panjang; saat berbunga/berbuah muncul malai.
    const tinggi = tahap === 2 ? 9 : 15;
    for (const [x, miring] of [[10, -2], [13, -1], [16, 0], [19, 1], [22, 2]]) {
      for (let i = 0; i < tinggi; i++) s += kotak(x + Math.round((miring * i) / tinggi), TANAH - 1 - i, 2, 1, i % 4 === 0 ? gelap : hijau);
    }
    if (tahap >= 3) {
      const malai = tahap === 4 ? g.buah : '#f8f9fa';
      for (const x of [9, 13, 18, 23]) for (let i = 0; i < 4; i++) s += kotak(x + (i > 1 ? 1 : 0), TANAH - tinggi - 1 + i * 2, 2, 1, malai);
    }
    return s;
  }

  if (g.bentuk === 'tongkol') {
    // Jagung: batang tinggi, daun panjang, bunga jantan di puncak, tongkol di samping.
    const atas = tahap === 2 ? TANAH - 11 : TANAH - 17;
    s += batang(15, atas, hijau);
    for (let y = TANAH - 4; y > atas + 2; y -= 4) s += kotak(8, y, 7, 2, hijau) + kotak(18, y - 2, 7, 2, hijau);
    if (tahap >= 3) s += kotak(14, atas - 2, 1, 2, '#e9c46a') + kotak(16, atas - 3, 1, 3, '#e9c46a') + kotak(18, atas - 2, 1, 2, '#e9c46a');
    if (tahap === 4) s += kotak(18, TANAH - 12, 4, 7, g.buah) + kotak(18, TANAH - 13, 4, 1, '#74b816') + kotak(17, TANAH - 11, 1, 6, '#74b816');
    return s;
  }

  // Tanaman lain: batang tengah dengan pasangan daun.
  const tinggi = tahap === 2 ? 10 : 14;
  const atas = TANAH - tinggi;
  s += batang(15, atas, gelap);
  for (let y = TANAH - 5, i = 0; y > atas; y -= 4, i++) s += daun(16, y, hijau, i % 2 ? 5 : 6);
  if (g.bentuk === 'daun' || g.bentuk === 'umbi') {
    if (tahap >= 3) s += kotak(8, atas - 2, 16, 4, hijau) + kotak(11, atas - 5, 10, 3, hijau) + kotak(13, atas - 1, 2, 2, gelap) + kotak(18, atas, 2, 2, gelap);
    if (g.bentuk === 'umbi' && tahap === 4) s += kotak(13, TANAH - 2, 6, 3, g.buah) + kotak(14, TANAH + 1, 4, 2, g.buah);
    return s;
  }
  if (tahap >= 3) s += kotak(15, atas - 3, 3, 3, '#ffe066') + kotak(9, atas + 2, 3, 3, '#fff') + kotak(21, atas + 2, 3, 3, '#fff');
  if (tahap === 4) {
    const buah = layu ? '#a9714b' : g.buah;
    const posisi = [[9, TANAH - 9], [20, TANAH - 11], [11, TANAH - 14], [20, TANAH - 5]];
    for (const [x, y] of posisi) s += g.bentuk === 'panjang' ? kotak(x, y, 2, 6, buah) : kotak(x, y, 4, 4, buah);
  }
  return s;
}

/** SVG lengkap satu petak. Saat hujan, tanah kosong pun tampak basah. */
export function svgPetak(t, hujan = false) {
  let isi = tanah(!!t?.disiram || hujan, !!t?.pupuk);
  if (t) isi += tanaman(t.id, tahapKe(t), t.layu);
  return `<svg viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">${kotak(0, 0, 32, TANAH, 'transparent')}${isi}</svg>`;
}

/** SVG tanaman pada tahap tertentu (untuk kartu info). */
export function svgTahap(id, tahap) {
  return `<svg viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">${tanah(true, false)}${tanaman(id, tahap, false)}</svg>`;
}

// ---------- Hewan (12 x 12) ----------

export const GAMBAR_HEWAN = {
  ayam: [[
    '....rr......',
    '...rww......',
    '..wwwwy.....',
    '..wkww......',
    '...wwww..ww.',
    '..wwwwwwwww.',
    '.wwwwwwwwww.',
    '.wwwwwwwww..',
    '..wwwwwww...',
    '...ww.ww....',
    '...o..o.....',
    '..oo.oo.....',
  ], { r: '#e03131', w: '#fdfdfd', y: '#f59f00', k: '#212529', o: '#f08c00' }],
  kambing: [[
    '.h..........',
    'hh..........',
    '.ggg........',
    'gkgg........',
    '.gggggggggg.',
    '..gggggggggg',
    '..gggggggggg',
    '..gggggggggg',
    '..g.g...g.g.',
    '..g.g...g.g.',
    '..k.k...k.k.',
    '............',
  ], { h: '#6b4226', g: '#c9a66b', k: '#3b2a1a' }],
  sapi: [[
    '.h..h.......',
    '.wwww.......',
    'wkwwkw......',
    '.wppw.......',
    '..wwwbbwwbw.',
    '..wbbwwwwbbw',
    '..wwwwbbwwww',
    '..wbbwwwwbbw',
    '..w.w....w.w',
    '..w.w....w.w',
    '..k.k....k.k',
    '............',
  ], { h: '#c9a66b', w: '#f8f9fa', b: '#343a40', k: '#212529', p: '#ffa8a8' }],
};

export const svgHewan = id => pixelSvg(GAMBAR_HEWAN[id][0], GAMBAR_HEWAN[id][1], { latar: '#d8f5a2', pad: 1 });
