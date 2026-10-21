// teacher.js — Mode Guru: dikunci PIN sederhana.
//
// PIN hanya pengaman ringan agar anak tidak sengaja menghapus data. Kode aplikasi
// ini publik dan data ada di localStorage, jadi siapa pun yang paham bisa
// melewatinya. Hash di bawah bukan hash kriptografis; dipilih karena jalan di
// semua kondisi (termasuk saat dibuka lewat http://<IP-laptop> dari tablet).
//
// Statistik belajar per topik dan ekspor CSV ditambahkan bersama mesin soal (Tahap 2).

import { el, avatarSvg, kepalaAplikasi, papanAngka, konfirmasi, modal, toast } from './ui.js';
import * as storage from './storage.js';
import * as profil from './profile.js';
import * as audio from './audio.js';
import { ke } from './router.js';
import { eksporProgres } from './cadangan.js';

const PIN_BAWAAN = '1234';
const KEY = 'teacher';

// cyrb53: hash 53-bit sederhana.
function hash(teks) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < teks.length; i++) {
    const c = teks.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export const masihPinBawaan = () => !storage.get(KEY);

export function cekPin(pin) {
  const t = storage.get(KEY);
  return t ? hash(`${t.salt}:${pin}`) === t.pinHash : pin === PIN_BAWAAN;
}

export function gantiPin(pinBaru) {
  if (!/^\d{4,8}$/.test(pinBaru)) throw new Error('PIN harus 4 sampai 8 angka.');
  const salt = Math.random().toString(36).slice(2, 10);
  storage.set(KEY, { salt, pinHash: hash(`${salt}:${pinBaru}`) });
  storage.flush();
}

const CATATAN_PIN = 'Catatan: PIN ini hanya pengaman ringan agar anak tidak mengubah data tanpa sengaja. ' +
  'Ini bukan keamanan sungguhan, karena kode aplikasi bersifat publik.';

const tujuanKembali = () => (profil.aktif() ? '/hub' : '/profil');

function kerangka(app, ...isi) {
  app.replaceChildren(el('main', { class: 'layar layar-guru' },
    el('header', { class: 'bilah-atas' },
      kepalaAplikasi(),
      el('button', { class: 'tombol kedua', type: 'button', onclick: () => ke(tujuanKembali()) }, '← Kembali ke menu')),
    ...isi));
}

export function tampilModeGuru(app) {
  const galat = el('p', { class: 'galat', role: 'alert' });
  const papan = papanAngka({
    label: 'PIN guru',
    rahasia: true,
    maksDigit: 8,
    teksKirim: 'Buka',
    saatKirim: pin => {
      if (cekPin(pin)) {
        audio.main('benar');
        tampilDasbor(app);
      } else {
        audio.main('salah');
        galat.textContent = 'PIN salah. Coba lagi.';
        papan.kosongkan();
        papan.fokus();
      }
    },
  });
  kerangka(app,
    el('h1', { tabindex: '-1' }, 'Mode Guru'),
    el('section', { class: 'panel kunci-guru' },
      el('p', { class: 'label-besar' }, 'Masukkan PIN guru'),
      papan.elemen,
      galat,
      el('p', { class: 'catatan' }, CATATAN_PIN)));
  papan.fokus();
}

function tampilDasbor(app) {
  const daftar = profil.semua();

  const barisProfil = daftar.length
    ? daftar.map(p => el('div', { class: 'baris-profil-guru' },
      el('span', { class: 'avatar kecil', html: avatarSvg(p.avatar) }),
      el('div', { class: 'info-profil' },
        el('strong', {}, p.nama),
        el('span', {}, `Kelas ${p.kelas} · data ${Math.ceil(storage.ukuran(`p:${p.id}:`) / 1024)} KB`)),
      el('div', { class: 'baris-tombol' },
        el('button', {
          class: 'tombol kedua kecil', type: 'button',
          onclick: async () => {
            if (!(await konfirmasi(`Semua progres game dan statistik ${p.nama} akan dihapus. Profilnya tetap ada.`, { judul: 'Reset progres?', ya: 'Reset', bahaya: true }))) return;
            storage.hapusDataProfil(p.id);
            toast(`Progres ${p.nama} sudah direset.`, 'sukses');
            tampilDasbor(app);
          },
        }, 'Reset progres'),
        el('button', {
          class: 'tombol bahaya kecil', type: 'button',
          onclick: async () => {
            if (!(await konfirmasi(`Profil ${p.nama} beserta semua progresnya akan dihapus permanen.`, { judul: 'Hapus profil?', ya: 'Hapus', bahaya: true }))) return;
            profil.hapus(p.id);
            toast(`Profil ${p.nama} sudah dihapus.`, 'sukses');
            tampilDasbor(app);
          },
        }, 'Hapus profil'))))
    : [el('p', {}, 'Belum ada profil.')];

  kerangka(app,
    el('h1', { tabindex: '-1' }, 'Mode Guru'),
    masihPinBawaan() && el('p', { class: 'panel peringatan' },
      'PIN masih memakai bawaan (1234). Sebaiknya ganti PIN di bagian Keamanan.'),
    el('section', { class: 'panel' },
      el('h2', {}, 'Profil Anak'),
      barisProfil),
    el('section', { class: 'panel' },
      el('h2', {}, 'Statistik Belajar'),
      el('p', {}, 'Statistik per mapel dan topik akan muncul di sini setelah mesin soal dipasang.')),
    el('section', { class: 'panel' },
      el('h2', {}, 'Data'),
      el('p', {}, 'Ekspor menyimpan semua profil dan progres ke satu berkas JSON.'),
      el('div', { class: 'baris-tombol' },
        el('button', { class: 'tombol utama', type: 'button', onclick: eksporProgres }, 'Ekspor semua (JSON)'),
        el('button', {
          class: 'tombol bahaya', type: 'button',
          onclick: async () => {
            if (!(await konfirmasi('Semua profil, progres, dan pengaturan di perangkat ini akan dihapus. Ekspor dulu jika ingin menyimpan cadangan.', { judul: 'Hapus semua data?', ya: 'Lanjut', bahaya: true }))) return;
            if (!(await konfirmasi('Data yang dihapus tidak bisa dikembalikan. Benar-benar hapus semua?', { judul: 'Yakin sekali?', ya: 'Hapus semua', bahaya: true }))) return;
            storage.hapusSemua();
            storage.migrasi();
            toast('Semua data sudah dihapus.', 'sukses');
            ke('/profil');
          },
        }, 'Hapus semua data'))),
    el('section', { class: 'panel' },
      el('h2', {}, 'Keamanan'),
      el('button', { class: 'tombol kedua', type: 'button', onclick: () => dialogGantiPin(app) }, 'Ganti PIN'),
      el('p', { class: 'catatan' }, CATATAN_PIN)));
}

async function dialogGantiPin(app) {
  const masukan = id => el('input', { id, class: 'masukan', type: 'password', inputmode: 'numeric', maxlength: '8', autocomplete: 'off' });
  const pin1 = masukan('pin-baru');
  const pin2 = masukan('pin-ulang');
  const galat = el('p', { class: 'galat', role: 'alert' });
  const isi = el('div', { class: 'form-pin' },
    el('label', { for: 'pin-baru' }, 'PIN baru (4–8 angka)'), pin1,
    el('label', { for: 'pin-ulang' }, 'Ulangi PIN baru'), pin2,
    galat);
  const hasil = await modal({
    judul: 'Ganti PIN',
    isi,
    tombol: [{ teks: 'Batal', nilai: null }, { teks: 'Simpan PIN', nilai: true, kelas: 'utama' }],
    sebelumTutup: () => {
      if (pin1.value !== pin2.value) { galat.textContent = 'Kedua PIN belum sama.'; return false; }
      try { gantiPin(pin1.value); } catch (e) { galat.textContent = e.message; return false; }
      return true;
    },
  });
  if (hasil) {
    toast('PIN sudah diganti.', 'sukses');
    tampilDasbor(app);
  }
}
