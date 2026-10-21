// teacher.js — Mode Guru: dikunci PIN sederhana.
//
// PIN hanya pengaman ringan agar anak tidak sengaja menghapus data. Kode aplikasi
// ini publik dan data ada di localStorage, jadi siapa pun yang paham bisa
// melewatinya. Hash di bawah bukan hash kriptografis; dipilih karena jalan di
// semua kondisi (termasuk saat dibuka lewat http://<IP-laptop> dari tablet).

import { el, avatarSvg, kepalaAplikasi, papanAngka, konfirmasi, modal, toast, unduh, tanggalHariIni } from './ui.js';
import * as storage from './storage.js';
import * as profil from './profile.js';
import * as audio from './audio.js';
import * as quiz from './quiz.js';
import { tanya } from './quiz-ui.js';
import { MAPEL, MAPEL_SOAL } from './mapel.js';
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
      el('p', { class: 'catatan' }, 'Soal dihitung benar jika dijawab benar pada percobaan pertama. Topik di bawah 60% ditandai perlu latihan (⚠).'),
      daftar.length ? daftar.map(bagianStatistik) : el('p', {}, 'Belum ada profil.'),
      el('div', { class: 'baris-tombol' },
        el('button', { class: 'tombol kedua', type: 'button', onclick: eksporCsv }, 'Ekspor statistik (CSV)'),
        el('button', { class: 'tombol kedua', type: 'button', onclick: eksporStatJson }, 'Ekspor statistik (JSON)')),
      el('p', { class: 'catatan' }, 'Berkas CSV memakai pemisah titik koma (;) agar langsung terbaca di Excel berbahasa Indonesia.')),
    bagianBankSoal(app),
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

// ---------- Statistik belajar ----------

const persen = (b, s) => (b + s ? Math.round((b / (b + s)) * 100) : 0);
const namaMapel = id => MAPEL[id]?.nama ?? id;

function tabel(kepala, baris) {
  return el('div', { class: 'tabel-gulir' }, el('table', { class: 'tabel' },
    el('thead', {}, el('tr', {}, kepala.map(k => el('th', { scope: 'col' }, k)))),
    el('tbody', {}, baris)));
}

/** Semua topik yang pernah dikerjakan: [{ mapel, topik, benar, salah }], yang paling lemah di atas. */
function daftarTopik(st) {
  const hasil = [];
  for (const [mapel, m] of Object.entries(st.mapel)) {
    for (const [topik, t] of Object.entries(m.topik)) hasil.push({ mapel, topik, benar: t.benar, salah: t.salah });
  }
  return hasil.sort((a, b) => persen(a.benar, a.salah) - persen(b.benar, b.salah) || (b.benar + b.salah) - (a.benar + a.salah));
}

function bagianStatistik(p) {
  const st = quiz.statistik(p.id);
  const mapel = Object.entries(st.mapel);
  const benar = mapel.reduce((n, [, m]) => n + m.benar, 0);
  const salah = mapel.reduce((n, [, m]) => n + m.salah, 0);
  if (!mapel.length) {
    return el('details', { class: 'stat-profil' }, el('summary', {}, `${p.nama} (kelas ${p.kelas}) — belum mengerjakan soal`));
  }
  const sulit = Object.entries(st.soal)
    .filter(([, v]) => v.s > 0)
    .sort((a, b) => b[1].s - a[1].s)
    .slice(0, 5)
    .map(([id, v]) => ({ soal: quiz.ambilSoal(id), ...v }))
    .filter(x => x.soal);

  return el('details', { class: 'stat-profil' },
    el('summary', {}, `${p.nama} (kelas ${p.kelas}) — ${benar + salah} soal, ${persen(benar, salah)}% benar`),
    el('h3', {}, 'Per mata pelajaran'),
    tabel(['Mapel', 'Benar', 'Salah', '% benar'], mapel.map(([id, m]) => el('tr', {},
      el('td', {}, namaMapel(id)), el('td', {}, m.benar), el('td', {}, m.salah), el('td', {}, `${persen(m.benar, m.salah)}%`)))),
    el('h3', {}, 'Per topik (yang paling perlu latihan di atas)'),
    tabel(['Mapel', 'Topik', 'Benar', 'Salah', '% benar'], daftarTopik(st).map(t => {
      const pr = persen(t.benar, t.salah);
      return el('tr', { class: pr < 60 ? 'perlu-latihan' : null },
        el('td', {}, namaMapel(t.mapel)), el('td', {}, t.topik), el('td', {}, t.benar), el('td', {}, t.salah),
        el('td', {}, `${pr}%`, pr < 60 ? ' ⚠' : ''));
    })),
    sulit.length > 0 && el('h3', {}, 'Soal yang paling sering salah'),
    sulit.length > 0 && el('ol', { class: 'soal-sulit' }, sulit.map(x => el('li', {},
      x.soal.pertanyaan, ' ', el('span', { class: 'catatan' }, `(salah ${x.s}×, benar ${x.b}×)`)))),
    st.terakhir && el('p', { class: 'catatan' }, `Terakhir mengerjakan soal: ${new Date(st.terakhir).toLocaleString('id-ID')}`));
}

// Cegah sel CSV dibaca sebagai rumus oleh Excel.
function selCsv(v) {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function eksporCsv() {
  const baris = [['Profil', 'Kelas', 'Mapel', 'Topik', 'Benar', 'Salah', 'Persen benar']];
  for (const p of profil.semua()) {
    for (const t of daftarTopik(quiz.statistik(p.id))) {
      baris.push([p.nama, p.kelas, namaMapel(t.mapel), t.topik, t.benar, t.salah, persen(t.benar, t.salah)]);
    }
  }
  if (baris.length === 1) {
    toast('Belum ada statistik untuk diekspor.', 'peringatan');
    return;
  }
  const isi = '﻿' + baris.map(b => b.map(selCsv).join(';')).join('\r\n');
  unduh(`statistik-belajar-${tanggalHariIni()}.csv`, isi, 'text/csv;charset=utf-8');
}

function eksporStatJson() {
  const data = profil.semua().map(p => ({ profil: p.nama, kelas: p.kelas, statistik: quiz.statistik(p.id) }));
  unduh(`statistik-belajar-${tanggalHariIni()}.json`,
    JSON.stringify({ app: 'tgb', jenis: 'statistik', diekspor: new Date().toISOString(), data }, null, 1));
}

// ---------- Bank soal ----------

const KELAS_BANK = [4, 5, 6];

function bagianBankSoal(app) {
  const semua = quiz.semuaSoal();
  const hitung = (m, k) => semua.filter(s => s.mapel === m && s.kelas === k).length;
  const perluCek = semua.filter(s => s.cek).length;
  const masalah = quiz.masalahBank();
  return el('section', { class: 'panel' },
    el('h2', {}, 'Bank Soal'),
    tabel(['Mapel', ...KELAS_BANK.map(k => `Kelas ${k}`), 'Perlu dicek'], MAPEL_SOAL.map(m => el('tr', {},
      el('td', {}, namaMapel(m)),
      KELAS_BANK.map(k => el('td', {}, hitung(m, k))),
      el('td', {}, semua.filter(s => s.mapel === m && s.cek).length)))),
    el('p', {}, `Total ${semua.length} soal. ${perluCek} soal ditandai perlu dicek kebenarannya oleh guru.`),
    masalah.length > 0 && el('p', { class: 'galat' }, `${masalah.length} soal tidak dipakai karena formatnya salah. Lihat daftarnya di halaman bank soal.`),
    el('button', { class: 'tombol utama', type: 'button', onclick: () => tampilBankSoal(app) }, 'Lihat & coba soal'),
    el('p', { class: 'catatan' }, 'Soal ada di folder data/soal/. Cara menambah soal dijelaskan di README.'));
}

function tampilBankSoal(app) {
  const filter = { mapel: '', kelas: '', hanyaCek: false };
  const wadah = el('div', { class: 'daftar-bank' });
  const info = el('p', { 'aria-live': 'polite' });

  const pilihMapel = el('select', { id: 'f-mapel', class: 'masukan' },
    el('option', { value: '' }, 'Semua mapel'),
    MAPEL_SOAL.map(id => el('option', { value: id }, namaMapel(id))));
  const pilihKelas = el('select', { id: 'f-kelas', class: 'masukan' },
    el('option', { value: '' }, 'Semua kelas'),
    KELAS_BANK.map(k => el('option', { value: String(k) }, `Kelas ${k}`)));
  const centangCek = el('input', { id: 'f-cek', type: 'checkbox' });
  pilihMapel.addEventListener('change', () => { filter.mapel = pilihMapel.value; gambar(); });
  pilihKelas.addEventListener('change', () => { filter.kelas = pilihKelas.value; gambar(); });
  centangCek.addEventListener('change', () => { filter.hanyaCek = centangCek.checked; gambar(); });

  function kartu(s) {
    const jawabanLain = s.tipe === 'teks' ? [].concat(s.jawaban).slice(1) : [];
    return el('article', { class: 'soal-pratinjau' },
      el('div', { class: 'baris-chip' },
        el('span', { class: 'chip', style: { background: MAPEL[s.mapel].warna } }, namaMapel(s.mapel)),
        el('span', { class: 'chip chip-abu' }, `Kelas ${s.kelas}`),
        el('span', { class: 'chip chip-abu' }, s.topik),
        el('span', { class: 'chip chip-abu' }, s.tipe),
        s.cek && el('span', { class: 'chip chip-kelas' }, 'Perlu dicek'),
        el('code', { class: 'id-soal' }, s.id)),
      el('p', { class: 'pratinjau-tanya' }, s.pertanyaan),
      s.tipe === 'pilihan' && el('ul', { class: 'pratinjau-pilihan' },
        s.pilihan.map(x => el('li', { class: x === s.jawaban ? 'benar' : null }, x))),
      el('p', {}, el('strong', {}, 'Jawaban: '), quiz.teksJawaban(s),
        jawabanLain.length ? ` (juga diterima: ${jawabanLain.join(', ')})` : ''),
      el('p', {}, el('strong', {}, 'Petunjuk: '), s.petunjuk || '—'),
      el('p', {}, el('strong', {}, 'Penjelasan: '), s.penjelasan || '—'),
      el('button', {
        class: 'tombol kedua kecil', type: 'button',
        onclick: () => tanya({ soal: s, kelas: s.kelas, catatStatistik: false, judul: 'Mencoba soal (tidak dicatat)' }),
      }, 'Coba soal ini'));
  }

  function gambar() {
    const hasil = quiz.semuaSoal().filter(s =>
      (!filter.mapel || s.mapel === filter.mapel) &&
      (!filter.kelas || s.kelas === Number(filter.kelas)) &&
      (!filter.hanyaCek || s.cek));
    info.textContent = `Menampilkan ${hasil.length} soal.`;
    wadah.replaceChildren(...hasil.map(kartu));
  }

  const masalah = quiz.masalahBank();
  kerangka(app,
    el('h1', { tabindex: '-1' }, 'Bank Soal'),
    el('p', {}, el('button', { class: 'tombol kedua', type: 'button', onclick: () => tampilDasbor(app) }, '← Kembali ke Mode Guru')),
    masalah.length > 0 && el('section', { class: 'panel peringatan' },
      el('p', {}, 'Soal berikut tidak dipakai karena formatnya salah:'),
      el('ul', {}, masalah.map(m => el('li', {}, `${m.id}: ${m.masalah.join(', ')}`)))),
    el('section', { class: 'panel filter-bank' },
      el('label', { for: 'f-mapel' }, 'Mapel'), pilihMapel,
      el('label', { for: 'f-kelas' }, 'Kelas'), pilihKelas,
      el('label', { class: 'centang' }, centangCek, ' Hanya yang perlu dicek')),
    info,
    wadah);
  gambar();
}
