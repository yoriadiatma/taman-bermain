// laci.js — komponen laci uang + nampan: ketuk uang di laci untuk menaruhnya di nampan,
// ketuk uang di nampan untuk mengembalikannya.

import { el } from '../../core/ui.js';
import { rupiah, svgUang, kunciPecahan } from './uang.js';

const label = p => `${p.jenis === 'koin' ? 'koin' : 'uang kertas'} ${rupiah(p.nilai)}`;

/**
 * pilihan: daftar pecahan yang tersedia tanpa batas (mode kasir & kenali uang), atau
 * stok: daftar pecahan satu per satu (isi dompet, terbatas).
 * Mengembalikan { elemen, jumlah(), lembar(), isi(), kosongkan() }.
 */
export function buatLaci({ pilihan = null, stok = null, judulLaci = 'Laci uang', judulNampan = 'Nampan', saatUbah = () => {} }) {
  const nampan = [];       // { p, idStok }
  const terpakai = new Set();
  const elLaci = el('div', { class: 'ps-laci', role: 'group', 'aria-label': judulLaci });
  const elNampan = el('div', { class: 'ps-nampan', role: 'group', 'aria-label': judulNampan, 'aria-live': 'polite' });
  const elJumlah = el('p', { class: 'ps-jumlah' });

  const tombolUang = (p, onclick, kelas = '') => el('button', {
    type: 'button', class: `ps-uang ${p.jenis} ${kelas}`, 'aria-label': label(p), title: rupiah(p.nilai), onclick,
    html: svgUang(p),
  });

  function gambar() {
    if (stok) {
      elLaci.replaceChildren(...stok.map((p, i) => {
        const b = tombolUang(p, () => { if (terpakai.has(i)) return; terpakai.add(i); nampan.push({ p, idStok: i }); gambar(); });
        b.disabled = terpakai.has(i);
        return b;
      }));
    } else {
      elLaci.replaceChildren(...pilihan.map(p => tombolUang(p, () => { nampan.push({ p }); gambar(); })));
    }
    elNampan.replaceChildren(...(nampan.length
      ? nampan.map((x, i) => tombolUang(x.p, () => {
        nampan.splice(i, 1);
        if (x.idStok !== undefined) terpakai.delete(x.idStok);
        gambar();
      }, 'di-nampan'))
      : [el('span', { class: 'catatan' }, 'Belum ada uang. Ketuk uang di atas untuk menaruhnya di sini.')]));
    const total = nampan.reduce((n, x) => n + x.p.nilai, 0);
    elJumlah.textContent = `Jumlah di ${judulNampan.toLowerCase()}: ${rupiah(total)} (${nampan.length} lembar/keping)`;
    saatUbah(total);
  }

  gambar();
  return {
    elemen: el('div', { class: 'ps-laci-wadah' },
      el('p', { class: 'ps-judul-kecil' }, judulLaci), elLaci,
      el('p', { class: 'ps-judul-kecil' }, `${judulNampan} (ketuk untuk mengambil kembali)`), elNampan, elJumlah),
    jumlah: () => nampan.reduce((n, x) => n + x.p.nilai, 0),
    lembar: () => nampan.length,
    isi: () => nampan.map(x => x.p),
    kosongkan() { nampan.length = 0; terpakai.clear(); gambar(); },
  };
}

export const gambarUang = (p, kecil = false) => el('span', { class: `ps-uang-tampil ${p.jenis}${kecil ? ' kecil' : ''}`, role: 'img', 'aria-label': label(p), html: svgUang(p) });
export { kunciPecahan };
