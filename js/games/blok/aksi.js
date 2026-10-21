// aksi.js — aturan menambang, menaruh blok, membangun rumah, dan memeriksa bangunan.
// Tanpa DOM agar mudah diuji.

import { B, BLOK, padat, bisaDitimpa } from './blok.js';
import { BARANG, DENAH_RUMAH, BLOK_DENAH } from './barang.js';

export const JANGKAUAN = 4.5; // blok
const NAMA_BELIUNG = { 1: 'beliung kayu', 2: 'beliung batu', 3: 'beliung besi' };

/** Apakah kotak (tx, ty) cukup dekat untuk dijangkau pemain? */
export function terjangkau(pemain, tx, ty) {
  return Math.hypot(tx + 0.5 - pemain.x, ty + 0.5 - (pemain.y - pemain.tinggi * 0.55)) <= JANGKAUAN;
}

/**
 * Bisakah blok `id` ditambang dengan barang `dipegang`?
 * Mengembalikan { bisa: true, detik } atau { bisa: false, alasan }.
 */
export function infoTambang(id, dipegang) {
  const b = BLOK[id];
  if (!b || b.beliung === null || b.beliung === undefined) return { bisa: false, alasan: `${b?.nama ?? 'Blok ini'} tidak bisa ditambang.` };
  const alat = BARANG[dipegang]?.beliung;
  const tingkat = alat?.tingkat ?? 0;
  if (tingkat < b.beliung) {
    return { bisa: false, alasan: `Butuh ${NAMA_BELIUNG[b.beliung]} untuk menambang ${b.nama.toLowerCase()}. Pilih beliung di hotbar.` };
  }
  const detik = b.jenis === 'batu' && alat ? b.keras / alat.kekuatan : b.keras;
  return { bisa: true, detik };
}

/**
 * Taruh blok dari barang `idBarang` di (tx, ty). Mengembalikan pesan kesalahan, atau null jika berhasil.
 * Blok harus ditaruh di tempat kosong yang menempel pada blok lain, dan tidak boleh mengurung pemain.
 */
export function taruhBlok(dunia, pemain, tx, ty, idBarang) {
  const blok = BARANG[idBarang]?.blok;
  if (blok === undefined) return 'Barang ini tidak bisa ditaruh.';
  if (!dunia.dalam(tx, ty) || !bisaDitimpa(dunia.get(tx, ty))) return 'Tempat itu sudah terisi.';
  const tetangga = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !bisaDitimpa(dunia.get(tx + dx, ty + dy)));
  if (!tetangga) return 'Blok harus menempel pada blok lain.';
  if (padat(blok) && pemain.menempati(tx, ty)) return 'Kamu sedang berdiri di situ.';
  dunia.set(tx, ty, blok);
  return null;
}

/**
 * Bangun rumah kecil. (tx, ty) = kotak kosong yang diketuk; baris bawah rumah berada di ty.
 * Mengembalikan pesan kesalahan, atau null jika berhasil.
 */
export function taruhRumah(dunia, pemain, tx, ty) {
  const tinggi = DENAH_RUMAH.length;
  const lebar = DENAH_RUMAH[0].length;
  const atas = ty - tinggi + 1;
  let pijakan = 0;
  for (let dx = 0; dx < lebar; dx++) {
    for (let dy = 0; dy < tinggi; dy++) {
      const x = tx + dx;
      const y = atas + dy;
      if (!dunia.dalam(x, y)) return 'Rumah tidak muat di sini.';
      if (padat(dunia.get(x, y))) return 'Butuh ruang kosong 6 × 5 blok untuk rumah.';
      const blok = BLOK_DENAH[DENAH_RUMAH[dy][dx]];
      if (padat(blok) && pemain.menempati(x, y)) return 'Bergeserlah dulu, kamu berdiri di tempat dinding rumah.';
    }
    if (padat(dunia.get(tx + dx, ty + 1))) pijakan++;
  }
  if (pijakan < 3) return 'Rumah harus dibangun di atas tanah yang rata.';
  for (let dx = 0; dx < lebar; dx++) {
    for (let dy = 0; dy < tinggi; dy++) dunia.set(tx + dx, atas + dy, BLOK_DENAH[DENAH_RUMAH[dy][dx]]);
  }
  return null;
}

/** Adakah persegi panjang penuh dari `blok` berukuran lebar × tinggi di sekitar (cx, cy)? */
export function adaPersegi(dunia, cx, cy, lebar, tinggi, blok = B.PAPAN, r = 14) {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      let cocok = true;
      for (let dy = 0; dy < tinggi && cocok; dy++) {
        for (let dx = 0; dx < lebar; dx++) {
          if (dunia.get(x + dx, y + dy) !== blok) { cocok = false; break; }
        }
      }
      if (cocok) return true;
    }
  }
  return false;
}

/** Isi peti harta: makin dalam, makin berharga. */
export function isiPeti(y, acak = Math.random) {
  const antara = (a, b) => a + Math.floor(acak() * (b - a + 1));
  const isi = [['obor', antara(2, 4)], ['batu bara', antara(2, 5)]];
  isi.push(['bijih besi', y > 72 ? antara(1, 3) : antara(0, 1)]);
  if (y > 90) isi.push(['bijih emas', antara(1, 2)]);
  return isi.filter(([, n]) => n > 0);
}
