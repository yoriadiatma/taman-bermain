// puzzle.js — puzzle "skakmat dalam 1 langkah".

import { el, isiUlang, pujian } from '../../core/ui.js';
import { Catur, NAMA_BIDAK, NAMA_WARNA, namaKotak, tipe, warnaBidak, indeksKotak } from './mesin.js';
import { buatPapan, pilihPromosi, tutupDialogPromosi } from './papan.js';
import { daftarSelesai, tandaiSelesai, bacaPengaturan } from './simpanan.js';
import { PUZZLE } from '../../../data/catur-puzzle.js';

export const JUMLAH_PUZZLE = PUZZLE.length;

/** Tampilkan daftar puzzle. Mengembalikan { bersihkan }. */
export function tampilPuzzle(wadah, ctx, { kembali }) {
  let aktif = true;
  let tundaan = null;

  function daftar() {
    clearTimeout(tundaan);
    const selesai = daftarSelesai(ctx.store, 'puzzle');
    wadah.replaceChildren(el('div', { class: 'catur-menu' },
      el('div', { class: 'baris-tombol' }, el('button', { class: 'tombol kedua', type: 'button', onclick: kembali }, '← Menu catur')),
      el('h2', {}, 'Puzzle: Skakmat dalam 1 Langkah'),
      el('p', {}, `Selesai ${selesai.filter(id => PUZZLE.some(p => p.id === id)).length} dari ${PUZZLE.length} puzzle.`),
      el('div', { class: 'catur-grid-pilihan' }, PUZZLE.map((p, i) => el('button', {
        class: `tombol kedua catur-kartu-pilihan${selesai.includes(p.id) ? ' selesai' : ''}`, type: 'button', onclick: () => buka(i),
      }, el('span', { class: 'judul' }, `${selesai.includes(p.id) ? '✓ ' : ''}Puzzle ${i + 1}`),
      el('span', { class: 'catatan' }, p.tema))))));
  }

  function buka(i) {
    clearTimeout(tundaan);
    const pz = PUZZLE[i];
    const game = new Catur(pz.fen);
    const warna = game.giliran;
    let pilih = null;
    let tujuan = [];
    let salah = 0;
    let beres = false;
    let petunjukKotak = null;

    const e = {
      status: el('p', { class: `catur-status giliran-${warna}` }, `${NAMA_WARNA[warna]} jalan. Cari langkah skakmat!`),
      pesan: el('p', { class: 'catur-pesan', 'aria-live': 'polite' }),
      bantuan: el('div', { class: 'baris-tombol' }),
      selesai: el('div', { class: 'catur-akhir', hidden: true }),
    };
    const papan = buatPapan({ saatKlik: klik, label: `Papan puzzle ${i + 1}` });
    papan.setPutar(warna === 'b');

    function gambar() {
      const peng = bacaPengaturan(ctx.store);
      const terakhir = game.riwayat[game.riwayat.length - 1];
      const st = game.status();
      papan.gambar({
        papan: game.papan,
        pilih,
        tujuan: peng.langkahLegal ? new Map(tujuan.map(m => [m.ke, !!m.makan])) : new Map(),
        terakhir,
        diskak: st.skak ? game.raja[game.giliran] : -1,
        petunjuk: petunjukKotak,
        kunci: beres || game.riwayat.length > 0,
      });
    }

    function tampilBantuan() {
      isiUlang(e.bantuan,
        salah >= 1 && el('button', {
          class: 'tombol kedua', type: 'button',
          onclick: () => { e.pesan.textContent = `Petunjuk: ${pz.petunjuk}`; },
        }, '💡 Petunjuk'),
        salah >= 2 && el('button', {
          class: 'tombol kedua', type: 'button',
          onclick: () => {
            const d = indeksKotak(pz.solusi.slice(0, 2));
            petunjukKotak = { dari: d, ke: indeksKotak(pz.solusi.slice(2, 4)) };
            e.pesan.textContent = `Jawaban: gerakkan ${NAMA_BIDAK[tipe(game.papan[d])]} dari ${pz.solusi.slice(0, 2)} ke ${pz.solusi.slice(2, 4)}.`;
            gambar();
          },
        }, 'Lihat jawaban'));
    }

    async function jalankan(pilihan) {
      let m = pilihan[0];
      if (pilihan.length > 1) {
        const pr = await pilihPromosi(warnaBidak(m.bidak));
        if (!aktif || !pr) return;
        m = pilihan.find(x => x.promosi === pr);
      }
      game.jalan(m);
      pilih = null;
      tujuan = [];
      const st = game.status();
      if (st.alasan === 'skakmat') {
        beres = true;
        tandaiSelesai(ctx.store, 'puzzle', pz.id);
        ctx.audio.main('levelup');
        e.status.textContent = 'Skakmat!';
        e.status.className = 'catur-status selesai';
        e.pesan.textContent = `${pujian()} ${pz.tema}.`;
        e.bantuan.replaceChildren();
        e.selesai.hidden = false;
        isiUlang(e.selesai,
          PUZZLE[i + 1] && el('button', { class: 'tombol utama', type: 'button', onclick: () => buka(i + 1) }, 'Puzzle berikutnya'),
          el('button', { class: 'tombol kedua', type: 'button', onclick: daftar }, 'Daftar puzzle'));
      } else {
        salah++;
        ctx.audio.main('salah');
        e.pesan.textContent = st.skak
          ? 'Itu skak, tetapi belum skakmat: raja lawan masih bisa diselamatkan. Coba lagi!'
          : st.alasan === 'pat'
            ? 'Hati-hati, itu pat (remis): lawan tidak bisa bergerak tetapi tidak diskak. Coba lagi!'
            : 'Itu belum memberi skak. Cari langkah yang menyerang raja lawan.';
        tampilBantuan();
        // Kembalikan posisi setelah sebentar agar anak bisa melihat langkahnya.
        tundaan = setTimeout(() => {
          if (!aktif) return;
          game.batal();
          gambar();
        }, 1200);
      }
      gambar();
    }

    function klik(sq) {
      if (beres || game.riwayat.length) return;
      const p = game.papan[sq];
      const cocok = tujuan.filter(m => m.ke === sq);
      if (pilih !== null && cocok.length) {
        jalankan(cocok);
        return;
      }
      if (p && warnaBidak(p) === warna && pilih !== sq) {
        pilih = sq;
        tujuan = game.langkahLegal(sq);
      } else {
        pilih = null;
        tujuan = [];
        if (p && warnaBidak(p) !== warna) e.pesan.textContent = `Di puzzle ini kamu memainkan bidak ${NAMA_WARNA[warna].toLowerCase()}.`;
      }
      gambar();
    }

    wadah.replaceChildren(el('div', { class: 'catur' },
      el('div', { class: 'catur-kiri' }, e.status, papan.elemen, e.pesan, e.bantuan, e.selesai),
      el('div', { class: 'catur-kanan' },
        el('div', { class: 'baris-tombol' },
          el('button', { class: 'tombol kedua', type: 'button', onclick: daftar }, '← Daftar puzzle'),
          el('button', { class: 'tombol kedua', type: 'button', onclick: () => buka(i) }, 'Ulangi')),
        el('h2', {}, `Puzzle ${i + 1} dari ${PUZZLE.length}`),
        el('p', {}, el('strong', {}, pz.tema)),
        el('p', {}, `Skakmat artinya raja lawan diskak dan tidak bisa lolos: tidak bisa lari, tidak bisa ditutup, dan penyerangnya tidak bisa dimakan.`),
        el('p', { class: 'catatan' }, `Kotak ${namaKotak(game.raja[warna === 'w' ? 'b' : 'w'])} adalah tempat raja lawan.`))));
    gambar();
  }

  daftar();
  return {
    bersihkan() {
      aktif = false;
      clearTimeout(tundaan);
      tutupDialogPromosi();
    },
  };
}
