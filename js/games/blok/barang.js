// barang.js — daftar barang (item) yang bisa ada di tas: blok, bahan, dan alat.

import { B } from './blok.js';

// blok      : id blok yang ditaruh saat barang dipakai (jika barang bisa ditaruh)
// tumpuk    : jumlah maksimal dalam satu kotak tas
// beliung   : tingkat beliung (1 kayu, 2 batu, 3 besi) dan kekuatan menambang
// bangunan  : barang khusus yang menaruh satu bangunan utuh
export const BARANG = {
  'tanah': { nama: 'Tanah', blok: B.TANAH },
  'batu': { nama: 'Batu', blok: B.BATU },
  'kayu': { nama: 'Kayu', blok: B.KAYU },
  'daun': { nama: 'Daun', blok: B.DAUN },
  'pasir': { nama: 'Pasir', blok: B.PASIR },
  'papan': { nama: 'Papan', blok: B.PAPAN },
  'meja kerja': { nama: 'Meja Kerja', blok: B.MEJA_KERJA },
  'tungku': { nama: 'Tungku', blok: B.TUNGKU },
  'kaca': { nama: 'Kaca', blok: B.KACA },
  'obor': { nama: 'Obor', blok: B.OBOR },
  'pintu': { nama: 'Pintu', blok: B.PINTU },
  'tongkat': { nama: 'Tongkat' },
  'batu bara': { nama: 'Batu Bara' },
  'bijih besi': { nama: 'Bijih Besi' },
  'bijih emas': { nama: 'Bijih Emas' },
  'besi': { nama: 'Besi Batangan' },
  'emas': { nama: 'Emas Batangan' },
  'beliung kayu': { nama: 'Beliung Kayu', tumpuk: 1, beliung: { tingkat: 1, kekuatan: 2 } },
  'beliung batu': { nama: 'Beliung Batu', tumpuk: 1, beliung: { tingkat: 2, kekuatan: 3 } },
  'beliung besi': { nama: 'Beliung Besi', tumpuk: 1, beliung: { tingkat: 3, kekuatan: 4.5 } },
  'rumah kecil': { nama: 'Rumah Kecil', tumpuk: 4, bangunan: true },
};

export const TUMPUK = 64;
export const namaBarang = id => BARANG[id]?.nama ?? id;
export const maksTumpuk = id => BARANG[id]?.tumpuk ?? TUMPUK;

// Rumah kecil: 6 x 5 blok. P = papan, K = kaca, D = pintu, . = kosong.
// Baris terakhir berada tepat di atas tanah yang diketuk.
export const DENAH_RUMAH = [
  'PPPPPP',
  'P..K.P',
  'P....P',
  'D....P',
  'D....P',
];
export const BLOK_DENAH = { P: B.PAPAN, K: B.KACA, D: B.PINTU, '.': B.UDARA };
