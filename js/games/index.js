// index.js — daftar semua game.
//
// Menambah game baru: buat folder js/games/<id>/index.js yang mengekspor
// definisi game (lihat js/core/registry.js), lalu tambahkan satu baris path di
// MODUL_GAME. Setiap game dimuat terpisah, jadi satu game yang rusak tidak
// membuat menu utama ikut rusak.

import { daftar } from '../core/registry.js';

export const MODUL_GAME = [
  './blok/index.js',
  './catur/index.js',
  './kata/index.js',
  './kebun/index.js',
  './pasangan/index.js',
  './pasar/index.js',
  './ular-tangga/index.js',
];

/** Muat dan daftarkan semua game. Mengembalikan daftar path yang gagal. */
export async function muatSemuaGame() {
  const hasil = await Promise.allSettled(MODUL_GAME.map(p => import(p)));
  const gagal = [];
  hasil.forEach((h, i) => {
    try {
      if (h.status === 'rejected') throw h.reason;
      daftar(h.value.default);
    } catch (e) {
      console.error(`Game ${MODUL_GAME[i]} gagal dimuat:`, e);
      gagal.push(MODUL_GAME[i]);
    }
  });
  return gagal;
}
