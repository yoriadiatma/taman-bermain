// belajar.js — mode "Belajar Bidak": satu bidak di papan kosong, kumpulkan semua bintang.
// Ketuk bidak untuk melihat kotak yang bisa dituju (disorot), lalu ketuk tujuan.

import { el, pujian } from '../../core/ui.js';
import { indeksKotak, langkahBebas, NAMA_BIDAK } from './mesin.js';
import { buatPapan } from './papan.js';
import { daftarSelesai, tandaiSelesai } from './simpanan.js';

// Nilai bidak memakai hitungan yang umum diajarkan: pion 1, kuda 3, gajah 3, benteng 5, menteri 9.
export const PELAJARAN = [
  {
    id: 'benteng', bidak: 'R', mulai: 'a1', bintang: ['a5', 'e5', 'e8'],
    teks: 'Benteng bergerak lurus: maju, mundur, ke kiri, atau ke kanan, sejauh kotaknya kosong.',
    nilai: 'Nilai benteng kira-kira 5 pion.',
  },
  {
    id: 'gajah', bidak: 'B', mulai: 'c1', bintang: ['e3', 'g5', 'd8'],
    teks: 'Gajah bergerak miring (diagonal) sejauh kotaknya kosong. Gajah selalu tetap di kotak yang warnanya sama.',
    nilai: 'Nilai gajah kira-kira 3 pion.',
  },
  {
    id: 'menteri', bidak: 'Q', mulai: 'd1', bintang: ['d6', 'h2', 'a2'],
    teks: 'Menteri adalah bidak terkuat. Menteri bisa bergerak lurus seperti benteng dan miring seperti gajah.',
    nilai: 'Nilai menteri kira-kira 9 pion.',
  },
  {
    id: 'raja', bidak: 'K', mulai: 'e1', bintang: ['e2', 'f3', 'g3'],
    teks: 'Raja bergerak satu kotak ke segala arah. Raja harus selalu dijaga: jika raja diskakmat, permainan berakhir.',
    nilai: 'Raja tidak punya nilai, karena raja tidak boleh dimakan.',
  },
  {
    id: 'kuda', bidak: 'N', mulai: 'b1', bintang: ['c3', 'e4', 'f6'], teman: { a2: 'P', b2: 'P', c2: 'P', d2: 'P' },
    teks: 'Kuda bergerak seperti huruf L: dua kotak lurus lalu satu kotak ke samping. Hanya kuda yang bisa melompati bidak lain.',
    nilai: 'Nilai kuda kira-kira 3 pion.',
  },
  {
    id: 'pion', bidak: 'P', mulai: 'e2', bintang: ['e4', 'e5', 'd6'], musuh: { d6: 'p' },
    teks: 'Pion maju lurus satu kotak. Pada langkah pertamanya, pion boleh maju dua kotak. Pion memakan bidak lawan dengan cara miring satu kotak ke depan.',
    nilai: 'Nilai pion adalah 1. Bidak lain dibandingkan dengan pion.',
  },
  {
    id: 'promosi', bidak: 'P', mulai: 'a6', bintang: ['a7', 'a8'],
    teks: 'Jika pion sampai di baris paling ujung, pion berubah (promosi) menjadi bidak lain, biasanya menteri.',
    nilai: 'Promosi bisa mengubah pion bernilai 1 menjadi menteri bernilai 9!',
  },
];

/** Tampilkan daftar pelajaran. Mengembalikan { bersihkan }. */
export function tampilBelajar(wadah, ctx, { kembali }) {
  function daftar() {
    const selesai = daftarSelesai(ctx.store, 'belajar');
    wadah.replaceChildren(el('div', { class: 'catur-menu' },
      el('div', { class: 'baris-tombol' }, el('button', { class: 'tombol kedua', type: 'button', onclick: kembali }, '← Menu catur')),
      el('h2', {}, 'Belajar Bidak'),
      el('p', {}, 'Pilih bidak, lalu kumpulkan semua bintang dengan menggerakkan bidak itu.'),
      el('div', { class: 'catur-grid-pilihan' }, PELAJARAN.map((p, i) => el('button', {
        class: 'tombol kedua catur-kartu-pilihan', type: 'button', onclick: () => buka(i),
      }, el('span', { class: 'judul' }, `${i + 1}. ${p.id === 'promosi' ? 'Promosi Pion' : NAMA_BIDAK[p.bidak.toLowerCase()]}`),
      el('span', { class: 'catatan' }, selesai.includes(p.id) ? '✓ selesai' : 'belum'))))));
  }

  function buka(i) {
    const pel = PELAJARAN[i];
    const isi = new Array(64).fill(null);
    for (const [k, b] of Object.entries({ ...pel.teman, ...pel.musuh })) isi[indeksKotak(k)] = b;
    let posisi = indeksKotak(pel.mulai);
    isi[posisi] = pel.bidak;
    const bintang = new Set(pel.bintang.map(indeksKotak));
    let pilih = null;
    let langkah = 0;

    const e = {
      pesan: el('p', { class: 'catur-pesan', 'aria-live': 'polite' }),
      sisa: el('p', { class: 'catur-status' }),
      selesai: el('div', { class: 'catur-akhir', hidden: true }),
    };
    const papan = buatPapan({ saatKlik: klik, label: `Papan latihan ${pel.id}` });

    function gambar() {
      const tujuan = pilih !== null ? new Map(langkahBebas(isi, pilih).map(k => [k, !!isi[k]])) : new Map();
      papan.gambar({ papan: isi, pilih, tujuan, bintang, kunci: bintang.size === 0 });
      e.sisa.textContent = bintang.size ? `Bintang tersisa: ${bintang.size} · Langkah: ${langkah}` : `Semua bintang terkumpul dalam ${langkah} langkah!`;
    }

    function klik(sq) {
      if (!bintang.size) return;
      if (sq === posisi) {
        pilih = pilih === null ? sq : null;
        e.pesan.textContent = pilih !== null ? 'Titik hijau menunjukkan kotak yang bisa dituju.' : '';
      } else if (pilih !== null && langkahBebas(isi, pilih).includes(sq)) {
        isi[sq] = isi[posisi];
        isi[posisi] = null;
        posisi = sq;
        langkah++;
        pilih = null;
        e.pesan.textContent = '';
        if (bintang.delete(sq)) ctx.audio.main('benar');
        if (pel.id === 'promosi' && (sq >> 3) === 0) {
          isi[sq] = 'Q';
          e.pesan.textContent = 'Promosi! Pion berubah menjadi menteri.';
        }
        if (!bintang.size) selesai();
      } else if (pilih !== null) {
        e.pesan.textContent = `${NAMA_BIDAK[isi[posisi].toLowerCase()]} tidak bisa ke sana. Pilih titik hijau.`;
        pilih = null;
      } else {
        e.pesan.textContent = 'Ketuk bidak putih dulu.';
      }
      gambar();
    }

    function selesai() {
      tandaiSelesai(ctx.store, 'belajar', pel.id);
      ctx.audio.main('levelup');
      e.pesan.textContent = `${e.pesan.textContent} ${pujian()}`.trim();
      e.selesai.hidden = false;
      const berikut = PELAJARAN[i + 1];
      e.selesai.replaceChildren(
        berikut && el('button', { class: 'tombol utama', type: 'button', onclick: () => buka(i + 1) }, 'Pelajaran berikutnya'),
        el('button', { class: 'tombol kedua', type: 'button', onclick: () => buka(i) }, 'Ulangi'),
        el('button', { class: 'tombol kedua', type: 'button', onclick: daftar }, 'Daftar pelajaran'));
    }

    wadah.replaceChildren(el('div', { class: 'catur' },
      el('div', { class: 'catur-kiri' }, e.sisa, papan.elemen, e.pesan, e.selesai),
      el('div', { class: 'catur-kanan' },
        el('div', { class: 'baris-tombol' },
          el('button', { class: 'tombol kedua', type: 'button', onclick: daftar }, '← Daftar pelajaran'),
          el('button', { class: 'tombol kedua', type: 'button', onclick: () => buka(i) }, 'Ulangi')),
        el('h2', {}, pel.id === 'promosi' ? 'Promosi Pion' : NAMA_BIDAK[pel.bidak.toLowerCase()]),
        el('p', { class: 'catur-teks-pelajaran' }, pel.teks),
        el('p', {}, el('strong', {}, pel.nilai)),
        el('p', { class: 'catatan' }, 'Ketuk bidak putih untuk melihat kotak yang bisa dituju, lalu ketuk kotak tujuan. Kumpulkan semua bintang ★.'))));
    gambar();
  }

  daftar();
  return { bersihkan() {} };
}
