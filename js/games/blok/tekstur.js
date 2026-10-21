// tekstur.js — tekstur blok 16x16 dan sprite pemain, semuanya digambar dengan kode.
// Hasilnya satu kanvas "atlas" yang dipotong saat menggambar dunia.

import { B } from './blok.js';

export const UKURAN = 16;
export const LATAR_GUA = 15; // posisi atlas untuk dinding gua di belakang udara bawah tanah

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pilih warna dari daftar [warna, peluang]; warna pertama adalah warna dasar. */
function bintik(r, dasar, ...lain) {
  let x = r();
  for (const [w, p] of lain) {
    if (x < p) return w;
    x -= p;
  }
  return dasar;
}

const LUKIS = {
  [B.TANAH]: (x, y, r) => bintik(r, '#8b5a2b', ['#6f4520', 0.16], ['#a0703c', 0.1]),
  [B.RUMPUT]: (x, y, r) => {
    if (y < 3 || (y === 3 && r() < 0.55) || (y === 4 && r() < 0.2)) return bintik(r, '#4caf50', ['#3a8f3e', 0.25], ['#6cc96f', 0.15]);
    return bintik(r, '#8b5a2b', ['#6f4520', 0.16], ['#a0703c', 0.1]);
  },
  [B.BATU]: (x, y, r) => bintik(r, '#8a8f98', ['#6e737c', 0.2], ['#a3a8b1', 0.1]),
  [B.KAYU]: (x, y, r) => (x % 5 === 0 || r() < 0.08 ? '#5b3a1c' : bintik(r, '#7a4f28', ['#8c5d31', 0.2])),
  [B.DAUN]: (x, y, r) => bintik(r, '#2f8f3a', ['#21702c', 0.3], ['#47ab52', 0.15]),
  [B.AIR]: (x, y, r) => (y === 0 ? 'rgba(170, 210, 255, 0.85)' : bintik(r, 'rgba(52, 120, 214, 0.72)', ['rgba(70, 140, 230, 0.72)', 0.2])),
  [B.PASIR]: (x, y, r) => bintik(r, '#e6d08f', ['#d2b96c', 0.2], ['#f3e3ad', 0.12]),
  [B.BATUAN_DASAR]: (x, y, r) => bintik(r, '#3a3d42', ['#222428', 0.35], ['#575b61', 0.1]),
  [LATAR_GUA]: (x, y, r) => bintik(r, '#4a4e55', ['#3d4046', 0.25], ['#565a61', 0.1]),
};

// Bijih: batu dengan gumpalan berwarna.
const BIJIH = { [B.BATU_BARA]: ['#1f2125', '#3a3d42'], [B.BIJIH_BESI]: ['#d39a66', '#a8703f'], [B.BIJIH_EMAS]: ['#f7cf2a', '#c99a0a'] };

function lukisBijih(ctx, ox, id, r) {
  for (let y = 0; y < UKURAN; y++) {
    for (let x = 0; x < UKURAN; x++) {
      ctx.fillStyle = LUKIS[B.BATU](x, y, r);
      ctx.fillRect(ox + x, y, 1, 1);
    }
  }
  const [terang, gelap] = BIJIH[id];
  for (let k = 0; k < 5; k++) {
    const cx = 2 + Math.floor(r() * 11);
    const cy = 2 + Math.floor(r() * 11);
    ctx.fillStyle = gelap;
    ctx.fillRect(ox + cx, cy + 1, 3, 2);
    ctx.fillStyle = terang;
    ctx.fillRect(ox + cx, cy, 2, 2);
  }
}

/** Kanvas atlas: blok ber-id n berada di x = n * 16. */
export function buatAtlas() {
  const jumlah = 16;
  const c = document.createElement('canvas');
  c.width = UKURAN * jumlah;
  c.height = UKURAN;
  const ctx = c.getContext('2d');
  for (let id = 1; id < jumlah; id++) {
    const r = rng(id * 7919 + 13);
    const ox = id * UKURAN;
    if (BIJIH[id]) { lukisBijih(ctx, ox, id, r); continue; }
    const lukis = LUKIS[id];
    if (!lukis) continue;
    for (let y = 0; y < UKURAN; y++) {
      for (let x = 0; x < UKURAN; x++) {
        const w = lukis(x, y, r);
        if (!w) continue;
        ctx.fillStyle = w;
        ctx.fillRect(ox + x, y, 1, 1);
      }
    }
  }
  return c;
}

// ---------- Sprite pemain (menghadap ke kanan, 10 x 28 piksel) ----------

const KEPALA = {
  peci: [
    '...kkkk...',
    '..kkkkkk..',
    '..kkkkkk..',
    '..hsssss..',
    '..ssssss..',
    '..sssses..',
    '..ssssss..',
    '..sssssm..',
    '...ssss...',
  ],
  jilbab: [
    '...jjjj...',
    '..jjjjjj..',
    '.jjjjjjjj.',
    '.jjssssss.',
    '.jjssssss.',
    '.jjsssses.',
    '.jjssssss.',
    '.jjssssms.',
    '.jjjssssj.',
  ],
};

const BADAN = {
  peci: [
    '..bbbbbb..',
    '.bbbbwbbb.',
    '.bbbbwbbb.',
    '.bbbbwbbb.',
    '.sbbbbbbs.',
    '.sbbbbbbs.',
    '..bbbbbb..',
    '..pppppp..',
    '..pppppp..',
  ],
  jilbab: [
    'jjjjjjjjjj',
    '.jjjjjjjj.',
    '.gggggggg.',
    '.sggggggs.',
    '.sggggggs.',
    '..gggggg..',
    '..gggggg..',
    '..gggggg..',
    '.gggggggg.',
  ],
};

// Kaki: 10 baris, dua bingkai jalan.
const KAKI = {
  peci: [
    ['..pp..pp..', '..pp..pp..', '..pp..pp..', '..pp..pp..', '..pp..pp..', '..pp..pp..', '..pp..pp..', '..pp..pp..', '.fff..fff.', '.fff..fff.'],
    ['..pp..pp..', '..pp...pp.', '.pp....pp.', '.pp....pp.', '.pp.....pp', 'pp......pp', 'pp......pp', 'pp......pp', 'fff....fff', 'fff....fff'],
  ],
  jilbab: [
    ['.gggggggg.', '.gggggggg.', '.gggggggg.', 'gggggggggg', 'gggggggggg', 'gggggggggg', 'gggggggggg', '..ss..ss..', '.fff..fff.', '.fff..fff.'],
    ['.gggggggg.', '.gggggggg.', 'gggggggggg', 'gggggggggg', 'gggggggggg', 'gggggggggg', 'gggggggggg', '.ss....ss.', 'fff....fff', 'fff....fff'],
  ],
};

const PALET = {
  peci: { k: '#22262e', h: '#3b2a1a', s: '#f1c27d', e: '#22262e', m: '#b5493a', b: '#2e7d32', w: '#ffffff', p: '#2b3a67', f: '#4a3020' },
  jilbab: { j: '#d6336c', s: '#f1c27d', e: '#22262e', m: '#b5493a', g: '#7048e8', f: '#4a3020' },
};

export const SPRITE_LEBAR = 10;
export const SPRITE_TINGGI = 28;

/**
 * Kanvas sprite untuk satu karakter: 4 bingkai berjajar
 * (diam-kanan, jalan-kanan, diam-kiri, jalan-kiri).
 */
export function buatSprite(karakter = 'peci') {
  const c = document.createElement('canvas');
  c.width = SPRITE_LEBAR * 4;
  c.height = SPRITE_TINGGI;
  const ctx = c.getContext('2d');
  const palet = PALET[karakter];
  for (let f = 0; f < 4; f++) {
    const grid = [...KEPALA[karakter], ...BADAN[karakter], ...KAKI[karakter][f % 2]];
    const cermin = f >= 2;
    grid.forEach((baris, y) => {
      for (let x = 0; x < SPRITE_LEBAR; x++) {
        const w = palet[baris[cermin ? SPRITE_LEBAR - 1 - x : x]];
        if (!w) continue;
        ctx.fillStyle = w;
        ctx.fillRect(f * SPRITE_LEBAR + x, y, 1, 1);
      }
    });
  }
  return c;
}

export const BENTUK_SPRITE = { KEPALA, BADAN, KAKI };
