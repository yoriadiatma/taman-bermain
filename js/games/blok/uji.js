// uji.js — uji dunia, tekstur, dan fisika Blok Petualang. Dijalankan dari test.html.

import { uji as ujiDasar, sama, benar } from '../../../uji/alat.js';
import { Dunia, LEBAR, TINGGI, LAUT } from './dunia.js';
import { B } from './blok.js';
import { Pemain, LOMPAT, GRAVITASI } from './pemain.js';
import { BENTUK_SPRITE, SPRITE_LEBAR, SPRITE_TINGGI } from './tekstur.js';
import { terangSiang } from './render.js';

const uji = (nama, fn) => ujiDasar('Blok Petualang', nama, fn);
const diam = { kiri: false, kanan: false, lompat: false };

/** Dunia kecil buatan untuk uji fisika: lantai di baris 10, dinding di kolom 8. */
function duniaUji() {
  const d = new Dunia(1);
  d.tile.fill(B.UDARA);
  for (let x = 0; x < LEBAR; x++) for (let y = 10; y < TINGGI; y++) d.tile[y * LEBAR + x] = B.BATU;
  for (let y = 0; y < 10; y++) d.tile[y * LEBAR + 8] = B.BATU;
  return d;
}

uji('Seed yang sama menghasilkan dunia yang sama persis', () => {
  const a = new Dunia(12345);
  const b = new Dunia(12345);
  benar(a.tile.every((v, i) => v === b.tile[i]), 'dunia berbeda');
});

uji('Seed berbeda menghasilkan dunia berbeda', () => {
  const a = new Dunia(1);
  const b = new Dunia(2);
  benar(a.tile.some((v, i) => v !== b.tile[i]), 'dunia sama');
});

uji('Dunia dibuat cepat (di bawah 200 ms)', () => {
  const t = performance.now();
  new Dunia(777);
  benar(performance.now() - t < 200, `butuh ${Math.round(performance.now() - t)} ms`);
});

uji('Dasar dunia dan kedua tepinya adalah batuan dasar', () => {
  const d = new Dunia(42);
  for (let x = 0; x < LEBAR; x++) sama(d.get(x, TINGGI - 1), B.BATUAN_DASAR, `kolom ${x}:`);
  for (let y = 0; y < TINGGI; y++) {
    sama(d.get(0, y), B.BATUAN_DASAR);
    sama(d.get(LEBAR - 1, y), B.BATUAN_DASAR);
  }
});

uji('Dunia berisi semua jenis blok alam', () => {
  for (const seed of [1, 99, 2024]) {
    const ada = new Set(new Dunia(seed).tile);
    for (const id of [B.RUMPUT, B.TANAH, B.BATU, B.KAYU, B.DAUN, B.BATU_BARA, B.BIJIH_BESI, B.BIJIH_EMAS]) {
      benar(ada.has(id), `seed ${seed}: blok ${id} tidak ada`);
    }
  }
});

uji('Bijih hanya ada di bawah tanah, emas paling dalam', () => {
  const d = new Dunia(5);
  for (let y = 0; y < TINGGI; y++) {
    for (let x = 0; x < LEBAR; x++) {
      const id = d.get(x, y);
      if (id === B.BATU_BARA || id === B.BIJIH_BESI || id === B.BIJIH_EMAS) benar(y >= d.tanahAlami[x] + 6, `bijih terlalu dangkal di ${x},${y}`);
      if (id === B.BIJIH_EMAS) benar(y > 96, `emas terlalu dangkal di ${x},${y}`);
    }
  }
});

uji('Semua bukit bisa didaki: beda tinggi tanah bersebelahan paling banyak 1 blok', () => {
  for (const seed of [1, 2, 3, 42]) {
    const d = new Dunia(seed);
    for (let x = 1; x < LEBAR; x++) benar(Math.abs(d.tanahAlami[x] - d.tanahAlami[x - 1]) <= 1, `seed ${seed} kolom ${x}`);
  }
});

uji('Pemain bisa berjalan menembus pohon', () => {
  const d = duniaUji();
  for (let y = 4; y < 10; y++) d.tile[y * LEBAR + 6] = B.KAYU;
  d.tile[3 * LEBAR + 6] = B.DAUN;
  const p = new Pemain(4.5, 10);
  for (let i = 0; i < 90; i++) p.perbarui(1 / 60, { ...diam, kanan: true }, d);
  benar(p.x > 7, `pemain tertahan pohon: x=${p.x.toFixed(2)}`);
});

uji('Air hanya ada di bawah permukaan laut', () => {
  const d = new Dunia(987654321);
  for (let y = 0; y < LAUT; y++) for (let x = 0; x < LEBAR; x++) benar(d.get(x, y) !== B.AIR, `air di atas laut ${x},${y}`);
});

uji('Titik muncul berada di daratan, tidak di dalam blok', () => {
  for (const seed of [1, 2, 3, 12345, 987654321]) {
    const d = new Dunia(seed);
    const p = d.titikMuncul();
    benar(d.padat(Math.floor(p.x), p.y), `seed ${seed}: tidak berdiri di blok`);
    benar(!d.padat(Math.floor(p.x), p.y - 1) && !d.padat(Math.floor(p.x), p.y - 2), `seed ${seed}: kepala tertutup blok`);
    benar(!d.cair(Math.floor(p.x), p.y - 1), `seed ${seed}: muncul di air`);
  }
});

uji('Sprite pemain: setiap baris lebarnya 10 piksel, tinggi 28', () => {
  for (const k of ['peci', 'jilbab']) {
    for (const kaki of BENTUK_SPRITE.KAKI[k]) {
      const grid = [...BENTUK_SPRITE.KEPALA[k], ...BENTUK_SPRITE.BADAN[k], ...kaki];
      sama(grid.length, SPRITE_TINGGI, `${k} tinggi:`);
      grid.forEach((b, i) => sama(b.length, SPRITE_LEBAR, `${k} baris ${i}:`));
    }
  }
});

uji('Fisika: pemain jatuh lalu berdiri di lantai', () => {
  const d = duniaUji();
  const p = new Pemain(4.5, 5);
  for (let i = 0; i < 120; i++) p.perbarui(1 / 60, diam, d);
  sama(p.y, 10);
  benar(p.diTanah, 'seharusnya di tanah');
});

uji('Fisika: dinding menghentikan pemain', () => {
  const d = duniaUji();
  const p = new Pemain(4.5, 10);
  for (let i = 0; i < 180; i++) p.perbarui(1 / 60, { ...diam, kanan: true }, d);
  benar(p.x + p.lebar / 2 <= 8, `pemain menembus dinding: x = ${p.x}`);
  benar(p.x > 7, 'pemain seharusnya sampai ke dinding');
});

uji('Fisika: lompatan cukup untuk naik 1 blok, tetapi tidak sampai 2 blok', () => {
  const tinggi = (LOMPAT * LOMPAT) / (2 * GRAVITASI);
  benar(tinggi > 1.2 && tinggi < 2, `tinggi lompatan ${tinggi.toFixed(2)} blok`);
  const d = duniaUji();
  d.tile[9 * LEBAR + 6] = B.BATU; // anak tangga setinggi 1 blok sampai ke dinding
  d.tile[9 * LEBAR + 7] = B.BATU;
  const p = new Pemain(4.5, 10);
  for (let i = 0; i < 120; i++) p.perbarui(1 / 60, { ...diam, kanan: true, lompat: true }, d);
  for (let i = 0; i < 60; i++) p.perbarui(1 / 60, diam, d);
  benar(p.x > 6 && p.y === 9, `pemain tidak naik ke blok: x=${p.x.toFixed(2)} y=${p.y.toFixed(2)}`);
  // Tembok setinggi 2 blok tidak bisa dilompati.
  const d2 = duniaUji();
  d2.tile[9 * LEBAR + 6] = B.BATU;
  d2.tile[8 * LEBAR + 6] = B.BATU;
  const q = new Pemain(4.5, 10);
  for (let i = 0; i < 120; i++) q.perbarui(1 / 60, { ...diam, kanan: true, lompat: true }, d2);
  benar(q.x < 6, `pemain melompati tembok 2 blok: x=${q.x.toFixed(2)}`);
});

uji('Fisika: kepala terbentur atap', () => {
  const d = duniaUji();
  d.tile[7 * LEBAR + 4] = B.BATU; // atap rendah
  const p = new Pemain(4.5, 10);
  p.diTanah = true;
  for (let i = 0; i < 30; i++) p.perbarui(1 / 60, { ...diam, lompat: true }, d);
  benar(p.y - p.tinggi >= 8 - 1e-3, `kepala menembus atap: ${p.y - p.tinggi}`);
});

uji('Siang dan malam', () => {
  sama(terangSiang(0.2), 1);
  sama(terangSiang(0.75), 0);
  benar(terangSiang(0.55) > 0 && terangSiang(0.55) < 1, 'senja seharusnya setengah terang');
});
