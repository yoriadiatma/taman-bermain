// inventori.js — isi tas pemain: 27 kotak, 9 kotak pertama adalah hotbar.

import { maksTumpuk } from './barang.js';

export const UKURAN_TAS = 27;
export const HOTBAR = 9;

export class Inventori {
  /** data: array kotak { id, n } atau null (dari simpanan). */
  constructor(data = null) {
    this.kotak = Array.from({ length: UKURAN_TAS }, (_, i) => {
      const k = data?.[i];
      return k && typeof k.id === 'string' && k.n > 0 ? { id: k.id, n: Math.floor(k.n) } : null;
    });
  }

  jumlah(id) {
    return this.kotak.reduce((n, k) => n + (k?.id === id ? k.n : 0), 0);
  }

  /** Muat berapa banyak barang ini lagi? */
  muat(id) {
    const maks = maksTumpuk(id);
    return this.kotak.reduce((n, k) => n + (!k ? maks : k.id === id ? maks - k.n : 0), 0);
  }

  /** Tambah barang. Mengembalikan jumlah yang tidak muat (0 jika semua masuk). */
  tambah(id, n = 1) {
    const maks = maksTumpuk(id);
    for (const k of this.kotak) {
      if (n <= 0) break;
      if (k?.id === id && k.n < maks) {
        const isi = Math.min(n, maks - k.n);
        k.n += isi;
        n -= isi;
      }
    }
    for (let i = 0; i < UKURAN_TAS && n > 0; i++) {
      if (this.kotak[i]) continue;
      const isi = Math.min(n, maks);
      this.kotak[i] = { id, n: isi };
      n -= isi;
    }
    return n;
  }

  /** Ambil n barang (dari kotak mana saja). Mengembalikan false jika tidak cukup (tidak ada yang diambil). */
  ambil(id, n = 1) {
    if (this.jumlah(id) < n) return false;
    for (let i = UKURAN_TAS - 1; i >= 0 && n > 0; i--) {
      const k = this.kotak[i];
      if (k?.id !== id) continue;
      const ambil = Math.min(n, k.n);
      k.n -= ambil;
      n -= ambil;
      if (k.n === 0) this.kotak[i] = null;
    }
    return true;
  }

  /** Kurangi satu barang dari kotak tertentu (dipakai saat menaruh blok dari hotbar). */
  pakai(i) {
    const k = this.kotak[i];
    if (!k) return null;
    k.n--;
    if (k.n === 0) this.kotak[i] = null;
    return k.id;
  }

  tukar(i, j) {
    [this.kotak[i], this.kotak[j]] = [this.kotak[j], this.kotak[i]];
  }

  data() {
    return this.kotak.map(k => (k ? { id: k.id, n: k.n } : null));
  }
}
