// papan.js — komponen papan catur yang dipakai semua mode (permainan, belajar, puzzle).
// Papan hanya menggambar; aturan ditentukan oleh pemanggil.

import { el, jebakFokus } from '../../core/ui.js';
import { NAMA_BIDAK, NAMA_WARNA, namaKotak, tipe, warnaBidak } from './mesin.js';
import { svgBidak } from './bidak.js';

export const namaBidak = p => `${NAMA_BIDAK[tipe(p)]} ${NAMA_WARNA[warnaBidak(p)].toLowerCase()}`;

/**
 * Buat papan. saatKlik(sq) dipanggil saat kotak diketuk.
 * Mengembalikan { elemen, gambar(opsi), setPutar(bool) }.
 */
export function buatPapan({ saatKlik, label = 'Papan catur' }) {
  let putar = false;
  let fokus = 52; // e2
  let opsiTerakhir = null;
  const visual = sq => (putar ? 63 - sq : sq);

  const kotak = Array.from({ length: 64 }, (_, sq) => el('button', {
    type: 'button', 'data-sunyi': true,
    onclick: () => { fokus = sq; saatKlik(sq); },
  }));

  const elemen = el('div', {
    class: 'catur-papan', role: 'group', 'aria-label': label,
    onkeydown: e => {
      const arah = { ArrowUp: -8, ArrowDown: 8, ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (arah === undefined) return;
      e.preventDefault();
      const v = visual(fokus);
      const kolomBaru = (v & 7) + (Math.abs(arah) === 1 ? arah : 0);
      const vBaru = v + arah;
      if (vBaru < 0 || vBaru > 63 || kolomBaru < 0 || kolomBaru > 7) return;
      fokus = visual(vBaru);
      if (opsiTerakhir) gambar(opsiTerakhir);
      kotak[fokus].focus();
    },
  });

  function susun() {
    elemen.replaceChildren(...Array.from({ length: 64 }, (_, v) => kotak[putar ? 63 - v : v]));
  }

  /**
   * opsi: { papan (array 64), pilih, tujuan (Map kotak -> true jika makan), terakhir {dari, ke},
   *         diskak (kotak raja), terancam (Set), petunjuk {dari, ke}, bintang (Set), kunci (bool) }
   */
  function gambar(opsi) {
    opsiTerakhir = opsi;
    const { papan, pilih = null, tujuan = new Map(), terakhir = null, diskak = -1, terancam = new Set(), petunjuk = null, bintang = new Set(), kunci = false } = opsi;
    for (let sq = 0; sq < 64; sq++) {
      const b = kotak[sq];
      const p = papan[sq];
      const v = visual(sq);
      const kelas = ['ck', ((sq >> 3) + (sq & 7)) % 2 === 0 ? 'terang' : 'gelap'];
      if (sq === pilih) kelas.push('dipilih');
      if (terakhir && (sq === terakhir.dari || sq === terakhir.ke)) kelas.push('terakhir');
      if (tujuan.has(sq)) kelas.push(tujuan.get(sq) ? 'tujuan-makan' : 'tujuan');
      if (sq === diskak) kelas.push('diskak');
      if (terancam.has(sq)) kelas.push('terancam');
      if (petunjuk && (sq === petunjuk.dari || sq === petunjuk.ke)) kelas.push('petunjuk');
      b.className = kelas.join(' ');
      b.tabIndex = sq === fokus ? 0 : -1;
      let teks = `${namaKotak(sq)}, ${p ? namaBidak(p) : 'kosong'}`;
      if (sq === pilih) teks += ', dipilih';
      if (tujuan.has(sq)) teks += ', bisa dituju';
      if (terancam.has(sq)) teks += ', sedang diserang';
      if (bintang.has(sq)) teks += ', ada bintang';
      b.setAttribute('aria-label', teks);
      const koordinat = ((v & 7) === 0 ? `<span class="ck-angka">${namaKotak(sq)[1]}</span>` : '') +
        ((v >> 3) === 7 ? `<span class="ck-huruf">${namaKotak(sq)[0]}</span>` : '');
      b.innerHTML = (bintang.has(sq) ? '<span class="ck-bintang" aria-hidden="true">★</span>' : '') + (p ? svgBidak(p) : '') + koordinat;
    }
    elemen.classList.toggle('terkunci', kunci);
  }

  susun();
  return {
    elemen,
    gambar,
    setPutar(nilai) {
      putar = !!nilai;
      susun();
      if (opsiTerakhir) gambar(opsiTerakhir);
    },
    get putar() { return putar; },
  };
}

// ---------- Dialog promosi ----------

let tutupDialog = null;

/** Tutup dialog promosi yang masih terbuka (dipanggil saat keluar dari mode). */
export function tutupDialogPromosi() {
  tutupDialog?.(null);
}

/** Tanya bidak promosi. Promise berisi 'q' | 'r' | 'b' | 'n', atau null jika dibatalkan. */
export function pilihPromosi(warna) {
  return new Promise(selesai => {
    const sebelumnya = document.activeElement;
    const tutup = v => {
      lepas();
      latar.remove();
      tutupDialog = null;
      sebelumnya?.focus?.({ preventScroll: true });
      selesai(v);
    };
    const kotak = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'judul-promosi' },
      el('h2', { id: 'judul-promosi' }, 'Pion sampai di ujung papan! Pilih bidak penggantinya.'),
      el('div', { class: 'catur-promosi' }, ['q', 'r', 'b', 'n'].map(t => el('button', {
        type: 'button', class: 'tombol kedua', onclick: () => tutup(t),
      }, el('span', { class: 'catur-promosi-ikon', html: svgBidak(warna === 'w' ? t.toUpperCase() : t) }), NAMA_BIDAK[t]))),
      el('div', { class: 'modal-tombol' }, el('button', { type: 'button', class: 'tombol kedua', onclick: () => tutup(null) }, 'Batal')));
    const latar = el('div', { class: 'modal-latar' }, kotak);
    const lepas = jebakFokus(kotak, () => tutup(null));
    tutupDialog = tutup;
    document.body.append(latar);
    kotak.querySelector('button').focus();
  });
}
