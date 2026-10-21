// storage.js — pembungkus localStorage untuk Taman Game Belajar.
//
// Semua key diberi prefix "tgb:" karena origin <username>.github.io dipakai
// bersama project lain. Nilai disimpan sebagai JSON.
//
// Penulisan ditampung dulu di memori (cache + daftar "kotor") lalu ditulis ke
// localStorage secara berkala, saat tab disembunyikan/ditutup, dan sebelum
// keluar dari game. Jadi nilai yang dikembalikan get() adalah objek di cache:
// jika diubah, panggil set() lagi agar ikut tersimpan.

export const PREFIX = 'tgb:';
export const SCHEMA = 1;

// MIGRASI[n] mengubah data dari skema n ke skema n+1. Migrasi harus aman
// dijalankan ulang (idempoten), karena impor berkas lama menjalankannya lagi.
// Contoh nanti saat SCHEMA = 2:
//   1: () => { const p = get('profiles'); ...ubah...; set('profiles', p); },
const MIGRASI = {};

// Key yang tidak ikut diekspor/diimpor.
const TIDAK_DIEKSPOR = new Set(['teacher', 'schema']);

const cache = new Map();   // key penuh -> nilai; undefined berarti sudah dihapus
const kotor = new Set();   // key penuh yang belum ditulis ke localStorage
const pengaitSimpan = new Set();
let penanganGalat = () => {};
let jadwal = null;

let ls = null;
try {
  ls = window.localStorage;
  const uji = PREFIX + '__uji';
  ls.setItem(uji, '1');
  ls.removeItem(uji);
} catch {
  ls = null; // mode privat / diblokir: aplikasi tetap jalan, data hanya di memori
}

export const tersedia = () => ls !== null;

function bacaMentah(k) {
  if (!ls) return undefined;
  try {
    const s = ls.getItem(k);
    return s === null ? undefined : JSON.parse(s);
  } catch {
    return undefined;
  }
}

function jadwalkan() {
  if (jadwal) return;
  jadwal = setTimeout(() => { jadwal = null; flush(); }, 1500);
}

export function get(key, bawaan = null) {
  const k = PREFIX + key;
  if (!cache.has(k)) cache.set(k, bacaMentah(k));
  const v = cache.get(k);
  return v === undefined ? bawaan : v;
}

export function set(key, nilai) {
  const k = PREFIX + key;
  cache.set(k, nilai);
  kotor.add(k);
  jadwalkan();
}

export function remove(key) {
  const k = PREFIX + key;
  cache.set(k, undefined);
  kotor.add(k);
  jadwalkan();
}

function galatKuota(e) {
  return e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22);
}

/** Tulis semua perubahan ke localStorage. Mengembalikan true jika berhasil. */
export function flush() {
  if (!ls) return false;
  let gagal = null;
  for (const k of [...kotor]) {
    const v = cache.get(k);
    try {
      if (v === undefined) ls.removeItem(k);
      else ls.setItem(k, JSON.stringify(v));
      kotor.delete(k);
    } catch (e) {
      gagal = e;
    }
  }
  if (gagal) penanganGalat(galatKuota(gagal) ? 'kuota' : 'lain', gagal);
  return !gagal;
}

/** Daftar key (tanpa prefix "tgb:") yang diawali `awalan`. */
export function daftarKunci(awalan = '') {
  const penuh = PREFIX + awalan;
  const hasil = new Set();
  if (ls) {
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (k && k.startsWith(penuh)) hasil.add(k);
    }
  }
  for (const [k, v] of cache) {
    if (!k.startsWith(penuh)) continue;
    if (v === undefined) hasil.delete(k);
    else hasil.add(k);
  }
  return [...hasil].map(k => k.slice(PREFIX.length));
}

/** Perkiraan ukuran data (dalam byte) untuk key berawalan `awalan`. */
export function ukuran(awalan = '') {
  return daftarKunci(awalan).reduce((n, k) => n + k.length + JSON.stringify(get(k)).length, 0) * 2;
}

function namespace(awal) {
  return {
    get: (k, bawaan = null) => get(awal + k, bawaan),
    set: (k, v) => set(awal + k, v),
    remove: k => remove(awal + k),
    keys: () => daftarKunci(awal).map(k => k.slice(awal.length)),
    clear: () => daftarKunci(awal).forEach(remove),
  };
}

/** Penyimpanan milik satu game untuk satu profil: key "tgb:p:<profil>:g:<game>:<key>". */
export const untukGame = (idProfil, idGame) => namespace(`p:${idProfil}:g:${idGame}:`);

/** Penyimpanan milik satu profil di luar game (mis. statistik soal): "tgb:p:<profil>:<key>". */
export const untukProfil = idProfil => namespace(`p:${idProfil}:`);

export function hapusDataProfil(idProfil) {
  daftarKunci(`p:${idProfil}:`).forEach(remove);
  return flush();
}

export function hapusSemua() {
  daftarKunci().forEach(remove);
  return flush();
}

export function migrasi() {
  let v = get('schema', null);
  if (v === null) {
    set('schema', SCHEMA);
  } else {
    while (v < SCHEMA) {
      MIGRASI[v]?.();
      v++;
      set('schema', v);
    }
  }
  flush();
}

/** Daftarkan fungsi yang dipanggil sebelum setiap penyimpanan otomatis. Mengembalikan fungsi pelepas. */
export function saatSimpan(fn) {
  pengaitSimpan.add(fn);
  return () => pengaitSimpan.delete(fn);
}

export function simpanSemua() {
  for (const fn of pengaitSimpan) {
    try { fn(); } catch (e) { console.error('Gagal menyimpan:', e); }
  }
  return flush();
}

export function pasangAutoSave(interval = 10000) {
  setInterval(simpanSemua, interval);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') simpanSemua();
  });
  window.addEventListener('pagehide', simpanSemua);
}

/** fn(jenis, error) dipanggil jika penulisan gagal; jenis = 'kuota' | 'lain'. */
export function saatGalat(fn) {
  penanganGalat = fn;
}

export function ekspor() {
  simpanSemua();
  const data = {};
  for (const k of daftarKunci()) {
    if (!TIDAK_DIEKSPOR.has(k)) data[k] = get(k);
  }
  return { app: 'tgb', schema: get('schema', SCHEMA), diekspor: new Date().toISOString(), data };
}

/** Periksa isi berkas ekspor. Melempar Error berpesan ramah jika tidak valid. */
export function periksaImpor(obj) {
  if (!obj || obj.app !== 'tgb' || typeof obj.data !== 'object' || obj.data === null) {
    throw new Error('Berkas ini bukan data Taman Game Belajar.');
  }
  if (!Number.isInteger(obj.schema) || obj.schema < 1) {
    throw new Error('Versi data di berkas ini tidak dikenali.');
  }
  if (obj.schema > SCHEMA) {
    throw new Error('Berkas ini dibuat oleh versi aplikasi yang lebih baru. Muat ulang aplikasi dulu agar versinya terbaru.');
  }
}

/**
 * Impor data hasil ekspor. Key yang sama ditimpa; key lain dibiarkan.
 * `gabung` boleh berisi fungsi penggabung per key, mis. { profiles: (lama, baru) => ... }.
 */
export function impor(obj, { gabung = {} } = {}) {
  periksaImpor(obj);
  for (const [k, v] of Object.entries(obj.data)) {
    if (TIDAK_DIEKSPOR.has(k) || k.startsWith(PREFIX)) continue;
    set(k, gabung[k] ? gabung[k](get(k), v) : v);
  }
  // Pakai skema berkas lalu jalankan migrasi agar data lama ikut diperbarui.
  set('schema', Math.min(obj.schema, get('schema', SCHEMA)));
  migrasi();
  if (!flush()) throw new Error('Data gagal disimpan. Mungkin penyimpanan browser penuh.');
}
