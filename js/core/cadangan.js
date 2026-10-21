// cadangan.js — ekspor/impor progres ke berkas JSON.
// Progres hanya tersimpan di browser perangkat ini, jadi ekspor dipakai untuk
// cadangan atau memindahkan progres ke perangkat lain.

import { el, unduh, pilihBerkas, konfirmasi, modal, toast, tanggalHariIni } from './ui.js';
import * as storage from './storage.js';
import * as profil from './profile.js';

export function eksporProgres() {
  const data = storage.ekspor();
  unduh(`taman-game-belajar-${tanggalHariIni()}.json`, JSON.stringify(data, null, 1));
  toast('Berkas progres sudah diunduh. Simpan baik-baik ya.', 'sukses', 3500);
}

/** Mengembalikan true jika impor berhasil. */
export async function imporProgres() {
  const berkas = await pilihBerkas();
  if (!berkas) return false;
  let obj;
  try {
    obj = JSON.parse(await berkas.text());
    storage.periksaImpor(obj);
  } catch (e) {
    await modal({ judul: 'Berkas tidak bisa dibaca', isi: e instanceof SyntaxError ? 'Berkas ini bukan berkas JSON yang benar.' : e.message });
    return false;
  }
  const nama = (obj.data.profiles?.list ?? []).map(p => p.nama).filter(Boolean);
  const isi = el('div', {},
    el('p', {}, `Berkas dari ${new Date(obj.diekspor).toLocaleString('id-ID')} berisi ${nama.length} profil${nama.length ? ': ' + nama.join(', ') : ''}.`),
    el('p', {}, 'Profil yang sama di perangkat ini akan ditimpa dengan isi berkas. Profil lain tetap aman.'));
  const ya = await konfirmasi(isi, { judul: 'Impor progres?', ya: 'Impor' });
  if (!ya) return false;
  try {
    storage.impor(obj, { gabung: { profiles: profil.gabungDaftar } });
  } catch (e) {
    await modal({ judul: 'Impor gagal', isi: e.message });
    return false;
  }
  toast('Progres berhasil diimpor.', 'sukses');
  return true;
}
