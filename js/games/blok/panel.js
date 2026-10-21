// panel.js — tampilan DOM di atas canvas: hotbar, tas, menu Buat, Misi, Buku Barang, Bantuan.
// Panel hanya menggambar; aksi dijalankan lewat fungsi di objek `g` (dari index.js).

import { el } from '../../core/ui.js';
import { BARANG, namaBarang } from './barang.js';
import { HOTBAR, UKURAN_TAS } from './inventori.js';
import { RESEP, NAMA_STASIUN, maksKali } from './resep.js';
import { urlIkon } from './tekstur.js';

const ikon = (g, id) => el('img', { class: 'blok-ikon', src: urlIkon(id, g.atlas), alt: '', draggable: 'false' });

/** Isi satu kotak tas/hotbar. */
function isiKotak(g, k) {
  if (!k) return [];
  return [ikon(g, k.id), k.n > 1 && el('span', { class: 'blok-jumlah' }, k.n)];
}

const labelKotak = (i, k) => `Kotak ${i + 1}: ${k ? `${namaBarang(k.id)}, ${k.n}` : 'kosong'}`;

export function gambarHotbar(g) {
  const { inv, pilihan } = g;
  g.el.hotbar.replaceChildren(...Array.from({ length: HOTBAR }, (_, i) => {
    const k = inv.kotak[i];
    return el('button', {
      type: 'button',
      class: `blok-kotak${i === pilihan ? ' dipilih' : ''}`,
      'aria-label': labelKotak(i, k),
      'aria-pressed': String(i === pilihan),
      title: k ? namaBarang(k.id) : '',
      onclick: () => g.pilihKotak(i),
    }, el('span', { class: 'blok-nomor' }, i + 1), isiKotak(g, k));
  }));
}

function kepalaPanel(g, judul) {
  return el('div', { class: 'blok-panel-kepala' },
    el('h2', {}, judul),
    el('button', { class: 'tombol kedua kecil', type: 'button', onclick: g.tutupPanel, 'aria-label': 'Tutup panel' }, '✕'));
}

// ---------- Tas ----------

export function panelTas(g) {
  let dipilih = null;
  const info = el('p', { class: 'catatan', 'aria-live': 'polite' }, 'Ketuk satu kotak, lalu ketuk kotak lain untuk menukar isinya. Kotak 1–9 adalah hotbar.');
  const grid = el('div', { class: 'blok-grid-tas' });
  function gambar() {
    grid.replaceChildren(...Array.from({ length: UKURAN_TAS }, (_, i) => {
      const k = g.inv.kotak[i];
      return el('button', {
        type: 'button',
        class: `blok-kotak${i < HOTBAR ? ' hotbar' : ''}${i === dipilih ? ' dipilih' : ''}`,
        'aria-label': labelKotak(i, k),
        title: k ? namaBarang(k.id) : '',
        onclick: () => {
          if (dipilih === null) {
            if (!k) return;
            dipilih = i;
            info.textContent = `${namaBarang(k.id)} dipilih. Ketuk kotak tujuan.`;
          } else {
            g.inv.tukar(dipilih, i);
            dipilih = null;
            info.textContent = 'Ditukar.';
            g.perbaruiTas();
          }
          gambar();
        },
      }, i < HOTBAR && el('span', { class: 'blok-nomor' }, i + 1), isiKotak(g, k));
    }));
  }
  gambar();
  return el('div', {}, kepalaPanel(g, '🎒 Tas'), info, grid);
}

// ---------- Buat (crafting) ----------

export function panelBuat(g) {
  const daftar = el('div', { class: 'blok-daftar-resep' });
  function gambar() {
    daftar.replaceChildren(...RESEP.map(r => {
      const dekat = !r.stasiun || g.dekatStasiun(r.stasiun);
      const maks = maksKali(r, g.inv);
      let kali = Math.min(1, maks);
      const angka = el('span', { class: 'blok-kali', 'aria-live': 'polite' }, kali);
      const tombolBuat = el('button', {
        class: 'tombol utama kecil', type: 'button', disabled: !dekat || maks < 1,
        onclick: async () => { await g.buat(r, kali); gambar(); },
      }, 'Buat');
      const ubah = d => {
        kali = Math.max(1, Math.min(maks, kali + d));
        angka.textContent = kali;
      };
      return el('div', { class: `blok-resep${dekat && maks > 0 ? '' : ' tidak-bisa'}` },
        el('div', { class: 'blok-resep-hasil' }, ikon(g, r.hasil), el('strong', {}, `${r.jumlah} ${namaBarang(r.hasil)}`)),
        el('div', { class: 'blok-resep-bahan' },
          r.bahan.map(([id, n]) => {
            const punya = g.inv.jumlah(id);
            return el('span', { class: `blok-bahan${punya >= n ? '' : ' kurang'}`, title: namaBarang(id) },
              ikon(g, id), `${n} ${namaBarang(id)} (punya ${punya})`);
          }),
          r.stasiun && el('span', { class: `blok-stasiun${dekat ? '' : ' kurang'}` },
            dekat ? `✓ dekat ${NAMA_STASIUN[r.stasiun]}` : `Harus di dekat ${NAMA_STASIUN[r.stasiun]}`)),
        el('div', { class: 'blok-resep-aksi' },
          el('button', { class: 'tombol kedua kecil', type: 'button', 'aria-label': 'Kurangi', disabled: maks < 2, onclick: () => ubah(-1) }, '−'),
          angka,
          el('button', { class: 'tombol kedua kecil', type: 'button', 'aria-label': 'Tambah', disabled: maks < 2, onclick: () => ubah(1) }, '+'),
          tombolBuat));
    }));
  }
  gambar();
  return el('div', {}, kepalaPanel(g, '🔨 Buat Barang'),
    el('p', { class: 'catatan' }, 'Sebelum barang jadi, jawab soal hitungannya dulu. Pilih berapa kali membuat dengan tombol − dan +.'),
    daftar);
}

// ---------- Misi ----------

export function panelMisi(g) {
  const daftar = el('div', { class: 'blok-daftar-misi' });
  function gambar() {
    daftar.replaceChildren(...g.misi.map(m => {
      const status = g.statusMisi(m);
      let aksi = null;
      if (status === 'selesai') aksi = el('span', { class: 'blok-misi-selesai' }, '✓ Selesai');
      else if (m.jenis === 'bangun') {
        aksi = g.dataMisi[m.id] === 'dijawab'
          ? el('button', { class: 'tombol utama kecil', type: 'button', onclick: async () => { await g.periksaBangunan(m); gambar(); } }, 'Periksa bangunan')
          : el('button', { class: 'tombol kedua kecil', type: 'button', onclick: async () => { await g.mulaiBangun(m); gambar(); } }, 'Mulai');
      } else if (status === 'siap') {
        aksi = el('button', { class: 'tombol utama kecil', type: 'button', onclick: async () => { await g.selesaikanMisi(m); gambar(); } }, 'Selesaikan');
      } else {
        aksi = el('span', { class: 'catatan' }, 'Belum');
      }
      return el('div', { class: `blok-misi ${status}` },
        el('div', {}, el('strong', {}, m.judul), el('p', {}, m.teks), el('span', { class: 'catatan' }, `Hadiah: ${m.xp} XP`)),
        aksi);
    }));
  }
  gambar();
  const selesai = g.misi.filter(m => g.statusMisi(m) === 'selesai').length;
  return el('div', {}, kepalaPanel(g, `📜 Misi (${selesai}/${g.misi.length})`), daftar);
}

// ---------- Buku Barang (ejaan) ----------

export function panelBuku(g) {
  const daftar = el('div', { class: 'blok-grid-buku' });
  function gambar() {
    const dikenal = Object.keys(BARANG).filter(id => g.catatan.pernahPunya.includes(id));
    if (!dikenal.length) {
      daftar.replaceChildren(el('p', {}, 'Belum ada barang. Tambang atau buat barang dulu!'));
      return;
    }
    daftar.replaceChildren(...dikenal.map(id => {
      const sudah = g.catatan.dieja.includes(id);
      return el('div', { class: `blok-buku${sudah ? ' sudah' : ''}` },
        ikon(g, id),
        el('span', {}, sudah ? namaBarang(id) : '???'),
        sudah
          ? el('span', { class: 'blok-misi-selesai' }, '✓')
          : el('button', { class: 'tombol kedua kecil', type: 'button', onclick: async () => { await g.eja(id); gambar(); } }, 'Eja'));
    }));
  }
  gambar();
  return el('div', {}, kepalaPanel(g, '📖 Buku Barang'),
    el('p', { class: 'catatan' }, 'Eja nama setiap barang yang kamu temukan untuk mendapat XP.'),
    daftar);
}

// ---------- Bantuan ----------

export function panelBantuan(g) {
  return el('div', {}, kepalaPanel(g, 'Cara bermain'),
    el('ul', {},
      el('li', {}, 'Jalan: ← → atau A dan D. Lompat: ↑, W, atau Spasi. Di air, tahan lompat untuk berenang.'),
      el('li', {}, 'Menambang: tahan klik (atau tahan sentuhan) pada blok di dekatmu.'),
      el('li', {}, 'Menaruh blok: pilih barang di hotbar, lalu klik kanan. Di tablet, ganti mode ke 🧱 Taruh lalu ketuk.'),
      el('li', {}, 'Angka 1–9 memilih kotak hotbar. Tombol E membuka tas.'),
      el('li', {}, 'Batu butuh beliung. Mulailah dengan menebang pohon, lalu buat papan, tongkat, meja kerja, dan beliung kayu.'),
      el('li', {}, 'Peti terkunci ada di dalam gua. Jawab soalnya untuk membuka!')),
    el('div', { class: 'baris-tombol' },
      el('button', { class: 'tombol kedua kecil', type: 'button', onclick: g.gantiKarakter }, 'Ganti karakter'),
      el('button', { class: 'tombol bahaya kecil', type: 'button', onclick: g.duniaBaru }, 'Buat dunia baru')),
    el('p', { class: 'catatan' }, 'Dunia baru menghapus bangunan dan isi tas, tetapi XP dan misi yang selesai tetap ada.'));
}
