// Catur — menu mode: lawan komputer (3 tingkat), 2 pemain, Belajar Bidak, Puzzle.
// Aturan di mesin.js, AI di ai.js (dijalankan di Web Worker), papan di papan.js.

import { el, pixelSvg, konfirmasi } from '../../core/ui.js';
import { NAMA_WARNA } from './mesin.js';
import { tampilPermainan, muatTersimpan, NAMA_TINGKAT } from './permainan.js';
import { tampilBelajar, PELAJARAN } from './belajar.js';
import { tampilPuzzle, JUMLAH_PUZZLE } from './puzzle.js';
import { bacaPengaturan, ubahPengaturan, bacaStatistik, daftarSelesai } from './simpanan.js';

const ikon = pixelSvg([
  '............',
  '......k.....',
  '.....kkk....',
  '....kkwkk...',
  '...kkkkkkk..',
  '..kkkkkkkk..',
  '..kk..kkkk..',
  '......kkkk..',
  '.....kkkkk..',
  '....kkkkkk..',
  '...kkkkkkkk.',
  '...kkkkkkkk.',
], { k: '#fbfbf8', w: '#1f2430' }, { latar: '#b58863', pad: 1 });

let s = null; // { ctx, wadah, aktif: { bersihkan, simpan } | null, pilihan: { tingkat, warna } }

function ganti(tampilan) {
  s.aktif?.bersihkan();
  s.aktif = tampilan;
  window.scrollTo(0, 0);
}

function tombolPilihan(daftar, nilai, saatPilih) {
  return daftar.map(([id, label]) => el('button', {
    type: 'button', class: 'tombol kedua', 'aria-pressed': String(id === nilai),
    onclick: () => saatPilih(id),
  }, label));
}

function tampilMenu() {
  ganti(null);
  const { ctx } = s;
  const tersimpan = muatTersimpan(ctx.store);
  const bisaLanjut = tersimpan && tersimpan.langkah.length > 0 && !tersimpan.game.status().selesai;
  const stat = bacaStatistik(ctx.store);
  const peng = bacaPengaturan(ctx.store);
  const nBelajar = daftarSelesai(ctx.store, 'belajar').length;
  const nPuzzle = daftarSelesai(ctx.store, 'puzzle').length;

  const cekLegal = el('input', { type: 'checkbox', id: 'menu-legal' });
  const cekTerancam = el('input', { type: 'checkbox', id: 'menu-terancam' });
  cekLegal.checked = peng.langkahLegal;
  cekTerancam.checked = peng.terancam;
  cekLegal.addEventListener('change', () => ubahPengaturan(ctx.store, { langkahLegal: cekLegal.checked }));
  cekTerancam.addEventListener('change', () => ubahPengaturan(ctx.store, { terancam: cekTerancam.checked }));

  const wadahTingkat = el('div', { class: 'baris-tombol', role: 'group', 'aria-label': 'Tingkat kesulitan' });
  const wadahWarna = el('div', { class: 'baris-tombol', role: 'group', 'aria-label': 'Warna bidakmu' });
  function gambarPilihan() {
    wadahTingkat.replaceChildren(...tombolPilihan(Object.entries(NAMA_TINGKAT), s.pilihan.tingkat, id => { s.pilihan.tingkat = id; gambarPilihan(); }));
    wadahWarna.replaceChildren(...tombolPilihan([['w', 'Putih'], ['b', 'Hitam'], ['acak', 'Acak']], s.pilihan.warna, id => { s.pilihan.warna = id; gambarPilihan(); }));
  }
  gambarPilihan();

  async function mulai(mode) {
    if (bisaLanjut && !(await konfirmasi('Permainan yang belum selesai akan diganti dengan permainan baru.', { judul: 'Mulai permainan baru?', ya: 'Mulai baru' }))) return;
    if (!s) return;
    const warna = s.pilihan.warna === 'acak' ? (Math.random() < 0.5 ? 'w' : 'b') : s.pilihan.warna;
    tampilMode({ mode, tingkat: s.pilihan.tingkat, warnaPemain: warna, lanjutkan: false });
  }

  const ket = tersimpan?.mode === 'komputer'
    ? `lawan komputer ${NAMA_TINGKAT[tersimpan.tingkat]}, kamu ${NAMA_WARNA[tersimpan.warnaPemain]}`
    : '2 pemain';

  s.wadah.replaceChildren(el('div', { class: 'catur-menu' },
    bisaLanjut && el('section', { class: 'panel catur-lanjut' },
      el('div', {}, el('h2', {}, 'Lanjutkan permainan'), el('p', {}, `Permainan ${ket}, sudah ${tersimpan.langkah.length} langkah.`)),
      el('button', { class: 'tombol utama', type: 'button', onclick: () => tampilMode({ lanjutkan: true }) }, 'Lanjutkan')),
    el('div', { class: 'catur-grid-menu' },
      el('section', { class: 'panel' },
        el('h2', {}, '🤖 Lawan Komputer'),
        el('p', { class: 'label-besar' }, 'Tingkat'), wadahTingkat,
        el('p', { class: 'label-besar' }, 'Warna bidakmu'), wadahWarna,
        el('p', {}, el('button', { class: 'tombol utama', type: 'button', onclick: () => mulai('komputer') }, 'Mulai'))),
      el('section', { class: 'panel' },
        el('h2', {}, '👥 2 Pemain'),
        el('p', {}, 'Main berdua bergantian di satu perangkat.'),
        el('button', { class: 'tombol utama', type: 'button', onclick: () => mulai('dua') }, 'Mulai')),
      el('section', { class: 'panel' },
        el('h2', {}, '📘 Belajar Bidak'),
        el('p', {}, `Kenali cara setiap bidak bergerak. Selesai ${nBelajar} dari ${PELAJARAN.length}.`),
        el('button', { class: 'tombol utama', type: 'button', onclick: () => ganti(tampilBelajar(s.wadah, ctx, { kembali: tampilMenu })) }, 'Belajar')),
      el('section', { class: 'panel' },
        el('h2', {}, '🧩 Puzzle Skakmat'),
        el('p', {}, `Cari skakmat dalam 1 langkah. Selesai ${nPuzzle} dari ${JUMLAH_PUZZLE}.`),
        el('button', { class: 'tombol utama', type: 'button', onclick: () => ganti(tampilPuzzle(s.wadah, ctx, { kembali: tampilMenu })) }, 'Main puzzle'))),
    el('section', { class: 'panel' },
      el('h2', {}, 'Pengaturan'),
      el('div', { class: 'catur-opsi' },
        el('label', { for: 'menu-legal' }, cekLegal, ' Tampilkan langkah yang boleh saat bidak dipilih'),
        el('label', { for: 'menu-terancam' }, cekTerancam, ' Tandai bidakku yang sedang diserang lawan'))),
    el('section', { class: 'panel' },
      el('h2', {}, 'Hasil permainanmu'),
      el('div', { class: 'tabel-gulir' }, el('table', { class: 'tabel' },
        el('thead', {}, el('tr', {}, ['Lawan', 'Menang', 'Kalah', 'Remis'].map(h => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, Object.entries(NAMA_TINGKAT).map(([id, nama]) => el('tr', {},
          el('td', {}, `Komputer ${nama}`), el('td', {}, stat.komputer[id].menang), el('td', {}, stat.komputer[id].kalah), el('td', {}, stat.komputer[id].remis)))))),
      el('p', { class: 'catatan' }, `Permainan 2 pemain yang selesai: ${stat.duaPemain.selesai}.`))));
}

function tampilMode(opsi) {
  ganti(tampilPermainan(s.wadah, s.ctx, { ...opsi, kembali: tampilMenu }));
}

export default {
  id: 'catur',
  nama: 'Catur',
  deskripsi: 'Lawan komputer (3 tingkat) atau main berdua. Ada Belajar Bidak dan puzzle skakmat.',
  ikon,
  kelasMin: 4,
  kelasMax: 6,
  mapel: 'logika',
  css: 'css/catur.css',

  mount(container, ctx) {
    s = { ctx, wadah: el('div', { class: 'catur-wadah' }), aktif: null, pilihan: { tingkat: 'mudah', warna: 'w' } };
    container.append(s.wadah);
    tampilMenu();
  },

  unmount() {
    s?.aktif?.bersihkan();
    s = null;
  },

  simpan() {
    s?.aktif?.simpan?.();
  },

  progres(store) {
    const stat = bacaStatistik(store);
    const nPuzzle = daftarSelesai(store, 'puzzle').length;
    const nBelajar = daftarSelesai(store, 'belajar').length;
    const menangSulit = stat.komputer.sedang.menang + stat.komputer.sulit.menang;
    const bintang = (nBelajar >= PELAJARAN.length ? 1 : 0) + (nPuzzle >= Math.ceil(JUMLAH_PUZZLE / 2) ? 1 : 0) + (menangSulit > 0 ? 1 : 0);
    const menang = Object.values(stat.komputer).reduce((n, t) => n + t.menang, 0);
    return { bintang, teks: `Puzzle ${nPuzzle}/${JUMLAH_PUZZLE} · Menang ${menang}×` };
  },
};
