// dunia.js — dunia 2D berbasis tile yang dibuat secara prosedural dari sebuah seed.
// Seed yang sama selalu menghasilkan dunia yang sama, jadi yang perlu disimpan
// hanya seed + daftar perubahan blok (diff), bukan seluruh dunia.
//
// Koordinat: x = kolom (0 di kiri), y = baris (0 di atas, makin besar makin dalam).

import { B, padat, cair, tembusCahaya } from './blok.js';

export const LEBAR = 384;
export const TINGGI = 128;
export const LAUT = 52; // baris permukaan air laut/danau

export const seedAcak = () => (Math.random() * 4294967296) >>> 0;

// ---------- Angka acak yang bisa diulang ----------

/** Hash bilangan bulat (x, y, seed) menjadi angka 0..1. */
export function hash(x, y, seed) {
  let h = (seed ^ Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const halus = t => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function derau1(x, seed) {
  const i = Math.floor(x);
  return lerp(hash(i, 0, seed), hash(i + 1, 0, seed), halus(x - i));
}

function derau2(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = halus(x - ix);
  const fy = halus(y - iy);
  const atas = lerp(hash(ix, iy, seed), hash(ix + 1, iy, seed), fx);
  const bawah = lerp(hash(ix, iy + 1, seed), hash(ix + 1, iy + 1, seed), fx);
  return lerp(atas, bawah, fy);
}

/** Derau bertingkat (fractal), hasil 0..1. */
function fbm1(x, seed, oktaf = 3) {
  let n = 0;
  let a = 1;
  let total = 0;
  let f = 1;
  for (let o = 0; o < oktaf; o++) {
    n += a * derau1(x * f, seed + o * 1013);
    total += a;
    a *= 0.5;
    f *= 2;
  }
  return n / total;
}

// ---------- Dunia ----------

export class Dunia {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.tile = new Uint8Array(LEBAR * TINGGI);
    this.permukaan = new Int16Array(LEBAR); // baris blok penahan cahaya teratas tiap kolom
    this._buat();
    this.asli = this.tile.slice(); // dunia asli dari seed, untuk menghitung diff
    this.perubahan = new Map();    // indeks tile -> id blok baru
  }

  dalam(x, y) {
    return x >= 0 && x < LEBAR && y >= 0 && y < TINGGI;
  }

  get(x, y) {
    if (y < 0) return B.UDARA;
    if (x < 0 || x >= LEBAR || y >= TINGGI) return B.BATUAN_DASAR;
    return this.tile[y * LEBAR + x];
  }

  set(x, y, id) {
    if (!this.dalam(x, y)) return;
    const i = y * LEBAR + x;
    this.tile[i] = id;
    if (id === this.asli[i]) this.perubahan.delete(i);
    else this.perubahan.set(i, id);
    this._hitungPermukaan(x);
  }

  /** Diff ringkas untuk disimpan: [indeks, id, indeks, id, ...]. */
  dataPerubahan() {
    const d = [];
    for (const [i, id] of this.perubahan) d.push(i, id);
    return d;
  }

  /** Terapkan diff hasil dataPerubahan(). Data yang rusak dilewati. */
  terapkanPerubahan(d) {
    if (!Array.isArray(d)) return;
    for (let k = 0; k + 1 < d.length; k += 2) {
      const i = d[k];
      const id = d[k + 1];
      if (!Number.isInteger(i) || i < 0 || i >= this.tile.length || !Number.isInteger(id) || id < 0 || id > 255) continue;
      this.set(i % LEBAR, Math.floor(i / LEBAR), id);
    }
  }

  /** Cari blok tertentu dalam jarak r dari (x, y). */
  adaDekat(x, y, id, r = 4) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (this.get(x + dx, y + dy) === id) return true;
    return false;
  }

  padat(x, y) {
    return padat(this.get(x, y));
  }

  cair(x, y) {
    return cair(this.get(x, y));
  }

  _hitungPermukaan(x) {
    let y = 0;
    while (y < TINGGI - 1 && tembusCahaya(this.tile[y * LEBAR + x])) y++;
    this.permukaan[x] = y;
  }

  /** Tinggi tanah dari derau, sebelum dihaluskan. */
  tinggiTanah(x) {
    const s = this.seed;
    const h = 48 + (fbm1(x / 60, s) - 0.5) * 26 + (fbm1(x / 14, s + 77) - 0.5) * 7;
    return Math.max(30, Math.min(66, Math.round(h)));
  }

  _buat() {
    const s = this.seed;
    const t = this.tile;
    const isi = (x, y, id) => { t[y * LEBAR + x] = id; };
    const tanah = new Int16Array(LEBAR);

    // 1. Tinggi tanah. Beda tinggi kolom yang bersebelahan dibatasi 1 blok
    //    agar semua bukit bisa didaki dengan melompat.
    for (let x = 0; x < LEBAR; x++) {
      const h = this.tinggiTanah(x);
      tanah[x] = x === 0 ? h : Math.max(tanah[x - 1] - 1, Math.min(tanah[x - 1] + 1, h));
    }

    // 2. Lapisan tanah: rumput, tanah, batu, batuan dasar.
    for (let x = 0; x < LEBAR; x++) {
      const h = tanah[x];
      const tebalTanah = 3 + Math.floor(hash(x, 1, s) * 3);
      const pantai = h >= LAUT - 1; // dekat atau di bawah permukaan air: pasir
      for (let y = h; y < TINGGI; y++) {
        let id;
        if (y >= TINGGI - 2 || (y === TINGGI - 3 && hash(x, y, s + 5) < 0.5)) id = B.BATUAN_DASAR;
        else if (y === h) id = pantai ? B.PASIR : B.RUMPUT;
        else if (y <= h + tebalTanah) id = pantai ? B.PASIR : B.TANAH;
        else id = B.BATU;
        isi(x, y, id);
      }
      // Air mengisi cekungan di bawah permukaan laut.
      for (let y = LAUT; y < h; y++) isi(x, y, B.AIR);
    }

    // 3. Gua dan bijih di dalam batu.
    for (let x = 1; x < LEBAR - 1; x++) {
      for (let y = tanah[x] + 6; y < TINGGI - 3; y++) {
        if (t[y * LEBAR + x] !== B.BATU) continue;
        const gua = derau2(x / 14, y / 8, s + 300) * 0.65 + derau2(x / 5, y / 5, s + 301) * 0.35;
        if (gua > 0.66) { isi(x, y, B.UDARA); continue; }
        if (derau2(x / 2.5, y / 2.5, s + 400) > 0.86) isi(x, y, B.BATU_BARA);
        else if (y > 72 && derau2(x / 2.2, y / 2.2, s + 500) > 0.89) isi(x, y, B.BIJIH_BESI);
        else if (y > 96 && derau2(x / 2, y / 2, s + 600) > 0.92) isi(x, y, B.BIJIH_EMAS);
      }
    }

    // 4. Pohon di atas rumput, berjarak agar tidak berdempetan.
    let pohonTerakhir = -10;
    for (let x = 4; x < LEBAR - 4; x++) {
      const h = tanah[x];
      if (t[h * LEBAR + x] !== B.RUMPUT || x - pohonTerakhir < 4 || hash(x, 2, s) > 0.18) continue;
      if (tanah[x - 1] !== h && tanah[x + 1] !== h) continue; // hindari puncak runcing
      pohonTerakhir = x;
      const tinggi = 4 + Math.floor(hash(x, 3, s) * 3);
      const puncak = h - tinggi;
      for (let y = puncak; y < h; y++) isi(x, y, B.KAYU);
      for (let dy = -2; dy <= 1; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (Math.abs(dx) === 2 && (dy === -2 || dy === 1)) continue; // sudut membulat
          const lx = x + dx;
          const ly = puncak + dy;
          if (ly >= 0 && t[ly * LEBAR + lx] === B.UDARA) isi(lx, ly, B.DAUN);
        }
      }
    }

    // 5. Peti harta terkunci di lantai gua, saling berjauhan.
    let petiTerakhir = -30;
    for (let x = 6; x < LEBAR - 6; x++) {
      if (x - petiTerakhir < 22 || hash(x, 4, s) > 0.25) continue;
      for (let y = tanah[x] + 10; y < TINGGI - 4; y++) {
        const i = y * LEBAR + x;
        if (t[i] === B.UDARA && t[i - LEBAR] === B.UDARA && t[i + LEBAR] === B.BATU) {
          isi(x, y, B.PETI);
          petiTerakhir = x;
          break;
        }
      }
    }

    // 6. Dinding batuan dasar di kedua tepi dunia.
    for (let y = 0; y < TINGGI; y++) {
      isi(0, y, B.BATUAN_DASAR);
      isi(LEBAR - 1, y, B.BATUAN_DASAR);
    }

    for (let x = 0; x < LEBAR; x++) this._hitungPermukaan(x);
    this.tanahAlami = tanah;
  }

  /** Titik muncul: kolom daratan kering terdekat dari tengah dunia. Mengembalikan { x, y } kaki pemain. */
  titikMuncul() {
    const tengah = LEBAR >> 1;
    for (let d = 0; d < LEBAR / 2 - 2; d++) {
      for (const x of [tengah + d, tengah - d]) {
        const h = this.tanahAlami[x];
        if (h < LAUT - 1 && this.get(x, h) === B.RUMPUT && !this.padat(x, h - 1) && !this.padat(x, h - 2)) {
          return { x: x + 0.5, y: h };
        }
      }
    }
    return { x: tengah + 0.5, y: this.permukaan[tengah] };
  }
}
