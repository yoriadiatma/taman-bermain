// quiz.js — mesin soal bersama untuk semua game.
//
// Tipe soal: 'pilihan' (pilihan ganda), 'angka' (isian angka), 'teks' (isian
// teks singkat), 'urutan' (menyusun urutan). Format soal ada di data/questions.js.
//
// Pemilihan soal: sesuai mapel + kelas, menghindari soal yang baru saja keluar,
// dan lebih sering memilih topik yang sering dijawab salah.
// Statistik disimpan per profil di "tgb:p:<idProfil>:quiz".

import { SOAL } from '../../data/questions.js';
import { MAPEL } from './mapel.js';
import * as storage from './storage.js';

export const TIPE = ['pilihan', 'angka', 'teks', 'urutan'];

// ---------- Validasi bank soal ----------

function masalahSoal(s, idTerpakai) {
  const m = [];
  if (!s || typeof s.id !== 'string' || !s.id) return ['soal tanpa id'];
  if (idTerpakai.has(s.id)) m.push('id ganda');
  if (!MAPEL[s.mapel]) m.push(`mapel "${s.mapel}" tidak dikenal`);
  if (!Number.isInteger(s.kelas)) m.push('kelas harus angka bulat');
  if (!s.topik) m.push('topik kosong');
  if (!s.pertanyaan) m.push('pertanyaan kosong');
  if (!TIPE.includes(s.tipe)) m.push(`tipe "${s.tipe}" tidak dikenal`);
  if (s.tipe === 'pilihan') {
    if (!Array.isArray(s.pilihan) || s.pilihan.length < 2) m.push('pilihan minimal 2');
    else if (new Set(s.pilihan).size !== s.pilihan.length) m.push('ada pilihan kembar');
    else if (!s.pilihan.includes(s.jawaban)) m.push('jawaban tidak ada di pilihan');
  }
  if (s.tipe === 'angka' && typeof s.jawaban !== 'number') m.push('jawaban isian angka harus berupa number');
  if (s.tipe === 'teks' && !(typeof s.jawaban === 'string' || (Array.isArray(s.jawaban) && s.jawaban.length))) {
    m.push('jawaban isian teks harus string atau daftar string');
  }
  if (s.tipe === 'urutan' && (!Array.isArray(s.jawaban) || s.jawaban.length < 2 || new Set(s.jawaban).size !== s.jawaban.length)) {
    m.push('jawaban urutan harus daftar minimal 2 item berbeda');
  }
  return m;
}

const { BANK, MASALAH } = (() => {
  const bank = [];
  const masalah = [];
  const idTerpakai = new Set();
  for (const s of SOAL) {
    const m = masalahSoal(s, idTerpakai);
    if (m.length) {
      masalah.push({ id: s?.id ?? '?', masalah: m });
      console.error(`Soal ${s?.id ?? '?'} dilewati: ${m.join(', ')}`);
    } else {
      bank.push(Object.freeze(s));
    }
    if (s?.id) idTerpakai.add(s.id);
  }
  return { BANK: bank, MASALAH: masalah };
})();

export const semuaSoal = () => BANK;
export const masalahBank = () => MASALAH;
export const ambilSoal = id => BANK.find(s => s.id === id) || null;

// ---------- Memeriksa jawaban ----------

/** Ubah teks angka gaya Indonesia ("2,5", "1.500", "-3") menjadi number. NaN jika tidak valid. */
export function parseAngka(teks) {
  let s = String(teks ?? '').replace(/\s/g, '').replace(/−/g, '-');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

export const formatAngka = n => n.toLocaleString('id-ID', { maximumFractionDigits: 6 });

/** Huruf kecil, spasi dirapikan, tanda baca di akhir diabaikan. Tanda hubung tetap dihitung. */
export const normalTeks = s => String(s ?? '')
  .normalize('NFKC')
  .toLowerCase()
  .replace(/[’‘`]/g, "'")
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/[.!?]+$/, '');

export function periksaJawaban(soal, jawaban) {
  switch (soal.tipe) {
    case 'pilihan': return jawaban === soal.jawaban;
    case 'angka': return Math.abs(parseAngka(jawaban) - soal.jawaban) < 1e-9;
    case 'teks': return [].concat(soal.jawaban).some(j => normalTeks(j) === normalTeks(jawaban));
    case 'urutan': return Array.isArray(jawaban) && jawaban.length === soal.jawaban.length && jawaban.every((x, i) => x === soal.jawaban[i]);
    default: return false;
  }
}

/** Jawaban benar dalam bentuk teks untuk ditampilkan ke anak. */
export function teksJawaban(soal) {
  if (soal.tipe === 'angka') return formatAngka(soal.jawaban);
  if (soal.tipe === 'teks') return [].concat(soal.jawaban)[0];
  if (soal.tipe === 'urutan') return soal.jawaban.join(' → ');
  return soal.jawaban;
}

// ---------- Statistik ----------

const KEY = 'quiz';
const PANJANG_RIWAYAT = 60;

const statKosong = () => ({ v: 1, mapel: {}, soal: {}, riwayat: [], terakhir: null });

export function statistik(idProfil) {
  return storage.untukProfil(idProfil).get(KEY, null) ?? statKosong();
}

/** Catat hasil satu soal. `benar` = dijawab benar pada percobaan pertama. */
export function catat(idProfil, soal, benar) {
  const st = statistik(idProfil);
  const m = (st.mapel[soal.mapel] ??= { benar: 0, salah: 0, topik: {} });
  const t = (m.topik[soal.topik] ??= { benar: 0, salah: 0 });
  const p = (st.soal[soal.id] ??= { b: 0, s: 0 });
  const kolom = benar ? 'benar' : 'salah';
  m[kolom]++;
  t[kolom]++;
  p[benar ? 'b' : 's']++;
  st.riwayat = [...st.riwayat, soal.id].slice(-PANJANG_RIWAYAT);
  st.terakhir = new Date().toISOString();
  storage.untukProfil(idProfil).set(KEY, st);
}

// ---------- Memilih soal ----------

const cocok = (filter, nilai) => filter == null || [].concat(filter).includes(nilai);

function acak(daftar) {
  const a = [...daftar];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Salinan soal yang siap ditampilkan: pilihan diacak, item urutan diacak (tidak langsung benar). */
export function siapkan(soal) {
  const s = { ...soal };
  if (s.tipe === 'pilihan') s.pilihanAcak = acak(s.pilihan);
  if (s.tipe === 'urutan') {
    let a;
    do { a = acak(s.jawaban); } while (a.every((x, i) => x === s.jawaban[i]));
    s.itemAcak = a;
  }
  return s;
}

/**
 * Pilih satu soal. opsi: { idProfil, kelas, mapel?, topik?, kecuali? }.
 * mapel/topik boleh string atau daftar. Mengembalikan soal siap tampil, atau null.
 */
export function pilihSoal({ idProfil = null, kelas, mapel = null, topik = null, kecuali = [] }) {
  const sesuai = s => cocok(mapel, s.mapel) && cocok(topik, s.topik);
  let pool = BANK.filter(s => s.kelas === kelas && sesuai(s));
  // Jika soal untuk kelas ini terlalu sedikit, pakai juga soal kelas di bawahnya.
  if (pool.length < 5) pool = BANK.filter(s => s.kelas <= kelas && s.kelas >= kelas - 1 && sesuai(s));
  if (!pool.length) pool = BANK.filter(sesuai);
  if (!pool.length) return null;

  const st = idProfil ? statistik(idProfil) : statKosong();
  const jendela = Math.min(20, Math.floor(pool.length / 2));
  const baruSaja = new Set(st.riwayat.slice(-jendela));
  const terakhir = st.riwayat[st.riwayat.length - 1];
  let kandidat = pool.filter(s => !baruSaja.has(s.id) && !kecuali.includes(s.id));
  if (!kandidat.length) kandidat = pool.filter(s => s.id !== terakhir);
  if (!kandidat.length) kandidat = pool;

  // Bobot: topik yang sering salah dan soal yang pernah salah lebih sering muncul.
  const bobot = kandidat.map(s => {
    const t = st.mapel[s.mapel]?.topik[s.topik];
    const total = t ? t.benar + t.salah : 0;
    const rasioSalah = total ? t.salah / total : 0;
    const p = st.soal[s.id];
    return 1 + 3 * rasioSalah + (p ? (p.s > p.b ? 1 : 0) : 0.5);
  });
  let r = Math.random() * bobot.reduce((a, b) => a + b, 0);
  for (let i = 0; i < kandidat.length; i++) {
    r -= bobot[i];
    if (r <= 0) return siapkan(kandidat[i]);
  }
  return siapkan(kandidat[kandidat.length - 1]);
}
