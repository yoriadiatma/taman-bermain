// registry.js — daftar semua game. Menu utama dibuat otomatis dari sini.
//
// Bentuk definisi game:
// {
//   id, nama, deskripsi, ikon (string SVG), kelasMin, kelasMax,
//   mapel ('matematika' atau ['matematika', 'ipa']),
//   mount(container, ctx), unmount(),
//   // opsional:
//   css: 'css/<id>.css',        // dimuat saat game dibuka
//   simpan(),                   // dipanggil saat auto-save dan sebelum keluar
//   progres(store, profil),     // -> { bintang: 0-3, teks } untuk kartu di menu
// }
// ctx = { profil, kelas, store, audio, ui, quiz: { tanya, pilih, periksa, catat }, keluar() }

import { MAPEL } from './mapel.js';

const WAJIB = ['id', 'nama', 'deskripsi', 'ikon', 'kelasMin', 'kelasMax', 'mapel', 'mount', 'unmount'];
const game = new Map();

export const daftarMapel = def => (Array.isArray(def.mapel) ? def.mapel : [def.mapel]);

export function daftar(def) {
  const nama = def?.id ?? '(tanpa id)';
  for (const f of WAJIB) {
    if (def?.[f] === undefined) throw new Error(`Game "${nama}" tidak punya field wajib "${f}".`);
  }
  if (!/^[a-z0-9-]+$/.test(def.id)) throw new Error(`ID game "${nama}" hanya boleh huruf kecil, angka, dan tanda minus.`);
  if (typeof def.mount !== 'function' || typeof def.unmount !== 'function') {
    throw new Error(`Game "${nama}": mount dan unmount harus berupa fungsi.`);
  }
  for (const m of daftarMapel(def)) {
    if (!MAPEL[m]) throw new Error(`Game "${nama}": mapel "${m}" tidak dikenal (lihat js/core/mapel.js).`);
  }
  if (game.has(def.id)) throw new Error(`ID game ganda: "${def.id}".`);
  game.set(def.id, def);
}

export const semua = () => [...game.values()];
export const ambil = id => game.get(id) || null;
export const cocokKelas = (def, kelas) => kelas >= def.kelasMin && kelas <= def.kelasMax;
export const untukKelas = kelas => semua().filter(d => cocokKelas(d, kelas));
