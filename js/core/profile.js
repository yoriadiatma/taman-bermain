// profile.js — banyak profil anak di satu perangkat, satu profil aktif.
// Disimpan di key "tgb:profiles" = { list: [{ id, nama, avatar, kelas, dibuat }], aktif }.

import * as storage from './storage.js';
import { AVATAR } from '../../data/avatar.js';

// Kelas yang didukung aplikasi. Untuk menambah kelas 1-3 nanti cukup ubah daftar
// ini lalu tambahkan soal untuk kelas tersebut di data/questions.js.
export const KELAS_TERSEDIA = [4, 5, 6];
export const MAKS_NAMA = 20;

const KEY = 'profiles';

const data = () => storage.get(KEY, { list: [], aktif: null });

function simpan(d) {
  storage.set(KEY, d);
  storage.flush();
}

export const semua = () => data().list;
export const ambil = id => semua().find(p => p.id === id) || null;

export function aktif() {
  const d = data();
  return d.list.find(p => p.id === d.aktif) || null;
}

export function pilih(id) {
  if (!ambil(id)) return false;
  simpan({ ...data(), aktif: id });
  return true;
}

export function rapikanNama(nama) {
  return String(nama ?? '').replace(/\s+/g, ' ').trim().slice(0, MAKS_NAMA);
}

/** Mengembalikan pesan kesalahan, atau null jika data profil valid. */
export function periksa({ nama, avatar, kelas }) {
  if (!rapikanNama(nama)) return 'Tulis namamu dulu ya.';
  if (!AVATAR.some(a => a.id === avatar)) return 'Pilih salah satu gambar avatar.';
  if (!KELAS_TERSEDIA.includes(kelas)) return 'Pilih kelasmu.';
  return null;
}

export function buat({ nama, avatar, kelas }) {
  const galat = periksa({ nama, avatar, kelas });
  if (galat) throw new Error(galat);
  const p = {
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nama: rapikanNama(nama),
    avatar,
    kelas,
    dibuat: new Date().toISOString(),
  };
  const d = data();
  simpan({ list: [...d.list, p], aktif: p.id });
  return p;
}

export function ubah(id, perubahan) {
  const lama = ambil(id);
  if (!lama) throw new Error('Profil tidak ditemukan.');
  const baru = { ...lama, ...perubahan, id, nama: rapikanNama(perubahan.nama ?? lama.nama) };
  const galat = periksa(baru);
  if (galat) throw new Error(galat);
  const d = data();
  simpan({ ...d, list: d.list.map(p => (p.id === id ? baru : p)) });
  return baru;
}

/** Hapus profil beserta semua progresnya. */
export function hapus(id) {
  const d = data();
  simpan({ list: d.list.filter(p => p.id !== id), aktif: d.aktif === id ? null : d.aktif });
  storage.hapusDataProfil(id);
}

/** Penggabung untuk impor: profil dari berkas menimpa profil ber-id sama, profil lain tetap ada. */
export function gabungDaftar(lama, baru) {
  const daftarLama = lama?.list ?? [];
  const daftarBaru = (baru?.list ?? []).filter(p => p && typeof p.id === 'string');
  const idBaru = new Set(daftarBaru.map(p => p.id));
  return {
    list: [...daftarLama.filter(p => !idBaru.has(p.id)), ...daftarBaru],
    aktif: lama?.aktif ?? null,
  };
}
